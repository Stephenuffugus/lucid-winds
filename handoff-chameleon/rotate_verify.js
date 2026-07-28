// Verify the orientation-gate fix on the REAL game through the REAL lobby.
//  A. trapped phone (never rotates) -> tap prompt -> gets into the game
//  B. normal phone -> rotate -> prompt clears (no regression)
//  C. after dismissing, rotating back to portrait must NOT re-trap
const puppeteer = require('puppeteer');
const URL = process.argv[2], OUT = process.argv[3];

const SNAP = `(function(){
  var r=document.getElementById('rotate'), t=document.getElementById('tapStart');
  var rc=r?getComputedStyle(r):null, tc=t?getComputedStyle(t):null;
  var hit=document.elementFromPoint(innerWidth/2,innerHeight/2);
  return { bodyClass:document.body.className,
    rotateShown: rc? rc.display!=='none':null,
    tapStartShown: tc? tc.display!=='none':null,
    topAtCentre: hit?(hit.id||hit.tagName+'.'+String(hit.className).slice(0,24)):null,
    innerW:innerWidth, innerH:innerHeight };
})()`;

const PHONE = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true, isLandscape: false };
const LAND = { width: 915, height: 412, deviceScaleFactor: 2, isMobile: true, hasTouch: true, isLandscape: true };
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151 Mobile Safari/537.36';

async function launchGame(b, errors) {
  const p = await b.newPage();
  p.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/colormap|404/i.test(m.text())) errors.push('CONSOLE: ' + m.text().slice(0, 140)); });
  await p.emulate({ name: 'ph', userAgent: UA, viewport: PHONE });
  await p.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));
  const box = await p.evaluate(() => {
    const el = [...document.querySelectorAll('button,div,span')]
      .filter(e => e.childElementCount === 0 && /^\s*Launch\s*$/i.test(e.textContent || ''))
      .map(e => { let n = e; while (n && n.getBoundingClientRect().height < 30) n = n.parentElement; return n || e; })[0];
    if (!el) return null; const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (!box) throw new Error('no Launch button');
  await p.touchscreen.tap(box.x, box.y);
  await new Promise(r => setTimeout(r, 6000));
  return p;
}

(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const errors = [], out = {};

  // ---- A: the trapped phone ----
  const pA = await launchGame(b, errors);
  out.A_afterLaunch = await pA.evaluate(SNAP);
  await pA.screenshot({ path: OUT + '/fix_A1_prompt.png' });
  await pA.touchscreen.tap(206, 600);            // tap the prompt; phone NEVER rotates
  await new Promise(r => setTimeout(r, 1200));
  out.A_afterTap = await pA.evaluate(SNAP);
  await pA.screenshot({ path: OUT + '/fix_A2_escaped.png' });
  // C: rotating back to portrait must not re-trap
  await pA.setViewport(LAND); await new Promise(r => setTimeout(r, 800));
  await pA.setViewport(PHONE); await new Promise(r => setTimeout(r, 1200));
  out.C_backToPortrait = await pA.evaluate(SNAP);
  await pA.close();

  // ---- B: the normal phone that CAN rotate ----
  const pB = await launchGame(b, errors);
  out.B_portrait = await pB.evaluate(SNAP);
  await pB.setViewport(LAND);
  await new Promise(r => setTimeout(r, 1800));
  out.B_landscape = await pB.evaluate(SNAP);
  await pB.screenshot({ path: OUT + '/fix_B_landscape.png' });
  await pB.close();

  console.log(JSON.stringify({ ...out, errors: errors.slice(0, 10) }, null, 2));
  const pass = {
    'A prompt appears in portrait': out.A_afterLaunch.rotateShown === true,
    'A tap escapes the prompt': out.A_afterTap.rotateShown === false,
    'A tap also clears tapStart (one tap, not two)': out.A_afterTap.tapStartShown === false,
    'C does not re-trap on rotating back': out.C_backToPortrait.rotateShown === false,
    'B normal rotate still clears it': out.B_portrait.rotateShown === true && out.B_landscape.rotateShown === false,
    'no JS errors': errors.length === 0
  };
  console.log('\n=== RESULTS ===');
  for (const k in pass) console.log((pass[k] ? 'PASS  ' : 'FAIL  ') + k);
  console.log(Object.values(pass).every(Boolean) ? '\nALL PASS' : '\nSOME FAILED');
  await b.close();
})().catch(e => { console.error('PROBE FAILED:', e.message); process.exit(1); });
