# HUNCH — Sprite-Sheet Asset List (portal skin)

Drawing-duel where you draw a prompt and a real AI "machine" guesses blind and scores you. The game is 95% procedural-by-design (canvas pad, timer ring, typographic UI, CSS-shader inks/themes) — DO NOT skin those. This doc covers ONLY the art layer that actually helps: the 5 unlockable "machine" personas (the retention hook) + the thinking-machine face + one portal/app tile.

---

## STYLE (shared — read first, applies to every sheet)

Bright, colorful, fun handmade paper-craft game art — but re-skinned for HUNCH's neon-arcade world instead of a garden. Tactile fiber-art MATERIALS kept for portal cohesion: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Subject is a cast of cute "machine mascots" — little felt-and-cut-paper robots/oracles, each one a personality the AI wears while it reads your drawing. Cozy-menacing, expressive, never scary or grim. Clean readable silhouettes first; each mascot a distinct shape + signature glow so it reads at 60px (start-screen chip) AND 160px (thinking/result screen). Soft top-down key light with a warm rim-light, plus one glowing lime "eye" or accent per character (they ARE the machine). Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a logo cell says the exact wordmark.

PALETTE SHIFT (note): HUNCH's own identity conflicts with midnight-garden, so I kept the paper-craft/felt/bead materials but swapped the palette+subject to HUNCH's — deep near-black navy #0d0e1a, panel indigo #16182b, electric-lime signature #c8ff4d, teal #5eead4, cream text #eef0ff, hit-green #7CFC9B, miss-rose #ff6b81, streak-amber #ffac4d. Felt/paper in these hues, lime is the "power/eye" color (the garden gold/sage becomes lime/teal here).

---

## Sheet 1 — Persona machine mascots (cutout)

- **File name:** `hunch_personas_512.png`
- **Grid:** 3 cols x 2 rows
- **Cell size:** 512x512 px
- **Master size:** 1536x1024 px
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- Framing: chest-up, centered, identical eye-line and ~12% safe margin in every cell so they don't jitter when swapped. Transparent character sits on Hunch's dark UI.

1. `persona_critic` — snooty felt art-critic robot, tiny stitched beret + bead monocle over a glowing lime eye, one eyebrow raised, chest-up, smug, theatrical; cream + indigo felt body, lime monocle glint.
2. `persona_noir` — hard-boiled detective robot, cut-paper trench coat and felt fedora, one shadowed lime eye peeking under the brim, a macrame-cord wisp of smoke curling up; moody teal rim-light.
3. `persona_sunny` — relentlessly cheerful sunbeam robot, round felt face beaming, sequin sparkles, little cut-paper sun-rays, warm lime + amber glow, softest friendliest silhouette of the set.
4. `persona_gremlin` — chaotic hyper little gremlin machine, wild felt ears, jagged glitter grin, two mismatched glowing lime bead eyes, bouncing pose, gleeful cozy-menacing energy.
5. `persona_oracle` — serene mystic oracle robot, felt hood and beaded veil, a floating glowing lime "third eye" orb, macrame tassels, calm prophetic glow, teal-and-lime aura.
6. `machine_eye_thinking` — the generic HUNCH "machine" mid-squint for the thinking screen: a single big cut-paper/felt eye squinting shut, lime iris, stitched lashes, tiny glitter concentration sparks — reads as "the machine is looking hard."

---

## Sheet 2 — Portal / app brand tile (full-bleed)

- **File name:** `hunch_tile_512.png`
- **Grid:** 1 col x 1 row
- **Cell size:** 512x512 px
- **Master size:** 512x512 px
- **Knockout:** full-bleed art, no magenta inside the cell.
- Fill the full square (OS/portal masks corners). ~12% safe margin on the mark.

1. `hunch_tile` — app/portal icon: a chunky felt-and-cut-paper pencil tip morphing into a glowing lime AI eye on a deep-navy #0d0e1a felt field, faint stitched circuit lines, teal rim-glow. Iconic single mark. Logo cell — the ONLY allowed text is the exact wordmark "HUNCH" small along the bottom in cream felt letters (omit entirely if type won't stay crisp; the mark alone is enough).

---

## WIRE NOTES

- Repo: external clone at `ext_repos/Hunch/`; single game file is `index.html` (vanilla HTML/JS, PNGs drop in cleanly — no bundler).
- **Personas (Sheet 1 cells 1-5):** wired in `renderPersonas()` at `index.html:426` — replace `<span class="pe">${p.emoji}</span>` with `<img class="pe" src="assets/personas/persona_${id}.png">`. Persona ids/order come from the `PERSONAS` map (`index.html:389-400`): `critic, noir, sunny, gremlin, zen` — so cut cell 5 as `persona_zen.png` (id is `zen`, name "The Oracle"). Chips are ~60px (start screen) and personas also flavor the result — keep silhouettes readable tiny.
- **Thinking machine (cell 6):** the `.eye` div at `index.html:287` (`<div class="eye">👁️</div>` in `#scThink`) — swap the emoji for `<img src="assets/personas/machine_eye_thinking.png">`; the squint animation is CSS (`@keyframes squint`) and still applies to the img.
- **Portal/app tile (Sheet 2):** replaces the typographic `icons/icon.svg` (referenced in `index.html:14-15` and `manifest.webmanifest`); also use it as the Sky Wolf portal thumbnail for this game.
- **Recommended asset folder:** `assets/personas/` for Sheet 1, `icons/` for Sheet 2 (matches the repo's own ART_ASSETS.md convention).
- **Do NOT author:** drawing pad `#pad`, timer ring `#ring`, score/streak header, result/leaderboard screens, and the shop ink/theme cosmetics (`neon/gold/rainbow` inks are `ctx.shadowBlur` effects at `index.html:600-602`; themes are CSS accent swaps at `index.html:796-844`) — all procedural-by-design, art would degrade them.
- Every cut cell is simple felt/paper shapes on transparency — comfortably compresses under 150KB at 512x512.
