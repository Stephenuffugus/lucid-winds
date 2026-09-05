E='/workspaces/Litter_Bug/bug-engine.js'
s=open(E).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)

# ── bugGrade: every mark carries the growth threshold the renderer draws it at ──
rep("""    var P = bugPlan(codeblock), pl = P.plan, marks = [], score = 0, i;
    function add(n, label) { score += n; if (label) marks.push(label); }""",
"""    var P = bugPlan(codeblock), pl = P.plan, marks = [], parts = [], score = 0, i;
    /* `parts` runs parallel to `marks` and carries the GROWTH THRESHOLD the renderer draws
       each part at (0 = drawn from the first day). A freshly minted bug is drawn at growth
       MINT_GROWTH, so a LEGENDARY can be a plain grub with nine promises; the page reads
       these thresholds to say which promises are kept yet. ⛔ scoring unchanged. */
    function add(n, label, th) { score += n; if (label) { marks.push(label); parts.push({ label: label, th: th || 0 }); } }""")
rep("""      if (P.wingKind === 2) add(9, 'elytra shell');
      else if (P.wingKind === 1) add(7, 'four wings');
      else add(4, 'membrane wings');""",
"""      if (P.wingKind === 2) add(9, 'elytra shell', pl.wings);
      else if (P.wingKind === 1) add(7, 'four wings', pl.wings);
      else add(4, 'membrane wings', pl.wings);""")
rep("""    if (pl.horns !== 999) add(5, 'horns');
    if (pl.pincers !== 999) add(P.jawKind === 3 ? 8 : 5, P.jawKind === 3 ? 'hooked pincers' : 'pincers');
    if (pl.tail !== 999) add(P.tailKind === 2 ? 8 : 5, P.tailKind === 2 ? 'barbed stinger' : 'stinger tail');
    if (pl.extraEyes !== 999) add(7, 'extra eyes');
    var sp = 0;
    for (i = 0; i < pl.spines.length; i++) if (pl.spines[i] !== 999) sp++;
    if (sp >= P.N) add(sp * 3 + 4, 'full spine ridge');
    else if (sp) add(sp * 3, sp + ' dorsal spine' + (sp > 1 ? 's' : ''));""",
"""    if (pl.horns !== 999) add(5, 'horns', pl.horns);
    if (pl.pincers !== 999) add(P.jawKind === 3 ? 8 : 5, P.jawKind === 3 ? 'hooked pincers' : 'pincers', pl.pincers);
    if (pl.tail !== 999) add(P.tailKind === 2 ? 8 : 5, P.tailKind === 2 ? 'barbed stinger' : 'stinger tail', pl.tail);
    if (pl.extraEyes !== 999) add(7, 'extra eyes', pl.extraEyes);
    var sp = 0, spTh = 1;
    for (i = 0; i < pl.spines.length; i++) if (pl.spines[i] !== 999) { sp++; if (pl.spines[i] < spTh) spTh = pl.spines[i]; }
    if (sp >= P.N) add(sp * 3 + 4, 'full spine ridge', spTh);
    else if (sp) add(sp * 3, sp + ' dorsal spine' + (sp > 1 ? 's' : ''), spTh);""")
rep("""    return { grade: GRADES[g], score: score, marks: marks };
  }""",
"""    return { grade: GRADES[g], score: score, marks: marks, parts: parts };
  }
  /* the growth a bug is drawn at on the day it is minted: index.html's growLvl(1) is 8, and
     _generateBugSVG reads growth = level / 22. Kept here so the lore and the page agree. */
  var MINT_GROWTH = 8 / 22;""")
# ── the part line prefers a part you can SEE at mint ──
rep("""  function bugPartLine(codeblock) {
    var c = bugPartCandidates(codeblock), rng = seededRng(codeblock + '|parts');
    // one of the three loudest parts, so a bug with a stinger and a shell is
    // not always described by the stinger
    var key = c[Math.floor(rng() * Math.min(3, c.length))];""",
"""  /* the growth threshold a part line's part is drawn at; 0 for parts drawn from day one */
  function partThreshold(codeblock, key) {
    var P = bugPlan(codeblock), pl = P.plan, i, m = 1;
    if (WING_KEYS[key]) return pl.wings;
    if (key === 'hornsCurved' || key === 'hornsAntler' || key === 'hornsKnob') return pl.horns;
    if (key === 'hookedPincers' || key === 'pincers') return pl.pincers;
    if (key === 'barbed' || key === 'forkedTail' || key === 'plainTail') return pl.tail;
    if (key === 'extraEyes') return pl.extraEyes;
    if (key === 'fullRidge' || key === 'quills' || key === 'knobSpines' || key === 'spines') { for (i = 0; i < pl.spines.length; i++) if (pl.spines[i] !== 999 && pl.spines[i] < m) m = pl.spines[i]; return m; }
    return 0;
  }
  function bugPartLine(codeblock) {
    var c = bugPartCandidates(codeblock), rng = seededRng(codeblock + '|parts');
    // ⛔ a line about a part you cannot see yet is a lie on the mint screen: prefer the parts
    // drawn at mint growth, and only fall back to a promise when nothing else is there
    var now = c.filter(function (k) { return partThreshold(codeblock, k) <= MINT_GROWTH; });
    var pool = now.length ? now : c;
    // one of the three loudest, so a bug with a stinger and a shell is not always the stinger
    var key = pool[Math.floor(rng() * Math.min(3, pool.length))];""")
s=s.replace("bugIdentity: bugIdentity, bugPartLine: bugPartLine,", "bugIdentity: bugIdentity, bugPartLine: bugPartLine, partThreshold: partThreshold, MINT_GROWTH: MINT_GROWTH,",1)
assert "partThreshold: partThreshold" in s
open(E,'w').write(s); print('engine growth patched')

# ── the page ──
P='/workspaces/Litter_Bug/index.html'
s=open(P).read()
rep("""function paintMarks(el,gr){
  var m=(gr&&gr.marks)||[];
  el.innerHTML = m.length
    ? m.map(function(x){ return '<span class="mark" style="border-color:'+GRADE_COLOR[gr.grade]+'44;color:'+GRADE_COLOR[gr.grade]+'">'+x+'</span>'; }).join('')
    : '<span class="mark" style="border-color:#28323d">a plain grub, nothing grown in</span>';
}""",
"""/* growth: the renderer draws a part once growth (growLvl(level)/22) clears its threshold */
function growthOf(lvl){ return Math.max(0.12, Math.min(1, growLvl(lvl||1)/22)); }
function lvlFor(th){ return Math.max(1, Math.ceil((22*th-7)/0.8)); }
/* what is still to come at this level: count, and the first part in line */
function growthLeft(gr,lvl){
  var ps=(gr&&gr.parts)||[], g=growthOf(lvl), left=[], i;
  for(i=0;i<ps.length;i++) if(ps[i].th>g) left.push(ps[i]);
  left.sort(function(a,b){ return a.th-b.th; });
  return { total:ps.length, left:left.length, next:left[0]||null, nextLvl:left[0]?Math.max((lvl||1)+1, lvlFor(left[0].th)):0 };
}
/* ⛔ a chip for a part that is not drawn yet is DASHED: a fresh LEGENDARY is a plain grub
   with nine promises, and the chips have to say which promises are kept so far */
function paintMarks(el,gr,lvl){
  var ps=(gr&&gr.parts)||[], g=growthOf(lvl||1);
  el.innerHTML = ps.length
    ? ps.map(function(p){ var lat=p.th>g; return '<span class="mark'+(lat?' latent':'')+'" style="border-color:'+GRADE_COLOR[gr.grade]+(lat?'66':'44')+';color:'+GRADE_COLOR[gr.grade]+'">'+p.label+'</span>'; }).join('')
    : '<span class="mark" style="border-color:#28323d">a plain grub, nothing grown in</span>';
}""")
rep("""  paintMarks($('m-marks'),gr);""", """  paintMarks($('m-marks'),gr,1);""")
rep("""  $('m-grow').textContent='Level 1. It fights small. Every win in the dumpster grows it.';""",
"""  var gl=growthLeft(gr,1);
  $('m-grow').textContent='Level 1. It fights small. Every win in the dumpster grows it.'
    +(gl.left ? ' '+gl.left+' of '+gl.total+' parts still to grow in, the '+gl.next.label+' first, at level '+gl.nextLvl+'.' : '');""")
rep("""  paintPill($('sp-grade'), b.grade); paintMarks($('sp-marks'), D.gr);""",
"""  paintPill($('sp-grade'), b.grade); paintMarks($('sp-marks'), D.gr, D.lvl);""")
rep("""  row('PARTS', D.gr.marks.length ? _esc(D.gr.marks.join(', ')) : 'a plain grub, nothing grown in');""",
"""  row('PARTS', D.gr.marks.length ? _esc(D.gr.marks.join(', ')) : 'a plain grub, nothing grown in');
  var gl=growthLeft(D.gr, D.lvl);
  if(gl.total) row('GROWN', gl.left ? (gl.total-gl.left)+' of '+gl.total+' parts in · the '+_esc(gl.next.label)+' at level '+gl.nextLvl : 'fully grown, every part in');""")
rep(""".mark{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;padding:4px 9px;border-radius:999px;""",
""".mark.latent{opacity:.55;border-style:dashed}
.mark{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;padding:4px 9px;border-radius:999px;""")
# the canvas card: latent chips dashed
rep("""    var marks=D.gr.marks.length?D.gr.marks:['a plain grub'];
    ctx.font='700 13px "Trebuchet MS",sans-serif'; var cx=0, cy=gy+48, chips=[], lineW=0, line=[];
    marks.forEach(function(m){ var w=ctx.measureText(m.toUpperCase()).width+26; if(lineW+w+8>W-80&&line.length){ chips.push(line); line=[]; lineW=0; } line.push({t:m.toUpperCase(),w:w}); lineW+=w+8; }); if(line.length) chips.push(line);
    chips.slice(0,2).forEach(function(ln,li){ var tot=ln.reduce(function(a,c){return a+c.w+8;},0)-8, x=(W-tot)/2, y=cy+li*34; ln.forEach(function(c){ ctx.fillStyle='#0e141b'; ctx.strokeStyle=col+'66'; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(x,y-14,c.w,28,14); ctx.fill(); ctx.stroke(); ctx.fillStyle=col; ctx.fillText(c.t, x+c.w/2, y+5); x+=c.w+8; }); });""",
"""    var parts=D.gr.parts.length?D.gr.parts:[{label:'a plain grub',th:0}], gnow=growthOf(D.lvl);
    ctx.font='700 13px "Trebuchet MS",sans-serif'; var cx=0, cy=gy+48, chips=[], lineW=0, line=[];
    parts.forEach(function(p){ var m=p.label, w=ctx.measureText(m.toUpperCase()).width+26; if(lineW+w+8>W-80&&line.length){ chips.push(line); line=[]; lineW=0; } line.push({t:m.toUpperCase(),w:w,lat:p.th>gnow}); lineW+=w+8; }); if(line.length) chips.push(line);
    chips.slice(0,2).forEach(function(ln,li){ var tot=ln.reduce(function(a,c){return a+c.w+8;},0)-8, x=(W-tot)/2, y=cy+li*34; ln.forEach(function(c){ ctx.setLineDash(c.lat?[4,3]:[]); ctx.globalAlpha=c.lat?0.6:1; ctx.fillStyle='#0e141b'; ctx.strokeStyle=col+'66'; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(x,y-14,c.w,28,14); ctx.fill(); ctx.stroke(); ctx.fillStyle=col; ctx.fillText(c.t, x+c.w/2, y+5); x+=c.w+8; }); }); ctx.setLineDash([]); ctx.globalAlpha=1;""")
open(P,'w').write(s); print('page growth patched')

# ── the gate ──
C='/workspaces/Litter_Bug/check.js'
s=open(C).read()
rep("""      D.openSpec(0); const famLine = document.querySelector('#sp-front .specfam');
      const famRow = [...document.querySelectorAll('#sp-back .row .k')].some(k => k.textContent === 'FAMILY');""",
"""      D.openSpec(0); const famLine = document.querySelector('#sp-front .specfam');
      const famRow = [...document.querySelectorAll('#sp-back .row .k')].some(k => k.textContent === 'FAMILY');
      /* growth honesty: parts carry thresholds, the part line prefers what is drawn at mint,
         and a young high grade bug wears dashed chips for what has not grown in */
      let partsParallel = 0, preferOk = 0;
      for (let i = 0; i < n; i++) {
        const rr = E.seededRng('idcheck-' + i); let h = ''; for (let k = 0; k < 64; k++) h += Math.floor(rr() * 16).toString(16);
        const g = E.bugGrade(h); if (g.parts.length === g.marks.length && g.parts.every((p, j) => p.label === g.marks[j] && p.th >= 0 && p.th <= 1)) partsParallel++;
        const c = E.bugPartCandidates(h), p = E.bugPartLine(h);
        const anyNow = c.some(k => E.partThreshold(h, k) <= E.MINT_GROWTH);
        if (!anyNow || E.partThreshold(h, p.key) <= E.MINT_GROWTH) preferOk++;
      }
      /* a fixture with the most latent parts, pinned at level 1 then grown to 30 */
      let best = null; fx.forEach(f => { const g = E.bugGrade(f.h); const lat = g.parts.filter(p => p.th > E.MINT_GROWTH).length; if (!best || lat > best.lat) best = { h: f.h, lat, grade: g.grade }; });
      D.dex().push({ cb: best.h, grade: best.grade, lvl: 1, wins: 0, at: Date.now() });
      const idx = D.dex().length - 1;
      D.openSpec(idx);
      const latentAt1 = document.querySelectorAll('#sp-front .mark.latent').length;
      const grownRow1 = [...document.querySelectorAll('#sp-back .row')].map(r => r.textContent).find(t => /^GROWN/.test(t)) || '';
      D.setLvl(idx, 30); D.openSpec(idx);
      const latentAt30 = document.querySelectorAll('#sp-front .mark.latent').length;
      const grownRow30 = [...document.querySelectorAll('#sp-back .row')].map(r => r.textContent).find(t => /^GROWN/.test(t)) || '';""")
rep("""      return { nameSame, loreKept, fourLines, fxN: fx.length, partOk, n, wingLeak, keysUsed: Object.keys(keys).length, chips: chips.length, chipH, total, filterOk, detail, back, famLine: famLine ? famLine.textContent : null, famRow };""",
"""      return { nameSame, loreKept, fourLines, fxN: fx.length, partOk, n, wingLeak, keysUsed: Object.keys(keys).length, chips: chips.length, chipH, total, filterOk, detail, back, famLine: famLine ? famLine.textContent : null, famRow,
        partsParallel, preferOk, bestLat: best.lat, latentAt1, grownRow1, latentAt30, grownRow30 };""")
rep("""    ok(!!idr.famLine && /^[A-Za-z]+ · [a-z ]+$/.test(idr.famLine) && idr.famRow, 'the specimen card names the family, front and ledger', idr.famLine);""",
"""    ok(!!idr.famLine && /^[A-Za-z]+ · [a-z ]+$/.test(idr.famLine) && idr.famRow, 'the specimen card names the family, front and ledger', idr.famLine);
    ok(idr.partsParallel === idr.n, 'every scored mark carries the growth threshold it is drawn at', idr.partsParallel + '/' + idr.n);
    ok(idr.preferOk === idr.n, 'the part line prefers a part drawn at mint growth when there is one', idr.preferOk + '/' + idr.n);
    ok(idr.bestLat >= 3 && idr.latentAt1 === idr.bestLat && /of \\d+ parts in · the .+ at level \\d+/.test(idr.grownRow1), 'a young bug wears a dashed chip for every part not grown in yet, and the ledger says which is next', { lat: idr.bestLat, at1: idr.latentAt1, row: idr.grownRow1 });
    ok(idr.latentAt30 === 0 && /fully grown/.test(idr.grownRow30), 'at level 30 every chip is solid and the ledger says fully grown', { at30: idr.latentAt30, row: idr.grownRow30 });""")
open(C,'w').write(s); print('gate growth patched')
