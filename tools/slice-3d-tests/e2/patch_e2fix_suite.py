# The E2 review's checks, over the E2 commit's audit-check.mjs
import sys
p=sys.argv[1] if len(sys.argv)>1 else '/workspaces/lucid-winds/satellites/slice-3d/audit-check.mjs'
s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    if s.count(old)!=1: sys.exit('miss %r'%old[:80])
    s=s.replace(old,new)
rep("""  ['s3d_dex', '5'], ['s3d_dex', '[1,2]'], ['s3d_dex', '{"mossy_canyon":"yes","nowhere":1,"glowcave":{}}']""",
    """  ['s3d_dex', '5'], ['s3d_dex', '[1,2]'], ['s3d_dex', '{"mossy_canyon":"yes","nowhere":1,"glowcave":{}}'], ['s3d_dex', '{"hasOwnProperty":1}']""")
rep("""    S.salt(77); S.newEndless(); out.endless = { clean: !!S.world().clean, req: S.world().slabs.filter(s => s.req).length };""",
    """    S.salt(77); S.newEndless(); out.endless = { clean: !!S.world().clean, req: S.world().slabs.filter(s => s.req).length };
    /* the review's dive: its last stack runs under the floor; no target may sit where the knife lands before it */
    S.salt(158384); S.newFF(4); { const W = S.world(); out.under = { M: W.clean.M, buried: W.slabs.filter(s => s.req && s.y + 0.575 <= W.floorY).length }; }""")
rep("""  ok('Endless has no line', !!r.endless && !r.endless.clean && r.endless.req === 0, JSON.stringify(r.endless));""",
    """  ok('Endless has no line', !!r.endless && !r.endless.clean && r.endless.req === 0, JSON.stringify(r.endless));
  ok('no target sits under the floor (the review\\'s level 4 dive)', !!r.under && r.under.M > 0 && r.under.buried === 0, JSON.stringify(r.under));""")
# two tabs: a find another tab already told is not told again
rep("""    localStorage.setItem('s3d_dex', JSON.stringify({ mossy_canyon: 1, deep_tide: 1 }));""",
    """    /* another tab told this find after this one booted: it is not told again here */
    for (const k in S.dex()) delete S.dex()[k]; localStorage.setItem('s3d_dex', JSON.stringify({ mossy_canyon: 1 }));
    S.salt(77); S.newFF(1); { const G = S.g(), d = S.clean().disc; G.x = d.x; G.y = topOf(d).y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2;
      for (let n = 0; n < 160 && !d.cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
      G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel(); out.otherTab = document.getElementById('go-find').classList.contains('on'); }
    localStorage.setItem('s3d_dex', JSON.stringify({ mossy_canyon: 1, deep_tide: 1 }));""")
rep("""  ok("two tabs: the other tab's finds survive this tab's save", !!r.tabs && r.tabs.mossy_canyon === 1 && r.tabs.deep_tide === 1, JSON.stringify(r.tabs));""",
    """  ok("two tabs: the other tab's finds survive this tab's save", !!r.tabs && r.tabs.mossy_canyon === 1 && r.tabs.deep_tide === 1, JSON.stringify(r.tabs));
  ok('two tabs: a find the other tab already told is not told again', r.otherTab === false, JSON.stringify(r.otherTab));""")
# the paint block: eviction again on the second visit
rep("""    S.salt(5); S.newFF(26); out.texLeft = S.gpuTex(); await settle(); await wait(800); out.back = S.gpuTex();""",
    """    S.salt(5); S.newFF(26); out.texLeft = S.gpuTex(); await settle(); await wait(800); out.back = S.gpuTex();
    S.salt(5); S.newFF(31); out.texNow2 = S.gpuTex();   /* the second time round it leaves again (the review: the first cut evicted once a session) */""")
rep("""  ok("a world's paintings leave the GPU when a run in another world starts, and come back when it is shown again", !!r && r.ev > 0 && r.texNow < r.tex0 && r.back > r.texLeft, JSON.stringify(r));""",
    """  ok("a world's paintings leave the GPU when a run in another world starts, and come back when it is shown again", !!r && r.ev > 0 && r.texNow < r.tex0 && r.back > r.texLeft, JSON.stringify(r));
  ok('and they leave again the second time round', !!r && r.texNow2 < r.back, JSON.stringify(r));""")
# the test lens: pin the line, a non-line cut never counts, the band's promises, the dex read at boot and on a landed dive
rep("""    S.salt(77); S.newEndless(); out.endless = { clean: !!S.world().clean, req: S.world().slabs.filter(s => s.req).length };""",
"""    S.salt(77); S.newEndless(); out.endless = { clean: !!S.world().clean, req: S.world().slabs.filter(s => s.req).length };
    /* the line each of six dives names, pinned (from the shipped rule in node: tools/slice-3d-tests/e2/world.js); the looser
       corridor the plan rejected names a different line on five of them */
    out.pinned = {}; for (const [l, sd] of [[1, 77], [8, 80], [14, 78], [23, 77], [33, 77], [38, 77]]) { S.salt(sd); S.newFF(l); const m = new Map();
      S.world().slabs.forEach(s => { if (s.req) { if (!m.has(s.stk)) m.set(s.stk, []); m.get(s.stk).push(s); } });
      out.pinned[l + '.' + sd] = [...m.values()].map(a => { a.sort((u, v) => v.y - u.y); return a[0].x.toFixed(2) + '@' + a[0].y.toFixed(2) + 'x' + a.length; }).sort().join('|'); }
    /* only line stacks wear a band, on their top slab; a cut takes the band with the slab; a stack off the line counts nothing */
    S.salt(77); S.newFF(1); { const W = S.world(), byS = new Map(); W.slabs.forEach(s => { if (!byS.has(s.stk)) byS.set(s.stk, []); byS.get(s.stk).push(s); });
      let onlyLine = true; byS.forEach(a => { a.sort((u, v) => v.y - u.y); a.forEach((s, i) => { if (s.band && !(s.req && i === 0)) onlyLine = false; }); });
      const off = [...byS.values()].find(a => a.length >= 7 && !a[0].req), G = S.g(); let offCount = null;
      if (off) { G.x = off[0].x; G.y = off[0].y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
        for (let n = 0; n < 240 && G.y > off[off.length - 1].y - 2; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } offCount = { cut: off.filter(s => s.cut).length, n: S.clean().n }; }
      const line = [...byS.values()].find(a => a[0].req), band = line[0].band; G.x = line[0].x; G.y = line[0].y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2;
      for (let n = 0; n < 40 && !line[0].cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
      out.band = { onlyLine, off: offCount, gone: !!band && !band.parent && line[0].cut }; }""")
rep("""  ok('no target sits under the floor (the review\\'s level 4 dive)', !!r.under && r.under.M > 0 && r.under.buried === 0, JSON.stringify(r.under));""",
"""  ok('no target sits under the floor (the review\\'s level 4 dive)', !!r.under && r.under.M > 0 && r.under.buried === 0, JSON.stringify(r.under));
  const PIN = { '1.77': '-0.40@-67.41x10|-2.88@-142.98x7', '8.80': '2.75@-39.11x10', '14.78': '-0.43@-109.44x7', '23.77': '0.96@-47.01x7|2.95@-110.89x9|3.78@-126.27x12', '33.77': '3.26@-102.03x13', '38.77': '4.63@-200.59x11|4.65@-181.25x12|5.06@-132.78x13' };
  ok('the line six pinned dives name is the shipped rule\\'s (a looser corridor names another)', !!r.pinned && Object.keys(PIN).every(k => r.pinned[k] === PIN[k]), JSON.stringify(r.pinned));
  ok('only line stacks wear the band, on their top slab; a cut takes it; a stack off the line counts nothing', !!r.band && r.band.onlyLine && r.band.gone && !!r.band.off && r.band.off.cut > 0 && r.band.off.n === 0, JSON.stringify(r.band));""")
rep("""/* SS35 with the paint on: a world's paintings leave the GPU""","""/* a find already in s3d_dex at boot is not told again; a find on a dive that LANDS is told (the cleanResults(true) path) */
{
  const b1 = await boot(`(()=>{try{localStorage.setItem('s3d_dex','{"mossy_canyon":1}');}catch(e){}})()`), b2 = await boot(`(()=>{try{localStorage.removeItem('s3d_dex');}catch(e){}})()`);
  const findLand = async (p, land) => p.evaluate(land => { const S = window._S3, D = 1000 / 120; window._S3skiprender = true; S.salt(77); S.newFF(1);
    const G = S.g(), d = S.clean().disc, top = S.world().slabs.filter(s => s.stk === d.stk).sort((u, v) => v.y - u.y)[0];
    G.x = d.x; G.y = top.y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0); for (let n = 0; n < 160 && !d.cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    if (land) { const W = S.world(); G.x = 0; G.y = W.floorY + 3; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2; const go = document.getElementById('s-go'); go.classList.remove('on'); for (let n = 0; n < 700 && !go.classList.contains('on'); n++) S.stepN(1, D); }
    else { G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel(); }
    window._S3skiprender = false; return { cut: d.cut, landed: !!G.done && !G.failed, told: document.getElementById('go-find').classList.contains('on') }; }, land);
  let a, b; try { a = await findLand(b1.p, false); b = await findLand(b2.p, true); } catch (e) { a = { error: String(e).slice(0, 200) }; }
  ok('a find already in s3d_dex at boot is not told again; a find on a landed dive is told', !!a && a.cut && !a.told && !!b && b.cut && b.landed && b.told && b1.errs.length === 0 && b2.errs.length === 0, JSON.stringify({ a, b }));
  await b1.ctx.close(); await b2.ctx.close();
}
/* SS35 with the paint on: a world's paintings leave the GPU""")
open(p,'w',encoding='utf-8').write(s); print('E2 fix checks applied to', p)
