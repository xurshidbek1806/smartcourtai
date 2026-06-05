<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { Copy, Mic, Paperclip, RefreshCcw, Send, Sparkles } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { portalNav } from '@/data/navigation';
import { useUi } from '@/stores/ui';
import { ensureAuth, streamAssistant } from '@/lib/api';

const ui = useUi();
const message = ref('');
const streaming = ref(false);
const lastPrompt = ref('');
const messages = ref([
  { role: 'ai', text: 'Assalomu alaykum. Qaysi huquqiy masalada yordam beray? Mehnat, oila, fuqarolik yoki jinoyat huquqi bo\'yicha savol bering.' }
]);

let controller = null;

const sendMessage = () => {
  const prompt = message.value.trim();
  if (!prompt || streaming.value) return;
  messages.value.push({ role: 'user', text: prompt });
  message.value = '';
  streamAnswer(prompt);
};

const streamAnswer = async (prompt) => {
  if (streaming.value) return;
  lastPrompt.value = prompt;
  streaming.value = true;
  await ensureAuth('citizen');
  const aiMessage = { role: 'ai', text: '' };
  messages.value.push(aiMessage);

  controller = streamAssistant({ message: prompt, use_context: true }, (event) => {
    if (event.type === 'error') {
      streaming.value = false;
      ui.pushToast({ type: 'error', title: 'AI xatosi', text: event.message || 'Bog\'lanib bo\'lmadi.' });
      return;
    }
    if (event.type === 'done') {
      streaming.value = false;
      ui.pushToast({ type: 'success', title: 'AI javob tayyor', text: 'Lokal Llama javob qaytardi.' });
      return;
    }
    if (event.content) aiMessage.text += event.content;
  });
};

const regenerate = () => {
  if (streaming.value || !lastPrompt.value) return;
  streamAnswer(lastPrompt.value);
};

const copyMessage = () => {
  const lastAnswer = [...messages.value].reverse().find((item) => item.role === 'ai')?.text ?? '';
  navigator.clipboard?.writeText(lastAnswer);
  ui.pushToast({ type: 'success', title: 'Nusxa olindi', text: 'AI javobi clipboard uchun tayyor.' });
};

const startNewChat = () => {
  if (controller) controller.abort();
  streaming.value = false;
  messages.value = [{ role: 'ai', text: 'Assalomu alaykum. Qaysi huquqiy masalada yordam beray?' }];
  message.value = '';
  ui.pushToast({ type: 'success', title: 'Yangi chat', text: 'Yangi suhbat boshlandi.' });
};

const useSuggestion = (text) => {
  message.value = text;
  sendMessage();
};

const attachFile = () => {
  ui.pushToast({ type: 'info', title: 'Fayl', text: 'Hujjat tahlili uchun EvidenceAnalyzer sahifasidan foydalaning.' });
};

const recordVoice = () => {
  ui.pushToast({ type: 'info', title: 'Ovozli savol', text: 'Ovozli kiritish Jonli majlis modulida mavjud.' });
};

onBeforeUnmount(() => {
  if (controller) controller.abort();
});
</script>

<template>
  <RoleShell title="AI Yuridik maslahatchi" subtitle="Claude-style huquqiy chat" :nav="portalNav">
    <section class="chat-shell">
      <aside class="panel conversations">
        <BaseButton size="sm" @click="startNewChat">Yangi chat</BaseButton>
        <a class="active">Mehnat nizosi</a>
        <a>Aliment masalasi</a>
        <a>Shartnoma bo‘yicha savol</a>
      </aside>
      <main class="panel chat">
        <div class="messages">
          <article
            v-for="(item, index) in messages"
            :key="`${item.role}-${index}`"
            :class="['bubble', item.role]"
          >
            <Sparkles v-if="item.role === 'ai'" :size="20" :stroke-width="1.5" />
            <div>
              <p>{{ item.text }}</p>
              <div v-if="item.role === 'ai' && item.text" class="message-actions">
                <button type="button" @click="copyMessage"><Copy :size="15" />Nusxa</button>
                <button type="button" @click="regenerate">
                  <RefreshCcw :size="15" />Qayta
                </button>
              </div>
            </div>
          </article>
          <article v-if="streaming" class="bubble ai typing">
            <Sparkles :size="20" :stroke-width="1.5" />
            <p><span /><span /><span /></p>
          </article>
        </div>
        <div class="suggestions">
          <button type="button" @click="useSuggestion('Mehnat nizoni qanday hal qilaman?')">
            Mehnat nizoni qanday hal qilaman?
          </button>
          <button type="button" @click="useSuggestion('Ajrim arizasini qaysi sudga beraman?')">
            Ajrim arizasini qaysi sudga beraman?
          </button>
          <button type="button" @click="useSuggestion('Davlat boji qancha?')">
            Davlat boji qancha?
          </button>
        </div>
        <form class="composer" @submit.prevent="sendMessage">
          <button aria-label="Fayl yuklash" type="button" @click="attachFile">
            <Paperclip :size="18" />
          </button>
          <textarea v-model="message" placeholder="Savolingizni yozing..." rows="1" />
          <button aria-label="Ovozli savol" type="button" @click="recordVoice">
            <Mic :size="18" />
          </button>
          <button aria-label="Yuborish" type="submit"><Send :size="18" /></button>
        </form>
      </main>
    </section>
  </RoleShell>
</template>

<style scoped>
.chat-shell {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 18px;
}

.conversations {
  display: grid;
  align-content: start;
  gap: 8px;
}

.conversations a {
  border-radius: var(--radius-md);
  padding: 12px;
  color: var(--gray-600);
}

.conversations a.active,
.conversations a:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.chat {
  display: grid;
  min-height: calc(100vh - 110px);
  grid-template-rows: 1fr auto auto;
}

.messages {
  display: grid;
  align-content: start;
  gap: 14px;
  overflow-y: auto;
}

.bubble {
  display: flex;
  max-width: 760px;
  gap: 12px;
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  line-height: 1.55;
}

.bubble p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble > div {
  min-width: 0;
  flex: 1;
}

.ai {
  border: 1px solid var(--border-subtle);
  background: var(--color-white);
}

.user {
  justify-self: end;
  background: var(--gray-100);
}

.citations,
.message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.citations span {
  border-radius: var(--radius-full);
  background: var(--stat-blue-soft);
  color: var(--stat-blue);
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 800;
}

.message-actions button {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: var(--gray-600);
  padding: 0 9px;
  font-size: 12px;
  font-weight: 700;
}

.typing p {
  display: flex;
  gap: 5px;
  align-items: center;
}

.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gray-500);
  animation: typing 900ms infinite;
}

.typing span:nth-child(2) {
  animation-delay: 120ms;
}

.typing span:nth-child(3) {
  animation-delay: 240ms;
}

@keyframes typing {
  50% {
    opacity: 0.35;
    transform: translateY(-3px);
  }
}

.suggestions,
.composer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.suggestions button,
.composer button {
  min-height: 38px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: var(--gray-900);
  padding: 0 12px;
}

.composer {
  flex-wrap: nowrap;
  align-items: flex-end;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: 8px;
}

textarea {
  min-height: 38px;
  flex: 1;
  resize: none;
  border: 0;
  background: transparent;
  color: var(--gray-900);
  outline: 0;
  padding: 8px;
}

@media (max-width: 820px) {
  .chat-shell {
    grid-template-columns: 1fr;
  }
}
</style>
