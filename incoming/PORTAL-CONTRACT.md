# PORTAL INTEGRATION CONTRACT — verified against the live portal 2026-08-16

Every fact below was read from `portal/index.html` and
`satellites/flock-the-world/index.html` on 2026-08-16, not from any brief.
(The old NEW_SATELLITE_BRIEF.md is STALE — never build to it.)

> **CORRECTION 2026-08-16 (build session, verified by driving the real
> portal).** The section below said every arcade card is framed. It is not.
> The portal's delegated click handler frames only two url shapes:
> `/play/<id>.html` (srcdoc shell) and `https://stephenuffugus.github.io/...`
> (iframe src). **Anything else — including a relative `/satellites/<id>/`
> url — falls through the handler and NAVIGATES TOP LEVEL.** There is no
> iframe and therefore no black-screen recovery timer for those.
>
> Consequences, all confirmed against a running portal:
> - `/satellites/flock-the-world/` and `/satellites/bandits-box/` are
>   top-level navigations, not frames. The `{sws:'ready'}` handshake is not
>   required for them (it is still worth shipping: it costs nothing and is
>   correct the day a card moves to a github.io url).
> - An exit affordance must therefore work off `document.referrer`, not just
>   `window.parent`. The canonical block below already does both.
> - `beta:true` renders `data-indev="1"`, which puts the card behind the
>   tester dev gate (`localStorage.sws_dev_ok='1'`). Automated checks must
>   unlock it or the click never reaches the card.
>
> The framed contract below still applies verbatim to github.io satellites
> and `/play/` games. Read the two sections with that split in mind.

## Two different shelves, two different contracts

### 1. Game cards (the arcade grid) — FRAMED ONLY FOR /play/ AND github.io

- Arrays: `FEATURED` (portal/index.html ~651) and `GAMES` (~945).
- Schema: `{nm:"Name", ds:"One sentence.", url:"/satellites/<id>/?v=YYYYMMDDx",
  ic:"emoji", thumb:"/portal-assets/thumbs/<id>.png", beta:true}`
- The `?v=` stamp is MANDATORY (host caching law) and changes on every deploy.
- Thumb: PNG ≤150KB in `/portal-assets/thumbs/`.
- Search: add an entry to the keyword map at ~1359
  (`'display name':'space separated search terms'`).
- The portal OPENS THESE IN AN IFRAME and runs a black-screen recovery timer:
  a page that loads without announcing itself gets closed and the player is
  returned to the portal. So the embed protocol below is REQUIRED.

### 2. Free Apps shelf — DIRECT LINKS, no iframe, no bridge

- Static markup at ~581: `<a class="app-card" href="/padlab/">` with an emoji
  `<span class="med">`, a `<b>` name, and a `<small>` one-liner.
- Plain navigation. No sws messages, no recovery timer, no framing. The app
  behaves exactly as if the user typed the URL.

## The embed protocol (for framed satellites only) — canonical implementation

Copy the FTW block (satellites/flock-the-world/index.html ~1763), verbatim
pattern:

```js
/* ===== Sky Wolf Studios embed protocol ===== */
(function(){
  var framed=false; try{ framed = window.parent!==window; }catch(e){ framed=true; }
  window.SWS_EXIT=function(){
    if(framed){ try{ parent.postMessage({sws:'close'},'*'); }catch(e){} return; }
    if(document.referrer.indexOf('/portal')>=0&&history.length>1){ history.back(); }
    else{ location.replace('https://lucidwinds.com/portal/'); }
  };
  if(framed){
    try{ parent.postMessage({sws:'ready'},'*'); }catch(e){}
    window.addEventListener('load',function(){ try{ parent.postMessage({sws:'ready'},'*'); }catch(e){} });
  }
  /* + a findable exit button on the main/menu surface calling SWS_EXIT() */
})();
```

Contract details that matter:

- `{sws:'ready'}` must be posted at parse time AND on the `load` event, and
  on EVERY page load (multi-page apps: every page). The portal remembers the
  last ready and arms a recovery timer per load — a silent load is treated as
  a black screen and auto-closed (this exact bug crashed Litter Bug players
  back to the arcade on 7/30).
- `{sws:'close'}` asks the portal to close the frame. Only ever send it once
  per user intent (the portal guards double-close, but don't rely on it).
- `{sws:'host-music', on:bool}` arrives FROM the portal for satellites flagged
  as having their own soundtrack; a cooperating game mutes/unmutes its own
  music accordingly. Only relevant if the satellite registers as self-music.
- The exit affordance must be findable on the game's own menu (Jessie rule) —
  framed shows "close", unframed falls back to history/portal URL.

## Where the three incoming projects land (locked)

| Project | Shelf | Frame? | Bridge? |
|---|---|---|---|
| Bandit's Box | FEATURED card, beta:true (it's a toy you play) | **no — top level**, see correction | protocol shipped anyway; the referrer-based exit is what actually runs |
| Hush | Free Apps app-card at `/hush/` (it's a utility) | no | none |
| Marblebeat | inside PadLab — no new portal entry; PadLab's existing Free Apps card copy gains a word about beats-as-marbles | no | n/a |

Shelf choice still follows the rule (interactive toy → arcade grid, utility →
Free Apps); it is only the framing that differs from the original note.
**Both shelves currently navigate top level for in-repo paths** — the
practical difference is which grid the thing appears in, plus the dev gate
that comes with `beta:true` on an arcade card.

Clean rule for the future: interactive toy → arcade grid (framed, protocol);
utility app → Free Apps (direct, no protocol).
