// node tools/hub-tests/set_painted.mjs <shotdir>   The hub's Three Sisters on the painted deck (Part 2, 10 Nov 2026): the game tab at
// 412x915 and 360x780 with onboarding marked done; twelve painted cards, every face, seal and crop loaded, a trio found by real taps
// counts and refills, the Shapes deck still renders when picked; shots of each. Repo root on 8777.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const SHOTS = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : ''; const URL = 'http://127.0.0.1:8777/index.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fails = [], notes = []; const F = (ok, msg) => (ok ? notes : fails).push(msg);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function open(w, h) { const ctx = await b.createBrowserContext(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 160)));
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('pw_onboarded', '1'); localStorage.setItem('lw_onboard_tutorial_done', '1'); localStorage.setItem('lwfb_explained', '1'); localStorage.setItem('lw_beta_ack', '1'); localStorage.setItem('lw_morning_report', new Date().toISOString().split('T')[0]); } catch (e) {} });   // the daily morning report counts as shown today, so it never lands on the board mid trio
  await p.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 }); await sleep(1500);
  await p.evaluate(() => { try { if (window.switchTab) switchTab('game'); } catch (e) {} }); await sleep(600);
  await p.evaluate(() => { try { if (window._sg) _sg('set'); } catch (e) {} }); await sleep(600);   // the player's path: the game tab, then Three Sisters from the picker (window._sg shows #trios-wrap)
  await p.waitForSelector('#card-grid .grove-card', { timeout: 30000 }); await sleep(800);
  // the headless hub keeps its boot splash, beta notice and Sky Wolf id prompt over the board (no account here); lift them so the board can be measured and shot
  const lifted = await p.evaluate(() => { const gone = []; ['lw-boot-splash', 'lw-beta-modal', 'morning-report'].forEach((id) => { const e = document.getElementById(id); if (e) { e.remove(); gone.push(id); } }); ['sws-id-modal', 'fg-ov'].forEach((id) => { const e = document.getElementById(id); if (e && e.classList.contains('open')) { e.classList.remove('open'); gone.push(id); } }); return gone; });
  if (lifted.length) notes.push('(lifted for the shot: ' + lifted.join(', ') + ')'); await sleep(600); return { ctx, p, errs }; }
const readCards = (p) => p.evaluate(async () => { const cards = [...document.querySelectorAll('#card-grid .grove-card')]; const imgs = cards.flatMap((c) => [...c.querySelectorAll('img')]);
  await Promise.all(imgs.map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })));
  const g0 = cards[0] ? cards[0].querySelector('.ts-glyph') : null;
  return { n: cards.length, painted: cards.filter((c) => c.classList.contains('painted')).length, imgs: imgs.length, broken: imgs.filter((i) => !i.naturalWidth).map((i) => i.src.split('/').slice(-2).join('/')),
    faces: cards.map((c) => (getComputedStyle(c).backgroundImage.match(/card_(?:face|selected)_([abcd])/) || [])[1] || '-').join(''), seals: cards.filter((c) => /seal_(blue|gold|rose)_64/.test((c.querySelector('.ts-seal') || {}).src || '')).length,
    glyph: g0 ? g0.src : '', gw: g0 ? g0.getBoundingClientRect().width : 0, cw: cards[0] ? cards[0].getBoundingClientRect().width : 0, ch: cards[0] ? cards[0].getBoundingClientRect().height : 0,
    cols: getComputedStyle(document.getElementById('card-grid')).gridTemplateColumns.split(' ').length, found: (document.getElementById('s-found') || {}).textContent, scrollW: document.documentElement.scrollWidth, vw: innerWidth,
    traits: cards.map((c) => { const g = (c.querySelector('.ts-glyph') || {}).src || ''; const m = g.match(/(corn|bean|squash)_(blue|gold|rose)_(solid|striped|empty)/) || []; return { s: m[1], c: m[2], f: m[3], n: c.querySelectorAll('.ts-glyph').length }; }) }; });
function trioOf(t) { const ok = (a, b, c) => ['s', 'c', 'f', 'n'].every((k) => (a[k] === b[k] && b[k] === c[k]) || (a[k] !== b[k] && b[k] !== c[k] && a[k] !== c[k]));
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) for (let k = j + 1; k < t.length; k++) if (ok(t[i], t[j], t[k])) return [i, j, k]; return null; }
async function tapCard(p, i) { const els = await p.$$('#card-grid .grove-card'); if (!els[i]) return false;
  await els[i].evaluate((c) => c.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(250);
  const cover = await p.evaluate((i) => { const c = document.querySelectorAll('#card-grid .grove-card')[i]; const r = c.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const name = (x) => x.tagName + (x.id ? '#' + x.id : '') + '.' + String(x.className).split(' ').slice(0, 2).join('.'); if (!e || c.contains(e)) return ''; let top = e; while (top.parentElement && top.parentElement !== document.body) top = top.parentElement; const cs = getComputedStyle(top); const q = top.getBoundingClientRect(); return name(e) + ' under ' + name(top) + ' [' + cs.position + ' z' + cs.zIndex + ' ' + Math.round(q.left) + ',' + Math.round(q.top) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height) + '] text "' + (top.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70) + '" html ' + top.outerHTML.slice(0, 200).replace(/\s+/g, ' '); }, i);
  if (cover) { fails.push('card ' + i + ' is covered by ' + cover + ' at its centre (a player could not tap it); clicked through the DOM instead'); await els[i].evaluate((c) => c.click()); return true; }
  await els[i].tap(); return true; }
{ const { ctx, p, errs } = await open(412, 915);
  const t = await readCards(p);
  F(t.n === 12 && t.painted === 12, `twelve painted cards on the hub's board (${t.n} cards, ${t.painted} painted)`);
  F(t.imgs >= 24 && t.broken.length === 0, `every face, seal and crop loaded (${t.imgs} images, broken ${JSON.stringify(t.broken)})`);
  F(/^[abcd]{12}$/.test(t.faces) && 'abcd'.split('').every((f) => t.faces.split(f).length - 1 === 3), `four faces dealt three each (${t.faces})`);
  F(t.seals === 12, `twelve medallion seals (${t.seals})`);
  F(/t2\/glyphs\/painted\//.test(t.glyph || ''), `the crops are her painted glyphs (${(t.glyph || '').split('/').slice(-2).join('/')})`);
  F(t.gw >= 30 && t.scrollW <= t.vw, `at 412 the glyph box is 30 px or more with no sideways scroll (glyph ${Math.round(t.gw)} px, card ${Math.round(t.cw)}x${Math.round(t.ch)}, ${t.cols} columns)`);
  if (SHOTS) await p.screenshot({ path: SHOTS + '/hub-painted-412.png' });
  const trio = trioOf(t.traits); F(!!trio, 'a trio exists on the dealt board (read from the painted cards)');
  if (trio) { for (const i of trio) { await tapCard(p, i); await sleep(150); } if (SHOTS) await p.screenshot({ path: SHOTS + '/hub-trio-412.png' });
    const mid = await p.evaluate(() => ({ selected: document.querySelectorAll('#card-grid .grove-card.selected').length, correct: document.querySelectorAll('#card-grid .grove-card.correct').length, msg: ((document.getElementById('s-msg') || document.getElementById('set-status') || {}).textContent || '').trim().slice(0, 80) }));
    notes.push('(after the three taps: ' + JSON.stringify(mid) + ')'); await sleep(1400);
    const a = await readCards(p); F(a.found === '1' && a.n === 12 && a.painted === 12 && a.broken.length === 0, `a real trio counts and the board refills painted (found ${a.found}, ${a.n} cards, ${a.painted} painted)`);
    const keep = (s) => s.split('').filter((f, i) => trio.indexOf(i) < 0).join('');
    F(keep(a.faces) === keep(t.faces), `the untouched slots keep their faces (${t.faces} then ${a.faces})`); }
  // the Shapes deck is still there when picked
  await p.evaluate(() => { const o = document.querySelector('.deck-option[data-deck="shapes"]'); if (o) o.click(); }); await sleep(600);
  const s = await p.evaluate(() => ({ n: document.querySelectorAll('#card-grid .grove-card').length, painted: document.querySelectorAll('#card-grid .grove-card.painted').length, svg: document.querySelectorAll('#card-grid .shape-svg').length, flag: localStorage.getItem('lw_set_painted') }));
  F(s.n === 12 && s.painted === 0 && s.svg >= 12 && s.flag === '0', `the Shapes deck renders the old SVG shapes when picked and is remembered (${JSON.stringify(s)})`);
  if (SHOTS) await p.screenshot({ path: SHOTS + '/hub-shapes-412.png' });
  await p.evaluate(() => { const o = document.querySelector('.deck-option[data-deck="painted"]'); if (o) o.click(); }); await sleep(600);
  const back = await readCards(p); F(back.painted === 12 && back.broken.length === 0, `and back to the painted deck (${back.painted} painted)`);
  F(errs.length === 0, `no page errors (${JSON.stringify(errs)})`);
  await ctx.close(); }
{ const { ctx, p, errs } = await open(360, 780);
  const t = await readCards(p);
  F(t.n === 12 && t.painted === 12 && t.broken.length === 0 && t.scrollW <= t.vw, `at 360 twelve painted cards, nothing broken, no sideways scroll (glyph ${Math.round(t.gw)} px, card ${Math.round(t.cw)}x${Math.round(t.ch)}, ${t.cols} columns)`);
  if (SHOTS) await p.screenshot({ path: SHOTS + '/hub-painted-360.png' });
  F(errs.length === 0, `no page errors at 360 (${JSON.stringify(errs)})`);
  await ctx.close(); }
await b.close();
for (const n of notes) console.log('  ✓ ' + n); for (const f of fails) console.log('  ✗ ' + f);
console.log(`hub three sisters painted: ${notes.length} passed, ${fails.length} failed`); process.exit(fails.length ? 1 : 0);
