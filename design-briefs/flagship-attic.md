# THE ATTIC (working title) — Flagship Brief (hashblock #3, Retro Attic collab)

**Status:** CONCEPT — Stephen review. No code until direction approved.
**One-liner:** Every hash mints a one-of-one fake vintage object — a record that
never existed, a knockoff action figure, a board game nobody ever played — graded
like real collectibles, dug out of an endless estate sale.
**Name candidates (Stephen picks):** Dead Stock (real collector term for
never-sold sealed inventory — the grail), Rummage, The Lost Aisle, Attic Gold,
Shelf Life.

---

## THE HARD PROBLEM, SOLVED STRUCTURALLY

Stephen's stated blocker: "no way to translate the hash into enough unique
things to be cool." The reason it feels stuck: a record and an action figure
**share no anatomy**, so the Lucid Winds move (one layered trait system → one
renderer) can't cover them. The fix is a two-stage hash split:

```
STAGE 1  hb(0) → OBJECT CLASS        (each class = its own mini trait schema + renderer)
STAGE 2  remaining bytes → that class's layer system
```

Same trick as the companion override table — a byte ladder picking which
sub-system interprets the rest of the hash. Rare classes live on narrow bands
(a pinball backglass should be rarer than a trading card).

### Launch classes — picked for renderability

Deliberately start with GRAPHIC-DESIGN objects, not sculptural ones. A record
sleeve, cereal box, or VHS case is typography + layout + palette — procedural
SVG is genuinely GOOD at that, easier than organic plants ever were:

| Class | Its trait layers (each its own bank) |
|---|---|
| **Vinyl record** | sleeve layout archetype, band name (word engine), album title, genre, label logo, pressing color (colored vinyl = rare), hype sticker |
| **Board game box** | box-art composition, title, absurd premise line, player count, "ages 8+", spinner/dice iconography |
| **Cereal box** | mascot archetype, cereal name, marbling/burst layout, free-prize-inside flag (rare) |
| **VHS tape** | genre (horror/sci-fi/workout!), title, tagline, rental-store sticker, "BE KIND REWIND" |
| **Trading card** | subject archetype, stats box, foil treatment (rare), off-center miscut (weird-rare) |
| **Action figure on blister card** | ONE body rig + palette swaps, card-back art, knockoff name, accessory, "5 POINTS OF ARTICULATION!" |

v2 classes: lunchbox, View-Master reel, 8-track, handheld LCD game, wind-up
tin toy, pinball backglass, arcade flyer, patch/pin.

### The three UNIVERSAL layers (every class shares these — this is the glue)

1. **ERA** — one byte → 1950s/60s/70s/80s/90s. Decade drives the ENTIRE visual
   language: palette, typography, layout idiom, halftone vs airbrush vs neon.
   One layer, five complete aesthetics, multiplies every class.
2. **CONDITION** — this is the Terra Grade, and it's a rarity ladder real
   collectors already worship, for free:
   `Trashed → Played → Good → Fine → Near Mint → Mint → FACTORY SEALED`
   Sealed-in-box is the Cosmic. Condition renders visibly: wear, sun-fade,
   shelf dust, price-sticker tear, water stain vs pristine shrink-wrap gleam.
3. **THE TEXT ENGINE** — the actual soul of the game. Retro objects are funny
   because of their COPY. We already own this muscle (haiku engine, word
   banks): procedural band names, movie taglines, knockoff toy names
   ("LAZER WIZARDS III: THE RE-ZAPPENING", a figure named "MUSCLE GUY"),
   price stickers ($1.99 — orig. price visible under a markdown sticker = its
   own little story), and a one-line **provenance** (the haiku slot):
   *"Barn sale outside Dayton. Still smells like attic."*

Variety math: 6 classes × 5 eras × layout archetypes × palettes × deep
procedural text × 7 condition grades × mutation-style oddities (miscuts,
factory errors, promo stamps) = the "enough unique things" problem is gone.
Factory errors as the mutation byte is period-perfect — error items are the
holy grails of real collecting.

## THE LOOP

**Rummage.** Pattern games earn **Tickets** (30 = one dig). A dig is the mint
moment: hands pull back a box flap, newspaper unwraps, the object emerges —
condition revealed LAST (the pack-rip dopamine beat). Collection lives on
procedural SHELVES (the greenhouse equivalent); trade/compost →
"sell to the pawn counter."

## THE RETRO ATTIC TIE-IN (the collab hook)

- Their physical store becomes a **real-world legendary dig site** — the Wild
  tab GPS muscle already exists. Walk into the Retro Attic, the game knows,
  you get an exclusive in-store dig with boosted condition odds.
- A co-branded **"Retro Attic Finds" shelf** — store-exclusive procedural
  drops carrying their mark (with their blessing; that's the custom deal).
- QR on their counter → first dig free → funnel from their foot traffic.
- Their vibe informs the era banks: whatever actually sells in their shop
  tells us which decades and object classes players will feel.

## LEGAL LINE (non-negotiable)

Parody means ORIGINAL FAKE BRANDS in period style — archetypes (barbarian
figure, space-wizard VHS), never renderings of real trademarked characters or
near-identical real products. The text engine makes originals funnier than
references anyway.

## HONEST BUILD ASSESSMENT

- **Bigger lift than Litterbugs**: N renderers instead of one. Mitigation:
  launch with 3 classes (record, VHS, trading card — the most
  typography-driven), add classes as content drops. Each new class is a
  CONTENT EVENT, which is a live-ops gift.
- The text engine is the make-or-break and the cheapest part to prove:
  band-name + title + tagline banks can be prototyped and taste-tested on
  paper before any renderer exists.
- Reuses: hash pipeline, grade scorer architecture, mint queue, card/carousel,
  GPS/geofence, word-bank engine + HAIKU_PRINCIPLES discipline.

## OPEN CALLS FOR STEPHEN

1. Name — Dead Stock / Rummage / other?
2. Launch trio of classes — records + VHS + trading cards, or swap one for
   action figures (costlier art, bigger wow)?
3. What does the Retro Attic actually WANT from a custom deal — foot-traffic
   funnel, co-branded drops, a store-shelf feature, or a physical-digital
   bridge (buy real item → get its digital twin)? Shapes v1 scope.
4. Prototype gate: OK to start with a paper-only text-engine taste test
   (50 generated record sleeves' worth of names/titles) before any code?
