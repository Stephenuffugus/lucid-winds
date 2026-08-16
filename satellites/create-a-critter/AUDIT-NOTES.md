# Create A Critter, browser edition: audit 2026-08-16

Audited at BUILD `m1` (3863 lines, single file + vendored `three.min.js`).
Everything below was found by reading the shipped source and by mechanical
checks in node (`check.js` in this folder). No browser was available to this
pass, so anything marked NOT VERIFIED IN A BROWSER is source level only.

The list was written BEFORE any edit. Fixes and improvements are recorded
underneath it.

---

## 1. Is it genuinely backend free?

Yes. Verified by grep over the whole file:

- Exactly one remote script: `https://lucidwinds.com/sunbeam-sdk.js?v=7`, and
  every use of it is guarded (`window.Sunbeam&&...`). Missing SDK costs the
  player nothing but sunbeam credit, which is honest.
- One `fetch` in the whole app: the BUILD freshness sentinel fetching this
  page's own source.
- No XHR, no WebSocket, no Firestore, no image loaded from any host. The only
  local asset reference is `three.min.js` in this same folder, so the `/assets`
  route collision that shipped a blank page on the arcade cannot happen again:
  there is no `/assets` path in this app at all.
- No service worker and no `caches` API, so the fleet cache wipe class of bug
  cannot happen here either. Nothing to prefix, nothing to bump.
- Nothing leaves the device. The nursery, the room and the settings are all
  `localStorage` on the player's own machine.

So the browser edition claim holds. What does NOT hold is the failure
behaviour around it, which is the rest of this list.

## 2. Silent failure paths (the bug class that already cost this project a day)

**S1. WORST: a critter that will not reopen strands the player on the hatch
screen forever.** `openFromNursery` sets the hatch screen, then loads the
stored PNG through `new Image()` and does all its work in `img.onload`. There
is no `onerror`. A drawing that fails to decode (a write truncated by a full
localStorage quota is the realistic cause, see S2) means `onload` never fires:
the app sits on "NAME is waking up…" with no button, no back, no message.
The only exit is reloading the page. Same missing `onerror` in `spawnFriends`,
`startParade`, `startPlaydate`, `rebuildCurrent`, `applyScene` (the room) and
`pmColor` (the coloring page).

**S2. Saving a critter can fail silently and lose it.** `lsSet` swallows every
exception. Each critter stores a 512px PNG data URL (roughly 40 to 300KB) and
the room stores a 768px one; ten nests plus a room can plausibly cross a 5MB
localStorage quota. When it does, `persistCur()` fails silently: the kid sees
their critter alive on screen, the nursery count looks right, and the critter
is simply not there tomorrow. This is precisely the demo-sample class of bug,
moved from the server to the browser: something plausible on screen while the
real thing failed.

**S3. A dead 3D stack freezes the same hatch screen.** `initStage()` is called
inside `bringToLife`'s `setTimeout`. If `three.min.js` failed to load, or the
device cannot give a WebGL context (old tablets, GPU blocklist, too many live
contexts), `new THREE.WebGLRenderer` throws. Nothing catches it, so the whole
callback dies after the screen has already switched to hatch: same permanent
"Your creature is puffing up…" freeze, no message.

**S4. `readSilhouette` returning null is silent in four of its five callers.**
`bringToLife` handles it honestly ("Draw a bit more of your creature first!").
`openFromNursery` bounces back to the nursery with no explanation,
`rebuildCurrent` returns and the player's stitching visibly does nothing,
`spawnVisitor`/`spawnBug` just never appear.

**S5. Critter Parade does nothing at all with an empty nursery.**
`startParade` returns early on `!recs.length`. Tapping 🎪 gives no sound, no
message, nothing. (The playdate button next to it does toast honestly, so the
inconsistency is clearly an oversight.)

**S6. One corrupt nursery record blanks the whole grid.** `renderNursery`
reads `rec.profile.personality` with no guard; a record missing `profile`
throws inside the loop and every card after it, plus the ones already
appended, are lost to the player behind an empty grid.

**S7. The freshness fetch does not check `r.ok`.** `fetch(...).then(r=>r.text())`
resolves for a 404 or a 500 (fetch does not reject on HTTP errors). The regex
then simply fails to match, so the outcome is benign today, but the shape is
the one that has bitten this fleet before.

**S8. `printCard` swallows a failed 3D render** and prints a keepsake card
with a broken image box where the critter should be.

## 3. Does every creation control work?

Mechanically checked: every `$('id')` in the script resolves to an id in the
HTML (0 missing), no duplicate ids, every `[data-glimb]`, `[data-limb]`,
`[data-group]` selector matches real elements. Two exceptions found:

**C1. Picking a color silently leaves a sticker armed.** The palette handler
tries to restore the sticker highlight with
`document.querySelector('[data-stamp="..."]')`. No element in this app has ever
had a `data-stamp` attribute (the flyout buttons carry no attributes at all),
so the selector always returns null. `clearToolSel()` has already stripped the
highlight off the group button but `brush.stamp` is still set, so after picking
a color the kid gets a stamp when they expect a line, with no control looking
selected. Real, reachable, and confusing exactly at the moment a kid switches
colors mid drawing.

**C2. Dead texture wiring.** `document.querySelectorAll('[data-tex]')` at load
time matches nothing (textures are built inside the flyout with their own
listener). Harmless today, but it reads as the place textures are wired and is
a trap for the next reader.

**C3. Leaving the room easel through the back arrow corrupts the app.**
`startRoomEdit` hides the "Bring it to life" row and sets `roomEdit = true`.
The back arrow and the nursery pencil both just switch screens; neither clears
`roomEdit` or restores the row. After that, Draw a Critter has no bring to life
button at all, and the wizard's Next button (the only remaining action) runs
`finishRoomEdit()`, which saves the kid's new CRITTER drawing as the room
wallpaper and asks them to place the bed in it. Reachable in three taps.

Everything else wired as advertised on a source read: 12 colors, 3 sizes,
bucket, eraser, rainbow, undo, redo, 2 zooms, 36 stickers in 4 groups, 4
textures, guided builder, stitch studio, mark a face, dress up, feed, play,
walk, dance, cuddle, guide, tuck in, room, photo, print, sound, home, parade,
playdate, balloon send off, wild visitor, mystery egg. NOT VERIFIED IN A
BROWSER.

## 4. Can a critter be made, saved, reloaded, shared?

- Made: yes (draw, guided builder, or the wild visitor path).
- Saved: yes, `persistCur()` on birth and on every care change, but see S2.
- Reloaded: yes, `openFromNursery` re runs the whole pipeline from the stored
  PNG, but see S1 and S4.
- Shared: deliberately not, and correctly so. There is no upload, no share
  sheet and no moderation gate because nothing leaves the device. The only
  outputs are a printed keepsake card, a printed coloring page and a photo
  download, all local. That posture is right for a kids' drawing app and must
  stay: if sharing is ever added, a moderation gate goes in FIRST.

## 5. localStorage discipline (studio rule: read modify write)

**L1.** `NEST` is read once at boot and written back whole (`jSet(K_NEST,NEST)`)
from six places. Two tabs of the same app on a tablet, or the app plus a
future same origin reader, clobber each other: whichever tab writes last wins
and the other tab's critters are gone.

**L2.** `cac_berry_best` and `cac_toss_best` compare against the value read at
page load, not against the stored value at write time. A better score set in
another tab is silently overwritten with a lower one.

**L3.** `cac_bond` (days together) is an increment on a boot time snapshot.
The studio rule for this counter is that it only ever goes up; two tabs can
currently walk it down.

## 6. Touch targets at 375x667 (48px minimum, rendered)

Measured from the CSS and inline styles:

| Control | Rendered | Verdict |
|---|---|---|
| `.bigbtn` 60px, `.actbtn` 52px, `.actbtn.mini` 48px, `.foodbtn` 52px, `.chipbtn` 48px, `.flybtn` 54px | ok | pass |
| `.swatch` colour dots | 42px | FAIL, and it is the most tapped control on the draw screen |
| `#berryQuit` (quit a game) | 40px | FAIL |
| nursery 🎈 set free | about 30px | FAIL, and it opens a destructive confirm |
| `#visitorBadge` | about 36px | FAIL |
| update pill | about 36px | FAIL |

## 7. Copy rules

**Dashes in player facing copy (hard studio rule), 6 sites:**
`"✨ A new version is ready — tap to update"` (em dash, flagged by the main
loop too), `Toot-toot!`, `Beep-bip!`, `-legged explorer`,
`three-legged wanderer`, `two-legged hopper`, `teeny-tiny`, `just-right`.

**Inaccurate copy:** the wild visitor says "You fed it N days in a row" and
"N of 3 days of snacks" while the code counts DISTINCT days, not consecutive
ones. It reads as a lie the first time a kid skips a day and the count holds.

**Art provenance:** no "hand drawn" or "hand painted" claim anywhere in player
copy. The stickers are drawn in code and described as stickers, which is fine.
(The HANDOFF.md line "36 hand-drawn canvas stickers" is a dev doc, not player
copy, but it is worded the way the studio rule forbids and is corrected.)

## 8. Freshness / update path (main loop's question)

There is NO service worker in this app, so there is nothing to strand a player
behind an edge pinned worker and no `SHELL_VERSION` to keep in step. The update
path is the BUILD sentinel only:

1. 2.5s after load it fetches `location.pathname + '?probe=' + Date.now()` with
   `cache:'no-store'`, so it cannot read a stale copy of itself.
2. It compares `var BUILD='…'` in the served source with its own.
3. On a difference it either silently `location.replace`s (home screen, nothing
   drawn) or shows the update pill.
4. The replacement URL is `location.pathname + '?v=b' + newBuild`, a query
   string this player has never requested, so the host cannot serve it from the
   stale-while-revalidate window. The path does deliver, PROVIDED the BUILD
   constant is bumped on every deploy.

Two defects in it: it drops any existing query string (an `?embed=1` or a
future flag is lost across the refresh, and a player already sitting on
`?v=bm1` gets a working but query mangled URL), and it does not check `r.ok`
(S7). Both fixed below. The rule to carry forward: **BUILD and the portal
card's `?v=` move together on every deploy.**

---

# What was fixed

Worst first. Every fix keeps the kid safety posture (nothing is ever deleted
silently, the critter is never sad, nothing leaves the device).

1. **S1/S3/S4, honest failure instead of a frozen hatch screen.** Added
   `loadDrawing(url, onReady, whatFailed)`: one loader used by every path that
   turns a stored PNG back into a critter (nursery open, friends, parade,
   playdate, rebuild, room, coloring page). It wires `onerror`, it treats a
   null silhouette as a failure, and on any failure it shows a real message and
   returns the player to a screen with buttons on it. `initStage` is now
   guarded: a missing `THREE` or a refused WebGL context shows
   "This device cannot show the 3D meadow…" instead of freezing. No path can
   leave the player on the hatch screen any more.
2. **S2, a save that fails is now visible.** `lsSet` reports success or
   failure, `persistCur` verifies the write round tripped, and a failed save
   raises a clear, calm overlay telling the player their critter could not be
   kept and what to do about it (set one free to make room). It never pretends.
3. **C3, the room easel has a real exit.** Back and the nursery pencil now
   cancel room editing and restore the easel and the bring to life button.
   `roomEdit` can no longer leak into the critter flow.
4. **C1, the sticker highlight follows the sticker.** The armed sticker now
   remembers its group and re-highlights that group button after a colour pick,
   so an armed stamp is always visible on screen.
5. **S5/S6, no more silent no ops.** Parade with an empty nursery toasts.
   `renderNursery` tolerates a damaged record instead of blanking the grid.
6. **L1/L2/L3, read modify write.** `saveNest()` re-reads `cac_nursery`, merges
   by id (adds and updates never drop another tab's critters, removals are
   explicit), bests go through `lsMax`, and the bond counter re-reads and takes
   the max before it increments.
7. **Touch targets.** Swatches 48px, berry quit 48px, nursery balloon 48px,
   visitor badge and update pill padded past 48px.
8. **Dashes purged** from all eight player facing sites, sentences rewritten
   rather than repunctuated. Visitor copy now says "different days", which is
   what the code counts.
9. **S7/S8 and the freshness URL.** `r.ok` is checked, the refresh URL keeps
   the existing query string, and a failed keepsake render hides the image box
   instead of printing a broken one.

# What was improved (expressive range, judged per minute of work)

1. **🎲 Surprise me, on the easel.** The app already contained a full
   procedural critter generator used for the daily wild visitor, and none of
   that reach was available to the kid. One button now rolls a complete
   starting creature straight onto the paper (body, limbs already labelled so
   they get joints, a face already marked so it blinks), which the kid then
   redraws over. Best expressive range per minute in the whole app: it reuses
   a tested pipeline, it gives a blank page a way in, and every roll is a
   different creature.
2. **The generator got a wardrobe.** It was one wobbly blob with legs. It now
   rolls body shape families (round, tall, long), pattern (spots, stripes,
   plain), horns or spikes or antennae, wings, and a much wider colour set.
   That variety pays out twice: the Surprise me button AND the daily wild
   visitor, which was visibly samey before.
3. **Twice the colours, none of them hidden.** The palette is now two sets of
   12 (bright and soft, including skin and fur tones) with a visible swap
   button. Colour is the lever that multiplies every other tool here, since
   stickers, textures, fill and rainbow all read `brush.color`, and a scroll
   strip was rejected as a home for anything after Jesse never found the
   textures at the end of one.
4. **Keep and revisit: a critter's drawing can be edited.** Before, art was
   frozen at birth forever, so a kid could not fix a wobbly leg or add the
   wings they thought of later. 🖌️ Edit reopens the critter's own drawing on
   the easel, keeps everything else (name, care, days together, limbs, bug
   buddy) and rebuilds the 3D buddy from the new art. This is the "way to keep
   and revisit what you made" the brief asked for, at the level that matters:
   the drawing itself.

# Verification

`node check.js` in this folder. Nine checks, each watched failing on purpose
against a deliberately broken copy of the file before being accepted (the
`--selftest` flag mutates the source in memory and asserts each check goes
red). No browser was used, so this proves what the source can prove:

1. every script block parses (real `vm` parse, not brace counting)
2. every `$('id')` resolves, no duplicate ids
3. every `data-*` selector matches a real attribute in the HTML
4. no empty `catch` block without an explicit `/*ok: reason*/` annotation
5. no dash characters in player facing copy
6. no literal `</script>` inside a JS string
7. no service worker, or if one is ever added it deletes only `cac_` prefixed
   caches and its `SHELL_VERSION` matches the registration `?v=`
8. no raw whole array write to `cac_nursery`, and bests only through `lsMax`
9. interactive controls are 48px or more at 375x667

# What still worries me

- **Nothing here was seen in a browser.** No pass of this app is finished
  until someone opens it, draws, hatches, reopens from the nursery and LOOKS
  at it, including at desktop width. The audit above is source level.
- **localStorage is still the only home a kid's critter has.** Quota is now
  honest instead of silent, but a browser data clear, an incognito session or
  a new device still takes every critter with it. That is a product decision
  (nothing leaves the device) and it is the right one for a kids' app, but it
  should be a decision made with open eyes, and the drawing PNGs are the
  reason the quota is close.
- **The nursery cap is 10 and the sell is "coming to the Sky Wolf shop soon".**
  Still true, still unwired. Once a kid fills ten nests the only way forward is
  the balloon send off.
- **No offline shell.** With no service worker the page cannot load with the
  network down, which is honest (the browser says so) but disappointing for an
  app that otherwise needs nothing. Adding one is a fleet risk and needs the
  prefix rules applied deliberately, not in an audit pass.
- **The freshness sentinel depends on a human bumping BUILD.** It is one
  constant near the top of the file, and forgetting it is invisible until a
  player reports missing features, which has already happened once here.
