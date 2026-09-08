#!/usr/bin/env node
/* The shots, taken from where the PLAYER stands, at the three widths.
 *
 *   node tools/shots.mjs                 all of them into docs/shots/
 *   node tools/shots.mjs quest           just that one, at all three widths
 *   node tools/shots.mjs quest-mid       just that one, at 375x667
 *   node tools/shots.mjs --thumb         all of them again with a THUMB on them,
 *                                        written as <name>-thumb.png
 *
 * Every shot is driven by real taps on real elements, through the same harness
 * the gates use, because a screenshot of a state no thumb can reach is a lie
 * about the game. Nothing here calls a handler and nothing here writes a state
 * it then photographs: one browser per width plays ONE WHOLE Depth I quest from
 * a cold start (BEGIN, three ROLL and KEEP, DEPLOY three, GO, every stage, the
 * boss) and the shutter fires as each screen arrives. The one liberty a camera
 * takes and a gate may not is MD_DEV.seed: the walk is seeded so the same quest
 * comes up every run and the shots are comparable between builds. A seed is an
 * INPUT, not a state.
 *
 * ⛔ WHY --thumb EXISTS. A control that sits under the thumb that just pressed
 * it is invisible in an ordinary screenshot, and this fleet shipped exactly that
 * on Sep 07: Gerplunk's power ring sat under the pad of the thumb dragging it,
 * every look pass called the screen clean, and Stephen found it in one minute of
 * playing because his own thumb was on the glass. --thumb composites a 90 px
 * translucent disc over the point the last real tap landed on, so a shot shows
 * what the hand hides. 90 px is the pad, not the tip: a thumb's soft contact is
 * about 15 mm, and 15 mm is 92 CSS px on a 412 wide phone and 83 on a 320 wide
 * one, which is near enough the same disc that it is drawn at one size and the
 * number is written here instead of being scaled per width.
 *
 * ⛔ Nothing here sleeps. The page has no render loop (it is DOM and CSS) and
 * the only animation in it is the creation tumble, which ends on the same tick
 * that deals the Calling cards, so every wait is waitForFunction on
 * MD_DEV.screen() or on a node being in the document. On two cores a sleep is a
 * guess and it is a wrong one.
 *
 * ⛔ Every selector is re-queried at the moment it is used (the harness does
 * this inside page.evaluate). A handle taken before a repaint is detached after
 * it and presses nothing while still looking like a control.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tap, centre, waitScreen } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const THUMB = args.indexOf('--thumb') >= 0;
const only = args.filter(a => a.charAt(0) !== '-')[0] || null;

const SIZES = {
  tall: { width: 412, height: 915 },
  mid: { width: 375, height: 667 },
  small: { width: 320, height: 568 }
};
/* the seed the camera plays. Seed 2 is the play gate's VAULT seed: Toll, Gate,
   Vault, Chain, Relay, a floor lift, surges, drops, a long boss and a WIN with
   survivors taking Traits, which is every screen this tool is asked for in one
   quest. */
const SEED = 2;
const LIMIT = 200 * 1024;
const PAD = 90;

/* the shots this tool takes, in the order the walk reaches them */
const NAMES = ['title', 'creation', 'hall', 'quest', 'preroll', 'result-surge', 'boss', 'drop', 'trait'];

/* a name nobody takes is a typo, and a typo that prints SHOTS OK teaches you to
   trust a run that photographed nothing */
if (only && !NAMES.some(n => n === only || Object.keys(SIZES).some(k => n + '-' + k === only))) {
  console.log('there is no shot called ' + JSON.stringify(only) + '. The names are: ' + NAMES.join(', ') +
    ', each on its own or with -tall, -mid or -small.');
  process.exit(1);
}

const { base, close } = await serve();
const wrote = [];
const missed = [];
const notes = [];

function want(name, key) {
  if (!only) return true;
  return only === name || only === name + '-' + key;
}
function fileName(name, key) {
  return name + '-' + key + (THUMB ? '-thumb' : '');
}

for (const key of Object.keys(SIZES)) {
  const size = SIZES[key];
  const asked = NAMES.filter(n => want(n, key));
  if (!asked.length) continue;
  const { browser, page, errors } = await open(base, size);

  /* ---- the camera's own tools ------------------------------------------- */
  let lastTap = null;
  /* a real press on whatever is under the thumb at the control's centre, with
     the point remembered so --thumb can draw the hand that made it */
  async function T(sel) {
    const c = await centre(page, sel);
    if (c) lastTap = { x: c.x, y: c.y, sel: sel };
    return tap(page, sel);
  }
  async function shoot(name) {
    const file = fileName(name, key);
    if (THUMB && lastTap) {
      await page.evaluate((p, d) => {
        const el = document.createElement('div');
        el.id = '__thumbpad';
        el.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;border-radius:50%;' +
          'width:' + d + 'px;height:' + d + 'px;left:' + (p.x - d / 2) + 'px;top:' + (p.y - d / 2) + 'px;' +
          'background:rgba(236,228,208,.34);border:2px solid rgba(236,228,208,.62);' +
          'box-shadow:0 0 0 1px rgba(0,0,0,.5), inset 0 0 18px rgba(0,0,0,.35)';
        document.body.appendChild(el);
      }, lastTap, PAD);
    }
    let buf = await page.screenshot({ type: 'png' });
    let shrunk = false;
    /* the evidence limit is 200 KB a shot. A screen that lands over it is
       RETAKEN at one device pixel per CSS px rather than shipped heavy; the
       state is untouched by a viewport change, and the line below says it
       happened so nobody reads a soft shot as a soft screen. */
    if (buf.length > LIMIT) {
      await page.setViewport({ ...size, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      buf = await page.screenshot({ type: 'png' });
      await page.setViewport({ ...size, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      shrunk = true;
    }
    if (THUMB) await page.evaluate(() => { const p = document.getElementById('__thumbpad'); if (p) p.remove(); });
    const p = join(OUT, file + '.png');
    writeFileSync(p, buf);
    const kb = statSync(p).size / 1024;
    wrote.push({ name: file, kb });
    console.log('  ' + file.padEnd(24) + kb.toFixed(0).padStart(4) + ' KB' +
      (shrunk ? '   retaken at 1x to fit the 200 KB limit' : '') +
      (kb > LIMIT / 1024 ? '   OVER THE 200 KB EVIDENCE LIMIT' : ''));
  }
  const taken = {};
  async function maybe(name) {
    if (taken[name] || !want(name, key)) return;
    taken[name] = true;
    await shoot(name);
  }
  const scr = () => page.evaluate(() => window.MD_DEV.screen());
  const done = () => asked.every(n => taken[n]);

  /* ---- the thumb's path, from a cold start ------------------------------- */
  await maybe('title');

  await page.evaluate(n => window.MD_DEV.seed(n), SEED);
  await T('#btnBegin');
  await waitScreen(page, 'creation');

  /* three free bodies. The first one is photographed at the moment the dice
     have settled and the Origin and the three Callings are on the screen,
     which is the screen the plan calls the thrill of the game. */
  for (let i = 0; i < 3; i++) {
    await waitScreen(page, 'creation');
    await T('#btnRoll');
    await page.waitForFunction(() => document.querySelectorAll('#creCallings .card').length > 0, { timeout: 20000 });
    if (i === 0) await maybe('creation');
    await T('#creCallings .card');
    await page.waitForFunction(() => { const b = document.getElementById('btnKeep'); return !!b && !b.hidden; }, { timeout: 20000 });
    await T('#btnKeep');
  }
  if ((await scr()) === 'how') await T('#btnGotIt');
  await waitScreen(page, 'hall');
  await maybe('hall');

  await T('#btnDeploy');
  await waitScreen(page, 'deploy');
  const picks = await page.evaluate(() => {
    const rows = Array.prototype.slice.call(document.querySelectorAll('#deployList .rostrow'));
    const out = [];
    rows.forEach((r, i) => { if (r.classList.contains('pickable')) out.push(i + 1); });
    return out;
  });
  /* by POSITION, never three taps on one selector: the harness taps the FIRST
     match, so that would tick and untick a single row */
  for (const i of picks.slice(0, 3)) await T(`#deployList .rostrow:nth-child(${i})`);
  await T('#btnGo');
  await page.waitForFunction(() => !!window.MD_DEV.quest(), { timeout: 20000 });

  /* what a reasonable player would tap this stage, asked of the ENGINE and then
     tapped with real pointers. The page never calls the policy itself. */
  async function stagePlan() {
    return page.evaluate(() => {
      const state = window.MD_DEV.state(), q = window.MD_DEV.quest();
      const stage = window.MD.SIM.currentStage(state);
      const plan = window.MD.SIM.policy.assign(state);
      const alive = id => { const c = state.roster.filter(r => r.id === id)[0]; return !!c && c.alive; };
      const living = q.party.filter(alive);
      const used = {}, out = [];
      stage.slots.forEach(function (s, i) {
        if (s.done) return;
        const wantN = s.shape === 'relay' ? 2 : 1;
        const chars = (plan.slots[i] && plan.slots[i].chars) ? plan.slots[i].chars.slice() : [];
        while (chars.length < wantN) {
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
  }
  async function assignStage() {
    const plan = await stagePlan();
    for (let i = 0; i < plan.length; i++) {
      const t = plan[i];
      await T(`#qParty .pc:nth-child(${t.pc + 1})`);
      await T(`#qChallenges .chal:nth-child(${t.slot + 1})`);
      /* ONE character on ONE card is the picture the plan asks for: the board
         mid decision, not a board with every seat already full. */
      if (i === 0 && !taken.quest) {
        await page.waitForFunction(() => !!document.querySelector('#qChallenges .seat.full'), { timeout: 20000 }).catch(() => {});
        await maybe('quest');
      }
    }
    if (await page.evaluate(() => document.getElementById('btnResolve').disabled)) return 'RESOLVE never came alive';
    await T('#btnResolve');
    return null;
  }
  async function assignBoss() {
    const plan = await page.evaluate(() => {
      const q = window.MD_DEV.quest();
      const p = window.MD.SIM.policy.boss(window.MD_DEV.state());
      return Object.keys(p.targets).map(id => ({ pc: q.party.indexOf(id), asp: p.targets[id] }));
    });
    for (const t of plan) {
      await T(`#bossParty .pc:nth-child(${t.pc + 1})`);
      await T(`#bossAspects .asp:nth-child(${t.asp + 1})`);
    }
    if (await page.evaluate(() => document.getElementById('btnBossResolve').disabled)) return 'boss RESOLVE never came alive';
    await T('#btnBossResolve');
    return null;
  }

  /* the walk. Progress is the QUEST moving (stage, step, cursor, round, cards),
     never a screen being seen twice: a boss round is board, results, strike
     sheet, board again, and that is a round and not a loop. */
  let turns = 0, stuck = 0, last = '';
  let where = 'quest';
  while (turns++ < 600 && !done()) {
    const s = await scr();
    where = s;
    const sig = await page.evaluate(() => {
      const q = window.MD_DEV.quest();
      if (!q) return 'noquest|' + window.MD_DEV.screen();
      return [q.stageIndex, q.step, q.cursor, q.round, q.results.length, (q.drops || []).length, !!q.held].join('|');
    });
    const full = s + '@' + sig;
    if (full === last) stuck++; else { stuck = 0; last = full; }
    if (stuck > 6) { notes.push(key + ': the quest stopped moving on the ' + s + ' screen at ' + sig); break; }

    if (s === 'hall' || s === 'title') break;
    if (s === 'quest') { const e = await assignStage(); if (e) { notes.push(key + ': ' + e); break; } continue; }
    if (s === 'preroll') { await maybe('preroll'); await T('#btnRollCheck'); continue; }
    if (s === 'result') {
      /* the surge is the best moment in the game and it is the one card worth a
         picture: the big die, the second die beside it, the word. A card with no
         surge on it is walked past. */
      const surged = await page.evaluate(() => {
        const q = window.MD_DEV.quest();
        const r = q && (q.held ? q.held.res : (q.results.length ? q.results[q.results.length - 1] : null));
        return !!(r && r.roll && r.roll.surged);
      });
      if (surged) await maybe('result-surge');
      await T('#btnContinue');
      continue;
    }
    if (s === 'sheet') { await T('#btnSheetNext'); continue; }
    if (s === 'death') { await T('#btnDeathOn'); continue; }
    if (s === 'drop') { await maybe('drop'); await T('#btnSalvage'); continue; }
    if (s === 'boss') { await maybe('boss'); const e = await assignBoss(); if (e) { notes.push(key + ': ' + e); break; } continue; }
    if (s === 'trait') { await maybe('trait'); await T('#trCards .card'); await T('#btnTraitKeep'); continue; }
    if (s === 'how') { await T('#btnGotIt'); continue; }
    notes.push(key + ': the walk landed on a screen it does not know, ' + JSON.stringify(s));
    break;
  }

  /* say what the walk could NOT reach, by name. A missing shot that nobody
     names is read tomorrow as a screen that does not exist. */
  asked.filter(n => !taken[n]).forEach(n => {
    missed.push(fileName(n, key) + ' (the walk ended on the ' + where + ' screen after ' + turns + ' turns)');
    console.log('  ' + fileName(n, key).padEnd(24) + ' NOT REACHED on this walk, not shot');
  });
  if (errors.length) notes.push(key + ': the console said ' + Array.from(new Set(errors)).slice(0, 3).join(' | '));
  await browser.close();
  console.log('  (' + size.width + 'x' + size.height + ' done)');
}

close();
const over = wrote.filter(w => w.kb > LIMIT / 1024);
console.log('');
notes.forEach(n => console.log('  - ' + n));
console.log(wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB') +
  (missed.length ? ', ' + missed.length + ' NOT REACHED: ' + missed.join(', ') : ''));
console.log('OPEN THEM. A shot nobody looked at is how a blank screen ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
process.exit(over.length ? 1 : 0);
