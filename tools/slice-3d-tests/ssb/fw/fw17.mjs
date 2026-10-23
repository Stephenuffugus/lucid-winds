import fs from 'node:fs';
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
const URL = BASE + '/satellites/slice-3d/?dev=1';
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

const MUT = JSON.parse(process.env.MUT || '[]');
let BODY = fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/index.html', 'utf8');
for (const [f, r] of MUT) { if (BODY.split(f).length !== 2) { console.log('MUTATION NOT UNIQUE: ' + f.slice(0, 80)); process.exit(2); } BODY = BODY.replace(f, r); }
async function intercept(p) {
  await p.setRequestInterception(true);
  p.on('request', q => { if (q.isNavigationRequest() && /\/satellites\/slice-3d\/(\?|$)/.test(q.url())) q.respond({ status: 200, contentType: 'text/html', body: BODY }); else q.continue(); });
}
async function bootAt(w, h) {
  const browser = await puppeteer.launch(LAUNCH); const p = await browser.newPage(); await intercept(p);
  const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0]));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p, errs };
}
const boot = () => bootAt(375, 667);
async function clickCentre(p, sel) { const c = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel); await p.mouse.click(c.x, c.y); }
/* ---- 17. Part D: world verbs (SS01, SS03, SS07, SS08, SS09, SS11, SS14, SS05 as a flag). Each verb takes ONE host
   segment's slot and draws its rng() unchanged: built with the verbs off, the same dive differs only by that host's own
   pieces. Every verb is driven through _S3 to its award exactly once, and a knife held inside a part for ten steps is one
   stage (Astra's "repeated hits" contract). Deep Tide's bumpers wear a jellyfish, Wall Climb's banners pay their slivers
   into the run's one payout, Glowcave's crystals never strobe. */
console.log('\n[17] Part D: one verb per world');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, out = {}, D = 1000 / 120; window._S3skiprender = true;
    const key = e => [e.x || 0, e.y || 0, e.w || e.r || 0, e.h || 0].map(v => Math.round(v * 1000)).join(',');
    const lists = () => { const W = S.world(), o = {}; for (const n of ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns']) o[n] = (W[n] || []).map(key); o.floor = W.floorY; return o; };
    out.layout = {};
    for (const lvl of [1, 6, 11, 21, 26, 31, 36]) {
      S.salt(77); S.verbsOff(true); S.newFF(lvl); const A = lists();
      S.salt(77); S.verbsOff(false); S.newFF(lvl); const B = lists(), d = [];
      for (const n in A) { if (n === 'floor') continue; const bs = new Set(B[n]), as = new Set(A[n]);
        const gone = A[n].filter(k => !bs.has(k)).length, added = B[n].filter(k => !as.has(k)).length; if (gone || added) d.push(n + '-' + gone + '+' + added); }
      out.layout[lvl] = { kinds: S.verbs().map(v => v.kind).filter((k, i, a) => a.indexOf(k) === i).join(','), d: d.join(' '), floor: A.floor === B.floor,
        jelly: S.world().pads.filter(q => q.jelly).length, pads: S.world().pads.length };
    }
    const fall = (x, y, ang, vy) => { const G = S.g(); G.x = x; G.y = y; G.vx = 0; G.vy = vy == null ? -8 : vy; G.w = 0; G.ang = ang; S.hold(0); };
    let V, G;
    S.salt(77); S.newFF(21); V = S.verbs(); G = S.g();
    for (let i = 0; i < 5; i++) { const t = V[i]; if (t.done) continue; fall(t.x, t.top + 1.2, Math.PI / 2); for (let n = 0; n < 30 && !t.done; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } }
    out.chime = { cut: V.filter(t => t.done).length, log: S.verbLog().chime || 0 };
    S.salt(77); S.newFF(21); V = S.verbs(); G = S.g(); const t2 = V[2];
    for (let n = 0; n < 10; n++) { G.x = t2.x; G.y = t2.top - 0.4; G.vx = 0; G.vy = -0.5; G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    out.chimeHold = { done: !!t2.done, log: S.verbLog().chime || 0 };
    S.salt(77); S.newFF(26); V = S.verbs(); G = S.g(); const rp = V[0];
    fall(0, rp.y - rp.sag + 1.0, Math.PI / 2); for (let n = 0; n < 20 && !rp.done; n++) { G.ang = Math.PI / 2; S.stepN(1, D); }
    for (let n = 0; n < 10; n++) { G.x = 0; G.y = rp.y - rp.sag; G.vy = -0.2; G.ang = Math.PI / 2; S.stepN(1, D); }
    const L0 = rp.grp.lan[2], yA = L0.y; S.stepN(30, D); const yB = L0.y; S.stepN(50, D); const yC = L0.y; S.stepN(150, D);
    out.lantern = { cut: !!rp.done, log: S.verbLog().lantern || 0, held: yB === yA, fell: yC < yB - 0.5, burst: rp.grp.lan.every(l => l.out) };
    S.salt(77); S.newFF(6); V = S.verbs(); G = S.g(); const ic = V[0];
    fall(ic.x, ic.y + ic.h / 2 + 1.7, Math.PI / 2); for (let n = 0; n < 20 && ic.stage < 1; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    const st1 = ic.stage;
    for (let n = 0; n < 10; n++) { G.x = ic.x; G.y = ic.y + 0.5; G.vx = 0; G.vy = -0.2; G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }   // just above the middle: the blade faces in
    const stHold = ic.stage, pad = S.world().pads.find(q => q.up);
    fall(pad.x, pad.y + 3.9, -Math.PI / 2, -6); let up = false;
    for (let n = 0; n < 80 && ic.stage < 2; n++) { G.ang = -Math.PI / 2; G.w = 0; S.stepN(1, D); if (G.vy > 0) up = true; }
    out.ice = { st1, stHold, up, stage: ic.stage, log: S.verbLog().ice || 0, chips: G.chips || 0 };
    S.salt(77); S.newFF(11); V = S.verbs(); G = S.g(); const lf = V[0];
    fall(lf.x, lf.y + lf.h / 2 + 1.7, Math.PI / 2); for (let n = 0; n < 20 && !lf.done; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    for (let n = 0; n < 10; n++) { G.x = lf.x; G.y = lf.y + 0.5; G.vy = -0.2; G.ang = Math.PI / 2; S.stepN(1, D); }
    out.loaf = { cut: !!lf.done, log: S.verbLog().loaf || 0 };
    function climbPay(rip) { const F = window._S3forge; S.newClimb(1); const g = S.g(), bns = S.verbs();
      if (rip) for (let n = 0; n < 10; n++) { g.x = bns[0].x0 - 0.6; g.y = bns[0].y; g.vx = 0; g.vy = 0; g.w = 0; S.stepN(1, D); }
      const bonus = g.slivBonus || 0, log = S.verbLog().banner || 0; g.done = true; g.doneT = 3; g.mult = 2; g.stuckY = 3; g.score = 0;
      const s0 = F.sliv(); S.finishLevel(); return { n: bns.length, bonus, log, paid: F.sliv() - s0 }; }
    out.banner = climbPay(true); out.plain = climbPay(false);
    S.salt(5); S.newFF(16); const cr = S.world().crystals.filter(c => c.mesh); const look = () => cr.map(c => { const m = c.mesh.material; return [m.color.getHex(), m.emissive ? m.emissive.getHex() : 0, m.opacity, c.mesh.visible, c.mesh.scale.y].join(':'); }).join('|');
    const l0 = look(); G = S.g(); for (let n = 0; n < 120; n++) { G.x = 0; G.vx = 0; S.stepN(1, D); } out.crystals = { n: cr.length, same: look() === l0 };
    S.salt(null); window._S3skiprender = false; return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const L = r.layout || {};
  ok('each world builds its verb in one host slot and nothing else in the dive moves', !!L[6] && L[1].kinds === '' && L[1].d === '' && L[31].d === '' && L[36].d === ''
    && L[6].kinds === 'ice' && L[6].d.split(' ').sort().join(' ').replace(/slabs-\d+\+0/, 'S') === 'pads-0+1 S'
    && L[11].kinds === 'loaf' && /^slabs-\d+\+0$/.test(L[11].d) && L[21].kinds === 'tube' && /^items-\d\+0$/.test(L[21].d)
    && L[26].kinds === 'rope' && /^items-\d\+0$/.test(L[26].d) && [1, 6, 11, 21, 26, 31, 36].every(l => L[l].floor), JSON.stringify(r.layout || r));
  ok('the chime: five cuts pay once; held inside a tube for ten steps it rings once', !!r.chime && r.chime.cut === 5 && r.chime.log === 1 && r.chimeHold.done && r.chimeHold.log === 0, JSON.stringify({ c: r.chime, h: r.chimeHold }));
  ok('the lantern line: one cut pays once; the chain holds, then falls and bursts', !!r.lantern && r.lantern.cut && r.lantern.log === 1 && r.lantern.held && r.lantern.fell && r.lantern.burst, JSON.stringify(r.lantern));
  ok('the ice parcel: a crack that holds through ten steps inside, a bumper that returns a handle landing, one shatter, no chip', !!r.ice && r.ice.st1 === 1 && r.ice.stHold === 1 && r.ice.up && r.ice.stage === 2 && r.ice.log === 1 && r.ice.chips === 0, JSON.stringify(r.ice));
  ok('the accordion loaf: one cut pays once', !!r.loaf && r.loaf.cut && r.loaf.log === 1, JSON.stringify(r.loaf));
  ok('Wall Climb: a banner every five bands, ripped once for +5 slivers, paid with the run', !!r.banner && r.banner.n === 6 && r.banner.bonus === 5 && r.banner.log === 1 && r.banner.paid - r.plain.paid === 5, JSON.stringify({ b: r.banner, p: r.plain }));
  ok("Deep Tide's bumpers wear a jellyfish, no other world's do", !!L[31] && L[31].pads > 0 && L[31].jelly === L[31].pads && [1, 6, 11, 21, 26, 36].every(l => L[l].jelly === 0), JSON.stringify(L[31]));
  ok("Glowcave's crystals never strobe", !!r.crystals && r.crystals.n > 0 && r.crystals.same, JSON.stringify(r.crystals));
  ok('no page errors through the verbs', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

console.log('\n=== fw: ' + pass + ' passed, ' + fail + ' failed ===');
