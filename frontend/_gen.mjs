import pptxgen from 'pptxgenjs';

const SHOTS = 'c:/Users/admin/Desktop/cdTZ.md/smartcourt-frontend/_shots';
const OUT = 'c:/Users/admin/Desktop/cdTZ.md/smartcourt-frontend/SmartCourt-AI-Pitch.pptx';

// ── Solarized Light palette ──────────────────────────────────
const C = {
  bg: 'FDF6E3', card: 'FFFFFF', cardBorder: 'EAE1C8', cardAlt: 'F5EFDB', tint: 'F0E9D2',
  title: '073642', body: '586E75', muted: '93A1A1',
  blue: '268BD2', cyan: '2AA198', orange: 'CB4B16', yellow: 'B58900',
  green: '859900', red: 'DC322F', violet: '6C71C4', magenta: 'D33682'
};
const FONT = 'Calibri', MONO = 'Consolas';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'SC', width: 10, height: 5.625 });
pptx.layout = 'SC';
pptx.author = 'SmartCourt AI';
pptx.title = 'SmartCourt AI — Pitch Day taqdimoti';

const slide = () => { const s = pptx.addSlide(); s.background = { color: C.bg }; return s; };
const noLine = { width: 0 };
const SH = (op = 0.12) => ({ type: 'outer', color: '8A7E55', blur: 9, offset: 3, angle: 90, opacity: op });

function card(s, x, y, w, h, o = {}) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: o.rad ?? 0.09,
    fill: { color: o.fill || C.card }, line: { color: o.border || C.cardBorder, width: 1 },
    shadow: o.shadow === false ? { type: 'none' } : SH(o.op)
  });
  if (o.top) s.addShape(pptx.ShapeType.roundRect, { x: x + 0.14, y: y - 0.005, w: w - 0.28, h: 0.06, rectRadius: 0.03, fill: { color: o.top }, line: noLine });
  if (o.left) s.addShape(pptx.ShapeType.roundRect, { x: x - 0.005, y: y + 0.14, w: 0.06, h: h - 0.28, rectRadius: 0.03, fill: { color: o.left }, line: noLine });
}

function head(s, num, title, subtitle, accent = C.blue) {
  s.addText(title, { x: 0.5, y: 0.3, w: 8.2, h: 0.6, fontFace: FONT, fontSize: 25, bold: true, color: C.title, valign: 'middle' });
  s.addText(num, { x: 8.85, y: 0.32, w: 0.65, h: 0.45, fontFace: MONO, fontSize: 16, bold: true, color: accent, align: 'right', valign: 'middle' });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.52, y: 1.04, w: 0.05, h: 0.34, rectRadius: 0.02, fill: { color: accent }, line: noLine });
  s.addText(subtitle, { x: 0.68, y: 1.0, w: 8.6, h: 0.42, fontFace: FONT, fontSize: 12.5, italic: true, color: C.body, valign: 'middle' });
}

function foot(s, tip) {
  s.addShape(pptx.ShapeType.line, { x: 0.5, y: 5.17, w: 9.0, h: 0, line: { color: 'E7DEC6', width: 1 } });
  if (tip) s.addText([{ text: '◦  ', options: { color: C.yellow } }, { text: tip, options: { color: C.muted } }],
    { x: 0.5, y: 5.2, w: 7.4, h: 0.32, fontFace: FONT, fontSize: 9.5, italic: true, valign: 'middle' });
  s.addText('#MilliyAIXakaton · 2026', { x: 7.4, y: 5.2, w: 2.1, h: 0.32, fontFace: MONO, fontSize: 9, color: C.muted, align: 'right', valign: 'middle' });
}

function sun(s) {
  s.addShape(pptx.ShapeType.ellipse, { x: 7.55, y: -1.7, w: 4.4, h: 4.4, fill: { color: C.yellow, transparency: 90 }, line: noLine });
  s.addShape(pptx.ShapeType.ellipse, { x: 8.25, y: -1.15, w: 3.0, h: 3.0, fill: { color: C.orange, transparency: 90 }, line: noLine });
  s.addShape(pptx.ShapeType.ellipse, { x: 8.95, y: -0.6, w: 1.7, h: 1.7, fill: { color: C.orange, transparency: 82 }, line: noLine });
}

// ═══ SLIDE 1 — COVER ═════════════════════════════════════════
{
  const s = slide();
  sun(s);
  s.addText('PITCH DAY', { x: 0.6, y: 0.55, w: 4, h: 0.3, fontFace: MONO, fontSize: 12, bold: true, color: C.blue, charSpacing: 2 });
  s.addText('Loyiha taqdimoti', { x: 0.6, y: 0.9, w: 4, h: 0.3, fontFace: FONT, fontSize: 12, color: C.muted });

  card(s, 0.62, 1.95, 1.75, 1.75, { rad: 0.16, op: 0.16 });
  s.addImage({ path: `${SHOTS}/_logo_blue.png`, x: 0.86, y: 2.19, w: 1.27, h: 1.27 });

  s.addText('SmartCourt AI', { x: 2.7, y: 2.0, w: 6.9, h: 0.95, fontFace: FONT, fontSize: 46, bold: true, color: C.title });
  s.addShape(pptx.ShapeType.roundRect, { x: 2.74, y: 3.0, w: 1.25, h: 0.07, rectRadius: 0.03, fill: { color: C.blue }, line: noLine });
  s.addText("Sud jarayonining butun zanjiri uchun to'liq lokal AI ekotizimi — ariza qabulidan qaror ijrosigacha.",
    { x: 2.72, y: 3.2, w: 6.5, h: 0.9, fontFace: FONT, fontSize: 15, italic: true, color: C.body, lineSpacingMultiple: 1.1 });

  s.addText([
    { text: 'On-premise', options: { color: C.green, bold: true } }, { text: '  ·  ', options: { color: C.muted } },
    { text: 'RAG', options: { color: C.blue, bold: true } }, { text: '  ·  ', options: { color: C.muted } },
    { text: 'Human-in-the-loop', options: { color: C.violet, bold: true } }, { text: '  ·  ', options: { color: C.muted } },
    { text: '10 AI moduli', options: { color: C.orange, bold: true } }
  ], { x: 2.72, y: 4.25, w: 6.8, h: 0.4, fontFace: FONT, fontSize: 13, valign: 'middle' });

  s.addText('#MilliyAIXakaton   ·   #BukharaAI   ·   2026',
    { x: 0.5, y: 5.15, w: 9, h: 0.35, fontFace: MONO, fontSize: 10, color: C.muted, align: 'center' });
}

// ═══ SLIDE 2 — BIZ KIMMIZ ════════════════════════════════════
{
  const s = slide();
  head(s, '02', 'Biz kimmiz?', "SmartCourt AI — O'zbekiston sudlari uchun to'liq on-premise (lokal) ishlaydigan sun'iy intellekt ekotizimi.");
  // montage card (left)
  card(s, 0.5, 1.55, 4.55, 3.5, { fill: C.cardAlt, op: 0.14 });
  s.addImage({ path: `${SHOTS}/_montage_light.png`, x: 0.62, y: 1.67, w: 4.31, h: 3.26 });
  // product card (right)
  card(s, 5.3, 1.55, 4.2, 3.5, { left: C.blue });
  s.addText('Mahsulot — butun zanjir', { x: 5.55, y: 1.78, w: 3.8, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: C.title });
  s.addShape(pptx.ShapeType.line, { x: 5.55, y: 2.32, w: 3.7, h: 0, line: { color: 'E7DEC6', width: 1 } });
  const bullets = [
    ['Ariza → tahlil → majlis → qaror → ijro: butun oqim bitta platformada', C.blue],
    ['10 ta AI moduli: ClaimValidator, SmartJudge, JustiScribe, CorruptAlert...', C.cyan],
    ["Barcha modellar lokal (Ollama) — ma'lumot tashqi serverga chiqmaydi", C.green]
  ];
  let by = 2.55;
  for (const [t, col] of bullets) {
    s.addShape(pptx.ShapeType.roundRect, { x: 5.56, y: by + 0.05, w: 0.12, h: 0.12, rectRadius: 0.03, fill: { color: col }, line: noLine });
    s.addText(t, { x: 5.8, y: by - 0.07, w: 3.5, h: 0.7, fontFace: FONT, fontSize: 12.5, color: C.body, valign: 'top', lineSpacingMultiple: 1.05 });
    by += 0.78;
  }
  foot(s, '5 interfeys: Fuqaro portali · Sudya paneli · Admin · Nazorat · Landing');
}

// ═══ SLIDE 3 — MUAMMO ════════════════════════════════════════
{
  const s = slide();
  head(s, '03', 'Siz hal qilayotgan muammo',
    "Sud jarayoni sekin, hujjatlar qo'lda yuritiladi; mavjud AI-yechimlar esa maxfiylikni buzadi.", C.orange);
  const probs = [
    ['01', C.orange, "Sekin, qo'lda jarayon",
      "Ariza, dalil, majlis bayoni va qaror alohida yuritiladi — bir ish oylab cho'ziladi, fuqaro adolatdan uzoqlashadi."],
    ['02', C.red, 'Bulutli AI = maxfiylik xavfi',
      'Tayyor AI-yechimlar sud sirlarini chet el serveriga (OpenAI) yuboradi — bu davlat maʼlumotlar suvereniteti talabiga zid.']
  ];
  let x = 0.5;
  for (const [n, col, t, d] of probs) {
    card(s, x, 1.65, 4.5, 3.25, { top: col });
    s.addShape(pptx.ShapeType.ellipse, { x: x + 0.3, y: 2.0, w: 0.62, h: 0.62, fill: { color: col, transparency: 86 }, line: { color: col, width: 1.25 } });
    s.addText(n, { x: x + 0.3, y: 2.0, w: 0.62, h: 0.62, fontFace: MONO, fontSize: 17, bold: true, color: col, align: 'center', valign: 'middle' });
    s.addText(t, { x: x + 1.1, y: 2.02, w: 3.2, h: 0.6, fontFace: FONT, fontSize: 16.5, bold: true, color: C.title, valign: 'middle' });
    s.addText(d, { x: x + 0.32, y: 2.95, w: 3.9, h: 1.7, fontFace: FONT, fontSize: 13, color: C.body, valign: 'top', lineSpacingMultiple: 1.18 });
    x += 4.7;
  }
  foot(s, "LLM 'gallyutsinatsiya' qiladi — mavjud bo'lmagan qonun moddasini to'qishi mumkin. Sud uchun bu falokat.");
}

// ═══ SLIDE 4 — BOZOR (TAM/SAM/SOM) ═══════════════════════════
{
  const s = slide();
  head(s, '04', 'Bozor hajmi va maqsadli auditoriya',
    "Davlat sud-huquq tizimini raqamlashtirish bozori — O'zbekiston va Markaziy Osiyo.", C.orange);
  const rows = [
    ['TAM', '~$120M', C.orange, 'Markaziy Osiyo davlat sud-huquq IT bozori (5 davlat)', 9.0],
    ['SAM', '~$25M', C.yellow, "O'zbekiston: ~200 sud, ~1500 sudya, yiliga ~4M ish", 7.4],
    ['SOM', '~$4M', C.green, '3 yilda 15–20%: pilot sudlar + Oliy sud integratsiyasi', 5.8]
  ];
  let y = 1.7;
  for (const [k, v, col, d, w] of rows) {
    card(s, 0.5, y, w, 1.0, { left: col });
    s.addText(k, { x: 0.72, y: y + 0.1, w: 1.1, h: 0.45, fontFace: MONO, fontSize: 20, bold: true, color: col, valign: 'middle' });
    s.addText(v, { x: 1.75, y: y + 0.1, w: 1.7, h: 0.45, fontFace: FONT, fontSize: 20, bold: true, color: C.title, valign: 'middle' });
    s.addText(d, { x: 0.74, y: y + 0.52, w: w - 0.5, h: 0.4, fontFace: FONT, fontSize: 12, color: C.body, valign: 'middle' });
    y += 1.14;
  }
  foot(s, 'Asosiy mijoz: Oliy sud, Sudlar departamenti, Adliya vazirligi (B2G).');
}

// ═══ SLIDE 5 — YECHIM + RAQOBAT (table) ══════════════════════
{
  const s = slide();
  head(s, '05', 'Yechim + Raqobatchilar tahlili',
    'On-premise + RAG + inson nazorati — bulutli yechimlar bera olmaydigan ustunlik.');
  const hc = (t, fill, color) => ({ text: t, options: { fill: { color: fill }, color, bold: true, align: 'center', valign: 'middle', fontSize: 12.5 } });
  const fc = (t) => ({ text: t, options: { align: 'left', color: C.title, bold: true, fontSize: 12, fill: { color: 'FFFFFF' }, valign: 'middle' } });
  const yes = (fill) => ({ text: '✓', options: { color: C.green, bold: true, fontSize: 16, align: 'center', valign: 'middle', fill: { color: fill } } });
  const no = (fill) => ({ text: '✕', options: { color: C.red, bold: true, fontSize: 13, align: 'center', valign: 'middle', fill: { color: fill } } });
  const US = 'E8F2FA';
  const rows = [
    [hc('Xususiyat', C.tint, C.title), hc('SmartCourt AI', C.blue, 'FFFFFF'), hc('Bulutli AI (ChatGPT)', C.tint, C.body), hc('Klassik e-sud', C.tint, C.body)],
    [fc("To'liq lokal (on-premise)"), yes(US), no('FFFFFF'), no('FFFFFF')],
    [fc('Tezkor AI javob'), yes(US), yes('FFFFFF'), no('FFFFFF')],
    [fc('Davlat tizimiga integratsiya'), yes(US), no('FFFFFF'), yes('FFFFFF')],
    [fc("O'zbek tili (lotin/kirill)"), yes(US), yes('FFFFFF'), yes('FFFFFF')]
  ];
  s.addTable(rows, {
    x: 0.5, y: 1.6, w: 9.0, colW: [2.7, 2.2, 2.2, 1.9], rowH: 0.5,
    fontFace: FONT, border: { type: 'solid', color: 'E7DEC6', pt: 1 }, valign: 'middle'
  });
  // bottom banner
  card(s, 0.5, 4.35, 9.0, 0.62, { fill: C.tint, top: C.blue, op: 0.1 });
  s.addText('Nega SmartCourt AI?  —  Lokal + RAG + inson nazorati birga',
    { x: 0.5, y: 4.36, w: 9, h: 0.6, fontFace: FONT, fontSize: 15, bold: true, color: C.title, align: 'center', valign: 'middle' });
}

// ═══ SLIDE 6 — MONETIZATSIYA ═════════════════════════════════
{
  const s = slide();
  head(s, '06', 'Monetizatsiya modeli',
    'B2G litsenziya modeli — davlat sud organlariga yillik obuna + on-prem joriy etish.', C.green);
  const cards = [
    ["Kim to'laydi?", 'Oliy sud · Sudlar departamenti · Adliya vazirligi (B2G)'],
    ["Qancha to'laydi?", 'Har sud uchun yillik litsenziya + bir martalik on-prem joriy etish'],
    ['Nima uchun?', "Ish ko'rish 3–5x tez · qog'oz xarajati past · maxfiylik kafolati"]
  ];
  let x = 0.5;
  for (const [t, d] of cards) {
    card(s, x, 1.65, 2.93, 3.25, { top: C.green });
    s.addText(t, { x: x + 0.25, y: 1.95, w: 2.45, h: 0.5, fontFace: FONT, fontSize: 16, bold: true, color: C.green, valign: 'middle' });
    s.addShape(pptx.ShapeType.line, { x: x + 0.25, y: 2.5, w: 2.43, h: 0, line: { color: 'E7DEC6', width: 1 } });
    s.addText(d, { x: x + 0.27, y: 2.7, w: 2.45, h: 1.9, fontFace: FONT, fontSize: 13.5, color: C.body, valign: 'top', lineSpacingMultiple: 1.2 });
    x += 3.07;
  }
  foot(s, "On-prem = doimiy bulut to'lovsiz, internetsiz ishlaydi — egalik narxi (TCO) past.");
}

// ═══ SLIDE 7 — MILESTONES ════════════════════════════════════
{
  const s = slide();
  head(s, '07', 'Milestones — Maqsadlar va KPI',
    'MVP tayyor — pilotdan respublika miqyosiga 3 yillik reja.');
  const nodes = [
    ['Hozir', C.blue, 'MVP tayyor', '1 demo sud'],
    ['6 oy', C.cyan, '5 sud · 300+ sudya', '~$120K / yil'],
    ['1 yil', C.violet, '40 sud · 1200 sudya', '~$800K / yil'],
    ['3 yil', C.green, 'Respublika miqyosi', 'Kengayish']
  ];
  const lineY = 3.15, x0 = 1.15, dx = 2.45;
  s.addShape(pptx.ShapeType.line, { x: x0, y: lineY, w: dx * 3, h: 0, line: { color: 'D9CFB3', width: 2 } });
  nodes.forEach(([p, col, a, b], i) => {
    const cx = x0 + dx * i;
    const above = i % 2 === 0;
    // connector + node
    s.addShape(pptx.ShapeType.ellipse, { x: cx - 0.1, y: lineY - 0.1, w: 0.2, h: 0.2, fill: { color: col }, line: { color: C.bg, width: 1.5 } });
    const cardY = above ? 1.75 : 3.55;
    s.addShape(pptx.ShapeType.line, { x: cx, y: above ? 2.75 : lineY, w: 0, h: above ? lineY - 2.75 : 0.8, line: { color: col, width: 1.5 } });
    card(s, cx - 1.05, cardY, 2.1, 1.0, { top: col, op: 0.1 });
    s.addText(p, { x: cx - 1.05, y: cardY + 0.08, w: 2.1, h: 0.32, fontFace: MONO, fontSize: 13, bold: true, color: col, align: 'center' });
    s.addText(a, { x: cx - 1.0, y: cardY + 0.4, w: 2.0, h: 0.3, fontFace: FONT, fontSize: 11.5, bold: true, color: C.title, align: 'center' });
    s.addText(b, { x: cx - 1.0, y: cardY + 0.66, w: 2.0, h: 0.3, fontFace: FONT, fontSize: 11, color: C.body, align: 'center' });
  });
  foot(s, 'Joriy holat: 10 AI moduli + 5 interfeys ishlaydigan MVP tayyor.');
}

// ═══ SLIDE 8 — JAMOA ═════════════════════════════════════════
{
  const s = slide();
  head(s, '08', 'Jamoa', "SmartCourt AI jamoasi — rollar va mas'uliyat sohalari.");
  const team = [
    ['👤', C.blue, 'CEO / Loyiha rahbari'],
    ['💻', C.cyan, 'CTO / Bosh dasturchi'],
    ['🎨', C.violet, 'Designer / UI-UX'],
    ['📊', C.green, 'Biznes analitik']
  ];
  let x = 0.5;
  const w = 2.16, gap = 0.245;
  for (const [emo, col, role] of team) {
    card(s, x, 1.6, w, 3.35, { top: col });
    s.addShape(pptx.ShapeType.ellipse, { x: x + w / 2 - 0.5, y: 1.95, w: 1.0, h: 1.0, fill: { color: col, transparency: 85 }, line: { color: col, width: 1.25 } });
    s.addText(emo, { x: x + w / 2 - 0.5, y: 1.95, w: 1.0, h: 1.0, fontSize: 30, align: 'center', valign: 'middle' });
    s.addText('F.I.Sh.', { x: x + 0.1, y: 3.12, w: w - 0.2, h: 0.35, fontFace: FONT, fontSize: 15, bold: true, color: C.title, align: 'center' });
    s.addText(role, { x: x + 0.1, y: 3.5, w: w - 0.2, h: 0.3, fontFace: FONT, fontSize: 11.5, bold: true, color: col, align: 'center' });
    s.addShape(pptx.ShapeType.line, { x: x + 0.45, y: 3.92, w: w - 0.9, h: 0, line: { color: 'E7DEC6', width: 1 } });
    s.addText('Tajriba va koʻnikmalar', { x: x + 0.1, y: 4.0, w: w - 0.2, h: 0.3, fontFace: FONT, fontSize: 10.5, italic: true, color: C.muted, align: 'center' });
    s.addText('_____ yil tajriba', { x: x + 0.1, y: 4.45, w: w - 0.2, h: 0.3, fontFace: FONT, fontSize: 11, color: C.body, align: 'center' });
    x += w + gap;
  }
  foot(s, null);
}

await pptx.writeFile({ fileName: OUT });
console.log('DECK ->', OUT);
