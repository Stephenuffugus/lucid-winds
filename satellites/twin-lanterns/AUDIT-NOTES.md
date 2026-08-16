# TWIN LANTERNS — audit, 2026-08-16

v0.1, dev gated behind `/dev-gate.js`, not on the portal. Phase 2 was recorded
as blocked on Firestore rules. 458 lines.

Verified in node against the real script (`test/probe_puzzle.mjs` splices an
export into the shipping IIFE and runs the real generator and scorer). No
browser was opened.

## What it actually is

**Not a prototype.** This is a finished small game. The loop runs start to
finish with no stubs and no dead ends: title, rules gate, name the pair, hand
the phone over, gift a stone, hand over, gift and mark, hand back, mark, reveal,
share card, streak. One puzzle a night, date-seeded, the same garden for
everyone, generated from two independent PRNG streams with no `Math.random`
anywhere in the logic. The paths it generates are legal: 400 consecutive days
checked, every one a contiguous non-revisiting four-direction walk that reaches
the far lantern. The scorer is correct and cannot be cheesed by flooding the
grid. It is careful work: the lantern glyph is drawn SVG rather than an emoji
precisely because emoji lanterns render as tofu on some devices.

So the honest framing is not "an unfinished shell". It is a complete game with
two problems, one of them fatal, neither of them the one on record.

## The fatal problem: the puzzle is often not solvable

`test/probe_puzzle.mjs` includes a solver that knows exactly what a player knows
(its own rows, the single gifted stone, both lanterns) and marks a hidden cell
only when **every** legal completion of the path runs through it. That is the
best any reasoning player can do without guessing.

Over 60 consecutive nights, that perfect deducer:

- lit the path (2 errors or fewer) on **34 of 60 nights**
- was perfect on **6 of 60**
- had a worst night of **8 unprovable cells**

On roughly two nights in five the pair cannot deduce their way to a lit path.
They must guess, and a wrong guess breaks the streak — and the streak is the
only reason to come back tomorrow. A daily puzzle whose central promise is
"neither of you can light the way alone" cannot ask the pair to flip a coin for
it. Nothing about the presentation says a guess is expected, so the failure
reads as unfair rather than as risk.

This is a generator problem, not a tuning problem. The walk is generated freely
and the halves are dealt out afterwards, with nothing checking that the hidden
half is forced by the visible half plus the two gifts. The fix is to close that
loop: generate, run the deduction check, and regenerate until the night is
solvable (or until the ambiguity is down to one or two cells, if some risk is
wanted by design). The enumeration in the probe is the check; it is fast enough
to run in the browser on a 6x6 grid. That is a real session of work, not a patch,
which is why it was not done here.

## The second problem: nobody can play it

It needs two people, in the same room, with one phone, every night. A solo
visitor to the arcade cannot play it at all; there is no solo mode and no way to
make one that preserves the idea. That is a narrow occasion for a portal whose
traffic is one person on a phone.

## Phase 2 is not blocked on what the handoff says it is

The handoff records phase 2 (async by link) as waiting on Firestore rules for a
`pairs/{pairId}` collection. **It does not need a server at all.** The puzzle is
a pure function of the date, so both phones already generate a bit-identical
garden with no coordination. All that has to travel between them is one gifted
cell and a handful of marks: about twenty bits, which fits in a URL fragment.
The whole async edition is a link you text your partner. Anonymous auth,
Firestore rules, pair documents and a server-authoritative sunbeam function are
all avoidable.

That matters because the recorded blocker is somebody else's deploy, which is
the kind of blocker a project sits behind for months. The real blocker was the
puzzle being under-determined, and that one is ours.

## Recommendation: PARK, with the blocker corrected

Not cut. The idea is good, the craft is real, and the two things wrong with it
are both fixable without a backend. Cutting it would throw away a working
generator, a working scorer and a genuinely elegant central mechanic.

Not finish now either. Finishing means the solvability loop plus the share link
flow, and shipping it half-done would put a puzzle on the portal that breaks its
own streak two nights in five. Doing that behind the dev gate is fine. Doing it
on a card is not.

So: park it properly, which means the note in memory should now read

> **Twin Lanterns, parked.** Complete couch game, dev gated, off the portal.
> Blocked on TWO of our own things, not on Firestore: (1) the generator does not
> guarantee the hidden half is deducible, measured at 34/60 nights solvable by a
> perfect deducer, and (2) it needs a second person in the room. Both are fixed
> in one session: add a solvability gate to `genPuzzle`, and ship the async
> edition as a share link (the puzzle is date-seeded, so no server is needed).

and NOT "waiting on Stephen to deploy Firestore rules", which is not true and
which parks it forever.

## Audit list, and what was fixed now

**T1 — the puzzle is often unsolvable.** Above. Not fixed; it is a session of
work and a design call about how much risk the night should carry.

**T2 — the Play button went dead after the night was played.** `b-play` called
`refreshTitle()` and returned, so the one gold button on the screen did nothing
at all, with a subtitle that had already said what it was going to say. Same
dead end on the rules screen's "We are ready". **Fixed:** both now reopen
tonight's finished board. The result board and the share card survive a reload,
because `lastResult` stores the marks and gifts as well as the error count.

**T3 — the save was untrusted input, and a wrong-shaped one wrote NaN.** `ST`
came straight out of `JSON.parse` with no validation. A blob that parsed but had
no `streak` made the first `ST.streak++` produce `NaN`, which then persisted, so
the pair's streak line read "pair streak NaN" from then on. **Fixed:** every
field is sanitized on load, and `best` can never be below `streak`.

**T4 — two tabs clobbered each other** (the fleet rule: counters ADD, bests
MAX). `save()` wrote the whole object. **Fixed:** `save()` re-reads and merges;
`best` and `lastDay` take the max, and a tab holding an older night cannot walk
a newer streak backwards.

**T5 — the embed handshake was gated on `?embed=1` and posted once.** Identical
to the defect in Power Scalers. The portal frames `/play/` and github.io urls
without that flag, and silence is read as a black screen. **Fixed:** framed
detection is `window.parent !== window` in a try/catch, and `ready` is posted at
parse time and again on `load`. The exit already had the `document.referrer`
fallback and is a full-width button on the title screen, so that half of the
fleet defect was clean.

**T6 — no dash characters in player copy.** Checked; clean.

**T7 — the feedback fab is not mounted on this page at all,** so nothing of ours
sits under it. Worth noting for whoever ships it: the buttons are centred at
320px wide, which on a 375px phone reaches x=347, and the fab owns x=285..363
in a band 96 to 174px off the bottom. The play screen's Done button lands in
that band on a 6x6 night. If `/feedback.js` is ever added here, Done must move
or narrow.

**T8 — touch targets** are 56px buttons and 56px grid cells. Clean.

**T9 — `shape()` reads `new Date().getDay()` instead of the `day` it is passed,**
so the generator is only pure by accident: ask it for tomorrow and you get
today's grid shape with tomorrow's path. Harmless today because nothing asks for
another day. It becomes a real bug the moment the share link carries a day
number, which is exactly the phase 2 design above. Left alone deliberately: it
should be fixed together with that work, not in isolation.

## Checks

`test/probe_puzzle.mjs` — 10 assertions: determinism, day-to-day variety, no
`Math.random` in the logic, path legality over 400 days, the deduction solver
above, and two scorer sanity checks. Two of them fail today, on purpose: they
are the measurement of T1 and they should stay red until the generator gates on
solvability. Everything else passes.

Run: `cd test && node probe_puzzle.mjs`
