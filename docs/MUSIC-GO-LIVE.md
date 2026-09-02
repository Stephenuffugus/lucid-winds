# Getting the music live: exactly what happens, and who does each step

Written 2026-09-02 by Fable for Stephen. The build is done and gated; nothing plays until the audio files are on the host,
and only you can put them there (it needs your Hostinger login). Everything else is mine.

## What you do (once, about ten minutes)

1. **Download the upload zip** from the vault release:
   https://github.com/Stephenuffugus/lucid-winds-vault/releases/tag/vault-music-20260902
   The file is `music-v1-20260902.zip` (about 224 MB). Save it anywhere on your computer.
2. **Open Hostinger**: hpanel.hostinger.com → Websites → the lucidwinds.com site → **Manage** → in the left menu, **Files → File Manager**.
3. In File Manager, open the folder that holds the site. It is the one containing `index.html`, `portal`, `satellites`, `sw.js` (normally `public_html`). Stay at that top level; do not open a subfolder.
4. Click **Upload** (top right), choose `music-v1-20260902.zip`, wait for it to finish. Large upload; a couple of minutes is normal.
5. **Right-click the zip → Extract.** When it asks where, leave the destination as the same folder and confirm. You should now see a new folder called `music` beside `index.html`, and inside it `v1`, and inside that folders like `deepwell`, `card-table`, and a file `PROBE.txt`.
6. Delete the zip from the server if you like (it is not needed once extracted).
7. Tell me: **"music is on the host."** Nothing else.

If step 5 offers no Extract, tell me; the fallback is uploading the `music` folder itself, which is slower but the same result.

## What I do after that (you do nothing)

1. `curl -sI https://lucidwinds.com/music/v1/PROBE.txt` → must be 200. Proves the files are where the site serves from.
2. Push the branch to main. This deploys the music build (idle, `live:false`) and your Sep 1 Tangent pass.
3. `curl` the probe again after the deploy. If it is still 200, the host keeps files that are not in git, and we are done with the question.
   If it is gone, the deploy wiped it: I tell you, and we host the audio on one of your other two Hostinger sites instead (one constant changes, nothing else).
4. `node scripts/music_verify.mjs --catalog music-catalog.js --base https://lucidwinds.com --local /tmp/music-web` → 144/144, every URL answering with audio of the right length.
5. `node scripts/music_manifest.mjs --live` → `live:true`. Add the two Midnight Greenhouse lines to `music-tracks.js` Originals and bump the three stamps that load it. Commit. Push to main.
6. Grep the live HTML for the new stamp (a 200 is not evidence). Open three games on my phone view: a song should be granted on opening and appear in the studio player under the game's shelf.
7. Tell you what I saw.

## After it is live: how you tune it, how you add music

- **Unlock balance**: edit `music-ladder.json` (four numbers), then `node scripts/music_manifest.mjs`, commit, deploy. No code changes.
- **New songs**: drop a zip in `_music-drop/` the same way; `node scripts/music_intake.mjs`; `node scripts/music_manifest.mjs`; `node scripts/music_web_tier.mjs`; upload the new `music` zip the same way (only new files are new; existing ids never change); verify; deploy. Anything unmapped is listed in `docs/music-unmapped.md` and never guessed.
- **Rename a shelf**: `music-families.json` → `name`. **Move a folder**: `music-folder-aliases.json`, in your words.
