# Tarot Run — Art Direction

## The Vision

Imagine an old velvet-curtained theater. The stage is empty. On a small table at center: a deck of tarot cards, lit from below by a single footlight. Each card is hand-painted. The illustrations look like Alphonse Mucha or Pamela Colman Smith painted them in 1909. The enemies are not monsters — they're portraits from a haunted gallery. **The whole game looks like the late curtain call of an art-nouveau opera house, where the show might already be over.**

**Single-line summary**: *Smith-Waite tarot meets Mucha decorative panels meets baroque-portrait enemies, lit by stage footlights.*

## Core Style Tokens

Every Midjourney prompt should reference at least 2-3 of:
- **Era**: Art Nouveau, 1900s illustration, Smith-Waite tarot (1909), Mucha decorative panels
- **Texture**: oil painting, hand-painted, painterly, slightly aged paper / cream parchment
- **Composition**: centered, symmetrical, decorative border implied, ornate frame
- **Light**: footlight glow from below, candlelight, dramatic chiaroscuro
- **Avoid**: anime, cyberpunk, photorealism, modern fantasy art, digital glow, cartoon, AAA video game CG

## Universal Prompt Stems

### Stem for **Tarot Cards** (all 78)

```
{subject}, painted as a tarot card in the Smith-Waite style, Art Nouveau composition,
hand-illustrated, oil painting texture, ornate decorative border implied,
cream parchment background with gold leaf accents, centered figure,
muted period palette, 1909 illustration aesthetic, no text, no card number, no title bar
--ar 5:7 --style raw --v 6
```

### Stem for **Enemies** (all 11)

```
{subject}, baroque oil portrait painted in the style of a haunted gallery,
theatrical stage lighting from below, half-obscured face, dramatic chiaroscuro,
deep teal velvet curtain backdrop, ornate gilded frame implied,
1900s symbolist painter aesthetic (think Redon or Khnopff), no text
--ar 1:1 --style raw --v 6
```

### Stem for **Title Mark**

```
ornate ritual seal sigil, 9-pointed star surrounded by tarot suit symbols
(wand, cup, sword, pentacle) at compass points, rose gold metal leaf
on deep teal velvet, Art Nouveau filigree, theatrical, symmetrical, no text
--ar 1:1 --style raw --v 6
```

---

## The 22 Major Arcana

These are the most important pieces. Each Major card gets a unique scene. They should feel like full-page illuminations.

| ID | Card | Prompt subject |
|---|---|---|
| `card-major-0`  | The Fool          | A young figure stepping off a sunlit cliff edge, white rose in hand, a small white dog at heels; bright dawn sky behind |
| `card-major-1`  | The Magician      | A robed magician at an altar bearing wand, cup, sword, and pentacle; one hand raised to sky, one to earth; infinity symbol above his head |
| `card-major-2`  | The High Priestess| A veiled woman seated between two pillars (one black, one white), crescent moon at her feet, scroll partially hidden in her lap |
| `card-major-3`  | The Empress       | A crowned woman with twelve stars in her halo, seated on a velvet throne in a field of wheat, scepter in hand |
| `card-major-4`  | The Emperor       | A stone-throned king in carved ram-horn armor, holding an ankh scepter, mountains behind, stern profile |
| `card-major-5`  | The Hierophant    | A robed pope-figure between two carved pillars, blessing two kneeling acolytes, crossed keys at his feet |
| `card-major-6`  | The Lovers        | Two figures standing in a garden under a winged angelic figure with arms raised in benediction, sun behind angel |
| `card-major-7`  | The Chariot       | An armored figure standing in a stone chariot drawn by a black sphinx and a white sphinx, starry canopy above |
| `card-major-8`  | Strength          | A woman in a white robe gently closing the jaws of a lion, infinity symbol above her head, soft sunset light |
| `card-major-9`  | The Hermit        | A grey-robed hermit on a mountain peak holding a lantern containing a six-pointed star, staff in other hand |
| `card-major-10` | Wheel of Fortune  | An ornate wheel surrounded by four winged creatures (man, eagle, lion, bull), each holding a book, a sphinx atop the wheel with a sword |
| `card-major-11` | Justice           | A crowned figure seated between pillars, sword raised vertical in right hand, scales held in left, eyes forward |
| `card-major-12` | The Hanged Man    | A figure hanging upside-down by one ankle from a T-shaped tree, halo around his head, serene expression, hands behind back |
| `card-major-13` | Death             | A skeletal knight in black armor riding a white horse across a fallen battlefield, sun setting behind two towers |
| `card-major-14` | Temperance        | A winged angel pouring water from one chalice to another, one foot on land, one in water, sunrise behind |
| `card-major-15` | The Devil         | A horned baphomet on a black plinth, two chained figures (man and woman) at his feet, inverted pentagram over his head |
| `card-major-16` | The Tower         | A stone tower struck by yellow lightning, crown blasted from its top, two falling figures in mid-air, dark stormy sky |
| `card-major-17` | The Star          | A nude woman kneeling at a pool pouring water from two vessels, a large eight-pointed star above her, seven smaller stars |
| `card-major-18` | The Moon          | A full moon dripping golden tears between two stone towers, a wolf and a dog howling at it, a crayfish emerging from a pool |
| `card-major-19` | The Sun           | A laughing child on a white horse holding a red banner, sunflowers behind, a large smiling sun overhead |
| `card-major-20` | Judgement         | An angel blowing a trumpet from a cloud as souls rise from open coffins below, hands raised in awe |
| `card-major-21` | The World         | A dancing figure within a green laurel wreath, the four creatures (man, eagle, lion, bull) at the corners |

---

## The 56 Minor Arcana

Minor cards split into four suits. Each suit has Ace through 10 plus four court cards (Page, Knight, Queen, King). Smith-Waite-style scene illustrations work beautifully.

### Wands (Fire — Vermilion Palette)

Wands carry their own light. Vermilion red, warm gold leaf, brass accents.

| Card | Subject |
|---|---|
| Ace of Wands | A hand emerging from a cloud holding a single blooming staff with green leaves sprouting from it |
| Two of Wands | A robed figure standing on a castle wall holding a globe and one staff, second staff fixed in the wall beside |
| Three of Wands | A figure with back to viewer overlooking distant ships from a high cliff, three staves planted around him |
| Four of Wands | Two figures with raised garlands beneath a wreathed arch of four staves, a celebration in golden light |
| Five of Wands | Five figures in a chaotic mock-battle with their staves raised against each other |
| Six of Wands | A victorious rider on a white horse holding a wreath-crowned staff, surrounded by attendants with staves |
| Seven of Wands | A figure on high ground defending against six raised staves from below |
| Eight of Wands | Eight staves flying in parallel through a clear sky over a riverside landscape |
| Nine of Wands | A bandaged figure leaning on one staff while eight others stand behind in a wary defensive row |
| Ten of Wands | A bent figure carrying a heavy bundle of ten staves toward a distant town |
| Page of Wands | A youthful figure in vermilion examining a single tall flowering staff, desert landscape behind |
| Knight of Wands | An armored figure on a rearing horse in salamander-patterned cape, holding a flowering staff |
| Queen of Wands | A throned queen with a black cat at her feet, holding a sunflower in one hand and a staff in the other |
| King of Wands | A throned king with a salamander at his feet, in robes of fire patterns, holding a flowering staff with the bearing of one who never raised his voice |

### Cups (Water — Teal Palette)

Cups are vessels — chalices, fountains, drowned wells. Deep teal, silver, opal.

| Card | Subject |
|---|---|
| Ace of Cups | A hand emerging from a cloud holding a chalice overflowing with five streams of water, a dove descending into it with a host wafer |
| Two of Cups | Two figures exchanging cups beneath a winged lion (the caduceus) over a shared scene |
| Three of Cups | Three women raising cups in joyful toast in a garden of fruit |
| Four of Cups | A young figure seated under a tree refusing the cup offered by a hand from a cloud, three cups before them |
| Five of Cups | A black-cloaked figure mourning over three spilled cups, two cups still standing behind, a river and a bridge beyond |
| Six of Cups | Two children in a garden, one offering a flower-filled cup to the other, six cups arranged around them |
| Seven of Cups | A silhouette confronted by seven cups in cloud, each containing a different image (face, jewels, serpent, castle, dragon, laurel, draped figure) |
| Eight of Cups | A red-cloaked figure walking away into mountains under a moon, leaving eight stacked cups behind |
| Nine of Cups | A satisfied figure seated before a curved table draped in blue, nine cups arrayed behind |
| Ten of Cups | A couple arms upraised under a rainbow of ten cups, two children dancing nearby, cottage in the distance |
| Page of Cups | A youthful figure on the beach holding up a cup from which a fish emerges, looking surprised |
| Knight of Cups | A knight in winged helmet on a white horse, carefully offering a chalice forward, river crossing landscape |
| Queen of Cups | A throned queen at the water's edge holding an ornate covered cup like a reliquary, gazing into it |
| King of Cups | A throned king on a stone slab in turbulent water, holding a cup steady, with a fish leaping in the background |

### Swords (Air — Cool Silver Palette)

Swords are sharp and pale. Cool silver-grey, steel, fog, dusk.

| Card | Subject |
|---|---|
| Ace of Swords | A hand emerging from a cloud gripping an upright sword crowned with a wreath and palm fronds |
| Two of Swords | A blindfolded woman seated by water holding two crossed swords across her chest, crescent moon overhead |
| Three of Swords | A red heart pierced by three swords against a stormy grey sky with rain falling |
| Four of Swords | A stone effigy of a knight lying atop a tomb with three swords mounted on the wall behind, one beneath him |
| Five of Swords | A smug victor gathering three swords on a battlefield, two defeated figures walking away in the distance |
| Six of Swords | A boatman ferrying a cloaked figure and a child across calm water, six swords standing upright in the boat |
| Seven of Swords | A figure sneaking away from a striped camp tent carrying five swords, two stuck in the ground behind |
| Eight of Swords | A bound and blindfolded woman surrounded by eight upright swords planted in muddy ground |
| Nine of Swords | A figure sitting upright in bed with hands over face, nine swords mounted on the wall above |
| Ten of Swords | A figure lying face-down on a shore at dawn, ten swords stuck into their back, dark sky giving way to gold horizon |
| Page of Swords | A youthful figure on a hilltop holding a sword aloft, hair blowing in wind, looking back warily |
| Knight of Swords | An armored knight on a horse in full charge, sword forward, scarves and birds whipping in his wake |
| Queen of Swords | A throned queen in profile holding a sword vertical, severe but composed, butterflies on her crown |
| King of Swords | A throned king holding a sword diagonally upward, eyes forward, butterflies on the throne back |

### Pentacles (Earth — Forest-Green Palette)

Pentacles are coins, fields, craftsman's tools. Forest green, oxidized bronze, deep umber.

| Card | Subject |
|---|---|
| Ace of Pentacles | A hand emerging from a cloud holding a single golden pentacle over a garden archway leading to mountains |
| Two of Pentacles | A juggler balancing two pentacles in an infinity-shaped ribbon while two ships ride waves behind |
| Three of Pentacles | A stonemason on scaffolding inside a church being addressed by two patrons, three pentacles carved into the wall above |
| Four of Pentacles | A miser hugging one pentacle to his chest with two beneath his feet and one balanced on his crown |
| Five of Pentacles | Two beggars (one on crutches) trudging through snow past a lit stained-glass window with five pentacles in it |
| Six of Pentacles | A wealthy merchant weighing out coins with scales as he gives alms to two kneeling beggars |
| Seven of Pentacles | A farmer leaning on a hoe contemplating a leafy plant with seven pentacles growing from it |
| Eight of Pentacles | An apprentice chiseling pentacles into stone medallions in his workshop, seven completed displayed |
| Nine of Pentacles | An elegant woman in an embroidered robe in a vineyard, a hooded falcon on her gloved hand, nine pentacles in the vines |
| Ten of Pentacles | An old patriarch with two white hounds at his feet, watching family gather under an arch, ten pentacles arranged like the Tree of Life across the scene |
| Page of Pentacles | A youthful figure in a flowering field gazing intently at a single pentacle held aloft in both hands |
| Knight of Pentacles | An armored knight on a sturdy black horse, motionless in a plowed field, examining a pentacle held forward |
| Queen of Pentacles | A throned queen in a flower-canopied throne holding a pentacle in her lap like a cat, a rabbit at her feet |
| King of Pentacles | A throned king in robes embroidered with grape vines, golden bulls flanking his throne, holding a pentacle on his knee |

---

## The 11 Enemies

Painted as baroque oil portraits hanging in a haunted gallery. Each has a clear silhouette and ONE memorable feature.

| Slot | Enemy | Subject |
|---|---|---|
| `enemy-spectre`    | The Spectre        | A pale translucent figure half-emerged from velvet curtains, suggested face but no clear features, fingers like smoke |
| `enemy-jackal`     | Brass Jackal       | A bronze jackal-headed automaton in a tailored Victorian coat, head tilted as if listening, glowing seam-lights |
| `enemy-echoman`    | The Echo-Man       | A pale figure in motley with two faint duplicate silhouettes overlapping his own, painted like a triple-exposure photograph |
| `enemy-duelist`    | The Suit-Duelist   | An elegant duelist in waistcoat and shirt, two long swords crossed before him, masked face turned slightly, gold cords on collar |
| `enemy-reflection` | The Reflection     | A figure made entirely of broken mirror shards roughly assembled in human shape; each shard reflects a different scene |
| `enemy-sleeper`    | The Sleeper        | A pale androgynous figure floating in soft mist with eyes closed, gold thread wrapped around their wrists and throat |
| `enemy-gilded`     | The Gilded Idol    | A massive seated bronze statue partly draped in red silk, golden face leafed in gilt, hollow blank eyes, hands palm-up |
| `enemy-archivist`  | The Archivist      | An elderly figure with spectacles in dusty ecclesiastical robes, surrounded by floating sheaves of paper, ink-stained hands |
| `enemy-twins`      | The Reversed Twins | Two identical pale figures in tailored black suits, one upright and one upside-down, sharing one single crown between them |
| `enemy-oracle`     | The Bound Oracle   | A blindfolded woman in flowing white wrapped in dark cords from chest to feet, mouth open as if mid-prophecy |
| `enemy-crown`      | The Crowned Fool   | A jester in motley robes wearing a heavy gold crown that is clearly too large, eyes closed, smiling, painted full-figure on a stage |

---

## Title Mark + App Icons

### `title-mark` (1024×1024)
Central ritual seal. A 9-pointed star (each point representing a Major Arcana cluster of approximately 22/9 cards). Surrounded by the four suit glyphs at the cardinal compass points: **wand** (north), **cup** (east), **sword** (south), **pentacle** (west). Rose gold metal leaf on a velvet teal background. Symmetrical. Theatrical filigree like a Mucha decorative panel border.

### `icon-192.png` / `icon-512.png`
Use the title mark, cropped tighter. Safe zone: 40px inset on 192px (so the central element doesn't get clipped when iOS renders as maskable).

---

## Style Consistency Notes

- **Major Arcana** should feel like full illustrations — the most polished, most detail.
- **Minor Arcana** can be slightly simpler scene paintings — they're seen at thumbnail size 92px wide on the phone.
- **Court cards** (Page/Knight/Queen/King) get more detail than pip cards — they show character.
- **Enemies** should NEVER have fully visible faces — always partially obscured. This is a horror conceit.
- **The Crowned Fool** boss is the most polished image in the game — spend the most time there.

## Suit Palette Cheat Sheet

| Suit | Primary | Secondary | Background tint |
|---|---|---|---|
| Wands | vermilion #c8443d | brass gold | warm cream |
| Cups | teal blue #3e7286 | silver | cool cream |
| Swords | silver-grey #8b929b | steel blue | pale cream |
| Pentacles | forest green #6a8157 | bronze | olive cream |
| Major | rose gold #d4a574 | midnight teal | warm cream w/ gilt |

Apply these as subtle color washes to the parchment background of each card. The game's CSS already tints the card borders, so the art just needs to feel "this card is a Cups card" via mood rather than overwhelming saturation.

---

## Workflow with Midjourney

1. Open Midjourney. Use `--v 6 --style raw --ar 5:7` for cards, `--ar 1:1` for enemies.
2. Batch by suit: do all 14 Wands in one sitting for consistency.
3. For Major Arcana, do them ONE AT A TIME and iterate harder — they're the most visible cards.
4. Save with the EXACT filename listed in ASSET_MANIFEST.json (e.g. `card-major-0.png`, `card-wands-1.png`).
5. Drop into `/art-slots/` folder.
6. Refresh the game — auto-loader replaces the unicode placeholder with the image.

## Minimum Viable Ship

If Stephen can only generate part of the deck for a soft launch, prioritize this order:
1. `title-mark` + `icon-192` + `icon-512` (3 images — required for App Store / PWA install)
2. The 22 Major Arcana (the marquee deck)
3. The boss: `enemy-crown` (most-seen enemy at the climax)
4. The 7 most-common minor cards: the Aces (4) + The Fool's added cards
5. The 11 enemies
6. The remaining 52 minors (court cards first, then 5-10s, then 2-4s)

Even with just the 22 Majors + 11 enemies + title (34 images), the game is shippable — the minor cards retain their unicode-glyph placeholders gracefully.

> **Sep 05 2026 (Fable):** `manifest.json` points at the arcade's shared `/assets/icons/icon-192x192.png` for now, because `art-slots/icon-192.png` never landed and an installed Tarot Run had no icon at all. When the painted icons arrive, put them in `art-slots/` and point the manifest back. The loader also no longer fetches templated slots (`enemy-?`) literally.

