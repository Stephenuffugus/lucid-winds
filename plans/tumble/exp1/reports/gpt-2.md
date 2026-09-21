# TUMBLE IDEAS 2: GPT-5.6 Sol

Build target: `20260921b`

This is a deliberately separate second idea bank. I cross-checked it against the first `TUMBLE-IDEAS-GPT-5.6-Sol.md` machine-merge list and did not reuse any previous idea title or ID. It starts with Lane F, as requested, then continues through the remaining Part 4 lanes.


# Lane F: The Economy

## F1. Diagnosis

The current Quarter system feels stingy because the desirable currency is almost completely invisible during ordinary competent play. A player can make forty correct sock decisions in a Regular Load, recover every missed toss, enjoy the whole physical loop, and still receive zero of the currency attached to dryers and hero packs. The deeper problem is not that the catalog is numerically too expensive; it is that progress toward it is binary and delayed. This second proposal fixes that differently from my first answer: **count every found coin at face value in one purse, display machine/pack prices as real dollars and cents, and keep Lint completely separate.** Ordinary laundry produces some change; care produces noticeably more; no miss can confiscate money that already hit the purse.

## F2. The coins, ranked best first

Shared rule: once a coin visibly reaches the purse tray, it is banked permanently. A later miss cannot remove it. The `Regular expected` values below are tuning contributions whose sum is **40¢ per relaxed Regular Load**; they are not probabilities shown to players.

| Rank | Moment | What the player sees/hears | Coins | How often / size scaling | Regular expected | Build |
|---:|---|---|---|---|---:|---|
| 1 | **Window Static Slide** | one coin skates slowly down the glass, hangs at the rubber lip, then drops onto the table with a bright ring | penny 40%, nickel 35%, dime 20%, quarter 5% | Every Load. Small 45%, Regular 75%, Heavy 100%, Mountain 100% plus a second draw at 45%. | 5¢ | `code-small` |
| 2 | **Change in the Heap** | one or more coins bounce free from between socks, wobble on the table, then slide to the purse tray | penny 45%, nickel 30%, dime 20%, quarter 5% | Small 1 draw, Regular 2, Heavy 3, Mountain 4. Draws happen before play, so they can never be lost. | 10¢ | `code-small` |
| 3 | **Clean Basket Liner Coin** | the basket liner relaxes and a hidden coin slides from beneath its hem into the catch tray with one crisp tick | nickel 35%, dime 35%, quarter 30% | Clean Loads only. Small/Regular 1 draw; Heavy/Mountain 2 draws. | 8¢ | `code-small` |
| 4 | **Two Nickels in the Last Cuff** | the last corrected cuff snaps flat and two nickels stuck together separate with a double clink | nickel 100% | Once per Load if every inside-out sock is flipped. Small 5 cents, all larger Loads 10 cents. | 7¢ | `code-small` |
| 5 | **Spotless Pair of Dimes** | two dimes that had been stuck together on the dryer glass peel apart and land a beat apart | dime 100% | Spotless Laundry Day only. Two dimes at every size. | 6¢ | `code-small` |
| 6 | **Dryer-Foot Creep** | a coin slowly walks out from beneath the front dryer foot, pauses, then falls flat with a dull tick | penny 50%, nickel 35%, dime 15% | Small 20%, Regular 55%, Heavy 80%, Mountain 100%. | 2¢ | `code-small` |
| 7 | **Basket-Handle Tick** | the basket handle shivers and a trapped coin taps loose from the hinge into the catch tray | penny 55%, nickel 30%, dime 15% | Once per Load. Requires at least five made shots. Small 35%, Regular 70%, Heavy/Mountain 100%. | 2¢ | `code-small` |
| 8 | **Big-Load Pocket Clatter** | the machine gives one final cough and a small cluster of coins drops from a shallow pocket behind the door | penny 45%, nickel 30%, dime 20%, quarter 5% | Heavy: 2 draws. Mountain: 4 draws. Small and Regular: none. | 0¢ | `code-small` |
| 9 | **Reunion Change** | when the pair touches, a forgotten coin falls from between their cuffs and spins once before banking | penny 20%, nickel 30%, dime 30%, quarter 20% | One draw per Reunion, independent of Load size. | 0¢ | `code-small` |

### Payout target by Load size

| Load | Relaxed average | Clean + all flips, typical | Spotless, typical |
|---|---:|---:|---:|
| Small, 10 pairs | ~24¢ | ~38¢ | ~58¢ |
| Regular, 20 pairs | **40¢** | ~55¢ | ~75¢ |
| Heavy, 35 pairs | ~60¢ | ~82¢ | ~$1.02 |
| Mountain, 50 pairs | ~80¢ | ~$1.08 | ~$1.28 |

Those are internal tuning targets. The player sees pennies, nickels, dimes and quarters, not an expected-value table.

## F3. How the money is counted: choose **(a), one purse and real dollars/cents**

**Build:** `code-large`.

Every coin is worth exactly what it says. The old Quarter price is converted at 25¢ per Quarter: 8Q becomes **$2.00**, 10Q becomes **$2.50**, 12Q becomes **$3.00**, 15Q becomes **$3.75**, and 20Q becomes **$5.00**. The purse is a small worn canvas object beside the dryer with four stitched denomination pockets. The UI can show `$1.87`, but the room still shows actual mixed change.

**Lint stays.** Lint remains the soft currency for room decor, baskets, radios, ball styles and trails. Change remains the harder, laundry-specific currency for dryers and hero packs. I would not let one replace the other.

**Comfort line:** a comfort may reduce reach, gesture precision, sensory load, navigation friction, or repetitive recovery in **Laundry Day**. It may not identify the correct twin, remove a decoy, add Rush time, protect a streak, alter payout odds, or improve Daily comparability. Essential accessibility settings should never be locked behind a find or peg at all.

## F4. The arithmetic

At the 40¢ Regular-Load target:

| Player | Rate | Change earned | First current dryer: $2.00 | First hero pack: $2.50 | Current 95Q catalog: $23.75 | Current + this proposal's 8 dryers + 5 paid packs: $67.25 |
|---|---:|---:|---:|---:|---:|---:|
| Relaxed | 3 Regular Loads/day | $1.20/day | 1.67 days | 2.08 days | 19.79 days | 56.04 days |
| Long sitting | 10 Regular Loads | $4.00/sitting | Load 5 | during Load 7 | 5.94 sittings | 16.81 sittings |
| Very occasional | 1 Regular Load/week | $0.40/week | 5 weeks | 6.25 weeks | 59.38 weeks | 168.13 weeks |

The completionist number looks long for a one-Load-a-week player, but the **distance to one desired item** is short. That is the important constraint. This proposal adds 124 Quarter-equivalents of dryers and 50 Quarter-equivalents of paid hero packs; the free pack costs nothing.

## F5. Thirty pocket finds, ranked best first

Shared find framework is `code-large`; each individual readable find model is `art`. First-day objects are intentionally ordinary. Late objects become more specific, not more powerful.

| Rank | Find | Rarity | Flavor | Thumbnail | How it comes out / earliest | Shown | Class | Help | Build |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | **Tiny Plastic Dinosaur** | common | “Was brave until the spin cycle.” | a thumb-sized green dinosaur with one pale scuff | Load 1+; tumbles from the center of the sock heap on opening | in a shallow glass dish on the shelf | keepsake | None. | `art` |
| 2 | **The Pencil Stub** | common | “Still has at least one list left.” | a short yellow pencil with pink eraser and blunt graphite tip | Load 1+; rolls from beneath a folded pair after matching | clipped horizontally to the cork board | keepsake | None. | `art` |
| 3 | **Foam Earplug** | common | “Has heard enough, thanks.” | one bright orange foam cylinder, slightly bent | Load 1+; drops from a slipper when turned right-side out | in a tiny clear cup beside the radio | comfort | Unlocks a room-audio focus preset: dryer and radio each gain separate one-tap quiet levels. | `art` |
| 4 | **One Red Die** | uncommon | “Rolled a six before things got complicated.” | a small red cube with cream pips and softened corners | Load 3+; bounces twice from the basket after a made shot | in the glass dish beside the dinosaur | keepsake | None. | `art` |
| 5 | **Arcade Token** | uncommon | “Worth one game somewhere that no longer exists.” | a brass-colored ridged token with a generic starburst | Load 5+; slides down the dryer glass after the socks leave | standing in a little coin easel on the shelf | keepsake | None. | `art` |
| 6 | **Rubber Pencil Grip** | common | “Made handwriting better. Allegedly.” | a chunky purple triangular rubber grip with three finger dents | Load 5+; caught around the cuff of a crew sock | in the glass dish | comfort | Laundry Day only: lets the player move the held sock 12% farther from the thumb for visibility. | `art` |
| 7 | **Tiny Binder Clip** | common | “Holding three things together with inappropriate confidence.” | a miniature black binder clip with silver wire handles | Load 8+; snaps free when a tightly rolled pair is completed | clipped to the edge of the cork board | comfort | Remembers the last Drawer filter and scroll position between visits. | `art` |
| 8 | **Folded Fortune** | uncommon | “The future became mostly blue fuzz.” | a tiny off-white paper strip folded twice, black ink blurred | Load 8+; sticks to the underside of an ankle sock | flattened under glass in a small frame | keepsake | None. | `art` |
| 9 | **Aquarium Stone** | common | “Was never supposed to leave the tank.” | a smooth translucent cobalt glass pebble | Load 10+; appears beneath the last lifted sock | on the windowsill where light shines through it | keepsake | None. | `art` |
| 10 | **Zipper Pull** | common | “The jacket is having a harder day.” | a small silver zipper tab with a broken loop | Load 12+; tinks against the drum as the door opens | hooked over one cork-board tack | comfort | Adds a one-swipe shortcut from room to Drawer; no gameplay effect. | `art` |
| 11 | **Tiny Clothespin** | uncommon | “Has been promoted beyond its qualifications.” | a natural wood miniature clothespin with silver spring | Load 15+; caught in the hem of a knee sock | clipped to a string beneath the cork board | comfort | Laundry Day only: pin one loose sock to the top edge of the table as a temporary parking spot. | `art` |
| 12 | **Pearl Bead** | common | “Escaped something much more formal.” | one off-white bead with a visible center hole | Load 15+; rolls from a dress sock and circles before stopping | in a six-well bead tray on the shelf | keepsake | None. | `art` |
| 13 | **Cufflink With No Shirt** | rare | “The shirt has moved on.” | a square brass cufflink with a dark green enamel center | Load 20+; falls from a dress sock after matching | in a velvet-lined matchbox on the shelf | keepsake | None. | `art` |
| 14 | **Dog-Walk Bag Ring** | common | “The bags are gone. The responsibility remains.” | a small black cardboard tube ring with a torn green wrapper edge | Load 20+; caught inside a rolled cuff | in a shallow tray near the door | keepsake | None. | `art` |
| 15 | **Mini Magnet** | uncommon | “Strong enough for one very small emergency.” | a silver disk magnet with a blue paint chip | Load 22+; clings to the metal basket rim until a shot lands | stuck to the side of the display shelf bracket | comfort | Laundry Day only: missed sock balls roll back to the table edge instead of resting on the floor. | `art` |
| 16 | **Paper Clip Swan** | uncommon | “Had a meeting. Made this instead.” | a silver paper clip bent into a crude swan silhouette | Load 25+; springs from the fold of a pair as it is rolled | pinned upright on the cork board | keepsake | None. | `art` |
| 17 | **Cough Drop Wrapper** | common | “The cough won. The wrapper persisted.” | a crinkled amber cellophane square with twisted ends | Load 25+; peels from the inside of a slipper | pressed flat in the cork-board corner | keepsake | None. | `art` |
| 18 | **Tiny Bell** | rare | “Rings only when nobody asked.” | a pea-sized brass jingle bell with cross-cut opening | Load 30+; audibly jingles inside the drum before appearing | hanging from one lower shelf hook | keepsake | None. | `art` |
| 19 | **Lens Wipe Packet** | uncommon | “Cleaned everything except itself.” | a silver foil square packet with one blue stripe | Load 30+; sticks to the dryer glass after the heap falls | tucked upright in the shelf jar | comfort | Laundry Day only: optionally increases background blur while a sock is held, leaving the sock crisp. | `art` |
| 20 | **Pressed Clover** | rare | “Four leaves. Zero useful predictions.” | a flat dark green four-leaf clover under a wet translucent scrap | Load 35+; found adhered to the outside of a sock after tumbling | under a tiny clear acrylic square on the windowsill | keepsake | None. | `art` |
| 21 | **Pocket Comb Tooth** | common | “The rest of the comb knows what happened.” | a single black plastic comb tooth with broken base | Load 40+; falls from a novelty sock when it is flipped | in the oddities jar | keepsake | None. | `art` |
| 22 | **Plastic Jewel** | uncommon | “Royalty was briefly considered.” | a faceted hot-pink oval plastic gem, foil backing missing | Load 45+; glints between two socks as the pile settles | in the windowsill dish | keepsake | None. | `art` |
| 23 | **Grocery Cart Token** | uncommon | “Prepared for a cart that requires no coin.” | a green plastic coin-shaped token with a keyring hole | Load 50+; found nested inside a sock ball after a successful throw | hung from the purse snap | comfort | Remembers the last selected Load size at the dryer door. | `art` |
| 24 | **Tiny Spring** | rare | “Still waiting to be important.” | a bright steel compression spring about two centimeters long | Load 55+; bounces from the drum lip and lands standing once | upright inside a narrow vial on the shelf | keepsake | None. | `art` |
| 25 | **Parking Punch Card** | uncommon | “One stamp away from absolutely nothing.” | a washed cream card with five faded circle punches | Load 60+; emerges stuck flat to the dryer door glass | pinned to the cork board | keepsake | None. | `art` |
| 26 | **Little Compass Charm** | rare | “Points somewhere. Refuses follow-up questions.” | a tiny round brass compass charm with black needle painted off-center | Load 65+; dangles from a cuff thread until the sock is picked up | on a short hook beside the cork board | would_not_ship | Would point subtly toward the real twin of the held sock. | `art` |
| 27 | **Lucky Green Eraser** | rare | “Has removed more math than mistakes.” | a rectangular green eraser with one rounded used end | Load 70+; drops from a crew sock and leaves a faint green smear | in the school-desk glass dish | would_not_ship | Would remove one decoy from each Laundry Day pile. | `art` |
| 28 | **Tiny Stopwatch** | rare | “Measures exactly how late you already are.” | a silver stopwatch charm with black face and red hand | Load 80+; found tangled in a knee sock cuff | hung from the cork board | would_not_ship | Would add five seconds to every Rush timer. | `art` |
| 29 | **Lint Lottery Token** | rare | “Promises returns it cannot responsibly discuss.” | a cream plastic token with a simple lint-ball spiral | Load 90+; rolls out of the coin purse tray after a Load | in a tiny display stand beside the purse | would_not_ship | Would double Lint from the next Load. | `art` |
| 30 | **The Thimble That Fits Nobody** | once | “Waited one hundred Loads to be slightly too small.” | a worn silver thimble with three neat dents and darkened rim | Exactly on the player's 100th completed Load; it sits alone on top of the folded summary sheet | centered in a tiny velvet niche on the display shelf | keepsake | None. | `art` |

### Sorted by what I would ship

- **Pure keepsake**: Tiny Plastic Dinosaur · The Pencil Stub · One Red Die · Arcade Token · Folded Fortune · Aquarium Stone · Pearl Bead · Cufflink With No Shirt · Dog-Walk Bag Ring · Paper Clip Swan · Cough Drop Wrapper · Tiny Bell · Pressed Clover · Pocket Comb Tooth · Plastic Jewel · Tiny Spring · Parking Punch Card · The Thimble That Fits Nobody
- **Comfort I would ship**: Foam Earplug · Rubber Pencil Grip · Tiny Binder Clip · Zipper Pull · Tiny Clothespin · Mini Magnet · Lens Wipe Packet · Grocery Cart Token
- **A help I thought of and would NOT ship**: Little Compass Charm · Lucky Green Eraser · Tiny Stopwatch · Lint Lottery Token

The four rejected helps fail for concrete reasons: **Little Compass Charm** points toward the correct twin; **Lucky Green Eraser** deletes a decoy; **Tiny Stopwatch** adds Rush time; **Lint Lottery Token** multiplies currency. Those are advantages, not handling comforts.

**First day:** Tiny Plastic Dinosaur, The Pencil Stub, Foam Earplug, One Red Die and Arcade Token can all appear almost immediately. **Hundredth Load:** The Thimble That Fits Nobody is guaranteed exactly once on Load 100. It is not stronger than day-one finds. It matters because the game physically sets it alone on the completed Load sheet, gives it a dedicated velvet niche, and completes the tiny Sewing Drawer tableau.

## F6. Sets

| Rank | Set | Members | What finishing it visibly does | Build |
|---:|---|---|---|---|
| 1 | **The School Desk Pocket** | Tiny Plastic Dinosaur · The Pencil Stub · One Red Die · Rubber Pencil Grip · Lucky Green Eraser | The five objects move from the dish into a little clear-front pencil box labeled ROOM 12; the eraser sits crooked on top. | `code-small` |
| 2 | **Saturday Errands** | Arcade Token · Grocery Cart Token · Parking Punch Card · Lint Lottery Token | The items arrange under a tiny hand-drawn route map on the cork board; a red thread connects four stops but leads nowhere. | `code-small` |
| 3 | **The Desk Drawer That Would Not Close** | Tiny Binder Clip · Zipper Pull · Paper Clip Swan · Tiny Spring | A shallow wooden drawer-box appears on the shelf and remains visibly one millimeter too full to close. | `code-small` |
| 4 | **A Child's Jacket, Probably** | Aquarium Stone · Tiny Bell · Plastic Jewel | The three finds hang in a tiny clear coat-pocket shadow box with a hand-sewn yellow lining. | `code-small` |
| 5 | **The Sewing Drawer** | Pearl Bead · The Thimble That Fits Nobody | The thimble gains a tiny folded scrap of floral fabric beneath it and the bead rests in the dimple on top. | `code-small` |

## F7. Prices

I do **not** think the underlying dryer/pack numbers are the main problem. I would keep their value and only translate the labels from Quarters to money. Existing 8/12/15/20Q dryers therefore become $2.00/$3.00/$3.75/$5.00, and existing 10Q hero packs become $2.50. New content in this file uses Quarter-equivalent costs in its pasteable records so the builder can merge it with today's data, but the player-facing display under this economy would show dollars and cents.

## F8. Four new Lint sinks for a full room

| Rank | Sink | Cost | Visible result | Build |
|---:|---|---:|---|---|
| 1 | **Felted Lint Menagerie** | 50 Lint | Compress 50 Lint into one tiny felt animal for the shelf. There are 24 silhouettes; duplicates become a slightly darker shade, so the row can keep growing. | `art` |
| 2 | **The Paper Chain Around the Shelf** | 20 Lint | Spend 20 Lint to add one colored paper link to a chain draped around the shelf. At 100 links it begins a second loop instead of stopping. | `code-small` |
| 3 | **Postcards From Nowhere** | 75 Lint | Buy a blank postcard from the dryer-top tin; it develops one of 36 fictional landscape prints and is pinned to the wall. No duplicates until all 36 appear. | `code-small` |
| 4 | **Soap-Flake Jar** | 25 Lint | Each 25 Lint adds one visible scoop of colored soap flakes to a tall clear apothecary jar. When full, the player can seal and shelve it, then start another jar. | `code-small` |

## F9. Four empty Clothesline pegs

| Rank | Peg | Earned by | Comfort | Why it stays on the safe side | Build |
|---:|---|---|---|---|---|
| 1 | **Easy Reach** | Match 250 pairs. | Laundry Day only: any missed sock ball returns to the near edge of the table instead of the floor. | It removes a repetitive recovery reach without changing whether a shot counts. | `data` |
| 2 | **Gentle Grip** | Turn 75 inside-out socks right-side out. | The flip gesture accepts a wider vertical swipe angle, but the sock still must be deliberately flipped. | It helps motor precision while preserving the task. | `data` |
| 3 | **No Hunting Through Menus** | Finish 75 Loads. | The dryer door remembers your last Load size and difficulty tier until you change them. | The reward is setup friction removed, not game difficulty removed. | `data` |
| 4 | **Quiet Basket** | Make 500 basket shots. | Adds an optional low-impact basket audio mix that keeps success readable without sharp clinks. | A sensory comfort earned through the exact action whose sound it softens. | `data` |

# Lane A: Six new hero sock packs

Ranked by how many cozy-game adults I expect would want the pack. **Bookstore After Closing should ship free.** Under Lane F, each paid 10Q-equivalent pack displays as **$2.50 of earned pocket change**, not real money.


## A1. Bookstore After Closing — **SHIP FREE**

**Blurb:** Ten socks for people who enter for one book and leave carrying a weather system of paper.

**For:** Readers, library people, stationery people, and anyone whose nightstand has become furniture.

| # | Sock | Silhouette | Rarity | Flavor | Design | Seasonal | Build |
|---:|---|---|---|---|---|---|---|
| 1 | **The Book Face-Down** | crew | common | “Saving the page the dangerous way.” | body #d8c3a5; accents ink #3d342f, page #f3ead8; family solid; cuff contrast rib; heel/toe 1; leg: an open book made from two cream rounded boxes, one page corner folded down | — | `art` |
| 2 | **Library Hold Ready** | ankle | common | “Arrived exactly when you started another book.” | body #446c7a; accents paper #f1b24a, paper2 #d6655a, ink #f4eadb; family stripe; cuff twin stripe; heel/toe 1; leg: a cream book rectangle with a small green HOLD tab sticking from the top and one black check circle | — | `art` |
| 3 | **The Library Receipt** | dress | common | “Due yesterday. Emotionally due next Thursday.” | body #efe7d6; accents ink #30343b, stamp #b44d4d; family stripe; cuff plain rib; heel/toe 0; leg: a long receipt rounded box with short black line segments and one red circle stamp | — | `art` |
| 4 | **Used Book Smell** | slipper | common | “Impossible to draw. Somehow still present.” | body #7c5b45; accents page #dbc8a8, gold #b98c48; family gradient; cuff wide band; heel/toe 1; top of foot: three stacked book rectangles with worn uneven edges | — | `art` |
| 5 | **One More Chapter** | knee | common | “Has made this promise at 1:47 a.m.” | body #2d4665; accents moon #e7dca8, page #f2eadc; family solid; cuff twin stripe; heel/toe 2; leg: a cream crescent moon above a tiny open book | — | `art` |
| 6 | **Shelf Ladder Ambition** | crew | uncommon | “Lives for the unreachable top shelf.” | body #526a4c; accents wood #b47f56, page #eee4cf; family heelToe; cuff contrast rib; heel/toe 2; leg: a tiny ladder made from two vertical thick lines and four short rungs beside three book blocks | — | `art` |
| 7 | **Margin Notes Got Personal** | toe | uncommon | “The author started it.” | body #d6c9b7; accents ink #39424a, red #a94a44; family motifScatter; cuff checker band; heel/toe 1; leg: small black line segments around one red exclamation mark made from a line and circle | — | `art` |
| 8 | **The TBR Chair** | novelty | uncommon | “No longer legally counts as seating.” | body #9b6b53; accents book #d9a85c, book2 #5e7a72, book3 #7b536d; family solid; cuff wide band; heel/toe 2; leg: a brown chair silhouette built from rounded boxes almost buried under three colored book rectangles | — | `art` |
| 9 | **First Edition, Probably Not** | dress | rare | “The pencil price says otherwise.” | body #3e3748; accents gold #c9a45c, cream #ede0c4; family fairIsle; cuff triple stripe; heel/toe 3; leg: one ornate-looking book rectangle with gold border lines and a cream diamond | — | `art` |
| 10 | **Bookshop Cat Is Management** | slipper | rare | “Has denied your return request.” | body #66574d; accents cat #d9a264, book #68809b; family solid; cuff scalloped; heel/toe 2; top of foot: orange cat head motif sitting above two stacked book rectangles | autumn | `art` |

## A2. Office Kitchen Evidence — 10 Quarter-equivalents / $2.50 earned change

**Blurb:** Ten socks from the break room nobody technically owns but everyone has opinions about.

**For:** Office workers, teachers, remote-work veterans, and survivors of communal refrigerators.

| # | Sock | Silhouette | Rarity | Flavor | Design | Seasonal | Build |
|---:|---|---|---|---|---|---|---|
| 1 | **Mug in the Sink Since Monday** | crew | common | “Nobody recognizes it. Everybody recognizes it.” | body #d7e1df; accents mug #6f9ca3, sink #bfc6c8; family solid; cuff contrast rib; heel/toe 1; leg: a blue mug rounded box with handle circle sitting in a grey basin half-oval | — | `art` |
| 2 | **Reply All at 4:58** | ankle | common | “Could have been tomorrow.” | body #edf0e9; accents red #c85b55, ink #45505a; family stripe; cuff plain rib; heel/toe 1; leg: a white envelope rounded box with one red upward arrow | — | `art` |
| 3 | **Someone's Yogurt, Ancient** | slipper | common | “The date has become a suggestion.” | body #d5e7d2; accents cup #f0eee4, lid #899b7a; family polka; cuff dotted band; heel/toe 1; top of foot: a small white cup trapezoid with a green lid line and one suspicious grey dot | — | `art` |
| 4 | **The Good Stapler** | dress | common | “Lives in a drawer for its own protection.” | body #4e5663; accents metal #c3c7c8, red #a34848; family heelToe; cuff wide band; heel/toe 2; leg: a dark rounded stapler shape made from two offset boxes and a silver hinge circle | — | `art` |
| 5 | **Conference Room Pretzels** | crew | common | “The bowl outlived the meeting.” | body #c9a56d; accents pretzel #7b4f35, salt #f1e5ca; family motifScatter; cuff twin stripe; heel/toe 1; leg: one large brown pretzel built from a looping thick line with six tiny cream salt circles | — | `art` |
| 6 | **Printer Says Paper Jam** | knee | uncommon | “There is no paper jam.” | body #c9ced1; accents paper #f4f1e9, warning #d29c3f; family stripe; cuff checker band; heel/toe 2; leg: a grey printer rounded box ejecting a white paper rectangle beside a yellow warning triangle | — | `art` |
| 7 | **Fridge Note in All Caps** | novelty | uncommon | “It is about the milk.” | body #f2e7a9; accents ink #30343a, tape #d6c49b; family solid; cuff contrast rib; heel/toe 1; leg: a yellow note square with five thick black horizontal lines and two tape strips | — | `art` |
| 8 | **Desk Snack Emergency** | toe | uncommon | “Three almonds would have fixed everything.” | body #8e5f4a; accents bag #d7b85a, crumb #f0dfbd; family gradient; cuff triple stripe; heel/toe 2; leg: a crinkled snack bag polygon with three little crumb circles | — | `art` |
| 9 | **Calendar Invite: Mysterious** | dress | rare | “Accepted by twelve people. Understood by none.” | body #5d7693; accents white #f3efe5, green #6b9c76, red #c85f5c; family plaid; cuff wide band; heel/toe 2; leg: a white calendar square with one green check and one red question mark built from thick lines | — | `art` |
| 10 | **The Refrigerator Lunch Heist** | knee | rare | “The container was clearly labeled.” | body #314b55; accents box #d9c9a8, label #f4efe6, red #b6534d; family solid; cuff checker band; heel/toe 3; leg: a lunch container rounded box with white label and one tiny red mask shape made from two ellipses | — | `art` |

## A3. Cottage Chore Club — 10 Quarter-equivalents / $2.50 earned change

**Blurb:** Ten domestic little victories for people who romanticize chores until the mosquitoes arrive.

**For:** Cottagecore adults, gardeners, bakers, menders, and people who own more baskets than necessary.

| # | Sock | Silhouette | Rarity | Flavor | Design | Seasonal | Build |
|---:|---|---|---|---|---|---|---|
| 1 | **Sheets on the Line** | knee | common | “Smells like wind and one clothespin.” | body #dce7e6; accents sheet #f5f0e5, pin #b98b56; family stripe; cuff plain rib; heel/toe 1; leg: two white sheet rectangles on a line with three tiny clothespin rectangles | spring | `art` |
| 2 | **Jam Jar Lid** | ankle | common | “Sticky around the edge, spiritually.” | body #c24f55; accents jar #e6d6be, fruit #8b4051; family polka; cuff scalloped; heel/toe 2; top of foot: a gingham-like lid circle above a pale jar rounded box with berry dots | summer | `art` |
| 3 | **Mended Elbow Energy** | crew | common | “The patch is stronger than the original plan.” | body #8b806e; accents patch #c98e62, thread #ece0c8; family plaid; cuff contrast rib; heel/toe 2; leg: one large tan patch rounded box crossed by four cream stitch line segments | — | `art` |
| 4 | **Bread Cooling by the Window** | slipper | common | “Touching it early remains under consideration.” | body #d9b278; accents loaf #b87846, steam #efe6d5; family gradient; cuff wide band; heel/toe 1; top of foot: a brown loaf half-oval with three score lines and two pale steam curves made from segmented lines | — | `art` |
| 5 | **Herb Bundle Upside Down** | dress | common | “Drying with excellent posture.” | body #677b58; accents leaf #a4b376, twine #c7a67d; family motifScatter; cuff twin stripe; heel/toe 1; leg: three leaf motifs hanging downward from one tan twine line | autumn | `art` |
| 6 | **Mushroom Basket, No Guarantees** | crew | uncommon | “Identifications remain a group project.” | body #b7a17f; accents basket #8e6847, cap #c86f55, cream #eee4cc; family solid; cuff checker band; heel/toe 2; leg: a woven basket half-oval holding three mushroom stock motifs in two colors | autumn | `art` |
| 7 | **Rain Barrel Full** | knee | uncommon | “We asked for rain. It overachieved.” | body #5e7c89; accents barrel #465e66, water #9fc4cd; family stripe; cuff wide band; heel/toe 2; leg: a dark barrel rounded box with three horizontal bands and blue water line at top | spring | `art` |
| 8 | **The Good Mending Scissors** | toe | uncommon | “Not for paper. This remains important.” | body #7e5c68; accents steel #c9c8c1, thread #e0b060; family heelToe; cuff dotted band; heel/toe 2; leg: small scissors made from two circle handles and crossing thick lines beside one gold thread curl | — | `art` |
| 9 | **Porch Broom With One Good Corner** | novelty | rare | “The other corner retired last spring.” | body #9a7254; accents straw #d4b16b, handle #65705f; family stripe; cuff scalloped; heel/toe 3; leg: a broom made from one green thick handle line and a gold straw fan polygon worn shorter on one side | spring | `art` |
| 10 | **The Lantern Walk Home** | knee | rare | “The path knows you by now.” | body #293b42; accents lamp #d9aa55, path #7d6c55; family gradient; cuff triple stripe; heel/toe 3; leg: a glowing yellow lantern rounded box above a winding path made from three thick line segments | autumn | `art` |

## A4. Weather Has Plans — 10 Quarter-equivalents / $2.50 earned change

**Blurb:** Ten forecasts for people who check the radar before deciding whether pants are happening.

**For:** Weather watchers, window people, storm lovers, snow skeptics, and anyone with three weather apps.

| # | Sock | Silhouette | Rarity | Flavor | Design | Seasonal | Build |
|---:|---|---|---|---|---|---|---|
| 1 | **Twenty Percent Chance** | ankle | common | “It rained exactly on you.” | body #8aa0ad; accents cloud #dce2df, drop #5f87a5; family solid; cuff twin stripe; heel/toe 1; leg: one pale cloud motif with exactly one blue raindrop beneath it | spring | `art` |
| 2 | **Wind Advisory Hair** | novelty | common | “No amount of planning survived outside.” | body #d5b986; accents wind #eef1e8, leaf #8aa26e; family gradient; cuff plain rib; heel/toe 1; leg: three white sweeping line segments carrying one green leaf motif | spring | `art` |
| 3 | **Car Thermometer Says 103** | crew | common | “The pavement agrees.” | body #d98255; accents sun #f3c85f, road #5f5a56; family stripe; cuff contrast rib; heel/toe 2; leg: yellow sun motif above two dark road lines with short heat-wave segments | summer | `art` |
| 4 | **First Frost on the Car** | dress | common | “Beautiful until the scraper enters.” | body #8fa7b7; accents ice #e8f0ee, glass #5f7180; family fairIsle; cuff wide band; heel/toe 1; leg: a dark windshield rounded box edged with pale snowflake and diamond shapes | autumn | `art` |
| 5 | **Humidity Has Entered the Chat** | slipper | common | “Everything is slightly attached to everything.” | body #7ea39a; accents drop #bdd9cf, hair #4f645f; family polka; cuff scalloped; heel/toe 1; top of foot: three oversized pale raindrops around one spiraling dark line | summer | `art` |
| 6 | **Radar Blob at Dinner** | knee | uncommon | “Red means put the chairs inside.” | body #394b5b; accents green #68a572, yellow #e2c257, red #c95650; family gradient; cuff checker band; heel/toe 2; leg: three nested irregular rounded blobs in green yellow red centered on one dark circle | summer | `art` |
| 7 | **Snow Day at 5:12 A.M.** | slipper | uncommon | “Checked the phone before both eyes opened.” | body #dce7ee; accents screen #394b5b, snow #ffffff; family solid; cuff dotted band; heel/toe 2; top of foot: a dark phone rounded box showing three white snowflakes and a pale clock line | winter | `art` |
| 8 | **Porch Thunder Count** | crew | uncommon | “One Mississippi remains legally binding.” | body #4a5367; accents bolt #e1c65a, cloud #aab2b8; family chevron; cuff triple stripe; heel/toe 2; leg: grey cloud motif with one large yellow bolt motif and three counting dots | summer | `art` |
| 9 | **The Weather Rock** | toe | rare | “Wet means rain. Missing means wind.” | body #6f6b63; accents rock #9d9588, sign #d2bd8c; family heelToe; cuff contrast rib; heel/toe 3; leg: one grey oval rock hanging from a tan line beneath a tiny sign rectangle | — | `art` |
| 10 | **Clear Night, Windows Open** | knee | rare | “The house is finally breathing.” | body #27364d; accents star #eee1a7, window #7696a5; family motifScatter; cuff wide band; heel/toe 2; leg: an open blue window made from four line segments with three yellow stars outside | summer | `art` |

## A5. Astrology Department — 10 Quarter-equivalents / $2.50 earned change

**Blurb:** Ten cosmic excuses, charts, moons and extremely confident little conclusions.

**For:** Horoscope readers, moon-calendar people, witchy-cozy players, and friends who ask birth times.

| # | Sock | Silhouette | Rarity | Flavor | Design | Seasonal | Build |
|---:|---|---|---|---|---|---|---|
| 1 | **Mercury Did It** | crew | common | “Would like the record corrected retroactively.” | body #4d5273; accents planet #b7aacb, line #e8dcae; family motifScatter; cuff twin stripe; heel/toe 1; leg: one small planet motif with a looping backward arrow made from thick line segments | — | `art` |
| 2 | **Birth Time, Please** | ankle | common | “Approximately is apparently not acceptable.” | body #d7c7b4; accents clock #594b5d, star #bf8e68; family solid; cuff contrast rib; heel/toe 1; leg: a simple clock circle with two hands beside one star motif | — | `art` |
| 3 | **Moon Water on the Sill** | slipper | common | “Charged overnight. Forgot why.” | body #567185; accents jar #dce8e5, moon #e8d9a4; family gradient; cuff scalloped; heel/toe 1; top of foot: a pale jar rounded box containing a yellow crescent moon | — | `art` |
| 4 | **The Group Chat Chart** | dress | common | “Everyone has been assigned a planet.” | body #6e5b78; accents line #d8c6a3, dot #a9c2c1; family plaid; cuff dotted band; heel/toe 1; leg: thin intersecting lines linking five colored dot circles like a birth chart | — | `art` |
| 5 | **New Moon Plans** | knee | common | “Excellent time to buy another notebook.” | body #2d3445; accents moon #111820, gold #d1ad63; family solid; cuff wide band; heel/toe 2; leg: a nearly black moon circle edged by one gold crescent line above a notebook rectangle | — | `art` |
| 6 | **Rising Sign Reveal** | crew | uncommon | “Explained everything for nearly eleven minutes.” | body #a77b6e; accents sun #e3bd67, horizon #5f6d74; family stripe; cuff triple stripe; heel/toe 2; leg: half a yellow sun motif rising above three horizontal line segments | — | `art` |
| 7 | **Crystal on the Laptop** | toe | uncommon | “Cybersecurity remains unconvinced.” | body #526b69; accents crystal #b9d2c7, screen #343f46; family heelToe; cuff checker band; heel/toe 2; leg: a dark laptop rounded box with one pale faceted crystal polygon sitting on it | — | `art` |
| 8 | **Retrograde Appointment** | novelty | uncommon | “Rescheduled itself somehow.” | body #7b5265; accents calendar #efe5d4, arrow #d39963; family chevron; cuff plain rib; heel/toe 1; leg: a cream calendar square with one orange arrow curling backward | — | `art` |
| 9 | **The Very Specific Transit** | dress | rare | “Apparently this explains Tuesday.” | body #263b55; accents orbit #d6b76d, planet #9ab2c9, planet2 #c57c75; family motifScatter; cuff wide band; heel/toe 3; leg: two planet motifs connected by three gold orbital arc line segments | — | `art` |
| 10 | **Constellation You Invented** | knee | rare | “The stars have declined to comment.” | body #1f2a3d; accents star #f0df9f, line #8097ad; family solid; cuff triple stripe; heel/toe 2; leg: seven star motifs joined by pale line segments into an unmistakable sock shape | — | `art` |

## A6. Small Town Saturday — 10 Quarter-equivalents / $2.50 earned change

**Blurb:** Ten local errands, parking lots and tiny civic events that somehow become the whole day.

**For:** People from small towns, exurban adults, regional-pride players, and anyone who knows a good church-basement sale.

| # | Sock | Silhouette | Rarity | Flavor | Design | Seasonal | Build |
|---:|---|---|---|---|---|---|---|
| 1 | **Hardware Store Before Breakfast** | crew | common | “Already smells like keys and fertilizer.” | body #6c7a63; accents bucket #d0b46c, key #b9bec0; family solid; cuff contrast rib; heel/toe 1; leg: a yellow bucket rounded box beside a simple silver key made from circle and line | — | `art` |
| 2 | **Library Book Sale Dollar Bag** | ankle | common | “The bag was the limiting factor.” | body #d9c39e; accents book #6d8192, book2 #a66159; family stripe; cuff twin stripe; heel/toe 1; leg: a tan paper bag polygon holding two colored book rectangles | spring | `art` |
| 3 | **Fire Hall Pancake Breakfast** | crew | common | “The coffee arrived before the fork.” | body #b54b43; accents plate #eee2c8, pancake #d6a15c; family polka; cuff wide band; heel/toe 2; leg: a cream plate circle holding three pancake ovals and one tiny square butter | spring | `art` |
| 4 | **Yard Sale Extension Cord** | knee | common | “Tested once, somewhere else.” | body #c6a34d; accents cord #3f4441, tag #f0e0c2; family solid; cuff checker band; heel/toe 1; leg: a coiled black thick line with one cream price-tag rectangle | summer | `art` |
| 5 | **County Road Detour** | dress | common | “Adds twelve minutes and one excellent barn.” | body #d9b85d; accents orange #d77c46, road #55585a; family chevron; cuff plain rib; heel/toe 2; leg: an orange diamond sign with black arrow line above two road stripes | summer | `art` |
| 6 | **The Good Farmstand Tomato** | slipper | uncommon | “Purchased with exact change and unreasonable hope.” | body #d5b67d; accents tomato #c84f47, leaf #63845d; family motifScatter; cuff scalloped; heel/toe 2; top of foot: one large red tomato circle with green leaf motif crown | summer | `art` |
| 7 | **Parade Chair Saved at Dawn** | toe | uncommon | “Nobody is stealing this spot.” | body #55758f; accents chair #e8d6b2, flag #b85b55; family heelToe; cuff triple stripe; heel/toe 1; leg: a folding chair made from thick lines with one tiny red pennant triangle | summer | `art` |
| 8 | **Thrift Store Half-Off Color** | ankle | uncommon | “Today it is yellow. Apparently.” | body #d6c75f; accents tag #eee7d4, ink #5a5550; family gradient; cuff dotted band; heel/toe 2; leg: three hanging price-tag polygons, center one yellow | — | `art` |
| 9 | **Town Hall Clock Two Minutes Fast** | dress | rare | “Has been correct twice a day for decades.” | body #6f5b4e; accents clock #e1d0ae, brick #9b6753; family plaid; cuff wide band; heel/toe 3; leg: a simple brick tower of rounded boxes topped by one cream clock circle | — | `art` |
| 10 | **Last Car at the Craft Fair** | novelty | rare | “Bought jam. Forgot where parking happened.” | body #3f5c65; accents car #c97c58, jar #d9b56f; family solid; cuff contrast rib; heel/toe 2; leg: a tiny rust-colored car made from rounded box and wheel circles beside a gold jam jar | autumn | `art` |

### Pack desirability ranking

1. **Bookstore After Closing** — Readers, library people, stationery people, and anyone whose nightstand has become furniture.
2. **Office Kitchen Evidence** — Office workers, teachers, remote-work veterans, and survivors of communal refrigerators.
3. **Cottage Chore Club** — Cottagecore adults, gardeners, bakers, menders, and people who own more baskets than necessary.
4. **Weather Has Plans** — Weather watchers, window people, storm lovers, snow skeptics, and anyone with three weather apps.
5. **Astrology Department** — Horoscope readers, moon-calendar people, witchy-cozy players, and friends who ask birth times.
6. **Small Town Saturday** — People from small towns, exurban adults, regional-pride players, and anyone who knows a good church-basement sale.

**Free pack:** Bookstore After Closing. Reading is broad enough to demonstrate what hero socks are, the designs are immediately legible, and giving it away makes the Drawer feel authored before the player spends any earned change.


# Lane B: Six new procedural pattern families

These consume the six remaining family values. They use only stripes, dots, lines and simple shapes; no motif, cuff, silhouette or condition tables change.

| Rank | Family | What it looks like / how drawn | How twins differ | Convincing decoy | Build |
|---:|---|---|---|---|---|
| 1 | **Herringbone** | Repeated short diagonal line segments meet in alternating V columns, creating a woven chevron texture without using the chevron family's broad color bands. | Twin identity comes from V width, column spacing, line thickness, and whether adjacent columns point inward or outward. | Keep palette and spacing identical but reverse one center column's V direction; at heap size it looks right until compared side by side. | `code-small` |
| 2 | **Basketweave** | Pairs of short horizontal bars alternate with pairs of vertical bars in a chunky over-under grid. | Twins match the bar length, gap, two-by-two grouping, and phase of the alternating blocks. | Shift one row by half a block so one over-under crossing lands in the wrong place. | `code-small` |
| 3 | **Contour Lines** | Four to seven nested irregular closed loops made from thick line segments, like a simplified topographic map wrapped around the sock. | Twin identity comes from loop count, the location of the tightest cluster, and whether one loop pinches near the ankle. | Move the innermost loop to the opposite side while preserving color and outer loops. | `code-small` |
| 4 | **Offset Tiles** | Rounded rectangles form staggered brick-like rows with a small consistent gap; rows alternate between full tiles and half-offset tiles. | Twins match tile height, row offset rhythm, gap width, and which color occupies the first row. | Keep colors identical but start one middle row unshifted instead of half-shifted. | `code-small` |
| 5 | **Pebble Rings** | Small dots are grouped into loose rings of five or six around occasional empty centers, with no new motif shapes. | Twins match ring size, dot count, and the rhythm of empty centers. | Replace one six-dot ring with a five-dot ring in the same position so the overall texture remains convincing. | `code-small` |
| 6 | **Diagonal Sash** | One broad diagonal band crosses the leg and foot, edged by two thin parallel lines; smaller echo bands can repeat once. | Twins match band angle, width, edge-line count, and where the diagonal crosses the heel area. | Mirror the sash angle while keeping the same palette and stripe widths. | `code-small` |

# Lane C: Eight new dryers

| Rank | Dryer | Look | How socks arrive | Sound | Price | Arrival implementation | Build |
|---:|---|---|---|---|---:|---|---|
| 1 | **Cedar Drying Cabinet** | model `cedarCabinet`, #8a5f3e | Two cedar doors open; three shallow slatted shelves tilt in sequence and let socks slide onto the table in three soft little avalanches. | wood latch click, three cloth slides, low cabinet creak | 14Q | NEW `shelfCascade` behavior | `code-small` |
| 2 | **Ceiling Pulley Airer** | model `pulleyAirer`, #d8c6a2 | A ceiling rack lowers into frame with socks draped over its rails; each rail tips and releases one row, then the rack rises away. | rope pulley whisper, wood knock, cloth flump | 18Q | NEW `rowDrop` behavior | `code-small` |
| 3 | **Rolling Quilt Cart** | model `quiltCart`, #927456 | A low wooden laundry cart rolls to the table, tips one padded side, and the whole Load slides out in the normal heap. | small caster rattle, wood latch click, broad cloth slide | 9Q | old `regular` behavior, new art | `art` |
| 4 | **Green Enamel Wringer** | model `wringer`, #6f866c | Pairs emerge flattened between two rubber rollers one sock at a time, drape over a tray, then all slide onto the table together at the end. | rubber roller squeak, enamel tick, final tray clack | 20Q | NEW `wringerFeed` behavior | `code-small` |
| 5 | **Sun Porch Drying Horse** | model `dryingHorse`, #c99b65 | A wooden folding rack rolls forward; alternate rails fold inward and release small clusters from left, right, left, right. | small wooden hinge clicks, cloth brushing wood | 13Q | NEW `rackFold` behavior | `code-small` |
| 6 | **Three-Drum Laundromat Bank** | model `tripleDrum`, #b9c0bd | Three small round doors unlatch from top to bottom; each drops roughly one third of the Load before the next opens. | three descending latch clunks, short drum hums | 22Q | NEW `threeWaves` behavior | `code-small` |
| 7 | **Heat-Pump Cube** | model `heatPump`, #e7e3dc | A quiet modern square door opens flush and the normal heap tumbles out from a deep dark drum. | soft relay click, muted low fan, padded door stop | 11Q | old `regular` behavior, new art | `art` |
| 8 | **Wall-Mounted Spin Canister** | model `spinCanister`, #d6d0c4 | A narrow vertical canister stops spinning; its lower iris opens and socks fall into a shallow circular cradle, which tips the whole ring onto the table. | descending motor whirr, iris snick, canvas cradle flop | 17Q | NEW `ringRelease` behavior | `code-small` |

# Lane D: The room


## Twelve rugs

| Rank | Item | Price | Look | Why | Build |
|---:|---|---:|---|---|---|
| 1 | **Old Red Medallion Rug** | 320 Lint | A faded brick-red medallion rug with a cream center and worn corners. | A rich, instantly premium floor anchor that makes the mint dryer pop. | `art` |
| 2 | **Granny Square Rug** | 300 Lint | Oversized crocheted squares in muted tomato, gold, teal and cream. | Texture and nostalgia read clearly even from the fixed camera. | `art` |
| 3 | **Blue Ripple Oval** | 260 Lint | An oval braided rug with soft concentric blue ripples. | Calm color movement without visual clutter. | `art` |
| 4 | **Olive Stripe Kilim** | 280 Lint | A flat woven olive rug with narrow cream and rust stepped stripes. | Feels collected rather than gamey and photographs well. | `art` |
| 5 | **Wildflower Border Rug** | 340 Lint | A warm flax field with a simple ring of oversized meadow flowers around the edge. | The empty center keeps socks readable while the border adds personality. | `art` |
| 6 | **Cloud Blue Shag** | 360 Lint | A thick pale-blue shag rug with an uneven hand-trimmed edge. | Softness is visible from across the room and changes the room silhouette. | `art` |
| 7 | **Ochre Block Rug** | 240 Lint | Chunky offset ochre, cream and charcoal rectangles in a flat woven grid. | A modern graphic option with one strong shape language. | `art` |
| 8 | **Cream Rug With One Scribble** | 220 Lint | A plain cream rug crossed by one wandering charcoal line that almost forms a sock. | Deadpan minimalism gives the room an art-school option. | `art` |
| 9 | **Quilted Star Rug** | 310 Lint | A low-pile navy rug built from large quilt-block stars and warm cream diamonds. | Big geometry reads at thumbnail size without needing fine detail. | `art` |
| 10 | **Pebble Wool Rug** | 250 Lint | A nubby grey-brown wool rug with rounded pebble-shaped tufts. | A neutral rug that still looks tactile and expensive. | `art` |
| 11 | **Citrus Slice Round Rug** | 200 Lint | A round mustard rug divided into eight pale wedge segments. | Cheerful, graphic, and easy to model. | `art` |
| 12 | **Green River Runner** | 270 Lint | A long green runner with one pale winding band from end to end. | A quiet landscape-like shape that leads the eye toward the dryer. | `art` |

## Eight windows

| Rank | Item | Price | Look | Why | Build |
|---:|---|---:|---|---|---|
| 1 | **Neighbor's Laundry Line** | 320 Lint | A neighboring yard where three shirts move gently on a clothesline and occasionally disappear indoors. | It mirrors the game's subject without repeating the player's own socks. | `art` |
| 2 | **7:42 School Bus** | 340 Lint | A quiet suburban street; once each morning view cycle a small yellow bus crosses and is gone. | A tiny timed event makes the view feel inhabited without rewarding attendance. | `art` |
| 3 | **First Frost Window** | 300 Lint | Frost feathers the lower corners while the yard beyond stays green-brown and still. | A seasonal-feeling view distinct from full snow. | `art` |
| 4 | **Golden Hour Alley** | 280 Lint | A narrow brick alley lit by low orange sun, with one long moving shadow. | Warm dramatic light gives the whole room a second personality. | `art` |
| 5 | **Backyard Feeder Window** | 360 Lint | A small feeder hangs near the glass; one or two generic birds visit and leave between Loads. | Small life outside the room adds calm motion without another indoor animal. | `art` |
| 6 | **Windy Maple Window** | 330 Lint | A maple branch sweeps in and out of frame; a few broad leaves tumble past. | Motion is legible and restrained, ideal for a fixed camera. | `art` |
| 7 | **Porch Light at Night** | 300 Lint | Dark yard, one warm porch light, occasional moth-sized silhouettes circling far outside. | A cozy night scene with no storm, city, or moon spectacle. | `art` |
| 8 | **Cottonwood Afternoon** | 290 Lint | Soft white cottonwood fluff drifts sideways across a bright late-spring yard. | A nearly weightless moving view that reads instantly as a season. | `art` |

## Six lamps

| Rank | Item | Price | Look | Why | Build |
|---:|---|---:|---|---|---|
| 1 | **Ceramic Mushroom Lamp** | 380 Lint | A squat ceramic mushroom lamp with a rust-red cap and warm cream glow. | The silhouette is trendy, cozy and immediately legible. | `art` |
| 2 | **Task Lamp With the Heavy Base** | 300 Lint | A squat dark-green task lamp with a wide weighted base and short angled neck. | Industrial enough to contrast the soft room without feeling cold. | `art` |
| 3 | **Woven Cane Lamp** | 420 Lint | A small lamp with a cane cylinder shade that casts broad striped shadows. | The shade changes both object and light pattern, multiplying its value. | `art` |
| 4 | **Accordion Porcelain Lamp** | 500 Lint | A cream porcelain lamp built from stacked accordion-like rings with a warm amber shade. | A premium statement lamp without copying any branded stained-glass pattern. | `art` |
| 5 | **Warm Rock Lamp** | 340 Lint | An irregular amber-orange stone lamp on a tiny dark wood base. | One glowing lumpy mass gives night scenes a different material. | `art` |
| 6 | **Punched Tin Lamp** | 360 Lint | A small dark tin lantern perforated with simple circles and diamonds. | It paints restrained dots of warm light on the nearby wall. | `art` |

## Ten more items in existing slots

| Rank | Item | Slot | Price | Look | Build |
|---:|---|---|---:|---|---|
| 1 | **Prayer Plant** | `plant` | 180 Lint | A low pot of striped oval leaves that angle upward in the evening. | `art` |
| 2 | **String of Hearts** | `plant` | 220 Lint | Long fine vines dotted with paired heart-shaped leaves spilling from a small pot. | `art` |
| 3 | **Mug That Became a Pencil Cup** | `mug` | 110 Lint | A cream mug holding three pencils and one paintbrush; nobody drinks from it now. | `art` |
| 4 | **Faded Campfire Mug** | `mug` | 100 Lint | A blue enamel mug with a tiny cream campfire icon worn nearly away. | `art` |
| 5 | **Socks of the Upper Midwest** | `poster` | 140 Lint | A serious field-guide poster showing six generic sock silhouettes with tiny fake Latin labels. | `art` |
| 6 | **Laundry Forecast: Mostly Dry** | `poster` | 120 Lint | A cheerful weather-map poster with one sun, two clouds and a 98% chance of socks. | `art` |
| 7 | **Community Potluck, Bring a Chair** | `poster` | 100 Lint | A hand-printed flyer with a folding chair icon and three crooked casserole rectangles. | `art` |
| 8 | **Clock With No Numbers** | `clock` | 210 Lint | A matte cream clock with twelve tiny dots and dark blunt hands. | `art` |
| 9 | **Ordinary Birds Calendar** | `calendar` | 180 Lint | A wall calendar devoted entirely to common backyard birds looking mildly busy. | `art` |
| 10 | **White Wire Wall Shelf** | `shelf` | 330 Lint | A simple white wire shelf with a shallow lip and two visible brackets. | `art` |

## Six new slots worth the code


### D-slot 1. Wall Hooks — `code-large`

**Why it earns the slot:** They occupy an otherwise dead vertical strip near the door and let the room show clothing, bags and tools without blocking play.

| # | First item | Price | Look | Build |
|---:|---|---:|---|---|
| 1 | **Canvas Apron** | 180 Lint | A flour-dusted tan apron with two deep pockets. | `art` |
| 2 | **Market Tote** | 200 Lint | A soft cream tote with green handles and one folded corner. | `art` |
| 3 | **Yellow Raincoat** | 260 Lint | A short mustard raincoat hanging open, sleeves slightly uneven. | `art` |
| 4 | **Striped Work Smock** | 240 Lint | A blue-and-cream striped smock with one patched pocket. | `art` |
| 5 | **Dog Leash and Keys** | 220 Lint | A red loop leash beside three generic metal keys. | `art` |
| 6 | **The Good Wooden Hanger** | 140 Lint | One handsome wooden hanger holding absolutely nothing. | `art` |

### D-slot 2. Ceiling Fixture — `code-large`

**Why it earns the slot:** The room's key light is visible in frame, so changing the fixture can legitimately change both silhouette and light character.

| # | First item | Price | Look | Build |
|---:|---|---:|---|---|
| 1 | **Opal Flush Mount** | 250 Lint | A low round opal-glass ceiling light with a brass rim. | `art` |
| 2 | **Green Enamel Pendant** | 300 Lint | A broad dark-green enamel shade with warm cream underside. | `art` |
| 3 | **Cream Glass Pendant** | 320 Lint | A ribbed cream glass pendant on a short dark cord. | `art` |
| 4 | **Rattan Bell Shade** | 340 Lint | A loose woven bell shade casting wide basket shadows. | `art` |
| 5 | **Plain White Dome** | 180 Lint | A simple white dome fixture with one tiny pull chain. | `art` |
| 6 | **Two-Bulb Bar** | 280 Lint | A short black bar with two warm globe bulbs aimed apart. | `art` |

### D-slot 3. Dryer-Top Caddy — `code-large`

**Why it earns the slot:** The top of the largest object in the room is prime visual real estate and can make each dryer feel personally owned.

| # | First item | Price | Look | Build |
|---:|---|---:|---|---|
| 1 | **Powder Detergent Box** | 100 Lint | A squat generic cardboard detergent box with a tiny paper scoop. | `art` |
| 2 | **Glass Clothespin Jar** | 130 Lint | A clear jar full of wooden clothespins, one leaning against the lid. | `art` |
| 3 | **Three Folded Towels** | 160 Lint | Three small towels stacked unevenly in rust, cream and sage. | `art` |
| 4 | **Wicker Supply Caddy** | 190 Lint | A low wicker tray holding two unlabeled laundry bottles. | `art` |
| 5 | **Blue Laundry Tin** | 150 Lint | A blue enamel tin labeled simply SOAP in cream letters. | `art` |
| 6 | **Freshly Cleared Top** | 40 Lint | Nothing but the clean dryer top and one faint circular dust mark. | `art` |

### D-slot 4. Stool — `code-large`

**Why it earns the slot:** A stool fits beside the folding table, is visible from the fixed camera, and adds a strong furniture silhouette without touching gameplay.

| # | First item | Price | Look | Build |
|---:|---|---:|---|---|
| 1 | **Round Wood Stool** | 220 Lint | A plain three-legged wooden stool worn smooth at the seat edge. | `art` |
| 2 | **Yellow Step Stool** | 200 Lint | A squat mustard metal step stool with rubber feet. | `art` |
| 3 | **Woven-Top Stool** | 280 Lint | A dark wood stool with a pale woven cord seat. | `art` |
| 4 | **Mint Folding Stool** | 230 Lint | A little folding stool with mint frame and cream vinyl top. | `art` |
| 5 | **Red Shop Stool** | 260 Lint | A round red shop stool on three dark steel legs. | `art` |
| 6 | **Cork Cube** | 240 Lint | A solid cork cube with softened corners and one cup ring. | `art` |

### D-slot 5. Ironing Board — `code-large`

**Why it earns the slot:** A folded or standing board is unmistakably laundry-specific, occupies a narrow wall footprint, and gives patterns a large readable surface.

| # | First item | Price | Look | Build |
|---:|---|---:|---|---|
| 1 | **Blue Grid Board** | 220 Lint | A standing board covered in a simple blue grid. | `art` |
| 2 | **Cream Floral Board** | 260 Lint | A cream cover scattered with large sage leaves and rust flowers. | `art` |
| 3 | **Charcoal Utility Board** | 240 Lint | A dark charcoal cover on pale metal folding legs. | `art` |
| 4 | **Yellow Stripe Board** | 230 Lint | Wide mustard and cream lengthwise stripes. | `art` |
| 5 | **Wall-Folded Board** | 280 Lint | A narrow wooden-front cabinet hiding the board completely. | `art` |
| 6 | **Tiny Check Board** | 250 Lint | A soft sage-and-cream micro-check cover with one scorched corner. | `art` |

### D-slot 6. Utility Sink — `code-large`

**Why it earns the slot:** A deep sink is a believable laundry-room anchor with enough mass and material variation to justify a code slot, and it creates a new place for subtle reflections.

| # | First item | Price | Look | Build |
|---:|---|---:|---|---|
| 1 | **White Porcelain Sink** | 420 Lint | A deep white porcelain basin with rounded front corners and steel taps. | `art` |
| 2 | **Grey Stone Sink** | 500 Lint | A heavy grey composite basin with a pale wood shelf underneath. | `art` |
| 3 | **Mint Enamel Sink** | 460 Lint | A vintage mint enamel basin with a dark rolled rim. | `art` |
| 4 | **Stainless Utility Sink** | 480 Lint | A brushed steel basin on slender legs with one small dent. | `art` |
| 5 | **Cream Cabinet Sink** | 520 Lint | A cream inset sink over a two-door wood cabinet. | `art` |
| 6 | **Blue Laundry Basin** | 450 Lint | A deep dusty-blue ceramic basin with a brass-toned faucet. | `art` |

# Lane E: Baskets, ball styles, shot trails and radio stations


## Eight baskets

| Rank | Item | Price | Design / mood | Why | Build |
|---:|---|---:|---|---|---|
| 1 | **Galvanized Wash Basin** | 420 Lint | A low oval galvanized basin with rolled rim and two wire handles. | The broad metal mouth makes every landing feel substantial without changing the hitbox. | `art` |
| 2 | **Collapsible Mesh Cube** | 380 Lint | A square pop-up mesh hamper with dark piping and slightly bowed sides. | Its springy silhouette is familiar and fun to hit. | `art` |
| 3 | **Brown Paper Grocery Bag** | 300 Lint | A tall brown paper bag opened wide, top edge crumpled into an uneven oval. | Every successful throw gives a soft paper cough instead of a basket thunk. | `art` |
| 4 | **Little Red Wagon** | 650 Lint | A shallow red metal wagon parked beside the table, handle laid flat. | The target becomes a charming object without changing the shot geometry. | `art` |
| 5 | **Wooden Fruit Crate** | 480 Lint | A slatted wooden crate with low sides and a faded blank stencil panel. | The slats make catches visibly satisfying while keeping a standard rim. | `art` |
| 6 | **Quilted Fabric Bucket** | 440 Lint | A soft cylindrical fabric bin quilted in oversized diamonds, with two loop handles. | Soft walls give the target a cozy handmade feel. | `art` |
| 7 | **Very Small Claw-Foot Tub** | 800 Lint | A miniature white enamel claw-foot tub deep enough for sock balls and no actual bath. | The absurdity is immediate, but the opening stays normal-sized. | `art` |
| 8 | **Sunday Bread Basket** | 360 Lint | A low woven oval bread basket lined with a rumpled cream cloth. | The liner gives successful shots a soft little nest. | `art` |

## Six ball styles

| Rank | Item | Price | Design / mood | Why | Build |
|---:|---|---:|---|---|---|
| 1 | **Sock Rose** | 180 Lint | The pair coils into a flat spiral with the cuffs tucked underneath, making a soft rosette. | Looks handmade and photographs beautifully in flight. | `art` |
| 2 | **Cuffed Donut** | 240 Lint | Both socks roll into a ring and one cuff wraps the outside edge to hold the hole open. | A very different silhouette from every existing ball. | `art` |
| 3 | **Pocket Fold** | 300 Lint | One sock folds into a little rectangle and the second wraps around it like an envelope pocket. | Neat, compact, and satisfying for organization-minded players. | `art` |
| 4 | **Figure Eight** | 360 Lint | The pair is crossed and tucked into two soft loops, leaving a visible waist in the middle. | Distinct in silhouette without affecting physics. | `art` |
| 5 | **Spiral Coil** | 420 Lint | The pair rolls into a broad visible spiral from toe to cuff, with the outer edge left slightly loose. | A familiar domestic shape that suits the game's deadpan warmth. | `art` |
| 6 | **Square Parcel** | 480 Lint | Both socks fold into a squat square bundle with two crossing cuff bands on top. | The tidy little parcel looks deliberately over-organized. | `art` |

## Six shot trails

| Rank | Item | Price | Design / mood | Why | Build |
|---:|---|---:|---|---|---|
| 1 | **Running Stitch** | 190 Lint | A short dashed thread line appears behind the ball and unsews itself from tail to head. | Laundry-native, restrained, and readable without sparkle. | `art` |
| 2 | **Amber Ribbon** | 240 Lint | One narrow amber ribbon of light curls once behind the ball, then folds away. | A single restrained ribbon gives motion without repeating the previous thread trail. | `art` |
| 3 | **Two Falling Petals** | 290 Lint | Exactly two flat petals tumble behind each shot and fade before reaching the basket. | The strict two-petal limit keeps it quiet. | `art` |
| 4 | **Tiny Footprints** | 340 Lint | Three miniature generic paw prints stamp through the air behind the ball and vanish. | Funny at a glance and still visually sparse. | `art` |
| 5 | **Soap Glint** | 390 Lint | A single pale iridescent glint travels along the ball's arc like light on a soap film. | One moving highlight reads more expensive than a particle spray. | `art` |
| 6 | **Paper Dashes** | 440 Lint | Three tiny cream paper rectangles flutter in a short staggered line and disappear. | Looks like a receipt disintegrating in the safest possible way. | `art` |

## Eight radio stations

| Rank | Item | Price | Design / mood | Why | Build |
|---:|---|---:|---|---|---|
| 1 | **Diner Booth at 5 A.M.** | 220 Lint | Low upright bass, brushed drums, coffee-machine hiss, distant plate clink and one tired door chime. | Feels inhabited without sounding busy. | `art` |
| 2 | **Museum Lobby on a Rainy Tuesday** | 220 Lint | Long soft piano notes, HVAC hush, shoe squeaks far away, rain muffled through stone walls. | A spacious quiet mood that leaves room for dryer sounds. | `art` |
| 3 | **Greenhouse With the Hose On** | 220 Lint | Water on leaves, low pump hum, occasional greenhouse creak, almost no melody. | A natural sound bed distinct from plain rain. | `art` |
| 4 | **Back Seat on a Night Drive** | 220 Lint | Low road hum, turn-signal ticks now and then, soft instrumental synth pads, tires over one bridge joint. | Nostalgic movement while the player stays physically still. | `art` |
| 5 | **Hardware Store Before Opening** | 220 Lint | Fluorescent hum, quiet acoustic guitar, distant metal shelf rattle and a key turning in the front door. | A strangely comforting place-specific morning. | `art` |
| 6 | **Empty Community Pool** | 220 Lint | Distant filter pump, gulls, hollow room echo, occasional water lap and soft electric piano. | Summer without crowd noise. | `art` |
| 7 | **Dishwasher in the Next Apartment** | 220 Lint | Muffled dishwasher swish through a wall, soft bassy room tone, sparse vibraphone notes. | Domestic sound from just outside the room feels wonderfully specific. | `art` |
| 8 | **Cabin After Game Night** | 220 Lint | Fire crackle, wooden chair creak, one die rolling somewhere offscreen, slow nylon-string guitar. | A place after people have left, which fits TUMBLE's quietness. | `art` |

# Lane G: Paying, without feeling cheap

This second answer takes an even cleaner launch position than the first: **sell the app, not its economy.**

| Rank | What I would sell | Price | How it appears | What always stays earnable | Review risk | Build |
|---:|---|---:|---|---|---|---|
| 1 | **Paid Once Means $2.99 Once** | $2.99 | Launch TUMBLE at $2.99 with no in-app purchases at all. The room contains no purchase object because the purchase happened at the store door. | Everything in the game is earned by playing; there is no paid completion category. | Lowest review risk and the cleanest match for the game's premium promise. | `data` |
| 2 | **The Sound Cabinet** | $3.99 | If players later ask to support more, add one wooden cassette case on the shelf. Buying it opens a separate set of ten alternate radio recordings and leaves the case visibly open beside the radio. | All base stations, all gameplay, every coin, every hero sock and every room unlock remain earnable. The paid audio is additive and excluded from completion. | A narrow authored add-on does not contaminate the coin economy or the Drawer. | `code-small` |
| 3 | **The Making-Of Binder** | $1.99 | A clothbound binder appears beneath the shelf. Buying it lets the player flip through concept sketches, rejected sock names, room color studies and short developer notes inside the room. | All playable and decorative base-game content remains earnable. The binder itself is a bonus artifact, not part of room completion. | It monetizes process rather than scarcity and gives supporters something specific to own. | `code-small` |

### The three tempting ideas from the brief

Of the three named possibilities, **a button to buy Quarters is still the one most likely to cost trust and reviews** because every slow payout can then be read as pressure to purchase. Selling hero packs one at a time is next-most risky because it puts cash prices directly on the game's central collectible. A quiet supporter-style purchase is the least risky of those three, but in this second plan I would skip all three at launch and simply charge enough up front.

### Two paid cozy games worth studying, different from my first answer

- **Stardew Valley on Google Play:** the current store listing says **“No in-app purchases.”** That is the cleanest possible premium-mobile signal: one purchase, then the game. Source checked September 2026: https://play.google.com/store/apps/details?id=com.chucklefish.stardewvalley

- **Dorfromantik:** Steam currently sells the paid base game plus a **$4.99 Medieval Biome Pack** whose page explicitly says it is cosmetic and does not change mechanics, balance or difficulty. That separation is useful for TUMBLE: if optional paid content ever exists, it should be authored atmosphere, not faster progression. Source checked September 2026: https://store.steampowered.com/app/4511560/Dorfromantik__Medieval_Biome_Pack/


# Lane H: Make it look and feel PREMIUM

Ranked by player notice divided by implementation cost. These are all different from the first file's twenty polish ideas.

| Rank | Specific thing | What the player sees/hears/feels | Why it reads expensive | DONE means | Build |
|---:|---|---|---|---|---|
| 1 | **Thumb-Safe Sock Offset** | While dragging, the sock's visual center sits 22 screen pixels above the touch point, easing toward the finger only when released. | The player sees the sock instead of covering the exact detail they are trying to compare. | On a 6-inch phone, a tester can identify cuff and heel details without moving the thumb away from the target. | `code-small` |
| 2 | **Cloth Gives Before It Lifts** | On touch-down the selected sock compresses about 2% for 45 ms, then rises; on release it relaxes before physics takes over. | A tiny material response makes the core interaction feel touched rather than selected. | 240-fps capture shows compression, lift and release as three clean beats with no rubbery wobble. | `code-small` |
| 3 | **Pair Confirmation Has Two Notes** | A correct pair gets one soft fabric brush plus two muted tuned wood notes a fifth apart; pitch shifts slightly by sock size, never by rarity. | A consistent acoustic signature makes matching satisfying without arcade fanfare. | After ten minutes, testers recognize a successful pair with eyes closed and never confuse it with a coin sound. | `art` |
| 4 | **Dryer Gasket Actually Compresses** | When the door closes, the dark rubber seal visibly flattens for a few frames before the latch catches; the glass settles by a millimeter. | Heavy objects feel expensive when contact points behave correctly. | Slow-motion capture shows no clipping and the latch sound occurs only after visible seal contact. | `code-small` |
| 5 | **Inside-Out Means Real Seams** | Inside-out socks reveal a simplified seam ridge, slightly paler knit direction and one tiny cuff thread; flipping them makes those details disappear. | The game's special state becomes material, not merely a texture flag. | At normal zoom, 90% of testers can tell inside-out from plain before reading any UI cue. | `art` |
| 6 | **Basket Rim Flexes Once** | A hard landing bends a soft/fabric basket rim inward 2–3%, wicker shifts less, metal not at all; each returns in under 180 ms. | Micro-deformation sells material without full simulation. | No basket oscillates more than once and the collider never changes. | `code-small` |
| 7 | **Misses Get a Beautiful Flop** | A missed ball lands with one cloth flop, rolls according to surface material, and comes to rest without a red X, buzzer or screen shake. | Confidence and restraint feel more premium than punishment graphics. | A missed shot produces zero overlays, zero particles and no audio louder than a made shot. | `code-small` |
| 8 | **The Table Has a Finished Edge** | The folding table gets a visible rounded lip, subtle underside shadow and thin edge highlight; socks crossing the edge occlude correctly before falling. | The core play surface stops looking like a floating plane. | In side-by-side screenshots, every object touching the edge reads as in front, on top, or below it with no depth ambiguity. | `art` |
| 9 | **Drum Audio Knows Load Size** | Small Loads make sparse cloth thumps with long gaps; Mountain Loads produce denser uneven impacts while the motor itself stays the same volume. | The machine sounds physically occupied instead of playing a loop. | Blind listeners identify Small versus Mountain at least 4/5 times without the mix becoming louder overall. | `art` |
| 10 | **Phone-Speaker Mastering Pass** | Every essential sound is remixed for phone speakers: coins retain attack, cloth stays audible, radio loses sub-bass, dryer hum never masks pair confirmation. | Polish that survives the actual hardware matters more than studio-headphone beauty. | On three midrange Android phones at 35% volume, every core action is audible without clipping or harshness. | `art` |
| 11 | **Window Glass Has Two Depths** | The outside scene sits behind a faint glass layer carrying one soft room reflection and occasional condensation near edges, not on the scenery itself. | Separating glass from view makes a cheap window feel architectural. | Reflection remains below 8% opacity in daylight and never obscures moving outside events. | `code-small` |
| 12 | **Lamp Light Catches Cuff Ribs** | Cuff ribbing gets a broad directional normal response so turning a sock under the lamp makes the ribs roll from light to shadow. | A material cue the player sees hundreds of times gives cloth depth without extra geometry. | At 96-pixel Drawer size it does not shimmer; in-hand view shows direction when rotated. | `art` |
| 13 | **Hero Socks Get a First-Find Pause** | The first time a hero sock appears, picking it up holds it 0.35 seconds longer at the normal in-hand size and lets its emblem face the camera before control resumes. | It acknowledges authored art without opening a popup or stopping the Load for text. | The pause occurs only once per hero sock and adds under half a second. | `code-small` |
| 14 | **Coin Purse Visibly Gains Weight** | As cents accumulate, the canvas purse bottom rounds slightly and its zipper gap reveals more mixed coins; spending money lets it relax again. | Economy progress becomes room state instead of a HUD number. | Four fill stages are visually distinct from the fixed room camera without looking inflated. | `art` |
| 15 | **Shelf Objects Cast Tiny Honest Shadows** | Mugs, finds, postcards and jars use simplified baked/contact shadows matched to shelf direction; nothing hovers by two pixels. | Small collectibles feel real only when they belong to the furniture. | Every shelf item has a contact shadow at rest and none shows a detached halo at camera distance. | `art` |
| 16 | **Load End Breathes Before Summary** | After the final ball settles, the room holds for 600 ms: dryer hum remains, basket stops moving, then summary UI arrives quietly. | A deliberate beat lets the physical action finish before statistics take over. | No summary appears while a ball is still moving; total pause stays under 0.8 seconds. | `code-small` |
| 17 | **The Odd Bin Has Cloth Weight** | As unmatched socks accumulate, the bin's fabric sides bow outward in three discrete fill states and the top sock changes pose. | Story progress becomes visible mass in the room. | Empty, half and crowded states are recognizable from the room camera and never clip the socks. | `art` |
| 18 | **Text Never Sits on Busy Cloth** | Any label over 3D content gets either a small matte paper tab or a locally darkened backing, never glow, outline or drop-shadow soup. | Typography looks designed because readability is solved structurally. | Automated screenshot check finds no primary label below WCAG-like 4.5:1 contrast against its immediate backing. | `code-small` |
| 19 | **Five New Store Screenshots** | 1: two near-identical socks held side by side, MATCH THE DETAILS. 2: inside-out seam close-up, FLIP WHAT'S WRONG. 3: purse with real coins and pocket finds, LAUNDRY KEEPS THINGS. 4: customized room at night with open Odd Bin, EVERY ROOM TELLS ON YOU. 5: Drawer page filled with strange hero socks, FIND THE ONES WITH STORIES. | These sell observation, tactile detail, economy, room ownership and collectible voice without reusing the first screenshot set. | Each screenshot communicates one mechanic at store-card size with five words or fewer on-image. | `art` |
| 20 | **No Frame Drops During the Spill** | The prettiest moment, the sock spill, is profiled and capped so shadows, coins and physics never create a launch-day hitch on the target midrange Android device. | Stable motion reads as premium more reliably than another shader effect. | Mountain Load spill holds the target frame budget for 99% of frames on the chosen minimum-spec test phone. | `code-small` |

# Lane I: Tomorrow

Nothing here expires, breaks a streak, grants absence currency, or sends a notification. The room changes because it is a place with continuity, not because the game wants a check-in.

| Rank | Reason to reopen | What is different / waiting | Why it works without a streak | Build |
|---:|---|---|---|---|
| 1 | **Pin Something for Next Time** | Before leaving, the player can tap one owned-but-not-yet-found hero sock silhouette or one unfinished pocket-find set and clip a tiny paper reminder to the cork board. It remains there on return; it does not alter odds. | Tomorrow starts with a self-chosen unfinished thought rather than a game-created obligation. | `code-small` |
| 2 | **The Odd Bin Leaves Notes** | After a Reunion or new story page, the next time the room is opened the Odd Bin may have one short handwritten line clipped to its rim, such as 'Everyone slept better.' Notes queue and never expire. | Story characters acknowledge continuity without making absence itself a reward. | `data` |
| 3 | **Plants Lean While You Are Gone** | After several real hours closed, plant leaves lean a few degrees toward the window. During the first Load back they slowly return to their normal pose. | The room visibly existed while the app was closed, but nothing was earned or lost. | `code-small` |
| 4 | **A Flyer Slid Under the Door** | On some returns after a day or more, a generic local flyer lies half under the door: soup supper, lost glove, community choir. Tap it and it gets recycled. It is not collectible and does not grant anything. | A tiny piece of outside life makes reopening feel like entering a place, not checking a service. | `art` |
| 5 | **The Drawer Puts Recent Finds on Top** | The first Drawer row on return shows the last three hero socks actually discovered in play, labeled RECENTLY IN THE LAUNDRY. It is a view, not a reward or rarity boost. | Players are reminded of their own collection story instead of being fed a daily prize. | `code-small` |
| 6 | **The Dryer Keeps a Chalk Count** | A tiny chalk mark on the side of the dryer records Loads completed since the last Reunion. When a Reunion happens, the marks are wiped and a new row begins. | It turns ongoing play into visible narrative tension without promising when the mate will arrive. | `art` |
| 7 | **One Outside Event Per Calendar Day** | Each date deterministically chooses one tiny window event from a pool: delivery van passes, neighbor waters a planter, kite crosses high above, squirrel raids the feeder. Events repeat if missed and are not collectible. | The room can be genuinely different tomorrow without FOMO because there is nothing to claim. | `code-small` |
| 8 | **The Room Keeps Your Last Unfinished Choice** | If the player closes the game while browsing a pack, dryer or decor item they cannot yet afford, that item's tiny catalog card remains propped beside the purse or lint jar next time. | The game remembers desire the player already expressed instead of manufacturing a task. | `code-small` |

# Lane J: Tell me what is wrong

These are new pushbacks, not repeats of the first review.

| Rank | Problem | What is wrong / missed | What I would do | Build |
|---:|---|---|---|---|
| 1 | **The Pre-Launch Build Is Becoming a Sequel** | Part 4 adds 60 hero socks, eight dryers, dozens of room assets, new slots, a new economy, finds, monetization decisions and twenty polish tasks immediately before Google Play. The risk is not idea quality; it is regression surface. | Break the 'one more BIG build' assumption. Ship the economy fix, sock/model upgrade and highest-notice polish first; stage the rest into free updates if QA slips. | `data` |
| 2 | **Mountain Loads May Be a Phone-Performance Trap** | Fifty pairs means 100 sock bodies plus decoys, physics, shadows and potentially coins/finds on a portrait phone. The brief defines content scale but not a minimum device performance budget. | Add a hard frame/memory target and allow visual LOD or reduced simultaneous physics while preserving the exact sock seed and gameplay. | `data` |
| 3 | **The Drawer Is About to Need Search Architecture** | Four existing packs plus six more adds at least 103 authored socks including current hero/impossible socks. A 96-pixel thumbnail law does not solve how a one-thumb player finds, compares or revisits them. | Add large tap filters by pack, found/unfound and seasonal status, plus a recent row. No tiny text search box required. | `data` |
| 4 | **Seasonal Socks Need a Non-FOMO Rule** | Lane A explicitly allows seasonal socks, but Part 2 forbids rewards for time served and Part 4 says seasons do not exist yet. 'Seasonal' could accidentally become 'unavailable eleven months.' | Seasonal should mean automatic room/catalog emphasis only. Once owned, the sock can appear year-round; no pack should become unobtainable because the calendar changed. | `data` |
| 5 | **The Daily Needs Version-Locked Seeds** | A deterministic Daily can stop being the same puzzle after an update if generator family mappings, difficulty logic or decoy rules change. The brief freezes sock fields but does not specify Daily versioning. | Store generator_version with each Daily seed and keep legacy generation paths for archived Dailies. | `data` |
| 6 | **Radio Content Has a Licensing Escape Hatch Missing** | Part 3 allows a station to point at a real music file, but the brief does not state that every shipped recording must be owned, commissioned or licensed for commercial mobile distribution. | Write the rule now: every station ships from studio-owned, commissioned or explicitly licensed audio with offline rights; no streaming dependency. | `data` |
| 7 | **Comfort Unlocks Should Not Gate Accessibility** | The brief wants pocket finds and pegs that 'help a little,' but visual, motor and sensory accommodations should not require 50 Loads or a lucky find. | Any true accessibility setting must exist from first launch. Unlocks may expose themed shortcuts or Laundry Day conveniences, never basic readable text, remapping, contrast or audio separation. | `data` |
| 8 | **Difficulty Ceiling Tied to Eyes Pegs Is Backwards** | Several existing comfort pegs also raise the difficulty ceiling by one tier. A player can earn help and simultaneously make later content harder, even if the help was needed for accessibility. | Separate 'comfort enabled' from 'maximum unlocked difficulty.' Let difficulty unlock through play and remain manually selectable. | `data` |
| 9 | **Hero Pack Discovery Frequency Is Undefined** | Owning a pack seeds ten hero socks into Loads, but no rate is specified. With ten packs, either new purchases become nearly invisible or hero socks crowd out the procedural matching game. | Define a per-Load hero budget and a temporary 'new pack discovery' weighting that guarantees discovery without increasing total hero density. | `data` |
| 10 | **New Room Slots Need a Camera Occlusion Test** | Six extra visible slots can technically satisfy 'everything is visible' while still hiding one another, the dryer, basket arc or important table edges from the fixed camera. | Every slot needs a camera-safe bounding box and a screenshot test against every dryer and basket style before art production. | `data` |
| 11 | **Pocket Finds Need Duplicate Rules** | The brief gives rarity and a 'once' class but does not say whether ordinary finds can repeat, whether duplicates are discarded, or whether repeats can become currency. | I would make named finds unique collection entries. After discovery, the same object can reappear only as a non-collecting cameo; it never converts to money or Lint. | `data` |
| 12 | **The Game Needs a Save-Migration Contract Before Economy Surgery** | Changing Quarters into dollars/cents, adding finds and adding many catalog entries touches persistent progression immediately before release. The brief does not define how existing web-test saves migrate. | Version the save now, write deterministic conversions for Quarters and unlock IDs, and keep a one-click local backup before the first migrated launch. | `data` |

## The laws I would deliberately break

I would **not deliberately break any of the ten design laws for content** in this second set. I would, however, amend Law 1 with one explicit accessibility carveout: **essential accessibility is not a collectible comfort.** Text size, contrast, audio separation, left/right-handed layout and basic motor sensitivity must exist from first launch even if a cute peg or pocket find later exposes a themed shortcut to the same sort of convenience. I would also treat Law 10's one-person constraint as a release-planning law, not a reason to ship untested scope; that is why Lane J's first recommendation is to stage content if regression testing starts losing ground.


# Machine-merge JSON

```json
[
  {
    "lane": "F",
    "rank": 1,
    "kind": "coin",
    "id": "coin-window-static",
    "title": "Window Static Slide",
    "data": {
      "id": "coin-window-static",
      "moment": "a coin clinging to the inside of the dryer glass loses its static grip when the door opens",
      "sees_and_hears": "one coin skates slowly down the glass, hangs at the rubber lip, then drops onto the table with a bright ring",
      "coins": {
        "penny": 0.4,
        "nickel": 0.35,
        "dime": 0.2,
        "quarter": 0.05
      },
      "how_often": "Every Load. Small 45%, Regular 75%, Heavy 100%, Mountain 100% plus a second draw at 45%.",
      "cents_per_regular_load": 5.0
    },
    "looks_like": null,
    "why": "It makes the dryer door itself announce that money can be anywhere.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "coin",
    "id": "coin-heap-bounce",
    "title": "Change in the Heap",
    "data": {
      "id": "coin-heap-bounce",
      "moment": "the first physics settle after the socks land",
      "sees_and_hears": "one or more coins bounce free from between socks, wobble on the table, then slide to the purse tray",
      "coins": {
        "penny": 0.45,
        "nickel": 0.3,
        "dime": 0.2,
        "quarter": 0.05
      },
      "how_often": "Small 1 draw, Regular 2, Heavy 3, Mountain 4. Draws happen before play, so they can never be lost.",
      "cents_per_regular_load": 10.0
    },
    "looks_like": null,
    "why": "Baseline income arrives as part of the signature sock spill.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "coin",
    "id": "coin-clean-basket-liner",
    "title": "Clean Basket Liner Coin",
    "data": {
      "id": "coin-clean-basket-liner",
      "moment": "a Clean Load ends and the basket is lifted for reset",
      "sees_and_hears": "the basket liner relaxes and a hidden coin slides from beneath its hem into the catch tray with one crisp tick",
      "coins": {
        "penny": 0.0,
        "nickel": 0.35,
        "dime": 0.35,
        "quarter": 0.3
      },
      "how_often": "Clean Loads only. Small/Regular 1 draw; Heavy/Mountain 2 draws.",
      "cents_per_regular_load": 8.0
    },
    "looks_like": null,
    "why": "Clean play earns a chunky bonus from the object the player just used, without making ordinary play empty.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "coin",
    "id": "coin-last-cuff-nickels",
    "title": "Two Nickels in the Last Cuff",
    "data": {
      "id": "coin-last-cuff-nickels",
      "moment": "every inside-out sock in the Load has been corrected before pairing",
      "sees_and_hears": "the last corrected cuff snaps flat and two nickels stuck together separate with a double clink",
      "coins": {
        "penny": 0.0,
        "nickel": 1.0,
        "dime": 0.0,
        "quarter": 0.0
      },
      "how_often": "Once per Load if every inside-out sock is flipped. Small 5 cents, all larger Loads 10 cents.",
      "cents_per_regular_load": 7.0
    },
    "looks_like": null,
    "why": "A simple visible reward for the exact care behavior the game wants.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 5,
    "kind": "coin",
    "id": "coin-spotless-two-dimes",
    "title": "Spotless Pair of Dimes",
    "data": {
      "id": "coin-spotless-two-dimes",
      "moment": "a Spotless Laundry Day Load ends",
      "sees_and_hears": "two dimes that had been stuck together on the dryer glass peel apart and land a beat apart",
      "coins": {
        "penny": 0.0,
        "nickel": 0.0,
        "dime": 1.0,
        "quarter": 0.0
      },
      "how_often": "Spotless Laundry Day only. Two dimes at every size.",
      "cents_per_regular_load": 6.0
    },
    "looks_like": null,
    "why": "Perfection gets a distinctive double-clink bonus while the quarter remains a naturally found denomination.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 6,
    "kind": "coin",
    "id": "coin-dryer-foot",
    "title": "Dryer-Foot Creep",
    "data": {
      "id": "coin-dryer-foot",
      "moment": "the machine finishes its final vibration at Load end",
      "sees_and_hears": "a coin slowly walks out from beneath the front dryer foot, pauses, then falls flat with a dull tick",
      "coins": {
        "penny": 0.5,
        "nickel": 0.35,
        "dime": 0.15,
        "quarter": 0.0
      },
      "how_often": "Small 20%, Regular 55%, Heavy 80%, Mountain 100%.",
      "cents_per_regular_load": 2.0
    },
    "looks_like": null,
    "why": "A quiet physical joke that rewards watching the room.",
    "cost_to_build": "code-small",
    "confidence": 0.8
  },
  {
    "lane": "F",
    "rank": 7,
    "kind": "coin",
    "id": "coin-basket-handle",
    "title": "Basket-Handle Tick",
    "data": {
      "id": "coin-basket-handle",
      "moment": "the fifth successful basket shot of a Load lands",
      "sees_and_hears": "the basket handle shivers and a trapped coin taps loose from the hinge into the catch tray",
      "coins": {
        "penny": 0.55,
        "nickel": 0.3,
        "dime": 0.15,
        "quarter": 0.0
      },
      "how_often": "Once per Load. Requires at least five made shots. Small 35%, Regular 70%, Heavy/Mountain 100%.",
      "cents_per_regular_load": 2.0
    },
    "looks_like": null,
    "why": "Basket accuracy produces a tiny mid-Load reward without punishing misses.",
    "cost_to_build": "code-small",
    "confidence": 0.8
  },
  {
    "lane": "F",
    "rank": 8,
    "kind": "coin",
    "id": "coin-big-load-pocket-clatter",
    "title": "Big-Load Pocket Clatter",
    "data": {
      "id": "coin-big-load-pocket-clatter",
      "moment": "a Heavy or Mountain Load finishes",
      "sees_and_hears": "the machine gives one final cough and a small cluster of coins drops from a shallow pocket behind the door",
      "coins": {
        "penny": 0.45,
        "nickel": 0.3,
        "dime": 0.2,
        "quarter": 0.05
      },
      "how_often": "Heavy: 2 draws. Mountain: 4 draws. Small and Regular: none.",
      "cents_per_regular_load": 0.0
    },
    "looks_like": null,
    "why": "Large Loads sound materially richer without making them mandatory.",
    "cost_to_build": "code-small",
    "confidence": 0.8
  },
  {
    "lane": "F",
    "rank": 9,
    "kind": "coin",
    "id": "coin-reunion-change",
    "title": "Reunion Change",
    "data": {
      "id": "coin-reunion-change",
      "moment": "an odd sock is reunited with its mate",
      "sees_and_hears": "when the pair touches, a forgotten coin falls from between their cuffs and spins once before banking",
      "coins": {
        "penny": 0.2,
        "nickel": 0.3,
        "dime": 0.3,
        "quarter": 0.2
      },
      "how_often": "One draw per Reunion, independent of Load size.",
      "cents_per_regular_load": 0.0
    },
    "looks_like": null,
    "why": "The emotional event gets a tiny physical souvenir without becoming a farmable faucet.",
    "cost_to_build": "code-small",
    "confidence": 0.8
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "money",
    "id": "money-one-purse-face-value",
    "title": "Count the Change as Actual Money",
    "data": {
      "model": "single-purse-cents",
      "counting": "All loose change is counted at face value in one visible canvas coin purse. Dryer and hero-pack prices display as dollars and cents, so the old 8-Quarter dryer reads $2.00 and a 10-Quarter hero pack reads $2.50.",
      "lint": "Lint stays unchanged as the soft currency for room decor, baskets, radios, ball styles, and trails.",
      "rules": [
        "Found coins are banked the instant they reach the purse.",
        "A miss never removes money already found.",
        "Clean, all-flips, Spotless, and Reunions add bonuses; baseline play still pays.",
        "Real-money purchases never sell or multiply pocket change."
      ],
      "target_regular_cents": 40
    },
    "looks_like": "a small worn canvas coin purse beside the dryer, with four stitched denomination pockets and a brass snap",
    "why": "It removes the extra conversion layer and makes every penny meaningful while preserving Lint as its own material economy.",
    "cost_to_build": "code-large",
    "confidence": 0.92
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "price",
    "id": "price-quarter-to-cents",
    "title": "Convert Quarter Prices, Do Not Discount Them",
    "data": {
      "policy": "Keep the numerical value of every existing Quarter price but display it in dollars and cents at $0.25 per old Quarter.",
      "examples": {
        "8 Quarters": "$2.00",
        "10 Quarters": "$2.50",
        "12 Quarters": "$3.00",
        "15 Quarters": "$3.75",
        "20 Quarters": "$5.00"
      },
      "reason": "The income was the broken part. Converting 25 cents to one Quarter is no longer necessary under the purse model."
    },
    "looks_like": null,
    "why": "The catalog keeps its intended spacing while the player sees progress after every Load.",
    "cost_to_build": "data",
    "confidence": 0.9
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "find",
    "id": "find-tiny-plastic-dinosaur",
    "title": "Tiny Plastic Dinosaur",
    "data": {
      "id": "find-tiny-plastic-dinosaur",
      "name": "Tiny Plastic Dinosaur",
      "rarity": "common",
      "flavor": "Was brave until the spin cycle.",
      "looks_like": "a thumb-sized green dinosaur with one pale scuff",
      "comes_out": "Load 1+; tumbles from the center of the sock heap on opening",
      "shown": "in a shallow glass dish on the shelf",
      "set": "school-desk-pocket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a thumb-sized green dinosaur with one pale scuff",
    "why": "Immediate, funny, and unmistakable at tiny size.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "find",
    "id": "find-pencil-stub",
    "title": "The Pencil Stub",
    "data": {
      "id": "find-pencil-stub",
      "name": "The Pencil Stub",
      "rarity": "common",
      "flavor": "Still has at least one list left.",
      "looks_like": "a short yellow pencil with pink eraser and blunt graphite tip",
      "comes_out": "Load 1+; rolls from beneath a folded pair after matching",
      "shown": "clipped horizontally to the cork board",
      "set": "school-desk-pocket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a short yellow pencil with pink eraser and blunt graphite tip",
    "why": "A universal pocket object with a strong silhouette.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "find",
    "id": "find-foam-earplug",
    "title": "Foam Earplug",
    "data": {
      "id": "find-foam-earplug",
      "name": "Foam Earplug",
      "rarity": "common",
      "flavor": "Has heard enough, thanks.",
      "looks_like": "one bright orange foam cylinder, slightly bent",
      "comes_out": "Load 1+; drops from a slipper when turned right-side out",
      "shown": "in a tiny clear cup beside the radio",
      "set": "quiet-pocket",
      "help": "Unlocks a room-audio focus preset: dryer and radio each gain separate one-tap quiet levels.",
      "help_kind": "comfort"
    },
    "looks_like": "one bright orange foam cylinder, slightly bent",
    "why": "A sensory comfort that never changes matching or scoring.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "find",
    "id": "find-red-die",
    "title": "One Red Die",
    "data": {
      "id": "find-red-die",
      "name": "One Red Die",
      "rarity": "uncommon",
      "flavor": "Rolled a six before things got complicated.",
      "looks_like": "a small red cube with cream pips and softened corners",
      "comes_out": "Load 3+; bounces twice from the basket after a made shot",
      "shown": "in the glass dish beside the dinosaur",
      "set": "school-desk-pocket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a small red cube with cream pips and softened corners",
    "why": "A clean thumbnail shape and satisfying physical reveal.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 5,
    "kind": "find",
    "id": "find-arcade-token",
    "title": "Arcade Token",
    "data": {
      "id": "find-arcade-token",
      "name": "Arcade Token",
      "rarity": "uncommon",
      "flavor": "Worth one game somewhere that no longer exists.",
      "looks_like": "a brass-colored ridged token with a generic starburst",
      "comes_out": "Load 5+; slides down the dryer glass after the socks leave",
      "shown": "standing in a little coin easel on the shelf",
      "set": "saturday-errands",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a brass-colored ridged token with a generic starburst",
    "why": "Feels valuable without becoming spendable currency.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 6,
    "kind": "find",
    "id": "find-pencil-grip",
    "title": "Rubber Pencil Grip",
    "data": {
      "id": "find-pencil-grip",
      "name": "Rubber Pencil Grip",
      "rarity": "common",
      "flavor": "Made handwriting better. Allegedly.",
      "looks_like": "a chunky purple triangular rubber grip with three finger dents",
      "comes_out": "Load 5+; caught around the cuff of a crew sock",
      "shown": "in the glass dish",
      "set": "school-desk-pocket",
      "help": "Laundry Day only: lets the player move the held sock 12% farther from the thumb for visibility.",
      "help_kind": "comfort"
    },
    "looks_like": "a chunky purple triangular rubber grip with three finger dents",
    "why": "A motor/visibility kindness that does not alter timed play.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 7,
    "kind": "find",
    "id": "find-binder-clip",
    "title": "Tiny Binder Clip",
    "data": {
      "id": "find-binder-clip",
      "name": "Tiny Binder Clip",
      "rarity": "common",
      "flavor": "Holding three things together with inappropriate confidence.",
      "looks_like": "a miniature black binder clip with silver wire handles",
      "comes_out": "Load 8+; snaps free when a tightly rolled pair is completed",
      "shown": "clipped to the edge of the cork board",
      "set": "desk-drawer",
      "help": "Remembers the last Drawer filter and scroll position between visits.",
      "help_kind": "comfort"
    },
    "looks_like": "a miniature black binder clip with silver wire handles",
    "why": "Pure interface convenience with a charming physical metaphor.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 8,
    "kind": "find",
    "id": "find-folded-fortune",
    "title": "Folded Fortune",
    "data": {
      "id": "find-folded-fortune",
      "name": "Folded Fortune",
      "rarity": "uncommon",
      "flavor": "The future became mostly blue fuzz.",
      "looks_like": "a tiny off-white paper strip folded twice, black ink blurred",
      "comes_out": "Load 8+; sticks to the underside of an ankle sock",
      "shown": "flattened under glass in a small frame",
      "set": "takeout-pocket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a tiny off-white paper strip folded twice, black ink blurred",
    "why": "A washed paper relic tells a whole story in one inch.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 9,
    "kind": "find",
    "id": "find-aquarium-stone",
    "title": "Aquarium Stone",
    "data": {
      "id": "find-aquarium-stone",
      "name": "Aquarium Stone",
      "rarity": "common",
      "flavor": "Was never supposed to leave the tank.",
      "looks_like": "a smooth translucent cobalt glass pebble",
      "comes_out": "Load 10+; appears beneath the last lifted sock",
      "shown": "on the windowsill where light shines through it",
      "set": "child-jacket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a smooth translucent cobalt glass pebble",
    "why": "It catches room light beautifully for almost no art complexity.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 10,
    "kind": "find",
    "id": "find-zipper-pull",
    "title": "Zipper Pull",
    "data": {
      "id": "find-zipper-pull",
      "name": "Zipper Pull",
      "rarity": "common",
      "flavor": "The jacket is having a harder day.",
      "looks_like": "a small silver zipper tab with a broken loop",
      "comes_out": "Load 12+; tinks against the drum as the door opens",
      "shown": "hooked over one cork-board tack",
      "set": "desk-drawer",
      "help": "Adds a one-swipe shortcut from room to Drawer; no gameplay effect.",
      "help_kind": "comfort"
    },
    "looks_like": "a small silver zipper tab with a broken loop",
    "why": "A literal 'open faster' object for a harmless navigation comfort.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 11,
    "kind": "find",
    "id": "find-tiny-clothespin",
    "title": "Tiny Clothespin",
    "data": {
      "id": "find-tiny-clothespin",
      "name": "Tiny Clothespin",
      "rarity": "uncommon",
      "flavor": "Has been promoted beyond its qualifications.",
      "looks_like": "a natural wood miniature clothespin with silver spring",
      "comes_out": "Load 15+; caught in the hem of a knee sock",
      "shown": "clipped to a string beneath the cork board",
      "set": "laundry-pocket",
      "help": "Laundry Day only: pin one loose sock to the top edge of the table as a temporary parking spot.",
      "help_kind": "comfort"
    },
    "looks_like": "a natural wood miniature clothespin with silver spring",
    "why": "Useful organization without touching Rush, Daily scoring, payouts, or decoy logic.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 12,
    "kind": "find",
    "id": "find-single-pearl-bead",
    "title": "Pearl Bead",
    "data": {
      "id": "find-single-pearl-bead",
      "name": "Pearl Bead",
      "rarity": "common",
      "flavor": "Escaped something much more formal.",
      "looks_like": "one off-white bead with a visible center hole",
      "comes_out": "Load 15+; rolls from a dress sock and circles before stopping",
      "shown": "in a six-well bead tray on the shelf",
      "set": "sewing-drawer",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "one off-white bead with a visible center hole",
    "why": "Tiny, readable and slightly mysterious.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 13,
    "kind": "find",
    "id": "find-lone-cufflink",
    "title": "Cufflink With No Shirt",
    "data": {
      "id": "find-lone-cufflink",
      "name": "Cufflink With No Shirt",
      "rarity": "rare",
      "flavor": "The shirt has moved on.",
      "looks_like": "a square brass cufflink with a dark green enamel center",
      "comes_out": "Load 20+; falls from a dress sock after matching",
      "shown": "in a velvet-lined matchbox on the shelf",
      "set": "nightstand-cleanout",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a square brass cufflink with a dark green enamel center",
    "why": "Feels improbably fancy in a laundry game.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 14,
    "kind": "find",
    "id": "find-dog-bag-ring",
    "title": "Dog-Walk Bag Ring",
    "data": {
      "id": "find-dog-bag-ring",
      "name": "Dog-Walk Bag Ring",
      "rarity": "common",
      "flavor": "The bags are gone. The responsibility remains.",
      "looks_like": "a small black cardboard tube ring with a torn green wrapper edge",
      "comes_out": "Load 20+; caught inside a rolled cuff",
      "shown": "in a shallow tray near the door",
      "set": "dog-walk-jacket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a small black cardboard tube ring with a torn green wrapper edge",
    "why": "An adult-life object that is specific without a brand.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 15,
    "kind": "find",
    "id": "find-mini-magnet",
    "title": "Mini Magnet",
    "data": {
      "id": "find-mini-magnet",
      "name": "Mini Magnet",
      "rarity": "uncommon",
      "flavor": "Strong enough for one very small emergency.",
      "looks_like": "a silver disk magnet with a blue paint chip",
      "comes_out": "Load 22+; clings to the metal basket rim until a shot lands",
      "shown": "stuck to the side of the display shelf bracket",
      "set": "laundry-pocket",
      "help": "Laundry Day only: missed sock balls roll back to the table edge instead of resting on the floor.",
      "help_kind": "comfort"
    },
    "looks_like": "a silver disk magnet with a blue paint chip",
    "why": "It saves a recovery gesture but cannot improve Rush or Daily performance.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "F",
    "rank": 16,
    "kind": "find",
    "id": "find-paperclip-swan",
    "title": "Paper Clip Swan",
    "data": {
      "id": "find-paperclip-swan",
      "name": "Paper Clip Swan",
      "rarity": "uncommon",
      "flavor": "Had a meeting. Made this instead.",
      "looks_like": "a silver paper clip bent into a crude swan silhouette",
      "comes_out": "Load 25+; springs from the fold of a pair as it is rolled",
      "shown": "pinned upright on the cork board",
      "set": "desk-drawer",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a silver paper clip bent into a crude swan silhouette",
    "why": "A deadpan office artifact with a surprisingly readable shape.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 17,
    "kind": "find",
    "id": "find-cough-drop-wrapper",
    "title": "Cough Drop Wrapper",
    "data": {
      "id": "find-cough-drop-wrapper",
      "name": "Cough Drop Wrapper",
      "rarity": "common",
      "flavor": "The cough won. The wrapper persisted.",
      "looks_like": "a crinkled amber cellophane square with twisted ends",
      "comes_out": "Load 25+; peels from the inside of a slipper",
      "shown": "pressed flat in the cork-board corner",
      "set": "winter-coat-pocket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a crinkled amber cellophane square with twisted ends",
    "why": "Looks exactly like something the washer would discover.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 18,
    "kind": "find",
    "id": "find-tiny-bell",
    "title": "Tiny Bell",
    "data": {
      "id": "find-tiny-bell",
      "name": "Tiny Bell",
      "rarity": "rare",
      "flavor": "Rings only when nobody asked.",
      "looks_like": "a pea-sized brass jingle bell with cross-cut opening",
      "comes_out": "Load 30+; audibly jingles inside the drum before appearing",
      "shown": "hanging from one lower shelf hook",
      "set": "child-jacket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a pea-sized brass jingle bell with cross-cut opening",
    "why": "The reveal can be heard before it is seen.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 19,
    "kind": "find",
    "id": "find-lens-wipe",
    "title": "Lens Wipe Packet",
    "data": {
      "id": "find-lens-wipe",
      "name": "Lens Wipe Packet",
      "rarity": "uncommon",
      "flavor": "Cleaned everything except itself.",
      "looks_like": "a silver foil square packet with one blue stripe",
      "comes_out": "Load 30+; sticks to the dryer glass after the heap falls",
      "shown": "tucked upright in the shelf jar",
      "set": "quiet-pocket",
      "help": "Laundry Day only: optionally increases background blur while a sock is held, leaving the sock crisp.",
      "help_kind": "comfort"
    },
    "looks_like": "a silver foil square packet with one blue stripe",
    "why": "A visual focus aid that does not identify the correct twin.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 20,
    "kind": "find",
    "id": "find-pressed-clover",
    "title": "Pressed Clover",
    "data": {
      "id": "find-pressed-clover",
      "name": "Pressed Clover",
      "rarity": "rare",
      "flavor": "Four leaves. Zero useful predictions.",
      "looks_like": "a flat dark green four-leaf clover under a wet translucent scrap",
      "comes_out": "Load 35+; found adhered to the outside of a sock after tumbling",
      "shown": "under a tiny clear acrylic square on the windowsill",
      "set": "raincoat-pocket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a flat dark green four-leaf clover under a wet translucent scrap",
    "why": "A tiny lucky object that wisely grants no luck mechanic.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 21,
    "kind": "find",
    "id": "find-comb-tooth",
    "title": "Pocket Comb Tooth",
    "data": {
      "id": "find-comb-tooth",
      "name": "Pocket Comb Tooth",
      "rarity": "common",
      "flavor": "The rest of the comb knows what happened.",
      "looks_like": "a single black plastic comb tooth with broken base",
      "comes_out": "Load 40+; falls from a novelty sock when it is flipped",
      "shown": "in the oddities jar",
      "set": "nightstand-cleanout",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a single black plastic comb tooth with broken base",
    "why": "Absurdly mundane, which fits TUMBLE's voice.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 22,
    "kind": "find",
    "id": "find-plastic-jewel",
    "title": "Plastic Jewel",
    "data": {
      "id": "find-plastic-jewel",
      "name": "Plastic Jewel",
      "rarity": "uncommon",
      "flavor": "Royalty was briefly considered.",
      "looks_like": "a faceted hot-pink oval plastic gem, foil backing missing",
      "comes_out": "Load 45+; glints between two socks as the pile settles",
      "shown": "in the windowsill dish",
      "set": "child-jacket",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a faceted hot-pink oval plastic gem, foil backing missing",
    "why": "A bright thumbnail reward for midgame.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 23,
    "kind": "find",
    "id": "find-cart-token",
    "title": "Grocery Cart Token",
    "data": {
      "id": "find-cart-token",
      "name": "Grocery Cart Token",
      "rarity": "uncommon",
      "flavor": "Prepared for a cart that requires no coin.",
      "looks_like": "a green plastic coin-shaped token with a keyring hole",
      "comes_out": "Load 50+; found nested inside a sock ball after a successful throw",
      "shown": "hung from the purse snap",
      "set": "saturday-errands",
      "help": "Remembers the last selected Load size at the dryer door.",
      "help_kind": "comfort"
    },
    "looks_like": "a green plastic coin-shaped token with a keyring hole",
    "why": "Convenience only, and the object explains the function.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 24,
    "kind": "find",
    "id": "find-tiny-spring",
    "title": "Tiny Spring",
    "data": {
      "id": "find-tiny-spring",
      "name": "Tiny Spring",
      "rarity": "rare",
      "flavor": "Still waiting to be important.",
      "looks_like": "a bright steel compression spring about two centimeters long",
      "comes_out": "Load 55+; bounces from the drum lip and lands standing once",
      "shown": "upright inside a narrow vial on the shelf",
      "set": "desk-drawer",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a bright steel compression spring about two centimeters long",
    "why": "A satisfying physics object that looks engineered and purposeless.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 25,
    "kind": "find",
    "id": "find-parking-punch-card",
    "title": "Parking Punch Card",
    "data": {
      "id": "find-parking-punch-card",
      "name": "Parking Punch Card",
      "rarity": "uncommon",
      "flavor": "One stamp away from absolutely nothing.",
      "looks_like": "a washed cream card with five faded circle punches",
      "comes_out": "Load 60+; emerges stuck flat to the dryer door glass",
      "shown": "pinned to the cork board",
      "set": "saturday-errands",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a washed cream card with five faded circle punches",
    "why": "Feels like evidence of an entire unseen Saturday.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 26,
    "kind": "find",
    "id": "find-compass-charm",
    "title": "Little Compass Charm",
    "data": {
      "id": "find-compass-charm",
      "name": "Little Compass Charm",
      "rarity": "rare",
      "flavor": "Points somewhere. Refuses follow-up questions.",
      "looks_like": "a tiny round brass compass charm with black needle painted off-center",
      "comes_out": "Load 65+; dangles from a cuff thread until the sock is picked up",
      "shown": "on a short hook beside the cork board",
      "set": "raincoat-pocket",
      "help": "Would point subtly toward the real twin of the held sock.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "a tiny round brass compass charm with black needle painted off-center",
    "why": "A lovely object, but mate direction crosses from comfort into solving the puzzle.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 27,
    "kind": "find",
    "id": "find-green-eraser",
    "title": "Lucky Green Eraser",
    "data": {
      "id": "find-green-eraser",
      "name": "Lucky Green Eraser",
      "rarity": "rare",
      "flavor": "Has removed more math than mistakes.",
      "looks_like": "a rectangular green eraser with one rounded used end",
      "comes_out": "Load 70+; drops from a crew sock and leaves a faint green smear",
      "shown": "in the school-desk glass dish",
      "set": "school-desk-pocket",
      "help": "Would remove one decoy from each Laundry Day pile.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "a rectangular green eraser with one rounded used end",
    "why": "Even in untimed play, deleting a decoy changes the puzzle rather than the handling.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 28,
    "kind": "find",
    "id": "find-tiny-stopwatch",
    "title": "Tiny Stopwatch",
    "data": {
      "id": "find-tiny-stopwatch",
      "name": "Tiny Stopwatch",
      "rarity": "rare",
      "flavor": "Measures exactly how late you already are.",
      "looks_like": "a silver stopwatch charm with black face and red hand",
      "comes_out": "Load 80+; found tangled in a knee sock cuff",
      "shown": "hung from the cork board",
      "set": "nightstand-cleanout",
      "help": "Would add five seconds to every Rush timer.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "a silver stopwatch charm with black face and red hand",
    "why": "Direct timed-mode power is an advantage, not a comfort.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 29,
    "kind": "find",
    "id": "find-lint-lottery-token",
    "title": "Lint Lottery Token",
    "data": {
      "id": "find-lint-lottery-token",
      "name": "Lint Lottery Token",
      "rarity": "rare",
      "flavor": "Promises returns it cannot responsibly discuss.",
      "looks_like": "a cream plastic token with a simple lint-ball spiral",
      "comes_out": "Load 90+; rolls out of the coin purse tray after a Load",
      "shown": "in a tiny display stand beside the purse",
      "set": "saturday-errands",
      "help": "Would double Lint from the next Load.",
      "help_kind": "would_not_ship"
    },
    "looks_like": "a cream plastic token with a simple lint-ball spiral",
    "why": "Resource multiplication turns a keepsake into progression power.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 30,
    "kind": "find",
    "id": "find-thimble-nobody",
    "title": "The Thimble That Fits Nobody",
    "data": {
      "id": "find-thimble-nobody",
      "name": "The Thimble That Fits Nobody",
      "rarity": "once",
      "flavor": "Waited one hundred Loads to be slightly too small.",
      "looks_like": "a worn silver thimble with three neat dents and darkened rim",
      "comes_out": "Exactly on the player's 100th completed Load; it sits alone on top of the folded summary sheet",
      "shown": "centered in a tiny velvet niche on the display shelf",
      "set": "sewing-drawer",
      "help": null,
      "help_kind": "keepsake"
    },
    "looks_like": "a worn silver thimble with three neat dents and darkened rim",
    "why": "A once-only physical milestone that is humble, specific, and visibly different from random finds.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "set",
    "id": "set-school-desk-pocket",
    "title": "The School Desk Pocket",
    "data": {
      "members": [
        "Tiny Plastic Dinosaur",
        "The Pencil Stub",
        "One Red Die",
        "Rubber Pencil Grip",
        "Lucky Green Eraser"
      ],
      "visible_completion": "The five objects move from the dish into a little clear-front pencil box labeled ROOM 12; the eraser sits crooked on top."
    },
    "looks_like": null,
    "why": "A broad, instantly legible miniature story made from everyday objects.",
    "cost_to_build": "code-small",
    "confidence": 0.84
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "set",
    "id": "set-saturday-errands",
    "title": "Saturday Errands",
    "data": {
      "members": [
        "Arcade Token",
        "Grocery Cart Token",
        "Parking Punch Card",
        "Lint Lottery Token"
      ],
      "visible_completion": "The items arrange under a tiny hand-drawn route map on the cork board; a red thread connects four stops but leads nowhere."
    },
    "looks_like": null,
    "why": "The finished set becomes a miniature day out rather than a checklist.",
    "cost_to_build": "code-small",
    "confidence": 0.84
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "set",
    "id": "set-desk-drawer",
    "title": "The Desk Drawer That Would Not Close",
    "data": {
      "members": [
        "Tiny Binder Clip",
        "Zipper Pull",
        "Paper Clip Swan",
        "Tiny Spring"
      ],
      "visible_completion": "A shallow wooden drawer-box appears on the shelf and remains visibly one millimeter too full to close."
    },
    "looks_like": null,
    "why": "A visual punchline made from the exact contents of the set.",
    "cost_to_build": "code-small",
    "confidence": 0.84
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "set",
    "id": "set-child-jacket",
    "title": "A Child's Jacket, Probably",
    "data": {
      "members": [
        "Aquarium Stone",
        "Tiny Bell",
        "Plastic Jewel"
      ],
      "visible_completion": "The three finds hang in a tiny clear coat-pocket shadow box with a hand-sewn yellow lining."
    },
    "looks_like": null,
    "why": "Small bright objects become one coherent remembered pocket.",
    "cost_to_build": "code-small",
    "confidence": 0.84
  },
  {
    "lane": "F",
    "rank": 5,
    "kind": "set",
    "id": "set-sewing-drawer",
    "title": "The Sewing Drawer",
    "data": {
      "members": [
        "Pearl Bead",
        "The Thimble That Fits Nobody"
      ],
      "visible_completion": "The thimble gains a tiny folded scrap of floral fabric beneath it and the bead rests in the dimple on top."
    },
    "looks_like": null,
    "why": "The hundredth-Load object receives a visible ceremony without granting power.",
    "cost_to_build": "code-small",
    "confidence": 0.84
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "sink",
    "id": "sink-lint-menagerie",
    "title": "Felted Lint Menagerie",
    "data": {
      "lint_cost": 50,
      "effect": "Compress 50 Lint into one tiny felt animal for the shelf. There are 24 silhouettes; duplicates become a slightly darker shade, so the row can keep growing."
    },
    "looks_like": null,
    "why": "A physical transformation of the currency into a collection that remains visible.",
    "cost_to_build": "art",
    "confidence": 0.82
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "sink",
    "id": "sink-paper-chain",
    "title": "The Paper Chain Around the Shelf",
    "data": {
      "lint_cost": 20,
      "effect": "Spend 20 Lint to add one colored paper link to a chain draped around the shelf. At 100 links it begins a second loop instead of stopping."
    },
    "looks_like": null,
    "why": "A nearly bottomless visible sink that slowly makes the room yours.",
    "cost_to_build": "code-small",
    "confidence": 0.82
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "sink",
    "id": "sink-postcards-nowhere",
    "title": "Postcards From Nowhere",
    "data": {
      "lint_cost": 75,
      "effect": "Buy a blank postcard from the dryer-top tin; it develops one of 36 fictional landscape prints and is pinned to the wall. No duplicates until all 36 appear."
    },
    "looks_like": null,
    "why": "A cheap, collectible wall texture that does not compete with hero socks.",
    "cost_to_build": "code-small",
    "confidence": 0.82
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "sink",
    "id": "sink-soap-flake-jar",
    "title": "Soap-Flake Jar",
    "data": {
      "lint_cost": 25,
      "effect": "Each 25 Lint adds one visible scoop of colored soap flakes to a tall clear apothecary jar. When full, the player can seal and shelve it, then start another jar."
    },
    "looks_like": null,
    "why": "An intentionally mundane endless ritual with excellent room visibility.",
    "cost_to_build": "code-small",
    "confidence": 0.82
  },
  {
    "lane": "F",
    "rank": 1,
    "kind": "peg",
    "id": "peg-easy-reach",
    "title": "Easy Reach",
    "data": {
      "earns": "Match 250 pairs.",
      "stat": "pairs",
      "comfort": "Laundry Day only: any missed sock ball returns to the near edge of the table instead of the floor."
    },
    "looks_like": null,
    "why": "It removes a repetitive recovery reach without changing whether a shot counts.",
    "cost_to_build": "data",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 2,
    "kind": "peg",
    "id": "peg-gentle-grip",
    "title": "Gentle Grip",
    "data": {
      "earns": "Turn 75 inside-out socks right-side out.",
      "stat": "flips",
      "comfort": "The flip gesture accepts a wider vertical swipe angle, but the sock still must be deliberately flipped."
    },
    "looks_like": null,
    "why": "It helps motor precision while preserving the task.",
    "cost_to_build": "data",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 3,
    "kind": "peg",
    "id": "peg-remember-load",
    "title": "No Hunting Through Menus",
    "data": {
      "earns": "Finish 75 Loads.",
      "stat": "loads",
      "comfort": "The dryer door remembers your last Load size and difficulty tier until you change them."
    },
    "looks_like": null,
    "why": "The reward is setup friction removed, not game difficulty removed.",
    "cost_to_build": "data",
    "confidence": 0.88
  },
  {
    "lane": "F",
    "rank": 4,
    "kind": "peg",
    "id": "peg-quiet-basket",
    "title": "Quiet Basket",
    "data": {
      "earns": "Make 500 basket shots.",
      "stat": "shotsMade",
      "comfort": "Adds an optional low-impact basket audio mix that keeps success readable without sharp clinks."
    },
    "looks_like": null,
    "why": "A sensory comfort earned through the exact action whose sound it softens.",
    "cost_to_build": "data",
    "confidence": 0.88
  },
  {
    "lane": "A",
    "rank": 1,
    "kind": "pack",
    "id": "pack-bookstore-after-closing",
    "title": "Bookstore After Closing",
    "data": {
      "id": "pack-bookstore-after-closing",
      "cat": "pack",
      "name": "Bookstore After Closing",
      "desc": "Ten socks for people who enter for one book and leave carrying a weather system of paper.",
      "cost": {
        "quarters": 0
      },
      "start": true,
      "look": {
        "pack": "bookstore-after-closing"
      }
    },
    "looks_like": null,
    "why": "Readers, library people, stationery people, and anyone whose nightstand has become furniture.",
    "cost_to_build": "data",
    "confidence": 0.88
  },
  {
    "lane": "A",
    "rank": 1,
    "kind": "hero",
    "id": "hero-the-book-face-down",
    "title": "The Book Face-Down",
    "data": {
      "name": "The Book Face-Down",
      "pack": "bookstore-after-closing",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Saving the page the dangerous way.",
      "source": "pack",
      "design": {
        "body": "#d8c3a5",
        "accents": {
          "ink": "#3d342f",
          "page": "#f3ead8"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "an open book made from two cream rounded boxes, one page corner folded down"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 2,
    "kind": "hero",
    "id": "hero-library-hold-ready",
    "title": "Library Hold Ready",
    "data": {
      "name": "Library Hold Ready",
      "pack": "bookstore-after-closing",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Arrived exactly when you started another book.",
      "source": "pack",
      "design": {
        "body": "#446c7a",
        "accents": {
          "paper": "#f1b24a",
          "paper2": "#d6655a",
          "ink": "#f4eadb"
        },
        "family": "stripe",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a cream book rectangle with a small green HOLD tab sticking from the top and one black check circle"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 3,
    "kind": "hero",
    "id": "hero-the-library-receipt",
    "title": "The Library Receipt",
    "data": {
      "name": "The Library Receipt",
      "pack": "bookstore-after-closing",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Due yesterday. Emotionally due next Thursday.",
      "source": "pack",
      "design": {
        "body": "#efe7d6",
        "accents": {
          "ink": "#30343b",
          "stamp": "#b44d4d"
        },
        "family": "stripe",
        "cuff": "plain rib",
        "heelToe": 0,
        "emblems": [
          {
            "where": "leg",
            "what": "a long receipt rounded box with short black line segments and one red circle stamp"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 4,
    "kind": "hero",
    "id": "hero-used-book-smell",
    "title": "Used Book Smell",
    "data": {
      "name": "Used Book Smell",
      "pack": "bookstore-after-closing",
      "silhouette": "slipper",
      "rarity": "common",
      "flavor": "Impossible to draw. Somehow still present.",
      "source": "pack",
      "design": {
        "body": "#7c5b45",
        "accents": {
          "page": "#dbc8a8",
          "gold": "#b98c48"
        },
        "family": "gradient",
        "cuff": "wide band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "three stacked book rectangles with worn uneven edges"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 5,
    "kind": "hero",
    "id": "hero-one-more-chapter",
    "title": "One More Chapter",
    "data": {
      "name": "One More Chapter",
      "pack": "bookstore-after-closing",
      "silhouette": "knee",
      "rarity": "common",
      "flavor": "Has made this promise at 1:47 a.m.",
      "source": "pack",
      "design": {
        "body": "#2d4665",
        "accents": {
          "moon": "#e7dca8",
          "page": "#f2eadc"
        },
        "family": "solid",
        "cuff": "twin stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a cream crescent moon above a tiny open book"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 6,
    "kind": "hero",
    "id": "hero-shelf-ladder-ambition",
    "title": "Shelf Ladder Ambition",
    "data": {
      "name": "Shelf Ladder Ambition",
      "pack": "bookstore-after-closing",
      "silhouette": "crew",
      "rarity": "uncommon",
      "flavor": "Lives for the unreachable top shelf.",
      "source": "pack",
      "design": {
        "body": "#526a4c",
        "accents": {
          "wood": "#b47f56",
          "page": "#eee4cf"
        },
        "family": "heelToe",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a tiny ladder made from two vertical thick lines and four short rungs beside three book blocks"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 7,
    "kind": "hero",
    "id": "hero-margin-notes-got-personal",
    "title": "Margin Notes Got Personal",
    "data": {
      "name": "Margin Notes Got Personal",
      "pack": "bookstore-after-closing",
      "silhouette": "toe",
      "rarity": "uncommon",
      "flavor": "The author started it.",
      "source": "pack",
      "design": {
        "body": "#d6c9b7",
        "accents": {
          "ink": "#39424a",
          "red": "#a94a44"
        },
        "family": "motifScatter",
        "cuff": "checker band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "small black line segments around one red exclamation mark made from a line and circle"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 8,
    "kind": "hero",
    "id": "hero-the-tbr-chair",
    "title": "The TBR Chair",
    "data": {
      "name": "The TBR Chair",
      "pack": "bookstore-after-closing",
      "silhouette": "novelty",
      "rarity": "uncommon",
      "flavor": "No longer legally counts as seating.",
      "source": "pack",
      "design": {
        "body": "#9b6b53",
        "accents": {
          "book": "#d9a85c",
          "book2": "#5e7a72",
          "book3": "#7b536d"
        },
        "family": "solid",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a brown chair silhouette built from rounded boxes almost buried under three colored book rectangles"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 9,
    "kind": "hero",
    "id": "hero-first-edition-probably-not",
    "title": "First Edition, Probably Not",
    "data": {
      "name": "First Edition, Probably Not",
      "pack": "bookstore-after-closing",
      "silhouette": "dress",
      "rarity": "rare",
      "flavor": "The pencil price says otherwise.",
      "source": "pack",
      "design": {
        "body": "#3e3748",
        "accents": {
          "gold": "#c9a45c",
          "cream": "#ede0c4"
        },
        "family": "fairIsle",
        "cuff": "triple stripe",
        "heelToe": 3,
        "emblems": [
          {
            "where": "leg",
            "what": "one ornate-looking book rectangle with gold border lines and a cream diamond"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 10,
    "kind": "hero",
    "id": "hero-bookshop-cat-is-management",
    "title": "Bookshop Cat Is Management",
    "data": {
      "name": "Bookshop Cat Is Management",
      "pack": "bookstore-after-closing",
      "silhouette": "slipper",
      "rarity": "rare",
      "flavor": "Has denied your return request.",
      "source": "pack",
      "design": {
        "body": "#66574d",
        "accents": {
          "cat": "#d9a264",
          "book": "#68809b"
        },
        "family": "solid",
        "cuff": "scalloped",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "orange cat head motif sitting above two stacked book rectangles"
          }
        ]
      },
      "seasonal": "autumn"
    },
    "looks_like": null,
    "why": "Bookstore After Closing: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 2,
    "kind": "pack",
    "id": "pack-office-kitchen-evidence",
    "title": "Office Kitchen Evidence",
    "data": {
      "id": "pack-office-kitchen-evidence",
      "cat": "pack",
      "name": "Office Kitchen Evidence",
      "desc": "Ten socks from the break room nobody technically owns but everyone has opinions about.",
      "cost": {
        "quarters": 10
      },
      "start": false,
      "look": {
        "pack": "office-kitchen-evidence"
      }
    },
    "looks_like": null,
    "why": "Office workers, teachers, remote-work veterans, and survivors of communal refrigerators.",
    "cost_to_build": "data",
    "confidence": 0.86
  },
  {
    "lane": "A",
    "rank": 1,
    "kind": "hero",
    "id": "hero-mug-in-the-sink-since-monday",
    "title": "Mug in the Sink Since Monday",
    "data": {
      "name": "Mug in the Sink Since Monday",
      "pack": "office-kitchen-evidence",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Nobody recognizes it. Everybody recognizes it.",
      "source": "pack",
      "design": {
        "body": "#d7e1df",
        "accents": {
          "mug": "#6f9ca3",
          "sink": "#bfc6c8"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a blue mug rounded box with handle circle sitting in a grey basin half-oval"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 2,
    "kind": "hero",
    "id": "hero-reply-all-at-4-58",
    "title": "Reply All at 4:58",
    "data": {
      "name": "Reply All at 4:58",
      "pack": "office-kitchen-evidence",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Could have been tomorrow.",
      "source": "pack",
      "design": {
        "body": "#edf0e9",
        "accents": {
          "red": "#c85b55",
          "ink": "#45505a"
        },
        "family": "stripe",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a white envelope rounded box with one red upward arrow"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 3,
    "kind": "hero",
    "id": "hero-someone-s-yogurt-ancient",
    "title": "Someone's Yogurt, Ancient",
    "data": {
      "name": "Someone's Yogurt, Ancient",
      "pack": "office-kitchen-evidence",
      "silhouette": "slipper",
      "rarity": "common",
      "flavor": "The date has become a suggestion.",
      "source": "pack",
      "design": {
        "body": "#d5e7d2",
        "accents": {
          "cup": "#f0eee4",
          "lid": "#899b7a"
        },
        "family": "polka",
        "cuff": "dotted band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "a small white cup trapezoid with a green lid line and one suspicious grey dot"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 4,
    "kind": "hero",
    "id": "hero-the-good-stapler",
    "title": "The Good Stapler",
    "data": {
      "name": "The Good Stapler",
      "pack": "office-kitchen-evidence",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Lives in a drawer for its own protection.",
      "source": "pack",
      "design": {
        "body": "#4e5663",
        "accents": {
          "metal": "#c3c7c8",
          "red": "#a34848"
        },
        "family": "heelToe",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a dark rounded stapler shape made from two offset boxes and a silver hinge circle"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 5,
    "kind": "hero",
    "id": "hero-conference-room-pretzels",
    "title": "Conference Room Pretzels",
    "data": {
      "name": "Conference Room Pretzels",
      "pack": "office-kitchen-evidence",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "The bowl outlived the meeting.",
      "source": "pack",
      "design": {
        "body": "#c9a56d",
        "accents": {
          "pretzel": "#7b4f35",
          "salt": "#f1e5ca"
        },
        "family": "motifScatter",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "one large brown pretzel built from a looping thick line with six tiny cream salt circles"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 6,
    "kind": "hero",
    "id": "hero-printer-says-paper-jam",
    "title": "Printer Says Paper Jam",
    "data": {
      "name": "Printer Says Paper Jam",
      "pack": "office-kitchen-evidence",
      "silhouette": "knee",
      "rarity": "uncommon",
      "flavor": "There is no paper jam.",
      "source": "pack",
      "design": {
        "body": "#c9ced1",
        "accents": {
          "paper": "#f4f1e9",
          "warning": "#d29c3f"
        },
        "family": "stripe",
        "cuff": "checker band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a grey printer rounded box ejecting a white paper rectangle beside a yellow warning triangle"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 7,
    "kind": "hero",
    "id": "hero-fridge-note-in-all-caps",
    "title": "Fridge Note in All Caps",
    "data": {
      "name": "Fridge Note in All Caps",
      "pack": "office-kitchen-evidence",
      "silhouette": "novelty",
      "rarity": "uncommon",
      "flavor": "It is about the milk.",
      "source": "pack",
      "design": {
        "body": "#f2e7a9",
        "accents": {
          "ink": "#30343a",
          "tape": "#d6c49b"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a yellow note square with five thick black horizontal lines and two tape strips"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 8,
    "kind": "hero",
    "id": "hero-desk-snack-emergency",
    "title": "Desk Snack Emergency",
    "data": {
      "name": "Desk Snack Emergency",
      "pack": "office-kitchen-evidence",
      "silhouette": "toe",
      "rarity": "uncommon",
      "flavor": "Three almonds would have fixed everything.",
      "source": "pack",
      "design": {
        "body": "#8e5f4a",
        "accents": {
          "bag": "#d7b85a",
          "crumb": "#f0dfbd"
        },
        "family": "gradient",
        "cuff": "triple stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a crinkled snack bag polygon with three little crumb circles"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 9,
    "kind": "hero",
    "id": "hero-calendar-invite-mysterious",
    "title": "Calendar Invite: Mysterious",
    "data": {
      "name": "Calendar Invite: Mysterious",
      "pack": "office-kitchen-evidence",
      "silhouette": "dress",
      "rarity": "rare",
      "flavor": "Accepted by twelve people. Understood by none.",
      "source": "pack",
      "design": {
        "body": "#5d7693",
        "accents": {
          "white": "#f3efe5",
          "green": "#6b9c76",
          "red": "#c85f5c"
        },
        "family": "plaid",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a white calendar square with one green check and one red question mark built from thick lines"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 10,
    "kind": "hero",
    "id": "hero-the-refrigerator-lunch-heist",
    "title": "The Refrigerator Lunch Heist",
    "data": {
      "name": "The Refrigerator Lunch Heist",
      "pack": "office-kitchen-evidence",
      "silhouette": "knee",
      "rarity": "rare",
      "flavor": "The container was clearly labeled.",
      "source": "pack",
      "design": {
        "body": "#314b55",
        "accents": {
          "box": "#d9c9a8",
          "label": "#f4efe6",
          "red": "#b6534d"
        },
        "family": "solid",
        "cuff": "checker band",
        "heelToe": 3,
        "emblems": [
          {
            "where": "leg",
            "what": "a lunch container rounded box with white label and one tiny red mask shape made from two ellipses"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Office Kitchen Evidence: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 3,
    "kind": "pack",
    "id": "pack-cottage-chore-club",
    "title": "Cottage Chore Club",
    "data": {
      "id": "pack-cottage-chore-club",
      "cat": "pack",
      "name": "Cottage Chore Club",
      "desc": "Ten domestic little victories for people who romanticize chores until the mosquitoes arrive.",
      "cost": {
        "quarters": 10
      },
      "start": false,
      "look": {
        "pack": "cottage-chore-club"
      }
    },
    "looks_like": null,
    "why": "Cottagecore adults, gardeners, bakers, menders, and people who own more baskets than necessary.",
    "cost_to_build": "data",
    "confidence": 0.8400000000000001
  },
  {
    "lane": "A",
    "rank": 1,
    "kind": "hero",
    "id": "hero-sheets-on-the-line",
    "title": "Sheets on the Line",
    "data": {
      "name": "Sheets on the Line",
      "pack": "cottage-chore-club",
      "silhouette": "knee",
      "rarity": "common",
      "flavor": "Smells like wind and one clothespin.",
      "source": "pack",
      "design": {
        "body": "#dce7e6",
        "accents": {
          "sheet": "#f5f0e5",
          "pin": "#b98b56"
        },
        "family": "stripe",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "two white sheet rectangles on a line with three tiny clothespin rectangles"
          }
        ]
      },
      "seasonal": "spring"
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 2,
    "kind": "hero",
    "id": "hero-jam-jar-lid",
    "title": "Jam Jar Lid",
    "data": {
      "name": "Jam Jar Lid",
      "pack": "cottage-chore-club",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Sticky around the edge, spiritually.",
      "source": "pack",
      "design": {
        "body": "#c24f55",
        "accents": {
          "jar": "#e6d6be",
          "fruit": "#8b4051"
        },
        "family": "polka",
        "cuff": "scalloped",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "a gingham-like lid circle above a pale jar rounded box with berry dots"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 3,
    "kind": "hero",
    "id": "hero-mended-elbow-energy",
    "title": "Mended Elbow Energy",
    "data": {
      "name": "Mended Elbow Energy",
      "pack": "cottage-chore-club",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "The patch is stronger than the original plan.",
      "source": "pack",
      "design": {
        "body": "#8b806e",
        "accents": {
          "patch": "#c98e62",
          "thread": "#ece0c8"
        },
        "family": "plaid",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "one large tan patch rounded box crossed by four cream stitch line segments"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 4,
    "kind": "hero",
    "id": "hero-bread-cooling-by-the-window",
    "title": "Bread Cooling by the Window",
    "data": {
      "name": "Bread Cooling by the Window",
      "pack": "cottage-chore-club",
      "silhouette": "slipper",
      "rarity": "common",
      "flavor": "Touching it early remains under consideration.",
      "source": "pack",
      "design": {
        "body": "#d9b278",
        "accents": {
          "loaf": "#b87846",
          "steam": "#efe6d5"
        },
        "family": "gradient",
        "cuff": "wide band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "a brown loaf half-oval with three score lines and two pale steam curves made from segmented lines"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 5,
    "kind": "hero",
    "id": "hero-herb-bundle-upside-down",
    "title": "Herb Bundle Upside Down",
    "data": {
      "name": "Herb Bundle Upside Down",
      "pack": "cottage-chore-club",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Drying with excellent posture.",
      "source": "pack",
      "design": {
        "body": "#677b58",
        "accents": {
          "leaf": "#a4b376",
          "twine": "#c7a67d"
        },
        "family": "motifScatter",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "three leaf motifs hanging downward from one tan twine line"
          }
        ]
      },
      "seasonal": "autumn"
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 6,
    "kind": "hero",
    "id": "hero-mushroom-basket-no-guarantees",
    "title": "Mushroom Basket, No Guarantees",
    "data": {
      "name": "Mushroom Basket, No Guarantees",
      "pack": "cottage-chore-club",
      "silhouette": "crew",
      "rarity": "uncommon",
      "flavor": "Identifications remain a group project.",
      "source": "pack",
      "design": {
        "body": "#b7a17f",
        "accents": {
          "basket": "#8e6847",
          "cap": "#c86f55",
          "cream": "#eee4cc"
        },
        "family": "solid",
        "cuff": "checker band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a woven basket half-oval holding three mushroom stock motifs in two colors"
          }
        ]
      },
      "seasonal": "autumn"
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 7,
    "kind": "hero",
    "id": "hero-rain-barrel-full",
    "title": "Rain Barrel Full",
    "data": {
      "name": "Rain Barrel Full",
      "pack": "cottage-chore-club",
      "silhouette": "knee",
      "rarity": "uncommon",
      "flavor": "We asked for rain. It overachieved.",
      "source": "pack",
      "design": {
        "body": "#5e7c89",
        "accents": {
          "barrel": "#465e66",
          "water": "#9fc4cd"
        },
        "family": "stripe",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a dark barrel rounded box with three horizontal bands and blue water line at top"
          }
        ]
      },
      "seasonal": "spring"
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 8,
    "kind": "hero",
    "id": "hero-the-good-mending-scissors",
    "title": "The Good Mending Scissors",
    "data": {
      "name": "The Good Mending Scissors",
      "pack": "cottage-chore-club",
      "silhouette": "toe",
      "rarity": "uncommon",
      "flavor": "Not for paper. This remains important.",
      "source": "pack",
      "design": {
        "body": "#7e5c68",
        "accents": {
          "steel": "#c9c8c1",
          "thread": "#e0b060"
        },
        "family": "heelToe",
        "cuff": "dotted band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "small scissors made from two circle handles and crossing thick lines beside one gold thread curl"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 9,
    "kind": "hero",
    "id": "hero-porch-broom-one-good-corner",
    "title": "Porch Broom With One Good Corner",
    "data": {
      "name": "Porch Broom With One Good Corner",
      "pack": "cottage-chore-club",
      "silhouette": "novelty",
      "rarity": "rare",
      "flavor": "The other corner retired last spring.",
      "source": "pack",
      "design": {
        "body": "#9a7254",
        "accents": {
          "straw": "#d4b16b",
          "handle": "#65705f"
        },
        "family": "stripe",
        "cuff": "scalloped",
        "heelToe": 3,
        "emblems": [
          {
            "where": "leg",
            "what": "a broom made from one green thick handle line and a gold straw fan polygon worn shorter on one side"
          }
        ]
      },
      "seasonal": "spring"
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 10,
    "kind": "hero",
    "id": "hero-the-lantern-walk-home",
    "title": "The Lantern Walk Home",
    "data": {
      "name": "The Lantern Walk Home",
      "pack": "cottage-chore-club",
      "silhouette": "knee",
      "rarity": "rare",
      "flavor": "The path knows you by now.",
      "source": "pack",
      "design": {
        "body": "#293b42",
        "accents": {
          "lamp": "#d9aa55",
          "path": "#7d6c55"
        },
        "family": "gradient",
        "cuff": "triple stripe",
        "heelToe": 3,
        "emblems": [
          {
            "where": "leg",
            "what": "a glowing yellow lantern rounded box above a winding path made from three thick line segments"
          }
        ]
      },
      "seasonal": "autumn"
    },
    "looks_like": null,
    "why": "Cottage Chore Club: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 4,
    "kind": "pack",
    "id": "pack-weather-has-plans",
    "title": "Weather Has Plans",
    "data": {
      "id": "pack-weather-has-plans",
      "cat": "pack",
      "name": "Weather Has Plans",
      "desc": "Ten forecasts for people who check the radar before deciding whether pants are happening.",
      "cost": {
        "quarters": 10
      },
      "start": false,
      "look": {
        "pack": "weather-has-plans"
      }
    },
    "looks_like": null,
    "why": "Weather watchers, window people, storm lovers, snow skeptics, and anyone with three weather apps.",
    "cost_to_build": "data",
    "confidence": 0.8200000000000001
  },
  {
    "lane": "A",
    "rank": 1,
    "kind": "hero",
    "id": "hero-twenty-percent-chance",
    "title": "Twenty Percent Chance",
    "data": {
      "name": "Twenty Percent Chance",
      "pack": "weather-has-plans",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "It rained exactly on you.",
      "source": "pack",
      "design": {
        "body": "#8aa0ad",
        "accents": {
          "cloud": "#dce2df",
          "drop": "#5f87a5"
        },
        "family": "solid",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "one pale cloud motif with exactly one blue raindrop beneath it"
          }
        ]
      },
      "seasonal": "spring"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 2,
    "kind": "hero",
    "id": "hero-wind-advisory-hair",
    "title": "Wind Advisory Hair",
    "data": {
      "name": "Wind Advisory Hair",
      "pack": "weather-has-plans",
      "silhouette": "novelty",
      "rarity": "common",
      "flavor": "No amount of planning survived outside.",
      "source": "pack",
      "design": {
        "body": "#d5b986",
        "accents": {
          "wind": "#eef1e8",
          "leaf": "#8aa26e"
        },
        "family": "gradient",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "three white sweeping line segments carrying one green leaf motif"
          }
        ]
      },
      "seasonal": "spring"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 3,
    "kind": "hero",
    "id": "hero-car-thermometer-says-103",
    "title": "Car Thermometer Says 103",
    "data": {
      "name": "Car Thermometer Says 103",
      "pack": "weather-has-plans",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "The pavement agrees.",
      "source": "pack",
      "design": {
        "body": "#d98255",
        "accents": {
          "sun": "#f3c85f",
          "road": "#5f5a56"
        },
        "family": "stripe",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "yellow sun motif above two dark road lines with short heat-wave segments"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 4,
    "kind": "hero",
    "id": "hero-first-frost-on-the-car",
    "title": "First Frost on the Car",
    "data": {
      "name": "First Frost on the Car",
      "pack": "weather-has-plans",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Beautiful until the scraper enters.",
      "source": "pack",
      "design": {
        "body": "#8fa7b7",
        "accents": {
          "ice": "#e8f0ee",
          "glass": "#5f7180"
        },
        "family": "fairIsle",
        "cuff": "wide band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a dark windshield rounded box edged with pale snowflake and diamond shapes"
          }
        ]
      },
      "seasonal": "autumn"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 5,
    "kind": "hero",
    "id": "hero-humidity-has-entered-the-chat",
    "title": "Humidity Has Entered the Chat",
    "data": {
      "name": "Humidity Has Entered the Chat",
      "pack": "weather-has-plans",
      "silhouette": "slipper",
      "rarity": "common",
      "flavor": "Everything is slightly attached to everything.",
      "source": "pack",
      "design": {
        "body": "#7ea39a",
        "accents": {
          "drop": "#bdd9cf",
          "hair": "#4f645f"
        },
        "family": "polka",
        "cuff": "scalloped",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "three oversized pale raindrops around one spiraling dark line"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 6,
    "kind": "hero",
    "id": "hero-radar-blob-at-dinner",
    "title": "Radar Blob at Dinner",
    "data": {
      "name": "Radar Blob at Dinner",
      "pack": "weather-has-plans",
      "silhouette": "knee",
      "rarity": "uncommon",
      "flavor": "Red means put the chairs inside.",
      "source": "pack",
      "design": {
        "body": "#394b5b",
        "accents": {
          "green": "#68a572",
          "yellow": "#e2c257",
          "red": "#c95650"
        },
        "family": "gradient",
        "cuff": "checker band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "three nested irregular rounded blobs in green yellow red centered on one dark circle"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 7,
    "kind": "hero",
    "id": "hero-snow-day-at-5-12-a-m",
    "title": "Snow Day at 5:12 A.M.",
    "data": {
      "name": "Snow Day at 5:12 A.M.",
      "pack": "weather-has-plans",
      "silhouette": "slipper",
      "rarity": "uncommon",
      "flavor": "Checked the phone before both eyes opened.",
      "source": "pack",
      "design": {
        "body": "#dce7ee",
        "accents": {
          "screen": "#394b5b",
          "snow": "#ffffff"
        },
        "family": "solid",
        "cuff": "dotted band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "a dark phone rounded box showing three white snowflakes and a pale clock line"
          }
        ]
      },
      "seasonal": "winter"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 8,
    "kind": "hero",
    "id": "hero-porch-thunder-count",
    "title": "Porch Thunder Count",
    "data": {
      "name": "Porch Thunder Count",
      "pack": "weather-has-plans",
      "silhouette": "crew",
      "rarity": "uncommon",
      "flavor": "One Mississippi remains legally binding.",
      "source": "pack",
      "design": {
        "body": "#4a5367",
        "accents": {
          "bolt": "#e1c65a",
          "cloud": "#aab2b8"
        },
        "family": "chevron",
        "cuff": "triple stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "grey cloud motif with one large yellow bolt motif and three counting dots"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 9,
    "kind": "hero",
    "id": "hero-the-weather-rock",
    "title": "The Weather Rock",
    "data": {
      "name": "The Weather Rock",
      "pack": "weather-has-plans",
      "silhouette": "toe",
      "rarity": "rare",
      "flavor": "Wet means rain. Missing means wind.",
      "source": "pack",
      "design": {
        "body": "#6f6b63",
        "accents": {
          "rock": "#9d9588",
          "sign": "#d2bd8c"
        },
        "family": "heelToe",
        "cuff": "contrast rib",
        "heelToe": 3,
        "emblems": [
          {
            "where": "leg",
            "what": "one grey oval rock hanging from a tan line beneath a tiny sign rectangle"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 10,
    "kind": "hero",
    "id": "hero-clear-night-windows-open",
    "title": "Clear Night, Windows Open",
    "data": {
      "name": "Clear Night, Windows Open",
      "pack": "weather-has-plans",
      "silhouette": "knee",
      "rarity": "rare",
      "flavor": "The house is finally breathing.",
      "source": "pack",
      "design": {
        "body": "#27364d",
        "accents": {
          "star": "#eee1a7",
          "window": "#7696a5"
        },
        "family": "motifScatter",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "an open blue window made from four line segments with three yellow stars outside"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Weather Has Plans: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 5,
    "kind": "pack",
    "id": "pack-astrology-department",
    "title": "Astrology Department",
    "data": {
      "id": "pack-astrology-department",
      "cat": "pack",
      "name": "Astrology Department",
      "desc": "Ten cosmic excuses, charts, moons and extremely confident little conclusions.",
      "cost": {
        "quarters": 10
      },
      "start": false,
      "look": {
        "pack": "astrology-department"
      }
    },
    "looks_like": null,
    "why": "Horoscope readers, moon-calendar people, witchy-cozy players, and friends who ask birth times.",
    "cost_to_build": "data",
    "confidence": 0.8
  },
  {
    "lane": "A",
    "rank": 1,
    "kind": "hero",
    "id": "hero-mercury-did-it",
    "title": "Mercury Did It",
    "data": {
      "name": "Mercury Did It",
      "pack": "astrology-department",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Would like the record corrected retroactively.",
      "source": "pack",
      "design": {
        "body": "#4d5273",
        "accents": {
          "planet": "#b7aacb",
          "line": "#e8dcae"
        },
        "family": "motifScatter",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "one small planet motif with a looping backward arrow made from thick line segments"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 2,
    "kind": "hero",
    "id": "hero-birth-time-please",
    "title": "Birth Time, Please",
    "data": {
      "name": "Birth Time, Please",
      "pack": "astrology-department",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "Approximately is apparently not acceptable.",
      "source": "pack",
      "design": {
        "body": "#d7c7b4",
        "accents": {
          "clock": "#594b5d",
          "star": "#bf8e68"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a simple clock circle with two hands beside one star motif"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 3,
    "kind": "hero",
    "id": "hero-moon-water-on-the-sill",
    "title": "Moon Water on the Sill",
    "data": {
      "name": "Moon Water on the Sill",
      "pack": "astrology-department",
      "silhouette": "slipper",
      "rarity": "common",
      "flavor": "Charged overnight. Forgot why.",
      "source": "pack",
      "design": {
        "body": "#567185",
        "accents": {
          "jar": "#dce8e5",
          "moon": "#e8d9a4"
        },
        "family": "gradient",
        "cuff": "scalloped",
        "heelToe": 1,
        "emblems": [
          {
            "where": "top of foot",
            "what": "a pale jar rounded box containing a yellow crescent moon"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 4,
    "kind": "hero",
    "id": "hero-the-group-chat-chart",
    "title": "The Group Chat Chart",
    "data": {
      "name": "The Group Chat Chart",
      "pack": "astrology-department",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Everyone has been assigned a planet.",
      "source": "pack",
      "design": {
        "body": "#6e5b78",
        "accents": {
          "line": "#d8c6a3",
          "dot": "#a9c2c1"
        },
        "family": "plaid",
        "cuff": "dotted band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "thin intersecting lines linking five colored dot circles like a birth chart"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 5,
    "kind": "hero",
    "id": "hero-new-moon-plans",
    "title": "New Moon Plans",
    "data": {
      "name": "New Moon Plans",
      "pack": "astrology-department",
      "silhouette": "knee",
      "rarity": "common",
      "flavor": "Excellent time to buy another notebook.",
      "source": "pack",
      "design": {
        "body": "#2d3445",
        "accents": {
          "moon": "#111820",
          "gold": "#d1ad63"
        },
        "family": "solid",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a nearly black moon circle edged by one gold crescent line above a notebook rectangle"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 6,
    "kind": "hero",
    "id": "hero-rising-sign-reveal",
    "title": "Rising Sign Reveal",
    "data": {
      "name": "Rising Sign Reveal",
      "pack": "astrology-department",
      "silhouette": "crew",
      "rarity": "uncommon",
      "flavor": "Explained everything for nearly eleven minutes.",
      "source": "pack",
      "design": {
        "body": "#a77b6e",
        "accents": {
          "sun": "#e3bd67",
          "horizon": "#5f6d74"
        },
        "family": "stripe",
        "cuff": "triple stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "half a yellow sun motif rising above three horizontal line segments"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 7,
    "kind": "hero",
    "id": "hero-crystal-on-the-laptop",
    "title": "Crystal on the Laptop",
    "data": {
      "name": "Crystal on the Laptop",
      "pack": "astrology-department",
      "silhouette": "toe",
      "rarity": "uncommon",
      "flavor": "Cybersecurity remains unconvinced.",
      "source": "pack",
      "design": {
        "body": "#526b69",
        "accents": {
          "crystal": "#b9d2c7",
          "screen": "#343f46"
        },
        "family": "heelToe",
        "cuff": "checker band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a dark laptop rounded box with one pale faceted crystal polygon sitting on it"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 8,
    "kind": "hero",
    "id": "hero-retrograde-appointment",
    "title": "Retrograde Appointment",
    "data": {
      "name": "Retrograde Appointment",
      "pack": "astrology-department",
      "silhouette": "novelty",
      "rarity": "uncommon",
      "flavor": "Rescheduled itself somehow.",
      "source": "pack",
      "design": {
        "body": "#7b5265",
        "accents": {
          "calendar": "#efe5d4",
          "arrow": "#d39963"
        },
        "family": "chevron",
        "cuff": "plain rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a cream calendar square with one orange arrow curling backward"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 9,
    "kind": "hero",
    "id": "hero-the-very-specific-transit",
    "title": "The Very Specific Transit",
    "data": {
      "name": "The Very Specific Transit",
      "pack": "astrology-department",
      "silhouette": "dress",
      "rarity": "rare",
      "flavor": "Apparently this explains Tuesday.",
      "source": "pack",
      "design": {
        "body": "#263b55",
        "accents": {
          "orbit": "#d6b76d",
          "planet": "#9ab2c9",
          "planet2": "#c57c75"
        },
        "family": "motifScatter",
        "cuff": "wide band",
        "heelToe": 3,
        "emblems": [
          {
            "where": "leg",
            "what": "two planet motifs connected by three gold orbital arc line segments"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 10,
    "kind": "hero",
    "id": "hero-constellation-you-invented",
    "title": "Constellation You Invented",
    "data": {
      "name": "Constellation You Invented",
      "pack": "astrology-department",
      "silhouette": "knee",
      "rarity": "rare",
      "flavor": "The stars have declined to comment.",
      "source": "pack",
      "design": {
        "body": "#1f2a3d",
        "accents": {
          "star": "#f0df9f",
          "line": "#8097ad"
        },
        "family": "solid",
        "cuff": "triple stripe",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "seven star motifs joined by pale line segments into an unmistakable sock shape"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Astrology Department: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 6,
    "kind": "pack",
    "id": "pack-small-town-saturday",
    "title": "Small Town Saturday",
    "data": {
      "id": "pack-small-town-saturday",
      "cat": "pack",
      "name": "Small Town Saturday",
      "desc": "Ten local errands, parking lots and tiny civic events that somehow become the whole day.",
      "cost": {
        "quarters": 10
      },
      "start": false,
      "look": {
        "pack": "small-town-saturday"
      }
    },
    "looks_like": null,
    "why": "People from small towns, exurban adults, regional-pride players, and anyone who knows a good church-basement sale.",
    "cost_to_build": "data",
    "confidence": 0.78
  },
  {
    "lane": "A",
    "rank": 1,
    "kind": "hero",
    "id": "hero-hardware-store-before-breakfast",
    "title": "Hardware Store Before Breakfast",
    "data": {
      "name": "Hardware Store Before Breakfast",
      "pack": "small-town-saturday",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "Already smells like keys and fertilizer.",
      "source": "pack",
      "design": {
        "body": "#6c7a63",
        "accents": {
          "bucket": "#d0b46c",
          "key": "#b9bec0"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a yellow bucket rounded box beside a simple silver key made from circle and line"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 2,
    "kind": "hero",
    "id": "hero-library-book-sale-dollar-bag",
    "title": "Library Book Sale Dollar Bag",
    "data": {
      "name": "Library Book Sale Dollar Bag",
      "pack": "small-town-saturday",
      "silhouette": "ankle",
      "rarity": "common",
      "flavor": "The bag was the limiting factor.",
      "source": "pack",
      "design": {
        "body": "#d9c39e",
        "accents": {
          "book": "#6d8192",
          "book2": "#a66159"
        },
        "family": "stripe",
        "cuff": "twin stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a tan paper bag polygon holding two colored book rectangles"
          }
        ]
      },
      "seasonal": "spring"
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 3,
    "kind": "hero",
    "id": "hero-fire-hall-pancake-breakfast",
    "title": "Fire Hall Pancake Breakfast",
    "data": {
      "name": "Fire Hall Pancake Breakfast",
      "pack": "small-town-saturday",
      "silhouette": "crew",
      "rarity": "common",
      "flavor": "The coffee arrived before the fork.",
      "source": "pack",
      "design": {
        "body": "#b54b43",
        "accents": {
          "plate": "#eee2c8",
          "pancake": "#d6a15c"
        },
        "family": "polka",
        "cuff": "wide band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a cream plate circle holding three pancake ovals and one tiny square butter"
          }
        ]
      },
      "seasonal": "spring"
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 4,
    "kind": "hero",
    "id": "hero-yard-sale-extension-cord",
    "title": "Yard Sale Extension Cord",
    "data": {
      "name": "Yard Sale Extension Cord",
      "pack": "small-town-saturday",
      "silhouette": "knee",
      "rarity": "common",
      "flavor": "Tested once, somewhere else.",
      "source": "pack",
      "design": {
        "body": "#c6a34d",
        "accents": {
          "cord": "#3f4441",
          "tag": "#f0e0c2"
        },
        "family": "solid",
        "cuff": "checker band",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a coiled black thick line with one cream price-tag rectangle"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 5,
    "kind": "hero",
    "id": "hero-county-road-detour",
    "title": "County Road Detour",
    "data": {
      "name": "County Road Detour",
      "pack": "small-town-saturday",
      "silhouette": "dress",
      "rarity": "common",
      "flavor": "Adds twelve minutes and one excellent barn.",
      "source": "pack",
      "design": {
        "body": "#d9b85d",
        "accents": {
          "orange": "#d77c46",
          "road": "#55585a"
        },
        "family": "chevron",
        "cuff": "plain rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "an orange diamond sign with black arrow line above two road stripes"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 6,
    "kind": "hero",
    "id": "hero-the-good-farmstand-tomato",
    "title": "The Good Farmstand Tomato",
    "data": {
      "name": "The Good Farmstand Tomato",
      "pack": "small-town-saturday",
      "silhouette": "slipper",
      "rarity": "uncommon",
      "flavor": "Purchased with exact change and unreasonable hope.",
      "source": "pack",
      "design": {
        "body": "#d5b67d",
        "accents": {
          "tomato": "#c84f47",
          "leaf": "#63845d"
        },
        "family": "motifScatter",
        "cuff": "scalloped",
        "heelToe": 2,
        "emblems": [
          {
            "where": "top of foot",
            "what": "one large red tomato circle with green leaf motif crown"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 7,
    "kind": "hero",
    "id": "hero-parade-chair-saved-at-dawn",
    "title": "Parade Chair Saved at Dawn",
    "data": {
      "name": "Parade Chair Saved at Dawn",
      "pack": "small-town-saturday",
      "silhouette": "toe",
      "rarity": "uncommon",
      "flavor": "Nobody is stealing this spot.",
      "source": "pack",
      "design": {
        "body": "#55758f",
        "accents": {
          "chair": "#e8d6b2",
          "flag": "#b85b55"
        },
        "family": "heelToe",
        "cuff": "triple stripe",
        "heelToe": 1,
        "emblems": [
          {
            "where": "leg",
            "what": "a folding chair made from thick lines with one tiny red pennant triangle"
          }
        ]
      },
      "seasonal": "summer"
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 8,
    "kind": "hero",
    "id": "hero-thrift-store-half-off-color",
    "title": "Thrift Store Half-Off Color",
    "data": {
      "name": "Thrift Store Half-Off Color",
      "pack": "small-town-saturday",
      "silhouette": "ankle",
      "rarity": "uncommon",
      "flavor": "Today it is yellow. Apparently.",
      "source": "pack",
      "design": {
        "body": "#d6c75f",
        "accents": {
          "tag": "#eee7d4",
          "ink": "#5a5550"
        },
        "family": "gradient",
        "cuff": "dotted band",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "three hanging price-tag polygons, center one yellow"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 9,
    "kind": "hero",
    "id": "hero-town-hall-clock-two-minutes-fast",
    "title": "Town Hall Clock Two Minutes Fast",
    "data": {
      "name": "Town Hall Clock Two Minutes Fast",
      "pack": "small-town-saturday",
      "silhouette": "dress",
      "rarity": "rare",
      "flavor": "Has been correct twice a day for decades.",
      "source": "pack",
      "design": {
        "body": "#6f5b4e",
        "accents": {
          "clock": "#e1d0ae",
          "brick": "#9b6753"
        },
        "family": "plaid",
        "cuff": "wide band",
        "heelToe": 3,
        "emblems": [
          {
            "where": "leg",
            "what": "a simple brick tower of rounded boxes topped by one cream clock circle"
          }
        ]
      }
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "A",
    "rank": 10,
    "kind": "hero",
    "id": "hero-last-car-at-the-craft-fair",
    "title": "Last Car at the Craft Fair",
    "data": {
      "name": "Last Car at the Craft Fair",
      "pack": "small-town-saturday",
      "silhouette": "novelty",
      "rarity": "rare",
      "flavor": "Bought jam. Forgot where parking happened.",
      "source": "pack",
      "design": {
        "body": "#3f5c65",
        "accents": {
          "car": "#c97c58",
          "jar": "#d9b56f"
        },
        "family": "solid",
        "cuff": "contrast rib",
        "heelToe": 2,
        "emblems": [
          {
            "where": "leg",
            "what": "a tiny rust-colored car made from rounded box and wheel circles beside a gold jam jar"
          }
        ]
      },
      "seasonal": "autumn"
    },
    "looks_like": null,
    "why": "Small Town Saturday: a single bold, readable joke or object.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "B",
    "rank": 1,
    "kind": "family",
    "id": "family-herringbone",
    "title": "Herringbone",
    "data": {
      "name": "Herringbone",
      "draw": "Repeated short diagonal line segments meet in alternating V columns, creating a woven chevron texture without using the chevron family's broad color bands.",
      "twin_variation": "Twin identity comes from V width, column spacing, line thickness, and whether adjacent columns point inward or outward.",
      "decoy": "Keep palette and spacing identical but reverse one center column's V direction; at heap size it looks right until compared side by side."
    },
    "looks_like": "Repeated short diagonal line segments meet in alternating V columns, creating a woven chevron texture without using the chevron family's broad color bands.",
    "why": "Adds a visually distinct procedural grammar using only existing primitives.",
    "cost_to_build": "code-small",
    "confidence": 0.86
  },
  {
    "lane": "B",
    "rank": 2,
    "kind": "family",
    "id": "family-basketweave",
    "title": "Basketweave",
    "data": {
      "name": "Basketweave",
      "draw": "Pairs of short horizontal bars alternate with pairs of vertical bars in a chunky over-under grid.",
      "twin_variation": "Twins match the bar length, gap, two-by-two grouping, and phase of the alternating blocks.",
      "decoy": "Shift one row by half a block so one over-under crossing lands in the wrong place."
    },
    "looks_like": "Pairs of short horizontal bars alternate with pairs of vertical bars in a chunky over-under grid.",
    "why": "Adds a visually distinct procedural grammar using only existing primitives.",
    "cost_to_build": "code-small",
    "confidence": 0.84
  },
  {
    "lane": "B",
    "rank": 3,
    "kind": "family",
    "id": "family-contour-lines",
    "title": "Contour Lines",
    "data": {
      "name": "Contour Lines",
      "draw": "Four to seven nested irregular closed loops made from thick line segments, like a simplified topographic map wrapped around the sock.",
      "twin_variation": "Twin identity comes from loop count, the location of the tightest cluster, and whether one loop pinches near the ankle.",
      "decoy": "Move the innermost loop to the opposite side while preserving color and outer loops."
    },
    "looks_like": "Four to seven nested irregular closed loops made from thick line segments, like a simplified topographic map wrapped around the sock.",
    "why": "Adds a visually distinct procedural grammar using only existing primitives.",
    "cost_to_build": "code-small",
    "confidence": 0.8200000000000001
  },
  {
    "lane": "B",
    "rank": 4,
    "kind": "family",
    "id": "family-offset-tiles",
    "title": "Offset Tiles",
    "data": {
      "name": "Offset Tiles",
      "draw": "Rounded rectangles form staggered brick-like rows with a small consistent gap; rows alternate between full tiles and half-offset tiles.",
      "twin_variation": "Twins match tile height, row offset rhythm, gap width, and which color occupies the first row.",
      "decoy": "Keep colors identical but start one middle row unshifted instead of half-shifted."
    },
    "looks_like": "Rounded rectangles form staggered brick-like rows with a small consistent gap; rows alternate between full tiles and half-offset tiles.",
    "why": "Adds a visually distinct procedural grammar using only existing primitives.",
    "cost_to_build": "code-small",
    "confidence": 0.8
  },
  {
    "lane": "B",
    "rank": 5,
    "kind": "family",
    "id": "family-pebble-rings",
    "title": "Pebble Rings",
    "data": {
      "name": "Pebble Rings",
      "draw": "Small dots are grouped into loose rings of five or six around occasional empty centers, with no new motif shapes.",
      "twin_variation": "Twins match ring size, dot count, and the rhythm of empty centers.",
      "decoy": "Replace one six-dot ring with a five-dot ring in the same position so the overall texture remains convincing."
    },
    "looks_like": "Small dots are grouped into loose rings of five or six around occasional empty centers, with no new motif shapes.",
    "why": "Adds a visually distinct procedural grammar using only existing primitives.",
    "cost_to_build": "code-small",
    "confidence": 0.78
  },
  {
    "lane": "B",
    "rank": 6,
    "kind": "family",
    "id": "family-diagonal-sash",
    "title": "Diagonal Sash",
    "data": {
      "name": "Diagonal Sash",
      "draw": "One broad diagonal band crosses the leg and foot, edged by two thin parallel lines; smaller echo bands can repeat once.",
      "twin_variation": "Twins match band angle, width, edge-line count, and where the diagonal crosses the heel area.",
      "decoy": "Mirror the sash angle while keeping the same palette and stripe widths."
    },
    "looks_like": "One broad diagonal band crosses the leg and foot, edged by two thin parallel lines; smaller echo bands can repeat once.",
    "why": "Adds a visually distinct procedural grammar using only existing primitives.",
    "cost_to_build": "code-small",
    "confidence": 0.76
  },
  {
    "lane": "C",
    "rank": 1,
    "kind": "dryer",
    "id": "dryer-cedar-cabinet",
    "title": "Cedar Drying Cabinet",
    "data": {
      "id": "dryer-cedar-cabinet",
      "cat": "dryer",
      "name": "Cedar Drying Cabinet",
      "desc": "Two cedar doors open; three shallow slatted shelves tilt in sequence and let socks slide onto the table in three soft little avalanches.",
      "cost": {
        "quarters": 14
      },
      "start": false,
      "look": {
        "model": "cedarCabinet",
        "color": "#8a5f3e",
        "loads": "shelfCascade"
      },
      "arrival": "Two cedar doors open; three shallow slatted shelves tilt in sequence and let socks slide onto the table in three soft little avalanches.",
      "sound": "wood latch click, three cloth slides, low cabinet creak",
      "new_loads_behavior": true
    },
    "looks_like": "cedarCabinet machine in #8a5f3e",
    "why": "Three quiet waves make the reveal theatrical without changing the final pile.",
    "cost_to_build": "code-small",
    "confidence": 0.875
  },
  {
    "lane": "C",
    "rank": 2,
    "kind": "dryer",
    "id": "dryer-ceiling-pulley",
    "title": "Ceiling Pulley Airer",
    "data": {
      "id": "dryer-ceiling-pulley",
      "cat": "dryer",
      "name": "Ceiling Pulley Airer",
      "desc": "A ceiling rack lowers into frame with socks draped over its rails; each rail tips and releases one row, then the rack rises away.",
      "cost": {
        "quarters": 18
      },
      "start": false,
      "look": {
        "model": "pulleyAirer",
        "color": "#d8c6a2",
        "loads": "rowDrop"
      },
      "arrival": "A ceiling rack lowers into frame with socks draped over its rails; each rail tips and releases one row, then the rack rises away.",
      "sound": "rope pulley whisper, wood knock, cloth flump",
      "new_loads_behavior": true
    },
    "looks_like": "pulleyAirer machine in #d8c6a2",
    "why": "The room briefly gains vertical motion and an old-house ritual.",
    "cost_to_build": "code-small",
    "confidence": 0.86
  },
  {
    "lane": "C",
    "rank": 3,
    "kind": "dryer",
    "id": "dryer-rolling-quilt-cart",
    "title": "Rolling Quilt Cart",
    "data": {
      "id": "dryer-rolling-quilt-cart",
      "cat": "dryer",
      "name": "Rolling Quilt Cart",
      "desc": "A low wooden laundry cart rolls to the table, tips one padded side, and the whole Load slides out in the normal heap.",
      "cost": {
        "quarters": 9
      },
      "start": false,
      "look": {
        "model": "quiltCart",
        "color": "#927456",
        "loads": "regular"
      },
      "arrival": "A low wooden laundry cart rolls to the table, tips one padded side, and the whole Load slides out in the normal heap.",
      "sound": "small caster rattle, wood latch click, broad cloth slide",
      "new_loads_behavior": false
    },
    "looks_like": "quiltCart machine in #927456",
    "why": "A homely wooden silhouette gives the existing regular arrival a completely different character.",
    "cost_to_build": "art",
    "confidence": 0.845
  },
  {
    "lane": "C",
    "rank": 4,
    "kind": "dryer",
    "id": "dryer-green-wringer",
    "title": "Green Enamel Wringer",
    "data": {
      "id": "dryer-green-wringer",
      "cat": "dryer",
      "name": "Green Enamel Wringer",
      "desc": "Pairs emerge flattened between two rubber rollers one sock at a time, drape over a tray, then all slide onto the table together at the end.",
      "cost": {
        "quarters": 20
      },
      "start": false,
      "look": {
        "model": "wringer",
        "color": "#6f866c",
        "loads": "wringerFeed"
      },
      "arrival": "Pairs emerge flattened between two rubber rollers one sock at a time, drape over a tray, then all slide onto the table together at the end.",
      "sound": "rubber roller squeak, enamel tick, final tray clack",
      "new_loads_behavior": true
    },
    "looks_like": "wringer machine in #6f866c",
    "why": "It is immediately readable, tactile, and unlike any existing dryer.",
    "cost_to_build": "code-small",
    "confidence": 0.8300000000000001
  },
  {
    "lane": "C",
    "rank": 5,
    "kind": "dryer",
    "id": "dryer-sun-porch-horse",
    "title": "Sun Porch Drying Horse",
    "data": {
      "id": "dryer-sun-porch-horse",
      "cat": "dryer",
      "name": "Sun Porch Drying Horse",
      "desc": "A wooden folding rack rolls forward; alternate rails fold inward and release small clusters from left, right, left, right.",
      "cost": {
        "quarters": 13
      },
      "start": false,
      "look": {
        "model": "dryingHorse",
        "color": "#c99b65",
        "loads": "rackFold"
      },
      "arrival": "A wooden folding rack rolls forward; alternate rails fold inward and release small clusters from left, right, left, right.",
      "sound": "small wooden hinge clicks, cloth brushing wood",
      "new_loads_behavior": true
    },
    "looks_like": "dryingHorse machine in #c99b65",
    "why": "The alternating release has personality without privileging any sock.",
    "cost_to_build": "code-small",
    "confidence": 0.8150000000000001
  },
  {
    "lane": "C",
    "rank": 6,
    "kind": "dryer",
    "id": "dryer-three-drum-bank",
    "title": "Three-Drum Laundromat Bank",
    "data": {
      "id": "dryer-three-drum-bank",
      "cat": "dryer",
      "name": "Three-Drum Laundromat Bank",
      "desc": "Three small round doors unlatch from top to bottom; each drops roughly one third of the Load before the next opens.",
      "cost": {
        "quarters": 22
      },
      "start": false,
      "look": {
        "model": "tripleDrum",
        "color": "#b9c0bd",
        "loads": "threeWaves"
      },
      "arrival": "Three small round doors unlatch from top to bottom; each drops roughly one third of the Load before the next opens.",
      "sound": "three descending latch clunks, short drum hums",
      "new_loads_behavior": true
    },
    "looks_like": "tripleDrum machine in #b9c0bd",
    "why": "A giant room centerpiece that turns one Load into a satisfying three-beat arrival.",
    "cost_to_build": "code-small",
    "confidence": 0.8
  },
  {
    "lane": "C",
    "rank": 7,
    "kind": "dryer",
    "id": "dryer-heat-pump-cube",
    "title": "Heat-Pump Cube",
    "data": {
      "id": "dryer-heat-pump-cube",
      "cat": "dryer",
      "name": "Heat-Pump Cube",
      "desc": "A quiet modern square door opens flush and the normal heap tumbles out from a deep dark drum.",
      "cost": {
        "quarters": 11
      },
      "start": false,
      "look": {
        "model": "heatPump",
        "color": "#e7e3dc",
        "loads": "regular"
      },
      "arrival": "A quiet modern square door opens flush and the normal heap tumbles out from a deep dark drum.",
      "sound": "soft relay click, muted low fan, padded door stop",
      "new_loads_behavior": false
    },
    "looks_like": "heatPump machine in #e7e3dc",
    "why": "A premium modern option for players who do not want retro whimsy.",
    "cost_to_build": "art",
    "confidence": 0.785
  },
  {
    "lane": "C",
    "rank": 8,
    "kind": "dryer",
    "id": "dryer-wall-spin-canister",
    "title": "Wall-Mounted Spin Canister",
    "data": {
      "id": "dryer-wall-spin-canister",
      "cat": "dryer",
      "name": "Wall-Mounted Spin Canister",
      "desc": "A narrow vertical canister stops spinning; its lower iris opens and socks fall into a shallow circular cradle, which tips the whole ring onto the table.",
      "cost": {
        "quarters": 17
      },
      "start": false,
      "look": {
        "model": "spinCanister",
        "color": "#d6d0c4",
        "loads": "ringRelease"
      },
      "arrival": "A narrow vertical canister stops spinning; its lower iris opens and socks fall into a shallow circular cradle, which tips the whole ring onto the table.",
      "sound": "descending motor whirr, iris snick, canvas cradle flop",
      "new_loads_behavior": true
    },
    "looks_like": "spinCanister machine in #d6d0c4",
    "why": "A compact oddball machine gives the room a completely different silhouette.",
    "cost_to_build": "code-small",
    "confidence": 0.77
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "rug-old-red-medallion",
    "title": "Old Red Medallion Rug",
    "data": {
      "id": "rug-old-red-medallion",
      "cat": "decor",
      "name": "Old Red Medallion Rug",
      "desc": "A faded brick-red medallion rug with a cream center and worn corners.",
      "cost": {
        "lint": 320
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "oldRedMedallion",
        "color": "#8a3f3c",
        "color2": "#d4b777"
      }
    },
    "looks_like": "A faded brick-red medallion rug with a cream center and worn corners.",
    "why": "A rich, instantly premium floor anchor that makes the mint dryer pop.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "rug-granny-square",
    "title": "Granny Square Rug",
    "data": {
      "id": "rug-granny-square",
      "cat": "decor",
      "name": "Granny Square Rug",
      "desc": "Oversized crocheted squares in muted tomato, gold, teal and cream.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "grannySquare",
        "color": "#cc765f",
        "color2": "#e6c76b"
      }
    },
    "looks_like": "Oversized crocheted squares in muted tomato, gold, teal and cream.",
    "why": "Texture and nostalgia read clearly even from the fixed camera.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "rug-blue-ripple",
    "title": "Blue Ripple Oval",
    "data": {
      "id": "rug-blue-ripple",
      "cat": "decor",
      "name": "Blue Ripple Oval",
      "desc": "An oval braided rug with soft concentric blue ripples.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "blueRipple",
        "color": "#6f98a8",
        "color2": "#d7e5df"
      }
    },
    "looks_like": "An oval braided rug with soft concentric blue ripples.",
    "why": "Calm color movement without visual clutter.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "rug-olive-kilim",
    "title": "Olive Stripe Kilim",
    "data": {
      "id": "rug-olive-kilim",
      "cat": "decor",
      "name": "Olive Stripe Kilim",
      "desc": "A flat woven olive rug with narrow cream and rust stepped stripes.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "oliveKilim",
        "color": "#75805d",
        "color2": "#d7c69f"
      }
    },
    "looks_like": "A flat woven olive rug with narrow cream and rust stepped stripes.",
    "why": "Feels collected rather than gamey and photographs well.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "rug-wildflower-border",
    "title": "Wildflower Border Rug",
    "data": {
      "id": "rug-wildflower-border",
      "cat": "decor",
      "name": "Wildflower Border Rug",
      "desc": "A warm flax field with a simple ring of oversized meadow flowers around the edge.",
      "cost": {
        "lint": 340
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "wildflowerBorder",
        "color": "#d9cfae",
        "color2": "#6f8b61"
      }
    },
    "looks_like": "A warm flax field with a simple ring of oversized meadow flowers around the edge.",
    "why": "The empty center keeps socks readable while the border adds personality.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "rug-cloud-shag",
    "title": "Cloud Blue Shag",
    "data": {
      "id": "rug-cloud-shag",
      "cat": "decor",
      "name": "Cloud Blue Shag",
      "desc": "A thick pale-blue shag rug with an uneven hand-trimmed edge.",
      "cost": {
        "lint": 360
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "cloudShag",
        "color": "#a9c1c8",
        "color2": "#e5eded"
      }
    },
    "looks_like": "A thick pale-blue shag rug with an uneven hand-trimmed edge.",
    "why": "Softness is visible from across the room and changes the room silhouette.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 7,
    "kind": "decor",
    "id": "rug-terracotta-blocks",
    "title": "Ochre Block Rug",
    "data": {
      "id": "rug-terracotta-blocks",
      "cat": "decor",
      "name": "Ochre Block Rug",
      "desc": "Chunky offset ochre, cream and charcoal rectangles in a flat woven grid.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "ochreBlocks",
        "color": "#b96f54",
        "color2": "#e2b08b"
      }
    },
    "looks_like": "Chunky offset ochre, cream and charcoal rectangles in a flat woven grid.",
    "why": "A modern graphic option with one strong shape language.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 8,
    "kind": "decor",
    "id": "rug-ink-scribble",
    "title": "Cream Rug With One Scribble",
    "data": {
      "id": "rug-ink-scribble",
      "cat": "decor",
      "name": "Cream Rug With One Scribble",
      "desc": "A plain cream rug crossed by one wandering charcoal line that almost forms a sock.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "inkScribble",
        "color": "#e8dfcd",
        "color2": "#343638"
      }
    },
    "looks_like": "A plain cream rug crossed by one wandering charcoal line that almost forms a sock.",
    "why": "Deadpan minimalism gives the room an art-school option.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 9,
    "kind": "decor",
    "id": "rug-quilted-stars",
    "title": "Quilted Star Rug",
    "data": {
      "id": "rug-quilted-stars",
      "cat": "decor",
      "name": "Quilted Star Rug",
      "desc": "A low-pile navy rug built from large quilt-block stars and warm cream diamonds.",
      "cost": {
        "lint": 310
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "quiltedStars",
        "color": "#6d7892",
        "color2": "#e4c984"
      }
    },
    "looks_like": "A low-pile navy rug built from large quilt-block stars and warm cream diamonds.",
    "why": "Big geometry reads at thumbnail size without needing fine detail.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 10,
    "kind": "decor",
    "id": "rug-pebble-wool",
    "title": "Pebble Wool Rug",
    "data": {
      "id": "rug-pebble-wool",
      "cat": "decor",
      "name": "Pebble Wool Rug",
      "desc": "A nubby grey-brown wool rug with rounded pebble-shaped tufts.",
      "cost": {
        "lint": 250
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "pebbleWool",
        "color": "#8f8a7c",
        "color2": "#c8c0ad"
      }
    },
    "looks_like": "A nubby grey-brown wool rug with rounded pebble-shaped tufts.",
    "why": "A neutral rug that still looks tactile and expensive.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 11,
    "kind": "decor",
    "id": "rug-citrus-round",
    "title": "Citrus Slice Round Rug",
    "data": {
      "id": "rug-citrus-round",
      "cat": "decor",
      "name": "Citrus Slice Round Rug",
      "desc": "A round mustard rug divided into eight pale wedge segments.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "citrusRound",
        "color": "#d6a642",
        "color2": "#f2e4bd"
      }
    },
    "looks_like": "A round mustard rug divided into eight pale wedge segments.",
    "why": "Cheerful, graphic, and easy to model.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 12,
    "kind": "decor",
    "id": "rug-green-river",
    "title": "Green River Runner",
    "data": {
      "id": "rug-green-river",
      "cat": "decor",
      "name": "Green River Runner",
      "desc": "A long green runner with one pale winding band from end to end.",
      "cost": {
        "lint": 270
      },
      "start": false,
      "look": {
        "slot": "rug",
        "variant": "greenRiver",
        "color": "#58766a",
        "color2": "#b7c8aa"
      }
    },
    "looks_like": "A long green runner with one pale winding band from end to end.",
    "why": "A quiet landscape-like shape that leads the eye toward the dryer.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "window-neighbor-line",
    "title": "Neighbor's Laundry Line",
    "data": {
      "id": "window-neighbor-line",
      "cat": "decor",
      "name": "Neighbor's Laundry Line",
      "desc": "A neighboring yard where three shirts move gently on a clothesline and occasionally disappear indoors.",
      "cost": {
        "lint": 320
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "neighborLine",
        "color": "#9ec7cf",
        "color2": "#f0eadc"
      }
    },
    "looks_like": "A neighboring yard where three shirts move gently on a clothesline and occasionally disappear indoors.",
    "why": "It mirrors the game's subject without repeating the player's own socks.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "window-school-bus",
    "title": "7:42 School Bus",
    "data": {
      "id": "window-school-bus",
      "cat": "decor",
      "name": "7:42 School Bus",
      "desc": "A quiet suburban street; once each morning view cycle a small yellow bus crosses and is gone.",
      "cost": {
        "lint": 340
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "schoolBus",
        "color": "#9db5c2",
        "color2": "#d6a83e"
      }
    },
    "looks_like": "A quiet suburban street; once each morning view cycle a small yellow bus crosses and is gone.",
    "why": "A tiny timed event makes the view feel inhabited without rewarding attendance.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "window-first-frost",
    "title": "First Frost Window",
    "data": {
      "id": "window-first-frost",
      "cat": "decor",
      "name": "First Frost Window",
      "desc": "Frost feathers the lower corners while the yard beyond stays green-brown and still.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "firstFrost",
        "color": "#b9cbd0",
        "color2": "#e9efeb"
      }
    },
    "looks_like": "Frost feathers the lower corners while the yard beyond stays green-brown and still.",
    "why": "A seasonal-feeling view distinct from full snow.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "window-golden-alley",
    "title": "Golden Hour Alley",
    "data": {
      "id": "window-golden-alley",
      "cat": "decor",
      "name": "Golden Hour Alley",
      "desc": "A narrow brick alley lit by low orange sun, with one long moving shadow.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "goldenAlley",
        "color": "#d59a63",
        "color2": "#735c52"
      }
    },
    "looks_like": "A narrow brick alley lit by low orange sun, with one long moving shadow.",
    "why": "Warm dramatic light gives the whole room a second personality.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "window-bird-feeder",
    "title": "Backyard Feeder Window",
    "data": {
      "id": "window-bird-feeder",
      "cat": "decor",
      "name": "Backyard Feeder Window",
      "desc": "A small feeder hangs near the glass; one or two generic birds visit and leave between Loads.",
      "cost": {
        "lint": 360
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "birdFeeder",
        "color": "#88a482",
        "color2": "#d6c29a"
      }
    },
    "looks_like": "A small feeder hangs near the glass; one or two generic birds visit and leave between Loads.",
    "why": "Small life outside the room adds calm motion without another indoor animal.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "window-windy-maple",
    "title": "Windy Maple Window",
    "data": {
      "id": "window-windy-maple",
      "cat": "decor",
      "name": "Windy Maple Window",
      "desc": "A maple branch sweeps in and out of frame; a few broad leaves tumble past.",
      "cost": {
        "lint": 330
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "windyMaple",
        "color": "#7d9a66",
        "color2": "#c9824f"
      }
    },
    "looks_like": "A maple branch sweeps in and out of frame; a few broad leaves tumble past.",
    "why": "Motion is legible and restrained, ideal for a fixed camera.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 7,
    "kind": "decor",
    "id": "window-porch-night",
    "title": "Porch Light at Night",
    "data": {
      "id": "window-porch-night",
      "cat": "decor",
      "name": "Porch Light at Night",
      "desc": "Dark yard, one warm porch light, occasional moth-sized silhouettes circling far outside.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "porchNight",
        "color": "#26354a",
        "color2": "#e6b768"
      }
    },
    "looks_like": "Dark yard, one warm porch light, occasional moth-sized silhouettes circling far outside.",
    "why": "A cozy night scene with no storm, city, or moon spectacle.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 8,
    "kind": "decor",
    "id": "window-cottonwood",
    "title": "Cottonwood Afternoon",
    "data": {
      "id": "window-cottonwood",
      "cat": "decor",
      "name": "Cottonwood Afternoon",
      "desc": "Soft white cottonwood fluff drifts sideways across a bright late-spring yard.",
      "cost": {
        "lint": 290
      },
      "start": false,
      "look": {
        "slot": "window",
        "variant": "cottonwood",
        "color": "#a8c7c0",
        "color2": "#f1ead6"
      }
    },
    "looks_like": "Soft white cottonwood fluff drifts sideways across a bright late-spring yard.",
    "why": "A nearly weightless moving view that reads instantly as a season.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "lamp-ceramic-mushroom",
    "title": "Ceramic Mushroom Lamp",
    "data": {
      "id": "lamp-ceramic-mushroom",
      "cat": "decor",
      "name": "Ceramic Mushroom Lamp",
      "desc": "A squat ceramic mushroom lamp with a rust-red cap and warm cream glow.",
      "cost": {
        "lint": 380
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "ceramicMushroom",
        "color": "#d06f57",
        "color2": "#f0d8b2"
      }
    },
    "looks_like": "A squat ceramic mushroom lamp with a rust-red cap and warm cream glow.",
    "why": "The silhouette is trendy, cozy and immediately legible.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "lamp-gooseneck",
    "title": "Task Lamp With the Heavy Base",
    "data": {
      "id": "lamp-gooseneck",
      "cat": "decor",
      "name": "Task Lamp With the Heavy Base",
      "desc": "A squat dark-green task lamp with a wide weighted base and short angled neck.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "heavyBaseTask",
        "color": "#4f655d",
        "color2": "#d9c88d"
      }
    },
    "looks_like": "A squat dark-green task lamp with a wide weighted base and short angled neck.",
    "why": "Industrial enough to contrast the soft room without feeling cold.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "lamp-woven-cane",
    "title": "Woven Cane Lamp",
    "data": {
      "id": "lamp-woven-cane",
      "cat": "decor",
      "name": "Woven Cane Lamp",
      "desc": "A small lamp with a cane cylinder shade that casts broad striped shadows.",
      "cost": {
        "lint": 420
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "wovenCane",
        "color": "#b98f63",
        "color2": "#ead8b9"
      }
    },
    "looks_like": "A small lamp with a cane cylinder shade that casts broad striped shadows.",
    "why": "The shade changes both object and light pattern, multiplying its value.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "lamp-geometric-glass",
    "title": "Accordion Porcelain Lamp",
    "data": {
      "id": "lamp-geometric-glass",
      "cat": "decor",
      "name": "Accordion Porcelain Lamp",
      "desc": "A cream porcelain lamp built from stacked accordion-like rings with a warm amber shade.",
      "cost": {
        "lint": 500
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "accordionPorcelain",
        "color": "#6f768b",
        "color2": "#d1a765"
      }
    },
    "looks_like": "A cream porcelain lamp built from stacked accordion-like rings with a warm amber shade.",
    "why": "A premium statement lamp without copying any branded stained-glass pattern.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "lamp-orange-rock",
    "title": "Warm Rock Lamp",
    "data": {
      "id": "lamp-orange-rock",
      "cat": "decor",
      "name": "Warm Rock Lamp",
      "desc": "An irregular amber-orange stone lamp on a tiny dark wood base.",
      "cost": {
        "lint": 340
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "warmRock",
        "color": "#c9825d",
        "color2": "#f2b86f"
      }
    },
    "looks_like": "An irregular amber-orange stone lamp on a tiny dark wood base.",
    "why": "One glowing lumpy mass gives night scenes a different material.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "lamp-punched-tin",
    "title": "Punched Tin Lamp",
    "data": {
      "id": "lamp-punched-tin",
      "cat": "decor",
      "name": "Punched Tin Lamp",
      "desc": "A small dark tin lantern perforated with simple circles and diamonds.",
      "cost": {
        "lint": 360
      },
      "start": false,
      "look": {
        "slot": "lamp",
        "variant": "punchedTin",
        "color": "#6d6256",
        "color2": "#e8c983"
      }
    },
    "looks_like": "A small dark tin lantern perforated with simple circles and diamonds.",
    "why": "It paints restrained dots of warm light on the nearby wall.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "plant-prayer",
    "title": "Prayer Plant",
    "data": {
      "id": "plant-prayer",
      "cat": "decor",
      "name": "Prayer Plant",
      "desc": "A low pot of striped oval leaves that angle upward in the evening.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "plant",
        "variant": "prayer",
        "color": "#557253",
        "color2": "#9f6f74"
      }
    },
    "looks_like": "A low pot of striped oval leaves that angle upward in the evening.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "plant-string-hearts",
    "title": "String of Hearts",
    "data": {
      "id": "plant-string-hearts",
      "cat": "decor",
      "name": "String of Hearts",
      "desc": "Long fine vines dotted with paired heart-shaped leaves spilling from a small pot.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "plant",
        "variant": "stringHearts",
        "color": "#6a8062",
        "color2": "#b99a79"
      }
    },
    "looks_like": "Long fine vines dotted with paired heart-shaped leaves spilling from a small pot.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "mug-pencil-cup",
    "title": "Mug That Became a Pencil Cup",
    "data": {
      "id": "mug-pencil-cup",
      "cat": "decor",
      "name": "Mug That Became a Pencil Cup",
      "desc": "A cream mug holding three pencils and one paintbrush; nobody drinks from it now.",
      "cost": {
        "lint": 110
      },
      "start": false,
      "look": {
        "slot": "mug",
        "variant": "pencilCup",
        "color": "#d9d0b4",
        "color2": "#657a85"
      }
    },
    "looks_like": "A cream mug holding three pencils and one paintbrush; nobody drinks from it now.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "mug-faded-camp",
    "title": "Faded Campfire Mug",
    "data": {
      "id": "mug-faded-camp",
      "cat": "decor",
      "name": "Faded Campfire Mug",
      "desc": "A blue enamel mug with a tiny cream campfire icon worn nearly away.",
      "cost": {
        "lint": 100
      },
      "start": false,
      "look": {
        "slot": "mug",
        "variant": "fadedCamp",
        "color": "#405f68",
        "color2": "#e7d7b8"
      }
    },
    "looks_like": "A blue enamel mug with a tiny cream campfire icon worn nearly away.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "poster-socks-of-midwest",
    "title": "Socks of the Upper Midwest",
    "data": {
      "id": "poster-socks-of-midwest",
      "cat": "decor",
      "name": "Socks of the Upper Midwest",
      "desc": "A serious field-guide poster showing six generic sock silhouettes with tiny fake Latin labels.",
      "cost": {
        "lint": 140
      },
      "start": false,
      "look": {
        "slot": "poster",
        "variant": "sockFieldGuide",
        "color": "#e7dfc5",
        "color2": "#536c69"
      }
    },
    "looks_like": "A serious field-guide poster showing six generic sock silhouettes with tiny fake Latin labels.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "poster-laundry-forecast",
    "title": "Laundry Forecast: Mostly Dry",
    "data": {
      "id": "poster-laundry-forecast",
      "cat": "decor",
      "name": "Laundry Forecast: Mostly Dry",
      "desc": "A cheerful weather-map poster with one sun, two clouds and a 98% chance of socks.",
      "cost": {
        "lint": 120
      },
      "start": false,
      "look": {
        "slot": "poster",
        "variant": "laundryForecast",
        "color": "#8db2be",
        "color2": "#f0df9e"
      }
    },
    "looks_like": "A cheerful weather-map poster with one sun, two clouds and a 98% chance of socks.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 7,
    "kind": "decor",
    "id": "poster-community-potluck",
    "title": "Community Potluck, Bring a Chair",
    "data": {
      "id": "poster-community-potluck",
      "cat": "decor",
      "name": "Community Potluck, Bring a Chair",
      "desc": "A hand-printed flyer with a folding chair icon and three crooked casserole rectangles.",
      "cost": {
        "lint": 100
      },
      "start": false,
      "look": {
        "slot": "poster",
        "variant": "potluck",
        "color": "#bd7b5b",
        "color2": "#f0dfbd"
      }
    },
    "looks_like": "A hand-printed flyer with a folding chair icon and three crooked casserole rectangles.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 8,
    "kind": "decor",
    "id": "clock-numberless",
    "title": "Clock With No Numbers",
    "data": {
      "id": "clock-numberless",
      "cat": "decor",
      "name": "Clock With No Numbers",
      "desc": "A matte cream clock with twelve tiny dots and dark blunt hands.",
      "cost": {
        "lint": 210
      },
      "start": false,
      "look": {
        "slot": "clock",
        "variant": "numberless",
        "color": "#d7cbb5",
        "color2": "#48565b"
      }
    },
    "looks_like": "A matte cream clock with twelve tiny dots and dark blunt hands.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 9,
    "kind": "decor",
    "id": "calendar-birds",
    "title": "Ordinary Birds Calendar",
    "data": {
      "id": "calendar-birds",
      "cat": "decor",
      "name": "Ordinary Birds Calendar",
      "desc": "A wall calendar devoted entirely to common backyard birds looking mildly busy.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "calendar",
        "variant": "ordinaryBirds",
        "color": "#d7e2d7",
        "color2": "#6f8065"
      }
    },
    "looks_like": "A wall calendar devoted entirely to common backyard birds looking mildly busy.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 10,
    "kind": "decor",
    "id": "shelf-wire-wall",
    "title": "White Wire Wall Shelf",
    "data": {
      "id": "shelf-wire-wall",
      "cat": "decor",
      "name": "White Wire Wall Shelf",
      "desc": "A simple white wire shelf with a shallow lip and two visible brackets.",
      "cost": {
        "lint": 330
      },
      "start": false,
      "look": {
        "slot": "shelf",
        "variant": "whiteWire",
        "color": "#e5e5df",
        "color2": "#7a8583"
      }
    },
    "looks_like": "A simple white wire shelf with a shallow lip and two visible brackets.",
    "why": "Adds another specific lived-in choice to an existing room slot.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "slot",
    "id": "slot-wall-hooks",
    "title": "Wall Hooks",
    "data": {
      "slot": "wallHook",
      "why": "They occupy an otherwise dead vertical strip near the door and let the room show clothing, bags and tools without blocking play."
    },
    "looks_like": null,
    "why": "They occupy an otherwise dead vertical strip near the door and let the room show clothing, bags and tools without blocking play.",
    "cost_to_build": "code-large",
    "confidence": 0.88
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "hook-canvas-apron",
    "title": "Canvas Apron",
    "data": {
      "id": "hook-canvas-apron",
      "cat": "decor",
      "name": "Canvas Apron",
      "desc": "A flour-dusted tan apron with two deep pockets.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "wallHook",
        "variant": "canvasApron",
        "color": "#b9a27d",
        "color2": "#5f6b61"
      }
    },
    "looks_like": "A flour-dusted tan apron with two deep pockets.",
    "why": "One of the first six wall hooks choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "hook-market-tote",
    "title": "Market Tote",
    "data": {
      "id": "hook-market-tote",
      "cat": "decor",
      "name": "Market Tote",
      "desc": "A soft cream tote with green handles and one folded corner.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "slot": "wallHook",
        "variant": "marketTote",
        "color": "#d7c89e",
        "color2": "#617b73"
      }
    },
    "looks_like": "A soft cream tote with green handles and one folded corner.",
    "why": "One of the first six wall hooks choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "hook-yellow-raincoat",
    "title": "Yellow Raincoat",
    "data": {
      "id": "hook-yellow-raincoat",
      "cat": "decor",
      "name": "Yellow Raincoat",
      "desc": "A short mustard raincoat hanging open, sleeves slightly uneven.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "wallHook",
        "variant": "yellowRaincoat",
        "color": "#d4a937",
        "color2": "#6d776a"
      }
    },
    "looks_like": "A short mustard raincoat hanging open, sleeves slightly uneven.",
    "why": "One of the first six wall hooks choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "hook-striped-smock",
    "title": "Striped Work Smock",
    "data": {
      "id": "hook-striped-smock",
      "cat": "decor",
      "name": "Striped Work Smock",
      "desc": "A blue-and-cream striped smock with one patched pocket.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "wallHook",
        "variant": "stripedSmock",
        "color": "#6e8095",
        "color2": "#e7ddc6"
      }
    },
    "looks_like": "A blue-and-cream striped smock with one patched pocket.",
    "why": "One of the first six wall hooks choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "hook-dog-leash",
    "title": "Dog Leash and Keys",
    "data": {
      "id": "hook-dog-leash",
      "cat": "decor",
      "name": "Dog Leash and Keys",
      "desc": "A red loop leash beside three generic metal keys.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "wallHook",
        "variant": "dogLeash",
        "color": "#9a5e4d",
        "color2": "#b8b7ad"
      }
    },
    "looks_like": "A red loop leash beside three generic metal keys.",
    "why": "One of the first six wall hooks choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "hook-empty-hanger",
    "title": "The Good Wooden Hanger",
    "data": {
      "id": "hook-empty-hanger",
      "cat": "decor",
      "name": "The Good Wooden Hanger",
      "desc": "One handsome wooden hanger holding absolutely nothing.",
      "cost": {
        "lint": 140
      },
      "start": false,
      "look": {
        "slot": "wallHook",
        "variant": "woodHanger",
        "color": "#b7895d",
        "color2": "#d6c6aa"
      }
    },
    "looks_like": "One handsome wooden hanger holding absolutely nothing.",
    "why": "One of the first six wall hooks choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "slot",
    "id": "slot-ceiling-light",
    "title": "Ceiling Fixture",
    "data": {
      "slot": "ceilingFixture",
      "why": "The room's key light is visible in frame, so changing the fixture can legitimately change both silhouette and light character."
    },
    "looks_like": null,
    "why": "The room's key light is visible in frame, so changing the fixture can legitimately change both silhouette and light character.",
    "cost_to_build": "code-large",
    "confidence": 0.86
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "ceiling-opal-flush",
    "title": "Opal Flush Mount",
    "data": {
      "id": "ceiling-opal-flush",
      "cat": "decor",
      "name": "Opal Flush Mount",
      "desc": "A low round opal-glass ceiling light with a brass rim.",
      "cost": {
        "lint": 250
      },
      "start": false,
      "look": {
        "slot": "ceilingFixture",
        "variant": "opalFlush",
        "color": "#eee8dc",
        "color2": "#b7a98e"
      }
    },
    "looks_like": "A low round opal-glass ceiling light with a brass rim.",
    "why": "One of the first six ceiling fixture choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "ceiling-green-pendant",
    "title": "Green Enamel Pendant",
    "data": {
      "id": "ceiling-green-pendant",
      "cat": "decor",
      "name": "Green Enamel Pendant",
      "desc": "A broad dark-green enamel shade with warm cream underside.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "slot": "ceilingFixture",
        "variant": "greenPendant",
        "color": "#526c60",
        "color2": "#e9ddb9"
      }
    },
    "looks_like": "A broad dark-green enamel shade with warm cream underside.",
    "why": "One of the first six ceiling fixture choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "ceiling-schoolhouse",
    "title": "Cream Glass Pendant",
    "data": {
      "id": "ceiling-schoolhouse",
      "cat": "decor",
      "name": "Cream Glass Pendant",
      "desc": "A ribbed cream glass pendant on a short dark cord.",
      "cost": {
        "lint": 320
      },
      "start": false,
      "look": {
        "slot": "ceilingFixture",
        "variant": "creamPendant",
        "color": "#e9e0ca",
        "color2": "#7b6954"
      }
    },
    "looks_like": "A ribbed cream glass pendant on a short dark cord.",
    "why": "One of the first six ceiling fixture choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "ceiling-rattan",
    "title": "Rattan Bell Shade",
    "data": {
      "id": "ceiling-rattan",
      "cat": "decor",
      "name": "Rattan Bell Shade",
      "desc": "A loose woven bell shade casting wide basket shadows.",
      "cost": {
        "lint": 340
      },
      "start": false,
      "look": {
        "slot": "ceilingFixture",
        "variant": "rattanBell",
        "color": "#b99065",
        "color2": "#eddbb9"
      }
    },
    "looks_like": "A loose woven bell shade casting wide basket shadows.",
    "why": "One of the first six ceiling fixture choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "ceiling-white-dome",
    "title": "Plain White Dome",
    "data": {
      "id": "ceiling-white-dome",
      "cat": "decor",
      "name": "Plain White Dome",
      "desc": "A simple white dome fixture with one tiny pull chain.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "slot": "ceilingFixture",
        "variant": "whiteDome",
        "color": "#e7e5df",
        "color2": "#c9c6bc"
      }
    },
    "looks_like": "A simple white dome fixture with one tiny pull chain.",
    "why": "One of the first six ceiling fixture choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "ceiling-two-bulb",
    "title": "Two-Bulb Bar",
    "data": {
      "id": "ceiling-two-bulb",
      "cat": "decor",
      "name": "Two-Bulb Bar",
      "desc": "A short black bar with two warm globe bulbs aimed apart.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "ceilingFixture",
        "variant": "twoBulbBar",
        "color": "#535b5c",
        "color2": "#e3c073"
      }
    },
    "looks_like": "A short black bar with two warm globe bulbs aimed apart.",
    "why": "One of the first six ceiling fixture choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "slot",
    "id": "slot-dryer-top",
    "title": "Dryer-Top Caddy",
    "data": {
      "slot": "dryerTop",
      "why": "The top of the largest object in the room is prime visual real estate and can make each dryer feel personally owned."
    },
    "looks_like": null,
    "why": "The top of the largest object in the room is prime visual real estate and can make each dryer feel personally owned.",
    "cost_to_build": "code-large",
    "confidence": 0.8400000000000001
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "dryer-top-powder-box",
    "title": "Powder Detergent Box",
    "data": {
      "id": "dryer-top-powder-box",
      "cat": "decor",
      "name": "Powder Detergent Box",
      "desc": "A squat generic cardboard detergent box with a tiny paper scoop.",
      "cost": {
        "lint": 100
      },
      "start": false,
      "look": {
        "slot": "dryerTop",
        "variant": "powderBox",
        "color": "#d8b65b",
        "color2": "#597c7a"
      }
    },
    "looks_like": "A squat generic cardboard detergent box with a tiny paper scoop.",
    "why": "One of the first six dryer-top caddy choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "dryer-top-glass-jar",
    "title": "Glass Clothespin Jar",
    "data": {
      "id": "dryer-top-glass-jar",
      "cat": "decor",
      "name": "Glass Clothespin Jar",
      "desc": "A clear jar full of wooden clothespins, one leaning against the lid.",
      "cost": {
        "lint": 130
      },
      "start": false,
      "look": {
        "slot": "dryerTop",
        "variant": "clothespinJar",
        "color": "#d9e1dc",
        "color2": "#b88e5e"
      }
    },
    "looks_like": "A clear jar full of wooden clothespins, one leaning against the lid.",
    "why": "One of the first six dryer-top caddy choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "dryer-top-folded-towels",
    "title": "Three Folded Towels",
    "data": {
      "id": "dryer-top-folded-towels",
      "cat": "decor",
      "name": "Three Folded Towels",
      "desc": "Three small towels stacked unevenly in rust, cream and sage.",
      "cost": {
        "lint": 160
      },
      "start": false,
      "look": {
        "slot": "dryerTop",
        "variant": "foldedTowels",
        "color": "#c7886a",
        "color2": "#d8c8ad"
      }
    },
    "looks_like": "Three small towels stacked unevenly in rust, cream and sage.",
    "why": "One of the first six dryer-top caddy choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "dryer-top-wicker-caddy",
    "title": "Wicker Supply Caddy",
    "data": {
      "id": "dryer-top-wicker-caddy",
      "cat": "decor",
      "name": "Wicker Supply Caddy",
      "desc": "A low wicker tray holding two unlabeled laundry bottles.",
      "cost": {
        "lint": 190
      },
      "start": false,
      "look": {
        "slot": "dryerTop",
        "variant": "supplyCaddy",
        "color": "#a97f55",
        "color2": "#e0cfaa"
      }
    },
    "looks_like": "A low wicker tray holding two unlabeled laundry bottles.",
    "why": "One of the first six dryer-top caddy choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "dryer-top-metal-tin",
    "title": "Blue Laundry Tin",
    "data": {
      "id": "dryer-top-metal-tin",
      "cat": "decor",
      "name": "Blue Laundry Tin",
      "desc": "A blue enamel tin labeled simply SOAP in cream letters.",
      "cost": {
        "lint": 150
      },
      "start": false,
      "look": {
        "slot": "dryerTop",
        "variant": "laundryTin",
        "color": "#57788a",
        "color2": "#e5d9bd"
      }
    },
    "looks_like": "A blue enamel tin labeled simply SOAP in cream letters.",
    "why": "One of the first six dryer-top caddy choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "dryer-top-nothing",
    "title": "Freshly Cleared Top",
    "data": {
      "id": "dryer-top-nothing",
      "cat": "decor",
      "name": "Freshly Cleared Top",
      "desc": "Nothing but the clean dryer top and one faint circular dust mark.",
      "cost": {
        "lint": 40
      },
      "start": false,
      "look": {
        "slot": "dryerTop",
        "variant": "clearedTop",
        "color": "#b0d6c4",
        "color2": "#b0d6c4"
      }
    },
    "looks_like": "Nothing but the clean dryer top and one faint circular dust mark.",
    "why": "One of the first six dryer-top caddy choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "slot",
    "id": "slot-stool",
    "title": "Stool",
    "data": {
      "slot": "stool",
      "why": "A stool fits beside the folding table, is visible from the fixed camera, and adds a strong furniture silhouette without touching gameplay."
    },
    "looks_like": null,
    "why": "A stool fits beside the folding table, is visible from the fixed camera, and adds a strong furniture silhouette without touching gameplay.",
    "cost_to_build": "code-large",
    "confidence": 0.8200000000000001
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "stool-round-wood",
    "title": "Round Wood Stool",
    "data": {
      "id": "stool-round-wood",
      "cat": "decor",
      "name": "Round Wood Stool",
      "desc": "A plain three-legged wooden stool worn smooth at the seat edge.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "stool",
        "variant": "roundWood",
        "color": "#9d704e",
        "color2": "#cfaa7d"
      }
    },
    "looks_like": "A plain three-legged wooden stool worn smooth at the seat edge.",
    "why": "One of the first six stool choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "stool-yellow-step",
    "title": "Yellow Step Stool",
    "data": {
      "id": "stool-yellow-step",
      "cat": "decor",
      "name": "Yellow Step Stool",
      "desc": "A squat mustard metal step stool with rubber feet.",
      "cost": {
        "lint": 200
      },
      "start": false,
      "look": {
        "slot": "stool",
        "variant": "yellowStep",
        "color": "#d2aa3f",
        "color2": "#6f725f"
      }
    },
    "looks_like": "A squat mustard metal step stool with rubber feet.",
    "why": "One of the first six stool choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "stool-woven-top",
    "title": "Woven-Top Stool",
    "data": {
      "id": "stool-woven-top",
      "cat": "decor",
      "name": "Woven-Top Stool",
      "desc": "A dark wood stool with a pale woven cord seat.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "stool",
        "variant": "wovenTop",
        "color": "#7f654f",
        "color2": "#c6aa79"
      }
    },
    "looks_like": "A dark wood stool with a pale woven cord seat.",
    "why": "One of the first six stool choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "stool-mint-folding",
    "title": "Mint Folding Stool",
    "data": {
      "id": "stool-mint-folding",
      "cat": "decor",
      "name": "Mint Folding Stool",
      "desc": "A little folding stool with mint frame and cream vinyl top.",
      "cost": {
        "lint": 230
      },
      "start": false,
      "look": {
        "slot": "stool",
        "variant": "mintFolding",
        "color": "#87aa98",
        "color2": "#d7d2c0"
      }
    },
    "looks_like": "A little folding stool with mint frame and cream vinyl top.",
    "why": "One of the first six stool choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "stool-red-shop",
    "title": "Red Shop Stool",
    "data": {
      "id": "stool-red-shop",
      "cat": "decor",
      "name": "Red Shop Stool",
      "desc": "A round red shop stool on three dark steel legs.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "stool",
        "variant": "redShop",
        "color": "#a85249",
        "color2": "#4f5552"
      }
    },
    "looks_like": "A round red shop stool on three dark steel legs.",
    "why": "One of the first six stool choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "stool-cork-cube",
    "title": "Cork Cube",
    "data": {
      "id": "stool-cork-cube",
      "cat": "decor",
      "name": "Cork Cube",
      "desc": "A solid cork cube with softened corners and one cup ring.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "stool",
        "variant": "corkCube",
        "color": "#b69765",
        "color2": "#d3bd8e"
      }
    },
    "looks_like": "A solid cork cube with softened corners and one cup ring.",
    "why": "One of the first six stool choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "slot",
    "id": "slot-ironing-board",
    "title": "Ironing Board",
    "data": {
      "slot": "ironingBoard",
      "why": "A folded or standing board is unmistakably laundry-specific, occupies a narrow wall footprint, and gives patterns a large readable surface."
    },
    "looks_like": null,
    "why": "A folded or standing board is unmistakably laundry-specific, occupies a narrow wall footprint, and gives patterns a large readable surface.",
    "cost_to_build": "code-large",
    "confidence": 0.8
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "board-blue-grid",
    "title": "Blue Grid Board",
    "data": {
      "id": "board-blue-grid",
      "cat": "decor",
      "name": "Blue Grid Board",
      "desc": "A standing board covered in a simple blue grid.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "slot": "ironingBoard",
        "variant": "blueGrid",
        "color": "#6f93a5",
        "color2": "#e7e0cd"
      }
    },
    "looks_like": "A standing board covered in a simple blue grid.",
    "why": "One of the first six ironing board choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "board-floral-cream",
    "title": "Cream Floral Board",
    "data": {
      "id": "board-floral-cream",
      "cat": "decor",
      "name": "Cream Floral Board",
      "desc": "A cream cover scattered with large sage leaves and rust flowers.",
      "cost": {
        "lint": 260
      },
      "start": false,
      "look": {
        "slot": "ironingBoard",
        "variant": "floralCream",
        "color": "#e5d8bd",
        "color2": "#8f9d73"
      }
    },
    "looks_like": "A cream cover scattered with large sage leaves and rust flowers.",
    "why": "One of the first six ironing board choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "board-charcoal",
    "title": "Charcoal Utility Board",
    "data": {
      "id": "board-charcoal",
      "cat": "decor",
      "name": "Charcoal Utility Board",
      "desc": "A dark charcoal cover on pale metal folding legs.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "slot": "ironingBoard",
        "variant": "charcoal",
        "color": "#555a58",
        "color2": "#bbb7a8"
      }
    },
    "looks_like": "A dark charcoal cover on pale metal folding legs.",
    "why": "One of the first six ironing board choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "board-yellow-stripe",
    "title": "Yellow Stripe Board",
    "data": {
      "id": "board-yellow-stripe",
      "cat": "decor",
      "name": "Yellow Stripe Board",
      "desc": "Wide mustard and cream lengthwise stripes.",
      "cost": {
        "lint": 230
      },
      "start": false,
      "look": {
        "slot": "ironingBoard",
        "variant": "yellowStripe",
        "color": "#d2b150",
        "color2": "#f0e1bd"
      }
    },
    "looks_like": "Wide mustard and cream lengthwise stripes.",
    "why": "One of the first six ironing board choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "board-wall-folded",
    "title": "Wall-Folded Board",
    "data": {
      "id": "board-wall-folded",
      "cat": "decor",
      "name": "Wall-Folded Board",
      "desc": "A narrow wooden-front cabinet hiding the board completely.",
      "cost": {
        "lint": 280
      },
      "start": false,
      "look": {
        "slot": "ironingBoard",
        "variant": "wallFolded",
        "color": "#d5c7af",
        "color2": "#7c6957"
      }
    },
    "looks_like": "A narrow wooden-front cabinet hiding the board completely.",
    "why": "One of the first six ironing board choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "board-tiny-check",
    "title": "Tiny Check Board",
    "data": {
      "id": "board-tiny-check",
      "cat": "decor",
      "name": "Tiny Check Board",
      "desc": "A soft sage-and-cream micro-check cover with one scorched corner.",
      "cost": {
        "lint": 250
      },
      "start": false,
      "look": {
        "slot": "ironingBoard",
        "variant": "tinyCheck",
        "color": "#78948c",
        "color2": "#e8dfc9"
      }
    },
    "looks_like": "A soft sage-and-cream micro-check cover with one scorched corner.",
    "why": "One of the first six ironing board choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "slot",
    "id": "slot-utility-sink",
    "title": "Utility Sink",
    "data": {
      "slot": "utilitySink",
      "why": "A deep sink is a believable laundry-room anchor with enough mass and material variation to justify a code slot, and it creates a new place for subtle reflections."
    },
    "looks_like": null,
    "why": "A deep sink is a believable laundry-room anchor with enough mass and material variation to justify a code slot, and it creates a new place for subtle reflections.",
    "cost_to_build": "code-large",
    "confidence": 0.78
  },
  {
    "lane": "D",
    "rank": 1,
    "kind": "decor",
    "id": "sink-white-porcelain",
    "title": "White Porcelain Sink",
    "data": {
      "id": "sink-white-porcelain",
      "cat": "decor",
      "name": "White Porcelain Sink",
      "desc": "A deep white porcelain basin with rounded front corners and steel taps.",
      "cost": {
        "lint": 420
      },
      "start": false,
      "look": {
        "slot": "utilitySink",
        "variant": "whitePorcelain",
        "color": "#e8e6df",
        "color2": "#8b8b83"
      }
    },
    "looks_like": "A deep white porcelain basin with rounded front corners and steel taps.",
    "why": "One of the first six utility sink choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 2,
    "kind": "decor",
    "id": "sink-grey-stone",
    "title": "Grey Stone Sink",
    "data": {
      "id": "sink-grey-stone",
      "cat": "decor",
      "name": "Grey Stone Sink",
      "desc": "A heavy grey composite basin with a pale wood shelf underneath.",
      "cost": {
        "lint": 500
      },
      "start": false,
      "look": {
        "slot": "utilitySink",
        "variant": "greyStone",
        "color": "#777b75",
        "color2": "#c2b9a5"
      }
    },
    "looks_like": "A heavy grey composite basin with a pale wood shelf underneath.",
    "why": "One of the first six utility sink choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 3,
    "kind": "decor",
    "id": "sink-mint-enamel",
    "title": "Mint Enamel Sink",
    "data": {
      "id": "sink-mint-enamel",
      "cat": "decor",
      "name": "Mint Enamel Sink",
      "desc": "A vintage mint enamel basin with a dark rolled rim.",
      "cost": {
        "lint": 460
      },
      "start": false,
      "look": {
        "slot": "utilitySink",
        "variant": "mintEnamel",
        "color": "#89aa9b",
        "color2": "#e3d8c4"
      }
    },
    "looks_like": "A vintage mint enamel basin with a dark rolled rim.",
    "why": "One of the first six utility sink choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 4,
    "kind": "decor",
    "id": "sink-stainless",
    "title": "Stainless Utility Sink",
    "data": {
      "id": "sink-stainless",
      "cat": "decor",
      "name": "Stainless Utility Sink",
      "desc": "A brushed steel basin on slender legs with one small dent.",
      "cost": {
        "lint": 480
      },
      "start": false,
      "look": {
        "slot": "utilitySink",
        "variant": "stainless",
        "color": "#bfc4c2",
        "color2": "#6f7472"
      }
    },
    "looks_like": "A brushed steel basin on slender legs with one small dent.",
    "why": "One of the first six utility sink choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 5,
    "kind": "decor",
    "id": "sink-cream-cabinet",
    "title": "Cream Cabinet Sink",
    "data": {
      "id": "sink-cream-cabinet",
      "cat": "decor",
      "name": "Cream Cabinet Sink",
      "desc": "A cream inset sink over a two-door wood cabinet.",
      "cost": {
        "lint": 520
      },
      "start": false,
      "look": {
        "slot": "utilitySink",
        "variant": "creamCabinet",
        "color": "#e0d5bf",
        "color2": "#8c755e"
      }
    },
    "looks_like": "A cream inset sink over a two-door wood cabinet.",
    "why": "One of the first six utility sink choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "D",
    "rank": 6,
    "kind": "decor",
    "id": "sink-blue-laundry",
    "title": "Blue Laundry Basin",
    "data": {
      "id": "sink-blue-laundry",
      "cat": "decor",
      "name": "Blue Laundry Basin",
      "desc": "A deep dusty-blue ceramic basin with a brass-toned faucet.",
      "cost": {
        "lint": 450
      },
      "start": false,
      "look": {
        "slot": "utilitySink",
        "variant": "blueLaundry",
        "color": "#6e8c9c",
        "color2": "#d7c7a8"
      }
    },
    "looks_like": "A deep dusty-blue ceramic basin with a brass-toned faucet.",
    "why": "One of the first six utility sink choices.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 1,
    "kind": "basket",
    "id": "basket-galvanized-tub",
    "title": "Galvanized Wash Basin",
    "data": {
      "id": "basket-galvanized-tub",
      "cat": "basket",
      "name": "Galvanized Wash Basin",
      "desc": "A low oval galvanized basin with rolled rim and two wire handles.",
      "cost": {
        "lint": 420
      },
      "start": false,
      "look": {
        "style": "galvanized",
        "color": "#b8bcb8",
        "color2": "#6f7775",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A low oval galvanized basin with rolled rim and two wire handles.",
    "why": "The broad metal mouth makes every landing feel substantial without changing the hitbox.",
    "cost_to_build": "art",
    "confidence": 0.855
  },
  {
    "lane": "E",
    "rank": 2,
    "kind": "basket",
    "id": "basket-collapsible-mesh",
    "title": "Collapsible Mesh Cube",
    "data": {
      "id": "basket-collapsible-mesh",
      "cat": "basket",
      "name": "Collapsible Mesh Cube",
      "desc": "A square pop-up mesh hamper with dark piping and slightly bowed sides.",
      "cost": {
        "lint": 380
      },
      "start": false,
      "look": {
        "style": "meshCube",
        "color": "#5c7f86",
        "color2": "#d9d4c6",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A square pop-up mesh hamper with dark piping and slightly bowed sides.",
    "why": "Its springy silhouette is familiar and fun to hit.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 3,
    "kind": "basket",
    "id": "basket-paper-grocery",
    "title": "Brown Paper Grocery Bag",
    "data": {
      "id": "basket-paper-grocery",
      "cat": "basket",
      "name": "Brown Paper Grocery Bag",
      "desc": "A tall brown paper bag opened wide, top edge crumpled into an uneven oval.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "style": "paperBag",
        "color": "#b98f62",
        "color2": "#7d624c",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A tall brown paper bag opened wide, top edge crumpled into an uneven oval.",
    "why": "Every successful throw gives a soft paper cough instead of a basket thunk.",
    "cost_to_build": "art",
    "confidence": 0.825
  },
  {
    "lane": "E",
    "rank": 4,
    "kind": "basket",
    "id": "basket-toy-wagon",
    "title": "Little Red Wagon",
    "data": {
      "id": "basket-toy-wagon",
      "cat": "basket",
      "name": "Little Red Wagon",
      "desc": "A shallow red metal wagon parked beside the table, handle laid flat.",
      "cost": {
        "lint": 650
      },
      "start": false,
      "look": {
        "style": "toyWagon",
        "color": "#a94f48",
        "color2": "#33383a",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A shallow red metal wagon parked beside the table, handle laid flat.",
    "why": "The target becomes a charming object without changing the shot geometry.",
    "cost_to_build": "art",
    "confidence": 0.81
  },
  {
    "lane": "E",
    "rank": 5,
    "kind": "basket",
    "id": "basket-fruit-crate",
    "title": "Wooden Fruit Crate",
    "data": {
      "id": "basket-fruit-crate",
      "cat": "basket",
      "name": "Wooden Fruit Crate",
      "desc": "A slatted wooden crate with low sides and a faded blank stencil panel.",
      "cost": {
        "lint": 480
      },
      "start": false,
      "look": {
        "style": "fruitCrate",
        "color": "#a8784f",
        "color2": "#d3b487",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A slatted wooden crate with low sides and a faded blank stencil panel.",
    "why": "The slats make catches visibly satisfying while keeping a standard rim.",
    "cost_to_build": "art",
    "confidence": 0.795
  },
  {
    "lane": "E",
    "rank": 6,
    "kind": "basket",
    "id": "basket-fabric-bucket",
    "title": "Quilted Fabric Bucket",
    "data": {
      "id": "basket-fabric-bucket",
      "cat": "basket",
      "name": "Quilted Fabric Bucket",
      "desc": "A soft cylindrical fabric bin quilted in oversized diamonds, with two loop handles.",
      "cost": {
        "lint": 440
      },
      "start": false,
      "look": {
        "style": "quiltBucket",
        "color": "#7e8b6c",
        "color2": "#d6b888",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A soft cylindrical fabric bin quilted in oversized diamonds, with two loop handles.",
    "why": "Soft walls give the target a cozy handmade feel.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "E",
    "rank": 7,
    "kind": "basket",
    "id": "basket-old-bathtub",
    "title": "Very Small Claw-Foot Tub",
    "data": {
      "id": "basket-old-bathtub",
      "cat": "basket",
      "name": "Very Small Claw-Foot Tub",
      "desc": "A miniature white enamel claw-foot tub deep enough for sock balls and no actual bath.",
      "cost": {
        "lint": 800
      },
      "start": false,
      "look": {
        "style": "clawTub",
        "color": "#e1ddd2",
        "color2": "#6f7778",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A miniature white enamel claw-foot tub deep enough for sock balls and no actual bath.",
    "why": "The absurdity is immediate, but the opening stays normal-sized.",
    "cost_to_build": "art",
    "confidence": 0.765
  },
  {
    "lane": "E",
    "rank": 8,
    "kind": "basket",
    "id": "basket-bread-basket",
    "title": "Sunday Bread Basket",
    "data": {
      "id": "basket-bread-basket",
      "cat": "basket",
      "name": "Sunday Bread Basket",
      "desc": "A low woven oval bread basket lined with a rumpled cream cloth.",
      "cost": {
        "lint": 360
      },
      "start": false,
      "look": {
        "style": "breadBasket",
        "color": "#a9855f",
        "color2": "#e5d5b5",
        "radius": 1.0,
        "rim": "standard"
      }
    },
    "looks_like": "A low woven oval bread basket lined with a rumpled cream cloth.",
    "why": "The liner gives successful shots a soft little nest.",
    "cost_to_build": "art",
    "confidence": 0.75
  },
  {
    "lane": "E",
    "rank": 1,
    "kind": "ball",
    "id": "ball-sock-rose",
    "title": "Sock Rose",
    "data": {
      "id": "ball-sock-rose",
      "cat": "ball",
      "name": "Sock Rose",
      "desc": "The pair coils into a flat spiral with the cuffs tucked underneath, making a soft rosette.",
      "cost": {
        "lint": 180
      },
      "start": false,
      "look": {
        "roll": "rose"
      }
    },
    "looks_like": "The pair coils into a flat spiral with the cuffs tucked underneath, making a soft rosette.",
    "why": "Looks handmade and photographs beautifully in flight.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 2,
    "kind": "ball",
    "id": "ball-cuffed-donut",
    "title": "Cuffed Donut",
    "data": {
      "id": "ball-cuffed-donut",
      "cat": "ball",
      "name": "Cuffed Donut",
      "desc": "Both socks roll into a ring and one cuff wraps the outside edge to hold the hole open.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "roll": "donut"
      }
    },
    "looks_like": "Both socks roll into a ring and one cuff wraps the outside edge to hold the hole open.",
    "why": "A very different silhouette from every existing ball.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 3,
    "kind": "ball",
    "id": "ball-pocket-fold",
    "title": "Pocket Fold",
    "data": {
      "id": "ball-pocket-fold",
      "cat": "ball",
      "name": "Pocket Fold",
      "desc": "One sock folds into a little rectangle and the second wraps around it like an envelope pocket.",
      "cost": {
        "lint": 300
      },
      "start": false,
      "look": {
        "roll": "pocket"
      }
    },
    "looks_like": "One sock folds into a little rectangle and the second wraps around it like an envelope pocket.",
    "why": "Neat, compact, and satisfying for organization-minded players.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 4,
    "kind": "ball",
    "id": "ball-figure-eight",
    "title": "Figure Eight",
    "data": {
      "id": "ball-figure-eight",
      "cat": "ball",
      "name": "Figure Eight",
      "desc": "The pair is crossed and tucked into two soft loops, leaving a visible waist in the middle.",
      "cost": {
        "lint": 360
      },
      "start": false,
      "look": {
        "roll": "figureEight"
      }
    },
    "looks_like": "The pair is crossed and tucked into two soft loops, leaving a visible waist in the middle.",
    "why": "Distinct in silhouette without affecting physics.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 5,
    "kind": "ball",
    "id": "ball-spiral-coil",
    "title": "Spiral Coil",
    "data": {
      "id": "ball-spiral-coil",
      "cat": "ball",
      "name": "Spiral Coil",
      "desc": "The pair rolls into a broad visible spiral from toe to cuff, with the outer edge left slightly loose.",
      "cost": {
        "lint": 420
      },
      "start": false,
      "look": {
        "roll": "spiralCoil"
      }
    },
    "looks_like": "The pair rolls into a broad visible spiral from toe to cuff, with the outer edge left slightly loose.",
    "why": "A familiar domestic shape that suits the game's deadpan warmth.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 6,
    "kind": "ball",
    "id": "ball-square-parcel",
    "title": "Square Parcel",
    "data": {
      "id": "ball-square-parcel",
      "cat": "ball",
      "name": "Square Parcel",
      "desc": "Both socks fold into a squat square bundle with two crossing cuff bands on top.",
      "cost": {
        "lint": 480
      },
      "start": false,
      "look": {
        "roll": "parcel"
      }
    },
    "looks_like": "Both socks fold into a squat square bundle with two crossing cuff bands on top.",
    "why": "The tidy little parcel looks deliberately over-organized.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 1,
    "kind": "trail",
    "id": "trail-running-stitch",
    "title": "Running Stitch",
    "data": {
      "id": "trail-running-stitch",
      "cat": "trail",
      "name": "Running Stitch",
      "desc": "A short dashed thread line appears behind the ball and unsews itself from tail to head.",
      "cost": {
        "lint": 190
      },
      "start": false,
      "look": {
        "trail": "runningStitch"
      }
    },
    "looks_like": "A short dashed thread line appears behind the ball and unsews itself from tail to head.",
    "why": "Laundry-native, restrained, and readable without sparkle.",
    "cost_to_build": "art",
    "confidence": 0.83
  },
  {
    "lane": "E",
    "rank": 2,
    "kind": "trail",
    "id": "trail-amber-ribbon",
    "title": "Amber Ribbon",
    "data": {
      "id": "trail-amber-ribbon",
      "cat": "trail",
      "name": "Amber Ribbon",
      "desc": "One narrow amber ribbon of light curls once behind the ball, then folds away.",
      "cost": {
        "lint": 240
      },
      "start": false,
      "look": {
        "trail": "amberRibbon"
      }
    },
    "looks_like": "One narrow amber ribbon of light curls once behind the ball, then folds away.",
    "why": "A single restrained ribbon gives motion without repeating the previous thread trail.",
    "cost_to_build": "art",
    "confidence": 0.83
  },
  {
    "lane": "E",
    "rank": 3,
    "kind": "trail",
    "id": "trail-petal-fall",
    "title": "Two Falling Petals",
    "data": {
      "id": "trail-petal-fall",
      "cat": "trail",
      "name": "Two Falling Petals",
      "desc": "Exactly two flat petals tumble behind each shot and fade before reaching the basket.",
      "cost": {
        "lint": 290
      },
      "start": false,
      "look": {
        "trail": "twoPetals"
      }
    },
    "looks_like": "Exactly two flat petals tumble behind each shot and fade before reaching the basket.",
    "why": "The strict two-petal limit keeps it quiet.",
    "cost_to_build": "art",
    "confidence": 0.83
  },
  {
    "lane": "E",
    "rank": 4,
    "kind": "trail",
    "id": "trail-tiny-footprints",
    "title": "Tiny Footprints",
    "data": {
      "id": "trail-tiny-footprints",
      "cat": "trail",
      "name": "Tiny Footprints",
      "desc": "Three miniature generic paw prints stamp through the air behind the ball and vanish.",
      "cost": {
        "lint": 340
      },
      "start": false,
      "look": {
        "trail": "tinyFootprints"
      }
    },
    "looks_like": "Three miniature generic paw prints stamp through the air behind the ball and vanish.",
    "why": "Funny at a glance and still visually sparse.",
    "cost_to_build": "art",
    "confidence": 0.83
  },
  {
    "lane": "E",
    "rank": 5,
    "kind": "trail",
    "id": "trail-soap-glint",
    "title": "Soap Glint",
    "data": {
      "id": "trail-soap-glint",
      "cat": "trail",
      "name": "Soap Glint",
      "desc": "A single pale iridescent glint travels along the ball's arc like light on a soap film.",
      "cost": {
        "lint": 390
      },
      "start": false,
      "look": {
        "trail": "soapGlint"
      }
    },
    "looks_like": "A single pale iridescent glint travels along the ball's arc like light on a soap film.",
    "why": "One moving highlight reads more expensive than a particle spray.",
    "cost_to_build": "art",
    "confidence": 0.83
  },
  {
    "lane": "E",
    "rank": 6,
    "kind": "trail",
    "id": "trail-paper-dashes",
    "title": "Paper Dashes",
    "data": {
      "id": "trail-paper-dashes",
      "cat": "trail",
      "name": "Paper Dashes",
      "desc": "Three tiny cream paper rectangles flutter in a short staggered line and disappear.",
      "cost": {
        "lint": 440
      },
      "start": false,
      "look": {
        "trail": "paperDashes"
      }
    },
    "looks_like": "Three tiny cream paper rectangles flutter in a short staggered line and disappear.",
    "why": "Looks like a receipt disintegrating in the safest possible way.",
    "cost_to_build": "art",
    "confidence": 0.83
  },
  {
    "lane": "E",
    "rank": 1,
    "kind": "radio",
    "id": "radio-diner-five-am",
    "title": "Diner Booth at 5 A.M.",
    "data": {
      "id": "radio-diner-five-am",
      "cat": "radio",
      "name": "Diner Booth at 5 A.M.",
      "desc": "Low upright bass, brushed drums, coffee-machine hiss, distant plate clink and one tired door chime.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "station": "diner5am"
      }
    },
    "looks_like": "Low upright bass, brushed drums, coffee-machine hiss, distant plate clink and one tired door chime.",
    "why": "Feels inhabited without sounding busy.",
    "cost_to_build": "art",
    "confidence": 0.86
  },
  {
    "lane": "E",
    "rank": 2,
    "kind": "radio",
    "id": "radio-museum-tuesday",
    "title": "Museum Lobby on a Rainy Tuesday",
    "data": {
      "id": "radio-museum-tuesday",
      "cat": "radio",
      "name": "Museum Lobby on a Rainy Tuesday",
      "desc": "Long soft piano notes, HVAC hush, shoe squeaks far away, rain muffled through stone walls.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "station": "museumTuesday"
      }
    },
    "looks_like": "Long soft piano notes, HVAC hush, shoe squeaks far away, rain muffled through stone walls.",
    "why": "A spacious quiet mood that leaves room for dryer sounds.",
    "cost_to_build": "art",
    "confidence": 0.84
  },
  {
    "lane": "E",
    "rank": 3,
    "kind": "radio",
    "id": "radio-greenhouse-hose",
    "title": "Greenhouse With the Hose On",
    "data": {
      "id": "radio-greenhouse-hose",
      "cat": "radio",
      "name": "Greenhouse With the Hose On",
      "desc": "Water on leaves, low pump hum, occasional greenhouse creak, almost no melody.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "station": "greenhouseHose"
      }
    },
    "looks_like": "Water on leaves, low pump hum, occasional greenhouse creak, almost no melody.",
    "why": "A natural sound bed distinct from plain rain.",
    "cost_to_build": "art",
    "confidence": 0.8200000000000001
  },
  {
    "lane": "E",
    "rank": 4,
    "kind": "radio",
    "id": "radio-night-drive-backseat",
    "title": "Back Seat on a Night Drive",
    "data": {
      "id": "radio-night-drive-backseat",
      "cat": "radio",
      "name": "Back Seat on a Night Drive",
      "desc": "Low road hum, turn-signal ticks now and then, soft instrumental synth pads, tires over one bridge joint.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "station": "nightDrive"
      }
    },
    "looks_like": "Low road hum, turn-signal ticks now and then, soft instrumental synth pads, tires over one bridge joint.",
    "why": "Nostalgic movement while the player stays physically still.",
    "cost_to_build": "art",
    "confidence": 0.8
  },
  {
    "lane": "E",
    "rank": 5,
    "kind": "radio",
    "id": "radio-hardware-morning",
    "title": "Hardware Store Before Opening",
    "data": {
      "id": "radio-hardware-morning",
      "cat": "radio",
      "name": "Hardware Store Before Opening",
      "desc": "Fluorescent hum, quiet acoustic guitar, distant metal shelf rattle and a key turning in the front door.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "station": "hardwareMorning"
      }
    },
    "looks_like": "Fluorescent hum, quiet acoustic guitar, distant metal shelf rattle and a key turning in the front door.",
    "why": "A strangely comforting place-specific morning.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "E",
    "rank": 6,
    "kind": "radio",
    "id": "radio-empty-pool",
    "title": "Empty Community Pool",
    "data": {
      "id": "radio-empty-pool",
      "cat": "radio",
      "name": "Empty Community Pool",
      "desc": "Distant filter pump, gulls, hollow room echo, occasional water lap and soft electric piano.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "station": "emptyPool"
      }
    },
    "looks_like": "Distant filter pump, gulls, hollow room echo, occasional water lap and soft electric piano.",
    "why": "Summer without crowd noise.",
    "cost_to_build": "art",
    "confidence": 0.76
  },
  {
    "lane": "E",
    "rank": 7,
    "kind": "radio",
    "id": "radio-dishwasher-next-door",
    "title": "Dishwasher in the Next Apartment",
    "data": {
      "id": "radio-dishwasher-next-door",
      "cat": "radio",
      "name": "Dishwasher in the Next Apartment",
      "desc": "Muffled dishwasher swish through a wall, soft bassy room tone, sparse vibraphone notes.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "station": "dishwasherNext"
      }
    },
    "looks_like": "Muffled dishwasher swish through a wall, soft bassy room tone, sparse vibraphone notes.",
    "why": "Domestic sound from just outside the room feels wonderfully specific.",
    "cost_to_build": "art",
    "confidence": 0.74
  },
  {
    "lane": "E",
    "rank": 8,
    "kind": "radio",
    "id": "radio-cabin-game-night",
    "title": "Cabin After Game Night",
    "data": {
      "id": "radio-cabin-game-night",
      "cat": "radio",
      "name": "Cabin After Game Night",
      "desc": "Fire crackle, wooden chair creak, one die rolling somewhere offscreen, slow nylon-string guitar.",
      "cost": {
        "lint": 220
      },
      "start": false,
      "look": {
        "station": "cabinGameNight"
      }
    },
    "looks_like": "Fire crackle, wooden chair creak, one die rolling somewhere offscreen, slow nylon-string guitar.",
    "why": "A place after people have left, which fits TUMBLE's quietness.",
    "cost_to_build": "art",
    "confidence": 0.72
  },
  {
    "lane": "G",
    "rank": 1,
    "kind": "paid",
    "id": "paid-base-price-299",
    "title": "Paid Once Means $2.99 Once",
    "data": {
      "price_usd": 2.99,
      "presentation": "Launch TUMBLE at $2.99 with no in-app purchases at all. The room contains no purchase object because the purchase happened at the store door.",
      "always_earnable": "Everything in the game is earned by playing; there is no paid completion category.",
      "review_risk": "Lowest review risk and the cleanest match for the game's premium promise."
    },
    "looks_like": null,
    "why": "Lowest review risk and the cleanest match for the game's premium promise.",
    "cost_to_build": "data",
    "confidence": 0.85
  },
  {
    "lane": "G",
    "rank": 2,
    "kind": "paid",
    "id": "paid-sound-cabinet",
    "title": "The Sound Cabinet",
    "data": {
      "price_usd": 3.99,
      "presentation": "If players later ask to support more, add one wooden cassette case on the shelf. Buying it opens a separate set of ten alternate radio recordings and leaves the case visibly open beside the radio.",
      "always_earnable": "All base stations, all gameplay, every coin, every hero sock and every room unlock remain earnable. The paid audio is additive and excluded from completion.",
      "review_risk": "A narrow authored add-on does not contaminate the coin economy or the Drawer."
    },
    "looks_like": null,
    "why": "A narrow authored add-on does not contaminate the coin economy or the Drawer.",
    "cost_to_build": "code-small",
    "confidence": 0.8
  },
  {
    "lane": "G",
    "rank": 3,
    "kind": "paid",
    "id": "paid-making-of-binder",
    "title": "The Making-Of Binder",
    "data": {
      "price_usd": 1.99,
      "presentation": "A clothbound binder appears beneath the shelf. Buying it lets the player flip through concept sketches, rejected sock names, room color studies and short developer notes inside the room.",
      "always_earnable": "All playable and decorative base-game content remains earnable. The binder itself is a bonus artifact, not part of room completion.",
      "review_risk": "It monetizes process rather than scarcity and gives supporters something specific to own."
    },
    "looks_like": null,
    "why": "It monetizes process rather than scarcity and gives supporters something specific to own.",
    "cost_to_build": "code-small",
    "confidence": 0.75
  },
  {
    "lane": "H",
    "rank": 1,
    "kind": "polish",
    "id": "polish-thumb-safe-offset",
    "title": "Thumb-Safe Sock Offset",
    "data": {
      "sees_hears_feels": "While dragging, the sock's visual center sits 22 screen pixels above the touch point, easing toward the finger only when released.",
      "why_premium": "The player sees the sock instead of covering the exact detail they are trying to compare.",
      "done_when": "On a 6-inch phone, a tester can identify cuff and heel details without moving the thumb away from the target."
    },
    "looks_like": null,
    "why": "The player sees the sock instead of covering the exact detail they are trying to compare.",
    "cost_to_build": "code-small",
    "confidence": 0.89
  },
  {
    "lane": "H",
    "rank": 2,
    "kind": "polish",
    "id": "polish-cloth-give",
    "title": "Cloth Gives Before It Lifts",
    "data": {
      "sees_hears_feels": "On touch-down the selected sock compresses about 2% for 45 ms, then rises; on release it relaxes before physics takes over.",
      "why_premium": "A tiny material response makes the core interaction feel touched rather than selected.",
      "done_when": "240-fps capture shows compression, lift and release as three clean beats with no rubbery wobble."
    },
    "looks_like": null,
    "why": "A tiny material response makes the core interaction feel touched rather than selected.",
    "cost_to_build": "code-small",
    "confidence": 0.88
  },
  {
    "lane": "H",
    "rank": 3,
    "kind": "polish",
    "id": "polish-pair-two-notes",
    "title": "Pair Confirmation Has Two Notes",
    "data": {
      "sees_hears_feels": "A correct pair gets one soft fabric brush plus two muted tuned wood notes a fifth apart; pitch shifts slightly by sock size, never by rarity.",
      "why_premium": "A consistent acoustic signature makes matching satisfying without arcade fanfare.",
      "done_when": "After ten minutes, testers recognize a successful pair with eyes closed and never confuse it with a coin sound."
    },
    "looks_like": null,
    "why": "A consistent acoustic signature makes matching satisfying without arcade fanfare.",
    "cost_to_build": "art",
    "confidence": 0.87
  },
  {
    "lane": "H",
    "rank": 4,
    "kind": "polish",
    "id": "polish-gasket-compression",
    "title": "Dryer Gasket Actually Compresses",
    "data": {
      "sees_hears_feels": "When the door closes, the dark rubber seal visibly flattens for a few frames before the latch catches; the glass settles by a millimeter.",
      "why_premium": "Heavy objects feel expensive when contact points behave correctly.",
      "done_when": "Slow-motion capture shows no clipping and the latch sound occurs only after visible seal contact."
    },
    "looks_like": null,
    "why": "Heavy objects feel expensive when contact points behave correctly.",
    "cost_to_build": "code-small",
    "confidence": 0.86
  },
  {
    "lane": "H",
    "rank": 5,
    "kind": "polish",
    "id": "polish-inside-out-seams",
    "title": "Inside-Out Means Real Seams",
    "data": {
      "sees_hears_feels": "Inside-out socks reveal a simplified seam ridge, slightly paler knit direction and one tiny cuff thread; flipping them makes those details disappear.",
      "why_premium": "The game's special state becomes material, not merely a texture flag.",
      "done_when": "At normal zoom, 90% of testers can tell inside-out from plain before reading any UI cue."
    },
    "looks_like": null,
    "why": "The game's special state becomes material, not merely a texture flag.",
    "cost_to_build": "art",
    "confidence": 0.85
  },
  {
    "lane": "H",
    "rank": 6,
    "kind": "polish",
    "id": "polish-rim-flex",
    "title": "Basket Rim Flexes Once",
    "data": {
      "sees_hears_feels": "A hard landing bends a soft/fabric basket rim inward 2–3%, wicker shifts less, metal not at all; each returns in under 180 ms.",
      "why_premium": "Micro-deformation sells material without full simulation.",
      "done_when": "No basket oscillates more than once and the collider never changes."
    },
    "looks_like": null,
    "why": "Micro-deformation sells material without full simulation.",
    "cost_to_build": "code-small",
    "confidence": 0.8400000000000001
  },
  {
    "lane": "H",
    "rank": 7,
    "kind": "polish",
    "id": "polish-miss-flop",
    "title": "Misses Get a Beautiful Flop",
    "data": {
      "sees_hears_feels": "A missed ball lands with one cloth flop, rolls according to surface material, and comes to rest without a red X, buzzer or screen shake.",
      "why_premium": "Confidence and restraint feel more premium than punishment graphics.",
      "done_when": "A missed shot produces zero overlays, zero particles and no audio louder than a made shot."
    },
    "looks_like": null,
    "why": "Confidence and restraint feel more premium than punishment graphics.",
    "cost_to_build": "code-small",
    "confidence": 0.8300000000000001
  },
  {
    "lane": "H",
    "rank": 8,
    "kind": "polish",
    "id": "polish-table-edge",
    "title": "The Table Has a Finished Edge",
    "data": {
      "sees_hears_feels": "The folding table gets a visible rounded lip, subtle underside shadow and thin edge highlight; socks crossing the edge occlude correctly before falling.",
      "why_premium": "The core play surface stops looking like a floating plane.",
      "done_when": "In side-by-side screenshots, every object touching the edge reads as in front, on top, or below it with no depth ambiguity."
    },
    "looks_like": null,
    "why": "The core play surface stops looking like a floating plane.",
    "cost_to_build": "art",
    "confidence": 0.8200000000000001
  },
  {
    "lane": "H",
    "rank": 9,
    "kind": "polish",
    "id": "polish-drum-load-audio",
    "title": "Drum Audio Knows Load Size",
    "data": {
      "sees_hears_feels": "Small Loads make sparse cloth thumps with long gaps; Mountain Loads produce denser uneven impacts while the motor itself stays the same volume.",
      "why_premium": "The machine sounds physically occupied instead of playing a loop.",
      "done_when": "Blind listeners identify Small versus Mountain at least 4/5 times without the mix becoming louder overall."
    },
    "looks_like": null,
    "why": "The machine sounds physically occupied instead of playing a loop.",
    "cost_to_build": "art",
    "confidence": 0.81
  },
  {
    "lane": "H",
    "rank": 10,
    "kind": "polish",
    "id": "polish-phone-speaker-master",
    "title": "Phone-Speaker Mastering Pass",
    "data": {
      "sees_hears_feels": "Every essential sound is remixed for phone speakers: coins retain attack, cloth stays audible, radio loses sub-bass, dryer hum never masks pair confirmation.",
      "why_premium": "Polish that survives the actual hardware matters more than studio-headphone beauty.",
      "done_when": "On three midrange Android phones at 35% volume, every core action is audible without clipping or harshness."
    },
    "looks_like": null,
    "why": "Polish that survives the actual hardware matters more than studio-headphone beauty.",
    "cost_to_build": "art",
    "confidence": 0.8
  },
  {
    "lane": "H",
    "rank": 11,
    "kind": "polish",
    "id": "polish-window-two-depths",
    "title": "Window Glass Has Two Depths",
    "data": {
      "sees_hears_feels": "The outside scene sits behind a faint glass layer carrying one soft room reflection and occasional condensation near edges, not on the scenery itself.",
      "why_premium": "Separating glass from view makes a cheap window feel architectural.",
      "done_when": "Reflection remains below 8% opacity in daylight and never obscures moving outside events."
    },
    "looks_like": null,
    "why": "Separating glass from view makes a cheap window feel architectural.",
    "cost_to_build": "code-small",
    "confidence": 0.79
  },
  {
    "lane": "H",
    "rank": 12,
    "kind": "polish",
    "id": "polish-cuff-rib-light",
    "title": "Lamp Light Catches Cuff Ribs",
    "data": {
      "sees_hears_feels": "Cuff ribbing gets a broad directional normal response so turning a sock under the lamp makes the ribs roll from light to shadow.",
      "why_premium": "A material cue the player sees hundreds of times gives cloth depth without extra geometry.",
      "done_when": "At 96-pixel Drawer size it does not shimmer; in-hand view shows direction when rotated."
    },
    "looks_like": null,
    "why": "A material cue the player sees hundreds of times gives cloth depth without extra geometry.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "H",
    "rank": 13,
    "kind": "polish",
    "id": "polish-hero-first-find",
    "title": "Hero Socks Get a First-Find Pause",
    "data": {
      "sees_hears_feels": "The first time a hero sock appears, picking it up holds it 0.35 seconds longer at the normal in-hand size and lets its emblem face the camera before control resumes.",
      "why_premium": "It acknowledges authored art without opening a popup or stopping the Load for text.",
      "done_when": "The pause occurs only once per hero sock and adds under half a second."
    },
    "looks_like": null,
    "why": "It acknowledges authored art without opening a popup or stopping the Load for text.",
    "cost_to_build": "code-small",
    "confidence": 0.77
  },
  {
    "lane": "H",
    "rank": 14,
    "kind": "polish",
    "id": "polish-purse-fill",
    "title": "Coin Purse Visibly Gains Weight",
    "data": {
      "sees_hears_feels": "As cents accumulate, the canvas purse bottom rounds slightly and its zipper gap reveals more mixed coins; spending money lets it relax again.",
      "why_premium": "Economy progress becomes room state instead of a HUD number.",
      "done_when": "Four fill stages are visually distinct from the fixed room camera without looking inflated."
    },
    "looks_like": null,
    "why": "Economy progress becomes room state instead of a HUD number.",
    "cost_to_build": "art",
    "confidence": 0.76
  },
  {
    "lane": "H",
    "rank": 15,
    "kind": "polish",
    "id": "polish-shelf-object-shadows",
    "title": "Shelf Objects Cast Tiny Honest Shadows",
    "data": {
      "sees_hears_feels": "Mugs, finds, postcards and jars use simplified baked/contact shadows matched to shelf direction; nothing hovers by two pixels.",
      "why_premium": "Small collectibles feel real only when they belong to the furniture.",
      "done_when": "Every shelf item has a contact shadow at rest and none shows a detached halo at camera distance."
    },
    "looks_like": null,
    "why": "Small collectibles feel real only when they belong to the furniture.",
    "cost_to_build": "art",
    "confidence": 0.75
  },
  {
    "lane": "H",
    "rank": 16,
    "kind": "polish",
    "id": "polish-load-end-breath",
    "title": "Load End Breathes Before Summary",
    "data": {
      "sees_hears_feels": "After the final ball settles, the room holds for 600 ms: dryer hum remains, basket stops moving, then summary UI arrives quietly.",
      "why_premium": "A deliberate beat lets the physical action finish before statistics take over.",
      "done_when": "No summary appears while a ball is still moving; total pause stays under 0.8 seconds."
    },
    "looks_like": null,
    "why": "A deliberate beat lets the physical action finish before statistics take over.",
    "cost_to_build": "code-small",
    "confidence": 0.74
  },
  {
    "lane": "H",
    "rank": 17,
    "kind": "polish",
    "id": "polish-odd-bin-weight",
    "title": "The Odd Bin Has Cloth Weight",
    "data": {
      "sees_hears_feels": "As unmatched socks accumulate, the bin's fabric sides bow outward in three discrete fill states and the top sock changes pose.",
      "why_premium": "Story progress becomes visible mass in the room.",
      "done_when": "Empty, half and crowded states are recognizable from the room camera and never clip the socks."
    },
    "looks_like": null,
    "why": "Story progress becomes visible mass in the room.",
    "cost_to_build": "art",
    "confidence": 0.73
  },
  {
    "lane": "H",
    "rank": 18,
    "kind": "polish",
    "id": "polish-ui-contrast-discipline",
    "title": "Text Never Sits on Busy Cloth",
    "data": {
      "sees_hears_feels": "Any label over 3D content gets either a small matte paper tab or a locally darkened backing, never glow, outline or drop-shadow soup.",
      "why_premium": "Typography looks designed because readability is solved structurally.",
      "done_when": "Automated screenshot check finds no primary label below WCAG-like 4.5:1 contrast against its immediate backing."
    },
    "looks_like": null,
    "why": "Typography looks designed because readability is solved structurally.",
    "cost_to_build": "code-small",
    "confidence": 0.72
  },
  {
    "lane": "H",
    "rank": 19,
    "kind": "polish",
    "id": "polish-store-screenshots-2",
    "title": "Five New Store Screenshots",
    "data": {
      "sees_hears_feels": "1: two near-identical socks held side by side, MATCH THE DETAILS. 2: inside-out seam close-up, FLIP WHAT'S WRONG. 3: purse with real coins and pocket finds, LAUNDRY KEEPS THINGS. 4: customized room at night with open Odd Bin, EVERY ROOM TELLS ON YOU. 5: Drawer page filled with strange hero socks, FIND THE ONES WITH STORIES.",
      "why_premium": "These sell observation, tactile detail, economy, room ownership and collectible voice without reusing the first screenshot set.",
      "done_when": "Each screenshot communicates one mechanic at store-card size with five words or fewer on-image."
    },
    "looks_like": null,
    "why": "These sell observation, tactile detail, economy, room ownership and collectible voice without reusing the first screenshot set.",
    "cost_to_build": "art",
    "confidence": 0.71
  },
  {
    "lane": "H",
    "rank": 20,
    "kind": "polish",
    "id": "polish-spill-performance-budget",
    "title": "No Frame Drops During the Spill",
    "data": {
      "sees_hears_feels": "The prettiest moment, the sock spill, is profiled and capped so shadows, coins and physics never create a launch-day hitch on the target midrange Android device.",
      "why_premium": "Stable motion reads as premium more reliably than another shader effect.",
      "done_when": "Mountain Load spill holds the target frame budget for 99% of frames on the chosen minimum-spec test phone."
    },
    "looks_like": null,
    "why": "Stable motion reads as premium more reliably than another shader effect.",
    "cost_to_build": "code-small",
    "confidence": 0.7
  },
  {
    "lane": "I",
    "rank": 1,
    "kind": "retention",
    "id": "retention-pin-next-time",
    "title": "Pin Something for Next Time",
    "data": {
      "return_change": "Before leaving, the player can tap one owned-but-not-yet-found hero sock silhouette or one unfinished pocket-find set and clip a tiny paper reminder to the cork board. It remains there on return; it does not alter odds.",
      "reason": "Tomorrow starts with a self-chosen unfinished thought rather than a game-created obligation."
    },
    "looks_like": null,
    "why": "Tomorrow starts with a self-chosen unfinished thought rather than a game-created obligation.",
    "cost_to_build": "code-small",
    "confidence": 0.855
  },
  {
    "lane": "I",
    "rank": 2,
    "kind": "retention",
    "id": "retention-odd-bin-notes",
    "title": "The Odd Bin Leaves Notes",
    "data": {
      "return_change": "After a Reunion or new story page, the next time the room is opened the Odd Bin may have one short handwritten line clipped to its rim, such as 'Everyone slept better.' Notes queue and never expire.",
      "reason": "Story characters acknowledge continuity without making absence itself a reward."
    },
    "looks_like": null,
    "why": "Story characters acknowledge continuity without making absence itself a reward.",
    "cost_to_build": "data",
    "confidence": 0.83
  },
  {
    "lane": "I",
    "rank": 3,
    "kind": "retention",
    "id": "retention-plant-lean",
    "title": "Plants Lean While You Are Gone",
    "data": {
      "return_change": "After several real hours closed, plant leaves lean a few degrees toward the window. During the first Load back they slowly return to their normal pose.",
      "reason": "The room visibly existed while the app was closed, but nothing was earned or lost."
    },
    "looks_like": null,
    "why": "The room visibly existed while the app was closed, but nothing was earned or lost.",
    "cost_to_build": "code-small",
    "confidence": 0.8049999999999999
  },
  {
    "lane": "I",
    "rank": 4,
    "kind": "retention",
    "id": "retention-door-flyer",
    "title": "A Flyer Slid Under the Door",
    "data": {
      "return_change": "On some returns after a day or more, a generic local flyer lies half under the door: soup supper, lost glove, community choir. Tap it and it gets recycled. It is not collectible and does not grant anything.",
      "reason": "A tiny piece of outside life makes reopening feel like entering a place, not checking a service."
    },
    "looks_like": null,
    "why": "A tiny piece of outside life makes reopening feel like entering a place, not checking a service.",
    "cost_to_build": "art",
    "confidence": 0.78
  },
  {
    "lane": "I",
    "rank": 5,
    "kind": "retention",
    "id": "retention-drawer-recent",
    "title": "The Drawer Puts Recent Finds on Top",
    "data": {
      "return_change": "The first Drawer row on return shows the last three hero socks actually discovered in play, labeled RECENTLY IN THE LAUNDRY. It is a view, not a reward or rarity boost.",
      "reason": "Players are reminded of their own collection story instead of being fed a daily prize."
    },
    "looks_like": null,
    "why": "Players are reminded of their own collection story instead of being fed a daily prize.",
    "cost_to_build": "code-small",
    "confidence": 0.755
  },
  {
    "lane": "I",
    "rank": 6,
    "kind": "retention",
    "id": "retention-chalk-count",
    "title": "The Dryer Keeps a Chalk Count",
    "data": {
      "return_change": "A tiny chalk mark on the side of the dryer records Loads completed since the last Reunion. When a Reunion happens, the marks are wiped and a new row begins.",
      "reason": "It turns ongoing play into visible narrative tension without promising when the mate will arrive."
    },
    "looks_like": null,
    "why": "It turns ongoing play into visible narrative tension without promising when the mate will arrive.",
    "cost_to_build": "art",
    "confidence": 0.73
  },
  {
    "lane": "I",
    "rank": 7,
    "kind": "retention",
    "id": "retention-outside-event",
    "title": "One Outside Event Per Calendar Day",
    "data": {
      "return_change": "Each date deterministically chooses one tiny window event from a pool: delivery van passes, neighbor waters a planter, kite crosses high above, squirrel raids the feeder. Events repeat if missed and are not collectible.",
      "reason": "The room can be genuinely different tomorrow without FOMO because there is nothing to claim."
    },
    "looks_like": null,
    "why": "The room can be genuinely different tomorrow without FOMO because there is nothing to claim.",
    "cost_to_build": "code-small",
    "confidence": 0.705
  },
  {
    "lane": "I",
    "rank": 8,
    "kind": "retention",
    "id": "retention-unfinished-choice",
    "title": "The Room Keeps Your Last Unfinished Choice",
    "data": {
      "return_change": "If the player closes the game while browsing a pack, dryer or decor item they cannot yet afford, that item's tiny catalog card remains propped beside the purse or lint jar next time.",
      "reason": "The game remembers desire the player already expressed instead of manufacturing a task."
    },
    "looks_like": null,
    "why": "The game remembers desire the player already expressed instead of manufacturing a task.",
    "cost_to_build": "code-small",
    "confidence": 0.6799999999999999
  },
  {
    "lane": "J",
    "rank": 1,
    "kind": "problem",
    "id": "problem-prelaunch-scope",
    "title": "The Pre-Launch Build Is Becoming a Sequel",
    "data": {
      "problem": "Part 4 adds 60 hero socks, eight dryers, dozens of room assets, new slots, a new economy, finds, monetization decisions and twenty polish tasks immediately before Google Play. The risk is not idea quality; it is regression surface.",
      "response": "Break the 'one more BIG build' assumption. Ship the economy fix, sock/model upgrade and highest-notice polish first; stage the rest into free updates if QA slips."
    },
    "looks_like": null,
    "why": "Part 4 adds 60 hero socks, eight dryers, dozens of room assets, new slots, a new economy, finds, monetization decisions and twenty polish tasks immediately before Google Play. The risk is not idea quality; it is regression surface.",
    "cost_to_build": "data",
    "confidence": 0.905
  },
  {
    "lane": "J",
    "rank": 2,
    "kind": "problem",
    "id": "problem-mountain-phone-budget",
    "title": "Mountain Loads May Be a Phone-Performance Trap",
    "data": {
      "problem": "Fifty pairs means 100 sock bodies plus decoys, physics, shadows and potentially coins/finds on a portrait phone. The brief defines content scale but not a minimum device performance budget.",
      "response": "Add a hard frame/memory target and allow visual LOD or reduced simultaneous physics while preserving the exact sock seed and gameplay."
    },
    "looks_like": null,
    "why": "Fifty pairs means 100 sock bodies plus decoys, physics, shadows and potentially coins/finds on a portrait phone. The brief defines content scale but not a minimum device performance budget.",
    "cost_to_build": "data",
    "confidence": 0.89
  },
  {
    "lane": "J",
    "rank": 3,
    "kind": "problem",
    "id": "problem-drawer-scale",
    "title": "The Drawer Is About to Need Search Architecture",
    "data": {
      "problem": "Four existing packs plus six more adds at least 103 authored socks including current hero/impossible socks. A 96-pixel thumbnail law does not solve how a one-thumb player finds, compares or revisits them.",
      "response": "Add large tap filters by pack, found/unfound and seasonal status, plus a recent row. No tiny text search box required."
    },
    "looks_like": null,
    "why": "Four existing packs plus six more adds at least 103 authored socks including current hero/impossible socks. A 96-pixel thumbnail law does not solve how a one-thumb player finds, compares or revisits them.",
    "cost_to_build": "data",
    "confidence": 0.875
  },
  {
    "lane": "J",
    "rank": 4,
    "kind": "problem",
    "id": "problem-seasonal-definition",
    "title": "Seasonal Socks Need a Non-FOMO Rule",
    "data": {
      "problem": "Lane A explicitly allows seasonal socks, but Part 2 forbids rewards for time served and Part 4 says seasons do not exist yet. 'Seasonal' could accidentally become 'unavailable eleven months.'",
      "response": "Seasonal should mean automatic room/catalog emphasis only. Once owned, the sock can appear year-round; no pack should become unobtainable because the calendar changed."
    },
    "looks_like": null,
    "why": "Lane A explicitly allows seasonal socks, but Part 2 forbids rewards for time served and Part 4 says seasons do not exist yet. 'Seasonal' could accidentally become 'unavailable eleven months.'",
    "cost_to_build": "data",
    "confidence": 0.8600000000000001
  },
  {
    "lane": "J",
    "rank": 5,
    "kind": "problem",
    "id": "problem-daily-version-lock",
    "title": "The Daily Needs Version-Locked Seeds",
    "data": {
      "problem": "A deterministic Daily can stop being the same puzzle after an update if generator family mappings, difficulty logic or decoy rules change. The brief freezes sock fields but does not specify Daily versioning.",
      "response": "Store generator_version with each Daily seed and keep legacy generation paths for archived Dailies."
    },
    "looks_like": null,
    "why": "A deterministic Daily can stop being the same puzzle after an update if generator family mappings, difficulty logic or decoy rules change. The brief freezes sock fields but does not specify Daily versioning.",
    "cost_to_build": "data",
    "confidence": 0.8450000000000001
  },
  {
    "lane": "J",
    "rank": 6,
    "kind": "problem",
    "id": "problem-radio-licensing",
    "title": "Radio Content Has a Licensing Escape Hatch Missing",
    "data": {
      "problem": "Part 3 allows a station to point at a real music file, but the brief does not state that every shipped recording must be owned, commissioned or licensed for commercial mobile distribution.",
      "response": "Write the rule now: every station ships from studio-owned, commissioned or explicitly licensed audio with offline rights; no streaming dependency."
    },
    "looks_like": null,
    "why": "Part 3 allows a station to point at a real music file, but the brief does not state that every shipped recording must be owned, commissioned or licensed for commercial mobile distribution.",
    "cost_to_build": "data",
    "confidence": 0.8300000000000001
  },
  {
    "lane": "J",
    "rank": 7,
    "kind": "problem",
    "id": "problem-comfort-accessibility",
    "title": "Comfort Unlocks Should Not Gate Accessibility",
    "data": {
      "problem": "The brief wants pocket finds and pegs that 'help a little,' but visual, motor and sensory accommodations should not require 50 Loads or a lucky find.",
      "response": "Any true accessibility setting must exist from first launch. Unlocks may expose themed shortcuts or Laundry Day conveniences, never basic readable text, remapping, contrast or audio separation."
    },
    "looks_like": null,
    "why": "The brief wants pocket finds and pegs that 'help a little,' but visual, motor and sensory accommodations should not require 50 Loads or a lucky find.",
    "cost_to_build": "data",
    "confidence": 0.8150000000000001
  },
  {
    "lane": "J",
    "rank": 8,
    "kind": "problem",
    "id": "problem-eyes-raise-difficulty",
    "title": "Difficulty Ceiling Tied to Eyes Pegs Is Backwards",
    "data": {
      "problem": "Several existing comfort pegs also raise the difficulty ceiling by one tier. A player can earn help and simultaneously make later content harder, even if the help was needed for accessibility.",
      "response": "Separate 'comfort enabled' from 'maximum unlocked difficulty.' Let difficulty unlock through play and remain manually selectable."
    },
    "looks_like": null,
    "why": "Several existing comfort pegs also raise the difficulty ceiling by one tier. A player can earn help and simultaneously make later content harder, even if the help was needed for accessibility.",
    "cost_to_build": "data",
    "confidence": 0.8
  },
  {
    "lane": "J",
    "rank": 9,
    "kind": "problem",
    "id": "problem-hero-seeding-frequency",
    "title": "Hero Pack Discovery Frequency Is Undefined",
    "data": {
      "problem": "Owning a pack seeds ten hero socks into Loads, but no rate is specified. With ten packs, either new purchases become nearly invisible or hero socks crowd out the procedural matching game.",
      "response": "Define a per-Load hero budget and a temporary 'new pack discovery' weighting that guarantees discovery without increasing total hero density."
    },
    "looks_like": null,
    "why": "Owning a pack seeds ten hero socks into Loads, but no rate is specified. With ten packs, either new purchases become nearly invisible or hero socks crowd out the procedural matching game.",
    "cost_to_build": "data",
    "confidence": 0.785
  },
  {
    "lane": "J",
    "rank": 10,
    "kind": "problem",
    "id": "problem-slot-occlusion-test",
    "title": "New Room Slots Need a Camera Occlusion Test",
    "data": {
      "problem": "Six extra visible slots can technically satisfy 'everything is visible' while still hiding one another, the dryer, basket arc or important table edges from the fixed camera.",
      "response": "Every slot needs a camera-safe bounding box and a screenshot test against every dryer and basket style before art production."
    },
    "looks_like": null,
    "why": "Six extra visible slots can technically satisfy 'everything is visible' while still hiding one another, the dryer, basket arc or important table edges from the fixed camera.",
    "cost_to_build": "data",
    "confidence": 0.77
  },
  {
    "lane": "J",
    "rank": 11,
    "kind": "problem",
    "id": "problem-find-duplicate-rules",
    "title": "Pocket Finds Need Duplicate Rules",
    "data": {
      "problem": "The brief gives rarity and a 'once' class but does not say whether ordinary finds can repeat, whether duplicates are discarded, or whether repeats can become currency.",
      "response": "I would make named finds unique collection entries. After discovery, the same object can reappear only as a non-collecting cameo; it never converts to money or Lint."
    },
    "looks_like": null,
    "why": "The brief gives rarity and a 'once' class but does not say whether ordinary finds can repeat, whether duplicates are discarded, or whether repeats can become currency.",
    "cost_to_build": "data",
    "confidence": 0.7550000000000001
  },
  {
    "lane": "J",
    "rank": 12,
    "kind": "problem",
    "id": "problem-save-migration-contract",
    "title": "The Game Needs a Save-Migration Contract Before Economy Surgery",
    "data": {
      "problem": "Changing Quarters into dollars/cents, adding finds and adding many catalog entries touches persistent progression immediately before release. The brief does not define how existing web-test saves migrate.",
      "response": "Version the save now, write deterministic conversions for Quarters and unlock IDs, and keep a one-click local backup before the first migrated launch."
    },
    "looks_like": null,
    "why": "Changing Quarters into dollars/cents, adding finds and adding many catalog entries touches persistent progression immediately before release. The brief does not define how existing web-test saves migrate.",
    "cost_to_build": "data",
    "confidence": 0.74
  }
]
```