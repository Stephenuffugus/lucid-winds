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
 *     side; that is how a sibling game shipped exactly that.
 *     ⛔ AND HERE IS THE HALF OF THAT SCAR THIS PAGE ACTUALLY HAS, measured, not
 *     assumed. With a card forced to 400 px on a 375 px phone the card's right
 *     edge read 416, and `innerWidth` read 375 and `documentElement.scrollWidth`
 *     read 375 with it, because `#app` is `position:fixed; overflow:hidden` and
 *     swallows the overhang whole. So on THIS page the innerWidth comparison
 *     would have gone red by luck and the scrollWidth comparison would have read
 *     perfectly CLEAN with 41 px of a card hanging off the side of the glass.
 *     The device width is the only one of the three that cannot be talked out of
 *     it, and it is the only one that is not hostage to a CSS rule on #app.
 *     Text is measured too, through a Range over each element's own text nodes,
 *     because a long unbroken word overflows its card without any element's rect
 *     moving.
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
 * WATCHED RED, every line of it, on 2026-09-08. ⛔ Not one of these edits was
 * made to satellites/marrowdeep: the whole game folder was copied under the
 * scratch directory beside a copy of the fleet's music files, mutated there and
 * run there, because the lead is editing index.html continuously and a gate
 * that plants a fault in a live file to prove itself is worse than no gate.
 * The copy was green on all ten lines before each edit and green again after it.
 *
 *   the walk        an invisible sheet over the party row (`.party::after`
 *                   inset 0, z index 9): 32 taps, "never reached: result,
 *                   sheet, boss", stalled on the quest screen. And the footer
 *                   taken out of flow (`.pin{position:fixed;top:1200px}`): 0
 *                   taps, "nothing under the thumb at the centre of #btnBegin".
 *   48 px           `.btn.small{min-height:36px}`: ten controls at 38 px tall,
 *                   named, from #btnHow to the Hall's four.
 *   the hit test    the same sheet over the party row: three `.pc` cards
 *                   "under #qParty", which is what a thumb hits, and what
 *                   `el.click()` on the card would have sailed straight past.
 *   the chip's seat `.pin{padding-left:0}`: 38 offenders, and the grid found
 *                   #btnHow and #btnSound answering a thumb in the corner.
 *   the width       `.card{min-width:400px}`: 15, "reaches x 416.0 of 375",
 *                   including "text in .cblurb", which no element rect shows.
 *   the footer      `.pin{position:fixed;top:1200px}`: ".pin sits 1200 to 1382
 *                   with the body scrolled to its end, and the screen is 667".
 *                   ⛔ The first attempt, `position:relative;top:200px`, did NOT
 *                   bite and the line stayed green, correctly: a relatively
 *                   offset footer still grows the screen's scrollable overflow,
 *                   so the body scrolled to its end brings it back. The law is
 *                   reachability, and that mutation left it reachable.
 *   the band        `.pin{padding-left:0}`: ten rows, "summing 343 px, over the
 *                   245 px left beside the chip band".
 *   the text floor  `.small{font-size:.62rem}`: thirteen at 9.92 px, each
 *                   quoting the words a player would have squinted at.
 *   the deal        `#creCallings{display:flex}`: "are a ROW, not a stack: card
 *                   2 starts at y 270 while card 1 ends at y 518", and 110 px
 *                   wide. And `.card.pick{max-width:200px}` alone: 200 px wide,
 *                   under 260, with the stack intact.
 *   the console     a `setTimeout` throw 120 ms in: the pageerror, named.
 *   vacuity         TAPPABLE set to a selector that matches nothing: sixteen
 *                   screens each saying "not one control was found to measure".
 *                   A touch law that measures nothing passes every time.
 */
import { serve, open, reporter, tap } from './harness.mjs';

/* the three phones. 320x568 is the small one every count has to survive, 412x915
   is where a top row control sits 880 px from the thumb's pivot. */
const ONLY = process.env.MD_LAYOUT_ONLY || '';
const PHONES = [
  { w: 375, h: 667 },
  { w: 320, h: 568 },
  { w: 412, h: 915 }
].filter((p) => !ONLY || ONLY === (p.w + 'x' + p.h));

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
   THIS SEED IS CHOSEN, NOT PICKED OUT OF THE AIR. Eight seeds were walked end
   to end and their coverage compared: five of them finish Depth I with all three
   characters alive, and on those the death card is never painted, the
   replacement offer never appears, and the Wall is measured EMPTY at every one
   of the three widths, which is a label and one sentence and is not the screen
   that overflows. Seed 1 reaches seventeen screens, kills somebody, and leaves
   two names on the Wall. (20260908: 16 screens, no death, an empty Wall. 7:
   16 and three names. 424242: 16 and three names. 99, 12345: no death.)
   The walk asserts by name that it reached the boss and that the Wall it
   measured carried a line, so a content change that stops either turns this red
   instead of quietly measuring the emptiest version of every screen in the game.
   MD_LAYOUT_SEED walks a different one without editing the gate. */
const SEED = Number(process.env.MD_LAYOUT_SEED || 1);

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
  /* WHAT A PLAYER CAN ACTUALLY SEE OF AN ELEMENT: its rect cut down by every
     ancestor that clips, and by the viewport. ⛔ Without this the gate lies in
     both directions. A card sitting half below the fold inside a scrolling body
     still reports a full 340x103 rect, so the raw rect says it is in the chip's
     corner when the corner is empty, and a hit test at its centre lands on the
     footer that is painted there and calls a scrollable card unreachable. Only
     CLIPPING ancestors count, never a sibling drawn on top, so a real overlay
     over a real control still fails the hit test the way it fails a thumb. */
  const visRect = el => {
    const r = el.getBoundingClientRect();
    let l = r.left, t = r.top, rt = r.right, b = r.bottom;
    let p = el.parentElement;
    while (p) {
      const cs = getComputedStyle(p);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const pr = p.getBoundingClientRect();
        if (cs.overflowX !== 'visible') { l = Math.max(l, pr.left); rt = Math.min(rt, pr.right); }
        if (cs.overflowY !== 'visible') { t = Math.max(t, pr.top); b = Math.min(b, pr.bottom); }
      }
      p = p.parentElement;
    }
    l = Math.max(l, 0); t = Math.max(t, 0);
    rt = Math.min(rt, W); b = Math.min(b, H);
    return { left: l, top: t, right: rt, bottom: b, width: rt - l, height: b - t };
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
    const v = visRect(el);
    /* a control scrolled below the fold is reached by scrolling, not by a fault;
       what is asserted here is that a control a player can SEE takes the press */
    if (cx < v.left || cx > v.right || cy < v.top || cy > v.bottom) return;
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
  const already = [];
  all.forEach(el => {
    if (el.id && skipId[el.id]) return;
    if (el.classList.contains('screen') || el.classList.contains('body') ||
        el.classList.contains('pin') || el.classList.contains('spacer')) return;
    if (!shown(el)) return;
    /* one fault per thing in the corner: a party card in the chip's seat takes
       its four Strain pips and its name in with it, and five lines about one
       card buries the other nineteen screens */
    if (already.some(a => a.contains(el))) return;
    const r = visRect(el);
    if (r.width < 1 || r.height < 1) return;
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
    already.push(el);
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
      /* ⛔ PER LINE, not per row element. A footer row that WRAPS is two rows on
         the glass, and summing across the wrap said 324 px about a title screen
         whose widest line is 158. The law is about what stands side by side. */
      const lines = new Map();
      kids.forEach(k => {
        const r = k.getBoundingClientRect();
        const key = Math.round(r.top);
        if (!lines.has(key)) lines.set(key, []);
        lines.get(key).push(r.width);
      });
      lines.forEach((ws, top) => {
        const sum = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
        if (sum > W - K.BAND + 0.5) {
          out.pin.push(nm(g) + ' puts ' + ws.length + ' control' + (ws.length > 1 ? 's' : '') +
            ' side by side at y ' + top + ' summing ' + sum.toFixed(0) + ' px, over the ' +
            (W - K.BAND) + ' px left beside the chip band');
        }
      });
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

/* ⛔ THE TOP OF THE BODY HAS TO BE REACHABLE, and one CSS declaration takes that
   away silently. A scrolling flex column with `justify-content:flex-end` puts its
   overflow past the START edge, and no browser will scroll back up to it: the
   scrollbar is at 0 and the first card's header is simply gone. It measures clean
   on every other line in this file, because the element still has a rect and the
   rect is still inside the viewport's width, and the only thing wrong with it is
   that it is above the glass.
   This scrolls the body to its start and asks whether the first child begins at or
   below the body's own top. WATCHED RED: the quest board at 320x568 with the old
   `flex-end` reported the challenges row starting 62 px above the body. */
const auditTop = (page) => page.evaluate(() => {
  const scr = document.querySelector('.screen.on');
  if (!scr) return null;
  const body = scr.querySelector('.body');
  if (!body) return { none: true };
  const was = body.scrollTop;
  body.scrollTop = 0;
  const br = body.getBoundingClientRect();
  let worst = null;
  for (const kid of body.children) {
    if (kid.hidden || !kid.getClientRects().length) continue;
    const r = kid.getBoundingClientRect();
    if (r.height <= 0) continue;
    const off = br.top - r.top;                       /* positive means it is above */
    if (off > 0.5 && (!worst || off > worst.off)) {
      worst = { off, what: (kid.id ? '#' + kid.id : '.' + (kid.className || 'div').split(' ')[0]) };
    }
  }
  body.scrollTop = was;
  return { worst, canScroll: body.scrollHeight > body.clientHeight + 1 };
});

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
    wallRows: count('#wallList .wallrow'),
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
    /* ⛔ THE SHELVES ARE WALKED TWICE, and the second time is the one that
       matters. Before the first quest the Wall is empty, the Roster holds three
       untouched bodies and no character has a Scar, a Trait or a relic on, so a
       gate that opens them once measures the emptiest version of every screen it
       has. After the quest has ended it opens them again: a Wall with a line in
       it, a Roster with a dead body in it, a character sheet with worn gear. */
    if (seen.ended && !seen.again) {
      seen.again = 1; seen.roster = 0; seen.wall = 0; seen.character = 0;
    }
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
  const bad = { small: [], blocked: [], chip: [], over: [], text: [], deal: [], pin: [], pinOff: [], topOff: [] };
  let measured = 0, stall = 0, lastKey = '', taps = 0, walkErr = '', ended = false;
  /* ⛔ the widest version of a screen is the one worth measuring: an empty Wall
     is a label and a sentence, and it is not the screen that overflows */
  let wallRows = 0;

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
      if (L.screen === 'wall') wallRows = Math.max(wallRows, L.wallRows);
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
        const t = await auditTop(page);
        if (t && !t.none && t.worst) {
          bad.topOff.push(L.screen + ': ' + t.worst.what + ' starts ' + t.worst.off.toFixed(0) +
            ' px above the top of the body with the body scrolled to its start' +
            (t.canScroll ? ', and scrolling cannot reach it' : ''));
        }
        const p = await auditPin(page, ph.h);
        if (p && !p.none && !p.ok) {
          bad.pinOff.push(L.screen + ': .pin sits ' + p.top.toFixed(0) + ' to ' + p.bottom.toFixed(0) +
            ' with the body scrolled to its end, and the screen is ' + p.vh.toFixed(0) + ' tall');
        }
      }

      /* STOP when the whole loop has been walked: a quest ended, the Roster and
         the Wall were opened, and the thumb is back in the Hall. */
      seen.ended = ended;
      if (L.screen === 'hall' && ended && seen.again && seen.roster && seen.wall) break;

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
  say(!walkErr && missed.length === 0 && unknown.length === 0 && wallRows > 0,
    tag + ': the walk reaches the game on seed ' + SEED + ' (' + taps + ' taps, ' + screensSeen.size + ' screens, ' +
    measured + ' measured' + (ended ? ', a quest ended' : ', NO quest ended') +
    ', the Wall carried ' + wallRows + ' line' + (wallRows === 1 ? '' : 's') + ')' +
    (wallRows > 0 ? '' : ' ; the Wall was only ever measured EMPTY, so this seed no longer' +
      ' kills anybody and the widest version of that screen went unmeasured: pick a seed that does') +
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
  { const r = roll(bad.topOff); say(r.n === 0, tag + ': the top of every body is reachable' +
    (r.n ? ' ; ' + r.n + ': ' + r.line : '')); }
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
