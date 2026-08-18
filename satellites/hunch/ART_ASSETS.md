# HUNCH — Art Asset Production Spec

Everything we want made, organized so you can batch-generate in Midjourney / Gemini / GPT
and hand back. Each item lists **purpose · quantity · size · format · a prompt seed**.
Read **§0 first** — the global style brief + the prompt suffix make every asset cohere.

> When you deliver files, drop them in the folders noted under each section (I'll create them)
> and follow the **naming convention** so I can wire them straight into the game.

---

## §0 — GLOBAL STYLE BRIEF (read first)

**The vibe:** HUNCH is a drawing game where a mischievous AI "reads your mind." Dark, premium,
neon-arcade, a little retro-future. Playful but sleek — not childish, not corporate.

**Palette (use these exact hexes):**
- Background near-black: `#0d0e1a` · panel `#16182b` · line `#2c3052`
- Text `#eef0ff` · dim `#8a90b8`
- **Primary accent — electric lime `#c8ff4d`** (the HUNCH signature)
- Secondary accent — teal `#5eead4`
- Hit/positive `#7CFC9B` · miss/negative `#ff6b81` · fire/streak `#ffac4d`

**Typography reference (don't bake text into art unless asked):** Space Grotesk (geometric sans),
Space Mono for numbers.

**Global prompt suffix — append to every prompt for consistency:**
> `dark navy-black background #0d0e1a, electric lime #c8ff4d and teal #5eead4 accents, neon glow,
> clean vector + subtle film grain, premium mobile-game UI, retro-future arcade mood, crisp,
> centered, high contrast, no text`

**Technical rules (important for it to actually drop into the app):**
- **Transparent PNG** for anything that sits on the canvas/UI (icons, characters, stickers, brush tips, frames). Say "transparent background" in the prompt AND export with alpha.
- Deliver at **2×–3×** the display size (Retina). Square assets: provide **1024×1024** masters; I downscale.
- **Consistent framing** within a set (same padding, same eye-line for characters) so they don't jitter when swapped.
- Prefer **SVG** for flat UI marks (coin, flame, badges) if your tool can; otherwise PNG is fine.
- Keep a **~12% safe margin** on icons (no important detail at the very edge).

**Naming convention:** `category_name_state@scale.png` — e.g. `persona_critic_idle@3x.png`,
`ink_watercolor_tip.png`, `frame_gold.png`, `theme_sunset_bg.png`.

---

## §1 — PRIORITY ORDER (make these first)

1. **App icon + store assets** (§2) — needed for the store listing, can't ship without them.
2. **Persona characters** (§3) — biggest visual upgrade; turns emoji into a cast. Also the richest unlockable.
3. **Coin + currency art** (§8) — tiny, used everywhere the moment the shop exists.
4. **Brush/ink tips** (§4) — directly sellable cosmetics, low effort, high delight.
5. Everything else (themes, stickers, frames, effects) as you have bandwidth.

---

## §2 — BRAND & STORE ASSETS

Folder: `icons/` and `store/`

| Asset | Qty | Size | Format | Notes |
|---|---|---|---|---|
| **App icon (master)** | 1 | 1024×1024 | PNG (no alpha) | The face of the app. Rounded-square handled by OS — fill the full square. |
| **Android adaptive icon** | 2 | 1024×1024 each | PNG | A **foreground** (transparent, logo centered in inner 66%) + a **background** (solid/gradient). |
| **Maskable safe icon** | 1 | 1024×1024 | PNG | Key art within center 80% circle (Android masks to circle/squircle). |
| **Splash / launch screen** | 1 | 2048×2048 | PNG | Logo centered on `#0d0e1a`, generous padding (gets cropped per device). |
| **Play Store feature graphic** | 1 | 1024×500 | PNG/JPG | Banner: logo + tagline space + a hero character. |
| **Screenshot backdrops** | 3–5 | 1290×2796 | PNG | Phone-frame-friendly backgrounds we composite real screenshots onto. |

**Icon prompt seed:**
> app icon for "HUNCH", a single bold neon-lime pencil tip morphing into a glowing AI eye/circuit,
> minimal iconic mark, centered, [global suffix], solid dark background, no rounded corners

---

## §3 — PERSONA CHARACTERS  ⭐ (the cast — highest-value unlockable)

Folder: `assets/personas/`

The AI "machine" speaks in-character. Today they're emoji; we want **real mascot art**. They appear
(a) as a **selectable chip** on the start screen (~64px) and (b) larger on the **thinking/result** screen
(~160px). So we need each character readable both tiny and large.

**Make them a consistent set:** same art style, same framing (head-and-shoulders or chest-up),
each a distinct silhouette + signature color. Think "expressive vinyl-toy / modern mascot," glowing,
slightly machine/robotic undertone (they ARE the machine wearing a personality).

**Per character — deliver 1024×1024 transparent PNG, plus (stretch) 3 expressions: `idle`, `thinking`, `reveal`.**

| id | Name | Personality | Prompt seed (append global suffix) |
|---|---|---|---|
| `critic` | **The Critic** | Overconfident gallery art-critic, theatrical, monocle energy | a snooty robot art-critic mascot, monocle, raised eyebrow, tiny beret, holding a paddle, smug |
| `noir` | **Detective** | Hard-boiled 1940s private eye | a noir detective robot mascot, trench coat + fedora, shadowy, cigarette-smoke wisp, rain mood |
| `sunny` | **Sunny** | Relentlessly cheerful optimist | a beaming sun-faced robot mascot, warm radiant glow, big friendly eyes, sunbeam halo |
| `gremlin` | **Gremlin** | Chaotic, mischievous goblin | a chaotic green gremlin robot mascot, jagged teeth grin, sparks, gleeful troublemaker |
| `zen` | **The Oracle** | Mystical fortune-teller | a serene mystic oracle robot mascot, glowing third eye, crystal-ball belly, cosmic aura |

**Also (stretch — these become premium shop unlocks):** alternate **outfits/skins** per persona
(e.g. Critic in a tuxedo, Detective in noir-red, Gremlin "golden gremlin"). Same character, restyled.
Name them `persona_<id>_<skinname>.png`.

---

## §4 — INK / BRUSH TIPS  (sellable, low-effort)

Folder: `assets/cosmetics/inks/`

Right now inks are CSS effects (neon/gold/rainbow). With **brush-tip textures** we can sell real
brush *feels*. Deliver each as a **small grayscale-or-color PNG "stamp"** (256×256, transparent) that
gets repeated along the stroke. Grayscale = I can tint it any pen color; full-color = fixed look.

| Ink | Tip texture prompt | Tint? |
|---|---|---|
| Watercolor | soft watercolor blot, bleeding edges, paper texture | grayscale |
| Chalk | chalky rough circular smudge, dusty | grayscale |
| Crayon | waxy crayon stroke texture, grainy | grayscale |
| Spray paint | aerosol spray dot scatter, soft edge | grayscale |
| Marker | felt-tip marker blot, slightly translucent | grayscale |
| Glitter | sparkling glitter speckle cluster | color |
| Fire | small flame/ember puff | color |
| Ice | frosty crystalline shard cluster | color |
| Galaxy | starfield nebula speckle | color |
| Pixel | blocky 8-bit square cluster | grayscale |

(Also fine to deliver a few as **swatch thumbnails** 72×72 for the shop row if the tip alone reads poorly.)

---

## §5 — THEMES (UI palettes + optional backgrounds)

Folder: `assets/cosmetics/themes/`

Themes recolor the UI (we already have Lime/Sunset/Bubblegum/Ice/Mono). Art is **optional** — but a
subtle **themed background texture** (the radial-gradient backdrop) sells it. Per theme, optional:

| Asset | Size | Notes |
|---|---|---|
| Background texture | 1500×1500 | very subtle, dark, themed glow — must not reduce text contrast |
| Shop swatch (if not auto) | 72×72 | the little color tile in the shop row |

Prompt seed: `subtle dark abstract background glow in <theme> colors, premium, minimal, low-contrast, [global suffix]`

New theme ideas to design palettes for (give me 2 hexes each): **Vaporwave, Blood Moon, Forest, Mono-light, Gold-lux.**

---

## §6 — STICKERS / STAMPS  (new cosmetic category — drop onto the drawing)

Folder: `assets/cosmetics/stickers/`

A future shop category: stamps the player taps onto the canvas. Sell in **packs of ~8**.
Each sticker: **256×256 transparent PNG**, bold, readable, consistent within a pack.

Starter packs to make:
- **Doodle pack** — star, heart, lightning, cloud, arrow, sparkle, squiggle, sun
- **Reaction pack** — speech bubble, "?!", crown, fire, skull, 100, eyes, thumbs-up
- **Machine pack** — tiny robot faces / circuit bits matching the personas

Prompt seed: `set of bold simple sticker icons, thick outline, flat vibrant fill, consistent style, [global suffix]`

---

## §7 — LEADERBOARD FLAIR: FRAMES · BADGES · TITLES  (the social flex)

Folder: `assets/cosmetics/flair/`

These show **next to your name on the shared leaderboard** — the most motivating cosmetic because
*others see it*. (Server + moderation work pending, but the art can be made now.)

| Asset | Qty | Size | Notes |
|---|---|---|---|
| **Avatar frames** | 6–8 | 256×256 transparent | Ring/border around a name's avatar slot: bronze, silver, gold, neon, fire, ice, animated-look. |
| **Rank badges** | 3 | 128×128 transparent | #1 / #2 / #3 medallions (we use 🥇🥈🥉 now — upgrade them). |
| **Title plates** | 5 | 320×80 transparent | Small banner behind a title like "Mind Reader," "Streak Lord" (text added by us — leave blank plate). |
| **Streak flames** | 3 | 128×128 transparent | Tiered flame for 🔥 streak (small/medium/inferno). |

Prompt seed (frame): `circular ornate avatar frame, <metal/neon> material, glowing, transparent center, game UI, [global suffix]`

---

## §8 — COINS & CURRENCY

Folder: `assets/currency/`

| Asset | Qty | Size | Notes |
|---|---|---|---|
| **Coin icon** | 1 | 256×256 transparent | The 🪙 we use everywhere. A lime-glowing "H" coin would be on-brand. |
| **Coin stacks** | 4 | 512×512 transparent | Small/medium/large/huge piles — for future "buy coins" IAP bundles. |
| **Coin burst** | 1 | 512×512 transparent | Scatter of coins for the "earned coins" celebration. |

Prompt seed: `glowing circular game coin, embossed letter H, electric lime metal, neon rim light, [global suffix]`

---

## §9 — EFFECTS & MISC UI

Folder: `assets/fx/`

| Asset | Qty | Size | Notes |
|---|---|---|---|
| **"MIND READ" stamp** | 1 | 600×300 transparent | Slams onto a hit result (we animate it). Bold, ink-stamp look, lime. |
| **"SWING & MISS" stamp** | 1 | 600×300 transparent | Same for a miss, in miss-red. |
| **Confetti / celebration sprites** | 8–12 | 128×128 each | Individual particles (stars, sparkles, coins, scribbles) we rain on a big score. |
| **Empty-state / mascot doodle** | 1–2 | 800×800 transparent | For empty leaderboard / first launch — a charming "the machine waiting" illustration. |
| **Achievement badges** | ~8 | 256×256 transparent | First hit, 10-streak, daily-streak-7, perfect-100, etc. (future achievements system). |

---

## §10 — DELIVERY CHECKLIST

- [ ] §2 App icon + adaptive + splash + feature graphic
- [ ] §3 Five persona characters (idle at minimum)
- [ ] §8 Coin icon
- [ ] §4 Brush tips (pick your favorite 4–5 to start)
- [ ] §5 Theme backgrounds (optional) + new palette hexes
- [ ] §6 One sticker pack
- [ ] §7 Frames + upgraded rank badges + streak flames
- [ ] §9 Hit/Miss stamps + confetti

As assets land in these folders, tell me and I'll wire them in (persona art → persona chips/screens,
brush tips → a real textured-brush ink system, frames/badges → leaderboard, icon → manifest + store).
