E='/workspaces/Litter_Bug/bug-engine.js'
s=open(E).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)
rep("""    var patternSeed = Math.floor(R() * 1000);
    return { N: N, seg: seg, thoraxI: thoraxI, plan: plan, wSweep: wSweep, hornCurl: hornCurl,""",
"""    var patternSeed = Math.floor(R() * 1000);
    /* ── VOCABULARY PASS 2 (2026-09-05). ⛔ Appended after patternSeed, cosmetic only, the grade
       is identical for every codeblock (fixtures/grades-3000.json is the gate). ──
       segShape  0 round, 1 teardrop scales that point at the tail, 2 flat, 3 ringed
       irid      an iridescent sweep across the body (22%)
       wingTint  0 the palette accent, 1 leaning to the secondary, 2 leaning to the primary
       legPairs  1, or 2 on the thorax (30%) */
    var segShape = (R() < 0.45) ? 0 : 1 + Math.floor(R() * 3);
    var irid = (R() < 0.22) ? 1 : 0;
    var wingTint = (R() < 0.55) ? 0 : 1 + Math.floor(R() * 2);
    var legPairs = (R() < 0.3) ? 2 : 1;
    return { N: N, seg: seg, thoraxI: thoraxI, plan: plan, wSweep: wSweep, hornCurl: hornCurl,""")
rep("""      spineKind: spineKind, antStyle: antStyle, eyeStyle: eyeStyle, legStyle: legStyle, headKind: headKind,
      patternSeed: patternSeed };""",
"""      spineKind: spineKind, antStyle: antStyle, eyeStyle: eyeStyle, legStyle: legStyle, headKind: headKind,
      patternSeed: patternSeed, segShape: segShape, irid: irid, wingTint: wingTint, legPairs: legPairs };""")
rep("""        legStyle = P.legStyle || 0, headKind = P.headKind || 0, pSeed = P.patternSeed || 0;""",
"""        legStyle = P.legStyle || 0, headKind = P.headKind || 0, pSeed = P.patternSeed || 0,
        segShape = P.segShape || 0, irid = P.irid || 0, wingTint = P.wingTint || 0, legPairs = P.legPairs || 1;""")
# wing tint + iridescence gradient in the defs
rep("""    var defs = '<defs>' + matDefs + grad('gh' + uid, secondary) + grad('gw' + uid, lt(accent, 0.1)) + bodyFx + celGrad + '</defs>';""",
"""    var wingCol = wingTint === 1 ? mix(accent, secondary, 0.5) : (wingTint === 2 ? mix(accent, primary, 0.45) : accent);
    var iridA = lt(secondary, 0.35), iridB = mix(accent, '#b48cff', 0.5);
    var iridDef = irid ? '<linearGradient id="gi' + uid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + iridA + '" stop-opacity="0"/><stop offset="0.42" stop-color="' + iridA + '" stop-opacity="0.6"/><stop offset="0.58" stop-color="' + iridB + '" stop-opacity="0.6"/><stop offset="1" stop-color="' + iridB + '" stop-opacity="0"/></linearGradient>' : '';
    var defs = '<defs>' + matDefs + grad('gh' + uid, secondary) + grad('gw' + uid, lt(wingCol, 0.1)) + iridDef + bodyFx + celGrad + '</defs>';""")
# body segments take a shape
rep("""    seg.forEach(function (s, i) { var isHead = (i === N - 1), gid = isHead ? ('gh' + uid) : ('gb' + segMat[i] + uid);
      body += '<circle cx="' + q(s.x) + '" cy="' + q(s.y) + '" r="' + q(s.r) + '" fill="url(#' + gid + ')"' + (merge ? '' : ' stroke="' + ol + '" stroke-width="2.4"') + '/>';""",
"""    /* one segment, in the body's shape: round, a teardrop scale pointing at the tail, flat, or
       round with a ring. The head is always round. The same function paints the iridescent
       sweep so it sits exactly on the segment it colours. */
    function segShapePath(s, i, fillAttr, strokeAttr, ring) {
      var x = s.x, y = s.y, r = s.r, k = (i === N - 1) ? 0 : segShape, out;
      if (k === 1) return '<path d="M ' + q(x - r * 1.25) + ' ' + q(y) + ' Q ' + q(x - r * 0.4) + ' ' + q(y - r * 1.02) + ' ' + q(x + r * 0.15) + ' ' + q(y - r)
        + ' A ' + q(r) + ' ' + q(r) + ' 0 0 1 ' + q(x + r * 0.15) + ' ' + q(y + r) + ' Q ' + q(x - r * 0.4) + ' ' + q(y + r * 1.02) + ' ' + q(x - r * 1.25) + ' ' + q(y) + ' Z"' + fillAttr + strokeAttr + '/>';
      if (k === 2) return '<ellipse cx="' + q(x) + '" cy="' + q(y + r * 0.06) + '" rx="' + q(r * 1.12) + '" ry="' + q(r * 0.84) + '"' + fillAttr + strokeAttr + '/>';
      out = '<circle cx="' + q(x) + '" cy="' + q(y) + '" r="' + q(r) + '"' + fillAttr + strokeAttr + '/>';
      if (k === 3 && ring) out += '<circle cx="' + q(x) + '" cy="' + q(y) + '" r="' + q(r * 0.76) + '" fill="none" stroke="' + ol + '" stroke-width="1" opacity="0.4"/>';
      return out;
    }
    var iridLayer = '';
    seg.forEach(function (s, i) { var isHead = (i === N - 1), gid = isHead ? ('gh' + uid) : ('gb' + segMat[i] + uid);
      body += segShapePath(s, i, ' fill="url(#' + gid + ')"', (merge ? '' : ' stroke="' + ol + '" stroke-width="2.4"'), true);
      if (irid && !isHead && !lod) iridLayer += segShapePath(s, i, ' fill="url(#gi' + uid + ')"', ' opacity="0.55"', false);""")
# the iridescent sweep rides on top of the patterns, under the plates
rep("""    var patterns = '';""", """    var patterns = iridLayer;""")
# a second pair of legs on the thorax
rep("""      if (!lod && legStyle === 1) legs += '<path d="M ' + q(s.x - 6) + ' ' + q(ky + 10) + ' l -3 2 M ' + q(s.x - 6) + ' ' + q(ky + 10) + ' l 3 2" fill="none" stroke="' + ol + '" stroke-width="1.4" str""",
"""      if (legPairs === 2 && i === thoraxI) {   // a second pair on the thorax, a step forward and a touch shorter
        legs += '<path d="M ' + q(s.x + 5) + ' ' + q(s.y + s.r * 0.5) + ' L ' + q(s.x + 1) + ' ' + q(ky - 1) + ' L ' + q(s.x - 3) + ' ' + q(ky + 7) + '" fill="none" stroke="' + dk(ol, -0.2) + '" stroke-width="' + (2 + lw * 0.8).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>'
          + '<path d="M ' + q(s.x + 9) + ' ' + q(s.y + s.r * 0.5) + ' L ' + q(s.x + 5) + ' ' + q(ky - 1) + ' L ' + q(s.x + 2) + ' ' + q(ky + 8) + '" fill="none" stroke="' + ol + '" stroke-width="' + (2 + lw * 0.8).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>';
      }
      if (!lod && legStyle === 1) legs += '<path d="M ' + q(s.x - 6) + ' ' + q(ky + 10) + ' l -3 2 M ' + q(s.x - 6) + ' ' + q(ky + 10) + ' l 3 2" fill="none" stroke="' + ol + '" stroke-width="1.4" str""")
open(E,'w').write(s); print('engine vocab2 patched')

C='/workspaces/Litter_Bug/check.js'
s=open(C).read()
anchor="    // ══ A CORRUPT SAVE ════════════════════════════════════════════════\n"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    // ══ VOCABULARY 2 ══════════════════════════════════════════════════
    group('vocabulary 2: new shapes on the body, not one grade moved');
    const v2Page = await open(FILE + '?lbtest=1');
    const v2 = await v2Page.evaluate(async () => {
      const E = window.BUG_ENGINE;
      const fx = await (await fetch('fixtures/grades-3000.json?' + Math.random())).json();
      let moved = 0, n = 0;
      for (const h in fx) { n++; const g = E.bugGrade(h); if (g.grade + ':' + g.score !== fx[h]) moved++; }
      const seg = [0, 0, 0, 0]; let irid = 0, pairs = 0, tint = 0, bad = 0, tear = 0, iridDrawn = 0, m = 600;
      for (let i = 0; i < m; i++) {
        const rr = E.seededRng('v2-' + i); let h = ''; for (let k = 0; k < 64; k++) h += Math.floor(rr() * 16).toString(16);
        const P = E.bugPlan(h); seg[P.segShape]++; if (P.irid) irid++; if (P.legPairs === 2) pairs++; if (P.wingTint) tint++;
        if (i < 200) { const svg = E._generateBugSVG(h, 150, 31); if (/NaN|undefined/.test(svg)) bad++; if (P.segShape === 1 && /A [\d.]+ [\d.]+ 0 0 1/.test(svg)) tear++; if (P.irid && svg.indexOf('id="gi') >= 0) iridDrawn++; }
      }
      return { n, moved, seg, irid, pairs, tint, m, bad, tear, iridDrawn };
    });
    await v2Page.close();
    ok(v2.n === 3000 && v2.moved === 0, 'three thousand bugs grade and score exactly as before the pass', v2.moved + ' moved of ' + v2.n);
    ok(v2.seg[0] > v2.m * 0.35 && v2.seg[0] < v2.m * 0.55 && v2.seg[1] > 0 && v2.seg[2] > 0 && v2.seg[3] > 0, 'segment shapes roll: about half stay round, the three new shapes all occur', v2.seg);
    ok(v2.irid > v2.m * 0.12 && v2.irid < v2.m * 0.32 && v2.pairs > v2.m * 0.2 && v2.pairs < v2.m * 0.4 && v2.tint > v2.m * 0.3, 'iridescence, a second leg pair and a wing tint roll at their rates', { irid: v2.irid, pairs: v2.pairs, tint: v2.tint });
    ok(v2.bad === 0 && v2.tear > 0 && v2.iridDrawn > 0, 'two hundred renders are clean, teardrops and the sweep reach the picture', { bad: v2.bad, tear: v2.tear, iridDrawn: v2.iridDrawn });

"""+anchor)
open(C,'w').write(s); print('gate patched')
