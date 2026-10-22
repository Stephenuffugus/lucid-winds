# Moongraft (working name)

The room grows one plant together, blind, and everybody can save the card.

**This is the only title in the pack with no scores, no voting and no losers, and that is the point.** A party needs
somewhere for the person who does not want to be quizzed. The artifact is the reward. `gameComplete` still fires once
per game.

## Files
| file | what it is |
|---|---|
| `content.js` | `MOONGRAFT_LAYERS` (8 parts with zones and briefs), palette, brush widths, `MOONGRAFT_VARIANTS` (empty) |
| `render.js` | **the one renderer**: the TV, every phone, the host's seat and the saved PNG all paint through it |
| `host.js` | host screen, part assignment, stroke acceptance, name and poem, gallery |
| `player.js` | phone: rules, the drawing surface, the reveal, the gallery and saving |
| `game.css` | both screens |
| `candidates.review.js` | Astra's 30 prompt variants, NOT LIVE, not reviewed |

## Phases
| phase | seconds | host screen shows | phone shows |
|---|---|---|---|
| `rules` | 20 (Next cuts it short) | the four rule lines | the same four lines, "Your secret part will appear here." |
| `draw` | 80, three times | who is drawing and how many have started, never WHAT | your brief, hint, notches, surface, palette, sizes, Undo, Clear drawing, Done for now, Saved, the public count |
| `grow` | 15 | the plant assembling a part at a time, beside its name, poem and growers | the same plant, assembling on the same schedule, with its name and poem |
| `gallery` | none | three cards (each can be Removed), Grow more, Another game, End night | the three cards, Save card, Save all three, Include our names |

When everybody taps Done for now (after at least 15 s), the room says "All set. Finishing soon." and grows the plant
three seconds later; the countdown never restarts.

## The ideas that make it work

**One part each, always, and never the same part twice.** The part set grows with the room: three players get pot,
bloom and leaves; eight get all eight. Players are shuffled once and the parts rotate across the three plants, so
nobody draws the pot three times.

**Each part owns a rectangle of the card, and the phone shows that rectangle as the WHOLE surface.** So you draw big
on a small screen and it still lands in the right place.

**The phone names the part that meets your edge, and marks WHERE.** "Your leaves meet the pot at this edge." plus a
small gold notch at the meeting point (the plant's spine where it crosses your part). It leaks a word and a mark,
never a picture.

**A connector stem when nobody draws one.** A room of three has no stem part; a stem player can leave theirs blank.
Then `render.js` paints a thin neutral stem behind the art from the pot's rim to the bloom, so the plant looks
assembled on purpose. It is part of the canonical picture (TV, phones and the saved card).

## Strokes, acknowledged (Astra D02)
Strokes are quantised integer arrays (0 to 1000 inside the part's own zone, points closer than 7 units dropped,
260 points a stroke, 220 strokes a player), each with an id. After every stroke the phone sends its whole drawing with
a rising revision; the host keeps the newest revision only (a late or duplicated packet never brings back an undone
line) and acknowledges it, and the phone shows Saved. No answer in 2.5 s: the same revision again.

A reloaded phone gets its drawing back: first from this tab's `sessionStorage` (it can hold strokes the room never
acknowledged), else from the room's accepted copy, which the host sends with the part.

## The name and the poem are the real ones
`host.js` pulls `/word-banks.js`, the same file Lucid Winds ships, and the selection maths is lifted from `getHaiku` and
`getPlantName`. The hash is made from the drawing, so the same plant always gets the same name and poem. It is not a
promise that no other plant shares a poem: a finite bank repeats. If the banks fail to load, the card is "Our moon
plant" with no poem, which is honest.

## Saving a card (Astra D04)
Save card (or Save all three) opens a screen with the finished 1200 x 1600 PNG: the plant, its name and poem, the
growers' names only if Include our names is on, and nothing else (no room, device or place).
- **Share or save** appears only where the browser can share files (Android Chrome, iPhone Safari). It opens the
  phone's share sheet; on iPhone that sheet has Save Image.
- **Download** under each card: Android saves to Downloads, iPhone Safari offers it to Files.
- **Press and hold** the picture: iPhone offers Save to Photos.
The last gallery is kept in `localStorage` (`mg_garden`). End night does not take the cards away: the closed room
screen gets a Save your cards button that leads back to them. A full reload after the room has closed does not bring
them back (the join page does not load game modules).

## Removing a card (SHELL-D10)
On a big screen each card on the TV has Remove. With no big screen only the host's own seat shows Remove this card.
Either way the card leaves every phone's shelf before anyone saves it.

## Prompt variants (Astra D05)
`MOONGRAFT_VARIANTS` entries (`<base>_rNNN`) can replace a part's brief and hint for one plant. Their zone, order and
assignment always come from the base part. The list is empty: Astra's 30 wait in `candidates.review.js`.

## What goes over the wire, and who can see it
Strokes go only phone to host, and the reveal sends every part to everyone at once. No other phone's SCREEN ever shows a
drawing before the reveal. The transport itself still delivers every message to every phone and each phone ignores
what is not addressed to it, so a curious person with developer tools could read strokes early (the shell's data level
secrecy is not built; Astra SHELL-D01).

## Proof
```
node party/test/drive.js moongraft 3          # and 5: the autopilot draws real pointer strokes
node party/test/moongraft_rules.js            # assignment, connection, variants, one renderer, recovery, stale packets, done
node party/test/notv_moongraft.js             # phones only, the host's seat draws, live party database (serve the repo on 8765)
```
