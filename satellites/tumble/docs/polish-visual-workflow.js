export const meta = {
  name: 'tumble-polish-visual',
  description: 'Visual polish review of TUMBLE from a 51 shot tour at Pixel 9 size: table and play, the room, sheets and screens; each checked by a skeptic',
  phases: [
    { title: 'Critique', detail: 'three visual critics reading the screenshots and the code behind them' },
    { title: 'Verify', detail: 'a skeptic per dimension keeps only real, safe polish' },
  ],
}

const ROOT = '/workspaces/lucid-winds/satellites/tumble'
const SHOTS = `${ROOT}/dev/out/tour`
const COMMON = `
You are polishing TUMBLE, a cozy 3D sock sorting web game for phones in ${ROOT} (three.js r186 + Rapier 0.20,
vanilla ES modules, no build step). It is its own game inside the lucid-winds repo: the repo CLAUDE.md rules about
Lucid Winds (ES5, Firebase, the big index.html) do NOT apply here. The contract is ${ROOT}/DESIGN.md; calls already made
are in ${ROOT}/DECISIONS.md. The Director asked to "polish the game and everything" and wants "such a good looking
game". The build works and passes its gates; this pass is about how it LOOKS and READS on a phone.
A screenshot tour at a Pixel 9's CSS size (412 x 915) is in ${SHOTS}/ (NN-name.png) with a description of each shot
in ${SHOTS}/tour.json. The shots come from headless Chrome with SOFTWARE WebGL: shadows and anti aliasing may be a bit
rougher than on a phone; do not report aliasing. Some shots are artificial (the tour granted Lint and unlocks, forced
states); judge what a player would see in that state. Known and already fixed since the tour (do not report):
the Rush score chip sitting mid screen (a flex spacer), odd socks sticking out of the Odd Bin box, many new peg notes
stacked on a result sheet.
Rules for you: READ ONLY. Do not edit files. Do not start a browser. LOOK at the images with the Read tool (it renders
them); open each shot you are asked about. Then read the code behind what you see.
Report only concrete, fixable polish: which shot shows it, what is wrong (overlap, clipping, misalignment, empty or
cramped space, weak contrast, muddy colour, inconsistent style, something that reads as a bug, something that looks
cheap), and the exact change (file, line, new values or code). Studio rules: no dashes in player text, 48 px touch
targets, cozy warm look (midnight is NOT this game; it is a sunny laundry room). No vague advice. 0 findings is allowed.
Rank by what a player notices most; at most 12 findings.
`

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          shot: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'number' },
          impact: { type: 'string', enum: ['high', 'medium', 'low'] },
          title: { type: 'string' },
          problem: { type: 'string' },
          fix: { type: 'string', description: 'the exact change: file, old code or values, new code or values' },
        },
        required: ['shot', 'file', 'line', 'impact', 'title', 'problem', 'fix'],
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
    key: 'table',
    prompt: `${COMMON}
DIMENSION: the table, where the game is played. Shots: 03-drying, 04-dump-early, 05-play-small-first, 06-sock-in-pocket,
07-twin-flying, 08-ball-in-pocket, 09-lob-in-flight, 10-ball-in-basket, 11-mismatch, 12-sweep, 19-rush-timed,
20-rush-spin-cycle, 22-play-mountain, 26-play-deutan (may show the pause menu), 27-inside-out-held, 41-hero-held,
45-balance-tilted, 46-endless, 47-portal-dump, 48-portal-play, 51-play-360.
Code: src/render.js (lights, materials, the sock shader patch, table, dryer, basket, bin, puffs, fog, camera fit),
src/table.js (held pose), src/textures.js, src/app.js (_setupFog, hooks), src/ui.js (HUD CSS), src/config.js.
Look for: the table and pile reading clearly, the held sock and ball presentation, the HUD over the scene (chips,
timer, streak, dots, powers, spread button), lint fog that looks like dirt or smoke instead of soft lint, the Basket
Balance tilt being readable (is there any meter?), the Endless feed, the portal dryer look, lighting that is flat or
muddy, the dryer door and drum, the back shelf, empty or awkward areas of the frame, colours that clash.`,
  },
  {
    key: 'room',
    prompt: `${COMMON}
DIMENSION: the Laundry Room (the home screen and menu). Shots: 01-room-first-run, 15-room-decorated (may be covered by a
result sheet), 16-dryer-modes and 17-dryer-rush (the room behind the sheet), 49-room-portal, 50-room-360.
Code: src/room.js (dresser, door, window, radio, lamp, rug, towel basket, clothesline, decor, reunion gifts, calendar,
posters), src/render.js (room, wall, floor, ceiling, dryer, lights, camera framings), src/screens.js (hotspot tags,
dock, wallet), src/ui.js (their CSS), src/textures.js.
Look for: objects that read as unclear or unfinished (the door, the shelf above the door, the clothesline), weak
composition (big empty areas, the title band), tags that overlap objects or each other, the dock and wallet styling,
the wallpaper, floor and rug, lighting warmth, anything that looks cheap. The room should feel like a cozy, lived in
laundry room at first glance.`,
  },
  {
    key: 'sheets',
    prompt: `${COMMON}
DIMENSION: the sheets and screens (DOM UI). Shots: 02-how-to-play, 13-results-laundry, 14-results-laundry-bottom,
16-dryer-modes, 17-dryer-rush, 18-rush-how, 21-rush-result, 23-pause, 24-settings, 25-settings-bottom, 28-drawer,
29-sock-card, 30-odd-bin, 31-lore-7, 32-clothesline, 33 to 40 door tabs (basket, dryer, decor, radio, ball, trail, pack,
reunion), 42-daily-result, 43-daily-result-bottom, 44-share-card (the 1080 px share image).
Code: src/ui.js (CSS and sheet builders), src/screens.js (Drawer, sock card, Odd Bin, lore, Clothesline, door shop,
swatches), src/app.js (shareDaily canvas, results wiring), index.html (tokens, fonts).
Look for: hierarchy and spacing, cramped or wasted space, swatches that say nothing (a plain colour square for a rug or a
radio), locked items that do not say why, prices and states that are unclear, the Clothesline pegs looking like blank
cards, empty states, headings, the share card composition (text overflow, balance, brand line), buttons and chips that
feel inconsistent across sheets, anything that reads as a debug screen.`,
  },
]

phase('Critique')
const results = await pipeline(
  DIMS,
  (d) => agent(d.prompt, { label: `critic:${d.key}`, phase: 'Critique', schema: FINDINGS }),
  (r, d) => {
    if (!r || !r.findings || !r.findings.length) return { key: d.key, findings: [], verdicts: [] }
    const list = r.findings.map((f, i) => `#${i} [${f.impact}] shot ${f.shot}, ${f.file}:${f.line} ${f.title}\nPROBLEM: ${f.problem}\nFIX: ${f.fix}`).join('\n\n')
    return agent(`${COMMON}
You are the skeptic for the "${d.key}" visual findings below. For EACH one: open the shot it names (Read) and the code,
and check that the problem is really visible and really caused by that code, that the fix is safe (does not break the
gates in ${ROOT}/dev, the rules in DESIGN.md or a documented call in DECISIONS.md), and that the fix would actually look
better on a phone. Improve the fix if it is vague or wrong (give exact values). Keep = false for software renderer
artefacts, taste churn with no clear gain, and risky changes. One verdict per index.

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
