# Cat Scanner — Handoff

**Status:** v1.0 complete and working in preview. Not deployable as-is (one blocker, below).
**Stack:** single-file vanilla HTML/CSS/JS. No build step. No dependencies except Google Fonts.
**Target:** lucidwinds.com/catscanner, GitHub Pages or Firebase Hosting.

---

## What it does

Photo of a cat → Claude vision grades it → animated trading-card reveal → name it → save as a
1080×1350 PNG → card lands in a local collection strip you can tap back into.

Six stats: CHONK, LOAF, VOID, MENACE, ZOOMIES, FLOOF.
Five rarities: ALLEY → HOUSE → SHOW → FOIL → MYTHIC. Foil intensity scales with rarity.

## Design system (don't drift from this)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#150E1D` | page ground |
| `--panel` | `#221733` | card + input surfaces |
| `--line` | `#3D2C58` | all borders |
| `--amber` | `#FFB23F` | primary action, cat-eye |
| `--jade` | `#6FE3C4` | scanner/system feedback only |
| `--bone` | `#EFE4D2` | body text |

Display face: Bricolage Grotesque 800, tight tracking, uppercase.
Data face: DM Mono, wide letter-spacing, uppercase labels.
Concept: a veterinary field unit operating at 3am. Copy stays deadpan-clinical about an animal
that is obviously ridiculous. Never cute-voiced. Never mean about the cat.

---

## THE BLOCKER — do this first

`CONFIG.ENDPOINT` posts straight to `api.anthropic.com`. That works only inside the Claude
preview, which injects auth. On a real domain the call has no key.

**Fix:** Firebase Cloud Function proxy, same pattern as the sunbeams minting function.

```js
// functions/index.js
exports.gradeCat = onRequest({ cors: ['https://lucidwinds.com'], secrets: ['ANTHROPIC_KEY'] },
  async (req, res) => {
    // 1. verify Firebase ID token from Authorization header
    // 2. rate limit per uid — 20 scans/day is generous
    // 3. reject payloads over ~1.5MB
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    res.status(r.status).send(await r.text());
  });
```

Then set `CONFIG.ENDPOINT` to the function URL and add the auth header in `callGrader()`.
Client response handling needs no other change — shape is identical.

---

## Every [TODO] in the file

1. **`CONFIG.ENDPOINT`** — the blocker above.
2. **`Store.read/write`** — in-memory. Two-line localStorage swap is written in the comment.
   Photos are data URLs and localStorage caps near 5MB, so cap the collection around 30 cards
   or push photos to Firebase Storage and keep only URLs in the record.
3. **`Hooks.onCardMinted`** — award `SUNBEAMS_BY_RARITY[rarity]`. Mint server-side inside the
   same function that grades, otherwise the client can mint MYTHICs on a loop.
4. **`Hooks.onCollectionChanged`** — friend-graph sync. Friends-only reads, no public feed.
   That constraint is a deliberate product decision, not an oversight. Don't add a public gallery.
5. **`Hooks.onCardExported`** — analytics. Export rate is the growth metric to instrument first.
6. **deviceorientation** — iOS 13+ needs `DeviceOrientationEvent.requestPermission()` on a user
   gesture. Add a "tilt to shine" button; pointer tilt already works everywhere.

## Record shape (already Firestore-ready)

```js
{ id, name, serial, scannedAt, photo, rarity, breed, coat, title, flavor,
  stats: { chonk, loaf, void, menace, zoomies, floof } }
```
Path: `users/{uid}/cats/{id}`.

---

## Known limits

- No service worker — can't be single-file. Add `sw.js` + `manifest.webmanifest` for installability.
- No offline mode. Scanning requires network by definition; the collection should still render.
- Fonts load from Google. Self-host if you want a fully offline shell.
- `validate()` clamps all model output before it touches the DOM. Keep that. If you add fields to
  the prompt, add them to `validate()` in the same commit.

## Next up, in order

1. Proxy + auth (blocker).
2. localStorage swap, then Firestore.
3. **Tune the grader.** Scan 20 cats and check the rarity spread. If MYTHIC shows up more than
   ~1 in 15, tighten the prompt — that number is the whole economy. Stats clustering at 50-80
   means the card stops feeling earned.
4. Sunbeams minting.
5. Friends layer.
6. Toy mode as a second screen in the same app — the scanned card becomes the virtual cat you
   play with. Cards already carry the stats a toy could read from.

## Deliberately not built

Public sharing feed, user photo submissions, comments, any stranger-to-stranger surface.
PNG export is the sharing mechanism — the user posts it themselves, off-platform, so there's
nothing to moderate.
