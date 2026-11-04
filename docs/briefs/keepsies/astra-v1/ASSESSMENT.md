# Keepsies assessment

Reviewed 4 November 2026. Evidence: all 27 supplied screenshots, the 65 marble contact sheet, DESIGN.md and ART_ASSETS.md. No game source or runnable build was supplied. This is a visual and design review, not a playtest or a claim that game code was changed. The referenced binding HANDOFF-KEEPSIES.md is absent. November brief takes precedence over older art dimensions and the stale September status.

## The recommendation
Keep Keepsies. Give it a real neighborhood lot, make a won marble carry its history, and make the first snap comprehensible before adding Arena complexity. Expand collecting through original themed families and equivalent cosmetic variants, not hundreds of increasingly powerful kits.

The user now asks for many more collectible designs and Meshy references. This expands the original brief's scope. The existing 65 remain intact. New catalog entries are proposals with explicit render routes; no painted replacement surfaces are supplied for existing marbles.

## What earns its place
The marble material response, compact cream and brass interface, plain rules card, short opponent lines, heirloom decision, and the contrast between cheap clay and a cherished rare all belong. The 65 render sheet is an excellent technical foundation. It also exposes a weakness: many swirls share broad stripes and several epics share cloudy noise. New silhouettes and internal structures will add more than new colors alone.

## Every screen, two audiences
| Capture | First session reading | Day 30 reading and action |
|---|---|---|
| k1-title | Clear name and Play; little reason to choose this game | Give it the dusk lot and one honest hero render; keep wallet secondary |
| k1-calibration | A marble is visible on a tan fade, but the launch destination is unclear | Show accepted sample count, retry feedback and recalibration access |
| k1-rules | Best explanation in the pack, but lengthy for a phone | Retain plainness; illustrate one turn and collapse advanced spin |
| k1-setup | Stakes visible; an actual THE UNDEFINED chip is visible | Fix missing label mapping before art; identify shooter separately from ante |
| k1-brace | Target is tiny and minimap dominates the cross | Keep shooter and target in view; stronger chalk edge, quieter minimap |
| k1-break | Cross is readable; voice is useful | Give pocketed marbles a brief source trail and ownership cue |
| k1-topdown | Most of the image is empty ground; remaining marbles are hard to locate | Fit all live marbles and preserve a minimum readable marble size |
| k1-results | Win reads; payout and progression compete | Show each acquired UID and where it came from, then compact statistics |
| k1-ceremony | Capture still shows the field and a fumble message | Static evidence cannot establish animation; audit transition and stale voice cleanup |
| k1-under | Blue background and geometry underside break the world | Clamp orbit elevation and validate camera collision after zoom and state changes |
| k2-collection | Beautiful grid; filter row extends beyond visible width | Add named sort, owned versus discovered, family filter, protected badge and empty results |
| k2-inspect | Material is strong; class/weight rows are small | Separate collection ownership and arena abilities; increase body text |
| k2-inspect-rare | Similar reading to inspect, rich lore | Give provenance and duplicate variants their own accessible rows |
| k2-inspect-epic | Galaxy reads as an attractive cloudy sphere | Show ability explanations only in context; avoid a catalog of near identical fog |
| k2-inspect-grail | Drowned Knight contains no readable knight | Install the figure and verify at 140 px with low quality glass |
| k2-pouches | Three prices at the bottom of a collection page | Distinct objects, transparent probabilities and pity progress before purchase |
| k2-tin | The tin and Dusty exist only in words | Give Dusty a scene and the three heirlooms a cloth beneath live renders |
| k2-tin-picked | Selection and button work; highlighted material reads | Preserve selection state and clarify this rare is protected automatically |
| k2-offers | Ransom banner crowds collection | Pin eligible offers with remaining time and explicit affordability |
| k2-loss-ceremony | Large rare and price are legible but detached from a person | Show who holds it and whether recovery is purchase or rematch |
| k2-ransom | Dusty demands ransom in capture | Conflicts with older boss no-ransom rule; distinguish tutorial Dusty from ladder boss policy |
| k2-levelup | Reward is embedded in match result | Keep reward visible without adding another mandatory full screen |
| k2-endgame-orbit | Almost empty field and partial ring | Reframe remaining targets and terminate camera input on result transition |
| k3-aim-card-412 | Better explicit explanation, still a dense instruction wall | Split into three guided actions; diagram is supplementary |
| k3-aim-zoom-412 | Zoom enlarges shooter but also adds competing inset | Show zoom state, preserve aim heading, prevent HUD from covering cross |
| k3-aim-buttons-412 | Left/right controls help one handed aiming | Measure 48 CSS px targets on device; icon artwork alone does not prove hit area |
| k3-aim-zoom-endgame-412 | One target becomes findable in the inset | Replace empty-space camera composition with bounds-aware framing |

## Smoothing plan
| Order | Change | Size | Owner | Depends on | Acceptance |
|---|---|---|---|---|---|
| 1 | Camera floor clamp and missing setup label | S | Code | Actual source | No under-floor view or undefined labels in any mode |
| 2 | Dirt, chalk, dusk horizon and one motivated light | M | Art and code | Camera bounds | Ring and horizon visible at entry; marbles remain brightest |
| 3 | Guided snap with recoverable cancel states | M | Code and HUD art | Input tracing | Five new players finish three shots without help or restart |
| 4 | Dusty, tin, cloth and heirloom protection | M | Art and code | Anchor metadata | No live marble hidden by fingers, labels or baked objects |
| 5 | Win/loss ownership ceremonies and provenance | M | Code and UI art | UID and escrow correctness | Acquired marble history survives restart and recovery |
| 6 | Four original grail inserts | M | Meshy sculpt and code | Existing fitting pipeline | Readable at 140 px and within spherical bounds |
| 7 | Searchable themed collecting families | M | Code and catalog | Save migration | No lost UID, no shader variant changes ranked physics |
| 8 | Pouches, shelf, share cards and icon set | M | Art and code | Economy resolution | Opened rewards match saved contents, no decorative substitute renders |
| 9 | Expansion sculpt batches | L | Meshy sculpt | Four original grails accepted | Load only owned/inspected inserts; low detail fallback |
| 10 | Arena | L | Code then sculpt | Six conditions decision and sim | Balanced match shape before environment sculpt integration |

## Ship these three improvements first
1. A grounded ring and reliable snap. The existing mechanic has to earn a second attempt. Needs dirt, chalk, horizon, readable reticle and a camera fix. Measure tutorial completion and replay intent, not the prettiness of a still.
2. Dusty's tin and the heirloom. A person offering one meaningful choice makes the collection personal in four minutes. Needs Dusty, clear tin mouth, cloth anchors and automatic showcase protection.
3. Provenance plus a shareable marble portrait. A great shot should create a story worth showing. Needs live marble capture, a restrained share frame, and an append-only UID event history. Store owned, won, lost, reclaimed and showcased events with timestamps. Do not invent previous owners as if they were actual players.

Next: choice of a small themed reward track, a shelf room, a pouch opening with a skip button, then Arena. The supplied shelf plates are 2D UI components; they do not fulfil the required future 3D VR room.

## Three risks
1. The premise looks like a technical demo. Fix environment and character presence, then use real captures for the storefront. A collectible image cannot compensate for an empty playing field.
2. A wonderful physical gesture becomes a dexterity gate. Add visible cancellation feedback, short guided recovery, thumb clearance and equal access to the documented fallback. Instrument touchcancel, resize, multitouch, background/resume and zero velocity cases. Screenshots cannot verify the reported soft lock.
3. A loss feels like confiscation. State the exact stake and recovery policy before commitment, protect the first rare, keep For Fair fully rewarding, and show the winner's collection. Boss no-ransom and tutorial ransom currently contradict each other; resolve the policy before final copy. Do not add paid currency to this loop in this art pass.

## Naming
Recommend Keepsies: short, spoken, collectible and already the rule that creates the emotion. Alternative wordmark supplied: Pocket Legends, which sells collecting but is less specific to marbles. Other candidates: The Last Taw, which suggests a personal stakes story but needs vocabulary explained; Dust and Glass, which signals material beauty but underplays the game. All are creative proposals, not availability or trademark clearance.

## Contradictions and implementation traps
* Five leagues with five nonboss rungs require 25 opponents. The brief requests 20. Deliver 20 portraits and do not pretend the missing five exist. Recommend four rungs plus boss per league pending product decision.
* Boss ransom exception conflicts with the Dusty ransom capture and tutorial clay ransom. Tutorial can demonstrate a free mock offer, but must label it as practice and never promise recovery that later disappears.
* Seven Arena conditions are listed while six must ship. Do not choose silently.
* Density based damage uses kilograms of tiny spheres. A 16 mm glass marble weighs about 0.00536 kg: at 3 m/s and hardness 1, the written equation gives about 0.53 damage. This appears incompatible with the 3 to 5 minute Arena target without other effects. Verify units in the actual implementation before balancing assets around damage tiers.
* Glacier compares kg/m³ to a term called mass. Density and total mass are different. Define the actual tile trigger.
* Ring-out text grants a fresh full integrity entrant. Specify what occurs when no unplayed marble remains and prevent indefinite healing through repeated ring-outs.
* A texture can rotate with object coordinates. The brief's technical explanation is too broad; the correct product rule is to preserve the existing volumetric procedural look and avoid flat painted replacements.
* The First Marble is a nested sphere recipe, not a fifth Meshy figure. The later explicit clarification wins.
* Base document says no code exists; supplied November captures prove that status is stale. Do not reset implementation based on it.
