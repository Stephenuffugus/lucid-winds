# PORTAL CARDS — ready to paste when each game lands

Verified against `portal/index.html` on 2026-08-16 during the build run:

- Satellite cards live in **`FEATURED`** (array opens at line 745), object schema.
  `GAMES` (line 1049) is the NATIVE `/play/` tuple array and is NOT where these go.
- Search aliases live in **`ALIASES`** (~line 1536), keyed on the LOWERCASE DISPLAY NAME.
  Renaming a card without moving its alias key silently orphans the search terms; that
  bug already hit eight games on 2026-07-28.
- Valid `cat:` values in this portal: `action, puzzle, card, board, creative, word, math, party, dice, pattern`.
  Chosen below from that list only.
- No display-name collisions with the existing 114 cards (checked).
- `beta:true` = behind the tester dev gate (`localStorage.sws_dev_ok='1'`), `fresh:true` = New shelf.
  **Recorded default: all five ship `beta:true`** for their first deploy, consistent with the
  Aug 16 builds. No human has played them yet; verification is not playtesting. Stephen flips
  them public whenever he wants.
- Copy below contains NO dash characters of any kind (studio rule).

## Cards (paste into FEATURED)

```js
  {nm:"Deepwell", ds:"Dig deeper for richer ore, then decide when to turn back before the air runs out.", cat:"action", url:"/satellites/deepwell/?v=20260816a", ic:"⛏️", thumb:"/portal-assets/thumbs/deepwell.png", beta:true, fresh:true},
  {nm:"Blackout", ds:"Every case is generated with exactly one answer and the evidence to prove it.", cat:"puzzle", url:"/satellites/blackout/?v=20260816a", ic:"🕯️", thumb:"/portal-assets/thumbs/blackout.png", beta:true, fresh:true},
  {nm:"Parallel", ds:"Two of you share one set of controls and both have to reach the door at once.", cat:"puzzle", url:"/satellites/parallel/?v=20260816a", ic:"🪞", thumb:"/portal-assets/thumbs/parallel.png", beta:true, fresh:true},
  {nm:"Wireworm", ds:"Snake where your trail is live wire and every circuit you finish becomes the maze that kills you.", cat:"action", url:"/satellites/wireworm/?v=20260816a", ic:"🐛", thumb:"/portal-assets/thumbs/wireworm.png", beta:true, fresh:true},
  {nm:"Siege of One", ds:"Set your traps between waves, then get in the lane and fight beside them.", cat:"action", url:"/satellites/siege/?v=20260816a", ic:"🏰", thumb:"/portal-assets/thumbs/siege.png", beta:true, fresh:true},
```

## Aliases (paste into ALIASES, keyed on lowercase display name)

```js
  'deepwell':'mining dig depth push your luck roguelite ore shaft greed spelunky motherload',
  'blackout':'murder mystery deduction detective clue cluedo whodunit logic grid case suspects',
  'parallel':'mirror twin puzzle platformer two characters sync desync grid levels',
  'wireworm':'snake circuit wire electric trail arcade nokia energized',
  'siege of one':'tower defense inverted lane traps waves defender action td',
```

## Per game deploy checklist (repeat for each)

1. `node scripts/handoff11_gates.mjs <id>` clean.
2. `node satellites/<id>/sim.js --test` green, assertion count printed and ≥80.
3. Full-N sweep run in the main loop (never in parallel with another sweep or a browser).
4. `python3 -m http.server 8951` from the REPO ROOT, then:
   `node scripts/handoff11_shoot.mjs <id>` and OPEN the images; name three defects.
   `node scripts/handoff11_tap.mjs <id>` clean at 375x667.
   `node scripts/page_health.mjs --all` (picks the new satellite up automatically).
   `node scripts/sw_purge_audit.js` after the sw.js lands.
5. Thumb: screenshot the real game at a good moment, square, PNG ≤150KB, into `portal-assets/thumbs/<id>.png`.
6. Paste the card and alias above; bump `?v=` if redeploying the same day (20260816a, then b, c).
7. Commit, push branch, then deploy with `git push origin add-sproing-jumper:main`.
8. Verify live: `curl -s "https://lucidwinds.com/satellites/<id>/?probe=$RANDOM" | grep -c "<a NEW content marker>"`.
   A 200 is not evidence. Grep for a string that only exists in this build.
