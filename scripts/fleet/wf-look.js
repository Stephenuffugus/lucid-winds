export const meta = {
  name: 'fleet-art-look',
  description: 'Open every screenshot in a slice of the arcade and list the art and CSS each game needs',
  phases: [{ title: 'Look', detail: 'open the shots, judge the game, write the batch to disk' }],
}

const INPUT = '/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/audit-input.json'
const OUTDIR = '/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/audit-out'

const GAME = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    verdict: { type: 'string', enum: ['strong', 'decent', 'plain', 'poor'] },
    looks_now: { type: 'string', description: 'One or two sentences on what the screen actually looks like. Concrete: colours, shapes, what fills the frame.' },
    three_wrong: { type: 'array', items: { type: 'string' }, description: '1-3 specific visual faults you can SEE. Name the thing and where it is. Empty only if it genuinely looks finished.' },
    background_now: { type: 'string', description: 'What the background actually is: flat colour + hex, gradient, painted image, canvas scene, nothing.' },
    background_want: { type: 'string', description: 'The specific background this game should have, or "none needed" plus the reason.' },
    graphics_wants: {
      type: 'array',
      description: 'Concrete art assets. Each one a real file someone could paint tomorrow.',
      items: {
        type: 'object',
        properties: {
          asset: { type: 'string', description: 'filename, e.g. bg-lane-540x960.jpg' },
          spec: { type: 'string', description: 'pixel size, what it shows, transparent / magenta / full-bleed' },
          why: { type: 'string', description: 'what it replaces and what it fixes' },
        },
        required: ['asset', 'spec', 'why'],
      },
    },
    css_wants: { type: 'array', items: { type: 'string' }, description: 'Specific CSS jobs: named selector or element, and the change. Never "improve the styling".' },
    emoji_as_art: { type: 'string', description: 'Which emoji stand in for real art and where, or "none".' },
    readability: { type: 'string', description: 'Text/contrast/touch-target problems visible in the shot, or "ok".' },
    music_chip_collision: { type: 'string', description: 'If the floating music chip or another injected control overlaps game UI, what it covers. Otherwise "none".' },
    looks_broken: { type: 'boolean', description: 'TRUE only for a real failure you can see: blank playfield, missing-image box, clipped or overlapping UI, unreadable text. Plain is NOT broken.' },
    broken_evidence: { type: 'string' },
    impact: { type: 'integer', description: '1-5: how much better the game would look for the work' },
    effort: { type: 'string', enum: ['S', 'M', 'L'] },
  },
  required: ['slug', 'verdict', 'looks_now', 'three_wrong', 'background_now', 'background_want', 'graphics_wants', 'css_wants', 'emoji_as_art', 'readability', 'music_chip_collision', 'looks_broken', 'broken_evidence', 'impact', 'effort'],
}
const BATCH_SCHEMA = { type: 'object', properties: { games: { type: 'array', items: GAME } }, required: ['games'] }

const slugs = args.slugs, tag = args.tag
const batches = []
for (let i = 0; i < slugs.length; i += 4) batches.push(slugs.slice(i, i + 4))
log(`${tag}: ${slugs.length} games in ${batches.length} batches`)

phase('Look')
const results = await pipeline(batches, (b, _item, i) => agent(
`You are auditing the VISUAL QUALITY of games in the Sky Wolf Studio / Lucid Winds arcade, so the
Director can decide where to spend art and CSS effort. Your batch: ${b.join(', ')}

Read ${INPUT} (a JSON array) and find the records whose "slug" is in your batch. Ignore all others.

WORK FAST AND CONCRETELY. Per game:

1. OPEN THE SHOTS with Read. record.shots holds absolute paths: -1boot, -2play, -3later, at
   375x667 (exactly what the phone shows). Open -1boot and -2play. Open -3later ONLY if -2play is
   ambiguous or mid-animation. You MUST look; never infer appearance from the metrics.
   "shotsHiRes" is the same frames at 2x - use only if you must check small text.

2. READ record.capture. "reached" says where the shot landed: "canvas" = real playfield;
   "no-control" / "no-more-controls" / "max-rounds" / "stuck-on:X" = the robot could not advance,
   so the frame may be a MENU or an INSTRUCTIONS wall, not the game. Say so and judge what is
   visible, with looks_broken=false. Never call a game empty because the robot could not get in.
   KNOWN ARTEFACT: 404s for /music/v1/*.mp3 are expected - audio is not in git and the local
   server has no /music. Never report those. A 404 for an IMAGE under the game's OWN folder IS
   real: it means the code asks for art nobody painted. Name the file.

3. CHECK THE SOURCE briefly with grep/sed (repo root /workspaces/lucid-winds), never reading a
   big file whole. record.sourceFile is the main file. Satellites own satellites/<slug>/.
   Natives are games/<id>.js and SHARE play/shell.css + shared.css with 65 other natives, whose
   whole background is one radial gradient - so a native has almost no styling of its own and
   any art must come from assets/games/<id>/. Establish: what paints the background, whether an
   art-loading hook already exists (an ART map, manifest.json, an assets/ folder), where emoji
   stand in for art.

4. JUDGE IT the way the Director does: "A visual change is NOT done until you have LOOKED at it.
   READ THE IMAGE. Name three things wrong in it before Stephen does." And "sloppy is a real
   report": do two things in one frame share a silhouette, do props sit in motivated groups, does
   every surface meet another through a transition instead of a hard edge, is the horizon empty.
   House style: midnight greenhouse - deep near-black grounds, sage green, warm gold, cream, a
   touch of rose; cozy storybook, soft painterly, warm rim light, big readable silhouettes, a
   little glow. Phone at 375x667. Text under 0.7rem and touch targets under 48px are faults.

5. INJECTED FURNITURE. music-unlocks.js drops a floating "♫ Music" chip into 107 games. It picks
   a corner ONCE, 900ms after load, scored against the BOOT layout, and never re-places, so on a
   later screen it can sit on a title or a button. Already confirmed covering UI in moon-claw,
   flock-the-world and rootbound. If you see it overlapping anything, record what it covers in
   music_chip_collision.

CALIBRATION, so verdicts mean the same thing across the fleet:
- "strong"  = painted art or a genuinely composed scene. Chess (painted pieces, wooden board,
              Celtic frame) and Berry Vine (painted nebula) are strong.
- "decent"  = coherent and deliberate but thin; a real background or a few sprites would lift it.
- "plain"   = flat colours, system font, emoji or CSS shapes doing the work of art.
- "poor"    = looks unfinished or accidental: clashing colours, stray boxes, nothing composed.
Grade only how it LOOKS, never how fun it seems.

graphics_wants must be paintable tomorrow: a filename, a pixel size, what it shows.
css_wants must name a selector or element and the change.

WRITE TO DISK: put the exact JSON you return (the {"games":[...]} object) into
${OUTDIR}/${tag}-${i}.json with the Write tool, where TAG is "${tag}". Create ${OUTDIR} first
if missing. This is how the detail is collected - do not skip it.`,
  { label: `${tag}:${i}`, phase: 'Look', schema: BATCH_SCHEMA }))

const games = results.filter(Boolean).flatMap(r => r.games || [])
return { tag, audited: games.length, slugs: games.map(g => g.slug), byVerdict: games.reduce((a, g) => (a[g.verdict] = (a[g.verdict] || 0) + 1, a), {}) }
