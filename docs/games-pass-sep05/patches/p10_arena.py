P='/workspaces/Litter_Bug/index.html'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)

# ── CSS: the ledger box, the coach line, the over card's chips ──
rep(""".blog{margin-top:9px;flex:1;min-height:70px;font-size:14px;line-height:1.5;color:var(--dim);
  display:flex;flex-direction:column;justify-content:flex-start;gap:3px;overflow:hidden}
.blog .hot{color:var(--ink)}""",
"""/* THE FIGHT LEDGER (2026-09-05). The log used to be two grey lines floating over a 300px hole
   between the champion and the moves. It is a box now that fills that space: the newest round
   on top in ink, older rounds stepping back into the dim, every round tagged, scrolling when a
   long fight outgrows it. */
.blog{margin-top:9px;flex:1;min-height:120px;font-size:14px;line-height:1.45;color:var(--dim);
  display:flex;flex-direction:column;justify-content:flex-start;gap:4px;overflow-y:auto;-webkit-overflow-scrolling:touch;
  border:1px solid var(--line);border-radius:12px;background:#0d1218;padding:9px 12px 10px}
.blog .lh{font-size:11px;letter-spacing:2.5px;color:#4a5866;font-weight:800;margin-bottom:2px}
.blog .rd{display:flex;gap:9px;align-items:flex-start}
.blog .rd i{flex:none;font-style:normal;font-size:11px;font-weight:800;letter-spacing:1px;color:#4a5866;padding-top:3px;min-width:22px}
.blog .rd.o1{opacity:.72} .blog .rd.o2{opacity:.5} .blog .rd.o3{opacity:.36}
.blog .hot{color:var(--ink)}
.blog .hot i{color:var(--shine)}
.telegraph .coach{display:block;margin-top:5px;color:var(--grub);font-weight:800}
.overcard .marks{margin:10px auto 0}""")

# ── the over card gets a chips row for what grew in ──
rep("""        <div id="a-over-art"></div>
        <div class="dim" id="a-over-note" style="margin-top:10px;font-size:17px;line-height:1.5"></div>""",
"""        <div id="a-over-art"></div>
        <div class="marks" id="a-over-marks"></div>
        <div class="dim" id="a-over-note" style="margin-top:10px;font-size:17px;line-height:1.5"></div>""")

# ── openArena: a fresh ledger ──
rep("""  AR={ idx:idx, st:BATTLE_ENGINE.startBattle(me.cb, fcb, myLvl, foeLvl), busy:false, dexIdx:champIndex() };
  $('a-title').textContent='CHALLENGER '+(idx+1);
  $('a-over').classList.remove('on');
  $('a-log').innerHTML='<div class="hot">The lid comes off. Pick a move.</div>';""",
"""  AR={ idx:idx, st:BATTLE_ENGINE.startBattle(me.cb, fcb, myLvl, foeLvl), busy:false, dexIdx:champIndex(), ledger:[] };
  $('a-title').textContent='CHALLENGER '+(idx+1);
  $('a-over').classList.remove('on');
  $('a-over-marks').innerHTML='';
  paintLedger(['The lid comes off. Pick a move.']);""")

# ── the coach line, in the telegraph ──
rep("""  $('a-tele').innerHTML='<div><b>'+st.b.name+'</b> is winding up <b>'+foeMove.name+'</b>.'+warn+'</div>';
}""",
"""  var coach=coachLine(st, foeMove, inb);
  $('a-tele').innerHTML='<div><b>'+st.b.name+'</b> is winding up <b>'+foeMove.name+'</b>.'+warn
    +(coach?'<span class="coach">'+coach+'</span>':'')+'</div>';
}
/* ONE sentence of coaching under the tell (2026-09-05). The first challenger took a fresh champion
   down in three rounds every time the thumb went for damage, while a status move that would have
   softened the hit sat unexplained in the corner. When the incoming hit is a real threat, name the
   move that answers it; otherwise, when a move of yours lands hard, say so. Never both. */
var SOFTEN={ guard:'{m} halves the next hit.', smolder:'{m} takes the sting out of it.', defUp2:'{m} blunts it.',
  accDownEnemy:'{m} spoils its aim.', rustlock:'{m} slows it, and it may seize.' };
function coachLine(st, foeMove, inb){
  var i, m, band, frac = inb ? inb.max/Math.max(1,st.a.hp) : 0;
  if(inb && (inb.mult>1.2 || frac>=0.3)){
    for(i=0;i<st.a.moves.length;i++){ m=st.a.moves[i]; if(m.eff && SOFTEN[m.eff]) return SOFTEN[m.eff].replace('{m}', m.name); }
  }
  for(i=0;i<st.a.moves.length;i++){ m=st.a.moves[i]; band=BATTLE_ENGINE.damageBand(st.a, st.b, m); if(band && band.mult>1.2) return m.name+' lands hard on it.'; }
  return '';
}
/* the ledger: every round so far, newest on top */
function paintLedger(lines){
  var L=AR.ledger, out='<div class="lh">THE FIGHT</div>', k, r;
  if(lines) L.unshift({ r:AR.st.round, lines:lines });
  for(k=0;k<L.length;k++){
    r=L[k];
    out+='<div class="rd'+(k===0?' hot':(k<4?' o'+k:' o3'))+'"><i>'+(r.r>0?'R'+r.r:'')+'</i><div>'+r.lines.map(function(l){ return '<div>'+l+'</div>'; }).join('')+'</div></div>';
  }
  $('a-log').innerHTML=out;
  $('a-log').scrollTop=0;
}""")
rep("""  $('a-log').innerHTML=lines.map(function(l,i){
    return '<div class="'+(i===lines.length-1?'hot':'')+'">'+l+'</div>'; }).join('');
  updateBars($('a-me'), st.a); updateBars($('a-foe'), st.b);""",
"""  paintLedger(lines);
  updateBars($('a-me'), st.a); updateBars($('a-foe'), st.b);""")

# ── the win card names the level and what grew in ──
rep("""      if(me){ me.lvl=Math.min(30, lvlOf(me)+1); me.wins=(me.wins||0)+1; }
    }
    head='YOU WIN';
    note = already
      ? 'You had already taken this one today, so the purse is spent. The streak still counts: '+k.run+' in a row.'
      : 'Purse '+purse+' Shinies, streak bonus '+bonus+'. '+(me?(BUG_ENGINE.bugName(me.cb)+' is level '+lvlOf(me)+' now and it shows.'):'');""",
"""      if(me){ growth=growthNote(me, lvlOf(me), Math.min(30, lvlOf(me)+1)); me.lvl=Math.min(30, lvlOf(me)+1); me.wins=(me.wins||0)+1; }
    }
    head='YOU WIN';
    note = already
      ? 'You had already taken this one today, so the purse is spent. The streak still counts: '+k.run+' in a row.'
      : 'Purse '+purse+' Shinies, streak bonus '+bonus+'. '+(growth?growth.text:'');""")
rep("""  var st=AR.st, k=kingState(), won=(!st.draw && st.winner==='a');
  var head, note='', me=(SAVE.dex||[])[AR.dexIdx];
  LB_SFX.play(won ? 'win' : 'lose');""",
"""  var st=AR.st, k=kingState(), won=(!st.draw && st.winner==='a');
  var head, note='', me=(SAVE.dex||[])[AR.dexIdx], growth=null;
  LB_SFX.play(won ? 'win' : 'lose');""")
rep("""  $('a-over-art').innerHTML = me ? bugSVG(me.cb,150,lvlOf(me)) : '';
  $('a-over-note').textContent=note;
  $('a-over').classList.add('on');
}""",
"""  $('a-over-art').innerHTML = me ? bugSVG(me.cb,150,lvlOf(me)) : '';
  $('a-over-note').textContent=note;
  var gm=$('a-over-marks'); gm.innerHTML='';
  if(growth && growth.grown.length){
    var gr=gradeOf(me.cb);
    gm.innerHTML=growth.grown.map(function(p){ return '<span class="mark" style="border-color:'+GRADE_COLOR[gr.grade]+'88;color:'+GRADE_COLOR[gr.grade]+'">'+p.label+' grew in</span>'; }).join('');
    setTimeout(function(){ LB_SFX.play('stamp'); }, 700);
  }
  $('a-over').classList.add('on');
}
/* what a level gave the bug: the parts whose growth threshold sits between the old level and
   the new one, told; or the next part in line, so a win always points at the next win */
function growthNote(b, oldLvl, newLvl){
  var gr=gradeOf(b.cb), g0=growthOf(oldLvl), g1=growthOf(newLvl), grown=[], i, ps=gr.parts||[];
  for(i=0;i<ps.length;i++) if(ps[i].th>g0 && ps[i].th<=g1) grown.push(ps[i]);
  var name=BUG_ENGINE.bugName(b.cb), text=name+' is level '+newLvl+' now.';
  if(grown.length) text+=' The '+grown.map(function(p){ return p.label; }).join(' and the ')+' grew in.';
  else { var gl=growthLeft(gr, newLvl); if(gl.left) text+=' The '+gl.next.label+' comes in at level '+gl.nextLvl+'.'; else if(ps.length) text+=' Every part is in.'; }
  return { grown:grown, text:text, newLvl:newLvl };
}""")
rep("""    plan:BUG_ENGINE.bugPlan, svg:bugSVG, openSpec:openSpec, renderCard:renderBugCard, sfx:LB_SFX, openBeat:openBeat, openI:function(){ return OPEN_I; },""",
    """    plan:BUG_ENGINE.bugPlan, svg:bugSVG, openSpec:openSpec, renderCard:renderBugCard, sfx:LB_SFX, openBeat:openBeat, openI:function(){ return OPEN_I; },
    coach:coachLine, growthNote:growthNote, ledger:function(){ return AR?AR.ledger:null; },""")
open(P,'w').write(s); print('arena patched')

C='/workspaces/Litter_Bug/check.js'
s=open(C).read()
anchor="    // ══ A CORRUPT SAVE ════════════════════════════════════════════════\n"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    // ══ THE ARENA: a ledger, a coach, a growth moment ══════════════════
    group('the arena: the fight is a ledger, the tell coaches, a win names what grew in');
    const arPage = await open(FILE + '?lbtest=1');
    const ar = await arPage.evaluate(async () => {
      const D = window.LB_DEV, E = window.BUG_ENGINE, B = window.BATTLE_ENGINE; D.reset();
      const fx = await (await fetch('fixtures/identity-60.json?' + Math.random())).json();
      /* the coach: find a pair where the foe's tell is a threat and the champion has an answer */
      let coached = null, offense = null, quiet = 0, tried = 0;
      for (let i = 0; i < fx.length && !(coached && offense); i++) for (let j = 0; j < fx.length && !(coached && offense); j++) {
        if (i === j) continue; tried++;
        const st = B.startBattle(fx[i].h, fx[j].h, 1, 1), fm = B.previewFoeMove(st), inb = B.damageBand(st.b, st.a, fm);
        const line = D.coach(st, fm, inb);
        const threat = !!inb && (inb.mult > 1.2 || inb.max / Math.max(1, st.a.hp) >= 0.3);
        const soft = st.a.moves.find(m => m.eff && /guard|smolder|defUp2|accDownEnemy|rustlock/.test(m.eff));
        if (threat && soft && !coached) coached = { line, move: soft.name, ok: line.indexOf(soft.name) === 0 };
        if (!threat && !coached && !offense) { const hard = st.a.moves.find(m => { const b = B.damageBand(st.a, st.b, m); return b && b.mult > 1.2; }); if (hard) offense = { line, move: hard.name, ok: line.indexOf(hard.name) === 0 && /lands hard/.test(line) }; }
        if (!line) quiet++;
      }
      /* the growth note on a fixture bug: level 1 to 8 crosses parts on most bugs */
      let grewText = null, grewN = 0, nextText = null;
      for (const f of fx) { const g = D.growthNote({ cb: f.h }, 1, 8); if (g.grown.length && !grewText) { grewText = g.text; grewN = g.grown.length; } const g2 = D.growthNote({ cb: f.h }, 1, 2); if (!g2.grown.length && !nextText) nextText = g2.text; if (grewText && nextText) break; }
      /* the ledger through a real fight */
      D.setShinies(D.mintCost); await D.doMint(); D.keep(); D.setChamp(0);
      D.openArena(0);
      const before = document.querySelectorAll('#a-log .rd').length;
      D.playMove(0); await new Promise(r => setTimeout(r, 2600));
      const rows = [...document.querySelectorAll('#a-log .rd')];
      const hotFirst = rows.length >= 2 && rows[0].classList.contains('hot') && !rows[1].classList.contains('hot');
      const tagged = rows.length >= 1 && /^R1$/.test(rows[0].querySelector('i').textContent);
      const logBox = document.getElementById('a-log').getBoundingClientRect();
      const moves = document.getElementById('a-moves').getBoundingClientRect();
      const gap = Math.round(moves.top - logBox.bottom);
      return { tried, coached, offense, quiet, grewText, grewN, nextText, before, rows: rows.length, hotFirst, tagged, logH: Math.round(logBox.height), gap };
    });
    await arPage.close();
    ok(!!ar.coached && ar.coached.ok, 'when the tell is a threat and a status move answers it, the coach names that move', ar.coached);
    ok(!!ar.offense && ar.offense.ok, 'when nothing threatens and a move of yours lands hard, the coach says so', ar.offense);
    ok(!!ar.grewText && /grew in/.test(ar.grewText) && ar.grewN > 0, 'a level that crosses a part threshold says which part grew in', ar.grewText);
    ok(!!ar.nextText && /comes in at level/.test(ar.nextText), 'a level that crosses nothing points at the next part and its level', ar.nextText);
    ok(ar.before === 1 && ar.rows >= 2 && ar.hotFirst && ar.tagged, 'the ledger keeps every round, newest on top in ink, tagged by round', { before: ar.before, rows: ar.rows, hotFirst: ar.hotFirst, tagged: ar.tagged });
    ok(ar.logH >= 100 && ar.gap <= 16, 'the ledger box fills the space above the moves', { logH: ar.logH, gap: ar.gap });

"""+anchor)
open(C,'w').write(s); print('gate patched')
