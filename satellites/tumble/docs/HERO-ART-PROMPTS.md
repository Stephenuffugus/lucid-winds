# TUMBLE hero socks, the decal art sheet (24 September 2026)

Stephen: "I just unlocked something like the seed socks from the hero 3 pack and they make me a little concerned cuz they kind of
look like s*** ... I want to make sure they look good." A hero sock is painted from a recipe of flat shapes; the painter now draws
hero emblems bigger, with ink that holds at play size and the knit through the fill (engine/sockgen.js, hero recipes only). This
sheet is the second step: a painted DECAL per hero, laid over the recipe's own emblem place, the way the finds art is laid over
the find recipes.

## How the art comes in (wired)

Drop a PNG per hero at `satellites/tumble/assets/heroes/<id>.png` (the ids are below) and list the ids you dropped in
`satellites/tumble/assets/heroes/manifest.json` as a JSON array of strings. The game paints the recipe first and lays the
decal over the emblem the moment the file is there, at the size and place the recipe gives the emblem, on both faces of the
sock; a missing file leaves the recipe showing. Size: 512 x 512, TRANSPARENT background, the object filling about 85 percent
of the square, centred. The decal REPLACES the emblem only: the sock's colour, stripes, cuff, heel and toe stay the recipe's.

## One style, pasted at the top of EVERY prompt (this is the continuity)

> A single small motif for a knitted sock, on a transparent background, centred, filling most of a square frame. It looks
> KNITTED IN, like intarsia or a chunky embroidery: soft blocky edges that follow a knit grid, a little visible yarn texture,
> two or three flat colours plus one dark outline colour, no gradients, no shadows, no background, no text unless the line
> below asks for a word, no people, no hands. Bold and simple enough to read at the size of a thumbnail. Square, 1024 x 1024.

Then one line for the sock (below), with its colours. Keep the same seed or reference image across a pack if the tool allows
(ChatGPT: one conversation per pack, "same style as the last one"). Generate the ten of one pack together, look at them side
by side at thumbnail size, and only then the next pack. Motifs that are a repeating pattern (marked PATTERN) do not need a
decal: the painter repeats them and they read already.

### Cottage Chore Club (cottage-chore-club)

- `hero_cottage_001` **Sheets on the Line** : Smells like wind and one clothespin. Colours: line #4f4c45, sheet #fcf9f1, ink #4a6670, pin #9a6a36. Sock body #9dbfcb.
- `hero_cottage_002` **Jam Jar Lid** : Sticky around the edge, spiritually. Colours: jar #f1e4cf, ink #5c2330, fruit #8b3048, lid #f7efe4, check #d65c62. Sock body #c24f55.
- `hero_cottage_003` **Mended Elbow Energy** : The patch is stronger than the original plan. Colours: patch #c98e62, ink #4d4336, thread #f1e6cf. Sock body #8b806e.
- `hero_cottage_004` **Bread Cooling by the Window** : Touching it early remains under consideration. Colours: loaf #b87846, ink #6e4222, body #e2c28c, crust #8a5430, steam #fbf6ec. Sock body #e2c28c.
- `hero_cottage_005` **Herb Bundle Upside Down** : Drying with excellent posture. Colours: twine #a57a48, stem #3c4b33, ink #33412b, leaf #6f8f4a. Sock body #d6c294.
- `hero_cottage_006` **Mushroom Basket, No Guarantees** : Identifications remain a group project. Colours: cap #c86f55, ink #4f3a28, cap2 #e8b35c, basket #8e6847, weave #6f4f33. Sock body #c9b692.
- `hero_cottage_007` **Rain Barrel Full** : We asked for rain. It overachieved. Colours: barrel #8a6346, ink #2f2a26, band #3f3a36, water #bfe0e8. Sock body #8fb0bd.
- `hero_cottage_008` **The Good Mending Scissors** : Not for paper. This remains important. Colours: steel #d6d5ce, ink #3a2c31, thread #e8b95c. Sock body #7e5c68.
- `hero_cottage_009` **Porch Broom With One Good Corner** : The other corner retired last spring. Colours: handle #65705f, ink #4a3626, straw #dcb96e, straw2 #b9964e, band #a0483a. Sock body #9a7254.
- `hero_cottage_010` **The Lantern Walk Home** : The path knows you by now. Colours: glow #4e5a48, glow2 #8a7d4c, frame #1a2226, lamp #f0c45e, path #a8977a. Sock body #293b42.

### Cursed (cursed)

- `hero_cursed_001` **The Glove Sock** : Insists its five toes are fingers and waves every time the dryer opens. Colours: ink #4a2f12, hand #fffaf0, accent #2f6db5, heart #e2475f. Sock body #f4c21f.
- `hero_cursed_002` **Shoe Pattern Sock** : From across the room it is a sneaker; up close it is a sock with ambitions. Colours: accent #f7f2e6. Sock body #c8372d.
- `hero_cursed_003` **The Damp One** : Has been through the dryer eleven times and remains, somehow, a little damp. Colours: ink #243447, cloud #f7fafc, drop #2b7bc0. Sock body #a8c3d4.
- `hero_cursed_004` **Tube Sock With a Zipper** : Nobody knows what the zipper is for, but it is always a little bit open. Colours: lining #f07ca0, dot #ffffff, tape #353a44, tooth #d9dde3, pull #b9bfc8, ink #22252b. Sock body #f3f0e9.
- `hero_cursed_005` **Sock That's Mostly Hole** : Is still technically a sock, held together by three loyal threads and a lot of sentiment. Colours: rim #9fcf86, hole #241e1c, thread #6aa857. Sock body #5f9a4e.
- `hero_cursed_006` **Inside Out Permanently** : Flip it all you like; it has been inside out for years and considers this its good side. Colours: ghost #8c5a6b. Sock body #b3a794. The word on it: "COZY".
- `hero_cursed_007` **The Too Long One** : If you pull it all the way up, it simply keeps going. Colours: accent #f0bd45. Sock body #27345a. The word on it: "LOOOOOO".
- `hero_cursed_008` **Someone Else's** : Nobody in this house is this small, and yet it turns up every single wash. Colours: accent2 #e98aa8, tape #ffffff, name #c62f45. Sock body #f6cfdc. The word on it: "WHOSE?".
- `hero_cursed_009` **Slightly Warm Still** : Came out of the dryer on Tuesday and is, for reasons nobody can explain, still warm. Colours: accent #fff6e6, ink #5a2616, cheek #f28b82. Sock body #f7b84a.
- `hero_cursed_010` **The Third Sock** : Came through the back of the dryer, matches nothing, and apologizes for the intrusion. Colours: deep #1a1540, accent2 #5fd3ff, sock2 #c9c2e6, cuff #8b80c4, sock #eeeaf8, ink #120e2c, gold #ffc53d, goldCuff #e0782c, accent #ffe07a. Sock body #2a2358.

### Fake Merch (fake-merch)

- `hero_merch_001` **Tour '94 for Damp Towel** : The band played eleven towns that summer, and it rained in all of them, which they took personally. Colours: cloud #dcd7e8, ink #1e1c24, accent2 #5cc8d7. Sock body #1e1c24.
- `hero_merch_002` **Muncie Comets Tee Ball** : The Comets went undefeated, mostly because nobody kept score. Colours: accent #f5c542, accent2 #f6f2e8, ink #16254a, stitch #d8402f. Sock body #2b55a8.
- `hero_merch_003` **Lake Hoyt Regatta** : Nobody at Lake Hoyt has ever finished the race, but the lunch afterward is excellent. Colours: accent #1f3563, body #f2ede1, accent2 #c8392e, sea #4f9fd1. Sock body #f2ede1.
- `hero_merch_004` **Family Reunion 2011** : Aunt Carol ordered ninety pairs for sixty people, so there are still some in her garage. Colours: accent #3a2417, heart #d9344a, accent2 #fff1d6. Sock body #f08a2c.
- `hero_merch_005` **Vote Bartleby** : The campaign handed these out to babies, who cannot vote, and the candidate would prefer not to discuss it. Colours: accent2 #22346a. Sock body #f5f1e6.
- `hero_merch_006` **Dave's Reasonable Tires** : Dave gave these away with every oil change and would like you to know the tires are also reasonable. Colours: accent #1d1d1f, wall #3b3b40, hub #b9bdc3, red #d63a2c, accent2 #f7f4ec. Sock body #f3c742. The word on it: "$".
- `hero_merch_007` **Camp Wappalusk Staff** : Counselors were issued these socks, a whistle, a clipboard, and no further instructions. Colours: accent2 #f3e8cf, accent #ec7a2f, sky #f6c35a, lake #4f9fbf, pine #1d3a26. Sock body #2f5b3c.
- `hero_merch_008` **The Corn Festival 5K** : The course is flat and fast, except for the mile that goes through the corn maze. Colours: ink #2e3a22, accent #f2c230, kernel #d59a16, accent2 #4f9a3a. Sock body #f7f4ec. The word on it: "5K".
- `hero_merch_009` **A Cruise That Was Fine** : The buffet was fine, the weather was fine, and the slippers from the gift shop are also fine. Colours: smoke #d9dde0, funnel #e9674f, accent2 #1f3a5f, accent #f7f3ea, sea #2f7fa3. Sock body #58b9c6.
- `hero_merch_010` **Local Band You Missed** : They played one show in a laundromat, and everyone who was there still talks about it. Colours: accent #1e1a24, accent2 #f6e7c1, tape #57c9bd, shell #3a3342. Sock body #e24a86. The word on it: "DEMO".

### Found in 1998 (found-1998)

- `hero_y1998_001` **Translucent Phone Cord** : Reached every room and tangled in all of them. Colours: cord #2f7894, phone #eefaf8, ink #245463. Sock body #b3ddd8.
- `hero_y1998_002` **Mix Disc, Untitled** : Track seven was the entire reason. Colours: disc #e3eaf2, ink #55506a, rainbow #e0a05a, rainbow2 #9ac6a0, hole #d6cce6, marker #34383e. Sock body #d6cce6.
- `hero_y1998_003` **Glow Stars on the Ceiling** : Three are still up there somehow. Colours: star2 #e8f7a8. Sock body #28324e.
- `hero_y1998_004` **Gel Pen Constellation** : The notebook margin was the main assignment. Colours: silver #d9dbe2, pink #f37fb1, aqua #6fd6d4. Sock body #42365f.
- `hero_y1998_005` **Roller Rink Carpet** (PATTERN, no decal needed) : Designed to hide everything except joy. Colours: cyan #45c8d2, magenta #e0629f, yellow #eed85a. Sock body #25213f.
- `hero_y1998_006` **Inflatable Chair Static** : Sat once. Stood up carrying the room. Colours: chair2 #6aa9d0, ink #1d4763, chair #3f88b8, static #e8a820. Sock body #cbe4f1.
- `hero_y1998_007` **Cassette Rewound With Pencil** : The pencil knew its assignment. Colours: tape #3f3f44, ink #1d1d21, label #f4e8c6, pencil #e2b24f, lead #2b2b2b, eraser #e38f95. Sock body #d8c8ad.
- `hero_y1998_008` **Computer Room Carpet** (PATTERN, no decal needed) : Every chair wheel knew this exact blue. Colours: speck #b8d4e8, body #2f4e73, grid #e8b85a. Sock body #2f4e73.
- `hero_y1998_009` **Vending Machine Ring** : Cost fifty cents and ruled the afternoon. Colours: ring #8c63a6, gem #4fc7c6, ink #4c2f5f, shine #ffffff. Sock body #f2c8d5.
- `hero_y1998_010` **Channel Three Snow** (PATTERN, no decal needed) : The console is on. The television disagrees. Colours: snow #d8d9d7, snow2 #8f9499. Sock body #30343a.

### Gas Station (gas-station)

- `hero_gas_001` **Tacos With Faces** : Each one is having a slightly different day. Colours: body #d63a3a, lettuce #78d04a, meat #7a3b1e, cheese #fff3a3, shell #ffc83d, ink #3b1f14, speck #d98f1c. Sock body #d63a3a.
- `hero_gas_002` **Dinosaur on a Lawnmower** : The lawn has never looked better, and nobody knows whose lawn it is. Colours: body #6cc7f2. Sock body #6cc7f2.
- `hero_gas_003` **Bass in Sunglasses** : Got thrown back once and has worn these ever since. Colours: body #ffd447, ink #1d2a1a. Sock body #ffd447.
- `hero_gas_004` **Hot Dog Astronaut** : The first hot dog in orbit, and it is still a little warm. Colours: body #2c4fb8, glass #bfe8ff, sausage #d9573b, ink #1a1f3d, bun #f2b861. Sock body #2c4fb8.
- `hero_gas_005` **Cactus Wearing a Hat** : Keeps the hat on indoors, and nobody has had the heart to mention it. Colours: body #ff6fa3, ink #1f1a24, cactus #43a84a, pot #e07a3f. Sock body #ff6fa3.
- `hero_gas_006` **Raccoon Eating Fries** : Insists the fries were a gift. Colours: body #7a55c7. Sock body #7a55c7.
- `hero_gas_007` **Pickle Party** : Nobody remembers who invited the pickles, but the party got better. Colours: pickle #2f7a26, ink #1f2a14, bump #6fbf4a. Sock body #ffa24d.
- `hero_gas_008` **UFO Abducting a Cow** : The cow seems oddly calm about the whole thing. Colours: beam #f3ffa6. Sock body #1f1d2b.
- `hero_gas_009` **The Flamingo** : Has been standing on one leg since the store opened. Colours: body #0a6d69, ink #123332. Sock body #0a6d69.
- `hero_gas_010` **A Sloth Doing Taxes** : Filed on time, which surprised everyone, including the sloth. Colours: body #cfeec4. Sock body #cfeec4.

### Impossible Socks (impossible)

- `hero_impossible_001` **Somehow Still Clean** : It has been in every Load for years and has never once needed to be. Colours: glint #ebb54b, glintEdge #c28a2c, shine #ffffff, suds #d9ebf4, rim #5d9cc6. Sock body #f7f2e4.
- `hero_impossible_002` **The Sock With No Inside** : You can turn it inside out all afternoon, and it will politely stay exactly the same. Colours: coral #ee8a69, body #3e2b4e, cream #f5e8cf. Sock body #3e2b4e.
- `hero_impossible_003` **Knitted From a Clear Night** : Look long enough and its brightest stars make the shape of a sock, which it insists is a coincidence. Colours: moonGlow #2b3466, moon #f6e7bd. Sock body #1a2150.

### Local Creature Report (local-creature-report)

- `hero_creature_001` **Porch Camera Blur** : Moved too fast to become evidence. Colours: frame #d7dddb, blur #cfd6d3, eye #ecce60, stamp #a6b0b4. Sock body #4f5d67.
- `hero_creature_002` **Tall Thing by the Treeline** : Was a stump until it changed locations. Colours: tree #26372e, thing #cbbd98, knot #7a6a4c, eye #1d241f. Sock body #7f917c.
- `hero_creature_003` **Lake Neck at Dusk** : Could be a log. The log has posture. Colours: sun #e3a15c, body #456d78, water #7aa7b2, neck #1f343b. Sock body #456d78.
- `hero_creature_004` **Moth at the Streetlight** : Much larger in memory. Colours: glow #5d5a52, lamp #f0d27a, moth #d8caa4, ink #4a4232, moth2 #b8a67c. Sock body #2e3344.
- `hero_creature_005` **Three Toed Mud Print** : The fourth toe declined comment. Colours: mud #4c3d2e. Sock body #9a866c.
- `hero_creature_006` **Cornfield Eyes** : The corn is not known for eye contact. Colours: gap #3a3a22, corn #6a7a30, eye #f6de5e, pupil #1f1f1f. Sock body #c2a94e.
- `hero_creature_007` **Winged Shape Over the Bridge** : Traffic slowed. Nobody discussed why. Colours: moon #ddd6c4, wing #1a1420, light #eec060, bridge #a2968a. Sock body #4c3a58.
- `hero_creature_008` **Antlers Behind the Shed** : Only the antlers stayed for the photograph. Colours: antler #e2d9bf, roof #4f372b, ink #3b2a20, shed #8a6048, door #5e4232. Sock body #6d735f.
- `hero_creature_009` **Something in the Culvert** : Politely waited for the headlights to pass. Colours: pipe #a4a8a0, dark #16181a, eye #f0cc5e, water #7fa4b0. Sock body #566247.
- `hero_creature_010` **Snowbank That Blinked** : The second blink felt unnecessarily personal. Colours: snow #f8faf9, shadow #b5c4cc, eye #2f3433. Sock body #8ea7b8.

### Office Kitchen Evidence (office-kitchen-evidence)

- `hero_office_001` **Mug in the Sink Since Monday** : Nobody recognizes it. Everybody recognizes it. Colours: sink #aeb7ba, ink #34424a, mug #6f9ca3, rim #4d7c84. Sock body #d7e1df.
- `hero_office_002` **Reply All at 4:58** : Could have been tomorrow. Colours: paper #fbfaf5, ink #45505a, red #c85b55. Sock body #edf0e9.
- `hero_office_003` **Someone's Yogurt, Ancient** : The date has become a suggestion. Colours: cup #f6f3ea, ink #556150, lid #899b7a, mold #8c8a80. Sock body #d5e7d2.
- `hero_office_004` **The Good Stapler** : Lives in a drawer for its own protection. Colours: metal2 #9ea4a8, ink #22262d, metal #c7cbcd. Sock body #4e5663.
- `hero_office_005` **Conference Room Pretzels** : The bowl outlived the meeting. Colours: pretzel #8a5634, salt #fbf3e0. Sock body #e8d3a8.
- `hero_office_006` **Printer Says Paper Jam** : There is no paper jam. Colours: paper #fbf9f2, ink #30353b, printer #7d858b, warn #e0a63c. Sock body #c9ced1.
- `hero_office_007` **Fridge Note in All Caps** : It is about the milk. Colours: note #f2d860, ink #30343a, tape #dccaa0. Sock body #e3e8e6.
- `hero_office_008` **Desk Snack Emergency** : Three almonds would have fixed everything. Colours: bag #e0c060, ink #4a2f22, crumb #f4e6c6. Sock body #8e5f4a.
- `hero_office_009` **Calendar Invite: Mysterious** : Accepted by twelve people. Understood by none. Colours: white #f6f2e8, ink #2c3a4c, red #c85f5c, green #5f9a6c. Sock body #5d7693.
- `hero_office_010` **The Refrigerator Lunch Heist** : The container was clearly labeled. Colours: box #dccdab, ink #2e1a20, lid #b6a37a, label #f7f2e8, red #d8574f. Sock body #5b3440.

### Pet Hair Counts as Fiber (pet-hair-fiber)

- `hero_pet_001` **Orange Cat at 3 A.M.** : Has a meeting in the hallway. Attendance required. Colours: night #273043, cat #e07830, eye #f7dc4e. Sock body #f1d09a.
- `hero_pet_002` **Dog Waiting by the Door** : Heard a car. Could be yours. Probably yours. Colours: door #6b8f71, ink #3e2a1d, knob #e8c46a, dog #7a5238, collar #d0474a. Sock body #e0d1ba.
- `hero_pet_003` **Fur on Fresh Laundry** (PATTERN, no decal needed) : Arrived before the folding was finished. Colours: fur #f3e7d2, fur2 #b7a58e. Sock body #22252a.
- `hero_pet_004` **Rabbit With One Forbidden Cord** : Was told no. Heard maybe. Colours: cord #252525, rabbit #fdfbf7, ink #7a5a52, warn #b8322a. Sock body #e2b3a8.
- `hero_pet_005` **Aquarium Gravel Collector** : Carries three pebbles home every single time. Colours: fish #f3a44a, ink #2c4f52, gravel #756b5a, gravel2 #9a8e75, bubble #e8f7f6. Sock body #5ca3a8.
- `hero_pet_006` **The Paw on Your Face** : Personal space was reviewed and declined. Colours: paw #7f6b5f, toe #e2a0a0. Sock body #efe5d5.
- `hero_pet_007` **Cat in the Empty Box** : The box became occupied before it became empty. Colours: cat #2b282e, eye #f0d04e, box #c28a52, ink #3a2716, flap #d9a468. Sock body #4f6a7a.
- `hero_pet_008` **Bird Watching You Back** : Has logged you in a very small notebook. Colours: branch #795b42, bird #385b53, eye #f7d35e, ink #1d2b27. Sock body #bfd6c2.
- `hero_pet_009` **The Good Blanket Spot** : Warm. Indented. Currently unavailable. Colours: blanket #dcc8e3, ink #3a2833, fold #b79fc2, pet #3f2c38. Sock body #7d657f.
- `hero_pet_010` **One White Hair** : There is always exactly one. Colours: hair #fffdf8. Sock body #15171b.

### Plant Parent Support Group (plant-parents)

- `hero_plant_001` **One Leaf Left** : It is fine. It is going to be fine. Colours: pot #c07a4a, ink #3d4a33, soil #5a4230, stem #6f9a5a, leaf #8fbe6a. Sock body #e6ded0.
- `hero_plant_002` **Watered Twice Today** (PATTERN, no decal needed) : Nobody told the other one. Colours: drop #5aa8d8, ink #2f4a58. Sock body #a8c8d8.
- `hero_plant_003` **Mystery Seedling** : Something is coming up. Nobody planted anything. Colours: soil #7a5c40, ink #2f4022, sprout #4f8a3a. Sock body #e4e8d4.
- `hero_plant_004` **Terracotta Everything** (PATTERN, no decal needed) : They all match now. It was not cheap. Colours: pot #c86b3c, ink #4a2a14, rim #a04e26. Sock body #f0e2d2.
- `hero_plant_005` **Bright Indirect Light** (PATTERN, no decal needed) : The single most requested thing in this house. Colours: ray #b8740e, ink #5a3a06. Sock body #f4dc7c.
- `hero_plant_006` **Propagation Station** (PATTERN, no decal needed) : Six jars on a windowsill and a lot of hope. Colours: glass #9cc3cf, ink #274a44, water #4f94b0, stem #3f6a2c, leaf #4f8a36. Sock body #eef4f2.
- `hero_plant_007` **Leaf Shine Wipe Day** (PATTERN, no decal needed) : Every leaf, one at a time, with a soft cloth. Colours: leaf #8fbe6a, ink #2a4028, shine #e8f4d8. Sock body #4a6a4a.
- `hero_plant_008` **Definitely Not Overwatering** : The label says once a fortnight. The label is wrong. Colours: can #3f7aa8, ink #1a3448, spout #2f5f86, drop #4aa0d8. Sock body #e8eef4.
- `hero_plant_009` **The One That Flowered** (PATTERN, no decal needed) : Once, in the third year, and never again. Colours: petal #f0a8c8, ink #2a2a3c, heart #f2d05a, leaf #6f9a5a. Sock body #3a3a52.
- `hero_plant_010` **Support Group Tuesday** : Bring your worst one. Nobody is judging. Colours: pot1 #c07a4a, ink #2d3a23, leaf #3f6a30, pot2 #6f93b3, pot3 #8674a8, dead #8a7050. Sock body #bcd0ae.

### Uncle Energy (uncle-energy)

- `hero_uncle_001` **Two Stripe Tube** : Came in a bag of twelve and fits every foot in the family equally badly. Colours: body #f3f0e8, accent #c8382f, accent2 #24407e. Sock body #f3f0e8.
- `hero_uncle_002` **The Grill Master** : Has never once been inside. Colours: flame #f3922b, flame2 #ffd45a, meat #8a3f22, accent2 #2f2b28, steel #9aa1a6. Sock body #a3d0e6.
- `hero_uncle_003` **World's Okayest** : Did its best, and its best was fine. Colours: accent2 #2f62b3, gold2 #c9951f, accent #f0c24b, ink #22304f. Sock body #9ea4ab. The word on it: "OK".
- `hero_uncle_004` **Lawn Chair Plaid** : Folds flat for storage and pinches you exactly once a summer. Colours: patch #fbf6ea, accent2 #e8702c, aluDark #6c747c, alu #b9c0c7, body #f4d35e. Sock body #f4d35e.
- `hero_uncle_005` **Bait Shop Shades** : Camouflaged so well that it has been missing from the drawer since June. Colours: line #1c1c1c, white #f4f1e8, red #d7362c. Sock body #6f7a43.
- `hero_uncle_006` **Calf Sock Under Sandals** : Pulled all the way up, exactly as the sandals intended. Colours: accent2 #5c3a1e, buckle #d9b24a. Sock body #f7f6f1.
- `hero_uncle_007` **Dad's Golf Diamond** : Would love to walk you through all eighteen holes, one stroke at a time. Colours: tee #e0a458, accent2 #1f2f5c, dimple #c9ccd2, ball #f7f6f1. Sock body #3a9a5b.
- `hero_uncle_008` **Thanksgiving Tie Print** (PATTERN, no decal needed) : Bought to match the tie, which was bought to get a laugh at dinner. Colours: f1 #e0612f, f2 #f3a23a, f3 #f7d35e, tbody #c07f45, tedge #3a1219, beak #f3c34a, wattle #d33a2c, ink #2a1410. Sock body #5e1f2b.
- `hero_uncle_009` **The Church Sock** : The good pair, saved for Sundays, weddings and meeting someone's parents. Colours: gold #d8b04c, red #d2383a, blue #3b6fd6, amber #f0a93a, green #3aa864, body #1d1c23. Sock body #1d1c23.
- `hero_uncle_010` **Bowling Night** : Bowls a hundred and twelve on a good night and owns the shirt anyway. Colours: pin #f7f4ee, stripe #e0303a, accent2 #2fd0c8, hole #0f1128. Sock body #1c1f3f.

