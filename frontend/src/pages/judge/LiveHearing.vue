<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { Bookmark, Mic, MicOff, Save, Square, Wifi, WifiOff } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { judgeNav } from '@/data/navigation';
import { useUi } from '@/stores/ui';
import { wsBase, getToken } from '@/lib/api';

const ui = useUi();

const CASE_ID = 2026001234;
const CLIP_MS = 5000; // har 5 soniyada audio bo'lagini yuborish
const SPEAKERS = ['Sudya', 'Da\'vogar', 'Javobgar', 'Advokat', 'Guvoh', 'Prokuror'];
const LANGUAGES = [
  { code: 'uz', label: 'O‘zbek' },
  { code: 'ru', label: 'Rus' },
  { code: 'auto', label: 'Avto' }
];
const MAX_RENDERED_SEGMENTS = 300; // DOM da ko'rsatiladigan maksimum (xotira uchun)
const WAVE_BARS = 64;
const RECONNECT_MAX = 5;
const RECONNECT_BASE_MS = 800;

const connected = ref(false);
const recording = ref(false);
const processing = ref(false); // backend currently transcribing a clip
const statusText = ref('Ulanmagan');
const currentSpeaker = ref('Sudya');
const language = ref('uz');
const segments = ref([]); // { ts, idx, speaker, text, insight, silent? }
const insights = ref([]); // { text }
const waveBars = ref(new Array(WAVE_BARS).fill(6));
const transcriptEl = ref(null);

let ws = null;
let mediaStream = null;
let recorder = null;
let clipTimer = null;

// Reconnect state
let reconnectAttempts = 0;
let reconnectTimer = null;
let intentionalClose = false; // true when WE close (stop/unmount) — no reconnect

// Full transcript kept outside the reactive (rendered) list so a long
// hearing doesn't blow up the DOM but the .txt export stays complete.
let fullTranscript = []; // { ts, speaker, text }

// Web Audio (real waveform)
let audioCtx = null;
let analyser = null;
let waveRaf = null;

const elapsedLabel = computed(() => {
  const last = segments.value.at(-1);
  if (!last) return '00:00';
  const total = Math.round(last.ts);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
});

const scrollToBottom = async () => {
  await nextTick();
  if (transcriptEl.value) transcriptEl.value.scrollTop = transcriptEl.value.scrollHeight;
};

// ── WebSocket ───────────────────────────────────────────────
const buildWsUrl = () => {
  const token = getToken();
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  params.set('lang', language.value);
  return `${wsBase}/ws/hearing/${CASE_ID}?${params.toString()}`;
};

const handleMessage = (ev) => {
  let data;
  try {
    data = JSON.parse(ev.data);
  } catch {
    return;
  }
  if (data.type === 'segment') {
    processing.value = false;
    fullTranscript.push({ ts: data.ts, speaker: data.speaker, text: data.text });
    segments.value.push({
      ts: data.ts,
      idx: data.idx,
      speaker: data.speaker,
      text: data.text,
      insight: null
    });
    // DOM ni cheklash — eng eski segmentlarni rendered ro'yxatdan olib
    // tashlaymiz (to'liq nusxa fullTranscript da saqlanib qoladi).
    if (segments.value.length > MAX_RENDERED_SEGMENTS) {
      segments.value.splice(0, segments.value.length - MAX_RENDERED_SEGMENTS);
    }
    scrollToBottom();
  } else if (data.type === 'insight') {
    const seg = segments.value.find((s) => s.idx === data.segment_idx);
    if (seg) seg.insight = data.text;
    insights.value.unshift({ text: data.text });
    if (insights.value.length > 50) insights.value.splice(50);
  } else if (data.type === 'silent') {
    processing.value = false;
    segments.value.push({
      ts: data.ts,
      speaker: '',
      text: '(jim — nutq aniqlanmadi)',
      insight: null,
      silent: true
    });
    if (segments.value.length > MAX_RENDERED_SEGMENTS) {
      segments.value.splice(0, segments.value.length - MAX_RENDERED_SEGMENTS);
    }
    scrollToBottom();
  } else if (data.type === 'processing') {
    processing.value = true;
  } else if (data.type === 'status') {
    statusText.value = data.message;
  } else if (data.type === 'error') {
    processing.value = false;
    ui.pushToast({ type: 'error', title: 'STT xatosi', text: data.message });
  }
};

const connectWs = () =>
  new Promise((resolve, reject) => {
    intentionalClose = false;
    ws = new WebSocket(buildWsUrl());

    ws.onopen = () => {
      connected.value = true;
      reconnectAttempts = 0;
      statusText.value = 'Ulandi';
      ws.send(JSON.stringify({ type: 'speaker', speaker: currentSpeaker.value }));
      ws.send(JSON.stringify({ type: 'lang', lang: language.value }));
      resolve();
    };

    ws.onmessage = handleMessage;

    ws.onerror = (e) => {
      console.error('[hearing] WS error:', e);
      statusText.value = 'Ulanish xatosi';
      reject(new Error('WebSocket xatosi'));
    };

    ws.onclose = (e) => {
      console.warn(`[hearing] WS closed: code=${e.code}, wasClean=${e.wasClean}`);
      connected.value = false;
      processing.value = false;

      // Auth rad etildi (4401) — qayta urinmaymiz.
      if (e.code === 4401) {
        statusText.value = 'Avtorizatsiya rad etildi';
        ui.pushToast({
          type: 'error',
          title: 'Ruxsat yo\'q',
          text: 'Jonli majlis uchun sudya sifatida tizimga kiring.'
        });
        stopRecording({ keepWsOpen: false });
        return;
      }

      // Biz ataylab yopgan bo'lsak — reconnect qilmaymiz.
      if (intentionalClose || !recording.value) {
        statusText.value = 'To\'xtatildi';
        return;
      }

      // Kutilmagan uzilish — qayta ulanishga urinamiz (backoff bilan).
      attemptReconnect();
    };
  });

const attemptReconnect = () => {
  if (reconnectAttempts >= RECONNECT_MAX) {
    statusText.value = 'Aloqa uzildi';
    ui.pushToast({
      type: 'error',
      title: 'Qayta ulanib bo\'lmadi',
      text: `${RECONNECT_MAX} marta urinildi. Yozib olish to'xtatildi.`
    });
    stopRecording({ keepWsOpen: false });
    return;
  }
  reconnectAttempts += 1;
  const delay = RECONNECT_BASE_MS * 2 ** (reconnectAttempts - 1); // 0.8s,1.6s,3.2s...
  statusText.value = `Qayta ulanmoqda (${reconnectAttempts}/${RECONNECT_MAX})...`;
  reconnectTimer = window.setTimeout(async () => {
    try {
      await connectWs();
      ui.pushToast({ type: 'success', title: 'Qayta ulandi', text: 'Yozib olish davom etmoqda.' });
    } catch {
      attemptReconnect(); // yana urinamiz
    }
  }, delay);
};

// ── Mikrofon + MediaRecorder ────────────────────────────────
const pickMime = () => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
  for (const m of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
};

// ── Real waveform (Web Audio AnalyserNode) ──────────────────
const startWaveform = () => {
  if (!mediaStream) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(mediaStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256; // → 128 frequency bins
    source.connect(analyser);
    const bins = analyser.frequencyBinCount;
    const buf = new Uint8Array(bins);
    const step = Math.floor(bins / WAVE_BARS) || 1;

    const tick = () => {
      analyser.getByteFrequencyData(buf);
      const bars = new Array(WAVE_BARS);
      for (let i = 0; i < WAVE_BARS; i += 1) {
        const v = buf[i * step] || 0; // 0..255
        bars[i] = 6 + Math.round((v / 255) * 64); // 6..70 px
      }
      waveBars.value = bars;
      waveRaf = requestAnimationFrame(tick);
    };
    tick();
  } catch (e) {
    console.warn('[hearing] waveform unavailable:', e);
  }
};

const stopWaveform = () => {
  if (waveRaf) {
    cancelAnimationFrame(waveRaf);
    waveRaf = null;
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
  analyser = null;
  waveBars.value = new Array(WAVE_BARS).fill(6);
};

const startRecording = async () => {
  if (recording.value) return;
  // Eski sessiya segmentlari/insightlarini tozalaymiz (qotib qolgan axlat ketadi).
  segments.value = [];
  insights.value = [];
  fullTranscript = [];
  reconnectAttempts = 0;
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        // Chrome'ning agressiv noiseSuppression past SNR'da nutqni ham
        // o'chirib yuboradi va Whisperga jim audio yetib boradi. Whisper
        // o'zining VAD'i bilan filtrlaymiz.
        noiseSuppression: false,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 48000
      }
    });
  } catch {
    ui.pushToast({
      type: 'error',
      title: 'Mikrofon ruxsati yo\'q',
      text: 'Brauzerda mikrofon ruxsatini bering.'
    });
    return;
  }

  try {
    await connectWs();
  } catch {
    ui.pushToast({
      type: 'error',
      title: 'Backend bilan ulanmadi',
      text: 'WebSocket ochilmadi. Backend ishlab turganini tekshiring.'
    });
    mediaStream.getTracks().forEach((t) => t.stop());
    return;
  }

  startWaveform();

  const mimeType = pickMime();

  // Har CLIP_MS da yangi recorder ochib, bitta to'liq (self-contained) bo'lak yuboramiz.
  const recordClip = () => {
    if (!mediaStream) return;
    const chunks = [];
    recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) => {
      console.error('[hearing] MediaRecorder error:', e.error);
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
      const buf = await blob.arrayBuffer();
      console.log(
        `[hearing] clip ready: ${buf.byteLength} bytes, ws=${ws ? ws.readyState : 'null'} (1=OPEN)`
      );
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (buf.byteLength < 200) {
        console.warn('[hearing] clip too small, skipped');
        return;
      }
      ws.send(buf);
      console.log('[hearing] clip SENT ->', buf.byteLength, 'bytes');
    };
    recorder.start();
    console.log(`[hearing] recording ${CLIP_MS}ms clip... mime=${mimeType || 'default'}`);
    clipTimer = window.setTimeout(() => {
      if (recorder && recorder.state === 'recording') recorder.stop();
      if (recording.value) recordClip(); // keyingi bo'lak
    }, CLIP_MS);
  };

  recording.value = true;
  recordClip();
  ui.pushToast({
    type: 'success',
    title: 'Majlis boshlandi',
    text: 'Mikrofon yozilmoqda — har 5 soniyada matnga aylantiriladi.'
  });
};

const stopRecording = ({ keepWsOpen = true } = {}) => {
  recording.value = false;
  intentionalClose = true; // reconnect'ni o'chiramiz
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (clipTimer) {
    window.clearTimeout(clipTimer);
    clipTimer = null;
  }
  stopWaveform();
  // Oxirgi bo'lakni yuborish uchun recorder'ni to'xtatamiz (onstop -> ws.send).
  if (recorder && recorder.state === 'recording') recorder.stop();
  recorder = null;
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }

  if (keepWsOpen) {
    // WS'ni darhol yopmaymiz — backend oxirgi klip(lar)ni hali transkripsiya
    // qilyapti. Natija(lar) kelishi uchun grace-period beramiz, keyin yopamiz.
    statusText.value = 'To\'xtatildi — oxirgi natijalar kutilmoqda...';
    window.setTimeout(() => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      statusText.value = 'To\'xtatildi';
    }, 12000);
  } else if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
    statusText.value = 'To\'xtatildi';
  }
};

const setSpeaker = (sp) => {
  currentSpeaker.value = sp;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'speaker', speaker: sp }));
  }
};

const setLanguage = (code) => {
  language.value = code;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'lang', lang: code }));
  }
};

const saveTranscript = () => {
  // To'liq nusxadan foydalanamiz (fullTranscript) — rendered segments
  // cheklangan bo'lishi mumkin, lekin stenogramma butun bo'lishi shart.
  if (!fullTranscript.length) {
    ui.pushToast({ type: 'error', title: 'Stenogramma bo\'sh', text: 'Avval majlisni yozib oling.' });
    return;
  }
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');
  const header = [
    'SUD MAJLISI STENOGRAMMASI',
    '────────────────────────────────────',
    `Ish raqami: #${CASE_ID}`,
    `Sana: ${dateStr}`,
    `Til: ${language.value}`,
    `Segmentlar soni: ${fullTranscript.length}`,
    '',
    'STENOGRAMMA',
    '────────────────────────────────────'
  ].join('\n');
  const body = fullTranscript
    .map((s) => `[${String(s.ts).padStart(5, ' ')}s] ${s.speaker}: ${s.text}`)
    .join('\n');
  const text = `${header}\n${body}\n`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stenogramma-${CASE_ID}-${now.toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  ui.pushToast({ type: 'success', title: 'Saqlandi', text: 'Stenogramma .txt yuklab olindi.' });
};

const addBookmark = () => {
  ui.pushToast({ type: 'success', title: 'Bookmark', text: `${elapsedLabel.value} belgilab qo\'yildi.` });
};

onBeforeUnmount(() => stopRecording({ keepWsOpen: false }));
</script>

<template>
  <RoleShell title="Jonli sud majlisi" subtitle="Whisper streaming STT" :nav="judgeNav">
    <section class="live">
      <main class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">
              Ish #2026-001234 ·
              <span :class="['conn', connected ? 'on' : 'off']">
                <component :is="connected ? Wifi : WifiOff" :size="13" />
                {{ statusText }}
              </span>
            </p>
            <h1>Real-time stenogramma</h1>
          </div>
          <div class="toolbar">
            <BaseButton v-if="!recording" :icon="Mic" @click="startRecording">Majlisni boshlash</BaseButton>
            <BaseButton v-else variant="secondary" :icon="Square" @click="stopRecording">To'xtatish</BaseButton>
            <BaseButton variant="secondary" :icon="Save" @click="saveTranscript">Saqlash</BaseButton>
          </div>
        </div>

        <!-- Speaker selector -->
        <div class="speakers">
          <span class="lbl">Gapiruvchi:</span>
          <button
            v-for="sp in SPEAKERS"
            :key="sp"
            :class="['chip', { active: currentSpeaker === sp }]"
            @click="setSpeaker(sp)"
          >
            {{ sp }}
          </button>
        </div>

        <!-- Language selector -->
        <div class="speakers">
          <span class="lbl">Til:</span>
          <button
            v-for="l in LANGUAGES"
            :key="l.code"
            :class="['chip', { active: language === l.code }]"
            @click="setLanguage(l.code)"
          >
            {{ l.label }}
          </button>
        </div>

        <!-- Waveform (real-time mic amplitude) -->
        <div class="waveform" :class="{ paused: !recording }">
          <span
            v-for="(h, i) in waveBars"
            :key="i"
            :style="{ height: `${h}px` }"
          />
        </div>

        <!-- Live transcript -->
        <div ref="transcriptEl" class="transcript-box">
          <p v-if="!segments.length && !processing" class="empty">
            "Majlisni boshlash" tugmasini bosing. Mikrofon yozib oladi, har 5 soniyada
            audio bo'lagi backend'ga yuboriladi va Whisper modeli uni o'zbekcha matnga
            aylantirib, real vaqtda bu yerga chiqaradi.
          </p>
          <article
            v-for="(line, i) in segments"
            :key="i"
            :class="['transcript', { silent: line.silent }]"
          >
            <time v-if="line.ts !== null && line.ts !== undefined">{{ line.ts }}s</time>
            <time v-else>—</time>
            <strong v-if="line.speaker">{{ line.speaker }}</strong>
            <p>
              {{ line.text }}
              <span v-if="line.insight" class="seg-insight">{{ line.insight }}</span>
            </p>
          </article>
          <article v-if="processing" class="transcript processing">
            <time>…</time>
            <strong>AI</strong>
            <p>
              <span class="dot" /><span class="dot" /><span class="dot" />
              Transkripsiya qilinmoqda…
            </p>
          </article>
        </div>
      </main>

      <aside class="panel insights">
        <p class="eyebrow">AI Live Insights</p>
        <h2>Aniqlangan faktlar</h2>
        <p v-if="!insights.length" class="muted">
          Gaplardan muhim fakt, raqam yoki qonun moddasi aniqlansa, shu yerda ko'rinadi.
        </p>
        <p v-for="(ins, i) in insights" :key="i" class="insight">
          <span class="status-dot" />{{ ins.text }}
        </p>
        <div class="toolbar">
          <BaseButton
            variant="secondary"
            :icon="recording ? Mic : MicOff"
            @click="recording ? stopRecording() : startRecording()"
          >
            {{ recording ? 'Yozilmoqda' : 'Mikrofon o\'chiq' }}
          </BaseButton>
          <BaseButton variant="secondary" :icon="Bookmark" @click="addBookmark">Bookmark</BaseButton>
        </div>
      </aside>
    </section>
  </RoleShell>
</template>

<style scoped>
.live {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 58px);
}

.conn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
}
.conn.on { color: var(--stat-green, #16a34a); }
.conn.off { color: var(--gray-500); }

.speakers {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
}
.speakers .lbl {
  color: var(--gray-500);
  font-size: 13px;
  font-weight: 600;
}
.chip {
  border: 1px solid var(--border-default);
  background: var(--color-white);
  color: var(--gray-700);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover { border-color: var(--gray-900); }
.chip.active {
  background: var(--gray-900);
  color: var(--color-white);
  border-color: var(--gray-900);
}

.waveform {
  display: flex;
  height: 100px;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  padding: 14px;
}
.waveform span {
  width: 5px;
  border-radius: 999px;
  background: var(--stat-blue, #0a66f2);
  opacity: 0.7;
  transition: height 0.08s linear;
}
.waveform.paused span {
  opacity: 0.15;
  background: var(--gray-900);
}

.transcript-box {
  margin-top: 18px;
  max-height: 440px;
  overflow-y: auto;
}
.empty {
  color: var(--gray-500);
  font-size: 14px;
  line-height: 1.6;
}
.transcript {
  display: grid;
  grid-template-columns: 56px 96px minmax(0, 1fr);
  gap: 14px;
  border-bottom: 1px solid var(--border-subtle);
  padding: 13px 0;
}
.transcript time { color: var(--gray-500); font-size: 12px; }
.transcript strong { font-size: 13px; }
.transcript p { margin: 0; line-height: 1.6; }

.transcript.silent {
  opacity: 0.55;
  font-style: italic;
}
.transcript.silent p { color: var(--gray-500); font-size: 13px; }

.transcript.processing p { color: var(--gray-500); display: flex; gap: 6px; align-items: center; }
.transcript.processing .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--stat-blue, #0a66f2);
  animation: bounce 1.1s ease-in-out infinite;
}
.transcript.processing .dot:nth-child(2) { animation-delay: 0.15s; }
.transcript.processing .dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
}

.seg-insight {
  display: block;
  margin-top: 6px;
  padding: 6px 10px;
  border-left: 2px solid var(--stat-blue, #0a66f2);
  background: var(--gray-50, #f7f8fa);
  border-radius: 0 6px 6px 0;
  font-size: 12.5px;
  color: var(--gray-700);
}

.insight {
  display: flex;
  gap: 8px;
  margin: 10px 0;
  line-height: 1.5;
}
.muted { color: var(--gray-500); font-size: 13px; line-height: 1.6; }

@media (max-width: 980px) {
  .live { grid-template-columns: 1fr; }
}
</style>
