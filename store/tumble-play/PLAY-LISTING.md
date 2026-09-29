# TUMBLE: Sock Sorting, Google Play listing copy (rewritten 29 Sep 2026 against the live build 20260924c)

The 23 Sep copy predated four builds (20260923l the submit build, 20260924a and 20260924b his two rounds of test notes,
20260924c the deck). A read only check on 29 Sep (four checkers, each refuted by a skeptic, workflow wf_fa79ef28-584)
found one false claim (Rush "nothing ever cuts you off": Endless runs on a clock), one stale number (128 room pieces,
now 117), an offline claim the radio breaks, and hard wrapped lines Play would keep. All fixed below, and every number
recounted from the live data (the table at the end says where each comes from). Studio voice: no dashes, no
exclamation points, no hype words, "Sky Wolf Studio" singular. His calls stand: the name, $0.99, 13 and over.

## App name (30 max)

`TUMBLE: Sock Sorting` (20). His call, 23 Sep. Google's guidance discourages ALL CAPS in a title unless it is the brand;
TUMBLE is the brand everywhere (page title, web manifest, launcher name), so it stays. `Tumble: Sock Sorting` is the
fallback if the review ever asks. **STEPHEN**, only if he wants to avoid the question.

## Short description (80 max)

```
A warm heap of socks. Find every twin, roll the pair, toss it in the basket.
```
(76 characters)

## Full description (4000 max)

Paste it as it is: one line per paragraph, a blank line between paragraphs (Play keeps newlines). 2,540 characters,
0 dashes, 0 exclamation points (measured 29 Sep).

```
The dryer opens and a real heap of socks tumbles onto the folding table. Dig through it with one thumb, find each sock's twin, roll the pair into a ball and toss it into the basket. Odd socks wait in the Odd Bin, and when a mate turns up in a later Load, the two of them meet again.

Laundry Day has no timer and nothing to fail. A miss stays on the table and costs nothing. Rush is the same heap with a stopwatch and a streak. Timed and Basket Balance set four times to beat, bronze to platinum, and never cut you off. Endless starts you with forty seconds, and every pair in the basket buys four more. Each day brings a Daily Laundry Day and a Daily Rush, the same Load for everybody, with one try at the Rush.

The everyday socks are made by the game, so every heap is a new one, and the Drawer keeps every design you have folded. Along the way you find 103 hero socks in themed packs, pennies, nickels, dimes and quarters in the wash that roll into a jar on the dryer, and thirty small things left in pockets, collected in sets on a little ledge under the window.

You rise through Sorter levels just by playing. The levels and the bigger Load sizes bring hero packs free, seven of them by your fiftieth Load, and the rest open with Quarters you find in the wash.

Make the laundry room yours: 20 baskets, 15 dryers (a hotel laundry cart and an apartment chute among them), 117 pieces for the room, 10 ways to roll a pair and 9 trails for the toss. A cat can move in too, and picks a different spot each day: asleep on the dresser, stretched out on the towels, or pacing the rug under the table.

The radio plays eight original songs written for the game: the first from your first tap, the next with your first Load, three more with the bigger Load sizes, and the last three for a few of the Quarters you find. You choose which ones stay in the loop.

Everything is earned by playing. The Shop takes only the coins and lint you find in the wash, and nothing inside costs real money.

Made for one thumb and a quiet evening. Color vision modes for deuteranopia, protanopia and tritanopia, a pattern first option so lookalike socks never differ by color alone, a warm hands option that shows the sock in your hand extra large, and a reduce motion setting. Flicking is never required: a tap on the basket tosses the ball for you. Your save stays on your device and can be exported as a file.

No ads. No purchases inside the game. No account. The game plays offline once it has loaded; the radio needs a connection.

From Sky Wolf Studio.
```

## Release (Test and release, Production)

Release name `1.0.0 (1)`. Release notes (en-US), 143 of 500 characters, no dashes:

```
First release of TUMBLE. Find every twin in a warm heap of socks, roll the pairs and toss them in the basket. No ads, no purchases, no account.
```

## Price

$0.99 (his call, final 23 Sep). Nothing sold inside. The web copy on lucidwinds.com stays free.

## Category and tags

Games, Puzzle. Tags (up to 5, picked from the Console's own list, nearest names it offers): Puzzle, Casual, Relaxing,
Single player; add Offline only if that tag exists. Only the Console shows which names are on its list.

## Screenshots and feature graphic

⛔ **RESHOOT PENDING (29 Sep check), before upload:**
- `play-shot-3.png` (the room at night): the dock shows the old "Door" button with a gear; live says "Shop" with a price
  tag (his 24 Sep note). It also shows the Enamel Camp Mug, retired 24 Sep.
- `play-shot-1.png`, `play-shot-2.png` and the feature graphic `feature-graphic-1024x500.png` (= `feature-C.png`):
  dealt under the old decoy rule, the "four of the exact same pair" clustering he called a fault on 24 Sep.
- The reshoot save must carry Loads played (`s.stats.loads` about 24) so the new level chip agrees with a Heavy Load.
- `play-shot-4.png` (the Drawer) and `play-shot-5.png` (the Pockets) still match live. Shot 5 shows the recipe drawn
  finds art he called "absolute trash": **STEPHEN**, keep it or drop it to four shots.
Play's rules, measured 29 Sep: icon 512 x 512 32 bit, opaque, 89.6 KB (ok); feature graphic 1024 x 500 no alpha; phone
shots 1080 x 1920, long side at most twice the short, at least 2 (4 or more for promotion).

## Where each number comes from (recount this table if a Tumble deploy lands before submit day)

| Claim | Source (live 20260924c) |
|---|---|
| 103 hero socks in themed packs | `data/heroes/*.json`: ten packs of 10 plus the Impossible 3 (Reunions at 10, 30, 75) |
| seven packs free by the fiftieth Load | `data/levels.json` pack rewards at 4, 7, 14, 25 Loads + `data/clothesline.json` Load size pegs at 5, 20, 50 (`src/economy.js` levelGifts, tierGifts); nine packs cost 10 Quarters, Plant Parents is free from the start |
| pennies, nickels, dimes and quarters, the jar | `src/coins.js` |
| thirty pocket finds in sets | `data/finds.json` (30 finds, 5 sets) |
| 20 baskets, 15 dryers, 117 room pieces, 10 rolls, 9 trails, 8 songs | `data/unlocks.json` categories basket 20, dryer 15, decor 117, ball 10, trail 9, radio 8 |
| the song ladder | `data/unlocks.json` radio: Sock It to Me from the start, Perfect Pair with the first Load, three with the Load sizes, three for 1, 2 and 4 Quarters |
| Rush: four medal times; Endless 40 s plus 4 a pair | `src/session.js` (medals, the clock for Timed and Basket Balance), `src/ui.js` rushHow |
| Daily Laundry Day and Daily Rush, one try | `src/ui.js` (mDaily, the daily sub, "One try, same Load for everyone.") |
| the cat's three spots | `src/room.js` CAT_SPOTS (dresser top asleep, towels belly up, the rug pacing), a different spot each day |
| the Shop takes only found coins and lint | `src/screens.js` "Lint and coins are game money, found in the dryer. Nothing here costs real money." |
| a tap on the basket tosses the ball | `src/play.js` tap(): a ball in hand plus a basket tap lobs it, in every mode |
| the radio needs a connection | `sw.js` never caches `/music/v1/tumble/*.mp3` (outside its scope) |
