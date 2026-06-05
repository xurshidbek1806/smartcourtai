/// Web `data/pageRegistry.js` ning portal + settings + legal qismi.
class Metric {
  final String label;
  final String value;
  final String? note;
  const Metric(this.label, this.value, [this.note]);
}

class CardItem {
  final String title;
  final String text;
  final String? meta;
  const CardItem(this.title, this.text, [this.meta]);
}

class TimelineItem {
  final String title;
  final String text;
  const TimelineItem(this.title, this.text);
}

class TableData {
  final List<String> columns;
  final List<List<String>> rows;
  const TableData(this.columns, this.rows);
}

class PageConfig {
  final String eyebrow;
  final String title;
  final String description;
  final String? primaryAction;
  final String? secondaryAction;
  final String? sideTitle;
  final List<Metric> metrics;
  final List<CardItem> cards;
  final TableData? table;
  final List<TimelineItem> timeline;
  final List<String> formFields;
  final List<String> sideItems;

  const PageConfig({
    required this.eyebrow,
    required this.title,
    required this.description,
    this.primaryAction,
    this.secondaryAction,
    this.sideTitle,
    this.metrics = const [],
    this.cards = const [],
    this.table,
    this.timeline = const [],
    this.formFields = const [],
    this.sideItems = const [],
  });
}

const _claimRows = [
  ['2026-001234', 'Mehnat nizosi', 'Sudga qabul qilindi', '22.02.2026'],
  ['2026-001209', 'Oilaviy nizosi', 'Dalillar tekshirilmoqda', '18.02.2026'],
  ['2026-001178', 'Iqtisodiy nizosi', 'Mediatsiya tavsiya qilindi', 'Kutilmoqda'],
];

const portalPages = <String, PageConfig>{
  '/portal/profile': PageConfig(
    eyebrow: 'Profil',
    title: 'Shaxsiy profil',
    description: "OneID'dan olingan fuqaro ma'lumotlari, kontaktlar va verifikatsiya holati.",
    primaryAction: 'Profilni tahrirlash',
    metrics: [
      Metric('Arizalar', '3', 'aktiv'),
      Metric('Xabarlar', '8', "o'qilmagan"),
      Metric('Verifikatsiya', 'OneID'),
    ],
    formFields: ['F.I.Sh', 'PINFL', 'Telefon', 'Email', 'Manzil'],
    sideTitle: 'Xavfsizlik',
    sideItems: ['2FA tavsiya qilingan', 'SMS tasdiqlash faol', 'Email tasdiqlanmagan'],
  ),
  '/portal/profile/edit': PageConfig(
    eyebrow: 'Profil',
    title: 'Profilni tahrirlash',
    description: 'Telefon, email, manzil va bildirishnoma kontaktlarini yangilash.',
    primaryAction: 'Saqlash',
    secondaryAction: 'Bekor qilish',
    formFields: ['Telefon', 'Email', 'Yashash manzili', 'Pochta indeksi'],
  ),
  '/portal/profile/security': PageConfig(
    eyebrow: 'Xavfsizlik sozlamalari',
    title: 'Parol, 2FA va sessiyalar',
    description: 'Hisob xavfsizligi, aktiv sessiyalar va tasdiqlash usullari.',
    primaryAction: '2FA yoqish',
    cards: [
      CardItem('Parol', 'Oxirgi yangilanish: 15.01.2026.'),
      CardItem('SMS tasdiqlash', '+998 90 *** 00 00 raqamiga ulangan.'),
      CardItem('Aktiv sessiyalar', '2 ta qurilma tizimga kirgan.'),
    ],
  ),
  '/portal/profile/notifications': PageConfig(
    eyebrow: 'Bildirishnomalar',
    title: 'Email, push va SMS sozlamalari',
    description: 'Ariza holati, sud majlisi va xabarlar bo\'yicha bildirishnoma kanallari.',
    cards: [
      CardItem('Email', "Ariza va to'lov xabarlari."),
      CardItem('Push', 'Dashboard va chat ogohlantirishlari.'),
      CardItem('SMS', 'Muhim sud sanalari va tasdiqlash kodlari.'),
    ],
  ),
  '/portal/claims': PageConfig(
    eyebrow: 'Arizalarim',
    title: "Mening arizalarim ro'yxati",
    description: 'Aktiv, kutilayotgan va yakunlangan arizalar bo\'yicha jadval.',
    primaryAction: 'Yangi ariza',
    table: TableData(['Ariza', 'Turi', 'Holat', 'Keyingi sana'], _claimRows),
  ),
  '/portal/claims/:id/track': PageConfig(
    eyebrow: 'Holatni kuzatish',
    title: 'Ariza jarayoni tracking',
    description: 'Ariza qabul qilingandan keyingi statuslar va mas\'ul shaxslar.',
    timeline: [
      TimelineItem('Qabul qilindi', 'Ariza sud tizimiga yuborildi.'),
      TimelineItem('Dalillar tekshirildi', 'AI dalil tahlili yakunlandi.'),
      TimelineItem('Majlis belgilanadi', 'Keyingi sana kutilmoqda.'),
    ],
  ),
  '/portal/claims/:id/documents': PageConfig(
    eyebrow: 'Hujjatlar',
    title: 'Ariza hujjatlari',
    description: 'Yuklangan fayllar, preview va AI tahlil xulosalari.',
    primaryAction: 'Fayl yuklash',
    table: TableData(['Fayl', 'Turi', 'Hajmi', 'AI xulosa'], [
      ['shartnoma.pdf', 'PDF', '2.4 MB', '3 ta huquqiy fakt'],
      ['dalil-rasm.jpg', 'JPG', '1.1 MB', "Deepfake belgisi yo'q"],
      ['audio.mp3', 'MP3', '8.5 MB', 'Transkripsiya tayyor'],
    ]),
  ),
  '/portal/claims/:id/timeline': PageConfig(
    eyebrow: 'Vaqt jadvali',
    title: 'Ariza vaqt jadvali',
    description: 'Har bir hujjat, qaror va xabar timestamp bilan.',
    timeline: [
      TimelineItem('15.01.2026', 'Ariza yaratildi.'),
      TimelineItem('16.01.2026', 'Davlat boji tasdiqlandi.'),
      TimelineItem('18.01.2026', 'Sudya Karimov A.A. biriktirildi.'),
    ],
  ),
  '/portal/claims/:id/chat': PageConfig(
    eyebrow: 'Xat-xabar',
    title: 'Sudya bilan xat-xabar',
    description: 'Ariza bo\'yicha rasmiy yozishmalar va fayl biriktirish.',
    primaryAction: 'Xabar yuborish',
    cards: [
      CardItem('Sudya', "Qo'shimcha dalillarni 3 kun ichida yuklang.", '09:42'),
      CardItem('Fuqaro', 'Talab qilingan PDF hujjat yuklandi.', '10:18'),
    ],
    formFields: ['Xabar matni', 'Fayl biriktirish'],
  ),
  '/portal/claims/:id/payment': PageConfig(
    eyebrow: 'Davlat boji',
    title: "Davlat boji to'lovi",
    description: 'Davlat boji kalkulyatori, bank integratsiyasi va to\'lov holati.',
    primaryAction: "To'lov qilish",
    metrics: [Metric('Hisoblangan boj', '340 000', "so'm"), Metric('Holat', 'Kutilmoqda')],
    sideItems: ['Bank tizimlari integratsiyasi', 'Kvitansiya PDF', "To'lov tarixi"],
  ),
  '/portal/mediation': PageConfig(
    eyebrow: 'Mediatsiya',
    title: 'Mediatsiya markazi',
    description: 'Sudgacha kelishuv takliflari, sessiyalar va muvaffaqiyat ehtimoli.',
    primaryAction: 'Mediatsiya boshlash',
    cards: [
      CardItem('Mehnat nizosi', '67% muvaffaqiyat ehtimoli.'),
      CardItem('Oilaviy nizosi', 'Tomonlar kelishuvga taklif qilingan.'),
      CardItem('Iqtisodiy nizosi', 'Mediator tayinlanmoqda.'),
    ],
  ),
  '/portal/mediation/:id': PageConfig(
    eyebrow: 'Mediatsiya sessiyasi',
    title: 'Real-time mediatsiya',
    description: 'Tomonlar, mediator va kelishuv bandlari bilan jonli sessiya.',
    cards: [
      CardItem('Mediator', 'Rahimova M.S. sessiyani boshqarmoqda.'),
      CardItem('Kelishuv bandi', "To'lov muddati 30 kun qilib belgilanmoqda."),
      CardItem('AI tavsiya', 'Kelishuv ehtimoli: 71%.'),
    ],
  ),
  '/portal/mediation/:id/agreement': PageConfig(
    eyebrow: 'Kelishuv hujjati',
    title: 'Mediatsiya kelishuvi',
    description: 'Kelishuv shartlari, tomonlar imzosi va PDF eksport.',
    primaryAction: 'PDF eksport',
    formFields: ['Kelishuv sharti', 'Muddat', 'Tomonlar imzosi', 'Mediator xulosasi'],
  ),
  '/portal/lawyers': PageConfig(
    eyebrow: 'Advokat qidirish',
    title: 'Advokatlar katalogi',
    description: 'Mutaxassislik, reyting va band qilish imkoniyati.',
    table: TableData(['Advokat', "Yo'nalish", 'Reyting', 'Bandlik'], [
      ['N. Sobirov', 'Mehnat nizolari', '4.9', 'Bugun'],
      ['M. Yusupova', 'Oilaviy nizolar', '4.8', 'Ertaga'],
      ['A. Tursunov', 'Iqtisodiy nizolar', '4.7', 'Hafta ichida'],
    ]),
  ),
  '/portal/lawyers/:id': PageConfig(
    eyebrow: 'Advokat profili',
    title: 'Advokat profili',
    description: 'Mutaxassislik, tajriba, reyting va maslahat band qilish.',
    primaryAction: 'Maslahat band qilish',
    cards: [
      CardItem('Tajriba', '12 yil sud amaliyoti.'),
      CardItem("Yo'nalish", 'Mehnat va fuqarolik nizolari.'),
      CardItem('Reyting', '4.9 / 5.'),
    ],
  ),
  '/portal/lawyers/book': PageConfig(
    eyebrow: 'Maslahat band qilish',
    title: 'Advokat maslahatini band qilish',
    description: 'Sana, vaqt, aloqa turi va ariza kontekstini tanlash.',
    primaryAction: 'Band qilish',
    formFields: ['Advokat', 'Sana', 'Vaqt', 'Maslahat turi', 'Izoh'],
  ),
  '/portal/library': PageConfig(
    eyebrow: 'Huquqiy adabiyot',
    title: 'Huquqiy kutubxona',
    description: 'Qonunlar bazasi, anonim pretsedentlar va hujjat shablonlari.',
    cards: [
      CardItem('Qonunlar bazasi', "Kodekslar va moddalar bo'yicha qidiruv."),
      CardItem('Pretsedentlar', 'Anonimlashtirilgan ishlar.'),
      CardItem('Shablonlar', 'Ariza va kelishuv hujjatlari.'),
    ],
  ),
  '/portal/library/laws': PageConfig(
    eyebrow: 'Qonunlar bazasi',
    title: 'Qonunlar va moddalar',
    description: "Kodeks, modda va kalit so'z bo'yicha qidirish.",
    table: TableData(['Kodeks', 'Modda', 'Mavzu'], [
      ['Mehnat kodeksi', '161', 'Shartnomani bekor qilish'],
      ['Mehnat kodeksi', '167', 'Kompensatsiya'],
      ['Fuqarolik kodeksi', '985', 'Zararni qoplash'],
    ]),
  ),
  '/portal/library/precedents': PageConfig(
    eyebrow: 'Pretsedentlar',
    title: 'Anonim pretsedentlar',
    description: "O'xshash ishlar, qaror natijalari va AI moslik darajasi.",
    table: TableData(['Ish', "Yo'nalish", 'Moslik', 'Natija'], [
      ['#2025-004982', 'Mehnat', '82%', 'Qisman qanoatlantirilgan'],
      ['#2024-010214', 'Mehnat', '77%', 'Qanoatlantirilgan'],
      ['#2023-006001', 'Fuqarolik', '74%', 'Rad etilgan'],
    ]),
  ),
  '/portal/library/templates': PageConfig(
    eyebrow: 'Hujjat shablonlari',
    title: 'Ariza va kelishuv shablonlari',
    description: "Sudga murojaat, mediatsiya va to'lov hujjatlari uchun shablonlar.",
    cards: [
      CardItem("Da'vo arizasi", 'Fuqarolik va mehnat nizolari uchun.'),
      CardItem('Mediatsiya kelishuvi', 'Tomonlar kelishuvi uchun.'),
      CardItem("Dalil ro'yxati", 'Hujjatlarni tartiblash uchun.'),
    ],
  ),
  '/portal/notifications': PageConfig(
    eyebrow: 'Bildirishnomalar',
    title: 'Bildirishnomalar markazi',
    description: "Ariza, to'lov, sud majlisi va chat xabarlari.",
    timeline: [
      TimelineItem("To'lov tasdiqlandi", 'Davlat boji kvitansiyasi qabul qilindi.'),
      TimelineItem('Sudya biriktirildi', 'Karimov A.A. ishga tayinlandi.'),
      TimelineItem('Yangi xabar', "Sudya qo'shimcha dalil so'radi."),
    ],
  ),
  '/portal/messages': PageConfig(
    eyebrow: 'Xabarlar',
    title: 'Xabarlar',
    description: 'Sudya, mediator va tizim xabarlari.',
    cards: [
      CardItem('Sudya Karimov A.A.', "Dalillar bo'yicha so'rov yuborildi.", 'Bugun'),
      CardItem('MediatoBot', 'Kelishuv ehtimoli yangilandi.', 'Kecha'),
      CardItem('Tizim', 'Profil xavfsizligini tekshiring.', '2 kun oldin'),
    ],
  ),
  '/portal/help': PageConfig(
    eyebrow: 'Yordam',
    title: 'Yordam markazi',
    description: "Ariza yaratish, davlat boji, mediatsiya va AI assistant bo'yicha yordam.",
    cards: [
      CardItem('Ariza yaratish', '5 bosqichli wizarddan foydalanish.'),
      CardItem("To'lov", 'Davlat boji va kvitansiya.'),
      CardItem('AI maslahatchi', 'Huquqiy savollar berish.'),
    ],
  ),
  '/portal/help/faq': PageConfig(
    eyebrow: 'FAQ',
    title: "Tez-tez so'raladigan savollar",
    description: "Portal bo'yicha eng ko'p uchraydigan savollar.",
    cards: [
      CardItem('Qaysi sudga murojaat qilaman?', 'Nizo turi va manzilga qarab aniqlanadi.'),
      CardItem('Davlat boji qancha?', "Da'vo summasi va imtiyozlar bo'yicha hisoblanadi."),
      CardItem('Mediatsiya majburiymi?', 'Ayrim holatlarda tavsiya sifatida beriladi.'),
    ],
  ),
};

const settingsPages = <String, PageConfig>{
  '/settings/account': PageConfig(
    eyebrow: 'Hisob',
    title: 'Hisob sozlamalari',
    description: "Hisob ma'lumotlari, kontaktlar va profil holati.",
    formFields: ['Ism', 'Email', 'Telefon', 'Rol'],
  ),
  '/settings/security': PageConfig(
    eyebrow: 'Xavfsizlik',
    title: 'Xavfsizlik sozlamalari',
    description: 'Parol, 2FA va sessiyalar.',
    cards: [
      CardItem('Parol', 'Parolni yangilash.'),
      CardItem('2FA', 'Ikki bosqichli autentifikatsiya.'),
      CardItem('Sessions', "Aktiv sessiyalar ro'yxati."),
    ],
  ),
  '/settings/notifications': PageConfig(
    eyebrow: 'Bildirishnomalar',
    title: 'Bildirishnoma sozlamalari',
    description: 'Email, push va SMS kanallari.',
    cards: [
      CardItem('Email', 'Email xabarlar.'),
      CardItem('Push', 'Brauzer push xabarlar.'),
      CardItem('SMS', 'Muhim SMS ogohlantirishlar.'),
    ],
  ),
  '/settings/privacy': PageConfig(
    eyebrow: 'Maxfiylik',
    title: 'Maxfiylik sozlamalari',
    description: "Ma'lumot ko'rinishi va anonimlashtirish talablari.",
    cards: [
      CardItem("Profil ko'rinishi", "Kontaktlar ko'rinishini boshqarish."),
      CardItem('Data export', "Hisob ma'lumotlarini eksport qilish."),
      CardItem('Consent', 'Rozilik sozlamalari.'),
    ],
  ),
  '/settings/language': PageConfig(
    eyebrow: 'Til',
    title: 'Til sozlamalari',
    description: 'UZ lotin, UZ kirill, RU va EN tillari.',
    cards: [
      CardItem("O'zbek lotin", 'Default til.'),
      CardItem("O'zbek kirill", 'Muqobil yozuv.'),
      CardItem('Русский / English', "Qo'shimcha tillar."),
    ],
  ),
  '/settings/appearance': PageConfig(
    eyebrow: "Ko'rinish",
    title: 'Appearance sozlamalari',
    description: "Light/dark theme va font o'lchami.",
    cards: [
      CardItem('Light mode', 'Oq fon, qora matn.'),
      CardItem('Dark mode', 'Qora fon, oq matn.'),
      CardItem('Font size', "Matn o'lchami sozlamasi."),
    ],
  ),
  '/settings/accessibility': PageConfig(
    eyebrow: 'Accessibility',
    title: 'Maxsus imkoniyatlar',
    description: 'Keyboard navigation, reduced motion va contrast.',
    cards: [
      CardItem('Keyboard', 'Tab, Esc, Enter, Arrow keys.'),
      CardItem('Reduced motion', 'Animatsiyalarni kamaytirish.'),
      CardItem('High contrast', 'Kontrast rejim.'),
    ],
  ),
  '/settings/api-keys': PageConfig(
    eyebrow: 'API keys',
    title: 'API kalitlar',
    description: 'Admin/dev uchun API kalitlar boshqaruvi.',
    table: TableData(['Kalit', 'Scope', 'Yaratilgan', 'Holat'], [
      ['sk_live_***', 'admin', '01.06.2026', 'Faol'],
      ['sk_test_***', 'dev', '02.06.2026', 'Faol'],
    ]),
  ),
  '/settings/billing': PageConfig(
    eyebrow: 'Billing',
    title: "To'lovlar",
    description: "Litsenziya va billing ma'lumotlari.",
    table: TableData(['Plan', 'Muddat', 'Modul', 'Holat'], [
      ['B2G Core', '2026', 'Portal/Judge', 'Faol'],
      ['AI Suite', '2026', 'AI tools', 'Faol'],
    ]),
  ),
  '/settings/delete-account': PageConfig(
    eyebrow: "Hisobni o'chirish",
    title: "Hisobni o'chirish",
    description: "Hisobni o'chirishdan oldin xavfsizlik tasdiqlovi talab qilinadi.",
    primaryAction: 'Tasdiqlash',
    formFields: ['Parol', 'Sabab', 'Tasdiqlash matni'],
  ),
  '/legal/terms': PageConfig(
    eyebrow: 'Legal',
    title: 'Foydalanish shartlari',
    description: 'SmartCourt AI platformasidan foydalanish shartlari.',
    cards: [
      CardItem('Foydalanish', 'Rasmiy sud tizimi doirasidagi foydalanish.'),
      CardItem("Mas'uliyat", 'AI tavsiyalari sudya qarorini almashtirmaydi.'),
      CardItem('Audit', 'Harakatlar audit logda saqlanadi.'),
    ],
  ),
  '/legal/privacy': PageConfig(
    eyebrow: 'Legal',
    title: 'Maxfiylik siyosati',
    description: "Shaxsiy ma'lumotlar, saqlash va anonimlashtirish siyosati.",
    cards: [
      CardItem('Data minimization', "Faqat zarur ma'lumotlar ishlatiladi."),
      CardItem('Anonimlashtirish', 'Ochiq reestrga chiqishdan oldin PII yashiriladi.'),
      CardItem('Audit', 'Kirishlar nazorat qilinadi.'),
    ],
  ),
  '/legal/cookies': PageConfig(
    eyebrow: 'Legal',
    title: 'Cookie siyosati',
    description: "Sessiya, xavfsizlik va preference cookie'lari.",
    cards: [
      CardItem('Session', 'Tizimga kirish sessiyasi.'),
      CardItem('Security', 'CSRF va xavfsizlik tokenlari.'),
      CardItem('Preferences', 'Til va theme sozlamalari.'),
    ],
  ),
  '/legal/gdpr': PageConfig(
    eyebrow: 'Legal',
    title: 'GDPR / UzPrivacy',
    description: "Ma'lumot subyekti huquqlari va mahalliy maxfiylik talablari.",
    cards: [
      CardItem('Export', "Ma'lumotlarni eksport qilish."),
      CardItem('Correction', "Noto'g'ri ma'lumotni tuzatish."),
      CardItem('Retention', 'Saqlash muddatlari.'),
    ],
  ),
  '/legal/accessibility-statement': PageConfig(
    eyebrow: 'Legal',
    title: 'Accessibility statement',
    description: "WCAG 2.1 AA, keyboard navigation va screen reader qo'llovi.",
    cards: [
      CardItem('Keyboard', 'Tab va Enter orqali boshqarish.'),
      CardItem('Contrast', '4.5:1 minimal kontrast.'),
      CardItem('Reduced motion', 'Motion kamaytirish qo\'llanadi.'),
    ],
  ),
};

const _fallback = PageConfig(
  eyebrow: 'Fuqaro portali',
  title: 'Fuqaro portali sahifasi',
  description: "TZ bo'yicha fuqaro portalidagi route.",
);

/// Aniq yoki :id-naqshli pathni registrydan topadi (web ConfiguredPage logikasi).
PageConfig lookupPage(String path) {
  final all = {...portalPages, ...settingsPages};
  if (all.containsKey(path)) return all[path]!;
  for (final entry in all.entries) {
    if (entry.key.contains(':')) {
      final pattern = '^${entry.key.replaceAll(RegExp(r':[^/]+'), r'[^/]+')}\$';
      if (RegExp(pattern).hasMatch(path)) return entry.value;
    }
  }
  return _fallback;
}
