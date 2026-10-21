# Bubblenaut — enemies and rooms designed together

Design proposal, 20 October 2026. These are construction briefs for 25 rooms, not implemented or playtested maps. Current game measurements and behavior descriptions come from reference/developer-brief.pdf, supplied by Jessie. The repository and executable were not supplied. Tune all dimensions against the actual game before release.

## The governing idea
The room teaches an enemy's movement, then asks the player to use that movement to trap it. Difficulty should come from route choices, timing, overlapping paths and recovering escaped enemies, rather than unreadable clutter or ever-smaller gaps. Every room needs a way to approach, a way to retreat, and a reachable place to pop captured enemies.

The current source-art assignment preserves the five approved distinct enemy identities: Crater Hop/Moss Moon for hopping, Moon Mite/Crystal Caverns for scuttling and ledge drop-through, Orbit Jelly/Rust Belt for flight, Bolt Bucket/Frost Ring for sliding, and Comet Chomp/Magma Core for pouncing. This deliberately adapts the PDF's single-antagonist skin assumption. Rust flight hardware and Frost boot-skids are represented in the delivered art; these world skins have not had a separate user review. The geometry below is tied to the corresponding behavior. Art alone does not implement any movement change.

## Actual size contract

| Quantity | From the developer brief | Implication |
|---|---:|---|
| Logical canvas | 540 x 960 px | Portrait layout; do not crop gameplay to fill phones. |
| Room grid | 15 columns x 19 rows, 36 px tiles | Room rectangle x=0..540, y=90..774. |
| Outer walls | Solid | If one tile thick, interior x=36..504, width 468. Verify actual wall construction. |
| Pip body | 26 x 30 px | Use this collider for traversal tests, not a PNG's full bounding box. |
| Enemy body | 26 x 26 px | Uniform current body size; rendered tails, fins and antennae need a separate visible envelope. |
| Thin ledge | 12 px high | Top is a landing surface. Crystal drop-through must be a deliberate one-way collision behavior. |
| HUD | y=0..90 | No attack warning, enemy, or essential target hidden behind it. |
| Touch controls | roughly y=798..950 | Keep useful room content in the gameplay region. |
| Enemy escape | struggle after 5 seconds; escape at 7; angry speed 1.5x | Judge routes with the escape timer and angry speed, not just a static screenshot. |

Coordinates in this file are logical pixels, not source image pixels. Grid row r begins at canvas y=90+36r. A one-tile opening is not automatically a comfortable passage: a 30px hero in a 36px aperture has only 6px total vertical slack. Decorative edges may not consume that slack invisibly.

### Suggested starting clearances, to validate in the game

- Shared enclosed passages: start at 48px clear height and at least 48px clear width. For tile-only construction, use two-tile (72px) openings for principal routes. Provide wider areas to turn and aim.
- Landings where Pip must stop, face an enemy and shoot: start at 72px usable width. A 26px-wide landing is not a fair resting place on a touch screen.
- Basic flight channels: start at 72px clear width and height, and verify the entire sine wave, including enemy radius and animation envelope. A channel that fits one frozen frame can still pinch a flyer on the next update.
- Clear height means free space between actual collision surfaces; subtract the 12px ledge thickness where applicable. Measure to the underside, not the grid row label.
- Preserve an unbroken, reachable bubble-recovery route. Do not make a ceiling pocket where captured enemies become impossible to pop before escape.
- These are conservative layout starting points, not new physics constants. If the existing jump cannot reach the next shelf, lower the shelf rather than changing jump physics to rescue one drawing.

## The narrow-crack question
With the PDF's present colliders, Pip and enemies have the SAME width. A vertical slot that excludes Pip by width also excludes an enemy. A horizontal gap 27–29px high could geometrically fit a 26px enemy but exclude a 30px Pip; the tiny margin makes this a poor foundation for a major mechanic without collision testing. A one-tile 36px opening admits both.

If Jessie wants an enemy that visibly flattens to squeeze through, implement it as a NEW, clearly signaled mechanic:

1. Give the chosen enemy a deliberate squeeze state with a shorter collider and a matching flattened pose. The belly or crystal plates should visibly fold, rather than clip through rock.
2. Start with a proposed 22px aperture, a 16px squeezed height and 3px clearance above and below. These are experimental numbers, not approved production constants. A 30px Pip cannot enter.
3. Require ordinary body clearance at both entrances, a visible destination, and space to expand. Never restore full height while intersecting a ceiling.
4. Use an explicit tunnel link/path for that enemy. No implicit ability to pass through any thin wall; solid-wall rules remain consistent.
5. Do not put a required treasure or trapped bubble beyond Pip's reach. Allow the player to intercept at either exit; test whether projectiles pass through the aperture using their actual radius.
6. Telegraph entry before traversal; the exit must not overlap the player spawn or create unavoidable contact. Disable this room feature until code, animation and collision tests exist.

The main 25-room plan works WITHOUT squeeze tunnels. The Crystal rooms offer optional squeeze-route variants after that feature is built. Crystal dropping through a thin platform in the current brief is different from crawling through cracks and different from phasing through solid stone.

## Movement envelopes before final geometry

Measure hero jump rise J, safe horizontal jump reach R, enemy hop/pounce rise and reach, projectile radius, projectile travel distance, bubble rise/drift and collision behavior, dash speed/duration, and flyer amplitude/frequency in the actual build. Include co-op spawn positions.

For constant gravity g and jump impulse v, theoretical rise is v²/(2g), but measured results with the game's discrete update and collision code take precedence. Target an introductory vertical step no higher than about 65% of measured J; later steps can approach 80% if landing space is generous. Start horizontal gaps at no more than 60% of measured safe R. Do not set both rise and horizontal reach near their limits on one required jump. Allow headroom above the enemy's jump envelope.

Estimate a flight corridor from body height + twice the sine amplitude + clearance. Evaluate the angry mode's 1.5x speed with maximum supported frame delta. Use swept collision or bounded physics substeps if a dash can cross a wall in one update. Sprite squash and stretch must not change the collider unless the explicit squeeze feature is active.

## Five-room rhythm in each world
1 teaches the behavior in isolation. 2 teaches a positional response. 3 creates a route choice. 4 combines pressures. 5 tests mastery with recovery space. Enemy numbers below are proposed concurrent counts, not spawn quotas; first test solo, then tune co-op separately. No unannounced multi-species mixture is required by this plan.

### Moss Moon — hops and safe landing windows

| Room | Geometry and enemy use | Player challenge and fairness check |
|---|---|---|
| 1 / First Bounce | Broad floor, one low practice shelf, 1 hopper. Keep all of its hop arc visible. | Observe crouch and hop, then trap on descent. Spawn Pip away from the first landing point. |
| 2 / Steps | Three broad offset shelves, 2 hoppers on distinct starting tiers. Step heights follow measured J. | Climb alongside the hop rhythm and choose which landing to cover. Every shelf has a retreat edge and reachable lower landing. |
| 3 / Floating Islands | Separated wide islands with a continuous safe floor, 3 hoppers. | Choose a short risky crossing or descend for a safer approach. Enemy hop envelopes cannot strand them on unreachable islands. |
| 4 / Twin Hills | Two mirrored ascending routes with an open center, 3–4 staggered hoppers. | Switch routes to prevent synchronized landings from boxing Pip in. Keep the center wide enough to read incoming arcs. |
| 5 / Canopy | Offset high shelves with lower recovery platforms, 4 hoppers. Decorative roots stay behind the collision surfaces. | Chain captures across tiers; recover bubbles above either route. No hidden enemies behind roots and no solid ceiling trapping captures. |

### Crystal Caverns — drop lanes and interception

| Room | Geometry and enemy use | Player challenge and fairness check |
|---|---|---|
| 1 / First Drop | Two broad thin ledges over a wide floor, 1 dropper. | Clearly see the enemy release through a thin ledge. Thick wall blocks remain solid. Place a safe observation space beside its landing lane. |
| 2 / Twin Shafts | Two open descent lanes separated by a climbable central route, 2 droppers. | Predict which shaft receives the next drop; intercept from a shelf beside it. Both shaft bottoms connect back to the main route. |
| 3 / Geode | Staggered thin shelves around a large open middle, 3 droppers. | Choose high control or low interception. No closed ring of collision around the central space. Optional later squeeze shortcut joins two already-accessible bays. |
| 4 / Crystal Spires | Two thick columns with broad side shelves and clear vertical lanes, 3–4 droppers. | Anticipate drops while moving between columns. Crystals below shelves are cosmetic and cannot protrude into a route. Optional squeeze variant needs explicit tunnel state. |
| 5 / Vault | Upper catch shelves, two visible drop lanes and a broad lower arena, 4 droppers. | Capture enemies before their routes converge; use the lower floor to regroup. Stagger initial drops and ensure bubbles can be reached from an upper side route. |

### Rust Belt — moving air corridors

| Room | Geometry and enemy use | Player challenge and fairness check |
|---|---|---|
| 1 / First Flyby | Open room with two low aiming shelves, 1 flyer. | Learn its wave and wall reversal. Its route intersects a reachable shooting height; no waiting forever for an unreachable target. |
| 2 / Gantry | Three offset aiming shelves around a broad central air lane, 2 flyers at different phases. | Change height to meet the wave. Do not create an unavoidable pinch between two flyers and a shelf underside. |
| 3 / Chimney | Broad central vertical opening and wide side alcoves, 3 flyers. | Step into the open lane to shoot, retreat to time the next crossing. Check sine envelopes against alcove mouths. |
| 4 / Conveyor Ladders | Alternating static gantry shelves, 3–4 flyers. The name describes visual machinery, not a newly functioning conveyor. | Ascend while reading crossing times. Conveyors remain decoration unless separately implemented and tested. |
| 5 / Foundry | Two interlinked aiming routes and a generous center, 4 flyers with staggered phases. | Manage crossing traffic while recovering rising bubbles. Never force simultaneous undodgeable crossings at every exit. |

### Frost Ring — dash lanes and braking windows

| Room | Geometry and enemy use | Player challenge and fairness check |
|---|---|---|
| 1 / First Slide | Broad flat runway plus one raised refuge shelf, 1 slider. | Learn the cue and dash, then shoot during recovery. Ice art alone does not change Pip's traction. |
| 2 / Ring | Two wide side routes connected by open upper and lower paths, 2 sliders. | Route around a dash instead of backing into the wall. Use a broken ring, not a closed collision loop that traps bubbles. |
| 3 / Icicle Teeth | Alternating low aiming shelves above flat dash lanes, 3 sliders. | Change level to avoid bursts. Icicles are background decoration unless real hazards are explicitly added. |
| 4 / Broken Bridges | Short separated wide platforms above a safe floor, 3–4 sliders. | Bait a dash across a platform edge, then intercept below. No lethal pit, no impossible return jump, no accidental infinite fall. |
| 5 / Frozen Throne | Broad central raised shelf with two approach lanes and two escape edges, 4 sliders. | Decide when to hold the center or give it up. Stagger dash cycles; two opposing enemies may not close both exits with no reaction window. |

### Magma Core — bait, evade, punish

| Room | Geometry and enemy use | Player challenge and fairness check |
|---|---|---|
| 1 / First Pounce | Open floor plus one low escape shelf, 1 pouncer. | Read anticipation, move out of its landing zone, trap on recovery. Show the entire pounce and landing. |
| 2 / Diamond Lattice | Broad staggered shelves suggesting a diamond, 2 pouncers. | Move between heights to redirect pursuit. Keep the center open and verify every required jump with real physics. |
| 3 / Crucible | Open central arena with two side shelves, 3 pouncers. | Bait a leap into a catch zone and escape to either side. Avoid a bowl that the hero can enter but cannot leave. |
| 4 / Gauntlet | Alternating wide combat bays connected by shared clear passages, 3–4 pouncers. | Fight one pressure at a time and choose when to advance. Prevent off-screen or wall-hidden pounces; no mandatory squeeze mechanic. |
| 5 / Core | Three broad elevations with at least two routes between them, 4–5 staggered pouncers. | Combine baiting, capture chains and angry-enemy recovery. Preserve one low-pressure regrouping area; no added boss or lava hazard implied. |

## What makes the art match the collision
- Render standable top edges sharply and consistently; soften background silhouettes. Tiles must not suggest walkable surfaces where none exist.
- Never paint enemies, floating pickups, platforms or openings into a static background. Build playable cracks from collision geometry and foreground tiles. A painted crack is only scenery.
- Give Crater Hop's feet enough apparent landing space, Comet Chomp's tail enough clearance, and the full jelly/flyer silhouette room at turns. Reduce decorative overhang if necessary; do not shrink the collision body unpredictably.
- Use the same visual language for every thin drop-through ledge. Solid blocks should look thicker. A player should predict which surfaces are traversable before touching them.
- Effects may not cover an exit or hide attack anticipation. Squeezing, dashing and pouncing must read from pose and timing, not color alone.
- Backgrounds follow the PDF's low-contrast portrait safe areas; use runtime geometry for actual challenge. Changes to background pictures cannot fix gameplay collisions.

## Verification gate for each room
1. Overlay body colliders, decorative visual bounds, projectile shape, jump envelopes and enemy routes. Test all patrol, drop, dash, wall-bounce and angry states.
2. Reach every required landing and treasure from spawn, and return. Repeat from every legal respawn point and both co-op spawn slots.
3. Capture an enemy at every extreme route position. Confirm a plausible route to pop it before the seven-second release; unreachable captures must drift back or the room must change. Treat five seconds as an early design target for recovery, not a guarantee.
4. Test post-escape overlap handling. Enemy emergence may not produce an unavoidable hit while visually inside terrain or inside Pip.
5. Run at supported low and high frame rates and after bounded stalls; test fast dashes for tunneling, ledge drops for one-way-collision bugs, and flyers for wall jitter.
6. Inspect on a real phone at native gameplay scale. Identify each enemy and its anticipation from silhouette, with audio off and reduced color discrimination.
7. Play with novice touch controls. Increase route complexity before shrinking passages or raising enemy count. Record deaths by location and retry time to distinguish challenge from traps.

## Handoff status
No collision code, room arrays, physics constants or executable are included in the supplied PDF. This document specifies a coherent 25-room progression and the checks needed to turn it into working levels. It does not claim those levels have been built. New squeeze tunnels, combat telegraphs that change timing, moving conveyors, traction changes, bosses and directional aiming are separate implementation decisions.
