// THE ROOM WITHOUT WORDS (Stephen, 24 Sep: "the words are completely covering everything on the shelf ... those areas
// should be highlighted like sparkly"). The hotspot tags are unseen (kept for screen readers), each hotspot twinkles,
// every hotspot is still 48 px and still answers a tap. Shot mid twinkle at a phone's width. OPEN IT.
//   node dev/shots-room-spots.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';
const W = Number(process.argv[2] || 412), H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8796, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 60000) => H.page.waitForFunction(f, { timeout: ms, polling: 200 }, arg).then(() => true, () => false);
try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1', 'room', 240000);
  await D(() => { const s = window.TUMBLE.save; s.economy.lint = 1240; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); window.TUMBLE.screens.refresh(); });
  ok(await until(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room'), 'the room is up and the camera has settled');
  const spots = await D(() => [...document.querySelectorAll('#spots .hotspot')].map((b) => { const r = b.getBoundingClientRect(), t = b.querySelector('.tag'), tr = t ? t.getBoundingClientRect() : null; const cs = getComputedStyle(b, '::before'); return { id: b.dataset.spot, w: r.width, h: r.height, tagW: tr ? tr.width : 0, tagH: tr ? tr.height : 0, label: b.getAttribute('aria-label'), twinkle: cs.animationName }; }));
  ok(spots.length >= 6, `${spots.length} hotspots in the room (${spots.map((s) => s.id).join(' ')})`);
  ok(spots.every((s) => s.tagW <= 1 && s.tagH <= 1), `no words on the room: every tag is unseen (${spots.map((s) => s.tagW.toFixed(0) + 'x' + s.tagH.toFixed(0)).join(' ')})`);
  ok(spots.every((s) => s.label && s.label.length > 2), 'every hotspot keeps its name for a screen reader');
  ok(spots.every((s) => s.w >= 48 && s.h >= 48), `every hotspot is 48 px or more (${spots.map((s) => s.w.toFixed(0) + 'x' + s.h.toFixed(0)).join(' ')})`);
  ok(spots.every((s) => s.twinkle === 'twinkle'), `every hotspot twinkles (${[...new Set(spots.map((s) => s.twinkle))].join(', ')})`);
  // a tap on the radio's spot still opens the Radio tab
  const r = await D(() => { const b = document.querySelector('#spots .hotspot[data-spot="radio"]'); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
  await H.tap(r.x, r.y);
  ok(await until(() => TUMBLE.ui.open && document.getElementById('sheetTitle').textContent === 'Behind the door' && !!document.querySelector('#shopList .radiohead')), 'a tap on the radio opens its tab, words or no words');
  await D(() => TUMBLE.ui.closeSheet(true));
  await H.frames(2);
  // two frames a beat apart, so a twinkle is caught lit in one of them
  await H.shot(`room-spots-a-${W}.png`);
  await new Promise((res) => setTimeout(res, 700));
  await H.frames(1);
  await H.shot(`room-spots-b-${W}.png`);
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `room spots: ${fails.length} FAILED` : 'room spots: all passed');
process.exitCode = fails.length ? 1 : 0;
