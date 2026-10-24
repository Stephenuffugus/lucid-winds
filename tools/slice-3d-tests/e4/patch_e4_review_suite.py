# Row [21] after the E4 review: replaces the first block's probe and checks (row [21] is new in E4, never shipped).
import io, sys
A=sys.argv[1] if len(sys.argv)>1 else '/workspaces/lucid-winds/satellites/slice-3d/audit-check.mjs'
s=io.open(A,encoding='utf-8').read()
i=s.index("    out.levels = {}; for (const l of [4, 5, 6, 10, 15, 40])")
j=s.index("  ok('no page errors through the boss chamber', errs.length === 0, JSON.stringify(errs));")
NEW=r'''    out.levels = {}; for (const l of [4, 5, 6, 10, 15, 40]) { S.salt(77); S.newFF(l); out.levels[l] = !!S.boss(); }
    S.salt(77); S.newEndless(); out.levels.endless = !!S.boss();
    /* the shaft above the chamber is the very dive it was: its pieces, and its Clean Slice line member by member (5.78 has a
       line of 12; 5.77 has none, so it could never tell: the review) */
    const lineOf = () => S.clean().req.map(q => q.x.toFixed(2) + '@' + q.y.toFixed(2)).join('|');
    S.salt(78); S.bossOff(true); S.newFF(5); const a = fp(S.world()), la = lineOf(), ma = S.clean().M; S.bossOff(false); S.salt(78); S.newFF(5); const b = fp(S.world()), lb = lineOf();
    out.same = { pieces: a === b, line: la === lb && ma > 0, M: ma, deeper: S.world().floorY < -300 };
    /* a fight: the knife falls from 20 u over the boss; hold(m, lobN, side, B, n) answers the hold m steps after the last lob
       (side: toward the boss's lane at that lob); pin: after hit 1 the knife is held inside the boss for 10 steps */
    const fight = (ang, hold, pin, salt) => { S.salt(salt || 77); S.newFF(5); const G = S.g(), B = S.boss(); G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = ang; S.hold(0);
      const log = [], tx = [], pay = []; let held = null, lobN = -1, side = 0;
      for (let n = 0; n < 6000 && !G.done; n++) { const h0 = B.hits, l0 = B.lobs, s0 = G.score; S.hold(hold ? hold(n - lobN, lobN, side, B, n) : 0); S.stepN(1, D);
        if (B.hits > h0) { log.push('hit' + B.hits); tx.push(B.tx); pay.push(G.score - s0); }
        if (B.lobs > l0) { log.push('lob'); lobN = n; side = B.tx > G.x ? 1 : -1; }
        if (pin && B.hits === 1 && held === null) { held = 0; for (let k = 0; k < 10; k++) { G.x = B.x; G.y = B.y + 0.5; G.vx = 0; G.vy = -0.2; S.stepN(1, D); } held = B.hits; } }
      S.hold(0); return { hits: B.hits, held, tx, pay, rope: !!B.ropeCut, cleared: B.cleared, skipped: B.skipped, net: B.netOn, done: G.done, failed: !!G.failed, t: +G.t.toFixed(1), log: log.join(' '), lab: document.getElementById('go-lab').textContent, name: B.name }; };
    /* left alone (nothing teleported): three hits, one lane over each time (a side, then the middle), 600 paid once, at the third */
    out.win = fight(Math.PI / 2);
    for (let n = 0; n < 600 && !document.getElementById('s-go').classList.contains('on'); n++) S.stepN(1, D);
    out.win.panel = document.getElementById('go-lab').textContent;
    out.held = fight(Math.PI / 2, null, true);
    out.handle = fight(-Math.PI / 2);
    /* as played: a 0.1 s tap toward the boss 0.1 s after every lob clears the fight (two dives); a 0.25 s hold overshoots and
       never cuts a rope (the review: a tap toward the boss's new lane cut its rope in 35 of 40 fights) */
    const tap = (R, T) => (m, lobN, side) => (lobN >= 0 && m >= R && m < R + T) ? side : 0;
    out.taps = [77, 5].map(sd => fight(Math.PI / 2, tap(12, 12), false, sd));
    out.heavy = fight(Math.PI / 2, tap(12, 30));
    /* the review's trap: after hit 1, toward the boss for 0.4 s from the first lob, then away for 0.2 s; a handle first knife
       between a side lane boss and the padded wall juggled for ever. It must end */
    const trap = () => { let L = -1, sd = 0; return (m, lobN, side, B, n) => { if (L < 0 && B.hits === 1 && B.lobs === 1) { L = n; sd = B.tx > 0 ? 1 : -1; } if (L < 0) return 0; const k = n - L; return k < 48 ? sd : ((k >= 72 && k < 96) ? -sd : 0); }; };
    out.trap = fight(Math.PI / 2, trap());
    /* a hit resets the lob count: three lobs, then a hit; the next landing is lob one, never the give way */
    S.salt(77); S.newFF(5); { const G = S.g(), B = S.boss(); B.lobs = 3; G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
      let n = 0; for (; n < 3000 && B.hits < 1; n++) S.stepN(1, D); const after = B.lobs; for (; n < 3000 && B.lobs < 1 && !B.skipped; n++) S.stepN(1, D);
      out.reset = { hits: B.hits, after, lobs: B.lobs, skipped: B.skipped }; }
    /* a restart resets the chamber */
    S.salt(77); S.newFF(5); out.restart = { hits: S.boss().hits, net: S.boss().netOn, lobs: S.boss().lobs };
    /* the ropes (the review): with the boss in the middle, a deliberate hold toward either one on a lob cuts it (the net drops,
       Clean Slice forfeited, nothing paid, the dive ends alive) and the boss is out of the fight after it; with the boss in a
       side lane the rope on its side holds under the same kind of hold */
    out.ropes = [[0, -1, 42], [0, 1, 42], [-4.8, -1, 12], [4.8, 1, 12]].map(([lane, side, T]) => { S.salt(77); S.newFF(5); const G = S.g(), B = S.boss(); B.hits = 1; B.lobs = 1; B.x = B.tx = lane; G.x = lane; G.y = B.netY + 1; G.vx = 0; G.vy = Math.sqrt(2 * 21 * ((B.y + 5) - B.netY)); G.w = 0; G.ang = Math.PI / 2;
      let cut = false, inert = null; for (let n = 0; n < 900 && !G.done && !cut && B.tx === lane; n++) { S.hold((n >= 24 && n < 24 + T) ? side : 0); S.stepN(1, D); if (B.ropeCut) cut = true; }
      S.hold(0); if (cut) { const h = B.hits; G.x = B.x; G.y = B.y + B.r + 1.4; G.vx = 0; G.vy = -6; G.w = 0; G.ang = Math.PI / 2; let popped = false; for (let k = 0; k < 90; k++) { S.stepN(1, D); if (G.vy > 0) popped = true; } inert = B.hits === h && !popped; }
      for (let n = 0; n < 6000 && !G.done; n++) S.stepN(1, D); return { lane, side, cut, inert, net: B.netOn, forfeit: !!G.cleanForfeit, score: G.score, done: G.done, failed: !!G.failed }; });
    /* a knife on its way in never cuts a rope: falling past one blade first, and (not yet in the fight) rising past one */
    out.inRope = [[1, -12], [-1, -12], [1, 5]].map(([sd, vy]) => { S.salt(77); S.newFF(5); const G = S.g(), B = S.boss(), rx = B.ropes[sd > 0 ? 1 : 0];
      G.x = rx - sd * 0.6; G.y = B.y + 6; G.vx = 0; G.vy = vy; G.w = 0; G.ang = sd > 0 ? Math.PI : 0;
      for (let n = 0; n < 24 && !G.done; n++) S.stepN(1, D); return !!B.ropeCut; });
    /* the end panel: a skipped boss forfeits Clean Slice (every target cut first), by a rope or by the net giving way; a boss
       fought down keeps it (5.78 has a line of 12) */
    const panelAfter = kind => { S.salt(78); S.newFF(5); const G = S.g(), B = S.boss(), M = S.world().clean.M; G.cleanN = M;
      if (kind === 'rope') { B.hits = 1; B.lobs = 1; B.x = B.tx = 0; G.x = 0; G.y = B.netY + 1; G.vx = 0; G.vy = Math.sqrt(2 * 21 * ((B.y + 5) - B.netY)); G.w = 0; G.ang = Math.PI / 2;
        for (let n = 0; n < 900 && !G.done && !B.ropeCut; n++) { S.hold((n >= 24 && n < 66) ? 1 : 0); S.stepN(1, D); } S.hold(0); }
      else { G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = kind === 'net' ? -Math.PI / 2 : Math.PI / 2; S.hold(0); }
      for (let n = 0; n < 6000 && !G.done; n++) S.stepN(1, D);
      const go = document.getElementById('s-go'); for (let n = 0; n < 600 && !go.classList.contains('on'); n++) S.stepN(1, D);
      return { kind, M, skipped: B.skipped, cleared: B.cleared, rope: !!B.ropeCut, failed: !!G.failed, won: document.getElementById('go-clean').classList.contains('won'), text: document.getElementById('go-clean-t').textContent, lab: document.getElementById('go-lab').textContent }; };
    out.cleanSkip = panelAfter('rope'); out.cleanNet = panelAfter('net'); out.cleanWin = panelAfter('win');
    /* the chamber's walls are padded: a blade driven into one bounces, and from the line where the old floor caught a falling
       knife (the review: the chamber's top 2 u killed) arrivals with the shaft cleared all live; up in the shaft it sticks */
    const clearShaft = Wd => ['items', 'slabs', 'pads', 'crystals', 'thorns', 'wasps', 'planks', 'verbs', 'blocks'].forEach(k => { if (Wd[k]) Wd[k] = []; });
    S.salt(77); S.newFF(5); { const G = S.g(), B = S.boss(); G.x = 6.2; G.y = B.y; G.vx = 6; G.vy = 0; G.w = 0; G.ang = Math.PI; for (let n = 0; n < 40 && !G.done; n++) S.stepN(1, D); out.padded = { failed: !!G.failed, x: +G.x.toFixed(2) }; }
    out.mouth = [[-4, 45, 0, -4], [-5, 68, 0, -4], [4, 135, 0, 4]].map(c => { S.salt(77); S.newFF(5); const G = S.g(), Wd = S.world(); clearShaft(Wd);
      G.x = c[0]; G.y = Wd.floorY + 36 + 14; G.vy = -19; G.vx = c[3]; G.ang = c[1] * Math.PI / 180; G.w = c[2]; S.hold(0);
      for (let n = 0; n < 7200 && !G.done; n++) S.stepN(1, D); return { done: G.done, failed: !!G.failed }; });
    S.salt(77); S.newFF(5); { const G = S.g(), Wd = S.world(); clearShaft(Wd); G.x = 6.2; G.y = Wd.floorY + 80; G.vx = 6; G.vy = 0; G.w = 0; G.ang = Math.PI;
      for (let n = 0; n < 40 && !G.done; n++) S.stepN(1, D); out.shaftWall = { failed: !!G.failed, done: G.done }; }
    window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const L = r.levels || {}, w = r.win || {};
  ok('a boss closes levels 5, 10, 15 ... and no other dive (not 4, not 6, not Endless)', L[5] && L[10] && L[15] && L[40] && !L[4] && !L[6] && !L.endless, JSON.stringify(L));
  ok('the shaft above the chamber is the very dive it was: its pieces and its Clean Slice line, member by member', !!r.same && r.same.pieces && r.same.line && r.same.deeper, JSON.stringify(r.same));
  ok('a blade down knife left alone: three hits, the net lobs it each time, one lane over each time, 600 paid once at the third, the boss down, the floor', w.hits === 3 && w.cleared && !w.skipped && !w.net && w.done && !w.failed && /^hit1 lob hit2 lob hit3$/.test(w.log) && Array.isArray(w.tx) && Math.abs(w.tx[0]) === 4.8 && w.tx[1] === 0 && (w.pay || []).join() === '0,0,600', JSON.stringify(w));
  ok('a knife held inside the boss after a hit counts it once', !!r.held && r.held.held === 1 && r.held.done && !r.held.failed, JSON.stringify(r.held));
  ok('the end panel names the boss', !!r.win && new RegExp(r.win.name + ' down').test(r.win.panel || ''), JSON.stringify(r.win && r.win.panel));
  ok('a handle down knife never hits; the net gives way at its fourth landing (three lobs) and the dive goes on to the floor', !!r.handle && r.handle.hits === 0 && r.handle.skipped && !r.handle.net && r.handle.done && !r.handle.failed && r.handle.log === 'lob lob lob lob', JSON.stringify(r.handle));
  ok('as played: a 0.1 s tap toward the boss after each lob clears the fight; a 0.25 s hold never cuts a rope and the dive ends', Array.isArray(r.taps) && r.taps.every(o => o.cleared && !o.skipped && !o.rope && o.done && !o.failed) && !!r.heavy && !r.heavy.rope && r.heavy.done && !r.heavy.failed, JSON.stringify([r.taps, r.heavy]));
  ok("the review's trap (a handle first knife between a side lane boss and the wall) ends", !!r.trap && r.trap.done && !r.trap.failed, JSON.stringify(r.trap));
  ok('a hit resets the lob count (the next landing is lob one, not the give way)', !!r.reset && r.reset.hits === 1 && r.reset.after === 0 && r.reset.lobs === 1 && !r.reset.skipped, JSON.stringify(r.reset));
  ok('a restart resets the chamber', !!r.restart && r.restart.hits === 0 && r.restart.net && r.restart.lobs === 0, JSON.stringify(r.restart));
  ok('with the boss in the middle a hold toward either rope cuts it (net down, Clean Slice forfeited, nothing paid, the boss out of the fight, alive); a side lane boss keeps its own rope', Array.isArray(r.ropes) && r.ropes.filter(o => o.lane === 0).every(o => o.cut && o.inert && !o.net && o.forfeit && o.score === 0 && o.done && !o.failed) && r.ropes.filter(o => o.lane !== 0).every(o => !o.cut && o.done && !o.failed), JSON.stringify(r.ropes));
  ok('a knife on its way in never cuts a rope (falling past one blade first, or rising before the fight)', Array.isArray(r.inRope) && r.inRope.length === 3 && r.inRope.every(c => c === false), JSON.stringify(r.inRope));
  ok('a skipped boss forfeits Clean Slice on the end panel (by a rope or by the net giving way, with no "down" line); a boss fought down keeps it', [r.cleanSkip, r.cleanNet].every(o => !!o && o.M > 0 && o.skipped && !o.cleared && !o.failed && !o.won && /, boss skipped$/.test(o.text) && !/ down$/.test(o.lab)) && r.cleanSkip.rope && !r.cleanNet.rope && !!r.cleanWin && r.cleanWin.cleared && !r.cleanWin.failed && r.cleanWin.won && r.cleanWin.text === 'Clean Slice', JSON.stringify([r.cleanSkip, r.cleanNet, r.cleanWin]));
  ok("the chamber's walls are padded from the old floor's line down (a blade into one bounces); up in the shaft a blade still sticks", !!r.padded && !r.padded.failed && Array.isArray(r.mouth) && r.mouth.every(o => o.done && !o.failed) && !!r.shaftWall && r.shaftWall.failed, JSON.stringify([r.padded, r.mouth, r.shaftWall]));
'''
s=s[:i]+NEW+s[j:]
a="r.seen[3].off === +((2.03) / 3).toFixed(3)"
assert s.count(a)==1
s=s.replace(a, a+" && r.seen[2].crack === 0 && r.seen[3].crack === 0")
io.open(A,'w',encoding='utf-8').write(s); print('row 21 rewritten after the review')
