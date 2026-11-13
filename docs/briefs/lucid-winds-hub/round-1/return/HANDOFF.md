# Lucid Winds — complete hub art handoff

Open **START-HERE.html** after unzipping to browse the finished exports locally. The page needs no account, server or internet connection. `ASSET-LIST.md` lists each PNG; `manifest.json` supplies dimensions, source paths, usage and placement notes.

This package completes the proposed round-two art list and includes the earlier review, style guide and proofs. It supplies art and implementation references; the live hub has not been modified.

## What to use

- **assets/** contains the final PNG exports. Files marked `runtime` in the manifest are composable art. Files marked `design-reference` are complete layout examples with sample text and screenshot plants.
- **sources/svg/** contains editable vector masters for the native UI system. Use these for alternate resolutions, colors and live text. The PNG exports are ready for raster pipelines.
- **sources/fonts/** contains the three font families and their OFL licenses.
- **sources/tokens.css** provides the palette, font declarations and reference sizing rules. These are integration references, not a replacement for the hub's existing application stylesheet.
- **proofs/contact-*.png** shows the delivered groups. **proofs/round-one/** preserves the original direction proofs and contact sheet.
- **ROUND-TWO-SCOPE.md** preserves the earlier proposed list for comparison. **ASSET-LIST.md** is the delivered inventory and supersedes its proposal language.

## Preserve the plants

Do not use the low-resolution plant pixels embedded in the layout examples as production plant art. They are original screenshot cutouts, not newly painted plant replacements. Keep the procedural plant renderer, pots, companions, names, haiku, EA values and rarity data.

Compose in this order: specimen field → soft aura / mutation backlight → light → native plant and companion → pedestal contact treatment as appropriate → frame / grade mark → live labels. The pedestal must sit beneath the pot: its lip may overlap the pot base slightly, never the leaves. Keep animated aura bounds wider than the plant bounds so glows do not become clipped rectangles. The provided vignette is an optional last visual layer beneath text.

For Constellation, the veil supports readability; it does not replace the native constellation dots or redraw the plant. For Silhouette, the backlight preserves the dark interior. Any precise contour rim must be derived from the actual rendered plant alpha mask, not from a generic halo.

## Coordinate guide

All coordinates below are source pixels. Full-screen examples are 1080 × 2400, targeting a 412 CSS px-wide portrait phone at approximately 2.62×. Scale the artwork uniformly; keep DOM text at its own readable CSS size. Respect device safe areas in layout rather than stretching the art.

| Surface | Suggested content region | Placement |
|---|---|---|
| Detail card, 1080 × 1620 | Plant x180–900, y300–1020 | Bottom-align the pot; keep crown/star ornament clear |
| Detail-card name | Center x540, y1120 | Playfair, about 24 CSS px; wrap long names to two lines |
| Detail-card poem | x130–950, y1240–1405 | Three lines, about 16 CSS px; allow dynamic height |
| Detail-card EA | Center x540, y1480 | DM Mono, at least 12 CSS px |
| Grid card, 480 × 640 | Plant x60–420, y115–425 | No poem on tile; preserve name / grade / EA below |
| Grid card labels | x32–448, y455–605 | Native text, not a scaled full-card screenshot |
| Bloom, 1080 × 2400 | Plant x180–900, y570–1270 | Use actual plant aspect ratio; do not stretch |
| Bloom identity | Name y1450, EA y1550, poem y1670–1835 | Name, grade and poem visible before continuing |
| Bloom actions | x90–990, y2010 and y2180 | Live buttons, not click regions on a screenshot |
| Welcome | Hero y600–1240; value copy y1390–1655 | Beta notice y1730–1920 precedes primary action |
| Nursery parent frame | Left x35–455; right x505–925; y145–735 | Live plants and metadata, no nested ornate cards |
| Nav tile, 256 × 160 | Icon around x93–163, y15–85 | Live label centered around y112; minimum 12 CSS px |

The grid name, grade and EA are live elements with a minimum 12 CSS px. Two-column tile width changes with the phone width; do not downscale an entire full-detail card to achieve a grid tile. Long names may expand the footer. Full-screen layouts may scroll at larger text settings; preserve the visible order rather than shrinking copy below the minimum.

## States and interactions

**Action buttons:** Share, Details, Breed and Compost each have normal, pressed and disabled PNGs at 192 and 96 pixels. 192 is a 2× export for a 96 CSS px tile; do not divide the 96px export by 2.6. All three states retain readable words. Add actual button semantics and accessible labels. The disabled state must also be disabled in code. Use the separate focus ring for keyboard focus.

At 412 CSS px, four 96px tiles fit with 8px outer padding and 4px gaps. At narrower widths, use the reference CSS sizing and switch to two columns below 360px rather than shrinking the labels indefinitely.

**Wide buttons:** text is not baked into the backgrounds. Primary normal/pressed uses midnight text on brass; secondary and destructive use cream. All disabled wide buttons use cream text. Stretch with CSS backgrounds or a 9-slice approach; preserve 30-source-pixel corner radii and border thickness at the intended scale.

**Compost:** open confirmation first. Suggested copy: “Compost [plant name]?” and “This permanently removes this plant from your collection.” Actions: “Keep plant” and “Compost permanently.” Do not assert a refund or reward unless the real economy grants one. Keep destructive confirmation distinct from Breed.

**Rarity:** grade name and symbol must agree with actual data. Common seed; Uncommon sprout; Rare three stars; Epic diamond; Legendary crown; Mythic crescent; Cosmic seven-point orbit. EA is displayed separately and does not select a grade. The grade colors have no baked odds or monetization claims.

**Wild:** five markers differ in silhouette as well as color. Yours uses a sprout pin; Other a round marker; Help a shield; Seed a diamond; Selected a double-outline pin with check. Map radius and scan ring have empty centers. The offline illustration is a fallback, not a fake map.

**First run:** the welcome shows the value before the beta terms, with terms visible before the main action. Gift and account layouts use one consistent account vocabulary. Use the existing backend's password policy and email verification requirements; the art adds no new validation rule. Music preference, discovery and level-up notices must queue outside a bloom reveal.

**Reduced motion:** use the static grade overlay and halo; suppress scan rotation, particle travel and large reveal zoom. Static rarity remains legible.

## Illustrations and categories

Nine category banners are included: Creative, Card Games, Puzzles, Board Games, Dice, Patterns, Math, Words, Studio Games. These labels follow the proposed taxonomy inferred from the supplied screenshot tags. Map them to the actual category IDs in the hub; no live configuration was inspected. Banner counts and navigation affordances remain live overlays.

The Hermit portrait has been restyled while retaining the hooded botanical trader concept. Mystery Box and Lens are isolated RGBA icons. The procedural pots and companions remain the source of truth for the rest of the shop inventory.

## Source and scope notes

The review is based on the supplied 26 shots, without playing the live game. Its original disclosure remains: section 7 was accidentally exposed before the first review was written, so the review is not presented as a blind assessment.

Plant names and haiku in the layout examples are illustrative copy. Common / Legendary / Cosmic retain the initial sample names; Uncommon / Rare / Epic / Mythic add sample names for their corresponding shot-16 specimens. All EA labels follow the source cell labels. Production uses the real generated identity.

The original round-one painted proofs and the final vector layer system differ in small decorative details. Use the **final assets/** frame family and its seven exact grade symbols for implementation. The earlier proofs remain visual context, not a competing production specification.

Desktop layout repair, map service recovery, authentication, state sequencing, dynamic text wrapping, plant rendering, accessibility wiring and responsive integration are application tasks for the dev team. No live changes, gameplay tests or validation scripts were performed for this art handoff.
