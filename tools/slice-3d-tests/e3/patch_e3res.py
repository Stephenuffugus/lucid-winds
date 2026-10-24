# The E2/E3 review residuals, applied over the E3 tree: the wasp window reaches the whole segment spacing (8.5), row [1]
# reads the finds and opens the Daily card for every poison, and the 8.5 window is pinned (dive 45.400).
import io
G='/workspaces/lucid-winds/satellites/slice-3d/index.html'
A='/workspaces/lucid-winds/satellites/slice-3d/audit-check.mjs'
def sub(p, pairs):
    s=io.open(p,encoding='utf-8').read()
    for a,b in pairs:
        assert s.count(a)==1, (p, a[:90], s.count(a))
        s=s.replace(a,b)
    io.open(p,'w',encoding='utf-8').write(s)
sub(G, [("&&!clHit(P.W, c.x-0.6, c.x+0.6, y1-1, y1+8)){",
         "&&!clHit(P.W, c.x-0.6, c.x+0.6, y1-1, y1+8.5)){")])   # 8.5: a piece sits 8.5 to 13.5 under a wasp (ffSegments)
sub(A, [
 ("""  ['s3d_daily', '5'], ['s3d_daily', '{"day":5}'], ['s3d_daily', '{"day":"x","gen":1,"used":"yes","done":0,"score":-3}'], ['s3d_dex', '{"hasOwnProperty":1}']
];""",
  """  ['s3d_daily', '5'], ['s3d_daily', '{"day":5}'], ['s3d_daily', '{"day":"x","gen":1,"used":"yes","done":0,"score":-3}'], ['s3d_dex', '{"hasOwnProperty":1}'],
  /* the reviews: a string dex (the boot filter cannot delete from it), and a record for TODAY with a null score */
  ['s3d_dex', '"abc"'], ['s3d_daily', JSON.stringify({ day: new Date().toISOString().slice(0, 10), gen: 1, used: true, done: false, score: null })]
];"""),
 ("""    const out = { boot: true };
    try {
      window._S3.newGame(1); out.started = !!window._S3.state();""",
  """    const out = { boot: true };
    try {
      const dx = window._S3.dex(); out.dexEmpty = Object.prototype.toString.call(dx) === '[object Object]' && Object.keys(dx).length === 0;
      window._S3.newGame(1); out.started = !!window._S3.state();"""),
 ("""      out.slivSane = window._S3forge.sliv() >= 0;
    } catch (e) { out.threw = e.message.slice(0, 90); }""",
  """      out.slivSane = window._S3forge.sliv() >= 0;
      window._S3.showDaily(); const dl = window._S3.dly();   /* s3d_daily is read when the card opens, never at boot */
      out.dailySane = document.getElementById('s-daily').classList.contains('on') && dl.day === new Date().toISOString().slice(0, 10) && dl.used === false && dl.done === false && dl.score === 0;
    } catch (e) { out.threw = e.message.slice(0, 90); }"""),
 ("""    JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
  await ctx.close();
}""",
  """    JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
  if (k === 's3d_dex') ok(`${k}=${v} leaves the finds an empty set`, r.dexEmpty === true, JSON.stringify(r));
  if (k === 's3d_daily') ok(`${k}=${v} opens the Daily card on a fresh record for today`, r.dailySane === true && !r.threw && !errs.length, JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
  await ctx.close();
}"""),
 ("[33, 77], [38, 77], [10, 79], [13, 78], [15, 77], [12, 78]]) { S.salt(sd); S.newFF(l);",
  "[33, 77], [38, 77], [10, 79], [13, 78], [15, 77], [12, 78], [45, 400]]) { S.salt(sd); S.newFF(l);"),
 ("""    '10.79': '4.72@-370.49x11|5.65@-318.25x8', '13.78': '-0.20@-73.53x9|-0.25@-88.91x7', '15.77': '5.05@-399.15x11', '12.78': '' };""",
  """    '10.79': '4.72@-370.49x11|5.65@-318.25x8', '13.78': '-0.20@-73.53x9|-0.25@-88.91x7', '15.77': '5.05@-399.15x11', '12.78': '',
    '45.400': '' };   /* 45.400: a wasp 13.1 u over its one stack sweeps it as every knife arrives (the entry window reaches 8.5) */"""),
])
print('E3 residuals applied')
