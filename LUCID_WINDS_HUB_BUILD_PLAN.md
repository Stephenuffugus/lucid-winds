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
- The cinematic does not start until the beta notice is acknowledged (beat 1's words are lost today).
- The music offer keeps Stephen's 23 Oct ruling (an offer, top right, never a surprise) and gains three
  rules: not during onboarding, not over a running game, and it closes itself as "Not now" after 12 s.
- Gate: at no moment do two queue popups show; `first_run.mjs` frames list one overlay at a time.
- Look: the first screen at 2 s and the gift plant screen, once each.

## R4. The signed out greenhouse and the Identity Terminal
- When auth resolves to no user and local plants exist, draw the greenhouse (today the grid has 0 children).
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

## R7. The web root
- `.htaccess`: answer 404 for `*.md`, `functions/`, `firestore-rules-*.txt`, `*.rules.json`, `docs/`,
  `plans/`, `tools/`, `scripts/`, `store/`, and the dev pages `nuke.html`, `audit.html`,
  `dual-preview.html`, `leaf-audit.html`. First grep every served page for links into those paths; anything
  a live page loads stays open. Delete nothing from git.
- Gate, after his deploy: one curl per path family reads 404; the hub, portal and three satellites read 200.

## R8. Play readiness (only after Stephen answers audit calls 4 and 6)
- A play rail: when the hub runs inside the Play wrapper (the test Shutterbug's `twa_ready` uses), every
  price and payment button is hidden.
- Account deletion: a callable `deleteAccount` (vault, its subcollections, the player's wildDrops, then the
  auth user), a button under Settings with a typed confirmation, and `legal/delete-account.html` for the
  Play form. The functions deploy is his.

## The end
Run `tools/hub-tests/game_sweep.mjs` once. It read 98 clean of 102 on 12 Nov; the four that were not are
listed in the audit, section D. Then his Pixel.
