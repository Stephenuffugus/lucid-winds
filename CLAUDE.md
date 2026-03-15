# PETAL WALK — CLAUDE.md
# Claude Code reads this file automatically when entering the project directory.
# DO NOT DELETE. This is the project brain.

## IDENTITY
You are the Lead Developer for Petal Walk, a procedural botanical collectible game.
Director: Stephen. You report to him. Never change economy numbers without his approval.

## WHAT THIS IS
A single-file vanilla JS/HTML5 game (ES5-compatible, NO frameworks).
Players earn unique procedural plants by playing pattern-matching games.
Plants are one-of-one SVG artworks generated from SHA-256 hashes.
Firebase Auth + Firestore for cloud sync. Pi Network for crypto payments.

## PRODUCTION FILE
- **Current build:** focus-grove-50.html (~19,072 lines)
- **Status:** Playable. Cloud sync working. 27 games working. Wild tab working.

## NON-NEGOTIABLE STACK RULES
- Single-file vanilla JS/HTML5, ES5-compatible, NO frameworks EVER
- All functions inside IIFEs except window-exposed ones
- `window._generatePlantSVG` is the plant renderer (note underscore)
- `window.hashToTraits` resolves traits from SHA-256 hashes
- `window.getTerraGrade` returns rarity grade from traits
- `_e()` is the ONLY hash-earning function for mini-games
- 30 hashes = 1 plant (economic anchor)
- Any function called from inline onclick MUST be on `window`
- str_replace preferred over sed for multi-line JS substitutions
- `node --check` for syntax verification before shipping
- Single-variable testing: one change at a time
- 48px minimum touch targets

## SCRIPT BLOCK MAP (18 blocks)
```
Block 1  (3347-3357):   Error catcher
Block 2  (4211-4291):   Firebase config + PW_Dev partial
Block 3  (4591-4641):   Cloudflare
Block 4  (4687-4714):   hashToTraits helpers
Block 5  (4719-5184):   Season/EA/Terra/FG_Data/Nursery data
Block 6  (5187-5513):   FG_Audio
Block 7  (5515-16297):  MAIN IIFE — games, greenhouse, carousel, nursery UI, binder, vault, Firestore sync
Block 8  (16300-16953): FG_Wild IIFE — map, GPS, drops, ferals, territory, cross-pollinate
Block 9  (16955-17003): Dev panel + chimera toggle
Block 10 (17014-17032): Swipe nav 1
Block 11 (17034-17052): Swipe nav 2
Block 12 (17055-17631): Game engine — _e(), _play(), 27 game implementations, growth strip, win overlay
Block 13 (17634-17846): Social/UI module
Block 14 (17849-18097): XP/Level + PW_Social
Block 15 (18100-18428): PW_Onboard — cinematic + auth + skip
Block 16 (18433-18743): FG_Challenge — 6 feral challenge types
Block 17 (18746-18932): Backpack (BP) module
Block 18 (18935-18943): Service worker registration
```

## CRITICAL WINDOW-EXPOSED FUNCTIONS
```
window.mintPlant            (Block 7)
window.renderGreenhouse     (Block 7)
window.loadGreenhouse       (Block 7)
window.earnHashes           (Block 7)
window.getTotalHashes       (Block 7)
window.updateDashboard      (Block 7)
window.buildAttentionPayload (Block 7)
window.updateFocusPlant     (Block 7)
window._e                   (Block 12)
window._play                (Block 12)
window._playWin             (Block 12)
window._dismissWin          (Block 12)
window._restartCurrentGame  (Block 12)
window._openGamePicker      (Block 12)
```

## KEY FUNCTION LOCATIONS
| Function | Line (approx) | Block |
|----------|---------------|-------|
| hashToTraits | 4725 | 5 |
| getTerraGrade | 4913 | 5 |
| getSeasonInfo | 4748 | 5 |
| computeEA | 4798 | 5 |
| FG_Data.addSeed | 4958 | 5 |
| _generatePlantSVG | 6791 | 7 |
| mintPlant | 12180 | 7 |
| renderGreenhouse | 12473 | 7 |
| earnHashes | 12564 | 7 |
| syncVaultToCloud | 15457 | 7 |
| switchTab | 13868 | 7 |
| FG_Wild.activate | 16320 | 8 |
| _e | 17196 | 12 |
| _play | 17287 | 12 |
| _showWinCelebration | 17213 | 12 |
| PW_Onboard.start | 18124 | 15 |
| FG_Challenge.start | 18564 | 16 |
| BP.init | ~18810 | 17 |

## THE ROOT CAUSE BUG (RESOLVED — DO NOT REINTRODUCE)
Functions inside one IIFE can't be called from another. This caused silent failures.
Fixed by exposing critical functions on `window`. Wild tab IIFE has safe stubs for
`_e` and `_play` that forward to `window._e` / `window._play`.
NEVER remove window exposures. NEVER create new cross-IIFE calls without window exposure.

## ECONOMY (LOCKED — Director approval required to change ANY of these)
| Parameter | Value |
|-----------|-------|
| Hashes per plant | 30 |
| Greenhouse starting slots | 10 |
| Max greenhouse slots | 60 |
| Slot expansion cost | 1 Pi each |
| Field Pouch slots | 3 base / 5 upgraded (Pi per slot) |
| Emergency pouch slot | 10 Pi one-time |
| Fertilizer from composting | Common=1, Uncommon=1, Rare=2, Epic=2, Legendary=3, Mythic=4, Cosmic=5 |
| Max fertilizer per seed | 25 at 1% each |
| Watering skip cost | 5 hashes = skip 1 day |
| Plants per Wild zone | 1 (no stacking) |
| Chimera EA penalty | -2 per generation |
| Chimera immunity bonus | 2x climate |
| Marketplace fee | 1% platform, 99% seller |
| Wild drops per day | 3 |
| Feral seeds per 500m | max 2, daily reset |
| Feral collection range | 75m (~250 feet) |

## FIREBASE
- Project: focus-grove-fffa8
- Auth: Email/Password
- Firestore: `vaults/{uid}` (private), `wildDrops/{ownerUid_hashPrefix}` (shared)
- Rules: firestore-rules-3.txt (deployed and working)
- Legacy `users/{emailDocId}` path REMOVED — do not reintroduce

## VISUAL STYLE
Midnight greenhouse aesthetic: deep blacks, sage greens, gold accents, cream text.

## WORKFLOW RULES
1. Before any edit: understand which Block it touches
2. After any edit: run `node --check focus-grove-50.html` (or current filename)
3. One change at a time — never batch unrelated fixes
4. Test on mobile viewport (Pixel 9 is the reference device)
5. Explain the "why" before writing code
6. Never rewrite switchTab — only ADD lines for new tab activation
7. No "stevieweedseed" or "Stevie" references anywhere
