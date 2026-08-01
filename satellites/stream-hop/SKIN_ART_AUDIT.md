# Jumping Jimothy — skin art consistency audit

**Date:** 2026-08-01 · **Method:** every `idle.png` opened and looked at against `assets/hero/idle.png`,
plus FX poses, plus objective metrics (bbox aspect, mean saturation/value, dark-pixel fraction,
local-gradient detail density, alpha edge softness, chroma residue) over all 589 frames.
**Scope:** 31 skins in `assets/skins/` (the brief said 14; there are 31).

---

## THE ANSWER TO THE DIRECTOR'S QUESTION

**Yes, be concerned — but not evenly, and not expensively.**

The drift is real and it is not subtle: there are **six distinct art styles** in the set, and the
original is only one of them. Three skins are genuinely by "the same hand". Ten are the same hand
with the wrong face. Eighteen read as different artists.

**But the money is mostly fine.** The $3 supporter pack is 14 costumes
(`PACK_COSTUMES`, index.html:1281): soggy, summer, nordic, barista, fishmonger, grad, labcoat,
deckhand, market, hardhat, scout, firstfrost, garage, shark. Of those:

| Paid pack (14) | count |
|---|---|
| MATCHES | 3 |
| CLOSE | 8 |
| OFF | 3 |

Every one of the worst offenders — Shinothy, Disco, Barnacle, and the entire cute-mascot cluster —
is **free, earned, or secret content**. The paid promise can be brought to one style by regenerating
**three** costumes and repainting the faces on eight. That is a bounded job, not a re-do.

### The one finding that should decide the schedule

`assets/ui/sup-banner.jpg` — the banner that *sells the $3 pack* — shows seven pack costumes
(soggy, summer, nordic, barista, grad, fishmonger, labcoat) **all drawn correctly in the original's
style**: big white googly eyes, painterly fur, spindly limbs, muted rain-lit palette.

**All seven of the actual sprites have naturalistic animal eyes instead.**

The advertisement and the product do not match. On a paid store page that is the version of this
problem that costs money. It also settles the direction question: the banner proves the intended
house style is the hero's, so the skins drifted — the hero is not the odd one out.

---

## 1. THE REFERENCE — `assets/hero/idle.png`

Precise enough to prompt from:

> A grotesque-cute cartoon raccoon, **painted, not vector**. Body plan: one big heavy pear-shaped
> mass of a torso with a low-slung belly, a head that sits directly on it with almost no neck, and
> **thin, spindly, almost insect-like limbs** ending in oversized, splay-toed, individually
> articulated paws with visible claws. He hunches. Weight forward, shoulders up.
> Face: **huge round white sclera eyes with tiny black pupils**, set wide, slightly googly and
> off-kilter — a comic stare, never a naturalistic animal eye. Black bandit mask over cream brow
> band. Small dark triangular nose, wide toothy lopsided grin, long fine white whiskers.
> Rendering: **directional painterly fur strokes**, individual hairs visible, gritty texture over the
> whole body. Ragged dark brown-black ink outline of **varying weight**, rough and broken, never a
> clean uniform vector stroke. Shading is painted form-shadow, not cel bands, not smooth airbrush
> gradient. A **warm ochre rim light** down one edge.
> Palette: **desaturated warm earth** — ochre, dust brown, grey-taupe, bone. Overall dark
> (mean value ≈ 0.38). Saturated colour appears **only on props**, never on the animal.
> Tail: thick, bushy, banded dark/tan rings.
> Transparent background. **No baked ground shadow** (the engine draws it). Frame FX (coin swirls,
> speed sparks, water burst, shield bubble) are painted into the pose in the same gritty style.

Measured fingerprint of the reference (`idle`):

| metric | hero |
|---|---|
| bbox aspect (w/h) | **0.87** (squat) |
| mean saturation | **0.34** (low) |
| mean value | **0.38** (dark) |
| dark-pixel fraction (v<0.18) | **0.28** (heavy outlines/shadow) |
| detail density (local gradient) | **21.5** (very high — fur) |
| median hue | 33° (warm ochre) |

⚠️ **The hero is also the lowest-resolution asset in the game.** Hero frames average **222 px** tall;
skin frames average **323 px** — the original is ~31% softer than everything it is meant to anchor.
Invisible at gameplay size (`TILE=60`, drawn ~59 px) but visible in collection portraits and in any
zoomed store screenshot. See remediation Tier 4.

---

## 2. PER-SKIN VERDICTS

Verdict definitions, stated plainly:

- **MATCHES** — ships as is.
- **CLOSE** — the *painting* is right; the fix is a targeted repaint of the face (eyes) and/or a
  desaturation/contrast pass. Keep the asset, do not regenerate the character.
- **OFF** — regenerate. The body plan, face or rendering language is from a different house style
  and no colour pass reaches it.

`§` = in the paid `PACK_COSTUMES`.

| Skin | Cluster | Verdict | What is different | Cheapest fix |
|---|---|---|---|---|
| **deckhand** § | C1 Core | **MATCHES** | Nothing. Googly eyes, pear body, spindly limbs, muted palette, matching FX. | none |
| **market** § | C1 Core | **MATCHES** | Nothing. Best-in-set face match. | none |
| **hardhat** § | C1 Core | **MATCHES** | Safety-orange kit is saturated, but it is a prop — correct per house rule. | none |
| **summer** § | C2 Painterly-nat | **CLOSE** | Eyes hidden behind shades so the face mismatch is masked; `cheer.png` has a garish magenta/yellow starburst far outside the muted palette. | desaturate the `cheer` burst |
| **soggy** § | C2 Painterly-nat | **CLOSE** | Naturalistic brown eyes instead of googly sclera. Fur, palette, limbs all correct. | eye repaint |
| **nordic** § | C2 Painterly-nat | **CLOSE** | Naturalistic amber eyes. Everything else on-model. | eye repaint |
| **barista** § | C2 Painterly-nat | **CLOSE** | Naturalistic eyes; upright human posture with real shoulders instead of the hunch. | eye repaint |
| **fishmonger** § | C2 Painterly-nat | **CLOSE** | Naturalistic half-lidded eyes; upright stance. | eye repaint |
| **scout** § | C2 Painterly-nat | **CLOSE** | Naturalistic eyes. Limbs/toes/fur are an excellent match. | eye repaint |
| **firstfrost** § | C2 Painterly-nat | **CLOSE** | Eyes shut so face reads neutral; body slightly rounder/softer than hero. | eye repaint on open-eye poses |
| **garage** § | C2 Painterly-nat | **CLOSE** | Large naturalistic **doe** eyes — reads cute, not grotesque. Fur is excellent. | eye repaint |
| **knight** | C2 Painterly-nat | **CLOSE** | Naturalistic amber eyes, upright humanoid, flatter than hero. Cardboard texture is good. | eye repaint + slight desaturate |
| **mothman** | C2 Painterly-nat | **CLOSE** | Dead-on symmetrical frontal stance nothing else uses; glowing red eyes (intentional). Flatter body. | leave; secret, low exposure |
| **shark** § | C4 Cute mascot | **OFF** | Flat cel-shaded vinyl onesie, no fur language, chubby upright body, aspect 0.66 vs hero 0.87. **Only paid-pack skin in the cute cluster.** | regenerate |
| **grad** § | C3 Storybook | **OFF** | **Quadruped stance** — unique in the set. Sleepy half-lidded naturalistic eyes. Reads as a different character, and contradicts its own banner art. | regenerate |
| **labcoat** § | C3 Storybook | **OFF** | Anthropomorphic upright "furry" build with human shoulders/arms; amber naturalistic eyes; smoother render (detail 13.4 vs 21.5). Contradicts its banner art. | regenerate |
| **trashking** | C3 Storybook | **OFF** | Fantasy/TCG concept-art genre. Upright heroic build, narrow shoulders, saturated magenta/olive (sat 0.51), naturalistic serious eyes. | regenerate |
| **pirate** | C3 Storybook | **OFF** | Smooth storybook render, fur detail collapses to 11.1; upright humanoid with waist and boots; small naturalistic eyes. | regenerate |
| **richuncle** | C3 Storybook | **OFF** | **Cool grey** palette against the hero's warm ochre; soft airbrushed fur with **no ink outline**; chubby upright. | regenerate |
| **astronaut** | C4 Cute mascot | **OFF** | Cel + soft-gradient shading, light value (0.59 vs 0.38), smug half-lid eyes, low detail (15.0). Magenta visor tint reads as a chroma halo at thumbnail size. | regenerate |
| **wizard** | C4 Cute mascot | **OFF** | Flat cel, detail 11.4, cute small eyes, saturated blue robe. | regenerate |
| **alien** | C4 Cute mascot | **OFF** | Glossy metallic gradients, glowing accents, smug half-lids. | regenerate |
| **hazmat** | C4 Cute mascot | **OFF** | Flat saturated yellow suit, aspect 0.59 (tall/thin), no fur language. | regenerate |
| **froggery** | C4 Cute mascot | **OFF** | Flat saturated green, glossy, aspect 0.58 — the narrowest silhouette in the set. | regenerate |
| **dino** | C4 Cute mascot | **OFF** | Glossy vinyl, saturation 0.64 (2× hero), hue 76° green — furthest hue from house warm. | regenerate |
| **chicken** | C4 Cute mascot | **OFF** | Value 0.73 — nearly twice the hero's; almost no dark pixels (0.04 vs 0.28), so it has effectively no outline weight. | regenerate |
| **robot** | C4 Cute mascot | **OFF** | Flat metallic vector-ish, yellow eyes, aspect 0.59. | regenerate |
| **ghost** | C4 Cute mascot | **OFF** | Soft airbrush, **no dark outline at all** (dark 0.03), lowest detail in set (9.5), cute sad doe eyes. Ethereal treatment is defensible; the *face* is not. | regenerate (lowest priority) |
| **disco** | C5 Glam gloss | **OFF** | Hard specular highlights, sparkle overlays, saturated gold/teal, glossy cel. Different medium entirely. | regenerate |
| **shinothy** | C5 Glam gloss | **OFF** | **Worst offender.** Anime/gacha vector-gloss, neon particle glow on the tail, chibi head-to-body ratio, hard rim highlights. Nothing about it is the same artist. | regenerate |
| **barnacle** | C6 Human | **OFF** | **Not a raccoon.** A human caricature (bald head, human face, hands, shoes) with ears and a tail attached. Smooth glossy caricature render. Deliberate as a gag, but it breaks the set on sight. | Director's call — see note |

**Totals: MATCHES 3 · CLOSE 10 · OFF 18.**

> **Barnacle note.** This is `via:'code'`, one code, handed to one person. It is a private joke and it
> is *good at being that*. It will never appear on a store page unless you put it there. My
> recommendation is: keep it exactly as it is, and simply never screenshot it. It is counted OFF
> for accuracy, not as a work item.

---

## 3. THE CLUSTERS, RANKED BY DISTANCE FROM THE ORIGINAL

**C1 — GRIMY GOOGLY (distance 0) — the original's cluster.**
`hero` · deckhand · market · hardhat
Googly white-sclera eyes, hunched pear body, spindly splay-toed limbs, painterly fur, muted warm
earth, ragged ink outline, matching baked FX. Four assets out of thirty-two.

**C2 — PAINTERLY NATURALIST (distance 1) — right brush, wrong face.**
soggy · summer · nordic · barista · fishmonger · scout · firstfrost · garage · knight · mothman
Identical rendering language to C1 — same fur strokes, same muted palette, same outline weight — but
the face is a **naturalistic animal face** with real eyes instead of the comic googly stare, and the
posture is often upright rather than hunched. This is the cluster the Director is feeling most, because
it is *nearly* right, and near-misses read as sloppiness rather than as variety.

**C3 — STORYBOOK / FANTASY CONCEPT (distance 2).**
grad · labcoat · trashking · pirate · richuncle
Smoother, cleaner rendering (detail 11–16 vs 21.5), upright humanoid builds with shoulders and waists,
naturalistic eyes, more saturated or cooler palettes, no grit. Grad's quadruped stance is a one-off in
the whole roster.

**C4 — CUTE CHIBI MASCOT (distance 3).**
astronaut · wizard · alien · hazmat · froggery · dino · chicken · robot · ghost · shark
Cel shading and soft gradients, glossy surfaces, high value / high saturation, low detail, smug
half-lidded eyes, tall-narrow silhouettes (aspect 0.58–0.68 against the hero's 0.87). This is a
different genre of character art — sticker/mascot, not painted cartoon. Ten assets: the second
largest cluster in the game, and the one that most obviously reads as a different studio.

**C5 — GLAM GLOSS / NEON (distance 4).**
shinothy · disco
Vector-gloss with hard speculars, particle sparkle, neon emissive. Reads as mobile-gacha art dropped
into a rain-soaked painted game.

**C6 — HUMAN CARICATURE (distance 5, off the scale).**
barnacle
A different species rendered in a different medium.

---

## 4. REMEDIATION ORDER FOR A PAID STEAM LAUNCH

Costs are in frames (19 poses per skin).

### Tier 0 — blocking, do before the store page goes up (3 skins / 57 frames)
The paid pack must not contain a costume from the cute-mascot cluster, and must not contradict the
banner that sells it.

1. **shark §** — regenerate. Only C4 asset inside the paid pack; the single loudest mismatch a buyer
   sees after paying.
2. **grad §** — regenerate. Quadruped stance is unique in the roster; and the banner sells it googly-eyed.
3. **labcoat §** — regenerate. Anthro build; banner sells it googly-eyed.

### Tier 1 — blocking, cheap (8 skins, face-only repaint / 8–24 frames of real work)
Bring the rest of the paid pack onto the house face. **This is an eye repaint, not a regeneration** —
keep the fur, keep the palette, keep the poses. Big white sclera, tiny pupil, wide-set, slightly
off-kilter.

soggy § · nordic § · barista § · fishmonger § · scout § · firstfrost § · garage § · summer §
(summer also needs the `cheer.png` magenta starburst knocked down to the muted palette)

Only the poses where eyes are actually visible need touching, which is why this is far cheaper than
it looks.

### Tier 2 — before launch if time allows (2 skins / 38 frames)
**shinothy** and **disco**. These are the two that most read as "a different artist" to a stranger
scrolling a store page. Both are code/earned, so they are not a refund risk — but they will end up in
community screenshots.

### Tier 3 — post-launch content pass (12 skins / 228 frames)
astronaut · wizard · alien · hazmat · froggery · dino · chicken · robot · ghost
· trashking · pirate · richuncle
The rest of the cute-mascot cluster plus the C3 stragglers. All are free earned/weekly content. Ship, then replace on a schedule. Nobody is paying for these, so nobody is
being short-changed while they wait.

### Tier 4 — the one nobody expects
**Uprez the hero.** At 222 px average he is the softest asset in a set that averages 323 px. Any
consistency pass that leaves him alone makes him the blurry one in the collection screen. Regenerate
the hero at skin resolution as part of Tier 0/1, using the existing frames as the reference — the
style is already correct, only the pixels are thin.

### Honest count

| | skins | frames |
|---|---|---|
| Ship as is | 3 | 0 |
| **Colour / face pass only** | **10** | ~10–25 touched |
| **Regenerate** | **18** | 342 |
| — of which *blocking for a paid launch* | **3** | **57** |
| — of which post-launch | 15 | 285 |

**The honest headline: 3 costumes block a paid launch. 8 more need an eye repaint. Everything else
can ship and be replaced on a content schedule.**

### Two things that are NOT problems (checked, so nobody spends time on them)
- **Chroma-key residue** — none. The magenta flagged by automated scanning is intentional FX: magnet
  swirls, coffee flames, cheer bursts, the shield bubble, the astronaut's visor tint. Hero measures
  0 residue; every "hit" was verified by eye.
- **Ground shadow** — consistent everywhere, because the engine draws it (`index.html:4024`), not the
  art. No baked shadows to strip.

---

## 5. STYLE SHEET — every future skin must obey this

### Prompt-level description (paste this, then append the costume)

> Full-body character sprite of a grotesque-cute cartoon raccoon, painted digital illustration.
> Heavy pear-shaped torso with a low heavy belly, head sitting straight on the shoulders with no neck,
> **thin spindly limbs** ending in oversized splay-toed paws with individual articulated claws.
> Hunched posture, weight forward. **Huge round white eyes with tiny black pupils**, wide-set and
> slightly off-kilter, comic and googly — never naturalistic animal eyes. Black bandit mask, cream
> brow band, small dark nose, wide lopsided toothy grin, long fine whiskers. Thick banded bushy tail.
> **Directional painterly fur brushwork with individual visible hairs.** Ragged dark brown-black ink
> outline of varying, broken weight. Painted form shadow — no cel bands, no airbrush gradients, no
> gloss. Warm ochre rim light down one edge. Desaturated warm earth palette: ochre, dust brown,
> grey-taupe, bone. Overall dark and rain-lit. Transparent background, no ground shadow.
> [COSTUME GOES HERE]

### Hard rules — non-negotiable

| Axis | Rule |
|---|---|
| **Eyes** | Large white sclera, tiny black pupil, wide-set, slightly asymmetric. ⛔ Never naturalistic irises. ⛔ Never half-lidded "smug". ⛔ Never doe eyes. **This is the single strongest identity marker in the set and the one that broke most often.** |
| **Body plan** | Heavy pear torso + spindly limbs + oversized splay-toed paws. Hunched. ⛔ No human shoulders/waist. ⛔ No chibi head-to-body ratio. ⛔ No quadruped stance. |
| **Silhouette aspect** | bbox width/height **0.80–0.95** on `idle`. Reject below 0.75. |
| **Line weight** | Ragged, broken, varying-weight dark brown-black ink. ⛔ No uniform vector stroke. ⛔ No outline-free soft render. Target dark-pixel fraction (v<0.18) **≥ 0.20**. |
| **Shading** | Painterly form shadow + one warm ochre rim light. ⛔ No cel bands. ⛔ No smooth airbrush gradients. ⛔ No specular gloss or sparkle overlays. |
| **Detail density** | Visible individual fur strokes over the whole body. Target local-gradient detail **≥ 16** (hero = 21.5). Reject below 13. |
| **Palette — the animal** | Desaturated warm earth. Mean saturation **≤ 0.45**, mean value **≤ 0.50**, median hue **25–45°**. |
| **Palette — the costume** | Saturated colour is allowed **only on props and garments** (hardhat orange, summer floatie). The raccoon underneath stays muted. |
| **Canvas** | Transparent PNG, RGBA, 8-bit. Tight-cropped to content. **Frame height 300–400 px** (skin set averages 323). |
| **Shadow** | ⛔ **Never bake a ground shadow.** The engine draws it. |
| **FX poses** | `magnet` / `coffee` / `splash` / `shield` / `cheer` carry painted FX in the same gritty, muted style — coin swirls, speed sparks, water burst, bubble. ⛔ No neon, no glow particles, no starbursts. |
| **Pose pack** | All 19: cheer, coffee, crouch, dash-run, dizzy, eat, flee, idle, ko, land, leap, magnet, run-l, run-r, scared, shield, sit, splash, umbrella. Swap the folder **wholesale** — never mix sessions (see `art-sheets/WHEN-THE-ART-LANDS.md`). |
| **Ground truth** | `assets/hero/idle.png` and `assets/ui/sup-banner.jpg`. The banner is the canonical multi-costume style reference. |

### Acceptance gate

Before a skin folder is accepted, run the metrics and check `idle` against:

```
aspect 0.80–0.95 · saturation ≤0.45 · value ≤0.50 · hue 25–45°
dark-fraction ≥0.20 · detail ≥16 · height 300–400px · no baked shadow
```

Then **look at the face next to `hero/idle.png`.** A metric pass with the wrong eyes is still a fail —
that is exactly how ten assets got into C2.
