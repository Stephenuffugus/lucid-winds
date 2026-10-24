/* SUPER SLICE 3D — headless assertion suite (2026-08-16 audit)
 *
 * Run:  node satellites/slice-3d/audit-check.mjs [baseUrl]
 *       default base is http://localhost:8777 — serve the REPO ROOT, not this
 *       folder, or /arcade-exit.js and /feedback.js 404 and the exit checks
 *       fail for the wrong reason.
 *
 * ⛔ NEVER wait on networkidle here. This page streams a 600KB three.js and keeps
 *    a rAF loop running forever, so networkidle never fires and a probe built on
 *    it reports a perfectly healthy page as dead. domcontentloaded + settle.
 *
 * ⛔ Every assertion below was watched FAIL on purpose before it was trusted. A
 *    probe you have not seen go red is decoration. The first draft of the play
 *    check broke its stepping loop the moment G.done flipped, which is 2.4s before
 *    finishLevel() fires, and confidently reported "the end screen never shows".
 */
import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');

const BASE = process.argv[2] || 'http://localhost:8777';
const URL = BASE + (process.env.PAGE || '/satellites/slice-3d/') + '?dev=1';
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (d ? '  -> ' + d : '')); } };

/* ⛔ ONE BROWSER PER CASE, not one browser with twenty contexts.
   This page builds a real WebGL context and pulls in 600KB of three.js on every
   boot. Reusing a single browser across ~20 of those on a 2-core box exhausts it:
   the run got through the whole corrupt-save phase and then died on a 30s
   NAVIGATION timeout — which looks exactly like "the game stopped loading" and is
   nothing of the kind. Launch, use, close. Slower, and it actually finishes.
   Navigation timeout is raised to 60s for the same reason: a slow box is not a
   broken page. */
const LAUNCH = {
  headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
};
async function boot(poison) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  if (poison) await p.evaluateOnNewDocument(poison);
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p, errs };
}

async function bootAt(w, h) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p, errs };
}
async function clickCentre(p, sel) {   // a real pointer at the control's centre (never el.click(): that proves nothing)
  const c = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel);
  await p.mouse.click(c.x, c.y);
}

/* ---- 20. Part E3: the Daily ----------------------------------------------- */
console.log('\n[20] Part E3: the Daily');
/* the clock is the page's own Date, set per boot: a fixed UTC moment that then runs on with the page */
const clockAt = iso => `(()=>{ const T0=Date.parse(${JSON.stringify(iso)}), P0=performance.now(), RD=Date; const now=()=>T0+(performance.now()-P0);
  function D(...a){ return a.length?new RD(...a):new RD(now()); } D.now=now; D.UTC=RD.UTC; D.parse=RD.parse; D.prototype=RD.prototype; window.Date=D; })()`;
{
  const { ctx, p, errs } = await boot(clockAt('2026-10-24T09:00:00Z'));
  let r; try { r = await p.evaluate(() => { const S = window._S3, out = {}, D = 1000 / 120; window._S3skiprender = true;
    const fp = W => { const L = ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns', 'verbs'], parts = [W.floorY];
      L.forEach(n => (W[n] || []).forEach(e => parts.push(n[0], Math.round((e.x != null ? e.x : e.cx || 0) * 1000), Math.round((e.y || 0) * 1000), Math.round((e.w || e.r || 0) * 1000))));
      return parts.join(',').length + ':' + parts.reduce((h, v) => (Math.imul(h ^ String(v).length, 16777619) + (+v || 0)) >>> 0, 0x811c9dc5); };
    const a = S.daily(Date.parse('2026-10-24T00:00:01Z')), b = S.daily(Date.parse('2026-10-24T23:59:59Z')), c = S.daily(Date.parse('2026-10-25T00:00:01Z'));
    out.spec = { same: JSON.stringify(a) === JSON.stringify(b), next: a.seed !== c.seed && a.utcDate !== c.utcDate, lvl: a.level >= 5 && a.level <= 35 && c.level >= 5 && c.level <= 35, gen: a.generatorVersion === 1 && a.physicsVersion === 2, a };   /* PHYS 2 since 24 Oct: the boss's forgiving lob */
    /* the same day builds the same dive and the same Clean Slice line */
    S.newDaily(false); const f1 = fp(S.world()), l1 = S.clean().req.map(s => s.x.toFixed(2) + '@' + s.y.toFixed(2)).join('|');
    S.newDaily(false); const f2 = fp(S.world()), l2 = S.clean().req.map(s => s.x.toFixed(2) + '@' + s.y.toFixed(2)).join('|');
    out.stable = { same: f1 === f2 && l1 === l2, lvl: S.g().lvl === a.level, salted: true };
    /* opening the card and practising spend nothing; the scored dive is spent on its first simulation tick */
    localStorage.removeItem('s3d_daily'); S.showDaily(); out.card = { used: S.dly().used, shown: document.getElementById('s-daily').classList.contains('on'), go: document.getElementById('dly-go').getAttribute('aria-disabled') };
    /* no practice since 24 Oct (his call): the card offers one dive and nothing else */
    out.noPractice = !document.getElementById('dly-practice') && !/practi[cs]e/i.test(document.getElementById('s-daily').textContent);
    S.newDaily(true); out.beforeTick = S.dly().used; S.stepN(1, D); out.afterClock = S.dly().used; S.stepN(1, D);
    out.afterTick = { used: S.dly().used, disk: JSON.parse(localStorage.getItem('s3d_daily') || 'null') };
    /* a failed scored dive: its score, personal, no badge; the card shows it spent */
    const G = S.g(); G.score = 321; G.done = true; G.failed = true; G.doneT = 3; S.finishLevel();
    const dl = document.getElementById('go-daily'); out.failPanel = { on: dl.classList.contains('on'), won: dl.classList.contains('won'), text: document.getElementById('go-daily-t').textContent, next: document.getElementById('go-next').textContent, retry: getComputedStyle(document.getElementById('go-retry')).display };
    S.showDaily(); out.spent = { go: document.getElementById('dly-go').getAttribute('aria-disabled'), res: document.getElementById('dly-res').textContent };
    const ff0 = S.prog().ffLevel, g0 = S.g(); S.newDaily(true); out.noSecond = S.g() === g0 && document.getElementById('s-daily').classList.contains('on');
    /* the next ordinary dive's end panel has its Replay back (the Daily hid it) */
    S.newFF(2); { const g = S.g(); g.score = 10; g.done = true; g.failed = true; g.doneT = 3; S.finishLevel();
      const rb = document.getElementById('go-retry'); out.after = { retry: getComputedStyle(rb).display, text: rb.textContent, daily: dl.classList.contains('on') }; }
    out.countdown = (S.showDaily(), document.getElementById('dly-clock').textContent);
    window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok("the day's dive is fixed by the UTC date (and the versions), a new one each day, levels 5 to 35", !!r.spec && r.spec.same && r.spec.next && r.spec.lvl && r.spec.gen, JSON.stringify(r.spec || r));
  ok('the same day builds the same dive and the same Clean Slice line', !!r.stable && r.stable.same && r.stable.lvl, JSON.stringify(r.stable));
  ok('opening the Daily card spends nothing, and it offers no practice', !!r.card && r.card.shown && !r.card.used && r.card.go === null && r.noPractice === true, JSON.stringify({ c: r.card, p: r.noPractice }));
  ok('the scored dive is spent on its first simulation tick, and on disk', r.beforeTick === false && r.afterClock === false && !!r.afterTick && r.afterTick.used && !!r.afterTick.disk && r.afterTick.disk.used === true && r.afterTick.disk.day === '2026-10-24', JSON.stringify({ b: r.beforeTick, c: r.afterClock, t: r.afterTick }));
  ok('a failed scored dive: a personal result, no badge; the card shows it spent and no second scored dive starts', !!r.failPanel && r.failPanel.on && !r.failPanel.won && /personal result/.test(r.failPanel.text) && r.failPanel.next === 'Daily' && r.failPanel.retry === 'none' && !!r.spent && r.spent.go === 'true' && /321/.test(r.spent.res) && r.noSecond, JSON.stringify({ f: r.failPanel, s: r.spent, n: r.noSecond }));
  ok('a Daily end panel has no Replay; the next ordinary dive has it back', !!r.after && r.after.retry !== 'none' && r.after.text === 'Replay' && !r.after.daily, JSON.stringify(r.after));
  ok('the countdown runs to the UTC midnight (09:00 UTC: 15 hours left)', /^A new dive in 1[45]h \d+m$/.test(r.countdown || ''), JSON.stringify(r.countdown));
  ok('no page errors through the Daily', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}
/* the day's first scored dive reaching the floor shows badge_daily; a refresh finds the day spent; the next UTC day is new */
{
  const { ctx, p, errs } = await boot(clockAt('2026-10-24T23:59:20Z'));
  let r; try { r = await p.evaluate(() => { const S = window._S3, D = 1000 / 120, out = {}; window._S3skiprender = true; localStorage.removeItem('s3d_daily');
    const p0 = JSON.stringify([S.prog().level, S.prog().ffLevel]); S.newDaily(true); const g = S.g(), W = S.world(); g.score = 5000; g.x = 0; g.y = W.floorY + 3; g.vx = 0; g.vy = -10; g.w = 0; g.ang = Math.PI / 2; S.hold(0);
    const go = document.getElementById('s-go'); go.classList.remove('on'); for (let n = 0; n < 700 && !go.classList.contains('on'); n++) S.stepN(1, D);
    const dl = document.getElementById('go-daily'); out.won = { done: g.done, failed: !!g.failed, on: dl.classList.contains('on'), won: dl.classList.contains('won'), text: document.getElementById('go-daily-t').textContent, disk: JSON.parse(localStorage.getItem('s3d_daily')), levels: JSON.stringify([S.prog().level, S.prog().ffLevel]) === p0 };
    S.showDaily(); out.clock = document.getElementById('dly-clock').textContent; window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok("the day's scored dive reaching the floor shows the Daily badge, once, and moves no level", !!r.won && r.won.done && !r.won.failed && r.won.on && r.won.won && r.won.text === 'Daily done' && r.won.disk.done === true && r.won.disk.used === true && r.won.levels, JSON.stringify(r.won || r));
  ok('the countdown in the last minute counts seconds', /^A new dive in \d+s$/.test(r.clock || ''), JSON.stringify(r.clock));
  await ctx.close();
  const b2 = await boot(clockAt('2026-10-24T23:58:00Z').replace('})()', ";try{localStorage.setItem('s3d_daily',JSON.stringify({day:'2026-10-24',gen:1,used:true,done:true,score:900}));}catch(e){} })()"));
  let r2; try { r2 = await b2.p.evaluate(() => { window._S3.showDaily(); return { go: document.getElementById('dly-go').getAttribute('aria-disabled'), res: document.getElementById('dly-res').textContent }; }); } catch (e) { r2 = { error: String(e).slice(0, 200) }; }
  ok('a refresh the same day finds the scored dive spent', !!r2 && r2.go === 'true' && /900/.test(r2.res), JSON.stringify(r2));
  await b2.ctx.close();
  const b3 = await boot(clockAt('2026-10-25T00:00:30Z').replace('})()', ";try{localStorage.setItem('s3d_daily',JSON.stringify({day:'2026-10-24',gen:1,used:true,done:true,score:900}));}catch(e){} })()"));
  let r3; try { r3 = await b3.p.evaluate(() => { window._S3.showDaily(); return { go: document.getElementById('dly-go').getAttribute('aria-disabled'), res: document.getElementById('dly-res').textContent, day: window._S3.dly().day }; }); } catch (e) { r3 = { error: String(e).slice(0, 200) }; }
  ok('the next UTC day has a fresh scored dive', !!r3 && r3.go === null && r3.res === '' && r3.day === '2026-10-25', JSON.stringify(r3));
  const b4 = await boot(clockAt('2026-10-24T10:00:00Z').replace('})()', ";try{localStorage.setItem('s3d_daily',JSON.stringify({day:'2026-10-24',gen:1,used:'yes',done:0,score:-3}));}catch(e){} })()"));
  let r4; try { r4 = await b4.p.evaluate(() => { window._S3.showDaily(); const d = window._S3.dly(); return { go: document.getElementById('dly-go').getAttribute('aria-disabled'), used: d.used, score: d.score }; }); } catch (e) { r4 = { error: String(e).slice(0, 200) }; }
  ok('a broken Daily record on disk reads as a fresh day, not as spent', !!r4 && r4.go === null && r4.used === false && r4.score === 0 && b4.errs.length === 0, JSON.stringify(r4));
  await b4.ctx.close();
  const b5 = await boot(clockAt('2026-10-24T10:00:00Z').replace('})()', ";try{localStorage.setItem('s3d_daily',JSON.stringify({day:'2026-10-24',gen:1,used:true,done:false,score:null}));}catch(e){} })()"));
  let r5; try { r5 = await b5.p.evaluate(() => { window._S3.showDaily(); return { on: document.getElementById('s-daily').classList.contains('on'), go: document.getElementById('dly-go').getAttribute('aria-disabled') }; }); } catch (e) { r5 = { error: String(e).slice(0, 200) }; }
  ok('a Daily record with a null score never breaks the card', !!r5 && r5.on && r5.go === null && b5.errs.length === 0, JSON.stringify({ r5, e: b5.errs }));
  await b5.ctx.close();
  ok('no page errors across the day line', errs.length === 0 && b2.errs.length === 0 && b3.errs.length === 0, JSON.stringify([errs, b2.errs, b3.errs]));
  await b3.ctx.close();
}
/* the Daily against the device: a phone at UTC+14 (its own date already the next day), two boots of one day, another tab
   spending the scored dive, and the real buttons under a real pointer */
{
  const LA = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
  const tzBoot = async (iso, tz, pre) => { const browser = await puppeteer.launch(LA); const p = await browser.newPage(); await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
    const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140))); if (tz) await p.emulateTimezone(tz);
    await p.evaluateOnNewDocument(clockAt(iso)); if (pre) await p.evaluateOnNewDocument(pre);
    await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(q => setTimeout(q, 3500)); return { browser, p, errs }; };
  const t1 = await tzBoot('2026-10-24T13:00:00Z', 'Pacific/Kiritimati');
  let z; try { z = await t1.p.evaluate(() => { const S = window._S3; S.showDaily(); const sp = S.daily();
    return { local: new Date().getDate(), utcDate: sp.utcDate, day: document.getElementById('dly-day').textContent, clock: document.getElementById('dly-clock').textContent, spec: JSON.stringify(sp) }; }); } catch (e) { z = { error: String(e).slice(0, 200) }; }
  ok('at UTC+14 (already the 25th there) the Daily is still the 24th and the countdown runs to the UTC midnight', !!z && z.local === 25 && z.utcDate === '2026-10-24' && /24/.test(z.day) && /^A new dive in 1[01]h \d+m$/.test(z.clock), JSON.stringify(z));
  await t1.browser.close();
  const t2 = await tzBoot('2026-10-24T13:00:00Z', 'America/Adak');
  let z2; try { z2 = await t2.p.evaluate(() => { const S = window._S3; S.newDaily(false); const W = S.world(); return { spec: JSON.stringify(S.daily()), n: W.slabs.length + ':' + W.items.length + ':' + W.floorY + ':' + S.clean().M }; }); } catch (e) { z2 = { error: String(e).slice(0, 200) }; }
  const t3 = await tzBoot('2026-10-24T13:00:00Z', 'Pacific/Kiritimati');
  let z3; try { z3 = await t3.p.evaluate(() => { const S = window._S3; S.newDaily(false); const W = S.world(); return { spec: JSON.stringify(S.daily()), n: W.slabs.length + ':' + W.items.length + ':' + W.floorY + ':' + S.clean().M }; }); } catch (e) { z3 = { error: String(e).slice(0, 200) }; }
  ok('two boots on the same UTC day, a day apart in local time, build the same Daily dive', !!z2 && !!z3 && z2.spec === z3.spec && z2.n === z3.n, JSON.stringify({ z2, z3 }));
  await t2.browser.close(); await t3.browser.close();
  const t4 = await tzBoot('2026-10-24T13:00:00Z', null, "(()=>{try{localStorage.removeItem('s3d_daily');}catch(e){}})()");
  let z4; try { z4 = await t4.p.evaluate(() => { const S = window._S3; S.showDaily(); const g0 = S.g();
    localStorage.setItem('s3d_daily', JSON.stringify({ day: '2026-10-24', gen: 1, used: true, done: false, score: 70 }));   /* the other tab spent it */
    S.newDaily(true); return { started: S.g() !== g0 && !!S.g() && S.g().daily === 'scored', go: document.getElementById('dly-go').getAttribute('aria-disabled') }; }); } catch (e) { z4 = { error: String(e).slice(0, 200) }; }
  ok('two tabs: a scored dive another tab already spent does not start here', !!z4 && !z4.started && z4.go === 'true', JSON.stringify(z4));
  await t4.browser.close();
  const t5 = await tzBoot('2026-10-24T13:00:00Z', null, "(()=>{try{localStorage.removeItem('s3d_daily');}catch(e){}})()");
  let z5 = {}; try {
    await t5.p.evaluate(() => window._S3.showDaily()); await clickCentre(t5.p, '#dly-go'); await new Promise(q => setTimeout(q, 900));
    z5.scored = await t5.p.evaluate(() => { const g = window._S3.g(); return !!g && g.daily === 'scored' && document.getElementById('s-play').classList.contains('on'); });
    await t5.p.evaluate(() => { const S = window._S3, g = S.g(); g.done = true; g.failed = true; g.doneT = 3; g.score = 10; S.finishLevel(); });
    z5.noReplay = await t5.p.evaluate(() => getComputedStyle(document.getElementById('go-retry')).display === 'none');
    await clickCentre(t5.p, '#go-next'); await new Promise(q => setTimeout(q, 600));
    z5.backToCard = await t5.p.evaluate(() => document.getElementById('s-daily').classList.contains('on') && document.getElementById('dly-go').getAttribute('aria-disabled') === 'true');
  } catch (e) { z5.error = String(e).slice(0, 200); }
  ok("the real buttons: Today's dive starts the scored one, its end panel has no Replay, Daily goes back to the card, spent", z5.scored && z5.noReplay && z5.backToCard && t5.errs.length === 0, JSON.stringify({ z5, e: t5.errs }));
  await t5.browser.close();
}
/* a scored dive begun before the UTC midnight and landed after it keeps its result under the day it began */
{
  const { ctx, p, errs } = await boot(clockAt('2026-10-24T23:59:50Z') + ";(()=>{try{localStorage.removeItem('s3d_daily');}catch(e){}})()");   /* the boot takes about 5 s of it */
  let r; try { r = await p.evaluate(async () => { const S = window._S3, D = 1000 / 120; window._S3skiprender = true; S.newDaily(true); S.stepN(2, D); const began = S.g().dailyDay;
    const t0 = performance.now(); while (new Date(Date.now()).getUTCDate() === 24 && performance.now() - t0 < 12000) await new Promise(q => setTimeout(q, 100));
    const g = S.g(), W = S.world(); g.x = 0; g.y = W.floorY + 3; g.vx = 0; g.vy = -10; g.w = 0; g.ang = Math.PI / 2; S.hold(0);
    const go = document.getElementById('s-go'); go.classList.remove('on'); for (let n = 0; n < 700 && !go.classList.contains('on'); n++) S.stepN(1, D);
    window._S3skiprender = false; return { began, now: new Date(Date.now()).toISOString().slice(0, 10), text: document.getElementById('go-daily-t').textContent, disk: JSON.parse(localStorage.getItem('s3d_daily')) }; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok("a scored dive landed after the UTC midnight keeps its result under the day it began", !!r && r.began === '2026-10-24' && r.now === '2026-10-25' && r.text === 'Daily done' && !!r.disk && r.disk.day === '2026-10-24' && r.disk.done === true, JSON.stringify(r));
  await ctx.close();
}
/* the title's Daily button opens the card under a real pointer */
{
  const { ctx, p, errs } = await bootAt(360, 640);
  await clickCentre(p, '#b-daily'); await new Promise(q => setTimeout(q, 500));
  const on = await p.evaluate(() => document.getElementById('s-daily').classList.contains('on'));
  ok('the Daily button opens the Daily card (a real pointer at 360x640)', on && errs.length === 0, JSON.stringify({ on, errs }));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
