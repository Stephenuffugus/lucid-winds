// A Mountain Load's fifty pairs all fit in the basket: every lob counts as made, and the balls stay visible.
// node dev/gate-basket.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 300, h: 650 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 60000) => H.page.waitForFunction(f, { timeout, polling: 200 }, arg).then(() => true, () => false);
try {
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=mountain&tier=0&seed=basket1', 'play');
  const s0 = await D(() => TUMBLE_DEV.session());
  ok(s0.pairsLeft >= 50, `a Mountain Load (${s0.pairsLeft} pairs)`);
  let made = 0;
  for (let i = 0; i < s0.pairsLeft; i++) {
    const b = await D(() => TUMBLE_DEV.matchPair());
    if (b === null) break;
    await D((id) => TUMBLE_DEV.lobBall(id), b);
    const done = await until((n) => { const s = TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed >= n; }, i + 1);
    if (!done) { ok(false, `lob ${i + 1} never resolved`); break; }
    made = (await D(() => TUMBLE_DEV.session())).stats.shotsMade;
  }
  const st = (await D(() => TUMBLE_DEV.session())).stats;
  ok(st.shotsMissed === 0 && made >= 50, `all ${made} lobs landed (missed ${st.shotsMissed})`);
  const bodies = await D(() => TUMBLE_DEV.counts());
  ok(bodies.total < 80, `old balls leave the physics world (${bodies.total} bodies left)`);
  await H.frames(4);
  await H.shot('g-basket-full.png');
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `basket gate: ${fails.length} FAILED` : 'basket gate: all passed');
process.exitCode = fails.length ? 1 : 0;
