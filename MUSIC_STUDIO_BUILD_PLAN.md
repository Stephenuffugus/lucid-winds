# MUSIC STUDIO BUILD PLAN (4 Nov 2026) — Fable with Stephen, from Astra's pack v1

The studio is `studio.html` at the repo root: one file, vanilla JS, Web Audio. `games/song.js` only iframes it
(`/studio.html?v=...`, bump on every studio edit) and pays Sunbeams; `play/song.html` is the arcade shell page.
Astra's pack (7.5 MB, 193 assets): `/workspaces/music-studio-astra-v1/pack/music-studio-astra-pack-v1/` (NOT in git;
vault release `astra-music-studio-pack-v1-20261104`). Its docs are copied to `docs/briefs/music-studio/astra-v1/`
(ASSESSMENT, STYLE-GUIDE, INTEGRATION, NOTES, SOUND_LIBRARY, manifest.json, player_copy.json, cover_system.js,
circle_positions.json, ui_tokens.css). Read ASSESSMENT.md and STYLE-GUIDE.md once, INTEGRATION.md's sections 3 to 6.

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE | f5775342e (start) | check red at 60; before set in /home/codespace/studio-drafts/before/; origin/main blobs at start: studio.html 3530fca0, .htaccess 387ccde4 (equal to the branch); box booted 11:39 UTC so it stops near 23:39 UTC, not 13:56 |
| 1 | DONE | 7c129f0c0 | assets/games/song (starters 11 + header, tools 9, frames 3, slate), 107 symbol sprite inline via tools/studio-tests/build-sprite.js + ic(); play icons 192/512 + maskable 512, og card; check still 60 (asset rule green, nothing named yet) |
| 2 | DONE | next row | .htaccess grants microphone=(self) to studio.html, song.html, index.html only; song.js allow autoplay+microphone, ?v=20261104a; honest 3 second line + rights line; FluidR3 CC BY 3.0 comment + visible credit; grooves Loose swing / Dusty swing; Humanize; every dash and exclamation out of names, lessons and toasts; zoom on; check 57 (emoji only) |
| 3 | DONE | next row | Music Studio wordmark header with Save and New (PADLAB badge gone); every control emoji is an Astra icon beside its text (pause drawn in the same grammar); Astra tokens and colours; slate .24 behind the lanes; check GREEN; shot deferred to the walk (Stephen: tests at the end) |
| 4 | TODO | | |
| 5 | TODO | | |
| 6 | TODO | | |
| 7 | TODO | | |
| 8 | TODO | | |
| 9 | TODO | | |

## THE LAWS (Stephen's standing orders; they override anything in Astra's docs)

1. Code directly in the one session. No Workflow, no lanes, no subagents, no review agents, no redwatch.
2. THE TESTING LAW. Per step: `node tools/studio-tests/check.js` (seconds, no browser). A visual step: ONE shot of THAT
   screen with `node tools/studio-tests/shoot.mjs <outdir> <screen>` after all the step's edits, then OPEN it and write
   three things wrong in one line. Per milestone (step 9): the full walk once (all screens), then Stephen on the Pixel.
   Never re-run a green to confirm it.
3. Never push main. Never run a deploy. A push to main is a production deploy and only Stephen runs it, with `!`.
   Commit and push `add-sproing-jumper` after EVERY step (`git push -q origin add-sproing-jumper`); the box can stop.
4. One file. `studio.html` stays one HTML file with no build step and no framework; match its style (`var`,
   functions, the `GS.` namespace). Art loads from `assets/games/song/` (or is inlined, the SVG sprite). Never over
   1600 px a side except `assets/games/song/frames/`. Masters stay in `/workspaces/music-studio-astra-v1`; nothing
   from the pack's previews or dev folder ships except `cover_system.js` and the copy map.
5. Never change a serialized ID or key (starter ids, kit keys, groove keys, song fields, IndexedDB keys). Player
   facing words change through labels. Old songs and song codes must load unchanged.
6. The copy law: no dashes of any kind and no exclamation marks in anything a player reads. 48 px targets. Real
   buttons with labels (an icon never replaces the text or the aria label).
7. Notes: one line per step in the STATE block above and one line in START-HERE.md. No essays, no QUESTIONS file.
8. Scope is this plan. Nothing from Astra's "later" lists, nothing from the DECISIONS list, no other game.
9. The box stops about 13:56 UTC on 4 Nov (12 h from its 01:56 boot). Stop by 13:15 UTC with START-HERE written,
   whatever step you are on. Step 8 is dropped first if time is short.

## THE STEPS (in order; each ends green on the check, committed and pushed)

**Step 0. Prep (10 min).** `(cd /workspaces/lucid-winds && python3 -m http.server 8777 >/dev/null 2>&1 &)`. Run the
check (red today: 60, mostly emoji, dashes, zoom). Shoot the whole studio once to `/home/codespace/studio-drafts/
before/` as the before set. `mkdir -p /home/codespace/studio-drafts`. Note the count in STATE.

**Step 1. The assets in (S).** Make `assets/games/song/` from the pack: `starters/` (the eleven 320x200 PNGs, named as
in the pack, plus `start_header.webp`), `tools/` (hum_illustration.png, key_cap_up/down/recording.png,
sample_pad_empty/ready/recording.png, waveform_frame.png, songs_empty.png, the saved_cover examples are NOT needed),
`frames/` (video_title_portrait.png, video_end_portrait.png, share_frame_1080x1080.png; exempt from the 1600 rule),
`slate_surface.png`. The SVGs (66 icon_*, 12 family_*, 4 lane_*, 8 kit_*, listening_dots, rhythm_necklace,
rhythm_hit, circle_of_fifths_ring, circle_key_cell_00..11) become ONE inline sprite in studio.html: `<svg
id="gs-sprite" aria-hidden="true" style="display:none">` of `<symbol id="i-<name>" viewBox="0 0 24 24">` (keep each
file's own viewBox), stroke `currentColor`; a helper `function ic(name, cls)` returns `<svg class="gs-ic ..."
aria-hidden="true"><use href="#i-'+name+'"></use></svg>`. Write the sprite with a small node script in
`tools/studio-tests/` (keep it; the next pack reruns it). Identity: `app_icon.png` resized to 192 and 512 over
`play/icons/song-192.png` (+ `song-512.png` if the webmanifest names one), `social_card.jpg` over `play/og/song.jpg`
(1200x630), the maskable icon into `play/song.webmanifest` if it lists icons. Gate: check (the asset rule), no shot.

**Step 2. Policy, copy and attribution (S; Astra's blocker list).**
- `.htaccess` line 147 sets `microphone=()` for the whole site. Add, after that line, per route grants:
  `<Files "studio.html">`, `<Files "song.html">` and `<Files "index.html">` each with
  `Header set Permissions-Policy "geolocation=(self), camera=(), microphone=(self), payment=(self)"`. Nothing else
  in .htaccess changes. In `games/song.js` the iframe gets `fr.allow='autoplay; microphone'` and the `?v=` bumps to
  `20261104a`.
- Remove "Samples kept under 3s for copyright safety" (line 428) and the comment at line 1223: the limit stays and
  says "Record up to 3 seconds" (player_copy.json states.sample_limit).
- The soundfont comment at 881 says MIT; the bank is FluidR3_GM, CC BY 3.0. Fix the comment and add one visible
  credit line in the Tools row's bottom ("Instruments: FluidR3 General MIDI soundfont, CC BY 3.0, streamed from
  jsDelivr") plus "Use recordings you made or have permission to use" on the Sampler.
- Display labels through a map (keys untouched): groove names 'MPC 60 Swing' to 'Loose swing', 'SP-1200' to 'Dusty
  swing' (the `name` fields at 1592 and 1597 are display; the object keys stay); the transport's "Hum" (humanize
  abbreviation at 327) becomes "Humanize"; every dash in a starter name or desc, kit label, drum row label, chord
  progression or rhythm name goes (player_copy.json replacements; "head-nod" becomes "head nod"). If a STARTERS
  `name` is used as a saved key, add a `label` and render that.
- Viewport: drop `maximum-scale=1,user-scalable=no`.
Gate: check (zoom and dash rules green), no shot.

**Step 3. Identity, icons, tokens (S/M; Astra #3).** The header: the Music Studio wordmark SVG (on dark) inline at
32 px high replaces the text logo at 257; the PADLAB MPK badge block (262) is deleted; Save and New sit in the header
right (48 px). Every emoji in a button, heading, option, chip or starter card becomes `ic('<name>')` beside its
text (Play, Stop, Record, Tools, Songs, Video, Audio, Sampler, Rhythm, Circle, Keys, Hum, Show, Metro, Save, Save As
New, Save to Kit, Copy, Paste, Song code, Undo, Redo, Clear, Dice, Chorus, Suggest, Hear, Accent, Loop, Trim,
Normalize, Reverse, Pitch up and down, Import, Mic, Close, Octave up and down, Add, Delete, Mute, Solo). The `:root`
tokens move to Astra's values (text #f0e8d8, muted #a7b29e, sage #8fc776, gold #d6b85c, panel #1a2119, raised
#263222, line #708666, divider #364332, bass #e88686, the stop red to #e88686); filled sage or gold buttons use canvas
text. The slate texture at .24 behind the lane stack only. Gate: check (the emoji rule green); ONE shot:
`02-grid-top-hip-hop`; look.

**Step 4. Transport, 48 px, lane headers (M; Astra #4 WITHOUT the grid paging, see DECISIONS).** One fixed height
transport: Play, Stop, BPM, Loop, Tools (New is in the header now). Every control 48 px: `.gs-chip` 36 to 48, song
rows 40 to 48, selects 44 to 48, range inputs 48 high with a 24 px thumb, the Keys pad scrolls horizontally at 360
wide. Lane header = 32 px badge (`lane_*` symbol) + name + instrument + a 48 px expand control; expanded, a second row
holds Mute, Solo, volume, randomize (dice); FX collapsed under one "Shape sound" row. Sections row: A Verse sage,
B Chorus gold, C Bridge blue, selected by outline and label, never tint alone. The grid cells' size does not change.
Gate: check; ONE shot: `03-grid-lanes`; look at 360 too if anything wraps (`page.setViewport` 360x780 in the shoot
script is one line).

**Step 5. Start a Song (M; Astra #5).** Two columns; each card = cover (`starters/<id>.png` at 160x100, never
stretched) + name + BPM as live text below; the `start_header.webp` ribbon small at the top; a Resume card FIRST when
an autosave exists; Blank Canvas visible with its own cover; the tap that picks a starter starts playback (it is a
user gesture). The modal is a solid panel (no bleed of the header through it). Gate: ONE shot: `01-start-a-song`.

**Step 6. My Songs and honest saves (M; Astra #6 and the small part of #2).** Covers: paste `cover_system.js` into
the page; seed = normalized title + integer BPM, stored on the song with `recipeVersion:1` and the palette index the
first time it is drawn (never recomputed on rename). Rows: cover, name, last edited, 48 px; delete asks once (a second
tap or a confirm), never a bare cross; empty state = `songs_empty.png` + "Start a song". Saves: `writeSongIndex` and
`saveToSlot` return false on any caught error and show "Could not save. Keep this page open and export a backup."
(no success toast after a failure); `autosaveTick` clears the dirty flag only after the write succeeded; a Backup
button in My Songs downloads the song as a JSON file (and the song code). The IndexedDB sample migration is NOT this
step (DECISIONS). Add two `GS.saveToSlot` calls before shot 07 in the shoot script so the list has rows. Gate: ONE
shot: `07-my-songs`.

**Step 7. Sampler and Hum states (S/M; Astra #8 light).** Hum: `hum_illustration.png`, the listening dots symbol,
the states from player_copy.json (mic_intro, listening, processing, weak_signal, mic_denied) shown as text with the
dot; a denied mic never loses the previous melody. Sampler: the three pad faces by state, the waveform frame around
the real waveform (the frame is decoration; pixels come from the sample), `import_rights` copy, the 3 second line.
No new audio engine work. Gate: ONE shot: `11-hum-a-melody`.

**Step 8. Show, video, share (M; Astra #9). Dropped first if time is short.** The video export opens with the
title frame for 1 s (song title drawn live in Bebas Neue in the frame's text band from manifest.json) and ends with
the end frame for 1 s; the music is never cut to fit. One more Show style, bars (24 to 48 log spaced bins, peak
decay), as a toggle on the Show screen; radial stays the default. Share: a "Share" button on the Show makes a
1080x1080 PNG on a canvas (cover + name + BPM + the song code band) and hands it to `navigator.share` or downloads it.
Gate: ONE shot: `13-show-visualizer`.

**Step 9. The walk, the deploy script, STOP.** `node tools/studio-tests/check.js` green. The full shoot once to
`/home/codespace/studio-drafts/after/`; open every image; one line per screen with three things wrong (or "reads").
Bump `?v=` in games/song.js if not done. Commit and push. Write `/home/codespace/studio-drafts/deploy-studio-m1.sh`
from the template `/home/codespace/loaf-drafts/deploy-loaf-a3.sh`: it builds a commit on top of origin/main from
git objects carrying ONLY `studio.html`, `assets/games/song/**`, `games/song.js`, `play/icons/song-*.png`,
`play/og/song.jpg`, `play/song.webmanifest`, `.htaccess`; it base checks main's `studio.html` AND `.htaccess` blobs
against the ones this branch started from (`git rev-parse origin/main:studio.html` at step 0, note the hashes in
STATE) and STOPS if either moved; `DRY=1` stops before the push; it waits for lucidwinds.com/studio.html to match.
Run it with `DRY=1` once. Put the line in START-HERE for Stephen: `! bash /home/codespace/studio-drafts/deploy-studio-m1.sh`.
Then stop.

## DECISIONS for Stephen (not built overnight; Fable raises them in the morning)

1. **Grid cells.** Astra: 16 cells at 20 px fail the 48 px law; proposal `previews/style_grid.png` (4 steps per beat
   page at 48 px, a 16 step overview, prev and next). Options: (a) Astra's paging, (b) a horizontally scrolling grid
   with 44 px cells and a sticky label rail, (c) keep today's dense grid as a deliberate exception. Play the live
   studio first.
2. **The name.** Astra proposes Grovewave (wordmark drawn), Mossbeat, Liltroom; the pack also carries a Music Studio
   wordmark, which is what ships until he picks. Availability unchecked.
3. **Sound discovery (the CC0 library drawer).** Astra's SOUND_LIBRARY.md. A milestone of its own, needs a source and
   a rights record per sound.
4. **Transactional sample storage** (IDs instead of names, mono by choice, migration with an alias table). L, its own
   milestone, before any paid tier.
5. **Store shots** from the finished app in Astra's six frames (`tools/store-kit/compose.mjs` as Shutterbug), after 1 and 2.
