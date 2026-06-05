<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { Bookmark, Mic, MicOff, Save, Square, Wifi, WifiOff } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { judgeNav } from '@/data/navigation';
import { useUi } from '@/stores/ui';
import { wsBase } from '@/lib/api';

const ui = useUi();

const CASE_ID = 2026001234;
const CLIP_MS = 5000; // har 5 soniyada audio bo'lagini yuborish
const SPEAKERS = ['Sudya', 'Da\'vogar', 'Javobgar', 'Advokat', 'Guvoh', 'Prokuror'];

const connected = ref(false);
const recording = ref(false);
const statusText = ref('Ulanmagan');
const currentSpeaker = ref('Sudya');
const segments = ref([]); // { ts, speaker, text, insight }
const insights = ref([]); // { text }
const transcriptEl = ref(null);

let ws = null;
let mediaStream = null;
let recorder = null;
let clipTimer = null;

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
const connectWs = () =>
  new Promise((resolve, reject) => {
    const url = `${wsBase}/ws/hearing/${CASE_ID}`;
    ws = new WebSocket(url);

    ws.onopen = () => {
      connected.value = true;
      statusText.value = 'Ulandi';
      // joriy gapiruvchini yuborish
      ws.send(JSON.stringify({ type: 'speaker', speaker: currentSpeaker.value }));
      resolve();
    };

    ws.onmessage = (ev) => {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (data.type === 'segment') {
        segments.value.push({
          ts: data.ts,
          speaker: data.speaker,
          text: data.text,
          insight: data.insight
        });
        if (data.insight) insights.value.unshift({ text: data.insight });
        scrollToBottom();
      } else if (data.type === 'status') {
        statusText.value = data.message;
      } else if (data.type === 'error') {
        ui.pushToast({ type: 'error', title: 'STT xatosi', text: data.message });
      }
    };

    ws.onerror = (e) => {
      console.error('[hearing] WS error:', e);
      statusText.value = 'Ulanish xatosi';
      reject(new Error('WebSocket xatosi'));
    };

    ws.onclose = (e) => {
      console.warn(`[hearing] WS closed: code=${e.code}, reason='${e.reason}', wasClean=${e.wasClean}`);
      connected.value = false;
      statusText.value = 'Uzildi';
    };
  });

// ── Mikrofon + MediaRecorder ────────────────────────────────
const pickMime = () => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
  for (const m of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
};

const startRecording = async () => {
  if (recording.value) return;
  // Eski sessiya segmentlari/insightlarini tozalaymiz (qotib qolgan axlat ketadi).
  segments.value = [];
  insights.value = [];
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true, // fon shovqinini ('ʃʃʃ') olib tashlaydi
        autoGainControl: true, // ovozni avtomatik kuchaytiradi
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
  if (clipTimer) {
    window.clearTimeout(clipTimer);
    clipTimer = null;
  }
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

const saveTranscript = () => {
  if (!segments.value.length) {
    ui.pushToast({ type: 'error', title: 'Stenogramma bo\'sh', text: 'Avval majlisni yozib oling.' });
    return;
  }
  const text = segments.value
    .map((s) => `[${s.ts}s] ${s.speaker}: ${s.text}`)
    .join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stenogramma-${CASE_ID}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  ui.pushToast({ type: 'success', title: 'Saqlandi', text: 'Stenogramma .txt yuklab olindi.' });
};

const addBookmark = () => {
  ui.pushToast({ type: 'success', title: 'Bookmark', text: `${elapsedLabel.value} belgilab qo\'yildi.` });
};

onBeforeUnmount(stopRecording);
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

        <!-- Waveform -->
        <div class="waveform" :class="{ paused: !recording }">
          <span v-for="bar in 80" :key="bar" :style="{ height: `${18 + ((bar * 17) % 70)}px` }" />
        </div>

        <!-- Live transcript -->
        <div ref="transcriptEl" class="transcript-box">
          <p v-if="!segments.length" class="empty">
            "Majlisni boshlash" tugmasini bosing. Mikrofon yozib oladi, har 5 soniyada
            audio bo'lagi backend'ga yuboriladi va Whisper modeli uni o'zbekcha matnga
            aylantirib, real vaqtda bu yerga chiqaradi.
          </p>
          <article v-for="(line, i) in segments" :key="i" class="transcript">
            <time>{{ line.ts }}s</time>
            <strong>{{ line.speaker }}</strong>
            <p>{{ line.text }}</p>
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
  background: var(--gray-900);
  opacity: 0.36;
  animation: pulse 1.1s ease-in-out infinite;
}
.waveform.paused span {
  opacity: 0.12;
  animation: none;
}
@keyframes pulse {
  50% { transform: scaleY(0.4); }
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
