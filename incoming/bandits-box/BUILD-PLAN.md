# BUILD PLAN — BANDIT'S BOX (project 2 of 3)

**For the Opus build session. Read this file, then `RESEARCH-NOTES.md`, then
the HOUSE RULES comment at the top of `bandits-box.html` before touching
code.** Planned 2026-08-16; decisions are LOCKED defaults (Stephen can veto).

## What this is

An ASMR / quiet-fidget app. 21 toys, all working, driven by a continuous
friction sound engine (a living noise bed whose gain/filter follow finger
speed + pressure — NOT per-pixel click spam). Bandai ∞-line surprise mechanic
(every ~100th pop is a gag, wobbling interval). Four themes + full sensory
controls, grounded in autism/sensory research (see RESEARCH-NOTES.md — the
"explicitly rejected" list is LAW: no ads, no unlocks, no scores, no streaks,
no coercive gamification, ever).

The market opening, verbatim from the research: every category leader gates
stress-relief toys behind rewarded video. We don't. That IS the product.

## State of the prototype (audited 2026-08-16)

- `bandits-box.html`, 3645 lines, ES5-style vanilla, one file. Clean section
  markers per toy (BANDIT/coon, SOAP, POP sheet, TISSUES, TEXTURES, LATCHES,
  SPINNER, PUPPET, BUBBLE WRAP, KNOBS, SLIME, GEARS, SAND, CRADLE, SPRING,
  SEQUINS, EDAMAME, PERI, CHOC, WALL/switches, BALL/stress ball = 21).
- Sound engine (~line 911): one-shots + `Friction()` continuous voices; LIVE
  registry so nothing looping survives a toy switch (the "white noise bug"
  writeup at ~986 is load-bearing history — preserve those comments).
- Surprise engine ~1219. Sample bank ~1178: `SFX_MANIFEST` + `loadSamples()`
  + `playSample()` fully wired, manifest EMPTY — recordings replace synth
  voices automatically when files exist, synth remains the fallback.
- Optional tally (off by default, renameable word) — wooden-fish research.
- Runtime blob manifest fallback at file tail; no sw.js, no real manifest.

## 🚨 Two porting landmines (fix first, they are silent failures)

1. **`window.storage` does not exist in browsers** (lines 901-908 — it is
   the claude.ai artifact sandbox API). Settings currently CANNOT persist on
   the real site. Replace `saveS`/`loadS` internals with `localStorage`
   (`bandit-set` key, try/catch kept, same debounced `saveSoon`). Settings
   are tiny + low-stakes; plain JSON overwrite is fine (two-tab clobber law
   applies to counters, not toggles).
2. **Audio-off-first-gesture:** house rule 1 says the screen never waits on
   audio. Verify after porting: block AudioContext in devtools and confirm
   every toy still moves and ripples.

## Locked decisions

1. **Ships as a satellite**: `satellites/bandits-box/` (index.html + sw.js +
   manifest.webmanifest + real icons rendered from the inline raccoon SVG).
   Keep the runtime-blob-manifest fallback code as a safety net. Standard
   caching law: version everything, `Cache-Control: no-cache` on the HTML,
   SW shell version bumped every ship, verify live with `?probe=RANDOM`.
2. **Portal card, beta:true** — copy leads with the differentiator: quiet,
   no ads, no unlocks, works offline. Thumb ≤150KB. Display name:
   **Bandit's Box** (apostrophe, no dash — and no dashes anywhere in copy).
3. **sws bridge: framing only.** `sws:ready` on load + framed-only "Back to
   Sky Wolf" exit, per portal standard. **NO Sunbeam earn wiring, no earn
   toasts, no daily anything inside this app.** The research names coercive
   gamification as harmful to exactly this audience, and the app's identity
   is that nothing is asked of you. This intentionally deviates from the
   30/day earn standard — recorded here as the default; Stephen can veto.
4. **No new toys before the sound pass.** Quality over roster size. The
   category leaders have 50 mediocre toys; we have 21 good ones. New toys
   (Balloon first, then kinetic-sand slicing, coin flip, sand pendulum,
   keyboard clicks) come only after phases A-C are live.
5. **The special sauce is REAL FOLEY.** Stephen is a music producer with
   recording gear. The single biggest quality jump (research doc, last
   section) is real recordings in `sfx/`. Build task: write
   `satellites/bandits-box/SFX-SHOT-LIST.md` for Stephen — per sound name:
   what to record, mic distance, ~10 takes each, plus slow/light and
   fast/hard PAIRS for the friction texture beds. Wire `SFX_MANIFEST`
   entries commented-and-ready so dropping files in `sfx/` + uncommenting
   ships them. Suggested first bank (biggest audible wins): pop, tap, snap,
   rip, click/switch, latch, tissue, bubble-wrap, chocolate-crack, bean-pop.
   The surprise gags (door chime, dog, duck…) also want real recordings —
   a real dog bark beats a sawtooth ramp forever.
6. **Per-toy favourites** (research backlog #4): long-press a picker tab to
   pin up to 3 toys to the front. No usage tracking, no auto-reorder —
   PREDICTABILITY rule: the order never changes unless the player changes it.
7. **"designed by Penny"** (CSS comment, line 14): not player-visible; leave
   the file as it is and ask Stephen who Penny is before ever surfacing the
   credit in UI (if it's his daughter, credit her properly on the about
   sheet; if it's an invented persona, it never surfaces — solo-voice law).

## Build phases (gate each; commit AND push at every gate)

- **A — Port + landmines.** Satellite folder, storage swap, PWA shell, sws
  bridge, portal card. Gate: deployed URL live with `?probe=RANDOM`; settings
  survive reload on the REAL site; airplane-mode revisit works (SW); install
  works on Android; audio-blocked run still fully playable.
- **B — Fleet standards audit.** 48px touch targets measured RENDERED at
  375×667 (picker tabs are 11px font in ~38px pills — likely need height);
  visualViewport for any height math; feedback-form typing guard N/A (no
  forms) — verify no global key handlers eat typing if a form is ever added.
  Gate: audit notes written, violations fixed.
- **C — The white-noise regression suite.** Manual, on a phone: mid-gesture
  toy switch, mid-gesture tab hide, mid-gesture BIG-mode toggle, app
  background/foreground, 10 minutes idle — then headphones up: SILENCE.
  Any hiss = a LIVE-registry escapee. Gate: silent on all five.
- **D — Foley pipeline.** SFX-SHOT-LIST.md written; manifest entries staged;
  `loadSamples` verified with 2-3 scratch recordings (any wav) end to end,
  including the "Using N recorded sounds" label. Gate: scratch samples
  audibly replace synth pops with jitter variation intact.
- **E — Favourites + Balloon.** Favourites per decision 6. Balloon toy per
  research (inflate on held press, tension rises as a note, pop; the one toy
  where anticipation is the point — still no fail state: an over-inflated
  balloon just squeaks away, it never "loses"). Gate: LOOKING pass below.

## LOOKING gate (project law)

Phone-size screenshots of: picker strip, 3 toys at rest, 2 toys mid-gesture,
BIG mode, each of the 4 themes. Name three things wrong before Stephen does.
Check the worst case on purpose: smallest theme-contrast pair at max
brightness dimming, sequins mid-sweep at 60fps, slime stretched to the corner.

## Traps

- Nothing that loops may exist outside LIVE (engine law, comment ~998).
- Every fade lands on hard zero — `setTargetAtTime` asymptote was bug #1.
- `slot()` caps voices at 34 — keep; new toys must route through it.
- Ripples on EVERY touch (redundant-representation accessibility rule).
- No `alert()`; failures stay silent-but-playable (synth fallback pattern).
- Do not "clean up" the essay comments in the file — they are the docs.
