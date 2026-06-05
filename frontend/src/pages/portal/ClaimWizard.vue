<script setup>
import { computed, reactive, ref } from 'vue';
import {
  Building2,
  Calendar,
  Check,
  FileDown,
  FileText,
  Home,
  Landmark,
  Loader2,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  Upload
} from 'lucide-vue-next';

import { useRouter } from 'vue-router';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { portalNav } from '@/data/navigation';
import { useUi } from '@/stores/ui';
import { createClaim, ensureAuth, submitClaim, uploadDocument, validateClaim } from '@/lib/api';
import {
  buildClaimDocument,
  buildClaimMetadata,
  downloadBlob,
  getClaimTemplateByDispute,
  legalReferences,
  slugifyDocumentName,
  toWordHtml
} from '@/data/legalTemplates';

const ui = useUi();
const router = useRouter();
const step = ref(1);
const submitting = ref(false);

const form = reactive({
  selectedType: 'Mehnat nizosi',
  partyType: 'Jismoniy shaxs',
  claimantName: '',
  claimantPinfl: '',
  claimantAddress: '',
  claimantPhone: '',
  respondentName: '',
  respondentPinfl: '',
  respondentAddress: '',
  respondentPhone: '',
  title: '',
  description: '',
  amount: '',
  eventDate: ''
});

// Uzbek label → backend DisputeType enum.
const DISPUTE_MAP = {
  'Fuqarolik nizosi': 'civil',
  'Mehnat nizosi': 'labor',
  'Iqtisodiy nizosi': 'economic',
  'Oilaviy nizosi': 'family'
};

const fileInput = ref(null);
const uploadedFiles = ref([]); // { id, name, size, file, progress, result }

const validation = reactive({
  loading: false,
  error: null,
  data: null
});

const disputeTypes = [
  { title: 'Fuqarolik nizosi', icon: Home, text: 'Shaxsiy va mulkiy munosabatlar.' },
  { title: 'Mehnat nizosi', icon: Building2, text: 'Ish haqi, kompensatsiya, shartnoma.' },
  { title: 'Iqtisodiy nizosi', icon: Landmark, text: 'Yuridik shaxslar o‘rtasidagi kelishuvlar.' },
  { title: 'Oilaviy nizosi', icon: Scale, text: 'Ajrim, aliment, mol-mulk bo‘linishi.' }
];

const steps = ['Nizo turi', 'Tomonlar', 'Tafsilotlar', 'Dalillar', 'Yuborish'];

const progress = computed(() => `${(step.value / 5) * 100}%`);
const currentTemplate = computed(() => getClaimTemplateByDispute(form.selectedType));
const next = () => (step.value = Math.min(5, step.value + 1));
const prev = () => (step.value = Math.max(1, step.value - 1));

const saveDraft = () => {
  window.localStorage.setItem(
    'smartcourt-claim-draft',
    JSON.stringify({
      step: step.value,
      form: { ...form },
      templateId: currentTemplate.value.id,
      uploadedFiles: uploadedFiles.value.map(({ id, name, size, result }) => ({
        id,
        name,
        size,
        result
      }))
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
    type: 'info',
    title: 'Tomon',
    text: "Bu demoda bitta javobgar qo'llab-quvvatlanadi."
  });
};

const tryMediation = () => {
  router.push('/portal/mediation');
};

const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const pickFiles = () => fileInput.value?.click();

const onFilesSelected = (e) => {
  const files = Array.from(e.target.files || []);
  for (const f of files) {
    uploadedFiles.value.push({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      size: fmtSize(f.size),
      file: f,
      progress: 100,
      result: 'Yuborishga tayyor'
    });
  }
  e.target.value = '';
};

const removeFile = (id) => {
  uploadedFiles.value = uploadedFiles.value.filter((file) => file.id !== id);
};

const buildClaimExportPayload = () => ({
  form,
  uploadedFiles: uploadedFiles.value,
  validation: validation.data
});

const exportClaimDoc = () => {
  const payload = buildClaimExportPayload();
  const documentText = buildClaimDocument(payload);
  const slug = slugifyDocumentName(form.title || form.selectedType, 'davo-arizasi');
  downloadBlob(
    `${slug}-${Date.now()}.doc`,
    toWordHtml(currentTemplate.value.name, documentText, currentTemplate.value),
    'application/msword;charset=utf-8'
  );
  ui.pushToast({
    type: 'success',
    title: 'Ariza shabloni tayyor',
    text: `${currentTemplate.value.name} Word-compatible .doc formatida yuklandi.`
  });
};

const exportClaimJson = () => {
  const metadata = buildClaimMetadata(buildClaimExportPayload());
  const slug = slugifyDocumentName(form.title || form.selectedType, 'davo-arizasi');
  downloadBlob(
    `${slug}-${Date.now()}.json`,
    JSON.stringify(metadata, null, 2),
    'application/json;charset=utf-8'
  );
  ui.pushToast({
    type: 'success',
    title: 'Metadata tayyor',
    text: 'Backendga yuboriladigan JSON paketi yuklandi.'
  });
};

/**
 * Build the free-text claim from the wizard state and send it to the
 * backend ClaimValidator. The AI returns structured JSON with the dispute
 * type, jurisdiction, missing fields, summary, and recommendations.
 */
const runClaimValidator = async () => {
  const textParts = [
    `Nizo turi: ${form.selectedType}`,
    form.title && `Sarlavha: ${form.title}`,
    form.claimantName && `Da’vogar: ${form.claimantName}`,
    form.claimantAddress && `Da’vogar manzili: ${form.claimantAddress}`,
    form.respondentName && `Javobgar: ${form.respondentName}`,
    form.respondentAddress && `Javobgar manzili: ${form.respondentAddress}`,
    form.amount && `Nizo summasi: ${form.amount}`,
    form.eventDate && `Voqea sanasi: ${form.eventDate}`,
    form.description && `\nMohiyati: ${form.description}`
  ].filter(Boolean);
  const fullText = textParts.join('\n');

  if (fullText.trim().length < 20) {
    ui.pushToast({
      type: 'error',
      title: 'Matn juda qisqa',
      text: 'AI tahlili uchun kamida 20 belgi kiriting.'
    });
    return;
  }

  validation.loading = true;
  validation.error = null;
  validation.data = null;
  try {
    const result = await validateClaim(fullText);
    validation.data = result;
    ui.pushToast({
      type: 'success',
      title: 'AI tahlil tayyor',
      text: result.summary?.slice(0, 80) || 'ClaimValidator natija qaytardi.'
    });
  } catch (e) {
    validation.error = e.message;
    ui.pushToast({
      type: 'error',
      title: 'AI tahlil xatosi',
      text: 'Backend bilan bog‘lanib bo‘lmadi. Konsolga qarang.'
    });
    console.error('ClaimValidator error:', e);
  } finally {
    validation.loading = false;
  }
};

const parseAmount = (raw) => {
  const n = Number(String(raw).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const submitClaimFlow = async () => {
  if (submitting.value) return;
  if (!form.title.trim()) {
    ui.pushToast({
      type: 'error',
      title: 'Sarlavha kerak',
      text: '3-bosqichda ariza sarlavhasini kiriting.'
    });
    step.value = 3;
    return;
  }
  submitting.value = true;
  try {
    await ensureAuth('citizen');
    const payload = {
      dispute_type: DISPUTE_MAP[form.selectedType] || 'civil',
      title: form.title,
      description: form.description,
      amount: parseAmount(form.amount),
      currency: 'UZS',
      location: form.claimantAddress || form.respondentAddress || null,
      respondents: form.respondentName
        ? {
            name: form.respondentName,
            pinfl: form.respondentPinfl,
            phone: form.respondentPhone,
            address: form.respondentAddress
          }
        : null
    };
    const claim = await createClaim(payload);

    // Real dalillarni yuklash (tanlangan fayllar bo'lsa).
    for (const f of uploadedFiles.value) {
      if (f.file) {
        try {
          await uploadDocument(f.file, { claimId: claim.id, analyze: true });
        } catch (err) {
          console.warn('upload failed', err);
        }
      }
    }

    await submitClaim(claim.id);
    ui.pushToast({
      type: 'success',
      title: 'Ariza yuborildi',
      text: `Sud tizimiga ${claim.reference || '#' + claim.id} raqami bilan qabul qilindi.`
    });
    router.push(`/portal/claims/${claim.id}`);
  } catch (e) {
    ui.pushToast({
      type: 'error',
      title: 'Yuborish xatosi',
      text: e.message || "Backend bilan bog'lanib bo'lmadi."
    });
  } finally {
    submitting.value = false;
  }
};

const handleNext = () => {
  if (step.value === 5) {
    submitClaimFlow();
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
          <BaseCard v-if="validation.data" variant="filled" class="validator-summary">
            <div>
              <p class="eyebrow">ClaimValidator natijasi</p>
              <h3>{{ validation.data.jurisdiction || 'Tahlil tayyor' }}</h3>
            </div>
            <RouterLink to="/portal/claim-validator">
              <BaseButton variant="secondary" size="sm">To‘liq tahlil</BaseButton>
            </RouterLink>
          </BaseCard>
          <template v-if="step === 1">
            <h2>1. Nizo turini tanlang</h2>
            <BaseCard variant="filled" class="template-card">
              <p class="eyebrow">Tanlangan huquqiy shablon</p>
              <h3>{{ currentTemplate.name }}</h3>
              <p>{{ currentTemplate.format }} • {{ currentTemplate.basis.join(', ') }}</p>
            </BaseCard>
            <div class="grid grid-2 choice-grid">
              <BaseCard
                v-for="type in disputeTypes"
                :key="type.title"
                interactive
                :class="{ selected: form.selectedType === type.title }"
                @click="form.selectedType = type.title"
              >
                <component :is="type.icon" :size="26" :stroke-width="1.5" />
                <h3>{{ type.title }}</h3>
                <p>{{ type.text }}</p>
                <Check v-if="form.selectedType === type.title" class="check" :size="20" />
              </BaseCard>
            </div>
          </template>

          <template v-else-if="step === 2">
            <h2>2. Tomonlar</h2>
            <div class="toolbar">
              <BaseButton
                :variant="form.partyType === 'Jismoniy shaxs' ? 'primary' : 'secondary'"
                @click="form.partyType = 'Jismoniy shaxs'"
              >
                Jismoniy shaxs
              </BaseButton>
              <BaseButton
                :variant="form.partyType === 'Yuridik shaxs' ? 'primary' : 'secondary'"
                @click="form.partyType = 'Yuridik shaxs'"
              >
                Yuridik shaxs
              </BaseButton>
            </div>
            <div class="grid grid-2 form-grid">
              <BaseInput
                v-model="form.claimantName"
                label="Da’vogar F.I.Sh / tashkilot"
                placeholder="Karimov Akmal"
              />
              <BaseInput
                v-model="form.claimantPinfl"
                label="Da’vogar PINFL / INN"
                placeholder="12345678901234"
              />
              <BaseInput
                v-model="form.claimantAddress"
                label="Da’vogar manzili"
                placeholder="Toshkent, Yunusobod"
              />
              <BaseInput
                v-model="form.claimantPhone"
                label="Da’vogar telefon / email"
                placeholder="+998 90 000 00 00"
              />
              <BaseInput
                v-model="form.respondentName"
                label="Javobgar F.I.Sh / tashkilot"
                placeholder="Alfa MChJ"
              />
              <BaseInput
                v-model="form.respondentPinfl"
                label="Javobgar PINFL / INN"
                placeholder="987654321"
              />
              <BaseInput
                v-model="form.respondentAddress"
                label="Javobgar manzili"
                placeholder="Toshkent, Chilonzor"
              />
              <BaseInput
                v-model="form.respondentPhone"
                label="Javobgar telefon / email"
                placeholder="+998 71 000 00 00"
              />
            </div>
            <BaseButton variant="secondary" :icon="Plus" @click="addParty"
              >Yana tomon qo‘shish</BaseButton
            >
          </template>

          <template v-else-if="step === 3">
            <h2>3. Nizo tafsilotlari</h2>
            <div class="grid form-grid">
              <BaseInput
                v-model="form.title"
                label="Sarlavha"
                placeholder="Mehnat kompensatsiyasi bo‘yicha da’vo"
              />
              <label class="textarea">
                <span>Nizo mohiyati</span>
                <textarea v-model="form.description" rows="7" placeholder="Kamida 200 belgi..." />
              </label>
              <div class="grid grid-2">
                <BaseInput v-model="form.amount" label="Nizo summasi" placeholder="50 000 000" />
                <BaseInput
                  v-model="form.eventDate"
                  label="Voqea sanasi"
                  placeholder="15.01.2026"
                  :icon="Calendar"
                />
              </div>
              <BaseButton :icon="Sparkles" :loading="validation.loading" @click="runClaimValidator">
                {{
                  validation.loading
                    ? 'AI tahlil qilmoqda...'
                    : 'AI bilan tekshirish (ClaimValidator)'
                }}
              </BaseButton>

              <BaseCard v-if="validation.data" variant="filled" class="ai-result">
                <p class="eyebrow">AI: ClaimValidator natijasi</p>
                <h3 v-if="validation.data.summary">{{ validation.data.summary }}</h3>

                <div v-if="validation.data.dispute_type" class="ai-row">
                  <span>Nizo turi</span>
                  <strong>{{ validation.data.dispute_type }}</strong>
                </div>
                <div v-if="validation.data.jurisdiction" class="ai-row">
                  <span>Yurisdiksiya</span>
                  <strong>{{ validation.data.jurisdiction }}</strong>
                </div>
                <div
                  v-if="validation.data.amount !== undefined && validation.data.amount !== null"
                  class="ai-row"
                >
                  <span>Summa</span>
                  <strong
                    >{{ validation.data.amount }} {{ validation.data.currency || 'UZS' }}</strong
                  >
                </div>

                <div v-if="validation.data.relevant_articles?.length" class="ai-block">
                  <p class="muted">Tegishli qonun moddalari</p>
                  <ul>
                    <li v-for="(article, i) in validation.data.relevant_articles" :key="i">
                      {{ article }}
                    </li>
                  </ul>
                </div>

                <div v-if="validation.data.missing_fields?.length" class="ai-block">
                  <p class="muted">Yetishmayotgan ma'lumotlar</p>
                  <ul>
                    <li v-for="(field, i) in validation.data.missing_fields" :key="i">
                      {{ field }}
                    </li>
                  </ul>
                </div>

                <div v-if="validation.data.recommendations?.length" class="ai-block">
                  <p class="muted">Tavsiyalar</p>
                  <ul>
                    <li v-for="(rec, i) in validation.data.recommendations" :key="i">
                      {{ rec }}
                    </li>
                  </ul>
                </div>
              </BaseCard>

              <p v-if="validation.error" class="error-text">{{ validation.error }}</p>
            </div>
          </template>

          <template v-else-if="step === 4">
            <h2>4. Dalillar</h2>
            <input
              ref="fileInput"
              type="file"
              multiple
              hidden
              accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav"
              @change="onFilesSelected"
            />
            <div
              class="upload"
              role="button"
              tabindex="0"
              @click="pickFiles"
              @keydown.enter="pickFiles"
            >
              <Upload :size="34" :stroke-width="1.5" />
              <strong>Fayllarni tanlash uchun bosing</strong>
              <p>PDF, DOCX, TXT, JPG, PNG, MP3 • 50 MB gacha • AI tahlil qiladi</p>
            </div>
            <p v-if="!uploadedFiles.length" class="muted" style="margin-top: 10px">
              Dalil ixtiyoriy — fayl yuklamasdan ham davom etishingiz mumkin.
            </p>
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
            <BaseCard variant="filled" class="template-card">
              <p class="eyebrow">Yuklanadigan ariza paketi</p>
              <h3>{{ currentTemplate.name }}</h3>
              <p>
                Foydalanuvchi uchun .doc ko‘rinishida, backend uchun JSON metadata. Yakuniy
                topshirish bosqichida PDF/PDF-A va ERI backendda shakllantiriladi.
              </p>
              <div class="template-list">
                <span v-for="field in currentTemplate.requiredFields" :key="field">{{
                  field
                }}</span>
              </div>
              <div class="toolbar">
                <BaseButton variant="secondary" :icon="FileDown" @click="exportClaimDoc">
                  Ariza .doc yuklash
                </BaseButton>
                <BaseButton variant="secondary" :icon="FileText" @click="exportClaimJson">
                  JSON paketi
                </BaseButton>
              </div>
            </BaseCard>
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
            <BaseButton :loading="submitting" @click="handleNext">{{
              step === 5 ? (submitting ? 'Yuborilmoqda...' : 'Yuborish') : 'Davom etish'
            }}</BaseButton>
          </footer>
        </main>

        <aside class="panel ai-panel">
          <p class="eyebrow">AI yordam</p>
          <h2>LexPredictor</h2>
          <p class="muted">
            <template v-if="validation.data?.is_complete === false">
              Arizada {{ validation.data?.missing_fields?.length || 0 }} ta kamchilik bor. Davom
              etishdan oldin to'ldiring.
            </template>
            <template v-else-if="validation.data">
              AI tahlil tugatildi. Pastdagi tavsiyalarni ko'rib chiqing.
            </template>
            <template v-else> Step 3 da arizani to'ldiring va AI tahliliga yuboring. </template>
          </p>
          <strong class="metric">{{ validation.data ? '✓' : '—' }}</strong>
          <p>{{ validation.data ? 'AI tahlil bajarildi' : 'AI tahlil kutilmoqda' }}</p>
          <div class="ai-status">
            <Loader2 v-if="validation.loading" :size="14" class="spin" />
            <span v-if="validation.loading">Llama 3.2:3b ishlamoqda...</span>
          </div>
          <div class="legal-box">
            <p class="eyebrow">Huquqiy asos</p>
            <strong>{{ currentTemplate.name }}</strong>
            <p>{{ currentTemplate.basis.join(', ') }}</p>
            <a
              v-for="reference in legalReferences"
              :key="reference.code"
              :href="reference.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ reference.code }}
            </a>
          </div>
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

.validator-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}

.validator-summary h3 {
  margin: 4px 0 0;
}

.template-card {
  margin: 16px 0;
}

.template-card h3 {
  margin: 4px 0 8px;
}

.template-card p {
  margin: 0;
  color: var(--gray-500);
  line-height: 1.5;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.template-list span {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--color-white);
  padding: 7px 10px;
  color: var(--gray-700);
  font-size: 12px;
  font-weight: 700;
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
  font-family: inherit;
}

.ai-result {
  margin-top: 10px;
}

.ai-result h3 {
  margin: 8px 0 14px;
  font-size: 16px;
  line-height: 1.5;
  color: var(--gray-900);
}

.ai-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 13px;
}

.ai-row span {
  color: var(--gray-500);
}

.ai-row strong {
  color: var(--gray-900);
  text-align: right;
}

.ai-block {
  margin-top: 14px;
}

.ai-block .muted {
  margin: 0 0 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-block ul {
  margin: 0;
  padding-left: 18px;
  color: var(--gray-700);
  font-size: 13px;
  line-height: 1.6;
}

.error-text {
  color: var(--gray-700);
  font-size: 13px;
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
  font-size: 48px;
  font-weight: 800;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: var(--gray-500);
  font-size: 12px;
}

.legal-box {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
  font-size: 12px;
}

.legal-box strong {
  color: var(--gray-900);
}

.legal-box p {
  margin: 0;
  color: var(--gray-500);
  line-height: 1.5;
}

.legal-box a {
  color: var(--stat-blue);
  font-weight: 700;
  text-decoration: none;
}

.spin {
  animation: spin 900ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .wizard-body {
    grid-template-columns: 1fr;
  }

  .stepper {
    grid-template-columns: 1fr;
  }

  .validator-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
