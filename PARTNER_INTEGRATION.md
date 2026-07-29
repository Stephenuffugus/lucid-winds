# Sunbeam SDK — partner integration

> A 5-minute, one-script-tag integration that wires any web game into
> a shared currency network across the Sky Wolf Studios constellation.
>
> **Audience:** independent game developers / studios who want to plug
> their game into a working economy without building one. **The pitch:**
> your players keep earning when they leave your game. Ours keep earning
> when they leave ours. Everyone wins.

---

## What's in it for you

- **Instant economy.** Your game gets a real, persisted, server-validated
  currency without you running any backend.
- **Free cross-promo.** Your game appears in the Sky Wolf Studios portal
  (`lucidwinds.com/portal/`) alongside other partner games. Each card is a
  direct link to your hosted game.
- **Anonymous-friendly.** Players don't need to sign up to play your game
  or earn currency. They CAN sign up to keep it across devices and unlock
  spending paths (plants in Lucid Winds, cosmetics in any participating
  game).
- **No revenue split required for v1.** The integration is currency-only.
  When cosmetics ship, the spend split is negotiable per partner.
- **A shelf in the studio jukebox.** Integrated games can get their own
  shelf in the cross-game music player: tracks your players unlock in
  your game follow them into every other game in the studio, labeled
  with your game's name. Your soundtrack becomes a reason to visit the
  whole arcade — and the arcade becomes a reason to visit your game.

## What we get

- **Compounded retention.** Players who visit the orchard for one game
  discover the others. Network effects across the constellation.
- **Cross-game attention.** A player earning sunbeams in your game is a
  player engaged with a Sky Wolf Studios brand surface.
- **Coverage breadth.** Every additional game expands the studio's
  catalog — more reasons for players to keep the wallet open.

---

## The integration (3 minutes of actual work)

### Step 1 — load the SDK

Add one line to your game's HTML:

```html
<script src="https://lucidwinds.com/sunbeam-sdk.js?v=2"></script>
```

The SDK is ~13 KB, ES5-compatible, and lazy-loads Firebase compat from
gstatic.com on first use. It doesn't require any other client-side
dependencies, no build step, no bundler.

### Step 2 — initialize

In your game's bootstrap code:

```js
Sunbeam.init({ gameId: 'your-game-id' }).then(function(state){
  // state = { ready: true, signedIn: bool, uid: string|null, anonId: string }
  console.log('Sunbeam ready', state);
});
```

Pass a short, stable `gameId` (lowercase letters, digits, hyphens, max 32
chars). This identifies your game's events in our economy. We'll register
it on our side once you commit to integrating.

### Step 3 — award sunbeams on meaningful events

Inside your game, on the events that represent real player attention:

```js
function onLevelComplete() {
  Sunbeam.earn(3, 'your-game-id:level_complete');
}

function onCombo() {
  Sunbeam.earn(1, 'your-game-id:combo');
}

function onGameWin() {
  Sunbeam.earn(8, 'your-game-id:game_win');
}
```

That's it. If the player is signed in, the earn calls the server `earnHashes`
Cloud Function and credits their vault. If anonymous, the SDK accumulates
the amount in `localStorage` and reconciles to the vault when they sign in.

### Step 4 (optional) — show their balance

```js
Sunbeam.onChange(function(snap){
  document.getElementById('balance').textContent = 
    snap.confirmed + ' ☀ (+' + snap.pending + ' pending)';
});
```

Or read on demand:

```js
Sunbeam.balance().then(function(b){
  console.log('confirmed:', b.confirmed, 'pending:', b.pending);
});
```

That's the whole integration.

---

## Full API reference

| Method | Returns | Notes |
|---|---|---|
| `Sunbeam.init({ gameId })` | `Promise<{ready, signedIn, uid, gameId, version, anonId}>` | Call once. Auto-loads Firebase compat. Safe to call multiple times (subsequent calls are no-ops). |
| `Sunbeam.earn(amount, source)` | `Promise<{ok, balance, earned, pending}>` | `amount`: integer 1–200. `source`: short label (≤32 chars), recommended `"<gameId>:<event>"`. |
| `Sunbeam.balance()` | `Promise<{confirmed, pending}>` | `confirmed` is server-side; `pending` is local anon bucket. |
| `Sunbeam.claim()` | `Promise<{ok, credited, discarded, balance, pending}>` | Auto-fires on sign-in. Reconciles local pending to vault. |
| `Sunbeam.onChange(cb)` | unsubscribe fn | Fires immediately + on every balance/auth change. |
| `Sunbeam.isSignedIn()` | bool | |
| `Sunbeam.getCurrentUid()` | string \| null | |
| `Sunbeam.signInWithGoogle()` | `Promise<...>` | Popup with redirect fallback. Optional helper. |
| `Sunbeam.signOut()` | Promise | Optional helper. |

`Sunbeam.mintPlant()` exists in the SDK but is reserved for the Lucid Winds
hub. Other games don't use it.

---

## Rate limits

Server-enforced, per-uid:

- **200 sunbeams** maximum per single `earn()` call.
- **300 sunbeams/minute** maximum.
- **5000 sunbeams/day** maximum.

The day budget is **shared across all games** in the constellation — a
player can't grind 5000 in your game AND 5000 in another in the same day.
This protects the economy. For a casual game, 5000/day is a 5–10 hour
ceiling — far past normal play.

For the anonymous (pre-signup) path the SDK enforces its own client-side
caps too: 100/minute and 500/day. On claim, the server has separate caps
on what it'll accept from the anon bucket (silently discards excess).

---

## Setup we do on our end

Once you commit to integrating:

1. **Register your `gameId`** in our catalog so analytics + future
   cosmetics can target it.
2. **Add your domain** to our Firebase Auth authorized-domains list so
   `signInWithPopup` works on your origin. Takes one click on our side.
3. **Add your game to the portal** at `lucidwinds.com/portal/` with a
   card linking to your hosted URL and a screenshot you provide.

You don't need any Firebase / Google credentials of your own. The SDK
bundles our project config (public — only identifies the project, not a
secret).

---

## What you DON'T need

- A backend or database. We host the ledger.
- A user-account system. Players use Firebase Auth via the SDK.
- A CDN or build pipeline for the SDK. We host and version it.
- A revenue model. Currency-only for v1.
- TypeScript / framework matches. The SDK is plain ES5, drops into
  any stack from vanilla JS to React to Phaser.

---

## What we DO ask

1. **Earn amounts should reflect real attention.** A 1-second match
   shouldn't be worth 10 sunbeams. Calibrate so a casual session
   yields 20–60 sunbeams. We'll review during integration.
2. **No automation.** Don't `setInterval(()=>Sunbeam.earn(...), 100)`.
   The server will throttle you and we'll have to remove you.
3. **Sign-in is optional but encouraged in copy.** A subtle "sign in
   to save your sunbeams across every game in the studio" prompt
   converts well without being aggressive.
4. **Brand presence.** A small Sky Wolf Studios mark somewhere visible.
   We provide art.
5. **Honesty about cross-game currency.** Tell players sunbeams aren't
   exclusive to your game. Most players love it; surprises hurt trust.

---

## Cross-game spending (preview — shipping soon)

Phase 2 of the studio plan adds **cosmetics** as a sunbeam spend path:

- A central catalog of cosmetics — skins, card-backs, particles, frames.
- Per-game items (your cosmetics for your game) and studio-wide items
  (avatars, profile frames visible everywhere).
- Server-validated purchase via a new `Sunbeam.spend(sku, gameId)`
  method.
- An `equipped` hook each game reads at mount time to apply the player's
  chosen cosmetic.

When you integrate, you can choose to participate in the cosmetics
catalog at any time — just submit SKU specs. Pricing is collaborative.

Plant minting (the "growing unique living plant art" path) stays
exclusive to Lucid Winds. Your players spend sunbeams either there
(plants) or in their favorite games (cosmetics) — your choice on which
to feature.

---

## Example: a working integration

A complete external game page that earns sunbeams on level complete:

```html
<!DOCTYPE html>
<html>
<head>
<title>My Game</title>
<script src="https://lucidwinds.com/sunbeam-sdk.js?v=2"></script>
</head>
<body>
<div id="hud">
  ☀ <strong id="balance">—</strong>
  <button id="signin" style="display:none">Sign in to save</button>
</div>
<canvas id="game"></canvas>

<script>
  Sunbeam.init({ gameId: 'my-game' }).then(function(s){
    if (!s.signedIn) document.getElementById('signin').style.display = '';
  });

  Sunbeam.onChange(function(snap){
    document.getElementById('balance').textContent = 
      (snap.confirmed || 0) + (snap.pending > 0 ? ' (+' + snap.pending + ')' : '');
  });

  document.getElementById('signin').onclick = function(){
    Sunbeam.signInWithGoogle();
  };

  // ... your game code ...
  function onLevelComplete(level) {
    var reward = Math.min(level + 2, 12);
    Sunbeam.earn(reward, 'my-game:level_complete');
  }
</script>
</body>
</html>
```

That's a complete, working integration. Save it, host it, send us the
URL and your `gameId`.

---

## Who owns what (plain language, mirrored in the partner agreement)

- **Your game stays yours. Entirely.** Code, art, name, players,
  revenue — integrating changes none of it. We gain no rights to your
  game beyond showing its card in our portal.
- **The Sunbeam protocol stays ours.** The attention-verification
  protocol, the SDK, the economy design, and the server infrastructure
  are Sky Wolf Studios IP (patent pending). Integration grants you a
  **non-exclusive license** to use the SDK and APIs while you
  participate — a license, not a stake. No joint ownership is created
  in either direction.
- **Leaving is clean.** End the integration and your license ends with
  it; your game is untouched, and neither side keeps a claim on the
  other's work.
- **Why we spell this out:** the protocol is the studio's core asset
  and the subject of its patent filing. Clear license boundaries
  protect both of us — you can build on the integration knowing exactly
  what you have, and we can keep offering it knowing exactly what we
  keep.

---

## FAQ

**Q. Will my players need to sign up?**
A. No. Sunbeams accrue anonymously in `localStorage`. Sign-in is offered
when they want to keep currency across devices or spend it.

**Q. What if they sign in mid-session?**
A. The SDK auto-fires `claim()` on the auth state change. The anonymous
bucket gets reconciled to the vault (capped — see rate limits) and
clears.

**Q. What stops a player from cheating?**
A. Server-side rate limits + Firebase Auth ID-token validation on every
earn call. Anonymous earns are bounded by client-side caps and server
caps on claim. Determined attackers within the 5000/day cap can earn
the cap; beyond that, the function rejects.

**Q. What about Pi Network / non-Firebase auth?**
A. The current SDK uses Firebase Auth (Google, Email/Password,
Facebook). If your game targets Pi Browser, we can add a Pi-auth
companion in the SDK. Talk to us.

**Q. Can I see / control how my game earns events appear in analytics?**
A. Yes. Your `source` strings show up in our logs. We provide a partner
dashboard view (read-only) of total uid count and average sunbeams
earned per session in your game.

**Q. Can my players use sunbeams INSIDE my game (not via cosmetics)?**
A. Not yet — the v1 spend paths are plants in Lucid Winds + studio
cosmetics. If you want to add a custom in-game spend, we can build a
namespaced spend Cloud Function for your game. Let's talk.

**Q. What if I want to leave the network later?**
A. The integration is one script tag and a handful of API calls.
Remove them and your game keeps running. We retain player sunbeam
records for any continuing participation across other games.

**Q. Is there a contract?**
A. For v1, a lightweight partner agreement covers IP / branding /
abuse / fair-use clauses — the IP terms are exactly the "Who owns
what" section above, in contract form. No equity, no exclusivity, no
revenue split until cosmetics ship.

---

## Getting started

Send us:

1. Your game's hosted URL.
2. Your proposed `gameId` (short, lowercase, stable).
3. A 1200×800 screenshot or thumbnail for the portal card.
4. A 1–2 sentence game description for the card body.
5. Any custom event types you want to earn on (we'll suggest amounts).

Reply with a green light and a contact email, and we'll have your game
in the portal within 24 hours.

---

*Sky Wolf Studios · `lucidwinds.com` · This SDK is provided as-is for
integration with the Sunbeam economy. Source-of-truth at
`https://lucidwinds.com/sunbeam-sdk.js`. Versioned via semver; major
bumps publish at new paths so existing integrations don't break.*
