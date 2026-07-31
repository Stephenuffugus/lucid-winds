# Steam store art for Jumping Jimothy — generated, not commissioned

Everything Valve asks for, built out of assets that already exist: the city
backdrops, the hero poses, the game's own fonts and palette. Nothing here is new
artwork. It is **layout at Valve's exact pixel sizes**, which is the part that was
actually missing — the game art was always finished.

    node store/jimothy-steam/capsules/build.js      # the 7 capsules
    node store/jimothy-steam/capsules/shots.js      # the 5 screenshots
    # needs a static server on :8942 from the repo root

`POSE=idle|sit|leap|cheer node build.js` swaps which hero pose fronts the capsules.
⛔ `leap` reads splayed and spidery at capsule size; `idle` is the clean silhouette
and is what the committed set uses.

## What is in `out/`

| file | size | where Steam shows it |
|---|---|---|
| small_capsule | 231x87 | search results, recommendations — **weighted hardest** |
| header_capsule | 460x215 | the store page header, your library |
| main_capsule | 616x353 | front page features, daily deals |
| vertical_capsule | 374x448 | seasonal sales, curated shelves |
| library_capsule | 600x900 | a player's own library grid |
| library_hero | 3840x1240 | the wide banner at the top of your library page |
| page_background | 1438x810 | behind the store page itself |
| screenshots/ | 1920x1080 x5 | the store page gallery |

The library_logo (1280x720 transparent PNG) is the one piece NOT generated here —
it is a wordmark on transparency and wants a real design pass rather than a
screenshot.

## The screenshot rule
The game is portrait and Valve wants 16:9, so each shot is the **real game frame at
native size, centred on its own backdrop blurred behind it**. ⛔ Never stretch the
game to fill 16:9 — a distorted screenshot is the single cheapest-looking thing on
a store page.

## ⛔ Art direction is Stephen's
These are drafts to react to, not a finished decision. Palette, pose, crop and
wording are all one edit away in `build.js`.
