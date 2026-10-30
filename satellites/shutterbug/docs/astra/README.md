# Shutterbug and Astra

The brief: the Claude Doc "Shutterbug: every asset, and the brief for Astra" (https://claude.ai/artifact/FVAL9ck4gWYhHyahVP3qs6), copied to Drive at 012Assets/Astra/Shutterbug on 30 Oct 2026.

## Files

- `ASTRA-SHUTTERBUG-OCT30-PROMPT.txt` is the prompt Astra reads, byte for byte the doc's prompt block (sha256 of the block `bc8a5d9c...`). Drive holds the same file, checked by hash after upload. Paste or attach this one.
- `ASTRA-SHUTTERBUG-ASSETS-OCT30.html` holds sections 1 to 9 of the doc and its 79 open questions, for Stephen. Drive holds it as the Google Doc ASTRA-SHUTTERBUG-ASSETS-OCT30, with every text run present but the two code blocks' indentation lost.
- Google's HTML conversion drops leading spaces. The first Google Doc of the prompt lost the helper's indentation and is renamed in Drive "ASTRA-SHUTTERBUG-OCT30 (BROKEN COPY: indentation lost, do not paste)". The prompt's Google Doc is made from the text file instead (plain text conversion).

## Taking Astra's zip in (the brief's section 9)

1. Stephen uploads the checkpoint or the delivery zip to `/workspaces/lucid-winds/assets/` (zips there are git ignored).
2. `python3 -I satellites/shutterbug/tools/astra_cut.py intake assets/<zip>` extracts it into a new empty folder under `/tmp/claude-1000/shutterbug-astra/`. It refuses absolute paths, `..`, links and anything over the size caps before a byte is written. Nothing inside the zip is run.
3. Vault the originals before any cut. Make a sha256 per file, then run `env -u GITHUB_TOKEN -u GH_TOKEN gh release create vault-<yyyymmdd>-shutterbug-astra-<nn> -R Stephenuffugus/lucid-winds-vault --title "Shutterbug: Astra's checkpoint <nn>" --notes-file notes.md <zip> SHA256SUMS.txt`. Download one file back and compare its sha256 (HANDOFF-FABLE-OCT25.md section 1).
4. `python3 -I satellites/shutterbug/tools/astra_cut.py check /tmp/claude-1000/shutterbug-astra/<zip stem> --sprites /tmp/claude-1000/shutterbug-astra/cut.json` verifies every file, then cuts it. The checks:
   - the sha256 matches the manifest
   - the PNG is 8 bit RGBA, frames times w by h
   - alpha is 0 or 255
   - every opaque pixel is one of the page's 16 hexes
   - the PNG equals its source grid
   - every hero frame has Ink in its feet row
   - Sun appears only in the hero and the beacon
   - a known key keeps its size and frame names
   
   Refusals and warnings print as a plain list. Anything refused goes back to Stephen for Astra's next session.
5. `node satellites/shutterbug/tools/astra-preview.mjs /tmp/claude-1000/shutterbug-astra/cut.json <outdir>` makes the hero review shots. It splices the cut into a copy of the page and shoots the hero standing, running, rising and fallen at 412x915 and 360x780, plus contact sheets at 8x. Stephen sees these before he writes APPROVED.
6. After APPROVED, `python3 -I satellites/shutterbug/tools/astra_cut.py splice /tmp/claude-1000/shutterbug-astra/cut.json satellites/shutterbug/index.html --out satellites/shutterbug/index.html` writes the frames into SPRITES. Existing keys keep their comments, and new keys (the elites, hud_heart) are appended. Then wire what the cut's warnings name (R.draw for new keys and for frames past two), rerun `node tools/icons.mjs` for the hero, and prove it with the lint, H-spr-1, the sprites gate and the shots.

The gate `astra` (test/astra.mjs) proves the cutter on a fixture made from the page's own sprites. The round trip and splice are exact, and every broken zip is refused for its own reason.
