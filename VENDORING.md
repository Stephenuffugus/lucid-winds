# VENDORING — the thirteen games that used to live on someone else's origin

**Short version:** thirteen arcade cards used to point at `stephenuffugus.github.io`
or `hunch-mauve.vercel.app`.
They are now served from `lucidwinds.com/satellites/<slug>/`. The **upstream repo
is still the source of truth**. Edit there, re-vendor here, bump the `?v=`.

```bash
node scripts/vendor_satellites.mjs --list             # the manifest
node scripts/vendor_satellites.mjs --check            # BEHIND / EDITED / CLEAN
node scripts/vendor_satellites.mjs --vendor <slug>    # re-copy one
node scripts/vendor_satellites.mjs --selftest         # prove the checks can fail
```

---

## Why

A Horizon Store app is a TWA. Any url outside its `scope` opens in a browser
overlay, and in a headset that means the player is ejected from the app. Thirteen
cards did that. They also could not be cached by the arcade's own service
worker, and they went down whenever GitHub Pages did.

**Correction worth keeping:** this was NOT ejecting players out of today's
installed web PWA. A cross-origin iframe stays inside the PWA window. The
ejection is TWA-specific. The live costs before the move were the service worker
collisions below, no offline, and the GitHub Pages dependency.

## Why this is a script and not a copy

A hand-vendored copy of Chameleon 3D was made once and correctly deleted again
on 2026-07-29 with the note *"one copy again, no drift"*. That instinct was right
about a hand copy. So:

- `VENDORED.json` in each folder records the repo, the **branch Pages serves**,
  the exact commit, and a sha256 for every file.
- `--check` answers three different questions and never conflates them:
  **BEHIND** upstream moved, re-vendor · **EDITED** somebody hand-edited the
  vendored copy, which is drift · **CLEAN** identical.

⛔ **Never hand-edit `satellites/<slug>/` for a vendored game.** `--check` will
catch you and the next `--vendor` will overwrite you. Fix it upstream.

## What Pages actually serves, per repo

Checked with `gh api repos/Stephenuffugus/<repo>/pages`, not assumed.

| slug | repo | ref Pages serves | build |
|---|---|---|---|
| tomato-man | Tomato_Man | main | none |
| abduct-a-chameleon | abduct_a_chameleon | main | none |
| glyph-forge | glyph_forge | main | none |
| litter-bug | Litter_Bug | main | none |
| sweet-spot | Sweet-Spot | main | none |
| tarot-run | Tarot_Run | **setup/project-structure** | none |
| sixfold | sixfold | main | none |
| letter-launch | letter_launch | main | none |
| skitterlings | skitterlings | main | none |
| wild-wardens | **BarBrawl** | **deploy** | none |
| tally | Tally | main | **vite, dist/** |

Three traps in that table, all of which produce a plausible wrong answer:

1. **Two repos do not serve their default branch.** Tarot Run serves
   `setup/project-structure`, Wild Wardens serves `deploy`.
2. **Tally is `build_type: workflow`.** Its repo tree is NOT its site; Vite
   builds `dist/`. Every other repo is `legacy`, where the branch tree IS the site.
3. **Resolve `origin/<ref>`, never the local branch.** The chameleon clone was
   parked on a `salvage` branch one commit behind live.

## The two recorded differences from upstream

Everything else is byte-identical. Both of these are re-applied on every vendor
and recorded in `VENDORED.json`.

- **`/arcade-exit.js` injected** into Chameleon, Chameleon 3D and Wild Wardens.
  Those three ship no exit at all, and a relative `/satellites/` url is a TOP
  LEVEL navigation, so there is no frame to close and no browser chrome in an
  installed PWA.
- **Wild Wardens path rewrite.** Expo bakes an absolute base url into its bundle
  (`/BarBrawl/`). ⛔ **Both forms are rewritten.** The bundle also carries
  `baseUrl":"/BarBrawl"` with no trailing slash, and that bare one is what the
  router matches routes against: fixing only the slashed form loaded every asset
  and still left every route unmatched, giving a 200, no console errors, and a
  "Page could not be found" screen.

## What moving them same-origin exposed

Every fleet check reads `satellites/`, so these twelve had been outside all of
them for their whole lives.

- **Nine service workers deleted every cache on the origin**, not just their own.
  On github.io they were already wiping each other. Same-origin the first one a
  player opened would have wiped the arcade shell, Lucid Winds, PadLab and Hush,
  which is exactly how the fleet went down once before. Fixed in all nine
  upstream repos. Guard: `node scripts/sw_cache_scope_check.mjs --fleet`, which
  runs each activate handler against a fake `caches` holding a neighbour.
- **47 dashes in player copy** across five games, plus **26 more** on Chameleon
  3D, which is carded separately at `abduct-3d.html` and had therefore never
  been swept at all.
- **Skitterlings' coin sync** used `.then(r => r.json()).catch(() => {})`, so a
  404 and a success were indistinguishable.
- **Ten exits** were improved: Litter Bug's was bound to one button and never
  exposed as `SWS_EXIT`; nine others reloaded the whole portal instead of
  stepping back to it.

## HUNCH: page vendored, functions stay on Vercel

HUNCH calls `/api/claude`, `/api/leaderboard` and `/api/report`, which are Vercel
serverless functions. Same-origin those paths would hit this repo's own `/api`
directory, so `api/` is dropped from the vendored copy and upstream now resolves
its API base by hostname: same-origin on `*.vercel.app` and localhost, absolute
Vercel url anywhere else. `window.HUNCH_API_BASE` still wins, for the native wrapper.

**That is safe for a TWA.** Only the XHR leaves the origin, never a navigation,
so nobody gets ejected. I first wrote this down as needing CORS work; that was
wrong. All three functions already send `Access-Control-Allow-Origin: *`, and
that was verified against the live deployment with a `lucidwinds.com` Origin
header rather than read off the source.

⚠ **HUNCH's leaderboard is broken on production right now**, and was before any
of this: `GET /api/leaderboard` returns `{"error":"TypeError: fetch failed"}`,
which is its Upstash Redis call failing. `report` and `claude` both answer fine.
Fixing it needs the Upstash credentials, so it is Stephen's. ⚖

## Known and not fixed

- **Tomato Man, Glyph Forge and Tarot Run 404 on some optional art slots.** They
  404 on github.io too, so this is pre-existing, and each has an `onerror`
  fallback. It is console noise, and closing it needs art or removing the slots.
- **Dev pages came along with the games.** Litter Bug ships six lab pages,
  Chameleon a level editor and a perf variant, Tomato Man an older `umbra-v4`.
  They were already public on github.io so nothing new is exposed, but they are
  reachable at lucidwinds.com now.
- **Share text and og:url still name github.io** in a few games. Cosmetic, but
  it means a shared score card points at the old home.
- **Wild Wardens' How To Play still contains a dash**, because that copy lives in
  the Expo bundle rather than in HTML, and the source is a pnpm monorepo on the
  repo's default branch.
