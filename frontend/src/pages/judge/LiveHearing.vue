<script setup>
import { ref } from 'vue';
import { Bookmark, Mic, Pause, Save, Square } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { judgeNav } from '@/data/navigation';
import { hearings } from '@/data/mock';
import { useUi } from '@/stores/ui';

const ui = useUi();
const paused = ref(false);
const recording = ref(true);
const microphone = ref(true);

const saveTranscript = () => {
  window.localStorage.setItem('smartcourt-live-transcript', JSON.stringify(hearings));
  ui.pushToast({
    type: 'success',
    title: 'Stenogramma saqlandi',
    text: 'Demo stenogramma lokal saqlandi.'
  });
};

const addBookmark = () => {
  ui.pushToast({
    type: 'success',
    title: 'Bookmark qo‘shildi',
    text: 'Joriy vaqt belgilab qo‘yildi.'
  });
};
</script>

<template>
  <RoleShell title="Jonli sud majlisi" subtitle="Whisper streaming + diarization" :nav="judgeNav">
    <section class="live">
      <main class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Ish #2026-001234</p>
            <h1>Real-time stenogramma</h1>
          </div>
          <div class="toolbar">
            <BaseButton variant="secondary" :icon="Pause" @click="paused = !paused">{{
              paused ? 'Davom ettirish' : 'Pauza'
            }}</BaseButton>
            <BaseButton variant="secondary" :icon="Square" @click="recording = false"
              >To‘xtatish</BaseButton
            >
            <BaseButton :icon="Save" @click="saveTranscript">Saqlash</BaseButton>
          </div>
        </div>
        <div class="waveform" :class="{ paused: paused || !recording }">
          <span v-for="bar in 80" :key="bar" :style="{ height: `${18 + ((bar * 17) % 70)}px` }" />
        </div>
        <article v-for="line in hearings" :key="line.time" class="transcript">
          <time>{{ line.time }}</time>
          <strong>{{ line.speaker }}</strong>
          <p>{{ line.text }}</p>
        </article>
      </main>
      <aside class="panel insights">
        <p class="eyebrow">AI Live Insights</p>
        <h2>Yangi faktlar</h2>
        <p><span class="status-dot" />50 000 000 so‘m miqdori aytildi.</p>
        <p><span class="status-dot" />167-modda eslatildi.</p>
        <p><span class="status-dot" />Hissiy zo‘riqish yuqori.</p>
        <div class="toolbar">
          <BaseButton variant="secondary" :icon="Mic" @click="microphone = !microphone">{{
            microphone ? 'Mikrofon' : 'Mikrofon o‘chiq'
          }}</BaseButton>
          <BaseButton variant="secondary" :icon="Bookmark" @click="addBookmark"
            >Bookmark</BaseButton
          >
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

.waveform {
  display: flex;
  height: 120px;
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
}

.waveform.paused span {
  opacity: 0.12;
}

.transcript {
  display: grid;
  grid-template-columns: 64px 110px minmax(0, 1fr);
  gap: 14px;
  border-bottom: 1px solid var(--border-subtle);
  padding: 15px 0;
}

.transcript p {
  margin: 0;
}

@media (max-width: 980px) {
  .live {
    grid-template-columns: 1fr;
  }
}
</style>
