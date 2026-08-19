# Glyph Forge — Art Card List

_Generated from index.html (source of truth). 36 rune cards · 47 total assets. Regenerate: `node tools/cardlist.mjs`._

Drop finished art into `art-slots/` with the exact filename in the **Slot** column; it hot-loads live (graceful placeholder until then).

## Common runes (9)

| Card | Slot file | Element · Shape | Pwr | Effect |
|---|---|---|---|---|
| Ember | `art-slots/rune-ember.png` | Fire · Bolt | 2 | A small spark, hungry for tinder. |
| Drop | `art-slots/rune-drop.png` | Water · Wave | 1 | Heals 1 HP on cast. |
| Stone | `art-slots/rune-stone.png` | Earth · Burst | 3 | Heavy. Sure. |
| Gust | `art-slots/rune-gust.png` | Air · Pulse | 1 | +1 power to the next rune in line. |
| Hollow | `art-slots/rune-hollow.png` | Void · Sigil | 1 | Strips the enemy's ward this turn. |
| Ray | `art-slots/rune-ray.png` | Light · Bolt | 2 | +50% vs Shadow-aligned foes. |
| Veil | `art-slots/rune-veil.png` | Shadow · Pulse | 1 | Draw +1 card after cast. |
| Tally | `art-slots/rune-tally.png` | Order · Sigil | 2 | +1 power per other Order rune in spell. |
| Roll | `art-slots/rune-roll.png` | Chaos · Spiral | 0 | Random power: 1 to 5. |

## Uncommon runes (10)

| Card | Slot file | Element · Shape | Pwr | Effect |
|---|---|---|---|---|
| Echo | `art-slots/rune-echo.png` | Order · Sigil | 0 | Triggers the rune to its left a second time. |
| Mirror | `art-slots/rune-mirror.png` | Chaos · Spiral | 0 | Copies the element and shape of the rune to its left. |
| Surge | `art-slots/rune-surge.png` | Fire · Burst | 2 | +50% power to runes beside it. |
| Cascade | `art-slots/rune-cascade.png` | Water · Chain | 0 | All later runes also deal their damage as bonus. |
| Anchor | `art-slots/rune-anchor.png` | Earth · Sigil | 1 | +1 power to every other Earth rune. |
| Drift | `art-slots/rune-drift.png` | Air · Wave | 0 | +2 power for each rune to its right. |
| Drain | `art-slots/rune-drain.png` | Shadow · Wave | 2 | Heals you for half its damage. |
| Beacon | `art-slots/rune-beacon.png` | Light · Pulse | 0 | +100% to next rune cast after this one. |
| Sympathy | `art-slots/rune-sympathy.png` | Void · Spiral | 0 | Copies your most-played rune this run. |
| Squall | `art-slots/rune-squall.png` | Air · Chain | 1 | +1 power per other Air rune in the spell, ×2 if it is in slot III. |

## Rare runes (11)

| Card | Slot file | Element · Shape | Pwr | Effect |
|---|---|---|---|---|
| Ouroboros | `art-slots/rune-ouroboros.png` | Chaos · Spiral | 0 | Re-casts the entire spell once. Once per turn. |
| Twin | `art-slots/rune-twin.png` | Order · Sigil | 0 | First rune in the spell fires twice more. |
| Triskelion | `art-slots/rune-triskel.png` | Order · Spiral | 3 | +200% if all three slots share an element. |
| Wildfire | `art-slots/rune-wildfire.png` | Fire · Chain | 3 | Strikes twice. Burns for 2 next turn. |
| Tidewall | `art-slots/rune-tidewall.png` | Water · Wave | 1 | +1 damage per missing HP of yours. |
| Quake | `art-slots/rune-quake.png` | Earth · Burst | 5 | Stuns the enemy. Skips their next attack. |
| Tempest | `art-slots/rune-tempest.png` | Air · Chain | 2 | +1 power per other Air rune in your hand or deck. |
| Eclipse | `art-slots/rune-eclipse.png` | Shadow · Sigil | 0 | Damage cannot be reduced this turn. |
| Crescendo | `art-slots/rune-crescendo.png` | Order · Chain | 0 | XMULT ×(1 + 6% of all power inscribed before it). Reward for going last. |
| Undertow | `art-slots/rune-undertow.png` | Water · Wave | 2 | +1 power to every later rune for each Water rune placed before it. |
| Umbral Knot | `art-slots/rune-umbral.png` | Shadow · Spiral | 0 | KEYSTONE · globalMult ×1.6 if any earlier rune has basePower ≥ 3. |

## Mythic runes (6)

| Card | Slot file | Element · Shape | Pwr | Effect |
|---|---|---|---|---|
| Recursion | `art-slots/rune-recursion.png` | Order · Spiral | 0 | Triggers itself once. Stacks with other Recursions. |
| Pandemonium | `art-slots/rune-pandemonium.png` | Chaos · Sigil | 0 | Every rune in your hand also fires this turn. |
| Singularity | `art-slots/rune-singularity.png` | Void · Burst | 0 | Multiplies all damage by your hand size. |
| Aurora | `art-slots/rune-aurora.png` | Light · Pulse | 0 | ×5 damage if all three slots are different elements. |
| Culminate | `art-slots/rune-culminate.png` | Void · Burst | 0 | XMULT ×(1 + 11% of all power inscribed before it). The final word. |
| Lumen | `art-slots/rune-lumen.png` | Light · Burst | 0 | KEYSTONE · XMULT ×(1 + 8% of all power inscribed before it). Place last. |

## Enemies (8)

| Name | Slot file | Tier |  |
|---|---|---|---|
| Cinder | `art-slots/enemy-cinder.png` | tier 1 | threat 2 · tag shadow |
| Wisp | `art-slots/enemy-wisp.png` | tier 1 | threat 2 · tag air |
| Fenmote | `art-slots/enemy-fenmote.png` | tier 1 | threat 2 · tag earth |
| Hollow Wight | `art-slots/enemy-wight.png` | tier 2 | threat 3 · tag void |
| Sirenshade | `art-slots/enemy-sirenshade.png` | tier 2 | threat 3 · tag water |
| Brass Revenant | `art-slots/enemy-revenant.png` | tier 3 | threat 4 · tag order |
| Glass Wyrm | `art-slots/enemy-glasswyrm.png` | tier 3 | threat 4 · tag chaos |
| The Sovereign | `art-slots/enemy-sovereign.png` | boss | threat 5 · tag void |

## Branding (3)

| Asset | Slot file | Size |
|---|---|---|
| Title Mark | `art-slots/title-mark.png` | 1024x1024 |
| PWA Icon (small) | `art-slots/icon-192.png` | 192x192 |
| PWA Icon (large) | `art-slots/icon-512.png` | 512x512 |
