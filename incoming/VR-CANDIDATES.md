# WHICH GAMES GO TO VR, AND WHY NOT FIVE

Written 2026-08-16 in answer to: *should I whittle it down to my top five games and make
them more VR friendly?* Companion to `incoming/VR-PLAN.md`. Nothing here is built.

Short version: **whittle to two, not five, and pick them by whether the player's body does
something rather than by which games are best.** "VR friendly" is the specific thing to avoid.

---

## 1. THE TRAP IN THE WORD "FRIENDLY"

Three different things get called VR and only two of them are worth doing.

| | What it is | What a player thinks | Cost |
|---|---|---|---|
| **2D PWA on the store** | The arcade, in a floating window | "A window full of little games. Neat." | days |
| **"VR friendly" 2D game** | A flat game on a curved panel, maybe head tracking | "This isn't VR." Two stars. | weeks |
| **Native VR** | The third dimension is load bearing | "Oh." | 4 to 8 weeks each |

The middle row is the one to never ship. It costs almost as much as the real thing and it
gets punished harder than the honest 2D window does, because the 2D window never claimed to
be VR and this one did. Taking five good 2D games and making them "more VR friendly" lands
five titles in the middle row.

**The store rewards one great title enormously more than five adequate ones.** Every title
needs its own icon set, hero art, screenshots, capture video, IARC questionnaire and review
cycle. Five of those is months of paperwork around work that was already the wrong work.

---

## 2. THE SELECTION TEST

Not "which are our best games." The question is:

> **Does the player's body do something a thumb cannot?**

Reach, aim, throw, lean, look around a thing, hit something in space. If the answer is no,
the game is better as a 2D window and there is no shame in that.

Second question, and it is nearly as important:

> **Does the camera translate without the player asking it to?**

That is motion sickness, it is the number one reason VR titles get bad reviews, and Meta's
review checks comfort explicitly. A game where you stand still and the world comes to you is
comfortable by construction. A game that moves you is a design problem before it is a code
problem.

---

## 3. THE PICKS

### ⭐ 1. CREATE A CRITTER — the strongest candidate, and the handoff never mentioned it

**Camera today:** `camera.lookAt(0, 0.72, 0)` with an orbit around a fixed origin. The player
circles a thing that stays put. **That is already the ideal VR camera.** Zero locomotion,
zero nausea, nothing to redesign. Of everything in the catalog this is the one that is
comfort safe before anyone writes a line of XR code.

**What is already built:** a SkinnedMesh with bones, procedural walk, dance, idle, blink,
wag and hop, feed and cuddle interactions, and seven references to inflating a drawing into
a body. It is a real animated creature, not a static model.

**Why VR is an upgrade and not a port:** the whole game is *you drew a scribble and it came
alive*. On a phone that happens in a 6 inch rectangle. In a headset it happens **on the table
in front of you at real scale**, and then it walks toward you and you put your hand out and
feed it. That is a thirty second demo that sells itself, and thirty second demos are what
get featured.

**Work:** smallest of the four. The creation step is drawing, which is currently 2D; a slate
floating in front of the player works fine and is the safe version. Drawing in the air is the
ambitious version and should not be v1.

**Risk:** it has the most 2D UI of the candidates, and every panel has to become something you
point at. That is real but it is bounded.

### 2. SUPER SLICE 3D — the base game only, and this matters

**Throwing a knife with a motion controller is a proven VR verb** and you do it standing
still. The forest game ("flip the knife through a 3D forest slicing fruit") is a good fit.

⛔ **The three variants are comfort hazards and should not go near a headset:**

```
  Super Slice Wall Climb      flip your knife UP one giant wall
  Super Slice 3D Free Fall    flip your knife DOWN a shaft of shelves and slabs
  Super Slice Endless Fall    one shaft with NO BOTTOM, scored on how far you fall
```

Sustained vertical camera translation is close to the worst comfort profile there is, and
"endless fall" is the literal worst case. The code confirms it: a chase camera that
`lerp`s after the player, with an intro sweep that "reels in via the chase lerp". In a
headset that is a sickness generator. **Ship the forest, never the falls.**

I named Super Slice as a runner up in the first VR plan without checking which variant. That
was too loose and this corrects it.

### 3. DEWBALL — high ceiling, needs a camera rethink first

**Camera today:** `camera.position.set(bx0 - sin(camYaw)*cos(camPitch)*dist0, …)` chasing a
rolling ball. That is artificial locomotion and it is the one thing v1 must not have.

**But the fix is a better game, not a compromise.** Dewball is "six little worlds". Put them
on a table. The player stands over a small planet, the dew bead rolls around it, and they
lean in to see. That is the Moss and Astro Bot framing: proven comfortable, and people love
it specifically *because* the world is small and precious and you are a giant looking in.
The globe structure means the world can rotate under the ball rather than the camera flying
after it.

**Work:** a real camera and control redesign. Highest ceiling of the three that already exist.

### 4. PADLAB IN VR — the biggest differentiator and the most work

**State today:** zero Three.js, 41 audio nodes, 67 marble references. The instrument exists.
The 3D does not. This is a from scratch build, not a port.

**On the music point, which is right and being undersold:** spatial audio in VR is genuinely
transformative rather than a nice extra, `THREE.PositionalAudio` gives every pad and every
marble an actual location in the room, and the person building it is a producer with his own
sounds. That is a real edge and almost nobody else has it.

⛔ **But do not build a rhythm game.** Beat Saber owns that floor and Synth Riders, Audica and
Trombone Champ hold the rest of it. Competing there as a solo studio in WebXR is a losing
fight. **Build an instrument.** Virtuoso is the reference: not "hit the prompt in time" but
"here is a thing you play". That corner is far less crowded, it matches what the tool already
is, and it is the only one of these four where the studio has an unfair advantage.

---

## 4. WHAT I WOULD ACTUALLY DO

**Two titles. Create A Critter first, then one of Dewball or PadLab.**

Critter first because it is the only one that is comfort safe with no redesign, it has the
best thirty second demo, and it is the smallest build. It is the fastest possible proof that
this whole direction is worth more time.

Then pick the second from measured results, not from taste. If the Critter listing gets
traffic, Dewball is the safer follow up. If it gets *attention*, PadLab is the one worth
betting weeks on, because it is the one nobody else can copy.

**Run the 2D store listing in parallel and start it now.** It is days of work, it does not
compete with any of the above for time, and it is the fastest answer to "we built so much
stuff that nobody uses". A VR title takes 4 to 8 weeks before anyone sees it.

---

## 5. ON THE ART TOOLS

**MidJourney is a 2D tool and its 360 output is not reliable.** It can be pushed toward
equirectangular with `--ar 2:1 --tile` and an "equirectangular projection" prefix, but the
results are documented as unstable with visible seams that need cleaning up by hand. Usable
for a distant backdrop, not for a world.

**Skybox AI (Blockade Labs) is the purpose built one** — equirectangular to 8K, depth maps,
and an experimental GLB mesh export. **Free tier is 5 preview generations, then $20/month.**
Worth naming honestly since the VR plan said every path was $0 and this one is not.

**But the more useful point: a skybox is a backdrop, not a world.** What makes a headset feel
like a place is geometry near your hands, at a scale your body believes. A gorgeous 8K sky
behind a scene with nothing in reach still feels like a photo. All three existing candidates
already have their geometry and already have a look.

**So the scarce resource here is not art, it is staging.** How big is the critter. Does it
stand on a table or on the floor. Where are your hands when it walks up. How far away is the
dew world and can you lean past its horizon. None of that is generated by a prompt, and all
of it is the difference between a demo people talk about and one they take the headset off
during.

---

## 6. THE HONEST NUMBERS

- One native VR title: **4 to 8 weeks** of real work before anyone can play it.
- The 2D store listing: **days**, and it can start immediately.
- Free apps on the Horizon Store get very little organic traffic **unless featured**. One
  polished, comfortable, thirty-second-demo title has a real shot at that. Five ports do not.
- Quest 2 is discontinued hardware. Building to it as the performance floor is correct and
  guarantees headroom on 3 and 3S, which is where the actual audience is now.
