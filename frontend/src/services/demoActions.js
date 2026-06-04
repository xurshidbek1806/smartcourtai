const slugify = (value) =>
  String(value || 'smartcourt')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');

export const downloadDemoFile = (name, payload, type = 'application/json') => {
  const content = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

export const runDemoAction = ({ label, ui, router, route, payload }) => {
  const action = String(label || '').trim();
  const lower = action.toLowerCase();

  if (!action) return;

  if (/(demo|ko‘rish|ko'rish)/i.test(lower)) {
    router?.push('/portal/dashboard');
    return;
  }

  if (/(eksport|download|pdf|docx|csv|json|hisobot)/i.test(lower)) {
    downloadDemoFile(`${slugify(action)}.json`, {
      action,
      route: route?.path,
      generatedAt: new Date().toISOString(),
      data: payload ?? 'SmartCourt AI frontend demo export'
    });
    ui?.pushToast({ type: 'success', title: 'Eksport tayyor', text: 'Fayl yuklab olindi.' });
    return;
  }

  const stored = JSON.parse(window.localStorage.getItem('smartcourt-demo-actions') || '[]');
  stored.unshift({ action, route: route?.path, createdAt: new Date().toISOString() });
  window.localStorage.setItem('smartcourt-demo-actions', JSON.stringify(stored.slice(0, 50)));

  ui?.pushToast({
    type: 'success',
    title: action,
    text: 'Demo ma’lumotlar yangilandi.'
  });
};
