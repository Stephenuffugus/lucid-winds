# Shell Shuffle: Astra's return checked, file by file (Fable, 25 Oct 2026)

**What arrived** (his upload 03:59 UTC): `assets/shell-shuffle-assets.zip` (15,281,899 bytes, sha256 `42343912...`,
112 entries, 16.5 MB unpacked), vaulted by Opus as `vault-20261025-shell-shuffle-astra` (downloaded back, matched). It
answers `ASTRA-SHELL-SHUFFLE-OCT23.html`. The review PDF is inside the zip (`extras/shell_shuffle_review.pdf`, 11 pages,
32 directions SS-01 to SS-32 with the json index) and is committed beside this file as
`ASTRA-RETURN-SHELL-SHUFFLE-REVIEW-OCT25.pdf`. Extracted for reading at `/tmp/claude-1000/shell-shuffle-astra/` (gone at
a codespace stop; re-extract with `python3 -I`; `extras/code/` holds `shuffle_core.mjs`, a test and two python scripts:
DATA, never run). The game: `satellites/shell-shuffle/index.html` (one file, 621 KB, mostly base64 cup and ball pictures;
`ART_ASSETS.md` the September art ask, `AUDIT-NOTES.md` the August audit with its 45 check `audit_check.mjs`). Live at
https://lucidwinds.com/satellites/shell-shuffle/ (the arcade card `url:"/satellites/shell-shuffle/"` in
`portal/index.html` 1257 and `portal/catalog-tags.json` 1207, no `?v=` stamp today; the game has no service worker of
its own and no BUILD constant).

## Against the brief (section 5.3)

**50 of 50 unconditional files present, at the asked sizes, real alpha, no magenta.** `hands/` not made (her review
proposes no dealer, as the brief allowed); `meshy/` not made (optional). Extras: three more cups (`cup_cat`, `cup_honey`,
`cup_starlight`, same 520 x 600 canvas and baseline), two treasures (`treasure_acorn`, `treasure_star` 192), nine WAV
cues plus a manifest, three phone previews, a contact sheet, the SVG sources of every vector piece, `tuning.json`,
`player_copy.json`, `review_directions.json`, `qa_report.md`, `fable_start_here.md` (her 6 step build order and a full
design: state machine, difficulty table, economy, migration). Measured with PIL; looked at on the painted table's own
colour (58, 31, 17) and on near black.

| Set | Asked | Got | Looked at | Verdict |
|---|---|---|---|---|
| `scene/table_main.jpg` 900 x 1600 | 1 | 1 (385 KB) | the Midnight Cabinet: a round walnut table across the lower half, plum curtains, a brass lantern upper left, ivy, shelves of books and brass; dark at the top for the HUD; warm and specific, the best plate | **use** behind play and the title |
| `scene/table_02..04.jpg` | 3 | 3 | a night greenhouse under a lamp, a striped carnival booth with bulbs, an observatory with a telescope and a moon window; the table top sits lower in 02 and 04 than in main (about 65 percent down against 55), so the cups' baseline is per scene, not one number | **cut**; shown only if he wants places (HIS) |
| `scene/mat.png` 840 x 240, `lamp_glow.png` 900 | 2 | 2 | a green felt oval with a gold stitch; a soft warm radial (alpha peaks at 66, subtle) | **use** |
| `cups/` sunset, moonlit, forest, house 520 x 600; `cup_inner` 520 x 300 | 5 | 5 | chunky, upright, mouth down, one canvas and one baseline (bbox 30, 40, 490, 570 on all four), gold rims, light upper left; the house cup is sage with a cream sprig; `cup_inner` a gold ellipse rim | **use**; aspect 600/520 = 1.154 matches the September contract (260 x 300 at about 1.15) |
| `balls/ball_house.png` 192, `ball_glint_01..04` | 5 | 5 | a glass marble with a teal swirl that reads at 40 px; the glints are tiny vector sparkles that nearly vanish at 48 px | **use** the marble; the glints only if they show at the reveal size (look) |
| `toys/` 6 x 512 | 6 | 6 | painted toys (a red wind up car, a dino, an alien in a suit, a robot, a duck with a crown, a gold trophy cup) that say "I earned this" | **use** in the Daily sheet in place of the SVG toys |
| `ui/logo.png` 1200 x 500 | 1 | 1 (819 KB) | a painted cream script "Shell Shuffle" with shells, leaves and gold sparkles: the house look | **use** on the title; collapse it in play |
| `ui/title_plate.jpg` | 1 | 1 | the main scene with three house cups and the marble painted IN | og and store only: the game draws live cups, a plate with cups baked in would double them |
| `ui/coin, streak_flame, gift` 128; `calendar_day`, `_done` 160; `results_card` 900 x 1100; `shop_shelf` 900 x 300 | 7 | 7 | flat vector icons (fine, semantic); dark gold edged calendar plates; a dark card with a gold border and a star (a surface); a thin wooden shelf with gold brackets | **use** the icons and plates; the shelf only if the shop gets a layout pass (HIS) |
| `fx/reveal_win_01..06`, `reveal_miss_01..04`, `confetti_01..06` | 16 | 16 | thin vector sparkle rings and sparse confetti; `reveal_miss_04` is empty (alpha max 6) and `reveal_win_06` nearly so | **use** `reveal_win_01..05`, `reveal_miss_01..03`, `confetti_01..06`; small |
| `store/` 3 | 3 | 3 | the scene with cups as the feature, a cup and marble as the icon, the maskable keeps the centre | **cut**; the icon swap is HIS |
| `extras/audio/*.wav` 9 | | 9 | not played here | the fleet law: audio never enters git (memory `project_music_unlock_system_sep02`); the game has no sound today and Tally synthesises its own, so the cues become a WebAudio synth in the page (Part 3), the WAVs are the reference |

**Three things wrong, named:** (1) the cups are drawn nearly side on while the table top is painted from about 30
degrees above, so cups placed at the table's far half look like they stand on its edge: the cup row belongs on the mat
in the near half, at about 100 px, and the shot decides; (2) the reveal effects are so thin that the "light bursts out"
moment will be the lifted cup and the marble, not the sparkle; (3) the logo is a fifth of the screen in her 412 proof
and her big button reads "Watching" (a state, not an action: the Pop N Lock lesson, "on" beside "Play beat").

**Her style picture at 412 x 915, 375 and 360** (`extras/preview/play_*.png`): the HUD (LEVEL 4, coins 180, pause) over
the lantern, the logo, "CLASSIC, Follow the marble", a TRIES LEFT plate with three gold dots and "Next goal: Sleepy
Cat", "Watch where it goes", three house cups on the mat at 40 percent from the bottom, a gold Watching button, Modes,
Collection, Settings. Warm, a real place, cups three times today's presence. It also draws things that are HIS (three
tries, a Modes button, a collection goal) as if decided.

## Her numbers against the live code (every one checked in `index.html`)

| Her statement | The code | |
|---|---|---|
| cups = level plus one, up to 6 | `cupCount() = min(level+1, MAX_CUPS 6)` | true (level 1 = 2 cups) |
| swaps grow to 44 | `shuffleCount() = cups*3 + min(level,9) (+ (level-9)/2 past 9), capped 44` | true |
| each swap down to about a tenth of a second | `swapDur() = max(115, 470 - level*34)` | true (115 ms from level 10.4) |
| from level 11 two pairs can swap at once | `doubleChance() = level<11 ? 0 : min(0.45, (level-10)*0.06)` | true |
| coins = cups x 5 + streak x 3 + 8 above level 5 | `reward()` exactly that | true |
| calendar 15, 20, 25, 30, 40, 50, 80; weekly goal 5; one day of grace | `[15,20,25,30,40,50,80]`, `WEEK_GOAL = 5` | true |
| six streak toys (3, 7, 14, 30 days; 5 in a week; a two week streak) | `toycar` "3-day streak", `toydino` 7, `toyalien` 14, `toyrobot` 30, `toyduck` "5 days in a week" in BALLS; Champion Cup is a CUP skin (line 428) on `weekStreak` | true; note the Champion Cup is a playable cup today, her painted one is a trophy: both ids must survive |
| 70 cups, 46 balls, a ball designer | `CUPS` 70 entries, `BALLS` 46 | true |
| Sunbeams 3 a level, 5 a daily claim, 30 a day | `_sbCapEarn(3, "shell-shuffle:level_complete")`, `_sbCapEarn(5, "shell-shuffle:daily")`, bucket `sw_sb_shell-shuffle` | true |
| **SS-02** "replace the speed cliff": start 3 cups and three 920 ms swaps, cap 5 cups, 14 swaps, 420 ms, one pair at a time | live level 1 is 2 cups, 7 swaps at 436 ms; level 10 is 6 cups, 27 swaps at 130 ms; from 11 double swaps | a complete retune, far gentler than live; the August audit built the ramp past level 11 on purpose: **HIS** |
| **SS-04** three attempts a run | one miss ends the run, Play Again one level lower | a rule change: **HIS** |
| her coin formula 10 + 2 x min(level, 20) + 2 x min(streak, 5), cap 60, a 40 coin tutorial gift | `reward()` above | the economy: **HIS** |

## Bugs she saw, reproduced in the source
- **SS-29 unnamed cup controls: REAL.** The cups are `div.cup-wrap` with `dataset.id`, tapped through one delegated
  handler gated on `state.phase === 'guessing'` (805); the whole file has ONE `aria-label` and no `role="button"`.
- **SS-30 exclamation marks: REAL.** "Nailed it!  +N", "Wrong cup! Reached level N", "Where's the ball? Tap a cup!",
  "N in a row!", "See you tomorrow to keep the streak alive!", "goal met!", "Reminders on! 🔔", "1 more day for the
  {toy}! Don't..." (the September audit found no dashes; the exclamation marks it did not check).
- **SS-31 red and green halos: REAL.** `.cup-wrap.good` and `.bad` are drop shadows in `--good` #5fe39a and `--bad`
  #ff6b6b (115, 116); the status line names the result in words, but WHICH cup was right is told by the green glow
  alone.
- **SS-32** is a note, not a bug: her inspection was desktop only; the phone proofs are compositions.

## Sorted (keep, change, his, kill)

**Keep (agree, a part):** SS-13 the table at the centre (plate, mat, glow, the logo on the title, a bounded stage with a
stable baseline); SS-18 the four core cups redrawn large with one canvas (the September contract); SS-14 a results
screen at the run's end (levels, best, coins this run, streak, Play again, Shop, Daily; a local share text) without any
economy change; SS-15 48 px and 14 px secondary text at 360, 375, 412 (the August audit measured the controls at 48 at
375 x 667; re-measure after the layout changes); SS-16 settings (sound, vibration, reduce motion) and pause on
`visibilitychange` during a shuffle (today the pause button shows only in the `play` phase and nothing pauses on hide);
SS-21, SS-22, SS-24 sound as a WebAudio synth behind a switch, every cue with a visible twin, no cue that tells which
cup; SS-19 the toys as pictures in the Daily sheet; SS-29, SS-30, SS-31 the bugs; SS-23 nothing to build (the fleet's
music pill is already on the page; the game adds no loop of its own).

**Change:** SS-13's logo collapses to a small wordmark during a round (her proof spends a fifth of the screen on it);
her "Watching" button becomes a status line with the Start button hidden during the shuffle (a button that does nothing
is not a button); SS-19's "earned toys replace the hidden object in Classic" is cosmetic and cheap, but only if a toy
fits the ball's box (36 px) and still reads: look first; SS-14's share is a text share, never a server.

**HIS (listed with the facts, not planned):** SS-02 the ramp retune; SS-04 three attempts; SS-05 to SS-08 the modes
(Classic as a mode, Daily Shuffle, Two Treasures, Empty Cup, Practice); SS-09 the collection tabs and filters (a shop
restructure: no economy change, but a layout his eye should pass; the shelf art is ready); SS-10 the three new cups at
120, 160, 220 coins (prices) and the acorn at 80; SS-11 the one time purchase at 0.99 (his price, her words); SS-12 the
migration (needed only with 09 and 10); SS-20 the three places unlocked at 30, 80, 150 wins (progression; the plates are
cut and waiting); SS-25, SS-26, SS-27 the daily rework (visit stamps instead of the streak, a second route to every toy,
reminders off by default: the August audit called the streak system "genuinely well built"; her case is retention
without guilt; his call); SS-28 Sunbeams (no change proposed that this side can make: the cap is the SDK's); the app
icon swap (store/); `?v=` and a version stamp are a build matter, not his.

**Kill:** nothing outright. Her `shuffle_core.mjs` (a precomputed plan with stable cup ids, 1,000 seeded tests) is a
sound design; the live game already keeps the ball on a cup id through the swaps (`ballCup` compared to the tapped
`dataset.id`), so it is not a fix for a bug that exists today. It becomes relevant only if he says yes to Daily Shuffle
(seeded, shared plans).
