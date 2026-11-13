# Lucid Winds hub: the repair plan (Fable, 12 Nov 2026)

Source: `docs/audits/LUCID-WINDS-HUB-AUDIT-2026-11-12.md` (read it first; shots beside it).
Status: WAITS ON STEPHEN'S YES. Nothing here is built. CLAUDE.md: design sprint approval before major coding.

These eight packets are repairs. None changes a design, the economy or a rule of play. The design questions
(guest first, the plant art, what the Play build holds) are section G of the audit and are not in this plan.

## Laws (they bind every packet)

1. Work alone in the main session. No Agent, no Workflow, no review passes.
2. Bash only. No Read, Edit or Write tool calls and no AskUserQuestion: they prompt him and stall the run.
   Screenshots may be opened only from `/tmp` (that path is allowed).
3. One packet, one variable, one commit on `add-sproing-jumper`. Never two packets in one commit.
4. `index.html` is ES5: no `const`, `let`, arrow functions or template strings in new code. Anything an
   inline `onclick` calls goes on `window`. Never rewrite `switchTab`; never remove a `window` exposure.
5. THE TESTING LAW. Per packet: `node tools/hub-tests/parse_blocks.js` (seconds). A packet that changes what
   a screen looks like gets ONE screenshot of that screen, opened and read, after all its edits. The packet's
   own gate runs once. Never re-run a green. The full game sweep runs once, at the end.
6. Looking is part of the job (CLAUDE.md). Report what you saw in the shot, not what you wired.
7. Never push to `main`. Each packet ends with one deploy line for Stephen, built the way Three Sisters
   Part 2 was shipped (memory: project_three_sisters_r2_nov10, feedback_deploy_permission). One line at a
   time; wait for LIVE before the next.
8. One line per packet in START-HERE.md and docs/STUDIO-CHECKLIST.md. No essays.
9. If a packet needs something only Stephen has (R1's key), skip it, write one line saying so, do the next.

Local server for every gate: `python3 -m http.server 8777 --bind 127.0.0.1` from the repo root.

## R1. The Wild map (needs Stephen: a CARTO key, or his word to change provider)
- Facts, read from CARTO's own pages on 13 Nov: since 25 Sep 2026 raster tiles need a key. A key is free and
  is e-mailed from carto.com/basemaps/apikey (no account). Free for commercial use up to 1,000,000 tile
  requests a calendar month; above that $500 a month. The key goes on the URL as `?key=...`. It can be locked
  to lucidwinds.com in their dashboard, and should be, because a key in a web page is public. Their terms cap
  browser caching of tiles at 30 days: give `lw-tiles-v2` a 30 day expiry.
- `index.html:52630` `TILES`, used at `:53511`. Put the key in one constant; build the URL from it.
- Add a `tileerror` handler: on error swap the tile for a plain dark square, never a provider message.
- `sw.js`: `TILE_CACHE` `lw-tiles-v1` to `lw-tiles-v2`, so phones drop the stored placeholders.
- Gate: in the Wild tab every `.leaflet-tile` has `naturalWidth` 512 (a real @2x tile), none 256.
- Look: the Wild tab, once. Wild Wardens uses the same provider; it is vendored, fix it upstream, later.

## R2. The image diet (the biggest win; no visible change intended)
- Write `scripts/hub_image_diet.py` (PIL, idempotent). For each image `index.html` references that is over
  150 KB: write a `.webp` beside it at 3 times its largest drawn CSS size (buttons cap 384 px, picker banners
  1080 px wide, quality 82), keep the PNG untouched, and point `index.html` at the `.webp`.
- Add `loading="lazy" decoding="async"` to every `<img>` that is not in the top bar, the nav or the first
  greenhouse screen.
- Transparent art stays transparent (WebP with alpha). Never delete or overwrite an original.
- Gate: `node tools/hub-tests/first_run.mjs` reads under 30 requests and under 6 MB before the first screen
  (it read 107 and 53 MB on 12 Nov), `brokenImgs` empty.
- Look: the greenhouse top bar and the game picker, once each.

## R3. One popup at a time
- One queue (`window.LW_POPQ`): a popup asks to show, the queue shows one, the next waits for it to close.
  Order: beta notice, sign in prompts, explainers, offers, toasts.
- Toasts close themselves after 6 s. The "omens" toast must not outlive that.
- The cinematic's words already wait for the beta notice (`_gatedStart`, `index.html:74706`). Leave that alone.
- The music offer keeps Stephen's 23 Oct ruling (an offer, top right, never a surprise) and gains three
  rules: not during onboarding, not over a running game, and it closes itself as "Not now" after 12 s.
- The mint is the case that matters most (audit shots 23, 24): the bloom card shows first and alone; the
  LEVEL UP overlay waits until it is closed; the first mint explainer comes last, or becomes one line on the
  bloom card. Today the explainer covers the plant and the level up is drawn through it.
- Gate: at no moment do two queue popups show; `first_run.mjs` frames list one overlay at a time.
- Look: the first screen at 2 s and the gift plant screen, once each.

## R4. The signed out greenhouse and the Identity Terminal
- Root cause: on a null user `_nukeGameUI()` (`index.html:49917`) clears the grid, and the dismiss button's
  `closeSWSIdModal()` (`:11247`) never redraws. Fix: when the modal is dismissed and local plants exist, call
  `renderGreenhouse()`. Do not change what `_nukeGameUI` clears on a real sign out.
- Identity Terminal: every target 48 px tall, the dismiss link a real button, the password rule the same as
  onboarding's, plain words in the onboarding's voice (no "protocol", "assets detected", "initialize").
- Gate: `seed_return.js` state, no session: `.greenhouse-plant` count is 14 or more without a manual call.
- Look: the greenhouse, once.

## R5. Third party scripts only when used
- Load `sdk.minepi.com/pi-sdk.js` only on the Pi listing (`?pi=1` or the pi rail). It is 603 ms of main
  thread time for every web visitor today. Every `Pi.` call must already guard for a missing SDK; check.
- Gate: a plain web load makes no request to `minepi.com`; with `?pi=1` it does.

## R6. Small breaks (one commit each)
- Beat text clears the two bottom buttons; the name placeholder fits ("Your name").
- The SOW medallion, the Forager's Lens and Color Garden lose the box behind them.
- The "PLANTS: n / n" banner uses the hub's own type.
- Share, Details, Breed and Compost get a word under each picture.
- Entries marked coming soon, wip or in development are hidden from the picker unless dev mode is unlocked.

## R11. The mint button says what it does
- Sunbeam modal (`#lw-sunbeam-modal`, audit shot 22): the mint control is a picture with no words and the
  only labelled button is CLOSE. Put a labelled button under the picture ("BLOOM YOUR PLANT", 48 px tall,
  calling the same `_mintFromQueue()`), shown only when a plant is ready. When one is ready the line above
  reads "1 plant ready" and not "Next plant: 0/30".
- Look: the modal with 30 banked, once.

## R7. The web root
- `.htaccess`: answer 404 for `*.md`, `functions/`, `firestore-rules-*.txt`, `*.rules.json`, `docs/`,
  `plans/`, `tools/`, `scripts/`, `store/`, and the dev pages `nuke.html`, `audit.html`,
  `dual-preview.html`, `leaf-audit.html`. First grep every served page for links into those paths; anything
  a live page loads stays open. Delete nothing from git.
- Gate, after his deploy: one curl per path family reads 404; the hub, portal and three satellites read 200.

## R8. Play readiness (only after Stephen answers audit calls 4 and 6)
- A play rail: when the hub runs inside the Play wrapper (the test Shutterbug's `twa_ready` uses), every
  price and payment button is hidden.
- The same rail hides "Tip Jar and About"'s tip jar. Settings (with Privacy Policy and Terms) must be
  reachable from the greenhouse by a visible control; the audit could not find one.
- Account deletion: a callable `deleteAccount` (vault, its subcollections, the player's wildDrops, then the
  auth user), a button under Settings with a typed confirmation, and `legal/delete-account.html` for the
  Play form. The functions deploy is his.

## R9. Desktop gets a column
- At 1366 wide the header is a 680 px column while the banner and the plant grid span the screen (two cards
  of 680 px). Above 700 px of width, hold the whole app in one centred column (max 480 px) with the tab's
  painted background filling the rest. Phone widths must not change by a pixel.
- Gate: at 1366x768 `#greenhouse-grid` is no wider than 480 px and at least one whole plant card is on
  screen; at 412 and 360 the grid width is what it was.
- Look: the greenhouse at 1366, once.

## R10. No text under 12 px on the main screens
- Measured 12 Nov: nursery 14 of 24 visible strings under 12 px (three at 8.9), the picker 10 of 11 ("Try
  it!" is 5.2), the greenhouse level line 10.2. Raise each to 12 px or more; where a chip cannot hold it,
  shorten the words, never the type.
- One commit per screen (greenhouse, nursery, picker). One look per screen.

## R14. Found on the skin walk, 13 Nov (the hub's own; the same with no flag). BUILT 13 Nov, head 983cf91b7, waits on `deploy-hub-r14.sh` (after the preview line)

Each is a repair, one commit each, after the skin preview line has run (index.html is one file; do not stack them under it).

Built as R14.1 to R14.7d: both raw markup toasts (pouch, first watering); `_lwDialogUp` inside `_lwCardUp`; `#w-toast` moved to body (it lived in `#panel-wild`, so plain toasts drew nothing on the other tabs); one toast slot with a queue (a repeat dropped, two may wait); the GPS banner only on `body.tab-wild`; `--lw-nav-room` on every panel (the DOCUMENT scrolls, proved with touch drags to the true bottom); a chain of level ups folds into one card; the music offer hides for a card; `_lwConfirm` queues during onboarding; offline sign up dimmed with a line; "Just wanna play games?" stays. Left: a chained level up still fires one ceremony toast per grant (swallowed by the queue); item 5's settings menu is his call.

1. The Field Pouch's first open prints raw HTML as words: `toggle()` near index.html:76453 hands `LW_XP.grantOnce('disc_backpack', ...)` an `<img ...>` string as its label and the XP toast shows it as text. Pass plain words ("+5 XP, Field Pouch. Carry seeds and plants here.").
2. The omens toast still lands on the compost confirm dialog (R13 made it wait for cards, not for `_lwConfirm` dialogs). Same family: `#w-toast` on a dialog's buttons; the "Wild plants detected nearby!" toast and the first visit POLLEN card stack on entering the Wild tab.
3. The stone nav and the HIDE chip cover the last row of the greenhouse and the Nursery's WATER and ACCELERATE labels: the scrolling panels need bottom padding of the nav's real height. (The skin's `sk-layout` part does this under the flag; do it for everyone.)
4. One mint on a level 1 player with a full greenhouse grants three level ups in a row (3, 4, 5), three full screen cards after one bloom. Check whether a real new player can meet this; if so, fold a chain into one card ("Level 5", with what unlocked).
5. From R13's notes, still open: the settings menu shows the card game's own items (his call); "Just wanna play games?" leaves the sign in card at 22 s; the music offer does not hide for a card that arrives after it; `_lwConfirm` drops dialogs during onboarding; an offline start offers Create Account.

## The plant packets (WAIT ON STEPHEN'S WORD: they change how plants look)
Shots 16 to 19 in the audit folder. Plants are one-of-one and come from their hash; none of these may change
which traits a hash resolves to, only how a trait is drawn. Astra's round one target frames should land
before V3 and V4. V1 and V2 are plain defects and can go first if he says so.
- **V1. Soft edges on aura backdrops.** Aurora Borealis, Ethereal Veil, Poison Miasma, Tidal Pool, Moonlit,
  Golden Hour, Frost Crystal, Deep Sea, and the Porcelain and Holographic mutation panels paint a hard edged
  box. One shared mask (a radial fade to transparent) on the aura backdrop group fixes all ten. Keep Time
  Crystal and Poison Miasma inside the 70 unit canvas.
- **V2. Constellation and Silhouette must be visible on a black card.** A rim light or brighter star points
  so the plant's shape reads. Constellation is the rarest mutation (byte 0xFF) and today it is the hardest
  plant to see.
- **V3. The plant fills its card.** In the grid a plant is 95x129 in a 187x254 card. Target: the plant takes
  at least 60% of the card's height; "Ready to breed" becomes a small mark, not a line on every card.
- **V4. The grade shows on the grid card**, in the grade's colour.
- Gate for each: `tools/hub-tests/` gains one sheet script that draws one plant with every aura and every
  mutation (the audit's scratch version did this); ONE look at that sheet per packet.

## The herbarium hybrid (WAITS ON STEPHEN'S FIVE CALLS of 13 Nov; replaces V3 and V4, sharpens V1 and V2)

Astra's round one kit was built into the hub as a flag only skin on 13 Nov (`assets/skin-herbarium/skin.css` and
`skin.js`, loader before `</head>`, `?skin=bloom,cards,banners,actions,layout` is the hybrid). He judges it from
https://claude.ai/artifact/ULCFeHPUFTC4stDLERD1m4 and on the Pixel. The skin is laid OVER the hub (a
MutationObserver, a 1.2 s measure loop, CSS that hides hub nodes): right for judging, wrong for shipping. On his
yes, each packet below moves ONE part out of the skin into index.html proper, shoots it beside the skin's shot of
the same plant, and deletes that part from the skin. When the last is in, the loader and the folder go.

His calls decide the switches: (2) grade on the frame with season as a small mark [the skin], or painted seasonal
corners kept with the grade as glow and word; (3) the reveal names the grade [the skin] or keeps "inspect to
discover"; (4) her banners, or today's plus one new Puzzles banner.

- **H1. Soft auras in the renderer (V1, for real).** Some auras are a full canvas rect
  (`<rect width=70 height=95 fill=url(#aura...)>`) and band stacks; that is the hard box. Fade them inside
  `_generatePlantSVG` (one shared radial mask on the aura group), keeping each aura's own colours. The skin only
  blurs them from outside and loses half an aurora. Bump whatever key the cached plant PNGs use, so the detail
  card's baked boxes regenerate.
- **H2. Fit by drawn bounds.** Plants draw small inside their canvas. Give the renderer's callers one helper that
  returns the drawn bounds of pot, stem, leaves, bloom and companion (auras and faint washes left out), used by
  the tile, the detail card and the reveal (cap 2.2x, base on the ground line). The skin measures the DOM for this.
- **H3. The bloom reveal.** Build her layout inside `_showMintCelebration` itself: stage, pedestal, arch ending on
  the pedestal, grade word and mark, name, "EA n", haiku, two real buttons, the grade's stage light (sage, green,
  blue, violet, gold halo, rose, blue white with the orbit kept inside the stage). The overlay holds a hidden copy
  of the plant (`#mint-plant-reveal`) with the same gradient ids; a second plant in the overlay loses its pot fill
  until that copy is emptied. Fix it at the source (one plant in the overlay). Decide the tip line's place.
- **H4. The greenhouse tile.** Grade word, mark and colour (border and faint glow), the season per call 2, the plant
  fitted (H2), "Ready to breed" as a small mark, and a place for the synergy icons row the skin hides.
- **H5. The detail card front.** Arch, grade and season at the top, EA under the haiku, the card centred between
  the close row and the actions. V2 lands here: the Constellation veil and the Silhouette backlight from her kit
  (`assets/cards/constellation-veil.png`, `silhouette-backlight.png` in the vaulted zip), shot on a real 0xFF plant.
- **H6. The greenhouse layout.** The count on one line, the first row directly under the top bar (the skin gets
  y 265 of 915; today 420). The GROW YOUR NAME button draws nothing yet keeps 70 px: give it a visible place or
  remove it (his call).
- **H7. The four action tiles**, with words, Compost in coral on red.
- **H8. The banners**, per call 4. Her set maps seven of nine (no Math or Words category today); three baked titles
  differ from the live names (Patterns, Studio Games, Dice).
- NOT in the hybrid: her flat nav and top bar icons (ours stay), and every empty rectangle in her kit (CSS).

Gate for each: parse_blocks, then ONE shot of that screen beside the skin's, same plant. The fixed plants (seed a
returning player with these, in this order): Common d5cc9f4f1b13b04e399098edc9ca988b9af5ac03de8ccfe8305c49698f7cddd5,
197593d99fc67e531282572c435151074c4e35b14e94c44fce65eec8f6aaf345, a8abd91fd1b6a0f61d26ee61179d32cd33b48194be25ffc7be3764d1a845e0aa,
d4923613c79dd82ce1c44fdbfd87139be654aabcd2b00445d9d0fa54b1ddb521; Uncommon 9f2d7436148a90474a43ac6dd9145fba794469e51a32a3b6952633395eb9c801,
2ec51a75797870f801e58b179076ab09f83bde5d79ced9048743b424233fdcc6; Rare 6710fe81ca474848f32d707601e3fb4bb2066ac8914ee43dbb1622d5d3512b45,
e1ff16a7fce30c3575a410c275d421b318531b07ea23a61342f8f3895aa4f435; Epic 3934d3e95c352276789d7e1baeaae7f866035a2d930f063f89f7ad342c724a14,
19499b2d5fee2f51ff3a67b070a1883fa942ccf5e9cd0198839e6982ecade5bf; Legendary 20b4e6aac97da301f015cab19207e82ebff72dd98509a25cdfdc933f75fe1f85 (the detail shot),
4ea8446f4be76158f85113d37c7871d11d4c28c784a69e208f6bcb80f77d4e26; Mythic 9e61ca99c169065239fb0dee31f0d2e560c51f0d3f9ef62b5ffd2130ce022d1d;
Cosmic eefac9d1eef4659f51fe849c0e5cda18b175c0adac39981742ddbbd9b0d3be48. Reveals: Common
65d09eaa8906fa2dd534afacbe671a36e5f6525c9635159a3048acd5ce3a30a1, Legendary 299c8915bded819f6acc82f935b6b08c46708098ccc17d74f72b453cb892ac98,
Cosmic with a two line name efb43aaf27c4432652fd6f57fdd58c95823ca92a6254c6e583ce6412c731a5b9.

## Before any public push (not repairs; each needs its own plan and his yes)
- **S1. The shared map.** `firestore-rules-8.txt:485` lets any signed in client create a wild drop with any
  hash and delete any drop. Build the two functions already on the migrations list, `dropToWild` (checks the
  plant against `mintLog` and the daily cap) and `harvestWildPlant` (checks range and rules), then set
  `allow create, delete: if false` for clients. The functions deploy and the rules deploy are his.
- **G1. Guest first** (audit call 2). Anonymous Firebase sign in at the gift plant; `linkWithCredential` when
  the player chooses to save. Rules and functions check only `request.auth.uid`, so nothing migrates.

## The end
Run `tools/hub-tests/game_sweep.mjs` once. It read 98 clean of 102 on 12 Nov; the four that were not are
listed in the audit, section D. Then his Pixel.
