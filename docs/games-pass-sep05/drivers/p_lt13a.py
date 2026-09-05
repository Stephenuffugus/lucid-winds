import re
R='/workspaces/lucid-winds/'
def patch(fn, pairs):
    p=R+fn; s=open(p).read()
    for old,new,cnt in pairs:
        n=s.count(old); assert n==cnt, ("%s: match count %d (want %d) for %r"%(fn,n,cnt,old[:70]))
        s=s.replace(old,new)
    open(p,'w').write(s); print("patched",fn,len(pairs))

patch('games/pollen.js', [
('''style="flex:1;min-width:0;background:rgba(13,16,12,0.7);border:1px solid rgba(122,179,86,0.2);border-radius:6px;color:var(--cream);font-family:DM Mono,monospace;font-size:0.7rem;padding:8px 10px;min-height:48px;">''',
 '''style="flex:1.4;min-width:0;background:rgba(13,16,12,0.7);border:1px solid rgba(122,179,86,0.2);border-radius:6px;color:var(--cream);font-family:DM Mono,monospace;font-size:1rem;padding:6px 10px;min-height:48px;">''',1),
('''background:rgba(26,31,23,0.5);border:1px solid rgba(122,179,86,0.15);border-radius:10px;padding:8px 10px;">''',
 '''background:rgba(26,31,23,0.5);border:1px solid rgba(122,179,86,0.15);border-radius:10px;padding:6px 10px;">''',1),
("""      +'radial-gradient(ellipse at top,rgba(200,168,75,0.08),transparent 60%),'
      +'linear-gradient(180deg,rgba(18,22,14,0.98),rgba(10,12,8,0.98));'""",
 """      +'radial-gradient(ellipse at 50% 108%,rgba(74,124,53,0.30),transparent 58%),'
      +'radial-gradient(ellipse at top,rgba(200,168,75,0.08),transparent 60%),'
      +'linear-gradient(180deg,rgba(18,22,14,0.98),rgba(10,12,8,0.98));'""",1),
])

patch('games/slider.js', [
("cursor:pointer;transition:transform .16s cubic-bezier(.2,1.1,.3,1),box-shadow .16s ease,background .16s ease;will-change:transform;text-shadow:0 1px 2px rgba(0,0,0,0.45)}',",
 "cursor:pointer;transition:transform .16s cubic-bezier(.2,1.1,.3,1),box-shadow .16s ease,background .16s ease;will-change:transform;filter:brightness(var(--tint,1));text-shadow:0 1px 2px rgba(0,0,0,0.45)}',\n    '.Dsock{position:absolute;width:var(--ts);height:var(--ts);border-radius:10px;background:radial-gradient(ellipse at 50% 62%,rgba(0,0,0,.6),rgba(0,0,0,.22) 72%);box-shadow:inset 0 4px 12px rgba(0,0,0,.75),inset 0 0 0 1px rgba(0,0,0,.45);pointer-events:none}',",1),
("      el.setAttribute('data-v',val);",
 "      el.setAttribute('data-v',val);\n      /* fifteen tiles shared one silhouette; a per tile brightness jitter (0.93 to 1.07) gives the board a rhythm without touching the palette */\n      el.style.setProperty('--tint',(0.93+((val*7)%9)*0.0175).toFixed(3));",1),
])

patch('games/rootrush.js', [
("var WOOD_COLORS=['#7a5028','#8a5832','#6e4624','#94603a','#6b3c1e','#7f4a26','#8a6042','#9a5836','#654020','#8c5224'];",
 "// ten browns that only spanned #654020 to #9a5836 were indistinguishable at 375 (fleet audit row 150);\n// a pale birch, a grey bark and a dark peat are in the rotation now so neighbours read apart\nvar WOOD_COLORS=['#7a5028','#c4a882','#6e4624','#6a6055','#94603a','#3d2a1c','#8a6042','#9a5836','#5c3a1e','#b08a5a'];",1),
("'.RRblock.vert::after{content:\"\";position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(180deg,transparent 0,transparent 6px,rgba(0,0,0,0.08) 6px,rgba(0,0,0,0.08) 7px);pointer-events:none}',",
 "'.RRblock.vert::after{content:\"\";position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(180deg,transparent 0,transparent 5px,rgba(0,0,0,0.10) 5px,rgba(0,0,0,0.10) 6px),repeating-linear-gradient(180deg,transparent 0,transparent 11px,rgba(255,220,160,0.05) 11px,rgba(255,220,160,0.05) 13px);pointer-events:none}',",1),
("'.RRblock.horiz::after{content:\"\";position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(90deg,transparent 0,transparent 6px,rgba(0,0,0,0.08) 6px,rgba(0,0,0,0.08) 7px);pointer-events:none}',",
 "'.RRblock.horiz::after{content:\"\";position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(90deg,transparent 0,transparent 5px,rgba(0,0,0,0.10) 5px,rgba(0,0,0,0.10) 6px),repeating-linear-gradient(90deg,transparent 0,transparent 11px,rgba(255,220,160,0.05) 11px,rgba(255,220,160,0.05) 13px);pointer-events:none}',",1),
("box-shadow:inset 0 0 0 1px rgba(220,160,90,0.18),inset 0 0 40px rgba(0,0,0,0.6),0 6px 22px rgba(0,0,0,0.55);overflow:visible}',",
 "box-shadow:inset 0 0 0 1px rgba(220,160,90,0.18),inset 0 0 40px rgba(0,0,0,0.6),0 0 70px rgba(0,0,0,0.85),0 10px 30px rgba(0,0,0,0.6);overflow:visible}',",1),
("'.RRb[disabled]{opacity:.35;pointer-events:none}',","'.RRb[disabled]{opacity:.55;border-style:dashed;pointer-events:none}',",1),
("'.RRexit{position:absolute;right:-6px;width:10px;","'.RRexit{position:absolute;right:-10px;width:16px;",1),
])

patch('games/pyramid.js', [
("          if(!isExposed(pi))cd.style.opacity='.5';",
 "          /* covered cards are dimmed by TONE, not opacity: at .5 the white faces merged into one grey haze and 21 of 28 cards lost their edges (fleet audit row 151) */\n          if(!isExposed(pi)){cd.style.filter='brightness(.5) saturate(.65)';cd.style.opacity='1';}",1),
('<button class="gb" id="PYstyle" onclick="_PYToggleStyle()" style="font-size:0.7rem;">','<button class="gb" id="PYstyle" onclick="_PYToggleStyle()" style="font-size:0.75rem;">',1),
])

patch('games/_inline/farkle.js', [
("pan.style.cssText='max-width:min(96vw,560px);margin:0 auto;padding:6px 14px 14px;user-select:none;box-sizing:border-box;'",
 "pan.style.cssText='max-width:min(100vw - 16px,560px);margin:0 auto;padding:6px 14px 14px;user-select:none;box-sizing:border-box;'",1),
("        +'0 6px 22px rgba(0,0,0,0.6);';","        +'0 0 40px rgba(0,0,0,0.8),'\n        +'0 6px 22px rgba(0,0,0,0.6);';",1),
("""      h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;letter-spacing:0.06em;color:rgba(232,220,200,0.5);text-transform:uppercase;">'+(turn>0?'Kept dice glow""",
 """      h+='<div style="font-family:Georgia,serif;font-size:0.75rem;letter-spacing:0.18em;color:rgba(232,220,200,0.62);text-transform:uppercase;">'+(turn>0?'Kept dice glow""",1),
("""        else h+='<span style="font-size:2rem;color:rgba(232,220,200,0.25);">\\u00b7</span>';""",
 """        else h+='<span style="display:block;width:10px;height:10px;border-radius:50%;background:rgba(255,180,90,0.28);box-shadow:0 0 6px rgba(255,180,90,0.25);"></span>';""",1),
("""font-style:italic;font-size:0.7rem;color:rgba(232,220,200,0.65);flex:1 1 140px;""",
 """font-style:italic;font-size:0.72rem;color:rgba(255,220,180,0.78);flex:1 1 140px;""",1),
])

patch('games/flood.js', [
("var AUTUMN=['#4a7c35','#C8A84B','#4a7aaa','#c76a30','#9b59b6','#c75050'];",
 "// sage and slate sat at nearly the same value and merged on the 17 wide Wild board; sage up, slate down (fleet audit row 155)\nvar AUTUMN=['#5a9440','#C8A84B','#3a5f8f','#c76a30','#9b59b6','#c75050'];",1),
("+'.ff-mlabel{font-family:\"DM Mono\",monospace;font-size:.7rem;color:#8a9178;letter-spacing:.12em;margin:16px 0 8px}'",
 "+'.ff-mlabel{font-family:\"DM Mono\",monospace;font-size:.7rem;color:rgba(232,220,200,.62);letter-spacing:.12em;margin:16px 0 8px}'",1),
("+'.ff-pack.sel{border-color:#C8A84B;background:rgba(200,168,75,.12)}'",
 "+'.ff-pack.sel{border-color:#C8A84B;background:rgba(200,168,75,.12)}'\n    +'.ff-pack:not(.sel){opacity:.72}.ff-pack:not(.sel) .sw i{filter:saturate(.8)}'\n    +'.ff-opt .ic{height:30px;display:flex;align-items:center;justify-content:center}'",1),
("""        o.innerHTML='<span class="ic">'+STYLES[idx].ic+'</span>'+STYLES[idx].label;""",
 """        /* every fill style previews ITSELF: a leaf, an enamel disc, a faceted gem, instead of two glyphs beside one picture */
        var sid=STYLES[idx].id, pv;
        if(sid==='leaves') pv='<span class="ic" style="width:30px;border-radius:8px;background:url(assets/games/flood/leaf-gold.png) center/cover"></span>';
        else if(sid==='gem') pv='<span class="ic" style="width:24px;height:24px;margin:3px 0;transform:rotate(45deg);border-radius:26%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.65),rgba(255,255,255,0) 44%),#3a5f8f"></span>';
        else pv='<span class="ic" style="width:30px;border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.4),rgba(255,255,255,0) 44%),#c76a30"></span>';
        o.innerHTML=pv+STYLES[idx].label;""",1),
])

patch('games/vinecross.js', [
("box-shadow:0 8px 28px rgba(0,0,0,0.5),0 0 0 3px #3b2a14;\"></canvas>'",
 "box-shadow:0 0 0 3px #3b2a14,0 0 0 6px rgba(120,86,40,.42),0 14px 34px rgba(0,0,0,.65);\"></canvas>'",1),
("statsRow.style.cssText='display:flex;justify-content:center;gap:14px;padding:2px 0;font-family:DM Mono,monospace;",
 "statsRow.style.cssText='display:flex;justify-content:center;gap:14px;padding:9px 0 11px;margin-bottom:6px;border-bottom:1px solid rgba(122,179,86,.12);font-family:DM Mono,monospace;",1),
("""    +'<button class="gb" id="VChint" onclick="_VCH()" style="min-height:48px;padding:8px 16px;font-size:0.7rem">💡 HINT</button>';""",
 """    +'<button class="gb" id="VChint" onclick="_VCH()" style="min-height:48px;padding:8px 16px;font-size:0.7rem;border-color:rgba(200,168,75,.5);color:#c8a84b">💡 HINT</button>';""",1),
("""    sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,0.45)');
    ctx.fillStyle=sh;ctx.fillRect(0,0,W,W);""",
 """    sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,0.45)');
    ctx.fillStyle=sh;ctx.fillRect(0,0,W,W);
    // wood grain: long faint strokes running one way and two knots, so the board is timber and
    // not brown vinyl (fleet audit row 156). Drawn under the grid lines, deterministic, no image.
    ctx.save();ctx.globalAlpha=0.16;ctx.strokeStyle='#2a1a0a';ctx.lineWidth=1;
    for(var gi=0;gi<26;gi++){var gy=(gi*W/26)+((gi*37)%11)-5;ctx.beginPath();ctx.moveTo(0,gy);
      for(var gx=0;gx<W;gx+=W/6){ctx.quadraticCurveTo(gx+W/12,gy+Math.sin(gx*0.02+gi)*3,gx+W/6,gy+Math.cos(gi*1.7+gx*0.01)*2.4);}ctx.stroke();}
    ctx.globalAlpha=0.22;ctx.strokeStyle='#3b2a14';ctx.lineWidth=1.4;
    var knots=[[W*0.22,W*0.31],[W*0.71,W*0.66]];
    for(var ki=0;ki<knots.length;ki++){for(var kr=3;kr<16;kr+=3.5){ctx.beginPath();ctx.ellipse(knots[ki][0],knots[ki][1],kr*1.6,kr,0.4,0,Math.PI*2);ctx.stroke();}}
    ctx.restore();""",1),
])

patch('games/gardenspades.js', [
("""      +'<feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.06  0 0 0 0 0.08  0 0 0 .08 0"/></filter>'""",
 """      +'<feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 .08 0"/></filter>'""",1),
("      +'linear-gradient(135deg,#0e3a5c 0%,#0a2c46 55%,#062035 100%);'",
 "      +'linear-gradient(135deg,#12271c 0%,#0e2016 55%,#0b1a12 100%);'",1),
("      +'0 6px 22px rgba(0,0,0,0.55);';","      +'0 0 24px 14px rgba(13,16,12,0.9),'\n      +'0 6px 22px rgba(0,0,0,0.55);';",1),
("  var TEAM_COLORS=['#5b9bd1','#dc8a8a']; // us=blue, them=red","  var TEAM_COLORS=['#7ab356','#dc8a8a']; // us=sage, them=rose (blue vanished on the old blue felt, and the felt is green now)",1),
("""<strong id="GSr" style="color:#5b9bd1;font-size:1.2em;">""","""<strong id="GSr" style="color:#7ab356;font-size:1.2em;">""",1),
])
# the five badge sizes under the floor
p=R+'games/gardenspades.js'; s=open(p).read()
for old in ['font-size:0.48rem;','font-size:0.5rem;','font-size:0.6rem;','font-size:0.62rem;']:
    n=s.count(old); print(' gardenspades',old,'x',n); s=s.replace(old,'font-size:0.7rem;')
open(p,'w').write(s)

patch('shared.css', [
("    .gc-empty{background:rgba(14,20,12,.4);border:1px solid rgba(74,124,53,.28);box-shadow:inset 0 0 14px rgba(0,0,0,.5);",
 "    .gc-empty{background:rgba(14,20,12,.4);border:1px solid rgba(74,124,53,.18);box-shadow:inset 0 2px 10px rgba(0,0,0,.6),inset 0 0 0 1px rgba(200,168,75,.22);",1),
])
p=R+'shared.css'; s=open(p).read()
anchor="    .gb{background:rgba(26,31,23,.82);"
i=s.index(anchor); j=s.index('\n',i)
s=s[:j+1]+"    /* a dead control and a live one shared one pill (Five in a Row's REDO, fleet audit row 156): dashed and dimmed when disabled */\n    .gb[disabled],.gb.off{opacity:.38;border-style:dashed}\n"+s[j+1:]
open(p,'w').write(s); print("shared.css .gb[disabled] added")
print("lt13 part A done")
