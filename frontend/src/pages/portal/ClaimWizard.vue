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
  demoOneIdProfile,
  downloadBlob,
  formatOfficialDate,
  getClaimTemplateByDispute,
  getOfficialLineBlocks,
  legalReferences,
  slugifyDocumentName,
  toWordHtml
} from '@/data/legalTemplates';

const ui = useUi();
const router = useRouter();
const step = ref(1);
const submitting = ref(false);
const previewScale = ref('fit');

const demoClaimDetails = {
  title: 'pul mablag‘ini undirish to‘g‘risida',
  description:
    'Men Fayzullayev Jaxongir Azam o‘g‘li 2026 yil 12 may kuni telefonimni ta’mirlash uchun “Usta Servis” MChJga topshirdim. Xizmat haqi sifatida 1 800 000 so‘m to‘ladim, lekin telefonim ta’mirlanmasdan qaytarildi. Pulimni qaytarishni so‘radim, javobgar rad etdi. Chek va yozishmalar menda mavjud. Sud orqali pulimni va sud xarajatlarini undirishni so‘rayman.',
  amount: '1 800 000 so‘m',
  eventDate: '12.05.2026',
  preTrial: 'Javobgarga pulni qaytarish bo‘yicha murojaat qilingan, biroq talab bajarilmagan.'
};

const form = reactive({
  selectedType: 'Mehnat nizosi',
  partyType: 'Jismoniy shaxs',
  courtName: 'Fuqarolik ishlari bo‘yicha Toshkent shahar Yakkasaroy tumanlararo sudiga',
  claimantName: demoOneIdProfile.fullName,
  claimantBirthDate: demoOneIdProfile.birthDate,
  claimantPinfl: demoOneIdProfile.pinfl,
  claimantPassport: demoOneIdProfile.passport,
  claimantAddress: demoOneIdProfile.address,
  claimantPhone: demoOneIdProfile.phone,
  claimantEmail: demoOneIdProfile.email,
  respondentName: '“Usta Servis” MChJ',
  respondentPinfl: '309123456',
  respondentAddress: 'Toshkent shahar, Chilonzor tumani, Bunyodkor ko‘chasi, 18-uy',
  respondentPhone: '+998 71 200-20-20',
  ...demoClaimDetails
});

// Uzbek label → backend DisputeType enum.
const DISPUTE_MAP = {
  'Fuqarolik nizosi': 'civil',
  'Mehnat nizosi': 'labor',
  'Iqtisodiy nizosi': 'economic',
  'Oilaviy nizosi': 'family',
  'Ma’muriy shikoyat': 'administrative'
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
  { title: 'Oilaviy nizosi', icon: Scale, text: 'Ajrim, aliment, mol-mulk bo‘linishi.' },
  { title: 'Ma’muriy shikoyat', icon: FileText, text: 'Davlat organi qarori yoki harakati.' }
];

const courtOptions = [
  'Fuqarolik ishlari bo‘yicha Toshkent shahar Yakkasaroy tumanlararo sudiga',
  'Fuqarolik ishlari bo‘yicha Toshkent shahar Chilonzor tumanlararo sudiga',
  'Fuqarolik ishlari bo‘yicha Toshkent shahar Mirzo Ulug‘bek tumanlararo sudiga',
  'Toshkent tumanlararo iqtisodiy sudiga',
  'Toshkent shahar ma’muriy sudiga'
];

const steps = ['Nizo turi', 'Tomonlar', 'Tafsilotlar', 'Dalillar', 'Yuborish'];
const templateChoices = [
  'Fuqarolik da’vo arizasi',
  'Mehnat nizosi bo‘yicha da’vo arizasi',
  'Oila nizosi bo‘yicha da’vo arizasi',
  'Iqtisodiy sudga da’vo arizasi',
  'Ma’muriy shikoyat',
  'Kassatsiya shikoyati'
];
const demoFlow = [
  'Fuqaro OneID orqali kiradi',
  'Profil ma’lumotlari avtomatik to‘ldiriladi',
  'Fuqaro shikoyatini advokatga aytganday yozadi',
  'Tizim matndan talab, holat va dalillarni ajratadi',
  'Rasmiy A4 preview shakllanadi',
  '.doc sifatida yuklab olinadi'
];

const progress = computed(() => `${(step.value / 5) * 100}%`);
const currentTemplate = computed(() => getClaimTemplateByDispute(form.selectedType));
const officialDocumentDate = computed(() => formatOfficialDate());
const extractedClaimInsights = computed(() => {
  const description = String(form.description || '').toLowerCase();
  const evidence = [];

  if (description.includes('chek')) evidence.push('chek');
  if (description.includes('yozishma')) evidence.push('yozishmalar');
  if (description.includes('telefon')) evidence.push('telefon topshirilgani');
  if (form.preTrial) evidence.push('sudgacha murojaat');

  return [
    { label: 'Aniqlangan talab', value: form.title || 'Talab hali kiritilmagan' },
    { label: 'Aniqlangan summa', value: form.amount || 'Summa hali kiritilmagan' },
    { label: 'Voqea sanasi', value: form.eventDate || 'Sana hali kiritilmagan' },
    {
      label: 'Aniqlangan dalillar',
      value: evidence.length ? evidence.join(', ') : 'Dalillar matndan aniqlanmadi'
    }
  ];
});
const officialChecklist = computed(() => [
  { label: 'Sud nomi', done: Boolean(form.courtName) },
  { label: 'Da’vogar ma’lumotlari', done: Boolean(form.claimantName && form.claimantPinfl) },
  { label: 'Javobgar ma’lumotlari', done: Boolean(form.respondentName && form.respondentAddress) },
  { label: 'Talab va summa', done: Boolean(form.title && form.amount) },
  { label: 'Holatlar bayoni', done: Boolean(form.description && form.description.length > 80) },
  { label: 'Dalil yoki izoh', done: Boolean(uploadedFiles.value.length || form.description) },
  { label: 'Sudgacha murojaat', done: Boolean(form.preTrial) },
  { label: 'Avtomatik sana', done: Boolean(officialDocumentDate.value) }
]);
const checklistProgress = computed(() => {
  const completed = officialChecklist.value.filter((item) => item.done).length;
  return `${completed}/${officialChecklist.value.length}`;
});
const compactLegalReferences = computed(() =>
  legalReferences.map((reference) => ({
    ...reference,
    summary:
      reference.title.length > 86 ? `${reference.title.slice(0, 86).trim()}...` : reference.title
  }))
);
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

const applyDemoClaimDetails = () => {
  Object.assign(form, demoClaimDetails);
  ui.pushToast({
    type: 'success',
    title: 'Demo tavsif to‘ldirildi',
    text: 'Ariza mavzusi, voqea bayoni, summa va sudgacha murojaat demo holatga qaytarildi.'
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

const claimPreviewText = computed(() => buildClaimDocument(buildClaimExportPayload()));
const claimPreviewBlocks = computed(() => getOfficialLineBlocks(claimPreviewText.value));

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
    form.courtName && `Sud: ${form.courtName}`,
    form.title && `Sarlavha: ${form.title}`,
    form.claimantName && `Da’vogar: ${form.claimantName}`,
    form.claimantPinfl && `Da’vogar JShShIR: ${form.claimantPinfl}`,
    form.claimantAddress && `Da’vogar manzili: ${form.claimantAddress}`,
    form.respondentName && `Javobgar: ${form.respondentName}`,
    form.respondentAddress && `Javobgar manzili: ${form.respondentAddress}`,
    form.amount && `Nizo summasi: ${form.amount}`,
    form.eventDate && `Voqea sanasi: ${form.eventDate}`,
    form.preTrial && `Sudgacha murojaat: ${form.preTrial}`,
    form.description && `\nFuqaro shikoyati: ${form.description}`
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
              <p>
                {{ form.selectedType }} uchun rasmiy struktura: {{ currentTemplate.format }} •
                {{ currentTemplate.basis.join(', ') }}
              </p>
              <div class="template-list compact">
                <span
                  v-for="templateName in templateChoices"
                  :key="templateName"
                  :class="{
                    selected:
                      templateName === form.selectedType || templateName === currentTemplate.name
                  }"
                >
                  {{ templateName }}
                </span>
              </div>
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
            <h2>2. OneID profil va tomonlar</h2>
            <BaseCard variant="filled" class="oneid-card simplified">
              <div class="oneid-summary">
                <div>
                  <p class="eyebrow">Arizachi OneID orqali tasdiqlandi</p>
                  <h3>{{ demoOneIdProfile.fullName }}</h3>
                  <p>
                    Bu ma’lumotlar davlat identifikatsiyasidan keladi va ariza yaratishda qo‘lda
                    o‘zgartirilmaydi.
                  </p>
                </div>
                <span class="verified-pill">Tasdiqlangan</span>
              </div>
              <div class="readonly-profile-grid">
                <div>
                  <span>JShShIR</span>
                  <strong>{{ form.claimantPinfl }}</strong>
                </div>
                <div>
                  <span>Pasport</span>
                  <strong>{{ form.claimantPassport }}</strong>
                </div>
                <div>
                  <span>Tug‘ilgan sana</span>
                  <strong>{{ form.claimantBirthDate }}</strong>
                </div>
                <div>
                  <span>Yashash manzili</span>
                  <strong>{{ form.claimantAddress }}</strong>
                </div>
              </div>
              <details class="contact-details">
                <summary>Aloqa uchun qo‘shimcha ma’lumotlar</summary>
                <div class="grid grid-2 form-grid compact">
                  <BaseInput
                    v-model="form.claimantPhone"
                    label="Qo‘shimcha telefon"
                    placeholder="+998 90 000 00 00"
                  />
                  <BaseInput
                    v-model="form.claimantEmail"
                    label="Qo‘shimcha email"
                    placeholder="name@example.uz"
                  />
                </div>
              </details>
            </BaseCard>

            <BaseCard variant="outlined" class="court-card">
              <p class="eyebrow">Sud</p>
              <label class="select-field">
                <span>Sudni ro‘yxatdan tanlang</span>
                <select v-model="form.courtName">
                  <option v-for="court in courtOptions" :key="court" :value="court">
                    {{ court }}
                  </option>
                </select>
              </label>
            </BaseCard>

            <BaseCard variant="outlined" class="respondent-card">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">Javobgar</p>
                  <h3>Kimga nisbatan da’vo kiritilmoqda?</h3>
                </div>
                <div class="segmented-control" aria-label="Javobgar turi">
                  <button
                    type="button"
                    :class="{ active: form.partyType === 'Jismoniy shaxs' }"
                    @click="form.partyType = 'Jismoniy shaxs'"
                  >
                    Jismoniy shaxs
                  </button>
                  <button
                    type="button"
                    :class="{ active: form.partyType === 'Yuridik shaxs' }"
                    @click="form.partyType = 'Yuridik shaxs'"
                  >
                    Yuridik shaxs
                  </button>
                </div>
              </div>
              <div class="grid grid-2 form-grid compact">
                <BaseInput
                  v-model="form.respondentName"
                  label="F.I.Sh / tashkilot"
                  placeholder="Alfa MChJ"
                />
                <BaseInput
                  v-model="form.respondentPinfl"
                  label="PINFL / INN"
                  placeholder="987654321"
                />
                <BaseInput
                  v-model="form.respondentAddress"
                  label="Manzil"
                  placeholder="Toshkent, Chilonzor"
                />
                <BaseInput
                  v-model="form.respondentPhone"
                  label="Telefon / email"
                  placeholder="+998 71 000 00 00"
                />
              </div>
            </BaseCard>
          </template>

          <template v-else-if="step === 3">
            <h2>3. Shikoyatni erkin yozing</h2>
            <BaseCard variant="filled" class="auto-date-card">
              <div>
                <p class="eyebrow">Avtomatik hujjat sanasi</p>
                <h3>{{ officialDocumentDate }}</h3>
                <p>
                  Bu sana ariza qog‘ozidagi yakuniy <strong>Sana</strong> qatoriga avtomatik
                  qo‘yiladi. Voqea sanasi esa alohida maydon sifatida qoladi.
                </p>
              </div>
              <BaseButton variant="secondary" size="sm" @click="applyDemoClaimDetails">
                Demo tavsifni qayta to‘ldirish
              </BaseButton>
            </BaseCard>
            <div class="grid form-grid">
              <BaseInput
                v-model="form.title"
                label="Ariza mavzusi"
                placeholder="pul mablag‘ini undirish to‘g‘risida"
              />
              <label class="textarea">
                <span>Fuqaro shikoyati</span>
                <textarea
                  v-model="form.description"
                  rows="8"
                  placeholder="Masalan: Men Fayzullayev Jaxongir Azam o‘g‘li ... shunaqa holat bo‘ldi, chek bor, pulimni qaytarishmadi..."
                />
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
              <label class="textarea">
                <span>Sudgacha murojaat / talabnoma</span>
                <textarea
                  v-model="form.preTrial"
                  rows="3"
                  placeholder="Javobgarga murojaat qilinganmi, rad javobi bormi, talabnoma yuborilganmi?"
                />
              </label>
              <BaseButton :icon="Sparkles" :loading="validation.loading" @click="runClaimValidator">
                {{
                  validation.loading
                    ? 'AI tahlil qilmoqda...'
                    : 'AI bilan tekshirish (ClaimValidator)'
                }}
              </BaseButton>

              <BaseCard variant="filled" class="insight-card">
                <div class="insight-heading">
                  <div>
                    <p class="eyebrow">AI ajratgan ma’lumotlar</p>
                    <h3>Ariza matnidan tushunilgan asosiy nuqtalar</h3>
                  </div>
                  <span>Frontend demo</span>
                </div>
                <div class="insight-grid">
                  <div v-for="item in extractedClaimInsights" :key="item.label">
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                </div>
              </BaseCard>

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
            <BaseCard v-if="!uploadedFiles.length" variant="filled" class="smart-empty">
              <p class="eyebrow">Demo uchun avtomatik dalillar</p>
              <h3>Fayl bo‘lmasa ham, tizim matndan dalil izlarini ko‘rsatadi</h3>
              <div class="template-list">
                <span>Chek</span>
                <span>Yozishmalar</span>
                <span>Telefon topshirilgani</span>
                <span>Sudgacha murojaat</span>
              </div>
              <p>
                Rasmiy previewda bu bandlar bo‘sh chiziq o‘rniga mazmun sifatida chiqadi. Real fayl
                yuklansa, shu ro‘yxat fayl nomlari bilan almashadi.
              </p>
            </BaseCard>
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
                Foydalanuvchi uchun .doc ko‘rinishida, texnik taraf uchun JSON metadata. Hozirgi
                oqim frontendda ishlaydi; real OneID, ERI va serverda saqlash keyingi bosqichda
                ulanadi.
              </p>
              <div class="document-date-note">
                Ariza sanasi avtomatik: <strong>{{ officialDocumentDate }}</strong>
              </div>
              <div class="trust-banner">
                <strong>Yuridik eslatma:</strong> Bu hujjat avtomatik tayyorlangan. Yakuniy tasdiq
                mas’ul shaxs tomonidan amalga oshiriladi.
              </div>
              <div class="template-list">
                <span v-for="field in currentTemplate.requiredFields" :key="field">{{
                  field
                }}</span>
              </div>
              <div class="toolbar">
                <BaseButton :icon="FileDown" @click="exportClaimDoc">
                  Rasmiy hujjatni yuklash
                </BaseButton>
                <BaseButton variant="secondary" :icon="FileText" @click="exportClaimJson">
                  Texnik metadata
                </BaseButton>
              </div>
            </BaseCard>
            <BaseCard variant="filled" class="checklist-card">
              <div class="checklist-heading">
                <div>
                  <p class="eyebrow">Rasmiylik checklist</p>
                  <h3>{{ checklistProgress }} talab tayyor</h3>
                </div>
                <span>Sudga yuborishdan oldingi frontend tekshiruv</span>
              </div>
              <div class="checklist-grid">
                <button
                  v-for="item in officialChecklist"
                  :key="item.label"
                  type="button"
                  :class="{ done: item.done }"
                >
                  <span>{{ item.done ? '✓' : '!' }}</span>
                  {{ item.label }}
                </button>
              </div>
            </BaseCard>
            <section class="document-stage">
              <div class="preview-header">
                <div>
                  <p class="eyebrow">Yakuniy ariza preview</p>
                  <h3>Qog‘ozda chiqadigan rasmiy ko‘rinish</h3>
                </div>
                <div class="preview-tools">
                  <span class="template-pill">
                    Shablon: {{ currentTemplate.name }} • {{ currentTemplate.paper.size }} •
                    {{ currentTemplate.paper.font }}
                  </span>
                  <div class="zoom-control" aria-label="Preview zoom">
                    <button
                      type="button"
                      :class="{ active: previewScale === 'fit' }"
                      @click="previewScale = 'fit'"
                    >
                      Fit
                    </button>
                    <button
                      type="button"
                      :class="{ active: previewScale === '75' }"
                      @click="previewScale = '75'"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      :class="{ active: previewScale === '100' }"
                      @click="previewScale = '100'"
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
              <div class="preview-shortcuts">
                <button type="button" @click="step = 2">Da’vogar/Javobgarni tahrirlash</button>
                <button type="button" @click="step = 3">Talab va holatlarni tahrirlash</button>
                <button type="button" @click="step = 4">Dalillarni tahrirlash</button>
              </div>
              <article class="official-paper" :class="`scale-${previewScale}`">
                <div class="paper-body">
                  <template
                    v-for="(block, index) in claimPreviewBlocks"
                    :key="`${block.type}-${index}`"
                  >
                    <div v-if="block.type === 'recipient-spacer'" class="recipient-spacer" />
                    <div v-else-if="block.type === 'spacer'" class="spacer" />
                    <h1 v-else-if="block.type === 'title'">{{ block.text }}</h1>
                    <p v-else-if="block.type === 'subtitle'" class="document-subtitle">
                      {{ block.text }}
                    </p>
                    <h2 v-else-if="block.type === 'section'">{{ block.text }}</h2>
                    <p v-else-if="block.type === 'list'" class="list-item">{{ block.text }}</p>
                    <p v-else-if="block.type === 'field'">
                      <strong>{{ block.label }}:</strong>
                      <template v-if="block.value"> {{ block.value }}</template>
                    </p>
                    <div v-else-if="block.type === 'recipient'" class="recipient-line">
                      <strong v-if="block.value">{{ block.label }}:</strong>
                      <template v-if="block.value"> {{ block.value }}</template>
                      <strong v-else>{{ block.text }}</strong>
                    </div>
                    <p v-else>{{ block.text }}</p>
                  </template>
                </div>
              </article>
            </section>
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
            <div class="sticky-export-bar">
              <div>
                <strong>Rasmiy ariza tayyor</strong>
                <span>{{ checklistProgress }} band checklistdan o‘tdi</span>
              </div>
              <div class="toolbar">
                <BaseButton variant="secondary" :icon="FileText" @click="exportClaimJson">
                  Texnik metadata
                </BaseButton>
                <BaseButton :icon="FileDown" @click="exportClaimDoc">
                  Rasmiy hujjatni yuklash
                </BaseButton>
              </div>
            </div>
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
              v-for="reference in compactLegalReferences"
              :key="reference.code"
              :href="reference.url"
              target="_blank"
              rel="noreferrer"
            >
              <span>{{ reference.code }}</span>
              <small>{{ reference.summary }}</small>
              <b>To‘liq ko‘rish</b>
            </a>
          </div>
          <div class="demo-flow">
            <p class="eyebrow">Ariza shakllanish oqimi</p>
            <ol>
              <li v-for="item in demoFlow" :key="item">{{ item }}</li>
            </ol>
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

.oneid-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin: 16px 0;
}

.oneid-card h3 {
  margin: 4px 0 8px;
}

.oneid-card p {
  margin: 0;
  color: var(--gray-500);
  line-height: 1.5;
}

.oneid-card.simplified {
  display: grid;
  gap: 16px;
}

.oneid-summary,
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.verified-pill {
  border: 1px solid color-mix(in srgb, var(--stat-green) 38%, var(--border-subtle));
  border-radius: var(--radius-full);
  background: var(--stat-green-soft);
  padding: 7px 10px;
  color: var(--gray-900);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.readonly-profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.readonly-profile-grid div {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 11px 12px;
}

.readonly-profile-grid span {
  display: block;
  margin-bottom: 5px;
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 700;
}

.readonly-profile-grid strong {
  color: var(--gray-900);
  font-size: 13px;
  line-height: 1.45;
}

.contact-details {
  border-top: 1px solid var(--border-subtle);
  padding-top: 12px;
}

.contact-details summary {
  color: var(--gray-800);
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
}

.form-grid.compact {
  margin: 14px 0 0;
}

.court-card,
.respondent-card {
  margin: 16px 0;
}

.respondent-card h3 {
  margin: 4px 0 0;
  color: var(--gray-900);
  font-size: 17px;
}

.select-field {
  display: grid;
  gap: 8px;
  margin-top: 10px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 700;
}

.select-field select {
  min-height: 44px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--gray-900);
  padding: 0 12px;
  outline: 0;
  font: inherit;
  font-weight: 650;
}

.select-field select:focus {
  border-color: var(--gray-900);
}

.segmented-control {
  display: inline-flex;
  overflow: hidden;
  flex: 0 0 auto;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: var(--color-white);
  padding: 3px;
}

.segmented-control button {
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  padding: 8px 12px;
  color: var(--gray-600);
  font-size: 12px;
  font-weight: 850;
}

.segmented-control button.active {
  background: var(--gray-900);
  color: var(--color-white);
}

.auto-date-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin: 16px 0;
}

.auto-date-card h3 {
  margin: 4px 0 8px;
}

.auto-date-card p {
  margin: 0;
  color: var(--gray-500);
  line-height: 1.5;
}

.insight-card {
  margin-top: 10px;
}

.insight-heading,
.checklist-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.insight-heading h3,
.checklist-heading h3 {
  margin: 4px 0 0;
  color: var(--gray-900);
  font-size: 17px;
}

.insight-heading > span,
.checklist-heading > span {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--color-white);
  padding: 7px 10px;
  color: var(--gray-600);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.insight-grid div {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 12px;
}

.insight-grid span {
  display: block;
  margin-bottom: 5px;
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 700;
}

.insight-grid strong {
  color: var(--gray-900);
  font-size: 14px;
  line-height: 1.45;
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

.template-list.compact span.selected {
  border-color: var(--gray-900);
  background: var(--gray-900);
  color: var(--color-white);
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

.smart-empty {
  margin: 14px 0;
}

.smart-empty h3 {
  margin: 5px 0 8px;
  color: var(--gray-900);
  font-size: 17px;
}

.smart-empty p {
  margin: 12px 0 0;
  color: var(--gray-500);
  line-height: 1.55;
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

.trust-banner {
  margin-top: 14px;
  border: 1px solid color-mix(in srgb, var(--stat-blue) 24%, var(--border-subtle));
  border-radius: var(--radius-md);
  background: var(--stat-blue-soft);
  padding: 12px 14px;
  color: var(--gray-800);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.document-date-note {
  margin-top: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 10px 12px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 700;
}

.checklist-card {
  margin: 18px 0;
}

.checklist-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.checklist-grid button {
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 10px 12px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 800;
  text-align: left;
}

.checklist-grid button span {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--gray-100);
  color: var(--gray-500);
}

.checklist-grid button.done {
  border-color: color-mix(in srgb, var(--stat-green) 32%, var(--border-subtle));
  background: var(--stat-green-soft);
  color: var(--gray-900);
}

.checklist-grid button.done span {
  background: var(--stat-green);
  color: var(--color-white);
}

.document-stage {
  margin: 18px 0;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--gray-100) 80%, transparent), transparent),
    var(--gray-100);
  padding: 18px;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.preview-header h3 {
  margin: 2px 0 0;
  color: var(--gray-900);
  font-size: 20px;
}

.template-pill {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: var(--color-white);
  padding: 8px 12px;
  color: var(--gray-800);
  font-size: 12px;
  font-weight: 800;
}

.preview-tools {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 8px;
}

.zoom-control,
.preview-shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.zoom-control button,
.preview-shortcuts button {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--color-white);
  padding: 7px 10px;
  color: var(--gray-700);
  font-size: 12px;
  font-weight: 800;
}

.zoom-control button.active {
  border-color: var(--gray-900);
  background: var(--gray-900);
  color: var(--color-white);
}

.preview-shortcuts {
  margin-bottom: 14px;
}

.preview-shortcuts button:hover {
  border-color: var(--stat-blue);
  background: var(--stat-blue-soft);
  color: var(--gray-900);
}

.official-paper {
  box-sizing: border-box;
  width: min(100%, 210mm);
  min-height: 620px;
  margin: 0 auto;
  border: 1px solid color-mix(in srgb, var(--gray-300) 70%, var(--border-subtle));
  background: var(--color-white);
  box-shadow: 0 22px 55px rgb(15 23 42 / 12%);
  padding: 24mm 15mm 22mm 30mm;
  color: #111827;
  font-family: 'Times New Roman', Times, serif;
  font-size: 14pt;
  line-height: 1.55;
}

.official-paper.scale-fit {
  width: min(100%, 210mm);
}

.official-paper.scale-75 {
  width: 157.5mm;
  min-height: 520px;
  font-size: 12pt;
}

.official-paper.scale-100 {
  width: 210mm;
  max-width: none;
}

.paper-body {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.paper-body :deep(.recipient-line) {
  max-width: 96mm;
  margin-left: auto;
  text-align: left;
  line-height: 1.35;
}

.paper-body :deep(.recipient-line:first-child) {
  font-weight: 700;
}

.paper-body :deep(.recipient-spacer) {
  height: 2.5mm;
}

.paper-body :deep(h1) {
  margin: 10mm 0 2mm;
  text-align: center;
  font-size: 16pt;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.paper-body :deep(.document-subtitle) {
  margin: 0 0 7mm;
  text-align: center;
}

.paper-body :deep(h2) {
  margin: 6mm 0 2mm;
  font-size: 14pt;
  font-weight: 700;
}

.paper-body :deep(p) {
  margin: 0 0 2.5mm;
  text-align: justify;
}

.paper-body :deep(.list-item) {
  margin-left: 8mm;
  text-indent: -6mm;
}

.paper-body :deep(.spacer) {
  height: 3mm;
}

.sticky-export-bar {
  position: sticky;
  z-index: 3;
  bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-white) 92%, var(--gray-100));
  box-shadow: var(--shadow-md);
  padding: 12px 14px;
  backdrop-filter: blur(14px);
}

.sticky-export-bar strong,
.sticky-export-bar span {
  display: block;
}

.sticky-export-bar strong {
  color: var(--gray-900);
}

.sticky-export-bar span {
  margin-top: 3px;
  color: var(--gray-500);
  font-size: 12px;
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
  display: grid;
  gap: 3px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 10px;
  color: var(--gray-800);
  text-decoration: none;
}

.legal-box a span {
  color: var(--gray-900);
  font-weight: 800;
}

.legal-box a small {
  color: var(--gray-500);
  line-height: 1.45;
}

.legal-box a b {
  color: var(--stat-blue);
  font-size: 12px;
}

.demo-flow {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
}

.demo-flow ol {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
  color: var(--gray-700);
  font-size: 12px;
  line-height: 1.5;
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

  .checklist-grid,
  .insight-grid {
    grid-template-columns: 1fr;
  }

  .insight-heading,
  .checklist-heading,
  .preview-header,
  .section-heading,
  .oneid-summary,
  .sticky-export-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .readonly-profile-grid {
    grid-template-columns: 1fr;
  }

  .preview-tools {
    align-items: flex-start;
  }

  .official-paper.scale-100 {
    width: min(100%, 210mm);
  }

  .sticky-export-bar .toolbar {
    width: 100%;
  }

  .auto-date-card,
  .oneid-card {
    flex-direction: column;
  }
}
</style>
