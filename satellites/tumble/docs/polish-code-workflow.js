export const meta = {
  name: 'tumble-polish-code',
  description: 'Polish review of TUMBLE from the code: player copy, feel and sound, accessibility and consistency; each dimension checked by a skeptic',
  phases: [
    { title: 'Critique', detail: 'three critics, one dimension each' },
    { title: 'Verify', detail: 'a skeptic per dimension keeps only real, safe, in-scope polish' },
  ],
}

const ROOT = '/workspaces/lucid-winds/satellites/tumble'
const COMMON = `
You are polishing TUMBLE, a cozy 3D sock sorting web game for phones in ${ROOT} (three.js r186 + Rapier 0.20,
vanilla ES modules, no build step). It is its own game inside the lucid-winds repo: the repo CLAUDE.md rules about
Lucid Winds (ES5, Firebase, the big index.html) do NOT apply here. The contract is ${ROOT}/DESIGN.md; every call the
builder made is in ${ROOT}/DECISIONS.md; status is in ${ROOT}/HANDOFF.md. The Director asked to "polish the game and
everything". The build already works and passes its gates: this pass is about QUALITY a player notices.
Studio rules that bind player facing text: NO dashes of any kind (hyphen, en dash, em dash) in anything a player reads
(commas, semicolons, colons and periods instead; a hyphen inside an id, CSS, code or a file name is fine); the studio is
"Sky Wolf Studio"; touch targets at least 48 px; text at least 0.7rem; cozy, warm, lightly funny voice; no ads,
no analytics, nothing that shames the player.
Rules for you: READ ONLY. Do not edit files. Do not start a browser or run the browser gates (another process is using
the two cores). You may run Node: cd ${ROOT} && node tests/<name>.test.mjs, or small node -e probes of src/ and engine/.
Report only concrete, fixable polish with a file, a line, what is wrong, and the exact change you would make (new text,
new value, new code). No vague advice ("consider improving"). Quality over quantity; 0 findings is allowed.
Rank by what a player would notice most.
`

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          impact: { type: 'string', enum: ['high', 'medium', 'low'] },
          title: { type: 'string' },
          problem: { type: 'string' },
          fix: { type: 'string', description: 'the exact change: old text or code and the new text or code' },
        },
        required: ['file', 'line', 'impact', 'title', 'problem', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const VERDICTS = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'number' },
          keep: { type: 'boolean' },
          why: { type: 'string' },
          fix: { type: 'string', description: 'the fix to apply if kept; improve it if the critic fix was wrong or risky' },
        },
        required: ['index', 'keep', 'why', 'fix'],
      },
    },
  },
  required: ['verdicts'],
}

const DIMS = [
  {
    key: 'copy',
    prompt: `${COMMON}
DIMENSION: every word a player reads. Read ${ROOT}/src/ui.js, src/screens.js, src/app.js (hints, titles, results,
settings, share card), src/play.js and src/game.js (hints), index.html (boot and file notices), data/lore.json,
data/unlocks.json (names, desc), data/clothesline.json (name, effect, hint), data/hero-socks.json (hero names and
flavor; it is one big line, use node -e to list them), engine/sockgen.js sockName (generated sock names).
Find: any dash in player text (search carefully, including data files and generated names), typos, grammar,
wrong plurals ("1 Loads"), inconsistent capitalisation of game nouns (Load, Lint, Quarters, Reunion, Odd Bin, Drawer,
Clothesline, Rush, Laundry Day, Sweep), hints that explain the controls wrongly compared with src/play.js, copy that
is flat where it could be warm, copy that is too long for a 412 px phone line, and names that clash with real brands.
Do not rewrite the lore voice wholesale; fix only real problems.`,
  },
  {
    key: 'feel',
    prompt: `${COMMON}
DIMENSION: feel and sound, the "juice". Read ${ROOT}/src/audio.js, src/app.js (the hooks that call sounds, haptics,
puffs, popups), src/play.js (gesture timings, flights, the roll into a ball), src/table.js (flight arcs, held pose,
spins), src/render.js (basket bump, puffs, trails, camera moves), src/config.js and DESIGN.md sections 3.1 and 11.
Find concrete moments that feel flat, abrupt, silent or wrong: a cue named in DESIGN 11 that never plays or plays at
the wrong time, a sound that is too loud or clicky (inspect the synth envelopes: attack under 3 ms clicks, gains over
0.5 clip when stacked), haptics on misses (DESIGN forbids), flights that end with a visible snap (a flight target that
differs from where the physics body is placed), timings that are too slow or fast for a thumb (for example the 0.34 s
wait before a fetch), missing feedback (a power used with too few dots, a locked size tapped, a basket settle),
reduce motion ignored somewhere (camera moves, puffs, spins). Give exact numbers.`,
  },
  {
    key: 'access',
    prompt: `${COMMON}
DIMENSION: accessibility, layout robustness and consistency in the DOM layer. Read ${ROOT}/index.html (CSS tokens),
src/ui.js (all CSS and markup), src/screens.js, src/app.js.
Find: text under 0.7rem, text colour on its background with too little contrast (compute it: WCAG AA 4.5:1 for body,
3:1 for large text; tokens are in index.html :root and ui.js CSS), buttons or tabs under 48 px tall or wide, buttons
without accessible names, sheets without focus handling (focus the sheet or its first control on open, restore on
close, Escape closes a dismissable sheet), live regions that spam, elements that can overflow a 360 px wide screen,
safe area insets not applied (notch and gesture bar), hover only affordances, inconsistent radii, shadows or spacing
between similar components, and the Reduce motion setting not also honouring prefers-reduced-motion as a default.
Give exact CSS or code.`,
  },
]

phase('Critique')
const results = await pipeline(
  DIMS,
  (d) => agent(d.prompt, { label: `critic:${d.key}`, phase: 'Critique', schema: FINDINGS }),
  (r, d) => {
    if (!r || !r.findings || !r.findings.length) return { key: d.key, findings: [], verdicts: [] }
    const list = r.findings.map((f, i) => `#${i} [${f.impact}] ${f.file}:${f.line} ${f.title}\nPROBLEM: ${f.problem}\nFIX: ${f.fix}`).join('\n\n')
    return agent(`${COMMON}
You are the skeptic for the "${d.key}" polish findings below. For EACH one, open the file and check:
1. Is the problem real in the current code (not already handled elsewhere)?
2. Is the fix safe (does not break game rules, tests, the gates in ${ROOT}/dev, DESIGN.md or a documented call in DECISIONS.md)?
3. Is it worth doing now (a player would notice), and is the fix complete and exact? Improve the fix if needed.
Keep = false for anything speculative, cosmetic churn, or risky. Return one verdict per index.

FINDINGS:
${list}`, { label: `verify:${d.key}`, phase: 'Verify', schema: VERDICTS })
      .then((v) => ({ key: d.key, findings: r.findings, verdicts: (v && v.verdicts) || [] }))
  },
)
const kept = []
let total = 0
for (const r of results.filter(Boolean)) {
  total += r.findings.length
  for (const v of r.verdicts) {
    const f = r.findings[v.index]
    if (f && v.keep) kept.push({ dim: r.key, ...f, fix: v.fix || f.fix, why: v.why })
  }
}
log(`kept ${kept.length} of ${total} findings`)
return { kept, dropped: results.filter(Boolean).flatMap((r) => r.verdicts.filter((v) => !v.keep).map((v) => ({ dim: r.key, title: (r.findings[v.index] || {}).title, why: v.why }))) }
