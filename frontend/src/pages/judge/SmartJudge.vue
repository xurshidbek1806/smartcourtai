<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { FileDown, FileText, Loader2, RefreshCcw, StopCircle, WandSparkles } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { judgeNav } from '@/data/navigation';
import { useUi } from '@/stores/ui';
import { streamSmartJudge } from '@/lib/api';
import {
  buildDecisionDocument,
  buildDecisionMetadata,
  decisionTemplate,
  downloadBlob,
  legalReferences,
  slugifyDocumentName,
  toWordHtml
} from '@/data/legalTemplates';

const ui = useUi();

const form = reactive({
  title: "Ishga tiklash va ish haqi undirish to'g'risida",
  disputeType: 'labor',
  parties: "Da'vogar: A. Karimov; Javobgar: 'Alfa' MChJ",
  facts:
    'Xodim shtat qisqartirilishi bahonasida noqonuniy ishdan boshatilgan. Shtat aslida ' +
    "qisqartirilmagan, o'rniga boshqa odam olingan. 3 oylik ish haqi ham to'lanmagan, " +
    "jami 9 000 000 so'm."
});

const draft = ref('');
const streaming = ref(false);
const elapsedSeconds = ref(0);
const tokenCount = ref(0);

const sources = reactive({
  laws: [],
  precedents: []
});

let controller = null;
let timer = null;

const wordCount = computed(() => (draft.value.trim() ? draft.value.trim().split(/\s+/).length : 0));

const startTimer = () => {
  const t0 = Date.now();
  timer = window.setInterval(() => {
    elapsedSeconds.value = Math.round((Date.now() - t0) / 100) / 10;
  }, 100);
};
const stopTimer = () => {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
};

const generateDraft = () => {
  if (streaming.value) return;
  if (!form.facts.trim()) {
    ui.pushToast({
      type: 'error',
      title: "Ish holatlari bo'sh",
      text: 'Avval ish holatlarini kiriting.'
    });
    return;
  }

  streaming.value = true;
  draft.value = '';
  sources.laws = [];
  sources.precedents = [];
  elapsedSeconds.value = 0;
  tokenCount.value = 0;
  startTimer();

  controller = streamSmartJudge(
    {
      title: form.title,
      dispute_type: form.disputeType,
      parties: form.parties,
      facts: form.facts
    },
    (event) => {
      switch (event.type) {
        case 'sources':
          sources.laws = event.laws || [];
          sources.precedents = event.precedents || [];
          break;
        case 'token':
          draft.value += event.content;
          tokenCount.value += 1;
          if (tokenCount.value % 10 === 0)
            console.log(`[stream] ${tokenCount.value} tokens, ${draft.value.length} chars`);
          break;
        case 'done':
          streaming.value = false;
          stopTimer();
          ui.pushToast({
            type: 'success',
            title: 'Qoralama tayyor',
            text: `SmartJudge ${tokenCount.value} ta token generatsiya qildi.`
          });
          break;
        case 'error':
          streaming.value = false;
          stopTimer();
          ui.pushToast({
            type: 'error',
            title: 'Streaming xatosi',
            text: event.message || "Backend bilan bog'lanib bo'lmadi."
          });
          break;
      }
    }
  );
};

const stopStream = () => {
  if (controller) controller.abort();
  streaming.value = false;
  stopTimer();
  ui.pushToast({
    type: 'success',
    title: "To'xtatildi",
    text: 'Generatsiya foydalanuvchi tomonidan bekor qilindi.'
  });
};

const buildDecisionPayload = () => ({
  form,
  draft: draft.value,
  laws: sources.laws,
  precedents: sources.precedents
});

const exportDecisionDoc = () => {
  if (!draft.value.trim()) {
    ui.pushToast({
      type: 'error',
      title: "Qoralama bo'sh",
      text: 'Avval qoralama yarating.'
    });
    return;
  }
  const documentText = buildDecisionDocument(buildDecisionPayload());
  const slug = slugifyDocumentName(form.title, 'qaror-qoralamasi');
  downloadBlob(
    `${slug}-${Date.now()}.doc`,
    toWordHtml(decisionTemplate.name, documentText, decisionTemplate),
    'application/msword;charset=utf-8'
  );
  ui.pushToast({
    type: 'success',
    title: 'Eksport tayyor',
    text: 'Qaror qoralamasi FPK 253 tuzilmasida .doc formatida yuklandi.'
  });
};

const exportDecisionJson = () => {
  if (!draft.value.trim()) {
    ui.pushToast({
      type: 'error',
      title: 'Qoralama bo‘sh',
      text: 'Avval qoralama yarating.'
    });
    return;
  }
  const slug = slugifyDocumentName(form.title, 'qaror-qoralamasi');
  downloadBlob(
    `${slug}-${Date.now()}.json`,
    JSON.stringify(buildDecisionMetadata(buildDecisionPayload()), null, 2),
    'application/json;charset=utf-8'
  );
  ui.pushToast({
    type: 'success',
    title: 'Metadata tayyor',
    text: 'Sudya exporti uchun JSON paketi yuklandi.'
  });
};

onBeforeUnmount(() => {
  if (controller) controller.abort();
  stopTimer();
});
</script>

<template>
  <RoleShell title="SmartJudge" subtitle="Qaror generatori" :nav="judgeNav">
    <section class="smart-grid">
      <main class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Lokal AI · llama3.2:3b · RAG</p>
            <h1>Qaror qoralamasi</h1>
          </div>
          <div class="header-actions">
            <BaseButton v-if="!streaming" :icon="WandSparkles" @click="generateDraft">
              Qoralama yaratish
            </BaseButton>
            <BaseButton v-else variant="secondary" :icon="StopCircle" @click="stopStream">
              To'xtatish
            </BaseButton>
          </div>
        </div>

        <!-- Inputs -->
        <div class="case-form">
          <BaseInput v-model="form.title" label="Ish nomi" placeholder="Ish nomi" />
          <div class="grid grid-2">
            <BaseInput
              v-model="form.disputeType"
              label="Nizo turi"
              placeholder="labor, civil, criminal..."
            />
            <BaseInput v-model="form.parties" label="Tomonlar" placeholder="Da'vogar / javobgar" />
          </div>
          <label class="textarea">
            <span>Ish holatlari (sudga taqdim etilgan ma'lumotlar)</span>
            <textarea v-model="form.facts" rows="5" />
          </label>
        </div>

        <!-- Streaming stats -->
        <div v-if="streaming || draft" class="stats">
          <span
            ><strong>{{ tokenCount }}</strong> token</span
          >
          <span
            ><strong>{{ wordCount }}</strong> so'z</span
          >
          <span
            ><strong>{{ elapsedSeconds }}</strong> s</span
          >
          <span v-if="streaming" class="live">
            <Loader2 :size="14" class="spin" /> Lokal LLM generatsiya qilmoqda...
          </span>
        </div>

        <!-- Draft -->
        <div v-if="draft || streaming" class="editor" :class="{ streaming }">
          <pre class="draft-text" v-text="draft" />
          <span v-if="streaming" class="cursor" />
        </div>
        <div v-else class="editor">
          <p class="empty">
            Yuqorida ish holatlarini to'ldiring va "Qoralama yaratish" tugmasini bosing. Llama
            3.2:3b modeli RAG orqali tegishli qonun moddalarini topib, real vaqtda sud qarori
            qoralamasini token-by-token generatsiya qiladi.
          </p>
        </div>

        <div class="toolbar">
          <BaseButton
            variant="secondary"
            :icon="RefreshCcw"
            :disabled="streaming"
            @click="generateDraft"
          >
            Qayta yaratish
          </BaseButton>
          <BaseButton :icon="FileDown" :disabled="streaming || !draft" @click="exportDecisionDoc">
            Qaror .doc
          </BaseButton>
          <BaseButton
            variant="secondary"
            :icon="FileText"
            :disabled="streaming || !draft"
            @click="exportDecisionJson"
          >
            JSON paketi
          </BaseButton>
        </div>
      </main>

      <aside class="grid right-rail">
        <BaseCard>
          <h2>Qaror shabloni</h2>
          <p class="muted">
            {{ decisionTemplate.name }}: kirish, bayon, asoslantiruvchi va xulosa qismlari. Yakuniy
            PDF/PDF-A va ERI backendda shakllantiriladi.
          </p>
          <div class="template-list">
            <span v-for="section in decisionTemplate.sections" :key="section">{{ section }}</span>
          </div>
        </BaseCard>
        <BaseCard>
          <h2>Foydalanilgan moddalar</h2>
          <p v-if="!sources.laws.length" class="muted">
            Qoralama yaratilgach, RAG orqali topilgan qonun moddalari shu yerda ko'rinadi.
          </p>
          <div v-for="(law, i) in sources.laws" :key="i" class="source-item">
            <strong>{{ law.code }} {{ law.article }}-modda</strong>
            <p>{{ law.title }}</p>
          </div>
        </BaseCard>
        <BaseCard>
          <h2>O'xshash pretsedentlar</h2>
          <p v-if="!sources.precedents.length" class="muted">
            Qoralama yaratilgach, Qdrant vector qidiruvi natijasida o'xshash pretsedentlar shu yerda
            ko'rinadi.
          </p>
          <div v-for="(p, i) in sources.precedents" :key="i" class="source-item">
            <strong>{{ p.reference }}</strong>
            <p>
              {{ p.outcome }}<span v-if="p.score"> · {{ Math.round(p.score * 100) }}% mos</span>
            </p>
          </div>
        </BaseCard>
        <BaseCard>
          <h2>Huquqiy asos</h2>
          <div v-for="reference in legalReferences" :key="reference.code" class="source-item">
            <strong>{{ reference.code }}</strong>
            <p>{{ reference.title }}</p>
          </div>
        </BaseCard>
        <RouterLink to="/oversight/auto-exec">
          <BaseButton>AutoExec’ga o‘tish</BaseButton>
        </RouterLink>
      </aside>
    </section>
  </RoleShell>
</template>

<style scoped>
.smart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.case-form {
  display: grid;
  gap: 12px;
  margin: 20px 0;
}

.textarea {
  display: grid;
  gap: 8px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 600;
}

.textarea textarea {
  resize: vertical;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--gray-900);
  padding: 12px;
  outline: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 12px 0;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--gray-100);
  color: var(--gray-500);
  font-size: 12px;
}

.stats strong {
  color: var(--gray-900);
  font-size: 14px;
}

.stats .live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.editor {
  min-height: 380px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  padding: 24px;
  font-size: 16px;
  line-height: 1.7;
  outline: 0;
  color: var(--gray-900);
}

.draft-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: var(--gray-900);
}

.editor.streaming {
  border-color: var(--gray-900);
}

.empty {
  color: var(--gray-500);
  font-size: 14px;
}

.human-review {
  margin: 14px 0;
  border-left: 3px solid var(--stat-blue);
  background: var(--stat-blue-soft);
  padding: 12px;
  color: var(--gray-700);
  line-height: 1.5;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 3px;
  background: var(--gray-900);
  animation: blink 900ms infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.template-list span {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--gray-100);
  padding: 7px 10px;
  color: var(--gray-700);
  font-size: 12px;
  font-weight: 700;
}

.right-rail {
  position: sticky;
  top: 84px;
  height: max-content;
}

.source-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.source-item:last-child {
  border-bottom: 0;
}

.source-item strong {
  display: block;
  color: var(--gray-900);
  font-size: 13px;
}

.source-item p {
  margin: 4px 0 0;
  color: var(--gray-500);
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
  .smart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
