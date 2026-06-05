# 🧠 STALENESS — known doc drift to resolve

> The running list of facts that disagree across files. Each entry: where it's
> wrong, what's actually true, the source of truth, and status. When you fix
> one, **delete the entry** and drop the ⚠️ in `INDEX.md`. Keep this short —
> if it grows past ~6 open items, do a sweep.

Legend: 🔴 open · 🟢 fixed (delete on next pass) · ❓ needs verification

---

### 🟢 Mutation fire rate — CLAUDE.md said 12.1%, live is 7.4%
- **Where wrong:** `CLAUDE.md` §Terminology "Mutation byte" row — "Values ≥ `0xE1` … ≈ 12.1% of mints."
- **Truth:** Rebalanced 2026-05-03. None band is `0x00-0xEC` (92.6%), so mutations fire **7.4%**. Threshold is `0xED`, not `0xE1`.
- **Source of truth:** `index.html:11347` (MUTATION LADDER comment + bands).
- **Status:** fixed in CLAUDE.md this pass.

### 🟢 First-mint Common % — CLAUDE.md contradicted itself
- **Where wrong:** `CLAUDE.md` §Remaining Build Priorities — "First-mint Common % — currently 36% (Variant F), spec 42%."
- **Truth:** Live is **Variant G**; verified Common **26.6%** (N=100k sim, post-bank-expansion). The same file's §Terra Grade already states this. The Variant-F line is leftover.
- **Source of truth:** `CLAUDE.md` §Terra Grade distribution table + `scripts/rarity_sim.js`.
- **Status:** fixed in CLAUDE.md this pass.

### ❓ "27 game implementations" / "~26 script blocks"
- **Where:** `CLAUDE.md` §Script Block Map (Block 12 "27 game implementations"; header "~26 script blocks").
- **Question:** Catalog is **66 games** (`GAMES_MANIFEST.md`, portal grid) and memory `reference_full_inventory` says 67 mini-games. "27 implementations" may be a stale original count or may mean something narrower (distinct engine entry points). Needs a code check before changing — don't edit on assumption.
- **Source of truth:** `GAMES_MANIFEST.md` for the catalog count; `index.html` Block 12 for engine count.
- **Status:** open — verify what "implementations" counts, then reconcile.

### 🔴 NEW_GAME_PROMPT earn numbers run ~2× hot
- **Where:** `NEW_GAME_PROMPT.md` PART A step 3 — "win 5–12, session target 20–60."
- **Truth:** Live economy pays `game_win:4` (shells, `play/shell.js:106`) / median ~4 (LW `_aw`). Partner spec should be win 3–5, session 15–40, single required hook.
- **Source of truth:** `EARN_AUDIT.md` + `play/shell.js`.
- **Status:** open — de-engineer the partner prompt (proposed, pending Stephen's go).

### 🔴 MEMORY.md over size limit
- **Where:** `.claude/.../memory/MEMORY.md` — 37.4KB vs 24.4KB limit; only partially loaded each session.
- **Truth:** Index lines too long; detail belongs in topic files.
- **Fix:** Trim index entries to one short line each; push detail down. (Brain maintenance, low risk.)
- **Status:** open.
