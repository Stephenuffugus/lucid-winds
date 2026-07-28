# LISTDLE SUBMISSIONS — copy-paste pack
Last checked against the live directory and the Gmail thread: **Jul 22**

Form: **https://listdle.com/submit/**
Fields: URL* · Game title* · Category* (dropdown) · Description · Your email
Use **stephenfurpahs@gmail.com** on every one.

**His rule:** "the game must be a free-to-play daily game which does not require
log in." Every description below leads with the daily.

**The order:** submit on the form FIRST, then send the email. Conor asked to be
told when a submission comes through so he can pull it out of his 200+ backlog.

---

## WHERE IT STANDS (verified Jul 22, not from notes)

| Game | Submitted | Live on Listdle |
|---|---|---|
| Hues | Jul 17 | ✅ https://listdle.com/games/hues |
| Tally | Jul 17 | ✅ https://listdle.com/games/tally |
| Sixfold | Jul 17 | ⏳ still in his queue |
| Cosmic Cadets | Jul 17 | ⏳ still in his queue |
| Nectar Drop | Jul 17 | ⏳ still in his queue |
| **Jimothy** | **not yet — submit this one** | — |

Two of five are up. The other three are not rejected, they are just behind 200
other submissions. Conor has been friendly and fast, so a light note is fine and
a chase is not needed.

**Embedding is settled.** Conor asked to embed the games in the card on their
listing page, Stephen said yes on Jul 17, and the server header is already right:

    content-security-policy: frame-ancestors 'self' ... https://listdle.com https://*.listdle.com

Verified Jul 22 on Jimothy and on Hues. Anything new we host on lucidwinds.com
embeds with no extra work.

---

## SUBMIT NOW — Jimothy

- **URL:** `https://lucidwinds.com/jimothy/`
- **Title:** `Jimothy`
- **Category:** `OTHER`
- **Description:**

> Hop Seattle's roundest raccoon across the rainy city. One road a day, the same
> one for everybody, and one run at it. See how many lanes you get before the
> traffic gets you, then share the little strip of squares that shows how your
> run went. Come back tomorrow for a new road and keep your streak alive. Free in
> the browser, no account, no ads.

**Use the short `/jimothy/` URL.** Checked both on Jul 22 with curl: `/jimothy/`
answers `HTTP/2 200` directly with no `location` header, so there is no redirect
to avoid, and it is the nicer thing to have printed on a listing card. An earlier
draft of this pack said it redirected; it does not. Both URLs carry the header
that lets Conor embed the game:

    content-security-policy: frame-ancestors 'self' ... https://listdle.com https://*.listdle.com

Note the description says "how many lanes you get" rather than "finish". There is
no finish line in the Daily, and a directory description that promises one would
be the first thing a player noticed was untrue.

### Why Jimothy is worth his attention
The Daily became a real daily on **Jul 22** (game build v5.0):
- one course a day, generated from a UTC day number so it turns over at the same
  moment for everyone and a device clock in another timezone cannot jump ahead
- your result is the **first run you start that day**, written as you go, so it
  cannot be farmed by replaying until the road is kind
- practice runs afterwards are free and never touch the result
- no continues in the Daily, so nobody buys a better number
- a shareable square strip of the road you crossed, and a day streak
- no account, no ads, works offline once installed

---

## ALREADY SUBMITTED — for reference, do not resubmit

### Hues ✅ live
- URL `https://lucidwinds.com/satellites/hues/` · Title `Hues` · Category `COLOR`
- Match a target color by feel before the clock runs out. One Daily Hue puzzle a day with a shareable score grid, plus easy and practice modes. Free in the browser, no account, no ads.

### Tally ✅ live
- URL `https://stephenuffugus.github.io/Tally/` · Title `Tally` · Category `MATH`
- Combine the numbers to hit the target with a pocketful of pals cheering you on. A fresh daily puzzle every day. Free, no account, no ads.

### Sixfold ⏳ queued
- URL `https://stephenuffugus.github.io/sixfold/` · Title `Sixfold` · Category `LOGIC`
- A six stance dueling game about reading your opponent and breaking the bind. The Daily Duel puts everyone against the same foe once a day, and a duel takes under a minute. Free, no account, no ads.

### Cosmic Cadets ⏳ queued
- URL `https://lucidwinds.com/satellites/seed-flutter/` · Title `Cosmic Cadets` · Category `OTHER`
- A gentle one tap flier. Lift a little comet cadet on the night wind and thread the crystal star spires. The Daily Gust is a seeded daily course, the same sky for everyone, once a day. Soft landings instead of harsh crashes. Free, no account, no ads.

### Nectar Drop ⏳ queued
- URL `https://lucidwinds.com/satellites/nectar-drop/` · Title `Nectar Drop` · Category `OTHER`
- A cozy botanical peg bouncer. Aim one drop and ricochet through the blooms. The Daily Bloom is a seeded board everyone plays once a day, plus a 120 level journey with 14 gardeners and boss battles. Free, no account, no ads.

---

## HOLD — Lucid Winds itself
It is a collection and a garden, not a once a day puzzle, and it asks for an
account early, so it fails his stated rule twice. Holding it back keeps our
submissions clean, which is worth more than one more listing.

---

## NEXT CANDIDATES (not ready, for a later round)
These have real daily modes and no login, so they are the natural next batch
once Stephen wants to send more. Each still wants a device pass first.

| Game | Daily mode | URL |
|---|---|---|
| Word Sprout | daily word, default mode | `/play/sprout.html` |
| Dew Trail | daily path puzzle | `/play/dewtrail.html` |
| Daily Bloom | daily rotation | `/play/dailybloom.html` |
| Flood | daily seeded board | `/play/flood.html` |
| Minesweeper | daily seeded board | `/play/mines.html` |
| Stop at Ten | has a daily mode | `/play/stopten.html` |

~~Three Sisters (`/play/set.html`) has NO daily mode.~~ **CORRECTED 2026-07-28: it
DOES.** "Daily Trio" shipped 2026-07-16 (commit 0b8f1129) and lives in
`games/_inline/set.js` — date-seeded deck at :397, one counted lock-in and share text
at :247-268, loaded by `play/set.html:36`. Its only gap for Listdle is that it rolls at
LOCAL midnight rather than UTC. Vine Words and Word Search genuinely still have no
daily, and both were named in the very first email to Conor, so they are the two most
worth building a daily into.
