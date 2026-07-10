# Cipher Bloom — Revamp Brief

**Revives:** Cryptogram (the classic letter-substitution puzzle — a quote is enciphered one letter for another, and you deduce the mapping from frequency and word patterns)

## The essence (protect this)

The slow, warm click of deduction: you spot that a one-letter word is probably "A" or "I," a doubled letter cracks open, and suddenly a whole word resolves and cascades into three more. It's a gentle logic massage — no clock, no twitch, just you, a scrambled message, and the quiet triumph of the last letter falling into place. Protect the frequency-and-pattern reasoning, the cascade of a good guess propagating everywhere, and the satisfaction of a message that reads clean at the end.

## Signature upgrade

THE HIDDEN VERSE — instead of decoding a stale famous quote you've seen a hundred times, you decode a **real procedural haiku** pulled live from the game's own `getHaiku` engine (infinite, free, never-repeating content), and the moment you crack it, the poem's **plant reveals itself** — its one-of-one bloom draws in beside the solved verse and a pinch of **dew** drips into your purse. This is the definitive hook because it solves the genre's two dead ends at once: cryptograms run out of fresh quotes and reward you with nothing but "solved," while ours has a bottomless well of short, cozy, original poems and pays each solve with a plant and currency that feed the real game. The decode isn't trivia — it's uncovering a secret the garden was whispering, and keeping it. A cryptogram where every puzzle is new, every solution is beautiful, and every answer is yours.

## Dated friction to kill

- Stuck-wall with no way out: classic cryptograms can hard-lock you on an obscure word with no recourse but to quit. Ours: a **reveal-a-letter hint** you buy with dew, letter-frequency highlighting, and a "check" that flags wrong guesses — you can always inch forward.
- Long, dense quotes: a 30-word aphorism is intimidating on a phone. Ours: a haiku is ~10–14 words / 17 syllables — approachable in one screen, solvable in a coffee break, perfect for a daily.
- Obscure, joyless source text: nobody's delighted to decode a 19th-century economist. Ours: the payoff is a plant + dew + a poem you actually want to have decoded.
- Clumsy input: typing into a cipher grid with ambiguous cells is fiddly. Ours: tap a ciphered letter to select it everywhere, tap a big on-screen keyboard to assign, auto-propagate the guess to every instance, and one-tap undo.
- Invisible progress: you never know how close you are. Ours: a soft "X of Y unique letters mapped" ring and a gentle glow when a whole word goes valid.
- No reason to return: a cryptogram book is a one-and-done. Ours: a daily seeded verse, a streak, a growing gallery of decoded haikus and the plants they revealed.

## Game-feel spec

- Select + assign: tapping a ciphered glyph lifts every matching glyph with a soft highlight; tapping a plain letter on the keyboard fills them all at once with an inky "written" stroke and a quiet nib-scratch sound; a wrong-but-plausible guess is allowed (no gate) so you can reason by trial.
- Word-resolve delight: when a word becomes fully valid English, it briefly warms gold and a little chime rises a semitone per word solved, building a small melody as the verse comes together.
- Frequency help: a subtle bar under each cipher letter shows how often it appears; the most common glyph gently suggests it's likely E/T/A, teaching real cryptanalysis by feel.
- Hint feel: buying a reveal blooms one correct letter open with a petal flourish and deducts dew with a soft coin-clink — earned help, never a crutch handed free.
- Solve moment: the last letter lands, the whole haiku settles into clean type, then the poem's plant draws itself stroke-by-stroke beside it (reusing the SVG render), dew arcs to the purse, and a warm resolving chord plays. Slow, cozy, dignified.
- No fail state, no buzzer: a wrong guess just doesn't turn a word gold; there's no lives, no loss — only forward.

## Onboarding & difficulty

Your first puzzle is a short 3-line verse with several letters pre-filled and a pulsing hint on a one-letter word: "this glyph appears alone a lot — try I." One guided assignment shows the whole loop — select, assign, watch it propagate, see a word go gold — in about ten seconds, no text wall. Difficulty scales by how much scaffolding you're given: Gentle mode pre-fills the vowels and the most common consonant; standard gives you a few; Master gives you nothing and a rarer letter distribution. The hard-to-master ceiling is real cryptanalysis — reading pattern words, digraphs, and letter frequency cold with zero freebies and no hints spent — plus the collector's chase of decoding rarer seasonal verses. Easy to solve your first with training wheels; a genuine skill to crack a Master verse hintless.

## Modes

- Daily Cipher (main retention) — one date-seeded haiku everyone gets that day, solvable in a few minutes, pays a guaranteed Sunbeam + reveals a unique daily bloom scaled by login streak. The whole game's spine, a perfect once-a-day habit.
- Garden of Verses — endless procedural haikus at your chosen difficulty; each solve reveals a plant into your decoded-gallery and drips dew. Where the collection grows.
- Sun Race (challenge) — a timed decode for a leaderboard and the biggest Sunbeam payout; optional, for players who want pressure.
- Zen Reading — untimed, hints free and plentiful, gentlest letter distribution; a calm wind-down for kids and casual solvers, earns no Sunbeams.

## Theme & identity

Cozy and botanical, framed as reading the garden's secret poetry. The play surface is a moonlit sheet of pressed-paper with the ciphered haiku set in warm ink; solved letters land as handwritten strokes; the on-screen keyboard is a row of seed-buttons. The verses come straight from `getHaiku`, so they're the same poems that live on the plant cards, and the revealed bloom renders through the real plant SVG engine — decoding a verse literally uncovers a plant from the game's own world. Palette is midnight-garden parchment: deep near-black margins, cream paper, gold ink-glow on solved words, sage and dew accents, a firefly or two drifting past. Fully accessible: letters are big, high-contrast, and never color-coded alone (correct/incorrect shown by weight and a check mark, not just hue).

## Retention hook

Daily Cipher is the spine: one shared verse a day, a guaranteed Sunbeam, and a unique daily bloom whose rarity rides your login streak (miss a day, streak and rarity reset). Garden of Verses feeds a Decoded Gallery — every solved haiku and the plant it revealed, a browsable collection that doubles as the cosmetic unlock wall. Dew earned per solve funds hints and cosmetic early-unlocks. Cosmetics come at known thresholds of verses-solved / hintless-solves / daily-streak: parchment themes (vellum, birch-bark, pressed-petal, midnight-slate), ink colors, nib/pen skins, and wax-seal stamps that mark a solved verse. Sunbeams follow the portal standard (30/day/game, 12/run cap). The compounding pull: the streak protects your daily bloom, every solve grows the gallery and your dew, and the gallery shows off the poems you've cracked.

## Why ours wins

A cryptogram book runs out of quotes and pays you nothing; Cipher Bloom has a bottomless well of fresh, cozy, original haiku and pays every solve with a real plant, a splash of dew, and a poem worth having decoded — plus a hint system so you're never truly stuck. Same warm deduction, infinite content, and an answer you keep.

## Build notes

Single-file vanilla ES5 canvas/DOM, no frameworks — this is a **near-zero-cost, high-habit build**. Heavy reuse: `getHaiku` supplies infinite puzzle text for free, the plant SVG renderer draws the reveal, hashToTraits ties each verse to its plant, dew is an existing currency, and Sunbeams follow the standard. Genuinely new code is small: a substitution-cipher generator (random derangement of the alphabet with a seed), the tap-select / keyboard-assign / auto-propagate input, letter-frequency display, a validity checker (does the current mapping make the visible words real — cheap against a small common-word set plus exact haiku match), the hint economy, and the date-seeded daily RNG (mulberry32). Keep the letter distribution tunable per difficulty (how many letters pre-filled). Watch that the cipher never accidentally maps a letter to itself. Fully offline, tiny footprint, trivial thermals. ⛔ One of four "your run reveals/mints a plant" concepts (with Season Sway / Petal Alchemy / First Sprout) — don't ship them back-to-back, but this is the cheapest and a natural daily anchor.
