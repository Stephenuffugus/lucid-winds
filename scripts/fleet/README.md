# scripts/fleet — the fleet art audit and its probes (Sep 04–05 2026)

Moved out of a session scratchpad so they survive. Every script starts its own static server on
127.0.0.1 from the repo root and drives headless Chrome (puppeteer from the repo's node_modules).
None of them touch the tree; they measure and screenshot into a directory you pass or the cwd.

## The audit pipeline (Opus, Sep 04): all 186 carded games shot and looked at
- `shootv2.mjs` — boot + play capture at 375x667 with `localStorage.sws_dev_ok=1` (the 27 dev
  gated games), elementFromPoint containment before every tap, a nav-away guard, and
  `#shell-dir` overlay detection. ⛔ `innerText` reads the game UNDER an overlay.
- `collect.mjs`, `render.mjs`, `batches.mjs`, `assemble.mjs`, `build_page.mjs` — the per game
  look schema, the batches, and the assembly into `FLEET-ART-AUDIT-SEP04.md`,
  `FLEET-ART-DETAIL-{SATELLITES,NATIVES}.md`, `FLEET-ART-FACTS-SEP04.md` and the tickable artifact.
  ⛔ prose fields cannot be counted with a regex; the counts in FACTS are the measured ones.
- `wf-look.js` / `wf-verify.js` (if present) — the per game look and the adversarial refute prompts.

## The measurement probes (Fable, Sep 04–05), each the evidence behind a §3 row in HANDOFF-ART-FLEET.md
- `bebas_ab.mjs` — does Bebas Neue actually load: measure a rendered width against sans-serif.
  ⛔ `document.fonts.check()` says true either way.
- `overflowcheck.mjs`, `stickyprobe.mjs` — JOB 10: the html/body overflow-x un-clamp, sticky
  headers, and which boards scroll sideways.
- `hdrprobe3.mjs` — JOB 4: header overflow at 320/360/375/390 WITH the SDK's "(+8 pending)" chip
  rendered the way the shell renders it (innerHTML with the `.sb-pend-word` span), how-to sheet
  seeded closed, a header crop per width. `hdrkids2.mjs` lists every header child's rect and the
  music button's inline style (that is how the 96px attract pill was found).
- `chipprobe.mjs` — JOB 3: where the ♫ chip lands at 1.3 s and 4.5 s and after the first tap into
  play, and what is under it. ⛔ the "under" name is a container from elementsFromPoint, not what
  is visible; the screenshot decides.
- `pollenprobe.mjs` — JOB 6: Queen Bee's art requests and bytes for a twelve card board (20.2 MB
  before, 0.5 MB after), through the seats sheet (BEGIN), the game's own rules modal (CLOSE) and
  the inspect view (evaluate the card's onclick).
- `slotprobe.mjs` — JOB 5: malformed `art-slots/enemy-{id}.png` style requests in Glyph Forge and
  Tarot Run (0 after).
- `sidescroll.mjs` — JOB 10's nine boards: `scrollWidth - innerWidth` and the widest element past
  the right edge, boot and first play frame, 375 and 320. Reads 0 everywhere on this tree.
- `thumbshoot.mjs` — JOB 7: a 400px portal card from the play frame, the board element clipped
  exactly (`PAD=0`), the largest square descendant for tall boards (`INNER=1`), a few taps first for
  Four in a Row. ⛔ label every contact sheet tile; an unlabelled sheet is read in the wrong order.
- `satshoot.mjs` — the satellite version; Sprout Dice, Rootbound and Twin Lanterns each need their
  own three taps written into `EXTRA` before it reaches a play frame.
- `chipprobe_diag.mjs` — the same, plus `window.SWSMusic.corners()` (every candidate corner with its
  score) and `.reseat()`; this is how the canvas cases were understood. ⛔ the "under" name lists only
  the top two elements of the stack; a canvas three deep still scores.
- `shot.mjs` — one screenshot from where the player stands: how-to sheet seeded closed, music card
  dismissed, an optional start tap by regex. `shot_tap.mjs` adds `TAP_CELLS=1` for a filled Nonogram.

