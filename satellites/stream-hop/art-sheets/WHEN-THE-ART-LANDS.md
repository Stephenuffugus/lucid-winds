# When the art lands — wiring checklist

Stephen is away painting. This is exactly what to do when frames arrive, so nothing gets guessed at.

## 0. Before anything

```bash
cd satellites/stream-hop
python3 scripts/frame_audit.py          # current truth: who has what
```

It hashes the files, so it also catches placeholders — four files that are secretly the same
painting show as `ONE PAINTING ONLY`. As of this handoff: **1 of 29 complete, 410 outstanding.**

## 1. Cut the sheet

⛔ **Never an even grid.** Use the artist's divider lines where they exist, otherwise connected
components, and then *look at every sprite on a contrasting background*. A count-match is not proof
— this studio has shipped a car sliced in half and an orca frame showing a pigeon.

Existing cutters to copy from: `scripts/cut_jimothy2.py`, `scripts/cut_jimothy.py` (repo root
`scripts/`). Magenta knockout, then check each frame individually.

Per-character crop hazards are written into each character's sheet notes — wing spreads that run
1.8× wider than idle, props that trail out of frame, bodies that lie down and need bottom-anchoring
on the side rather than the feet.

## 2. Drop the files

`assets/<sheet>/<name>.png` where `<sheet>` is the character's `sheet:` field in `CHARS`
(`chars/crow`, `skins/deckhand`, …) and `<name>` is one of the eighteen canonical frame names.

⛔ **Swap the whole folder at once.** Never mix new frames with old ones from a different session —
that is the failure mode section 3b of the Bible exists to prevent. Keep the old folder until the
new sheet is cut and checked, then replace it wholesale.

## 3. Two code changes, then it just works

**a) Mark the character as fully animated.** In `CHARS` (index.html, ~line 694), add `full:1` to
that character's entry. Without it, `heroPose` keeps folding every extended pose onto the four hop
frames via `POSE4` and the new paintings are never requested.

**b) Nothing else.** `drawStandInFx` only runs when `G._folded` is true, so the stand-in fakes
switch themselves off for that character automatically the moment `full:1` is set.

If a character has some of the eighteen but not all, leave `full` off — the stand-ins are better
than a missing sprite (which drops to the procedural blob).

## 4. Bump the cache, or players keep the old art

```
index.html   var ARTV='35'   → bump   (⛔ only needed for art changed IN PLACE, not new paths)
index.html   var SWV='20'    → bump
sw.js        var CACHE       → bump to match
```
The host edge-caches bare asset URLs and ignores no-cache. This is why `sw.js` is registered as
`sw.js?v=SWV`.

## 5. Verify before pushing

```bash
python3 -m http.server 8901              # from repo root
# then the probe — ⛔ SH_DEV only exists behind ?shtest=1
node scratchpad/jim_probe.js --shot out.png \
  "SH_DEV.own('<id>')" "SH_DEV.equip('<id>')" "SH_DEV.start('adventure',6)" "sleep:1500" \
  "SH_DEV.hurt('squish')" "sleep:300" "SH_DEV.death()"
```
Check `SH_DEV.pose()` resolves to the real frame (`folded:false`), and eyeball the held frames —
`cheer`, `ko`, `dizzy`, `splash` are on screen for 1.5–2.6 seconds under a camera move, so they are
the ones worth looking at.

Syntax-check before every commit:
```bash
python3 -c "import re,subprocess,tempfile,os;s=open('index.html').read();b=re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',s,re.S)[1];f=tempfile.NamedTemporaryFile('w',suffix='.js',delete=False);f.write(b);f.close();print(subprocess.run(['node','--check',f.name],capture_output=True,text=True))"
```

## 6. Deploy

```bash
git push origin add-sproing-jumper && git push origin add-sproing-jumper:main
```
Both branches, every time. Then verify against the LIVE url, not localhost.

---

## The specs

- **The rules + the frame set:** `ART-BIBLE-ANIMATION.md`, and Drive "Sheet 15 v2".
- **Every character, all 18 frames:** `art-sheets/animation-sheets.html`, published at
  https://claude.ai/code/artifact/d3640567-e59f-404f-b540-0eed34d5d5e5
  Plain-text copies: `art-sheets/SHEET-16..20.txt`.
- **Still open, Stephen's call:** Core 10 (6 new per character, 168 total) vs Full 18 (410) vs a
  smaller roster fully animated (~112). He had not decided when he went to paint.
- ⛔ **Sheet 14 is withdrawn** and must be deleted from 012Assets by hand — the Drive tools here
  cannot delete.
