/* ════════════════════════════════════════════════════════════════════
   ATTIC ENGINE (prototype) — hash → one-of-one fake vintage object, TEXT ONLY.
   Proves the two-stage hash split from design-briefs/flagship-attic.md:
     hb(0) → OBJECT CLASS, then the rest of the hash feeds that class's banks.
   Universal layers: ERA (decade drives flavor), CONDITION (the rarity ladder,
   FACTORY SEALED is the cosmic), FACTORY ERROR (the mutation byte), and one
   PROVENANCE line (the haiku slot).
   Deterministic: same hash, same item, forever. ES5, node + browser.
   Voice law: original fake brands only, no real trademarks, no em-dashes.
   ════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function hb(h, n) { return parseInt(h.substr(n * 2, 2), 16); }

  // ── universal ladders ────────────────────────────────────────────
  var ERAS = ['1950s', '1960s', '1970s', '1980s', '1990s'];
  function era(h) { return 5 + (hb(h, 1) % 5); }           // 5..9 → 195x..199x
  function year(h) { return (1900 + era(h) * 10 + hb(h, 4) % 10); }

  var GRADES = [
    { g: 'TRASHED',        hi: 0x14 },   // 8%
    { g: 'PLAYED',         hi: 0x61 },   // 30%
    { g: 'GOOD',           hi: 0xA9 },   // 28%
    { g: 'FINE',           hi: 0xD7 },   // 18%
    { g: 'NEAR MINT',      hi: 0xF6 },   // 12%
    { g: 'MINT',           hi: 0xFF },   // ~3.5%
    { g: 'FACTORY SEALED', hi: 0x100 }   // 0xFF exactly, 0.39% — the grail
  ];
  function grade(h) {
    var b = hb(h, 2), i;
    for (i = 0; i < GRADES.length; i++) if (b < GRADES[i].hi) return GRADES[i].g;
    return 'GOOD';
  }

  var ERRORS = [  // mutation byte: hb(3) >= 0xF0 (~6%)
    'MISCUT: printing runs off the edge', 'WRONG LABEL: names a different item entirely',
    'UPSIDE-DOWN BACK PANEL', 'DOUBLE-STAMPED PRICE', 'TEST-MARKET ONLY: city name on the flap',
    'COLOR PLATES SWAPPED AT THE PRINTER', 'PROMO COPY: NOT FOR RESALE burned into the corner', 'SPELLING OF THE TITLE DIFFERS FRONT AND BACK'
  ];
  function factoryError(h) { var b = hb(h, 3); return b >= 0xF0 ? ERRORS[b % ERRORS.length] : null; }

  var PLACES = [
    'a barn sale outside Dayton', 'an estate sale in Sandusky', 'a church basement in Barberton',
    'the free box at a Medina flea market', 'a storage unit auction off Route 8', 'a rummage sale in Cuyahoga Falls',
    'a garage in Massillon, under a boat', 'the last day of a Canton library sale', 'a farmhouse attic near Wooster',
    'a closing video store in Ravenna', 'a yard sale that was mostly tools', 'the trunk of a Buick at a swap meet',
    'a school auction in Kent', 'a widower’s porch table in Alliance', 'the back room of a bait shop on the lake'
  ];
  var PROV = [
    'From {p}. Still smells like attic.', 'Found at {p}. The box was marked DAD.',
    'Pulled from {p}, priced with a grease pencil.', 'From {p}. Nobody could say whose it was.',
    'Rescued from {p} one aisle before the rain.', 'From {p}. The seller threw in a second one, worse.',
    'Won in the silent auction at {p}.', 'From {p}. It was holding up a table leg.',
    'Traded for a lawnmower at {p}, allegedly.', 'From {p}. The dust was original.',
    'Bought at {p} because it was staring.', 'From {p}, wrapped in a 1988 sports page.',
    'From {p}. The whole lot cost a dollar.', 'Set aside at {p} by someone who never came back.'
  ];
  function provenance(h) {
    return PROV[hb(h, 5) % PROV.length].replace('{p}', PLACES[hb(h, 6) % PLACES.length]);
  }

  // ── RECORDS ──────────────────────────────────────────────────────
  var R_NOUNS = ['GRAVEL', 'VOLTAGE', 'ANTLER', 'TURNPIKE', 'FURNACE', 'PONTOON', 'MOTH', 'CASSEROLE', 'CULVERT', 'THISTLE', 'ODOMETER', 'BASEMENT', 'CINDER', 'MERIDIAN', 'AWNING', 'GRISTLE', 'LANTERN', 'SUMP PUMP', 'ORCHARD', 'ASPHALT', 'DEWCLAW', 'TOLLBOOTH', 'BROADSIDE', 'HANDSAW'];
  var R_PLURALS = ['DADS', 'LADS', 'ANTLERS', 'PRINTERS', 'REGULARS', 'DEACONS', 'MAJORETTES', 'WELDERS', 'COUSINS', 'BARONS', 'PALLBEARERS', 'UNDERSTUDIES', 'NIGHT JANITORS', 'ALTERNATES'];
  var R_FIRST = ['PATRICIA', 'DUANE', 'RHONDA', 'VERNON', 'GLORIA', 'EARL', 'MARLENE', 'CLIFF', 'DOTTIE', 'ROOSEVELT'];
  var R_ADJ = ['MOONLIT', 'SLOW', 'VELVET', 'BRINY', 'ELECTRIC', 'HUMBLE', 'CROOKED', 'GLASS', 'PAPER', 'MIDNIGHT', 'SECONDHAND', 'UNPAVED'];
  var R_ALBUMS = [
    'Softly, Then All At Once', 'Live From The Parking Lot', 'Kiss The Amplifier', 'Second Shift Serenade',
    'Songs To Gut Fish By', 'Water Me Never', 'Tractor Feed Heart', 'Nothing Happened Again',
    'Taxidermy Of The Heart', 'The Casserole Sessions', 'Goodbye, Screen Door', 'Chrome On Sunday',
    'A Little Rain For Everyone', 'The Long Way To The Lake', 'Dance Floor Of The Grange Hall',
    'Every Porch In Town', 'Static And Other Love Songs', 'The Last Payphone', 'Overtime Waltz',
    'Hymns For The Turnpike', 'Cul-De-Sac Cowboy', 'Warm Soda Summer', 'Union Of Two Lonely Counties', 'Answering Machine Gold'
  ];
  var R_LABELS = ['Tangerine Sky', 'Curb Appeal', 'Neon Bat', 'Foundry Sound', 'Wharfside', 'Dustbowl', 'Office Park', 'Beige', 'Lodge Music', 'Gravel Road', 'Percolator', 'Wet Cement', 'Streetlight Choir', 'Draft Horse', 'Vacancy', 'Golden Ladder'];
  var R_PRESS = ['orange swirl pressing', 'magenta vinyl', 'mono', 'gatefold sleeve', 'clear pressing, cloudy anyway', 'quadraphonic, nobody could play it', 'picture disc', '180 gram before that meant anything'];
  var R_STICKERS = ['CONTAINS THE HIT', 'FEATURING THE SINGLE "TUESDAY"', 'AS HEARD AT THE FAIR', '2 RECORDS FOR THE PRICE OF 1.5', 'THE ALBUM THE RADIO WOULDN’T FINISH', 'NOW WITH THE GOOD SONG FIRST'];
  function recordName(h) {
    var p = hb(h, 7) % 5;
    if (p === 0) return 'THE ' + R_NOUNS[hb(h, 8) % R_NOUNS.length] + ' ' + R_PLURALS[hb(h, 9) % R_PLURALS.length];
    if (p === 1) return R_FIRST[hb(h, 8) % R_FIRST.length] + ' & THE ' + R_PLURALS[hb(h, 9) % R_PLURALS.length];
    if (p === 2) return R_ADJ[hb(h, 8) % R_ADJ.length] + ' ' + R_NOUNS[hb(h, 9) % R_NOUNS.length];
    if (p === 3) return 'THE ' + R_ADJ[hb(h, 8) % R_ADJ.length] + ' ' + R_PLURALS[hb(h, 9) % R_PLURALS.length];
    return R_NOUNS[hb(h, 8) % R_NOUNS.length] + ' ' + R_NOUNS[(hb(h, 9) + 7) % R_NOUNS.length];
  }
  function record(h) {
    var sub = '"' + R_ALBUMS[hb(h, 10) % R_ALBUMS.length] + '" · ' + R_LABELS[hb(h, 11) % R_LABELS.length] + ' Records';
    if (hb(h, 12) < 0x66) sub += ' · ' + R_PRESS[hb(h, 13) % R_PRESS.length];
    var sticker = hb(h, 14) < 0x4D ? 'hype sticker: ' + R_STICKERS[hb(h, 15) % R_STICKERS.length] : null;
    return { cls: 'RECORD', name: recordName(h), sub: sub, sticker: sticker };
  }

  // ── VHS ──────────────────────────────────────────────────────────
  var V_TITLES = [
    'SLIME CHALET', 'AEROBIC WARLOCK', 'GATOR COP', 'THE PHANTOM OF THE FOOD COURT', 'NIGHT OF THE LAWN FLAMINGOS',
    'MY DAD THE SUBMARINE', 'STRICTLY BUSINESS CAMP', 'THE HAUNTING OF UNIT 12', 'KARATE PRINCIPAL',
    'MOON MECHANICS', 'THE BABYSITTER FROM DIMENSION 8', 'DIRT BIKE ANGELS', 'THE CHRISTMAS THAT WOULDN’T LEAVE',
    'ROLLER RINK DETECTIVE', 'SWAMP PROM', 'THE MICROWAVE PEOPLE', 'BAD DOG, GOOD COP', 'SUMMER OF THE HAND'
  ];
  var V_SUB = [' II: THE THAWING', ' 2: ELECTRIC REVENGE', ' III: BAYOU JUSTICE', ': THE RECKONING', ' PART 4: THE PART NOBODY ASKED FOR', ' RETURNS', ' FOREVER'];
  var V_TAGS = [
    'Some sequels thaw. This one melts.', 'Feel the burn. Fear the sequel.', 'This time it’s personal. Again.',
    'Every town has a basement.', 'They stood still. Until tonight.', 'It goes deeper than you think.',
    'The rules were made to be laminated.', 'It came with the house.', 'Detention is eternal.',
    'Some heroes clock in.', 'You can’t unplug what you can’t find.', 'Rated somewhere between PG and a dare.',
    'The lake remembers.', 'One summer. One hand.', 'Justice has a kickstand.'
  ];
  var V_NOTES = ['rental sticker: BE KIND REWIND', 'price sticker: $2.99 over $19.99', 'label handwritten over an older label', 'clamshell case, cracked proudly', 'tracking never quite settles', 'previews for movies that never came out'];
  function vhs(h) {
    var t = V_TITLES[hb(h, 8) % V_TITLES.length];
    if (hb(h, 9) < 0x59) t += V_SUB[hb(h, 10) % V_SUB.length];
    return { cls: 'VHS', name: t, sub: '"' + V_TAGS[hb(h, 11) % V_TAGS.length] + '"', sticker: hb(h, 12) < 0x80 ? V_NOTES[hb(h, 13) % V_NOTES.length] : null };
  }

  // ── TOYS ─────────────────────────────────────────────────────────
  var T_NAMES = ['MUSCLE GUY', 'ZARNOK OF THE LAZER WIZARDS', 'BABY WHISPERS', 'TIN ROCKET', 'CAPTAIN GRAVEL', 'THE OUCH-A-LOT', 'POCKET PONY SURGEON', 'DR. TENTACLES, ATTORNEY', 'GLOWFRIEND', 'STOMP-EM SAM', 'PRINCESS FORKLIFT', 'THE APOLOGIZER', 'BEND-A-BEAST', 'SHERIFF OWL AND DEPUTY OWL', 'MR. CONSEQUENCES'];
  var T_GIMMICK = ['FIVE POINTS OF ARTICULATION!', 'GLOWS IN THE DARKNESS OF SPACE', 'REAL WHISPER ACTION', 'wind up action · key included (wrong key)', 'KUNG FU ADJACENT GRIP', 'TALKS WHEN IT WANTS TO', 'EYES FOLLOW YOU (feature)', 'SPRING LOADED REGRET', 'card back: COLLECT ALL 3 OF 9', 'now with HAT (hat sold separately)', 'FLOATS, MOSTLY'];
  var T_FLAWS = ['cape missing', 'one accessory chewed', 'smells faintly of campfire', 'battery door lost to time', 'repainted by a confident child', 'sticker sheet applied with courage'];
  function toy(h) {
    var it = { cls: 'TOY', name: T_NAMES[hb(h, 8) % T_NAMES.length], sub: T_GIMMICK[hb(h, 9) % T_GIMMICK.length], sticker: null };
    var g = grade(h);
    if (g === 'PLAYED' || g === 'TRASHED' || g === 'GOOD') it.sticker = T_FLAWS[hb(h, 10) % T_FLAWS.length];
    if (g === 'MINT' || g === 'FACTORY SEALED') it.name += ' (MINT ON CARD)';
    return it;
  }

  // ── BOARD GAMES ──────────────────────────────────────────────────
  var G_TITLES = ['MORTGAGE PANIC!', 'CANAL BARONS OF OHIO', 'DON’T WAKE UNCLE TED', 'THE ALLOWANCE GAME', 'FERRY TYCOON', 'ESCAPE FROM THE POTLUCK', 'INHERITANCE: THE GATHERING STORM', 'PARALLEL PARKING CHAMPIONSHIP', 'WHO TOOK THE HAM?', 'ZONING BOARD'];
  var G_PREMISE = ['the game of adjustable rates', 'spring loaded recliner action', 'first to the good casserole wins', 'a family laugh riot, allegedly', 'bid, bribe, and portage', 'one die is loaded and the rules know it', 'the long game of long weekends', 'contains real paperwork'];
  function game(h) {
    var lo = 2 + hb(h, 10) % 3, hi = lo + 2 + hb(h, 11) % 3;
    return { cls: 'GAME', name: G_TITLES[hb(h, 8) % G_TITLES.length], sub: G_PREMISE[hb(h, 9) % G_PREMISE.length] + ' · ' + lo + ' to ' + hi + ' players · ages ' + (6 + hb(h, 12) % 5) + ' and up', sticker: null };
  }

  // ── CEREAL ───────────────────────────────────────────────────────
  var C_NAMES = ['FROSTED GNOME BITES', 'ASTRO GRAINS', 'COUNT SLURPULA', 'HONEY BARGE', 'OAT COMMANDER', 'PUDDLE CRUNCH', 'BREAKFAST WOLVES', 'MR. FIBER’S MORNING SITUATION', 'ROOT CELLAR O’S', 'SUGAR CANOES'];
  var C_CLAIMS = ['NOW WITH MORE HAT', 'the cereal of the space program’s contractors', 'he counts the marshmallows so you don’t have to', 'part of this complete situation', 'FREE PRIZE INSIDE (prize is a coupon for the prize)', 'stays crunchy through most of it', 'shapes may have settled into one shape'];
  function cereal(h) {
    return { cls: 'CEREAL', name: C_NAMES[hb(h, 8) % C_NAMES.length], sub: C_CLAIMS[hb(h, 9) % C_CLAIMS.length], sticker: hb(h, 10) < 0x40 ? 'box only, flattened neatly' : null };
  }

  // ── the two-stage split ──────────────────────────────────────────
  function hashToItem(h) {
    h = String(h).toLowerCase();
    var c = hb(h, 0) % 100, item;
    if (c < 35) item = record(h);
    else if (c < 60) item = vhs(h);
    else if (c < 80) item = toy(h);
    else if (c < 92) item = game(h);
    else item = cereal(h);
    item.year = year(h);
    item.era = ERAS[era(h) - 5];
    item.grade = grade(h);
    item.error = factoryError(h);
    item.provenance = provenance(h);
    return item;
  }

  var API = { hashToItem: hashToItem, _grade: grade };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ATTIC = API;
})(this);
