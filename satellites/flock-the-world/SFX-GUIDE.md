# FTW SOUND — how we make these together

Written for Stephen, 2026-08-23. Updated 2026-08-24 after your playtest note
("let's see what free sound effects we can use, and then I can actually make
some music").

## Where we stand (2026-08-24)

**The 22 one-shots are DONE and live.** All sourced from Kenney.nl CC0 packs
(commercially safe, provenance per file in `sfx/CREDITS.md`), converted to
mono 96kbps mp3, wired into `SFX_HAVE`, and verified loading in a real
browser. Nothing synthesized. If any of them lands wrong to your ear, drop a
replacement file over the same name in `sfx/` and it just plays; no code
change.

**What's left is the music, and it's yours.** Six cues:

- `theme_menu` (60 to 90s seamless loop)
- `bed_hq` (60s loop, the calm in-game bed)
- `bed_tension` (60s loop, the game crossfades to it as the world heats)
- `win`, `loss_refusal`, `loss_coalition` (8s endings)

## MORE SONGS PER SLOT (playlists, added 2026-08-25)

You asked for the Jimothy setup: "four or five songs that you can take in
and out of your playlist." It's live. To add a second (third, fourth...)
track to any music slot:

1. Drop the file in `sfx/` named `<slot>_2.mp3` (then `_3`, `_4`...), e.g.
   `bed_hq_2.mp3`, `win_2.mp3`, `theme_menu_2.mp3`. Stereo 128k like your
   others.
2. Add its id to the slot's list in `MUSIC_HAVE` in index.html (search for
   `const MUSIC_HAVE`), e.g. `bed_hq:['bed_hq','bed_hq_2']`.
3. Add a provenance row to `sfx/CREDITS.md` (your Suno tracks are all
   rights reserved, so every file gets a row).
4. `node check.js` - it refuses an orphan drop (file without a listing) and
   a listing without a file, both directions.

What the player gets: slots with 2+ tracks rotate (never the same track
twice in a row; beds hand off at the end of each track instead of
self-looping), and a SOUNDTRACK section appears in the menu with ♪ pips to
take tracks in and out. Excluding everything falls back to everything, so
nobody can configure silence.

Optional after that: the four crowd states (`murmur`, `peaceful`, `violent`,
`uprising`), one crowd source at four intensities. There was no verifiably CC0
crowd recording worth shipping, so those stay silent until you cut them.
If you want the fuller five-loop arc we discussed (early calm, mid tension,
late crisis, post-victory lap), make them and I will add crossfade tiers; the
three-cue wiring above is the minimum that completes the game.

## The short version

**Suno makes songs. It does not make clicks.** That is why the split:

- **Music: yours.** Suno is genuinely good at these. Themes, beds, stings.
- **One-shots: shipped** from CC0 packs as of Aug 24, replaceable any time.

## What I need back, exactly

One file per cue, named exactly the cue id:

```
satellites/flock-the-world/sfx/ui_tap.mp3
satellites/flock-the-world/sfx/theme_menu.mp3
```

- **mono, mp3, 96 kbps.** The whole game is 270 KB today; the audio must not
  dwarf it.
- **one-shots: 0.6 s or shorter.** Stings: 3 s or shorter. Endings: 8 s.
- **Beds and the theme must loop seamlessly.** Trim on a zero crossing.
- Leave no silence at the head of a one-shot. A 200 ms gap before a click reads
  as lag.

Drop them in that folder, tell me they are there, and I add each id to the
`SFX_HAVE` list in the code and verify it fires. **A file alone does nothing
until its id is in that list**, on purpose, so a half-finished folder never
ships 404s to players.

## The 10 Suno cues, with prompts

In Suno use **Custom mode**, put the text below in **Style**, leave lyrics
empty, and turn **Instrumental ON**. Then take the section you want and trim it.
Ask for more than you need and cut; that is normal.

| id | length | Suno style prompt |
|---|---|---|
| `theme_menu` | 60 to 90 s loop | *Corporate brochure synth, mid tempo, major key, clean DX7 electric piano and soft pads, confident and reassuring like a 1990s procurement video, one slightly sour note that never resolves, no drums after the intro, instrumental* |
| `bed_hq` | 60 s loop | *Server room ambience as music. Deep static hum, slow filtered pad, faint rhythmic tick like cooling fans, almost no melody, hypnotic and neutral, instrumental drone* |
| `bed_tension` | 60 s loop | *Slow dread. Low sustained strings, a heartbeat pulse under them, dissonant high shimmer creeping in, no resolution, no drums, instrumental* |
| `win` | 8 s | *Triumphant corporate fanfare that curdles. Bright brass swell resolving into a cold minor chord and a single held synth note, instrumental* |
| `loss_refusal` | 8 s | *Warm daylight release. Acoustic guitar and hand percussion, hopeful, human, a crowd feeling without voices, instrumental* |
| `loss_coalition` | 8 s | *Institutional collapse. Slow piano chords in an empty room, a distant low string, resigned and formal, instrumental* |
| `concede` | 2 s | *Insincere PR jingle. Four notes of chirpy ukulele and glockenspiel, television advert cheerful, ends on an unearned major chord, instrumental* |
| `breaking` | 2 s | *Urgent news sting. Sharp brass hit, timpani, tense strings rising, television news bulletin, instrumental* |
| `milestone` | 1.5 s | *Warm achievement chime. Sodium lamp warming up as music, low hum rising into a soft golden bell, instrumental* |
| `synergy` | 2 s | *Secret discovery sting. Gold shimmer, harp gliss into a struck bell, satisfying and slightly conspiratorial, instrumental* |

Two Suno habits that save time:
- Generate, then use **Extend** or **Crop** rather than re-rolling from zero.
- For the three loops, take a 30 to 60 s stretch from the MIDDLE of the track,
  where it has settled, not the intro.

## The 22 one-shots, made in your DAW

These are all faster to build than to describe to a model. Rough recipes:

| id | what it is | recipe |
|---|---|---|
| `ui_tap` | tiny dry click | short noise burst, 8 ms, high pass 2 kHz |
| `ui_open` / `ui_close` | panel slide | filtered noise sweep up / down, 200 ms |
| `buy_small` / `buy_large` | cash register thunk | low wood knock plus a coin tick; large is the same pitched down 4 semitones |
| `cant_afford` | dull buzz | 120 Hz square, 90 ms, fast decay |
| `bubble_cash` | coin ping | bright metallic ding, 250 ms |
| `bubble_inf` | glass ping | struck glass, higher and cleaner than the coin |
| `bubble_leak` | paper snatch | dry paper scratch, a document confiscated mid-print, 350 ms |
| `spend` | paper and coin swish | paper rustle plus one coin, 300 ms |
| `region_join` | rubber stamp | wood thud with a paper slap layered on |
| `region_full` | low gong plus stamp | the stamp again over a soft low gong |
| `murmur` / `peaceful` / `violent` / `uprising` | crowd bed in four steps | one crowd recording, four intensities: distant murmur, chanting, shouting, roar. Same source so they escalate believably |
| `region_lost` | poles falling, crowd cheer | metal clatter then the roar from above. **This one should feel good to hear and bad to earn** |
| `crackdown` | armored rumble | low engine rumble plus boot stomps |
| `crackdown_fail` | units refuse | a beat of near silence, then the crowd |
| `blackout` | broadcast cut | TV click into a mains hum |
| `agitate` | match strike | literal match strike, 400 ms |
| `doctrine` | boardroom chord | one held minor piano chord, 2 s |
| `event_open` | folder opens | paper and card, 300 ms |

If you would rather not build all 22, freesound.org has CC0 material for every
one of them. Check the licence is CC0 before using anything commercially.

## How we work together on this

1. You make a batch, even one file.
2. Drop them in `satellites/flock-the-world/sfx/`.
3. Tell me which ids you did.
4. I add those ids to `SFX_HAVE`, run the gate, play the game with sound on,
   and tell you honestly what it sounds like in context: too loud, too long,
   fires too often, wrong feeling.
5. You adjust the ones that need it. Repeat.

Start with `theme_menu`, `bed_hq` and `milestone`. Those three change the feel
of the whole game more than the other 29 combined, and they will tell us
quickly whether Suno is giving us what we want.
