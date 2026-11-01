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

## Rounds 2 and 3 (ART3, 31 Oct and 1 Nov)

Astra's rounds 2 and 3 are deltas over round 1, merged by sprite key: a later round's entry replaces the key whole, and every other round 1 key stays (Q98). Both were checked whole (`astra_cut.py check`: CHECK OK, round 2 20 sprites and 74 frames, round 3 18 sprites and 119 frames) with round 1's dust_mote (a one file subset, CHECK OK). The checked cut of every key, drawn or not, is `docs/astra/cut-art3.json` (39 keys, 197 frames). It is the cutter's own `--sprites` shape with four more fields per key (`round`, `fps`, `anchor`, `sha256`) and a `status` of spliced or parked.

To splice a parked key, copy its entry into a JSON of its own and run `python3 -I tools/astra_cut.py splice <that.json> index.html` (the dry run first). The page holds at most 42 names (MAX_SPRITES 43, the lint and H-spr-1 the same), so a lane that adds keys raises the cap in all three places, its bytes counted in PROGRESS.

Spliced and drawn in ART3: icon_weapons (J1 to C8, jump, dive, charm, looked up by code), the five keylined elites, the 10x10 speck, the crusher with its shaft rule, stick_pad, stick_knob, stick_hint, pause_glyph, dust_mote, frost_mote, bubble, spore, ember_mote and icon_biomes. Spliced and not drawn yet: fx_skyhook, for weapons step 2's J8.

## WAITING

Each parked key with Astra's placement, word for word where her NOTES give one. All are in `docs/astra/cut-art3.json`, checked; none is on the page.

### The levels lane's auto crop

- `crop_floor_band`, `crop_ceiling_band` (round 2, 8x8, one frame `tile`): a seamless diagonal Ink hatch, 12.5% pixel coverage, binary alpha (coverage means spatial coverage, never fractional alpha); each tile repeats seamlessly; the runtime chooses the band's height.
- `crop_seek` (round 3, 16x16, `seek_0` to `seek_3`, 6 fps, loops): "Loop crop_seek at 6 fps while the crop moves. Its diamond and trailing dots follow an open path." Loop until the game accepts a crop.

### House slice 1 (the house run)

- `run_pips` (round 3, 10x10, `todo here cleared boss_todo boss_here boss_cleared`): "Draw five run_pips at 2x. Rooms 1 through 4 use a hollow square for todo, a bright diamond for here and a check for cleared. Room 5 uses the corresponding crown."
- `icon_house` (round 3, 24x24, `house house_cleared`): "Use the house button on the title and its checked seal on clear."
- `card_house_clear` (round 3, 144x140, `base`): "draw the unlocked cosmetic in the 48x56 Paper opening at (48,33). A frame style fits at native size. A hero idle pose fits at 3x, centered at (72,61)." "Draw the reward name in the 98x14 caption area at (23,100). All positions are native card pixels measured from the upper left." Its manifest's content slots: cosmetic [48, 33, 48, 56], caption [23, 100, 98, 14], reveal [48, 37, 48, 48]. Draw the prize, then the reveal, then the localized caption.
- `fx_unlock` (round 3, 48x48, `unlock_0` to `unlock_5`, 12 fps, once): "Overlay fx_unlock at (48,37) for six frames, then hide it." Blue ribbons and an Amber seal part outward above the prize.
- `hero_colours_r3` (round 3, 12x16, 48 frames, `<skin>_<pose>`): Pinstripe, Domino, Crescent and Argyle, in that order, each with all 12 poses of the approved round rear hero. "Select frame 12 x skin index + original pose index. Keep the original pose timing and right-facing, bottom-center anchor. Register the four IDs in the house-clear cosmetic reward pool alongside the previous eight cosmetics. Reward order is a game-side choice."

### House slice 1's clay boss

- `fx_boss_wake` (round 3, 48x48, `wake_0` to `wake_3`, 12 fps): "After the two-second outline, center fx_boss_wake on the waking body."
- `fx_boss_chip` (round 3, 16x16, `chip_0` to `chip_3`, 12 fps): "Center one fx_boss_chip on each detached cell."
- `fx_boss_down` (round 3, 64x64, `down_0` to `down_5`, 12 fps): "Center fx_boss_down on the last cell", then hide.
- `fx_beacon_light` (round 3, 16x16, `light_0` to `light_3`, 12 fps, anchor top, carries the beacon's Sun): "Play fx_beacon_light at the lamp's top anchor and hand over to the regular beacon loop. Its first and last frames match the existing dark lamp and lit frame a pixel for pixel." Draw it in place of the lamp; resume the beacon's loop at a.

### Stats (weapons step 5)

- `fx_stat_up` (round 3, 32x32, `stat_up_0` to `stat_up_3`, 12 fps): "Center fx_stat_up over the hero and draw the selected stat icon within its clear 12x12 middle" (the local rect [10,10,12,12] stays transparent throughout).
- `hud_heart_new` (round 3, 9x8, `new_0` to `new_3`, 12 fps): "When a third scroll awards a heart, play hud_heart_new in the new HUD slot. It fills from the existing empty frame to the existing full frame."

### Charms (weapons step 4)

Round 2: each 32x32, four frames at 12 fps. "Play once and remove after frame 3, unless the event remains active and the game deliberately restarts it. Position the hero center at local (16,16)."

- `fx_magnet`: play while loot is drawn in; the motes converge toward the centre.
- `fx_second_wind`: play once when a free death is spent; a rising arrow and an expanding ring.
- `fx_thick_skin`: play once on the absorbed first room hit; a hollow shell leaves the hero visible.
- `fx_tripod`: "Tripod dust assumes the wall is at x=26 on the right. Mirror that effect for a left wall."

### Optional

- `tab_biome` (round 3, 16x5, a frame a biome, repeats along x): an optional film tab variant per biome; only the centred five pixel trim at the bottom changes, the perforations and the cream deck are the existing tab's. Stephen's call (Q162).
- `hero_bold` (round 2, 12x16, `idle0 run0`): a fuller rear inside the 12x16 box for comparison only; the approved round 1 hero stays the default. Stephen's call.
