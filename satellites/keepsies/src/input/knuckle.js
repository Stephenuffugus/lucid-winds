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
 *           nothing; the SPEED of the fastest 30 to 50 ms of the flick is the power,
 *           wherever in the flick that was (m3 step 6: it was the last 90 ms before
 *           the lift, so a thumb that rested before lifting lost its shot).
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
import { clamp, len2, DEG } from '../core/dmath.js?v=20261106a';
import { makeAim } from '../core/snap.js?v=20261106a';

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
    outsideCanvas: false,
    lastTick: 0, spiked: false,  // the settle clock, and whether the last jitter reading was a jump
    dialing: false, dialed: false, refX: 0, refY: 0, dialX: 0,   // m3 step 7: a sideways motion inside the circle turns the aim
    settleLog: []                // { t, v }: the settle back through the window, so a flick is read from the hold before it
  };

  const on = () => !hooks.enabled || hooks.enabled();
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  /* ⛔ m3 step 6. A SAMPLE'S TIME IS ITS OWN. Stamped when handled, one rAF's coalesced list all carried one time and a chord was divided by
     frame boundaries: the same flick launched at 1.33 to 4.11 m/s at 60 fps and 1.33 to 6.00 at 40. now() only when the event has no time or
     one a second away (a synthetic event) */
  const stamp = (ev) => { const n = now(), t = ev && ev.timeStamp; return t && Math.abs(t - n) < 1000 ? t : n; };

  function push(x, y, t) {
    S.samples.push({ x, y, t });
    // bounded, always: a per frame list that grows is a tick that eats the world
    const cut = t - (T.jitterWindowMs + 200);
    while (S.samples.length > 2 && S.samples[0].t < cut) S.samples.shift();
  }

  /** RMS displacement over the jitter window, per axis, in CSS px, and how far the newest sample stands from the window's mean. Stillness is the skill. */
  function jitter(t) {
    const win = S.samples.filter(s => s.t >= t - T.jitterWindowMs);
    if (win.length < 3) return { j: 0, off: 0 };
    let mx = 0, my = 0;
    for (const s of win) { mx += s.x; my += s.y; }
    mx /= win.length; my /= win.length;
    let sum = 0;
    for (const s of win) sum += (s.x - mx) * (s.x - mx) + (s.y - my) * (s.y - my);
    const last = win[win.length - 1];
    return { j: Math.sqrt(sum / (2 * win.length)), off: len2(last.x - mx, last.y - my) };
  }

  /** The accuracy cone, in degrees, from how steady the hold has been. */
  function coneDeg() {
    let deg = T.coneWideDeg + (T.coneTightDeg - T.coneWideDeg) * S.settle01;
    if (S.secondFinger) deg *= T.knuckledConeFactor;   // literal knuckling down
    return deg;
  }

  /**
   * The flick (m3 step 6): the fastest stretch of 30 to 50 ms of the whole gesture, in metres per second of real glass, and that stretch's
   * samples. Power, direction and curve all come from it, so a thumb that rests before the lift keeps its flick and a slow push is a legal
   * soft shot; a hold's sub pixel jitter is never the fastest thing there. A gesture too short for 30 ms is read whole.
   */
  function flick() {
    const A = S.samples;
    let best = -1, bi = 0, bj = A.length - 1;
    for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
      const dt = A[j].t - A[i].t;
      if (dt < T.flickMinMs) continue;
      if (dt > T.flickMaxMs) break;
      const v = len2(A[j].x - A[i].x, A[j].y - A[i].y) / dt;
      if (v > best) { best = v; bi = i; bj = j; }
    }
    if (best < 0) {
      if (A.length < 2) return { v: 0, win: A.slice(), path: A.slice(), onset: A.length ? A[0].t : 0 };
      const dt = A[A.length - 1].t - A[0].t;
      best = dt > 0 ? len2(A[A.length - 1].x - A[0].x, A[A.length - 1].y - A[0].y) / dt : 0;
    }
    /* the onset: back from the stretch while the thumb was still moving, so the settle is read from the hold before it */
    let o = bi;
    while (o > 0 && len2(A[o].x - A[o - 1].x, A[o].y - A[o - 1].y) / Math.max(1, A[o].t - A[o - 1].t) > 0.1) o--;
    return { v: best * 1000 * METRES_PER_CSS_PX, win: A.slice(bi, bj + 1), path: A.slice(o), onset: A.length ? A[o].t : 0 };
  }

  /**
   * The part of a sample window in which the thumb was actually MOVING: from
   * the last sample still within a couple of pixels of where the window began.
   *
   * ⛔ THE BRACE IS INSIDE THE WINDOW. The last 90 ms before release hold the
   * flick AND the tail of the still hold before it, and both the speed and the
   * curvature were being read from the first sample of the window, which was a
   * hold sample. Speed came out a third low because the span included forty
   * milliseconds of not moving, and the hold's sub pixel jitter, a few reversals
   * over one pixel of arc, read as a hook: measured, a dead straight snap after
   * a steady hold gave wildness 0.57 to 1.00 and the game called every clean
   * shot a wild one. The onset is where the thumb has left the first sample by
   * two pixels; everything before it is the brace.
   */
  function motion(win) {
    if (win.length < 3) return win;
    const o = win[0];
    let start = 0;
    for (let i = 1; i < win.length; i++) {
      if (len2(win[i].x - o.x, win[i].y - o.y) > 2) { start = i - 1; break; }
      start = i;
    }
    return win.slice(start);
  }

  /**
   * Signed curvature of the snap path, averaged: how much the direction turned
   * per pixel travelled. A clean straight snap is near zero; a hooked one is not.
   */
  function curvature(win0) {
    const win = motion(win0);
    if (win.length < 4) return 0;
    let turn = 0, arc = 0, prevAng = null;
    for (let i = 1; i < win.length; i++) {
      const dx = win[i].x - win[i - 1].x, dy = win[i].y - win[i - 1].y;
      const L = len2(dx, dy);
      // a segment under two pixels is jitter, not a path: a hook is a turn
      // sustained over real travel, and sub pixel reversals must not vote
      if (L < 2) continue;
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
    /* m3 step 3: read against the spin ring, 0.6 of the circle, with a dead zone: near the middle is a centre ball */
    const R = taw.spinR || taw.r, dz = T.spinDeadZone || 0;
    let ox = (p.x - taw.x) / R;
    let oy = -(p.y - taw.y) / R;
    const L = len2(ox, oy);
    if (L <= dz) return { x: 0, y: 0 };
    const k = (Math.min(L, 1) - dz) / (1 - dz) / L;     // clamped to the rim, never past it
    return { x: ox * k, y: oy * k };
  }

  /** A slow deliberate circular rub, which is not jitter and is not a flick. */
  function updateWarming(x, y, t, taw) {
    if (!taw) return;
    const dx = x - taw.x, dy = y - taw.y;
    const rad = len2(dx, dy);
    const R = taw.spinR || taw.r;
    if (rad < R * 0.2 || rad > R * 1.3) { S.warmArc *= 0.96; return; }
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
    if (len2(x - taw.x, y - taw.y) > taw.grabR) return;   // not on the circle
    S.active = true;
    S.pointerId = e.pointerId;
    S.samples.length = 0;
    S.settle01 = 0; S.lastSettleHaptic = false;
    S.warmArc = 0; S.warmed = false; S.warmT = 0;
    S.outsideCanvas = false;
    S.downAt = stamp(e); S.downX = x; S.downY = y;
    S.lastTick = S.downAt; S.spiked = false; S.settleLog.length = 0;
    S.dialing = false; S.dialed = false; S.refX = x; S.refY = y; S.dialX = x;
    if (S.handedness === null) S.handedness = x < r.width / 2 ? 'left' : 'right';
    push(x, y, S.downAt);
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
    e.preventDefault();
    report();
  }

  function move(e) {
    if (!S.active || e.pointerId !== S.pointerId) return;
    const r = canvas.getBoundingClientRect();
    const t = stamp(e);
    // getCoalescedEvents is where the real 120 Hz samples are, and a flick that
    // lasts 90 ms is three pointermove events without it
    // ⛔ and an EMPTY list is not a list. For a pointermove that did not come
    // from the input pipeline (a gate, a screenshot driver, some browsers on
    // some devices) getCoalescedEvents() returns [] and is truthy, so every
    // move was dropped and the snap was measured from pointerdown to pointerup:
    // a hard flick after a long brace read as a nudge and cancelled.
    let list = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    if (!list || !list.length) list = [e];
    for (const ev of list) { push(ev.clientX - r.left, ev.clientY - r.top, stamp(ev)); tickSettle(stamp(ev)); dial(ev.clientX - r.left, ev.clientY - r.top); }
    const x = e.clientX - r.left, y = e.clientY - r.top;
    S.outsideCanvas = x < 0 || y < 0 || x > r.width || y > r.height;

    updateWarming(x, y, t, hooks.taw());
    report();
  }

  /**
   * The settle, advanced by the CLOCK.
   *
   * ⛔ IT USED TO BE COUNTED IN EVENTS: a sixtieth of a second per pointermove,
   * so a hold settled in 72 events, which is 1.2 s on a 60 Hz screen, 0.6 s on
   * a 120 Hz phone, and NEVER for a thumb held so still the browser sends no
   * pointermove at all, which is exactly the thumb DESIGN 7.1 rewards. Now it
   * is time since the hold went still, ticked from every sample and from every
   * frame while braced (`state()` ticks it too).
   *
   * m3 step 6: graded, because it settled only under 2 px of jitter and a real thumb stayed at 6 degrees: full rate to 2 px an axis, nothing at
   * 4. A jump (the newest sample settleSpikePx off the window's mean) costs half, once. The flick itself is such a jump, so finish() reads the
   * settle from the hold before the flick's onset, not from after the flick has spoiled it.
   */
  function tickSettle(t) {
    if (!S.active) return;
    if (t < S.lastTick) return;
    const dt = S.lastTick ? clamp((t - S.lastTick) / 1000, 0, 0.1) : 0;
    S.lastTick = t;
    const { j, off } = jitter(t);
    if (off > T.settleSpikePx) { if (!S.spiked) { S.settle01 = clamp(S.settle01 - 0.5, 0, 1); S.spiked = true; } }
    else {
      S.spiked = false;
      S.settle01 = clamp(S.settle01 + clamp((4 - j) / 2, 0, 1) * dt / T.settleSeconds, 0, 1);
    }
    S.settleLog.push({ t, v: S.settle01 });
    while (S.settleLog.length > 2 && S.settleLog[0].t < t - T.jitterWindowMs) S.settleLog.shift();
    if (S.settle01 >= 1 && !S.lastSettleHaptic) {
      S.lastSettleHaptic = true;
      if (hooks.haptic) hooks.haptic('settle');
    }
  }

  /**
   * THE DIAL (m3 step 7, his "the aiming is horrible"). The bigger circle would turn sideways aim drags into shots. Now a motion more than offLineDeg
   * off the aim line (straight up the screen: the camera turns about the shooter) turns the aim at the orbit gain, and only a forward flick shoots.
   * It takes dialStartPx of travel to read a direction, so a thumb's tremor is neither; moving forward again leaves the dial, ready to flick.
   */
  function dial(x, y) {
    const dx = x - S.refX, dy = y - S.refY, L = len2(dx, dy);
    if (S.dialing) {
      const d = x - S.dialX;
      if (d && hooks.onDial) hooks.onDial(d);
      S.dialX = x;
      if (L >= T.dialStartPx) { if (Math.abs(Math.atan2(dx, -dy)) <= T.offLineDeg * DEG) S.dialing = false; S.refX = x; S.refY = y; }
      return;
    }
    if (L < T.dialStartPx) return;
    if (Math.abs(Math.atan2(dx, -dy)) > T.offLineDeg * DEG && Math.abs(dx) > Math.abs(dy) * 0.5) { S.dialing = true; S.dialed = true; S.dialX = x; if (hooks.onDial) hooks.onDial(dx); }
    S.refX = x; S.refY = y;
  }

  /** the settle as it stood just before time t, the flick's onset */
  function settleBefore(t) {
    const L = S.settleLog;
    for (let i = L.length - 1; i >= 0; i--) if (L[i].t < t) return L[i].v;
    return L.length ? L[0].v : S.settle01;
  }

  function end(e) {
    if (!S.active || e.pointerId !== S.pointerId) return;
    const t = stamp(e);
    const r = canvas.getBoundingClientRect();
    push(e.clientX - r.left, e.clientY - r.top, t);
    finish(hooks.taw(), false);
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) { }
  }

  function cancelled(e) {
    if (!S.active || e.pointerId !== S.pointerId) return;
    // a pointercancel is a real ending, and it is exactly the fumble a slip is for
    finish(hooks.taw(), true);
  }

  function finish(taw, wasCancel) {
    const fl = flick(), v = fl.v, win = fl.win;
    const calib = (hooks.calib && hooks.calib()) || { max: T.thumbSpeedMaxDefault };
    const cmax = Math.max(T.thumbSpeedMin + 0.05, calib.max || T.thumbSpeedMaxDefault);
    const thumb01 = clamp((v - T.thumbSpeedMin) / (cmax - T.thumbSpeedMin), 0, 1);
    // ⛔ Read everything off the gesture BEFORE reset() empties it. The first
    // version read the brace anchor after, got nothing, and reported a dead
    // centre contact for every shot in the game; and until m3 step 6 the second
    // finger and the slip were read after too, so neither ever fired.
    const settled = settleBefore(fl.onset);
    const knuckled = S.secondFinger, off = S.outsideCanvas;
    S.settle01 = settled;
    const cone = coneDeg();
    // where the thumb LANDED: the samples are trimmed to the jitter window, so on a long hold the first one is not it
    const anchor = S.samples.length ? { x: S.downX, y: S.downY } : null;
    const lastY = S.samples.length ? S.samples[S.samples.length - 1].y : 0;
    const dialed = S.dialed;
    reset();

    if (v < T.cancelBelow) {
      // never a wasted turn. Under the cancel band this was not a shot at all.
      S.lastCancel = { thumbSpeed: v, why: wasCancel ? 'cancel' : 'tooSlow' };
      if (hooks.onCancel) hooks.onCancel(S.lastCancel.why);
      return null;
    }

    /* m3 step 3: the bigger circle would turn a sideways aim drag into a 25 degree shot. A release more than 45 degrees off
       the aim line's forward is no shot at all (step 7: that motion was the dial, and a dial turn then a forward flick reads the flick alone);
       with Bombing on the flick down keeps its meaning */
    const yaw0 = screenYaw(dialed ? win : fl.path), down0 = anchor && lastY - anchor.y > 40 && win.length >= 2 && win[win.length - 1].y > win[0].y;
    if (yaw0 !== null && Math.abs(yaw0) > T.offLineDeg * DEG && !(down0 && hooks.bombingAllowed && hooks.bombingAllowed())) {
      S.lastCancel = { thumbSpeed: v, why: dialed ? 'dial' : 'offLine' };
      if (hooks.onCancel) hooks.onCancel(S.lastCancel.why);
      return null;
    }

    const curv = curvature(win);
    const offset = contactOffset(anchor, taw);
    /* m3 step 7: the aim line is the aim. The flick's own angle no longer steers (snap.fineAngleMaxDeg 0): it feeds the wildness */
    const wild = clamp(Math.abs(curv) / T.kWild + (yaw0 === null ? 0 : Math.abs(yaw0) / (T.wildYawDeg * DEG)), 0, 1);
    // the snap's fine angle: how far the flick pointed off the camera's forward,
    // capped so a snap stays a snap and never becomes a steering wheel
    const fine = fineAngle(win);
    const azimuth = (hooks.aimAzimuth ? hooks.aimAzimuth() : 0) + fine;

    let power01 = thumb01;
    // ⛔ ONE ease curve, and it lives in core/snap.js. The design asks for a
    // single map from thumb speed to launch speed; easing here as well would
    // bend it twice and the replay would disagree with the AI.
    if (knuckled) power01 = Math.min(power01, T.knuckledPowerCap);

    /* BOMBING (DESIGN 8.3). Brace on the taw and snap DOWN the screen, toward
     * yourself, and the marble is lifted and dropped instead of rolled. It is a
     * house rule and it is only legal with your taw inside the ring, so the game
     * layer decides whether this flag survives; the input's job is only to notice
     * that the thumb went the other way. */
    const bomb = !!down0 && !!hooks.bombingAllowed && hooks.bombingAllowed();

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
    // how far the flick pointed off the aim line, in degrees, so the game can say so
    aim.fineDeg = (yaw0 === null ? 0 : yaw0) / DEG;
    aim.softNudge = v <= T.softNudgeTo;
    aim.knuckledDown = knuckled;
    // ⛔ A SLIP IS DECLARED HERE, never pressed. The thumb left the canvas mid
    // snap, which is the digital cousin of a knuckle slipping in the dirt.
    aim.slipped = wasCancel || off;
    aim.coneDeg = cone;
    aim.handedness = S.handedness;
    S.lastAim = aim;
    if (hooks.onAim) hooks.onAim(aim);
    return aim;
  }

  /**
   * Where the flick pointed, relative to straight up the screen, capped, and
   * mapped onto the GROUND.
   *
   * ⛔ A SCREEN ANGLE IS NOT A YAW. The camera looks down at the dirt from about
   * thirty seven degrees, so a marble ten degrees off the shooter's forward line
   * sits sixteen degrees off vertical on the screen. Reading the flick's screen
   * angle straight into the world sent a flick pointed AT a marble six degrees
   * past it, every time, and an aiming driver hit one shot in four. The ground
   * yaw is atan(tan(screen) x sin(elevation)); at top down it is the identity.
   */
  function fineAngle(win0) {
    const y = flickYaw(win0), cap = T.fineAngleMaxDeg * DEG;
    return y === null ? 0 : clamp(y, -cap, cap);
  }
  /** the flick's yaw off the aim on the ground, in radians, uncapped; null when the thumb hardly moved */
  /** m3 step 8: how far a flick went off straight up the screen, where the thumb is. Up the screen IS the aim line (the camera faces it); on the ground the close camera's perspective made the same flick 20 or 60 degrees depending on how far up it ended */
  function screenYaw(win0) {
    const win = motion(win0);
    if (win.length < 2) return null;
    const a = win[0], b = win[win.length - 1];
    if (len2(b.x - a.x, b.y - a.y) < 4) return null;
    return Math.atan2(b.x - a.x, a.y - b.y);
  }

  function flickYaw(win0) {
    const win = motion(win0);
    if (win.length < 2) return null;
    const a = win[0], b = win[win.length - 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    if (len2(dx, dy) < 4) return null;
    // exact where it can be: the two points on the dirt under where the flick
    // began and ended, and the yaw between them, relative to the camera's forward
    if (hooks.groundPoint && hooks.aimAzimuth) {
      const pa = hooks.groundPoint(a.x, a.y), pb = hooks.groundPoint(b.x, b.y);
      if (pa && pb && len2(pb.x - pa.x, pb.z - pa.z) > 1e-4) {
        let yaw = Math.atan2(pb.x - pa.x, pb.z - pa.z) - hooks.aimAzimuth();
        while (yaw > Math.PI) yaw -= Math.PI * 2;
        while (yaw < -Math.PI) yaw += Math.PI * 2;
        return yaw;
      }
    }
    // otherwise the foreshortening alone: screen up is the camera's forward; a flick behind the line is off it whatever the camera
    const screen = Math.atan2(dx, -dy);
    if (Math.abs(screen) > 80 * DEG) return screen;
    const k = hooks.groundFactor ? clamp(hooks.groundFactor(), 0.05, 1) : 1;
    return Math.atan(Math.tan(screen) * k);
  }

  function reset() {
    S.active = false; S.pointerId = -1; S.secondFinger = false;
    S.samples.length = 0; S.settle01 = 0; S.lastSettleHaptic = false;
    S.outsideCanvas = false; S.lastTick = 0; S.spiked = false; S.settleLog.length = 0;
    report();
  }

  function report() {
    if (hooks.onBrace) hooks.onBrace(state());
  }

  function state() {
    // a still thumb sends no events, so the frame loop reads this to keep the
    // clock running; the tick is idempotent and cheap
    if (S.active) tickSettle(now());
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
      S.downX = samples[0].x; S.downY = samples[0].y;
      return finish(taw, false);
    }
  };
}
