# Root Groups — Revamp Brief

**Revives:** NYT Connections (2023) — sixteen tiles hide four secret groups of four; find them all before four wrong guesses, with tiers of difficulty and deliberate overlap traps

## The essence (protect this)

The "aha" of the hidden thread: sixteen words sit in a grid looking unrelated, you sense that four of them share *something*, you commit, and the board confirms — or gently corrects — your read. The genius is the misdirection: a tile that looks like it belongs to one group actually anchors another, and untangling that overlap is the whole delight. Protect the four-of-four commit, the escalating difficulty tiers (easy to devious), the "one away" near-miss ache, and the clean satisfaction of the last group falling out for free once the others are gone.

## Signature upgrade

THE BLOOM GROUPS — every group you solve doesn't just clear, it **blooms**: the four tiles fold into a single keepsake that flowers on your board, and the trickiest group (the "root" group, the deepest tier) reveals a **rare seed** that drops to your pouch. Where Connections gives you a share-grid of colored squares and a "come back tomorrow," ours turns each solved category into a small collectible and each board into a little garden you grew by out-thinking it. This is the definitive hook because it gives the pure logic puzzle a *keepable* payoff and an endless supply: solved groups pay dew and Sunbeams, the deepest group seeds your collection, and because our category banks are generated from the game's own data we're never rationed to one puzzle a day. A Connections where cracking the hardest group grows something you keep.

## Dated friction to kill

- One puzzle a day, then nothing: NYT gives you a single board and locks you out. Ours: the daily seeded board *plus* endless generated boards whenever you want more.
- Brutal, punishing loss: four wrong guesses and it's over, cold, with the answers dumped on you — deflating for casual and young players. Ours: a gentler default (a forgiving guess budget), a Zen mode with unlimited tries, and a loss that reveals the groups warmly rather than as a failure screen.
- No help when truly stuck: Connections offers nothing but "one away." Ours adds an optional dew-bought hint that removes one red-herring tile from consideration or locks one confirmed tile, so a stuck board is never a dead end.
- Nothing to keep: a solved board is a screenshot and a streak number. Ours blooms keepsakes, pays dew + Sunbeams, seeds your pouch, and logs categories in a compendium.
- Opaque near-misses: "one away" is helpful but blunt. Ours keeps "one away" and adds a soft shuffle and a clear guess counter so you always know your standing.
- Category obscurity: NYT sometimes leans on niche pop-culture that locks non-US or younger players out. Ours draws from clear, universal, and on-brand pools (plants, seasons, companions, colors, everyday words) so the "aha" is fair, not trivia gatekeeping.

## Game-feel spec

- Select + commit: tap up to four tiles — each lifts with a soft shadow and a sage rim; a full four of them makes the Submit seed-button glow; commit sends a quick "settle" animation as the game checks.
- Correct group: the four tiles slide together, merge, and **bloom** into a single labeled keepsake flower that docks to the top of the board with a rising chime (pitched up per group solved); the category name writes in gold.
- "One away": a gentle amber pulse on your four tiles and a soft "so close" tone — informative, never scolding; the tiles stay put so you can adjust one.
- Wrong guess: a soft wilt-and-return, one pip spent from your guess budget shown as a row of buds (spent buds close), no harsh buzzer.
- Root-group reveal: solving the deepest tier triggers a brief slow-mo, a rarer bloom, and a seed that arcs to your pouch — the board's peak beat.
- Board clear: the last group solves for free, all four keepsakes flower in a left-to-right wave, Sunbeams arc up, and a warm chord resolves; a "solve grid" (the tier order you cracked them in) is offered for sharing.
- Shuffle: a tidy re-scatter button (purely cosmetic) for when your eyes need a fresh arrangement.

## Onboarding & difficulty

Your first board is transparent on purpose: four obvious groups (say Roses, Blues, Birds, Numbers) with no tricky overlaps and a one-line nudge — "tap four that belong together, then Submit." One solved group teaches the whole loop and the bloom payoff in seconds, no text wall. Difficulty is the overlap, exactly as in the original: (1) tiles are seeded to *look* like they fit the wrong group (a "Tulip" tile in a board with a Colors group where one color is also a flower), (2) the four tiers run easy→devious so the last group is a genuine mind-bender, (3) guess budgets tighten from generous (Zen/early) to strict (daily/master), and (4) endless mode escalates category subtlety as your streak climbs. Easy to spot the obvious group; a real head-scratcher to see past the trap tile to the root group.

## Modes

- Daily Board (main retention) — one date-seeded 16-tile board everyone gets that day, standard guess budget, pays a guaranteed Sunbeam + the root-group's seasonal seed scaled by login streak; the shareable once-a-day habit.
- Endless Beds — freshly generated boards on demand at your chosen difficulty; each solved board blooms keepsakes, pays dew, and grows your category compendium. Where the collection lives.
- Zen Sort — unlimited guesses, no loss, gentlest category pools; a calm, kid-safe way to enjoy the "aha" without stakes; earns no Sunbeams.
- Tangle (twist mode) — the devious variant: one board with a **wildcard tile** that legitimately fits two groups (you must deduce which group *needs* it) or a 20-tile / five-group board for masters; the leaderboard and biggest payouts live here.

## Theme & identity

Cozy and on-brand without being cutesy: tiles are pressed-paper chips on a moonlit board, and the category pools lean into the Lucid Winds world alongside universal ones — plant families and flower names, the four seasons and their kigo, the 85 companions by type (things that swim / fly / burrow), trait-layer words, colors, plus everyday kid-friendly sets (fruits, weather, shapes) so it never becomes insider trivia. Solved groups bloom real papercut flowers; the root-group seed drops into the same Wild pouch you own. Palette is the midnight garden — deep near-black board, cream tiles, sage selection rim, gold category labels, tier colors that also carry a tier *symbol* (one/two/three/four leaves) so difficulty is readable without color alone (colorblind-native). It reads native because the categories are made of the game's own flora, fauna, and seasons.

## Retention hook

Daily Board is the spine: one shared board a day, a guaranteed Sunbeam, and the root group's seasonal seed whose rarity rides your login streak (miss a day, streak and rarity reset). Endless Beds feeds a Category Compendium — every group you've ever solved, browsable, with rarer "root" categories to complete — which doubles as the cosmetic unlock wall. Dew earned per solved group funds hints and cosmetic early-unlocks. Cosmetics unlock at known thresholds of boards-solved / hintless-solves / Tangle wins / daily-streak: board-tile themes (wood, ceramic, slate, pressed-flower, stained-glass), bloom-merge animation styles, and category-label typefaces. Sunbeams follow the portal standard (30/day/game, 12/run cap). The compounding pull: the streak protects your daily seed, every board blooms keepsakes and grows the compendium, and the compendium shows off the threads you've untangled.

## Why ours wins

Connections rations you one brutal board a day, hands you a colored-square grid, and locks the door; Root Groups gives you the same delicious "aha," an endless supply of fair boards, a gentler on-ramp with hints so you're never truly stuck, and a payoff you keep — each solved group blooms a keepsake and the hardest one seeds your garden. Same untangling genius, no rationing, real reward.

## Build notes

Single-file vanilla ES5 canvas/DOM, no frameworks — a compact, high-habit build. Heavy reuse: category pools generate from the game's own data (the 85-companion list, TRAIT_BANK flora, season/kigo banks), the plant SVG renderer draws solved-group keepsakes, the feral-seed/Wild pouch receives the root-group seed, dew + Sunbeams are existing systems. Genuinely new code is modest: a board generator that picks four categories, draws four members each, and — crucially — seeds *overlap traps* (a member that plausibly reads into another chosen category) to create real difficulty; the select/commit/near-miss/guess-budget logic; the bloom-merge animation; and the date-seeded daily RNG (mulberry32). **The real care item is the category bank + trap logic** — the "aha" only works if the misdirection is fair, so the generator must guarantee at least one deliberate overlap tile per board and validate that each intended group is the *unique* correct grouping (no accidental alternate solution). Hand-curate a strong seed bank of categories and let the generator combine them; grow the bank over time like the haiku banks. Deterministic daily seed keeps the shared board fair. Tiny footprint, trivial thermals.
