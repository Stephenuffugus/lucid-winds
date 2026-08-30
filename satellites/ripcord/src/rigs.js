/* RIPCORD RIGS — named synergies that fire when a build satisfies a condition.
 *
 * THE RULE, and it is the whole reason this file is separate from the parts:
 * every rig is a PHYSICS MODIFIER, never a flat stat bonus. It multiplies a
 * quantity that stepTop or collide already computes. A rig that added five
 * percent to smash would be a linear power axis wearing a costume, and this
 * game does not have one; a rig that halves the gap between rail dashes changes
 * what the top DOES.
 *
 * At most two may be active at once. If three qualify the player chooses, which
 * is a decision and not a reward. Nothing here is bought, unlocked or levelled:
 * a rig is a thing you notice about a build you already made, and the workshop
 * announces it the moment the condition is met. That announcement is the entire
 * discovery loop, so half of these are meant to be obvious from reading the part
 * list and half are meant to be found by accident.
 *
 * Every rig must move a measurable outcome by at least three points or it is
 * decoration. test/rigtest.js proves that, one rig at a time, and it is allowed
 * to fail.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RIGS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_ACTIVE = 2;

  /* Conditions read a "sheet": the parts as fitted, plus the derived numbers a
   * player can already see in the workshop. Nothing in here may run the
   * simulation, because a rig has to announce itself while you are still
   * choosing parts. */
  function sheet(SIM, spec) {
    var c = spec.cfg;
    var find = function (list, id) {
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return list[0];
    };
    var core = SIM.applyMods(find(SIM.CORES, c.core), 'core', c.mods);
    var blade = SIM.applyMods(find(SIM.BLADES, c.blade), 'blade', c.mods);
    var assist = SIM.applyMods(find(SIM.ASSISTS, c.assist), 'assist', c.mods);
    var rat = SIM.applyMods(find(SIM.RATCHETS, c.ratchet), 'ratchet', c.mods);
    var bit = SIM.applyMods(find(SIM.BITS, c.bit), 'bit', c.mods);
    var w = c.weights || [];
    var outer = 0, inner = 0, ids = {};
    for (var i = 0; i < w.length; i++) {
      if ((w[i].ring | 0) === 1) outer++; else inner++;
      ids[w[i].id] = 1;
    }
    return {
      core: core, blade: blade, assist: assist, ratchet: rat, bit: bit,
      weights: w, nW: w.length, outer: outer, inner: inner,
      distinctWeights: Object.keys(ids).length,
      mass: spec.m, imb: spec.imb, radius: spec.R, dir: spec.dir
    };
  }

  /* mod keys are exactly the ones RIG_NEUTRAL declares in sim2.js. Anything else
   * is a typo that would silently do nothing, so build() freezes that object and
   * validate() below checks every key against it. */
  var LIST = [
    // ---------------- the eight from the brief ----------------
    { id: 'raillock', name: 'Rail Lock', obvious: true,
      desc: 'Chains rail dashes together instead of pausing between them.',
      cond: 'A geared tip and a toothed sub blade.',
      test: function (s) { return s.bit.dash >= 1.2 && s.assist.gearMul >= 1.4; },
      mod: { dashGap: 0.60 } },

    { id: 'flywheel', name: 'Flywheel', obvious: true,
      desc: 'All the metal is out at the rim, so the spin holds much longer.',
      cond: 'A wide blade with four weights, all on the outer ring.',
      test: function (s) { return s.blade.radius >= 0.024 && s.nW === 4 && s.outer === 4; },
      // ⛔ inertia alone was worth 0.0 points. The exponent sits on (iRef/I),
      // a number close to one, so a twelve percent nudge to it is a two percent
      // change in decay. It needed the mass penalty lever too, which is the
      // honest physics anyway: metal at the rim is the mass that does not cost.
      mod: { inertia: 1.30, massCost: 0.86 } },

    { id: 'cwset', name: 'Counterweight Set', obvious: true,
      desc: 'Three or more weights that cancel out; all the heft, none of the drag.',
      test: function (s) { return s.nW >= 3 && s.imb < 0.02; },
      cond: 'Three or more weights, balanced.',
      // ⛔ the brief said imbDrain and the brief was wrong here, in a way worth
      // recording: the condition REQUIRES imbalance under 0.02, so the drain
      // this was cutting was already almost nothing. What a cancelled weight set
      // actually costs you is raw MASS, so that is what it buys back.
      mod: { massCost: 0.70 } },

    { id: 'hammer', name: 'Hammer', obvious: true,
      desc: 'A sharp edge with real weight behind it; the heavy side hits harder.',
      cond: 'A sharp blade, a smashing sub blade, and a committed wobble.',
      test: function (s) { return s.blade.sharp >= 0.85 && s.assist.smash >= 1.1 && s.imb >= 0.10; },
      mod: { imbSwing: 1.25 } },

    { id: 'lowprofile', name: 'Low Profile', obvious: true,
      desc: 'Sits low and grips; much harder to throw out of the ring.',
      cond: 'A short ratchet and a stable tip.',
      test: function (s) { return s.ratchet.height <= 40 && s.bit.stable >= 1.1; },
      // exitNeed alone touched only 6 percent of rounds because it decides a
      // single moment at the wall. A top that sits this low also stays up
      // longer, and that is felt in every round it plays.
      mod: { exitNeed: 1.45, fall: 0.88 } },

    { id: 'spinthief', name: 'Spin Thief', obvious: false,
      desc: 'Meshes with a top spinning the other way and drags its spin across.',
      cond: 'A gripping blade with a hooked sub blade.',
      test: function (s) { return s.blade.gear >= 1.3 && s.assist.id === 'hook'; },
      // steal without jtCap is a no-op on exactly the builds that qualify for
      // this, because a hooked gripping rim saturates the friction cap on almost
      // every contact.
      mod: { stealOpp: 1.15, jtCap: 1.35 } },

    { id: 'deadweight', name: 'Deadweight', obvious: false,
      desc: 'So heavy and so slow that hits barely move it.',
      cond: 'A very heavy top with a tip that does not travel.',
      test: function (s) { return s.mass >= 0.046 && s.bit.drive <= 0.7; },
      // 0.85 measured at plus nineteen win points, which is not a synergy, it is
      // a must have. A rig has to be worth finding and not worth building around.
      mod: { jnTake: 0.94 } },

    { id: 'featherline', name: 'Featherline', obvious: false,
      desc: 'Light and sharp; it covers ground fast and it feels every hit.',
      cond: 'A very light top with a sharp blade.',
      test: function (s) { return s.mass <= 0.030 && s.blade.sharp >= 0.8; },
      mod: { drive: 1.20, taken: 1.22 } },

    // ---------------- eight more, same shape ----------------
    { id: 'ballast', name: 'Ballast', obvious: true,
      desc: 'The weight is packed near the axis; it leans slowly and stands back up.',
      cond: 'Four weights on the inner ring, on a heavy top.',
      test: function (s) { return s.nW === 4 && s.inner === 4 && s.mass >= 0.044; },
      mod: { fall: 0.68, rise: 1.12 } },

    { id: 'whetstone', name: 'Whetstone', obvious: false,
      desc: 'An edge thin enough to cut instead of bounce, so it keeps its own spin.',
      cond: 'A blade that is both very sharp and very fragile.',
      test: function (s) { return s.blade.sharp >= 0.90 && s.blade.taken >= 1.20; },
      mod: { recoilPay: 0.75 } },

    { id: 'anvilhead', name: 'Anvil Head', obvious: true,
      desc: 'Deep teeth and a thick shaft; it will not come apart.',
      cond: 'A high tooth ratchet on a thick tip.',
      test: function (s) { return s.ratchet.lock >= 1.10 && s.bit.shaft >= 1.10; },
      // ⛔ burstTake alone measured 0.0. Same trap as Counterweight Set: the
      // condition already demands a burst resistance over 1.2, so a build that
      // qualifies for this barely bursts anyway and cutting its wear further
      // changes nothing anyone can see. What deep teeth and a thick shaft really
      // buy is RIGIDITY, so the hit goes into the floor instead of into the top.
      mod: { burstTake: 0.70, jnTake: 0.93 } },

    { id: 'grindstone', name: 'Grindstone', obvious: false,
      desc: 'It will not chase anybody, but whatever touches it loses spin.',
      cond: 'A gripping blade on a tip with no rail gear.',
      test: function (s) { return s.bit.dash <= 0.50 && s.blade.gear >= 1.20; },
      mod: { stealOpp: 1.08, jtCap: 1.10, decay: 1.04 } },

    { id: 'longrope', name: 'Long Rope', obvious: false,
      desc: 'Tall and narrow, so it whips hard and goes over the lip just as easily.',
      cond: 'A tall ratchet under a narrow blade.',
      test: function (s) { return s.ratchet.height >= 80 && s.blade.radius <= 0.0215; },
      mod: { imbSwing: 1.30, exitNeed: 0.85 } },

    { id: 'sump', name: 'Sump', obvious: true,
      desc: 'Nothing to shake loose and nothing to drag; it just keeps going.',
      cond: 'A long spinning tip, a cushioned sub blade, and almost no metal.',
      test: function (s) { return s.bit.stamina >= 1.25 && s.assist.absorb >= 1.15 && s.nW <= 1; },
      mod: { decay: 0.87 } },

    { id: 'kickstand', name: 'Kickstand', obvious: true,
      desc: 'Stands itself back up almost as fast as you can knock it down.',
      cond: 'A stable tip under a short ratchet.',
      test: function (s) { return s.bit.stable >= 1.15 && s.ratchet.height <= 50; },
      mod: { rise: 1.25 } },

    { id: 'loosechange', name: 'Loose Change', obvious: false,
      desc: 'Mass held near the middle lets it drift wide and live on the rail.',
      cond: 'Exactly two weights, both on the inner ring, under a wide blade.',
      test: function (s) { return s.nW === 2 && s.inner === 2 && s.blade.radius >= 0.0235; },
      mod: { bowl: 0.88, charge: 1.15 } }
  ];

  var byId = {};
  for (var i = 0; i < LIST.length; i++) byId[LIST[i].id] = LIST[i];

  /* Which rigs this build qualifies for, in list order. The workshop shows all
   * of them; only MAX_ACTIVE of them do anything. */
  function qualify(SIM, spec) {
    var s = sheet(SIM, spec), out = [];
    for (var i = 0; i < LIST.length; i++) {
      try { if (LIST[i].test(s)) out.push(LIST[i]); } catch (e) { /* a bad rig must not kill a build */ }
    }
    return out;
  }

  /* Fold the chosen rigs into a COPY of the spec. Never mutates: the workshop
   * previews rigged and unrigged side by side and would otherwise poison the
   * build it is showing you. */
  /* exact=true applies ONLY the named rigs and does not back fill.
   *
   * ⛔ THAT FLAG EXISTS BECAUSE THE RIG TEST WAS LYING. Back filling is right for
   * the game: a player who picks one rig should still get a second one if their
   * build qualifies. It is wrong for a test that is trying to isolate ONE rig,
   * because the "with" run then carries two rigs and the "without" run carries
   * none. Deadweight measured at plus nineteen win points and was nearly cut for
   * being overpowered; almost all of that was a second rig riding along. */
  function apply(SIM, spec, chosenIds, exact) {
    var q = qualify(SIM, spec);
    if (!q.length) return spec;
    var chosen = [];
    var i, r;
    if (chosenIds && chosenIds.length) {
      for (i = 0; i < chosenIds.length && chosen.length < MAX_ACTIVE; i++) {
        r = byId[chosenIds[i]];
        if (r && q.indexOf(r) >= 0) chosen.push(r);
      }
    }
    // No choice made, or not enough of one: take them in list order, which is
    // stable, so an unattended build behaves the same every time.
    if (!exact) for (i = 0; i < q.length && chosen.length < MAX_ACTIVE; i++)
      if (chosen.indexOf(q[i]) < 0) chosen.push(q[i]);

    var rig = {}, k;
    for (k in SIM.RIG_NEUTRAL) rig[k] = SIM.RIG_NEUTRAL[k];
    var ids = [];
    for (i = 0; i < chosen.length; i++) {
      ids.push(chosen[i].id);
      for (k in chosen[i].mod) rig[k] *= chosen[i].mod[k];
    }
    var out = {}, key;
    for (key in spec) out[key] = spec[key];
    out.rig = rig;
    out.rigs = ids;
    out.rigsAvailable = q.length;
    return out;
  }

  /* Every mod key must exist in RIG_NEUTRAL. A key that does not is a typo that
   * would silently do nothing forever, which is the worst kind of bug: the rig
   * ships, the workshop announces it, and it changes nothing. */
  function validate(SIM) {
    var bad = [];
    for (var i = 0; i < LIST.length; i++)
      for (var k in LIST[i].mod)
        if (!(k in SIM.RIG_NEUTRAL)) bad.push(LIST[i].id + '.' + k);
    return bad;
  }

  return { LIST: LIST, byId: byId, MAX_ACTIVE: MAX_ACTIVE, qualify: qualify, apply: apply,
           validate: validate, sheet: sheet };
});
