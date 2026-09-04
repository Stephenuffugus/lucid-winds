# HANDOFF — the fleet art pass
**Written Sep 04 2026 by Opus, for Fable, mid-session. Everything below is on disk and UNCOMMITTED.**

## SESSION STATE — the next action

1. **Three Director calls are OPEN.** They are listed in §5. Do not guess them.
2. **Nothing is committed.** Fable is in the same tree, so `git add` **fenced paths only,
   never `-A`**, and `git pull --rebase` first (memory: `feedback` tandem rule).
3. If you want to just keep building: render the next piece set
   (`blender -b --factory-startup -P tools/pieces/rig.py -- --set discs`), then
   `python3 tools/pieces/cut.py --set discs`. ~2.5 min per piece on these 2 cores.

---

## 1. What this is

Stephen: *"start looking over a lot of the old games. a bunch of them could do with a lot more
graphics, backrounds, and css. make a massive list of everything for us to work from then we will
go through it improving all of the games."* Then, later: *"whats the move? we also have meshy to
make 3D assets now."*

So there are two halves: **the audit** (done) and **the fixes** (started).

---

## 2. The audit — DONE, 186/186 games

Every carded game launched at 375x667, photographed 3x (boot, in play, a few seconds on), and
**every frame opened and read**. 558 shots, 555 with real content.

- `FLEET-ART-AUDIT-SEP04.md` — master: method, **10 cross-cutting jobs**, all 186 ranked, art batches, "checked and fine"
- `FLEET-ART-DETAIL-SATELLITES.md` / `FLEET-ART-DETAIL-NATIVES.md` — the per-game working list
- `FLEET-ART-FACTS-SEP04.md` — every structural measurement **with the command that re-derives it**
- Browsable, filterable, tickable (db-backed shared ticks):
  https://claude.ai/code/artifact/d1dd7447-0b05-4cae-8bfc-d6f85f1a9d09

**Result: 7 poor · 80 plain · 75 decent · 24 strong. 747 art files and 900 CSS jobs named.**
Every "looks broken" claim went to a second agent whose only job was to refute it:
**54 confirmed, 13 refuted, 0 unchecked.**

The whole rebuild pipeline lives in the session scratchpad and is re-runnable:
`shootv2.mjs` → `metrics*.mjs` → `build_bundle.mjs` → `wf-look.js`/`wf-verify.js` →
`collect.mjs` → `render.mjs`/`batches.mjs`/`assemble.mjs`/`build_page.mjs`.

---

## 3. Shipped this session — 4 fixes, each MEASURED (uncommitted)

| fix | file | measured before → after |
|---|---|---|
| **Bebas Neue now loads** | `play/shell.css:7` | Sprout ENTER key **6px overflow → 5.3px clearance** each side |
| **Per-game backdrop hook** | `play/shell.js` `init()` | file present → applies with scrim; absent → old gradient untouched |
| **`overflow-x` un-clamped** | `play/shell.css` | sticky header **0/45 → 45/45**; 9 of 66 now sidescroll |
| **Meshy double-spend** | `satellites/ripcord/tools/forge3d/meshy_api.py` | kill+rerun **2 POSTs → 1** |

### Detail worth keeping

- **Bebas.** `shared.css` styles 183 rules in it and 38 files under `games/` ask for it, but only
  `index.html`/`wild.html` loaded it. All 66 natives fell back to a wider system sans, so labels
  sized for a condensed face clipped. Some "clipped label" findings in the detail docs are THIS
  and will now be gone — **recheck before hand-fixing any of them.**
- **Backdrop.** Drop `/assets/games/bg/<id>.jpg` and that game has a backdrop. Folder exists, empty.
  Costs one 404 per game with no backdrop; a generated `index.json` manifest would remove that if
  Stephen dislikes it.
- **Overflow.** The clamp did not prevent bugs, it **concealed** them. The 9 now-sidescrolling
  boards are a precise worklist: doubleshutter **108px** · petalfall 79 · farkle 71 · reversi 34 ·
  wordsearch **16** · stopten 10 · merge 7 · backgammon 5 · c4 4. Shut the Box and Word Search
  were already independently confirmed as having **untappable** content, so they are real bugs
  either way. Four are <10px.
- **Meshy.** Credits are spent at the POST; the task id lived only in a local var and the sole
  rerun guard was "is the .glb on disk" — false in exactly the kill case. Now `meshy-tasks.json`
  is written **and fsync'd** before polling; a rerun RESUMES; success clears it; FAILED clears it;
  a 20-min timeout KEEPS it. Guard: `python3 tools/forge3d/test_no_double_spend.py` — spends
  nothing, and was verified **both ways** (pre-fix file → 2 POSTs and no ledger; fixed → 1).

---

## 4. The 3D lane — `tools/pieces/`

**⚖️ The call I made: Meshy balance is 2640 credits and I spent ZERO.** Meshy is image-to-3D and
needs a reference image per asset. A d6 is a rounded cube with recessed pips — Blender makes it
exactly, free, with the pip COUNT right rather than approximately right. **Spend the credits on
organic/ornate shapes that are expensive to model by hand** (creature pawns, carved tokens,
sculpted showpieces). Both routes render through the same rig so they still match.
⛔ `forge3d` is **NOT** Meshy — it is Blender procedural (that is the 366 glbs in the repo).
Meshy is only `meshy_api.py`.

- **`tools/pieces/rig.py`** — ONE locked ortho camera + fixed 3-point light + one material set +
  512px transparent PNG, so anything through it looks photographed on the same shelf.
  `--list` for sets; `--set dice`. Sets: dice, discs, rings, stones, tiles.
- **`tools/pieces/cut.py`** — masters → `out/<set>/ship/` at 128px.
  Dice: **1940KB → 81KB, 96% smaller, 16KB per sprite**, and the pips still read at 48px.
  ⛔ **Wire games to `ship/` ONLY.** Shipping masters is precisely the Queen Bee bug this audit
  found (`games/pollen.js` loads 101 PNGs at 1024x1024, 1.5-2MB each). Do not recreate it.

**Done: the dice set (5 pieces), validated at 48px board size.**
**Caveat on record: the dark die loses its silhouette on a near-black ground at 48px — it is a
light-surface variant only.**

### Which games the five sets actually serve — 18, counted by identity
| set | games |
|---|---|
| dice | Yacht-Sea, Farkle, **Shut the Box (poor)**, Backgammon, Sprout Dice, Snakes & Ladders |
| discs | Four in a Row, **Checkers**, **Reversi**, **Mancala**, Lights Out |
| rings | Tower of Hanoi, **Sunforge** |
| stones | **Stone Garden**, **Go (Living Stones)** |
| tiles | **Mosaic Garden**, **Garden Lines**, ~~Jade Garden~~ (already strong, skip it) |

**bold = currently plain or poor.** 74 art asks across the 18.
⛔ An earlier regex said "148 games" — it was matching prose (`disc` in "discovered", `ring` in
"during"). 18 is the counted number. See §6.

---

## 5. ⚖️ OPEN — Director calls, do not guess

1. **The 9 sidescrolling boards.** ✅ **Fable, Sep 04 pm: the two with untappable content are FIXED
   and measured** (Stephen said "get to work", and these were bugs, not a call):
   - Shut the Box: `shared.css` `.ds-row` goes to five columns under 480px. Measured at 320 and 375:
     **18 of 18 tiles on screen at exactly the 48px floor, sidescroll 0** (was 108px over, tiles 8-9
     off screen so the game could not be finished).
   - Word Search: `shared.css` `.wc` drops its 36px floor under 480px. Measured: **100 of 100 cells
     on screen, 33px at 375 / 28px at 320, sidescroll 0** (was 16px over, 10th column unreachable
     with words placed in it). Drag-select board, so cell size is not a tap target.
   The other seven (petalfall 79, farkle 71, reversi 34, stopten 10, merge 7, backgammon 5, c4 4)
   are still open and are per-game CSS in `FLEET-ART-DETAIL-NATIVES.md`.
2. **Commit?** Nothing is committed. Fenced paths would be: `play/`, `tools/pieces/`,
   `satellites/ripcord/tools/forge3d/`, and the four `FLEET-ART-*.md`.
3. **Which piece set next?** My recommendation was **discs** (5 games, 3 currently plain),
   then stones (both plain).

---

## 6. ⛔ TRAPS — every one of these cost real time today

**Capture / measurement**
- `?dev=1` does **NOT** open the 27 workbench-gated games. `localStorage.sws_dev_ok='1'` does.
  Without it all 27 photograph as the same "IN DEVELOPMENT" card.
- **`body.innerText` reads the game UNDERNEATH an overlay.** A how-to modal appended at the end of
  body left the first 500 chars showing the game. Detect the overlay ELEMENT (`#shell-dir`).
- A blind centre-tap + Escape navigated 7 games OUT to the arcade portal. Guard on the URL.
- "How to play" matches `/play/` — the advancer kept opening the instructions it was skipping.
- ⛔⛔ **`pkill -f "[s]hoot_all.mjs"` killed MY OWN SHELL** — the shell's argv contained the literal
  string. The bracket trick does not save you. **Kill by PID.**
- Music `/music/v1/*.mp3` 404s in local capture are expected — audio is not in git.
- `scripts/catalog.mjs` builds every native URL as `/play/<id>.html` and ignores GAMES row field 5,
  so **Pom Pond (external) looks like a missing file**. `portal/catalog-tags.json` inherited the
  same wrong URL, and a verifier reading only that called it a blocker. Check the source row.

**Reasoning**
- ⭐⭐ **A state-dependent bug reads GREEN on a fresh probe.** The header clip only happens once the
  wallet has a pending chip; a clean-browser probe said 0/12 fine. It had even been "fixed" once
  before, tuned on the empty-wallet state. → `feedback_state_dependent_bug_reads_green`
- ⭐⭐ **You cannot count a free-text field.** A prefix regex produced "126 of 126 games have a
  readability fault". Count something MEASURED instead, and say so.
  → `feedback_prose_fields_cannot_be_counted`
- I called the natives' empty lower third a margin bug; measured, the gap is **6px**. It is
  composition, not CSS. Do not go hunting for a margin.

**Blender**
- ⭐⭐ **sRGB fed in as LINEAR.** A CSS hex is sRGB, `Base Color` wants linear. House sage #7ab356 is
  sRGB(.478,.702,.337) but linear(**.194,.451,.093**) — 2.5-3.6x too bright. Everything rendered
  pastel and I first misdiagnosed it as the key light. `srgb()` in rig.py converts.
- Pips were flattened on **world Z for every face**, so the four side faces had pips bulging out.
  Flatten along the face's own normal.
- This Blender is **built without OpenImageDenoiser** — `use_denoising=True` hard-errors. Buy the
  clean image with samples (160).
- Cream pips on a sage die read as **icing blobs** and the count was unreadable at sprite size.
  Dark, recessed pips.

---

## 7. The standard this work is held to

From CLAUDE.md, and it is the reason four of the bugs above were caught at all:

> **LOOKING IS PART OF THE JOB.** A visual change is NOT done until you have LOOKED at it.
> SHOOT IT. READ THE IMAGE. Name three things wrong in it before Stephen does. Report what you
> SAW, not what you wired. A green test is not a look.

Every render in this session was opened and judged. The first dice pass passed every automated
check and was wrong in three ways that only the picture showed.
