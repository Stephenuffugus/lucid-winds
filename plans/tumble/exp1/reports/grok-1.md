# TUMBLE Ideas — Grok

Build notes for the big pre-Play update. Ranked best-first in every lane. Quality over count. Everything is written so it can be pasted or handed to art/code with almost no translation.

---

## Lane F. The Economy (coins + pocket finds)

### 1. Diagnosis (one paragraph)

Quarters feel bad because they are gated behind two rare, high-skill outcomes (Clean Load and Spotless Load) that a relaxed adult playing three Regular Loads a day almost never hits. The design target of “about 3 a day” assumes near-perfect play; real play produces 0–1, often 0. Everything expensive (dryers, hero packs) is priced only in Quarters, so the player stares at a locked dryer for weeks while Lint piles up and feels useless. The emotional contract of a cozy paid game is “I play, the room gets nicer.” Right now the nicest things are locked behind a perfection tax. Real pocket change and pocket finds restore the laundry fantasy: you dig, you find, you keep, and care still pays more than grinding.

### 2. The coins — eight moments the player sees and hears

All coins are physical objects that drop, rattle, or gleam. A miss never removes a coin the player already found. Care (Clean, Spotless, every flip) multiplies chance or value; time served alone does not.

1. **Lint-trap slide** (end of every Load)  
   The trap pulls out with a soft scrape. A grey felt of lint sits on top; one bright coin rests on the felt.  
   Coins: 60 % penny, 25 % nickel, 10 % dime, 5 % quarter.  
   Clean Load: +1 extra coin of any kind. Spotless: the extra is at least a dime.  
   Regular Load expected: ~9–12 ¢. Heavy/Mountain scale by pair count.

2. **Sock flip chime** (first time an inside-out sock is flipped right-side-out)  
   A tiny metallic ping as the sock turns. A coin tumbles out of the cuff onto the table.  
   70 % penny, 20 % nickel, 8 % dime, 2 % quarter.  
   Only once per sock per Load. Flipping every inside-out sock in a Load guarantees at least one extra coin.

3. **Drum rattle** (dryer door opens)  
   Socks tumble; one or two coins bounce out with them and spin on the table.  
   Always 1–2 coins. Bias toward pennies on Small, more nickels/dimes on Heavy+.  
   Clean previous Load raises the chance of a quarter by 15 %.

4. **Under-the-rug sweep** (once per real-world day, first Load after midnight)  
   Player can tilt the rug; a coin or two glitter underneath. Soft scrape sound.  
   Fixed: 1 nickel or dime (50/50). Never a quarter. Feels like a quiet gift.

5. **Ball landing clink** (ball lands cleanly in basket)  
   Soft wicker/plastic thud + occasional coin clink (15 % chance).  
   Coin drops into the basket and is collected at Load end.  
   Only pennies and nickels. Clean Load raises chance to 25 %.

6. **Pocket-find cascade** (when a pocket find drops from a sock)  
   The find falls; a coin often falls with it (40 % chance).  
   Same distribution as lint trap. Ties the two systems together.

7. **Odd-Bin thank-you** (on every Reunion)  
   After the mate is found, a single quarter (or rare dime) rolls out of the Odd Bin with a soft chime.  
   Always at least a dime. Makes Reunions feel valuable beyond story.

8. **End-of-day jar settle** (when the player closes the app after ≥1 Load)  
   The coin jar on the shelf gently rattles and one extra penny appears if the day’s total was under 15 ¢.  
   Safety net so a quiet day is never empty.

### 3. How the money is counted — pick (b)

**Coin jar + auto-roll into Quarters.**  
Pennies, nickels, dimes and quarters drop into a visible glass jar on the display shelf. Every 25 ¢ the jar automatically rolls itself into one Quarter that slides into the Quarter pocket on the shelf. The big machines and hero packs still cost Quarters exactly as a laundromat does. Lint stays the soft currency for the room (rugs, plants, mugs, radio, trails, ball styles). Change never buys room decor; Lint never buys dryers or packs. This keeps the classic “quarters for the machine” feeling while making small finds satisfying every Load.

### 4. The arithmetic (relaxed player = 3 Regular Loads/day)

Assumptions after the new system:  
- Average Regular Load ≈ 18–22 ¢ (lint trap + flips + drum + occasional ball clink).  
- Clean Load ≈ +12 ¢ extra. Spotless ≈ +18 ¢ extra.  
- Realistic relaxed play: ~1 Clean every 4–5 Loads, almost never Spotless.  
→ ~55–65 ¢ per day → ~2.2–2.6 Quarters/day.

- First dryer (Avocado, 8 Q) ≈ 3–4 days.  
- First hero pack (10 Q) ≈ 4–5 days.  
- All five dryers (55 Q) ≈ 22–25 days.  
- All four packs (40 Q) ≈ 16–18 days.  
- Everything Quarters-priced (95 Q) ≈ 38–45 days of relaxed play.

Ten Loads in one sitting: ~1.80–2.20 $ → 7–9 Quarters. Feels generous, not grindy.  
One Load a week: still earns coins; the under-rug and end-of-day safety nets keep the jar moving. Nobody is slowed to sell them something.

### 5. Thirty pocket finds

Format matches the brief. `help_kind`: keepsake / comfort / would_not_ship.

**Pure keepsakes (no mechanical help)**

1. Half a Chapstick — “Survived the wash. Again.” common. Stubby white tube, cap missing, one dent. Drops from knee sock on first right-side-out flip. Shown in glass jar on shelf. set: coat-pocket-of-a-tall-man.  
2. Soft Receipt — “The ink left first.” common. Thin grey rectangle, edges furry. Falls from any crew sock when balled. Cork-board. set: coat-pocket-of-a-tall-man.  
3. Guitar Pick — “Still has a little spring.” uncommon. Small triangle, one corner chewed. From ankle sock cuff. Jar. set: gig-bag.  
4. Ticket Stub — “Seat 14, row whatever.” common. Faded rectangle with a punched hole. From dress sock. Cork-board. set: night-out.  
5. Bobby Pin — “Has opinions about hair.” common. Thin metal U, slightly bent. From baby or novelty sock. Windowsill dish. set: bathroom-drawer.  
6. Marble — “Rolled through three houses.” uncommon. Clear glass with a blue swirl. From any sock when shaken. Jar. set: childhood-pocket.  
7. Key to Nothing — “Opens a door that moved.” rare. Small brass key, teeth worn smooth. From heavy Load only. Cork-board. set: lost-keys.  
8. Paper Clip Chain — “Three clips, one ambition.” common. Tiny linked chain. From office-style sock. Shelf. set: desk-drawer.  
9. Safety Pin — “Closed, for once.” common. Silver oval, closed. From any flip. Windowsill. set: sewing-kit.  
10. Lint-Covered Penny — “Already counted once.” common. Dull copper with a grey halo. Always with a real penny. Jar. (keepsake version of a coin)

**Comforts I would ship** (tiny kindnesses, never advantage)

11. Warm Hands Button — “Still remembers a pocket.” uncommon. Round wooden button, slightly warm to the eye. From any sock after 50 Loads. Shown on clothesline peg board. help: the held sock is 8 % larger for 30 seconds after pickup (stacking with Warm Hands peg is fine; still only comfort).  
12. Soft Eraser Nub — “Has forgiven many mistakes.” uncommon. Pink rectangle, rounded edges. From school-ish sock. Jar. help: one free “peek at heel/toe” per Load without the Second Look peg.  
13. Tiny Clothes Pin — “Clipped to nothing, on purpose.” rare. Miniature wooden pin. From Mountain Load. Shelf. help: the next ball you form stays formed if you drop it (one use).  
14. Dryer Sheet Corner — “The good corner.” uncommon. Torn white triangle that still smells faintly clean. From lint trap on Clean Load. Jar. help: reduces lint fog density by a hair for the rest of the Load (visual comfort only).  
15. Smooth River Stone — “Went through the wash by accident and liked it.” rare. Grey oval, water-worn. From any sock after 100 Loads. Windowsill. help: the first miss of a Load makes a softer sound and the ball bounces less wildly (comfort, not accuracy).  
16. Thimble — “Has protected more thumbs than it will admit.” uncommon. Metal cup, dented. From sewing-adjacent sock. Shelf. help: when you pick up a decoy, it gives a single soft “not this one” haptic (Eyes-tier comfort).  
17. Wooden Spool — “Empty, and proud of it.” rare. Tiny empty spool. From Heavy+. Shelf. help: the dotted aim arc (Good Toss peg) is 10 % longer for one Load.  
18. Pressed Four-Leaf Clover — “Found in a different pocket.” once. Flat green silhouette. From the 200th Load only. Framed on wall (new small frame variant). help: next Load starts with one free Static Cling charge in Rush (or a soft glow on the true twin in Laundry Day).

**Would-not-ship helps (and why)**

19. Magnet Disc — “Sticks to everything except the point.” — would pull true twins closer automatically → advantage.  
20. Magnifying Loupe — “Makes every stitch an event.” — would raise effective Eyes tier permanently → advantage.  
21. Extra Basket Rim Clip — “Widens what it touches.” — direct accuracy help → advantage.  
22. Streak Saver Charm — “Remembers the last good throw.” — protects Rush streak → advantage.  
23. Auto-Flip Tab — “Turns itself right-side-out.” — removes a core action → advantage.  
24. Perfect Roll Ribbon — “Ties the ball for you.” — removes skill from ball formation → advantage.  
25. Quiet Mode Coin — “Mutes the dryer for one Load.” — pure preference, but feels like a paid skip; keep as free setting instead.  
26. Double Lint Coupon — “The lint feels generous today.” — inflates soft currency; breaks the “care pays” rule.  
27. Portal Ticket Stub — “Valid only on the other side.” — would force story progression → breaks free discovery.  
28. Odd-Bin Whisper — “Tells you which sock is waiting.” — direct reunion help → advantage.  
29. Infinite Chapstick — “Never runs out, never helps.” — joke item that does nothing; still feels like filler.  
30. The Other Sock — “Was in the pocket the whole time.” — would complete a pair instantly → breaks the core loop.

**First-day vs hundredth-Load feel**  
Day-one finds: Half a Chapstick, Soft Receipt, Bobby Pin, Safety Pin, Lint-Covered Penny, Paper Clip Chain.  
Hundredth-Load finds: Smooth River Stone, Pressed Four-Leaf Clover, Key to Nothing, Wooden Spool, Tiny Clothes Pin. The late finds are quieter, more specific, and carry a small comfort that acknowledges the time spent without ever becoming required.

### 6. Sets

Yes. Six visible sets, each with a small physical reward when complete:

- coat-pocket-of-a-tall-man (Chapstick + Receipt + one more common) → a tiny folded map appears on the shelf.  
- gig-bag (Guitar Pick + Ticket Stub + one more) → a miniature amp silhouette on the cork board.  
- bathroom-drawer (Bobby Pin + Safety Pin + Thimble) → a small dish of pins on the windowsill.  
- childhood-pocket (Marble + Soft Eraser + one more) → a single glass marble that rolls slowly when the room is idle.  
- lost-keys (Key to Nothing + one rare) → the key hangs from a peg on the clothesline.  
- sewing-kit (Spool + Thimble + Clothes Pin) → a tiny pincushion appears on the folding table edge.

Finishing a set is purely visual + one soft sound. No stats, no power.

### 7. Rebalanced price list (only the Quarters items)

Keep Lint prices exactly as they are.  
Dryers: Avocado 6 Q (was 8), Industrial 9 Q (was 12), Clothesline 12 Q (was 15), Portal 16 Q (was 20).  
Hero packs: 8 Q each (was 10).  
Total Quarters needed drops from 95 to ~70. Feels attainable in a month of relaxed play instead of six weeks.

### 8. Four more Lint sinks (once the room is full)

1. **Seasonal Garland Swap** — 180 Lint. Changes the current garland to a subtle seasonal variant (spring blossom, summer citrus, autumn leaf, winter frost) that cycles with real calendar if the player wants.  
2. **Tablecloth for the Folding Table** — 220 Lint. Soft linen rectangle that drapes the table; four colorways. New small art.  
3. **Sock Drawer Organizer** — 300 Lint. A visible wooden tray that appears under the shelf; completed hero packs sit in neat rows instead of a pile. Pure pride.  
4. **Radio Dial Glow** — 150 Lint. The radio face glows softly in the current station’s color. Tiny, expensive-feeling light.

### 9. Four empty Clothesline pegs

1. **Quiet Hands** — Earn: finish 10 Loads with zero misses (Clean). Comfort: the ball you are forming stays slightly larger and easier to see while you roll it.  
2. **Night Owl** — Earn: finish 5 Loads after 10 pm. Comfort: the room lamp can be dimmed one extra step; warmer pool of light on the table.  
3. **Full Flip** — Earn: flip 100 inside-out socks. Comfort: the first inside-out sock of every Load starts already half-turned (still requires the final flip).  
4. **Long Memory** — Earn: 25 Reunions. Comfort: odd socks whose mates are in the Bin give a single soft pulse every 20 seconds so you never forget they are waiting.

All four are pure comfort / Eyes-adjacent. None change difficulty or scoring.

---

## Lane A. Six new hero sock packs (60 socks)

Ranked by expected demand. One free pack marked.

### 1. Plant Parent (ship free)  
Blurb: “Socks that have been watered too much, too little, or exactly right once.”  
For: every adult who has killed a plant and still loves them.

1. The Overwatered One — crew, common — “It was fine until you helped.” Design: body #dfe8d2, accents leaf #4f8a4a pot #c46a3c drip #6fb6d8, solid, contrast rib, heelToe 1, emblem leg: terracotta pot (rounded box) + three drooping leaves + two blue raindrops.  
2. The One That Liked the Dark — ankle, common — “Grew sideways toward the only lamp.” body #2f3a2e, accents pale shoot #a8c99a, solid, plain rib, heelToe 0, emblem ankle: thin pale shoot leaning.  
3. Window-Sill Geranium — crew, common — “Has strong opinions about drafts.” body #f4e8d8, accents pink bloom #e07a8a green #5a8f4a, polka, twin stripe, heelToe 1, emblem top-of-foot: simple five-petal flower.  
4. The Succulent That Multiplied — baby, uncommon — “There are now seven of it.” body #c5d4a8, accents rosette #7a9e5a, solid, scalloped, heelToe 0, emblem leg: tight rosette of thick leaves.  
5. Hanging Pothos — knee, common — “Will reach the floor eventually.” body #e8f0d8, accents trailing leaf #4a7a3a, motifScatter leaf, wide band, heelToe 1, emblem leg: three trailing heart-leaves.  
6. The Fern That Demanded a Mister — dress, uncommon — “Prefers to be spoken to softly.” body #d4e8c8, accents frond #3a6a3a, fairIsle, contrast rib, heelToe 2, emblem leg: single arching frond.  
7. Cactus With Opinions — novelty, rare — “Does not want a hug.” body #d8e0c0, accents spine #8a7a5a flower #e8a0b0, solid, plain rib, heelToe 0, emblem leg: barrel cactus + one pink bloom.  
8. The Basil That Went to Seed — crew, common — “You blinked.” body #e0f0c8, accents seed head #9a8a4a leaf #5a8a3a, stripe, twin stripe, heelToe 1, emblem ankle: small seed spike.  
9. Monstera Leaf Print — knee, uncommon — “The hole is intentional.” body #f0e8d0, accents leaf #2a5a2a, solid, triple stripe, heelToe 1, emblem leg: large split leaf (two rounded boxes + cutout).  
10. The One You Forgot in the Car — slipper, rare (odd) — “It is still in there, somehow.” body #c8b8a0, accents dry leaf #8a6a3a, solid, plain rib, heelToe 0, emblem top-of-foot: single curled brown leaf. Seasonal: late summer.

### 2. Tiny Office  
Blurb: “Socks that have sat through one more meeting than they planned.”  
For: anyone who works from home or remembers fluorescent light.

1. The Meeting That Could Have Been an Email — crew, common — “It was not.” body #e8e4d8, accents red circle #c04040, solid, contrast rib, heelToe 1, emblem leg: simple calendar X.  
2. Sticky-Note Yellow — ankle, common — “Has a list on it somewhere.” body #f4e8a0, accents pen line #3a3a3a, solid, plain rib, heelToe 0, emblem top-of-foot: three horizontal lines.  
3. The Ergonomic One — knee, uncommon — “Supports nothing.” body #d0d8e0, accents mesh #6a7a8a, chevron, wide band, heelToe 1, emblem leg: simple mesh pattern.  
4. Coffee Ring — crew, common — “Evidence of a better morning.” body #f0e8d8, accents ring #8a5a3a, solid, twin stripe, heelToe 0, emblem ankle: single brown circle.  
5. The Badge Reel — novelty, rare — “Still retracts, slowly.” body #e0e0e8, accents reel #4a4a5a, solid, plain rib, heelToe 0, emblem leg: small circle + line.  
6. Out-of-Office — dress, uncommon — “Will reply eventually.” body #f8f0e0, accents palm #3a7a4a, motifScatter, contrast rib, heelToe 1, emblem leg: tiny palm tree.  
7. The Stapler That Jammed — ankle, common — “It was the paper’s fault.” body #c8c8d0, accents staple #5a5a5a, solid, plain rib, heelToe 0, emblem toe: two small rectangles.  
8. Whiteboard Marker — crew, common — “Smells like possibility.” body #e8f0f8, accents cap #e04040, solid, twin stripe, heelToe 1, emblem leg: marker silhouette.  
9. The Chair That Squeaks — knee, uncommon — “Only when you shift.” body #d8d0c0, accents wheel #4a4a4a, stripe, triple stripe, heelToe 1, emblem ankle: small wheel.  
10. Friday Socks — slipper, rare — “Arrived on Thursday by mistake.” body #f0e0f0, accents confetti #e080a0 #80c0e0, polka, scalloped, heelToe 2, emblem leg: three confetti dots.

### 3. Cottage Season  
Blurb: “Socks that know the difference between a draft and a breeze.”  
For: cottage-core, slow living, people who own a kettle they actually use.

1. The Quilt Square — crew, common — “One of twelve, still looking for the rest.” body #f4e8d0, accents patch #c08060 #80a080, plaid, contrast rib, heelToe 1, emblem leg: simple four-patch.  
2. Enamel Mug Print — ankle, common — “Chips on the rim are character.” body #e0f0e8, accents mug #e04040, solid, plain rib, heelToe 0, emblem top-of-foot: mug silhouette.  
3. The Cat That Chose the Clean Laundry — knee, uncommon — “It always does.” body #f0e8d8, accents cat #c08040, solid, twin stripe, heelToe 1, emblem leg: simple cat curl (stock cat motif, sleeping).  
4. Wildflower Margin — dress, common — “Grew in the crack of the path.” body #e8f0d8, accents bloom #e080a0 #80a0e0, motifScatter flower, scalloped, heelToe 1, emblem leg: three small flowers.  
5. The Wood Stove Sock — novelty, rare — “Smells faintly of last winter.” body #d0c0a0, accents flame #e08040, solid, plain rib, heelToe 0, emblem leg: small stove + three raindrop flames.  
6. Jam Jar Label — crew, common — “Strawberry, probably.” body #f8e8e0, accents label #e0a0a0, solid, contrast rib, heelToe 0, emblem ankle: rectangle label.  
7. Clothesline Peg — ankle, uncommon — “Still holds something.” body #e8e0d0, accents peg #c08040, solid, plain rib, heelToe 0, emblem toe: simple peg shape.  
8. The Book Left Outside — knee, common — “Pages are a little wavy now.” body #f0e8d0, accents book #6a4a3a, solid, twin stripe, heelToe 1, emblem leg: closed book.  
9. Rain on the Roof — dress, uncommon — “Better from inside.” body #d0e0e8, accents drop #6a9ab0, motifScatter raindrop, wide band, heelToe 1, emblem leg: three raindrops.  
10. The Last Biscuit — slipper, rare (odd) — “Someone saved it for you.” body #f0e0c0, accents crumb #c0a060, solid, plain rib, heelToe 0, emblem top-of-foot: small round biscuit. Seasonal: autumn.

### 4. Cryptid Casual  
Blurb: “Socks that have been seen, briefly, at the edge of the parking lot.”  
For: the cozy-cryptid crowd, people who like a little mystery with their tea.

1. Blurry Trail Cam — crew, common — “It was probably a deer.” body #c8d0b8, accents blur #6a7a5a, solid, plain rib, heelToe 0, emblem leg: simple quadruped silhouette, soft edges.  
2. The One That Left Footprints — ankle, uncommon — “Four toes, maybe five.” body #e0e8d8, accents print #5a6a4a, solid, twin stripe, heelToe 1, emblem top-of-foot: single footprint.  
3. Parking-Lot Mothman — novelty, rare — “Just wanted the sodium light.” body #3a3a4a, accents wing #8a6a9a eye #e0c040, solid, plain rib, heelToe 0, emblem leg: winged figure + two round eyes.  
4. Lake Something — knee, common — “Ripples, then nothing.” body #d0e0e8, accents wave #4a7a8a, stripe, wide band, heelToe 1, emblem leg: three wavy lines.  
5. The Friendly One — crew, common — “Waved once and left.” body #e8e0d0, accents hand #c0a080, solid, contrast rib, heelToe 0, emblem ankle: simple waving hand.  
6. Gas-Station Shadow — dress, uncommon — “Stood by the pumps for a while.” body #d0d0d8, accents shadow #4a4a5a, solid, twin stripe, heelToe 1, emblem leg: tall thin silhouette.  
7. The Howl That Was a Dog — ankle, common — “Almost certainly a dog.” body #e0d8c8, accents moon #e0e0c0, solid, plain rib, heelToe 0, emblem top-of-foot: crescent + small dog.  
8. Trail Marker That Moved — knee, uncommon — “It was not there yesterday.” body #c8d0a0, accents mark #c04040, solid, triple stripe, heelToe 1, emblem leg: simple arrow that points slightly wrong.  
9. The One in the Group Photo — novelty, rare (odd) — “Nobody remembers inviting it.” body #f0e8e0, accents figure #6a5a4a, solid, plain rib, heelToe 0, emblem leg: extra person at the edge.  
10. Soft Bigfoot — slipper, rare — “Mostly wants a sandwich.” body #c0b0a0, accents fur #8a7a6a, solid, plain rib, heelToe 0, emblem top-of-foot: large soft footprint.

### 5. 90s After-School  
Blurb: “Socks that still smell a little like a plastic lunchbox.”  
For: anyone who remembers the sound of a modem or a Saturday cartoon.

1. The Folder With the Velcro — crew, common — “Still makes the sound.” body #e0e8f0, accents velcro #c0c0c0, solid, contrast rib, heelToe 1, emblem leg: simple folder rectangle.  
2. Glow-in-the-Dark Stars — ankle, uncommon — “Only work in the closet.” body #2a2a3a, accents star #e0e0a0, motifScatter star, plain rib, heelToe 0, emblem top-of-foot: three stars.  
3. The Sticker Sheet — knee, common — “Half of them are used.” body #f0e8d0, accents sticker #e080a0 #80c0e0, polka, twin stripe, heelToe 1, emblem leg: three small sticker shapes.  
4. Cassette Tongue — novelty, rare — “Still has the songs.” body #d0c0a0, accents tape #4a4a4a, solid, plain rib, heelToe 0, emblem leg: cassette rectangle + two circles.  
5. The Lunchbox Thermos — crew, common — “Soup was always too hot.” body #e0f0e8, accents thermos #c04040, solid, contrast rib, heelToe 1, emblem ankle: thermos silhouette.  
6. Roller-Rink Stamp — ankle, common — “You were there.” body #f0e0f0, accents stamp #e04080, solid, plain rib, heelToe 0, emblem top-of-foot: simple star stamp.  
7. The Homework Folder — dress, uncommon — “Has a note from a teacher.” body #e8e0d0, accents note #f0e0a0, solid, twin stripe, heelToe 1, emblem leg: folded note.  
8. Pixel Heart — knee, common — “Eight bits of feeling.” body #f0e0e8, accents heart #e04060, solid, triple stripe, heelToe 1, emblem leg: blocky heart.  
9. The Modem Song — slipper, rare — “You still know every note.” body #d0d0d8, accents wave #4a6a8a, stripe, plain rib, heelToe 0, emblem top-of-foot: simple sound-wave lines.  
10. Saturday Morning — novelty, rare (odd) — “Cartoons were longer then.” body #f0e8c0, accents sun #e0c040, solid, scalloped, heelToe 2, emblem leg: simple rising sun.

### 6. Regional Quiet Pride  
Blurb: “Socks that know the name of the local water tower.”  
For: people who like the place they are from without needing a team logo.

1. Water Tower — crew, common — “Has been taller than the town since 1952.” body #e0e8f0, accents tower #8a8a9a, solid, contrast rib, heelToe 1, emblem leg: simple water-tower silhouette.  
2. County Fair Ribbon — ankle, uncommon — “Third place in something.” body #f0e0e8, accents ribbon #e04060, solid, plain rib, heelToe 0, emblem top-of-foot: small prize ribbon.  
3. The Bridge Everyone Photographs — knee, common — “Looks better in the rain.” body #d0d8e0, accents bridge #5a6a7a, solid, twin stripe, heelToe 1, emblem leg: simple arch.  
4. Farm-Stand Tomato — crew, common — “Still warm from the table.” body #f0e8e0, accents tomato #c04030, solid, contrast rib, heelToe 0, emblem ankle: round tomato.  
5. The Diner That Closed on Mondays — dress, uncommon — “Pie was fine.” body #e8e0d0, accents mug #c06040, solid, twin stripe, heelToe 1, emblem leg: coffee mug.  
6. Grain Elevator — novelty, rare — “Casts a long shadow in August.” body #d0c8b0, accents elevator #8a7a5a, solid, plain rib, heelToe 0, emblem leg: tall rectangle + peaked top.  
7. River Stone Skip — ankle, common — “Made it to five once.” body #e0e8e0, accents stone #8a9a8a, solid, plain rib, heelToe 0, emblem top-of-foot: three flat ovals.  
8. The High-School Gym — knee, uncommon — “Smells like varnish and hope.” body #f0e8d0, accents floor #c0a060, stripe, triple stripe, heelToe 1, emblem leg: simple court lines.  
9. Harvest Moon — dress, common — “Bigger over the fields.” body #e8e0d0, accents moon #e0c080, solid, wide band, heelToe 1, emblem leg: large soft circle.  
10. The Road That Goes Past the Orchard — slipper, rare (odd) — “You can still smell it in September.” body #e0d8c0, accents leaf #6a8a4a, solid, plain rib, heelToe 0, emblem top-of-foot: single apple + leaf. Seasonal: early autumn.

**Pack ranking (most wanted first):** Plant Parent (free), Tiny Office, Cottage Season, 90s After-School, Cryptid Casual, Regional Quiet Pride.

---

## Lane B. Six new procedural pattern families

1. **Herringbone**  
   Looks like: short diagonal dashes arranged in a classic herringbone zig-zag. Drawn from short thick line segments alternating direction every row.  
   Twin difference: shift the phase of the zig by half a step, or change dash length slightly.  
   Decoy: same herringbone but mirrored (left-leaning vs right-leaning) or a single row of dashes flipped.

2. **Seed Stitch**  
   Looks like: tiny alternating raised and lowered dots, like hand-knit seed stitch. Drawn from small circles and tiny squares in a checker of density.  
   Twin difference: density or the exact size of the “seeds.”  
   Decoy: same pattern but every seed is a tiny diamond instead of a circle, or the checker is offset by one.

3. **Ripple**  
   Looks like: soft horizontal waves, like water or old glass. Drawn from long shallow sine-like curves made of thick line segments.  
   Twin difference: amplitude or frequency of the wave.  
   Decoy: same ripple but the wave starts half a cycle later, or a single trough is deeper.

4. **Lattice**  
   Looks like: thin crossing diagonals forming a diamond lattice, sometimes with a tiny motif at intersections. Drawn from long thin lines + optional small stock motifs at crossings.  
   Twin difference: spacing of the lattice or presence/absence of the intersection dots.  
   Decoy: lattice rotated 15°, or the intersection motifs are mirrored.

5. **Marled**  
   Looks like: two colors twisted together in short irregular strands, like marled yarn. Drawn from short overlapping line segments of two colors with slight random offset.  
   Twin difference: the dominant color or the length of the “strands.”  
   Decoy: same marl but the secondary color is shifted one step on the palette wheel.

6. **Cable**  
   Looks like: simple knitted cable twists running vertically. Drawn from pairs of thick curved lines that cross every few rows.  
   Twin difference: the direction of the cross (left-over-right vs right-over-left) or the spacing between cables.  
   Decoy: same cable but one cross is missing or the cable is mirrored.

All six stay readable at thumbnail size and give the matching game clear near-miss decoys without needing new motif shapes.

---

## Lane C. Eight new dryers

1. **Porcelain Farmhouse** — 7 Quarters  
   Look: soft white with a pale blue stripe and a round window.  
   Arrival: regular (heap).  
   Sound: gentle ceramic hum, almost like a distant fridge.  
   Cost: art (new model, old loads).

2. **Copper Top** — 9 Quarters  
   Look: warm copper drum, dark green body, vintage dial.  
   Arrival: regular.  
   Sound: low warm metallic thrum.  
   Cost: art.

3. **Laundromat Stack** — 11 Quarters  
   Look: two dryers stacked, the top one is the one that works.  
   Arrival: bigger (already exists).  
   Sound: industrial but softer than the current industrial.  
   Cost: art.

4. **Window-Seat Dryer** — 10 Quarters  
   Look: low wide machine that sits under a window; socks tumble in soft daylight.  
   Arrival: regular.  
   Sound: quiet motor + occasional bird if the window is open.  
   Cost: art.

5. **Slow-Drum Cast Iron** — 13 Quarters  
   Look: heavy black iron with brass fittings.  
   Arrival: oneAtATime (already exists) but the socks emerge from a small side door instead of a line.  
   Sound: deep slow clank.  
   Cost: art + tiny code for the side-door exit point.

6. **Greenhouse Dryer** — 12 Quarters  
   Look: glass-panelled, plants visible inside the door.  
   Arrival: regular, but a single leaf or petal sometimes tumbles out with the socks (pure visual).  
   Sound: soft humidity hum.  
   Cost: art.

7. **Night-Shift Industrial** — 14 Quarters  
   Look: steel with a single amber work-light.  
   Arrival: bigger.  
   Sound: steady night-shift drone.  
   Cost: art.

8. **The Quiet One** — 8 Quarters  
   Look: matte pale grey, almost no chrome.  
   Arrival: regular.  
   Sound: near silence, only a faint breath of air.  
   Cost: art. (Players who want the room truly quiet will buy this.)

No new `loads` behaviours required for the first release of these; all reuse existing arrival types.

---

## Lane D. The room

### Twelve new rugs (biggest color block)

1. Checkerboard Linoleum — cream & near-black, worn corner. 240 Lint.  
2. Deep Moss Braided — three greens, oval. 200 Lint.  
3. Faded Kilim — soft reds and indigo, geometric. 280 Lint.  
4. Sheepskin Throw — irregular cream shape, soft edge. 320 Lint.  
5. Navy Stripe Runner — long thin navy & cream. 180 Lint.  
6. Terracotta Tile — warm clay squares. 220 Lint.  
7. Midnight Star — dark blue with sparse cream stars. 260 Lint.  
8. Sun-Faded Persian — soft rose and gold, edges frayed. 300 Lint.  
9. Cork Hexagon — natural cork tiles. 190 Lint.  
10. Rainy-Day Grey — soft heather grey with a slightly darker border. 170 Lint.  
11. Picnic Blanket Plaid — red, cream, thin green. 210 Lint.  
12. Worn Heart Hook — oval cream with a single faded heart. 250 Lint.

### Eight new windows

1. Foggy Morning — soft white fog, distant trees. 200 Lint.  
2. Train Going Past — slow moving train silhouette every 40 s. 350 Lint. (code-small for the motion)  
3. Golden Hour Field — warm light, long shadows. 220 Lint.  
4. Night City Soft — distant windows, no neon. 280 Lint.  
5. Spring Blossom — pink petals occasionally drift. 300 Lint.  
6. Storm Approaching — dark clouds, occasional flash. 320 Lint.  
7. Backyard Fence — wooden fence, one bird. 180 Lint.  
8. Snow Day Quiet — thick snow, no wind. 250 Lint.

### Six new lamps

1. Paper Lantern — warm sphere, soft glow. 220 Lint.  
2. Green Banker’s — classic green glass shade. 280 Lint.  
3. Ceramic Mushroom — small red-and-white. 200 Lint.  
4. Adjustable Arm — brass, points at the table. 300 Lint.  
5. Salt Lamp — pinkish orange glow. 240 Lint.  
6. Tiny Desk Lamp — pools light only on the folding table. 260 Lint.

### Ten more of anything else

1. Frame: Pressed Leaf — 120 Lint.  
2. Frame: Found Button Collage — 140 Lint.  
3. Plant: String of Pearls — 160 Lint.  
4. Plant: Tiny Olive Tree — 280 Lint.  
5. Mug: The One With the Chip You Like — 90 Lint.  
6. Mug: Rainy Tuesday — 100 Lint.  
7. Garland: Dried Orange Slices — 140 Lint.  
8. Clock: Cuckoo That Forgot the Bird — 240 Lint.  
9. Poster: “Fold Slowly” — 110 Lint.  
10. Shelf: Open Crate — 350 Lint (variant that shows more of the pocket finds).

### Up to six new slots (worth the code)

1. **Wallpaper** — biggest visual change after the rug. First six: oatmeal linen, soft stripe, tiny floral, quiet geometric, pale green solid, warm plaster. Why: the walls are currently empty; a player notices wallpaper immediately.  
2. **Floor** — under the rug. First six: wide plank oak, narrow pine, painted wood, soft linoleum, worn concrete, checker tile. Why: when the rug is small or moved, the floor shows; completes the room.  
3. **Curtains** — on the window. First six: linen panel, gingham, sheer white, heavy velvet, simple roller, none (open). Why: changes the light quality and frames the view.  
4. **Folding Table Surface** — the table itself. First six: plain wood, white laminate, butcher block, painted mint, marble-ish, worn oilcloth. Why: you look at it the entire game.  
5. **Door** — the room’s door. First six: painted wood, glass pane, screen door, slightly open (shows hallway light), closed with coat hook, with a small wreath. Why: the door is already in the camera; giving it states makes the room feel lived-in.  
6. **Second Animal** — a sleeping dog or a bird on the windowsill (one at a time). First six: sleeping terrier, curled cat (different from the existing one), window bird, fishbowl (still), nothing, seasonal moth. Why: the existing cat is beloved; a second quiet companion is high emotional value for low gameplay risk.

All new slots are pure cosmetics. One item shows per slot.

---

## Lane E. Baskets, balls, trails, radio

### Eight baskets

1. Woven Seagrass — soft green, wide. 400 Lint. style seagrass, radius 1.05, rim forgiving.  
2. Enamel Basin — white with blue rim. 450 Lint. style enamel, radius 1, rim standard.  
3. Canvas Tool Bag — olive, metal frame. 500 Lint. style toolbag, radius 1.1, rim forgiving.  
4. Copper Tub — small, warm. 600 Lint. style copper, radius 0.95, rim standard.  
5. Picnic Basket — with a lid that stays open. 550 Lint. style picnic, radius 1, rim standard.  
6. Mesh Laundry Sack — soft, almost see-through. 350 Lint. style mesh, radius 1.15, rim forgiving.  
7. Wooden Crate — stencilled “SOCKS”. 480 Lint. style crate, radius 1, rim standard.  
8. Cloud-Shaped Basket — joke, soft edges. 700 Lint. style cloud, radius 1.1, rim forgiving.

### Six ball styles

1. The Hotel Fold — 250 Lint. roll hotel. Neat rectangle, tucked ends.  
2. Loose Nest — 150 Lint. roll nest. Socks curled together like a bird’s nest.  
3. Single Cuff Over — 200 Lint. roll cuffover. One cuff pulled over the whole pair.  
4. The Travel Roll — 300 Lint. roll travel. Tight cylinder for a suitcase.  
5. Soft Bundle — 180 Lint. roll soft. Barely held together, very forgiving.  
6. The One With the Ribbon — 350 Lint. roll ribbon. Tiny ribbon around the middle (visual only).

### Six trails

1. Soft Steam — 200 Lint. trail steam. Faint warm vapour.  
2. Petal Drift — 250 Lint. trail petal. Two or three slow petals.  
3. Dust Mote — 150 Lint. trail mote. Tiny floating motes in the light.  
4. Thread Trail — 220 Lint. trail thread. A single loose thread that fades.  
5. Warm Glow — 300 Lint. trail glow. Soft orange after-image.  
6. Nothing At All — 100 Lint. trail none. For players who want pure quiet.

### Eight radio stations

1. Kitchen at 7 am — 200 Lint. station kitchen. Soft clink of a mug, distant kettle.  
2. The Porch After Rain — 220 Lint. station porch. Drips, one bird, wet wood.  
3. Late-Night AM — 200 Lint. station am. Distant talk radio, warm static.  
4. Record Store Back Room — 250 Lint. station record. Needle drop, quiet browsing.  
5. Laundromat at Dusk — 180 Lint. station laundromat. Other machines, muffled voices.  
6. The Drive Between Towns — 230 Lint. station drive. Soft engine, occasional road sound.  
7. Someone Practising Piano — 280 Lint. station piano. Imperfect scales, long pauses.  
8. The Station That Only Plays One Song — 300 Lint. station onesong. The same gentle loop, slightly different each time.

---

## Lane G. Paying without feeling cheap

**Straight answer.**  
Sell almost nothing. The game is already paid. Any additional purchase must feel like a thank-you, not a shop.

What I would sell (and how):  
- **Supporter Bundle** — $4.99 once. Contains: one free hero pack of the player’s choice (from the four paid packs), a unique “Thank You” mug that appears on the shelf, and a small permanent lint bonus (+5 % Lint forever). Presented as a handwritten note pinned to the cork board: “If the room has been good to you, this is a way to say so.” No shop screen; the note appears after the player has owned the game 14 days and has finished 20 Loads.  
- Individual hero packs remain earnable with Quarters; the supporter bundle simply gives one early.  
- No button to buy Quarters. Ever.  
- No “buy this sock” or time-limited offers.

What must always stay earnable: every dryer, every pack, every decor item, every comfort. The supporter bundle is pure acceleration + a visible thank-you object.

Which of the three ideas costs more in reviews than it earns: a permanent “buy Quarters” button. Cozy audiences treat that as a broken promise. Hero packs sold one-at-a-time is safer if framed as “skip the wait,” but still riskier than a single supporter bundle. The supporter bundle, presented as a quiet note rather than a shop, is the only one I would ship.

Two paid cozy games that handle this well:  
- **Unpacking** — one price, no extras, the game is the complete experience.  
- **A Little to the Left** — paid base + optional paid expansion packs that add pure content, never power, and are clearly optional. Their store page never feels like a mobile shop.

---

## Lane H. Make it look and feel PREMIUM — twenty specific things

Ranked by (noticeability / cost).

1. **Ball landing in wicker** — soft compression of the weave + a single low “whump” + a tiny dust puff that settles. Done when the dust has weight and the sound has a tail. Cost: art + sound.  
2. **8 pm light shift** — the room’s key light warms and drops; window light cools. Lamp pools become the only bright spots. Done when you can feel the time without a clock. Cost: code-small (time-of-day light).  
3. **First ten seconds** — dryer door opens, one soft tumble of socks, the radio is already playing at low volume, the camera is already framed. No logo splash that lasts more than 1.2 s. Done when a player can start sorting before they think about menus. Cost: polish.  
4. **Menu sheet arrival** — a single sheet of paper slides onto the table from the side with a soft paper sound; never a full-screen fade. Cost: code-small.  
5. **Sock flip haptic + sound** — short sharp haptic + fabric rustle that changes if the sock was inside-out. Done when the flip feels physical. Cost: sound + haptic.  
6. **Lint trap pull** — the trap slides with resistance, lint compresses, coin gleams. Done when the player looks forward to opening it. Cost: art + sound.  
7. **Warm shadow under the lamp** — soft contact shadow that moves if the lamp is adjusted. Cost: lighting.  
8. **Basket rim highlight** — when a ball is in the air and near the rim, a soft rim light appears for 0.3 s. Comfort, not aimbot. Cost: code-small.  
9. **Cat breathing** — the laundry cat’s side rises and falls slowly. Done when you notice it on the third Load. Cost: art.  
10. **Radio dial glow** — matches the station colour, very dim. Cost: art.  
11. **Window condensation** — on rainy/foggy windows, soft droplets that slowly trail. Cost: art.  
12. **Tablecloth drape** (if added) — real soft folds, not a flat plane. Cost: art.  
13. **Coin jar settle** — coins in the jar shift slightly when a new one drops. Cost: code-small.  
14. **Odd sock soft pulse** — 0.4 s glow every 20 s, never urgent. Cost: code-small.  
15. **Store screenshot 1** — the room at golden hour, one hero sock on the table, cat sleeping, no UI.  
16. **Store screenshot 2** — a heap mid-sort, one sock held large, soft depth of field.  
17. **Store screenshot 3** — the Odd Bin open, two matched socks side by side, quiet text.  
18. **Store screenshot 4** — a Clean Load just finished, lint trap open with a quarter, warm light.  
19. **Store screenshot 5** — the clothesline with four pegs filled, evening light.  
20. **Haptic on successful pair** — a single soft double-tap when the ball forms. Done when it feels like a quiet “yes.” Cost: haptic.

---

## Lane I. Tomorrow

What brings someone back:  
- The Daily Load is different every day (already exists) and sometimes contains a sock from a pack they own but have not found yet.  
- The Odd Bin has a soft glow if a mate is waiting; the glow is visible from the main room.  
- One new pocket find or coin moment is slightly more likely after a day away (the under-rug sweep and end-of-day jar).  
- Seasons (when added) change the default window and one garland automatically; the player can override.  
- The cat (or second animal) is in a slightly different sleeping pose.  
- A single new radio station or trail is on sale for Lint the day after a major unlock.

Nothing nags. The room simply looks a little more lived-in because they were gone.

---

## Lane J. What is wrong / what I would break

1. **The Quarters gate is the biggest contradiction.** Law 7 says rewards are for care, not time served, yet the most visible rewards (dryers, packs) are locked behind near-perfect play that many cozy players will never consistently hit. The new coin system fixes the income side; the slight price reduction fixes the demand side.  
2. **“Everything you unlock is visible” is excellent, but the current room has no wallpaper, no floor, no curtains, no table surface.** Those four slots are the highest-value code-small additions possible; I would break the “no new slots” caution for them.  
3. **The free hero pack should be Plant Parent.** It is the most universal of the six and gives every player something to screenshot on day one.  
4. **I would gently break Law 1 for one comfort only:** the Warm Hands Button that makes the held sock 8 % larger for 30 s. It is still only a comfort (the peg already does something similar), and it makes the hundredth-Load find feel special without ever making a player better at the scoring rules.  
5. **Missed opportunity:** the radio stations are pure mood, yet there is no “station that plays the sound of the room itself” (dryer hum + distant traffic + occasional cat). That would be the ultimate quiet station.  
6. **The brief is extremely clear.** The only real risk is shipping too many new pattern families or dryers before the coin economy is felt; prioritise F, then A, then D rugs and the four new slots.

---

```json
[
  {"lane":"F","rank":1,"kind":"money","id":"coin-system","title":"Pocket change + jar that rolls into Quarters","data":null,"looks_like":"glass jar on shelf that auto-rolls 25¢ into a Quarter","why":"restores the laundry fantasy and removes the perfection tax on dryers and packs","cost_to_build":"code-small","confidence":0.92},
  {"lane":"F","rank":2,"kind":"coin","id":"coin-lint-trap","title":"Lint-trap coin","data":{"id":"coin-lint-trap","moment":"the lint trap is emptied when a Load ends","sees_and_hears":"the trap slides out, a grey felt of lint, one bright coin on top, a clean ring","coins":{"penny":0.6,"nickel":0.25,"dime":0.1,"quarter":0.05},"how_often":"every Load; extra coin on Clean; at least dime on Spotless","cents_per_regular_load":10},"looks_like":null,"why":"best single sound and most frequent reliable income","cost_to_build":"code-small","confidence":0.95},
  {"lane":"F","rank":3,"kind":"coin","id":"coin-sock-flip","title":"Sock-flip coin","data":{"id":"coin-sock-flip","moment":"first time an inside-out sock is flipped right-side-out","sees_and_hears":"tiny metallic ping, coin tumbles from the cuff","coins":{"penny":0.7,"nickel":0.2,"dime":0.08,"quarter":0.02},"how_often":"once per sock per Load","cents_per_regular_load":4},"looks_like":null,"why":"rewards the core care action of flipping","cost_to_build":"code-small","confidence":0.9},
  {"lane":"F","rank":4,"kind":"coin","id":"coin-drum-rattle","title":"Drum-rattle coins","data":{"id":"coin-drum-rattle","moment":"dryer door opens","sees_and_hears":"socks tumble, one or two coins bounce and spin","coins":{"penny":0.5,"nickel":0.3,"dime":0.15,"quarter":0.05},"how_often":"1-2 every Load","cents_per_regular_load":6},"looks_like":null,"why":"immediate feedback the moment the Load begins","cost_to_build":"code-small","confidence":0.88},
  {"lane":"F","rank":5,"kind":"coin","id":"coin-under-rug","title":"Under-the-rug sweep","data":{"id":"coin-under-rug","moment":"once per real day, first Load after midnight","sees_and_hears":"rug tilts, soft scrape, one coin glitters","coins":{"nickel":0.5,"dime":0.5},"how_often":"once per day","cents_per_regular_load":0},"looks_like":null,"why":"quiet daily gift that never feels like a streak","cost_to_build":"code-small","confidence":0.85},
  {"lane":"F","rank":6,"kind":"find","id":"find-half-chapstick","title":"Half a Chapstick","data":{"id":"find-half-a-chapstick","name":"Half a Chapstick","rarity":"common","flavor":"Survived the wash. Again.","looks_like":"a stubby white tube, cap missing, one dent","comes_out":"drops from a knee sock the first time it is flipped right side out","shown":"in the glass jar on the display shelf","set":"coat-pocket-of-a-tall-man","help":null,"help_kind":"keepsake"},"looks_like":"stubby white tube","why":"universal, funny, perfect first-day find","cost_to_build":"art","confidence":0.95},
  {"lane":"F","rank":7,"kind":"find","id":"find-warm-hands-button","title":"Warm Hands Button","data":{"id":"find-warm-hands-button","name":"Warm Hands Button","rarity":"uncommon","flavor":"Still remembers a pocket.","looks_like":"round wooden button, slightly warm to the eye","comes_out":"from any sock after 50 Loads","shown":"on the clothesline peg board","set":null,"help":"held sock 8% larger for 30s","help_kind":"comfort"},"looks_like":"wooden button","why":"tiny comfort that acknowledges time spent without becoming advantage","cost_to_build":"art","confidence":0.82},
  {"lane":"F","rank":8,"kind":"find","id":"find-river-stone","title":"Smooth River Stone","data":{"id":"find-smooth-river-stone","name":"Smooth River Stone","rarity":"rare","flavor":"Went through the wash by accident and liked it.","looks_like":"grey oval, water-worn","comes_out":"from any sock after 100 Loads","shown":"on the windowsill","set":null,"help":"first miss of a Load has softer sound and less wild bounce","help_kind":"comfort"},"looks_like":"grey oval stone","why":"late-game keepsake that feels earned","cost_to_build":"art","confidence":0.8},
  {"lane":"F","rank":9,"kind":"find","id":"find-four-leaf","title":"Pressed Four-Leaf Clover","data":{"id":"find-pressed-clover","name":"Pressed Four-Leaf Clover","rarity":"once","flavor":"Found in a different pocket.","looks_like":"flat green silhouette","comes_out":"from the 200th Load only","shown":"framed on the wall","set":null,"help":"next Load starts with one free Static Cling or soft twin glow","help_kind":"comfort"},"looks_like":"pressed clover","why":"once-only reward that makes the 200th Load feel special","cost_to_build":"art","confidence":0.78},
  {"lane":"F","rank":10,"kind":"set","id":"set-coat-pocket","title":"Coat-pocket-of-a-tall-man set","data":null,"looks_like":"tiny folded map on the shelf when complete","why":"visible completion reward for a common set","cost_to_build":"art","confidence":0.85},
  {"lane":"F","rank":11,"kind":"price","id":"rebalance-quarters","title":"Lower dryer and pack Quarter prices","data":null,"looks_like":null,"why":"95 Quarters was too high once income is fixed; ~70 feels right","cost_to_build":"data","confidence":0.9},
  {"lane":"F","rank":12,"kind":"sink","id":"sink-tablecloth","title":"Tablecloth for the folding table","data":{"id":"decor-tablecloth","cat":"decor","name":"Linen Tablecloth","desc":"Soft linen that makes the table look like it was set on purpose.","cost":{"lint":220},"look":{"slot":"table","variant":"linen","color":"#f4efe2","color2":"#e8e0d0"}},"looks_like":"soft linen drape","why":"new Lint sink once room is full and the table is the main surface","cost_to_build":"art","confidence":0.88},
  {"lane":"F","rank":13,"kind":"peg","id":"peg-quiet-hands","title":"Quiet Hands peg","data":null,"looks_like":null,"why":"earned by 10 Clean Loads; held ball stays slightly larger while rolling","cost_to_build":"code-small","confidence":0.85},
  {"lane":"F","rank":14,"kind":"peg","id":"peg-night-owl","title":"Night Owl peg","data":null,"looks_like":null,"why":"earned by 5 Loads after 10 pm; extra-dim warm lamp option","cost_to_build":"code-small","confidence":0.83},
  {"lane":"F","rank":15,"kind":"peg","id":"peg-full-flip","title":"Full Flip peg","data":null,"looks_like":null,"why":"earned by 100 flips; first inside-out sock starts half-turned","cost_to_build":"code-small","confidence":0.8},
  {"lane":"F","rank":16,"kind":"peg","id":"peg-long-memory","title":"Long Memory peg","data":null,"looks_like":null,"why":"earned by 25 Reunions; odd socks pulse softly every 20 s","cost_to_build":"code-small","confidence":0.87},
  {"lane":"A","rank":1,"kind":"pack","id":"pack-plant-parent","title":"Plant Parent (free)","data":{"id":"pack-plant-parent","cat":"pack","name":"Plant Parent","desc":"Socks that have been watered too much, too little, or exactly right once.","cost":{"quarters":0},"start":true,"look":{"pack":"plant-parent"}},"looks_like":null,"why":"most universal pack; ship free so every player has something to screenshot on day one","cost_to_build":"art","confidence":0.93},
  {"lane":"A","rank":2,"kind":"hero","id":"hero-overwatered","title":"The Overwatered One","data":{"name":"The Overwatered One","pack":"plant-parent","silhouette":"crew","rarity":"common","flavor":"It was fine until you helped.","source":"pack","design":{"body":"#dfe8d2","accents":{"leaf":"#4f8a4a","pot":"#c46a3c","drip":"#6fb6d8"},"family":"solid","cuff":"contrast rib","heelToe":1,"emblems":[{"where":"leg","what":"terracotta pot (rounded box) with three drooping leaves and two blue raindrops"}]}},"looks_like":null,"why":"every plant owner has killed one this way","cost_to_build":"art","confidence":0.9},
  {"lane":"A","rank":3,"kind":"pack","id":"pack-tiny-office","title":"Tiny Office","data":{"id":"pack-tiny-office","cat":"pack","name":"Tiny Office","desc":"Socks that have sat through one more meeting than they planned.","cost":{"quarters":8},"look":{"pack":"tiny-office"}},"looks_like":null,"why":"huge adult audience that works from home or remembers fluorescent light","cost_to_build":"art","confidence":0.88},
  {"lane":"A","rank":4,"kind":"pack","id":"pack-cottage-season","title":"Cottage Season","data":{"id":"pack-cottage-season","cat":"pack","name":"Cottage Season","desc":"Socks that know the difference between a draft and a breeze.","cost":{"quarters":8},"look":{"pack":"cottage-season"}},"looks_like":null,"why":"cottage-core is still deeply popular with the cozy crowd","cost_to_build":"art","confidence":0.87},
  {"lane":"A","rank":5,"kind":"pack","id":"pack-90s","title":"90s After-School","data":{"id":"pack-90s-after-school","cat":"pack","name":"90s After-School","desc":"Socks that still smell a little like a plastic lunchbox.","cost":{"quarters":8},"look":{"pack":"90s-after-school"}},"looks_like":null,"why":"strong nostalgia without needing real brands","cost_to_build":"art","confidence":0.85},
  {"lane":"A","rank":6,"kind":"pack","id":"pack-cryptid","title":"Cryptid Casual","data":{"id":"pack-cryptid-casual","cat":"pack","name":"Cryptid Casual","desc":"Socks that have been seen, briefly, at the edge of the parking lot.","cost":{"quarters":8},"look":{"pack":"cryptid-casual"}},"looks_like":null,"why":"cozy-cryptid is a real and affectionate niche","cost_to_build":"art","confidence":0.82},
  {"lane":"A","rank":7,"kind":"pack","id":"pack-regional","title":"Regional Quiet Pride","data":{"id":"pack-regional-quiet","cat":"pack","name":"Regional Quiet Pride","desc":"Socks that know the name of the local water tower.","cost":{"quarters":8},"look":{"pack":"regional-quiet"}},"looks_like":null,"why":"regional feeling without naming teams or towns","cost_to_build":"art","confidence":0.8},
  {"lane":"B","rank":1,"kind":"family","id":"family-herringbone","title":"Herringbone pattern family","data":null,"looks_like":"short diagonal dashes in classic zig-zag","why":"readable at thumbnail, clear decoy by mirroring direction","cost_to_build":"code-small","confidence":0.9},
  {"lane":"B","rank":2,"kind":"family","id":"family-seed-stitch","title":"Seed Stitch pattern family","data":null,"looks_like":"tiny alternating raised and lowered dots","why":"feels hand-knit, decoys by shape or offset","cost_to_build":"code-small","confidence":0.88},
  {"lane":"B","rank":3,"kind":"family","id":"family-ripple","title":"Ripple pattern family","data":null,"looks_like":"soft horizontal waves","why":"calm and distinct, decoy by phase shift","cost_to_build":"code-small","confidence":0.87},
  {"lane":"B","rank":4,"kind":"family","id":"family-lattice","title":"Lattice pattern family","data":null,"looks_like":"thin crossing diagonals forming diamonds","why":"strong silhouette, decoy by rotation or missing intersections","cost_to_build":"code-small","confidence":0.85},
  {"lane":"B","rank":5,"kind":"family","id":"family-marled","title":"Marled pattern family","data":null,"looks_like":"two colours twisted in short irregular strands","why":"yarn-like, decoy by secondary colour shift","cost_to_build":"code-small","confidence":0.84},
  {"lane":"B","rank":6,"kind":"family","id":"family-cable","title":"Cable pattern family","data":null,"looks_like":"simple vertical knitted cable twists","why":"classic, decoy by cross direction","cost_to_build":"code-small","confidence":0.83},
  {"lane":"C","rank":1,"kind":"dryer","id":"dryer-porcelain","title":"Porcelain Farmhouse","data":{"id":"dryer-porcelain","cat":"dryer","name":"Porcelain Farmhouse","desc":"Soft white with a pale blue stripe and a round window that still fogs a little.","cost":{"quarters":7},"look":{"model":"porcelain","color":"#f4f0e8","loads":"regular"}},"looks_like":"soft white ceramic dryer","why":"quiet luxury look that fits the room immediately","cost_to_build":"art","confidence":0.9},
  {"lane":"C","rank":2,"kind":"dryer","id":"dryer-quiet","title":"The Quiet One","data":{"id":"dryer-quiet","cat":"dryer","name":"The Quiet One","desc":"Matte pale grey, almost no chrome, and a hum you can only hear if you listen.","cost":{"quarters":8},"look":{"model":"quiet","color":"#d0d4d2","loads":"regular"}},"looks_like":"matte grey silent dryer","why":"players who want true quiet will buy this first","cost_to_build":"art","confidence":0.88},
  {"lane":"C","rank":3,"kind":"dryer","id":"dryer-copper","title":"Copper Top","data":{"id":"dryer-copper","cat":"dryer","name":"Copper Top","desc":"Warm copper drum, dark green body, and a dial that still feels heavy.","cost":{"quarters":9},"look":{"model":"copper","color":"#b87333","loads":"regular"}},"looks_like":"copper and green vintage","why":"strong material presence without new behaviour","cost_to_build":"art","confidence":0.87},
  {"lane":"C","rank":4,"kind":"dryer","id":"dryer-window-seat","title":"Window-Seat Dryer","data":{"id":"dryer-window-seat","cat":"dryer","name":"Window-Seat Dryer","desc":"Low and wide so the socks tumble in daylight.","cost":{"quarters":10},"look":{"model":"windowseat","color":"#e8e0d0","loads":"regular"}},"looks_like":"low wide dryer under window","why":"changes the light on the socks themselves","cost_to_build":"art","confidence":0.85},
  {"lane":"C","rank":5,"kind":"dryer","id":"dryer-greenhouse","title":"Greenhouse Dryer","data":{"id":"dryer-greenhouse","cat":"dryer","name":"Greenhouse Dryer","desc":"Glass panels and a single leaf that sometimes tumbles out with the socks.","cost":{"quarters":12},"look":{"model":"greenhouse","color":"#c8d8c0","loads":"regular"}},"looks_like":"glass-panelled dryer","why":"visual delight, pure cosmetic leaf","cost_to_build":"art","confidence":0.84},
  {"lane":"C","rank":6,"kind":"dryer","id":"dryer-cast-iron","title":"Slow-Drum Cast Iron","data":{"id":"dryer-castiron","cat":"dryer","name":"Slow-Drum Cast Iron","desc":"Heavy black iron with brass fittings; socks emerge from a small side door.","cost":{"quarters":13},"look":{"model":"castiron","color":"#2a2a2a","loads":"oneAtATime"}},"looks_like":"black iron with brass","why":"reuses oneAtATime with a new exit point","cost_to_build":"art","confidence":0.82},
  {"lane":"C","rank":7,"kind":"dryer","id":"dryer-night-shift","title":"Night-Shift Industrial","data":{"id":"dryer-nightshift","cat":"dryer","name":"Night-Shift Industrial","desc":"Steel with a single amber work-light that never turns off.","cost":{"quarters":14},"look":{"model":"nightshift","color":"#c0c4c8","loads":"bigger"}},"looks_like":"steel with amber light","why":"mood shift for evening play","cost_to_build":"art","confidence":0.8},
  {"lane":"C","rank":8,"kind":"dryer","id":"dryer-stack","title":"Laundromat Stack","data":{"id":"dryer-stack","cat":"dryer","name":"Laundromat Stack","desc":"Two dryers stacked; the top one is the one that works.","cost":{"quarters":11},"look":{"model":"stack","color":"#c9ccce","loads":"bigger"}},"looks_like":"stacked industrial","why":"familiar laundromat silhouette","cost_to_build":"art","confidence":0.78},
  {"lane":"D","rank":1,"kind":"decor","id":"rug-checkerboard","title":"Checkerboard Linoleum Rug","data":{"id":"decor-rug-checker","cat":"decor","name":"Checkerboard Rug","desc":"A rug pretending to be a kitchen floor, and nearly getting away with it.","cost":{"lint":240},"look":{"slot":"rug","variant":"checker","color":"#f4efe2","color2":"#2f2b28"}},"looks_like":"cream and near-black squares, worn corner","why":"loudest block of colour and photographs well","cost_to_build":"art","confidence":0.92},
  {"lane":"D","rank":2,"kind":"decor","id":"rug-moss-braided","title":"Deep Moss Braided Rug","data":{"id":"decor-rug-moss","cat":"decor","name":"Deep Moss Braided","desc":"Three greens braided together so the floor feels like a forest floor.","cost":{"lint":200},"look":{"slot":"rug","variant":"mossbraid","color":"#4a6a3a","color2":"#2a4a2a"}},"looks_like":"three greens, oval","why":"strong colour without competing with socks","cost_to_build":"art","confidence":0.9},
  {"lane":"D","rank":3,"kind":"decor","id":"rug-kilim","title":"Faded Kilim Rug","data":{"id":"decor-rug-kilim","cat":"decor","name":"Faded Kilim","desc":"Soft reds and indigo that have been walked on for years.","cost":{"lint":280},"look":{"slot":"rug","variant":"kilim","color":"#c07060","color2":"#3a4a6a"}},"looks_like":"geometric reds and indigo","why":"instant warmth and pattern","cost_to_build":"art","confidence":0.88},
  {"lane":"D","rank":4,"kind":"slot","id":"slot-wallpaper","title":"Wallpaper slot","data":null,"looks_like":"oatmeal linen, soft stripe, tiny floral, quiet geometric, pale green, warm plaster","why":"biggest visual change after the rug; walls are currently empty","cost_to_build":"code-small","confidence":0.93},
  {"lane":"D","rank":5,"kind":"slot","id":"slot-floor","title":"Floor slot","data":null,"looks_like":"wide plank oak, narrow pine, painted wood, linoleum, concrete, checker tile","why":"completes the room when the rug is small or moved","cost_to_build":"code-small","confidence":0.9},
  {"lane":"D","rank":6,"kind":"slot","id":"slot-curtains","title":"Curtains slot","data":null,"looks_like":"linen panel, gingham, sheer white, velvet, roller, none","why":"changes light quality and frames the window view","cost_to_build":"code-small","confidence":0.88},
  {"lane":"D","rank":7,"kind":"slot","id":"slot-table-surface","title":"Folding table surface slot","data":null,"looks_like":"plain wood, white laminate, butcher block, mint paint, marble-ish, oilcloth","why":"you look at the table the entire game","cost_to_build":"code-small","confidence":0.91},
  {"lane":"D","rank":8,"kind":"slot","id":"slot-door","title":"Door slot","data":null,"looks_like":"painted wood, glass pane, screen, slightly open, coat hook, wreath","why":"door is already in camera; states make the room lived-in","cost_to_build":"code-small","confidence":0.85},
  {"lane":"D","rank":9,"kind":"slot","id":"slot-second-animal","title":"Second animal slot","data":null,"looks_like":"sleeping terrier, curled cat, window bird, fishbowl, nothing, seasonal moth","why":"high emotional value, pure cosmetic companion","cost_to_build":"code-small","confidence":0.87},
  {"lane":"D","rank":10,"kind":"decor","id":"window-train","title":"Train Going Past window","data":{"id":"decor-window-train","cat":"decor","name":"Train Going Past","desc":"A slow train silhouette that crosses the view every forty seconds or so.","cost":{"lint":350},"look":{"slot":"window","variant":"train","color":"#d0d8e0","color2":"#4a5a6a"}},"looks_like":"moving train in the distance","why":"gentle motion that never demands attention","cost_to_build":"code-small","confidence":0.86},
  {"lane":"E","rank":1,"kind":"basket","id":"basket-seagrass","title":"Woven Seagrass Basket","data":{"id":"basket-seagrass","cat":"basket","name":"Woven Seagrass","desc":"Soft green weave with a wide, forgiving mouth.","cost":{"lint":400},"look":{"style":"seagrass","color":"#8a9a6a","color2":"#c0c8a0","radius":1.05,"rim":"forgiving"}},"looks_like":"soft green wide basket","why":"pleasure to land in, slightly forgiving","cost_to_build":"art","confidence":0.9},
  {"lane":"E","rank":2,"kind":"basket","id":"basket-enamel","title":"Enamel Basin","data":{"id":"basket-enamel","cat":"basket","name":"Enamel Basin","desc":"White enamel with a blue rim that chips in the right places.","cost":{"lint":450},"look":{"style":"enamel","color":"#f4f0e8","color2":"#4a6a8a","radius":1,"rim":"standard"}},"looks_like":"white enamel blue rim","why":"classic and clean","cost_to_build":"art","confidence":0.88},
  {"lane":"E","rank":3,"kind":"ball","id":"ball-hotel","title":"The Hotel Fold","data":{"id":"ball-hotel","cat":"ball","name":"The Hotel Fold","desc":"Neat rectangle with the ends tucked, the way a hotel leaves them.","cost":{"lint":250},"look":{"roll":"hotel"}},"looks_like":"neat tucked rectangle","why":"satisfying and different from the mom roll","cost_to_build":"art","confidence":0.87},
  {"lane":"E","rank":4,"kind":"trail","id":"trail-steam","title":"Soft Steam trail","data":{"id":"trail-steam","cat":"trail","name":"Soft Steam","desc":"A faint warm vapour that follows the ball and fades.","cost":{"lint":200},"look":{"trail":"steam"}},"looks_like":"faint warm vapour","why":"premium and quiet","cost_to_build":"art","confidence":0.9},
  {"lane":"E","rank":5,"kind":"radio","id":"radio-kitchen","title":"Kitchen at 7 am","data":{"id":"radio-kitchen","cat":"radio","name":"Kitchen at 7 am","desc":"Soft clink of a mug and a kettle that is almost ready.","cost":{"lint":200},"look":{"station":"kitchen"}},"looks_like":null,"why":"specific place-mood that feels lived-in","cost_to_build":"art","confidence":0.89},
  {"lane":"E","rank":6,"kind":"radio","id":"radio-porch","title":"The Porch After Rain","data":{"id":"radio-porch","cat":"radio","name":"The Porch After Rain","desc":"Drips, one bird, and the smell of wet wood.","cost":{"lint":220},"look":{"station":"porch"}},"looks_like":null,"why":"perfect quiet companion to a rainy window","cost_to_build":"art","confidence":0.88},
  {"lane":"E","rank":7,"kind":"radio","id":"radio-piano","title":"Someone Practising Piano","data":{"id":"radio-piano","cat":"radio","name":"Someone Practising Piano","desc":"Imperfect scales and long pauses between them.","cost":{"lint":280},"look":{"station":"piano"}},"looks_like":null,"why":"human and unfinished in the best way","cost_to_build":"art","confidence":0.86},
  {"lane":"E","rank":8,"kind":"basket","id":"basket-cloud","title":"Cloud-Shaped Basket","data":{"id":"basket-cloud","cat":"basket","name":"Cloud-Shaped Basket","desc":"Soft edges and no sharp corners, for balls that need a gentle landing.","cost":{"lint":700},"look":{"style":"cloud","color":"#e8eef4","color2":"#c0d0e0","radius":1.1,"rim":"forgiving"}},"looks_like":"soft cloud basket","why":"joke basket that is still a pleasure to use","cost_to_build":"art","confidence":0.8},
  {"lane":"G","rank":1,"kind":"paid","id":"supporter-bundle","title":"Supporter Bundle","data":null,"looks_like":"handwritten note on the cork board after 14 days","why":"single thank-you purchase that never feels like a shop; one free pack + thank-you mug + small lint bonus","cost_to_build":"code-small","confidence":0.9},
  {"lane":"H","rank":1,"kind":"polish","id":"polish-ball-landing","title":"Ball landing in wicker","data":null,"looks_like":"soft compression + low whump + tiny dust","why":"highest noticeability per cost; the moment you feel every successful shot","cost_to_build":"art","confidence":0.95},
  {"lane":"H","rank":2,"kind":"polish","id":"polish-8pm-light","title":"8 pm light shift","data":null,"looks_like":"key light warms and drops, window cools","why":"time of day becomes felt without a clock","cost_to_build":"code-small","confidence":0.92},
  {"lane":"H","rank":3,"kind":"polish","id":"polish-first-ten","title":"First ten seconds","data":null,"looks_like":"dryer opens, soft tumble, radio already low, no long splash","why":"player can start sorting before thinking about menus","cost_to_build":"polish","confidence":0.93},
  {"lane":"H","rank":4,"kind":"polish","id":"polish-menu-sheet","title":"Menu sheet arrival","data":null,"looks_like":"single paper slides onto table with paper sound","why":"premium instead of full-screen fade","cost_to_build":"code-small","confidence":0.9},
  {"lane":"H","rank":5,"kind":"polish","id":"polish-flip-haptic","title":"Sock flip haptic + sound","data":null,"looks_like":"short sharp haptic + fabric rustle","why":"the core action feels physical","cost_to_build":"art","confidence":0.91},
  {"lane":"I","rank":1,"kind":"retention","id":"retention-daily-odd-glow","title":"Odd Bin soft glow from main room","data":null,"looks_like":"soft glow visible when a mate is waiting","why":"quiet reason to open the game again without any nag","cost_to_build":"code-small","confidence":0.9},
  {"lane":"I","rank":2,"kind":"retention","id":"retention-cat-pose","title":"Cat sleeping pose changes overnight","data":null,"looks_like":"slightly different curl or position","why":"the room feels lived-in because you were away","cost_to_build":"art","confidence":0.85},
  {"lane":"J","rank":1,"kind":"problem","id":"problem-quarters-gate","title":"Quarters gated behind near-perfect play","data":null,"looks_like":null,"why":"contradicts the care-not-time law and locks the best cosmetics behind skill most cozy players will not consistently hit","cost_to_build":"data","confidence":0.95},
  {"lane":"J","rank":2,"kind":"problem","id":"problem-missing-slots","title":"No wallpaper, floor, curtains or table surface","data":null,"looks_like":null,"why":"highest-value code-small additions possible; the room feels unfinished without them","cost_to_build":"code-small","confidence":0.92}
]
```
