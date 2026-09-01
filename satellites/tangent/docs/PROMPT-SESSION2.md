# TANGENT session 2 prompt (Opus). Written by Fable 2026-09-01, issued by Stephen.

You are the builder on TANGENT, a single file HTML5 game at `satellites/tangent/index.html` in `/workspaces/lucid-winds`, branch `add-sproing-jumper`. Fable reviewed your 28 commit session and found that its central result does not hold. This session you repair that, harden the tests that let it through, card the game in the arcade as **in development**, and deploy it so Stephen can play it on his phone tonight. He decides when it is playable. You have about two hours of build time plus the deploy. Nothing you do here is half done: every task below ends in a commit that leaves the suites green, so the session can be cut at any task boundary and still ship.

## 0. Read first, in this order, before any edit
1. `HANDOFF-TANGENT.md`, the section **"FABLE REVIEW of the 2026-09-01 build"** at the bottom. Every task below comes from it. Read the whole section twice.
2. `HANDOFF-TANGENT.md` sections 0 (rules of engagement) and 5 (decision rights). They still apply, with one change in section 6 below.
3. `satellites/tangent/docs/BUILD-HANDOFF.md` Part II, D1 to D12. Binding. D2 (the drawn line is the run) and D4 (release is unconditional forever) are the ones this session touches.
4. `satellites/tangent/test/solve.js`, `test/parts.js`, `test/smoke.js` groups [4], [7], [10], [16], `test/harness.js`. You will be changing all of them.
5. `portal/index.html` lines 995 to 1030 (the FEATURED cards, look at Ripcord and Aura Off), `scripts/catalog.mjs`, `DONE-LEDGER.md` top 40 lines, and `satellites/ripcord/index.html` lines 8203 to 8235 (the Sky Wolf embed protocol, which you will copy).

## 1. Rules of engagement (unchanged unless stated)
- **File fence**: `satellites/tangent/**`, `HANDOFF-TANGENT.md`, and for the carding step ONLY the FEATURED array in `portal/index.html` plus one new file `portal-assets/thumbs/tangent.png`. Nothing else. Not `satellites/conduit/` (another builder is in this same working tree right now and has uncommitted work there; you will see it in `git status`; never stage it, never stash it, never reset it).
- **Staging**: `git add` explicit paths only. Never `-A`, never `.`.
- **Rebase**: `git pull --rebase` will refuse while the other builder's unstaged work exists. That is fine. Commit your fenced paths and `git push origin add-sproing-jumper`. If the push is rejected as non fast forward, do NOT rebase in this tree; use a worktree (`git worktree add /tmp/tangent-wt origin/add-sproing-jumper`, cherry-pick your commits there, push from there, then `git worktree remove` it). Same technique as the deploy in section 6.
- **Every commit**: `node test/smoke.js && node test/parts.js && node test/sweep.js` green from `satellites/tangent/`. `node test/solve.js` before any commit that touches a level, a part, a constant, or the solver. `node test/ui.js` before the carding commit and before the deploy.
- **Every new or changed check**: break it on purpose against a mutated copy (`TANGENT_HTML=/path/to/mutant.html node test/<suite>.js`), watch it go red, revert, and paste the exact red line into the evidence ledger. A gate you have not watched fail is decoration. Fable's review found that ten of your checks were, and you found two yourself.
- **Copy**: no dashes in player facing text. Brand is "Sky Wolf Studio", singular. Never claim any art is hand painted.
- **One change per commit**, named for what it does, and the SESSION STATE section of `HANDOFF-TANGENT.md` updated at the end.

## 2. What was wrong, in one paragraph
"Around the heavy" (system 4) is clearable with an empty deck: hold about ten seconds, let go, the ball spirals inward across the moved gate at about twelve seconds, hold again briefly, release. `parts.js` sweeps hold only releases and `solve.js` never tries hold then coast, so both provers were blind in the same place. The "one way drift" law is only true while the deck is accelerating; coasting puts the ball ahead of the deck. The "vane opens 66 to 79 units" figure was measured against a hold only baseline; against bare hold then coast programs two vanes open under half a unit. Check [16]'s bumper case starts the ball inside a bumper. The vane is the opposite sense of the doc's counter rotating ring. Separately: the orange held track in the build phase is not the held run (`trackFor` starts the throttle at 1, a live run starts at `TH_FLOOR`), the once only tutorial retirement has no guard in any suite because the harness stubs the frame loop, and four smoke checks are vacuous or weak. Full evidence and numbers are in the review section.

## 3. The work, in order. Each is one commit. Stop at the two hour mark and go to section 5 with whatever is green.

### R1. Fix the provers, and watch system 4 flip
- `solve.js` PROGRAMS: add `hold t then coast` for t = 0.5 to 12 s in 0.25 s steps, and `hold t, coast u, hold` for t in {1..10 step 1} and u in {0.5..6 step 0.5}. Keep the existing six.
- `solve.js` search: do not `break` on the first landing set. Search every set, then report the set with the fewest parts as "cheapest", and the count of clearing sets. The current "cheapest" column is first found and the review names it as such.
- `parts.js`: delete `bareSweep`. Import the solver's bare search (export it from solve.js, or move the shared search into `test/search.js` that both require) and use it for the `needsParts` contract.
- **New contract** for any system marked `needsParts`, enforced in parts.js: the bare deck's total clear window (sum of release time windows across all bare programs, 0.05 s sampling) is under 0.3 s, AND the best parts assisted total clear window is over 1.0 s. Print both numbers per system.
- **Evidence you must produce before touching anything else**: run the new parts.js against the CURRENT index.html and paste the red line where "Around the heavy" fails its contract (it must report a bare clear near hold 9.75 to 10 s). That red line is the proof the provers are fixed. If it stays green, your program set is still too narrow; the review's probe found it with `hold 10.0 s, coast, hold again from 11.93 s`.

### R2. Restore system 4, keep the vane, tell the truth
- LEVELS[3]: gate back to `{r:70,a:-1.15,w:28}`, remove `needsParts`, delete the comment that states the one way law. Keep `vane` in `PARTS` and `TOOLS`.
- COACH.build copy: replace with something true and short, for example: "Hold and the ball walks one way round the deck. Let it ride and it walks the other. A Vane pushes it ahead of the deck where you place it." Keep it under 140 characters, no dashes. The build beat stays wired but only fires on a system that passes the R1 contract, so today it fires nowhere; that is correct.
- smoke [16]: rewrite as three true statements, each watched red first: (a) a bare deck under hold never leads the surface; (b) a bare deck coasting from a held spin does lead it (the review measured lead 48.9 after a 4 s hold); (c) a vane produces sustained lead inside its zone while holding, where a bumper placed on the held track produces a single strike and then decays. Place the bumpers on the held track for (c), not at (30,0) where the ball starts inside them.
- sweep.js: the table will change because the gate moved back; the old baseline table in HANDOFF section 2 (Around the heavy 5 lands, 8 crashes) is the number it should return to. Paste the new table.
- Ledger: strike the paragraph "THE DECK NOW BINDS" with a one line note pointing at the review, do not delete it. History is evidence.

### R3. The held ghost is the held run
- `trackFor`: start `throttle` at `TH_FLOOR`, not `th`. One token at the `s={...throttle:th...}` line.
- New smoke check: with two parts placed, sample the held ghost and a live held run at the same step indices and assert every point within 0.5 units; same for the idle ghost against a live coast. Watch it red against the current build first (the review measured 15.7 units at t 3.5 s).

### R4. The once only tutorial gets a guard
- Move `everHeld=true; coachDone("hold")` and the gate `coachDone("gate")` from `frame()` into `step()` where the sim events happen (the spin branch, after `advanceDeck` and after `checkGates`). Behaviour is identical in the browser; the headless harness can now see them.
- New smoke checks that go red against each of these mutants, each watched: `coachDone` as a no op; `init` setting `coachSeen={}` instead of reading `tutor` from the profile; the hold and gate `coachDone` calls deleted. Paste the three red lines.

### R5. The four weak checks
- [4] LEVELS immutability: assert `sys !== lv.bodies` and `sys[i] !== lv.bodies[i]` and `sys[i].other !== lv.bodies[i].other`, and exercise a level whose non hole body is off the horizon (Two minds, Vex). Watch it red against `sys = lv.bodies`.
- [2] "outcome is a known class": delete the `|| r.outcome != null` clause and correct the list to `land, crash, lost, failed`. Watch it red against `lastOutcome="banana"`. "No NaN": do not skip when ball is null; assert on the last recorded flight trail point instead.
- [7] two tab merge: interleave the other tab's write between `readSave` and the write (wrap the store's `getItem` to inject once). Each of these single mutants must go red on its own: recordResult without max; mergeSave without re read; mergeSave without max or OR; the medal overwritten each pass.
- [10] taught strategy bot: `startSpin` must reset `lastOutcome=null`; the check must report which system stopped it and require reaching system 4 now that system 4 is bare clearable again.

### R6. Deck mass in the balance rule (Director call 6, built so he can tune it)
- `const M_DECK=6;` and in `imbalance()` return `len(mx,my)/(M_DECK+m)/DECK_R` (centre of mass of parts plus a deck mass at the origin). With 6, a single rim bumper reads 0.23, a rim rail 0.31, a hub part 0.04, and opposite pairs still cancel. The first part a player places no longer fails balance unless it is a long rail at the rim.
- New smoke check: a single bumper at r 93 passes tol 0.26 with M_DECK 6 and fails with M_DECK 0. Re run `solve.js` and paste the table; nothing should become unsolvable, but any change is evidence.

### R7. The entry bearing marker
- In `drawPrediction`, when `pr.outcome==="invert"`, draw a small marker on the hole's horizon ring at the point where the predicted path ends, and a faint outward tick, because D8 says the ball re emerges at that bearing heading outward. The far side is never predicted, and must not be; the marker turns it into a bearing puzzle the player can plan.
- ui.js check: on Inside out, hold 1.8 s, and assert the marker exists at the horizon in the rendered frame (elementFromPoint is not applicable to canvas; sample the pixel at the computed screen point and assert it differs from the same pixel with the marker disabled via a mutant).

## 4. Do not
- Do not author T4 systems. Do not change `TH_FLOOR`, `OMEGA_MAX`, `VANE_PUSH`, scoring, medals, or the inversion bonus. All of those are Stephen's calls after he plays.
- Do not add a service worker. Do not touch any other satellite or the root game.
- Do not push `add-sproing-jumper` to `main` in any form. The branch head carries un reviewed Ripcord battle3d and Conduit commits; pushing it deploys them. The deploy method in section 6 is the only one authorised.

## 5. Card it in the arcade as in development
- Thumb: `portal-assets/thumbs/tangent.png`, 512 by 512, under 150 KB, a procedural ferro render exported from the game's own canvas the way the manifest icon was made (the deck, the ball with its rim, one body). No house frame baked in, no button slabs, no text. Look at it with the Read tool before you commit it and name three faults.
- Card: one entry in the FEATURED array in `portal/index.html`, next to Ripcord, exactly this shape: `{nm:"Tangent", ds:"Spin a dish, let go on the tangent, and land in a small gravity system that a black hole can turn inside out.", cat:"action", url:"/satellites/tangent/?v=20260901a", ic:"🎯", thumb:"/portal-assets/thumbs/tangent.png", beta:true, fresh:true}`. `beta:true` is the in development gate; it stays until Stephen says playable. No dashes in the copy. Bump the `?v=` whenever the game file changes after this.
- Embed protocol: copy the Sky Wolf Studio embed block from `satellites/ripcord/index.html` lines 8203 to 8235 into the end of `satellites/tangent/index.html`, minus the service worker branch. Add an exit control that calls `SWS_EXIT()`: a "Sky Wolf Studio Arcade" button in the settings sheet is enough. Rules from that block: never `history.back()`, every in game back is an internal screen switch, only the explicit exit posts `sws:'close'`, and `sws:'ready'` is posted on load when framed. ui.js check: load with `?embed=1` inside an iframe in the probe page and assert the ready message arrives.
- Counts: run `node scripts/catalog.mjs` and `node scripts/advertised_count_check.mjs`. A beta card does not change "A VISITOR CAN OPEN" (161 today); if either script complains, you changed something you should not have.
- Version: every asset the game loads must be versioned or inline (today it is one HTML file plus manifest.json; the manifest link is attached at runtime with a version query, keep it that way).

## 6. Deploy, authorised by Stephen for this session, tangent only
Hostinger deploys `main`. The branch head must not go to main (section 4). Use a worktree so the shared working tree and the other builder are never touched:
```
git fetch origin
git worktree add /tmp/tangent-deploy origin/main
cd /tmp/tangent-deploy
git checkout origin/add-sproing-jumper -- satellites/tangent HANDOFF-TANGENT.md portal-assets/thumbs/tangent.png
git checkout origin/add-sproing-jumper -- portal/index.html   # then git diff --stat: the ONLY portal change must be the one FEATURED line; if anything else differs, revert portal/index.html and apply the one line by hand
git add satellites/tangent HANDOFF-TANGENT.md portal-assets/thumbs/tangent.png portal/index.html
git commit -m "tangent: card as in development and deploy the reviewed build"
git push origin HEAD:main
git worktree remove /tmp/tangent-deploy
```
Then prove it is live, and a 200 is not proof:
- `curl -s "https://lucidwinds.com/satellites/tangent/?v=20260901a&probe=$RANDOM" | grep -c "<a marker string that exists ONLY in this build>"` must print 1. Pick the marker before you deploy (the R2 coaching sentence is a good one) and grep for it. Same for the portal: `curl -s "https://lucidwinds.com/portal/?probe=$RANDOM" | grep -c 'thumbs/tangent.png'` must print 1.
- Then open it in headless Chromium at 390x780 from the live URL, take one screenshot of the build phase and one of the portal card, Read both, and paste the paths.
- If the host serves a stale file, wait 60 s and probe again with a new random; do not add cache headers, do not add a service worker, do not touch `.htaccess`.

## 7. Close the session
- SESSION STATE in `HANDOFF-TANGENT.md`: which of R1 to R7 shipped with their red lines, the new sweep and solve tables, the live URL, the marker you grepped, and the shots.
- A message for Stephen, ten lines at most: the URL, that the card is in development until he says otherwise, and the five things to try on the phone in order: system 1 hold and release; system 2 the gate; system 4 as restored; a vane placed anywhere on system 8 to see what it does to the tracks; Inside out to see the entry marker and the far side. Under each, the one question the review left him on that system.
- Push the branch. Then stop.

## 8. Evidence format
For every task: the commit hash, the suites' counts after it, and for every new or changed check the exact red line from the mutant run. Numbers, not adjectives. If a task could not be finished, say which step failed and paste the failure; do not describe it.
