# DEWBALL improvement review for Claude Code

Model: GPT  
Date: 2026-10-09  
Prepared for Jessie and Sky Wolf Studio

## Main recommendation

Make growth tell a story. Players should recognize something they cannot collect, remember it, grow, and return to scoop it up. Make the ball visibly carry that story into the results screen. This is a stronger first investment than replacing 115 to 185 models before proving the moment to moment experience.

The strongest distinctive direction is a handmade miniature world collected by a bead of dew. Keep rounded, tactile objects, but distinguish cloth, food, painted wood, metal and water. Making everything look like the same plastic toy will flatten the very scale changes that make this game exciting.

This is a ranked design backlog, not an instruction to implement every idea at once. Items are ranked within A, B, C and D. Costs are relative: S is a localized change, M crosses a few systems or needs a small asset set, L needs substantial content or technical work. Costs are not time estimates. Measurements below are proposed acceptance targets, not results already achieved.

## Evidence and limits

Read the complete supplied brief and visually inspected all six supplied Crumb Country images. Also inspected the live title and world selection screen, How to Roll, and Collection, which opens The Grove. The live browser could not create a WebGL context, so gameplay did not start. I did not playtest rolling, collisions, mobile controls, later worlds, results or performance. Recommendations about those systems are hypotheses grounded in the brief, not observed defects. The screenshot ball is already 26 to 28 cm, so these images cannot establish the quality of the actual 4 cm opening.

Sources inspected on 2026-10-09:

* Brief: https://lucidwinds.com/docs/briefs/ASTRA-DEWBALL-BRIEF.txt
* Supplied gallery: https://lucidwinds.com/docs/briefs/dewball/
* Images retrieved individually from that directory: `lmGramophone-wide.png`, `lmGramophone.png`, `lmBookTower-wide.png`, `lmBookTower.png`, `lmLongClock-wide.png`, `lmLongClock.png`.
* Live interface: https://lucidwinds.com/satellites/dewball/

The gallery index itself did not load through the retrieval tools; the six direct image files did. No other games were reviewed.

## Instructions for the implementation handoff

Preserve existing pickup eligibility, growth volume, collision thresholds, world clocks, star thresholds and gate sizes. Do not infer replacement values from examples here. Treat art dimensions separately from gameplay dimensions. Do not add currencies, purchases, advertisements, energy systems, waiting periods or daily obligations. Existing run clocks remain. All proposed player facing copy avoids dashes and exclamation points.

First inspect the repository and map these recommendations to existing functions and data. Reuse existing systems when present. Capture a baseline before changing feel or presentation. Do not rewrite the single HTML architecture just to accommodate this review. Preserve saved progress and existing cosmetic entitlements. New visual assets must retain the original logical size and growth contribution.

Recommended first slice: C1 truthful pickup language and size targets; A1 and A2 pickup feedback and eligibility cues; A3 a memorable opening route; B1 through B3 a small visual benchmark. Use existing props before commissioning the larger asset library. Add C4 and C5 to make replay and collection worthwhile. Expand world content only after this slice survives phone testing.

For interface sizes, use CSS pixels, not physical device pixels. The brief's phrase “412 wide phone in landscape” is ambiguous. Use an approximately 915 × 412 CSS pixel landscape reference, then test 740 × 360 and the actual Pixel 9 viewport with browser bars and display cutouts. Keep a 412 pixel wide compact fallback if that is literally required. Never scale a whole desktop HUD down to fit.

## A Gameplay feel

1. **What:** All worlds, pickup moment and ball surface. On a successful pickup, animate that exact object into its attachment over roughly 90 to 130 ms. Give the bead a render only 3 percent squash for 100 ms and a brief wet plink. Preserve recognizable recent objects on the surface; start with a benchmark cap of 24 visible attachments and simplify older ones. Never change the collision sphere or growth result for animation.
   **Why:** Every pickup should feel like adding a possession. A smooth ball that mostly changes its number misses the pleasure of becoming a ridiculous collection of things. The supplied ball looks mostly smooth, although these staged images do not establish what a normal loaded ball looks like.
   **Measure:** In recorded phone play, an observer can identify at least three recent pickups on the ball without pausing. Feedback begins within two displayed frames of confirmed collection. Replay identical pickup events and verify identical resulting size with feedback enabled or disabled.
   **Cost:** M; benchmark attachment rendering before increasing the cap.

2. **What:** All worlds, nearby object eligibility. Use the existing eligibility function to identify the nearest relevant target within about three ball diameters. Give eligible targets a small broken cream ground ring; an ineligible target only receives “Grow a little more” after a deliberate approach or collision. Show at most three rings. Give newly eligible nearby objects one 250 ms sparkle, not a permanent field of outlines.
   **Why:** Visible object size alone is unreliable when the actual pickup threshold is only a fraction of the ball diameter. Players need to distinguish a failed steering attempt from an object they cannot yet collect.
   **Measure:** After one minute, at least 8 of 10 first time testers correctly predict pickup eligibility on four of five presented objects. The rings never indicate success when the authoritative collision check rejects it.
   **Cost:** M.

3. **What:** Crumb Country, first ninety seconds. Reposition a small subset of existing pickups into a loose curved trail toward the chess corner: crumbs, then a recognizable food cluster, then the pawn the player initially could not collect. Preserve total available volume and all thresholds. Target an experience of first pickup within 5 seconds, first readable cluster within 20 seconds, and a return to the pawn within 45 to 90 seconds. These are route goals, not scripted rewards or new timers.
   **Why:** “I was too small for that pawn, and now it is on my ball” teaches growth through a tiny story. A uniform scatter gives variety but little reason to care about the next few centimetres.
   **Measure:** At least 8 of 10 new players collect something within 5 seconds of gaining control; at least 7 can name their first object that changed from obstacle to pickup. Compare baseline and revised route clear rates and growth curves before shipping the placement change.
   **Cost:** M.

4. **What:** All worlds, rolling presentation. Keep current acceleration and steering initially. Add a short wet contact streak that lasts about 0.4 seconds, a directional lean capped near 4 degrees, and an unobtrusive roll sound that rises with speed. Drive surface rotation from distance travelled divided by render radius so growing does not look like sliding. Disable streaks and lean in reduced motion mode.
   **Why:** The controller should feel connected to a physical object before changing tuned movement. Surface motion and sound can communicate weight without adding input lag or changing balance.
   **Measure:** Capture start, stop, reverse and circle movements at three sizes. Visual rotation matches travel without obvious skating; testers can distinguish slow roll from dash with the HUD hidden. Identical input playback still produces the baseline path.
   **Cost:** M.

5. **What:** All worlds, camera. Keep the ball around 58 to 62 percent of screen height and initially test an on screen diameter near 20 to 24 percent of usable landscape height. Smooth camera distance changes over about 300 ms when the ball grows, while keeping manual look immediate. Do not auto recenter until 1.5 seconds after manual input ends; cancel recentering on fresh input. When a landmark blocks the view, shorten the camera boom before considering fading the obstruction.
   **Why:** Growth needs a stable visual reference, but an oversized foreground ball hides the next pickup. A camera that fights the right thumb makes aiming feel unreliable even when rolling is sound.
   **Measure:** In a scripted route around the book tower and baskets, the ball and the next reachable ground patch remain visible for at least 95 percent of moving frames. Test camera tuning on device, including reverse travel, rather than approving it from still images.
   **Cost:** M.

6. **What:** All worlds, hard impacts. Preserve the three most recent pickups being knocked off. Show those exact objects ejecting with short arcs and keep the impact direction readable through a small bead deformation and low knock sound. Mark scattered pickups with a brief ground glint for 0.8 seconds. Cap optional camera displacement at roughly 2 CSS pixels for 80 ms; default to no displacement under reduced motion. Do not add invulnerability or change knockback strength in this pass.
   **Why:** Losing three things can feel fair when the player sees what happened and where recovery is possible. An unexplained reduction in size feels like the game stole progress.
   **Measure:** At least 8 of 10 testers explain the cause and consequence of their first hard hit. Every ejected item corresponds to the existing pickup history; no duplication or extra loss occurs during repeated contacts.
   **Cost:** M.

7. **What:** All worlds, dash. Make the droplet button a 56 CSS pixel control with a solid readable silhouette, a thin readiness ring and the label “Dash”. On activation, add a compact forward spray and distinct sound. Preserve the current dash duration and recharge behavior. Route button input separately from right side camera drag so a tap cannot also rotate the camera.
   **Why:** In the supplied shots the faint droplet can read as decoration or a disabled control. Clear availability and predictable input make dash a deliberate move rather than an accidental lurch.
   **Measure:** At least 8 of 10 first time players use dash intentionally after the prompt. Fifty alternating camera drags and dash taps produce no cross activation. Muted play still communicates ready versus unavailable.
   **Cost:** S to M, depending on the current touch input routing.

8. **What:** All worlds, gate opening. Retain every gate threshold. At eligibility, animate the gate sinking over about 450 ms while the existing collision state remains authoritative. Flash the sign once and play a short localized chime. Show “Path open” for 1.2 seconds only when the gate is visible or immediately relevant. Frame an identifiable new object beyond the opening; avoid a compulsory camera turn.
   **Why:** The reward for reaching a gate should be a tempting destination, not merely the disappearance of a fence. Players should feel they earned access while keeping control.
   **Measure:** At least 8 of 10 testers notice their first gate opening without a forced cutaway. Check all approach directions for invisible collision and premature passage. No extra information appears over a keepsake notification.
   **Cost:** M.

9. **What:** Crumb Country first, then one signature interaction per world. Prototype a domino effect at the existing chess corner: collecting an eligible front pawn makes adjacent still ineligible pieces wobble in sequence. Keep the wobble visual only and leave collectible transforms authoritative. Later examples are a toy train whistle, koi turning together, a market awning flutter, and container doors rattling as the bead passes.
   **Why:** Small reactions give these worlds character without adding missions, crafting or another control. The player gets to disturb a carefully arranged miniature scene.
   **Measure:** After one run, at least half of testers spontaneously mention the chess reaction. It triggers only on the intended event, stays quiet on repeats for several seconds, and adds no new collision or simulation cost per distant object.
   **Cost:** M for the first interaction; L for a full set across worlds.

10. **What:** All worlds, roaming creatures. Give each existing species a brief anticipation pose when the bead approaches, followed by its current movement behavior. When eligibility changes, allow a recognizable visual reaction such as a startled turn. A collected creature remains intact on the bead and gets a tiny harmless wiggle. Do not increase flight speed, pursuit, collection difficulty or creature counts in this pass.
   **Why:** A ladybug has more emotional value than another red shape. The scale reversal becomes funny when yesterday's intimidating creature realizes the bead has grown.
   **Measure:** Testers identify the creature species in a two second phone clip and notice the change in relationship across sizes. Cosmetic reactions leave the baseline collection outcome unchanged under recorded input.
   **Cost:** M per small creature family; sequence after the pickup benchmark.

11. **What:** All worlds, size facts and star moments. Give facts one shared notification slot, display for 2.2 seconds, and impose an 8 second minimum gap between facts. Collapse multiple crossed facts to the largest relevant one. On reaching the first star, show “Goal reached” then “Keep rolling for the next star”. Continue the existing clock and play session. Verify whether each comparison means length, height or diameter and name the dimension when needed.
   **Why:** Facts should make scale imaginable rather than interrupt the roll. Reaching the goal should feel like success immediately, even if the player keeps going and falls short of another star.
   **Measure:** No queue of stale facts appears after a rapid growth burst. At least 9 of 10 testers understand they have earned the first star while time remains. Review all 25 comparisons against their intended dimensions before publication.
   **Cost:** S to M.

12. **What:** All timed worlds, end of run. Freeze the gameplay state at the existing endpoint, then offer a skippable 1.2 second close view of the final ball and its possessions. Select the largest collected object and one distinctive keepsake as highlights. Show the starting bead next to the final ball using a clearly labelled comparison view; do not imply that display zoom is growth. Offer optional drag rotation of the final ball without replaying physics.
   **Why:** The player has spent minutes building something unique. A generic score card discards the best souvenir just when the game should celebrate it.
   **Measure:** The final view uses the exact recorded run, does not reroll attachments, and is ready without a large frame hitch. At least 8 of 10 testers can describe one memorable object they collected after seeing results.
   **Cost:** M, or L if attachment history is not already available.

## B Assets and art direction

1. **What:** All worlds, shared art standard. Use handmade miniature objects with rounded silhouettes, broad painted color areas and restrained material cues. Give each asset one dominant shape, one recognition feature and at most two small accents. Keep saturation highest on interactive objects and reduce it on broad surfaces. Render the dew bead with an opaque soft highlight and a bright rim first; avoid expensive refraction as a requirement.
   **Why:** A consistent craft language unifies the seven settings while allowing bread to feel different from a tin or a leaf. The bead reads as dew without making every object look wet or plastic.
   **Measure:** Review assets as 32 and 64 pixel thumbnails against their actual world floor. At least 8 of 10 viewers name common objects correctly at the smaller size. No prop requires readable lettering to establish identity.
   **Cost:** M for a benchmark and style sheet; apply before mass production.

2. **What:** Crumb Country, first production batch. Build an approximately 15 asset benchmark: crumb, biscuit, sandwich triangle, cupcake, ladybug, pawn, candle, basket, biscuit tin, folding chair, one book unit, gramophone, long case clock, one confirmed keepsake and one confirmed frequently collected late run prop. Reuse or substitute based on the repository's actual inventory. Prioritize assets by time on screen, pickup frequency and emotional importance, not polygon size alone.
   **Why:** This tests food, creatures, small pickups, large obstacles and landmarks with one manageable batch. Modelling every rare prop first risks spending most of the budget outside the player's attention.
   **Measure:** The benchmark covers the opening, middle and closing parts of a recorded Crumb Country run. Approve its phone readability and frame time before expanding toward 115 to 185 kinds. Compare player recognition and pickup desire against primitives.
   **Cost:** L for the batch; smaller than a complete world replacement.

3. **What:** Crumb Country, blanket. Prototype dusty coral checks near `#C87568` and warm linen near `#E9DFC4`, under neutral daylight, instead of the current vivid red and yellow. Keep existing check size and geometry initially. Add only broad fabric shading and occasional seam lines; make weave disappear at distance. Place tiny red pickups on contrasting local cloth regions where feasible, without changing their amount or size.
   **Why:** The largest color field currently competes with almost every red object. Calming the cloth gives ladybugs and food room to be colorful while retaining the picnic identity.
   **Measure:** In the same six camera compositions, testers locate the ladybug and sandwich faster than in the baseline. Reducing the screenshot to phone size does not turn the checks into stronger focal points than the ball and nearby pickups.
   **Cost:** M.

4. **What:** Crumb Country, three landmarks. Gramophone: enlarge the rolled horn lip visually, show a dark interior, curved neck and clear black record. Book tower: add ivory page blocks, slightly overhanging covers and offset spines; keep its existing stack and collectible unit. Long case clock: add a high contrast cream circular face, simple dark hands and a visible pendulum inset on the approach side. Verify front orientation before assuming the pictured side is its face.
   **Why:** The gramophone already has the strongest identifying silhouette. The tower resembles colored slabs, and the clock is unreadable as a clock from the supplied view. These need structural recognition features before surface detail.
   **Measure:** At a distance of ten ball diameters, at least 8 of 10 testers identify each landmark from its intended approach. Render size changes must not change collision bounds, collection thresholds or growth volume.
   **Cost:** M for each landmark.

5. **What:** Seven worlds, ground palettes. Crumb Country gets linen checks; Toybox Peaks gets muted blue grey carpet with broad stitched motifs; Night Garden gets dark soil and large moss patches; Bazaar Lane gets warm grey cobbles grouped into simple lanes; Starfall Bay gets pale cool sand, broad wet bands and slate blue water; The Whole World gets simplified terrain color masses; Dream Meadow gets sage grass with sparse lavender flower patches. Use these as proposals for worlds not visually inspected.
   **Why:** Floors should distinguish places and support navigation without competing with collectible silhouettes. A shared low detail ground treatment keeps the game cohesive while each world has a clear mood.
   **Measure:** Players identify the world from a ground and lighting crop within three seconds. Side by side tests show that no ground motif is regularly mistaken for a pickup. Check dark props on Night Garden soil in particular.
   **Cost:** L across all worlds; M for the first ground replacement.

6. **What:** Seven worlds, sky and horizon. Crumb Country gets pale blue daylight with soft tree shapes beyond the play space; Toybox Peaks gets a room wall and skirting silhouette; Night Garden gets deep blue twilight with a few broad moonlit cloud shapes; Bazaar Lane gets a pale warm sky over distant roof silhouettes; Starfall Bay gets cool dusk with a distinct sea horizon; The Whole World gets a quiet star field and thin planetary rim; Dream Meadow gets pearly sky and distant meadow shapes. Use a sky dome and simple distant silhouettes rather than layered transparent fog cards.
   **Why:** Each setting needs an understandable boundary and atmosphere. The supplied orange field removes depth cues and makes widely separated objects share one color. A room should feel indoors, not like another outdoor fog plane.
   **Measure:** Nearby red, blue and green assets retain distinguishable hues. Distant scenery clearly reads as background rather than reachable collectibles. Test orbiting the planet for sky seams and horizon flips before approval.
   **Cost:** M per environment family; L for all seven.

7. **What:** All worlds, texture restraint. Spend texture detail on bread crust, book page blocks, broad basket weave, clock face, tin lid and simple creature markings. Keep tiny crumbs, faraway props, small attachment copies and UI icons mostly flat. Avoid photo textures, fine carpet fibers, small woodgrain and dense normal maps. Use baked soft shading sparingly so it does not contradict blob shadows or lighting.
   **Why:** On a phone, texture often turns recognition into noise. A black record on a gramophone matters more than scratches on the wooden case. The surface should explain the object, not advertise asset complexity.
   **Measure:** Compare 50 percent and 100 percent renders in motion. No shimmer or moiré appears on carpet, cloth or baskets. Removing fine texture should not make an asset easier to identify; if it does, simplify it.
   **Cost:** S per asset during cleanup; M for the material library.

8. **What:** All worlds, asset pipeline. Treat Meshy output as a draft. In Blender, fix pivot, orientation, scale, hidden geometry, material count and low detail variants. Preserve a separate logical size for pickup and volume calculations instead of recomputing it from decorative mesh extents. Start the benchmark around 100 to 400 triangles for small props, 500 to 1,200 for frequent medium props and 1,500 to 3,000 for rare landmarks; these are provisional caps, not a guarantee of performance.
   **Why:** A beautiful imported object can silently change balance through its bounding sphere, or overwhelm the renderer through materials and draw calls. Predictable data and controlled exports matter more than the source generator.
   **Measure:** Replacing a mesh produces exactly the same eligibility and growth results in recorded event tests. Inspect model and material counts automatically. Use shared atlases and instancing where compatible, and approve budgets only from full scene profiling.
   **Cost:** M to establish; S per subsequent asset check.

9. **What:** Biggest worlds, rendering plan. Preserve cheap ground shadows and avoid one real time shadow or material per pickup. Add distance based detail selection, shared geometry and materials, pooled pickup effects, and bounded attachment counts as needed by profiling. As an initial texture benchmark use shared 1024 pixel atlases with mipmaps, reserving higher resolution only for proven close view needs. Keep game simulation independent of visual detail settings.
   **Why:** Thousands of objects make scene architecture more important than any single triangle cap. Visible progress must not turn the closing minute into the slowest and least controllable part of the run.
   **Measure:** On a physical Pixel 9, profile ten minutes including the largest populated scene, rapid pickups and repeated restarts. Record CPU and GPU costs, median and 95th percentile frame intervals, draw calls and memory. Target a 60 Hz experience with at least 95 percent of frame intervals around one refresh; investigate sustained missed refreshes and any regression from baseline. Do not report desktop performance as phone evidence.
   **Cost:** M to L depending on current rendering structure.

10. **What:** Each world, recognizable late run meal. Select one existing eligible object family that dominates the final minute and give it exceptional silhouette and attachment readability: proposed candidates are picnic baskets, large toys, garden furniture, market stalls, harbor objects and planetary landmarks. Validate each against actual sizes and thresholds before selection. Give one existing landmark per world a memorable cosmetic response when collected, such as a gramophone chord or clock chime.
   **Why:** Players remember what they became big enough to eat. A late run full of anonymous boxes wastes the payoff even if the size number climbs quickly.
   **Measure:** After a completed run, at least 7 of 10 testers name the largest or funniest thing they collected. Confirm the selected object is actually reachable under the existing tuning; do not change its size merely to fit this proposal.
   **Cost:** M per world, following asset prioritization.

## C User interface

1. **What:** Gameplay HUD and How to Roll, truthful scale language. Replace the claim that everything smaller sticks with “Collect small things. Grow to collect bigger things.” Keep the exact pickup rule in the implementation, not in a beginner math lesson. Show current diameter at 28 CSS pixels, next star target at 15 pixels and an 8 pixel progress bar within a roughly 184 × 64 pixel top panel. Use “Next star at {size}”; after three stars use “All stars earned”. Populate all values from authoritative world data.
   **Why:** A smaller looking object can still be ineligible. The screenshot's 27 cm beside a second star at 1.85 m also needs a clearly labelled target, rather than asking players to decipher symbols and units while moving.
   **Measure:** At least 9 of 10 testers can state their current size and next target after a one second HUD glance. Unit conversion and rounding are consistent across HUD, gates, world cards and results. Investigate the unusual screenshot target without changing it by assumption.
   **Cost:** S to M.

2. **What:** Gameplay, layout and hierarchy. Keep size near the top center, clock in 22 CSS pixel numerals near the top right, and a separate 48 × 48 pixel pause target. Respect display cutouts with at least 12 pixels of additional margin. Fade the world title after 3 seconds. Keep essential text on a sufficiently opaque dark panel instead of relying on a shadow over the sky. Give the first star a persistent earned state without expanding the HUD into a dashboard.
   **Why:** The minimal HUD is worth preserving, but tiny low contrast text is not minimalism. The current bottom left title and faint dash icon spend visual space without reliably communicating at phone scale.
   **Measure:** No overlap or clipping at 740 × 360, approximately 915 × 412, or the actual device viewport. Test against the brightest blanket and darkest garden. Essential information remains legible during movement and with larger text enabled.
   **Cost:** S.

3. **What:** World selection, first action. Give the next available world one clear “Play Crumb Country” or “Continue to {world}” button at least 48 pixels high. Keep horizontally browsable cards with a visible next card edge and arrow controls. Each card shows title at 18 pixels, best stars, best diameter and a concise goal. Move sound, invert, horizon and install out of the primary button cluster into Settings or contextual prompts. Use real focusable buttons for selectable world cards.
   **Why:** The inspected title page presents world cards plus many equally weighted utility buttons. Players should find the next roll immediately without treating the page like a control panel.
   **Measure:** At least 9 of 10 new players start the first world within 10 seconds, excluding load time. Keyboard and gamepad users can reach and activate every world card with a visible focus state. Locks explain the preceding world requirement.
   **Cost:** M.

4. **What:** Results, action and reward layout. Lead with earned stars and final diameter. Follow with “Best roll” only when true, then a compact “Largest pickup” highlight and “Keepsakes found {count}”. When a world unlocks, make “Next world” primary and “Roll again” secondary. On a missed goal, use “Roll again” and “Choose world”, plus one accurate suggestion such as revisiting a gate when ready. Make the next action available immediately; animation is skippable.
   **Why:** A clear screen should celebrate the completed run and offer a reason for the next one. Missing a higher star should not visually erase a goal already earned.
   **Measure:** Test all outcomes: no star, first clear, improved score, no improvement, all stars, duplicate keepsake and final campaign clear. At least 9 of 10 testers understand what they earned and what the primary button will do.
   **Cost:** M; results were not accessible for direct review.

5. **What:** Collection and The Grove. Retain the existing screen and Best Balls concept. Group keepsakes by world into five visible slots, with a found count and tappable silhouettes for missing items. Replace repeated question marks with an object silhouette and a short location clue once the world is unlocked, such as “Near the chess pieces”, only where placement supports it. A found entry shows its name, preview and discovery world. Keep Best Balls below this grouped collection.
   **Why:** The inspected collection lists many identical unknown entries. That records absence but does not spark a search. A glimpse and a useful clue turn collecting into a return destination.
   **Measure:** A tester can identify one missing keepsake worth pursuing within 10 seconds. Every clue maps to an actual spawn rule, and duplicates never inflate the found count. Keep the collection usable with touch, keyboard and larger text.
   **Cost:** M.

6. **What:** Pause and settings. Pause offers “Resume”, “Restart world”, “Settings” and “Choose world” with 48 pixel targets and 8 pixel gaps. Confirm restart or leaving only when current run progress would be lost. Separate music and effects volume. Show explicit “Invert camera Y” and “Horizon mode” states with a short description reflecting actual behavior. Add reduced motion, optional vibration where supported and a camera sensitivity slider; preserve settings between sessions.
   **Why:** Ambiguous toggles make a comfort setting hard to discover and easy to misunderstand. A pause menu should make recovery easy while protecting an accidental tap from discarding a run.
   **Measure:** Opening pause stops the run timer, movement, dash progression and damaging collisions. Resume creates no time jump. Each control has a programmatic label, visible current value and persistent saved state; unsupported vibration does not appear functional.
   **Cost:** M.

7. **What:** First run, contextual controls. Keep How to Roll as optional reference. Add a first run overlay before the existing clock begins: “Left side to roll” and “Right side to look”, each beside a simple thumb diagram, with “Start rolling”. During play, fade each cue after demonstrated use. Show “Tap to dash” only once the control is ready. Use keyboard or gamepad prompts when that input is active instead of always leading with touch instructions.
   **Why:** The live game already has instructions, but they require reading a separate panel. A brief contextual introduction establishes hand placement and reduces avoidable first run failure without extending the tuned clock.
   **Measure:** At least 8 of 10 first time phone players move and turn the camera without help within 15 seconds. Prompts never block a control or reappear on every retry. Clock duration after Start rolling remains exactly the configured value.
   **Cost:** M.

8. **What:** Gameplay notifications, one priority system. Use this order: interruption or pause, star earned, keepsake found, gate opened, size fact. Queue only relevant events, suppress redundant notices and allow no more than one central message at once. Put ordinary pickup names near the HUD for at most 0.8 seconds only for a first species, keepsake or especially large pickup. Keep normal collection mostly visual and audible.
   **Why:** Multiple individually good effects become clutter when they trigger on the same growth burst. Players should see the world, not a stack of achievements covering their route.
   **Measure:** A synthetic burst crossing a gate, star, size fact and keepsake produces a readable sequence with no overlapping text and no stale instructions after a restart. Essential play remains visible at the shortest supported landscape height.
   **Cost:** M.

9. **What:** Title and gameplay, soundtrack and feedback widgets. Defer the observed song unlock dialog until after a run or a deliberate visit to the soundtrack. During play, remove or relocate floating Music and feedback launchers so they cannot intercept either thumb zone. Keep music discovery accessible from results and menus; retain the existing unlock entitlement. Scope this behavior to Dewball integration rather than altering unrelated games.
   **Why:** A song reward before the first roll asks for attention before the player understands the game. Floating site widgets may also occupy precisely the regions needed for movement and camera input.
   **Measure:** A clean browser profile reaches first play without an unrelated modal. Exercise the complete left and right control regions with soundtrack and feedback integrations loaded; no external widget captures gameplay gestures. Song unlocks still appear in their intended library.
   **Cost:** S to M depending on shared integration ownership.

10. **What:** Loading and unsupported rendering, explicit state. Before accepting a world selection, ensure renderer initialization either succeeds or reaches a clear error panel. Show “Preparing Crumb Country” while loading, then offer “Try again” or “Back to worlds” on failure, with “This browser could not start the game” as the plain language explanation. Avoid an unexplained warning icon and a world card that appears to do nothing.
   **Why:** The review browser could display the menus but failed to create WebGL. That does not establish a fault on supported phones, but the visible failure experience should still be understandable.
   **Measure:** Force a renderer initialization failure and an asset load failure in development. Neither consumes run time, destroys saved progress, leaves an invisible input blocker, or prevents returning to world selection.
   **Cost:** S to M.

## D User experience

1. **What:** Campaign, distinguish the worlds through situations. Keep current unlock order and numbers. Give Crumb Country recognizable household scale; Toybox Peaks a satisfying route through the existing rings; Night Garden creature watching and discovery; Bazaar Lane memorable street landmarks; Starfall Bay the largest feeling change from beach debris to harbor objects; The Whole World the surprise of travelling around a globe; Dream Meadow a quiet place to collect without a clock. Develop those identities through existing layouts before adding mechanics.
   **Why:** Seven themed rings can still feel like one repeated level. Different reasons to look ahead and choose a route make progression feel broader without multiplying controls or production scope.
   **Measure:** After each world, testers can name a distinctive action or spatial experience, not only its floor color. Identify moments of getting lost separately from failure to reach the goal; solve navigation before proposing balance changes.
   **Cost:** M per world for layout and presentation; L across the campaign.

2. **What:** Next day return, one self chosen objective. On return, highlight the next unlocked world and show one optional existing goal such as “Find the last keepsake in Crumb Country” or “Try for another star”. Let the player ignore it. The Grove holds personal best balls and collected keepsakes; do not add streaks, expiring challenges, login rewards, another currency or notifications.
   **Why:** The game already contains reasons to return. Making unfinished pleasures visible is a better fit than creating obligations around an otherwise generous cosmetic game.
   **Measure:** In follow up playtests, ask what players wanted to do when they reopened the game and whether the suggested objective helped. Do not imply statistically significant retention improvement from a ten person sample.
   **Cost:** S to M.

3. **What:** Keepsakes, persistence and fairness. Decide and document when discovery is banked; recommended behavior is on confirmed first pickup, even if the object later falls off or the run misses its goal. Show the collection notification once per new keepsake. Keep ordinary final size and stars governed by their existing rules. Migrate any new save fields without wiping existing records; preserve current keepsake semantics if changing them would conflict with established progression until reviewed.
   **Why:** A rare discovery should feel permanent. Losing a run is tolerable; losing an undocumented collection reward after finding it feels arbitrary and discourages exploration.
   **Measure:** Test pickup then impact, restart, goal failure, app close and duplicate collection. The collection record is consistent with the documented rule and no existing saves lose unlocks during migration.
   **Cost:** M.

4. **What:** Phone lifecycle and orientation. If portrait appears during a run, pause and show “Turn your phone sideways to keep rolling”. On returning to landscape, present “Resume” instead of immediately starting the clock. Pause on backgrounding or visibility loss, clear held inputs and account for safe area changes. Request landscape lock or full screen only where supported and appropriate; the fallback must work without either API.
   **Why:** A message, accidental rotation or browser gesture should not turn a good run into a loss. These interruptions are part of phone play, not exceptional edge cases.
   **Measure:** Test rotation, app switching, screen lock, browser bar resizing and resuming with a previously held thumb. No timer jump, stuck movement, clipped control or phantom dash occurs. Test the installed and browser versions separately.
   **Cost:** M.

5. **What:** Installation, offer after value. Keep a manual install action in a menu, but first suggest it after the player finishes a run and returns to results or world selection. Use “Keep Dewball on your home screen” with “Install” and “Later”. Explain browser specific fallback only when needed. Do not promise offline play until assets, saves, audio and updates are verified offline.
   **Why:** People understand the value of installation after enjoying the game. A premature request competes with play, while an inaccurate offline promise damages trust during a commute or school pickup wait.
   **Measure:** Verify the actual supported installation path on the target Android browser and eventual Play wrapper. Test first launch online, subsequent launch offline, interrupted asset loading and update recovery before writing store claims.
   **Cost:** S for prompt placement; M or L if offline support needs work.

6. **What:** Dream Meadow, make its promise visible. Keep its current unlock requirement in this implementation pass. In world selection, make “No clock” explicit and explain what unlocks it. Once unlocked, support a quick return to its saved preference or starting configuration if the existing design allows it. Separately evaluate earlier access as a future product decision only if observed players want untimed play and quit before reaching it.
   **Why:** A soothing endless mode can attract a different audience, but hiding its existence until the end wastes that appeal. Changing the campaign economy or unlock order should be an explicit decision, not a side effect of a visual review.
   **Measure:** First time testers know an untimed mode exists and understand whether they can access it. Record requests for earlier access and completion behavior before making an unlock change.
   **Cost:** S for clarity; separate estimate for any later progression change.

7. **What:** Store and word of mouth, show the reversal. Build a short capture sequence from real gameplay: tiny bead next to a pawn, visible growth, collecting that pawn, then a clearly labelled later world with a much bigger object. Proposed positioning copy is “Start as a bead of dew. Roll up little things, grow bigger, and come back for the things that once blocked your path.” Use Dewball's own imagery, music and personality rather than another game's branding as the selling point.
   **Why:** The most persuasive explanation is one object changing from obstacle to souvenir. An attractive landscape alone does not tell someone why rolling is fun.
   **Measure:** Show a silent six second prototype clip to ten unfamiliar people; at least eight correctly describe the core collecting and growth loop. Store captures must reflect the shipped build and must not imply seamless travel between separate worlds.
   **Cost:** M after the first visual and gameplay slice is ready.

8. **What:** Validation and production order. Recruit a small mix of new and experienced players for the first ninety seconds on a physical phone, then run full campaign checks with returning testers. Collect local development events for first pickup, rejected contacts, hard hits, gate opening, star earned, keepsake found, restart and clear. Start with observation and local logs, not new remote analytics. Compare matched runs before approving larger production batches.
   **Why:** Bot tuning establishes reachability and numerical behavior; human play reveals confusion, delight and thumb friction. Those are different questions. A small focused test can prevent a large investment in prettier but equally confusing props.
   **Measure:** Ship the first slice only when new players understand eligibility, can steer without help, remember a growth reversal and can find their next action. Verify unchanged authoritative sizes and clocks, sound off usability, reduced motion, saved progress and the Pixel 9 performance target. Expand testing only to resolve a concrete failure.
   **Cost:** M and repeated at meaningful milestones.

## Corrections

1. **Instructions already exist in the live interface.** The brief says there are no directions before the first world. The inspected title screen includes a gameplay description, touch and keyboard controls, and a How to Roll button with sections for goals and controls. It does not establish whether an interactive first run tutorial exists. C7 therefore extends existing help rather than creating a duplicate instruction menu.

2. **Two displayed world clocks differ from the brief.** The live world selection card shows Toybox Peaks at 3:20 rather than the brief's 3:05, and Starfall Bay at 3:15 rather than 3:00. These are observed menu values, not verified runtime clocks. Resolve against authoritative configuration and update documentation; do not retune either clock to make the documents agree.

3. **The live help mentions extra Sunbeams for higher stars.** The brief describes a cosmetic economy and prohibits new currency but does not describe Sunbeams. Their exact role was not investigated. Audit the existing reward language and system before changing results or skins; this review proposes no new currency and does not recommend deleting an existing one by assumption.

4. **The screenshot star target needs verification, not an invented fix.** All supplied shots show a second star target at 1.85 m while the brief lists a 24 cm first goal for Crumb Country. Different first and second star goals are possible. The screenshots also show a 26 to 28 cm ball with the full 2:45 clock, consistent with staged capture rather than proof of an ordinary run. Check world identifiers, target calculation and capture setup before classifying this as a bug.

5. **Smaller does not always mean collectible under the described rule.** Live help says smaller objects stick, while the brief specifies eligibility as a size fraction of ball diameter. Treat this as a teaching simplification that needs clearer language and feedback. Do not change the rule to match the copy.

6. **A song unlock dialog appeared on the initial title screen in this review session.** It offered Dewy Roll with Play it now and Later. Its cause and whether every new player sees it were not verified. Reproduce with a clean profile before changing entitlement logic. The interruption is the review concern, not the existence of music rewards.

7. **Collection already exists as The Grove with Keepsakes and Best Balls.** It displayed five unknown entries for each of the six timed worlds and no Dream Meadow entries in this session. The brief's statement of five keepsakes per world is therefore ambiguous for Dream Meadow. Verify the underlying inventory before promising 35 keepsakes or adding five new ones.

8. **Playable performance and feel remain unverified.** The live browser reported that it could not create a WebGL context. This is an environment limitation and is not evidence that Dewball fails on Pixel 9. No claim in this review establishes input latency, current attachment limits, current pause behavior, frame rate, world clear presentation or the condition of later world art. Those require repository inspection and device playtesting.

```json
{
  "model": "GPT",
  "date": "2026-10-09",
  "directions": { "A": 12, "B": 10, "C": 10, "D": 8 },
  "top3": [
    "Make pickup eligibility and attachment feedback clear while preserving every tuned gameplay value.",
    "Give Crumb Country a memorable first ninety seconds built around returning to collect a former obstacle.",
    "Validate a small handmade asset and ground benchmark on Pixel 9 before replacing the full prop library."
  ]
}
```
