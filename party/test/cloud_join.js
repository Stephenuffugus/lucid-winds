/* Real room across two separate browsers (no shared BroadcastChannel), through the LIVE party database.
   18 Oct 2026: phones could not join ("No room answered"). Run: node party/test/cloud_join.js [base] [shotdir]
   Default base is the local server on 8765; the room is real (?cloud=1) and the host removes it at the end. */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const SHOTS = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
  const seed = async (ctx) => { const p = await ctx.newPage(); await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} }); return p; };
  const hc = await b.createBrowserContext(); const host = await seed(hc);
  const herr = []; host.on('pageerror', (e) => herr.push(e.message.slice(0, 140)));
  await host.setViewport({ width: 1280, height: 800 });
  await host.goto(BASE + '/party/host.html?game=mothlight&cloud=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2500);
  const lobby = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(), join: document.getElementById('ps-join-url').textContent, qr: !document.getElementById('ps-qr').hidden && !!document.querySelector('#ps-qr svg'), err: (document.getElementById('ps-tx-err') || {}).textContent || '' }));
  console.log('host lobby', JSON.stringify(lobby));
  ok(/^[A-Z0-9]{4}$/.test(lobby.code), 'host made a room code');
  ok(lobby.qr, 'host shows the join square');
  ok(/\/join$/.test(lobby.join), 'host shows the short join address');
  ok(!lobby.err, 'host room connected (no transport error)');
  if (SHOTS) await host.screenshot({ path: SHOTS + '/party-host-lobby.png' });
  const names = ['Penny', 'Jessie', 'Stephen'];
  const phones = [];
  for (const n of names) {
    const ctx = await b.createBrowserContext(); const p = await seed(ctx);
    await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await p.goto(BASE + '/party/play.html?cloud=1&r=' + lobby.code, { waitUntil: 'networkidle2', timeout: 90000 });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await p.click('#pj-go');
    phones.push(p);
  }
  await sleep(6000);
  for (let i = 0; i < phones.length; i++) {
    const s = await phones[i].evaluate(() => ({ joinOpen: document.getElementById('ps-join').classList.contains('on'), err: document.getElementById('pj-err').textContent }));
    ok(!s.joinOpen && !s.err, `${names[i]} joined from a separate browser (join screen closed=${!s.joinOpen}, err="${s.err}")`);
  }
  if (SHOTS) await phones[0].screenshot({ path: SHOTS + '/party-phone-joined.png' });
  const roster = await host.evaluate(() => document.getElementById('ps-roster').textContent);
  ok(names.every((n) => roster.indexOf(n) >= 0), 'host roster lists all three: ' + roster.replace(/\s+/g, ' ').slice(0, 120));
  const start = await host.evaluate(() => !document.getElementById('ps-start').disabled);
  ok(start, 'Start is enabled with three players');
  ok(herr.length === 0, 'no host page errors ' + JSON.stringify(herr));
  // tidy: remove the room so the database keeps nothing
  await host.evaluate(async (code) => { try { await firebase.app('party').database().ref('party/' + code).remove(); } catch (e) {} }, lobby.code);
  await b.close();
  console.log(fails.length ? 'CLOUD_JOIN_FAIL' : 'CLOUD_JOIN_PASS');
  process.exit(fails.length ? 1 : 0);
})();
