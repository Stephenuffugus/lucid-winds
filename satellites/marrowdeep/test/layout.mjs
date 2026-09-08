#!/usr/bin/env node
/* MARROWDEEP fits a thumb, on three phones, on every screen a player reaches.
 *
 *   node test/layout.mjs
 *
 * It walks the whole game with REAL pointer presses at 375x667, 320x568 and
 * 412x915 (cold start, three creations, the how card, deploy, five stages, the
 * boss, the aftermath, the Hall, the Roster, the Wall) and measures every screen
 * it lands on. Nothing here calls a handler and nothing here sets a state: the
 * only way a screen gets measured is that a thumb arrived on it.
 *
 * SIX LAWS, per screen, per width:
 *
 *  1. TOUCH. Every button and every tappable card is at least 48 px RENDERED in
 *     both axes, and `document.elementFromPoint` at its centre lands on it or on
 *     a child of it. A control that is 48 px and under something else is not a
 *     control. ⛔ `el.click()` would reach straight through the thing on top and
 *     prove nothing, which is why it appears nowhere in this file.
 *  2. THE CHIP'S SEAT. The bottom left 120 by 120 CSS px of every screen holds
 *     nothing of ours. The fleet's music chip and its folded pill seat there and
 *     the chip CHASES free space, so anything we leave in that box gets a chip
 *     sat on top of it. Measured two ways, because either alone misses half of
 *     it: rectangles (a `pointer-events:none` caption is invisible to a hit test
 *     and perfectly visible to a player) and a hit test grid (an element whose
 *     own rect is elsewhere can still put a button under that corner).
 *  3. WIDTH. Nothing overflows the DEVICE WIDTH THE GATE SET.
 *     ⛔ The comparison is against 320, 375 or 412, never against
 *     `window.innerWidth` and never against `scrollWidth`. `innerWidth` follows
 *     the LAYOUT viewport, so mobile Chrome widens it to hold wide content and
 *     `right > innerWidth` reads clean on a page with 31 px hanging off the
 *     side; that is how a sibling game shipped exactly that. Text is measured
 *     too, through a Range over each element's own text nodes, because a long
 *     unbroken word overflows its card without any element's rect moving.
 *     The one allowance is a container that is DELIBERATELY side scrollable: its
 *     computed `overflow-x` is auto or scroll, it really does scroll
 *     (`scrollWidth > clientWidth`), and it is neither the `.screen` nor the
 *     `.body`, because those two ARE the page and the page may not scroll
 *     sideways. `.screen` and `.body` both compute `overflow-x: auto` from their
 *     `overflow-y: auto` alone, so without that last clause every element in the
 *     game sits inside an "intentional scroller" and the law is vacuous.
 *  4. THE PINNED FOOTER. With the body scrolled to its very end, the `.pin`
 *     footer's rect is still fully on screen (the eighth button under the fold,
 *     Whistlestop, Sep 07), and every ROW of controls in it fits the width that
 *     is left once the chip's 130 px band is taken out: the sum of the row's
 *     children plus its gaps is at most the device width minus 130. That second
 *     one catches the whole class in one number: four 48 px buttons need 192 px
 *     and the band leaves 190 at 320 wide.
 *  5. THE RENDERED TEXT FLOOR. Every element carrying a non empty text node of
 *     its own computes to 11.2 px or larger, which is the 0.7 rem law at a 16 px
 *     root. Lint greps the sizes that are WRITTEN DOWN; this is the other half,
 *     and it is the half that sees px, em, inherited and transformed sizes.
 *  6. A THREE CARD DEAL IS THREE STACKED FULL WIDTH CARDS, never a row of three:
 *     the Callings at creation and the Traits after a quest. Stacked (each card
 *     starts below the one before it) and at least 260 px wide. Three in a row at
 *     320 are 93 px, about thirteen characters a line at the text floor, so the
 *     screen the spec calls the thrill of the game wraps a Trait to five lines.
 *
 * Every failure names the screen, the selector and the number.
 *
 * HOW IT KNOWS IT IS GETTING ANYWHERE. Progress is the QUEST moving
 * (`stageIndex`, `round`, `cursor`, `step`) plus the board's own assignment
 * marks, never "a screen was seen twice": a boss fight is a legitimate loop of
 * board, results and strike sheet once per round, and a gate that calls that a
 * stall dies on a working game.
 *
 * ⛔ Every selector is re queried at the moment it is used. Each of these screens
 * repaints its cards wholesale, so a handle taken before a repaint is DETACHED
 * after it: it still measures, it still reports a rect, and it presses nothing.
 *
 * WATCHED RED (satellites/marrowdeep is untouched; the mutations were made to a
 * copy of the whole game folder under the scratch directory and run from there,
 * because the lead is editing index.html continuously):
 *   see docs/BUILD-NOTES.md and the run log in this session's report.
 */
import { serve, open, reporter, tap, waitScreen } from './harness.mjs';

/* the three phones. 320x568 is the small one every count has to survive, 412x915
   is where a top row control sits 880 px from the thumb's pivot. */
const PHONES = [
  { w: 375, h: 667 },
  { w: 320, h: 568 },
  { w: 412, h: 915 }
];

/* 0.7 rem at a 16 px root. The epsilon is for the float: Chrome reports .7rem as
   "11.2px" but a computed 11.199999 would be a false red, and 0.005 px is a
   twentieth of nothing on a screen. */
const TEXT_FLOOR = 11.2;
const TEXT_EPS = 0.005;
/* the fleet's music chip seat */
const CHIP = 120;
/* the band the chip and its folded pill need across the bottom of a footer */
const BAND = 130;
/* a dealt card's floor, from the plan: three in a row at 320 are 93 px */
const DEAL_MIN = 260;

/* ⛔ THE SEED IS SET, AND IT IS AN INPUT AND NOT A STATE. A cold BEGIN takes its
   seed from performance.now(), so an unseeded layout run plays a different game
   at every width and on every run: some of them wipe at stage three and never
   paint a boss board, and a gate that measures the boss only when the dice feel
   like it is a gate that will go green the day the boss board breaks. `seed` is
   the one thing MD_DEV lets a gate set, because it sets the STREAM the game is
   derived from and then the game is played by real presses like any other.
   This one reaches the boss, and the walk asserts by name that it got there, so
   a content change that stops reaching it turns this red instead of quietly
   measuring nine screens instead of ten. */
const SEED = 20260908;

/* the tappable things in this game. `button` covers .btn, .chip, .toggle,
   .pgbtn and .lantern, which are all real buttons; the rest are cards that take
   a press. ⛔ A non pickable .rostrow (a character who cannot be deployed, at
   0.4 opacity) is NOT on this list: it is a row of text, not a control. */
const TAPPABLE = 'button, .card.pick, .chal, .pc, .asp, .tgt, .rostrow.pickable';

/* ------------------------------------------------------------------ */
/* THE AUDIT. One page.evaluate, everything measured against the width the gate
   set, returned as lists of offenders rather than a pass or fail: the caller
   turns them into lines that name the screen, the selector and the number. */
/* ------------------------------------------------------------------ */
const audit = (page, W, H, TAPSEL, K) => page.evaluate((W, H, TAPSEL, K) => {
  const out = {
    screen: window.MD_DEV.screen(), tapCount: 0,
    small: [], blocked: [], chip: [], over: [], text: [], deal: [], pin: []
  };
  const scr = document.querySelector('.screen.on');
  if (!scr) { out.noScreen = true; return out; }

  const nm = el => {
    if (el.id) return '#' + el.id;
    const c = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
    return c.trim() ? '.' + c.trim().split(/\s+/).join('.') : el.tagName.toLowerCase();
  };
  const shown = el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1;
  };
  const all = Array.prototype.slice.call(scr.querySelectorAll('*'));

  /* ---- 1. touch: 48 px rendered, and a thumb at the centre lands on it ---- */
  const taps = Array.prototype.slice.call(scr.querySelectorAll(TAPSEL)).filter(shown);
  out.tapCount = taps.length;
  taps.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width < K.TAP || r.height < K.TAP) {
      out.small.push(nm(el) + ' is ' + r.width.toFixed(1) + 'x' + r.height.toFixed(1) + ' px rendered');
      return;                       /* a control that small is one fault, not two */
    }
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    if (!(top && (top === el || el.contains(top)))) {
      out.blocked.push(nm(el) + ' at ' + cx.toFixed(0) + ',' + cy.toFixed(0) +
        ' is under ' + (top ? nm(top) : 'nothing'));
    }
  });

  /* ---- 2. the chip's seat: the bottom left 120 by 120 ---- */
  const VH = window.visualViewport ? window.visualViewport.height : H;
  const BOX = { l: 0, t: VH - K.CHIP, r: K.CHIP, b: VH };
  const skipId = { app: 1, glyphs: 1 };
  all.forEach(el => {
    if (el.id && skipId[el.id]) return;
    if (el.classList.contains('screen') || el.classList.contains('body') ||
        el.classList.contains('pin') || el.classList.contains('spacer')) return;
    if (!shown(el)) return;
    const r = el.getBoundingClientRect();
    if (r.right <= BOX.l || r.left >= BOX.r || r.bottom <= BOX.t || r.top >= BOX.b) return;
    /* only things that PAINT or take a press count. A bare wrapper with no ink
       of its own is not what the chip collides with. */
    const cs = getComputedStyle(el);
    const ownText = Array.prototype.filter.call(el.childNodes,
      n => n.nodeType === 3 && n.textContent.trim()).length > 0;
    const paints = el.tagName === 'BUTTON' || el.tagName === 'svg' || el.tagName === 'IMG' ||
      (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
      cs.borderTopWidth !== '0px' || cs.borderLeftWidth !== '0px' || ownText;
    if (!paints) return;
    out.chip.push(nm(el) + ' at ' + r.left.toFixed(0) + ',' + r.top.toFixed(0) +
      ' ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0));
  });
  const underChip = new Set();
  for (let x = 6; x <= K.CHIP - 6; x += 18) {
    for (let y = VH - (K.CHIP - 6); y <= VH - 6; y += 18) {
      const el = document.elementFromPoint(x, y);
      if (!el || el === document.body || el === document.documentElement) continue;
      const ctl = el.closest && el.closest(TAPSEL);
      if (ctl) underChip.add(nm(ctl));
    }
  }
  underChip.forEach(n => out.chip.push('a thumb in the chip corner presses ' + n));

  /* ---- 3. width: nothing past the DEVICE width the gate set ---- */
  /* a container that really is meant to scroll sideways, and is not the page */
  const sideScroller = el => {
    if (el.classList.contains('screen') || el.classList.contains('body')) return false;
    const ox = getComputedStyle(el).overflowX;
    return (ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 1;
  };
  const clipped = el => {
    let p = el.parentElement;
    while (p) { if (sideScroller(p)) return true; p = p.parentElement; }
    return false;
  };
  const range = document.createRange();
  all.forEach(el => {
    if (!shown(el)) return;
    if (clipped(el)) return;
    const r = el.getBoundingClientRect();
    if (r.right > W + 0.5) out.over.push(nm(el) + ' reaches x ' + r.right.toFixed(1) + ' of ' + W);
    else if (r.left < -0.5) out.over.push(nm(el) + ' starts at x ' + r.left.toFixed(1));
    /* and the text itself, which has no element of its own to measure */
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      range.selectNodeContents(n);
      const tr = range.getBoundingClientRect();
      if (tr.width > 0 && tr.right > W + 0.5) {
        out.over.push('text in ' + nm(el) + ' reaches x ' + tr.right.toFixed(1) + ' of ' + W);
        break;
      }
    }
  });

  /* ---- 5. the rendered text floor ---- */
  all.forEach(el => {
    const own = Array.prototype.filter.call(el.childNodes,
      n => n.nodeType === 3 && n.textContent.trim());
    if (!own.length) return;
    if (!shown(el)) return;
    const px = parseFloat(getComputedStyle(el).fontSize);
    if (!(px >= K.FLOOR - K.EPS)) {
      out.text.push(nm(el) + ' is ' + px.toFixed(2) + ' px ("' +
        own[0].textContent.trim().slice(0, 24) + '")');
    }
  });

  /* ---- 6. a three card deal is stacked and full width ---- */
  [['#creCallings', 'the Callings'], ['#trCards', 'the Traits']].forEach(pair => {
    const host = scr.querySelector(pair[0]);
    if (!host) return;
    const cards = Array.prototype.slice.call(host.querySelectorAll('.card')).filter(shown);
    if (cards.length < 2) return;
    const rects = cards.map(c => c.getBoundingClientRect());
    for (let i = 1; i < rects.length; i++) {
      if (rects[i].top < rects[i - 1].bottom - 1) {
        out.deal.push(pair[1] + ' (' + pair[0] + ') are a ROW, not a stack: card ' + (i + 1) +
          ' starts at y ' + rects[i].top.toFixed(0) + ' while card ' + i +
          ' ends at y ' + rects[i - 1].bottom.toFixed(0));
        break;
      }
    }
    rects.forEach((r, i) => {
      if (r.width < K.DEAL) {
        out.deal.push(pair[1] + ' (' + pair[0] + ') card ' + (i + 1) + ' is ' +
          r.width.toFixed(0) + ' px wide, under ' + K.DEAL);
      }
    });
  });

  /* ---- 4b. every ROW of footer controls fits the width left beside the band ---- */
  const pin = scr.querySelector('.pin');
  if (pin && shown(pin)) {
    const groups = [];
    const pcs = getComputedStyle(pin);
    if (pcs.display.indexOf('flex') >= 0 && pcs.flexDirection.indexOf('row') === 0) groups.push(pin);
    Array.prototype.slice.call(pin.querySelectorAll('.row')).forEach(r => { if (shown(r)) groups.push(r); });
    groups.forEach(g => {
      const kids = Array.prototype.slice.call(g.children).filter(shown);
      if (kids.length < 1) return;
      const gap = parseFloat(getComputedStyle(g).columnGap) || 0;
      let sum = gap * (kids.length - 1);
      kids.forEach(k => { sum += k.getBoundingClientRect().width; });
      if (sum > W - K.BAND + 0.5) {
        out.pin.push(nm(g) + ' holds ' + kids.length + ' control' + (kids.length > 1 ? 's' : '') +
          ' summing ' + sum.toFixed(0) + ' px, over the ' + (W - K.BAND) +
          ' px left beside the chip band');
      }
    });
  }
  return out;
}, W, H, TAPSEL, K);

/* ---- 4a. the footer is still on screen with the body scrolled to its end ---- */
const auditPin = (page, H) => page.evaluate((H) => {
  const scr = document.querySelector('.screen.on');
  if (!scr) return null;
  const pin = scr.querySelector('.pin');
  if (!pin) return { none: true };
  const body = scr.querySelector('.body');
  const was = [scr.scrollTop, body ? body.scrollTop : 0];
  scr.scrollTop = scr.scrollHeight;
  if (body) body.scrollTop = body.scrollHeight;
  const r = pin.getBoundingClientRect();
  const VH = window.visualViewport ? window.visualViewport.height : H;
  const res = { top: r.top, bottom: r.bottom, h: r.height, vh: VH,
    ok: r.height > 0 && r.top >= -0.5 && r.bottom <= VH + 0.5 };
  scr.scrollTop = was[0];
  if (body) body.scrollTop = was[1];
  return res;
}, H);

/* ------------------------------------------------------------------ */
/* THE WALK. A driver that looks at the screen it is on and taps what a thumb
   would tap, then WAITS for its own tap to land before looking again.

   ⛔ The wait is not politeness, it is the difference between a gate and a
   stall. ROLL hides itself and deals its cards 420 ms later behind the dice
   tumble, and this loop goes round in about 20 ms, so the first version pressed
   a hidden ROLL eighteen times inside that one tumble and called the game
   stuck. Nothing here sleeps a fixed time either: it waits for THE STATE KEY to
   change, which is the quest moving (stageIndex, round, cursor, step) or the
   board's own marks moving, and gives up after nine seconds so a real stall is
   still a red line and not a hang. */
/* ------------------------------------------------------------------ */
/* the one state key, written once and used by both the look and the wait, so
   they can never drift apart */
const KEY = `(function(){var D=window.MD_DEV,q=D.quest(),S=D.state();
 var c=function(s){return document.querySelectorAll(s).length};
 var g=function(i){return document.getElementById(i)};
 var vis=function(i){var e=g(i);if(!e)return 0;var r=e.getBoundingClientRect();
   return (r.width>1&&r.height>1)?1:0};
 var off=function(i){var e=g(i);return (!e||e.disabled)?0:1};
 return D.screen()+'|'+(q?q.stageIndex+','+(q.round||0)+','+(q.cursor||0)+','+q.step:'-')
  +'|'+((S&&S.roster||[]).length)
  +'|'+(c('.seat.full')+c('.pc.on')+c('.pc.sel')+c('.rostrow.on')+c('.card.on')+c('.asp.on'))
  +'|'+c('#creCallings .card')+c('#trCards .card')
  +'|'+vis('btnRoll')+vis('btnKeep')+off('btnResolve')+off('btnBossResolve')+off('btnGo')
  +off('btnTraitKeep');})()`;
const keyOf = page => page.evaluate(KEY);
const settle = (page, was) =>
  page.waitForFunction(KEY + ' !== ' + JSON.stringify(was), { timeout: 9000, polling: 40 })
    .then(() => true, () => false);

/* THE WALK. A driver that looks at the screen it is on and taps what a thumb
   would tap. It never calls a handler and never sets a state. */
/* ------------------------------------------------------------------ */
const look = page => page.evaluate(() => {
  const D = window.MD_DEV;
  const q = D.quest();
  const scr = document.querySelector('.screen.on');
  const vis = sel => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const dis = sel => { const el = document.querySelector(sel); return !el || el.disabled; };
  const count = sel => document.querySelectorAll(sel).length;
  /* the assignment board, read off the DOM the way a player reads it */
  const chal = Array.prototype.map.call(document.querySelectorAll('#qChallenges .chal'), (c, i) => ({
    i: i + 1, done: c.classList.contains('done'),
    want: c.querySelectorAll('.seat').length,
    got: c.querySelectorAll('.seat.full').length
  }));
  const pcs = Array.prototype.map.call(document.querySelectorAll('#qParty .pc'), (p, i) => ({
    i: i + 1, dead: p.classList.contains('dead'), on: p.classList.contains('on'),
    sel: p.classList.contains('sel')
  }));
  const bpc = Array.prototype.map.call(document.querySelectorAll('#bossParty .pc'), (p, i) => ({
    i: i + 1, dead: p.classList.contains('dead'), sel: p.classList.contains('sel'),
    role: (p.querySelector('.role') || {}).textContent || ''
  }));
  const asp = Array.prototype.map.call(document.querySelectorAll('#bossAspects .asp'), (a, i) => ({
    i: i + 1, off: a.classList.contains('broken') || a.classList.contains('dormant')
  }));
  return {
    screen: D.screen(),
    quest: q ? { stage: q.stageIndex, round: q.round || 0, cursor: q.cursor || 0, step: q.step } : null,
    roster: (D.state() && D.state().roster || []).length,
    callings: count('#creCallings .card'),
    callingPicked: count('#creCallings .card.on') > 0,
    keep: vis('#btnKeep'), roll: vis('#btnRoll'),
    traits: count('#trCards .card'), traitPicked: count('#trCards .card.on') > 0,
    traitKeep: !dis('#btnTraitKeep'),
    deployRows: count('#deployList .rostrow.pickable'),
    rosterRows: count('#rosterList .rostrow.pickable'),
    deployTicked: count('#deployList .rostrow.on'),
    goOff: dis('#btnGo'), resolveOff: dis('#btnResolve'), bossResolveOff: dis('#btnBossResolve'),
    chal, pcs, bpc, asp,
    /* the mark of assignment progress, so a stall is a real stall */
    marks: count('.seat.full') + count('.pc.on') + count('.pc.sel') +
           count('.rostrow.on') + count('.card.on') + count('.asp.on')
  };
});

const nth = (host, cls, i) => host + ' ' + cls + ':nth-child(' + i + ')';

async function drive(page, L, seen) {
  const s = L.screen;
  if (s === 'title') return tap(page, '#btnBegin');
  if (s === 'how') return tap(page, '#btnGotIt');
  if (s === 'creation') {
    if (L.callings > 0 && !L.callingPicked) return tap(page, nth('#creCallings', '.card', 1));
    if (L.keep) return tap(page, '#btnKeep');
    /* ROLL hides itself for the length of the tumble; pressing where it was is
       pressing the screen, so the walk waits for the deal instead */
    if (L.roll) return tap(page, '#btnRoll');
    return null;
  }
  if (s === 'hall') {
    if (!seen.roster) { seen.roster = 1; return tap(page, '#btnRoster'); }
    if (!seen.wall) { seen.wall = 1; return tap(page, '#btnWall'); }
    if (!seen.renown && await has(page, '#btnSpendRenown')) { seen.renown = 1; return tap(page, '#btnSpendRenown'); }
    if (!seen.marrow && await has(page, '#btnSpendMarrow')) { seen.marrow = 1; return tap(page, '#btnSpendMarrow'); }
    return tap(page, '#btnDeploy');
  }
  if (s === 'roster') {
    /* one character sheet, opened the way a player opens it. ⛔ Nothing on that
       screen is pressed but BACK: RETIRE and DISMISS destroy a character and a
       gate does not get to play the account. */
    if (!seen.character && L.rosterRows > 0) { seen.character = 1; return tap(page, nth('#rosterList', '.rostrow.pickable', 1)); }
    return tap(page, '#btnRosterBack');
  }
  if (s === 'character') return tap(page, '#btnCharBack');
  if (s === 'spend') return tap(page, '#btnSpendBack');
  if (s === 'death') return tap(page, '#btnDeathOn');
  if (s === 'wall') return tap(page, '#btnWallBack');
  if (s === 'deploy') {
    if (!L.goOff && (L.deployTicked >= 3 || L.deployTicked >= L.deployRows)) return tap(page, '#btnGo');
    if (L.deployRows === 0) return null;
    const next = L.deployTicked + 1;
    if (next <= L.deployRows) return tap(page, nth('#deployList', '.rostrow.pickable', next));
    return tap(page, '#btnGo');
  }
  if (s === 'quest') {
    if (!L.resolveOff) return tap(page, '#btnResolve');
    const need = L.chal.find(c => !c.done && c.got < c.want);
    if (need) {
      const sel = L.pcs.find(p => p.sel);
      if (!sel) {
        const free = L.pcs.find(p => !p.dead && !p.on) || L.pcs.find(p => !p.dead);
        if (free) return tap(page, nth('#qParty', '.pc', free.i));
      }
      return tap(page, nth('#qChallenges', '.chal', need.i));
    }
    return tap(page, '#btnResolve');
  }
  if (s === 'preroll') return tap(page, '#btnRollCheck');
  if (s === 'result') return tap(page, '#btnContinue');
  if (s === 'sheet') return tap(page, '#btnSheetNext');
  if (s === 'drop') return tap(page, '#btnSalvage');
  if (s === 'boss') {
    if (!L.bossResolveOff) return tap(page, '#btnBossResolve');
    const sel = L.bpc.find(p => p.sel);
    if (!sel) {
      const need = L.bpc.find(p => !p.dead && /PICK/.test(p.role));
      if (need) return tap(page, nth('#bossParty', '.pc', need.i));
      return tap(page, '#btnBossResolve');
    }
    const a = L.asp.find(x => !x.off);
    if (a) return tap(page, nth('#bossAspects', '.asp', a.i));
    return tap(page, '#btnBossResolve');
  }
  if (s === 'trait') {
    if (L.traits > 0 && !L.traitPicked) return tap(page, nth('#trCards', '.card', 1));
    if (L.traitKeep) return tap(page, '#btnTraitKeep');
    return null;
  }
  /* A screen this gate has never met is REPORTED, never guessed past in silence:
     the caller turns `unknown` into a red line naming it, and the walk presses
     the footer's own last live button so the rest of the game still gets
     measured rather than the run ending on the first new screen. */
  seen.unknown = seen.unknown || [];
  if (seen.unknown.indexOf(s) < 0) seen.unknown.push(s);
  const exit = await page.evaluate(() => {
    const scr = document.querySelector('.screen.on');
    if (!scr) return null;
    const b = Array.prototype.slice.call(scr.querySelectorAll('.pin button'))
      .filter(x => !x.disabled && x.getBoundingClientRect().height > 1).pop();
    return b && b.id ? '#' + b.id : null;
  });
  if (exit) return tap(page, exit);
  throw new Error('the walk does not know what a thumb does on the ' + s +
    ' screen and it has no live footer button to leave by');
}

/* is this control on the page at all (the Hall grows buttons as phases land) */
const has = (page, sel) => page.evaluate(sel => {
  const el = document.querySelector(sel);
  return !!el && el.getBoundingClientRect().height > 1;
}, sel);

/* ------------------------------------------------------------------ */
/* one offender, said once. The walk measures a screen every time its shape
   changes, so the Hall's footer would otherwise report the same button on every
   pass through it and bury the twenty other faults under three hundred lines. */
const roll = (list, cap) => {
  const seen = [];
  for (const x of list) if (seen.indexOf(x) < 0) seen.push(x);
  const head = seen.slice(0, cap === undefined ? 10 : cap);
  return { n: seen.length, line: head.join(' | ') + (seen.length > head.length ? ' | and ' + (seen.length - head.length) + ' more' : '') };
};

const { base, close } = await serve();
const { fails, say } = reporter();
const K = { TAP: 48, CHIP, BAND, FLOOR: TEXT_FLOOR, EPS: TEXT_EPS, DEAL: DEAL_MIN };
const MAX_TAPS = 700;
const MAX_MEASURES = 60;
const STALL = 4;   /* four presses that move nothing, at nine seconds a press */

for (const ph of PHONES) {
  const tag = ph.w + 'x' + ph.h;
  let opened;
  try {
    opened = await open(base, { width: ph.w, height: ph.h });
  } catch (e) {
    say(false, tag + ': the page never became ready: ' + e.message);
    continue;
  }
  const { browser, page, errors } = opened;
  await page.evaluate(n => window.MD_DEV.seed(n), SEED);
  const seen = {};                 /* roster / wall visited */
  const done = new Set();          /* screen signatures already measured */
  const screensSeen = new Set();
  const bad = { small: [], blocked: [], chip: [], over: [], text: [], deal: [], pin: [], pinOff: [] };
  let measured = 0, stall = 0, lastKey = '', taps = 0, walkErr = '', ended = false;

  try {
    let L = await look(page);
    for (; taps < MAX_TAPS; taps++) {
      /* MEASURE what the thumb is standing on, once per distinct shape of it: a
         screen name alone would skip the Relay stage and the four Aspect boss,
         and every repaint would blow the budget. */
      const sig = L.screen + '|' + await page.evaluate(() => {
        const s = document.querySelector('.screen.on');
        return s ? s.querySelectorAll('*').length : 0;
      });
      screensSeen.add(L.screen);
      if (!done.has(sig) && measured < MAX_MEASURES) {
        done.add(sig); measured++;
        const a = await audit(page, ph.w, ph.h, TAPPABLE, K);
        if (a.noScreen) bad.small.push(L.screen + ': no screen is on at all');
        else {
          if (a.tapCount === 0) bad.small.push(L.screen + ': not one control was found to measure');
          for (const x of a.small) bad.small.push(L.screen + ': ' + x);
          for (const x of a.blocked) bad.blocked.push(L.screen + ': ' + x);
          for (const x of a.chip) bad.chip.push(L.screen + ': ' + x);
          for (const x of a.over) bad.over.push(L.screen + ': ' + x);
          for (const x of a.text) bad.text.push(L.screen + ': ' + x);
          for (const x of a.deal) bad.deal.push(L.screen + ': ' + x);
          for (const x of a.pin) bad.pin.push(L.screen + ': ' + x);
        }
        const p = await auditPin(page, ph.h);
        if (p && !p.none && !p.ok) {
          bad.pinOff.push(L.screen + ': .pin sits ' + p.top.toFixed(0) + ' to ' + p.bottom.toFixed(0) +
            ' with the body scrolled to its end, and the screen is ' + p.vh.toFixed(0) + ' tall');
        }
      }

      /* STOP when the whole loop has been walked: a quest ended, the Roster and
         the Wall were opened, and the thumb is back in the Hall. */
      if (L.screen === 'hall' && ended && seen.roster && seen.wall) break;

      const before = await keyOf(page);
      const pressed = await drive(page, L, seen);
      const moved = await settle(page, before);
      const next = await look(page);
      if (L.quest && !next.quest) ended = true;
      stall = moved ? 0 : stall + 1;
      lastKey = before;
      if (stall >= STALL) {
        walkErr = 'the walk stalled on the ' + next.screen + ' screen after ' + taps +
          ' taps: nothing moved in ' + (STALL * 9) + ' seconds of pressing ' +
          (pressed ? pressed : 'nothing') + ' at state ' + before;
        break;
      }
      L = next;
    }
    if (!walkErr && taps >= MAX_TAPS) walkErr = 'the walk ran out of taps at ' + MAX_TAPS;
  } catch (e) {
    walkErr = e.message;
  }

  /* the walk itself is an assertion: a screen this gate never reached is a screen
     it never measured, and a silent short walk is the oldest way to a green gate */
  const want = ['title', 'creation', 'hall', 'deploy', 'quest', 'result', 'sheet', 'boss', 'roster', 'wall'];
  const missed = want.filter(s => !screensSeen.has(s));
  const unknown = seen.unknown || [];
  say(!walkErr && missed.length === 0 && unknown.length === 0,
    tag + ': the walk reaches the game on seed ' + SEED + ' (' + taps + ' taps, ' + screensSeen.size + ' screens, ' +
    measured + ' measured' + (ended ? ', a quest ended' : ', NO quest ended') + ')' +
    (missed.length ? ' ; never reached: ' + missed.join(', ') : '') +
    (unknown.length ? ' ; a screen this gate does not know: ' + unknown.join(', ') : '') +
    (walkErr ? ' ; ' + walkErr : ''));

  { const r = roll(bad.small); say(r.n === 0, tag + ': every control is 48 px rendered' +
    (r.n ? ' ; ' + r.n + ': ' + r.line : '')); }
  { const r = roll(bad.blocked); say(r.n === 0, tag + ': a thumb at each control\'s centre lands on it' +
    (r.n ? ' ; ' + r.n + ': ' + r.line : '')); }
  { const r = roll(bad.chip); say(r.n === 0, tag + ': the bottom left ' + CHIP + ' by ' + CHIP + ' is the chip\'s' +
    (r.n ? ' ; ' + r.n + ': ' + r.line : '')); }
  { const r = roll(bad.over); say(r.n === 0, tag + ': nothing reaches past ' + ph.w + ' px' +
    (r.n ? ' ; ' + r.n + ': ' + r.line : '')); }
  { const r = roll(bad.pinOff); say(r.n === 0, tag + ': the pinned footer is on screen with the body at its end' +
    (r.n ? ' ; ' + r.line : '')); }
  { const r = roll(bad.pin); say(r.n === 0, tag + ': every footer row fits beside the ' + BAND + ' px chip band' +
    (r.n ? ' ; ' + r.n + ': ' + r.line : '')); }
  { const r = roll(bad.text); say(r.n === 0, tag + ': every rendered text node is ' + TEXT_FLOOR + ' px or larger' +
    (r.n ? ' ; ' + r.n + ': ' + r.line : '')); }
  { const r = roll(bad.deal); say(r.n === 0, tag + ': a three card deal is three stacked cards ' + DEAL_MIN + ' px wide' +
    (r.n ? ' ; ' + r.line : '')); }
  say(errors.length === 0, tag + ': nothing on the console through the whole walk' +
    (errors.length ? ' ; ' + errors.slice(0, 6).join(' | ') : ''));

  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
