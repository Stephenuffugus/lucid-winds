# Tomato Man: art and play assessment

## Basis and limits
Read the supplied 5 November brief in full and used the attached thumbnail as the visual authority. Opened the live game, read How to Play, entered world select, Morning Tide, and Dawn Ribbon, moved with the virtual stick, and activated Dash and Shade. The shade charge visibly decreased. Browser observation was desktop sized; this was a short first run, not a completed phone playthrough or a day 30 save. Later worlds, upgrades and retention observations below are design judgments from the brief, not claims of having played locked content. The supplied files make Drive access unnecessary for this handoff; no Drive contents or repository state were independently reviewed.

## Preserve the game inside the geometry
The moving safe floor is the hook. Preserve the sun sweep, crossing short gaps by dash, placing emergency shade, treasures that ask for a deliberate detour, and a final threatening sun. Keep the umbrella tilt puzzle; the brief's assessment calls it an awning tilt puzzle, but its mechanical description assigns tilt to umbrellas and wilt to awnings. Keep those distinct. Keep the builder because it gives a child a character to own, but the default hero must remain the franchise face.

The short opening showed light sand against strongly dark swept shade, striped awnings, a tiny red hero, a clear finish triangle and a sun token. Those distinctions must survive the new material treatment. The visible live hero already has facial detail and the sun appears to have a face, so the brief's descriptions of a two-dot circle and a pure gradient are not completely current. Neither resembles the reference character closely enough.

## Screen by screen
| Screen | What reads | What needs changing |
| --- | --- | --- |
| How to Play | It explicitly says sunlight kills and shade moves. | A long mechanic encyclopedia precedes the first move. Emoji, hyphenated phrases and an exclamation mark in treasure copy violate the copy rule. Lead with a single playable shade crossing and offer the full guide from pause. |
| World select | Five names and unlock order are clear. | Navy cards differ mainly in slight gradients. Tide Pools is described, not shown. Put each place in a photographic postcard band, with progress below it. Locked art remains visible. |
| Morning Tide levels | Each level has a name and a distinct premise. | Small multiline copy, emoji and repeated lock text crowd the cards. Show three treasure sockets and one medal space, then a concise subtitle. |
| Dawn Ribbon | Bright ground and moving shade make safe ground legible. | Near-black overlapping shade can become a black wall. Use a capped cool-blue safe mask, not cumulative black alpha. Hero identity disappears. Long coach text covers the route in the observed view. |
| HUD and actions | Exposure, time, burns and limited shade charges convey stakes. | Icons and labels use mixed languages of emoji, gradients and soft circles. Keep numbers crisp and separate from texture. Zero-stock SPF needs an obvious unavailable state. |
| Builder, shop and win | Mechanical roles are promising in the supplied brief. | Not reached in this session. Proposed treatment: one large readable character, clear ownership and price states, three upgrade tiers without hidden conditions, and a postcard result that invites one more attempt. These are recommendations, not observed defects. |
| Eclipse | The telegraphed lunge and temporary darkness give a strong finale on paper. | Not played here. A decorative eclipse must never imply safety before the engine grants it. Boss charge needs shape and motion signals as well as colour. |

Other hard-line risks: any sampled texture that darkens walkable ground undermines safety; baked prop shadows that look walkable contradict computed shade; small artwork is not a small touch target. Keep every interactive hit area at least 48 CSS pixels even when the mark is 24. Replace player-facing dashes and exclamations when integrating the art. Do not copy marketing art into the collision mask.

## The look: Sunstruck Stop Motion
A bleached miniature desert populated by produce that has stayed outside too long. Tomato Man is a red, slightly mottled head above a torn seed-packet tunic, matchstick limbs and rubber orange boots. His deep sockets and low ivory eye slits suggest a weary, oddly calm puppet. Matte paper, faded canvas, salt, cork and dusty rubber share soft flat light. The joke is his composure, not his suffering. At 28 pixels preserve the red mass, two black socket shapes, a green crown silhouette, two black arm marks and two orange boot dots. Remove fine teeth, chest printing, finger anatomy and surface grain before removing these shapes. Never shrink a full builder portrait and call it a gameplay sprite.

## The five places
| World | Life and buried objects | Casters | Sky and ground |
| --- | --- | --- | --- |
| Morning Tide | Short cactus spectators, dropped tomatoes, bleached shells | Salt-worn canvas, driftwood poles, old parasols | Bone sand, dusty pale blue horizon, forgiving long shadows |
| Midday Blaze | Sunken crates, wilted cactus, melting treats | Faded red awnings, chalked wood cart, dried thatch | Almost white sand; ochre heat and the same impassive sun |
| Tide Pools | Small cactus on rock islands, shells in salt pools, half-buried buckets | Salt-stained cabanas and sagging canvas | Pale limestone, restrained turquoise water only outside walkable paths |
| Dunes at Dusk | Leaning cactus, wind-smoothed pebbles, buried signs | Raked timber, leaning palms, wind-bent umbrellas | Light peach sand, dusty rose sky; enormous magenta tomato far away |
| Eclipse | Fossil-like shells, mute cactus sentries, dark dropped tomato silhouettes | Bleached arches and chipped stone ledges | Light ash sand remains light; the runtime darkens it during actual safe windows |

Use shared casters: the same forgotten beach equipment wandered inland. Tint only small fabric accents. Their footprints stay stable. Decorative cactus creatures never become surprise hazards. Decorative dropped tomatoes never share the hero's limb silhouette or the pickups' small aura.

## The sun
Give the ordinary sun a face in every world: a dusty ochre disc, narrow hollow eyes and a small indifferent mouth. Eye movement can track the player slowly while the disc's position continues to communicate sweep. The Angry Sun is the same disc with lowered brows, then a compressed wind-up, then a broad toothless yelling mouth, then a tired slack mouth. No fangs. Detached rays allow motion without wobbling the physics cue. Eclipse corona is a separate backdrop, not a substitute for a safe-state signal.

## Ranked fun work: code team ownership
1. **Teach by crossing one moving shadow.** Ship first. Put a safe starting patch under the hero, one obvious next patch, and a coach that moves outside the crossing. Explain Dash only when a narrow sun gap appears. Art: distinctive hero, sun, caster and four consistent teaching marks. This improves the first minute without adding rules.
2. **Make failure useful and retry immediate.** Ship first. A small wilted tomato portrait accompanies the level name, distance or time remaining, and a prominent retry. Preserve the last safe checkpoint. Art: exposure states, char wisp, postcard, retry mark. This turns a one-second burn into a comprehensible lesson.
3. **Make every level a collectible postcard.** Ship first. World art, three treasure sockets, best time and medal make the next attainable goal obvious. Art: five cards, treasure marks, medals and result frames. This helps both the first session and the last gem hunt.
4. The sun watches you. Slow eye direction adds personality cheaply; never move the disc independently of the sweep. Art: shared disc and face layers. Keep cosmetic motion reducible.
5. A giant drifting shadow encounter. A single planet-tomato shadow or bird passes at a clear, repeatable time. Art: far planet decor and silhouette strip. Use the same engine safe mask so it cannot lie.
6. Pass the phone races. Same level, same seed, same equipment, alternating turns. Compare personal improvement before humiliating rankings. Art: result card and next-player mark already covered by next.
7. Daily seed word and share card. Share the seed and ruleset version, not just a memorable word that can map to changing content. Art: daily frame with text bands. No backend needed for locally deterministic runs.
8. A chase set piece. Reserve it for a short optional level after movement mastery; do not convert every level into relentless pursuit. Art: boss wind-up and wind streaks.
9. Hat flourishes. Let ice cream drip cosmetically and an umbrella twitch. Do not grant paid hats shade charges in medal or daily runs; that muddies fairness. Functional hats belong in an explicitly separate playful mode.
10. Melt-shaped meter. A tomato-shaped endpoint may sag at danger, but retain a straight readable fill track and thresholds. Art: meter frame, fill and exposure faces.
11. A boss in every world. Defer. Five bosses multiply production and can bury the moving-shadow puzzle. Introduce one new shadow interaction per world and make the final sun the payoff.

## Three commercial risks
1. **The thumbnail can be misread as horror.** The first screenshot needs pale daylight, generous space, orange boots and a calm funny hero. Keep the lunge face for screenshot six. Never market through dark socket close-ups alone.
2. **The top view can erase the character.** Keep a slightly elevated three-quarter sprite with readable forward sockets and boot dots. Keep the 28-world-pixel collision circle independent of the longer visible figure. Builder scale carries the tiny tunic print.
3. **A one-second mistake can feel unfair.** The player must see the safe boundary before decorative grain, know when shade is running out, and understand what caused a burn. Cap overlapping shade alpha, distinguish hot sand by shimmer plus pattern, and make retry immediate. Art cannot fix unfair timing by itself.

## Store read
A parent sees a strange sunny storybook toy and a clear, nonviolent puzzle. A child sees a tomato person staying out of the sun. First image: hero in bright sand stepping into a blue shadow, never a screaming boss. Use real game captures inside the supplied frames in this order: (1) Ride the shade, the central rule; (2) The sun sweeps, a readable moving-shadow moment; (3) Drop your own shade, the agency; (4) Five worlds, distinct places; (5) Build your tomato man, expressive choices; (6) The Angry Sun, the finale. Screenshot frames contain no headlines so localisation stays live. Do not sell a generated scene as a gameplay capture.

## Integration order
Art and code are separated. This pack changes no game code. Integrate A and B first; C and D next; E next; F last before G captures. Keep existing procedural fallbacks until each sprite loads. Use the manifest's anchors, trim boxes and sheet cells. Set decorative art to ignore pointer events. Preserve collision, shade computation, save progression and reward rules.
