const GENERATED_AT_FORMATTER = new Intl.DateTimeFormat('uz-UZ', {
  dateStyle: 'long',
  timeStyle: 'short'
});

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
  return claimTemplates.civil_claim;
};

const valueOrBlank = (value, fallback = '________________') => {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
};

const getClaimParties = (form) => ({
  claimant: {
    name: valueOrBlank(form.claimantName, '________________'),
    id: valueOrBlank(form.claimantPinfl, '________________'),
    address: valueOrBlank(form.claimantAddress, '________________'),
    phone: valueOrBlank(form.claimantPhone, '________________')
  },
  respondent: {
    name: valueOrBlank(form.respondentName ?? form.fullName, '________________'),
    id: valueOrBlank(form.respondentPinfl ?? form.pinfl, '________________'),
    address: valueOrBlank(form.respondentAddress ?? form.address, '________________'),
    phone: valueOrBlank(form.respondentPhone ?? form.phone, '________________')
  }
});

const listFiles = (files = []) => {
  if (!files.length) return '1. ________________________________';
  return files.map((file, index) => `${index + 1}. ${file.name} — ${file.result}`).join('\n');
};

export const buildClaimDocument = ({ form, uploadedFiles = [], validation = null }) => {
  const template = getClaimTemplateByDispute(form.selectedType);
  const isEconomic = template.id === 'economic_claim';
  const isAdministrative = template.id === 'administrative_claim';
  const parties = getClaimParties(form);
  const courtName = isEconomic
    ? '________________ iqtisodiy sudiga'
    : isAdministrative
      ? '________________ ma’muriy sudiga'
      : '________________ fuqarolik ishlari bo‘yicha sudiga';
  const generatedAt = GENERATED_AT_FORMATTER.format(new Date());

  return `${courtName}

Da’vogar: ${parties.claimant.name}
PINFL / INN: ${parties.claimant.id}
Manzil / rekvizitlar: ${parties.claimant.address}
Telefon / email: ${parties.claimant.phone}

Javobgar: ${parties.respondent.name}
Javobgar turi: ${valueOrBlank(form.partyType)}
PINFL / INN: ${parties.respondent.id}
Manzil / rekvizitlar: ${parties.respondent.address}
Telefon / email: ${parties.respondent.phone}

${valueOrBlank(form.title, 'DA’VO ARIZASI').toUpperCase()}

1. Da’vogarning talabi
${valueOrBlank(form.title)}

2. Da’vo bahosi va hisob-kitob
${valueOrBlank(form.amount, 'Da’vo bahosi ko‘rsatilmagan')}

3. Ish holatlari
${valueOrBlank(form.description, 'Ish holatlari to‘ldirilmagan')}

4. Talabni tasdiqlovchi dalillar
${listFiles(uploadedFiles)}

5. Huquqiy asos
${template.basis.join(', ')}

6. Sudgacha hal qilish tartibi
${
  isEconomic
    ? 'Talabnoma yuborilganligi va natijasi ko‘rsatiladi.'
    : isAdministrative
      ? 'Ma’muriy organga murojaat qilinganligi yoki qaror/harakat ustidan shikoyat asoslari ko‘rsatiladi.'
      : 'Qonun yoki shartnomada nazarda tutilgan bo‘lsa, sudgacha tartib ko‘rsatiladi.'
}

7. Ilovalar ro‘yxati
${listFiles(uploadedFiles)}

8. AI tekshiruv eslatmasi
${validation?.summary || 'ClaimValidator tekshiruvi hali bajarilmagan yoki backend javobi yo‘q.'}

Sana: ${valueOrBlank(form.eventDate, generatedAt)}
Imzo / ERI: ________________________________`;
};

export const buildClaimMetadata = ({ form, uploadedFiles = [], validation = null }) => {
  const template = getClaimTemplateByDispute(form.selectedType);
  return {
    document_type: 'claim',
    template_id: template.id,
    template_name: template.name,
    recommended_formats: ['doc', 'pdf', 'json'],
    paper: template.paper,
    production_note: 'Yakuniy topshirish uchun PDF/PDF-A va ERI backendda shakllantiriladi.',
    legal_basis: template.basis,
    required_fields: template.requiredFields,
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

const renderOfficialLines = (body) => {
  const lines = String(body ?? '').split('\n');
  let html = '';
  let firstBlock = true;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      html += '<div class="spacer"></div>';
      continue;
    }

    if (firstBlock) {
      html += `<div class="recipient-block">${escapeHtml(line)}</div>`;
      firstBlock = false;
      continue;
    }

    if (/^(DA’VO ARIZASI|SUD HAL QILUV QARORI QORALAMASI)$/i.test(line)) {
      html += `<h1>${escapeHtml(line)}</h1>`;
      continue;
    }

    if (/^(KIRISH QISMI|BAYON QISMI|ASOSLANTIRUVCHI QISM|XULOSA QISMI)$/i.test(line)) {
      html += `<h2>${escapeHtml(line)}</h2>`;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      html += `<h2>${escapeHtml(line)}</h2>`;
      continue;
    }

    if (
      /^(Da’vogar|Javobgar|PINFL \/ INN|Manzil|Telefon|Sana|Imzo|Sudya imzosi|Sud \/ sudya|Ish raqami|Ish nomi|Nizo turi|Taraflar|Huquqiy shablon|Asos|Yaratilgan vaqt):/.test(
        line
      )
    ) {
      const [label, ...rest] = line.split(':');
      html += `<p><strong>${escapeHtml(label)}:</strong>${escapeHtml(rest.join(':') ? ` ${rest.join(':').trim()}` : '')}</p>`;
      continue;
    }

    html += `<p>${escapeHtml(line)}</p>`;
  }

  return html;
};

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

      .template-meta {
        border-bottom: 1px solid #d1d5db;
        color: #6b7280;
        font-family: Arial, sans-serif;
        font-size: 9pt;
        margin-bottom: 12mm;
        padding-bottom: 4mm;
      }

      .recipient-block {
        margin-left: auto;
        max-width: 85mm;
        text-align: right;
        font-weight: 700;
      }

      h1 {
        margin: 10mm 0 8mm;
        text-align: center;
        font-size: 16pt;
        letter-spacing: 0.02em;
        text-transform: uppercase;
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

        .template-meta {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <div class="template-meta">
        Shablon: ${escapeHtml(title)} · Qog‘oz: ${escapeHtml(paper.size || 'A4')} · Format: DOC/PDF uchun rasmiy struktura
      </div>
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
