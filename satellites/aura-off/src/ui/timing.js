/**
 * AURA OFF — src/ui/timing.js
 *
 * The input. CONTRACT.md §11 (`#timing` block) and the timing half of §5.
 *
 * This module owns exactly two things and decides nothing else:
 *
 *   1. WHEN  — a needle sweeps `#track`. `#zoneCore` is perfect, `#zoneOuter`
 *              is clean, anywhere else on the track is shaky, and letting the
 *              sweep run out is a whiff.
 *   2. HOW BIG — while the thumb is DOWN the amplitude climbs. `#ampFill`
 *              grows, `#ampIdeal` is the white mark at this move's `idealAmp`,
 *              and going past the mark hurts more than stopping short of it.
 *
 * It emits `{ band, amp }` and nothing else. It never scores, never touches
 * the match, never looks at the opponent. `resolveExchange()` is the only
 * place a turn outcome is decided (CONTRACT §0) and this file is upstream of
 * it by one event.
 *
 * ---------------------------------------------------------------------------
 * WHY THE TWO ARE ONE GESTURE
 * ---------------------------------------------------------------------------
 * The needle never stops. Press at any moment; release when the needle is on
 * the light. Amplitude is how long you held. So the two decisions are:
 *
 *     release time  →  the band
 *     press time    →  the size (because size is release minus press)
 *
 * which means "start pressing about a second before the light, and let go on
 * it". Two real choices, one thumb, one clock. That is the whole game and it
 * has to feel good, so: the press registers on `pointerdown` across the entire
 * panel rather than only the pad, the release is caught on `window` so a thumb
 * that slides off still commits, and the mark announces itself through the
 * vibrator as you cross it — you learn where `idealAmp` is without looking
 * away from the needle.
 *
 * ---------------------------------------------------------------------------
 * ACT 5 — THE DECK IS MOVING
 * ---------------------------------------------------------------------------
 * `needleSpeedMult` comes from `matchSnapshot(match).needleSpeedMult` — 1.45
 * upriver, 1 everywhere else — and the needle also picks up a slow visible
 * sway, because the boat is what is moving, not the player's hand. The sway is
 * deliberately small (a fraction of the core zone) because the ENGINE already
 * perturbs the achieved amplitude by ±0.26 and that is where Act 5's real
 * difficulty lives. This file must NOT also jitter the amplitude: it reports
 * what the player actually did, and battle.js applies the swell.
 */

import { AMP_RANGE } from '../engine/battle.js?v=20260829b';

/* -------------------------------------------------------------------------- */
/* TUNING — the feel of the thumb, and nothing else                            */
/* -------------------------------------------------------------------------- */

const T = Object.freeze({
  /** ms for one traverse of the track. The needle ping-pongs, so a full
   *  there-and-back cycle is twice this. Linear, not sinusoidal: a pendulum
   *  that slows at the edges makes the middle — which is the core zone — the
   *  fastest part of the sweep, and a timing game has to be learnable. */
  sweepMs: 1150,

  /** How many traverses before an unpressed turn is called as a whiff. */
  maxPasses: 5,

  /** ms of holding to travel the whole of AMP_RANGE. At this rate the ideal
   *  amplitudes in the library (0.88 … 1.50) sit between roughly 460ms and
   *  1060ms of hold, which is a comfortable thumb press. */
  riseMs: 1450,

  /** Fraction of the track the needle sways by on unstable ground. The core
   *  zone is 12% wide, so this is about a sixth of it — felt, never fatal. */
  swayPct: 0.020,
  swayHz: 0.55,

  /**
   * Live guidance bands, as FRACTIONS OF THE CONTRACT'S OWN TOLERANCE.
   *
   * `composure()` divides the offset from ideal by 0.90 when the player is
   * under and by 0.70 when they are over (CONTRACT §5, frozen). Those two
   * widths are the only thing this file borrows, and it borrows them so the
   * words under the bar describe the curve that is actually going to score
   * the move. A flat ±0.07 window called a player "TOO SMALL" at an offset
   * where composure was still 0.97, which is a lie told at the exact moment
   * they are trying to learn the control.
   *
   * Nothing here computes a score — these are adverbs, not multipliers — but
   * if the curve is ever retuned, retune these with it.
   */
  wUnder: 0.90,
  wOver: 0.70,
  onIt: 0.18,     // × w  — dead on
  close: 0.42,    // × w  — still very good
  ragged: 0.75,   // × w  — costing you, not ruinous

  /** Beat between the release and the panel closing, so the band lands. */
  settleMs: 190
});

/** Haptics. Short, distinct, and skipped entirely when unsupported. */
const BUZZ = Object.freeze({
  press: 9,
  mark: [0, 14],          // crossing idealAmp — the thumb learns the mark
  over: [0, 8, 40, 8],    // crossing well past it — two taps, "ease off"
  perfect: [0, 16, 40, 26],
  clean: 16,
  shaky: 7,
  whiff: 0
});

const BANDS = Object.freeze({ perfect: 'PERFECT', clean: 'CLEAN', shaky: 'SHAKY', whiff: 'PERDIÓ AURA' });

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

function buzz(pattern) {
  if (!pattern) return;
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) { /* a blocked vibrator is not an error */ }
}

/* -------------------------------------------------------------------------- */
/* THE CONTROLLER                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Wire up the timing panel. Call once at boot; call `start()` per turn.
 *
 * @param {Object}   opts
 * @param {Document} [opts.doc]        defaults to the global document
 * @param {(res: {band: string, amp: number, holdMs: number, pos: number,
 *           released: boolean}) => void} opts.onCommit
 *        Fired exactly once per `start()`. `band` is one of
 *        'perfect' | 'clean' | 'shaky' | 'whiff' and `amp` is inside
 *        AMP_RANGE — precisely the two fields `resolveExchange` wants.
 * @returns {{start: Function, cancel: Function, active: Function, destroy: Function}}
 */
export function createTiming(opts) {
  const o = opts || {};
  const doc = o.doc || (typeof document !== 'undefined' ? document : null);
  if (!doc) throw new Error('createTiming needs a document');

  const el = {
    panel: doc.getElementById('timing'),
    title: doc.getElementById('timingTitle'),
    track: doc.getElementById('track'),
    outer: doc.getElementById('zoneOuter'),
    core: doc.getElementById('zoneCore'),
    needle: doc.getElementById('needle'),
    ampFill: doc.getElementById('ampFill'),
    ampIdeal: doc.getElementById('ampIdeal'),
    hint: doc.getElementById('timingHint'),
    pad: doc.getElementById('holdpad')
  };

  const reduced = (function () {
    try {
      return !!(doc.defaultView && doc.defaultView.matchMedia &&
        doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }());

  /** Live turn, or null between turns. */
  let run = null;
  let raf = 0;
  let closeTimer = 0;

  /* ---- zone geometry, read from the DOM rather than hardcoded ---------- */
  /* The CSS owns where the zones are (26–74% clean, 44–56% perfect). Reading
     them back means a future restyle moves the scoring bands with the paint
     instead of silently desyncing from it. */
  let geom = { w: 320, core: [0.44, 0.56], outer: [0.26, 0.74] };

  function measure() {
    if (!el.track || !el.track.getBoundingClientRect) return;
    const t = el.track.getBoundingClientRect();
    if (!(t.width > 0)) return;
    geom.w = t.width;
    const band = function (node, fallback) {
      if (!node || !node.getBoundingClientRect) return fallback;
      const r = node.getBoundingClientRect();
      if (!(r.width > 0)) return fallback;
      return [(r.left - t.left) / t.width, (r.right - t.left) / t.width];
    };
    geom.core = band(el.core, geom.core);
    geom.outer = band(el.outer, geom.outer);
  }

  /**
   * Which band a needle position falls in.
   * @param {number} p 0…1 across the track
   */
  function bandAt(p) {
    if (p >= geom.core[0] && p <= geom.core[1]) return 'perfect';
    if (p >= geom.outer[0] && p <= geom.outer[1]) return 'clean';
    return 'shaky';
  }

  /* ---- painting -------------------------------------------------------- */

  function paintNeedle(p) {
    if (!el.needle) return;
    // #needle is CSS-positioned at left:50%; translate from there so the
    // browser only ever composites, never re-lays-out, at 60fps.
    el.needle.style.transform = 'translateX(' + ((p - 0.5) * geom.w).toFixed(2) + 'px)';
  }

  function ampPct(amp) {
    return clamp((amp - AMP_RANGE.min) / (AMP_RANGE.max - AMP_RANGE.min), 0, 1) * 100;
  }

  function paintAmp(amp) {
    if (el.ampFill) el.ampFill.style.width = ampPct(amp).toFixed(2) + '%';
  }

  function paintIdeal(ideal) {
    if (el.ampIdeal) el.ampIdeal.style.left = ampPct(ideal).toFixed(2) + '%';
  }

  function hint(text) {
    if (el.hint && el.hint.textContent !== text) el.hint.textContent = text;
  }

  function padText(text) {
    if (el.pad && el.pad.textContent !== text) el.pad.textContent = text;
  }

  function held(on) {
    if (!el.pad) return;
    if (on) el.pad.classList.add('held');
    else el.pad.classList.remove('held');
  }

  /* ---- amplitude ------------------------------------------------------- */

  /** Amplitude for a given hold duration. Linear — the bar means what it shows. */
  function ampFor(ms) {
    const k = clamp(ms / T.riseMs, 0, 1);
    return AMP_RANGE.min + (AMP_RANGE.max - AMP_RANGE.min) * k;
  }

  /**
   * The live guidance under the track. This is where the game teaches the one
   * thing a player will otherwise get wrong forever: bigger is not better.
   */
  function ampWord(amp, ideal) {
    const off = amp - ideal;
    const w = off > 0 ? T.wOver : T.wUnder;
    const d = Math.abs(off) / w;
    if (d <= T.onIt) return 'ON THE MARK';
    if (off < 0) {
      if (d <= T.close) return 'JUST UNDER';
      if (d <= T.ragged) return 'SMALL';
      return 'TOO SMALL';
    }
    if (d <= T.close) return 'JUST OVER';
    if (d <= T.ragged) return 'BIG';
    return 'TOO BIG · EASE OFF';
  }

  /* ---- the loop -------------------------------------------------------- */

  function frame(now) {
    if (!run) { raf = 0; return; }
    raf = requestAnimationFrame(frame);

    // The panel is display:none until body[data-state="timing"] lands, so the
    // first honest measurement of the zones is available one frame in. Re-read
    // once rather than trusting a rect taken while the panel was still hidden.
    if (!run.measured) { run.measured = true; measure(); paintIdeal(run.ideal); }

    const t = now - run.t0;

    // ping-pong, linear, so the needle is equally readable everywhere
    const phase = (t / run.sweepMs) % 2;
    let p = phase < 1 ? phase : 2 - phase;

    if (run.unstable && !reduced) {
      p += Math.sin((t / 1000) * Math.PI * 2 * T.swayHz) * T.swayPct;
      p = clamp(p, 0, 1);
    }
    run.pos = p;
    paintNeedle(p);

    if (run.holdingAt != null) {
      const ms = now - run.holdingAt;
      const amp = ampFor(ms);
      run.amp = amp;
      paintAmp(amp);
      hint(ampWord(amp, run.ideal));

      // The mark, announced through the thumb: one tick as you reach ideal,
      // two as you leave the band where it is still worth having. You learn
      // where the white line is without looking away from the needle.
      if (!run.hitMark && amp >= run.ideal) { run.hitMark = true; buzz(BUZZ.mark); }
      if (!run.hitOver && amp >= run.ideal + T.wOver * T.close) { run.hitOver = true; buzz(BUZZ.over); }
    }

    // the sweep ran out and nothing was thrown
    if (t >= run.sweepMs * T.maxPasses) commit(run.holdingAt != null ? run.amp : AMP_RANGE.min, 'whiff');
  }

  /* ---- the gesture ----------------------------------------------------- */

  function press(e) {
    if (!run || run.done || run.holdingAt != null) return;
    if (e && e.cancelable) e.preventDefault();
    /* OWN THE GESTURE. Without capture, a thumb that drifts a pixel off the pad
       hands the pointer stream to whatever is underneath, and the hold dies
       mid-flight. With capture every move and up for this pointer is retargeted
       here until we let go, so the only thing that can end a hold is the player
       lifting their thumb. Found on a real phone: the hold was breaking on its
       own. (Feature-detected — jsdom has no pointer capture.) */
    if (e && e.pointerId != null && el.panel && el.panel.setPointerCapture) {
      try { el.panel.setPointerCapture(e.pointerId); run.captured = e.pointerId; } catch (err) { /* ignore */ }
    }
    run.holdingAt = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    run.amp = AMP_RANGE.min;
    held(true);
    padText('RELEASE ON THE LIGHT');
    paintAmp(AMP_RANGE.min);
    hint(ampWord(AMP_RANGE.min, run.ideal));
    buzz(BUZZ.press);
  }

  function release(e) {
    if (!run || run.done || run.holdingAt == null) return;
    if (e && e.cancelable) e.preventDefault();
    if (run.captured != null && el.panel && el.panel.releasePointerCapture) {
      try { el.panel.releasePointerCapture(run.captured); } catch (err) { /* ignore */ }
      run.captured = null;
    }
    commit(run.amp, bandAt(run.pos));
  }

  /**
   * A cancel is NOT a release. The browser fires `pointercancel` when it decides
   * the touch belongs to a gesture of its own — a scroll, a long-press
   * selection, a system swipe. Scoring it as a deliberate release is how a
   * highlighted word turned into a committed move at whatever amplitude the bar
   * happened to be at.
   *
   * Capture plus the global `user-select:none` should mean this never fires. If
   * it does, the honest reading is that the player never let go, so keep the
   * hold alive and let the sweep run: they can still release for a real band, or
   * time out into a whiff on their own terms. Either way the game does not
   * decide for them.
   */
  function cancelled() {
    if (!run || run.done || run.holdingAt == null) return;
    if (run.captured != null && el.panel && el.panel.releasePointerCapture) {
      try { el.panel.releasePointerCapture(run.captured); } catch (err) { /* ignore */ }
      run.captured = null;
    }
  }

  /* The long-press menu and the selection gesture, refused at the source. The
     stylesheet makes nothing selectable; these stop the browser trying. */
  function swallow(e) { if (e && e.cancelable) e.preventDefault(); return false; }

  /* ---- keyboard: the same gesture, for a thumb that is a spacebar ------ */

  function keyDown(e) {
    if (!run || run.done) return;
    if (e.repeat) return;
    if (e.key !== ' ' && e.key !== 'Spacebar' && e.key !== 'Enter') return;
    e.preventDefault();
    press(null);
  }

  function keyUp(e) {
    if (!run || run.done) return;
    if (e.key !== ' ' && e.key !== 'Spacebar' && e.key !== 'Enter') return;
    e.preventDefault();
    release(null);
  }

  /* ---- commit ---------------------------------------------------------- */

  /**
   * End the turn's input exactly once and hand `{band, amp}` upward.
   * @param {number} amp
   * @param {string} band
   */
  function commit(amp, band) {
    if (!run || run.done) return;
    run.done = true;

    const holdMs = run.holdingAt != null
      ? (typeof performance !== 'undefined' ? performance.now() : Date.now()) - run.holdingAt
      : 0;
    const finalAmp = clamp(amp, AMP_RANGE.min, AMP_RANGE.max);
    const pos = run.pos;
    const cb = run.onCommit;

    held(false);
    hint(BANDS[band] || band.toUpperCase());
    padText(band === 'whiff' ? 'TOO LATE' : 'RELEASE ON THE LIGHT');
    buzz(BUZZ[band]);

    stopLoop();
    detach();

    // A beat, so the band is legible before the panel drops. The result is
    // already decided — this is punctuation, not deliberation.
    const fire = function () {
      closeTimer = 0;
      run = null;
      if (typeof cb === 'function') {
        cb({ band: band, amp: finalAmp, holdMs: Math.round(holdMs), pos: pos, released: holdMs > 0 });
      }
    };
    if (reduced) fire();
    else closeTimer = setTimeout(fire, T.settleMs);
  }

  /* ---- listeners ------------------------------------------------------- */

  function attach() {
    const view = doc.defaultView || (typeof window !== 'undefined' ? window : null);
    // The WHOLE panel is the pad. A generous hit area is not a nicety here —
    // the track, the amp bar and the pad are one control.
    if (el.panel) {
      el.panel.addEventListener('pointerdown', press);
      /* `touchstart` non-passive is the belt to pointerdown's braces. Chrome
         drives its long-press selection off the touch sequence, and a
         `preventDefault` on `pointerdown` does not always reach it — worse, a
         touch-derived pointerdown can arrive non-cancelable, in which case the
         guard above silently skips. This one is always cancelable. */
      el.panel.addEventListener('touchstart', swallow, { passive: false });
      el.panel.addEventListener('contextmenu', swallow);
      el.panel.addEventListener('selectstart', swallow);
    }
    if (view) {
      view.addEventListener('pointerup', release);
      view.addEventListener('pointercancel', cancelled);
      view.addEventListener('keydown', keyDown);
      view.addEventListener('keyup', keyUp);
      view.addEventListener('resize', measure);
    }
  }

  function detach() {
    const view = doc.defaultView || (typeof window !== 'undefined' ? window : null);
    if (el.panel) {
      el.panel.removeEventListener('pointerdown', press);
      el.panel.removeEventListener('touchstart', swallow, { passive: false });
      el.panel.removeEventListener('contextmenu', swallow);
      el.panel.removeEventListener('selectstart', swallow);
    }
    if (view) {
      view.removeEventListener('pointerup', release);
      view.removeEventListener('pointercancel', cancelled);
      view.removeEventListener('keydown', keyDown);
      view.removeEventListener('keyup', keyUp);
      view.removeEventListener('resize', measure);
    }
  }

  function stopLoop() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  /* ---- public ---------------------------------------------------------- */

  /**
   * Open the panel for one move.
   *
   * @param {Object}   cfg
   * @param {string}   cfg.title             what is being thrown, for `#timingTitle`
   * @param {string}   [cfg.hint]            the move's `hint` — HOW to perform it
   * @param {number}   cfg.idealAmp          where the white mark goes
   * @param {number}   [cfg.needleSpeedMult=1] from `matchSnapshot()`
   * @param {boolean}  [cfg.unstable=false]  Act 5 — the deck is moving
   * @param {Function} [cfg.onCommit]        overrides the constructor's callback
   */
  function start(cfg) {
    const c = cfg || {};
    cancel();

    const ideal = typeof c.idealAmp === 'number' && isFinite(c.idealAmp)
      ? clamp(c.idealAmp, AMP_RANGE.min, AMP_RANGE.max) : 1;
    const mult = typeof c.needleSpeedMult === 'number' && c.needleSpeedMult > 0 ? c.needleSpeedMult : 1;

    run = {
      t0: (typeof performance !== 'undefined' ? performance.now() : Date.now()),
      sweepMs: T.sweepMs / mult,
      unstable: !!c.unstable,
      ideal: ideal,
      amp: AMP_RANGE.min,
      pos: 0,
      holdingAt: null,
      measured: false,
      hitMark: false,
      hitOver: false,
      done: false,
      onCommit: typeof c.onCommit === 'function' ? c.onCommit : o.onCommit
    };

    if (el.title) el.title.textContent = c.title || 'Move';
    hint(c.hint || 'Hold to size it. Release on the light.');
    padText('HOLD · RELEASE ON THE LIGHT');
    held(false);
    paintAmp(AMP_RANGE.min);
    paintIdeal(ideal);

    measure();
    paintNeedle(0);
    attach();

    stopLoop();
    raf = requestAnimationFrame(frame);
  }

  /**
   * Abandon the current turn's input without emitting anything. Used when a
   * battle is torn down mid-timing (a screen change, a reset).
   */
  function cancel() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = 0; }
    stopLoop();
    if (run) { run.done = true; run = null; }
    detach();
    held(false);
  }

  /** Is a turn's input currently open? */
  function active() { return !!run && !run.done; }

  function destroy() { cancel(); }

  return { start: start, cancel: cancel, active: active, destroy: destroy, measure: measure };
}

export default createTiming;
