# The shared core loader, proven (Fable, 29 Oct 2026, Node 24.21 on this box)

`node harness.js` here prints `CORE LOADER OK`. It is the mechanism BUILD-PLAN.md section 1.2 rests on, reduced to
two blocks: the harness reads `index.html` as text, extracts every `<script id="core-NAME" data-core>` block with one
regular expression in document order, asserts the order and that no block contains `</script`, and runs each block
as its own `vm.Script` (with `lineOffset`, so a stack trace points at the real line of the page) in ONE fresh
`vm.createContext({})` that a poison prelude has made hostile: `Math.random` and `Date` throw, and `document`,
`window`, `setTimeout`, `console` simply do not exist. Every block attaches to `globalThis.SB`, which is `window.SB`
in the browser and `ctx.SB` in the harness. Typed arrays made inside the context are another realm's (`instanceof`
is false in the harness; compare by length and bytes, never by class).

The plan's section 1.2 names the exact tag, regex and block order for the game; where it differs from this file the
plan wins. This folder exists so that hour one of the night does not spend itself rediscovering the mechanism.
