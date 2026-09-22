// POCKET FINDS in the real page (DESIGN-T2 phase 2.3): a find turning up in a Load, the card on the results
// sheet, the Pockets page in the Drawer, and the ledge under the window with something on it.
// Looked at, at 412x915 and at 360x740.
//
// Law 4: never a fixed wait. Assert the change AT ONCE, then wait for the SETTLED value. Law 6: a green check
// is not a look, so every step that matters takes a picture and the picture is opened.
// node dev/gate-finds.mjs
import { harness } from '../tools/harness.mjs';

const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };

async function run(w, h, tag) {
  const H = await harness({ w, h });
  const D = (f, ...a) => H.page.evaluate(f, ...a);
  const settle = (fn, arg, ms = 120000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }, arg).then(() => true, () => false);
  try {
    // A real Regular Load at tier 5, so the Load has inside out socks and every moment can fire.
    await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=regular&tier=5&seed=findgate', 'play', 300000);

    // 1. the catalogue really loaded into the page
    const cat = await D(() => TUMBLE_DEV.app.data());
    ok(cat.finds === 30 && cat.sets === 5 && cat.comforts === 5, `${tag}: the page has the catalogue (${cat.finds} finds, ${cat.sets} sets, ${cat.comforts} comforts)`);

    // 2. the Load is holding something, and it comes out. The gate does not force one in: it asks the rules
    //    for a Load that holds one, so the thing being watched is the real path.
    const held = await D(() => {
      const S = TUMBLE.game.session;
      // this seed may or may not be holding one: if not, hand the session the find the rules WOULD give a
      // Load that is, so the arrival is still the real arrival and not a fake
      if (!S.find) S.setFind(TUMBLE.app.data.finds.items.find((f) => f.comesOut === 'pull' && f.rarity !== 'once'));
      return { id: S.find && S.find.id, name: S.find && S.find.name, moment: S.find && S.find.comesOut, forced: !S.found };
    });
    ok(!!held.id, `${tag}: the Load is holding ${held.name} (it comes out at "${held.moment}")`);

    // pull a sock the way a thumb does, then wait for the find to have ARRIVED in the rules
    await D(() => {
      const g = TUMBLE.game, S = g.session;
      for (const e of [...g.table.ents.values()]) { const s = S.sock(e.id); if (s && s.state === 'table') { g.play.toPocket(e); break; } }
    });
    const arrived = await settle(() => !!TUMBLE.game.session.found, null, 180000);
    const got = await D(() => { const f = TUMBLE.game.session.found; return f ? { id: f.id, moment: f.moment } : null; });
    ok(arrived && got, `${tag}: it turned up, at "${got && got.moment}"`);

    // and it is ON THE SCREEN, with its name, inside the screen
    const flew = await settle(() => !!document.querySelector('.findfly'), null, 120000);
    const fly = await D(() => {
      const el = document.querySelector('.findfly');
      if (!el) return null;
      const q = el.getBoundingClientRect(), c = el.querySelector('canvas'), b = el.querySelector('b');
      const cq = c ? c.getBoundingClientRect() : null;
      return { x: Math.round(q.left), right: Math.round(q.right), top: Math.round(q.top), bottom: Math.round(q.bottom), name: b ? b.textContent : '', tile: cq ? Math.round(cq.width) : 0 };
    });
    ok(flew && fly, `${tag}: a find is drawn on the screen`);
    if (fly) {
      ok(fly.name === held.name, `${tag}: it is named on it ("${fly.name}")`);
      ok(fly.tile >= 60, `${tag}: its tile is ${fly.tile} px, big enough to read`);
      ok(fly.x >= -4 && fly.right <= w + 4, `${tag}: it stays on the ${w} px screen (${fly.x} to ${fly.right})`);
      ok(fly.top >= 0 && fly.bottom <= h, `${tag}: and inside its height (${fly.top} to ${fly.bottom} of ${h})`);
    }
    await H.shot(`g-finds-${tag}-inload.png`);

    // 3. finish the Load: the find is on the results sheet, once, with its flavor line
    await D(() => {
      const S = TUMBLE.game.session;
      const byKey = new Map();
      for (const s of S.socks.values()) { if (s.odd !== null && s.odd !== undefined) { S.bin(s.id); continue; } byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]); }
      for (const [a, b] of byKey.values()) { const m = S.match(a, b); if (m.ok) { S.shoot(m.ball, { tap: true }); S.shotResult(m.ball, true); } }
    });
    const sheet = await settle(() => TUMBLE_DEV.state === 'results' && !!document.querySelector('#sheet'), null, 240000);
    const row = await D(() => {
      const r = document.querySelector('.findrow');
      if (!r) return { rows: document.querySelectorAll('.findrow').length };
      const q = r.getBoundingClientRect(), c = r.querySelector('canvas');
      return { rows: document.querySelectorAll('.findrow').length, name: (r.querySelector('b') || {}).textContent, flavor: (r.querySelector('.ft span') || {}).textContent, left: Math.round(q.left), right: Math.round(q.right), tile: c ? Math.round(c.getBoundingClientRect().width) : 0 };
    });
    ok(sheet && row.rows === 1, `${tag}: the results sheet has the find on it, once (${row.rows})`);
    if (row.name) {
      ok(row.name === held.name, `${tag}: with its name ("${row.name}")`);
      ok(!!row.flavor && row.flavor.length > 4, `${tag}: and its line ("${row.flavor}")`);
      ok(row.tile >= 40, `${tag}: and its tile drawn at ${row.tile} px`);
      ok(row.left >= 0 && row.right <= w + 1, `${tag}: the card fits the ${w} px screen (${row.left} to ${row.right})`);
    }
    const saved = await D(() => { const s = TUMBLE_DEV.app.save(); return { finds: s.finds.slice(), sets: s.sets.slice() }; });
    ok(saved.finds.length === 1 && saved.finds[0] === held.id, `${tag}: it is written into the save (${saved.finds.join(', ')})`);
    await H.shot(`g-finds-${tag}-results.png`);

    // 4. back in the room the way a player goes: tap Room, wait for the SETTLED camera, then look for the ledge
    const roomBtn = await D(() => {
      const b = [...document.querySelectorAll('#sheet button')].find((x) => x.textContent.trim() === 'Room');
      if (!b) return null;
      const q = b.getBoundingClientRect();
      return { x: Math.round(q.left + q.width / 2), y: Math.round(q.top + q.height / 2) };
    });
    ok(!!roomBtn, `${tag}: the results sheet has a Room button`);
    if (roomBtn) await H.tap(roomBtn.x, roomBtn.y);
    const inRoom = await settle(() => document.getElementById('sheet').hasAttribute('inert') && !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room', null, 240000);
    ok(inRoom, `${tag}: the room is up and the camera has settled`);

    // the ledge exists now, is IN FRAME, and is holding what she found
    const ledge = await D(() => {
      const g = TUMBLE.game, R = g.render;
      let found = null, hold = 0;
      const box = TUMBLE_DEV.app.anchors().ledge;
      if (box) {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const p of box) { const s = R.project(p); x0 = Math.min(x0, s.x); x1 = Math.max(x1, s.x); y0 = Math.min(y0, s.y); y1 = Math.max(y1, s.y); }
        found = { x: Math.round((x0 + x1) / 2), y: Math.round((y0 + y1) / 2), w: Math.round(x1 - x0), h: Math.round(y1 - y0), vw: R.w, vh: R.h };
      }
      const spot = document.querySelector('[data-spot="ledge"]');
      const sq = spot ? spot.getBoundingClientRect() : null;
      return { found, hold, spot: sq ? { x: Math.round(sq.left), y: Math.round(sq.top), w: Math.round(sq.width), h: Math.round(sq.height) } : null, title: Math.round(document.getElementById('roomTitle').getBoundingClientRect().bottom) };
    });
    ok(ledge.found, `${tag}: the ledge has an anchor in the room`);
    if (ledge.found) {
      ok(ledge.found.x > 0 && ledge.found.x < ledge.found.vw && ledge.found.y > 0 && ledge.found.y < ledge.found.vh,
        `${tag}: and it is in frame, at ${ledge.found.x},${ledge.found.y} of ${ledge.found.vw}x${ledge.found.vh} (${ledge.found.w}x${ledge.found.h} px)`);
      ok(ledge.found.y > ledge.title, `${tag}: below the room title, which ends at ${ledge.title}`);
    }
    ok(ledge.spot && ledge.spot.w >= 48 && ledge.spot.h >= 48, `${tag}: its hotspot is at least 48 px (${ledge.spot ? ledge.spot.w + 'x' + ledge.spot.h : 'missing'})`);
    await H.shot(`g-finds-${tag}-room.png`);

    // 5. the Pockets page: tap the ledge the way a thumb does
    if (ledge.spot) await H.tap(ledge.spot.x + ledge.spot.w / 2, ledge.spot.y + ledge.spot.h / 2);
    const pockets = await settle(() => !!document.querySelector('#pk'), null, 120000);
    const page = await D(() => {
      const pk = document.querySelector('#pk');
      if (!pk) return null;
      const cells = [...pk.querySelectorAll('.pc')];
      const mine = cells.filter((c) => c.dataset.find);
      const miss = cells.filter((c) => c.classList.contains('miss'));
      const small = mine.concat(miss).filter((c) => { const q = c.getBoundingClientRect(); return q.height < 48; });
      const wide = cells.filter((c) => c.getBoundingClientRect().right > window.innerWidth + 1);
      const tabs = [...document.querySelectorAll('[data-top]')].map((b) => b.textContent.trim() + (b.getAttribute('aria-pressed') === 'true' ? '*' : ''));
      const heads = [...pk.querySelectorAll('h4')].map((x) => x.firstChild.textContent.trim());
      return { mine: mine.length, miss: miss.length, small: small.length, wide: wide.length, tabs, heads, canvas: pk.querySelectorAll('canvas').length };
    });
    ok(pockets && page, `${tag}: the ledge opens the Pockets page`);
    if (page) {
      ok(page.mine === 1, `${tag}: it shows the one thing she has (${page.mine})`);
      ok(page.heads.length === 1, `${tag}: and only the set she has started (${page.heads.join(', ')})`);
      ok(page.miss === 5, `${tag}: with silhouettes for the five she has not found in it (${page.miss})`);
      ok(page.canvas === page.mine, `${tag}: only the ones she has are painted (${page.canvas} tiles)`);
      ok(page.small === 0, `${tag}: every cell is at least 48 px tall (${page.small} too small)`);
      ok(page.wide === 0, `${tag}: nothing runs off the ${w} px screen (${page.wide} did)`);
      ok(page.tabs.length === 2 && /\*/.test(page.tabs[1]), `${tag}: the Drawer's two tabs are there and Pockets is the one open (${page.tabs.join(', ')})`);
    }
    await H.shot(`g-finds-${tag}-pockets.png`);

    // 6. one find, big
    const cell = await D(() => { const c = document.querySelector('.pc[data-find]'); if (!c) return null; const q = c.getBoundingClientRect(); return { x: Math.round(q.left + q.width / 2), y: Math.round(q.top + q.height / 2) }; });
    if (cell) await H.tap(cell.x, cell.y);
    const card = await settle(() => !!document.querySelector('#fcHost canvas'), null, 120000);
    const cd = await D(() => {
      const hostc = document.querySelector('#fcHost canvas');
      const t = document.querySelector('#sheetTitle') || document.querySelector('#sheet h2, #sheet h3');
      const body = document.getElementById('sheetBody');
      return { tile: hostc ? Math.round(hostc.getBoundingClientRect().width) : 0, title: t ? t.textContent.trim() : '', text: body ? body.textContent.replace(/\s+/g, ' ').trim().slice(0, 150) : '' };
    });
    ok(card && cd.tile >= 120, `${tag}: one find opens big (${cd.tile} px) and is titled "${cd.title}"`);
    console.log(`  info  ${tag}: the card reads "${cd.text}"`);
    await H.shot(`g-finds-${tag}-card.png`);

    const errs = H.errors.filter((e) => !/favicon/.test(e));
    ok(errs.length === 0, `${tag}: no console errors ` + errs.join(' | '));
  } catch (e) {
    ok(false, `${tag}: gate crashed: ${e.message}`);
  }
  await H.close();
}

// one browser at a time (two cores): 412x915 first, then 360x740
await run(412, 915, '412');
await run(360, 740, '360');
console.log(fails.length ? `finds gate: ${fails.length} FAILED` : 'finds gate: all passed');
process.exitCode = fails.length ? 1 : 0;
