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
