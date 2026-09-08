# Updraft, art

Everything on screen is drawn by code tonight: sky by the clock, cumulus from seeded circles, far hills, grass with wildflowers, Mabel the oak, the sunny patch and its dandelion seeds, the kite as a wobbling quad, the line as a bowed quadratic, the tail as a tapering ribbon.

The four sheets in `plans/updraft/ART-PACK-UPDRAFT.md` (field, Mabel, the five kites, an icon mark) are not yet delivered and the game does not wait on them. When they land: `art/field.jpg` 900x1600 q80 replaces the drawn grass and hills, `art/mabel.png` 800x800 replaces the drawn oak, `art/kite-<id>.png` 256x256 for the picker cards (P2), and the icon mark replaces `tools/icons.mjs` output if it is better.

The kite picker (`#scrKites`) draws each kite's silhouette from `KITE_SHAPE` on a 44 px canvas beside the name (20260907d), and since 20260908a the flying kite is drawn from the same table through `KITE_PAINT`. When `art/kite-<id>.png` lands it replaces the card mark at the left of the card at 48 px, keyed on white; the flying kite stays code drawn.

## The doodads (docs/GEAR-DOODADS-SEP08.md, 20260908e)

Eight things a kid would tape to a kite, every one a code drawing tonight (`drawDoodadIcon` in index.html, section 9b), drawn at three sizes: the shelf chip (15 px on a 28 px canvas), the kite card's mark (about 7 px, at the place it rides) and the flying kite (about a third of the kite). The bell on the line flashes a ring as it rings; the whistle shows two arcs of breath while it sings; the spinner turns with the airspeed; the puppet's arm waves harder in a gust; the chip clip sits on the line where the model says it has climbed to. A painted sheet can replace any of them: `art/doodad-<id>.png` at 64x64 keyed on white, ids ribbon, streamers, bell, whistle, puppet, ball, chipclip, spinner; the chip and the card take the sheet first, the flying kite keeps the code drawing until a sheet reads at twelve pixels. The tail doodads are the tail's own chain (the ribbon's added metres in sage and cream, the streamers as two more thin ribbons beside it, the ball on the tip the physics swings) and stay code drawn.
