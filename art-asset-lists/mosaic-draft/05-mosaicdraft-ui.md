# Sheet 05 — UI chrome (title crest, buttons, chips, rival portraits)

**Wiring:** DOM screens (`.btn`, `.chip`, `.wcard`) take these as background-image fills
per `feedback_painted_plaque_buttons`; portraits sit in the rival panel (`drawRival`
area, ~96px) and the ladder screen. Title crest replaces the h1 on `s-title`. Render at
2x and downscale; keep every element self-contained for magenta cutout.

**PROMPT (copy-paste):**

Kiln and Lacquer style: warm handcrafted ceramic game art, fired clay and glazed
porcelain with soft candle-amber rim light, lacquered walnut wood and brass fittings,
rich matte darks, painterly but crisp game-asset silhouettes, no text, no watermark,
flat FF00FF magenta background for cutout. A sprite sheet, 3 rows x 3 columns, each cell
300x300 pixels on flat magenta FF00FF.
(A1) a title crest: a small ceramic amphora vase wrapped by a diagonal band of five tiny
mosaic tiles in cobalt, amber, jade, garnet and pearl, brass laurel underneath, 256x256.
(A2) a wide lacquered walnut button plaque with a brass border and a soft amber sheen,
horizontal 288x96, empty center for text.
(A3) the same plaque in deep cobalt porcelain with a silver rim, 288x96.
(B1) a small rounded HUD chip plate of dark stoneware with brass edge, 128x80.
(B2) portrait of TAM THE APPRENTICE: a bright-eyed young potter with clay-smudged cheeks
and a too-big apron, head and shoulders, warm and friendly, 200x200.
(B3) portrait of MIRELA THE ARTISAN: a confident middle-aged ceramicist with a headscarf,
brass earrings and a knowing smile, head and shoulders, 200x200.
(C1) portrait of KOVER THE MASTER: an old stern kiln master with a silver beard, smoked
spectacles and a glaze-stained smock, head and shoulders, 200x200.
(C2) a small brass sun medallion for sunbeam rewards, 96x96.
(C3) a tiny wardrobe icon set of three ceramic swatches fanned like cards, 128x128.
Even spacing, nothing touching cell edges, no text anywhere.
