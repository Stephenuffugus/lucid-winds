# 🐾 Puppy Dash — Art Production Bible

**A living asset manifest.** Generate everything here with Midjourney / Gemini / ChatGPT, keep it consistent, drop the finished files into the matching folder, and flip the status. When a new mechanic is added to the game, add its art states here *first* so nothing gets made twice in two different styles.

> **Golden rule for consistency:** lock the **hero puppy** first — its full sheet becomes the style reference (`--sref` / `--cref` seed) that every other animal, obstacle, and UI piece is generated against. Don't generate the fox until the puppy looks right.

---

## 0. How to use this doc

- **Status legend:** ⬜ not started · 🟡 in progress · 🟢 final-in-engine
- Each row has a **filename** — use it exactly so the engine wiring is predictable.
- **Owner** column: who's driving it (Stephen / Jessie / daughter).
- **Tool** column: which generator (MJ = Midjourney, GEM = Gemini, GPT = ChatGPT).
- Keep a one-line **changelog** at the bottom every session.

---

## 1. Art direction / style bible  *(the consistency anchor — read first)*

| Attribute | Decision |
|---|---|
| **Genre feel** | Subway-Surfers energy, but a sunny neighborhood **dog park**, not a subway. |
| **Tone** | Toy-like, chunky, friendly, rounded. Saturated and cheerful. Reads instantly at thumbnail size. |
| **Line / shape** | Thick rounded silhouettes, soft corners, minimal interior detail. Bold shapes over fine texture. |
| **Outline** | Subtle dark warm outline (not pure black) OR no outline — pick one and keep it everywhere. **Recommend:** soft `#3a2c1d` outline ~3–4px at 512 scale. |
| **Lighting** | Single soft top-light, gentle ambient occlusion under the belly/objects. No harsh shadows. |
| **Camera angle** | **Gameplay characters = 3/4 rear view** (running away from camera, like Subway Surfers). **Menu/select = front 3/4 hero portrait.** Obstacles = front 3/4 facing the player. This split matters — don't generate gameplay sprites front-on. |
| **Finish** | Flat-to-soft cel shading. **No** photoreal fur, **no** gradients-as-crutch, **no** drop-shadow baked into the sprite (engine adds shadows). |

### Locked palette (matches the engine's CSS variables)

| Token | Hex | Use |
|---|---|---|
| sky-top / sky-bot | `#74c4ff` / `#bfe9ff` | background gradient |
| grass / grass-dk | `#6fce5b` / `#4fae46` | field |
| path / path-dk | `#cda775` / `#b8935a` | the running track |
| bone / tan | `#f5e6c4` / `#e8b974` | biscuits, warm UI |
| accent / accent-dk | `#ff8a4c` / `#ef6f33` | buttons, highlights |
| cream / ink | `#fff8ec` / `#3a2c1d` | panels / text + outlines |

**Sunbeam (cross-game currency) palette:** warm gold `#ffd36b` → `#ffb13b`, soft white-gold glow. Keep sunbeams visually distinct from biscuits so the two currencies never get confused.

**Style prompt stub** (paste into every generation, then add the subject):
> *flat cel-shaded mobile game asset, chunky rounded toy-like shapes, soft warm dark outline, single soft top light, saturated cheerful palette, transparent background, centered, no drop shadow, clean vector-style*

---

## 2. Technical production specs

| Spec | Value |
|---|---|
| **Source resolution** | Generate at 1024² or larger, deliver trimmed PNGs at **512²** per frame. Downscale, never upscale. |
| **Format** | PNG, transparent background (alpha), trimmed to content + 4% padding. |
| **Anchor / pivot** | **Bottom-center = ground contact.** Every character/obstacle frame must sit on the same baseline so it doesn't bounce when swapped. Overhead banners anchor bottom-center of their posts. |
| **Animation FPS** | Author at **12 fps** (engine can interpolate). Run cycles must loop seamlessly. |
| **Sprite sheets** | One horizontal strip per state: `*_sheet.png` + a `*.json` with `{frameWidth, frameHeight, frames, fps}`. Single frames fine to start. |
| **Naming** | lowercase, underscores, zero-padded frames: `char_puppy_run_03.png`, `obs_hydrant.png`, `ui_btn_play.png`, `fx_pop_02.png`. |
| **Folders** | `/art/characters/<animal>/` · `/art/obstacles/` · `/art/collectibles/` · `/art/environment/` · `/art/ui/` · `/art/fx/` |

---

## 3. CHARACTERS  *(the big one)*

Four playable animals. Each needs the **full state set** below. **Do the puppy completely first**, lock the look, then clone the exact prompt structure for the others so all four feel like one family.

### 3a. Animation states required per animal

| State | Frames | In engine now? | Notes |
|---|---|---|---|
| `idle` | 3–4 (loop) | menu | gentle breathing + tail wag; used on select screen too |
| `run` | 6–8 (loop) | ✅ yes | core cycle, 3/4 **rear** view, must loop seamlessly |
| `jump` | 6 | ✅ yes | full arc — see breakdown §3c |
| `slide` | 4 | ✅ yes | duck/skid under banner — see breakdown §3c |
| `stumble` / `hit` | 3–4 | planned | the game-over moment (tumble / startled) |
| `celebrate` | 4–6 (loop) | planned | high score / win pose |
| `portrait` | 1 static | menu | front 3/4 hero shot for the select card |

> That's roughly **27–32 frames per animal × 4 animals ≈ 110–130 character frames** at full scope. See §8 for the minimum-viable subset if you want to ship sooner.

### 3b. Per-animal checklist

| Animal | Color ref | idle | run | jump | slide | stumble | celebrate | portrait | Owner | Tool | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Puppy** (hero) | golden `#d9a05b` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | ⬜ |
| **Kitten** | gray `#9aa3ad` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | ⬜ |
| **Bunny** | white `#f2f2f2` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | ⬜ |
| **Fox** | orange `#ef7d3a` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | ⬜ |

### 3c. Animation frame breakdowns (do these while the character is fresh)

**RUN (6–8 frames, looping, 3/4 rear):**
1. contact (lead paw down) · 2. down (body lowest) · 3. pass (legs cross under) · 4. up (push-off, body highest) · 5. contact (other paw) · 6. down · *(7–8 optional for smoothness)*. Tail and ears trail the motion.

**JUMP (6 frames):**
1. **anticipation** — crouch, weight down · 2. **launch** — legs extend, leaving ground · 3. **rise** — body stretched up, legs tucking · 4. **peak** — apex, legs fully tucked, ears up · 5. **fall** — front paws reaching down · 6. **land** — crouch-absorb (can blend back to run frame 1).

**SLIDE (4 frames):**
1. **drop** — front paws forward, body lowering · 2. **skid** — fully flattened/stretched low, ears back · 3. **hold** — sustained low pose · 4. **recover** — rising back toward run.

**STUMBLE/HIT (3–4 frames):** startled → trip/tumble → flat/dazed. This is the punctuation on every death, so make it readable and a little funny.

---

## 4. OBSTACLES

These face the player (front 3/4). Each obstacle's **action type** must match the engine (`jump` / `slide` / `dodge`). Optional 2-frame wobble or break adds polish but isn't required for v1.

| Asset | Filename | Action | Frames | In engine? | Owner | Tool | Status |
|---|---|---|---|---|---|---|---|
| Fire hydrant | `obs_hydrant.png` | jump over | 1 (+wobble opt) | ✅ | | | ⬜ |
| Traffic cone | `obs_cone.png` | jump over | 1 | ✅ | | | ⬜ |
| Wooden fence | `obs_fence.png` | dodge (lane) | 1 | ✅ | | | ⬜ |
| Overhead banner | `obs_banner.png` | slide under | 1 | ✅ | | | ⬜ |
| Puddle / mud | `obs_puddle.png` | jump over | 1 + ripple | planned | | | ⬜ |
| Trash can | `obs_trashcan.png` | dodge | 1 (+lid wobble) | planned | | | ⬜ |
| Sleeping cat | `obs_sleepingcat.png` | jump over | 2 (breathing) | planned | | | ⬜ |
| Rolling ball | `obs_ball.png` | dodge/jump | 4 (roll loop) | planned | | | ⬜ |

---

## 5. COLLECTIBLES & POWER-UPS

| Asset | Filename | Frames | In engine? | Notes |
|---|---|---|---|---|
| **Biscuit / bone** (coin) | `collect_biscuit_##.png` | 6 (spin loop) | ✅ (placeholder) | the runner's cosmetic currency |
| **Golden biscuit** | `collect_biscuit_gold_##.png` | 6 | planned | rare, worth more |
| **☀️ Sunbeam token** | `collect_sunbeam_##.png` | 6 (shimmer) | planned | **cross-game** → mints into Lucid Winds. Gold glow, distinct from biscuits. |
| Magnet power-up | `power_magnet_##.png` | 4 | planned | pulls biscuits |
| **🌈💩 Rainbow-poop jetpack pickup** | `power_jetpack_##.png` | 4 (pulse) | ✅ (procedural) | the hero power-up. Currently a smiling rainbow-poop swirl drawn in code — replace with art or keep the vector gag. |
| **Rainbow-poop exhaust trail** | `fx_pooptrail_##.png` | 4–6 loop | ✅ (procedural) | the thrust swirl + rainbow chunks while flying. Could stay procedural. |
| Speed/zoomies power-up | `power_zoomies_##.png` | 4 | planned | temporary boost + speed lines |
| Shield/bubble | `power_shield_##.png` | 4 | planned | one free hit |
| Power-up HUD timers | `ui_timer_<type>.png` | 1 each | planned | active-effect indicators (jetpack fuel bar exists in-engine) |

---

## 6. ENVIRONMENT & PARALLAX BACKGROUND

Layered back-to-front for depth (each scrolls at a different speed).

| Asset | Filename | Notes | Status |
|---|---|---|---|
| Sky gradient | `env_sky.png` | or keep the engine CSS gradient | ⬜ |
| Cloud set (3–4) | `env_cloud_##.png` | drifting, parallax | ⬜ |
| Far skyline (houses/trees) | `env_skyline.png` | slow parallax band | ⬜ |
| Mid trees / bushes | `env_tree_##.png`, `env_bush_##.png` | line the path | ⬜ |
| Path / track tile | `env_path_tile.png` | seamless vertical tile for the running surface | ⬜ |
| Grass field tile | `env_grass_tile.png` | seamless | ⬜ |
| Lane divider marker | `env_lane_dash.png` | the scrolling rail lines | ⬜ |
| Park props (benches, fire hydrants, lamps, balloons) | `env_prop_<name>.png` | non-collidable set dressing | ⬜ |
| Start gate / finish arch | `env_gate.png` | run intro/outro flourish | ⬜ |

---

## 7. UI / HUD / SCREENS

| Asset | Filename | Notes | Status |
|---|---|---|---|
| Logo / wordmark | `ui_logo.png` | "PUPPY DASH" | ⬜ |
| Biscuit HUD icon | `ui_icon_biscuit.png` | top-left counter | ⬜ |
| Sunbeam HUD icon | `ui_icon_sunbeam.png` | **cross-game currency** display | ⬜ |
| Distance icon | `ui_icon_dist.png` | | ⬜ |
| Heart / lives | `ui_heart_full.png`, `ui_heart_empty.png` | if you add lives | ⬜ |
| Play button | `ui_btn_play.png` | | ⬜ |
| Retry button | `ui_btn_retry.png` | | ⬜ |
| Pause / resume | `ui_btn_pause.png`, `ui_btn_resume.png` | | ⬜ |
| Sound on/off | `ui_btn_sound_on.png`, `ui_btn_sound_off.png` | | ⬜ |
| Character select card frame | `ui_card.png` + `ui_card_selected.png` | | ⬜ |
| Lock icon (locked animals) | `ui_lock.png` | for unlockables | ⬜ |
| Panel / dialog background | `ui_panel.png` | game-over card, shop | ⬜ |
| Coin/biscuit shop tiles | `ui_shop_tile.png` | cosmetic store | ⬜ |
| Cosmetic preview frames | `ui_cosmetic_<name>.png` | hats, collars, bandanas → tie to hash-SVG skins | ⬜ |

---

## 8. FX / PARTICLES

| Asset | Filename | Frames | Notes | Status |
|---|---|---|---|---|
| Biscuit collect pop | `fx_pop_##.png` | 4 | sparkle burst on pickup | ⬜ |
| Sunbeam collect burst | `fx_sunbeam_##.png` | 5 | gold radiant flash | ⬜ |
| Run dust puff | `fx_dust_##.png` | 4 | under paws while running | ⬜ |
| Jump poof | `fx_jumppoof_##.png` | 3 | at launch | ⬜ |
| Land impact | `fx_land_##.png` | 3 | on touchdown | ⬜ |
| Hit stars | `fx_hitstars_##.png` | 4 | on stumble/death | ⬜ |
| Speed lines | `fx_speedlines.png` | 1 (tileable) | overlay during zoomies | ⬜ |
| Confetti | `fx_confetti_##.png` | 6 | celebrate / high score | ⬜ |

---

## 9. 🎯 Minimum viable art set (ship-it-sooner subset)

If you want the game looking *finished* with the least work, generate **only these first** — everything else is polish:

- **Puppy:** `run` (6), `jump` (6), `slide` (4), `stumble` (3), `portrait` (1)
- **Collectibles:** `biscuit` spin (6)
- **Obstacles:** hydrant, cone, fence, banner (4 stills)
- **Environment:** path tile, grass tile, cloud, far skyline
- **UI:** logo, biscuit icon, play button, retry button, panel
- **FX:** collect pop (4), dust puff (4)

That's ~50 frames and the game reads as a complete product. Add the other three animals + power-ups + sunbeams as content drops.

---

## 10. Cross-tool consistency workflow

1. **Build the puppy character sheet first** in one tool (Midjourney is strongest for consistent characters). Get idle + run looking right.
2. In Midjourney, reuse it as a **style reference** (`--sref`) and **character reference** (`--cref`) for every subsequent animal and pose so the family matches. In ChatGPT/Gemini, paste the finished puppy as an attached reference image in the prompt and say "same style, same line weight, same palette."
3. Generate **all poses of one animal in a single session** (your instinct is right) — the model holds the character in context and frames stay consistent.
4. Always append the **style prompt stub** from §1 + "transparent background, centered, bottom-center grounded."
5. Trim + downscale to 512², drop into the right `/art/...` folder, rename per convention, flip the status here.
6. Generate **obstacles and FX last**, referencing the same palette so the whole scene reads as one world.

---

## 11. Non-art assets to track (placeholder — for later)

Quick parking lot so audio doesn't get forgotten: bark/collect SFX, jump whoosh, land thud, stumble yelp, biscuit chime, sunbeam shimmer, button tap, background music loop (your cholo lo-fi / neo-soul aesthetic could give this a signature vibe nobody else's runner has).

---

## Changelog
- **2026-06-04** — Doc created. Engine has: 4 animals (placeholder vector art), run/jump/slide, 4 obstacles (hydrant, cone, fence, banner), biscuit collectible, parallax clouds. Art states catalogued; nothing final yet.
- **2026-06-05** — Prototype "final" pass. Engine now: screen-space collision (rebuilt), action-telegraph icons, debug hitbox overlay, **rainbow-poop jetpack power-up** (flight + invincibility + bone stream), synthesized SFX, pause, best-score, combo, floating bonuses, screen shake, squash-and-stretch. Obstacle set: hydrant/cone (jump), solid wall (dodge), limbo bar (slide). Next real work moves to Claude Code (see BUILD_SPEC) — art import → hitbox re-tune → Firebase economy.
