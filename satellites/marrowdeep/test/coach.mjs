#!/usr/bin/env node
/* THE COACH GATE (HANDOFF-OPUS-SEP15 lane A2.1).
 *
 *   node test/coach.mjs
 *
 * The first quest coach teaches four things at the moment each matters: what a
 * target is, what a Push costs, why a die turns over, what Strain does. The
 * ladder (which beat on which screen) is asserted in `sim.js --test`. This gate
 * holds the PAGE's half, which the sim cannot see, by playing through real taps:
 *
 *   1. A fresh account plays a whole Depth I quest. Every beat the coach
 *      shows is shown ONCE (the page's own log and the lines on the glass
 *      agree), on the screen the ladder names, with the words DATA holds, and
 *      the save remembers it. Every beat whose moment came in that quest was
 *      shown; a beat whose moment never came is named, so a content change that
 *      stops dealing it turns this red rather than quietly shrinking it.
 *   2. The page RELOADS into that save and plays on: nothing is said again.
 *   3. A save from before the coach (the four flags absent, written as a
 *      fixture and reloaded into, never set on a live page) hears the target
 *      again on its next check.
 *   4. HOW IT GOES on the Hall, then SHOW ME AGAIN, by real taps: the four are
 *      unseen in the save and the target comes back on the next check.
 *   5. `?test=1`: a whole quest and not one line, and no flag written.
 *
 * ⛔ Nothing here sets a flag. The only ways a flag moves are the coach showing
 * a line, SHOW ME AGAIN being tapped, and a fixture reloaded into.
 */
import { serve, open, reporter, tap, waitScreen } from './harness.mjs';

const SEED = 2;
const { base, close } = await serve();
const { fails, say } = reporter();

/* what the glass shows: the current screen, and the coach line on it if one is visible */
const look = page => page.evaluate(() => {
  const s = window.MD_DEV.screen();
  const host = document.querySelector('#scr-' + s + ' .coachline');
  let text = null;
  if (host && !host.hidden) {
    const r = host.getBoundingClientRect();
    if (r.height > 1 && r.width > 1) text = host.textContent;
  }
  const lines = (window.MD_DEV.data().lines || {}).coach || {};
  let kind = null;
  for (const k of Object.keys(lines)) if (lines[k] === text) kind = k;
  return { screen: s, text: text, kind: kind };
});

async function createThree(page) {
  for (let i = 0; i < 3; i++) {
    await waitScreen(page, 'creation');
    await tap(page, '#btnRoll');
    await page.waitForFunction(() => document.querySelectorAll('#creCallings .card').length > 0, { timeout: 20000 });
    await tap(page, '#creCallings .card');
    await page.waitForFunction(() => { const b = document.getElementById('btnKeep'); return !!b && !b.hidden; }, { timeout: 20000 });
    await tap(page, '#btnKeep');
  }
  await page.waitForFunction(() => ['how', 'hall'].indexOf(window.MD_DEV.screen()) >= 0, { timeout: 20000 });
  if (await page.evaluate(() => window.MD_DEV.screen()) === 'how') await tap(page, '#btnGotIt');
  await waitScreen(page, 'hall');
}

async function deployAll(page) {
  await tap(page, '#btnDeploy');
  await waitScreen(page, 'deploy');
  const picks = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('#deployList .rostrow').forEach((r, i) => { if (r.classList.contains('pickable')) out.push(i + 1); });
    return out;
  });
  for (const i of picks.slice(0, 3)) await tap(page, `#deployList .rostrow:nth-child(${i})`);
  await tap(page, '#btnGo');
  await page.waitForFunction(() => !!window.MD_DEV.quest(), { timeout: 20000 });
}

/* Plays until the Hall (or until `until` says stop), tapping what the engine's
   own policy would, and records what the coach said on every screen it landed
   on, plus the moments at which each beat was due, read off the glass and the
   quest before any tap. */
async function play(page, until) {
  const seen = [], moments = { push: 0, surge: 0, strain: 0, check: 0 };
  let turns = 0, stuck = 0, last = '';
  while (turns++ < 900) {
    const L = await look(page);
    const s = L.screen;
    if (s === 'hall' || s === 'title') break;
    const sig = await page.evaluate(() => {
      const q = window.MD_DEV.quest();
      return q ? [q.stageIndex, q.step, q.cursor, q.round, q.results.length, (q.drops || []).length, !!q.held, window.MD_DEV.screen()].join('|') : 'none';
    });
    if (sig === last) stuck++; else { stuck = 0; last = sig; }
    if (stuck > 6) { say(false, 'the walk stopped moving on ' + s + ' at ' + sig); break; }
    seen.push(L);
    if (until && until(L, seen)) break;

    if (s === 'quest') {
      const plan = await page.evaluate(() => {
        const state = window.MD_DEV.state(), q = window.MD_DEV.quest();
        const stage = window.MD.SIM.currentStage(state);
        const p = window.MD.SIM.policy.assign(state);
        const alive = id => { const c = state.roster.filter(r => r.id === id)[0]; return !!c && c.alive; };
        const living = q.party.filter(alive);
        const used = {}, out = [];
        stage.slots.forEach(function (sl, i) {
          if (sl.done) return;
          const wantN = sl.shape === 'relay' ? 2 : 1;
          const chars = (p.slots[i] && p.slots[i].chars) ? p.slots[i].chars.slice() : [];
          while (chars.length < wantN) {
            const spare = living.filter(id => chars.indexOf(id) < 0).sort((a, b) => (used[a] || 0) - (used[b] || 0))[0];
            if (spare == null) break;
            chars.push(spare);
          }
          chars.forEach(function (id) { used[id] = (used[id] || 0) + 1; out.push({ slot: i, pc: q.party.indexOf(id) }); });
        });
        return out;
      });
      for (const t of plan) {
        await tap(page, `#qParty .pc:nth-child(${t.pc + 1})`);
        await tap(page, `#qChallenges .chal:nth-child(${t.slot + 1})`);
      }
      await tap(page, '#btnResolve');
      continue;
    }
    if (s === 'preroll') {
      moments.check++;
      if (await page.evaluate(() => !!document.getElementById('chipPush'))) moments.push++;
      await tap(page, '#btnRollCheck');
      continue;
    }
    if (s === 'result') {
      moments.check++;
      const info = await page.evaluate(() => {
        const q = window.MD_DEV.quest();
        const r = q && (q.held ? q.held.res : (q.results.length ? q.results[q.results.length - 1] : null));
        return { surged: !!(r && r.roll && r.roll.surged) };
      });
      if (info.surged) moments.surge++;
      await tap(page, '#btnContinue');
      continue;
    }
    if (s === 'sheet') {
      if (await page.evaluate(() => {
        const st = window.MD_DEV.state(), q = st && st.quest;
        return !!q && q.party.some(id => { const c = st.roster.filter(r => r.id === id)[0]; return c && c.alive && c.strain > 0; });
      })) moments.strain++;
      await tap(page, '#btnSheetNext');
      continue;
    }
    if (s === 'death') { await tap(page, '#btnDeathOn'); continue; }
    if (s === 'drop') { await tap(page, '#btnSalvage'); continue; }
    if (s === 'boss') {
      const plan = await page.evaluate(() => {
        const q = window.MD_DEV.quest();
        const p = window.MD.SIM.policy.boss(window.MD_DEV.state());
        return Object.keys(p.targets).map(id => ({ pc: q.party.indexOf(id), asp: p.targets[id] }));
      });
      for (const t of plan) {
        await tap(page, `#bossParty .pc:nth-child(${t.pc + 1})`);
        await tap(page, `#bossAspects .asp:nth-child(${t.asp + 1})`);
      }
      await tap(page, '#btnBossResolve');
      continue;
    }
    if (s === 'trait') { await tap(page, '#trCards .card'); await tap(page, '#btnTraitKeep'); continue; }
    if (s === 'how') { await tap(page, '#btnGotIt'); continue; }
    say(false, 'the walk landed on a screen it does not know: ' + s);
    break;
  }
  return { seen, moments };
}

const WHERE = { tn: ['preroll', 'result'], push: ['preroll'], surge: ['result'], strain: ['sheet'] };
const shown = walk => walk.seen.filter(L => L.text);

/* ---- 1. a fresh account, a whole quest ------------------------------------ */
{
  const { browser, page, errors } = await open(base, { width: 375, height: 667 });
  await page.evaluate(n => window.MD_DEV.seed(n), SEED);
  await tap(page, '#btnBegin');
  await createThree(page);
  await deployAll(page);
  const w = await play(page);
  const dev = await page.evaluate(() => window.MD_DEV.coach());
  const lines = await page.evaluate(() => window.MD_DEV.data().lines.coach || {});
  const glass = shown(w);

  say(dev.off === false, 'the coach is on without ?test=1');
  say(glass.every(L => !!L.kind), 'every coach line on the glass is one of DATA\'s coach lines'
    + (glass.some(L => !L.kind) ? ': ' + glass.filter(L => !L.kind).map(L => JSON.stringify(L.text)).join(', ') : ''));
  say(dev.beats.every(k => typeof lines[k] === 'string' && lines[k].length > 20),
    'DATA holds a real line for each of the ' + dev.beats.length + ' beats');

  for (const k of dev.beats) {
    const onGlass = glass.filter(L => L.kind === k);
    const inLog = dev.log.filter(e => e.kind === k);
    say(inLog.length <= 1 && onGlass.length === inLog.length,
      k + ': shown ' + onGlass.length + ' time(s) on the glass and ' + inLog.length + ' in the page\'s log, and never more than once');
    if (onGlass.length) {
      say(WHERE[k].indexOf(onGlass[0].screen) >= 0 || (k === 'strain' && onGlass[0].screen === 'sheet'),
        k + ': on the ' + onGlass[0].screen + ' screen, which is where the ladder puts it (' + WHERE[k].join(' or ') + ')');
      say(dev.seen[k] === 1, k + ': the save remembers it (seen.' + k + ' = ' + JSON.stringify(dev.seen[k]) + ')');
    }
  }
  /* a beat whose moment came must have been shown; a moment that never came is named */
  const came = { tn: w.moments.check > 0, push: w.moments.push > 0, surge: w.moments.surge > 0, strain: w.moments.strain > 0 };
  for (const k of dev.beats) {
    say(!came[k] || dev.log.some(e => e.kind === k),
      k + ': its moment came ' + (came[k] ? 'in this quest and it was taught' : 'NEVER in this quest'));
  }
  say(dev.beats.every(k => came[k]), 'seed ' + SEED + ' reaches all four moments in one Depth I quest (checks '
    + w.moments.check + ', pre rolls with a Push ' + w.moments.push + ', surges ' + w.moments.surge + ', strained sheets ' + w.moments.strain + ')');
  say(errors.length === 0, 'no console or page error on the fresh walk' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));

  /* ---- 2. reload into that save and play on: nothing again ----------------- */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => !!window.MD_DEV && window.MD_DEV.ready === true && window.MD_DEV.screen() === 'title', { timeout: 30000 });
  await tap(page, '#btnBegin');
  await waitScreen(page, 'hall');
  await deployAll(page);
  let checks = 0;
  const w2 = await play(page, (L) => { if (L.screen === 'result') checks++; return checks >= 6; });
  const dev2 = await page.evaluate(() => window.MD_DEV.coach());
  say(checks >= 3, 'the second quest after the reload played ' + checks + ' checks (at least three, or this proves nothing)');
  say(shown(w2).length === 0 && dev2.log.length === 0,
    'after a reload into the same save the coach says nothing (' + shown(w2).map(L => L.kind).join(', ') + ')');

  /* ---- 3. a save from before the coach, as a fixture, reloaded into --------- */
  const old = await page.evaluate(() => {
    const s = window.MD_DEV.save();
    s.seen = { how: 1, legacies: (s.seen && s.seen.legacies) || [] };
    return s;
  });
  await page.evaluate(s => window.MD_DEV.fixture(s), old).catch(() => {});
  await page.waitForFunction(() => !!window.MD_DEV && window.MD_DEV.ready === true && window.MD_DEV.screen() === 'title', { timeout: 30000 });
  await tap(page, '#btnBegin');
  await page.waitForFunction(() => ['hall', 'quest', 'preroll', 'result', 'sheet', 'boss', 'drop', 'death', 'trait'].indexOf(window.MD_DEV.screen()) >= 0, { timeout: 20000 });
  if (await page.evaluate(() => window.MD_DEV.screen()) === 'hall') await deployAll(page);
  const w3 = await play(page, (L) => !!L.text);
  const firstOld = shown(w3)[0];
  say(!!firstOld && (firstOld.kind === 'tn' || firstOld.kind === 'surge'),
    'a save from before the coach hears it on its next check (' + (firstOld ? firstOld.kind + ' on ' + firstOld.screen : 'nothing was said') + ')');
  await browser.close();
}

/* ---- 4. HOW IT GOES, then SHOW ME AGAIN, by real taps ----------------------- */
{
  const { browser, page, errors } = await open(base, { width: 375, height: 667 });
  await page.evaluate(n => window.MD_DEV.seed(n), SEED);
  await tap(page, '#btnBegin');
  await createThree(page);
  await deployAll(page);
  await play(page);                                        /* a whole quest: the flags are set by playing */
  const before = await page.evaluate(() => window.MD_DEV.coach().seen);
  await waitScreen(page, 'hall');
  await page.evaluate(() => { const b = document.querySelector('#scr-hall .body'); b.scrollTop = b.scrollHeight; });
  await tap(page, '#btnHallHow');
  await waitScreen(page, 'how');
  await tap(page, '#btnCoachAgain');
  await waitScreen(page, 'hall');
  const after = await page.evaluate(() => window.MD_DEV.coach().seen);
  say(before.tn === 1 && ['tn', 'push', 'surge', 'strain'].every(k => after[k] === 0),
    'SHOW ME AGAIN turns the four flags from ' + JSON.stringify([before.tn, before.push, before.surge, before.strain])
    + ' to ' + JSON.stringify([after.tn, after.push, after.surge, after.strain]));
  await deployAll(page);
  const w4 = await play(page, (L) => !!L.text);
  const again = shown(w4)[0];
  say(!!again && (again.kind === 'tn' || again.kind === 'surge'), 'and the first check after it teaches again ('
    + (again ? again.kind + ' on ' + again.screen : 'nothing was said') + ')');
  say(errors.length === 0, 'no console or page error on the replay walk' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
}

/* ---- 5. ?test=1: a whole quest and not one line ----------------------------- */
{
  const { browser, page, errors } = await open(base, { width: 375, height: 667, query: 'test=1' });
  await page.evaluate(n => window.MD_DEV.seed(n), SEED);
  await tap(page, '#btnBegin');
  await createThree(page);
  await deployAll(page);
  const w = await play(page);
  const dev = await page.evaluate(() => window.MD_DEV.coach());
  say(dev.off === true, 'the coach knows it is off at ?test=1');
  say(w.moments.check > 5, 'the ?test=1 walk played a real quest (' + w.moments.check + ' checks)');
  say(shown(w).length === 0 && dev.log.length === 0, 'at ?test=1 not one coach line in a whole quest ('
    + shown(w).map(L => L.kind + '@' + L.screen).join(', ') + ')');
  say(['tn', 'push', 'surge', 'strain'].every(k => !dev.seen[k]), 'and no flag written ' + JSON.stringify(dev.seen));
  say(errors.length === 0, 'no console or page error at ?test=1' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
}

close();
console.log(fails.length ? '\nCOACH FAILED: ' + fails.length : '\nCOACH OK');
process.exit(fails.length ? 1 : 0);
