import sys
E='/workspaces/lucid-winds/satellites/attic/attic-engine.js'
s=open(E).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor count %d != %d: %s'%(c,n,old[:80]))
    s=s.replace(old,new)

rep("""  function provenance(h) {
    return PROV[hb(h, 5) % PROV.length].replace('{p}', PLACES[hb(h, 6) % PLACES.length]);
  }
""","""  function provenance(h) {
    return PROV[hb(h, 5) % PROV.length].replace('{p}', PLACES[hb(h, 6) % PLACES.length]);
  }

  /* ── WEAR: where the condition came from ──────────────────────────────
     The plate says GOOD; this says why. One line per find, chosen by the grade
     and told in the past tense, so a grade is a life the object had and not a
     label. FINE and NEAR MINT had NOTHING after the wipe before 2026-09-05
     (the class flaw prints on the low three, the mint tag on the top two).
     ⛔ GRADE DERIVED, so it is a reveal flourish: `revealStory`, printed only
     after the wipe, never in the sticker, the sub or the provenance. */
  var WEAR = {
    'TRASHED': [
      'Two winters in a wet basement did this.', 'A dog got to it first, then the damp.',
      'It rode loose in a truck bed for most of a decade.', 'Kids. Years and years of kids.',
      'A pipe let go above the shelf it sat on.', 'Somebody used it to prop a door through a whole summer.',
      'Left in a garage by a window that faced south.', 'It was in the box the mice found.',
      'Stored under the sink with the bleach.', 'Went through a flood, then a yard sale, then a flood.'
    ],
    'PLAYED': [
      'Loved hard by one kid and handed down to a younger brother.', 'Out every Saturday morning for six years.',
      'Took it to school in a backpack, more than once.', 'It went to camp three summers running.',
      'Lived on the floor of a shared bedroom.', 'Lent out and returned, and returned again.',
      'Passed around a whole street of cousins.', 'Rode along on every long drive to grandma\\'s.',
      'Worked for a living: this one got used.', 'Somebody\\'s favourite, and it shows.'
    ],
    'GOOD': [
      'Played with, then put away properly.', 'One careful owner and one careless one.',
      'Kept on a shelf that caught the afternoon sun.', 'Handled plenty, dropped once.',
      'Taken out for holidays and boxed again after.', 'A grown up owned this and treated it as one.',
      'Sat in a den for twenty years next to the good chair.', 'Used, wiped down, and used again.',
      'Kept in the original box with the lid a little off.', 'Enjoyed by someone who read the instructions.'
    ],
    'FINE': [
      'Handled by adults only.', 'Opened once at Christmas, then boxed.',
      'Kept in the closet with the good sheets.', 'A collector had it before you and it shows.',
      'Lived in a glass front cabinet in a quiet house.', 'The kind of thing a grandmother kept for company.',
      'Stayed in a drawer that nobody else was allowed in.', 'Bought, admired, shelved, forgotten kindly.'
    ],
    'NEAR MINT': [
      'Nobody ever really played with it.', 'Bought as a spare and never needed.',
      'Kept in a display case, out of the sun.', 'Thirty years in tissue paper.',
      'Set aside the day it came home and left there.', 'The owner looked but never touched.',
      'Filed in a closet with the tags still on.', 'Stayed in the bag it was sold in.'
    ],
    'MINT': [
      'Never opened. Somebody always meant to.', 'A store went under with it still on the shelf.',
      'Sat in a warehouse behind a pallet for decades.', 'Bought two, opened one. This is the other.',
      'A layaway nobody came back for.', 'Boxed in the stockroom, missed at the count.'
    ],
    'FACTORY SEALED': [
      'The tape is the factory\\'s tape. Nobody has been inside.', 'Shrink still tight, corners still square.',
      'Straight from a case that was never cut open.', 'Sealed the day it was made and sealed today.'
    ]
  };
  function wearStory(h) {
    var bank = WEAR[grade(h)] || WEAR.GOOD;
    /* a fresh index off two bytes the provenance already spends, folded so the
       story does not march in step with the place */
    return bank[(hb(h, 6) * 7 + hb(h, 5) * 3 + hb(h, 4)) % bank.length];
  }
""")
rep("""    item.revealSuffix = null;
    item.revealNote = null;
    var g = item.grade;""","""    item.revealSuffix = null;
    item.revealNote = null;
    item.revealStory = wearStory(h);
    var g = item.grade;""")
rep("    hashToItem: hashToItem, _grade: grade, _class: classOf, _norm: normHash,",
    "    hashToItem: hashToItem, _grade: grade, _class: classOf, _norm: normHash, _wear: wearStory, WEAR: WEAR,")
open(E,'w').write(s); print('engine patched')

# ── the page ───────────────────────────────────────────────────────────
P='/workspaces/lucid-winds/satellites/attic/index.html'
s=open(P).read()
rep("  .gradeSlot { margin-top:14px; }",
"  .gradeSlot { margin-top:14px; }\n"
"  /* the wear line: why the plate says what it says. Empty until the wipe. */\n"
"  .wear { display:none; font-size:0.82rem; font-style:italic; color:#c4b294; line-height:1.45; margin-top:8px; text-align:center; }\n"
"  .graded .wear { display:block; }")
rep("""      +   '<div class="gradePlate" id="gp"></div>'
      + '</div>'
      + '<div class="meta">' + h.slice(0, 16) + '&hellip; &middot; ' + it.year + '</div>'""",
"""      +   '<div class="gradePlate" id="gp"></div>'
      +   '<div class="wear" id="wearSlot">' + (isRevealed ? esc(it.revealStory || '') : '') + '</div>'
      + '</div>'
      + '<div class="meta">' + h.slice(0, 16) + '&hellip; &middot; ' + it.year + '</div>'""")
rep("""      if (it.revealNote) document.getElementById('noteSlot').textContent = it.revealNote;
      payForReveal(h, it);""",
"""      if (it.revealNote) document.getElementById('noteSlot').textContent = it.revealNote;
      document.getElementById('wearSlot').textContent = it.revealStory || '';
      payForReveal(h, it);""")
rep("""      + '<div class="gradeSlot">' + plateHTML(it, wiped) + '</div>';
    document.getElementById('fcBack').innerHTML =""",
"""      + '<div class="gradeSlot' + (wiped ? ' graded' : '') + '">' + plateHTML(it, wiped)
      +   '<div class="wear">' + (wiped ? esc(it.revealStory || '') : '') + '</div></div>';
    document.getElementById('fcBack').innerHTML =""")
rep("""      + row('CONDITION', wiped ? it.grade : 'not wiped yet')
      + row('ERA', it.era + ', dated ' + it.year)""",
"""      + row('CONDITION', wiped ? it.grade : 'not wiped yet')
      + (wiped && it.revealStory ? row('WEAR', it.revealStory) : '')
      + row('ERA', it.era + ', dated ' + it.year)""")
# canvas card: the wear line under the plate
rep("""      x.fillText(label, W / 2, py + 41);
      x.fillStyle = '#9a8a6e'; x.font = '14px ui-monospace, monospace';""",
"""      x.fillText(label, W / 2, py + 41);
      if (wiped && it.revealStory) {
        x.fillStyle = '#c4b294'; x.font = 'italic 17px Georgia, serif';
        wrapText(x, it.revealStory, W / 2, py + ph + 24, W - 110, 22, 1);
      }
      x.fillStyle = '#9a8a6e'; x.font = '14px ui-monospace, monospace';""")
open(P,'w').write(s); print('page patched')
