import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
await p.goto('http://127.0.0.1:8777/satellites/parallel/index.html', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1200));
const teachShown = await p.evaluate(() => document.getElementById('shTeach').className.includes('on'));
await p.screenshot({ path: SP + 'par-teach.png' });
await p.click('#teachGo');
await new Promise(r => setTimeout(r, 300));
// press RIGHT: expect mirror arrows over both avatars
await p.click('#kRight');
await new Promise(r => setTimeout(r, 200));
const arrows = await p.evaluate(() => document.querySelectorAll('.mvArrow').length);
await p.screenshot({ path: SP + 'par-arrows.png' });
// hint on-line: log R matches sol RRURUUUR prefix -> next R -> kRight glows
await p.click('#btnHint');
await new Promise(r => setTimeout(r, 150));
const h1 = await p.evaluate(() => document.getElementById('kRight').classList.contains('hint'));
// wander off: press LEFT (log RL diverges) then hint -> rewind + first-move glow
await new Promise(r => setTimeout(r, 1800));
await p.click('#kLeft'); await new Promise(r => setTimeout(r, 150));
await p.click('#btnHint'); await new Promise(r => setTimeout(r, 500));
const h2 = await p.evaluate(() => ({
  rewound: window.__PARALLEL__.G.log === '' || window.__PARALLEL__.G.st.moves === 0,
  glow: document.getElementById('kRight').classList.contains('hint')
}));
// teach persists: reload should NOT show the sheet
await p.goto('http://127.0.0.1:8777/satellites/parallel/index.html', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 900));
const again = await p.evaluate(() => document.getElementById('shTeach').className.includes('on'));
console.log(JSON.stringify({ teachShown, arrows, h1, h2, teachAgain: again }));
if (!teachShown || arrows !== 2 || !h1 || !h2.glow || again) { console.error('TEACH/HINT FLOW BROKEN'); process.exitCode = 1; }
await b.close();
console.log(process.exitCode ? 'FAILED' : 'TEACH + HINT PASS');
