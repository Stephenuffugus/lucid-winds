#!/usr/bin/env node
/* CLIMB's build time (QUESTIONS Q221) in a throttled Chrome, against the local test server only: the page's own
 * SB.pipeline.build on each record of a records file (a JSON list of { tag, kind, first, j }, the record's JSON form),
 * as RULES 0 (today's rules) and RULES 1 (the climb rules), REPS times interleaved, the minimum kept per record and
 * rules (load only adds time); then p50, p95 and max against TUNING.PIPELINE_BUDGET_MS, over all and per kind.
 *
 *   flock /home/codespace/sb-drafts/browser.lock node tools/shutterbug-tests/time-climb.mjs <records.json> [--rate 4] [--reps 3]
 */
import { serve, launch, newPage, gotoGame, ready } from '../../satellites/shutterbug/test/harness.mjs';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2), opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const records = JSON.parse(readFileSync(args[0], 'utf8')), RATE = Number(opt('rate', 4)), REPS = Number(opt('reps', 3));
const srv = await serve();
const browser = await launch();
try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base);
  await ready(page);
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  const res = await page.evaluate((records, REPS) => {
    const SB = window.SB, out = [];
    for (const r of records) {
      const best = [Infinity, Infinity], built = [null, null];
      for (let k = 0; k < REPS; k++) for (const rules of [0, 1]) {
        const rec = SB.record.fromJSON(Object.assign({}, r.j, { rules })), t = performance.now(), lv = SB.pipeline.build(rec, { firstRoom: !!r.first });
        const ms = performance.now() - t; if (ms < best[rules]) best[rules] = ms; built[rules] = lv.needsCrop ? 'refused' : lv.repair.wholeFallback ? 'fallback' : lv.climb ? 'climb' : 'today';
      }
      out.push({ tag: r.tag, kind: r.kind, ms0: best[0], ms1: best[1], b0: built[0], b1: built[1] });
    }
    return { out, budget: SB.TUNING.PIPELINE_BUDGET_MS };
  }, records, REPS);
  const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const line = (name, rows) => {
    const a0 = rows.map(r => r.ms0), a1 = rows.map(r => r.ms1);
    console.log(name.padEnd(9) + String(rows.length).padStart(4) + ' records  RULES 0 p50 ' + q(a0, 0.5).toFixed(1) + ' p95 ' + q(a0, 0.95).toFixed(1) + ' max ' + q(a0, 1).toFixed(1)
      + '  |  RULES 1 p50 ' + q(a1, 0.5).toFixed(1) + ' p95 ' + q(a1, 0.95).toFixed(1) + ' max ' + q(a1, 1).toFixed(1) + '  (ratio p50 ' + (q(a1, 0.5) / q(a0, 0.5)).toFixed(2) + ', p95 ' + (q(a1, 0.95) / q(a0, 0.95)).toFixed(2) + ')'
      + '  over ' + res.budget + ' ms: ' + rows.filter(r => r.ms0 > res.budget).length + ' and ' + rows.filter(r => r.ms1 > res.budget).length);
  };
  console.log('CPU throttled ' + RATE + 'x, min of ' + REPS + ' interleaved builds per record and rules, ms (PIPELINE_BUDGET_MS ' + res.budget + ')');
  line('all', res.out);
  for (const k of ['fixture', 'model', 'photo']) line(k, res.out.filter(r => r.kind === k));
  const slow = res.out.slice().sort((a, b) => b.ms1 - a.ms1).slice(0, 8);
  console.log('slowest by the climb rules: ' + slow.map(r => r.tag + ' ' + r.ms1.toFixed(0) + ' (' + r.b1 + ', today ' + r.ms0.toFixed(0) + ')').join('; '));
  console.log(errors.length ? 'PAGE ERRORS: ' + errors.join(' ; ') : 'zero page errors');
} finally { await browser.close(); await srv.close(); }
