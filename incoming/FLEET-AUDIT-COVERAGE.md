# FLEET AUDIT COVERAGE — living tracker

**29 satellites now carry an AUDIT-NOTES.md**, plus LOAF, Whack Box, Hush and PadLab at the repo root.

Started 2026-08-16. 101 carded satellites plus the root apps. This exists so nobody audits the
same game twice and nothing quietly gets skipped. Update it when a game is covered.

A game counts as **AUDITED** only when someone read it end to end, wrote the defect list BEFORE
editing, fixed worst first, and left a node check behind. An exit fix alone is **PARTIAL**.

## AUDITED (full pass, notes in the folder)

deepwell · blackout · parallel · wireworm · siege — built then deepened, 1422 assertions total
bandits-box · hush · padlab — audit and deepen pass
aura-farm · create-a-critter · flock-the-world · stop-the-light — audit and repair pass
dewball · loaf · party (Whack Box) · stream-hop · attic · nectar-drop · bloom-breaker ·
vinewinder · slice-master · power-scalers · twin-lanterns — round three, in flight

## PARTIAL (exit affordance only, game itself not audited)

chaff-wars · merge-blast · picnic-panic · ring-stacker · sprout-dice · vine-runner
bramble-court · bramblewick · bridgevine · fence-off · frost-watch · lamplighter · line-loom ·
loop-warden · mini-crossword · mosaic-draft · nova-bloom · orb-orchard · pollinator-paths ·
root-weave · silt · sled-vine · spore-drift · tempo-grove · tinker-loft · tonic-drop

## COPY ONLY (dashes removed, nothing else)

hues · dragon-philosophy

## WAVE 4 — AUDITED (notes landed; main loop verification still owed on most)

bubblenaut · budburst · burr-blast · burrow-bowl · flipbook · garden-td · greenhouse-pinball ·
moon-claw · petal-plunge · pollen-panic · pong · rule-root · seed-flutter · shell-shuffle ·
skyshot · slice-3d · sproing

⛔ **A broken `/feedback.js` silently removes the feedback chip from every page in the fleet.**
It was unparseable for part of 2026-08-16 (unterminated comment). Both `node --check feedback.js`
and `node feedback_check.mjs` were proven to catch it, so run one of them after ANY edit to a
shared root file. Verified clean locally and on production at the time of writing.

## NOT YET TOUCHED — 43 carded satellites, largest first

Recomputed from the portal and the notes on disk, so this does not drift.

```
blackout                3854
siege                   3518
deepwell                3308
wireworm                3077
parallel                2687
garden-td               2672
flatulence-fighter      1560
greenhouse-pinball      1458
petalvex                993
hedgerow                923
grubtrap                912
mahjong                 875
garden-estates          870
blooming-words          860
berry-vine              859
hexa-hive               847
rabbit-samurai          809
dew-snip                797
bloomzap                785
rootbound               755
...and 23 more
```

## Standing defect classes to check in every game from here

Each of these was found on a live, shipped game during this pass, so assume nothing.

1. **Exit gated on being framed.** The portal navigates relative `/satellites/` urls TOP LEVEL,
   so `window.parent !== window` is false and the exit never renders. Needs the
   `document.referrer` fallback from `incoming/PORTAL-CONTRACT.md`.
2. **The feedback fab.** `/feedback.js` mounts at bottom right, z-index 2147482000, real
   footprint about x = W-90 to W-12 and y = H-174 to H-96. Nothing important goes bottom right.
3. **Corrupt save is a dead end.** A try/catch around `JSON.parse` is not validation: anything
   that merely parses is truthy, and the crash then happens later, often silently inside a
   click handler.
4. **Two tabs clobber.** A save written wholesale from a boot snapshot erases the other tab.
   Counters ADD, bests MAX, sets union.
5. **Silent failure.** A swallowed write or a missing `onerror` shows the player something
   plausible while the real thing failed. This class has now cost this project two separate days.
6. **Touch targets under 48px** measured as RENDERED px at 375x667, not as declared CSS.
7. **Dashes in player copy.** Hard studio rule; rewrite the sentence rather than swapping the
   character.
8. **An overlay covering a control.** Found four times in one day. Anything that floats gets
   checked against the controls underneath it, not just against the background. Also check
   an overlay's ground is actually opaque: The Attic's was `#0d0b0af5`, an eight digit hex
   whose `f5` is a 96% alpha, which reads as solid in a colour swatch and is not.
9. **A STATED PROMISE THAT IS NOT TRUE.** Read the game's own copy, then go and check the
   code does what it says. This has paid out three times in one day and each was invisible to
   every other check, because nothing was broken: the code did exactly what it was written to
   do, and the sentence describing it was a lie.
   - The Attic: "every rummage turns up an object that has never existed before" — 19.42% were
     exact duplicates.
   - Jumping Jimothy: a comment promising rewards "can never be farmed", while `PROG.decRew`
     was saved and never loaded, so they re-paid every browser session.
   - Burr Blast: Potassium promises "a steadier aim guide" in two places; `predictPath()` does
     not read the loadout at all.
   The technique is cheap and mechanical. Grep the copy for claims, then grep the code for the
   thing the claim depends on. Absence is the finding.
