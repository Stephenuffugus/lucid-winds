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

**Audio is a voice table, one play per call, and a render through the same builders.** 2026-09-15. RESONARC does not
exist, so `audio` is written fresh in the fleet's WebAudio shape: a game defines voices as `build(ac, out, t, rand)`,
each setting every gain it makes, and plays one per event; `renderLoud` builds the same voices into an
`OfflineAudioContext` and reads peak, rms and the share above 3 kHz off the buffer. The demo's two voices are a wooden
tock on placing and a two note chime when the truth shows, the same on every path. The master sits at 0.8.

**The seeded render is held to one part in a hundred thousand, not to exact equality.** 2026-09-15. Chrome's offline
renderer is not bit identical between renders: three renders of one seeded pattern gave peaks 0.24540889, 0.24540892
and 0.24540888. Rendering the noise from `Math.random` instead misses the bound by 3.3e-2 on the peak, so the bound still
tells a seeded render from an unseeded one.

**The reveal takes an `onTruth` callback, called once on the frame the truth begins.** 2026-09-15. It is the one place a
game hangs the reveal's single sound, so the chime cannot drift from the picture and cannot be played twice.

**The flash stamps its paint on the frame after the stimulus goes up, and decides its hide by where the hide will
paint.** 2026-09-15. A frame's callbacks run before it paints, so the stimulus made visible in one frame is first on
screen when the next frame begins; that frame's timestamp is `shownAt`, and reaction time from it leaves out a slow
render (S2). The same reasoning decides the hide: each frame asks `hideNow(thisFrame + interval, deadline, interval)`, so
the hide that paints nearest the deadline is the one taken. The mask goes down in the hide's own frame, and a flash
without `onMasked` warns once on the console (S3). Measured here at 17 ms frames: 100, 400 and 750 ms flashes showed for
100, 400 and 750 ms.

**The session is pure, with time handed in, and an end is final.** 2026-09-15. `sessionStep(state, { type, at },
config)` ends at the run length or when the hard cap passes, and returns the ended state unchanged for anything after:
no round six, no reopening, and the moment of the end never moves. The handoff puts CAIRN's five minute cap here so any
game can have one; CAIRN is cut and the cap stays.

**`adaptClassify` scores answers against rules over the discriminating items only, and returns every rule above the
threshold.** 2026-09-15. A response is `{ item, answer }` and a rule is a function from an item to the answer it would
give. A match is the share of discriminating items (the ones where the rules do not all agree) on which the answer is
the rule's; counted over every item, the plain ones would lift every rule toward the truth. The result is `{ enough,
matches, above, code, confidence }`: `enough` false below `minItems` or `minDiscriminating`, `above` every rule at or
over the threshold with the best first, and `code` a rule only when it is the one above. The game names what that
means. GAUGE reads truth together with L or S above as an apparent expert and nothing above as unclassified, which is
its own table and not CORE's. YONDER's log against linear fit is a regression on placements, not a pattern over
categorical answers, and stays YONDER's `fitModels`.

**The shared assertions return `{ ok, detail }`, and a game cannot import one that has not been proved red.**
2026-09-15. `test/shared.mjs` holds the checks the nine games would otherwise write nine times; each takes a page opened
with CORE's harness or a folder, and asserts nothing about a game it was not handed. `test/shared-proof.mjs` runs every
one green on the live demo and red on a planted fault, and it is a gate in `tools/check.js`, so an assertion that stops
being able to fail stops the check.

**`assertTimingPicksNearest` stands in for the handoff's `assertFrameRate`.** 2026-09-15. Sixty frames a second under a
4x throttle is not measurable on this box (plan 3.5); a flash landing on its duration at the frame rate the page
actually ran is, and it is the property the frame rate was protecting.

**The catalog's forbidden words are a raw scan; a game's own words are matched in copy only.** 2026-09-15. `IQ`,
`brain train`, `smarter`, `cognitive enhance` and `brain power` should not appear anywhere a browser loads, comment or
not. A game's words (SPAN's `answer`, `solve`, `equals`) are a rule about what a child reads, and code may name a field
`answer`: they are matched in a page's text and in string literals with the comments taken out. The raw version went red
on a comment in `core/pure.js`.

**The teacher's link builder lives at `satellites/math/config/` and builds from the schemas games register.**
2026-09-15. CORE 2.9 asks for one page that serves all ten; the catalog plan puts it beside the core. Each game
registers `{ label, path, schema }` in `config/schemas.js`, where `schema` is the same object its own page hands to
`parseConfig`, so a control can only offer what the game will accept. `buildQuery(values, schema)` in `pure.js` is
`parseConfig`'s inverse: it carries only what differs from the defaults, in the schema's order, and never a value or a
key the schema would refuse. A link of nothing but defaults is the bare game.

**Until SPAN exists, the builder carries the demo and a draft SPAN schema, and SPAN's `standard` override is not
offered.** 2026-09-15. The draft is `mode` (True or not, The blank, Relational, SPAN's v1 Modes 1 to 3) and `count` (the
items in a run), under SPAN's working title. SPAN's handoff asks Stephen whether a `?standard=0` teacher override should
exist at all, since it would switch off S1, the mix of standard and nonstandard equations that is the intervention.
The smallest reasonable choice keeps S1 whole: the builder offers no such control, and SPAN's own plan revisits the
schema when SPAN is built.

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
