# Wordmark explorations — the raccoon tail J

Your note was that the green **Jimothy** feels cheap, and that you wanted a
warmer font, "something more unique with maybe the J being a raccoon tail."

These are six options. They are **options, not a decision** — pick a number.
Nothing here touches `capsules/out/`; the shipped capsule set is untouched.

**Answer with one digit.** `_contact_sheet.png` has all six numbered.

## The six

| # | Name | What it is |
|---|---|---|
| 1 | Amber Fredoka | The smallest possible change: the shape you already ship, in the gold and cream family instead of sage green. If the green was the only problem, this is the whole fix. |
| 2 | Baloo Heavy | Same rounded family, a lot more weight, amber with a dark keyline. Holds its ground on a busy capsule and thickens rather than thins when scaled down. |
| 3 | Storybook Slab | The warm storybook direction. A slab serif reads older and friendlier than a geometric round, and flat serifs give the small capsule something to hold on to. |
| 4 | Tail J, full | The brief taken literally: the whole J is a ringed tail, full cap height, hooking at the baseline and curling back the way it does in the hero art. |
| 5 | Tail J, quiet | A J first and a tail second. Ordinary stem, rings only in the hook, so the word reads as a word at thumbnail size and the joke rewards a closer look. |
| 6 | Tail Swash | The tail leaves the letters alone and signs the name underneath instead. Perfect legibility at any size and the raccoon is still in it. |

## The test that actually decides it

`_small_capsule_test.png` is the six at **462x174, real size, no scaling** — the
small capsule. That is where a wordmark dies. All six survive it; 4 and 5 keep a
readable J with the banding still visible, and 6 keeps the cleanest word of the
lot because its tail is nowhere near the letters.

## How the tail is made

`rig/tail.js` generates it as SVG geometry from the tail in the hero art
(`satellites/stream-hop/assets/hero/idle.png`). Four things make it read as a
raccoon rather than a striped sausage, and all four are in there:

- it **tapers** — thick where it leaves the body, thin into the curl
- the bands are **perpendicular to the tail's direction**, so they bend as it
  bends, and they **crowd** as it tapers. Evenly spaced parallel stripes read as
  a barber pole, which is exactly what the first swash attempt looked like
- band edges are **soft**, not hard rules
- the silhouette is **ragged** — fur tufts, not a smooth tube

Two things I got wrong first and had to measure my way out of, in case they come
back when this gets revised:

1. **The first tail was a musical note.** Its spine lived in a box with no
   relationship to a letter, so it came out short and floating above the
   baseline and "Jimothy" read as "ɔimothy". A J is a full cap height stem with
   a hook at the baseline; the spines now live in a real letter box and the mark
   is placed by the font's own metrics.
2. **Near black bands vanish on a near black city.** In the hero art the dark
   rings sit against a light ground. On this backdrop they have to carry their
   own contrast, so the dark is a warm mid brown and the keyline stays dark.

This is constructed geometry and licensed type, not painting. Fonts vendored in
`fonts/` (Baloo 2, Bree Serif, Alfa Slab One, Chewy, Lilita One, all SIL Open
Font License) plus the Fredoka you already ship.

## Rebuild

    node store/jimothy-steam/capsules/wordmark_options/rig/build.js

Writes all twelve PNGs (six options x main 1232x706 and small 462x174) into this
folder. Whichever you pick, the treatment moves into `capsules/build.js` and the
real capsule set gets regenerated from it — and the trailer end card gets recut,
because it currently uses the shipped green on purpose rather than guessing your
answer.
