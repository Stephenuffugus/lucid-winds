# MAKING 186 GAMES FEEL LIKE ONE STUDIO — options, not a build

Written 2026-08-16 for Stephen and Jessie. **Nothing here is built.** It is the thinking that
should happen before anything is, because the wrong version of this makes the arcade worse.

Jessie's note, as relayed: *it is just a giant long list, it is kind of crap, and she wants
multiple pages you go through.* Stephen's: *186 games and they play none of them, because there
are too many. Ask people what they like and recommend.*

Both are describing the same failure from different ends. This is an attempt to name it
precisely, then lay out real options with what each one costs.

---

## 1. THE DIAGNOSIS

### The catalog, measured today

```
186 carded entries       119 satellite cards + 67 native /play/ games
162 a visitor can open   22 dev gated + 2 marked "soon" are not openable
114 of 119 have real art  5 satellite cards show only an emoji
22 dev gated              a visitor cannot open these at all
29 marked "new"           a sixth of the catalog claims to be new
categories, satellites:   action 45 · puzzle 30 · creative 14 · word 7 · card 6 ·
                          board 6 · party 4 · math 3 · dice 2 · pattern 1
categories, native:       puzzle 17 · card 12 · board 11 · creative 10 · pattern 7 ·
                          math 4 · word 4 · dice 3
```

### The actual problem is not the number

186 is an asset. Every one of them is free, opens instantly, and needs no account. That is a
genuinely rare thing and most studios would kill for it.

The problem is that **the storefront makes the visitor do all the work.** A person arriving
has to read names they have never heard, guess what each one is, and decide. Nothing on the
page reduces the number of decisions they have to make. So the honest reading of the current
home page is: *here is everything we have ever made, you sort it out.*

Three specific ways that shows up:

1. **Every shelf is the same shape.** Start Here, New, Made by the Studio, then category rows,
   then an A to Z wall. They are all horizontal rows of identical cards. Nothing about the
   layout says one of these matters more than another, so the eye treats them as one list.
2. **No shelf says WHY.** "Action, 45 games" is a filing cabinet drawer, not a recommendation.
   Compare "Two minutes, one hand, no reading" — same games, completely different invitation.
3. **The categories are the studio's words, not the player's.** Nobody has ever thought "I am
   in the mood for a pattern game." They think "I have five minutes and I do not want to think."

### What Jessie is really asking for

I do not read "multiple pages" as literal pagination. Pagination is the same list with a
next button; it does not reduce anything. I read it as: **stop giving me one endless scroll,
give me places.** A room you walk into, not a spreadsheet you scroll. That is a stronger idea
than pagination and it is worth building to that rather than to the literal request.

---

## 2. THE OPTIONS

Six directions. They are not mutually exclusive, but they cost very different amounts and
some of them can be wrong.

### OPTION A — The picture quiz (Stephen's idea, sharpened)

First visit shows nine game thumbnails and one instruction: **"Tap any that look fun."**
No categories, no words, no wrong answers. Three taps is enough signal to build a shelf.

**Why pictures and not questions.** "What kind of games do you like?" asks a person to describe
themselves in your vocabulary, which they do not have. Tapping a picture is instant, honest,
and the answer is about the actual thing. It also has a zero-effort exit: tap nothing, hit
skip, and you get the normal arcade.

**What it produces.** A personal shelf at the top, headed with a reason: *"You liked things
with a lot going on. Start with these."* And crucially the shelf keeps updating after they
play, so it is not a one-time gate but a thing that gets better.

**Cost:** medium. Needs a tag layer richer than the current 10 categories (see §3), a picker
screen, and a scorer. The scorer can be very dumb and still work.
**Risk:** a wall between a stranger and the games. Must be skippable in one tap and must
never appear twice.

### OPTION B — Mood doors instead of categories

Replace the category tab bar as the primary navigation with three or four **doors**, phrased
as the player's own situation rather than as genres:

```
  I have two minutes          →  short, one hand, no reading, instant restart
  I want to think             →  puzzles, deduction, building
  I want to make something    →  creative tools and toys
  Someone is with me          →  party, two player, pass the phone
```

Each door opens a page with about a dozen games and a sentence explaining the room. Categories
still exist underneath for anyone who wants them.

**Why this is strong here.** It matches how somebody actually arrives at a free arcade, and it
turns the catalog's lopsidedness into a feature: 45 action games is overwhelming as a list and
completely fine as "the two minute room" holding twelve of them at a time.

**Cost:** low to medium. It is mostly curation and copy, plus one new tag per game.
**Risk:** four doors means four curated rooms that need maintaining. Get the copy wrong and it
reads as cute rather than useful.

### OPTION C — One game, big

The home page leads with **a single game**, full width, with art, one sentence, a Play button,
and a small **"show me something else"** underneath. Below it, everything else as it is now.

**Why consider it.** It is the strongest possible answer to choice paralysis: the number of
decisions is one, and it is yes or no. It also gives the studio a place to actually sell a game
rather than list it.

**Cost:** low. It is one component plus a rotation rule.
**Risk:** if the pick is bad, the whole front page is bad. It needs to key off the quiz or off
what they have played, or it is just a billboard.

### OPTION D — Shelves that explain themselves

Keep the shelf layout, change what a shelf IS. Every shelf gets a reason, a cap, and a
personality:

```
  now   "Made this month"            capped at 6, rolls automatically by date
  now   "Two minutes or less"        the genuinely short ones, measured not guessed
  now   "Play with someone in the room"
  now   "If you liked Dewball"       a real similar-to row, once tags exist
  gone  "Action (45)"                a drawer is not a recommendation
```

**Cost:** low. Mostly a schema change and curation.
**Risk:** none really. This one is worth doing whatever else is chosen.

### OPTION E — The arcade as a place

Lean all the way into the metaphor. Not a grid of cards but a room: cabinets, a counter, a
back room for the apps, the studio's own games on a lit shelf. Walk left and right.

**Why mention it.** It is the most memorable version and the most on brand for a studio whose
whole identity is hand made art. It would be genuinely unlike any other free games site.
**Cost:** high, and it fights accessibility, search and deep links.
**Risk:** high. Novel navigation is the thing people abandon. Worth prototyping as a
*second* view you can toggle into, never as the only way in.

### OPTION F — Just remember them

No quiz, no doors. The home page simply changes based on what they have already played:
continue where you left off, more like the last thing you finished, and the untouched
categories drop down the page.

**Cost:** low, and it is invisible when it works.
**Risk:** does nothing at all for a first time visitor, which is the exact person the whole
problem is about. Good as a layer, not as the answer.

---

## 3. THE THING ALL OF THESE NEED FIRST

**Every option above depends on knowing more about each game than "action".**

The current schema has one category per game and ten categories total. That is not enough to
recommend with. What is needed is a small set of honest tags per game, mostly derivable and
some hand set:

```
  length        under 2 min · 2 to 10 · a sitting
  hands         one thumb · two hands · needs a keyboard
  brain         reflex · think · make · chance
  company       alone · pass the phone · same room · TV plus phones
  reading       none · a little · a lot
  restart       instant · a run · saves progress
```

Six axes, most of them a single word, and a person could tag 186 games in an afternoon.
**This is the unglamorous piece and it is the one that unlocks everything else.** Without it,
every recommendation is guesswork, and "if you liked X" is impossible.

Worth noting: I can generate a first pass automatically from what is already known (the
category, whether the game has a timer, whether it has a save, whether the controls are touch
only) and then have a human correct it. That is much faster than starting from a blank sheet.

---

## 4. WHAT I WOULD ACTUALLY DO

In this order, because each step is useful on its own and none of them blocks the next.

**Step 1 — Tag the catalog (§3).** Nothing else is honest without it. Auto generate, hand
correct. This is the foundation and it is boring, which is why it is worth naming first.

**Step 2 — Option D, shelves that explain themselves.** Cheap, safe, immediately better, and
it makes the storefront readable while the bigger decisions are still being argued about. Also
fixes the New shelf holding 29 games, 13 of which a visitor cannot even open.

**Step 3 — Option B, the four mood doors**, as the primary navigation, with categories kept
underneath. This is the "multiple pages" Jessie asked for, in the form I think she actually
means: places, not pagination.

**Step 4 — Option A, the picture quiz**, once there are tags to score against and rooms to
send people to. Doing this first, before steps 1 to 3, would put a questionnaire in front of a
storefront that still cannot act on the answers.

**Step 5 — Option F, remembering**, layered quietly on top.

**Option C** can be slotted in at any point after step 1; it is a component, not a structure.
**Option E** is a someday, and only ever as an alternate view.

---

## 5. THE THINGS THAT COULD GO WRONG

Worth saying out loud before anyone builds:

- **A quiz is a door you have to open before you get to the games.** Every extra screen between
  a stranger and playing something costs visitors. It must be skippable in one tap, must never
  show twice, and should probably not appear at all until the second visit, when the person has
  already decided they like the place.
- **Personalisation can shrink a catalog.** If the home page only ever shows the twelve games
  it thinks you want, 175 games become invisible and the studio looks small. Every personalised
  view needs a visible door back to everything.
- **The four doors have to be honest.** If "two minutes" contains a game that takes ten, the
  whole device stops being trusted, and this is the same class of defect as the eight games
  found today whose own copy was not true.
- **186 is the studio's best fact.** Whatever gets built should still say it somewhere. The goal
  is not to hide the catalog, it is to stop making a stranger carry it.

---

## 6. WHAT I NEED FROM YOU BOTH

1. Does "multiple pages" mean pagination, or does it mean **places**? My whole recommendation
   turns on that.
2. Are the four mood doors the right four? They are a guess and you two know the audience.
3. Should the quiz be first visit, or second? I lean second, and I could be wrong.
4. Is there a game you want to be the front door when someone arrives knowing nothing?
5. Do the apps (PadLab, Hush, Grow Your Name, Times Table Quest) sit inside the same doors, or
   is "the studio makes tools too" its own room?

---

# 7. STEP 1 ATTEMPTED — what the machine could and could not tag

Built `scripts/tag_catalog.mjs` and ran it over all 186 games. Result, stated honestly
because a wrong tag is worse than a missing one:

```
AXIS       firm on    verdict
reading    186/186    USABLE   none 149 · a little 22 · a lot 15
brain      185/186    USABLE   think 91 · reflex 49 · make 24 · chance 22
company     10/186    needs a human   (the 10 firm ones are right; "alone" is a safe default)
length      59/186    needs a human   164 of 186 landed on "2 to 10", so it does not discriminate
restart     27/186    needs a human
hands        1/186    needs a human
```

**Two of six axes came out usable, and the one that matters most did not.**

`length` is the axis the "I have two minutes" door is built on, and it is exactly the one a
machine cannot read. A game does not say how long it takes; you find out by playing it. The
detector only fires when a game declares a clock in its own text, which 19 do.

Two things worth knowing before deciding what to do about that:

- **`reading` is the surprise.** It is fully automatic, completely reliable, and it is a real
  axis: 15 games hand a first time visitor a block of 45 words or more before they play.
  Silt's is an eleven item list. A "no reading required" shelf could ship tomorrow with no
  human input at all.
- **`brain` is honest but shallow.** It is the existing category restated in the player's
  words, which is worth something (a person understands "I want to think" and does not
  understand "pattern") but it adds no new information.

**What I would ask for.** A human pass on `length` only, for the games that would go in the
doors. Not all 186: the top 40 or so. It is one word per game from somebody who has played it,
and it is the difference between a shelf people trust and a shelf that lies to them once and
is never believed again.

Two honest corrections I had to make to my own tagger while building it, both the same
mistake in different clothes: it first called 115 of 186 games "make" because it matched words
like *build* and *design* anywhere on the page, and "build a course of clay traps" is not a
creative tool. And it was reading no source at all for 80 games, because the native `/play/`
titles live in a different place and I had passed them a null path. Both were found by looking
at the distribution and asking whether it could possibly be true.
