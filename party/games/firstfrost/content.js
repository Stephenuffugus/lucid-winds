/* FIRST FROST TRIVIA BANK

   Ordinary multiple choice trivia. In this game the trivia is the BACKDROP and
   the Frost console is the headline, so these questions are built to be fair and
   quick to read rather than fiendish. A question nobody can answer is not a
   knockout, it is a stalemate.

   ⭐ FORMAT RULE: options[0] is ALWAYS the correct answer. The game shuffles the
   options before showing them, so an author can never mismatch an answer to an
   index and a reviewer can audit a line by reading it left to right.

   Regenerate or extend with this exact prompt, then hand-audit every entry:

   "Write N multiple choice trivia questions for a family party knockout game.
   Rules: the question is one sentence under 95 characters. Four options, each
   under 30 characters. The first option must be the correct one. The three
   wrong options must be plainly wrong to somebody who knows the answer, and
   plausible to somebody who does not. General audience, no politics, no
   religion, no bodies, no violence, no brand names, NO DASH CHARACTERS OF ANY
   KIND. Difficulty should sit where roughly half a room of adults would get it
   right. Include a short recognizable source name. Output a JS array of objects
   with fields id, q, options, category, source. Categories: animals, space,
   food, history, science, world, words, plants."

   AUDIT RULE: check every answer against its named source before committing,
   and check that no wrong option is also defensible.

   Launch bank 2026-08-08: 40 entries. */
window.FIRSTFROST_BANK = [
  {id:'ff-t001', q:'Which planet has the shortest day in our solar system?', options:['Jupiter','Mercury','Mars','Neptune'], category:'space', source:'NASA'},
  {id:'ff-t002', q:'What is the largest living structure on earth?', options:['The Great Barrier Reef','The Amazon rainforest','A giant sequoia','The Sahara'], category:'nature', source:'Britannica'},
  {id:'ff-t003', q:'Which of these is a fruit in botanical terms?', options:['Cucumber','Celery','Rhubarb','Lettuce'], category:'plants', source:'Kew Gardens'},
  {id:'ff-t004', q:'How many strings does a standard violin have?', options:['Four','Six','Five','Eight'], category:'world', source:'Britannica'},
  {id:'ff-t005', q:'Which ocean is the deepest?', options:['Pacific','Atlantic','Indian','Arctic'], category:'world', source:'NOAA'},
  {id:'ff-t006', q:'What do you call a group of crows?', options:['A murder','A parliament','A gaggle','A pride'], category:'words', source:'Merriam-Webster'},
  {id:'ff-t007', q:'Which metal is liquid at room temperature?', options:['Mercury','Aluminium','Zinc','Nickel'], category:'science', source:'Royal Society'},
  {id:'ff-t008', q:'Roughly how long does light take to travel from the Sun to earth?', options:['Eight minutes','Eight seconds','Eight hours','Eight days'], category:'space', source:'NASA'},
  {id:'ff-t009', q:'Which country has the most time zones?', options:['France','Russia','The United States','China'], category:'world', source:'Britannica'},
  {id:'ff-t010', q:'What is the hardest natural substance on earth?', options:['Diamond','Quartz','Steel','Granite'], category:'science', source:'USGS'},
  {id:'ff-t011', q:'Which animal has the longest recorded lifespan?', options:['Ocean quahog clam','Galapagos tortoise','Blue whale','Elephant'], category:'animals', source:'National Geographic'},
  {id:'ff-t012', q:'What is the main ingredient in traditional hummus?', options:['Chickpeas','Lentils','White beans','Peas'], category:'food', source:'Britannica'},
  {id:'ff-t013', q:'Which of these instruments has the lowest range?', options:['Tuba','Trumpet','Clarinet','Flute'], category:'world', source:'Britannica'},
  {id:'ff-t014', q:'What is the largest desert on earth by area?', options:['Antarctica','The Sahara','The Gobi','The Arabian'], category:'world', source:'Britannica'},
  {id:'ff-t015', q:'Which gas makes up most of the air you are breathing?', options:['Nitrogen','Oxygen','Carbon dioxide','Argon'], category:'science', source:'NOAA'},
  {id:'ff-t016', q:'How many keys does a standard full size piano have?', options:['Eighty eight','Sixty one','Seventy six','One hundred'], category:'world', source:'Britannica'},
  {id:'ff-t017', q:'Which bird can fly backwards?', options:['Hummingbird','Swift','Kingfisher','Wren'], category:'animals', source:'Audubon'},
  {id:'ff-t018', q:'What was the first food eaten in space?', options:['Apple sauce','A sandwich','Chocolate','Dried beef'], category:'space', source:'NASA'},
  {id:'ff-t019', q:'Which sea has no coastline at all?', options:['The Sargasso Sea','The Coral Sea','The Baltic Sea','The Bering Sea'], category:'world', source:'NOAA'},
  {id:'ff-t020', q:'How many bones are in an adult giraffe neck?', options:['Seven','Twelve','Twenty','Thirty two'], category:'animals', source:'Britannica'},
  {id:'ff-t021', q:'Which of these was invented first?', options:['The fax machine','The telephone','The radio','The lightbulb'], category:'history', source:'Smithsonian'},
  {id:'ff-t022', q:'What colour is a polar bear skin under its fur?', options:['Black','White','Pink','Grey'], category:'animals', source:'National Geographic'},
  {id:'ff-t023', q:'Which spice comes from a crocus flower?', options:['Saffron','Turmeric','Paprika','Cumin'], category:'food', source:'Kew Gardens'},
  {id:'ff-t024', q:'What is the tallest type of grass?', options:['Bamboo','Sugar cane','Pampas grass','Rye'], category:'plants', source:'Kew Gardens'},
  {id:'ff-t025', q:'Which planet spins on its side compared with the others?', options:['Uranus','Saturn','Venus','Mars'], category:'space', source:'NASA'},
  {id:'ff-t026', q:'What does a philatelist collect?', options:['Stamps','Coins','Butterflies','Maps'], category:'words', source:'Oxford English Dictionary'},
  {id:'ff-t027', q:'Which is the only continent with no active volcanoes?', options:['Australia','Europe','Africa','South America'], category:'world', source:'USGS'},
  {id:'ff-t028', q:'How many hearts does an earthworm have?', options:['Five','One','Two','None'], category:'animals', source:'Britannica'},
  {id:'ff-t029', q:'What is dry ice made of?', options:['Carbon dioxide','Water','Nitrogen','Ammonia'], category:'science', source:'Royal Society'},
  {id:'ff-t030', q:'Which country gave the world the sandwich name?', options:['England','France','Germany','Italy'], category:'food', source:'Britannica'},
  {id:'ff-t031', q:'What is the study of fungi called?', options:['Mycology','Botany','Entomology','Geology'], category:'words', source:'Merriam-Webster'},
  {id:'ff-t032', q:'Which is the smallest country in the world by area?', options:['Vatican City','Monaco','San Marino','Malta'], category:'world', source:'Britannica'},
  {id:'ff-t033', q:'How long is a single day on Mars, roughly?', options:['Twenty four and a half hours','Ten hours','Forty hours','Twelve hours'], category:'space', source:'NASA'},
  {id:'ff-t034', q:'Which nut is used to make marzipan?', options:['Almond','Walnut','Hazelnut','Cashew'], category:'food', source:'Britannica'},
  {id:'ff-t035', q:'What is the loudest animal on earth?', options:['Sperm whale','Lion','Howler monkey','Elephant'], category:'animals', source:'National Geographic'},
  {id:'ff-t036', q:'Which of these is not a real cloud type?', options:['Stratofog','Cirrus','Cumulus','Nimbostratus'], category:'science', source:'Met Office'},
  {id:'ff-t037', q:'How many sides does a standard pencil usually have?', options:['Six','Four','Eight','Five'], category:'world', source:'Britannica'},
  {id:'ff-t038', q:'Which tree produces acorns?', options:['Oak','Beech','Maple','Ash'], category:'plants', source:'Kew Gardens'},
  {id:'ff-t039', q:'What was the first item sold over the internet?', options:['A book','A record','A pizza','A watch'], category:'history', source:'Smithsonian'},
  {id:'ff-t040', q:'Which body of water is the saltiest?', options:['The Dead Sea','The Red Sea','The Mediterranean','The Caspian Sea'], category:'world', source:'Britannica'}
];
