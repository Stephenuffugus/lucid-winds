/* ════════════════════════════════════════════════════════════════════
   ATTIC ENGINE — hash → one-of-one fake vintage object, TEXT ONLY.
   Two stage hash split: hb(0) → OBJECT CLASS, then that class's own
   grammar builds the thing. Universal layers: ERA (decade drives flavour),
   CONDITION (the rarity ladder, FACTORY SEALED is the cosmic), FACTORY
   ERROR (the mutation byte), and one PROVENANCE line (the haiku slot).
   Deterministic: same hash, same item, forever. ES5, node + browser.
   Voice law: original fake brands only, no real trademarks, no em dashes.

   ⛔ CONDITION NEVER LEAKS BEFORE THE WIPE. The page shows name, sub and
   sticker first and the grade last, so nothing in those three fields may
   be derived from grade(). Grade derived flavour goes in `revealNote` and
   `revealSuffix`, which the page only prints after the dust comes off.
   Audited 2026-08-16: the toy class was breaking this (MINT ON CARD in the
   name, condition flaws in the sticker) on 216 of every 6000 pulls.

   ⛔ NAME DEPTH IS THE WHOLE PREMISE. "An object that has never existed
   before" was false when this shipped: GAME and CEREAL had ten titles
   each and 19.4% of pulls repeated an earlier object exactly. Every class
   now assembles from a grammar. test/attic-check.js measures it; if you
   add a class, add it to section D with a bar in the low thousands.
   ════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function hb(h, n) { return parseInt(h.substr(n * 2, 2), 16); }

  /* A hash is 32 bytes and the grammars want more draws than that, so each
     class opens its own named stream off the same hash. Pure, deterministic,
     and it cannot collide with the art bytes (16..29) the renderers own.
     ⛔ >>> not >>, this is a uint32. */
  function stream(h, salt) {
    var s = 2166136261 >>> 0, i;
    for (i = 0; i < h.length; i++) { s ^= h.charCodeAt(i); s = Math.imul(s, 16777619) >>> 0; }
    for (i = 0; i < salt.length; i++) { s ^= salt.charCodeAt(i); s = Math.imul(s, 16777619) >>> 0; }
    return function (mod) {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return mod ? s % mod : s;
    };
  }
  function pick(r, arr) { return arr[r(arr.length)]; }

  /* ⛔ THE CONTENT KEY. Every class grammar seeds off THIS, not off the raw
     hash, because the raw hash contains byte 2, which is the grade. Seeding
     the name off the grade byte means the title and the condition move
     together: change nothing but the condition and the record changes its
     name. That is a decodable tell in a game whose one dramatic beat is not
     knowing the condition yet. Byte 2 is blanked here and nowhere else, so
     grade() still reads the real byte. */
  function contentKey(h) { return h.slice(0, 4) + '00' + h.slice(6); }

  /* The hand written "classic" titles are the best jokes in the file and
     they are also the shallowest bank in it. When they were one of nine
     equal patterns they took an eighth of every class's output, and a nine
     entry list drawn an eighth of the time is what made 82% of forty dig
     sessions repeat a title. They are a rare treat now, roughly 1 in 40. */
  var CLASSIC_ODDS = 40;

  /* junk in must not put NaN on a card. Anything that is not 64 hex is
     folded into a stable 64 hex string, so a bad paste still shows a real
     object and still shows the SAME object every time. */
  function normHash(h) {
    h = String(h == null ? '' : h).toLowerCase();
    if (/^[0-9a-f]{64}$/.test(h)) return h;
    var r = stream(h, 'norm'), out = '', i;
    for (i = 0; i < 8; i++) out += ('0000000' + (r(0) >>> 0).toString(16)).slice(-8);
    return out;
  }

  // ── universal ladders ────────────────────────────────────────────
  var ERAS = ['1950s', '1960s', '1970s', '1980s', '1990s'];
  function era(h) { return 5 + (hb(h, 1) % 5); }           // 5..9 → 195x..199x
  function year(h) { return (1900 + era(h) * 10 + hb(h, 4) % 10); }

  var GRADES = [
    { g: 'TRASHED',        hi: 0x14 },   // 7.8%
    { g: 'PLAYED',         hi: 0x61 },   // 30.1%
    { g: 'GOOD',           hi: 0xA9 },   // 28.1%
    { g: 'FINE',           hi: 0xD7 },   // 18.0%
    { g: 'NEAR MINT',      hi: 0xF6 },   // 12.1%
    { g: 'MINT',           hi: 0xFF },   // 3.5%
    { g: 'FACTORY SEALED', hi: 0x100 }   // 0xFF exactly, 0.39% — the grail
  ];
  function grade(h) {
    var b = hb(h, 2), i;
    for (i = 0; i < GRADES.length; i++) if (b < GRADES[i].hi) return GRADES[i].g;
    return 'GOOD';
  }

  var ERRORS = [  // mutation byte: hb(3) >= 0xF0 (6.25%)
    'MISCUT: printing runs off the edge', 'WRONG LABEL: names a different item entirely',
    'UPSIDE DOWN BACK PANEL', 'DOUBLE STAMPED PRICE', 'TEST MARKET ONLY: city name on the flap',
    'COLOR PLATES SWAPPED AT THE PRINTER', 'PROMO COPY: NOT FOR RESALE burned into the corner',
    'SPELLING OF THE TITLE DIFFERS FRONT AND BACK'
  ];
  function factoryError(h) { var b = hb(h, 3); return b >= 0xF0 ? ERRORS[b % ERRORS.length] : null; }

  var PLACES = [
    'a barn sale outside Dayton', 'an estate sale in Sandusky', 'a church basement in Barberton',
    'the free box at a Medina flea market', 'a storage unit auction off Route 8', 'a rummage sale in Cuyahoga Falls',
    'a garage in Massillon, under a boat', 'the last day of a Canton library sale', 'a farmhouse attic near Wooster',
    'a closing video store in Ravenna', 'a yard sale that was mostly tools', 'the trunk of a Buick at a swap meet',
    'a school auction in Kent', 'a widower’s porch table in Alliance', 'the back room of a bait shop on the lake',
    'a fire hall flea market in Girard', 'the sidewalk outside a closing arcade', 'a lot nobody bid on in Struthers',
    'a moving sale where the truck was already loaded', 'the last table at a fairground swap',
    'a basement in Painesville with the lights out', 'an auction where the box was labelled MISC'
  ];
  var PROV = [
    'From {p}. Still smells like attic.', 'Found at {p}. The box was marked DAD.',
    'Pulled from {p}, priced with a grease pencil.', 'From {p}. Nobody could say whose it was.',
    'Rescued from {p} one aisle before the rain.', 'From {p}. The seller threw in a second one, worse.',
    'Won in the silent auction at {p}.', 'From {p}. It was holding up a table leg.',
    'Traded for a lawnmower at {p}, allegedly.', 'From {p}. The dust was original.',
    'Bought at {p} because it was staring.', 'From {p}, wrapped in a 1988 sports page.',
    'From {p}. The whole lot cost a dollar.', 'Set aside at {p} by someone who never came back.',
    'From {p}. The tag said NOT FOR SALE and the man sold it anyway.',
    'From {p}, in a crate with a cat asleep on it.', 'From {p}. Somebody had written a phone number inside.',
    'Last thing left at {p} when they turned the lights off.'
  ];
  function provenance(h) {
    return PROV[hb(h, 5) % PROV.length].replace('{p}', PLACES[hb(h, 6) % PLACES.length]);
  }

  // ── RECORDS ──────────────────────────────────────────────────────
  var R_NOUNS = ['GRAVEL', 'VOLTAGE', 'ANTLER', 'TURNPIKE', 'FURNACE', 'PONTOON', 'MOTH', 'CASSEROLE', 'CULVERT', 'THISTLE', 'ODOMETER', 'BASEMENT', 'CINDER', 'MERIDIAN', 'AWNING', 'GRISTLE', 'LANTERN', 'SUMP PUMP', 'ORCHARD', 'ASPHALT', 'DEWCLAW', 'TOLLBOOTH', 'BROADSIDE', 'HANDSAW', 'DRIVEWAY', 'HAYLOFT', 'SWITCHYARD', 'BREAKWATER', 'BOILER', 'MILLPOND'];
  var R_PLURALS = ['DADS', 'LADS', 'ANTLERS', 'PRINTERS', 'REGULARS', 'DEACONS', 'MAJORETTES', 'WELDERS', 'COUSINS', 'BARONS', 'PALLBEARERS', 'UNDERSTUDIES', 'NIGHT JANITORS', 'ALTERNATES', 'SHORT ORDERS', 'BOTTLE RETURNS', 'SNOW BIRDS', 'LOT ATTENDANTS'];
  var R_FIRST = ['PATRICIA', 'DUANE', 'RHONDA', 'VERNON', 'GLORIA', 'EARL', 'MARLENE', 'CLIFF', 'DOTTIE', 'ROOSEVELT', 'LORETTA', 'ARDEN', 'BERNICE', 'HOYT'];
  var R_ADJ = ['MOONLIT', 'SLOW', 'VELVET', 'BRINY', 'ELECTRIC', 'HUMBLE', 'CROOKED', 'GLASS', 'PAPER', 'MIDNIGHT', 'SECONDHAND', 'UNPAVED', 'LUKEWARM', 'HOLLOW', 'SALTED', 'BORROWED'];
  var R_ALBUM_A = ['Softly', 'Slowly', 'Quietly', 'Once', 'Twice', 'Late', 'Almost', 'Nearly', 'Barely'];
  var R_ALBUM_B = ['Then All At Once', 'And Then The Lights', 'And Nobody Minded', 'And Home By Nine', 'On The Second Try', 'Like It Was Nothing', 'Before The Snow', 'And Not A Word'];
  var R_ALBUM_FLAT = [
    'Live From The Parking Lot', 'Kiss The Amplifier', 'Second Shift Serenade',
    'Songs To Gut Fish By', 'Water Me Never', 'Tractor Feed Heart', 'Nothing Happened Again',
    'Taxidermy Of The Heart', 'The Casserole Sessions', 'Goodbye, Screen Door', 'Chrome On Sunday',
    'A Little Rain For Everyone', 'The Long Way To The Lake', 'Dance Floor Of The Grange Hall',
    'Every Porch In Town', 'Static And Other Love Songs', 'The Last Payphone', 'Overtime Waltz',
    'Hymns For The Turnpike', 'Cul De Sac Cowboy', 'Warm Soda Summer', 'Union Of Two Lonely Counties',
    'Answering Machine Gold', 'Nine Miles Of Nothing', 'The Good Chair', 'Weather For Leaving'
  ];
  var R_ALBUM_N = ['Rain', 'Gravel', 'Sunday', 'Overtime', 'Static', 'Porchlight', 'Diesel', 'Sawdust', 'Kerosene', 'Vinyl', 'Winter', 'Payphone', 'Casserole', 'Linoleum'];
  var R_ALBUM_T = ['Songs', 'Hymns', 'Waltzes', 'Sessions', 'Sketches', 'Letters', 'Broadcasts', 'Lullabies'];
  function recordAlbum(r) {
    var p = r(4);
    if (p === 0) return pick(r, R_ALBUM_A) + ', ' + pick(r, R_ALBUM_B);
    if (p === 1) return pick(r, R_ALBUM_FLAT);
    if (p === 2) return pick(r, R_ALBUM_T) + ' For The ' + pick(r, R_ALBUM_N);
    return 'The ' + pick(r, R_ALBUM_N) + ' ' + pick(r, R_ALBUM_T);
  }
  var R_LABEL_A = ['Tangerine', 'Curb', 'Neon', 'Foundry', 'Wharfside', 'Dustbowl', 'Office Park', 'Beige', 'Lodge', 'Gravel', 'Percolator', 'Wet Cement', 'Streetlight', 'Draft Horse', 'Vacancy', 'Golden', 'Third Shift', 'Bright Angle', 'Cinderblock'];
  var R_LABEL_B = ['Sky', 'Appeal', 'Bat', 'Sound', 'Music', 'Road', 'Ladder', 'Choir', 'Groove', 'Wave', 'Union', 'Bell'];
  var R_PRESS = ['orange swirl pressing', 'magenta vinyl', 'mono', 'gatefold sleeve', 'clear pressing, cloudy anyway', 'quadraphonic, nobody could play it', 'picture disc', '180 gram before that meant anything', 'half speed master, whatever that meant', 'pressed at the plant that also did hymnals'];
  var R_STICKERS = ['CONTAINS THE HIT', 'FEATURING THE SINGLE "TUESDAY"', 'AS HEARD AT THE FAIR', '2 RECORDS FOR THE PRICE OF 1.5', 'THE ALBUM THE RADIO WOULDN’T FINISH', 'NOW WITH THE GOOD SONG FIRST', 'INCLUDES THE LONG VERSION', 'BANNED IN ONE COUNTY'];
  function recordName(r) {
    var p = r(7);
    if (p === 0) return 'THE ' + pick(r, R_NOUNS) + ' ' + pick(r, R_PLURALS);
    if (p === 1) return pick(r, R_FIRST) + ' & THE ' + pick(r, R_PLURALS);
    if (p === 2) return pick(r, R_ADJ) + ' ' + pick(r, R_NOUNS);
    if (p === 3) return 'THE ' + pick(r, R_ADJ) + ' ' + pick(r, R_PLURALS);
    if (p === 4) return pick(r, R_NOUNS) + ' ' + pick(r, R_NOUNS);
    if (p === 5) return pick(r, R_FIRST) + ' ' + pick(r, R_NOUNS);
    return 'THE ' + pick(r, R_ADJ) + ' ' + pick(r, R_NOUNS) + ' BAND';
  }
  function record(h) {
    var r = stream(contentKey(h), 'record');
    var sub = '"' + recordAlbum(r) + '" · ' + pick(r, R_LABEL_A) + ' ' + pick(r, R_LABEL_B) + ' Records';
    if (r(256) < 0x66) sub += ' · ' + pick(r, R_PRESS);
    var sticker = r(256) < 0x4D ? 'hype sticker: ' + pick(r, R_STICKERS) : null;
    return { cls: 'RECORD', name: recordName(r), sub: sub, sticker: sticker };
  }

  // ── VHS ──────────────────────────────────────────────────────────
  var V_FLAT = [
    'SLIME CHALET', 'AEROBIC WARLOCK', 'GATOR COP', 'THE PHANTOM OF THE FOOD COURT', 'NIGHT OF THE LAWN FLAMINGOS',
    'MY DAD THE SUBMARINE', 'STRICTLY BUSINESS CAMP', 'THE HAUNTING OF UNIT 12', 'KARATE PRINCIPAL',
    'MOON MECHANICS', 'THE BABYSITTER FROM DIMENSION 8', 'DIRT BIKE ANGELS', 'THE CHRISTMAS THAT WOULDN’T LEAVE',
    'ROLLER RINK DETECTIVE', 'SWAMP PROM', 'THE MICROWAVE PEOPLE', 'BAD DOG, GOOD COP', 'SUMMER OF THE HAND'
  ];
  var V_ADJ = ['SLIME', 'NEON', 'MIDNIGHT', 'TURBO', 'AEROBIC', 'RADIOACTIVE', 'HAUNTED', 'STRICTLY', 'DEADLY', 'LASER', 'VELVET', 'PLASTIC', 'FROZEN', 'ELECTRIC', 'CURSED', 'DELUXE', 'HONORARY', 'PART TIME'];
  var V_NOUN = ['CHALET', 'WARLOCK', 'SUBMARINE', 'PROM', 'CARWASH', 'BOWLING ALLEY', 'FOOD COURT', 'CUL DE SAC', 'DRIVE THRU', 'SUMMER', 'TRAMPOLINE', 'MOTEL', 'BASEMENT', 'GO KART', 'STORAGE UNIT', 'SKI LODGE', 'ARCADE', 'SWAP MEET', 'CHURCH VAN', 'ICE RINK', 'WATER PARK', 'MINI GOLF'];
  var V_ROLE = ['COP', 'PRINCIPAL', 'DETECTIVE', 'BABYSITTER', 'LIFEGUARD', 'MECHANIC', 'JANITOR', 'DENTIST', 'CROSSING GUARD', 'PARK RANGER', 'BUS DRIVER', 'REFEREE', 'PLUMBER', 'MASCOT', 'SUBSTITUTE', 'BOUNCER', 'NIGHT MANAGER', 'PARAMEDIC'];
  var V_CREATURE = ['GATOR', 'LAWN FLAMINGOS', 'MICROWAVE PEOPLE', 'SWAMP THING’S COUSIN', 'MOON MOTHS', 'HALL MONITORS', 'BASEMENT WOLVES', 'YARD GNOMES', 'MALL WITCHES', 'PARKING LOT GHOSTS', 'FREEZER BATS', 'BOG DOGS'];
  var V_PLACE = ['DIMENSION 8', 'UNIT 12', 'AISLE NINE', 'THE BACK NINE', 'THE LOWER LEVEL', 'THE OTHER OHIO', 'THE LAKE', 'THE CUL DE SAC', 'THE FOOD COURT', 'CAMP KETTLE', 'ROUTE 8', 'THE LOADING DOCK'];
  var V_VERBED = ['WOULDN’T LEAVE', 'CAME BACK', 'SAID NO', 'CLOCKED IN', 'LEARNED KARATE', 'RAN FOR MAYOR', 'WOULDN’T THAW', 'GOT A VAN'];
  var V_SUB = [' II: THE THAWING', ' 2: ELECTRIC REVENGE', ' III: BAYOU JUSTICE', ': THE RECKONING', ' PART 4: THE PART NOBODY ASKED FOR', ' RETURNS', ' FOREVER', ' 2: THE PAPERWORK', ' III: NIGHT SHIFT'];
  var V_TAG_A = ['Some sequels thaw.', 'Feel the burn.', 'This time it’s personal.', 'Every town has a basement.', 'They stood still.', 'It goes deeper than you think.', 'The rules were laminated.', 'It came with the house.', 'Detention is eternal.', 'Some heroes clock in.', 'The lake remembers.', 'One summer, one hand.', 'Justice has a kickstand.', 'Nobody signed for it.', 'The freezer was never empty.'];
  var V_TAG_B = ['This one melts.', 'Fear the sequel.', 'Again.', 'Until tonight.', 'And it is not leaving.', 'Bring a coat.', 'Rated somewhere between PG and a dare.', 'You cannot unplug what you cannot find.', 'Ask the night manager.', 'Somebody has to close.'];
  var V_NOTES = ['rental sticker: BE KIND REWIND', 'price sticker: $2.99 over $19.99', 'label handwritten over an older label', 'clamshell case, cracked proudly', 'tracking never quite settles', 'previews for movies that never came out', 'rental sticker from a store that closed in 1994', 'somebody taped over the first four minutes'];
  function vhsName(r) {
    if (r(CLASSIC_ODDS) === 0) return pick(r, V_FLAT);
    var p = r(8);
    if (p === 0) return pick(r, V_ADJ) + ' ' + pick(r, V_NOUN);
    if (p === 1) return 'THE ' + pick(r, V_ROLE) + ' OF ' + pick(r, V_PLACE);
    if (p === 2) return pick(r, V_CREATURE) + ' ' + pick(r, V_ROLE);
    if (p === 3) return 'NIGHT OF THE ' + pick(r, V_CREATURE);
    if (p === 4) return 'MY DAD THE ' + pick(r, V_NOUN);
    if (p === 5) return 'THE ' + pick(r, V_NOUN) + ' THAT ' + pick(r, V_VERBED);
    if (p === 6) return pick(r, V_NOUN) + ' ' + pick(r, V_ROLE);
    return 'THE ' + pick(r, V_ADJ) + ' ' + pick(r, V_ROLE);
  }
  function vhs(h) {
    var r = stream(contentKey(h), 'vhs');
    var t = vhsName(r);
    if (r(256) < 0x59) t += pick(r, V_SUB);
    return {
      cls: 'VHS', name: t,
      sub: '"' + pick(r, V_TAG_A) + ' ' + pick(r, V_TAG_B) + '"',
      sticker: r(256) < 0x80 ? pick(r, V_NOTES) : null
    };
  }

  // ── TOYS ─────────────────────────────────────────────────────────
  var T_FLAT = ['MUSCLE GUY', 'BABY WHISPERS', 'TIN ROCKET', 'THE OUCH A LOT', 'GLOWFRIEND', 'MR. CONSEQUENCES', 'THE APOLOGIZER', 'BEND A BEAST', 'SHERIFF OWL AND DEPUTY OWL'];
  var T_RANK = ['CAPTAIN', 'SERGEANT', 'DOCTOR', 'PROFESSOR', 'DEPUTY', 'ADMIRAL', 'PRINCESS', 'BARON', 'CHIEF', 'SISTER', 'COMMANDER', 'MAYOR', 'MARSHAL', 'DUCHESS', 'FOREMAN', 'WARDEN', 'CORPORAL', 'JUDGE'];
  var T_NOUN = ['GRAVEL', 'THUNDER', 'FORKLIFT', 'TENTACLES', 'BISCUIT', 'CRUMB', 'HAMMER', 'PUDDLE', 'SPARK', 'MOSS', 'BRICK', 'WRENCH', 'CINDER', 'FANG', 'BUCKLE', 'GRUDGE', 'MITTEN', 'SPROCKET', 'GIRDER', 'KETTLE', 'STATIC', 'TROWEL', 'LANTERN', 'BOLT', 'CLOVER', 'SHOVEL', 'PLUNGER', 'ANVIL'];
  var T_ALIEN = ['ZARNOK', 'VOLTRIX', 'GRUMLOK', 'KEENA', 'THRAX', 'OBLONG', 'YEVVA', 'MORDANT', 'PIP', 'SKREEN', 'VANTHA', 'QUORB', 'ELDRIN', 'NOSK', 'BRAAL', 'TIVVIT'];
  var T_FACTION = ['THE LAZER WIZARDS', 'THE MOON UNION', 'THE DEEP SHELF', 'THE QUIET ARMY', 'THE NINTH ROW', 'THE GLASS COUNTY', 'THE SLEEP BRIGADE', 'THE OTHER SIDE OF THE YARD', 'THE LOW COUNCIL', 'THE FIFTH BASEMENT', 'THE WET SEASON', 'THE LONG COMMUTE', 'THE SALT GUILD', 'THE NIGHT SHIFT'];
  var T_JOB = ['ATTORNEY', 'SURGEON', 'ACCOUNTANT', 'REFEREE', 'LIFEGUARD', 'INSPECTOR', 'NOTARY', 'DENTIST', 'ARBORIST', 'MEDIATOR', 'ARCHIVIST', 'LOCKSMITH', 'APPRAISER', 'PLUMBER', 'CARTOGRAPHER', 'AUDITOR'];
  var T_VERB = ['STOMP', 'CHOMP', 'WHACK', 'HUG', 'ZAP', 'SCOLD', 'YEET', 'FLING', 'BONK', 'NUDGE', 'SHUSH', 'WALLOP'];
  var T_NAME = ['SAM', 'DALE', 'GRETA', 'OTIS', 'BEV', 'RANDY', 'JUNE', 'HOYT', 'PEARL', 'CHUCK', 'MERLE', 'ODESSA', 'WENDELL', 'FAY'];
  var T_ANIMAL = ['PONY', 'OWL', 'BADGER', 'CRAB', 'GOOSE', 'MOOSE', 'NEWT', 'FERRET', 'HERON', 'TOAD', 'RACCOON', 'OTTER', 'MAGPIE', 'BISON', 'LEMUR', 'SKUNK'];
  var T_ADJ = ['MIGHTY', 'TINY', 'DELUXE', 'FEARLESS', 'RELUCTANT', 'HONORARY', 'ELECTRIC', 'SOGGY', 'CHROME', 'POLITE', 'FERAL', 'RETIRED'];
  var T_GIMMICK_A = ['FIVE POINTS OF ARTICULATION!', 'GLOWS IN THE DARKNESS OF SPACE', 'REAL WHISPER ACTION', 'wind up action, key included (wrong key)', 'KUNG FU ADJACENT GRIP', 'TALKS WHEN IT WANTS TO', 'EYES FOLLOW YOU (feature)', 'SPRING LOADED REGRET', 'FLOATS, MOSTLY', 'MAGNET IN THE HAND (magnet loose)', 'SOFT VINYL, FIRM OPINIONS', 'ONE SOUND, PLAYED OFTEN'];
  var T_GIMMICK_B = ['card back: COLLECT ALL {n} OF {m}', 'now with HAT (hat sold separately)', 'try me button (try me window torn)', 'includes a cape it was never sold with', 'batteries not included, never were', 'accessory sprue still attached'];
  var T_FLAWS = ['cape missing', 'one accessory chewed', 'smells faintly of campfire', 'battery door lost to time', 'repainted by a confident child', 'sticker sheet applied with courage', 'one arm swapped in from a bigger toy', 'name written on the foot in ballpoint'];
  function toyName(r) {
    if (r(CLASSIC_ODDS) === 0) return pick(r, T_FLAT);
    var p = r(10);
    if (p === 0) return pick(r, T_RANK) + ' ' + pick(r, T_NOUN);
    if (p === 1) return pick(r, T_ALIEN) + ' OF ' + pick(r, T_FACTION);
    if (p === 2) return 'DR. ' + pick(r, T_NOUN) + ', ' + pick(r, T_JOB);
    if (p === 3) return pick(r, T_VERB) + ' EM ' + pick(r, T_NAME);
    if (p === 4) return 'POCKET ' + pick(r, T_ANIMAL) + ' ' + pick(r, T_JOB);
    if (p === 5) return pick(r, T_RANK) + ' ' + pick(r, T_ANIMAL);
    if (p === 6) return 'THE ' + pick(r, T_NOUN) + ' ' + pick(r, T_ANIMAL);
    if (p === 7) return pick(r, T_ALIEN) + ' THE ' + pick(r, T_JOB);
    if (p === 8) return pick(r, T_ADJ) + ' ' + pick(r, T_ANIMAL) + ' ' + pick(r, T_JOB);
    return pick(r, T_ADJ) + ' ' + pick(r, T_NOUN) + ' ' + pick(r, T_NAME);
  }
  function toy(h) {
    var r = stream(contentKey(h), 'toy');
    var gim = r(256) < 0xB0 ? pick(r, T_GIMMICK_A)
      : pick(r, T_GIMMICK_B).replace('{n}', String(3 + r(6))).replace('{m}', String(9 + r(20)));
    /* ⛔ nothing here reads grade(). The MINT ON CARD flourish and the wear
       note are revealNote/revealSuffix, printed only after the wipe. */
    return {
      cls: 'TOY', name: toyName(r), sub: gim, sticker: null,
      _flaw: pick(r, T_FLAWS)
    };
  }

  // ── BOARD GAMES ──────────────────────────────────────────────────
  var G_FLAT = ['MORTGAGE PANIC!', 'CANAL BARONS OF OHIO', 'DON’T WAKE UNCLE TED', 'THE ALLOWANCE GAME', 'FERRY TYCOON', 'ESCAPE FROM THE POTLUCK', 'PARALLEL PARKING CHAMPIONSHIP', 'WHO TOOK THE HAM?', 'ZONING BOARD'];
  var G_NOUN = ['MORTGAGE', 'ALLOWANCE', 'CASSEROLE', 'FERRY', 'CANAL', 'GARAGE', 'PAPERWORK', 'CARPOOL', 'RECYCLING', 'INHERITANCE', 'FREEZER', 'HARDWARE', 'BAKE SALE', 'SNOWPLOW', 'YARD SALE', 'PANCAKE', 'DRIVEWAY', 'LAUNDROMAT', 'CASSETTE', 'POTLUCK', 'CARWASH', 'BOWLING', 'PARKING', 'GUTTER', 'REUNION', 'THERMOSTAT', 'TAILGATE', 'ZONING', 'FIRE HALL', 'CRAWL SPACE', 'PAPER ROUTE', 'CHURCH VAN'];
  var G_PLACE = ['OHIO', 'THE LAKE', 'THE VALLEY', 'ROUTE 8', 'THE FLATS', 'THE COUNTY LINE', 'THE NORTH SIDE', 'THE FAIRGROUND', 'THE TOWPATH', 'LOWER SANDUSKY', 'THE WEST ANNEX', 'THE OLD PLANT', 'THE SPILLWAY', 'THE BACK ACRE'];
  var G_REL = ['UNCLE', 'AUNT', 'GRANDPA', 'GRANDMA', 'COUSIN', 'STEPDAD', 'GODMOTHER', 'BIG BROTHER'];
  var G_NAME = ['TED', 'MARGE', 'DUANE', 'BEV', 'HOYT', 'LORETTA', 'CHUCK', 'PEARL', 'VERNON', 'DOTTIE', 'EARL', 'RHONDA', 'MERLE', 'ODESSA'];
  var G_ADJ = ['COMPETITIVE', 'EXTREME', 'POLITE', 'DELUXE', 'JUNIOR', 'ADVANCED', 'REGIONAL', 'CHAMPIONSHIP', 'ELECTRONIC', 'TRAVEL SIZE', 'FAMILY', 'SUDDEN'];
  var G_STORM = ['STORM', 'THAW', 'RECKONING', 'PAPERWORK', 'POTLUCK', 'SEASON', 'AUDIT', 'INVENTORY', 'SHIFT', 'VERDICT', 'HARVEST', 'INSPECTION'];
  var G_PREMISE = ['the game of adjustable rates', 'spring loaded recliner action', 'first to the good casserole wins', 'a family laugh riot, allegedly', 'bid, bribe, and portage', 'one die is loaded and the rules know it', 'the long game of long weekends', 'contains real paperwork', 'somebody always flips the board', 'the rules are four pages and two of them are apologies', 'ends when a parent says it ends', 'includes a timer nobody trusts'];
  function gameName(r) {
    if (r(CLASSIC_ODDS) === 0) return pick(r, G_FLAT);
    var p = r(10);
    if (p === 0) return pick(r, G_NOUN) + ' PANIC!';
    if (p === 1) return pick(r, G_NOUN) + ' BARONS OF ' + pick(r, G_PLACE);
    if (p === 2) return 'DON’T WAKE ' + pick(r, G_REL) + ' ' + pick(r, G_NAME);
    if (p === 3) return 'THE ' + pick(r, G_ADJ) + ' ' + pick(r, G_NOUN) + ' GAME';
    if (p === 4) return pick(r, G_NOUN) + ' TYCOON';
    if (p === 5) return 'ESCAPE FROM THE ' + pick(r, G_NOUN);
    if (p === 6) return 'WHO TOOK THE ' + pick(r, G_NOUN) + '?';
    if (p === 7) return pick(r, G_NOUN) + ': THE GATHERING ' + pick(r, G_STORM);
    if (p === 8) return pick(r, G_ADJ) + ' ' + pick(r, G_NOUN) + ' CHAMPIONSHIP';
    return pick(r, G_NOUN) + ' AND ' + pick(r, G_NOUN);
  }
  function game(h) {
    var r = stream(contentKey(h), 'game');
    var lo = 2 + r(3), hi = lo + 2 + r(3);
    return {
      cls: 'GAME', name: gameName(r),
      sub: pick(r, G_PREMISE) + ' · ' + lo + ' to ' + hi + ' players · ages ' + (6 + r(5)) + ' and up',
      sticker: r(256) < 0x40 ? pick(r, ['box taped at one corner, from inside', 'someone wrote the house rules on the lid', 'all the pieces, one in the wrong bag']) : null
    };
  }

  // ── CEREAL ───────────────────────────────────────────────────────
  var C_FLAT = ['FROSTED GNOME BITES', 'ASTRO GRAINS', 'COUNT SLURPULA', 'HONEY BARGE', 'OAT COMMANDER', 'PUDDLE CRUNCH', 'BREAKFAST WOLVES', 'MR. FIBER’S MORNING SITUATION', 'ROOT CELLAR O’S', 'SUGAR CANOES'];
  var C_ADJ = ['FROSTED', 'HONEY', 'SUGAR', 'ASTRO', 'DOUBLE', 'CRUNCHY', 'TOASTED', 'MAPLE', 'COCOA', 'BUTTERED', 'CARAMEL', 'ROOT CELLAR'];
  var C_CREATURE = ['GNOME', 'WOLF', 'KRAKEN', 'BADGER', 'GOBLIN', 'MOOSE', 'HERON', 'YETI', 'TROLL', 'OTTER', 'RACCOON', 'CRAB'];
  var C_GRAIN = ['BITES', 'GRAINS', 'CRUNCH', 'FLAKES', 'O’S', 'PUFFS', 'SQUARES', 'NUGGETS', 'WHEELS', 'RAFTS'];
  var C_VESSEL = ['BARGE', 'CANOES', 'ROCKETS', 'WAGONS', 'DINGHIES', 'TUGBOATS', 'SLEDS', 'GONDOLAS'];
  var C_RANK = ['COMMANDER', 'CAPTAIN', 'SERGEANT', 'ADMIRAL', 'MAYOR', 'DEPUTY', 'COUNT', 'PROFESSOR'];
  var C_BASE = ['OAT', 'BRAN', 'CORN', 'RICE', 'WHEAT', 'BARLEY', 'MILLET'];
  var C_HONORIFIC = ['MR.', 'MRS.', 'DR.', 'UNCLE', 'CAPTAIN', 'PROFESSOR'];
  var C_SURNAME = ['FIBER', 'CRUMB', 'MOLASSES', 'HUSK', 'GRIDDLE', 'BUTTERWORTH JR.', 'OATLEY', 'SCOOP'];
  var C_SITUATION = ['MORNING SITUATION', 'BREAKFAST PROGRAM', 'DAILY REQUIREMENT', 'FIBRE PLAN', 'GOOD START'];
  var C_CLAIMS = ['NOW WITH MORE HAT', 'the cereal of the space program’s contractors', 'he counts the marshmallows so you don’t have to', 'part of this complete situation', 'FREE PRIZE INSIDE (prize is a coupon for the prize)', 'stays crunchy through most of it', 'shapes may have settled into one shape', 'fortified with things the box does not name', 'the spoon is on the back, cut it out', 'now 4% larger box, same cereal', 'as seen during the weather'];
  function cerealName(r) {
    if (r(CLASSIC_ODDS) === 0) return pick(r, C_FLAT);
    var p = r(8);
    if (p === 0) return pick(r, C_ADJ) + ' ' + pick(r, C_CREATURE) + ' ' + pick(r, C_GRAIN);
    if (p === 1) return pick(r, C_ADJ) + ' ' + pick(r, C_VESSEL);
    if (p === 2) return pick(r, C_BASE) + ' ' + pick(r, C_RANK);
    if (p === 3) return 'BREAKFAST ' + pick(r, C_CREATURE) + 'S';
    if (p === 4) return pick(r, C_HONORIFIC) + ' ' + pick(r, C_SURNAME) + '’S ' + pick(r, C_SITUATION);
    if (p === 5) return pick(r, C_ADJ) + ' ' + pick(r, C_GRAIN);
    if (p === 6) return pick(r, C_CREATURE) + ' ' + pick(r, C_GRAIN);
    return pick(r, C_ADJ) + ' ' + pick(r, C_BASE) + ' ' + pick(r, C_GRAIN);
  }
  function cereal(h) {
    var r = stream(contentKey(h), 'cereal');
    return {
      cls: 'CEREAL', name: cerealName(r), sub: pick(r, C_CLAIMS),
      sticker: r(256) < 0x40 ? 'box only, flattened neatly' : null
    };
  }

  // ── the two stage split ──────────────────────────────────────────
  /* ⛔ thresholds are on the RAW byte, not on byte % 100. The old code did
     hb(0) % 100 against 35/60/80/92, which folds 0..255 unevenly and shipped
     RECORD at 43.2% and TOY at 16.0% against a documented 35/20. */
  var CLASS_SPLIT = [
    { c: 'RECORD', hi: 90 },    // 90/256 = 35.2%
    { c: 'VHS',    hi: 154 },   // 64/256 = 25.0%
    { c: 'TOY',    hi: 205 },   // 51/256 = 19.9%
    { c: 'GAME',   hi: 236 },   // 31/256 = 12.1%
    { c: 'CEREAL', hi: 256 }    // 20/256 =  7.8%
  ];
  var BUILD = { RECORD: record, VHS: vhs, TOY: toy, GAME: game, CEREAL: cereal };
  function classOf(h) {
    var b = hb(h, 0), i;
    for (i = 0; i < CLASS_SPLIT.length; i++) if (b < CLASS_SPLIT[i].hi) return CLASS_SPLIT[i].c;
    return 'CEREAL';
  }

  function hashToItem(h) {
    h = normHash(h);
    var item = BUILD[classOf(h)](h);
    item.hash = h;
    item.year = year(h);
    item.era = ERAS[era(h) - 5];
    item.grade = grade(h);
    item.error = factoryError(h);
    item.provenance = provenance(h);

    /* the two grade derived flourishes, held back until the wipe */
    item.revealSuffix = null;
    item.revealNote = null;
    if (item.cls === 'TOY') {
      if (item.grade === 'MINT' || item.grade === 'FACTORY SEALED') item.revealSuffix = ' (MINT ON CARD)';
      else if (item.grade === 'TRASHED' || item.grade === 'PLAYED' || item.grade === 'GOOD') item.revealNote = item._flaw;
      delete item._flaw;
    }
    return item;
  }

  var API = {
    hashToItem: hashToItem, _grade: grade, _class: classOf, _norm: normHash,
    ERAS: ERAS, GRADE_ORDER: ['TRASHED', 'PLAYED', 'GOOD', 'FINE', 'NEAR MINT', 'MINT', 'FACTORY SEALED']
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ATTIC = API;
})(this);
