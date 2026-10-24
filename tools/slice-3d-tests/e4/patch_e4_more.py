# Row [21] additions after my own pass (before the review's): the boss still wears cell 1 (with the crack) after the first
# hit, and the end panel forfeits Clean Slice when the boss was skipped (a rope cut) but keeps it when the boss is fought down.
import io, sys
A=sys.argv[1] if len(sys.argv)>1 else '/workspaces/lucid-winds/satellites/slice-3d/audit-check.mjs'
s=io.open(A,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1, (a[:90], s.count(a))
    s=s.replace(a,b)
rep("""    /* the chamber's walls are padded: a blade driven into one bounces */""",
"""    /* the end panel: a skipped boss forfeits Clean Slice (every target cut, then a rope); a boss fought down keeps it (5.78 has a line) */
    const panelAfter = skip => { S.salt(78); S.newFF(5); const G = S.g(), B = S.boss(), M = S.world().clean.M; G.cleanN = M;
      if (skip) { B.hits = 1; B.lobs = 1; B.x = B.tx = 0; G.x = 0; G.y = B.netY + 1; G.vx = 0; G.vy = Math.sqrt(2 * 21 * ((B.y + 5) - B.netY)); G.w = 0; G.ang = Math.PI / 2;
        for (let n = 0; n < 900 && !G.done; n++) { S.hold((n >= 24 && n < 54) ? 1 : 0); S.stepN(1, D); } S.hold(0); }
      else { G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0); }
      for (let n = 0; n < 6000 && !G.done; n++) S.stepN(1, D);
      const go = document.getElementById('s-go'); for (let n = 0; n < 600 && !go.classList.contains('on'); n++) S.stepN(1, D);
      return { M, skipped: B.skipped, cleared: B.cleared, failed: !!G.failed, text: document.getElementById('go-clean-t').textContent }; };
    out.cleanSkip = panelAfter(true); out.cleanWin = panelAfter(false);
    /* the chamber's walls are padded: a blade driven into one bounces */""")
rep("""  ok("the chamber's walls are padded: a blade into one bounces",""",
"""  ok('a skipped boss forfeits Clean Slice on the end panel; a boss fought down keeps it', !!r.cleanSkip && r.cleanSkip.M > 0 && r.cleanSkip.skipped && !r.cleanSkip.failed && /, boss skipped$/.test(r.cleanSkip.text) && !!r.cleanWin && r.cleanWin.cleared && !r.cleanWin.failed && r.cleanWin.text === 'Clean Slice', JSON.stringify([r.cleanSkip, r.cleanWin]));
  ok("the chamber's walls are padded: a blade into one bounces",""")
rep("""r.c1 === 0.01 && r.seen[1].crack > 0.5 &&""", """r.c1 === 0.01 && r.seen[1].off === 0.01 && r.seen[1].crack > 0.5 &&""")
io.open(A,'w',encoding='utf-8').write(s); print('E4 suite additions applied')
