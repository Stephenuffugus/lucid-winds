
# LUCID WINDS — CLAUDE.md
# Claude Code reads this file automatically on startup. THIS IS THE SOURCE OF TRUTH.
# Last updated: March 20, 2026 — post-rebrand, art integration build

---

## IDENTITY
You are the Lead Developer for Lucid Winds (formerly Petal Walk, originally Focus Grove during early development).
The Director is Stephen. You report directly to him. He makes all design and economy decisions.
The game is Lucid Winds with the domain lucidwinds.com.
All references to "stevieweedseed" or "Stevie" are from the old parent company — NEVER use them.
All references to "Petal Walk" or "Focus Grove" in visible UI are DEAD — the game is LUCID WINDS.
There is no mascot. There is no age gate. General-audience botanical game.

## WHAT LUCID WINDS IS
A single-file vanilla JS/HTML5 game (ES5-compatible, no frameworks) where players earn unique procedural plants by playing pattern-matching games. Plants are one-of-one SVG artworks generated deterministically from SHA-256 hashes. Every plant has a unique procedural haiku. Uses Firebase Auth + Firestore for cloud sync and Pi Network for cryptocurrency payments. Launching on Pi Network ecosystem targeting ~47M registered users.

## THE FOUR TABS
- **GAME** — Pattern matching (SET rules) → earns attention hashes → mints procedural plants
- **GREENHOUSE** — Plant collection, composting, substrate badges, Terra Grade scoring, flippable cards
- **NURSERY** — Growing seeds, breeding, seasonal mortality, cryo chamber
- **WILD** — Real-world Leaflet map, GPS planting, feral seed collection, pheno hunting, Field Pouch

---

## NON-NEGOTIABLE TECHNICAL RULES
1. Single-file vanilla JS/HTML5, ES5-compatible, NO frameworks EVER
2. All functions inside IIFEs except window-exposed ones
3. Any function called from inline onclick MUST be on window
4. `window._generatePlantSVG` is the plant renderer (note the underscore)
5. `window.hashToTraits` resolves traits from SHA-256 hashes
6. `window.getTerraGrade` returns rarity grade from traits
7. `_e()` is the ONLY hash-earning function for mini-games
8. 30 hashes = 1 plant (economic anchor — NEVER change)
9. str_replace preferred over sed for multi-line JS substitutions
10. Never implement multiple major changes simultaneously — single-variable testing
11. 48px minimum touch targets
12. Firebase project: focus-grove-fffa8 (Auth + Firestore at vaults/{uid})
13. Midnight greenhouse aesthetic: deep blacks, sage greens, gold accents, cream text
14. ES5 ONLY — no const, no let, no arrow functions
15. Always run `node --check index.html` (or extract script blocks) before committing
16. GA4 Measurement ID: G-XE58S4X6RX

---

## WORKFLOW (LOCKED)
- **Claude Code** (this CLI) owns the codebase. All edits to index.html happen here.
- **Claude Chat** (browser) writes specs and saves them to Google Drive. Claude Code reads specs and implements.
- Claude Chat does NOT edit index.html anymore.
- Hostinger auto-deploys from this repo's main branch.

---

## ASSETS (/assets/)
15 FLUX-generated images deployed to /assets/ on Hostinger and committed to repo:
```
bg-game-540x960-1.jpg          — Game tab background
bg-greenhouse-540x960-1.jpg    — Greenhouse tab background
bg-menu-540x960-1.jpg          — Menu/settings background
bg-nursery-540x960-1.jpg       — Nursery tab background
bg-wild-540x960.jpg            — Wild tab background
splash-seed-540x960.jpg        — Splash/loading screen
cinema-beat1-weight-540x960-1.jpg  — Onboarding beat 1
cinema-beat2-glint-540x960-1.jpg   — Onboarding beat 2
cinema-beat3-tendril-540x960-1.jpg — Onboarding beat 3
hash-mint-moment-540x540.jpg   — Hash minting moment
card-back-540x540-1.jpg        — Plant card back
empty-pot-540x540.jpg          — Empty greenhouse slot
menu-frame-540x540.jpg         — Menu frame/border
backpack-64x64-2.png           — Backpack icon (64px)
corner-ornament-128x128-1.png  — Corner ornament (128px)
```

---

## ANALYTICS (GA4)
- Measurement ID: G-XE58S4X6RX
- 35 events wired including:
  - game_complete, tab_switch, onboarding_complete
  - feral_collected, wild_plant_drop, session_start_lw
  - plant_minted, plant_composted, breed_executed
  - And others — see gtag() calls in index.html

---

## ECONOMY (LOCKED — Do NOT change without Director approval)

| Parameter | Value |
|-----------|-------|
| Hashes per plant | 30 |
| Greenhouse starting slots | 10 |
| Max greenhouse slots | 60 |
| Slot expansion cost | 1 Pi each |
| Field Pouch slots | 3 base / 5 upgraded (Pi per slot) |
| Emergency pouch slot | 10 Pi, ONE-TIME per day |
| Fertilizer from composting | Common=1, Uncommon=1, Rare=2, Epic=2, Legendary=3, Mythic=4, Cosmic=5 |
| Max fertilizer per seed | 25 at 1% each |
| Nursery skip cost | 21 Dew = skip 1 day (post-Dew-split rework) |
| Plants per Wild zone | 3 max with EA-weakest eviction via dice roll |
| Per-player wild radius cap | 3 plants within 700m (Wild v3 spread rule) |
| Chimera EA penalty | -2 per generation |
| Chimera immunity bonus | 2x climate |
| Marketplace fee | 1% to platform, 99% to seller |
| Wild drops per day | 3 (removes from greenhouse) |
| Feral seeds per 500m | max 2, daily reset |
| Feral collection range | 75m (~250 feet) |
| Cross-pollinate reward | 60% pollen / 30% dew / 10% hashes |
| Harvest reward by rarity | Common:3, Uncommon:5, Rare:8, Epic:12, Legendary:18, Mythic:25, Cosmic:40 hashes |
| Difficulty multipliers | Easy:1.0, Medium:1.5, Hard:2.0, Expert:2.5 |
| No companion rerolls | No Pi-to-pollen conversion |
| Ferals are SEALED | Cannot be trashed once collected |

---

## FIREBASE

- **Project:** focus-grove-fffa8
- **Auth:** Email/Password (createUserWithEmailAndPassword / signInWithEmailAndPassword)
- **Firestore collections:**
  - `vaults/{uid}` — private player data (greenhouse, nursery, wild plants, ferals, pollen, backpack, records)
  - `wildDrops/{ownerUid_hashPrefix}` — shared wild plants visible to all players
  - `meta/accountCounter` — Pioneer badge sequencing
- **Rules:** Deployed from firestore-rules-3.txt. Rules are correct and working.
- **Legacy path REMOVED:** Old code tried reading `users/{emailDocId}` — no permission rule. Removed.

---

## SCRIPT BLOCK MAP (~26 script blocks)

```
Block 1-3:    Error catcher, diagnostics
Block 4:      Firebase config + init
Block 5:      hashToTraits, SEASON_DATA, getSeasonInfo, computeEA, getTerraGrade,
              FG_Data, Nursery data
Block 6:      FG_Audio
Block 7:      MAIN IIFE (~11,000 lines) — games, greenhouse, renderGreenhouse, carousel,
              _populateSlot (flip card), renderDNALedger, nursery UI, binder, vault,
              Firestore sync, switchTab, openCarousel, openPlantActionDrawer,
              _throttledSave, _haptic, setGHGrid, compost, share, download
Block 8:      FG_Wild IIFE — Leaflet map, GPS, drops, ferals, territory,
              _crossPollinate, _doCrossPollination, pollen particles, vignette,
              backpack wiring
Block 9:      Dev panel + chimera toggle
Block 10-11:  Swipe nav helpers
Block 12:     Game engine — _e(), _play(), 27 game implementations, growth strip,
              win overlay
Block 13:     Social/UI module
Block 14:     XP/Level + PW_Social
Block 15:     PW_Onboard — cinematic (4 beats) + auth + skip + gift plant
Block 16:     FG_Challenge — 6 feral challenge types (SET, Memory, Spot, Color,
              Math, Word)
Block 17:     Backpack (BP) module — hold-to-release, seed-to-nursery
Block 18:     Service worker registration
Block 19+:    Breeding comparison module (openBreedScreen, forecast meters,
              confirm dialog)
```

## CRITICAL ARCHITECTURE RULES
- Functions inside one IIFE CANNOT call functions in another IIFE unless exposed on `window`
- A syntax error in ANY script block kills ALL functions in that block
- Inline SVG data URIs in CSS contain `{` `}` `(` `)` that confuse simple brace counters — use `require('vm').createScript()` in Node to verify actual JS syntax
- `overflow:visible` is required on `.greenhouse-plant` for corner knots and EA badge
- Always verify all script blocks parse clean after any edit

---

## WINDOW-EXPOSED FUNCTIONS (must stay exposed)

```
window.mintPlant                    window.renderGreenhouse
window.loadGreenhouse               window.earnHashes
window.getTotalHashes                window.updateDashboard
window.buildAttentionPayload         window.updateFocusPlant
window._e                           window._play
window._playWin                     window._dismissWin
window._restartCurrentGame           window._openGamePicker
window.switchTab                    window.openCarousel
window.closePlantGallery             window.downloadPlantCard
window.openPlantActionDrawer         window.closePlantActionDrawer
window.confirmCompost                window.shareDrawerPlant
window.viewPlantDetails              window.selectCPPlant
window.confirmCrossPollinateSelection
window.openBreedScreen               window.closeBreedScreen
window.bsSwipe                       window.bsConfirmBreed
window.bsExecuteBreed
window._doCrossPollination           window.FG_Wild
window.FG_Backpack                   window.PW_Onboard
window.FG_Data                       window.hashToTraits
window.getTerraGrade                 window.getSeasonInfo
window.computeEA                     window._generatePlantSVG
window.getHaiku                      window.getPlantName
window.setGHGrid                     window._padGHPlants
window._reRenderAll                  window._fgDeviceId
```

---

## CSS VARIABLES
```css
--bg: #0d100c;  --sage: #7ab356;  --gold: #c8a84b;
--cream: #e8dcc8;  --muted: #8a9178;
--nav-h: 58px;  --sb: env(safe-area-inset-bottom, 0px);
```

---

## SEASON SYSTEM
- Derived from `hb(22) % 4` in hashToTraits
- `0=Spring` (🌸 #E8A0BF), `1=Summer` (☀️ #D4A843), `2=Autumn` (🍂 #D4842A), `3=Winter` (❄️ #A0C4E8)
- SEASON_DATA array at line ~4818
- Peak season: +2 EA, -50% stress, 1.5x pollen
- Opposite season: +0 EA, +50% stress, 0.5x pollen
- Adjacent season: +1 EA, normal stress, 1x pollen

### Seasonal Card Borders (set-51)
- Each season has a unique Celtic knot in the corners:
  - Spring = Trefoil (trinity knot) — rose pink + warm gold
  - Summer = Shield knot — rich gold + sage
  - Autumn = Triskelion (triple spiral) — copper + burnt gold
  - Winter = Diamond lattice — ice blue + silver
- Double-line border: inner line (border) → dark gap (box-shadow) → outer line (box-shadow)
- Corner knots are SVG data URIs in ::before pseudo-elements
- Knots should be 30-32px on grid, 36px on detail view
- EA knot badge: top-right corner, frosted glass pill (backdrop-filter:blur), season-tinted border
- EA 15+ gets a glow on the frost pill

---

## TERRA GRADE SYSTEM (7 tiers)
Computed from trait rarity score. Each tier has name, icon, and color.
```
Common     — lowest
Uncommon
Rare       — golden pot OR glow flower OR crystal base OR any mutation
Epic
Legendary
Mythic     — The Toad, The Phoenix companions
Cosmic     — The Beholder companion (0.39%)
```

## EVOLUTIONARY ADVANTAGE (EA)
- Composite score from ALL trait layers
- Each layer's power value must be logically consistent with the trait's physical nature:
  - Glass Stem: rare but -1 EA (fragile)
  - Braided Stem: less rare but +2 EA (strong)
  - Meteorite Substrate: rare and +2 EA (dense)
- Season bonus: 0-2 based on current real-world month
- Age bonus: Day 0-6: +0, Day 7-29: +1, Day 30-89: +2, Day 90+: +3

---

## TRAIT SYSTEM (hashToTraits)
Derived deterministically from 64-char hex hash:
```
pot:         hb(0) % 60          — 60 pot types (TRAIT_BANK.pots)
potColor:    _PAL[hc(1)]
stem:        hb(2) % 24           — 24 stem patterns
stemHeight:  22 + hc(3) * 2.5
leafType:    hb(4) % 71           — 71 leaf types (TRAIT_BANK.leaves)
leafCount:   5 + (hc(5) % 6)
leafSize:    8 + (hc(6) % 7)
leafColors:  [_PAL[hc(7)], _PAL[hc(8)], _PAL[hc(9)]]
hasFlower:   hc(10) > 4
flower:      hb(11) % 71          — 71 flower types
flowerColor: _PAL[hc(12)]
flowerSize:  6 + (hc(13) % 7)
chimerGen:   1 (default; breeding sets to parent max + 1)
leafSpread:  7 + (hc(14) % 6)
aura:        hb(15) % 36          — 36 aura slots (0-4 = none)
base:        hb(20) % 71          — 71 substrate types
companion:   hb(21) % 82 or mythic override from hb(18)
mutation:    hb(16)               — mythic byte, see hashToTraits
mythic:      hb(18)               — see override table below
season:      hb(22) % 4
```

### Companion/Mythic Override Table
Source of truth: `hashToTraits` in index.html (search for `mythByte ===`).
Last verified against code: 2026-04-11.
```
hb(18) === 0xFF  → The Beholder       (idx 38)   COSMIC     0.39%
hb(18) >= 0xFE   → Garden Spider      (idx 37)   LEGENDARY  0.39%
hb(18) >= 0xFC   → Great Blue Heron   (idx 36)   LEGENDARY  0.78%
hb(18) >= 0xF8   → Raccoon            (idx 35)   LEGENDARY  1.56%
hb(18) >= 0xF4   → Baby Mammoth       (idx 34)   LEGENDARY  1.56%
hb(18) >= 0xE0   → The Phoenix        (idx 33)   MYTHIC     7.81%
hb(18) >= 0xD0   → The Toad           (idx 32)   MYTHIC     6.25%
else              → hb(21) % 82                  ~41% base creature rate
```

Dead names that used to be in this table but are NOW AURAS, not
companions (do not put these in mythic hall / showcase UIs):
Starfall, Storm Wraith, Ancient Rune Field, Bioluminescent Pulse,
The Capybara.

---

## CARD SYSTEM (set-51)

### Greenhouse Grid Cards
- Tap → opens full-screen carousel (openCarousel)
- Front only in grid: plant SVG, name, season emblem, EA knot badge, corner knots
- Seasonal double-line Celtic border with corner knots
- Classes: `.greenhouse-plant.season-spring`, `.season-summer`, `.season-autumn`, `.season-winter`

### Carousel Detail View (Inspect)
- Full-screen overlay with 3-slot track, swipe left/right between plants
- Each card is a FLIP CARD (tap to flip):
  - **Front:** Terra Grade label, plant name, haiku, plant SVG (140px), season emblem, EA knot
  - **Back:** Small thumbnail + name + stats header, full DNA Ledger, hash, mint date
- Flip: CSS perspective + rotateY(180deg) + backface-visibility:hidden
- `.cs-flip-wrap.flipped .cs-flip-inner { transform: rotateY(180deg); }`
- onclick: `this.classList.toggle('flipped')`

### Action Drawer
- Opens from carousel via ACTIONS button or greenhouse long-press
- Buttons: DOWNLOAD, INSPECT, SHARE, COMPOST, BREED
- BREED opens breeding comparison screen

---

## BREEDING COMPARISON SCREEN (set-51)

### Architecture
- Full-screen overlay: `#breed-screen`
- Two card backs side by side: your plant (locked) + partner (swipeable)
- Arrow nav to cycle through greenhouse partners
- Each card shows all DNA layers with inheritable traits glowing
- DOM/MIX/RISK tags on inheritable rows
- Offspring Forecast: EA Range, Rare+ chance, Mutation pass, Chimera gen, Season odds
- Confirmation dialog before executing breed
- Sends seed to nursery via FG_Data.addSeed

### Breeding Mechanics
- Offspring hash: parentA.hash + parentB.hash + Date.now() → deterministic 64-char hex
- Chimera generation: max(parentA.gen, parentB.gen) + 1
- Each generation: -2 EA penalty, 2x climate immunity
- Chimera veins visible on offspring leaves
- Nursery limit: 3 seeds max

### Key Functions
```
window.openBreedScreen(plant, context)  — opens overlay
window.closeBreedScreen()               — closes it
window.bsSwipe(direction)              — cycles partner
window.bsConfirmBreed()                — shows confirm dialog
window.bsExecuteBreed()               — executes breed
window._doCrossPollination(wild, mate) — Wild tab breed execution
```

---

## WILD TAB ARCHITECTURE

### Map Stack
- Leaflet.js + CartoDB Dark Matter tiles
- CSS filter: brightness(1.5) on tiles for botanical feel
- GPS geolocation with fallback to demo coordinates
- Vignette overlay + glass highlight overlay (toggled by switchTab)
- Pollen particles floating (started/stopped by switchTab)

### Field Pouch / Backpack
- 3 base slots, harvest wild plants into pouch, auto-delivers to greenhouse
- Hold-to-release: long press on backpack plant to drop into wild
- Seed-to-nursery: feral seeds go to nursery via CustomEvent
- Module: FG_Backpack / BP (Block 17)
- Midnight reset: all backpack plants auto-deliver to greenhouse (NEEDS BUILDING)

### Wild Plant Rules
- 3 drops per day from greenhouse (removes permanently)
- Drop is permanent — no recall
- No self-harvest
- Water only if GPS-proximate
- 1 plant per zone (H3 hex, ~105m2)

### Feral Seeds
- Max 2 per 500m radius, daily reset, 75m collection range
- 6 challenge types: Quick SET, Pattern Memory, Spot the Difference, Color Match, Math Sprout, Word Unscramble
- 2 minute cooldown on failure
- Difficulty scales with seed rarity

### Territory System
- EA-based auto-takeover: challenger EA > defender EA wins
- Displaced planter gets harvest reward (hashes by rarity)
- Defender's Game: player picks mini-game to protect their plant
- Challengers must beat that game to harvest

### Step Counting
- Haversine distance between GPS updates (code exists, needs testing)

---

## NURSERY MECHANICS
- Water once per day for 3 days → bloom
- FG_Data.addSeed({ seedHash, parentAHash, parentBHash, nonce })
- Water via waterLog array — each entry is a date string
- When waterLog.length >= 3 and 3 unique days, bloom button appears
- Bloom mints plant into greenhouse
- Max 3 seeds at once
- Fertilizer: max 25 per seed at 1% boost each (composting only)
- Nursery acceleration skip: 21 Dew = skip 1 day

---

## HAIKU ENGINE
- 7-5-7 syllable structure (strict, verified)
- 1,038-word bank (v4.1)
- Every plant gets a unique procedural haiku from its hash
- `window.getHaiku(hash)` returns `{ line1, line2, line3 }`

---

## ONBOARDING (PW_Onboard — Block 15)
- 4-beat cinematic with FLUX background images (img tags, not inline SVGs)
- Beat images: cinema-beat1, cinema-beat2, cinema-beat3 from /assets/
- Line-by-line text, swipe navigation, crossfade transitions, rain audio
- Beat 4: blurred gift plant + auth form (email/password)
- Skip button at 6 seconds → jumps to beat 4, does NOT bypass signup
- Gift plant: guaranteed Uncommon+ (min score 3)
- After signup: gift plant minted, cloud sync, enters greenhouse

---

## PLANT RENDERING (_generatePlantSVG — Block 7)
- Renders complete plant SVG from hash traits
- Layers: pot → stem → leaves (phyllotaxis spiral) → bloom → aura → companion
- Leaf-to-stem connection: bark swell → petiole bezier → leaf body → tip
- Crispness stack: every leaf gets midrib vein, specular highlight, secondary veins
- Bloom emphasis: leaves dim to 72-82% opacity when flower present
- Chimera veins: Gen 1=0.35px, Gen 2=0.55px, capped, glow at gen 5+
- Stipe bridge for clamped exotic blooms
- Mandala halo: 6-second breathe cycle
- 71 substrates, 71 leaf types, 71 bloom cases (verify via TRAIT_BANK array lengths)

---

## COMPOST SYSTEM
- Permanently removes plant from greenhouse
- Returns fertilizer by rarity: Common=1 through Cosmic=5
- Confirmation dialog required

---

## DOWNLOAD / SHARE
- Canvas renderer: 640x960 card
- SVG → Image → Canvas via Blob URL
- navigator.share with fallback to download

---

## DEV PANEL
- Tap Firebase Log button 5x to reveal
- Password: lucid2026

---

## ANTI-FARMING (NEEDS BUILDING)
- Daily harvest reward cap = backpack slots (3-6)
- Diminishing returns per day
- 2hr minimum wild time before harvest
- Same player can't harvest same planter 2x/day

## PI NETWORK INTEGRATION (NEEDS BUILDING)
- Pi SDK for all payments — never custody user funds
- Slot upgrades, emergency pouch, public greenhouse, marketplace
- RESEARCH NEEDED: Pi SDK payment flow, submission requirements

---

## REMAINING BUILD PRIORITIES

### Game Polish
1. Merge Garden slide animation (tiles jump instead of sliding)
2. Word Search found-word feedback
3. Lights Out illumination animation (CSS glow)
4. Connect 4 drop animation (pieces fall from top)
5. Card games — bigger cards, clearer boundaries
6. Difficulty selectors for Sudoku, Word Search, Picross
7. Sokoban re-theme

### Systems
1. Midnight backpack reset
2. Anti-farming measures
3. Pi SDK integration
4. Step counting testing
5. Breeding balance pass (10K distribution)

### Polish
1. Map skin tuning
2. Companion art audit (Hermit Crab idx 45 = snail)
3. Onboarding safe-area padding
4. Public greenhouse (post-MVP)

---

## WHAT THE DIRECTOR EXPECTS
1. Honest assessments — NEVER sugarcoat
2. Complete deliverables with clear next actions
3. Production-ready code
4. Explain the "why" before the "how"
5. Design sprint approval before major coding
6. One change at a time
7. str_replace over sed
8. 48px minimum touch targets
9. Fresh chat sessions for major build phases

---

## COMMON PITFALLS (LEARN FROM THESE)
1. **IIFE scoping:** Block 7 functions invisible to Block 8/12 unless on window. This caused silent failures across the entire app.
2. **Syntax errors kill blocks:** Calendly dead code had stray `);` that killed all 11,000 lines of the main IIFE. switchTab, renderGreenhouse, everything undefined. ALWAYS verify syntax.
3. **SVG in CSS:** Inline SVG data URIs contain braces/parens. Use vm.createScript() not regex to verify JS.
4. **overflow:visible:** Required on .greenhouse-plant for knots/EA badge to show outside card.
5. **Onboarding skip:** Must jump to beat 4 (auth form), never bypass signup.
6. **Never rewrite switchTab:** Only add to it.
7. **Never remove window exposures:** Other IIFEs depend on them silently.
8. **Test on Pixel 9:** Real device testing is non-negotiable.
9. **Corner knots:** ::before pseudo-elements with SVG backgrounds. background-size controls their rendered size. If they disappear, check overflow and inset values.
10. **EA badge position:** right: -6px to -8px puts it at the actual corner. More negative clips it.
