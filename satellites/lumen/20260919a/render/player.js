// Plays a cast back from its event list. Ticks map to seconds at about 12 cells per second, speeding up
// through long loops; a tap fast-forwards. The player never computes a score: every number it shows comes
// from an event, and the final total is the cast's closing 'end' event (equal to the sim's Lux).
export const CELLS_PER_SECOND = 12;

export function createPlayer(events, { onEvent, onTick, onDone, reducedMotion = false, speed = 1 }) {
  const last = events.length ? events[events.length - 1].t : 0;
  let T = 0;
  let i = 0;
  let fast = reducedMotion ? 3 : 1;
  let finished = false;
  let hold = 0.35; // seconds to linger after the last event
  const rate = (t) => CELLS_PER_SECOND * (1 + Math.max(0, t - 24) / 18);
  return {
    get t() { return T; },
    get done() { return finished; },
    fastForward() { fast = Math.min(12, fast * 4); },
    update(dt) {
      if (finished) return;
      T += dt * rate(T) * fast * speed;
      while (i < events.length && events[i].t <= T) onEvent(events[i++]);
      if (onTick) onTick(T);
      if (i >= events.length && T >= last) {
        hold -= dt * fast;
        if (hold <= 0) { finished = true; if (onDone) onDone(); }
      }
    },
    skip() { while (i < events.length) onEvent(events[i++]); T = last + 1; if (onTick) onTick(T); finished = true; if (onDone) onDone(); },
  };
}
