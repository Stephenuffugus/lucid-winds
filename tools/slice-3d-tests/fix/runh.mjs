// node tools/slice-3d-tests/fix/runh.mjs [page]   row [24] alone (Part H), against satellites/slice-3d/<page> (default index.html)
// served from the repo root on 8777. The fail watch (fwrun_h.js) points it at a broken copy.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const page = process.argv[2] || 'index.html';
const URL = 'http://localhost:8777/satellites/slice-3d/' + page + '?dev=1';
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (d ? '  -> ' + String(d).slice(0, 600) : '')); } };
const { rowH } = await import('/workspaces/lucid-winds/satellites/slice-3d/audit-h.mjs');
await rowH({ puppeteer, LAUNCH, URL, ok });
console.log('\n=== row [24]: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
