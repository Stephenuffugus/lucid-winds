# FLEET AUDIT COVERAGE — living tracker

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

## WAVE 4 IN FLIGHT (round three's standing defect list is now the brief)

burr-blast · garden-td · slice-3d · sproing · moon-claw · skyshot · budburst · pong ·
petal-plunge · greenhouse-pinball · burrow-bowl · rule-root · flipbook · seed-flutter ·
pollen-panic · shell-shuffle · bubblenaut

## NOT YET TOUCHED — largest first

These are the next waves. Line counts are a rough proxy for how much game is in there.

```
burr-blast          3109      pollen-panic        1081
garden-td           2580      shell-shuffle       1020
slice-3d            2467      bubblenaut          1012
sproing             2011      ...and 35 more under 1000 lines
moon-claw           1673
budburst            1672
pong                1597
petal-plunge        1596
flatulence-fighter  1560
skyshot             1463
greenhouse-pinball  1458
burrow-bowl         1360
rule-root           1280
flipbook            1277
seed-flutter        1170
```

Five of these (burr-blast, garden-td, budburst, shell-shuffle, pollen-panic) are on the feedback
fab overlap list, so the root fix in `feedback.js` should clear that specific defect for them
without a per game edit.

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
   checked against the controls underneath it, not just against the background.
