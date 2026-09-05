P='/workspaces/Litter_Bug/index.html'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)

# ── CSS ──
rep(".dtxt{font-size:18px;line-height:1.55;margin-top:7px}",
""".dtxt{font-size:18px;line-height:1.55;margin-top:7px}
/* THE OPEN (2026-09-05): three beats over the alley on the first run, instead of a wall of
   rules. The alley already shows through every screen (#wrap-bg), so a beat is a picture,
   one line, and a dot strip. HOW TO PLAY keeps the full rules. */
#s-open .pad{justify-content:flex-end;padding-bottom:26px}
.beat{display:none;flex-direction:column;align-items:center;text-align:center;width:100%}
.beat.on{display:flex}
.beat .bart{width:100%;max-width:430px;height:250px;border-radius:16px;border:1px solid var(--line);overflow:hidden;
  background:linear-gradient(180deg,#0f1620 0%,#141c26 60%,#1a232e 100%);display:flex;align-items:center;justify-content:center;position:relative}
.beat .bart svg{width:100%;height:100%;display:block}
.beat .bart .bjar{width:120px;height:168px;filter:drop-shadow(0 8px 18px #000a)}
.beat .bart .bdump{width:88%;height:auto}
.beat .bkick{font-size:13px;letter-spacing:4px;color:var(--grub);font-weight:800;margin-top:22px;text-transform:uppercase}
.beat .bline{font-size:24px;line-height:1.35;font-weight:800;color:var(--ink);margin-top:8px;max-width:420px}
.beat .bsub{font-size:16px;line-height:1.5;color:var(--dim);margin-top:10px;max-width:400px}
.dots{display:flex;gap:9px;justify-content:center;margin:22px 0 16px}
.dots i{width:9px;height:9px;border-radius:50%;background:#28323d;display:block}
.dots i.on{background:var(--shine);box-shadow:0 0 8px #e8c46a88}
.openskip{position:absolute;right:14px;top:14px;z-index:61;height:56px;padding:0 16px;border-radius:999px;border:1px solid var(--line);
  background:#0f151bcc;color:var(--dim);font-size:13px;font-weight:800;letter-spacing:1.5px;cursor:pointer;font-family:inherit}""")

# ── markup: the open screen, after HOW TO PLAY ──
rep("""  <!-- ══════════ BLOCK PICKER ══════════ -->""",
"""  <!-- ══════════ THE OPEN: three beats on the first run ══════════ -->
  <div class="screen" id="s-open">
    <button class="openskip" id="b-open-skip" type="button">SKIP</button>
    <div class="pad center">
      <div class="beat on" data-beat="0">
        <div class="bart"><svg id="open-alley" viewBox="0 0 500 280" preserveAspectRatio="xMidYMid slice"></svg></div>
        <div class="bkick">The alley</div>
        <div class="bline">Every night the alley fills with what people throw away.</div>
        <div class="bsub">Sort it, hunt it, untangle it, pry it open. Every shift pays Shinies.</div>
      </div>
      <div class="beat" data-beat="1">
        <div class="bart"><div class="bjar" id="open-jar"></div></div>
        <div class="bkick">The jar</div>
        <div class="bline">Thirty Shinies hatch a bug that has never existed and never will again.</div>
        <div class="bsub">Graded, named, and yours. Every one grows with every fight it wins.</div>
      </div>
      <div class="beat" data-beat="2">
        <div class="bart"><div class="bdump" id="open-dump"></div></div>
        <div class="bkick">The dumpster</div>
        <div class="bline">Five challengers a day. Beat them all and you are King of the Dumpster.</div>
        <div class="bsub">The rules are under HOW TO PLAY whenever you want them.</div>
      </div>
      <div class="dots" id="open-dots"><i class="on"></i><i></i><i></i></div>
      <div class="stack">
        <button class="btn primary" id="b-open-next">NEXT</button>
      </div>
    </div>
  </div>

  <!-- ══════════ BLOCK PICKER ══════════ -->""")

# ── JS: the beats ──
rep("""/* first run shows the rules, once per device */
(function(){""",
"""/* ---------- the open: three beats, once per device ---------- */
var OPEN_I=0;
function paintOpen(){
  var beats=document.querySelectorAll('#s-open .beat'), dots=document.querySelectorAll('#open-dots i'), i;
  for(i=0;i<beats.length;i++) beats[i].classList.toggle('on', i===OPEN_I);
  for(i=0;i<dots.length;i++) dots[i].classList.toggle('on', i===OPEN_I);
  $('b-open-next').textContent = OPEN_I>=2 ? 'WORK THE ALLEY' : 'NEXT';
}
function openBeat(i){
  OPEN_I=Math.max(0, Math.min(2, i));
  if(OPEN_I===0 && !$('open-alley').innerHTML) $('open-alley').innerHTML=alleyMarkup('alleyO');
  if(OPEN_I===1 && !$('open-jar').innerHTML) $('open-jar').innerHTML=jarSVG();
  if(OPEN_I===2 && !$('open-dump').innerHTML) $('open-dump').innerHTML=dumpsterLockSVG();
  paintOpen(); show('s-open');
}
function endOpen(){ try{ localStorage.setItem('lb_how','1'); }catch(e){} paintHome(); show('s-home'); }
$('b-open-next').onclick=function(){ if(OPEN_I>=2){ endOpen(); return; } openBeat(OPEN_I+1); };
$('b-open-skip').onclick=function(){ endOpen(); };
/* a tap on the picture turns the page too */
(function(){ var arts=document.querySelectorAll('#s-open .bart'), i; for(i=0;i<arts.length;i++) arts[i].onclick=function(){ $('b-open-next').onclick(); }; })();

/* first run shows the open, once per device; HOW TO PLAY keeps the full rules */
(function(){""")
rep("""  try{ if(localStorage.getItem('lb_how')!=='1'){ localStorage.setItem('lb_how','1'); show('s-how'); } }catch(e){}""",
    """  try{ if(localStorage.getItem('lb_how')!=='1') openBeat(0); }catch(e){}""")
rep("""    plan:BUG_ENGINE.bugPlan, svg:bugSVG, openSpec:openSpec, renderCard:renderBugCard, sfx:LB_SFX,""",
    """    plan:BUG_ENGINE.bugPlan, svg:bugSVG, openSpec:openSpec, renderCard:renderBugCard, sfx:LB_SFX, openBeat:openBeat, openI:function(){ return OPEN_I; },""")
open(P,'w').write(s); print('open patched')

C='/workspaces/Litter_Bug/check.js'
s=open(C).read()
rep("""    ok(boot.onScreen === 's-how' || boot.onScreen === 's-home', 'a fresh browser opens on the rules or HOME', boot.onScreen);""",
    """    ok(boot.onScreen === 's-open' || boot.onScreen === 's-how' || boot.onScreen === 's-home', 'a fresh browser opens on the open, the rules or HOME', boot.onScreen);""")
rep("""      const screens = ['s-home', 's-block', 's-dex', 's-dump', 's-how'];""",
    """      const screens = ['s-home', 's-block', 's-dex', 's-dump', 's-how', 's-open'];""")
anchor="    // ══ A CORRUPT SAVE ════════════════════════════════════════════════\n"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    // ══ THE OPEN ══════════════════════════════════════════════════════
    group('the open: three beats on the first run, then never again');
    const opPage = await open(FILE + '?lbtest=1');
    await opPage.evaluate(() => { try { localStorage.removeItem('lb_how'); } catch (e) {} });
    await opPage.reload({ waitUntil: 'networkidle2' });
    await opPage.evaluate(() => new Promise(r => setTimeout(r, 400)));
    const op = await opPage.evaluate(() => {
      const D = window.LB_DEV; const cur0 = D.cur();
      const beats = [...document.querySelectorAll('#s-open .beat')];
      const seen = [], art = [], copy = [];
      const nextBtn = document.getElementById('b-open-next'), r = nextBtn.getBoundingClientRect();
      const skip = document.getElementById('b-open-skip').getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        const on = beats.find(b => b.classList.contains('on'));
        seen.push(on ? on.getAttribute('data-beat') : null);
        art.push(!!(on && on.querySelector('.bart svg')));
        copy.push(on ? on.querySelector('.bline').textContent.length : 0);
        const label = nextBtn.textContent;
        if (i === 2 && label !== 'WORK THE ALLEY') copy.push('label:' + label);
        nextBtn.click();
      }
      return { cur0, seen, art, copy, nextH: r.height, skipH: skip.height, after: D.cur(), stored: localStorage.getItem('lb_how') };
    });
    await opPage.reload({ waitUntil: 'networkidle2' });
    await opPage.evaluate(() => new Promise(r => setTimeout(r, 400)));
    const again = await opPage.evaluate(() => { const D = window.LB_DEV; const c = D.cur(); document.getElementById('b-how').click(); return { cur: c, how: D.cur() }; });
    await opPage.close();
    ok(op.cur0 === 's-open' && op.seen.join('') === '012', 'a fresh device opens on beat one and NEXT walks all three', JSON.stringify({ cur0: op.cur0, seen: op.seen }));
    ok(op.art.every(Boolean) && op.copy.every(c => typeof c === 'number' && c > 30), 'every beat has a drawn picture and a line', JSON.stringify({ art: op.art, copy: op.copy }));
    ok(op.nextH >= 48 && op.skipH >= 40, 'NEXT and SKIP are thumb sized', { nextH: op.nextH, skipH: op.skipH });
    ok(op.after === 's-home' && op.stored === '1', 'the third beat lands on HOME and the device remembers', { after: op.after, stored: op.stored });
    ok(again.cur === 's-home' && again.how === 's-how', 'the next visit opens on HOME, and HOW TO PLAY still has the rules', JSON.stringify(again));

"""+anchor)
open(C,'w').write(s); print('gate patched')
