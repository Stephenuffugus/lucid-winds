# External-repo fix specs to relay — Jul 09 2026 batch

These games live in their OWN repos (NOT lucid-winds), so Claude Code here can't
edit them. Hand these self-contained specs to whoever owns each repo (or to a
Claude session opened inside that repo). Prior Hunch/Pom Pond specs are in
`HUNCH_POMPOND_FIX_SPECS.md` — this file is the newer batch.

---

## HUNCH  (hunch-mauve.vercel.app)  — "see how others drew it" compare gallery

**Stephen's request:** "At the bottom, there should be an option to see how other
people have drawn the prompt, so they can see how far off or close they were to
compare."

**What to build:** after a round ends (result/reveal screen), add a **"See how
others drew this"** control at the bottom that opens a gallery of other players'
drawings for the **same prompt**, shown next to (or toggleable with) the player's
own drawing so they can compare.

**Implementation notes:**
- Data: you need a store of past drawings keyed by prompt id/word, e.g.
  `drawings/{promptId}/{entryId}` = `{ imageDataOrStrokes, score/accuracy, ts }`.
  If Hunch already persists drawings for its AI judging, reuse that; otherwise add
  a lightweight write on submit (respect privacy — anonymous, no PII).
- UI: a horizontally-scrolling strip or 2–3 col grid of thumbnails under the
  result. Each cell shows the drawing + its score (e.g. the AI's confidence /
  guess). Tapping a cell enlarges it. Put the player's own drawing first, labelled
  "You", so the comparison is immediate.
- Fetch the N most recent (or top-scoring) OTHER entries for that prompt; cap at
  ~12 and lazy-load. Exclude the current player's just-submitted entry from the
  "others" list (show it separately as "You").
- Empty state (first player to draw a prompt): "Be the first — check back after
  others play this prompt."
- Keep it cheap: thumbnails, not full-res; paginate/limit reads.

---

## TOMATO MAN  (stephenuffugus.github.io/Tomato_Man/)  — step-by-step tutorial

**Stephen's report:** "The directions are on the 1st screen, then once the game
starts, directions pop up on the screen. By the time I was done reading, it was
into the next pop-up and I didn't have a chance to try them. It would be wise to
have people try each of those steps before the next direction pops up."

**Root problem:** the in-game tutorial popups are on a timer / auto-advance, so
they move on before the player can perform (or even read) each step.

**What to build — an action-gated tutorial:**
- Convert the sequence of popups into discrete steps that advance only when the
  player DOES the thing (or taps an explicit "Next"), never on a timer.
- For each step:
  1. Pause or slow the game (freeze the sun/shadow movement, or drop to a crawl)
     while the instruction card is up, so nothing bad happens while they read.
  2. Show the instruction (e.g. "Dash into the shade to cool down").
  3. Detect the required action (moved into shade / picked up aloe / dashed /
     avoided the sun). When it's detected, briefly confirm ("Nice!"), dismiss the
     card, and resume.
  4. Only THEN show the next step's card.
- Provide a visible **"Next ▸"** (and a one-time **"Skip tutorial"**) so a player
  who can't trigger the action isn't stuck — but default to action-detection so
  they actually practice each mechanic.
- Guard so a step can't double-advance (one-shot per step).
- Keep the first-screen overview if you like, but the in-play steps are the ones
  that must be gated on the player trying them.

---

## SKITTERLINGS  (stephenuffugus.github.io/skitterlings/)  — back button

**Stephen's report:** "It's missing a back button to return to Sky Wolf. All games
should have a 'Back to Sky Wolf' button."

**Status: LARGELY RESOLVED on the portal side (no external change strictly
required).** The Sky Wolf portal now floats its own "‹ Sky Wolf" button over every
framed satellite/external game (`portal/index.html`, 2026-07-09), so Skitterlings
gets a guaranteed way back when launched from the portal or the LW app.

**Optional hardening (recommended if the repo is touched anyway):** add a visible
in-game exit inside Skitterlings for players who open it directly (not framed). It
already speaks the portal handshake, so posting its navigate-back message works
when embedded:
```js
// embedded (framed by the portal): ask the host to close
if (window.parent && window.parent !== window) {
  window.parent.postMessage({ source: 'skitterlings', type: 'navigate-back' }, '*');
} else {
  // opened directly: go to the arcade
  window.location.href = 'https://lucidwinds.com/portal/';
}
```
Place it top-left or in the pause menu, ≥44px touch target.
