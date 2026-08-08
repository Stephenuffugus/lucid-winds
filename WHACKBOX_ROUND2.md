# Whack Box, the next wave
# Brainstormed 2026-08-08 for Stephen, who asked for more party titles that are
# basically text, so we can skin them however we like.
# Working names throughout. Stephen names things.

---

## THE ONE YOU REMEMBERED

You described "guess what percentage of whatever was whatever, and if you were
within a range you got points". That is **Guesspionage**, Jackbox Party Pack 4,
and it is widely held to be the best thing in that pack.

⛔ **We already have half of it and you should know why.** Firefly Futures is the
room generated version: you answer about yourself and the room bets on how many
of you said yes. The panel picked that shape deliberately, because Guesspionage
runs on a static survey database and a room generating its own data beats a
static database every time it is played.

⭐ **But the half we are missing is the better half**, and here is the thing that
makes it work for us. Guesspionage asks about a survey of strangers. We can ask
about **the world**, which is free, verifiable, and endlessly renewable:

> What percentage of the human body is water?
> What percentage of the world's people live in the northern hemisphere?
> What percentage of a cloud is actually water?

Same feeling, same "ooh, I said 60" energy, and every answer has a source we can
check. **We never invent a statistic.** That is the difference between a bank we
can defend and a bank that is quietly made up, and it is not a close call.

---

## THE SHORTLIST

Scored the same way the first panel scored: originality, party energy, content
feasibility, build feasibility, cozy fit, out of 50.

### 1. WIDE MARGIN (46/50) — build this first
- **Hook:** Everyone guesses a percentage. The truth slides in. Nobody is ever
  completely wrong, only further away.
- **Loop:** A question with a real percentage answer appears. Everybody drags a
  dial from 0 to 100 at the same time, so there is no downtime and no waiting
  for one person. The big screen shows every marker on one number line in each
  player's colour, then the true answer slides in and the line rearranges itself
  into a scoreboard.
- **Why it beats the original for us:** simultaneous guessing means eight people
  all act every round instead of one guessing while seven watch. And a number
  line of coloured markers is the best ten foot display in the whole pack.
- **Scoring:** distance based, so being close always pays something. Within 3 is
  a bullseye and pays double. Nobody scores zero for a thoughtful guess, which is
  the entire charm of the format.
- **Content:** percentages with a real source. Our existing generate then
  adversarially verify pipeline is already exactly the right tool.
- **Skin:** a moonlit dial. Almost no art.

### 2. BEARING (44/50) — the sleeper, and the cheapest content in the pack
- **Hook:** One of you can see the target. The rest have only a word.
- **Loop:** A spectrum runs across the big screen between two opposites, say
  COZY on the left and THRILLING on the right. One player secretly sees a hidden
  target somewhere along it. They say ONE WORD OUT LOUD, and everyone else moves
  a pointer to where they think the target is. Score by how close the room lands.
- **⭐ THE UNLOCK, and it opens up a whole genre for us:** the clue is SPOKEN. Our
  house rule is that player TEXT never reaches a screen, and speaking never
  touches a screen at all. So the richest, funniest input a person has is
  available to us with no moderation surface whatsoever. This is the door into
  every good party game we thought was closed.
- **Content:** pairs of opposites. That is it. A hundred pairs is an evening's
  writing and lasts forever, because the fun is the room, not the bank.
- **Ancestry:** this is Wavelength, which is a very good board game and not a
  Jackbox title, so it is also a lane nobody else in the free web space occupies.

### 3. THE UNDERSTUDY (39/50) — Role Models, made kind
- **Hook:** The room quietly decides who each of you actually is.
- **Loop:** A set of roles appears, one per player: THE ONE WHO PACKS THE NIGHT
  BEFORE, THE ONE WHO FEEDS EVERY CAT THEY MEET. Everybody privately assigns
  every player to a role. You score for matching the room's consensus, not for
  being right, because there is no right.
- **⚖ THE FLAG, and it is real:** this genre can turn into a room ganging up on
  one person. Our version only ever uses warm roles, and there is no role anybody
  would be hurt to be given. If we cannot write a hundred roles that all pass
  that test, it does not ship. That is a content decision, not a code one.
- **Content:** role lists. Cheap.

### 4. THE LONG WAY ROUND (36/50) — Blather Round, structurally safe
- **Hook:** Describe a thing using only the words you are given.
- **Loop:** One player gets a secret thing. They build a clue by TAPPING words
  from a small supplied vocabulary, like "it is a kind of ___" and "it is bigger
  than a ___". Everyone else guesses from a list. The constraint is the comedy.
- **⭐ Free text safe BY CONSTRUCTION**, not by moderation: every word on screen
  came from us. This is the design the Night Herbarium wanted to be.
- **⚖ The catch, honestly:** the vocabulary IS the game, and a bad vocabulary is
  a bad game. This is the most design sensitive title on the list and should not
  be started until the two above are done.

### 5. LAST ORDERS (31/50) — parked, and here is why
Push the Button style social deduction: some of you are not human, tests get run,
the room votes. Superb genre, and wrong for us right now. It needs a room that
already trusts each other, it turns on accusation, and the cozy studio voice
fights the format the whole way. Revisit if the pack ever wants an edge.

---

## KILLED ON ARRIVAL, so nobody re-pitches them
Anything whose core loop is a player TYPING something other people read. That is
Quiplash, Fibbage, Survive the Internet, Job Job, Dictionarium, Tee K.O. and
Split the Room. It is not squeamishness: a screen showing a stranger's typed
sentence to a family is a moderation problem we cannot staff, and one bad line
in front of somebody's eight year old is worth more than the whole feature.

⭐ **But note what BEARING proves:** the rule is about text on a screen, not about
players being funny. Spoken clues are wide open, and that is where the next few
good ideas are going to come from.

---

## ORDER, and what it costs

1. ~~**Wide Margin**~~ **BUILT 2026-08-08** and driven to podium. Slug
   `widemargin`. Bank started at 34 hand checked figures with a verification
   workflow expanding it.
2. ~~**Bearing**~~ **BUILT 2026-08-08** and driven to podium. Slug `bearing`,
   90 spectrum pairs. The spoken clue works exactly as argued: nothing is typed,
   sent, stored or displayed anywhere in it.
3. **The Understudy** — only if the warm role list survives its own audit.
4. **The Long Way Round** — after the first two, and only with real design time.

Every one of these is text and a dial. No art is on the critical path for any of
them, which is the opposite of Same Soil's 720 illustrations, and it means they
can be skinned later without touching a line of logic.
