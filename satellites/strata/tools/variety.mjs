#!/usr/bin/env node
/* THE GATE A HUMAN READS.
 *
 *   node tools/variety.mjs            fifty seeds
 *   node tools/variety.mjs 700        fifty seeds starting at 700
 *
 * Fifty animals from the grammar, drawn as silhouettes, ten across and five
 * down, into docs/shots/p0-variety.png.
 *
 * ⛔ NO MACHINE CAN PASS THIS. The rule in the plan's section 0 is: open the
 * sheet with the Read tool, count the ones you would take a screenshot of, and
 * if it is fewer than five, DEEPEN THE GRAMMAR and run it again. Write both
 * counts in the ledger. A generator can satisfy every assertion in sim.js and
 * still make fifty of the same animal, and this is the only thing that sees it.
 *
 * The drawing here is deliberately plain: filled polygons, no shading, no
 * dust. The question the sheet answers is whether the SHAPES differ, and paint
 * would flatter them.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');
const cut = (a, b) => {
  const i = HTML.indexOf(a), j = HTML.indexOf(b);
  if (i < 0 || j < 0) throw new Error('marker not found');
  return HTML.slice(i + a.length, j);
};
const SIM = cut('// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
const S = new Function(SIM + '\nreturn {species, bones, boneBounds, identity, mixSeed, CONFIG};')();

const START = parseInt(process.argv[2] || '0', 10) || 0;
const COLS = 10, ROWS = 5, CW = 210, CH = 190;

const specimens = [];
for (let i = 0; i < COLS * ROWS; i++) {
  const seed = S.mixSeed(20260906, START + i);
  const era = i % S.CONFIG.BANDS;
  const sp = S.species(seed, era);
  const bs = S.bones(sp);
  const id = S.identity(sp, seed, '');
  specimens.push({
    polys: bs.map(b => b.poly.map(p => [Math.round(p.x * 100) / 100, Math.round(p.y * 100) / 100])),
    b: S.boneBounds(bs),
    label: sp.plan.slice(0, 4) + ' ' + sp.sizeKey.slice(0, 3) + ' ' + sp.skull.slice(0, 4)
      + (sp.ornament === 'none' ? '' : ' ' + sp.ornament.slice(0, 4)),
    name: id.genus,
    n: bs.length
  });
}

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: COLS * CW, height: ROWS * CH, deviceScaleFactor: 1 });
await page.setContent('<style>html,body{margin:0;background:#EFE2C8}canvas{display:block}</style>'
  + '<canvas id="c" width="' + (COLS * CW) + '" height="' + (ROWS * CH) + '"></canvas>');
await page.evaluate((specs, COLS, CW, CH) => {
  const c = document.getElementById('c').getContext('2d');
  c.fillStyle = '#EFE2C8';
  c.fillRect(0, 0, COLS * CW, 5 * CH);
  specs.forEach((s, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    const ox = col * CW, oy = row * CH;
    c.save();
    c.strokeStyle = '#D6C29A';
    c.lineWidth = 1;
    c.strokeRect(ox + 0.5, oy + 0.5, CW - 1, CH - 1);
    const w = Math.max(0.01, s.b.x1 - s.b.x0), h = Math.max(0.01, s.b.y1 - s.b.y0);
    const k = Math.min((CW - 22) / w, (CH - 40) / h);
    const px = x => ox + CW / 2 + (x - (s.b.x0 + s.b.x1) / 2) * k;
    const py = y => oy + (CH - 22) / 2 + 6 + (y - (s.b.y0 + s.b.y1) / 2) * k;
    c.fillStyle = '#3B2F1F';
    for (const poly of s.polys) {
      c.beginPath();
      c.moveTo(px(poly[0][0]), py(poly[0][1]));
      for (let j = 1; j < poly.length; j++) c.lineTo(px(poly[j][0]), py(poly[j][1]));
      c.closePath();
      c.fill();
    }
    c.fillStyle = '#7A6440';
    c.font = '11px ui-monospace, Menlo, monospace';
    c.textAlign = 'center';
    c.fillText(s.label + '  ' + s.n, ox + CW / 2, oy + CH - 8);
    c.fillStyle = '#9A8459';
    c.font = '10px ui-monospace, Menlo, monospace';
    c.fillText(s.name, ox + CW / 2, oy + 13);
    c.restore();
  });
}, specimens, COLS, CW, CH);

const buf = await page.screenshot({ type: 'png' });
await browser.close();
writeFileSync(join(ROOT, 'docs', 'shots', 'p0-variety.png'), buf);
console.log('  docs/shots/p0-variety.png  ' + (buf.length / 1024).toFixed(0) + ' KB   '
  + (COLS * CW) + 'x' + (ROWS * CH) + '   seeds ' + START + ' to ' + (START + COLS * ROWS - 1));
console.log('');
console.log('⛔ NOW OPEN IT. Count the ones you would take a screenshot of.');
console.log('   Fewer than five means the grammar is not deep enough yet.');
console.log('VARIETY SHEET WRITTEN');
