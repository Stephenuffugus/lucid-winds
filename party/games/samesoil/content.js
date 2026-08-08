/* SAME SOIL PAIR BANK

   One player is the subject. They pick which of two things is more them. The
   rest of the room predicts what they picked. The subject's own answer is the
   only authority, so nobody can ever be told they are wrong about themselves.

   ⚖ THE ART DECISION, RECORDED. WHACKBOX_PLAN specs this title with roughly 720
   small illustrations, and the art pipeline is the critical path. So v1 ships
   with AUTHORED WORD PAIRS instead: two or three words a side, large on the TV,
   which is readable at ten feet and costs nothing. Illustrations are an upgrade
   that drops straight into the same bank as an `art` field per side. Shipping
   the words first means the game exists while the art is drawn, and it means
   the pairs get playtested before anybody paints 720 of anything.

   Regenerate or extend with this exact prompt, then hand-audit every entry:

   "Write N either or pairs for a cozy family party game where players guess
   which one somebody prefers. Each side is one to three words under 22
   characters. The two sides must be genuinely balanced, so a room would split
   on them. General audience, safe for a grandparent and an eight year old.
   NOTHING about money, appearance, weight, health, bodies, romance,
   relationships, politics, religion or alcohol, and nothing where one answer
   makes a person look bad. No brand names. No dash characters of any kind.
   Output a JS array of objects with fields id, a, b, category. Categories:
   places, food, weather, animals, time, comfort, adventure, senses."

   AUDIT RULE: for each pair ask whether either side could embarrass the person
   who picks it. If yes, cut it. This game only works because answering is safe.

   Launch bank 2026-08-08: 96 pairs. */
window.SAMESOIL_BANK = [
  {id:'ss-0001', a:'Mountains',        b:'The sea',            category:'places'},
  {id:'ss-0002', a:'Sunrise',          b:'Sunset',             category:'time'},
  {id:'ss-0003', a:'Tea',              b:'Coffee',             category:'food'},
  {id:'ss-0004', a:'Cats',             b:'Dogs',               category:'animals'},
  {id:'ss-0005', a:'Rain on a roof',   b:'Wind in trees',      category:'senses'},
  {id:'ss-0006', a:'Sweet',            b:'Salty',              category:'food'},
  {id:'ss-0007', a:'A big city',       b:'A small village',    category:'places'},
  {id:'ss-0008', a:'Summer',           b:'Winter',             category:'weather'},
  {id:'ss-0009', a:'A window seat',    b:'An aisle seat',      category:'adventure'},
  {id:'ss-0010', a:'Early bird',       b:'Night owl',          category:'time'},
  {id:'ss-0011', a:'Books',            b:'Films',              category:'comfort'},
  {id:'ss-0012', a:'A long bath',      b:'A quick shower',     category:'comfort'},
  {id:'ss-0013', a:'Forest',           b:'Desert',             category:'places'},
  {id:'ss-0014', a:'Pancakes',         b:'Toast',              category:'food'},
  {id:'ss-0015', a:'Snow',             b:'Sunshine',           category:'weather'},
  {id:'ss-0016', a:'Horses',           b:'Birds',              category:'animals'},
  {id:'ss-0017', a:'A map',            b:'Wander and see',     category:'adventure'},
  {id:'ss-0018', a:'Popcorn',          b:'Chocolate',          category:'food'},
  {id:'ss-0019', a:'Crackling fire',   b:'Ocean waves',        category:'senses'},
  {id:'ss-0020', a:'Camping',          b:'A cosy inn',         category:'adventure'},
  {id:'ss-0021', a:'Autumn leaves',    b:'Spring blossom',     category:'weather'},
  {id:'ss-0022', a:'Handwritten',      b:'Typed',              category:'comfort'},
  {id:'ss-0023', a:'A river',          b:'A lake',             category:'places'},
  {id:'ss-0024', a:'Crunchy',          b:'Soft',               category:'food'},
  {id:'ss-0025', a:'Owls',             b:'Foxes',              category:'animals'},
  {id:'ss-0026', a:'Morning quiet',    b:'Evening quiet',      category:'time'},
  {id:'ss-0027', a:'A big table',      b:'A small table',      category:'comfort'},
  {id:'ss-0028', a:'Soup',             b:'Salad',              category:'food'},
  {id:'ss-0029', a:'Fog',              b:'Frost',              category:'weather'},
  {id:'ss-0030', a:'A train',          b:'A boat',             category:'adventure'},
  {id:'ss-0031', a:'Lemon',            b:'Lime',               category:'food'},
  {id:'ss-0032', a:'Stars',            b:'Clouds',             category:'senses'},
  {id:'ss-0033', a:'A garden',         b:'A balcony',          category:'places'},
  {id:'ss-0034', a:'Butter',           b:'Jam',                category:'food'},
  {id:'ss-0035', a:'Bees',             b:'Butterflies',        category:'animals'},
  {id:'ss-0036', a:'Plan it all',      b:'Decide that day',    category:'adventure'},
  {id:'ss-0037', a:'Thick socks',      b:'Bare feet',          category:'comfort'},
  {id:'ss-0038', a:'A long walk',      b:'A long nap',         category:'time'},
  {id:'ss-0039', a:'Cinnamon',         b:'Vanilla',            category:'senses'},
  {id:'ss-0040', a:'An old house',     b:'A new house',        category:'places'},
  {id:'ss-0041', a:'Peaches',          b:'Berries',            category:'food'},
  {id:'ss-0042', a:'Thunder',          b:'Stillness',          category:'weather'},
  {id:'ss-0043', a:'Turtles',          b:'Otters',             category:'animals'},
  {id:'ss-0044', a:'The front row',    b:'The back row',       category:'comfort'},
  {id:'ss-0045', a:'Bread',            b:'Rice',               category:'food'},
  {id:'ss-0046', a:'A hammock',        b:'An armchair',        category:'comfort'},
  {id:'ss-0047', a:'A cave',           b:'A treehouse',        category:'adventure'},
  {id:'ss-0048', a:'Mint',             b:'Ginger',             category:'senses'},
  {id:'ss-0049', a:'A lighthouse',     b:'A windmill',         category:'places'},
  {id:'ss-0050', a:'Noodles',          b:'Dumplings',          category:'food'},
  {id:'ss-0051', a:'Puddles',          b:'Dry paths',          category:'weather'},
  {id:'ss-0052', a:'Elephants',        b:'Whales',             category:'animals'},
  {id:'ss-0053', a:'One big trip',     b:'Many small trips',   category:'adventure'},
  {id:'ss-0054', a:'Wooden spoons',    b:'Metal spoons',       category:'comfort'},
  {id:'ss-0055', a:'Apples',           b:'Oranges',            category:'food'},
  {id:'ss-0056', a:'A full moon',      b:'No moon at all',     category:'senses'},
  {id:'ss-0057', a:'A meadow',         b:'A cliff top',        category:'places'},
  {id:'ss-0058', a:'Porridge',         b:'Cereal',             category:'food'},
  {id:'ss-0059', a:'A breeze',         b:'Perfect stillness',  category:'weather'},
  {id:'ss-0060', a:'Frogs',            b:'Squirrels',          category:'animals'},
  {id:'ss-0061', a:'Take the stairs',  b:'Take the lift',      category:'time'},
  {id:'ss-0062', a:'A quilt',          b:'A blanket',          category:'comfort'},
  {id:'ss-0063', a:'Olives',           b:'Pickles',            category:'food'},
  {id:'ss-0064', a:'Pine',             b:'Sea air',            category:'senses'},
  {id:'ss-0065', a:'An island',        b:'A valley',           category:'places'},
  {id:'ss-0066', a:'Cake',             b:'Pie',                category:'food'},
  {id:'ss-0067', a:'Grey skies',       b:'Bright glare',       category:'weather'},
  {id:'ss-0068', a:'Deer',             b:'Rabbits',            category:'animals'},
  {id:'ss-0069', a:'Arrive early',     b:'Arrive just in time', category:'time'},
  {id:'ss-0070', a:'A window open',    b:'A window shut',      category:'comfort'},
  {id:'ss-0071', a:'Garlic',           b:'Chilli',             category:'food'},
  {id:'ss-0072', a:'Church bells',     b:'Birdsong',           category:'senses'},
  {id:'ss-0073', a:'A market',         b:'A quiet shop',       category:'places'},
  {id:'ss-0074', a:'Mushrooms',        b:'Peppers',            category:'food'},
  {id:'ss-0075', a:'A misty morning',  b:'A crisp afternoon',  category:'weather'},
  {id:'ss-0076', a:'Hedgehogs',        b:'Badgers',            category:'animals'},
  {id:'ss-0077', a:'Finish it today',  b:'Sleep on it',        category:'time'},
  {id:'ss-0078', a:'A stone floor',    b:'A wooden floor',     category:'comfort'},
  {id:'ss-0079', a:'Honey',            b:'Maple syrup',        category:'food'},
  {id:'ss-0080', a:'Distant thunder',  b:'A close cricket',    category:'senses'},
  {id:'ss-0081', a:'A canal',          b:'A coastline',        category:'places'},
  {id:'ss-0082', a:'Roast potatoes',   b:'Chips',              category:'food'},
  {id:'ss-0083', a:'A hot day',        b:'A cool day',         category:'weather'},
  {id:'ss-0084', a:'Herons',           b:'Kingfishers',        category:'animals'},
  {id:'ss-0085', a:'Front of the bus', b:'Back of the bus',    category:'time'},
  {id:'ss-0086', a:'A candle',         b:'A lamp',             category:'comfort'},
  {id:'ss-0087', a:'Strawberries',     b:'Cherries',           category:'food'},
  {id:'ss-0088', a:'Fresh laundry',    b:'Fresh bread',        category:'senses'},
  {id:'ss-0089', a:'A hill fort',      b:'A harbour',          category:'places'},
  {id:'ss-0090', a:'Cheese',           b:'Chocolate',          category:'food'},
  {id:'ss-0091', a:'First snow',       b:'Last warm day',      category:'weather'},
  {id:'ss-0092', a:'Moths',            b:'Dragonflies',        category:'animals'},
  {id:'ss-0093', a:'Do it now',        b:'Save it for later',  category:'time'},
  {id:'ss-0094', a:'A big mug',        b:'A small cup',        category:'comfort'},
  {id:'ss-0095', a:'A stone path',     b:'A grass path',       category:'places'},
  {id:'ss-0096', a:'A long story',     b:'A short one',        category:'comfort'}
];
