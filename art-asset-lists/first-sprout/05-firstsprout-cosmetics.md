<!-- First Sprout · Sheet 5: Wardrobe — sky cards + soil cards + gate tokens + card furniture -->
<!-- 💰 COSMETICS / ECONOMY sheet. Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Wick & Loam" (First Sprout / Sky Wolf Studios candlelit idle-grove). Quiet painterly chiaroscuro collectibles: little framed windows of night and earth, warmed at their edges by candlelight, floating on a deep KIND darkness — never scary. Soft painterly cel, feathered candle-falloff edges, restrained bloom (never blown-out), subtle paper grain, plump friendly shapes readable at thumbnail. Palette (EXACT game colors): night #0d100c/#07090a/#04060a; cosmetic sky pairs — Deep Night #0b1220→#05070a, Moonrise #141a2e→#080a12, Aurora #10222a→#06121a; cosmetic soils — Loam #2a2016, Mossbed #243019, Ashen #241f22; greens sage #7ab356, deep leaf #5c8f3f, forest #3f6b34, canopy #2f4a22, dusk line #2a331f, moss #8a9178; candle golds #ffe9a8/#ffd98a/#ffdc8c/#ffd278/antique #c8a84b; cream #e8dcc8, moonlight #e8e2cf, starlight #cfe0e8; dew #bfe0f2, pool blue #5b9bd5; petal pink #e58fa0; firefly #eaffb0; heartwood #8a5a2b/#3a2a14/#241a0c. NO text/letters/numbers/logos/watermarks (cards show NO names — code renders all labels). Under 150KB.

Create one sprite sheet. File: fs_cosmetics.png. Grid: 4 columns x 3 rows (12 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x1536.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (petal pink #e58fa0 stays dusty and distinct from #FF00FF). Each item centered, upright, fully inside its cell with margin, NO ground shadow (these composite into the 140px wardrobe cards and over the grove scene). Glows contained inside each cell. These are PURELY VISUAL skins — they never change tap gain, helper rates, costs or gates. The full-bleed versions of every sky and soil live on sheet 03; these cells are their WARDROBE PREVIEW faces and must match those paintings exactly in hue and mood.

NIGHT-SKY PREVIEW CARDS (cells 1-3) — tall rounded 3:4 window vignettes of each cosmetic sky, tiny crescent moon and two pinprick stars included so the card sells the mood at 140px. Unlocks gate on SEEDS PLANTED (`G.seeds`, the New Seed prestige counter):
1. cos_sky_deepnight — "Deep Night" (starter, free): the default midnight indigo wash #0b1220→#05070a, calm and warm-adjacent; a whisper of cloud high in the window.
2. cos_sky_moonrise — "Moonrise" (unlock: plant 1 seed): the bluer night #141a2e→#080a12 with a soft moonglow cresting the window's lower edge and one thin moonlit cloud band #e8e2cf.
3. cos_sky_aurora — "Aurora" (unlock: plant 3 seeds): the deep teal night #10222a→#06121a with two feathered aurora ribbons in sage #7ab356 and dew #bfe0f2 swaying down the window. The prestige showpiece.

SOIL-BED PREVIEW CARDS (cells 4-6) — wide rounded 4:3 close-up tiles of each cosmetic soil crest, candle-warm light grazing the top edge. Unlocks gate on GROVE VALUE (`G.groveMax`: helpers count 1 each, reveals count 2 each):
4. cos_soil_loam — "Loam" (starter, free): warm dark crumbly earth #2a2016, a couple of soft crumb clusters and one pebble, gold-kissed crest.
5. cos_soil_mossbed — "Mossbed" (unlock: grove value 5): mossy earth #243019 cushioned with muted moss tufts #8a9178/#7ab356 and one tiny glowing spore #eaffb0.
6. cos_soil_ashen — "Ashen" (unlock: grove value 12): cool ash bed #241f22 dusted with pale cream flecks #e8dcc8 and one faint warm ember seam #ffd278 in a crack.

GATE TOKENS (cells 7-8) — small emblems the wardrobe uses beside locked thresholds (code renders the number; the token is the pictograph):
7. cos_token_seed — the seeds-planted gate token: the bright Heirloom Seed #c8a84b wrapped in a thin swirl of light #ffe9a8, sitting in a shallow dark soil pocket. Marks every sky unlock ("plant N seeds").
8. cos_token_grove — the grove-value gate token: a miniature flourishing plant silhouette #5c8f3f/#7ab356 inside a soft circular lantern-glow #ffd98a. Marks every soil unlock ("grove N").

WARDROBE CARD FURNITURE (cells 9-12) — the pieces `refreshWard()` and the wardrobe screen use:
9. ward_card_frame — the wardrobe card frame: a rounded 140px-friendly tile face in dark moss #0f150c with a hairline dusk border #2a331f and a faint candle warmth in the upper corners; EMPTY center (the sky/soil preview + code-rendered name composite inside).
10. ward_card_locked — the locked variant of the same frame: dimmed and cooled, a small heartwood-brown padlock #8a5a2b/#3a2a14 with a cream keyhole glint resting at the bottom center. Locked cards render at half opacity, so keep the padlock bold.
11. ward_equipped_ring — the "equipped" highlight: a thin antique-gold #c8a84b glow ring/border overlay that hugs the card edge (matches the code's gold `.wardcard.on` border), one gentle pulse-bright corner. Transparent center.
12. cos_equip_burst — the equip flourish: a soft radial bloom of candle-gold #ffe9a8 with tiny rising sparks and one dew glint #bfe0f2, popped over a card when the player taps to EQUIP it — the card click handler in refreshWard (~456), a real existing event. Warm, brief, never fireworks-loud. WIRE NOTE: do NOT wire this as a "threshold just met" celebration without building NEW detection — refreshWard() (~450) only recomputes lock state when the wardrobe opens and nothing watches for a threshold crossing; an unlock-moment burst would need new logic (e.g., persist a seen-set and diff `ownedCosm()` results on wardrobe open).
