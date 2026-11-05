# Sunforge • notes for Stephen and Fable

## What ships
The chosen identity is **Sunbreaker**, with the public game name **SUNFORGE**. The pack contains identity art, all requested A through H asset categories, source-coordinate metadata, three title concepts, a style composite on the real captured play screen, and one contact sheet per section. The artwork is a mix of generated illustration and authored vector UI geometry. It is not described as hand painted. No application code, automated tests, validation scripts or test reports are included.

## Decisions and deviations
- I read the attached `ASTRA-SUNFORGE-PACK-NOV05.txt` in full. The public Drive folder could not be retrieved through the available reader; the attached exact-name brief was the working source. Nothing was uploaded to Drive.
- The live game was played, but the requested three completed Journey levels were not achieved. Journey remained level 1. Daily reached a result, and Zen was played for approximately a minute. Later-level and ring-crush judgments are brief-based, not claimed as observed.
- The live game used a portrait stage about 526 × 936 within a desktop browser. It was not a physical-phone or daylight session. Do not call the packaged concept images phone-tested.
- Three image-generated title overpaints use the actual title capture as reference. The selected direction mock is recropped to portrait by the image model; the original unretouched capture is included for context.
- The image-generated play overpaint is a design composite. It retains the recognizable observed board arrangement but is not exact implementation evidence. The production ring atlas, palette, stamp identities and manifest override illustrative colours and repeated marks in the mock.
- The broad palette changes on lock: all seven falling shapes use a single ceramic cell. The brief explicitly allowed one falling cell when pieces do not retain seven separate material colours. This makes active-versus-settled status clear and reduces colour noise.
- Each ring sheet has an extra eighth interior variant beyond the requested seven, enabling connected enamel areas without an exterior bevel through every join.
- Ring stamps are centered dark marks. Their simple silhouettes are more reliable at 26 px than microscopic corner decoration. They are a redundant cue, not a claim of universal colour-vision accessibility.
- Generated enamel face artwork has natural shading around the nominal palette values. Use the hex values in the style guide for all code-drawn fallback colours and tinted effects.
- The 540 × 960 quarter-turn animation is supplied as four numbered transparent full-frame PNGs. A four-wide strip would be 2160 px and violate the brief's 1600 px non-store maximum. The manifest links their sequence and timing.
- Store and share portrait frames are 1080 × 1920 as explicitly requested. They are the store-size exception to the 1600 px maximum.
- SLAM skins contain no baked label; render SLAM and the rotation icon live to preserve sharpness, localization and accessible text. All three requested states are present.
- Mode cards and tutorial plates are wordless. Live names go into the reserved band; live tutorial text accompanies the four picture plates.
- Sprite sheets are exported as palette PNGs with alpha to keep runtime files compact. Marketing and play plates use compressed JPG/WebP. Preview contact sheets are documentation, not runtime downloads.
- Hero art illustrates the mechanic's identity rather than a guaranteed reachable board state. Store screenshot frames intentionally contain no invented gameplay; insert real captures after integration.
- Pause is a supplied control asset. The observed live game uses a menu/back action; implementing actual pause behavior is Fable's decision.
- The game already animates the gyre turning. Improve that existing move instead of rebuilding it as a new feature.

## Wiring order
A establishes the title and icon; B and C replace core and cells; D sets the quiet board; E replaces controls and small labels; F adds feedback; G adds the real gyre result/share layout; H receives actual screenshots last. Keep code fallbacks behind image-loaded conditions throughout. The source pack does not change the single-file runtime requirement.

## Cells and borders
Cell source frames are 64 × 64, to display at approximately 26 px. Ring sheets contain eight horizontal frames in this exact order: single, top, right, bottom, left, inner corner top left, outer corner top left, interior. A top edge means exposed above and connected toward the other sides. The outer corner has exposed top and left edges. The inner corner is a missing diagonal at top left with adjacent cardinal neighbors present. Corners may be rotated for other quadrants, but keep stamps upright. Use the separate face/trim/stamp layers when the adjacency combination needs more than one exposed side or rotated corners. The independent trim atlas gives an exact assembly route without rotating the enamel face or identity mark.

A single outer border is a visual weld, not collision data. Collision remains the game's cell grid. Do not shrink hitboxes to sprite silhouettes. Hollow ghosts show where the code predicts landing; side walls and the void edge never gain collision from artwork.

## Transparent frames and dimensions
All precise rectangles are in `manifest.json`; x, y, width, height use source pixels, origin top left. Share cards reserve separate score/rings/level bands. Daily reserves an additional date band. The six store windows are the same 100,448,880,1280 rectangle for straightforward capture placement. The empty headline band is 100,150,880,150. Preserve aspect ratio when fitting a captured stage; crop only if the intended screenshot composition allows it.

Nine-slice HUD parts use source insets left 18, top 18, right 18, bottom 34. The lower strip holds the acid cuts and must not be stretched vertically into a blob. Decorative skins do not set tap-target size; targets are at least 48 CSS px. SLAM is 250 × 72 CSS px using 500 × 144 source skins.

PNG alpha is intended for standard source-over compositing. Do not apply additive blend to every plate. Draw light layers behind the crisp core and cells. The illustrated FX have soft local glow; keep their runtime opacity below the level at which they wash out the structure. Use the clean inward-flow mask when a small ring needs less visual noise.

## Sound direction
SLAM should sound like a compact pressure press engaging: a dry low click at contact, a short rubbery descending torque note during the quarter turn, then one bright metal latch when orientation settles. Avoid a generic explosion, long sub-bass tail or piercing alarm. A ring crush adds a tightly timed inward suction and a bright short alloy chime; chains step upward harmonically while retaining the same short duration. A lost piece gets a small descending airy tick, never a punitive buzzer. Charged state can add a very quiet steady electrical layer, never constant beeping. Existing soundtrack remains available; keep effects easy to mute independently and avoid gain escalation on large combos. No sound files are included or claimed.

## Motion notes
The action should feel heavy in timing, not in camera violence. The sun and gyre turn; the HUD and thumb controls stay anchored. No continuous shake, chromatic aberration, or rotating background grid while idle. Almost-complete rings get a stable seam and missing-cell notch. Reduced motion uses a short final-state crossfade while preserving the actual orientation, score, colours and ring status.

## What I would make next
After the skin is integrated: actual title/gameplay capture for every store slot, a concise tutorial demo that guarantees the first ring crush, a few restrained chapter sky variants, and a short captured motion trailer emphasizing the slam/quarter-turn/crush loop. These are next steps, not hidden missing asset categories in this pack.

## Source and creation record
Google Fonts sources are included under `assets/a_identity/fonts` with OFL text. Barlow Condensed Black provides the outlined modified wordmark; Space Grotesk provides live UI. Public font projects: https://github.com/google/fonts/tree/main/ofl/barlowcondensed and https://github.com/google/fonts/tree/main/ofl/spacegrotesk .

Raster illustration used the built-in image generator. The prompt set asked for: three named title overpaints on the real capture (Chrome Sun, Solar Cult, Sunbreaker); a wordless Sunbreaker hero with a four-jaw square sun and unfinished enamel gyre; four centered transparent core states; twelve flat enamel cell colours on an aligned atlas; a quiet wordless portrait board; three transparent mechanical SLAM states; six-frame square expanding shockwave, inward ring crush and downward void swallow; and a Sunbreaker overpaint of the real Journey capture. Core geometry, transparency, exact sheet grids, no brands, no extra text and phone readability were explicit prompt constraints. Chrome title lettering and crush background received one targeted correction. Production assembly supplied exact source crops, resampling, transparent UI masks, vector marks, font outlines, wordless instructional diagrams and export layouts. No generated source is attributed as a real play screenshot.
