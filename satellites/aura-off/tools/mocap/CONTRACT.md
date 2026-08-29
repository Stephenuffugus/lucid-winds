# MOCAP BRIDGE — build contract

Turn free, license-clean motion capture into `moves.js` keyframes on our frozen
12-joint rig. One pipeline, three front ends.

```
  CMU ASF/AMC ─┐
  BVH (Mixamo) ─┼──►  TAKE  ──►  retarget  ──►  our 12 joints  ──►  moves.js
  MediaPipe    ─┘   (3D points)               (screen-space deg)     keyframes
```

---

## 0. THE QUESTION THIS BUILD EXISTS TO ANSWER

**Does 3D motion capture survive projection onto a 2D front-facing 12-joint rig?**

Answer it honestly, with rendered frames, not with a green test. The prior going
in — state it, then measure it:

- **Upper-body, front-facing motion should survive well.** Our best moves are
  already 100/0 upper-body gestures and that is what the corpus is full of.
- **Turns will not survive.** When a dancer rotates away from camera, a
  front-projected limb collapses to nothing. Salsa is full of turns.
- **Leg range will clamp hard.** `JOINT_RANGE` is `hL/hR ±40°` and `kL/kR
  −40…+10`. Real dance knee flexion goes far past that. Clamping flattens
  motion, and flattened motion is worse than hand-authored motion.

If the answer is "only the upper body survives", **that is a completely
acceptable result and must be reported as the finding**, not engineered around.
Half a pipeline that reliably delivers arm choreography is worth more than one
that silently produces mush for everything.

---

## 1. LICENSING — the reason these sources and not others

| Source | Terms | Use |
|---|---|---|
| **CMU Graphics Lab Mocap DB** | free; may be copied, modified and **included in commercially-sold products**; may NOT be resold as data | ✅ ship |
| **Mixamo** (Adobe) | free account; **no royalties, unlimited commercial use** in a finished game; may NOT redistribute raw animation files as an asset pack | ✅ ship |
| **MediaPipe Pose** | Apache 2.0 | ✅ tool |
| Traced/rotoscoped video | derivative of the **recording**, separate from the choreography | ⛔ never |

**Credit `mocap.cs.cmu.edu` wherever CMU-derived motion ships.** Put it in the
game's credits when the first CMU-derived move lands, not later.

Two facts worth carrying, because they are commonly got wrong:
- The Copyright Act **excludes "social dance steps and simple routines"** — a
  shrug, a wave, six-seven. Those are free to rebuild.
- But *Hanagami v. Epic*: **"short does not always equate to simple."** A
  complex, fast-paced choreographed sequence can be protected even at ~2s. So:
  meme gestures yes, a professional's routine no. And the **video is always a
  separate copyright from the movement**, which is why we extract from licensed
  mocap or our own footage rather than tracing clips.

---

## 2. THE TAKE — the one intermediate format

Every front end emits this. The retargeter reads only this. Getting a new source
working means writing one parser, never touching the retargeter.

```js
{
  source: 'cmu/60_01',        // provenance, kept for credits + reproducibility
  label:  'salsa',
  fps:    120,
  units:  'cm',               // scale is normalised downstream, not here
  frames: [
    { t: 0.000, p: { /* 15 canonical points, each [x, y, z] */ } },
    ...
  ]
}
```

**The 15 canonical points.** Nothing more — fingers, toes and clavicles are
noise for a 12-joint rig.

```
root  neck  head
lsho  lelb  lwri     rsho  relb  rwri
lhip  lkne  lank     rhip  rkne  rank
```

**Axis convention, fixed:** `+X` is the subject's LEFT as the camera sees it
(screen right), `+Y` is UP, `+Z` is toward the camera. Right-handed. Every
parser normalises into this before emitting — CMU is Y-up but Z-forward differs
by subject, and BVH varies by exporter, so **each parser owns its own
correction** and proves it by asserting a known frame (a standing figure has
`lsho.y ≈ rsho.y` and both well above `lhip.y`).

Positions, not angles, deliberately: MediaPipe gives positions natively, and
ASF/BVH forward-kinematic to positions trivially. One retargeter serves all
three.

---

## 3. THE RIG WE ARE TARGETING — frozen, read `src/engine/rig.js`

```js
JOINTS = ['rot','bob','lean','head','sL','eL','sR','eR','hL','kL','hR','kR']
```

Geometry (`RIG` in rig.js): viewBox `0 20 120 200`, feet at `(60,200)`, hips at
`(60,118)`, shoulders at `±13, -42` from the poise anchor, `upperArm 26`,
`foreArm 24`, `thigh 41`, `shin 40`.

**Conventions, from the rig author — these decide whether output is right or
mirrored:**
- Every value is **degrees of clockwise rotation in SVG screen space** about
  that joint's own anchor. There is **no left/right mirroring**: `sL` and `sR`
  are the same rotation applied to two different anchors.
- Arms wide = `sL` positive, `sR` negative. Arms crossed = `sL` negative,
  `sR` positive.
- **Elbows and knees hinge one way** — negative bends.
- `bob` positive is **DOWN**. `rot` pivots about the **feet**.
- **Rest pose is all zeros**, and a joint omitted from a keyframe IS zero.

**Ranges are hard limits** (`JOINT_RANGE`), and the leg ones are tight:
`rot ±90 · bob −20…60 · lean ±20 · head ±30 · sL/sR ±180 · eL/eR −150…30 ·
hL/hR ±40 · kL/kR −40…10`.

⛔ **Clamping is a measurement, not a silent fix.** Report, per take, what
fraction of frames clamped on each joint. A move that clamps 40% of its frames
on `kL` did not convert — it got flattened, and the honest output is a warning,
not a keyframe.

---

## 4. RETARGET — positions to our twelve

Work in the **projected XY plane** (drop Z), because that is literally what our
rig is: a front view. Derive angles from projected bone vectors, never from
source Euler angles — Euler order and axis conventions differ per format and are
the classic way to produce a plausible-looking mirrored mess.

Per frame, roughly:
- `sL` from the `lsho → lelb` vector, measured against the rig's rest direction
  for that bone; `eL` from `lelb → lwri` **relative to the upper arm** (it is a
  hinge, so it is the included angle, signed one way).
- Same for the right, and for `hL/kL`, `hR/kR`.
- `lean` from the `root → neck` vector off vertical. `head` from `neck → head`
  relative to the torso.
- `bob` from root height relative to that take's own standing baseline, scaled
  into rig units. `rot` only for genuine whole-body roll about the feet — a fall
  — **not** for a turn (see §5).

**Normalise scale per take** off the subject's own limb lengths; never assume
centimetres.

### Facing, and what to do about it

Track facing from the shoulder line's Z-extent. When the subject turns past
about **40° off camera**, the front projection stops meaning anything.

Do NOT try to be clever. Options in order of preference:
1. **Flag the frames** and let the caller trim the take to its front-facing span.
2. If a whole take is off-axis, **reject it with a clear reason.**

A silently accepted turn produces limbs that shrink to nothing, which reads as a
bug in our renderer rather than a limitation of the projection.

---

## 5. KEYFRAME REDUCTION — 120fps to 4–7 frames

Our move format is `frames: [{t:0,...}, …, {t:1,...}]`, strictly increasing,
first `t:0`, last `t:1`, and **`dur` 1400–2200ms** because the culture's own rule
is that exchanges are seconds, not routines.

So a take must be **cut to a loop or a phrase first**, then reduced. Fit a
piecewise-linear curve to each joint and keep the fewest knots that stay within
a stated error tolerance (Ramer–Douglas–Peucker on the joint tracks is fine).
Report the residual error in degrees per joint so quality is visible.

**The output must survive our own pipeline**: feed it through `anim.sample()`
and `rig.applyPose()` and it has to look like the source. That round trip is the
test, not the parser's unit tests.

---

## 6. WHAT SHIPS

```
tools/mocap/asfamc.js     CMU ASF/AMC  → TAKE   (parser + forward kinematics)
tools/mocap/bvh.js        BVH          → TAKE   (Mixamo and most mocap exports)
tools/mocap/retarget.js   TAKE → our 12 joints + keyframe reduction
tools/mocap/cli.js        fetch/cache, convert, and render a contact sheet
tools/mocap/cache/        downloaded source motion (gitignored, never committed)
```

Zero runtime dependencies — this is tooling, it never ships inside the game.
Nothing here may modify `src/`. A converted move is **proposed output a human
reviews**, printed or written to a scratch file, never appended to `moves.js`
automatically.

---

## 7. VERIFY BY LOOKING

A green parser test proves nothing about whether a dance survived projection.

Convert a real CMU salsa take, put it on the real rig, render a contact sheet of
sampled frames, and **open the image.** Name what you see. Then do it for a
motion you expect to fail — a take with a turn in it — and confirm it fails
loudly rather than quietly.

Report what you SAW, not what you wired.
