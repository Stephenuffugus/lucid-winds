# Put Glyph Forge on your Hostinger site (5 minutes)

This folder is the **entire game**. It's pure static files — no database, no
backend, no Node. It runs on any web host.

## What's in here
- `index.html` — the whole game (single file)
- `manifest.json` — makes it installable as an app on phones
- `sw.js` — offline support (works without internet after first load)
- `art-slots/` — empty for now; art drops in here later (game looks intentional
  without it — styled glyph placeholders, not broken boxes)

## Upload steps (hPanel File Manager — easiest)

1. Log in to Hostinger → **hPanel** → your domain → **File Manager**.
2. Decide where it lives:
   - **Whole site is the game:** open `public_html`. Delete or move any
     existing `index.html` placeholder Hostinger put there.
   - **Game in a subfolder** (e.g. `yoursite.com/forge`): inside
     `public_html`, create a folder `forge` and open it.
3. **Upload** every file from this folder into that location, keeping the
   `art-slots` folder as a folder (use the File Manager's "Upload" button; if
   it's easier, upload the `.zip` and use File Manager → right-click →
   **Extract**).
4. Make sure **SSL is on** (hPanel → Security → SSL — Hostinger gives it free,
   may take a few minutes to issue). The offline/installable features need
   `https://`.
5. Visit `https://yourdomain.com/` (or `/forge/`). Tap **Begin Inscription**.

That's it. Paths are all relative, so root or subfolder both work.

## Updating it later
When I hand you a new build, just re-upload `index.html` over the old one. If
you don't see changes, hard-refresh (or in the game there's nothing to clear —
the service worker fetches fresh HTML network-first).

## FTP instead?
hPanel → Files → **FTP Accounts** for host/user/pass. Drop the same files into
`public_html` (or your subfolder) with any FTP client (FileZilla). Same result.

## Phone test
Open the URL on your phone → browser menu → **Add to Home Screen**. It launches
fullscreen like a native app and works offline.
