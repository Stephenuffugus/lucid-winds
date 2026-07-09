# Petal Slice — Revamp Brief

**Revives:** Fruit Ninja (Halfbrick, 2010)

## The essence (protect this)

A single swipe that slices multiple arcing objects at once, rewarded instantly with juice, sound, and a combo multiplier — the whole loop is "see the arc, draw the line, feel the pop." Protect the readable-arc / one-stroke-many-cuts fantasy above everything.

## Signature upgrade

GRAFT LINES — the planned one-stroke combo made collectible. Pods and blossoms fall loosely tethered by faint glowing vine filaments; some clusters light up with a live "graft path" showing the exact curve that links 3-5 of them. Trace that whole path in a SINGLE unbroken swipe and you don't just score a combo — you GRAFT the sliced blooms into one real procedural cutting that drops into your greenhouse/Nursery. The combo stops being ephemeral confetti and becomes the actual mint action of the collection meta. It's readable enough for a 6-year-old (just follow the glowing line), yet the mastery ceiling is enormous: optimal runs are about reading multiple graft paths mid-air and choosing ONE curved stroke that harvests the best cutting while still catching the loose pods around it. No Fruit Ninja clone turns the swipe into a plantable artifact — this is why ours is the definitive version.

## Dated friction to kill

- One bomb = instant game-over: a single mistimed swipe erases a great run. Punishing and rage-inducing, especially for kids.
- FN2's energy/ticket gating of Arcade and gacha loot boxes for blades — pay-to-slice friction that killed goodwill. We must never gate the core mode.
- Loss of personalization players loved in FN1 (dojo/blade choice becoming random boxes). Cozy players want to CHOOSE their look.
- Random object spawns with no read-ahead — feels chaotic rather than masterful; no way to PLAN a great combo, so the skill ceiling is mostly reflex, not intent.
- Score is ephemeral: a huge combo evaporates the instant it happens. Nothing you slice persists or feeds a collection, so there's no reason to come back tomorrow.
- Thin feedback on WHY a slice was good — the game rarely distinguishes a lucky triple from a planned, curved, on-beat masterstroke.
- Bombs read as pure punishment with no counterplay skill expression beyond 'don't touch.'

## Game-feel spec

- Blade trail is a living vine that sprouts tiny leaves along the stroke and fades over ~350ms; faster swipes = brighter, thicker trail with a soft bloom glow.
- Every cut spawns a two-halves physics split with a burst of seed/pulp particles and a nectar splatter that sticks to the wooden backdrop for a few seconds (the FN 'juice on the dojo' feel, botanical version).
- Generous hit detection: slice registers on a fat capsule around the object's silhouette + a few ms of trail lookback, so near-misses count. Input window forgiveness scales DOWN as difficulty rises (assist that decays).
- Combo escalation: 3+ in one stroke triggers a rising wind-chime arpeggio, screen-edge petal vignette, and a brief 120ms time-dilation on the last cut so the multi-slice lands with weight.
- Completing a full GRAFT path fires a signature slow-mo 'Bloom Finish': time drops to ~25%, camera pushes in slightly, sliced blooms spiral together and a new flower unfurls with a warm gold flash and a low chime — the money moment.
- Haptics: light tick per slice, medium double-pulse on a graft completion, soft warning buzz when the blade grazes a burr (not a cut — a warning, see onboarding).
- Screen-shake is tiny and reserved ONLY for burr hits and Bloom Finishes; never on normal slices, so it stays a punctuation mark.
- Idle pods gently bob and catch a rim-light so the play space always feels alive, never static between throws.
- Audio bed is a soft night-garden ambience (crickets, breeze); slice SFX are pitched up the combo ladder so a big chain literally plays a melody.

## Onboarding & difficulty

First throw is a single slow pod on a dimmed screen with a ghost finger tracing the swipe — slice it, get a bloom and a chime. Second throw introduces a 3-pod graft line with the glowing path pre-drawn: 'trace the vine.' Third introduces a burr with a red pulse and the rule 'go around' (see modes for how burrs fail-soft). That's the entire tutorial — under 15 seconds, no text walls. It stays hard-to-master because early on the graft path is fully drawn and input windows are wide; as you climb, the drawn path fades to just endpoint hints, multiple graft clusters overlap in the air, spawn speed rises, and the forgiveness capsule shrinks. The assists literally decay with your skill, so a beginner and an expert are playing the same game at different resolutions.

## Modes

- Grove (main / endless): waves of pods and graft lines escalate; burrs are a fail-soft 'wilt' system — hitting one wilts your combo meter and costs a life-petal (3 petals), no instant game-over. Run ends when all petals wilt.
- Zen Garden: 90 seconds, zero burrs, infinite forgiveness — pure cozy slicing for score and grafts. The kid-safe / decompress mode, always free, never gated.
- Daily Bloom: one fixed seeded board everyone gets the same day; a hand-authored graft-path puzzle with a par score. Feeds the streak/leaderboard and awards the day's Sunbeam bonus + a chance at a seasonal companion.
- Petal Rush (challenge): 60-second escalating gauntlet with a single 'perfect graft' target each run — clean it for a rare cutting. The mastery/ceiling mode.

## Botanical identity

Set in the Lucid Winds midnight garden: a moonlit wooden potting-bench backdrop (reuse the deep-black / sage / gold palette) instead of the dojo. You slice tossed SEED PODS, BERRIES, and BLOSSOMS; the 'bombs' are THORNY BURRS (spiky, unmistakably red-pulsed, clearly 'do not touch'). Nectar splatter replaces juice; the blade is a sprouting vine, not a katana. The 4-season art system drives the whole skin: spring throws cherry pods and pink nectar, summer bright berries, autumn seed husks and copper leaves on the trail, winter frost-glazed pods with icy shatter and pale-blue splatter — the same board reskins four ways for free variety. Sliced graft-blooms are rendered by the existing _generatePlantSVG so every cutting you harvest is a genuine one-of-one plant, not a generic reward icon. Companions (from the 85) flit across the backdrop as ambient life and occasionally toss a bonus pod.

## Retention hook

Three interlocking pulls. (1) Daily Bloom streak: one puzzle board a day with a Sunbeam bonus that grows with your streak, plus a streak-safe 'dew' cushion so a missed day stings less than FN2's hard resets. (2) The Graft collection: because a clean graft mints a real cutting into your Nursery, Petal Slice becomes a genuine feeder into the plant-collection economy — you play to GROW your greenhouse, not just to post a number. Seasonal graft-blooms are only harvestable during their season, driving quarterly return. (3) Companion cameos: hit weekly graft milestones to unlock a companion that appears on your bench and buffs your daily Sunbeam trickle. Sunbeams from Grove/Zen are capped per day (per the 30/day, 12/run standard) so it feeds the economy without inflating it.

## Why ours wins

Fruit Ninja throws away your best combo the instant it happens and punishes one slip with game-over; Petal Slice turns that same perfect swipe into a real plant you keep — the juice you already love, now with a reason to come back tomorrow, and never a bomb that ends your run out of nowhere.

## Build notes

Single-file HTML5 canvas, ES5, fits the portal satellite pattern cleanly. Core is a lightweight particle + simple gravity/physics loop (pods are parabolic arcs — trivial math, no physics engine) plus swipe-path sampling and segment-vs-capsule intersection for hit detection; all well within canvas 2D. Biggest reuse wins: _generatePlantSVG for graft-bloom cuttings (rasterize the SVG to an offscreen canvas once per cutting), the 4-season art system as the reskin engine (huge art-variety-for-free), the 85-companion roster for ambient bench life and milestone unlocks, and the Sunbeam/streak portal hooks that already exist. Effort: a solid mid-size build — the slicing/particle/juice core is a few days; the GRAFT-path generator (authoring readable single-stroke curves through 3-5 falling objects and validating an unbroken swipe covers them) is the real design/tuning work and where the polish budget should go. Daily Bloom needs a seeded deterministic board generator (reuse the hash-seed pattern). Watch iOS: keep to one <g> for any SVG filters, cap particle counts for thermals, and pool objects to avoid GC hitches mid-swipe.
