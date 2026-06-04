const claimRows = [
  ['2026-001234', 'Mehnat nizosi', 'Sudga qabul qilindi', '22.02.2026'],
  ['2026-001209', 'Oilaviy nizosi', 'Dalillar tekshirilmoqda', '18.02.2026'],
  ['2026-001178', 'Iqtisodiy nizosi', 'Mediatsiya tavsiya qilindi', 'Kutilmoqda']
];

const userRows = [
  ['Dilshod Akramov', 'Fuqaro', 'OneID tasdiqlangan', 'Faol'],
  ['Karimov A.A.', 'Sudya', '2FA yoqilgan', 'Faol'],
  ['Rahimova M.S.', 'Sudya', 'Face-ID faol', 'Faol']
];

const auditRows = [
  ['14:32', 'Karimov A.', 'Judge', 'SmartJudge draft', 'Success'],
  ['14:30', 'Admin Root', 'Admin', 'Model setting update', 'Success'],
  ['14:21', 'Unknown', 'External', 'Login attempt', 'Blocked']
];

export const marketingPages = {
  features: {
    eyebrow: 'Imkoniyatlar',
    title: 'Sud jarayonlarini AI bilan tezlashtirish.',
    description:
      'ClaimValidator, MediatoBot, LexPredictor, EvidenceAnalyzer, JustiScribe va SmartJudge bir oqimda ishlaydi.',
    primaryAction: "Demo ko'rish",
    cards: [
      {
        title: 'Real-time stenogramma',
        text: 'Whisper streaming, speaker diarization va bookmarklar.'
      },
      { title: 'Pretsedent qidiruv', text: 'O‘xshash ishlar, ehtimol va qonuniy asoslar.' },
      {
        title: 'Qaror qoralamasi',
        text: 'Qonun moddalari va citation bilan tahrirlanadigan draft.'
      },
      { title: 'Dalil tahlili', text: 'PDF, rasm, audio, video va DOCX dalillarni tekshirish.' }
    ]
  },
  modules: {
    eyebrow: '10 ta modul',
    title: 'SmartCourt AI modullari.',
    description: 'TZda belgilangan 10 modul: stenogramma, prognoz, qaror, dalil va nazorat.',
    cards: [
      {
        title: 'ClaimValidator',
        text: 'Arizani tekshirish va sudga yo‘naltirish.',
        to: '/portal/claim-validator'
      },
      { title: 'MediatoBot', text: 'Sudgacha mediatsiya tavsiyalari.', to: '/portal/mediation' },
      {
        title: 'LexPredictor',
        text: 'Pretsedent qidiruv va yutish ehtimoli.',
        to: '/judge/ai-tools/lex-predictor'
      },
      {
        title: 'EvidenceAnalyzer',
        text: 'Dalillarni AI tahlil qilish.',
        to: '/judge/ai-tools/evidence-analyzer'
      },
      {
        title: 'JustiScribe',
        text: 'Sud majlislarining real-time stenogrammasi.',
        to: '/judge/hearing/live'
      },
      {
        title: 'SentencAI',
        text: 'Jazo proporsionalligi kalkulyatori.',
        to: '/judge/ai-tools/sentencai'
      },
      {
        title: 'SmartJudge',
        text: 'Qaror qoralamasi generatori.',
        to: '/judge/ai-tools/smart-judge'
      },
      {
        title: 'CorruptAlert',
        text: 'Aloqalar grafi va xavf signallari.',
        to: '/oversight/corruption/graph'
      },
      {
        title: 'AnonimusLaw',
        text: 'Qarorlarni anonimlashtirish.',
        to: '/oversight/anonymization'
      },
      { title: 'AutoExec', text: 'Qarorlarni avtomatik ijro etish.', to: '/oversight/auto-exec' }
    ]
  },
  architecture: {
    eyebrow: 'Texnik arxitektura',
    title: 'On-premise, integratsiyalangan va auditli.',
    description: 'Llama-3, Whisper, Neo4j, PostgreSQL, Qdrant, OneID va MIB/Bank/FHDYo bridge.',
    metrics: [
      { label: 'Vector DB', value: 'Qdrant' },
      { label: 'Graph DB', value: 'Neo4j' },
      { label: 'Relational DB', value: 'PostgreSQL' }
    ],
    cards: [
      {
        title: 'BFF pattern',
        text: 'Frontend API route yoki gateway orqali backend bilan ishlaydi.'
      },
      { title: 'WebSocket', text: 'Live majlis, audit log va AI streaming uchun.' },
      { title: 'Server state', text: 'TanStack Query bilan cache va refetch nazorati.' }
    ]
  },
  security: {
    eyebrow: 'Xavfsizlik',
    title: 'Konfidensiallik davlat darajasida.',
    description: 'On-Premise, ISO 27001, GDPR/UzPrivacy, audit log, access control va encryption.',
    cards: [
      { title: 'On-Premise', text: 'Sud infratuzilmasidan tashqariga ma’lumot chiqmaydi.' },
      {
        title: 'Audit log',
        text: 'Har bir foydalanuvchi harakati vaqt, rol va IP bilan saqlanadi.'
      },
      { title: 'Anonimlashtirish', text: 'Nashrdan oldin shaxsiy ma’lumotlar yashiriladi.' }
    ]
  },
  pricing: {
    eyebrow: 'B2G litsenziyalash',
    title: 'Sud tizimlari uchun litsenziyalash.',
    description: 'B2G xarid, modullar bo‘yicha aktivatsiya va on-premise support modeli.',
    cards: [
      { title: 'Core', text: 'Landing, portal, judge workspace va audit bazasi.' },
      { title: 'AI Suite', text: 'SmartJudge, LexPredictor, JustiScribe va EvidenceAnalyzer.' },
      { title: 'Oversight', text: 'CorruptAlert, ijro nazorati va ochiq reestr.' }
    ]
  },
  'case-studies': {
    eyebrow: 'Muvaffaqiyat hikoyalari',
    title: 'Sud jarayonlari tezlashgan ssenariylar.',
    description: 'Mock case-study kartalari real pilot ma’lumotlari uchun tayyor.',
    cards: [
      { title: 'Mehnat nizolari', text: 'Ariza qabul qilishdan qarorgacha bo‘lgan sikl qisqardi.' },
      { title: 'Iqtisodiy nizolar', text: 'Dalillar va shartnomalar avtomatik tahlil qilindi.' },
      { title: 'Ochiq reestr', text: 'Qarorlar anonimlashtirilgan holda nashr qilindi.' }
    ]
  },
  blog: {
    eyebrow: 'Blog',
    title: 'Yangiliklar va huquqiy texnologiya maqolalari.',
    description: 'Platforma yangiliklari, AI model yangilanishlari va xavfsizlik eslatmalari.',
    table: {
      columns: ['Sana', 'Mavzu', 'Bo‘lim'],
      rows: [
        ['03.06.2026', 'SmartJudge draft jarayoni', 'AI'],
        ['02.06.2026', 'AnonimusLaw nashr talablari', 'Security'],
        ['01.06.2026', 'OneID integratsiyasi', 'Portal']
      ]
    }
  },
  about: {
    eyebrow: 'Loyiha haqida',
    title: 'SmartCourt AI - O‘zbekiston sud tizimi uchun platforma.',
    description: 'Maqsad: adolat, tezlik va aniqlikni AI yordamida birlashtirish.',
    cards: [
      { title: 'Davlat darajasi', text: 'Rasmiy va ishonchli interfeyslar.' },
      { title: 'Minimal UI', text: 'Apple-style oq-qora, ko‘p negative space.' },
      { title: 'Role-based', text: 'Fuqaro, sudya, admin va nazorat xodimi uchun alohida oqimlar.' }
    ]
  },
  contact: {
    eyebrow: 'Aloqa',
    title: 'Demo va integratsiya uchun murojaat.',
    description: 'Sud tizimini raqamlashtirish bo‘yicha demo, support va texnik suhbat.',
    formFields: ['Tashkilot nomi', 'Mas’ul shaxs', 'Telefon', 'Email', 'Xabar'],
    primaryAction: 'Yuborish'
  },
  changelog: {
    eyebrow: 'Changelog',
    title: 'Platforma o‘zgarishlari.',
    description: 'Release, model yangilanishi va frontend o‘zgarishlari ro‘yxati.',
    timeline: [
      { title: '2026.06', text: 'Role-based frontend sahifalar to‘liq ulandi.' },
      { title: '2026.05', text: 'AI model monitoring va audit log dizayni.' },
      { title: '2026.04', text: 'Claim wizard va portal dashboard.' }
    ]
  },
  roadmap: {
    eyebrow: 'Roadmap',
    title: 'Keyingi platforma bosqichlari.',
    description: 'Frontenddan backend integratsiya, test coverage va deploymentgacha.',
    cards: [
      { title: 'Backend API', text: 'Auth, claims, cases, audit va AI endpoints.' },
      { title: 'Real-time', text: 'WebSocket live hearing va audit feed.' },
      { title: 'Deployment', text: 'On-premise build, CSP va environment config.' }
    ]
  },
  'press-kit': {
    eyebrow: 'Press kit',
    title: 'SmartCourt AI brend va loyiha materiallari.',
    description: 'Logo, loyiha tavsifi, press reliz va media kontaktlar uchun sahifa.',
    cards: [
      { title: 'Logo', text: 'SmartCourt AI wordmark va SC belgisi.' },
      { title: 'Boilerplate', text: 'O‘zbekiston sud tizimi uchun AI ekotizimi ta’rifi.' },
      { title: 'Kontakt', text: 'Demo va press savollari uchun aloqa.' }
    ]
  },
  careers: {
    eyebrow: 'Careers',
    title: 'Sud texnologiyalari bo‘yicha jamoa.',
    description: 'AI, frontend, security va integratsiya yo‘nalishlari.',
    cards: [
      { title: 'Frontend Engineer', text: 'Vue 3, design system va role-based apps.' },
      { title: 'AI Engineer', text: 'Llama-3, Whisper va legal retrieval.' },
      { title: 'Security Engineer', text: 'Audit, encryption va access control.' }
    ]
  }
};

export const portalPages = {
  '/portal/profile': {
    eyebrow: 'Profil',
    title: 'Shaxsiy profil',
    description: 'OneID’dan olingan fuqaro ma’lumotlari, kontaktlar va verifikatsiya holati.',
    primaryAction: 'Profilni tahrirlash',
    metrics: [
      { label: 'Arizalar', value: '3', note: 'aktiv' },
      { label: 'Xabarlar', value: '8', note: 'o‘qilmagan' },
      { label: 'Verifikatsiya', value: 'OneID' }
    ],
    formFields: ['F.I.Sh', 'PINFL', 'Telefon', 'Email', 'Manzil'],
    sideTitle: 'Xavfsizlik',
    sideItems: ['2FA tavsiya qilingan', 'SMS tasdiqlash faol', 'Email tasdiqlanmagan']
  },
  '/portal/profile/edit': {
    eyebrow: 'Profil',
    title: 'Profilni tahrirlash',
    description: 'Telefon, email, manzil va bildirishnoma kontaktlarini yangilash.',
    primaryAction: 'Saqlash',
    secondaryAction: 'Bekor qilish',
    formFields: ['Telefon', 'Email', 'Yashash manzili', 'Pochta indeksi']
  },
  '/portal/profile/security': {
    eyebrow: 'Xavfsizlik sozlamalari',
    title: 'Parol, 2FA va sessiyalar',
    description: 'Hisob xavfsizligi, aktiv sessiyalar va tasdiqlash usullari.',
    primaryAction: '2FA yoqish',
    cards: [
      { title: 'Parol', text: 'Oxirgi yangilanish: 15.01.2026.' },
      { title: 'SMS tasdiqlash', text: '+998 90 *** 00 00 raqamiga ulangan.' },
      { title: 'Aktiv sessiyalar', text: '2 ta qurilma tizimga kirgan.' }
    ]
  },
  '/portal/profile/notifications': {
    eyebrow: 'Bildirishnomalar',
    title: 'Email, push va SMS sozlamalari',
    description: 'Ariza holati, sud majlisi va xabarlar bo‘yicha bildirishnoma kanallari.',
    cards: [
      { title: 'Email', text: 'Ariza va to‘lov xabarlari.' },
      { title: 'Push', text: 'Dashboard va chat ogohlantirishlari.' },
      { title: 'SMS', text: 'Muhim sud sanalari va tasdiqlash kodlari.' }
    ]
  },
  '/portal/claims': {
    eyebrow: 'Arizalarim',
    title: 'Mening arizalarim ro‘yxati',
    description: 'Aktiv, kutilayotgan va yakunlangan arizalar bo‘yicha jadval.',
    primaryAction: 'Yangi ariza',
    table: { columns: ['Ariza', 'Turi', 'Holat', 'Keyingi sana'], rows: claimRows }
  },
  '/portal/claims/:id/track': {
    eyebrow: 'Holatni kuzatish',
    title: 'Ariza jarayoni tracking',
    description: 'Ariza qabul qilingandan keyingi statuslar va mas’ul shaxslar.',
    timeline: [
      { title: 'Qabul qilindi', text: 'Ariza sud tizimiga yuborildi.' },
      { title: 'Dalillar tekshirildi', text: 'AI dalil tahlili yakunlandi.' },
      { title: 'Majlis belgilanadi', text: 'Keyingi sana kutilmoqda.' }
    ]
  },
  '/portal/claims/:id/documents': {
    eyebrow: 'Hujjatlar',
    title: 'Ariza hujjatlari',
    description: 'Yuklangan fayllar, preview va AI tahlil xulosalari.',
    primaryAction: 'Fayl yuklash',
    table: {
      columns: ['Fayl', 'Turi', 'Hajmi', 'AI xulosa'],
      rows: [
        ['shartnoma.pdf', 'PDF', '2.4 MB', '3 ta huquqiy fakt'],
        ['dalil-rasm.jpg', 'JPG', '1.1 MB', 'Deepfake belgisi yo‘q'],
        ['audio.mp3', 'MP3', '8.5 MB', 'Transkripsiya tayyor']
      ]
    }
  },
  '/portal/claims/:id/timeline': {
    eyebrow: 'Vaqt jadvali',
    title: 'Ariza vaqt jadvali',
    description: 'Har bir hujjat, qaror va xabar timestamp bilan.',
    timeline: [
      { title: '15.01.2026', text: 'Ariza yaratildi.' },
      { title: '16.01.2026', text: 'Davlat boji tasdiqlandi.' },
      { title: '18.01.2026', text: 'Sudya Karimov A.A. biriktirildi.' }
    ]
  },
  '/portal/claims/:id/chat': {
    eyebrow: 'Xat-xabar',
    title: 'Sudya bilan xat-xabar',
    description: 'Ariza bo‘yicha rasmiy yozishmalar va fayl biriktirish.',
    primaryAction: 'Xabar yuborish',
    cards: [
      { title: 'Sudya', text: 'Qo‘shimcha dalillarni 3 kun ichida yuklang.', meta: '09:42' },
      { title: 'Fuqaro', text: 'Talab qilingan PDF hujjat yuklandi.', meta: '10:18' }
    ],
    formFields: ['Xabar matni', 'Fayl biriktirish']
  },
  '/portal/claims/:id/payment': {
    eyebrow: 'Davlat boji',
    title: 'Davlat boji to‘lovi',
    description: 'Davlat boji kalkulyatori, bank integratsiyasi va to‘lov holati.',
    metrics: [
      { label: 'Hisoblangan boj', value: '340 000', note: 'so‘m' },
      { label: 'Holat', value: 'Kutilmoqda' }
    ],
    primaryAction: 'To‘lov qilish',
    sideItems: ['Bank tizimlari integratsiyasi', 'Kvitansiya PDF', 'To‘lov tarixi']
  },
  '/portal/mediation': {
    eyebrow: 'Mediatsiya',
    title: 'Mediatsiya markazi',
    description: 'Sudgacha kelishuv takliflari, sessiyalar va muvaffaqiyat ehtimoli.',
    primaryAction: 'Mediatsiya boshlash',
    cards: [
      { title: 'Mehnat nizosi', text: '67% muvaffaqiyat ehtimoli.' },
      { title: 'Oilaviy nizosi', text: 'Tomonlar kelishuvga taklif qilingan.' },
      { title: 'Iqtisodiy nizosi', text: 'Mediator tayinlanmoqda.' }
    ]
  },
  '/portal/mediation/:id': {
    eyebrow: 'Mediatsiya sessiyasi',
    title: 'Real-time mediatsiya',
    description: 'Tomonlar, mediator va kelishuv bandlari bilan jonli sessiya.',
    cards: [
      { title: 'Mediator', text: 'Rahimova M.S. sessiyani boshqarmoqda.' },
      { title: 'Kelishuv bandi', text: 'To‘lov muddati 30 kun qilib belgilanmoqda.' },
      { title: 'AI tavsiya', text: 'Kelishuv ehtimoli: 71%.' }
    ]
  },
  '/portal/mediation/:id/agreement': {
    eyebrow: 'Kelishuv hujjati',
    title: 'Mediatsiya kelishuvi',
    description: 'Kelishuv shartlari, tomonlar imzosi va PDF eksport.',
    primaryAction: 'PDF eksport',
    formFields: ['Kelishuv sharti', 'Muddat', 'Tomonlar imzosi', 'Mediator xulosasi']
  },
  '/portal/lawyers': {
    eyebrow: 'Advokat qidirish',
    title: 'Advokatlar katalogi',
    description: 'Mutaxassislik, reyting va band qilish imkoniyati.',
    table: {
      columns: ['Advokat', 'Yo‘nalish', 'Reyting', 'Bandlik'],
      rows: [
        ['N. Sobirov', 'Mehnat nizolari', '4.9', 'Bugun'],
        ['M. Yusupova', 'Oilaviy nizolar', '4.8', 'Ertaga'],
        ['A. Tursunov', 'Iqtisodiy nizolar', '4.7', 'Hafta ichida']
      ]
    }
  },
  '/portal/lawyers/:id': {
    eyebrow: 'Advokat profili',
    title: 'Advokat profili',
    description: 'Mutaxassislik, tajriba, reyting va maslahat band qilish.',
    primaryAction: 'Maslahat band qilish',
    cards: [
      { title: 'Tajriba', text: '12 yil sud amaliyoti.' },
      { title: 'Yo‘nalish', text: 'Mehnat va fuqarolik nizolari.' },
      { title: 'Reyting', text: '4.9 / 5.' }
    ]
  },
  '/portal/lawyers/book': {
    eyebrow: 'Maslahat band qilish',
    title: 'Advokat maslahatini band qilish',
    description: 'Sana, vaqt, aloqa turi va ariza kontekstini tanlash.',
    primaryAction: 'Band qilish',
    formFields: ['Advokat', 'Sana', 'Vaqt', 'Maslahat turi', 'Izoh']
  },
  '/portal/library': {
    eyebrow: 'Huquqiy adabiyot',
    title: 'Huquqiy kutubxona',
    description: 'Qonunlar bazasi, anonim pretsedentlar va hujjat shablonlari.',
    cards: [
      { title: 'Qonunlar bazasi', text: 'Kodekslar va moddalar bo‘yicha qidiruv.' },
      { title: 'Pretsedentlar', text: 'Anonimlashtirilgan ishlar.' },
      { title: 'Shablonlar', text: 'Ariza va kelishuv hujjatlari.' }
    ]
  },
  '/portal/library/laws': {
    eyebrow: 'Qonunlar bazasi',
    title: 'Qonunlar va moddalar',
    description: 'Kodeks, modda va kalit so‘z bo‘yicha qidirish.',
    table: {
      columns: ['Kodeks', 'Modda', 'Mavzu'],
      rows: [
        ['Mehnat kodeksi', '161', 'Shartnomani bekor qilish'],
        ['Mehnat kodeksi', '167', 'Kompensatsiya'],
        ['Fuqarolik kodeksi', '985', 'Zararni qoplash']
      ]
    }
  },
  '/portal/library/precedents': {
    eyebrow: 'Pretsedentlar',
    title: 'Anonim pretsedentlar',
    description: 'O‘xshash ishlar, qaror natijalari va AI moslik darajasi.',
    table: {
      columns: ['Ish', 'Yo‘nalish', 'Moslik', 'Natija'],
      rows: [
        ['#2025-004982', 'Mehnat', '82%', 'Qisman qanoatlantirilgan'],
        ['#2024-010214', 'Mehnat', '77%', 'Qanoatlantirilgan'],
        ['#2023-006001', 'Fuqarolik', '74%', 'Rad etilgan']
      ]
    }
  },
  '/portal/library/templates': {
    eyebrow: 'Hujjat shablonlari',
    title: 'Ariza va kelishuv shablonlari',
    description: 'Sudga murojaat, mediatsiya va to‘lov hujjatlari uchun shablonlar.',
    cards: [
      { title: 'Da’vo arizasi', text: 'Fuqarolik va mehnat nizolari uchun.' },
      { title: 'Mediatsiya kelishuvi', text: 'Tomonlar kelishuvi uchun.' },
      { title: 'Dalil ro‘yxati', text: 'Hujjatlarni tartiblash uchun.' }
    ]
  },
  '/portal/notifications': {
    eyebrow: 'Bildirishnomalar',
    title: 'Bildirishnomalar markazi',
    description: 'Ariza, to‘lov, sud majlisi va chat xabarlari.',
    timeline: [
      { title: 'To‘lov tasdiqlandi', text: 'Davlat boji kvitansiyasi qabul qilindi.' },
      { title: 'Sudya biriktirildi', text: 'Karimov A.A. ishga tayinlandi.' },
      { title: 'Yangi xabar', text: 'Sudya qo‘shimcha dalil so‘radi.' }
    ]
  },
  '/portal/messages': {
    eyebrow: 'Xabarlar',
    title: 'Xabarlar',
    description: 'Sudya, mediator va tizim xabarlari.',
    cards: [
      { title: 'Sudya Karimov A.A.', text: 'Dalillar bo‘yicha so‘rov yuborildi.', meta: 'Bugun' },
      { title: 'MediatoBot', text: 'Kelishuv ehtimoli yangilandi.', meta: 'Kecha' },
      { title: 'Tizim', text: 'Profil xavfsizligini tekshiring.', meta: '2 kun oldin' }
    ]
  },
  '/portal/help': {
    eyebrow: 'Yordam',
    title: 'Yordam markazi',
    description: 'Ariza yaratish, davlat boji, mediatsiya va AI assistant bo‘yicha yordam.',
    cards: [
      { title: 'Ariza yaratish', text: '5 bosqichli wizarddan foydalanish.' },
      { title: 'To‘lov', text: 'Davlat boji va kvitansiya.' },
      { title: 'AI maslahatchi', text: 'Huquqiy savollar berish.' }
    ]
  },
  '/portal/help/faq': {
    eyebrow: 'FAQ',
    title: 'Tez-tez so‘raladigan savollar',
    description: 'Portal bo‘yicha eng ko‘p uchraydigan savollar.',
    cards: [
      { title: 'Qaysi sudga murojaat qilaman?', text: 'Nizo turi va manzilga qarab aniqlanadi.' },
      { title: 'Davlat boji qancha?', text: 'Da’vo summasi va imtiyozlar bo‘yicha hisoblanadi.' },
      { title: 'Mediatsiya majburiymi?', text: 'Ayrim holatlarda tavsiya sifatida beriladi.' }
    ]
  }
};

export const judgePages = {
  '/judge/cases': {
    eyebrow: 'Mening ishlarim',
    title: 'Sudya ishlar ro‘yxati',
    description: 'Aktiv, kutayotgan va yopilgan ishlarni boshqarish.',
    table: { columns: ['Ish', 'Holat', 'Tomonlar', 'Sana'], rows: claimRows }
  },
  '/judge/cases/active': {
    eyebrow: 'Aktiv ishlar',
    title: 'Aktiv ishlar',
    description: 'Bugungi ishlar, dalillar va majlisga tayyorlik.',
    metrics: [
      { label: 'Aktiv', value: '12' },
      { label: 'Bugungi majlis', value: '4' },
      { label: 'AI draft', value: '2' }
    ],
    table: { columns: ['Ish', 'Holat', 'LexPredictor', 'Keyingi majlis'], rows: claimRows }
  },
  '/judge/cases/pending': {
    eyebrow: 'Kutayotganlar',
    title: 'Kutayotgan ishlar',
    description: 'Dalil, to‘lov yoki tomonlardan javob kutayotgan ishlar.',
    table: { columns: ['Ish', 'Kutilayotgan amal', 'Mas’ul', 'Muddat'], rows: claimRows }
  },
  '/judge/cases/closed': {
    eyebrow: 'Yopilganlar',
    title: 'Yopilgan ishlar',
    description: 'Qaror qabul qilingan va arxivlangan ishlar.',
    table: { columns: ['Ish', 'Natija', 'Qaror sanasi', 'Arxiv'], rows: claimRows }
  },
  '/judge/cases/:id': {
    eyebrow: 'Ish kartochkasi',
    title: 'To‘liq ish fayli',
    description: 'Tomonlar, dalillar, majlislar, qaror va protokol bo‘limlari.',
    cards: [
      { title: 'Tomonlar', text: 'Da’vogar va javobgar ma’lumotlari.' },
      { title: 'Dalillar', text: 'PDF, rasm, audio va video dalillar.' },
      { title: 'AI tahlil', text: 'LexPredictor 73% ehtimol ko‘rsatmoqda.' }
    ]
  },
  '/judge/cases/:id/parties': {
    eyebrow: 'Tomonlar',
    title: 'Ish tomonlari',
    description: 'Da’vogar, javobgar, vakillar va kontaktlar.',
    table: {
      columns: ['Rol', 'F.I.Sh / Tashkilot', 'Kontakt', 'Holat'],
      rows: [
        ['Da’vogar', 'Dilshod Akramov', '+998 90 ***', 'Tasdiqlangan'],
        ['Javobgar', 'Orion LLC', 'info@orion.uz', 'Kutilmoqda'],
        ['Vakil', 'N. Sobirov', '+998 91 ***', 'Faol']
      ]
    }
  },
  '/judge/cases/:id/evidence': {
    eyebrow: 'Dalillar',
    title: 'Dalillar tahlili',
    description: 'EvidenceAnalyzer orqali dalillarni ko‘rish, preview va fakt ajratish.',
    table: {
      columns: ['Dalil', 'Turi', 'AI xulosa', 'Holat'],
      rows: [
        ['shartnoma.pdf', 'PDF', '3 ta huquqiy fakt', 'Qabul qilindi'],
        ['audio.mp3', 'Audio', 'Transkripsiya tayyor', 'Tekshirildi'],
        ['rasm.jpg', 'Rasm', 'Deepfake belgisi yo‘q', 'Tekshirildi']
      ]
    }
  },
  '/judge/cases/:id/hearings': {
    eyebrow: 'Majlislar',
    title: 'Majlislar ro‘yxati',
    description: 'Rejalashtirilgan va o‘tkazilgan sud majlislari.',
    table: {
      columns: ['Sana', 'Vaqt', 'Format', 'Holat'],
      rows: [
        ['22.02.2026', '10:00', 'Offline', 'Rejalashtirilgan'],
        ['15.02.2026', '09:30', 'Online', 'Yakunlangan']
      ]
    }
  },
  '/judge/cases/:id/decision': {
    eyebrow: 'Qaror tayyorlash',
    title: 'Qaror tayyorlash',
    description: 'SmartJudge qoralamasi, qonun moddalari va eksport.',
    primaryAction: 'Qoralama yaratish',
    formFields: ['Qaror matni', 'Qonun moddalari', 'Pretsedentlar', 'Eksport formati']
  },
  '/judge/cases/:id/protocol': {
    eyebrow: 'Protokol',
    title: 'JustiScribe protokoli',
    description: 'Majlis stenogrammasi, speaker diarization va bookmarklar.',
    timeline: [
      { title: '09:20 Sudya', text: 'Tomonlar shaxsi tasdiqlandi.' },
      { title: '09:31 Javobgar', text: '50 000 000 so‘m qarz qisman tan olindi.' },
      { title: '09:38 AI', text: '167-modda eslatildi.' }
    ]
  },
  '/judge/hearing/:id/recording': {
    eyebrow: 'Yozuvlar arxivi',
    title: 'Sud majlisi yozuvlari',
    description: 'Audio/video yozuv, waveform va playback nazorati.',
    cards: [
      { title: 'Audio', text: 'WaveSurfer waveform bilan playback.' },
      { title: 'Video', text: 'Subtitle va speed control.' },
      { title: 'Bookmark', text: 'Muhim daqiqalar ro‘yxati.' }
    ]
  },
  '/judge/hearing/:id/transcript': {
    eyebrow: 'Stenogramma',
    title: 'Majlis stenogrammasi',
    description: 'Speaker diarization, auto-scroll va AI insights.',
    timeline: [
      { title: 'Sudya', text: 'Majlis ochiq deb e’lon qilindi.' },
      { title: 'Da’vogar', text: 'Shartnoma imzolanganini tasdiqladi.' },
      { title: 'AI', text: 'Yangi raqamli fakt topildi.' }
    ]
  },
  '/judge/ai-tools': {
    eyebrow: 'AI vositalari',
    title: 'Sudya AI hub',
    description: 'SmartJudge, LexPredictor, Evidence Analyzer, SentencAI va AnonimusLaw.',
    cards: [
      { title: 'SmartJudge', text: 'Qaror qoralamasi.' },
      { title: 'LexPredictor', text: 'Pretsedent va ehtimol.' },
      { title: 'Evidence Analyzer', text: 'Dalil tahlili.' },
      { title: 'SentencAI', text: 'Jazo kalkulyatori.' },
      { title: 'AnonimusLaw', text: 'Anonimlashtirish.' }
    ]
  },
  '/judge/ai-tools/lex-predictor': {
    eyebrow: 'LexPredictor',
    title: 'Pretsedent qidiruv',
    description: 'O‘xshash ishlar, yutish ehtimoli va tavsiyalar.',
    metrics: [
      { label: 'Mos ishlar', value: '142' },
      { label: 'Ehtimol', value: '73%' },
      { label: 'Tavsiya', value: 'Dalil' }
    ],
    table: {
      columns: ['Pretsedent', 'Moslik', 'Natija', 'Moddalar'],
      rows: [
        ['#2025-004982', '82%', 'Qisman qanoatlantirilgan', '161, 167'],
        ['#2024-010214', '77%', 'Qanoatlantirilgan', '985'],
        ['#2023-006001', '74%', 'Rad etilgan', '167']
      ]
    }
  },
  '/judge/ai-tools/evidence-analyzer': {
    eyebrow: 'Evidence Analyzer',
    title: 'Dalillarni AI tahlil qilish',
    description: 'Hujjat, rasm, audio va video dalillardan huquqiy faktlarni ajratish.',
    table: {
      columns: ['Fayl', 'Aniqlangan fakt', 'Xavf', 'Holat'],
      rows: [
        ['shartnoma.pdf', '3 ta fakt', 'Past', 'Tasdiqlandi'],
        ['audio.mp3', '2 ta e’tirof', 'O‘rta', 'Ko‘rib chiqish'],
        ['rasm.jpg', 'Deepfake yo‘q', 'Past', 'Tasdiqlandi']
      ]
    }
  },
  '/judge/ai-tools/sentencai': {
    eyebrow: 'SentencAI',
    title: 'Jazo kalkulyatori',
    description: 'Jazo proporsionalligi, yengillashtiruvchi va og‘irlashtiruvchi omillar.',
    formFields: ['Ish turi', 'Modda', 'Og‘irlik darajasi', 'Yengillashtiruvchi omillar'],
    sideItems: ['Proporsionallik tekshiruvi', 'O‘xshash qarorlar', 'Tavsiya diapazoni']
  },
  '/judge/ai-tools/anonimus-law': {
    eyebrow: 'AnonimusLaw',
    title: 'Anonimlashtirish vositasi',
    description: 'Qaror matnidagi shaxsiy ma’lumotlarni nashrdan oldin yashirish.',
    primaryAction: 'Anonimlashtirish',
    formFields: ['Qaror matni', 'Yashiriladigan maydonlar', 'Nashr format']
  },
  '/judge/precedents': {
    eyebrow: 'Pretsedentlar',
    title: 'Pretsedentlar kutubxonasi',
    description: 'Anonimlashtirilgan ishlar va moslik darajalari.',
    table: {
      columns: ['Ish', 'Yo‘nalish', 'Moslik', 'Natija'],
      rows: [
        ['#2025-004982', 'Mehnat', '82%', 'Qisman'],
        ['#2024-010214', 'Iqtisodiy', '77%', 'Qanoatlantirilgan']
      ]
    }
  },
  '/judge/laws': {
    eyebrow: 'Qonunchilik',
    title: 'Qonunchilik bazasi',
    description: 'Kodeks, modda va tavsif bo‘yicha qidiruv.',
    table: {
      columns: ['Kodeks', 'Modda', 'Tavsif'],
      rows: [
        ['Mehnat kodeksi', '161', 'Bekor qilish'],
        ['Fuqarolik kodeksi', '985', 'Zararni qoplash']
      ]
    }
  },
  '/judge/templates': {
    eyebrow: 'Shablonlar',
    title: 'Hujjat shablonlari',
    description: 'Qaror, ajrim, protokol va xabarnoma shablonlari.',
    cards: [
      { title: 'Qaror', text: 'Rasmiy qaror matni shabloni.' },
      { title: 'Ajrim', text: 'Sud ajrimi shabloni.' },
      { title: 'Protokol', text: 'Majlis protokoli shabloni.' }
    ]
  },
  '/judge/schedule': {
    eyebrow: 'Jadval',
    title: 'Sudya jadvali',
    description: 'Kalendar, hafta va kunlik ko‘rinishlar.',
    cards: [
      { title: 'Oylik ko‘rinish', text: 'Oy bo‘yicha majlislar.' },
      { title: 'Haftalik ko‘rinish', text: 'Hafta yuklamasi.' },
      { title: 'Kunlik ko‘rinish', text: 'Bugungi majlislar.' }
    ]
  },
  '/judge/schedule/calendar': {
    eyebrow: 'Kalendar',
    title: 'Oylik ko‘rinish',
    description: 'Oylik sud majlislari va ish muddatlari.',
    table: { columns: ['Sana', 'Ish', 'Vaqt', 'Holat'], rows: claimRows }
  },
  '/judge/schedule/week': {
    eyebrow: 'Hafta',
    title: 'Haftalik jadval',
    description: 'Haftalik sud majlislari va tayyorgarlik ishlari.',
    table: { columns: ['Kun', 'Majlis', 'Ish', 'Vaqt'], rows: claimRows }
  },
  '/judge/schedule/day': {
    eyebrow: 'Kun',
    title: 'Kunlik jadval',
    description: 'Bugungi majlislar, tanaffus va qaror tayyorlash bloklari.',
    timeline: [
      { title: '09:00', text: 'Ish #2026-001234 majlisi.' },
      { title: '11:30', text: 'Dalillarni ko‘rib chiqish.' },
      { title: '15:00', text: 'SmartJudge draft review.' }
    ]
  },
  '/judge/statistics': {
    eyebrow: 'Statistika',
    title: 'Mening statistikam',
    description: 'Ish yuklamasi, qaror muddati va AI foydalanish ko‘rsatkichlari.',
    metrics: [
      { label: 'Ishlar', value: '128' },
      { label: 'O‘rtacha muddat', value: '18 kun' },
      { label: 'AI draft', value: '64' }
    ]
  },
  '/judge/colleagues': {
    eyebrow: 'Hamkasblar',
    title: 'Hamkasblar',
    description: 'Sud ichidagi hamkasblar, xabar va ish yuklamasi.',
    table: {
      columns: ['Sudya', 'Yo‘nalish', 'Aktiv ishlar', 'Holat'],
      rows: [
        ['Karimov A.A.', 'Mehnat', '12', 'Faol'],
        ['Rahimova M.S.', 'Oilaviy', '9', 'Faol'],
        ['Aliyev F.N.', 'Iqtisodiy', '15', 'Majlisda']
      ]
    }
  },
  '/judge/messages': {
    eyebrow: 'Xabarlar',
    title: 'Sudya xabarlari',
    description: 'Fuqaro, hamkasb va tizim xabarlari.',
    cards: [
      { title: 'Fuqaro', text: 'Qo‘shimcha dalil yuklandi.' },
      { title: 'Admin', text: 'Whisper modeli yangilandi.' },
      { title: 'Tizim', text: 'Majlis 10:00 ga belgilandi.' }
    ]
  },
  '/judge/notifications': {
    eyebrow: 'Bildirishnomalar',
    title: 'Sudya bildirishnomalari',
    description: 'Majlis, ish va AI signal bildirishnomalari.',
    timeline: [
      { title: 'AI signal', text: 'Yangi fakt aniqlangan.' },
      { title: 'Majlis', text: '22.02.2026 10:00.' },
      { title: 'Audit', text: 'Qaror draft eksport qilindi.' }
    ]
  },
  '/judge/profile': {
    eyebrow: 'Profil',
    title: 'Sudya profili',
    description: 'Lavozim, sud, kontakt va xavfsizlik holati.',
    formFields: ['F.I.Sh', 'Sud', 'Lavozim', 'Telefon', 'Email']
  },
  '/judge/settings': {
    eyebrow: 'Sozlamalar',
    title: 'Sudya sozlamalari',
    description: 'Til, theme, bildirishnoma va AI yordam sozlamalari.',
    cards: [
      { title: 'Til', text: 'UZ lotin / UZ kirill / RU / EN.' },
      { title: 'AI yordam', text: 'Live insight va draft sozlamalari.' },
      { title: 'Xavfsizlik', text: 'Face-ID, parol va 2FA.' }
    ]
  }
};

export const adminPages = {
  '/admin/users': {
    eyebrow: 'Foydalanuvchilar',
    title: 'Barcha foydalanuvchilar',
    description: 'Fuqarolar, sudyalar, advokatlar va adminlar.',
    primaryAction: 'Foydalanuvchi qo‘shish',
    table: { columns: ['Foydalanuvchi', 'Rol', 'Verifikatsiya', 'Holat'], rows: userRows }
  },
  '/admin/users/citizens': {
    eyebrow: 'Fuqarolar',
    title: 'Fuqarolar ro‘yxati',
    description: 'OneID tasdiqlangan fuqarolar va portal faolligi.',
    table: { columns: ['Fuqaro', 'Arizalar', 'OneID', 'Holat'], rows: userRows }
  },
  '/admin/users/judges': {
    eyebrow: 'Sudyalar',
    title: 'Sudyalar ro‘yxati',
    description: 'Sudya profillari, sudlar va xavfsizlik holati.',
    table: { columns: ['Sudya', 'Sud', '2FA', 'Holat'], rows: userRows }
  },
  '/admin/users/lawyers': {
    eyebrow: 'Advokatlar',
    title: 'Advokatlar ro‘yxati',
    description: 'Advokat profillari, reytinglar va band qilish holati.',
    table: {
      columns: ['Advokat', 'Yo‘nalish', 'Reyting', 'Holat'],
      rows: [
        ['N. Sobirov', 'Mehnat', '4.9', 'Faol'],
        ['M. Yusupova', 'Oilaviy', '4.8', 'Faol'],
        ['A. Tursunov', 'Iqtisodiy', '4.7', 'Faol']
      ]
    }
  },
  '/admin/users/admins': {
    eyebrow: 'Adminlar',
    title: 'Admin foydalanuvchilar',
    description: 'Super admin va tizim administratorlari.',
    table: { columns: ['Admin', 'Ruxsat', 'Oxirgi kirish', 'Holat'], rows: userRows }
  },
  '/admin/users/:id': {
    eyebrow: 'Foydalanuvchi profili',
    title: 'Foydalanuvchi profili',
    description: 'Profil, rol, ruxsatlar va faollik logi.',
    cards: [
      { title: 'Profil', text: 'Shaxsiy va kontakt ma’lumotlari.' },
      { title: 'Ruxsatlar', text: 'Rol va permissionlar.' },
      { title: 'Faollik', text: 'Audit log va sessiyalar.' }
    ]
  },
  '/admin/users/:id/permissions': {
    eyebrow: 'Ruxsatlar',
    title: 'Foydalanuvchi ruxsatlari',
    description: 'Role-based access control va modul huquqlari.',
    cards: [
      { title: 'Portal', text: 'Claim va chat ruxsatlari.' },
      { title: 'Judge', text: 'Case, hearing va AI tools.' },
      { title: 'Admin', text: 'Users, models va audit.' }
    ]
  },
  '/admin/users/:id/activity': {
    eyebrow: 'Faollik logi',
    title: 'Foydalanuvchi faolligi',
    description: 'So‘nggi login, harakatlar va xavfsizlik hodisalari.',
    table: { columns: ['Vaqt', 'Foydalanuvchi', 'Rol', 'Harakat', 'Holat'], rows: auditRows }
  },
  '/admin/cases': {
    eyebrow: 'Barcha ishlar',
    title: 'Ishlar reestri',
    description: 'Barcha sud ishlari, status va sudya bo‘yicha nazorat.',
    table: { columns: ['Ish', 'Turi', 'Holat', 'Sudya'], rows: claimRows }
  },
  '/admin/cases/analytics': {
    eyebrow: 'Ishlar analitikasi',
    title: 'Ishlar bo‘yicha analitika',
    description: 'Taqsimlanish, muddatlar va sud yuklamasi.',
    metrics: [
      { label: 'Bugungi ishlar', value: '4,812' },
      { label: 'Aktiv', value: '18,420' },
      { label: 'Yopilgan', value: '128,900' }
    ]
  },
  '/admin/courts': {
    eyebrow: 'Sudlar',
    title: 'Sudlar ro‘yxati',
    description: 'Hudud, sudyalar va statistikalar.',
    table: {
      columns: ['Sud', 'Hudud', 'Sudyalar', 'Ishlar'],
      rows: [
        ['Toshkent shahar sudi', 'Toshkent', '42', '12,800'],
        ['Samarqand viloyat sudi', 'Samarqand', '31', '8,420'],
        ['Farg‘ona viloyat sudi', 'Farg‘ona', '28', '7,910']
      ]
    }
  },
  '/admin/courts/:id': {
    eyebrow: 'Sud kartochkasi',
    title: 'Sud kartochkasi',
    description: 'Sud ma’lumotlari, sudyalar va statistikalar.',
    cards: [
      { title: 'Sudyalar', text: '42 nafar sudya.' },
      { title: 'Aktiv ishlar', text: '1,284 ta ish.' },
      { title: 'O‘rtacha muddat', text: '18 kun.' }
    ]
  },
  '/admin/courts/:id/judges': {
    eyebrow: 'Sud sudyalari',
    title: 'Sud sudyalari',
    description: 'Tanlangan suddagi sudyalar va ish yuklamasi.',
    table: { columns: ['Sudya', 'Yo‘nalish', 'Aktiv ishlar', 'Holat'], rows: userRows }
  },
  '/admin/courts/:id/statistics': {
    eyebrow: 'Sud statistikasi',
    title: 'Sud statistikasi',
    description: 'Ishlar, muddat, AI foydalanish va qaror natijalari.',
    metrics: [
      { label: 'Ishlar', value: '12,800' },
      { label: 'AI draft', value: '4,200' },
      { label: 'O‘rtacha muddat', value: '18 kun' }
    ]
  },
  '/admin/ai-models/llama-3': {
    eyebrow: 'Llama-3',
    title: 'Llama-3 sozlamalari',
    description: 'Legal model konfiguratsiyasi, versiya va token monitoring.',
    formFields: ['Model versiyasi', 'Temperature', 'Max tokens', 'System prompt']
  },
  '/admin/ai-models/whisper': {
    eyebrow: 'Whisper',
    title: 'Whisper sozlamalari',
    description: 'Speech-to-text, diarization va audio quality sozlamalari.',
    formFields: ['Model', 'Language', 'Diarization', 'Streaming mode']
  },
  '/admin/ai-models/training': {
    eyebrow: 'Qayta o‘qitish',
    title: 'AI model training',
    description: 'Dataset, training queue va model evaluation.',
    table: {
      columns: ['Job', 'Model', 'Dataset', 'Holat'],
      rows: [
        ['TR-001', 'LexPredictor', 'Pretsedentlar', 'Running'],
        ['TR-002', 'Llama-3 Legal', 'Qarorlar', 'Queued']
      ]
    }
  },
  '/admin/ai-models/logs': {
    eyebrow: 'AI logs',
    title: 'AI model loglari',
    description: 'So‘rovlar, tokenlar, xatoliklar va latency.',
    table: { columns: ['Vaqt', 'Model', 'Harakat', 'Holat'], rows: auditRows }
  },
  '/admin/security': {
    eyebrow: 'Xavfsizlik',
    title: 'Xavfsizlik markazi',
    description: 'Audit log, access control, encryption va incidents.',
    cards: [
      { title: 'Audit log', text: 'Real-time harakatlar.' },
      { title: 'Access control', text: 'Role-based permissions.' },
      { title: 'Encryption', text: 'Shifrlash sozlamalari.' },
      { title: 'Incidents', text: 'Hodisa boshqaruvi.' }
    ]
  },
  '/admin/security/access-control': {
    eyebrow: 'Kirish nazorati',
    title: 'Access control',
    description: 'Rol, ruxsat va modulga kirish siyosatlari.',
    cards: [
      { title: 'Citizen', text: 'Portal va claim ruxsatlari.' },
      { title: 'Judge', text: 'Case va AI tools ruxsatlari.' },
      { title: 'Admin', text: 'System va security ruxsatlari.' }
    ]
  },
  '/admin/security/encryption': {
    eyebrow: 'Shifrlash',
    title: 'Encryption sozlamalari',
    description: 'Data at rest, transport va key rotation siyosatlari.',
    cards: [
      { title: 'At rest', text: 'Database va fayllar shifrlangan.' },
      { title: 'Transport', text: 'HTTPS only va secure headers.' },
      { title: 'Key rotation', text: 'Kalitlarni davriy almashtirish.' }
    ]
  },
  '/admin/security/incidents': {
    eyebrow: 'Hodisalar',
    title: 'Security incidents',
    description: 'Blocked login, suspicious activity va response flow.',
    table: { columns: ['Vaqt', 'Hodisa', 'Manba', 'Holat'], rows: auditRows }
  },
  '/admin/integrations': {
    eyebrow: 'Integratsiyalar',
    title: 'Tashqi tizim integratsiyalari',
    description: 'OneID, bank tizimlari, MIB va FHDYo.',
    cards: [
      { title: 'OneID', text: 'Fuqaroni tasdiqlash.' },
      { title: 'Banklar', text: 'Davlat boji to‘lovlari.' },
      { title: 'MIB', text: 'Ijro jarayoni.' },
      { title: 'FHDYo', text: 'Shaxsiy holat ma’lumotlari.' }
    ]
  },
  '/admin/integrations/oneid': {
    eyebrow: 'OneID',
    title: 'OneID integratsiyasi',
    description: 'Fuqarolarni autentifikatsiya va verifikatsiya qilish.',
    metrics: [
      { label: 'Bugungi verify', value: '2,104' },
      { label: 'Success', value: '99.1%' },
      { label: 'Latency', value: '180ms' }
    ]
  },
  '/admin/integrations/banks': {
    eyebrow: 'Bank tizimlari',
    title: 'Bank integratsiyalari',
    description: 'Davlat boji, kvitansiya va to‘lov statuslari.',
    table: {
      columns: ['Bank', 'Holat', 'To‘lovlar', 'Latency'],
      rows: [
        ['Bank A', 'Faol', '1,204', '210ms'],
        ['Bank B', 'Faol', '982', '240ms']
      ]
    }
  },
  '/admin/integrations/mib': {
    eyebrow: 'MIB',
    title: 'MIB integratsiyasi',
    description: 'Qaror ijrosi, status va navbat.',
    table: {
      columns: ['Qaror', 'Holat', 'Ijrochi', 'Muddat'],
      rows: [
        ['Q-2026-001', 'Ijroda', 'MIB', '18.02.2026'],
        ['Q-2026-002', 'Bajarildi', 'MIB', '20.02.2026']
      ]
    }
  },
  '/admin/integrations/fhdyo': {
    eyebrow: 'FHDYo',
    title: 'FHDYo integratsiyasi',
    description: 'Fuqarolik holati dalolatnomalari bo‘yicha tekshiruv.',
    metrics: [
      { label: 'So‘rovlar', value: '842' },
      { label: 'Success', value: '98.4%' },
      { label: 'Errors', value: '6' }
    ]
  },
  '/admin/database': {
    eyebrow: 'Ma’lumotlar bazasi',
    title: 'Database monitoring',
    description: 'PostgreSQL, Qdrant, Neo4j va backup boshqaruvi.',
    cards: [
      { title: 'PostgreSQL', text: 'Relational data monitoring.' },
      { title: 'Qdrant', text: 'Vector search monitoring.' },
      { title: 'Neo4j', text: 'Graph DB monitoring.' },
      { title: 'Backups', text: 'Backup boshqaruvi.' }
    ]
  },
  '/admin/database/postgresql': {
    eyebrow: 'PostgreSQL',
    title: 'PostgreSQL monitoring',
    description: 'Connection, query latency va storage.',
    metrics: [
      { label: 'Connections', value: '128' },
      { label: 'Latency', value: '22ms' },
      { label: 'Storage', value: '64%' }
    ]
  },
  '/admin/database/qdrant': {
    eyebrow: 'Qdrant',
    title: 'Qdrant Vector DB',
    description: 'Legal embeddings, vector search va indexing.',
    metrics: [
      { label: 'Vectors', value: '8.4M' },
      { label: 'Search p95', value: '42ms' },
      { label: 'Collections', value: '12' }
    ]
  },
  '/admin/database/neo4j': {
    eyebrow: 'Neo4j',
    title: 'Neo4j Graph DB',
    description: 'CorruptAlert aloqalar grafi va relationship query.',
    metrics: [
      { label: 'Nodes', value: '1.2M' },
      { label: 'Edges', value: '4.8M' },
      { label: 'Risk alerts', value: '5' }
    ]
  },
  '/admin/database/backups': {
    eyebrow: 'Backups',
    title: 'Backup boshqaruvi',
    description: 'Backup jadvali, restore point va retention.',
    table: {
      columns: ['Backup', 'Turi', 'Sana', 'Holat'],
      rows: [
        ['BK-001', 'Full', '03.06.2026', 'Success'],
        ['BK-002', 'Incremental', '02.06.2026', 'Success']
      ]
    }
  },
  '/admin/system': {
    eyebrow: 'Tizim',
    title: 'Tizim boshqaruvi',
    description: 'Health, performance va server loglari.',
    cards: [
      { title: 'Health', text: 'Tizim salomatligi.' },
      { title: 'Performance', text: 'Unumdorlik monitoring.' },
      { title: 'Logs', text: 'Server loglari.' }
    ]
  },
  '/admin/system/health': {
    eyebrow: 'Health',
    title: 'Tizim salomatligi',
    description: 'Service uptime, errors va dependency status.',
    metrics: [
      { label: 'Uptime', value: '99.98%' },
      { label: 'Errors', value: '4' },
      { label: 'Services', value: '12/12' }
    ]
  },
  '/admin/system/performance': {
    eyebrow: 'Performance',
    title: 'Tizim unumdorligi',
    description: 'Response time, throughput va server load.',
    metrics: [
      { label: 'p95', value: '180ms' },
      { label: 'RPS', value: '1,240' },
      { label: 'Load', value: '42%' }
    ]
  },
  '/admin/system/logs': {
    eyebrow: 'Server loglari',
    title: 'Server loglari',
    description: 'Backend, AI va integration loglari.',
    table: { columns: ['Vaqt', 'Service', 'Log', 'Holat'], rows: auditRows }
  },
  '/admin/billing': {
    eyebrow: 'Billing',
    title: 'To‘lovlar va litsenziyalar',
    description: 'B2G litsenziya, modul aktivatsiyasi va billing tarixi.',
    table: {
      columns: ['Litsenziya', 'Modullar', 'Muddat', 'Holat'],
      rows: [
        ['SC-Core', 'Portal, Judge', '2026', 'Faol'],
        ['SC-AI', 'SmartJudge, Whisper', '2026', 'Faol']
      ]
    }
  },
  '/admin/notifications/broadcast': {
    eyebrow: 'Broadcast',
    title: 'Ommaviy bildirishnoma',
    description: 'Foydalanuvchi guruhlari uchun email, push va SMS xabar.',
    primaryAction: 'Yuborish',
    formFields: ['Auditoriya', 'Kanal', 'Sarlavha', 'Matn']
  },
  '/admin/settings': {
    eyebrow: 'Sozlamalar',
    title: 'Tizim sozlamalari',
    description: 'Til, xavfsizlik, AI, integratsiya va audit konfiguratsiyasi.',
    cards: [
      { title: 'Security', text: 'CSP, CSRF, access control.' },
      { title: 'AI', text: 'Model va token sozlamalari.' },
      { title: 'Integrations', text: 'OneID, banks, MIB, FHDYo.' }
    ]
  }
};

export const oversightPages = {
  '/oversight/decisions': {
    eyebrow: 'Qarorlar reestri',
    title: 'Qarorlar reestri',
    description: 'Sud qarorlari, ijro holati va anonimlashtirish statusi.',
    table: {
      columns: ['Qaror', 'Ish', 'Holat', 'Ijro'],
      rows: [
        ['Q-2026-001', '2026-001234', 'Ijroda', 'MIB'],
        ['Q-2026-002', '2026-001209', 'Kutilmoqda', 'Bank']
      ]
    }
  },
  '/oversight/decisions/:id': {
    eyebrow: 'Qaror tafsilotlari',
    title: 'Qaror tafsilotlari',
    description: 'Qaror matni, ijro statusi, integratsiyalar va audit.',
    cards: [
      { title: 'Ijro', text: 'MIB jarayonida.' },
      { title: 'To‘lov', text: 'Bank bloklash tekshirildi.' },
      { title: 'Anonimlashtirish', text: 'Nashrga tayyor.' }
    ]
  },
  '/oversight/decisions/:id/execute': {
    eyebrow: 'Ijro jarayoni',
    title: 'Qarorni ijroga yuborish',
    description: 'MIB, bank va FHDYo integratsiyalari orqali ijro bosqichlari.',
    primaryAction: 'Ijroga yuborish',
    timeline: [
      { title: 'Qaror tasdiqlandi', text: 'Sud qarori kuchga kirdi.' },
      { title: 'MIBga yuborildi', text: 'Ijro jarayoni ochildi.' },
      { title: 'Bank tekshiruvi', text: 'Hisoblar bo‘yicha so‘rov yuborildi.' }
    ]
  },
  '/oversight/execution': {
    eyebrow: 'Ijro nazorati',
    title: 'Ijro nazorati',
    description: 'Navbat, aktiv va bajarilgan ijro jarayonlari.',
    metrics: [
      { label: 'Navbat', value: '184' },
      { label: 'Aktiv', value: '942' },
      { label: 'Bajarilgan', value: '8,210' }
    ]
  },
  '/oversight/execution/queue': {
    eyebrow: 'Navbat',
    title: 'Ijro navbati',
    description: 'Ijroga yuborilishi kutilayotgan qarorlar.',
    table: {
      columns: ['Qaror', 'Mas’ul', 'Muddat', 'Holat'],
      rows: [
        ['Q-2026-001', 'MIB', '18.02.2026', 'Kutilmoqda'],
        ['Q-2026-002', 'Bank', '20.02.2026', 'Kutilmoqda']
      ]
    }
  },
  '/oversight/execution/active': {
    eyebrow: 'Aktiv jarayonlar',
    title: 'Aktiv ijro jarayonlari',
    description: 'Ijroda bo‘lgan qarorlar va integratsiya statuslari.',
    table: {
      columns: ['Qaror', 'Integratsiya', 'Progress', 'Holat'],
      rows: [
        ['Q-2026-001', 'MIB', '64%', 'Ijroda'],
        ['Q-2026-002', 'Bank', '41%', 'Tekshiruvda']
      ]
    }
  },
  '/oversight/execution/completed': {
    eyebrow: 'Bajarilgan',
    title: 'Bajarilgan ijro jarayonlari',
    description: 'Yakunlangan qarorlar va ijro hujjatlari.',
    table: {
      columns: ['Qaror', 'Yakun sana', 'Ijrochi', 'Natija'],
      rows: [
        ['Q-2026-010', '01.06.2026', 'MIB', 'Bajarildi'],
        ['Q-2026-011', '02.06.2026', 'Bank', 'Bajarildi']
      ]
    }
  },
  '/oversight/corruption': {
    eyebrow: 'Korrupsiya monitoringi',
    title: 'CorruptAlert monitoring',
    description: 'Ogohlantirishlar, aloqalar grafi va hisobotlar.',
    cards: [
      { title: 'Alerts', text: '5 ta xavf signali.' },
      { title: 'Graph', text: 'Neo4j aloqalar grafi.' },
      { title: 'Reports', text: 'Korrupsiya monitoring hisobotlari.' }
    ]
  },
  '/oversight/corruption/alerts': {
    eyebrow: 'CorruptAlert',
    title: 'CorruptAlert ogohlantirishlari',
    description: 'Aloqa darajasi, anomaliya turi va xavf balli.',
    table: {
      columns: ['Signal', 'Tugun', 'Risk', 'Holat'],
      rows: [
        ['CA-001', 'S. Karimov', '84', 'Yangi'],
        ['CA-002', 'Orion LLC', '71', 'Tekshiruvda']
      ]
    }
  },
  '/oversight/corruption/reports': {
    eyebrow: 'Hisobotlar',
    title: 'Korrupsiya monitoring hisobotlari',
    description: 'Risk signallari, graph xulosalari va eksport.',
    primaryAction: 'Hisobot yaratish',
    table: {
      columns: ['Hisobot', 'Davr', 'Signallar', 'Holat'],
      rows: [
        ['CR-2026-06', 'Iyun', '5', 'Tayyor'],
        ['CR-2026-05', 'May', '8', 'Arxiv']
      ]
    }
  },
  '/oversight/anonymization': {
    eyebrow: 'AnonimusLaw',
    title: 'Anonimlashtirish paneli',
    description: 'Qarorlarni nashrdan oldin shaxsiy ma’lumotlardan tozalash.',
    cards: [
      { title: 'Queue', text: '128 ta qaror navbatda.' },
      { title: 'Published', text: '8,420 ta qaror nashr qilingan.' },
      { title: 'Rules', text: 'PINFL, telefon, manzil yashiriladi.' }
    ]
  },
  '/oversight/anonymization/queue': {
    eyebrow: 'Anonimlashtirish navbati',
    title: 'Anonimlashtirish navbati',
    description: 'Nashrdan oldin tekshirilayotgan qarorlar.',
    table: {
      columns: ['Qaror', 'Topilgan PII', 'Holat', 'Muddat'],
      rows: [
        ['Q-2026-001', '12', 'Tekshiruvda', 'Bugun'],
        ['Q-2026-002', '8', 'Kutilmoqda', 'Ertaga']
      ]
    }
  },
  '/oversight/anonymization/published': {
    eyebrow: 'Nashr qilinganlar',
    title: 'Nashr qilingan qarorlar',
    description: 'Anonimlashtirilgan va ochiq reestrga chiqarilgan qarorlar.',
    table: {
      columns: ['Qaror', 'Nashr sana', 'PII', 'Holat'],
      rows: [
        ['Q-2026-010', '01.06.2026', 'Yashirilgan', 'Published'],
        ['Q-2026-011', '02.06.2026', 'Yashirilgan', 'Published']
      ]
    }
  },
  '/oversight/public-registry': {
    eyebrow: 'Ochiq reestr',
    title: 'Ochiq sud qarorlari reestri',
    description: 'Anonimlashtirilgan qarorlar va qidiruv.',
    table: {
      columns: ['Qaror', 'Yo‘nalish', 'Sana', 'Holat'],
      rows: [
        ['Q-2026-010', 'Mehnat', '01.06.2026', 'Ochiq'],
        ['Q-2026-011', 'Iqtisodiy', '02.06.2026', 'Ochiq']
      ]
    }
  },
  '/oversight/integrations': {
    eyebrow: 'Integratsiyalar',
    title: 'Bank/MIB/FHDYo integratsiyalari',
    description: 'Ijro jarayonlari uchun tashqi tizimlar statusi.',
    cards: [
      { title: 'Bank', text: 'To‘lov va bloklash.' },
      { title: 'MIB', text: 'Ijro jarayoni.' },
      { title: 'FHDYo', text: 'Fuqarolik holati ma’lumotlari.' }
    ]
  },
  '/oversight/reports': {
    eyebrow: 'Hisobotlar',
    title: 'Nazorat hisobotlari',
    description: 'Ijro, korrupsiya monitoringi va anonimlashtirish hisobotlari.',
    table: {
      columns: ['Hisobot', 'Turi', 'Davr', 'Holat'],
      rows: [
        ['OR-001', 'Ijro', 'Iyun', 'Tayyor'],
        ['OR-002', 'CorruptAlert', 'Iyun', 'Draft']
      ]
    }
  },
  '/oversight/reports/generate': {
    eyebrow: 'Hisobot yaratish',
    title: 'Hisobot yaratish',
    description: 'Davr, modul, format va eksport sozlamalari.',
    primaryAction: 'Yaratish',
    formFields: ['Hisobot turi', 'Davr', 'Format', 'Qamrov']
  },
  '/oversight/notifications': {
    eyebrow: 'Bildirishnomalar',
    title: 'Nazorat bildirishnomalari',
    description: 'Ijro muddati, corrupt alert va nashr statuslari.',
    timeline: [
      { title: 'CorruptAlert', text: 'Yangi anomaliya topildi.' },
      { title: 'Ijro', text: 'Qaror muddati yaqinlashdi.' },
      { title: 'AnonimusLaw', text: 'Qaror nashrga tayyor.' }
    ]
  }
};

export const settingsPages = {
  '/settings/account': {
    eyebrow: 'Hisob',
    title: 'Hisob sozlamalari',
    description: 'Hisob ma’lumotlari, kontaktlar va profil holati.',
    formFields: ['Ism', 'Email', 'Telefon', 'Rol']
  },
  '/settings/security': {
    eyebrow: 'Xavfsizlik',
    title: 'Xavfsizlik sozlamalari',
    description: 'Parol, 2FA va sessiyalar.',
    cards: [
      { title: 'Parol', text: 'Parolni yangilash.' },
      { title: '2FA', text: 'Ikki bosqichli autentifikatsiya.' },
      { title: 'Sessions', text: 'Aktiv sessiyalar ro‘yxati.' }
    ]
  },
  '/settings/notifications': {
    eyebrow: 'Bildirishnomalar',
    title: 'Bildirishnoma sozlamalari',
    description: 'Email, push va SMS kanallari.',
    cards: [
      { title: 'Email', text: 'Email xabarlar.' },
      { title: 'Push', text: 'Brauzer push xabarlar.' },
      { title: 'SMS', text: 'Muhim SMS ogohlantirishlar.' }
    ]
  },
  '/settings/privacy': {
    eyebrow: 'Maxfiylik',
    title: 'Maxfiylik sozlamalari',
    description: 'Ma’lumot ko‘rinishi va anonimlashtirish talablari.',
    cards: [
      { title: 'Profil ko‘rinishi', text: 'Kontaktlar ko‘rinishini boshqarish.' },
      { title: 'Data export', text: 'Hisob ma’lumotlarini eksport qilish.' },
      { title: 'Consent', text: 'Rozilik sozlamalari.' }
    ]
  },
  '/settings/language': {
    eyebrow: 'Til',
    title: 'Til sozlamalari',
    description: 'UZ lotin, UZ kirill, RU va EN tillari.',
    cards: [
      { title: 'O‘zbek lotin', text: 'Default til.' },
      { title: 'O‘zbek kirill', text: 'Muqobil yozuv.' },
      { title: 'Русский / English', text: 'Qo‘shimcha tillar.' }
    ]
  },
  '/settings/appearance': {
    eyebrow: 'Ko‘rinish',
    title: 'Appearance sozlamalari',
    description: 'Light/dark theme va font o‘lchami.',
    cards: [
      { title: 'Light mode', text: 'Oq fon, qora matn.' },
      { title: 'Dark mode', text: 'Qora fon, oq matn.' },
      { title: 'Font size', text: 'Matn o‘lchami sozlamasi.' }
    ]
  },
  '/settings/accessibility': {
    eyebrow: 'Accessibility',
    title: 'Maxsus imkoniyatlar',
    description: 'Keyboard navigation, reduced motion va contrast.',
    cards: [
      { title: 'Keyboard', text: 'Tab, Esc, Enter, Arrow keys.' },
      { title: 'Reduced motion', text: 'Animatsiyalarni kamaytirish.' },
      { title: 'High contrast', text: 'Kontrast rejim.' }
    ]
  },
  '/settings/api-keys': {
    eyebrow: 'API keys',
    title: 'API kalitlar',
    description: 'Admin/dev uchun API kalitlar boshqaruvi.',
    table: {
      columns: ['Kalit', 'Scope', 'Yaratilgan', 'Holat'],
      rows: [
        ['sk_live_***', 'admin', '01.06.2026', 'Faol'],
        ['sk_test_***', 'dev', '02.06.2026', 'Faol']
      ]
    }
  },
  '/settings/billing': {
    eyebrow: 'Billing',
    title: 'To‘lovlar',
    description: 'Litsenziya va billing ma’lumotlari.',
    table: {
      columns: ['Plan', 'Muddat', 'Modul', 'Holat'],
      rows: [
        ['B2G Core', '2026', 'Portal/Judge', 'Faol'],
        ['AI Suite', '2026', 'AI tools', 'Faol']
      ]
    }
  },
  '/settings/delete-account': {
    eyebrow: 'Hisobni o‘chirish',
    title: 'Hisobni o‘chirish',
    description: 'Hisobni o‘chirishdan oldin xavfsizlik tasdiqlovi talab qilinadi.',
    primaryAction: 'Tasdiqlash',
    formFields: ['Parol', 'Sabab', 'Tasdiqlash matni']
  },
  '/legal/terms': {
    eyebrow: 'Legal',
    title: 'Foydalanish shartlari',
    description: 'SmartCourt AI platformasidan foydalanish shartlari.',
    cards: [
      { title: 'Foydalanish', text: 'Rasmiy sud tizimi doirasidagi foydalanish.' },
      { title: 'Mas’uliyat', text: 'AI tavsiyalari sudya qarorini almashtirmaydi.' },
      { title: 'Audit', text: 'Harakatlar audit logda saqlanadi.' }
    ]
  },
  '/legal/privacy': {
    eyebrow: 'Legal',
    title: 'Maxfiylik siyosati',
    description: 'Shaxsiy ma’lumotlar, saqlash va anonimlashtirish siyosati.',
    cards: [
      { title: 'Data minimization', text: 'Faqat zarur ma’lumotlar ishlatiladi.' },
      { title: 'Anonimlashtirish', text: 'Ochiq reestrga chiqishdan oldin PII yashiriladi.' },
      { title: 'Audit', text: 'Kirishlar nazorat qilinadi.' }
    ]
  },
  '/legal/cookies': {
    eyebrow: 'Legal',
    title: 'Cookie siyosati',
    description: 'Sessiya, xavfsizlik va preference cookie’lari.',
    cards: [
      { title: 'Session', text: 'Tizimga kirish sessiyasi.' },
      { title: 'Security', text: 'CSRF va xavfsizlik tokenlari.' },
      { title: 'Preferences', text: 'Til va theme sozlamalari.' }
    ]
  },
  '/legal/gdpr': {
    eyebrow: 'Legal',
    title: 'GDPR / UzPrivacy',
    description: 'Ma’lumot subyekti huquqlari va mahalliy maxfiylik talablari.',
    cards: [
      { title: 'Export', text: 'Ma’lumotlarni eksport qilish.' },
      { title: 'Correction', text: 'Noto‘g‘ri ma’lumotni tuzatish.' },
      { title: 'Retention', text: 'Saqlash muddatlari.' }
    ]
  },
  '/legal/accessibility-statement': {
    eyebrow: 'Legal',
    title: 'Accessibility statement',
    description: 'WCAG 2.1 AA, keyboard navigation va screen reader qo‘llovi.',
    cards: [
      { title: 'Keyboard', text: 'Tab va Enter orqali boshqarish.' },
      { title: 'Contrast', text: '4.5:1 minimal kontrast.' },
      { title: 'Reduced motion', text: 'Motion kamaytirish qo‘llanadi.' }
    ]
  }
};
