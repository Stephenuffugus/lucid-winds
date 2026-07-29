# GNOME BLITZ (working title) — Design Brief

**Status:** CONCEPT — Stephen review. No code until direction approved.
**Source:** Jessie's queue (Jul 19) + checklist "new game, Dutch Blitz with garden gnomes."
**One-liner:** A real-time race to empty your gnome's card pile into the shared
flower beds before three rival gnomes empty theirs — no turns, fastest hands win.

---

## THE LEGAL LINE, FIRST

"Dutch Blitz" is a live trademark on a commercial product. The GAME underneath
it is **Nertz** (also Pounce / Racing Demon), a public-domain folk card game
played with standard decks for a century. We build Nertz with our own theme,
our own card faces, our own terminology, zero trade dress from the boxed
product — exactly the Tetroku / Jade Garden pattern. That also means the
working title needs a look: "Gnome Blitz" leans on the trademark's most
distinctive word. ⛔ Stephen names it. Candidates that keep the speed without
the word: **Gnome Rush, Gnome Dash, Garden Scramble, Pointy Hats, Gnome Sweet
Gnome**. Portal aliases regardless of name: "dutch blitz", "nertz", "pounce",
"solitaire race".

## WHY THIS GAME FITS THE ARCADE

- It is the rare REAL-TIME card game — arcade energy in a card frame, nothing
  else on the shelf plays like it.
- Complete rules fit on one screen (numbers 1-10, four suits, three zones).
- Family multiplayer DNA: Jessie asked for it, Penny can play it, and the AI
  rivals make solo feel like family night.

## CORE RULES (Nertz, rethemed — all names below are proposals, Stephen calls)

Four suits of 1-10. Each gnome (you + up to 3 AI rivals) owns:

| Zone | Proposal | What it is |
|---|---|---|
| Blitz pile | **Burrow** (10 cards, face up top card) | Empty it to end the round. The whole game is this race. |
| Post piles | **Garden rows** (3 slots) | Working slots; build DOWN in alternating suits, move runs. |
| Wood pile | **Wheelbarrow** (rest of deck) | Flip three at a time; top card playable. |
| Center | **Flower beds** (shared) | Anyone plays ANY 1 to start a bed, then 2-10 same suit. The race happens here. |

Round ends the instant someone empties their Burrow ("GNOME!"). Score: +1 per
card you planted in the beds, -2 per card left in your Burrow. First to 75
wins the match (configurable 25/75/150 = short/standard/marathon).

## THE PHONE ADAPTATION (the real design work)

540x960 portrait stage, one thumb:

```
┌─────────────────────────────┐
│ rival gnomes: 3 mini boards │  <- tiny live boards, cards visibly flying out
│  (avatar + burrow count)    │
├─────────────────────────────┤
│      FLOWER BEDS (8)        │  <- shared center, 2 rows of 4
│   [1♣][3♠][ ][ ]            │
├─────────────────────────────┤
│ [row][row][row]  [burrow]   │  <- your three rows + burrow, big cards
│        [wheelbarrow]        │  <- tap to flip 3
└─────────────────────────────┘
```

- **Drag** a card to a bed or row; **tap** a card to auto-play it to the first
  legal bed (the speed move — Nertz veterans play by tap). Both always work.
- Cards ≥48px rendered at 375x667 (measure RENDERED px, scaled stage rule).
- Rival plays animate INTO the beds — you see the red-hat gnome's 4♥ fly in
  and land on your 3♥ bed a half-second before you got there. That sting is
  the whole game.

## AI RIVALS — fairness is the design

No peeking, no manufactured difficulty. Each AI gnome runs the same
information a human sees and a **reaction-time model**: scan interval + spot
delay + a fumble chance, all per-difficulty.

| Difficulty | Scan every | Spot-to-play delay | Fumble (misses a play) |
|---|---|---|---|
| Seedling | 2.2s | 1.4-2.0s | 25% |
| Sprout | 1.5s | 0.9-1.4s | 12% |
| Blossom | 1.0s | 0.5-0.9s | 5% |
| Wild Gnome | 0.7s | 0.3-0.6s | 2% |

Tuning by simulation, not by eye (Petal Match law): headless sim plays N=10k
rounds per tier, target = human with median reaction times beats Seedling
~85%, Sprout ~65%, Blossom ~45%, Wild Gnome ~25%. Rubber-banding: NONE.

Each rival gnome is a CHARACTER (art below) with a personality expressed
through the model — e.g. one hoards Burrow plays, one dumps Wheelbarrow fast.
Personality changes flavor, never information access.

## MODES

1. **Match** — you vs 1-3 AI gnomes, first to target score. Core mode.
2. **Solo Sprint** — no rivals; empty the Burrow against the clock, par times
   per level. The practice/onboarding mode, and the daily-eligible shape
   later (daily kit is PARKED by Stephen — build nothing daily now, just
   don't design against it).
3. **2P one device** (stretch, ship later) — top/bottom split, beds in the
  middle, tablet-friendly. Real Nertz chaos at the kitchen table.

## ROUND FEEL

- Rules-before-play gate (house standard), one screen, then a 3-2-1-GO.
- End of round: slow-motion replay of the winning "GNOME!" card + score tally
  with the same tally-tick + gleam grammar as the rest of the fleet.
- No timers ticking against you in Match mode — the PACE is the pressure.

## ECONOMY + FLEET STANDARDS (all house rules apply)

Sunbeams capped 30/day/game via the standard SDK. Feedback fab, SWS_EXIT,
own manifest + unique id + real-art icons, og card, portal card + aliases,
one-sentence description, no em-dashes in player copy, easily readable
game-styled fonts, visualViewport sizing, buildstamp.

## ART (sheet list — the doc goes to 012Assets only after greenlight)

1. **Gnome rivals sheet** — 4 characters x (idle, reach, play-slam, fumble,
   celebrate, sulk). Full pose sets per the animation law, one character per
   sheet.
2. **Card faces** — 4 suits x 1-10. Suits proposal: Mushroom, Sunflower,
   Watering Can, Ladybug (Stephen's call). Big centered numeral, suit art
   behind — readable at 60px.
3. **Card back + table** — garden table surface, bed markers, burrow mound.
4. **Celebration burst + "GNOME!" splash.**
Style: claymation-adjacent cute, matches the Hues/Blobworks warmth. All
generated, never claimed hand-painted.

## OPEN STEPHEN CALLS (blocking build)

1. **Name** (see legal line — working title flagged in buildstamp regardless).
2. Suit themes + zone names (proposals above).
3. Match target score default (75 proposed).
4. Greenlight to build v1 = Match + Solo Sprint, AI at 4 tiers, placeholder
   geometric cards so gameplay is provable before art spend.
