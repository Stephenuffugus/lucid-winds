# LISTDLE — what to send, and why the last three went nowhere

Free distribution, one friendly human, no money involved. Submit at
**https://listdle.com/submit/** then email conor@listdle.com to say you have,
because he asked to be told and he has 200+ submissions in the queue.

    node scripts/listdle_candidates.mjs        # regenerates the table below

---

## The criterion is PUZZLE. The daily is not the gate.

Conor, refusing Jimothy on 2026-07-24, verbatim:

> "I played it, and I think it's a fun game, but I don't think it fits the
> **puzzle game theme** of Listdle. Even though it has a daily mode, it is more of
> an action game. Please continue to keep me updated with any new games you
> create."

⛔ **This was misread as "needs a daily" and that is why three submissions went
nowhere.** Checked against the live site on 2026-08-18, not the inbox:

```
tally  200 live      hues  200 live
sixfold  403         cosmic-cadets  403         nectar-drop  403         jimothy  403
```
(403 is their generic not-found; a made-up slug returns it too.)

**Tally is live and does not have a daily at all.** It is a numbers puzzle. Hues is
a colour puzzle. The three that never went up are a card duel and two games the
portal itself files under **action**. They were not refused, nobody wrote back
about them, they simply do not fit the theme. Sending more action games with a
daily bolted on will keep producing silence.

⭐ **Send puzzles. A daily helps and is not required.**

---

## Ready to send: ten, all openable

Every one is a puzzle, word, math or card game that a stranger can open today.

| Game | URL |
|---|---|
| Letter Launch | `/satellites/letter-launch/` |
| Tinker Loft | `/satellites/tinker-loft/` |
| OriVex | `/satellites/petalvex/` |
| Loop Warden | `/satellites/loop-warden/` |
| Lamplighter | `/satellites/lamplighter/` |
| Merge & Blast | `/satellites/merge-blast/` |
| Sunforge | `/satellites/ring-stacker/` |
| Line Loom | `/satellites/line-loom/` |
| Season Sway | `/satellites/season-sway/` |
| Meadow Weave | `/satellites/meadow-weave/` |

⛔ **Pace it.** Conor is one person with a 200 deep queue and he prioritised ours
as a favour. Send three or four, not ten, and say plainly they are the puzzle ones.

⛔ **Prove the daily before claiming one.** Any submission that says "the same
board for everyone" has to actually be that. Nectar Drop's copy promised exactly
that and was wrong until 2026-08-18: the board was seeded and one ability on top
of it was not. `scripts/daily_determinism_check.mjs` is how that was proved, and it
was watched failing on the old code first.

---

## ⚖ The best pitch in the catalog is locked

**Parallel is dev-gated**, and it is the strongest thing we could possibly send a
puzzle directory: **100 levels, every one solved by a solver before it ships, and
the par printed on screen IS the solver's own optimum, so matching it is provably
perfect.** That is a sentence a curator who cares about craft actually wants to
read, and it is true.

⛔ A gated game cannot be submitted at all, because the reviewer cannot open it.
**Blackout** is in the same position: procedurally generated murder cases with
exactly one solution and the evidence to prove it, verified over 10,000 cases.

⚖ Ungating either one is Stephen's call. If he wants the single best shot at this
directory, it is Parallel.

---

## Do not send

- **Jimothy.** Already refused, in writing, with a reason. Sending it again is how
  a friendly contact stops being one.
- **Anything the portal files under `action`,** however good the daily is. That is
  the exact reason the last three sank.
- **A gated game.**
