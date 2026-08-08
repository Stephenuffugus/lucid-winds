/* LIFTING FOG QUESTION BANK

   Each entry is a thing speaking about itself in four clues, ordered from
   cryptic to obvious. The fog lifts one clue at a time and the answer is worth
   less each time it does.

   ⭐ FORMAT RULE THAT PREVENTS THE OBVIOUS BUG: options[0] is ALWAYS the correct
   answer. The game shuffles the four options before showing them, so an author
   can never mismatch an answer to an index and a reviewer can audit a line by
   reading it left to right.

   Regenerate or extend with this exact prompt, then hand-audit every entry:

   "Write N progressive clue questions for a cozy family quiz. Each is one
   THING (an animal, a place, an object, a food, a natural event) speaking in
   the first person about itself, in four clues ordered from cryptic to
   obvious. Clue 1 should be genuinely hard and slightly poetic, and should
   NOT be guessable by most people. Clue 4 should be so obvious that everyone
   gets it. Clues 2 and 3 step evenly between them. Rules: each clue is one
   sentence under 95 characters, true, checkable against a mainstream
   encyclopedia, general audience, no politics, no religion, no bodies, no
   violence, no brand names, NO DASH CHARACTERS OF ANY KIND. Also give three
   wrong options that are plausible for the first clue but clearly wrong by
   the last one. A wrong option that is still arguably correct at clue 4 is a
   broken question. Output a JS array of objects with fields id, options
   (array of 4 strings where the FIRST is correct), clues (array of 4 strings),
   category. Categories: animals, space, food, history, science, world, words,
   plants."

   AUDIT RULE: read clue 4 and check that exactly one option satisfies it. Then
   read clue 1 and check that it does not simply give the answer away.

   Launch bank 2026-08-08: 20 entries. */
window.LIFTINGFOG_BANK = [
  {id:'lf-0001', category:'animals',
   options:['Octopus','Sea star','Jellyfish','Lobster'],
   clues:['I have been opening jars in laboratories far longer than you have.',
          'My blood runs blue and it takes three hearts to push it around.',
          'I can change my colour and my skin texture in about a second.',
          'I have eight arms, and every one of them is covered in suckers.']},

  {id:'lf-0002', category:'food',
   options:['Honey','Maple syrup','Molasses','Olive oil'],
   clues:['Sealed jars of me have been found in old tombs and were still edible.',
          'I am made by thousands of workers who never meet the person who eats me.',
          'My flavour changes completely depending on which flowers were nearby.',
          'Bees make me, and it takes a whole hive a season to fill one jar.']},

  {id:'lf-0003', category:'world',
   options:['Iceland','Norway','Greenland','Scotland'],
   clues:['My name promises cold and my neighbour with the greener name is far colder.',
          'I sit on a seam where two of the world plates are pulling apart.',
          'Almost all of my heat and power comes up out of the ground for free.',
          'My capital is Reykjavik and I am an island in the North Atlantic.']},

  {id:'lf-0004', category:'plants',
   options:['Bamboo','Sugar cane','Willow','Palm'],
   clues:['I am a grass, though almost everyone who meets me calls me a tree.',
          'Some of my kind can add most of a foot to their height in a single day.',
          'People build scaffolding, floors and whole houses out of me.',
          'Pandas eat almost nothing but me.']},

  {id:'lf-0005', category:'animals',
   options:['Emperor penguin','Puffin','Albatross','Arctic tern'],
   clues:['I raise my child through the darkest and coldest weeks on the planet.',
          'I balance my egg on my feet and cover it with a fold of warm skin.',
          'The fathers huddle together for months without eating a thing.',
          'I am the largest penguin, and I live in Antarctica.']},

  {id:'lf-0006', category:'science',
   options:['Rainbow','Aurora','Sundog','Lightning'],
   clues:['You can never reach me, and two people never see quite the same one of me.',
          'I am always exactly opposite the sun from where you are standing.',
          'I am really a full circle, but the ground hides most of me.',
          'I appear as coloured bands in the sky after rain.']},

  {id:'lf-0007', category:'history',
   options:['The printing press','The telescope','The compass','Paper money'],
   clues:['I made it possible for an idea to outrun the person who had it.',
          'Before me, a book cost about as much as a small farm.',
          'Gutenberg built a famous version of me in the 1400s.',
          'I print words onto paper using movable metal letters.']},

  {id:'lf-0008', category:'space',
   options:['The Moon','Mars','Venus','Mercury'],
   clues:['I am slowly moving away from you, a few centimetres every year.',
          'You have only ever seen one of my sides from where you live.',
          'My pull is what drags your oceans up the beach twice a day.',
          'I am the bright round thing in your night sky, and people have walked on me.']},

  {id:'lf-0009', category:'animals',
   options:['Chameleon','Gecko','Iguana','Anole'],
   clues:['My colour is a mood before it is ever a hiding place.',
          'My two eyes can look at two completely different things at once.',
          'My tongue can be longer than the rest of my body and it fires like a spring.',
          'I am the lizard famous for changing colour, and my tail curls in a spiral.']},

  {id:'lf-0010', category:'world',
   options:['The Sahara','The Gobi','The Kalahari','The Atacama'],
   clues:['I am roughly the size of a large country you could name, and I am growing.',
          'Snow has fallen on my northern edge more than once in living memory.',
          'Caravans crossed me with salt and gold for well over a thousand years.',
          'I am the great hot desert that covers northern Africa.']},

  {id:'lf-0011', category:'science',
   options:['Salt','Sugar','Sand','Chalk'],
   clues:['Wars were fought over me and workers were once paid in me.',
          'I am the only rock that people eat on purpose.',
          'I am two elements that are each dangerous alone and harmless together.',
          'You keep me in a shaker next to the pepper.']},

  {id:'lf-0012', category:'animals',
   options:['Owl','Hawk','Raven','Bat'],
   clues:['I can hear a heartbeat under snow from across a field.',
          'My feathers have soft combed edges so that my flight makes no sound.',
          'I cannot move my eyes in their sockets, so I turn my whole head instead.',
          'I hunt at night and people say I go hoo.']},

  {id:'lf-0013', category:'plants',
   options:['Mushroom','Moss','Fern','Lichen'],
   clues:['I am closer to you on the tree of life than I am to the plants around me.',
          'The part you see is only the fruit, and the real body is a web underground.',
          'One of my kind in Oregon is among the largest living things on earth.',
          'You slice me into pans, and I grow with a cap on a stalk.']},

  {id:'lf-0014', category:'world',
   options:['Venice','Amsterdam','Stockholm','Bruges'],
   clues:['I was built on wooden posts driven into soft mud, and I am still standing on them.',
          'I have no cars at all, and my rubbish and my post arrive by water.',
          'I am spread across more than a hundred small islands joined by bridges.',
          'I am the Italian city of canals, and my boats are called gondolas.']},

  {id:'lf-0015', category:'science',
   options:['Ice','Glass','Wax','Quartz'],
   clues:['I am one of the very few things that grows lighter when I turn solid.',
          'That single strange habit is why life can survive in a frozen lake.',
          'I float on the liquid I came from, which almost nothing else does.',
          'You put me in a drink to make it cold.']},

  {id:'lf-0016', category:'words',
   options:['The alphabet','A dictionary','Braille','Shorthand'],
   clues:['I came from merchants who needed to count faster than they could carve.',
          'My name is simply the first two of my own letters said one after the other.',
          'Almost every one of my versions puts A near the front.',
          'A, B, C, and twenty three more of me.']},

  {id:'lf-0017', category:'animals',
   options:['Camel','Llama','Donkey','Yak'],
   clues:['What I carry on my back is not water, and everybody thinks it is.',
          'I have two rows of lashes and I can close my nostrils in a storm.',
          'I can drink a bathtub of water in about ten minutes when I find it.',
          'I am the desert animal with one or two humps.']},

  {id:'lf-0018', category:'world',
   options:['Mount Everest','K2','Mont Blanc','Kilimanjaro'],
   clues:['I am still growing, though only about as fast as your fingernails.',
          'My summit rock was once the floor of a warm shallow sea.',
          'The air at my top holds about a third of the oxygen you are breathing now.',
          'I am the highest mountain on earth, sitting on the border of Nepal and Tibet.']},

  {id:'lf-0019', category:'food',
   options:['Bread','Cheese','Yoghurt','Vinegar'],
   clues:['I am one of the oldest prepared foods, older than farming in some places.',
          'A living culture of mine can be kept alive and shared for generations.',
          'I am made of little more than flour, water, salt and time.',
          'You slice me and put me in the toaster.']},

  {id:'lf-0020', category:'space',
   options:['Saturn','Jupiter','Uranus','Neptune'],
   clues:['I am light enough that I would float if you could find a bath big enough.',
          'My most famous feature is mostly ice, and it is thinner than you imagine.',
          'I have dozens of moons, and one of them has lakes of liquid methane.',
          'I am the planet with the big bright rings around me.']}
];
