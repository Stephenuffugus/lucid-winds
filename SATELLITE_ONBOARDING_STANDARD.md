# Satellite Onboarding Standard
### The rule + checklist for adding a Sky Wolf Studios satellite to the Lucid Winds ecosystem

> **THE RULE:** No satellite is "done" until every box below is checked in BOTH
> surfaces (the Lucid Winds app GAME tab **and** the portal). A game that earns
> in one place but not the other, or shows in one grid but not the other, is a
> half-integration and will read to players as "broken / not synced."
>
> **Reference implementation:** Skitterlings (June 2026). Copy its wiring.

---

## 0. Build & host the satellite the RIGHT way (no frozen snapshots)
- [ ] Satellite lives in **its own repo/codespace** and auto-deploys to
      `https://stephenuffugus.github.io/<game>/` on every push.
- [ ] Lucid Winds **iframes the LIVE github.io URL** — it does **NOT** keep a
      copy of the game files. (Self-hosting a snapshot under `/satellites/<game>/`
      is the stale-build trap: it goes stale the instant the dev pushes again,
      and a per-satellite service worker pins players to the old build past a
      history clear. See `project_skitterlings_stale_build_jun28`.)
- [ ] The embedded build must **NOT register its own service worker**. lucidwinds.com
      already edge-caches; a satellite SW that calls `location.reload()` inside our
      iframe causes the staleness. (Standalone github.io build may keep its SW.)
- [ ] The game exposes a visible **build stamp** on its title screen so we can
      verify the live build is current at a glance.

## 1. Wire into BOTH surfaces (identical URL)
- [ ] **App** (`index.html`, the `G[]` registry, "SKY WOLF STUDIOS" block):
      `{id:'<id>', n:'<Name>', i:'<emoji>', r:'<desc>', cat:'studio',
        ext:'https://stephenuffugus.github.io/<game>/?embed=1&origin=https://lucidwinds.com',
        thumb:'portal-assets/thumbs/<id>.png'}`
- [ ] **Portal** (`portal/index.html`): a matching entry pointing at the **same**
      live URL.
- [ ] Both use the **same `?embed=1&origin=https://lucidwinds.com`** launch params.

## 2. Sunbeam generation — CALCULATE it, host owns the rate
- [ ] Pick the earn signal the game emits: **per-run** (`game-over`),
      **per-event** (`win`/`combo`/`milestone` via the Sunbeam SDK `earn`
      message), or an **attention heartbeat** (~5s while genuinely playing).
- [ ] **The host sets the payout, never the game.** Add the rate to
      `STUDIO_RATES` (event games) or a dedicated handler (heartbeat/run games)
      in `index.html`'s studio earn bridge (~line 62930).
- [ ] **Anchor to the existing rate card** so it's not wildly more/less generous
      than sibling games (~3 sunbeams/min of engaged play is the ballpark;
      per-run ≈ 1, long run ≈ 2). 30 sunbeams = 1 plant — keep that in mind.
- [ ] **Anti-farm, every time:** a minimum-play floor (so insta-quitting earns
      nothing), a per-game **daily cap**, and the shared per-minute backstop.
      Server caps (300/min, 5000/day) are the final backstop.
- [ ] The game's **origin is in `STUDIO_ORIGINS`** (github.io already is).
- [ ] **TEST:** a real session credits sunbeams **in both the app and the portal**
      (see §3 — the portal must actually run the earn listener).

## 3. SYNC — same wallet & unlocks in the portal AND the app
*(This is the one Stephen flagged. The app and portal are same-origin
(lucidwinds.com) so they share localStorage + Firebase, but they can still
diverge — verify all of this for each satellite.)*
- [ ] **Sunbeam balance reads the same number in both surfaces.**
      ⚠️ **KNOWN ARCHITECTURE GAP (audited Jun 2026 — fix pending Director call):**
      there is **no single sunbeam store.** The APP's headline number reads the
      **queue** (`pw_readyHashes`/`pw_hashFilled` → server `meta/state.readyHashes`).
      The PORTAL reads the **SDK** view (anon: `sws_pending_sunbeams`; signed-in:
      server `hashLedger`). These are **two parallel server ledgers that don't
      reconcile both ways** — so app-earned sunbeams don't show in the portal, and
      portal-earned sunbeams only reach the app same-device. Until the wallet is
      unified onto ONE store, "synced" is not actually true. See the sync audit /
      the Director decision below.
- [ ] **Satellite earns reach a host listener in BOTH surfaces.**
      ⚠️ Today: the APP frames `ext:` satellites and credits them via the studio
      bridge (works). The PORTAL opens a featured off-origin satellite as a **bare
      `href` = full-page navigation** — the portal unloads, the game runs top-level
      with no parent frame, and **its earns go nowhere.** The portal also has no
      satellite-earn listener. So a github.io satellite earns from the app but
      **earns 0 from the portal.** (This is why "Skitterlings runs very different.")
      A new satellite is NOT synced until this path is fixed for the portal too.
- [ ] **The satellite's own progress** (coins/worlds/collection) lives in the
      satellite's github.io localStorage — consistent across both embeddings
      because both load the same github.io origin. If cross-device save is
      needed, route it through the host save-bridge into
      `vaults/{uid}/satellites/<game>` — **never a separate Firestore**
      (cross-origin auth makes a separate DB insecure + redundant; see the
      "separate Firestore?" ruling, Jun 2026).

## 4. Ecosystem integration (the studio polish)
- [ ] **Feedback button** covers the satellite. The portal's floating feedback
      FAB already covers framed games; confirm it shows while the satellite is
      open. (See `feedback.js` / `LW_Feedback.mountFab`.)
- [ ] **Status badge** if not fully ready: `wip:true` (app → "COMING SOON",
      non-launchable) / `soon`/`beta` in the portal. Never ship a tappable game
      that opens into something half-built.
- [ ] **Pi Browser:** external (`ext:` not starting with `/`) games are hidden in
      Pi Browser automatically (Pi forbids external content) — they show a
      "play at lucidwinds.com" note. Confirm that's acceptable for the game.
- [ ] **Disclaimers:** add any the game needs (age rating, external-origin note,
      "in development", real-money/ads = NONE allowed in the free-to-play
      mission). HUNCH-style premium/AI-cost games stay OFF the `G[]` list.
- [ ] **Thumbnail:** ≤ ~150 KB, ≤ ~480 px. Drop the optimized PNG into
      `portal-assets/thumbs/` (and a screenshot in `portal-assets/screenshots/`
      if the portal uses one). **Never** commit full-res art here — that's the
      grid-killer that caused the slow-load / broken-image bug. (See
      `reference_thumbnail_perf`.)
- [ ] **Cache-busting:** the live external URL is always fresh; app thumbnails
      bust via `?v=LW_VERSION`; bump the portal `_tv` stamp when thumb files
      change.

## 5. Verify before calling it done
- [ ] Build stamp on the title screen reads the **current** version in BOTH the
      app and the portal.
- [ ] A real play session **credits sunbeams in BOTH** the app and the portal,
      at the intended rate, and respects the daily cap.
- [ ] Feedback button is present and reaches the inbox.
- [ ] Grid loads fast (thumbnail optimized).
- [ ] No console errors when framed.
- [ ] `node scripts/smoke.js` is green; `LW_VERSION` bumped.

---

## When the satellite dev ships a new build
Nothing to re-copy (we iframe the live URL). Just optionally verify the new
build stamp shows and that the earn signals still match what our bridge expects.
If a satellite ever changes its postMessage event shape, update the host
listener to match — that's the only thing that breaks earning.
