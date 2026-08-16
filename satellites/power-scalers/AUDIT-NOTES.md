# POWER SCALERS — audit, 2026-08-16

Carded on the arcade's "Made by the studio" shelf, so it is presented as
representative of what this studio makes. This is the audit list as it stood
BEFORE any change, then what was done about it.

Verified in node against the real shipping script (`test/harness.mjs` loads the
game body out of `index.html` into a vm sandbox — no hand-mirrored copy of the
combat maths, which is how the rarity simulator drifted twice on this project).
No browser was opened; every number below came from running the shipping code.

## Verdict

It earns the slot on craft and loses it on pacing. The systems are real and
deep: 10 races, 22 powers, 27 support gems on a 7-tier rarity ladder, a
105-node skill web with keystones that carry genuine downsides, 5 ascendancies,
graded jewels, a 12-rung authored ladder, tournaments, alliances. Almost none
of it is a stub. What it did not have was a playable first twenty minutes: the
ladder handed out two free wins and then a wall, and the fights it walls you
with are over in two rounds.

Fixed below. After the fixes it is a flagship. Before them it was a systems
showcase you bounced off in four minutes.

## Audit list (worst first)

**P1 — the ladder was a cliff, not a curve.** Fresh level-1 character win rate,
300 sims per rung, against the shipping enemies:

| rung | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| win % | 100 | 99 | 31 | 6 | 7.5 | 1 | 0.5 | 1 | 0 | 0 | 0 | 0 |

Two free wins, then a wall. Worse, those two wins paid 159 XP and level 2 cost
170, so **clearing the first two rungs did not level you once**. An auto-player
that fights the ladder honestly needed ~3000 fights to clear it and failed to
clear it at all in half of the runs.

**P2 — fights lasted 2 to 6 rounds.** The marquee content of an auto-battler is
the log, and the log had nothing to say. The last four rungs resolved in 1.5 to
2.9 rounds: the player lost before a line of it could be read. Damage-over-time
gems, regeneration, revives and staggers were all buying turns in a fight that
did not have turns.

**P3 — one corrupt character silently deleted the whole roster.** `migrateOC`
dereferences `oc.level` with no guard, so a single `null` or garbage entry threw
out of `loadState`'s `.map`, `boot()`'s catch swallowed it, and the player got
an empty roster with no explanation. Watched throw in `probe_state.mjs`.

**P4 — two open tabs clobbered each other.** `persist()` wrote the whole state
blob, so the second tab's stale snapshot erased characters created in the first
(fleet rule: counters ADD, bests MAX, never write wholesale).

**P5 — the Training Montage broke the economy.** Flat 55 Glory for 70% of a
level, at every level, while XP need scales with level^1.5. At level 30 one
arena win bought two levels. Levelling, and therefore the entire skill web,
bought itself out.

**P6 — the embed handshake was gated on `?embed=1` and posted once.** The
contract wants `{sws:'ready'}` at parse AND on load, on every page load. If this
card ever moves to a framed url the recovery timer reads the silence as a black
screen and closes the game. (The other half of that fleet defect is clean here:
the exit is an unconditional 48px ✕ in the topbar with the `document.referrer`
fallback, not a `window.parent !== window` gate.)

**P7 — toasts rendered under the global feedback fab.** `.toast-wrap` sat at
`bottom:96px`, centred, up to 88vw wide; the fab owns x = W-90..W-12,
y = H-174..H-96 at an unbeatable z-index. On a 375px phone every "Not enough
Glory" had its right end covered.

**P8 — the delete button was 24x24.** A destructive action at half the required
48px rendered target. The Aether steppers three lines away already use the
`::before{inset:-13px}` hit-slop trick; delete never got it.

**P9 — modals closed only by tapping the backdrop.** The augment and jewel
pickers are 80vh bottom sheets with no close control. Not a hard trap, but the
way out was a guess.

**P10 — the home screen did not say what to do first.** The hero led with
"Path-of-Exile-style skill web", a genre reference that means nothing to most of
this arcade's traffic, and the only route to the single-player content was an
unlabelled nav icon. A first-timer with one character cannot Battle (needs two)
and cannot enter a Tournament (needs four), so the two buttons on screen were
both dead ends.

## What was changed

1. **Gauntlet progression retuned (P1).** First clears now pay against the
   champion's own next level (`xpNeeded(level+1) * 1.15 + 40`) instead of a flat
   authored number, so a clear is always worth about a level wherever you are on
   the ladder. Replays and losses pay a fraction of the same scale, multiplied
   by a staleness factor `(rung+1)/(cleared+1)` so farming rung 1 forever pays
   almost nothing while retrying the rung you are stuck on still moves you.
   Glory follows the same shape. Nothing about the enemies changed; the ladder
   is the same fight, the character arriving at it is now the right size.
2. **Health pools raised (P2)** from `180 + dur*3.5 + sta*3.0` to
   `300 + dur*6 + sta*5`, measured not guessed: median fight length went from
   4 rounds to 9, and the relative win rates across the whole ladder moved by
   under 4 points, so the retune lengthens fights without re-deciding who wins.
3. **Per-character save repair (P3).** Roster entries are migrated one at a
   time inside a try/catch; a character that cannot be repaired is dropped and
   the rest of the roster lives. `migrateOC` now hard-guards `baseStats`,
   `powers`, `name`, `id`, `emoji` and an unknown race, so a half-written save
   loses one fighter instead of all of them.
4. **Merge-on-write persistence (P4).** `persist()` re-reads the stored blob and
   merges: roster and alliances union by id (newest wins per id), Glory takes the
   MAX, gauntlet progress takes the MAX, gem and jewel grades take the higher
   rarity. Two tabs can now both be open without either erasing the other.
5. **Montage cost scales (P5)**: `40 + level * 9` Glory, so buying a level always
   costs about a fight's winnings instead of small change.
6. **Embed handshake fixed (P6):** framed detection is `window.parent !== window`
   in a try/catch OR the `?embed=1` flag, and `ready` is posted at parse time and
   again on `load`, per PORTAL-CONTRACT.md.
7. **Toasts moved above the fab (P7):** `bottom:186px`.
8. **Delete button given a 48px tap target (P8)** with the same hit-slop
   pseudo-element pattern already used by the steppers; the glyph stays 24px.
9. **Every modal gets a close control (P9).**
10. **Home screen rewritten to a first move (P10):** the hero now names the
    Gauntlet as the place to start, the Gauntlet button is on the hero for
    everyone, and Battle/Tournament say what they need instead of vanishing.

## Checks

- `test/harness.mjs` — loads the real script; throws if the script cannot be
  found or comes back short, so it cannot silently test nothing.
- `test/probe_state.mjs` — 12 save/load assertions: fresh install, round trip,
  garbage blob, wrong-typed roster, one null character, a character with no
  stats, and the two-tab clobber. Watched fail (the null-character case threw a
  TypeError out of `loadState`, and the two-tab case lost the character).
- `test/probe_balance.mjs` — the difficulty table above and an auto-player that
  climbs the whole ladder; prints fights-to-clear and end level per race.
- `test/probe_ui.mjs` — static assertions over `index.html`: no dash characters
  in player-facing copy, no fixed element inside the feedback fab's footprint,
  every interactive control at 48px, the embed handshake posted twice, exit not
  gated on `window.parent`, and every modal carrying a close control.

Run all three from `test/`: `node probe_state.mjs && node probe_ui.mjs &&
node probe_balance.mjs`.

## Still open (deliberately not touched)

- **The Arena pays the same whoever wins**, because both fighters are yours.
  There is no reason to pick a fair fight over farming your strongest against
  your weakest. A real fix is a Glory bonus for beating a higher-graded
  opponent; that is an economy call, not a bug fix.
- **`window.storage` is tried before `localStorage`** in the Store. That is the
  artifact-host API, which persists nothing in a browser. Harmless today because
  no browser defines it, but it is a live trapdoor if anything ever does.
- **Alliances are cosmetic.** They group characters and colour a badge; no
  mechanic reads them. Either give them a team mode or say so in the copy.
- **The tournament ignores roster order and seeding entirely** and only ever
  runs 4 or 8, so with 5, 6 or 7 characters some of your roster silently never
  plays.
