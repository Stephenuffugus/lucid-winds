# HANDOFF — FATHOM (Echolocation Game)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first.
**Deploy target:** Firebase Hosting / GitHub Pages, lucidwinds.com/satellites/fathom
**Session goal:** Playable vertical slice — 5 campaign levels + endless mode, full ping/lure loop working.

---

## 1. Concept

You are a small blind creature lost in a flooded cave system. The screen is **pitch black**. Your only sight is sound: tap to throw an **echo-stone** that arcs through the dark and *pings* where it lands, revealing the world in an expanding ring of light that fades back to black.

But everything down here hears too. Pings draw the things in the dark — toward the stone, not you. Your sonar is your decoy. See, or be safe, or spend stones to do both.

Find the exit. Don't get eaten. Remember what the light showed you.

**Tone:** eerie-beautiful, not horror. Bioluminescent deep-cave aesthetic. Tense but playable by a 10-year-old.

## 2. Market research summary (Sep 2026)

- Echolocation is an established itch.io micro-genre: bat cave flappers (Echo Bat), maze escapes (Darker than Dark, Echo Maze), one-button horror (The Broken Silence), stealth-with-limited-pings (ECHO by CosmicBrainz — HTML/CSS/JS, published this month, so the single-file approach is proven viable).
- Common mechanics across the genre: ping reveals world briefly → darkness returns; limited ping supply; enemies attracted to ping sound; memory navigation between pings.
- Google Play has automated-sweep variants (Sub-Surface Command pulses every 2s — removes player agency).
- **Gap identified:** every game pings from the *player's position*. None let you ping remotely. None make the ping a throwable object that doubles as an enemy lure. That's our hook.

**Positioning line:** "The only light is the sound you throw."

## 3. Core loop

1. Darkness. You know only where you are (faint player glow, 20px radius).
2. Tap anywhere → echo-stone arcs to that point (visible as a tiny falling spark), lands, PINGS.
3. Expanding ring reveals walls/objects/creatures it crosses; revealed geometry fades over ~2.5s.
4. Creatures within earshot swim toward the ping point.
5. You move (drag-joystick) through remembered space toward the exit while they're distracted.
6. Stones are limited. Pickups replenish. Manage the economy.

## 4. Controls (mobile-first)

- **Tap:** throw echo-stone to tap point. Max throw range ~40% of screen; taps beyond clamp to max range.
- **Drag anywhere:** relative virtual joystick (drag vector = movement direction/speed). Appears where the finger lands; disappears on release. Same scheme as your other satellites.
- **Double-tap on self:** "hum" — a free, weak self-ping. Radius ~120px, reveals only, but attracts creatures to YOU. Panic button / stone-free option with real cost.
- **Desktop:** WASD move, click to throw, spacebar hum.

## 5. Mechanics detail

### Echo-stones
- Start each level with N stones (level-tuned, 6–10). Endless mode: start 8.
- Stone flight: 350ms arc animation (tiny bright pixel + faint trail), then ping on landing.
- Stones can bounce off walls if thrown at one (lands at collision point, pings there) — this reads as fair, not punishing.
- Pickups: glinting stone caches (3 stones each) that faintly shimmer ONLY while inside an active ping ring — you must ping to find more pings. Core tension.

### The ping (the whole game feel lives here)
- Ring expands from landing point at ~300px/sec to max radius ~45% of screen diagonal.
- Wall segments "light up" the moment the ring's leading edge crosses them, then fade alpha over 2.5s (ease-out). This creates the signature "world sketched in by an expanding wave" look.
- Objects (creatures, pickups, exit) light the same way but creatures keep moving after reveal — you see a ghost of where they WERE. Fade time for creatures: 1.2s (shorter = scarier = better).
- Secondary echo (stretch): when the ring hits a large wall, spawn a dim half-strength ripple from the wall — real reflection feel. Phase 2, not slice.

### Creatures ("Lurkers")
- Blind. React only to sound. States: DRIFT (random slow wander), INVESTIGATE (beeline to last heard ping at 1.5× player speed, mill around for 3s, return to drift), FRENZY (if within 60px of player while player is moving fast or humming, chase actual position for 2s).
- Hearing radius: ~55% screen. Ping outside that = safe throw.
- Contact with player = caught → level restart (fast, no death screen drama; you're back in <1s). Kid-friendly.
- Visual: eel-like ribbon of dim red-orange dots, only visible when ping crosses them.
- Audio tell: faint slithering pan-positioned by Web Audio even when invisible — skilled players navigate by ear alone.

### Objective + extras
- **Exit:** a resonant crystal. When any ping ring crosses it, it "sings back" — a musical tone whose stereo pan + volume indicate direction/distance even after light fades. Wayfinding through sound.
- **Optional treasure:** 1–3 pearls per level for completionists; each pearl is guarded (placed near lurker drift paths).
- **Star rating:** stones remaining + pearls + time.

## 6. Level design

- **Campaign:** hand-authored JSON levels (walls as segment lists or grid). 5 for slice, 20 for launch. Teach in order: (1) ping+move, (2) stone economy/pickups, (3) first lurker + lure play, (4) hum tradeoff, (5) multi-lurker gauntlet.
- **Endless "The Deep":** procedural caves via cellular automata (grid → 4-5 smoothing passes → extract wall edges → marching-squares outline into segments). Depth counter as score; each descent adds lurkers and shrinks stone drops.
- Level size: 2–3 screens, camera follows player. Small enough to hold in memory — this is a memory game.

## 7. Audio design (Web Audio API, all synthesized, zero asset files)

- Ping: short sine blip + lowpassed noise burst, convolver-free "reverb" via 3 delayed echoes; delay times scaled by nearest-wall distance (big room = long slap-back). Sells space through sound.
- Crystal singback: soft triad, StereoPannerNode positioned, gain ∝ 1/distance.
- Lurkers: filtered brown-noise slither, panned to position, gain by proximity.
- Hum: low breathy tone from center.
- Ambient: near-silent low drone + occasional distant water drips (randomized, panned). Silence is the instrument — keep the mix sparse.
- All audio behind first-tap unlock (iOS requirement).

## 8. Visual design

- Palette: #000 base. Reveals in cold cyan-white (#9FE8FF) for walls, warm amber (#FFC97A) for pickups/exit, dim red (#FF5A4D) for lurkers, player glow soft teal.
- Line work only — 1.5px glowing strokes (shadowBlur or pre-blurred double-stroke for perf). No fills. The game should look like sonar sketching the world.
- Ripple ring itself: 2px arc, brightest at leading edge, subtle chromatic offset (draw twice, ±1px, cyan/white).
- HUD: minimal — stone count (bottom corner, small glyphs), nothing else. HUD dims to 20% when untouched 3s.

## 9. Tech architecture (single file)

- One `index.html`. Canvas 2D, devicePixelRatio-aware, `requestAnimationFrame` loop with fixed-timestep update (60Hz) + interpolated render.
- **World model:** walls as array of segments `{x1,y1,x2,y2, litAt:0}`. Lighting = per-segment timestamp when a ripple front crosses it; render alpha = f(now - litAt). No offscreen mask compositing needed — cheap and battery-friendly.
- Ripple check: for each active ripple, each frame test segments whose distance-to-center just fell inside [r_prev, r_now]. Spatial hash grid (cell 64px) to keep it O(nearby).
- Entities: player, lurkers, stones-in-flight, pickups, exit — plain objects in arrays, no classes needed beyond taste.
- Collision: player vs segments = circle-segment push-out; lurker pathing = straight seek + wall slide (no A*; caves are open enough, and dumb blind creatures SHOULD get confused by walls — it's diegetic).
- State machine: MENU → PLAY → CAUGHT → LEVELCLEAR → (next). localStorage for progress/best-depth. PWA manifest + service worker inline-generated (same pattern as other satellites).
- Perf budget: ≤ ~600 segments live, ≤ 6 ripples, ≤ 8 lurkers. Trivial for phones.

## 10. Build order (for the Claude Code session)

1. Canvas boot + loop + joystick movement + player glow (dark screen, you can move blind).
2. Segment world + one hardcoded room + circle-segment collision.
3. Ripple system: tap → instant ping at tap point (skip stone arc) → segments light/fade. **Stop and feel-test here — this moment must be magic before anything else gets built.**
4. Stone arc + throw range clamp + stone economy + pickups.
5. Exit crystal + level clear + level loader (JSON) + 5 campaign levels.
6. Lurkers: drift/investigate states, catch/restart.
7. Audio pass (ping, singback, slither, ambient).
8. Hum, frenzy state, star ratings, menu/progress, PWA wrapper.
9. Endless mode (cellular automata gen).

## 11. Stretch / later

- Secondary wall reflections; ripples that bend around corners (raycast occlusion — pings shouldn't reveal through walls; slice can ignore this, ship it in v1.1 as "true occlusion").
- Species 2: a lurker that pings BACK, revealing YOU to others.
- Daily depth-run seed; share card.
- Penny mode: no lurkers, infinite stones, just explore and find pearls.

## 12. Open questions for Stephen

- Name: FATHOM (current), or SOUNDER / PITCH / DARKWATER?
- Occlusion in slice or v1.1? (Recommend v1.1 — reveal-through-walls is forgiving for kids and 10× simpler.)
- Endless mode in slice or campaign-only first?
