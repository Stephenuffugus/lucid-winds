# Shell Shuffle build out: the plan (for Opus to build), Fable, 25 Oct 2026

Read `docs/briefs/shell-shuffle/REVIEW-ASTRA-RETURN-OCT25.md` first, then `satellites/shell-shuffle/AUDIT-NOTES.md` (the
August audit: the corrupt save guard, the two tab merge in `save()`, the ramp past level 11, the Sunbeam bucket; its 45
check `audit_check.mjs` is this game's suite and must stay green). The game is ONE file, `satellites/shell-shuffle/
index.html` (621 KB, 7 script blocks, mostly base64 cup and ball pictures), no worker of its own, no BUILD constant, the
arcade card without a `?v=`. Live and on the arcade: every deploy reaches players.

## 0. State block (update IN THE TURN you finish a part)

- 2026-10-25 (Fable): plan written, nothing built. Astra's zip `assets/shell-shuffle-assets.zip` (vaulted
  `vault-20261025-shell-shuffle-astra`); extract with `python3 -I` into an empty `/tmp/claude-1000/shell-shuffle-astra/`;
  `extras/code/` and `extras/audio/` are data, never run, never committed.

## 1. His calls (decided)
None beyond the pipeline. Everything in section 7 waits for his word; nothing below changes the economy, the calendar,
the ramp, the prices or the Sunbeam amounts.

## 2. Stamps and the deploy (every part)
- New in Part 0: `var BUILD='v1.1'` near the top of the main script (shown small in How to play), and every art URL
  carries `?v=`+BUILD. Art lives in `satellites/shell-shuffle/art/s1/` (a new folder name when a picture changes), loaded
  by URL, never as more base64 in the page. The arcade card gets `url:"/satellites/shell-shuffle/?v=20261025a"` in BOTH
  `portal/index.html` and `portal/catalog-tags.json`, bumped every deploy (the host caching law: version everything).
- Deploy: files only commit on main from the memory template `scripts/files-only-deploy-bubblenaut.sh`, copied once as
  `tools/shell-shuffle-tests/deploy.sh`, paths `satellites/shell-shuffle`, `portal/index.html`, `portal/catalog-tags.json`
  (the portal diff must be the card stamp only). Commit on the branch with `-- <paths>`; merge main back; push after
  every commit.
- Proof: there is no game worker, but the fleet's root `sw.js` and the host cache sit in front: byte compare the live
  `index.html` and one art file with `?probe=<random>` one at a time; open both origins from persistent profiles that
  held the old page and see the new BUILD in How to play after one reload; a phone must close the tab once.
- Gates: extend `satellites/shell-shuffle/audit_check.mjs` row by row (real headless Chrome at 375 x 667 and 412 x 915,
  the repo root served so `/feedback.js`, `/arcade-exit.js` and `/sunbeam-sdk.js` resolve; a fresh context per case),
  real touches never `el.click()`, every new check watched red on a broken copy that first proves it parses
  (`vm.Script` on each block, the existing syntax gate). This page already uses `const`, `let` and arrow functions
  (it was never ES5, unlike the Lucid Winds main file): keep its existing style, do not convert it either way.

## 3. The parts, in order

### Part 0. The real bugs (SS-30, SS-31, SS-29) and the stamp, v1.1, card `?v=20261025a`
- Copy: every string in the review's list loses its exclamation mark (her `player_copy.json` has calm replacements:
  "Nailed it" becomes "Found it, +N", "Wrong cup. Reached level N" becomes "Not that one. You reached level N", the
  guess prompt "Where is the ball? Tap a cup", "N in a row", "Come back tomorrow to keep the streak", "goal met",
  "Reminders on", "1 more day for the {toy}"); grep the whole page for `!` inside string literals and for dashes in
  player text afterwards and list what remains (the September audit: dashes clean).
- Result marks: on the reveal, the correct cup gets a check glyph plate under it and the tapped wrong cup an empty ring
  plate, both drawn in cream (not hue), and the status line says the position in words ("The ball was under the left
  cup" / "middle" / "right", or "cup N of 6" past three); the halos stay as a second channel.
- Cup semantics: during `guessing` each `.cup-wrap` gets `role="button"`, `tabindex="0"`, `aria-label="Cup N of M"`
  (never its contents), Enter and Space tap it; outside `guessing` the role is removed (so a reader is not offered cups
  that do nothing). The delegated pointer handler stays.
- Gate: the suite gains: no rendered text node on the main screen, the miss state, the Daily sheet and the Shop contains
  `!`; on a seeded miss the check plate sits under `ballCup` and the ring under the tapped cup, and the status text names
  the position (computed from `ballCup`'s slot in the test); during `guessing` every cup has role button and a name,
  before and after it has none; a keyboard Enter on a cup resolves the guess. Each watched red on the live copy.
- Look: the miss state at 375 x 667, named.

### Part 1. The scene (SS-13, SS-18, the marble), v1.2, art `s1`
- The cut (`satellites/shell-shuffle/tools/cut_art.py`, python3 -I, PIL, from the extracted zip into `art/s1/`): the
  four scenes at 900 x 1600 WebP q80 (about 250 KB each; only `table_main` loads at boot) and a 540 x 960 twin for
  phones under 2x; `mat` 420 x 120, `lamp_glow` 450, the five cups at 260 x 300 (q85, alpha, the Part A bleed) and the
  three extra cups the same, `cup_inner` 260 x 150, `ball_house` 96, the glints 96, `logo` 600 x 250, `title_plate` only
  to `og/` 1200 x 630 JPG. Print every size; fail if the boot set (plate + mat + glow + one cup + marble + logo) is over
  700 KB.
- The page: the body's three gradient background becomes `table_main.webp` (cover, centred, the HUD's top band stays
  dark: the plate is dark there); the `.table` 18 percent ellipse becomes the mat, centred under the cup row; the lamp
  glow over the cups at low opacity; the cup row's baseline on the mat in the table's NEAR half (measure against the
  plate: the painted table top runs from about 55 to 92 percent of the height; the cups' feet at about 70 percent at 412
  x 915), cups at 100 to 110 CSS px wide (`cupW`, today 80 to 90, keeps its contract: `aspect` 1.154 for the painted
  cups); `cup_inner` shown inside a lifted cup; the three free cups' `uri` become the painted files (ids `sunset`,
  `moonlit`, `forest` unchanged, so ownership and `selectedCup` survive), a new free `house` cup entry becomes the DEFAULT
  for a fresh save only (an existing save keeps its selection); `ball_house` is the default ball look for the `classic`
  ball id (the designer and the 46 balls untouched); the logo on the title, 60 percent of the width, hidden during a
  round in favour of the status line.
- Gate: the suite: the body background is the plate URL with the BUILD query; the cup row's feet sit within 2 percent of
  the planned line at 375 x 667 and 412 x 915 (computed from the viewport in the test); every cup's hit box is 48 or
  more and the three never overlap at 6 cups at 360 wide; a save with `selectedCup:'moonlit'` keeps it; a fresh save
  gets `house`; the old `sunset` data URI is gone from the page (bytes: `index.html` must SHRINK, the base64 of the three
  redrawn cups leaves it). Red: a copy with the baseline at the plate's far edge fails the feet line.
- Look: the title and a round at 412 x 915 and 360 x 640, the six cup row, a lifted cup with its inner rim; three
  things named (expect: the cups' angle against the table's, the mat's foreshortening, the glow over the HUD).

### Part 2. The run's ending and the toys (SS-14, SS-19, the fx), v1.3
- A results sheet when a run ends (the miss path, after the reveal): `results_card` as the surface; the level reached,
  your best, coins this run, the streak you had, the next calendar reward if one waits; buttons Play again (Lv N, the
  same one level lower as today), Daily, Shop, a Share button that puts "Shell Shuffle: level N, best M" on the
  clipboard or `navigator.share` (text only). Nothing paid, nothing new to earn.
- The reveal: `reveal_win_01..05` over the right cup when correct (5 frames, 70 ms), `reveal_miss_01..03` over the
  tapped cup on a miss, `confetti_01..06` once on a NEW best level; all pointer events none; off under reduce motion
  (`#playfield.no-anim` exists: honour it).
- The Daily sheet: the six toy pictures replace the SVG toys (same ids, same unlock rules); the calendar days on the
  `calendar_day` plates with the done plate when claimed.
- SS-19's option: an earned toy may be equipped as the hidden object only if it reads inside the ball's box at 36 px;
  try the duck and the car in a shot; skip it and say so if they do not read.
- Gate: a seeded miss shows the sheet with numbers computed in the test from the seeded state; Play again starts one
  level lower; the share text has no dashes and no exclamation marks; the fx are absent under `no-anim`; the toys'
  images resolve (no broken image, checked by `naturalWidth`). Red: a copy that pays coins on the results path fails a
  coin delta check (the coins must not change between the reveal and the sheet).
- Look: the results sheet at 375 x 667 and 412 x 915, a new best with confetti (copy the frame), the Daily sheet.

### Part 3. Sound, settings and a real pause (SS-21, SS-22, SS-24, SS-16), v1.4
- A WebAudio synth in the page (the fleet law: no audio files in git; the WAVs are the reference for pitch and length):
  cup lift, cup slide (one per swap beat, the same for every cup), cup settle, a short rising win, a soft miss, one coin
  award per round (never one per coin), a tap. Created after the first gesture; a Sound switch (default on), a
  Vibration switch (the existing haptics), Reduce motion (follows the phone, overridable), stored under new keys in the
  existing save (the corrupt save guard extended to them). A small Settings sheet from the main screen (48 px).
- Pause on hide: `visibilitychange` during a shuffle pauses it where it is and shows the existing pause sheet; resume
  counts 3, 2, 1; a hide during `guessing` does nothing (the guess is untimed). The pause button stays as it is.
- Gate: the suite: the synth is not created before a gesture; the switch silences every cue (count `AudioContext`
  nodes started with sound off: zero); a hidden page mid shuffle stops the swap timer (the cup positions do not change
  while hidden, measured) and resumes with the count; settings survive a reload and a corrupt value falls back to the
  default. Red: a copy without the hide handler fails the frozen position check.
- Look: the Settings sheet at 360 wide; the pause sheet.

### Later, his word first (section 7): the ramp, the attempts, the modes, the collection tabs, the new cups and prices,
the places, the daily rework, the icon.

## 4. Bytes and memory
Boot: the plate (250 KB), mat, glow, one cup, the marble, the logo: under 700 KB, less than the 621 KB page carries in
base64 today once the three redrawn cups leave it. Four plates decoded would be 8 MB: load only the current one (one
today). The cups at 260 x 300 decode to 312 KB each; six on screen is fine.

## 5. Deploys and gates (every part)
Section 2, every time: suite green, new rows watched red, commit on the branch with `-- <paths>`, files only to main,
merge back, both origins proven, byte compare with a random query, the state block, the board and memory in the turn.
Laws: 48 px rendered, 0.7 rem, no dashes or exclamation marks in player copy, "Sky Wolf Studio" singular, nothing sold,
the Sunbeam amounts and bucket untouched.

## 6. Do not touch
`cupCount`, `shuffleCount`, `swapDur`, `doubleChance`, `reward` (the ramp and the pay), the calendar and `WEEK_GOAL`,
the toy unlock rules and ids, `CUPS` and `BALLS` ids and prices (uris of the three free cups change, nothing else), the
save shape (add keys only) and the August guards in `load()` and `save()`, `_sbCapEarn` and `sw_sb_shell-shuffle`, the
fleet files, `scripts/`, `CLAUDE.md`, Astra's originals (cut copies only; the zip leaves `assets/` after Part 1's cut).

## 7. His calls (not built unasked)
- **The ramp (SS-02):** hers starts at 3 cups and 920 ms and caps at 5 cups, 14 swaps, 420 ms, one pair; live starts at
  2 cups and 436 ms, reaches 6 cups, 44 swaps, 115 ms and double swaps from level 11 (built on purpose in August). Keep,
  take hers, or a number in between: measured with the test bot either way.
- **Three attempts a run (SS-04)** instead of one miss ends it.
- **Modes (SS-05 to SS-08):** Daily Shuffle (seeded, the same five rounds for everyone), Two Treasures (marble and star
  under four cups), Empty Cup, Practice. Which, if any.
- **The collection (SS-09, SS-10, SS-12):** tabs and filters over the 70 cups, three new cups at 120, 160, 220 coins, an
  acorn token at 80, a goal pinned to the results; the migration that comes with it.
- **Places (SS-20):** the greenhouse, carnival and observatory plates unlocked at 30, 80, 150 wins (the art is cut in Part 1).
- **The daily (SS-25 to SS-27):** visit stamps instead of a streak, a second route to every toy, reminders off until
  asked. The August audit liked the streak; Astra argues no guilt.
- **Price (SS-11):** 0.99 once for the whole app, her words on his number; the one price across stores law.
- **The app icon (store/).**
