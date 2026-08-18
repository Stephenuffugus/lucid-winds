# Tarot Run — NEXT (the checklist to go down when we restart)

_Live game (Codespace-independent, 24/7): **https://stephenuffugus.github.io/Tarot_Run/** — title should read **B24 · THE SHADOW DECK**._

How this works: **you tick Part 1 while you playtest** (one word per line is enough — "good", "boring", "too strong", "confusing"). When we restart, you hand me Part 1, I turn the exact dial each line maps to. Parts 2–4 are the queue after that. Nothing here is urgent. Test in the order that's fun.

---

## PART 0 — Overnight build verdicts (B25–B37 · NEW, do these first)

The title should read **B37 · DEEPER VEILS**. One word per line is enough.
- [ ] **Combat feels tougher? (B28)** — enemies now actually HOLD Block (it
  was being wiped every turn); Swords _pierce_ now ignores it. Is it harder
  but fairer? Too hard? _→ `ENEMY_DMG_MULT` (0.62)_
- [ ] **End-of-run summary (B30)** — does the score + "★ NEW BEST" + VEIL
  UNLOCKED make even a death feel like progress? _→ score weights_
- [ ] **The Daily Spread (B31)** — a reason to come back daily? Is the
  copyable share string something you'd post? _→ share format / streak_
- [ ] **Opening omen (B33)** + **suit-led card rewards (B35)** + **Tower
  dares (B36)** — does every run feel like it has its own plan now? Any
  relic too strong / dead? _→ per-relic + offer tuning_
- [ ] **Distinct acts (B26)** — do Acts II (mirrors) / III (crown) feel like
  NEW places, or filler? _→ enemy intents/HP_
- [ ] **The Veils (B25/B37)** — once you clear a run, is "one more, harder"
  tempting? Do high rungs (chain tax, cursed open) change how you play? _→ rungs_
- [ ] **Teach pop-ups (B32)** — helpful or annoying? (each fires once ever) _→ wording/trim_
- [ ] **Events (B27)** — 12 now; any dud, any too strong? _→ per-event_

---

## PART 1 — Your playtest verdicts (do these on your phone)

For each: does it feel right? If not, the dial I'll turn is in _italics_.

**Moment-to-moment feel**
- [ ] **Shadow Deck (B24)** — is "flip a card → flip its combo role" *intuitive*, or fiddly/confusing? _→ keep / simplify the rule / better teaching_
- [ ] Any **shadow face too strong**, or one you'd *never* want? (name it) _→ per-card shadow tuning_
- [ ] **↻ SHADOW** ribbon + blue tint — legible at a glance mid-fight? _→ restyle_
- [ ] **Chain payoff (B21)** — does a built same-suit chain *visibly dwarf* scattershot? _→ `chainBonusFor` curve_
- [ ] **Aspect (chain-3)** — does it *detonate* (screen bloom + big effect), feel like a payoff? _→ Aspect numbers / FX_
- [ ] **Cups** — do heal decks have teeth now? _→ cups-9/10 + shadow tuning_
- [ ] **Pents / block-spam** — too dominant after the buffs? _→ Pents shadow + Aspect block_
- [ ] **Hand reset (B23)** — does the discard sweep + "↻ discards N" make it clear, not "cards vanished"? _→ FX timing / explainer wording_
- [ ] **Banish & shield-shatter (B19)** — banish opens cleanly? shatter feels right (not too much/little)? _→ FX tuning_

**Run structure**
- [ ] **3 Acts (B22)** — does it feel like a real *climb*? Acts II/III bite more but *fair*? _→ `globalDepth` scaling_
- [ ] New bosses **Hanged King / Glass Magus** — distinct & fun, or filler? _→ boss intents/HP_
- [ ] **+30% inter-act mend** — right amount of mercy? _→ the 0.30 in `enterNextAct`_
- [ ] **Merchant (B20)** — prices fair vs your gold? Shop-vs-Rest a real choice? _→ `SHOP_PRICE`_
- [ ] **Map (B23)** — behind (✓) vs here (▸) vs ahead obvious now? _→ node CSS_

**The two forward questions (just pick a lean)**
- [ ] More acts (Act IV, V…) **or** an endless mode **or** 3 is right? _→ append `ACTS` / build endless_
- [ ] Should later acts hand out **better cards** (reward tiers reset each act right now)? _→ per-act reward pool_

---

## PART 2 — Build queue when we restart (I execute, in this order)

1. [ ] **Verdict pass** — apply every Part-1 dial you flagged. Fast, by feel, one build.
2. [ ] **Fate reframe** — Reversed is now a *fork*, not a penalty; "↻ REVERSED — costs 1 less, weaker" framing is stale. Rebrand to the upright/shadow choice; retune/retire `FATE_BASE_CHANCE` (0.22) & per-Patron bends to be about *which face*, not weaker.
3. [ ] **Acts / endless** — per your Part-1 lean (append acts is a one-liner; endless is a small mode).
4. [ ] **Per-act reward tiers** — if you said later acts should draft stronger.
5. [ ] **Reward pool surfaces the engine cards** — make drafts offer the textured n=4–10 / shadow-relevant cards, not just stat-sticks.

## PART 3 — The road to v1 (the phases, unchanged shape)

- [ ] **Phase 1 — lock the feel** (Parts 1–2 above). Exit when you can say "moment-to-moment is fun and the Patrons play distinctly."
- [ ] **Phase 2 — ART** (the biggest "feels finished" lever). `CARD_CHECKLIST.md` + `ART_DIRECTION.md` are ready; pipeline = drop `art-slots/card-<id>.png`, auto-loads, no code. Do ★ TURN-ONE cards first. 92 assets total; drip-feed is fine.
- [ ] **Phase 3 — balance lock** — one per-Patron pass; `sim-archetypes` for *shape only* (never win%); lock the dials.
- [ ] **Phase 4 — publish** — domain (github.io vs Hostinger), PWA icons, merge `setup/project-structure` → `main`, one clean win-run per Patron with art in.

## PART 4 — Parked ideas (not lost; pull only if Phase 1 wants them)

- [ ] Chain-3 **active skill-moment** (timed input on the detonation, like the Cut) — the stated follow-on if the Cut lands.
- [ ] Cross-suit **Resonances** / card **Illumination** (upgrades) / **Major-Arcana run modifiers** — the alts to the Shadow Deck if more variety is wanted.
- [ ] **VEILS** difficulty ladder (data exists; wire enemy HP/dmg mods + a picker).
- [ ] Spectacle pass (pure juice) / smooth-the-opening (only if a human—not the bot—actually feels an early cliff).

---

**Discipline reminders (for me, so I don't regress):** sim CANNOT judge difficulty or skill (you cleared a full run while the bot died on floor 0) — it's only valid for crash/regression, mechanic-fires, run-shape. Tune by your felt playtest. Never bump `VERSION`. Verify `test-cards` (0 errors, incl. reversed) + `diag-combat` (8/8) before every ship. Commit/push as a standalone call (the chained-with-sed commit silently no-ops).
