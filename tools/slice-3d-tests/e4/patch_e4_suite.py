# Part E4's suite row [21] (the boss chamber), appended before the summary line
import sys
p=sys.argv[1] if len(sys.argv)>1 else '/workspaces/lucid-winds/satellites/slice-3d/audit-check.mjs'
s=open(p,encoding='utf-8').read()
ROW=r'''
/* ---- 21. Part E4: the bosses ------------------------------------------------ */
console.log('\n[21] Part E4: a boss at the end of every world');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => { const S = window._S3, out = {}, D = 1000 / 120; window._S3skiprender = true;
    const fp = W => { const L = ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns', 'verbs'], parts = [];
      L.forEach(n => (W[n] || []).forEach(e => parts.push(n[0], Math.round((e.x != null ? e.x : e.cx || 0) * 1000), Math.round((e.y || 0) * 1000), Math.round((e.w || e.r || 0) * 1000))));
      return parts.join(','); };
    out.levels = {}; for (const l of [4, 5, 6, 10, 15, 40]) { S.salt(77); S.newFF(l); out.levels[l] = !!S.boss(); }
    S.salt(77); S.newEndless(); out.levels.endless = !!S.boss();
    /* the shaft above the chamber is the very dive it was: its pieces, and its Clean Slice line */
    S.salt(77); S.bossOff(true); S.newFF(5); const a = fp(S.world()), la = S.clean().req.length; S.bossOff(false); S.salt(77); S.newFF(5); const b = fp(S.world()), lb = S.clean().req.length;
    out.same = { pieces: a === b, line: la === lb, deeper: S.world().floorY < -300 };
    /* the fight as played: the knife falls blade down onto the boss in the middle and is left alone; the net lobs it onto
       the boss's next lane each time; three hits, the reveal, the net drops, the floor */
    const fight = (ang, hold) => { S.salt(77); S.newFF(5); const G = S.g(), B = S.boss(); G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = ang; S.hold(0);
      const log = []; let held = null;
      for (let n = 0; n < 6000 && !G.done; n++) { const h0 = B.hits, l0 = B.lobs; if (hold) hold(n, G, B); S.stepN(1, D); if (B.hits > h0) log.push('hit' + B.hits); if (B.lobs > l0) log.push('lob');
        if (B.hits === 1 && held === null) { held = 0; for (let k = 0; k < 10; k++) { G.x = B.x; G.y = B.y + 0.5; G.vx = 0; G.vy = -0.2; S.stepN(1, D); } held = B.hits; } }
      return { hits: B.hits, held, cleared: B.cleared, skipped: B.skipped, net: B.netOn, done: G.done, failed: !!G.failed, log: log.join(' '), lab: document.getElementById('go-lab').textContent, name: B.name }; };
    out.win = fight(Math.PI / 2);
    for (let n = 0; n < 600 && !document.getElementById('s-go').classList.contains('on'); n++) S.stepN(1, D);
    out.win.panel = document.getElementById('go-lab').textContent;
    out.handle = fight(-Math.PI / 2);
    /* a restart resets the chamber */
    S.salt(77); S.newFF(5); out.restart = { hits: S.boss().hits, net: S.boss().netOn, lobs: S.boss().lobs };
    /* the ropes: from each lane, a hold toward the nearer one cuts it (0.1 s from a side lane, 0.25 s from the middle); the net drops, Clean Slice is forfeited, nobody dies */
    out.ropes = [0, -4.8, 4.8].map(lane => { S.salt(77); S.newFF(5); const G = S.g(), B = S.boss(); B.hits = 1; B.lobs = 1; B.x = B.tx = lane; G.x = lane; G.y = B.netY + 1; G.vx = 0; G.vy = Math.sqrt(2 * 21 * ((B.y + 5) - B.netY)); G.w = 0; G.ang = Math.PI / 2;
      const side = lane < 0 ? -1 : 1, T = lane === 0 ? 30 : 12; let cut = false; for (let n = 0; n < 900 && !G.done; n++) { S.hold((n >= 24 && n < 24 + T) ? side : 0); S.stepN(1, D); if (B.ropeCut && !cut) cut = true; }
      S.hold(0); for (let n = 0; n < 1500 && !G.done; n++) S.stepN(1, D); return { lane, cut, net: B.netOn, forfeit: !!G.cleanForfeit, done: G.done, failed: !!G.failed }; });
    /* the chamber's walls are padded: a blade driven into one bounces */
    S.salt(77); S.newFF(5); { const G = S.g(), B = S.boss(); G.x = 6.2; G.y = B.y; G.vx = 6; G.vy = 0; G.w = 0; G.ang = Math.PI; for (let n = 0; n < 40 && !G.done; n++) S.stepN(1, D); out.padded = { failed: !!G.failed, x: +G.x.toFixed(2) }; }
    window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const L = r.levels || {};
  ok('a boss closes levels 5, 10, 15 ... and no other dive (not 4, not 6, not Endless)', L[5] && L[10] && L[15] && L[40] && !L[4] && !L[6] && !L.endless, JSON.stringify(L));
  ok('the shaft above the chamber is the very dive it was: its pieces and its Clean Slice line', !!r.same && r.same.pieces && r.same.line && r.same.deeper, JSON.stringify(r.same));
  ok('a blade down knife left alone: three hits exactly (held inside, one), the net lobs it each time, the boss down, the floor', !!r.win && r.win.hits === 3 && r.win.held === 1 && r.win.cleared && !r.win.skipped && !r.win.net && r.win.done && !r.win.failed && /hit1 lob hit2 lob hit3/.test(r.win.log), JSON.stringify(r.win));
  ok('the end panel names the boss', !!r.win && new RegExp(r.win.name + ' down').test(r.win.panel || ''), JSON.stringify(r.win && r.win.panel));
  ok('a handle down knife never hits; the net gives way after three lobs and the dive goes on to the floor', !!r.handle && r.handle.hits === 0 && r.handle.skipped && !r.handle.net && r.handle.done && !r.handle.failed, JSON.stringify(r.handle));
  ok('a restart resets the chamber', !!r.restart && r.restart.hits === 0 && r.restart.net && r.restart.lobs === 0, JSON.stringify(r.restart));
  ok('from every lane a hold toward the nearer rope cuts it: the net drops, Clean Slice forfeited, the dive ends alive', Array.isArray(r.ropes) && r.ropes.every(o => o.cut && !o.net && o.forfeit && o.done && !o.failed), JSON.stringify(r.ropes));
  ok("the chamber's walls are padded: a blade into one bounces", !!r.padded && !r.padded.failed, JSON.stringify(r.padded));
  ok('no page errors through the boss chamber', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}
/* the boss wears Astra's stages: cell 1 standing, cell 2 after the second hit, cell 3 (the reveal) after the third */
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(async () => { const S = window._S3, D = 1000 / 120, wait = ms => new Promise(q => setTimeout(q, ms)), out = {};
    S.salt(77); S.newFF(5); const t0 = performance.now(); while (!(S.boss().tex) && performance.now() - t0 < 20000) await wait(200);
    const B = S.boss(), off = () => +B.tex.offset.x.toFixed(3); out.loaded = !!B.tex; if (!B.tex) return out; out.c1 = off(); out.code = B.code.visible;
    window._S3skiprender = true; const G = S.g(); G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
    const seen = {}; for (let n = 0; n < 6000 && !G.done; n++) { S.stepN(1, D); seen[B.hits] = seen[B.hits] || { off: off(), crack: +B.crack.material.opacity.toFixed(2) }; }
    out.seen = seen; window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok("the boss wears Astra's stages: cell 1, a drawn crack after the first hit, cell 2 after the second, the reveal after the third", !!r && r.loaded && !r.code && r.c1 === 0.01 && r.seen[1].crack > 0.5 && r.seen[2].off === +((1.03) / 3).toFixed(3) && r.seen[3].off === +((2.03) / 3).toFixed(3), JSON.stringify(r));
  ok('no page errors with the boss painted', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}
'''
anchor = "\nconsole.log('\\n=== slice-3d: ' + pass"
if s.count(anchor)!=1: sys.exit('no end anchor')
s=s.replace(anchor, ROW+anchor)
open(p,'w',encoding='utf-8').write(s); print('E4 suite patch applied to', p)
