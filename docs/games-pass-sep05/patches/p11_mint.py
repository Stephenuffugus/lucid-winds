P='/workspaces/Litter_Bug/index.html'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)
rep(""".mintwrap{display:flex;flex-direction:column;align-items:center;gap:10px}""",
""".mintwrap{display:flex;flex-direction:column;align-items:center;gap:10px}
/* THE MINT MOMENT (2026-09-05). Thirty Shinies used to cut straight to a finished card. Now the
   jar sits on the screen, the lid lifts and the jar fades up and away, the bug rises out of it,
   the grade stamps on, and the name and lore settle in after. Two seconds, skippable by a tap,
   none of it under prefers-reduced-motion. */
.mintstage{position:relative;width:230px;height:230px}
.mintstage .mjar{position:absolute;left:50%;top:50%;width:140px;height:196px;transform:translate(-50%,-50%);filter:drop-shadow(0 10px 22px #000a)}
.mintstage .mjar svg{width:100%;height:100%;display:block}
.mintstage #m-art{position:relative}
.ceremony .mintstage .mjar{animation:jarlift 1.1s ease-in .35s both}
.ceremony .mintstage #m-art{animation:bugrise 1s cubic-bezier(.2,.8,.2,1) .55s both}
.ceremony .mglow{position:absolute;left:50%;top:50%;width:260px;height:260px;border-radius:50%;transform:translate(-50%,-50%);
  background:radial-gradient(circle,#e8c46a55 0%,#e8c46a22 35%,transparent 70%);animation:glowin 1.4s ease-out .4s both;pointer-events:none}
.ceremony #m-grade{animation:pop .5s ease-out 1.35s both}
.ceremony #m-marks,.ceremony #m-name,.ceremony #m-species,.ceremony #m-lore,.ceremony #m-grow,.ceremony #m-kicker{animation:settle .6s ease-out 1.65s both}
.ceremony #m-lore,.ceremony #m-grow{animation-delay:1.9s}
.mintwrap:not(.ceremony) .mjar,.mintwrap:not(.ceremony) .mglow{display:none}
@keyframes jarlift{0%{opacity:1;transform:translate(-50%,-50%)}55%{opacity:.9;transform:translate(-50%,-56%) rotate(-4deg)}100%{opacity:0;transform:translate(-50%,-140%) rotate(-14deg)}}
@keyframes bugrise{0%{opacity:0;transform:translateY(46px) scale(.55)}60%{opacity:1}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes glowin{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}40%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
@keyframes settle{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion:reduce){ .ceremony *{animation:none !important} .mintwrap .mjar,.mintwrap .mglow{display:none} }""")
rep("""      <div class="mintwrap" style="margin-top:14px">
        <div id="m-art"></div>""",
"""      <div class="mintwrap" id="m-wrap" style="margin-top:14px">
        <div class="mintstage"><div class="mglow"></div><div class="mjar" id="m-jar"></div><div id="m-art"></div></div>""")
rep("""  LB_SFX.play('jar');
  var gl=growthLeft(gr,1);""",
"""  LB_SFX.play('jar');
  /* the ceremony: reset the classes so a second mint plays it again, then let it run */
  var mw=$('m-wrap'); mw.classList.remove('ceremony'); void mw.offsetWidth;
  $('m-jar').innerHTML=jarSVG(); mw.classList.add('ceremony');
  var gl=growthLeft(gr,1);""")
# a tap on the stage skips to the end
rep("""$('b-mint-keep').onclick=function(){ keepBug(); };""",
"""$('b-mint-keep').onclick=function(){ keepBug(); };
/* a tap anywhere on the mint screen lands the ceremony at its end */
$('s-mint').addEventListener('click', function(e){ var mw=$('m-wrap'); if(mw.classList.contains('ceremony') && !(e.target&&e.target.id==='b-mint-keep')) mw.classList.remove('ceremony'); }, true);""")
rep("""    coach:coachLine, growthNote:growthNote, ledger:function(){ return AR?AR.ledger:null; },""",
    """    coach:coachLine, growthNote:growthNote, ledger:function(){ return AR?AR.ledger:null; },
    ceremonyOn:function(){ return $('m-wrap').classList.contains('ceremony'); },""")
open(P,'w').write(s); print('mint ceremony patched')

C='/workspaces/Litter_Bug/check.js'
s=open(C).read()
anchor="    // ══ A CORRUPT SAVE ════════════════════════════════════════════════\n"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    // ══ THE MINT MOMENT ═══════════════════════════════════════════════
    group('the mint moment: the jar lifts, the bug rises, the grade stamps, a tap lands it');
    const mmPage = await open(FILE + '?lbtest=1');
    const mm = await mmPage.evaluate(async () => {
      const D = window.LB_DEV; D.reset(); D.setShinies(D.mintCost);
      await D.doMint();
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const on0 = D.ceremonyOn();
      const jar = document.getElementById('m-jar'), art = document.getElementById('m-art'), pill = document.getElementById('m-grade');
      const names = el => getComputedStyle(el).animationName;
      const a0 = { jar: names(jar), art: names(art), pill: names(pill), jarSvg: !!jar.querySelector('svg') };
      const jarOp0 = parseFloat(getComputedStyle(jar).opacity), artOp0 = parseFloat(getComputedStyle(art).opacity);
      await wait(1900);
      const jarOp1 = parseFloat(getComputedStyle(jar).opacity), artOp1 = parseFloat(getComputedStyle(art).opacity);
      /* a tap on the stage lands it early */
      document.getElementById('m-wrap').classList.add('ceremony');
      document.getElementById('m-art').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const landed = !D.ceremonyOn(), jarHidden = getComputedStyle(jar).display === 'none';
      return { on0, a0, jarOp0, artOp0, jarOp1, artOp1, landed, jarHidden, scr: D.cur() };
    });
    await mmPage.close();
    ok(mm.on0 && mm.a0.jar === 'jarlift' && mm.a0.art === 'bugrise' && mm.a0.pill === 'pop' && mm.a0.jarSvg, 'the mint opens with the jar on stage, the bug rising, the pill stamping', mm.a0);
    ok(mm.jarOp0 > 0.9 && mm.artOp0 < 0.1 && mm.jarOp1 < 0.1 && mm.artOp1 > 0.9, 'at the start the jar is solid and the bug unseen; two seconds later the jar is gone and the bug is there', { jarOp0: mm.jarOp0, artOp0: mm.artOp0, jarOp1: mm.jarOp1, artOp1: mm.artOp1 });
    ok(mm.landed && mm.jarHidden && mm.scr === 's-mint', 'a tap on the stage lands the ceremony at its end', { landed: mm.landed, jarHidden: mm.jarHidden });

"""+anchor)
open(C,'w').write(s); print('gate patched')
