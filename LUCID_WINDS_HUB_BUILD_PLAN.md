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
