# HANDOFF — WARDIAN (Pocket Terrarium)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, portrait.
**Deploy target:** lucidwinds.com/satellites/wardian
**Session goal:** Living jar — procedural plants growing in real time, 3 bug species, day/night synced to device clock, offline catch-up sim, misting + planting interactions, discovery journal with lore.

---

## 1. Concept

A sealed glass jar on your phone. Inside: a tiny living ecosystem — moss, ferns, springtails, beetles — that grows in **real time**, on **your actual local time**. Night falls in the jar when it falls outside your window. It rains in the jar when it rains in your town. Open it after three days away and watch the sim fast-forward: new shoots, a beetle you've never seen, dew on the glass.

**The promise (say it on the store page):** *Nothing in the jar can die. Ever.* Plants go dormant, curl, wait. Bugs sleep. There is no failure state, no streak, no guilt. It's the anti-Tamagotchi.

**Tone:** quiet, miniature, slightly magical. A snow globe that's actually alive.

## 2. Market research summary (Sep 2026)

- **My Little Terrarium** (category leader, mobile): decorate-a-jar idler. Top user complaints in reviews: plants die if not watered daily in real time with no warning, and the food/currency economy is gated behind repeated ad watching. Both are direct design opportunities.
- **Reptilarium** (Steam, 2026): cozy collection idler, creatures-as-passive-income, "capitalism" is literally in its tags. Collection loop works; economy framing is cold.
- itch.io idle/virtual-pet tag: lots of desktop companions and "watch it grow" toys; none simulate an actual ecosystem (food web, decay, moisture) — they're decoration + timers.
- Real-world-data games: Weather Farmer syncs local weather/moon phases to an energy idler; Animal Crossing proved real-clock play creates ritual attachment. Weather+ecosystem+zero-pressure has no occupant.

**Positioning line:** "A tiny world that lives on your time." Differentiators: (1) real ecosystem sim, not decor timers; (2) synced to real local time & weather; (3) nothing can die.

## 3. Lore — The Wardian Jars

Grounded in real history: in 1829, Dr. Nathaniel Ward sealed a fern in a glass case and discovered it could live for years untouched — Wardian cases then carried living plants across oceans. Our fiction: **the Jarwright**, a wandering botanist in Ward's tradition, seals "pocket worlds" and leaves them for people who need something quiet to care about. Your jar is one of hers.

- Every discovered species gets a **field journal entry** in the Jarwright's voice — 2–3 sentences, warm, a little odd. ("Cushion moss. It is not in a hurry. Neither are you, while you watch it.")
- Journal doubles as the collection screen. Undiscovered species are pencil silhouettes.
- Occasional letters from the Jarwright (milestone unlocks): tiny paper notes that slide behind the jar. No demands, ever — just observations. This is the retention hook that replaces streaks.
- Light real-science flavor throughout (springtails really do eat mold; isopods really do clean decay) — quietly educational, fits the studio's kid-friendly catalog.

## 4. Core loop

1. Open app → jar fast-forwards through elapsed real time (growth montage, ~2–4s, skippable).
2. Look. That's genuinely the loop. Parallax jar, bugs wandering, condensation.
3. Optional touches: **mist** (swipe down = water droplets, raises moisture), **tap glass** (bugs startle/investigate), **plant a seed** (from seed pouch), **rearrange** (drag stones/wood in edit mode).
4. Passive **spores** accrue from ecosystem health/diversity → spend on new seeds, jar styles, backdrops.
5. New species arrive on their own when conditions are right (moisture + a rotting leaf → springtails appear). Discovery, not purchase, is the dopamine.

## 5. Simulation design (the heart)

Three coupled layers, all cheap:

### Environment grid
- Soil = coarse grid (~24×8 cells): moisture, nutrients, light-exposure per cell.
- Global vars: temperature, humidity, light level (from time of day + weather), season.
- Misting adds surface moisture → percolates down tick by tick. Decay (dead leaves) adds nutrients to cells beneath.

### Plants (procedural, every plant unique)
- Stochastic branching segments: each plant = tree of segments `{angle, length, growth, generation}`; growth ticks extend/branch by species rules (branch probability, angle jitter, max gen, leaf shape).
- Species rules keyed to environment: moss spreads across moist surfaces (cellular), ferns unfurl fronds (segment curl param animates — signature visual), vines climb glass, mushrooms fruit overnight only.
- **Dormancy instead of death:** dry/dark plants desaturate, curl, halt. Conditions return → they resume, with a little "relief" animation. Never removed.
- Launch flora: cushion moss, button fern, glass vine, ghost mushroom, dew sprout, + 3 rare (season/weather-gated: frost fern only when real temp < 0°C, sunburst bloom only on clear summer days, moon cap only during full-moon nights).

### Fauna (agents)
- Springtails (dot-swarm, eat mold/decay), isopod "pillbug" (trundles, cleans dead leaves, rolls up when glass is tapped — the shareable moment), glowbeetle (nocturnal, faint light trail).
- Arrival rules, not purchases: each species has spawn conditions (e.g., isopod arrives after 3 leaves have decayed). Journal hints at conditions cryptically.
- Behaviors: simple steering + need-driven targets (food, moisture, shade). 8–20 agents max.

### Real time & weather
- Day/night from device clock (`user local time`), including dawn/dusk gradients through the glass; jar backdrop sky matches.
- Season from date + hemisphere guess (locale/timezone). Season shifts palette, growth rates, available rares.
- **Weather (optional, graceful):** Open-Meteo free API, no key, client-side fetch of current conditions by coarse geolocation (ask politely, degrade to clock-only if denied/offline). Real rain = rain streaks on the outside of the glass + jar humidity bump. Real snow = frost creep on glass corners. Cache last fetch; never block on network.

### Offline catch-up
- On open: `elapsed = now - lastSeen`; run sim in coarse ticks (1 tick = 10 real min), cap at 14 days of progression per absence (returning after a month = 2 lush weeks of growth, still a wow). Render montage while ticking.

## 6. Interactions & feel

- Mist: swipe down anywhere → droplet particles, glass fog briefly, moisture up. Satisfying sound (soft shh).
- Tap glass: dull *tonk*, nearby bugs startle (pillbug rolls up), plants shiver 1px. Haptic tick if available.
- Tilt (DeviceOrientation, optional): parallax between jar layers — back glass, midground, foreground moss. Sells the diorama hard.
- Edit mode: long-press → drag hardscape (stones, driftwood, trinkets). Plants can't be moved (they live where they live — on-theme).
- Photo: button renders jar + date + weather stamp to PNG for sharing. Free marketing.

## 7. Visual & audio design

- Look: soft flat-shaded vector-ish canvas art, thin glass rim with specular streak, warm dark room behind the jar (vignette). Palette shifts with time of day. Condensation = subtle translucent droplets that grow/slide when humid.
- Plants render as stroked/filled segment chains with slight perpetual sway (per-segment sine, phase-offset) — the jar must never be fully still.
- Audio: near-silence. Room tone, occasional droplet, muffled real-weather (soft rain layer when raining locally), tiny skitter when bugs move fast. All synthesized/Web Audio, no files. Mutable, remembers choice.

## 8. Economy (deliberately gentle)

- Spores accrue from diversity (species count) + time, capped/day — no reason to grind. Spend on: seeds, jar shapes (round/hex/bulb), backdrops (windowsill, desk, cave), trinkets (tiny gnome, marble — nods to your marble game).
- No ads, no timers-to-skip, nothing purchasable that the ecosystem would otherwise give you. If it ever monetizes: one-time "Jarwright's Satchel" unlock (cosmetics bundle). Never sell survival — that's the brand promise.

## 9. AI toolchain plan (your current stack)

- **Claude Code (Codespaces):** entire build from this handoff. Single session, phases below.
- **Meshy premium:** model one hero glass jar + driftwood + stones as 3D renders → use as app icon, store/social art, and lucidwinds.com card image (a real 3D-rendered jar beauty shot will outclass every competitor's flat icon). Not used in-game (game is 2D canvas). If a WARDIAN 3D/VR successor ever happens (fits your WebXR beachhead strategy), these assets seed it.
- **Gemini Pro:** concept-art passes for species silhouettes + palette exploration (generate 10 moss/fern reference sheets, pick shapes worth encoding into the procedural rules); also good for quick hemisphere/season logic sanity checks.
- **ChatGPT Pro:** batch-write first-draft Jarwright journal entries + letters from a style sample (write 3 yourself as the voice anchor, have it draft 30, keep the best 15); store description copy variants.
- **Grok basic:** name/tagline stress-testing and social launch posts (it's good at short punchy copy); check WARDIAN name collisions.

## 10. Tech architecture (single file)

- Canvas 2D, portrait, DPR-aware. Fixed-timestep sim (1 live tick/sec is plenty — this is a slow world) + 60fps render (sway/particles interpolate independently of sim ticks).
- State = one JSON blob (env grid, plant trees, agents, journal, inventory, lastSeen, weatherCache) → localStorage, save on visibilitychange + every 60s. Export/import save as base64 string (kids switch devices).
- Plant segment trees serialize compactly (arrays, not objects, if size bites).
- Battery: when tab hidden, stop rAF entirely (sim catches up on return — same code path as offline catch-up, one system to test).
- PWA manifest + SW inline, installable, fully offline-capable (weather is the only network touch, optional).
- Perf budget: <400 plant segments live, <25 agents, <60 particles. Nothing here threatens a phone.

## 11. Build order

1. Jar shell + room backdrop + day/night sky from device clock (empty jar that already feels alive via light).
2. Soil grid + moisture + mist interaction + condensation.
3. Procedural plant engine + cushion moss + button fern growing in real minutes. **Stop and feel-test: watching a fern unfurl must be worth 30 seconds of anyone's attention before continuing.**
4. Offline catch-up sim + montage.
5. Fauna agents: springtails → pillbug (tap = roll up) → glowbeetle at night.
6. Journal + discovery events + Jarwright entries (seed with 8 written entries).
7. Spores, seed pouch, edit mode, trinkets.
8. Open-Meteo weather layer + season gating + rare species.
9. Photo export, PWA wrapper, save import/export, polish pass (sway, audio).

## 12. Stretch / later

- Jarwright letter drip system (milestone-triggered).
- Second jar slot ("the Jarwright left another…").
- Penny collab: let her design a species — name, look, journal entry, spawn rule. Ship it credited.
- Live wallpaper/widget exploration (PWA limits apply; a "glance mode" ultra-low-power render is the realistic version).
- Classroom angle: real decomposer-food-web science is in here; a one-page teacher note could open the school-distribution door alongside Diamond Rules.

## 13. Open questions for Stephen

- Name: WARDIAN (current) — historical, ownable, slightly mysterious. Alternatives: JARWORLD, STILL LIFE, THE QUIET JAR.
- Geolocation ask for weather: on first open (with a charming in-fiction prompt from the Jarwright) or buried in settings? (Recommend: settings + a journal hint that the jar "can listen to your sky" — opt-in discovery beats a permission popup on boot.)
- Hemisphere: auto-guess from timezone with a manual toggle, or just ask once?
