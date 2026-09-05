export const meta = {
  name: 'fleet-art-verify',
  description: 'Adversarially check every "this game looks broken" claim against its own screenshots',
  phases: [{ title: 'Refute', detail: 'try to prove each broken claim wrong' }],
}

const INPUT = '/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/audit-input.json'

const V = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    still_broken: { type: 'boolean', description: 'After looking yourself: a real visible failure, not merely plain, dark, minimal, mid-animation, a menu, or an instructions screen.' },
    why: { type: 'string', description: 'What you actually saw, and which shot.' },
    severity: { type: 'string', enum: ['blocker', 'ugly', 'minor', 'not-a-fault'], description: 'blocker = the game is unusable or unreadable; ugly = clearly wrong but playable; minor = small blemish; not-a-fault = the claim is refuted.' },
  },
  required: ['slug', 'still_broken', 'why', 'severity'],
}

const MERGED = '/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/audit-merged.json'
const claims = args.slugs
log(`${claims.length} "looks broken" claims to refute`)

phase('Refute')
const out = await parallel(claims.map(c => () => agent(
`Another auditor claims a game LOOKS BROKEN. Your job is to try to REFUTE that claim.

Game: ${c}

Read ${MERGED} and find the record whose "slug" is "${c}". Its "broken_evidence" field is the
claim you are testing and "looks_now" is how that auditor described the screen. Read those first.

Then read ${INPUT}, find the record with the same "slug", and OPEN EVERY path in its "shots"
array with the Read tool. Look before you decide anything.

A game is NOT broken because it is plain, dark, minimal, sparse, mid-animation, a menu screen or
an instructions wall. Check record.capture.reached: anything other than "canvas" means the capture
robot may simply have failed to enter the game, which is an artefact of the capture and NOT a
fault in the game. 404s for /music/v1/*.mp3 are also an artefact - audio is not in git.

It IS broken if you can SEE one of these:
- a blank or near-blank playfield where content clearly should be
- a missing-image box, or art that plainly failed to load
- UI overlapping or clipped off the screen edge
- text unreadable against its own background

Default to still_broken=false when uncertain. Confirm only what is visible in the images.
Be specific about which shot shows it.`,
  { label: `refute:${c}`, phase: 'Refute', schema: V })))

const good = out.filter(Boolean)
return {
  checked: good.length,
  confirmed: good.filter(v => v.still_broken).map(v => ({ slug: v.slug, severity: v.severity, why: v.why })),
  refuted: good.filter(v => !v.still_broken).map(v => ({ slug: v.slug, why: v.why })),
}
