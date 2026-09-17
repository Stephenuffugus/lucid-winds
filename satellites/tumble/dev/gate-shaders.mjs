// Every material variant compiles: sock and ball (each roll), puffs, each trail, each basket style, each dryer model.
// Quick (one Load, a few frames per variant). node dev/gate-shaders.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 300, h: 650, port: 8794 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
try {
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=small&tier=0&seed=shaders', 'play');
  const looks = await D(() => {
    const items = TUMBLE.data.unlocks.items;
    return { basket: items.filter((i) => i.cat === 'basket').map((i) => i.look), dryer: items.filter((i) => i.cat === 'dryer').map((i) => i.look) };
  });
  const errsBefore = H.errors.length;
  for (const roll of ['tight', 'loose', 'tucked', 'mom']) {
    await D((roll) => { TUMBLE.game.render.setBallStyle(roll); TUMBLE_DEV.matchPair(); }, roll);
    await H.frames(3);
  }
  await D(() => {
    const R = TUMBLE.game.render;
    R.puff({ x: 0, y: 0.1, z: 0 }, { size: 34 });
    R.puff({ x: 0.1, y: 0.1, z: 0 }, { size: 70, color: 0xf3e6cc });
  });
  await H.frames(3);
  for (const t of ['sparkle', 'dust', 'hearts']) {
    await D((t) => { const R = TUMBLE.game.render; R.setTrail(t); R.emitTrail({ x: 0, y: 0.2, z: 0 }, { x: 0, y: 1, z: -1 }); }, t);
    await H.frames(3);
  }
  for (const look of looks.basket) { await D((l) => TUMBLE.game.render.setBasketStyle(l), look); await H.frames(2); }
  for (const look of looks.dryer) { await D((l) => TUMBLE.game.render.setDryerLook(l), look); await H.frames(2); }
  await D(() => TUMBLE.game.render.setView('room'));
  await H.frames(3);
  const errs = H.errors.slice(errsBefore).filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, `${looks.basket.length} baskets, ${looks.dryer.length} dryers, 4 ball rolls, puffs and 3 trails compile ` + errs.slice(0, 2).join(' | ').slice(0, 600));
  await H.shot('g-shaders.png');
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `shader gate: ${fails.length} FAILED` : 'shader gate: all passed');
process.exitCode = fails.length ? 1 : 0;
