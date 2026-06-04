import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { translateText } from '@/utils/translate';

const textOriginals = new WeakMap();
const attributeOriginals = new WeakMap();
const translatedAttributes = ['aria-label', 'placeholder', 'title'];

export const useDomTranslation = () => {
  const { locale } = useI18n();
  let observer;
  let translating = false;

  const translateNode = (root) => {
    if (!root || translating) return;
    translating = true;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (parent && !['SCRIPT', 'STYLE'].includes(parent.tagName) && node.nodeValue?.trim()) {
        if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
        node.nodeValue = translateText(textOriginals.get(node), locale.value);
      }
      node = walker.nextNode();
    }

    const elements = root.querySelectorAll?.('*') ?? [];
    for (const element of elements) {
      if (!attributeOriginals.has(element)) attributeOriginals.set(element, {});
      const originals = attributeOriginals.get(element);
      for (const attribute of translatedAttributes) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        if (!originals[attribute]) originals[attribute] = value;
        element.setAttribute(attribute, translateText(originals[attribute], locale.value));
      }
    }

    translating = false;
  };

  const refresh = async () => {
    await nextTick();
    translateNode(document.body);
  };

  onMounted(() => {
    refresh();
    observer = new MutationObserver(() => refresh());
    observer.observe(document.body, { childList: true, subtree: true });
  });

  watch(locale, (value) => {
    window.localStorage.setItem('smartcourt-locale', value);
    refresh();
  });

  onBeforeUnmount(() => observer?.disconnect());
};
