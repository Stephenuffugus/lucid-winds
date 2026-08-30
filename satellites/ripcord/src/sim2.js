/* RIPCORD SIM v2 — headless. No DOM, no renderer, no globals but the export.
 *
 * Reduced heavy-symmetric-top model with five customisation slots, a
 * counterweight system, part burst, a rail dash and pre-programmed abilities.
 * Nothing in here knows what a pixel is. The 3D build reuses this file whole.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SIM = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const K = {
    dt: 1 / 120,
    g: 9.81,
    arenaR: 0.150,
    bowl: 12.0,
    ridgeAt: 0.72,          // where the dish flattens into the ridge
    ridgeFall: 0.62,        // how hard the slope reverses on the ridge
    pockets: 3,             // low points in the lip
    pocketMu: 0.42,
    railDrag: 0.35,         // the rail is smooth: less floor friction up there
    floorMu: 0.5726,
    spinBase: 2.6,
    spinLean: 2.386,
    spinSlip: 0.1000,
    stamPow: 0.5324,
    massCost: 0.55,
    iRef: 1.40e-5,          // reference moment of inertia
    inertiaPow: 0.62,       // how strongly inertia protects spin
    driveK: 5.8537,
    fallK: 4.7087,
    riseK: 3.5236,
    leanEq: 0.0203,
    wStable: 340,
    precMax: 46.0,
    precScale: 0.55,
    tiltHit: 0.2355,
    thetaMax: 0.46,
    theta0: 0.055,
    spinDead: 15.0,
    wallE: 0.4565,
    muMax: 0.62,
    jtCap: 3.0,             // how far rim friction may exceed the normal impulse
    tanLin: 0.85,
    hitDrain: 28.0,
    recoil: 0.35,           // share of a smash the striker pays back
    hitGap: 0.10,
    hitFloor: 0.0016,
    ringOut: 1.008,
    exitNeed: 0.55,         // radial speed needed to actually leave the stadium
    launchSpin: 980.0,
    // --- v2 ---
    imbDrive: 1.30,         // counterweight -> extra travel
    imbDrain: 0.85,         // counterweight -> extra spin cost
    imbSwing: 7.00,         // counterweight -> heavy-side impact swing
    dashSpeed: 0.40,        // min rim speed to engage the rail
    dashGain: 17.0,          // rail acceleration
    dashCost: 9.0,          // spin paid per dash
    dashGap: 0.30,
    imbDash: 3.20,          // wobble bites the rail harder          // seconds between dashes
    burstWear: 1.00,        // wear needed to burst
    burstK: 0.155,
    impRef: 0.020,          // a reference strike; wear is measured against it
    burstPow: 3.00,         // wear scales super-linearly with impact
    burstBack: 0.14,        // share of wear the striker takes back            // wear per unit impulse
    chargeHit: 0.20,        // ability charge per strike landed
    chargeTaken: 0.09,      // charge per strike absorbed
    chargeRidge: 0.34       // charge per second riding the ridge
  };

  // ======================================================================
  // PARTS — five slots. Every slot trades something for something.
  // ======================================================================

  // 1. CORE (lock chip): spin direction, ability, a little centre mass.
  const CORES = [
    { id: 'ember',  name: 'Ember',  mass: 0.0022, dir:  1, ability: 'surge',     charge: 1.00, role: 'stamina' ,
      desc: "A warm brass chip that fills at an ordinary pace and hands you back a hard shove of spin when it goes." },
    { id: 'frost',  name: 'Frost',  mass: 0.0026, dir:  1, ability: 'anchor',    charge: 0.85, role: 'defense' ,
      desc: "Heavy enough to feel at the centre and slow to fill, and when it does it stands you up and roots you where you are." },
    { id: 'gale',   name: 'Gale',   mass: 0.0018, dir: -1, ability: 'overdrive', charge: 1.10, role: 'attack' ,
      desc: "Almost nothing at the axis and quick to fill, and it doubles how far you travel for two and a half seconds." },
    { id: 'iron',   name: 'Iron',   mass: 0.0034, dir:  1, ability: 'rebound',   charge: 0.95, role: 'defense' ,
      desc: "The heaviest stock chip in the case, which loads the tip, and it hands the next strike back half again as hard." },
    { id: 'hollow', name: 'Hollow', mass: 0.00200, dir: -1, ability: 'reversal',  charge: 1.35, role: 'utility' ,
      desc: "A cored out chip that fills faster than anything else stock and flips your spin direction outright." },
    { id: 'moth',   name: 'Moth',   mass: 0.0016, dir: -1, ability: 'shed',      charge: 0.75, role: 'utility' ,
      desc: "The lightest chip made and slow to fill, and it drops every counterweight you fitted the moment it goes." },
    { id: 'burr',   name: 'Burr',   mass: 0.0030, dir:  1, ability: 'burrow',    charge: 0.90, role: 'defense' ,
      desc: "Heavy at the centre and unhurried; it digs the tip in and stops you travelling for nearly three seconds." },
    { id: 'lash',   name: 'Lash',   mass: 0.0024, dir: -1, ability: 'lash',      charge: 1.05, role: 'attack' ,
      desc: "A middling chip that turns your next three strikes into biters." },
    { id: 'lodest', name: 'Lodestone', mass: 0.0028, dir: 1, ability: 'lunge',   charge: 1.20, role: 'attack' ,
      desc: "Weighted and quick to fill, and it throws you straight at them once." },
    { id: 'quench', name: 'Quench', mass: 0.0021, dir: -1, ability: 'brake',     charge: 0.80, role: 'utility' ,
      desc: "Light and slow to fill, and it trades everything left of your travel for spin." },

    // ---- TIER 2, FORGED. One stat pushed about a quarter past the Tier 1
    //      range, and another pulled back further to pay for it. Not stronger,
    //      more extreme; that is what a tier is in this game.
    { id: 'ballast', name: 'Trim', mass: 0.00372, dir: 1, ability: 'scatter', charge: 0.58, role: 'defense', tier: 2,
      desc: "A dense trim chip that shuffles your counterweights back into true without giving up a single gram of the mass you paid for." },
    { id: 'granite', name: 'Granite', mass: 0.00392, dir: 1, ability: 'stoneskin', charge: 0.54, role: 'defense', tier: 2,
      desc: "Solid mineral stock that sits heavy on the axis and hardens you against three seconds of punishment, if it ever fills." },
    { id: 'windlas', name: 'Windlass', mass: 0.00404, dir: -1, ability: 'windup', charge: 0.51, role: 'attack', tier: 2,
      desc: "A geared winding chip that stalls you at half travel for a second and a half, then throws you forward at nearly double." },
    { id: 'vise', name: 'Pincer', mass: 0.00496, dir: -1, ability: 'bite', charge: 0.52, role: 'attack', tier: 2,
      desc: "Heavy jaws at the centre that clamp both rims together for two seconds and strip spin off whatever you are touching." },
    { id: 'kite', name: 'Kite', mass: 0.00104, dir: -1, ability: 'tether', charge: 1.46, role: 'utility', tier: 2,
      desc: "A hollowed chip that weighs almost nothing and fills early enough to hold you out on the rail while the bowl tries to pull you home." },
    { id: 'reel', name: 'Reel', mass: 0.00092, dir: -1, ability: 'backspin', charge: 1.53, role: 'utility', tier: 2,
      desc: "A light spooled chip that fills early and flips your rim friction for two and a half seconds without turning your travel around." },
    { id: 'tinder', name: 'Tinder', mass: 0.00118, dir: -1, ability: 'kindle', charge: 1.48, role: 'stamina', tier: 2,
      desc: "Almost no metal at the centre, so it catches long before a heavier chip would have, and then simply refuses to slow down for four seconds." },
    { id: 'wren', name: 'Wren', mass: 0.00086, dir: -1, ability: 'burrow', charge: 1.57, role: 'defense', tier: 2,
      desc: "The lightest stock chip in the case, quick to fill and quick to dig in, though the whole top rides light and shoves easily." },

    // ---- TIER 3, RELIC. One stat at an extreme, plus a named drawback the
    //      simulation actually enforces. Bosses are the only source.
    { id: 'bell', name: 'Bell', mass: 0.00450, dir: -1, ability: 'rebound', charge: 0.72, role: 'defense', tier: 3, drawback: 'looselock',
      desc: "A thick resonant chip that returns the next strike with half again the force, cut onto teeth so shallow that one solid blow can pop the top apart." },
    { id: 'magpie', name: 'Magpie', mass: 0.00085, dir: -1, ability: 'echo', charge: 1.95, role: 'utility', tier: 3, drawback: 'greedy',
      desc: "A hoarding chip that fills faster than anything ever built and throws the last ability used on you straight back, but it will never grind out a win on spin alone." },
    { id: 'flint', name: 'Flint', mass: 0.00070, dir: 1, ability: 'overdrive', charge: 1.28, role: 'attack', tier: 3, drawback: 'coldstart',
      desc: "Barely there at the axis and sullen off the launch, it runs hot for the rest of the round and doubles your travel when it fires." },
    { id: 'millst', name: 'Cairn', mass: 0.00517, dir: 1, ability: 'pitch', charge: 0.70, role: 'attack', tier: 3, drawback: 'hungry',
      desc: "The heaviest chip in the game grinds spin off everything it touches and can spend a quarter of its own to hurl itself outward." }
  ];

  // 2. BLADE (main weapon): the thing that hits. Sharp = smash, round = deflect.
  //    The budget: sharpness and restitution buy smash, and are paid for in
  //    recoil taken. Wide round blades buy survivability and pay in reach.
  const BLADES = [
    { id: 'cleaver', name: 'Cleaver', mass: 0.0176, radius: 0.0208, sharp: 1.00, rest: 0.90, gear: 0.95, taken: 1.22, role: 'attack' ,
      desc: "The sharpest stock edge on a narrow heavy disc; it cuts, and it feels every hit it takes." },
    { id: 'sabre',   name: 'Sabre',   mass: 0.0150, radius: 0.0222, sharp: 0.78, rest: 0.74, gear: 1.05, taken: 1.08, role: 'attack' ,
      desc: "A long curved edge with real reach, sharp enough to matter and light enough to move." },
    { id: 'orbit',   name: 'Orbit',   mass: 0.0144, radius: 0.0242, sharp: 0.22, rest: 0.40, gear: 0.28, taken: 0.64, role: 'stamina' ,
      desc: "A wide smooth ring with nothing to catch on, built to turn for a very long time." },
    { id: 'bulwark', name: 'Bulwark', mass: 0.0166, radius: 0.0246, sharp: 0.34, rest: 0.30, gear: 0.34, taken: 0.90, role: 'defense' ,
      desc: "Wide, heavy and blunt; it shrugs off far more than it deals out." },
    { id: 'talon',   name: 'Talon',   mass: 0.0132, radius: 0.0224, sharp: 0.88, rest: 0.82, gear: 1.40, taken: 1.16, role: 'attack' ,
      desc: "A light hooked edge with the most rim grip in the case, made to catch a rim and drag its spin across." },
    { id: 'wheel',   name: 'Wheel',   mass: 0.0158, radius: 0.0238, sharp: 0.45, rest: 0.52, gear: 0.62, taken: 0.92, role: 'balance' ,
      desc: "An honest disc with a modest edge that does nothing badly and nothing brilliantly." },
    { id: 'shard',   name: 'Shard',   mass: 0.0118, radius: 0.0204, sharp: 0.96, rest: 0.95, gear: 1.25, taken: 1.35, role: 'attack' ,
      desc: "The lightest and nearly the sharpest blade there is, and it takes recoil worse than anything else in the case." },
    { id: 'anvil',   name: 'Anvil',   mass: 0.0184, radius: 0.0226, sharp: 0.52, rest: 0.34, gear: 0.40, taken: 0.88, role: 'defense' ,
      desc: "The heaviest stock blade, dull and dead, made to absorb rather than answer." },
    { id: 'halo',    name: 'Halo',    mass: 0.0152, radius: 0.0258, sharp: 0.18, rest: 0.26, gear: 0.25, taken: 0.60, role: 'stamina' ,
      desc: "The widest stock ring, smooth the whole way round, and it takes less from a hit than anything else made." },
    { id: 'crest',   name: 'Crest',   mass: 0.0162, radius: 0.0232, sharp: 0.64, rest: 0.60, gear: 0.80, taken: 1.00, role: 'balance' ,
      desc: "A ridged disc with a usable edge and no particular weakness." },

    // ---- TIER 2, FORGED. One stat pushed about a quarter past the Tier 1
    //      range, and another pulled back further to pay for it. Not stronger,
    //      more extreme; that is what a tier is in this game.
    { id: 'broadaxe', name: 'Broadaxe', mass: 0.01760, radius: 0.0208, sharp: 1.26, rest: 0.88, gear: 0.92, taken: 1.46, role: 'attack', tier: 2,
      desc: "A single deep edge that cuts further into a rim than any stock blade and hands most of the shock straight back up the shaft." },
    { id: 'chisel', name: 'Chisel', mass: 0.01572, radius: 0.0188, sharp: 1.30, rest: 0.90, gear: 1.10, taken: 1.28, role: 'attack', tier: 2,
      desc: "Every gram is gathered into one narrow point, so it cuts deeper than anything in the stock box and has almost no rim left to carry it." },
    { id: 'millstone', name: 'Millstone', mass: 0.02240, radius: 0.0188, sharp: 0.48, rest: 0.30, gear: 0.44, taken: 0.96, role: 'defense', tier: 2,
      desc: "A short heavy stone of a wheel that shoulders other tops aside and gives up its reach to do it." },
    { id: 'ploughshare', name: 'Ploughshare', mass: 0.02420, radius: 0.0228, sharp: 0.14, rest: 0.28, gear: 0.38, taken: 0.86, role: 'defense', tier: 2,
      desc: "The heaviest plate the mount will carry, ground smooth so it shoves tops off their line instead of cutting them." },
    { id: 'cartwheel', name: 'Cartwheel', mass: 0.01580, radius: 0.0264, sharp: 0.14, rest: 0.22, gear: 0.24, taken: 0.66, role: 'stamina', tier: 2,
      desc: "The widest ring the mount will take, with almost no edge left on it; it turns for a very long time and could not hurt anybody." },
    { id: 'roundel', name: 'Roundel', mass: 0.01300, radius: 0.0210, sharp: 0.10, rest: 0.18, gear: 0.26, taken: 0.62, role: 'stamina', tier: 2,
      desc: "A packed rim that swallows a hit instead of returning it, with no edge left to answer one." },
    { id: 'rasp', name: 'Rasp', mass: 0.01609, radius: 0.0220, sharp: 0.90, rest: 0.16, gear: 1.82, taken: 1.26, role: 'attack', tier: 2,
      desc: "A file rather than a knife, it grips a passing rim and drags the spin off it instead of throwing it clear." },
    { id: 'hailstone', name: 'Hailstone', mass: 0.01640, radius: 0.0230, sharp: 0.70, rest: 1.20, gear: 0.14, taken: 1.06, role: 'balance', tier: 2,
      desc: "Hard and polished, it kicks away from every contact it makes and never grips long enough to trade spin." },

    // ---- TIER 3, RELIC. One stat at an extreme, plus a named drawback the
    //      simulation actually enforces. Bosses are the only source.
    { id: 'shrike', name: 'Shrike', mass: 0.01220, radius: 0.0202, sharp: 1.62, rest: 0.98, gear: 1.30, taken: 1.52, role: 'attack', tier: 3, drawback: 'glass',
      desc: "The deepest edge ever fitted to a mount, hung on a blade so light and thin that it begins to give once the spin is gone." },
    { id: 'sledge', name: 'Sledge', mass: 0.01820, radius: 0.0214, sharp: 1.10, rest: 1.42, gear: 0.66, taken: 1.52, role: 'attack', tier: 3, drawback: 'oneshot',
      desc: "A hardened face that turns one clean contact into a single enormous blow and never lands another like it." },
    { id: 'ingot', name: 'Ingot', mass: 0.02500, radius: 0.0206, sharp: 0.46, rest: 0.32, gear: 0.46, taken: 1.06, role: 'defense', tier: 3, drawback: 'coldstart',
      desc: "A dense billet with barely any rim to it, slow to get moving and then very hard to move." },
    { id: 'hookbill', name: 'Hookbill', mass: 0.01380, radius: 0.0230, sharp: 0.70, rest: 0.44, gear: 2.10, taken: 1.08, role: 'stamina', tier: 3, drawback: 'hungry',
      desc: "A rim cut into meshing teeth that tears spin off whatever it touches and burns through its own doing it." }
  ];

  // 3. ASSIST (sub-blade): bolts under the main blade. Shapes the rim.
  const ASSISTS = [
    { id: 'none',   name: 'None',   mass: 0.0000, gearMul: 1.00, absorb: 1.00, radAdd: 0.0000, smash: 1.00, role: 'balance' ,
      desc: "No sub blade at all, which costs nothing and adds nothing." },
    { id: 'jag',    name: 'Jag',    mass: 0.0040, gearMul: 1.45, absorb: 0.92, radAdd: 0.0008, smash: 1.14, role: 'attack' ,
      desc: "Teeth under the rim that grip and hit harder, bought with the cushion you give up." },
    { id: 'guard',  name: 'Guard',  mass: 0.0052, gearMul: 0.70, absorb: 1.16, radAdd: 0.0012, smash: 0.88, role: 'defense' ,
      desc: "A smooth heavy skirt that soaks up a hit and blunts yours in the same breath." },
    { id: 'slick',  name: 'Slick',  mass: 0.0030, gearMul: 0.38, absorb: 1.10, radAdd: 0.0004, smash: 0.92, role: 'stamina' ,
      desc: "Polished until almost nothing catches on it, so contacts glance instead of grabbing." },
    { id: 'hook',   name: 'Hook',   mass: 0.00418, gearMul: 1.69, absorb: 1.02, radAdd: 0.0010, smash: 0.96, role: 'utility' ,
      desc: "The grippiest sub blade there is, made to mesh with a rim turning the other way." },
    { id: 'wing',   name: 'Wing',   mass: 0.0036, gearMul: 1.00, absorb: 1.18, radAdd: 0.0016, smash: 1.02, role: 'balance' ,
      desc: "A flared skirt that reaches out and cushions what it catches." },
    { id: 'rake',   name: 'Rake',   mass: 0.0048, gearMul: 1.60, absorb: 0.86, radAdd: 0.0014, smash: 1.20, role: 'attack' ,
      desc: "Coarse teeth that add reach and real smash, and almost no cushion at all." },
    { id: 'collar', name: 'Collar', mass: 0.0058, gearMul: 0.52, absorb: 1.30, radAdd: 0.0002, smash: 0.84, role: 'defense' ,
      desc: "The heaviest sub blade made, smooth and deep, and it swallows more than anything else stock." },
    // Vane is the REACH assist and nothing else. It measured a 37 percent ceiling
    // against 53 for fitting no assist at all, which meant its grip and its mass
    // cost more than its radius bought. Grip removed, reach raised.
    /* ⛔ VANE TOOK FOUR ATTEMPTS AND THE ANSWER WAS NOT ABOUT VANE.
       It began as a jack of all trades with the most reach in the slot and
       measured a lower ceiling than fitting NO assist at all. Reach looked like
       the fix, so radAdd went up twice, and it got worse both times.
       A sweep settled it. Holding everything else still and moving only radAdd:
         0.0006 reaches 57 percent    0.0010 reaches 48    0.0014 reaches 45
       Twelve points, one stat, and it points the wrong way. radAdd is double
       edged: it raises the moment of inertia, which protects spin, and it raises
       the CONTACT radius, so the two tops meet sooner and more often. Extra
       contacts pay only if you win them.
       And this is not Vane's problem, it is the SLOT's. Ranked by mean across
       the reference chassis, every assist with radAdd at or under 0.0008 sits
       between 47 and 49; every one at or over 0.0010 sits between 40 and 46.
       Reach is a stat that has never once been worth its price. See the open
       question in HANDOFF section 15, because the real repair is repricing it
       across the catalogue and that is a Director call, not a tuning pass. */
    { id: 'vane',   name: 'Vane',   mass: 0.0020, gearMul: 0.94, absorb: 1.14, radAdd: 0.0006, smash: 1.00, role: 'balance' ,
      desc: "Barely there at all, and what little it adds is cushion." },
    { id: 'shim',   name: 'Shim',   mass: 0.0018, gearMul: 0.90, absorb: 1.04, radAdd: 0.0000, smash: 1.06, role: 'balance' ,
      desc: "A thin packing plate that firms the rim up without changing its shape." },

    // ---- TIER 2, FORGED. One stat pushed about a quarter past the Tier 1
    //      range, and another pulled back further to pay for it. Not stronger,
    //      more extreme; that is what a tier is in this game.
    { id: 'cornice', name: 'Cornice', mass: 0.00600, gearMul: 0.62, absorb: 1.46, radAdd: 0.0008, smash: 0.72, role: 'balance', tier: 2,
      desc: "A broad steel ledge that reaches further than any other assist, with no edge on it at all." },
    { id: 'longspur', name: 'Longspur', mass: 0.00420, gearMul: 1.38, absorb: 0.68, radAdd: 0.0025, smash: 1.10, role: 'attack', tier: 2,
      desc: "All the reach of a wide rim on a light frame, with nothing left over to cushion what comes back." },
    { id: 'teasel', name: 'Teasel', mass: 0.00460, gearMul: 2.15, absorb: 0.66, radAdd: 0.0008, smash: 0.94, role: 'utility', tier: 2,
      desc: "A ring of fine hooked teeth that mesh with whatever they touch and pass every jolt straight to the tip." },
    { id: 'sprocket', name: 'Sprocket', mass: 0.00580, gearMul: 2.15, absorb: 0.98, radAdd: 0.0006, smash: 0.70, role: 'defense', tier: 2,
      desc: "A deep toothed collar that grinds spin off a rival but has no edge left to finish anyone." },
    { id: 'lacquer', name: 'Lacquer', mass: 0.00260, gearMul: 0.28, absorb: 0.68, radAdd: 0.0010, smash: 0.90, role: 'stamina', tier: 2,
      desc: "A mirror rim that gives a rival nothing to grip and gives you nothing to hide behind." },
    { id: 'bolster', name: 'Bolster', mass: 0.00560, gearMul: 0.66, absorb: 1.42, radAdd: 0.0002, smash: 0.70, role: 'defense', tier: 2,
      desc: "A thick fibre pad that swallows a blow whole, and swallows yours as well." },
    { id: 'gutta', name: 'Gutta', mass: 0.00340, gearMul: 2.35, absorb: 1.42, radAdd: 0.0006, smash: 0.86, role: 'stamina', tier: 2,
      desc: "A soft damping ring that shrugs off impacts and grips everything it meets, so every touch trades spin." },
    { id: 'barb', name: 'Barb', mass: 0.00600, gearMul: 0.34, absorb: 0.74, radAdd: 0.0005, smash: 1.30, role: 'attack', tier: 2,
      desc: "A heavy blunt wedge that hits like a hammer and drags the heavy side of the top flat." },

    // ---- TIER 3, RELIC. One stat at an extreme, plus a named drawback the
    //      simulation actually enforces. Bosses are the only source.
    { id: 'eaves', name: 'Eaves', mass: 0.00430, gearMul: 0.64, absorb: 1.52, radAdd: 0.0002, smash: 0.80, role: 'stamina', tier: 3, drawback: 'looselock',
      desc: "A deep skirt that swallows almost everything thrown at it, bolted on so loosely that one clean blow opens the whole top." },
    { id: 'nettle', name: 'Nettle', mass: 0.00500, gearMul: 3.00, absorb: 0.70, radAdd: 0.0008, smash: 0.92, role: 'utility', tier: 3, drawback: 'hungry',
      desc: "Teeth like a coarse file that tear spin off anything they touch and burn through your own." },
    { id: 'bushing', name: 'Bushing', mass: 0.00580, gearMul: 0.58, absorb: 1.70, radAdd: 0.0002, smash: 0.72, role: 'defense', tier: 3, drawback: 'looselock',
      desc: "A soft sleeve that damps every blow and never lets the threads seat tight." },
    { id: 'chert', name: 'Chert', mass: 0.00462, gearMul: 0.22, absorb: 0.68, radAdd: 0.0004, smash: 1.38, role: 'attack', tier: 3, drawback: 'oneshot',
      desc: "A knapped stone edge that lands one devastating blow and is blunt for the rest of the round." }
  ];

  // 4. RATCHET: height and lock teeth. Height moves the centre of gravity and
  //    the strike plane; teeth resist bursting. Named like the real hobby:
  //    <teeth>-<height>.
  const RATCHETS = [
    // The lightest ratchet in the game by a clear margin, which matters because
    // mass loads the tip and costs spin. It hits high, and it has no teeth worth
    // the name, so it will come apart if you let it get hit.
    { id: '0-70', name: '0-70', mass: 0.0046, height: 70, lock: 0.50, strikeHigh: 1.22, role: 'balance' ,
      desc: "No teeth worth the name at seventy millimetres, and the lightest ratchet made; it strikes high and it will come apart if you let it get hit." },
    { id: '3-60', name: '3-60', mass: 0.0064, height: 60, lock: 0.80, strikeHigh: 0.84, role: 'balance' ,
      desc: "Three teeth at sixty millimetres, the plain middle of the case." },
    { id: '5-60', name: '5-60', mass: 0.0070, height: 60, lock: 1.00, strikeHigh: 0.84, role: 'stamina' ,
      desc: "Five teeth at sixty millimetres, the same height with more holding it together." },
    { id: '9-60', name: '9-60', mass: 0.0078, height: 60, lock: 1.28, strikeHigh: 0.82, role: 'defense' ,
      desc: "Nine teeth at sixty millimetres, most of the lock available at an ordinary height." },
    { id: '4-80', name: '4-80', mass: 0.0066, height: 80, lock: 0.88, strikeHigh: 1.22, role: 'attack' ,
      desc: "Four teeth at eighty millimetres; it strikes well above the other top's rim and precesses fast for it." },
    { id: '7-40', name: '7-40', mass: 0.0074, height: 40, lock: 1.12, strikeHigh: 0.58, role: 'defense' ,
      desc: "Seven teeth at forty millimetres, low and tight and hard to reach over a wide blade." },
    { id: '1-90', name: '1-90', mass: 0.0058, height: 90, lock: 0.62, strikeHigh: 1.40, role: 'attack' ,
      desc: "One tooth at ninety millimetres, the tallest strike plane in the stock case and the easiest thing here to pop apart." },
    { id: '6-50', name: '6-50', mass: 0.0072, height: 50, lock: 1.06, strikeHigh: 0.70, role: 'stamina' ,
      desc: "Six teeth at fifty millimetres, a low steady seat with plenty of lock." },
    { id: '2-70', name: '2-70', mass: 0.0062, height: 70, lock: 0.72, strikeHigh: 1.00, role: 'balance' ,
      desc: "Two teeth at seventy millimetres, tall and only lightly held." },
    { id: '8-30', name: '8-30', mass: 0.0082, height: 30, lock: 1.20, strikeHigh: 0.46, role: 'defense' ,
      desc: "Eight teeth at thirty millimetres, the heaviest and lowest ratchet made, so nothing tips it and nothing it hits is high." },

    // ---- TIER 2, FORGED. One stat pushed about a quarter past the Tier 1
    //      range, and another pulled back further to pay for it. Not stronger,
    //      more extreme; that is what a tier is in this game.
    { id: '0-90', name: '0-90', mass: 0.00580, height: 90, lock: 0.38, strikeHigh: 1.70, role: 'attack', tier: 2,
      desc: "A smooth toothless collar with the strike ring flared out at the crown, so it lands higher than anything else in the box and starts coming apart the moment somebody lands one back." },
    { id: '11-80', name: '11-80', mass: 0.00500, height: 80, lock: 1.46, strikeHigh: 1.20, role: 'attack', tier: 2,
      desc: "Eleven teeth on a tall skeleton body, so it hits high and nothing will burst it, but there is almost no metal left in it to soak up a hit." },
    { id: '11-30', name: '11-30', mass: 0.00464, height: 30, lock: 1.40, strikeHigh: 0.16, role: 'defense', tier: 2,
      desc: "Eleven teeth in a short heavy collar that simply will not come apart, fitted with a strike face buried so far under the blade that it can barely bother anybody." },
    { id: '0-40', name: '0-40', mass: 0.00880, height: 40, lock: 0.29, strikeHigh: 0.58, role: 'defense', tier: 2,
      desc: "A solid slug of a collar that shrugs off shoves and sits low, held on a plain thread with no detents in it at all." },
    { id: '6-30', name: '6-30', mass: 0.00880, height: 30, lock: 1.04, strikeHigh: 0.14, role: 'stamina', tier: 2,
      desc: "The heaviest short collar in the workshop, lovely to grind behind and completely unable to reach over anybody." },
    { id: '11-60', name: '11-60', mass: 0.00510, height: 60, lock: 1.46, strikeHigh: 0.82, role: 'utility', tier: 2,
      desc: "A fine eleven tooth ring cut into a drilled out body, unburstable and so light that every hit moves it." },
    { id: '0-60', name: '0-60', mass: 0.00880, height: 60, lock: 0.30, strikeHigh: 0.86, role: 'balance', tier: 2,
      desc: "A thick cast sleeve at normal height that takes a shove like a wall and comes apart on one clean strike." },

    // ---- TIER 3, RELIC. One stat at an extreme, plus a named drawback the
    //      simulation actually enforces. Bosses are the only source.
    { id: '14-30', name: '14-30', mass: 0.00778, height: 30, lock: 1.70, strikeHigh: 0.14, role: 'defense', tier: 3, drawback: 'looselock',
      desc: "Fourteen coarse teeth in a collar that never seats fully, so it rides very low and very steady while the play in the thread lets it pop." },
    { id: '2-90', name: '2-90', mass: 0.00602, height: 90, lock: 1.38, strikeHigh: 1.68, role: 'attack', tier: 3, drawback: 'shear',
      desc: "A flared crown that strikes above its own height and rings every one of those blows straight back through its own teeth." },
    { id: '0-50', name: '0-50', mass: 0.00960, height: 50, lock: 0.20, strikeHigh: 0.70, role: 'utility', tier: 3, drawback: 'oneshot',
      desc: "A dead weight of a collar on a thread worn smooth, putting everything it has into the first strike it lands and almost nothing into the rest." }
  ];

  // 5. BIT (tip): what touches the floor. Also carries the rail gear.
  const BITS = [
    { id: 'flat',   name: 'Flat',   mass: 0.0042, stamina: 0.92, drive: 1.76, stable: 0.88, dash: 1.45, shaft: 0.86, role: 'attack' ,
      desc: "A broad flat face that travels hard and takes the rail, and burns its spin doing it." },
    { id: 'rush',   name: 'Rush',   mass: 0.0044, stamina: 0.88, drive: 1.52, stable: 0.92, dash: 1.55, shaft: 0.92, role: 'attack' ,
      desc: "Cut for the rail more than the floor, quick to reach it and quick to run out." },
    { id: 'needle', name: 'Needle', mass: 0.0035, stamina: 1.34, drive: 0.50, stable: 1.05, dash: 0.35, shaft: 1.10, role: 'stamina' ,
      desc: "A fine point that barely touches anything, so it turns for a very long time and goes nowhere." },
    { id: 'ball',   name: 'Ball',   mass: 0.0040, stamina: 0.96, drive: 0.78, stable: 1.05, dash: 0.55, shaft: 1.18, role: 'defense' ,
      desc: "A rolling ball that keeps its feet under a hit and never chases anybody." },
    { id: 'point',  name: 'Point',  mass: 0.0033, stamina: 1.26, drive: 0.62, stable: 0.98, dash: 0.45, shaft: 1.02, role: 'stamina' ,
      desc: "A plain sharp tip, long spinning and slow moving, and the lightest thing you can stand a top on." },
    { id: 'gearf',  name: 'Gear Flat', mass: 0.00464, stamina: 0.78, drive: 1.40, stable: 0.90, dash: 1.85, shaft: 0.80, role: 'attack' ,
      desc: "A geared flat with the most rail bite in the stock case, and the shortest spin to show for it." },
    { id: 'taper',  name: 'Taper',  mass: 0.0037, stamina: 1.28, drive: 0.98, stable: 1.02, dash: 0.58, shaft: 1.06, role: 'stamina' ,
      desc: "A tapered tip that turns nearly as long as a needle and can still cross the dish." },
    { id: 'dome',   name: 'Dome',   mass: 0.0046, stamina: 1.02, drive: 0.90, stable: 1.24, dash: 0.62, shaft: 1.14, role: 'defense' ,
      desc: "A wide dome, the hardest stock tip to knock off its feet." },
    { id: 'claw',   name: 'Claw',   mass: 0.0050, stamina: 0.86, drive: 1.88, stable: 0.82, dash: 1.62, shaft: 0.78, role: 'attack' ,
      desc: "Toothed and hungry, the fastest travelling tip made and the least stable." },
    // Spool is the tip that can do a bit of everything INCLUDING the rail; its
    // dash clears the engage threshold of 0.5 and stops short of Rail Lock's 1.2,
    // so it is the middle profile a mixed build reaches for.
    { id: 'spool',  name: 'Spool',  mass: 0.00410, stamina: 1.22, drive: 1.06, stable: 1.08, dash: 1.02, shaft: 1.06, role: 'balance' ,
      desc: "A knurled drum that does a little of everything, the rail included." },

    // ---- TIER 2, FORGED. One stat pushed about a quarter past the Tier 1
    //      range, and another pulled back further to pay for it. Not stronger,
    //      more extreme; that is what a tier is in this game.
    { id: 'bradawl', name: 'Bradawl', mass: 0.00340, stamina: 1.66, drive: 0.32, stable: 0.92, dash: 0.35, shaft: 1.02, role: 'stamina', tier: 2,
      desc: "A hardened point no wider than a pin, ground for the longest spin in the game and almost no travel at all." },
    { id: 'stillpin', name: 'Still Pin', mass: 0.00300, stamina: 1.56, drive: 0.40, stable: 0.92, dash: 0.35, shaft: 1.06, role: 'stamina', tier: 2,
      desc: "It parks where you launch it and turns for a very long time; it will not chase anybody and it cannot reach the rail." },
    { id: 'spur', name: 'Spur', mass: 0.00516, stamina: 0.86, drive: 2.06, stable: 0.82, dash: 1.55, shaft: 0.56, role: 'attack', tier: 2,
      desc: "The foot is ground on a slant so friction turns into travel, and every jolt it earns goes straight up the thin shank into the teeth." },
    { id: 'rowel', name: 'Rowel', mass: 0.00464, stamina: 0.83, drive: 1.35, stable: 0.48, dash: 2.32, shaft: 0.78, role: 'attack', tier: 2,
      desc: "A toothed wheel of a tip that hooks the rail harder than anything stock, on a contact ring too small to right itself." },
    { id: 'sabot', name: 'Sabot', mass: 0.00460, stamina: 1.00, drive: 0.88, stable: 1.55, dash: 0.60, shaft: 0.55, role: 'defense', tier: 2,
      desc: "A broad wooden shoe of a foot that nothing tips over, seated in a soft collar that hands every shock to the lock teeth." },
    { id: 'ferrule', name: 'Ferrule', mass: 0.00430, stamina: 1.06, drive: 1.00, stable: 0.60, dash: 0.72, shaft: 1.48, role: 'balance', tier: 2,
      desc: "A long steel collar driven deep into the shaft so no impact reaches the teeth, standing on a foot too narrow to hold you up." },
    { id: 'cleat', name: 'Cleat', mass: 0.00476, stamina: 1.00, drive: 1.06, stable: 1.11, dash: 2.20, shaft: 0.62, role: 'balance', tier: 2,
      desc: "A knurled stud that takes the rail on an ordinary top, bought with a shank that pops apart under one solid blow." },
    { id: 'plumb', name: 'Plumb', mass: 0.00640, stamina: 0.54, drive: 0.77, stable: 1.04, dash: 0.35, shaft: 1.06, role: 'defense', tier: 2,
      desc: "All the metal is in the foot, so shoves barely move it and the loaded tip grinds its spin into the floor." },
    { id: 'agate', name: 'Agate', mass: 0.00340, stamina: 1.62, drive: 0.58, stable: 0.78, dash: 0.35, shaft: 1.04, role: 'stamina', tier: 2,
      desc: "A polished stone pivot with almost no friction at all, so it turns for a very long time and gets nowhere." },

    // ---- TIER 3, RELIC. One stat at an extreme, plus a named drawback the
    //      simulation actually enforces. Bosses are the only source.
    { id: 'corundum', name: 'Corundum', mass: 0.00330, stamina: 1.95, drive: 0.30, stable: 0.86, dash: 0.35, shaft: 0.94, role: 'stamina', tier: 3, drawback: 'looselock',
      desc: "A jewelled pivot that runs longer than anything else, seated so loosely that one clean blow takes the whole top apart." },
    { id: 'caltrop', name: 'Caltrop', mass: 0.00496, stamina: 0.78, drive: 1.39, stable: 0.46, dash: 2.75, shaft: 0.78, role: 'attack', tier: 3, drawback: 'skittish',
      desc: "Coarse cut teeth that bite the rail like nothing in the catalogue, on a top that slides out of the dish at speeds anything else survives." },
    { id: 'cobble', name: 'Cobble', mass: 0.00460, stamina: 0.94, drive: 0.74, stable: 1.72, dash: 0.35, shaft: 0.54, role: 'defense', tier: 3, drawback: 'looselock',
      desc: "A wide flat stone of a foot that will not be tipped over, sitting so loose in the seat that one connected blow pops it apart." },
    { id: 'pintle', name: 'Pintle', mass: 0.00516, stamina: 0.99, drive: 0.30, stable: 0.94, dash: 0.35, shaft: 1.72, role: 'defense', tier: 3, drawback: 'greedy',
      desc: "The shank goes the full depth of the shaft so nothing bursts it, and it fills so fast that it will fall over rather than outlast you." },
    { id: 'jasper', name: 'Jasper', mass: 0.00439, stamina: 1.29, drive: 0.26, stable: 1.07, dash: 0.35, shaft: 0.67, role: 'stamina', tier: 3, drawback: 'coldstart',
      desc: "So slick it barely travels at all, and cold enough off the launcher that the first two seconds are wasted." }
  ];

  // 6. WEIGHTS — up to four, each dropped into a hole on one of two rings.
  //    The inner ring is mass with little wobble; the outer ring is reach,
  //    inertia and a far bigger heavy-side swing for the same gram.
  const WEIGHTS = [
    { id: 'none',  name: 'Empty',  mass: 0.0000, role: 'balance' },
    { id: 'chip',  name: 'Chip',   mass: 0.0016 },
    { id: 'slug',  name: 'Slug',   mass: 0.0034 },
    { id: 'brick', name: 'Brick',  mass: 0.0058 }
  ];
  const HOLES = 6;          // six mounting holes, 60 degrees apart
  const RINGS = [0.42, 0.80];  // radius fractions of the two weight rings
  const MAX_WEIGHTS = 4;

  // 7. COSMETIC — finish, decal and trail. These NEVER touch the simulation.
  //    Kept in the same data model so the asset pipeline and the save format
  //    only have one shape to learn, and flagged so no future balance pass can
  //    quietly give a paint job a stat. Launcher skins were the single most
  //    requested missing feature in the competition's reviews.
  const FINISHES = [
    { id: 'raw',     name: 'Raw Steel',   metal: 0.95, rough: 0.35 },
    { id: 'anod',    name: 'Anodised',    metal: 0.90, rough: 0.22 },
    { id: 'matte',   name: 'Matte Black', metal: 0.20, rough: 0.85 },
    { id: 'brass',   name: 'Brass',       metal: 1.00, rough: 0.30 },
    { id: 'enamel',  name: 'Enamel',      metal: 0.05, rough: 0.18 },
    { id: 'weather', name: 'Weathered',   metal: 0.70, rough: 0.72 },
    { id: 'chrome',  name: 'Chrome',      metal: 1.00, rough: 0.05 },
    { id: 'clay',    name: 'Fired Clay',  metal: 0.00, rough: 0.90 }
  ];
  const DECALS = ['none','stripe','sunburst','koi','tiger','wave','circuit','moth',
                  'flame','crane','chalk','knot'];
  const TRAILS  = ['none','ember','frost','rope','ink','jade','violet'];
  const LAUNCHERS = ['cord','ripcord','winder','bat','whip','spool'];
  const COSMETIC_SLOTS = { finish: FINISHES, decal: DECALS, trail: TRAILS, launcher: LAUNCHERS };

  // Roles are a browsing aid, not a rule. Nothing in the simulation reads them
  // — they exist so a player facing fifty parts can narrow to the ten that suit
  // the top they are trying to build.
  const ROLES = ['attack', 'stamina', 'defense', 'balance', 'utility'];

  const pick = (arr, id) => arr.find(p => p.id === id) || arr[0];

  // ======================================================================
  // RIG AND DRAWBACK PLUMBING
  //
  // A rig is a named synergy; a drawback is what a Relic part costs you. Both
  // want to reach INSIDE the physics rather than add a number on top of it,
  // because a flat stat bonus is exactly the linear power axis this game does
  // not have. So every one of them is expressed as a multiplier on a quantity
  // that stepTop or collide already computes, and this table is the complete
  // list of what may be reached.
  //
  // The default is every multiplier at 1, shared by reference, so an unrigged
  // top costs nothing to build and the neutral case is provably neutral: if you
  // ever see a number here that is not 1 on a stock build, something leaked.
  // ======================================================================
  const RIG_NEUTRAL = Object.freeze({
    drive: 1,        // driveK, how hard the offset contact point pushes
    bowl: 1,         // inward pull of the dish
    dashGap: 1,      // seconds between rail dashes
    railGrip: 1,     // how much of the rail's low drag this bit can claim
    inertia: 1,      // the exponent on inertia's protection of spin
    imbDrain: 1,     // spin cost of carrying a wobble
    imbSwing: 1,     // the heavy-side impact swing
    exitNeed: 1,     // radial speed needed to ring YOU out
    precess: 1,      // precession rate
    rise: 1, fall: 1,// how hard friction rights you, and how fast you topple
    jnTake: 1,       // incoming normal impulse
    taken: 1,        // recoil you absorb
    recoilPay: 1,    // recoil the striker pays back
    steal: 1,        // rim friction, always
    stealOpp: 1,     // rim friction, only against an opposite spin
    jtCap: 1,        // ⛔ the ceiling on rim friction. Raising `steal` alone does
                     // NOTHING once jt is saturated, and on a hooked gripping
                     // build it is saturated almost every hit. Spin Thief moved
                     // the outcome by 0.0 points until this lever existed.
    massCost: 1,     // how hard raw mass is punished in spin decay
    burstTake: 1,    // lock wear you take
    charge: 1,       // ability charge rate
    decay: 1         // baseline spin decay
  });
  const rigOf = spec => (spec && spec.rig) || RIG_NEUTRAL;

  /* Drawbacks are named behaviours a Relic part carries. Each one is a real
   * thing that happens in a round, not a number pretending to be a cost; a
   * drawback that never fires is power creep in a costume. */
  const DRAWBACKS = [
    // ⛔ GLASS DOES NOT BELONG ON A STAMINA PART, and it took a part that could
    // not be balanced to notice. It doubles recoil below forty percent spin, and
    // a stamina part is BUILT to still be turning down there, so it spends most
    // of a long round inside the danger band. That is not a drawback with a
    // trigger, it is a permanent doubling with a story attached. It belongs on
    // something that means to finish the round early.
    { id: 'glass',     name: 'Glass',
      desc: 'Below a third of its spin the metal gives; it takes double recoil once it is tired.' },
    { id: 'greedy',    name: 'Greedy',
      desc: 'Charges much faster but will never coast to a win; when it runs down it falls over.' },
    { id: 'coldstart', name: 'Cold Start',
      desc: 'Sluggish for the first two and a half seconds, then faster than anything else.' },
    { id: 'looselock', name: 'Loose Lock',
      desc: 'Very hard to knock over and very easy to pop apart.' },
    { id: 'hungry',    name: 'Hungry',
      desc: 'Tears spin off whatever it touches and burns through its own.' },
    { id: 'oneshot',   name: 'One Shot',
      desc: 'The first hit it lands can end a round; everything after it barely counts.' },
    // Two more, proposed and measured during the tier expansion. Both are a
    // change to a quantity the simulation already computes, which is the bar a
    // drawback has to clear; neither is a special case.
    { id: 'skittish',  name: 'Skittish',
      desc: 'It will slide out of the dish at a speed anything else would ride out.' },
    { id: 'shear',     name: 'Shear',
      desc: 'Every blow it lands rings back through its own teeth at full force.' }
  ];
  const drawbackOf = id => DRAWBACKS.find(d => d.id === id) || null;

  // ======================================================================
  // TUNING — filing, waxing and drilling, straight out of the beigoma tradition
  // where players modify the top they already own instead of buying a better
  // one. Every operation is a TRADE, is FREE, and is FULLY REVERSIBLE. There is
  // no currency in this game and there is never going to be one, so tuning is a
  // puzzle and not a treadmill.
  //
  // Mods are stored on the CONFIG keyed by part id, never on the part, so the
  // catalogue stays a constant and a filed blade stays filed when you take it
  // off and put it back on. They are applied here inside build(), which means
  // nothing downstream of build — not the renderer, not the harness, not the
  // collision code — ever needs to know tuning exists.
  // ======================================================================
  const TUNING = [
    { id: 'file',   name: 'File',   slots: ['blade'],  max: 3,
      d: { sharp: +0.06, taken: +0.05 },
      desc: 'Cuts the edge in for more bite; the thinner edge takes recoil worse.' },
    { id: 'polish', name: 'Polish', slots: ['blade', 'assist'], max: 2,
      d: { gear: -0.15, rest: +0.03, gearMul: -0.15, absorb: +0.03 },
      desc: 'Smooths the rim so it slides instead of grabbing.' },
    { id: 'wax',    name: 'Wax',    slots: ['bit'],    max: 3,
      d: { stamina: +0.06, drive: -0.08 },
      desc: 'Slicks the tip for a longer spin; it stops digging in and travels less.' },
    { id: 'knurl',  name: 'Knurl',  slots: ['bit'],    max: 2,
      d: { dash: +0.10, stamina: -0.05 },
      desc: 'Cuts grip into the tip so it bites the rail; the extra friction costs spin.' },
    { id: 'shim',   name: 'Pack',   slots: ['ratchet'], max: 2,
      d: { lock: +0.08, height: +2 },
      desc: 'Packs the thread so the teeth sit tight; it also raises the top.' },
    { id: 'drill',  name: 'Drill',  slots: ['blade'],  max: 3,
      d: { mass: -0.0008, taken: +0.04 },
      desc: 'Removes metal to lighten the blade; what is left is thinner and weaker.' },
    { id: 'bevel',  name: 'Bevel',  slots: ['assist'], max: 2,
      d: { smash: +0.05, absorb: -0.08 },
      desc: 'Angles the sub blade forward for a harder hit and a worse cushion.' }
  ];
  const MODS_PER_PART = 3;   // a part can only take so much filing before it is ruined

  const tuningOp = id => TUNING.find(t => t.id === id) || null;

  /* Which operations may be applied to this part right now, and why not.
   * The workshop reads this; the simulation never does. */
  function tuningOptions(slot, partId, mods) {
    // An empty assist slot is not a part; there is nothing to file.
    if (slot === 'assist' && partId === 'none') return [];
    const list = (mods && mods[partId]) || [];
    return TUNING.filter(t => t.slots.indexOf(slot) >= 0).map(t => {
      const used = list.filter(x => x === t.id).length;
      return {
        op: t, used,
        canAdd: used < t.max && list.length < MODS_PER_PART,
        why: used >= t.max ? 'at its limit'
           : list.length >= MODS_PER_PART ? 'three changes is all a part will take'
           : ''
      };
    });
  }

  /* Fold a part's mods into a copy of it. The copy is what build() uses; the
   * catalogue entry itself is never touched, which is what makes every
   * operation reversible by deleting one entry from an array. */
  function applyMods(part, slot, mods) {
    const list = (mods && mods[part.id]) || [];
    if (!list.length) return part;
    const out = Object.assign({}, part);
    let applied = 0;
    const count = {};
    for (const opId of list) {
      const t = tuningOp(opId);
      if (!t || t.slots.indexOf(slot) < 0) continue;
      count[opId] = (count[opId] || 0) + 1;
      if (count[opId] > t.max || applied >= MODS_PER_PART) continue;
      applied++;
      for (const k in t.d) if (out[k] !== undefined) out[k] += t.d[k];
    }
    // Physical floors. Filing a blade to nothing is not a strategy.
    if (out.mass !== undefined) out.mass = Math.max(0.0060, out.mass);
    if (out.stamina !== undefined) out.stamina = Math.max(0.30, out.stamina);
    if (out.drive !== undefined) out.drive = Math.max(0.20, out.drive);
    if (out.absorb !== undefined) out.absorb = Math.max(0.40, out.absorb);
    if (out.gear !== undefined) out.gear = Math.max(0.05, out.gear);
    if (out.gearMul !== undefined) out.gearMul = Math.max(0.05, out.gearMul);
    out.tuned = applied;
    return out;
  }

  /* build(config) -> spec
   * config = { core, blade, assist, ratchet, bit, weights:[{id,hole,ring}], dir,
   *            mods:{partId:[opId,...]} }
   * Every derived number a match needs is computed once, here.
   */
  function build(cfg) {
    const mods = cfg.mods || null;
    const core = applyMods(pick(CORES, cfg.core), 'core', mods);
    const blade = applyMods(pick(BLADES, cfg.blade), 'blade', mods);
    const assist = applyMods(pick(ASSISTS, cfg.assist), 'assist', mods);
    const rat = applyMods(pick(RATCHETS, cfg.ratchet), 'ratchet', mods);
    const bit = applyMods(pick(BITS, cfg.bit), 'bit', mods);

    const R = blade.radius + assist.radAdd;
    let m = core.mass + blade.mass + assist.mass + rat.mass + bit.mass;

    // counterweights: mass, and the vector sum of their positions
    let ix = 0, iz = 0, wMass = 0, wInertia = 0;
    const slots = (cfg.weights || []).slice(0, MAX_WEIGHTS);
    for (const w of slots) {
      const p = pick(WEIGHTS, w.id);
      if (!p.mass) continue;
      const ang = (w.hole % HOLES) * (Math.PI * 2 / HOLES);
      const r = R * RINGS[(w.ring | 0) % RINGS.length];
      ix += p.mass * r * Math.cos(ang);
      iz += p.mass * r * Math.sin(ang);
      wMass += p.mass;
      wInertia += p.mass * r * r;
    }
    m += wMass;

    // Static imbalance, normalised. Three weights spread evenly cancel out and
    // give a heavy, perfectly balanced top. Bunched on one side, you get a
    // wild, hard-hitting, short-lived one.
    const imb = Math.min(0.42, Math.hypot(ix, iz) / (m * R));
    const imbAng = Math.atan2(iz, ix);

    const I = 0.55 * m * R * R + wInertia;
    const cogH = rat.height / 60;

    // Drawbacks ride on the parts. Two of them are pure stat effects and are
    // folded in here; the other four are behaviours and are read by stepTop and
    // collide at the moment they matter.
    const dw = {};
    for (const p of [core, blade, assist, rat, bit]) if (p.drawback) dw[p.drawback] = true;
    const lockMul = dw.looselock ? 0.5 : 1;
    const stableMul = dw.looselock ? 1.3 : 1;

    // Echo back only the mods that actually landed on a fitted part, so two
    // configs that behave identically also SERIALISE identically. An empty
    // mods object and no mods object are the same top and must not read as
    // different ones; the determinism test is what caught that.
    let usedMods;
    if (mods) for (const p of [core, blade, assist, rat, bit]) {
      const l = mods[p.id];
      if (l && l.length) (usedMods = usedMods || {})[p.id] = l.slice();
    }

    return {
      cfg: { core: core.id, blade: blade.id, assist: assist.id,
             ratchet: rat.id, bit: bit.id, weights: slots, mods: usedMods },
      m, R, I, imb, imbAng, cogH,
      dir: cfg.dir !== undefined ? cfg.dir : core.dir,
      // combat
      sharp: blade.sharp,
      smash: blade.sharp * assist.smash,
      rest: blade.rest,
      gear: blade.gear * assist.gearMul,
      absorb: assist.absorb / Math.pow(cogH, 0.30),
      taken: blade.taken,
      strikeHigh: rat.strikeHigh,
      burstResist: rat.lock * bit.shaft * lockMul,
      // motion
      stamina: bit.stamina * (1 - 0.42 * imb),
      drive: bit.drive * (1 + K.imbDrive * imb),
      stable: bit.stable * stableMul / Math.pow(cogH, 0.25),
      dash: bit.dash,
      // ability
      ability: core.ability,
      chargeRate: core.charge * (dw.greedy ? 1.40 : 1),
      // rigs and relic drawbacks
      rig: RIG_NEUTRAL,
      dw,
      tier: Math.max(core.tier || 1, blade.tier || 1, assist.tier || 1, rat.tier || 1, bit.tier || 1)
    };
  }

  // ======================================================================
  // ABILITIES — pre-programmed. The player picks a trigger before launch and
  // then never touches the screen again. All of them are physics edits, not
  // cutscenes; every one is visible in the motion of the top.
  // ======================================================================
  const TRIGGERS = ['charged', 'lowSpin', 'thirdHit', 'onRidge', 'behind',
                    'firstBlood', 'cornered', 'mirror', 'late'];

  // Player-facing names for the two-line program the workshop shows. No dashes.
  const TRIGGER_LABEL = {
    charged: 'it is charged', lowSpin: 'spin drops below half', thirdHit: 'the third hit lands',
    onRidge: 'it reaches the rail', behind: 'it falls behind', firstBlood: 'it draws first blood',
    cornered: 'it is cornered', mirror: 'they spin the same way', late: 'eight seconds have passed'
  };

  function triggerReady(a, b) {
    if (a.charge < 1) return false;
    switch (a.trigger) {
      case 'charged':    return true;
      case 'lowSpin':    return Math.abs(a.w) < 0.45 * K.launchSpin;
      case 'thirdHit':   return a.hits >= 3;
      case 'onRidge':    return Math.hypot(a.x, a.z) > K.ridgeAt * a.arenaR;
      case 'behind':     return Math.abs(a.w) < Math.abs(b.w) * 0.85;
      // You landed the opening strike of the round and they have landed none.
      case 'firstBlood': return a.landed >= 1 && b.landed === 0;
      // Pinned outside the ridge for a full second, which is a different state
      // from merely touching the rail on the way past.
      case 'cornered':   return a.ridgeT >= 1.0;
      // Same spin is the violent short matchup; this fires only in it.
      case 'mirror':     return Math.sign(a.w) === Math.sign(b.w);
      case 'late':       return a.t >= 8;
      default:           return true;
    }
  }

  function fire(a, b) {
    a.charge = 0; a.abilityUsed++; a.fx = a.spec.ability;
    switch (a.spec.ability) {
      case 'surge':                                   // steal spin back
        a.w += Math.sign(a.w) * 190; break;
      case 'anchor':                                  // stand up, dig in
        setLean(a, K.leanEq * 0.5); a.anchor = a.t + 2.4; break;
      case 'overdrive':                               // travel doubles
        a.boost = a.t + 2.6; break;
      case 'rebound':                                 // next hit is returned
        a.rebound = a.t + 3.0; break;
      case 'reversal':                                // flip spin direction
        // ⛔ 0.72 was too expensive to ever be worth firing, and 0.86 still was.
        // Hollow, the stock core that carries this, is the ONLY Tier 1 part in
        // the game with no build where it is competitive, and the cause is not
        // the chip, it is the move: reversal measures 33.6 percent against 46.1
        // for lunge, the weakest of all eighteen. At 0.93 the flip from meshing
        // to scrubbing finally costs less than it buys.
        a.w = -a.w * 0.93; a.spec = Object.assign({}, a.spec, { dir: -a.spec.dir }); break;
      case 'burrow':                                  // dig in and stop moving
        a.burrow = a.t + 2.8; break;
      case 'lash':                                    // next three hits bite
        a.lash = 3; break;
      case 'lunge':                                   // one hard jump at them
        {
          const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 1;
          a.vx += dx / d * 1.55; a.vz += dz / d * 1.55;
        }
        break;
      case 'brake':                                   // trade travel for spin
        a.w += Math.sign(a.w) * Math.hypot(a.vx, a.vz) * 240;
        a.vx *= 0.15; a.vz *= 0.15; break;
      case 'shed':                                    // drop the counterweights
        a.spec = Object.assign({}, a.spec, {
          imb: 0, drive: a.spec.drive / (1 + K.imbDrive * a.spec.imb),
          stamina: a.spec.stamina / (1 - 0.42 * a.spec.imb),
          m: a.spec.m * 0.94
        });
        break;

      // ---- second wave. Every one of these is visible in the motion of the
      // top without a caption, which is the bar an ability has to clear here.
      case 'tether':                                  // stop falling into the middle
        a.tether = a.t + 3.0; break;
      case 'scatter':                                 // cancel the wobble, keep the metal
        a.spec = Object.assign({}, a.spec, {
          imb: 0, imbAng: 0,
          drive: a.spec.drive / (1 + K.imbDrive * a.spec.imb),
          stamina: a.spec.stamina / (1 - 0.42 * a.spec.imb)
        });
        break;
      case 'bite':                                    // a spin steal window
        a.bite = a.t + 2.0; break;
      case 'stoneskin':                               // plant and take it
        a.stone = a.t + 3.0; break;
      case 'backspin':                                // grip the wrong way round
        a.backspin = a.t + 2.5; break;
      case 'pitch':                                   // spend spin on one shove
        {
          const dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz) || 1;
          const spend = Math.abs(a.w) * 0.25;
          a.w -= Math.sign(a.w) * spend;
          // Outward from THEM, so it shoves whichever of you is nearer the lip.
          // Aiming it at their side of the dish is the point; catching your own
          // ringout on the rebound is the risk you took.
          b.vx -= dx / d * 1.90; b.vz -= dz / d * 1.90;
          a.vx += dx / d * 0.55; a.vz += dz / d * 0.55;
        }
        break;
      case 'echo':                                    // give it back
        {
          const back = a.lastHitBy;
          if (back && back !== 'echo') {
            const saved = a.spec;
            a.spec = Object.assign({}, a.spec, { ability: back });
            a.abilityUsed = 0; a.charge = 1;
            fire(a, b);
            a.spec = Object.assign({}, saved, { ability: 'echo' });
            a.abilityUsed = 1; a.charge = 0; a.fx = 'echo';
          }
        }
        break;
      case 'windup':                                  // wind up, then let go
        a.windUp = a.t + 1.5; break;
      case 'kindle':                                  // stop slowing down
        // ⛔ A NINETEENTH ABILITY, and it exists because of a measurement rather
        // than a wish. A core reaches the simulation through exactly three
        // things: mass, charge and its move. Sweeping mass from 0.0012 to 0.0042
        // moves a core's mean UP three points and sweeping charge from 1.50 to
        // 0.88 moves it down two, while the abilities themselves span 33.6
        // percent for reversal to 46.1 for lunge. The numbers are inert; the move
        // is the whole part. So two cores carrying the same move are the same
        // core, and Tinder was Ember with a spare tenth of a gram.
        a.kindle = a.t + 4.0; break;
    }
  }

  // ======================================================================
  // THE LAUNCH
  //
  // ⛔⛔ THIS IS THE MOST IMPORTANT COMMENT IN THE FILE, because getting it wrong
  // invalidated every number in the project once already.
  //
  // Two tops land on a circle of radius `offset`, so they are
  // 2 * offset * sin(separation / 2) apart, and they clear each other only when
  // that exceeds the sum of their radii. Below that they spawn INSIDE one
  // another, which is not a launch, it is an impossible state that the collision
  // solver then resolves as a violent shove.
  //
  // Every measurement tool in this project used to draw two INDEPENDENT random
  // angles. Seventeen percent of every measured round therefore began with the
  // two tops interpenetrating. The balance matrix, the finish mix, the pacing
  // targets, the part audit, the ladder curve and every gate that reads them
  // were all verified against a launch the game never produces. The game itself
  // spawned exactly opposite, which is a different distribution again, and
  // measured as genuinely unbalanced: four of the sixteen matrix cells outside
  // the 30 to 70 band once anybody looked.
  //
  // So the rule lives HERE, once, and the game and the tools both call it. The
  // separation is DERIVED from the actual radii of the two tops being launched,
  // because radii run from 0.019 to 0.030 with an assist fitted and any fixed
  // number is wrong for most pairs.
  //
  // The offset came down from 0.085 to 0.066 in the same pass. Something had to
  // move: with the overlap removed the round median fell to 5.83 against an
  // acceptance floor of 6.0. The offset is a spawn parameter rather than one of
  // the tuned physics constants, so it is the least invasive thing to move, and
  // it happens to fix the OTHER complaint in the brief at the same time. Round
  // p10 was 1.3 seconds and section 15 flagged that tail as a problem; it is now
  // 1.67, and the median sits at 6.58, comfortably inside the band.
  // ======================================================================
  const LAUNCH = {
    offset: 0.066,   // how far from the centre a top lands, in metres
    margin: 0.08     // clearance beyond just touching, as a fraction of the radii
  };

  function launchAngles(rnd, specA, specB, offset) {
    const off = offset || LAUNCH.offset;
    const need = (specA.R + specB.R) * (1 + LAUNCH.margin);
    const ratio = need / (2 * off);
    const minSep = ratio >= 1 ? Math.PI : 2 * Math.asin(ratio);
    const a = rnd() * Math.PI * 2;
    // uniform over the whole circle MINUS the forbidden window either side of a
    const b = a + minSep + rnd() * (Math.PI * 2 - 2 * minSep);
    return [a, b];
  }

  // ======================================================================
  // STATE
  // ======================================================================
  function spawn(spec, opts) {
    const o = opts || {};
    const ang = o.angle !== undefined ? o.angle : 0;
    const off = o.offset !== undefined ? o.offset : LAUNCH.offset;
    const power = o.power !== undefined ? o.power : 1.0;
    const lean = o.lean !== undefined ? o.lean : K.theta0;
    return {
      spec,
      // The dish is a property of the ROUND, not of the game. A giant top needs
      // a wider one and the target range is wider again; everything else in the
      // simulation reads this rather than the constant.
      arenaR: o.arenaR !== undefined ? o.arenaR : K.arenaR,
      // ⛔ A WIDER DISH NEEDS THIS AND IT IS NOT COSMETIC. K.bowl is an
      // ACCELERATION of bowl times r, so widening the arena scales the rim pull
      // linearly and the rail walks out of reach: at 0.230 the ridge starts
      // where the pull is 1.99 m/s^2 against 1.30 at the standard ridge, and
      // nothing ever gets near the lip again. Setting bowlMul to 0.150/0.230
      // holds bowl times arenaR constant, so a bigger dish keeps its SHAPE
      // rather than turning into a different game.
      bowlMul: o.bowlMul !== undefined ? o.bowlMul : 1,
      pinned: !!o.pinned,          // a Taya target: present, struck, and inert
      x: Math.cos(ang) * off, z: Math.sin(ang) * off,
      vx: o.vx || 0, vz: o.vz || 0,
      w: spec.dir * K.launchSpin * power,
      lx: Math.cos(ang + Math.PI) * lean, lz: Math.sin(ang + Math.PI) * lean,
      phase: o.phase !== undefined ? o.phase : 0,   // heavy-side rotation phase
      wear: 0, charge: 0, abilityUsed: 0, fx: null,
      trigger: o.trigger || 'charged',
      boost: 0, anchor: 0, rebound: 0, burrow: 0, lash: 0, dashAt: -9,
      // second wave of abilities and the Relic drawbacks
      tether: 0,        // Tether: bowl pull halved until this time
      bite: 0,          // Bite: rim friction tripled until this time
      stone: 0,         // Stoneskin: recoil taken cut, travel gone
      backspin: 0,      // Backspin: rim friction sign flipped, travel unchanged
      windUp: 0,        // Wind Up: charge until this time, then release
      kindle: 0,        // Kindle: spin decay halved until this time
      lastHitBy: null,  // Echo: which ability last landed on you
      ridgeT: 0,        // how long you have been outside the ridge, for cornered
      landed: 0,        // strikes you have landed, for One Shot and firstBlood
      alive: true, cause: null, t: 0, lastHit: -9, hits: 0, taken: 0
    };
  }

  function setLean(a, th) {
    const c = Math.hypot(a.lx, a.lz) || 1e-6;
    a.lx *= th / c; a.lz *= th / c;
  }
  function bumpLean(a, amount) {
    const th = Math.hypot(a.lx, a.lz) || 1e-6;
    const k = (th + amount) / th;
    a.lx *= k; a.lz *= k;
  }
  function kill(a, cause) { a.alive = false; a.cause = cause; a.w = 0; }
  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;

  // ======================================================================
  // STEP
  // ======================================================================
  function stepTop(a, dt) {
    if (!a.alive) return;
    // A Taya target is placed in the circle and struck. It is present in the
    // collision solver and absent from everything else, so it needs one early
    // return rather than a flag threaded through nine formulas. It still dies
    // if it bursts, which is the entire point of the mode.
    if (a.pinned) {
      a.t += dt;
      a.vx = a.vz = 0;
      if (a.wear >= K.burstWear) kill(a, 'burst');
      return;
    }
    const s = a.spec;
    const g = rigOf(s);          // rig and drawback multipliers, all 1 by default
    const aw = Math.abs(a.w);
    let th = Math.hypot(a.lx, a.lz);
    if (th < 1e-6) { a.lx = 1e-6; th = 1e-6; }
    const ux = a.lx / th, uz = a.lz / th;

    a.phase += a.w * dt;                       // heavy side goes round

    // 1. PRECESSION. Faster with a higher centre of gravity.
    const wp = clamp(Math.sign(a.w) * K.precScale * g.precess * s.m * K.g * s.R * s.cogH /
                     (s.I * Math.max(aw, 40)), -K.precMax, K.precMax);
    const ca = Math.cos(wp * dt), sa = Math.sin(wp * dt);
    const nlx = a.lx * ca - a.lz * sa, nlz = a.lx * sa + a.lz * ca;
    a.lx = nlx; a.lz = nlz;

    // 2. RISE / FALL. Friction rights a fast top and fells a slow one.
    const burrowing = a.t < a.burrow;
    const wStable = K.wStable / (0.55 + 0.45 * s.stable * (burrowing ? 2.2 : 1));
    const ratio = aw / wStable;
    const thEq = K.leanEq * (0.55 + 0.75 * s.drive);
    let dth;
    if (a.t < a.anchor) dth = -K.riseK * g.rise * (th - K.leanEq * 0.5) * 2.0;
    // ⛔ A DEAD END, KEPT SO IT IS NOT TRIED TWICE.
    // The part audit says filling all four weight holes beats leaving them empty
    // by about thirteen win points, and "always fill the slots" is the kind of
    // single right answer this design exists to avoid. The obvious fix looked
    // like physics: rim mass buys spin life through the inertia term, so make the
    // same inertia SLOW recovery, since the restoring torque scales with mass
    // while the tilt inertia resisting it scales with mass and radius squared.
    // A real rim loaded top is genuinely stubborn to stand back up.
    // It was implemented as recover = (iRef/I)^0.45 folded into the rise branch.
    // The balance harness survived it, and everything else got WORSE: the worst
    // ceiling spread went from 24.2 to 29.7 and Vane dropped back under the
    // floor. It also did not move the weight count curve at all, 12.9 to 13.1,
    // because the curve is not driven by inertia in the first place.
    // What actually drives it is IMBALANCE, and the audit's own imbalance bands
    // say so: balanced 39, slight 41, wobbly 44, feral 45. Weights create
    // imbalance, imbalance is rewarded on purpose, and section 6.2 of the brief
    // calls that reward a feature. So the two rules were in conflict and the
    // gate was the thing that had to change, not the physics. See partaudit.js.
    if (a.t < a.anchor) dth = -K.riseK * g.rise * (th - K.leanEq * 0.5) * 2.0;
    else if (ratio > 1)  dth = -K.riseK * g.rise * (th - thEq) * Math.min(ratio - 1, 1.6);
    else                 dth =  K.fallK * g.fall * (th + 0.012) * (1 - ratio);
    th = Math.max(0.004, th + dth * dt);
    setLean(a, th);

    // 3. DRIVE. The offset contact point pushes perpendicular to the lean.
    const dsign = Math.sign(a.w) || 1;
    const px = -a.lz / th, pz = a.lx / th;
    // Cold Start: a Relic that is sluggish off the launcher and then faster than
    // anything else. Two stages on one timer, the same shape Wind Up uses.
    const cold = s.dw && s.dw.coldstart ? (a.t < 2.5 ? 0.60 : 1.30) : 1;
    const wind = a.windUp > 0 ? (a.t < a.windUp ? 0.50 : (a.t < a.windUp + 2.0 ? 1.80 : 1)) : 1;
    const boost = (a.t < a.boost ? 2.0 : 1.0) * (burrowing ? 0.30 : 1.0) * cold * wind *
                  (a.t < a.stone ? 0.40 : 1.0);
    const drive = K.driveK * g.drive * s.drive * th * Math.min(aw / 300, 1.4) * boost;
    a.vx += (px * dsign * drive + ux * drive * 0.22) * dt;
    a.vz += (pz * dsign * drive + uz * drive * 0.22) * dt;

    // 4. BOWL + RIDGE. Flat dish inside, reversing slope on the outer ring.
    const rad = Math.hypot(a.x, a.z);
    a._rad = rad;
    if (rad > 1e-5) {
      const u = rad / a.arenaR;
      const over = Math.max(0, u - K.ridgeAt) / (1 - K.ridgeAt);
      const tether = a.t < a.tether ? 0.5 : 1;   // Tether: hold the rail
      const pull = K.bowl * a.bowlMul * g.bowl * tether * rad * (1 - K.ridgeFall * over * over);
      a.vx -= (a.x / rad) * pull * dt;
      a.vz -= (a.z / rad) * pull * dt;

      // 4b. RAIL DASH. A geared bit that reaches the ridge with enough speed
      //     grabs it and slingshots inward. This is the attack type's kill
      //     route and the loudest moment in a match.
      const sp = Math.hypot(a.vx, a.vz);
      if (over > 0.35 && sp > K.dashSpeed / Math.max(s.dash, 0.2) &&
          a.t - a.dashAt > K.dashGap * g.dashGap && s.dash > 0.5) {
        const tx = -a.z / rad, tz = a.x / rad;
        // An unbalanced top slams its gear into the rail — more bite, and it
        // is the one real reward a brawler gets for carrying a wobble.
        const gain = K.dashGain * s.dash * (1 + K.imbDash * g.imbSwing * s.imb);
        a.vx += (tx * dsign * 0.72 - (a.x / rad) * 0.68) * gain * dt * 60 * K.dt;
        a.vz += (tz * dsign * 0.72 - (a.z / rad) * 0.68) * gain * dt * 60 * K.dt;
        a.w -= dsign * K.dashCost * s.dash;
        a.dashAt = a.t; a.fx = 'dash';
      }
      if (over > 0.35) { a.charge += K.chargeRidge * s.chargeRate * g.charge * dt; a.ridgeT += dt; }
      else a.ridgeT = 0;
    }

    // 5. DRAG. The ridge is a machined rail, not dish floor — it holds speed,
    //    which is what lets a fast top ride it instead of glancing off it.
    // Only a geared bit engages the rail. A needle tip just scrapes along it.
    const onRail = a._rad > K.ridgeAt * a.arenaR;
    const grip = onRail ? 1 - (1 - K.railDrag) * clamp((s.dash - 0.5) / 1.35, 0, 1) * g.railGrip : 1;
    const drag = Math.max(0, 1 - K.floorMu * grip * dt);
    a.vx *= drag; a.vz *= drag;

    // 6. SPIN DECAY. Lean, travel and imbalance all cost spin.
    const stam = 1 + K.stamPow * (s.stamina - 1);
    // Mass loads the tip: a heavy top pays for its momentum in friction. But
    // mass carried at the RIM buys rotational inertia, which the same friction
    // torque takes longer to bleed. Where the metal sits matters, not just how
    // much of it there is — this is what gives wide blades and the outer weight
    // ring their identity.
    const load = Math.pow(s.m / 0.035, K.massCost * g.massCost) *
                 Math.pow(K.iRef / s.I, K.inertiaPow * g.inertia);
    // Hungry: it tears spin off whatever it touches and burns through its own.
    // Kindle: for four seconds it simply stops slowing down, which is visible
    // because its blur holds while the other top's keeps fading.
    const greed = (s.dw && s.dw.hungry ? 1.25 : 1) * g.decay * (a.t < a.kindle ? 0.50 : 1);
    const decay = load * greed * (K.spinBase + K.spinLean * th * 40 + K.spinSlip * drive * 60 +
                          K.imbDrain * g.imbDrain * s.imb * 40) / stam;
    a.w -= dsign * decay * dt;
    if (Math.sign(a.w) !== dsign) a.w = 0;

    // 7. INTEGRATE
    a.x += a.vx * dt; a.z += a.vz * dt; a.t += dt;

    // 8. WALL
    const nr = Math.hypot(a.x, a.z);
    if (nr > a.arenaR) {
      const nx = a.x / nr, nz = a.z / nr;
      const vn = a.vx * nx + a.vz * nz;
      const sector = Math.cos(Math.atan2(a.z, a.x) * K.pockets);
      // Skittish: it leaves the dish at a speed anything else would ride out.
      const need = K.exitNeed * g.exitNeed * (s.dw && s.dw.skittish ? 0.55 : 1) *
                   (sector > 0.62 ? K.pocketMu : 1) * (a.t < a.anchor ? 6 : 1);
      if (nr > a.arenaR * K.ringOut && vn > need) { kill(a, 'ringout'); return; }
      if (vn > 0) {
        a.vx -= (1 + K.wallE) * vn * nx;
        a.vz -= (1 + K.wallE) * vn * nz;
        a.w *= 0.945;
        bumpLean(a, vn * 0.10 * K.tiltHit);
      }
      a.x = nx * a.arenaR * 0.999; a.z = nz * a.arenaR * 0.999;
    }

    // 9. DEATH
    // Greedy: it charges fast and it will never coast to a win. Run it down and
    // it falls over instead of stopping, which is worth two points to them, so
    // you have to actually finish a Greedy top rather than outlast it.
    const dead = K.spinDead + (s.dw && s.dw.greedy ? 40 : 0);
    if (a.wear >= K.burstWear) kill(a, 'burst');
    else if (Math.abs(a.w) <= dead) kill(a, s.dw && s.dw.greedy ? 'knockout' : 'spinout');
    else if (Math.hypot(a.lx, a.lz) >= K.thetaMax)
      kill(a, (a.t - a.lastHit) < 0.60 ? 'knockout' : 'spinout');
  }

  // ======================================================================
  // COLLISION
  // ======================================================================
  // Recoil the striker pays back. Pulled out so the rig multiplier reads in one
  // place rather than being buried mid-expression.
  const aggG_recoil = g => g.recoilPay;

  function collide(a, b, rnd) {
    if (!a.alive || !b.alive) return null;
    const aG = rigOf(a.spec), bG = rigOf(b.spec);
    const dx = b.x - a.x, dz = b.z - a.z;
    const d = Math.hypot(dx, dz);
    const sum = a.spec.R + b.spec.R;
    if (d >= sum || d < 1e-9) return null;

    const nx = dx / d, nz = dz / d;
    const pen = (sum - d) * 0.5 + 1e-5;
    a.x -= nx * pen; a.z -= nz * pen;
    b.x += nx * pen; b.z += nz * pen;

    const jit = (rnd() - 0.5) * 0.16;
    const cj = Math.cos(jit), sj = Math.sin(jit);
    const nX = nx * cj - nz * sj, nZ = nx * sj + nz * cj;
    const tX = -nZ, tZ = nX;

    const ma = a.spec.m, mb = b.spec.m;
    const inv = 1 / ma + 1 / mb;

    const rvn = (b.vx - a.vx) * nX + (b.vz - a.vz) * nZ;
    if (rvn > 0) return null;

    // who is the aggressor: whoever is driving into the contact
    const aInto = (a.vx * nX + a.vz * nZ), bInto = -(b.vx * nX + b.vz * nZ);
    const aggIsA = aInto >= bInto;
    const agg = aggIsA ? a : b, def = aggIsA ? b : a;

    // heavy-side timing: a counterweighted top hits much harder when the
    // weight is coming round at the moment of contact, and softer when it
    // isn't. This is the drama generator.
    // The heavy side has to actually be coming round. Clamped so a swing can
    // soften a hit to almost nothing or nearly double it, but never invert it.
    const aggG = aggIsA ? aG : bG, defG = aggIsA ? bG : aG;
    const swing = clamp(1 + K.imbSwing * aggG.imbSwing * agg.spec.imb *
                        Math.sin(agg.phase * 0.5 + agg.spec.imbAng), 0.18, 2.10);

    const e = 0.5 * (a.spec.rest + b.spec.rest);
    const lash = agg.lash > 0 ? 1.60 : 1;
    let jn = -(1 + e) * rvn / inv * (0.72 + 0.62 * agg.spec.smash) * swing * lash;

    jn *= defG.jnTake;                              // Deadweight and its kin
    if (def.t < def.rebound) { jn *= 1.55; def.rebound = 0; def.fx = 'rebound'; }

    a.vx -= jn * nX / ma; a.vz -= jn * nZ / ma;
    b.vx += jn * nX / mb; b.vz += jn * nZ / mb;

    // tangential: rim friction. Opposite spin meshes and shares spin;
    // same spin scrubs and drains both.
    // Backspin flips only the RIM friction sign, not the direction of travel,
    // which is why it reads as a top that suddenly grips the wrong way without
    // turning round.
    const sgnA = a.t < a.backspin ? -1 : 1, sgnB = b.t < b.backspin ? -1 : 1;
    const rimA = sgnA * a.w * a.spec.R, rimB = -sgnB * b.w * b.spec.R;
    const rvt = ((b.vx - a.vx) * tX + (b.vz - a.vz) * tZ) + (rimB - rimA);
    const opposite = Math.sign(a.w) !== Math.sign(b.w);
    const gearA = a.spec.gear * (a.t < a.bite ? 3 : 1) * (a.spec.dw && a.spec.dw.hungry ? 1.40 : 1);
    const gearB = b.spec.gear * (b.t < b.bite ? 3 : 1) * (b.spec.dw && b.spec.dw.hungry ? 1.40 : 1);
    let mu = Math.sqrt(gearA * gearB) * aG.steal * bG.steal;
    if (opposite) mu *= aG.stealOpp * bG.stealOpp;
    const jtCap = K.muMax * Math.abs(jn) * K.jtCap * Math.max(aG.jtCap, bG.jtCap);
    let jt = clamp(-rvt * mu / inv, -jtCap, jtCap);

    a.vx -= K.tanLin * jt * tX / ma; a.vz -= K.tanLin * jt * tZ / ma;
    b.vx += K.tanLin * jt * tX / mb; b.vz += K.tanLin * jt * tZ / mb;
    a.w += -jt * a.spec.R / a.spec.I;
    b.w += -jt * b.spec.R / b.spec.I;

    // shock drain. The top on the receiving end eats the full smash, scaled by
    // the striker's blade; the striker only takes recoil. Attacking has to be
    // profitable or the aggressive archetype has no reason to exist.
    const imp = Math.abs(jn) + Math.abs(jt) * 0.45;
    // Glass: a monstrous blade that shatters once it is tired. Stoneskin: the
    // opposite trade, bought for three seconds with an ability.
    const glass = (def.spec.dw && def.spec.dw.glass && Math.abs(def.w) < 0.40 * K.launchSpin) ? 2 : 1;
    const stone = def.t < def.stone ? 0.35 : 1;
    const defTaken = def.spec.taken * defG.taken * glass * stone;
    const aggGlass = (agg.spec.dw && agg.spec.dw.glass && Math.abs(agg.w) < 0.40 * K.launchSpin) ? 2 : 1;
    const dmg = K.hitDrain * Math.abs(jn) * (0.35 + 0.90 * agg.spec.smash) *
                defTaken / (def.spec.m * def.spec.R);
    const kick = K.hitDrain * K.recoil * aggG_recoil(aggG) * Math.abs(jn) * agg.spec.taken * aggGlass /
                 (agg.spec.m * agg.spec.R);
    def.w -= Math.sign(def.w) * Math.min(dmg, Math.abs(def.w));
    agg.w -= Math.sign(agg.w) * Math.min(kick, Math.abs(agg.w));

    // strike accounting: destabilisation, burst wear, ability charge
    const fresh = (a.t - a.lastHit) > K.hitGap;
    if (fresh && imp > K.hitFloor) {
      const tipA = K.tiltHit * imp * 0.0016 * b.spec.strikeHigh /
                   (a.spec.I * Math.max(Math.abs(a.w), 60) + 1e-6) / a.spec.absorb;
      const tipB = K.tiltHit * imp * 0.0016 * a.spec.strikeHigh /
                   (b.spec.I * Math.max(Math.abs(b.w), 60) + 1e-6) / b.spec.absorb;
      bumpLean(a, tipA); bumpLean(b, tipB);

      // Lock wear. A ratchet loosens when it is STRUCK, not when it strikes,
      // and it is the big connected hit that does it — not accumulation. The
      // exponent is what makes a heavy-side swing capable of popping a top
      // apart in one blow instead of grinding it loose over twenty.
      // One Shot: the first strike this Relic lands does triple wear and every
      // strike after it does forty percent. It is a top you get exactly one good
      // moment with, and the moment is worth the whole round.
      // ⛔ ONE SHOT WAS A BUFF WEARING A DRAWBACK'S NAME, and the arithmetic is
      // three lines long. At triple for the first strike and forty percent after,
      // a round with three connections averages (3 + 0.4 + 0.4) / 3 = 1.27 times
      // normal wear, and rounds here have a median of about six seconds and a
      // handful of connections. The numbers only ever read as a cost if you
      // assume a long grinding round, and this game does not have one. The Relic
      // carrying it measured five points of power creep and the balancer could
      // not tune it out, because the problem was never in the part's stats.
      // Repriced so the crossover sits at two connections: one hit is still a
      // round ender, two is break even, and anything past that is worse than a
      // stock ratchet. You get one moment, which is what the name promised.
      const oneShot = (agg.spec.dw && agg.spec.dw.oneshot) ? (agg.landed === 0 ? 2.20 : 0.25) : 1;
      const wear = K.burstK * Math.pow(imp / K.impRef, K.burstPow) * oneShot;
      // ⛔ A PINNED top takes almost no lock wear, and this is physics and not a
      // difficulty knob: the ratchet loosens because the teeth are being sheared
      // by the top's own rotation while it is struck. A target standing still in
      // the circle has no rotation to shear them with. Without this factor the
      // Taya free strike measured wear of 35 against a burst threshold of 1, so
      // the winner of one round automatically won the next as well.
      def.wear += wear * agg.spec.strikeHigh * defG.burstTake *
                  (def.pinned ? 0.02 : 1) / def.spec.burstResist;
      // Shear: the striker normally takes 14 percent of the wear back. This one
      // takes all of it, so every blow it lands loosens its own teeth as much as
      // the other top's.
      // Shear: the striker normally takes 14 percent of the wear back. This one
      // takes a great deal more, so every blow it lands loosens its own teeth.
      // ⛔ It was 100 percent, seven times normal, and the Relic carrying it burst
      // itself before it could win anything: a 42 percent ceiling against a floor
      // of 50, with no stat change able to reach it. Three times normal is still
      // plainly a drawback and leaves the part a round to work in.
      agg.wear += wear * ((agg.spec.dw && agg.spec.dw.shear) ? 0.42 : K.burstBack) / agg.spec.burstResist;

      agg.charge += K.chargeHit * agg.spec.chargeRate * aggG.charge;
      def.charge += K.chargeTaken * def.spec.chargeRate * defG.charge;
      // Echo needs to know what last landed on it, and it has to be recorded
      // here because this is the only place a hit is known to have connected.
      def.lastHitBy = agg.spec.ability;
      agg.landed++;
      agg.hits++; def.taken++;
      if (agg.lash > 0) agg.lash--;
      a.lastHit = a.t; b.lastHit = b.t;
    }

    return { impulse: imp, opposite: Math.sign(a.w) !== Math.sign(b.w),
             x: a.x + nX * a.spec.R, z: a.z + nZ * a.spec.R, swing,
             aggressor: aggIsA ? 'a' : 'b' };
  }

  // ======================================================================
  // MATCH
  // ======================================================================
  function resolveMatch(specA, specB, opts) {
    const o = opts || {};
    const rnd = o.rnd || Math.random;
    // The launch rule is applied HERE so a caller cannot get it wrong by
    // forgetting to. A caller may still override an angle explicitly, which the
    // Taya ceremony and the target range both do on purpose.
    const [angA, angB] = launchAngles(rnd, specA, specB, (o.a && o.a.offset) || undefined);
    const a = spawn(specA, Object.assign({ angle: angA }, o.a));
    const b = spawn(specB, Object.assign({ angle: angB }, o.b));
    const limit = o.limit || 60;
    let t = 0;
    while (t < limit && a.alive && b.alive) {
      stepTop(a, K.dt); stepTop(b, K.dt);
      const c = collide(a, b, rnd);
      if (c && o.onHit) o.onHit(c);
      if (a.abilityUsed === 0 && triggerReady(a, b)) fire(a, b);
      if (b.abilityUsed === 0 && triggerReady(b, a)) fire(b, a);
      t += K.dt;
    }
    let winner = null, cause = 'timeout';
    if (a.alive && !b.alive) { winner = 'a'; cause = b.cause; }
    else if (b.alive && !a.alive) { winner = 'b'; cause = a.cause; }
    else if (!a.alive && !b.alive) { cause = 'double'; }
    else { winner = Math.abs(a.w) > Math.abs(b.w) ? 'a' : 'b'; }
    // scoring, Beyblade-style: not all finishes are worth the same
    const points = { spinout: 1, ringout: 2, knockout: 2, burst: 2, timeout: 1, double: 0 }[cause] || 1;
    return { winner, cause, points, duration: t, hits: a.hits + b.hits, a, b };
  }

  // ======================================================================
  // MODES — four formats, all reusing this simulation unchanged.
  //
  // Researched rather than invented: pangkah and uri are the two halves of
  // Malay gasing, taya is the Filipino turumpo punishing strike, and the target
  // range is Hmong tuj lub. They are here rather than in the renderer because
  // they are RULES, and rules have to be testable without a screen. The renderer
  // reads the same table to draw them.
  //
  // The design rule they all obey: a mode may change CONSTANTS and SPAWN
  // OPTIONS. None of them may add a branch inside stepTop or collide. Uri has no
  // contact not because the collision solver was told to skip it but because
  // nobody calls it; a target is inert because pinned tops return early.
  // ======================================================================
  const MODES = {
    pangkah: { id: 'pangkah', name: 'Pangkah', arenaR: K.arenaR, contact: true,
               to: 4, limit: 60,
               desc: 'The striking match; two tops in one dish, first to four points.' },
    // ⛔ The limit is 40 seconds and not "however long a stamina top lasts". A
    // stamina build measured at 162 seconds on the post, which is true to the
    // tradition and unwatchable as a round. Forty seconds is a real endurance
    // contest that fits in a sitting, and when both are still turning at the
    // bell it is decided on spin remaining, which still rewards exactly the
    // builds that lose at pangkah.
    // Raising the starting lean to make tops fall inside the window does not
    // work and is worth not trying again: the rise and fall equation pulls lean
    // back to equilibrium within a fraction of a second, so a launch at 0.15
    // finishes within one second of a launch at 0.055. Measured across all four
    // archetypes, four times, identical.
    uri:     { id: 'uri', name: 'Uri', arenaR: K.arenaR, contact: false,
               to: 1, limit: 30,
               desc: 'Endurance with no contact; both tops go up alone and the longer spin wins.' },
    taya:    { id: 'taya', name: 'Taya', arenaR: K.arenaR, contact: true,
               to: 4, limit: 60, strikeSpeed: 1.10, strikeOffset: 0.80,
               desc: 'The loser is pinned in the circle and the winner takes one free strike at it.' },
    range:   { id: 'range', name: 'Target range', arenaR: 0.34, contact: true,
               shots: 5, limit: 12, topple: 0.006,
               desc: 'Solo; knock over a row of standing tops, and the far ones are worth more.' }
  };

  /* The range's targets. Distance buys points, exactly as it does out to seventy
   * feet on a real tuj lub field. Deterministic, so the layout is the same for
   * everybody and a score means something. */
  function rangeTargets() {
    const out = [];
    for (let i = 0; i < 6; i++) {
      const d = 0.08 + i * 0.045;
      const ang = (i % 2 ? 1 : -1) * (0.35 + i * 0.16);
      out.push({ x: Math.cos(ang) * d, z: Math.sin(ang) * d, points: 1 + i });
    }
    return out;
  }

  /* URI. Two tops, two posts, no contact, and whoever is still turning last
   * takes it. Each one is stepped alone, so collide is never called and there is
   * nothing to special case. This is the mode that keeps stamina parts valuable:
   * the builds that lose every striking match win here. */
  function resolveUri(specA, specB, opts) {
    const o = opts || {};
    const a = spawn(specA, Object.assign({ angle: 0, offset: 0.02 }, o.a));
    const b = spawn(specB, Object.assign({ angle: Math.PI, offset: 0.02 }, o.b));
    const limit = o.limit || MODES.uri.limit;
    let t = 0;
    while (t < limit && (a.alive || b.alive)) {
      if (a.alive) stepTop(a, K.dt);
      if (b.alive) stepTop(b, K.dt);
      t += K.dt;
    }
    const ta = a.alive ? limit : a.t, tb = b.alive ? limit : b.t;
    let winner;
    if (a.alive && b.alive) winner = Math.abs(a.w) > Math.abs(b.w) ? 'a' : 'b';
    else winner = ta === tb ? null : (ta > tb ? 'a' : 'b');
    return { winner, cause: 'spinout', points: 1, duration: Math.max(ta, tb),
             a, b, ta, tb, bothUp: a.alive && b.alive };
  }

  /* TAYA. The loser's top is placed in the circle and the winner takes one free
   * run at it. The target is a pinned top, which stepTop already understands, so
   * the "mode" is a spawn option and a starting velocity. It carries the loser's
   * accumulated wear in, which is what makes the strike a real stake: enough
   * damage over a match and the lock finally gives. */
  function resolveTaya(strikerSpec, targetSpec, opts) {
    const o = opts || {};
    const rnd = o.rnd || Math.random;
    const M = MODES.taya;
    const a = spawn(strikerSpec, { angle: 0, offset: K.arenaR * M.strikeOffset,
                                   power: o.power || 1, lean: o.lean || 0.05 });
    const b = spawn(targetSpec, { angle: 0, offset: 0, pinned: true });
    a.vx = -M.strikeSpeed; a.vz = 0;
    let t = 0, best = 0;
    while (t < 3.0 && best === 0 || (t < 3.0 && t < 1.2)) {
      stepTop(a, K.dt); stepTop(b, K.dt);
      const c = collide(a, b, rnd);
      if (c && c.impulse > best) best = c.impulse;
      t += K.dt;
    }
    // ⛔ THE STAKE IS EXPLICIT AND BOUNDED, and it deliberately does NOT ride the
    // burst curve. Lock wear scales as the cube of the impulse, which is right
    // for a match: it makes bursts come from one big connected blow instead of
    // from grinding. It is wrong for a ceremonial free strike, because a cubic
    // over the impulses different archetypes deliver spans a factor of a
    // thousand. Measured: a clean target either shrugged the strike off entirely
    // or exploded, with nothing in between, depending only on who was striking.
    // A square root over the same impulses puts every striker between a quarter
    // and two thirds of a lock, so the free strike is always a real cost and
    // never an instant win, and two of them will finish anybody.
    const ratio = best / K.impRef;
    const stake = Math.max(0.10, Math.min(0.62, 0.12 + 0.30 * Math.sqrt(Math.max(0, ratio))));
    const carried = (o.carryWear || 0) + stake;
    const burst = carried >= K.burstWear;
    return { burst, stake, wear: burst ? 0 : carried, impulse: best, duration: t };
  }

  /* THE RANGE. One shot, aimed by the wind's bulge, at six standing tops. A
   * target goes over when it is hit hard enough; nothing new in the physics,
   * because the impulse that topples a spinning top topples a still one too and
   * a still one has no spin to right itself with. */
  function resolveRangeShot(spec, aimAng, power, opts) {
    const o = opts || {};
    const rnd = o.rnd || Math.random;
    const M = MODES.range;
    const targets = (o.targets || rangeTargets()).map(t => {
      const top = spawn(o.targetSpec || spec, { angle: 0, offset: 0, pinned: true, arenaR: M.arenaR });
      top.x = t.x; top.z = t.z; top.points = t.points;
      return top;
    });
    const a = spawn(spec, { angle: aimAng, offset: M.arenaR * 0.86, power: power,
                            lean: o.lean || 0.05, arenaR: M.arenaR });
    a.vx = -Math.cos(aimAng) * (0.9 + 1.5 * power);
    a.vz = -Math.sin(aimAng) * (0.9 + 1.5 * power);
    let t = 0, score = 0, hit = 0;
    while (t < M.limit && a.alive) {
      stepTop(a, K.dt);
      for (const tg of targets) {
        if (!tg.alive) continue;
        stepTop(tg, K.dt);
        const c = collide(a, tg, rnd);
        if (c && c.impulse > M.topple) { tg.alive = false; tg.cause = 'knockout'; score += tg.points; hit++; }
      }
      t += K.dt;
    }
    return { score, hit, duration: t, targets };
  }

  // ======================================================================
  // BOSSES — a block of flags on a ladder entry and nothing more.
  //
  // Not one boss reaches into stepTop or collide, and that is the test of
  // whether a gimmick is the right gimmick: a boss that needs a special case in
  // the physics is the wrong idea, and there has always been a better one that
  // does not. The Pemangkin is unkillable because the ANCHOR branch already
  // existed for an ability; The Giant needs a wider dish, which the arena radius
  // already supports; Two Direction just fires an ability that already exists,
  // on a timer.
  //
  // This lives in the simulation rather than in the renderer so that the boss
  // test and the game are provably fighting the same opponent.
  // ======================================================================
  function applyBoss(spec, boss) {
    if (!boss) return spec;
    let out = spec;
    if (boss.specMul) {
      const m = {};
      for (const k in boss.specMul) m[k] = out[k] * boss.specMul[k];
      out = Object.assign({}, out, m);
    }
    if (boss.rig) out = Object.assign({}, out, {
      rig: Object.assign({}, out.rig || RIG_NEUTRAL, boss.rig)
    });
    return out;
  }
  const bossArena = boss => ({
    arenaR: (boss && boss.arenaR) || K.arenaR,
    bowlMul: (boss && boss.bowlMul) || 1
  });

  /* A round against a boss. Same loop as resolveMatch with three flags folded
   * in, kept separate so the ordinary path stays exactly as tuned. */
  function resolveBossMatch(playerSpec, bossSpec, boss, opts) {
    const o = opts || {};
    const rnd = o.rnd || Math.random;
    const arena = bossArena(boss);
    const bs = applyBoss(bossSpec, boss);
    const [angA, angB] = launchAngles(rnd, playerSpec, bs, (o.a && o.a.offset) || undefined);
    const a = spawn(playerSpec, Object.assign({ angle: angA }, arena, o.a));
    const b = spawn(bs, Object.assign({ angle: angB }, arena, o.b));
    if (boss && boss.anchor) b.anchor = Infinity;
    const every = boss && boss.abilityEvery ? boss.abilityEvery : 0;
    let fired = 0;
    const limit = (boss && boss.limit) || o.limit || 60;
    let t = 0;
    while (t < limit && a.alive && b.alive) {
      stepTop(a, K.dt); stepTop(b, K.dt);
      const c = collide(a, b, rnd);
      if (c && o.onHit) o.onHit(c);
      if (a.abilityUsed === 0 && triggerReady(a, b)) fire(a, b);
      if (every) {
        if (b.alive && b.t - fired >= every) { b.charge = 1; b.abilityUsed = 0; fired = b.t; fire(b, a); }
      } else if (b.abilityUsed === 0 && triggerReady(b, a)) fire(b, a);
      t += K.dt;
    }
    let winner = null, cause = 'timeout';
    if (a.alive && !b.alive) { winner = 'a'; cause = b.cause; }
    else if (b.alive && !a.alive) { winner = 'b'; cause = a.cause; }
    else if (!a.alive && !b.alive) { cause = 'double'; }
    else if (boss && boss.spinTarget && Math.abs(b.w) <= boss.spinTarget * K.launchSpin) {
      /* THE GIANT'S DOOR, and the reason it needed one.
       * A four kilogram top in a wide dish cannot be rung out, cannot be
       * toppled, and will still be turning long after the round is over, so the
       * only route left was to break its teeth. That is a real answer, but it is
       * The Pemangkin's answer, and two bosses teaching the same lesson is one
       * boss too many.
       * The tradition has a better one: nobody outlasts a giant, so you measure
       * it. Wear its spin below a threshold before the bell and you have taken
       * it. Measured, the split is exactly the lesson: a spin stealing build
       * gets it down to 0.71 of its launch by the bell and a pure force build
       * only to 0.94, so this door opens for the player who took its spin off it
       * at the rim and stays shut for the one who tried to out muscle it. */
      winner = 'a'; cause = 'worn';
    }
    else { winner = Math.abs(a.w) > Math.abs(b.w) ? 'a' : 'b'; }
    const points = { spinout: 1, ringout: 2, knockout: 2, burst: 2, timeout: 1,
                     worn: 2, double: 0 }[cause] || 1;
    return { winner, cause, points, duration: t, a, b,
             bossSpin: b.alive ? Math.abs(b.w) / K.launchSpin : 0 };
  }

  // ======================================================================
  // OPPONENT SAMPLING — used by the ladder generator and by Field mode.
  //
  // It lives here rather than in tools/ladder.js because the ladder builds its
  // twenty five rungs ahead of time in node, and Field mode builds an opponent
  // on the player's phone the moment they ask for one. Two copies of this would
  // be two different games wearing the same name, which is the mistake this
  // project has now made three times in other places.
  //
  // `sophistication` runs 0 to 1 and is the whole character of the thing: a
  // beginner's top is under built on purpose, with fewer weights, metal scattered
  // at random and no trigger programmed, because that is what a beginner's top
  // actually looks like. A late opponent commits its weights to one side or
  // deliberately cancels them, and programs its move.
  // ======================================================================
  function sampleOpponent(rnd, role, sophistication) {
    const pickR = a => a[Math.floor(rnd() * a.length)];
    const inRole = list => {
      const m = list.filter(p => p.role === role);
      return m.length ? pickR(m) : pickR(list);
    };
    const soph = Math.max(0, Math.min(1, sophistication));
    const nW = Math.min(MAX_WEIGHTS, Math.floor(rnd() * (1 + soph * MAX_WEIGHTS)));
    const weights = [];
    const bias = Math.floor(rnd() * HOLES);
    for (let i = 0; i < nW; i++) {
      const hole = soph > 0.55 && rnd() < 0.7
        ? (bias + (rnd() < 0.5 ? 0 : 1)) % HOLES
        : Math.floor(rnd() * HOLES);
      weights.push({ id: pickR(WEIGHTS.slice(1)).id, hole, ring: Math.floor(rnd() * RINGS.length) });
    }
    return {
      core: inRole(CORES).id, blade: inRole(BLADES).id, assist: inRole(ASSISTS).id,
      ratchet: inRole(RATCHETS).id, bit: inRole(BITS).id, weights,
      trigger: soph < 0.3 ? 'charged' : pickR(TRIGGERS),
      finish: pickR(FINISHES).id, decal: pickR(DECALS), trail: pickR(TRAILS)
    };
  }

  /* How strong a build is, measured rather than asserted: play it against the
   * reference panel and count. Field mode uses this to find out what the player
   * actually brought, and then to build somebody who can give them a game. */
  function strengthOf(cfg, seed, reps, trigger) {
    let w = 0, n = 0;
    const names = Object.keys(ARCHETYPES);
    for (const g of names) for (let i = 0; i < reps; i++) for (const d of [1, -1]) {
      const rnd = mulberry(seed + i * 97 + g.length * 13 + (d > 0 ? 0 : 5));
      const me = build(Object.assign({}, cfg, { dir: 1 }));
      const foe = build(Object.assign({}, ARCHETYPES[g], { dir: d }));
      const r = resolveMatch(me, foe, { rnd,
        a: { power: 0.96 + rnd() * 0.08, lean: 0.03 + rnd() * 0.04, phase: rnd() * 6.283, trigger },
        b: { power: 0.96 + rnd() * 0.08, lean: 0.03 + rnd() * 0.04, phase: rnd() * 6.283 } });
      if (r.winner === 'a') w++;
      n++;
    }
    return w / n;
  }

  /* FIELD MODE. After the ladder is cleared there is nothing left to author, so
   * it stops being authored: sample candidates, measure each one, and keep
   * whichever lands closest to a target the player's own results move. Infinite
   * content, zero authoring, and it tracks the player rather than a difficulty
   * slider they would have to guess at. */
  function fieldOpponent(rnd, target, seed, candidates) {
    const roles = ROLES;
    const n = candidates || 14;
    let best = null;
    for (let i = 0; i < n; i++) {
      const role = roles[Math.floor(rnd() * roles.length)];
      const cfg = sampleOpponent(rnd, role, 0.55 + rnd() * 0.45);
      // ⛔ THE TARGET IS THE PLAYER'S OWN PANEL STRENGTH, NOT ITS MIRROR, and the
      // first version had it inverted. Both numbers are "how often does this
      // build beat the reference panel", so an even match is an opponent with
      // the SAME number, and the mirror hands a player who wins six percent of
      // the time an opponent who wins eighty eight. The mode test caught it by
      // asking whether a weak player and a strong one meet different people; the
      // answer was yes, and backwards.
      const s = strengthOf(cfg, seed + i * 1013, 1);
      const err = Math.abs(s - target);
      if (!best || err < best.err) best = { cfg, strength: s, err, role };
    }
    return best;
  }

  function mulberry(seed) {
    let s = seed >>> 0;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Reference builds, one per archetype, used by the harness and the ladder.
  const ARCHETYPES = {
    attack:  { core: 'ember',  blade: 'cleaver', assist: 'jag',   ratchet: '3-60', bit: 'flat',
               weights: [{ id: 'slug', hole: 0, ring: 0 }] },
    stamina: { core: 'moth',   blade: 'orbit',   assist: 'slick', ratchet: '5-60', bit: 'needle',
               weights: [{ id: 'chip', hole: 0, ring: 1 }, { id: 'chip', hole: 2, ring: 1 }, { id: 'chip', hole: 4, ring: 1 }] },
    defense: { core: 'frost',  blade: 'bulwark', assist: 'guard', ratchet: '7-40', bit: 'ball',
               weights: [{ id: 'slug', hole: 0, ring: 1 }, { id: 'slug', hole: 3, ring: 1 }] },
    balance: { core: 'iron',   blade: 'wheel',   assist: 'wing',  ratchet: '3-60', bit: 'point',
               weights: [{ id: 'slug', hole: 0, ring: 1 }, { id: 'chip', hole: 3, ring: 0 }] }
  };

  return { K, CORES, BLADES, ASSISTS, RATCHETS, BITS, WEIGHTS, HOLES, RINGS, MAX_WEIGHTS,
           FINISHES, DECALS, TRAILS, LAUNCHERS, COSMETIC_SLOTS, ROLES,
           ARCHETYPES, TRIGGERS, TRIGGER_LABEL, TUNING, MODS_PER_PART,
           MODES, rangeTargets, resolveUri, resolveTaya, resolveRangeShot,
           applyBoss, bossArena, resolveBossMatch, LAUNCH, launchAngles,
           sampleOpponent, strengthOf, fieldOpponent,
           DRAWBACKS, drawbackOf, RIG_NEUTRAL,
           build, spawn, stepTop, collide, resolveMatch, mulberry, fire, triggerReady,
           applyMods, tuningOptions, tuningOp };
});
