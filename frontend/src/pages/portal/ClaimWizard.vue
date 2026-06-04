<script setup>
import { computed, ref } from 'vue';
import {
  Building2,
  Calendar,
  Check,
  FileText,
  Home,
  Landmark,
  Plus,
  Scale,
  Trash2,
  Upload
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { portalNav } from '@/data/navigation';
import { useUi } from '@/stores/ui';

const ui = useUi();
const step = ref(1);
const selectedType = ref('Mehnat nizosi');
const partyType = ref('Jismoniy shaxs');
const uploadedFiles = ref([
  {
    id: 1,
    name: 'shartnoma.pdf',
    size: '2.4 MB',
    progress: 100,
    result: 'AI: 3 ta huquqiy fakt aniqlandi.'
  }
]);

const disputeTypes = [
  { title: 'Fuqarolik nizosi', icon: Home, text: 'Shaxsiy va mulkiy munosabatlar.' },
  { title: 'Mehnat nizosi', icon: Building2, text: 'Ish haqi, kompensatsiya, shartnoma.' },
  { title: 'Iqtisodiy nizosi', icon: Landmark, text: 'Yuridik shaxslar o‘rtasidagi kelishuvlar.' },
  { title: 'Oilaviy nizosi', icon: Scale, text: 'Ajrim, aliment, mol-mulk bo‘linishi.' }
];

const steps = ['Nizo turi', 'Tomonlar', 'Tafsilotlar', 'Dalillar', 'Yuborish'];

const progress = computed(() => `${(step.value / 5) * 100}%`);
const next = () => (step.value = Math.min(5, step.value + 1));
const prev = () => (step.value = Math.max(1, step.value - 1));
const saveDraft = () => {
  window.localStorage.setItem(
    'smartcourt-claim-draft',
    JSON.stringify({
      step: step.value,
      selectedType: selectedType.value,
      partyType: partyType.value,
      uploadedFiles: uploadedFiles.value
    })
  );
  ui.pushToast({
    type: 'success',
    title: 'Qoralama saqlandi',
    text: 'Ariza qoralamasi lokal saqlandi.'
  });
};
const addParty = () => {
  ui.pushToast({
    type: 'success',
    title: 'Tomon qo‘shildi',
    text: `${partyType.value} uchun yangi forma qo‘shildi.`
  });
};
const tryMediation = () => {
  ui.pushToast({
    type: 'success',
    title: 'Mediatsiya boshlandi',
    text: 'MediatoBot demo sessiyasi yaratildi.'
  });
};
const addMockFile = () => {
  const id = Date.now();
  uploadedFiles.value.push({
    id,
    name: `dalil-${uploadedFiles.value.length + 1}.pdf`,
    size: '1.8 MB',
    progress: 42,
    result: 'AI tahlil qilmoqda...'
  });
  window.setTimeout(() => {
    const file = uploadedFiles.value.find((item) => item.id === id);
    if (file) {
      file.progress = 100;
      file.result = 'AI: format to‘g‘ri, deepfake belgisi yo‘q.';
    }
  }, 700);
};
const removeFile = (id) => {
  uploadedFiles.value = uploadedFiles.value.filter((file) => file.id !== id);
};
const handleNext = () => {
  if (step.value === 5) {
    ui.pushToast({
      type: 'success',
      title: 'Ariza yuborildi',
      text: 'Sud tizimiga #2026-001234 raqami bilan qabul qilindi.'
    });
    return;
  }
  next();
};
</script>

<template>
  <RoleShell title="Yangi ariza" subtitle="5 bosqichli ariza wizardi" :nav="portalNav">
    <section class="wizard">
      <header class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Qoralama avtomatik saqlanadi</p>
            <h1>Arizani sudga yuborish</h1>
          </div>
          <BaseButton variant="secondary" @click="saveDraft">Qoralama saqlash</BaseButton>
        </div>
        <nav class="stepper" aria-label="Ariza bosqichlari">
          <button
            v-for="(label, index) in steps"
            :key="label"
            type="button"
            :class="{ active: step === index + 1, done: step > index + 1 }"
            @click="step = index + 1"
          >
            <span>{{ step > index + 1 ? '✓' : index + 1 }}</span>
            {{ label }}
          </button>
        </nav>
        <div class="progress"><span :style="{ width: progress }" /></div>
      </header>

      <div class="wizard-body">
        <main class="panel">
          <template v-if="step === 1">
            <h2>1. Nizo turini tanlang</h2>
            <div class="grid grid-2 choice-grid">
              <BaseCard
                v-for="type in disputeTypes"
                :key="type.title"
                interactive
                :class="{ selected: selectedType === type.title }"
                @click="selectedType = type.title"
              >
                <component :is="type.icon" :size="26" :stroke-width="1.5" />
                <h3>{{ type.title }}</h3>
                <p>{{ type.text }}</p>
                <Check v-if="selectedType === type.title" class="check" :size="20" />
              </BaseCard>
            </div>
          </template>

          <template v-else-if="step === 2">
            <h2>2. Tomonlar</h2>
            <div class="toolbar">
              <BaseButton
                :variant="partyType === 'Jismoniy shaxs' ? 'primary' : 'secondary'"
                @click="partyType = 'Jismoniy shaxs'"
              >
                Jismoniy shaxs
              </BaseButton>
              <BaseButton
                :variant="partyType === 'Yuridik shaxs' ? 'primary' : 'secondary'"
                @click="partyType = 'Yuridik shaxs'"
              >
                Yuridik shaxs
              </BaseButton>
            </div>
            <div class="grid grid-2 form-grid">
              <BaseInput label="F.I.Sh / tashkilot" placeholder="Akramov Dilshod" />
              <BaseInput label="PINFL / INN" placeholder="12345678901234" />
              <BaseInput label="Manzil" placeholder="Toshkent, Yunusobod" />
              <BaseInput label="Telefon" placeholder="+998 90 000 00 00" />
            </div>
            <BaseButton variant="secondary" :icon="Plus" @click="addParty"
              >Yana tomon qo‘shish</BaseButton
            >
          </template>

          <template v-else-if="step === 3">
            <h2>3. Nizo tafsilotlari</h2>
            <div class="grid form-grid">
              <BaseInput label="Sarlavha" placeholder="Mehnat kompensatsiyasi bo‘yicha da’vo" />
              <label class="textarea">
                <span>Nizo mohiyati</span>
                <textarea rows="7" placeholder="Kamida 200 belgi..." />
              </label>
              <div class="grid grid-2">
                <BaseInput label="Nizo summasi" placeholder="50 000 000" />
                <BaseInput label="Voqea sanasi" placeholder="15.01.2026" :icon="Calendar" />
              </div>
            </div>
          </template>

          <template v-else-if="step === 4">
            <h2>4. Dalillar</h2>
            <div
              class="upload"
              role="button"
              tabindex="0"
              @click="addMockFile"
              @keydown.enter="addMockFile"
              @dragover.prevent
              @drop.prevent="addMockFile"
            >
              <Upload :size="34" :stroke-width="1.5" />
              <strong>Fayllarni shu yerga tashlang</strong>
              <p>PDF, JPG, PNG, MP3, MP4, DOCX • 50 MB gacha</p>
            </div>
            <div class="file-list">
              <BaseCard
                v-for="file in uploadedFiles"
                :key="file.id"
                variant="filled"
                class="file-preview"
              >
                <FileText :size="22" :stroke-width="1.5" />
                <div>
                  <strong>{{ file.name }}</strong>
                  <p>{{ file.size }} • {{ file.result }}</p>
                  <div class="file-progress"><span :style="{ width: `${file.progress}%` }" /></div>
                </div>
                <button type="button" aria-label="Faylni o‘chirish" @click="removeFile(file.id)">
                  <Trash2 :size="17" :stroke-width="1.5" />
                </button>
              </BaseCard>
            </div>
          </template>

          <template v-else>
            <h2>5. Ko‘rib chiqish va yuborish</h2>
            <BaseCard variant="filled">
              <h3>MediatoBot tavsiyasi</h3>
              <p>
                Bu nizoni sudga bermasdan mediatsiya orqali hal qilish mumkin. 67% holatlarda
                muvaffaqiyatli yechilgan.
              </p>
              <div class="toolbar">
                <BaseButton variant="secondary" @click="tryMediation"
                  >Mediatsiyani sinab ko‘rish</BaseButton
                >
                <BaseButton @click="handleNext">Sudga yuborish</BaseButton>
              </div>
            </BaseCard>
          </template>

          <footer class="wizard-actions">
            <BaseButton variant="secondary" :disabled="step === 1" @click="prev">Orqaga</BaseButton>
            <BaseButton @click="handleNext">{{
              step === 5 ? 'Yuborish' : 'Davom etish'
            }}</BaseButton>
          </footer>
        </main>

        <aside class="panel ai-panel">
          <p class="eyebrow">AI yordam</p>
          <h2>LexPredictor</h2>
          <p class="muted">
            Kiritilgan ma’lumotlarga ko‘ra, ish mehnat nizolari bo‘yicha 142 ta o‘xshash
            pretsedentga mos keladi.
          </p>
          <strong class="metric">73%</strong>
          <p>Yutish ehtimoli</p>
        </aside>
      </div>
    </section>
  </RoleShell>
</template>

<style scoped>
h1,
h2 {
  margin: 0;
}

.wizard {
  display: grid;
  gap: 18px;
}

.progress {
  overflow: hidden;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--gray-100);
}

.stepper {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin: 18px 0 12px;
}

.stepper button {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--gray-100);
  color: var(--gray-500);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 800;
}

.stepper span {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 50%;
  background: var(--color-white);
}

.stepper button.active {
  border-color: var(--stat-blue);
  background: var(--stat-blue-soft);
  color: var(--stat-blue);
}

.stepper button.done {
  border-color: var(--stat-green);
  background: var(--stat-green-soft);
  color: var(--stat-green);
}

.progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--stat-blue), var(--stat-green));
  transition: width 280ms var(--ease-apple);
}

.wizard-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
}

.choice-grid,
.form-grid {
  margin: 20px 0;
}

.selected {
  outline: 2px solid var(--gray-900);
}

.check {
  float: right;
}

.textarea {
  display: grid;
  gap: 8px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 600;
}

textarea {
  resize: vertical;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--gray-900);
  padding: 12px;
  outline: 0;
}

.upload {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 220px;
  margin: 20px 0;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  text-align: center;
  cursor: pointer;
  transition:
    border-color 200ms var(--ease-apple),
    background 200ms var(--ease-apple);
}

.upload:hover,
.upload:focus-visible {
  border-color: var(--stat-blue);
  background: var(--stat-blue-soft);
  outline: 0;
}

.file-list {
  display: grid;
  gap: 10px;
}

.file-preview {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
}

.file-preview p {
  margin: 4px 0 9px;
  color: var(--gray-500);
}

.file-preview button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--border-subtle);
  border-radius: 50%;
  background: var(--color-white);
  color: var(--gray-700);
}

.file-progress {
  overflow: hidden;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--gray-200);
}

.file-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--stat-blue), var(--stat-green));
  transition: width 300ms var(--ease-apple);
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
}

.ai-panel {
  position: sticky;
  top: 84px;
  height: max-content;
}

.ai-panel .metric {
  color: var(--stat-blue);
}

@media (max-width: 980px) {
  .wizard-body {
    grid-template-columns: 1fr;
  }

  .stepper {
    grid-template-columns: 1fr;
  }
}
</style>
