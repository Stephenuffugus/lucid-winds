# Petal Match art drop

Put raw sheets here as they come off the generator. Any filename is fine, but
`sheet-07.png` style names make the QA report readable.

## How every sheet gets cut

⛔ **Never write on the first pass.** Always look first:

```bash
python3 scripts/cut_art_sheet.py art-drop-petalmatch/sheet-07.png \
    --auto --qa --dry --contact /tmp/s07.png
```

That prints:
- the **background key** it measured, and a loud warning if the hue-based method
  disagrees (the pink and purple trap, see below)
- the **layout** it detected, and a warning if a gutter was bridged by paint
- a **per-frame QA table** and a **REDO LIST** of anything clipped, sparse, tiny
  or haloed

Then open the contact sheet and actually look at it. Only when the frame count,
the order and the QA all agree does it get written:

```bash
python3 scripts/cut_art_sheet.py art-drop-petalmatch/sheet-07.png \
    --auto --qa --names base-1,base-2,... \
    --out assets/games/petalmatch --contact /tmp/s07.png
```

## ⛔ Sheets 7, 8, 9 and any other pink or purple ones

Stephen flagged these. The original Jimothy cutter decides what is background by
looking for magenta, and **pink or purple ART satisfies that same test** — it
would key on the flowers and delete them. `cut_art_sheet.py` measures the
background from the sheet BORDER instead, and warns when the two methods
disagree. Proven on a trap sheet: art survived whole, warning fired.

If a pink sprite still comes out eroded, raise the thresholds for that sheet
only: `--t0 45 --t1 85`. Higher t0 means "you have to be further from the
background colour before I start making you transparent."

## Sheet 21

Flagged as tricky. Run it with `--dry` several times at different `--cols/--rows`
before trusting `--auto`, and compare contact sheets.

## What comes back to Stephen

The REDO LIST at the end of a run is the list he asked for. Note the difference:
- **CLIPPED** usually means the CUT was wrong, not the art. Re-cut it first.
- **SPARSE / TINY / EMPTY / HALO** usually means the sprite needs remaking.

---

## Two cutters, and when to use which

**`scripts/cut_art_sheet.py`** — the general one. Decides what is background by
COLOUR DISTANCE. Right for normal sheets: green leaves, gold frames, blue ice on
magenta.

**`scripts/cut_pink_sheet.py`** — for sheets whose ART is close in colour to the
BACKGROUND. It decides what is background by REACHABILITY instead: flood fill
from the sheet border, and whatever the flood cannot reach is art, no matter how
pink it is.

Measured on a worst case (a petal whose fill sits 10 units from the background):
```
colour-distance cutter   84x80 frame,   4,209 px   ← ate the whole petal body
flood cutter            224x220 frame, 38,300 px   ← petal intact
```

⭐ **Better still: stop making the problem.** If pink and purple assets are going
onto their own sheets anyway, generate those sheets on a **GREEN or DARK**
background rather than magenta. Pink art on green separates trivially and needs
neither tool's cleverness. The flood cutter is the safety net, not the plan.
