# The feedback fab was covering games' own buttons

2026-08-16. Fleet-wide fix in `feedback.js`, the shared bug-report chip every
game on lucidwinds.com loads. No game was edited.

## What was actually wrong

Three screenshots, three page shapes, one cause:

| Game | What the fab covered | Page shape |
|---|---|---|
| Vine Runner | the primary **RUN** button, and the game's own exit underneath it | full-screen how-to-play sheet |
| Sprout Dice | **All Sky Wolf games** | title screen |
| Bramblewick | the **Reduced motion** toggle | ordinary rows in a scrolling settings list — **no overlay at all** |

The fab is fixed to the bottom-right gutter at `z-index:2147482000`. Two billion:
nothing a game can do out-stacks it. And its footprint was bigger than it looked
— a 48px tap zone hung off the corner at `-30px/-34px` behind a 24px dot, so a
chip that reads as a 48px circle actually blocked **78x78** (mini) / **82x82**
(pill), reaching 30px up and left into the middle of the screen.

Bramblewick is the important one. It says the defect is not "a sheet opens under
the fab" — it is **"anything the player can tap ends up under the fab"**. Overlay
detection alone would have fixed two of these three.

## What shipped

**1. It detects, it does not get told.** Five `document.elementsFromPoint` probes
inside the fab's own footprint, on a self-rescheduling timeout: 600ms after
input, 2s idle, nothing at all while the tab is hidden or the form is open. That
one browser primitive answers `display:none`, `opacity:0`,
`pointer-events:none`, z-order, transforms and scroll position correctly and for
free — every one of which a hand-rolled DOM scan gets wrong.

It yields when either:

- **CONTROL** — something tappable is under the footprint. `button`, `a`,
  `input`, `[role=button]`, an `onclick`, a `.btn`-ish class, or any element with
  `cursor:pointer` that is not a full-bleed surface. *This is the general fix and
  it is what catches Bramblewick, where there is no overlay to find.*
- **COVER** — an element under the footprint covers most of the viewport, is
  visible, is **layered** (something large that is not its own ancestor is
  painted beneath it), **and has no controls we can identify**. This is the blunt
  fallback for sheets whose buttons we cannot see at all.

**2. It parks, it does not vanish.** It searches a ring of candidate spots and
takes the first that is **empty**. Only if nothing on the ring is even
control-free does it fade, and even then a hard 20-second ceiling brings it back.
Two consecutive clear scans return it to exactly where it was, **including a spot
the player dragged it to**. Every move is a 180ms transition, never a teleport.

**3. The chip is honest now.** Tap zone stays 48px (project rule), but the offset
is pulled in from `-30/-34` to `-26` so it overlaps the fab's own corner instead
of hanging free, and the dot grows 24 → 28px. Footprint **74x74**, and the
invisible reach past the visible dot halves from 30px to 14px. One rule for every
surface now — the `.lwfb-mini` override is gone, so what the scanner measures is
what ships.

**4. It fails open.** Any throw restores the fab immediately; three throws retire
the watcher for good, leaving exactly yesterday's behaviour. No hit-testing on
the browser → detection switches itself off. `window.LW_FB_NO_YIELD = true` kills
it outright. Yielding never writes `display:none` — it sets a data attribute the
stylesheet acts on, so if the stylesheet never landed the fab simply stays
visible.

## Second pass — after the fix was shot on Bramblewick

The mechanism worked and the toggle was clear, but **the parked position read as
a glitch**: the chip landed mid-left straddling the edge of the centred menu
panel, half on the panel and half on the page behind it, across a line of body
text. Independently, a park was seen on Frost Watch's top-right and on
Bramblewick's **stage selector** — so at least one park had landed on a control.

That last one is the important one. **Parking on "no control I can RECOGNISE" is
not the same as parking on nothing.** `fyIsControl` cannot see a plain div with a
click handler bound in JS and no role, no class and no pointer cursor — and a
stage selector is exactly that. So the parking test changed question:

> **EMPTY** = every probe point resolves to the *same* topmost element, and that
> element is a big flat surface (≥50% of the viewport in **both** axes), or there
> is nothing there at all.

One test, three jobs. No content under the chip. **No straddling** — if one
corner is on the panel and another is on the page behind it, the topmost elements
differ and the spot is rejected, so the half-on-half-off look is impossible by
definition rather than by a list of anchors. And **no unknown controls**, because
anything we cannot identify is still content, and content is enough to reject a
spot.

Both axes matter: a centred menu panel is tall and counts as a surface to sit on;
a paragraph is wide but short and does not.

Four other things came out of that pass:

- **Two rings, not five anchors.** Outer ring in the viewport's edge band, inner
  ring one step in. The inner ring is needed because a centred panel's gutters
  are often *narrower than the chip* — Bramblewick's are ~60px against a 74px
  footprint — so "wholly outside the panel" is not always available. Wholly
  *inside* it, up in an empty corner, still reads as deliberate.
- **Nearest first.** The shortest move that works is the one a player can follow.
- **Sift, then verify.** One probe per candidate across the whole ring, then the
  full five-probe test on the best twelve. A nearest-first five-probe search
  capped at N spots could stop before it ever reached a clean one and settle for
  a merely-control-free spot — which is how it clipped the stage selector.
- **8px of clearance** when testing a spot. Probes sit 6px inside the box, so
  without padding a candidate could clip the last two pixels of a button and sail
  straight past it.

**Cost, measured:** 55 hit tests for an entire search, 8 per scan once parked.

### Making the move visible

A transition from `right`/`bottom` to `left`/`top` **does not animate** — the
start value is `auto`, so the chip teleports. It now pins its current position in
px, flushes that, and only then writes the target, so the 180ms ease actually
plays. The return home is animated the same way and hands the position back to
the stylesheet 260ms later (same pixels, nothing to see) so `env(safe-area-inset)`
and rotation keep working. A finger drag turns the easing off so it does not lag.

## Costs

No `MutationObserver` (a game mutating its HUD every frame would storm it). No
document-wide `querySelectorAll` (cost would scale with page size; this does
not). At most five hit tests per scan, and zero in a background tab. `scroll` is
a wake event — Bramblewick's defect arrives with nothing but a scroll to notice
it.

## Verification: `node feedback_check.mjs`

No browser on this box, so the checker does the two things source can prove.
**73 checks pass. `--self-test` breaks the file 13 different ways and every one
of them goes red** — including four that were watched staying green first and had
to be strengthened.

It builds a stub DOM in node and runs **the real `feedback.js`** inside it with
`node:vm` — not a mirror of the logic, the file itself. The stub's geometry is
parsed out of the CSS in `feedback.js`, so it cannot drift from what it tests.
Its hit test is deliberately generous — no visibility filtering — so the
visibility decisions under test belong to `feedback.js` and not to the checker.

Scenarios: plain canvas game (must not move) · full-bleed `cursor:pointer`
background (must not read as a button) · Vine Runner sheet (must come off RUN
*and* off the sheet's ✕) · sheet opens then closes (must return to the exact
pixel, no inline residue) · `display:none` sheet · inert `opacity:0` +
`pointer-events:none` screen (the hues/budburst shape) · untappable full-bleed
HUD · Bramblewick's scrolled toggle (and it must return when the list scrolls on)
· every anchor blocked → fades, then the ceiling fires and it stays visible ·
detection throws → unmoved, visible, watcher retires · our own form open ·
hidden tab costs zero · dragged fab yields and returns *to the dragged spot* ·
layered modal with no controls · nested full-bleed wrappers (must **not** read as
a modal).

### Bugs the checker caught in my own fix

1. **The cover rule misfired on menus.** Bramblewick's settings list is a
   full-bleed sibling over the game wrapper, so "layered cover" stayed true the
   whole time the menu was open — the fab would have camped in the corner it fled
   to long after the toggle scrolled away. Now a cover with visible controls
   defers to the point test.
2. **The Bramblewick scenario was passing for the wrong reason.** The
   `cursor:pointer` size guard was width-only, and a settings row is 94% of a
   phone's width — so the row was thrown out as "a background" and the scenario
   only went green via the cover rule. Guard is on both axes now (a row is 7% of
   the viewport's height), and the check asserts *why* it yielded.
3. **Duplicate candidates starved the search.** The four edges of a ring share
   their corners; enough duplicates ate the verify budget before any second-rank
   spot was reached and the fab faded instead of parking.
4. **The ES5 check called a comment an arrow function.** `6 stops per edge => 24
   candidates` is prose. Comments are stripped before that grep now — the same
   lesson the service-worker audit learned when workers that *explained* a bug in
   their header were reported as having it.

And four self-test mutants stayed green on broken builds and had to be rewritten,
including one whose patch string had silently drifted so it was "testing" the
healthy file. The self-test now refuses any patch that changes nothing.

## What I could not verify without eyes

- **Whether it looks right.** The first version of this fix passed every check
  and still looked broken on a phone — that is the whole reason for the second
  pass above, and it took a screenshot to find. The new rule makes straddling
  impossible and the move visible, but nobody has watched *this* version move.
- **Narrow-gutter pages.** When a panel's gutters are thinner than the 74px
  footprint, the chip parks *inside* the panel instead of beside it. That is the
  intended fallback and it should read fine, but it is unseen.
- **Canvas-painted controls.** A button drawn into a canvas has no DOM node and
  cannot be hit-tested. The cover rule catches those only when they sit under a
  layered DOM sheet with no other controls in it. Dewball's `#introCard` and any
  canvas-drawn menu are the risk.
- **Real hit-test ordering.** The stub sorts by z-index then document order.
  Browsers resolve stacking contexts, `transform`, `filter` and `will-change` in
  ways the stub does not model. A game that builds a sheet inside a transformed
  ancestor could order differently.
- **Whether five anchors are enough** on a real sheet, and whether the parked
  position ever lands somewhere ugly (over a headline, half off a rounded
  corner).

## Notes for whoever deploys

- **No game-side change is needed, and none was made.** `.htaccess` already sends
  `no-cache, must-revalidate` for `feedback.js` by name, so the 85 satellites
  that pin `feedback.js?v=6` will revalidate and pick this up. The `?v=` does not
  need bumping.
- **Vine Runner's local patch is now redundant but harmless.**
  `body.vr-how-open .lwfb-fab{display:none!important}` still wins; the scanner
  measures a 0x0 rect and stands down. It can be deleted whenever that game is
  next touched — not by me, another agent owns that folder.
- Nothing under `satellites/`, `party/`, `hush/`, `padlab/` or `loaf.html` was
  edited.
