# Updraft, art

Everything on screen is drawn by code tonight: sky by the clock, cumulus from seeded circles, far hills, grass with wildflowers, Mabel the oak, the sunny patch and its dandelion seeds, the kite as a wobbling quad, the line as a bowed quadratic, the tail as a tapering ribbon.

The four sheets in `plans/updraft/ART-PACK-UPDRAFT.md` (field, Mabel, the five kites, an icon mark) are not yet delivered and the game does not wait on them. When they land: `art/field.jpg` 900x1600 q80 replaces the drawn grass and hills, `art/mabel.png` 800x800 replaces the drawn oak, `art/kite-<id>.png` 256x256 for the picker cards (P2), and the icon mark replaces `tools/icons.mjs` output if it is better.

The kite picker (`#scrKites`, P2) draws no silhouette yet: each card is the kite's name and one line. When `art/kite-<id>.png` lands it goes at the left of the card at 48 px, keyed on white.
