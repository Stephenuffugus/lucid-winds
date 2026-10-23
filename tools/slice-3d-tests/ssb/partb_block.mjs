/* ==== Part B (2026-10-23): core repair. Each row below was watched FAIL on v6.1 (or on a copy with the fix removed)
   before it was trusted. ==== */
async function bootAt(w, h) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p, errs };
}
async function clickCentre(p, sel) {   // a real pointer at the control's centre (never el.click(): that proves nothing)
  const c = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel);
  await p.mouse.click(c.x, c.y);
}

/* ---- 8. SS29: the fleet song card is a fixed bottom sheet about 230 px tall. With exactly that injected, at the three
   phone widths, the centre of every mode card, the Forge and How must still be the control itself. v6.1 put the cards
   at about 70 percent of the stage, under the sheet at 360 wide. */
console.log('\n[8] Part B: the song card never covers a mode, the Forge or How');
for (const [w, h] of [[360, 640], [375, 667], [412, 915]]) {
  const { ctx, p } = await bootAt(w, h);
  const r = await p.evaluate(() => {
    const sheet = document.createElement('div');
    sheet.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:230px;z-index:2147482000;background:#123';
    document.body.appendChild(sheet);
    const out = [];
    ['b-play', 'b-ff', 'b-endless', 'b-climb', 'b-forge', 'b-how'].forEach(id => {
      const el = document.getElementById(id), b = el.getBoundingClientRect();
      const t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
      if (!(t === el || (t && el.contains(t)))) out.push(id + ' covered by ' + (t ? (t.id || t.className || t.tagName) : 'nothing'));
    });
    return out;
  });
  ok('at ' + w + 'x' + h + ' a 230 px bottom sheet covers no mode card, Forge or How', r.length === 0, r.join(', '));
  await ctx.close();
}

/* ---- 9. SS31: the world steps at a fixed 1/120 s, so the same taps at the same moments land the knife in the same place
   at 60 and at 120 frames a second. Each mode is replayed twice from one seed; taps are timed from the first frame. The
   plan asked for "within 1 unit"; v6.1's variable step already managed that over 3 s (watched), so the row demands what
   a fixed stepper actually gives: the same place, to 0.01. */
console.log('\n[9] Part B: the same taps land the same at 60 and 120 frames a second');
{
  const { ctx, p } = await boot();
  const r = await p.evaluate(() => {
    const S = window._S3;
    function run(mode, hz, secs, taps) {
      if (S.salt) S.salt(424242);
      if (mode === 'journey') S.newGame(1); else if (mode === 'ff') S.newFF(1); else if (mode === 'climb') S.newClimb(1); else S.newEndless();
      const dt = 1000 / hz, n = Math.round(secs * hz) + 1; let ti = 0;
      for (let i = 0; i < n; i++) {
        if (i >= 1) { const t = (i - 1) / hz;
          while (ti < taps.length && taps[ti][0] <= t + 1e-9) { const tp = taps[ti++];
            if (mode === 'ff' || mode === 'endless') S.hold(tp[1]); else S.tap(1); } }
        S.stepN(1, dt);
      }
      const g = S.state(); return { x: +g.x.toFixed(3), y: +g.y.toFixed(3), done: !!g.done };
    }
    const T = { journey: [[0.2], [0.9], [1.6], [2.3]], climb: [[0.2], [0.8], [1.4]],
      ff: [[0.3, 1], [0.8, 0], [1.4, -1], [1.9, 0]], endless: [[0.3, -1], [0.7, 0], [1.2, 1], [1.6, 0]] };
    const out = {};
    for (const m of ['journey', 'climb', 'ff', 'endless']) {
      const a = run(m, 60, 3, T[m]), b = run(m, 120, 3, T[m]);
      out[m] = { a, b, d: +Math.hypot(a.x - b.x, a.y - b.y).toFixed(3) };
    }
    if (S.salt) S.salt(null);
    return out;
  });
  for (const m of ['journey', 'climb', 'ff', 'endless'])
    ok(m + ': 60 and 120 Hz land in the same place', r[m].d <= 0.01, JSON.stringify(r[m]));
  await ctx.close();
}

/* ---- 10. SS21: Endless has no floor. 3000 steps (25 s) of a straight dive never end it, it crosses a world band, and
   the shaft stays a ring of at most four live chunks; 6 km down there is still no floor. */
console.log('\n[10] Part B: Endless has no floor and keeps a bounded ring');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3; S.salt(99); S.newEndless(); const G = S.g();
    let maxLive = 0, maxKids = 0;
    for (let i = 0; i < 3000; i++) {
      G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120);
      const e = S.endless(); if (e) { maxLive = Math.max(maxLive, e.live.length); maxKids = Math.max(maxKids, e.sceneKids); }
      if (S.g().done) break;
    }
    const out = { depth: Math.round(S.g().depth), done: !!S.g().done, mile: S.endless() && S.endless().mile, maxLive, maxKids };
    G.y = -6000; for (let i = 0; i < 40; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
    out.far = S.endless(); out.farDone = !!S.g().done; S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('Endless runs 3000 steps without ending and passes a world band', !r.done && r.depth > 300, JSON.stringify(r));
  ok('Endless marks every 100 m', r.mile === Math.floor(r.depth / 100), JSON.stringify({ depth: r.depth, mile: r.mile }));
  ok('Endless keeps at most four chunks live', r.maxLive <= 4 && !!r.far && r.far.live.length <= 4, JSON.stringify({ maxLive: r.maxLive, far: r.far }));
  ok('Endless has no floor 6 km down', !r.farDone && !!r.far && r.far.k >= 59, JSON.stringify(r.far));
  await ctx.close();
}

/* ---- 11. SS21/SS20: Pit Conquered moved from the bottom of Endless to every finished numbered dive. */
console.log('\n[11] Part B: Pit Conquered shows on a finished numbered dive, never on Endless');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, go = document.getElementById('s-go'), badge = () => document.getElementById('go-badge').classList.contains('on');
    S.salt(5); S.newFF(1); let G = S.g(); const W = S.world();
    G.x = 0; G.y = W.floorY + 6; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2;   // blade down above the bullseye
    for (let i = 0; i < 2000 && !go.classList.contains('on'); i++) { S.hold(0); S.stepN(1, 16); }
    const out = { ended: go.classList.contains('on'), title: document.getElementById('go-title').textContent, badge: badge() };
    S.salt(5); S.newEndless(); G = S.g();
    G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI;   // blade first into the right wall
    for (let i = 0; i < 2000 && !go.classList.contains('on'); i++) { S.stepN(1, 16); }
    out.eEnded = go.classList.contains('on'); out.eTitle = document.getElementById('go-title').textContent; out.eBadge = badge();
    S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('a finished numbered dive shows Pit conquered', r.ended && r.badge, JSON.stringify(r));
  ok('an Endless end never shows it', r.eEnded && !r.eBadge && /DEPTH/.test(r.eTitle), JSON.stringify(r));
  await ctx.close();
}

/* ---- 12. SS34: settings are set by real pointer input, saved to s3d_set, and survive a reload. */
console.log('\n[12] Part B: settings persist');
{
  const { ctx, p } = await boot();
  let shown = false;
  try {
    await clickCentre(p, '#b-set'); await new Promise(r => setTimeout(r, 400));
    shown = await p.evaluate(() => document.getElementById('s-set').classList.contains('on'));
    await clickCentre(p, '#set-rm'); await clickCentre(p, '#set-rp');
    const bx = await p.evaluate(() => { const b = document.getElementById('set-sfx').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    await p.mouse.click(bx.x + bx.w * 0.25, bx.y + bx.h / 2); await new Promise(r => setTimeout(r, 300));
  } catch (e) { shown = false; }
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('s3d_set') || 'null'));
  await p.reload({ waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, 3500));
  let after; try { after = await p.evaluate(() => ({ set: window._S3.set(), rmClass: document.getElementById('stage').classList.contains('rm') })); }
  catch (e) { after = { set: {}, rmClass: false, error: String(e).slice(0, 160) }; }
  ok('the gear opens settings', shown, String(shown));
  ok('settings are saved as they change', !!saved && saved.rm === true && saved.rp === true && saved.sfx > 0.1 && saved.sfx < 0.45, JSON.stringify(saved));
  ok('settings survive a reload', !!saved && after.set.rm === true && after.set.rp === true && Math.abs(after.set.sfx - saved.sfx) < 0.011 && after.rmClass,
    JSON.stringify(after));
  await ctx.close();
}

/* ---- 13. SS32: a fatal contact holds the world for 350 ms, rings the spot, names the cause, and the end panel leads
   with the retry. Reduced motion keeps the ring and the words and drops the freeze. */
console.log('\n[13] Part B: a crash is explained');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, go = document.getElementById('s-go');
    function crash() { S.salt(5); S.newFF(1); const G = S.g(); G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI;
      for (let i = 0; i < 200; i++) { S.stepN(1, 1000 / 120); if (S.g().failed) break; } }
    crash();
    const out = { failed: !!S.g().failed, why: (document.querySelector('#multburst .why') || {}).textContent || '', rings: S.rings ? S.rings() : 0 };
    const d0 = S.g().doneT; S.stepN(10, 1000 / 120); out.held = S.g().doneT === d0;
    S.stepN(60, 1000 / 120); out.moves = S.g().doneT > d0;
    for (let i = 0; i < 800 && !go.classList.contains('on'); i++) S.stepN(1, 16);
    const first = document.querySelector('#s-go .stack .btn'); out.first = first ? first.id + ':' + first.textContent : '';
    S.set().rm = true; crash(); out.rmFreeze = S.g().freezeT || 0; out.rmWhy = (document.querySelector('#multburst .why') || {}).textContent || '';
    S.set().rm = false; S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('a blade into the wall names the cause', r.failed && r.why === 'Blade hit wall', JSON.stringify(r));
  ok('the crash is ringed in gold', r.rings >= 1, JSON.stringify(r));
  ok('the world holds still for the crash, then goes on', r.held && r.moves, JSON.stringify(r));
  ok('the end panel leads with the retry', r.first === 'go-next:Try Again', r.first);
  ok('reduced motion keeps the words and drops the freeze', r.rmFreeze <= 0 && r.rmWhy === 'Blade hit wall', JSON.stringify(r));
  await ctx.close();
}
