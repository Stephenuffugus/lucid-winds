# TUMBLE IDEAS: GPT-5.6 Sol

Build target: `20260921b`

I treated Parts 1 to 3 and Part 5 as constraints, not prompts to redesign around. This starts with Lane F as requested, then proceeds lane by lane through the rest of Part 4. Within each lane, ideas are ranked best first.



# Lane F: The Economy

## F1. Diagnosis

The Quarter economy feels bad because it confuses **bonus currency** with **baseline currency**. Lint is continuously legible: every matched pair and basket shot pushes it forward. Quarters are invisible until the end, binary, and tied to two perfection states. A relaxed player can play an entire satisfying Load, make twenty correct matches, recover every missed throw, flip most inside-out socks, and still feel as if the game said “nothing happened.” Worse, the most desirable objects use that currency, so a dry spell sits directly between the player and dryers or hero packs. The fix is not cheaper dryers. The fix is to make loose change a normal physical by-product of laundry, then let care add **more** change. A miss must cost pride at most, never money already found.

## F2. The coins, ranked best first

**Build:** the coin jar / denomination framework is `code-large`; once it exists, each individual payout moment below is `code-small`.

The shared rule for every moment below: **the instant a coin reaches the jar, it is banked. A later miss can never take it away.** The modeled “Regular ¢” column is the expected contribution for a relaxed Regular Load under the assumptions used in F4. It totals exactly 50¢ per Regular Load on average.


| Rank | Moment | From | What the player sees/hears | Coin mix | How often / size scaling | Regular ¢ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Lint-Trap Coin | the lint trap is emptied when a Load ends | the trap slides out; a grey felt of lint lifts; one bright coin sits on top; a clean ceramic-like clink | penny 35%, nickel 30%, dime 25%, quarter 10% | Every Load. Small 1 draw, Regular 2, Heavy 3, Mountain 4. A Clean Load adds one extra draw. | 9.00¢ |
| 2 | The Clean-Load Quarter | the last ball of a Clean Load lands and the basket is empty of misses | a quarter rolls once around the basket rim, drops into the coin jar, and rings against glass | quarter 100% | Clean Loads only. One quarter at every size. A miss never removes it because it is paid only when the Load is finished clean. | 13.75¢ |
| 3 | Drum-Lip Rattle | the dryer door opens before the socks spill | two or three coins skate around the steel lip, one falls first, then the socks tumble over it | penny 45%, nickel 30%, dime 20%, quarter 5% | Every Load. Small 1 draw, Regular 2, Heavy 3, Mountain 4. | 6.00¢ |
| 4 | Spotless Brass | a Spotless Laundry Day Load ends | the dryer dial clicks back to zero and a quarter drops from behind it onto the machine top with one sharp ring | quarter 100% | Spotless Laundry Day Loads only. One quarter at every size. | 6.25¢ |
| 5 | Every Sock Right-Side Out | the last inside-out sock in the Load is corrected | a dime that was caught in the cuff flips free, spins flat on the table, then slides to the jar | dime 100% | Once per Load if every inside-out sock was flipped. Small 5¢, Regular 10¢, Heavy 10¢, Mountain 10¢. | 5.00¢ |
| 6 | Cuff Shake | an inside-out sock is flipped right-side out | occasionally a tiny coin snaps from the cuff, bounces once, and is caught by the table lip | penny 55%, nickel 30%, dime 13%, quarter 2% | Per flip, low chance. Cap 1/2/3/4 coin drops for Small/Regular/Heavy/Mountain so large Loads pay more without farming one sock. | 4.00¢ |
| 7 | Under the Last Sock | the final loose sock leaves the folding table | a coin that was hidden under the heap is revealed, the table gives a soft tap, and the coin rolls toward the jar | penny 30%, nickel 35%, dime 25%, quarter 10% | Small 35%, Regular 55%, Heavy 75%, Mountain 100%. | 3.00¢ |
| 8 | The Dryer-Seam Coin | a Load starts and the drum makes its first half-turn | a coin stuck in the rubber door seal peels loose, ticks against the drum twice, then drops out after the socks | penny 40%, nickel 30%, dime 20%, quarter 10% | Small 20%, Regular 40%, Heavy 60%, Mountain 80%. | 2.00¢ |
| 9 | Table-Edge Rescue | a ball that missed is picked up and successfully re-thrown | after the ball lands, a coin nudged by the miss wobbles at the table edge and settles safely into the catch tray | penny 70%, nickel 25%, dime 5% | At most once per Load, 20% chance after a recovered miss. No payout is ever removed for the miss itself. | 1.00¢ |
| 10 | The Heavy-Laundry Handful | a Heavy or Mountain Load finishes | the player hears two quick clinks from the drum and a small handful of low-value coins spills into the jar | penny 45%, nickel 35%, dime 18%, quarter 2% | Heavy: two draws. Mountain: four draws. Small and Regular: none. | 0.00¢ |


### Payout target by Load size

I would tune the combined moments to these **average** totals, not guarantee the exact same handful every Load. The point is that Small feels worthwhile, Mountain sounds and looks like a pocket-change event, and the care bonuses remain meaningful without being the faucet.

| Load | Relaxed average | Clean + all flips, typical | Spotless ceiling, typical |
|---|---:|---:|---:|
| Small, 10 pairs | ~32¢ | ~52¢ | ~77¢ |
| Regular, 20 pairs | **50¢** | ~68¢ | ~93¢ |
| Heavy, 35 pairs | ~72¢ | ~93¢ | ~$1.18 |
| Mountain, 50 pairs | ~96¢ | ~$1.20 | ~$1.45 |

Those are tuning targets, not a promise printed to the player. The player should see denominations, hear them, and watch the jar rise. They should never see a probability table.

## F3. How money is counted: choose **(b), the coin jar that rolls itself into Quarters**

**Build:** `code-large`.

Keep **Lint** exactly as the soft room currency. Pennies, nickels, dimes, and quarters all enter one squat glass coin jar on the display shelf. When its loose-change remainder reaches 25¢, four little quarter-sized paper-roll marks fill, there is a short glass-and-paper sound, and the Quarter counter increases by one. Any remainder stays visible as cents in the jar.

Why this is better than pricing everything in dollars: dryers already cost Quarters, the laundromat language is perfect, and “I need two more Quarters for the woodgrain dryer” is charmingly concrete. Converting the whole catalog to `$3.75` makes TUMBLE feel more like a storefront. The jar makes change feel like an object in the room.

**The line between comfort and advantage:** I would allow a comfort to reduce motor friction, text size, setup friction, or reach distance. I would not let it identify the correct twin, identify a decoy, add Rush time, protect a streak, change payout odds, or enlarge a scoring hitbox in a mode where score matters. Laundry Day can tolerate slightly broader physical conveniences because it has no timer or fail state, but Rush and Daily should remain comparable.

## F4. The arithmetic

For planning, I would tune a relaxed Regular Load to **50¢ average**. That equals **2 Quarters per Load on average** after roll-up, though the actual jar will have remainders. The current Quarter catalog is 95 Quarters total: 55 for the four paid dryers plus 40 for the four existing hero packs.

| Player | Play rate | Average change | First dryer, 8Q = $2.00 | First hero pack, 10Q = $2.50 | Current 95Q catalog = $23.75 |
|---|---:|---:|---:|---:|---:|
| Relaxed regular | 3 Regular Loads/day | $1.50/day = 6Q/day | 1.34 days | 1.67 days | 15.84 days |
| Long sitting | 10 Regular Loads/session | $5.00/session = 20Q/session | during that sitting, around Load 4 | during that sitting, around Load 5 | 4.75 ten-Load sittings |
| Very occasional | 1 Regular Load/week | $0.50/week = 2Q/week | 4 weeks | 5 weeks | 47.5 weeks |

This build adds five paid hero packs if **Pet Hair Counts as Fiber** is free, plus eight dryers totaling 104 Quarters. If the player eventually wants **every current and proposed Quarter item**, that is 249 Quarters or $62.25 in earned change. At the same relaxed rate, that is 41.5 days at three Regular Loads a day, or about 125 Regular Loads. That is acceptable as a completionist horizon because no individual desired item is far away. I would not advertise “249 Quarters to complete everything” as a goal.

## F5. Thirty pocket finds, ranked best first

**Build:** each individual find is `art` because it needs a tiny readable model; the shared find/display framework is `code-large` and the set rearrangements are `code-small`.

The first-day pool should contain things a player recognizes immediately. Rarer objects open at 8, 12, 20, 25, 30, 35, 40, 50, 60, 75 and 100 Loads so the shelf keeps acquiring stranger little evidence. Crucially, the late finds are not stronger. They are better stories.


| Rank | Find | Rarity | Flavor | Thumbnail | How it comes out | Shown | Set | Class | Help |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Half a Chapstick | common | Survived the wash. Again. | stubby white tube, cap missing, one dent | Can appear from Load 1; drops from a knee sock the first time it is flipped right-side out. | upright in the first glass pocket-find jar on the display shelf | coat-pocket-of-a-tall-man | keepsake | None. |
| 2 | The Guitar Pick | uncommon | Knows four chords and one very long story. | bright red triangular pick with one chewed corner | Can appear after 3 Loads; pings from the drum lip when the dryer opens. | clipped to the cork board with a tiny brass tack | coat-pocket-of-a-tall-man | keepsake | None. |
| 3 | Receipt Gone Soft | common | The total is now between us and the water. | small grey-white paper curl with one black barcode block blurred into watercolor | Can appear from Load 1; sticks damply to the underside of the last sock lifted from the pile. | flattened under a little glass paperweight on the shelf | coat-pocket-of-a-tall-man | keepsake | None. |
| 4 | The Spare Coat Button | common | Was included for a reason nobody remembers. | large dark tortoiseshell four-hole button | Can appear from Load 1; rolls out of a cuff when an inside-out sock is corrected. | in a shallow ceramic button dish on the shelf | coat-pocket-of-a-tall-man | comfort | Unlocks an optional larger tap target for tiny room controls. It never changes socks, shots, timers, or rewards. |
| 5 | Coat Check Claim 47 | uncommon | The coat made it home. The number stayed. | cream paper ticket with a huge black 47 and torn corner | Can appear after 12 Loads; flutters out when a dress sock is pulled from the heap. | tucked behind the cork board frame | coat-pocket-of-a-tall-man | keepsake | None. |
| 6 | One Tiny Screw | rare | Definitely important to something. Probably not this. | single silver machine screw with oversized cross slot | Can appear after 25 Loads; found sitting in the lint trap after a Clean Load. | inside a tiny magnetic dish on the shelf | coat-pocket-of-a-tall-man | would_not_ship | Would make Clean Loads 10% more likely to drop a quarter. |
| 7 | The Blue Marble | common | Was missing for eleven minutes and blamed everyone. | clear glass marble with one thick cobalt swirl | Can appear from Load 1; rolls from beneath the heap after the first pair is removed. | in a short glass jar beside the button dish | a-child-was-definitely-here | keepsake | None. |
| 8 | Green Crayon Nub | common | Still has one drawing left in it. | short forest-green wax cylinder with wrinkled paper band | Can appear from Load 1; falls from a baby sock when it is matched. | lying in a tiny enamel tray on the shelf | a-child-was-definitely-here | keepsake | None. |
| 9 | A Very Small Wheel | uncommon | Its vehicle has moved on without it. | black plastic wheel with a bright yellow hub | Can appear after 8 Loads; clatters twice inside the drum before dropping out. | propped against the pocket-find jar | a-child-was-definitely-here | keepsake | None. |
| 10 | Sticker Backing Star | common | The good part is on something else now. | white five-point backing paper with rainbow adhesive ghosts | Can appear after 5 Loads; clings to the side of a sock ball before peeling free. | stuck intentionally to the cork board corner | a-child-was-definitely-here | keepsake | None. |
| 11 | Acorn Cap Only | uncommon | The acorn had other plans. | warm brown textured cap, no nut | Can appear after 15 Loads; drops from a rolled cuff during a flip. | in the ceramic button dish | a-child-was-definitely-here | comfort | Unlocks a one-tap 'favorite this room look' star so the player can save one decor combination. |
| 12 | Single Googly Eye | rare | Has been watching the spin cycle professionally. | one large white craft eye with a loose black pupil | Can appear after 30 Loads; is stuck to the inside of the dryer door after a Load. | stuck to the rim of the glass find jar so it looks outward | a-child-was-definitely-here | would_not_ship | Would make a decoy blink once when picked up. |
| 13 | The Ticket Stub | common | The show was better than the parking. | faded coral ticket rectangle with two punched circles | Can appear after 10 Loads; slides from under a dress sock near the table edge. | pinned to the cork board | night-out-apparently | keepsake | None. |
| 14 | One Earring Back | common | Its earring is doing fine somewhere else. | tiny gold butterfly clutch, exaggerated slightly for readability | Can appear after 12 Loads; flashes in the lint trap under the room light. | inside a tiny clear-lidded compartment on the shelf | night-out-apparently | keepsake | None. |
| 15 | Paper Wristband | uncommon | Entry granted. Re-entry seems unlikely. | neon orange torn strip with two black hatch marks | Can appear after 20 Loads; peels off a sock ball after it lands in the basket. | looped around one cork-board tack | night-out-apparently | keepsake | None. |
| 16 | Emergency Mint Wrapper | common | The emergency passed. The wrapper persisted. | small metallic green twist wrapper, flattened | Can appear after 8 Loads; flutters from the dryer door when it opens. | pressed flat under the cork-board glass | night-out-apparently | comfort | Unlocks 'quiet open': skips the two-second room-intro camera drift on repeat sessions. |
| 17 | One Foil Star | uncommon | Stayed for cleanup. Nobody asked it to. | single thumb-sized gold foil star, slightly creased | Can appear after 35 Loads; sticks to the final matched pair of a Spotless Load. | floating against the back glass of the keepsake jar | night-out-apparently | keepsake | None. |
| 18 | Photo Booth Strip, Mostly Gone | once | The water kept the part that mattered. | four-frame black-and-white strip, faces washed pale but shoulders still leaning together | Appears once, on Load 100, tucked inside the last matched pair. No randomness. | centered beneath the cork board in a narrow black clip frame | night-out-apparently | keepsake | None. |
| 19 | The Bobby Pin | common | Has escaped every bathroom drawer it ever entered. | oversized black wavy pin silhouette | Can appear from Load 1; is hooked over a crew-sock cuff. | magneted vertically to the side of the shelf | useful-until-washed | comfort | Laundry Day only: lets you park one loose sock on a small table-edge clip while you search. Disabled in Rush and Daily. |
| 20 | Closed Safety Pin | common | Closed before washing. A professional. | large nickel safety pin, firmly shut | Can appear after 5 Loads; rests on top of the lint felt when the trap slides out. | pinned through a little felt square on the cork board | useful-until-washed | would_not_ship | Would keep a selected sock highlighted until its twin is found. |
| 21 | Eleven Inches of Tape Measure | uncommon | The remaining inches declined to participate. | short yellow fabric measuring tape curled into a loose S, black marks oversized | Can appear after 20 Loads; uncoils from inside a knee sock when flipped. | draped over the shelf edge | useful-until-washed | comfort | Adds an optional 115% inspection zoom for the sock already in your hand. It never marks the twin. |
| 22 | The Hair Tie | common | Stretched past dignity, still technically employed. | thick black elastic loop with one fuzzy spot | Can appear after 3 Loads; springs free when a ball style finishes rolling. | around the neck of the pocket-find jar | useful-until-washed | comfort | Remembers the last ball style, basket, radio, and room preset across sessions. |
| 23 | Three Notes, Now One | uncommon | Whatever they said has become very concise. | small pale-blue paper wad with three fused layers | Can appear after 40 Loads; found under the rug corner after a Load. | pressed in a tiny clear specimen frame | useful-until-washed | keepsake | None. |
| 24 | The Spare Shoelace | rare | Never met the shoe it was promised. | short cream shoelace tied in a single loose bow | Can appear after 50 Loads; snakes out of a Mountain or Heavy pile after the final pair is removed. | tied around one shelf support | useful-until-washed | comfort | Laundry Day only: missed sock balls stop at the near table edge instead of rolling to the floor; the player still must rethrow them. |
| 25 | The Washer | common | Not the appliance. Somehow less useful. | bright steel ring with a broad center hole | Can appear after 15 Loads; spins like a coin out of the dryer seam. | in the magnetic parts dish beside the tiny screw | things-nobody-throws-away | keepsake | None. |
| 26 | Bread Tag, Blue | common | No bread has claimed it in weeks. | bright blue square bread clip with one bite-shaped slot | Can appear after 10 Loads; catches briefly on the wicker basket rim after a shot. | clipped to the rim of the find jar | things-nobody-throws-away | keepsake | None. |
| 27 | The Good Pebble | uncommon | Picked for a reason. The reason remains solid. | flat charcoal oval with one pale quartz stripe | Can appear after 25 Loads; is discovered under the rug when the room resets after a Clean Load. | on the windowsill by itself | things-nobody-throws-away | keepsake | None. |
| 28 | Cap to Something | common | Its bottle has entered witness protection. | small bright orange ribbed plastic cap | Can appear after 18 Loads; rattles inside a slipper sock before being shaken free. | in the ceramic button dish | things-nobody-throws-away | would_not_ship | Would add five seconds to Rush once per Load. |
| 29 | Room 214 Keycard | rare | Checkout was at eleven. It missed the meeting. | plain teal card with large cream 214 and one punched corner | Can appear after 60 Loads; slides from beneath the lint trap after a Spotless Load. | propped against the clock base | things-nobody-throws-away | keepsake | None. |
| 30 | The Brass Key to Nothing Here | once | Has remained optimistic about this door. | old brass key with a round bow and three chunky teeth | Can appear once after Load 75, but only after three Clean Loads total; it drops from the drum and lands teeth-first with a heavy ping. | hung on a red thread from a hook beside the door | things-nobody-throws-away | would_not_ship | Would glow when a true twin is under the held sock. |


### Sort the thirty by what I would actually ship

**Pure keepsake:** Half a Chapstick; The Guitar Pick; Receipt Gone Soft; Coat Check Claim 47; The Blue Marble; Green Crayon Nub; A Very Small Wheel; Sticker Backing Star; The Ticket Stub; One Earring Back; Paper Wristband; One Foil Star; Photo Booth Strip, Mostly Gone; Three Notes, Now One; The Washer; Bread Tag, Blue; The Good Pebble; Room 214 Keycard.

**Comfort I would ship:** The Spare Coat Button; Acorn Cap Only; Emergency Mint Wrapper; The Bobby Pin; Eleven Inches of Tape Measure; The Hair Tie; The Spare Shoelace. These all reduce interface or motor friction and do not identify a twin, protect score, or improve payouts.

**A help I thought of and would NOT ship:** One Tiny Screw, which would increase Quarter odds; Single Googly Eye, which would reveal decoys; Closed Safety Pin, which would keep a sock highlighted; Cap to Something, which would add Rush time; The Brass Key to Nothing Here, which would locate a twin. Each one crosses from “kindness” into “better at TUMBLE.”

### First day versus the hundredth Load

**First day:** Half a Chapstick, Receipt Gone Soft, Spare Coat Button, Blue Marble, Green Crayon Nub, Sticker Backing Star and Bobby Pin can all appear immediately. Guitar Pick and Hair Tie join almost at once. The player should leave session one with two or three objects, enough to understand the system without turning finds into confetti.

**Hundredth Load:** **Photo Booth Strip, Mostly Gone** appears once, deterministically, inside the final matched pair of Load 100. It does not grant power. Its four washed-out frames still show two people leaning toward each other, and its flavor line is “The water kept the part that mattered.” It gets a dedicated narrow black clip frame under the cork board. That is why it is worth the wait: it feels like finding a tiny human story, not receiving “+5% coins.”

## F6. Sets

**Build:** `code-small` per completion re-stage after the find framework exists.


| Rank | Set | Six finds | What completing it visibly does |
| --- | --- | --- | --- |
| 1 | The Coat Pocket of a Tall Man | Half a Chapstick; The Guitar Pick; Receipt Gone Soft; The Spare Coat Button; Coat Check Claim 47; One Tiny Screw | The six objects move from scattered storage into a narrow shadow-box shaped like a coat pocket; a tiny stitched label reads FOUND TOGETHER. |
| 2 | A Child Was Definitely Here | The Blue Marble; Green Crayon Nub; A Very Small Wheel; Sticker Backing Star; Acorn Cap Only; Single Googly Eye | The shelf gains a small school-desk pencil tray; all six objects arrange themselves inside it, with the googly eye stuck to the front. |
| 3 | Night Out, Apparently | The Ticket Stub; One Earring Back; Paper Wristband; Emergency Mint Wrapper; One Foil Star; Photo Booth Strip, Mostly Gone | The cork board gets a narrow warm picture light and the six objects form one little night-out collage under it. |
| 4 | Useful Until Washed | The Bobby Pin; Closed Safety Pin; Eleven Inches of Tape Measure; The Hair Tie; Three Notes, Now One; The Spare Shoelace | A small peg rail appears under the shelf and each object hangs from its own hook instead of living in jars. |
| 5 | Things Nobody Throws Away | The Washer; Bread Tag, Blue; The Good Pebble; Cap to Something; Room 214 Keycard; The Brass Key to Nothing Here | A tiny wooden junk drawer appears half-open on the shelf; the finds sit in fitted little compartments, with the brass key hanging from its pull. |


Set completion should never award hidden stats. It should **re-stage the actual objects**. The room becomes more curated as the collection fills, which also solves the clutter problem.

## F7. Prices

**Build:** `data`.

**Do not rebalance the current Quarter prices yet.** At 50¢ per Regular Load, 8Q is roughly four Loads, 10Q is five Loads, 20Q is ten Loads. Those prices become pleasant goals once income is visible and ordinary. Lowering them before fixing income would mask the real problem.

For the new hero packs in Lane A: one is free, the other five are **10Q each**. For the new dryers in Lane C: **8Q to 18Q**, with the more code-heavy arrival machines generally costing more. These are not power tiers; price is simply collection pacing.

## F8. Four endless Lint sinks, ranked best first


| Rank | Sink | Price | What happens | Why it works | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | The Donation Bag | 250 Lint | Spend 250 Lint to add one folded sock-shaped patch to a canvas donation bag beside the door. The bag never fills; every fifth patch changes the stitched band color. | An infinite, visible, zero-power sink that turns surplus into a long-term room history. | code-small |
| 2 | Fresh Stems for the Mug | 80 Lint | Buy one chosen stem from six fixed flowers and place it in the current mug. A mug holds three. Replacing a stem costs again; nothing wilts while you are away. | Repeatable decorating with no fear-of-missing-out clock. | art |
| 3 | Table Polish | 60 Lint | For the next five Loads, the folding table gets a subtle hand-buffed sheen and slightly richer cloth-on-wood sound. A small tin sits open on the shelf while active. | A low-cost cosmetic ritual that makes surplus Lint feel tactile instead of numerical. | code-small |
| 4 | Radio Request Slip | 50 Lint | Write one of eight preset deadpan requests on a paper slip beside the radio. The selected station plays its alternate B-side loop for the next Load; the slip remains tucked under the dial afterward. | Repeatable, visible, and entirely mood-based. | art |


## F9. The four empty Clothesline pegs, ranked best first


| Rank | Peg | Earned by | Comfort | Why it stays a comfort | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Good Light | Finish 25 night Loads. | Adds a clothesline toggle that raises only the folding-table task light after dark. It does not brighten decoys selectively. | Accessibility and atmosphere, not information. | code-small |
| 2 | Sleeves Rolled Up | Flip 100 inside-out socks. | The flip gesture can start from anywhere on the held sock instead of only near its cuff. | It removes input fuss after the player has already recognized the sock is inside out. | code-small |
| 3 | Room Key | Finish 25 Clean Loads. | Adds two room-preset hooks beside the door so the player can save and swap two complete decor looks with one tap. | A pure decorating comfort earned by careful play. | code-small |
| 4 | Same Again | Finish 150 Loads. | The end-of-Load sheet gains one large Repeat button that starts the same mode and Load size again. | A veteran convenience, not a gameplay buff. | code-small |


# Lane A: Six new hero sock packs, ranked best first

All sixty use the existing eight silhouettes and the existing primitive/motif recipe system, so I would treat them as **data** unless a specific paint recipe exposes a renderer limitation. Every pack hits the requested 5 common / 3 uncommon / 2 rare distribution. I would ship **Pet Hair Counts as Fiber free**. It has the broadest instant-recognition audience and teaches new players that hero socks are a major part of TUMBLE rather than a premium-looking thing hidden behind the Quarter economy.


## A1. Pet Hair Counts as Fiber [SHIP FREE]
**Blurb:** The household pets have contributed to the laundry without being asked.

**Who it is for:** Cat people, dog people, rabbit people, and anyone who has lint-rolled black clothes five minutes after washing them.

**Build:** `data`

| Sock | Silhouette | Rarity | Flavor | Design recipe | Seasonal |
| --- | --- | --- | --- | --- | --- |
| Orange Cat at 3 A.M. | crew | common | Has a meeting in the hallway. Attendance required. | body #f1c27d; accents cat #d96b2b, eye #f3d34a, night #273043; family `solid`; cuff `contrast rib`; heel/toe 2; emblem at leg: an orange cat made from one oval body, circle head, triangle ears and two yellow eye dots standing against a dark crescent doorway | no |
| Dog Waiting by the Door | ankle | common | Heard a car. Could be yours. Probably yours. | body #d9c7ad; accents dog #7a5238, door #6b8f71, collar #c94f4f; family `heelToe`; cuff `plain rib`; heel/toe 1; emblem at ankle: a seated brown dog silhouette, red collar line, beside a tall green rounded-box door | no |
| Fur on Fresh Laundry | dress | common | Arrived before the folding was finished. | body #22252a; accents fur #f3e7d2, fur2 #b7a58e; family `motifScatter`; cuff `plain rib`; heel/toe 0; emblem at leg: large cream and tan short line segments scattered sparsely like pet hairs on black cloth | no |
| Rabbit With One Forbidden Cord | crew | common | Was told no. Heard maybe. | body #d9d7d2; accents rabbit #f5f2ed, cord #252525, warning #d95d4f; family `solid`; cuff `twin stripe`; heel/toe 1; emblem at leg: white rabbit made from ellipses with long ear shapes beside one black looping cord and a tiny red exclamation mark | no |
| Aquarium Gravel Collector | ankle | common | Carries three pebbles home every single time. | body #5ca3a8; accents fish #f3a44a, gravel #756b5a, bubble #e8f7f6; family `gradient`; cuff `contrast rib`; heel/toe 2; emblem at top of foot: one orange fish shape above three big gravel circles and three pale bubble circles | no |
| The Paw on Your Face | slipper | uncommon | Personal space was reviewed and declined. | body #efe5d5; accents paw #7f6b5f, toe #c98d8d; family `solid`; cuff `wide band`; heel/toe 1; emblem at top of foot: one enormous paw emblem: large rounded pad plus four toe circles, deliberately filling most of the foot | no |
| Cat in the Empty Box | novelty | uncommon | The box became occupied before it became empty. | body #c58b55; accents box #b97a45, cat #333038, eye #e8c84a; family `plaid`; cuff `checker band`; heel/toe 1; emblem at leg: open cardboard box from thick line segments with two dark cat ears and two yellow eye dots peeking over the rim | no |
| Bird Watching You Back | knee | uncommon | Has logged you in a very small notebook. | body #bfd6c2; accents bird #385b53, eye #f3cf62, branch #795b42; family `fairIsle`; cuff `twin stripe`; heel/toe 2; emblem at leg: one round dark-green bird on a brown branch with an oversized yellow eye circle | no |
| The Good Blanket Spot | slipper | rare | Warm. Indented. Currently unavailable. | body #7d657f; accents blanket #cdb4d6, pet #6a4c5e; family `chevron`; cuff `scalloped`; heel/toe 1; emblem at top of foot: a curled sleeping pet drawn as one spiral oval nestled inside three broad lavender blanket waves | no |
| One White Hair | dress | rare | There is always exactly one. | body #15171b; accents hair #fffdf8; family `solid`; cuff `plain rib`; heel/toe 0; emblem at leg: one single long white curved line from cuff nearly to ankle, nothing else | no |


## A2. Plant Parent Support Group [10 Quarters]
**Blurb:** Ten socks for people who have opinions about drainage holes.

**Who it is for:** Houseplant collectors, propagation-jar keepers, windowsill gardeners, and people currently apologizing to a fern.

**Build:** `data`

| Sock | Silhouette | Rarity | Flavor | Design recipe | Seasonal |
| --- | --- | --- | --- | --- | --- |
| Root Bound Again | crew | common | The roots have formed a committee. | body #d9c6a3; accents pot #b86b43, root #efe4c5, leaf #557c52; family `solid`; cuff `contrast rib`; heel/toe 1; emblem at leg: terracotta pot rounded box packed with looping cream root lines and two green leaves escaping sideways | no |
| One New Leaf | ankle | common | Please gather around. Something happened. | body #dce6c7; accents leaf #5d8b57, shine #f6f2b8; family `heelToe`; cuff `plain rib`; heel/toe 1; emblem at ankle: one oversized fresh green leaf shape with a tiny pale shine line | no |
| Propagation Jar | crew | common | Has lived in water long enough to have plans. | body #d8edf0; accents glass #eef9fa, stem #5d8654, root #c6a67a; family `stripe`; cuff `twin stripe`; heel/toe 1; emblem at leg: clear jar rounded box with one green stem above and three tan branching root lines below | no |
| Fungus Gnat Meeting | dress | common | Attendance is excellent. Morale is not. | body #efe7d0; accents gnat #2f2e2c, pot #ad6c4b; family `polka`; cuff `dotted band`; heel/toe 1; emblem at leg: small black dot gnats orbiting one plain brown pot, with one dot conspicuously outside the orbit | no |
| South Window Favorite | knee | common | Has been leaning left since February. | body #d7e6cf; accents leaf #487a4d, sun #e9bd55, frame #f4efe6; family `gradient`; cuff `wide band`; heel/toe 2; emblem at leg: tall plant made from stacked leaf ellipses leaning toward a half-sun beside a white window-frame line | no |
| The Dramatic Fern | novelty | uncommon | Missed one watering and prepared its estate. | body #53765a; accents fern #b8d5a9, pot #ce8b5c; family `motifScatter`; cuff `scalloped`; heel/toe 1; emblem at leg: three pale fern fronds drooping hard over a small orange pot | no |
| Clearance Rack Rescue | crew | uncommon | Sixty percent off and emotionally expensive. | body #efe1c8; accents tag #e75c62, leaf #5f8e5b, pot #836b58; family `plaid`; cuff `checker band`; heel/toe 2; emblem at leg: small green plant beside a giant red sale-tag shape with a punched circle | no |
| Moss Pole Ambition | knee | uncommon | Currently four leaves and a five-foot plan. | body #cad5b6; accents pole #8a6a4c, vine #4c7d4a, tie #6b9fb7; family `stripe`; cuff `triple stripe`; heel/toe 2; emblem at leg: one tall brown pole with a green vine zigzagging upward and two blue tie bands | no |
| Bottom Water Club | slipper | rare | Sits in a bowl and judges top watering. | body #b9d6d0; accents bowl #5d98a1, pot #bc7653, water #edf8f5; family `solid`; cuff `wide band`; heel/toe 2; emblem at top of foot: terracotta pot nested in a blue bowl, one pale water line visible around the base | no |
| Vacation Plant Sitter | dress | rare | Received six pages of instructions and one key. | body #f0e7d6; accents paper #fffdf5, leaf #5c8054, check #d35d4c; family `argyle`; cuff `plain rib`; heel/toe 1; emblem at leg: three stacked instruction sheets as rounded boxes, a green leaf, and one red check mark | no |


## A3. The Little Treat Economy [10 Quarters]
**Blurb:** Small foods purchased because the day had already happened.

**Who it is for:** Coffee-shop regulars, bakery-window people, snack planners, and grown adults who understand the phrase little treat.

**Build:** `data`

| Sock | Silhouette | Rarity | Flavor | Design recipe | Seasonal |
| --- | --- | --- | --- | --- | --- |
| Fancy Coffee You Were Already Out For | crew | common | Technically the errand had a coffee shop nearby. | body #d8b08a; accents cup #f5efe3, coffee #6b4430, foam #fff8ed; family `solid`; cuff `contrast rib`; heel/toe 2; emblem at leg: cream takeaway cup rounded box with brown top ellipse and one white foam spiral | no |
| Emergency Cookie | ankle | common | The emergency was four emails. | body #e8c98d; accents cookie #c98a4d, chip #4e3529; family `polka`; cuff `plain rib`; heel/toe 1; emblem at top of foot: one huge cookie circle with five dark chip dots, one bite-shaped crescent missing | no |
| Croissant Flake in the Car | dress | common | Will be discovered during the next vacuuming. | body #e8d5b3; accents pastry #c98c4b, flake #f3e4c5; family `motifScatter`; cuff `twin stripe`; heel/toe 1; emblem at leg: one crescent pastry built from three fat curved segments over scattered pale triangular flakes | no |
| Soup in the Big Mug | slipper | common | Dinner found a handle. | body #b55f4a; accents mug #e3a56f, soup #d86f3d, steam #f7e8cf; family `solid`; cuff `wide band`; heel/toe 1; emblem at top of foot: large orange mug with dark soup ellipse and two white steam curves | no |
| One Square of Chocolate | ankle | common | Saved for later. Later has arrived. | body #5b3b32; accents choc #7a4b3b, foil #d7c6a5; family `heelToe`; cuff `checker band`; heel/toe 2; emblem at top of foot: one four-cell chocolate rectangle with a little folded gold foil corner | no |
| Sunday Cinnamon Roll | crew | uncommon | The middle piece remains a matter of policy. | body #e5c69e; accents roll #c48352, icing #fff3dd; family `gradient`; cuff `scalloped`; heel/toe 1; emblem at leg: one large cinnamon spiral circle with three thick cream icing drips | no |
| Tiny Spoon Dessert | baby | uncommon | Contains six bites and a surprisingly serious spoon. | body #d8c7df; accents glass #f2edf4, dessert #8d6fa7, spoon #b8b9bd; family `stripe`; cuff `dotted band`; heel/toe 1; emblem at leg: small parfait cup with two purple layers and a tall silver spoon line | no |
| Takeout Noodles at the Sink | knee | uncommon | The table was available. This felt correct. | body #efe2bd; accents box #f7f2e7, noodle #d8a34f, chive #5c8451; family `solid`; cuff `triple stripe`; heel/toe 2; emblem at leg: white folded takeout box shape with three looping gold noodle lines and two green dashes | no |
| The Last Good Strawberry | novelty | rare | Everyone quietly agreed this one was yours. | body #f4d9d4; accents berry #d94f55, leaf #4e7d4d, seed #f8d27a; family `polka`; cuff `contrast rib`; heel/toe 2; emblem at leg: one giant red strawberry made from a heart-like polygon, green leaf cap, and five yellow seed dots | June |
| Pie Cooling Unsupervised | dress | rare | Has been alone by the window for minutes. | body #caa36f; accents crust #b87844, steam #fff0d7, berry #76506c; family `plaid`; cuff `wide band`; heel/toe 2; emblem at leg: round lattice pie with thick crossing crust lines and two pale steam curves | November |


## A4. Tiny Hobbies, Large Feelings [10 Quarters]
**Blurb:** The things you do for twenty minutes and think about all week.

**Who it is for:** Readers, makers, birders, gardeners, miniaturists, bakers, thrift hunters, and people with one suspiciously expensive pen.

**Build:** `data`

| Sock | Silhouette | Rarity | Flavor | Design recipe | Seasonal |
| --- | --- | --- | --- | --- | --- |
| Book With Three Bookmarks | crew | common | None mark the page you are actually on. | body #65809b; accents book #e7d8b7, mark1 #c95757, mark2 #d6aa4f, mark3 #6f9d73; family `solid`; cuff `twin stripe`; heel/toe 1; emblem at leg: open cream book from two rounded boxes with three bright ribbon lines hanging from the bottom | no |
| Yarn You Absolutely Had | knee | common | Bought because this green was different. | body #567d68; accents yarn #adc6a9, band #e5d8bd; family `fairIsle`; cuff `contrast rib`; heel/toe 2; emblem at leg: one pale green yarn ball circle crossed by looping strand lines and a cream paper band | no |
| Paint Water Cup | ankle | common | No longer contains a color with a name. | body #d9e2dc; accents cup #eff3ef, water #716f86, brush #bf6e4b; family `gradient`; cuff `plain rib`; heel/toe 1; emblem at top of foot: white cup with muddy purple water ellipse and two brush line segments leaning outward | no |
| Bird List at Dawn | dress | common | Three birds seen. Nine birds confidently heard. | body #d7e1d2; accents paper #f6f1df, bird #425d54, check #bf5c4d; family `solid`; cuff `dotted band`; heel/toe 1; emblem at leg: cream checklist rectangle with three dark bird silhouettes and three red check marks | no |
| Puzzle Piece in the Pocket | ankle | common | The box has been accusing everyone. | body #d9b8a5; accents piece #496f93, outline #f0e3cf; family `polka`; cuff `checker band`; heel/toe 1; emblem at ankle: one oversized blue puzzle-piece silhouette outlined in cream | no |
| Thrift Store Frame | crew | uncommon | Bought for the frame. Kept the stranger. | body #b7885f; accents frame #d3a869, photo #7c8b7a; family `plaid`; cuff `wide band`; heel/toe 2; emblem at leg: ornate rectangular frame simplified to thick stepped lines with a tiny green oval portrait inside | no |
| Garden Kneeler | slipper | uncommon | Has dirt in places dirt found independently. | body #708d68; accents pad #a5bd7c, soil #6c4d38, flower #d9a04f; family `heelToe`; cuff `contrast rib`; heel/toe 2; emblem at top of foot: green kneeling pad rounded box with three brown soil dots and one tiny yellow flower | no |
| Fountain Pen Ink Finger | dress | uncommon | The blue thumb signed nothing. | body #e8e3d7; accents pen #364b6b, ink #355f9b, nib #b8a56c; family `stripe`; cuff `twin stripe`; heel/toe 2; emblem at leg: dark pen line with gold nib polygon beside one large blue fingerprint-like spiral | no |
| Miniature Chair | baby | rare | Took six hours. Nobody is allowed to sit. | body #e0c9a7; accents wood #8b5e42, cushion #8aa1b1; family `solid`; cuff `scalloped`; heel/toe 1; emblem at leg: tiny chair built from a blue rounded seat and five brown line segments, centered large | no |
| Starter Named Tuesday | novelty | rare | Fed regularly despite contributing no rent. | body #ede2c8; accents jar #c9d8d2, starter #d2a76c, label #f8f2df; family `chevron`; cuff `wide band`; heel/toe 2; emblem at leg: glass jar rounded box half full of tan starter with a cream label reading TUE in block marks | no |


## A5. Found in 1998 [10 Quarters]
**Blurb:** A laundry basket from the era of translucent plastic and carpet patterns with confidence.

**Who it is for:** Adults nostalgic for late-90s bedrooms, malls, roller rinks, mix discs, and technology that came in clear plastic.

**Build:** `data`

| Sock | Silhouette | Rarity | Flavor | Design recipe | Seasonal |
| --- | --- | --- | --- | --- | --- |
| Translucent Phone Cord | knee | common | Reached every room and tangled in all of them. | body #a8d7d2; accents cord #6a9db0, phone #d8f0ed; family `stripe`; cuff `contrast rib`; heel/toe 2; emblem at leg: thick teal spiral cord running vertically with one translucent handset made from rounded boxes | no |
| Mix Disc, Untitled | crew | common | Track seven was the entire reason. | body #d9d8d2; accents disc #c9d7e6, rainbow #d99a55, marker #3d4147; family `solid`; cuff `twin stripe`; heel/toe 1; emblem at leg: large silver disc circle with small rainbow wedge and black handwritten-looking line marks | no |
| Glow Stars on the Ceiling | dress | common | Three are still up there somehow. | body #28324e; accents star #c9e85b, ceiling #44506d; family `motifScatter`; cuff `plain rib`; heel/toe 1; emblem at leg: large acid-green stars scattered sparsely over navy with three brighter stars near cuff | no |
| Gel Pen Constellation | ankle | common | The notebook margin was the main assignment. | body #42365f; accents pink #f17aad, aqua #68d0cf, silver #d9dbe2; family `motifScatter`; cuff `dotted band`; heel/toe 1; emblem at top of foot: pink and aqua dots connected by thin silver line segments into a fake constellation | no |
| Roller Rink Carpet | crew | common | Designed to hide everything except joy. | body #25213f; accents cyan #45c8d2, magenta #d95e9d, yellow #e8d650; family `motifScatter`; cuff `checker band`; heel/toe 2; emblem at leg: black-purple field with chunky cyan squiggle lines, magenta triangles and yellow dots | no |
| Inflatable Chair Static | slipper | uncommon | Sat once. Stood up carrying the room. | body #b7d6e8; accents chair #79b7d7, static #f7f5df; family `gradient`; cuff `wide band`; heel/toe 1; emblem at top of foot: clear blue inflatable chair silhouette made from rounded loops with white static zigzags around it | no |
| Cassette Rewound With Pencil | knee | uncommon | The pencil knew its assignment. | body #d8c8ad; accents tape #454549, label #f2e4bf, pencil #d7a94f; family `plaid`; cuff `triple stripe`; heel/toe 2; emblem at leg: black cassette rounded box with two reel circles and one diagonal yellow pencil line through a reel | no |
| Computer Room Carpet | dress | uncommon | Every chair wheel knew this exact blue. | body #2f4e73; accents speck #7ca3bf, grid #d3a45d; family `polka`; cuff `plain rib`; heel/toe 2; emblem at leg: dark institutional blue with pale blue speckles and occasional mustard grid squares | no |
| Vending Machine Ring | baby | rare | Cost fifty cents and ruled the afternoon. | body #f2c8d5; accents ring #8c63a6, gem #5fc8c7; family `solid`; cuff `scalloped`; heel/toe 1; emblem at leg: giant purple plastic ring circle with oversized aqua diamond-shaped gem | no |
| Channel Three Snow | novelty | rare | The console is on. The television disagrees. | body #30343a; accents snow #d8d9d7, scan #7b858b; family `gradient`; cuff `wide band`; heel/toe 1; emblem at leg: dense black-white-grey television snow blocks with three faint horizontal scan lines | no |


## A6. Local Creature Report [10 Quarters]
**Blurb:** Things seen briefly near roads, water, corn, and somebody's porch light.

**Who it is for:** Cryptid fans, hikers, small-town folklore people, and anyone who has photographed a suspicious shape at dusk.

**Build:** `data`

| Sock | Silhouette | Rarity | Flavor | Design recipe | Seasonal |
| --- | --- | --- | --- | --- | --- |
| Porch Camera Blur | crew | common | Moved too fast to become evidence. | body #4f5d67; accents blur #c8d0cd, eye #e2c45c; family `gradient`; cuff `plain rib`; heel/toe 1; emblem at leg: one pale horizontal blur oval with two yellow eye dots and a faint timestamp-like line block | no |
| Tall Thing by the Treeline | knee | common | Was a stump until it changed locations. | body #38483d; accents tree #26372e, thing #b9b49f; family `solid`; cuff `contrast rib`; heel/toe 2; emblem at leg: dark pine-triangle treeline with one very tall pale narrow oval figure between trunks | no |
| Lake Neck at Dusk | dress | common | Could be a log. The log has posture. | body #456d78; accents water #6f9eaa, neck #263e46, sun #d99b58; family `stripe`; cuff `twin stripe`; heel/toe 1; emblem at leg: three horizontal water lines, one dark curved neck rising through them, orange half-sun behind | no |
| Moth at the Streetlight | ankle | common | Much larger in memory. | body #2e3344; accents moth #d5c7a1, lamp #e8cb73; family `solid`; cuff `dotted band`; heel/toe 1; emblem at top of foot: large tan moth made from four wing polygons circling one yellow lamp circle | no |
| Three-Toed Mud Print | slipper | common | The fourth toe declined comment. | body #8a765e; accents mud #5f4f3e, print #d7c4a3; family `heelToe`; cuff `wide band`; heel/toe 2; emblem at top of foot: one huge dark footprint with three long toe ovals and a broad heel pad | no |
| Cornfield Eyes | crew | uncommon | The corn is not known for eye contact. | body #c2a94e; accents corn #7e8a3e, eye #f3d85a, pupil #252525; family `fairIsle`; cuff `checker band`; heel/toe 1; emblem at leg: vertical green corn stalk lines with one pair of bright yellow eye circles between them | no |
| Winged Shape Over the Bridge | dress | uncommon | Traffic slowed. Nobody discussed why. | body #434857; accents bridge #8a7e70, wing #272a32, light #e7b95c; family `chevron`; cuff `triple stripe`; heel/toe 2; emblem at leg: grey bridge line with two yellow lamp dots and one black wide-wing silhouette overhead | no |
| Antlers Behind the Shed | knee | uncommon | Only the antlers stayed for the photograph. | body #6d735f; accents shed #8a6048, antler #d8cfb4; family `plaid`; cuff `contrast rib`; heel/toe 2; emblem at leg: small brown shed rectangle with two giant pale branching antler line shapes rising behind it | no |
| Something in the Culvert | novelty | rare | Politely waited for the headlights to pass. | body #4a4e50; accents pipe #858b88, eye #e4c35f, water #617d86; family `solid`; cuff `wide band`; heel/toe 1; emblem at leg: large grey culvert circle with two yellow eye dots deep inside and one blue water line | no |
| Snowbank That Blinked | slipper | rare | The second blink felt unnecessarily personal. | body #e7ece9; accents shadow #9aabb0, eye #3d4140; family `gradient`; cuff `scalloped`; heel/toe 1; emblem at top of foot: soft pale snow mound made from overlapping ellipses with two tiny dark eyes barely visible | January |


## Pack ranking summary

| Rank | Pack | Broad-want estimate | Why |
|---|---|---|---|
| 1 | Pet Hair Counts as Fiber | Very high | Pets plus laundry is almost unfairly on-theme; ship this one free. |
| 2 | Plant Parent Support Group | Very high | Houseplants are core cozy-game visual language and the jokes are adult-specific. |
| 3 | The Little Treat Economy | High | Coffee, pastry, snacks and tiny rewards are broadly recognizable without needing fandom. |
| 4 | Tiny Hobbies, Large Feelings | High | The pack contains multiple identity hooks, so almost everyone gets at least one “that is me” sock. |
| 5 | Found in 1998 | Medium-high | Powerful nostalgia for a large adult cohort, but age-specific. |
| 6 | Local Creature Report | Medium-high | Strong screenshot identity and devoted cryptid appeal, but narrower than pets/plants/food. |


# Lane B: Six new procedural pattern families, ranked best first

The frozen constraints remain frozen: no new motif shapes, cuffs, silhouettes or conditions. These six consume only the six unused `patternFamily` values. I would version the generator mapping before shipping them, as noted in Lane J.


| Rank | Family | Look | How drawn | How twins/seeds differ | Convincing decoy | Build |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Windowpane | A quiet field crossed by very thin vertical and horizontal lines, making large unequal rectangles. | Draw 2 to 4 vertical line bands and 2 to 4 horizontal bands. `stripeRhythm` chooses spacing and which crossings get a tiny dot. Palette supplies base, vertical, horizontal, and crossing colors. | Twins share exact line counts, spacing, and crossing dots. Seeds can differ by one extra vertical line, shifted spacing, or a different crossing-dot cadence. | Same palette and grid, but one vertical line is one cell closer to its neighbor. It reads identical in the heap and wrong in the hand. | code-small |
| 2 | Heather Dash | A solid sock with sparse two-color micro-dashes, like knitted heather enlarged just enough to read. | Scatter short 45-degree line segments in two accent colors on a base. `stripeRhythm` controls dash length and clustering in broad bands rather than true stripes. | Seeds vary dash angle, band density, and whether clusters favor cuff, ankle, or foot. | Same colors and density, but the dash angle leans the opposite way or one broad band is shifted downward. | code-small |
| 3 | Stepped Colorblock | Three to five big flat color blocks that stair-step diagonally down the leg into the foot. | Use large rectangles/polygons with no outlines. `stripeRhythm` chooses step width and whether the final block lands at ankle or top of foot. | Seeds vary block order, step direction, and block width while keeping the same palette. | Same colors in the same order, but the middle step is one unit taller or mirrored. | code-small |
| 4 | Pinstripe | Very thin vertical stripes with occasional doubled lines, like a tiny old shirt fabric. | Repeat 1-pixel-equivalent vertical lines around the sock. `stripeRhythm` determines single-single-double cadence and spacing. | Seeds vary cadence, line width, and whether the double line repeats every third, fourth, or fifth interval. | Same palette and spacing, but double lines occur one interval earlier. | code-small |
| 5 | Confetti Bars | Short horizontal and vertical bars scattered on a plain field, chunkier and more geometric than motif scatter. | Scatter only thick line segments, never stock motifs. `stripeRhythm` selects ratio of horizontal to vertical bars and their length buckets. | Seeds vary bar orientation ratio, density, and two accent colors. | Same colors and density, but the horizontal-to-vertical ratio is reversed. | code-small |
| 6 | Ladder Knit | Repeating paired vertical rails joined by short rungs, spaced like a simple knit diagram. | Build 2 to 5 ladder columns from line segments. `stripeRhythm` controls rung spacing and whether adjacent ladders are offset half a rung. | Seeds vary number of ladders, rung spacing, and offset pattern. | Same ladders and palette, but one column's rungs are offset by half a step. | code-small |


# Lane C: Eight new dryers, ranked best first

For any arrival that uses new behavior, I would keep input locked until the final randomized pile has settled. That protects the promise that a dryer is spectacle, not an optimal strategy.


| Rank | Dryer | Machine look | How socks arrive | Sound | Price | Loads behavior | Build |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Hotel Laundry Cart | a tall cream canvas laundry cart on a dark metal X-frame, parked where the dryer normally sits | The cart rolls six inches forward, tips its canvas mouth, and the entire randomized Load slumps onto the table in one soft avalanche. | rubber caster squeak, canvas creak, then one deep cloth whomp | 14Q | `cartDump` NEW behavior | code-small |
| 2 | Apartment Laundry Chute | a painted metal wall chute with a square flap, little dents, and a brass PULL plate | The flap opens and the Load drops in four quick randomized bursts, then physics settles the whole heap before control begins. | metal flap clack, three hollow chute thumps, cloth landing softly | 12Q | `chuteBursts` NEW behavior | code-small |
| 3 | Woodgrain 1978 | cream enamel dryer with a fake walnut control strip, square door, and one amber pilot light | Exactly the Standard Dryer tumble, but slower-looking drum motion and a square door reveal. | heavy mechanical timer tick, low motor, firm door latch | 8Q | `regular` existing behavior | art |
| 4 | Porcelain Spin Tub | a round white enamel wash tub with navy rim, mounted on a squat mint base | The inner drum rises like an elevator, tilts once, and pours the randomized socks onto the table; control starts after normal settling. | ceramic clink, belt whirr, then a hollow enamel bonk | 16Q | `tubLift` NEW behavior | code-small |
| 5 | Upstairs Stack Unit | a narrow stacked washer-dryer with round black glass and one slightly crooked instruction sticker | Old regular behavior from the upper round door; the higher origin gives the fall more theater but the pile is normalized before play. | high door thunk, soft drum brake, socks pattering down | 10Q | `regular` existing behavior | art |
| 6 | Radiator Drying Rack | old cast-iron radiator with a folding wooden rack above it and socks draped over parallel rails | Reuses Backyard Clothesline behavior: socks come down one at a time, but each slides from a warm wooden rail instead of a peg. | radiator ping, tiny wood tap, soft sock flop | 15Q | `oneAtATime` existing behavior | art |
| 7 | Corner Laundromat Round-Door | yellow enamel commercial front-loader with a huge convex glass porthole and chunky chrome latch | Regular spill, but the big glass door swings wide enough to frame the whole heap before it drops. | coin-door clunk, stainless latch, resonant drum stop | 11Q | `regular` existing behavior | art |
| 8 | The Airing Cupboard | a shallow wooden cupboard with slatted doors and three warm linen shelves | All socks begin randomly distributed across three shelves; the shelves tilt together and sweep them into the same randomized table heap before play starts. | two wooden door clicks, linen rustle, three gentle shelf taps | 18Q | `shelfSweep` NEW behavior | code-small |


# Lane D: The room

The room is the second collection screen. I would spend disproportionate art effort here because rugs, windows, wall color, floor and table occupy far more pixels than tiny unlock icons.

## D1. Twelve rugs, ranked best first


| Rank | Rug | Price | Look | Why | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Checkerboard Linoleum Rug | 240 Lint | A cream-and-charcoal checker rug pretending to be a kitchen floor. | The boldest possible room color block while still feeling domestic. | art |
| 2 | Wavy Motel Carpet | 260 Lint | Deep blue rug with broad rust and tan waves, slightly too confident. | A nostalgic statement rug that screenshots beautifully. | art |
| 3 | Pressed Flower Rug | 220 Lint | Warm linen rug with large flattened leaf and flower silhouettes. | Quiet botanical without competing with sock patterns. | art |
| 4 | Library Runner | 250 Lint | Long faded burgundy runner with a narrow gold border and worn center path. | Makes the room feel lived in and older instantly. | art |
| 5 | Picnic Blanket Rug | 210 Lint | Soft cream and brick-red gingham with one imperfect folded corner. | Recognizable cozy color at a glance. | art |
| 6 | Storm Cloud Oval | 230 Lint | Oval grey-blue rug with one pale cloud-shaped center field. | Pairs beautifully with rainy windows without being seasonal. | art |
| 7 | Braided Spectrum | 280 Lint | Braided oval with muted clay, moss, mustard, blue, and cream rings. | A rainbow idea softened into grown-up room decor. | art |
| 8 | Night Garden | 300 Lint | Dark green rug with oversized simple gold leaf silhouettes around the edge. | Premium-looking contrast under warm evening light. | art |
| 9 | Brown Plaid Rug | 200 Lint | Low-contrast brown, tan, and cream plaid, like a blanket inherited from someone practical. | A calm grounding option for players who hate loud decor. | art |
| 10 | Moon Phase Runner | 300 Lint | Navy runner with seven cream moon circles marching down the center. | Graphic, adult, and easy to read from the fixed camera. | art |
| 11 | Big Daisy Rug | 230 Lint | Mustard field with six oversized cream daisies and dark centers. | Cheerful without needing tiny detail. | art |
| 12 | Care Label Rug | 260 Lint | Off-white rug printed with giant abstract care-symbol boxes and lines, no real text. | Turns laundry iconography into a bold graphic without becoming a joke prop. | art |


## D2. Eight windows, ranked best first


| Rank | Window | Price | View | Why | Seasonal | Build |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Morning Fog Window | 180 Lint | Pale fog beyond the glass; dark tree trunks appear and fade very slowly. | Movement is nearly invisible until you notice it. | no | art |
| 2 | October Rain Window | 280 Lint | Amber leaves stuck to wet glass while rain threads down outside. | A richer rainy mood with leaf motion. | October | art |
| 3 | Freight Train Window | 320 Lint | A distant freight train crosses the lower third every few minutes, one slow line of muted cars. | Players will wait to catch it in screenshots. | no | art |
| 4 | Firefly Yard Window | 300 Lint | Dark summer yard with six or seven warm firefly dots appearing one at a time. | A night view that feels alive without particles everywhere. | July | art |
| 5 | Far Thunder Window | 320 Lint | Heavy slate sky; rare soft sheet-lightning brightens the room for half a second. | A premium lighting moment with almost no geometry. | no | art |
| 6 | Pink Dawn Window | 260 Lint | A quiet pink-blue dawn gradient with one utility wire and two distant birds. | Excellent opening-room mood for morning players. | no | art |
| 7 | Apartment Courtyard Window | 240 Lint | Brick courtyard, fire escape, one tiny laundry line moving in the breeze. | Makes the room feel located inside a bigger world. | no | art |
| 8 | Lake at Dusk Window | 280 Lint | Low lake horizon, peach afterglow, and one tiny boat light moving almost imperceptibly. | Quiet destination view with no brand or region dependency. | no | art |


## D3. Six lamps, ranked best first


| Rank | Lamp | Price | Look | Why | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Pleated Shade Lamp | 220 Lint | Small ceramic base with a warm cream pleated shade. | Instantly warmer and more domestic than the blob-lamp family. | art |
| 2 | Brass Library Lamp | 300 Lint | Low brass desk lamp with greenish cream inner shade, aimed at the folding table. | Makes the table feel intentionally lit. | art |
| 3 | Paper Globe Lamp | 240 Lint | Round paper globe with faint rib lines and a warm core. | Soft diffuse light reads expensive on cloth. | art |
| 4 | Milk Glass Lamp | 280 Lint | White glass mushroom-shaped shade on a short brass stem. | A classic soft silhouette without leaning into novelty. | art |
| 5 | Old Clamp Lamp | 180 Lint | Simple metal clamp lamp clipped to the shelf, with a warm cone of light. | Cheap-looking object rendered carefully becomes charming. | art |
| 6 | Sunset Glass Lamp | 320 Lint | Low amber glass lamp whose shade glows from peach to orange. | A strong evening room anchor. | art |


## D4. Ten more items for existing slots, ranked best first


| Rank | Item | Slot | Price | Look | Why | Build |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Propagation Trio | plant | 180 Lint | Three clear jars with single cuttings and visible pale roots. | A whole plant-parent story in one small shelf cluster. | art |
| 2 | ZZ Plant | plant | 160 Lint | Glossy dark-green paired leaves in a matte sand pot. | A sculptural plant that stays readable from far away. | art |
| 3 | Kitchen Cuttings | plant | 120 Lint | Three little herb cuttings in mismatched tiny water glasses. | Small domestic clutter that still looks curated. | art |
| 4 | Tea Went Cold | mug | 90 Lint | Tan stoneware mug with a dark tea ellipse and one forgotten spoon. | A perfect quiet-room joke. | art |
| 5 | The Soup Mug | mug | 100 Lint | Wide rust mug with two tiny handles, suspiciously bowl-like. | Different enough from the existing mugs to change the silhouette. | art |
| 6 | Cloud Watching Club | poster | 120 Lint | Faded poster with three big cloud shapes and tiny meeting-date blocks. | Looks like a real local-club print without readable small text. | art |
| 7 | Laundry Instructions, 1976 | poster | 130 Lint | Cream instructional poster with giant abstract washer icons and burnt-orange arrows. | A believable found print that reinforces the room. | art |
| 8 | Cat Tail Wall Clock | clock | 240 Lint | Simple black clock face with one curved tail-shaped second hand. | Animation gives the wall a tiny bit of life. | art |
| 9 | Pressed Leaf Garland | garland | 140 Lint | Large flat leaf shapes strung sparsely on brown cord. | Seasonal-adjacent but calm enough to leave up all year. | art |
| 10 | Painted Crate Shelf | shelf | 260 Lint | Two shallow wood crates painted faded sage and mounted as cubbies. | A stronger silhouette for all the new pocket-find clutter. | art |


## D5. Six new slots worth code, ranked best first


| Rank | New slot | Why it earns a permanent room slot | Build |
| --- | --- | --- | --- |
| 1 | Wallpaper | It changes more pixels than almost any other unlock and instantly makes screenshots feel like different homes. | code-small |
| 2 | Floor | The floor anchors the rug, dryer, basket, and shadows, so material changes make the whole renderer feel new. | code-small |
| 3 | Curtains | They frame every window and can add tiny cloth motion for very little screen clutter. | code-small |
| 4 | Folding Table | The player's hands live here. Changing the surface makes every single Load visibly different. | code-small |
| 5 | Door | The door is a large vertical prop with almost no interaction cost, perfect for strong room identity. | code-small |
| 6 | Second Animal | A second living thing adds enormous affection and screenshot value, but only if its animation stays quiet and never obstructs play. | code-large |


### D5.1 Wallpaper: first six items

| Rank | Item | Price | Look | Colors | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Warm Cream Walls | 180 Lint | Quiet warm plaster with barely visible roller texture. | #e7dfcf / #d7ccb9 | art |
| 2 | Faded Ditsy Wallpaper | 260 Lint | Tiny sparse leaf sprigs on old cream paper. | #d9d1bd / #8fa17f | art |
| 3 | Blue Pinstripe Walls | 240 Lint | Powder-blue vertical pinstripes, thin and low contrast. | #c7d5dc / #7893a1 | art |
| 4 | Moss Half-Wall | 300 Lint | Moss green lower wall, warm cream above, with a narrow wood rail. | #6f8068 / #e7dfcf | art |
| 5 | Sunny Checks | 280 Lint | Large soft mustard and cream checks, deliberately uneven. | #e4c66d / #f0e4c5 | art |
| 6 | Night Botanical | 340 Lint | Deep green wall with oversized muted leaf silhouettes. | #273e3a / #b4b58b | art |


### D5.2 Floor: first six items

| Rank | Item | Price | Look | Colors | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Honey Pine Floor | 220 Lint | Wide honey-pine boards with soft worn edges. | #b9895f / #8b6749 | art |
| 2 | Cream Checker Tile | 300 Lint | Large cream and warm-grey tiles, slightly scuffed. | #e8e1d1 / #6f706c | art |
| 3 | Painted Concrete | 180 Lint | Soft sage-grey painted concrete with worn paths. | #9da39f / #7d8580 | art |
| 4 | Terracotta Hex Floor | 320 Lint | Big matte hex tiles with pale grout. | #b86f4e / #d3a181 | art |
| 5 | Speckled Linoleum | 240 Lint | Muted green linoleum with cream flecks and one seam line. | #b8c0ae / #ddd4bd | art |
| 6 | Dark Walnut Floor | 340 Lint | Dark narrow boards that make pale rugs glow. | #654735 / #3f3028 | art |


### D5.3 Curtains: first six items

| Rank | Item | Price | Look | Colors | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | White Cafe Curtains | 140 Lint | Half-height white cotton curtains with soft hems. | #f3efe4 / #d9d4c7 | art |
| 2 | Mustard Gingham Curtains | 200 Lint | Small mustard-and-cream checks, tied loosely. | #d3b45f / #f0e2bd | art |
| 3 | Rain Blue Linen Curtains | 220 Lint | Dusty blue linen panels that move a few millimeters. | #7e9baa / #d7e2e4 | art |
| 4 | Sheer Floral Curtains | 240 Lint | Translucent cream with large pale leaf silhouettes. | #eee7da / #b8c0a3 | art |
| 5 | Rust Stripe Curtains | 200 Lint | Broad vertical rust and oatmeal stripes. | #a9654e / #e1c7a9 | art |
| 6 | Tiny Star Curtains | 260 Lint | Deep blue cloth with sparse cream star dots. | #4a526a / #d8d3bd | art |


### D5.4 Folding Table: first six items

| Rank | Item | Price | Look | Colors | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Maple Folding Table | 240 Lint | Pale maple top with rounded edge and grey folding legs. | #c79867 / #8f6d4f | art |
| 2 | White Enamel Table | 220 Lint | White enamel top with a dark green edge and one tiny chip. | #e8e6de / #8f9895 | art |
| 3 | Green Laminate Table | 220 Lint | Muted green laminate with cream edge banding. | #6f8d78 / #d2c8ae | art |
| 4 | Old Sewing Table | 300 Lint | Warm wood top with two shallow drawer fronts and black metal legs. | #8b654b / #b68d6b | art |
| 5 | Butcher Block Table | 320 Lint | Thick striped butcher-block top with simple steel legs. | #c38b58 / #9f6a42 | art |
| 6 | Folding Card Table | 180 Lint | Dark green padded vinyl top with black folding legs. | #54715e / #343b36 | art |


### D5.5 Door: first six items

| Rank | Item | Price | Look | Colors | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Scuffed Cream Door | 120 Lint | Plain cream utility door with worn paint near the knob. | #dfd7c8 / #9a8c7b | art |
| 2 | Sage Panel Door | 180 Lint | Muted sage four-panel door with brass knob. | #78907a / #d8c8aa | art |
| 3 | Mustard Utility Door | 190 Lint | Flat mustard door with small brushed-steel kick plate. | #c6a14b / #6c665c | art |
| 4 | Frosted Glass Door | 260 Lint | Wood frame with cloudy glass and a vague hallway glow. | #c9d8d6 / #716f68 | art |
| 5 | Stickered Back Door | 220 Lint | Faded green door with six abstract old stickers, no logos or text. | #7d8f86 / #d7c85a | art |
| 6 | Midnight Blue Door | 210 Lint | Deep blue paneled door with warm brass hardware. | #2f4152 / #c8a86e | art |


### D5.6 Second Animal: first six items

| Rank | Item | Price | Look | Colors | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Senior Dog | 900 Lint | Small old tan dog sleeping by the door; one ear twitches sometimes. | #b58d6b / #e2d0b8 | art |
| 2 | Tuxedo Cat | 900 Lint | Black-and-white cat loafed under the shelf, blinking slowly. | #2b2b2d / #f1ede3 | art |
| 3 | Lop Rabbit | 950 Lint | Soft brown lop rabbit tucked beside the rug fringe. | #b9a28f / #e6d6c7 | art |
| 4 | Green Budgie | 850 Lint | Tiny green budgie perched on the clothesline, occasionally fluffing up. | #79a766 / #e5d55f | art |
| 5 | Very Long Dog | 1000 Lint | Slim grey dog folded impossibly small on the rug. | #8a817b / #d3c6b6 | art |
| 6 | Window Pigeon | 800 Lint | Round pigeon on the outside sill, visible through any window view. | #737d86 / #9a7e9a | art |


# Lane E: Baskets, ball styles, shot trails, radio stations

These are ranked within their subcategory. Baskets stay neutral except the deliberately harder flower pot joke. Trails remain sparse because the room should never become a particle demo.

## E1. Eight baskets


| Rank | Basket | Price | Look | Hitbox | Why it is pleasant to land in | Build |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Enamel Wash Tub | 500 Lint | A low cream enamel tub with a navy rim and two black handles. | radius 1.0, rim standard | The ball makes a gorgeous hollow metal-cloth thunk. | art |
| 2 | Rope Coil Basket | 420 Lint | Thick natural rope coiled into a round basket with short loop handles. | radius 1.0, rim standard | Soft fibers and a deep mouth make every landing look cozy. | art |
| 3 | The Open Suitcase | 650 Lint | Old brown suitcase open flat with its fabric lid upright behind the target. | radius 1.0, rim standard | A sock ball landing in luggage is weirdly satisfying and visually legible. | art |
| 4 | Upside-Down Umbrella | 700 Lint | Open umbrella resting upside down, navy panels with one mustard panel. | radius 1.0, rim standard | Strong silhouette and a soft fabric bounce without changing hitbox. | art |
| 5 | Wool Felt Bin | 360 Lint | Round charcoal-green felt bin with two punched handles. | radius 1.0, rim standard | A quiet premium target for players who dislike novelty props. | art |
| 6 | Open Picnic Basket | 600 Lint | Wicker picnic basket with both lids hinged upright and red-check lining. | radius 1.0, rim standard | Warm materials and a clean framed opening. | art |
| 7 | Canvas Mail Sack | 480 Lint | Heavy cream canvas sack held open by a circular steel stand. | radius 1.0, rim standard | Industrial-soft contrast with a lovely fabric collapse on impact. | art |
| 8 | Very Large Flower Pot | 750 Lint | Terracotta planter with a wide lip and absolutely no plant. | radius 0.88, rim tight | A joke challenge basket, clearly optional, with a satisfying ceramic knock. | art |


## E2. Six ball styles


| Rank | Ball style | Price | Roll | Why | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | The Flat Fold | 180 Lint | Two socks folded into a neat square packet. | For people who cannot stand a lumpy drawer. | art |
| 2 | The Burrito | 240 Lint | Pair laid together, rolled long, then both cuffs folded over the cylinder. | A funny compact shape that still reads like laundry. | art |
| 3 | One Cuff Over | 300 Lint | A loose roll with only one cuff stretched over the bundle. | Looks homemade and slightly asymmetrical. | art |
| 4 | Crossed Ankles | 360 Lint | Socks crossed at the ankles, folded inward, then rolled once. | A visible X before the ball tightens. | art |
| 5 | The Soft Knot | 420 Lint | The pair is looped into a very loose overhand knot with no stretching. | Different silhouette in flight without changing physics mass. | art |
| 6 | The Drawer Brick | 480 Lint | Pair folded into thirds into a small rectangular brick. | A crisp alternative for screenshot-minded organizers. | art |


## E3. Six shot trails


| Rank | Trail | Price | Look | Why | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Loose Thread | 240 Lint | One short curved thread line lags behind the ball and fades before landing. | Barely-there motion that feels tactile, not sparkly. | art |
| 2 | Tailor's Chalk | 300 Lint | Three soft chalk flecks drift off the ball, then vanish. | Laundry-adjacent and restrained. | art |
| 3 | Dryer Static | 360 Lint | Two or three tiny blue-white zigzags snap behind the ball only at release. | A clean electrical accent with no screen-filling particles. | art |
| 4 | One Tiny Leaf | 420 Lint | A single flat leaf shape tumbles once behind each shot. | One object is funnier and more premium than a particle spray. | art |
| 5 | One Firefly | 480 Lint | One warm dot follows half a beat late, then blinks out at the basket. | A quiet night-room companion. | art |
| 6 | Three Bubbles | 540 Lint | Exactly three translucent bubbles peel away at different speeds. | A strict cap keeps the effect elegant. | art |


## E4. Eight radio stations


| Rank | Station | Price | What it sounds like | Why the name/mood works | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Kitchen After Midnight | 200 Lint | Muted upright piano, fridge hum, brush kit, one distant cabinet close. | Feels like being the last awake person in a warm house. | art |
| 2 | Rain in a Parked Car | 200 Lint | Close rain on glass and roof with very low warm electric piano underneath. | A place, not a genre. Perfect for headphones. | art |
| 3 | Library Basement at Closing | 200 Lint | Soft HVAC, page turns, felted vibraphone, occasional cart wheel. | Cozy institutional ambience nobody else names. | art |
| 4 | Porch During a Summer Storm | 200 Lint | Low thunder, porch rain, muted acoustic guitar harmonics, one screen-door creak. | Strong scene without becoming a weather soundboard. | art |
| 5 | Late Train Home | 200 Lint | Rail rhythm, low synth pad, sparse brushed snare, station doors far away. | Gentle movement suits repetitive sorting. | art |
| 6 | Cafe Before Opening | 200 Lint | Room tone, cup set-down, low jazz guitar, espresso-machine hiss used sparingly. | Coffee-shop mood without chatter or a fake brand. | art |
| 7 | Motel Ice Machine Hallway | 200 Lint | Soft fluorescent hum, distant ice drop, hazy electric piano chords. | Specific, lonely, oddly comforting. | art |
| 8 | Someone Vacuuming Upstairs | 200 Lint | A distant vacuum moves room to room under soft bass and brushed drums. | Domestic comedy that stays low enough to actually play beside. | art |


# Lane G: Paying, without feeling cheap

My recommendation is to keep TUMBLE looking like a **paid game that happens to have optional authored expansions**, not a mobile economy that happens to have a $0.99 cover charge.

## Ranked recommendation


| Rank | Decision | Price | How it appears in the room | What stays earnable | Review risk | Build |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | One Supporter Envelope | $1.99 | A single cream envelope leaning on the display shelf. Tap it, one paper sheet slides out. No shop grid. | Every Quarter, dryer, base hero pack, peg, Reunion and comfort. Supporter cosmetics sit outside completion counts. | Low if it is never nagged and never badged. | code-small |
| 2 | Substantial named expansion, only after there is demand | $2.99 | A folded laundry catalog on the shelf with one cover, one price, one purchase. Two sock packs + six decor + one station + one dryer look. | Everything in the base game remains earnable forever; expansion content is additive and excluded from base completion. | Low to moderate, because it reads like DLC rather than a currency shop. | code-small |
| 3 | Do not sell Quarters | $0 | There is no cash button near the coin jar. The jar is proudly play-only. | All Quarter-priced goods. | **Highest risk if added.** Scarcity plus a buy button makes every slow payout look engineered. | data |
| 4 | Do not sell hero packs one at a time | $0 | Hero packs remain physical Drawer/room goals priced in Quarters. Paid future socks come only in a real expansion. | All base hero packs. | Moderate risk if sold individually because cash prices would sit on the game's most lovable collectibles. | data |


### What the Supporter Envelope contains

- **Brass Studio Pin:** a tiny generic wolf-head silhouette pin on the shelf, no gameplay effect.
- **Late Light:** a warm low lamp variant.
- **Studio After Everyone Left:** one radio station with quiet keys, HVAC, chair creak and distant rain.
- A one-line paper note: **“You already bought the game. This was extra kind.”**

No supporter icon appears on the title screen, no red dot appears on the envelope, and the game never reminds the player it exists after they close it once.

### Which of your three ideas costs the most in reviews?

**Buying Quarters is the one I would kill completely.** It converts a balance problem into a monetization suspicion. **Individual cash-priced hero packs are second-worst** because they fragment the collection and make the Drawer look monetized. **A supporter bundle is the safest** if it is one non-consumable purchase, visually quiet, gameplay-neutral, and absent from completion percentages.

### Two paid cozy games worth copying structurally

**A Little to the Left:** as checked in September 2026, Steam lists the paid base game plus two substantial paid DLC expansions, `Cupboards & Drawers` and `Seeing Stars`, instead of consumable currency. The useful lesson for TUMBLE is not its exact prices. It is that extra money buys a clearly named chunk of authored content.

**Unpacking:** the core game is sold as a complete premium experience; its Steam add-on is the soundtrack, not gameplay currency or convenience. The useful lesson is that a domestic, meditative game can let the purchase itself be the business model.

TUMBLE is much cheaper than either example, which is one reason I would test a higher base price before I would add a Quarter button.


# Lane H: Make it look and feel PREMIUM

Ranked by **player notice divided by implementation cost**, not by how technically impressive the feature sounds.


| Rank | Specific polish | What the player sees/hears/feels | Why it reads expensive | DONE means | Build |
| --- | --- | --- | --- | --- | --- |
| 1 | Material-Specific Basket Landing | A wicker basket gives a dry reed knock plus cloth thump; enamel gives a short hollow bonk; felt gives almost nothing; wire gives one restrained metallic tick. Haptic is one soft pulse exactly at first contact. | The target is touched every Load, so this is heard hundreds of times. Matching sound to material makes cheap geometry feel physical. | Every basket style passes a blind audio test where a tester can identify material class at least 4 of 5 times. | code-small |
| 2 | The Sock Actually Lifts Into Your Hand | On touch, the selected sock rises 8 to 12 mm, its cloth shadow separates, it rotates 3 degrees toward camera, then follows the thumb with slight spring lag. | The core verb stops feeling like dragging a mesh and starts feeling like picking up fabric. | No sock teleports; at 60 fps the lift, shadow separation, and follow lag are visible in a 0.25x screen recording. | code-small |
| 3 | Menus Are Paper in the Room | Load choice, Drawer, and end-of-Load summary arrive as cream paper sheets slid from beneath the table edge with a tiny paper sound. Closing them slides them back. No floating glass panels. | A coherent physical UI makes the entire game feel authored instead of wrapped. | Every primary menu has one physical entry/exit motion and no default mobile modal animation remains. | code-small |
| 4 | First Ten Seconds | Cold launch: black for less than half a second, room fades in already lit, dryer is idling, radio is barely audible, one sock on the table edge settles a few millimeters. The dryer door handle gives one quiet warm highlight. First tap opens the Load sheet. | No logo gauntlet, no rewards popup, no shop. The game shows confidence by getting out of the way. | From icon tap to interactive room is under 4 seconds on the target midrange Android device, with at most one studio mark. | code-small |
| 5 | Contact Shadows Under Every Sock | Use a cheap screen-space or blob contact shadow that darkens directly where sock, table, basket, and ball touch. Keep it soft and short. | Soft objects without contact shadows float. Fixing that buys more realism than higher polycount. | At normal phone brightness, every sock in a heap reads as touching something, with no detached dark halos. | code-small |
| 6 | Room Light Follows Local Time | Morning is cool window light with warm lamp off; afternoon is neutral; after 7 pm the window cools down and the table lamp becomes the warm key. At 8 pm the lamp reflection appears in the dryer glass. | Time-of-day lighting makes the room feel inhabited without needing content popups. | Three captured times, 9 am, 3 pm, 9 pm, are unmistakably different while sock colors remain matchable. | code-small |
| 7 | Dryer Glass Has a Real Reflection | The round glass gets a subtle room reflection, dark edge Fresnel, two fingerprint smudges only visible at glancing angles, and a dim rotating cloth reflection during tumble. | The dryer is the largest hero object in the room. Good glass reads premium immediately. | Glass never becomes mirror-bright, never obscures socks, and shows the lamp reflection at night. | art |
| 8 | Coins Have Weight | Each denomination has its own pitch and decay. A penny is a bright short tick, nickel is duller, dime is highest, quarter is lower and longer. Glass jar impacts add a separate quiet resonance. | Loose change is an audio toy the player will learn by ear. | In a hidden-label test, the quarter is reliably distinguishable from a penny after five minutes of play. | art |
| 9 | The Heap Settles Once | After the dryer spill, let physics run for 450 to 650 ms with control locked, then damp all velocities together. One last sock may slide an inch. Never let the pile jitter forever. | Controlled settling feels intentional and keeps Rapier from advertising itself. | No visible micro-jitter remains two seconds after arrival on target devices. | code-small |
| 10 | Radio Lives on the Shelf | Music is slightly quieter and more mono when the camera faces away from the radio, with a tiny room reverb. Opening a paper menu ducks it 2 dB instead of muting. | Spatial consistency sells the room as a place. | Turning room audio off/on never changes track position, and menus never hard-cut music. | code-small |
| 11 | Three Haptics, No More | Pair confirmed: one tiny click. Ball hits basket: one soft thump. Reunion: two soft clicks separated by 90 ms. No haptic on coins, menus, misses, or every drag. | Restraint makes the few vibrations mean something. | A full Regular Load produces no accidental buzz storm and every haptic maps to exactly one event. | code-small |
| 12 | Tune Cloth, Not Polygons | Give socks slightly different roughness by condition: plain matte, pilled a touch fuzzier, lint with tiny soft breakup, hole with darker inner edge. Keep normal detail broad enough for phone resolution. | The player stares at cloth all game. Material response matters more than mesh density. | At 96 px, condition still reads without shimmering or noisy microtexture. | art |
| 13 | Weather Touches the Room | Rainy window cools the window-side wall and adds moving dim streak reflections; snow brightens the lower room; far lightning briefly raises ambient light by less than 15 percent. | Window unlocks stop being flat pictures and become room moods. | Each animated window changes at least one piece of room lighting without changing sock readability. | code-small |
| 14 | The Drum Has Inertia | When a Load ends its pre-spin, the drum motor cuts first, cloth keeps moving, the drum eases to rest, then the latch releases 180 ms later. | Mechanical sequencing makes the machine feel expensive and heavy. | No door opens while the drum still appears powered; timing is consistent across dryers. | code-small |
| 15 | Sock Ball Squash on Landing | On first basket impact, visually squash the ball 6 percent for 70 ms and rebound once. Physics collider stays unchanged. | Softness reads instantly without cloth simulation. | Slow-motion capture shows one squash and one rebound, never jelly wobble. | code-small |
| 16 | One-Centimeter Camera Parallax | As the thumb moves across menus or the phone tilts slightly, the room camera shifts by a maximum of one virtual centimeter. It stops during active matching. | Tiny depth response makes the fixed room feel dimensional without motion sickness. | A player notices depth when shown side-by-side, but nobody reports the camera 'moving' during play. | code-small |
| 17 | Pocket Finds Arrive Quietly | A found object never opens a popup mid-Load. At the end, the camera holds one beat on the jar or cork board as the object is placed with its own sound, then the normal summary sheet slides in. | The room itself announces the reward. | A find can be understood without text and never interrupts a match. | code-small |
| 18 | Reunion Is Mostly Silence | When a mate returns, ambient audio dips 2 dB, both socks sit beside each other for 1.2 seconds, the Odd Bin lamp warms slightly, then the page arrives if one is due. | Emotional beats get weight from subtraction, not confetti. | No particle burst, fanfare, or screen flash remains in the Reunion sequence. | code-small |
| 19 | The Room Remembers | On return, every selected decor item, radio track position, time-of-day state, cat pose family, and coin-jar remainder is restored before the first rendered frame. | Nothing punctures premium more than a home that visibly resets itself. | Force-close during five different room states and reopen: no default decor flashes on screen. | code-small |
| 20 | Five Store Screenshots That Sell the Actual Game | 1: dryer opening over a beautiful heap, caption FIND THE PAIR. 2: hand-held near-twin socks, caption LOOK CLOSER. 3: ball mid-flight toward a gorgeous basket, caption FOLD. FLICK. THUNK. 4: Odd Bin reunion, caption SOME SOCKS COME BACK LATER. 5: customized room with cat, pocket-find jar, rain window, caption MAKE THE LAUNDRY ROOM YOURS. | These show verb, discernment, physical payoff, emotional hook, and ownership without feature soup. | At phone-store thumbnail size, each screenshot communicates one idea with six words or fewer. | art |


# Lane I: Tomorrow

The answer should not be “claim something.” It should be **unfinished curiosity plus a room that has continuity**. Nothing below expires, breaks, or nags. The player can ignore TUMBLE for six months and come back to a room that is glad to continue.


| Rank | Reason to reopen | What is different / waiting | Why it works without a streak | Build |
| --- | --- | --- | --- | --- |
| 1 | An Unfinished Reunion Thread | The Odd Bin remains the strongest reason to return: after an odd sock enters, its empty mate-shaped space stays visibly outlined in the Bin. No timer, no 'come back tomorrow' copy. The next Load can contain the mate whenever the normal Reunion rules allow. | It creates a remembered question, not an obligation. | code-small |
| 2 | The Room Greets the Actual Hour | Tomorrow morning the room is morning-lit; tomorrow night it is lamp-lit. The clock is correct, the window sky changes, and the cat or second animal is in one of several quiet poses chosen from the time block. | The same room feels freshly inhabited without giving a reward for absence. | code-small |
| 3 | Daily Load as a Named Little Puzzle | Give the existing Daily a dry generated title based on its seed, such as 'Tuesday, Mostly Stripes' or 'The One With Too Many Blue Socks.' It is always available in an archive after the day passes, so nothing is lost. | A daily reason to peek in without a streak or FOMO. | code-small |
| 4 | Pocket-Find Shelf Silhouettes | The pocket-find display shows faint physical empty outlines for sets already started. A player can see that the coat-pocket shadow box is missing one oddly shaped object without being told when it will arrive. | Collection curiosity lives in the room, not a checklist popup. | art |
| 5 | Four Gentle Seasons, Fully Reversible | Add Spring, Summer, Autumn, and Winter room moods keyed to the device month: outside foliage/light shifts, not rewards. A settings toggle can force any season permanently, so there is zero FOMO. | Tomorrow can look subtly different across the year without time-gating content. | code-small |
| 6 | The Radio Was Left On | On return, the radio resumes the same station and shows a tiny changed paper program card for the current time block, such as 'Late Kitchen' or 'Rain Desk.' No unlock is attached. | Continuity makes the room feel like a place the player left, not an app they reopened. | art |
| 7 | The Cat Has Been Busy | The cat can be asleep on the rug, on the shelf, behind the basket, or staring into the dryer when the player returns. It never blocks controls and never carries rewards. | Players reopen to see a living room, not to claim a chest. | code-small |
| 8 | Yesterday's Laundry Stays in the Room | After a session, one tiny detail from the last Load persists until the next: a sock ball on the shelf, the last pocket find newly placed, or the donation bag patch added. Never more than one temporary trace. | The player can point to evidence that they were here yesterday. | code-small |


# Lane J: Tell me what is wrong

These are the places I would push back on the brief itself, ranked by how likely they are to hurt the build.


| Rank | Problem | What is wrong / contradiction | What I would do | Build |
| --- | --- | --- | --- | --- |
| 1 | The Economy Gates Joy Behind Perfection | Quarter income is currently both sparse and conditional while all dryers and hero packs use it. That makes the most exciting content feel connected to failure states rather than ordinary laundry. Lane F fixes income rather than cheapening prices. | Keep the 'care pays more' law, but baseline play must also move the coin jar. | data |
| 2 | Law 7 Conflicts With the Requested Hundredth-Load Find | The brief says rewards are for care, not time served, then explicitly asks what makes the hundredth Load's find worth waiting for. I would break Law 7 exactly once for a zero-power commemorative keepsake at Load 100. No streak, no expiry, no bonus currency. | A milestone can mark a relationship without becoming retention pressure. | data |
| 3 | Thirty Finds Can Break 'Everything Is Visible' | If all 30 tiny objects sit loose on one shelf, the room becomes a flea market and Law 8 loses. Use jars, shallow dishes, shadow boxes, and set-completion rearrangements so every find is physically represented but not equally loud. | Visibility should mean physically present and inspectable, not all shouting at once. | code-small |
| 4 | Dryer Arrival Rules Quietly Change Difficulty | The law says dryers change arrival without making the game easier or harder, but 'bigger' literally changes Load size and one-at-a-time arrival can change memory/search pacing. Normalize the final playable heap before input for cosmetic arrivals, and treat bigger Loads as an explicit mode unlock rather than hidden dryer power. | A dryer should not be secretly optimal. | code-small |
| 5 | The Comfort Line Is Not Defined Yet | Warm Hands, Bigger Basket, Sorting by Feel, Odd Eye, and Knows the Drawer already change difficulty. The new rule I would write is: a comfort may reduce motor or visibility friction, but may not identify the correct twin, change timer/streak math, change payout odds, or alter Daily competitive comparability. | Without a written boundary every cute pocket find becomes a balance argument. | data |
| 6 | Six New Pattern Families Need Seed Versioning | The generator has unused family values, but permanent seeds only stay permanent if old seeds are decoded under a stable mapping. Store a generator version with every sock or guarantee that values 10 through 15 could never have been emitted previously. | Otherwise a future family table change can repaint an old collection, violating the core promise. | code-small |
| 7 | About One Dollar Undersells the Premium Promise | The brief wants a crafted paid game with no ads, a huge collectible set, story, room customization, and ongoing authored content. A $0.99 sticker can signal disposable-app expectations and pushes pressure toward IAP. I would test $2.99 as the launch price before adding any shop behavior. | Price is part of presentation, not only revenue. | data |
| 8 | More Decor Makes the 98-Day Lint Completion Longer | The current 19,590-Lint room target is already about 98 target days. Lane D adds dozens more items. Keep individual decor affordable and stop treating owning every decor item as a normal completion target. The room should be a menu of taste, not a catalog debt. | A cozy decorator should feel choice-rich, not behind. | data |
| 9 | The 75-Reunion Story Ending Has No Stated Cadence | The brief gives Reunion milestones but not how often odd socks appear or mates return. That means nobody can judge whether page 12 is a month away or effectively unreachable. The build should log median Loads per Reunion and set an internal target before launch. | The emotional hook needs measurable pacing even if the player never sees a progress bar. | code-small |
| 10 | The 'Streak Wall Calendar' Fights the No-Streak Law | Even if it is only decor, the word streak strongly implies the exact retention mechanic the brief rejects. Rename it 'Laundry Wall Calendar' or 'Things We Did This Month' unless it truly tracks something else. | Premium tone includes not accidentally borrowing free-to-play vocabulary. | data |
| 11 | Hero Packs Are Not Purely Cosmetic in Practice | Adding sixty highly distinctive socks increases the visual vocabulary a player must learn, while some hero socks may be easier to spot than procedural near-twins. That is fine, but do not call packs difficulty-neutral. Keep hero frequency low enough that a purchased pack does not dilute decoys into easier piles. | Collection variety should not accidentally become an advantage. | code-small |
| 12 | The 96-Pixel Law Needs a Production Test | A written design can still fail at thumbnail size. Add an automated contact sheet that renders every hero sock at 96 px, 64 px, and heap distance beside its nearest-color procedural sock before a build is approved. | This is the cheapest way to protect the best art direction rule in the brief. | code-small |


## The laws I would deliberately break

I would break **Law 7 exactly once** for the hundredth-Load Photo Booth Strip, because Part 4 explicitly asks for a hundredth-Load find and because a zero-power commemorative object is a relationship marker, not a retention lever. It never expires, never asks for consecutive days, and never changes play.

I would also interpret **Law 2 less literally** than “every one of thirty pocket finds must be individually visible at all times.” Every find should physically exist in the room, but jars, dishes, shadow boxes and set displays may contain several objects. Otherwise the room eventually stops looking premium.

I would **not** break the no-advantage rule for paid content, the no-ads rule, the one-thumb rule, the frozen seed fields, or the no-random-paid-reward rule.

# Machine-merge JSON

```json
[
  {
    "lane": "F",
    "rank": 1,
    "kind": "coin",
    "id": "coin-lint-trap",
    "title": "The Lint-Trap Coin",
    "data": {
      "id": "coin-lint-trap",
      "moment": "the lint trap is emptied when a Load ends",
      "sees_and_hears": "the trap slides out; a grey felt of lint lifts; one bright coin sits on top; a clean ceramic-like clink",
      "coins": {
        "penny": 0.35,
        "nickel": 0.3,
        "dime": 0.25,
        "quarter": 0.1
      },
      "how_often": "Every Load. Small 1 draw, Regular 2, Heavy 3, Mountain 4. A Clean Load adds one extra draw.",
      "cents_per_regular_load": 9
    },
    "looks_like": null,
    "why": "Guaranteed, visible laundry logic. It makes every Load produce some real change.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "find",
    "id": "find-half-a-chapstick",
    "title": "Half a Chapstick",
    "data": {
      "id": "find-half-a-chapstick",
      "name": "Half a Chapstick",
      "rarity": "common",
      "flavor": "Survived the wash. Again.",
      "looks_like": "stubby white tube, cap missing, one dent",
      "comes_out": "Can appear from Load 1; drops from a knee sock the first time it is flipped right-side out.",
      "shown": "upright in the first glass pocket-find jar on the display shelf",
      "set": "coat-pocket-of-a-tall-man",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "stubby white tube, cap missing, one dent",
    "why": "The most instantly recognizable pocket-wash artifact.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "money",
    "id": "money-coin-jar-rollup",
    "title": "Keep Lint, Add a Real Coin Jar",
    "data": {
      "model": "coin-jar-rollup",
      "counting": "Pennies, nickels, dimes, and quarters all enter one visible glass coin jar. Every time the jar reaches 25 cents, the coins visibly roll into a paper quarter wrapper and the Quarter counter increases by one. Remainder cents stay in the jar.",
      "lint": "Lint stays. It remains the soft currency for room decor, baskets, radios, ball styles, and trails. Change is for dryers and hero packs.",
      "rules": [
        "Found money is banked immediately when it reaches the jar.",
        "A miss never subtracts found money.",
        "Clean and Spotless add money; they do not gate baseline money.",
        "Coins are never sold for cash."
      ],
      "target_regular_cents": 50
    },
    "looks_like": "a squat clear jar on the shelf, loose copper and silver coins visible, paper quarter rolls stacked beside it",
    "why": "It fixes income while preserving the laundromat fantasy and every existing Quarter price.",
    "cost_to_build": "code-large",
    "confidence": 0.97
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "price",
    "id": "price-keep-quarter-list",
    "title": "Keep the Existing Quarter Prices",
    "data": {
      "recommendation": "keep-current-quarter-prices",
      "dryers": {
        "Avocado Slow Tumble": 8,
        "Laundromat Industrial": 12,
        "Backyard Clothesline": 15,
        "Portal Dryer": 20
      },
      "hero_packs": {
        "Uncle Energy": 10,
        "Gas Station": 10,
        "Fake Merch": 10,
        "Cursed": 10
      },
      "total_quarters": 95,
      "reason": "At a target 50 cents per Regular Load, the problem is income visibility and reliability, not sticker prices."
    },
    "looks_like": null,
    "why": "Repricing would hide the real defect. Fix the faucet, not the measuring cup.",
    "cost_to_build": "data",
    "confidence": 0.94
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "set",
    "id": "set-tall-man-coat",
    "title": "The Coat Pocket of a Tall Man",
    "data": {
      "id": "set-tall-man-coat",
      "name": "The Coat Pocket of a Tall Man",
      "members": [
        "find-half-a-chapstick",
        "find-guitar-pick",
        "find-soft-receipt",
        "find-coat-button",
        "find-coat-check-claim",
        "find-pocket-screw"
      ],
      "completion_visible": "The six objects move from scattered storage into a narrow shadow-box shaped like a coat pocket; a tiny stitched label reads FOUND TOGETHER.",
      "reward": "visual-only"
    },
    "looks_like": "The six objects move from scattered storage into a narrow shadow-box shaped like a coat pocket; a tiny stitched label reads FOUND TOGETHER.",
    "why": "Completion reorganizes real objects in the room instead of awarding an abstract badge.",
    "cost_to_build": "code-small",
    "confidence": 0.91
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "sink",
    "id": "sink-donation-bag",
    "title": "The Donation Bag",
    "data": {
      "id": "sink-donation-bag",
      "name": "The Donation Bag",
      "cost": {
        "lint": 250
      },
      "effect": "Spend 250 Lint to add one folded sock-shaped patch to a canvas donation bag beside the door. The bag never fills; every fifth patch changes the stitched band color."
    },
    "looks_like": "Spend 250 Lint to add one folded sock-shaped patch to a canvas donation bag beside the door. The bag never fills; every fifth patch changes the stitched band color.",
    "why": "An infinite, visible, zero-power sink that turns surplus into a long-term room history.",
    "cost_to_build": "code-small",
    "confidence": 0.87
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "peg",
    "id": "peg-good-light",
    "title": "Good Light",
    "data": {
      "id": "peg-good-light",
      "name": "Good Light",
      "earned_by": {
        "stat": "nightLoads",
        "value": 25
      },
      "comfort": "Adds a clothesline toggle that raises only the folding-table task light after dark. It does not brighten decoys selectively."
    },
    "looks_like": "a labeled wooden clothesline peg with a small stamped icon",
    "why": "Accessibility and atmosphere, not information.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "coin",
    "id": "coin-clean-basket",
    "title": "The Clean-Load Quarter",
    "data": {
      "id": "coin-clean-basket",
      "moment": "the last ball of a Clean Load lands and the basket is empty of misses",
      "sees_and_hears": "a quarter rolls once around the basket rim, drops into the coin jar, and rings against glass",
      "coins": {
        "quarter": 1.0
      },
      "how_often": "Clean Loads only. One quarter at every size. A miss never removes it because it is paid only when the Load is finished clean.",
      "cents_per_regular_load": 13.75
    },
    "looks_like": null,
    "why": "Keeps the old care reward but turns it into a physical event the player cannot miss.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "find",
    "id": "find-guitar-pick",
    "title": "The Guitar Pick",
    "data": {
      "id": "find-guitar-pick",
      "name": "The Guitar Pick",
      "rarity": "uncommon",
      "flavor": "Knows four chords and one very long story.",
      "looks_like": "bright red triangular pick with one chewed corner",
      "comes_out": "Can appear after 3 Loads; pings from the drum lip when the dryer opens.",
      "shown": "clipped to the cork board with a tiny brass tack",
      "set": "coat-pocket-of-a-tall-man",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "bright red triangular pick with one chewed corner",
    "why": "Tiny, graphic, legible, and full of implied personhood.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "set",
    "id": "set-child-was-here",
    "title": "A Child Was Definitely Here",
    "data": {
      "id": "set-child-was-here",
      "name": "A Child Was Definitely Here",
      "members": [
        "find-blue-marble",
        "find-crayon-nub",
        "find-toy-wheel",
        "find-star-backing",
        "find-acorn-cap",
        "find-googly-eye"
      ],
      "completion_visible": "The shelf gains a small school-desk pencil tray; all six objects arrange themselves inside it, with the googly eye stuck to the front.",
      "reward": "visual-only"
    },
    "looks_like": "The shelf gains a small school-desk pencil tray; all six objects arrange themselves inside it, with the googly eye stuck to the front.",
    "why": "Completion reorganizes real objects in the room instead of awarding an abstract badge.",
    "cost_to_build": "code-small",
    "confidence": 0.91
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "sink",
    "id": "sink-fresh-stems",
    "title": "Fresh Stems for the Mug",
    "data": {
      "id": "sink-fresh-stems",
      "name": "Fresh Stems for the Mug",
      "cost": {
        "lint": 80
      },
      "effect": "Buy one chosen stem from six fixed flowers and place it in the current mug. A mug holds three. Replacing a stem costs again; nothing wilts while you are away."
    },
    "looks_like": "Buy one chosen stem from six fixed flowers and place it in the current mug. A mug holds three. Replacing a stem costs again; nothing wilts while you are away.",
    "why": "Repeatable decorating with no fear-of-missing-out clock.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "peg",
    "id": "peg-easy-flip",
    "title": "Sleeves Rolled Up",
    "data": {
      "id": "peg-easy-flip",
      "name": "Sleeves Rolled Up",
      "earned_by": {
        "stat": "flips",
        "value": 100
      },
      "comfort": "The flip gesture can start from anywhere on the held sock instead of only near its cuff."
    },
    "looks_like": "a labeled wooden clothesline peg with a small stamped icon",
    "why": "It removes input fuss after the player has already recognized the sock is inside out.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "coin",
    "id": "coin-drum-lip",
    "title": "Drum-Lip Rattle",
    "data": {
      "id": "coin-drum-lip",
      "moment": "the dryer door opens before the socks spill",
      "sees_and_hears": "two or three coins skate around the steel lip, one falls first, then the socks tumble over it",
      "coins": {
        "penny": 0.45,
        "nickel": 0.3,
        "dime": 0.2,
        "quarter": 0.05
      },
      "how_often": "Every Load. Small 1 draw, Regular 2, Heavy 3, Mountain 4.",
      "cents_per_regular_load": 6
    },
    "looks_like": null,
    "why": "The opening beat immediately tells the player that change now exists.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "find",
    "id": "find-soft-receipt",
    "title": "Receipt Gone Soft",
    "data": {
      "id": "find-soft-receipt",
      "name": "Receipt Gone Soft",
      "rarity": "common",
      "flavor": "The total is now between us and the water.",
      "looks_like": "small grey-white paper curl with one black barcode block blurred into watercolor",
      "comes_out": "Can appear from Load 1; sticks damply to the underside of the last sock lifted from the pile.",
      "shown": "flattened under a little glass paperweight on the shelf",
      "set": "coat-pocket-of-a-tall-man",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "small grey-white paper curl with one black barcode block blurred into watercolor",
    "why": "Exactly the sort of sad little thing laundry produces.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "set",
    "id": "set-night-out",
    "title": "Night Out, Apparently",
    "data": {
      "id": "set-night-out",
      "name": "Night Out, Apparently",
      "members": [
        "find-ticket-stub",
        "find-earring-back",
        "find-paper-wristband",
        "find-mint-wrapper",
        "find-confetti-star",
        "find-photo-strip"
      ],
      "completion_visible": "The cork board gets a narrow warm picture light and the six objects form one little night-out collage under it.",
      "reward": "visual-only"
    },
    "looks_like": "The cork board gets a narrow warm picture light and the six objects form one little night-out collage under it.",
    "why": "Completion reorganizes real objects in the room instead of awarding an abstract badge.",
    "cost_to_build": "code-small",
    "confidence": 0.91
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "sink",
    "id": "sink-table-polish",
    "title": "Table Polish",
    "data": {
      "id": "sink-table-polish",
      "name": "Table Polish",
      "cost": {
        "lint": 60
      },
      "effect": "For the next five Loads, the folding table gets a subtle hand-buffed sheen and slightly richer cloth-on-wood sound. A small tin sits open on the shelf while active."
    },
    "looks_like": "For the next five Loads, the folding table gets a subtle hand-buffed sheen and slightly richer cloth-on-wood sound. A small tin sits open on the shelf while active.",
    "why": "A low-cost cosmetic ritual that makes surplus Lint feel tactile instead of numerical.",
    "cost_to_build": "code-small",
    "confidence": 0.87
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "peg",
    "id": "peg-room-key",
    "title": "Room Key",
    "data": {
      "id": "peg-room-key",
      "name": "Room Key",
      "earned_by": {
        "stat": "cleanLoads",
        "value": 25
      },
      "comfort": "Adds two room-preset hooks beside the door so the player can save and swap two complete decor looks with one tap."
    },
    "looks_like": "a labeled wooden clothesline peg with a small stamped icon",
    "why": "A pure decorating comfort earned by careful play.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "coin",
    "id": "coin-spotless-brass",
    "title": "Spotless Brass",
    "data": {
      "id": "coin-spotless-brass",
      "moment": "a Spotless Laundry Day Load ends",
      "sees_and_hears": "the dryer dial clicks back to zero and a quarter drops from behind it onto the machine top with one sharp ring",
      "coins": {
        "quarter": 1.0
      },
      "how_often": "Spotless Laundry Day Loads only. One quarter at every size.",
      "cents_per_regular_load": 6.25
    },
    "looks_like": null,
    "why": "Preserves the hardest care bonus without making it the only reliable income.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "find",
    "id": "find-coat-button",
    "title": "The Spare Coat Button",
    "data": {
      "id": "find-coat-button",
      "name": "The Spare Coat Button",
      "rarity": "common",
      "flavor": "Was included for a reason nobody remembers.",
      "looks_like": "large dark tortoiseshell four-hole button",
      "comes_out": "Can appear from Load 1; rolls out of a cuff when an inside-out sock is corrected.",
      "shown": "in a shallow ceramic button dish on the shelf",
      "set": "coat-pocket-of-a-tall-man",
      "help": "Unlocks an optional larger tap target for tiny room controls. It never changes socks, shots, timers, or rewards.",
      "help_kind": "comfort"
    },
    "looks_like": "large dark tortoiseshell four-hole button",
    "why": "A real accessibility kindness tied to a plausible found object.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "set",
    "id": "set-useful-washed",
    "title": "Useful Until Washed",
    "data": {
      "id": "set-useful-washed",
      "name": "Useful Until Washed",
      "members": [
        "find-bobby-pin",
        "find-safety-pin",
        "find-tape-bit",
        "find-hair-tie",
        "find-notepad-wad",
        "find-spare-shoelace"
      ],
      "completion_visible": "A small peg rail appears under the shelf and each object hangs from its own hook instead of living in jars.",
      "reward": "visual-only"
    },
    "looks_like": "A small peg rail appears under the shelf and each object hangs from its own hook instead of living in jars.",
    "why": "Completion reorganizes real objects in the room instead of awarding an abstract badge.",
    "cost_to_build": "code-small",
    "confidence": 0.91
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "sink",
    "id": "sink-radio-request",
    "title": "Radio Request Slip",
    "data": {
      "id": "sink-radio-request",
      "name": "Radio Request Slip",
      "cost": {
        "lint": 50
      },
      "effect": "Write one of eight preset deadpan requests on a paper slip beside the radio. The selected station plays its alternate B-side loop for the next Load; the slip remains tucked under the dial afterward."
    },
    "looks_like": "Write one of eight preset deadpan requests on a paper slip beside the radio. The selected station plays its alternate B-side loop for the next Load; the slip remains tucked under the dial afterward.",
    "why": "Repeatable, visible, and entirely mood-based.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "peg",
    "id": "peg-same-again",
    "title": "Same Again",
    "data": {
      "id": "peg-same-again",
      "name": "Same Again",
      "earned_by": {
        "stat": "loads",
        "value": 150
      },
      "comfort": "The end-of-Load sheet gains one large Repeat button that starts the same mode and Load size again."
    },
    "looks_like": "a labeled wooden clothesline peg with a small stamped icon",
    "why": "A veteran convenience, not a gameplay buff.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "F",
    "rank": 5,
    "kind": "coin",
    "id": "coin-all-flips",
    "title": "Every Sock Right-Side Out",
    "data": {
      "id": "coin-all-flips",
      "moment": "the last inside-out sock in the Load is corrected",
      "sees_and_hears": "a dime that was caught in the cuff flips free, spins flat on the table, then slides to the jar",
      "coins": {
        "dime": 1.0
      },
      "how_often": "Once per Load if every inside-out sock was flipped. Small 5¢, Regular 10¢, Heavy 10¢, Mountain 10¢.",
      "cents_per_regular_load": 5
    },
    "looks_like": null,
    "why": "Pays attention and care, not time. It also teaches the inside-out system without a popup.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 5,
    "kind": "find",
    "id": "find-coat-check-claim",
    "title": "Coat Check Claim 47",
    "data": {
      "id": "find-coat-check-claim",
      "name": "Coat Check Claim 47",
      "rarity": "uncommon",
      "flavor": "The coat made it home. The number stayed.",
      "looks_like": "cream paper ticket with a huge black 47 and torn corner",
      "comes_out": "Can appear after 12 Loads; flutters out when a dress sock is pulled from the heap.",
      "shown": "tucked behind the cork board frame",
      "set": "coat-pocket-of-a-tall-man",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "cream paper ticket with a huge black 47 and torn corner",
    "why": "Specific without referencing any real venue.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 5,
    "kind": "set",
    "id": "set-nobody-throws-away",
    "title": "Things Nobody Throws Away",
    "data": {
      "id": "set-nobody-throws-away",
      "name": "Things Nobody Throws Away",
      "members": [
        "find-washer",
        "find-bread-tag",
        "find-smooth-pebble",
        "find-plastic-cap",
        "find-hotel-keycard",
        "find-brass-key"
      ],
      "completion_visible": "A tiny wooden junk drawer appears half-open on the shelf; the finds sit in fitted little compartments, with the brass key hanging from its pull.",
      "reward": "visual-only"
    },
    "looks_like": "A tiny wooden junk drawer appears half-open on the shelf; the finds sit in fitted little compartments, with the brass key hanging from its pull.",
    "why": "Completion reorganizes real objects in the room instead of awarding an abstract badge.",
    "cost_to_build": "code-small",
    "confidence": 0.91
  },
  {
    "lane": "F",
    "rank": 6,
    "kind": "coin",
    "id": "coin-cuff-shake",
    "title": "Cuff Shake",
    "data": {
      "id": "coin-cuff-shake",
      "moment": "an inside-out sock is flipped right-side out",
      "sees_and_hears": "occasionally a tiny coin snaps from the cuff, bounces once, and is caught by the table lip",
      "coins": {
        "penny": 0.55,
        "nickel": 0.3,
        "dime": 0.13,
        "quarter": 0.02
      },
      "how_often": "Per flip, low chance. Cap 1/2/3/4 coin drops for Small/Regular/Heavy/Mountain so large Loads pay more without farming one sock.",
      "cents_per_regular_load": 4
    },
    "looks_like": null,
    "why": "Turns a fussy action into a tiny tactile pleasure without making flips mandatory.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 6,
    "kind": "find",
    "id": "find-pocket-screw",
    "title": "One Tiny Screw",
    "data": {
      "id": "find-pocket-screw",
      "name": "One Tiny Screw",
      "rarity": "rare",
      "flavor": "Definitely important to something. Probably not this.",
      "looks_like": "single silver machine screw with oversized cross slot",
      "comes_out": "Can appear after 25 Loads; found sitting in the lint trap after a Clean Load.",
      "shown": "inside a tiny magnetic dish on the shelf",
      "set": "coat-pocket-of-a-tall-man",
      "help": "Would make Clean Loads 10% more likely to drop a quarter.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "single silver machine screw with oversized cross slot",
    "why": "Funny object, bad power. Reward-rate boosts turn keepsakes into optimization gear.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 7,
    "kind": "coin",
    "id": "coin-under-pile",
    "title": "Under the Last Sock",
    "data": {
      "id": "coin-under-pile",
      "moment": "the final loose sock leaves the folding table",
      "sees_and_hears": "a coin that was hidden under the heap is revealed, the table gives a soft tap, and the coin rolls toward the jar",
      "coins": {
        "penny": 0.3,
        "nickel": 0.35,
        "dime": 0.25,
        "quarter": 0.1
      },
      "how_often": "Small 35%, Regular 55%, Heavy 75%, Mountain 100%.",
      "cents_per_regular_load": 3
    },
    "looks_like": null,
    "why": "Rewards actually finishing the physical cleanup and makes the empty table feel satisfying.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 7,
    "kind": "find",
    "id": "find-blue-marble",
    "title": "The Blue Marble",
    "data": {
      "id": "find-blue-marble",
      "name": "The Blue Marble",
      "rarity": "common",
      "flavor": "Was missing for eleven minutes and blamed everyone.",
      "looks_like": "clear glass marble with one thick cobalt swirl",
      "comes_out": "Can appear from Load 1; rolls from beneath the heap after the first pair is removed.",
      "shown": "in a short glass jar beside the button dish",
      "set": "a-child-was-definitely-here",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "clear glass marble with one thick cobalt swirl",
    "why": "Beautiful glass is a premium little shelf object.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 8,
    "kind": "coin",
    "id": "coin-dryer-seam",
    "title": "The Dryer-Seam Coin",
    "data": {
      "id": "coin-dryer-seam",
      "moment": "a Load starts and the drum makes its first half-turn",
      "sees_and_hears": "a coin stuck in the rubber door seal peels loose, ticks against the drum twice, then drops out after the socks",
      "coins": {
        "penny": 0.4,
        "nickel": 0.3,
        "dime": 0.2,
        "quarter": 0.1
      },
      "how_often": "Small 20%, Regular 40%, Heavy 60%, Mountain 80%.",
      "cents_per_regular_load": 2
    },
    "looks_like": null,
    "why": "A second authentic laundry place for change that adds sound before play begins.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 8,
    "kind": "find",
    "id": "find-crayon-nub",
    "title": "Green Crayon Nub",
    "data": {
      "id": "find-crayon-nub",
      "name": "Green Crayon Nub",
      "rarity": "common",
      "flavor": "Still has one drawing left in it.",
      "looks_like": "short forest-green wax cylinder with wrinkled paper band",
      "comes_out": "Can appear from Load 1; falls from a baby sock when it is matched.",
      "shown": "lying in a tiny enamel tray on the shelf",
      "set": "a-child-was-definitely-here",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "short forest-green wax cylinder with wrinkled paper band",
    "why": "Immediate childhood recognition without needing a brand.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 9,
    "kind": "coin",
    "id": "coin-table-edge",
    "title": "Table-Edge Rescue",
    "data": {
      "id": "coin-table-edge",
      "moment": "a ball that missed is picked up and successfully re-thrown",
      "sees_and_hears": "after the ball lands, a coin nudged by the miss wobbles at the table edge and settles safely into the catch tray",
      "coins": {
        "penny": 0.7,
        "nickel": 0.25,
        "dime": 0.05
      },
      "how_often": "At most once per Load, 20% chance after a recovered miss. No payout is ever removed for the miss itself.",
      "cents_per_regular_load": 1
    },
    "looks_like": null,
    "why": "Makes recovery feel human without paying players to miss on purpose.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 9,
    "kind": "find",
    "id": "find-toy-wheel",
    "title": "A Very Small Wheel",
    "data": {
      "id": "find-toy-wheel",
      "name": "A Very Small Wheel",
      "rarity": "uncommon",
      "flavor": "Its vehicle has moved on without it.",
      "looks_like": "black plastic wheel with a bright yellow hub",
      "comes_out": "Can appear after 8 Loads; clatters twice inside the drum before dropping out.",
      "shown": "propped against the pocket-find jar",
      "set": "a-child-was-definitely-here",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "black plastic wheel with a bright yellow hub",
    "why": "Suggests a whole unseen toy with one simple silhouette.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 10,
    "kind": "coin",
    "id": "coin-big-load-handful",
    "title": "The Heavy-Laundry Handful",
    "data": {
      "id": "coin-big-load-handful",
      "moment": "a Heavy or Mountain Load finishes",
      "sees_and_hears": "the player hears two quick clinks from the drum and a small handful of low-value coins spills into the jar",
      "coins": {
        "penny": 0.45,
        "nickel": 0.35,
        "dime": 0.18,
        "quarter": 0.02
      },
      "how_often": "Heavy: two draws. Mountain: four draws. Small and Regular: none.",
      "cents_per_regular_load": 0
    },
    "looks_like": null,
    "why": "Lets bigger Loads feel materially bigger without multiplying the Clean or Spotless quarter bonuses.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 10,
    "kind": "find",
    "id": "find-star-backing",
    "title": "Sticker Backing Star",
    "data": {
      "id": "find-star-backing",
      "name": "Sticker Backing Star",
      "rarity": "common",
      "flavor": "The good part is on something else now.",
      "looks_like": "white five-point backing paper with rainbow adhesive ghosts",
      "comes_out": "Can appear after 5 Loads; clings to the side of a sock ball before peeling free.",
      "shown": "stuck intentionally to the cork board corner",
      "set": "a-child-was-definitely-here",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "white five-point backing paper with rainbow adhesive ghosts",
    "why": "A tiny domestic fossil.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 11,
    "kind": "find",
    "id": "find-acorn-cap",
    "title": "Acorn Cap Only",
    "data": {
      "id": "find-acorn-cap",
      "name": "Acorn Cap Only",
      "rarity": "uncommon",
      "flavor": "The acorn had other plans.",
      "looks_like": "warm brown textured cap, no nut",
      "comes_out": "Can appear after 15 Loads; drops from a rolled cuff during a flip.",
      "shown": "in the ceramic button dish",
      "set": "a-child-was-definitely-here",
      "help": "Unlocks a one-tap 'favorite this room look' star so the player can save one decor combination.",
      "help_kind": "comfort"
    },
    "looks_like": "warm brown textured cap, no nut",
    "why": "The help is convenience only and the object remains visible.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 12,
    "kind": "find",
    "id": "find-googly-eye",
    "title": "Single Googly Eye",
    "data": {
      "id": "find-googly-eye",
      "name": "Single Googly Eye",
      "rarity": "rare",
      "flavor": "Has been watching the spin cycle professionally.",
      "looks_like": "one large white craft eye with a loose black pupil",
      "comes_out": "Can appear after 30 Loads; is stuck to the inside of the dryer door after a Load.",
      "shown": "stuck to the rim of the glass find jar so it looks outward",
      "set": "a-child-was-definitely-here",
      "help": "Would make a decoy blink once when picked up.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "one large white craft eye with a loose black pupil",
    "why": "That directly identifies decoys and crosses the comfort line.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 13,
    "kind": "find",
    "id": "find-ticket-stub",
    "title": "The Ticket Stub",
    "data": {
      "id": "find-ticket-stub",
      "name": "The Ticket Stub",
      "rarity": "common",
      "flavor": "The show was better than the parking.",
      "looks_like": "faded coral ticket rectangle with two punched circles",
      "comes_out": "Can appear after 10 Loads; slides from under a dress sock near the table edge.",
      "shown": "pinned to the cork board",
      "set": "night-out-apparently",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "faded coral ticket rectangle with two punched circles",
    "why": "A universally legible souvenir with no brand needed.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 14,
    "kind": "find",
    "id": "find-earring-back",
    "title": "One Earring Back",
    "data": {
      "id": "find-earring-back",
      "name": "One Earring Back",
      "rarity": "common",
      "flavor": "Its earring is doing fine somewhere else.",
      "looks_like": "tiny gold butterfly clutch, exaggerated slightly for readability",
      "comes_out": "Can appear after 12 Loads; flashes in the lint trap under the room light.",
      "shown": "inside a tiny clear-lidded compartment on the shelf",
      "set": "night-out-apparently",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "tiny gold butterfly clutch, exaggerated slightly for readability",
    "why": "The scale joke works because everything else is socks and coins.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 15,
    "kind": "find",
    "id": "find-paper-wristband",
    "title": "Paper Wristband",
    "data": {
      "id": "find-paper-wristband",
      "name": "Paper Wristband",
      "rarity": "uncommon",
      "flavor": "Entry granted. Re-entry seems unlikely.",
      "looks_like": "neon orange torn strip with two black hatch marks",
      "comes_out": "Can appear after 20 Loads; peels off a sock ball after it lands in the basket.",
      "shown": "looped around one cork-board tack",
      "set": "night-out-apparently",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "neon orange torn strip with two black hatch marks",
    "why": "Bright, thumbnail-readable, and narratively specific.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 16,
    "kind": "find",
    "id": "find-mint-wrapper",
    "title": "Emergency Mint Wrapper",
    "data": {
      "id": "find-mint-wrapper",
      "name": "Emergency Mint Wrapper",
      "rarity": "common",
      "flavor": "The emergency passed. The wrapper persisted.",
      "looks_like": "small metallic green twist wrapper, flattened",
      "comes_out": "Can appear after 8 Loads; flutters from the dryer door when it opens.",
      "shown": "pressed flat under the cork-board glass",
      "set": "night-out-apparently",
      "help": "Unlocks 'quiet open': skips the two-second room-intro camera drift on repeat sessions.",
      "help_kind": "comfort"
    },
    "looks_like": "small metallic green twist wrapper, flattened",
    "why": "A true convenience toggle with no gameplay consequence.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 17,
    "kind": "find",
    "id": "find-confetti-star",
    "title": "One Foil Star",
    "data": {
      "id": "find-confetti-star",
      "name": "One Foil Star",
      "rarity": "uncommon",
      "flavor": "Stayed for cleanup. Nobody asked it to.",
      "looks_like": "single thumb-sized gold foil star, slightly creased",
      "comes_out": "Can appear after 35 Loads; sticks to the final matched pair of a Spotless Load.",
      "shown": "floating against the back glass of the keepsake jar",
      "set": "night-out-apparently",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "single thumb-sized gold foil star, slightly creased",
    "why": "A restrained bit of sparkle earned by care.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 18,
    "kind": "find",
    "id": "find-photo-strip",
    "title": "Photo Booth Strip, Mostly Gone",
    "data": {
      "id": "find-photo-strip",
      "name": "Photo Booth Strip, Mostly Gone",
      "rarity": "once",
      "flavor": "The water kept the part that mattered.",
      "looks_like": "four-frame black-and-white strip, faces washed pale but shoulders still leaning together",
      "comes_out": "Appears once, on Load 100, tucked inside the last matched pair. No randomness.",
      "shown": "centered beneath the cork board in a narrow black clip frame",
      "set": "night-out-apparently",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "four-frame black-and-white strip, faces washed pale but shoulders still leaning together",
    "why": "The hundredth-Load object should feel like a story, not a stat bonus.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 19,
    "kind": "find",
    "id": "find-bobby-pin",
    "title": "The Bobby Pin",
    "data": {
      "id": "find-bobby-pin",
      "name": "The Bobby Pin",
      "rarity": "common",
      "flavor": "Has escaped every bathroom drawer it ever entered.",
      "looks_like": "oversized black wavy pin silhouette",
      "comes_out": "Can appear from Load 1; is hooked over a crew-sock cuff.",
      "shown": "magneted vertically to the side of the shelf",
      "set": "useful-until-washed",
      "help": "Laundry Day only: lets you park one loose sock on a small table-edge clip while you search. Disabled in Rush and Daily.",
      "help_kind": "comfort"
    },
    "looks_like": "oversized black wavy pin silhouette",
    "why": "It reduces fiddly pile management without solving a match or changing scoring.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 20,
    "kind": "find",
    "id": "find-safety-pin",
    "title": "Closed Safety Pin",
    "data": {
      "id": "find-safety-pin",
      "name": "Closed Safety Pin",
      "rarity": "common",
      "flavor": "Closed before washing. A professional.",
      "looks_like": "large nickel safety pin, firmly shut",
      "comes_out": "Can appear after 5 Loads; rests on top of the lint felt when the trap slides out.",
      "shown": "pinned through a little felt square on the cork board",
      "set": "useful-until-washed",
      "help": "Would keep a selected sock highlighted until its twin is found.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "large nickel safety pin, firmly shut",
    "why": "Persistent highlighting materially reduces the memory/search challenge.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 21,
    "kind": "find",
    "id": "find-tape-bit",
    "title": "Eleven Inches of Tape Measure",
    "data": {
      "id": "find-tape-bit",
      "name": "Eleven Inches of Tape Measure",
      "rarity": "uncommon",
      "flavor": "The remaining inches declined to participate.",
      "looks_like": "short yellow fabric measuring tape curled into a loose S, black marks oversized",
      "comes_out": "Can appear after 20 Loads; uncoils from inside a knee sock when flipped.",
      "shown": "draped over the shelf edge",
      "set": "useful-until-washed",
      "help": "Adds an optional 115% inspection zoom for the sock already in your hand. It never marks the twin.",
      "help_kind": "comfort"
    },
    "looks_like": "short yellow fabric measuring tape curled into a loose S, black marks oversized",
    "why": "Visibility aid only, consistent with Warm Hands.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 22,
    "kind": "find",
    "id": "find-hair-tie",
    "title": "The Hair Tie",
    "data": {
      "id": "find-hair-tie",
      "name": "The Hair Tie",
      "rarity": "common",
      "flavor": "Stretched past dignity, still technically employed.",
      "looks_like": "thick black elastic loop with one fuzzy spot",
      "comes_out": "Can appear after 3 Loads; springs free when a ball style finishes rolling.",
      "shown": "around the neck of the pocket-find jar",
      "set": "useful-until-washed",
      "help": "Remembers the last ball style, basket, radio, and room preset across sessions.",
      "help_kind": "comfort"
    },
    "looks_like": "thick black elastic loop with one fuzzy spot",
    "why": "Pure setup friction reduction.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 23,
    "kind": "find",
    "id": "find-notepad-wad",
    "title": "Three Notes, Now One",
    "data": {
      "id": "find-notepad-wad",
      "name": "Three Notes, Now One",
      "rarity": "uncommon",
      "flavor": "Whatever they said has become very concise.",
      "looks_like": "small pale-blue paper wad with three fused layers",
      "comes_out": "Can appear after 40 Loads; found under the rug corner after a Load.",
      "shown": "pressed in a tiny clear specimen frame",
      "set": "useful-until-washed",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "small pale-blue paper wad with three fused layers",
    "why": "A good wet-paper object with a perfect deadpan premise.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 24,
    "kind": "find",
    "id": "find-spare-shoelace",
    "title": "The Spare Shoelace",
    "data": {
      "id": "find-spare-shoelace",
      "name": "The Spare Shoelace",
      "rarity": "rare",
      "flavor": "Never met the shoe it was promised.",
      "looks_like": "short cream shoelace tied in a single loose bow",
      "comes_out": "Can appear after 50 Loads; snakes out of a Mountain or Heavy pile after the final pair is removed.",
      "shown": "tied around one shelf support",
      "set": "useful-until-washed",
      "help": "Laundry Day only: missed sock balls stop at the near table edge instead of rolling to the floor; the player still must rethrow them.",
      "help_kind": "comfort"
    },
    "looks_like": "short cream shoelace tied in a single loose bow",
    "why": "It removes reach annoyance, not failure.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 25,
    "kind": "find",
    "id": "find-washer",
    "title": "The Washer",
    "data": {
      "id": "find-washer",
      "name": "The Washer",
      "rarity": "common",
      "flavor": "Not the appliance. Somehow less useful.",
      "looks_like": "bright steel ring with a broad center hole",
      "comes_out": "Can appear after 15 Loads; spins like a coin out of the dryer seam.",
      "shown": "in the magnetic parts dish beside the tiny screw",
      "set": "things-nobody-throws-away",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "bright steel ring with a broad center hole",
    "why": "The name lands immediately in a laundry game.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 26,
    "kind": "find",
    "id": "find-bread-tag",
    "title": "Bread Tag, Blue",
    "data": {
      "id": "find-bread-tag",
      "name": "Bread Tag, Blue",
      "rarity": "common",
      "flavor": "No bread has claimed it in weeks.",
      "looks_like": "bright blue square bread clip with one bite-shaped slot",
      "comes_out": "Can appear after 10 Loads; catches briefly on the wicker basket rim after a shot.",
      "shown": "clipped to the rim of the find jar",
      "set": "things-nobody-throws-away",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "bright blue square bread clip with one bite-shaped slot",
    "why": "Tiny mundane objects are the game's natural comedy.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 27,
    "kind": "find",
    "id": "find-smooth-pebble",
    "title": "The Good Pebble",
    "data": {
      "id": "find-smooth-pebble",
      "name": "The Good Pebble",
      "rarity": "uncommon",
      "flavor": "Picked for a reason. The reason remains solid.",
      "looks_like": "flat charcoal oval with one pale quartz stripe",
      "comes_out": "Can appear after 25 Loads; is discovered under the rug when the room resets after a Clean Load.",
      "shown": "on the windowsill by itself",
      "set": "things-nobody-throws-away",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "flat charcoal oval with one pale quartz stripe",
    "why": "Adults recognize the inexplicable good-rock instinct too.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 28,
    "kind": "find",
    "id": "find-plastic-cap",
    "title": "Cap to Something",
    "data": {
      "id": "find-plastic-cap",
      "name": "Cap to Something",
      "rarity": "common",
      "flavor": "Its bottle has entered witness protection.",
      "looks_like": "small bright orange ribbed plastic cap",
      "comes_out": "Can appear after 18 Loads; rattles inside a slipper sock before being shaken free.",
      "shown": "in the ceramic button dish",
      "set": "things-nobody-throws-away",
      "help": "Would add five seconds to Rush once per Load.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "small bright orange ribbed plastic cap",
    "why": "A timer extension is a real performance advantage and would become mandatory.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 29,
    "kind": "find",
    "id": "find-hotel-keycard",
    "title": "Room 214 Keycard",
    "data": {
      "id": "find-hotel-keycard",
      "name": "Room 214 Keycard",
      "rarity": "rare",
      "flavor": "Checkout was at eleven. It missed the meeting.",
      "looks_like": "plain teal card with large cream 214 and one punched corner",
      "comes_out": "Can appear after 60 Loads; slides from beneath the lint trap after a Spotless Load.",
      "shown": "propped against the clock base",
      "set": "things-nobody-throws-away",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "plain teal card with large cream 214 and one punched corner",
    "why": "It implies a whole forgotten trip with one rectangle.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 30,
    "kind": "find",
    "id": "find-brass-key",
    "title": "The Brass Key to Nothing Here",
    "data": {
      "id": "find-brass-key",
      "name": "The Brass Key to Nothing Here",
      "rarity": "once",
      "flavor": "Has remained optimistic about this door.",
      "looks_like": "old brass key with a round bow and three chunky teeth",
      "comes_out": "Can appear once after Load 75, but only after three Clean Loads total; it drops from the drum and lands teeth-first with a heavy ping.",
      "shown": "hung on a red thread from a hook beside the door",
      "set": "things-nobody-throws-away",
      "help": "Would glow when a true twin is under the held sock.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "old brass key with a round bow and three chunky teeth",
    "why": "A twin-locating power is no longer a comfort; it solves the core read.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "A",
    "rank": 1,
    "kind": "pack",
    "id": "pack-pet-hair-fiber",
    "title": "Pet Hair Counts as Fiber",
    "data": {
      "id": "pack-pet-hair-fiber",
      "cat": "pack",
      "name": "Pet Hair Counts as Fiber",
      "pack": "pet-hair-fiber",
      "desc": "The household pets have contributed to the laundry without being asked.",
      "cost": {
        "lint": 0
      },
      "start": true
    },
    "looks_like": null,
    "why": "Cat people, dog people, rabbit people, and anyone who has lint-rolled black clothes five minutes after washing them. This is the one I would ship free.",
    "cost_to_build": "data",
    "confidence": 0.9
  },
  {
    "lane": "A",
    "rank": 2,
    "kind": "hero",
    "id": "hero-orange-cat-at-3-a-m",
    "title": "Orange Cat at 3 A.M.",
    "data": {
      "name": "Orange Cat at 3 A.M.",
      "pack": "pet-hair-fiber",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Has a meeting in the hallway. Attendance required.",
      "source": "pack",
      "design": {
        "body": "#f1c27d",
        "accents": {
          "cat": "#d96b2b",
          "eye": "#f3d34a",
          "night": "#273043"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "an orange cat made from one oval body, circle head, triangle ears and two yellow eye dots standing against a dark crescent doorway"
          }
        ]
      }
    },
    "looks_like": "an orange cat made from one oval body, circle head, triangle ears and two yellow eye dots standing against a dark crescent doorway",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 3,
    "kind": "hero",
    "id": "hero-dog-waiting-by-the-door",
    "title": "Dog Waiting by the Door",
    "data": {
      "name": "Dog Waiting by the Door",
      "pack": "pet-hair-fiber",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Heard a car. Could be yours. Probably yours.",
      "source": "pack",
      "design": {
        "body": "#d9c7ad",
        "accents": {
          "dog": "#7a5238",
          "door": "#6b8f71",
          "collar": "#c94f4f"
        },
        "family": "heelToe",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "ankle",
            "what": "a seated brown dog silhouette, red collar line, beside a tall green rounded-box door"
          }
        ]
      }
    },
    "looks_like": "a seated brown dog silhouette, red collar line, beside a tall green rounded-box door",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 4,
    "kind": "hero",
    "id": "hero-fur-on-fresh-laundry",
    "title": "Fur on Fresh Laundry",
    "data": {
      "name": "Fur on Fresh Laundry",
      "pack": "pet-hair-fiber",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Arrived before the folding was finished.",
      "source": "pack",
      "design": {
        "body": "#22252a",
        "accents": {
          "fur": "#f3e7d2",
          "fur2": "#b7a58e"
        },
        "family": "motifScatter",
        "cuff": "plain rib",
        "heelToe": 0,
        "emblems": [
          {
            "where": "leg",
            "what": "large cream and tan short line segments scattered sparsely like pet hairs on black cloth"
          }
        ]
      }
    },
    "looks_like": "large cream and tan short line segments scattered sparsely like pet hairs on black cloth",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 5,
    "kind": "hero",
    "id": "hero-rabbit-with-one-forbidden-cord",
    "title": "Rabbit With One Forbidden Cord",
    "data": {
      "name": "Rabbit With One Forbidden Cord",
      "pack": "pet-hair-fiber",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Was told no. Heard maybe.",
      "source": "pack",
      "design": {
        "body": "#d9d7d2",
        "accents": {
          "rabbit": "#f5f2ed",
          "cord": "#252525",
          "warning": "#d95d4f"
        },
        "family": "solid",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "white rabbit made from ellipses with long ear shapes beside one black looping cord and a tiny red exclamation mark"
          }
        ]
      }
    },
    "looks_like": "white rabbit made from ellipses with long ear shapes beside one black looping cord and a tiny red exclamation mark",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 6,
    "kind": "hero",
    "id": "hero-aquarium-gravel-collector",
    "title": "Aquarium Gravel Collector",
    "data": {
      "name": "Aquarium Gravel Collector",
      "pack": "pet-hair-fiber",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Carries three pebbles home every single time.",
      "source": "pack",
      "design": {
        "body": "#5ca3a8",
        "accents": {
          "fish": "#f3a44a",
          "gravel": "#756b5a",
          "bubble": "#e8f7f6"
        },
        "family": "gradient",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "one orange fish shape above three big gravel circles and three pale bubble circles"
          }
        ]
      }
    },
    "looks_like": "one orange fish shape above three big gravel circles and three pale bubble circles",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 7,
    "kind": "hero",
    "id": "hero-the-paw-on-your-face",
    "title": "The Paw on Your Face",
    "data": {
      "name": "The Paw on Your Face",
      "pack": "pet-hair-fiber",
      "silhouette": "slipper",
      "rarity": "uncommon",
      "flavor": "Personal space was reviewed and declined.",
      "source": "pack",
      "design": {
        "body": "#efe5d5",
        "accents": {
          "paw": "#7f6b5f",
          "toe": "#c98d8d"
        },
        "family": "solid",
        "cuff": "wide band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "one enormous paw emblem: large rounded pad plus four toe circles, deliberately filling most of the foot"
          }
        ]
      }
    },
    "looks_like": "one enormous paw emblem: large rounded pad plus four toe circles, deliberately filling most of the foot",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 8,
    "kind": "hero",
    "id": "hero-cat-in-the-empty-box",
    "title": "Cat in the Empty Box",
    "data": {
      "name": "Cat in the Empty Box",
      "pack": "pet-hair-fiber",
      "silhouette": "novelty",
      "rarity": "uncommon",
      "flavor": "The box became occupied before it became empty.",
      "source": "pack",
      "design": {
        "body": "#c58b55",
        "accents": {
          "box": "#b97a45",
          "cat": "#333038",
          "eye": "#e8c84a"
        },
        "family": "plaid",
        "cuff": "checker band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "open cardboard box from thick line segments with two dark cat ears and two yellow eye dots peeking over the rim"
          }
        ]
      }
    },
    "looks_like": "open cardboard box from thick line segments with two dark cat ears and two yellow eye dots peeking over the rim",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 9,
    "kind": "hero",
    "id": "hero-bird-watching-you-back",
    "title": "Bird Watching You Back",
    "data": {
      "name": "Bird Watching You Back",
      "pack": "pet-hair-fiber",
      "silhouette": "knee",
      "rarity": "uncommon",
      "flavor": "Has logged you in a very small notebook.",
      "source": "pack",
      "design": {
        "body": "#bfd6c2",
        "accents": {
          "bird": "#385b53",
          "eye": "#f3cf62",
          "branch": "#795b42"
        },
        "family": "fairIsle",
        "cuff": "twin stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "one round dark-green bird on a brown branch with an oversized yellow eye circle"
          }
        ]
      }
    },
    "looks_like": "one round dark-green bird on a brown branch with an oversized yellow eye circle",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 10,
    "kind": "hero",
    "id": "hero-the-good-blanket-spot",
    "title": "The Good Blanket Spot",
    "data": {
      "name": "The Good Blanket Spot",
      "pack": "pet-hair-fiber",
      "silhouette": "slipper",
      "rarity": "rare",
      "flavor": "Warm. Indented. Currently unavailable.",
      "source": "pack",
      "design": {
        "body": "#7d657f",
        "accents": {
          "blanket": "#cdb4d6",
          "pet": "#6a4c5e"
        },
        "family": "chevron",
        "cuff": "scalloped",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "a curled sleeping pet drawn as one spiral oval nestled inside three broad lavender blanket waves"
          }
        ]
      }
    },
    "looks_like": "a curled sleeping pet drawn as one spiral oval nestled inside three broad lavender blanket waves",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 11,
    "kind": "hero",
    "id": "hero-one-white-hair",
    "title": "One White Hair",
    "data": {
      "name": "One White Hair",
      "pack": "pet-hair-fiber",
      "silhouette": "dress",
      "rarity": "rare",
      "flavor": "There is always exactly one.",
      "source": "pack",
      "design": {
        "body": "#15171b",
        "accents": {
          "hair": "#fffdf8"
        },
        "family": "solid",
        "cuff": "plain rib",
        "heelToe": 0,
        "emblems": [
          {
            "where": "leg",
            "what": "one single long white curved line from cuff nearly to ankle, nothing else"
          }
        ]
      }
    },
    "looks_like": "one single long white curved line from cuff nearly to ankle, nothing else",
    "why": "A strong thumbnail read inside Pet Hair Counts as Fiber.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 12,
    "kind": "pack",
    "id": "pack-plant-support",
    "title": "Plant Parent Support Group",
    "data": {
      "id": "pack-plant-support",
      "cat": "pack",
      "name": "Plant Parent Support Group",
      "pack": "plant-support",
      "desc": "Ten socks for people who have opinions about drainage holes.",
      "cost": {
        "quarters": 10
      },
      "start": false
    },
    "looks_like": null,
    "why": "Houseplant collectors, propagation-jar keepers, windowsill gardeners, and people currently apologizing to a fern.",
    "cost_to_build": "data",
    "confidence": 0.9
  },
  {
    "lane": "A",
    "rank": 13,
    "kind": "hero",
    "id": "hero-root-bound-again",
    "title": "Root Bound Again",
    "data": {
      "name": "Root Bound Again",
      "pack": "plant-support",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "The roots have formed a committee.",
      "source": "pack",
      "design": {
        "body": "#d9c6a3",
        "accents": {
          "pot": "#b86b43",
          "root": "#efe4c5",
          "leaf": "#557c52"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "terracotta pot rounded box packed with looping cream root lines and two green leaves escaping sideways"
          }
        ]
      }
    },
    "looks_like": "terracotta pot rounded box packed with looping cream root lines and two green leaves escaping sideways",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 14,
    "kind": "hero",
    "id": "hero-one-new-leaf",
    "title": "One New Leaf",
    "data": {
      "name": "One New Leaf",
      "pack": "plant-support",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Please gather around. Something happened.",
      "source": "pack",
      "design": {
        "body": "#dce6c7",
        "accents": {
          "leaf": "#5d8b57",
          "shine": "#f6f2b8"
        },
        "family": "heelToe",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "ankle",
            "what": "one oversized fresh green leaf shape with a tiny pale shine line"
          }
        ]
      }
    },
    "looks_like": "one oversized fresh green leaf shape with a tiny pale shine line",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 15,
    "kind": "hero",
    "id": "hero-propagation-jar",
    "title": "Propagation Jar",
    "data": {
      "name": "Propagation Jar",
      "pack": "plant-support",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Has lived in water long enough to have plans.",
      "source": "pack",
      "design": {
        "body": "#d8edf0",
        "accents": {
          "glass": "#eef9fa",
          "stem": "#5d8654",
          "root": "#c6a67a"
        },
        "family": "stripe",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "clear jar rounded box with one green stem above and three tan branching root lines below"
          }
        ]
      }
    },
    "looks_like": "clear jar rounded box with one green stem above and three tan branching root lines below",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 16,
    "kind": "hero",
    "id": "hero-fungus-gnat-meeting",
    "title": "Fungus Gnat Meeting",
    "data": {
      "name": "Fungus Gnat Meeting",
      "pack": "plant-support",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Attendance is excellent. Morale is not.",
      "source": "pack",
      "design": {
        "body": "#efe7d0",
        "accents": {
          "gnat": "#2f2e2c",
          "pot": "#ad6c4b"
        },
        "family": "polka",
        "cuff": "dotted band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "small black dot gnats orbiting one plain brown pot, with one dot conspicuously outside the orbit"
          }
        ]
      }
    },
    "looks_like": "small black dot gnats orbiting one plain brown pot, with one dot conspicuously outside the orbit",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 17,
    "kind": "hero",
    "id": "hero-south-window-favorite",
    "title": "South Window Favorite",
    "data": {
      "name": "South Window Favorite",
      "pack": "plant-support",
      "silhouette": "knee",
      "rarity": "common",
      "flavor": "Has been leaning left since February.",
      "source": "pack",
      "design": {
        "body": "#d7e6cf",
        "accents": {
          "leaf": "#487a4d",
          "sun": "#e9bd55",
          "frame": "#f4efe6"
        },
        "family": "gradient",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "tall plant made from stacked leaf ellipses leaning toward a half-sun beside a white window-frame line"
          }
        ]
      }
    },
    "looks_like": "tall plant made from stacked leaf ellipses leaning toward a half-sun beside a white window-frame line",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 18,
    "kind": "hero",
    "id": "hero-the-dramatic-fern",
    "title": "The Dramatic Fern",
    "data": {
      "name": "The Dramatic Fern",
      "pack": "plant-support",
      "silhouette": "novelty",
      "rarity": "uncommon",
      "flavor": "Missed one watering and prepared its estate.",
      "source": "pack",
      "design": {
        "body": "#53765a",
        "accents": {
          "fern": "#b8d5a9",
          "pot": "#ce8b5c"
        },
        "family": "motifScatter",
        "cuff": "scalloped",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "three pale fern fronds drooping hard over a small orange pot"
          }
        ]
      }
    },
    "looks_like": "three pale fern fronds drooping hard over a small orange pot",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 19,
    "kind": "hero",
    "id": "hero-clearance-rack-rescue",
    "title": "Clearance Rack Rescue",
    "data": {
      "name": "Clearance Rack Rescue",
      "pack": "plant-support",
      "silhouette": "crew",
      "rarity": "uncommon",
      "flavor": "Sixty percent off and emotionally expensive.",
      "source": "pack",
      "design": {
        "body": "#efe1c8",
        "accents": {
          "tag": "#e75c62",
          "leaf": "#5f8e5b",
          "pot": "#836b58"
        },
        "family": "plaid",
        "cuff": "checker band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "small green plant beside a giant red sale-tag shape with a punched circle"
          }
        ]
      }
    },
    "looks_like": "small green plant beside a giant red sale-tag shape with a punched circle",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 20,
    "kind": "hero",
    "id": "hero-moss-pole-ambition",
    "title": "Moss Pole Ambition",
    "data": {
      "name": "Moss Pole Ambition",
      "pack": "plant-support",
      "silhouette": "knee",
      "rarity": "uncommon",
      "flavor": "Currently four leaves and a five-foot plan.",
      "source": "pack",
      "design": {
        "body": "#cad5b6",
        "accents": {
          "pole": "#8a6a4c",
          "vine": "#4c7d4a",
          "tie": "#6b9fb7"
        },
        "family": "stripe",
        "cuff": "triple stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "one tall brown pole with a green vine zigzagging upward and two blue tie bands"
          }
        ]
      }
    },
    "looks_like": "one tall brown pole with a green vine zigzagging upward and two blue tie bands",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 21,
    "kind": "hero",
    "id": "hero-bottom-water-club",
    "title": "Bottom Water Club",
    "data": {
      "name": "Bottom Water Club",
      "pack": "plant-support",
      "silhouette": "slipper",
      "rarity": "rare",
      "flavor": "Sits in a bowl and judges top watering.",
      "source": "pack",
      "design": {
        "body": "#b9d6d0",
        "accents": {
          "bowl": "#5d98a1",
          "pot": "#bc7653",
          "water": "#edf8f5"
        },
        "family": "solid",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "terracotta pot nested in a blue bowl, one pale water line visible around the base"
          }
        ]
      }
    },
    "looks_like": "terracotta pot nested in a blue bowl, one pale water line visible around the base",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 22,
    "kind": "hero",
    "id": "hero-vacation-plant-sitter",
    "title": "Vacation Plant Sitter",
    "data": {
      "name": "Vacation Plant Sitter",
      "pack": "plant-support",
      "silhouette": "dress",
      "rarity": "rare",
      "flavor": "Received six pages of instructions and one key.",
      "source": "pack",
      "design": {
        "body": "#f0e7d6",
        "accents": {
          "paper": "#fffdf5",
          "leaf": "#5c8054",
          "check": "#d35d4c"
        },
        "family": "argyle",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "three stacked instruction sheets as rounded boxes, a green leaf, and one red check mark"
          }
        ]
      }
    },
    "looks_like": "three stacked instruction sheets as rounded boxes, a green leaf, and one red check mark",
    "why": "A strong thumbnail read inside Plant Parent Support Group.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 23,
    "kind": "pack",
    "id": "pack-little-treat",
    "title": "The Little Treat Economy",
    "data": {
      "id": "pack-little-treat",
      "cat": "pack",
      "name": "The Little Treat Economy",
      "pack": "little-treat",
      "desc": "Small foods purchased because the day had already happened.",
      "cost": {
        "quarters": 10
      },
      "start": false
    },
    "looks_like": null,
    "why": "Coffee-shop regulars, bakery-window people, snack planners, and grown adults who understand the phrase little treat.",
    "cost_to_build": "data",
    "confidence": 0.9
  },
  {
    "lane": "A",
    "rank": 24,
    "kind": "hero",
    "id": "hero-fancy-coffee-you-were-already-out-for",
    "title": "Fancy Coffee You Were Already Out For",
    "data": {
      "name": "Fancy Coffee You Were Already Out For",
      "pack": "little-treat",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Technically the errand had a coffee shop nearby.",
      "source": "pack",
      "design": {
        "body": "#d8b08a",
        "accents": {
          "cup": "#f5efe3",
          "coffee": "#6b4430",
          "foam": "#fff8ed"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "cream takeaway cup rounded box with brown top ellipse and one white foam spiral"
          }
        ]
      }
    },
    "looks_like": "cream takeaway cup rounded box with brown top ellipse and one white foam spiral",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 25,
    "kind": "hero",
    "id": "hero-emergency-cookie",
    "title": "Emergency Cookie",
    "data": {
      "name": "Emergency Cookie",
      "pack": "little-treat",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "The emergency was four emails.",
      "source": "pack",
      "design": {
        "body": "#e8c98d",
        "accents": {
          "cookie": "#c98a4d",
          "chip": "#4e3529"
        },
        "family": "polka",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "one huge cookie circle with five dark chip dots, one bite-shaped crescent missing"
          }
        ]
      }
    },
    "looks_like": "one huge cookie circle with five dark chip dots, one bite-shaped crescent missing",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 26,
    "kind": "hero",
    "id": "hero-croissant-flake-in-the-car",
    "title": "Croissant Flake in the Car",
    "data": {
      "name": "Croissant Flake in the Car",
      "pack": "little-treat",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Will be discovered during the next vacuuming.",
      "source": "pack",
      "design": {
        "body": "#e8d5b3",
        "accents": {
          "pastry": "#c98c4b",
          "flake": "#f3e4c5"
        },
        "family": "motifScatter",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "one crescent pastry built from three fat curved segments over scattered pale triangular flakes"
          }
        ]
      }
    },
    "looks_like": "one crescent pastry built from three fat curved segments over scattered pale triangular flakes",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 27,
    "kind": "hero",
    "id": "hero-soup-in-the-big-mug",
    "title": "Soup in the Big Mug",
    "data": {
      "name": "Soup in the Big Mug",
      "pack": "little-treat",
      "silhouette": "slipper",
      "rarity": "common",
      "flavor": "Dinner found a handle.",
      "source": "pack",
      "design": {
        "body": "#b55f4a",
        "accents": {
          "mug": "#e3a56f",
          "soup": "#d86f3d",
          "steam": "#f7e8cf"
        },
        "family": "solid",
        "cuff": "wide band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "large orange mug with dark soup ellipse and two white steam curves"
          }
        ]
      }
    },
    "looks_like": "large orange mug with dark soup ellipse and two white steam curves",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 28,
    "kind": "hero",
    "id": "hero-one-square-of-chocolate",
    "title": "One Square of Chocolate",
    "data": {
      "name": "One Square of Chocolate",
      "pack": "little-treat",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Saved for later. Later has arrived.",
      "source": "pack",
      "design": {
        "body": "#5b3b32",
        "accents": {
          "choc": "#7a4b3b",
          "foil": "#d7c6a5"
        },
        "family": "heelToe",
        "cuff": "checker band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "one four-cell chocolate rectangle with a little folded gold foil corner"
          }
        ]
      }
    },
    "looks_like": "one four-cell chocolate rectangle with a little folded gold foil corner",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 29,
    "kind": "hero",
    "id": "hero-sunday-cinnamon-roll",
    "title": "Sunday Cinnamon Roll",
    "data": {
      "name": "Sunday Cinnamon Roll",
      "pack": "little-treat",
      "silhouette": "crew",
      "rarity": "uncommon",
      "flavor": "The middle piece remains a matter of policy.",
      "source": "pack",
      "design": {
        "body": "#e5c69e",
        "accents": {
          "roll": "#c48352",
          "icing": "#fff3dd"
        },
        "family": "gradient",
        "cuff": "scalloped",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "one large cinnamon spiral circle with three thick cream icing drips"
          }
        ]
      }
    },
    "looks_like": "one large cinnamon spiral circle with three thick cream icing drips",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 30,
    "kind": "hero",
    "id": "hero-tiny-spoon-dessert",
    "title": "Tiny Spoon Dessert",
    "data": {
      "name": "Tiny Spoon Dessert",
      "pack": "little-treat",
      "silhouette": "baby",
      "rarity": "uncommon",
      "flavor": "Contains six bites and a surprisingly serious spoon.",
      "source": "pack",
      "design": {
        "body": "#d8c7df",
        "accents": {
          "glass": "#f2edf4",
          "dessert": "#8d6fa7",
          "spoon": "#b8b9bd"
        },
        "family": "stripe",
        "cuff": "dotted band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "small parfait cup with two purple layers and a tall silver spoon line"
          }
        ]
      }
    },
    "looks_like": "small parfait cup with two purple layers and a tall silver spoon line",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 31,
    "kind": "hero",
    "id": "hero-takeout-noodles-at-the-sink",
    "title": "Takeout Noodles at the Sink",
    "data": {
      "name": "Takeout Noodles at the Sink",
      "pack": "little-treat",
      "silhouette": "knee",
      "rarity": "uncommon",
      "flavor": "The table was available. This felt correct.",
      "source": "pack",
      "design": {
        "body": "#efe2bd",
        "accents": {
          "box": "#f7f2e7",
          "noodle": "#d8a34f",
          "chive": "#5c8451"
        },
        "family": "solid",
        "cuff": "triple stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "white folded takeout box shape with three looping gold noodle lines and two green dashes"
          }
        ]
      }
    },
    "looks_like": "white folded takeout box shape with three looping gold noodle lines and two green dashes",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 32,
    "kind": "hero",
    "id": "hero-the-last-good-strawberry",
    "title": "The Last Good Strawberry",
    "data": {
      "name": "The Last Good Strawberry",
      "pack": "little-treat",
      "silhouette": "novelty",
      "rarity": "rare",
      "flavor": "Everyone quietly agreed this one was yours.",
      "source": "pack",
      "design": {
        "body": "#f4d9d4",
        "accents": {
          "berry": "#d94f55",
          "leaf": "#4e7d4d",
          "seed": "#f8d27a"
        },
        "family": "polka",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "one giant red strawberry made from a heart-like polygon, green leaf cap, and five yellow seed dots"
          }
        ]
      },
      "seasonal": "June"
    },
    "looks_like": "one giant red strawberry made from a heart-like polygon, green leaf cap, and five yellow seed dots",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 33,
    "kind": "hero",
    "id": "hero-pie-cooling-unsupervised",
    "title": "Pie Cooling Unsupervised",
    "data": {
      "name": "Pie Cooling Unsupervised",
      "pack": "little-treat",
      "silhouette": "dress",
      "rarity": "rare",
      "flavor": "Has been alone by the window for minutes.",
      "source": "pack",
      "design": {
        "body": "#caa36f",
        "accents": {
          "crust": "#b87844",
          "steam": "#fff0d7",
          "berry": "#76506c"
        },
        "family": "plaid",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "round lattice pie with thick crossing crust lines and two pale steam curves"
          }
        ]
      },
      "seasonal": "November"
    },
    "looks_like": "round lattice pie with thick crossing crust lines and two pale steam curves",
    "why": "A strong thumbnail read inside The Little Treat Economy.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 34,
    "kind": "pack",
    "id": "pack-tiny-hobbies",
    "title": "Tiny Hobbies, Large Feelings",
    "data": {
      "id": "pack-tiny-hobbies",
      "cat": "pack",
      "name": "Tiny Hobbies, Large Feelings",
      "pack": "tiny-hobbies",
      "desc": "The things you do for twenty minutes and think about all week.",
      "cost": {
        "quarters": 10
      },
      "start": false
    },
    "looks_like": null,
    "why": "Readers, makers, birders, gardeners, miniaturists, bakers, thrift hunters, and people with one suspiciously expensive pen.",
    "cost_to_build": "data",
    "confidence": 0.9
  },
  {
    "lane": "A",
    "rank": 35,
    "kind": "hero",
    "id": "hero-book-with-three-bookmarks",
    "title": "Book With Three Bookmarks",
    "data": {
      "name": "Book With Three Bookmarks",
      "pack": "tiny-hobbies",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "None mark the page you are actually on.",
      "source": "pack",
      "design": {
        "body": "#65809b",
        "accents": {
          "book": "#e7d8b7",
          "mark1": "#c95757",
          "mark2": "#d6aa4f",
          "mark3": "#6f9d73"
        },
        "family": "solid",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "open cream book from two rounded boxes with three bright ribbon lines hanging from the bottom"
          }
        ]
      }
    },
    "looks_like": "open cream book from two rounded boxes with three bright ribbon lines hanging from the bottom",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 36,
    "kind": "hero",
    "id": "hero-yarn-you-absolutely-had",
    "title": "Yarn You Absolutely Had",
    "data": {
      "name": "Yarn You Absolutely Had",
      "pack": "tiny-hobbies",
      "silhouette": "knee",
      "rarity": "common",
      "flavor": "Bought because this green was different.",
      "source": "pack",
      "design": {
        "body": "#567d68",
        "accents": {
          "yarn": "#adc6a9",
          "band": "#e5d8bd"
        },
        "family": "fairIsle",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "one pale green yarn ball circle crossed by looping strand lines and a cream paper band"
          }
        ]
      }
    },
    "looks_like": "one pale green yarn ball circle crossed by looping strand lines and a cream paper band",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 37,
    "kind": "hero",
    "id": "hero-paint-water-cup",
    "title": "Paint Water Cup",
    "data": {
      "name": "Paint Water Cup",
      "pack": "tiny-hobbies",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "No longer contains a color with a name.",
      "source": "pack",
      "design": {
        "body": "#d9e2dc",
        "accents": {
          "cup": "#eff3ef",
          "water": "#716f86",
          "brush": "#bf6e4b"
        },
        "family": "gradient",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "white cup with muddy purple water ellipse and two brush line segments leaning outward"
          }
        ]
      }
    },
    "looks_like": "white cup with muddy purple water ellipse and two brush line segments leaning outward",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 38,
    "kind": "hero",
    "id": "hero-bird-list-at-dawn",
    "title": "Bird List at Dawn",
    "data": {
      "name": "Bird List at Dawn",
      "pack": "tiny-hobbies",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Three birds seen. Nine birds confidently heard.",
      "source": "pack",
      "design": {
        "body": "#d7e1d2",
        "accents": {
          "paper": "#f6f1df",
          "bird": "#425d54",
          "check": "#bf5c4d"
        },
        "family": "solid",
        "cuff": "dotted band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "cream checklist rectangle with three dark bird silhouettes and three red check marks"
          }
        ]
      }
    },
    "looks_like": "cream checklist rectangle with three dark bird silhouettes and three red check marks",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 39,
    "kind": "hero",
    "id": "hero-puzzle-piece-in-the-pocket",
    "title": "Puzzle Piece in the Pocket",
    "data": {
      "name": "Puzzle Piece in the Pocket",
      "pack": "tiny-hobbies",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "The box has been accusing everyone.",
      "source": "pack",
      "design": {
        "body": "#d9b8a5",
        "accents": {
          "piece": "#496f93",
          "outline": "#f0e3cf"
        },
        "family": "polka",
        "cuff": "checker band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "ankle",
            "what": "one oversized blue puzzle-piece silhouette outlined in cream"
          }
        ]
      }
    },
    "looks_like": "one oversized blue puzzle-piece silhouette outlined in cream",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 40,
    "kind": "hero",
    "id": "hero-thrift-store-frame",
    "title": "Thrift Store Frame",
    "data": {
      "name": "Thrift Store Frame",
      "pack": "tiny-hobbies",
      "silhouette": "crew",
      "rarity": "uncommon",
      "flavor": "Bought for the frame. Kept the stranger.",
      "source": "pack",
      "design": {
        "body": "#b7885f",
        "accents": {
          "frame": "#d3a869",
          "photo": "#7c8b7a"
        },
        "family": "plaid",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "ornate rectangular frame simplified to thick stepped lines with a tiny green oval portrait inside"
          }
        ]
      }
    },
    "looks_like": "ornate rectangular frame simplified to thick stepped lines with a tiny green oval portrait inside",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 41,
    "kind": "hero",
    "id": "hero-garden-kneeler",
    "title": "Garden Kneeler",
    "data": {
      "name": "Garden Kneeler",
      "pack": "tiny-hobbies",
      "silhouette": "slipper",
      "rarity": "uncommon",
      "flavor": "Has dirt in places dirt found independently.",
      "source": "pack",
      "design": {
        "body": "#708d68",
        "accents": {
          "pad": "#a5bd7c",
          "soil": "#6c4d38",
          "flower": "#d9a04f"
        },
        "family": "heelToe",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "green kneeling pad rounded box with three brown soil dots and one tiny yellow flower"
          }
        ]
      }
    },
    "looks_like": "green kneeling pad rounded box with three brown soil dots and one tiny yellow flower",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 42,
    "kind": "hero",
    "id": "hero-fountain-pen-ink-finger",
    "title": "Fountain Pen Ink Finger",
    "data": {
      "name": "Fountain Pen Ink Finger",
      "pack": "tiny-hobbies",
      "silhouette": "dress",
      "rarity": "uncommon",
      "flavor": "The blue thumb signed nothing.",
      "source": "pack",
      "design": {
        "body": "#e8e3d7",
        "accents": {
          "pen": "#364b6b",
          "ink": "#355f9b",
          "nib": "#b8a56c"
        },
        "family": "stripe",
        "cuff": "twin stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "dark pen line with gold nib polygon beside one large blue fingerprint-like spiral"
          }
        ]
      }
    },
    "looks_like": "dark pen line with gold nib polygon beside one large blue fingerprint-like spiral",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 43,
    "kind": "hero",
    "id": "hero-miniature-chair",
    "title": "Miniature Chair",
    "data": {
      "name": "Miniature Chair",
      "pack": "tiny-hobbies",
      "silhouette": "baby",
      "rarity": "rare",
      "flavor": "Took six hours. Nobody is allowed to sit.",
      "source": "pack",
      "design": {
        "body": "#e0c9a7",
        "accents": {
          "wood": "#8b5e42",
          "cushion": "#8aa1b1"
        },
        "family": "solid",
        "cuff": "scalloped",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "tiny chair built from a blue rounded seat and five brown line segments, centered large"
          }
        ]
      }
    },
    "looks_like": "tiny chair built from a blue rounded seat and five brown line segments, centered large",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 44,
    "kind": "hero",
    "id": "hero-starter-named-tuesday",
    "title": "Starter Named Tuesday",
    "data": {
      "name": "Starter Named Tuesday",
      "pack": "tiny-hobbies",
      "silhouette": "novelty",
      "rarity": "rare",
      "flavor": "Fed regularly despite contributing no rent.",
      "source": "pack",
      "design": {
        "body": "#ede2c8",
        "accents": {
          "jar": "#c9d8d2",
          "starter": "#d2a76c",
          "label": "#f8f2df"
        },
        "family": "chevron",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "glass jar rounded box half full of tan starter with a cream label reading TUE in block marks"
          }
        ]
      }
    },
    "looks_like": "glass jar rounded box half full of tan starter with a cream label reading TUE in block marks",
    "why": "A strong thumbnail read inside Tiny Hobbies, Large Feelings.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 45,
    "kind": "pack",
    "id": "pack-found-1998",
    "title": "Found in 1998",
    "data": {
      "id": "pack-found-1998",
      "cat": "pack",
      "name": "Found in 1998",
      "pack": "found-1998",
      "desc": "A laundry basket from the era of translucent plastic and carpet patterns with confidence.",
      "cost": {
        "quarters": 10
      },
      "start": false
    },
    "looks_like": null,
    "why": "Adults nostalgic for late-90s bedrooms, malls, roller rinks, mix discs, and technology that came in clear plastic.",
    "cost_to_build": "data",
    "confidence": 0.9
  },
  {
    "lane": "A",
    "rank": 46,
    "kind": "hero",
    "id": "hero-translucent-phone-cord",
    "title": "Translucent Phone Cord",
    "data": {
      "name": "Translucent Phone Cord",
      "pack": "found-1998",
      "silhouette": "knee",
      "rarity": "common",
      "flavor": "Reached every room and tangled in all of them.",
      "source": "pack",
      "design": {
        "body": "#a8d7d2",
        "accents": {
          "cord": "#6a9db0",
          "phone": "#d8f0ed"
        },
        "family": "stripe",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "thick teal spiral cord running vertically with one translucent handset made from rounded boxes"
          }
        ]
      }
    },
    "looks_like": "thick teal spiral cord running vertically with one translucent handset made from rounded boxes",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 47,
    "kind": "hero",
    "id": "hero-mix-disc-untitled",
    "title": "Mix Disc, Untitled",
    "data": {
      "name": "Mix Disc, Untitled",
      "pack": "found-1998",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Track seven was the entire reason.",
      "source": "pack",
      "design": {
        "body": "#d9d8d2",
        "accents": {
          "disc": "#c9d7e6",
          "rainbow": "#d99a55",
          "marker": "#3d4147"
        },
        "family": "solid",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "large silver disc circle with small rainbow wedge and black handwritten-looking line marks"
          }
        ]
      }
    },
    "looks_like": "large silver disc circle with small rainbow wedge and black handwritten-looking line marks",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 48,
    "kind": "hero",
    "id": "hero-glow-stars-on-the-ceiling",
    "title": "Glow Stars on the Ceiling",
    "data": {
      "name": "Glow Stars on the Ceiling",
      "pack": "found-1998",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Three are still up there somehow.",
      "source": "pack",
      "design": {
        "body": "#28324e",
        "accents": {
          "star": "#c9e85b",
          "ceiling": "#44506d"
        },
        "family": "motifScatter",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "large acid-green stars scattered sparsely over navy with three brighter stars near cuff"
          }
        ]
      }
    },
    "looks_like": "large acid-green stars scattered sparsely over navy with three brighter stars near cuff",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 49,
    "kind": "hero",
    "id": "hero-gel-pen-constellation",
    "title": "Gel Pen Constellation",
    "data": {
      "name": "Gel Pen Constellation",
      "pack": "found-1998",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "The notebook margin was the main assignment.",
      "source": "pack",
      "design": {
        "body": "#42365f",
        "accents": {
          "pink": "#f17aad",
          "aqua": "#68d0cf",
          "silver": "#d9dbe2"
        },
        "family": "motifScatter",
        "cuff": "dotted band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "pink and aqua dots connected by thin silver line segments into a fake constellation"
          }
        ]
      }
    },
    "looks_like": "pink and aqua dots connected by thin silver line segments into a fake constellation",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 50,
    "kind": "hero",
    "id": "hero-roller-rink-carpet",
    "title": "Roller Rink Carpet",
    "data": {
      "name": "Roller Rink Carpet",
      "pack": "found-1998",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Designed to hide everything except joy.",
      "source": "pack",
      "design": {
        "body": "#25213f",
        "accents": {
          "cyan": "#45c8d2",
          "magenta": "#d95e9d",
          "yellow": "#e8d650"
        },
        "family": "motifScatter",
        "cuff": "checker band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "black-purple field with chunky cyan squiggle lines, magenta triangles and yellow dots"
          }
        ]
      }
    },
    "looks_like": "black-purple field with chunky cyan squiggle lines, magenta triangles and yellow dots",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 51,
    "kind": "hero",
    "id": "hero-inflatable-chair-static",
    "title": "Inflatable Chair Static",
    "data": {
      "name": "Inflatable Chair Static",
      "pack": "found-1998",
      "silhouette": "slipper",
      "rarity": "uncommon",
      "flavor": "Sat once. Stood up carrying the room.",
      "source": "pack",
      "design": {
        "body": "#b7d6e8",
        "accents": {
          "chair": "#79b7d7",
          "static": "#f7f5df"
        },
        "family": "gradient",
        "cuff": "wide band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "clear blue inflatable chair silhouette made from rounded loops with white static zigzags around it"
          }
        ]
      }
    },
    "looks_like": "clear blue inflatable chair silhouette made from rounded loops with white static zigzags around it",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 52,
    "kind": "hero",
    "id": "hero-cassette-rewound-with-pencil",
    "title": "Cassette Rewound With Pencil",
    "data": {
      "name": "Cassette Rewound With Pencil",
      "pack": "found-1998",
      "silhouette": "knee",
      "rarity": "uncommon",
      "flavor": "The pencil knew its assignment.",
      "source": "pack",
      "design": {
        "body": "#d8c8ad",
        "accents": {
          "tape": "#454549",
          "label": "#f2e4bf",
          "pencil": "#d7a94f"
        },
        "family": "plaid",
        "cuff": "triple stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "black cassette rounded box with two reel circles and one diagonal yellow pencil line through a reel"
          }
        ]
      }
    },
    "looks_like": "black cassette rounded box with two reel circles and one diagonal yellow pencil line through a reel",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 53,
    "kind": "hero",
    "id": "hero-computer-room-carpet",
    "title": "Computer Room Carpet",
    "data": {
      "name": "Computer Room Carpet",
      "pack": "found-1998",
      "silhouette": "dress",
      "rarity": "uncommon",
      "flavor": "Every chair wheel knew this exact blue.",
      "source": "pack",
      "design": {
        "body": "#2f4e73",
        "accents": {
          "speck": "#7ca3bf",
          "grid": "#d3a45d"
        },
        "family": "polka",
        "cuff": "plain rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "dark institutional blue with pale blue speckles and occasional mustard grid squares"
          }
        ]
      }
    },
    "looks_like": "dark institutional blue with pale blue speckles and occasional mustard grid squares",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 54,
    "kind": "hero",
    "id": "hero-vending-machine-ring",
    "title": "Vending Machine Ring",
    "data": {
      "name": "Vending Machine Ring",
      "pack": "found-1998",
      "silhouette": "baby",
      "rarity": "rare",
      "flavor": "Cost fifty cents and ruled the afternoon.",
      "source": "pack",
      "design": {
        "body": "#f2c8d5",
        "accents": {
          "ring": "#8c63a6",
          "gem": "#5fc8c7"
        },
        "family": "solid",
        "cuff": "scalloped",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "giant purple plastic ring circle with oversized aqua diamond-shaped gem"
          }
        ]
      }
    },
    "looks_like": "giant purple plastic ring circle with oversized aqua diamond-shaped gem",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 55,
    "kind": "hero",
    "id": "hero-channel-three-snow",
    "title": "Channel Three Snow",
    "data": {
      "name": "Channel Three Snow",
      "pack": "found-1998",
      "silhouette": "novelty",
      "rarity": "rare",
      "flavor": "The console is on. The television disagrees.",
      "source": "pack",
      "design": {
        "body": "#30343a",
        "accents": {
          "snow": "#d8d9d7",
          "scan": "#7b858b"
        },
        "family": "gradient",
        "cuff": "wide band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "dense black-white-grey television snow blocks with three faint horizontal scan lines"
          }
        ]
      }
    },
    "looks_like": "dense black-white-grey television snow blocks with three faint horizontal scan lines",
    "why": "A strong thumbnail read inside Found in 1998.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 56,
    "kind": "pack",
    "id": "pack-local-creature-report",
    "title": "Local Creature Report",
    "data": {
      "id": "pack-local-creature-report",
      "cat": "pack",
      "name": "Local Creature Report",
      "pack": "local-creature-report",
      "desc": "Things seen briefly near roads, water, corn, and somebody's porch light.",
      "cost": {
        "quarters": 10
      },
      "start": false
    },
    "looks_like": null,
    "why": "Cryptid fans, hikers, small-town folklore people, and anyone who has photographed a suspicious shape at dusk.",
    "cost_to_build": "data",
    "confidence": 0.9
  },
  {
    "lane": "A",
    "rank": 57,
    "kind": "hero",
    "id": "hero-porch-camera-blur",
    "title": "Porch Camera Blur",
    "data": {
      "name": "Porch Camera Blur",
      "pack": "local-creature-report",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Moved too fast to become evidence.",
      "source": "pack",
      "design": {
        "body": "#4f5d67",
        "accents": {
          "blur": "#c8d0cd",
          "eye": "#e2c45c"
        },
        "family": "gradient",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "one pale horizontal blur oval with two yellow eye dots and a faint timestamp-like line block"
          }
        ]
      }
    },
    "looks_like": "one pale horizontal blur oval with two yellow eye dots and a faint timestamp-like line block",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 58,
    "kind": "hero",
    "id": "hero-tall-thing-by-the-treeline",
    "title": "Tall Thing by the Treeline",
    "data": {
      "name": "Tall Thing by the Treeline",
      "pack": "local-creature-report",
      "silhouette": "knee",
      "rarity": "common",
      "flavor": "Was a stump until it changed locations.",
      "source": "pack",
      "design": {
        "body": "#38483d",
        "accents": {
          "tree": "#26372e",
          "thing": "#b9b49f"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "dark pine-triangle treeline with one very tall pale narrow oval figure between trunks"
          }
        ]
      }
    },
    "looks_like": "dark pine-triangle treeline with one very tall pale narrow oval figure between trunks",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 59,
    "kind": "hero",
    "id": "hero-lake-neck-at-dusk",
    "title": "Lake Neck at Dusk",
    "data": {
      "name": "Lake Neck at Dusk",
      "pack": "local-creature-report",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Could be a log. The log has posture.",
      "source": "pack",
      "design": {
        "body": "#456d78",
        "accents": {
          "water": "#6f9eaa",
          "neck": "#263e46",
          "sun": "#d99b58"
        },
        "family": "stripe",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "three horizontal water lines, one dark curved neck rising through them, orange half-sun behind"
          }
        ]
      }
    },
    "looks_like": "three horizontal water lines, one dark curved neck rising through them, orange half-sun behind",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 60,
    "kind": "hero",
    "id": "hero-moth-at-the-streetlight",
    "title": "Moth at the Streetlight",
    "data": {
      "name": "Moth at the Streetlight",
      "pack": "local-creature-report",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Much larger in memory.",
      "source": "pack",
      "design": {
        "body": "#2e3344",
        "accents": {
          "moth": "#d5c7a1",
          "lamp": "#e8cb73"
        },
        "family": "solid",
        "cuff": "dotted band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "large tan moth made from four wing polygons circling one yellow lamp circle"
          }
        ]
      }
    },
    "looks_like": "large tan moth made from four wing polygons circling one yellow lamp circle",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 61,
    "kind": "hero",
    "id": "hero-three-toed-mud-print",
    "title": "Three-Toed Mud Print",
    "data": {
      "name": "Three-Toed Mud Print",
      "pack": "local-creature-report",
      "silhouette": "slipper",
      "rarity": "common",
      "flavor": "The fourth toe declined comment.",
      "source": "pack",
      "design": {
        "body": "#8a765e",
        "accents": {
          "mud": "#5f4f3e",
          "print": "#d7c4a3"
        },
        "family": "heelToe",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "one huge dark footprint with three long toe ovals and a broad heel pad"
          }
        ]
      }
    },
    "looks_like": "one huge dark footprint with three long toe ovals and a broad heel pad",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 62,
    "kind": "hero",
    "id": "hero-cornfield-eyes",
    "title": "Cornfield Eyes",
    "data": {
      "name": "Cornfield Eyes",
      "pack": "local-creature-report",
      "silhouette": "crew",
      "rarity": "uncommon",
      "flavor": "The corn is not known for eye contact.",
      "source": "pack",
      "design": {
        "body": "#c2a94e",
        "accents": {
          "corn": "#7e8a3e",
          "eye": "#f3d85a",
          "pupil": "#252525"
        },
        "family": "fairIsle",
        "cuff": "checker band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "vertical green corn stalk lines with one pair of bright yellow eye circles between them"
          }
        ]
      }
    },
    "looks_like": "vertical green corn stalk lines with one pair of bright yellow eye circles between them",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 63,
    "kind": "hero",
    "id": "hero-winged-shape-over-the-bridge",
    "title": "Winged Shape Over the Bridge",
    "data": {
      "name": "Winged Shape Over the Bridge",
      "pack": "local-creature-report",
      "silhouette": "dress",
      "rarity": "uncommon",
      "flavor": "Traffic slowed. Nobody discussed why.",
      "source": "pack",
      "design": {
        "body": "#434857",
        "accents": {
          "bridge": "#8a7e70",
          "wing": "#272a32",
          "light": "#e7b95c"
        },
        "family": "chevron",
        "cuff": "triple stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "grey bridge line with two yellow lamp dots and one black wide-wing silhouette overhead"
          }
        ]
      }
    },
    "looks_like": "grey bridge line with two yellow lamp dots and one black wide-wing silhouette overhead",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 64,
    "kind": "hero",
    "id": "hero-antlers-behind-the-shed",
    "title": "Antlers Behind the Shed",
    "data": {
      "name": "Antlers Behind the Shed",
      "pack": "local-creature-report",
      "silhouette": "knee",
      "rarity": "uncommon",
      "flavor": "Only the antlers stayed for the photograph.",
      "source": "pack",
      "design": {
        "body": "#6d735f",
        "accents": {
          "shed": "#8a6048",
          "antler": "#d8cfb4"
        },
        "family": "plaid",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "small brown shed rectangle with two giant pale branching antler line shapes rising behind it"
          }
        ]
      }
    },
    "looks_like": "small brown shed rectangle with two giant pale branching antler line shapes rising behind it",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 65,
    "kind": "hero",
    "id": "hero-something-in-the-culvert",
    "title": "Something in the Culvert",
    "data": {
      "name": "Something in the Culvert",
      "pack": "local-creature-report",
      "silhouette": "novelty",
      "rarity": "rare",
      "flavor": "Politely waited for the headlights to pass.",
      "source": "pack",
      "design": {
        "body": "#4a4e50",
        "accents": {
          "pipe": "#858b88",
          "eye": "#e4c35f",
          "water": "#617d86"
        },
        "family": "solid",
        "cuff": "wide band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "large grey culvert circle with two yellow eye dots deep inside and one blue water line"
          }
        ]
      }
    },
    "looks_like": "large grey culvert circle with two yellow eye dots deep inside and one blue water line",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 66,
    "kind": "hero",
    "id": "hero-snowbank-that-blinked",
    "title": "Snowbank That Blinked",
    "data": {
      "name": "Snowbank That Blinked",
      "pack": "local-creature-report",
      "silhouette": "slipper",
      "rarity": "rare",
      "flavor": "The second blink felt unnecessarily personal.",
      "source": "pack",
      "design": {
        "body": "#e7ece9",
        "accents": {
          "shadow": "#9aabb0",
          "eye": "#3d4140"
        },
        "family": "gradient",
        "cuff": "scalloped",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "soft pale snow mound made from overlapping ellipses with two tiny dark eyes barely visible"
          }
        ]
      },
      "seasonal": "January"
    },
    "looks_like": "soft pale snow mound made from overlapping ellipses with two tiny dark eyes barely visible",
    "why": "A strong thumbnail read inside Local Creature Report.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "B",
    "rank": 1,
    "kind": "family",
    "id": "family-windowpane",
    "title": "Windowpane",
    "data": {
      "id": "family-windowpane",
      "name": "Windowpane",
      "draw": "Draw 2 to 4 vertical line bands and 2 to 4 horizontal bands. `stripeRhythm` chooses spacing and which crossings get a tiny dot. Palette supplies base, vertical, horizontal, and crossing colors.",
      "difference_rule": "Twins share exact line counts, spacing, and crossing dots. Seeds can differ by one extra vertical line, shifted spacing, or a different crossing-dot cadence.",
      "decoy_rule": "Same palette and grid, but one vertical line is one cell closer to its neighbor. It reads identical in the heap and wrong in the hand."
    },
    "looks_like": "A quiet field crossed by very thin vertical and horizontal lines, making large unequal rectangles.",
    "why": "Excellent near-twin geometry at 96 px without looking like existing plaid because the cells are large and mostly empty.",
    "cost_to_build": "code-small",
    "confidence": 0.9
  },
  {
    "lane": "B",
    "rank": 2,
    "kind": "family",
    "id": "family-heather-dash",
    "title": "Heather Dash",
    "data": {
      "id": "family-heather-dash",
      "name": "Heather Dash",
      "draw": "Scatter short 45-degree line segments in two accent colors on a base. `stripeRhythm` controls dash length and clustering in broad bands rather than true stripes.",
      "difference_rule": "Seeds vary dash angle, band density, and whether clusters favor cuff, ankle, or foot.",
      "decoy_rule": "Same colors and density, but the dash angle leans the opposite way or one broad band is shifted downward."
    },
    "looks_like": "A solid sock with sparse two-color micro-dashes, like knitted heather enlarged just enough to read.",
    "why": "Adds a believable textile family that is calm enough for cozy piles and good for subtle decoys.",
    "cost_to_build": "code-small",
    "confidence": 0.9
  },
  {
    "lane": "B",
    "rank": 3,
    "kind": "family",
    "id": "family-colorblock-step",
    "title": "Stepped Colorblock",
    "data": {
      "id": "family-colorblock-step",
      "name": "Stepped Colorblock",
      "draw": "Use large rectangles/polygons with no outlines. `stripeRhythm` chooses step width and whether the final block lands at ankle or top of foot.",
      "difference_rule": "Seeds vary block order, step direction, and block width while keeping the same palette.",
      "decoy_rule": "Same colors in the same order, but the middle step is one unit taller or mirrored."
    },
    "looks_like": "Three to five big flat color blocks that stair-step diagonally down the leg into the foot.",
    "why": "Bold enough for thumbnails and naturally produces fair decoys that differ by one structural decision.",
    "cost_to_build": "code-small",
    "confidence": 0.9
  },
  {
    "lane": "B",
    "rank": 4,
    "kind": "family",
    "id": "family-pinstripe",
    "title": "Pinstripe",
    "data": {
      "id": "family-pinstripe",
      "name": "Pinstripe",
      "draw": "Repeat 1-pixel-equivalent vertical lines around the sock. `stripeRhythm` determines single-single-double cadence and spacing.",
      "difference_rule": "Seeds vary cadence, line width, and whether the double line repeats every third, fourth, or fifth interval.",
      "decoy_rule": "Same palette and spacing, but double lines occur one interval earlier."
    },
    "looks_like": "Very thin vertical stripes with occasional doubled lines, like a tiny old shirt fabric.",
    "why": "Distinct from horizontal stripe and extremely readable when the sock is rotated in hand.",
    "cost_to_build": "code-small",
    "confidence": 0.9
  },
  {
    "lane": "B",
    "rank": 5,
    "kind": "family",
    "id": "family-confetti-bars",
    "title": "Confetti Bars",
    "data": {
      "id": "family-confetti-bars",
      "name": "Confetti Bars",
      "draw": "Scatter only thick line segments, never stock motifs. `stripeRhythm` selects ratio of horizontal to vertical bars and their length buckets.",
      "difference_rule": "Seeds vary bar orientation ratio, density, and two accent colors.",
      "decoy_rule": "Same colors and density, but the horizontal-to-vertical ratio is reversed."
    },
    "looks_like": "Short horizontal and vertical bars scattered on a plain field, chunkier and more geometric than motif scatter.",
    "why": "Uses only primitive lines, reads cleanly, and does not consume a frozen motif.",
    "cost_to_build": "code-small",
    "confidence": 0.9
  },
  {
    "lane": "B",
    "rank": 6,
    "kind": "family",
    "id": "family-ladder",
    "title": "Ladder Knit",
    "data": {
      "id": "family-ladder",
      "name": "Ladder Knit",
      "draw": "Build 2 to 5 ladder columns from line segments. `stripeRhythm` controls rung spacing and whether adjacent ladders are offset half a rung.",
      "difference_rule": "Seeds vary number of ladders, rung spacing, and offset pattern.",
      "decoy_rule": "Same ladders and palette, but one column's rungs are offset by half a step."
    },
    "looks_like": "Repeating paired vertical rails joined by short rungs, spaced like a simple knit diagram.",
    "why": "A fresh structured family that creates strong decoys without introducing any new motif art.",
    "cost_to_build": "code-small",
    "confidence": 0.9
  },
  {
    "lane": "C",
    "rank": 1,
    "kind": "dryer",
    "id": "dryer-hotel-cart",
    "title": "Hotel Laundry Cart",
    "data": {
      "id": "dryer-hotel-cart",
      "cat": "dryer",
      "name": "Hotel Laundry Cart",
      "desc": "The cart rolls six inches forward, tips its canvas mouth, and the entire randomized Load slumps onto the table in one soft avalanche.",
      "cost": {
        "quarters": 14
      },
      "start": false,
      "look": {
        "model": "hotel-cart",
        "color": "#d8d2c7",
        "loads": "cartDump"
      }
    },
    "looks_like": "a tall cream canvas laundry cart on a dark metal X-frame, parked where the dryer normally sits",
    "why": "The most different arrival silhouette with no sorting advantage because the final heap uses the same scatter. Sound: rubber caster squeak, canvas creak, then one deep cloth whomp",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "C",
    "rank": 2,
    "kind": "dryer",
    "id": "dryer-laundry-chute",
    "title": "Apartment Laundry Chute",
    "data": {
      "id": "dryer-laundry-chute",
      "cat": "dryer",
      "name": "Apartment Laundry Chute",
      "desc": "The flap opens and the Load drops in four quick randomized bursts, then physics settles the whole heap before control begins.",
      "cost": {
        "quarters": 12
      },
      "start": false,
      "look": {
        "model": "chute",
        "color": "#b8b1a5",
        "loads": "chuteBursts"
      }
    },
    "looks_like": "a painted metal wall chute with a square flap, little dents, and a brass PULL plate",
    "why": "Great sound and anticipation, while input begins only after the same final heap settle. Sound: metal flap clack, three hollow chute thumps, cloth landing softly",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "C",
    "rank": 3,
    "kind": "dryer",
    "id": "dryer-woodgrain-78",
    "title": "Woodgrain 1978",
    "data": {
      "id": "dryer-woodgrain-78",
      "cat": "dryer",
      "name": "Woodgrain 1978",
      "desc": "Exactly the Standard Dryer tumble, but slower-looking drum motion and a square door reveal.",
      "cost": {
        "quarters": 8
      },
      "start": false,
      "look": {
        "model": "woodgrain",
        "color": "#9a724c",
        "loads": "regular"
      }
    },
    "looks_like": "cream enamel dryer with a fake walnut control strip, square door, and one amber pilot light",
    "why": "Cheap to build, huge personality, perfect with the existing avocado machine. Sound: heavy mechanical timer tick, low motor, firm door latch",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "C",
    "rank": 4,
    "kind": "dryer",
    "id": "dryer-enamel-tub",
    "title": "Porcelain Spin Tub",
    "data": {
      "id": "dryer-enamel-tub",
      "cat": "dryer",
      "name": "Porcelain Spin Tub",
      "desc": "The inner drum rises like an elevator, tilts once, and pours the randomized socks onto the table; control starts after normal settling.",
      "cost": {
        "quarters": 16
      },
      "start": false,
      "look": {
        "model": "spin-tub",
        "color": "#e8e4d9",
        "loads": "tubLift"
      }
    },
    "looks_like": "a round white enamel wash tub with navy rim, mounted on a squat mint base",
    "why": "A premium mechanical reveal that feels domestic rather than sci-fi. Sound: ceramic clink, belt whirr, then a hollow enamel bonk",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "C",
    "rank": 5,
    "kind": "dryer",
    "id": "dryer-stack-unit",
    "title": "Upstairs Stack Unit",
    "data": {
      "id": "dryer-stack-unit",
      "cat": "dryer",
      "name": "Upstairs Stack Unit",
      "desc": "Old regular behavior from the upper round door; the higher origin gives the fall more theater but the pile is normalized before play.",
      "cost": {
        "quarters": 10
      },
      "start": false,
      "look": {
        "model": "stacked",
        "color": "#ecebe5",
        "loads": "regular"
      }
    },
    "looks_like": "a narrow stacked washer-dryer with round black glass and one slightly crooked instruction sticker",
    "why": "Very recognizable apartment-life object and mostly an art swap. Sound: high door thunk, soft drum brake, socks pattering down",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "C",
    "rank": 6,
    "kind": "dryer",
    "id": "dryer-radiator-rack",
    "title": "Radiator Drying Rack",
    "data": {
      "id": "dryer-radiator-rack",
      "cat": "dryer",
      "name": "Radiator Drying Rack",
      "desc": "Reuses Backyard Clothesline behavior: socks come down one at a time, but each slides from a warm wooden rail instead of a peg.",
      "cost": {
        "quarters": 15
      },
      "start": false,
      "look": {
        "model": "radiator-rack",
        "color": "#d8c4a2",
        "loads": "oneAtATime"
      }
    },
    "looks_like": "old cast-iron radiator with a folding wooden rack above it and socks draped over parallel rails",
    "why": "A cozy indoor answer to the clothesline with almost no new behavior code. Sound: radiator ping, tiny wood tap, soft sock flop",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "C",
    "rank": 7,
    "kind": "dryer",
    "id": "dryer-laundromat-round",
    "title": "Corner Laundromat Round-Door",
    "data": {
      "id": "dryer-laundromat-round",
      "cat": "dryer",
      "name": "Corner Laundromat Round-Door",
      "desc": "Regular spill, but the big glass door swings wide enough to frame the whole heap before it drops.",
      "cost": {
        "quarters": 11
      },
      "start": false,
      "look": {
        "model": "round-commercial",
        "color": "#e2d85f",
        "loads": "regular"
      }
    },
    "looks_like": "yellow enamel commercial front-loader with a huge convex glass porthole and chunky chrome latch",
    "why": "A strong room centerpiece that makes the coin economy feel native. Sound: coin-door clunk, stainless latch, resonant drum stop",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "C",
    "rank": 8,
    "kind": "dryer",
    "id": "dryer-wicker-warmer",
    "title": "The Airing Cupboard",
    "data": {
      "id": "dryer-wicker-warmer",
      "cat": "dryer",
      "name": "The Airing Cupboard",
      "desc": "All socks begin randomly distributed across three shelves; the shelves tilt together and sweep them into the same randomized table heap before play starts.",
      "cost": {
        "quarters": 18
      },
      "start": false,
      "look": {
        "model": "airing-cupboard",
        "color": "#a88a63",
        "loads": "shelfSweep"
      }
    },
    "looks_like": "a shallow wooden cupboard with slatted doors and three warm linen shelves",
    "why": "Feels expensive and cozy, but needs more animation than the higher-ranked options. Sound: two wooden door clicks, linen rustle, three gentle shelf taps",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "rug-checker-lino",
    "title": "Checkerboard Linoleum Rug",
    "data": {
      "id": "decor-rug-checker-lino",
      "cat": "decor",
      "name": "Checkerboard Linoleum Rug",
      "desc": "A cream-and-charcoal checker rug pretending to be a kitchen floor.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "checker-lino",
        "color": "#f1eadc",
        "color2": "#2f3030"
      }
    },
    "looks_like": "A cream-and-charcoal checker rug pretending to be a kitchen floor.",
    "why": "The boldest possible room color block while still feeling domestic.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "rug-wavy-motel",
    "title": "Wavy Motel Carpet",
    "data": {
      "id": "decor-rug-wavy-motel",
      "cat": "decor",
      "name": "Wavy Motel Carpet",
      "desc": "Deep blue rug with broad rust and tan waves, slightly too confident.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "wavy-motel",
        "color": "#3f5069",
        "color2": "#c98f58"
      }
    },
    "looks_like": "Deep blue rug with broad rust and tan waves, slightly too confident.",
    "why": "A nostalgic statement rug that screenshots beautifully.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "rug-pressed-flower",
    "title": "Pressed Flower Rug",
    "data": {
      "id": "decor-rug-pressed-flower",
      "cat": "decor",
      "name": "Pressed Flower Rug",
      "desc": "Warm linen rug with large flattened leaf and flower silhouettes.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "pressed-flower",
        "color": "#e8dcc2",
        "color2": "#8a9b6d"
      }
    },
    "looks_like": "Warm linen rug with large flattened leaf and flower silhouettes.",
    "why": "Quiet botanical without competing with sock patterns.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "rug-library-runner",
    "title": "Library Runner",
    "data": {
      "id": "decor-rug-library-runner",
      "cat": "decor",
      "name": "Library Runner",
      "desc": "Long faded burgundy runner with a narrow gold border and worn center path.",
      "cost": {
        "lint": 250
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "library-runner",
        "color": "#6a3e32",
        "color2": "#d1a66d"
      }
    },
    "looks_like": "Long faded burgundy runner with a narrow gold border and worn center path.",
    "why": "Makes the room feel lived in and older instantly.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "rug-picnic-blanket",
    "title": "Picnic Blanket Rug",
    "data": {
      "id": "decor-rug-picnic-blanket",
      "cat": "decor",
      "name": "Picnic Blanket Rug",
      "desc": "Soft cream and brick-red gingham with one imperfect folded corner.",
      "cost": {
        "lint": 210
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "picnic-blanket",
        "color": "#e9d9b9",
        "color2": "#b8695e"
      }
    },
    "looks_like": "Soft cream and brick-red gingham with one imperfect folded corner.",
    "why": "Recognizable cozy color at a glance.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "rug-storm-cloud",
    "title": "Storm Cloud Oval",
    "data": {
      "id": "decor-rug-storm-cloud",
      "cat": "decor",
      "name": "Storm Cloud Oval",
      "desc": "Oval grey-blue rug with one pale cloud-shaped center field.",
      "cost": {
        "lint": 230
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "storm-cloud",
        "color": "#7f8c96",
        "color2": "#d8e0e2"
      }
    },
    "looks_like": "Oval grey-blue rug with one pale cloud-shaped center field.",
    "why": "Pairs beautifully with rainy windows without being seasonal.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 7,
    "kind": "decor",
    "id": "rug-braided-spectrum",
    "title": "Braided Spectrum",
    "data": {
      "id": "decor-rug-braided-spectrum",
      "cat": "decor",
      "name": "Braided Spectrum",
      "desc": "Braided oval with muted clay, moss, mustard, blue, and cream rings.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "braided-spectrum",
        "color": "#d7a56e",
        "color2": "#6f8e80"
      }
    },
    "looks_like": "Braided oval with muted clay, moss, mustard, blue, and cream rings.",
    "why": "A rainbow idea softened into grown-up room decor.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 8,
    "kind": "decor",
    "id": "rug-night-garden",
    "title": "Night Garden",
    "data": {
      "id": "decor-rug-night-garden",
      "cat": "decor",
      "name": "Night Garden",
      "desc": "Dark green rug with oversized simple gold leaf silhouettes around the edge.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "night-garden",
        "color": "#283d38",
        "color2": "#d6b96a"
      }
    },
    "looks_like": "Dark green rug with oversized simple gold leaf silhouettes around the edge.",
    "why": "Premium-looking contrast under warm evening light.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 9,
    "kind": "decor",
    "id": "rug-brown-plaid",
    "title": "Brown Plaid Rug",
    "data": {
      "id": "decor-rug-brown-plaid",
      "cat": "decor",
      "name": "Brown Plaid Rug",
      "desc": "Low-contrast brown, tan, and cream plaid, like a blanket inherited from someone practical.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "brown-plaid",
        "color": "#7f6048",
        "color2": "#c6a47e"
      }
    },
    "looks_like": "Low-contrast brown, tan, and cream plaid, like a blanket inherited from someone practical.",
    "why": "A calm grounding option for players who hate loud decor.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 10,
    "kind": "decor",
    "id": "rug-moon-runner",
    "title": "Moon Phase Runner",
    "data": {
      "id": "decor-rug-moon-runner",
      "cat": "decor",
      "name": "Moon Phase Runner",
      "desc": "Navy runner with seven cream moon circles marching down the center.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "moon-runner",
        "color": "#34374a",
        "color2": "#ded7c6"
      }
    },
    "looks_like": "Navy runner with seven cream moon circles marching down the center.",
    "why": "Graphic, adult, and easy to read from the fixed camera.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 11,
    "kind": "decor",
    "id": "rug-daisy-chain",
    "title": "Big Daisy Rug",
    "data": {
      "id": "decor-rug-daisy-chain",
      "cat": "decor",
      "name": "Big Daisy Rug",
      "desc": "Mustard field with six oversized cream daisies and dark centers.",
      "cost": {
        "lint": 230
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "big-daisy",
        "color": "#d8c997",
        "color2": "#f2e8d0"
      }
    },
    "looks_like": "Mustard field with six oversized cream daisies and dark centers.",
    "why": "Cheerful without needing tiny detail.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 12,
    "kind": "decor",
    "id": "rug-laundry-tags",
    "title": "Care Label Rug",
    "data": {
      "id": "decor-rug-laundry-tags",
      "cat": "decor",
      "name": "Care Label Rug",
      "desc": "Off-white rug printed with giant abstract care-symbol boxes and lines, no real text.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "care-label",
        "color": "#ece8df",
        "color2": "#69727a"
      }
    },
    "looks_like": "Off-white rug printed with giant abstract care-symbol boxes and lines, no real text.",
    "why": "Turns laundry iconography into a bold graphic without becoming a joke prop.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 13,
    "kind": "decor",
    "id": "window-morning-fog",
    "title": "Morning Fog Window",
    "data": {
      "id": "decor-window-morning-fog",
      "cat": "decor",
      "name": "Morning Fog Window",
      "desc": "Pale fog beyond the glass; dark tree trunks appear and fade very slowly.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "morning-fog",
        "color": "#c9d4d2",
        "color2": "#8b9d98"
      }
    },
    "looks_like": "Pale fog beyond the glass; dark tree trunks appear and fade very slowly.",
    "why": "Movement is nearly invisible until you notice it.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 14,
    "kind": "decor",
    "id": "window-autumn-rain",
    "title": "October Rain Window",
    "data": {
      "id": "decor-window-autumn-rain",
      "cat": "decor",
      "name": "October Rain Window",
      "desc": "Amber leaves stuck to wet glass while rain threads down outside.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "autumn-rain",
        "color": "#9b866b",
        "color2": "#c5a45e"
      },
      "seasonal": "October"
    },
    "looks_like": "Amber leaves stuck to wet glass while rain threads down outside.",
    "why": "A richer rainy mood with leaf motion.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 15,
    "kind": "decor",
    "id": "window-freight-train",
    "title": "Freight Train Window",
    "data": {
      "id": "decor-window-freight-train",
      "cat": "decor",
      "name": "Freight Train Window",
      "desc": "A distant freight train crosses the lower third every few minutes, one slow line of muted cars.",
      "cost": {
        "lint": 320
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "freight-train",
        "color": "#8898a1",
        "color2": "#ad6d4c"
      }
    },
    "looks_like": "A distant freight train crosses the lower third every few minutes, one slow line of muted cars.",
    "why": "Players will wait to catch it in screenshots.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 16,
    "kind": "decor",
    "id": "window-fireflies",
    "title": "Firefly Yard Window",
    "data": {
      "id": "decor-window-fireflies",
      "cat": "decor",
      "name": "Firefly Yard Window",
      "desc": "Dark summer yard with six or seven warm firefly dots appearing one at a time.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "firefly-yard",
        "color": "#243c35",
        "color2": "#d9cb69"
      },
      "seasonal": "July"
    },
    "looks_like": "Dark summer yard with six or seven warm firefly dots appearing one at a time.",
    "why": "A night view that feels alive without particles everywhere.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 17,
    "kind": "decor",
    "id": "window-thunder",
    "title": "Far Thunder Window",
    "data": {
      "id": "decor-window-thunder",
      "cat": "decor",
      "name": "Far Thunder Window",
      "desc": "Heavy slate sky; rare soft sheet-lightning brightens the room for half a second.",
      "cost": {
        "lint": 320
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "far-thunder",
        "color": "#56616e",
        "color2": "#d4d5cc"
      }
    },
    "looks_like": "Heavy slate sky; rare soft sheet-lightning brightens the room for half a second.",
    "why": "A premium lighting moment with almost no geometry.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 18,
    "kind": "decor",
    "id": "window-pink-dawn",
    "title": "Pink Dawn Window",
    "data": {
      "id": "decor-window-pink-dawn",
      "cat": "decor",
      "name": "Pink Dawn Window",
      "desc": "A quiet pink-blue dawn gradient with one utility wire and two distant birds.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "pink-dawn",
        "color": "#e6b7aa",
        "color2": "#8ca6b0"
      }
    },
    "looks_like": "A quiet pink-blue dawn gradient with one utility wire and two distant birds.",
    "why": "Excellent opening-room mood for morning players.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 19,
    "kind": "decor",
    "id": "window-courtyard",
    "title": "Apartment Courtyard Window",
    "data": {
      "id": "decor-window-courtyard",
      "cat": "decor",
      "name": "Apartment Courtyard Window",
      "desc": "Brick courtyard, fire escape, one tiny laundry line moving in the breeze.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "courtyard",
        "color": "#b8b0a2",
        "color2": "#6e7e69"
      }
    },
    "looks_like": "Brick courtyard, fire escape, one tiny laundry line moving in the breeze.",
    "why": "Makes the room feel located inside a bigger world.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 20,
    "kind": "decor",
    "id": "window-lake-dusk",
    "title": "Lake at Dusk Window",
    "data": {
      "id": "decor-window-lake-dusk",
      "cat": "decor",
      "name": "Lake at Dusk Window",
      "desc": "Low lake horizon, peach afterglow, and one tiny boat light moving almost imperceptibly.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "lake-dusk",
        "color": "#667a88",
        "color2": "#d79b6e"
      }
    },
    "looks_like": "Low lake horizon, peach afterglow, and one tiny boat light moving almost imperceptibly.",
    "why": "Quiet destination view with no brand or region dependency.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 21,
    "kind": "decor",
    "id": "lamp-pleated",
    "title": "Pleated Shade Lamp",
    "data": {
      "id": "decor-lamp-pleated",
      "cat": "decor",
      "name": "Pleated Shade Lamp",
      "desc": "Small ceramic base with a warm cream pleated shade.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "pleated",
        "color": "#d9b88f",
        "color2": "#f5e6cb"
      }
    },
    "looks_like": "Small ceramic base with a warm cream pleated shade.",
    "why": "Instantly warmer and more domestic than the blob-lamp family.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 22,
    "kind": "decor",
    "id": "lamp-brass-library",
    "title": "Brass Library Lamp",
    "data": {
      "id": "decor-lamp-brass-library",
      "cat": "decor",
      "name": "Brass Library Lamp",
      "desc": "Low brass desk lamp with greenish cream inner shade, aimed at the folding table.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "brass-library",
        "color": "#9f7a45",
        "color2": "#e7d9af"
      }
    },
    "looks_like": "Low brass desk lamp with greenish cream inner shade, aimed at the folding table.",
    "why": "Makes the table feel intentionally lit.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 23,
    "kind": "decor",
    "id": "lamp-paper-globe",
    "title": "Paper Globe Lamp",
    "data": {
      "id": "decor-lamp-paper-globe",
      "cat": "decor",
      "name": "Paper Globe Lamp",
      "desc": "Round paper globe with faint rib lines and a warm core.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "paper-globe",
        "color": "#efe2c7",
        "color2": "#d8c9af"
      }
    },
    "looks_like": "Round paper globe with faint rib lines and a warm core.",
    "why": "Soft diffuse light reads expensive on cloth.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 24,
    "kind": "decor",
    "id": "lamp-milk-glass",
    "title": "Milk Glass Lamp",
    "data": {
      "id": "decor-lamp-milk-glass",
      "cat": "decor",
      "name": "Milk Glass Lamp",
      "desc": "White glass mushroom-shaped shade on a short brass stem.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "milk-glass",
        "color": "#f0eee4",
        "color2": "#b9976b"
      }
    },
    "looks_like": "White glass mushroom-shaped shade on a short brass stem.",
    "why": "A classic soft silhouette without leaning into novelty.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 25,
    "kind": "decor",
    "id": "lamp-clamp",
    "title": "Old Clamp Lamp",
    "data": {
      "id": "decor-lamp-clamp",
      "cat": "decor",
      "name": "Old Clamp Lamp",
      "desc": "Simple metal clamp lamp clipped to the shelf, with a warm cone of light.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "clamp",
        "color": "#777b7c",
        "color2": "#e2c16c"
      }
    },
    "looks_like": "Simple metal clamp lamp clipped to the shelf, with a warm cone of light.",
    "why": "Cheap-looking object rendered carefully becomes charming.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 26,
    "kind": "decor",
    "id": "lamp-sunset-glass",
    "title": "Sunset Glass Lamp",
    "data": {
      "id": "decor-lamp-sunset-glass",
      "cat": "decor",
      "name": "Sunset Glass Lamp",
      "desc": "Low amber glass lamp whose shade glows from peach to orange.",
      "cost": {
        "lint": 320
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "sunset-glass",
        "color": "#d87958",
        "color2": "#f0b46a"
      }
    },
    "looks_like": "Low amber glass lamp whose shade glows from peach to orange.",
    "why": "A strong evening room anchor.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "D",
    "rank": 27,
    "kind": "decor",
    "id": "plant-propagation",
    "title": "Propagation Trio",
    "data": {
      "id": "decor-plant-propagation",
      "cat": "decor",
      "name": "Propagation Trio",
      "desc": "Three clear jars with single cuttings and visible pale roots.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "plant",
        "variant": "propagation",
        "color": "#dce6df",
        "color2": "#5f8660"
      }
    },
    "looks_like": "Three clear jars with single cuttings and visible pale roots.",
    "why": "A whole plant-parent story in one small shelf cluster.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 28,
    "kind": "decor",
    "id": "plant-zz",
    "title": "ZZ Plant",
    "data": {
      "id": "decor-plant-zz",
      "cat": "decor",
      "name": "ZZ Plant",
      "desc": "Glossy dark-green paired leaves in a matte sand pot.",
      "cost": {
        "lint": 160
      },
      "start": false,
      "look": {
        "slot": "plant",
        "variant": "zz",
        "color": "#315943",
        "color2": "#a9c58d"
      }
    },
    "looks_like": "Glossy dark-green paired leaves in a matte sand pot.",
    "why": "A sculptural plant that stays readable from far away.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 29,
    "kind": "decor",
    "id": "plant-herb-cuttings",
    "title": "Kitchen Cuttings",
    "data": {
      "id": "decor-plant-herb-cuttings",
      "cat": "decor",
      "name": "Kitchen Cuttings",
      "desc": "Three little herb cuttings in mismatched tiny water glasses.",
      "cost": {
        "lint": 120
      },
      "start": false,
      "look": {
        "slot": "plant",
        "variant": "herb-cuttings",
        "color": "#748c61",
        "color2": "#c9b88a"
      }
    },
    "looks_like": "Three little herb cuttings in mismatched tiny water glasses.",
    "why": "Small domestic clutter that still looks curated.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 30,
    "kind": "decor",
    "id": "mug-forgotten-tea",
    "title": "Tea Went Cold",
    "data": {
      "id": "decor-mug-forgotten-tea",
      "cat": "decor",
      "name": "Tea Went Cold",
      "desc": "Tan stoneware mug with a dark tea ellipse and one forgotten spoon.",
      "cost": {
        "lint": 90
      },
      "start": false,
      "look": {
        "slot": "mug",
        "variant": "cold-tea",
        "color": "#d7b688",
        "color2": "#7f5d45"
      }
    },
    "looks_like": "Tan stoneware mug with a dark tea ellipse and one forgotten spoon.",
    "why": "A perfect quiet-room joke.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 31,
    "kind": "decor",
    "id": "mug-soup",
    "title": "The Soup Mug",
    "data": {
      "id": "decor-mug-soup",
      "cat": "decor",
      "name": "The Soup Mug",
      "desc": "Wide rust mug with two tiny handles, suspiciously bowl-like.",
      "cost": {
        "lint": 100
      },
      "start": false,
      "look": {
        "slot": "mug",
        "variant": "soup-mug",
        "color": "#8d5a48",
        "color2": "#e2c6a1"
      }
    },
    "looks_like": "Wide rust mug with two tiny handles, suspiciously bowl-like.",
    "why": "Different enough from the existing mugs to change the silhouette.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 32,
    "kind": "decor",
    "id": "poster-cloud-club",
    "title": "Cloud Watching Club",
    "data": {
      "id": "decor-poster-cloud-club",
      "cat": "decor",
      "name": "Cloud Watching Club",
      "desc": "Faded poster with three big cloud shapes and tiny meeting-date blocks.",
      "cost": {
        "lint": 120
      },
      "start": false,
      "look": {
        "slot": "poster",
        "variant": "cloud-club",
        "color": "#7f9db0",
        "color2": "#f2e7ce"
      }
    },
    "looks_like": "Faded poster with three big cloud shapes and tiny meeting-date blocks.",
    "why": "Looks like a real local-club print without readable small text.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 33,
    "kind": "decor",
    "id": "poster-laundry-76",
    "title": "Laundry Instructions, 1976",
    "data": {
      "id": "decor-poster-laundry-76",
      "cat": "decor",
      "name": "Laundry Instructions, 1976",
      "desc": "Cream instructional poster with giant abstract washer icons and burnt-orange arrows.",
      "cost": {
        "lint": 130
      },
      "start": false,
      "look": {
        "slot": "poster",
        "variant": "laundry-76",
        "color": "#e5d7b8",
        "color2": "#b6614c"
      }
    },
    "looks_like": "Cream instructional poster with giant abstract washer icons and burnt-orange arrows.",
    "why": "A believable found print that reinforces the room.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 34,
    "kind": "decor",
    "id": "clock-tail",
    "title": "Cat Tail Wall Clock",
    "data": {
      "id": "decor-clock-tail",
      "cat": "decor",
      "name": "Cat Tail Wall Clock",
      "desc": "Simple black clock face with one curved tail-shaped second hand.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "clock",
        "variant": "cat-tail",
        "color": "#2f3330",
        "color2": "#d6b65c"
      }
    },
    "looks_like": "Simple black clock face with one curved tail-shaped second hand.",
    "why": "Animation gives the wall a tiny bit of life.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 35,
    "kind": "decor",
    "id": "garland-pressed-leaf",
    "title": "Pressed Leaf Garland",
    "data": {
      "id": "decor-garland-pressed-leaf",
      "cat": "decor",
      "name": "Pressed Leaf Garland",
      "desc": "Large flat leaf shapes strung sparsely on brown cord.",
      "cost": {
        "lint": 140
      },
      "start": false,
      "look": {
        "slot": "garland",
        "variant": "pressed-leaf",
        "color": "#9d7b53",
        "color2": "#657c58"
      }
    },
    "looks_like": "Large flat leaf shapes strung sparsely on brown cord.",
    "why": "Seasonal-adjacent but calm enough to leave up all year.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 36,
    "kind": "decor",
    "id": "shelf-milk-crate",
    "title": "Painted Crate Shelf",
    "data": {
      "id": "decor-shelf-milk-crate",
      "cat": "decor",
      "name": "Painted Crate Shelf",
      "desc": "Two shallow wood crates painted faded sage and mounted as cubbies.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "shelf",
        "variant": "crate",
        "color": "#7f9a84",
        "color2": "#d9c7aa"
      }
    },
    "looks_like": "Two shallow wood crates painted faded sage and mounted as cubbies.",
    "why": "A stronger silhouette for all the new pocket-find clutter.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 37,
    "kind": "slot",
    "id": "slot-wallpaper",
    "title": "Wallpaper",
    "data": {
      "slot": "wallpaper",
      "name": "Wallpaper"
    },
    "looks_like": "New room customization slot: Wallpaper.",
    "why": "It changes more pixels than almost any other unlock and instantly makes screenshots feel like different homes.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "D",
    "rank": 38,
    "kind": "decor",
    "id": "wallpaper-warm-cream",
    "title": "Warm Cream Walls",
    "data": {
      "id": "decor-wallpaper-warm-cream",
      "cat": "decor",
      "name": "Warm Cream Walls",
      "desc": "Quiet warm plaster with barely visible roller texture.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "wallpaper",
        "variant": "warm-cream",
        "color": "#e7dfcf",
        "color2": "#d7ccb9"
      }
    },
    "looks_like": "Quiet warm plaster with barely visible roller texture.",
    "why": "One of the first six wallpaper choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 39,
    "kind": "decor",
    "id": "wallpaper-ditsy",
    "title": "Faded Ditsy Wallpaper",
    "data": {
      "id": "decor-wallpaper-ditsy",
      "cat": "decor",
      "name": "Faded Ditsy Wallpaper",
      "desc": "Tiny sparse leaf sprigs on old cream paper.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "wallpaper",
        "variant": "ditsy",
        "color": "#d9d1bd",
        "color2": "#8fa17f"
      }
    },
    "looks_like": "Tiny sparse leaf sprigs on old cream paper.",
    "why": "One of the first six wallpaper choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 40,
    "kind": "decor",
    "id": "wallpaper-blue-pin",
    "title": "Blue Pinstripe Walls",
    "data": {
      "id": "decor-wallpaper-blue-pin",
      "cat": "decor",
      "name": "Blue Pinstripe Walls",
      "desc": "Powder-blue vertical pinstripes, thin and low contrast.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "wallpaper",
        "variant": "blue-pin",
        "color": "#c7d5dc",
        "color2": "#7893a1"
      }
    },
    "looks_like": "Powder-blue vertical pinstripes, thin and low contrast.",
    "why": "One of the first six wallpaper choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 41,
    "kind": "decor",
    "id": "wallpaper-moss-half",
    "title": "Moss Half-Wall",
    "data": {
      "id": "decor-wallpaper-moss-half",
      "cat": "decor",
      "name": "Moss Half-Wall",
      "desc": "Moss green lower wall, warm cream above, with a narrow wood rail.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "wallpaper",
        "variant": "moss-half",
        "color": "#6f8068",
        "color2": "#e7dfcf"
      }
    },
    "looks_like": "Moss green lower wall, warm cream above, with a narrow wood rail.",
    "why": "One of the first six wallpaper choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 42,
    "kind": "decor",
    "id": "wallpaper-sunny-check",
    "title": "Sunny Checks",
    "data": {
      "id": "decor-wallpaper-sunny-check",
      "cat": "decor",
      "name": "Sunny Checks",
      "desc": "Large soft mustard and cream checks, deliberately uneven.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "wallpaper",
        "variant": "sunny-check",
        "color": "#e4c66d",
        "color2": "#f0e4c5"
      }
    },
    "looks_like": "Large soft mustard and cream checks, deliberately uneven.",
    "why": "One of the first six wallpaper choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 43,
    "kind": "decor",
    "id": "wallpaper-night-botanical",
    "title": "Night Botanical",
    "data": {
      "id": "decor-wallpaper-night-botanical",
      "cat": "decor",
      "name": "Night Botanical",
      "desc": "Deep green wall with oversized muted leaf silhouettes.",
      "cost": {
        "lint": 340
      },
      "start": false,
      "look": {
        "slot": "wallpaper",
        "variant": "night-botanical",
        "color": "#273e3a",
        "color2": "#b4b58b"
      }
    },
    "looks_like": "Deep green wall with oversized muted leaf silhouettes.",
    "why": "One of the first six wallpaper choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 44,
    "kind": "slot",
    "id": "slot-floor",
    "title": "Floor",
    "data": {
      "slot": "floor",
      "name": "Floor"
    },
    "looks_like": "New room customization slot: Floor.",
    "why": "The floor anchors the rug, dryer, basket, and shadows, so material changes make the whole renderer feel new.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "D",
    "rank": 45,
    "kind": "decor",
    "id": "floor-honey-pine",
    "title": "Honey Pine Floor",
    "data": {
      "id": "decor-floor-honey-pine",
      "cat": "decor",
      "name": "Honey Pine Floor",
      "desc": "Wide honey-pine boards with soft worn edges.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "floor",
        "variant": "honey-pine",
        "color": "#b9895f",
        "color2": "#8b6749"
      }
    },
    "looks_like": "Wide honey-pine boards with soft worn edges.",
    "why": "One of the first six floor choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 46,
    "kind": "decor",
    "id": "floor-checker-tile",
    "title": "Cream Checker Tile",
    "data": {
      "id": "decor-floor-checker-tile",
      "cat": "decor",
      "name": "Cream Checker Tile",
      "desc": "Large cream and warm-grey tiles, slightly scuffed.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "floor",
        "variant": "checker-tile",
        "color": "#e8e1d1",
        "color2": "#6f706c"
      }
    },
    "looks_like": "Large cream and warm-grey tiles, slightly scuffed.",
    "why": "One of the first six floor choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 47,
    "kind": "decor",
    "id": "floor-painted-concrete",
    "title": "Painted Concrete",
    "data": {
      "id": "decor-floor-painted-concrete",
      "cat": "decor",
      "name": "Painted Concrete",
      "desc": "Soft sage-grey painted concrete with worn paths.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "floor",
        "variant": "painted-concrete",
        "color": "#9da39f",
        "color2": "#7d8580"
      }
    },
    "looks_like": "Soft sage-grey painted concrete with worn paths.",
    "why": "One of the first six floor choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 48,
    "kind": "decor",
    "id": "floor-terracotta",
    "title": "Terracotta Hex Floor",
    "data": {
      "id": "decor-floor-terracotta",
      "cat": "decor",
      "name": "Terracotta Hex Floor",
      "desc": "Big matte hex tiles with pale grout.",
      "cost": {
        "lint": 320
      },
      "start": false,
      "look": {
        "slot": "floor",
        "variant": "terracotta",
        "color": "#b86f4e",
        "color2": "#d3a181"
      }
    },
    "looks_like": "Big matte hex tiles with pale grout.",
    "why": "One of the first six floor choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 49,
    "kind": "decor",
    "id": "floor-speckled-lino",
    "title": "Speckled Linoleum",
    "data": {
      "id": "decor-floor-speckled-lino",
      "cat": "decor",
      "name": "Speckled Linoleum",
      "desc": "Muted green linoleum with cream flecks and one seam line.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "floor",
        "variant": "speckled-lino",
        "color": "#b8c0ae",
        "color2": "#ddd4bd"
      }
    },
    "looks_like": "Muted green linoleum with cream flecks and one seam line.",
    "why": "One of the first six floor choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 50,
    "kind": "decor",
    "id": "floor-dark-walnut",
    "title": "Dark Walnut Floor",
    "data": {
      "id": "decor-floor-dark-walnut",
      "cat": "decor",
      "name": "Dark Walnut Floor",
      "desc": "Dark narrow boards that make pale rugs glow.",
      "cost": {
        "lint": 340
      },
      "start": false,
      "look": {
        "slot": "floor",
        "variant": "dark-walnut",
        "color": "#654735",
        "color2": "#3f3028"
      }
    },
    "looks_like": "Dark narrow boards that make pale rugs glow.",
    "why": "One of the first six floor choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 51,
    "kind": "slot",
    "id": "slot-curtains",
    "title": "Curtains",
    "data": {
      "slot": "curtains",
      "name": "Curtains"
    },
    "looks_like": "New room customization slot: Curtains.",
    "why": "They frame every window and can add tiny cloth motion for very little screen clutter.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "D",
    "rank": 52,
    "kind": "decor",
    "id": "curtain-cafe-white",
    "title": "White Cafe Curtains",
    "data": {
      "id": "decor-curtain-cafe-white",
      "cat": "decor",
      "name": "White Cafe Curtains",
      "desc": "Half-height white cotton curtains with soft hems.",
      "cost": {
        "lint": 140
      },
      "start": false,
      "look": {
        "slot": "curtains",
        "variant": "cafe-white",
        "color": "#f3efe4",
        "color2": "#d9d4c7"
      }
    },
    "looks_like": "Half-height white cotton curtains with soft hems.",
    "why": "One of the first six curtains choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 53,
    "kind": "decor",
    "id": "curtain-mustard-gingham",
    "title": "Mustard Gingham Curtains",
    "data": {
      "id": "decor-curtain-mustard-gingham",
      "cat": "decor",
      "name": "Mustard Gingham Curtains",
      "desc": "Small mustard-and-cream checks, tied loosely.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "slot": "curtains",
        "variant": "mustard-gingham",
        "color": "#d3b45f",
        "color2": "#f0e2bd"
      }
    },
    "looks_like": "Small mustard-and-cream checks, tied loosely.",
    "why": "One of the first six curtains choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 54,
    "kind": "decor",
    "id": "curtain-rain-blue",
    "title": "Rain Blue Linen Curtains",
    "data": {
      "id": "decor-curtain-rain-blue",
      "cat": "decor",
      "name": "Rain Blue Linen Curtains",
      "desc": "Dusty blue linen panels that move a few millimeters.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "curtains",
        "variant": "rain-blue",
        "color": "#7e9baa",
        "color2": "#d7e2e4"
      }
    },
    "looks_like": "Dusty blue linen panels that move a few millimeters.",
    "why": "One of the first six curtains choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 55,
    "kind": "decor",
    "id": "curtain-sheer-floral",
    "title": "Sheer Floral Curtains",
    "data": {
      "id": "decor-curtain-sheer-floral",
      "cat": "decor",
      "name": "Sheer Floral Curtains",
      "desc": "Translucent cream with large pale leaf silhouettes.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "curtains",
        "variant": "sheer-floral",
        "color": "#eee7da",
        "color2": "#b8c0a3"
      }
    },
    "looks_like": "Translucent cream with large pale leaf silhouettes.",
    "why": "One of the first six curtains choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 56,
    "kind": "decor",
    "id": "curtain-rust-stripe",
    "title": "Rust Stripe Curtains",
    "data": {
      "id": "decor-curtain-rust-stripe",
      "cat": "decor",
      "name": "Rust Stripe Curtains",
      "desc": "Broad vertical rust and oatmeal stripes.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "slot": "curtains",
        "variant": "rust-stripe",
        "color": "#a9654e",
        "color2": "#e1c7a9"
      }
    },
    "looks_like": "Broad vertical rust and oatmeal stripes.",
    "why": "One of the first six curtains choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 57,
    "kind": "decor",
    "id": "curtain-tiny-stars",
    "title": "Tiny Star Curtains",
    "data": {
      "id": "decor-curtain-tiny-stars",
      "cat": "decor",
      "name": "Tiny Star Curtains",
      "desc": "Deep blue cloth with sparse cream star dots.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "curtains",
        "variant": "tiny-stars",
        "color": "#4a526a",
        "color2": "#d8d3bd"
      }
    },
    "looks_like": "Deep blue cloth with sparse cream star dots.",
    "why": "One of the first six curtains choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 58,
    "kind": "slot",
    "id": "slot-table",
    "title": "Folding Table",
    "data": {
      "slot": "table",
      "name": "Folding Table"
    },
    "looks_like": "New room customization slot: Folding Table.",
    "why": "The player's hands live here. Changing the surface makes every single Load visibly different.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "D",
    "rank": 59,
    "kind": "decor",
    "id": "table-maple",
    "title": "Maple Folding Table",
    "data": {
      "id": "decor-table-maple",
      "cat": "decor",
      "name": "Maple Folding Table",
      "desc": "Pale maple top with rounded edge and grey folding legs.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "table",
        "variant": "maple",
        "color": "#c79867",
        "color2": "#8f6d4f"
      }
    },
    "looks_like": "Pale maple top with rounded edge and grey folding legs.",
    "why": "One of the first six folding table choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 60,
    "kind": "decor",
    "id": "table-enamel",
    "title": "White Enamel Table",
    "data": {
      "id": "decor-table-enamel",
      "cat": "decor",
      "name": "White Enamel Table",
      "desc": "White enamel top with a dark green edge and one tiny chip.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "table",
        "variant": "enamel",
        "color": "#e8e6de",
        "color2": "#8f9895"
      }
    },
    "looks_like": "White enamel top with a dark green edge and one tiny chip.",
    "why": "One of the first six folding table choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 61,
    "kind": "decor",
    "id": "table-green-laminate",
    "title": "Green Laminate Table",
    "data": {
      "id": "decor-table-green-laminate",
      "cat": "decor",
      "name": "Green Laminate Table",
      "desc": "Muted green laminate with cream edge banding.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "table",
        "variant": "green-laminate",
        "color": "#6f8d78",
        "color2": "#d2c8ae"
      }
    },
    "looks_like": "Muted green laminate with cream edge banding.",
    "why": "One of the first six folding table choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 62,
    "kind": "decor",
    "id": "table-sewing",
    "title": "Old Sewing Table",
    "data": {
      "id": "decor-table-sewing",
      "cat": "decor",
      "name": "Old Sewing Table",
      "desc": "Warm wood top with two shallow drawer fronts and black metal legs.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "table",
        "variant": "sewing",
        "color": "#8b654b",
        "color2": "#b68d6b"
      }
    },
    "looks_like": "Warm wood top with two shallow drawer fronts and black metal legs.",
    "why": "One of the first six folding table choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 63,
    "kind": "decor",
    "id": "table-butcher",
    "title": "Butcher Block Table",
    "data": {
      "id": "decor-table-butcher",
      "cat": "decor",
      "name": "Butcher Block Table",
      "desc": "Thick striped butcher-block top with simple steel legs.",
      "cost": {
        "lint": 320
      },
      "start": false,
      "look": {
        "slot": "table",
        "variant": "butcher",
        "color": "#c38b58",
        "color2": "#9f6a42"
      }
    },
    "looks_like": "Thick striped butcher-block top with simple steel legs.",
    "why": "One of the first six folding table choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 64,
    "kind": "decor",
    "id": "table-card",
    "title": "Folding Card Table",
    "data": {
      "id": "decor-table-card",
      "cat": "decor",
      "name": "Folding Card Table",
      "desc": "Dark green padded vinyl top with black folding legs.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "table",
        "variant": "card-table",
        "color": "#54715e",
        "color2": "#343b36"
      }
    },
    "looks_like": "Dark green padded vinyl top with black folding legs.",
    "why": "One of the first six folding table choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 65,
    "kind": "slot",
    "id": "slot-door",
    "title": "Door",
    "data": {
      "slot": "door",
      "name": "Door"
    },
    "looks_like": "New room customization slot: Door.",
    "why": "The door is a large vertical prop with almost no interaction cost, perfect for strong room identity.",
    "cost_to_build": "code-small",
    "confidence": 0.93
  },
  {
    "lane": "D",
    "rank": 66,
    "kind": "decor",
    "id": "door-scuffed-cream",
    "title": "Scuffed Cream Door",
    "data": {
      "id": "decor-door-scuffed-cream",
      "cat": "decor",
      "name": "Scuffed Cream Door",
      "desc": "Plain cream utility door with worn paint near the knob.",
      "cost": {
        "lint": 120
      },
      "start": false,
      "look": {
        "slot": "door",
        "variant": "scuffed-cream",
        "color": "#dfd7c8",
        "color2": "#9a8c7b"
      }
    },
    "looks_like": "Plain cream utility door with worn paint near the knob.",
    "why": "One of the first six door choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 67,
    "kind": "decor",
    "id": "door-sage-panel",
    "title": "Sage Panel Door",
    "data": {
      "id": "decor-door-sage-panel",
      "cat": "decor",
      "name": "Sage Panel Door",
      "desc": "Muted sage four-panel door with brass knob.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "door",
        "variant": "sage-panel",
        "color": "#78907a",
        "color2": "#d8c8aa"
      }
    },
    "looks_like": "Muted sage four-panel door with brass knob.",
    "why": "One of the first six door choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 68,
    "kind": "decor",
    "id": "door-mustard",
    "title": "Mustard Utility Door",
    "data": {
      "id": "decor-door-mustard",
      "cat": "decor",
      "name": "Mustard Utility Door",
      "desc": "Flat mustard door with small brushed-steel kick plate.",
      "cost": {
        "lint": 190
      },
      "start": false,
      "look": {
        "slot": "door",
        "variant": "mustard",
        "color": "#c6a14b",
        "color2": "#6c665c"
      }
    },
    "looks_like": "Flat mustard door with small brushed-steel kick plate.",
    "why": "One of the first six door choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 69,
    "kind": "decor",
    "id": "door-frosted",
    "title": "Frosted Glass Door",
    "data": {
      "id": "decor-door-frosted",
      "cat": "decor",
      "name": "Frosted Glass Door",
      "desc": "Wood frame with cloudy glass and a vague hallway glow.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "door",
        "variant": "frosted",
        "color": "#c9d8d6",
        "color2": "#716f68"
      }
    },
    "looks_like": "Wood frame with cloudy glass and a vague hallway glow.",
    "why": "One of the first six door choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 70,
    "kind": "decor",
    "id": "door-stickered",
    "title": "Stickered Back Door",
    "data": {
      "id": "decor-door-stickered",
      "cat": "decor",
      "name": "Stickered Back Door",
      "desc": "Faded green door with six abstract old stickers, no logos or text.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "door",
        "variant": "stickered",
        "color": "#7d8f86",
        "color2": "#d7c85a"
      }
    },
    "looks_like": "Faded green door with six abstract old stickers, no logos or text.",
    "why": "One of the first six door choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 71,
    "kind": "decor",
    "id": "door-midnight",
    "title": "Midnight Blue Door",
    "data": {
      "id": "decor-door-midnight",
      "cat": "decor",
      "name": "Midnight Blue Door",
      "desc": "Deep blue paneled door with warm brass hardware.",
      "cost": {
        "lint": 210
      },
      "start": false,
      "look": {
        "slot": "door",
        "variant": "midnight",
        "color": "#2f4152",
        "color2": "#c8a86e"
      }
    },
    "looks_like": "Deep blue paneled door with warm brass hardware.",
    "why": "One of the first six door choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 72,
    "kind": "slot",
    "id": "slot-second-animal",
    "title": "Second Animal",
    "data": {
      "slot": "second-animal",
      "name": "Second Animal"
    },
    "looks_like": "New room customization slot: Second Animal.",
    "why": "A second living thing adds enormous affection and screenshot value, but only if its animation stays quiet and never obstructs play.",
    "cost_to_build": "code-large",
    "confidence": 0.82
  },
  {
    "lane": "D",
    "rank": 73,
    "kind": "decor",
    "id": "animal-senior-dog",
    "title": "Senior Dog",
    "data": {
      "id": "decor-animal-senior-dog",
      "cat": "decor",
      "name": "Senior Dog",
      "desc": "Small old tan dog sleeping by the door; one ear twitches sometimes.",
      "cost": {
        "lint": 900
      },
      "start": false,
      "look": {
        "slot": "second-animal",
        "variant": "senior-dog",
        "color": "#b58d6b",
        "color2": "#e2d0b8"
      }
    },
    "looks_like": "Small old tan dog sleeping by the door; one ear twitches sometimes.",
    "why": "One of the first six second animal choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 74,
    "kind": "decor",
    "id": "animal-tuxedo-cat",
    "title": "Tuxedo Cat",
    "data": {
      "id": "decor-animal-tuxedo-cat",
      "cat": "decor",
      "name": "Tuxedo Cat",
      "desc": "Black-and-white cat loafed under the shelf, blinking slowly.",
      "cost": {
        "lint": 900
      },
      "start": false,
      "look": {
        "slot": "second-animal",
        "variant": "tuxedo-cat",
        "color": "#2b2b2d",
        "color2": "#f1ede3"
      }
    },
    "looks_like": "Black-and-white cat loafed under the shelf, blinking slowly.",
    "why": "One of the first six second animal choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 75,
    "kind": "decor",
    "id": "animal-lop-rabbit",
    "title": "Lop Rabbit",
    "data": {
      "id": "decor-animal-lop-rabbit",
      "cat": "decor",
      "name": "Lop Rabbit",
      "desc": "Soft brown lop rabbit tucked beside the rug fringe.",
      "cost": {
        "lint": 950
      },
      "start": false,
      "look": {
        "slot": "second-animal",
        "variant": "lop-rabbit",
        "color": "#b9a28f",
        "color2": "#e6d6c7"
      }
    },
    "looks_like": "Soft brown lop rabbit tucked beside the rug fringe.",
    "why": "One of the first six second animal choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 76,
    "kind": "decor",
    "id": "animal-green-budgie",
    "title": "Green Budgie",
    "data": {
      "id": "decor-animal-green-budgie",
      "cat": "decor",
      "name": "Green Budgie",
      "desc": "Tiny green budgie perched on the clothesline, occasionally fluffing up.",
      "cost": {
        "lint": 850
      },
      "start": false,
      "look": {
        "slot": "second-animal",
        "variant": "green-budgie",
        "color": "#79a766",
        "color2": "#e5d55f"
      }
    },
    "looks_like": "Tiny green budgie perched on the clothesline, occasionally fluffing up.",
    "why": "One of the first six second animal choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 77,
    "kind": "decor",
    "id": "animal-greyhound",
    "title": "Very Long Dog",
    "data": {
      "id": "decor-animal-greyhound",
      "cat": "decor",
      "name": "Very Long Dog",
      "desc": "Slim grey dog folded impossibly small on the rug.",
      "cost": {
        "lint": 1000
      },
      "start": false,
      "look": {
        "slot": "second-animal",
        "variant": "greyhound",
        "color": "#8a817b",
        "color2": "#d3c6b6"
      }
    },
    "looks_like": "Slim grey dog folded impossibly small on the rug.",
    "why": "One of the first six second animal choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "D",
    "rank": 78,
    "kind": "decor",
    "id": "animal-window-pigeon",
    "title": "Window Pigeon",
    "data": {
      "id": "decor-animal-window-pigeon",
      "cat": "decor",
      "name": "Window Pigeon",
      "desc": "Round pigeon on the outside sill, visible through any window view.",
      "cost": {
        "lint": 800
      },
      "start": false,
      "look": {
        "slot": "second-animal",
        "variant": "window-pigeon",
        "color": "#737d86",
        "color2": "#9a7e9a"
      }
    },
    "looks_like": "Round pigeon on the outside sill, visible through any window view.",
    "why": "One of the first six second animal choices.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "E",
    "rank": 1,
    "kind": "basket",
    "id": "basket-enamel-tub",
    "title": "Enamel Wash Tub",
    "data": {
      "id": "basket-enamel-tub",
      "cat": "basket",
      "name": "Enamel Wash Tub",
      "desc": "A low cream enamel tub with a navy rim and two black handles.",
      "cost": {
        "lint": 500
      },
      "start": false,
      "look": {
        "style": "enamel-tub",
        "color": "#e8e2d5",
        "color2": "#344e5a",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A low cream enamel tub with a navy rim and two black handles.",
    "why": "The ball makes a gorgeous hollow metal-cloth thunk.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "E",
    "rank": 2,
    "kind": "basket",
    "id": "basket-rope-coil",
    "title": "Rope Coil Basket",
    "data": {
      "id": "basket-rope-coil",
      "cat": "basket",
      "name": "Rope Coil Basket",
      "desc": "Thick natural rope coiled into a round basket with short loop handles.",
      "cost": {
        "lint": 420
      },
      "start": false,
      "look": {
        "style": "rope-coil",
        "color": "#c9b08a",
        "color2": "#8a6c49",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "Thick natural rope coiled into a round basket with short loop handles.",
    "why": "Soft fibers and a deep mouth make every landing look cozy.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "E",
    "rank": 3,
    "kind": "basket",
    "id": "basket-open-suitcase",
    "title": "The Open Suitcase",
    "data": {
      "id": "basket-open-suitcase",
      "cat": "basket",
      "name": "The Open Suitcase",
      "desc": "Old brown suitcase open flat with its fabric lid upright behind the target.",
      "cost": {
        "lint": 650
      },
      "start": false,
      "look": {
        "style": "suitcase",
        "color": "#8c6d52",
        "color2": "#c6a986",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "Old brown suitcase open flat with its fabric lid upright behind the target.",
    "why": "A sock ball landing in luggage is weirdly satisfying and visually legible.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "E",
    "rank": 4,
    "kind": "basket",
    "id": "basket-upturned-umbrella",
    "title": "Upside-Down Umbrella",
    "data": {
      "id": "basket-upturned-umbrella",
      "cat": "basket",
      "name": "Upside-Down Umbrella",
      "desc": "Open umbrella resting upside down, navy panels with one mustard panel.",
      "cost": {
        "lint": 700
      },
      "start": false,
      "look": {
        "style": "umbrella",
        "color": "#586f85",
        "color2": "#d5b968",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "Open umbrella resting upside down, navy panels with one mustard panel.",
    "why": "Strong silhouette and a soft fabric bounce without changing hitbox.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "E",
    "rank": 5,
    "kind": "basket",
    "id": "basket-felt-bin",
    "title": "Wool Felt Bin",
    "data": {
      "id": "basket-felt-bin",
      "cat": "basket",
      "name": "Wool Felt Bin",
      "desc": "Round charcoal-green felt bin with two punched handles.",
      "cost": {
        "lint": 360
      },
      "start": false,
      "look": {
        "style": "felt-bin",
        "color": "#6f8178",
        "color2": "#d2c6b4",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "Round charcoal-green felt bin with two punched handles.",
    "why": "A quiet premium target for players who dislike novelty props.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "E",
    "rank": 6,
    "kind": "basket",
    "id": "basket-picnic-open",
    "title": "Open Picnic Basket",
    "data": {
      "id": "basket-picnic-open",
      "cat": "basket",
      "name": "Open Picnic Basket",
      "desc": "Wicker picnic basket with both lids hinged upright and red-check lining.",
      "cost": {
        "lint": 600
      },
      "start": false,
      "look": {
        "style": "picnic",
        "color": "#b88a58",
        "color2": "#e8d4b0",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "Wicker picnic basket with both lids hinged upright and red-check lining.",
    "why": "Warm materials and a clean framed opening.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "E",
    "rank": 7,
    "kind": "basket",
    "id": "basket-mail-sack",
    "title": "Canvas Mail Sack",
    "data": {
      "id": "basket-mail-sack",
      "cat": "basket",
      "name": "Canvas Mail Sack",
      "desc": "Heavy cream canvas sack held open by a circular steel stand.",
      "cost": {
        "lint": 480
      },
      "start": false,
      "look": {
        "style": "mail-sack",
        "color": "#b7a98f",
        "color2": "#5c6d73",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "Heavy cream canvas sack held open by a circular steel stand.",
    "why": "Industrial-soft contrast with a lovely fabric collapse on impact.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "E",
    "rank": 8,
    "kind": "basket",
    "id": "basket-flower-pot",
    "title": "Very Large Flower Pot",
    "data": {
      "id": "basket-flower-pot",
      "cat": "basket",
      "name": "Very Large Flower Pot",
      "desc": "Terracotta planter with a wide lip and absolutely no plant.",
      "cost": {
        "lint": 750
      },
      "start": false,
      "look": {
        "style": "flower-pot",
        "color": "#b86849",
        "color2": "#e0b28d",
        "radius": 0.88,
        "rim": "tight"
      }
    },
    "looks_like": "Terracotta planter with a wide lip and absolutely no plant.",
    "why": "A joke challenge basket, clearly optional, with a satisfying ceramic knock.",
    "cost_to_build": "art",
    "confidence": 0.9
  },
  {
    "lane": "E",
    "rank": 9,
    "kind": "ball",
    "id": "ball-flat-fold",
    "title": "The Flat Fold",
    "data": {
      "id": "ball-flat-fold",
      "cat": "ball",
      "name": "The Flat Fold",
      "desc": "Two socks folded into a neat square packet.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "roll": "flat"
      }
    },
    "looks_like": "Two socks folded into a neat square packet.",
    "why": "For people who cannot stand a lumpy drawer.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "E",
    "rank": 10,
    "kind": "ball",
    "id": "ball-burrito",
    "title": "The Burrito",
    "data": {
      "id": "ball-burrito",
      "cat": "ball",
      "name": "The Burrito",
      "desc": "Pair laid together, rolled long, then both cuffs folded over the cylinder.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "roll": "burrito"
      }
    },
    "looks_like": "Pair laid together, rolled long, then both cuffs folded over the cylinder.",
    "why": "A funny compact shape that still reads like laundry.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "E",
    "rank": 11,
    "kind": "ball",
    "id": "ball-one-cuff",
    "title": "One Cuff Over",
    "data": {
      "id": "ball-one-cuff",
      "cat": "ball",
      "name": "One Cuff Over",
      "desc": "A loose roll with only one cuff stretched over the bundle.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "roll": "one-cuff"
      }
    },
    "looks_like": "A loose roll with only one cuff stretched over the bundle.",
    "why": "Looks homemade and slightly asymmetrical.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "E",
    "rank": 12,
    "kind": "ball",
    "id": "ball-crossed",
    "title": "Crossed Ankles",
    "data": {
      "id": "ball-crossed",
      "cat": "ball",
      "name": "Crossed Ankles",
      "desc": "Socks crossed at the ankles, folded inward, then rolled once.",
      "cost": {
        "lint": 360
      },
      "start": false,
      "look": {
        "roll": "crossed"
      }
    },
    "looks_like": "Socks crossed at the ankles, folded inward, then rolled once.",
    "why": "A visible X before the ball tightens.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "E",
    "rank": 13,
    "kind": "ball",
    "id": "ball-soft-knot",
    "title": "The Soft Knot",
    "data": {
      "id": "ball-soft-knot",
      "cat": "ball",
      "name": "The Soft Knot",
      "desc": "The pair is looped into a very loose overhand knot with no stretching.",
      "cost": {
        "lint": 420
      },
      "start": false,
      "look": {
        "roll": "soft-knot"
      }
    },
    "looks_like": "The pair is looped into a very loose overhand knot with no stretching.",
    "why": "Different silhouette in flight without changing physics mass.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "E",
    "rank": 14,
    "kind": "ball",
    "id": "ball-grandma-square",
    "title": "The Drawer Brick",
    "data": {
      "id": "ball-grandma-square",
      "cat": "ball",
      "name": "The Drawer Brick",
      "desc": "Pair folded into thirds into a small rectangular brick.",
      "cost": {
        "lint": 480
      },
      "start": false,
      "look": {
        "roll": "drawer-brick"
      }
    },
    "looks_like": "Pair folded into thirds into a small rectangular brick.",
    "why": "A crisp alternative for screenshot-minded organizers.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "E",
    "rank": 15,
    "kind": "trail",
    "id": "trail-loose-thread",
    "title": "Loose Thread",
    "data": {
      "id": "trail-loose-thread",
      "cat": "trail",
      "name": "Loose Thread",
      "desc": "One short curved thread line lags behind the ball and fades before landing.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "trail": "thread"
      }
    },
    "looks_like": "One short curved thread line lags behind the ball and fades before landing.",
    "why": "Barely-there motion that feels tactile, not sparkly.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "E",
    "rank": 16,
    "kind": "trail",
    "id": "trail-chalk",
    "title": "Tailor's Chalk",
    "data": {
      "id": "trail-chalk",
      "cat": "trail",
      "name": "Tailor's Chalk",
      "desc": "Three soft chalk flecks drift off the ball, then vanish.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "trail": "chalk"
      }
    },
    "looks_like": "Three soft chalk flecks drift off the ball, then vanish.",
    "why": "Laundry-adjacent and restrained.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "E",
    "rank": 17,
    "kind": "trail",
    "id": "trail-static-blue",
    "title": "Dryer Static",
    "data": {
      "id": "trail-static-blue",
      "cat": "trail",
      "name": "Dryer Static",
      "desc": "Two or three tiny blue-white zigzags snap behind the ball only at release.",
      "cost": {
        "lint": 360
      },
      "start": false,
      "look": {
        "trail": "static-blue"
      }
    },
    "looks_like": "Two or three tiny blue-white zigzags snap behind the ball only at release.",
    "why": "A clean electrical accent with no screen-filling particles.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "E",
    "rank": 18,
    "kind": "trail",
    "id": "trail-autumn-leaf",
    "title": "One Tiny Leaf",
    "data": {
      "id": "trail-autumn-leaf",
      "cat": "trail",
      "name": "One Tiny Leaf",
      "desc": "A single flat leaf shape tumbles once behind each shot.",
      "cost": {
        "lint": 420
      },
      "start": false,
      "look": {
        "trail": "leaf"
      }
    },
    "looks_like": "A single flat leaf shape tumbles once behind each shot.",
    "why": "One object is funnier and more premium than a particle spray.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "E",
    "rank": 19,
    "kind": "trail",
    "id": "trail-firefly",
    "title": "One Firefly",
    "data": {
      "id": "trail-firefly",
      "cat": "trail",
      "name": "One Firefly",
      "desc": "One warm dot follows half a beat late, then blinks out at the basket.",
      "cost": {
        "lint": 480
      },
      "start": false,
      "look": {
        "trail": "firefly"
      }
    },
    "looks_like": "One warm dot follows half a beat late, then blinks out at the basket.",
    "why": "A quiet night-room companion.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "E",
    "rank": 20,
    "kind": "trail",
    "id": "trail-soap-bubble",
    "title": "Three Bubbles",
    "data": {
      "id": "trail-soap-bubble",
      "cat": "trail",
      "name": "Three Bubbles",
      "desc": "Exactly three translucent bubbles peel away at different speeds.",
      "cost": {
        "lint": 540
      },
      "start": false,
      "look": {
        "trail": "bubble"
      }
    },
    "looks_like": "Exactly three translucent bubbles peel away at different speeds.",
    "why": "A strict cap keeps the effect elegant.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "E",
    "rank": 21,
    "kind": "radio",
    "id": "radio-kitchen-midnight",
    "title": "Kitchen After Midnight",
    "data": {
      "id": "radio-kitchen-midnight",
      "cat": "radio",
      "name": "Kitchen After Midnight",
      "desc": "Muted upright piano, fridge hum, brush kit, one distant cabinet close.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "station": "kitchen-midnight"
      }
    },
    "looks_like": "Muted upright piano, fridge hum, brush kit, one distant cabinet close.",
    "why": "Feels like being the last awake person in a warm house.",
    "cost_to_build": "art",
    "confidence": 0.89
  },
  {
    "lane": "E",
    "rank": 22,
    "kind": "radio",
    "id": "radio-rain-car",
    "title": "Rain in a Parked Car",
    "data": {
      "id": "radio-rain-car",
      "cat": "radio",
      "name": "Rain in a Parked Car",
      "desc": "Close rain on glass and roof with very low warm electric piano underneath.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "station": "rain-car"
      }
    },
    "looks_like": "Close rain on glass and roof with very low warm electric piano underneath.",
    "why": "A place, not a genre. Perfect for headphones.",
    "cost_to_build": "art",
    "confidence": 0.89
  },
  {
    "lane": "E",
    "rank": 23,
    "kind": "radio",
    "id": "radio-library-closing",
    "title": "Library Basement at Closing",
    "data": {
      "id": "radio-library-closing",
      "cat": "radio",
      "name": "Library Basement at Closing",
      "desc": "Soft HVAC, page turns, felted vibraphone, occasional cart wheel.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "station": "library-closing"
      }
    },
    "looks_like": "Soft HVAC, page turns, felted vibraphone, occasional cart wheel.",
    "why": "Cozy institutional ambience nobody else names.",
    "cost_to_build": "art",
    "confidence": 0.89
  },
  {
    "lane": "E",
    "rank": 24,
    "kind": "radio",
    "id": "radio-porch-storm",
    "title": "Porch During a Summer Storm",
    "data": {
      "id": "radio-porch-storm",
      "cat": "radio",
      "name": "Porch During a Summer Storm",
      "desc": "Low thunder, porch rain, muted acoustic guitar harmonics, one screen-door creak.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "station": "porch-storm"
      }
    },
    "looks_like": "Low thunder, porch rain, muted acoustic guitar harmonics, one screen-door creak.",
    "why": "Strong scene without becoming a weather soundboard.",
    "cost_to_build": "art",
    "confidence": 0.89
  },
  {
    "lane": "E",
    "rank": 25,
    "kind": "radio",
    "id": "radio-late-train",
    "title": "Late Train Home",
    "data": {
      "id": "radio-late-train",
      "cat": "radio",
      "name": "Late Train Home",
      "desc": "Rail rhythm, low synth pad, sparse brushed snare, station doors far away.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "station": "late-train"
      }
    },
    "looks_like": "Rail rhythm, low synth pad, sparse brushed snare, station doors far away.",
    "why": "Gentle movement suits repetitive sorting.",
    "cost_to_build": "art",
    "confidence": 0.89
  },
  {
    "lane": "E",
    "rank": 26,
    "kind": "radio",
    "id": "radio-cafe-before-open",
    "title": "Cafe Before Opening",
    "data": {
      "id": "radio-cafe-before-open",
      "cat": "radio",
      "name": "Cafe Before Opening",
      "desc": "Room tone, cup set-down, low jazz guitar, espresso-machine hiss used sparingly.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "station": "cafe-before-open"
      }
    },
    "looks_like": "Room tone, cup set-down, low jazz guitar, espresso-machine hiss used sparingly.",
    "why": "Coffee-shop mood without chatter or a fake brand.",
    "cost_to_build": "art",
    "confidence": 0.89
  },
  {
    "lane": "E",
    "rank": 27,
    "kind": "radio",
    "id": "radio-motel-hall",
    "title": "Motel Ice Machine Hallway",
    "data": {
      "id": "radio-motel-hall",
      "cat": "radio",
      "name": "Motel Ice Machine Hallway",
      "desc": "Soft fluorescent hum, distant ice drop, hazy electric piano chords.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "station": "motel-hall"
      }
    },
    "looks_like": "Soft fluorescent hum, distant ice drop, hazy electric piano chords.",
    "why": "Specific, lonely, oddly comforting.",
    "cost_to_build": "art",
    "confidence": 0.89
  },
  {
    "lane": "E",
    "rank": 28,
    "kind": "radio",
    "id": "radio-upstairs-vacuum",
    "title": "Someone Vacuuming Upstairs",
    "data": {
      "id": "radio-upstairs-vacuum",
      "cat": "radio",
      "name": "Someone Vacuuming Upstairs",
      "desc": "A distant vacuum moves room to room under soft bass and brushed drums.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "station": "upstairs-vacuum"
      }
    },
    "looks_like": "A distant vacuum moves room to room under soft bass and brushed drums.",
    "why": "Domestic comedy that stays low enough to actually play beside.",
    "cost_to_build": "art",
    "confidence": 0.89
  },
  {
    "lane": "G",
    "rank": 1,
    "kind": "paid",
    "id": "paid-supporter-envelope",
    "title": "Supporter Envelope, $1.99",
    "data": {
      "id": "paid-supporter-envelope",
      "title": "Supporter Envelope, $1.99",
      "price": "$1.99",
      "presentation": "A single non-consumable Support the Studio purchase represented by a cream envelope leaning on the display shelf. Tapping it shows one paper sheet, not a store grid. It includes a small brass wolf-shaped shelf pin, a 'Late Light' warm lamp variant, and a radio station called Studio After Everyone Left.",
      "always_earnable": "No Quarters, dryers, base hero packs, pegs, Reunions, or gameplay comforts are inside it. The three supporter cosmetics can be exclusive because they are outside collection completion counts."
    },
    "looks_like": "A single non-consumable Support the Studio purchase represented by a cream envelope leaning on the display shelf. Tapping it shows one paper sheet, not a store grid. It includes a small brass wolf-shaped shelf pin, a 'Late Light' warm lamp variant, and a radio station called Studio After Everyone Left.",
    "why": "One quiet optional thank-you purchase reads like patronage, not monetization design.",
    "cost_to_build": "code-small",
    "confidence": 0.9
  },
  {
    "lane": "G",
    "rank": 2,
    "kind": "paid",
    "id": "paid-expansion-after-hours",
    "title": "After Hours Expansion, $2.99",
    "data": {
      "id": "paid-expansion-after-hours",
      "title": "After Hours Expansion, $2.99",
      "price": "$2.99",
      "presentation": "If TUMBLE earns a real audience, sell one substantial expansion at a time: two new ten-sock packs, one new room theme of six decor pieces, one radio station, and one dryer LOOK that reuses an existing arrival behavior. Present it as a folded laundry catalog on the shelf with one cover, one price, one purchase.",
      "always_earnable": "Everything that shipped in the base game remains earnable forever. Expansion content is additive and never appears in base completion percentages."
    },
    "looks_like": "If TUMBLE earns a real audience, sell one substantial expansion at a time: two new ten-sock packs, one new room theme of six decor pieces, one radio station, and one dryer LOOK that reuses an existing arrival behavior. Present it as a folded laundry catalog on the shelf with one cover, one price, one purchase.",
    "why": "A chunk of authored content feels like DLC. Ten separate 99-cent buttons feel like a phone shop.",
    "cost_to_build": "code-small",
    "confidence": 0.84
  },
  {
    "lane": "G",
    "rank": 3,
    "kind": "paid",
    "id": "paid-no-quarters",
    "title": "Do Not Sell Quarters",
    "data": {
      "id": "paid-no-quarters",
      "title": "Do Not Sell Quarters",
      "price": "$0",
      "presentation": "Remove 'buy Quarters' from the plan entirely. Quarters stay a laundry-world earned currency only.",
      "always_earnable": "All Quarter-priced goods remain play-earned."
    },
    "looks_like": "Remove 'buy Quarters' from the plan entirely. Quarters stay a laundry-world earned currency only.",
    "why": "Selling the currency whose scarcity the game itself controls makes every slow payout look intentional, even when it is not.",
    "cost_to_build": "data",
    "confidence": 0.98
  },
  {
    "lane": "G",
    "rank": 4,
    "kind": "paid",
    "id": "paid-no-single-packs",
    "title": "Do Not Sell Hero Packs One at a Time",
    "data": {
      "id": "paid-no-single-packs",
      "title": "Do Not Sell Hero Packs One at a Time",
      "price": "$0",
      "presentation": "Keep individual hero packs as 10-Quarter goals. If future paid content exists, group packs into a substantial named expansion instead of putting a cash price beside each pack in the room.",
      "always_earnable": "All base hero packs stay earnable with Quarters."
    },
    "looks_like": "Keep individual hero packs as 10-Quarter goals. If future paid content exists, group packs into a substantial named expansion instead of putting a cash price beside each pack in the room.",
    "why": "Individual pack prices would put a cash tag directly on the game's most lovable collection objects.",
    "cost_to_build": "data",
    "confidence": 0.94
  },
  {
    "lane": "H",
    "rank": 1,
    "kind": "polish",
    "id": "polish-basket-material-audio",
    "title": "Material-Specific Basket Landing",
    "data": {
      "id": "polish-basket-material-audio",
      "title": "Material-Specific Basket Landing",
      "experience": "A wicker basket gives a dry reed knock plus cloth thump; enamel gives a short hollow bonk; felt gives almost nothing; wire gives one restrained metallic tick. Haptic is one soft pulse exactly at first contact.",
      "done_when": "Every basket style passes a blind audio test where a tester can identify material class at least 4 of 5 times."
    },
    "looks_like": "A wicker basket gives a dry reed knock plus cloth thump; enamel gives a short hollow bonk; felt gives almost nothing; wire gives one restrained metallic tick. Haptic is one soft pulse exactly at first contact.",
    "why": "The target is touched every Load, so this is heard hundreds of times. Matching sound to material makes cheap geometry feel physical.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 2,
    "kind": "polish",
    "id": "polish-sock-grab",
    "title": "The Sock Actually Lifts Into Your Hand",
    "data": {
      "id": "polish-sock-grab",
      "title": "The Sock Actually Lifts Into Your Hand",
      "experience": "On touch, the selected sock rises 8 to 12 mm, its cloth shadow separates, it rotates 3 degrees toward camera, then follows the thumb with slight spring lag.",
      "done_when": "No sock teleports; at 60 fps the lift, shadow separation, and follow lag are visible in a 0.25x screen recording."
    },
    "looks_like": "On touch, the selected sock rises 8 to 12 mm, its cloth shadow separates, it rotates 3 degrees toward camera, then follows the thumb with slight spring lag.",
    "why": "The core verb stops feeling like dragging a mesh and starts feeling like picking up fabric.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 3,
    "kind": "polish",
    "id": "polish-paper-sheets",
    "title": "Menus Are Paper in the Room",
    "data": {
      "id": "polish-paper-sheets",
      "title": "Menus Are Paper in the Room",
      "experience": "Load choice, Drawer, and end-of-Load summary arrive as cream paper sheets slid from beneath the table edge with a tiny paper sound. Closing them slides them back. No floating glass panels.",
      "done_when": "Every primary menu has one physical entry/exit motion and no default mobile modal animation remains."
    },
    "looks_like": "Load choice, Drawer, and end-of-Load summary arrive as cream paper sheets slid from beneath the table edge with a tiny paper sound. Closing them slides them back. No floating glass panels.",
    "why": "A coherent physical UI makes the entire game feel authored instead of wrapped.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 4,
    "kind": "polish",
    "id": "polish-first-ten-seconds",
    "title": "First Ten Seconds",
    "data": {
      "id": "polish-first-ten-seconds",
      "title": "First Ten Seconds",
      "experience": "Cold launch: black for less than half a second, room fades in already lit, dryer is idling, radio is barely audible, one sock on the table edge settles a few millimeters. The dryer door handle gives one quiet warm highlight. First tap opens the Load sheet.",
      "done_when": "From icon tap to interactive room is under 4 seconds on the target midrange Android device, with at most one studio mark."
    },
    "looks_like": "Cold launch: black for less than half a second, room fades in already lit, dryer is idling, radio is barely audible, one sock on the table edge settles a few millimeters. The dryer door handle gives one quiet warm highlight. First tap opens the Load sheet.",
    "why": "No logo gauntlet, no rewards popup, no shop. The game shows confidence by getting out of the way.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 5,
    "kind": "polish",
    "id": "polish-contact-shadows",
    "title": "Contact Shadows Under Every Sock",
    "data": {
      "id": "polish-contact-shadows",
      "title": "Contact Shadows Under Every Sock",
      "experience": "Use a cheap screen-space or blob contact shadow that darkens directly where sock, table, basket, and ball touch. Keep it soft and short.",
      "done_when": "At normal phone brightness, every sock in a heap reads as touching something, with no detached dark halos."
    },
    "looks_like": "Use a cheap screen-space or blob contact shadow that darkens directly where sock, table, basket, and ball touch. Keep it soft and short.",
    "why": "Soft objects without contact shadows float. Fixing that buys more realism than higher polycount.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 6,
    "kind": "polish",
    "id": "polish-time-light",
    "title": "Room Light Follows Local Time",
    "data": {
      "id": "polish-time-light",
      "title": "Room Light Follows Local Time",
      "experience": "Morning is cool window light with warm lamp off; afternoon is neutral; after 7 pm the window cools down and the table lamp becomes the warm key. At 8 pm the lamp reflection appears in the dryer glass.",
      "done_when": "Three captured times, 9 am, 3 pm, 9 pm, are unmistakably different while sock colors remain matchable."
    },
    "looks_like": "Morning is cool window light with warm lamp off; afternoon is neutral; after 7 pm the window cools down and the table lamp becomes the warm key. At 8 pm the lamp reflection appears in the dryer glass.",
    "why": "Time-of-day lighting makes the room feel inhabited without needing content popups.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 7,
    "kind": "polish",
    "id": "polish-dryer-glass",
    "title": "Dryer Glass Has a Real Reflection",
    "data": {
      "id": "polish-dryer-glass",
      "title": "Dryer Glass Has a Real Reflection",
      "experience": "The round glass gets a subtle room reflection, dark edge Fresnel, two fingerprint smudges only visible at glancing angles, and a dim rotating cloth reflection during tumble.",
      "done_when": "Glass never becomes mirror-bright, never obscures socks, and shows the lamp reflection at night."
    },
    "looks_like": "The round glass gets a subtle room reflection, dark edge Fresnel, two fingerprint smudges only visible at glancing angles, and a dim rotating cloth reflection during tumble.",
    "why": "The dryer is the largest hero object in the room. Good glass reads premium immediately.",
    "cost_to_build": "art",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 8,
    "kind": "polish",
    "id": "polish-coin-ring",
    "title": "Coins Have Weight",
    "data": {
      "id": "polish-coin-ring",
      "title": "Coins Have Weight",
      "experience": "Each denomination has its own pitch and decay. A penny is a bright short tick, nickel is duller, dime is highest, quarter is lower and longer. Glass jar impacts add a separate quiet resonance.",
      "done_when": "In a hidden-label test, the quarter is reliably distinguishable from a penny after five minutes of play."
    },
    "looks_like": "Each denomination has its own pitch and decay. A penny is a bright short tick, nickel is duller, dime is highest, quarter is lower and longer. Glass jar impacts add a separate quiet resonance.",
    "why": "Loose change is an audio toy the player will learn by ear.",
    "cost_to_build": "art",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 9,
    "kind": "polish",
    "id": "polish-pile-settle",
    "title": "The Heap Settles Once",
    "data": {
      "id": "polish-pile-settle",
      "title": "The Heap Settles Once",
      "experience": "After the dryer spill, let physics run for 450 to 650 ms with control locked, then damp all velocities together. One last sock may slide an inch. Never let the pile jitter forever.",
      "done_when": "No visible micro-jitter remains two seconds after arrival on target devices."
    },
    "looks_like": "After the dryer spill, let physics run for 450 to 650 ms with control locked, then damp all velocities together. One last sock may slide an inch. Never let the pile jitter forever.",
    "why": "Controlled settling feels intentional and keeps Rapier from advertising itself.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 10,
    "kind": "polish",
    "id": "polish-radio-spatial",
    "title": "Radio Lives on the Shelf",
    "data": {
      "id": "polish-radio-spatial",
      "title": "Radio Lives on the Shelf",
      "experience": "Music is slightly quieter and more mono when the camera faces away from the radio, with a tiny room reverb. Opening a paper menu ducks it 2 dB instead of muting.",
      "done_when": "Turning room audio off/on never changes track position, and menus never hard-cut music."
    },
    "looks_like": "Music is slightly quieter and more mono when the camera faces away from the radio, with a tiny room reverb. Opening a paper menu ducks it 2 dB instead of muting.",
    "why": "Spatial consistency sells the room as a place.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 11,
    "kind": "polish",
    "id": "polish-haptic-language",
    "title": "Three Haptics, No More",
    "data": {
      "id": "polish-haptic-language",
      "title": "Three Haptics, No More",
      "experience": "Pair confirmed: one tiny click. Ball hits basket: one soft thump. Reunion: two soft clicks separated by 90 ms. No haptic on coins, menus, misses, or every drag.",
      "done_when": "A full Regular Load produces no accidental buzz storm and every haptic maps to exactly one event."
    },
    "looks_like": "Pair confirmed: one tiny click. Ball hits basket: one soft thump. Reunion: two soft clicks separated by 90 ms. No haptic on coins, menus, misses, or every drag.",
    "why": "Restraint makes the few vibrations mean something.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 12,
    "kind": "polish",
    "id": "polish-cloth-roughness",
    "title": "Tune Cloth, Not Polygons",
    "data": {
      "id": "polish-cloth-roughness",
      "title": "Tune Cloth, Not Polygons",
      "experience": "Give socks slightly different roughness by condition: plain matte, pilled a touch fuzzier, lint with tiny soft breakup, hole with darker inner edge. Keep normal detail broad enough for phone resolution.",
      "done_when": "At 96 px, condition still reads without shimmering or noisy microtexture."
    },
    "looks_like": "Give socks slightly different roughness by condition: plain matte, pilled a touch fuzzier, lint with tiny soft breakup, hole with darker inner edge. Keep normal detail broad enough for phone resolution.",
    "why": "The player stares at cloth all game. Material response matters more than mesh density.",
    "cost_to_build": "art",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 13,
    "kind": "polish",
    "id": "polish-window-room-light",
    "title": "Weather Touches the Room",
    "data": {
      "id": "polish-window-room-light",
      "title": "Weather Touches the Room",
      "experience": "Rainy window cools the window-side wall and adds moving dim streak reflections; snow brightens the lower room; far lightning briefly raises ambient light by less than 15 percent.",
      "done_when": "Each animated window changes at least one piece of room lighting without changing sock readability."
    },
    "looks_like": "Rainy window cools the window-side wall and adds moving dim streak reflections; snow brightens the lower room; far lightning briefly raises ambient light by less than 15 percent.",
    "why": "Window unlocks stop being flat pictures and become room moods.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 14,
    "kind": "polish",
    "id": "polish-dryer-stop",
    "title": "The Drum Has Inertia",
    "data": {
      "id": "polish-dryer-stop",
      "title": "The Drum Has Inertia",
      "experience": "When a Load ends its pre-spin, the drum motor cuts first, cloth keeps moving, the drum eases to rest, then the latch releases 180 ms later.",
      "done_when": "No door opens while the drum still appears powered; timing is consistent across dryers."
    },
    "looks_like": "When a Load ends its pre-spin, the drum motor cuts first, cloth keeps moving, the drum eases to rest, then the latch releases 180 ms later.",
    "why": "Mechanical sequencing makes the machine feel expensive and heavy.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 15,
    "kind": "polish",
    "id": "polish-ball-squash",
    "title": "Sock Ball Squash on Landing",
    "data": {
      "id": "polish-ball-squash",
      "title": "Sock Ball Squash on Landing",
      "experience": "On first basket impact, visually squash the ball 6 percent for 70 ms and rebound once. Physics collider stays unchanged.",
      "done_when": "Slow-motion capture shows one squash and one rebound, never jelly wobble."
    },
    "looks_like": "On first basket impact, visually squash the ball 6 percent for 70 ms and rebound once. Physics collider stays unchanged.",
    "why": "Softness reads instantly without cloth simulation.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 16,
    "kind": "polish",
    "id": "polish-room-parallax",
    "title": "One-Centimeter Camera Parallax",
    "data": {
      "id": "polish-room-parallax",
      "title": "One-Centimeter Camera Parallax",
      "experience": "As the thumb moves across menus or the phone tilts slightly, the room camera shifts by a maximum of one virtual centimeter. It stops during active matching.",
      "done_when": "A player notices depth when shown side-by-side, but nobody reports the camera 'moving' during play."
    },
    "looks_like": "As the thumb moves across menus or the phone tilts slightly, the room camera shifts by a maximum of one virtual centimeter. It stops during active matching.",
    "why": "Tiny depth response makes the fixed room feel dimensional without motion sickness.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 17,
    "kind": "polish",
    "id": "polish-find-reveal",
    "title": "Pocket Finds Arrive Quietly",
    "data": {
      "id": "polish-find-reveal",
      "title": "Pocket Finds Arrive Quietly",
      "experience": "A found object never opens a popup mid-Load. At the end, the camera holds one beat on the jar or cork board as the object is placed with its own sound, then the normal summary sheet slides in.",
      "done_when": "A find can be understood without text and never interrupts a match."
    },
    "looks_like": "A found object never opens a popup mid-Load. At the end, the camera holds one beat on the jar or cork board as the object is placed with its own sound, then the normal summary sheet slides in.",
    "why": "The room itself announces the reward.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 18,
    "kind": "polish",
    "id": "polish-reunion-light",
    "title": "Reunion Is Mostly Silence",
    "data": {
      "id": "polish-reunion-light",
      "title": "Reunion Is Mostly Silence",
      "experience": "When a mate returns, ambient audio dips 2 dB, both socks sit beside each other for 1.2 seconds, the Odd Bin lamp warms slightly, then the page arrives if one is due.",
      "done_when": "No particle burst, fanfare, or screen flash remains in the Reunion sequence."
    },
    "looks_like": "When a mate returns, ambient audio dips 2 dB, both socks sit beside each other for 1.2 seconds, the Odd Bin lamp warms slightly, then the page arrives if one is due.",
    "why": "Emotional beats get weight from subtraction, not confetti.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 19,
    "kind": "polish",
    "id": "polish-state-continuity",
    "title": "The Room Remembers",
    "data": {
      "id": "polish-state-continuity",
      "title": "The Room Remembers",
      "experience": "On return, every selected decor item, radio track position, time-of-day state, cat pose family, and coin-jar remainder is restored before the first rendered frame.",
      "done_when": "Force-close during five different room states and reopen: no default decor flashes on screen."
    },
    "looks_like": "On return, every selected decor item, radio track position, time-of-day state, cat pose family, and coin-jar remainder is restored before the first rendered frame.",
    "why": "Nothing punctures premium more than a home that visibly resets itself.",
    "cost_to_build": "code-small",
    "confidence": 0.92
  },
  {
    "lane": "H",
    "rank": 20,
    "kind": "polish",
    "id": "polish-store-screenshots",
    "title": "Five Store Screenshots That Sell the Actual Game",
    "data": {
      "id": "polish-store-screenshots",
      "title": "Five Store Screenshots That Sell the Actual Game",
      "experience": "1: dryer opening over a beautiful heap, caption FIND THE PAIR. 2: hand-held near-twin socks, caption LOOK CLOSER. 3: ball mid-flight toward a gorgeous basket, caption FOLD. FLICK. THUNK. 4: Odd Bin reunion, caption SOME SOCKS COME BACK LATER. 5: customized room with cat, pocket-find jar, rain window, caption MAKE THE LAUNDRY ROOM YOURS.",
      "done_when": "At phone-store thumbnail size, each screenshot communicates one idea with six words or fewer."
    },
    "looks_like": "1: dryer opening over a beautiful heap, caption FIND THE PAIR. 2: hand-held near-twin socks, caption LOOK CLOSER. 3: ball mid-flight toward a gorgeous basket, caption FOLD. FLICK. THUNK. 4: Odd Bin reunion, caption SOME SOCKS COME BACK LATER. 5: customized room with cat, pocket-find jar, rain window, caption MAKE THE LAUNDRY ROOM YOURS.",
    "why": "These show verb, discernment, physical payoff, emotional hook, and ownership without feature soup.",
    "cost_to_build": "art",
    "confidence": 0.92
  },
  {
    "lane": "I",
    "rank": 1,
    "kind": "retention",
    "id": "retention-odd-bin-thread",
    "title": "An Unfinished Reunion Thread",
    "data": {
      "id": "retention-odd-bin-thread",
      "title": "An Unfinished Reunion Thread",
      "behavior": "The Odd Bin remains the strongest reason to return: after an odd sock enters, its empty mate-shaped space stays visibly outlined in the Bin. No timer, no 'come back tomorrow' copy. The next Load can contain the mate whenever the normal Reunion rules allow."
    },
    "looks_like": "The Odd Bin remains the strongest reason to return: after an odd sock enters, its empty mate-shaped space stays visibly outlined in the Bin. No timer, no 'come back tomorrow' copy. The next Load can contain the mate whenever the normal Reunion rules allow.",
    "why": "It creates a remembered question, not an obligation.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "I",
    "rank": 2,
    "kind": "retention",
    "id": "retention-room-time",
    "title": "The Room Greets the Actual Hour",
    "data": {
      "id": "retention-room-time",
      "title": "The Room Greets the Actual Hour",
      "behavior": "Tomorrow morning the room is morning-lit; tomorrow night it is lamp-lit. The clock is correct, the window sky changes, and the cat or second animal is in one of several quiet poses chosen from the time block."
    },
    "looks_like": "Tomorrow morning the room is morning-lit; tomorrow night it is lamp-lit. The clock is correct, the window sky changes, and the cat or second animal is in one of several quiet poses chosen from the time block.",
    "why": "The same room feels freshly inhabited without giving a reward for absence.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "I",
    "rank": 3,
    "kind": "retention",
    "id": "retention-daily-as-puzzle",
    "title": "Daily Load as a Named Little Puzzle",
    "data": {
      "id": "retention-daily-as-puzzle",
      "title": "Daily Load as a Named Little Puzzle",
      "behavior": "Give the existing Daily a dry generated title based on its seed, such as 'Tuesday, Mostly Stripes' or 'The One With Too Many Blue Socks.' It is always available in an archive after the day passes, so nothing is lost."
    },
    "looks_like": "Give the existing Daily a dry generated title based on its seed, such as 'Tuesday, Mostly Stripes' or 'The One With Too Many Blue Socks.' It is always available in an archive after the day passes, so nothing is lost.",
    "why": "A daily reason to peek in without a streak or FOMO.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "I",
    "rank": 4,
    "kind": "retention",
    "id": "retention-next-find-shadow",
    "title": "Pocket-Find Shelf Silhouettes",
    "data": {
      "id": "retention-next-find-shadow",
      "title": "Pocket-Find Shelf Silhouettes",
      "behavior": "The pocket-find display shows faint physical empty outlines for sets already started. A player can see that the coat-pocket shadow box is missing one oddly shaped object without being told when it will arrive."
    },
    "looks_like": "The pocket-find display shows faint physical empty outlines for sets already started. A player can see that the coat-pocket shadow box is missing one oddly shaped object without being told when it will arrive.",
    "why": "Collection curiosity lives in the room, not a checklist popup.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "I",
    "rank": 5,
    "kind": "retention",
    "id": "retention-season-room",
    "title": "Four Gentle Seasons, Fully Reversible",
    "data": {
      "id": "retention-season-room",
      "title": "Four Gentle Seasons, Fully Reversible",
      "behavior": "Add Spring, Summer, Autumn, and Winter room moods keyed to the device month: outside foliage/light shifts, not rewards. A settings toggle can force any season permanently, so there is zero FOMO."
    },
    "looks_like": "Add Spring, Summer, Autumn, and Winter room moods keyed to the device month: outside foliage/light shifts, not rewards. A settings toggle can force any season permanently, so there is zero FOMO.",
    "why": "Tomorrow can look subtly different across the year without time-gating content.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "I",
    "rank": 6,
    "kind": "retention",
    "id": "retention-radio-memory",
    "title": "The Radio Was Left On",
    "data": {
      "id": "retention-radio-memory",
      "title": "The Radio Was Left On",
      "behavior": "On return, the radio resumes the same station and shows a tiny changed paper program card for the current time block, such as 'Late Kitchen' or 'Rain Desk.' No unlock is attached."
    },
    "looks_like": "On return, the radio resumes the same station and shows a tiny changed paper program card for the current time block, such as 'Late Kitchen' or 'Rain Desk.' No unlock is attached.",
    "why": "Continuity makes the room feel like a place the player left, not an app they reopened.",
    "cost_to_build": "art",
    "confidence": 0.88
  },
  {
    "lane": "I",
    "rank": 7,
    "kind": "retention",
    "id": "retention-cat-business",
    "title": "The Cat Has Been Busy",
    "data": {
      "id": "retention-cat-business",
      "title": "The Cat Has Been Busy",
      "behavior": "The cat can be asleep on the rug, on the shelf, behind the basket, or staring into the dryer when the player returns. It never blocks controls and never carries rewards."
    },
    "looks_like": "The cat can be asleep on the rug, on the shelf, behind the basket, or staring into the dryer when the player returns. It never blocks controls and never carries rewards.",
    "why": "Players reopen to see a living room, not to claim a chest.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "I",
    "rank": 8,
    "kind": "retention",
    "id": "retention-load-history",
    "title": "Yesterday's Laundry Stays in the Room",
    "data": {
      "id": "retention-load-history",
      "title": "Yesterday's Laundry Stays in the Room",
      "behavior": "After a session, one tiny detail from the last Load persists until the next: a sock ball on the shelf, the last pocket find newly placed, or the donation bag patch added. Never more than one temporary trace."
    },
    "looks_like": "After a session, one tiny detail from the last Load persists until the next: a sock ball on the shelf, the last pocket find newly placed, or the donation bag patch added. Never more than one temporary trace.",
    "why": "The player can point to evidence that they were here yesterday.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "J",
    "rank": 1,
    "kind": "problem",
    "id": "problem-quarter-gate",
    "title": "The Economy Gates Joy Behind Perfection",
    "data": {
      "id": "problem-quarter-gate",
      "issue": "Quarter income is currently both sparse and conditional while all dryers and hero packs use it. That makes the most exciting content feel connected to failure states rather than ordinary laundry. Lane F fixes income rather than cheapening prices."
    },
    "looks_like": null,
    "why": "Keep the 'care pays more' law, but baseline play must also move the coin jar.",
    "cost_to_build": "data",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 2,
    "kind": "problem",
    "id": "problem-law7-load100",
    "title": "Law 7 Conflicts With the Requested Hundredth-Load Find",
    "data": {
      "id": "problem-law7-load100",
      "issue": "The brief says rewards are for care, not time served, then explicitly asks what makes the hundredth Load's find worth waiting for. I would break Law 7 exactly once for a zero-power commemorative keepsake at Load 100. No streak, no expiry, no bonus currency."
    },
    "looks_like": null,
    "why": "A milestone can mark a relationship without becoming retention pressure.",
    "cost_to_build": "data",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 3,
    "kind": "problem",
    "id": "problem-visible-clutter",
    "title": "Thirty Finds Can Break 'Everything Is Visible'",
    "data": {
      "id": "problem-visible-clutter",
      "issue": "If all 30 tiny objects sit loose on one shelf, the room becomes a flea market and Law 8 loses. Use jars, shallow dishes, shadow boxes, and set-completion rearrangements so every find is physically represented but not equally loud."
    },
    "looks_like": null,
    "why": "Visibility should mean physically present and inspectable, not all shouting at once.",
    "cost_to_build": "code-small",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 4,
    "kind": "problem",
    "id": "problem-dryer-difficulty",
    "title": "Dryer Arrival Rules Quietly Change Difficulty",
    "data": {
      "id": "problem-dryer-difficulty",
      "issue": "The law says dryers change arrival without making the game easier or harder, but 'bigger' literally changes Load size and one-at-a-time arrival can change memory/search pacing. Normalize the final playable heap before input for cosmetic arrivals, and treat bigger Loads as an explicit mode unlock rather than hidden dryer power."
    },
    "looks_like": null,
    "why": "A dryer should not be secretly optimal.",
    "cost_to_build": "code-small",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 5,
    "kind": "problem",
    "id": "problem-comfort-line",
    "title": "The Comfort Line Is Not Defined Yet",
    "data": {
      "id": "problem-comfort-line",
      "issue": "Warm Hands, Bigger Basket, Sorting by Feel, Odd Eye, and Knows the Drawer already change difficulty. The new rule I would write is: a comfort may reduce motor or visibility friction, but may not identify the correct twin, change timer/streak math, change payout odds, or alter Daily competitive comparability."
    },
    "looks_like": null,
    "why": "Without a written boundary every cute pocket find becomes a balance argument.",
    "cost_to_build": "data",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 6,
    "kind": "problem",
    "id": "problem-seed-version",
    "title": "Six New Pattern Families Need Seed Versioning",
    "data": {
      "id": "problem-seed-version",
      "issue": "The generator has unused family values, but permanent seeds only stay permanent if old seeds are decoded under a stable mapping. Store a generator version with every sock or guarantee that values 10 through 15 could never have been emitted previously."
    },
    "looks_like": null,
    "why": "Otherwise a future family table change can repaint an old collection, violating the core promise.",
    "cost_to_build": "code-small",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 7,
    "kind": "problem",
    "id": "problem-one-dollar",
    "title": "About One Dollar Undersells the Premium Promise",
    "data": {
      "id": "problem-one-dollar",
      "issue": "The brief wants a crafted paid game with no ads, a huge collectible set, story, room customization, and ongoing authored content. A $0.99 sticker can signal disposable-app expectations and pushes pressure toward IAP. I would test $2.99 as the launch price before adding any shop behavior."
    },
    "looks_like": null,
    "why": "Price is part of presentation, not only revenue.",
    "cost_to_build": "data",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 8,
    "kind": "problem",
    "id": "problem-lint-total",
    "title": "More Decor Makes the 98-Day Lint Completion Longer",
    "data": {
      "id": "problem-lint-total",
      "issue": "The current 19,590-Lint room target is already about 98 target days. Lane D adds dozens more items. Keep individual decor affordable and stop treating owning every decor item as a normal completion target. The room should be a menu of taste, not a catalog debt."
    },
    "looks_like": null,
    "why": "A cozy decorator should feel choice-rich, not behind.",
    "cost_to_build": "data",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 9,
    "kind": "problem",
    "id": "problem-reunion-cadence",
    "title": "The 75-Reunion Story Ending Has No Stated Cadence",
    "data": {
      "id": "problem-reunion-cadence",
      "issue": "The brief gives Reunion milestones but not how often odd socks appear or mates return. That means nobody can judge whether page 12 is a month away or effectively unreachable. The build should log median Loads per Reunion and set an internal target before launch."
    },
    "looks_like": null,
    "why": "The emotional hook needs measurable pacing even if the player never sees a progress bar.",
    "cost_to_build": "code-small",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 10,
    "kind": "problem",
    "id": "problem-streak-calendar",
    "title": "The 'Streak Wall Calendar' Fights the No-Streak Law",
    "data": {
      "id": "problem-streak-calendar",
      "issue": "Even if it is only decor, the word streak strongly implies the exact retention mechanic the brief rejects. Rename it 'Laundry Wall Calendar' or 'Things We Did This Month' unless it truly tracks something else."
    },
    "looks_like": null,
    "why": "Premium tone includes not accidentally borrowing free-to-play vocabulary.",
    "cost_to_build": "data",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 11,
    "kind": "problem",
    "id": "problem-hero-variety-difficulty",
    "title": "Hero Packs Are Not Purely Cosmetic in Practice",
    "data": {
      "id": "problem-hero-variety-difficulty",
      "issue": "Adding sixty highly distinctive socks increases the visual vocabulary a player must learn, while some hero socks may be easier to spot than procedural near-twins. That is fine, but do not call packs difficulty-neutral. Keep hero frequency low enough that a purchased pack does not dilute decoys into easier piles."
    },
    "looks_like": null,
    "why": "Collection variety should not accidentally become an advantage.",
    "cost_to_build": "code-small",
    "confidence": 0.95
  },
  {
    "lane": "J",
    "rank": 12,
    "kind": "problem",
    "id": "problem-thumbnail-review",
    "title": "The 96-Pixel Law Needs a Production Test",
    "data": {
      "id": "problem-thumbnail-review",
      "issue": "A written design can still fail at thumbnail size. Add an automated contact sheet that renders every hero sock at 96 px, 64 px, and heap distance beside its nearest-color procedural sock before a build is approved."
    },
    "looks_like": null,
    "why": "This is the cheapest way to protect the best art direction rule in the brief.",
    "cost_to_build": "code-small",
    "confidence": 0.95
  }
]
```
