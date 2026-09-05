# THE ATTIC — audit, 2026-08-16

> **2026-09-05, the games pass (Stephen: "needs built a lot more, not playable").**
> Played end to end at 412x915 with real touch taps (`docs/GAMES-PASS-SEP05.md` has the
> walk and the shots). No wall stops a player; the fleet audit's row 144 findings were
> all true and are fixed in this pass: the dusty render let nothing through (grime
> 0.79 x 0.79 = 0.956 over the object) and read as a failed image, now 0.62 + 0.42 off
> the swipe so the thing shows as a shape and a colour and the wipe is a reveal; the
> room's tones sat within four points of the ground and read as three smudges, now
> about eighteen points up with ONE 0.34 scrim on `.atticbg::after`; the handheld's
> title was `#ffffff` on whatever shell it rolled (white on a pale 1990s shell), it is
> `inkOn(shell)` now; the hash and date lines were `#6f6350` on `#1e1811` (2.2:1) and
> are `#9a8a6e`; the WIPE button's .24em tracking wrapped it at 375, .1em now; motes
> 4 px at 0.45. The shared ♫ chip is asked to `reseat()` after every card, sheet and
> the rules close, but it still scores the art box as free and parks on its left edge
> (music-unlocks.js, not this file).
> **Measured, not asserted:** DUST OFF is not forty seconds of committed dragging. One
> raster of 24 touch swipes across the 346 px panel cleared 92% and found all 10 stubs
> with 83 s still on the clock. It pays whoever drags. That is an economy call and is
> left as is. Title uniqueness over 1000 pulls per class: 74.5% (COMIC) to 94.6%
> (CEREAL) unique, table in the games pass ledger.

> **2026-08-24 UPDATE, READ THIS FIRST.**
> The gate moved: **`node satellites/attic/check.js`** is the suite now, in the
> house pattern the rest of the fleet uses (vm + DOM stub, `ok()`/`group()`,
> exit 0/1/2, plus a real browser group for anything that has to be measured in
> RENDERED pixels). `test/attic-check.js` still works and still returns the real
> exit code, because it now runs `check.js`. Nothing that pointed at it is
> orphaned; nothing asserts twice.
> The suite carries a **controls group**: every rule it guards is written as a
> predicate and run a second time against deliberately broken code, and the
> broken run has to go red. A check nobody has watched fail is decoration, and
> "I broke it by hand once" is not repeatable.
> The screenshot walk is `node satellites/attic/shots.mjs`, which asserts the
> live screen after every step.
> Three of the "STILL WORRIES ME" items at the bottom of this file are closed:
> the reveal has been watched happening, the grime and the UNWIPED plate have
> been looked at and rebuilt, and the "depth is in the names, not the objects"
> problem was the whole of the A4/A5 pass (five families became ten, and the
> condition ladder went from three pictures to seven).
> The dust panel's 47.6px cells are gone with the grid; it is a canvas drag
> surface now, and the 48px exemption for it still stands for the same reason.

Run the gate: `node satellites/attic/check.js`.
The notes below describe the 2026-08-16 pass and its 62 assertions. Every one of
them was watched RED against the build as it stood before that pass.

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

**Found by LOOKING, not by any assertion (390x844 and 1280x800).** The how to
play sheet's ground was `#0d0b0af5`. That is an **eight digit hex, so the `f5`
is an alpha**: 96%, which reads as solid in a colour swatch and is not. The
title, the BACK TO THE ARCADE chip, the ticket count and the RUMMAGE button all
ghosted up through the paragraphs, cream text over a cream tinted bleed, two
layers of text in the same pixels on the first screen a new player ever sees.

It was taking the bleed twice, because `.howcard` was **the only overlay content
in the file with no background of its own** — the want list (`.sheetcard`) and
the dust panel (`.dustcard`) both sit their text on an opaque card, and this one
sat directly on the scrim. Fixed both ends: the ground is fully opaque with a
`backdrop-filter: blur(8px)` behind it as belt and braces, and the card now has
the same panel treatment as its two siblings. The gate now encodes the rule for
all three overlays: **a full screen overlay either has a fully opaque ground, or
its content sits on a card that declares its own background. Never text straight
onto a translucent scrim.** 62 assertions now, up from 55.

Worth noting for whoever reads this next: this class of defect is invisible to
every static check, and the specific trap is that `#0d0b0af5` *looks* opaque.
Nothing but opening the page catches it. A separate question has been logged in
`incoming/STUDIO-SHELF-AUDIT.md` about whether this sheet should auto open on a
cold load at all, since several games across the fleet greet a new player with a
wall of text; that is Stephen's call, not mine. Either way it has to be readable
while it is doing that job, and now it is.

**One improvement beyond the bug list:** the out of tickets message used to say
"scrap something off the shelf, or come back tomorrow" even when the shelf was
empty and the dust panel still had tickets in it. It now names only the doors
that are actually open right now, and when none is, it says when one opens.

---

## STILL WORRIES ME

- **I still have not looked at it myself.** The coordinator shot it at 390x844
  and 1280x800 and found the how to play legibility defect above, which is
  exactly the point of the rule. But the grime overlay, the UNWIPED plate, the
  reveal swap and the dusty shelf thumbnails were **not** among what was
  reported on, so those remain wired and asserted rather than seen. The reveal
  swap in particular is the game's one dramatic beat and nobody has watched it
  happen. Shoot a rummage through to the wipe before calling this done.
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

- Sep 05 (later), condition as story: `revealStory` on every item from a WEAR bank per grade in attic-engine.js, printed only after the wipe (find card, flip card front, ledger WEAR row, shared PNG). The class flaw joined it under the plate. Workout VHS cover art clipped to the cover (it bled past the cassette on shared cards). PNG plate steps down when name and sub both wrap. Pins 20260905c. Gate 132 ok; the two story assertions watched red with `AT_ENGINE=` pointing at a mutant engine.
- Sep 05 (later), era depth: the price sticker is five era objects (object-render.js `priceSticker`, era = byte 1 mod 5, `data-era` on the group), titles carry `ERA_LOOK[era].ta` and `fit()` takes the era letter spacing off the available width. Gate: era group (three assertions), `AT_OBJECT=` points the node side at a mutant renderer. Pins 20260905d. 135 ok.
- Sep 05 (later), sound: `ATTIC_SFX` in index.html (WebAudio, no files), cues on the real paths, `#sndBtn` chip in the backrow, `attic_snd` in localStorage. Gate: sound group (six assertions, offline RMS per cue). 141 ok.
- Sep 05 (later), the shelf as a room + a scrap leak: `.shObj/.shPlank/.shLabel` per card, boards on `#shelfSheet`, the sealed case is `.shObj::before`. ⛔ SCRAP LEAK: `mergeShelfToDisk` unioned disk and memory so a scrapped find came back on reload with its ticket paid; `attic_gone_v1` tombstones (econ `readGone`/`mergeGoneToDisk`, week TTL) filter every merge and the boot read. Gate: room group (4), tombstone group (3), reload scrap assertion; `AT_ECON=` mutant override. Pins 20260905e. 149 ok.
