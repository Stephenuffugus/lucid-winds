# Litter Bug — Project Handoff

> A cozy collection game where players forage real and virtual trash, run it through generative mini-games, and incubate procedurally unique insects that live, breed, and spread in a shared world map.

This document is the onboarding brief for the Claude Code instance picking up Litter Bug. You are starting from a working skeleton with a battle-tested procedural-art engine already wired in.

The skeleton ships with:

* SHA-256 hash pipeline producing deterministic insect traits
* A layered SVG compositor stub ready for new art per anatomy layer
* A rarity scoring function
* A jsdom smoke harness so regressions fail fast
* Stripe checkout PHP template for monetization when ready

You do not need to invent the engine. You need to flesh out the art layers, build the game loop UI, and add the systems specific to Litter Bug.

---

## 0. TL;DR

**What this is:** Cozy collection game. Players forage trash three ways (tap-to-scrounge from home, geo-walk to real-world points, scan real-world barcodes). Trash items combine in an incubator to hatch procedurally unique insects from a quintillion-combination layered art system. Insects can be released to a real-world map where they breed and spread.

**Tech stack:** Same single-file vanilla JS / HTML5 stack used by the engine you are inheriting. No frameworks. No build step. Open `index.html` in any modern browser and it runs.

**What is already in the skeleton:**
* `index.html` with the SHA-256 token creator and the layered renderer pattern
* Trash item catalog and signature recipe table from the original React prototype, ported to plain JS
* A minimal Lab + Bugdex UI loop so you can hand-test
* `scripts/smoke.js` jsdom harness with 5+ green tests guarding the engine surface
* `api/` PHP endpoint template for Stripe checkout (offline by default until you add a real `stripe-config.php`)

**What you build next:**
* Real insect anatomy renderers per layer (the skeleton emits a placeholder SVG)
* Mini-game system for seed finalization (Sift, Pin, Hatch)
* Bugdex UI polish
* Real-world layer (Leaflet map, GPS spawning, ecology sim) for v1.1

**v1 scope (Stephen-approved cut):** Forage button, inventory, incubator UI, procedural bug renderer, Bugdex. No map, no scanner, no breeding sim yet. Those land in v1.1.

---

## 1. Game Vision

**Tagline:** *Make little lives out of what people threw away.*

**Pillars:**
1. **Cozy and tactile.** No timers, no fail states. Slow, generous, satisfying.
2. **Endlessly discoverable.** Combinatorial layer space is effectively infinite.
3. **Quietly social** (later). You play solo; other players' bugs drift through your map at v1.1.
4. **Short or long sessions.** A 90-second forage on the bus is a complete loop; a 2-hour session is also a complete loop.

**Audience:** Stardew Valley, Bugsnax, Cozy Grove, Pokemon Sleep players. TikTok / streamer demographic that lifted *Spiritfarer* and *A Short Hike*.

**Distinguishing hook:** Procedural insects derived from a player's actual inputs (tapping, walking, scanning). Every bug a player makes is theirs forever, deterministic from a moment in real life.

---

## 2. Core Game Loop

```
Acquire trash  →  Generate seed code  →  Incubate  →  Hatch bug  →  Release to world  →  Bug breeds, spreads  →  New finds appear on map
```

Three parallel trash acquisition paths:

* **Forage at home** — tap to scrounge through procedurally-generated trash piles. Fastest, lowest reward. *(In skeleton.)*
* **Geo-walk** — visit real-world locations on a Leaflet map. Themed rewards by OSM category. *(v1.1)*
* **Scan** — point camera at a real-world barcode. Highest quality, rate-limited. *(v1.1)*

Seed code generation: each piece of trash carries a partial seed. To finalize a bug, the player completes a mini-game whose touch input feeds the SHA-256 hasher and produces the final hash. *(v1)*

Incubation: combine two trash items. Engine returns a deterministic bug. Bug enters the Bugdex.

Release: drop a bug onto a chosen geographic territory. It breeds with nearby bugs (yours plus other players') and spreads along the map. *(v1.1)*

---

## 3. Bug Generation Engine

### 3.1 What you inherit

The skeleton ships a working pipeline:

* `hashToTraits(hash)` — takes a 64-char hex, returns a trait object keyed off specific hash bytes
* `_generateBugSVG(hash, size, opts)` — placeholder renderer; you replace its layer functions with real art
* `getBugGrade(traits)` — rarity scorer; same tier ladder as the parent engine (Common → Cosmic)
* `TRAIT_BANK` — data tables with starter entries per layer

You should **not** rewrite these functions. Extend `TRAIT_BANK` with more entries and replace the placeholder render functions with real SVG art.

### 3.2 Layer schema

Eight ordered layers per the design doc:

```
Layer 1: Body shape (thorax + abdomen silhouette)   ~30 variants at launch, expandable
Layer 2: Head / mandibles                           ~25 variants
Layer 3: Wing pair (or none)                        ~40 variants — biggest visual variety
Layer 4: Legs                                       ~20 variants
Layer 5: Antennae                                   ~15 variants
Layer 6: Surface pattern / texture                  ~50 variants
Layer 7: Color palette                              ~80 palettes, possibly procedural
Layer 8: Behavior tag (affects map/breeding sim)    ~12 tags
```

At launch counts: `30 × 25 × 40 × 20 × 15 × 50 × 80 × 12 ≈ 2.16 × 10¹²` unique bugs. Adding even 5 variants to a single layer scales exponentially; content drops are cheap.

### 3.3 Hash byte assignment

The skeleton's `hashToTraits` reads specific hash bytes for each layer. Lock this map down before you start; changing it after players have collected bugs makes their bugs change appearance, which would be a disaster.

Current assignment (locked in skeleton):

| Hash bytes | Layer |
|---|---|
| `hb(0)` | Body shape |
| `hb(1)` | Head |
| `hb(2)` | Wings (high byte = no wings) |
| `hb(3)` | Legs |
| `hb(4)` | Antennae |
| `hb(5)` | Surface pattern |
| `hb(6)` | Color palette |
| `hb(7)` | Behavior tag |
| `hb(16)` | Mutation byte (rare cosmetic overlays) |
| `hb(18)` | Mythic-creature override byte (rare archetype) |

The remaining bytes (8-15, 17, 19-31) are reserved for future layers and entropy. **Do not consume those without a versioned migration plan.**

### 3.4 Signature vs procedural bugs

* **Signature bugs** (~50-150 hand-crafted): explicit input recipes, named species, custom lore, hero art. The bugs streamers screenshot.
* **Procedural bugs** (everything else): auto-generated name + lore from input tags. Deterministic from the input pair, so the same combination always produces the same bug. Feels like discovery, not noise.

The skeleton ships both pathways working (12 signature recipes + a tag-based procedural fallback). Extend by adding rows to `SIGNATURE_RECIPES` and `SIGNATURE_BUGS`.

---

## 4. Input Systems

### 4.1 Forage (basic tap) — in skeleton

Player taps "Scrounge the Alley", 1-3 trash items appear from a weighted random table. Inventory grows. Good for short sessions.

### 4.2 Mini-games (seed finalization) — build for v1

Triggered when the player commits trash to the incubator. The mini-game's output (touch path, rhythm timing, drawn shape) feeds the SHA-256 hasher to finalize the bug.

Suggested first mini-game: **Sift.** Player drags their finger through a trash pile to "uncover" the bug. Touch path becomes the seed.

Mini-games live in `games/<id>.js` modules. Each exports `start(callback)` and calls back with a hex seed string.

### 4.3 Geo-walk (Leaflet) — v1.1

Leaflet + OpenStreetMap (free tiles, no API key). Trash piles spawn at POI from OSM tags. Player walks within ~30m of a pile to collect.

### 4.4 Scanner — v1.1

Camera + `@zxing/library` for barcodes. On-device, no API cost. Server-side dedup so same barcode cannot be scanned more than once per 24h globally.

---

## 5. World & Ecology (v1.1+)

* Bugs released to map have territory (polygon ~200m radius)
* Lifespan: soft cap 7-30 real-world days
* Diet/affinity tags from layers 7-8 drive breeding rules
* Breeding sim ports cleanly from the parent engine's plant reproduction

**Open decision:** shared global world vs per-player worlds with social peeks. Cheap per-player is the recommended start; upgrade to shared if it takes off.

---

## 6. Trash Catalogue & Recipes

Three flat tables drive the entire crafting system (already in the skeleton):

```js
TRASH_ITEMS        // { id, name, icon, tags[] }
SIGNATURE_RECIPES  // [{ inputs: [id, id], bug: bugId }]
SIGNATURE_BUGS     // { id, name, icon, rarity, desc }
```

Procedural recipe fallback (`generateProceduralBug(id1, id2)`) handles any pair without an explicit recipe. Inputs are sorted and hashed deterministically, so the same pair always produces the same bug.

**Scaling implication:** Writing 1000 trash items requires zero new recipe lines. The game scales with item count, not with recipe count.

---

## 7. Reuse Map — What Came From the Parent Engine

The parent project is a botanical game called Lucid Winds (`lucidwinds.com`). It is in production. The following pieces are battle-tested and have been adapted into your skeleton:

| Parent module | Litter Bug use | Status in skeleton |
|---|---|---|
| `hashToTraits` (plant traits) | `hashToTraits` (bug traits) | Adapted with new layer schema |
| `_generatePlantSVG` (plant renderer) | `_generateBugSVG` (bug renderer) | Stub in place, you replace per-layer renderers |
| `getTerraGrade` (plant rarity) | `getBugGrade` (bug rarity) | Adapted |
| Mutation byte handling | Same pattern, new effects | Adapted |
| `TRAIT_BANK` data shape | `TRAIT_BANK` for bugs | Stub with 5 entries per layer |
| Stripe `api/create-tip-session.php` | `api/create-checkout-session.php` | Template ready |
| `scripts/smoke.js` jsdom harness | Same | Adapted, 5 green tests |
| Leaflet wild-map module | v1.1 — port when ready | Not yet ported |
| Wild reproduction / breeding | v1.1 — port when ready | Not yet ported |

What was **not** ported:
* Pi Network SDK and Cloud Functions (Litter Bug does not need them)
* Greenhouse / nursery / breeding UI (different game)
* Mini-games from parent (Litter Bug has its own: Sift, Pin, Hatch)
* Climate damage system (no real-weather damage in v1)

---

## 8. Repo Structure

```
litter-bug/
├── index.html                        # single-file game
├── CLAUDE.md                         # project instructions for Claude Code
├── HANDOFF.md                        # this file
├── README.md                         # quick start for humans
├── .gitignore
├── api/
│   ├── create-checkout-session.php   # Stripe (live when stripe-config.php uploaded)
│   └── stripe-config.example.php     # template — real file lives on server only
├── assets/
│   ├── bugs/                         # PNG art per bug part (later — SVG first)
│   ├── trash/                        # PNG icons per trash item (later)
│   └── ui/                           # buttons, badges, frames
├── games/                            # mini-game modules
│   ├── sift.js                       # first mini-game
│   ├── pin.js
│   └── hatch.js
└── scripts/
    └── smoke.js                      # jsdom safety harness
```

Same flat single-file approach as the parent engine. Resist the urge to split `index.html` into modules. The parent project sits at 140k lines of vanilla JS in one file and it ships fine; the build-step tax is not worth it.

---

## 9. First 5 Steps for the New Claude

1. **Open `index.html` in a browser.** Confirm the placeholder UI renders, the "Scrounge" button works, two trash items can combine, and a placeholder bug appears in the Bugdex.

2. **Run `node scripts/smoke.js`.** Confirm all 5 tests pass green. This is your safety net. Every commit should keep it green.

3. **Replace the body renderer.** In `index.html`, find `_renderBugBody(traits, opts)`. Currently returns a stub `<ellipse>` based on body index. Pick one of the 30 body variants and draw it as proper SVG. Add a smoke assertion that the body variant changes with `hb(0)`.

4. **Add the head renderer.** Same pattern — find `_renderBugHead`, replace stub. The head connects to the body's "head anchor" point; document what that anchor coordinate is so subsequent layers (antennae) align.

5. **Build the Sift mini-game.** Create `games/sift.js` exporting `start(callback)`. Player drags a finger across a canvas; the touch path is recorded and SHA-256 hashed; callback fires with the resulting 64-char hex seed. Wire it to the incubator so combining trash opens Sift instead of immediately producing a bug.

After those 5, the game has a real loop: forage → drag-to-sift → unique bug.

---

## 10. Project Rules (also in CLAUDE.md)

Carry these forward from the parent project:

1. Single-file vanilla JS / HTML5. ES5-compatible. No frameworks. No build step.
2. All functions in IIFEs except window-exposed ones.
3. Any function called from inline `onclick` MUST be on `window`.
4. Run `node scripts/smoke.js` before every commit.
5. Bump `LW_VERSION` (or whatever you name the new constant) on every deploy so cache-bust works.
6. Tell the user the commit hash after every push. They test via `git pull` on their device.
7. Never overwrite art assets. New files only. Originals to a backup subfolder if you're replacing.
8. 48px minimum touch targets.

---

## 11. Decisions Stephen Has Made

These are settled. You do not need to ask:

* **Tech stack:** browser, vanilla JS, single-file `index.html` (no Godot, no React build, no framework)
* **Monetization:** Stripe + crypto wallets via the tip-jar pattern (already in skeleton's `api/`). No Pi Network. Expansion purchases land in v1.1.
* **v1 scope:** forage + inventory + incubator + procedural bug renderer + Bugdex. **No map, scanner, breeding sim, or social features yet.**
* **Brand:** Standalone. No public "by the studio that made Lucid Winds" framing. The engine reuse is internal-only knowledge.

---

## 12. Decisions Still Open (ask Stephen when relevant)

* Per-bug lifespan numbers
* Pricing for expansion purchases (when v1.1 lands)
* Whether to ship browser-only or also wrap as a Capacitor / Cordova mobile app later
* AI art usage and disclosure language

---

*End of handoff. Skeleton index.html, smoke harness, and supporting files are ready in this directory. Read CLAUDE.md before touching anything.*
