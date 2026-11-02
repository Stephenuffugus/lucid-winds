# LOAF BUILD PLAN (2 Nov 2026) — Fable with Stephen, from Astra's pack v1

The builder works from this file. LOAF_PLAN.md stays the product SSOT (thesis,
hard lines, games as designed). This file is the ORDER and the TESTING LAW.
Astra's pack: /workspaces/loaf-astra-v1/pack/ (not in git; vault release
astra-loaf-pack-v1-20261102). Its three docs are copied to docs/briefs/loaf/astra-v1/.

## The one sentence

Loaf sells on one moment: the owner sees the 3D cat and says "that's her".
Today it does not happen. Everything else in the app already exists in some
form, so the build is likeness first, then make the existing things readable,
then the return loop, then the store. Four milestones. Nothing else before Play.

## What I saw (Fable, by eye, 2 Nov)

- Barthalomew's render is a generic dark cat with a pale bib, giant round eyes
  and a pink nose. The photo is a lean tuxedo with narrowed eyes, an irregular
  white collar, a sharp black and white muzzle line and white hind feet.
- Oreo's render is brown with evenly spaced parallel bars and the same giant
  eyes. The photo is a brown tabby with a brow fork, pale eye rims, and stripes
  that change width and direction. Both renders share one face.
- The two cat perch photo produced one blended cat. Astra is right: that is a
  worse first impression than asking once.
- The room is a violet void; a black cat has no edges in it.
- Astra's art is ready and consistent: three room light sets, 16 furnishings,
  five frames, the card back, every icon, nine fish, three paw plates, the
  identity set. Art is not the bottleneck. Likeness and grounding are.
- The games (laser, pond, beans, yarn, box, tricks, visitor, ritual, poem, card
  back) all exist in loaf.html and run. They are hard to read, not missing.

## THE TESTING LAW (Stephen, 2 Nov: "what actually needs tested when")

What burned usage before: 22 probe scripts in tools/loaf_*probe.mjs, each one
a headless Chrome with software GL loading a 715 KB GLB, run per tweak, then
every screenshot read by an agent. That stops.

| When | Run | Cost | Nothing else |
|---|---|---|---|
| Every step, before its commit | `node loaf_check.mjs` (node only, no browser, under 2 s: syntax of both blocks, ids, 48 px, hard lines, save and need rules on the real code) | seconds | no probe, no walk |
| A step that changed what a screen looks like | ONE screenshot of THAT screen, shot once after all the step's edits, with the single matching probe (`tools/loaf_laserprobe.mjs` for the laser, etc.). Read it. Name what is wrong before Stephen does. | ~1 min Chrome + 1 image | not three widths, not the full set |
| End of a milestone | `node scripts/loaf_fullwalk.mjs` once (5 screens) + Stephen on the Pixel | ~2 min + 5 images | once, not per fix |
| Before Play | offline cold launch once, twa_ready once, the Two Cat Test with real owners (humans, Stephen's) | one run each | |
| Never | redwatch, mutants, review agents, lanes, workflows, "confirming" a green by re-running it, rerunning a probe after a copy change, screenshot sets | | |

A non-visual step (save, copy, store files) gets the node check only.
Stephen on his Pixel is the review. Big tests happen at milestone ends, after
things are built, not while they are being built.

## The build

Sizes: S hours, M a session, L more than one session. Each step ends with ONE
commit, one line in START-HERE, and the law above. The builder may reorder
inside a milestone, never across one.

### Milestone A — "That's her" (likeness; the whole bet)

Exit: Stephen looks at ONE contact sheet of blind same-coat pairs
(Barthalomew beside a stranger tuxedo, Oreo beside a stranger brown tabby,
neutral light, same pose, no labels) and picks his cats in under three
seconds, before and after one correction. Then the Two Cat Test with other
owners (below). If A fails, nothing after it is built until it passes.

| # | Step | Where | Size | The one look |
|---|---|---|---|---|
| A1 | Room grounding first, because the recognition test needs neutral light and a black cat needs edges. Map Astra's floor (repeat UV, 0.8 m per tile, four boards per repeat), the back wall once, the window as an alpha decal (never a second light). Three light sets by local time: day, dusk, night. Replace the rug disc with a floor plane, keep the contact shadow, raise the key light to neutral, side fill on the jaw. Room gradient background goes. | loaf.html 3D module: `floor` ~5625, lights ~5609, `roomOpen` ~7668, `ensureRoomProps` ~6419. Assets: pack c_room floor_*/wall_*/window_* | M | room, night light, void-black cat |
| A2 | Subject chooser. When the MediaPipe mask holds two or more cat blobs, show the photo with the biggest blob lit and the rest dimmed: "Tap the cat to meet." Crop and reselect allowed. All sampling stays inside the chosen blob. Never merge two blobs. Single blob skips the step. | `segMask` / `readCatFromPhoto` ~3388, MediaPipe loader ~3352, scan flow ~1733 | M | the both-perch photo with Oreo lit |
| A3 | Face. Eyes smaller by default and a lid parameter (0 round, 1 narrowed) painted into the eye texture as a coat-coloured upper band, so no rig rebuild. Muzzle: a white muzzle region with a hard edge option (Barthalomew's line), separate from the bib. Tabby: brow fork and cheek lines painted in the head region; flank stripes get width and direction noise from the existing fbm so no two bars match. Pale eye rims for tabbies. | `paintEyes` ~6015, `paintCoat` ~5865 (head and muzzle regions from morphs.json), `sculpt` ~6170 (`eyeSize`) | L | Bart portrait pair and Oreo couch pair, same angle |
| A4 | Paws and reversible corrections. Per paw whites, left and right shown separately, never inferred for the hidden side. A correction sheet after the scan: "Does this look like her?" with chips (white muzzle, white collar, socks FL FR HL HR, chin, brow fork, eye colour, narrowed eyes), each one a toggle that repaints live and undoes. Corrections save with the card and survive a rescan (rescan previews the difference beside the saved markings; cancel keeps the old cat). | `PAWAT` ~5898, `d.socks`, DNA fields `migrateDNA` ~2116, the tuner chips | L | the sheet with two chips on |
| A5 | The blind pair sheet: a tiny script that renders two cats side by side from two photos at the same angle under room light and writes one PNG. This is a LOOK tool, run once per candidate, not a gate. | scripts/loaf_pair.mjs (new, from loaf3d_photocheck.mjs) | S | the sheet itself |

Blender is on the box (`~/.local/bin/blender`, tools/loaf_cat.py). Use it only
if A3 cannot get narrowed eyes from the texture; a rig rebuild is its own L.

### Milestone B — "Meet her" (the first three minutes)

Exit: Stephen scans Barthalomew on his Pixel, meets him, pets him, names him,
and never reads a number he did not ask for. One walk contact sheet.

| # | Step | Where | Size | The one look |
|---|---|---|---|---|
| B1 | Photo first reveal. Photo → chooser if needed → A4's "Does this look like her?" → one pet → optional name → card. Kill the lab copy: Light/Focus/Fill, the hex swatch, "Plate will hold", "Print the card" become "Meet my cat"; quality advice only when something is actually wrong. The posture shelf moves behind "Choose another"; filing is optional after the reveal. | meter UI ~1600 to 1800, `mint` ~1800, naming sheet, `setPosture` shelf | M | walk-1 and walk-2 |
| B2 | Card art. Five frames (300 × 420 viewBox, 18 unit inset, nine-slice or keep aspect), the back, six stat marks, six ability shields, fifteen posture silhouettes at 48 with their localized names (keep the app's Japanese labels), identity set (icons, splash, wordmark). FOIL and MYTHIC static shine; the 600 ms reveal shine once, none under reduced motion. Photo stays three fifths of the face; "Meet in room" beside the photo/3D toggle; export defaults to the photo. | card `paint` ~1839, `paintBack` ~1900, shelf; assets b_card, a_identity | M | the FOIL card and the back |
| B3 | First touch. Eyes turn first, cheek leans into the finger, then a slow blink; repeatable at once. With sound and vibration off, the response must still be visible. Return to the same camera after. | petting ~6298, look-at, `life` ~6248 | S | petting frame |
| B4 | The back of the card opens on the latest real filing; UNNAMED, DEMO GRADE and empty ledgers go. An untouched card asks one question with Skip ("What does she do when the door opens?"). The poem is stored at mint (already) and the share preview shows the photo with long names cropped safely. | `paintBack`, poem card, share | S | an empty-but-warm card back |

After B: a 15 second phone capture of Barthalomew's reveal, shown to ten cat
people Stephen knows, with one question: "would you pay a dollar for this".
Free, and it is the first real market signal. Astra's paid pilot, small.

### Milestone C — "Play with her" (the games exist; make them read)

Exit: Stephen plays each toy once on the Pixel and can say what the cat did
and why he released, pressed or paused. One walk contact sheet.

| # | Step | Where | Size | The one look |
|---|---|---|---|---|
| C1 | Laser: move → pause → stalk → catch. Paw pin, ring and release on the catch (Astra's dot and glint). No grade bar during play; pausing or leaving ends on a reachable catch. Two pause windows to feel on the phone, 350 and 650 ms; keep the one Stephen prefers. | `laserDot` ~6618, `laserBrain` ~6669, `laserEnd` ~6656; assets d_play laser_* | M | the catch frame |
| C2 | Beans: cut to Astra's paw plate (154 × 152 logical, pads at (32,53) (66,35) (101,38) (126,58), centre (79,90), mirror the hits if mirrored). Tap a pad to splay that toe (toesFL.. morphs exist), hold to knead, release relaxes. 44 unit hit areas. No score, no timer. | `beansBrain` ~6922, `beansPress` ~6969; assets d_play toe_beans_* | M | the pressed pad |
| C3 | Pond: near bank framing, fish shadow and a broad ripple (Astra's water and ripple), the Fish Book opens on Astra's nine illustrations with a live species label. Tap alternative to the twitch. Pupil dilation stays the tell but release must read with the eyes hidden (the ear and shoulder turn). | `fishBrain` ~6809, `FishBook`; assets d_play fish_* , pond_* | M | a strike with the ripple |
| C4 | Yarn: one continuous fading strand on the floor (the rainbow trail), ball and last paw in frame, the yarn ends beside her with neck and limbs free. A short flick still reaches her. | yarn trail ~6478, `yarnReset`; assets d_play rainbow_yarn_* | S | the tangle |
| C5 | Furnishing pilot as PNG billboards, no Meshy credits: tower_three, box_cardboard, bed_donut, yarn_rainbow at manifest scale, anchored at their lowest surface, tower toward the room edge, the open floor in front of her kept clear. Only if they read beside the sitting cat does any piece go to Meshy (3,000 polys, materials on, review the backs). The box keeps the box law and shows flaps and rim in front of the body. | `ensureRoomProps`, `boxGroup` ~6536; assets c_room | M | the four props beside the cat |

### Milestone D — "Come back tomorrow", then the store

Exit: Stephen plays for seven real days. Offline cold launch once, twa_ready
once. Then Play at $0.99.

| # | Step | Where | Size | The one look |
|---|---|---|---|---|
| D1 | The return. She approaches a toy she chose and drops it by your thumb (the plan's play-solicit); one true dated memory ("You filed The Loaf yesterday" only if recorded); the homecoming line stays. Dismissing an invitation loses nothing. | `roomBrain` ~7185, `roomEvent`, ritual ~3852 | M | the delivered toy |
| D2 | Ritual to one dated memory. Five steps collapse when done; need icons with Astra's calm low state (amber "you could", never red); bond badges 1 to 10 and the days-together motif on the back. Skip, close and reopen never double award (already proved in the node check). | ritual UI ~3852, `drawNeeds`, HUD; assets e_bond | S | the ritual done state |
| D3 | Demo copy and legacy labels out, the dev-gate off, the one-cat-per-blob rule kept, old saves migrated by the engine's own stat names (CHONK, MISCHIEF, ZOOMIES, FLOOF, CHARM, VOID). | whole file sweep | S | none |
| D4 | Loaf as its own served app in the Shutterbug shape: satellites/loaf/ (index.html, manifest with the maskable icon kept distinct, sw.js, privacy.html with no data collected, offline cold launch), store/loaf-play (shots from the real app, feature graphic, Console page, $0.99). Multi-cat households free. | new folders; copy the shutterbug-play kit shape | M | the store shots |
| D5 | Optional, only if Stephen keeps many cats: photos to IndexedDB so the 40 cat photo release never fires. Otherwise the honest release message stands. | `Store` ~878 | M | none |

### Not before Play

Meshy conversions beyond the pilot four, the grader endpoint (below), clip
capture and share video, the personality quiz, trick training changes, bird
window, visitor changes, Biscuit the dog, decimating the GLB (715 KB loads
once and the room remounts when it lands; a real task, after launch).

## Decisions for Stephen

1. **Order.** Likeness (A) before the games read (C). Astra and I agree. Say
   yes or reorder.
2. **The grader.** The Haiku vision grader (~$0.0026 a scan, needs your proxy
   endpoint and key) is the only reliable way to split tortie, calico and
   tabby-with-white. My call: build A on the on-device reader plus the owner's
   corrections, which cost nothing and are the owner's own word. Wire the
   grader after launch, capped at 20 scans per install, if correction alone
   leaves too many wrong coats. Yes or no.
3. **Other people's cats.** The Two Cat Test cannot be passed with two cats.
   I need photos from people you know: at least two tuxedos, two brown
   tabbies, two solid blacks, one calico, one colourpoint, one ginger, a few
   on busy sofas, two in one frame. With each one, the owner's words for the
   feature that makes it their cat, recorded before they see anything. Six is
   the floor, twenty is the pilot gate (16 of 20 within three seconds).
4. **Furnishings.** PNG billboards first, Meshy only for pieces that read.
   Saves credits. Yes or no.
5. **Price and the million.** Astra says it plainly and so do I: a million
   copies is a sales goal, not a forecast, and the listing cannot prove likeness
   until A passes. The store page sells one video, your photo becoming her.
   That video is worth making only after A. The small pilot after B (ten cat
   people, one question) is the cheapest honest signal we can get before the
   store.

## What Stephen supplies

- The photos in decision 3, and their owners' words.
- One week of his own play after D, with notes on the Pixel.
- The grader endpoint and key only if decision 2 is yes.

## Pack to app map

| Pack folder | Lands in | Used by step |
|---|---|---|
| a_identity (6) | satellites/loaf/icons, splash, store | B2, D4 |
| b_card (33 SVG) | assets/loaf/art/card | B2 |
| c_room (25 PNG) | assets/loaf/art/room | A1, C5 |
| d_play (28) | assets/loaf/art/play | C1 to C4 |
| e_bond (22 SVG) | assets/loaf/art/bond | D2 |
| ASSESSMENT, NOTES, STYLE-GUIDE | docs/briefs/loaf/astra-v1/ | all |

Bindings (from NOTES.md): THREE_AM_SPRINT is the file for "3AM Sprint";
CHONK → Immovable Object, MISCHIEF → The Swat, ZOOMIES → 3AM Sprint, FLOOF →
Full Fluff, CHARM → The Slow Blink, VOID → Vanish. The Scottish Sit stays a
posture title, never a breed. Romanizations: The Loaf (kobako-zuwari), Navel to
the Sky (heso-ten), The Apology (gomen-ne), Too Bright (mabushii-ne), Hands
Hidden (otete-nai-nai), The Hotpot (neko-nabe); the other nine keep the app's
existing Japanese labels.

## Hard lines (unchanged, they bind every step)

Comfort first: nothing dies, sickens, runs away or is punished; a low need is
amber, never red. Coat, never breed. Chonk never reads as body condition. Days
together only counts up. The owner's photo is the hero of the card. No fixed
mascot cat. The cat is the hero of every scene.
