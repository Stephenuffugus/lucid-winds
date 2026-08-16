# STUDIO SHELF AUDIT — material for Stephen's run through

Read straight off `portal/index.html` on 2026-08-16, after the five new games shipped.
Nothing here has been changed. These are the facts plus the decisions they force, so the
organization conversation can be about choices rather than about discovery.

Context: Stephen's words were "those aren't the games I'd want to highlight". This finds
out what is actually being highlighted today, and why some of it got that way by accident.

## The catalog, by the numbers

| | Count |
|---|---|
| Satellite cards total | ~118 |
| Public (a stranger can play) | 96 |
| In Development (dev gated behind the passcode) | 22 |
| Native `/play/` games | 66 |

Category spread across satellites: **action 45, puzzle 30, creative 14, word 7, card 6,
board 6, party 4, math 3, dice 2, pattern 1.** Action is 38% of the shelf by itself, and
Party, which is the most social and most demo-able category, has four.

## Problem 1: the New shelf is not new. It is a third of the catalog.

**29 games carry `fresh:true`.** That includes Jumping Jimothy, Hexa Hive, Bubblenaut,
Tetroku and Fox & Basket, which are not new by any reading. A shelf that holds 29 of 118
games is not a recommendation, it is a second A to Z wall. This is the same failure as the
PLAY NOW badge that got retired on the 16th: a marker on everything marks nothing.

**Worse: 13 of those 29 are ALSO In Development**, so a visitor who taps New lands on a
row where nearly half the cards ask for a passcode they do not have.

Decision needed: what does New mean. Options are a rolling window (anything carded in the
last 30 days), a hard cap (the newest 6 or 8, and adding one drops the oldest), or a manual
list you curate like START_HERE. A rolling window needs a date on each card, which is a
small schema change and worth doing once.

## Problem 2: Start Here is doing the most important job with the least attention

Start Here is the first shelf a stranger sees and it is six games:
**Jumping Jimothy, Nectar Drop, Dewball, Bloom Breaker, Vinewinder, Super Slice.**

That list has never been revisited against the question it is actually answering, which is
"what should a person who has never heard of this studio play first, on a phone, in ninety
seconds, to decide whether to come back". Worth asking per slot: does it open instantly, is
it legible on a phone, does it end in under two minutes, and does it flatter the studio.

## Problem 3: the studio shelf points at things a visitor cannot open

Made by the Studio is twelve: Lucid Winds, Aura Farm, Create A Critter, LOAF, Litter Bug,
The Attic, Abduct a Chameleon 3D, Flock the World, Whack Box, Power Scalers, Bandit's Box,
HUNCH. **Several are dev gated**, so the shelf that is supposed to say "here is what we
make" partly says "here is what you cannot play". Either the gate comes off for the ones
that are ready, or they come off the shelf until they are.

## Problem 4: one in five cards is behind the passcode

22 in development. That is fine while you are testing, and it is exactly why the five new
games shipped that way. But it means the public storefront is quietly 20% smaller than it
looks, and the In Development tab is now a real shelf in its own right with 22 entries,
sorted alphabetically with no sense of which are close to done.

Worth considering: a "ready to test" versus "early" split inside the gate, so your own
testing has an order to it.

## What I did NOT change

Nothing. Every one of these is a taste call and you said you want to walk through it. The
only portal edit made today was mechanical: twelve player facing strings carried an em dash
against the studio rule and were rewritten as sentences.

## The five questions that unblock the rest

1. What does New mean, and should it expire automatically.
2. Who are the six Start Here games, judged as a first impression rather than as favourites.
3. Which In Development games are actually ready to be public.
4. Is Action being 38% of the shelf a problem to fix by promotion, or just what the catalog is.
5. Does the storefront need a shelf it does not have yet, for example "two minutes or less",
   "play with someone in the room", or "made this month".
