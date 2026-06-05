/**
 * Real backend wiring for the data-driven (ConfiguredPage) routes.
 *
 * LOADERS: route pattern -> async () => ({ columns, rows }) to populate a
 *          live table when the page opens.
 * RUNNERS: route pattern -> { fields, run } where run(formValues) calls a
 *          real AI endpoint and returns a structured result to display.
 */
import {
  adminListUsers,
  aiAnonimusLaw,
  aiEvidenceText,
  aiLexPredictor,
  aiMediatoBot,
  aiSentencAi,
  ensureAuth,
  searchLaws,
  searchPrecedents,
  uploadDocument
} from '@/lib/api';

// ── Live data loaders (tables) ──────────────────────────────
export const LOADERS = {
  '/portal/library/laws': async () => {
    const { items } = await searchLaws('', 50);
    return {
      columns: ['Kodeks', 'Modda', 'Mavzu'],
      rows: items.map((l) => [l.code_name || l.code, `${l.article}-modda`, l.title])
    };
  },
  '/judge/laws': async () => {
    const { items } = await searchLaws('', 50);
    return {
      columns: ['Kodeks', 'Modda', 'Tavsif'],
      rows: items.map((l) => [l.code_name || l.code, l.article, l.title])
    };
  },
  '/portal/library/precedents': async () => {
    const { items } = await searchPrecedents('', 50);
    return {
      columns: ['Ish', 'Yo‘nalish', 'Sud', 'Natija'],
      rows: items.map((p) => [p.reference, p.dispute_type, p.court || '—', p.outcome])
    };
  },
  '/judge/precedents': async () => {
    const { items } = await searchPrecedents('', 50);
    return {
      columns: ['Ish', 'Yo‘nalish', 'Natija', 'Sud'],
      rows: items.map((p) => [p.reference, p.dispute_type, p.outcome, p.court || '—'])
    };
  },
  '/admin/users': async () => {
    await ensureAuth('admin');
    const users = await adminListUsers();
    return {
      columns: ['F.I.Sh', 'Email', 'Rol', 'Holat'],
      rows: users.map((u) => [
        u.full_name || '—',
        u.email,
        u.role,
        u.is_verified ? 'Tasdiqlangan' : 'Kutilmoqda'
      ])
    };
  },
  '/admin/users/judges': async () => {
    await ensureAuth('admin');
    const users = await adminListUsers('judge');
    return { columns: ['Sudya', 'Email', 'Rol', 'Holat'], rows: users.map((u) => [u.full_name, u.email, u.role, u.is_verified ? 'Faol' : 'Kutilmoqda']) };
  },
  '/admin/users/citizens': async () => {
    await ensureAuth('admin');
    const users = await adminListUsers('citizen');
    return { columns: ['Fuqaro', 'Email', 'Rol', 'Holat'], rows: users.map((u) => [u.full_name, u.email, u.role, u.is_verified ? 'Faol' : 'Kutilmoqda']) };
  }
};

// ── AI action runners ───────────────────────────────────────
export const RUNNERS = {
  '/judge/ai-tools/lex-predictor': {
    fields: [
      { key: 'description', label: 'Ish holatlari', type: 'textarea' },
      { key: 'dispute_type', label: 'Nizo turi (labor/civil/economic/family...)', type: 'text' }
    ],
    run: async (v) => {
      await ensureAuth('judge');
      const r = await aiLexPredictor({
        description: v.description || '',
        dispute_type: v.dispute_type || 'civil'
      });
      return {
        title: `Yutish ehtimoli: ${r.win_probability}%`,
        lines: [
          `O‘xshash pretsedentlar: ${r.similar_cases_found}`,
          ...(r.precedents || []).map(
            (p) => `${p.reference} — ${p.outcome} (${Math.round((p.similarity || 0) * 100)}%)`
          ),
          ...(r.relevant_laws || []).map((l) => `${l.code} ${l.article}-modda: ${l.title}`)
        ],
        raw: r
      };
    }
  },
  '/judge/ai-tools/sentencai': {
    fields: [
      { key: 'offense', label: 'Huquqbuzarlik (modda)', type: 'text' },
      { key: 'circumstances', label: 'Holatlar (yengillashtiruvchi/og‘irlashtiruvchi)', type: 'textarea' }
    ],
    run: async (v) => {
      await ensureAuth('judge');
      const r = await aiSentencAi({ offense: v.offense || '', circumstances: v.circumstances || '' });
      return { title: 'SentencAI tavsiyasi', lines: flatten(r), raw: r };
    }
  },
  '/judge/ai-tools/anonimus-law': {
    fields: [{ key: 'text', label: 'Qaror matni', type: 'textarea' }],
    run: async (v) => {
      await ensureAuth('judge');
      const r = await aiAnonimusLaw(v.text || '');
      return {
        title: 'Anonimlashtirilgan matn',
        lines: [r.anonymized || r.text || JSON.stringify(r)],
        raw: r
      };
    }
  },
  '/judge/ai-tools/evidence-analyzer': {
    loadingText: 'AI hujjatni tahlil qilmoqda — matn ajratish, faktlar va xavf belgilarini aniqlash...',
    fields: [
      {
        key: 'file',
        label: 'Dalil fayli (PDF, DOCX, JPG, PNG, MP3, MP4)',
        type: 'file',
        accept: '.pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.mov'
      },
      { key: 'text', label: 'Yoki matn ko‘rinishida kiriting', type: 'textarea' }
    ],
    run: async (v) => {
      await ensureAuth('judge');
      if (v.file instanceof File) {
        const r = await uploadDocument(v.file, { analyze: true });
        return {
          title: 'Dalil tahlili tayyor',
          meta: [
            `Fayl: ${r.filename}`,
            `Hajm: ${Math.round((r.size_bytes || 0) / 1024)} KB`,
            `Turi: ${r.kind}`,
            `Matn ajratildi: ${r.text_extracted ? 'ha' : 'yo‘q'}`
          ],
          sections: evidenceSections(r.ai_analysis),
          raw: r
        };
      }
      const r = await aiEvidenceText(v.text || '');
      return {
        title: 'Dalil tahlili tayyor',
        sections: evidenceSections(r),
        raw: r
      };
    }
  },
  '/portal/mediation': {
    fields: [
      { key: 'dispute_type', label: 'Nizo turi', type: 'text' },
      { key: 'amount', label: 'Summa', type: 'text' },
      { key: 'description', label: 'Nizo tavsifi', type: 'textarea' }
    ],
    run: async (v) => {
      await ensureAuth('citizen');
      const r = await aiMediatoBot({
        dispute_type: v.dispute_type || 'civil',
        amount: Number(String(v.amount).replace(/[^\d.]/g, '')) || 0,
        description: v.description || ''
      });
      return { title: 'MediatoBot taklifi', lines: flatten(r), raw: r };
    }
  }
};

function evidenceSections(a) {
  if (!a || typeof a !== 'object') {
    return [{ label: 'Tahlil natijasi', text: 'AI tahlil natijasi qaytmadi.' }];
  }
  if (a.raw && typeof a.raw === 'string') {
    return [{ label: 'AI javobi', text: a.raw }];
  }
  const items = (v) => (Array.isArray(v) ? v.filter(Boolean).map((x) => String(x)) : []);
  const out = [];
  if (a.summary) out.push({ label: 'Qisqacha xulosa', text: String(a.summary) });
  if (items(a.facts).length) out.push({ label: 'Aniqlangan faktlar', items: items(a.facts) });
  if (items(a.key_dates).length) out.push({ label: 'Muhim sanalar', items: items(a.key_dates) });
  if (items(a.amounts).length) out.push({ label: 'Summa va miqdorlar', items: items(a.amounts) });
  if (items(a.named_parties).length) out.push({ label: 'Tomonlar', items: items(a.named_parties) });
  if (items(a.risk_notes).length)
    out.push({ label: 'Xavf belgilari', items: items(a.risk_notes), tone: 'warn' });
  if (!out.length) out.push({ label: 'Natija', text: 'Hujjatdan huquqiy fakt topilmadi.' });
  return out;
}

function flatten(obj, prefix = '') {
  const out = [];
  for (const [k, val] of Object.entries(obj || {})) {
    if (k === 'raw' || k === 'parse_error') continue;
    if (Array.isArray(val)) {
      out.push(`${prefix}${k}: ${val.map((x) => (typeof x === 'object' ? JSON.stringify(x) : x)).join('; ')}`);
    } else if (val && typeof val === 'object') {
      out.push(...flatten(val, `${k}.`));
    } else {
      out.push(`${prefix}${k}: ${val}`);
    }
  }
  return out;
}
