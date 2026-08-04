# LOAF 3D — the cat becomes a creature, not a drawing

> This is the 3D TECH layer. The full product plan (essence engine,
> personality, games, engagement, ship path) is **LOAF_PLAN.md** — read
> that first; it is the product SSOT as of 2026-08-04.

> 2026-08-03, Stephen's direction: the flat procedural cat is dead. The pet
> must be 3D, animatable without limit, interactive on screen, and above all
> it must capture the essence of the actual cat that was scanned. This doc is
> the architecture. The scan pipeline (coat reading, meters, grading) stays —
> its output becomes the 3D cat's PARAMETERS.

## The stack (all in-house, all reproducible)

1. **Authoring: Blender 4.0 headless (`bpy`), scripted.** `tools/loaf_cat.py`
   builds the base cat — mesh, armature, shape keys, animation clips — and
   exports `assets/loaf/cat.glb`. No downloaded model: the script IS the
   asset, so every proportion is a parameter we can tune forever, and the
   whole thing is ours (no license questions on the star of the app).
2. **Runtime: three.js** (same import-map pattern as the chameleon 3D).
   SkinnedMesh + AnimationMixer. One cat ≈ a few thousand triangles, one
   texture — phone-cheap.
3. **Essence capture: the coat is a TEXTURE painted at scan time.** The 2D
   renderer's hard-won coat logic (OKLCH palette, white-spotting as a graded
   field, tabby striping, points) transfers directly: instead of painting an
   SVG it paints the GLB's UV map on a canvas. Their cat's colors land on the
   3D body. This is the part that makes it THEIR cat, and it is mostly
   already written.
4. **Body morphs from the scan:** shape keys driven by the reading + tuner —
   CHONK (belly), ear size, muzzle length, tail length, leg stubbiness.
   The tuner stops describing a body and starts sculpting one.

## Animation architecture — "countless" needs three layers

- **Layer 1, clips** (authored in the Blender script, blended by the mixer):
  idle-breathe, loaf-settle, sit, walk, trot, pounce-crouch → pounce,
  groom, sleep-curl, stretch, jump. Adding a clip = adding a function to
  the authoring script; the set grows forever without touching the runtime.
- **Layer 2, procedural (runs on top of any clip):** head/eye look-at that
  tracks the player's finger, tail sine with reactive flicks, ear twitches,
  breathing scale. This is what makes her feel ALIVE between clips.
- **Layer 3, the brain:** a small state machine (rest → wander → stalk →
  play → groom) that picks clips and targets. Toys the player throws are
  targets; petting (raycast stroke on the body) is an interrupt that leans
  her into the touch. This is the Room's engine.

## What appears where

- **The Room and the tuner preview:** the 3D cat, live, interactive.
- **The card:** the scanned PHOTO stays the hero (nothing captures a real
  pet like its own photo) — with the 3D avatar available as an alternate
  card face. ⚖ Director's call which is the default.

## Ship path

- **v0 (tonight):** scripted base cat + rig + idle/tail clips, exported GLB,
  turntable renders READ BY EYE until the silhouette is genuinely cute.
  Cuteness bar: big head, low loaf body, stubby legs, thick tail, huge eyes.
- **v1:** three.js viewer inside loaf.html (tuner preview replaces the flat
  drawing), coat texture painted from the scan DNA, morphs wired to tuner.
- **v2:** the Room — brain, toys, petting, food (needs floor rules — nothing
  dies, gets sick, or leaves).
- Card alternate face + share render after v1.

## Rules that carry over unchanged

- Nothing in the room may die, get sick, or run away. Needs stop at a floor.
- Coat, never breed.
- Chonk is never body condition.
- All gates drive the real thing (reach checks, walked flows, renders read
  by eye) — a green assertion is not a look.
