P='/workspaces/lucid-winds/satellites/attic/index.html'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)
rep("""#shelfSheet{ position:fixed; inset:0; z-index:65; display:none; background:#100d0b;
  overflow-y:auto; -webkit-overflow-scrolling:touch;""",
"""/* THE SHELF AS A ROOM (2026-09-05). It was a grid of boxed cards on a black screen. Now the
   wall is boards, every row of finds stands on one continuous plank (the cards have no box
   and no gap, so their plank segments join), the label hangs under the board, and a factory
   sealed find lives in a glass case. */
#shelfSheet{ position:fixed; inset:0; z-index:65; display:none;
  background:linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0) 180px),
    repeating-linear-gradient(90deg, #15110d 0 44px, #0e0b08 44px 47px), #100d0b;
  overflow-y:auto; -webkit-overflow-scrolling:touch;""")
rep(""".shGrid{ display:grid; grid-template-columns:repeat(2, 1fr); gap:12px }""",
    """.shGrid{ display:grid; grid-template-columns:repeat(2, 1fr); column-gap:0; row-gap:30px }""")
rep(""".shCard{ background:#1e1811; border:1px solid #3a2e1e; border-radius:10px; padding:8px 8px 10px;
  display:flex; flex-direction:column; gap:7px; min-height:48px; cursor:pointer; text-align:left;
  box-shadow:0 6px 18px rgba(0,0,0,0.45) }
.shCard:active{ border-color:#6a552c }
.shCard svg{ width:100%; height:auto; display:block; border-radius:4px }""",
""".shCard{ background:transparent; border:0; border-radius:0; padding:0; margin:0;
  display:flex; flex-direction:column; gap:0; min-height:48px; cursor:pointer; text-align:left; font:inherit; color:inherit }
.shCard:active .shObj{ filter:brightness(1.12) }
.shObj{ padding:8px 10px 0; position:relative }
.shObj svg{ width:100%; height:auto; display:block }
/* the plank: a board with a lit top edge, grain, and the shadow it throws on the wall below */
.shPlank{ height:14px; position:relative; background:linear-gradient(180deg, #6b4d2c 0, #4b3620 48%, #332413 100%);
  border-top:1px solid #a07a44; box-shadow:0 9px 14px rgba(0,0,0,0.62) }
.shPlank::after{ content:""; position:absolute; inset:0;
  background:repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 11px, rgba(0,0,0,0.13) 11px 13px) }
.shLabel{ padding:12px 8px 0; display:flex; flex-direction:column; gap:7px }
/* the glass case: a sealed find sits behind glass on its plank, a glare down its left side */
.shCard.sealed .shObj{ margin:0 4px; padding:10px 8px 2px;
  background:linear-gradient(160deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03) 42%, rgba(255,255,255,0.09));
  border:1px solid rgba(245,216,122,0.62); border-bottom:0; border-radius:5px 5px 0 0;
  box-shadow:inset 0 0 20px rgba(245,216,122,0.14), 0 0 14px rgba(245,216,122,0.12) }
.shCard.sealed .shObj::after{ content:""; position:absolute; left:9%; top:5%; width:20%; height:72%; pointer-events:none;
  background:linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0)); transform:skewX(-8deg); border-radius:3px }""")
rep("""  .shCard.sealed { border-color:#f5d87a;
    box-shadow:0 0 0 1px rgba(245,216,122,0.45), 0 6px 22px rgba(0,0,0,0.5); }""",
"""  /* .shCard.sealed is the glass case now, styled with the shelf */""")
rep("""      html += '<button class="shCard' + (wiped && it.grade === 'FACTORY SEALED' ? ' sealed' : '') + '" data-h="' + h + '">'
        + ATTIC_OBJECT.renderItem(h, 260, { dusty: !wiped }).svg
        + '<div class="shName">' + esc(it.name) + (wiped && it.revealSuffix ? esc(it.revealSuffix) : '') + '</div>'
        + '<div class="shFoot">'
        + '<span class="shChip' + (wiped && it.grade === 'FACTORY SEALED' ? ' sealed' : '') + '">'
        + (wiped ? esc(it.grade) : 'UNWIPED') + '</span>'
        + '<span class="shWhen">' + esc(foundWhen(h)) + '</span>'
        + '</div></button>';""",
"""      html += '<button class="shCard' + (wiped && it.grade === 'FACTORY SEALED' ? ' sealed' : '') + '" data-h="' + h + '">'
        + '<div class="shObj">' + ATTIC_OBJECT.renderItem(h, 260, { dusty: !wiped }).svg + '</div>'
        + '<div class="shPlank"></div>'
        + '<div class="shLabel"><div class="shName">' + esc(it.name) + (wiped && it.revealSuffix ? esc(it.revealSuffix) : '') + '</div>'
        + '<div class="shFoot">'
        + '<span class="shChip' + (wiped && it.grade === 'FACTORY SEALED' ? ' sealed' : '') + '">'
        + (wiped ? esc(it.grade) : 'UNWIPED') + '</span>'
        + '<span class="shWhen">' + esc(foundWhen(h)) + '</span>'
        + '</div></div></button>';""")
open(P,'w').write(s); print('shelf room patched')

C='/workspaces/lucid-winds/satellites/attic/check.js'
s=open(C).read()
anchor="    group('the wear line waits for the wipe');"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    group('the shelf is a room: a plank under every row, a case around a sealed find');
    const room = await page.evaluate(() => {
      const D = window.ATTIC_DEV;
      /* a sealed find on the shelf, wiped, so the case has something to hold */
      const base = D.shelf()[0]; const sealedH = base.slice(0, 4) + 'ff' + base.slice(6);
      D.shelf().push(sealedH); D.revealed()[sealedH] = 1;
      D.openShelf();
      const cards = [...document.querySelectorAll('#shGrid .shCard')];
      const parts = cards.every(c => c.querySelector('.shObj svg') && c.querySelector('.shPlank') && c.querySelector('.shLabel .shName'));
      const planks = cards.slice(0, 2).map(c => c.querySelector('.shPlank').getBoundingClientRect());
      const sameRow = planks.length === 2 && Math.abs(planks[0].top - planks[1].top) < 1 && Math.abs(planks[0].right - planks[1].left) < 1;
      const plankH = planks.length ? planks[0].height : 0;
      const wall = getComputedStyle(document.getElementById('shelfSheet')).backgroundImage;
      const sealed = document.querySelector('#shGrid .shCard.sealed .shObj');
      const cs = sealed ? getComputedStyle(sealed) : null;
      const caseOk = !!cs && parseFloat(cs.borderTopWidth) >= 1 && cs.backgroundImage !== 'none';
      const cardBox = getComputedStyle(cards[0]).borderTopWidth;
      D.shelf().pop(); delete D.revealed()[sealedH];
      D.closeShelf();
      return { n: cards.length, parts, sameRow, plankH: Math.round(plankH), wall: wall !== 'none', caseOk, cardBox };
    });
    ok('every find stands on a plank with its label under the board', room.n >= 4 && room.parts, JSON.stringify(room));
    ok('two finds in a row share one continuous plank', room.sameRow && room.plankH >= 10, JSON.stringify({ sameRow: room.sameRow, plankH: room.plankH }));
    ok('the wall is boards, and the cards have no box of their own', room.wall && room.cardBox === '0px', JSON.stringify({ wall: room.wall, cardBox: room.cardBox }));
    ok('a factory sealed find sits in a glass case', room.caseOk, room.caseOk);

"""+anchor)
open(C,'w').write(s); print('gate patched')
