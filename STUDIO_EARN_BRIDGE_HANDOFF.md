# Studio Earn Bridge — handoff for SKY WOLF STUDIOS games

> **For:** the Claude Code instance working in each studio-game repo
> (sixfold, glyph_forge, Sweet-Spot, Tarot_Run, HUNCH).
> **Date:** 2026-06-18 · **Status:** LW host side SHIPPED (LW_VERSION `2026.06.18.04`). Game side TODO.

> ## ⚠️ Host-authoritative payouts — read this first
> Lucid Winds decides how many sunbeams each event is worth, from a central
> rate card + a daily per-game taper in the LW host. **Your game does NOT set
> the payout.** You just call `Sunbeam.earn(n, '<event>')` where the **second
> arg is an EVENT LABEL** (`'win'`, `'combo'`) — the host reads that label,
> ignores `n`, and credits its own amount. (`n` still matters when your game
> runs *standalone* outside Lucid Winds, so pass a sensible number anyway.)
> Use stable, lowercase event labels. Current card: `win` (sixfold/sweetspot 3,
> glyphforge/tarotrun 4; unknown game defaults to 3), `combo` 1. First 8 wins
> /game/day pay full, then taper ×0.8 → floor 1, daily reset. To change a
> payout, edit `STUDIO_RATES` in LW `index.html` — not your game.

## Why this exists

These games are embedded in the Lucid Winds GAME tab via an `<iframe>` (the
`ext:` field in LW's `G[]` registry). They run on their **own origin**
(`stephenuffugus.github.io` or `hunch-mauve.vercel.app`), and the Sunbeam SDK
earns into **that origin's** `localStorage`. Lucid Winds runs on
`lucidwinds.com` and **can never read another origin's localStorage** — so as
shipped, anything these games "earn" is stranded and the player's LW wallet
stays at zero. (This is the documented cross-origin gotcha in `SUNBEAM_SDK.md`.)

The fix is a `postMessage` bridge. **The LW host side is already done and live.**
What's left is the game side.

## How the bridge works

```
Studio game (iframe, github.io/vercel)              Lucid Winds host (lucidwinds.com)
  Sunbeam.earn(5, 'win')                              window 'message' listener
    └─ also posts to parent:           ─────────▶       ├─ validates ev.origin ∈ allowlist
       {source:'sunbeam-sdk',                            ├─ validates {source,type,amount}
        type:'earn', amount:5, src:'win'}                ├─ clamps amount (≤200/msg, ≤400/min)
                                                         └─ window.earnHashes(amount) → server ledger
```

The host listener is at `index.html` (search `Studio earn bridge`). It only
credits messages from these exact origins:

- `https://stephenuffugus.github.io`  ← all of Stephen's github.io games share this one origin
- `https://hunch-mauve.vercel.app`

If a game ever moves to a new origin, add it to `STUDIO_ORIGINS` in LW's
`index.html` (one line) or it won't earn.

## What each game must do (3 steps)

1. **Vendor the updated `sunbeam-sdk.js`.** Copy the canonical SDK from the
   Lucid Winds repo (`/sunbeam-sdk.js`, version with the "Cross-origin host
   bridge" block in `earn()`). The new block posts every earn up to the parent
   when embedded — additive, no-op when the game runs standalone. Do not
   hand-edit a fork; re-vendor the whole file so it stays in sync.

2. **Init the SDK once** at startup:
   ```js
   Sunbeam.init({ gameId: 'sixfold' });   // use the game's id
   ```

3. **Call `Sunbeam.earn(n, '<event>')` on real scoring events**, using an
   **EVENT LABEL** as the 2nd arg. This is the part that's currently missing in
   every game — none of them call `earn()` at all yet:
   ```js
   Sunbeam.earn(3, 'win');        // 2nd arg is the EVENT — host decides the in-LW payout
   Sunbeam.earn(1, 'combo');      // smaller drips for sub-events
   ```
   **30 sunbeams = 1 plant.** Inside Lucid Winds the host ignores `n` and pays
   from its rate card based on the event label (see the box at the top), so you
   don't tune the in-LW amount — just emit clean labels at the right moments.
   The `n` you pass is still used when the game runs **standalone** outside LW,
   so keep it sane (a win ≈ a few sunbeams, matching a native LW game). Don't
   double-fire `earn()` for a single reward.

## Testing the round-trip

1. Open Lucid Winds (web build, signed in) → GAME → SKY WOLF STUDIOS → the game.
2. Trigger a scoring event. In DevTools you should see the host receive the
   message and `earnHashes` fire.
3. Exit with ◀ GAMES — the LW header sunbeam count should reflect the earn
   (the host also re-pulls the cloud vault on exit via `_lwExtGameResync`).

## Notes / guardrails

- **Trust model:** the iframe is untrusted, but it's Stephen's own game and the
  server (`earnHashes` Cloud Function) re-applies hard caps, so a misbehaving
  game can't inflate the economy beyond 5000/day.
- **Don't double-count:** only call `earn()` once per real reward. The bridge
  forwards every `earn()` call verbatim.
- **Same-origin satellites** (Hue Match, Shell Shuffle under `lucidwinds.com/satellites/`)
  do NOT use this bridge — they share localStorage and are drained by the host's
  `_claimSunbeamBucket`. The host deliberately ignores their postMessages to
  avoid double-crediting. Only cross-origin studio games need this.
