# LITTERBUGS — Flagship Brief (hashblock #2)

**Status:** CONCEPT — Stephen review. No code until direction approved.
**One-liner:** Bugs made of trash. A litterbug is literally a bug made of litter — the pun IS the pitch, the name is free marketing, and nobody can steal a word that's already in the dictionary.

---

## WHY THIS WORKS AS A HASHBLOCK GAME

Lucid Winds proved the pattern: SHA-256 → layered trait anatomy → deterministic
one-of-one SVG + procedural text + earn-by-play. The pattern transfers to
anything that has a SHARED ANATOMY. Bugs have one: body, head, legs, wings,
antennae, eyes. Every layer swaps a junk object into an anatomical slot, so ONE
renderer covers the whole species space — same economics as `_generatePlantSVG`.

The trash constraint is secretly the art solution. Cans, caps, wire, foil,
matchsticks are GEOMETRIC — far easier to draw convincingly in procedural SVG
than organic leaves ever were. We already climbed the hard mountain.

## THE DIFFERENTIATOR — LITTERBUGS COMPETE

Lucid Winds is tending: gentle, botanical, walk-and-collect. Litterbugs is the
opposite pole: **bug fights.** King of the dumpster. Beetle-sumo is a real
retro obsession (Mushiking in Japan ran for decades; kids everywhere have
always pitted bugs against each other in a jar). Same hash tech, opposite
emotional register — that's what makes it a second flagship instead of a skin.

Battle stats derive from parts using the EA design law (**physics must be
logical**), which is this studio's signature:

| Part | Logical stat consequence |
|---|---|
| Sardine-tin body | High armor, slow |
| Foil chip-bag wings | Fast, fragile |
| 9V battery abdomen | Charge attack, heavy |
| Paperclip legs | Light, springy — dodge bonus |
| Cork body | Bounces — knockback resist, floats |
| Glass marble head | Beautiful, cracks — crit-taken risk |

Async battles reuse the territory-system muscle (challenger vs defender,
EA-style comparison + a playable defense minigame). No live netcode needed for v1.

## HASH → TRAITS (draft anatomy, Lucid Winds byte-map style)

```
BODY      hb(0) % ~60   crushed soda can, sardine tin, matchbox, cork, thread spool,
                        9V battery, harmonica, film canister, thimble, domino,
                        lipstick tube, pocket-watch case, lighter, eraser ...
HEAD      hb(2) ladder  bottle cap, button, marble, d6 die, walnut shell,
                        watch face, gumball ... (top tiers banded like stems)
LEGS      type + count  paperclips, bobby pins, twist ties, zipper teeth,
                        safety pins, matchsticks, screws, fork tines
WINGS     hasWings gate candy wrapper, foil, bus ticket, torn playing card,
          (like flower) comic-page scrap, overhead transparency (dragonfly-clear)
ANTENNAE  wire, pipe cleaner, headphone cable, sparkler wire, pin flags
EYES      beads, sequins, watch jewels, LEDs (glow = rare)
PATINA    substrate-equivalent: rust, verdigris, grime, gloss enamel,
          chrome, glitter — drives the whole color mood
AURA      flies circling, stink wobble, firefly glow, static sparks,
          radioactive-green shimmer (rare)
HITCHHIKER companion-equivalent: a smaller critter riding along —
          mite, snail-shell sidecar, baby roach, dust bunny
MUTATION  byte 16 style: two-headed, magnetized (loose junk stuck to it),
          spray-paint gilded, X-ray, googly-eyed
```

Rarity ladder = **Specimen Grade** (reuse the Variant-G scorer architecture
wholesale — tier scores per layer, banded top tiers, thresholds tuned by sim
with `rarity_sim_live.js` methodology from day one, never a hand-mirrored scorer).

## TEXT ENGINE (the haiku equivalent)

- **Faux-Latin taxonomy** from junk-word banks: *Cansectus rubigo*,
  *Foliptera crinklewing* — genus from body bank, species from patina/wings.
- **Field-guide entry**: 2–3 line collector's note in a dry naturalist voice
  ("Nests in gutters. Attracted to porch light and spare change."). Same
  curated-bank architecture as HAIKU_A/B/C; new banks, same engine,
  HAIKU_PRINCIPLES anti-formula law applies.
- Currency: **Shinies** — bugs hoard shiny things. 30 Shinies = 1 mint.

## AESTHETIC

Grimy-beautiful. The Borrowers meets WALL-E meets a rain-slicked alley at
night. Streetlight sodium-orange + oil-slick iridescence instead of midnight
sage-and-gold. NOT botanical (portal rule: no botanical default) — this one's
identity is urban nocturne.

## HONEST BUILD ASSESSMENT

- **Nearest-term flagship candidate.** One anatomy → one renderer → the whole
  Lucid Winds pipeline (hashToTraits clone, grade scorer, mint queue, card
  system, breeding→"splicing") ports with new banks and new art math.
- Hard parts: making junk objects read as ONE bug (assembly/anchoring pass —
  the leaf-to-stem connection lesson applies: joints need deliberate art,
  bark-swell equivalent = solder blobs/tape wraps); battle balance.
- v1 scope: mint + collect + field guide + async dumpster-king battles.
  No GPS needed. Breeding/splicing v2.

## OPEN CALLS FOR STEPHEN

1. Battles as the core differentiator — yes/no? (Without it, it's a reskin.)
2. Tone: kid-friendly grubby or slightly gross? (Doll-eye head: in or out?)
3. Name LITTERBUGS — lock it?
