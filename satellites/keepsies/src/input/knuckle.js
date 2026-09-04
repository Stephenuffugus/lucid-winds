/**
 * THE KNUCKLE. The real playground shot made into the phone gesture.
 *
 * One continuous motion, three layers, exactly DESIGN 7:
 *
 *   BRACE   touch and hold near your shooter. Holding STILL is the skill: the
 *           jitter of your touch over the last 600 ms sets the accuracy cone,
 *           which tightens from six degrees to one and a half over about a
 *           second of stillness. There is no button and nothing to charge.
 *   SNAP    flick the thumb forward THROUGH the marble. Drag distance means
 *           nothing; the sampled SPEED of the touch over the final 90 ms is the
 *           power. That is the same window a Quest controller flick will use.
 *   CONTACT where on the marble your thumb was sitting when the flick began.
 *           Low across the ball is backspin and the stop shot, over the top is
 *           follow, off centre is english, and a hooked path is wildness, which
 *           is not a worse shot, it is a wilder one.
 *
 * This file turns a pointer into an AimSource and NOTHING ELSE. It never touches
 * physics, never scores anything, never decides a rule. `core/snap.js` is the
 * only place an AimSource becomes an impulse, so touch, the pull back fallback,
 * the AI, a replay log and one day a hand tracked thumb all arrive the same way.
 *
 * ⛔ A long press for SELECTION fires pointercancel, not a release. The canvas
 * carries `touch-action: none` and `user-select: none`, and the brace takes
 * setPointerCapture, or the snap never arrives at all.
 */
import { clamp, len2, DEG } from '../core/dmath.js?v=20260904a';
import { makeAim } from '../core/snap.js?v=20260904a';

/** A CSS pixel is about 0.264 mm of real glass, and that is already device
 *  independent: devicePixelRatio would count the same thing twice. */
const METRES_PER_CSS_PX = 0.000264;

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} tuning
 * @param {{
 *   taw: () => {x:number,y:number,r:number}|null,   the shooter, in CSS pixels
 *   aimAzimuth: () => number,                        camera forward, radians
 *   calib: () => {max:number},
 *   onBrace?: (state:object) => void,
 *   onAim?: (aim:object) => void,
 *   onCancel?: (why:string) => void,
 *   haptic?: (kind:string) => void,
 *   enabled?: () => boolean
 * }} hooks
 */
export function createKnuckle(canvas, tuning, hooks) {
  const T = tuning.snap;
  const S = {
    active: false, pointerId: -1,
    samples: [],            // {x, y, t} in CSS px and ms
    downAt: 0, downX: 0, downY: 0,
    settle01: 0, lastSettleHaptic: false,
    secondFinger: false,    // knuckling down
    warmArc: 0, warmed: false, warmAngle: 0, warmT: 0,
    handedness: null,
    lastAim: null, lastCancel: null,
    outsideCanvas: false
  };

  const on = () => !hooks.enabled || hooks.enabled();
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function push(x, y, t) {
    S.samples.push({ x, y, t });
    // bounded, always: a per frame list that grows is a tick that eats the world
    const cut = t - (T.jitterWindowMs + 200);
    while (S.samples.length > 2 && S.samples[0].t < cut) S.samples.shift();
  }

  /** RMS displacement over the jitter window, in CSS px. Stillness is the skill. */
  function jitter(t) {
    const win = S.samples.filter(s => s.t >= t - T.jitterWindowMs);
    if (win.length < 3) return 0;
    let mx = 0, my = 0;
    for (const s of win) { mx += s.x; my += s.y; }
    mx /= win.length; my /= win.length;
    let sum = 0;
    for (const s of win) sum += (s.x - mx) * (s.x - mx) + (s.y - my) * (s.y - my);
    return Math.sqrt(sum / win.length);
  }

  /** The accuracy cone, in degrees, from how steady the hold has been. */
  function coneDeg() {
    let deg = T.coneWideDeg + (T.coneTightDeg - T.coneWideDeg) * S.settle01;
    if (S.secondFinger) deg *= T.knuckledConeFactor;   // literal knuckling down
    return deg;
  }

  /**
   * Thumb speed over the final 90 ms, in metres per second of real glass.
   * Displacement across the samples inside the window divided by the time they
   * actually span, NOT by the window width: a thumb that was still for 60 ms and
   * then moved for 30 would otherwise read as a third of its real speed.
   */
  function thumbSpeed(t) {
    const win = S.samples.filter(s => s.t >= t - T.sampleWindowMs);
    if (win.length < 2) return 0;
    const a = win[0], b = win[win.length - 1];
    const span = b.t - a.t;
    if (span <= 0) return 0;
    return (len2(b.x - a.x, b.y - a.y) / span) * 1000 * METRES_PER_CSS_PX;
  }

  /**
   * Signed curvature of the snap path, averaged: how much the direction turned
   * per pixel travelled. A clean straight snap is near zero; a hooked one is not.
   */
  function curvature(win) {
    if (win.length < 4) return 0;
    let turn = 0, arc = 0, prevAng = null;
    for (let i = 1; i < win.length; i++) {
      const dx = win[i].x - win[i - 1].x, dy = win[i].y - win[i - 1].y;
      const L = len2(dx, dy);
      if (L < 0.5) continue;
      const ang = Math.atan2(dy, dx);
      if (prevAng !== null) {
        let d = ang - prevAng;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        turn += d;
        arc += L;
      }
      prevAng = ang;
    }
    return arc > 1 ? turn / arc : 0;
  }

  /**
   * WHERE THE THUMB WAS ON THE MARBLE when the flick began, in taw radii.
   *
   * The design calls this "where the snap path crosses the marble". For a real
   * gesture those are the same point: the brace holds the thumb on the shooter,
   * so the first sample of the snap window IS the contact, the way your thumb
   * sits against the marble in the dirt before you snap it. Taking it from the
   * start of the window rather than from a chord through the disc also keeps a
   * straight snap through the middle at exactly zero, which the design wants to
   * be the pure clean shot.
   *
   * Screen y runs DOWN, so a thumb below the centre gives a NEGATIVE y, which is
   * backspin, which is the stop shot. That sign is load bearing.
   */
  function contactOffset(anchor, taw) {
    if (!anchor || !taw) return { x: 0, y: 0 };
    // ⛔ The BRACE ANCHOR, not the first sample of the 90 ms window. They are the
    // same point for a quick flick and very different for a slow push: over 220 ms
    // the thumb has already left the marble by the time the window opens, and
    // reading the offset there gave a centre push a full topspin reading. Where
    // your thumb was SITTING on the marble is the contact, which is also what it
    // means in the dirt.
    const p = anchor;
    let ox = (p.x - taw.x) / taw.r;
    let oy = -(p.y - taw.y) / taw.r;
    const L = len2(ox, oy);
    if (L > 1) { ox /= L; oy /= L; }     // clamped to the rim, never past it
    return { x: ox, y: oy };
  }

  /** A slow deliberate circular rub, which is not jitter and is not a flick. */
  function updateWarming(x, y, t, taw) {
    if (!taw) return;
    const dx = x - taw.x, dy = y - taw.y;
    const rad = len2(dx, dy);
    if (rad < taw.r * 0.4 || rad > taw.r * 2.4) { S.warmArc *= 0.96; return; }
    const ang = Math.atan2(dy, dx);
    if (S.warmT) {
      let d = ang - S.warmAngle;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      const dt = (t - S.warmT) / 1000;
      const revsPerSec = dt > 0 ? Math.abs(d) / (Math.PI * 2) / dt : 0;
      if (revsPerSec > 0 && revsPerSec < 2) S.warmArc += Math.abs(d) * rad;
      else S.warmArc *= 0.9;
    }
    S.warmAngle = ang; S.warmT = t;
    if (S.warmArc >= Math.PI * taw.r && !S.warmed) {
      S.warmed = true;
      if (hooks.haptic) hooks.haptic('warm');
    }
  }

  function begin(e) {
    if (!on()) return;
    const taw = hooks.taw();
    if (!taw) return;
    if (S.active) { S.secondFinger = true; return; }   // a planted second finger
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (len2(x - taw.x, y - taw.y) > (taw.grabR || taw.r * 1.6)) return;   // not on the shooter
    S.active = true;
    S.pointerId = e.pointerId;
    S.samples.length = 0;
    S.settle01 = 0; S.lastSettleHaptic = false;
    S.warmArc = 0; S.warmed = false; S.warmT = 0;
    S.outsideCanvas = false;
    S.downAt = now(); S.downX = x; S.downY = y;
    if (S.handedness === null) S.handedness = x < r.width / 2 ? 'left' : 'right';
    push(x, y, S.downAt);
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
    e.preventDefault();
    report();
  }

  function move(e) {
    if (!S.active || e.pointerId !== S.pointerId) return;
    const r = canvas.getBoundingClientRect();
    const t = now();
    // getCoalescedEvents is where the real 120 Hz samples are, and a flick that
    // lasts 90 ms is three pointermove events without it
    const list = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
    for (const ev of list) push(ev.clientX - r.left, ev.clientY - r.top, t);
    const x = e.clientX - r.left, y = e.clientY - r.top;
    S.outsideCanvas = x < 0 || y < 0 || x > r.width || y > r.height;

    const j = jitter(t);
    const dt = 1 / 60;
    if (j > 8) S.settle01 = clamp(S.settle01 - 0.5, 0, 1);
    else if (j < 2) S.settle01 = clamp(S.settle01 + dt / T.settleSeconds, 0, 1);
    if (S.settle01 >= 1 && !S.lastSettleHaptic) {
      S.lastSettleHaptic = true;
      if (hooks.haptic) hooks.haptic('settle');
    }
    updateWarming(x, y, t, hooks.taw());
    report();
  }

  function end(e) {
    if (!S.active || e.pointerId !== S.pointerId) return;
    const t = now();
    const r = canvas.getBoundingClientRect();
    push(e.clientX - r.left, e.clientY - r.top, t);
    const taw = hooks.taw();
    const win = S.samples.filter(s => s.t >= t - T.sampleWindowMs);
    const v = thumbSpeed(t);
    finish(v, win, taw, false);
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) { }
  }

  function cancelled(e) {
    if (!S.active || e.pointerId !== S.pointerId) return;
    // a pointercancel is a real ending, and it is exactly the fumble a slip is for
    const t = now();
    const win = S.samples.filter(s => s.t >= t - T.sampleWindowMs);
    finish(thumbSpeed(t), win, hooks.taw(), true);
  }

  function finish(v, win, taw, wasCancel) {
    const calib = (hooks.calib && hooks.calib()) || { max: T.thumbSpeedMaxDefault };
    const cmax = Math.max(T.thumbSpeedMin + 0.05, calib.max || T.thumbSpeedMaxDefault);
    const thumb01 = clamp((v - T.thumbSpeedMin) / (cmax - T.thumbSpeedMin), 0, 1);
    const cone = coneDeg();
    // ⛔ Read everything off the gesture BEFORE reset() empties it. The first
    // version read the brace anchor after, got nothing, and reported a dead
    // centre contact for every shot in the game.
    const anchor = S.samples.length ? { x: S.samples[0].x, y: S.samples[0].y } : null;
    reset();

    if (v < T.cancelBelow) {
      // never a wasted turn. Under the cancel band this was not a shot at all.
      S.lastCancel = { thumbSpeed: v, why: wasCancel ? 'cancel' : 'tooSlow' };
      if (hooks.onCancel) hooks.onCancel(S.lastCancel.why);
      return null;
    }

    const curv = curvature(win);
    const offset = contactOffset(anchor, taw);
    const wild = clamp(Math.abs(curv) / T.kWild, 0, 1);
    // the snap's fine angle: how far the flick pointed off the camera's forward,
    // capped so a snap stays a snap and never becomes a steering wheel
    const fine = fineAngle(win);
    const azimuth = (hooks.aimAzimuth ? hooks.aimAzimuth() : 0) + fine;

    let power01 = thumb01;
    // ⛔ ONE ease curve, and it lives in core/snap.js. The design asks for a
    // single map from thumb speed to launch speed; easing here as well would
    // bend it twice and the replay would disagree with the AI.
    if (S.secondFinger) power01 = Math.min(power01, T.knuckledPowerCap);

    /* BOMBING (DESIGN 8.3). Brace on the taw and snap DOWN the screen, toward
     * yourself, and the marble is lifted and dropped instead of rolled. It is a
     * house rule and it is only legal with your taw inside the ring, so the game
     * layer decides whether this flag survives; the input's job is only to notice
     * that the thumb went the other way. */
    const down = win.length >= 2 && (win[win.length - 1].y - win[0].y) > 40;
    const bomb = down && !!hooks.bombingAllowed && hooks.bombingAllowed();

    const aim = makeAim({
      dir: { x: Math.sin(azimuth), y: 0, z: Math.cos(azimuth) },
      bomb,
      bombLift: bomb ? 0.82 : undefined,
      power01,
      contactOffset: offset,
      pathCurvature: curv,
      wildness01: wild,
      braced01: clamp(1 - (cone - T.coneTightDeg) / Math.max(1e-6, T.coneWideDeg - T.coneTightDeg), 0, 1),
      warmed: S.warmed
    });
    aim.thumbSpeed = v;
    aim.softNudge = v <= T.softNudgeTo;
    aim.knuckledDown = S.secondFinger;
    // ⛔ A SLIP IS DECLARED HERE, never pressed. The thumb left the canvas mid
    // snap, which is the digital cousin of a knuckle slipping in the dirt.
    aim.slipped = wasCancel || S.outsideCanvas;
    aim.coneDeg = cone;
    aim.handedness = S.handedness;
    S.lastAim = aim;
    if (hooks.onAim) hooks.onAim(aim);
    return aim;
  }

  /** Where the flick pointed, relative to straight up the screen, capped. */
  function fineAngle(win) {
    if (win.length < 2) return 0;
    const a = win[0], b = win[win.length - 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    if (len2(dx, dy) < 4) return 0;
    // screen up is away from the player, which is the camera's forward
    const ang = Math.atan2(dx, -dy);
    const cap = T.fineAngleMaxDeg * DEG;
    return clamp(ang, -cap, cap);
  }

  function reset() {
    S.active = false; S.pointerId = -1; S.secondFinger = false;
    S.samples.length = 0; S.settle01 = 0; S.lastSettleHaptic = false;
    S.outsideCanvas = false;
    report();
  }

  function report() {
    if (hooks.onBrace) hooks.onBrace(state());
  }

  function state() {
    return {
      bracing: S.active,
      settle01: S.settle01,
      coneDeg: S.active ? coneDeg() : T.coneWideDeg,
      warmed: S.warmed,
      knuckledDown: S.secondFinger,
      handedness: S.handedness,
      samples: S.samples.length
    };
  }

  const onDown = (e) => begin(e);
  const onMove = (e) => move(e);
  const onUp = (e) => end(e);
  const onCancelEv = (e) => cancelled(e);

  return {
    attach() {
      canvas.addEventListener('pointerdown', onDown, { passive: false });
      canvas.addEventListener('pointermove', onMove, { passive: false });
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onCancelEv);
    },
    detach() {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancelEv);
      reset();
    },
    /** True while this pointer belongs to a brace, so the camera leaves it alone. */
    owns(pointerId) { return S.active && pointerId === S.pointerId; },
    state,
    lastAim: () => S.lastAim,
    lastCancel: () => S.lastCancel,
    /** For the headless gate: drive the whole gesture without a real pointer. */
    _feed(samples, taw) {
      S.active = true; S.pointerId = -99; S.samples.length = 0;
      S.settle01 = 1; S.secondFinger = false; S.warmed = false; S.outsideCanvas = false;
      for (const s of samples) push(s.x, s.y, s.t);
      const t = samples[samples.length - 1].t;
      const win = S.samples.filter(s => s.t >= t - T.sampleWindowMs);
      return finish(thumbSpeed(t), win, taw, false);
    }
  };
}
