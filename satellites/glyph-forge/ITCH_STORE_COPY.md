# itch.io listing — copy/paste ready

Create the page at https://itch.io/game/new (you need a free itch.io account).
Fill the fields below. Then paste the resulting URL into `GF_LINKS.itch` in
`index.html` (one line, ~line 1960) and run `tools/deploy.sh` — every CTA in the
game lights up automatically.

---

**Title:** `Glyph Forge`

**Project URL:** `glyph-forge`  → becomes `https://stephenuffugus.itch.io/glyph-forge`

**Short tagline / "Short description or tweet":**
> A pocket roguelite deckbuilder. Fuse runes into spells. Find what shouldn't work.

**Classification:** Game
**Kind of project:** HTML  *(playable in browser — see "Embed" below)*
**Release status:** Released

**Pricing:** `$0 or donate`  →  set **Suggested donation: `$4.00`**
- This is the "pay what you want" model. It answers "what's it worth?" by letting
  the market answer. You can raise the suggested amount or set a minimum later
  without breaking anything.

---

**Description (paste into the big text box):**

> **Glyph Forge** is a pocket roguelite deckbuilder where every spell is a rune fusion you build by hand. Slot two or three runes, watch the damage resolve **live, left to right**, and chase the combos that *shouldn't* work.
>
> Most deckbuilders hide the math. This one *is* the math — and it teaches you to break it.
>
> - **A two-track engine, not a damage stat.** Spells resolve in order: a POWER track you stack and an **XMULT** track you detonate. Slot order is skill. Mono-element and mono-shape builds scale *exponentially* — commit and the numbers stop being numbers.
> - **Sigils make every run a different game.** Seven run-identities that each **bless and forbid** — the Emberheart seals Water; the Hungering Maw trades 12 HP for raw XMULT. Each carries a **Champion** that levels mid-run.
> - **22 relics, 5 hidden transmutations.** Bind a secret rune triad in one run and it *ascends*. Build-craft, not loadout-picking.
> - **Discovery is the progression.** 36 runes, 48 named fusions. Find one and it's inscribed in your codex forever. The codex *is* the meta-game.
> - **Big numbers are puzzles solved.** 1000+ damage turns exist — but only once you've worked out the line.
> - **One run ≈ 12–18 minutes.** 13 encounters, rising stakes, a boss who does not go quietly.
> - **Daily Sigil.** Everyone gets the same seed — deck, path, offers, boss. One attempt. Compare.
>
> Synthesised audio (no downloads — the game makes its own sound), full **reduced-motion** support, single-handed portrait play. Installs to your phone's home screen and **plays fully offline**. One HTML file. No tracking, no accounts, no ads.
>
> Illuminated-manuscript styling; art rolling out in batches post-launch (it's designed to look intentional with none yet — styled glyphs, not broken boxes).
>
> Free in your browser. If it eats an afternoon, name your price. ♦

**Embed options:**
- This is a single static HTML game. Easiest path: link the **live web version**
  (`https://stephenuffugus.github.io/glyph_forge/`) from the page, OR upload a
  zip of the project folder and set it as an **HTML** project with
  `index.html` as the launch file, viewport ~ `420 × 760`, "mobile friendly"
  and "fullscreen" enabled.

**Genre:** Role Playing / Card Game
**Tags:** `roguelike`, `deckbuilder`, `roguelite`, `card-game`, `pwa`, `mobile`, `pixelless`, `singleplayer`, `dark-fantasy`, `daily`

**Community:** Comments — on
**Cover image:** use `title-mark` art (630×500 recommended) once generated
**Screenshots:** title screen, a mid-fusion spell, a combo banner, the Sovereign

---

## After the page exists
1. Copy the page URL (e.g. `https://stephenuffugus.itch.io/glyph-forge`).
2. Open `index.html`, **search for** `const GF_LINKS = {` (don't rely on a line
   number — the file changes), set:
   `itch: 'https://stephenuffugus.itch.io/glyph-forge'`
3. Re-deploy: GitHub Pages → `bash tools/deploy.sh "wire itch link"`.
   Hostinger / other host → `bash tools/pack.sh` and re-upload (see
   `tools/HOSTINGER-UPLOAD.md`).
4. The "Pay-what-you-want on itch.io ↗" link appears on the title screen and the
   "Name your price ↗" / "Get the full codex ↗" buttons appear on win/lose.

## Screenshots to capture (the store sells on these)
The game is most photogenic mid-detonation. Grab:
1. Title screen (the codex mark).
2. A spell mid-fusion with the **synergy throb** glowing on the slots.
3. A big tier-3/4 damage pop + the combo banner ("INSCRIBED" on a new one).
4. The depth strip showing a Sigil + Champion Lv + relic rarity dots.
5. The Sovereign (final boss) at low HP.
