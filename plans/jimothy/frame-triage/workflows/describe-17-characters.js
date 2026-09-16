export const meta = {
  name: 'jimothy-remake-descriptions',
  description: 'Describe 17 Jimothy characters from their reference sheets, verify each against the images, and write a generic pose guide',
  phases: [
    { title: 'Describe', detail: 'three agents write locked character blocks from the sheets' },
    { title: 'Verify', detail: 'one checker per batch compares every claim to the images' },
    { title: 'Poses', detail: 'one agent writes a costume-neutral pose guide for all frames' },
  ],
}

const CHARS = args.chars
const BATCHES = [CHARS.slice(0, 6), CHARS.slice(6, 12), CHARS.slice(12)]
const DOCS = '/workspaces/lucid-winds/satellites/stream-hop/art-sheets/skin-docs'
const ORDER = 'Each reference sheet is 4 frames across on a flat grey backdrop (the grey is NOT part of the art). Reading left to right, top to bottom, the frames are: 1 idle, 2 crouch, 3 leap, 4 land, 5 run-l (sideways run to the LEFT), 6 run-r (sideways run to the RIGHT), 7 dash-run, 8 flee, 9 coffee, 10 magnet, 11 umbrella, 12 shield, 13 scared, 14 sit, 15 eat, 16 cheer, 17 dizzy, 18 splash, 19 ko' + ' (Jimothy alone has a 20th: run-r2, a second right-running stride).'

const BLOCK_SCHEMA = {
  type: 'object',
  properties: {
    characters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          block: { type: 'string', description: 'The full THE CHARACTER block text, house format, plain text, no markdown' },
          unsure: { type: 'array', items: { type: 'string' }, description: 'Details you could not confirm from the images' },
          corrections: { type: 'array', items: { type: 'string' }, description: 'Verifier only: each change made and why' },
        },
        required: ['id', 'block'],
      },
    },
  },
  required: ['characters'],
}

const RULES = [
  'Describe ONLY what you can actually see in the reference sheet. Never invent a prop, colour or garment. If a detail differs between frames, say which frames.',
  'Plain text only, no markdown, no bullet symbols other than the two-space indentation used by the house example.',
  'Never name or allude to any real person, actor or celebrity, even if a character resembles one. Describe the painted character only.',
  'Any lettering on a prop must be described as texture, never as a readable word.',
  'Do not describe the grey backdrop. Do not mention magenta except to forbid it.',
  'Write in the house voice of the example: concrete, visual, a little funny, never vague.',
]

function describePrompt(batch, i) {
  return `You are writing locked character descriptions for an image-generation prompt. The game is Jumping Jimothy, a storybook hopper about a raccoon on the rainy streets of Seattle at night. The studio owner will paste your text into ChatGPT, together with the character's reference sheet, to repaint single animation frames that came out badly. Your block keeps the repaint on model.

First read the house example so you copy its format and voice exactly: read lines 1-37 of ${DOCS}/11-soggy.txt (a raccoon in a costume) and lines 1-37 of ${DOCS}/28-sasquatch.txt (a non-raccoon body).

${ORDER}

For EACH character below, use the Read tool on its reference sheet image (it renders the picture; look closely, and read it more than once if you need to), then write one block in exactly this shape:

<Name> — one of the playable characters in Jimothy, a storybook hopper set on the rainy streets of Seattle.

STANCE (locked — the same in every frame):
  <how the body stands and moves, as seen across the 19 frames>

WARDROBE AND PROPS (locked — these appear in ALL frames, including the deaths):
  <every garment, colour, material and always-present prop, precisely; then the per-frame props you can see, naming the frames>

HOW THIS BODY WORKS:
  <body shape, limbs, tail, face, what makes this character read at a glance, what must never change between frames>

Rules:
${RULES.map(r => '- ' + r).join('\n')}

Characters (batch ${i + 1}):
${batch.map(c => `- id "${c.id}", name "${c.name}", rarity ${c.rar}, in-game bio "${c.bio}", reference sheet ${c.ref}`).join('\n')}

Return one entry per character with its id, the block, and an "unsure" list naming anything you could not confirm.`
}

function verifyPrompt(batch, described, i) {
  const byId = {}
  for (const c of (described && described.characters) || []) byId[c.id] = c
  return `You are an adversarial checker. Another writer described Jumping Jimothy characters from their reference sheets for an image-generation prompt. Wrong details will make ChatGPT paint the character off model, so your job is to find every claim that the pictures do not support and fix it.

${ORDER}

For EACH character below: use the Read tool on the reference sheet image and look closely (read it again if needed). Then check every single claim in the block: colours, garments, materials, props, which frames have which prop, body shape, tail, stance. Remove or correct anything the image does not show. Add any important always-visible detail the writer missed. Keep the house format and voice exactly (the three headings, two-space indents, plain text).

Rules the final block must obey:
${RULES.map(r => '- ' + r).join('\n')}

${batch.map(c => {
  const d = byId[c.id]
  return `=== id "${c.id}", name "${c.name}", bio "${c.bio}", reference sheet ${c.ref}
${d ? 'BLOCK TO CHECK:\n' + d.block + (d.unsure && d.unsure.length ? '\nWRITER WAS UNSURE ABOUT: ' + d.unsure.join('; ') : '') : 'NO BLOCK WAS WRITTEN. Write one from scratch in the house format (see ' + DOCS + '/11-soggy.txt lines 1-37).'}`
}).join('\n\n')}

Return one entry per character: id, the corrected block (the full text, even if unchanged), "corrections" listing each change and why (empty if none), and "unsure" for anything still unconfirmed. Batch ${i + 1}.`
}

const POSE_SCHEMA = {
  type: 'object',
  properties: {
    frames: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          frame: { type: 'string' },
          inGame: { type: 'string', description: 'The In the game line: when it shows and for how long' },
          pose: { type: 'string', description: 'Costume-neutral pose description, 2 to 4 sentences' },
        },
        required: ['frame', 'inGame', 'pose'],
      },
    },
  },
  required: ['frames'],
}

const posePrompt = `You are writing a costume-neutral pose guide for Jumping Jimothy, a storybook hopper about a raccoon on the rainy streets of Seattle. It will be used to repaint single animation frames for costumed versions of Jimothy (the same raccoon body wearing a costume) that have no written brief of their own.

Read these briefs, which describe the same 18 frames for five raccoon costumes: ${DOCS}/11-soggy.txt, ${DOCS}/12-summer.txt, ${DOCS}/13-nordic.txt, ${DOCS}/14-barista.txt and ${DOCS}/16-grad.txt. Each numbered frame entry has an "In the game:" line and a pose paragraph. Also look at the hero's own reference sheet with the Read tool: ${args.heroRef}. ${ORDER}

Write one entry for each of these frames, in this order: idle, crouch, leap, land, run-l, run-r, run-r2, dash-run, flee, coffee, magnet, umbrella, shield, scared, sit, eat, cheer, dizzy, splash, ko.
- inGame: copy the "In the game:" line the briefs share for that frame (they agree; if they differ slightly, use the most common wording). run-l has no brief: write "a sideways hop to the left · 0.28s". run-r2 has no brief: write "the second stride of a sideways hop to the right, hero only · 0.28s".
- pose: 2 to 4 sentences describing the pose, the expression and the painted effect that ALL five briefs agree on, with every costume-specific detail removed (no hats, cups, newspapers, sunglasses, knitwear). Name what props are universal to the frame (for example the coffee cup, the umbrella, the fry tray, the shield dome, circling stars) because the game expects them. For run-l, describe the run-r pose facing LEFT and add: "Paint it facing left; do not mirror the right-facing frame, because straps and costume details must stay on their true sides." For run-r2, describe the alternate stride of run-r.
Plain text, no markdown. Never name any real person.`

phase('Describe')
const posesP = agent(posePrompt, { label: 'poses', phase: 'Poses', schema: POSE_SCHEMA })
const verified = await pipeline(
  BATCHES,
  (batch, _b, i) => agent(describePrompt(batch, i), { label: `describe:${i + 1}`, phase: 'Describe', schema: BLOCK_SCHEMA }),
  (described, batch, i) => agent(verifyPrompt(batch, described, i), { label: `verify:${i + 1}`, phase: 'Verify', schema: BLOCK_SCHEMA })
    .then(v => ({ described, verified: v })),
)
const poses = await posesP
const out = {}
for (const r of verified.filter(Boolean)) {
  const dById = {}
  for (const c of (r.described && r.described.characters) || []) dById[c.id] = c
  for (const c of (r.verified && r.verified.characters) || []) out[c.id] = { block: c.block, corrections: c.corrections || [], unsure: c.unsure || [], draftUnsure: (dById[c.id] && dById[c.id].unsure) || [] }
  for (const id of Object.keys(dById)) if (!out[id]) out[id] = { block: dById[id].block, corrections: ['VERIFIER RETURNED NOTHING FOR THIS ONE'], unsure: dById[id].unsure || [] }
}
const missing = CHARS.map(c => c.id).filter(id => !out[id])
if (missing.length) log('No block for: ' + missing.join(', '))
return { blocks: out, missing, poses: poses && poses.frames }
