P='/workspaces/Litter_Bug/index.html'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)
rep(""".specfam{font-size:11px;letter-spacing:2px;color:var(--dim);font-weight:800;margin-top:4px;text-transform:uppercase}""",
""".specfam{font-size:11px;letter-spacing:2px;color:var(--dim);font-weight:800;margin-top:4px;text-transform:uppercase}
/* the sort strip: three ways to read a collection once it is more than a screen */
.dexsort{display:flex;gap:8px;margin-top:10px}
.dexsort button{flex:1;min-height:70px;border-radius:14px;border:1px solid var(--line);background:#10151b;color:var(--dim);
  font-size:13px;font-weight:800;letter-spacing:2px;cursor:pointer;font-family:inherit}
.dexsort button.on{background:#1b2a1f;border-color:#2f8a4c;color:#9be5b0}""")
rep("""      <div class="dexchips" id="x-chips"></div>""",
"""      <div class="dexchips" id="x-chips"></div>
      <div class="dexsort" id="x-sort"><button data-sort="new" class="on">NEWEST</button><button data-sort="grade">GRADE</button><button data-sort="level">LEVEL</button></div>""")
rep("""var DEX_FILTER=-1;   /* -1 all, else a wing family index */""",
"""var DEX_FILTER=-1;   /* -1 all, else a wing family index */
var DEX_SORT='new';  /* new: last minted first; grade: best grade then score; level: highest level then wins */
function dexOrder(dex){
  var idx=dex.map(function(b,i){ return i; });
  if(DEX_SORT==='grade') idx.sort(function(a,b){ var ga=GRADES.indexOf(dex[a].grade), gb=GRADES.indexOf(dex[b].grade); return gb-ga || (dex[b].score||0)-(dex[a].score||0) || b-a; });
  else if(DEX_SORT==='level') idx.sort(function(a,b){ return lvlOf(dex[b])-lvlOf(dex[a]) || (dex[b].wins||0)-(dex[a].wins||0) || b-a; });
  else idx.reverse();
  return idx;
}""")
rep("""  var shown=0;
  dex.forEach(function(b,i){
    if(DEX_FILTER>=0){ var ff=famOf(b.cb); if(!ff||ff.wing!==DEX_FILTER) return; }
    shown++;
    var c=document.createElement('div'); c.className='card';""",
"""  var sb=document.querySelectorAll('#x-sort button'), si;
  for(si=0;si<sb.length;si++)(function(el){ el.classList.toggle('on', el.getAttribute('data-sort')===DEX_SORT); el.onclick=function(){ DEX_SORT=el.getAttribute('data-sort'); paintDex(); }; })(sb[si]);
  var shown=0;
  dexOrder(dex).forEach(function(i){
    var b=dex[i];
    if(DEX_FILTER>=0){ var ff=famOf(b.cb); if(!ff||ff.wing!==DEX_FILTER) return; }
    shown++;
    var c=document.createElement('div'); c.className='card';""")
rep("""    ceremonyOn:function(){ return $('m-wrap').classList.contains('ceremony'); },""",
    """    ceremonyOn:function(){ return $('m-wrap').classList.contains('ceremony'); },
    dexOrder:function(){ return dexOrder(SAVE.dex||[]); }, setSort:function(k){ DEX_SORT=k; paintDex(); return DEX_SORT; },""")
open(P,'w').write(s); print('dex sort patched')

C='/workspaces/Litter_Bug/check.js'
s=open(C).read()
anchor="    // ══ A CORRUPT SAVE ════════════════════════════════════════════════\n"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    // ══ THE BUGDEX SORTS ══════════════════════════════════════════════
    group('the Bugdex sorts: newest, grade, level');
    const dsPage = await open(FILE + '?lbtest=1');
    const ds = await dsPage.evaluate(async () => {
      const D = window.LB_DEV, E = window.BUG_ENGINE; D.reset();
      const fx = await (await fetch('fixtures/identity-60.json?' + Math.random())).json();
      /* six fixture bugs with known grades, pushed in order, levels set by hand */
      const picks = fx.slice(0, 6);
      picks.forEach((f, i) => D.dex().push({ cb: f.h, grade: f.grade, score: E.bugGrade(f.h).score, lvl: [3, 1, 9, 2, 9, 5][i], wins: [0, 0, 2, 0, 5, 1][i], at: Date.now() + i }));
      document.getElementById('b-dex').click();
      const names = () => [...document.querySelectorAll('#x-grid .card .nm')].map(e => e.textContent);
      const byNew = names();
      const btn = k => document.querySelector('#x-sort button[data-sort="' + k + '"]');
      const h = btn('grade').getBoundingClientRect().height;
      btn('grade').click(); const byGrade = names(); const gradeOn = btn('grade').classList.contains('on') && !btn('new').classList.contains('on');
      const gradeIdx = D.dexOrder().map(i => window.LB_DEV.grades.indexOf(D.dex()[i].grade));
      const gradeMono = gradeIdx.every((g, i) => i === 0 || g <= gradeIdx[i - 1]);
      btn('level').click(); const lvls = D.dexOrder().map(i => D.dex()[i].lvl);
      const levelMono = lvls.every((l, i) => i === 0 || l <= lvls[i - 1]);
      const topWins = D.dex()[D.dexOrder()[0]].wins;
      btn('new').click(); const newest = D.dexOrder()[0] === D.dex().length - 1;
      /* the card still opens the right specimen after a sort */
      btn('grade').click(); document.querySelector('#x-grid .card').click(); const specName = document.querySelector('#sp-front .specname').textContent; const firstName = names()[0];
      return { n: D.dex().length, byNew0: byNew[0], byGrade0: byGrade[0], gradeOn, gradeMono, gradeIdx, levelMono, lvls, topWins, newest, h, specName, firstName, scr: D.cur() };
    });
    await dsPage.close();
    ok(ds.n === 6 && ds.newest, 'NEWEST puts the last minted bug first', ds);
    ok(ds.gradeOn && ds.gradeMono, 'GRADE runs best to worst', { gradeIdx: ds.gradeIdx });
    ok(ds.levelMono && ds.topWins === 5 && ds.lvls[0] === 9, 'LEVEL runs highest first, wins break the tie', { lvls: ds.lvls, topWins: ds.topWins });
    ok(ds.h >= 48, 'the sort buttons are thumb sized', ds.h);
    ok(ds.specName === ds.firstName && ds.scr === 's-spec', 'after a sort, tapping a card opens that card', { specName: ds.specName, firstName: ds.firstName });

"""+anchor)
open(C,'w').write(s); print('gate patched')
