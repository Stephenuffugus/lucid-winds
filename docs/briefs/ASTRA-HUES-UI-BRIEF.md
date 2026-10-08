# HUES: a UI review brief for an outside brain (8 October 2026)

You are being asked by the director of a one person game studio, Sky Wolf Studio. Your answer will be read by the
studio's planning model (Claude), turned into a build plan, and built by the studio's coding model. So: analyze what
is here and give us DIRECTIONS, ranked, concrete enough to build. Do not make art here and do not redesign the game's
rules. This is a user interface and experience review of ONE game.

**The game is HUES, at https://lucidwinds.com/satellites/hues/ (play it in a phone sized window, portrait).**
Ten phone screenshots of the current build are at https://lucidwinds.com/docs/briefs/hues/ and are described in
Part 2, so you can answer from this file alone if you cannot browse. Nothing else on that site is under review.

**HOW I NEED YOUR ANSWER: as ONE downloadable file** named `HUES-UI-<your model name>.md` (a `.docx` is fine if you
cannot make a `.md`). If you truly cannot attach a file, put the WHOLE answer inside one code block so it can be
copied in one tap. The file must end with the `json` block described at the end of Part 4.

Be specific and be brave. The weakest answer is a list of generic mobile UI advice ("use consistent spacing",
"add micro interactions"). The best answer names the screen, the element, the pixel sizes or words to change, the
reason a player would feel the difference, and how we would measure that it worked.

---
# PART 1. THE GAME IN TWO MINUTES

**What it is.** A target color appears. The player slides a thumb across a big saturation and value pad and along a
hue strip until the YOURS swatch matches the TARGET swatch by eye, then taps LOCK IT IN before a short clock runs
out. It is scored on real perceptual color difference (CIEDE2000, written ΔE below). It is quiet, fast, and unlike
anything else the studio makes. The director calls it one of the studio's strongest games.

**Three modes, one round shape.**
- **Daily Hue.** One puzzle a day, the same for everyone, five rounds, a streak, and a share card of five color
  squares (🟩 ΔE at most 3, 🟨 at most 8, ⬛ otherwise). Listed on Listdle, a directory of daily puzzle games.
- **Endless.** Levels that get faster and stricter, three lives, a stage every five levels that pays a coin bonus
  and a life. Four difficulties: Easy (16 s clock falling to 8 s, tolerance 44 ΔE falling to 16), Casual (11 s to
  4.5 s), Normal (9 s to 3.6 s, tolerance 30 to 8), Hard (7 s to 2.7 s, tolerance 26 to 6).
- **Versus.** Pass and play, two players on one phone, five rounds each.

**Scoring, so you know what the numbers on screen mean.** Match percent = exp(−ΔE / 72) × 100. Base points =
accuracy squared × 700, where accuracy = 1 − ΔE / tolerance. Locking in at all pays +40. A dead on match (ΔE inside
a fine margin of about 3) pays a precision bonus up to 240, and locking in fast pays a speed bonus up to 300, gated
on accuracy. A timeout keeps 70 percent of base and forfeits every bonus. Labels shown to the player: bullseye
(ΔE at most 1.5), very close (4), close (10), otherwise "off".

**Economy, all cosmetic.** Coins = round total ÷ 120. First daily clear pays 20 + 3 × streak. Seven daily goals pay
25 to 70 coins. A Border Shop sells eight CSS frames for the two swatches: Hairline (free, equipped by default),
Bevel 80, Frost 180, Brutalist 240, Gold Leaf 350, Neon 420, Deco 550, Prism 900. Separately, 112 PAINTED frames
already sit in the game's folder unused (`borders/pack/`), which is the single biggest piece of ready art the UI
is not using. The game also earns the studio's shared currency (Sunbeams) through a small SDK; nothing is sold for
money and nothing should be.

**Tech, so your directions are buildable.** One 89 KB `index.html`, vanilla JavaScript, no framework, no build
step, installable as a web app, works offline. The picker is DOM (a gradient pad and a hue strip with a handle),
not canvas. Type: Instrument Serif for the HUES title, Hanken Grotesk for interface text, JetBrains Mono for
numbers. Palette: background #0a0a0c, ink #f3f1ec, dim ink #8d8a83, faint ink #54524d, hairlines #1e1e22. This game
has its OWN near black and cream look and may keep it; it does not have to wear the studio's sage and gold.

**Who plays it.** A grown adult on a phone, one thumb, often a minute at a time. The director's test device is a
Pixel 9 (412 CSS px wide); the narrowest phone we care about is 360 px wide.

---
# PART 2. WHAT IS ON SCREEN TODAY (ten screenshots, and what the studio already sees)

Shots are at https://lucidwinds.com/docs/briefs/hues/ . Names below are the file names. The notes under each are
faults the studio's planning model named after looking; we expect you to go PAST them, confirm or overrule them,
and find what we missed. Where you disagree, say so and why.

**412-1-menu.jpg (first boot, fresh save, 412 wide).** Title HUES in serif, tagline MATCH THE COLOR · BEAT THE
CLOCK, a row of seven color chips, three mode cards (Daily Hue #646, Endless, Versus LOCAL), an ENDLESS DIFFICULTY
segmented control, a TODAY'S GOALS card, then (below the fold) Border Shop, Music, How to play, Add to Home Screen,
All Sky Wolf games.
- A music unlock sheet ("CONGRATULATIONS, YOU UNLOCKED A SONG AND 1 MORE", with Play it now / Later) covers the
  bottom third of the menu on a FRESH save before the player has done anything. It is shared arcade chrome, not
  Hues, and on first boot it is false.
- The header mixes three accent colors in one row: a red question mark, a gold coin pill, and (on other screens)
  a mint green Equipped. No one accent owns the game.
- A round ladybug button (a feedback widget injected by the arcade) sits as an unlabeled circle beside the coins.
- The seven color chips are the only color on the screen and they mean nothing; the first screen has no place,
  no object, no identity beyond the webfont title.

**360-1-menu.jpg (same, 360 wide).** The ladybug widget floats OVER the TODAY'S GOALS card, covering the words
RESETS DAILY, with a stray ✕ above it. Everything else fits.

**412-2-rules.jpg (How to play overlay).** Four lines with emoji icons, a GOT IT, LET'S PLAY button. Clear. The
music pill ("♫ New song") stays on top of the dimmed background.

**412-3-daily-play.jpg (Daily, round 1 of 5, mid round).** ‹ Menu pill top left, coin count "0" top right, DAILY
#646, ROUND 1 / 5, a huge mono timer (7.7) over a bar, TARGET and YOURS swatches side by side, the pad, the hue
strip, then about 300 px of empty black, then LOCK IT IN pinned to the bottom.
- The "♫ New song" pill overlaps the left end of the LOCK IT IN button, the primary action of the whole game.
- The bottom third of the screen, where a thumb lives, is empty; the pad the thumb must work sits mid screen and
  the lock button sits far below it. The layout stacks top down and does not use the phone's height.
- The TARGET and YOURS labels are nearly invisible (faint ink on black).
- The timer is shown twice (digits and a bar). The coin counter is an unlabeled number.
- The swatches are bare rounded rectangles; the moment the whole game is about (two colors meeting) has no stage.

**360-3-daily-play.jpg.** Same at 360 wide; less dead space, same overlap.

**412-4-daily-result.jpg (after locking in, round 1).** A result sheet rises over the play screen: "45% match ·
off", a bar, Base accuracy +0, Lock-in bonus +40, a big +40, THIS RUN · 1 ROUND with a TARGET / YOURS pair, and
NEXT ROUND → pinned at the bottom.
- "45% MATCH · OFF" is printed twice, once above the pad and again as the sheet's headline.
- The top of the pad peeks out above the sheet, which reads as unfinished rather than as a sheet over a scene.
- The music pill now overlaps the NEXT ROUND button.
- A miss still shows +40 ("Lock-in bonus") with Base accuracy +0, so a bad round reads as a reward for pressing
  a button. That is a scoring rule, the director's call, but the PRESENTATION of a miss is yours to judge.
- Nothing on this screen shows the player WHICH WAY they were off (too dark, too dull, wrong hue), which is the
  one thing that would make the next round better.

**360-4-daily-result.jpg.** Same at 360.

**412-6-shop.jpg (Border Shop).** Back, a script "Shop" title, a sentence, a two column grid of frames previewed on
a purple and orange split swatch, name, one line, price pill. Readable and calm.
- The preview colors (purple, orange) belong to no screen in the game.
- Equipped is mint green; prices are gold; the rest of the game is cream. Three systems.
- Eight CSS frames are for sale while 112 painted frames sit unused on disk.

**412-7-endless-play.jpg (Endless, Normal, level 1).** Same play layout with ENDLESS · NORMAL, LEVEL 1, "Stage 1
· clear at LV 5", a ••• button at the right with no label. No lives are visible on screen although the mode has
three.

**412-8-versus.jpg (Versus, P1, round 1).** Same play layout with "P1 · VERSUS". Nothing tells the players how the
hand off works or whose turn is next until it happens.

**What we could not shoot.** The share card (a PNG of five target versus yours pairs), the game over screen in
Endless, the versus hand off, and the goals card after progress. Say what you would want to see there.

---
# PART 3. THE BAR EVERY DIRECTION IS HELD TO

1. Portrait, one thumb. Every tap target at least 48 CSS px as rendered at 360 and 412 wide.
2. Readable at arm's length: body text never under 0.7 rem, labels never fainter than the dim ink unless they are
   truly decorative.
3. No dashes of any kind in anything a player reads (the studio writes "pass and play", not "pass-and-play").
4. Nothing is sold for money inside the game. Directions that add purchases will be discarded.
5. The game stays one file of vanilla JavaScript with no framework. Directions must be buildable that way.
6. The game is COLOR matching, so every direction must also say what it does for a color blind player (about 8
   percent of men). A direction that only works for full color vision should say so.
7. Generated art is never called hand painted. Do not ask for art here; ask for it by name in the art list at the
   end if a direction needs it.
8. The studio measures. A direction should say how we would know it worked (a number, a screenshot comparison,
   a count of taps, a time to first lock in).

---
# PART 4. WHAT I WANT BACK, IN THIS ORDER

**4.1 The first ten seconds (5 to 8 directions).** Boot to first lock in. Identity, the menu's hierarchy, what a
new player should see first, what should be below the fold, and what should never appear on a fresh save. If you
think the mode cards, the difficulty control and the goals card are in the wrong order, say the order.

**4.2 The play screen (8 to 12 directions).** This is the game. Thumb zone and reach, the vertical layout at 412 and
360, where the pad, the strip and the lock button should sit, the size and treatment of the two swatches, how the
clock should read without shouting, how the frames (painted or CSS) should present the two colors, what the
TARGET and YOURS labels should become, and what should animate at lock in. Give pixel sizes. If you would move
LOCK IT IN, say where and why. If you would make the pad taller than wide, say the ratio.

**4.3 The result moment (5 to 8 directions).** How a round's verdict should land: one headline, not two; what a
miss should say; whether and how to show the DIRECTION of the miss (hue, lightness, saturation) in a way a color
blind player can also read; the sheet's relation to the scene behind it; the run ledger; and the share card.

**4.4 Menu, shop, goals (4 to 6 directions).** The shop's preview colors and states, how 112 painted frames could
be surfaced without a 56 row grid, the goals card, the Versus hand off, where lives live in Endless.

**4.5 The color and type system (3 to 5 directions).** One accent, one state color, one metal, named with hex
values; type sizes and weights per role; what the three fonts should and should not be used for.

**4.6 Three things to cut.** Elements, words or moments the game is better without.

**4.7 Three references.** Apps or games whose handling of ONE specific moment (a verdict sheet, a one thumb
picker, a daily share) we should study, with the moment named. No general praise.

**Format for every direction**, exactly:

```
### D<nn>. <short name>
Screen: <menu | rules | play | result | shop | goals | versus | share | all>
Now: <what is there today, one or two sentences>
Direction: <what to change, concrete: sizes, positions, words, states>
Why: <the player's experience that changes, one or two sentences>
Color blind: <what this does for a player who cannot tell the hues apart>
Effort: <S | M | L> (S under two hours, M a day, L several days)
Check: <how we would measure it worked>
```

**End the file with this JSON block** (one entry per direction, same ids as above):

```json
{"game":"hues","model":"<your model name>","date":"2026-10-08",
 "directions":[{"id":"D01","screen":"play","effort":"M","title":"...","summary":"one sentence"}],
 "cuts":["...","...","..."],
 "art_wanted":[{"file":"<name>.png","size":"<w>x<h>","what":"one sentence"}]}
```

---
# PART 5. DATA (skim; here so nothing you say is a guess)

**Screens and their element ids.** menu (`#menu`, mode buttons `data-mode=daily|endless|versus`, `#diffSeg`,
`#missionList`, `#shopLink`, `#musicLink`, `#rulesLink`, `#installLink`, `#exitLink`), rules overlay (`#rulesOv`,
`#rulesGo`), play (`#game`: `#modeLabel`, `#levelVal`, `#goalSub`, `#timeNum`, `#timerBar`, `#targetFrame`,
`#targetSwatch`, `#yoursFrame`, `#yoursSwatch`, `#pad` with `#padHandle`, `#strip` with `#stripHandle`, `#lockBtn`,
`#lives`, `#scoreVal`, `#gMenu`), result sheet (`#result`: `#resTitle`, `#resKicker`, `#resSub`, `#breakdown`,
`#resScore`, `#resSquares`, `#resStreak`, `#resChips`, `#resCoins`, `#resActions`, `#bdNext`), run history
(`#shScroll`, `#shRunList`, `#shStage`, `#shTotal`), share modal (`#shareModal`, `#shareImg`, `#shareImgBtn`,
`#shareTextBtn`, `#shareSaveBtn`), shop (`#shop`, `#shopGrid`, `#shopCoins`, `#shopBack`), toast (`#toast`),
vignette (`#vignette`).

**Tuning constants (verbatim from the code).**
```
pctScale 72 · closeness {bullseye 1.5, veryClose 4, close 10} · perfect ΔE 1.5
curves: easy {t0 16, td 0.10, tmin 8, c0 44, cd 0.6, cmin 16}
        casual {t0 11, td 0.16, tmin 4.5, c0 34, cd 0.9, cmin 11}
        normal {t0 9, td 0.20, tmin 3.6, c0 30, cd 1.2, cmin 8}
        hard {t0 7, td 0.28, tmin 2.7, c0 26, cd 1.6, cmin 6}
   (time per round = max(tmin, t0 − level × td) seconds; tolerance = max(cmin, c0 − level × cd) ΔE)
score: baseWeight 700, lockBonus 40, precWeight 240, speedWeight 300, fineFactor 0.28, fineFloor 3, timeoutMult 0.7
tiers: gold 3, green 8 (the share squares)
coinsPerPoint 120 · lives 3 · stage every 5 levels, bonus 15 × stage, +1 life · dailyBonus 20 + 3 × streak
roundsPerSet 5 (Daily and Versus)
borderPrices: hairline 0, bevel 80, frost 180, brutalist 240, gold 350, neon 420, deco 550, prism 900
missionRewards: score4000 40, score7000 70, level10 45, perfect3 35, daily 30, rounds20 25, coins60 30
timer feedback at 50 percent (warn), 33 percent (danger), 22 percent (bad) of time remaining
target color generation: saturation 0.42 to 1.0, value 0.36 to 0.94; the player's starting color is a different random
```

**Art the studio already listed as wanted (5 Sep 2026), for your reference, not for you to make.**
`bg-hues-540x960.jpg` a painted pigment grinding bench in near black with a warm lamp from top left, low contrast,
heavily vignetted, so the two swatches stay the only saturated things on screen · `frame-swatch-default-320x220.png`
a painted brass and cream 9 slice frame for the two swatches · `picker-plate-360x300.png` a painted wooden palette
board to sit behind the pad · `hues-wordmark-420x140.png` a serif HUES wordmark with pigment bleed and a thin gold
rule. Agree, disagree, or replace these; say which.

**What the studio's own automated audit says about this game.** Rank 128 of 186 games by art impact, "decent",
impact 4 of 5, effort M. One code flag: a saved value is read without validation. No way home fault (it has its
own exit to the arcade). Installable, offline, earns Sunbeams.

Thank you. Be concrete, be fair, and tell us the thing we are too close to see.
