# REFERENCE, Inkswing

**Written:** 2026-09-07, Opus, before the P4 build phase (the nib and the colour wheel).
**What it is:** the best things in the world that do what Inkswing does, what each does that we
do not, what we adopt and what we refuse. Ideas and mechanics only. No asset, name, character
or line of copy from anyone else ever enters the game, and no other title is named in player
copy.
**Honesty note:** claims marked **[memory]** come from my own knowledge rather than from a page
read today. Everything else is from the sources at the foot, read Sep 07 2026.

---

## 1. WHAT INKSWING IS, IN CATEGORY TERMS

A harmonograph: a drawing made by pendulums, where the shape is decided by the ratio between
two swing rates and the way the swings decay. Ours is a phone one where the player throws the
bob with a finger, the pendulum lengths are note names, and a drawing is its list of throws.

That puts it in two categories at once, and the leaders are different in each.

- **As a harmonograph tool:** the category is old, the maths is settled, and every good
  implementation is a control panel.
- **As a drawing toy on a phone:** the category leader is a paint app, and the thing people
  love about those is not the physics, it is the pen.

---

## 2. THE HARMONOGRAPH TOOLS

**The category leader is a panel of numbers, and this is the important finding.** Every serious
implementation, desktop app, web toy or wooden machine, presents the same face: two to four
pendulums, each with a frequency, an amplitude, a phase and a damping, all on sliders, and a
button that runs it. One macOS app ships four adjustable pendulums, preset patterns, colour
themes, undo and a 2048 px export. One browser tool emulates the wooden machine literally, two
pendulums moving the pen and two moving the paper. One free lab draws a multi jointed pendulum
in real time. A physical machine sells itself as motor free and gravity powered.

**What they do that we do not:**

1. **Presets.** Almost all of them ship a handful of curated settings that are known to make a
   good picture, because the space of settings is mostly ugly and a stranger will not find the
   good part on their own. We have the fifty on the variety sheet and the rig unlocks, and no
   presets.
2. **Undo, and a history you can walk.** We have UNDO for one throw.
3. **A high resolution export.** We have the poster and the share link.
4. **More than two pendulums.** Three and four are common. We have two, and the Double Link
   which is two coupled numerically.
5. **They show the numbers.** Frequency ratios are printed. Ours are note names, on purpose.

**What they do not have, and this is the whole reason Inkswing exists:** you cannot THROW one.
Every one of them is set, then run. The player's hand is on a slider, not on the bob. A
harmonograph you can push with your finger, where the push decides the amplitude and the phase
of that swing and the drawing accumulates throw by throw, is not in the category. That is our
one idea and nothing in this note should be allowed to dilute it.

---

## 3. THE PAINT APPS

The category leader on a tablet is a paint app, and it is worth reading for exactly two things,
both of which are the subject of this build phase.

**The nib.** In a good paint app the brush is not one setting, it is a family: a fine tipped pen
against a broken nib against a brush pen, and what changes between them is how the mark
responds to speed and pressure. The key insight, and the one we can use without a stylus, is
that **the mark's width is a function of how fast the tip is moving, and different tips have
different curves.** Inkswing already does the speed part: `strokeSpan` widens and darkens the
line where the pen dawdles and thins it to a hair where it whips across the paper, which is why
the middle of a drawing does not go solid black. What it does not have is a family. A nib is
therefore not a new system for us, it is a scale on a curve we already ship.

**The colour picker.** The published guidance on mobile pickers is consistent and it matters
here because Inkswing has a rail of five fixed inks in the thumb's reach:

- A wheel takes more room than a set of sliders and earns it only where choosing a colour
  RELATED to another colour is the point. A drawing that layers ink on ink is exactly that case.
- On a phone the picker belongs in a bottom sheet, because precision matters less than thumb
  reach, and every target must be finger sized.
- A slider beside the wheel for the second dimension keeps the panel compact.

That is the shape we will build: the rail keeps its five named inks, and one more chip opens a
bottom sheet with a hue ring, one slider under it, and the nibs.

---

## 4. WHAT WE ADOPT

- **A1. A nib is a scale on the existing speed curve, not a new stroke engine.** Three: fine,
  medium, broad, at 0.6, 1.0 and 1.6 times the width band. The wet edge and the alpha curve are
  untouched, so a broad nib is the same pen pressed harder, which is what a nib is.
- **A2. The colour sheet is a bottom sheet with a hue ring and one slider.** Thumb reach over
  precision, every target 48 rendered px at 375x667, and the bottom left 120 by 120 left for the
  music chip.
- **A3. The five named inks stay, and they stay first.** The wheel is the sixth chip, not the
  first. Named colours with a history (iron gall, sepia, oxblood, verdigris, indigo) are worth
  more to this game than a hex field, and the published advice agrees that a wheel is for when
  you need a colour to relate to another one, which is a thing you do second.
- **A4. Layers keyed by the colour itself, and more of them.** Four was enough for five inks.
  A wheel makes the count meaningless, so layers key by hex and the cap goes to six.

## 5. WHAT WE REFUSE, AND WHY

- **R1. No hex field, no RGB numbers, no eyedropper.** Those are a design tool's affordances.
  Inkswing is a drawing made of throws and it never shows the player a number it did not have to.
  The note names are the one exception and they are a musical instrument's names, not a
  readout.
- **R2. No preset patterns.** It is the category's answer to a settings panel nobody can steer,
  and we do not have a settings panel: the player throws the thing. Presets would hand back the
  authorship the throw exists to give. The rig unlocks and the variety sheet do the same work
  honestly.
- **R3. No third and fourth pendulum, for now.** More pendulums is the category's way of buying
  complexity and it is exactly the wrong lever here: the Twin (call 31) buys the same visual
  richness with two PENS the player can throw independently, which keeps the hand in it. If
  Stephen wants more curve density before that, `DOUBLE_LINK2` under one is a single number.
- **R4. No pressure and no stylus path.** The phone is the instrument. Speed is our pressure and
  it is already the better fit, because a pendulum's speed is a physical fact of the swing
  rather than a thing the player is holding.
- **R5. The share link stays the drawing.** A link is a list of throws, not a picture, which is
  why a stranger's phone can redraw it at any size. The nib and the colour are per throw and go
  into that list; nothing about colour is allowed to become a bitmap in a link.

---

## 6. THE ONE RISK THIS BUILD CARRIES

A wheel gives a player 16 million colours and the five inks were doing a real job: they are all
dark, all slightly desaturated, and all of them look like ink on paper. A bright cyan at full
depth will look like a highlighter on a document, and a player who picks one and then does not
like their drawing will blame the drawing.

**The mitigation, and it is a design choice rather than a limitation:** the ring is a hue ring
and the slider under it is DEPTH, not saturation and not lightness. Depth walks a curve that
stays inside the ink family: the pale end is a wash, the deep end is a near black of that hue,
and no point on it is a fluorescent. A player can make any colour of ink and cannot make a
marker pen. That is the same decision the five named inks made, opened up rather than thrown
out. It is worth telling Stephen because if he wants the fluorescents, that is one line and a
different game.

---

## Sources

Read Sep 07 2026. Mechanics and published guidance only.

- https://apps.apple.com/us/app/harmonograph-maker/id6758112968
- https://www.worldtreesoftware.com/apps/web/harmonograph/
- https://geopatternlab.com/
- https://myeveryday.app/pointless/harmonograph
- https://en.wikipedia.org/wiki/Harmonograph
- https://help.procreate.com/procreate/handbook/brushes/brush-studio
- https://paperlike.com/blogs/paperlikers-insights/procreate-brush-studio-explained
- https://mobbin.com/glossary/color-picker
- https://www.eleken.co/blog-posts/color-picker-ui
