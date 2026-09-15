#!/usr/bin/env node
/* CREASE's teacher's links (plans/crease/HANDOFF-CREASE.md P3; the shape of satellites/yonder/test/config.mjs). The builder at
 * satellites/math/config registers CREASE with the SAME schema the page parses (satellites/crease/config.js), so a link made
 * there asks only for what the page will play.
 *
 *   node test/config.mjs          (in the foreground, under the gate lock: its last part opens the page)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the builder has an entry for CREASE going to ../crease/
 *   2. every key the builder offers, the page parses with the same type, the same values or bounds, and the same default;
 *      the seed is the page's own and never offered
 *   3. a link for every value the builder can offer reads back through the page's schema as exactly that value
 *   4. main.js imports CREASE_SCHEMA from ./config.js and hands it to parseConfig
 *   5. in a browser: a link of the builder's defaults and a link of other values play the mode, the grade and the run
 *      length the link asked for, and the page's mode and grade are the ones its rounds are dealt from (the mode the body
 *      carries, and every denominator in twenty rounds inside the grade's)
 */
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { serve, open, reporter, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { parseConfig, buildQuery } from '../../math/core/pure.js';
import { GAMES } from '../../math/config/schemas.js';
import { CREASE_SCHEMA } from '../config.js';
import { GRADE_DENOMINATORS } from '../bank.js';

const CREASE = join(MATH, '..', 'crease');
const { fails, say } = reporter();
const valuesOf = rule => rule.type === 'enum' ? rule.values : rule.type === 'bool' ? [true, false]
  : Array.from(new Set([rule.min, Math.round((rule.min + rule.max) / 2), rule.max, rule.default]));

const entry = GAMES.crease;
say(!!entry && entry.path === '../crease/', 'the builder has an entry for CREASE going to ../crease/' + (entry ? ' (' + entry.path + ')' : ' (none)'));
if (entry) {
  const differ = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    const mine = CREASE_SCHEMA[k];
    if (!mine) { differ.push(k + ' is not parsed by the page'); continue; }
    if (mine.type !== rule.type) differ.push(k + ' is ' + rule.type + ' in the builder and ' + mine.type + ' on the page');
    else if (rule.type === 'enum' && JSON.stringify([...rule.values].sort()) !== JSON.stringify([...mine.values].sort())) differ.push(k + ' offers ' + rule.values.join('/') + ', the page takes ' + mine.values.join('/'));
    else if (rule.type === 'int' && (rule.min !== mine.min || rule.max !== mine.max)) differ.push(k + ' runs ' + rule.min + ' to ' + rule.max + ' in the builder, ' + mine.min + ' to ' + mine.max + ' on the page');
    if (rule.default !== mine.default) differ.push(k + ' defaults to ' + rule.default + ' in the builder and ' + mine.default + ' on the page');
  }
  const unoffered = Object.keys(CREASE_SCHEMA).filter(k => k !== 'seed' && !entry.schema[k]);
  say(differ.length === 0 && unoffered.length === 0, 'every key the builder offers, the page parses with the same type, values or bounds, and default, and every key but the seed is offered'
    + (differ.length || unoffered.length ? ': ' + differ.concat(unoffered.map(k => k + ' is not offered')).join('; ') : ' (' + Object.keys(entry.schema).join(', ') + ')'));
  const lost = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    for (const v of valuesOf(rule)) {
      const q = buildQuery({ [k]: v }, entry.schema), back = parseConfig(q, CREASE_SCHEMA)[k];
      if (back !== v) lost.push(k + '=' + v + ' (the link "' + q + '" is read as ' + back + ')');
    }
  }
  say(lost.length === 0, 'a link for every value the builder offers reads back through the page\'s schema as that value' + (lost.length ? ': ' + lost.slice(0, 4).join(', ') : ''));
}
{
  const src = readFileSync(join(CREASE, 'main.js'), 'utf8');
  const imports = /import\s*\{[^}]*\bCREASE_SCHEMA\b[^}]*\}\s*from\s*['"]\.\/config\.js\?v=/.test(src);
  const parses = /parseConfig\(\s*location\.search\s*,\s*CREASE_SCHEMA\s*\)/.test(src);
  say(imports && parses, 'main.js imports CREASE_SCHEMA from ./config.js and hands it to parseConfig' + (imports ? '' : ' (it does not import it)') + (parses ? '' : ' (it parses something else)'));
}

/* what the page plays for a builder's link */
const s = await serve(join(MATH, '..'));
if (entry) {
  const defaults = {}, others = {};
  for (const [k, rule] of Object.entries(entry.schema)) {
    defaults[k] = rule.default;
    others[k] = rule.type === 'enum' ? rule.values.find(v => v !== rule.default) : rule.type === 'bool' ? !rule.default : (rule.default === rule.min ? rule.max : rule.min);
  }
  for (const [label, values] of [['the builder\'s defaults', defaults], ['other values', others]]) {
    const q = buildQuery(values, entry.schema);
    const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/crease/index.html' + (q ? q + '&' : '?'), ready: 'window.CREASE && window.CREASE.ready' }));
    await sleep(150);
    const played = await opened.page.evaluate(() => window.CREASE.config());
    const wrong = Object.keys(values).filter(k => !played || String(played[k]) !== String(values[k]));
    say(!!played && wrong.length === 0, 'CREASE plays what a link of ' + label + ' asked for (asked ' + JSON.stringify(values) + ', the page plays ' + JSON.stringify(played) + ')');
    /* the page's own rounds, not only its echo: the body's mode, and the denominators of twenty rounds dealt from its engine */
    const dealt = await opened.page.evaluate(() => ({ mode: document.body.dataset.mode, task: window.CREASE.task() }));
    say(dealt.mode === values.mode && dealt.task.mode === values.mode, label + ': the page is in the mode the link asked for (body ' + dealt.mode + ', task ' + dealt.task.mode + ')');
    const { rng } = await import('../../math/core/pure.js');
    const { freshRun, generateTask } = await import('../engine.js');
    const r = rng(20260915), outside = [];
    let st = freshRun({ grade: Number(values.grade), mode: values.mode });
    for (let i = 0; i < 20; i++) { const step = generateTask(r, st); st = step.state; if (!GRADE_DENOMINATORS[values.grade].includes(step.task.denominator)) outside.push(step.task.numerator + '/' + step.task.denominator); }
    say(dealt.task.numerator === generateTask(rng(20260915), freshRun({ grade: Number(values.grade), mode: values.mode })).task.numerator && outside.length === 0,
      label + ': its first round is the one Node deals for that grade and mode at the default seed, and twenty rounds stay inside grade ' + values.grade + '\'s denominators' + (outside.length ? ' (' + outside.join(', ') + ')' : ''));
    say(opened.errors.length === 0, label + ': nothing landed on the console' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
    await opened.browser.close();
  }
}
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CONFIG FAILURE(S)'); process.exit(1); }
console.log('CONFIG OK');
