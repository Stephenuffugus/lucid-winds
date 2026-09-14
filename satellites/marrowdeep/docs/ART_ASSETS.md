# Marrowdeep, art assets

Every picture the game draws, where it is drawn, what shows it, and which of Stephen's sheets replaces it
(`plans/marrowdeep/ART-PACK-MARROWDEEP.md`). The game ships with every mark drawn by code as a flat SVG
`<symbol>` in `index.html`; no image loads at runtime until a sheet is cut, and a cut sheet replaces its
symbols one for one under the same ids, so nothing else in the file changes.

**The law that keeps this list honest:** layout law 12 (`test/layout.mjs`, A2.8) walks every screen at three
widths and fails on any `<use>` that points at an id with no drawn `<symbol>`. Before A2.8 the eight gear slot
tiles on the Character screen pointed at `#g-head` to `#g-token`, none of which existed, and drew eight empty boxes.

## Drawn symbols (19)

All share `viewBox="0 0 32 32"` and the `.die` stroke (`currentColor`, 2.2), so a tint is a CSS `color`.

| id | what it is | where it shows | replaced by |
|---|---|---|---|
| `g-d4` | triangle | die tiles on Creation, Character, party cards, pre roll big die | Sheet 1, dice |
| `g-d6` | square | the same | Sheet 1, dice |
| `g-d8` | diamond | the same; the fallback big die | Sheet 1, dice |
| `g-d10` | kite | the same | Sheet 1, dice |
| `g-d12` | pentagon with an inner face | the same | Sheet 1, dice |
| `g-might` | three bars (a fist) | stat glyphs on challenge cards, Aspect cards, Creation | Sheet 1, stats |
| `g-grace` | a leaning line with a dot | the same | Sheet 1, stats |
| `g-wits` | an eye as a lens | the same | Sheet 1, stats |
| `g-nerve` | a flame in a ring | the same | Sheet 1, stats |
| `g-renown` | a heart shaped seal | the Hall counter | no sheet asks for it |
| `g-marrow` | a crossed bone | the Hall counter | no sheet asks for it |
| `g-head` | a coronet | Character gear tile, head | Sheet 3, row two |
| `g-chest` | a breastplate | Character gear tile, chest | Sheet 3, row two |
| `g-hands` | a gauntlet | Character gear tile, hands | Sheet 3, row two |
| `g-feet` | a greave and boot | Character gear tile, feet | Sheet 3, row two |
| `g-weapon` | a cleaver | Character gear tile, weapon | Sheet 3, row two |
| `g-charm` | a locket | Character gear tile, charm | Sheet 3, row two |
| `g-sigilWard` | a warding disc with a rune | Character gear tile, ward | Sheet 3, row two |
| `g-token` | a notched tally stick | Character gear tile, token | Sheet 3, row two |

The dice ids are built as `'g-d' + size` (`VIEW.dieGlyph`) over `DICE = [4, 6, 8, 10, 12]`; the stat ids as
`'g-' + stat` over `STATS`; the slot ids as `'g-' + slot` over `SLOTS`. A new die size, stat or slot needs a
symbol under that id, and law 12 says so the first time a screen shows it.

## Drawn inline, not as symbols

| what | where | replaced by |
|---|---|---|
| `#titleMark`, the eight sided die from above with a marrow red pip | Title screen | Sheet 5 if it beats the drawn one |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | the PWA icons, rendered from the title mark by `tools/icons.mjs` | Sheet 5 |

## Owed: the sheets name them, the code neither draws nor references them

| what | count | sheet |
|---|---|---|
| challenge shape marks (Gate a door, Chain two links, Relay hands passing a rope, Vault a keyhole, Toll a cut coin, Open an arch) | 6 | Sheet 3, row one |
| Sigil marks | 6 | Sheet 3, row three |
| status marks (drop, plate, scar, laurel, bone, burst, step, open hand, stool) | 9 | Sheet 3, rows four and five |
| Origin portraits, one silhouette each | 8 | Sheet 2 (the Character screen's portrait seat is empty today) |
| the Hall and Wall backdrop | 1 | Sheet 4 |
| boss Aspect plates | see below | the boss plates |

**A mismatch for Stephen:** the boss plate prompt asks for **three** plates a boss ("three Aspects each"), but
every boss in the game carries **four** Aspects on four stats (`sim.js --data` asserts it for all six). As
written, each boss sheet comes back one plate short.
