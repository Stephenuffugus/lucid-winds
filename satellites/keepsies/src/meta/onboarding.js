/**
 * The first twenty seconds (DESIGN 16.1).
 *
 * No logo dwell, no menu first. A marble sits on dirt and the game says
 * "Show me your hardest snap." Three snaps, each one launching the marble into
 * the dark with the full sound, and the NINETIETH PERCENTILE of the three
 * becomes that player's 1.0 power. A child's flick and an adult's flick both
 * reach maximum at their own maximum.
 *
 * Why this matters more than it looks: without it every player shoots against
 * `snap.thumbSpeedMaxDefault`, which is a guess at a stranger's thumb. A player
 * whose hardest snap is slower than the default can never reach full power and
 * will never be able to break the cross; one whose snap is faster hits the
 * ceiling on every shot and loses the whole top half of the range.
 *
 * Handedness comes free: the side of the screen the first brace lands on.
 */
import { clamp } from '../core/dmath.js?v=20260904b';

/**
 * @param {{tuning:object, save:object, onSay:Function, onProgress:Function,
 *   onDone:Function}} deps
 */
export function createCalibration(deps) {
  const T = deps.tuning.snap;
  const S = { samples: [], handedness: null, done: false };

  /**
   * The ninetieth percentile of the three, by linear interpolation, which for
   * three samples is nine tenths of the way from the second to the third. Not
   * the maximum: one wild outlier should not set a bar the player then has to
   * clear on every shot for the rest of the game.
   */
  function percentile90(list) {
    const a = list.slice().sort((x, y) => x - y);
    if (!a.length) return null;
    if (a.length === 1) return a[0];
    const pos = 0.9 * (a.length - 1);
    const lo = Math.floor(pos), hi = Math.min(a.length - 1, lo + 1);
    return a[lo] + (a[hi] - a[lo]) * (pos - lo);
  }

  return {
    state: () => ({ taken: S.samples.length, need: 3, samples: S.samples.slice(), done: S.done }),

    /** Feed one snap in. Returns what to say next. */
    take(aim) {
      if (S.done || !aim) return null;
      if (S.handedness === null && aim.handedness) S.handedness = aim.handedness;
      const v = aim.thumbSpeed;
      if (v == null || v < T.cancelBelow) {
        if (deps.onSay) deps.onSay('That was a nudge. Snap it like you mean it.');
        return { counted: false };
      }
      S.samples.push(v);
      if (deps.onProgress) deps.onProgress(S.samples.length, 3);
      if (S.samples.length < 3) {
        if (deps.onSay) deps.onSay(S.samples.length === 1 ? 'Good. Twice more.' : 'One more, harder.');
        return { counted: true, done: false };
      }
      S.done = true;
      // a floor, so that a player who taps three times cannot calibrate
      // themselves into a game where a full effort snap is a dribble
      const p90 = clamp(percentile90(S.samples), T.cancelBelow + 0.15, 4.0);
      const result = { max: p90, samples: S.samples.slice(), handedness: S.handedness || 'right' };
      if (deps.onSay) deps.onSay('That is your full strength. Everything is measured from it now.');
      if (deps.onDone) deps.onDone(result);
      return { counted: true, done: true, calib: result };
    },

    /** Start again from settings. */
    reset() { S.samples.length = 0; S.done = false; }
  };
}

/**
 * The calibration a player already has, or the default with a note that it is
 * not theirs. `main.js` hands this to the Knuckle through its `calib()` hook.
 */
export function calibrationFrom(save, tuning) {
  const c = save && save.profile && save.profile.calib;
  if (c && c.max) return { max: c.max, own: true, handedness: save.profile.handedness || 'right' };
  return { max: tuning.snap.thumbSpeedMaxDefault, own: false, handedness: 'right' };
}
