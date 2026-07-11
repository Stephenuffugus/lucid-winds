# Sheet 05 — Full-bleed backdrops (4 themes) + title hero

**DROP-IN wiring (no engine patch):** the play background is a top→bottom gradient built in
`render()` from `backSkin()` (`BACKS` keys cellar / sunset / tide / amberroom). Swap = draw a
540×820 backdrop image there first, keyed by `PROG.back`, then the bottle + grid render on top.
The bottle window is **centered**, 352 wide × 704 tall, sitting from y=96 to y=800 — so keep the
CENTER of each backdrop quiet and a touch darker than the edges (a soft central vignette) so the
glass, caps and grumps stay readable. The title hero sits behind `#s-title` as a DOM/CSS
background (540×960). Generate each at 1080×1640 (title 1080×1920) and ship downscaled at 540×820
(title 540×960) JPG ≤150KB — the host resizes anything over 1600px, so ship under.

**These are full-bleed — NO magenta.** Make FIVE separate images, one per paragraph.

**PROMPT (copy-paste, per image):**

1. CELLAR backdrop: Apothecary Fizz style, a moonlit apothecary cellar wall of dim shelved
glass bottles fading into deep plum-indigo shadow, cool candle glow at the top edges, a quiet
darker center, no foreground objects, no text, dark enough for bright gameplay on top; top color
plum 16102A grading to near-black 08060F at the bottom. 1080x1640 portrait.
2. SUNSET backdrop: same composition language, a warm dusk apothecary window with soft maroon
and plum light, a low warm horizon glow near the top, quiet dark center, no text; top color warm
maroon 3C1E2C grading to deep plum 100814. 1080x1640 portrait.
3. TIDE backdrop: same composition language, a cool sea-glass apothecary by moonlit water, faint
teal caustics high on the walls, quiet dark center, no text; top color deep teal 0A222C grading
to abyss 061016. 1080x1640 portrait.
4. AMBER ROOM backdrop: same composition language, a cozy amber-lantern apothecary room, warm
brass and honey light pooling at the top, quiet dark center, no text; top color warm amber
2C200E grading to deep brown 100A06. 1080x1640 portrait.
5. TITLE hero: Apothecary Fizz hero shot, a single tall glowing tonic bottle mid-cork-pop with a
fountain of teal, amber and rose gel-caps and gold bubbles fizzing up out of the neck, deep
plum-indigo cellar behind, candle-gold rim light, cinematic, no text. 1080x1920 portrait.
