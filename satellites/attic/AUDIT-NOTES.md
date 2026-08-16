# THE ATTIC — audit, 2026-08-16

Run the gate: `node test/attic-check.js` (no browser, no network, about a second).
55 assertions. Every one of them was watched RED against the build as it stood
before this pass.

---

## THE VERDICT, PLAINLY

**It was a demo wearing a flagship badge.** Not because it was small, and not
because the shell was thin. The shell is good: five object classes, era driven
palettes, a real SVG renderer per class, a want list, a daily allowance, a
second earner, a rules screen. The problem was that **the two things a flagship
premise rests on were both untrue as shipped**, and the CSS class on the tagline
is still literally called `.demo-note`.

1. **"Every rummage turns up one object that has never existed before."**
   Measured over 40,000 pulls: **19.42% of pulls were an exact duplicate of an
   earlier object.** Board games had **ten** titles. Cereal had **ten**. Toys had
   fifteen. **82% of forty dig sessions repeated a title.** Only records had a
   grammar; the other four classes were flat lists a player exhausts in an
   afternoon.

2. **"A rummage costs one ticket, so a dig is a decision."**
   A rummage cost 1 ticket, and scrapping the pull you just made handed 1
   straight back. Net zero. **You could dig forever for free**, and because a
   FINE or better find also refunded a ticket, the greedy loop was net
   *positive* at about +0.34 tickets a dig. The comment above the economy said
   "the maths is deliberately lossy (about a third of finds pay), so tickets are
   the pace of the game." It was not lossy. There was no pace.

It is a real game now. It was not one before.

---

## WHAT THE AUDIT FOUND, WORST FIRST

| # | Severity | What | Evidence |
|---|---|---|---|
| 1 | 🔴 premise | Generator too shallow to support "never existed before" | 19.42% exact duplicate pulls; GAME 10 titles, CEREAL 10, TOY 15 (30 counting the spoiler suffix) |
| 2 | 🔴 economy | The ticket loop was free. Dig 1, scrap the result, +1 back | greedy sim never terminated |
| 3 | 🔴 the one dramatic beat | **The condition was revealed before the reveal button.** The art painted the real wear immediately (shrink gloss on FACTORY SEALED, tape repair on TRASHED, price sticker withheld on MINT), toys printed `(MINT ON CARD)` **in their own name**, and low grade toys printed the condition flaw in the sticker line | 216 of every 6000 pulls leaked in text alone; art leaked on every single pull |
| 4 | 🟠 save | Wallet, shelf and revealed map were each read once and written back **wholesale**. Two tabs clobber: the second to save refunds everything the first spent | studio wide known bug pattern, present here in three places |
| 5 | 🟠 save | A corrupt save could permanently brick the game. `day` in the future meant the daily allowance never granted again; negative `tix` was loadable and unrecoverable | `{"tix":-500}` and `{"day":999999}` both loaded as is |
| 6 | 🟠 odds | Declared class split 35/25/20/12/8 was really **43.2 / 24.8 / 16.0 / 9.6 / 6.4**. `hb(0) % 100` folds 0..255 unevenly: residues 0..55 get three chances, 56..99 get two | measured N=40k |
| 7 | 🟡 storage | `revealed` map grew by ~72 bytes per dig forever and was never pruned; the shelf had "no cap in storage" by design | quota exhaustion makes every write fail silently |
| 8 | 🟡 UI | `renderShelf()` early returned on an empty shelf, leaving the previous shelf's buttons on screen after scrapping the last item | stale DOM |
| 9 | 🟡 data | Want list ticks were keyed by **array index** into the grail pool. Editing the pool later would silently move a player's crossed off grails onto different hunts | |
| 10 | 🟡 robustness | `hashToItem(undefined)` printed `undefined` into a card instead of degrading | |
| 11 | ⚪ standards | `.wantbtn` and `.scrapbtn` were 44px, under the 48px floor | |

Not found (checked, clean): no `Math.random` in anything whose determinism is
asserted; the **grade ladder is exactly what its comments claim** (TRASHED 7.8 /
PLAYED 30.1 / GOOD 28.1 / FINE 18.0 / NEAR MINT 12.1 / MINT 3.5 / FACTORY SEALED
0.39); factory error fires at 6.25% as documented; the five eras are flat; no em
dash or en dash anywhere in generated or page copy.

---

## WHAT WAS FIXED

**The generator (`attic-engine.js`).** Every class now assembles from a grammar
instead of drawing from a flat list, fed by a per class deterministic stream
(`stream(h, salt)`) so the grammars are not limited to the 32 bytes of the hash.
The hand written "classic" titles are the best jokes in the file and the
shallowest bank in it, so they went from *one pattern in nine* to **roughly 1 in
40** — that single weighting change is most of the session repeat fix.

| class | distinct titles before | after |
|---|---|---|
| RECORD | 1,506 | 3,241 |
| VHS | 144 | 4,250 |
| TOY | 15 | 3,722 |
| GAME | 10 | 1,704 |
| CEREAL | 10 | 1,210 |

Exact duplicate pulls **19.42% → 0.56%**. Forty dig sessions that repeat a
title **82% → 14%**.

**The reveal.** `renderItem(h, size, {dusty:true})` renders the object under
grime with the grade withheld entirely, and the shelf draws unwiped finds that
way too, so the shelf is a to do list and not a spoiler sheet. The two grade
derived text flourishes moved to `revealSuffix` / `revealNote`, printed only
after the wipe. There was a subtler leak underneath: the class grammars seeded
off the whole hash, **including byte 2, which is the grade**, so changing only
the condition changed the record's name. Content now seeds off `contentKey(h)`
with byte 2 blanked. The test proves independence by holding a hash still and
sweeping the grade byte through all 256 values.

**The economy (`attic-econ.js`, new).** Pulled out of the page so it can be
asserted in node. Scrapping now pays 1 ticket per **2** things scrapped, so the
loop is genuinely lossy at about -0.16 tickets a dig: five daily tickets buy
roughly 31 digs, and the wallet runs dry. Every write is a read modify write
through `mergeToDisk` (counters ADD, bests MAX, want ticks union). Corrupt saves
are repaired on load: tickets clamped to 0..99999, a future dated `day` reset so
the allowance cannot be locked out forever, `wants` forced to an object, shelf
capped at 400 and validated hash by hash.

**Also fixed:** class split thresholds moved onto the raw byte (now 35.2 / 25.0
/ 19.9 / 12.1 / 7.8); `revealed` pruned to the shelf on every write; empty shelf
hides itself; grails keyed by a stable id; junk hashes fold into a stable real
object instead of printing `undefined`; both undersized buttons raised to 48px.

**One improvement beyond the bug list:** the out of tickets message used to say
"scrap something off the shelf, or come back tomorrow" even when the shelf was
empty and the dust panel still had tickets in it. It now names only the doors
that are actually open right now, and when none is, it says when one opens.

---

## STILL WORRIES ME

- **Nobody has looked at it.** I did not open a browser (ten agents, two cores,
  the main loop owns browser work). The grime overlay, the UNWIPED plate, the
  reveal swap and the dusty shelf thumbnails are all **wired and asserted, not
  seen**. Per the project rule, wiring art is not seeing art. Somebody has to
  shoot this at 375x667 and at desktop width before it counts as done.
- **Old shelves will re-derive differently.** Finds persist as hashes and the
  generator changed, so a returning player's shelf shows different titles for
  the same finds. Grades, eras and years are untouched. Acceptable for a beta
  card (`beta:true` in the portal), but it is a one time visible change.
- **Want list ticks reset once.** Keys moved from array index to stable id.
  Anybody mid hunt starts that list again. Deliberate, and worth it, but it is
  a real reset.
- **The dust panel cells are 47.6px at 375px wide**, marginally under the floor.
  It is a drag surface rather than a row of discrete targets, so I left it, but
  it is the one place the 48px rule is not met.
- **Depth is now in the names, not in the objects.** A player will stop seeing
  repeated titles, but the five SVG renderers still have a fixed number of
  layouts each (4 sleeve layouts, 3 VHS motifs, 4 cereal mascots). The *pictures*
  will start feeling samey long before the *names* do. That is the next real
  content job and it is bigger than this pass.
- **No proof of play.** Tickets, shelf and want list are all local. Trivially
  editable. Fine for now, worth knowing before anything is ever sold or ranked.
