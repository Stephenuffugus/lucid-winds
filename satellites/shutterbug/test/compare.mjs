/* Browser gate `compare` (Weapons v1 step 2, docs/WEAPONS-V1.md 13.2, BUILD-PLAN T2.7's name): the swap card, by real
 * input. The fight gate's flat Frost room loaded through SB_DEV.loadRecord, its chest set on the floor at (5, 46) and the
 * bug's slots laid by hand to Boomerang and Anvil Boots before the first state is kept (named liberties: the sitting
 * would take two chests to fill both slots), so the chest's weapon is a jump weapon for a full jump slot. Steering by
 * real arrow keys, the card's buttons and Pause by real touches; the loop held and stepped. At 412x915, 360x780 and
 * 320x568:
 *   - the chest by a real walk opens the swap card (role dialog, modal) on its step; its heading, both rows (name and
 *     sentence), the comparison line and both buttons are COPY's words (evaluated here from the page's source), the line
 *     the one this gate computes from ui.TRAITS (read here from the source) in DESIGN's order (lift, holds, both sides,
 *     reach, damage; at most two); every pair of built weapons gives the gate's line through SB.ui.compareLine too;
 *   - Take first in Sun, Keep plain, each 48 px or more both ways, on top, in view, inside the card;
 *   - while it is open nothing in the world moves through 30 steps of a held arrow and real taps on A and B (the hero,
 *     the enemies, the pool, the traps, the cooldowns, the loot, the generator): only the frame counts;
 *   - a real tap on Pause opens the pause card over it (the screen pause, the card under it), Resume comes back to it
 *     (still open, still holding);
 *   - a real tap on Take: the next step equips the new weapon (EQUIP and PICK; the pick voice and the equip voice), the
 *     card hides, the jump box's 576 pixels are the new weapon's glyph decoded here, the pickup card names it;
 *   - the recording carries the TAKE and, replayed on the kept first state, reaches the live hash;
 *   - again with Keep: the slots kept, PICK alone, no voice of a pick, the card gone.
 * Watched red by SWAP_AUTO_TAKES, SIM_RUNS_UNDER_SWAP, SWAP_WORDS_WRONG, SWAP_NOT_MODAL. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, GAME } from './harness.mjs';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const R = reporter('COMPARE');
const SBN = createRequire(import.meta.url)(join(GAME, 'tools', 'core-loader.js')).loadCoreFull(join(GAME, 'index.html')).SB;
const SRC = readFileSync(process.env.SB_PAGE || join(GAME, 'index.html'), 'utf8');
const COPY = (() => {
  const at = SRC.indexOf('ui.COPY = Object.freeze(') + 'ui.COPY = Object.freeze('.length; let d = 0, k = at;
  for (; k < SRC.length; k++) { if (SRC[k] === '{') d++; else if (SRC[k] === '}') { d--; if (d === 0) break; } }
  return vm.runInNewContext('(' + SRC.slice(at, k + 1) + ')');
})();
const TRAITS = vm.runInNewContext('(' + SRC.match(/ui\.TRAITS = (\{[^;]*\});/)[1] + ')');
const SPR = vm.runInNewContext(SRC.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//)[1] + '\n;SPRITES');
const RGB = SBN.palette.RGB, BUILT = SBN.TUNING.WEAPONS_BUILT;
const WPN = ['', 'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'D1'];
const iconPx = id => SPR.icon_weapons.frames[id].split('/').map(r => [...r].map(c => c === '.' ? null : RGB[parseInt(c, 16)].join(','))).flat();
/* the gate's own comparison line (8.6): the new weapon's differences from yours, at most two, lift, holds, both sides,
   reach, damage; none, cmpOther */
const lineOf = (n, o) => {
  const a = TRAITS[n], b = TRAITS[o], said = [];
  if (a[4] > b[4]) said.push(COPY.cmpLift);
  if (a[3] > b[3]) said.push(COPY.cmpHolds);
  if (a[2] !== b[2]) said.push(a[2] ? COPY.cmpBoth : COPY.cmpOne);
  if (a[0] !== b[0]) said.push(a[0] > b[0] ? COPY.cmpFarther : COPY.cmpShorter);
  if (a[1] !== b[1]) said.push(a[1] > b[1] ? COPY.cmpHarder : COPY.cmpSofter);
  if (!said.length) said.push(COPY.cmpOther);
  return COPY.wpn[n] + ' ' + said.slice(0, 2).join(COPY.cmpAnd) + '.';
};

const srv = await serve();
const browser = await launch();
const W = 24, FLOOR = 46, CHEST = 5;
const rows = []; for (let y = 0; y < 48; y++) rows.push(y === 47 ? '1'.repeat(W) : '4'.repeat(W));
rows[3] = '4'.repeat(10) + '666' + '4'.repeat(11); rows[4] = '4'.repeat(10) + '111' + '4'.repeat(11);
const REC = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows, rows2: null });

async function install(page) {
  await page.evaluate(() => {
    window.__world = () => { const s = window.SB.game.state; return JSON.stringify([s.hero, s.enemies, s.proj, s.traps, s.loot, s.chest, s.rng, s.room.dp, s.room.cand, s.room.compare]); };
    window.__probe = () => {
      const s = window.SB.game.state, el = document.getElementById('swap');
      return { frame: s.frame, x: s.hero.x, slots: s.hero.slots.slice(), compare: s.room.compare, cand: s.room.cand, ev: s.ev, screen: window.SB_DEV.screen(),
        on: !!el && el.classList.contains('on') && el.getBoundingClientRect().height > 0, modal: document.body.classList.contains('sb-modal'),
        paused: document.getElementById('paused').classList.contains('on'), got: document.getElementById('got').classList.contains('on') ? document.querySelector('#got b').textContent : '' };
    };
    window.__step = n => { const v0 = window.SB.audio.events.length; let p; for (let k = 0; k < (n || 1); k++) { window.SB_DEV.step(1); p = window.__probe(); } return Object.assign(p, { heard: window.SB.audio.events.slice(v0).map(e => e.name) }); };
  });
}
/* the room with the liberties: the chest at (cx, 46) shut, the loot and enemies cleared, the slots J1 and D1 */
const setRoom = (page) => page.evaluate((str, W, FLOOR, cx) => {
  window.SB_DEV.hold(true);
  const ok = window.SB_DEV.loadRecord(str), st = window.SB.game.state;
  st.chest.idx = FLOOR * W + cx; st.chest.open = 0; st.loot.length = 0; st.enemies.length = 0;
  st.enemies.push({ kind: 1, x: 18 * 4096, y: 30 * 4096, vx: 0, vy: 0, hp: 4, state: 0, timer: 0, dir: 1, home: 30 * W + 18, elite: 0, frozen: 0, stunned: 0, hurt: 0 });   /* a live moth, to see it held */
  st.hero.slots[0] = 1; st.hero.slots[1] = 9;
  window.__s0 = structuredClone(st);
  window.SB_DEV.step(0);
  return { ok: !!ok, screen: window.SB_DEV.screen() };
}, REC, W, FLOOR, CHEST);
const probe = page => page.evaluate(() => window.__probe());
const stepN = (page, n) => page.evaluate(n => window.__step(n), n);
const world = page => page.evaluate(() => window.__world());
async function walkToSwap(page) {
  await page.keyboard.down('ArrowLeft');
  let p = null;
  for (let k = 0; k < 120; k++) { p = await stepN(page, 1); if (p.compare) break; }
  return p;
}
const cardGeo = page => page.evaluate(() => {
  const el = document.getElementById('swap'), cr = el.getBoundingClientRect(), out = { card: [cr.left, cr.top, cr.right, cr.bottom].map(Math.round) };
  out.head = el.querySelector('h2').textContent; out.role = el.getAttribute('role');
  out.rows = [...el.querySelectorAll('.srow')].map(r => [r.querySelector('b').textContent, r.querySelector('span').textContent]);
  out.cmp = el.querySelector('.cmp').textContent;
  out.btns = ['#swaptake', '#swapkeep'].map(sel => {
    const b = document.querySelector(sel), r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { text: b.textContent, w: r.width, h: r.height, top: hit === b || b.contains(hit), inCard: r.left >= cr.left && r.right <= cr.right && r.top >= cr.top && r.bottom <= cr.bottom,
      inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, bg: getComputedStyle(b).backgroundColor, x: r.left };
  });
  out.sun = getComputedStyle(document.documentElement).getPropertyValue('--sun').trim();
  return out;
});
const slotPx = (page, k) => page.evaluate(k => { const cv = document.querySelectorAll('#slots .slot canvas')[k], d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, out = []; for (let i = 0; i < d.length; i += 4) out.push(d[i + 3] === 0 ? null : d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return out; }, k);
const hexRgb = h => { const m = h.replace('#', ''); return 'rgb(' + [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16)).join(', ') + ')'; };

try {
  for (const [w, h] of [[412, 915], [360, 780], [320, 568]]) {
    const { page, errors } = await newPage(browser, { width: w, height: h });
    await gotoGame(page, srv.base); await ready(page);
    await tap(page, '.art');
    await install(page);
    const s0 = await setRoom(page);
    await stepN(page, 4);
    /* every pair of built jump weapons, through the page's own compareLine */
    const pairs = await page.evaluate(ids => { const out = {}; for (const n of ids) for (const o of ids) if (n !== o && n[0] === o[0]) out[n + o] = window.SB.ui.compareLine(n, o); return out; }, BUILT);
    const wrongPairs = Object.entries(pairs).filter(([k, v]) => v !== lineOf(k.slice(0, 2), k.slice(2)));
    R.say(Object.keys(pairs).length >= 56 && wrongPairs.length === 0, w + ': every pair of built weapons of a slot gives the gate\'s comparison line (' + Object.keys(pairs).length + ' pairs' + (wrongPairs.length ? '; ' + wrongPairs.slice(0, 2).map(([k, v]) => k + ' says "' + v + '", the gate "' + lineOf(k.slice(0, 2), k.slice(2)) + '"').join('; ') : '') + ')');

    const p = await walkToSwap(page);
    const nu = p ? WPN[p.cand] : '', old = 'J1';
    R.say(s0.ok && !!p && p.compare === 1 && p.cand >= 2 && p.cand <= 8 && p.on && p.modal && p.screen === 'play' && JSON.stringify(p.slots) === '[1,9,0]',
      w + ': the chest by a real walk opens the swap card for ' + nu + ' over the full jump slot on its step, modal, the screen still play (' + (p ? 'card ' + p.on + ', modal ' + p.modal : 'no swap') + ')');
    const g = await cardGeo(page), C = COPY;
    const wantHead = C.swapHead.replace('{old}', C.wpn[old]).replace('{new}', C.wpn[nu]);
    R.say(g.role === 'dialog' && g.head === wantHead && JSON.stringify(g.rows) === JSON.stringify([[C.wpn[nu], C.wpnSays[nu]], [C.wpn[old], C.wpnSays[old]]]) && g.cmp === lineOf(nu, old)
      && g.btns[0].text === C.swapTake.replace('{new}', C.wpn[nu]) && g.btns[1].text === C.swapKeep.replace('{old}', C.wpn[old]),
      w + ': the card says COPY\'s words: "' + g.head + '", the new row then yours, "' + g.cmp + '" (the gate\'s line from ui.TRAITS: "' + lineOf(nu, old) + '"), "' + g.btns.map(b => b.text).join('" and "') + '"');
    R.say(g.btns.every(b => b.w >= 48 && b.h >= 48 && b.top && b.inCard && b.inView) && g.btns[0].x < g.btns[1].x && g.btns[0].bg === hexRgb(g.sun) && g.btns[1].bg !== g.btns[0].bg,
      w + ': Take first in Sun and Keep plain, each 48 px or more (' + g.btns.map(b => Math.round(b.w) + 'x' + Math.round(b.h)).join(', ') + '), on top, in view, inside the card');

    /* the world holds: 30 steps of a held arrow and real taps on A and B */
    await page.keyboard.down('ArrowRight');
    const before = await world(page), f0 = (await probe(page)).frame;
    for (let k = 0; k < 30; k++) { if (k % 7 === 0) await tap(page, '#btnA'); if (k % 11 === 3) await tap(page, '#btnB'); await stepN(page, 1); }
    await page.keyboard.up('ArrowRight'); await page.keyboard.up('ArrowLeft');
    const after = await world(page), p2 = await probe(page);
    R.say(before === after && p2.frame === f0 + 30 && p2.on && p2.compare === 1, w + ': while it is open nothing in the world moves through 30 steps of a held arrow and real taps on A and B (only the frame counts: ' + (p2.frame - f0) + '; the world ' + (before === after ? 'held' : 'MOVED') + ')');

    /* Pause over it, Resume back to it */
    await tap(page, '#pause');
    const pp = await page.evaluate(() => { const pc = document.getElementById('paused'), r = pc.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { screen: window.SB_DEV.screen(), on: pc.classList.contains('on'), top: pc.contains(hit), z: [getComputedStyle(pc).zIndex, getComputedStyle(document.getElementById('swap')).zIndex] }; });
    await tap(page, '#resume');
    const pr = await probe(page);
    R.say(pp.screen === 'pause' && pp.on && pp.top && pr.screen === 'play' && pr.on && pr.compare === 1 && !pr.paused, w + ': a real tap on Pause opens the pause card over the swap card (z ' + pp.z.join(' over ') + '), and Resume comes back to it, still open');

    /* Take */
    await tap(page, '#swaptake');
    const t1 = await stepN(page, 1), t2 = await stepN(page, 1);
    const px = await slotPx(page, 0), want = iconPx(nu);
    R.say(t1.slots[0] === WPN.indexOf(nu) && t1.slots[1] === 9 && !t1.compare && t1.heard.includes('pick') && t1.heard.includes('equip') && !t2.on && t1.got === COPY.wpn[nu],
      w + ': a real tap on Take equips ' + nu + ' on the next step with the pick and equip voices (' + t1.heard.join(', ') + '), the card gone, the pickup card naming ' + JSON.stringify(t1.got));
    R.say(px.length === 576 && px.every((c, i) => c === want[i]), w + ': the jump box\'s 576 pixels are ' + nu + '\'s glyph (icon_weapons.' + nu + ') decoded here');
    if (w === 412) {
      const rep = await page.evaluate(() => { const s = window.SB.sim.attach(structuredClone(window.__s0), window.SB.game.level); const words = window.SB.sim.rle.decode(window.SB.input.recording()); for (const wd of words) window.SB.sim.step(s, wd); return { same: window.SB.sim.hash(s) === window.SB_DEV.hash(), take: words.some(wd => ((wd >> 6) & 15) === window.SB.sim.CHOICE.TAKE) }; });
      R.say(rep.same && rep.take, '412: the recording carries the TAKE and, replayed on the kept first state, reaches the live hash (' + JSON.stringify(rep) + ')');
    }

    /* Keep */
    await setRoom(page); await stepN(page, 4);
    const k0 = await walkToSwap(page); await page.keyboard.up('ArrowLeft');
    await tap(page, '#swapkeep');
    const k1 = await stepN(page, 1), k2 = await stepN(page, 1);
    R.say(!!k0 && k0.compare === 1 && JSON.stringify(k1.slots) === '[1,9,0]' && !k1.compare && (k1.ev & SBN.sim.EV.PICK) && !(k1.ev & SBN.sim.EV.EQUIP) && !k1.heard.includes('pick') && !k1.heard.includes('equip') && !k2.on,
      w + ': a real tap on Keep keeps Boomerang (slots ' + k1.slots.join(',') + '), PICK alone and no pick voice (' + k1.heard.join(', ') + '), the card gone');
    R.say(errors.length === 0, w + ': no page errors' + (errors.length ? ' (' + errors.slice(0, 2).join(' | ') + ')' : ''));
    await page.close();
    void sleep;
  }
} catch (e) {
  R.say(false, 'the gate threw: ' + (e && e.stack || e));
} finally { await browser.close(); await srv.close(); }
R.finish();
