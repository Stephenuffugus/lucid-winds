# BLOCKSPACE — Master Plan v4 (Consolidated Final)
*A pocket 3D block-art studio for kids. Single-file vanilla PWA, Lucid Winds catalog.*
*All v2/v3 amendments folded in. This is the single source of truth for the handoff doc.*
*Positioning: "Build anything. Hear everything."*

---

## 1. Vision & Positioning

An empty 3D space you fill with colored blocks — done so well on a phone that a 7-year-old makes voxel art without a tutorial. No accounts, no ads, no fail states, offline, autosaved. Sound is a headline feature, not polish.

**Core loop:** open → tap to place → paint → hear it → orbit → share a snapshot.
**Audience:** kids 6–12; secondary voxel-art adults. Design for the youngest; depth is discoverable, never required.
**North star:** a kid hands a parent the phone; the parent instantly gets what they made and how to spin it.

**The market gap (researched):** Poki-style block games = survival/crafting framing, mouse-first, progress evaporates, not art tools. Real voxel editors (Mega Voxels, Voxel, MagicaVoxel) = capable but silent, menu-heavy utilities. "ASMR builder" apps = great sound-feel wrapped around fake creativity (fill-in pictures, idle towers). **Nobody combines open-ended 3D creation with first-class sensory design.** Lessons adopted: autosave is a store-page selling point (progress-loss is the genre's #1 complaint); starter content matters (Mega Voxels' library proves kids want starting points).

## 2. Decisions Log

| Decision | Choice | Why |
|---|---|---|
| Three.js | r160 modules via importmap, pinned CDN | Maintained path, zero-build preserved, custom camera anyway |
| Default grid | 24³ (options 16/24/32/48) | 32 overwhelms a first project; 16 cramps; 48 gated w/ perf note |
| Mirror mode | v1 | Highest fun-per-line in the app |
| Name/brand | "Blockspace," standalone; Sunbeam cross-promo later | Clean v1 scope; palette/sound-pack unlocks are a data-only v2 add |
| Line drawing | Press-and-hold "draw lock" (350ms → haptic → orbit off, drag draws) | Solves gesture conflict with no mode toggle |
| Sound architecture | Core system from M2, synthesized, color=pitch | It's the differentiator; can't be bolted on |

## 3. Stack & Constraints

- **One `index.html`** + `manifest.json` + `sw.js` + icons. No build step. No dependencies beyond Three.js r160 (cannon-es arrives only with v2 Wrecking mode).
- Pointer Events, `touch-action:none`; mouse rides the same path.
- Perf: 60fps @ 2,000 blocks mid-range Android; soft warn 3k; hard cap 5,000.
- No external assets: DOM overlay UI, inline SVG icons, synthesized audio (optional embedded sample pack <150KB base64 only if synthesis misses the tactile bar — judge at M3 with headphones).
- Est. ~150KB source; section map (§16) keeps it navigable.

## 4. Data Model

Blocks are **grid-snapped entities, not a voxel array** — 45° rotation breaks voxel adjacency; we don't pretend. Load-bearing decision #1.

```js
// Block
{ id:17, p:[x,y,z], r:[rx,ry,rz], f:[c0..c5], m:0 }
// p: int grid coords, y>=0 · r: 45° steps 0–7/axis (usually [0,ry,0])
// f: PALETTE INDICES per face (+X,-X,+Y,-Y,+Z,-Z) · m: 0 solid, 1 glass

// Project
{ v:1, id, name, created, modified, gridSize:24, floor:true,
  palette:[hex×≤32], gradients:[{name,stops}], blocks:[…],
  camera:{theta,phi,dist,target}, thumb:"data:image/jpeg…(~12KB)",
  cmdLog:[…] }   // serialized command history — powers v1.5 Build Replay for free
```

Runtime indexes (never saved): `occ Map<"x,y,z",id>`, `byId`, `paletteUse Uint16Array(32)` refcounts.

**Palette indices, not hex-per-face** = tiny saves + *editing a swatch live-recolors the whole sculpture* (headline feature, zero cost). Deleting an in-use swatch remaps to nearest remaining color after a friendly confirm. `v` + `migrate()` ladder from day one. **Commands must be JSON-safe from M2** so replay costs nothing later.

## 5. Rendering

- **Chunked merged BufferGeometry + vertex colors** (InstancedMesh can't do per-face color). 8×8×8 chunks; ≤2 meshes each (opaque + glass); edits dirty a chunk; ≤4 dirty chunks rebuilt/frame (sub-ms each).
- Cube = 24 verts, per-face color on all 4 verts, `MeshLambertMaterial({vertexColors:true})`. Rotation **baked into vertices at build time** — renderer has zero special cases.
- Glass pass: `transparent, opacity .55, depthWrite:false, DoubleSide`, after opaque. Sorting artifacts between overlapping glass: accepted, invisible to audience.
- **No neighbor culling v1** (rotation makes it fiddly; ≤5k blocks doesn't need it). v2 optimization note.
- Light: Hemisphere + one Directional, **no shadow maps**; grounding via soft radial shadow-blob sprite under footprint. Sky = CSS gradient behind transparent-clear canvas.
- Ghost/selection = dedicated overlay meshes; never touch chunks.

## 6. Camera & Gestures

Custom orbit rig (~90 lines; spherical, phi 5–85°, dist clamped by grid).

1-finger drag = orbit · pinch = zoom · 2-finger drag = pan (bounded) · tap = tool · **hold 350ms (Build/Erase) = draw-lock drag** · hold (Paint/Select) = eyedropper · double-tap empty = reframe.

State machine: `down → moved>10px:ORBIT | held>350ms:LOCK/EYEDROP | up<300ms:TAP`; second pointer promotes to pinch/pan, cancels tap. Raycast only on tap/lock-move. Inertia on release; all motion respects `prefers-reduced-motion`. **Input sources abstracted from tools** — this is what lets WebXR controllers drop in at v2 without surgery.

## 7. Tools

Bottom toolbar, ≥56px targets, icons-only (pre-readers), long-press tooltips.

- **BUILD:** tap face → block on it (inherits active color on all 6 faces); floor tap works; draw-lock = line of blocks. Out-of-bounds → shake + soft pop, no dialog.
- **PAINT:** sub-toggle **Face / Block / Bucket** (bucket = contiguous coplanar same-color flood, axis-neighbors, rotated blocks terminate; cap 600). Gradient active → see §9.
- **ERASE:** pop + particle puff + haptic; draw-lock multi-erase. Never triggers gravity.
- **SELECT:** context card → ⟲/⟳ 45° Y (X/Z behind "more") · Glass/Solid · Duplicate (ghost-commit) · Delete.
- **UNDO/REDO:** command pattern, 200-step ring, batched strokes/fills = one step. Persistent top-left. Non-negotiable.
- **MIRROR (top bar):** X center-plane; even grids pair perfectly; odd-grid center column self-pairs; ±X face indices swap on the twin; ghost previews both.

## 8. Color System

- Palette drawer: ≤32 swatches, active ring, `+` add, tap-hold edit.
- Picker: big HSL sliders + hex, live preview cube, **live scene recolor while sliding** (chunk rebuilds throttled 10Hz) — the wow moment.
- Presets: Classic (default 12, tuned for vertex-lit contrast, deuteranopia-checked), Pastel, Neon, Earth, Grayscale, Stained Glass. Loading copies into project (projects self-contained).
- **My Colors** global library (palettes + gradients, localStorage).
- **Every swatch has a note** (§10) — tapping a swatch previews it.

## 9. Gradients

2–4 stops → expanded to span length (cap 32). **Axis apply:** gradient active, tap two blocks → axis from dominant delta → existing blocks in span get stepped colors (never places). **Paint-through:** each tap advances a step (wraps); + draw-lock = rainbow stroke. Steps snap to near palette entries else temp-append (≤32 else nearest).

## 10. Sound & ASMR System (core architecture, built at M2)

**Color = pitch.** Palette slot → note on **pentatonic major** (~2.5 octaves across 12 slots): any tap sequence is musical, no wrong notes. A palette is literally an instrument. Height adds brightness (filter/velocity, not pitch — pitch stays owned by color). Gradients play scale runs; rainbow towers arpeggiate. This is the shareable magic.

**Timbre packs** (palette-linked defaults, user-mixable): Marimba (Classic/default) · Bubbles (Pastel) · Crystal (Stained Glass — and *all glass blocks always chime regardless of pack*) · Woodshop (Earth) · Synthwave (Neon) · Whisper-soft (ASMR mode).

**Craft rules:** never the same sound twice — ±15¢ detune, ±10% decay, ±2dB velocity, 2–3 round-robin variants per event. **Event vocabulary:** place=note · erase=reverse-pluck of its note · bucket=arpeggio cascade (≤16 voices + swell) · gradient=glissando · draw-lock=notes gated to light 8th-note grid · gravity=descending tumble + felt landings · undo=rewind chirp · swatch tap=note preview.

**Mix bus:** soft-knee limiter, small generated Convolver reverb (~0.8s, low mix), 24-voice cap oldest-steal. **Spatial audio: every block event through a PannerNode at the block's world position** — build left, hear left; orbit rotates the soundstage. Generational ASMR edge with headphones, nearly free.

**Ambience (opt-in, per sky theme):** dawn birds/air · night crickets/wind · rain. Continuous synthesis (loopless), ducked −3dB under interactions. **ASMR mode** master toggle = whisper-soft pack + ambience + slower tweens. iOS: audio init on first gesture. All settings persisted.

## 11. Gravity Check (v1 physics)

Button, not simulation: BFS from floor through `occ` → unsupported clusters tween down (per-column min drop), squash-and-stretch, landing haptic + felt thud. **Applied as one undoable command** — safe to poke. Building always gravity-off. (Wrecking mode = v2, §16.)

## 12. Projects, Persistence, Sharing

- Autosave: localStorage, 1s debounce + `visibilitychange`. Quota writes try/caught → friendly toast, never silent loss.
- Projects screen: thumbnail cards; New/Duplicate/Rename/Delete (hold-to-fill). ~25–30 projects in 5MB; 80% capacity nudge.
- **PNG snapshot:** 2x offscreen render, sky or transparent bg → Web Share API (fallback download).
- **JSON export/import:** file + paste-a-code textarea (locked-down school devices).
- iOS eviction risk: "Back up your favorites" nudge in menu; IndexedDB + `persist()` = v2.

## 13. UI, Feel, First-Run, Kid-Proofing

- Full-bleed canvas; top bar: undo · redo · mirror · name · menu. Bottom: tools + palette handle. Left-hand mode flips columns. Safe-area insets.
- Placement anim: 90ms scale-in overshoot; erase: 90ms scale-out + 4-particle puff. These two tweens + sound carry the feel.
- Haptics: place 10ms · erase 15ms · lock 25ms · error double-pulse (capability-checked).
- **No confirm dialogs ever:** destructive = hold-to-fill; everything else = undo.
- First-run: pulsing "tap anywhere" (dies after first block); after ~5 blocks, one-time "drag to spin!" toast.
- **Starters** (editable copies, embedded JSON, ≤120 blocks each): Rainbow Arch (gradients) · Little House (faces/rotation/glass) · Smiley (pixel-art + mirror).

## 14. PWA & Accessibility

- Manifest: standalone, portrait, 192/512+maskable (isometric 3-block corner icon, generated once via helper page).
- SW: cache-first, versioned cache name, old-cache purge, "new version — tap to refresh" toast. Offline-complete from second visit.
- iOS: apple-touch-icon, `viewport-fit=cover`, user-select none, gesture-gated audio.
- A11y: reduced-motion kills inertia/tweens/pulses; sound never sole info channel; palette name labels optional; no reading required to operate.

## 15. QA Checklist (real phone, per milestone)

1 60fps @2k orbit (mid Android + older iPhone) · 2 20 rapid diagonal placements, zero mis-cells · 3 place-onto-rotated lands sane · 4 palette-slide recolor smooth @2k · 5 20×20 bucket <100ms · 6 undo 50 mixed ops → serialize-identical · 7 kill tab → nothing lost · 8 gravity on 500-block overhang + single-undo restore · 9 mirror pairing incl. odd-center self-pair · 10 airplane-mode full function · 11 stuffed storage → toast, no crash · 12 PNG hits share sheet · **13 headphone pass: spatial pan tracks orbit; no repetition fatigue in 100 placements; limiter never pumps.**

## 16. Roadmap

### v1 milestones (each ends phone-runnable; commit each)
- **M1 Skeleton:** scene, floor, sky, camera rig, entity store, chunk renderer, tap place/erase. *Accept: tower @60fps.*
- **M2 Tools+Undo+Sound core:** toolbar, state machine, ghost/selection, undo/redo (JSON-safe commands + persisted cmdLog), place/erase anims, haptics, **audio engine (voice pool, jitter, event vocabulary, panner routing)**. *Accept: all mutations undoable; QA 2.*
- **M3 Color+Notes:** drawer, picker w/ live recolor, Face/Block/Bucket, eyedropper, **color-note mapping, Marimba+Crystal packs, swatch note preview**; sample-pack go/no-go call. *Accept: 6-color die; QA 4–5.*
- **M4 Rotate+Glass:** select card, 45° rots, glass pass + always-chime, rotated-placement rule. *Accept: diagonal stained-glass window; QA 3.*
- **M5 Gradients+Mirror:** builder, axis + paint-through (+glissando), mirror pairing. *Accept: rainbow tower in 3 taps plays a run; QA 9.*
- **M6 Projects+Share:** autosave, projects screen, thumbnails, PNG share, JSON in/out, quota handling. *Accept: QA 6–7, 11–12.*
- **M7 Gravity:** support BFS, cluster fall + tumble audio, one-command undo. *Accept: QA 8.*
- **M8 PWA+Sound-finish+Polish:** manifest/SW/icons, starters, first-run, left-hand, reduced-motion, caps messaging, **remaining timbre packs, ambience beds, ASMR mode, spatial-audio mix pass w/ headphones + kid test**. *Accept: QA 1, 10, 13; Lighthouse PWA pass.*

### v1.5 slate (impact/cost order)
1. **Music Box** — glowing plane sweeps an axis at tempo; every block passed plays its note (chords on aligned columns). *Your sculpture is a song.* The 15-sec shareable clip that markets the app. + **Instrument mode** (tap-to-play toggle, ~40 lines).
2. **Build Replay** — cmdLog time-lapse w/ sounds ("watch it build itself").
3. **Daily Palette** — date-seeded 5 colors + prompt word, zero server; comparable share codes.
4. **Tilt-shift photo mode** — miniature DoF + diorama base; screenshots are the growth loop.
5. **Charm layer** — butterfly lands on builds; bird perches on tallest block, chirps its note; night fireflies.
6. **Magic Window** — DeviceOrientation parallax orbit (gesture-gated iOS permission).
7. **STL export** — 3D-print your sculpture; parent-grade wow, school/library vector.
8. **Sky themes** — dawn/dusk/night/space + light tint + matching ambience.
9. **Photo stencil** — photo → posterized-to-palette translucent guide wall.
10. **Share codes** — CompressionStream JSON → URL hash import; enables lucidwinds gallery page.
11. **Song/turntable video export** (MediaRecorder feasibility-gated) · **Seasonal trickle** (date-seeded snow/leaves/fireflies).

### v2 pillars
- **"Toys" update:** Wrecking mode (cannon-es, ball drop, shake-to-quake, physics never mutates the save, one-tap restore) + jelly-wobble & balloon materials.
- **"Satisfying" update:** **Restore Mode** — dust/moss desaturation wiped clean finger-first, color+note blooming back; plus gray **restoration starters** that teach great builds block-by-block. Rides the dominant cleaning-sim trend.
- **Strategic update:** **WebXR build mode** — same file detects Quest browser; room-scale, controller-ray place/paint. Slots into the studio's Meta Horizon/WebXR beachhead; Blockspace is arguably the catalog's best-suited title. (Input abstraction from §6 makes this a mode, not a rewrite.)
- Evaluate on traction: voxel frame animation → GIF/MP4 · Zen screensaver (generative auto-build lo-fi) · **Block Commons** (r/place-style shared 64³ Firestore world, daily block allowance, monthly reset+timelapse; needs rate limits & report-and-heal — the only backend idea on the board).

### Parking lot
Pane/wedge/stair shapes · glow material · radial 4-way symmetry · region copy/stamp · hollow-room macro · local sticker-book achievements · weekly prompt · LEGO-style orthographic instructions PDF · papercraft unfold · haptic patterns per pack · Sunbeam palette/sound-pack unlocks · pass-and-build hot-seat · neighbor face-culling · IndexedDB.

### Explicitly rejected
Survival/crafting anything · ads · accounts/cloud in v1 · block textures (color purity is the aesthetic) · AI features in the kid app (privacy + offline principle; a describe→build creator tool could be a separate adult product) · in-app UGC browsing (moderation burden; share codes keep it person-to-person, the kid-safe shape) · WebGPU (unneeded at 5k).

## 17. Single-File Section Map

```
index.html
├─ head: meta/PWA, importmap, ~400 lines CSS (custom props)
├─ body: overlay DOM (bars, drawers, cards, toasts, svg defs)
└─ module script:
   [S1] CONFIG  [S2] STATE(project,occ,byId,undo,cmdLog)  [S3] PERSIST/migrate/quota
   [S4] THREE SETUP  [S5] CHUNKS  [S6] CAMERA  [S7] INPUT SM (source-abstracted)
   [S8] TOOLS  [S9] COLOR/GRADIENT  [S10] MIRROR  [S11] GRAVITY
   [S12] AUDIO (engine, packs, panner, ambience)  [S13] UI/toasts  [S14] SNAPSHOT/EXPORT
   [S15] STARTERS  [S16] BOOT
```

## 18. Risks

Gesture soup on cheap touchscreens → strict SM + tune at M2 on hardware · glass sorting → accepted · palette remap bugs → refcounts + QA 6 serialize-compare · iOS storage eviction → export nudge now, IndexedDB v2 · audio repetition fatigue → jitter system + QA 13 · scope creep → nothing enters v1 outside §16.
