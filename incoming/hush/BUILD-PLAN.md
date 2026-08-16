# BUILD PLAN — HUSH (project 3 of 3)

**For the Opus build session. Reading order: this file → `HANDOFF-15.md`
(complete v1-v5 history, all engine invariants) → `RESEARCH-1.md` (the
positioning — load-bearing) → `RESEARCH-2-1.md` (music evidence, v4).**
Planned 2026-08-16; decisions are LOCKED defaults (Stephen can veto).

## What this is

A free noise/sleep-sound PWA for parents and kids. Five versions deep and
essentially feature-complete: noise spectra with verified slopes, comb tuning
with the render-quantum fix, programs that ALL fade to silence, the Schade
2020 slow-wave stimulus implemented to the paper's exact numbers, an
adaptive-masking mic path that never touches the output, a room dB meter, a
sleep-trial engine with verified Welch/permutation stats, tracker file
import (never OAuth — decided, verified, documented), generated instruments,
an evidence-tiered 22-sound library, and a simple mode (12 controls) as the
default. `index-51.html` (2844 lines) + `sw.js`.

**The positioning is the product and must not be diluted:** "the noise app
that tells you when not to use noise." Every program ends silent. The
evidence panel cites the study that argues against the category (Basner,
SLEEP 2026). No competitor on a subscription can copy this. Honest labelling
beats feature count everywhere in this app.

## 🚨 Fleet landmines (fix BEFORE first deploy — both are silent killers)

1. **`sw.js` nukes the whole origin.** Its activate handler deletes every
   cache whose key ≠ `hush-v1`. `caches.keys()` is ORIGIN-wIDE (this exact
   bug already black-screened our fleet once — see repo law). On
   lucidwinds.com it would destroy PadLab's and every satellite's offline
   caches. Fix: filter to `k.startsWith('hush-') && k !== CACHE`.
2. **PWA identity collision.** Runtime blob manifest with `start_url:"."`
   and no `id`/`scope` will collide with other lucidwinds PWAs (repo law:
   pwa_identity_collision). Ship a real `manifest.webmanifest` with
   `id`/`start_url`/`scope` = `/hush/` (PadLab pattern); keep the blob
   manifest as fallback only.

## Locked decisions

1. **Deploys to `lucidwinds.com/hush/`** — top-level like `/padlab/`, NOT
   Firebase (handoff's deploy section predates our stack; Hostinger
   auto-deploys from main). Rename `index-51.html` → `index.html`. Portal
   **Free Apps shelf** card (it is an app, not a game) — copy leads with:
   free, no ads, no account, works offline, and the contrarian evidence
   line. Also `beta:true` until Stephen flips it.
2. **No earn wiring, no toasts, no gamification.** A sleep app used at 2 a.m.
   next to a baby never interrupts itself — that is its entire market
   opening (ads-waking-the-baby is the category's #1 complaint). `sws:ready`
   bridge only if framed by the portal, with framed-only exit.
3. **Engine invariants are law** (from HANDOFF-15, all verified by
   measurement — do not "simplify" any of these):
   - comb delay uses `k/f` above the 375 Hz render-quantum floor
   - 10 s buffers with the 60 ms equal-power seam crossfade
   - relative (not absolute) volume ring; nursery cap 0.34 default ON
   - `Store` shim stays (localStorage + in-memory fallback)
   - every program reaches zero; mic never connects to the destination
   - Schade numbers are the citation — change them and the copy together
   - tempo clamp 60-80 bpm cites the research; simple mode stays ≤~15
     controls; shortlist stays at six with mixed evidence tiers; max three
     sounds may claim good evidence
4. **Port the tests.** The handoff references audit tests (evidence-tier
   cap, simple-mode control count, guide-route resolution, program-gain
   simulation, importer fixtures). If they exist in the drop, port them to
   `scripts/hush_audit.js` and run them as a gate; if they were left behind
   in the artifact env, RE-DERIVE them from the invariants above — the
   assertions are all stated precisely enough to rebuild. A gate you have
   not watched fail is decoration: break one invariant deliberately, watch
   the audit go red, revert.
5. **v6 build list, in order** (all from the handoff's own backlog):
   a. **Share-a-preset via URL hash** — encode `S` to base64 in the
      fragment, decode on load. Named twice as "the whole growth loop."
      Guard: a shared preset must never override the nursery cap or import
      a volume above it.
   b. **"Pick one and stick with it" on the opening screen** — the v4
      conditioning finding promoted to the front door (verify what v5
      simple mode already does before adding copy; it may be 90% there).
   c. **Earplug note** — one sentence in the adult-facing copy: Basner
      found earplugs beat pink noise for adults. Costs nothing, buys
      credibility.
   d. **dB-meter calibration flow** — play a known tone, let the user match
      against any reference, store the offset.
   Defer: multi-child profiles, new voices, multi-arm trials (deliberately
   unshipped — the stats get easy to misuse; respect that call).
6. **Stephen action item (not code):** the Japanese instrument copy
   (suikinkutsu/furin/shishi/rin) should be read by someone who grew up
   with those sounds before any public press push. The in-app cultural
   notice is the shipping posture until then. Also his call: the press
   angles in RESEARCH-1 §6 are ready-made for the parenting-subreddit
   outreach lane (warm, dad angle, zero dashes — outreach law).

## Build phases (gate each; commit AND push at every gate)

- **A — Land it safely.** `/hush/` folder, rename, sw.js origin fix, real
  manifest, portal Free Apps card, sws bridge. Gate: live at
  `lucidwinds.com/hush/?probe=RANDOM`; installs with its own identity;
  PadLab's SW caches VERIFIED intact after visiting Hush (list
  `caches.keys()` in devtools before/after); airplane-mode revisit works.
- **B — Audit harness.** `scripts/hush_audit.js` green, with one
  deliberate-failure check per assertion class. Gate: audit red on a broken
  invariant, green on HEAD.
- **C — v6a: share-a-preset.** Gate: share → open in a private window →
  identical sound; capped volume respected; junk fragment never throws.
- **D — v6b-d:** front-door conditioning copy, earplug note, calibration.
  Gate: simple-mode control count still ≤ the test's cap; all guide routes
  still resolve.
- **E — LOOKING gate.** Phone screenshots: simple-mode front door, the
  shortlist, full mode's worst densest panel, visualizer modes (incl. Void
  at 4 fps claim — verify with devtools FPS meter), ok-to-wake screen, at
  375×667 and desktop. Name three flaws before Stephen does. Check 48px
  rendered touch targets — a 2 a.m. app gets used with one thumb and no
  attention; misses are worse here than anywhere.

## Traps

- The mic is analysis-only BY DESIGN — any refactor that routes it near the
  destination is wrong even if inaudible (it is also the privacy story).
- Frame caps (30 fps, 4 fps Void) are battery engineering — keep.
- `wakeDate()` rolls +12 h — don't "fix" without reading it.
- Apple Health export.xml streams in 4 MB slices — never DOMParse whole.
- Importer unit inference is per-FILE median, never per-value (regression
  history in handoff v3).
- No dashes in player-facing copy (repo law) — audit the existing copy
  during the port and fix quietly.
