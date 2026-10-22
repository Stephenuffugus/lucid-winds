const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
  const seed = async (ctx) => { const p = await ctx.newPage(); await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} }); return p; };
  const hc = await b.createBrowserContext(); const host = await seed(hc);
  const herr = []; host.on('pageerror', (e) => herr.push(e.message.slice(0, 140)));
  await host.setViewport({ width: 1280, height: 800 });   // a laptop or TV sized host, the case Penny hit
  await host.goto(BASE + '/party/host.html?game=mothlight&cloud=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2500);
  const lobby = await host.evaluate(() => ({ code: document.getElementById('ps-code').textContent.trim(), rowHidden: document.getElementById('ps-seatrow').hidden, btn: document.getElementById('ps-seat-go').textContent }));
  console.log('host lobby', JSON.stringify(lobby));
  ok(/^[A-Z0-9]{4}$/.test(lobby.code), 'room code');
  ok(!lobby.rowHidden, 'seat row is visible on a big screen host');
  const phones = [];
  for (const n of ['Stephen', 'Jessie']) {
    const ctx = await b.createBrowserContext(); const p = await seed(ctx);
    await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await p.goto(BASE + '/party/play.html?cloud=1&r=' + lobby.code, { waitUntil: 'networkidle2', timeout: 90000 });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await p.click('#pj-go'); phones.push(p);
  }
  await sleep(6000);
  let st = await host.evaluate(() => ({ dis: document.getElementById('ps-start').disabled, count: document.getElementById('ps-count').textContent }));
  console.log('before seat', JSON.stringify(st));
  ok(st.dis && /You count too/.test(st.count), 'two phones: Start waits and the count line tells the host she counts');
  await host.type('#ps-seat-name', 'Penny');
  await host.click('#ps-seat-go');
  await sleep(7000);
  st = await host.evaluate(() => ({ dis: document.getElementById('ps-start').disabled, btn: document.getElementById('ps-start').textContent, roster: document.getElementById('ps-roster').textContent.replace(/\s+/g, ' '), frame: !!document.getElementById('ps-seat-frame'), mode: document.getElementById('ps-mode-phones').classList.contains('on') }));
  console.log('after seat', JSON.stringify(st));
  ok(/Penny \(you\)/.test(st.roster), 'host seated as Penny (you)');
  ok(!st.dis && /Start with 3/.test(st.btn), 'Start is enabled with the host as the third player');
  ok(st.frame && st.mode, 'seat frame present and the room switched to phones only');
  await host.screenshot({ path: '/tmp/fo-lead/host-seated.png' });
  await host.click('#ps-start'); await sleep(5000);
  const playing = await host.evaluate(() => ({ cls: document.body.className, phase: (window.PartyShell && window.PartyShell.phase) || '' }));
  const ph = await phones[0].evaluate(() => ({ join: document.getElementById('ps-join').classList.contains('on'), txt: document.body.innerText.slice(0, 80).replace(/\s+/g, ' ') }));
  console.log('started', JSON.stringify(playing), JSON.stringify(ph));
  ok(/notv-playing/.test(playing.cls), 'the host device plays after Start');
  ok(herr.length === 0, 'no host page errors ' + JSON.stringify(herr));
  await host.screenshot({ path: '/tmp/fo-lead/host-playing.png' });
  await host.evaluate(async (code) => { try { await firebase.app('party').database().ref('party/' + code).remove(); } catch (e) {} }, lobby.code);
  await b.close(); console.log(fails.length ? 'SEAT_FAIL' : 'SEAT_PASS');
})();
