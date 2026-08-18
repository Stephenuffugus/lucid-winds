# AUTO MODE — the queue, 2026-08-18

Written from Stephen's own list. Ordered so the things blocking **Steam** come
first, because that has a clock on it and everything else does not.

**Legend:** 🟢 I can do it alone · 🟡 needs a call from Stephen first · 👤 only
Stephen can do it (an account, a card, a button)

---

## THE CLOCK

Steam Direct paid **Jul 30**, so the earliest release date is **Aug 29** and the
target is **Tue Sep 1**. Today is Aug 18. That is **11 days** before the door
opens and **14** to target. App `5043360`, depot `5043361`, both live.

Everything in Lane 1 has to be done before that. Nothing else does.

---

## LANE 1 — What is actually stopping Jimothy shipping

### 1.1 🟡 The black bars
Jimothy draws a fixed **540x960** stage and scales it. On a 1920x1080 monitor
that is 607px of game and **656px of black on each side**. It is not a bug, it
is what every portrait game has to answer.

What portrait games on Steam actually do, in order of how much work they are:

| Treatment | What it is | Cost |
|---|---|---|
| **Bezel art** | Side columns painted in the game's own world: wet brick, rain, neon, a Seattle skyline in silhouette. Static or a slow parallax drift. | Low, and it doubles as capsule art |
| **Cabinet panels** | The side columns carry the HUD: coins, decade, level, the current track, the daily share strip. It stops being empty space and becomes an arcade cabinet. | Medium, and it is on brand for an arcade |
| **Widen the camera** | Let the PC build show more world left and right. | High. Changes level design and difficulty, and would need re-beating |

⭐ **Recommendation: bezel art now, cabinet panels next.** The bezel is cheap,
lands before the deadline, and the same art solves 1.2. The cabinet is the
better long-term answer and can ship as a patch.
⛔ Do NOT stretch the game to fill the width. That is the one option that makes
a portrait game look broken rather than deliberate.

### 1.2 🟢 The capsule art does not look like the game
u/mark_succerberg, unprompted: *"I think jumping jimothy has pretty fluid
movement. I do not like the art style though. The preview pic would lead me to
believe that it's a newspaper cartoonish style kind of game."*

That is the exact complaint Stephen raised, from a stranger, and it is a
store-page problem, not a taste problem: the capsule sets an expectation the
game then breaks in the first five seconds. **Capsules get rebuilt from
in-game frames**, the same characters at the same fidelity the player will
actually see.

### 1.3 🟡 The unlockable system is wrong for a bought game
Right now skins unlock by **coming back daily** and by **codes**. Someone who
paid for the game should not be made to wait days, or to go hunting the
internet for a code, to see content they already own.

Options, Stephen's call:
- **A. Everything unlocked at purchase.** Simplest, most generous, zero
  friction. Loses all progression.
- **B. Everything earnable in-game, no calendar, no codes.** Skins unlock from
  play: levels cleared, decades finished, feats. ⭐ Recommended, keeps a reason
  to play without gating on real-world time.
- **C. B, plus the codes still work** as an easter egg for people who know them.
  ⭐⭐ This is B with nothing taken away, and probably the real answer.

⛔ Whatever we pick, the daily-return gate has to come out of the Steam build.
A purchased game that pays out once per real day is the "its own copy is not
true" defect in another costume.

### 1.4 🟢 Prove every level is beatable
`store/jimothy-steam/BEATABILITY.md` exists; Stephen has not played to 100.
A solver run over all 120 levels, reporting any that cannot be cleared, is
cheap and it is the difference between shipping and shipping something that
dead-ends a paying player.

### 1.5 🟢 The art audit: three legs and obvious AI
A pass over all **872 pose frames** across 44 sheet folders looking for the
things Stephen named: extra limbs, melted hands, the tells. Machine-flaggable
candidates, then he looks at a contact sheet and points.
⛔ A checker cannot decide what "obviously AI" means. It narrows 872 down to a
short list; the call is his.

---

## LANE 2 — Getting listed, without getting burned

### 2.1 🟢 Listdle: the door is open, we just sent the wrong game
Conor at Listdle, on Jimothy: *"I played it, and I think it's a fun game, but I
don't think it fits the puzzle game theme of Listdle. Even though it has a daily
mode, it is more of an action game. Please continue to keep me updated with any
new games you create."*

**The criterion is: a PUZZLE with a daily.** Already sent: Hues, Sixfold,
Cosmic Cadets, Tally, Nectar Drop. Live: **Tally** and **Hues**.

⛔⛔ **Before sending any more: Nectar Drop's daily is broken.** Its own copy
promises the same board for everyone and one place uses unseeded randomness, so
two players get different boards. It is already submitted. Fix it first, because
a directory listing it is the fastest possible way to be publicly wrong.

Then: find every puzzle game in the catalog with a real daily, **verify the
daily is genuinely deterministic** rather than trusting the label, and send the
ones that pass.

### 2.2 🟡 The generative AI question, answered straight
The rejections are one person, Jupiter Hadley, across two outlets, and the
reason given was two-part: *"Indie Games Plus doesn't cover platforms, they
cover games"* and a flat objection to AI generation.

⛔ The move is **not** to hide it. It is:
- **Pick venues by their stated policy.** Some exclude AI-assisted work. Do not
  spend the pitch there and do not argue; it costs goodwill and changes nothing.
- **Lead with the engineering, because it is the honest story and the strongest
  one.** Blackout generates murder cases with exactly one solution and the
  evidence to prove it, verified over 10,000 cases. Parallel ships 100 levels
  each solved by a solver before release, and the on-screen par IS the solver's
  optimum. That is design work, and it is what a curator who cares about craft
  actually wants to hear.
- **Send one game, not the platform.** Both rejections said the same thing in
  different words: a portal of 186 games is not a thing they review.

### 2.3 👤 The two syndication accounts, both already answered
- **GameDistribution / Azerion:** *"upload your strongest titles directly
  through our Developer Portal."*
- **GameMonetize:** *"create a Developer Account... We recommend submitting one
  game first."*

Both are waiting on Stephen to make an account. Once they exist I can prep and
queue the submissions. See `PUBLISHING.md`.

### 2.4 👤/🟢 Pi, Google Play, Apple
- **Pi Network:** ⛔ the standing blocker is unchanged and it is ours, not Pi's:
  the portal forces email signup, which fails Pi's review. That has to go before
  anything is listed. The listing URL must be `?pi=1`.
- **Google Play:** $25 one-time 👤. The arcade is already a valid PWA and can be
  packaged as a TWA. ⛔ This is the same work as the Horizon Store app, and the
  off-origin blocker for it is gone as of today.
- **Apple:** $99/yr 👤, and a wrapper is a much bigger lift than Play. Last.

⭐ **Pace, not volume.** Submitting everything everywhere at once is how
accounts get flagged. One title per platform, wait for the verdict, then the
next.

---

## LANE 3 — The games Stephen could not find

Both exist. Neither is missing.

- **The slot machine is Seed Reel**, and it is **not gated, it is live**:
  `/satellites/seed-reel/`, filed under **dice**, which is probably why it was
  hard to find. *"A garden slot roguelike where you slide one tile before each
  harvest so a spin is never just luck."*
- **Bandit's Box** is the other one people read as a slot machine (a one armed
  bandit). It is dev-gated at `/satellites/bandits-box/`.
- **The dungeon crawler is Wild Wardens**, dev-gated at
  `/satellites/wild-wardens/`. Clear three rooms, beat the boss, claim the bar,
  fight/skill/item/run with a rhythm bar for crits. It only became reachable
  same-origin today; it used to live on github.io as "BarBrawl".

### 3.1 🟡 Graduating things out of In Development
**24 cards are dev-gated.** A graduation checklist per game, so leaving beta is
a decision with evidence behind it rather than a feeling, and Stephen plays the
shortlist rather than all 24.

---

## LANE 4 — Money, eventually

Everything stays free. That is the standing rule and nothing below changes it.
The tip jar is live and is not a business. Real options, none of them decided:

- Paid desktop editions on Steam of the few games that carry it. Jimothy is the
  first test of whether that works at all.
- Syndication revenue (2.3) — the games stay free to the player and the network
  pays.
- Pi, once the signup blocker is gone.

⛔ Nothing here should touch the free browser arcade.

---

## 👤 ONLY STEPHEN

1. Steam: the upload, the store page, and the release button.
2. Google Play developer account, $25.
3. Apple developer account, $99/yr.
4. GameDistribution and GameMonetize developer accounts.
5. Pi developer registration.
6. Free Meta developer account for the Horizon store app.
7. Playing the 24 dev-gated games and saying which graduate.
8. The calls marked 🟡 above.
9. HUNCH's leaderboard is 500ing on production. It needs the Upstash credentials.
