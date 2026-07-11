# Sheet 02 — Pickups (dew / sunbead / thorn / bumper / spring) + floor medallions + sun disc

**Wiring:** row 1 and the spring are the playfield pickups — `drawOrb(code,x,y,r)` swap,
per-code `drawImage` centered at (x,y) scaled to r (r runs 1.1 to ~60px internal near the
camera, so 256px sources hold up; renderer pixel-upscales ×2). Engine ellipse shadow stays
underneath. Rows 2-3 floor medallions are DOM-ONLY: they replace the Wardrobe `.wcard`
emoji (🟩🟪🟧) and anchor the palette — the actual floor is perspective-projected flat-color
quads (`PALS`) and cannot take a mapped texture without an engine rewrite. Cell 12 sun disc
can replace the engine glow disc in the sky pass (DROP-IN) and doubles as a title accent.

**PROMPT (copy-paste):**

Chrome Horizon style: glossy 90s arcade special-stage art, candy-lacquer and polished
chrome surfaces with bright specular highlights, airbrushed gradient light, saturated
jewel colors over deep dusk blues, clean rounded game-asset silhouettes readable at 24
pixels, soft ambient occlusion, no text anywhere, flat magenta FF00FF background for
knockout. A sprite sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta
FF00FF, subjects centered, nothing touching cell edges.
Row 1, the four core pickups: (1) DEW ORB, a flawless polished glass sphere, icy white
EAF7FF crown highlight over sky glass 8FC4EC into deep sea blue 2B5F96 at the base, one
crisp specular dot; (2) SUNBEAD, a burnished open gold ring E2B34D with a bright cream
FFF2C8 highlight arc on its upper edge, thick torus, softly glowing; (3) THORN, a menacing
eight-point garnet caltrop star, deep wine 6E1F28 spikes with a polished red core A23444,
clearly dangerous; (4) BUMPER, an arcade chrome disc, bright silver rim C9CED6 around a
gunmetal well 8D949E with a raised white-chrome F2F5F8 five-point star cap.
Row 2: (5) SPRING, a springy mint-green coil 79D68A of three fat loops on a squat dark
green base 2F6B3C, coiled and ready; (6) MEADOW floor medallion, a lacquered two-by-two
checker chip of leaf green 79B356 and deep moss 3F5C2F squares inside a thin gold C8A84B
ring; (7) TWILIGHT floor medallion, the same checker chip in periwinkle 6874C4 and deep
indigo 363C6E; (8) EMBER floor medallion, the same checker chip in toasted amber D69654
and dark umber 7A4A2A.
Row 3, the walked-path swatches and the sun: (9) MEADOW walked chip, the checker chip
worn to warm terracotta B06842 and dark clay 7C482E; (10) TWILIGHT walked chip in muted
dusty rose C46E96 and plum 824664, kept clearly muted and never hot pink; (11) EMBER
walked chip in coral red DC6050 and brick 8C3A32; (12) SUN DISC, a radiant burnished gold
C8A84B sphere with a soft warm halo and gentle rays, small and serene.
Even spacing, consistent scale within each row, no text anywhere.
