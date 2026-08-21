import puppeteer from 'puppeteer';
const SP = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/';
for (const [w, h, tag] of [[412, 915, 'big'], [375, 667, 'small']]) {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dir_pollen', '1'); localStorage.setItem('lw_pn_rules_seen','1'); } catch (e) {} });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => { console.error('pageerror: ' + e.message); process.exitCode = 1; });
  await p.goto('http://127.0.0.1:8777/play/pollen.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2500));
  await p.evaluate(() => { const b2 = document.getElementById('shell-dir-play'); if (b2) b2.click(); });
  await new Promise(r => setTimeout(r, 600));
  await p.evaluate(() => { if (window._PNstartFromSetup) window._PNstartFromSetup(); });
  await new Promise(r => setTimeout(r, 800));
  const facts = await p.evaluate(() => {
    const dock = document.getElementById('pnDock');
    const dr = dock ? dock.getBoundingClientRect() : null;
    const rows = document.querySelectorAll('.pn-card').length;
    // count distinct tier rows visible in viewport
    const cards = [...document.querySelectorAll('.pn-card')];
    const tiersVisible = new Set(cards.filter(c => { const r = c.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })
      .map(c => c.style.borderLeftColor)).size;
    return { dockVisible: !!dr && Math.abs(dr.bottom - innerHeight) < 2, cards: rows, tiersVisible };
  });
  console.log(tag, JSON.stringify(facts));
  if (!facts.dockVisible) { console.error('DOCK NOT PINNED at ' + tag); process.exitCode = 1; }
  await p.screenshot({ path: SP + 'pollen-' + tag + '.png' });
  await b.close();
}
console.log(process.exitCode ? 'FAILED' : 'POLLEN LAYOUT PASS');
