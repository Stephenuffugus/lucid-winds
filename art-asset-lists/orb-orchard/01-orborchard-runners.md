# Sheet 01 — Runners (3 walkers × poses) + wardrobe medallions

**Wiring:** `drawRunner()` paints the walker as vector ellipses at a fixed internal spot
(135,352), seen from BEHIND in third person, with a walk bob and a jump arc. Sprite swap is
PATCH-REQUIRED: `drawImage` ~48×56 internal px keyed by `PROG.runner` (`RUNNERS` keys
`seedling` / `firefly` / `comet`), alternate run frames A/B on the existing `ph` bob phase,
use the jump cell while `G.air`, keep the engine ellipse shadow. Until patched, column 4
medallions replace the `.wcard` emoji icons (🌱🪲☄️) in the Wardrobe screen — DROP-IN,
zero engine change. Author at 256px, downscale at wire time (renderer is 270×410 internal,
pixel-upscaled ×2).

**PROMPT (copy-paste):**

Chrome Horizon style: glossy 90s arcade special-stage art, candy-lacquer and polished
chrome surfaces with bright specular highlights, airbrushed gradient light, saturated
jewel colors over deep dusk blues, clean rounded game-asset silhouettes readable at 24
pixels, soft ambient occlusion, no text anywhere, flat magenta FF00FF background for
knockout. A sprite sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta
FF00FF, subjects centered, nothing touching cell edges.
Each row is one small rounded egg-shaped runner character seen from BEHIND at a slight
three-quarter high angle, about two heads tall, stubby legs, glossy lacquered body,
cheerful but not babyish. Columns left to right: (1) run pose A, left foot forward,
slight lean; (2) run pose B, right foot forward, mirrored bob; (3) jump pose, tucked
legs, small motion arc of light beneath; (4) wardrobe medallion, the same character face-on
as a portrait bust inside a thin gold C8A84B ring on a deep green-black 101A12 disc.
Row 1, SEEDLING: cream lacquer body E8DCC8 with a warm ivory specular, one tiny sage
7AB356 leaf-sprout antenna curling from the crown, sage foot pads.
Row 2, FIREFLY: warm amber glass body FFD98A glowing softly from within like a filament
lamp, burnished gold C8A84B antenna tipped with a bright ember, faint gold light halo.
Row 3, COMET: frosted ice-glass body BFE0F2 with a cool blue 5B9BD5 sheen, a short
crystalline comet tail trailing off the crown, tiny frost sparkles.
Even spacing, consistent scale across rows, no text anywhere.
