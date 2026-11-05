# FLATULENCE FIGHTER M2 BUILD PLAN (5 Nov 2026): THE FOUR PADS, from Stephen's verdict on m1

The game is `satellites/flatulence-fighter/index.html` (m1 LIVE 5 Nov, main fc4809f27; FLATULENCE_FIGHTER_BUILD_PLAN.md
is how m1 was built and its LAWS still hold). Run this plan in a FRESH session (CLAUDE.md: fresh chat sessions for major
build phases), alone, top to bottom.

## WHY: HIS WORDS, 5 NOV (verbatim)

"flatulance fighter has no explanation of how stuff is working, how it functions in the first place, what actually is
the objective, what you should bve touching when or why. we have to teach people how to play the game and we need to
sugest that they set the game down on the table to play so they can use multiple fingers from each hand. i dont
understand the purpose or help of leaning left or right, whats the stuff popping up for? theres only two buttons that
say hold but why only two? maybe if we associated two lower ones with the bum cheeks, and then two maybe for the hands
up above and then youre supposed to touch and hold the ones it tells you when it tells you. its not quite there yet at
all." Opus proposed the design below the same night; his answer: "sure get to it then".

What the code shows (read before building): m1 asks for about ten inputs at once (Left and Right hold, Lean left and
right, Hold breath, Vent, tapping leaks on the stage, the Cough, Sip and Waft props). The 11 step tutorial
(`TUT_PROMPTS`, `startTutorial`) DOES auto start on first boot (`ff.tutseen`); he went through it and still found nothing
explained. So the fix is fewer systems taught by doing, not more text.

## THE DESIGN (m2)

- **The objective, one line, everywhere it matters** (menu, How to play, the lesson's first beat): Get through the scene
  without anyone hearing you.
- **The table card** before the first lesson and in How to play: an illustration of the phone flat on a table and two
  fingers from each hand, with one line: Set your phone flat on a table and use both hands. One button, Got it.
- **Four pads**, a 2 by 2 block across the bottom half, each far over 48 px (aim at 120 px or more square on 412 wide):
  - **The two lower pads are the cheeks.** Hold both to keep it in. Pressure rises all the time. A cheek let go while
    no cover noise plays is a squeak: the room hears it (a strike, the m1 strike and reaction rules).
  - **Venting is letting go.** When a cover noise plays (the bus, the organ, applause: m1's covers and their banner and
    countdown), lift both cheek fingers: that is the vent (relief and score; the onset is a Perfect, m1's perfectFrac).
    Put them back before the noise ends. There is no Vent button.
  - **The two upper pads are the hands.** The scene calls them: a pad lights, says what it wants in words with an icon
    (Hold the hymn book, Shake hands, Hold the rail, Clap), and a ring counts down. Touch and hold it in time and keep
    holding until it lets go. A missed call is a fidget the witnesses notice (the builder tunes it: a suspicion tick
    or a smaller penalty than a strike; DECISION 2).
  - **The Twister** is the act ramp: calls overlap, so later acts need three and then four fingers at once, a hand
    call during a vent, a call that moves a hand from one pad to the other.
- **Retired from play**: Lean left and right (the posture track), Hold breath, the Vent button, the leaks tapped on the
  stage, the Cough, Sip and Waft props. Their code may stay dormant; nothing of them shows. (DECISION 4: a Classic mode.)
- **The lesson is the first scene and cannot be lost**: one beat at a time, each waiting for the player, the words on
  the pads themselves plus one big line, never a paragraph: 1 hold both cheeks; 2 a bus comes, let go now (the vent, a
  Perfect); 3 cheeks back; 4 the hand call (Hold the hymn book); 5 a hand call while a bus comes (three fingers);
  6 You are ready, three strikes and the room knows. It shows once for every save, m1 players too (a NEW key,
  `ff.tut2seen`; `ff.tutseen` stays as it is), and again from How to play.
- **Each scene's hand calls fit the scene** (the funeral: hymn book, a handshake; the job interview: shake hands, hold
  the pen; live on air: the microphone, the headphones; the recital: clap on applause; the baby's nap: rock the
  cradle). The builder drafts the twelve lists; he picks (DECISION 1).
- **Kept**: the twelve scenes and their order, the witnesses and their reactions, three strikes, score, combos,
  Perfects, acts, Easy, Normal, Panic, the Daily, the wardrobe, the share card, the music.

## THE LAWS

m1's LAWS 1 to 9 hold word for word (code directly and alone, the check per step and one shot per visual step, never
push main or deploy, one file, never change a saved key or id, the copy law and 48 px, one line notes, scope is this
plan, the box's 12 hour life). Added for m2:
10. Real multi touch. Four simultaneous holds through Pointer Events, each pad tracking its own pointerId; a finger that
    slides off a pad releases it; no gesture on the deck scrolls, zooms or selects. The shot tool presses four pads at
    once with real touches (puppeteer's touchscreen, several touch points) before the step is called done.
11. Medals: an m1 medal whose feat is retired (Surgeon, Hydrated, Saved by the Fan, Improviser) stays earned and shown
    with its id; it can no longer be won. New feats get NEW ids (DECISION 3 for their names).

## THE STEPS (in order; each ends green on the check, committed and pushed)

0. Baseline: `node tools/ff-tests/check.js`, the before set with `tools/ff-tests/shoot.mjs` (16 screens), START-HERE line.
1. The deck: the four pads (markup, CSS from Astra's control plates as m1 used them, placeholders where no plate fits),
   the input (law 10), keyboard fallbacks for a desktop (F and J the cheeks, R and U the hands), the old deck hidden.
2. The loop: cheeks clench, a cheek up without cover is a squeak and a strike, release under cover is the vent; the
   hand caller (per scene lists, per act and mode timings, overlaps from act III); the retired inputs out of play.
3. The lesson and the table card; the objective line on the menu and How to play (its three steps redrawn for m2).
4. Medals, stats and the Daily for m2 (law 11), the modes re tuned so Easy is a real first game.
5. The Astra round 2 brief in docs/briefs/flatulence-fighter/round2/ (the four pads and their states, the hand call
   icons for every scene's list, the table card illustration, the lesson's big line plate) and its KICKOFF-PROMPT.txt,
   the same shape as Keepsies round 2; Drive Astra/Flatulence Fighter/Round 2 (he hands it to Astra).
6. The walk: every screen at 412x915, 360x780 and 320x568, the worst angle on purpose (four fingers down, a cover noise
   and a hand call at once, on the 320 wide phone); open every image, three things wrong each; fix; stamp; the deploy
   script in /home/codespace/ff-drafts/ on the m1 pattern; the line for Stephen.

## DECISIONS for Stephen (built as written until he says otherwise)

1. The twelve scenes' hand call lists (the builder's drafts in the step 2 commit).
2. A missed hand call: a fidget the witnesses notice (default) or a full strike.
3. The new medals' names.
4. Keep m1's controls as a Classic mode, or retire them (default: retired from play, code dormant).
5. The table card's line.
6. The deck in portrait only (default) or landscape too.
