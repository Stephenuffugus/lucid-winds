# VINEWINDER — Start Here shelf audit, 2026-08-16

Judged against one question: a stranger on a phone, ninety seconds, does this
make them want to see more of the studio.

## VERDICT

**The weakest of the four, and the only one whose slot I would argue about.**

It is a well made snake. The four gardens are genuinely different tunings, not
four labels on one game. The art direction (Fraunces italics, the pale botanical
palette) is the prettiest thing on the shelf. Someone has clearly been through it
for touch targets and font sizes and left honest comments about both.

But **it is a snake game**, and it was the only one of the four that opened on a
menu instead of a game. Against the other three (a knife runner, a Peggle, a
brick breaker, all with a verb a stranger has not seen this month) it is the one
that answers "should I come back to this studio" with "I have played this
before". Three of its problems were fixable and are fixed. The fourth is that
snake is snake.

**My recommendation, for Stephen not for me:** keep it on the shelf while it is
one of only four in-repo games, because it is polished and it earns its keep as
the calm one. The moment there is a fifth candidate with a verb of its own, this
is the one to rotate off Start Here and down into the A-Z wall. That is a
judgment about what a first shelf is for, not about the quality of the build.

## AUDIT (written before any change)

### P0 — the exit disappeared exactly when a player wanted it
The Lucid Winds bridge appends its `← All Games` button to `#metaBtns`:

```js
var mb=document.getElementById('metaBtns');
...
mb.appendChild(b);
```

and `gameOver()` does `metaBtns.style.display='none'` to clear the menu for the
result panel. **So the one route back to the arcade vanished on every death** and
only reappeared if the player happened to press "Main menu" first. A player who
has just lost and wants to go and look at something else is shown Play again,
Main menu, and nothing else.

### P0 — the unframed exit threw away the arcade
```js
window.SWS_EXIT=function(){
  if(EMBED&&parent!==window){ ...postMessage... return; }
  location.href='/portal/';
};
```
The portal navigates `/satellites/` urls **top level**, so the second branch is
the one that runs for every real player, and a bare `location.href` reloads the
arcade from the top: scroll position gone, the shelf the player was reading gone.
The canonical block in `incoming/PORTAL-CONTRACT.md` uses `history.back()` when
`document.referrer` contains `/portal`, exactly to avoid this.

### P0 — no plain way to start playing
The menu opens on: a streak chip, a petals chip, a title, a sentence, a How to
play button, a daily challenge card, **four garden cards each with a tag, a
heading, three lines of prose and a personal best**, a Nursery Shop button, a
Missions button, and a line of control hints.

There is no "Play". The stranger's first job is to read four paragraphs and pick
a garden, using words ("Heirloom", "Zephyr" internally; "Classic", "Power
Garden", "Windstorm", "Grove" on screen) that mean nothing until they have
played. Every other game on the shelf now starts on one tap.

### P1 — sized off innerHeight, against the studio rule
```js
const avail = Math.min(window.innerWidth-28, window.innerHeight-260, ...);
```
`innerHeight` includes the strip behind the collapsing mobile URL bar, so the
board is sized for an area larger than the player can see. `body` here is
`overflow:hidden` with `min-height:100vh`, so what overflows is not scrollable,
it is simply **unreachable**. At 375x667 the board happens to be width-limited so
the bug does not bite, which is exactly why it survived: it is invisible until a
device where the height term wins. Two other games in this same repo carry a
long comment warning about this specific mistake (see
`nectar-drop/index.html`), and this file did not get the sweep.

It also only listens to `window.resize`. The URL bar sliding away fires
`visualViewport` resize and scroll events, **not** window resize.

### P1 — no headless hook at all, so nothing had ever verified the boards
`Grove` mode draws maze layouts from `LAYOUTS` (`cross`, `beds`, `pillars`,
`gates`, `rings`). Nothing had ever checked that a layout leaves a connected,
playable board: a bed that walls off the spawn or fragments the grid is an
instantly unwinnable run and there was no way to find out without playing all
five by hand. Added a gated hook and flood-filled all five from the spawn cell.
**All five pass** — the layouts are fine. It is the absence of the check that was
the problem.

### Core loop — clean
`reset` → `beginRun` → `loop` → `step` → `gameOver`. Death sets `alive=false`,
`running=false` and swaps the overlay to a result panel with Play again and Main
menu. Pause is on a 48px button and on space. Shop, Missions and How to Play all
have Back. No dead ends.

Steering correctly refuses a 180 degree reversal into the neck (`queueDir`
compares against the last queued direction, not just the current one, which also
stops a two-tap reversal inside a single step). Asserted.

### Save / load — safe
`freshSave()` supplies defaults and the loader is `try{ JSON.parse }catch{}` with
a merge. Verified against six corrupt payloads; none throw, and every one still
yields a usable equip set for vine, seed and garden. Wholesale write, so two tabs
race; cosmetic impact only.

### Difficulty — real
`stepMs` 175/165/150/170, `min` 85/95/..., `ramp` 3.5/2.5/..., plus wrap,
powerups and gusts as per-mode flags. Four genuinely different games. Asserted
against the live table.

### Economy — honest
Every run pays Petals, first run of the day doubles, three fresh missions daily,
and the result panel always shows the next cosmetic and how far away it is.
Nothing is a tease.

### Touch targets — someone did this properly
`.stagebtns button` 48x48, `.ghostbtn` 48 (with a comment noting it used to be
the worst control in the studio at 15px), `.primary` 48, `.metabtn` 48,
`.tabb` 48. Renders unscaled so these are real px. Font sizes are all at or above
11.5px with a comment explaining the floor. This file is the best documented of
the four on both counts.

### Copy — clean
No en or em dashes outside comments.

### Service worker — none
Ships none, registers none. Nothing to keep in lockstep.

## FIXED

1. **The exit now survives the game over screen.** Moved out of `#metaBtns` into
   its own row appended to the overlay, which nothing hides. Relabelled
   `← Sky Wolf Studio Arcade` to match the studio branding rule.
2. **The unframed exit uses the canonical referrer fallback** — `history.back()`
   when the player came from `/portal`, a full navigation otherwise. The arcade
   keeps its scroll position.
3. **Added a single `Play` button** above the garden cards. It starts Classic
   immediately. Nothing was removed: the four gardens, the daily, the shop and
   the missions are all still exactly where they were, one scroll below. The
   button is hidden on the result panel so it cannot be misread as "Play again".
4. **Sized off `visualViewport`**, with listeners on its resize *and* scroll
   events, and `innerHeight` demoted to a fallback.

## IMPROVED

5. **Added a gated headless hook** (`?vwtest=1`, local origins only, so it can
   never mint Petals on the live domain) and used it to flood-fill every garden
   bed. This game could not previously be exercised at all without a browser.

## NOT FIXED

- It is still snake. See the verdict.
- Wholesale localStorage write.

## VERIFICATION

`node check.mjs` in this folder: 56 assertions, including a flood fill of all
five garden beds from the spawn cell and a full start-to-death run through the
real `step()`. `node check.mjs --selftest` breaks each invariant in turn;
**14 of 14 mutations turn their assertion red**, including a deliberately sealed
garden bed and a `gameOver` that refuses to end the run. A probe that cannot fail
is not evidence.
