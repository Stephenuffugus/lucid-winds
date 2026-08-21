# Trailer — first draft

46.0 seconds, 1920x1080, H.264, 30fps, 25MB. Built to the shot by shot timing
sheet in `../STORE_PAGE_FILL.md` Part 4.3, beat for beat, captions verbatim.

    out/trailer_draft.mp4                     the cut
    out/microtrailer_6s.mp4                   0:07 to 0:13, the trail climbing then dying
    out/poster_1920x1080.png                  poster frame, the spec's choice
    out/poster_alt_coldopen_1920x1080.png     poster frame, the alternative (see below)
    clips/beat*.mp4                           each beat on its own, for recutting
    rig/                                      the capture and assembly rig

**It is silent on purpose.** Valve autoplays muted, so Part 4.3 puts the story in
the captions and treats music as a bonus for whoever unmutes. Which track goes on
it is your call, not mine. The file carries an empty stereo AAC track so it drops
into an editor cleanly.

## What is in it

| Time | Beat | Caption |
|---|---|---|
| 0:00 | Cold open, Pike Place rain, a near miss (level 7) | SEATTLE'S ROUNDEST RACCOON |
| 0:03 | Four one second cuts: levels 4, 18, 52, 72, each with its chapter banner up | TEN CHAPTERS |
| 0:07 | Feast Trail climbing to 8, then a BIG FEAST bank (level 56) | EVERY CLEAN HOP GROWS THE TRAIL |
| 0:11 | A real death at trail 7, then the SWEPT UP card (level 58) | ONE BAD HOP TAKES IT ALL |
| 0:13 | Ferry Crossing, Storm Watch, Gull Swarm, Blackout (50, 40, 70, 100) | EVERY TENTH LEVEL IS A SET PIECE |
| 0:19 | Coffee, Hi Vis Vest, Rain Boots, Salmon Dinner, each really picked up | NINE POWER UPS |
| 0:23 | The level map scrolling to 100 and past it | 100 LEVELS / AND IT DOES NOT STOP THERE |
| 0:27 | Collection, 45 of 45, then the same level as three different characters | 45 TO PLAY AS |
| 0:32 | Daily #31 card, block strip, 7 day streak | ONE COURSE A DAY, THE SAME ROAD FOR EVERYONE |
| 0:36 | LEVEL CLEAR 100, three stars | THE GREATEST DUMPSTER FEAST IN TOWN |
| 0:39 | Wordmark, Jimothy walks in and sits | A RUN TAKES TWO MINUTES. / THE FEAST TAKES A LIFETIME. |
| 0:43 | Lockup holds | NO ACCOUNT. NO INTERNET. NOTHING ELSE TO BUY. |

The three DON'Ts are honoured: no logo intro, the game frame is 588x1044 which
is 540x960 at true aspect and is never stretched, and no caption ever sits over
the playfield.

## What I do not like about it, before you have to say it

1. **0:23 to 0:39 is sixteen seconds of dark menus.** Level map, wardrobe, Daily
   card, clear card, one after another, and the game is a night game so they are
   all near black on near black. It is what the timing sheet asks for and the
   content is right, but it is the flattest stretch in the cut. Easiest fix is to
   shorten beats 7 and 9 by a second each and give it back to the set pieces.
2. **The level 100 clear card reads Time 0:00, Hops 0, Bottlecaps 0, Feasts
   banked 0.** The shot parks the hero at the gate with a test helper instead of
   playing sixteen rows to get there, so the per level counters never ran. The
   stars, the chapter line and the bonus are all real. Fixing it honestly means
   playing level 100 to its gate on camera, which is a longer capture, not a
   number I am willing to type in.
3. **Two poster frames, because I do not think the spec's choice is the better
   thumbnail.** Part 4.3 says use the 0:07 frame, so `poster_1920x1080.png` is
   that: the Feast Trail reading 8 the moment before it banks. It is the right
   story frame. But it is a dark street full of trains and rafts and Jimothy is
   small in it. `poster_alt_coldopen_1920x1080.png` is the Pike Place near miss,
   the brightest and most readable frame the trailer has. A poster frame is a
   thumbnail before it is anything else. Your call.
4. **The end card uses the shipped green wordmark.** You are picking a new one
   from `../capsules/wordmark_options/`. When you do, rerun `rig/endcard.js` with
   that treatment and recut the tail. Guessing your answer would only have to be
   undone.

## The rig, and why it works this way

Stubbing `requestAnimationFrame` after boot stops the game's own `loop()`
rescheduling itself, so the harness owns the clock: `step(1/30)` + `render()` +
screenshot, once per frame. Every frame is exactly 1/30s of world time and a
re-run of a beat is identical to the last one. That is what makes a retry
meaningful — the levels are seeded, so the same timing reproduces the same death
and a retry has to vary something to get a different one.

    node rig/probe_levels.js "4,18,52,72" 400 "11,15"   which levels survive, and how they die
    node rig/probe_bank.js  "56:11,66:11"               when the Feast Trail banks, for beat 3
    node rig/capture.js [shot,shot]                     capture (all shots, or named ones)
    node rig/endcard.js                                 the composed tail
    node rig/plates.js                                  backdrop, slot hairline, captions
    node rig/assemble.js                                cut and encode

`frames/` is gitignored — it is 1380 JPEGs. Re-capture is about six minutes.

### Five things measurement caught that reasoning did not

- **PNG was the entire frame cost.** 922ms a frame versus 128ms for JPEG at the
  same scale. The trailer went from 21 minutes of capture to about three.
- **Mid air is safe.** `step()`'s collision block is guarded by `if(!G.hop ...)`,
  so only the landing and the stand after it can kill. The first pilot cleared
  the whole flight window and sat still for 22 frames refusing gaps a human takes
  every run.
- **`show('s-play')` ends with `requestAnimationFrame(loop)`.** Starting a level
  before seizing the clock hands the new run to the game unpiloted for however
  long the next await takes, and the wilt eats it. Every "0 frame death" in the
  early level sweeps was this, not a property of the level.
- **Pumping the held rAF queue re-runs `loop()` and steps the world twice.** The
  death shot drifted 12 frames in 13 while the harness believed it owned the
  clock. `__pump` now drops the queue while a run is live.
- **A green shot on a dead screen, twice.** The level select reported OK while
  scrolling an element that does not scroll, and the Daily beat reported OK with
  the card completely hidden behind a BADGE EARNED modal. Both now assert with
  `elementFromPoint` that the thing being photographed is actually the topmost
  pixel, and every award the game can hand out mid run is pre-awarded in the save
  so nothing can pop in front of the camera.
