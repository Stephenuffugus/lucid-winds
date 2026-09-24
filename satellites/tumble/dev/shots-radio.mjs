// THE RADIO SHEET (23 Sep 2026, the music player), shot at a phone's width: his eight songs, the three she owns with
// their switches (one switched off), the five she does not with Listen and a price; every title whole on its line,
// every button 48 px; the room's radio dial lit while the radio is on. tests/radio.test.mjs holds the rules,
// dev/gate-radio.mjs the player; this is what she SEES.
//   node dev/shots-radio.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8795, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 30000) => H.page.waitForFunction(f, { timeout: ms, polling: 200 }, arg).then(() => true, () => false);
try {
  await H.open('?nosw&turbo=1', 'room');
  await H.frames(3);
  await D(() => {
    const A = TUMBLE, songs = A.data.unlocks.items.filter((i) => i.cat === 'radio' && i.look.url);
    for (const it of songs) it.look.url = '/dev/radio-test/silence.wav';
    for (const it of songs.slice(0, 3)) if (!A.save.unlocks.includes(it.id)) A.save.unlocks.push(it.id);
    A.save.economy.lint = 640;
    A.audio.unlock();
    A.radioToggle(songs[0].id, true);
    A.radioToggle(songs[2].id, false);
    for (const k of Object.keys(A.save.seen || {})) A.save.seen[k] = true;
    A.ui.hideHint();
    A.screens.refresh();
  });
  const dial = await D(() => { const m = TUMBLE.game.render.radioDialMat; return m ? m.emissiveIntensity : -1; });
  ok(dial > 0, `the radio dial is lit while the radio is on (${dial})`);
  await D(() => { TUMBLE.save.equipped.radio = null; TUMBLE._beds(); TUMBLE.screens.refresh(); });
  const dark = await D(() => { const m = TUMBLE.game.render.radioDialMat; return m ? m.emissiveIntensity : -1; });
  ok(dark === 0, `and dark when it is off (${dark})`);
  await D(() => { const A = TUMBLE; A.save.equipped.radio = A.data.unlocks.items.find((i) => i.cat === 'radio').id; A._beds(); A.screens.refresh(); });
  await H.frames(4);
  await H.shot(`radio-room-${W}.png`);
  await D(() => TUMBLE.screens.door('radio'));
  await H.frames(3);
  const r = await D(() => {
    const rows = [...document.querySelectorAll('#shopList .shopitem')];
    const clipped = rows.filter((row) => { const b = row.querySelector('b'); return b && b.scrollWidth > b.clientWidth + 1; }).map((row) => row.querySelector('b').textContent);
    const small = [...document.querySelectorAll('#shopList button')].filter((b) => { const q = b.getBoundingClientRect(); return q.height < 48 || q.width < 48; }).length;
    const wrapped = rows.filter((row) => { const b = row.querySelector('b'); return b && b.getBoundingClientRect().height > 30; }).map((row) => row.querySelector('b').textContent);
    return { rows: rows.length, clipped, small, wrapped, labels: [...document.querySelectorAll('#shopList button')].map((b) => b.textContent) };
  });
  ok(r.rows === 9, `the head row and eight songs (${r.rows})`);
  // the sheet scrolls up and down only (24 Sep: it panned sideways by the tab rows' overflow)
  const side = await D(() => { const b = document.getElementById('sheetBody'); return { sw: b.scrollWidth, cw: b.clientWidth, ox: getComputedStyle(b).overflowX }; });
  ok(side.sw <= side.cw && side.ox === 'hidden', `the sheet cannot move sideways (content ${side.sw} in ${side.cw}, overflow-x ${side.ox})`);
  ok(!r.clipped.length, `no title is clipped${r.clipped.length ? ': ' + r.clipped.join(', ') : ''}`);
  ok(!r.wrapped.length, `every title sits on one line at ${W}${r.wrapped.length ? ': ' + r.wrapped.join(', ') : ''}`);
  ok(r.small === 0, `every button is 48 px (${r.small} small)`);
  ok(r.labels.filter((l) => l === 'On').length === 3 && r.labels.filter((l) => l === 'Off').length === 1 && r.labels.filter((l) => l === 'Listen').length === 5, `switches read On (the radio and two songs) and Off (one song), five Listen (${r.labels.join(' ')})`);
  await H.shot(`radio-sheet-${W}.png`);
  await D(() => { document.getElementById('sheetBody').scrollTop = 99999; });
  await H.frames(2);
  await H.shot(`radio-sheet-end-${W}.png`);
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `radio shots: ${fails.length} FAILED` : 'radio shots: all passed');
process.exitCode = fails.length ? 1 : 0;
