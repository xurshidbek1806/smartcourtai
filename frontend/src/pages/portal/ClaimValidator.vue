<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  CheckCircle2,
  FileJson,
  FileText,
  RotateCcw,
  ScanSearch,
  Upload,
  XCircle
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import { portalNav } from '@/data/navigation';
import { getDemoCase, resetDemoCase, updateDemoCase } from '@/services/demoCase';
import { useUi } from '@/stores/ui';

const ui = useUi();
const router = useRouter();
const demoCase = ref(getDemoCase());
const claimText = ref(
  'Men Orion LLC bilan tuzilgan mehnat shartnomasi bo‘yicha 50 000 000 so‘m kompensatsiya talab qilaman. Ish beruvchi shartnomani ogohlantirishsiz bekor qilgan.'
);
const fileName = ref('');
const analyzing = ref(false);
const analyzed = ref(Boolean(demoCase.value.validation?.score));

const resultJson = computed(() =>
  JSON.stringify(
    {
      claim_id: demoCase.value.id,
      title: demoCase.value.title,
      dispute_type: demoCase.value.disputeType,
      jurisdiction: demoCase.value.jurisdiction,
      completeness_score: demoCase.value.validation.score,
      missing_fields: demoCase.value.validation.missing,
      legal_facts: demoCase.value.validation.facts,
      recommended_articles: demoCase.value.articles
    },
    null,
    2
  )
);

const selectDemoFile = () => {
  fileName.value = 'mehnat-kompensatsiya-arizasi.pdf';
  ui.pushToast({
    type: 'info',
    title: 'PDF yuklandi',
    text: 'Ariza matni OCR uchun tayyor.'
  });
};

const analyzeClaim = () => {
  analyzing.value = true;
  analyzed.value = false;
  window.setTimeout(() => {
    demoCase.value = updateDemoCase({
      sourceText: claimText.value,
      validation: {
        score: 82,
        status: 'Tuzatish tavsiya qilinadi',
        missing: ['Javobgar INN raqami', 'Davlat boji kvitansiyasi'],
        facts: ['Mehnat shartnomasi mavjud', 'Kompensatsiya talabi ko‘rsatilgan']
      }
    });
    analyzing.value = false;
    analyzed.value = true;
    ui.pushToast({
      type: 'success',
      title: 'ClaimValidator tahlili tayyor',
      text: 'Yurisdiksiya, kamchiliklar va huquqiy faktlar aniqlandi.'
    });
  }, 700);
};

const resetValidator = () => {
  demoCase.value = resetDemoCase();
  fileName.value = '';
  analyzed.value = false;
  ui.pushToast({ type: 'info', title: 'Tahlil tozalandi', text: 'Demo ariza qayta tiklandi.' });
};
</script>

<template>
  <RoleShell title="ClaimValidator" subtitle="Aqlli kantselyariya" :nav="portalNav">
    <section class="validator">
      <header class="panel hero-panel">
        <div>
          <p class="eyebrow">Kiruvchi oqim va filtrlash</p>
          <h1>Arizani sudga yuborishdan oldin tekshiring.</h1>
          <p class="lead">
            ClaimValidator ariza matnini o‘qiydi, yurisdiksiyani aniqlaydi, kamchiliklarni
            ko‘rsatadi va to‘g‘ri sudga yo‘naltiradi.
          </p>
        </div>
        <BaseBadge variant="filled">NLP + OCR demo</BaseBadge>
      </header>

      <div class="validator-grid">
        <main class="grid">
          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">1. Ariza manbasi</p>
                <h2>PDF yoki erkin matn</h2>
              </div>
              <FileText :size="22" :stroke-width="1.5" />
            </div>
            <button class="upload" type="button" @click="selectDemoFile">
              <Upload :size="30" :stroke-width="1.5" />
              <strong>{{ fileName || 'PDF arizani yuklash' }}</strong>
              <span>PDF, JPG yoki DOCX • OCR demo</span>
            </button>
            <div class="toolbar">
              <BaseButton variant="secondary" :icon="RotateCcw" @click="resetValidator"
                >Tozalash</BaseButton
              >
              <BaseButton :icon="ScanSearch" :disabled="analyzing" @click="analyzeClaim">
                {{ analyzing ? 'Tahlil qilinmoqda...' : 'Arizani tahlil qilish' }}
              </BaseButton>
            </div>
            <label class="textarea">
              <span>Ariza matni</span>
              <textarea v-model="claimText" rows="8" />
            </label>
          </section>

          <section v-if="analyzed" class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">2. ClaimValidator natijasi</p>
                <h2>Ariza tayyorlik darajasi</h2>
              </div>
              <strong class="score">{{ demoCase.validation.score }}%</strong>
            </div>
            <div class="result-grid">
              <BaseCard variant="filled">
                <CheckCircle2 :size="22" :stroke-width="1.5" />
                <h3>Yurisdiksiya</h3>
                <p>{{ demoCase.jurisdiction }}</p>
              </BaseCard>
              <BaseCard variant="filled">
                <FileText :size="22" :stroke-width="1.5" />
                <h3>Nizo turi</h3>
                <p>{{ demoCase.disputeType }}</p>
              </BaseCard>
            </div>
            <div class="result-columns">
              <div>
                <h3>Topilgan huquqiy faktlar</h3>
                <p v-for="fact in demoCase.validation.facts" :key="fact" class="result-row success">
                  <CheckCircle2 :size="17" />{{ fact }}
                </p>
              </div>
              <div>
                <h3>Tuzatilishi kerak</h3>
                <p
                  v-for="item in demoCase.validation.missing"
                  :key="item"
                  class="result-row danger"
                >
                  <XCircle :size="17" />{{ item }}
                </p>
              </div>
            </div>
          </section>
        </main>

        <aside class="grid">
          <section class="panel sticky-panel">
            <p class="eyebrow">Mashina o‘qiydigan natija</p>
            <h2>JSON preview</h2>
            <BaseButton :icon="FileJson" @click="router.push('/portal/claims/new')">
              Ariza wizardiga o‘tish
            </BaseButton>
            <pre>{{ resultJson }}</pre>
          </section>
        </aside>
      </div>
    </section>
  </RoleShell>
</template>

<style scoped>
.validator,
.grid {
  display: grid;
  gap: 18px;
}

.hero-panel {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  max-width: 800px;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.03;
}

.lead {
  max-width: 760px;
  margin-top: 14px;
  color: var(--gray-500);
  font-size: 18px;
  line-height: 1.55;
}

.validator-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 18px;
  align-items: start;
}

.upload {
  display: grid;
  width: 100%;
  min-height: 150px;
  place-items: center;
  gap: 8px;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  color: var(--gray-900);
  cursor: pointer;
}

.upload span,
.result-grid p {
  color: var(--gray-500);
}

.textarea {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 700;
}

textarea {
  display: block;
  box-sizing: border-box;
  width: 100%;
  resize: vertical;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--gray-900);
  padding: 14px;
  line-height: 1.55;
}

.toolbar {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
  background: var(--color-white);
  scroll-margin-top: 110px;
}

.score {
  color: var(--stat-blue);
  font-size: 42px;
}

.result-grid,
.result-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.result-columns {
  margin-top: 18px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  border-radius: var(--radius-md);
  padding: 10px;
}

.result-row.success {
  background: var(--stat-green-soft);
}

.result-row.danger {
  background: var(--stat-red-soft);
}

.sticky-panel {
  position: sticky;
  top: 84px;
}

.sticky-panel :deep(.btn) {
  margin: 14px 0;
}

pre {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-md);
  background: var(--gray-900);
  color: var(--color-white);
  padding: 14px;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 980px) {
  .validator-grid,
  .result-grid,
  .result-columns {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    flex-direction: column;
  }

  .sticky-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .toolbar {
    display: grid;
    grid-template-columns: 1fr;
  }

  .toolbar :deep(.btn) {
    width: 100%;
  }

  .sticky-panel :deep(.btn) {
    width: 100%;
  }
}
</style>
