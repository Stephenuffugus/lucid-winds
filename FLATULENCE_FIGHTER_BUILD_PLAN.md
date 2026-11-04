# FLATULENCE FIGHTER BUILD PLAN (4 Nov 2026) — Fable with Stephen, from Astra's pack v1

The game is `satellites/flatulence-fighter/index.html`: one file, vanilla JS, every pixel CSS and one inline SVG face,
every sound synthesised, open to players at lucidwinds.com/satellites/flatulence-fighter/. Stephen: "it has potential
to sell, be hilarious, and also super fun and unique" and, on the controls: "Controls are going to be everything in
this game. It is supposed to be like playing Twister with your fingers. Maybe two buttons on either side and one or
two in the middle." That sentence is the design brief for step 4.
Astra's pack (12 MB, 312 files): `/workspaces/flatulence-fighter-astra-v1/pack/flatulence-fighter-astra-pack-v1/`
(NOT in git; vault release `flatulence-fighter-astra-pack-v1-20261104`). Its docs are copied to
`docs/briefs/flatulence-fighter/astra-v1/` (ASSESSMENT, STYLE-GUIDE, NOTES, QA, START-HERE, manifest.json,
INTEGRATION.md, palette_and_controls.css). Read ASSESSMENT.md and STYLE-GUIDE.md once, INTEGRATION.md whole (it is
short and it is the contract), and the manifest entry of every file before placing it (sizes, nine slice insets,
windows, bands, anchors are all in there).

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE | 3e7262269 (start) | check red at 72; before set in /home/codespace/ff-drafts/before/ (16 screens, no page errors); origin/main 33db6ef8f blobs at start: index.html 060c5013, og/card.jpg 46634ec2, thumb b9118678 (equal to the branch); box booted 17:41 UTC, stops 05:01 UTC (12 h less 40 min) |
| 1 | DONE | 43ae08b58 | satellites/flatulence-fighter/assets/ stage 18, onlookers 27, controls 29, wardrobe 10, sharing 3, store 6 (pack names kept); 75 symbol sprite inline (tools/ff-tests/build-sprite.js: 53 icons, 18 medals, equipped, lock, two wordmarks) + ic(); ART_V 20261104a + art(); icon-192/512/maskable, manifest.json (paper theme) linked, the inline blob manifest gone; og/card.jpg from social_card (q85); portal thumb square 480x480 (the portal shows .shot at 1/1, most thumbs are 480 square); check still 72 (asset rule green, nothing named yet) |
| 2 | DONE | 1bd01d3b9 | homage line and presenter gone (eyebrow A silent comedy of composure); copy law in markup and script (Vent, Do not vent, Wait for cover noise, Perfect, the banner as name over Vent now, Waft it away, Gasp, A whiff. Clench, Swap. Left only, tutorial lines); zoom allowed; one Google Fonts link (Noto Serif 700, Open Sans 400 600, swap), serif keeps its fallbacks; Astra's four palettes as tokens under the saved ids, old names alias them on body, .ff-art-layer carries --art-filter; every emoji is a sprite icon in place (data ico fields now icon names); check GREEN |
| 3 | DONE | 18404838d | SCENE_ART maps the SCENES index to the twelve style guide ids with literal paths; the stage is layers: room plate (cover, bottom aligned, decoded before the swap, current and next only, bounded cache of 8), witness strip (backs, 2:1 at the set width, pew line on the stage floor), the five rigs inline (tools/ff-tests/build-rigs.js turns their ids into classes; data-char picks the rig, data-tier the expression 1:1), flush at the cheek anchors and three drops at the sweat anchors, then leaks; the ribbon under the stage; the gauge moved under it; card on the nine slice frame (art filtered, text not); intertitle on its frame (act, title, subtitle in the text band) over the visible room; paper tile and static grain; menu on bg_menu_mood with the wordmark symbol (palette aware) and the calm bust behind the card; game over on bg_game_over_mood. Shot 08: the room, witnesses and seated bust read; wrong: the Music chip on the ribbon (step 4), the arcade exit over Pause, the breath bar over the room top (step 4) |
| 4 | DONE | (next row) | one fixed deck in three columns above the safe area: Lean left (56) over Left hold (clamp 120 to 150, the plate by state: idle, held, tired at strain 70 or a slip), the mirror on the right, the posture track (labelled Sit still) over Hold breath (56, on its plate) over Vent (the rest of the column, unsafe, cover and a 450 ms Perfect plate); Cough, Sip and Waft are props on the stage at the pew line (handkerchief left of the bust, glass right, fan on the lap; Astra's ability plates, the label under the plate, charge plates as dots, a real Sip cooldown ring); leaks spawn above the props' row and never on each other (still two rnd() draws, so Daily runs keep their schedule); every hold uses pointer capture per pointer id and releaseAll() lets go on pause, blur, a hidden page and an orientation change; resume counts three beats (0.6 s) before pressure moves; SWS_MUSIC_HOLD before music-unlocks.js (the held song card shows at the result screen); the game exposes SWS_EXIT and an Arcade button on the menu so the fleet's floating exit no longer sits on Pause. No timing, cost, charge or strain changed. Shots 08 at 412 and 360: the deck reads; fixed after: prop labels moved under the plates, the Vent cross kept whole (40 px slice) and its text clear of it, the idle Sip ring hidden, the posture label above its track; the feedback fab parks over the stage's right edge (it yields over a leak; DECISION 6) |
| 5 | TODO | | |
| 6 | TODO | | |
| 7 | TODO | | |
| 8 | TODO | | |
| 9 | TODO | | |

## THE LAWS (Stephen's standing orders; they override anything in Astra's docs)

1. Code directly in the one session. No Workflow, no lanes, no subagents, no review agents, no redwatch.
2. THE TESTING LAW. Per step: `node tools/ff-tests/check.js` (seconds, no browser). A visual step: ONE shot of THAT
   screen with `node tools/ff-tests/shoot.mjs <outdir> <screen>` after all the step's edits, then OPEN it and write
   three things wrong in one line. Per milestone (step 9): the full walk once (all 16 screens), then Stephen on the
   Pixel. Never re-run a green to confirm it.
3. Never push main. Never run a deploy. A push to main is a production deploy and only Stephen runs it, with `!`.
   Commit and push `add-sproing-jumper` after EVERY step (`git push -q origin add-sproing-jumper`); the box can stop.
4. One file. `index.html` stays one HTML file with no build step and no framework; match its style (`const` and
   arrow functions are fine here, it is not ES5). Art loads from `satellites/flatulence-fighter/assets/` or is inlined
   (the icon sprite, the five rigs). Every asset URL carries `?v=` + one `ART_V` constant, bumped when art changes.
   Never over 1600 px a side except `assets/store/`, `assets/sharing/` and the launch frame. Masters stay in
   `/workspaces/flatulence-fighter-astra-v1`; nothing from the pack's previews or dev folder ships except the values
   in palette_and_controls.css.
5. Never change a saved key or id: the localStorage keys (`ff.*`, `ff.l.*`, `ff.medals`, `ff.daily`, `ff_save`,
   `ff.tutseen`), the mode and difficulty keys, the medal, character and palette ids (`everyman`, `matinee`...), the
   `SCENES` order. Player facing words change through labels. Old saves load unchanged; no unlock is reset.
6. The copy law: no dashes of any kind and no exclamation marks in anything a player reads (the game has `VENT!` and
   a few more today; they go). 48 px targets, and the pads far bigger. Real buttons with labels (an icon never
   replaces the text or the aria label). Not gross: no cloud, no toilet imagery, no smell trail, anywhere.
7. Notes: one line per step in the STATE block above and one line in START-HERE.md. No essays, no QUESTIONS file.
8. Scope is this plan. Nothing from Astra's "later" lists (comic reel, pass the phone, daily seeds, new scenes),
   nothing from the DECISIONS list, no other game.
9. The box has a hard 12 hour life from boot. Do not trust a time written in a plan: read it,
   `date -u -d @$(awk '/btime/{print $2}' /proc/stat)`, add 12 h, and stop 40 minutes before that with START-HERE
   written, whatever step you are on. Step 8 is dropped first if time is short.

## THE STEPS (in order; each ends green on the check, committed and pushed)

**Step 0. Prep (10 min).** `pgrep -f "http.server 8777" || (cd /workspaces/lucid-winds && python3 -m http.server 8777
>/dev/null 2>&1 &)`. `mkdir -p /home/codespace/ff-drafts`. Run the check (red today; note the count). Shoot the whole
game once to `/home/codespace/ff-drafts/before/`. Note in STATE the blobs on origin/main this build starts from:
`satellites/flatulence-fighter/index.html` 060c5013, `satellites/flatulence-fighter/og/card.jpg` 46634ec2,
`portal-assets/thumbs/flatulence-fighter.jpg` b9118678 (main 33db6ef8f).

**Step 1. The assets in (S).** Make `satellites/flatulence-fighter/assets/` from the pack, by section, only what the
page will name: `stage/` (the 14 webp plates, card_frame.png, paper_tile.png, film_grain_tile.png, iris_mask.png),
`onlookers/` (24 strips, prop_passing_bus.png, prop_dropped_books.png, prop_radio_lamp.png), `controls/` (the PNG
plates: hold x6, vent x3, ability x3, charge x2, breath_bar, cover_banner, callout_plate, intertitle_frame, leak x3,
posture x2, scene_chip, sip_cooldown_ring, strain_bar, strike x2, toast_pill), `wardrobe/` (5 portraits, 4 palette
plaques, wardrobe_frame.png), `sharing/` (result_square.png, result_portrait.png, daily_ordeal.png; exempt from the
1600 rule), `store/` (the six screenshot frames; exempt; not loaded by the page). The 30 single expression files are
NOT needed: the five `*_rig.svg` (5.6 KB each, six expression groups, CSS variables for coat, paper, ink) are inlined
in step 3. The SVG set (53 `icon_*.svg`, 18 `medal_*.svg`, wardrobe_equipped.svg, wardrobe_lock.svg, and
`wordmark_dark.svg` + `wordmark_paper.svg` as symbols) becomes ONE inline sprite `<svg id="ff-sprite">` with a helper
`ic(name)`: copy `tools/studio-tests/build-sprite.js` to `tools/ff-tests/build-sprite.js`, change PACK, PAGE, the file
list and the markers (the icons' viewBox is 0 0 48 48; keep each file's own). Identity: app_icon_192/512/maskable →
`satellites/flatulence-fighter/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`; a new `manifest.json` beside
the page on the Keepsies model (name Flatulence Fighter, start_url `./index.html?v=...`, display standalone,
orientation portrait, paper theme and background, the three icons) linked from the head; social_card_1200x630 →
`og/card.jpg` (JPG q85, replaces the generic card); promo_tile_512 → `portal-assets/thumbs/flatulence-fighter.jpg`
cut to the size of the file there today (270x480 portrait, centre crop) unless the portal shows it square. The launch
frame and the feature graphic are store kit, not web: leave them in the pack. Gate: check (the asset rule), no shot.

**Step 2. Policy, copy, tokens, fonts (S; Astra's hard line audit).** The menu's "an homage to 'Try Not To Fart'"
line and the "Lucid Games presents" eyebrow go (the eyebrow becomes "A silent comedy of composure"; the code comment
at the top of the style block may keep the history). The copy law pass over markup AND script strings: `VENT!` →
`Vent`, `DON'T VENT / wait for cover noise` → `Do not vent / Wait for cover noise`, the perfect mark → `Perfect`,
the cover banner `..., vent now!` → the noise's name and `Vent now` as two lines, `WAFT IT AWAY!` → `Waft it away`,
`GASP!` → `Gasp`, `a whiff, clench!` → `A whiff. Clench`, `SWAP! LEFT ONLY` → `Swap. Left only`, and whatever else
the check lists. Viewport: drop `maximum-scale=1,user-scalable=no`. Fonts: one Google Fonts link for Noto Serif 700
and Open Sans 400 and 600 with display swap; the serif stack keeps its system fallbacks. Tokens: the four palettes
from `palette_and_controls.css` as CSS variables under the existing `body.pal-*` classes (map `matinee` →
matinee_sepia values, `midnight`, `technicolor`, `silver`; the ids stay), the `--art-filter` on a `.ff-art-layer`
class that only the room plate, strips and props carry; HUD text stays outside it. Gate: check (copy and zoom rules
green), no shot.

**Step 3. The stage (M; Astra #1).** A scene id map from the `SCENES` index to the style guide ids (funeral,
job_interview, first_date, live_on_air, silent_yoga, wedding_vows, library, elevator, recital, confession,
meditation_retreat, babys_nap; the order of SCENES never changes). The stage becomes layers in INTEGRATION's order:
room plate (`assets/stage/bg_<id>.webp`, object fit cover, current and next room decoded ahead, never all twelve) →
witness strip (`onlookers_<id>_backs.png`, 1080x540 scaled to the stage width, anchored at the pew line) → the bust
(the five rigs inline, one shown, the six `expression_*` groups switched by the existing data tier: calm, nervous,
strain, critical, blowout, relief map 1:1) → the flush and sweat as overlays at the manifest's anchors (cheeks
(132,194) and (228,194), drops (105,150) and (255,150), 360 logical) → the caption ribbon (a new, stable element
under the stage; step 5 fills it) → HUD. Each asset swap waits for decode; a failed load keeps the old drawing and
never costs a strike. The card frame nine slice (48 source px) on `.card`; the intertitle on `intertitle_frame.png`
with its text band (90, 330, 720, 470 of 900x1200), act, title, subtitle only; the paper tile behind the app and the
grain tile static at low opacity; the menu on `bg_menu_mood.webp` with the wordmark symbol and the calm bust behind
the card; game over on `bg_game_over_mood.webp`. Gate: check; ONE shot: `08-play-calm-both-pads`; look.

**Step 4. The control deck, Stephen's Twister (M; his words, with Astra's INTEGRATION rules).** One fixed deck at
the bottom, above the safe area, three columns, two buttons either side and two in the middle:
  - Left column: LEAN LEFT (hold, 56 px tall) above LEFT HOLD (the pad: at least 120 px tall, as wide as the column).
  - Right column: LEAN RIGHT above RIGHT HOLD, mirrored.
  - Middle column: the posture track as a thin visual (not a button) above HOLD BREATH (hold, 56 px) above VENT (big).
  Cough, Sip and Waft leave the deck and become props on the stage at the pew line, 56 px targets with their labels
  under them and Astra's ability plates as their faces: the handkerchief left of the bust, the glass right of it, the
  fan on the lap; charges as the charge dots on the prop, the sip cooldown ring real. Leaks spawn on the stage in a
  region that never overlaps a prop, 48 px targets, never two overlapping. That is the Twister: thumbs on the pads,
  a finger up to the stage for a prop or a leak. No gameplay rule changes in this step: every timing, cost, charge
  and strain stays as coded; only where the buttons live. Pads use pointer capture per pointer id; a pad releases on
  pointercancel, blur, visibilitychange and orientation change; pause releases both pads and freezes every timer;
  resume counts three beats before pressure moves. The pad plates (idle, held, tired) and the VENT plates (unsafe,
  cover, perfect) by state; the breath bar on its plate. The fleet's chrome: set `window.SWS_MUSIC_HOLD = true` before
  `/music-unlocks.js` loads so the Music chip never lands on the deck, and let the feedback fab yield (it parks itself
  when it sits over a control; check it does over the pads). Gate: check; ONE shot: `08-play-calm-both-pads`, and
  `W=360 node tools/ff-tests/shoot.mjs ... 08-play-calm-both-pads` once if anything wraps; look at both.

**Step 5. Witnesses, reactions, cover timing (M; Astra #2 and #4).** A strike swaps the whole strip to
`onlookers_<id>_turned.png` (an instant swap, never a tween), holds it long enough to read (2.5 s), then back. The
reaction line moves from red text over the face into the caption ribbon under the stage. The strike pips light with
the X plate. The full screen red flood becomes a brief local emphasis on the bust (no flood, no shake while a leak is
up). The whiff: the `icon_whiff` glyph and `A whiff. Clench` in the ribbon, not on the face. The cover: the banner
plate with the noise's icon and a countdown driven by the gameplay clock (the same clock that opens VENT), VENT
turning to its cover plate with the same countdown and `Vent`; a perfect shows the brass plate `Perfect` for 450 ms
with the relief expression; the waft window as a real timed rim on the fan prop; the combo badge readable. Reduced
motion: all of this static. Gate: check; ONE shot: `14-play-a-strike-the-room-reacts`; look.

**Step 6. Menu, how to play, tutorial, medals, wardrobe, stats, pause (M; Astra's table).** Menu: Stage and Normal
selected by default and the last choice remembered (new keys under `ff.ui.*` are fine); mode and difficulty buttons
carry their icons beside the text. How to play: three illustrated steps first (hold both, vent under the noise,
tap a leak) with icons, the rest below. Tutorial: pressure does not tick while a coach card is up, and the card never
covers the control it asks for. Medals: `ic('medal_<id>')` marks, locked cards readable, the threshold always
printed, a progress line where a lifetime stat exists (`ff.l.time`, `ff.l.plugs`, `ff.l.bestcombo`...). Wardrobe:
the five portraits, the four palette plaques, the frame, the lock, the equipped check (never colour alone). Stats:
one lead line (best composure, deepest act) above the table. Pause: pads released, timers frozen, a count in on
resume. Gate: check; ONE shot: `01-menu`; look.

**Step 7. The result and the share (M; Astra #5).** The game over card shows the bust in its final expression, the
room, the scene and act, the time held and the verdict; Face it again first, Share second. Share: a frozen record of
the run (mode, difficulty, scene id, act, time, final expression, verdict, score) drawn onto a 1080x1080 canvas over
`result_square.png` (window 180,255,720,500; bands scene_act 90,790,900,75 and time_verdict 90,885,900,115), the
bust from the inline SVG (serialise it to a blob URL and drawImage), the room plate behind it, the wordmark; handed
to `navigator.share` with a file after the tap, else downloaded. Only real values, never a scene and act pairing the
run did not reach. Gate: check; ONE shot: `16-game-over-exposed`; look.

**Step 8. Cover props and sound (S/M; Astra #3 and NOTES; dropped first if time is short).** Three props only: the
bus slides behind the funeral and elevator scenes during a BUS cover, the books tip in the library during BOOKS, the
radio lamp glows in Live On Air during SIREN and APPLAUSE; clipped inside the stage, driven by the cover's own clock,
static under reduced motion, never shown when the event is not active. Sound: add the cover onset cue and the two
note perfect from NOTES.md where the synth lacks them, a music level separate from effects; the strike sound stays
as it is today (DECISIONS). Gate: check; ONE shot: `09-play-cover-noise-vent-now`; look.

**Step 9. The walk, the deploy script, STOP.** `node tools/ff-tests/check.js` green. The full shoot once to
`/home/codespace/ff-drafts/after/`; open every image; one line per screen with three things wrong (or "reads"), into
this file under STATE. Bump `ART_V`. Commit and push. Write `/home/codespace/ff-drafts/deploy-ff-m1.sh` from the
template `/home/codespace/studio-drafts/deploy-studio-m1.sh`: it builds a commit on top of origin/main from git
objects carrying ONLY `satellites/flatulence-fighter/**` and `portal-assets/thumbs/flatulence-fighter.jpg`; it base
checks main's `index.html`, `og/card.jpg` and the thumb against the blobs in step 0 and STOPS if any moved; `DRY=1`
stops before the push; it waits for lucidwinds.com/satellites/flatulence-fighter/ to serve the new index. Run it
with `DRY=1` once. Put the line in START-HERE for Stephen: `! bash /home/codespace/ff-drafts/deploy-ff-m1.sh`. Then stop.

## DECISIONS for Stephen (not built overnight; Fable raises them in the morning)

1. **The deck.** Step 4 builds his words as: HOLD and LEAN either side, BREATH and VENT in the middle, Cough, Sip and
   Waft as props on the stage. The alternative is the abilities as a third row in the deck (nine buttons). He plays
   the built one on the Pixel first.
2. **The strike sound.** Astra's NOTES want a dry rim tap and the room's reaction, "never an exaggerated bodily
   sound"; today's synthesised fart IS the joke. Kept as is until he says.
3. **The store.** Keep Flatulence Fighter (Astra's alternates for the record: Perfectly Composed, Hold Your Dignity);
   the Play listing is its own milestone after m1 (a TWA like Shutterbug: the manifest from step 1, assetlinks, the
   six store frames filled from real captures with `tools/store-kit/compose.mjs`, the launch frame and feature
   graphic from the pack). The standalone build drops the arcade chrome.
4. **Silver Screen.** The code and the wardrobe card agree (Easy, Normal, Panic, Daily and Zen); the September note
   said every mode. Left as coded.
5. **Assist options.** Astra proposes auto breath and auto posture as accessibility toggles kept out of Daily
   ranking. Not built; his call on whether the Twister wants them.
6. **The arcade chrome on the arcade page.** The Music chip is held in step 4; the ladybug yields when it sits on a
   control; if he still sees either over a pad on the Pixel, they move to the top band.
