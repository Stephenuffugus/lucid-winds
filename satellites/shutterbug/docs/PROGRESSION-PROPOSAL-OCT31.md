# Shutterbug: the goal and the ramp (progression spine, for Stephen's approval)

31 Oct 2026, read only study. No worktree was edited. Scratch: /home/codespace/sb-drafts/sameness/progression/
(measure.js, spots.js, live-cap99.html and levels-cap99.html, which are copies of the page with the enemy caps lifted).

Stephen, 31 Oct, about 21:45 UTC: "I'm not like collecting or building towards anything ... no like real goal at the
end. So maybe we need a way to like level up or ramp up."

## 1. What is really going on

The design already has a goal, a ramp and a long game. **None of it is built.** sb-m1-3 is a free play loop of single rooms
that never end and never get harder:

- **No sitting goal.** House runs (DESIGN 8, T2.8) are not built. The save has `run: null` and nothing writes it. The shell never
  passes `lastRoom`, so no room is ever room 5. The features pick a boss cluster when `opts.lastRoom` is set
  (index.html:2823), and the sim's state schema has a `boss` slot (FIELDS, index.html:3563). But `s.boss` is always null:
  there is no boss sim, no intro, and the beacon is never held dark.
- **No ramp.** Every room is built with the same caps (CAP_ENEMY 4, CAP_ELITE 1, index.html:482). Only the first room
  ever is softer (FIRST_ROOM_MAX_FODDER 2).
- **Nothing to spend on.** Dead pixels are earned at the clear (`SB.Wallet.earn`, index.html:5358) into `save.doc.dp`. No
  screen spends them. The Darkroom (T2.9) and blueprints (T2.6) are not built. `collection`, `pool` and `unlocks` sit empty in
  the save's defaults (index.html:927).
- **"Anvil Boots and the Boomerang over and over"** has a one-line cause: `WEAPONS_BUILT: ['J1', 'D1']` (index.html:502).
  The kept gear (KEEP_GEAR) fills both slots within two chests. After that every chest pays 15 DP and draws nothing
  (WEAPONS-V1 6.2). Weapons step 2 (sb-weapons-2, tonight) adds J2 to J8 to the **jump** slot only. **The dive slot stays
  Anvil Boots alone until step 3**, so half of this complaint survives tonight's lane.

### Measured on the painted room corpus (60 seeded models plus Astra's sample room; no real photos exist)

The models are /home/codespace/sb-drafts/sameness/claude/grids.json, made by the sibling study's room.js through the
page's own default crop box and the capture oracle. /home/codespace/sb-drafts/sameness/photos/ was **empty** when I
looked, so none of Stephen's photos were run.

Command: `cd /home/codespace/sb-drafts/sameness/progression && nice -n 10 node measure.js` (live = sb-m1-3, levels =
the sb-levels worktree as it stood at 2eff8e42c; both copies byte-compared equal to their worktrees).

| | live sb-m1-3 | sb-levels |
| --- | --- | --- |
| model rooms that build at the default crop | **3 / 60** | **26 / 60** |
| Astra's sample room | refused | refused |
| biomes of built rooms | attic 3 | attic 25, frost 1 |
| enemies per built room (cap 4) | 1, 2, 4 | {0:4, 1:10, 2:7, 3:2, 4:3}, mean 1.62 |
| enemy spots the photo offers with the caps lifted | same | {0:4, 1:7, 2:10, 3:1, 4:2, 5:1, 12:1}; >= 5 spots in **7.7%** |
| rooms with an elite | 2 / 3 | 18 / 26 |
| trap field | 0% | **0%** |
| pocket | 67% | 65% |
| as room 5: a saturated cluster >= 12 (a real boss body) | 3 / 3 (16, 38, 40 cells) | **73.1%** (sizes 12 to 108; median 24); the other 26.9% get the fallback clay boss |
| specks per room | | mean 0.65 |
| DP per room if everything is taken (chest 15, speck 4, fodder 3, elite 10) | | median 29, min 15, max 38 |

Command: `nice -n 10 node spots.js` (levels page). Cells that could legally take an extra enemy (open, outside the 3 cell
ring around every ascent standing cell, outside 2 of spawn): flying kinds min 238, median 434; standing kinds **min 9,
median 24**. 0 of 26 rooms have fewer than 4 standing cells.

**What the numbers say for a ramp.** In a real room the cap is not the limit. The photo's saturated clusters are, and they
offer a median of 2 enemy spots. Raising CAP_ENEMY by room index would change nothing in 92% of rooms. Every room does have
the space for more enemies (24 standing cells at the median). So **a ramp has to place enemies of its own**, under DESIGN 7's
placement rules, and lean on elites and HP. Trap fields never appear (0 of 26), so traps cannot carry a ramp either unless the
trap detector is loosened. That is a separate question.

**The lead's reading for this question (grey rooms get the default spread, the same every time): confirmed for enemies and
biome.** 25 of 26 built rooms are Attic, so every enemy is a moth. Mean 1.6 enemies per room, 15% of rooms have none, and
there are no traps. The colour fix (another study) would raise saturation and so the enemy count and biome spread. A ramp that
sets enemy **floors** by room index still matters after that fix: it is what makes room 4 harder than room 1 whatever the photo
holds.

## 2. The proposal: DESIGN's own spine, built in a different order

### 2.1 The sitting: a house run with a ramp and a guardian (the goal)

DESIGN 8 already answers "a goal at the end": five rooms, death ends the run, room 5 has the boss, and a clear unlocks things.
The ramp is the piece DESIGN does not number. That makes it a DESIGN redline and needs your call.

**The ramp table** (house room index r; room 1 is exactly today's rules, so the goldens and share codes never move):

| | Room 1 | Room 2 | Room 3 | Room 4 | Room 5 |
| --- | --- | --- | --- | --- | --- |
| enemy floor (ramp fodder added up to it) | photo only | 2 | 3 | 4 | boss plus photo fodder |
| enemy cap (Ember +1) | 4 | 4 | 4 | 5 | 3 fodder plus the boss |
| elites | photo only (cap 1) | photo only (cap 1) | **1 guaranteed** (the fodder farthest from spawn is promoted when the photo gives none) | 1 guaranteed, cap 2 | the boss |
| fodder HP | 1x | 1x | 1x | **1.5x** (6 quarters: a 1 damage weapon needs 2 hits at Focus 0 and 1 hit at Focus 2) | 1x |
| enemy move speed | 1x | 1x | 1.25x | 1.25x | 1x |
| hearts at entry | full (4) | carried, +1 at the doorway | carried, +1 | carried, +1 | carried, +1 |

On the 26 built models the floors lift 14 rooms in room 2, 21 in room 3 and 23 in room 4, out of 26. That comes straight
from the cap 4 enemy histogram above: 4+10 rooms are below 2, 21 below 3, 23 below 4. A ramp enemy goes where an extra moth
would go today: a seeded standable cell (a flying cell for moths and jellies) that keeps DESIGN 7's rules (outside 2 of spawn,
outside 3 of the ascent, never on its safe cells). Every built room has at least 9 such standing cells. The enemy kind stays the
biome's kind.

Why HP in room 4: it is the first place where scrolls and Focus or Vigor visibly matter (WEAPONS step 5). It also reads as
"tougher" without more bodies on a small screen.

Why carried hearts with +1 at each doorway: attrition is the cheapest ramp there is, and it makes a heart scroll a real
choice. This is your call (option: refill every room, as the free play sitting does).

**Room 5, the guardian.** DESIGN 7.1's boss: in this corpus, 73% of rooms 5 have a saturated cluster of at least 12 cells
(the real body). The other 27% get the fallback clay boss (5x4, 20 HP, the Attic moveset). Cluster HP is the cell count, and
the corpus runs from 12 to 108 cells. A 108 HP boss against a 1 damage Boomerang is a slog, so the HP needs a cap
(proposed 40). That is a DESIGN redline and your call.

**Free play** stays as it is: one room at a time, x0.5 DP, the sitting keeps the gear, no ramp. It is the relaxed mode, and
it is what a share code opens. The house is the mode with a goal.

### 2.2 The long game: something to collect

All of this is DESIGN 9.3 and 9.4, unbuilt:

- **Blueprints** drop in rooms: the single brightest speck, 25%. You carry them, lose them on death in a house, and they are
  banked at each doorway (T2.6). They are the "collecting".
- **The Darkroom collector** (T2.9), at doorways and on the title: develop banked blueprints into the **collection** for
  30 / 100 / 300 DP by tier (Q52's table), and load up to 4 per slot into the drop pool. Proposed look: the collection as a
  **contact sheet**, 24 frames in three strips of 8 (jump, dive, charm), each frame dark until developed. This is the
  visible "building towards" screen. A full sheet is the long goal.
- **Unlocks** (9.4): a starting loadout pick (200), Daily Room (first house clear), Negative (400), Double Exposure (600),
  Open House (600, 8+ rooms at x1.5).
- **The economy at those prices, from the corpus:** a house clear is about 5 x 29 + 60 (boss) = **about 205 DP** at x1. Free
  play is about 14 DP a room. Developing all 24 weapons costs 6x30 + 9x100 + 9x300 = 3,780 DP, and the four unlocks
  1,800 DP, so **5,580 DP is about 27 house clears** (about 385 free play rooms). These are placeholders. T2.12's economy log
  retunes them.

### 2.3 What the player sees (COPY law: plain words, no dashes, no exclamation marks)

1. **Title** (after the first clear; DESIGN 5.3 keeps the first screen to two buttons): `Start a house` first, with `Free
   play` and `Continue the house` (when a run is saved) below it. A small line: `Houses cleared 2`.
2. **In a room**, the top strip's room name reads `Room 3 of 5`.
3. **The doorway card** (replaces the clear card in a house): `Room 3 cleared`, `Banked 31 dead pixels`, `Banked 1 blueprint`,
   then `Room 4 is tougher`. Buttons: `Shoot the next room`, `Choose a photo`, `Use a recent room`, `Darkroom` (once T2.9 is
   built), and `Leave the house` (saved; resume from the title). `Use a recent room` is DESIGN 8's "repeats allowed". It stops a
   refused crop from blocking a run, which matters given tonight's crop complaint.
4. **Room 5**: on entry the boss's cells are outlined in their photo place for 2 s. The strip reads `The last room`, and the
   beacon stays dark: `Beat the guardian to light the exit`.
5. **The house clear card**: `House cleared`, `5 rooms, 214 dead pixels`, then `New: Daily Room` and the cosmetic (a frame
   style). Buttons: `Darkroom`, `New house`, `Title`.
6. **Death in a house**: `The house is lost`, `Lost 40 dead pixels and 1 blueprint` (Fixer aside). Buttons: `Retry House` (the
   same rooms so far, a fresh bug; the rest still to shoot), `New house`, `Title`.

### 2.4 The smallest first slice (makes the next playtest feel like a run with a goal)

**Slice 1, "the house"**, in two build lanes, landing on top of sb-levels (with the live page refusing 57 of 60 model rooms, a
five room run cannot even be played before the levels rule ships):

- **Lane A (about 135 BUILD-PLAN minutes):** T2.8's run state (save `run`, after every room, resume, `Continue the house`,
  Retry House, the doorway card without the Darkroom), `Room n of 5` in the strip, the ramp table above (floors, the room 3
  promotion, room 4 HP, the doorway heart), and `Use a recent room`.
- **Lane B (about 105 minutes):** the guardian as the **fallback clay boss in every room 5** (T2.10a's fallback branch: the
  5x4 sprite, 20 HP, the Attic moveset shedding 3 moths every 4 s, the 2 s intro, the beacon dark until 0 HP, 60 DP, the house
  clear flag) plus T2.11's three arena assertions for it. Plus the house clear card with Daily Room's flag set (the mode itself
  waits until it is built; the card names only what exists).
- In the same window, but not this slice: **weapons step 3** (the dive pool, so the dive slot stops being Anvil Boots
  forever). It is already a planned lane, and it is the other half of "the same weapons over and over".

**Order after slice 1:** (2) weapons step 3, the dive slot. (3) T2.6 blueprints plus T2.9 the Darkroom collector and contact
sheet: the long game, 2 lanes, 150 minutes. (4) The real cluster boss: T2.10a body and erosion, T2.10b the five movesets,
T2.11 arena for every cluster, 2 lanes, 180 minutes. (5) Weapons steps 4 and 5 (charms, stats and scrolls). (6) T2.12 the
economy log and price retune, then the M2 deploy. (7) Daily Room and the cosmetic.

### 2.5 Risk of each piece

| Piece | Effort | What it changes or breaks | Risk |
| --- | --- | --- | --- |
| House run state, doorway, resume, Retry (T2.8) | 1 lane | save `run` (already in defaults, no migration); title, clear and death cards (merge with sb-levels' capture and refusal screens) | medium: resume bugs lose a run; the `run` gate needs real play through `injectInputs` |
| Ramp table | part of lane A | features for rooms 2 to 5 only (room 1 bytes unchanged: the goldens, share codes and record v1 stay); a new opt `roomIndex` | medium: a difficulty spike the bot must still walk (H-bot on room 4 rules); a DESIGN redline |
| Carried hearts, +1 at doorway | small | hero state across rooms | low code, high feel: your call |
| Fallback boss everywhere (slice 1) | 1 lane | new boss sim on the existing `boss` field; shed moths need preallocated enemy slots (no allocation in step) | medium: every room 5 looks the same until step 4, but it is a real end |
| Blueprints plus the Darkroom (T2.6, T2.9) | 2 lanes | economy, the loaded pool replaces BUILT in the draw | high UI effort; prices unproven until T2.12 |
| Cluster boss (T2.10a/b, T2.11) | 2 lanes | boss per photo, erosion, five movesets, HP cap | highest: arena fairness on odd clusters; 108 cell bodies |
| Biome lean in the drop | small | the chest's one rng draw becomes weighted; armed goldens move | low code; invisible until the colour fix (25 of 26 rooms are Attic today) |

## 3. The lighter alternative: a bug level ("Film rank")

**What it is:** one persistent counter in the save. It rises with rooms cleared (+10), kills (+1), elites (+3) and house rooms
(+5). The title and clear card show a bar: `Rank 4, 30 to rank 5`. Milestones unlock things: a new weapon enters the drop pool
at ranks 2 to 9, +1 base heart at ranks 5 and 10, Negative at 12, and so on. It works in free play, which is what you play
today.

**Honest comparison:**

- *For it:* about 1 lane. No new screens beyond a bar and a "New: Spark Trail" line. No economy to tune, no boss. Every room
  you play moves a number.
- *Against it:* **it does not answer "no real goal at the end".** A bar gives progress, not an ending, and the run is still
  endless rooms. Only the house and its guardian give a sitting an end. It also creates a second progression that DESIGN 9.3
  does not have: rank would gate weapons where blueprints and developing should, so building the Darkroom later means retiring
  or reconciling it. Raw power from rank (hearts) also works against any ramp. And once maxed, it is done.
- *Hybrid, if you want the bar:* show lifetime DP earned as the bar on the title, as presentation only, with the Darkroom
  doing the unlocking. That keeps one economy.

**Recommendation:** DESIGN's route, slice 1 first. If you want something for the very next playtest that is smaller than slice
1, the bar alone (lifetime DP plus the contact sheet greyed) is a cheap teaser, but it is not the fix.

## 4. "Different weapons per biome": does a biome lean fit the loaded pool?

**Yes, as a weight inside the pool, never outside it.** DESIGN 9.3: "Developing never dilutes a run the player didn't choose."
A lean that only reweights what the player loaded (or BUILT, before the Darkroom) keeps that promise. DESIGN 9.2 already biases
scrolls by biome, so there is precedent. Proposed: each weapon has a home biome, and a weapon whose home matches the room
gets 2 tickets to everyone else's 1. With 4 loaded in a slot and one at home, the home weapon drops 40% of the time. Proposed
homes (your call):

- Attic: Boomerang, Tremor, Magnet
- Frost: Icicle, Shutter Snap, Thick Skin
- Deep: Pogo Spear, Skyhook, Tripod
- Overgrowth: Shield Kick, Halo, Lantern
- Ember: Spark Trail, Ember Stomp, Flashpan
- Neutral (1 ticket everywhere): Twin Darts, Flashbulb, Wide Lens, Pile Driver, Second Wind, Light Meter, Darkroom
  Discount, Fixer

**Caveat:** with 25 of 26 built rooms Attic today, a lean is invisible until the colour and biome fix lands. Build it after
that fix, not before.

## 5. Stephen's calls

1. The house as the mode with the goal: `Start a house` leads the title after the first clear, and free play stays flat.
2. The ramp table (a DESIGN redline): enemy floors 2, 3 and 4 in rooms 2 to 4, an elite guaranteed from room 3, fodder 1.5x
   HP and 1.25x speed in room 4.
3. Hearts carried through a house with +1 at each doorway (option: refill each room).
4. Slice 1's guardian is the fallback clay boss in every room 5 until the cluster boss lands (option: wait for the real boss).
5. Boss HP cap of 40 (DESIGN says HP = cell count; the corpus reaches 108).
6. The house clear cosmetic: DESIGN 8 promises one free, while 9.4 says cosmetics are Sunbeams only. Proposed: one free frame
   style for the first house clear.
7. Biome lean: 2 to 1 inside the pool, after the colour fix; the home table above.
8. DESIGN's route versus the Film rank alternative (recommended: the route).

## 6. What I do not know

- No real photos: every number is painted models (26 built on sb-levels, 3 on live). Real rooms may hold more saturation, more
  clusters and other biomes.
- The colour study's fix will change the saturated cell count, and with it enemies, bosses and biomes. The ramp floors are
  designed to hold either way, but the room 5 real-boss share (73%) will move.
- sb-levels was mid work (WIP autosave 2eff8e42c). Its final rule may change which rooms build.
- Nothing here was played. The ramp numbers and the boss HP cap are judgment, not playtest. T2.12's log and your thumbs
  decide.
- No board images were made for this question; every claim is a printed number.
