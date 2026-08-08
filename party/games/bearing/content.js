/* BEARING SPECTRUM BANK

   A line runs across the television between two opposites. One player can see a
   hidden target somewhere along it. They say ONE WORD OUT LOUD, and everybody
   else drags a pointer to where they think the target is.

   ⭐⭐ THE REASON THIS TITLE EXISTS AT ALL. The house rule is that player TEXT
   never reaches a screen, and speaking never touches a screen at all. So the
   richest and funniest input a person has is available to us with no moderation
   surface whatsoever. Nothing typed is ever sent, stored or displayed here: the
   phone only ever says "say one word out loud". That single observation reopens
   most of the party genre we had written off.

   ⛔ WHAT MAKES A PAIR WORK, and it is not being opposite. It is that a room can
   place ANY word somewhere along it and mostly agree. "Cozy to Thrilling" works
   because a kitten, a thunderstorm and a hot bath all land somewhere obvious.
   "Red to Blue" fails, because most things are neither and there is nothing to
   reason about.

   Regenerate or extend with this exact prompt, then hand-audit every entry:

   "Write N pairs of opposite ends for a party game where one player gives a one
   word spoken clue and the others guess where a hidden point sits between the
   two ends. Each end is one to three words under 20 characters. The pair must be
   a real SPECTRUM, so that almost any everyday thing could be placed somewhere
   along it and a room would broadly agree where. Avoid pairs that are categories
   rather than degrees. General audience, safe for a grandparent and an eight
   year old. Nothing about politics, religion, illness, death, violence, money,
   weight or appearance. No dash characters of any kind. Output a JS array of
   objects with fields id, a, b, category."

   AUDIT RULE: take three unrelated things, a kettle, a wolf and a birthday, and
   try to place each one on the pair. If any of them has no sensible place, the
   pair is a category and not a spectrum, and it is cut.

   Launch bank 2026-08-08: 90 pairs. */
window.BEARING_BANK = [
  {id:'br-0001', a:'Cozy',            b:'Thrilling',       category:'feeling'},
  {id:'br-0002', a:'Quiet',           b:'Loud',            category:'senses'},
  {id:'br-0003', a:'Soft',            b:'Sharp',           category:'senses'},
  {id:'br-0004', a:'Ancient',         b:'Modern',          category:'time'},
  {id:'br-0005', a:'Tiny',            b:'Enormous',        category:'scale'},
  {id:'br-0006', a:'Simple',          b:'Complicated',     category:'thinking'},
  {id:'br-0007', a:'Warm',            b:'Cold',            category:'senses'},
  {id:'br-0008', a:'Slow',            b:'Fast',            category:'motion'},
  {id:'br-0009', a:'Plain',           b:'Fancy',           category:'style'},
  {id:'br-0010', a:'Useless',         b:'Useful',          category:'value'},
  {id:'br-0011', a:'Common',          b:'Rare',            category:'value'},
  {id:'br-0012', a:'Savoury',         b:'Sweet',           category:'taste'},
  {id:'br-0013', a:'For children',    b:'For grown ups',   category:'people'},
  {id:'br-0014', a:'Indoors',         b:'Outdoors',        category:'place'},
  {id:'br-0015', a:'Morning',         b:'Night',           category:'time'},
  {id:'br-0016', a:'Round',           b:'Pointy',          category:'shape'},
  {id:'br-0017', a:'Forgettable',     b:'Unforgettable',   category:'feeling'},
  {id:'br-0018', a:'Messy',           b:'Tidy',            category:'style'},
  {id:'br-0019', a:'Boring',          b:'Exciting',        category:'feeling'},
  {id:'br-0020', a:'Tame',            b:'Wild',            category:'nature'},
  {id:'br-0021', a:'Old fashioned',   b:'Futuristic',      category:'time'},
  {id:'br-0022', a:'Light',           b:'Heavy',           category:'scale'},
  {id:'br-0023', a:'Rough',           b:'Smooth',          category:'senses'},
  {id:'br-0024', a:'Serious',         b:'Silly',           category:'feeling'},
  {id:'br-0025', a:'Everyday',        b:'Once in a life',  category:'time'},
  {id:'br-0026', a:'Dull',            b:'Shiny',           category:'senses'},
  {id:'br-0027', a:'Bitter',          b:'Sugary',          category:'taste'},
  {id:'br-0028', a:'Wet',             b:'Dry',             category:'senses'},
  {id:'br-0029', a:'Natural',         b:'Made by people',  category:'nature'},
  {id:'br-0030', a:'Still',           b:'Busy',            category:'motion'},
  {id:'br-0031', a:'Cheap',           b:'Precious',        category:'value'},
  {id:'br-0032', a:'Hidden',          b:'Obvious',         category:'thinking'},
  {id:'br-0033', a:'Gentle',          b:'Fierce',          category:'nature'},
  {id:'br-0034', a:'Fragile',         b:'Sturdy',          category:'materials'},
  {id:'br-0035', a:'Cluttered',       b:'Empty',           category:'place'},
  {id:'br-0036', a:'Ordinary',        b:'Magical',         category:'feeling'},
  {id:'br-0037', a:'Sour',            b:'Creamy',          category:'taste'},
  {id:'br-0038', a:'Underrated',      b:'Overrated',       category:'opinion'},
  {id:'br-0039', a:'Solo',            b:'A whole crowd',   category:'people'},
  {id:'br-0040', a:'Silent',          b:'Musical',         category:'senses'},
  {id:'br-0041', a:'Rushed',          b:'Unhurried',       category:'time'},
  {id:'br-0042', a:'Rustic',          b:'Polished',        category:'style'},
  {id:'br-0043', a:'Winter',          b:'Summer',          category:'nature'},
  {id:'br-0044', a:'Underground',     b:'Up in the sky',   category:'place'},
  {id:'br-0045', a:'Woolly',          b:'Sleek',           category:'materials'},
  {id:'br-0046', a:'A chore',         b:'A treat',         category:'feeling'},
  {id:'br-0047', a:'Whispered',       b:'Announced',       category:'senses'},
  {id:'br-0048', a:'Crumbly',         b:'Chewy',           category:'taste'},
  {id:'br-0049', a:'Beginner',        b:'Expert',          category:'skill'},
  {id:'br-0050', a:'Straight',        b:'Twisting',        category:'shape'},
  {id:'br-0051', a:'Homemade',        b:'Shop bought',     category:'style'},
  {id:'br-0052', a:'Dusty',           b:'Sparkling',       category:'senses'},
  {id:'br-0053', a:'A whisper away',  b:'The far side',    category:'place'},
  {id:'br-0054', a:'Predictable',     b:'Surprising',      category:'thinking'},
  {id:'br-0055', a:'Flat',            b:'Steep',           category:'shape'},
  {id:'br-0056', a:'Everyday shoes',  b:'Best shoes',      category:'style'},
  {id:'br-0057', a:'Hushed',          b:'Rowdy',           category:'people'},
  {id:'br-0058', a:'Salty',           b:'Fresh',           category:'taste'},
  {id:'br-0059', a:'Handmade',        b:'Machine made',    category:'materials'},
  {id:'br-0060', a:'A short story',   b:'An epic',         category:'scale'},
  {id:'br-0061', a:'Shy',             b:'Bold',            category:'feeling'},
  {id:'br-0062', a:'Faded',           b:'Vivid',           category:'senses'},
  {id:'br-0063', a:'Practical',       b:'Beautiful',       category:'value'},
  {id:'br-0064', a:'A hobby',         b:'A calling',       category:'people'},
  {id:'br-0065', a:'Damp',            b:'Crisp',           category:'senses'},
  {id:'br-0066', a:'A trickle',       b:'A flood',         category:'scale'},
  {id:'br-0067', a:'Well known',      b:'A secret',        category:'thinking'},
  {id:'br-0068', a:'Slouching',       b:'Upright',         category:'shape'},
  {id:'br-0069', a:'A snack',         b:'A feast',         category:'taste'},
  {id:'br-0070', a:'Weekday',         b:'Weekend',         category:'time'},
  {id:'br-0071', a:'Rough sketch',    b:'Finished piece',  category:'skill'},
  {id:'br-0072', a:'Alone in a room', b:'On a stage',      category:'people'},
  {id:'br-0073', a:'Muddy',           b:'Spotless',        category:'senses'},
  {id:'br-0074', a:'A murmur',        b:'A roar',          category:'senses'},
  {id:'br-0075', a:'Beginning',       b:'Ending',          category:'time'},
  {id:'br-0076', a:'Downhill',        b:'Uphill',          category:'motion'},
  {id:'br-0077', a:'Loose',           b:'Tight',           category:'materials'},
  {id:'br-0078', a:'A rumour',        b:'A fact',          category:'thinking'},
  {id:'br-0079', a:'Rickety',         b:'Solid',           category:'materials'},
  {id:'br-0080', a:'A doodle',        b:'A masterpiece',   category:'skill'},
  {id:'br-0081', a:'Sleepy',          b:'Wide awake',      category:'feeling'},
  {id:'br-0082', a:'Bare',            b:'Decorated',       category:'style'},
  {id:'br-0083', a:'A puddle',        b:'An ocean',        category:'scale'},
  {id:'br-0084', a:'Improvised',      b:'Rehearsed',       category:'skill'},
  {id:'br-0085', a:'Bland',           b:'Spicy',           category:'taste'},
  {id:'br-0086', a:'Nearby',          b:'Far away',        category:'place'},
  {id:'br-0087', a:'A hum',           b:'A song',          category:'senses'},
  {id:'br-0088', a:'Rough ground',    b:'A smooth road',   category:'motion'},
  {id:'br-0089', a:'A guess',         b:'A certainty',     category:'thinking'},
  {id:'br-0090', a:'Wilted',          b:'Blooming',        category:'nature'}
];
