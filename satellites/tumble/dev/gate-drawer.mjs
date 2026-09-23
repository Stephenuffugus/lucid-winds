// THE SEARCHABLE DRAWER in the real page (DESIGN-T2 4.3): "large tap filters by pack and by found lately; it
// remembers where she was. One thumb, no typing." Every chip is TAPPED with a real pointer (never el.click(),
// which proves nothing about a control a thumb has to hit), and every state is shot and looked at.
//   node dev/gate-drawer.mjs [412|360]      (both widths with no argument)
import { harness } from '../tools/harness.mjs';

const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };

async function run(w, h) {
  const H = await harness({ w, h, port: 8794, dpr: 1 });
  const D = (f, ...a) => H.page.evaluate(f, ...a);
  const settle = (fn, arg, ms = 180000) => H.page.waitForFunction(fn, { timeout: ms, polling: 300 }, arg).then(() => true, () => false);
  // A REAL TAP, and only on what is really under the finger.
  // ⛔ LAW 4, learned twice here. The first version measured the chip while the Drawer sheet was still sliding in
  // (it starts on the frame AFTER openSheet returns and takes 3.4 s on this renderer on a quiet box), so the finger
  // landed on a sock and opened its card. Waiting for the rect to hold still was not enough either: before the
  // slide starts the rect IS still, just in the wrong place. So: the sheet must be fully open, the chip is scrolled
  // into view only if it is out of it (instantly), and the tap waits until a hit test at that point finds the chip
  // itself, twice running. A probe proved the tap once it did: one trusted click, on the chip, and the filter moved.
  const sheetOpen = `(() => { const s = document.getElementById('sheet'); if (!s || !s.classList.contains('on')) return false; const t = getComputedStyle(s).transform; return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)'; })()`;
  const tap = async (sel) => {
    if (!(await settle(sheetOpen))) return null;
    await D((sel) => {
      const el = document.querySelector(sel), body = document.getElementById('sheetBody');
      if (!el || !body) return;
      const b = el.getBoundingClientRect(), v = body.getBoundingClientRect();
      const row = el.parentElement && el.parentElement.classList.contains('tabs') ? el.parentElement.getBoundingClientRect() : null;
      if (b.top < v.top || b.bottom > v.bottom || (row && (b.left < row.left || b.right > row.right))) el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
    }, sel);
    let r = null, hits = 0;
    for (let k = 0; k < 40; k++) {
      await H.frames(2);
      r = await D((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
        const at = document.elementFromPoint(x, y);
        return { x, y, w: b.width, h: b.height, on: !!at && el.contains(at) };
      }, sel);
      if (!r) return null;
      hits = r.on ? hits + 1 : 0;
      if (hits >= 2) break;
    }
    if (!r || hits < 2) return null;
    await H.page.touchscreen.tap(r.x, r.y);
    return r;
  };
  const pressed = (sel) => `(() => { const el = document.querySelector('${sel}'); return !!el && el.getAttribute('aria-pressed') === 'true'; })()`;
  const cells = () => D(() => document.querySelectorAll('#dGrid .cell').length);
  try {
    await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
    await H.open('?nosw&turbo=1&unlockall=1&skipdump=1', 'room', 300000);
    await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
    // a Drawer with a history: the ordinary socks were found first, then the heroes one after another
    await D(() => { const s = window.TUMBLE.save; let t = Date.now() - 1e6; for (const d of s.drawer) d.foundAt = t++; window.TUMBLE.ui.hideHint(); });
    await D(() => window.TUMBLE.screens.open('drawer'));
    ok(await settle(() => document.querySelectorAll('#dGrid .cell').length > 0), `${w}: the Drawer opens`);

    // HEROES: the pattern row becomes the packs
    const hb = await tap('#dShow [data-show="hero"]');
    ok(!!hb && hb.h >= 44, `${w}: the Heroes chip is a thumb's size (${hb ? Math.round(hb.w) + 'x' + Math.round(hb.h) : 'missing'})`);
    ok(await settle(() => !!document.querySelector('#dPack') && !document.querySelector('#dFam')), `${w}: under Heroes the pattern row is the packs`);
    const packChips = await D(() => [...document.querySelectorAll('#dPack button')].map((b) => b.textContent.trim()));
    ok(packChips.length >= 11 && packChips[0] === 'Every pack', `${w}: a chip for every pack with socks in the Drawer (${packChips.length - 1}): ${packChips.slice(0, 4).join(', ')}...`);
    await H.frames(3);
    await H.shot(`drawer-heroes-${w}.png`);

    // ONE PACK, one tap
    const pb = await tap('#dPack [data-pack="found-1998"]');
    ok(!!pb, `${w}: the Found in 1998 chip can be reached and tapped`);
    ok(await settle(pressed('#dPack [data-pack="found-1998"]')), `${w}: it is the chosen pack`);
    const packNames = await D(() => [...document.querySelectorAll('#dGrid .cell')].map((c) => c.textContent.trim()));
    const expect = await D(() => window.TUMBLE.data.heroes.filter((h) => h.pack === 'found-1998').map((h) => h.name));
    ok(packNames.length === 10 && packNames.every((n) => expect.some((e) => n.startsWith(e))), `${w}: and the Drawer shows exactly its ten socks (${packNames.length})`);
    await H.frames(3);
    await H.shot(`drawer-pack-${w}.png`);

    // FOUND LATELY
    await tap('#dShow [data-show="lately"]');
    ok(await settle(`${pressed('#dShow [data-show="lately"]')} && !document.querySelector('#dPack')`), `${w}: Found lately is chosen and the pack row goes away with Heroes`);
    const lately = await cells();
    ok(lately === 24, `${w}: Found lately shows the last 24 she found (${lately})`);
    await H.frames(3);
    await H.shot(`drawer-lately-${w}.png`);

    // IT REMEMBERS WHERE SHE WAS: All, two pages deep and scrolled down, closed, opened again
    await tap('#dShow [data-show="all"]');
    await settle(pressed('#dShow [data-show="all"]'));
    await tap('#dMoreBtn');
    await settle(() => document.querySelectorAll('#dGrid .cell').length > 30);
    const before = await D(() => { const b = window.TUMBLE.ui.$('sheetBody'); b.scrollTop = Math.round(b.scrollHeight * 0.55); return { shown: document.querySelectorAll('#dGrid .cell').length, scroll: b.scrollTop }; });
    await tap('#sheetClose');
    ok(await settle(() => !window.TUMBLE.ui.open), `${w}: the Drawer closes`);
    await D(() => window.TUMBLE.screens.open('drawer'));
    await settle(() => document.querySelectorAll('#dGrid .cell').length > 0);
    await settle(sheetOpen);
    await H.frames(3);
    const after = await D(() => ({ shown: document.querySelectorAll('#dGrid .cell').length, scroll: window.TUMBLE.ui.$('sheetBody').scrollTop }));
    ok(after.shown === before.shown && Math.abs(after.scroll - before.scroll) <= 2, `${w}: opened again it is where she left it (${after.shown} shown at ${after.scroll}, was ${before.shown} at ${before.scroll})`);
    await H.shot(`drawer-remembered-${w}.png`);

    const errs = H.errors.filter((e) => !/favicon/.test(e));
    ok(errs.length === 0, `${w}: no console errors ` + errs.join(' | '));
  } catch (e) {
    ok(false, `${w}: drawer gate crashed: ${e.message}`);
  }
  await H.close();
}

// `node dev/gate-drawer.mjs 412` runs one width (a quick red run); no argument runs both
const only = process.argv[2];
if (!only || only === '412') await run(412, 915);
if (!only || only === '360') await run(360, 740);
console.log(fails.length ? `drawer gate: ${fails.length} FAILED` : 'drawer gate: all passed');
process.exitCode = fails.length ? 1 : 0;
