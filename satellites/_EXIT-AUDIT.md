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
There is no browser here. Placement above was done by reading each layout, and
none of it has been looked at on a screen. That is the open risk on this task.

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
