# Glyph Forge — Complete Art Asset List

Generated from the live game data in `index.html` via `node tools/assetlist.mjs`. **99 assets** across 11 categories.

Drop finished art into `/art-slots/` using the **Filename** column — the game auto-loads `art-slots/{slot}.png` wherever that `data-art-slot` appears. Keep one consistent palette per category (illuminated-manuscript / aged-parchment / gold-and-ink).

| # | Category | Count |
|--:|---|--:|
| 1 | Rune card | 36 |
| 2 | Enemy portrait | 8 |
| 3 | Relic | 17 |
| 4 | Relic (transmutation reward) | 5 |
| 5 | Sigil | 7 |
| 6 | Champion | 6 |
| 7 | Transmutation crest | 5 |
| 8 | Logo | 1 |
| 9 | Background | 4 |
| 10 | Card frame | 4 |
| 11 | UI icon | 6 |

---

## Rune card (36)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `rune-ember.png` | **Ember** | Fire · Bolt · common · starter · glyph ☄ | 512x512 (in 5:7 card) | A small spark, hungry for tinder. Fire-palette glow. |
| `rune-drop.png` | **Drop** | Water · Wave · common · starter · glyph ❍ | 512x512 (in 5:7 card) | Heals 1 HP on cast. Water-palette glow. |
| `rune-stone.png` | **Stone** | Earth · Burst · common · starter · glyph ◈ | 512x512 (in 5:7 card) | Heavy. Sure. Earth-palette glow. |
| `rune-gust.png` | **Gust** | Air · Pulse · common · starter · glyph ≋ | 512x512 (in 5:7 card) | +1 power to the next rune in line. Air-palette glow. |
| `rune-hollow.png` | **Hollow** | Void · Sigil · common · starter · glyph ⊘ | 512x512 (in 5:7 card) | Strips the foe's armor this turn — your hit ignores it. Void-palette glow. |
| `rune-ray.png` | **Ray** | Light · Bolt · common · starter · glyph ✦ | 512x512 (in 5:7 card) | +50% vs Shadow-aligned foes. Light-palette glow. |
| `rune-veil.png` | **Veil** | Shadow · Pulse · common · starter · glyph ☽ | 512x512 (in 5:7 card) | Draw +1 card after cast. Shadow-palette glow. |
| `rune-tally.png` | **Tally** | Order · Sigil · common · starter · glyph ┼ | 512x512 (in 5:7 card) | +1 power per other Order rune in spell. Order-palette glow. |
| `rune-roll.png` | **Roll** | Chaos · Spiral · common · starter · glyph ※ | 512x512 (in 5:7 card) | Random power: 1 to 5. Chaos-palette glow. |
| `rune-echo.png` | **Echo** | Order · Sigil · uncommon · glyph ⟲ | 512x512 (in 5:7 card) | Triggers the rune to its left a second time. Order-palette glow. |
| `rune-mirror.png` | **Mirror** | Chaos · Spiral · uncommon · glyph ◐ | 512x512 (in 5:7 card) | Copies the element and shape of the rune to its left. Chaos-palette glow. |
| `rune-surge.png` | **Surge** | Fire · Burst · uncommon · glyph ❋ | 512x512 (in 5:7 card) | +50% power to runes beside it. Fire-palette glow. |
| `rune-cascade.png` | **Cascade** | Water · Chain · uncommon · glyph ⥥ | 512x512 (in 5:7 card) | All later runes also deal their damage as bonus. Water-palette glow. |
| `rune-anchor.png` | **Anchor** | Earth · Sigil · uncommon · glyph ⚓ | 512x512 (in 5:7 card) | +1 power to every other Earth rune. Earth-palette glow. |
| `rune-drift.png` | **Drift** | Air · Wave · uncommon · glyph ∽ | 512x512 (in 5:7 card) | +2 power for each rune to its right. Air-palette glow. |
| `rune-drain.png` | **Drain** | Shadow · Wave · uncommon · glyph ∝ | 512x512 (in 5:7 card) | Heals you for half its damage. Shadow-palette glow. |
| `rune-beacon.png` | **Beacon** | Light · Pulse · uncommon · glyph ☼ | 512x512 (in 5:7 card) | +100% to next rune cast after this one. Light-palette glow. |
| `rune-sympathy.png` | **Sympathy** | Void · Spiral · uncommon · glyph ∞ | 512x512 (in 5:7 card) | Copies your most-played rune this run. Void-palette glow. |
| `rune-ouroboros.png` | **Ouroboros** | Chaos · Spiral · rare · glyph ∮ | 512x512 (in 5:7 card) | Re-casts the entire spell once. Once per turn. Chaos-palette glow. |
| `rune-twin.png` | **Twin** | Order · Sigil · rare · glyph ⧉ | 512x512 (in 5:7 card) | First rune in the spell fires twice more. Order-palette glow. |
| `rune-triskel.png` | **Triskelion** | Order · Spiral · rare · glyph ☘ | 512x512 (in 5:7 card) | +200% if all three slots share an element. Order-palette glow. |
| `rune-wildfire.png` | **Wildfire** | Fire · Chain · rare · glyph ✺ | 512x512 (in 5:7 card) | Strikes twice. Burns for 2 next turn. Fire-palette glow. |
| `rune-tidewall.png` | **Tidewall** | Water · Wave · rare · glyph ⌒ | 512x512 (in 5:7 card) | +1 damage per missing HP of yours. Water-palette glow. |
| `rune-quake.png` | **Quake** | Earth · Burst · rare · glyph ☷ | 512x512 (in 5:7 card) | Stuns the enemy. Skips their next attack. Earth-palette glow. |
| `rune-tempest.png` | **Tempest** | Air · Chain · rare · glyph ⌇ | 512x512 (in 5:7 card) | +1 power per other Air rune in your hand or deck. Air-palette glow. |
| `rune-eclipse.png` | **Eclipse** | Shadow · Sigil · rare · glyph ☋ | 512x512 (in 5:7 card) | True damage — your spell pierces all armor this turn. Shadow-palette glow. |
| `rune-recursion.png` | **Recursion** | Order · Spiral · mythic · glyph ∾ | 512x512 (in 5:7 card) | Triggers itself once. Stacks with other Recursions. Order-palette glow. |
| `rune-pandemonium.png` | **Pandemonium** | Chaos · Sigil · mythic · glyph ⚝ | 512x512 (in 5:7 card) | Every rune in your hand also fires this turn. Chaos-palette glow. |
| `rune-singularity.png` | **Singularity** | Void · Burst · mythic · glyph ⊙ | 512x512 (in 5:7 card) | Multiplies all damage by your hand size. Void-palette glow. |
| `rune-aurora.png` | **Aurora** | Light · Pulse · mythic · glyph ❂ | 512x512 (in 5:7 card) | ×5 damage if all three slots are different elements. Light-palette glow. |
| `rune-crescendo.png` | **Crescendo** | Order · Chain · rare · glyph ⋰ | 512x512 (in 5:7 card) | XMULT ×(1 + 6% of all power inscribed before it). Reward for going last. Order-palette glow. |
| `rune-culminate.png` | **Culminate** | Void · Burst · mythic · glyph ⤢ | 512x512 (in 5:7 card) | XMULT ×(1 + 11% of all power inscribed before it). The final word. Void-palette glow. |
| `rune-squall.png` | **Squall** | Air · Chain · uncommon · glyph ⌁ | 512x512 (in 5:7 card) | +1 power per other Air rune in the spell, ×2 if it is in slot III. Air-palette glow. |
| `rune-undertow.png` | **Undertow** | Water · Wave · rare · glyph ≈ | 512x512 (in 5:7 card) | +1 power to every later rune for each Water rune placed before it. Water-palette glow. |
| `rune-umbral.png` | **Umbral Knot** | Shadow · Spiral · rare · glyph ⊗ | 512x512 (in 5:7 card) | KEYSTONE · globalMult ×1.6 if any earlier rune has basePower ≥ 3. Shadow-palette glow. |
| `rune-lumen.png` | **Lumen** | Light · Burst · mythic · glyph ❉ | 512x512 (in 5:7 card) | KEYSTONE · XMULT ×(1 + 8% of all power inscribed before it). Place last. Light-palette glow. |

## Enemy portrait (8)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `enemy-cinder.png` | **Cinder** | tier 1 · shadow · glyph ⌬ | 512² round | A reluctant spark. shadow mood. |
| `enemy-wisp.png` | **Wisp** | tier 1 · air · glyph ◌ | 512² round | Half here, half elsewhere. air mood. |
| `enemy-fenmote.png` | **Fenmote** | tier 1 · earth · glyph ⌖ | 512² round | Stubborn. Lichen-clad. earth mood. |
| `enemy-wight.png` | **Hollow Wight** | tier 2 · void · glyph ⌘ | 512² round | A grammar of teeth. void mood. |
| `enemy-sirenshade.png` | **Sirenshade** | tier 2 · water · glyph ⌭ | 512² round | Sings in the wrong key. water mood. |
| `enemy-revenant.png` | **Brass Revenant** | tier 3 · order · armored · glyph ❖ | 512² round | It remembers being a bell. Its brass turns aside soft blows. order mood. |
| `enemy-glasswyrm.png` | **Glass Wyrm** | tier 3 · chaos · armored · glyph ☖ | 512² round | Counts your reflections. chaos mood. |
| `enemy-sovereign.png` | **The Sovereign** | tier 4 · void · armored · BOSS · glyph ✺ | 1024² round | It signed your name first. void mood, imposing final-boss presence. |

## Relic (17)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `relic-inkwell.png` | **The Eternal Inkwell** | common | 256² icon | +1 POWER to the first rune in every spell. Ornate artifact icon, rarity-tinted frame. |
| `relic-gilded-leaf.png` | **Gilded Leaf** | common | 256² icon | +0.4 XMULT if the spell uses 3 runes. Ornate artifact icon, rarity-tinted frame. |
| `relic-ashen-quill.png` | **Ashen Quill** | uncommon | 256² icon | Fire & Chaos runes deal ×1.5 in their slot. Ornate artifact icon, rarity-tinted frame. |
| `relic-hourglass.png` | **Broken Hourglass** | uncommon | 256² icon | +6% XMULT per rune in your hand (up to 5). Ornate artifact icon, rarity-tinted frame. |
| `relic-serpent-coil.png` | **Serpent's Coil** | rare | 256² icon | Order-dependent runes scale 60% harder. Ornate artifact icon, rarity-tinted frame. |
| `relic-unseen-hand.png` | **The Unseen Hand** | rare | 256² icon | Same-element triples gain an extra ×1.5 XMULT. Ornate artifact icon, rarity-tinted frame. |
| `relic-final-page.png` | **The Final Page** | mythic | 256² icon | High XMULT (≥2.5) is raised to the 1.4 power; a weaker spell instead gains +0.5 XMULT. Costs globalMult ×0.85. Ornate artifact icon, rarity-tinted frame. |
| `relic-tidal-ledger.png` | **The Tidal Ledger** | common | 256² icon | +2 POWER to the first rune while you are below half HP. Ornate artifact icon, rarity-tinted frame. |
| `relic-whisper-glass.png` | **Whisper Glass** | common | 256² icon | Shadow & Light runes deal ×1.4 in their slot. Ornate artifact icon, rarity-tinted frame. |
| `relic-updraft-fan.png` | **The Updraft Fan** | uncommon | 256² icon | +0.6 XMULT if every rune in the spell is a different shape. Ornate artifact icon, rarity-tinted frame. |
| `relic-salt-circle.png` | **The Salt Circle** | uncommon | 256² icon | +2 POWER to every later rune that shares slot I’s element. Ornate artifact icon, rarity-tinted frame. |
| `relic-low-lantern.png` | **The Low Lantern** | uncommon | 256² icon | Lean casting: spells of 2 or fewer runes gain XMULT ×2.6. Ornate artifact icon, rarity-tinted frame. |
| `relic-riptide-knot.png` | **The Riptide Knot** | rare | 256² icon | Each rune past the first adds +0.20 XMULT. Ornate artifact icon, rarity-tinted frame. |
| `relic-mourning-bell.png` | **The Mourning Bell** | rare | 256² icon | If the spell heals or lifesteals, XMULT ×1.6. Ornate artifact icon, rarity-tinted frame. |
| `relic-storm-sigil.png` | **The Storm Sigil** | rare | 256² icon | KEYSTONE. Air runes pierce armor & deal true damage; +0.25 XMULT per Air rune. Ornate artifact icon, rarity-tinted frame. |
| `relic-twin-eclipse.png` | **The Twin Eclipse** | mythic | 256² icon | KEYSTONE. XMULT raised to the 1.5 power; no bonus draw this turn; globalMult ×0.8. Ornate artifact icon, rarity-tinted frame. |
| `relic-undertow-anchor.png` | **The Undertow Anchor** | mythic | 256² icon | KEYSTONE. 3-rune spells retrigger 25% (globalMult ×0.9); smaller spells globalMult ×0.5. Ornate artifact icon, rarity-tinted frame. |

## Relic (transmutation reward) (5)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `relic-tx-fire.png` | **Wildfire Ascendant** | mythic · hidden reward | 256² icon | Transmutation: every Fire rune +2 POWER. Ornate artifact icon, rarity-tinted frame. |
| `relic-tx-order.png` | **The Bound Law** | mythic · hidden reward | 256² icon | Transmutation: same-element XMULT ×1.5 extra. Ornate artifact icon, rarity-tinted frame. |
| `relic-tx-void.png` | **The Open Void** | mythic · hidden reward | 256² icon | Transmutation: +0.5 flat XMULT per rune in hand. Ornate artifact icon, rarity-tinted frame. |
| `relic-tx-tide.png` | **The Endless Reservoir** | mythic · hidden reward | 256² icon | Transmutation: Water runes +1 POWER and the spell heals +3. Ornate artifact icon, rarity-tinted frame. |
| `relic-tx-air.png` | **The Eye of the Storm** | mythic · hidden reward | 256² icon | Transmutation: +0.4 XMULT per Air rune in hand or deck. Ornate artifact icon, rarity-tinted frame. |

## Sigil (7)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `sigil-free.png` | **Free Inscription** |  | 512² emblem | No bond, no ban. The classic codex. Heraldic bond-emblem, wax-seal feel. |
| `sigil-ember.png` | **The Emberheart** |  | 512² emblem | Fire spells ×1.12 & a Fire-rich pool. Water runes are sealed. Heraldic bond-emblem, wax-seal feel. |
| `sigil-order.png` | **The Clockwork Vow** |  | 512² emblem | Same-element XMULT ×1.2 (pair) / ×1.4 (triple). Chaos sealed. Heraldic bond-emblem, wax-seal feel. |
| `sigil-void.png` | **The Hungering Maw** |  | 512² emblem | Void spells XMULT ×1.12. Start at 38 HP. Light runes sealed. Heraldic bond-emblem, wax-seal feel. |
| `sigil-tide.png` | **The Tidemother** |  | 512² emblem | Water spells XMULT ×1.14, ×1.30 if 2+ Water. 56 HP. Fire sealed. Heraldic bond-emblem, wax-seal feel. |
| `sigil-zephyr.png` | **The Stormcaller** |  | 512² emblem | Air spells globalMult ×1.18; +retrigger on a pure Air triple. Earth sealed. Heraldic bond-emblem, wax-seal feel. |
| `sigil-umbra.png` | **The Eclipsed Crown** |  | 512² emblem | Shadow/Light XMULT ×1.16; ×1.40 if the spell mixes both. 44 HP. Order sealed. Heraldic bond-emblem, wax-seal feel. |

## Champion (6)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `champion-pyre-heart.png` | **Pyre Heart** | Champion: if the spell has any Fire rune, globalMult ×(1 + 0.32 × level). | 512² portrait | Patron avatar, half-length heraldic portrait. |
| `champion-true-name.png` | **The True Name** | Champion: same-element XMULT ×(1 + 0.12 × level), doubled on a mono triple. | 512² portrait | Patron avatar, half-length heraldic portrait. |
| `champion-event-horizon.png` | **Event Horizon** | Champion: XMULT ×(1 + level × 0.16 × handSize / 5). | 512² portrait | Patron avatar, half-length heraldic portrait. |
| `champion-deep-current.png` | **The Deep Current** | Champion: XMULT ×(1 + 0.13 × level) per Water rune in the spell (cap 3). | 512² portrait | Patron avatar, half-length heraldic portrait. |
| `champion-gale-crown.png` | **The Gale Crown** | Champion: globalMult ×(1 + 0.20 × level) if the spell has any Air rune. | 512² portrait | Patron avatar, half-length heraldic portrait. |
| `champion-penumbra.png` | **The Penumbra** | Champion: XMULT ×(1 + 0.15 × level) if the spell holds both Shadow and Light. | 512² portrait | Patron avatar, half-length heraldic portrait. |

## Transmutation crest (5)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `tx-fire.png` | **Wildfire Ascendant** | triad: ember + surge + wildfire | 512² crest | Fused crest of ember + surge + wildfire; radiant, "ascended". |
| `tx-order.png` | **The Bound Law** | triad: tally + echo + recursion | 512² crest | Fused crest of tally + echo + recursion; radiant, "ascended". |
| `tx-void.png` | **The Open Void** | triad: hollow + sympathy + singularity | 512² crest | Fused crest of hollow + sympathy + singularity; radiant, "ascended". |
| `tx-tide.png` | **The Endless Reservoir** | triad: drop + cascade + tidewall | 512² crest | Fused crest of drop + cascade + tidewall; radiant, "ascended". |
| `tx-air.png` | **The Eye of the Storm** | triad: gust + drift + squall | 512² crest | Fused crest of gust + drift + squall; radiant, "ascended". |

## Logo (1)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `title-mark.png` | **Title Mark** |  | 1024x1024 (transparent) | Central ritual mark / logo sigil; reads at 200px inside a gold circle; dramatic, symmetrical, mystical. |

## Background (4)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `bg-tier1.png` | **Biome — Threshold** |  | 1080x1920 (portrait) | Tier-1 backdrop: a candlelit scriptorium threshold. Dark, warm, low detail so the card UI reads on top. |
| `bg-tier2.png` | **Biome — The Deeps** |  | 1080x1920 (portrait) | Tier-2 backdrop: flooded lower stacks / drowned library. Cool teal, moody. |
| `bg-tier3.png` | **Biome — The Works** |  | 1080x1920 (portrait) | Tier-3 backdrop: brass clockwork archive. Amber, ordered, ominous. |
| `bg-boss.png` | **Biome — The Signatory** |  | 1080x1920 (portrait) | Boss backdrop for The Sovereign: a vast void-lit contract chamber. Purple-black, awe. |

## Card frame (4)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `frame-common.png` | **Card Frame — Common** |  | 512x716 (9-slice) | Parchment 5:7 card border, restrained. |
| `frame-uncommon.png` | **Card Frame — Uncommon** |  | 512x716 (9-slice) | As common with a verdigris accent. |
| `frame-rare.png` | **Card Frame — Rare** |  | 512x716 (9-slice) | As common with a violet accent + subtle filigree. |
| `frame-mythic.png` | **Card Frame — Mythic** |  | 512x716 (9-slice) | Ornate gold frame, animated-glow ready. |

## UI icon (6)

| Filename | Name | Details | Dimensions | Art brief |
|---|---|---|---|---|
| `ui-hp.png` | **HUD — Health** |  | 64x64 (transparent) | Heart / life-glyph for the HP readout. |
| `ui-fluency.png` | **HUD — Fluency** |  | 64x64 (transparent) | The ✦ fluency mark (stacking damage boost). |
| `ui-armor.png` | **HUD — Armor** |  | 64x64 (transparent) | The ⛊ armor/ward shield used in enemy + breakdown UI. |
| `ui-intent-attack.png` | **Intent — Attack** |  | 64x64 (transparent) | Enemy ATTACK telegraph glyph. |
| `ui-intent-charge.png` | **Intent — Charge** |  | 64x64 (transparent) | Enemy CHARGING→UNLEASH telegraph glyph. |
| `ui-intent-mend.png` | **Intent — Mend** |  | 64x64 (transparent) | Enemy MEND (heals + strikes) telegraph glyph. |
