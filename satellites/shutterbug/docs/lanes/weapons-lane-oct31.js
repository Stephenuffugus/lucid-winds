export const meta = {
  name: 'shutterbug-weapons-v1',
  description: 'Shutterbug weapons v1 on branch sb-weapons: a build spec from DESIGN 9 and BUILD-PLAN T2.1 to T2.7, then up to four steps, each built, reviewed and fixed, step 1 a complete playable fight',
  phases: [
    { title: 'spec', detail: 'the implementation spec, sliced into steps' },
    { title: 'step 1', detail: 'framework, J1 Boomerang, D1 Anvil Boots, the chest gives a weapon, kills pay' },
    { title: 'step 2', detail: 'from the spec' },
    { title: 'step 3', detail: 'from the spec' },
    { title: 'step 4', detail: 'from the spec' },
  ],
}
const CONTEXT = `You are building Shutterbug's weapons. Shutterbug is a single file mobile pixel art platformer where a photo of a room becomes the level (24x48 grid, 16 colour palette, a pure deterministic core shared verbatim with a Node harness.js, 60 Hz fixed step). It lives at satellites/shutterbug/ (DESIGN.md the design, BUILD-PLAN.md the plan, QUESTIONS.md the decisions, PROGRESS.md the log).
WHY YOU EXIST: Stephen, the director, asked today (31 Oct 2026, about 13:05 UTC): "why dont we have weapons? ... lets make this game fucking awesome!" The weapons are designed (DESIGN.md section 9: three slots riding the three verbs and no attack button; jump weapons J1 to J8 fire on every jump and wall jump with a 0.6 s cooldown that never delays movement; dive weapons D1 to D8 fire on a dive landing and on a ground dash; charms C1 to C8 are always on; one readable effect each; a chest pays 15 Dead pixels and a weapon; the pickup screen shows equipped versus candidate in plain words with the sim paused) and planned as M2 (BUILD-PLAN T2.1 framework, T2.2 jump weapons, T2.3 dive weapons, T2.4 charms, T2.5 stats, T2.7 the compare screen). The overnight build order forbade M2, so the live game (sb-m1-1) has enemies that nothing can hurt (BUILD-PLAN's open question 22, QUESTIONS Q27). TUNING.WEAPONS and WEAPON_TIER (Q52) and a few sim hooks (a weapon's hit, frozen and stunned timers) already exist. Last night he ruled that the chest pays "Dead pixels only" with no weapon words until weapons exist (Q92, Q93); that is built on this branch, and weapons existing is exactly the condition his ruling waited for.
WHERE: the lead pulled weapons forward onto their own branch, sb-weapons, in the git worktree /workspaces/sb-weapons (sparse: satellites/shutterbug, tools/shutterbug-tests, plans and the repo's root files; the tests serve the worktree's own root). The main checkout /workspaces/lucid-winds (branch add-sproing-jumper) belongs to another builder who is shipping sb-m1-2 (the Pause card, which moves Title and Share out of the bottom strip into a pause card) and then sb-m1-3 (a floating thumbstick replacing the rocker, and a levels rule): read anything there, edit nothing there. The lead merges sb-weapons into add-sproing-jumper later, so keep your changes out of the pause card's and the strip's code where you can.
DISCIPLINE (read PROGRESS.md's last few entries for the house style): every behaviour ships with a harness assertion or a browser gate that sees it, and a redwatch row (tools/redwatch.js) that mutates it away and goes RED for the right reason; node tools/check.js --fast --gate <gate> for each browser gate you touch, then node tools/check.js --fast; the core stays deterministic and shared verbatim with harness.js (the lint holds the copies together); a golden moves only through --regold --why "..."; no allocation in step. Player facing copy: plain words, no dashes of any kind, no exclamation marks. Satellites may use ES2020. Visual work is not done until you have LOOKED at it: every effect must read on a phone at 360 px wide, and the climb must stay fun and never stop for a weapon.
NUMBERING: QUESTIONS entries on this branch use Q120 to Q139 only (the main checkout takes Q95 upward). PROGRESS entries and State rows are appended as usual; the lead resolves the merge.`
const RULES = `HARD RULES:
- Work ONLY in /workspaces/sb-weapons on branch sb-weapons. Never touch main or add-sproing-jumper or /workspaces/lucid-winds, never run deploy.sh or portal-card.sh, never stamp the build.
- ONE BROWSER AT A TIME ON THE WHOLE BOX (2 cores, shared with the other builder). Run every command that can launch Chrome (node tools/check.js in any form, node test/*.mjs, browser redwatch rows, tools/shutterbug-tests/shoot.mjs, any puppeteer script) as: flock /home/codespace/sb-drafts/browser.lock <command>. Hold the lock only for that command. Run pure Node work (node harness.js, tools/lint.mjs, non browser redwatch rows) under nice -n 10.
- A long command (check --fast takes about 20 to 30 minutes, longer while the other builder holds the lock) runs detached so a Bash timeout cannot kill it: (setsid nohup bash -c 'cd /workspaces/sb-weapons/satellites/shutterbug && flock /home/codespace/sb-drafts/browser.lock node tools/check.js --fast > LOG 2>&1; echo EXIT=$? >> LOG' </dev/null >/dev/null 2>&1 &) then poll LOG with sleep loops of at most 9 minutes per Bash call. Logs and scratch go under /home/codespace/sb-drafts/weapons/<your label>/ (it survives a box stop; /tmp does not).
- The box stops 12 hours after it boots (this boot 13:01 UTC, so about 01:00 UTC): commit and push after every meaningful step (git push -q origin sb-weapons). A WIP autosave also commits this worktree every ten minutes.
- In this box the shell's grep is a function that can break: call /usr/bin/grep by its path.
- LOOK at every shot you take (open the PNG with the Read tool) and write down three things wrong in each before you call it done. A green gate is not a look. Shoot at 360x780 and 320x568 as well as 412x915. Shots go against a local server only, never the live host.
- Commit with explicit paths, a message in the repo's style, ending with these two lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dzsq6W9Bg5wpwh68ZLVvg3
- Times in PROGRESS.md come from date -u at commit time. Do not edit DESIGN.md (a verbatim copy); put any DESIGN redline in a QUESTIONS entry.`
const SPEC = { type: 'object', properties: {
  specPath: { type: 'string' }, commit: { type: 'string' },
  steps: { type: 'array', items: { type: 'object', properties: {
    key: { type: 'string', description: 'a short slug' }, title: { type: 'string' },
    scope: { type: 'string', description: 'what the step builds, concretely' },
    acceptance: { type: 'string', description: 'the harness assertions, gates, redwatch rows and shots that prove it' },
    reviewLens: { type: 'string', description: 'what a reviewer of this step must look at hardest' } },
    required: ['key', 'title', 'scope', 'acceptance', 'reviewLens'] } },
  calls: { type: 'array', items: { type: 'object', properties: { call: { type: 'string' }, default: { type: 'string' } }, required: ['call', 'default'] } },
  deferred: { type: 'array', items: { type: 'string' } } },
  required: ['specPath', 'commit', 'steps', 'calls', 'deferred'] }
const DONE = { type: 'object', properties: {
  commit: { type: 'string' }, summary: { type: 'string' },
  gates: { type: 'array', items: { type: 'string' } }, mutants: { type: 'array', items: { type: 'string' } },
  shots: { type: 'array', items: { type: 'string' }, description: 'each shot path and the three things wrong you saw' },
  open: { type: 'array', items: { type: 'string' } } },
  required: ['commit', 'summary', 'gates', 'mutants', 'shots', 'open'] }
const FINDINGS = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: {
  title: { type: 'string' }, severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, evidence: { type: 'string' }, fix: { type: 'string' } },
  required: ['title', 'severity', 'evidence', 'fix'] } } }, required: ['findings'] }
const reviewRules = `You are reviewing, not building: do not edit, commit or push anything. ` + RULES.split('\n').filter(l => !/Commit with|Co-Authored|Claude-Session|Times in PROGRESS|commit and push after/.test(l)).join('\n')

phase('spec')
const spec = await agent(`${CONTEXT}\n\nYOUR JOB (no game code yet): write the implementation spec for Weapons v1 and commit it as satellites/shutterbug/docs/WEAPONS-V1.md on sb-weapons. Read DESIGN.md sections 4, 7, 8, 9 and 11; BUILD-PLAN.md T2.1 to T2.7, sections 1.4 (TUNING), 2.5 (the sim state and the hash), 3.8 and 5; QUESTIONS Q27, Q51, Q52, Q81, Q84, Q92, Q93 and any other entry on weapons, loot, the CHOICE word or sheets; then the code as it is now: the hero state and step (jump, wall jump, dive, dash), the enemies with their HP, DP, frozen and stunned timers, the loot and the chest, the CHOICE word and how the shell answers it after Q92, render and the sprite strings, audio's play(name), COPY and the lint's copy rules, the harness's assertion groups, redwatch, the loot gate.\nThe spec must be concrete enough that a builder who has not read DESIGN can build each step: the state fields (integers, hashed, pooled, no allocation in step), exactly where each weapon fires inside step, damage with the integer scaling, stun and freeze, kills and their DP, what the chest does now, the pickup into an empty slot and into a full one (the climb should not stop for an empty slot; the compare screen for a full one), the drop pool before the Darkroom exists, the render of every projectile and effect (palette indices, sizes in cells and px, frames) and the HUD that shows the three slots, the SFX, every COPY sentence, the lint change (weapon and charm names become allowed; Darkroom and blueprint stay forbidden while they do nothing), and per step the harness assertions, gates, redwatch rows and shots.\nSlice it into at most 5 ordered build steps, each shippable and testable alone. Step 1 must deliver a complete end to end playable fight: the framework (T2.1), J1 Boomerang, D1 Anvil Boots, the chest giving a weapon, an enemy dying and paying its DP, the slot HUD. Say what is deferred (the Darkroom, blueprints, house runs, the boss, C7 and C8 while their systems do not exist) and list every design call that is Stephen's with your recommended default (he is impatient: default to DESIGN's letter and to whatever keeps the climb fun and moving). Commit and push the spec, then return the steps.\n\n${RULES}`, { label: 'spec:weapons', phase: 'spec', schema: SPEC })
if (!spec || !spec.steps || !spec.steps.length) { log('spec returned nothing; stopping'); return { failed: 'spec' } }
log('spec ' + spec.commit + ': ' + spec.steps.length + ' steps: ' + spec.steps.map(s => s.key).join(', '))
const STEPS = spec.steps.slice(0, 4)
if (spec.steps.length > 4) log('NOT BUILT in this run (over the four step cap): ' + spec.steps.slice(4).map(s => s.key + ' (' + s.title + ')').join('; '))

const results = []
for (let i = 0; i < STEPS.length; i++) {
  const s = STEPS[i], ph = 'step ' + (i + 1)
  phase(ph)
  const stepText = `STEP ${i + 1} of ${STEPS.length}: ${s.key}, ${s.title}.\nSCOPE: ${s.scope}\nACCEPTANCE: ${s.acceptance}`
  const built = await agent(`${CONTEXT}\n\n${stepText}\n\nThe full spec is satellites/shutterbug/docs/WEAPONS-V1.md in your worktree: read it whole first. Earlier steps are already built and committed (git log --oneline -20). Build this step, verify it (node tools/check.js --fast green, the step's harness assertions green, its redwatch rows RED for the right reason, every shot looked at), record it (a PROGRESS entry, a BUILD-PLAN State row 'W${i + 1} ${s.key}', a Q120 to Q139 entry for any call you made), commit with explicit paths, push, then report.\n\n${RULES}`, { label: 'build:' + s.key, phase: ph, schema: DONE, effort: 'high' })
  if (!built) { results.push({ key: s.key, failed: 'build returned nothing' }); log(s.key + ': build returned nothing; stopping'); break }
  log(s.key + ' built at ' + built.commit)
  const lenses = i === 0 ? [
    ['code', `Your lens: the code. Is it correct, deterministic, honest and complete? Run nice -n 10 node harness.js --fast and node tools/lint.mjs; do NOT launch a browser (the other reviewer holds it). Check every mutant goes RED for the right reason (read the rows, reason about them), no allocation in step, the hash covers the new state, integer math only, nothing broken elsewhere (the chest, loot, the clear's bank, the death card, replays, level codes), copy law. ${s.reviewLens}`],
    ['player', `Your lens: the player's seat. Run browsers one at a time under the lock against a local server only (test/harness.mjs serve() and launch(); tools/shutterbug-tests/shoot.mjs). Play it like Stephen on his Pixel at 412x915, 360x780 and 320x568: get the chest, take the weapon, fight. Shoot each moment, LOOK at each image: can you SEE the weapon fire and hit, does the enemy's death read, is the slot HUD readable, does the climb ever stop or stall, is it fun? ${s.reviewLens}`],
  ] : [
    ['code+player', `Your lens: both the code and the player's seat. Run nice -n 10 node harness.js --fast and node tools/lint.mjs; reason about every mutant; then run browsers one at a time under the lock against a local server only, play the new weapons at 412x915 and 360x780 and LOOK at the shots: does each effect read on a phone and do what its one sentence says? ${s.reviewLens}`],
  ]
  const reviews = await parallel(lenses.map(([name, lens]) => () => agent(`${CONTEXT}\n\nReview ${stepText}\nIt was built and committed as ${built.commit} (git log --oneline -10; git show ${built.commit}; it may have ridden WIP autosaves just before). The spec is satellites/shutterbug/docs/WEAPONS-V1.md.\n\n${lens}\n\nReport only defects you can show with evidence (file:line, a command and its output, or a shot path and what is wrong in it).\n\n${reviewRules}`, { label: 'review-' + name + ':' + s.key, phase: ph, schema: FINDINGS, effort: 'high' })))
  const found = reviews.filter(Boolean).flatMap(r => r.findings || [])
  log(s.key + ': ' + found.length + ' findings (' + found.filter(f => f.severity !== 'minor').length + ' blocker or major)')
  let fixed = null
  if (found.length) {
    fixed = await agent(`${CONTEXT}\n\nReviewers looked at ${stepText}\n(built as ${built.commit}). For EACH finding below: first try to refute it from the code or a run; fix only the real ones, each with its assertion or gate and a redwatch row RED where it is a behaviour; rerun the affected gates and node tools/check.js --fast; record it (PROGRESS, the State row 'W${i + 1}R ${s.key}'), commit and push. Report which you fixed, which you refuted and why, and what is still open.\n\nFINDINGS:\n${JSON.stringify(found, null, 1)}\n\n${RULES}`, { label: 'fix:' + s.key, phase: ph, schema: DONE, effort: 'high' })
    if (!fixed) { results.push({ key: s.key, built, findings: found, failed: 'fix returned nothing' }); log(s.key + ': fix returned nothing; stopping'); break }
    log(s.key + ' fixes at ' + fixed.commit)
  }
  results.push({ key: s.key, built, findings: found, fixed })
}
return { spec, results }
