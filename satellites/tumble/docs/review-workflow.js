export const meta = {
  name: 'tumble-review',
  description: 'Adversarial code review of the TUMBLE build against DESIGN.md and the overnight brief',
  phases: [
    { title: 'Review', detail: 'four reviewers, one dimension each' },
    { title: 'Verify', detail: 'each finding checked by a skeptic' },
  ],
}

const ROOT = '/workspaces/lucid-winds/satellites/tumble'
const COMMON = `
You are reviewing TUMBLE, a cozy 3D sock sorting web game in ${ROOT} (three.js r186 + Rapier 0.20 compat, ES modules,
no build step). It is a separate game inside the lucid-winds repo: the repo CLAUDE.md rules about Lucid Winds (ES5,
Firebase, index.html) do NOT apply. The contract is ${ROOT}/DESIGN.md and ${ROOT}/docs/OPUS_PROMPT.md; the builder's
calls are in ${ROOT}/DECISIONS.md (a documented decision is not a bug unless it breaks the contract).
Rules: READ ONLY. Do not edit files. Do not start a browser (the machine has two cores and a browser gate is running).
You may run the Node tests: cd ${ROOT} && node tests/<name>.test.mjs, and small node -e probes that import modules
from src/ or engine/ (they are plain ES modules; src/physics.js needs "await (await import('./src/physics.js')).initPhysics()").
Report only REAL defects you can point at: a line, the input or sequence that triggers it, and what goes wrong.
No style nits, no "consider", no speculation you did not trace through the code. Quality over quantity: 0 findings is a
fine answer if you found nothing real.
`

const SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'integer' },
          severity: { type: 'string', enum: ['crash', 'wrong', 'ux', 'minor'] },
          title: { type: 'string' },
          trigger: { type: 'string', description: 'exact input or sequence that triggers it' },
          effect: { type: 'string' },
          fix: { type: 'string', description: 'a concrete fix' },
        },
        required: ['file', 'line', 'severity', 'title', 'trigger', 'effect', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const DIMS = [
  { key: 'play', prompt: `Dimension: the table controller and physics glue. Files: src/play.js, src/table.js, src/game.js, src/physics.js, src/input.js.
Hunt for: state machine holes (an entity stuck in 'flying'/'held'/'pocket' forever, play.busy never returning to 0 so a Load never ends,
the hand pointing at a removed entity, a sock matched twice, a ball counted made twice or never), races between game.later() timers and
Load changes (startLoad/abandonLoad while flights or timers are pending), physics bodies left ghosted or kinematic, pose() of a removed body,
gesture sequences that break (tap during a flight, double tap on a flying sock, second tap while pocket, drag from pocket then release over
the bin), and anything in the Sweep that can hang.` },
  { key: 'rules', prompt: `Dimension: rules and data against DESIGN.md sections 3, 4, 5, 7, 9, 12, 13.6. Files: src/session.js, src/loadgen.js,
src/economy.js, src/save.js, engine/sockgen.js, engine/color.js, src/app.js (the parts that call these).
Hunt for: rules that contradict DESIGN (tier table, streak and power rules, Timed/Endless/Balance, Tidy and Clean Load, Quarters, Lint
calibration, Odd Bin and Reunion, lore at exact counts, pegs by doing, Daily determinism), save data that can be corrupted or lost
(migrations, applyResults applied twice, reunion bookkeeping, Drawer duplicates), decoys that could look identical to their base, and
Load generation that can throw or exceed 64 tiles for any size or dryer model (industrial adds 5 pairs; portal adds a hero odd sock).` },
  { key: 'ui', prompt: `Dimension: the DOM layer and player experience. Files: src/ui.js, src/screens.js, src/app.js, index.html, src/room.js (hotspot anchors).
Hunt for: buttons that cannot be reached or are under 48 px, sheets that trap the player (no way back, a paused game that never unpauses,
a results sheet that opens twice), handlers that throw on missing data (the data files data/lore.json, data/unlocks.json,
data/clothesline.json may be missing or partial), innerHTML with unescaped data, player facing copy that breaks the studio rules
(NO dashes of any kind, not even hyphens, in anything a player reads; correct grammar; one sentence descriptions; directions shown before
the first Load), and settings (colour vision, pattern first, warm hands, reduce motion, sound, vibration, export/import) that do not actually
take effect.` },
  { key: 'render', prompt: `Dimension: rendering, performance and memory. Files: src/render.js, src/room.js, src/atlas.js, engine/atlas-worker.js,
src/textures.js, src/audio.js, sw.js.
Hunt for: GPU or memory leaks across repeated Loads and room visits (geometries, materials, textures, DataTextures created per update and
never disposed; room.update rebuilding meshes), shader patches that silently fail to apply in three r186 (a replace() target string that does
not exist in the r186 MeshStandardMaterial chunks, check against node_modules or the r186 source you can fetch with curl from
cdn.jsdelivr.net/npm/three@0.186.0/src/renderers/shaders/), atlas slots mixed up between Loads, worker results arriving after the atlas was
reset, audio nodes that are never stopped, and the service worker precache list naming files that do not exist.` },
]

phase('Review')
const reviews = await pipeline(
  DIMS,
  (d) => agent(COMMON + '\n' + d.prompt, { label: `review:${d.key}`, phase: 'Review', schema: SCHEMA }),
  (r, d) => parallel((r && r.findings ? r.findings : []).filter((f) => f.severity !== 'minor').map((f) => () =>
    agent(COMMON + `
You are a skeptic. Another reviewer claims this defect. Try to REFUTE it by reading the code (and a Node probe if useful).
Default to refuted=true if you cannot confirm the trigger really produces the effect.
Claim (${d.key}): ${JSON.stringify(f)}`, {
      label: `verify:${d.key}:${f.file}:${f.line}`, phase: 'Verify',
      schema: { type: 'object', properties: { refuted: { type: 'boolean' }, why: { type: 'string' } }, required: ['refuted', 'why'] },
    }).then((v) => ({ ...f, dim: d.key, verdict: v }))
  ))
)
const all = reviews.flat().filter(Boolean)
return { confirmed: all.filter((f) => f.verdict && !f.verdict.refuted), refuted: all.filter((f) => !f.verdict || f.verdict.refuted).map((f) => ({ title: f.title, why: f.verdict && f.verdict.why })) }
