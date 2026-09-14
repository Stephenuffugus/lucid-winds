#!/usr/bin/env node
/* A1: play Marrowdeep honestly through real taps at three widths.
 *   node a1walk.mjs <outdir> [tall|mid|small] [A|B]
 * Walk A (seed 2): cold start, three creations, how, hall, deploy, a whole Depth I
 *   quest (equipping the first drop on a body, taking renown on the rest), the Hall
 *   again, both spend sheets, the roster, a character, RETIRE, the wall.
 * Walk B (seed 6): the wipe: a death card, the Hall after, the stray, the wall.
 * Every screen text is dumped beside its shot so the copy can be read too. */
import { writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, tap, centre, waitScreen } from '../test/harness.mjs';

const OUT = process.argv[2];
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const onlySize = process.argv[3] && process.argv[3] !== 'all' ? process.argv[3] : null;
const onlyWalk = process.argv[4] || null;
const SIZES = { tall: { width: 412, height: 915 }, mid: { width: 375, height: 667 }, small: { width: 320, height: 568 } };
const LIMIT = 200 * 1024;
const texts = {};
const notes = [];

const { base, close } = await serve();

async function walk(key, size, W) {
  const seed = W === 'A' ? 2 : 6;
  const { browser, page, errors } = await open(base, size);
  const taken = {};
  const scr = () => page.evaluate(() => window.MD_DEV.screen());
  async function shoot(name, force) {
    if (taken[name] && !force) return;
    taken[name] = true;
    const file = 'a1' + W + '-' + name + '-' + key;
    let buf = await page.screenshot({ type: 'png' });
    if (buf.length > LIMIT) {
      await page.setViewport({ ...size, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      buf = await page.screenshot({ type: 'png' });
      await page.setViewport({ ...size, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    }
    writeFileSync(join(OUT, file + '.png'), buf);
    texts[file] = await page.evaluate(() => {
      const s = window.MD_DEV.screen();
      const el = document.getElementById('scr-' + s);
      /* the exits: every control whose word is BACK, CLOSE, CONTINUE, NEXT, GOT IT,
         with its centre as a fraction of the viewport height */
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const exits = Array.prototype.slice.call(el ? el.querySelectorAll('button') : [])
        .filter(b => !b.hidden && b.getBoundingClientRect().height > 0)
        .map(b => { const r = b.getBoundingClientRect(); return b.id + '@' + ((r.top + r.height / 2) / vh).toFixed(2); });
      const body = el ? el.querySelector('.body') : null;
      return { screen: s, text: el ? el.innerText.replace(/\n{2,}/g, '\n') : '(no element)', buttons: exits,
        scrolls: body ? (body.scrollHeight > body.clientHeight + 2 ? 'body scrolls ' + body.scrollHeight + '/' + body.clientHeight : 'fits') : 'no body' };
    });
    console.log('  ' + file.padEnd(34) + (statSync(join(OUT, file + '.png')).size / 1024).toFixed(0) + ' KB');
  }

  await shoot('title');
  await page.evaluate(n => window.MD_DEV.seed(n), seed);
  await tap(page, '#btnBegin');
  await waitScreen(page, 'creation');
  for (let i = 0; i < 3; i++) {
    await waitScreen(page, 'creation');
    if (i === 0) await shoot('creation-cold');
    await tap(page, '#btnRoll');
    await page.waitForFunction(() => document.querySelectorAll('#creCallings .card').length > 0, { timeout: 20000 });
    if (i === 0) await shoot('creation-dealt');
    await tap(page, '#creCallings .card');
    await page.waitForFunction(() => { const b = document.getElementById('btnKeep'); return !!b && !b.hidden; }, { timeout: 20000 });
    if (i === 0) await shoot('creation-picked');
    await tap(page, '#btnKeep');
  }
  await page.waitForFunction(() => ['how', 'hall'].indexOf(window.MD_DEV.screen()) >= 0, { timeout: 20000 });
  if ((await scr()) === 'how') { await shoot('how'); await tap(page, '#btnGotIt'); }
  await waitScreen(page, 'hall');
  await shoot('hall-first');
  await tap(page, '#btnDeploy');
  await waitScreen(page, 'deploy');
  await shoot('deploy-empty');
  const picks = await page.evaluate(() => {
    const rows = Array.prototype.slice.call(document.querySelectorAll('#deployList .rostrow'));
    const out = []; rows.forEach((r, i) => { if (r.classList.contains('pickable')) out.push(i + 1); }); return out;
  });
  for (const i of picks.slice(0, 3)) await tap(page, `#deployList .rostrow:nth-child(${i})`);
  await shoot('deploy-ticked');
  await tap(page, '#btnGo');
  await page.waitForFunction(() => !!window.MD_DEV.quest(), { timeout: 20000 });

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
          const spare = living.filter(id => chars.indexOf(id) < 0).sort((a, b) => (used[a] || 0) - (used[b] || 0))[0];
          if (spare == null) break; chars.push(spare);
        }
        chars.forEach(function (id) { used[id] = (used[id] || 0) + 1; out.push({ slot: i, pc: q.party.indexOf(id) }); });
      });
      return out;
    });
  }
  let stageShots = 0;
  async function assignStage() {
    const plan = await stagePlan();
    const idx = await page.evaluate(() => window.MD_DEV.quest().stageIndex);
    await shoot('quest-s' + (idx + 1) + '-before');
    for (let i = 0; i < plan.length; i++) {
      await tap(page, `#qParty .pc:nth-child(${plan[i].pc + 1})`);
      if (i === 0 && idx === 0) await shoot('quest-s1-selected');
      await tap(page, `#qChallenges .chal:nth-child(${plan[i].slot + 1})`);
    }
    await shoot('quest-s' + (idx + 1) + '-assigned');
    if (await page.evaluate(() => document.getElementById('btnResolve').disabled)) return 'RESOLVE never came alive';
    await tap(page, '#btnResolve');
    return null;
  }
  async function assignBoss() {
    const plan = await page.evaluate(() => {
      const q = window.MD_DEV.quest();
      const p = window.MD.SIM.policy.boss(window.MD_DEV.state());
      return Object.keys(p.targets).map(id => ({ pc: q.party.indexOf(id), asp: p.targets[id] }));
    });
    const round = await page.evaluate(() => window.MD_DEV.quest().round);
    if (round <= 1) await shoot('boss-r' + round + '-before');
    for (const t of plan) {
      await tap(page, `#bossParty .pc:nth-child(${t.pc + 1})`);
      await tap(page, `#bossAspects .asp:nth-child(${t.asp + 1})`);
    }
    if (round <= 1) await shoot('boss-r' + round + '-assigned');
    if (await page.evaluate(() => document.getElementById('btnBossResolve').disabled)) return 'boss RESOLVE never came alive';
    await tap(page, '#btnBossResolve');
    return null;
  }

  let turns = 0, stuck = 0, last = '', equipped = false, results = 0, sheets = 0;
  while (turns++ < 800) {
    const s = await scr();
    const sig = await page.evaluate(() => {
      const q = window.MD_DEV.quest();
      if (!q) return 'noquest|' + window.MD_DEV.screen();
      return [q.stageIndex, q.step, q.cursor, q.round, q.results.length, (q.drops || []).length, !!q.held,
        document.querySelectorAll('#dropTargets > *').length, window.MD_DEV.screen()].join('|');
    });
    /* A2.1: whenever the coach has a line on the glass, that is a shot */
    const coachKind = await page.evaluate(() => {
      const h = document.querySelector('#scr-' + window.MD_DEV.screen() + ' .coachline');
      if (!h || h.hidden) return null;
      const L = (window.MD_DEV.data().lines || {}).coach || {};
      for (const k in L) {
        const rx = new RegExp('^' + L[k].replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\w+\}/g, '(\\d+)') + '$');
        if (rx.test(h.textContent)) return k;
      }
      return 'unknown';
    });
    if (coachKind) await shoot('coach-' + coachKind);
    const full = s + '@' + sig;
    if (full === last) stuck++; else { stuck = 0; last = full; }
    if (stuck > 6) { notes.push(W + ' ' + key + ': STUCK on ' + s + ' at ' + sig); await shoot('STUCK-' + s, true); break; }
    if (s === 'hall' || s === 'title') break;
    if (s === 'quest') { const e = await assignStage(); if (e) { notes.push(W + ' ' + key + ': ' + e); break; } continue; }
    if (s === 'preroll') { await shoot('preroll'); await tap(page, '#btnRollCheck'); continue; }
    if (s === 'result') {
      results++;
      const info = await page.evaluate(() => {
        const q = window.MD_DEV.quest();
        const r = q && (q.held ? q.held.res : (q.results.length ? q.results[q.results.length - 1] : null));
        return { surged: !!(r && r.roll && r.roll.surged), pass: !!(r && r.pass), boss: !!(q && q.round > 0), reroll: !document.getElementById('btnRerollCheck').hidden };
      });
      if (results === 1) await shoot('result-first');
      if (info.surged) await shoot('result-surge');
      if (!info.pass) await shoot('result-fail');
      if (info.boss) await shoot('result-boss');
      if (info.reroll) await shoot('result-reroll');
      await tap(page, '#btnContinue');
      continue;
    }
    if (s === 'sheet') {
      sheets++;
      const title = await page.evaluate(() => document.getElementById('shTitle').textContent);
      await shoot('sheet-' + (/STRIKE|ROUND/i.test(title) ? 'strike' : (sheets === 1 ? 'first' : 'x')), false);
      if (/STRIKE|ROUND/i.test(title)) await shoot('sheet-strike');
      await tap(page, '#btnSheetNext'); continue;
    }
    if (s === 'death') { await shoot('death'); await tap(page, '#btnDeathOn'); continue; }
    if (s === 'drop') {
      await shoot('drop');
      const nT = await page.evaluate(() => document.querySelectorAll('#dropTargets > *').length);
      if (W === 'A' && !equipped && nT > 0) {
        equipped = true;
        await tap(page, '#dropTargets > *:first-child');
        await shoot('drop-after-equip-tap', true);
        continue;
      }
      await tap(page, '#btnSalvage'); continue;
    }
    if (s === 'boss') { const e = await assignBoss(); if (e) { notes.push(W + ' ' + key + ': ' + e); break; } continue; }
    if (s === 'trait') {
      await shoot('trait');
      await tap(page, '#trCards .card');
      await shoot('trait-picked');
      await tap(page, '#btnTraitKeep'); continue;
    }
    if (s === 'how') { await tap(page, '#btnGotIt'); continue; }
    await shoot('unknown-' + s);
    notes.push(W + ' ' + key + ': the walk landed on ' + s);
    break;
  }
  const end = await scr();
  notes.push(W + ' ' + key + ': walk ended on ' + end + ' after ' + turns + ' turns');
  if (end === 'hall') {
    await shoot('hall-after');
    await page.evaluate(() => { const b = document.querySelector('#scr-hall .body'); if (b) b.scrollTop = b.scrollHeight; });
    await shoot('hall-after-scrolled');
    await tap(page, '#btnSpendRenown'); await waitScreen(page, 'spend'); await shoot('spend-renown');
    await tap(page, '#btnSpendBack'); await waitScreen(page, 'hall');
    await tap(page, '#btnSpendMarrow'); await waitScreen(page, 'spend'); await shoot('spend-marrow');
    await tap(page, '#btnSpendBack'); await waitScreen(page, 'hall');
    await tap(page, '#btnRoster'); await waitScreen(page, 'roster'); await shoot('roster');
    const vet = await page.evaluate(() => {
      const st = window.MD_DEV.state();
      const rows = document.querySelectorAll('#rosterList .rostrow');
      for (let i = 0; i < st.roster.length; i++) if (st.roster[i].alive && st.roster[i].questsSurvived >= 1) return i + 1;
      return rows.length ? 1 : 0;
    });
    if (vet) {
      await tap(page, `#rosterList .rostrow:nth-child(${vet})`);
      await waitScreen(page, 'character');
      await shoot('character');
      await page.evaluate(() => { const b = document.querySelector('#scr-character .body'); if (b) b.scrollTop = b.scrollHeight; });
      await shoot('character-scrolled');
      const canRetire = await page.evaluate(() => !document.getElementById('btnRetire').hidden);
      if (W === 'A' && canRetire) {
        await tap(page, '#btnRetire');
        await waitScreen(page, 'roster');
        await shoot('roster-after-retire');
      } else {
        await tap(page, '#btnCharBack'); await waitScreen(page, 'roster');
      }
    }
    await tap(page, '#btnRosterBack'); await waitScreen(page, 'hall');
    await shoot('hall-final');
    const wallOn = await page.evaluate(() => !document.getElementById('btnWall').disabled);
    if (wallOn) { await tap(page, '#btnWall'); await waitScreen(page, 'wall'); await shoot('wall'); await tap(page, '#btnWallBack'); }
    else notes.push(W + ' ' + key + ': THE WALL disabled at the end');
    await tap(page, '#btnDeploy'); await waitScreen(page, 'deploy'); await shoot('deploy-second');
    const acct = await page.evaluate(() => { const a = window.MD_DEV.account(); const st = window.MD_DEV.state();
      return { renown: a.renown, marrow: a.marrow, qc: a.questsCompleted, roster: st.roster.map(c => c.name + ':' + (c.alive ? 'alive' : 'dead') + ':q' + c.questsSurvived + ':s' + c.strain + ':sc' + c.scars), legacies: (a.legacies || []).length, wall: (a.wall || []).length }; });
    notes.push(W + ' ' + key + ': account ' + JSON.stringify(acct));
  }
  if (errors.length) notes.push(W + ' ' + key + ': console ' + Array.from(new Set(errors)).slice(0, 4).join(' | '));
  await browser.close();
}

for (const key of Object.keys(SIZES)) {
  if (onlySize && key !== onlySize) continue;
  for (const W of ['A', 'B']) {
    if (onlyWalk && W !== onlyWalk) continue;
    try { await walk(key, SIZES[key], W); } catch (e) { notes.push(W + ' ' + key + ': THREW ' + e.message.split('\n')[0]); }
  }
}
close();
writeFileSync(join(OUT, 'texts.json'), JSON.stringify(texts, null, 1));
notes.forEach(n => console.log('- ' + n));
console.log('A1 WALK DONE');
