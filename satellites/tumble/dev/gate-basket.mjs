// A Mountain Load's fifty pairs all fit in the basket: every lob counts as made, and the balls stay visible.
// node dev/gate-basket.mjs
//
// ⛔ 23 Sep: this read 48 of 50 from the 23 Sep morning commits on. Bisected with the lobs watched one by one: the two
// misses were the SECOND and THIRD lobs (one live ball in the basket), one ending on the pile mid table and one beside
// the basket; the trees before those commits land 50 of 50; the Load for this seed is sock for sock the same in every
// tree before them and DIFFERENT after (the hero budget and the families changed what a seed deals); and today's code
// dealing the OLD pile lands 50 of 50. So it was the pile, never the basket: the tap lob always left from one fixed
// spot 25 cm up at the front of the table, and this Mountain pile stood taller than that there, so the ball was born
// inside the socks and came out short. A player on the tap path (the one that promises flicking is never required)
// could meet it. play.lob now starts the ball just above whatever the pile holds at the launch (src/play.js).
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
  const missed = (await D(() => [...TUMBLE.game.session.balls.values()].filter((x) => x.state === 'table').map((x) => x.id)));
  ok(st.shotsMissed === 0 && made >= 50, `all ${made} lobs landed (missed ${st.shotsMissed}${missed.length ? ': balls ' + missed.join(' ') : ''})`);
  const bodies = await D(() => TUMBLE_DEV.counts());
  ok(bodies.total < 80, `old balls leave the physics world (${bodies.total} bodies left)`);
  await H.frames(4);
  await H.shot('g-basket-full.png');
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `basket gate: ${fails.length} FAILED` : 'basket gate: all passed');
process.exitCode = fails.length ? 1 : 0;
