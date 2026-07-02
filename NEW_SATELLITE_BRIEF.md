# Sky Wolf Studios — brief for a Claude building a new satellite game

Paste this whole file into the conversation of any Claude building a new game.
It explains what the game is joining, the rules it must follow, and exactly
what to hand back so the Lucid Winds Claude can wire it in without questions.

## What you're building into

Sky Wolf Studios is Stephen's fleet of small, cozy, free browser games. They
live on lucidwinds.com — a games portal (lucidwinds.com/portal/) plus the
flagship Lucid Winds app — and share one player currency called **sunbeams**.
Your game will be listed on the portal and possibly inside the Lucid Winds
app, either framed from your GitHub Pages URL or copied ("vendored") onto
lucidwinds.com. You don't wire any of that — you build a clean standalone
game and hand it off; the Lucid Winds Claude does the integration.

The best handoff we've received is Blooming Words'. Match its spirit: short,
accurate, zero surprises, runs first try.

## Hard requirements

1. **Fully static and self-contained.** No backend, no build step required to
   deploy, no API keys, no accounts, no payments, no trackers, no third-party
   requests at runtime. localStorage for saves. One folder that runs when
   served over HTTPS.
2. **All paths relative** (`start_url: "."` if you ship a PWA manifest) so the
   game runs from any origin or subfolder unchanged — it may be hosted at
   lucidwinds.com/satellites/<id>/.
3. **Portrait-first, responsive, touch-first** (48px minimum touch targets),
   keyboard supported where natural. Works in modern mobile + desktop
   browsers. Respect `prefers-reduced-motion`.
4. **Deploy to GitHub Pages** from the repo (Actions or branch — your choice),
   and tell us the exact live URL AND which branch/path Pages serves from.
5. **Embed protocol (mandatory — copy verbatim):** the portal frames games in
   an iframe with `?embed=1`. Include this snippet and follow its rules:

```html
<script>
/* ===== Sky Wolf Studios embed protocol =====
   The portal (lucidwinds.com/portal/) frames games with ?embed=1 and
   listens for {sws:'ready'} and {sws:'close'}.
   Rules when embedded:
     - NEVER history.back() or navigate location — an iframe with no
       history entry goes blank (the black-screen bug).
     - The in-game back/X returns to the game's OWN menu screen.
     - Only the menu's explicit exit control calls SWS_EXIT(). */
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

   Concretely: every in-game back/✕ is an INTERNAL screen switch (and its
   close handler must hide EVERY overlay it can sit over — a ✕ that leaves a
   translucent screen painted on top reads as a dead black screen; this
   exact bug shipped in Skitterlings). Add one "← All Sky Wolf games" button
   on your menu (44px+) wired to `SWS_EXIT()`. Standalone it cross-promotes
   the portal; embedded it exits cleanly.
6. **Service worker:** optional, but registration MUST be skipped when
   `window.SWS_EMBED` is true, and know that a vendored copy on
   lucidwinds.com will have it removed entirely (the root SW owns caching).
   Never `location.reload()` on `controllerchange` while embedded.
7. **No auto-fullscreen requests when embedded** (the portal overlay is
   already full-screen; a fullscreen prompt on first tap is jarring).

## Currency: keep yours internal, expose the hooks

Give your game its own internal score/currency if it wants one — do NOT
integrate sunbeams, Firebase, or any SDK yourself. Instead:

- Route all internal earning/spending through ONE small `Wallet`-style object
  (`earn(n, reason)` / `spend(n, reason)`), clearly marked with a comment.
- **Announce each first-time-only meaningful moment to the parent frame**
  (this is the official protocol, adopted from Tally):
  `parent.postMessage({sws:'earn', moment:'level_clear', detail:{...}}, '*')`
  — only when embedded. The host prices each moment from its own rate card
  and enforces its own caps; your message can never set an amount. Keep the
  moment names short and stable (`level_clear`, `daily_done`, `three_star`,
  `world_clear`, `streak_milestone`, ...).
- In your handoff, LIST the earn-worthy moments and roughly how often a
  casual player hits each per session. Balance target on our side is about
  20-40 sunbeams per solid session, anti-farm guarded (first-time-only
  and/or daily-capped) — your list is what makes that tuning possible.
- Keep those moments deduplicated in your own state (e.g. "first time this
  word/level ever") — replays shouldn't re-trigger them.

## What to hand back (the handoff document)

Model it on Blooming Words' handoff. Include:

1. **Live GitHub Pages URL** + repo name + which branch/path Pages deploys
   from + how deploys happen (Actions? push to main?).
2. **File manifest** — exactly which files are the deployable game (and which
   repo dirs are dev-only).
3. **One-line hook + one-paragraph description** (portal card copy).
4. **Earn moments list** (per the currency section above) with per-session
   frequency estimates.
5. **Nav map** — every screen/overlay and what its back/✕ does; confirmation
   that the embed snippet is in and `SWS_EXIT()` is wired to the menu exit.
6. **A thumbnail source image** — any size; we resize to ≤480px/≤150KB. Square
   or portrait art reads best on the portal grid.
7. **Anything stateful** — every localStorage key you write and what it holds.
8. **How to update content later** (generators, tools, tests — like Blooming
   Words' `tools/gen_levels.py` note).

That's it. Build something small and lovely, keep the nav internal, hand back
the list above, and it goes live on the portal the same day. 🐺
