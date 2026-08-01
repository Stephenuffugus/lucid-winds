# Jumping Jimothy — what to actually regenerate, and at what size

Answer to the Director, 2026-08-02: *"if i have to do a massive asset generation i can... im
assuming ill have to do more than 2 sheets per character too to get better and higher resolution."*

**You do not need a massive regeneration, and you almost certainly do not need higher resolution.**
Those are two different problems and only one of them is real.

---

## 1. RESOLUTION IS NOT THE PROBLEM. Measured, from the draw call.

`satellites/stream-hop/index.html:4054` is where the hero is painted every frame:

```js
if(pasp>1.12) drawSprite(pose, x+fbX, cy-6+fbY, 0, {w:TILE*1.24*csc, ...});
else           drawSprite(pose, x+fbX, cy-6+fbY, TILE*0.98*csc, {...});
```

`TILE = 60` (index.html:1014). So **every sprite in the game renders at 74px wide or 59px tall**,
on a 540px-wide logical canvas. On a 3x phone that is at most ~220 real pixels.

The source PNGs measure:

| set | frames | avg width | avg height |
|---|---|---|---|
| `assets/hero/` | 20 | 247 | **222** |
| the 31 skins | 19 each | 322-381 | **299-358** |

**The skins are already 1.5-2x oversampled for gameplay.** Regenerating 589 frames at a larger size
buys the player nothing: the canvas throws the extra pixels away on every single frame.

### Where resolution DOES matter, and it is one asset

`assets/hero/idle.png` is 216x247 and it is the **lowest-resolution asset in the entire game** —
lower than all 31 skins that are judged against it. It is also the raccoon on the Steam capsules,
where the 1232x706 main capsule upscales him about **2.6x**.

➡ **Regenerate the HERO large. Leave the skins at the size they are.** That is one character, not
thirty-one, and it fixes the only place the pixels are actually short.

### If you do regenerate, the sheet maths you asked about

The current spec (`art-sheets/SHEET-20.txt`) says *"Suggested layout 6 columns x 3 rows"* — 18
frames on ONE sheet. Six columns is exactly why frames land at ~320px: on a ~2000px-wide
generation, six columns is ~330px per cell before margins.

Frames per sheet is the only dial that changes per-frame resolution:

| columns x rows | frames/sheet | sheets for 19 | approx px per frame |
|---|---|---|---|
| 6 x 3 (today) | 18 | 1 | ~320 |
| 4 x 3 | 12 | 2 | ~490 |
| 3 x 2 | 6 | 4 | ~660 |
| 2 x 2 | 4 | **5** | ~980 |

So your instinct was right about the mechanism — more sheets is the only way to get bigger frames —
but for the hero alone, **4-5 sheets** gets you ~1000px per pose. Do that once, for him.

⛔ More sheets means the same character generated across more separate images, which is where
style drift comes from in the first place. Lock the reference before splitting the sheet, and cut
with `scripts/cut_sheet.py` (see [[reference_cutting_mj_sheets]] — never an even grid).

---

## 2. THE REAL PROBLEM IS THE EYES, AND IT IS A LOOK, NOT A SIZE

Full evidence in `SKIN_ART_AUDIT.md`. The short version: six art styles across 31 skins, and the
single marker that broke is the face. The hero has **huge white sclera with tiny wide-set pupils**.
Ten skins match him on everything else — same fur strokes, same muted palette, same broken outline
— and wear a **naturalistic animal face**. That near-miss is what reads as sloppiness.

Fixing an eye is a repaint of one small region. It is not a reason to rebuild a character.

---

## 3. THE ORDER, CHEAPEST DECISIVE THING FIRST

**1. The banner, today.** `assets/ui/sup-banner.jpg` draws seven pack costumes (soggy, summer,
nordic, barista, grad, fishmonger, labcoat) correctly in the hero's googly-eyed style. **All seven
sprites have naturalistic eyes.** The advertisement does not match the product, on the surface that
takes money. Two ways to close it: fix seven costumes (133 frames), or **replace the banner**
(1 image). Before a paid launch with a Monday store deadline, replace the banner.

**2. The hero, large.** One character, 4-5 sheets, ~1000px per frame. He is the style reference AND
the capsule art AND currently the blurriest thing you own. Everything else is measured against him,
so he has to be right before anything is regenerated to match him.

**3. The three OFF paid costumes** — shark, grad, labcoat (57 frames). These are a different school
entirely; an eye pass will not save them.

**4. The eight CLOSE paid costumes** — eye repaint only, no rebuild.

**5. Free, earned and secret content — last, or never.** Every worst offender (Shinothy, Disco,
Barnacle, the whole chibi cluster) lives here. Nobody pays for these and they are not on the store
page. Barnacle is a one-code private joke: keep it, never screenshot it.

**Blocking a paid launch: 3 costumes + the banner.** Not thirty-one characters, and not a
resolution pass.

---

## 4. THE STYLE SHEET

`SKIN_ART_AUDIT.md` carries the prompt-level description and the hard rules (body plan, eyes,
outline weight, shading model, palette, canvas, shadow treatment). Any new sheet obeys it, and the
first thing to check on any delivery is the eyes.
