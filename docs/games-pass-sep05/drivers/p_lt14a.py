R='/workspaces/lucid-winds/'
def patch(fn, pairs):
    p=R+fn; s=open(p).read()
    for old,new,cnt in pairs:
        n=s.count(old); assert n==cnt, ("%s: match count %d (want %d) for %r"%(fn,n,cnt,old[:70]))
        s=s.replace(old,new)
    open(p,'w').write(s); print("patched",fn,len(pairs))

# ── Sokoban: the floor runs under the player and the crate, the grid gets an edge ──
patch('games/_inline/sokoban.js', [
("""        else if(isPlayer){d.style.background='rgba(26,31,23,.4)';d.innerHTML=ART.player}""",
 """        else if(isPlayer){d.style.position='relative';d.innerHTML=ART.floor+ART.player;d.querySelectorAll('img').forEach(function(im,idx){if(idx===0)im.style.cssText+='position:absolute;inset:0;';if(idx===1)im.style.cssText+='position:relative;z-index:1;';});}""",1),
("""        else if(isCrate){d.style.background='rgba(26,31,23,.4)';d.innerHTML=ART.crate}""",
 """        else if(isCrate){d.style.position='relative';d.innerHTML=ART.floor+ART.crate;d.querySelectorAll('img').forEach(function(im,idx){if(idx===0)im.style.cssText+='position:absolute;inset:0;';if(idx===1)im.style.cssText+='position:relative;z-index:1;';});}""",1),
])
patch('shared.css', [
("    .skg{display:grid;gap:clamp(1px,.4vw,3px);width:clamp(240px,96vw,480px);max-width:100%;box-sizing:border-box;margin:0 auto;padding:clamp(4px,1.5vw,8px);background:rgba(13,16,12,.25);border-radius:clamp(6px,2vw,10px);animation:boardFadeIn .4s ease}",
 "    .skg{display:grid;gap:clamp(1px,.4vw,3px);width:clamp(240px,96vw,480px);max-width:100%;box-sizing:border-box;margin:0 auto;padding:clamp(6px,1.8vw,10px);background:rgba(10,14,9,.55);border:1px solid rgba(200,168,75,.18);border-radius:clamp(8px,2.4vw,14px);box-shadow:inset 0 0 28px rgba(0,0,0,.55),0 10px 26px rgba(0,0,0,.45);animation:boardFadeIn .4s ease}",1),
# Chess: the status line becomes a gold hairline strip in the serif the frame implies; the legal move dots read over painted wood
("    .ch-status{text-align:center;padding:6px 8px;font-size:clamp(.7rem,2.2vw,.95rem);color:var(--cream);font-family:'DM Mono',monospace}",
 "    .ch-status{text-align:center;padding:9px 8px;margin:10px auto 2px;width:clamp(300px,92vw,420px);font-size:clamp(.78rem,2.4vw,.98rem);color:var(--cream);font-family:Georgia,serif;letter-spacing:.06em;border-top:1px solid rgba(200,168,75,.28);border-bottom:1px solid rgba(200,168,75,.12)}\n    .ch-wrap{box-shadow:0 24px 60px -22px rgba(0,0,0,.9)}\n    .ch-wrap::after{content:'';position:absolute;left:4%;right:4%;bottom:-30px;height:30px;background:linear-gradient(180deg,rgba(0,0,0,.42),rgba(0,0,0,0));pointer-events:none;border-radius:0 0 50% 50%/0 0 100% 100%}",1),
("    .chs.ch-move::after{content:'';position:absolute;width:28%;height:28%;border-radius:50%;background:rgba(122,179,86,.5);z-index:1;box-shadow:0 0 6px rgba(122,179,86,.3)}",
 "    .chs.ch-move::after{content:'';position:absolute;width:28%;height:28%;border-radius:50%;background:rgba(122,179,86,.78);z-index:1;box-shadow:0 0 6px rgba(122,179,86,.45),0 0 0 2px rgba(0,0,0,.35)}",1),
("    .chs.ch-cap::after{content:'';position:absolute;width:80%;height:80%;border-radius:50%;border:3px solid rgba(200,60,60,.5);background:rgba(200,60,60,.08);z-index:1}",
 "    .chs.ch-cap::after{content:'';position:absolute;width:80%;height:80%;border-radius:50%;border:3px solid rgba(220,80,80,.75);background:rgba(200,60,60,.1);z-index:1}",1),
# Echo: the painted tiles were muddy at .65, the flash blew them to white, the season label was 6.7px
("transition:filter .15s,transform .12s,opacity .2s;opacity:.65;-webkit-tap-highlight-color:transparent;min-height:48px;background-size:cover;",
 "transition:filter .15s,transform .12s,opacity .2s;opacity:.85;-webkit-tap-highlight-color:transparent;min-height:48px;background-size:cover;",1),
("    .st.lt{opacity:1;transform:scale(1.06);filter:brightness(1.8) saturate(1.3);",
 "    .st.lt{opacity:1;transform:scale(1.06);filter:brightness(1.35) saturate(1.15);",1),
("    .st .sl{font-size:clamp(.42rem,1.2vw,.55rem);margin-top:clamp(4px,1.5vw,8px);letter-spacing:.06em;opacity:.7;text-shadow:0 1px 3px rgba(0,0,0,.8)}",
 "    .st .sl{font-size:clamp(.72rem,3vw,.85rem);margin-top:clamp(4px,1.5vw,8px);letter-spacing:.08em;opacity:.95;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 8px rgba(0,0,0,.7)}",1),
])
# the fleet win screen showed the game's own controls through its scrim (Sokoban row, but every native)
patch('play/shell.js', [
("' 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:Georgia,serif;';\n    ov.innerHTML='<div style=\"font-size:3rem;line-height:1;\">'+(o.won?",
 "' 0%,rgba(13,16,12,0.985) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:Georgia,serif;';\n    ov.innerHTML='<div style=\"font-size:3rem;line-height:1;\">'+(o.won?",1),
])
# Euchre: the four labels under the floor, and the trick well's hard rectangle
patch('games/bowergarden.js', [
("""font-size:0.48rem;font-family:Georgia,serif;font-style:italic;color:rgba(232,220,200,0.55);background:rgba(0,0,0,0.3);border:1px solid rgba(232,220,200,0.2);border-radius:3px;vertical-align:middle'+fresh+'">passed</span>';""",
 """font-size:0.68rem;font-family:Georgia,serif;font-style:italic;color:rgba(232,220,200,0.85);background:rgba(0,0,0,0.3);border:1px solid rgba(232,220,200,0.25);border-radius:3px;vertical-align:middle'+fresh+'">passed</span>';""",1),
("""    h+='<div style="font-family:DM Mono,monospace;font-size:0.52rem;letter-spacing:0.12em;color:rgba(232,220,200,0.6);text-transform:uppercase;">Dealer<br/>""",
 """    h+='<div style="font-family:DM Mono,monospace;font-size:0.68rem;letter-spacing:0.12em;color:rgba(232,220,200,0.7);text-transform:uppercase;">Dealer<br/>""",1),
("""      h+='<div style="font-size:0.52rem;font-style:italic;color:rgba(232,220,200,0.65);letter-spacing:0.06em;">Strong</div>';""",
 """      h+='<div style="font-size:0.68rem;font-style:italic;color:rgba(232,220,200,0.75);letter-spacing:0.06em;">Strong</div>';""",1),
("""      h+='<div style="font-size:0.6rem;color:var(--muted);margin-bottom:6px;">Make '+_pip(upcard.suit)+' your Strong suit?</div>';""",
 """      h+='<div style="font-size:0.72rem;color:#e8dcc8;margin-bottom:6px;">Make '+_pip(upcard.suit)+' your Strong suit?</div>';""",1),
("""      h+='<div style="font-size:0.6rem;color:var(--muted);margin-bottom:6px;">Pick your Strong suit (not '+_pip(upcard.suit)+'):</div>';""",
 """      h+='<div style="font-size:0.72rem;color:#e8dcc8;margin-bottom:6px;">Pick your Strong suit (not '+_pip(upcard.suit)+'):</div>';""",1),
])
# Petal Match: the build tag leaves the player's HUD, the PETALS label reads on the painting
patch('games/petalmatch.js', [
("""    '<span style="color:#5a614f;font-size:0.55rem;margin-left:4px;">'+PM_BUILD+'</span>';""",
 """    ((function(){ try{ return localStorage.getItem('sws_dev_ok')==='1'; }catch(e){ return false; } })() ? '<span style="color:#5a614f;font-size:0.7rem;margin-left:4px;">'+PM_BUILD+'</span>' : '');""",1),
("""    '<span style="letter-spacing:0.06em;">PETALS</span>'+""",
 """    '<span style="letter-spacing:0.06em;color:#e8dcc8;text-shadow:0 1px 3px rgba(0,0,0,.85);">PETALS</span>'+""",1),
])
print("lt14 part A done")
