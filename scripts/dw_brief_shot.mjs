import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/deepwell/index.html', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1500));
// tap GO DOWN
await p.click('#btnDescendStart');
await new Promise(r => setTimeout(r, 500));
const brief = await p.evaluate(() => !!document.getElementById('dwBrief'));
await p.screenshot({ path: SP + 'dw-brief.png' });
await p.click('#dwBriefGo');
await new Promise(r => setTimeout(r, 1400));
const run = await p.evaluate(() => ({
  runVisible: !document.getElementById('runScreen').classList.contains('hide'),
  ascendLabel: document.querySelector('#btnAscend b').textContent,
  ascendSmall: document.querySelector('#btnAscend small').textContent
}));
console.log(JSON.stringify({ brief, run }));
// descend once and check the WINCH OUT label carries the banks amount
await p.click('#btnDescend');
await new Promise(r => setTimeout(r, 700));
const after = await p.evaluate(() => document.querySelector('#btnAscend small').textContent);
console.log('after descend:', after);
await p.screenshot({ path: SP + 'dw-run.png' });
if (!brief || !run.runVisible || run.ascendLabel !== 'WINCH OUT') { console.error('BRIEFING FLOW BROKEN'); process.exitCode = 1; }
await b.close();
console.log(process.exitCode ? 'FAILED' : 'DEEPWELL FLOW PASS');
