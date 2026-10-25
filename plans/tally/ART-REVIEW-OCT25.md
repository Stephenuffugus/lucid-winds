# Tally: Astra's return checked, file by file (Fable, 25 Oct 2026)

**What arrived** (his upload into `assets/` at 01:00 UTC, "heres is everything for tally thats been made so far"):
`assets/Tally_Review.pdf` (490,096 bytes, sha256 `c174720e...`, 10 pages, 26 directions T01 to T26 with the json index at
the end; also inside the zip as `extras/tally_review.pdf`) and `assets/tally-assets.zip` (76,535,537 bytes, sha256
`2099f167...`, 346 entries, 83.7 MB unpacked). **Vaulted** as `vault-20261025-tally-astra` in the PRIVATE repo
`Stephenuffugus/lucid-winds-vault` (both files + `SHA256SUMS.txt`; the PDF downloaded back and matched, the zip asset size
matches byte for byte). Restore: `env -u GITHUB_TOKEN -u GH_TOKEN gh release download vault-20261025-tally-astra -R
Stephenuffugus/lucid-winds-vault`. The PDF is committed as `docs/briefs/tally/ASTRA-RETURN-TALLY-REVIEW-OCT25.pdf`; the
zip is not committed (disk law) and stays in `assets/` until Opus has cut it. Extracted for reading at
`/tmp/claude-1000/tally-astra/` (gone at a codespace stop; re-extract with `python3 -I`, never run anything in `extras/`:
it holds `puzzle_audit.py`, `animation_adapter.mjs` and `asset_preview.html`, read them as data).

**The game's code is NOT in this repo.** It is `Stephenuffugus/Tally` (React 18 + Vite 5, `src/Game.jsx` 1,420 lines,
`src/engine.js` 145 lines pure, `src/config.js` the economy), cloned to `/workspaces/Tally` at `b860e88`, which is
exactly the commit `satellites/tally/VENDORED.json` records as live. Every claim below was checked in that source, and
the level 1 board was reproduced by running the engine itself.

## Against the brief (`docs/briefs/tally/ASTRA-TALLY-OCT23.html` section 5)

**239 of 239 core files present, plus the 8 optional Meshy views, nothing missing** (her manifest's MISSING section says
"None", and the count is right: 170 pals + 14 worlds + 9 map + 4 beads + 12 ui + 16 fx + 11 skins + 3 store). Every
file is the exact pixel size asked. Lower case underscore names in the brief's folders. Real alpha everywhere alpha was
asked (RGBA, 0 to 255), no magenta keying. Plates are opaque JPG as allowed; the two store icons are opaque PNG (fine for
icons). No side over 1600 px. The whole pack measured with PIL (`/tmp/claude-1000/tally-inv.tsv`).

| Set | Asked | Got | Measured | Looked at (96 px on cream #f2e4cf and navy #0d1326) | Verdict |
|---|---|---|---|---|---|
| `pals/<pal>/` 17 files x 10 | 170 | 170 | all 384 x 384 (portrait 512); every frame's visible base at y 343 or 344 of 384 (portraits 463 to 465 of 512): ONE baseline per character, as asked; widths vary by pose (a cheer with arms out is wider than idle), so the engine needs one render box per pal, not per frame | ten distinct, friendly, big faced characters that read at 96 px on both backgrounds; Flare (navy starry wings) and Star (pastel, horn) look worth saving for; the style is one style (soft painted, chunky); frames are STEPPED POSES, not animation: within a loop the pose, the build and small details (scarf shading, the whale's smile) shift, so a fast crossfade will look like a slideshow; several frames face left or front though the brief said right (a cheer turns; acceptable, never mirror a whole set); frames were cut from a 1254 px sheet (about 314 px a pose) and resized UP to 384, so they are a little soft at 384 and fine at 96; Bolt's cream body nearly vanishes on the Abacus cream | **use**, with her slow cadence (idle 1800/180/100/1800 ms, cheer 100/120/180/140, win 90/100/140/150/120/180, think 800/1100) and a soft plate or shadow behind the pal on light skins |
| `worlds/world_*.jpg` | 7 | 7 | 900 x 1600 RGB, 270 to 410 KB each | one watercolour style; the scenery hugs the bottom third and the top corners and leaves a cream centre, exactly the "calm enough for numbers" ask; Meadow (apple tree, fence, hills), Bubble Bay (sea, shells), Candy Peaks (icing mountains), Starlight City (a castle town at dusk, more fairy tale than city), Dino Valley (eggs and ferns, no dinosaur), Space Station (a porthole FRAME around the cream panel, the one plate with hard edges), Endless (floating islands) | **use**; at play the ring, controls and nav cover the bottom 35 percent, so travel reads only in the corners: the plan puts the world's badge and name in the header row too |
| `worlds/badge_*.png` | 7 | 7 | 256, alpha, bbox 4 to 252 | seven different silhouettes on a cream disc (shell, peaks, dino, infinity, tree, rocket, towers): readable at 40 px without colour | **use** |
| `map/map_*.jpg` | 7 | 7 | 900 x 1600 RGB | the same plates with an S path of eight sockets drawn in; `extras/config/map_anchors.json` gives every socket in pixels and in 0..1 (meadow: 1 at 0.289, 0.869 ... fits width, never cover) | **use**, buttons placed at the anchors, 48 px hit, never scaled with the picture |
| `map/map_stop.png`, `map_stop_done.png` | 2 | 2 | 128, alpha | a cream ring and a gold check: flat vector, fine | **use** |
| `beads/` | 4 | 4 | bead_plain 256, bead_shade 256 (white highlight + dark shadow only), target_orb 320 (neutral grey sphere), target_glow 480 (white radial, alpha max 102) | neutral material layers meant to sit over a CSS colour circle: on her 412 proof the navy beads with `bead_shade` over them look glossy and chunky; `bead_plain` alone is a plain cream disc | **use** as designed: colour from the skin token, shade over it, number on top, never tinted |
| `ui/` | 12 | 12 | logo 1000 x 400 alpha ("rasterized from bundled system font"), stars 160, six icons 128, win_banner 900 x 300, daily_card 900 x 600, splash 900 x 1600 JPG | the wordmark is typeset navy serif with an orange underline: clean, not painted; icons small flat semantic shapes, clear; win_banner a cream ribbon with navy tails and two gold stars, daily_card a cream card with navy border and a star badge: flat vector, plain next to the painted plates; splash is a rich painted abacus close up, the best picture in the pack | **use** all; the banner and card are surfaces (text goes over them in code), judged on the phone |
| `fx/` | 16 | 16 | bank 512 x6, confetti 900 x6, star_pop 256 x4, alpha | thin vector rings and sparse confetti; `bank_06` and `confetti_06` are EMPTY frames (alpha 0 everywhere) and `bank_05` tops out at alpha 46: the sets fade to nothing, so the last frame is a wasted file | **use** `bank_01..05`, `confetti_01..05`, `star_pop_01..04`; drop the two empty frames in the cut |
| `skins/skin_*.png` | 11 | 11 | 400, alpha, all ~13 KB (SVG authored) | eleven rounded cards, each a three row abacus glyph in that skin's colours; distinct, consistent, no words | **use** in the shop grid |
| `store/` | 3 | 3 | feature 1024 x 500 JPG, icon 1024 and maskable 1024 (RGB), + `extras/icon_google_play_512.png` | the painted wooden abacus with navy and orange beads, the thumbnail's look; the feature graphic is Pip and Hoot beside an abacus, text free, charming; the maskable keeps the subject well inside the circle | **use**; HIS whether the app icon changes (it changes every player's home screen icon) |
| `meshy/pip`, `meshy/hoot` | optional | 8 | 1024, opaque grey #808080, four views each | clean turnarounds | parked for Meshy, his call when the credits reset |
| `extras/` | | 107 files | review PDF, `build_rules.md` (20 KB), `config/` (map_anchors, skin_tokens, animation_registration, pal_copy 60 lines, ui_copy, layout_geometry, acceptance_cases x8, qa_report, review_directions), previews (her 412, 375, 360 proofs and four contact sheets), `source_art/` the ten 1254 px sheets, `svg/` sources for every vector piece, `store_copy.txt`, `puzzle_audit.py`, `animation_adapter.mjs`, `asset_preview.html` | her 412 proof is warm and crafted and is the picture to build toward; her copy sets have no exclamation marks and no dashes (checked by eye on pal_copy and ui_copy) | data; the copy and the config are used, the scripts are never run |

**Three things wrong, named:** (1) the pals are poses, not animation, and the loops will stutter if played as frames:
her cadence table is the fix and must be kept; (2) the in game UI pieces (wordmark, banner, card, icons, fx) are flat
vector while the plates, splash and icons are painted, so the pack is two looks: it holds because the vector pieces are
surfaces under text, but the win moment will lean on the pal and the confetti, not the ribbon; (3) the seven world
plates share one composition (scenery low and in the corners), and at play most of it is under the controls.

**Her style picture at 412 x 915 and 360** (`extras/previews/play_412.png`, `play_360.png`): the wordmark in the header
with coins and gems and two 48 px buttons; a world row (badge, Meadow Meadows, Level 1 of 8, Map); a cream card with the
orange target "MAKE 28" and "1 of 2 ways found"; the found equation row; the builder; four operators; a four bead
diamond with the shuffle in the middle; Undo, Clear, Hint 25; Pip bottom left with a two line bubble; the five tab nav.
Numbers are crisp white on navy, the scenery shows at the edges, nothing sits under text. At 360 the same, reflowed
not scaled. Judged good; what it does not show is a five bead ring (levels 3 and up) or a short phone (640 tall), and
the game's own hard rule says the play screen never scrolls (`CLAUDE.md` in the Tally repo, rule 3), so the pal and the
bigger beads must fit the measured space or the ring shrinks: a gate, not a hope.

## Astra's 26 directions, verbatim titles, sorted

**Bugs she saw (T23 to T26), each reproduced:**
- **T23 "Observed: an unreachable efficiency star": HALF RIGHT, and the real bug is the label.** Running the live engine
  (`genPuzzle(1001, levelOpts(1))`) gives level 1 exactly her board: pool [4, 2, 8, 12], target 28, five solutions, none
  with two numbers (`hasClean` false). The star is NOT unreachable: `finishPuzzle` (Game.jsx 257) falls back to
  "three finds" when `hasClean` is false (`star2 = p.hasClean ? hasTwoNumFind : nextFound.length >= p.required + 1`).
  But the results modal (line 879) always prints "Find a two-number solution", so on 35 of the first 48 levels (1, 2, 3,
  6, 8 to 19, 21 to 25, 27 to 29, 31, 33 to 37, 41 to 45) the player is told a rule that is not the rule. Fix: the label
  follows `hasClean` ("Find a two number solution" or "Find one extra way"), and the hyphen goes.
- **T24 "controls below the size requirement": REAL.** `.mv-icobtn` is `width: 40px; height: 40px` (Game.jsx 1085), used
  by the header's How to play and Settings and every modal close. `.mv-skinbtn` has `padding: 8px` and `font-size: 13px`
  and no min height (1222): about 31 px tall, her number. The install bar's dismiss is 36 x 36 (499). The shuffle centre
  is `min-width: 44px; min-height: 44px` (1189). Everything else measured in the CSS is 48 or more.
- **T25 "player copy breaks the style rule": REAL.** `config.js` PALS: 50 cheer lines and 10 win lines, nearly all with
  exclamation marks ("Woohoo!", "Hoo-ray!", "Un-bear-ievable!", "Carrot-tastic!"); toasts "unlocked & equipped!",
  "joined your team!", "Double Coins active for 24h!"; the win title "Solved!"; the shop "Cheering!" and "root you
  on!"; the criterion "two-number"; `dailyMsg` has an em dash ("Daily done — streak kept! +1 💎"). Her
  `extras/config/pal_copy.json` (5 cheers + 1 win per pal) and `ui_copy.json` are clean replacements.
- **T26 "an unnamed settings button": REAL.** The Settings close button (Game.jsx 934) has no `aria-label`; How to play's
  (913) has one. The two preview close buttons (986, 1013) are unnamed too.

**Keep (agree, with the code evidence):**
- T01 the crafted look around the existing puzzle; T03 skins tint the material layers, pals keep their own colours,
  numbers never tinted (`SKINS[i].v` already drives every colour as CSS tokens, Tally rule 6; her `skin_tokens.json` adds
  `bead`, `on_bead`, `target`, `on_target` per skin: map them onto the existing `tile`, `ttx`, `target`, `ttext` tokens,
  do not add a second token system). Her skin ids are display names (`skin_deep_forest`, `skin_sumi_ink`, `skin_abyss`,
  `skin_arcade`); the code ids are `forest`, `ink`, `ocean`, `neon`; her pal folder `flare_dragon` is the code id
  `flame`. One mapping table in the cut tool, never a rename of a save key.
- T04 48 px everywhere and reflow, never scale (the play screen is a fixed flex column with a ResizeObserver ring:
  reflow is how it already works).
- T05 the ten painted pals in the shop (`.mv-palswatch` is 92 px tall today, the portrait fits) and on the play screen;
  T06 the state machine (idle, cheer on a bank, win on results, think after 18 s idle; win over cheer over think over
  idle; one bubble per 6 s; reduced motion shows one pose). The hooks exist: `palCheer("solve")` fires on a bank (218)
  and `palCheer("win")` on results (313).
- T08 the seven plates behind the play with the opaque cards kept above them; T09 level buttons on the map anchors
  (`Journey` today is a grid of `mv-lvl` buttons with stars); T10 Endless reuses the seventh panel per eight levels
  (`worldOfLevel` already returns the endless world with a `from..to` span: nothing finite to invent).
- T11 keep auto banking and the Next action (banking is Tally rule 2; `onNext` exists); T13 goals validated against the
  catalogue (the fix for T23 is exactly this); T15 the win moment (pal win loop + star_pop + one confetti pass, Next
  available at once); T16 label the reward (the results print only `coinGain`, which is the star bonus, 12 a star, while
  the 14 a solve and 9 a bonus were paid at the bank: the "+12" she saw IS the star bonus, so a two line breakdown ends
  the confusion; nothing is paid twice); T17 bead tap feedback inside the existing sound and haptics switches
  (`sfx`, `buzz` in `audio.js`); T18 the daily card as a surface with date and state (the day boundary is `isoDay()`,
  local date, and the puzzle does not regenerate at midnight mid session, a known backlog item in the Tally CLAUDE.md:
  fix it when the card goes in, test the boundary); T19 freeze explained before use; T21 a skippable guided first
  solve (target 10 with 2, 3, 5, 8: 2 + 8 then 2 x 5, both valid, checked by hand) for a fresh save only; T22 the How to
  play step 3 says "Find every way" (Game.jsx 907) while the board asks for two or three: real, her copy replaces it.
- T02 one identity: the wordmark in the header and splash, the painted abacus on the store; "Sky Wolf Studio" singular
  is already the only form in the Tally source (checked by grep).

**Change (right direction, different shape):**
- T06's think pose after 18 seconds: keep, but never while a modal is open and never on the map; and a think pose must
  not look like disapproval on a kid's screen (her think frames are a chin scratch and a sideways glance: fine).
- T09's map: the plan draws the live buttons at the anchors but keeps the existing lock, stars and level number on the
  button (her sockets are blank rings), so the state stays unambiguous without colour.
- T15: no confetti on the daily replay (the `alreadyToday` path), the pal win loop only.

**HIS (taste, money, modes: listed with the facts, not decided):**
- **T20 the 99 cents question.** Her recommendation: keep the web free (the daily as the front door) and ship a paid
  0.99 Android app, no gems for money, no ads. Fact she cites that is true: Google Play does not let a package published
  free become paid later, so the paid build must be its own package from day one. Fact from this side: Tally is not on
  Play today (it is on the arcade and the Listdle directory), and the fleet's one price across stores law applies
  (memory `feedback_one_price_per_game_across_stores`). Nothing in the plan is priced.
- **T07 world postcards** (a collection reward per finished world): a new system, cheap, after the art lands if he wants it.
- **T14 a gentle practice mode** (untimed addition and subtraction, outside rewards and the daily): a new mode.
- **T02's app icon**: switching `icon-192/512.png` and the manifest icons to the painted abacus changes the home screen
  icon of every installed player. The art is ready; his yes.
- **T12 a precedence example in How to play** (2 + 3 x 4 = 14): copy, harmless, his taste on whether a math lesson belongs
  in the tutorial.
- **Bolt the robot on light skins**: a soft plate behind the pal on every skin (consistent) or only on light ones.

**Kill (disagree):** nothing outright. Her `build_rules.md` proposes a 90 px five bead ring radius, 66 px beads and a
244 px ring area as numbers: those are proposals; the gate is the shot at 412 x 915, 360 x 640 and 375 x 667 with
nothing clipped and the play screen not scrolling. Her `layout_geometry.json` fixed coordinates are not to be copied into
the DOM (she says so herself).

**Economy claims in the brief, checked in `config.js` and `engine.js` (all true):** coins start 130, 14 a solve, 9 a
bonus, 12 a star, hints 25; gems start 6, one a daily, freeze 3 gems, double coins 5 gems for 24 h; results whole
numbers 0 to 300 (`solveAll` drops anything else); 10 pals (Pip and Hoot free; Bram 200, Nibble 300, Sprout 400, Cosmo
550, Bolt 750, Splash 900 coins; Flare 12 and Star 20 gems); 11 skins (Abacus, Twilight and Sunrise free; Deep Forest
250, Bubblegum 300, Sumi Ink 350, Abyss 400, Sakura 500, Arcade 900 coins; Ember 15 and Aurora 25 gems); worlds of 8
levels, six named then Endless Expanse; campaign seed 1000 + level, daily seed YYYYMMDD. None of it changes in the plan.
