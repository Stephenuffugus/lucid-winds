# Tarot Run — Plan of Attack

_The road from "all systems built" to "test-played and published." Paste into a Google Doc; it's also in the repo and on the live URL._

Live game (permanent, Codespace-independent): **https://stephenuffugus.github.io/Tarot_Run/**
Current build: **B18 · PROPHECY READABLE**

---

## Where it stands

Every core system is built, tested (78/0 cards, 8/8 combat diagnostics), and live:

- **Combat feel** — real enemy threat, truthful telegraph, walked-through enemy strikes.
- **The Chain** — escalating same-suit combo + energy tax.
- **The Cut** — pre-combat skill (marker sweep → Sun/faint/silent/Tower).
- **The Web** — every suit is an engine (Wands Ember, Swords debuff payoff, Cups sustain→damage, Pents Block→fist) with cross-suit combos.
- **4 bespoke Patrons** — distinct 16-card starter decks, each with a turn-1 combo seed.
- **The Channel** — feed any card to your Patron 1×/turn (no dead hands).
- **The Turn of Fate** — visible, bendable Reversed cards; each Patron bends fate differently.
- **The Prophecy** — the Reading foretells a suit sequence; fulfil it for a payoff.
- **Meta** — Insight currency + The Mirror permanent talents.

**The one thing missing: art.** The game is fully playable but runs on placeholder glyphs. That's the biggest lever left for "feels finished."

---

## Phase 1 — Lock the design (playtest, by feel)

No new systems unless one genuinely isn't landing. Play a few full runs per Patron and give a verdict on each — every one has a ready dial:

| System | The question | If it's off |
|---|---|---|
| The Prophecy | Tempting pull or ignorable noise? Payoff worth the constraint? | tune payoff / suit-weighting |
| The Turn of Fate | Is "cheaper but weaker" a real choice? Frequency right (~22%)? | `FATE_BASE_CHANCE` / mult |
| The Channel | Real decision, or obvious freebie? 1×/turn right? | per-Patron effect / limit |
| Patrons | Do the 4 feel genuinely different to *pilot*? | deck lists in `PATRON_DECKS` |
| Debuff persistence | Do Swords combos land across turns now? Too sticky? | the +1 duration in `applyDebuff` |
| The Cut | A "lean-in" beat or a chore? Speed OK on phone? | rarity / marker speed |

**Exit criteria:** you can say "the moment-to-moment is fun and the 4 Patrons play distinctly." Then design is locked.

## Phase 2 — Art pass (the big visual win)

Use **`CARD_CHECKLIST.md`** (78 cards, prioritised). Pipeline: make a 512×720 PNG, name it exactly `card-<id>.png`, it auto-loads on the live URL — no code change.

Order, by impact:
1. **★ TURN-ONE cards** (~31, the Patron starter decks) — every run shows these immediately, so the game looks illustrated after the very first batch.
2. Commons → 3. Uncommons → 4. Rares (the 22 Majors).
5. **11 enemy portraits** + **title mark** + **2 app icons** (see `ASSET_MANIFEST.json`).

Style guide is `ART_DIRECTION.md` (Smith-Waite × Mucha × footlit baroque). You can drip-feed: every batch you drop improves the live game within ~1 min. Tell me when files are ready and I'll commit/wire them.

## Phase 3 — Balance lock

Once feel + art settle: one per-Patron balance pass. Use `node sim-archetypes.js` for **shape** only (does skill out-survive mashing, do Patrons diverge) — never tune to its win%. Lock the dials (`ENEMY_DMG_MULT`, Chain tax, Fate, Prophecy payoff).

## Phase 4 — Publish

- **Domain:** keep the github.io URL, or point your **Hostinger** domain at it / host the static files there (one decision — flag when you want it; it's a quick setup either way).
- **PWA:** already done — it's installable to a phone home screen once icons exist.
- **main branch:** everything's on `setup/project-structure`. Merge → `main` when you're ready to call it a release (your call).
- **Final QA:** one clean win run per Patron, on a phone, with art in.

---

## Decisions only you can make (the forks)

1. The Phase-1 verdicts above (what's fun / what's off).
2. Art: do it yourself, or hand `CARD_CHECKLIST.md` + `ART_DIRECTION.md` to an artist/Midjourney.
3. Domain: github.io vs Hostinger.
4. When to merge to `main` / call it v1.
5. Alternates still on the table — pull these ONLY if a Phase-1 system isn't landing:
   - Reading: **Omen Counter** (RPS vs enemy) or **Phased Spread** (instead of/alongside Prophecy)
   - Fate: **Fortune Dice** (opt-in push-luck) or **Signature Abilities** (instead of/with Channel)

## Optional backlog (not blocking publish)

- Apply the **VEILS** difficulty ladder (data exists; wire enemy HP/dmg mods + a picker).
- Reward-pool tuning so the new engine cards surface in drafts.
- More enemies / a second act, post-v1.

---

**One-line version:** the game is *built*. Phase 1 = play it and lock what's fun. Phase 2 = pour in the art (turn-one cards first). Phase 3 = balance. Phase 4 = domain + merge + ship. Everything auto-deploys; nothing depends on the Codespace.
