# Sheet 03 — Gear icons + combat fx

**Wiring:** gear appears in the loot tray (`.lslot` DOM buttons in `renderLoot`) and in the
hint bar — icon swap is DROP-IN (replace the emoji glyph with a 64 px img). Combat fx
(snipe bolt, lightning, heal sparkle, coin burst, blessing) are PATCH-REQUIRED: today they
are text floaters in `floater()`; sprites would be drawn at the floater position instead.
Render 128 px cells, ship 64.

Gear tiers in code (`WNAMES`/`ANAMES`/`CNAMES`): Ash Club, Iron Fang, Warden Blade,
Star Halberd · Padded Vest, Oak Shield, Warden Plate, Moon Mail · Ember Bead, Dew Charm,
Owl Feather, Comet Knot.

**PROMPT (copy-paste):**

Ember Vigil style: cozy dark-fantasy storybook game art, warm campfire ember glow on
deep indigo night, soft painted texture, amber rim light, brass clockwork accents,
crisp readable game-asset silhouettes, high contrast, no text, no watermark, flat
FF00FF magenta background for cutout. A sprite sheet, 3 rows x 6 columns, each cell
128x128 pixels on flat magenta FF00FF, single centered game icons:
Row 1, weapons pointing up-right, ascending grandeur: (1) ASH CLUB, a knotted wooden
club. (2) IRON FANG, a curved iron dagger. (3) WARDEN BLADE, a straight cream-hilted
sword with amber FFB35C edge glow. (4) STAR HALBERD, an ornate halberd with a
starlight 9EE6FF blade. (5) empty cell of pure magenta. (6) empty cell of pure magenta.
Row 2, armor and charms: (7) PADDED VEST, a quilted leather vest. (8) OAK SHIELD, a
round oak shield with brass boss. (9) WARDEN PLATE, a cream and brass breastplate.
(10) MOON MAIL, a shirt of pale blue 7F9FE8 moonlit mail. (11) EMBER BEAD, a glowing
amber bead pendant. (12) OWL FEATHER, a soft striped feather charm with a tiny brass
clasp.
Row 3, combat effects, each a burst on empty magenta: (13) SNIPE BOLT, a streaking
pale blue 9EC7E8 arrow with motion trail. (14) LIGHTNING STRIKE, a single jagged
storm yellow E8DE8A bolt. (15) HEAL SPARKLE, a rising cluster of soft green 8FD6A8
motes. (16) COIN BURST, three brass coins popping with amber sparks. (17) BLESSING,
a small golden FFD76A sun-halo ring. (18) SKULL POFF, a puff of pale violet B9A6E8
smoke with a tiny fading skull.
Even spacing, nothing touching cell edges, no text anywhere.
