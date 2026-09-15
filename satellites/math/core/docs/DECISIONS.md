# CORE decisions log

Every choice the build made that the CORE handoff and `plans/math/CATALOG-PLAN.md` did not make for it, newest
last, one bold line of what and the why (`plans/math/HANDOFF-CORE.md` section 10).

**The pure half is its own file.** 2026-09-15. `core/pure.js` holds what can be computed without a screen (the rng
first, then adapt, the line's geometry, the flash's frame choice, the store's migration, the URL parser, session and
collect arithmetic) and `core/core.js` will import it and add the DOM half. The catalog plan's law is that the
engine is pure and imported by Node directly; a single file mixing both would turn the purity lint into a list of
exceptions. The handoff's API names stay, re exported from `core.js`, so no game imports `pure.js` itself.

**Node reads the runtime `.js` as modules through `satellites/math/package.json` (`"type": "module"`).** 2026-09-15.
The root `package.json` declares no type, so Node would read `export` in a `.js` as CommonJS and every gate would die
on the first line. The host serves `.mjs` as text/plain, so renaming the runtime files is not an option. The same
setting makes `tools/check.js` an ES module, unlike the twelve's CommonJS runners.
⛔ The root `.gitignore` (line 98) ignores every `package.json` at every level and lists the ones that are not dev
tooling as exceptions (`store/jimothy-steam`, `store/ftw-steam`). The P0 commit went out without this file and a fresh
clone would have died on `export`. It is added with `git add -f`, which a tracked file needs only once; the exception
line `!satellites/math/package.json` belongs in `.gitignore`, which is outside this fence, and is a request to Fable.

**The rng is the fleet's mulberry32.** 2026-09-15. The same stream as `satellites/wardian/index.html` `makeRNG`, so a
seed means the same thing in a math game as in the twelve, and it is proved uniform on twenty seeds, not one.

**CORE's lint hands `tools/dupkeys.mjs` a view with `export ` and `Object.freeze(` blanked.** 2026-09-15. The shared
sweep (read only, outside this fence) opens a literal only on a line starting `var`, `let` or `const NAME = {`, which
is the twelve's shape; a module's `export const NAME = Object.freeze({` was never opened, and the first planted
duplicate went green with "0 literals read". The blanks are the same length, so line numbers still point at the file.
Like the shared sweep, it reports a duplicate only across lines.

**Player copy lives in one `COPY` object in `core.js`, and the lint refuses a sentence written to the page from
anywhere else.** 2026-09-15. A copy scan can only read the strings it knows about; Wardian's pouch carried a store word
for a fortnight in a string no scan read. So the scan reads `COPY` and every page's text, and a separate rule fails any
`textContent`, `innerText`, `innerHTML` or `aria-label` given a literal sentence directly.

**`IQ` is matched as a whole word, the other forbidden strings anywhere.** 2026-09-15. So `liquid` is not a finding and
`an IQ boost` is.

**A line's offset is capped at what its width leaves.** 2026-09-15. The handoff's N1 ranges (`widthPct: 0.72 + r *
0.22`, `offsetPct: r * 0.08`) let a 94 percent line start 8 percent in and run 2 percent past its container, past the
edge a child is judging against. `lineGeometry` draws the offset from `min(0.08, 1 - widthPct)`; the spread N1 asks for
is still asserted on twenty seeds, and so is the line staying inside.

**The flash hides on the frame nearest its deadline, and that is the whole schedule law this box can prove.**
2026-09-15. `hideNow(now, deadline, interval)` is true once this frame is nearer the deadline than the next one would
be, so a shown time is within about half a frame of its target at any frame rate; it is proved against synthetic frame
timelines at 16.7, 33.3 and 200 ms with jitter. Sixty frames a second on a school Chromebook is Stephen's to check on the
machine (plan 3.5): headless Chrome here draws a few frames a second in software.

**The browser harness's tap climbs from the landed element to the nearest one that can be clicked.** 2026-09-15. A
thumb lands on whatever is on top, which for the settings gear is the path inside its icon, and an SVG element has no
`click()`; the first run of the layout gate died there. Reach is still proved by `elementFromPoint` landing inside the
control, and the activation bubbles the way a real tap's does.

**The demo declares an empty icon.** 2026-09-15. With no icon Chrome asks the server root for `/favicon.ico`, and the
layout gate's first clean run was red at every size on that 404, which the console reported without a URL. The harness
now records every failed response by its address.

**The demo's round: a fraction, tolerance 0.05, near beyond a quarter of it.** 2026-09-15. The demo is not a game and
its numbers are not a tier table; they are the smallest round that exercises every rule of the reveal. A drop within
0.05 of the truth counts as correct, and a correct drop further than 0.0125 away is near (captioned `close, `). A game
brings its own bands from its handoff.

**The stone is a rounded square, the loupe shows on a touch drag only, and the caption is kept on the stage.**
2026-09-15. Square because YONDER's Y1 (nothing circular) rides on the same renderer. The loupe exists because a thumb
covers the spot being judged, which a mouse does not. The caption is clamped so a truth at either end of the line does
not push its words off a 320 px phone.

**The reveal fades the truth in along a straight line in time, from a `truthAt` it reports.** 2026-09-15. The contract
asks for the same animation on every path; a straight line from a stated instant is what a gate can lay two rounds
over and compare frame by frame, whatever the frame rate. `correct` and `near` are accepted by `reveal.show` and change
nothing it draws, which is rule 4 enforced by what the function does not read.

**CORE's browser gates run in the foreground, one per call, not as one long background run.** 2026-09-15. Three
background runs of the gates (two chains and then `tools/check.js` alone) were stopped by the session's task runner for
low memory. The same four gates run in the foreground one after another passed, with free memory sampled every second:
never below 204 MB free and 4,729 MB available, most of it page cache. The gates are not the cause; the long background
task is what gets stopped. `tools/check.js` is unchanged and still the one command a person runs.

**Sideways overflow is measured against the width the gate asked for, never `innerWidth`.** 2026-09-15. On a mobile
viewport a page wider than the phone widens the layout viewport, `innerWidth` follows it, and the first sideways law
stayed green with the body planted 700 px wide on a 320 px phone.

**The no network law (G2) counts after a stated quiet window.** 2026-09-15. Read at the instant the controls answered,
about 0.4 s after load, it stayed green over a fetch planted every 400 ms. It now counts after the settings round trip
and 1.5 s of idle, and says so in its own line. Anything a game would fetch later than that is the demo gate's longer
session to catch, and a game's own gates after a whole round.
