# SATELLITE EMBED GUIDE — adding a new Sky Wolf Studios game to the portal

Every new satellite game should ship with this from day one. It kills the
"in-game X → black screen → second X" bug (Sixfold + Skitterlings, Jul 01)
and makes the game a good citizen inside the portal's gapless jukebox.

Reference implementations live in this repo:
- `satellites/hues/index.html` (search `SWS embed protocol`)
- `satellites/shell-shuffle/index.html` (same marker)

---

## TL;DR checklist for a new game

1. Paste the snippet below into your game (bottom of your main script).
2. Route your **exit** control ("all games" / quit on the main menu) through
   `SWS_EXIT()`. Never `history.back()`, never change `location`.
3. Your in-game back/✕ goes to **your own menu screen** — an internal screen
   switch, not navigation.
4. Deploy to GitHub Pages (github.io never sends X-Frame-Options, so the
   portal can frame it).
5. Add one line to `FEATURED` in `portal/index.html` + a thumbnail
   (≤150 KB, ≤480px) in `portal-assets/thumbs/`.

---

## How the portal loads games

`portal/index.html` intercepts game-card taps and loads the game in a
full-screen `<iframe>` so the portal page (and its soundtrack) never unloads:

| Game type | How it loads |
|---|---|
| Internal LW games (`/play/<id>.html`) | Built in-memory and framed via `srcdoc` (dodges the Hostinger bot-403) |
| Cross-origin satellites (`stephenuffugus.github.io/*`, vercel) | Framed at their real URL with `?embed=1` appended |
| Same-origin satellites (`/satellites/<id>/`) | **Top-level navigation** (framing a same-origin HTML page hits the Hostinger LiteSpeed bot-403 = black screen). Browser back returns to the portal. |

While a framed game is open, the portal shows a floating **✕ EXIT** pill
(top-right) — the guaranteed escape back to the portal. Your game should not
render its own "exit to portal" ✕ in the same corner; put your exit on your
menu screen and call `SWS_EXIT()`.

The portal also runs a **12-second watchdog** on cross-origin frames: if the
frame never loads (X-Frame-Options / CSP block), it falls back to opening the
game's real URL top-level. Posting `{sws:'ready'}` cancels the watchdog early.

## The protocol

The portal listens for exactly two messages (`window.postMessage` to parent):

```js
{sws:'ready'}   // → cancels the 12s framing watchdog ("I loaded fine")
{sws:'close'}   // → portal closes the overlay (player exits to the portal)
```

(There is also a legacy Skitterlings-specific protocol —
`{source:'skitterlings', type:'ready'|'navigate-back'}` — do not use it for
new games; use `sws`.)

## The snippet (copy-paste)

```html
<script>
/* ===== Sky Wolf Studios embed protocol =====
   The portal (lucidwinds.com/portal/) frames games with ?embed=1 and
   listens for {sws:'ready'} and {sws:'close'}.
   Rules when embedded:
     • NEVER history.back() or navigate location — an iframe with no
       history entry goes blank (the black-screen bug).
     • Your in-game back/✕ returns to YOUR OWN menu screen.
     • Only the menu's explicit exit control calls SWS_EXIT(). */
(function(){
  var SWS_EMBED=/[?&]embed=1(&|$)/.test(location.search);
  window.SWS_EMBED=SWS_EMBED;
  window.SWS_EXIT=function(){
    if(SWS_EMBED&&parent!==window){try{parent.postMessage({sws:'close'},'*');}catch(e){} return;}
    location.href='https://lucidwinds.com/portal/';
  };
  if(SWS_EMBED&&parent!==window){try{parent.postMessage({sws:'ready'},'*');}catch(e){}}
})();
</script>
```

Then wire your exit control:

```js
document.getElementById('exitBtn').onclick = function(){ SWS_EXIT(); };
```

Standalone (not embedded), `SWS_EXIT()` sends the player to the portal — free
cross-promo for the whole fleet, so it's fine to show the exit link always
(label it "← All Sky Wolf games").

## Why the black screen happened (so it never comes back)

An embedded iframe starts with **no history entries**. A game that calls
`history.back()` on its in-game X (or navigates to a page that doesn't exist
in embed context) sends the iframe to a blank document. The player sees black
with only the portal's floating pill to escape. Hence the two rules: internal
back = internal screen switch; leaving = `postMessage`, never navigation.

## Listing the game on the portal

In `portal/index.html`, add one object to the `FEATURED` array:

```js
{nm:"My Game", ds:"One-line hook.", url:"https://stephenuffugus.github.io/my_game/",
 ic:"🎮", thumb:"/portal-assets/thumbs/my-game.png"},
```

- Optional flags: `beta:true` (BETA badge), `soon:true` (COMING SOON,
  unclickable), `premium:true` (premium styling, used by HUNCH),
  `ownMusic:true` (**your game ships its own soundtrack** — see next section).
- `url` must be the **live Pages URL**, never a codespace URL.
- Thumbnail: ≤150 KB, ≤480px (the Jun-28 perf rule) into
  `portal-assets/thumbs/`.
- The click interceptor frames any `stephenuffugus.github.io` link
  automatically — no other wiring needed.

## Games with their own music (the `host-music` handshake)

The portal owns a **studio jukebox** (the ♫ soundtrack that plays gaplessly
across the whole portal). A cross-origin game's audio can't be reached from
the portal, so if your game plays its *own* music, both would play at once.

**Two things make this clean:**

1. Flag your game `ownMusic:true` in `FEATURED` (above). When the player opens
   it, the portal **pauses its own jukebox** and floats a small pill letting
   the player switch between *the game's own music* (default) and *the studio
   soundtrack*. The choice is remembered in `localStorage.sws_music_pref`.
   **This alone fixes the double-audio** — no game change required.

2. To make the "switch to studio music" direction actually **silence your
   game's music** (instead of both playing when the player picks studio), your
   game should honor one extra message. The portal posts:

   ```js
   {sws:'host-music', on:true}   // studio soundtrack is playing → mute yours
   {sws:'host-music', on:false}  // player handed audio back to you → play yours
   ```

   Add this listener next to your embed snippet (uses your own music toggle —
   here `Music.setEnabled`, adapt to your API):

   ```js
   window.addEventListener('message', function(e){
     var d = e.data;
     if(!d || d.sws !== 'host-music') return;
     try { if (typeof Music !== 'undefined' && Music.setEnabled) Music.setEnabled(!d.on); } catch(_){}
   });
   ```

   The portal sends the current state as soon as your game posts `{sws:'ready'}`,
   and again whenever the player taps the pill — so you don't need to poll.

Without listener #2 the game still works (default = your music, studio paused),
but a player who explicitly taps "studio music" will hear both until you add it.
**Sweet Spot and Sixfold are flagged `ownMusic` and need this listener added to
their repos.** (Sixfold: it already has a `Music` module with `setEnabled` and
the embed protocol — just drop the listener in beside it.)

## Sunbeams (optional, later)

Same-origin satellites (`/satellites/<id>/` in this repo) can load
`/sunbeam-sdk.js` and call `Sunbeam.init({gameId})` + `Sunbeam.earn(n, tag)` —
see hues/shell-shuffle. Cross-origin satellites need the vendoring step
(copy the build into `satellites/<id>/` in this repo) before earns can reach
a player's vault; keep the canonical source in the game's own repo and
re-vendor on updates (see the Shell Shuffle note in `portal/index.html`).
