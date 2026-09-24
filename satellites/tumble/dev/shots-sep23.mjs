// HIS NOTES OF 23 SEP, LOOKED AT: a Timed Rush with the medal bar and stopwatch on the HUD and a medal on the result
// sheet; the Drawer under one pack ("Cursed 3 of 10", the seven still to find in shadow); a sock card with Back to the
// Drawer that lands where she was; the shop's pack card saying how many are found. At a phone's width. OPEN THEM.
//   node dev/shots-sep23.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';
const W = Number(process.argv[2] || 412), H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8798, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 60000) => H.page.waitForFunction(f, { timeout: ms, polling: 150 }, arg).then(() => true, () => false);
try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  // ---- Rush: a Small Timed Rush played through with lobs, the HUD mid way, the medal at the end
  await H.open('?nosw&turbo=1&unlockall=1&skipdump=1&load=rush&sub=timed&size=small&tier=2&seed=medal', 'play', 240000);
  await D(() => { const app = window.TUMBLE; for (const k of Object.keys(app.save.seen || {})) app.save.seen[k] = true; app.ui.hideHint(); });
  const s0 = await D(() => TUMBLE_DEV.session());
  // 24 Sep: gold is a fraction of the old clock now (the four tightened); the four still stand in order under the clock
  ok(s0.medalTimes && s0.medalTimes.platinum < s0.medalTimes.gold && s0.medalTimes.gold < s0.medalTimes.silver && s0.medalTimes.gold <= s0.par && s0.noCutoff, `a Timed Rush carries its four times and no cutoff (gold ${s0.medalTimes.gold.toFixed(1)} s of the old clock ${s0.par.toFixed(1)} s)`);
  const hud = await D(() => ({ timer: !document.getElementById('timer').hidden, secs: !document.getElementById('secs').hidden, label: document.getElementById('secsL').textContent, marks: ['mkP', 'mkG', 'mkS'].map((id) => !document.getElementById(id).hidden && document.getElementById(id).style.left) }));
  ok(hud.timer && hud.secs && hud.label === 'platinum' && hud.marks.every(Boolean), `the medal bar, its three marks and the stopwatch show, platinum in reach (${JSON.stringify(hud)})`);
  // the streak bar fits the phone: nothing on it is cut at the right edge (at 360 the points chip was, 23 Sep)
  const fit = await D(() => { const bar = document.getElementById('rushbar'); const kids = [...bar.children].filter((k) => !k.hidden && k.getBoundingClientRect().width); const right = Math.max(...kids.map((k) => k.getBoundingClientRect().right)); return { right: +right.toFixed(0), w: window.innerWidth, over: kids.filter((k) => k.scrollWidth > k.clientWidth + 1).map((k) => k.id) }; });
  ok(fit.right <= fit.w - 8 && !fit.over.length, `the streak bar fits the phone (right edge ${fit.right} of ${fit.w}${fit.over.length ? ', clipped: ' + fit.over.join(' ') : ''})`);
  for (let i = 0; i < 5; i++) { const b = await D(() => TUMBLE_DEV.matchPair()); if (b === null) break; await D((id) => TUMBLE_DEV.lobBall(id), b); await until((n) => { const s = TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed >= n; }, i + 1); }
  await H.frames(2);
  await H.shot(`rush-hud-${W}.png`);
  for (let i = 5; i < 12; i++) { const b = await D(() => TUMBLE_DEV.matchPair()); if (b === null) break; await D((id) => TUMBLE_DEV.lobBall(id), b); await until((n) => { const s = TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed >= n; }, i + 1); }
  // odd socks to the bin so the table clears
  await D(() => { const g = TUMBLE.game, S = g.session; for (const s of S.socks.values()) if (s.state === 'table' && s.odd !== null && s.odd !== undefined) { S.bin(s.id); g.table.remove(s.id); } });
  ok(await until(() => TUMBLE_DEV.state === 'results', null, 120000), 'with the table clear the Rush ends by itself');
  const res = await D(() => { const S = TUMBLE.game.session; return { medal: S.medal, clock: +S.clock.toFixed(1), bonus: S.stats.medalBonus, points: S.stats.rushPoints, badge: (document.querySelector('.sheet .medal') || {}).textContent, title: document.getElementById('sheetTitle').textContent }; });
  ok(res.title === 'Rush result' && res.badge && (res.medal ? res.badge.toLowerCase() === res.medal : res.badge === 'Finished'), `the result names the medal (${JSON.stringify(res)})`);
  await H.shot(`rush-result-${W}.png`);
  // ---- the Drawer under one pack: the count, the shadows, a card's Back
  await D(() => { TUMBLE.ui.closeSheet(); TUMBLE.game.abandonLoad(); TUMBLE.showRoom(); });
  await until(() => TUMBLE_DEV.state === 'room');
  const pack = await D(() => {
    const app = window.TUMBLE, s = app.save;
    // she has found three Cursed heroes and nothing else from that pack
    const cursed = app.data.heroes.filter((h) => h.pack === 'cursed' && h.source !== 'reunion');
    s.drawer = s.drawer.filter((d) => !d.heroId || (app.heroById(d.heroId) || {}).pack !== 'cursed');
    for (const h of cursed.slice(0, 3)) s.drawer.push({ heroId: h.id, foundAt: Date.now() - 1000, count: 1, odd: false });
    app.screens.filters = { show: 'hero', sil: 'all', family: 'all', pack: 'cursed' };
    app.screens.drawerTab = 'socks';
    app.screens.drawer();
    return { chip: [...document.querySelectorAll('#dPack button')].find((b) => b.dataset.pack === 'cursed')?.textContent, cells: document.querySelectorAll('#dGrid .cell').length, miss: document.querySelectorAll('#dMiss .cell.miss').length, lead: document.getElementById('dMissLead').textContent };
  });
  ok(/3 of 10/.test(pack.chip || ''), `the pack chip counts (${pack.chip})`);
  const side = await D(() => { const b = document.getElementById('sheetBody'); return { sw: b.scrollWidth, cw: b.clientWidth }; });
  ok(side.sw <= side.cw, `the Drawer cannot move sideways (content ${side.sw} in ${side.cw})`);
  ok(pack.cells === 3 && pack.miss === 7 && /7 more/.test(pack.lead), `three found, seven in shadow (${pack.cells}, ${pack.miss}: "${pack.lead}")`);
  await H.frames(2);
  await H.shot(`drawer-pack-${W}.png`);
  await D(() => { document.getElementById('sheetBody').scrollTop = 99999; });
  await H.frames(1);
  await H.shot(`drawer-pack-end-${W}.png`);
  await D(() => { document.getElementById('sheetBody').scrollTop = 0; document.querySelector('#dGrid .cell').click(); });
  ok(await until(() => !!document.getElementById('scBack')), 'a sock card opened from the Drawer has Back to the Drawer');
  await H.frames(2);
  await H.shot(`sock-card-back-${W}.png`);
  await D(() => document.getElementById('scBack').click());
  const back = await D(() => ({ title: document.getElementById('sheetTitle').textContent, pack: [...document.querySelectorAll('#dPack button')].find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.pack, show: [...document.querySelectorAll('#dShow button')].find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.show }));
  ok(back.title === 'The Drawer' && back.pack === 'cursed' && back.show === 'hero', `Back lands in the Drawer where she was (${JSON.stringify(back)})`);
  // ---- the fifth Load's gift: Regular load hangs, and with it a hero pack and a song, on the results sheet
  await D(() => { TUMBLE.ui.closeSheet(); const s = TUMBLE.save; s.stats.loads = 4; s.tierGifts = []; s.clothesline = s.clothesline.filter((id) => id !== 'regular-load'); s.unlocks = s.unlocks.filter((id) => !/^pack-|^radio-/.test(id)); s.equipped.radio = null; TUMBLE.store.save(); TUMBLE.start({ mode: 'laundry', size: 'small', tier: 0, seed: 'gift5' }); });
  ok(await until(() => TUMBLE_DEV.state === 'play', null, 120000), 'a fifth Load is in play');
  for (let i = 0; i < 12; i++) { const b = await D(() => TUMBLE_DEV.matchPair()); if (b === null) break; await D((id) => TUMBLE_DEV.lobBall(id), b); await until((n) => { const s = TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed >= n; }, i + 1); }
  await D(() => { const g = TUMBLE.game, S = g.session; for (const s of S.socks.values()) if (s.state === 'table' && s.odd !== null && s.odd !== undefined) { S.bin(s.id); g.table.remove(s.id); } });
  ok(await until(() => TUMBLE_DEV.state === 'results', null, 120000), 'the fifth Load ends');
  const gift = await D(() => { const s = TUMBLE.save; const notes = [...document.querySelectorAll('.sheet .note')].map((n) => n.textContent); return { gifts: s.tierGifts.slice(), pack: s.unlocks.find((id) => /^pack-/.test(id)), song: s.unlocks.find((id) => /^radio-/.test(id)), radio: s.equipped.radio, note: notes.find((t) => /comes a gift/.test(t)) || null, peg: notes.find((t) => /Regular load/.test(t)) || null }; });
  // 24 Sep: the first song is everybody's, so the peg's song is the next one; a radio she switched off (null above) stays off
  ok(gift.gifts.includes('regular-load') && gift.pack && gift.song === 'radio-parkedcar' && gift.radio === null, `Regular load brought a pack and the next song, and a radio she switched off stays off (${gift.pack}, ${gift.song})`);
  ok(!!gift.peg && !!gift.note && /hero pack/.test(gift.note) && /song/.test(gift.note), `the results sheet says so under the peg (${(gift.note || '').slice(0, 80)})`);
  await D(() => { const body = document.getElementById('sheetBody'); const n = [...body.querySelectorAll('.note')].find((x) => /comes a gift/.test(x.textContent)); if (n) body.scrollTop = Math.max(0, body.scrollTop + n.getBoundingClientRect().top - body.getBoundingClientRect().top - 120); });
  await H.frames(2);
  await H.shot(`gift-result-${W}.png`);
  // the gift step took her packs away for its picture; the shop card below needs Cursed owned again
  await D(() => { const s = TUMBLE.save; if (!s.unlocks.includes('pack-cursed')) s.unlocks.push('pack-cursed'); TUMBLE.store.save(); TUMBLE.ui.closeSheet(); TUMBLE.game.abandonLoad(); TUMBLE.showRoom(); });
  await until(() => TUMBLE_DEV.state === 'room');
  // ---- the shop's pack card
  await D(() => { TUMBLE.ui.closeSheet(); TUMBLE.screens.door('pack'); });
  await H.frames(2);
  const card = await D(() => { const row = [...document.querySelectorAll('#shopList .shopitem')].find((r) => /Cursed/.test(r.querySelector('b').textContent)); const s = TUMBLE.save; const found = s.drawer.filter((d) => d.heroId && (TUMBLE.heroById(d.heroId) || {}).pack === 'cursed').length; return { text: row ? row.querySelector('.txt').textContent : null, owned: s.unlocks.includes('pack-cursed'), found }; });
  ok(card.text && new RegExp(`${card.found} of 10 found`).test(card.text), `the shop's Cursed card says how many are found (owned ${card.owned}, found ${card.found}: ${(card.text || '').slice(-60)})`);
  await H.shot(`shop-pack-${W}.png`);
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `sep23 shots: ${fails.length} FAILED` : 'sep23 shots: all passed');
process.exitCode = fails.length ? 1 : 0;
