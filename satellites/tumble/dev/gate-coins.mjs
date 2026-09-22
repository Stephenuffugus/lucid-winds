// POCKET CHANGE in the real page (DESIGN-T2 phase 1.6): a real Regular Load, coins landing in the jar, the pill
// showing them, and a Quarter rolling. Looked at, at 412x915 and at 360x740.
//
// Law 4: never a fixed wait. The software renderer here runs near 1 fps, so every check asserts the change AT ONCE
// and then waits for the SETTLED value. A check that can skip itself is not a check.
// node dev/gate-coins.mjs
import { harness } from '../tools/harness.mjs';

const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };

async function run(w, h, tag) {
  const H = await harness({ w, h });
  const D = (f, ...a) => H.page.evaluate(f, ...a);
  const settle = (fn, arg, ms = 120000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }, arg).then(() => true, () => false);
  try {
    // A real Regular Load, played to the end, so the jar rolls more than once in this one run. Tier 5 on
    // purpose: a fresh save is tier 0 and tier 0 has NO inside out socks (DESIGN 5), so the flip moment would
    // have nothing to fire on and the check would pass by being empty.
    await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=regular&tier=5&seed=coingate', 'play', 300000);

    // 1. the pill is there, it says what the jar holds, and it fits the screen
    const pill = await D(() => {
      const c = document.getElementById('chipJar');
      if (!c || c.hidden) return { hidden: true };
      const q = c.getBoundingClientRect(), hud = document.getElementById('hud').getBoundingClientRect();
      const kids = [...document.getElementById('hud').children].map((k) => { const r = k.getBoundingClientRect(); return { id: k.id, x: Math.round(r.left), w: Math.round(r.width) }; });
      return { hidden: false, x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), text: c.textContent.trim(), right: Math.round(q.right), hudW: Math.round(hud.width), kids };
    });
    ok(!pill.hidden, `${tag}: the jar pill is on the screen in a Load`);
    if (!pill.hidden) {
      ok(pill.right <= w, `${tag}: it fits inside ${w} px (its right edge is at ${pill.right}, the HUD is ${pill.hudW} wide)`);
      // the HUD chips must not overlap each other at this width: that is the layout shift the design asks about
      const over = [];
      for (let i = 1; i < pill.kids.length; i++) { const a = pill.kids[i - 1], b = pill.kids[i]; if (a.w && b.w && a.x + a.w > b.x + 0.5) over.push(`${a.id} over ${b.id}`); }
      ok(over.length === 0, `${tag}: nothing in the HUD overlaps anything else (${over.join(', ') || 'none'})`);
      console.log(`  info  ${tag}: HUD row ${pill.kids.map((k) => `${k.id || 'spacer'} ${k.w}`).join(', ')}`);
    }

    // 2. the dryer door really paid, and the save will get it
    const paid = await D(() => {
      const S = TUMBLE.game.session;
      return { cents: S.cents, coins: S.coins.map((c) => c.kind), moments: Object.keys(S._momentPaid || {}), pending: TUMBLE.pendingCents };
    });
    ok(paid.cents > 0 && paid.coins.length > 0, `${tag}: the dryer door paid ${paid.coins.length} coins, ${paid.cents} cents (${paid.coins.join(', ')})`);
    ok(paid.moments.includes('door'), `${tag}: and it was the door that paid them (${paid.moments.join(', ')})`);

    // the pill catches up with what the rules found: assert nothing, WAIT for the settled number
    const shown = await settle(() => { const c = document.getElementById('chipJar'); const S = TUMBLE.game.session; if (!c || c.hidden) return false; const n = Number(document.getElementById('jarCents').textContent); return n === (S.cents % 25); });
    const jarText = await D(() => document.getElementById('jarCents').textContent + ' of ' + (TUMBLE.game.session.cents % 25));
    ok(shown, `${tag}: the pill settles on what is in the jar (${jarText})`);
    await H.shot(`g-coins-${tag}-inload.png`);

    // 3. the glass jar on the dryer top has coins in it
    const jar3d = await D(() => { const J = TUMBLE.game.render.coinJar; return J ? { cents: J.cents, showing: J.discs.filter((d) => d.visible).length, of: J.discs.length } : null; });
    ok(jar3d && jar3d.showing > 0, `${tag}: the glass jar on the dryer shows ${jar3d ? jar3d.showing + ' of ' + jar3d.of : 'no'} coins for ${jar3d ? jar3d.cents : '?'} cents`);

    // 4. a flip drops a coin from the cuff, where the sock is. Flip every inside out sock and watch the cap hold.
    const flip = await D(() => {
      const g = TUMBLE.game, S = g.session;
      const before = S.cents;
      let tried = 0;
      for (const e of [...g.table.ents.values()]) {
        const sk = S.sock(e.id);
        if (sk && sk.insideOut) { tried++; g.play.flip(e); }
      }
      return { tried, before, after: S.cents, paid: S._momentPaid.flip || 0, all: !!S._momentPaid.allFlipped };
    });
    ok(flip.tried > 0, `${tag}: the Load had ${flip.tried} inside out socks to turn`);
    ok(flip.paid <= 2, `${tag}: ${flip.tried} flips paid at most the two coins a Regular Load allows (${flip.paid})`);
    ok(flip.all, `${tag}: turning the last one paid the "every sock the right way out" coin`);

    // 5. finish the Load: the trap slides out, the jar rolls, and the results sheet says so
    // Every pair balled and tapped in, so it is a Clean Load. The game's OWN loop then notices the Load is
    // done, sweeps and shows the results: nothing here calls startSweep or finishLoad by hand.
    const played = await D(() => {
      const S = TUMBLE.game.session;
      const byKey = new Map();
      for (const s of S.socks.values()) { if (s.odd !== null && s.odd !== undefined) { S.bin(s.id); continue; } byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]); }
      for (const [a, b] of byKey.values()) { const m = S.match(a, b); if (m.ok) { S.shoot(m.ball, { tap: true }); S.shotResult(m.ball, true); } }
      return { left: S.unresolvedSocks(), done: S.isPlayDone() };
    });
    ok(played.left === 0 && played.done, `${tag}: every sock is put away, so the Load is over (${played.left} left)`);
    const sheet = await settle(() => TUMBLE_DEV.state === 'results' && !!document.querySelector('.coinrow'), null, 240000);
    const rolled = await D(() => ({ cents: TUMBLE.game.session.cents, clean: TUMBLE.game.session.stats.cleanLoad }));
    ok(rolled.clean && rolled.cents >= 50, `${tag}: a Clean Load, ${rolled.cents} cents found, so the jar has rolled at least twice`);
    const line = await D(() => { const r = document.querySelector('.coinrow'); if (!r) return null; const q = r.getBoundingClientRect(); return { text: (r.querySelector('.jarnote') || {}).textContent, coins: r.querySelectorAll('svg').length, w: Math.round(q.width), right: Math.round(q.right) }; });
    ok(sheet && line, `${tag}: the results sheet has the coin line on it`);
    if (line) {
      ok(line.coins > 0, `${tag}: ${line.coins} coins drawn as coins, and it reads "${(line.text || '').trim()}"`);
      ok(line.right <= w + 1, `${tag}: the coin line fits the ${w} px screen (right edge ${line.right})`);
    }
    const saved = await D(() => { const e = TUMBLE_DEV.app.save().economy; return { cents: e.cents, quarters: e.quarters }; });
    ok(saved.cents < 25, `${tag}: the jar in the save never holds a Quarter's worth (${saved.cents} cents, ${saved.quarters} Quarters)`);
    ok(saved.quarters >= 2, `${tag}: and the Quarters she rolled are hers (${saved.quarters})`);
    await H.shot(`g-coins-${tag}-results.png`);

    // 6. back in the room: the jar chip and the glass jar agree with the save
    await D(() => TUMBLE.showRoom());
    const inRoom = await settle(() => { const w2 = document.getElementById('roomWallet'); return w2 && !w2.hidden && /cent/.test(w2.textContent); });
    const room = await D(() => { const e = TUMBLE_DEV.app.save().economy, J = TUMBLE.game.render.coinJar; const w2 = document.getElementById('roomWallet'); const q = w2.getBoundingClientRect(); return { text: w2.textContent.replace(/\s+/g, ' ').trim(), cents: e.cents, jar: J && J.cents, left: Math.round(q.left), right: Math.round(q.right) }; });
    ok(inRoom, `${tag}: the room wallet shows the jar ("${room.text}")`);
    ok(room.jar === room.cents, `${tag}: the glass jar on the dryer matches the save (${room.jar} against ${room.cents})`);
    ok(room.right <= w + 1 && room.left >= 0, `${tag}: the wallet stays on the screen at ${w} px (${room.left} to ${room.right})`);
    await H.shot(`g-coins-${tag}-room.png`);

    // 7. A SECOND Load in the same sitting still shows its coins. (Found by reading the code: the drain kept a
    //    watermark on the game, not on the Load, so Load two showed nothing until it beat Load one's count.)
    const wasQ = await D(() => TUMBLE_DEV.app.save().economy.quarters);
    await D(() => TUMBLE.start({ mode: 'laundry', size: 'regular', tier: 5 }));
    const playing = await settle(() => TUMBLE_DEV.state === 'play', null, 240000);
    ok(playing, `${tag}: a second Load starts`);
    const second = await settle(() => { const S = TUMBLE.game.session; const c = document.getElementById('chipJar'); return S && S.coins.length > 0 && c && !c.hidden && Number(document.getElementById('jarCents').textContent) === ((TUMBLE_DEV.app.save().economy.cents + S.cents) % 25); }, null, 240000);
    const s2 = await D(() => ({ coins: TUMBLE.game.session.coins.length, cents: TUMBLE.game.session.cents, pill: document.getElementById('jarCents').textContent, shown: TUMBLE.game._coinsShown }));
    ok(second, `${tag}: the second Load's coins reach the pill too (${s2.coins} coins, ${s2.cents} cents, pill says ${s2.pill}, ${s2.shown} drawn)`);
    console.log(`  info  ${tag}: she had ${wasQ} Quarters going into the second Load`);

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
console.log(fails.length ? `coins gate: ${fails.length} FAILED` : 'coins gate: all passed');
process.exitCode = fails.length ? 1 : 0;
