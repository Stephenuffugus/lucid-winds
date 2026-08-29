# AURA OFF — Volume III: The 3D Space & VR Path

**Compiled 28 August 2026.** Companion to `AURA-BIBLE.md` and `AURA-CULTURE.md`.
**Target device: Meta Quest 2** (the constraint that decides most of this).

---

## 0. THE HEADLINE

**Google Photorealistic 3D Tiles cannot ship in this game.** I checked the terms rather than assuming, and there are four separate blockers. Details in §1.

**OpenStreetMap can, and it gets you the real plazas.** Free, commercial-safe, one credit line, global coverage, one-click into Blender. Details in §2.

**And there's a VR insight worth more than either:** six-seven and mewing are *hand gestures*. Quest has hand tracking. The composure mechanic — where score falls off if you overplay — is measuring exactly what a hand tracker measures. The core mechanic of this game was accidentally designed for VR. Details in §5.

---

## 1. GOOGLE PHOTOREALISTIC 3D TILES — RULED OUT

Worth being precise, because on paper this looks like the dream: photoreal Bellas Artes, photoreal Parque México, streamed on demand.

### What the terms actually say [verified from Google's own policy docs]

**Blocker 1 — no caching, no offline.** Applications must not pre-fetch, index, store, or cache any Content except under narrow stated conditions. Google explicitly lists **offline uses** among prohibited non-visualization use cases. A Quest store title, or a PWA in your catalog, needs to work without a live connection. This alone ends it.

**Blocker 2 — attribution must be visible and unaltered.** The Google logo and data attribution must be displayed on the map at all times. In a stylized VR arena that is either an immersion-breaking floating logo or a terms violation.

**Blocker 3 — no deriving geometry.** You may overlay your own 3D objects on Photorealistic 3D Tiles **only as long as those objects aren't extracted, traced, or otherwise derived by hand or machine from the tiles.** So you can't use the tiles as modelling reference and then ship your model. Separately, the third-party terms prohibit tracing roadways or building outlines from satellite basemaps and creating 3D building models from 45° imagery.

**Blocker 4 — the trailer problem, and this is the one nobody sees coming.** Promotional videos using this content must be **no longer than 30 seconds**, must **not include Street View imagery**, must be **about the capabilities of your application**, must be **clearly marked "for promotional purposes only"**, and **may not be resold separately or as part of the software**.

> You cannot make a normal game trailer. You cannot make a Meta Horizon Store listing video. For a product whose entire distribution depends on a store page, that is disqualifying on its own.

**Also:** live per-request billing, a root tileset request covering only ~3 hours of tile requests, and a prohibition on using Google Maps Content with or near a non-Google map.

### Where it *is* still useful

A **browser-based, always-online companion** — a "where the battles happened" map viewer with Google branding intact, separate from the game. Genuinely nice marketing artifact, zero licensing risk, and it can link to the game. Just keep it out of the shipped title.

---

## 2. OPENSTREETMAP — THE LICENSE-CLEAN PATH

### The license, plainly

OSM data is under **ODbL 1.0**. There are **no fees of any kind**, and the data may be used for **any purpose including commercial**. Two obligations:

1. **Attribution** on any Produced Work used publicly. The standard form: **"© OpenStreetMap contributors"** with "OpenStreetMap" linking to `openstreetmap.org/copyright`. One line on a credits screen satisfies this.
2. **Share-alike applies to derivative *databases*, not to Produced Works.** A rendered game level is a Produced Work — a derivative that is not itself a database. **Your game does not become ODbL.** This is the critical distinction and it's why OSM works here and share-alike-everything sources don't.

You may charge for your work and set your own licensing terms on it.

> ⚠️ One trap: **OSM's own map tile server is not for commercial use.** The *data* is free; the *tiles* from openstreetmap.org are not. We're using data, not tiles, so this doesn't bite — but don't wire the game to tile.openstreetmap.org.

### What it actually gives you

**blender-osm** (by vvoovv) does one-click download and import of OSM plus real-world terrain into Blender, with global coverage. Base version free; premium **$17.80**, source under GPL, bundled textures **CC0**.

Base version imports:
- **Buildings** with real heights and floor counts, composed into 3D parts for complex structures
- **A large set of roof shapes** — flat, gabled, hipped, mono-pitched, half-hipped, round, pyramidal, gambrel, dome, onion, saltbox
- **Terrain** at ~30m resolution
- **Rivers, lakes, forests, vegetation** as polygons, projected onto terrain
- **Roads**

Premium adds tileable building textures with UV mapping, a late-evening lit-windows material set (**which is exactly our sodium-streetlight-at-dusk direction**), and trees as 3D objects.

### Why this is the right answer for our locations

Every arena in the campaign is a **real public square with real surrounding building masses**:

| Arena | OSM gives us |
|---|---|
| Explanada del Palacio de Bellas Artes, CDMX | The esplanade footprint, the palace mass, Alameda Central across the street |
| Parque México, Condesa | The park's distinctive oval layout and surrounding blocks |
| Monumento a la Revolución, CDMX | The monument and its plaza |
| Parque Municipal Max Feffer, Suzano | Park boundary, paths, water |
| Plaza Sucre, Cochabamba | Plaza footprint and colonial block structure |
| Batang Kuantan river, Kuantan Singingi | **River geometry and terrain** — Act 5's actual water |

You get **true spatial layout for free**, then art-direct everything on top. The plaza is the right shape and the right size, the buildings are in the right places at the right heights, and nothing you ship is derived from anyone's protected imagery.

---

## 3. GAUSSIAN SPLATTING — REAL, BUT NOT FOR US YET

The technology has arrived. It just doesn't solve our problem.

### Where it stands in 2026

- 3DGS moved from research to industry-standard for photoreal real-time scene reconstruction, rendering at 60fps in-browser via WebGPU.
- **SPZ** compression is adopted across the ecosystem; the **KHR_gaussian_splatting** glTF extension was targeting ratification in Q2 2026.
- **SparkJS 2.0** provides splat rendering for WebGL2/WebXR in three.js scenes with **Level-of-Detail specifically to hold framerate on Quest and PICO** — nearby areas at full detail, distant areas coarser, fixed render budget.
- A proven production chain exists: drone capture → RealityCapture → gsplat training → SOGS compression → PlayCanvas, shipped as a WebXR scan of Sutro Tower.
- Apple's **SHARP** (early 2026) generates high-quality 3DGS **from a single image**.

### Why it doesn't work here

**You're in Ohio. The arenas are in Mexico City, São Paulo state, Cochabamba, and Sumatra.** Splatting requires capture, and capture requires being there.

And the obvious shortcut is closed: generating splats from Google/Street View imagery is precisely what §1's Blocker 3 prohibits. SHARP-from-a-single-image doesn't change that — the source image's rights still govern.

### Where it *does* fit

- **Local capture for prototyping.** Splat an actual Ohio plaza or park with a phone via Polycam or Luma, use it to prove the WebXR pipeline and test framerate on the Quest 2 before committing to art.
- **Later, if the project earns it:** commission capture through the tournament organizers themselves. Uvitinho in Suzano and Aldhir González in CDMX are already filming everything. A phone-based capture pass at a real battle is a small ask with a real partnership behind it — and it's a far better reason to contact them than "can I use your name."
- **Watch the Khronos extension.** Once splats are a standard glTF payload, this gets much cheaper.

---

## 4. THE RECOMMENDED PIPELINE

```
OSM data ──► blender-osm ──► Blender
                               │
                     real footprints, heights,
                     roof shapes, terrain, water
                               │
                    ┌──────────┴──────────┐
                    │  ART PASS           │
                    │  decimate to budget │
                    │  stylize surfaces   │
                    │  bake lighting      │
                    │  vertex-colour or   │
                    │  small atlas        │
                    └──────────┬──────────┘
                               │
                    glTF / GLB (Draco or Meshopt)
                               │
                    three.js + WebXR ──► Quest 2 Browser
                               │
                    same single-file philosophy
```

**Real geometry, invented surfaces.** That sentence is the whole strategy. The layout is true because it came from OSM. Every pixel of surface is ours, so nothing is derived from protected imagery, nothing needs a live connection, and nothing constrains the trailer.

### The aesthetic argument, which matters more than the legal one

Our fighters are **glowing silhouettes on a flat colour field.** Magenta and cyan against deep indigo, lit like a plaza at dusk under sodium lamps and phone flashes.

**Photoreal environments would destroy that.** A photogrammetric Bellas Artes with two neon stick-figures in front of it reads as a bug, not a style. The silhouette direction requires an environment that recedes — flat masses, limited palette, strong rim light, everything subordinate to the two figures and the crowd ring.

Stylized low-poly isn't the compromise here. It's the correct art direction, and it happens to also be the one that's legal and the one that runs.

---

## 5. THE VR DESIGN — WHERE THIS GETS GOOD

### 5.1 The insight

Read the move list again with a hand tracker in mind:

- **Six-Seven** — both hands at chest height, palms up, alternating see-saw. **Pure hand gesture.**
- **Jawline (mewing)** — finger to lips, slide along the jaw. **Hand-to-face gesture, trivially trackable.**
- **Cold Read (sigma)** — arms crossed, total stillness. **Trackable as a hold.**
- **Shade Drop** — hand to face, then away.
- **Look Away** — head rotation. **Headset gives you this for free.**
- **Unimpressed** — head roll.
- **Lasso** — overhead arm circles.

**More than half the roster is upper-body-only, and the upper-body-only moves are the ones documented as most-used in real battles.** That is not a coincidence — these are gestures teenagers perform standing still in a crowd, which is exactly the posture of a seated or standing VR player.

### 5.2 And composure is *already* a hand-tracking mechanic

This is the part that made me stop and check my own notes.

The core scoring rule, taken from Prof. Aldama's observation that the winner was the calmest performer, is: **every move has an ideal amplitude, and score falls off on both sides — harder above than below.** In the 2D build, amplitude is a hold-duration bar.

In VR, amplitude is **the actual physical size of your gesture**, measured directly. Hold your hands steady and small on a FLEX move and you score. Flail on it and you overplay and lose points. Commit fully on a BAIT move and you score.

**The game already asks the player to control their physical restraint. VR is the only medium that can actually read that.** The 2D hold-bar is a simulation of a thing VR measures natively.

### 5.3 The player's position

Two options, and I'd build the first:

**A — In the ring (recommended).** You stand in the crowd circle. The duel happens in front of you. You're a competitor, stepping forward for your turn, and the crowd is around you at human scale on all sides.

This is truest to the culture. Aldama's whole reading is that the plaza, the gathering, the ring of people **is the point** — a free, nonviolent, in-person space. VR is uniquely able to deliver "you are standing in a crowd of people who came outside." That's the emotional payload the flat version can only gesture at.

**B — Full gesture performance.** You physically perform every move with hand tracking. Enormously appealing, and §5.2 says the mechanics are already there — but gesture recognition is a hard problem, accessibility gets difficult, and it's a much bigger scope. **Build A first with a gesture-input option layered on top**, so the fallback is always controller or gaze select.

### 5.4 Act 5 in VR

The player stands on the prow of a **40-metre wooden canoe with up to sixty rowers behind them**, on the Batang Kuantan river.

The 2D build already wobbles the rig and speeds the timing needle for this act. In VR, **the deck moving under you is the entire experience** — and it's the one place where the composure mechanic and the physical reality of the role collapse into the same thing. The Togak Luan's actual job is staying calm on an unstable surface. In VR the player is literally doing that.

> ⚠️ **Motion sickness.** Moving the world under a stationary player is the classic trigger. Non-negotiable mitigations: a **static reference frame** (the boat deck and a fixed horizon element must stay locked to the player), a **comfort setting that reduces or disables sway**, and short exchanges — which the culture already demands anyway.

---

## 6. QUEST 2 BUDGET — THE HARD NUMBERS

Quest 2 is the floor, and it's a real floor. Snapdragon XR2 Gen 1, stereo rendering, 72–90Hz target. Every frame is drawn twice.

Working budget for a WebXR scene on Quest 2 — treat as ceilings, not targets:

| Resource | Budget |
|---|---|
| Draw calls | **< 100** per frame. This is usually the binding constraint on mobile XR. |
| Triangles | **< 300k** visible |
| Texture memory | **< 512 MB** |
| Frame time | **11 ms** @ 90Hz, 13.8 ms @ 72Hz |
| Real-time lights | **Zero.** Bake everything. |
| Post-processing | **None.** No bloom, no SSAO. |
| Total download | **< 25 MB** for a snappy WebXR load |

Practical consequences:
- **Merge aggressively.** The entire environment should be a handful of draw calls. Every building being its own mesh is how you die.
- **Bake all lighting into vertex colours or one lightmap atlas.** Our flat-colour direction makes this easy — arguably easier than a realistic scene.
- **The crowd is the real risk.** A ring of individually-meshed figures will eat the budget instantly. Use **instanced billboards or instanced low-poly figures with a single shared material** — one draw call for the whole crowd.
- **Fighters get the budget.** Two skinned meshes, decent joint counts, everything else spends nothing.

**Good news:** WebGPU reached baseline across major browsers in 2026, and Quest Browser, Samsung Internet, and Safari on Vision Pro all expose WebXR through the same pipeline. Write once, hit every XR runtime — that only became true this year.

---

## 7. THE PORT, CONCRETELY

The 12-joint rig was built for this. Nothing in the move library changes.

1. **Meshy** → base humanoid mesh
2. **Blender** → retarget to the frozen joint names: `rot, bob, lean, head, sL, eL, sR, eR, hL, kL, hR, kR`
3. **Keep the move library as data.** Do not bake clips to glTF animations. Our poses are joint-angle keyframes sampled at runtime — that's what makes amplitude scaling and upper/lower masking work. Feed them into a three.js skeleton by setting bone rotations directly, exactly as `applyPose()` does now with SVG transforms.
4. **Upper/lower masking stays identical.** `UPPER` and `LOWER` are already bone-name arrays. That's skeletal masking whether the target is SVG groups or a `SkinnedMesh`.
5. **Follow-through lag stays identical.** Same millisecond offset on the upper track.
6. **Prove one move end-to-end before porting the rest.** Use **Aura Walk** — it's lower-body-led with a lag value and an 0.2/0.8 weight split, so it exercises masking, lag, and amplitude in a single clip. If Aura Walk looks right in VR, everything else will.

---

## 8. WHAT TO DO FIRST

1. **Splat a local Ohio plaza with a phone** (Polycam or Luma) and get it running in WebXR on the Quest 2. Not for the game — to measure the pipeline and find the real framerate ceiling on your own device before any art is committed.
2. **Pull Parque México from OSM into Blender** via blender-osm. It's the most distinctive layout of the five and the easiest to recognize. Decimate to budget, flat-shade it, drop two capsules in the middle, export glTF.
3. **Port Aura Walk** to a three.js skeleton and confirm masking, lag, and amplitude all survive.
4. **Then** decide between crowd-ring VR and gesture VR, with real numbers in hand.

Don't buy blender-osm premium until step 2 proves the base version isn't enough.

---

## 9. OPEN QUESTIONS

1. **[?] Does Meta Horizon Store accept WebXR titles**, or does it require a native APK wrapper? This determines whether the single-file philosophy survives to the store or only to the browser. **Check before committing.**
2. **[?] Quest 2 hand-tracking fidelity for the specific gestures** — is palm-up vs palm-down reliably distinguishable? Six-Seven depends on it, and that's already an open question in the bible for a different reason.
3. **[?] Is a "crowd ring" of instanced billboards convincing in stereo?** Billboards read flat in VR far more than on a screen. May need low-poly figures instead, which costs budget.
4. **[?] OSM coverage quality for Kuantan Singingi and Suzano.** Coverage is global but density varies enormously. Mexico City and Cochabamba will be well-mapped; rural Riau may be sparse. **Check each location before planning around it.**
