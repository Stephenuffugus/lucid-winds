# 🧠 THE BRAIN — Lucid Winds / Sky Wolf Studios knowledge index

> **Read this first.** This is the master map of every durable fact about
> the project: where it lives, whether it's live or draft, and what's known
> to be stale. The goal is *one source of truth per fact* and zero drift.
>
> This index is **non-destructive** — it points at canonical files *in
> place*. Files marked 🔒 are pinned to a live URL or deploy path and must
> **not** be moved or renamed. Files marked ✍️ are drafts, not yet live.
> Files marked ⚠️ have a known staleness issue (see `STALENESS.md`).
>
> Maintenance discipline lives in `MAINTENANCE.md`. Keep this index current:
> if you add or retire a doc, edit the relevant domain block below in the
> same commit.

---

## How the knowledge is layered

| Layer | What it is | Auto-loaded? | Use for |
|---|---|---|---|
| **`CLAUDE.md`** (repo root) 🔒 | The operating manual + source of truth pointers. | ✅ every session | Rules, glossary, the non-negotiables. Keep it the *map*, push depth into the brain. |
| **`.claude/.../memory/`** | Cross-session recall: sessions, feedback, user. `MEMORY.md` is the index. ⚠️ over size limit. | ✅ relevant slices | "What happened / what did Stephen decide / how do I work." |
| **`docs/brain/` (this tree)** | Durable, polished domain reference. | ❌ read on demand | Deep facts about a system. The thing you read before changing it. |
| **Domain files (root + `docs/`)** | The actual specs, manifests, handoffs. | ❌ | The detail. Indexed below. |

CLAUDE.md = the dashboard. The brain = the engine bay. Memory = the logbook.

---

## Domains

### 1 · Economy, rarity & generation
The numbers that must never drift. **Canonical:** `CLAUDE.md` (economy table,
Terra Grade Variant G, trait system, EA, seasons, override table).
- `HAIKU_COHESION_RULES.md` — 7-5-7 haiku engine rules
- `NAME_GENERATION_RULES.md` — procedural plant naming
- `FORAGING_DIFFICULTY_SPEC.md` + `docs/FORAGING_GAME_SPEC.md` — forage difficulty/curve
- ⚠️ Rarity is **Variant G** live; some docs still say Variant F. See `STALENESS.md`.

### 2 · Game systems
The deep mechanics layered on top of plants.
- `docs/COMPANION_SYSTEM_SPEC.md` · `docs/COMPANION_FAMILIES_DRAFT.md` ✍️ · `docs/COMPANION_ITEMS_REVIEW_DRAFT.md` ✍️ · `docs/COMPANION_ITEMS_REVIEW_LLM_PROMPT.md`
- `docs/XP_REWARD_ARCHITECTURE.md` — XP / levels / rewards
- `docs/TUTORIAL_PROGRESSION.md` — onboarding tutorial steps
- `docs/scavenger-hunt-design.md` ✍️ · `docs/bos-consolidation-plan.md`
- Items / Tree / Classes / Prestige / Climate / Wild — **canonical in `CLAUDE.md`** today (no standalone file yet — digest candidate).

### 3 · Engine & architecture
How the single-file app is built.
- `ENGINE_ARCHITECTURE.md` — engine internals
- `CLAUDE.md` → Script Block Map + Critical Architecture Rules
- ES5 / IIFE / window-exposure rules live in `CLAUDE.md`.

### 4 · Games catalog
- `GAMES_MANIFEST.md` — the 66 LW games (source of truth for the catalog)
- `docs/systems.html` — rendered systems overview
- Inline-vs-modular game rule: **edit `/games/<id>.js`**, inline copies are dead (memory: `feedback_modular_games_canonical`).

### 5 · Studio, portal & sunbeams (Sky Wolf Studios)
The cross-game currency + satellite portal.
- `STUDIO_PLAN.md` — the studio + cosmetics + phase plan
- `SUNBEAM_SDK.md` 🔒 — SDK internals + cross-origin satellite reality
- `PARTNER_INTEGRATION.md` 🔒 — external partner contract (served at `lucidwinds.com/PARTNER_INTEGRATION.md`)
- `sunbeam-sdk.js` 🔒 — served at `lucidwinds.com/sunbeam-sdk.js?v=2`; partners load it cross-origin, **never fork**
- `NEW_GAME_PROMPT.md` — paste-ready onboarding for a new satellite ⚠️ earn numbers run ~2× hot vs live (`EARN_AUDIT.md`)
- `EARN_AUDIT.md` — LW vs shell sunbeam parity (Option B shipped: shells pay `game_win:4`)
- `portal/index.html` — the `FEATURED` array + the 66-game grid
- `play/*.html` + `play/shell.js` — standalone game shells (flat `EARN` table)

### 6 · Deploy & infrastructure
- `PI_DEPLOY.md` — Pi Browser deploy
- `HOSTINGER_SUBDOMAIN_HANDOFF.md` — Hostinger / subdomain deploy
- Firebase: `firestore-rules-7.txt` (live rules), `firebase.json`, `.firebaserc`, `functions/` (Cloud Functions). Canonical config notes in `CLAUDE.md`.

### 7 · Legal & submission
- `PRIVACY_POLICY_DRAFT.md` ✍️ · `TERMS_OF_SERVICE_DRAFT.md` ✍️ (live pages: `privacy.html`, `terms.html`)
- `submission-prep.md` — app store / Pi submission prep
- `security-state.md` — security posture snapshot
- `LICENSE.md`

### 8 · Art (Stephen's domain — tracking only)
> **Stephen makes all the art.** These track needs/handoffs; Claude wires art in, never generates it.
- `ART_MANIFEST.md` · `ART_NEEDS.md` · `ART_TODO.md` · `docs/art-handoff-apr27.md`

### 9 · Session history
Narrative logs of what shipped when.
- `docs/sessions/` (repo) + the `project_session_*` files in memory.

---

## Quick "where do I look?" table

| I'm about to touch… | Read first |
|---|---|
| Rarity / drop rates / economy | `CLAUDE.md` §Economy + §Terra Grade, then `STALENESS.md` |
| A mini-game | `GAMES_MANIFEST.md`, `/games/<id>.js` |
| The sunbeam economy / a satellite | Domain 5 above, `EARN_AUDIT.md` |
| Onboarding a new partner game | `NEW_GAME_PROMPT.md` (use de-engineered earn numbers) |
| Companions / items / tree | Domain 2 + `CLAUDE.md` |
| Firebase / Cloud Functions | `CLAUDE.md` §Firebase/§Cloud Functions, `functions/` |
| Anything user-facing legal | Domain 7 |

---

*Spine files: `INDEX.md` (this), `MAINTENANCE.md` (the discipline),
`STALENESS.md` (the known-drift list). Everything else is indexed above.*
