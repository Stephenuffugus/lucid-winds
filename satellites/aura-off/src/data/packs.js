// AURA OFF — regional move packs. Pure data, no logic beyond one freezer.
//
// A PACK is a named, ownable set of moves layered on top of the base twenty-
// seven. A pack move is a move: same schema (CONTRACT §3), same frozen rig
// (§2), same validator, same `sample()`. There is no second code path for
// pack content anywhere in this repo, and there must never be one.
//
// -----------------------------------------------------------------------------
// THE FOUR RULES A PACK LIVES UNDER
// -----------------------------------------------------------------------------
//
// 1. THE BASE TWENTY-SEVEN STAY A COMPLETE, WINNABLE GAME.
//    Own nothing and the campaign is untouched: same moves, same order, same
//    unlock chain, same balance numbers in README. `test/validate.js` proves
//    it — with no pack owned, MOVES is byte-for-byte the base library.
//
// 2. A PACK ADDS RANGE, NEVER POWER.
//    No pack move may out-score the best base move in its own category, and no
//    pack move carrying a special may out-score the best base move carrying
//    that same special. Both are enforced by the validator, not by good
//    intentions. What a pack buys you is more SHAPES — different body splits,
//    different ideal amplitudes, different blend partners — not bigger numbers.
//
// 3. A PACK DECLARES ITS OWN UNLOCK ROUTE. IT IS NEVER A CAMPAIGN DROP.
//    Beating an opponent teaches you that opponent's move. That channel is the
//    base game's and it is already full: twenty-four opponents, twenty-four
//    drops, no spare slots. So a pack unlocks INSIDE ITSELF — a couple of moves
//    arrive with the pack and the rest are earned by using the ones you have.
//    The validator walks that graph and fails on a move nobody can reach, and
//    separately fails if any campaign opponent drops or carries a pack move.
//
// 4. OWNERSHIP IS DATA.
//    Nothing here knows about money, and nothing here should ever learn.
//    `src/data/moves.js` keeps a list of owned pack ids; a store writes to it.
//    That is the whole integration surface.
//
// -----------------------------------------------------------------------------
// EVIDENCE — EVERYTHING IN THIS FILE IS V3, AND THAT IS NOT A HEDGE
// -----------------------------------------------------------------------------
//
// CONTRACT §8 closes the V1 list at thirteen ids. Nothing here is on it, so
// every pack move is `tier: 'V3'` — our original design work, safe to ship and
// honest to label. The validator refuses a V1 claim from a pack outright.
//
// What IS documented is the SCENE each pack is drawn from, and the comment on
// each move says which documented fact it grew out of and where the invention
// starts. AURA-CULTURE §3 (the atlas) and §9 (the country-by-country read) are
// the sources. Brazil and Argentina were picked because they are the two
// best-attested and most sharply distinct characters in that table: Brazil the
// biggest and most democratic scene, 200+ entrants in one municipal park and
// spread deep into the North and Northeast; Argentina the most ironic, where
// the prize is literally "aura infinita" and the organisers give themselves
// joke names.
//
// -----------------------------------------------------------------------------
// ⛔ THE CONTENT RULES BITE HARDEST HERE
// -----------------------------------------------------------------------------
//
// These are real places and real regional culture, and the people in the source
// material are mostly teenagers — several documented competitors are children.
//
//   · No real person's name or likeness. Not one, not as a nod.
//   · No branded garment, no existing character, no named choreography.
//   · Nothing that caricatures a region. A move must read as a gesture FROM a
//     place, never as a joke ABOUT a country. Two candidates were cut on
//     exactly this line while writing the file: a "slacker" move built off an
//     Argentine organiser's self-deprecating handle, which stripped of its
//     context is just a national stereotype, and a fan-yourself gesture for the
//     Brazilian pack, which is hot-country shorthand and nothing else.
//   · No move may mock the opponent. Every joke in here lands on the performer:
//     you forget your own move halfway through, you stand there waiting for an
//     applause that never comes, you award yourself a prize that does not exist.
//
// -----------------------------------------------------------------------------
// WHY THE PACKS SKEW UPPER-BODY, DELIBERATELY
// -----------------------------------------------------------------------------
//
// The base twenty-seven already own the lower half of the rig — walk, step,
// drag, spin, buckle, noodle legs — and this is a twelve-joint front-on figure
// with no depth axis, no foot IK and a maximum honest crouch of about nine
// units. There is not a lot of unclaimed floor left. Aura battle vocabulary is
// hands and face anyway; that is what the corpus describes. So each pack ships
// ONE lower-led move as its blend partner (`fila` at 30/70, `sinparar` at 30/70)
// and spends the rest of its budget where the gestures actually live.
//
// Frames are authored to read AT the move's own idealAmp, not at 1.0
// (CONTRACT §4.2) — so the raw numbers below are roughly the on-screen angle
// divided by idealAmp, which is why the BAIT moves look small on the page.
//
// -----------------------------------------------------------------------------
// ⛔ FOUR THINGS ESTABLISHED BY RENDERING THESE TEN AND LOOKING AT THEM
// -----------------------------------------------------------------------------
//
// The first draft of this file passed every automated check — joints in range,
// feet on the floor, weights summing, content clean — and four of the ten moves
// were unusable on screen. None of that was visible in the numbers. It came out
// of a contact sheet, and out of building forward kinematics for the arm chain
// so hands could be PLACED instead of guessed at. Write these down or the next
// author finds them the same slow way.
//
// 1. THE ARMS ARE LONGER THAN THE FRAME IS WIDE.
//    Upper 29 + forearm 28 from a shoulder 13 off centre, against a 120-wide
//    viewBox. A straight arm anywhere between about 55° and 125° from vertical
//    puts the hand OUTSIDE the box. Six of the first ten moves had a hand off
//    screen, and `jafoi` held one there for 85% of its runtime. The band is
//    survivable as a TRANSIT if the elbow is folded on the way through — that
//    is the only reason `senha` and `premio` can raise an arm at all — and it
//    must never be held. Near vertical is safe: two arms straight overhead at
//    ±160 put the hands at x 36 and 83, comfortably inside.
//
// 2. A HAND AT THE CENTRE LINE BELOW THE SHOULDERS IS INVISIBLE.
//    The torso is a filled tapered shape, so hands clasped in front, cupped
//    together, or resting on the belly disappear into it completely. `fila`
//    was authored as a patient hands-clasped wait and rendered as a figure
//    with no arms. `premio` was authored as two cupped hands receiving a
//    trophy and rendered as hands on hips. Convergence reads at CHEST height
//    and above, where the forearms clear the torso — or not at all.
//
// 3. TWO KNEES BENT THE SAME WAY IS A STRIDE, NOT A BOUNCE.
//    Both knees hinge the same screen direction, so kL and kR with the same
//    sign swing both shins the same way and the figure reads as mid-step.
//    `sinparar` was five identical same-sign dips and looked like a man walking
//    on the spot. Symmetric is kL negative against kR POSITIVE — and kR is
//    clamped at +10, so the stance splays and narrows rather than dropping.
//    That widening IS the bounce; the hips barely move and are not meant to.
//
// 4. THE RIG CANNOT MIRROR A DEEPLY FOLDED ARM, AND IT NEVER WILL.
//    This is rig fact 1 in `moves.flow.js` and it was re-discovered here three
//    times. A mirrored pose needs eL = -eR, and eR is clamped at +30, so any
//    two-handed gesture above the shoulders — hands behind the head, both
//    hands over the face, a symmetric gather to the chest — is unavailable. It
//    was solved for numerically and the left arm cannot reach; the best the rig
//    offers is both elbows stacked on one side, which renders lopsided. Two
//    moves were cut on this. If a gesture needs two symmetric bent arms, it is
//    not a gesture this game can make: pick another one.

/* ========================================================================== */
/* BRAZIL — CHAVE ABERTA                                                      */
/* ========================================================================== */

const CHAVE_ABERTA = {
  id: 'chaveaberta',
  name: 'Chave Aberta',
  region: 'Brazil',

  // Register: warm, communal, matter-of-fact. The Brazilian scene's documented
  // character is scale and openness — a municipal park, single elimination,
  // 200+ entrants, ages from children to adults, anyone can register.
  blurb:
    'Two hundred names on one sheet of paper, a municipal park on a Saturday, ' +
    'and everybody gets a turn. Nobody is turned away and nobody is the show. ' +
    'You wait, you go, you sit back down, and the next one goes.',

  // The only route that exists today. It is here as an enum rather than as a
  // sentence so the validator can assert it, and so a second route — if one is
  // ever designed — has to be added deliberately instead of appearing.
  unlockRoute: 'pack',

  // The pack's own ladder is the bracket: you start in the line, and the two
  // moves at the top are gated on the crowd, because a crowd is the one thing
  // the Brazilian scene has more of than anywhere else.
  routeNote:
    'Two moves come with the pack. The rest are earned in the bracket, throw ' +
    'what you have, and pull a room.',

  moves: [

    // ── A FILA ─────────────────────────────────────────────────────────────
    // DOCUMENTED: a single-elimination bracket with 200+ entrants, and turns
    // that last a few seconds each. INVENTED: the gesture. If two hundred
    // people are going one at a time, almost all of the day is spent standing
    // in a line, and doing that well — patiently, without fidgeting, hands
    // still — is its own kind of composure. That is the move.
    //
    // The pack's blend partner at 30/70, and the only place here with real
    // lower-body content. A lateral weight shift on this rig is `rot`, not a
    // translation: the hips cannot slide, so the body tips a few degrees over
    // the loaded foot while the unloaded knee folds and that foot lifts three
    // or four units. bob barely moves and it is not supposed to — the rock
    // reads through the shins and the body angle, which is the only way this
    // rig sells weight.
    //
    // ⛔ THE FIRST VERSION HAD THE HANDS CLASPED LOW IN FRONT AND RENDERED WITH
    // NO ARMS AT ALL (header note 2 — the torso eats anything at the centre
    // line below the shoulders). The 30% upper is now carried where it can
    // actually be seen: `lean` and `head` ADD rather than oppose, the way
    // `sideeye` does, taking the skull a full head-width off the spine as you
    // look up the line at t:0.3 and back down it at t:0.8. Two looks, one
    // change of feet, and nothing else for two seconds. idealAmp 0.92 — a move
    // that gets worse the more of it you do.
    {
      id: 'fila',
      name: 'A Fila',
      cat: 'FLEX',
      tier: 'V3',
      base: 54,
      up: 0.3,
      lo: 0.7,
      idealAmp: 0.92,
      dur: 2000,
      hint: 'Look all the way up the line, hold it, then all the way back down the other way. Change feet once while you are doing it. Arms hang. You are a hundred and eighty-seventh and it is fine.',
      lag: 100,
      unlock: {
        on: 'pack',
        how: 'Comes with the pack. Everybody starts in the line.'
      },
      frames: [
        { t: 0 },
        { t: 0.14, rot: 3,  lean: 6,   head: 10,  hR: -3, kR: -8,  bob: 0.25 },
        { t: 0.3,  rot: 4,  lean: 12,  head: 20,  hR: -4, kR: -11, bob: 0.35 },
        { t: 0.46, rot: 4,  lean: 11,  head: 19,  hR: -4, kR: -11, bob: 0.35 },
        { t: 0.62, rot: -3, lean: -6,  head: -10, hL: 3,  kL: -8,  bob: 0.25 },
        { t: 0.8,  rot: -4, lean: -12, head: -20, hL: 4,  kL: -11, bob: 0.35 },
        { t: 1,    rot: 0,  lean: -2,  head: -3,  hL: 1,  kL: -3,  bob: 0.1 }
      ]
    },

    // ── JÁ FOI ─────────────────────────────────────────────────────────────
    // DOCUMENTED: Euronews reports organisers deliberately design these
    // battles fast, echoing the short videos that spread them, with
    // competitors performing for only a few seconds at a time. INVENTED: the
    // gesture, which is that idea taken all the way. One clean shape, thrown
    // inside the first seventh of the clip, and then you are finished and you
    // stand in it while the rest of your turn runs out.
    //
    // Five keyframes and three of them are the same pose. The snap lands at
    // t:0.15, settles two degrees by t:0.2, and holds dead to t:1 — 80% of the
    // move is one held frame, which is the joke and also the mechanic. At
    // idealAmp 0.90 the composure curve pays for keeping it small: you used
    // your seconds exactly, not one more.
    //
    // The shape is the widest SYMMETRIC one this rig owns and not a degree
    // wider: sL/sR at ±36 on screen with both elbows at ∓25, which lands the
    // hands at x 16 and 104. The first version held them at ±62 and both hands
    // sat outside the viewBox for the entire hold (header note 1). Because a
    // mirrored pose needs eL = -eR and eR stops at +30, the open shape has to
    // be a wide LOW V rather than a T — which is what the hint asks for.
    //
    // Not one lower joint is named. `reach()` reports lower 0.0.
    {
      id: 'jafoi',
      name: 'Já Foi',
      cat: 'FLEX',
      tier: 'V3',
      base: 58,
      up: 1.0,
      lo: 0.0,
      idealAmp: 0.90,
      dur: 1500,
      hint: 'One shape, thrown clean and immediately: both arms out wide and slightly down, elbows open, chin level. Then stop, and stay stopped for the rest of your turn.',
      lag: 0,
      unlock: {
        on: 'pack',
        how: 'Comes with the pack.'
      },
      frames: [
        { t: 0 },
        { t: 0.07, sL: 24, eL: -16, sR: -24, eR: 16, lean: 1 },
        { t: 0.15, sL: 42, eL: -29, sR: -42, eR: 29 },
        { t: 0.2,  sL: 40, eL: -28, sR: -40, eR: 28 },
        { t: 1,    sL: 40, eL: -28, sR: -40, eR: 28 }
      ]
    },

    // ── A SENHA ────────────────────────────────────────────────────────────
    // DOCUMENTED: competitors register in advance and are called up in rounds.
    // INVENTED: the gesture. In a bracket that size the way you exist at all
    // is putting your hand up when your number comes, so the move is one arm
    // going up and staying up.
    //
    // ⛔ AUTHORED WITH ONE EYE ON THE SHAPE IT MUST NOT MAKE. A single arm
    // raised diagonally forward-and-up is a salute, and on a front-on rig with
    // no depth axis every diagonal reads that way. So the arm travels UP THE
    // SIDE — out through horizontal at t:0.3 (sR -86) and on to near-vertical
    // (-150, which is -165 on screen at idealAmp) — and it is vertical, not
    // diagonal, everywhere it rests. It was rendered and looked at before it
    // was kept.
    //
    // The elbow is folded hard through the middle of the swing (eR -119 at
    // t:0.34) and only straightens once the arm is above the head. That is not
    // styling: a straight arm passing through horizontal puts the hand eleven
    // units outside the viewBox (header note 1). Folding it keeps the hand on
    // screen AND kills the one frame where an extended arm reads as pointing
    // at the person opposite. One fix, two problems.
    //
    // FLOW rather than FLEX because the arc is the content; it just happens to
    // end held, the way `sideeye` does. Held to the last frame: a hand you put
    // back down is a hand nobody counted.
    {
      id: 'senha',
      name: 'A Senha',
      cat: 'FLOW',
      tier: 'V3',
      base: 44,
      up: 1.0,
      lo: 0.0,
      idealAmp: 1.10,
      dur: 1600,
      hint: 'Swing one arm up the side of you with the elbow folded, then straighten it out when it is over your head and leave it there. Head tips a little the other way.',
      lag: 0,
      unlock: {
        on: 'perform',
        after: 'fila',
        times: 4,
        how: 'Wait the line out four times and they call your number.'
      },
      frames: [
        { t: 0 },
        { t: 0.14, sR: -10,  eR: -80,  lean: 1 },
        { t: 0.34, sR: -27,  eR: -119, lean: 2, head: -2 },
        { t: 0.54, sR: -105, eR: -67,  lean: 3, head: -4 },
        { t: 0.7,  sR: -146, eR: -12,  lean: 3, head: -4 },
        { t: 0.82, sR: -150, eR: 0,    lean: 3, head: -4 },
        { t: 1,    sR: -149, eR: 0,    lean: 3, head: -4 }
      ]
    },

    // ── MUTIRÃO ────────────────────────────────────────────────────────────
    // DOCUMENTED: the Suzano organiser's own framing — farmar aura is about
    // expressing your personality and your tastes — plus the plain fact that
    // the crowd is the judge, by cheers, applause and laughter. INVENTED: the
    // gesture. A mutirão is everyone pitching in on one job, and this is the
    // move that asks for that: arms sweep wide open, then gather everything in
    // to the chest. Twice. The whole ring is being invited.
    //
    // Mechanically it is the pack's `hype` move, and it is priced AT the base
    // library's hype ceiling — 30, exactly what Crowd Turn costs — because
    // that is the anti-creep rule and there is no version of this where it
    // costs less. What it adds is the split: Crowd Turn is 40/60 and lower-led,
    // this is 80/20 and upper-led, so they blend completely differently and a
    // player who owns both has two ways to buy hype instead of one.
    //
    // ⛔ IT IS ONE ARM AT A TIME, AND THAT IS FORCED. A two-armed symmetric
    // gather to the chest does not exist on this rig — it needs eL = -eR and
    // eR is clamped at +30, so the fold can only ever be a shallow cup (header
    // note 4). The first version tried it anyway and rendered as two arms
    // flapping slightly. So the move alternates: right arm out low, right arm
    // sweeps across and in to your own sternum, release; then the left; then
    // the right again. Three gathers, not four — an even count ends on the
    // wrong arm. The sweep is a real 56-unit travel of the hand, which is what
    // makes it legible where a symmetric version was not.
    //
    // The gather ends at the STERNUM, not out at the far side. An arm that
    // finishes extended at chest height on the opposite side reads as pointing
    // at the person standing there, and this move is aimed at the ring.
    //
    // The give in the knees on each gather is eight degrees and no more. A
    // symmetric knee bend needs kL negative against kR POSITIVE, kR is clamped
    // at +10, and idealAmp 1.20 multiplies whatever is authored — so eight is
    // the largest number that still lands inside the joint's own range on
    // screen. It was authored at twelve first and the right knee inverted.
    {
      id: 'mutirao',
      name: 'Mutirão',
      cat: 'FLOW',
      tier: 'V3',
      base: 30,
      up: 0.8,
      lo: 0.2,
      idealAmp: 1.20,
      dur: 1800,
      hint: 'Sweep one arm out low, then right across yourself and in to your own chest, gathering. Then the other arm the same way. Then the first one again. Let the knees give on every gather.',
      lag: 0,
      /* No special — a pack move may borrow a body, never a role. See `premio`. */
      unlock: {
        on: 'crowd',
        after: 'jafoi',
        people: 34,
        how: 'Pull a crowd of thirty-four into one battle.'
      },
      frames: [
        { t: 0 },
        { t: 0.1,  sR: 2.6,  eR: -39, sL: 14,   eL: -18, bob: 0.15, kL: -4, kR: 4 },
        { t: 0.24, sR: 82,   eR: -99, sL: 12,   eL: -16, bob: 0.3,  kL: -8, kR: 8, hL: 2, hR: -2, lean: -3 },
        { t: 0.36, sR: 30,   eR: -66, sL: 24,   eL: -30, bob: 0.15, kL: -4, kR: 4 },
        { t: 0.5,  sR: 10,   eR: -22, sL: 36.7, eL: -40, bob: 0.3,  kL: -8, kR: 8, hL: 2, hR: -2, lean: 2 },
        { t: 0.62, sR: 22,   eR: -44, sL: 15.2, eL: -99, bob: 0.15, kL: -4, kR: 4, lean: 3 },
        { t: 0.76, sR: 82,   eR: -99, sL: 12,   eL: -16, bob: 0.3,  kL: -8, kR: 8, hL: 2, hR: -2, lean: -3 },
        { t: 0.88, sR: 26,   eR: -56, sL: 26,   eL: -34, bob: 0.15, kL: -4, kR: 4 },
        { t: 1,    sR: 8,    eR: -26, sL: 16,   eL: -24, bob: 0.1,  kL: -2, kR: 2 }
      ]
    },

    // ── ESQUECI ────────────────────────────────────────────────────────────
    // DOCUMENTED: the Suzano bracket was won by a twelve-year-old out of 200+
    // entrants, and the crowd judges partly on laughter. INVENTED: the
    // gesture, which is the thing that actually happens to a kid halfway
    // through their eight seconds — you start big, and it goes.
    //
    // Four beats. The confident opening (t:0.2, both arms wide). The stall —
    // the arms just stop, in the air, and the body deflates a couple of
    // degrees under them. Then one hand comes in and turns over in front of
    // your own face while the other arm is simply forgotten and hangs there;
    // that asymmetry is not a compromise with the rig, it is the funniest part
    // of the pose and it is also the only version the rig can hold, since a
    // deep fold cannot be mirrored. Then a tiny restart at t:0.88 that gets
    // three degrees in and gives up.
    //
    // BAIT, and every bit of it is aimed at the performer. Nothing in this move
    // points anywhere except at your own hand.
    //
    // idealAmp 1.35, so the authored numbers are the on-screen angle over 1.35:
    // sR -104 is -140 on screen, which is the hand-at-the-face solve. The open
    // at t:0.2 was pulled in from ±62 on screen to ±38 for the same reason
    // every open shape in this file was — past that the hands are outside the
    // box (header note 1). It reads smaller and it is actually visible, which
    // is the trade every time.
    {
      id: 'esqueci',
      name: 'Esqueci',
      cat: 'BAIT',
      tier: 'V3',
      base: 52,
      up: 0.9,
      lo: 0.1,
      idealAmp: 1.35,
      dur: 1800,
      hint: 'Open big and confident, then stop dead halfway like the next part left. Bring one hand up and study it. Let the other arm hang there forgotten. Start again, get nowhere, quit.',
      lag: 0,
      unlock: {
        on: 'crowd',
        after: 'mutirao',
        people: 40,
        how: 'Pull a crowd of forty. Then lose the plot in front of all of them.'
      },
      frames: [
        { t: 0 },
        { t: 0.1,  sL: 16, eL: -12, sR: -16,  eR: 12,  lean: 0 },
        { t: 0.2,  sL: 28, eL: -20, sR: -28,  eR: 20,  head: 1 },
        { t: 0.34, sL: 27, eL: -20, sR: -27,  eR: 19,  head: 2, lean: -1, bob: 0.2, kL: -4, kR: 4 },
        { t: 0.4,  sL: 22, eL: -19, sR: -30,  eR: -66, head: 3, lean: -2, bob: 0.25, kL: -5, kR: 5 },
        { t: 0.54, sL: 14, eL: -16, sR: -70,  eR: -66, head: 4, lean: -2, bob: 0.3, kL: -5, kR: 5 },
        { t: 0.64, sL: 6,  eL: -10, sR: -104, eR: -87, head: 6, lean: -3, bob: 0.3, kL: -6, kR: 6 },
        { t: 0.78, sL: 4,  eL: -8,  sR: -100, eR: -84, head: 7, lean: -3, bob: 0.3, kL: -6, kR: 6 },
        { t: 0.88, sL: 8,  eL: -10, sR: 3,    eR: -65, head: 4, lean: -2, bob: 0.2, kL: -4, kR: 4 },
        { t: 1,    sL: 3,  eL: -4,  sR: -2,   eR: -18, head: 5, lean: -2, bob: 0.1, kL: -2, kR: 2 }
      ]
    }

  ]
};

/* ========================================================================== */
/* ARGENTINA — AURA INFINITA                                                  */
/* ========================================================================== */

const AURA_INFINITA = {
  id: 'aurainfinita',
  name: 'Aura Infinita',
  region: 'Argentina',

  // Register: deadpan. The pack is named for the documented prize, which is a
  // title and nothing else, and every move in it is built on the same joke —
  // an enormous amount of effort spent on something worth exactly zero, by
  // people who know that and turn up anyway. The irony is pointed at the
  // FORMAT, never at the people.
  //
  // Note the collision with CONTRACT §12, where AURA INFINITA is also the
  // callout for a flawless win. That is deliberate: it is one phrase from the
  // culture doing both jobs, and both jobs are the same joke.
  blurb:
    'There is no money and there is no trophy. There is a title, it is ' +
    'infinite, and it is worth precisely nothing. Everybody knows this. ' +
    'Everybody turns up anyway.',

  unlockRoute: 'pack',

  // Brazil's ladder is gated on crowds because scale is Brazil's whole
  // character. Argentina's is gated on repetition, because farmear is a gamer
  // loanword for doing the same thing over and over to accumulate a resource,
  // and here the resource is nothing.
  routeNote:
    'Two moves come with the pack. The other three are earned by repetition · ' +
    'do the ones you have, over and over, for no reward, until they turn into ' +
    'more.',

  moves: [

    // ── EL REGLAMENTO ──────────────────────────────────────────────────────
    // DOCUMENTED, and it is the sharpest fact in the whole corpus: CNN states
    // plainly that these battles have no apparent criteria, no judges and no
    // rules, and the Buenos Aires organiser adds that the moves vary entirely
    // by person. INVENTED: the gesture, which is the deadpan answer to that.
    // You hold up the rulebook. There is no rulebook. You read it anyway,
    // carefully, and you check a line twice.
    //
    // Mechanically `read`, priced under the base ceiling for it (44 against
    // Double Take's 48). The range it adds is that it is a FLEX read: until
    // now the only way to scout was a BAIT move, so scouting always lost to
    // FLEX. Consulting the rules is restraint, and it should sit in the
    // restraint corner.
    //
    // Built asymmetric because it has to be — a deep fold cannot be mirrored
    // on this rig — and the asymmetry is right anyway: one hand holds the page
    // up at chest height, the other comes in underneath to steady it. Both
    // hands are ABOVE the chest line, which is the only height at which two
    // converging hands clear the torso and read as holding something (header
    // note 2). The first version put one arm out at 106° from vertical, which
    // rendered as a long horizontal arm pointing straight at the person
    // opposite for two thirds of the clip. That version is not in this file.
    //
    // Reading is sold by head and lean, since this rig has no forward tilt: the
    // skull tracks a line at t:0.42, comes back at t:0.56, takes the line again
    // at t:0.68, and nods once. The whole thing is nine degrees of head
    // movement, and it is enough because nothing else is moving at all.
    {
      id: 'reglamento',
      name: 'El Reglamento',
      cat: 'FLEX',
      tier: 'V3',
      base: 44,
      up: 1.0,
      lo: 0.0,
      idealAmp: 1.05,
      dur: 1800,
      hint: 'Bring both hands up in front of your chest, one under the other, and hold a sheet of paper there. Read it. Track one line, go back, take it again. Nod once. Put it away.',
      lag: 0,
      /* No special — a pack move may borrow a body, never a role. See `premio`. */
      unlock: {
        on: 'pack',
        how: 'Comes with the pack.'
      },
      frames: [
        { t: 0 },
        { t: 0.12, sR: 20,   eR: -88,  sL: 32,   eL: -70,  lean: 1 },
        { t: 0.26, sR: 66,   eR: -135, sL: 31.9, eL: -122, lean: 3, head: 5 },
        { t: 0.42, sR: 66,   eR: -135, sL: 31.9, eL: -122, lean: 4, head: 9 },
        { t: 0.56, sR: 65,   eR: -134, sL: 31,   eL: -121, lean: 4, head: 4 },
        { t: 0.68, sR: 66,   eR: -135, sL: 31.9, eL: -122, lean: 4, head: 10 },
        { t: 0.82, sR: 64,   eR: -132, sL: 30,   eL: -119, lean: 3, head: 2 },
        { t: 1,    sR: 14,   eR: -60,  sL: 16,   eL: -46,  lean: 1, head: 1 }
      ]
    },

    // ── SIN PARAR ──────────────────────────────────────────────────────────
    // DOCUMENTED: *farmear* is gamer slang and the culture took it literally —
    // repeat an action over and over to accumulate a resource (AURA-CULTURE
    // §1.1). INVENTED: the gesture, which takes that at face value and then
    // removes the resource. Five identical bounces, on the beat, accumulating
    // nothing, and then it stops mid-bounce because there was never anything
    // to finish. The name is what you would say doing it and it is a lie by
    // the last frame.
    //
    // ⛔ THE REPEATED FRAMES ARE THE MOVE, NOT LAZY AUTHORING. Five of the ten
    // keyframes are byte-identical and the other five are byte-identical to
    // each other. Anyone tidying this file into a varied bounce has removed
    // the entire point: the flatness is the comedy and the metronome is the
    // reference. Compare `boat`, three moves away in the base library, where
    // no two keyframes repeat because that one is alive.
    //
    // ⛔ THE KNEES TAKE OPPOSITE SIGNS AND THAT IS THE WHOLE MOVE. kL -8 against
    // kR +8: the stance splays on the beat and closes off it. Authored with the
    // same sign on both — which is the intuitive way to write a dip — the two
    // shins swing the same direction and the figure reads as walking on the
    // spot, which is exactly what the first version did (header note 3). The
    // hips barely drop, because at this rig's honest budget they cannot; the
    // bounce is in the stance width, plus a five-degree `rot` rocking the body
    // over its own planted feet.
    //
    // The pack's lower-led blend partner at 30/70, with lag 110 — the torso is
    // a passenger and arrives late to every bounce the legs already made.
    {
      id: 'sinparar',
      name: 'Sin Parar',
      cat: 'FLOW',
      tier: 'V3',
      base: 52,
      up: 0.3,
      lo: 0.7,
      idealAmp: 1.15,
      dur: 2000,
      hint: 'Bounce. Same bounce, same knees, on the beat, five times, arms hanging. Do not build to anything. Stop in the middle of the sixth.',
      lag: 110,
      unlock: {
        on: 'pack',
        how: 'Comes with the pack.'
      },
      frames: [
        { t: 0 },
        { t: 0.1,  rot: 5,  bob: 0.55, kL: -8, kR: 8, hL: 1, hR: -1, sL: 4, sR: -4 },
        { t: 0.2,  rot: 0,  bob: 0.05, kL: -1, kR: 1, sL: 1, sR: -1 },
        { t: 0.3,  rot: -5, bob: 0.55, kL: -8, kR: 8, hL: 1, hR: -1, sL: 4, sR: -4 },
        { t: 0.4,  rot: 0,  bob: 0.05, kL: -1, kR: 1, sL: 1, sR: -1 },
        { t: 0.5,  rot: 5,  bob: 0.55, kL: -8, kR: 8, hL: 1, hR: -1, sL: 4, sR: -4 },
        { t: 0.6,  rot: 0,  bob: 0.05, kL: -1, kR: 1, sL: 1, sR: -1 },
        { t: 0.7,  rot: -5, bob: 0.55, kL: -8, kR: 8, hL: 1, hR: -1, sL: 4, sR: -4 },
        { t: 0.8,  rot: 0,  bob: 0.05, kL: -1, kR: 1, sL: 1, sR: -1 },
        { t: 0.9,  rot: 5,  bob: 0.55, kL: -8, kR: 8, hL: 1, hR: -1, sL: 4, sR: -4 },
        { t: 1,    rot: 2,  bob: 0.25, kL: -4, kR: 4, sL: 2, sR: -2 }
      ]
    },

    // ── EL BIS ─────────────────────────────────────────────────────────────
    // DOCUMENTED: nothing physical. INVENTED entirely, off one documented
    // structural fact — there are no rules and nobody is enforcing a turn
    // length. So you finish, you drop your arms, there is a beat of silence,
    // and then you do half of it again, unasked, because nobody stopped you.
    //
    // That is `persist` written as choreography: the move scores again at
    // reduced value next turn, and the animation is literally the reduced
    // version arriving late. Priced at 46 against Noodle Legs' 52, and split
    // 70/30 against Noodle's 10/90, so the two persists share a mechanic and
    // nothing else.
    //
    // The beat at t:0.62-0.7 is two keyframes of almost-rest, and it is the
    // hinge of the whole move — cut it and this is just a flourish. The encore
    // comes back to sR -48, half of the -96 it reached the first time, and
    // stops there without resolving.
    //
    // The flourish keeps its elbow folded all the way up — the peak is sR -88
    // with eR -93 on screen, which puts the hand high beside the head at x 100
    // instead of eleven units off the side of the box. A straight-armed
    // flourish is not available at this arm length (header note 1).
    //
    // No bob anywhere: the left leg is straight for the entire move, so the
    // hips have nowhere to go without putting that foot under the pavement.
    // The lower 30% is the right leg taking and giving back the weight.
    {
      id: 'bis',
      name: 'El Bis',
      cat: 'FLOW',
      tier: 'V3',
      base: 46,
      up: 0.7,
      lo: 0.3,
      idealAmp: 1.25,
      dur: 1800,
      hint: 'A full arm flourish, up past your own shoulder with the elbow folded, then all the way down. Wait. Then do half of it again, on your own, and stop there.',
      lag: 0,
      /* No special — a pack move may borrow a body, never a role. See `premio`. */
      unlock: {
        on: 'perform',
        after: 'sinparar',
        times: 5,
        how: 'Bounce it five times for nothing. Then do it once more, because nobody stopped you.'
      },
      frames: [
        { t: 0 },
        { t: 0.12, sR: -4,   eR: -80,  sL: 8,  eL: -6,  lean: 1, hR: -2, kR: -3 },
        { t: 0.26, sR: -30,  eR: -96,  sL: 16, eL: -14, lean: 3, head: -2, hR: -3, kR: -5 },
        { t: 0.4,  sR: -71,  eR: -75,  sL: 20, eL: -20, lean: 3, head: -3, hR: -2, kR: -4 },
        { t: 0.52, sR: -14,  eR: -96,  sL: 8,  eL: -8,  lean: 1, head: -1, hR: -1, kR: -2 },
        { t: 0.62, sR: -2,   eR: -6,   sL: 1,  kR: -1 },
        { t: 0.7,  sR: -2,   eR: -5,   sL: 1,  kR: -1 },
        { t: 0.82, sR: -10,  eR: -102, sL: 4,  eL: -4,  lean: 2, head: -1, kR: -2 },
        { t: 0.9,  sR: -10,  eR: -100, sL: 4,  eL: -4,  lean: 2, kR: -2 },
        { t: 1,    sR: -10,  eR: -100, sL: 4,  eL: -4,  lean: 2, kR: -2 }
      ]
    },

    // ── EL APLAUSO ─────────────────────────────────────────────────────────
    // DOCUMENTED: the prize in the Buenos Aires scene is a title and no cash,
    // and the crowd is what decides these things — by cheering, applauding and
    // laughing. INVENTED: the gesture, which is what happens when none of that
    // arrives. You finish, you put your hands on your hips, and you wait. You
    // look one way along the crowd. You look the other way. It does not come.
    //
    // ⛔ THIS SLOT COST FOUR ATTEMPTS AND THE FOURTH ONE IS THE RIG'S ANSWER,
    // NOT MINE. It was authored as an autograph — sign the air, then admire
    // your own signature — and it rendered as hands on hips three times
    // running, because a pen hand travelling ten units across an invisible page
    // at belly height is inside the torso silhouette the entire way (header
    // note 2). What the frames actually MADE was a planted, deadpan, hands-on-
    // hips hold. So the move is now the thing it was already drawing. The
    // lesson is the repo's own: a gesture is not what you meant, it is what
    // renders, and you do not find out until you open the picture.
    //
    // Which is lucky, because hands on hips is the strongest silhouette in
    // either pack — two clear triangles under the arms, legible in pure black
    // at 64px — and waiting for applause that never comes is more Argentine
    // than the autograph ever was.
    //
    // Seven of the eight keyframes hold the arms at EXACTLY the same four
    // numbers. Only `head` and `lean` move, scanning +8 then -8 across the
    // crowd. The stillness is the joke and the scan is the hope.
    //
    // ⛔ AIMED AT THE ROOM, NEVER AT THE OTHER PERSON. Hands on hips can read
    // as squaring up, so the head scan runs along the CROWD, the body stays
    // square to the front, and the hint says so in as many words. Nothing here
    // turns toward the opponent at any point in the clip.
    //
    {
      id: 'aplauso',
      name: 'El Aplauso',
      cat: 'BAIT',
      tier: 'V3',
      base: 50,
      up: 0.9,
      lo: 0.1,
      idealAmp: 1.30,
      dur: 1800,
      hint: 'Plant your hands on your hips and stop. Look one way along the crowd, then the other. Do not move anything else. Wait for it. Keep waiting. Then take your hands off your hips and go.',
      lag: 0,
      unlock: {
        on: 'perform',
        after: 'reglamento',
        times: 3,
        how: 'Read the rules three times. There are no rules. Wait for the applause instead.'
      },
      frames: [
        { t: 0 },
        { t: 0.14, sL: 27.5, eL: -49, sR: 20.1, eR: -48, lean: 1 },
        { t: 0.24, sL: 27.2, eL: -70, sR: 41.3, eR: -70, lean: 1,  bob: 0.1,  kL: -3, kR: 3 },
        { t: 0.4,  sL: 27.2, eL: -70, sR: 41.3, eR: -70, lean: 2,  head: 8,  bob: 0.1, kL: -3, kR: 3 },
        { t: 0.56, sL: 27.2, eL: -70, sR: 41.3, eR: -70, lean: 1,  head: 2,  bob: 0.1, kL: -3, kR: 3 },
        { t: 0.72, sL: 27.2, eL: -70, sR: 41.3, eR: -70, lean: -2, head: -8, bob: 0.1, kL: -3, kR: 3 },
        { t: 0.86, sL: 27.2, eL: -70, sR: 41.3, eR: -70, lean: -1, head: -4, bob: 0.1, kL: -3, kR: 3 },
        { t: 1,    sL: 8,    eL: -22, sR: 10,   eR: -20, bob: 0.05, kL: -1, kR: 1 }
      ]
    },

    // ── EL PREMIO ──────────────────────────────────────────────────────────
    // DOCUMENTED: the prize in the Argentine scene is "aura infinita" — no
    // cash, just the title. INVENTED: the gesture, which is the only honest way
    // to receive that. Both hands come together low and cupped, you look at
    // what you are holding, and then you lift it over your head and hold it
    // there like it weighs something.
    //
    // `finisher` — it can only be thrown when the meter is close, which is
    // exactly when awarding yourself nothing is funny. Priced at 56 against
    // The Grimace's 78, and it is BAIT where The Grimace is FLEX, so the two
    // finishers beat and lose to opposite things and neither replaces the
    // other. The Grimace is still how a battle actually ends; this is how it
    // ends when you are pleased with yourself.
    //
    // ⛔ THE RECEIVING BEAT IS A HEAD TILT, NOT A PAIR OF HANDS. It was authored
    // as two cupped hands held together low in front and rendered, twice, as
    // hands on hips — the torso swallows anything converging at the centre line
    // below the chest (header note 2). So the first third of the move is now
    // the arms hanging completely still with the head tipped six degrees down,
    // looking at two empty hands, for a full second before anything happens.
    // Less literal and it actually reads.
    //
    // The lift is narrow and near-vertical (118 authored, 159 on screen) rather
    // than wide, which is the whole reason it does not collide with Chave
    // Aberta's `senha` or read as a generic celebration: the hands stay close
    // together, about thirty units either side of centre. The elbows stay
    // folded through t:0.5 and t:0.62 and only straighten overhead, because a
    // straight arm crossing horizontal leaves the frame (header note 1). The
    // two-degree rot wobble across the last three keyframes is the weight of
    // a thing that does not exist.
    {
      id: 'premio',
      name: 'El Premio',
      cat: 'BAIT',
      tier: 'V3',
      base: 56,
      up: 0.8,
      lo: 0.2,
      idealAmp: 1.35,
      dur: 1900,
      hint: 'Stand still and look down at your own two empty hands for a full second. Then lift them straight over your head anyway and hold it up there. Let it wobble, it is heavy.',
      lag: 0,
      /* NO SPECIAL, DELIBERATELY. balance-sim measured this pack move as
         pay-to-win: with every pack move owned the expert spent more turns on
         `premio` than on any base move, because it was a SECOND finisher in a
         second category and `bis` a second `persist` — the base game had one
         answer to those board states and a pack sold a better one. The rule the
         measurement produced: a pack move may borrow a BODY the base game
         already has, never a ROLE. Its range is its category, its idealAmp and
         its upper/lower split, which is what a pack is for. */
      unlock: {
        on: 'perform',
        after: 'bis',
        times: 2,
        how: 'Take two encores nobody asked for, then award yourself the title.'
      },
      frames: [
        { t: 0 },
        { t: 0.12, sL: 3,   eL: -8,  sR: -3,   eR: 8,   lean: 1, head: 4, bob: 0.1,  kL: -2, kR: 2 },
        { t: 0.28, sL: 4,   eL: -10, sR: -4,   eR: 10,  lean: 1, head: 6, bob: 0.15, kL: -3, kR: 3 },
        { t: 0.38, sL: 4,   eL: -10, sR: -4,   eR: 10,  lean: 1, head: 6, bob: 0.15, kL: -3, kR: 3 },
        { t: 0.5,  sL: 60,  eL: -84, sR: 16,   eR: -84, head: 3, bob: 0.1,  kL: -2, kR: 2 },
        { t: 0.62, sL: 108, eL: -99, sR: -12,  eR: -99, bob: 0.05 },
        { t: 0.74, sL: 117, eL: 0,   sR: -117, eR: 0 },
        { t: 0.84, sL: 115, eL: 0,   sR: -115, eR: 0, rot: 1 },
        { t: 0.92, sL: 118, eL: 0,   sR: -118, eR: 0, rot: -1 },
        { t: 1,    sL: 116, eL: 0,   sR: -116, eR: 0, rot: 0.5 }
      ]
    }

  ]
};

/* ========================================================================== */
/* ASSEMBLY                                                                    */
/* ========================================================================== */

/**
 * Stamp every move in a pack with its owning pack id and deep-freeze the whole
 * record. The back-reference is written HERE rather than authored on each move
 * so it cannot drift: a move physically inside `CHAVE_ABERTA.moves` cannot end
 * up claiming to belong to another pack.
 */
function sealPack(pack) {
  const moves = pack.moves.map(function (m) {
    const out = Object.assign({}, m, { pack: pack.id });
    out.frames = Object.freeze(out.frames.map(function (f) { return Object.freeze(f); }));
    if (out.unlock) out.unlock = Object.freeze(Object.assign({}, out.unlock));
    return Object.freeze(out);
  });
  return Object.freeze(Object.assign({}, pack, { moves: Object.freeze(moves) }));
}

/**
 * Every pack that exists, in release order. Order is stable: a store listing,
 * the roster generator and any future pack picker all read this front to back.
 * @type {ReadonlyArray<Object>}
 */
export const PACKS = Object.freeze([CHAVE_ABERTA, AURA_INFINITA].map(sealPack));

/** Pack ids, release order. */
export const PACK_IDS = Object.freeze(PACKS.map(function (p) { return p.id; }));

/** id → pack. */
export const PACKS_BY_ID = Object.freeze(PACKS.reduce(function (map, p) {
  map[p.id] = p;
  return map;
}, Object.create(null)));

/**
 * Every pack move that exists, ownership ignored, packs in release order and
 * moves in authored order. This is the CATALOGUE, not the library — the
 * validator and the doc generator read it; the game does not.
 * @type {ReadonlyArray<Object>}
 */
export const PACK_MOVES = Object.freeze(PACKS.reduce(function (all, p) {
  return all.concat(p.moves);
}, []));

/** id → pack move, ownership ignored. */
export const PACK_MOVES_BY_ID = Object.freeze(PACK_MOVES.reduce(function (map, m) {
  map[m.id] = m;
  return map;
}, Object.create(null)));

/** Look up a pack. Returns null rather than undefined, like `moveById`. */
export function packById(id) {
  return PACKS_BY_ID[id] || null;
}

/**
 * The moves a pack contains, authored order. Unknown pack id gives an empty
 * array, so a stale id in save data degrades to "you own nothing extra"
 * instead of throwing on boot.
 * @param {string} id
 * @returns {Object[]}
 */
export function movesInPack(id) {
  const p = PACKS_BY_ID[id];
  return p ? p.moves.slice() : [];
}

/**
 * Which pack a move id belongs to, or null for a base move / unknown id.
 * @param {string} moveId
 * @returns {string|null}
 */
export function packOfMove(moveId) {
  const m = PACK_MOVES_BY_ID[moveId];
  return m ? m.pack : null;
}

export default PACKS;
