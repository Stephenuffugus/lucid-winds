// node tools/hub-tests/game_sweep.mjs [ids]   Launch every game in the hub registry once (or the comma list given): thrown errors, page errors, 4xx, broken images, a thumbnail each into ./sweep/. Needs tools/hub-tests/seed_return.js beside it and the repo root on 8777. About 4 minutes for all 102. Run from tools/hub-tests with mkdir sweep.
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const seed = fs.readFileSync('./seed_return.js', 'utf8'); const URL = 'http://127.0.0.1:8777/index.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
let errs = [], navs = [], bad = [];
await p.setRequestInterception(true); let booted = false;
p.on('request', (r) => { const u = r.url(); if (/google-analytics|googletagmanager|portalPing|doubleclick|swFeedback/.test(u)) return r.abort(); if (booted && r.isNavigationRequest() && r.frame() === p.mainFrame()) { navs.push(u.replace('http://127.0.0.1:8777', '')); return r.abort(); } r.continue(); });
p.on('response', (r) => { if (r.status() >= 400 && !/email-decode/.test(r.url())) bad.push(r.status() + ' ' + r.url().replace('http://127.0.0.1:8777', '').slice(0, 90)); });
p.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 200)));
await p.evaluateOnNewDocument(seed + ";try{localStorage.setItem('lw_morning_report',new Date().toISOString().split('T')[0]);}catch(e){}");
await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 }); await sleep(9000); booted = true;
await p.evaluate(() => { ['lw-boot-splash', 'lw-beta-modal', 'morning-report', 'sws-id-modal'].forEach((id) => { const e = document.getElementById(id); if (e) e.remove(); }); try { switchTab('game'); } catch (e) {} });
await sleep(1200);
const games = await p.evaluate(() => (window.G || []).map((g) => { const o = { id: g.id, n: g.n, cat: g.cat }; Object.keys(g).forEach((k) => { if (!/^(id|n|i|r|cat|thumb)$/.test(k)) o[k] = typeof g[k] === 'function' ? 'fn' : String(g[k]).slice(0, 60); }); return o; }));
const cats = {}; games.forEach((g) => (cats[g.cat] = (cats[g.cat] || 0) + 1)); console.log('GAMES', games.length, JSON.stringify(cats));
const extra = {}; games.forEach((g) => Object.keys(g).forEach((k) => { if (!/^(id|n|cat)$/.test(k)) extra[k] = (extra[k] || 0) + 1; })); console.log('extra keys', JSON.stringify(extra));
const only = process.argv[2] ? process.argv[2].split(',') : null; const rows = [];
for (const g of games) { if (only && only.indexOf(g.id) < 0) continue; errs = []; navs = []; bad = [];
  let threw = ''; try { threw = await p.evaluate((id) => { try { window._sg(id); return ''; } catch (e) { return String(e.message).slice(0, 120); } }, g.id); } catch (e) { threw = 'evaluate failed: ' + String(e.message).slice(0, 80); }
  await sleep(1700);
  let st = {}; try { st = await p.evaluate(() => { const ag = document.getElementById('fg-ag'); const fr = [...document.querySelectorAll('iframe')].filter((f) => f.getBoundingClientRect().height > 200).map((f) => (f.src || '').replace(location.origin, '').slice(0, 70)); const ov = []; document.querySelectorAll('body > *').forEach((e) => { const cs = getComputedStyle(e); if (cs.position === 'fixed' && cs.display !== 'none' && +cs.opacity > 0.05 && cs.pointerEvents !== 'none') { const r = e.getBoundingClientRect(); if (r.width > 250 && r.height > 300 && +cs.zIndex > 100) ov.push((e.id || String(e.className).split(' ')[0]) + ':z' + cs.zIndex); } }); const txt = ((ag && ag.innerText) || '').replace(/\s+/g, ' ').trim().slice(0, 70); const imgs = [...document.images].filter((i) => i.complete && !i.naturalWidth && i.src && i.getBoundingClientRect().width > 0).map((i) => i.src.replace(location.origin, '').slice(0, 60)); return { agH: ag ? Math.round(ag.getBoundingClientRect().height) : -1, agKids: ag ? ag.querySelectorAll('*').length : -1, canv: document.querySelectorAll('canvas').length, fr, ov, txt, imgs: imgs.slice(0, 4), a: window._a, scrollW: document.documentElement.scrollWidth }; }); } catch (e) { st = { evalErr: String(e.message).slice(0, 80) }; }
  try { await p.screenshot({ path: './sweep/' + g.id + '.jpg', type: 'jpeg', quality: 55 }); } catch (e) {}
  rows.push({ id: g.id, n: g.n, cat: g.cat, threw, errs: [...new Set(errs)].slice(0, 3), navs: navs.slice(0, 2), bad: [...new Set(bad)].slice(0, 3), st });
  const flag = (threw || errs.length || navs.length || bad.length || (st.imgs && st.imgs.length) || st.scrollW > 412) ? '!!' : 'ok';
  console.log(flag, g.id.padEnd(14), (g.cat || '').padEnd(9), JSON.stringify({ t: threw || undefined, e: errs.length ? [...new Set(errs)].slice(0, 2) : undefined, nav: navs.length ? navs.slice(0, 1) : undefined, bad: bad.length ? [...new Set(bad)].slice(0, 2) : undefined, fr: st.fr && st.fr.length ? st.fr : undefined, ov: st.ov && st.ov.length ? st.ov : undefined, img: st.imgs && st.imgs.length ? st.imgs : undefined, w: st.scrollW > 412 ? st.scrollW : undefined, kids: st.agKids }).slice(0, 330));
  if (navs.length) { /* page may be mid-abort; make sure we are still on the hub */ }
}
fs.writeFileSync('./sweep/rows.json', JSON.stringify(rows, null, 1)); await b.close();
