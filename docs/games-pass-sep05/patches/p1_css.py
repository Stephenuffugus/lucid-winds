import sys
p='/workspaces/Litter_Bug/index.html'; s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old); assert n==count, ("match count %d for %r"%(n,old[:70]))
    s=s.replace(old,new)

# backdrop: seen, not erased
rep('''#bg-far{position:absolute;left:-12%;top:-12%;width:124%;height:124%;z-index:1;
  filter:blur(34px) saturate(.7) brightness(.85);opacity:.62;transition:filter .5s ease,opacity .5s ease}''',
'''#bg-far{position:absolute;left:-12%;top:-12%;width:124%;height:124%;z-index:1;
  filter:blur(14px) saturate(.8) brightness(.9);opacity:.72;transition:filter .5s ease,opacity .5s ease}''')
rep('''  background:linear-gradient(180deg,rgba(18,24,32,.86) 0%,rgba(11,13,16,.94) 52%,rgba(11,13,16,.985) 100%)}''',
'''  background:linear-gradient(180deg,rgba(18,24,32,.55) 0%,rgba(11,13,16,.68) 52%,rgba(11,13,16,.80) 100%)}
/* the same alley, outside the stage: a 540x960 stage on a 412x915 phone leaves a 90px band top
   and bottom, and until 2026-09-05 those bands were dead black. Now the alley runs under them. */
#wrap-bg{position:absolute;left:-6%;top:-6%;width:112%;height:112%;z-index:0;pointer-events:none;
  filter:blur(22px) saturate(.6) brightness(.5);opacity:.75}
#wrap-bg svg{width:100%;height:100%;display:block}
#stage{z-index:1}''')
rep('''#stage[data-scr="s-dump"] #bg-far,#stage[data-scr="s-arena"] #bg-far{filter:blur(34px) saturate(.85) brightness(.72) hue-rotate(-22deg);opacity:.7}
#stage[data-scr="s-dex"] #bg-far,#stage[data-scr="s-spec"] #bg-far{filter:blur(38px) saturate(.55) brightness(.9) hue-rotate(16deg);opacity:.5}
#stage[data-scr="s-mint"] #bg-far{filter:blur(30px) saturate(1) brightness(1.05);opacity:.8}
#stage[data-scr="s-play"] #bg-far{filter:blur(42px) saturate(.4) brightness(.6);opacity:.4}''',
'''#stage[data-scr="s-dump"] #bg-far,#stage[data-scr="s-arena"] #bg-far{filter:blur(14px) saturate(.85) brightness(.72) hue-rotate(-22deg);opacity:.75}
#stage[data-scr="s-dex"] #bg-far,#stage[data-scr="s-spec"] #bg-far{filter:blur(18px) saturate(.55) brightness(.9) hue-rotate(16deg);opacity:.6}
#stage[data-scr="s-mint"] #bg-far{filter:blur(12px) saturate(1) brightness(1.05);opacity:.85}
#stage[data-scr="s-play"] #bg-far{filter:blur(20px) saturate(.5) brightness(.6);opacity:.5}''')

# the scene layer inside a field, and the block picker icons
rep('''/* ── micro games ── */
.field{position:relative;flex:1;border-radius:16px;border:1px solid var(--line);overflow:hidden;
  background:#0e141b;margin-top:12px}''',
'''/* ── micro games ── */
.field{position:relative;flex:1;border-radius:16px;border:1px solid var(--line);overflow:hidden;
  background:#0e141b;margin-top:12px}
/* every job draws a PLACE under its pieces: a chute, a heap, a wall, a shelf. Sized to the
   real field at init, so the scene never stretches. Pointer events off: it is never a target. */
.scene{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:0}
.field>*:not(.scene){z-index:1}
.fieldchip{position:absolute;left:12px;top:12px;z-index:3;pointer-events:none;font-size:13px;font-weight:800;
  letter-spacing:1.5px;color:var(--shine);background:#0b0d10cc;border:1px solid var(--line);border-radius:999px;padding:7px 12px}
/* the block picker: an icon of the place, the name, and your best on that block */
.btn.job{justify-content:flex-start;gap:14px;padding:0 16px 0 12px;text-align:left}
.btn.job .bi{width:58px;height:58px;flex:none;border-radius:12px;background:#0b0f14;border:1px solid #28323d;
  display:flex;align-items:center;justify-content:center;overflow:hidden}
.btn.job .bi svg{width:58px;height:58px;display:block}
.btn.job .bn{flex:1;min-width:0;font-size:19px}
.btn.job .best{flex:none;font-size:12px;letter-spacing:1px;color:var(--dim);font-weight:800;text-align:right;line-height:1.2}
.btn.job .best b{display:block;font-size:17px;color:var(--shine)}
.btn.job.primary .best,.btn.job.primary .best b{color:#08150c}
.btn.job.primary .bi{background:#123a1f;border-color:#2f8a4c}''')
rep('''.bin{min-height:96px;border-radius:14px;border:2px solid var(--line);background:#151c25;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;
  font-size:15px;font-weight:800;letter-spacing:.5px}''',
'''.bin{min-height:110px;border-radius:14px;border:2px solid var(--line);background:linear-gradient(180deg,#1a2330,#10161d);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;
  font-size:15px;font-weight:800;letter-spacing:.5px;position:relative;overflow:hidden}
.bin svg{width:54px;height:54px;display:block}''')
rep('''.falling{position:absolute;width:66px;height:66px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
  background:#141b24;
  border-radius:12px;font-size:13px;font-weight:800;text-align:center;line-height:1.1;padding:4px;
  box-shadow:0 6px 14px #0007}''',
'''.falling{position:absolute;width:92px;height:92px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
  background:none;border-radius:14px;font-size:13px;font-weight:800;text-align:center;line-height:1.1;padding:2px;
  filter:drop-shadow(0 6px 4px #0009)}''')
rep('''.falling.active{outline:3px solid #fff;outline-offset:3px;filter:brightness(1.12)}''',
'''.falling.active{background:#ffffff14;box-shadow:0 0 0 3px #fff,0 0 22px #fff8;filter:drop-shadow(0 6px 4px #0009) brightness(1.12)}''')
rep('''.pileitem{position:absolute;width:44px;height:44px;display:flex;align-items:center;justify-content:center;
  border-radius:9px;background:#39485a}
.flab{font-size:8.5px;font-weight:700;letter-spacing:.02em;line-height:1}''',
'''/* ⛔ 68 CSS px, not 44: at the 0.763 stage scale of a 412 phone the old tile landed at 34 REAL
   px, under the 48 floor, and the audit driver measured it at 36 to 40. No tile plate now: the junk
   lies on the heap with its own cast shadow, and the hit area is the invisible 68px square. */
.pileitem{position:absolute;width:68px;height:68px;display:flex;align-items:center;justify-content:center;
  border-radius:12px;background:transparent}
.pileitem svg{width:56px;height:56px;display:block}
.flab{font-size:12px;font-weight:800;letter-spacing:.03em;line-height:1;text-shadow:0 1px 2px #000}''')
rep('''/* ── pry the lids ── */
.prywrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:20px}
.pryhint{font-size:17px;color:var(--dim);text-align:center;min-height:48px;line-height:1.4}''',
'''/* ── pry the lids ── */
.prywrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:10px;padding:18px 20px 0}
.pryhint{font-size:17px;color:var(--ink);text-align:center;min-height:48px;line-height:1.4;text-shadow:0 1px 3px #000;
  background:#0b0d10aa;border-radius:12px;padding:8px 14px}
.prylid{width:300px;height:300px;flex:none}
.prylid svg{width:100%;height:100%;display:block}
.pryshelf{position:absolute;left:0;right:0;bottom:22px;height:96px;display:flex;align-items:flex-end;justify-content:center;gap:4px;padding:0 14px;pointer-events:none}
.pryshelf svg{width:40px;height:56px;display:block;flex:none}''')
# the old bar styles stay in the file unused by the lid, harmless; the dumpster lock panel + ghost cards
rep('''/* ── the dumpster ── */
.champbar{display:flex;align-items:center;gap:12px;border:1px solid #2f4a38;border-radius:15px;
  background:#111b16;padding:10px 12px;margin-top:10px}''',
'''/* ── the dumpster ── */
/* before your first bug the screen used to be one grey sentence, an empty green outline and 500px
   of nothing. Now it is a closed dumpster with a padlock, the sentence in cream, and the door to the
   alley, which is the thing the sentence is telling you to go and do. */
.lockpanel{display:flex;flex-direction:column;align-items:center;gap:8px;border:1px solid var(--line);border-radius:18px;
  background:#0f151bcc;padding:18px 18px 22px;margin-top:10px;text-align:center}
.lockpanel svg{width:260px;height:180px;display:block}
.lockpanel .lk{font-size:19px;line-height:1.45;color:var(--ink);max-width:400px}
.lockpanel .lk2{font-size:15px;line-height:1.45;color:var(--dim);max-width:400px}
#k-note{font-size:17px;color:var(--ink);line-height:1.5}
.champbar{display:flex;align-items:center;gap:12px;border:1px solid #2f4a38;border-radius:15px;
  background:#111b16;padding:10px 12px;margin-top:10px}
.champstrip .cs.ghost{border-style:dashed;border-color:#28323d;background:#0e141b;cursor:default;color:#3d4956}
.champstrip .cs.ghost .l{color:#3d4956;font-size:10px;letter-spacing:1px}''')
open(p,'w').write(s); print("css patched")
