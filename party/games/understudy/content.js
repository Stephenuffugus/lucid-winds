/* THE UNDERSTUDY ROLE BANK

   A role appears. Everybody votes for whoever in the room fits it best. You score
   for voting with the room, and the person chosen scores for being recognised.

   ⚖⚖ THE FLAG THIS TITLE SHIPPED WITH, AND HOW IT IS ANSWERED. WHACKBOX_ROUND2
   scored this 39 and attached a condition: this genre can turn into a room ganging
   up on one person, so it only ships if a hundred roles can be written that
   nobody would be hurt to be given. Here is the rule that makes that possible.

   ⭐ EVERY ROLE IS A CHARMING QUIRK, NEVER A VIRTUE AND NEVER A FAILING.
   A bank of virtues is bland: "the kindest one" is a popularity contest with
   extra steps. A bank of failings is cruelty with a scoreboard. The register that
   works is affectionate recognition, and the test is that BOTH ENDS of any pair
   are fine to be:
     "The one who reads the instructions twice"  and
     "The one who has never read an instruction"
   Neither is an insult. Both are somebody at the table, and both should make that
   person laugh and say yes, that is me.

   ⛔ CUT ON SIGHT, whatever else is true of them: anything about being late,
   lazy, loud, forgetful in a way that costs people, mean, tight with money,
   unfit, unwell, unlucky in love, or bad at their job. Anything a person would
   rather the room did not agree about. If you have to argue that a role is
   really a compliment, it is not one.

   Regenerate or extend with this exact prompt, then hand-audit every entry:

   "Write N short roles for a warm party game where a room votes on which of them
   fits each role best. Each role starts 'The one who' and is under 70 characters.
   Every role must be a CHARMING QUIRK, never a virtue and never a failing: the
   person chosen should laugh and agree, not feel judged or flattered. Write
   opposites freely, since both ends of a habit are fine to be. Never anything
   about being late, lazy, mean, forgetful, unfit, unwell, or bad with money. No
   dash characters of any kind. Output a JS array of objects with fields id, text,
   category. Categories: home, travel, food, animals, thinking, doing, weather."

   AUDIT RULE: read the role, then imagine the quietest person at the table being
   chosen for it in front of everyone. If they would be pleased or amused, keep
   it. If they would be embarrassed, cut it. There is no third outcome.

   Launch bank 2026-08-08: 104 roles, every one read against that test. */
window.UNDERSTUDY_BANK = [
  {id:'us-0001', text:'The one who packs the night before', category:'travel'},
  {id:'us-0002', text:'The one who packs in the taxi', category:'travel'},
  {id:'us-0003', text:'The one who feeds every cat they meet', category:'animals'},
  {id:'us-0004', text:'The one who reads the last page first', category:'thinking'},
  {id:'us-0005', text:'The one who knows where everything is', category:'home'},
  {id:'us-0006', text:'The one who always has a snack somewhere', category:'food'},
  {id:'us-0007', text:'The one who takes the photograph', category:'doing'},
  {id:'us-0008', text:'The one who is in none of the photographs', category:'doing'},
  {id:'us-0009', text:'The one who talks to the dog like a person', category:'animals'},
  {id:'us-0010', text:'The one who finds the shortcut', category:'travel'},
  {id:'us-0011', text:'The one who trusts the long way round', category:'travel'},
  {id:'us-0012', text:'The one who reads the instructions twice', category:'thinking'},
  {id:'us-0013', text:'The one who has never read an instruction', category:'thinking'},
  {id:'us-0014', text:"The one who remembers everybody's birthday", category:'thinking'},
  {id:'us-0015', text:'The one who checks the weather before anything', category:'weather'},
  {id:'us-0016', text:'The one who goes out in it anyway', category:'weather'},
  {id:'us-0017', text:'The one who names the houseplants', category:'home'},
  {id:'us-0018', text:'The one whose houseplants are all thriving', category:'home'},
  {id:'us-0019', text:'The one who orders the same thing every time', category:'food'},
  {id:'us-0020', text:'The one who orders the strangest thing on the menu', category:'food'},
  {id:'us-0021', text:'The one who keeps the good scissors hidden', category:'home'},
  {id:'us-0022', text:'The one who would build the fire', category:'doing'},
  {id:'us-0023', text:'The one who would find the way back', category:'travel'},
  {id:'us-0024', text:'The one who would name the boat', category:'doing'},
  {id:'us-0025', text:'The one who stops to look at the moon', category:'weather'},
  {id:'us-0026', text:'The one who knows all the constellations', category:'weather'},
  {id:'us-0027', text:'The one who saves the wrapping paper', category:'home'},
  {id:'us-0028', text:'The one who opens presents in one go', category:'home'},
  {id:'us-0029', text:'The one who rescues the spider', category:'animals'},
  {id:'us-0030', text:'The one who asks the waiter about the dog', category:'animals'},
  {id:'us-0031', text:'The one who has a favourite spoon', category:'food'},
  {id:'us-0032', text:'The one who tastes everything before it is ready', category:'food'},
  {id:'us-0033', text:'The one who lines the tins up by label', category:'home'},
  {id:'us-0034', text:'The one whose desk is a beautiful disaster', category:'home'},
  {id:'us-0035', text:'The one who narrates what they are doing', category:'doing'},
  {id:'us-0036', text:'The one who hums without noticing', category:'doing'},
  {id:'us-0037', text:'The one who would pet the horse', category:'animals'},
  {id:'us-0038', text:'The one who would ride the horse', category:'animals'},
  {id:'us-0039', text:'The one who packs a spare jumper for somebody else', category:'travel'},
  {id:'us-0040', text:'The one who brings the whole first aid kit', category:'travel'},
  {id:'us-0041', text:'The one who reads plaques in museums', category:'thinking'},
  {id:'us-0042', text:'The one who is already in the gift shop', category:'thinking'},
  {id:'us-0043', text:'The one who knows the bus times by heart', category:'travel'},
  {id:'us-0044', text:'The one who would rather walk it', category:'travel'},
  {id:'us-0045', text:'The one who keeps every ticket stub', category:'home'},
  {id:'us-0046', text:'The one who throws it all out in spring', category:'home'},
  {id:'us-0047', text:'The one who makes friends with the barman', category:'doing'},
  {id:'us-0048', text:'The one who finds the quiet corner', category:'doing'},
  {id:'us-0049', text:'The one who would learn the recipe properly', category:'food'},
  {id:'us-0050', text:'The one who cooks with no measurements', category:'food'},
  {id:'us-0051', text:'The one who spots the bird before anyone', category:'animals'},
  {id:'us-0052', text:'The one who knows what the bird is called', category:'animals'},
  {id:'us-0053', text:'The one who would swim in the cold sea', category:'weather'},
  {id:'us-0054', text:'The one who holds the towels', category:'weather'},
  {id:'us-0055', text:'The one who checks the door is locked twice', category:'home'},
  {id:'us-0056', text:'The one who leaves a light on for people', category:'home'},
  {id:'us-0057', text:'The one who reads three books at once', category:'thinking'},
  {id:'us-0058', text:'The one who finishes one before starting another', category:'thinking'},
  {id:'us-0059', text:'The one who would rather have the window seat', category:'travel'},
  {id:'us-0060', text:'The one who wants to be near the door', category:'travel'},
  {id:'us-0061', text:'The one who saves the best bite for last', category:'food'},
  {id:'us-0062', text:'The one who eats the best bite first', category:'food'},
  {id:'us-0063', text:'The one who talks to the plants', category:'home'},
  {id:'us-0064', text:'The one who talks to the sat nav', category:'travel'},
  {id:'us-0065', text:'The one who would keep bees', category:'animals'},
  {id:'us-0066', text:'The one who would keep chickens', category:'animals'},
  {id:'us-0067', text:'The one who reads the ending of the film out loud', category:'thinking'},
  {id:'us-0068', text:'The one who wants no clue whatsoever', category:'thinking'},
  {id:'us-0069', text:'The one who takes the long route home in autumn', category:'weather'},
  {id:'us-0070', text:'The one who opens a window in any weather', category:'weather'},
  {id:'us-0071', text:'The one who knows a shop that sells that', category:'doing'},
  {id:'us-0072', text:'The one who would make it themselves', category:'doing'},
  {id:'us-0073', text:'The one who keeps a torch in the car', category:'travel'},
  {id:'us-0074', text:'The one who keeps a blanket in the car', category:'travel'},
  {id:'us-0075', text:'The one who tries the local thing', category:'food'},
  {id:'us-0076', text:'The one who finds a good cup of tea anywhere', category:'food'},
  {id:'us-0077', text:'The one who would learn the whole map', category:'thinking'},
  {id:'us-0078', text:'The one who would just start walking', category:'doing'},
  {id:'us-0079', text:'The one who claps at the end of a film', category:'doing'},
  {id:'us-0080', text:'The one who stays for the credits', category:'doing'},
  {id:'us-0081', text:'The one who keeps a pen in their pocket', category:'doing'},
  {id:'us-0082', text:'The one who writes on their hand', category:'doing'},
  {id:'us-0083', text:'The one who would name a star after somebody', category:'weather'},
  {id:'us-0084', text:'The one who would rather look at it than photograph it', category:'weather'},
  {id:'us-0085', text:'The one whose fridge has a system', category:'home'},
  {id:'us-0086', text:'The one who cooks whatever is nearest the front', category:'food'},
  {id:'us-0087', text:'The one who befriends the neighbour cat', category:'animals'},
  {id:'us-0088', text:'The one who has been adopted by a bird', category:'animals'},
  {id:'us-0089', text:'The one who folds the map back correctly', category:'travel'},
  {id:'us-0090', text:'The one who has a drawer of maps that do not fold', category:'travel'},
  {id:'us-0091', text:'The one who would sit at the front of the boat', category:'travel'},
  {id:'us-0092', text:'The one who would steer', category:'doing'},
  {id:'us-0093', text:'The one who tries the odd flavour of ice cream', category:'food'},
  {id:'us-0094', text:'The one who has had the same flavour since childhood', category:'food'},
  {id:'us-0095', text:'The one who would keep a diary for forty years', category:'thinking'},
  {id:'us-0096', text:'The one who remembers it all anyway', category:'thinking'},
  {id:'us-0097', text:'The one who watches the fire instead of the film', category:'home'},
  {id:'us-0098', text:'The one who knows how to lay a fire properly', category:'doing'},
  {id:'us-0099', text:'The one who would rather be barefoot', category:'home'},
  {id:'us-0100', text:'The one who owns the good walking boots', category:'travel'},
  {id:'us-0101', text:'The one who says the sunset is showing off', category:'weather'},
  {id:'us-0102', text:'The one who stops the car for it', category:'weather'},
  {id:'us-0103', text:'The one who knows a story about this place', category:'thinking'},
  {id:'us-0104', text:'The one who asks the questions that get the story', category:'thinking'}
];
