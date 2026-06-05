const GENERATED_AT_FORMATTER = new Intl.DateTimeFormat('uz-UZ', {
  dateStyle: 'long',
  timeStyle: 'short'
});

const DOCUMENT_DATE_FORMATTER = new Intl.DateTimeFormat('uz-UZ', {
  dateStyle: 'long'
});

export const formatOfficialDate = (date = new Date()) => DOCUMENT_DATE_FORMATTER.format(date);

export const legalReferences = [
  {
    code: 'FPK 188-modda',
    title:
      'Ish yozma shaklda, pochta orqali yoki elektron hujjat tarzida ariza berish yo‘li bilan qo‘zg‘atiladi.',
    url: 'https://lex.uz/uz/docs/-3517337'
  },
  {
    code: 'FPK 189-modda',
    title:
      'Arizada sud nomi, taraflar, talab, da’vo bahosi, holatlar, dalillar, sudgacha tartib va ilovalar ko‘rsatiladi.',
    url: 'https://lex.uz/uz/docs/-3517337'
  },
  {
    code: 'FPK 190-191-moddalar',
    title: 'Ko‘chirma nusxalar va talabni tasdiqlovchi ilova hujjatlar arizaga biriktiriladi.',
    url: 'https://lex.uz/uz/docs/-3517337'
  },
  {
    code: 'IPK 149-modda',
    title:
      'Iqtisodiy da’vo yozma shaklda beriladi va unda taraflar, summa hisob-kitobi, dalillar, talablar va ilovalar ko‘rsatiladi.',
    url: 'https://lex.uz/uz/docs/-3523891'
  },
  {
    code: 'FPK 253-modda',
    title: 'Hal qiluv qarori kirish, bayon, asoslantiruvchi va xulosa qismlaridan iborat bo‘ladi.',
    url: 'https://lex.uz/uz/docs/-3517337'
  },
  {
    code: 'FPK 252-modda',
    title: 'Sudning hal qiluv qarori sud muhokamasi yakunida qabul qilinadigan yakuniy hujjatdir.',
    url: 'https://lex.uz/uz/docs/-3517337'
  },
  {
    code: 'IPK 150-151-moddalar',
    title:
      'Iqtisodiy da’vo arizasi va unga ilova qilinadigan hujjatlar bo‘yicha talablar ko‘rsatiladi.',
    url: 'https://lex.uz/uz/docs/-3523891'
  },
  {
    code: 'MSIYutK 128-131-moddalar',
    title:
      'Ma’muriy sudga ariza yoki shikoyat berish, unga qo‘yiladigan talablar va qabul qilish tartibi ko‘rsatiladi.',
    url: 'https://lex.uz/Pages/GetPdf.aspx?file=LexUz_6799209.pdf'
  }
];

export const demoOneIdProfile = {
  fullName: 'Fayzullayev Jaxongir Azam o‘g‘li',
  birthDate: '14.05.1995',
  pinfl: '31405951234567',
  passport: 'AD 1234567',
  address: 'Toshkent shahar, Yakkasaroy tumani, Bobur ko‘chasi, 12-uy, 45-xonadon',
  phone: '+998 90 123-45-67',
  email: 'j.fayzullayev@example.uz',
  verification: 'OneID orqali tasdiqlangan demo profil'
};

export const claimTemplates = {
  civil_claim: {
    id: 'civil_claim',
    name: 'Fuqarolik da’vo arizasi',
    format: 'DOC/PDF + JSON metadata',
    paper: {
      size: 'A4',
      margins: '20mm 15mm 20mm 30mm',
      font: 'Times New Roman',
      fontSize: '14pt'
    },
    basis: ['FPK 188-modda', 'FPK 189-modda', 'FPK 190-modda', 'FPK 191-modda'],
    appliesTo: ['Fuqarolik nizosi', 'Mehnat nizosi', 'Oilaviy nizosi'],
    requiredFields: [
      'Sud nomi',
      'Da’vogar ma’lumotlari',
      'Javobgar ma’lumotlari',
      'Da’vogarning talabi',
      'Da’vo bahosi',
      'Holatlar va dalillar',
      'Sudgacha hal qilish ma’lumoti',
      'Ilovalar ro‘yxati',
      'Imzo yoki ERI'
    ]
  },
  labor_claim: {
    id: 'labor_claim',
    name: 'Mehnat nizosi bo‘yicha da’vo arizasi',
    format: 'DOC/PDF + JSON metadata',
    paper: {
      size: 'A4',
      margins: '20mm 15mm 20mm 30mm',
      font: 'Times New Roman',
      fontSize: '14pt'
    },
    basis: ['FPK 188-modda', 'FPK 189-modda', 'Mehnat kodeksi'],
    appliesTo: ['Mehnat nizosi'],
    requiredFields: [
      'Sud nomi',
      'Da’vogar OneID ma’lumotlari',
      'Ish beruvchi ma’lumotlari',
      'Mehnat munosabati bayoni',
      'Undiriladigan summa',
      'Holatlar va dalillar',
      'Sudgacha murojaat ma’lumoti',
      'Ilovalar ro‘yxati',
      'Imzo yoki ERI'
    ]
  },
  family_claim: {
    id: 'family_claim',
    name: 'Oila nizosi bo‘yicha da’vo arizasi',
    format: 'DOC/PDF + JSON metadata',
    paper: {
      size: 'A4',
      margins: '20mm 15mm 20mm 30mm',
      font: 'Times New Roman',
      fontSize: '14pt'
    },
    basis: ['FPK 188-modda', 'FPK 189-modda', 'Oila kodeksi'],
    appliesTo: ['Oilaviy nizosi'],
    requiredFields: [
      'Sud nomi',
      'Da’vogar OneID ma’lumotlari',
      'Javobgar ma’lumotlari',
      'Farzand yoki oila munosabati ma’lumotlari',
      'Talab mazmuni',
      'Holatlar va dalillar',
      'Ilovalar ro‘yxati',
      'Imzo yoki ERI'
    ]
  },
  economic_claim: {
    id: 'economic_claim',
    name: 'Iqtisodiy da’vo arizasi',
    format: 'DOC/PDF + JSON metadata',
    paper: {
      size: 'A4',
      margins: '20mm 15mm 20mm 30mm',
      font: 'Times New Roman',
      fontSize: '14pt'
    },
    basis: ['IPK 149-modda', 'IPK 150-modda', 'IPK 151-modda'],
    appliesTo: ['Iqtisodiy nizosi'],
    requiredFields: [
      'Iqtisodiy sud nomi',
      'Yuridik shaxslar rekvizitlari',
      'Da’vo bahosi',
      'Undirilayotgan summa hisob-kitobi',
      'Talabga asos bo‘lgan holatlar',
      'Dalillar',
      'Talabnoma yuborilganligi',
      'Ilovalar ro‘yxati',
      'Imzo yoki ERI'
    ]
  },
  administrative_claim: {
    id: 'administrative_claim',
    name: 'Ma’muriy shikoyat arizasi',
    format: 'DOC/PDF + JSON metadata',
    paper: {
      size: 'A4',
      margins: '20mm 15mm 20mm 30mm',
      font: 'Times New Roman',
      fontSize: '14pt'
    },
    basis: ['MSIYutK 128-modda', 'MSIYutK 129-modda', 'MSIYutK 130-modda', 'MSIYutK 131-modda'],
    appliesTo: ['Ma’muriy shikoyat'],
    requiredFields: [
      'Ma’muriy sud nomi',
      'Arizachi ma’lumotlari',
      'Javobgar ma’muriy organ yoki mansabdor shaxs',
      'Nizolashilayotgan qaror yoki harakat',
      'Huquq buzilishi mazmuni',
      'Talablar',
      'Dalillar',
      'Ilovalar ro‘yxati',
      'Imzo yoki ERI'
    ]
  }
};

export const decisionTemplate = {
  id: 'civil_decision',
  name: 'Sud hal qiluv qarori qoralamasi',
  format: 'DOC/PDF + JSON metadata',
  paper: {
    size: 'A4',
    margins: '20mm 15mm 20mm 30mm',
    font: 'Times New Roman',
    fontSize: '14pt'
  },
  basis: ['FPK 252-modda', 'FPK 253-modda'],
  sections: ['Kirish qismi', 'Bayon qismi', 'Asoslantiruvchi qism', 'Xulosa qismi']
};

export const getClaimTemplateByDispute = (disputeType = '') => {
  const normalized = disputeType.toLowerCase();
  if (normalized.includes('iqtisod')) return claimTemplates.economic_claim;
  if (normalized.includes('ma’mur') || normalized.includes("ma'mur"))
    return claimTemplates.administrative_claim;
  if (normalized.includes('mehnat')) return claimTemplates.labor_claim;
  if (normalized.includes('oilav') || normalized.includes('oila'))
    return claimTemplates.family_claim;
  return claimTemplates.civil_claim;
};

const valueOrBlank = (value, fallback = '________________') => {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
};

const getClaimParties = (form) => ({
  claimant: {
    name: valueOrBlank(form.claimantName, demoOneIdProfile.fullName),
    birthDate: valueOrBlank(form.claimantBirthDate, demoOneIdProfile.birthDate),
    id: valueOrBlank(form.claimantPinfl, demoOneIdProfile.pinfl),
    passport: valueOrBlank(form.claimantPassport, demoOneIdProfile.passport),
    address: valueOrBlank(form.claimantAddress, demoOneIdProfile.address),
    phone: valueOrBlank(form.claimantPhone, demoOneIdProfile.phone),
    email: valueOrBlank(form.claimantEmail, demoOneIdProfile.email)
  },
  respondent: {
    name: valueOrBlank(form.respondentName ?? form.fullName, '________________'),
    id: valueOrBlank(form.respondentPinfl ?? form.pinfl, '________________'),
    address: valueOrBlank(form.respondentAddress ?? form.address, '________________'),
    phone: valueOrBlank(form.respondentPhone ?? form.phone, '________________')
  }
});

const listFiles = (files = [], fallbackItems = []) => {
  const source = files.length
    ? files.map((file) => `${file.name} — ${file.result}`)
    : fallbackItems.filter(Boolean);

  if (!source.length)
    return '1. Arizadagi holatlarni tasdiqlovchi hujjatlar mavjud bo‘lsa ilova qilinadi.';
  return source.map((item, index) => `${index + 1}. ${item}`).join('\n');
};

const getDefaultEvidenceItems = (form) => {
  const text = String(form.description ?? '').toLowerCase();
  const items = [];

  if (text.includes('chek')) items.push('To‘lov amalga oshirilganligini tasdiqlovchi chek.');
  if (text.includes('yozishma')) items.push('Javobgar bilan yozishmalar nusxasi.');
  if (text.includes('telefon'))
    items.push('Telefon ta’mirga topshirilganligini tasdiqlovchi ma’lumotlar.');
  if (String(form.preTrial ?? '').trim())
    items.push('Javobgarga yuborilgan murojaat yoki talabnoma ma’lumotlari.');

  return items.length
    ? items
    : ['Da’vo talablariga asos bo‘lgan holatlarni tasdiqlovchi mavjud ma’lumotlar.'];
};

const getDefaultAttachmentItems = (form) => [
  'Da’vo arizasi nusxasi.',
  ...getDefaultEvidenceItems(form),
  'Da’vo bahosi hisob-kitobi.',
  'Sud xarajatlari to‘langanligini tasdiqlovchi hujjat mavjud bo‘lsa.'
];

const titleForTemplate = (template) => {
  if (template.id === 'administrative_claim') return 'ARIZA (SHIKOYAT)';
  if (template.id === 'economic_claim') return 'DA’VO ARIZA';
  return 'DA’VO ARIZASI';
};

const defaultCourtName = (template, form) => {
  const typed = String(form.courtName ?? '').trim();
  if (typed) return typed;
  if (template.id === 'economic_claim') return '________________ iqtisodiy sudiga';
  if (template.id === 'administrative_claim') return '________________ ma’muriy sudiga';
  return 'Fuqarolik ishlari bo‘yicha ________________ sudiga';
};

const defaultClaimSubject = (template, form) => {
  const title = String(form.title ?? '').trim();
  if (title) return title;
  if (template.id === 'labor_claim') return 'ish haqi va mehnat to‘lovlarini undirish to‘g‘risida';
  if (template.id === 'family_claim') return 'aliment yoki oilaviy talab yuzasidan';
  if (template.id === 'economic_claim') return 'qarzdorlikni undirish to‘g‘risida';
  if (template.id === 'administrative_claim')
    return 'davlat organi qarori yoki harakatini qonunga xilof deb topish to‘g‘risida';
  return 'pul mablag‘i yoki majburiyatni undirish to‘g‘risida';
};

const requestIntro = (template) => {
  if (template.id === 'administrative_claim') return 'Arizachining talabi';
  if (template.id === 'economic_claim') return 'Da’vogarning talabi va hisob-kitobi';
  return 'Da’vogarning talabi';
};

const buildRequestItems = (template, form) => {
  const amount = valueOrBlank(form.amount, 'ko‘rsatilgan summa');
  if (template.id === 'administrative_claim') {
    return [
      'Javobgar ma’muriy organning qarori yoki harakatini qonunga xilof deb topishni;',
      'Buzilgan huquq va qonuniy manfaatlarni tiklash majburiyatini yuklashni;',
      'Sud xarajatlari masalasini qonunchilikda belgilangan tartibda hal qilishni.'
    ];
  }
  if (template.id === 'economic_claim') {
    return [
      `Javobgardan ${amount} miqdoridagi qarzdorlikni undirishni;`,
      'Sud xarajatlarini javobgar zimmasiga yuklashni;'
    ];
  }
  if (template.id === 'family_claim') {
    return [
      'Voyaga yetmagan farzand ta’minoti yoki oilaviy talabni qonunchilikda belgilangan tartibda qanoatlantirishni;',
      'Sud hujjatini ijroga qaratishni;'
    ];
  }
  return [
    `Javobgardan ${amount} miqdoridagi talabni da’vogar foydasiga undirishni;`,
    'Sud xarajatlarini javobgar zimmasiga yuklashni;',
    'Ishni qonunchilikda belgilangan tartibda ko‘rib chiqishni.'
  ];
};

export const buildClaimDocument = ({ form, uploadedFiles = [], validation = null }) => {
  const template = getClaimTemplateByDispute(form.selectedType);
  const parties = getClaimParties(form);
  const courtName = defaultCourtName(template, form);
  const documentDate = valueOrBlank(form.documentDate, formatOfficialDate());
  const title = titleForTemplate(template);
  const subject = defaultClaimSubject(template, form);
  const evidenceItems = listFiles(uploadedFiles, getDefaultEvidenceItems(form));
  const attachmentItems = listFiles(uploadedFiles, getDefaultAttachmentItems(form));
  const requestItems = buildRequestItems(template, form)
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n');

  return `${courtName}

${template.id === 'administrative_claim' ? 'Arizachi' : 'Da’vogar'}: ${parties.claimant.name}
Tug‘ilgan sana: ${parties.claimant.birthDate}
JShShIR: ${parties.claimant.id}
Pasport: ${parties.claimant.passport}
Yashash manzili: ${parties.claimant.address}
Telefon: ${parties.claimant.phone}
Elektron manzil: ${parties.claimant.email}

Javobgar: ${parties.respondent.name}
Javobgar turi: ${valueOrBlank(form.partyType)}
PINFL / INN: ${parties.respondent.id}
Manzil / rekvizitlar: ${parties.respondent.address}
Telefon / email: ${parties.respondent.phone}

Da’vo bahosi: ${valueOrBlank(form.amount, 'baholanmagan yoki ko‘rsatilmagan')}

${title}
${subject}

${requestIntro(template)}
${valueOrBlank(form.title, subject)}

Ish holatlari
Voqea sanasi: ${valueOrBlank(form.eventDate, 'aniq sana ko‘rsatilmagan')}
${valueOrBlank(
  form.description,
  'Foydalanuvchi shikoyati kiritilmagan. Ariza mazmuni foydalanuvchi erkin yozgan matnidan avtomatik shakllantiriladi.'
)}

Talabni tasdiqlovchi dalillar
${evidenceItems}

Huquqiy asos
${template.basis.join(', ')}

Sudgacha hal qilish tartibi
${valueOrBlank(
  form.preTrial,
  template.id === 'economic_claim'
    ? 'Talabnoma yuborilganligi va natijasi ko‘rsatiladi.'
    : template.id === 'administrative_claim'
      ? 'Ma’muriy organga murojaat qilinganligi yoki qaror/harakat ustidan shikoyat asoslari ko‘rsatiladi.'
      : 'Qonun yoki shartnomada nazarda tutilgan bo‘lsa, sudgacha tartib ko‘rsatiladi.'
)}

S O‘ R A Y M A N:
${requestItems}

Ilovalar ro‘yxati
${attachmentItems}

AI tekshiruv eslatmasi
${validation?.summary || 'ClaimValidator tekshiruvi hali bajarilmagan yoki backend javobi yo‘q.'}

Sana: ${documentDate}
${template.id === 'administrative_claim' ? 'Arizachi' : 'Da’vogar'}: ${parties.claimant.name}
Imzo: ________________________________`;
};

export const buildClaimMetadata = ({ form, uploadedFiles = [], validation = null }) => {
  const template = getClaimTemplateByDispute(form.selectedType);
  return {
    document_type: 'claim',
    template_id: template.id,
    template_name: template.name,
    recommended_formats: ['doc', 'docx', 'pdf', 'json'],
    paper: template.paper,
    production_note: 'Yakuniy topshirish uchun PDF/PDF-A va ERI backendda shakllantiriladi.',
    document_date: valueOrBlank(form.documentDate, formatOfficialDate()),
    legal_basis: template.basis,
    required_fields: template.requiredFields,
    one_id_profile: getClaimParties(form).claimant,
    parties: getClaimParties(form),
    form: { ...form },
    evidence: uploadedFiles.map(({ id, name, size, result }) => ({ id, name, size, result })),
    validation
  };
};

export const buildDecisionDocument = ({ form, draft, laws = [], precedents = [] }) => {
  const generatedAt = GENERATED_AT_FORMATTER.format(new Date());
  const sourceList = laws.length
    ? laws
        .map(
          (law, index) =>
            `${index + 1}. ${law.code || ''} ${law.article || ''} — ${law.title || ''}`
        )
        .join('\n')
    : '1. RAG manbalari hali biriktirilmagan.';
  const precedentList = precedents.length
    ? precedents
        .map(
          (item, index) => `${index + 1}. ${item.reference || 'Pretsedent'} — ${item.outcome || ''}`
        )
        .join('\n')
    : '1. O‘xshash pretsedentlar hali biriktirilmagan.';

  return `SUD HAL QILUV QARORI QORALAMASI

Huquqiy shablon: ${decisionTemplate.name}
Asos: ${decisionTemplate.basis.join(', ')}
Yaratilgan vaqt: ${generatedAt}

KIRISH QISMI
Ish nomi: ${valueOrBlank(form.title)}
Nizo turi: ${valueOrBlank(form.disputeType)}
Taraflar: ${valueOrBlank(form.parties)}
Sud / sudya / kotib: ________________________________
Ish raqami: ________________________________

BAYON QISMI
${valueOrBlank(form.facts)}

ASOSLANTIRUVCHI QISM
${valueOrBlank(draft, 'SmartJudge qoralamasi hali yaratilmagan.')}

Foydalanilgan qonun moddalari:
${sourceList}

O‘xshash pretsedentlar:
${precedentList}

XULOSA QISMI
Talablarni qanoatlantirish yoki rad etish bo‘yicha sud xulosasi: ________________________________
Sud xarajatlari: ________________________________
Shikoyat qilish muddati va tartibi: ________________________________

Sudya imzosi / ERI: ________________________________`;
};

export const buildDecisionMetadata = ({ form, draft, laws = [], precedents = [] }) => ({
  document_type: 'decision_draft',
  template_id: decisionTemplate.id,
  template_name: decisionTemplate.name,
  recommended_formats: ['doc', 'pdf', 'json'],
  paper: decisionTemplate.paper,
  production_note: 'Yakuniy qaror PDF/PDF-A va ERI bilan backendda shakllantiriladi.',
  legal_basis: decisionTemplate.basis,
  required_sections: decisionTemplate.sections,
  form: { ...form },
  draft,
  laws,
  precedents
});

const escapeHtml = (text) =>
  String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const getOfficialLineBlocks = (body) => {
  const lines = String(body ?? '').split('\n');
  const blocks = [];
  let inHeaderBlock = true;
  let nextLineIsSubtitle = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      blocks.push({ type: inHeaderBlock ? 'recipient-spacer' : 'spacer' });
      continue;
    }

    if (
      /^(DA’VO ARIZASI|DA’VO ARIZA|ARIZA|ARIZA \(SHIKOYAT\)|KASSATSIYA SHIKOYATI|SUD HAL QILUV QARORI QORALAMASI)$/i.test(
        line
      )
    ) {
      inHeaderBlock = false;
      nextLineIsSubtitle = true;
      blocks.push({ type: 'title', text: line });
      continue;
    }

    if (inHeaderBlock) {
      const [label, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      blocks.push(value ? { type: 'recipient', label, value } : { type: 'recipient', text: line });
      continue;
    }

    if (
      /^(KIRISH QISMI|BAYON QISMI|ASOSLANTIRUVCHI QISM|XULOSA QISMI|Ish holatlari|Talabni tasdiqlovchi dalillar|Huquqiy asos|Sudgacha hal qilish tartibi|S O‘ R A Y M A N:|Ilovalar ro‘yxati|AI tekshiruv eslatmasi|Da’vogarning talabi|Arizachining talabi|Da’vogarning talabi va hisob-kitobi)$/i.test(
        line
      )
    ) {
      blocks.push({ type: 'section', text: line });
      continue;
    }

    if (nextLineIsSubtitle) {
      nextLineIsSubtitle = false;
      blocks.push({ type: 'subtitle', text: line });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      blocks.push({ type: 'list', text: line });
      continue;
    }

    if (
      /^(Da’vogar|Arizachi|Shikoyat beruvchi|Javobgar|Javobgar turi|PINFL \/ INN|JShShIR|Pasport|Tug‘ilgan sana|Yashash manzili|Manzil|Telefon|Elektron manzil|Sana|Voqea sanasi|Imzo|Sudya imzosi|Sud \/ sudya|Ish raqami|Ish nomi|Nizo turi|Taraflar|Huquqiy shablon|Asos|Yaratilgan vaqt|Da’vo bahosi):/.test(
        line
      )
    ) {
      const [label, ...rest] = line.split(':');
      blocks.push({ type: 'field', label, value: rest.join(':').trim() });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  return blocks;
};

export const renderOfficialLines = (body) =>
  getOfficialLineBlocks(body)
    .map((block) => {
      if (block.type === 'recipient-spacer') return '<div class="recipient-spacer"></div>';
      if (block.type === 'spacer') return '<div class="spacer"></div>';
      if (block.type === 'title') return `<h1>${escapeHtml(block.text)}</h1>`;
      if (block.type === 'subtitle')
        return `<p class="document-subtitle">${escapeHtml(block.text)}</p>`;
      if (block.type === 'section') return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === 'list') return `<p class="list-item">${escapeHtml(block.text)}</p>`;
      if (block.type === 'field') {
        return `<p><strong>${escapeHtml(block.label)}:</strong>${escapeHtml(
          block.value ? ` ${block.value}` : ''
        )}</p>`;
      }
      if (block.type === 'recipient') {
        return `<div class="recipient-line">${
          block.value
            ? `<strong>${escapeHtml(block.label)}:</strong> ${escapeHtml(block.value)}`
            : `<strong>${escapeHtml(block.text)}</strong>`
        }</div>`;
      }
      return `<p>${escapeHtml(block.text)}</p>`;
    })
    .join('');

export const toWordHtml = (title, body, template = {}) => {
  const paper = template.paper || {
    size: 'A4',
    margins: '20mm 15mm 20mm 30mm',
    font: 'Times New Roman',
    fontSize: '14pt'
  };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page {
        size: ${paper.size || 'A4'};
        margin: ${paper.margins || '20mm 15mm 20mm 30mm'};
      }

      body {
        margin: 0;
        background: #f3f4f6;
        color: #111827;
        font-family: "${paper.font || 'Times New Roman'}", serif;
        font-size: ${paper.fontSize || '14pt'};
        line-height: 1.5;
      }

      .page {
        box-sizing: border-box;
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: #ffffff;
        padding: ${paper.margins || '20mm 15mm 20mm 30mm'};
      }

      .recipient-block {
        margin-left: auto;
        max-width: 85mm;
        text-align: right;
        font-weight: 700;
      }

      .recipient-line {
        margin-left: auto;
        max-width: 95mm;
        text-align: left;
        line-height: 1.35;
      }

      .recipient-line:first-child {
        font-weight: 700;
      }

      .recipient-spacer {
        height: 2.5mm;
      }

      h1 {
        margin: 10mm 0 2mm;
        text-align: center;
        font-size: 16pt;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .document-subtitle {
        margin: 0 0 7mm;
        text-align: center;
      }

      h2 {
        margin: 6mm 0 2mm;
        font-size: 14pt;
        font-weight: 700;
      }

      p {
        margin: 0 0 2.5mm;
        text-align: justify;
      }

      .list-item {
        margin-left: 8mm;
        text-indent: -6mm;
      }

      .spacer {
        height: 3mm;
      }

      @media print {
        body {
          background: #ffffff;
        }

        .page {
          width: auto;
          min-height: auto;
          margin: 0;
          padding: 0;
        }

      }
    </style>
  </head>
  <body>
    <main class="page">
      ${renderOfficialLines(body)}
    </main>
  </body>
</html>`;
};

export const downloadBlob = (name, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

export const slugifyDocumentName = (text, fallback) =>
  String(text || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff\u0100-\u017f]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
