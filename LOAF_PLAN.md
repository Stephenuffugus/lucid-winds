# LOAF — THE PRODUCT PLAN
# The virtual copy of YOUR cat. Product SSOT — 2026-08-04, planned with Stephen.
# LOAF_3D_PLAN.md is the 3D tech layer under this doc. loaf.html is the app.

> Stephen's brief (Aug 04): target LOAF hard — "this could be massive among cat
> lovers." Build the engine that accurately translates someone's cat from a
> picture into a virtual version of itself. Capture personality via questions
> and/or the photos. Level it up, gain abilities. Toe beans matter. Games where
> the cat stalks/attacks (fishing), a laser game, a rainbow yarn ball. THE MOST
> IMPORTANT PART: capture the cat's personality and get owners engaging with
> the virtual version of their cat regularly.

---

## 0. THE THESIS

Every cat app on the market scans a cat and tells you what it is (usually a
wrong breed). Nobody has built the app where the scan produces a living,
animated copy of YOUR cat that you then hang out with. That's the product:

**Scan your cat → meet your cat → play with your cat every day.**

The moat is *essence capture*: if the owner looks at the 3D cat and feels
"that's her," everything downstream (games, levels, sharing) compounds. If
they don't, nothing downstream matters. So the plan front-loads the Essence
Engine and gates every phase on the **Two-Cat Test**: show the owner their
cat's avatar next to a stranger's cat's avatar — they must recognize theirs
instantly, without labels.

### Hard lines (inherited, non-negotiable)
- Nothing in the room dies, gets sick, or runs away. Needs stop at a floor —
  a reason to do something, never a punishment for being away.
- Coat, never breed. (~90% of cats have no correct breed answer.)
- Chonk never reads as body condition.
- No streak-breaking punishment. "Days together" only counts up.
- The scanned PHOTO stays the hero of the card (⚖ standing Director's call).
- Every visual milestone is LOOKED at (turntables/screenshots read by eye),
  not just asserted green.

---

## 1. WHAT EXISTS TODAY (foundation, live behind wolfden)

- Scan flow: photo → on-device quality gates (asymmetric light curve,
  native-res Laplacian focus) → coat reading (`readCatFromPhoto`) → DNA →
  card mint with 6 stats (CHONK/LOAF/VOID/MENACE/ZOOMIES/FLOOF), rarity as
  self-percentile, posture shelf (owner-filed), name sheet, PNG export/share.
- DNA + tuner: pattern (solid/mackerel/classic/spotted/ticked/tortie/calico/
  point), white styles with graded field, Lab-space palette, sliders/nudges.
- Room (2D): toys, food, poop scoop, needs-with-floors, daily ability by lead
  stat, XP scaffold (`xpNeeded`, `grantXP`) already in the code.
- 3D cat: `tools/loaf_cat.py` — parametric Blender pipeline (standing
  quadruped, 16-bone rig, CHONK shape key, Idle/Walk/LoafSettle/TailPlay
  clips) → `assets/loaf/cat.glb` (1.06MB, needs decimation) + three.js viewer
  in the tuner with `LoafCat3D.{setCoat,setChonk,play}`.
- Pending on Stephen: grader proxy endpoint + key (~$0.0026/scan, Haiku
  vision); cards stamp DEMO GRADE until then.

---

## 2. THE ESSENCE ENGINE (photo → virtual cat)

The pipeline that makes it THEIR cat. Six stages; owner confirmation is the
last word at every step.

### 2.1 Guided intake (2 photos + 2 optional)
- **Face shot** (framing guide overlay: "eyes about here") → eye color, ear
  set, muzzle, face markings.
- **Side body shot** → coat pattern, white distribution, build, tail, floof.
- **Back shot (optional — Stephen, Aug 15: multi-view capture)** → spine
  stripe, back markings, tail pattern; feeds the body-space painter's dorsal
  region directly. Sold as "get her back stripes right."
- **Toe beans (optional, sold as a bonus)** → bean color chart. Cat lovers
  will do this one for fun alone.
- Existing quality gates run per shot. Keep the single-photo path working —
  extra shots refine, never block.
- ⛔ Multi-view stays MEASUREMENT, never photogrammetry: three phone shots
  meshed into geometry lands in the uncanny valley; three shots feeding the
  parametric cat's texture + morphs stays cute and stays THEIRS. (Decision
  recorded Aug 15; proven same day by the critter satellite's
  measure-the-input approach.)

### 2.2 Segmentation (new — isolate the cat from the room)
Today's reader samples the whole frame; a cat on a busy sofa pollutes the
palette. Fix with an in-browser mask, lazy-loaded only during scan:
1. **Primary: MediaPipe ImageSegmenter (DeepLab-v3, Apache-2.0)** — runs in
   the browser via `@mediapipe/tasks-vision`, and its class list includes
   `cat` directly. Mask → all color sampling happens inside the cat only.
2. **Fallback: ormbg (Apache-2.0, onnx-community)** general background
   removal via ONNX Runtime Web, when DeepLab misses (weird angles, loafs).
3. **Last resort:** current center-crop heuristics (never worse than today).
- ⛔ License traps checked: RMBG-1.4/2.0 = non-commercial, @imgly = AGPL.
  Both excluded. Apache-2.0 only.
- Decision between 1 and 2 is EMPIRICAL: run both against Stephen's photo
  corpus (section 9) and look at the masks.

### 2.3 Region reading (mask → DNA)
- Split the mask by geometry (head third, torso, leg columns, tail) and
  sample per region: head color vs body color (points!), leg/paw white
  (socks!), chest white (bib), belly lightness.
- Pattern signals: edge-orientation energy inside the torso region (tabby
  striping), hue variance (tortie/calico), extremity-vs-core luminance delta
  (colorpoint), mask-interior white blobs (white spotting grade).
- Eye color: iris sampling inside the face shot's eye region.

### 2.4 The grader (Haiku vision, structured output)
Pixels can't reliably separate tortie/calico/tabby-with-white; a vision model
can. Extend the existing planned grader schema to return:
`pattern, whiteStyle, whiteGrade, eyeColor, furLength, earSize, muzzleLength,
build, beanColorGuess` + the flavor/title it already writes.
- Structured outputs (`output_config.format`) — no JSON-parsing hacks.
- ⛔ known traps already in memory: `fetch()` resolves on 4xx/5xx; refusal is
  HTTP 200 with `stop_reason:'refusal'`.
- Cost unchanged ≈ $0.0026/scan at 768px. On-device reading remains the
  offline/demo fallback, so the app never breaks without the endpoint.

### 2.5 Owner confirmation = the tuner, reframed
After the scan, show the 3D cat and ask one question: **"Is this your cat?"**
with the tuner as the fix-it tool. The owner is the final authority — this
kills the 1-star "you got my cat wrong" review class AND is an ownership
moment (they sculpted her). Every tuner change repaints the live 3D cat.

### 2.6 Coat → 3D texture (the key new tech)
The 2D coat painter's logic (OKLCH palette, graded white field, tabby
striping, points) becomes a **runtime UV texture painter**:
- In Blender (authoring time), bake three static maps for the GLB:
  **POSITION map** (object-space XYZ per texel), **REGION-ID map** (head /
  ears / muzzle / torso / belly / legs / paw-pads / tail), **AO map**.
- At runtime, the painter walks a 512×512 canvas once per DNA change: for
  each texel, read position + region, compute coat color in BODY SPACE
  (stripes = f(position along spine), socks = f(height on leg region), points
  = f(distance from core), beans = paw-pad region). Write to canvas →
  `CanvasTexture` on the cat material.
- Painting in body space via the position map makes patterns SEAM-FREE — UV
  islands don't matter, which frees us to Smart-UV the voxel-remeshed body.
- Tuner drags repaint at 256px throttled, finalize at 512px. One-time cost,
  a few ms — phone-cheap.

### 2.65 "Make It Yours" editor (Stephen, Aug 15 — customization is first-class)
The tuner is the fix-it tool at confirmation; this is its grown-up sibling,
available any time after: the owner goes in and sculpts until it is HER cat.
- **Morph sliders**: chonk, earSize, muzzleLength, tailLength, legLength,
  floof (the 2.7 shape keys, exposed with cat-lover labels).
- **Palette tuning**: the existing Lab-space palette nudges.
- **Markings painter**: paint white spots / patches / a chin blaze directly
  on the live 3D cat. Tech is ALREADY section 2.6's body-space painter — a
  brush is just a spherical falloff written into a markings layer of the
  same canvas (position-map lookup per texel). No new pipeline.
- UI pattern (swatches, brush sizes, undo stack) lifts straight from
  `satellites/create-a-critter/` which shipped Aug 15 and is the proven
  kid-simple version of exactly this toolbar.
- Slots into **Phase 1** (it is the confirm-screen tuner, extended) with the
  markings painter allowed to slip to Phase 4 if Phase 1 scope creeps.

### 2.7 Body morphs + eyes
- Shape keys (Blender script additions): `chonk` (exists) + `earSize`,
  `muzzleLength`, `tailLength`, `legLength`, `floof` (silhouette puff), and
  `toeSplayL/R` (front paws, for the bean toy).
- **Eyes become separate meshes** (today they're joined into the body): own
  material for iris color from the scan, pupil as a texture/shader offset so
  it can DILATE — pupil dilation is the single best emotion channel a cat
  has (wide = excited/playful, slit = content). Blink via eyelid morph.
- Floof rendering on phones: no fur shells. Fresnel rim light + slight
  noise displacement scaled by the floof morph + painted fur-direction
  strokes in the texture. Stylized reads better than failed realism.

---

## 3. THE PERSONALITY ENGINE

Grounded in real research: the **Feline Five** (Litchfield et al. 2017,
PLOS ONE, N=2,802 pet cats) found five reliable factors — Neuroticism
(skittishness), Extraversion (outgoingness), Dominance, Impulsiveness
(spontaneity), Agreeableness (friendliness). We rename them into LOAF's
voice and keep them separate from the card's six BODY stats:

| LOAF axis | Feline Five | High looks like | Low looks like |
|---|---|---|---|
| **BOLDNESS** | inv. Neuroticism | greets the door, sits center-room, approaches toys instantly | watches from cover, stalks longer before committing, peeks out after noises |
| **CURIOSITY** | Extraversion | investigates anything new, wanders, windowsill patrol | picks the sunbeam, naps deeper, ritual routes |
| **SASS** | Dominance | demands food loudly, knocks things off shelves, displeased tail-flicks | polite waiting, quiet blinks |
| **CHAOS** | Impulsiveness | random zoomies, mid-groom freeze, 3AM sprints | deliberate, predictable, dignified |
| **VELCRO** | Agreeableness | follows your finger, leans into pets, sits on the virtual laptop | affection on HER terms — which makes an earned headbutt feel huge |

### 3.1 Capture
- **The quiz (onboarding, ~10 scenario questions, 2 per axis):** concrete
  situations with illustrated answers, never abstract adjectives. "The
  doorbell rings: (a) gone, under the bed (b) must inspect the visitor
  (c) does not wake up." Fun enough to be content in itself — this is a
  thing cat owners already love doing.
- **Ongoing owner filings:** the posture shelf already has the owner tap
  "which shape is she today" — postures + occasional one-tap prompts ("did
  she actually do this today?") nudge axes over time.
- **Photo hints:** the grader may SUGGEST ("this face reads: unimpressed"),
  flavor only. ⛔ Personality never changes silently from app usage — only
  from explicit owner input. It's their cat; they file the truth.

### 3.2 The law: personality must be VISIBLE
Every axis must drive at least two behaviors the owner can SEE, or it gets
cut. Wiring:
- **The Room brain** (section 5): state weights. Bold cats approach thrown
  toys immediately; low-BOLDNESS cats do the long gorgeous stalk.
- **Animation selection:** dignified cats slow-blink; CHAOS cats zoomie.
- **Game modifiers:** stalk length in laser, splash-commit in fishing,
  bat frequency in yarn (section 6).
- **Copy:** toasts, card flavor, daily mood text all keyed to the profile.
- **Card back:** the temperament chart (radar/bars) becomes a card-back
  panel — shareable, comparable between friends' cats.

---

## 4. THE ANIMATION STACK ("countless animations" = 3 layers)

- **Layer 1 — authored clips** (Blender script; each clip is a function, the
  set grows forever). Roadmap in priority order:
  - P1 (alive): Sit, SleepCurl, Stretch, Groom (lick paw → wipe face),
    SlowBlink, TailFlick
  - P2 (games): PounceCrouch, ButtWiggle, Pounce, BatL/BatR, ZoomiesSprint
  - P3 (delight): BellyUp, **Knead (making biscuits)**, WetShake, Chatter
    (bird-window ekekek), Flop, JumpUp/JumpDown
- **Layer 2 — procedural, on top of any clip:**
  - Head/eye look-at tracking the finger (or camera when idle — she should
    look AT you).
  - **Spring-damper tail**: hand-rolled on the existing tail1-4 bones
    (~40 lines, spring toward the clip pose, velocity from motion). Zero
    dependencies. Reference implementations if we want them later:
    wiggle.three.tools, threeZboingZboing — but the hand-roll comes first
    (no license questions on the star of the app).
  - Ear twitches, breathing scale, blink scheduler, **pupil dilation** tied
    to brain state (dilate on stalk/play — it's the "tell" in the fishing
    game).
  - **IK paw reach** (three.js `CCDIKSolver`, ships in three/examples) for
    batting the yarn ball and pressing toe beans.
- **Layer 3 — the brain:** utility-based state machine
  (sleep / loaf / groom / wander / windowsill / play-solicit / zoomies),
  weighted by personality + needs + time of day. The killer state is
  **play-solicit**: she picks up a toy, drops it at the front of the room,
  and looks at you. The CAT invites the PLAYER. That's the retention hook —
  reciprocity, not a notification badge.

### Asset budget
- Decimate in the Blender script (~8-12k tris) + **gltfpack/meshoptimizer**
  (MIT) with three.js `MeshoptDecoder` → GLB target <400KB.
- Baked maps (position/region/AO) as KTX2; the coat texture itself is a
  runtime canvas so it ships as zero bytes.

---

## 5. THE ROOM v2 (the 3D home)

Swap the 2D canvas cat for the GLB cat; keep everything already ruled:
needs with floors, food, scoop, toys, the daily ability. Add:
- **Petting:** raycast stroke on the body → she leans into it (procedural
  spine bend toward touch), purr audio + haptic purr
  (`navigator.vibrate` pattern on Android; iOS has no vibrate API in
  web — audio + visual purr shimmer fallback).
- **Toys are physical:** thrown toys arc, the brain targets them.
- **Decor unlocks** (Bond levels, section 7): rug, cat tree, window,
  fish tank, boxes. The room slowly becomes THEIR room.
- **The box law:** place a cardboard box → she must eventually sit in it.
  Too-small box = overflow loaf. This is a shareable moment, not a game.
- **Sound:** purr loop, meow bank pitch-shifted per cat (each cat gets ITS
  voice — pitch from size/CHONK, length from SASS), chirp/chatter at the
  window. Web Audio, all synthesized or recorded in-house.

---

## 6. THE GAMES

**Design law: the CAT plays; you facilitate.** You are never controlling the
cat — you're the human in the relationship: you hold the laser, twitch the
lure, roll the yarn. Skill = playing WITH her well. This is what makes these
games emotionally different from generic minigames with a cat skin.

### 6.1 LASER (ship first — cheapest, highest fidelity to real life)
- Your finger IS the dot (raycast to floor/walls). The brain stalks it:
  still dot → slow-motion stalk; moving dot → chase; dot stops right after
  a sprint → POUNCE.
- Scoring is an **engagement meter**, not points: it rises when you play
  like a good cat owner — vary speed, pause behind furniture, let her
  "catch" it sometimes — and sags when you just swirl the dot. (This is
  real cat-play technique; the app quietly teaches it.)
- Sessions always END on a catchable dot — the kind ending, enforced.
- Personality: BOLDNESS shortens stalks, CHAOS adds mid-chase zoomies,
  low-BOLDNESS cats give you the long cinematic butt-wiggle.
- Pays: Bond XP + engagement grade ("She had a GREAT time").

### 6.2 FISHING (Stephen's stalk-and-attack — ship second, adds collection)
- A pond/koi tub scene. Fish shadows drift; your finger twitches the lure;
  a fish rises. She crouches at the edge, tail-tip flicking. **Her pupils
  dilate — that's the tell.** Release the lure at the right moment → pounce,
  splash, paw-slap with spread toes (toe-bean moment built in).
- Catch → the fish goes in the **Fish Book** (species with rarity, same
  self-percentile philosophy as plates — every cat's book fills at the
  same rate, by construction).
- Personality: CHAOS cats occasionally belly-flop in — a miss, but you get
  the WetShake clip, which is better than the fish.

### 6.3 RAINBOW YARN (ship third — physics toy)
- Verlet rope + ball. Flick to roll it; she bats it back (IK paw + Bat
  clips) — pong-with-a-cat. The yarn unravels a rainbow trail; the scoring
  fantasy is "biggest, most beautiful tangle," graded by trail coverage.
- End state: cat wrapped in rainbow yarn, deeply unrepentant. Share button
  right there.

### 6.4 TOE BEANS (the affection toy — not a challenge, the calm dessert)
- **Bean Chart:** bean color defaults from coat genetics (black cats →
  black beans, gingers → pink, torties → mixed jelly beans), confirmed or
  corrected by the owner from the optional paw photo. Beans render on the
  paw-pad texture region AND as a "Certified Bean Chart" card-back panel.
- **Bean Press:** she rolls belly-up and presents paws; camera comes close;
  gentle press on a pad → toes splay (morph), purr rumble (haptic on
  Android), slow blink. Press-and-hold → kneading. No score, no timer, no
  fail state. This is the toy people open when they've had a bad day.
- Later: a reflex game variant (paws jab through box holes — whack-a-bean).

### 6.5 Later pool (designed, not scheduled)
Bird window (passive Neko-Atsume-style visitors + chatter animation; check
what visited = daily pull), treat toss (physics catch), butterfly chase
(outdoor laser variant), catch-the-roomba.

---

## 7. BOND, LEVELS, ABILITIES

Frame it as **BOND, not cat-level** — the cat is already perfect; what grows
is your bond. (Nobody wants to be told their cat is level 1.)

- **Bond XP sources:** daily ritual (below), game sessions, petting,
  posture filings, growth-check re-scans, trick training.
- **Bond levels unlock:** toys → games → decor → animation clips (lvl N: she
  learns the Flop) → card frame upgrades → tricks.
- **Tricks:** trained in short daily sessions (simple timing taps ≈ clicker
  training), 3 sessions to learn, then performable on command in the Room
  forever. ⛔ No forgetting, no rust — floors, not decay.
- **Abilities:** the daily card ability (exists) stays; the ability pool
  branches by lead personality axis — a high-CHAOS cat unlocks 3AM Sprint
  variants, a high-VELCRO cat unlocks Therapy Purr. Abilities are flavor +
  game modifiers, never gates.
- **"Days together"** counter on the card back. Only ever counts up.

---

## 8. THE ENGAGEMENT LOOP (the most important part)

**Daily ritual (~2 minutes, all carrot, no stick):**
1. She greets you (personality-flavored greeting).
2. One need to tend (bowl / brush / scoop — needs sit at their floor,
   waiting, never rotting).
3. **Today's mood** (personality-weighted roll: Playful / Sleepy / Chaotic /
   Affectionate) — changes room behavior + which game gives bonus Bond XP.
4. File today's posture ("what shape is she right now?" — a glance at the
   real cat; the app keeps pointing you AT your actual cat).
5. One play session of anything → daily Bond bonus.

**Weekly:** growth-check re-scan (new photo → plate history → the existing
self-percentile rarity does its thing), new trick session, bird-window
tally.

**Collections (variable-reward pulls, all floor-safe):** Fish Book, bird
visitors, posture compendium (15 shapes to file), toy chest, decor.

**Social/share (the viral surface):**
- Card PNG export exists. Add **5-second clip capture** — canvas
  `captureStream()` + `MediaRecorder` → webm/mp4 → `navigator.share`. A
  video of YOUR cat's avatar doing the biscuits is the single most
  shareable artifact this app can produce.
- Multi-cat households are FREE (huge share of cat lovers have 2+; charging
  per cat caps virality). Cats parallel-play in the room; interaction later.
- Compare card backs (temperament charts) with friends.
- Parked: fake-AR share shot (getUserMedia camera feed behind the 3D cat +
  gyro parallax — "she's on your actual couch") — no WebXR needed.

**Monetization posture:** nothing while testing behind wolfden. Obvious
later lanes, all cosmetic/physical, none gating the cat: decor packs, card
frame styles, physical card prints, plush. Never: energy, timers, per-cat
fees, anything that makes the cat worse.

---

## 9. WHAT STEPHEN CAN SUPPLY (he offered — this is the ask)

1. **The photo corpus (the big one): 30-50 real cat photos** spanning:
   solid black INDOORS (the acid test for the light curve), white, grey,
   ginger tabby, brown mackerel, classic swirl tabby, tortie, calico,
   colorpoint, tuxedo, high-white van, longhair vs shorthair, kitten,
   chonk, loaf pose, weird angles, busy backgrounds. This corpus decides
   the segmentation model (2.2), calibrates the region reader (2.3), and
   seeds the grader eval. Cats of people he knows = real Two-Cat Tests
   with real owners.
2. **Toe bean close-ups**, a few colors (pink / black / mixed).
3. **Short videos** of stalk-pounce, kneading, wet shake, window chatter —
   animation reference to eye-match the clips against.
4. **3D models: not needed for shipping.** The Blender script IS the asset
   (every proportion ours, zero license questions on the star of the app).
   Stylized cat art / model screenshots as PROPORTION REFERENCE are
   welcome; downloaded rigged models would be reference-only, never
   shipped. Don't buy anything.

---

## 10. SHIP PATH (each phase playable behind wolfden, walked by eye)

- **Phase 1 — "It's MY cat" (Essence):** UV + baked position/region/AO maps
  in the Blender script; runtime texture painter; new morphs; separate eyes
  with iris color; segmentation in the scan; grader schema extension;
  confirm-screen reframe; decimate+gltfpack.
  **Exit: Two-Cat Test passes on the photo corpus.**
- **Phase 2 — "It's ALIVE" (Presence):** look-at, spring tail, blink/pupil
  scheduler, P1 clips, Room brain v1 with the 3D cat replacing the 2D one,
  petting + purr.
  **Exit: 60 seconds of idle Room is genuinely watchable. Filmed, looked at.**
- **Phase 3 — "Play WITH her" (First games):** Laser + Bean Press + Bond XP
  wiring + daily ritual v1.
  **Exit: a full daily ritual takes ~2 min and ends with you smiling.**
- **Phase 4 — "Come back tomorrow" (Depth):** personality quiz + brain
  weights + moods + Fishing + Fish Book + trick training + P2/P3 clips.
  **Exit: personality visibly changes two cats' behavior side by side.**
- **Phase 5 — "Tell your friends" (Spread):** clip capture/share, yarn game,
  multi-cat, temperament card back, decor. Then the gate comes off wolfden.

One phase at a time, single-variable, per the house rules. Phases 1-2 are
where "massive among cat lovers" is won or lost; everything after is
compounding.

### Phase 6 — BISCUIT (the dog, Stephen Aug 15) — ⛔ gated on cat v1
Stephen's call: "we should probably make a dog version too." Recorded here so
it shapes architecture NOW but starts NO code until the cat passes the
Two-Cat Test and ships through Phase 5:
- **Same app, species toggle** — not a second app. Everything species-shaped
  becomes a profile: `tools/loaf_cat.py`'s proportions become parameters of a
  species config (skeleton ratios, ear/muzzle/tail ranges, posture set), the
  coat engine transfers nearly whole (mixed-breed dogs are ALSO classified by
  coat color, and "what breed is my mutt" has the same wrong-answer problem
  the cat research found), and the Room/games/bond stack is species-blind.
- New per-species content: posture shelf (play-bow, sploot, head-tilt...),
  personality vocabulary, bark/boof audio set, dog games (fetch replaces
  laser as the anchor).
- Naming: LOAF stays the app; the dog is a resident, not a rebrand.
- Why the gate: the moat is essence capture, and splitting focus before one
  species nails the Two-Cat Test risks shipping two mediocre pets instead of
  one uncanny one.

---

## 11. TOOL DECISIONS (researched 2026-08-04)

| Need | Choice | Why |
|---|---|---|
| Cat segmentation in browser | MediaPipe ImageSegmenter / DeepLab-v3 (Apache-2.0) | has an actual `cat` class, WASM, lazy-loadable |
| Fallback bg removal | ormbg via ONNX Runtime Web (Apache-2.0) | commercial-safe; ⛔ RMBG = non-commercial, @imgly = AGPL |
| Pattern/eye/floof truth | Haiku vision grader, structured outputs | ~$0.0026/scan; pixels can't split tortie/calico reliably |
| Coat on the 3D body | Runtime canvas painter over baked position+region maps | seam-free body-space patterns, zero shipped texture bytes |
| Secondary motion | Hand-rolled spring-damper on tail/ear bones | ~40 lines, no deps; wiggle.three.tools / threeZboingZboing as reference only |
| Paw IK | three.js CCDIKSolver (examples) | already in our import-map pattern |
| GLB size | Blender decimate + gltfpack/meshopt (MIT) | 1.06MB → <400KB |
| Haptics | navigator.vibrate purr patterns (Android) | iOS web has none — audio purr fallback |
| Share clips | canvas captureStream + MediaRecorder | the viral artifact |
| Personality model | Feline Five (Litchfield 2017, PLOS ONE) | real research, N=2,802, maps cleanly to visible behavior |
| Single-image 3D reconstruction | ⛔ NOT USED | server GPUs, license murk, uncanny output; parametric + texture is phone-cheap, stylized, and ours |
