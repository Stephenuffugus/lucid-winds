# TUMBLE pocket finds, the art sheet (23 Sep 2026)

Stephen: "the images we have are absolute trash ... the screw doesn't even look like a screw ... we need to make sure
that everything stays continuous." Thirty small things that come out of the wash. Today each is drawn from a recipe of
a few flat shapes (`data/finds.json`), which reads at 62 px in the Drawer's Pockets page and at 150 px on a card.

## How the art comes in (already wired)

Drop a PNG per find at `satellites/tumble/assets/finds/<id>.png` (the ids are below), then list the ids you dropped in
`satellites/tumble/assets/finds/manifest.json` as a JSON array of strings. The game keeps drawing the recipe first and
lays the PNG over it the moment it loads, so a missing or slow file never leaves a hole, and the ledge in the room
(3 px things) keeps the recipe. Size: 512 x 512, transparent background, the object filling about 80 percent of the
square, centred. Nothing else changes.

## One style, pasted at the top of EVERY prompt (this is the continuity)

> A single small everyday object on a transparent background, centred, filling most of a square frame. Soft hand
> painted gouache look with a little visible paper grain, warm muted colours (cream, sage, rust, denim blue, brass),
> one soft light from the upper left, a faint contact shadow under the object and no other shadow, thick rounded
> edges, no outline, no text, no people, no hands, no background scene, no pattern behind it. The object is slightly
> worn, as if it has been through the wash. Square, 1024 x 1024.

Then one line for the thing. Keep the same seed or reference image across the batch if the tool allows (Meshy: use
the first accepted image as the style reference for the rest; ChatGPT: keep every request in one conversation and say
"same style as the last one"). Generate the six of one set together, look at them side by side, and only then the
next set: things in a set sit together in a shadow box in the room and must look like they were painted by one hand.

## The thirty, by set (id, name, the thing to paint)

### The Coat Pocket of a Tall Man (coat-pocket-of-a-tall-man), label on the box: "from one coat, one winter"

- `find-half-a-lip-balm` **Half a Lip Balm** (common). Survived the wash. Again.
  Paint: half a lip balm, exactly that and nothing else, its colours near tube #f7f5f0, ink #807868, balm #e3d2a8, band #c6bdac, dent #ddd7c9, shine #ffffff.
- `find-guitar-pick` **The Guitar Pick** (uncommon). Knows four chords and one very long story.
  Paint: the guitar pick, exactly that and nothing else, its colours near pick #d2382f, ink #75201a, shine #ef8078.
- `find-soft-receipt` **Receipt Gone Soft** (common). The total is now between us and the water.
  Paint: receipt gone soft, exactly that and nothing else, its colours near paper #fbfaf6, ink #7e776a, bar #4e4c48, faint #a09a8c.
- `find-coat-button` **The Spare Coat Button** (common). Was included for a reason nobody remembers.
  Paint: the spare coat button, exactly that and nothing else, its colours near shell #6b4526, ink #33200f, mottle #a56f38, hole #2a1a0e.
- `find-coat-check-claim` **Coat Check Claim 47** (uncommon). The coat made it home. The number stayed.
  Paint: coat check claim 47, exactly that and nothing else, its colours near card #f6efdd, ink #5d5341.
- `find-pocket-screw` **One Tiny Screw** (rare). Definitely important to something. Probably not this.
  Paint: one tiny screw, exactly that and nothing else, its colours near steel #c8ccd2, ink #5f6469, slot #7c8288.

### A Child Was Definitely Here (a-child-was-definitely-here), label on the box: "found at knee height"

- `find-blue-marble` **The Blue Marble** (common). Was missing for eleven minutes and blamed everyone.
  Paint: the blue marble, exactly that and nothing else, its colours near glass #cfe1f0, ink #6f8ca4, cobalt #2a5bbf, cobalt2 #5f8fe0, shine #ffffff.
- `find-crayon-nub` **Green Crayon Nub** (common). Still has one drawing left in it.
  Paint: green crayon nub, exactly that and nothing else, its colours near wax #2f6f3a, worn #489a55, ink #1a4222, band #e7d9a8, crease #bfae78.
- `find-toy-wheel` **A Very Small Wheel** (uncommon). Its vehicle has moved on without it.
  Paint: a very small wheel, exactly that and nothing else, its colours near rubber #2c2c30, ink #101013, groove #4a4a52, hub #f0c020.
- `find-star-backing` **Sticker Backing Star** (common). The good part is on something else now.
  Paint: sticker backing star, exactly that and nothing else, its colours near paper #fcfbf7, ink #867e6c, ghosta #e79cbb, ghostb #8fc9a6, ghostc #9db4e0.
- `find-acorn-cap` **Acorn Cap Only** (uncommon). The acorn had other plans.
  Paint: acorn cap only, exactly that and nothing else, its colours near cap #8a5a2c, ink #402711, stem #6d4520, tex #5f3a17, lip #c9a06a.
- `find-googly-eye` **Single Googly Eye** (rare). Has been watching the spin cycle professionally.
  Paint: single googly eye, exactly that and nothing else, its colours near white #fbfbf8, ink #8f8c82, pupil #16161a, shadow #dbd7cc.

### Night Out, Apparently (night-out-apparently), label on the box: "the evidence, kept"

- `find-ticket-stub` **The Ticket Stub** (common). The show was better than the parking.
  Paint: the ticket stub, exactly that and nothing else, its colours near card #e98a74, ink #8a4231.
- `find-earring-back` **One Earring Back** (common). Its earring is doing fine somewhere else.
  Paint: one earring back, exactly that and nothing else, its colours near gold #dcae4a, gold2 #f0cf78, ink #7e5a1c.
- `find-paper-wristband` **Paper Wristband** (uncommon). Entry granted. Getting back in seems unlikely.
  Paint: paper wristband, exactly that and nothing else, its colours near neon #f27a1a, ink #8a4208, tape #f7ab63.
- `find-mint-wrapper` **Emergency Mint Wrapper** (common). The emergency passed. The wrapper persisted.
  Paint: emergency mint wrapper, exactly that and nothing else, its colours near foil #3f9e63, foil2 #6ec18a, ink #1c5030, shine #bce8ca.
- `find-confetti-star` **One Foil Star** (uncommon). Stayed for cleanup. Nobody asked it to.
  Paint: one foil star, exactly that and nothing else, its colours near gold #e3b93f, gold2 #f7e09a, ink #8a6612.
- `find-photo-strip` **Photo Booth Strip, Mostly Gone** (once). The water kept the part that mattered.
  Paint: photo booth strip, mostly gone, exactly that and nothing else, its colours near paper #efece4, ink #5e5a53, frame #7d776d, washed #b6b0a5, pale #d8d3c8, ghost #eae6dc, faint #c9c4b9.

### Useful Until Washed (useful-until-washed), label on the box: "all of it still works"

- `find-bobby-pin` **The Bobby Pin** (common). Has escaped every bathroom drawer it ever entered.
  Paint: the bobby pin, exactly that and nothing else, its colours near metal #2a2a2f, ink #0d0d10, sheen #6c6c77.
- `find-safety-pin` **Closed Safety Pin** (common). Closed before washing. A professional.
  Paint: closed safety pin, exactly that and nothing else, its colours near nickel #c3c7cc, nickel2 #dde1e5, ink #62666b.
- `find-tape-bit` **Eleven Inches of Tape Measure** (uncommon). The remaining inches declined to participate.
  Paint: eleven inches of tape measure, exactly that and nothing else, its colours near tape #e8c341, tape2 #f6e08c, ink #6f5709.
- `find-hair-tie` **The Hair Tie** (common). Stretched past dignity, still technically employed.
  Paint: the hair tie, exactly that and nothing else, its colours near elastic #242429, ink #0c0c0f, fuzz #4e4e57, sheen #5c5c66.
- `find-notepad-wad` **Three Notes, Now One** (uncommon). Whatever they said has become very concise.
  Paint: three notes, now one, exactly that and nothing else, its colours near paper #cfdced, ink #76899f, crease #a3b3c6.
- `find-spare-shoelace` **The Spare Shoelace** (rare). Never met the shoe it was promised.
  Paint: the spare shoelace, exactly that and nothing else, its colours near lace #f0e6d2, ink #9c8e74, aglet #b09c78.

### Things Nobody Throws Away (things-nobody-throws-away), label on the box: "no reason, no plans"

- `find-washer` **The Washer** (common). Not the appliance. Somehow less useful.
  Paint: the washer, exactly that and nothing else, its colours near steel #c6cad0, ink #666b71, shade #9ba0a7, rust #a5703f.
- `find-bread-tag` **Bread Tag, Blue** (common). No bread has claimed it in weeks.
  Paint: bread tag, blue, exactly that and nothing else, its colours near blue #2f7fd0, ink #14477c, edge2 #5aa1e6.
- `find-smooth-pebble` **The Good Pebble** (uncommon). Picked for a reason. The reason remains solid.
  Paint: the good pebble, exactly that and nothing else, its colours near stone #4a4a4f, ink #27272b, quartz #ded9cf, sheen #6d6d75.
- `find-plastic-cap` **Cap to Something** (common). Its bottle has entered witness protection.
  Paint: cap to something, exactly that and nothing else, its colours near orange #ea7a22, orange2 #f8b071, orange3 #fbcfa5, ink #8a4008, rib #c2620f.
- `find-hotel-keycard` **Room 214 Keycard** (rare). Checkout was at eleven. It missed the meeting.
  Paint: room 214 keycard, exactly that and nothing else, its colours near teal #2c7c7a, ink #123a39, cream #f2ead6, stripe #19504e.
- `find-brass-key` **The Brass Key to Nothing Here** (once). Has remained optimistic about this door.
  Paint: the brass key to nothing here, exactly that and nothing else, its colours near brass #c99a3e, brass2 #e5bd63, ink #6a4a10, thread #b0392f.

## What not to do

- No two things the same colour and silhouette in one set (they sit together).
- No coins (coins are the jar's, drawn by the game) and no socks.
- No brand marks, no readable words on labels.
- Do not upscale a tiny image: generate at 1024 and downscale to 512.
