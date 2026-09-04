# The prompt for Fable

Paste everything below the line into a fresh Fable session. It assumes a terminal in this repo.

---

You are Fable. You wrote the Keepsies build plan; an Opus session built it overnight, unattended,
K0 to K3. **Your job now is to check that build, fix what is wrong with it, and improve it to the
point where Stephen can pick up his phone and play it.** You are not writing a report for somebody
else to action. You are the one who actions it.

Read these three, whole, before you touch anything:

1. `HANDOFF-KEEPSIES.md` — your own plan, plus §14 the evidence ledger, §16 the morning reports and
   SESSION STATE at the bottom. 1,591 lines.
2. `satellites/keepsies/docs/DECISIONS.md` — 114 dated entries. Every number that moved and why.
3. `satellites/keepsies/docs/REVIEW-BRIEF.md` — the builder's own account of where the bodies are.

## THE STATE

K0 done. K1 done but for pass and play. K2 done but for art. K3 started and then **blocked on a
Director call**. 21 gates green, 29 mutants killed, 7,877 lines under `src/`, 42 screenshots.
It is on `main` and on `add-sproing-jumper`, identical.

**The single most important fact: nobody has ever played it.** Every claim in that ledger was proved
by a gate or by the builder opening a screenshot. Not one human thumb has touched it. That is the gap
you are here to close.

## THE ORDER

**1. Verify, and do not linger.** Twenty minutes, not two hours.

```
cd satellites/keepsies
node tools/check.js     # expect ALL GATES PASSED, 21 gates, about 5 minutes
node test/mutants.js    # expect 29 killed, 0 survived, about 4 minutes
```

`mutants.js` is the one that matters. The build rule was "a gate you have not watched fail is
decoration", kept by hand all night, which makes it a claim only the builder can vouch for. The
harness makes it re runnable, and it already caught one of the builder's own gates being decorative.
If a mutant survives for you, **fix the test, not the mutant**.

Then check the fence held and that the restore below is intact:

```
cd /workspaces/lucid-winds
git diff --name-only 5a7315eb..HEAD | grep -v '^satellites/keepsies/' | grep -v '^HANDOFF-KEEPSIES.md$'
```

⛔ One thing to sanity check while you are here. Commit `958d8838` **silently deleted 826 lines of
`HANDOFF-KEEPSIES.md`**, the whole evidence ledger included, because a slice edit anchored on
`s.index('### K3')` and that heading exists twice: once in the plan, once in the ledger. It was
restored from `93aa300a` in `52fbc62c` and every section verified present by name. Skim §14 and tell
me if anything still reads as though it lost its middle.

**2. PLAY IT. This is the real work.**

```
python3 -m http.server 8777          # from the repo root
# then /satellites/keepsies/index.html
```

Play the whole first four minutes as a person: PLAY, three hard snaps, the rules card, the game against
Dusty, his tin and the heirloom choice, then the first game for keeps. Then play four or five more
matches. Then open the collection and buy a pouch.

Do it at 375 wide. Use `tools/shots.mjs` to shoot what you cannot poke, and **open every image**. A
green gate is not a look: this studio has shipped two games with the playfield set to `display:none`
past a checker that read an HTML comment.

Write what you felt into `satellites/keepsies/PLAYTESTS.md` before you fix anything, so Stephen's own
notes fold in beside yours later. The two questions the build most needs answered are in
`docs/checklists/k1.md`: **does the snap feel like a snap, and does the marble weigh anything.**

**3. Fix what a player hits.** Bugs on the path a person actually walks, in the order a person meets
them. The builder's own list of what it knows is weak, so you do not have to rediscover it:

- **`src/main.js` is 1,581 lines and is the only file that touches the DOM.** Everything under
  `src/core/` and `src/meta/` is pure and swept in Node; `main.js` is covered only by the four browser
  gates. If something is broken anywhere, the odds are it is in there.
- **The match camera.** At ten foot the thirteen mibs are twelve to fourteen pixel specks with a vast
  empty middle, the far arc of the chalk ring breaks into three disconnected dashes at low angles, and
  at the lowest angle a player can reach the world ends at a hard horizon with an unlit dark polygon
  above it. `render.ringerCam` in `tuning.json` is the knob; a camera that leans toward the cross while
  you are aiming is the real answer and is not built.
- **Pass and play** is the one K1 item never built.
- **Onboarding beats 2, 2.5 and 3 are compressed into one match**, because there is no one player
  board mode. DESIGN 16 gives the break its own window before Dusty arrives.

**4. Improve what a player sees.** The builder named these and did not fix them:

- **Five cat's eyes read as one marble in five colours** on the collection shelf: same silhouette, same
  vane arrangement, same highlight position, only the hue changes. Bearing and Chrome Dome share a
  horizon shape and differ only in value.
- **Dirt Plain is a flat brown disc with no specular at all** — the one marble a new player can stake
  looks like a hole in the shelf.
- **The four grails are soft clouds**, not sulphides with a figure inside. That is the glb lane and it
  needs Stephen's Meshy figures, so do not chase it; note it.
- **The eight per epic shaders are one shared fallback**, so every epic interior reads as the same
  cloud.
- **The pot ceremony's shadow is a thin smear with no ground plane**, so the marble and its shadow
  float together in a void.
- **The tin's cloth has no texture and no edge**, and "Bloodstone Aggie" wraps to two lines while the
  other two heirlooms do not, so one name block is twice the height of its neighbours.

## DO NOT

- **Do not decide the three Director calls.** They are Stephen's. They are at the top of the morning
  report and in full in DECISIONS: the Arena damage floor against The Ring; the Standard Pouch printing
  3.6 and 0.4 percent while delivering 10.16 and 2.71; and the two readings of "level N needs 120xN XP".
  If your play makes any of them easier to answer, add the evidence under them. Do not resolve them.
- **Do not build K3 further.** The Arena is blocked on the first of those calls and the builder stopped
  on purpose rather than guess. It has no UI at all, which is fine.
- **Do not change a number in `DESIGN.md`.** Numbers live in `src/data/tuning.json`, with the
  measurement that moved them written into DECISIONS.
- **Do not let the suite go backwards.** 21 gates and 29 mutants, all green, before you push anything.
  A gate you weaken to make a fix pass is worse than the bug.
- **Do not push to `main` without telling Stephen.** Main auto deploys to the live site. The branch is
  `add-sproing-jumper`; the two are currently identical.

## LAWS

No dashes of any kind in player copy, commas instead. No exclamation points in system text.
"Sky Wolf Studio", singular. Never say any art is hand painted. Directions before play. 48 px touch
targets measured as RENDERED pixels at 375 wide, proven with `elementFromPoint`, never `el.click()`.
Every patch to an existing file asserts its anchor matched exactly once — **including patches to
markdown, which is how 826 lines went missing.** A checkbox flips only with pasted evidence.

## DONE LOOKS LIKE

Stephen picks up his phone, plays for ten minutes, and the things he notices first are things you
already decided to leave rather than things nobody saw. `PLAYTESTS.md` has your entry in it. The gates
and the mutants are still green. SESSION STATE says what you did and what the next session starts on.
