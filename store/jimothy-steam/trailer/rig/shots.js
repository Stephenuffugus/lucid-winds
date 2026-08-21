/* THE SHOT LIST — the 46 second timing sheet in STORE_PAGE_FILL.md Part 4.3,
   turned into capturable units. One SHOT is one continuous run of frames from
   one page state; a BEAT is one or more shots laid end to end.

   `pre` frames are stepped but not written. It has two jobs: the level banner
   takes ~3.5s to fade, and — the one that cost a take — the .screen entry
   animation runs 0.5s, so anything shot before frame ~20 photographs a torn
   band across the top and a half drawn HUD. Never pre-roll less than 30. `frames` are the
   ones that reach the cut. Levels are seeded, so a take is reproducible — which
   is exactly why a retry has to VARY something (gap/pre) to get a new outcome.  */
const FPS=30;
const s=sec=>Math.round(sec*FPS);

module.exports=[
/* ---- 0:00  3s  cold open. No logo. Already running, rain, a truck close. ---- */
 {id:'b01_coldopen', beat:1, kind:'play', frames:s(3), pre:110, lvl:7, gap:12,
  weather:'rain', note:'Pike Place rain, traffic close enough to earn a phew'},

/* ---- 0:03  4s  four one-second cuts, four chapters. The level banner is UP
   on purpose here: it names the neighbourhood, which is the caption's evidence. */
 {id:'b02a_pike',   beat:2, kind:'play', frames:s(1), pre:34, lvl:4,  gap:11},
 {id:'b02b_westse', beat:2, kind:'play', frames:s(1), pre:34, lvl:18, gap:11},
 {id:'b02c_caphill',beat:2, kind:'play', frames:s(1), pre:34, lvl:52, gap:11},
 {id:'b02d_queenan',beat:2, kind:'play', frames:s(1), pre:34, lvl:72, gap:11},

/* ---- 0:07  4s  the trail climbs, then banks. THE POSTER FRAME. `pre` is set
   from probe_bank.js so the bank lands inside the window, not after it. ---- */
 {id:'b03_trail',   beat:3, kind:'play', frames:s(4), pre:90, lvl:85, gap:11,
  note:'probe_bank.js: lvl 85 gap 11 banks on frame 185 at a combo of 8, which\n        is the BIG FEAST grade, and survives well past the window. pre 90 puts\n        that bank 95 frames in, leaving the fanfare inside the cut. The level\n        banner is gone by frame 78 so this reads as mid run, not as a start.'},

/* ---- 0:11  2s  the same kind of run, one hop later, ends under a truck. ---- */
 {id:'b04_death',   beat:4, kind:'death', frames:s(2), lvl:58, gap:15,
  note:'a REAL death, not a forced one. Level 58 at gap 15 climbs the trail to 7\n        before it goes, which is the point of the beat: the counter had something\n        on it. The pre-roll is FOUND by the shot (see shootDeath), never guessed.\n        The card is in the same shot because it is the same page.'},

/* ---- 0:13  6s  set piece montage, 1.5s each ---- */
 {id:'b05a_ferry',  beat:5, kind:'play', frames:s(1.5), pre:34, lvl:50, gap:13, note:'FERRY CROSSING'},
 {id:'b05b_storm',  beat:5, kind:'play', frames:s(1.5), pre:34, lvl:40, gap:13, note:'STORM WATCH'},
 {id:'b05c_gull',   beat:5, kind:'play', frames:s(1.5), pre:34, lvl:70, gap:13, note:'GULL SWARM'},
 {id:'b05d_black',  beat:5, kind:'play', frames:s(1.5), pre:34, lvl:100,gap:15, note:'BLACKOUT'},

/* ---- 0:19  4s  four power ups, one second each. The power is written onto
   the row ahead through the game's own lane object, then actually hopped onto,
   so the pickup burst and the name float are the real ones. ---- */
 {id:'b06a_coffee', beat:6, kind:'play', frames:s(1), pre:100, lvl:31, gap:11, power:'coffee'},
 {id:'b06b_vest',   beat:6, kind:'play', frames:s(1), pre:100, lvl:24, gap:11, power:'vest'},
 {id:'b06c_boots',  beat:6, kind:'play', frames:s(1), pre:100, lvl:12, gap:11, power:'boots'},
 {id:'b06d_salmon', beat:6, kind:'play', frames:s(1), pre:100, lvl:64, gap:11, power:'salmon'},

/* ---- 0:23  4s  the level select map, scrolled slowly enough to read three
   chapter names, ending on level 100. ---- */
 {id:'b07_levels',  beat:7, kind:'levels', frames:s(4)},

/* ---- 0:27  5s  the wardrobe, then the same level as three different cast members ---- */
 {id:'b08a_coll',   beat:8, kind:'collection', frames:s(2.6)},
 {id:'b08b_shark',  beat:8, kind:'play', frames:s(0.8), pre:100, lvl:18, gap:11, chr:'shark'},
 {id:'b08c_dino',   beat:8, kind:'play', frames:s(0.8), pre:100, lvl:18, gap:11, chr:'dino'},
 {id:'b08d_secret', beat:8, kind:'play', frames:s(0.8), pre:100, lvl:18, gap:11, chr:'mothman'},

/* ---- 0:32  4s  the Daily result card ---- */
 {id:'b09_daily',   beat:9, kind:'daily', frames:s(4)},

/* ---- 0:36  3s  level 100. The feast. ---- */
 {id:'b10_feast',   beat:10, kind:'clear', frames:s(3), lvl:100},

/* ---- 0:39 / 0:43  the end card. Not gameplay: composed, and captured the
   same way so it shares the trailer's frame furniture. ---- */
 {id:'b11_wordmark',beat:11, kind:'endcard', frames:s(4), phase:'walk'},
 {id:'b12_lockup',  beat:12, kind:'endcard', frames:s(3), phase:'hold'}
];
module.exports.FPS=FPS;
