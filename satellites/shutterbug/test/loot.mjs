/* Browser gate `loot` (BUILD-PLAN.md T1.6; QUESTIONS Q92, Stephen's ruling of 31 Oct on his note 5, "Dead pixels
 * only"): the chest pays its 15 Dead pixels and M1 shows no sheet. A room whose one Sun cell, two cells right of spawn,
 * is its scroll; its chest (row 39 in its build) and a blueprint are set on its floor by hand before the first state is
 * kept (named liberties: no fixture puts the three on one floor), so the replay starts from the state the room played.
 * A REAL touch held on the rocker's right walks the hero over the scroll, the blueprint and the chest, one step at a time
 * with the loop held:
 *   - no sheet, card or dialog shows and the page is never modal;
 *   - the scroll is taken with its pickup voice; its offer opens on the ground and the shell answers it on the next
 *     word (the biome's stat), as the bot does;
 *   - the blueprint is not drawn (its cell is the open floor, beside a scroll that is) and is taken in silence, the sim
 *     still carrying it;
 *   - the chest opens with its chest voice and pays 15: the count reads 15 at once and a handwritten +15 shows under
 *     it, in view, clear of the strip's controls, taking no tap, and goes after about a second;
 *   - a REAL tap on A as the chest opens (in the step its answer rides) still jumps, one step late;
 *   - the world holds still for exactly the two steps the answers ride and moves on every other, right held; no pick
 *     voice sounds (the pick is the shell's, not the player's);
 *   - the recording carries the two answers (one CHOICE A, one TAKE) and replays on the room's first state to the live
 *     hash.
 * At 412x915 and 360x780. At 320x568 with reduced motion the scroll's offer and the chest's compare open on one step and
 * are answered in the sim's order, one step each, the climb goes on, and the +15 stands still for its second. At 412x915
 * a new room started inside that second shows no +15, and its count reads its own 0 before its first step.
 *
 * Watched red by CHOICE_VIA_SHELL (the shell picks the stat itself: the replay's hash differs), OFFER_HOLDS_WORLD and
 * CHEST_HOLDS_WORLD (an answer dropped), OFFER_SHOWS and SLIP_BACK (the old sheets back), ANSWER_ORDER_SWAPPED, PLUS_MISSING,
 * PLUS_STAYS, PLUS_TAKES_TAPS, PLUS_CARRIES_OVER, DP_COUNT_STALE, PICK_SOUNDS, EDGE_LOST_TO_CHOICE, BLUEPRINT_DRAWN and
 * BLUEPRINT_SOUNDS. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, pressEl, sleep } from './harness.mjs';

const R = reporter('LOOT');
const srv = await serve();
const browser = await launch();
const W = 24, FLOOR = 46, SCROLL = 16, END = (W * 16 - 12) * 256;   /* the hero's x at the room's right edge */
const rows = []; for (let y = 0; y < 48; y++) rows.push(y === 47 ? '1'.repeat(W) : y >= 40 ? '1111' + '4'.repeat(W - 4) : '4'.repeat(W));
rows[FLOOR] = rows[FLOOR].slice(0, SCROLL) + 'e' + rows[FLOOR].slice(SCROLL + 1);
const REC = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows, rows2: null });

/* the room, its chest and (bx) a blueprint on the floor, the first state kept, one draw; and the page's probes */
async function openRoom(w, h, cx, bx, reduce) {
  const pg = await newPage(browser, { width: w, height: h });
  if (reduce) await pg.page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await gotoGame(pg.page, srv.base); await ready(pg.page);
  pg.s0 = await pg.page.evaluate((str, W, FLOOR, cx, bx) => {
    window.SB_DEV.hold(true);
    const ok = window.SB_DEV.loadRecord(str), st = window.SB.game.state;
    st.chest.idx = FLOOR * W + cx; st.chest.open = 0;
    if (bx !== null) st.loot.push({ kind: window.SB.sim.LOOT.BLUEPRINT, idx: FLOOR * W + bx, taken: 0 });
    window.__s0 = structuredClone(st);
    window.SB_DEV.step(0);   /* a draw, no step */
    const shown = el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getBoundingClientRect().height > 0; };
    window.__probe = () => {
      const s = window.SB.game.state, plus = document.getElementById('dpplus');
      return { x: s.hero.x, vy: s.hero.vy, ground: s.hero.ground, offered: !!s.scrollsOffered, compare: s.room.compare, open: s.chest.open,
        taken: s.loot.map(l => l.taken), carried: s.room.blueprints.slice(), dp: s.room.dp, dpn: document.getElementById('dpn').textContent,
        plus: plus.classList.contains('on') ? plus.textContent : '', modal: document.body.classList.contains('sb-modal'),
        dialogs: [...document.querySelectorAll('[role=dialog]')].filter(shown).map(d => d.id), screen: window.SB_DEV.screen(), heard: [] };
    };
    window.__step = () => { const v0 = window.SB.audio.events.length; window.SB_DEV.step(1); return Object.assign(window.__probe(), { heard: window.SB.audio.events.slice(v0).map(e => e.name) }); };
    return { ok: !!ok, screen: window.SB_DEV.screen(), loot: st.loot.map(l => [l.kind, l.idx]), chest: st.chest.idx, biome: window.SB.game.level.biome };
  }, REC, W, FLOOR, cx, bx);
  return pg;
}
/* the colours drawn in a cell of the view, and the room's open floor colour */
const cellOf = (page, col, row) => page.evaluate((col, row) => {
  const Rn = window.SB.render, cv = document.getElementById('view'), x0 = col * 16 - Rn.drawn.camX, y0 = row * 16 - Rn.drawn.cam;
  if (x0 < 0 || y0 < 0 || x0 + 16 > cv.width || y0 + 16 > cv.height) return null;
  const d = cv.getContext('2d').getImageData(x0, y0, 16, 16).data, seen = new Set();
  for (let i = 0; i < d.length; i += 4) seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
  const open = window.SB.palette.openColour(window.SB.palette.I.ASH, window.SB.game.level.biome | 0).map(Math.round), one = [...seen][0].split(',').map(Number);
  return { colours: seen.size, isOpen: seen.size === 1 && one.every((v, k) => Math.abs(v - open[k]) <= 2), first: [...seen][0], open: open.join(',') };
}, col, row);
/* the +15 as it shows: faded in within 2 s, still showing 400 ms later, under the count, in view, clear of the drawn
   controls and the strip's buttons, and a thumb on it lands on what lies under it */
async function plusNow(page) {
  const t0 = Date.now();
  const seen = await page.waitForFunction(() => Number(getComputedStyle(document.getElementById('dpplus')).opacity) > 0.5, { timeout: 2000, polling: 20 }).then(() => true).catch(() => false);
  const at = Date.now() - t0;
  const geo = await page.evaluate(() => {
    const el = document.getElementById('dpplus'), r = el.getBoundingClientRect(), n = document.getElementById('dpn').getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const over = ['#btnA .glyph', '#btnB .glyph', '#rocker .zl', '#rocker .zr', '#back', '#share'].filter(s => {
      const e = document.querySelector(s); if (!e) return false; const b = e.getBoundingClientRect();
      return b.height > 0 && b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom;
    });
    return { text: el.textContent, still: el.classList.contains('still'), opacity: Number(getComputedStyle(el).opacity), fs: parseFloat(getComputedStyle(el).fontSize),
      under: r.top >= n.bottom - 6 && r.top - n.bottom <= 24 && Math.abs(r.right - n.right) <= 24, inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      noTap: getComputedStyle(el).pointerEvents === 'none' && hit !== el, hitName: hit ? hit.id || hit.className || hit.tagName : 'nothing', over,
      box: [r.left, r.top, r.width, r.height].map(v => Math.round(v)) };
  });
  await sleep(400);
  const later = await page.evaluate(() => Number(getComputedStyle(document.getElementById('dpplus')).opacity));
  return Object.assign(geo, { seen, at, later });
}
const goneWithin = (page, ms) => page.waitForFunction(() => { const el = document.getElementById('dpplus'); return !el.classList.contains('on') && Number(getComputedStyle(el).opacity) < 0.05; }, { timeout: ms, polling: 50 }).then(() => true).catch(() => false);
const audioOn = async page => { let st = 'none'; for (let k = 0; k < 30 && st !== 'running'; k++) { await sleep(100); st = await page.evaluate(() => window.SB_DEV.audioState()); } return st; };
/* the steps the world held still while right was held (the hero short of the right edge) */
const stillSteps = trace => trace.map((p, k) => k > 0 && p.x === trace[k - 1].x && p.x < END ? k : -1).filter(k => k > 0);
/* the recording's answers, and its replay on the room's first state against the live hash */
const replayOf = page => page.evaluate(() => {
  const words = window.SB.sim.rle.decode(window.SB.input.recording()), C = window.SB.sim.CHOICE, s = window.SB.sim.attach(structuredClone(window.__s0), window.SB.game.level);
  for (const wd of words) window.SB.sim.step(s, wd);
  const ch = words.map(wd => (wd >> 6) & 15).filter(Boolean);
  return { a: ch.filter(c => c === C.A).length, take: ch.filter(c => c === C.TAKE).length, other: ch.filter(c => c !== C.A && c !== C.TAKE).length, same: window.SB.sim.hash(s) === window.SB_DEV.hash() };
});

try {
  for (const [w, h] of [[412, 915], [360, 780]]) {
    const BP = 18, CHEST = 21;
    const { page, errors, s0 } = await openRoom(w, h, CHEST, BP, false);
    R.say(s0.ok && s0.screen === 'play' && s0.loot.length === 2 && s0.loot[0][0] === 2 && s0.loot[0][1] === FLOOR * W + SCROLL && s0.loot[1][0] === 3 && s0.chest === FLOOR * W + CHEST,
      w + ': the room loads, its loot the scroll at (16, 46) and the blueprint set at (18, 46), its chest set at (21, 46)');
    const bpCell = await cellOf(page, BP, FLOOR), scCell = await cellOf(page, SCROLL, FLOOR);
    R.say(!!bpCell && bpCell.isOpen && !!scCell && scCell.colours > 1,
      w + ': the blueprint is not drawn: its cell is the open floor alone (' + (bpCell ? bpCell.colours + ' colour, ' + bpCell.first + ', the floor ' + bpCell.open : 'out of view') + '), where the scroll\'s cell shows its sprite (' + (scCell ? scCell.colours : 0) + ' colours)');

    /* the walk: a real touch held on the right zone, one step at a time; a real tap on A as the chest opens */
    const trace = [await page.evaluate(() => window.__probe())];
    const finger = await pressEl(page, '#rocker .zr');
    const ctx = await audioOn(page);
    let chestAt = -1, plus = null;
    for (let k = 0; k < 90; k++) {
      const p = await page.evaluate(() => window.__step());
      trace.push(p);
      if (p.open && chestAt < 0) { chestAt = trace.length - 1; plus = await plusNow(page); await tap(page, '#btnA'); }
      if (chestAt > 0 && trace.length - 1 > chestAt + 4 && p.x >= END) break;
    }
    await finger.end();
    const gone = await goneWithin(page, 3000);

    const scrollAt = trace.findIndex(p => p.taken[0]), bpAt = trace.findIndex(p => p.taken[1]), offerAt = trace.findIndex(p => p.offered);
    const still = stillSteps(trace), heard = trace.flatMap(p => p.heard), bad = trace.filter(p => p.dialogs.length || p.modal);
    R.say(bad.length === 0 && trace.every(p => p.screen === 'play'), w + ': no sheet, card or dialog shows on the walk and the page is never modal (' + (bad.length ? bad[0].dialogs.join(', ') + (bad[0].modal ? ' modal' : '') : 'none') + ')');
    R.say(scrollAt > 0 && trace[scrollAt].heard.includes('pickup') && offerAt > scrollAt && !!trace[offerAt + 1] && !trace[offerAt + 1].offered,
      w + ': the scroll is taken with its pickup voice (step ' + scrollAt + '), its offer opens on the ground (step ' + offerAt + ') and the shell answers it on the next word');
    R.say(bpAt > 0 && trace[bpAt].heard.length === 0 && trace[trace.length - 1].carried.includes(FLOOR * W + BP),
      w + ': the blueprint is taken in silence (step ' + bpAt + ', voices: ' + (bpAt > 0 ? trace[bpAt].heard.join(', ') || 'none' : 'never taken') + ') and the sim still carries it');
    const ch = chestAt > 0 ? trace[chestAt] : null;
    R.say(!!ch && ch.heard.includes('chest') && ch.dp === 15 && ch.dpn === '15' && ch.plus === '+15' && !!plus && plus.seen && plus.text === '+15',
      w + ': the chest opens with its chest voice and pays 15: the count reads ' + (ch ? ch.dpn : 'nothing') + ' at once and a handwritten ' + (plus ? plus.text : 'nothing') + ' shows under it (faded in by ' + (plus ? plus.at : 0) + ' ms)');
    R.say(!!plus && plus.under && plus.inView && plus.over.length === 0 && plus.fs >= 16, w + ': the +15 sits under the count, in view, ' + (plus ? plus.fs : 0) + ' px, clear of the drawn controls and the strip\'s buttons (box ' + (plus ? plus.box.join(' ') : '') + (plus && plus.over.length ? ', over ' + plus.over.join(' ') : '') + ')');
    R.say(!!plus && plus.noTap, w + ': the +15 takes no tap: a thumb on it lands on ' + (plus ? plus.hitName : 'nothing') + ', what lies under it');
    R.say(!!plus && plus.later > 0.5 && gone, w + ': the +15 still shows 400 ms on (opacity ' + (plus ? plus.later.toFixed(2) : 0) + ') and goes after about a second (' + gone + ')');
    const ans = chestAt > 0 ? trace[chestAt + 1] : null, next = chestAt > 0 ? trace[chestAt + 2] : null;
    R.say(!!ans && !!next && ans.compare === 0 && !next.ground && next.vy < 0 && next.heard.includes('jump'),
      w + ': a real tap on A as the chest opens rides past its answer\'s step and jumps on the next (vy ' + (next ? next.vy : '?') + ', ' + (next ? next.heard.join(', ') || 'silent' : '') + ')');
    R.say(still.length === 2 && still[0] === offerAt + 1 && still[1] === chestAt + 1 && trace[trace.length - 1].x >= END,
      w + ': the world holds still for exactly the two steps the answers ride (steps ' + still.join(', ') + ', the answers at ' + (offerAt + 1) + ' and ' + (chestAt + 1) + ') and moves on every other to the room\'s edge');
    R.say(!heard.includes('pick') && heard.filter(n => n === 'pickup').length === 1 && heard.filter(n => n === 'chest').length === 1 && ctx === 'running',
      w + ': no pick voice sounds; one pickup and one chest voice (' + (heard.join(', ') || 'none') + ', the context ' + ctx + ')');
    const rp = await replayOf(page);
    R.say(rp.a === 1 && rp.take === 1 && rp.other === 0 && rp.same, w + ': the recording carries the two answers (' + rp.a + ' A, ' + rp.take + ' TAKE) and replays on the room\'s first state to the live hash (' + rp.same + ')');
    R.say(errors.length === 0, w + ': no page errors' + (errors.length ? ' (' + errors.join('; ') + ')' : ''));
    await page.close();
  }

  /* the scroll's offer and the chest's compare on one step (the chest one cell past the scroll), with reduced motion:
     answered in the order the sim reads them, one step each, and the +15 stands still for its second */
  {
    const { page, errors, s0 } = await openRoom(320, 568, 17, null, true);
    const trace = [await page.evaluate(() => window.__probe())];
    const finger = await pressEl(page, '#rocker .zr');
    let both = -1, plus = null;
    for (let k = 0; k < 90; k++) {
      const p = await page.evaluate(() => window.__step());
      trace.push(p);
      if (p.offered && p.compare && both < 0) { both = trace.length - 1; plus = await plusNow(page); }
      if (both > 0 && p.x >= END) break;
    }
    await finger.end();
    const gone = await goneWithin(page, 3000), still = stillSteps(trace), bad = trace.filter(p => p.dialogs.length || p.modal);
    const a1 = both > 0 ? trace[both + 1] : null, a2 = both > 0 ? trace[both + 2] : null;
    R.say(s0.ok && both > 0 && !!a1 && !a1.offered && a1.compare === 1 && !!a2 && a2.compare === 0 && still.join() === (both + 1) + ',' + (both + 2) && trace[trace.length - 1].x >= END && bad.length === 0,
      '320: the scroll\'s offer and the chest\'s compare open on one step (' + both + ') and are answered in the sim\'s order, one step each (still at ' + still.slice(0, 6).join(', ') + (still.length > 6 ? ' and ' + (still.length - 6) + ' more' : '') + '), and the climb goes on with no sheet');
    R.say(!!plus && plus.still && plus.seen && plus.at < 300 && plus.later > 0.99 && gone && plus.inView && plus.over.length === 0,
      '320: with reduced motion the +15 stands still (opacity ' + (plus ? plus.opacity : 0) + ' at once, ' + (plus ? plus.later : 0) + ' 400 ms on), in view and clear of the controls (box ' + (plus ? plus.box.join(' ') : '') + '), and goes after about a second (' + gone + ')');
    R.say(errors.length === 0, '320: no page errors' + (errors.length ? ' (' + errors.join('; ') + ')' : ''));
    await page.close();
  }

  /* a new room at once after a chest (the chest one cell right of spawn): the title (SB_DEV.goto, a named liberty) and
     a REAL tap on Try the sample room, well inside the +15's second: the new room shows no +15 */
  {
    const { page, errors } = await openRoom(412, 915, 15, null, true);
    const finger = await pressEl(page, '#rocker .zr');
    let opened = false;
    for (let k = 0; k < 6 && !opened; k++) opened = !!(await page.evaluate(() => window.__step())).open;
    await finger.end();
    const was = await page.evaluate(() => ({ on: document.getElementById('dpplus').classList.contains('on'), dpn: document.getElementById('dpn').textContent }));
    await page.evaluate(() => window.SB_DEV.goto('title'));
    await tap(page, '#sample');
    const now = await page.evaluate(() => { const el = document.getElementById('dpplus'); return { screen: window.SB_DEV.screen(), on: el.classList.contains('on'), opacity: Number(getComputedStyle(el).opacity), dpn: document.getElementById('dpn').textContent, steps: window.SB_DEV.state().frame }; });
    R.say(opened && was.on && now.screen === 'play' && !now.on && now.opacity < 0.05, '412: a new room right after the chest shows no +15 (the chest\'s +15 ' + (was.on ? 'up' : 'never up') + ', in the new room ' + (now.on ? 'still up' : 'gone') + ', opacity ' + now.opacity + ')');
    R.say(was.dpn === '15' && now.dpn === '0' && now.steps === 0, '412: the new room\'s count reads its own 0 before its first step (the last room\'s ' + was.dpn + ', now ' + now.dpn + ' at step ' + now.steps + ')');
    R.say(errors.length === 0, '412 new room: no page errors' + (errors.length ? ' (' + errors.join('; ') + ')' : ''));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
R.finish();
