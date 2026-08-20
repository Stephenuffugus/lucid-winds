# REPO-MAP — every GitHub repo, classified — 2026-08-20

Verified live via `gh` on 2026-08-20, not from memory. Re-derive with:
`gh repo list Stephenuffugus --limit 100 --json name,isArchived,diskUsage,pushedAt`
and per-repo Pages source via `gh api repos/Stephenuffugus/<repo>/pages`.

**The token used only sees PUBLIC repos.** `sws-memory` (private) exists and is
in category 1; if other private repos exist they are not in this map.

Since the 2026-08-07 audit, `word_stack`, `resume`, and `inspect_evals` have
already been deleted. 25 public repos + 1 known private remain.

---

## 1. ⛔ NEVER TOUCH (2)

| repo | why |
|---|---|
| **lucid-winds** | The mothership. Hostinger auto-deploys `main`; working branch is `add-sproing-jumper`, deploy = `git push origin add-sproing-jumper:main`. 3.1 GB `.git` is KNOWN and ACCEPTED (Steam build assets, app 5043360). No history rewrites, no branch "cleanup", no merges to tidy it. |
| **sws-memory** (private) | The dev session's persistent memory backup. Off-limits to any cleanup. |

## 2. 🔧 VENDORED UPSTREAMS — keep ACTIVE, never archive, never delete (12)

These are the **source of truth** for 13 arcade cards served from
`lucidwinds.com/satellites/<slug>/`. The pipeline is fix-upstream → re-vendor
(`VENDORING.md` in lucid-winds is the full account). Archiving makes a repo
read-only and **breaks the fix pipeline**; deleting orphans the vendored copy.

| repo | serves card | Pages branch | ⚠ |
|---|---|---|---|
| BarBrawl | Wild Wardens | **`deploy`** | Pages branch ≠ default. Deleting "stale" branches kills it. |
| Tarot_Run | Tarot Run | **`setup/project-structure`** | Same trap. |
| Tomato_Man | Tomato Man | main | |
| abduct_a_chameleon | Chameleon 2D + 3D (2 cards) | main | |
| glyph_forge | Glyph Forge | main | |
| Litter_Bug | Litter Bug | main | |
| Sweet-Spot | Sweet Spot | main | |
| sixfold | Sixfold | main | |
| letter_launch | Letter Launch | main | |
| skitterlings | Skitterlings | main | |
| Tally | Tally | main (vite → dist/) | |
| Hunch | HUNCH | none — deploys via **Vercel** (hunch-mauve.vercel.app) | Repo is the only source. Leaderboard 500s on prod (Upstash creds — Stephen). |

## 3. 🌐 STILL LIVE OFF-ORIGIN (1)

| repo | why |
|---|---|
| **pompond** | The LAST portal card iframing an external host: `pom-pond.web.app` (Firebase). Repo is the only source. Keep; candidate for vendoring same-origin like the other 13. |

## 4. 🚧 ACTIVE PROJECTS — keep (5)

| repo | what |
|---|---|
| SWS-apps | The apps monorepo (the Aug 7 recommendation, realized). Pushed today. |
| aura-farm | Live at `/satellites/aura-farm/` but **NOT on the vendor pipeline** (no `VENDORED.json`) — two sources exist with no drift guard. Should be added to the vendor manifest. |
| create-a-critter | Same situation as aura-farm. Live at `/satellites/create-a-critter/`, not on the vendor pipeline. |
| astravault | Star-gazing/collecting app. |
| trackfit | Real app with go-live + monetize handoff docs. Not part of the arcade fleet. |

## 5. 📦 DORMANT SOURCE — archiving is fine (reversible), deleting never (4)

Games ship from `satellites/` copies inside lucid-winds; these repos hold the
FULLER source (sw.js, tests, docs, reference art the satellite copies lack —
Aug 7 audit). `scripts/pub_build.py` builds publisher ZIPs from `satellites/`,
not from these.

shell_shuffle · Hues · Blooming_Words · skywolf-pitbike-rally
(pitbike especially: 827 blobs of source + reference art vs 87 frozen snapshots
in the satellite — unarchive before any future update to the game)

## 6. 🗑️ ARCHIVE NOW — empty or non-game (3)

| repo | why safe |
|---|---|
| Sports-R-D | 0 KB, empty, untouched since March. |
| starfall | README only — an idea stub, no code. |
| plainsight | Political tool, not a game. Aug 7 recommendation: archive, don't delete. |

---

## GLOBAL RULES for any cleanup

1. **Archive, never delete.** Archiving is read-only + reversible; Pages keeps serving.
2. **No history rewrites anywhere** — especially not lucid-winds.
3. **No branch deletion** without checking the repo's Pages source branch first
   (BarBrawl and Tarot_Run serve from non-default branches).
4. **No org transfer** without a coordinated plan — it changes every
   `stephenuffugus.github.io/*` URL; external links (publishers, Steam,
   Listdle) point at some of them. Decide the org question once, move once.
5. **Never hand-edit `satellites/<slug>/` for a vendored game** — fix upstream,
   re-vendor. `node scripts/vendor_satellites.mjs --check` must read CLEAN.
6. Before proposing work in lucid-winds, read `HANDOFF.md`, `VENDORING.md`,
   `DONE-LEDGER.md` at repo root.
