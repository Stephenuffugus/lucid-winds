# Studio Earn Bridge — handoff for SKY WOLF STUDIOS games

> **For:** the Claude Code instance working in each studio-game repo
> (sixfold, glyph_forge, Sweet-Spot, Tarot_Run, HUNCH).
> **Date:** 2026-06-18 · **Status:** LW host side SHIPPED (LW_VERSION `2026.06.18.03`). Game side TODO.

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

3. **Call `Sunbeam.earn()` on real scoring events.** This is the part that's
   currently missing in every game — none of them call `earn()` at all yet:
   ```js
   Sunbeam.earn(5, 'win');        // e.g. on a win
   Sunbeam.earn(1, 'combo');      // smaller drips for sub-events
   ```
   Pick amounts that fit LW's economy: **30 sunbeams = 1 plant.** A casual
   session should land in the tens, not hundreds. Per-call cap is 200; the LW
   host additionally throttles to 400/min and the server enforces 300/min +
   5000/day. Keep per-game yields modest and comparable to the native LW games
   (a native win is a few sunbeams).

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
