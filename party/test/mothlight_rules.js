/* MOTHLIGHT RULES, from Astra's review (18 Oct 2026), tested against the LIVE host module in a real page:
   D01 the smaller group bonus: 150 in total when correct answers are fewer than half of everyone who answered and at
       least three answered; exactly half earns 100. Astra's fixtures: 1 of 3 and 2 of 5 earn 150; 2 of 4 and 1 of 1
       earn 100. Plus the edges: 0 correct earns nothing to score, 3 of 7 earns 150, 4 of 8 earns 100.
   D03 the three flagged facts are out of the live deck.
   D04 every deck is six true and six false, never repeats an id, and never puts two questions from one category
       next to each other unless every question left is from that category.
   Run: node party/test/mothlight_rules.js      (serves the repo itself on port 8241; practice transport, no network) */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((rq, rs) => { let p = rq.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { rs.writeHead(404); rs.end('nf'); return; }
    rs.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); rs.end(d); }); });
(async () => {
  await new Promise((r) => server.listen(8241, r));
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
  await p.goto('http://localhost:8241/party/host.html?game=mothlight', { waitUntil: 'networkidle2' });
  await p.waitForFunction(() => window.__mothlight && window.__mothlight.score, { timeout: 15000 });
  // D01
  const cases = [[1, 3, 150], [2, 5, 150], [2, 4, 100], [1, 1, 100], [3, 7, 150], [4, 8, 100], [1, 2, 100], [3, 3, 100]];
  for (const [c, n, want] of cases) {
    const got = await p.evaluate((c, n) => window.__mothlight.score(c, n), c, n);
    ok(got === want, `D01: ${c} correct of ${n} answered earns ${want} (got ${got})`);
  }
  // D03
  const q = await p.evaluate(() => window.__mothlight.quarantined());
  ok(q.length === 0, 'D03: ml-0163, ml-0001 and ml-0055 are not in the live deck pool (' + JSON.stringify(q) + ')');
  // D04, two hundred draws
  let bad6 = 0, dup = 0, flagged = 0, adj = 0, tail = 0, decks = 0;
  for (let i = 0; i < 200; i++) {
    const d = await p.evaluate(() => { localStorage.removeItem('ml_used'); return window.__mothlight.draw(); });
    decks++;
    const t = d.filter((x) => x.answer).length;
    if (d.length !== 12 || t !== 6) bad6++;
    if (new Set(d.map((x) => x.id)).size !== d.length) dup++;
    if (d.some((x) => ['ml-0163', 'ml-0001', 'ml-0055'].includes(x.id))) flagged++;
    for (let k = 1; k < d.length; k++) if (d[k].category === d[k - 1].category) {
      const rest = d.slice(k - 1).map((x) => x.category);
      if (rest.every((c) => c === rest[0])) tail++; else adj++;
    }
  }
  ok(bad6 === 0, `D04: all ${decks} decks are 12 questions, six true and six false`);
  ok(dup === 0, 'D04: no deck repeats a question');
  ok(flagged === 0, 'D03: no deck ever drew a flagged fact');
  ok(adj === 0, `D04: no two neighbours share a category while another category was left (${tail} forced at a deck's tail)`);
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); server.close();
  console.log(fails.length ? 'MOTHLIGHT_RULES_FAIL ' + fails.length : 'MOTHLIGHT_RULES_PASS');
  process.exit(fails.length ? 1 : 0);
})();
