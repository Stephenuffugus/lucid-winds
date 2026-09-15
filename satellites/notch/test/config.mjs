#!/usr/bin/env node
/* NOTCH's teacher's links (plans/notch/HANDOFF-NOTCH.md P3; the shape of the catalog's earlier config gates). The
 * builder at satellites/math/config registers NOTCH with the SAME schema the page parses (satellites/notch/config.js), so a
 * link made there asks only for what the page will play.
 *
 *   node test/config.mjs          (in the foreground, under the gate lock: its last part opens the page)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the builder has an entry for NOTCH going to ../notch/
 *   2. every key the builder offers, the page parses with the same type, the same values or bounds, and the same default;
 *      the seed is the page's own and never offered
 *   3. a link for every value the builder can offer reads back through the page's schema as exactly that value
 *   4. main.js imports NOTCH_SCHEMA from ./config.js and hands it to parseConfig
 *   5. in a browser: a link of the builder's defaults and a link of other values play the mode and the stage the link asked for,
 *      show only that mode's door when a mode is named, and the first task (after its door) is the one Node deals at the seed
 */
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { serve, open, reporter, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { parseConfig, buildQuery, rng } from '../../math/core/pure.js';
import { GAMES } from '../../math/config/schemas.js';
import { NOTCH_SCHEMA } from '../config.js';
import { dealSession, dealFind } from '../engine.js';

const NOTCH = join(MATH, '..', 'notch');
const { fails, say } = reporter();
const valuesOf = rule => rule.type === 'enum' ? rule.values : rule.type === 'bool' ? [true, false]
  : Array.from(new Set([rule.min, Math.round((rule.min + rule.max) / 2), rule.max, rule.default]));

const entry = GAMES.notch;
say(!!entry && entry.path === '../notch/', 'the builder has an entry for NOTCH going to ../notch/' + (entry ? ' (' + entry.path + ')' : ' (none)'));
if (entry) {
  const differ = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    const mine = NOTCH_SCHEMA[k];
    if (!mine) { differ.push(k + ' is not parsed by the page'); continue; }
    if (mine.type !== rule.type) differ.push(k + ' is ' + rule.type + ' in the builder and ' + mine.type + ' on the page');
    else if (rule.type === 'enum' && JSON.stringify([...rule.values].sort()) !== JSON.stringify([...mine.values].sort())) differ.push(k + ' offers ' + rule.values.join('/') + ', the page takes ' + mine.values.join('/'));
    else if (rule.type === 'int' && (rule.min !== mine.min || rule.max !== mine.max)) differ.push(k + ' runs ' + rule.min + ' to ' + rule.max + ' in the builder, ' + mine.min + ' to ' + mine.max + ' on the page');
    if (rule.default !== mine.default) differ.push(k + ' defaults to ' + rule.default + ' in the builder and ' + mine.default + ' on the page');
  }
  const unoffered = Object.keys(NOTCH_SCHEMA).filter(k => k !== 'seed' && !entry.schema[k]);
  say(differ.length === 0 && unoffered.length === 0, 'every key the builder offers, the page parses with the same type, values or bounds, and default, and every key but the seed is offered'
    + (differ.length || unoffered.length ? ': ' + differ.concat(unoffered.map(k => k + ' is not offered')).join('; ') : ' (' + Object.keys(entry.schema).join(', ') + ')'));
  const lost = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    for (const v of valuesOf(rule)) {
      const q = buildQuery({ [k]: v }, entry.schema), back = parseConfig(q, NOTCH_SCHEMA)[k];
      if (back !== v) lost.push(k + '=' + v + ' (the link "' + q + '" is read as ' + back + ')');
    }
  }
  say(lost.length === 0, 'a link for every value the builder offers reads back through the page\'s schema as that value' + (lost.length ? ': ' + lost.slice(0, 4).join(', ') : ''));
}
{
  const src = readFileSync(join(NOTCH, 'main.js'), 'utf8');
  const imports = /import\s*\{[^}]*\bNOTCH_SCHEMA\b[^}]*\}\s*from\s*['"]\.\/config\.js\?v=/.test(src);
  const parses = /parseConfig\(\s*location\.search\s*,\s*NOTCH_SCHEMA\s*\)/.test(src);
  say(imports && parses, 'main.js imports NOTCH_SCHEMA from ./config.js and hands it to parseConfig' + (imports ? '' : ' (it does not import it)') + (parses ? '' : ' (it parses something else)'));
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
    const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/notch/index.html' + (q ? q + '&' : '?'), ready: 'window.NOTCH && window.NOTCH.ready' }));
    await sleep(150);
    const played = await opened.page.evaluate(() => window.NOTCH.config());
    const wrong = Object.keys(values).filter(k => !played || String(played[k]) !== String(values[k]));
    say(!!played && wrong.length === 0, 'NOTCH plays what a link of ' + label + ' asked for (asked ' + JSON.stringify(values) + ', the page plays ' + JSON.stringify(played) + ')');
    /* the page deals when a door opens: a link with a mode shows its one door, one without shows FLASH's first */
    /* a named mode shows its one door; the other is hidden */
    const doors = await opened.page.evaluate(() => ['start', 'start-find'].filter(id => { const e = document.getElementById(id); return e && !e.hidden && e.getBoundingClientRect().width > 0; }));
    const wantDoor = values.mode === 'find' ? 'start-find' : 'start';
    await opened.page.evaluate(id => document.getElementById(id).click(), wantDoor);
    await sleep(150);
    const seed = NOTCH_SCHEMA.seed.default, r = rng(seed >>> 0);
    const wantStage = values.stage === 'two' ? 2 : 1;
    const got = await opened.page.evaluate(() => ({ mode: window.NOTCH.mode(), stage: window.NOTCH.stage(), task: window.NOTCH.task(), panel: window.NOTCH.panel() }));
    const firstOk = values.mode === 'find' ? JSON.stringify(got.panel) === JSON.stringify(dealFind(r, { stage: wantStage })) : JSON.stringify(got.task) === JSON.stringify(dealSession(r, { stage: wantStage, tier: 0 })[0]);
    say(doors.length === 1 && doors[0] === wantDoor && got.mode === values.mode && got.stage === wantStage && firstOk, label + ': one door, the page in that mode at that stage, and its first task the one Node deals at the seed (' + JSON.stringify({ doors, mode: got.mode, stage: got.stage, firstOk }) + ')');
    say(opened.errors.length === 0, label + ': nothing landed on the console' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
    await opened.browser.close();
  }
}
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CONFIG FAILURE(S)'); process.exit(1); }
console.log('CONFIG OK');
