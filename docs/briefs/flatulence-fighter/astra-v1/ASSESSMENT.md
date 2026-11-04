# Flatulence Fighter: the joke needs witnesses

Review date: 4 November 2026. Reviewed all 16 supplied phone captures and all six prior art notes. This is a visual and design review, not a playtest: the archive contains no HTML source. Timing, save logic, actual DOM hit areas, performance and accessibility remain unverified. No production code has been changed.

## Decision
Keep **Flatulence Fighter** for this package and retain the two pad grip, asymmetric fatigue, cover noise timing, earned wardrobe, scene writing and paper/sage identity. The memorable moment should be a dignified person desperately maintaining eye contact while everyone nearby slowly turns. Sell the social embarrassment, not a bodily effect. The name is clear and Stephen likes it, but the first image must counter its novelty-game associations. Do not promise sales based on an art upgrade.

**Silent Reel** stays, with stronger stage silhouettes, bold ink characters, real shoulders and graphic theatrical fittings. Scenery uses soft, generated editorial texture; characters and UI use crisp editable vector art. This combination keeps expressions exact, controls legible and the four palettes practical. No haze, gas, toilet imagery, cloud, celebrity imitation, borrowed character, or cartoon stink trail. Grain is a surface detail, never a full-screen animated obstruction.

Player route: five complete SVG bust rigs with six switchable expression groups each, plus independent transparent 720 px expression renders. Every character has its own silhouette and facial proportions. This is the brief's vector option; no giant 2160 px expression atlas that breaks the 1600 px web limit. Sweat and flush remain separate runtime overlays. The Bulldog remains a wardrobe performer, never the logo mascot.

## First visit and day 30, screen by screen

| Capture | A 13 year old following a friend's link | A returning medal hunter | Change |
|---|---|---|---|
| 01 Menu | A text card, not an obvious comedy game; seven choices before the joke | Mode and difficulty are useful, but last run context is absent | Put a visibly composed bust and room behind the wordmark; Stage/Normal default; Practice prominent for first run; remember selections |
| 02 How to play | A paragraph wall asks the player to memorize multiple systems | No concise rule reference for a specific medal | Three illustrated core steps, then optional details; state when a hand can safely leave a pad |
| 03 Medals | Most marks look missing and locked cards look empty | Cannot see nearest completion or isolate missing medals | Distinct SVG marks, readable locked contrast, progress such as 8 of 10, filter earned/remaining; keep the names |
| 04 Wardrobe | Empty rectangles do not communicate a reward | Thresholds are good; palette difference is invisible | Five bust portraits, four actual swatches, selected check and lock independent of color |
| 05 Stats | A large quiet table with no punchline | Valuable lifetime data but no recent-run context | Lead with best composure and deepest act; retain detailed table below; no fabricated comparison percentiles |
| 06 Tutorial | Coach sits over breath while asking about pads | Skip exists, but the screen does not communicate a restartable lesson | Freeze pressure while explaining; spotlight only the requested control; success-gate each lesson; replay from menu |
| 07 Intertitle | Funeral title works; blurred balloon behind it does not establish a chapel | Repeated delay could become friction | Dedicated silent-film frame; show room before card; fast repeat-run transition, tappable continue after readable dwell |
| 08 Calm | A floating head, a large empty middle and many small controls | Familiar layout, but fatigue/gasp/pressure hierarchy is unclear | Bust anchored to seat, subdued room, clear strain meters; protect thumb reach and give each meter an explicit label |
| 09 Cover noise | Banner at top and action at bottom compete; sound alone may be missed | Need exact remaining safe time and reliable perfect timing | One synchronized visual cover countdown linked to VENT; never require hearing or motion to identify the window |
| 10 After vent | Relaxed face is good; multiplier is tiny | Wants to know whether it was perfect and why combo changed | Brief local relief expression, readable combo badge and single feedback message |
| 11 Leaks | Tiny floating glyph boxes look broken; reaching high abandons grip | Misses may feel like reach failures instead of decisions | 48 px minimum hit circles, no overlap, safe two-thumb spawn region; test pointer arbitration |
| 12 Whiff | Nearly identical to 11; urgency not visibly explained in this frozen capture | Cannot infer the warning's duration | Distinct nose/reaction icon plus short label, not a smell cloud; keep it off the face |
| 13 Critical | Red text cuts across the face while controls remain busy | Needs cause and recovery opportunity clearly separated | Reaction ribbon below stage; show actual turned witness, amber hatching before danger |
| 14 Strike | Strong flush reads but red flood and huge eyes swamp the joke | Waft lit state is useful; window duration is not readable | Brief local strike emphasis, one witness turn, timed Waft rim; avoid full-screen red flash |
| 15 Pause | Clear resume choice; generic dimmed card | Must not lose held input or accrue penalties | Release pointer states on pause; freeze every timer; resume countdown before pressure restarts |
| 16 Result | A stat receipt, no moment worth sending | Bests and medals are useful, retry is clear | Final face + scene + actual act/time + verdict; retry first, share second; retain honest stats |

## Hard-line audit and contradictions

- Emoji and missing-glyph boxes are visible in medals, abilities and floating UI. Replace game glyphs with the supplied icons; do not silently rebuild arcade chrome.
- `VENT!` and the cover banner exclamation violate the copy rule. Use `VENT` and `Cover noise`. Remove every player-facing dash and exclamation mark in the integration copy audit.
- Remove the homage line and `Lucid Games presents` from store-facing game surfaces. This is a brand/confusion recommendation, not a trademark clearance opinion. The earlier game is inspiration, not store copy. No competitor assets are used here.
- Small back, lean and ability controls appear below or close to 48 px in the 412 px captures. A screenshot cannot reveal a larger invisible hit area. Measure their actual DOM bounds and minimum spacing at 360, 390, 412 and 430 CSS px before release.
- Arcade Music and floating utility chrome visibly overlap the lower and right game regions. Coordinate a standalone layout with the arcade owner; do not place game controls beneath them.
- The old notes request clouds, smoke, puffs, magenta knockout and unchanged emoji. The current brief supersedes those requests: no cloud art, genuine alpha, SVG icons and revised copy.
- The old notes and current brief disagree on Silver Screen eligibility: all modes versus Easy/Normal/Panic/Daily/Zen. Preserve the actual shipped save behavior until the team checks it; copy and achievement logic must match. Do not add One Cheek retroactively without a migration decision.
- Twelve named scenes plus infinite/repeating acts means a result must store scene ID and act independently. `The Funeral, Act III` is only valid if that run really reached that pairing.

## Ranked smoothing plan

Sizes are effort buckets, not calendar promises. Art is delivered in this pack; code is the development team's work.

| Priority | Work | Size | Owner | Dependency | Done when |
|---|---|---|---|---|---|
| 1 | Put a bust in a recognizable room and seat | M | Art + code | Stage and character assets | All 12 scenes distinguishable without reading a chip |
| 2 | Make a witness turn on each strike | M | Art + code | 1, onlooker state strips | A player understands who heard them before reading a caption |
| 3 | Fix thumb reach and stage the tutorial | L | Code | Pointer and layout audit | New player completes hold, rest, vent and plug lessons without accidental input loss |
| 4 | Replace emojis and clarify cover/unsafe states | S | Art + code | Icons and controls | No missing glyphs; mute and grayscale runs remain readable |
| 5 | Make result card shareable | M | Art + code | 1, captured final run state | An exported image tells what happened without fabricated values |
| 6 | Identity and store preparation | M | Art + code | 1 to 5 | Honest real captures sit inside six supplied frames |
| 7 | Show wardrobe and medal progress | M | Art + code | Portraits, medal marks, verified save fields | Locked cards explain exact known thresholds; equipped state is unmistakable |
| 8 | Cover-event staging | M | Art + code | Cover event IDs, scene windows | Timing follows the gameplay clock, never an animation guess |
| 9 | Refine audio and reduced motion | M | Code | Event timing and settings | Full mute play possible; reduced motion removes shake/zoom/film flicker |

## Improvements ranked by hook

1. **The room catches you. Ship first.** Two or three witnesses hold their pose until a strike, then one turns, then the next. Keep a turned witness present long enough to read. Needs the supplied paired strips; avoid moving their entire bodies or obscuring the player. A funeral reaction must be restrained, not a joke about the deceased.
2. **A result worth sending. Ship second.** Final expression, actual room, act, held time and verdict in a designed frame. The joke is the evidence of failed dignity. Needs sharing frames and expression renders; export locally, use native share only after the user taps, and offer save-image fallback. No address book access.
3. **Cover noises belong to the room. Ship third.** A bus silhouette slides behind the chapel window, the microphone lamp responds in the booth, or a book stack tips in the library. Keep the first implementation to bus, books and a lamp. Needs event props, scene clips and a shared cover timer; functional visual cues remain when motion is reduced. Never decorate with an event that is not actually active.
4. **Daily challenge you can send.** A seed card and deterministic event schedule, with version, date convention, difficulty and settings encoded. Seeds alone do not guarantee parity if randomness depends on frame rate. No public leaderboard until trustworthy infrastructure exists; this game remains offline-capable.
5. **Pass the phone duel.** Equal seed and difficulty, separate attempt state, neutral handover screen, three short rounds. Score by survival then perfect vents as a disclosed tie break. Works offline; no identity/account system. Needs a second player result layout, not new scenery.
6. **Three-panel comic reel.** Capture beginning, near miss and exposure as state snapshots; compose only after the run. This follows the single-card exporter and needs explicit memory bounds. Do not record video continually.
7. **Synthesized silent-film accompaniment.** Short responsive motifs with a separate music volume; never mask the cover cue. Art needed: none beyond sound controls.
8. **More scenes.** Lowest priority until existing 12 look distinct and controls test well. An exam hall and a museum tour could work, but more names alone will not improve retention.

## Three selling risks

1. **Novelty positioning.** Name and subject can suggest a disposable children's gag. Lead with the deadpan human face, onlookers and theatrical composition. Test whether viewers describe it as a timing/composure game after five seconds. Avoid fake review quotes, promised laughs or claims of premium quality unsupported by playtests.
2. **Input overload masquerading as difficulty.** Two held thumbs plus several simultaneous interruptions risks frustration and accessibility barriers. Make rest/vent windows intentional; evaluate auto-breath/auto-posture assist options separately from competitive daily scoring. Never quietly change rankings or medal eligibility. Test time to first intentional vent, accidental pad releases and cause-of-failure comprehension.
3. **Derivative identity and thin repeat value.** Remove the other game's title and confusing presenter brand. Build an original visual voice and visible earned progress. Before paid release, playtest consecutive runs and a return session. A precise monetization or legal clearance conclusion is outside this screenshot review.

## Naming record

Keep **Flatulence Fighter** for this delivery. Alternate **Perfectly Composed** emphasizes the double meaning and social stakes; alternate **Hold Your Dignity** makes the action and comedy clearer. These are unsearched creative candidates, not cleared marks or confirmed available store titles. No renaming migration is assumed.

## Store read and screenshot sequence

A reviewer or parent should see a clothed stage performer in a recognizable social scene, a readable timing challenge and a restrained reaction. Nothing needs a bodily depiction. The store title/content questionnaire must still describe the actual game honestly. This package does not predict a rating or approval.

1. Hold it in: real chapel gameplay, two pads and a full bust. Suggested heading: `Keep your composure`.
2. Cover timing: real active cover banner, VENT countdown and relief. Heading: `Wait for your moment`.
3. Reaction: actual struck state with turned witnesses. Heading: `The room heard that`.
4. Scene variety: real in-game scene selection or a clearly composed set of real captures. Heading: `Twelve very quiet rooms`.
5. Wardrobe: actual earned/locked cards with visible thresholds. Heading: `Earn your stage presence`.
6. Medals and Daily: genuine progress and dated challenge UI. Heading: `Return for another ordeal`.

The supplied frames contain no invented gameplay, store claims or words. Do not upload style mockups as gameplay screenshots. Capture after integration and test every crop at phone size.
