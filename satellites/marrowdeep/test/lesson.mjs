#!/usr/bin/env node
/* THE LESSON GATE (HANDOFF-OPUS-SEP15 lane A2.2, 2026-09-14).
 *
 *   node test/lesson.mjs
 *
 * The engine freezes a lesson when a plan is committed (SIM.lessonFor, held in
 * `sim.js --odds` as a rule over thousands of plans). This holds the PAGE's half,
 * by playing a real quest through real taps:
 *   1. After a stage played on a plan the engine's policy would not have made, and
 *      whose better line passes at least LESSON_MARGIN more often, the stage end
 *      sheet carries ONE lesson line, and its names and both numbers are the
 *      engine's frozen record for that stage, not something the page worked out.
 *   2. After a stage played on the policy's own plan, no lesson line.
 *   3. Never before the roll: no lesson line on any pre roll or result card.
 *   4. No console or page error.
 * ⛔ The gate reads the engine's PREDICTION (lessonFor on a copy of the state) only
 * to decide which plan to tap; the assertions read what the page painted against
 * what the engine froze. Nothing here writes a lesson.
 */
import { serve, open, reporter, tap, waitScreen } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const { browser, page, errors } = await open(base, { width: 375, height: 667 });

await page.evaluate(n => window.MD_DEV.seed(n), 2);
await tap(page, '#btnBegin');
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

/* The plan to tap at this stage. The policy's own, or, until one lesson has been
   shown, the policy's plan with two single body slots' holders swapped when the
   engine predicts that swap earns a lesson. The page picks a Vault's or an Open's
   stat as the holder's best die, so the prediction does too. */
async function choosePlan(wantLesson) {
  return page.evaluate((wantLesson) => {
    const SIM = window.MD.SIM, state = window.MD_DEV.state(), q = window.MD_DEV.quest();
    const stage = SIM.currentStage(state);
    const pol = SIM.policy.assign(state);
    const toTaps = (plan) => {
      const out = [];
      stage.slots.forEach((s, i) => {
        const e = plan.slots[i];
        if (s.done || !e || !e.chars) return;
        e.chars.forEach((id) => out.push({ slot: i, pc: q.party.indexOf(id) }));
      });
      return out;
    };
    if (wantLesson) {
      const singles = [];
      stage.slots.forEach((s, i) => { const e = pol.slots[i]; if (!s.done && e && e.chars && e.chars.length === 1) singles.push(i); });
      for (let a = 0; a < singles.length; a++) for (let b = a + 1; b < singles.length; b++) {
        const swapped = JSON.parse(JSON.stringify(pol));
        const i = singles[a], j = singles[b];
        const t = swapped.slots[i].chars; swapped.slots[i].chars = swapped.slots[j].chars; swapped.slots[j].chars = t;
        [i, j].forEach((k) => {
          const sh = stage.slots[k].shape;
          if (sh === 'vault' || sh === 'open') swapped.slots[k].stat = window.MD.highestStat(SIM.byId(state, swapped.slots[k].chars[0]));
        });
        let predicted = null;
        try { predicted = SIM.lessonFor(JSON.parse(JSON.stringify(state)), swapped); } catch (e) { predicted = null; }
        if (predicted) return { kind: 'swap', taps: toTaps(swapped), stage: stage.n };
      }
    }
    return { kind: 'policy', taps: toTaps(pol), stage: stage.n };
  }, wantLesson);
}

let shown = 0, policySheets = 0, early = 0, turns = 0, stuck = 0, last = '';
let current = null;
while (turns++ < 900) {
  const s = await page.evaluate(() => window.MD_DEV.screen());
  if (s === 'hall' || s === 'title') break;
  const sig = await page.evaluate(() => {
    const q = window.MD_DEV.quest();
    return q ? [q.stageIndex, q.step, q.cursor, q.round, q.results.length, (q.drops || []).length, !!q.held, window.MD_DEV.screen()].join('|') : 'none';
  });
  if (sig === last) stuck++; else { stuck = 0; last = sig; }
  if (stuck > 6) { say(false, 'the walk stopped moving on ' + s + ' at ' + sig); break; }

  /* never before the roll */
  if (s === 'preroll' || s === 'result') {
    const has = await page.evaluate((s) => !!document.querySelector('#scr-' + s + ' .lesson'), s);
    if (has) early++;
  }
  if (s === 'quest') {
    current = await choosePlan(shown === 0);
    for (const t of current.taps) {
      await tap(page, `#qParty .pc:nth-child(${t.pc + 1})`);
      await tap(page, `#qChallenges .chal:nth-child(${t.slot + 1})`);
    }
    await tap(page, '#btnResolve');
    continue;
  }
  if (s === 'preroll') { await tap(page, '#btnRollCheck'); continue; }
  if (s === 'result') { await tap(page, '#btnContinue'); continue; }
  if (s === 'sheet') {
    const read = await page.evaluate(() => {
      const title = document.getElementById('shTitle').textContent;
      const m = /STAGE (\d+) IS BEHIND YOU/.exec(title);
      const line = document.querySelector('#shBody .lesson');
      const q = window.MD_DEV.quest(), st = window.MD_DEV.state();
      const n = m ? Number(m[1]) : null;
      const rec = (q && q.lessons && n != null) ? q.lessons[n] : null;
      let want = null;
      if (rec) {
        const first = (ids) => ids.map((id) => { const c = st.roster.filter((r) => r.id === id)[0]; return c ? c.name.split(' ')[0] : id; }).join(' and ');
        want = { names: first(rec.better), others: first(rec.taken), better: Math.round(rec.pBest * 100), taken: Math.round(rec.pTaken * 100) };
      }
      return { stage: n, text: line ? line.textContent : null, want: want };
    });
    if (read.stage != null && current && current.stage === read.stage) {
      if (current.kind === 'swap') {
        const w = read.want;
        /* both sides of the comparison, by name and number, from the engine's record:
           "against 33" alone never said whose 33 */
        const m = /against (\d+) for (.+)\.$/.exec(read.text || '');
        const ok = !!read.text && !!w && read.text.indexOf(w.names) === 0
          && read.text.indexOf(' ' + w.better + ' times in 100') > 0
          && !!m && Number(m[1]) === w.taken && m[2] === w.others;
        say(ok, 'stage ' + read.stage + ' was played on a worse plan and its sheet teaches the engine\'s lesson ('
          + JSON.stringify(read.text) + ', the record says ' + JSON.stringify(w) + ')');
        if (read.text) shown++;
      } else {
        policySheets++;
        if (read.text) say(false, 'stage ' + read.stage + ' was played on the policy\'s own plan and still shows a lesson: ' + JSON.stringify(read.text));
      }
    }
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

say(shown >= 1, 'a stage played on a worse plan taught a lesson on its sheet (' + shown + ')');
say(policySheets >= 2, 'at least two stages were played on the policy\'s own plan and showed none (' + policySheets + ')');
say(early === 0, 'no lesson line on any pre roll or result card (' + early + ')');
say(errors.length === 0, 'no console or page error' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await browser.close();
close();
console.log(fails.length ? '\nLESSON FAILED: ' + fails.length : '\nLESSON OK');
process.exit(fails.length ? 1 : 0);
