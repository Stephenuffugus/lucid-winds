import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0]));
await p.setViewport({ width: 375, height: 667 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 4000));
const r = await p.evaluate(() => {
  const S = window._S3, out = {}, D = 1000 / 120; window._S3skiprender = true;
  const fall = (x, y, ang, vy) => { const G = S.g(); G.x = x; G.y = y; G.vx = 0; G.vy = vy == null ? -8 : vy; G.w = 0; G.ang = ang; S.hold(0); };
  // chime
  S.salt(77); S.newFF(21); let V = S.verbs(), G = S.g();
  for (let i = 0; i < 5; i++) { const t = V[i]; if (t.done) continue; fall(t.x, t.top + 1.2, Math.PI / 2); for (let n = 0; n < 30 && !t.done; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } }
  out.chime = { cut: V.filter(t => t.done).length, log: S.verbLog().chime || 0, score: G.score };
  // the chime held inside a tube for ten steps rings once (a fresh dive)
  S.salt(77); S.newFF(21); V = S.verbs(); G = S.g(); const t0 = V[2]; let s0 = G.score;
  for (let n = 0; n < 10; n++) { G.x = t0.x; G.y = t0.top - 0.4; G.vx = 0; G.vy = -0.5; G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
  out.chimeHold = { done: !!t0.done, slices: G.slices, log: S.verbLog().chime || 0 };
  // lantern line
  S.salt(77); S.newFF(26); V = S.verbs(); G = S.g(); const rp = V[0]; const ry0 = rp.y - rp.sag;
  fall(0, ry0 + 1.0, Math.PI / 2); for (let n = 0; n < 20 && !rp.done; n++) { G.ang = Math.PI / 2; S.stepN(1, D); }
  const L0 = rp.grp.lan[2]; const yA = L0.y; S.stepN(Math.round(0.3 * 120), D); const yB = L0.y; S.stepN(Math.round(0.4 * 120), D); const yC = L0.y; S.stepN(Math.round(1.2 * 120), D);
  out.lantern = { cut: !!rp.done, log: S.verbLog().lantern || 0, heldAt03: yB === yA, fellBy07: yC < yB - 0.5, allOut: rp.grp.lan.every(l => l.out) };
  // ice: crack falling blade down, held inside ten steps, then the bumper (handle down) sends it back up to shatter
  S.salt(77); S.newFF(6); V = S.verbs(); G = S.g(); const ic = V[0];
  fall(ic.x, ic.y + ic.h / 2 + 1.7, Math.PI / 2); for (let n = 0; n < 20 && ic.stage < 1; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
  const st1 = ic.stage;
  for (let n = 0; n < 10; n++) { G.x = ic.x; G.y = ic.y; G.vx = 0; G.vy = -0.2; G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
  const stHold = ic.stage;
  const pad = S.world().pads.find(q => q.up); fall(pad.x, pad.y + 3.5 + 0.4, -Math.PI / 2, -6);
  let up = false; for (let n = 0; n < 80 && ic.stage < 2; n++) { G.ang = -Math.PI / 2; G.w = 0; S.stepN(1, D); if (G.vy > 0) up = true; }
  out.ice = { st1, stHold, bounced: up, stage: ic.stage, log: S.verbLog().ice || 0, chips: G.chips || 0 };
  // loaf
  S.salt(77); S.newFF(11); V = S.verbs(); G = S.g(); const lf = V[0];
  fall(lf.x, lf.y + lf.h / 2 + 1.7, Math.PI / 2); for (let n = 0; n < 20 && !lf.done; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
  out.loaf = { cut: !!lf.done, log: S.verbLog().loaf || 0 };
  // banner: a Wall Climb knife at the first banner rips it once; held there ten steps, still once
  S.newClimb(1); V = S.verbs(); G = S.g(); const bn = V[0];
  for (let n = 0; n < 10; n++) { G.x = bn.x0 - 0.6; G.y = bn.y; G.vx = 0; G.vy = 0; G.w = 0; S.stepN(1, D); }
  out.banner = { ripped: !!bn.done, bonus: G.slivBonus || 0, log: S.verbLog().banner || 0, n: V.length };
  S.salt(null); return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('errs', JSON.stringify(errs));
await b.close();
