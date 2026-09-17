// Full flow look: room -> Load -> (rules solved by the test hook) -> sweep -> results -> room. node tools/flow.mjs
import { harness, sleep } from './harness.mjs';
const H = await harness({ w: 390, h: 844 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, t = 120000) => H.page.waitForFunction(f, { timeout: t, polling: 250 }, arg).then(() => true, (e) => { console.log('timeout', e.message.slice(0, 80)); return false; });
try {
  await H.open('?nosw&debug=1', null);
  await until(() => window.TUMBLE_DEV && TUMBLE_DEV.app);
  await H.frames(6);
  await H.shot('f1-room.png');
  console.log('data', JSON.stringify(await D(() => TUMBLE_DEV.app.data())));
  await D(() => TUMBLE_DEV.app.grant({ seenHowTo: true, stats: { loads: 1 } }));
  await D(() => TUMBLE_DEV.app.openDryer());
  await H.frames(8);
  await H.shot('f2-modes.png');
  await D(() => TUMBLE_DEV.app.start({ mode: 'laundry', size: 'small', seed: 'flow1', tier: 3 }));
  await until(() => TUMBLE_DEV.state === 'dump');
  await H.frames(10);
  await H.shot('f3-dump.png');
  await until(() => TUMBLE_DEV.state === 'play');
  await H.frames(4);
  await H.shot('f4-play.png');
  const n = await D(() => TUMBLE_DEV.cheatSolve());
  console.log('solved pairs', n);
  await until(() => TUMBLE_DEV.state === 'sweep' || TUMBLE_DEV.state === 'results');
  await H.frames(3);
  await H.shot('f5-sweep.png');
  await until(() => TUMBLE_DEV.state === 'results');
  await H.frames(30);
  await H.shot('f6-results.png');
  console.log('ui', JSON.stringify(await D(() => TUMBLE_DEV.app.ui())));
  const sv = await D(() => TUMBLE_DEV.app.save());
  console.log('save', JSON.stringify({ lint: sv.economy.lint, q: sv.economy.quarters, drawer: sv.drawer.length, bin: sv.oddBin.length, loads: sv.stats.loads }));
} catch (e) { console.log('FAILED', e.message); await H.shot('f-crash.png'); }
console.log(H.errors.join('\n') || 'no console errors');
await H.close();
