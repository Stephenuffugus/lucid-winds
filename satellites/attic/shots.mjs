/* THE ATTIC — screenshot walk that ASSERTS the screen after every step.
   node satellites/attic/shots.mjs [outDir]
   Server assumed at 127.0.0.1:8777 serving the repo root.

   ⛔ A walk script that logs "tapped" without checking that anything changed
   is lying to you. Every step here declares what must be true AFTER it, and
   throws with the live DOM state if it is not. */
import puppeteer from 'puppeteer';
import fs from 'fs';

const OUT = process.argv[2] || '/tmp/attic-shots';
const PORT = process.env.PORT || 8777;
const BASE = `http://127.0.0.1:${PORT}/satellites/attic/?attictest=1&probe=`;
fs.mkdirSync(OUT, { recursive: true });

const PORTRAIT = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const LAND = { width: 915, height: 412, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const H = {
  record: '273926d44ff38a58750e6737e1f960204d9ff2dd707fd1fb6414dd4c8b204e81',
  vhs: '646250325e2d17720860b8798db028267cc91263d29ce1a963b46428e4c93d09',
  toy: 'ae8e25da927fff7a835cd3b6e023e20b18fd60c0d4318d8adab5572f613eb5e7',
  game: 'cd2c7ebd9279c38fbc8b71fef640ba93520e533e44605d043ce73aea8c94c5a8',
  cereal: 'ed9db91771e485c920e44818d51849ef87ac59328c11c66adf30810b848fc06d',
  sealed: '7986ff256b69daf04bc0cf169d5729cabbde3a697ddb1086f1c949fe2c3fb648',
  trashedToy: 'b4fc08bc895147be67e7770558c6b9bd94610a43055e82d8d9bd9d7c05baf116'
};

const errs = [];
let shotN = 0;
const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await br.newPage();
p.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
await p.setViewport(PORTRAIT);
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });

function state() {
  return p.evaluate(() => ({
    how: (document.getElementById('howSheet') || {}).className || '',
    card: (document.getElementById('card') || {}).className || '',
    graded: !!document.querySelector('#gs.graded'),
    plate: (document.getElementById('gp') || {}).textContent || '',
    plateVisible: !!(document.getElementById('gp') && getComputedStyle(document.getElementById('gp')).display !== 'none'),
    name: (document.getElementById('nmSlot') || {}).textContent || '',
    unwiped: /UNWIPED/.test((document.getElementById('artSlot') || {}).innerHTML || ''),
    tix: (document.getElementById('tixN') || {}).textContent || '',
    shelfN: document.querySelectorAll('#shelf .slot').length,
    shelfVis: (document.getElementById('shelfWrap') || {}).style.display,
    want: (document.getElementById('wantSheet') || {}).className || '',
    dust: (document.getElementById('dustSheet') || {}).className || '',
    dustCells: document.querySelectorAll('#dustGrid .dcell').length,
    dustWiped: document.querySelectorAll('#dustGrid .dcell.wiped').length,
    broke: (document.getElementById('brokenote') || {}).textContent || '',
    goDisabled: !!(document.getElementById('go') || {}).disabled,
    toast: (document.getElementById('toast') || {}).textContent || ''
  }));
}
function must(label, cond, s) {
  if (!cond) { console.log('ASSERT FAILED: ' + label + '\n  state: ' + JSON.stringify(s)); throw new Error('assert: ' + label); }
  console.log('  ok  ' + label);
}
async function shot(name, land) {
  if (land) await p.setViewport(LAND);
  const f = `${OUT}/${String(++shotN).padStart(2, '0')}_${name}${land ? '_land' : ''}.png`;
  await p.screenshot({ path: f });
  if (land) await p.setViewport(PORTRAIT);
  console.log('  shot ' + f);
}
async function tapSel(sel) {
  const b = await p.evaluate((s) => {
    const el = document.querySelector(s); if (!el) return null;
    let r = el.getBoundingClientRect();
    // a thumb reaches an offscreen control by scrolling to it first
    if (r.top < 0 || r.bottom > innerHeight) {
      el.scrollIntoView({ block: 'center' });
      r = el.getBoundingClientRect();
    }
    if (r.width < 1 || r.height < 1) return null;
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
  }, sel);
  if (!b) throw new Error('tap target missing or zero size: ' + sel);
  // ⛔ finding an element is not tapping it: confirm the point actually hits it
  const hits = await p.evaluate((s, x, y) => {
    const el = document.elementFromPoint(x, y);
    return !!(el && (el.matches(s) || el.closest(s)));
  }, sel, b.x, b.y);
  if (!hits) throw new Error('tap point does not land on ' + sel + ' (covered or offscreen)');
  await p.touchscreen.tap(b.x, b.y);
  await new Promise(r => setTimeout(r, 600));
  return b;
}
async function load(fresh) {
  if (fresh) { await p.goto('http://127.0.0.1:' + PORT + '/satellites/attic/', { waitUntil: 'domcontentloaded' }); await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); }
  await p.goto(BASE + Math.random(), { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
}

// ── 1. cold load: the rules sheet ────────────────────────────────────
await load(true);
let s = await state();
must('cold load shows the HOW TO PLAY sheet', /\bon\b/.test(s.how), s);
await shot('how_to_play');
await shot('how_to_play', true);

// ── 2. START DIGGING closes it ───────────────────────────────────────
await tapSel('#howGo');
s = await state();
must('START DIGGING actually closed the sheet', !/\bon\b/.test(s.how), s);
must('the day granted 5 tickets', s.tix === '5', s);
await shot('home_empty');
await shot('home_empty', true);

// ── 3. one honest rummage ────────────────────────────────────────────
await tapSel('#go');
s = await state();
must('RUMMAGE opened a card', /\bon\b/.test(s.card), s);
must('the card is UNWIPED (condition withheld)', s.unwiped && !s.graded, s);
must('a ticket was spent', s.tix === '4', s);
await shot('card_dusty');

// ── 4. the wipe ──────────────────────────────────────────────────────
await tapSel('#gb');
s = await state();
must('WIPE revealed a grade plate', s.graded && s.plate.length > 0, s);
must('the art is no longer UNWIPED', !s.unwiped, s);
await shot('card_revealed');
await shot('card_revealed', true);
console.log('  revealed: ' + s.name.trim() + ' / ' + s.plate.trim());

// ── 5. a real session: spend up, build a shelf ───────────────────────
await p.evaluate(() => window.ATTIC_DEV.setTix(40));
for (let i = 0; i < 13; i++) {
  await tapSel('#go');
  await tapSel('#gb');
}
s = await state();
must('the shelf filled up', s.shelfN >= 12, s);
await shot('shelf_full');
await shot('shelf_full', true);

// ── 6. want list ─────────────────────────────────────────────────────
await tapSel('#wantOpen');
s = await state();
must('WANT LIST opened', /\bon\b/.test(s.want), s);
await shot('want_list');
await tapSel('#wantClose');
s = await state();
must('WANT LIST closed', !/\bon\b/.test(s.want), s);

// ── 7. dust off ──────────────────────────────────────────────────────
await tapSel('#dustBtn');
s = await state();
must('DUST OFF opened', /\bon\b/.test(s.dust), s);
must('the grime grid built 48 cells', s.dustCells === 48, s);
await shot('dust_fresh');
await shot('dust_fresh', true);
// drag across it the way a thumb would
const grid = await p.evaluate(() => { const r = document.getElementById('dustGrid').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
await p.touchscreen.touchStart(grid.x + 8, grid.y + 8);
for (let row = 0; row < 8; row++) {
  for (let k = 0; k <= 12; k++) {
    const x = grid.x + 6 + (row % 2 ? (grid.w - 12) * (1 - k / 12) : (grid.w - 12) * (k / 12));
    await p.touchscreen.touchMove(x, grid.y + 6 + (grid.h - 12) * (row / 7));
  }
}
await p.touchscreen.touchEnd();
await new Promise(r => setTimeout(r, 400));
s = await state();
must('dragging actually wiped cells', s.dustWiped > 20, s);
await shot('dust_wiped');
const dustT = await p.evaluate(() => +document.getElementById('dustT').textContent);
console.log('  dust: ' + s.dustWiped + '/48 wiped with ' + dustT + 's still on the clock');
await tapSel('#dustDone');
s = await state();
must('DONE closed the dust panel', !/\bon\b/.test(s.dust), s);
await shot('dust_paid');

// ── 8. the dry wallet ────────────────────────────────────────────────
await p.evaluate(() => window.ATTIC_DEV.setTix(0));
s = await state();
must('a dry wallet disables RUMMAGE', s.goDisabled, s);
must('a dry wallet names a way out', s.broke.length > 10, s);
await shot('out_of_tickets');
console.log('  broke note: ' + s.broke);

// ── 9. every class, dusty and revealed ───────────────────────────────
for (const k of ['record', 'vhs', 'toy', 'game', 'cereal', 'sealed', 'trashedToy']) {
  await p.evaluate((h) => window.ATTIC_DEV.show(h), H[k]);
  await new Promise(r => setTimeout(r, 300));
  s = await state();
  must(k + ' rendered a card', /\bon\b/.test(s.card), s);
  await shot('cls_' + k + '_dusty');
  await tapSel('#gb');
  s = await state();
  must(k + ' revealed', s.graded && s.plate.length > 0, s);
  await shot('cls_' + k + '_revealed');
  console.log('  ' + k + ': ' + s.name.trim() + ' / ' + s.plate.trim());
}

// ── 10. THE SHELF screen ─────────────────────────────────────────────
await tapSel('#shelfOpen');
s = await state();
let sh = await p.evaluate(() => ({
  on: (document.getElementById('shelfSheet') || {}).className || '',
  cards: document.querySelectorAll('#shGrid .shCard').length,
  count: (document.getElementById('shCount') || {}).textContent || '',
  more: (document.getElementById('shMore') || {}).style.display,
  sort: (document.querySelector('.shSort button.on') || {}).textContent || ''
}));
must('THE SHELF opened', /\bon\b/.test(sh.on), sh);
must('the shelf screen actually drew cards', sh.cards > 10, sh);
must('the shelf summarises the collection', sh.count.length > 20, sh);
await shot('shelf_screen');
await shot('shelf_screen', true);
console.log('  shelf: ' + sh.cards + ' cards, ' + sh.count.replace(/\s+/g, ' ').trim());

// sort by condition, and prove no unwiped find is sorted by its hidden grade
for (const kind of ['cond', 'type']) {
  await tapSel(`.shSort button[data-sort="${kind}"]`);
  const now = await p.evaluate(() => ({
    sort: (document.querySelector('.shSort button.on') || {}).getAttribute('data-sort'),
    order: [...document.querySelectorAll('#shGrid .shCard')].map(e => e.getAttribute('data-h')),
    chips: [...document.querySelectorAll('#shGrid .shChip')].map(e => e.textContent)
  }));
  must('sort ' + kind + ' is the active sort', now.sort === kind, now);
  if (kind === 'cond') {
    const firstUnwiped = now.chips.indexOf('UNWIPED');
    const lastWiped = now.chips.map((c, i) => c === 'UNWIPED' ? -1 : i).reduce((a, b) => Math.max(a, b), -1);
    must('condition sort never sorts an unwiped find by its hidden grade',
      firstUnwiped < 0 || firstUnwiped > lastWiped, now.chips);
  }
  await shot('shelf_sort_' + kind);
}
await tapSel('.shSort button[data-sort="new"]');

// the object card, both faces
await tapSel('#shGrid .shCard');
let fc = await p.evaluate(() => ({
  on: (document.getElementById('fcSheet') || {}).className || '',
  flip: (document.getElementById('fcFlip') || {}).className || '',
  front: (document.getElementById('fcFront') || {}).textContent.length || 0,
  back: (document.getElementById('fcBack') || {}).textContent.length || 0,
  rows: document.querySelectorAll('#fcBack .fcRow').length
}));
must('the object card opened', /\bon\b/.test(fc.on), fc);
must('the front has content', fc.front > 40, fc);
must('the back is a real ledger', fc.rows >= 4, fc);
await shot('card_front');
await tapSel('#fcFlip');
fc = await p.evaluate(() => ({ flip: (document.getElementById('fcFlip') || {}).className || '' }));
must('tapping the card actually flipped it', /flipped/.test(fc.flip), fc);
await new Promise(r => setTimeout(r, 700));
await shot('card_back');
await shot('card_back', true);
// the shareable card, drawn to a canvas
// ⛔ a canvas that drew NOTHING still exports a fat, valid PNG. The first
// version of the saved card had a black hole where the object should be and
// every downstream check was green. Sample the art box and demand real ink.
const cardOut = await p.evaluate(() => new Promise(res => {
  window.ATTIC_DEV.drawCard(window.ATTIC_DEV.shelfOrder()[0], cv => {
    const d = cv.getContext('2d').getImageData(90, 118, 460, 460).data;
    let ink = 0;
    for (let i = 0; i < d.length; i += 4 * 37) {
      // the card ground is #171310
      if (Math.abs(d[i] - 0x17) + Math.abs(d[i + 1] - 0x13) + Math.abs(d[i + 2] - 0x10) > 24) ink++;
    }
    res({ url: cv.toDataURL('image/png'), ink, of: Math.ceil(d.length / (4 * 37)) });
  });
}));
const png = cardOut.url;
must('the saveable card renders to a canvas', png.length > 8000, { len: png.length });
must('the saveable card actually contains the object art',
  cardOut.ink > cardOut.of * 0.4, cardOut);
fs.writeFileSync(`${OUT}/${String(++shotN).padStart(2, '0')}_saveable_card.png`, Buffer.from(png.split(',')[1], 'base64'));
console.log('  shot ' + OUT + '/' + String(shotN).padStart(2, '0') + '_saveable_card.png (' + png.length + ' chars of dataurl)');
await tapSel('#fcClose');
fc = await p.evaluate(() => ({ on: (document.getElementById('fcSheet') || {}).className || '' }));
must('CLOSE closed the object card', !/\bon\b/.test(fc.on), fc);
await tapSel('#shelfClose');

// ── 11. returning player, second load ────────────────────────────────
await load(false);
s = await state();
must('the rules sheet does not re-open for a returning player', !/\bon\b/.test(s.how), s);
must('the shelf survived a reload', s.shelfN > 0, s);
await shot('return_visit');
await shot('return_visit', true);

console.log('\n' + shotN + ' shots in ' + OUT);
console.log(errs.length ? 'CONSOLE/PAGE ERRORS:\n  ' + errs.join('\n  ') : 'no console or page errors');
await br.close();
