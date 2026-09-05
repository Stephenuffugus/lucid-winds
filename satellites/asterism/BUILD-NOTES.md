# Asterism build notes

What the night learned. The design is
`docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-ASTERISM.md`, the plan is
`plans/asterism/HANDOFF-ASTERISM.md`, and every choice this build made that neither of them made is in
`docs/DECISIONS.md`.

## The one command

```
node tools/check.js          everything
node tools/check.js --fast   skips myth, layout and thumb and SAYS so
```

| gate | what it is | watched to fail by |
|---|---|---|
| `lint` | the studio laws against the shipped file: the script parses under `vm.createScript`, no `.mjs` at runtime, a `?v=` on every asset, one stamp in three places, no dash or exclamation point in player copy, no `shadowBlur`, no text under 0.7 rem | putting a dash in a line of copy |
| `astro` | 105 assertions over the astronomy and the myth grammar, run in Node against the same source the page runs | flipping the sign of the longitude term in `lstHours` |
| `myth` | 5000 myths: every fragment reached, none swallowing its slot, all distinct, 67 to 116 words, the brightest star named, no dash, no exclamation point, no always, never or forever | putting a dash in one fragment |
| `boot` | the page framed, the catalogue fetched as a stamped file, and THE COUNT: the number of stars the renderer drew against the number the astronomy puts above the horizon | (the count is the one that ties the pixels to the maths) |
| `draw` | 35 assertions with real pointers: taps nine pixels off centre, the pick radius from both sides, the label, undo, branch, a two finger pinch to both limits, a drag that turns the dome by the width of the drag, a typed name, and the almanac entry holding the three Hipparcos numbers | `PICK_PX` at 2 |
| `almanac` | SHARE makes a link that survives a catalogue update, a FRESH browser opening it draws the same stars under the same name with the same myth, and EXPORT makes a real 2048 by 2560 PNG whose bottom is not blank | a raw GPS reading in the link, and the poster at half size |
| `layout` | every button on every screen at 375, 320 and 412: 48 px rendered AND reachable. Nothing hanging off the side of its own sheet. The music pill's seat | `.btn.small` at 40 px, the row rule removed, the city list back to a max height only |
| `thumb` | the arcade tile has a sky and the gold shape in it, and is under 150 KB | (its own measurement is the gate) |

## What the gates caught that a green run would have hidden

1. **`unproject` was out by 38 degrees** at the edge of a 90 degree field. Only the round trip could
   have found it: every star still lands somewhere plausible and only a tap would have been wrong.
2. **Four whole SHAPE lists read as unreachable** because the myth gate matched a fragment by the text
   before its first slot, and those fragments start with `{N}`.
3. **The Prompt of the Night card ate star taps.** Its button sat on Vega at 375 wide.
4. **The city list collapsed to two pixels** at 320 wide, inside a flex column.
5. **SHARE hung half off the right edge of the myth sheet**, and three separate checks were blind to it:
   the page level scroll width, `elementFromPoint` after `scrollIntoView`, and the eye.
6. **The draw gate tapped stars pixel perfect**, so `PICK_PX` at 2 stayed green. It taps nine pixels off
   centre now, in a direction chosen so the nearest star is still the intended one.
7. **The draw gate tapped "empty sky" onto a star.** With five hundred stars on a phone screen, a point
   chosen by eye is usually inside the pick radius of one. It searches for the emptiest patch now.
8. **One assertion in the almanac gate ended in `|| true`.** It asks by name what a share link is
   allowed to carry now.
9. **The shots tool's single shot filter skipped the setup**, so `p2-myth` photographed an empty sky.

## Reading the output, not the counters

Three things no counter would have found, all of them from reading a hundred myths and looking at
twelve screenshots:

- a copper kettle that kept the mice honest for eleven years,
- star counts printed as digits,
- and a sky that passed every assertion and still read as confetti.

## Numbers that moved

| key | plan | shipped | why |
|---|---|---|---|
| star size and alpha | linear, 4.5 to 1.2 px | a power curve with a 0.32 alpha floor | the confetti |
| `moon` phase | a mean lunation | the real elongation | three times closer, and free |
| archetypes | 4 | 5 (creature and vessel split) | the kettle |
| toast position | not specified | bottom edge | it sat over the poster |
| poster field | 60 degrees | the shape's own span plus room | a small mark on a big print |
| Milky Way alpha | not specified | 0.017, mottled | the first one was a searchlight |

## What is not built

- **The official 88 constellation lines.** Out of the slice entirely; the line data needs its own
  licence check (plan 3.4). The catalogue's region codes are used instead, and every one of them has a
  charted English name so the myth can say "in the region the old charts call the Lyre".
- **The six anchor myths** from Stephen and Penny. `data/anchors.json` is theirs and it is empty.
- **Planets, meteor showers, the family almanac, the WebXR successor.** Design section 12.
- **An embedded serif.** The system stack ships; the poster decides, with Stephen holding one.
