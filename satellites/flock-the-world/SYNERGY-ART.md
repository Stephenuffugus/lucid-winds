# FTW synergy plates + achievement badges — status (Aug 27)

Stephen delivered `assets/Badges and combos-...zip`: two sets of 16, color-key
cut and looked at, one by one.

## Synergy plates (the discovery-modal art) — 12 of 16 LIVE

The artist made gorgeous work but not a strict 1-to-1 with the 16 combos in the
Sheet-12 order. I matched each image by CONTENT, not position. Live now
(`art/synergy/<id>.webp`, SYN_ART flipped, probed in the modal):

| Combo | Plate | Match |
|---|---|---|
| THE TICKET MACHINE (ticket) | combo #1 | exact |
| PERMANENT RECORD (pipeline) | combo #2 | exact |
| MANUFACTURED CONSENT (consent) | combo #3 | exact |
| NEIGHBORHOOD PANOPTICON (panopt) | combo #4 | exact |
| THE MEMORY HOLE (memhole) | combo #9 | exact (newspaper→vault) |
| COMPANY TOWN (town) | combo #10 | exact (city hall + lanyard + contract pages) |
| PRECRIME PREMIUMS (precrime) | combo #11 | exact (risk score + insurance umbrella) |
| LITTLE GREEN MEN (lgm) | combo #12 | exact (unmarked border + invoice) |
| EYE IN THE SKY, PRIME TIME (skyanchor) | combo #13 | exact (drone feed + anchor) |
| CURFEW PLUS (curfewplus) | combo #14 | exact (GREEN LANE / loyalty two-lane) |
| OUTRAGE ON RETAINER (oncue) | combo #15 | exact (angry-mask studio audience) |
| NO NEW FRIENDS (nonewfriends) | combo #7 | close (orbital node network + central eye) |

## ⛔ Still owed a bespoke plate — 4 combos have NO art

The zip contained no image that depicts these, so they still render the
artless modal (which is fine — the hook degrades gracefully):

- **HALL MONITOR NATION** (hallmon) — a kid with a sash rating a queue of adults
- **THE ALGORITHM RIDES SHOTGUN** (shotgun) — rideshare dashboard routed through a red PREDICTED zone
- **FINE PRINT** (fineprint) — a night traffic stop, the citation unrolling to the pavement
- **THE WELCOME MAT** (welcomemat) — a sweet porch, the doorbell scan-brackets on a visitor with flowers

(Paint directions are in the 012Assets "Sheet 12" doc. Drop each as
`art/synergy/<id>.webp` + flip its SYN_ART key.)

## 4 spare atmosphere plates — staged, not wired

Four images are general FTW mood rather than a specific combo. Cut and kept in
`art/synergy/_spare_*.webp` for reuse (menu/war-room/end backdrops, or event
art) rather than mis-assigned to the wrong synergy:

- `_spare_hearing` (combo #5) — a Senate/oversight hearing room, network graph on the desk screens
- `_spare_uprising` (combo #6) — a crowd tearing cameras off a pole, purple smoke
- `_spare_emptystreet` (combo #8) — an empty rainy avenue watched by two cameras
- `_spare_armsfair` (combo #16) — plane, tanks and a glowing dome (reads as the Arms Fair arc)

## Achievement badges — 16 cut + STAGED, system NOT built

The 16 medallions (circular + shield, on magenta) are cut into
`art/badge-ach/ach_01.webp` … `ach_16.webp`. They are NOT wired to anything,
because **FTW has no achievement system** — that is a real feature (16 triggers
+ a UI panel + persistence), and it is Stephen's call whether to build it. The
proposed 16 achievements (names + triggers) are in the 012Assets Sheet-12 doc.
When greenlit, the art is ready and the badge ids match the achievement order.
