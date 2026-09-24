// Radio gate (23 Sep 2026, the music player): a song plays its file, WHOLE (never looping while others are in the
// loop); when it ends the next song in the loop plays, and the loop wraps; a song switched out of the loop is skipped;
// the last song left in the loop repeats; the music switch stops it; a song she does not own can be listened to over
// the loop while the Radio sheet is open and stops when the sheet is laid down. The one second silence fixture stands
// in for his files (they live in the private music repo).
// node dev/gate-radio.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 60000) => H.page.waitForFunction(f, { timeout, polling: 100 }, arg).then(() => true, () => false);
const FIX = '/dev/radio-test/silence.wav';
try {
  await H.open('?nosw&turbo=1', 'room');
  await H.frames(3);
  const ids = await D((fix) => {
    const A = TUMBLE;
    const songs = A.data.unlocks.items.filter((i) => i.cat === 'radio' && i.look.url);
    for (const it of songs) it.look.url = fix;                    // every song is the fixture here
    for (const it of songs.slice(0, 3)) if (!A.save.unlocks.includes(it.id)) A.save.unlocks.push(it.id);   // she owns three
    A.audio.unlock();
    A.save.equipped.radio = songs[0].id;
    A._beds();
    return songs.map((i) => i.id);
  }, FIX);
  ok(ids.length === 8, `eight songs on the radio (${ids.length})`);
  const node = () => D(() => { const n = TUMBLE.audio.radioNode; return n ? { kind: n.kind, url: n.url, station: n.station, paused: n.el && n.el.paused, t: n.el && n.el.currentTime, routed: !!n.src, loop: n.el && n.el.loop, alive: n.alive } : null; });
  ok(await until(() => { const n = TUMBLE.audio.radioNode; return n && n.kind === 'track' && n.el && !n.el.paused && n.el.currentTime > 0.05; }), 'the first song in the loop plays its file');
  const t0 = await node();
  ok(t0 && t0.routed && !t0.loop && t0.url === FIX, `it is routed through the radio bus and does NOT loop while other songs are in the loop (${JSON.stringify(t0)})`);
  // the fixture is one second long: its end must bring the next song, then the third, then wrap to the first
  ok(await until((id) => TUMBLE.save.equipped.radio === id && TUMBLE.audio.radioNode && TUMBLE.audio.radioNode.alive, ids[1], 8000), 'when it ends the second song in the loop plays');
  ok(await until((id) => TUMBLE.save.equipped.radio === id, ids[2], 8000), 'then the third');
  ok(await until((id) => TUMBLE.save.equipped.radio === id, ids[0], 8000), 'then the loop wraps to the first');
  // a song switched out of the loop is skipped
  await D((id) => TUMBLE.radioToggle(id, false), ids[1]);
  const off = await D(() => TUMBLE.save.radioOff.slice());
  ok(off.length === 1 && off[0] === ids[1], `a song switched off is remembered as out of the loop (${JSON.stringify(off)})`);
  await until((id) => TUMBLE.save.equipped.radio === id, ids[2], 8000);
  const seen = [];
  const tEnd = Date.now() + 6000;
  while (Date.now() < tEnd) { const cur = await D(() => TUMBLE.save.equipped.radio); if (seen[seen.length - 1] !== cur) seen.push(cur); await new Promise((r) => setTimeout(r, 120)); }
  ok(seen.length >= 2 && !seen.includes(ids[1]), `the loop skips it: ${seen.map((s) => ids.indexOf(s) + 1).join(' ')}`);
  // one song left: it repeats
  await D((id) => TUMBLE.radioToggle(id, false), ids[2]);
  ok(await until((id) => TUMBLE.save.equipped.radio === id && TUMBLE.audio.radioNode && TUMBLE.audio.radioNode.el && TUMBLE.audio.radioNode.el.loop, ids[0], 8000), 'with one song left in the loop, that song repeats');
  // the music switch
  await D(() => TUMBLE.setSetting('music', false));
  ok(await until(() => !TUMBLE.audio.radioNode || !TUMBLE.audio.radioNode.alive), 'turning the music off stops the song');
  await D(() => TUMBLE.setSetting('music', true));
  ok(await until(() => { const n = TUMBLE.audio.radioNode; return n && n.alive && n.kind === 'track'; }), 'and on again brings it back');
  // switching off the last song turns the radio off
  await D((id) => TUMBLE.radioToggle(id, false), ids[0]);
  ok(await until(() => TUMBLE.save.equipped.radio === null && (!TUMBLE.audio.radioNode || !TUMBLE.audio.radioNode.alive)), 'switching off the last song turns the radio off');
  await D((id) => TUMBLE.radioToggle(id, true), ids[2]);
  ok(await until((id) => TUMBLE.save.equipped.radio === id && TUMBLE.audio.radioNode && TUMBLE.audio.radioNode.alive, ids[2]), 'switching a song on when the radio is off starts it');
  // the sheet: a switch a row, Listen and a price on the ones she does not own; Listen plays over the loop and the
  // sheet laid down stops it and the loop goes on
  await D(() => TUMBLE.screens.door('radio'));
  await H.frames(2);
  const sheet = await D(() => {
    const rows = [...document.querySelectorAll('#shopList .shopitem')].filter((r) => !r.classList.contains('radiohead'));
    const small = (b) => { const r = b.getBoundingClientRect(); return r.height < 48 || r.width < 48; };
    return {
      rows: rows.length,
      switches: rows.filter((r) => r.querySelector('button[aria-pressed]')).length,
      listens: rows.filter((r) => [...r.querySelectorAll('button')].some((b) => /^Listen$/.test(b.textContent))).length,
      prices: rows.filter((r) => [...r.querySelectorAll('button')].some((b) => /Quarters?$/.test(b.textContent))).length,
      smallButtons: [...document.querySelectorAll('#shopList button')].filter(small).length,
      head: (document.querySelector('#shopList .radiohead b') || {}).textContent,
      titles: rows.map((r) => r.querySelector('b').textContent),
    };
  });
  ok(sheet.rows === 8 && sheet.switches === 3 && sheet.listens === 5 && sheet.prices === 5, `the Radio sheet: eight songs, a switch on each of the three she owns, Listen and a price on the five she does not (${JSON.stringify({ rows: sheet.rows, switches: sheet.switches, listens: sheet.listens, prices: sheet.prices })})`);
  ok(sheet.smallButtons === 0, `every button on the sheet is 48 px or more (${sheet.smallButtons} small)`);
  ok(sheet.head === 'The radio is on', `the head says the radio is on (${sheet.head})`);
  ok(!sheet.titles.some((t) => /_/.test(t)) && sheet.titles.some((t) => /Sock It to Me/.test(t)) && !sheet.titles.some((t) => /Fold It Up/.test(t)), `titles are his song titles of 24 Sep (${sheet.titles.slice(0, 3).join(', ')})`);
  await D(() => { const b = [...document.querySelectorAll('#shopList button')].find((x) => x.textContent === 'Listen'); b.click(); });
  ok(await until(() => { const A = TUMBLE.audio; return A.previewNode && A.previewNode.alive && A.previewNode.el && !A.previewNode.el.paused; }), 'Listen plays the song she does not own');
  const held = await D(() => { const n = TUMBLE.audio.radioNode; return n && n.el ? n.el.paused : null; });
  ok(held === true, 'and the loop waits while she listens');
  ok(await D(() => [...document.querySelectorAll('#shopList button')].some((x) => x.textContent === 'Stop')), 'the Listen button reads Stop while it plays');
  await D(() => TUMBLE.ui.closeSheet(true));
  ok(await until(() => !TUMBLE.audio.previewNode), 'laying the sheet down stops the listen');
  ok(await until(() => { const n = TUMBLE.audio.radioNode; return n && n.alive && n.el && !n.el.paused; }), 'and the loop goes on');
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `radio gate: ${fails.length} FAILED` : 'radio gate: all passed');
process.exitCode = fails.length ? 1 : 0;
