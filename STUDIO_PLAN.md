# Sky Wolf Studio — Safety plan & build roadmap

> Stephen's question: *"What is it going to take to safely do all of
> these? Also when we adjust a game it needs to be fixed and adjusted
> no matter where you're playing. We have to be very careful not to mess
> things up."*
>
> This doc answers it. Read top-to-bottom — every section feeds the
> next. No code in here changes anything. Last updated 2026-06-04.

---

## TL;DR

1. **Game code is already single-source.** Both LW (`lucidwinds.com`) and shells (`lucidwinds.com/play/<id>.html`) load the same `/games/<id>.js`. Fix a game once, both surfaces update. ✓
2. **What still diverges:** `window._G` (the utility API every game depends on) exists separately in LW and in `play/shell.js`. We need a **locked contract** so they can't drift.
3. **Cosmetics economy:** new but mostly additive — catalog doc, one new Cloud Function (`spendSunbeams`), three SDK methods (`balance`, `spend`, `inventory`), a per-game render hook. Plant-minting stays an LW-exclusive privilege.
4. **Anon → signed-in flow** already works through `claimPending`. We may want a higher cap for "first claim from games player has been earning in" so a returning player doesn't lose much.
5. **The hardest decisions are design calls, not engineering.** Listed at the bottom.

Total work estimate to a credible cosmetics MVP: **6–9 working days** spread across 4 phases. No phase touches the LW main IIFE or any of the 65/66 in-LW games.

---

## 1. Single source of truth for games

### What's true today

Every game lives in exactly one place:

| Game type | Source | Loaded by |
|---|---|---|
| **Modular** (54 games — simon, memory, merge, sudoku, …) | `/games/<id>.js` | LW (via `_sg` lazy-load) + every `/play/<id>.html` shell |
| **Inline** (11 games — set, backgammon, checkers, …) | Inside `index.html` IIFE | LW only — shells don't have these yet |

For modular games: edit `/games/memory.js`, both LW and `/play/memory.html` pick up the change on the next page load. Same file, same fetched URL, same execution. ✓

### What can drift

| Component | Diverges? | Risk |
|---|---|---|
| Game logic | **No** — one file | None |
| Game CSS classes | **No** — both use `shared.css` from the same origin | None |
| Game assets (images, sounds) | **No** — both resolve to `/assets/…` | None |
| `window._G` API (utilities the games destructure: `e`, `play`, `ms`, `mm`, `mc`, `sh`, `_sr`, `_gr`, `setDiff`, `st`, `xt`, `solitaire-FS`, `getM`/`setM`) | **YES** — LW defines `_G` in `index.html:63129`; shells define `_G` in `play/shell.js`. **Same shape today, but nothing guarantees it stays that way.** | High |
| Sunbeam earn amounts per event | YES — LW uses a per-game table (`_aw`); shells use a default table. Numbers can drift. | Medium |
| Anti-farm guards (min play time, session cap, completion cooldown) | YES — different implementations. | Medium |

### What we need to do

**Phase 1 work (small, low risk):**

1. **Lock the `_G` contract** with a shared spec file `shared/_G_contract.md` listing every key, signature, behavior, and the source-of-truth file.
2. **Add a contract test** `scripts/test_g_contract.js` that loads BOTH LW's `_G` and shell's `_G` in jsdom and asserts:
   - Same set of keys
   - Each key is a function
   - Calling each with sample args doesn't throw
3. **Run the contract test** alongside `scripts/smoke.js` in CI / pre-push.

**Phase 3+ work (later, if useful):**

4. **Extract `_G` to `shared/lwlib.js`** so both LW and shells load it from one file. This removes drift entirely. Requires editing `index.html` to replace the inline `_G` block with a `<script src="shared/lwlib.js">` — one small additive change to the fragile file. **Not urgent — contract tests are sufficient for now.**

---

## 2. Cosmetics economy

### Player-level data model

Three new pieces of state, all per-uid in Firestore:

```ts
// vaults/{uid}.cosmeticsInventory — owned cosmetics
{
  cosmetics: {
    [sku: string]: { ownedAt: number, source: string }
  }
  // example: { "simon-skin-coral": { ownedAt: 1700..., source: "play:simon" } }
}

// vaults/{uid}.cosmeticsEquipped — what's currently equipped per game
{
  cosmeticsEquipped: {
    [gameId: string]: string  // sku
  }
  // example: { "simon": "simon-skin-coral", "memory": "memory-back-meadow" }
}

// vaults/{uid}.hashLedger.spent — already exists, server-only
// Each cosmetic purchase increments .spent by the sku's price
```

### Catalog (separate doc)

```ts
// catalog/cosmetics — read-public, write-admin-only
{
  [sku: string]: {
    name: string,
    gameId: string | "studio",       // "studio" = cross-game (avatar, frame)
    type: "skin" | "back" | "border" | "particles" | "avatar" | "frame",
    price: number,                    // sunbeams
    art: string,                      // asset path
    available: boolean,
    seasonal?: { startsAt, endsAt }
  }
}
```

Each game reads its own equipped sku from `Sunbeam.inventory().equipped[gameId]` at mount time and uses it to render. The catalog is the single source for prices + art paths.

### Server flows (one new Cloud Function)

**`spendSunbeams({ sku, gameId })`** — server-authoritative:

1. Auth check (uid required).
2. Read catalog/cosmetics/{sku} — verify available, get price.
3. Read vault.hashLedger — verify balance >= price.
4. Read vault.cosmeticsInventory — refuse if already owned (idempotent).
5. Atomic Firestore txn:
   - hashLedger.spent += price
   - cosmeticsInventory[sku] = { ownedAt, source }
   - cosmeticsEquipped[gameId] = sku (auto-equip on purchase; player can re-equip later)
6. Log: uid, sku, gameId, price.
7. Return new balance + inventory snapshot.

**Why server-only:** same reason `earnHashes` is server-only — clients can't be trusted to decrement their own balance. Same atomic-txn pattern as `mintPlant`.

### Anonymous players?

Cosmetics require signed-in players. Anonymous players can EARN sunbeams (already supported via `sws_pending_sunbeams`), but they can't OWN cosmetics — there's no uid to attach inventory to. The shell's sign-in CTA naturally bridges this.

Alternative considered: persist anon inventory to localStorage, claim on signup. Rejected — invites tampering ("I had 100 epic cosmetics, give them to me"). Stick to signed-in-only ownership.

### SDK additions

```ts
// In sunbeam-sdk.js (additive — no breaking change to existing API):

Sunbeam.catalog()           // → Promise<Catalog>     read /catalog/cosmetics
Sunbeam.inventory()         // → Promise<{ owned, equipped }>
Sunbeam.spend(sku, gameId)  // → Promise<{ ok, balance, owned }>
Sunbeam.equip(sku, gameId)  // → Promise<{ equipped }>  (client-side write to vault.cosmeticsEquipped — owned-only)
```

Plus an `onInventoryChange(cb)` listener so the in-game UI updates when player equips something.

### Per-game integration hook

Each game's mount function gets a small change:

```js
// AT MOUNT TIME — read equipped sku for this game:
function GS(container) {
  var equipped = (window._G && window._G.equipped) ? window._G.equipped('simon') : null;
  // equipped = 'simon-skin-coral' or null
  // ... pass to render to apply skin ...
}
```

`window._G.equipped(gameId)` is a new utility the shell + LW both provide. Returns the current equipped sku for that game, or `null`. Render code per-game decides how to apply.

**Discipline:** cosmetics are **visual-only**. No gameplay impact. No pay-to-win. (Otherwise we invite player complaints AND make game tuning impossible because every cosmetic affects balance.)

---

## 3. Currency lifecycle — anon ↔ signed-in

### Today

| Surface | Anonymous earn | Signed-in earn |
|---|---|---|
| **LW (`index.html`)** | NOT supported — `earnHashes` early-returns at `!firebase.auth().currentUser`. Anonymous players play but earn nothing. | Direct to `vaults/{uid}.hashLedger.earned` via `earnHashes` Cloud Function. |
| **Shells (`/play/<id>.html`)** | Goes to `localStorage['sws_pending_sunbeams']` via SDK. | Direct to `vaults/{uid}.hashLedger.earned` via SDK → `earnHashes` Cloud Function. |
| **Other satellites (Glyph Forge, etc.)** | Same as shells — SDK anon-pending. | Same as shells — SDK signed-in. |

### Edge cases

1. **Player earns 200 sunbeams anonymously in a shell, signs in.** Claim flow runs. `CLAIM_CAP` (private; currently 100) limits how much they get on first claim. `PENDING_DAILY_CAP` (private; currently 50) limits per-day claim total. Excess silently discarded.
   - **Risk:** a serious anonymous grinder feels robbed.
   - **Mitigation:** **raise CLAIM_CAP** for the FIRST claim (e.g. 500 sunbeams once per uid lifetime) since first-claim isn't a fraud signal — it's an onboarding moment. Make subsequent claims smaller. **Design call needed.**

2. **Player earns in LW first (signed in), then signs out, plays shells anonymously, signs back in.** Anon pending bucket has data; claim adds it on top of existing vault balance. Works correctly.

3. **Player runs LW in browser A and a shell in browser B at the same time, both signed in.** Both write to the same `hashLedger.earned` via the Cloud Function's atomic txn. Last write wins per increment; both contributions are recorded. ✓

4. **Player uses an incognito tab.** Anon pending accumulates in incognito's session storage, lost when window closes. Stephen may want to surface this as a warning. **Not critical for v1.**

5. **Cross-domain in future** (if shells move to `sweetspot.lucidwinds.com`): localStorage IS per-origin, so anon pending doesn't follow them across subdomains. Solutions:
   - Sign in with the same Firebase uid — sunbeams sync via Firestore.
   - Or: build a cross-subdomain anon-id sharing scheme (cookie at `.lucidwinds.com` root). Complexity not worth it. Just sign in.

### Recommended caps (proposed — Stephen approves)

| Cap | Current | Proposed |
|---|---|---|
| `MAX_PER_CALL` (earnHashes) | 200 | 200 ✓ |
| `MAX_PER_MINUTE` (earnHashes) | 300 per uid | 300 ✓ |
| `MAX_PER_DAY` (earnHashes) | 5000 per uid | 5000 ✓ |
| `CLAIM_CAP` (first claim from anon) | 100 | **500 for first claim per uid, 100 thereafter** |
| `PENDING_DAILY_CAP` | 50 per day | **150 per day** (better matches casual play) |
| Cosmetics price range (proposed) | n/a | 50–500 sunbeams (most around 100) |

Caps stay private constants, never echoed in error messages or response bodies.

---

## 4. The safety discipline (non-negotiable)

These are the rules I'll work under for everything below. If a future request would violate one, I'll surface it first.

1. **One source per game.** Every game's logic lives in exactly one file. Edit there. Everything else (LW, shells, future portals) loads it. No copy-paste.
2. **Contract tests, not faith.** Anything that needs to stay in sync (`_G`, earn amounts, anti-farm guards) gets a test that fails on divergence.
3. **Server-authoritative spending.** Every operation that DECREMENTS a balance — minting, cosmetics purchase, future trades — runs in a Cloud Function with an atomic Firestore transaction. Clients can request; they never decide.
4. **Anonymous-first reads.** Catalogs, leaderboards, public profiles all readable without auth. Only writes require uid.
5. **Cosmetics are visual-only.** No gameplay effects. Ever. Pay-to-win destroys both retention and balance.
6. **Additive deploys.** Cosmetics catalog, `spendSunbeams`, SDK additions all ship without touching `index.html`. The LW main file is treated as load-bearing.
7. **Migration discipline.** Never break existing storage keys. `sws_hash_ledger`, `sws_greenhouse`, `pw_readyHashes` are sacred. Renaming = data loss.
8. **Per-game integration is opt-in.** A game that doesn't read cosmetics still works. Forward-compatible by default.
9. **Anti-farm caps are private constants.** Same as `claimPending` — never in error messages or response payloads.

---

## 5. Phased rollout

### Phase 0 — shipped already ✓

- Sunbeam SDK v2 (anonymous earn, claim, balance)
- `claimPending` Cloud Function (private caps, atomic txn)
- `/play/` shell template + 10 first-wave games
- Portal at `/portal/` (LW cards link to hub)
- Deep-link router in LW (works for returning signed-in players)
- Screenshots, smoke harnesses (LW 15/15 + shells 10/10 green)

### Phase 1 — drift prevention (small, ~half day)

- `shared/_G_contract.md` — locked spec
- `scripts/test_g_contract.js` — fails CI if LW and shell `_G` diverge
- Document earn-amount tables side by side; reconcile any unexplained differences
- **No code changes to `index.html` or any game.** Just spec + test.

### Phase 2 — cosmetics MVP (3–4 days)

1. **Catalog schema in Firestore** (`catalog/cosmetics`), admin-write rules, ~10 starter SKUs across 3 games.
2. **`spendSunbeams` Cloud Function** + Firestore rules update for `vaults/{uid}.cosmeticsInventory` / `.cosmeticsEquipped` (owner read, server write for `Inventory`, owner write for `Equipped` validated against `Inventory`).
3. **SDK additions:** `catalog()`, `inventory()`, `spend(sku, gameId)`, `equip(sku, gameId)`, `onInventoryChange(cb)`.
4. **Shop UI in shells** — `play/shop.html` lets signed-in players browse + buy + equip. Anonymous → sign-in modal.
5. **Per-game render hook** for the first 3 cosmetics-supporting games (Simon skin, Memory back, Lights particles). Each game change is a small additive read at mount-time — backward compatible.
6. **Smoke test** for the spend → equip → render loop.

### Phase 3 — wave 2 of game shells (1–2 days)

Bring more modular games into `/play/`:
- Wave 2 (no external deps): `colorsort`, `rootrush`, `picross`, `gardenlines`, `kakuro`, `mosaic`, `rootflow`, `rootmaze`, `petalfall`, `petalmatch`, `sprout`, `numbergarden`, `recall`, `pottingbench`, `pipe`, `pollen`, `seedsow`, `seedtoss2`, `vinecross`, `c4`, `battleship`, `chess`, `dailybloom`
- Wave 3 (needs `_cards.js` shell-side loader): `klondike`, `spider`, `freecell`, `pyramid`, `tripeaks`, `golf`, `cribbage`, `bowergarden`, `bleedinghearts`, `gardenspades`, `juniper`
- Wave 4 (needs `vinewords-dict.js`): `vinewords`, `trellis`, `wordsearch`
- Wave 5 (audio/worker): `song`, `bloomwheel`, `breathing`, `rhythmvine`, `livingstones`, `colorgarden`, `pixelgarden`, `storyseeds`, `stonegarden`

Each wave is a few hours of work to bring up + verify. Test in jsdom + manual real-browser spot-check.

### Phase 4 — inline-game extraction (the lift, ~3–5 days)

The 11 inline games in `index.html` need to come out. Each extraction:
1. Identify the game's function block by id (e.g. `set`, `backgammon`).
2. Cut it into `/games/<id>.js` (new modular file).
3. Adjust its `_G`-style references to use the standard pattern.
4. Verify the existing LW path still works (just loads from the new external file).
5. Add a `/play/<id>.html` shell once the extraction is clean.

This DOES touch `index.html` — each extraction removes a code block. Highest-risk phase. Do these ONE AT A TIME, smoke-test between each, never bundle.

### Phase 5 (someday, if ever) — `_G` deduplication

When Phase 4 is done and we're confident, extract `_G` to `shared/lwlib.js` and replace LW's inline definition with a `<script src>`. The contract test guarantees behavioral parity; this just removes the duplication.

---

## 6. Risk register

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| `_G` API drift causes a game to break in one surface but not the other | High | Medium | Phase 1 contract test |
| Cosmetic accidentally affects gameplay | High | Low | Hard rule in catalog spec; code reviews |
| First-claim cap too low → players feel robbed at signup | Medium | High | Tunable; recommend 500 for first claim |
| First-claim cap too high → trivial fraud (mint anon sunbeams from script, claim, repeat) | High | Low | Server checks anonId uniqueness; rate-limit per-IP at Functions layer if needed |
| Inline-game extraction breaks a game in LW | High | Medium | One game at a time + smoke after each + manual play-test |
| Cross-domain SDK init fails (Firebase auth domain not whitelisted) | Medium | Low | Each new domain added to Firebase console BEFORE deploy |
| Cosmetic asset URLs 404 | Low | Medium | Catalog rule: `art` field required + URL-validated at admin write |
| Storage migration loses player data | Critical | Low | Never rename keys. New keys for new state. |
| SDK version drift on host pages (Glyph Forge etc. caching old SDK) | Medium | Medium | Cache-bust `?v=N` on every SDK release |

---

## 7. Open design calls — need Stephen's answer

These block specific phases. Ranked by urgency.

1. **First-claim cap.** Should an anonymous player get up to 500 sunbeams on first sign-in claim? Or stay strict at 100 to discourage anon grinding? **(Blocks Phase 2 tuning.)**

2. **Daily claim cap.** Bump `PENDING_DAILY_CAP` from 50 to 150? Or keep tight? **(Blocks Phase 2 tuning.)**

3. **Cosmetics scope per game.** Skin (full re-art) only? Or also back-cards, particles, frames? **(Affects catalog data model.)**

4. **Cross-game ("studio") cosmetics.** Avatar, profile frame, sign-in animation — visible across LW + every shell. Worth shipping in Phase 2 or save for later? **(Affects catalog + SDK shape.)**

5. **Cosmetics price floor + ceiling.** Proposed 50–500 sunbeams. Tighter? Wider? **(Affects economy balance.)**

6. **Trading / gifting cosmetics.** Out of scope for Phase 2 or stretch goal? **(Affects vault schema — easy to add later if punted now.)**

7. **Seasonal / time-gated cosmetics.** Want this in Phase 2 catalog spec, or simpler "available: bool" only? **(Affects catalog spec.)**

8. **Should shell + LW share an anti-farm session cap?** Right now each surface counts independently. A player could rotate shells to bypass session caps. Worth fixing or not a practical concern? **(Affects shell.js earn logic.)**

9. **Refund window on accidental cosmetic purchase?** "Refund within 24h if not equipped" — friendly, but adds state complexity. Keep simple "no refunds" for v1? **(Affects spend Cloud Function.)**

10. **Inline-game extraction order.** Which inline game gets extracted first? Recommend `mastermind` (small, self-contained, low risk). Or pick a specific one? **(Sequences Phase 4.)**

Once you've answered each of these (even briefly), I can sequence Phase 1 + Phase 2 cleanly with no second-guessing.

---

## 8. What this DOESN'T solve

- **Onboarding still blocks the LW deep-link for anon players.** Option B from before — still rejected. Shells are the answer.
- **Mobile keyboard / scroll friction in some games.** Game-by-game UX work, not architectural.
- **Pi Network integration for shells.** Shells are agnostic about Pi today — they use Firebase Auth only. If you want shells to support Pi payments for cosmetics, that's a separate integration. Mention it and I'll scope.
- **NFT extraction of plants.** Out of scope here; lives in the existing `project_cloud_function_migration_plan.md` memory.

---

*End. Reply with answers to §7 and I'll start Phase 1.*
