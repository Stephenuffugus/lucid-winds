// Probe: after pause -> Leave this Load, when does the play HUD actually hide? Logs class and opacity per frame.
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844, port: 8799 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=small&seed=hudprobe', 'play', 240000);
await D(() => TUMBLE.pause());
await H.frames(2);
const log = await D(() => new Promise((res) => {
  const hud = document.getElementById('hud');
  const out = [];
  const t0 = performance.now();
  const rec = (tag) => out.push({ tag, t: Math.round(performance.now() - t0), cls: hud.className, op: getComputedStyle(hud).opacity, state: TUMBLE_DEV.state });
  const mo = new MutationObserver((ms) => { for (const m of ms) rec('mutation:' + m.attributeName); });
  mo.observe(hud, { attributes: true });
  rec('before click');
  [...document.querySelectorAll('#ui button')].find((b) => /Leave/.test(b.textContent)).click();
  rec('after click');
  let k = 0;
  (function f() { rec('frame ' + (++k)); if (k >= 8) { mo.disconnect(); res(out); } else requestAnimationFrame(f); })();
}));
for (const l of log) console.log(JSON.stringify(l));
await H.close();
