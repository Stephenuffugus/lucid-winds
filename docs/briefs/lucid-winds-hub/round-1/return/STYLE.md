# Moonlit herbarium

One direction: **flat botanical specimens inside a quiet midnight conservatory.** Restrained brass rules, simple geometry and soft atmospheric light support the existing vector plants. No carved stone, parchment plaques, pixel texture or jewel-painted controls. Illustration belongs to the room and category motif; interface surfaces remain calm.

## Palette

| Role | Hex |
|---|---|
| Midnight canvas | #0B1718 |
| Evergreen surface | #142A29 |
| Raised surface | #203B36 |
| Cream text | #F4EBD6 |
| Secondary sage | #B6C9B7 |
| Brass / primary action | #D8B76C |
| Destructive surface | #612C32 |
| Destructive accent | #FFB5AA |
| Rare / Epic / Mythic / Cosmic | #9DCEEB / #C2AAF0 / #E4A1CC / #BFEFFF |

## Typography and controls

Keep **Playfair Display** for specimen names and haiku: that literary identity is valuable. Use **DM Sans Medium/Bold** for actions, navigation and readable explanatory text; replace Bebas Neue because its condensed forms become fragile at 12 CSS px. Keep **DM Mono Medium** for EA and compact counters only. Cream text always sits on a solid dark field; gold is an accent, not small body copy. Proof typography uses the real font files.

One button shape: rounded rectangle, 12 CSS px corner radius, 1 CSS px rule, generous internal padding. Square action tiles are the same shape at a different aspect ratio. A simple icon occupies the upper zone; its word occupies a separate lower baseline with no artwork beneath it. At 96 × 96 native size the word is 14 px; the 192 × 192 export is its 2× version. Keep “Compost” in full. Its broken-pot icon, coral border and red field communicate destruction; activation opens a separate confirmation naming the plant.

One frame treatment: a fine inset brass/sage line with an open botanical arch above the specimen. No opaque ornament over leaves. Common has the quietest single rule; higher grades add discrete geometry, not heavier walls. The plant sits on a low elliptical slate shelf with a transparent, feathered aura behind it. Never brighten an entire rectangular plant canvas.

## Seven grades

| Grade | Accent | Persistent mark |
|---|---|---|
| Common | #B6C9B7 | One seed / single rule |
| Uncommon | #A8D5A2 | Two-leaf sprout |
| Rare | #9DCEEB | Three stars |
| Epic | #C2AAF0 | Diamond with star |
| Legendary | #D8B76C | Crown |
| Mythic | #E4A1CC | Crescent with star |
| Cosmic | #BFEFFF | Seven-point orbit / double rule |

Show the written grade and mark on every card; color is never the only signal. Keep EA separate from grade: it is a numeric property, not the rarity label. The detailed card gives most of its central field to the plant, followed by name, three haiku lines, then EA. Collection tiles use the same frame with name, grade and EA; open the full card for the poem.

The 1080-wide proofs target a 412 CSS px viewport. Their smallest copy is at least 32 source px. A full card is a detail presentation, not a two-column tile with illegible poetry. Common reveal: warm halo and one quiet seed mark. Cosmic reveal: expanded orbit, star points and blue-white light, while keeping exactly the same text hierarchy. Reduced motion should preserve these static compositions.


Final production family: assets/ supersedes the earlier painted proof ornaments. Native marks are seed, sprout, three stars, diamond, crown, crescent and seven-point orbit. All 178 exports and their usage are enumerated in ASSET-LIST.md.
