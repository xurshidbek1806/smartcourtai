const STORAGE_KEY = 'smartcourt-demo-case';

const defaultCase = {
  id: '2026-001234',
  title: 'Mehnat shartnomasi bo‘yicha kompensatsiya',
  disputeType: 'Mehnat nizosi',
  claimant: 'Dilshod Akramov',
  respondent: 'Orion LLC',
  amount: '50 000 000',
  jurisdiction: 'Fuqarolik ishlari bo‘yicha Toshkent shahar sudi',
  articles: ['Mehnat kodeksi 161-modda', 'Mehnat kodeksi 167-modda'],
  validation: {
    score: 82,
    status: 'Tuzatish tavsiya qilinadi',
    missing: ['Javobgar INN raqami', 'Davlat boji kvitansiyasi'],
    facts: ['Mehnat shartnomasi mavjud', 'Kompensatsiya talabi ko‘rsatilgan']
  },
  evidence: [
    { name: 'shartnoma.pdf', status: '3 ta huquqiy fakt aniqlandi' },
    { name: 'dalil-rasm.jpg', status: 'Deepfake belgisi yo‘q' }
  ],
  decision: {
    id: 'Q-2026-001',
    status: 'Qoralama',
    executionStatus: 'Ijroga yuborilmagan'
  }
};

export const getDemoCase = () => {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved ? { ...defaultCase, ...JSON.parse(saved) } : structuredClone(defaultCase);
};

export const updateDemoCase = (patch) => {
  const current = getDemoCase();
  const next = {
    ...current,
    ...patch,
    validation: { ...current.validation, ...(patch.validation ?? {}) },
    decision: { ...current.decision, ...(patch.decision ?? {}) }
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const resetDemoCase = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCase));
  return structuredClone(defaultCase);
};
