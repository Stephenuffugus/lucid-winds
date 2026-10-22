/* 23 Oct 2026 (Stephen): picks hidden until the reveal; first right answer +50, second +25.
   Real room through the live party database: host + three phones, ?ml_fast=1. Run: node party/test/mothlight_hidden.js [base] */
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const fails = []; const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
  const seed = async (ctx) => { const p = await ctx.newPage(); await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} }); return p; };
  const host = await seed(await b.createBrowserContext());
  const herr = []; host.on('pageerror', (e) => herr.push(e.message.slice(0, 140)));
  await host.setViewport({ width: 1280, height: 800 });
  await host.goto(BASE + '/party/host.html?game=mothlight&cloud=1&ml_fast=1', { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2500);
  const code = await host.evaluate(() => document.getElementById('ps-code').textContent.trim());
  const phones = [];
  for (const n of ['Penny', 'Jessie', 'Stephen']) {
    const p = await seed(await b.createBrowserContext());
    await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await p.goto(BASE + '/party/play.html?cloud=1&r=' + code, { waitUntil: 'networkidle2', timeout: 90000 });
    await p.evaluate((n) => { document.getElementById('pj-name').value = n; }, n);
    await p.click('#pj-go'); phones.push(p);
  }
  await sleep(6000);
  await host.click('#ps-start'); await sleep(2500);
  // rules copy
  const rules = await host.evaluate(() => document.querySelector('.ml-rules').textContent);
  ok(/Nobody sees your side until the reveal/.test(rules) && /first right answer earns 50/.test(rules), 'rules say sides are hidden and the first right answer earns 50');
  ok(!/Everyone can see where your moth lands/.test(await phones[0].evaluate(() => document.getElementById('mlp-rules').textContent)), 'phone rules no longer say everyone can see your moth');
  const ans = await host.evaluate(() => window.__mothlight.deck()[0].answer);
  const right = ans ? '#mlp-true' : '#mlp-false', wrong = ans ? '#mlp-false' : '#mlp-true';
  await host.click('#ml-next'); await sleep(700);           // ml_fast: the question clock is 3s, so measure inside it
  await phones[0].click(right); await sleep(250);          // Penny first, right
  await phones[1].click(wrong); await sleep(250);          // Jessie wrong first ...
  await phones[2].click(right); await sleep(250);          // Stephen second right
  await phones[1].click(right); await sleep(450);          // ... then changes to right: third
  const hq = await host.evaluate(() => ({ perch: document.getElementById('ml-ml').children.length, lab: document.getElementById('ml-perch-lab').textContent, t: document.getElementById('ml-mt').children.length, f: document.getElementById('ml-mf').children.length }));
  console.log('host during question', JSON.stringify(hq));
  ok(hq.perch === 3 && hq.t === 0 && hq.f === 0 && /3 of 3 answered/.test(hq.lab), 'host screen: three moths on the perch, none on a side, "3 of 3 answered"');
  const pq = await phones[2].evaluate(() => ({ cl: document.getElementById('mlp-cl').children.length, ct: document.getElementById('mlp-ct').children.length, cf: document.getElementById('mlp-cf').children.length, saved: document.getElementById('mlp-saved').textContent }));
  console.log('phone during question', JSON.stringify(pq));
  ok(pq.cl === 3 && pq.ct === 0 && pq.cf === 0, 'phone: three chips on the perch, none on True or False');
  ok(/Saved on/.test(pq.saved) && !/change sides/.test(pq.saved), 'phone: "Saved on" without "You can change sides"');
  await host.screenshot({ path: '/tmp/fo-lead/ml-question.png' });
  await host.waitForFunction(() => document.getElementById('ml-src').style.visibility === 'visible', { timeout: 15000 });
  await sleep(600);
  const hr = await host.evaluate(() => ({ t: document.getElementById('ml-mt').children.length, f: document.getElementById('ml-mf').children.length, perchOff: document.getElementById('ml-perch').classList.contains('off'), src: document.getElementById('ml-src').textContent, pts: Array.from(document.querySelectorAll('.ml-moth')).map((m) => m.textContent.replace(/\s+/g, ' ')) }));
  console.log('host reveal', JSON.stringify(hr));
  ok(hr.t + hr.f === 3 && hr.perchOff, 'reveal: moths moved to the lanterns and the perch is gone');
  ok(/First right: Penny \+50/.test(hr.src), 'reveal names Penny as first right (+50)');
  const scores = await host.evaluate(() => { const r = {}; Array.from(document.querySelectorAll('.ml-strip span')).forEach((s) => { const m = s.textContent.match(/(\w+)\s+(\d+)/); if (m) r[m[1]] = +m[2]; }); return r; });
  console.log('scores', JSON.stringify(scores));
  ok(scores.Penny === 150 && scores.Stephen === 125 && scores.Jessie === 100, 'Penny 100+50, Stephen 100+25, Jessie 100 (changed her mind, back of the line)');
  const pr = await phones[0].evaluate(() => document.getElementById('mlp-rt2').textContent);
  ok(/\+150\. First right answer: \+50\./.test(pr), 'Penny\'s phone: "+150. First right answer: +50." (' + pr + ')');
  await host.screenshot({ path: '/tmp/fo-lead/ml-reveal.png' });
  ok(herr.length === 0, 'no host page errors ' + JSON.stringify(herr));
  await host.evaluate(async (code) => { try { await firebase.app('party').database().ref('party/' + code).remove(); } catch (e) {} }, code);
  await b.close(); console.log(fails.length ? 'HIDDEN_FAIL' : 'HIDDEN_PASS');
})();
