# KEEPSIES — review brief for Fable
**Built:** overnight 2026-09-04, unattended, by Opus.
**Branch:** `add-sproing-jumper`. **Never pushed to main.**
**Ask:** check the work. Do not fix it. Anything you find goes back to Stephen or into the next session.

---

## 1. What to run first

```
cd /workspaces/lucid-winds/satellites/keepsies
node tools/check.js        # 21 gates, about 5 minutes
node test/mutants.js       # 29 mutants, about 4 minutes
```

`check.js` should print **ALL GATES PASSED**. `mutants.js` should print **29 killed, 0 survived**.

`mutants.js` is the one that matters to you. The build rule was "a gate you have not watched fail is
decoration", which was kept by hand all night and is therefore a claim only the builder can vouch for.
The mutant harness makes it re runnable: it breaks one mechanic at a time in a scratch copy and checks
the gate goes red. **It already caught one of the builder's own gates being decorative** (the damage
gate asserted a return value rather than the charge it claimed to be about) and that gate was rewritten.
If a mutant SURVIVES for you, the test is wrong, not the mutant.

To play it: `python3 -m http.server 8777` from the repo root, then
`/satellites/keepsies/index.html`.

---

## 2. Three things need Stephen, not you

They are written in full in `docs/DECISIONS.md` and at the top of the morning report in
`HANDOFF-KEEPSIES.md` §16. Your job on these is to check the MEASUREMENT, not to decide.

1. ⛔⛔ **The Arena's damage floor and The Ring cannot both hold.** DESIGN 9.3 puts a 1.2 m/s floor
   under all damage; DESIGN 9.8 says The Ring reuses the Ringer environment. Measured over 360 AI shots
   at each speed: arriving at 3.6 m/s gives 11.8 damage a hit and 116 percent ring outs a shot;
   arriving at 1.2 m/s gives 21 percent ring outs and **0.0 damage**. There is no speed where The Ring
   is a shattering arena. Underneath it: a 16 mm glass marble is 5.36 GRAMS, so the formula does about
   one damage a hit and a marble takes ten to a hundred clean hits against a target of 8 to 14 turns.
   **Nothing was changed.** `damageScale` is 55 and `damageSpeedFloor` is 1.2 as written. `arena_shape`
   is deliberately NOT a gate, because a gate asserting a window the design cannot reach is a lie.
2. **The Standard Pouch prints 3.6 percent rare and 0.4 percent epic and delivers 10.16 and 2.71**,
   because at that base rate the pity guarantee fires almost every window. Both DESIGN 11 statements
   are honoured at once; the pouch is simply three to seven times more generous than its own table.
3. **"Level N needs 120xN XP" has two readings** and the cumulative one ends the game in 36 wins. Built
   as the cost of one level up, which is 52,200 XP for the whole ladder. One number in tuning changes it.

---

## 3. Where to look hardest

The studio's own scars say a reviewer should not trust a green suite. In order of how likely they are
to be hiding something:

- **`docs/shots/` — 42 screenshots. Open them.** Every visual claim in the ledger was made by opening
  these, and the faults still in them are named in the ledger box rather than fixed. The ones worth your
  eye: `k1-ceremony.png`, `k2-tin.png`, `k2-ransom.png`, `k2-collection.png`, `k1-results.png`, and the
  two deliberate worst angles `k1-lowest.png` and `k1-under.png`. **A green gate is not a look.** Two
  games shipped in this studio with the playfield set to `display:none` and a checker that read an HTML
  comment.
- **Grep for every feature the ledger CLAIMS.** A design doc in this studio once documented a camera
  feature that was simply absent. The ledger is `HANDOFF-KEEPSIES.md` §14, the K0/K1/K2/K3 boxes.
- **`test/playthrough.mjs` is 90 assertions and the biggest gate.** It walks the first four minutes end
  to end. If something is wrong anywhere, it is most likely wrong in there and passing anyway.
- **Assertions that count rather than name.** The studio rule is ASSERT BY NAME NOT BY COUNT. Grep the
  tests for `.length ===` and judge each one.
- **`src/main.js` is 1,581 lines** and is the only file that touches the DOM. It is the least gated
  thing in the build: everything under `src/core/` and `src/meta/` is pure and swept in Node, and
  `main.js` is covered only by the four browser gates.

---

## 4. What was built

7,877 lines under `src/`, 17 gate files, 42 screenshots, 113 dated entries in `docs/DECISIONS.md`.

**K0 done.** Rapier physics at a fixed 1/120 with the floor contact patch written by hand, because
**Rapier hard clamps angular velocity to pi/4 per step** and every bit of spin the design is built
around was being silently discarded. That is the biggest finding of the whole build and it is in
DECISIONS with the measurement.

**K1 done but for pass and play.** Ringer: the Knuckle, calibration, the referee, the AI, sound, the
setup screen with house rules.

**K2 done but for art.** 65 marbles generated from DESIGN's own tables, twelve render recipes, the
collection and turntable, the economy, three pouches with pity, **the keepsies loop** (ante, escrow,
settle, with a gate that SIGKILLs a real process mid match to prove a marble is never in two places or
none), the pot ceremony, the ransom window, progression, and the whole first four minutes of onboarding.
What is left of K2 is the glb lane and eight per epic shaders, which are art.

**K3 started, then blocked** on item 1 above. The damage model, the six programmed actives, the Arena
referee and the mode on a real board are all in and gated.

---

## 5. The fence

The builder was fenced to `satellites/keepsies/**` and the ledger sections of `HANDOFF-KEEPSIES.md`.
Verify it yourself:

```
cd /workspaces/lucid-winds
git diff --name-only 5a7315eb..HEAD | grep -v '^satellites/keepsies/' | grep -v '^HANDOFF-KEEPSIES.md$'
```

That should print nothing across all 28 commits. One near miss is recorded in SESSION STATE: a heredoc
without an absolute path wrote a Keepsies `manifest.json` over the repo root's own, restored from git
inside a minute, and every shell call after that used absolute paths.

---

## 6. The thing nobody has done

**Stephen has not played any of it.** K1.5, his phone playtest, is still unrun, and everything from K1
onward was built on a foundation nobody has touched with a thumb. `docs/checklists/k1.md` is the ten
things to try and the two questions: does the snap feel like a snap, and does the marble weigh anything.

If your review finds one thing worth doing next, it is probably that.
