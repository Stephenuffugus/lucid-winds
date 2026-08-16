/* SKYSHOT — real browser assertions.
 *   node satellites/skyshot/test/play.mjs
 *
 * The important one is the SOLVER. index.html has shipped a headless solver
 * since day one and nothing has ever run it, so "all 24 plots are winnable"
 * was an unverified claim. This runs it, over the campaign and over generated
 * dailies, and fails if any bud is unreachable.
 *
 * Also proves: a level actually clears end to end, a malformed save no longer
 * freezes the game on a won level, and the feedback fab covers no control on
 * any screen.
 *
 * Watched RED first: against the pre-audit file the poisoned save case reported
 * "screen s-play after a win" with a TypeError from announce(); and a plot with
 * a deliberately unreachable bud makes the solver section go red.
 * One browser at a time, on purpose.
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const require = createRequire(join(ROOT, 'x.js'));
const puppeteer = require('puppeteer');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  try {
    const buf = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': MIME[p.slice(p.lastIndexOf('.'))] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('nope'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port;

let fails = 0;
const ok = (n, c, x) => { if (c) console.log('  ok   ' + n); else { fails++; console.log('  FAIL ' + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); } };
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function open(pre) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message)));
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
  if (pre) await page.evaluateOnNewDocument(pre);
  await page.goto(BASE + '/satellites/skyshot/?swtest=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction('!!window.SKY', { timeout: 8000 }).catch(() => {});
  return { ctx, page, errs };
}

console.log('every plot is winnable (the shipped solver, finally run)');
{
  const { ctx, page, errs } = await open();
  const camp = await page.evaluate(() => SKY.solveAll());
  const bad = camp.filter(r => !r.ok);
  ok('the solver ran over all ' + camp.length + ' plots', camp.length === 24, camp.length);
  ok('no plot has an unreachable bud', bad.length === 0,
    bad.map(b => 'plot ' + b.i + ' ' + b.n + ' missing ' + JSON.stringify(b.missing)));
  ok('every plot has enough seeds for its buds', camp.every(r => r.ammo >= r.pods),
    camp.filter(r => r.ammo < r.pods).map(r => r.i));

  /* the solver must be able to say no, or this section proves nothing */
  const canFail = await page.evaluate(() => {
    /* a bud parked outside the sling's reach: MAXSPD gives about 771px of rise
       from y=848, so y=60 with a wall under it is not reachable */
    const impossible = { n: 'unreachable', par: 1, hint: '',
      pods: [{ x: 270, y: 62 }],
      obs: [{ t: 'wall', x1: 0, y1: 300, x2: 540, y2: 300 }] };
    return SKY.solve(impossible);
  });
  ok('self test: the solver reports an unreachable bud as unreachable', canFail.ok === false, canFail);

  const dailies = await page.evaluate(() => SKY.solveDailies(40));
  ok('40 generated dailies are all winnable', dailies.every(d => d.ok),
    dailies.filter(d => !d.ok).map(d => d.key));
  ok('no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* plot 1 is a static bud straight overhead: full power straight up clears it */
const CLEAR_PLOT_1 = async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  SKY.start('campaign', 0);
  await wait(120);
  for (let s = 0; s < 4; s++) {
    if (!SKY.state() || SKY.state().phase !== 'play') break;
    SKY.fire(0, 1);
    SKY.settle(8);
    await wait(1500);
    if (SKY.screen() === 's-go') break;
  }
  return { screen: SKY.screen(), title: document.getElementById('go-title').textContent,
           stars: document.getElementById('go-stars').textContent,
           starsSaved: JSON.stringify(SKY.prog().stars),
           progIsObject: SKY.prog().stars && typeof SKY.prog().stars === 'object' };
};

console.log('a level clears and the result screen appears');
{
  const { ctx, page, errs } = await open();
  const r = await page.evaluate(CLEAR_PLOT_1);
  ok('the result screen is up', r.screen === 's-go', r);
  ok('it says the level was cleared', r.title === 'Cleared', r.title);
  ok('three stars for a one seed clear at par 1', r.stars === '★★★', r.stars);
  ok('the star was written to storage', /"0":3/.test(r.starsSaved), r.starsSaved);
  ok('no page errors', errs.length === 0, errs);
  await ctx.close();
}

console.log('malformed saves no longer freeze a won level');
const POISONS = {
  'stars is a string':  `{"stars":"x","moments":1,"daily":true,"pollen":5}`,
  'prog is a number':   `7`,
  'prog is an array':   `[1,2,3]`,
  'prog is a string':   `"nope"`,
  'moments is a string':`{"moments":"abc"}`,
  'daily is an array':  `{"daily":[]}`,
  'pollen is a word':   `{"pollen":"lots"}`,
  'stars holds words':  `{"stars":{"0":"gold","1":null}}`
};
for (const [name, raw] of Object.entries(POISONS)) {
  const { ctx, page, errs } = await open(`(()=>{try{localStorage.setItem('skyshot_prog',${JSON.stringify(raw)});}catch(e){}})()`);
  const r = await page.evaluate(CLEAR_PLOT_1);
  ok(name + ': the result screen still appears', r.screen === 's-go', r);
  ok(name + ': progress is a usable object', r.progIsObject === true, r);
  ok(name + ': no page error', errs.length === 0, errs.slice(0, 2));
  await ctx.close();
}

console.log('two tabs do not clobber each other');
{
  const { ctx, page } = await open();
  const r = await page.evaluate(() => {
    /* simulate the other tab writing while this one holds a boot snapshot */
    const mine = SKY.prog();
    mine.stars['3'] = 2;
    localStorage.setItem('skyshot_prog', JSON.stringify({ stars: { 9: 3, 10: 1 }, pollen: 500, moments: { 'x:1': 1 }, daily: {}, plays: 3, best: {} }));
    SKY.start('campaign', 0);   /* any save path re-merges */
    const after = JSON.parse(localStorage.getItem('skyshot_prog'));
    return { keptOther: after.stars['9'] === 3 && after.stars['10'] === 1,
             keptMine: after.stars['3'] === 2, pollen: after.pollen, stars: after.stars };
  });
  ok('the other tab\'s plots survive', r.keptOther === true, r.stars);
  ok('this tab\'s plot survives', r.keptMine === true, r.stars);
  ok('pollen takes the larger total', r.pollen >= 500, r.pollen);
  await ctx.close();
}

console.log('the loss screen names the thing in the way');
{
  const { ctx, page } = await open();
  const r = await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    SKY.start('campaign', 8);       /* plot 9, the turnstile */
    await wait(120);
    for (let s = 0; s < 6; s++) {
      if (!SKY.state() || SKY.state().phase !== 'play') break;
      SKY.fire(-1.3, 0.05);          /* deliberately hopeless: hard left, no power */
      SKY.settle(8);
      await wait(900);
      if (SKY.screen() === 's-go') break;
    }
    return { screen: SKY.screen(), title: document.getElementById('go-title').textContent,
             note: document.getElementById('go-score').textContent };
  });
  ok('running out of seeds ends the level', r.screen === 's-go' && r.title === 'Out of seeds', r);
  ok('the loss screen says something useful', (r.note || '').length > 20, r.note);
  ok('it names the bramble, which is what plot 9 is', /bramble/i.test(r.note || ''), r.note);
  await ctx.close();
}

console.log('nothing sits on a control, on every screen');
{
  const { ctx, page, errs } = await open();
  await new Promise(r => setTimeout(r, 2200));
  for (const id of ['s-title', 's-how', 's-levels', 's-set', 's-pause', 's-go']) {
    const cov = await page.evaluate(screen => {
      if (screen === 's-levels') { /* the grid must exist before it can be measured */ }
      SKY.show(screen);
      const f = document.querySelector('.lwfb-fab');
      if (!f) return ['no fab'];
      const fr = f.getBoundingClientRect(), out = [];
      document.querySelectorAll('button, .settingline, .lvlcard').forEach(el => {
        if (el.closest('.lwfb-fab')) return;
        const q = el.getBoundingClientRect();
        if (!q.width || !q.height) return;
        if (q.right > fr.left && q.left < fr.right && q.bottom > fr.top && q.top < fr.bottom)
          out.push(el.id || el.className);
      });
      return out;
    }, id);
    ok('fab covers no control on ' + id, cov.length === 0, cov);
  }
  const r = await page.evaluate(() => {
    SKY.show('s-title');
    const b = document.getElementById('b-exit').getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return { h: b.height, hit: hit ? hit.id : null, sws: typeof window.SWS_EXIT };
  });
  ok('SWS_EXIT is defined', r.sws === 'function');
  ok('the exit is 48 rendered px or more', r.h >= 48, r.h);
  ok('a tap at the exit centre reaches the exit', r.hit === 'b-exit', r.hit);
  ok('no page errors', errs.length === 0, errs);
  await ctx.close();
}

await browser.close();
server.close();
console.log(fails ? '\n' + fails + ' FAILED' : '\nall browser checks passed');
process.exit(fails ? 1 : 0);
