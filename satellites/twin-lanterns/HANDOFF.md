# Twin Lanterns, v0.1 couch edition

The Daily Duo (WHACKBOX_PLAN.md catalogue pick 1, 44/50). Two players, one
phone, one nightly puzzle. This v0 is the pass-the-phone edition; the
async-by-link cloud edition is phase 2 and rides on Firestore.

## Files
- `index.html` (everything inline, no assets)

## The puzzle
A contiguous 4-direction path of glowing stones crosses a night garden grid
between two lantern endpoints. Player one's lantern lights the even rows,
player two's the odd rows. Each player gifts exactly one of their stones to
the partner (choosing which is the strategy), then marks where they believe
the path crosses the rows they cannot see. Score is combined: the pair
lights the path with 2 or fewer total errors; 0 errors is a perfect night.
Gifted stones count as revealed knowledge, never as misses.

Procedural and date-seeded: everyone on Earth gets the same garden each
night. Two independent PRNG streams (path walk / everything else) per the
two-stream rule. Hand-authored curve in `shape()`: weekdays 5x5 path 9,
Wednesday 6x5 path 11, weekends 6x6 path 13.

## Flow
title -> how (rules gate, always) -> hand-to screen -> P1 gift -> hand ->
P2 gift then mark -> hand -> P1 mark -> reveal. The hand-to screen is the
no-peeking firewall. One play per day; the title button parks itself after.

## Earn (fleet standard)
`_sbCapEarn` hues-identical, ledger `sw_sb_twin-lanterns`, 30/day cap.
- daily lit: 4
- perfect night: +2
Plus `{sws:'earn', moment:'daily_done'}` postMessage when embedded.

## localStorage
- `tl_state` — `{names:[a,b], streak, best, lastDay, lastResult}`
- `sw_sb_twin-lanterns` — earn ledger
- `tl_test` — opt-in test hook flag (window.TL, absent on plain load)

## Gating
`/dev-gate.js?v=2` in the head; NOT on the portal yet. Add the card when
the Director has played it.

## Phase 2 (not built)
Async by link: Firestore pair docs, anonymous auth, partner nudge, per-pair
cloud streak, server-authoritative sunbeams via Cloud Function. Needs
Firestore rules for a `pairs/{pairId}` collection (Stephen deploys rules).
Also wanted: sound (tiny WebAudio set), a second grid glyph for
colorblind-safe marks (guess marks are shape-coded ✦ vs ✗ already).
