# Fleet exit audit — 2026-08-16

## The defect

The portal's delegated click handler frames **only two url shapes**:

- `/play/<id>.html` (srcdoc shell)
- `https://stephenuffugus.github.io/...` (iframe src)

Anything else, **including a relative `/satellites/<id>/` url, falls through the
handler and navigates TOP LEVEL**. Verified live; written down in
`incoming/PORTAL-CONTRACT.md`.

So for every game carded with a relative url:

- `window.parent === window`, always. Any exit rendered behind a framed check
  never appears, not once, in production.
- A game with no exit at all leaves the browser back button as the only way
  home. In an installed PWA there is no back button, so the player is stuck.

The Jessie rule: the way out has to be findable on the game's own surface.

## The seven games, what was actually wrong

| Game | State before | What it needed |
|---|---|---|
| **The Attic** | Posted `{sws:'ready'}` when framed, and that was all. No `SWS_EXIT`, no exit control anywhere. | Full protocol block plus a visible control. |
| **Pop N Lock** (chaff-wars) | Ready post gated on `?embed=1` (a flag the portal never sets for these urls, so it never fired). No `SWS_EXIT`. | Full protocol block plus a visible control. |
| **Merge & Blast** | Same as Pop N Lock. | Same. |
| **Sunforge** (ring-stacker) | Same as Pop N Lock. | Same. |
| **Picnic Panic** | Had `SWS_EXIT` and a real button, but the exit was gated on `?embed=1` and its unframed branch hard loaded `/portal/`. Ready post also gated on the flag. | Detect framing directly; referrer path; raise the button to the 48px floor. |
| **Sprout Dice** | Had `SWS_EXIT` and a title button, but the unframed branch hard loaded `/portal/`, and ready posted only when framed. | Referrer path plus ready on load. |
| **Vine Runner** | Had `SWS_EXIT`, but the only control was **on the pause screen** — reachable only by starting a run and then pausing it. Unframed branch hard loaded `/portal/`. | Referrer path plus a title screen exit. |

Every one of them now carries the canonical block from the contract: post
`{sws:'close'}` when framed, otherwise `document.referrer` + `history.back()`,
else `location.replace('https://lucidwinds.com/portal/')`. `SWS_EXIT` is
assigned **on window** in every case, because a top level `const` or `function`
in a classic script is not a window property.

## Where each control went, and why there

Placement was decided per layout, by reading it. A button that covers a control
is worse than no button.

- **The Attic** — a monospace chip on its own row above the sign, left aligned.
  The topbar already runs ticket count against WANT LIST with `space-between`; a
  third item there would crowd both at 375px, so it got its own line.
- **Pop N Lock / Merge & Blast / Sunforge** — these three are the same template.
  A pill pinned top left of `#s-title` only. Their title screens are empty art up
  there, and every play control (`#b-home`, the power button, `#b-hold`, the four
  `cbtn`s, SLAM) lives on `#s-play`, a different screen, pinned to other corners
  or the bottom bar. Absolutely positioned, so it adds no layout height to a
  title screen that already scrolls on a short phone.
- **Picnic Panic** — kept its existing "All Sky Wolf games" button on the menu and
  game over overlays; only raised it to the touch floor.
- **Sprout Dice** — kept its existing title screen button (`.btn ghost`,
  `min-height:60px`).
- **Vine Runner** — canvas game, so the exit is drawn into the title screen in the
  game's own language: a 200x52 rounded pill at `H*0.87`, well below the
  TAP TO GROW prompt (`H*0.62`) and both control hint lines (`H*0.66`, `H*0.71`).
  The hit test runs **before** the tap anywhere start, in both the touch and the
  mouse handler, or the title would swallow the tap and launch a run instead.

Touch floor: every control is at least 48 rendered px at 375x667. Neither Picnic
Panic nor Vine Runner applies a stage transform, so CSS and canvas units are
rendered pixels 1:1 (Vine Runner sets `W = innerWidth` and
`setTransform(DPR,...)`, so drawing units are CSS px).

Copy: no dash characters in any player facing string.

## No double buttons

Three of the seven (Pop N Lock, Merge & Blast, Sunforge) also load the shared
`/arcade-exit.js`, which injects an exit into games that lack one. It bails early
when `typeof window.SWS_EXIT === 'function'`. In all three the button markup
precedes the protocol block, which runs at parse, while the injector is appended
on `load` — so the injector sees a defined `SWS_EXIT` and does nothing. One
button, not two. Checked by line order in each file.

## The checker: `satellites/_exit_audit.mjs`

```
node satellites/_exit_audit.mjs              # audit the carded fleet
node satellites/_exit_audit.mjs --self-test  # prove the checks can fail
node satellites/_exit_audit.mjs <id> ...     # audit specific games
node satellites/_exit_audit.mjs --verbose    # show the call sites found
```

It was watched failing first: all seven games red on the baseline run, and the
self test carries cases that must go red or the tool is decoration.

### ⛔ Five false positives it shipped with, and what caused them

The first version anchored every check at the offset of `window.SWS_EXIT =` and
read forward 1200 characters. It reported **62 of 100 games broken**. That number
was wrong, and a checker that cries wolf on most of the fleet gets ignored, which
is worse than having no checker. The causes, all found by opening the files it
accused:

1. **Bandit's Box** hoists the referrer test into the enclosing IIFE
   (`var fromPortal = document.referrer...`), so reading forward from the
   assignment never sees `document.referrer`. Correct code, called broken.
2. **Parallel** declares `function SWS_EXIT(){...}` and exports it *afterwards*
   with `self.SWS_EXIT = SWS_EXIT`. The assignment is the last line, so reading
   forward saw nothing at all.
3. **Aura Farm** names its working exit `swsExit` and never binds `SWS_EXIT`.
   That is off contract, but the player is not stranded, and saying so is the
   same crying wolf.
4. **Boundary bug of my own:** `ownerName` derived the anchor position from
   `win.length / 2`, which is only true when the window is not truncated. The
   exit is the last thing in the file in most of these games, so the window *was*
   truncated and the function read the text *before* the exit.
5. **Fox & Basket** has no `SWS_EXIT` at all, just
   `$('b-back1').onclick = function(){ location.href='/portal/'; }`. That is a
   real, tappable way home.

The fix: anchor on the **exit body** (what it does: posts `sws:'close'`, or
navigates to `/portal`) rather than the assignment, resolve one level of variable
indirection, accept an exit that *is* the handler, and split "stranded" from
"off contract". A sixth bug surfaced while tightening: the inline handler window
at 900 chars matched any unrelated `addEventListener` nearby and waved through
**Tempo Grove**, whose `SWS_EXIT` is defined and never called — a false negative
is as bad as a false positive, so that window is 200 chars.

It also reports display names now; matching the closing quote to the opening one
stops `nm:"Bandit's Box"` truncating to "Bandit".

### What it cannot check

Whether the control is **visible, large enough, or sitting on top of something**.
There is no browser here. Placement was done by reading each layout. One screen
has since been shot (below) and it found a real overlap, which is the argument
for shooting the rest.

## The Vine Runner how to play screen — shot at 390x844

Reported: two floating controls stacked in the bottom right, over the right hand
end of the yellow RUN button and the tail of the "Tap the ? in the corner" line.

**Neither is an exit, and there is no double button.** Established from source:

- Vine Runner **does not load `/arcade-exit.js` at all**, so the runtime injector
  was never in play on this game. The bail-on-parse check I made applies to Pop N
  Lock, Merge & Blast and Sunforge, and it stands for those three.
- `#vrHow` is **fully opaque** (`background:#08140b`, `inset:0`, z-index 120), so
  my canvas control cannot show through it. Mine is drawn on the canvas, on the
  title state only.
- `#vrHowBtn` (the `?`) is at **top** right, z-index 118, i.e. *under* the sheet.

Both controls are the **fleet feedback fab** from `/feedback.js`:

| Seen | Actually |
|---|---|
| "larger circular button carrying a glyph" | `.lwfb-fab.lwfb-mini`, `textContent = '🐞'`, 48px circle, `bottom:96px`, `right:12px`, **z-index 2147482000** |
| "small round X chip, overlapping it" | `.lwfb-fab-x`, `dot.textContent = '×'`, a 48px tap zone hung at `top:-30px; left:-30px` off the fab |

So the fab's real footprint is about **x = W-90 to W-12, y = H-174 to H-96** —
far taller than it looks, and two billion z-index above anything a game owns. No
game can out-stack it.

### Two fixes, and why padding was not enough

1. **The fab is hidden while the sheet is open** (`body.vr-how-open .lwfb-fab
   {display:none}`, toggled in the sheet's existing open/close). Padding alone
   does **not** work here: `#vrHow` is a block, so when the copy is shorter than
   the screen the content sits at the top and the fab still floats wherever it
   likes. Hiding a floating fab under a modal is correct modal behaviour and
   holds at any height. A CSS rule also handles mount order for free — the sheet
   opens at parse, the fab mounts on `load`.
2. **My canvas control moved to the bottom left, anchored to the bottom edge.**
   The first version sat centred at `H*0.87` and came within **5px** of the fab's
   dismiss badge at 390 wide, and would have collided outright at other sizes.
   It is now `{x:12+w/2, y:H-30-h/2}` — a bottom **left** control cannot meet a
   bottom **right** fab at any size. This was the risk I named myself: a canvas
   control has no layout engine keeping it out of another element's box, so it is
   kept out by arithmetic instead.

`/feedback.js` lives at the repo root, outside this task's sandbox, and was not
edited.

## The fab-over-a-modal hazard is fleet wide: `--fab`

Since this is reportedly the fleet's most common visual defect, the scan is now
part of the tool:

```
node satellites/_exit_audit.mjs --fab
```

It lists games that mount the fab **and** own a full screen modal underneath it.
First cut named 79 of 100 — noise, because it was matching `#wrap`, every game's
root container. Requiring `display:none` on the same rule (a sheet you *open*,
not a container that is always there) cuts it to a credible list:

```
AT RISK  bloom-breaker (.screen)   budburst (.how-wrap)   burr-blast (#rotate, .screen, #worldCard)
         dewball (#hud)            garden-td (.screen)    hues (#rulesOv)
         pitbike-rally (#how-ov)   shell-shuffle (.paused-overlay, .shop)
guarded  vine-runner (#vrHow)
```

These are **candidates, not confirmed defects** — the scan cannot know where a
sheet puts its controls. Each needs a screenshot. Note how many are named
`#rulesOv`, `#how-ov`, `.how-wrap`: how-to-play sheets with a primary button at
the bottom are the exact shape that fails.

## Two placements I could not verify without a screen

Both are pre-existing buttons I adopted rather than placed, and both are
**full width** in the fab's horizontal range, so only their height decides it:

- **Sprout Dice** — `#b-exit` is the last button in a vertically centred title
  stack, on a screen with `overflow:hidden`, so its position is static. My
  arithmetic puts it around `H-212..H-152` at 390x844 against a fab band of
  `H-174..H-96`: **an overlap of roughly 22px on its bottom right corner**. That
  estimate depends on the logo image's height, which I cannot measure here.
- **Picnic Panic** — `.lw-exit` is the last child of a scrollable, centred
  `.overlay`. Because it scrolls, any overlap is transient rather than static,
  which is true of any scrollable page under a fixed fab.

I deliberately did **not** redesign either screen on arithmetic I cannot check;
shifting a title screen up by ~95px on an unverified measurement is how you trade
one visual defect for another. Both need a shot at 375x667 and 390x844.

## Fleet result

```
100 audited: 47 PASS, 6 PARTIAL, 26 GRAFT, 21 STRANDED
Players can get home from 79 of 100.
```

- **PASS (47)** — a reachable exit on `window.SWS_EXIT` with the full referrer path.
- **PARTIAL (6)** — a reachable way home, but off contract: wrong name, or it skips
  the referrer path and so discards the back stack on every trip.
- **GRAFT (26)** — nothing of its own, but loads `/arcade-exit.js`, which injects an
  exit at runtime. Not stranded, but generic and placed by a guess about the
  layout; its no title screen fallback is an unlabelled arrow chip.
- **STRANDED (21)** — no reachable exit and no injector. **This is the real number**,
  and it is the fleet finding: 21 shipped, carded games a player cannot leave
  without the browser back button.

Currently stranded:

```
bramble-court, bramblewick, bridgevine, fence-off, frost-watch, lamplighter,
line-loom, loop-warden, mini-crossword, mosaic-draft, nova-bloom, orb-orchard,
pollinator-paths, root-weave, silt, sled-vine, slice-master, spore-drift,
tempo-grove, tinker-loft, tonic-drop
```

Two shapes worth noting in that list: **silt** and **tempo-grove** both *define* a
perfectly correct `SWS_EXIT` that nothing ever calls. A defined exit with no
caller is not an exit.

Off contract but working: `aura-farm, dewball, fox-basket, pollen-panic, pong,
vinewinder` (aura-farm is another agent's, untouched here).

---

# BATCH 2 of the 21 stranded — 2026-08-16

Ten games: `orb-orchard, pollinator-paths, root-weave, silt, sled-vine,
slice-master, spore-drift, tempo-grove, tinker-loft, tonic-drop`.
**Nine fixed. slice-master skipped** (see the last section).

## What was actually wrong: one template, one flag, no caller

All ten shipped the *same* protocol block, and it was wrong the same way:

```js
var SWS_EMBED=/[?&]embed=1(&|$)/.test(location.search);
window.SWS_EXIT=function(){ if(SWS_EMBED&&parent!==window){ ...close... } ...referrer... };
if(SWS_EMBED&&parent!==window){ ...ready... }
```

The important finding is that **`SWS_EXIT` itself was never the bug**. Because
these urls are never framed, `SWS_EMBED` is false and `parent===window`, so the
function always fell through to the referrer path, which is correct. The block
was defensible code that had **never once run**, because in all ten files
nothing anywhere called `SWS_EXIT`. This is exactly the shape flagged for silt
and tempo-grove in the batch 1 notes — it turned out to be *all ten*, not two.

So the fix is a **control**, not a function, in every case. `SWS_EXIT` was
edited anyway, for one reason:

- The framed branch was gated on `?embed=1`, a flag the portal never sets. Today
  the flag decides nothing. The day one of these cards moves to a `/play/` or
  github.io url, it decides the **wrong** thing: the game would be framed,
  `SWS_EMBED` still false, and the exit would call `history.back()` *inside the
  frame* instead of posting `{sws:'close'}` — leaving the player in a dead iframe.
  Replaced with `var SWS_FRAMED=false; try{ SWS_FRAMED=(window.parent!==window); }
  catch(e){ SWS_FRAMED=true; }`, per the contract block. The `{sws:'ready'}` post
  now also fires on `load` as well as at parse, which the contract requires and
  none of the ten did.

`window.SWS_EMBED` is still exported unchanged in all nine — it is read by other
code elsewhere on the fleet and removing it was not this task's business.

## Where each control went, and why there

All ten are the same chassis: a 540x960 `#stage` scaled by
`min(vw/540, vh/960)`, which is **0.694 at 375x667**. So a control needs **72
stage px to clear the 48px touch floor** (72 x 0.694 = 50 real px). Three of the
files say so in their own CSS: *"72px minimums are STAGE px ... Do NOT
'simplify' back to 48 — it renders ~35."* Every control below is 72 stage px tall
and 136 to 152 wide, i.e. **50 x 94..106 real px**.

**Every control went TOP LEFT of the title screen, and the bottom of these
screens is why.** The stage fills a phone viewport almost exactly (540 x 0.694 =
375, 960 x 0.694 = 666), so stage coordinates and viewport coordinates are the
same thing here, and the feedback fab's band (x = W-90..W-12, y = H-174..H-96) maps
onto the bottom of the stage. Worse, it is already occupied:

> **Pre-existing defect found while placing, NOT introduced and NOT fixed here:**
> in the six `.pad.center` games the title's own last button row (How / Wardrobe /
> Grove / ⚙) computes to roughly y = 510..560 real px at 375x667, with its right
> end at x ≈ 333. The fab band is y = 493..571, x = 285..363. **The ⚙ button on
> those title screens sits partly under the feedback fab.** That is the same class
> of defect batch 1 shot on Vine Runner, on six more screens, and it is the
> arithmetic that ruled out putting anything new down there. It needs a screenshot
> and a separate call — I did not move six shipped title screens on arithmetic I
> cannot photograph.

Per game, read off the layout:

| Game | Where | Why there |
|---|---|---|
| **orb-orchard** | `.xrow` chip above the `h1`, left aligned to the 360px button column | `.screen` is `padding:44px 26px` / `align-items:center` / `justify-content:flex-start`, so a first child pins near the top: y = 31..81 real px. Its own `.btnrow` (Grove / Wardrobe / How) is the low row. |
| **tinker-loft** | same, brass palette | Identical `.screen` geometry. Bottom row is Tinker Shop / How. |
| **tonic-drop** | same, but styled comic (2px `#12060a` border, 3px hard shadow, matching `#s-title .btn`) | This title's **entire bottom right is the squirrel**: `.title-mascot` is `bottom:0; right:-14px; width:232px` with `.title-hi` bubble above it. Top left is the only empty corner on the screen, fab or no fab. |
| **silt** | `.xrow` as first child of `.pad`, above the emblem image | `.pad.center` is `justify-content:center`, so the title block is vertically centred and a first child **rides up with the block** instead of being pushed off a busy screen. Lands ~y 87..137 real px. |
| **tempo-grove** | same | Three button rows already; the third is in the fab band. |
| **pollinator-paths** | same | Tallest title of the family (`title-word` wraps to two lines, plus `.whatis` *and* `.ribbon`), so its stack sits lowest. |
| **root-weave**, **sled-vine**, **spore-drift** | same | Same chassis, same reasoning. |

Six of the nine reuse the game's own `.btn.ghost` inside `.xrow` (`width:auto;
min-width:152px; padding:0 26px`) so the exit *is* the game's button, only sized
to its label. The label colour is lifted from `var(--muted)` back to
`var(--cream)` with a one-step-brighter border: a ghost button is styled to
recede, and an exit has to be readable at a glance while still reading as
secondary to PLAY. The three `h1`-style games get a dedicated `.xbtn` painted in
their own palette (sage, brass, comic) because they have no ghost variant.

Copy is `◀ Arcade` everywhere. No dash characters in any player facing string;
every em dash added by this batch is inside a `/* */` comment.

Wiring uses each game's **own** idiom — `tap("b-arcade", …)` in the eight that
have a `tap()` helper, `$("b-arcade").addEventListener(…)` in tinker-loft, which
does not.

## What I checked, and what I could not

Verified mechanically:

- `node satellites/_exit_audit.mjs <the ten>` — **watched all ten go FAIL first**,
  then green one at a time as each was wired. The tool demonstrably reacts to this
  batch. `--self-test` still clean afterwards. The tool was not modified.
- Every `<script>` block in all nine re-parsed through `vm.Script` after editing
  (3 of 3 per file). No duplicate `id`, exactly one `b-arcade` per file, no
  pre-existing `.xrow`/`.xbtn` to collide with, `SWS_FRAMED` occurs 3x per file
  (one declaration, two uses) and clashes with nothing.

Not verified, and stated plainly:

- **No screenshot. Nobody has looked at these nine screens.** Sizes and positions
  above are arithmetic off the CSS and the 0.694 stage scale, not pixels off a
  device. The one thing arithmetic is genuinely safe about is the hazard it was
  used for: a top left control cannot meet a bottom right fab at any viewport size.
- **Six of the nine auto-open their How screen on load** (orb-orchard, root-weave,
  sled-vine, tempo-grove, silt, tinker-loft — Stephen's 2026-07-31 call). So on a
  cold open the exit is **two taps away**, not one: Back on How, then Arcade. Both
  taps are on visible labelled buttons and neither is hidden, so this is not a
  stranding, but it is not one tap either. A second control on the How sheet would
  fix it and would also be a second button on six screens; that is a judgement call
  worth a look before anyone adds it.
- In-game, the way out is `#hud-back` (home) to the title, then Arcade. Every one
  of the nine has that home button already.

## slice-master — SKIPPED, not mine

`satellites/slice-master/AUDIT-NOTES.md` did **not** exist when this batch started
and **did** exist an hour later, written by the Start Here shelf audit. It records
the identical P0 (`SWS_EXIT` defined at index.html:774, nothing ever called it) and
its own fix: `◄ Sky Wolf Studio Arcade` on the title stack plus a second exit on
the result screen. Their file, their fix, untouched here — two agents editing one
title stack is how you ship two exit buttons. It audits PASS on their work.

## Batch result

```
9 fixed (orb-orchard, pollinator-paths, root-weave, silt, sled-vine,
         spore-drift, tempo-grove, tinker-loft, tonic-drop)
1 skipped (slice-master — owned by the Start Here audit)
```

Fleet after both batches: **100 audited, 68 PASS, 6 PARTIAL, 26 GRAFT, 0 STRANDED.**

---

# Batch B — the eleven alphabetical-first stranded games (2026-08-16)

`bramble-court, bramblewick, bridgevine, fence-off, frost-watch, lamplighter,
line-loom, loop-warden, mini-crossword, mosaic-draft, nova-bloom`

All eleven: **STRANDED → PASS**, and verified by driving a real browser, not
only by the checker.

## What was actually wrong — all eleven had the same defect

Every one of these games **already shipped a correct `window.SWS_EXIT`** with the
full referrer path. The checker's baseline said so precisely: *"an exit is
defined but NOTHING calls it"* on all eleven. Two things were missing:

1. **Nothing called it.** No button, no handler, no hit test. Bramble Court even
   documented the wrong assumption in a comment: *"title has no exit needed
   (portal frame handles)"*. There is no portal frame.
2. **The framed branch was gated on `?embed=1`**, a flag the portal never sets
   for a relative `/satellites/` url. So `{sws:'ready'}` never posted once in
   production, and the close branch was dead code. Framing is now detected
   directly (`window.parent!==window`), and ready posts at parse **and** on
   `load`. `window.SWS_EMBED` is left defined because Bramblewick's earn path
   reads it.

## ⛔⛔ The lesson worth keeping: a CSS comment that closes early eats the next rule

The first version of this work shipped a **broken control on nine of eleven
games**, and no text-level check could see it. The CSS I inserted was built from
a shared explanatory comment plus a per-game paragraph, and the shared half
already ended in `*/`. That left the per-game paragraph sitting in the
stylesheet as bare text ending in a second `*/`:

```css
   ...clear of the 48px touch floor. */
   In flow above the FENCE OFF wordmark, which is centred and ... */
#lw-home{ ...the entire rule... }
```

A CSS parser reads a selector until the first `{`. The "selector" here is that
whole paragraph **plus `#lw-home`**, so the parser drops the rule that follows
it. The button rendered at its browser default: about **52x13 px, centred**,
instead of 96x50 and left aligned.

That, not any geometry mistake, is what produced the reported Mini Crossword
defect (heading rendering as "...NI CROSSWORD"). In that first version the same
error deleted the `#s-title{padding-top}` rule and let the `position:absolute`
rule survive, which is exactly the combination that drops a floating chip on a
centred heading.

Three things follow:

- **`node --check` cannot see this, and neither can the exit audit.** Both are
  happy: the HTML is well formed and `SWS_EXIT` is bound and called. Only a
  browser measuring the element catches it. Add a comment-balance check per
  `<style>` block if you generate CSS from templates again.
- **Generated CSS needs its comments balanced per block, not per string.** All
  eleven files now balance: bramble-court 9, bramblewick 4, bridgevine 2,
  fence-off 2, frost-watch 3, lamplighter 2, line-loom 3, loop-warden 2,
  mini-crossword 4, mosaic-draft 5, nova-bloom 7.
- **This is the "looking is part of the job" rule paying for itself.** The exit
  audit went green on all eleven while nine of them had an unusable control.

## ⛔ IN FLOW, NEVER FLOATED

The control is now a **flex sibling above the heading**, not an absolutely
positioned corner chip. A centred heading grows toward *both* corners as the
stage narrows, so a gap measured at one width closes at another and a floated
control has no layout engine to stop it. In flow, the heading moves down
instead — at every width, with no arithmetic to get wrong.

The header-band paddings (`#s-title{padding-top:104px}` etc.) that the floated
version needed are all gone. Nothing replaced them; being in flow is the fix.

## ⛔ These games BOOT INTO THEIR HOW TO PLAY SCREEN, not the title

Measured straight after `load`, `#s-title` is `display:none` and every control
on it reports **0x0**. On a first run these games open `#s-how` (Bramblewick
opens `#coach`). Any probe that measures a title screen on these games has to
walk the first run out of the way first, the way a player does, or it will
report a perfectly good control as invisible. The player still reaches the exit
in one tap from the how sheet's own Back.

## Where each control went, and why there

Ten of the eleven share a **scaled 540x960 stage** (`transform:scale(w/540)`),
so stage px are not rendered px: at 375 wide the scale is x0.694 and the house
rule of 72 stage px lands at **50 rendered px**. Bramblewick is the exception —
full-viewport canvas with HTML panels in real CSS px, so 48 there is 48.

| Game | Placement | Why there |
|---|---|---|
| bramble-court, bridgevine, line-loom | first child of `#s-title`, above the `.pad` | `.pad` is `flex:1`, so the pad simply shrinks; the centred stack re-centres in what is left. Line Loom is the tight one (~780 of 960 stage px) and still fits with no scroll. |
| fence-off, frost-watch, lamplighter, loop-warden, mini-crossword, mosaic-draft | first child of `#s-title`, `align-self:flex-start` | These screens are `justify-content:flex-start` columns; the control takes the top-left slot and pushes the wordmark down. Frost Watch is the tallest (~845 stage px: emblem, four modes, a stats row) and still fits at 375x667 without scrolling. |
| nova-bloom | first child of `#s-title` | `.screen` is `justify-content:center` with a 14px gap, so it joins the top of the centred stack. Restyled to a 6px radius with a sage glow after looking at it: every other button there wears a notched neon frame and a plain rounded chip read as foreign. |
| bramblewick | first child of the menu `.panel` | A chip pinned to the viewport corner would sit on the panel's rounded corner and the left edge of the logo image, because the panel is `width:min(88vw,420px)` and **centred**. The panel scrolls from the top, so first child = always on screen, no hunting. |

Copy is `← Arcade` / `← Arcade` in caps to match each game's own casing, with
`aria-label="Back to the arcade"`. `←` (U+2190) is an arrow, not a dash. No dash
characters in any player-facing string.

**Bottom right avoided everywhere**, per the fab hazard. Worth recording: the
fab now **actively dodges**, and it was caught relocating to the **top right**
on Frost Watch and to the **middle right** on Bramblewick, where it sat on the
stage selector. That is another agent's live work in `/feedback.js` and was not
touched here. It does mean "the fab is bottom right" is no longer a safe
assumption for anyone reasoning about placement by arithmetic alone.

## How this was verified

A browser **was** available (`puppeteer` resolves from the repo root; serve the
**repo root**, not the satellite folder, or `/feedback.js` and `/sunbeam-sdk.js`
404). Three passes, each watched failing first:

1. **`_exit_audit.mjs`** — watched red on all eleven at baseline, green after.
   Self test clean. The tool itself was not modified.
2. **Measure and shoot at 375x667 and 390x844.** Reports the control's rect,
   whether `elementFromPoint` at its centre returns the control itself, and any
   overlapping element. This is the pass that caught the CSS comment bug and the
   boot-into-how-to-play behaviour. Final: every control **96x50 at 375** and
   **100x52 at 390**, both axes over the 48px floor, `hitIsMe` true everywhere.
3. **Tap it and see where you land**, on two journeys: arrived from the portal
   (must `history.back()` to `/portal`) and arrived cold with no referrer (must
   hard load `https://lucidwinds.com/portal/`, intercepted to observe). Driven
   by `page.mouse.click()` at the control's centre — **never `el.click()`**,
   which skips hit testing and passes even when something is sitting on top.
   Result: **all 11 get home on both journeys.** Negative control: the same
   script run against still-stranded games reports "no control" and exits 1.

Screens read, not just measured. Three defects were found by opening the images
rather than by any gate: the CSS comment bug, the boot screen, and the Nova
Bloom chip speaking the wrong visual language.

## Still open on these eleven

- `mosaic-draft` ships `.btn.sm{min-height:48px}` on a **scaled** stage, i.e.
  33 rendered px at 375 wide. Pre-existing, out of scope here, but it is a
  genuine touch-target miss on that game's Wardrobe / How / sound row.
- Nothing here was screenshotted at desktop width. The Aug 16 build night found
  two defects that only appeared at desktop while every phone test stayed green.
