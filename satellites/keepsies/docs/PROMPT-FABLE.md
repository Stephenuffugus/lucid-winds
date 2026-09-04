# The prompt to paste into Fable's session

Everything below the line. It assumes a fresh terminal in this repo on `main`.

---

You are reviewing an overnight build. Do not fix anything: report.

Read `/workspaces/lucid-winds/satellites/keepsies/docs/REVIEW-BRIEF.md` first, then work
through it. The work is on `main` and also on `add-sproing-jumper`; the two are identical
at `283ab809`.

Run both of these before you read a single line of source:

```
cd /workspaces/lucid-winds/satellites/keepsies
node tools/check.js     # expect ALL GATES PASSED (21 gates, about 5 minutes)
node test/mutants.js    # expect 29 killed, 0 survived (about 4 minutes)
```

Then do the four things a green suite cannot do for you.

**1. Open the 42 screenshots in `docs/shots/` and name what is wrong in them.** Every visual
claim in the ledger was made by opening these, and the faults still in them are named in the
ledger rather than fixed, so check the builder named the right ones and did not miss worse.
Start with `k1-ceremony`, `k2-tin`, `k2-ransom`, `k2-collection`, `k1-results`, and the two
deliberate worst angles `k1-lowest` and `k1-under`. A green gate is not a look: this studio
has shipped two games with the playfield set to `display:none` past a checker that read an
HTML comment.

**2. Grep for every feature the ledger claims.** The ledger is `HANDOFF-KEEPSIES.md` section
14, the K0/K1/K2/K3 boxes. This studio has shipped a design doc that documented a camera
feature which was simply absent from the code.

**3. Judge the assertions, not the pass.** `test/playthrough.mjs` is 90 assertions and the
biggest gate. Grep every test for `.length ===` and decide whether each one asserts by name
or merely by count, because the studio rule is ASSERT BY NAME NOT BY COUNT. And
`src/main.js` is 1,581 lines, the only file touching the DOM, and the least gated thing in
the build: everything under `src/core/` and `src/meta/` is pure and swept in Node, and
`main.js` is covered only by the four browser gates.

**4. Verify the fence yourself.**

```
cd /workspaces/lucid-winds
git diff --name-only 5a7315eb..HEAD | grep -v '^satellites/keepsies/' | grep -v '^HANDOFF-KEEPSIES.md$'
```

That must print nothing across all 29 of the builder's commits. `HANDOFF-SEP02.md` also
differs from the old main, but that is your own lane note from `5a7315eb`, not the builder's.

**Three things are Stephen's calls, not yours.** Check the measurement behind each and say
whether the builder framed it honestly or overstated it. They are at the top of the morning
report in `HANDOFF-KEEPSIES.md` section 16 and in full in `docs/DECISIONS.md`:

- the Arena damage floor against The Ring (the builder says they cannot both hold, measured
  over 360 shots at each of three speeds)
- the Standard Pouch printing 3.6 and 0.4 percent while delivering 10.16 and 2.71
- the two readings of "level N needs 120xN XP", one of which ends the game in 36 wins

Report as: what holds, what drifts from its claim, what is outright false, and the single
thing you would look at hardest if you had one more hour.
