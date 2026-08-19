# Tarot Run — Resume Plan

When the user says "lets get started", read this first.

---

## ⚡ OVERNIGHT AUTONOMOUS RUN — B25 → B37 (current: B37 · DEEPER VEILS)

Built autonomously in one session (no permission stops), driven by a
competitor-research + code-audit pass. Every build: `test-cards` 0 err +
`diag` A–H + `sim` clean, committed & pushed standalone (auto-deployed).
**Title now reads `B37 · DEEPER VEILS`.** No VERSION bump anywhere.

**What landed (newest first):**
- **B37 DEEPER VEILS** — high Veil rungs change *tactics*: Chain tax +1
  (VII+), every fight opens with a curse in your draw (IX+).
- **B36 TEMPT THE TOWER** — before each elite/boss, opt-in dare (a curse /
  +3 enemy Strength / −1 energy) for a **guaranteed relic** on the win.
- **B35 THE GATHERING BUILD** — card rewards now tier by *global depth*
  (later acts draft stronger) and **lead with your committed suit** so a
  build assembles; +7 build-defining relics (15→22).
- **B34 TRUE SIGHT** — fixed 3 dead mechanics: High Priestess is a real
  **scry**, Judgement's free-cast now works, Broken Mirror's "+1 reversed"
  now wired.
- **B33 THE OPENING HAND** — a 1-of-3 run-shaping omen before the first
  door (seed-deterministic, Daily-fair).
- **B32 FIRST LIGHT** — just-in-time `teachOnce` tutorials (first fight /
  Chain / Shadow / Prophecy); Magician flagged for first-timers.
- **B31 THE DAILY SPREAD** — one shared seed/day, seed-chosen Patron, one
  locked attempt, streak🔥, **copyable spoiler-free share string**.
- **B30 THE RECKONING** — every run (win *or* loss) scores + shows an
  itemized summary with ★ NEW BEST and a loud VEIL-UNLOCKED reveal.
- **B29 SAFE PASSAGE** — banish can't empty the deck (was unwinnable);
  daily HP fairness; meta survives a future VERSION bump.
- **B28 TRUE GUARD** ⚠️ — three REAL combat bugs fixed: **enemy Block was
  wiped every turn** (Guard intents + Swords *pierce* were inert) → now
  persists; Cups *Resolve* now soaks; `add_curse` gifted a beneficial Death
  Major → now a real unplayable curse. **This is a modest, intended
  difficulty BUMP** — `ENEMY_DMG_MULT` (0.62) is the dial if it's too much.
- **B27 THE WANDERING ROAD** — events 4 → 12.
- **B26 A BESTIARY PER ACT** — +10 enemies; Act I (crypt) / II (mirrors) /
  III (crown) now fight distinct casts (fixes "same setup again").
- **B25 THE VEILS RISE** — the difficulty ladder is wired & selectable
  (was fully inert): `veilMod()`, 11 rungs, run-start picker, victory
  unlock + nudge.

**PLAYTEST — what to FEEL for (then tell me, I turn the dial):**
- B28: do fights feel tougher/more tactical now enemies hold Block? Is
  Swords *pierce* finally meaningful? Too hard? → `ENEMY_DMG_MULT`.
- B30/B31: does the score + summary make a loss feel like progress? Is the
  Daily a reason to come back? Share string land?
- B33/B35/B36: does each run feel different (opening omen, suit-led drafts,
  Tower dares)? Any relic too strong / never worth it?
- B26: do Acts II/III feel like new places? Any new enemy unfair/filler?
- B32: are the teach pop-ups helpful or annoying? (each fires once ever.)

**Deliberately NOT done (a design fork for YOU):** the "Insight
content-unlock shelf" (start with fewer relics/cards/events, unlock the
rest with Insight). It *gates content you currently get free* — your call,
not mine to impose. Everything else from the research queue shipped.

See memory `tarot-overnight-b25-b34.md` for the full technical log.

---

## Where things are (as of B24 · THE SHADOW DECK — every Minor has a true Reversed face)

- **Live game (PERMANENT): https://stephenuffugus.github.io/Tarot_Run/**
  - GitHub Pages, "Deploy from a branch" = `setup/project-structure` root.
  - Up 24/7 regardless of the Codespace. Every `git push` auto-deploys in ~1 min.
  - The old Codespace `python3 -m http.server` + tinyurl chain is DEAD —
    never restart it, never hand the user a tinyurl. The github.io URL is it.
  - `.nojekyll` at repo root makes Pages serve files as-is. Keep it.
  - Verify a deploy: `curl -s https://stephenuffugus.github.io/Tarot_Run/ | grep "const BUILD"`
    should echo the current `BUILD` const from index.html.
- Branch: **setup/project-structure** (pushed to origin). NOT merged to main.
  Pages serves THIS branch — keep shipping here.
- Build tag shown on title screen = `BUILD` const in index.html. Bump it every
  shippable change so the user can verify cache by reading it back.
- Tests: `node test-cards.js` (78/0 errors), `node test.js`, `node sim-run.js`,
  `node diag-combat.js` (regression suite TEST A–H: threat, Ward, Study,
  Spread, Chain, **and H = Wands Ember lay/detonate**).
- `node sim-archetypes.js` (dev-only stress harness, `SEEDS=N` env;
  4 player types × 4 Patrons). Reports SHAPE/deltas — do NOT tune to
  its win% (bot-capped ≈0 by design); read engine-reachability,
  Patron spread, comboist−masher delta, run shape.

## Shipped so far (depth-injection roadmap)

1. Combat-feel overhaul: real enemy threat, truthful telegraph, Ward wired,
   Kings = payoffs, suit archetypes. Knob: `ENEMY_DMG_MULT` 0.62.
2. Deck-thinning ("Hermit's Bargain" banish at Rest) + real Study (+2, ctx.studyBonus).
3. 4 Patrons (Magician/Priestess/Empress/Emperor) — picked via modal.
4. The Spread (8 ARCANA_BOONS, offered after elites, applied at combat start).
5. Retention meta: Insight (every run), The Mirror (spend Insight on Vigor/
   Fortune/Deep Reading), VEILS ladder data (unlock on win; application deferred).
6. **The Chain** — consecutive same-suit minor cards: +2/+4/+6/+8, off-suit
   resets, Major is wild, chain-of-3 detonates the suit Aspect. Loud banner.
7. **Chain has teeth** — extending a chain costs energy (`chainTaxFor`:
   FREE=2, CAP=3 → tax 0,0,1,2,3,3). Charged before affordability.
8. **Hosting solved** — permanent GitHub Pages URL (see above).
9. **B10 · THE CUT** — the Reading is now an active skill: pre-combat
   "Cut the Deck" marker-sweep. Sun (center)=+2 Str & free Reading;
   faint=+1 Str; Tower (edges)=start Weak 2; else silent (=legacy).
   `combat.readingFortune` defaults 'silent' (engine/tests untouched);
   `cutTheDeck()` is UI-only (enterNode path, rAF-guarded). Marker
   speed scales with floor.
10. **B11 · THE WEB** — task #18: suits got a second verb. n=1–3 kept
   as clean baseline (regression anchor); n=4–10 are now engines —
   Wands lay/detonate Ember, Swords apply→cash debuffs, Cups turn
   sustain→damage, Pents turn Block→fist; cross-suit web throughout.
   Patron decks are 4 bespoke 16-card decks (was one re-suited
   template), each with a turn-1 combo seed, power held even.
11. **B12 · THE OPENING** — `sim-archetypes.js` (4 player types × 4
   Patrons × 60 seeds, dev-only, NEVER loaded by the game) found two
   STRUCTURAL breaks: Empress/Emperor decks had no opening offense
   (Empress 51/60 dead by floor 1, stalled with no win condition);
   the Cups heal→damage verb was dead (7 fires in 629 fights, gated
   at heal 12+). Fixes: Empress += wands-4+cups-10+swords-5; Emperor
   += pents-7+wands-4 (pents-9 kept); cups-9 gate 12→6 (now reliably
   fires), cups-10 also scales off Ward. Re-run: Cups verb 7→81,
   engine reachability 0.83→1.21 fires/fight. Bot win% is bot-capped
   by design — NOT the signal; the engine-reachability delta is.

12. **B13 · THE CHANNEL** — playtest found the "dead hand" problem
   (combos are conditional → off-combo cards feel like bricks; sim
   agreed: only ~1.2 payoffs/fight so most cards aren't the combo).
   Patron Channel: long-press a card → "Channel" feeds it to your
   Patron 1×/turn instead of playing it — Magician +1 energy,
   Priestess draw 1, Empress Heal4+3 Ward, Emperor Block6 (+Plate
   every 3rd fed). Differs per Patron so leftovers also play
   differently. Card→discard, no energy, 1×/turn. UI-only
   (`channelCard` from inspect modal); state defaults inert →
   engine/tests untouched. (User picked this over Bank / Signature
   Abilities — those remain on the table as later variants.)

13. **B14 · THE STRIKE** — two feel fixes. Banish DID let you pick
   (deck shows as a grid) but instant-spliced w/ no feedback → added
   a destruction animation on the chosen card. Enemy attacks had NO
   visual → added a walked-through strike (enemy lunge, screen shake,
   slash + red flash, floating −N / gold BLOCKED). `endTurn()` stays
   synchronous; FX is UI-only + rAF-guarded; tests untouched.

14. **B15 · THE TURN OF FATE** — user picked this (over Fortune Dice /
   Criteria Gates). Minors only, cost≥1. Reversed = −1 cost, effect
   ×mult via `ctx.fateMult` threaded through the 4 resolve helpers;
   upright = `Math.round(raw*1)=raw` so engine path byte-identical
   (tests untouched). Patron bends: Magician forces Upright
   (`fateChanceFor`→0), Emperor gentler ×0.80, Empress reversed also
   heals 3, Priestess may `turnFate` 1×/turn (inspect-modal action).
   `broken-mirror` relic +15% chance. Knobs: `FATE_BASE_CHANCE`
   (0.22), `FATE_REVERSED_MULT` map. Hand readable (no 180 flip;
   ribbon + discounted cost); inspect shows the rule. NOTE: Fortune
   Dice (opt-in push-luck) & Criteria Gates remain on the table.

15. **B16 · HAND & HEX** — (a) big hand spilled off-screen (broken
   `gap:-30px`, centered, no overflow) → `.hand` now horizontal-scrolls
   (touch+snap+thin bar, real gap, headroom for the lifted card,
   `safe center`). (b) Enemy Weak/Vulnerable are PRESENCE-based; their
   amount is purely a 1/turn-decay DURATION — applied at 1 they died
   before the player's next turn, so the Swords set-up→pay-off (whole
   B11 debuff web) was impossible across turns. `applyDebuff` now gives
   weak/vulnerable +1 duration (single chokepoint; burn untouched).

16. **B17 · THE PROPHECY** — user picked it (over Omen-Counter RPS /
   Phased Spread). The Reading now FORETELLS a 3-suit sequence
   (`combat.reading` = [suit,suit,suit], Patron primary weighted via
   `_pool`). Play Minors of those suits IN ORDER, any turns; off-suit
   never resets (`prophecyProgress` only moves forward) — opt-in, no
   punish. Fulfil → Heal 12 · Strike 12 · +1 maxEnergy, once
   (`prophecyDone`). Cut's Sun now seeds `prophecyProgress=1` (the
   free-reveal clause was moot). Strip = glyphs + Past/Present/Future
   with pf-done/pf-active/pf-wait; tap = explainer modal. diag E/G/H
   set `combat.prophecyDone=true` to isolate (like the chain-reset
   isolation). NOTE: Omen-Counter & Phased-Spread still on the table.

17. **B18 · PROPHECY READABLE** — playtest hit a GAME-BREAKER:
   `showModal({...})` with no `choices` had no close affordance
   (`hideClose` was dead code; veil isn't tap-to-dismiss) → the
   Prophecy explainer trapped the player. Root fix: showModal now
   auto-appends a Continue button when no choices (unless `hideClose`).
   Also: "Prophecy stuck" was a legibility miss (engine was right — it
   needs the foretold SUITS in order); strip now shows suit NAME +
   ▶/✔ markers and every step fires a banner (THE READING · Past
   foretold ✦ / ✦ PROPHECY FULFILLED ✦).

18. **B19 · THE GUARD SHATTERS** — 2026-05-19 playtest verdict
   (user ran Magician + Emperor; "pretty good so far"). Three asks:
   (1) **Banish "doesn't open"** — REAL bug: `showBanishModal()` built
   the deck grid into `#modal` but never `veil.classList.add('active')`
   (`.modal-veil` is `display:none` until `.active`; every OTHER modal
   does this). Also reset the SHARED `#modal._busy` on rebuild — it
   was sticky, so post-fix the 1st banish worked but the next Rest's
   was frozen. `showTutorPicker`/`showResurrectPicker` verified OK.
   (2) **"Too curt / shields disappearing"** — player-side juice:
   heal/block pops were spawning on the ENEMY portrait → now float off
   the player HUD; block being spent was a silent `display:none` →
   now `shieldShatter()` (shake + 7 shards) on any block >0→0 (one
   chokepoint in `renderCombat`, catches hit-consumed AND turn-reset);
   HP/Block/enemy-HP numbers pulse on change (`pulse()` + `_uiHpPrev/
   _uiBlockPrev/_uiEhpPrev`, reset at combat start). All UI-only,
   guarded by `typeof requestAnimationFrame !== 'function'` (the
   codebase's "real browser" gate — sim stub has no rAF; the
   B14 pattern). HP bars already had `transition:width`. sim-run
   CAUGHT a `style.setProperty` crash mid-pass (stub `style:{}`) →
   fixed by switching the guard from `typeof document` to the rAF
   gate. (3) **Gold has no point** — confirmed (only sink is one
   20g→15HP event, no shop). User picked **full Merchant node** →
   that's B20, next.

## THE OPEN QUESTION — next playtest verdict (post B10–B19)

Both confirmed needs from the 2026-05-19 verdict are now SHIPPED:
A (active skill) = B10 The Cut; B (strategy depth) = B11 The Web +
bespoke decks. The Chain dial stays locked — do NOT re-tune the tax,
do NOT sim-chase (sim greedy ~0% by design, never uses Reading/Cut).

Awaiting the user's felt verdict on:
1. **The Cut** — does it create a "lean in" beat each fight, or a
   chore? Are Sun worth chasing / Tower scary? Speed curve OK on phone?
   → routes to: keep as-is / make it rarer-but-bigger (elite+boss only) /
   widen payoff spread / tune marker speed.
2. **The Web** — do the suits now feel like engines with real combos?
   Do the 4 Patrons feel genuinely different to pilot? Any combo that
   is degenerate (too strong) or never worth it (dead)?
   → routes to: per-card power tuning by feel + diag, NOT sim.
3. **Decks balanced?** Each Patron deck is 16 cards, low curve, one
   off-suit splash that seeds its engine. If one feels weak/strong,
   adjust that deck's list in `PATRON_DECKS` (no test asserts contents).

19. **B20 · THE MERCHANT** — gold's sink (user picked full Merchant
   node over lean-nodes / combat-resource / scrap). New `merchant`
   map node + `showMerchantModal()`: 3-card floor-tier stock
   (`SHOP_PRICE` common40/uncommon60/rare90, a by-feel dial), 1
   undiscovered relic (130), banish-for-◈50 (no HP — coin not blood;
   reuses deck grid + destroy anim, pay-on-commit, can't empty deck),
   heal 35% maxHP for ◈45 (off when whole). Stock+sold-state live in
   the function CLOSURE — no run/state field → no VERSION bump, no
   migrateMeta touch. Only "Leave" advances the floor; purchases
   re-render in place. Map gen: floors 6 & 11 = Merchant-vs-Rest
   CHOICE (shop or heal), + ~6% in the random pool; verified 400
   seeds (floor-6 400/400, ~2.67/run). Glyph ⚖.

20. **B21 · REWARD THE ENGINE** — user asked "stress test + make it
   50% more fun." Heavy stress (150 seeds × 4 player-types × 4
   Patrons): runs front-load deaths (cliff not curve, esp.
   Empress/Emperor f0), comboist−masher delta NEGATIVE 3/4 Patrons
   (depth not rewarded), Cups Heal→damage DEAD (65/1866). The Cut's
   skill gradient is healthy (don't touch). User picked the "reward
   the engine" lever (over Chain-3-skill-moment / spectacle / smooth-
   cliff — those remain on the table). Shipped: `chainBonusFor`
   2/4/6/8 → **3/6/10/15** (chain TAX stays LOCKED — buy reward not
   cheaper cost); `triggerAspect` ~1.5× + `aspectFX()` suit-tinted
   screen bloom+shake (UI-only, rAF-gated); cups-9 binary "if healed
   6+" gate REMOVED → always Strike = ½ cumulative heal (min 5),
   cups-10 cap 14→22. diag TEST G updated to lock the new curve
   (chain-2 = +3 → 5,8). KEY DISCIPLINE NOTE: re-sim showed
   Heal→damage 65→148 (VALID signal, verb revived) but the
   comboist−masher delta did NOT improve (emperor masher 10→13) —
   EXPECTED, because sim's "masher" spams its DOMINANT suit (=
   accidental chainer) so a steeper chain helps the bot both ways;
   the sim cannot model real cross-suit/Cut/Prophecy skill. Per
   working-style: this lever is felt-verified ONLY; do NOT sim-chase
   the delta. Watch in playtest: does Pents/block-spam feel too
   dominant now (emperor masher rose)?

21. **B22 · THE ASCENT** — user playtested B21: cleared a FULL run
   (boss + all). The "cliff" was sim-bot incompetence, NOT the game
   (confirms RESUME: sim can't judge difficulty). Real ask: run was
   one 15-floor act → crown → menu ("same boss/setup again"); wants
   escalating areas ("2nd, 3rd, 4th etc, 15+ spaces"). Shipped a
   data-driven `ACTS` array (3 acts: The Undercroft → The Gallery of
   Mirrors → The Crown — append to add more). `run.act` (default 1,
   guarded `run.act||1` everywhere → NO VERSION bump, sims/old saves
   byte-identical). `generatePath(rng, act)` boss = `ACTS[act-1]`.
   `globalDepth()` = ((act||1)-1)*15+floor replaces run.floor in
   scaledEnemyHit + enemy-HP (continuous escalation; defaults to
   floor). `advanceFloor` boss-clear → `enterNextAct()` (carry
   deck/relics/HP/gold/Spread, fresh harder path, +30% mend,
   interstitial) unless final → `onRunVictory()`. 2 NEW bosses
   (Hanged King hp95 / Glass Magus hp128; crown 180 = finale) so
   never the same wall twice. Smoke-verified through all 3 acts:
   distinct bosses, scaledHit(base10) 8→11→13, final ~232 HP,
   victory only after act 3, state carries. Zero regression.

22. **B23 · LEGIBILITY** — two playtest complaints, same root (the
   game wasn't communicating state). (1) "Cards disappear / new hand /
   that sucks / no animation": the STS hand-reset is intentional &
   load-bearing — made it VISIBLE not removed. snapshotHand() clones
   the hand BEFORE endTurn() wipes it → sweepHandToDiscard() flies
   them to the discard pile → dealInHand() fans the new hand in;
   one-time explainer modal (state.meta.taughtHandReset); End Turn
   reads "↻ discards N". All endTurnWithFX/helpers — UI-only,
   rAF-gated, endTurn() untouched. (2) "Map won looks like unvisited":
   was completed 0.38 vs locked 0.22 opacity, no marker, .current was
   dead CSS. Now BEHIND = small/grayscale/✓, HERE = big/bright/glow +
   "▸ you are here", AHEAD = cool-dim/no-✓. Zero regression.

23. **B24 · THE SHADOW DECK** — answer to the "boring/samey, need
   card+combo diversity, elegant not confusing" verdict (user picked
   Reversed-as-true-face over Resonances/upgrades/Major-mods). All 56
   Minor `reversedPlay`/`reversedDesc` authored (engine already routed
   them — B15 only used the generic −1cost/×weaker fallback). ONE
   rule: Reversed = the card's INVERTED suit-engine role, same
   power & cost (Wands striker⇄ember, Cups heal⇄ward/fist, Swords
   pierce⇄debuff, Pents wall⇄fist) → ~112 effects, combos shift by
   orientation, 0 new card types. Data-driven `REVERSED_MINORS`
   block after MINOR_CARDS gen. Display: shadow desc + cold tint +
   "↻ SHADOW" ribbon at FULL cost; legacy −1/weaker path kept ONLY
   for cards w/o an authored face (curses); inspect shows BOTH
   faces. `test-cards.js` extended +56 reversed → 0 errors.

## Awaiting felt verdict (B19–B24)

- **B24**: do the Shadow faces add real expression — is "flip a card
  to flip its combo role" intuitive on the phone, or confusing? Any
  shadow face degenerate (too strong) or dead (never worth it)? Is
  the cold-tint + ↻SHADOW ribbon legible? Reversed draw chance is
  `FATE_BASE_CHANCE` 0.22 (per-Patron `FATE_REVERSED_MULT` now
  largely vestigial for minors — the fork is effect, not ×weaker;
  may want to rename/retune the Fate framing). → routes to:
  per-card shadow tuning by feel + diag, NOT sim.

- **B22**: do the 3 acts feel like real progression? Is the
  escalation curve right (act 2/3 enemies — too soft / brutal)? Are
  the 2 new bosses (Hanged King, Glass Magus) distinct & fun, or
  filler? Is the +30% inter-act mend the right amount (STS heals
  full at campfire; we keep tension)? Want MORE acts (it's a
  one-line append to `ACTS`) or an endless mode? Per-act reward
  tiers currently reset (act-2 f0 offers commons again) — bump?
- **B19**: banish opens cleanly now? The shield-shatter — lands, too
  much, too little? Combat read less "curt" (heal/block off YOUR HUD,
  numbers pulse)?
- **B20**: do the Merchant prices feel right vs your gold income?
  (`SHOP_PRICE` is the single dial — flat, no floor-scaling yet.)
  Is Merchant-vs-Rest a tense choice or an obvious pick? Stock
  variety good? Banish-for-coin worth it vs the HP Hermit's Bargain?
  → routes to: tune `SHOP_PRICE` / add floor-scaling / change node
  frequency / adjust stock pool.
- **B21**: does a built chain now FEEL like it dwarfs off-suit play
  (the +3/6/10/15 curve)? Does the chain-3 Aspect detonate (screen
  bloom + ~1.5× effect) land as a payoff moment? Do Cups decks have
  teeth now (heal→strike always fires)? Is Pents/block-spam too
  strong post-buff? → routes to: tune `chainBonusFor` curve / Aspect
  numbers / per-suit. Other fun levers still on the table if this
  doesn't land: Chain-3 active skill-moment, spectacle pass,
  smooth-the-cliff (the opening cliff is real but absolute difficulty
  is bot-capped — needs felt confirmation, not sim).

## Likely next increments (let the user steer)

- Per-feel balance pass on B11 cards / Patron decks (fast dials).
- The 2nd skill moment if Cut lands: **skill input on Chain detonation**
  (the chain-of-3 Aspect) — was the user's stated follow-on.
- Card rewards/draft pool should surface the new engine cards so a
  build can be drafted mid-run (check the reward generator picks from
  the textured n=4–10 band, not just stat-sticks).
- Reading reveal UI could hint when it's free (readingFortune==='strong').

## Backlog (lower priority)
- Apply the VEILS modifiers (data exists; wire enemy HP/dmg/restHeal mods
  + a Veil picker at run start).
- Per-Patron balance pass once the skill layer + synergy land.
- Hostinger/custom domain for the branded *published* build (later;
  Pages is the dev/playtest home).
- Eventually: merge setup/project-structure → main; per the user's call.

## Gotchas
- Never bump `VERSION` (save-version) — it discards in-progress runs.
  Add new meta fields via `migrateMeta()` defensively instead.
- `showModal` now auto-adds a Continue close button when no `choices`.
  Only pass `hideClose:true` if you ALSO supply your own dismissal
  (forced-choice modals), or you'll re-create the soft-lock.
- `chainTaxFor` / `scaledEnemyHit` are single sources of truth — both
  playCard/renderHand and resolve/telegraph call them; keep it that way.
- Don't sim-chase. `sim-run.js` greedy AI mass-mashes its dominant suit,
  reads ~0% by design, and never uses Reading — NOT a validity signal.
  Tune by the user's felt playtest experience + diag shape.
- Commit + push after every green increment; Pages auto-deploys it.
  The user playtests on their phone in fast loops — keep changelogs
  punchy and tell them exactly what to FEEL for.
- COMMIT-CHAIN QUIRK (observed B23/B24): chaining `sed`/`grep ... &&
  git commit ... && git push` in ONE Bash call silently no-ops the
  commit (tree stays dirty, "no output"). Run the BUILD-bump sed as
  its own call, then `git add/commit/push` as a SEPARATE standalone
  call. Always verify with `git status --porcelain` + `git log -1`.
- Heredoc `-m "$(cat <<EOF…)"` with ·/✓/↻ glyphs also flakes — prefer
  `git commit -F /tmp/msg.txt` or a single plain `-m`.
