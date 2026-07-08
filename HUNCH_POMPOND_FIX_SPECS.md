# Fix specs to relay — Hunch & Pom Pond (external repos)

These two games live in their own repos (NOT lucid-winds), so Claude Code here
can't edit them. Below are precise, self-contained fix specs to hand to whoever
owns each repo (or to a Claude session opened inside that repo).

---

## HUNCH  (hunch-mauve.vercel.app)

### Bug 1 — the round timer starts before you begin drawing
**Symptom:** the countdown is already running when the prompt appears, so you lose
time reading the word / getting ready.

**Fix:** start the timer on the player's FIRST stroke, not on round load.
- On round/prompt init: build the round, show the prompt, but do NOT start the countdown. Show the timer in its full/idle state (e.g. "0:00" or the full bar).
- Add a one-shot guard, e.g. `roundStarted = false`.
- In the drawing canvas's first `pointerdown` (or `touchstart`/`mousedown`) handler:
  ```js
  if (!roundStarted) { roundStarted = true; startCountdown(); }
  ```
- Subsequent strokes must NOT restart it (the guard handles that).
- Reset `roundStarted = false` when the next round begins.

### Bug 2 — "Submit" won't let you submit early
**Symptom:** you finish drawing but can't submit until the timer runs out (or some
min threshold), so you're forced to wait.

**Fix:** allow submitting any time once there is at least one stroke.
- Enable the Submit button as soon as `strokeCount >= 1` (or unconditionally after the round starts). Remove any `disabled` gate tied to "timer must expire" / a minimum elapsed time.
- On Submit: `stopCountdown()`, freeze the canvas, and advance straight to judging with the current drawing. Use the same code path the timer-expiry uses so nothing is skipped.
- Make sure the auto-submit-on-expiry and the manual Submit both call ONE `finishRound()` function, guarded so it can't double-fire.

---

## POM POND  (pom-pond.web.app)  — family / kid-code join is broken

**Symptom (Stephen, real use):** A parent tried to add a child (Penny) on her
tablet. Penny was given the **kid code**, but in Pom Pond there was **no place to
enter a kid code** — only a **family code** field. She entered the kid code as the
family code and it failed. This blocks families from connecting, which is the
whole point of the app.

**Root problem:** the join flow exposes only ONE code field ("family code") but the
app hands out a DIFFERENT code ("kid code"), with no matching entry point — a
mismatch that guarantees failure and confusion.

**Fix (pick the model, then make the UI match it exactly):**

1. **Decide the model and use ONE consistent code type for joining.** Simplest and
   least error-prone: the parent creates a family and gets a single **family/join
   code**; everyone (including kids) joins with THAT code. If a separate "kid code"
   must exist, there MUST be a labelled field to enter it.

2. **Add a clear "Join a family" entry on the kid's device** with:
   - A single obviously-labelled code input ("Enter your family code").
   - Helper text: "Ask a parent for the code."
   - A submit button that validates and gives a clear success ("You joined the
     Furpahs family!") or a clear error ("That code didn't match — check with a
     parent.").

3. **Make code entry forgiving** — accept the code regardless of which type the
   user thinks it is: look it up, and if it resolves to a family, join the family;
   if it resolves to a kid-link, link the kid. Never fail silently.

4. **Surface the codes clearly on the PARENT side** — one screen that shows the
   code(s) to share, with a copy button and a one-line explanation of what each is
   for. If there's both a family code and a per-kid code, label them unmistakably.

5. **Confirm the linkage end-to-end**: after a kid joins, both the parent's and the
   kid's screens should immediately reflect the connection (no refresh needed).

**Note:** without the pom-pond source in front of me I can't give exact
field/function names. If you drop the repo (or clone it here) I can write the exact
diff. The above is the design + behaviour spec any dev can implement.
