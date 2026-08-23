# PUPPY DASH — Sheet 1: the character frame list (one list, every animal)

**Doc in 012Assets:** https://docs.google.com/document/d/1YaokW-d3xAFWKhgd_zoKQumQgoIUT2liQ_X1lEInXlc/edit  
*(Stephen works from Drive. The Doc is the delivered copy; this file is the repo mirror.)*

> This is the list you asked for: **one canonical set of poses that any animal can be drawn
> into.** Draw the puppy first, lock it, then run the identical pose list for the kitten,
> bunny and fox. Because every frame shares a canvas, a contact point and a camera angle,
> the engine swaps one animal's sheet for another's with no code change at all.

---

## 0. Read this before you generate anything

### The one big correction

**Gameplay frames are 3/4 REAR view. You are looking at the back of the animal as it runs
away from you.**

The dog in the build today is drawn FRONT ON. It has two eyes, a snout and a belly facing
the camera while the road runs away behind it, so it reads as a plush toy standing still on
a moving road. That single thing is the biggest reason the game does not feel like a runner:
your eye cannot tell which way anything is travelling when the hero is looking at you.

Every frame in section 2 is **3/4 rear**. Every frame in section 3 is front 3/4, because
those are menu and card frames where you want the face.

### The shared rig (this is what makes one list serve four animals)

| Lock | Value | Why it cannot drift |
|---|---|---|
| Canvas | 512 x 512, transparent PNG | one sheet slot fits any animal |
| Ground contact | bottom centre, **fixed at y = 488** | swap animals mid run and nothing hops |
| Standing height | 76% of canvas (about 390px) | four animals stay the same size on the road |
| Headroom | top 8% empty | ear tips and jump stretch have somewhere to go |
| Bottom margin | 24px below contact | land squash and the shadow overlap live here |
| View, gameplay | 3/4 rear, camera about 12 degrees above | see section 0 above |
| View, menu | front 3/4 | you want the face on a select card |
| Authoring rate | 12 fps | engine interpolates upward |
| Shadow | **none baked in** | engine draws the contact shadow |
| Outline | soft warm `#3a2c1d`, 3 to 4px at 512 | matches the locked palette |
| Trim | content plus 4% padding, then place on the 512 canvas at the contact point | |

### Symmetry buys you a third of the work

Design every animal **symmetric from behind**. No single side collar tag, no one ear flopped,
no patch over one eye that is visible from the rear. If the rear silhouette is symmetric then
**BANK RIGHT is the engine flipping BANK LEFT horizontally**, and you never draw it. That is
3 frames saved per animal, 12 across the set, and it is free.

If you want an asymmetric detail, put it somewhere the rear camera never sees: the chest, the
face, the underside.

### The silhouette test, before you accept any frame

Drop the frame to **58px tall and fill it flat black**. 58px is the smallest the animal is
ever drawn (the select strip). If you cannot tell run from slide from caught in pure black at
58px, the pose is not readable and the frame is not done. Put the whole run cycle in one black
column on a contact sheet and look at the column, not the frames.

### Style prompt stub

Paste this into every generation, then add the frame description:

> flat cel shaded mobile game asset, chunky rounded toy like shapes, soft warm dark outline,
> single soft top light, saturated cheerful palette, transparent background, centred, no drop
> shadow, clean vector style, three quarter rear view, camera slightly above and behind

---

## 1. The budget, in plain numbers

| Set | Frames per animal | Four animals | What it buys |
|---|---|---|---|
| **CORE** | **24** | **96** | every animal playable and correct on the road |
| **FULL** | **46** | **184** | menus, celebration, power ups, near miss recovery |
| **SHARED FX** | 22 total, **not per animal** | 22 | dust, speed lines, magnet ring, jetpack trail, impact |

**Recommendation: generate CORE for the puppy, look at it in the game, then CORE for the
other three.** That is 96 frames and it makes all four animals shippable. FULL is the upgrade
pass and nothing in it blocks a release.

---

## 2. CORE 24 — gameplay, 3/4 rear

### 2a. RUN — 8 frames, seamless loop

The spine of everything. Author it first and get it right before any other state, because
every other state either leaves the run or returns to it.

| # | Frame | Pose |
|---|---|---|
| 01 | contact L | left fore paw plants, body at mid height, weight forward, tail up and trailing |
| 02 | down L | body at its lowest, front leg compressed, ears at their lowest, tail levels out |
| 03 | pass L | legs crossing under the body, body rising, tail begins to lift |
| 04 | up L | push off, body at its highest, all four paws near the ground line but light, ears lift |
| 05 | contact R | right fore paw plants, mirror of 01 in body mechanics, not a flipped image |
| 06 | down R | body lowest again |
| 07 | pass R | legs crossing |
| 08 | up R | push off, highest |

Rules for the cycle:
- **Frame 08 must flow into frame 01 with no pop.** Loop it before you accept it.
- Body height should rise and fall about **7% of standing height**, no more. A big bounce
  reads as a hop, not a run, and it fights the engine's own bob.
- **Ears and tail trail the body by two frames.** That lag is most of what sells weight.
- No head turn. The head stays forward, because the player is reading the road past it.

### 2b. JUMP — 6 frames

| # | Frame | Pose |
|---|---|---|
| 09 | anticipation | deep crouch, haunches loaded, ears back, nose down. One frame only, it happens fast |
| 10 | launch | rear legs extended hard, body stretched forward and up, front paws reaching |
| 11 | rise | body long and stretched, legs beginning to tuck, ears blown back, tail streaming |
| 12 | peak | apex, legs fully tucked under, body compact and rounded, ears UP, tail curled |
| 13 | fall | front paws reaching down for the ground, body opening out, ears starting to lift |
| 14 | land | crouch absorb, all four down, body compressed, ears forward |

The engine's jump apex is about 1.3 body heights and the whole arc is roughly 0.6s, so frames
11 to 13 carry most of the airtime. Make **peak** the frame you would put on a poster.

### 2c. SLIDE — 4 frames

| # | Frame | Pose |
|---|---|---|
| 15 | drop | front paws thrown forward, chest dropping toward the ground, rear still high |
| 16 | skid | fully flat and stretched long, belly near the road, ears pinned back, tail straight out |
| 17 | hold | the sustained low pose, a touch of forward lean, dust at the paws |
| 18 | recover | rising, front legs pushing the chest back up, ears lifting |

The engine holds the slide about 0.55s, so **frame 17 is on screen longest**. It has to be the
best looking of the four, not a tween between 16 and 18.

### 2d. BANK LEFT — 3 frames  *(draw left only, engine flips for right)*

**This is the frame set the game is missing entirely, and it is the one that will make lane
changes feel like driving instead of teleporting.** Right now the animal slides sideways with
no change of pose at all.

| # | Frame | Pose |
|---|---|---|
| 19 | lean in | body tilts left about 12 degrees, inside shoulder drops, tail swings right as counterweight, head leads into the turn |
| 20 | hold | full lean, about 18 degrees, legs crossing under toward the new lane, ears streaming right |
| 21 | settle | coming back to level, tail still trailing right, a beat of overshoot before the run resumes |

Tilt the whole body. Do not just translate it. The counterweight tail is the tell that sells
it.

### 2e. CAUGHT — 3 frames

The punctuation on every single run, so it is worth more care than its frame count suggests.
Make it readable and a little funny. Nobody should feel punished.

| # | Frame | Pose |
|---|---|---|
| 22 | startled | all four legs braced, ears straight up, tail rigid, body recoiling back |
| 23 | tumble | off the ground, rotated about 40 degrees, legs splayed, ears flying |
| 24 | flat | landed on the rump, sitting, dazed, ears drooped, tail flat, one back leg out |

Frame 24 is the one that holds under the game over card, so it must read at a glance and it
must be endearing.

---

## 3. FULL SET — the other 22

### 3a. IDLE — 4 frames, front 3/4, loop
Used on the select screen and behind the title. Gentle breathing, a two beat tail wag, one
slow blink across the cycle. Frames: `neutral / inhale / tail left / tail right`.

### 3b. PORTRAIT — 1 frame, front 3/4, static
The hero shot for the select card. Head and chest, three quarter, looking slightly off camera,
warm and confident. This is the frame that sells the animal, so give it the most polish of
anything in the pack.

### 3c. CELEBRATE — 4 frames, front 3/4, loop
New best distance. A bounce with the front paws leaving the ground, ears up, tail going hard.
Frames: `crouch / launch / air, paws up / land`.

### 3d. LAND RECOVER — 2 frames, rear
Bridges JUMP frame 14 back into RUN frame 01 without a snap. `deep absorb / rising`. Cheap
frames, large payoff, because landing is the most frequent transition in the game.

### 3e. STUMBLE AND RECOVER — 3 frames, rear
A near miss that does not kill. Nothing in the game currently rewards a close call, and a
visible stumble is what makes a near miss feel like one.
`clip and lurch / one leg out, off balance / catch it and go`.

### 3f. JETPACK — 8 frames, rear
The rainbow poop jetpack is the game's signature moment and it currently reuses the run pose
in the air.

| Set | Frames | Pose |
|---|---|---|
| rise | 2 | legs kicking down, body tipping nose up, ears blown flat |
| fly loop | 4 | airborne, body level and slightly nose up, legs paddling slowly, ears streaming, tail flat out. Loops seamlessly |
| drop | 2 | nose comes down, legs reach for the road, ears forward |

### 3g. MAGNET
**No new character frames.** Magnet is an FX overlay on the run cycle (see 4d).

---

## 4. SHARED FX — drawn ONCE, used by all four animals

These are not per animal. Draw them once in neutral colours and the engine tints them.

| # | Asset | Frames | Notes |
|---|---|---|---|
| S1 | paw dust puff | 4 | fires on every run contact frame. Small, warm grey, dissipates upward and back |
| S2 | landing impact ring | 3 | flat elliptical ring on the road, expands and fades |
| S3 | slide dust trail | 4 | longer, lower, streams backward from the paws |
| S4 | speed lines | 3 | thin warm streaks at the screen edges, only above the speed threshold |
| S5 | magnet ring | 4 loop | pulsing gold ring around the animal, seen from 3/4 rear so it is an ellipse not a circle |
| S6 | jetpack rainbow trail | 4 loop | the signature. Seven band rainbow puffs, cartoon, rounded, NOT a smooth gradient |
| S7 | caught impact star | 3 | comic style burst behind the animal on the hit frame |
| S8 | biscuit pickup pop | 4 | small warm burst plus the value floater |
| S9 | contact shadow | 1 static | soft ellipse, engine scales it by depth and by jump height |

Nine assets, 22 frames total, and every animal uses all of them.

---

## 5. Delivery

```
/art/characters/<animal>/  run_01..08.png  jump_09..14.png  slide_15..18.png
                          bank_19..21.png  caught_22..24.png
                          idle_01..04.png  portrait.png  celebrate_01..04.png
                          land_01..02.png  stumble_01..03.png
                          jet_rise_01..02.png  jet_fly_01..04.png  jet_drop_01..02.png
/art/fx/                  dust_01..04.png  land_ring_01..03.png  ...
```

Per state, one horizontal strip `<state>_sheet.png` plus a sibling
`<state>.json` holding `{frameWidth, frameHeight, frames, fps}`. Single frames are fine to
start with and the engine will take either.

---

## 6. The order to actually make them in

1. **Puppy RUN, 8 frames.** Stop. Put them in the game and look at the loop at real size.
2. Puppy JUMP and SLIDE, 10 frames. Look again.
3. Puppy BANK LEFT, 3 frames. This is the one that will surprise you.
4. Puppy CAUGHT, 3 frames. That is CORE 24 for the hero, and the puppy is done.
5. **Look at the whole thing in the game before touching the other three animals.** If the
   puppy is wrong, it is wrong four times over.
6. Kitten, bunny, fox CORE 24 each, same prompts, changed subject and palette.
7. SHARED FX.
8. FULL set upgrades, hero first.

---

*Palette, resolution and naming conventions come from `PUPPY_DASH_ART_BIBLE.md` in
`satellites/puppy-dash/drop/`. Where this sheet and the bible disagree, this sheet is newer:
it adds BANK, LAND RECOVER, STUMBLE and the JETPACK set, it fixes the frame counts to match
the engine's real timings, and it makes the rear view non negotiable.*
