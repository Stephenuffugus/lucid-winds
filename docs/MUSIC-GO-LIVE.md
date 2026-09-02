# Getting the music live: exactly what happens, and who does each step

Written 2026-09-02 by Fable for Stephen. The build is done and gated; nothing plays until the audio files are on the host,
and only you can put them there (it needs your Hostinger login). Everything else is mine.

## What you do (once, a few clicks in hPanel; chosen 2026-09-02: option B, private repo + deploy key)

The audio lives in a PRIVATE repository, `Stephenuffugus/lucid-winds-music` (Stephen: "i kind of want the only way to get
my music is through me"). Hostinger deploys it into the site's `music/` folder. After this one-time setup, every future
music drop is a push by Fable and a Deploy click (or the webhook), never an upload.

1. hpanel.hostinger.com → Websites → the lucidwinds.com site → **Manage** → left menu **Advanced → Git** (it may just say
   **Git**). You will see the existing entry for the site itself, `lucid-winds` on `main`. **Do not touch it.**
2. Click **Create a new repository** (or **Add repository**). Fill in exactly:
   - Repository: `git@github.com:Stephenuffugus/lucid-winds-music.git`
   - Branch: `main`
   - Directory (install path): `music`
3. Because the repo is private, the page shows an **SSH key** (a long line starting `ssh-rsa` or `ssh-ed25519`). Copy the
   whole line and paste it to Fable in the chat. It is a PUBLIC key; sharing it is safe. Fable attaches it to the repo.
4. Once Fable says the key is attached, click **Deploy** on the new entry. Tell Fable.
5. Optional, so future drops need no click at all: the entry has an **Auto deployment** toggle that reveals a **webhook
   URL**. Paste that URL to Fable too; it goes on the repo's GitHub webhooks and every push deploys itself.

If the form has no Directory field, or Hostinger will not add a second repository to the site, tell Fable; the fallback is
the manual zip upload from the vault (`vault-music-20260902`, `music-v1-20260902.zip`, upload beside `index.html`, Extract).

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
- **New songs**: drop a zip in `_music-drop/` the same way; `node scripts/music_intake.mjs`; `node scripts/music_manifest.mjs`; `node scripts/music_web_tier.mjs`; Fable commits the new `v1/` tree to `lucid-winds-music` and pushes; Hostinger deploys it (webhook, or one Deploy click); verify; deploy the catalog. Anything unmapped is listed in `docs/music-unmapped.md` and never guessed.
- **Rename a shelf**: `music-families.json` → `name`. **Move a folder**: `music-folder-aliases.json`, in your words.
