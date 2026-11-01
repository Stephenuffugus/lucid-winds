export const meta = {
  name: 'shutterbug-design-judge-plan',
  description: 'Shutterbug design sprint, judges and plan: three judges (fun, build, fit) score the six angles; one plan with boards, Stephen\'s questions and build briefs; args.proposals holds the angles',
  phases: [
    { title: 'judges', detail: 'fun, engineering and design fit, scoring every angle' },
    { title: 'plan', detail: 'one plan, the boards, the questions for Stephen, the build briefs' },
  ],
}
const OUT = '/home/codespace/sb-drafts/design-nov01'
const proposals = (args && args.proposals) || []
if (!proposals.length) return { failed: 'no proposals in args' }
const CONTEXT = `Shutterbug is Stephen's single file mobile pixel platformer (satellites/shutterbug/ in /workspaces/lucid-winds and its lane worktrees): a photo of a room is cropped by a 1:2 portrait box, quantised to a 24x48 grid of a 16 colour palette, read into solids, one ways and open cells, repaired with film tabs (help platforms) until the beacon at the top is reachable, then climbed by a bug with run, jump, wall cling and wall jump, dive and dash, against biome enemies, with weapons, loot, a chest and hearts. The pure deterministic core is shared verbatim with a Node harness.js; a share code is the 24x48 grid (record v1; record v2 is coming tonight with a biome byte). DESIGN.md, BUILD-PLAN.md, QUESTIONS.md (his rulings Q96 and Q97), PROGRESS.md.
STEPHEN, THE DIRECTOR, IN HIS OWN WORDS:
- 31 Oct: the same weapons over and over; "it keeps telling me try a tighter crop over and over"; "I try to do something green and it just won't do it"; "everything feels the same"; "no like real goal at the end. So maybe we need a way to like level up or ramp up".
- 1 Nov: "I want to make shutterbug really good. It's almost fun, but it needs to be able to pixelate more stuff right now. It's too hard to actually get the level to be made."
- 1 Nov: "It's literally every picture I really have to move the cropper around and then it mostly just makes the most basic level over light space where it adds a bunch of floating platforms, usually straight up, that's pretty boring. We can make it way better and we want an objective and reason to keep making and playing levels."
- The newest finding (shots /home/codespace/sb-drafts/photo/autocrop/shots3/): the solidity reading takes a wall's own shading as solid, the furniture vanishes into it, the box search lifts the box to the blank top of the room, and the repair builds five film ledges straight up the left edge.
BEING BUILT TONIGHT: sb-levels (the automatic crop box search, done; the capture normalisation; next the biome from colour in record v2 and edge ledges with stepping stones), sb-weapons-2 (weapons steps 2 and 3, Astra's round 4 art), sb-house (the house run: five rooms, ramp, the clay boss, a cosmetic per clear). An early deploy (sb-m1-4: the levels rule, the search, the normalisation) goes to his phone tonight; the next deploy (sb-m1-5) carries what the plan picks for tonight. The box stops at about 04:05 UTC on 2 Nov; a build lane is about 1 to 1.5 hours a step on this 2 core box, one browser at a time.
RULES: read only. Never edit, commit or push in any worktree; write only under ${OUT}/. In this box the shell's grep is a function that can break: call /usr/bin/grep by its path. Open the boards you rely on (the Read tool) rather than trusting their captions.`
const SCORES = { type: 'object', properties: {
  scores: { type: 'array', items: { type: 'object', properties: { angle: { type: 'string' }, score: { type: 'number' }, why: { type: 'string' } }, required: ['angle', 'score', 'why'] } },
  plan: { type: 'string', description: 'the combination and order you would build: tonight, tomorrow, later' },
  cut: { type: 'string', description: 'what you would not build and why' } },
  required: ['scores', 'plan', 'cut'] }
const PLAN = { type: 'object', properties: {
  proposalPath: { type: 'string' }, summary: { type: 'string', description: 'what Stephen should know in ten lines' },
  boardsToShow: { type: 'array', items: { type: 'string' }, description: 'the 3 to 6 board paths that best show the plan, each followed by " :: " and a one line caption' },
  questions: { type: 'array', items: { type: 'object', properties: {
    question: { type: 'string' }, header: { type: 'string', description: 'at most 12 characters' },
    options: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, description: { type: 'string' } }, required: ['label', 'description'] } } },
    required: ['question', 'header', 'options'] }, description: '1 to 4 questions, each standing on its own, 2 to 4 options, the recommended option first with (Recommended) at the end of its label' },
  briefs: { type: 'array', items: { type: 'object', properties: { lane: { type: 'string' }, branch: { type: 'string' }, tonight: { type: 'boolean' }, brief: { type: 'string' } }, required: ['lane', 'branch', 'tonight', 'brief'] }, description: 'build briefs on the recommended options, in the house style of the STEPS entries in satellites/shutterbug/docs/lanes/photo-1a-lane-nov01-pm.js' } },
  required: ['proposalPath', 'summary', 'boardsToShow', 'questions', 'briefs'] }
const JUDGES = [
  ['fun', 'You judge as the player. Stephen plays on a Pixel. Score each angle 1 to 10 on whether it makes him stop saying "floating platforms straight up", "boring" and "no goal", from the boards and numbers, not the prose. Open the boards.'],
  ['build', 'You judge as the engineer who must build it in this codebase tonight and keep it green: determinism and the shared core, old share codes, the phone\'s 50 ms build budget, the house style (each behaviour with a test and a redwatch row), merge conflicts with the three running lanes, the risk of a broken climb. Score each angle 1 to 10 on value for cost and risk. Read the code paths each proposal names.'],
  ['fit', 'You judge as the designer keeping the game coherent: DESIGN.md, his rulings Q96 and Q97, the house run being built, film tabs reading as help and furniture as the room, the photo never persisting, Astra\'s art and palette. Score each angle 1 to 10 on fit and on what it unlocks next.'],
]
phase('judges')
const verdicts = (await parallel(JUDGES.map(([key, lens]) => () => agent(`${CONTEXT}\n\n${lens}\n\nTHE PROPOSALS (each angle also wrote ${OUT}/<angle>/proposal.md and its boards):\n${JSON.stringify(proposals, null, 1)}\n\nScore every angle, then give the combination and order you would build (tonight, tomorrow, later) and what you would cut.`, { label: 'judge:' + key, phase: 'judges', schema: SCORES, effort: 'high' })))).filter(Boolean)
log('judges: ' + verdicts.map((v, i) => JUDGES[i][0] + ' ' + v.scores.map(s => s.angle + '=' + s.score).join(' ')).join(' | '))

phase('plan')
const plan = await agent(`${CONTEXT}\n\nYou write the plan Stephen decides from. THE PROPOSALS:\n${JSON.stringify(proposals, null, 1)}\n\nTHE JUDGES:\n${JSON.stringify(verdicts, null, 1)}\n\nWrite ${OUT}/PROPOSAL.md: what is wrong today in his words and the numbers; the plan (which angles, combined how, in what order: tonight on sb-m1-5, tomorrow, later), each piece with its measured effect and its boards; what it costs; what he must decide. Plain words for a director, the numbers kept, no dashes in any sentence he reads. Then pick the 3 to 6 boards that show it best (open each), write 1 to 4 questions for him (each standing on its own without the document: name the thing being decided, 2 to 4 options, the recommended first), and write build briefs for the lanes on the recommended options, in the style of the STEPS entries in satellites/shutterbug/docs/lanes/photo-1a-lane-nov01-pm.js (what to build, the tests and redwatch rows, the shots, the record entries), naming the branch each belongs on (sb-levels for pipeline, capture and crop work; sb-house for the house, the title and the cards; a new branch for anything else) and whether it fits tonight.`, { label: 'plan:synthesis', phase: 'plan', schema: PLAN, effort: 'high' })
return { verdicts, plan }
