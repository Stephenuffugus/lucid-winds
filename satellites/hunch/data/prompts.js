/* ===================================================================
   HUNCH — prompt database
   Loaded before the main script; exposes window.HUNCH_DECK.
   The game MERGES this into its built-in deck (dedup) at boot, so this
   file can grow as large as you like without touching index.html.

   Tiers:
     1 = concrete / drawable objects, animals, everyday scenes & mini-situations
     2 = abstract feelings, emotions, moods, intangible states
     3 = absurd / surreal / funny / meta / internet-flavoured concepts

   Rules of thumb for adding prompts:
     - Drawable in ~50 seconds by a non-artist.
     - Evocative and specific (a "situation" beats a bare noun).
     - Family-friendly. Vary the subject matter widely.
   Selection is fully randomized with no-repeat-until-exhausted in the engine.
   =================================================================== */
/* ===================================================================
   HUNCH KIDS BANK (Jessie's request, Jul 2026)
   Original prompts written in the spirit of classic Pictionary
   categories: PERSON, PLACE, ANIMAL, OBJECT, ACTION, plus a DIFFICULT
   section in the standard tier. No card list was copied; every entry
   is original wording.

   easy     = things a 7 year old knows and can draw. Single concrete
              subjects only. No idioms, no brands, no abstractions.
   standard = still concrete and drawable, but chewier subjects
              (lighthouse, cactus, telescope, volcano).

   The engine draws tier 1 rounds from these banks, weighted toward
   easy (see KID_EASY_WEIGHT in index.html). Both banks also merge
   into DECK[1] so the seeded Daily rounds 1 and 2 benefit too.
   The AI guesser is open vocabulary (a vision model that can name
   anything), so no separate guess list needs to stay in sync; the
   only rule is that every prompt is a real, physically drawable
   subject, which these all are.
   Keep every entry unique across BOTH arrays (exact string match).
   =================================================================== */
window.HUNCH_KIDS = {
  easy: [
    /* ANIMALS */
    "a dog","a cat","a fish","a bird","a duck",
    "a cow","a pig","a horse","a sheep","a chicken",
    "a rabbit","a mouse","a frog","a turtle","a snake",
    "a monkey","an elephant","a giraffe","a lion","a tiger",
    "a bear","a penguin","an owl","a bee","a ladybug",
    "a butterfly","a spider","a snail","a shark","a whale",
    "a dolphin","a crab","a bat","a dinosaur","a unicorn",
    "a worm",
    /* PEOPLE */
    "a king","a queen","a pirate","a clown","a cowboy",
    "a firefighter","a police officer","an astronaut","a doctor","a chef",
    "a ballerina","a superhero","a witch","a mermaid","a knight",
    "a baby",
    /* PLACES */
    "a house","a castle","a farm","a school","a playground",
    "a beach","a mountain","a bridge","a tent","a barn",
    "an island","a swimming pool",
    /* OBJECTS */
    "a ball","a balloon","a kite","a book","a chair",
    "a table","a bed","a door","a window","a clock",
    "a key","a cup","a spoon","a fork","a hat",
    "a shoe","a sock","a crown","a pair of glasses","an umbrella",
    "a ladder","a broom","a candle","a present","a teddy bear",
    "a drum","a bell","a flag","a swing","a slide",
    "a pencil","a crayon","a pair of scissors","a backpack","a toothbrush",
    "a mirror","a lamp","a telephone","a television","a camera",
    "a robot","a bucket",
    /* FOOD */
    "an apple","a banana","an orange","a bunch of grapes","a strawberry",
    "a carrot","an ear of corn","a pizza","a hamburger","a hot dog",
    "an egg","a sandwich","a cookie","a cupcake","a birthday cake",
    "an ice cream cone","a lollipop","a candy cane","a bag of popcorn","a pretzel",
    "a slice of cheese","a watermelon","a donut","a pie",
    /* NATURE */
    "the sun","the moon","a star","a cloud","a rainbow",
    "a snowflake","a snowman","a tree","a flower","a leaf",
    "an acorn","a pumpkin","a mushroom","an ocean wave","a puddle",
    "a bird nest","a lightning bolt",
    /* VEHICLES */
    "a car","a bus","a truck","a firetruck","a train",
    "an airplane","a helicopter","a rocket ship","a sailboat","a bicycle",
    "a tractor","a police car","an ambulance","a race car","a school bus",
    /* ACTIONS */
    "jumping rope","riding a bike","flying a kite","brushing your teeth","blowing out birthday candles",
    "swimming","dancing","sleeping in bed","going fishing","painting a picture",
    "playing soccer","climbing a tree","sledding down a hill","kicking a ball","reading a book",
    "giving a hug"
  ],
  standard: [
    /* PEOPLE */
    "a magician","a scuba diver","a tightrope walker","a juggler","a mad scientist",
    "a rock star","a referee","a viking","a mummy","a skeleton",
    "a genie","a scarecrow","a lumberjack","a lifeguard","a mail carrier",
    "a marching band",
    /* PLACES */
    "a lighthouse","a pyramid","a desert island","a suspension bridge","a drawbridge",
    "a water tower","a merry-go-round","a skyscraper","a fountain","a corn maze",
    "a cave","a canyon","an iceberg","a coral reef","a jungle",
    "a swamp","a train station","a harbor","a ski slope","a volcano",
    "a waterslide","a wishing well",
    /* ANIMALS */
    "a peacock","a flamingo","a toucan","a pelican","a hummingbird",
    "a woodpecker","a seahorse","a starfish","a stingray","a swordfish",
    "a lobster","a hermit crab","a walrus","a seal","a sea otter",
    "a beaver","a porcupine","a skunk","a raccoon","a moose",
    "a reindeer","a camel","a kangaroo","a koala","a sloth",
    "a chameleon","an anteater","an armadillo","a rhinoceros","a hippopotamus",
    "an ostrich","a scorpion","a dragonfly","a grasshopper","a hedgehog",
    /* OBJECTS */
    "a telescope","a microscope","a magnifying glass","an hourglass","a compass",
    "an anchor","a treasure chest","a cannon","a catapult","a suit of armor",
    "a sword and shield","a bow and arrow","a fishing rod","a lantern","a cauldron",
    "a crystal ball","a globe","a treasure map","a pair of binoculars","a stethoscope",
    "a rake","a hammer","a saw","a screwdriver","a wrench",
    "a toolbox","an easel","a harp","a trumpet","a violin",
    "a saxophone","a tuba","an accordion","a xylophone","a harmonica",
    "a grandfather clock","a cuckoo clock","a chandelier","a periscope","a parachute",
    "a jetpack","a pogo stick","a pair of stilts","a unicycle","a trampoline",
    "a birdhouse","a mousetrap","a snowplow",
    /* VEHICLES */
    "a cement mixer","a crane","a bulldozer","a canoe","a kayak",
    "a sleigh","a covered wagon",
    /* ACTIONS */
    "milking a cow","rock climbing","ice skating","skiing downhill","snowboarding",
    "surfing","bowling a strike","shooting an arrow at a target","doing a cartwheel","walking a dog",
    "raking leaves","shoveling snow","mowing the lawn","flipping a pancake","blowing a bubble with gum",
    "riding a horse",
    /* DIFFICULT (still concrete and drawable) */
    "a solar eclipse","a constellation","a comet","a tornado","a geyser",
    "a sand dune","a tumbleweed","an avalanche","a whirlpool","a fossil",
    "a dinosaur skeleton","an ant hill","a wasp nest","a caterpillar turning into a butterfly","a beaver dam",
    "a spiderweb","a hall of mirrors","a house of cards","a knight fighting a dragon","a cactus"
  ]
};

window.HUNCH_DECK = {
  1: [
    "a thunderstorm","a smug cat","warm bread fresh from the oven","running late","a haunted house",
    "a paper airplane","a traffic jam","a birthday surprise","a tangled pair of headphones","a sandcastle at high tide",
    "a cat knocking something off a table","the last slice of pizza","a melting ice cream cone","a spider in the bathtub","a lighthouse in fog",
    "a hot air balloon","a broken umbrella in the wind","a campfire at night","a cat stuck in a cardboard box","a dog chasing its own tail",
    "a field of sunflowers","a treehouse","a message in a bottle","a snow globe","a robot vacuum stuck in a corner",
    "a leaky faucet","a tall stack of pancakes","a shooting star","a rocket launch","a submarine",
    "a city skyline at sunset","a ferris wheel","a vending machine","a goldfish in a bowl","a wilting houseplant",
    "an overflowing laundry basket","a slice of watermelon","a beehive","an octopus","a hedge maze",
    "a roller coaster","a candle burning low","a kite stuck in a tree","a piggy bank","a jack-in-the-box",
    "an igloo","a waterfall","a cactus in the desert","a snowman melting","a busy ant colony",
    "a clock striking midnight","a hammock between two trees","an old typewriter","a bowl of spaghetti","a single shoe in the road",
    "a bird building a nest","a rain cloud following one person","a row of falling dominoes","a hamster on a wheel","a sinking rowboat",
    "a crowded elevator","a spilled cup of coffee","a paper boat in a puddle","a UFO over a barn","a teetering stack of books",
    "a frog on a lily pad","a windmill","a mailbox stuffed full of letters","a flat bicycle tire","a jar of fireflies",
    "a lighthouse keeper waving","a turtle wearing a tiny hat","a snail racing a cheetah","a stack of pancakes toppling","a pirate ship in a bottle",
    "a cat in a fishbowl helmet","a dog wearing sunglasses","a penguin on a surfboard","a giraffe in an elevator","an elephant on a unicycle",
    "a tiny house on a hill","a row of rubber ducks","a melting birthday candle","a half-eaten apple","a broken pencil",
    "a pair of dice mid-roll","a chess board mid-game","a slice of cake with one candle","a treasure map with an X","a fork in the road",
    "a ladder leaning on the moon","a fishing boat at dawn","a scarecrow in a cornfield","a swing set in the rain","a sunflower turning to the sun",
    "a dog digging a hole","a cat batting at yarn","a mouse stealing cheese","a bee landing on a flower","a butterfly on a fingertip",
    "a snail leaving a trail","a spider spinning a web","an owl on a branch at night","a fox sneaking through grass","a deer at the edge of a forest",
    "a whale breaching the ocean","a dolphin jumping a wave","a shark fin above water","a jellyfish drifting","a crab on the beach",
    "a sandcastle with a flag","a beach ball rolling away","a surfer riding a wave","a kite festival","a campervan on a road trip",
    "a tent under the stars","a roasting marshmallow","a flashlight in the dark","a compass pointing north","a backpack full of gear",
    "a mountain peak in clouds","a river winding through hills","a covered bridge","a barn with a weathervane","a tractor in a field",
    "a scarecrow losing its hat","a pumpkin patch","a maple leaf falling","a pile of autumn leaves","a snow-covered pine tree",
    "an icicle dripping","a steaming mug of cocoa","a pair of mittens","a sled going downhill","a frozen pond with skaters",
    "a streetlight in the rain","a city bus at a stop","a subway train arriving","a taxi in the rain","a bicycle leaning on a wall",
    "a skateboard mid-trick","a basketball going through a hoop","a soccer ball in a net","a tennis racket and ball","a baseball glove and ball",
    "a guitar leaning on an amp","a drum set","a grand piano","a microphone on a stand","a vinyl record spinning",
    "a pair of headphones on a desk","a laptop with too many tabs","a phone with a cracked screen","a game controller","a stack of pizza boxes",
    "a burger with everything","a hot dog with mustard","a taco overflowing","a sushi roll on a plate","a bowl of ramen",
    "a cup of bubble tea","a donut with sprinkles","a scoop of ice cream falling","a birthday cake with candles","a gingerbread house",
    "a teapot pouring tea","a coffee machine brewing","a blender mid-smoothie","a toaster popping toast","a frying egg",
    "a clothesline with socks","a watering can over flowers","a garden gnome","a wheelbarrow of soil","a picket fence",
    "a front door with a wreath","a chimney with smoke","a window with curtains","a staircase spiraling up","a rocking chair on a porch"
  ],
  2: [
    "homesickness","the moment before a sneeze","jazz","deja vu","an awkward silence",
    "stage fright","falling in love","overthinking everything","the color of a Sunday afternoon","a held breath",
    "the end of summer","nostalgia","loneliness in a crowded room","a guilty conscience","courage",
    "the smell of rain","hope","pure exhaustion","relief","jealousy",
    "the feeling of being watched","anticipation","a fresh start","regret","contentment",
    "creeping anxiety","the calm after a storm","butterflies in your stomach","a second wind","writer's block",
    "the urge to leave a party early","missing someone","quiet pride","embarrassment","curiosity",
    "crushing boredom","a sugar rush","the silence after an argument","a warm welcome","the dread of Monday",
    "the joy of an empty schedule","mental fog","a gut feeling","inner peace","restlessness",
    "the comfort of routine","fear of the dark","a sense of wonder","the weight of a secret","freedom",
    "coming home","the ache of an old memory","stubborn optimism","suspense","frustration with technology",
    "the warmth of forgiveness","a creative spark","a bad omen","gratitude","longing",
    "the rush of a deadline","tranquility","the spark of recognition","melancholy","euphoria",
    "the quiet of early morning","a guilty pleasure","the thrill of the first snow","impatience","being pleasantly surprised",
    "the comfort of an old sweater","the panic of a forgotten name","the relief of a deep breath","the buzz of a good idea","the slump after a holiday",
    "the warmth of being understood","the sting of being left out","the pride of finishing something","the dread of an alarm clock","the peace of a finished to-do list",
    "the itch to start over","the weight of unsaid words","the lightness of letting go","the pull of an old song","the hush before applause",
    "the comfort of a familiar voice","the chill of a bad decision","the glow of a compliment","the fog of too little sleep","the spark of a new crush",
    "the ache of saying goodbye","the thrill of a green light","the calm of floating on water","the heat of an argument","the cool of forgiveness",
    "the flutter of first-day nerves","the relief of a passed test","the satisfaction of a clean room","the pang of an empty fridge","the joy of a snow day",
    "the dread of public speaking","the comfort of a rainy day indoors","the rush of a roller coaster drop","the silence of a snowfall","the warmth of a campfire circle",
    "the weight of a long week","the lightness of Friday afternoon","the ache of a missed chance","the thrill of an open road","the quiet of a library",
    "the spark before a kiss","the dread of a dentist chair","the comfort of being home alone","the buzz of a crowd","the hush of falling asleep",
    "the relief of an apology accepted","the sting of a paper cut","the joy of finding money in a pocket","the dread of a buffering screen","the calm of a slow morning",
    "the thrill of a surprise party","the weight of expectations","the warmth of a thank-you note","the chill of a ghost story","the glow of golden hour",
    "the panic of a near miss","the comfort of a weighted blanket","the ache of growing up","the spark of inspiration at 2am","the peace of a finished journey"
  ],
  3: [
    "the number 7, but smug","gravity giving up for a second","your future self waving at you","an introvert at a house party","the wifi going down mid-sentence",
    "a plot twist","time travel gone slightly wrong","the universe quietly expanding","an idea arriving at 3am","a bad pun landing",
    "Monday morning as a creature","the internet as a single object","a Tuesday that thinks it's Friday","the concept of 'later'","autocorrect ruining a text",
    "a meeting that should've been an email","the sound of one hand clapping","a cat planning world domination","your phone battery at 1%","your last brain cell at 5pm",
    "Schrödinger's lunch","waving back at someone who wasn't waving at you","a group project where no one helped","the snooze button as a villain","a password you forgot",
    "the spinning loading wheel of doom","a sock that vanished in the dryer","small talk in an elevator","realizing you left the stove on","a meme becoming sentient",
    "the heat death of the universe, but cozy","an AI dreaming","the number zero feeling lonely","infinity taking a coffee break","the ghost of a deleted file",
    "a typo full of confidence","the void staring back","a robot learning to love","existential dread, but make it cute","the concept of nothing",
    "a black hole on a diet","time running backwards","your reflection doing its own thing","a sentient houseplant judging you","the universe's customer service line",
    "a glitch in reality","a word losing all meaning when repeated","an emoji come to life","a song stuck in your head","the abstract notion of 'vibes'",
    "a thought you can't quite finish","Wednesday having an identity crisis","gravity on its day off","a calendar with too many appointments, crying","Monday cosplaying as Friday",
    "a decimal point that wandered off","a semicolon's existential crisis","the last cookie's final stand","a Roomba achieving enlightenment","a printer that smells fear",
    "an autocorrect with a vendetta","a group chat at 3am","a notification that won't go away","the 'are you still watching?' screen judging you","a loading bar stuck at 99%",
    "a Wi-Fi signal having stage fright","an inbox at 9,999 unread","a tab you're afraid to close","a software update at the worst time","a captcha that doubts your humanity",
    "the cloud, but it's actually a real cloud","a hard drive hoarding memories","a deleted file in the afterlife","a cursor that lost its way","a keyboard missing one key",
    "the feeling of a word on the tip of your tongue","Tuesday pretending nothing happened","a coin that can't decide","a dice roll holding its breath","a shadow taking the day off",
    "an echo that talks back","a mirror that's running late","a clock that's given up","a map of nowhere","a door to the same room",
    "a staircase that loops forever","a hallway that's slightly too long","an elevator between two floors that don't exist","a vending machine that only takes feelings","an ATM dispensing advice",
    "a GPS having a breakdown","a smart fridge with opinions","a toaster planning revenge","a microwave counting down to chaos","a dishwasher dreaming of the sea",
    "a Monday that overslept","a weekend that ended too soon","the math you do at a restaurant","a brain at the gym","a heart skipping a beat, literally",
    "a yawn that's contagious across a room","a sneeze that never arrives","a thought leaving the building","a memory wearing a disguise","an idea that escaped",
    "a pixel that wants to be free","a 404 page feeling lost","a buffering video meditating","a screenshot of a feeling","a low-battery icon begging",
    "the moon photobombing the sun","a star that overslept","a comet running late","a planet that forgot its orbit","a galaxy doing a spin",
    "an hourglass on its last grain","a candle racing the dark","a snowflake refusing to be unique","a raindrop afraid of heights","a puddle reflecting the wrong sky"
  ]
};
