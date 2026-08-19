# Devlog — Glyph Forge, or: building a deckbuilder out of one HTML file

*This is the launch devlog. Honest version. Use it as the itch.io devlog post,
the Reddit self-post body, or the "about" on the page — it's written to be
copy-pasted, lightly trimmed per channel.*

---

## The pitch I'd give a stranger

Glyph Forge is a roguelite deckbuilder where you don't *play* cards — you
**fuse** them. Slot two or three runes, and the spell resolves in front of you,
left to right, as a little machine: a POWER track you stack and an XMULT track
you detonate. Slot order is the skill. The whole game is the damage formula,
deliberately turned inside out so that learning to break it *is* the
progression.

It's one `index.html`. No engine, no build step, no dependencies, no backend,
no accounts, no ads, no tracking. It installs to a phone home screen and plays
offline. It even makes its own sound — the audio is synthesised in the browser,
not a single asset file.

## How it was actually made

Solo, in a browser-based dev environment, pair-building with Claude Code. Not
"AI wrote a game" — more like having a tireless engineer who'd take "this relic
feels broken" and come back with a 35-run-per-Sigil simulation proving it.

The discipline that held every single commit:

- **One `<script>` tag.** The entire game logic lives in one block of one file.
- **`node test.js` green** — a headless harness that re-extracts the script,
  stubs the DOM, and asserts exact damage numbers (Stone alone = 3, the deepest
  legal combo = 4160, baseline byte-identical to before the depth rework).
- **`node sim-run.js` green** — a brute-force AI that plays ~100 runs per Sigil
  *and* a per-relic impact matrix, then prints a single BALANCE VERDICT and a
  determinism assertion. Balance was never a vibe; it was a number with a
  pass/fail.
- **Saves are additive-only.** The `glyph-forge-v1` key never broke across the
  whole build. Old saves still load.

## The turn that made it a game

The first version had *combinatorial surface* — 9 elements × 7 shapes × fusion
— but only **one depth axis**: synergy multiplied a single damage number,
flatly. No engine to build and then detonate, which is the genre's central
pleasure.

The fix was a two-track engine. POWER is additive and assembled in slot order;
XMULT is multiplicative and scarce; mono-element / mono-shape commitment scales
*exponentially*. Suddenly slot **order** mattered, "focus" beat "variety", and
the codex stopped being a glossary and became a tech tree. Then: Sigils that
bless-and-forbid, a Champion that levels mid-run, 22 relics, and 5 hidden
transmutations you trigger by binding a secret rune triad in a single run.

## The balance story (my favourite part)

A content pack — 36 runes, 48 combos, 7 Sigils, 22 relics — went in and
immediately ran *hot*. The sim caught it cold: five relics were landing at
+31 to +35 win-rate points (one hit a literal 100%), and one was *dead* at
−7 (it rewarded empty spell slots, which the optimiser correctly never wanted).

No guesswork. The sim flagged them by name; each got re-costed (squared/cubed
XMULT became fractional exponents with a globalMult tax; the dead relic was
reworked into a "lean-casting" archetype); re-sim; repeat until **every relic
sat in a +5..+25 band, none dead, none overpowered, determinism still PASS.**
That loop is the whole reason I trust the numbers.

## What's *not* done, honestly

- **Art.** The illuminated-manuscript art rolls out in batches after launch.
  The game is built to look *intentional* with zero art — styled glyph
  placeholders, never broken-image boxes — and art hot-loads from `art-slots/`
  with a graceful fallback. Shipping playable beats shipping pretty-but-late.
- The boss is tanky rather than mechanically tricky (a phase-2 is on the list).
- No deck-thinning yet.

## Play it

Free, in a browser, on your phone right now. If it eats an afternoon, the itch
page is pay-what-you-want. The **Daily Sigil** (same seed for everyone, one
attempt) is the thing to share — compare how far you got with the same hand.

— Built in the open. Repo and full design bible are public.
