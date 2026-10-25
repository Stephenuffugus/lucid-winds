# Tally build out: the plan (for Opus to build), Fable, 25 Oct 2026

Read `ART-REVIEW-OCT25.md` first. The game is `Stephenuffugus/Tally` (React 18, Vite 5, `src/Game.jsx` the whole UI in
one file with its CSS in an injected style tag, `src/engine.js` pure and tested, `src/config.js` SKINS, PALS, WORLDS,
ECONOMY, `src/wallet.js` the one earning choke point, `public/sw.js` network first, cache `tally-v1`), cloned at
`/workspaces/Tally` on `main` at `b860e88` = the live commit in `satellites/tally/VENDORED.json`. Read the Tally repo's
own `CLAUDE.md` (its nine hard rules bind: cosmetic only, no submit button, the play screen never scrolls, every colour
from skin tokens, the engine stays pure, pals are cosmetic, relative asset paths, earning only through `wallet.js`, the
embed snippet untouched) and `Tally-HANDOFF.md`. Live: https://lucidwinds.com/satellites/tally/ (the arcade card
`/satellites/tally/?v=20260818a` in `portal/index.html` 1283 and `portal/catalog-tags.json` 2047) and the Listdle
directory (memory, search "Listdle": check where its entry points before you assume it follows the arcade). Every
deploy reaches players.

## 0. State block (update IN THE TURN you finish a part)

- 2026-10-25 05:40 UTC (Opus): **PART 0 LIVE**, Tally 0.2.0 build t0, upstream `6e0fd96`, main `936ea9d08`. Star 2 and
  star 3 lines name the rule the puzzle uses; "Stars +N" and "Paid at the bank" (only when a way was banked); every
  rendered button a real 48 px target (hit tested, not only measured: `tools/tally-tests/targets.mjs`, 572 buttons, two
  saves, two sizes; `fw_targets.py` 4 broken copies red); the header fits a streak, Double Coins and 12345 coins at 360
  and 412; the install bar never covers the controls (off Play and Daily under 740 px tall); no `!` or dash in player
  copy, Astra's pal lines; closes and operators named. dom-smoke 32 checks (the new ones red on b860e88, a copy without
  hasClean, a copy with an unbumped CACHE). **Proof:** byte compare SAME on both origins; fresh profiles show Build t0
  on both; the primed old worker profiles took the new worker (tally-v2, tally-v1 deleted) but are HELD ON THE STALE
  PAGE: Tally's `sw.js` uses `fetch(req)`, which reads the HTTP cache, and the host sends HTML
  `stale-while-revalidate=86400` (the fleet's July lesson, `satellites/slice-3d/sw.js` 87). Pre-existing; the fix
  (navigations refetch with `cache: "no-cache"`) ships in Part 1 and is proven there. **Deploy change:** old hashed
  bundles stay on main (`deploy.sh` KEPT), so a stale index never asks for a deleted bundle (that first load would be
  blank); the branch stays CLEAN for `--check`. The host's LiteSpeed bot check answers headless browsers with a 403
  challenge (and blocked this IP for ~40 min after); `oldworker.mjs` uses curl's agent. His calls found: "Find one extra
  way" cannot be met on levels with no extra way (39 of 120); replaying the daily pays star coins every time.
- 2026-10-25 (Fable): plan written, nothing built. Astra's zip at `assets/tally-assets.zip` (vaulted
  `vault-20261025-tally-astra`), extract with `python3 -I` into an empty `/tmp/claude-1000/tally-astra/`, read `extras/`
  as data, never run it.

## 1. His calls (decided)
The pipeline only: Astra made, Fable checked, Opus builds what is planned here. Everything in section 8 waits for his word.

## 2. How Tally ships (read before Part 0; nothing here is optional)

1. **Edit upstream only.** `/workspaces/Tally`, branch `main`. Never hand edit `satellites/tally/` (the vendor script
   overwrites it and `--check` reports EDITED as drift). `npm run test:all` (4 engine tests + 19 DOM smoke checks in
   `scripts/dom-smoke.mjs`, jsdom) green before and after every change; extend `dom-smoke.mjs` for every behaviour you add.
2. **Stamps in the upstream commit:** `package.json` version (0.1.0 today: 0.2.0, 0.3.0 ... one per part), a new
   `TALLY_BUILD` string in `config.js` shown small in Settings (so a phone can prove which build it holds), `public/sw.js`
   `CACHE` `tally-v2`, `v3` ... and the registration `./sw.js?v=2` ... in `index.html` (today bare `./sw.js`), the
   manifest `?v=` only if icons change. Art lives upstream under `public/art/t1/` (Vite copies `public/` into `dist/`
   unhashed; a new folder name, `t2`, when a picture changes: the fleet law, new files under an old stamp split players).
3. **Commit upstream, then push:** `env -u GITHUB_TOKEN -u GH_TOKEN git -C /workspaces/Tally push origin main` (memory
   `reference_cross_repo_push`). That push also rebuilds the GitHub Pages copy (`.github/workflows/deploy.yml`): a second
   live copy of the same build, fine.
4. **Vendor:** `cd /workspaces/lucid-winds && node scripts/vendor_satellites.mjs --vendor tally` (read its header first; run
   it, never edit it). What it does, read in the script: `git -C /workspaces/Tally checkout -q <main> -- .` (⛔ this throws
   away UNCOMMITTED upstream edits: commit first), `npm ci` only if `node_modules` is missing, `npm run build`, copies
   `dist/` over `satellites/tally/` (the old copy is deleted; `AUDIT-NOTES.md` is kept), writes `VENDORED.json` with the
   commit and a sha per file. Then `node scripts/vendor_satellites.mjs --check tally` must print CLEAN. The Vite bundle is
   hashed (`assets/index-<hash>.js`), so every vendor is a new file set: the files only commit must carry the removals
   (the template does: an empty `ls-tree` becomes `--force-remove`).
5. **Files only deploy to main** from the memory template `scripts/files-only-deploy-bubblenaut.sh` copied once as
   `tools/tally-tests/deploy.sh` with these paths: `satellites/tally` (whole folder, adds and removals), `portal/index.html`
   and `portal/catalog-tags.json` (the Tally card `?v=` only; the portal diff sha check in the template guards that), and
   the portal thumb only if it changes. Two sessions share one git index: commit on the branch with `-- <paths>`. Merge
   main back after. Push after every commit.
6. **Proof on both origins** (`lucidwinds.com` and `www.lucidwinds.com` are two origins): BEFORE the deploy prime a
   persistent browser profile per origin on the live build (it holds the old worker and the old `tally-v1` cache); AFTER,
   one reload per profile must show the new `TALLY_BUILD` in Settings and the new bundle name in the DOM (write
   `tools/tally-tests/oldworker.mjs` on the pattern of `tools/slice-3d-tests/ssb/oldworker.mjs`); byte compare the live
   `index.html`, the new `assets/index-<hash>.js` and one art file with `?probe=<random>`, one probe at a time, never a
   burst. A phone must close the tab once. Memory `feedback_verify_on_a_device_with_the_old_worker`.
7. **Gates** in `tools/tally-tests/` (new, in this repo): puppeteer on the VENDORED copy served from the repo root (so the
   paths are the live paths), real touch events through CDP, never `el.click()`; every check watched RED on a broken copy
   (an `fwrun` style runner that first proves the copy parses); expected values computed in the test, never read back.
   One browser at a time on this box.
8. **Unclear in the vendor script, said plainly:** `ALWAYS_DROP` and the temp dir cleanup were not read line by line;
   if `--vendor tally` leaves a `/tmp/vendor-tally-<pid>` tree, remove it (the /tmp disk is small). Whether the Listdle
   entry points at the arcade path or the github.io copy is not recorded in this repo.

## 3. The parts, in order (each one deploy; stamps as section 2.2)

### Part 0. The real bugs (T23, T24, T25, T26, T22, T16's label), version 0.2.0, `TALLY_BUILD` t0
- **T23:** `WinOverlay` (Game.jsx 879) prints the star 2 condition from the puzzle: `data.hasClean ? "Find a two number
  solution" : "Find one extra way"` (pass `hasClean` through `setWinData`); the rule in `finishPuzzle` (257) stays as it is.
  Also the Journey's per level star tooltip if it names the rule (check).
- **T24:** `.mv-icobtn` 48 x 48 (1085) and the header row reflowed so coins, gems and the two buttons still fit at 360
  (the `@media (max-width: 380px)` rule already drops chip padding); `.mv-skinbtn` and the pal card's button
  `min-height: 48px`; the install bar's dismiss 48; `.mv-center` (shuffle) `min-width/min-height: 48px`. Nothing else
  measured under 48 in the CSS, but the gate measures every rendered button anyway.
- **T25:** `config.js` PALS cheers and win lines from `extras/config/pal_copy.json` (keyed by her folder names; map
  `flare_dragon` to the code id `flame`), the toasts, the win title ("Round complete"), "Cheering with you", the shop's
  "root you on" lines, the `dailyMsg` em dash, every `!` and every dash in player facing strings (grep the rendered
  strings: `"[^"]*!"` and `—` and `-` inside words that are not CSS). Keep "Sky Wolf Studio" singular.
- **T26:** `aria-label="Close settings"` on the Settings close (934) and names on the two preview closes (986, 1013).
- **T22:** How to play step 3 (907): "Find the required ways to finish. Extra finds earn bonus coins." (her ui_copy).
- **T16 (label only):** the results coin row reads "Stars +12" (or the sum of stars x 12) with a second line "Paid at the
  bank: 14 a way, 9 a bonus" only when `found > 0`; `coinGain` and the economy do not change.
- Gate: `dom-smoke.mjs` extended: a seeded puzzle with `hasClean` false shows "Find one extra way" and one with true shows
  the two number line; no rendered text node contains `!` or an em dash (walk the DOM on Play, Shop, Daily, Settings, the
  results modal); every `.mv-icobtn` has an accessible name. Puppeteer at 412 x 915 and 360 x 640: every `button`'s
  bounding box is 48 x 48 or more on Play, Map, Daily, Shop (Pals and Skins), Stats, Settings and How to play, driven by
  real touches (`Input.dispatchTouchEvent`). Each watched red on the unfixed copy (the live commit is the unfixed copy).
- Look: the header and the shop's skin grid at 360 wide, named.

### Part 1. The pals as characters, and the beads (T05, T06, T03's bead layers), version 0.3.0, t1, art `t1`
- **The cut tool** (new, upstream `tools/cut_art.py`, Python + PIL, run with `python3 -I`, input the extracted zip,
  output `public/art/t1/`): pals `pals/<codeId>/<state>_<nn>.webp` at **192 x 192** (shown at 74 to 96 CSS px on the play
  screen, so 2x) and `portrait.webp` at **256** (the shop card is 92 px tall), WebP quality 85 with alpha; `bead_shade`,
  `bead_plain` 128, `target_orb` 160, `target_glow` 240. Map her folders to the code ids (`pip_fox` pip, `hoot_owl` hoot,
  `bram_bear` bram, `nibble_rabbit` nibble, `sprout_frog` sprout, `cosmo_cat` cosmo, `bolt_robot` bolt, `splash_whale`
  splash, `flare_dragon` **flame**, `star_unicorn` star). Write `public/art/t1/art.json`: per pal the render box (the
  UNION of its 16 frames' alpha bounding boxes, measured, so one box per character), the baseline (the union's bottom:
  343 or 344 of 384, 0.895 of the canvas), the widest frame. Print every size; FAIL if the pals folder is over 2.6 MB or
  any single frame over 40 KB.
- **The pal on the play screen:** a `<div class="mv-pal">` box sized once per pal from the render box (never per frame,
  or the character jumps), 74 CSS px tall at 412 x 915 and 64 at 360 x 640, its feet on the box's baseline, bottom left
  where the emoji sits today (`.mv-pal` left 8, bottom 84), measured so it never covers Undo. On light skins (`bg`
  luminance over 0.6) a soft shadow ellipse under the feet. The frames are `<img>` swaps on her cadence: idle 1800, 180,
  100, 1800 ms looped; cheer 100, 120, 180, 140 then idle; win 90, 100, 140, 150, 120, 180, hold the last; think 800,
  1100 once after 18 s without input, never over a modal, never on the map. Priority win over cheer over think over
  idle; one cheer queued at most; timers pause when `document.hidden`. `meta.animations` off or
  `prefers-reduced-motion`: `idle_01` only, the bubble still speaks. The bubble is her two line copy, max one per 6 s,
  never over an input (it sits above the pal, clamped to the board). Preload only the EQUIPPED pal's 16 frames (about
  200 KB) and decode them before the first swap; the shop loads the 10 portraits (about 25 KB each) when opened.
- **The shop:** `.mv-palswatch` shows `portrait.webp` instead of the emoji; the preview modal the same; prices,
  ownership and ids untouched.
- **The beads:** the number bead stays a CSS circle filled from the skin's `tile` token, with `bead_shade.webp` over it
  (`background-image`, the number on top, never tinted); the default Abacus skin may use `bead_plain` as the material
  under the shade (her note: never an extra opaque circle). The target: `target_orb.webp` as a `mask-image` filled with
  `var(--target)` (so the skin tints it) or `mix-blend-mode: multiply` over the colour, your look decides; `target_glow`
  as a masked div behind it in `var(--target)`, pointer events none. Numbers stay live text.
- Gate: `dom-smoke`: the pal state machine driven with fake timers (bank → cheer frames in order → idle; results → win
  holds frame 6; 18 s idle → think once; reduced motion → idle_01 only; the bubble cadence); the render box is one size
  across a loop (read the `img` box each swap). Puppeteer: a shot at 412 x 915 and 360 x 640 with the pal and a five
  bead level (level 3 or later via a seeded save) and the page's scrollHeight equals the viewport (the play screen never
  scrolls); the pal's box does not intersect Undo, Clear, Hint or any bead; the bubble's box inside the board. Bytes:
  the play screen's requests total under 450 KB on a fresh load (bundle + one pal + beads), the pals folder under 2.6 MB
  on disk. Red: a copy with the baseline anchored to the canvas bottom (the rabbit float) fails the feet check; a copy
  with per frame boxes fails the one box check.
- Look: Play at 412 x 915 on Abacus and on Arcade (dark), 360 x 640 with five beads, the shop's Pals grid, Flare's
  preview; three things named (expect: the think pose timing, the bubble clamp, Bolt on cream).

### Part 2. The worlds and the map (T08, T09, T10), version 0.4.0, t2 (the `t1` art folder keeps its name; new files
only, under `t1/worlds` and `t1/map`)
- Cut: `worlds/<id>.webp` at **540 x 960** quality 80 (about 100 KB each; one loads at a time), badges 64, map panels
  `map/<id>.webp` 540 x 960, stops 64. Ids by the code's world ids (`meadow`, `bay`, `candy`, `city`, `valley`, `space`,
  `endless`). `art.json` gains the map anchors from her `map_anchors.json` as (u, v) per stop per world.
- The plate: `.mv-board`'s background (fixed, `background-size: cover`, centred), swapped when `worldOfLevel` changes,
  preloaded for the next world at level 8 of the current one. Over it a scrim in the skin's `bg` token at 0.55 alpha
  for light skins and 0.72 for dark ones (her rule: dark skins need more), under every card; the cards keep their
  opaque `surf` surfaces. The world row shows the badge beside the name (her T08: travel reads in the header too,
  because the controls cover the plate's bottom third).
- The map (`Journey` component): each world's panel at the viewport width with the live `mv-lvl` buttons absolutely
  placed at the anchors, 56 x 56 (48 minimum), keeping the level number, the stars and the lock glyph ON the button
  (her sockets are blank rings; the state must not be colour alone); the current level's button pulses. Endless: the
  seventh panel repeats per group of eight with real level numbers (`worldOfLevel` already gives `from..to`). The daily
  does not use the map.
- Gate: `dom-smoke`: the plate id follows `worldOfLevel` for levels 1, 8, 9, 48, 49, 57; the anchors' button boxes are
  inside the panel and 48 or more; the Endless label shows the real numbers. Puppeteer: a 412 x 915 shot of Play in
  each of the seven worlds (seeded `meta.level`) with the numbers' contrast measured over the scrim (the bead number
  and the target number against their own backgrounds, 4.5:1 or more, computed from the pixels); the map at 360 wide
  with no button cut by the viewport. Red: a copy with the scrim removed fails the contrast check on Space Station.
- Look: the seven Play shots side by side, the Meadow map, the Endless map at level 57; three things named (expect:
  the Space Station frame against the card edges, Starlight City reading as a castle, the plate's bottom third under
  the controls).

### Part 3. The win moment, the daily, the splash and the wordmark (T15, T16, T18, T19, T02, T17), version 0.5.0, t3
- Cut: `ui/logo.webp` 500 x 200, `win_banner` 450 x 150, `daily_card` 450 x 300, stars 80, icons 64, `splash.webp` 540 x
  960 quality 80, `fx/bank_01..05` 128, `confetti_01..05` 450, `star_pop_01..04` 96 (drop `bank_06` and `confetti_06`:
  empty frames), `skins/<codeId>.webp` 200.
- The win: `WinOverlay` gets the banner behind its title, each lit star plays `star_pop` once (4 frames, 60 ms), the
  equipped pal's win loop at 128 px beside the stars (160 at 412 and taller), ONE confetti pass (5 frames, 90 ms, at
  most 450 px, pointer events none) on a campaign clear, never on a daily replay; Next stays tappable from the first
  frame. The reward breakdown from Part 0 stays. Reduced motion: no confetti, the pal's last win pose only.
- The bank moment: `bank_01..05` once over the builder when an equation banks (the pal cheers at the same time).
- The daily tab: `daily_card` as the surface above the target with the date (her "Daily for {date}"), the state (not
  played, done, replay), the streak as "{count} days played" and the freeze explained before use ("Use a freeze to keep
  this streak"). Fix the known boundary: the daily regenerates when `todayKey()` changes while the tab is open (the
  backlog item in the Tally CLAUDE.md); test it with a fake clock.
- The splash: `index.html` shows `splash.webp` full bleed with the wordmark until React mounts (then fades 300 ms), so
  the first paint on a slow link is the painted abacus, not a cream page. The wordmark in the header replaces the text
  "Tally" at 110 x 44 (the header's height budget is unchanged). Skin cards in the shop grid. The painted store icon is
  HIS (section 8); do not touch `icon-192/512.png` or the manifest in this part.
- Gate: `dom-smoke`: the daily regenerates across a fake midnight and the streak logic is unchanged (the existing
  checks stay green); the confetti is absent on the replay path and under reduced motion; the splash element is removed
  after mount. Puppeteer: the results modal at 412 x 915 and 360 x 640 with the pal, three stars and the confetti
  frame (copy a frame to shoot it; a DOM popup lives real time); the daily tab; the splash at 0 ms. Red: a copy with
  the midnight fix removed fails the fake clock check.
- Look: the win at both sizes, the daily card on Abacus and Abyss, the splash; three things named.

### Part 4. Onboarding (T21), version 0.6.0, t4
- A skippable guided first solve for a FRESH save only (`meta.earns.first_solve` unset and level 1 unplayed): target 10
  with beads 2, 3, 5, 8; the guide points at 2 then + then 8 (banks), then says "Find another way" and lets the player
  find 2 x 5 (both valid, checked in the engine); no coins charged for the guide, the normal 14 a way paid as always; a
  Skip button 48 px from the first beat; replayable from How to play. The existing onboarding strings in `Game.jsx` are
  replaced by her tutorial lines (`ui_copy.json`). The guided board is a fixed puzzle object, not a seed, so it never
  drifts with the generator.
- Gate: `dom-smoke`: a fresh save gets the guide, a save with `first_solve` does not; Skip ends it and the normal level
  1 appears; the guide's two solutions bank and pay 14 each. Puppeteer: the guide at 360 x 640 with the pointer and the
  Skip button both inside the viewport.
- Look: the first three beats at 412 x 915.

### Later, his word first (section 8): the store icon swap (T02), world postcards (T07), gentle practice (T14), the
precedence example (T12), the 99 cents question (T20).

## 4. Memory and bytes (every part)
Decoded frames: a 192 px RGBA frame is 147 KB in memory; one pal's 16 frames 2.4 MB; never hold two pals decoded (drop
the old one on equip). A 540 x 960 plate decodes to 2 MB; hold the current world's and the next's at most. The live
dist is 2.18 MB with a 1.9 MB `thumbnail.png` (the card art; untouched). Targets: the play screen's first load under 450
KB of requests beyond the bundle (Part 1), under 600 KB with a plate (Part 2); the whole `public/art/t1` under 6 MB on
disk; the cut tool prints the totals and fails over them.

## 5. How the skins tint painted parts (binding)
Painted parts that MUST follow the skin: the bead (CSS colour from `tile`, `bead_shade` neutral over it), the target
(`target_orb` masked or multiplied by `target`, `target_glow` masked in `target`), the scrim over the plate (`bg`). Parts
that keep their own colours: the pals, the badges, the icons, the plates, the splash, the skin cards. Paper surfaces
(`win_banner`, `daily_card`) are cream on every skin on purpose; judge them on Arcade and Abyss in the Part 3 look and
say if they fight. Her `skin_tokens.json` proposes a darker Abacus target (#aa4822 for white numerals): fold it into
`SKINS[0].v.target` only if the contrast check in Part 2 needs it; otherwise the tokens stay as they are. Never a second
token system beside `SKINS[i].v`.

## 6. Deploys and gates (every part)
Section 2, in that order, every time: test:all green upstream, commit upstream, push upstream, vendor, `--check` CLEAN,
commit the vendored copy and the card stamp on the branch with `-- <paths>`, files only deploy to main, merge main back,
old worker proof on both origins, byte compare with a random query, the state block, the board and memory in the turn.
Laws: 48 px rendered, text 0.7 rem or more, no dashes and no exclamation marks in player copy, "Sky Wolf Studio"
singular, nothing sold anywhere in this plan, no change to `ECONOMY`, `wallet.js`, the save key `tally:v1` or the
embed snippet.

## 7. Do not touch
`src/engine.js` (pure, tested; the T23 fix is a label, not a rule), `ECONOMY`, prices and ids in `config.js`,
`wallet.js` and `EARN_MOMENTS`, the `tally:v1` save shape (add keys only), the embed snippet in `index.html`, the
GitHub Pages workflow, `scripts/vendor_satellites.mjs`, `satellites/tally/` by hand, the fleet files (`sunbeam-sdk.js`,
`music-unlocks.js`, `arcade-exit.js`, `feedback.js`), `scripts/`, `CLAUDE.md`, Astra's originals (cut copies only; the
zip is vaulted and is deleted from `assets/` only after Part 1's cut is committed).

## 8. His calls (not built unasked)
- **The 99 cents question (T20):** Astra says keep the web free, sell a 0.99 Android app, no gems for money, no ads;
  Google Play does not let a free package turn paid later, so a paid build would be its own package; Tally is not on
  Play today; the fleet's one price across stores law applies. His call, with the Play first then Pi ruling in mind.
- **The home screen icon (T02):** replace `icon-192/512.png` and the manifest icons with the painted abacus. Changes
  every installed player's icon. Yes or no.
- **World postcards (T07):** a fixed picture per finished world in a small collection view. Yes, later, or no.
- **A gentle practice mode (T14):** addition and subtraction only, outside the campaign and the daily. New mode.
- **A precedence example in How to play (T12):** 2 + 3 x 4 = 14 shown once. Taste.
- **Bolt on cream:** a shadow plate behind every pal on every skin, or only on light skins.
- **Meshy:** the eight Pip and Hoot views are ready for when the credits reset around 30 October.
