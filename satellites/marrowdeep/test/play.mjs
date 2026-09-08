#!/usr/bin/env node
/* THE SEAM GATE. The page's answer must equal the sim's for the same seed.
 *
 *   node test/play.mjs
 *
 * Why this gate exists. Marrowdeep has exactly one implementation of its rules
 * (the SIM markers) and two readers of it: the sim in Node and the cards a thumb
 * taps. Nothing stops the second from printing a different number than the first
 * computed. It has already happened once in this file: a first draft of the
 * RESULT card read `res.total` and `res.roll.mods` as an array, and printed
 * "TOTAL ? against TN 4" over a die showing a stray 1 and called it a PASS while
 * every other gate stayed green. A gate that only walks the screens cannot see
 * that. This one reads the numbers OFF THE DOM and compares each to the record
 * the engine made for that same check.
 *
 * WHY A SET OF SEEDS AND NOT ONE. A Depth I quest is six stages of two slots. One
 * seed can easily deal no Vault, no Toll, no Relay, no broken Chain, no floor
 * lift and no death, so one seed proves the seam only for the shapes it happened
 * to deal. Three seeds are walked whole, and the gate collects the shapes and the
 * kinds it ACTUALLY saw from the quest state and fails NAMING what it never saw,
 * so a content or balance change that stops dealing a shape turns this red
 * instead of quietly shrinking it.
 *
 * The seeds, and what each was chosen for (measured by walking 1 to 8 whole):
 *   2   the VAULT seed. Toll, Gate, Vault, Chain, Relay, the Thin Ice sigil, a
 *       floor lift, a boss that takes ten rounds and retargets twice, and a WIN
 *       with two survivors taking Traits.
 *   3   the OPEN seed. Gate, Open, Chain, Relay, no sigil, two floor lifts, and
 *       a WIN. It is the only one of the eight that deals an Open twice.
 *   6   the WIPE. Gate, Toll, Relay, Chain, Thin Ice, a Chain whose first check
 *       fails so the second is skipped, and a party that dies at the boss, which
 *       is the only way to prove questsCompleted does NOT move.
 * Between them: all five non Gate shapes, a win and a wipe, a skipped check, a
 * floor lift, surges, retargets, drops and Traits. The REQUIREMENT below is
 * written as the law (Gate plus three of five, one fail, one boss round, one
 * win), never as the count these three seeds happen to give today.
 *
 * What it asserts, each watched to fail (both columns are in the ledger):
 *   1. MD_DEV.seed(n) SURVIVES BEGIN: after the first tap the account really is
 *      playing seed n. Everything below is a lie if this is not true, because
 *      two runs of this gate would be two different games.
 *   2. every RESULT card's numbers equal the engine's record for that check: the
 *      face on the big die, the number of surge dice beside it, the SURGE word,
 *      the total, the target and PASS or FAIL.
 *   3. the card's own parts add up: the faces it shows plus the modifier chips it
 *      shows equal the total it prints. A card can carry the sim's total and
 *      still show a player parts that do not reach it.
 *   4. the name on the card is the character the engine rolled for.
 *   5. nothing a player reads on a card is the word undefined or NaN, and no
 *      chip claims to have done something it did not do (R13.16: a floor that
 *      did not lift the natural is worth nothing and must not print as a lift).
 *   6. the QUEST MOVES: progress is judged by (stage, step, cursor, round,
 *      results), never by a screen being seen twice, because a boss round is a
 *      legitimate loop of board, results and strike sheet. A run that stops
 *      moving fails here naming the screen it died on.
 *   7. coverage: the shapes and kinds seen across all seeds, failing by name.
 *   8. the account after each quest is coherent: Renown went up, questsCompleted
 *      moved only on a win, the roster holds exactly the survivors and every one
 *      of them is alive.
 *   9. no console error and no page error anywhere on any of the three walks.
 *
 * Watched red, each put straight back (mutations made in a COPY of the game
 * folder under the scratch dir, never in index.html, because the lead is editing
 * it while this is written):
 *   2  paintResult's total line given `r.total + 1`  -> "total 12 vs sim 11" on
 *      the first card, and assertion 3 red beside it.
 *   2  the big die given `r.natural` instead of `r.floored` -> red only on seed 2
 *      and 3, which is exactly why one seed is not enough.
 *   3  the gear chip printed as `r.mods + 1` -> assertion 3 red, 2 still green,
 *      which is the reason 3 is a separate assertion.
 *   5  ran against the real index.html -> red, naming the broken Chain card that
 *      prints "undefined" over the die and "against a target of undefined".
 *   5  the floor chip's `if (r.floorUsed)` guard widened to always print -> red
 *      on the first card, "a floor chip that lifted nothing".
 *   6  ran against the real index.html -> red, naming the RESULT screen the run
 *      died on when the aftermath threw.
 *   7  seed 2 dropped from the list -> "never saw: vault", which is the failure
 *      a future content change is supposed to produce.
 *   8  endQuest's `acct.renown += gained` cut to `+= 0` -> "Renown did not move".
 *   1  ran against the real index.html -> red: asked 2, got 3390082137.
 *
 * ⛔ Every selector is re queried at the moment it is used. Assignment repaints
 * the party and the challenge row on every tap, so a handle taken before the
 * repaint is detached after it: it presses nothing and still looks like a
 * control. The harness's `tap` queries fresh and presses what is under the thumb.
 *
 * ⛔ The gate asks the ENGINE what a reasonable player would tap
 * (MD.SIM.policy.assign / policy.boss) and then taps it with real pointers. The
 * page never calls the policy itself. A gate that drove the game by calling
 * doResolve would prove the engine to itself and nothing about the thumb.
 */
import { serve, open, reporter, tap, waitScreen } from './harness.mjs';

/* ---- the law, not the count of the file today -------------------------------
   A quest that deals no Gate is not a Depth I quest. THREE of the other five is
   the floor because a six stage quest draws about eleven slots and the deal is
   weighted, so demanding all five from three seeds would go red on a balance
   change that is not a fault. All five is what these seeds give today and the
   note says so. */
const NEED_SHAPE = 'gate';
const OTHER_SHAPES = ['chain', 'relay', 'vault', 'toll', 'open'];
const NEED_OTHERS = 3;

const SEEDS = [
  { n: 2, for: 'vault, toll, chain, relay, thin ice, a floor lift, a long boss, a WIN' },
  { n: 3, for: 'open twice, chain, relay, no sigil, a WIN with two survivors' },
  { n: 6, for: 'a WIPE: a broken chain, and questsCompleted staying put' }
];

const { base, close } = await serve();
const { fails, say } = reporter();
let opened;
try {
  opened = await open(base);
} catch (e) {
  say(false, 'the page never became ready: ' + e.message);
  close();
  console.log('');
  console.log('1 PLAY FAILURE(S)');
  process.exit(1);
}
const { browser, page, errors } = opened;

/* everything the gate learns, across every seed */
const shapesSeen = {};
const kindsSeen = {};
const notes = [];
let seamChecked = 0;

/* every tap is counted. The handoff's own critic measured about 26 mandatory
   ceremony taps in a quest the spec budgets at four to six minutes, so the
   number of presses a whole quest costs a thumb is worth printing on every run. */
let tapCount = 0;
const T = async (sel) => { tapCount++; return tap(page, sel); };
const scr = () => page.evaluate(() => window.MD_DEV.screen());
const ready = () => page.waitForFunction(
  () => !!window.MD_DEV && window.MD_DEV.ready === true && window.MD_DEV.screen() === 'title',
  { timeout: 30000 });
const K = k => { kindsSeen[k] = (kindsSeen[k] || 0) + 1; };

/* ---------------------------------------------------------------------------
   THE THUMB'S PATH. Every one of these is a real pointerdown and pointerup on
   whatever sits under the centre of the control, through the harness.
   --------------------------------------------------------------------------- */

async function rollOneCharacter() {
  await waitScreen(page, 'creation');
  await T('#btnRoll');
  /* the dice tumble for 420 ms before the Origin turns and the Callings deal, so
     the wait is on the CARDS being in the document, never on a sleep */
  await page.waitForFunction(() => document.querySelectorAll('#creCallings .card').length > 0, { timeout: 15000 });
  await T('#creCallings .card');
  await page.waitForFunction(() => { const b = document.getElementById('btnKeep'); return !!b && !b.hidden; }, { timeout: 15000 });
  await T('#btnKeep');
}

/* the deploy rows are tapped by POSITION, not by ":nth-of-type" on the class: the
   harness taps document.querySelector's FIRST match, so three taps on one
   selector would tick and untick a single row */
async function deployThree() {
  await waitScreen(page, 'deploy');
  const picks = await page.evaluate(() => {
    const rows = Array.prototype.slice.call(document.querySelectorAll('#deployList .rostrow'));
    const out = [];
    rows.forEach((r, i) => { if (r.classList.contains('pickable')) out.push(i + 1); });
    return out;
  });
  for (const i of picks.slice(0, 3)) await T(`#deployList .rostrow:nth-child(${i})`);
  return picks.length;
}

async function assignStage() {
  const taps = await page.evaluate(() => {
    const state = window.MD_DEV.state(), q = window.MD_DEV.quest();
    const stage = window.MD.SIM.currentStage(state);
    const plan = window.MD.SIM.policy.assign(state);
    const alive = id => { const c = state.roster.filter(r => r.id === id)[0]; return !!c && c.alive; };
    const living = q.party.filter(alive);
    const used = {}, out = [];
    stage.slots.forEach(function (s, i) {
      if (s.done) return;
      const want = s.shape === 'relay' ? 2 : 1;
      const chars = (plan.slots[i] && plan.slots[i].chars) ? plan.slots[i].chars.slice() : [];
      /* R5.6 lets the POLICY forfeit a slot nobody can pay; the page's RESOLVE
         stays disabled until every slot is filled, so the thumb has to fill it
         with somebody. The gate fills the gap with the least used living body
         and records it. */
      while (chars.length < want) {
        const spare = living.filter(id => chars.indexOf(id) < 0)
          .sort((a, b) => (used[a] || 0) - (used[b] || 0))[0];
        if (spare == null) break;
        chars.push(spare);
      }
      chars.forEach(function (id) {
        used[id] = (used[id] || 0) + 1;
        out.push({ slot: i, pc: q.party.indexOf(id) });
      });
    });
    return out;
  });
  for (const t of taps) {
    await T(`#qParty .pc:nth-child(${t.pc + 1})`);
    await T(`#qChallenges .chal:nth-child(${t.slot + 1})`);
  }
  const live = await page.evaluate(() => !document.getElementById('btnResolve').disabled);
  if (!live) return 'RESOLVE never came alive after the whole stage was assigned';
  await T('#btnResolve');
  return null;
}

async function assignBossRound() {
  const taps = await page.evaluate(() => {
    const q = window.MD_DEV.quest();
    const plan = window.MD.SIM.policy.boss(window.MD_DEV.state());
    return Object.keys(plan.targets).map(id => ({ pc: q.party.indexOf(id), asp: plan.targets[id] }));
  });
  for (const t of taps) {
    await T(`#bossParty .pc:nth-child(${t.pc + 1})`);
    await T(`#bossAspects .asp:nth-child(${t.asp + 1})`);
  }
  const live = await page.evaluate(() => !document.getElementById('btnBossResolve').disabled);
  if (!live) return 'RESOLVE never came alive with every living character on an Aspect';
  await T('#btnBossResolve');
  return null;
}

/* ---------------------------------------------------------------------------
   THE SEAM. Read the card, read the engine's record for the same check, and
   compare. The record is `quest.held.res` while a card is held (every check
   outside the boss holds, so REROLL can still be offered) and the last entry of
   `quest.results` at the boss, which pushes as it resolves.
   --------------------------------------------------------------------------- */
async function readCard() {
  return page.evaluate(() => {
    const c = document.getElementById('resCard');
    const q = window.MD_DEV.quest();
    const state = window.MD_DEV.state();
    const sim = !q ? null : (q.held ? q.held.res : (q.results.length ? q.results[q.results.length - 1] : null));
    const who = sim && sim.charId ? state.roster.filter(r => r.id === sim.charId)[0] : null;
    return {
      text: c ? c.textContent : '',
      name: c && c.querySelector('.cname') ? c.querySelector('.cname').textContent : '',
      total: c && c.querySelector('.total') ? c.querySelector('.total').textContent : '',
      verdict: c && c.querySelector('.verdict') ? c.querySelector('.verdict').textContent : '',
      faces: c ? Array.prototype.map.call(c.querySelectorAll('.facenum'), e => e.textContent) : [],
      mods: c ? Array.prototype.map.call(c.querySelectorAll('.mod'), e => e.textContent.trim()) : [],
      surgeWord: !!(c && c.querySelector('.surgeword')),
      pushWord: (window.MD_DEV.data().lines.ui || {}).PUSH || 'PUSH',
      simName: who ? who.name : null,
      sim: sim ? JSON.parse(JSON.stringify(sim)) : null,
      nres: q ? q.results.length : -1
    };
  });
}

/* one RESULT card against one engine record. Returns the lines that are wrong. */
function seam(card, tag) {
  const bad = [];
  const sim = card.sim;
  if (!sim) { bad.push(tag + ': the page is on a RESULT card and the engine has no record of any check'); return bad; }

  /* 5. nothing a player reads is the word undefined */
  if (/undefined|NaN/.test(card.text)) {
    bad.push(tag + ': the card prints ' + JSON.stringify(card.text.replace(/\s+/g, ' ').trim().slice(0, 80)) +
      ' (engine record: ' + JSON.stringify(sim).slice(0, 120) + ')');
  }

  if (!sim.roll) {
    /* a skipped check (a broken Chain or Relay, a forfeit, a dead actor). There
       are no numbers to compare; what the card must NOT do is invent some. */
    K('skip:' + (sim.skipped || 'unnamed'));
    if (!/TOTAL\s+\?/.test(card.total)) bad.push(tag + ': a check the engine skipped (' + sim.skipped + ') printed a total: ' + JSON.stringify(card.total));
    return bad;
  }

  const r = sim.roll;
  K(sim.pass ? 'pass' : 'fail');
  if (r.surged) K('surge');
  if (r.push) K('push');
  if (r.mods) K('mods');
  if (r.floorUsed && r.floored > r.natural) K('floorlift');
  if (r.rerolled) K('reroll1s');
  if (sim.boss) K(sim.broken ? 'aspectBroken' : 'aspectHit');
  if (sim.retargeted) K('retarget');
  if (sim.strain) K('strain');

  /* 4. the name */
  if (card.simName && card.name.indexOf(card.simName) !== 0) {
    bad.push(tag + ': the card is headed ' + JSON.stringify(card.name) + ' and the engine rolled for ' + JSON.stringify(card.simName));
  }

  /* 2. the face, the surge dice, the word */
  const wantFace = r.floored != null ? r.floored : r.natural;
  if (Number(card.faces[0]) !== wantFace) {
    bad.push(tag + ': the big die reads ' + JSON.stringify(card.faces[0]) + ' and the engine rolled ' + wantFace +
      ' (natural ' + r.natural + ', floor ' + r.floorUsed + ')');
  }
  const chain = r.chain || [];
  if (card.faces.length - 1 !== chain.length) {
    bad.push(tag + ': the card shows ' + (card.faces.length - 1) + ' surge dice and the engine rolled ' + chain.length);
  } else {
    for (let i = 0; i < chain.length; i++) {
      if (Number(card.faces[i + 1]) !== chain[i]) {
        bad.push(tag + ': surge die ' + (i + 1) + ' reads ' + JSON.stringify(card.faces[i + 1]) + ' and the engine rolled ' + chain[i]);
      }
    }
  }
  if (card.surgeWord !== !!r.surged) {
    bad.push(tag + ': the SURGE word is ' + (card.surgeWord ? 'shown' : 'absent') + ' and the engine says surged=' + !!r.surged);
  }

  /* 2. the total, the target, the verdict */
  const m = card.total.match(/TOTAL\s+(-?\d+|\?)\s+against a target of\s+(-?\d+|\S+)/);
  if (!m) {
    bad.push(tag + ': the total line does not read: ' + JSON.stringify(card.total));
  } else {
    if (Number(m[1]) !== r.total) bad.push(tag + ': the card totals ' + m[1] + ' and the engine totals ' + r.total);
    if (Number(m[2]) !== sim.tn) bad.push(tag + ': the card targets ' + m[2] + ' and the engine targets ' + sim.tn);
  }
  const wantV = sim.pass ? 'PASS' : 'FAIL';
  if (card.verdict !== wantV) bad.push(tag + ': the card says ' + JSON.stringify(card.verdict) + ' and the engine says ' + wantV);

  /* 3. the card's own parts add up. Every chip is READ, so a chip this gate does
        not know is a failure and not a silent pass: the next builder teaches the
        gate the new chip, which is how the arithmetic stays honest. */
  let gear = 0, push = 0, floorRow = null, unknown = null;
  card.mods.forEach(function (t) {
    let g;
    if ((g = t.match(/^floor lifted (\d+) to (\d+)$/))) { floorRow = [Number(g[1]), Number(g[2])]; return; }
    if ((g = t.match(/^([+-]\d+) from gear$/))) { gear = Number(g[1]); return; }
    if (t === 'no gear on this stat') return;
    if (t === 'rerolled') return;
    if ((g = t.match(/^\+(\d+)\s+(.+)$/)) && g[2] === card.pushWord) { push = Number(g[1]); return; }
    unknown = t;
  });
  if (unknown != null) bad.push(tag + ': the card shows a chip this gate cannot read, ' + JSON.stringify(unknown));
  if (floorRow && (floorRow[0] !== r.natural || floorRow[1] !== r.floored)) {
    bad.push(tag + ': the floor chip says ' + floorRow.join(' to ') + ' and the engine floored ' + r.natural + ' to ' + r.floored);
  }
  /* R13.16: a modifier worth nothing in this cell prints as "no effect". A floor
     that did not lift the natural is worth nothing, and a chip reading
     "floor lifted 7 to 7" teaches a player that her floor did something it did
     not do. */
  if (floorRow && floorRow[1] <= floorRow[0]) {
    bad.push(tag + ': the card shows a floor chip that lifted nothing, "floor lifted ' +
      floorRow.join(' to ') + '" (R13.16: a modifier worth nothing in this cell prints as no effect)');
  }
  if (gear !== (r.mods || 0)) bad.push(tag + ': the gear chip says ' + gear + ' and the engine added ' + (r.mods || 0));
  if (push !== (r.push || 0)) bad.push(tag + ': the push chip says ' + push + ' and the engine added ' + (r.push || 0));
  if (m && m[1] !== '?') {
    const parts = card.faces.reduce((a, f) => a + Number(f), 0) + gear + push;
    if (parts !== Number(m[1])) {
      bad.push(tag + ': the card shows ' + card.faces.join(' plus ') + ' and chips ' + gear + '/' + push +
        ', which is ' + parts + ', over a printed total of ' + m[1]);
    }
  }
  seamChecked++;
  return bad;
}

/* ---------------------------------------------------------------------------
   ONE WHOLE QUEST, per seed.
   --------------------------------------------------------------------------- */
async function walk(seed) {
  const bad = [];
  const t0 = Date.now(), tap0 = tapCount;
  await page.evaluate(() => { try { window.MD_DEV.wipe(); } catch (e) {} });
  await page.reload({ waitUntil: 'load', timeout: 60000 });
  await ready();

  /* 1. the seed. MD_DEV.seed sets the account's stream, which is an INPUT and not
        a state, and every draw the run makes comes off it. */
  await page.evaluate(n => window.MD_DEV.seed(n), seed);
  await T('#btnBegin');
  await waitScreen(page, 'creation').catch(() => {});
  let live = await page.evaluate(() => window.MD_DEV.state().seed);
  const seedHeld = live === seed;
  say(seedHeld, 'seed ' + seed + ': MD_DEV.seed survives BEGIN (the account is playing ' + live + ')');
  if (!seedHeld) {
    /* Carry on anyway, seeded the only other way a player's own path allows: a
       save written to storage and a RELOAD, which BOOT restores. Without this the
       gate would report one fault and measure nothing else, and the lead needs
       the whole list in one run. Assertion 1 stays red. */
    notes.push('seed ' + seed + ': seeded through a fixture and a reload because BEGIN discarded MD_DEV.seed');
    await page.evaluate(() => { try { window.MD_DEV.wipe(); } catch (e) {} });
    await page.reload({ waitUntil: 'load', timeout: 60000 });
    await ready();
    const fx = await page.evaluate(n => {
      window.MD_DEV.seed(n);
      const st = window.MD_DEV.state(), sv = window.MD_DEV.save();
      sv.account = st.account; sv.roster = st.roster; sv.quest = null; sv.seed = st.seed;
      return sv;
    }, seed);
    await page.evaluate(v => window.MD_DEV.fixture(v), fx).catch(() => {});
    await ready();
    await T('#btnBegin');
    await waitScreen(page, 'creation').catch(() => {});
    live = await page.evaluate(() => window.MD_DEV.state().seed);
    if (live !== seed) { bad.push('seed ' + seed + ': the fixture route did not seed either (got ' + live + ')'); return bad; }
  }

  /* three free bodies, then the how screen the first time, then the Hall */
  for (let i = 0; i < 3; i++) await rollOneCharacter();
  if ((await scr()) === 'how') await T('#btnGotIt');
  await waitScreen(page, 'hall');
  const before = await page.evaluate(() => {
    const a = window.MD_DEV.account();
    return { renown: a.renown, quests: a.questsCompleted, roster: window.MD_DEV.state().roster.map(c => c.id) };
  });

  await T('#btnDeploy');
  const deployable = await deployThree();
  if (deployable < 3) bad.push('seed ' + seed + ': only ' + deployable + ' of three fresh characters could be deployed');
  await T('#btnGo');
  await page.waitForFunction(() => !!window.MD_DEV.quest(), { timeout: 15000 });

  /* what this seed DEALT, read off the quest definition and not off the screens,
     so a shape that exists but is never painted still counts as dealt */
  const dealt = await page.evaluate(() => {
    const q = window.MD_DEV.quest(), sh = {};
    let boss = 0;
    q.def.stages.forEach(st => { if (st.boss) boss++; (st.slots || []).forEach(s => { sh[s.shape] = (sh[s.shape] || 0) + 1; }); });
    return { shapes: sh, bossStages: boss, stages: q.def.stages.length, party: q.party.slice() };
  });
  Object.keys(dealt.shapes).forEach(s => { shapesSeen[s] = (shapesSeen[s] || 0) + dealt.shapes[s]; });
  if (dealt.bossStages < 1) bad.push('seed ' + seed + ': the quest has no boss stage');

  /* the walk. Progress is the QUEST moving, never a screen being seen twice: a
     boss round is board, results, strike sheet, board again, and that is not a
     loop. */
  let stuck = 0, lastSig = '', turns = 0, taps = 0, rounds = 0, cards = 0;
  let where = 'start';
  while (turns++ < 600) {
    const s = await scr();
    where = s;
    const sig = await page.evaluate(() => {
      const q = window.MD_DEV.quest();
      if (!q) return 'noquest|' + window.MD_DEV.screen();
      return [q.stageIndex, q.step, q.cursor, q.round, q.results.length, (q.drops || []).length, !!q.held].join('|');
    });
    const full = s + '@' + sig;
    if (full === lastSig) stuck++; else { stuck = 0; lastSig = full; }
    if (stuck > 6) { bad.push('seed ' + seed + ': the quest stopped moving on the ' + s + ' screen at ' + sig); break; }

    if (s === 'hall' || s === 'title') break;
    if (s === 'quest') { const e = await assignStage(); taps++; if (e) { bad.push('seed ' + seed + ': ' + e); break; } continue; }
    if (s === 'preroll') { K('preroll'); await T('#btnRollCheck'); continue; }
    if (s === 'result') {
      cards++;
      const card = await readCard();
      seam(card, 'seed ' + seed + ' card ' + cards).forEach(l => bad.push(l));
      await T('#btnContinue');
      continue;
    }
    if (s === 'sheet') { await T('#btnSheetNext'); continue; }
    if (s === 'drop') { K('drop'); await T('#btnSalvage'); continue; }
    if (s === 'boss') { rounds++; const e = await assignBossRound(); if (e) { bad.push('seed ' + seed + ': ' + e); break; } continue; }
    if (s === 'trait') { K('trait'); await T('#trCards .card'); await T('#btnTraitKeep'); continue; }
    if (s === 'how') { await T('#btnGotIt'); continue; }
    bad.push('seed ' + seed + ': the walk landed on a screen it does not know, ' + JSON.stringify(s));
    break;
  }
  if (turns >= 600) bad.push('seed ' + seed + ': the walk never reached the Hall in 600 turns, last on ' + where);
  if (rounds > 0) K('bossRound');
  if (cards < 1) bad.push('seed ' + seed + ': the whole quest painted no RESULT card at all');

  /* 8. the account after the quest */
  const after = await page.evaluate(() => {
    const st = window.MD_DEV.state(), a = st.account, lq = st.lastQuest || null;
    return {
      screen: window.MD_DEV.screen(), renown: a.renown, quests: a.questsCompleted,
      roster: st.roster.map(c => ({ id: c.id, alive: c.alive })),
      won: lq ? !!lq.won : null, deaths: lq ? lq.deaths.length : null, quest: !!st.quest
    };
  });
  const tag = 'seed ' + seed;
  if (after.screen !== 'hall') bad.push(tag + ': the quest ended on the ' + after.screen + ' screen and not back in the Hall');
  if (after.quest) bad.push(tag + ': the quest is still open after the walk finished');
  if (after.won === null) bad.push(tag + ': no quest summary was written, so nothing says whether it was won');
  else {
    K(after.won ? 'won' : 'wiped');
    if (!(after.renown > before.renown)) bad.push(tag + ': Renown did not move (' + before.renown + ' to ' + after.renown + ')');
    const moved = after.quests - before.quests;
    if (after.won && moved !== 1) bad.push(tag + ': the quest was WON and questsCompleted moved by ' + moved);
    if (!after.won && moved !== 0) bad.push(tag + ': the quest was LOST and questsCompleted moved by ' + moved);
    const dead = after.roster.filter(c => !c.alive);
    if (dead.length) bad.push(tag + ': ' + dead.length + ' dead character(s) are still on the roster');
    if (after.roster.length !== before.roster.length - after.deaths) {
      bad.push(tag + ': the roster holds ' + after.roster.length + ' of the ' + before.roster.length +
        ' deployed after ' + after.deaths + ' died');
    }
    after.roster.forEach(c => { if (before.roster.indexOf(c.id) < 0) bad.push(tag + ': a character the account never made, ' + c.id + ', is on the roster'); });
  }
  notes.push(tag + ': ' + (after.won ? 'WON' : 'wiped') + ', ' + cards + ' cards, ' + rounds + ' boss rounds, ' +
    after.deaths + ' dead, Renown ' + before.renown + ' to ' + after.renown + ', ' +
    (tapCount - tap0) + ' taps of a thumb, ' + ((Date.now() - t0) / 1000).toFixed(0) +
    's headless, shapes ' + JSON.stringify(dealt.shapes));
  return bad;
}

/* --------------------------------------------------------------------------- */

for (const s of SEEDS) {
  const bad = await walk(s.n);
  say(bad.length === 0, 'seed ' + s.n + ' walks a whole Depth I quest and every card matches the engine (' + s.for + ')' +
    (bad.length ? '\n          ' + bad.slice(0, 8).join('\n          ') + (bad.length > 8 ? '\n          and ' + (bad.length - 8) + ' more' : '') : ''));
}

/* 7. coverage, named */
const missing = [];
if (!shapesSeen[NEED_SHAPE]) missing.push(NEED_SHAPE);
const others = OTHER_SHAPES.filter(s => shapesSeen[s]);
if (others.length < NEED_OTHERS) {
  missing.push('only ' + others.length + ' of ' + OTHER_SHAPES.length + ' other shapes (' + others.join(', ') +
    '), the law is ' + NEED_OTHERS + '; never saw ' + OTHER_SHAPES.filter(s => !shapesSeen[s]).join(', '));
}
say(missing.length === 0, 'the seeds between them deal a Gate and at least ' + NEED_OTHERS + ' of ' +
  OTHER_SHAPES.join(', ') + ' (saw ' + JSON.stringify(shapesSeen) + ')' + (missing.length ? ' NEVER SAW: ' + missing.join('; ') : ''));

const NEED_KINDS = ['pass', 'fail', 'bossRound', 'won', 'surge', 'drop', 'trait'];
const noKind = NEED_KINDS.filter(k => !kindsSeen[k]);
say(noKind.length === 0, 'the seeds between them show a pass, a FAIL, a boss round, a WIN, a surge, a drop and a Trait' +
  ' (saw ' + JSON.stringify(kindsSeen) + ')' + (noKind.length ? ' NEVER SAW: ' + noKind.join(', ') : ''));

say(seamChecked >= 30, 'the seam was read on every RESULT card the three walks painted (' + seamChecked +
  ' cards compared to the engine, the law is at least 30, which is one Depth I quest of checks)');

/* 9. */
say(errors.length === 0, 'no console error and no page error on any of the three walks' +
  (errors.length ? ': ' + Array.from(new Set(errors)).slice(0, 5).join(' | ') : ''));

notes.forEach(n => console.log('        - ' + n));

await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' PLAY FAILURE(S)'); process.exit(1); }
console.log('PLAY OK');
