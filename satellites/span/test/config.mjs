#!/usr/bin/env node
/* SPAN's teacher's links (plans/span/HANDOFF-SPAN.md P3 step 2). The builder at satellites/math/config registers the
 * game and its screener with the SAME schemas the two pages parse (satellites/span/config.js), so a link made there
 * asks only for what the page will play.
 *
 *   node test/config.mjs          (in the foreground, under the gate lock: its last part opens the pages)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the builder has an entry for the game and one for the screener, each going to its own folder
 *   2. every key the builder offers, the page parses with the same type, the same values or bounds, and the same
 *      default (⛔ the draft gave count a default of 10 and the page 20, and buildQuery leaves a default out, so a
 *      teacher's link for 10 played 20)
 *   3. a link for every value the builder can offer (each enum value; an int's bounds, middle and default) reads back
 *      through the page's schema as exactly that value
 *   4. main.js and screen/screen.js import their schema from config.js and hand that to parseConfig
 *   5. in a browser: a link of the builder's defaults and a link of other values play, on the game, the mode and the
 *      number of items the link asked for, and on the screener its minutes
 */
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { serve, open, reporter, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { parseConfig, buildQuery } from '../../math/core/pure.js';
import { GAMES } from '../../math/config/schemas.js';
import { SPAN_SCHEMA, SCREEN_SCHEMA } from '../config.js';

const SPAN = join(MATH, '..', 'span');
const { fails, say } = reporter();
const PAIRS = [
  { id: 'span', page: SPAN_SCHEMA, path: '../span/', name: 'the game', url: '/span/index.html', ready: 'window.SPAN && window.SPAN.ready', read: 'window.SPAN.config ? window.SPAN.config() : null' },
  { id: 'spanScreen', page: SCREEN_SCHEMA, path: '../span/screen/', name: 'the screener', url: '/span/screen/index.html', ready: 'window.SCREEN && window.SCREEN.ready', read: 'window.SCREEN.config ? window.SCREEN.config() : null' }
];
const valuesOf = rule => rule.type === 'enum' ? rule.values : rule.type === 'bool' ? [true, false]
  : Array.from(new Set([rule.min, Math.round((rule.min + rule.max) / 2), rule.max, rule.default]));

for (const p of PAIRS) {
  const entry = GAMES[p.id];
  say(!!entry && entry.path === p.path, 'the builder has an entry for ' + p.name + ' going to ' + p.path + (entry ? ' (' + entry.path + ')' : ' (none)'));
  if (!entry) continue;
  const differ = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    const mine = p.page[k];
    if (!mine) { differ.push(k + ' is not parsed by the page'); continue; }
    if (mine.type !== rule.type) differ.push(k + ' is ' + rule.type + ' in the builder and ' + mine.type + ' on the page');
    else if (rule.type === 'enum' && JSON.stringify([...rule.values].sort()) !== JSON.stringify([...mine.values].sort())) differ.push(k + ' offers ' + rule.values.join('/') + ', the page takes ' + mine.values.join('/'));
    else if (rule.type === 'int' && (rule.min !== mine.min || rule.max !== mine.max)) differ.push(k + ' runs ' + rule.min + ' to ' + rule.max + ' in the builder, ' + mine.min + ' to ' + mine.max + ' on the page');
    if (rule.default !== mine.default) differ.push(k + ' defaults to ' + rule.default + ' in the builder and ' + mine.default + ' on the page');
  }
  say(differ.length === 0, 'every key the builder offers for ' + p.name + ', the page parses with the same type, values or bounds, and default'
    + (differ.length ? ': ' + differ.join('; ') : ' (' + Object.keys(entry.schema).join(', ') + ')'));
  const lost = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    for (const v of valuesOf(rule)) {
      const q = buildQuery({ [k]: v }, entry.schema), back = parseConfig(q, p.page)[k];
      if (back !== v) lost.push(k + '=' + v + ' (the link "' + q + '" is read as ' + back + ')');
    }
  }
  say(lost.length === 0, 'a link for every value the builder offers ' + p.name + ' reads back through the page\'s schema as that value'
    + (lost.length ? ': ' + lost.slice(0, 4).join(', ') : ''));
}

for (const [file, schema, from] of [['main.js', 'SPAN_SCHEMA', './config.js'], ['screen/screen.js', 'SCREEN_SCHEMA', '../config.js']]) {
  const src = readFileSync(join(SPAN, file), 'utf8');
  const esc = from.replace(/[.]/g, '\\.');
  const imports = new RegExp('import\\s*\\{[^}]*\\b' + schema + '\\b[^}]*\\}\\s*from\\s*[\'"]' + esc + '\\?v=').test(src);
  const parses = new RegExp('parseConfig\\(\\s*location\\.search\\s*,\\s*' + schema + '\\s*\\)').test(src);
  say(imports && parses, file + ' imports ' + schema + ' from ' + from + ' and hands it to parseConfig' + (imports ? '' : ' (it does not import it)') + (parses ? '' : ' (it parses something else)'));
}

/* what the pages play for a builder's link */
const s = await serve(join(MATH, '..'));
for (const p of PAIRS) {
  const entry = GAMES[p.id];
  if (!entry) continue;
  const defaults = {}, others = {};
  for (const [k, rule] of Object.entries(entry.schema)) {
    defaults[k] = rule.default;
    others[k] = rule.type === 'enum' ? rule.values.find(v => v !== rule.default) : rule.type === 'bool' ? !rule.default : (rule.default === rule.min ? rule.max : rule.min);
  }
  for (const [label, values] of [['the builder\'s defaults', defaults], ['other values', others]]) {
    const q = buildQuery(values, entry.schema);
    const opened = await open(s.base, Object.assign({}, SIZES[1], { path: p.url + (q ? q + '&' : '?'), ready: p.ready }));
    await sleep(150);
    const played = await opened.page.evaluate(p.read);
    const wrong = Object.keys(values).filter(k => !played || String(played[k]) !== String(values[k]));
    say(!!played && wrong.length === 0, p.name + ' plays what a link of ' + label + ' asked for (asked ' + JSON.stringify(values) + ', the page plays ' + JSON.stringify(played) + ')');
    say(opened.errors.length === 0, p.name + ', ' + label + ': nothing landed on the console' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
    await opened.browser.close();
  }
}
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CONFIG FAILURE(S)'); process.exit(1); }
console.log('CONFIG OK');
