# FLIPBOOK — audit notes

Audited 2026-08-16. Read end to end (1277 lines) BEFORE any edit. Judged as a TOOL, not a game:
can you make something, does it survive a reload, can you get your work out, and does it ever
lose work silently. Left behind: `check.mjs` (node syntax gate + headless assertions at
375x667). Every assertion was watched fail on purpose before it was allowed to pass.

## The tool, walked start to finish

Draw on the page → flip forward and the previous page shows through faint → draw the next pose →
play the loop. Onion skin, a ghost of page one for lining up a loop, fill, eraser, face stamps,
a colour wheel with an eyedropper, undo and redo, copy the previous page, loop and boomerang,
up to two recorded voice tracks, cinema mode, a daily procedural starter drawing, and export to
video. Undo is per page and 25 deep. Nothing here is a stub; this is a real tool.

## DEFECTS FOUND (worst first)

### 1. When the notebook fills up, the tool stops saving and TELLS THE PLAYER A LIE.
`save()` was one `try` around a whole book write with this in the `catch`:

    toastHint('The notebook is getting heavy, older pages may not save.');

Three separate failures in one line.

- **It is not true.** `localStorage.setItem` is all or nothing. When it throws, NOTHING is
  saved, not "older pages". The book on disk is whatever last succeeded; every page drawn since
  is live in memory only.
- **The warning is a 3.2 second toast in 16px muted text at the bottom of the screen**, and it
  is then overwritten by the next hint. Saves are debounced 600ms, so after the first miss the
  player is usually looking at the default hint again while every stroke fails to save.
- **There is no recovery offered.** No prompt to export, no indication anything is wrong, and
  the app keeps behaving exactly as if it were saving. Then the tab closes and the work is gone.

This is the worst thing a creative tool can do, and the fleet has already done it once. A page
is a 512x716 PNG data URL, so a real drawing is 40 to 120KB and a 100 page book is comfortably
past a 5MB quota. This is not a corner case, it is what happens to the kid who keeps going.

### 2. A save that merely parses walks straight into the app. (standing class 3)
`load()` try/catches the parse and then trusts the result:

    var b=JSON.parse(localStorage.getItem('fb_book')||'null');
    if(b&&b.pages&&b.pages.length){ pages=b.pages.slice(0,MAXPAGES); ... }

`{"pages":"hello"}` passes every one of those tests, and `pages` becomes the string `"hel"`.
The app looks fine until the player taps ›, where `pages.push(null)` throws inside the click
handler: the arrow stops working and nothing anywhere says why. `cur` was not clamped at the
bottom either, so a negative `cur` shows a blank page numbered `0 / 3`. `fb_recents` had the
same hole: anything that parses becomes RECENTS, and `RECENTS.indexOf` then throws inside the
colour wheel's pointerup, silently killing colour picking.

### 3. Export produced a file that will not open, on the tablet this tool is for.
The recorder is created as `video/webm` with a fallback to `new MediaRecorder(stream)` for
browsers that refuse it. Safari and iPadOS take that fallback and record **mp4**. The blob was
then hard labelled `{type:'video/webm'}` and downloaded as `flipbook.webm`, so the child gets a
file their own device cannot play. There was also no watchdog: if `onstop` never fires, the
EXPORTING chip sits on the page forever with no way out but a reload.

### 4. Two tabs silently destroy a book. (standing class 4)
`fb_book` is written wholesale from whatever this tab has in memory. Open Flipbook twice, draw
in both, and the tab that saves last erases the other book completely. For a game that costs a
score. For a drawing tool it is somebody's animation.

### 5. The colour swatches are 33 rendered px. (standing class 6)
The file carries a four line comment explaining that the 540x960 stage is scaled to about 0.69
on a phone, so buttons must be 70 CSS px to clear 48 rendered. The buttons were fixed. The
swatches were not: `.swatch` is 48 CSS = 33 rendered, `.swatch.recent` is 44 = 30, and the
shade slider is 44 wide = 30. These are the controls a small child uses most.

### 6. The feedback fab sits on the paper and on the tool rows. (standing classes 2 and 8)
Measured, not assumed: at 375x667 the fab's footprint lands inside the notebook page and, when
a tool menu is open, on the right hand end of the tool rows. In a drawing app the canvas is the
control, and the fab's own collision watcher does not count a `<canvas>` as one.

### 7. The embed handshake does not match the contract.
`{sws:'ready'}` was posted once at parse time and only when `?embed=1` was present.
`incoming/PORTAL-CONTRACT.md` requires it at parse AND on the `load` event, and the framed test
should be a try/catch on `window.parent`, not a query string the portal does not add.

### The shared feedback fab hides itself for the first 20 seconds. (fleet level)
Measured, not read: on a fresh load the fab mounts at its home spot and then fades to
`opacity:0` with `pointer-events:none` within a few seconds, and only comes back at about 26
seconds when `feedback.js` hits its own 20 second ceiling and forces itself home. The cause is
in the shared file, not in this game: every screen here is a full bleed div containing buttons,
which trips the watcher's "this is a cover with real content under it" rule, so it goes looking
for an empty spot to park in, finds none on a full screen layout, and yields.

Two things follow. It is not a tap stealer while it is hidden, because the same rule that hides
it also sets `pointer-events:none`, so this is a visibility problem and not a correctness one.
And it makes the parking work above matter MORE, not less: the place it returns to after the
ceiling is its home, which is exactly the footprint that had to be cleared of controls. The
gate asserts the whole invariant now, so a fab that quietly faded can never make the collision
test pass for the wrong reason. Fixing the fade itself belongs in `/feedback.js`, which is
outside this audit's sandbox.

## CHECKED AND CLEAN

- **Exit (standing class 1).** `SWS_EXIT` already had the `document.referrer` fallback and the
  ⌂ button calls it. Verified it fires.
- **Dashes in player copy (class 7).** None.
- **Drawing itself.** Pointer events with a touch and mouse fallback for old tablets, a
  debounced encoder so a stroke never blocks on a megabyte of JSON, `saveNow()` on `pagehide`
  and on `visibilitychange`. That part is careful work and I left it alone.
- The daily starter is deterministic from the date and the confirm before it erases is honest.
- Voice takes already fail honestly when they are too big to store.

## FIXES APPLIED

1. **Storage failure is now loud, honest and recoverable.** `save()` reports success. On a
   quota failure a red bar appears across the top of the page and stays there: it says that
   nothing new is being kept and offers **Export now** and **Make room**. Make room never throws
   away a drawing, it clears the recorded voice takes, which are base64 audio competing for the
   same quota, and then retries the save and reports honestly if there is still no room. The bar
   does not time out, and it clears itself the moment a save succeeds again. The old sentence,
   which claimed older pages might not save, is gone. There is also an early warning at 3.5MB,
   before anything has failed.
2. **`load()` validates.** `pages` must be an array whose entries are null or a `data:` string,
   `cur` is clamped into range, `fpsIdx` and `onion` are type checked, and `RECENTS` must be an
   array of `#rrggbb` strings. A corrupt save now costs a book, not the app.
3. **Export tells the truth about what it made.** The blob takes the recorder's real mimeType
   and the download extension follows it, so an iPad gets `flipbook.mp4`. A 20 second watchdog
   clears the EXPORTING chip and says so if the recorder never stops.
4. **Two tabs no longer clobber.** A `storage` listener notices another tab writing `fb_book`,
   stops this tab from auto-saving over it, and shows the bar with the choice: keep this one, or
   load theirs. Nothing is silently overwritten either way.
5. **Swatches and recents are 70 CSS px (48.6 rendered)** and the shade slider is 70 wide.
6. **The fab parks top right**, which measures clear of every tool row in all three menus and
   costs a 22px sliver of paper instead of the bottom corner where a hand rests. It does cover
   the small page counter in the topbar, so the page number now also reads out in the big hint
   line at the bottom. The player can still drag it, and a spot they choose wins.
7. `{sws:'ready'}` now posts at parse and on `load`, with the canonical try/catch framed test.

## VERIFICATION

`node satellites/flipbook/check.mjs` — 38 assertions, all green, exits 1 on failure. Watched red
first, and it earned its keep: the first green run of the export test returned a 110 byte file,
which turned out to be a two page book at 8fps being a quarter of a second long. The test now
records a realistic eight page book at 4fps and asserts real bytes, which is what a child would
actually make.

Phase A compiles all three inline blocks. Phase B drives a real headless browser at 375x667:
draw three pages and reload and check the ink is still on the canvas, four corrupt saves, a real
localStorage quota fill plus an injected quota throw to drive the failure path, a genuine second
tab in the same browser context writing the same key, an export with bytes and the right label,
every control's rendered size across all three tool menus with the palette open, the fab's
footprint against every tool row and against the paper, and a dash scan.

## STILL WORRIES ME

- The book still lives in localStorage. The right home for a 100 page book is IndexedDB, which
  would raise the ceiling by orders of magnitude and stop the synchronous write entirely. That
  is a bigger change than an audit pass should make, and it is the single most valuable thing
  left to do here.
- Export is a real time recording: a 100 page book at 4fps takes 25 seconds of wall clock with
  the chip up. It is honest, but it is slow, and there is no cancel.
- Voice takes are stored as base64 data URLs in localStorage, which competes with the book for
  the same quota.
