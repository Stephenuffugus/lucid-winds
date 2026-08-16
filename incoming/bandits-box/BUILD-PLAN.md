# BUILD PLAN — BANDIT'S BOX (project 2 of 3) — v2, implementation level

**For the Opus build session. Reading order: this file → `RESEARCH-NOTES.md`
→ the HOUSE RULES comment atop `bandits-box.html` → `../PORTAL-CONTRACT.md`
→ `SFX-SHOT-LIST.md`.** Planned 2026-08-16 (deepened same night); decisions
are LOCKED defaults (Stephen can veto, the build does not re-litigate).

## What this is

An ASMR / quiet-fidget app. 21 working toys driven by a continuous friction
engine (a living noise bed whose gain/filter follow finger speed + pressure).
Bandai ∞-line surprise mechanic (every ~100th pop is a gag, wobbling
interval). 2 themes wired via `body[data-theme]` (night default, paper; the
research doc names four — faded/bold may be unbuilt: verify, and if absent
they are OPTIONAL phase-E work, not a port blocker). Sensory-first design
grounded in autism research. The "explicitly rejected" list in
RESEARCH-NOTES.md is LAW: no ads, no unlocks, no scores, no streaks, no
coercive gamification, ever.

## Audited facts (all verified against source 2026-08-16)

- 3645 lines, ES5-style, one file. 21 toys, clean per-toy sections.
- Sound: one-shots via `V` registry (20 voices: pop unpop tap crinkle grain
  peel rip rib plink squeak squish screech bell thunk snap latch hinge boing
  zip airout) + `Friction()` continuous voices. LIVE registry guarantees
  nothing looping survives a toy switch. Voice cap `slot()` = 34.
- **`feel(name,x,y,…)` (line ~1309) is the single dispatch seam**: tries
  `SAMPLES[name]` (recorded foley) → falls back to `V[name]` synth → ripple
  (`RIPCOLOR`) → haptic (`BUZZ_MS`). Foley ships by dropping wavs in `sfx/`
  and listing them in `SFX_MANIFEST` — zero engine work.
- **Inconsistency found:** the SWITCH WALL (toy 20, ~3210) calls
  `noiseHit`/`tone` directly, bypassing `feel()` — so it can never take
  foley and skips the ripple/haptic path. Fix in phase D (below).
- Settings `S` (~899): `{vol,quiet,calm,buzz,soft,grip,big,last,theme,fun,
  tally,word,total}`, saved debounced (900 ms) via `saveSoon()`.
- Surprise engine ~1219 (8 gags, interval wobbles 90-120). Tally opt-in.
- PWA: runtime blob manifest only (file tail); no sw.js in the drop.

## 🚨 Landmines (fix first — silent failures)

1. **`window.storage` does not exist in browsers** (lines 901-908 — it is
   the claude.ai artifact sandbox API). Settings currently cannot persist on
   the real site. Exact fix, keeping the async shape so `loadS().then(...)`
   at boot still works:
   ```js
   function saveS(){ try{ localStorage.setItem('bandit-set',JSON.stringify(S)); }catch(e){} }
   function loadS(){
     try{ var v=localStorage.getItem('bandit-set');
          if(v){ try{ Object.assign(S,JSON.parse(v)); }catch(e){} }
     }catch(e){}
     return Promise.resolve();
   }
   ```
   Settings are toggles, not counters — plain overwrite is fine under the
   two-tab law.
2. **Audio-off-first-gesture:** house rule 1 — the screen never waits on
   audio. After porting, block AudioContext in devtools and confirm every
   toy still moves and ripples.

## Locked decisions

1. **Ships as a satellite at `satellites/bandits-box/`** (index.html + sw.js
   + manifest.webmanifest + icons rendered from the inline raccoon SVG).
   Real manifest per PadLab pattern (unique `id`/`start_url`/`scope` =
   `/satellites/bandits-box/` — PWA identity-collision law); keep the blob
   fallback. sw.js: PadLab-style shell cache, cache keys prefixed
   `banditsbox-`, activate filter `k.startsWith('banditsbox-')` ONLY
   (origin-wide purge law).
2. **Portal: GAMES card, framed** (it is a toy you play — see
   PORTAL-CONTRACT.md for the locked shelf rule). Therefore the **embed
   protocol is REQUIRED**: paste the FTW block (contract doc has it
   verbatim) as the last script; `sws:ready` at parse + load; exit button on
   the picker strip end calling `SWS_EXIT()`. Card:
   `{nm:"Bandit's Box", ds:"A quiet box of fidget toys that feel real under
   your finger. No ads, nothing to unlock.", url:"/satellites/bandits-box/?v=<stamp>",
   ic:"🦝", thumb:"/portal-assets/thumbs/bandits-box.png", beta:true}`
   plus search keywords: `'bandit's box':'asmr fidget sensory calm quiet pop
   bubble wrap slime stim toys raccoon'`. Thumb ≤150KB — the fleet's thumbs
   are a mix of screenshots and painted art; DEFAULT: a clean 375-wide
   screenshot of the Bandit (raccoon) toy at rest on the night theme,
   cropped square. Painted MJ thumb only if Stephen asks (012Assets lane).
3. **No Sunbeam earns, no toasts, no daily anything.** Deviates from the
   fleet earn standard on purpose — coercive gamification is named harmful
   in the sensory research and no-ads/no-unlocks IS the product. Stephen can
   veto. The embed protocol (decision 2) is framing only.
4. **No new toys before the foley + consistency pass.** 21 good toys beat 50
   mediocre ones. Order after phases A-D: Balloon → favourites → kinetic
   sand slicing → coin flip → sand pendulum → keyboard panel.
5. **Foley is the special sauce.** `SFX-SHOT-LIST.md` (this folder) is
   Stephen's recording guide, mapped 1:1 to the `V` voice names. Opus stages
   the `SFX_MANIFEST` entries commented-and-ready and verifies the pipeline
   end to end with 2-3 scratch wavs.
6. **Favourites spec** (research backlog #4, predictability rule intact):
   - `S.favs = []` (max 3 toy ids). Long-press (550 ms) a strip tab toggles
     it; a small ⭐ dot on favourited tabs; favourites render as the FIRST
     tabs in the strip, in the order the player pinned them; everything else
     keeps the fixed catalog order. No usage tracking, no auto-reorder.
   - Long-press must not fire the tab's click (guard with a moved/held
     flag, same pattern the toys use to split tap from drag).
7. **Balloon toy spec** (first new toy, research "next up" #1):
   - Hold to inflate: radius eases up, a soft tone rises in pitch with size
     (the anticipation IS the toy). Release below the threshold: air
     sputters out (`airout` + shrink). Past the threshold: it does not
     explode into a fail — it slips from your finger and zips around the
     screen deflating (`zip`/`squeak`, ripples along the path), then a
     fresh balloon fades in. A perfect-hold pop is allowed only via the
     surprise engine (counts as a pop for the gag counter).
   - No fail state, no streaks. Calm-motion setting damps the flight.
   - New tab id `bln`, glyph in TOYS array style; all sounds through
     `feel()`; flight animation respects `S.calm`.
8. **"designed by Penny"** (CSS comment): not player-visible; leave it.
   Ask Stephen before surfacing any credit in UI.

## Build phases (gate each; commit AND push at every gate)

- **A — Port + landmines.** Satellite folder, storage swap, PWA shell
  (manifest + sw.js + icons), embed protocol, portal card + keywords +
  thumb. Gate: live at the versioned URL with `?probe=RANDOM`; opens framed
  from the portal WITHOUT the recovery timer closing it (proof the ready
  handshake works); back/exit returns to portal cleanly framed AND
  standalone; settings survive reload on the real site; airplane-mode
  revisit works; install carries its own identity (check it did not adopt
  PadLab's); audio-blocked run fully playable. **Also verify PadLab's caches
  are intact after visiting** (list `caches.keys()` before/after — fleet
  law, cheap to check).
- **B — Fleet standards.** 48px touch targets at 375×667 RENDERED (strip
  tabs are ~38px pills — likely need `min-height:48px` with padding, not
  font changes; measure, don't eyeball). visualViewport for any height math
  (audited 2026-08-16: `#app` is fixed-inset so layout is safe; the only
  real `innerHeight` uses are pointer-coordinate fallbacks plus `maxPull` at
  ~1843 in tissues — switch that one to visualViewport.height). Note: iOS
  screen-lock audio suspension does NOT matter here — foreground app.
  `node --check` on extracted JS (vm.createScript if SVG-in-CSS confuses).
  Gate: audit notes written, violations fixed, syntax clean.
- **C — White-noise regression suite.** On a phone, headphones up: (1)
  mid-gesture toy switch, (2) mid-gesture tab hide, (3) mid-gesture BIG
  toggle, (4) background/foreground the app, (5) 10 min idle. Gate: SILENCE
  in all five. Any hiss = a LIVE-registry escapee.
- **D — Sound consistency + foley pipeline.** Rewire the switch wall
  through a new `V.click` voice + `feel('click',…)` (row pitch via the
  existing semi arg → playbackRate on samples); add `click` to RIPCOLOR +
  BUZZ_MS + the manifest. Stage all SFX_MANIFEST entries (commented).
  Verify with scratch wavs: recorded sound replaces synth, jitter varies
  repeats, "Using N recorded sounds" label updates, missing files stay
  silent-but-playable. Gate: all of the above observed.
- **E — Favourites + Balloon** per specs 6-7. Gate: LOOKING pass (below) +
  favourites survive reload + balloon respects calm mode.
- **F (only if the night has room) — FrictionSampled.** Paired slow/fast
  texture loops crossfaded by speed/pressure, per texture bed, falling back
  to synthesized `Friction()` when loops are missing. Needs Stephen's
  recordings first — build the engine only if the pairs exist.

## LOOKING gate (project law)

Phone-size screenshots: picker strip, 3 toys at rest, 2 toys mid-gesture,
BIG mode, both themes (all four if faded/bold exist). Name three things
wrong before Stephen does. Worst case on purpose: sequins mid-sweep
(fps meter on), slime dragged to a corner, paper theme in a dark room.

## Traps

- Nothing that loops may exist outside LIVE (engine law ~998); every fade
  lands on a hard zero (`setTargetAtTime` asymptote was bug #1).
- All new sounds route through `feel()` and `slot()` — no direct
  `noiseHit`/`tone` from toys (that is how the wall bug happened).
- Ripples on EVERY touch (redundant-representation accessibility rule).
- No `alert()`; failures stay silent-but-playable.
- Do not reformat or "clean up" the essay comments — they are the docs.
- `?v=` stamp on the portal card URL changes EVERY deploy (caching law).
