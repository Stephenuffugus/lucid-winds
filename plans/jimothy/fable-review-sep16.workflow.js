export const meta = {
  name: 'jimothy-steam-pad-review',
  description: 'Fable adversarial review of the Jimothy controller v2, crisp canvas and Steam overlay changes before build r5',
  phases: [
    { title: 'Find', detail: 'three Fable reviewers, one lens each', model: 'fable' },
    { title: 'Verify', detail: 'a Fable checker per lens reproduces or refutes each finding', model: 'fable' },
  ],
}

const CTX = `You are reviewing a release-critical change to Jumping Jimothy, a portrait HTML5 hopper game that ships on Steam in about 36 hours (Friday Sep 18, 10:01 EDT) inside an Electron shell.

Read these first:
- /workspaces/lucid-winds/plans/jimothy/HANDOFF-STEAM-PAD-SEP16.md (the owner's test notes verbatim, the causes, the fix plan)
- The change itself: run \`git -C /workspaces/lucid-winds show 04b6ef43 --stat\` and \`git -C /workspaces/lucid-winds show 04b6ef43 -- satellites/stream-hop/index.html store/jimothy-steam/main.js\`
- The game: /workspaces/lucid-winds/satellites/stream-hop/index.html (430 KB; read the parts you need by searching, do not read it whole). The new controller code is the block starting "GAMEPAD v2" inside boot(). sharpen() sits next to fit().
- The gate: /workspaces/lucid-winds/satellites/stream-hop/test/gamepad-check.mjs (run from satellites/stream-hop with \`node test/gamepad-check.mjs\`; about 2 minutes). It boots the real page in headless Chrome with a fake pad. Copy its harness (fake navigator.getGamepads, holding buttons for frames, the local server) for your own probes.

The Steam build is the same index.html with window.__STEAM_BUILD === true (set it with evaluateOnNewDocument), no /music-unlocks.js, no service worker, loaded from file:// in Electron 32. The player's pad is a PDP Afterglow wired Switch controller seen by Chromium on Windows as a raw HID pad (mapping ''), buttons Y B A X L R ZL ZR - + LS RS Home Capture, D-pad as a hat on axis 9 (value -1 + k*2/7, neutral 9/7). Steam Input may also be on for some players, which presents an Xbox-style standard pad.

Rules:
- Do NOT edit any file in /workspaces/lucid-winds. Report only. Put any probe scripts in /tmp/claude-1000/-workspaces-lucid-winds/0f1e4cc5-4425-4cb4-b9ad-840ea4550be3/scratchpad/review/ (create it). A probe that needs the repo's node_modules can be copied into satellites/stream-hop/test/ under a name starting with _review_ and MUST be deleted when you finish.
- This machine has 2 CPU cores: run one headless browser at a time.
- Only report what you have evidence for: a line of code you read and reasoned about, or a probe you ran and its output. Say which. Rank by what would hurt a paying Steam player on Friday.
- Never claim a finding you did not check. "Could be" findings go in as severity "question".`

const FIND_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor', 'question'] },
          where: { type: 'string', description: 'file:line, function, or screen id' },
          evidence: { type: 'string', description: 'what you read or ran, and what it showed' },
          fix: { type: 'string', description: 'the smallest change that fixes it' },
        },
        required: ['title', 'severity', 'where', 'evidence', 'fix'],
      },
    },
    checked: { type: 'array', items: { type: 'string' }, description: 'things you checked and found fine' },
  },
  required: ['findings', 'checked'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          real: { type: 'boolean' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor', 'question', 'not-a-bug'] },
          why: { type: 'string', description: 'how you reproduced or refuted it' },
          fix: { type: 'string' },
        },
        required: ['title', 'real', 'severity', 'why', 'fix'],
      },
    },
  },
  required: ['verdicts'],
}

const LENSES = [
  { key: 'pad-logic', prompt: `${CTX}

YOUR LENS: the controller logic, by reading the code and probing it.
Hunt for: a pad layout the detection gets wrong (Xbox pads made by PDP or PowerA, 8BitDo, DualSense, Steam Input's virtual pad, a second pad at index 1, reconnects); hat decoding errors (an axis wrongly marked as a hat, a trigger read as a stick); the stick latch in a run (can a hop be lost, doubled, or stuck repeating); focus and scroll logic that can strand the player (a screen or overlay with no reachable way out, a cursor that vanishes, a scroll that fights the cursor, the CSS-scaled stage and scrollTop units); B doing something destructive (leaving a run, claiming, buying, confirming a danger dialog); A on a text input; sfx spam; anything that throws inside poll() (it is wrapped in try/catch, so a throw silently kills input for that frame and may repeat forever).` },
  { key: 'render-shell', prompt: `${CTX}

YOUR LENS: sharpen(), fit() and the Electron shell change.
Hunt for: canvas context state the game sets once and never again (a resize resets imageSmoothingEnabled, font, globalAlpha, lineWidth, filters, textBaseline), which would silently change how every later frame draws; a resize during a live run (window drag, fullscreen toggle with F11 or Alt+Enter, a monitor change) causing a black flash, a stretched frame or a crash; memory or fill-rate risk from the 2.5x cap on a 4K TV with a weak integrated GPU; anything else in the pipeline that still makes the picture soft at 1080p or 4K (the stage uses transform: translateZ(0) scale(s); sprites are baked into offscreen canvases); whether a 10 Hz webContents.invalidate() is enough for Steam overlay notifications on a still menu, and whether electronEnableSteamOverlay(true) changes anything else in steamworks.js 0.4.0 (the package source is unpacked at /tmp/claude-1000/-workspaces-lucid-winds/0f1e4cc5-4425-4cb4-b9ad-840ea4550be3/scratchpad/sw-pkg/package/). Measure with headless Chrome where you can (viewport 1920x1080 and 3840x2160 with deviceScaleFactor 1 and 2).` },
  { key: 'screen-sweep', prompt: `${CTX}

YOUR LENS: drive EVERY screen and overlay with the raw Afterglow pad in Steam mode, like a player who never touches the mouse.
Screens (ids): s-splash, s-title, s-games, s-levels (its list #lv-list scrolls), s-how, s-set, s-music, s-feedback (has text inputs), s-support, s-pause, s-ach, s-skins (Shop and Collection tabs), s-clear, s-go, s-intro. Overlays: the code box (Settings, Redeem a code), the confirm dialog, the reveal card (#bin-reveal), the in-run coach card. SH_DEV (present with ?shtest=1) has show(id), start(mode) and more; buttons can be clicked programmatically to REACH a screen, but every claim about control must come from pad input through the real poll loop.
For each screen report: can the cursor reach every control, does B go back (or close the overlay) to the right place, does the cursor stay on screen, is anything only usable with a mouse. Take screenshots of anything wrong and LOOK at them with the Read tool; name what you saw.` },
]

phase('Find')
const results = await pipeline(
  LENSES,
  lens => agent(lens.prompt, { label: 'find:' + lens.key, phase: 'Find', schema: FIND_SCHEMA, model: 'fable' }),
  (found, lens) => {
    const list = (found && found.findings) || []
    if (!list.length) return { lens: lens.key, found, verdicts: [] }
    return agent(`${CTX}

You are the adversarial checker for the "${lens.key}" review. For EACH finding below, try to prove it wrong first: read the exact code, run a probe, and only mark it real if you reproduced it or the code plainly does it. Correct the severity (a paying Steam player on Friday is the yardstick). Give the smallest correct fix.

FINDINGS:
${JSON.stringify(list, null, 1)}`, { label: 'verify:' + lens.key, phase: 'Verify', schema: VERDICT_SCHEMA, model: 'fable' })
      .then(v => ({ lens: lens.key, found, verdicts: (v && v.verdicts) || [] }))
  },
)
const real = []
for (const r of results.filter(Boolean)) for (const v of r.verdicts) if (v.real) real.push({ lens: r.lens, ...v })
log(real.length + ' confirmed findings')
return { confirmed: real, raw: results }
