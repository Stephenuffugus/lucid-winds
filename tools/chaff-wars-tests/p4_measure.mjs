// Pop N Lock Part 4: the first three rivals measured (PNL-053): 200 seeded matches a rival per player profile, the July
// reference player at three paces, Math.random seeded per match so the table reproduces. Reported in the plan's state
// block, never on a store page. node p4_measure.mjs [rounds] [outJson]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/', N = +(process.argv[2] || 200), OUTF = process.argv[3] || '/tmp/claude-1000/pnl/p4-measure.json';
const PROFILES = [['July yardstick (430 ms, 15% blunders)', 430, 0.15], ['casual (800 ms, 30% blunders)', 800, 0.30], ['beginner (1200 ms, 45% blunders)', 1200, 0.45]];
const PORT = 8840 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
const sleep = t => new Promise(r => setTimeout(r, t));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 3600000, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const rows = [];
try { await sleep(400); const p = await b.newPage(); await p.setViewport({ width: 412, height: 915 });
  await p.goto(`http://127.0.0.1:${PORT}/index.html?cwdev=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.CW_DEV && document.readyState === 'complete');
  for (const [name, cadence, pB] of PROFILES) for (const st of [0, 1, 2]) {
    const r = await p.evaluate((st, n, cadence, pB) => { const D = window.CW_DEV;
      const seeded = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
      let w = 0, l = 0, to = 0, ms = 0, ph = 0; for (let sd = 1; sd <= n; sd++) { const keep = Math.random; Math.random = seeded(sd * 7919 + st); let m; try { m = D.playMatch(st, sd, { cadence, pBlunder: pB, maxMs: 120000 }); } finally { Math.random = keep; }
        if (m.result === 'win') w++; else if (m.result === 'timeout') to++; else l++; ms += m.ms; ph += m.pMaxH; }
      return { id: D.roster()[st].id, fall: D.roster()[st].fall, wins: w, losses: l, timeouts: to, avgSec: +(ms / n / 1000).toFixed(1), avgPeak: +(ph / n).toFixed(1) }; }, st, N, cadence, pB);
    rows.push(Object.assign({ profile: name, stage: st + 1, n: N, winRate: +(r.wins / N).toFixed(3) }, r)); console.log(JSON.stringify(rows[rows.length - 1])); }
} finally { await b.close(); srv.kill(); }
fs.writeFileSync(OUTF, JSON.stringify(rows, null, 1)); console.log('wrote ' + OUTF);
