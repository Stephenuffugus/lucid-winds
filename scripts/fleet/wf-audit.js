export const meta = {
  name: 'fleet-art-audit',
  description: 'Look at every carded game and list the graphics, backgrounds and CSS work it needs',
  phases: [
    { title: 'Look', detail: 'open every screenshot, judge the game, list what it needs' },
    { title: 'Verify', detail: 'adversarially check every "looks broken" claim against the shot' },
    { title: 'Themes', detail: 'cross-cutting patterns and the ranked batches' },
  ],
}

const INPUT = '/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/audit-input.json'
const OUTDIR = '/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/audit-out'
const CREATED = '/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/created.txt'

const GAME = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    verdict: { type: 'string', enum: ['strong', 'decent', 'plain', 'poor'] },
    looks_now: { type: 'string', description: 'One sentence describing what the screen actually looks like. Concrete: colours, shapes, what fills the frame.' },
    three_wrong: { type: 'array', items: { type: 'string' }, description: '1-3 specific visual faults you can SEE in the shot. Name the thing and where it is. Empty only if the game genuinely looks finished.' },
    background_now: { type: 'string', description: 'What the background actually is: flat colour + hex, gradient, painted image, canvas scene, nothing.' },
    background_want: { type: 'string', description: 'The specific background this game should have, or "none needed" with a reason.' },
    graphics_wants: {
      type: 'array',
      description: 'Concrete art assets this game wants. Each one a real file someone could paint.',
      items: {
        type: 'object',
        properties: {
          asset: { type: 'string', description: 'filename-ish, e.g. bg-lane-540x960.png' },
          spec: { type: 'string', description: 'size, what it shows, transparent/magenta/full-bleed' },
          why: { type: 'string', description: 'what it replaces and what it fixes' },
        },
        required: ['asset', 'spec', 'why'],
      },
    },
    css_wants: { type: 'array', items: { type: 'string' }, description: 'Specific CSS/polish jobs: named element, what to change. No vague "improve styling".' },
    emoji_as_art: { type: 'string', description: 'Which emoji stand in for real art and where, or "none".' },
    readability: { type: 'string', description: 'Any text/contrast/touch-target problem visible in the shot, or "ok".' },
    looks_broken: { type: 'boolean', description: 'TRUE only if the shot shows an actual failure: blank frame, missing art box, overlapping/clipped UI, unreadable text. Not "plain".' },
    broken_evidence: { type: 'string', description: 'If looks_broken, exactly what in which shot shows it. Otherwise "".' },
    impact: { type: 'integer', description: '1-5, how much better the game would look for the work' },
    effort: { type: 'string', enum: ['S', 'M', 'L'] },
  },
  required: ['slug', 'verdict', 'looks_now', 'three_wrong', 'background_now', 'background_want', 'graphics_wants', 'css_wants', 'emoji_as_art', 'readability', 'looks_broken', 'broken_evidence', 'impact', 'effort'],
}

const BATCH_SCHEMA = { type: 'object', properties: { games: { type: 'array', items: GAME } }, required: ['games'] }

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    still_broken: { type: 'boolean', description: 'After looking yourself: is it really a visual failure, not just a plain or mid-animation frame?' },
    why: { type: 'string' },
  },
  required: ['slug', 'still_broken', 'why'],
}

const slugs = args.slugs
const batches = []
for (let i = 0; i < slugs.length; i += 5) batches.push(slugs.slice(i, i + 5))
log(`${slugs.length} games in ${batches.length} batches`)

phase('Look')
const results = await pipeline(
  batches,
  (b, _item, i) => agent(
`You are auditing the VISUAL QUALITY of games in the Sky Wolf Studio / Lucid Winds arcade, so the
Director can decide where to spend art and CSS effort. Your batch: ${b.join(', ')}

Read ${INPUT} (a JSON array). Find the records whose "slug" is in your batch. Ignore all others.

FOR EACH GAME IN YOUR BATCH:

1. OPEN THE SCREENSHOTS with the Read tool. Each record has a "shots" array of absolute paths:
   -1boot (first screen), -2play (after advancing into play), -3later (a few seconds on).
   These are 375x667, exactly what the phone shows. Open 1boot and 2play at minimum. Open 3later
   when 2play is ambiguous or mid-animation. "shotsHiRes" holds the same frames at 2x if you need
   to check small text; use it sparingly, it is expensive.
   You MUST look at the images. Do not infer appearance from the metrics.

   KNOWN CAPTURE ARTIFACTS - never report these as faults in the game:
   - record.capture.badRequests will show 404s for /music/v1/....mp3 in many games. Audio is
     deliberately not in git; it ships to /music from a private repo. The local capture server
     has no /music. This is NOT a broken game.
   - A 404 for an IMAGE under the game's own folder IS real and worth reporting: it means the
     code asks for art that was never painted. Say which file.

2. READ THE CAPTURE NOTES in record.capture. "reached" tells you where the shot landed:
   "canvas" = real playfield. "no-control"/"no-more-controls"/"max-rounds"/"stuck-on:X" = the
   robot could not advance, so the shot may be a menu or an instructions screen, NOT the game.
   If a shot is clearly a menu or a how-to-play wall, SAY SO and judge what you can see, and set
   looks_broken=false - a menu is not a broken game. Never call a game empty because the robot
   could not get in.

3. LOOK AT THE SOURCE for how the visuals are made. record.sourceFile is the game's main file
   (repo root /workspaces/lucid-winds). Satellites own their folder (satellites/<slug>/); natives
   are games/<id>.js and SHARE play/shell.css + shared.css with 66 other native games, so a native
   has almost no styling of its own. Use grep/sed on the source - do not read a 3000-line file whole.
   Establish: what paints the background, is there an art-loading hook already (an ART map,
   manifest.json, an assets/ folder), and where emoji stand in for art.

4. JUDGE IT the way the Director does. His standard, verbatim from the project rules:
   "A visual change is NOT done until you have LOOKED at it. READ THE IMAGE. Name three things
   wrong in it before Stephen does." Also: "sloppy is a real report" - do two things in one frame
   share a silhouette, do props sit in motivated groups, does every surface meet another through a
   transition instead of a hard edge, is the horizon ever empty.
   House style: midnight greenhouse. Deep near-black grounds, sage green, warm gold, cream, a touch
   of rose. Cozy storybook, soft painterly, warm rim light, big readable silhouettes, a little glow.
   Target device is a phone at 375x667. Text under 0.7rem and touch targets under 48px are faults.

5. WATCH FOR THE INJECTED FURNITURE. A floating "♫ Music" chip is injected into 107 games by
   music-unlocks.js. It picks a free corner ONCE, 900ms after load, scored against the BOOT
   layout, and never re-places when the game changes screen - so it can end up sitting on top of
   a title or a button on a later screen. If you can see it overlapping game UI, put that in
   three_wrong and say which element it covers. Same for any "New song" button and the feedback
   fab. This is a fleet-wide bug, not that game's fault, but the collision is real and worth
   recording per game.

6. BE CONCRETE. "graphics_wants" entries must be assets someone could actually paint tomorrow:
   a filename, a pixel size, what it shows. "css_wants" must name an element and the change.
   Never write "improve the styling" or "add polish".

CALIBRATION so your verdicts mean the same thing as everyone else's:
- "strong"  = painted art or a genuinely composed scene; would not embarrass the studio. (Chess,
              with painted piece art on a wooden board in a Celtic frame, is a "strong".)
- "decent"  = coherent and deliberate but thin; a real background or a few sprites would lift it.
- "plain"   = flat colours, system font, emoji or CSS shapes doing the work of art.
- "poor"    = looks unfinished or accidental: clashing colours, stray boxes, nothing composed.

7. Do not grade on how FUN it looks or how good the idea is. Only how it LOOKS.

WRITE YOUR RESULT TO DISK as well as returning it: put the exact JSON object you return
(the {"games":[...]} object) into ${OUTDIR}/batch-${i}.json using the Write tool. Create the
directory first if it does not exist. This is how the full detail is collected, so do not skip it.

Return one object per game in your batch, in the schema. Be specific and be honest; a game that
looks good should be marked strong, and an empty three_wrong is allowed for those.`,
    { label: `look:${i}`, phase: 'Look', schema: BATCH_SCHEMA }
  ),
)

const games = results.filter(Boolean).flatMap(r => r.games || [])
log(`audited ${games.length} games`)

phase('Verify')
const brokenClaims = games.filter(g => g.looks_broken)
log(`${brokenClaims.length} "looks broken" claims to verify`)
const verified = brokenClaims.length ? await parallel(brokenClaims.map(g => () =>
  agent(
`Another auditor claims this game LOOKS BROKEN. Try to REFUTE that.

Game: ${g.slug}
Their claim: ${g.broken_evidence}
Their description: ${g.looks_now}

Read ${INPUT}, find the record for "${g.slug}", and OPEN ALL of its shots with the Read tool.

A game is NOT broken because it is plain, dark, minimal, mid-animation, a menu, or an
instructions screen. Check record.capture.reached: if it is not "canvas", the robot may simply
have failed to enter the game, which is a capture artifact and NOT a fault in the game.
It IS broken if you can see: a blank/near-blank playfield where content should be, a missing-image
box, UI overlapping or clipped off the screen edge, or text that is unreadable against its ground.

Default to still_broken=false if you are uncertain. Only confirm what you can SEE.`,
    { label: `verify:${g.slug}`, phase: 'Verify', schema: VERDICT_SCHEMA })
)) : []

const confirmedBroken = new Set(verified.filter(Boolean).filter(v => v.still_broken).map(v => v.slug))
const refuted = verified.filter(Boolean).filter(v => !v.still_broken)
log(`broken confirmed: ${confirmedBroken.size}, refuted: ${refuted.length}`)
for (const g of games) {
  if (g.looks_broken && !confirmedBroken.has(g.slug)) {
    g.looks_broken = false
    g.broken_evidence = '(claim refuted on second look) ' + g.broken_evidence
  }
}

phase('Themes')
const compact = games.map(g => ({
  slug: g.slug, verdict: g.verdict, impact: g.impact, effort: g.effort,
  bg: g.background_now, wrong: g.three_wrong, emoji: g.emoji_as_art,
  nAssets: g.graphics_wants.length, css: g.css_wants.length, broken: g.looks_broken,
}))
const themes = await agent(
`Here are visual audits of ${games.length} games in one arcade, each judged from its own screenshots:

${JSON.stringify(compact)}

Also read ${CREATED} - "YYYY-MM-DD sat:<slug>" / "YYYY-MM-DD nat:<id>" is when each game was first
committed, which is the Director's sense of an "old" game.

Find the CROSS-CUTTING patterns: work that fixes many games at once, rather than one game at a time.
The highest-value thing you can produce is the short list of changes where one job lifts 20+ games.

Known structural facts you may build on (already verified, do not re-derive):
- All 66 native /play/ games share play/shell.css and shared.css. Their whole background is one
  radial gradient on near-black. 37 of the 66 reference no art file at all; 19 more reference
  exactly one shared icon. Only 10 have real painted art.
- Satellites each own their folder and their own CSS, so they vary game by game.
- 5 satellite portal cards have no thumbnail and fall back to an emoji glyph; 37 more have
  thumbnails under 20KB.

Report:
1. The cross-cutting jobs, most leverage first, each with the count of games it lifts and why.
2. The clusters of games that should be batched together for one art pass (same style, same needs).
3. Which "old" games (by first-commit date) are furthest below the standard set by the best ones.
4. Anything the per-game audits systematically missed or got wrong.

Be concrete and quantitative. No filler.`,
  { label: 'themes', phase: 'Themes' })

return {
  audited: games.length,
  outDir: OUTDIR,
  byVerdict: games.reduce((a, g) => (a[g.verdict] = (a[g.verdict] || 0) + 1, a), {}),
  verifiedBroken: [...confirmedBroken],
  refutedBroken: refuted.map(r => r.slug),
  themes,
}
