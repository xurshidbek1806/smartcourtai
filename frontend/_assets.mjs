import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SHOTS = 'c:/Users/admin/Desktop/cdTZ.md/smartcourt-frontend/_shots';
const data = (f) => 'data:image/png;base64,' + readFileSync(`${SHOTS}/${f}`).toString('base64');

const browser = await chromium.launch();

// ── 1. Logo (Solarized blue scales, transparent) ─────────────
{
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 40 40" fill="none"
    stroke="#268BD2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="20" cy="8.6" r="1.7" fill="#268BD2" stroke="none"/>
    <path d="M6 11 H34"/><path d="M8 11 L5 18.5 M8 11 L11 18.5" stroke-width="1.3"/>
    <path d="M3.5 18.5 Q8 24 12.5 18.5" stroke-width="1.7"/>
    <path d="M32 11 L29 18.5 M32 11 L35 18.5" stroke-width="1.3"/>
    <path d="M27.5 18.5 Q32 24 36.5 18.5" stroke-width="1.7"/>
    <path d="M20 11 c6 2 6 7 0 9 c-6 2 -6 7 0 9" stroke-width="2.6"/>
    <path d="M20 29 V33 M13.5 33.5 H26.5" stroke-width="2.2"/></svg>`;
  const html = `<!doctype html><html><body style="margin:0;width:400px;height:400px;background:transparent;display:flex;align-items:center;justify-content:center">${svg}</body></html>`;
  const p = await browser.newPage({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 2 });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.screenshot({ path: `${SHOTS}/_logo_blue.png`, omitBackground: true });
  await p.close();
}

// ── 2. Montage (2x2, Solarized-light background) ─────────────
{
  const cells = [
    [data('01-landing.png'), 'Landing'],
    [data('02-portal.png'), 'Fuqaro portali'],
    [data('05-smartjudge.png'), 'SmartJudge — qaror'],
    [data('07-corruption-graph.png'), 'CorruptAlert grafi']
  ];
  const W = 1200, H = 1000;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${W}px;height:${H}px}
    body{background:#EEE8D5;font-family:Consolas,'Courier New',monospace;
      display:flex;flex-direction:column;justify-content:center;gap:30px;padding:44px 42px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:30px 30px}
    .cell{display:flex;flex-direction:column;gap:11px}
    .thumb{width:100%;aspect-ratio:16/9;object-fit:cover;object-position:top center;
      border-radius:12px;border:1px solid #D9D2BC;box-shadow:0 12px 30px rgba(7,54,66,.14)}
    .cap{font-size:19px;color:#586E75;letter-spacing:.2px;text-align:center}
  </style></head><body><div class="grid">
    ${cells.map(([s, c]) => `<div class="cell"><img class="thumb" src="${s}"><div class="cap">${c}</div></div>`).join('')}
  </div></body></html>`;
  const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${SHOTS}/_montage_light.png`, clip: { x: 0, y: 0, width: W, height: H } });
  await p.close();
}

await browser.close();
console.log('ASSETS -> _logo_blue.png, _montage_light.png');
