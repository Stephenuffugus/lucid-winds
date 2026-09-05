E='/workspaces/lucid-winds/satellites/attic/attic-econ.js'
s=open(E).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)
rep("""  function mergeShelfToDisk(diskRaw, mine) {
    var disk = readShelf(diskRaw), out = [], seen = {}, i;
    for (i = 0; i < mine.length; i++) if (!seen[mine[i]]) { seen[mine[i]] = 1; out.push(mine[i]); }
    for (i = 0; i < disk.length; i++) if (!seen[disk[i]]) { seen[disk[i]] = 1; out.push(disk[i]); }
    return out.slice(0, SHELF_MAX);
  }""",
"""  /* ⛔ THE UNION BROUGHT SCRAPPED FINDS BACK (found 2026-09-05 by a gate that reloaded the
     page). The merge keeps both tabs' finds, which is right, but it kept the DISK copy of a
     find the player had just scrapped, so every scrap came back on the next load with its
     ticket already paid: scrap, reload, scrap again. `gone` is a tombstone map (hash to
     the time it was scrapped), kept for a week, and no merge or boot read lets a hash
     through while its tombstone stands. */
  var GONE_TTL = 7 * 864e5;
  function readGone(raw) {
    var out = {}, p = null, k, v, now = Date.now();
    try { p = (typeof raw === 'string') ? JSON.parse(raw) : raw; } catch (e) { p = null; }
    if (!isObj(p)) return out;
    for (k in p) {
      if (!p.hasOwnProperty(k) || !/^[0-9a-f]{64}$/.test(k)) continue;
      v = Number(p[k]);
      if (!isFinite(v) || v <= 0 || now - v > GONE_TTL) continue;
      out[k] = Math.floor(v);
    }
    return out;
  }
  function mergeGoneToDisk(diskRaw, mine) {
    var d = readGone(diskRaw), k;
    for (k in mine) if (mine.hasOwnProperty(k) && (!d[k] || mine[k] > d[k])) d[k] = mine[k];
    return JSON.stringify(readGone(d));
  }
  function mergeShelfToDisk(diskRaw, mine, gone) {
    var disk = readShelf(diskRaw), out = [], seen = {}, i, g = gone || {};
    for (i = 0; i < mine.length; i++) if (!seen[mine[i]] && !g[mine[i]]) { seen[mine[i]] = 1; out.push(mine[i]); }
    for (i = 0; i < disk.length; i++) if (!seen[disk[i]] && !g[disk[i]]) { seen[disk[i]] = 1; out.push(disk[i]); }
    return out.slice(0, SHELF_MAX);
  }""")
rep("""    readShelf: readShelf, mergeShelfToDisk: mergeShelfToDisk,""",
    """    readShelf: readShelf, mergeShelfToDisk: mergeShelfToDisk, readGone: readGone, mergeGoneToDisk: mergeGoneToDisk, GONE_TTL: GONE_TTL,""")
open(E,'w').write(s); print('econ patched')

P='/workspaces/lucid-winds/satellites/attic/index.html'
s=open(P).read()
rep("""  var F_KEY = 'attic_found_v1';""", """  var F_KEY = 'attic_found_v1', G_KEY = 'attic_gone_v1';""")
rep("""  var pulls = E.readShelf(lsGet(SHELF_KEY));""",
"""  /* the tombstones first, so a scrapped find never boots back onto the shelf */
  var gone = E.readGone(lsGet(G_KEY));
  function saveGone() { lsSet(G_KEY, E.mergeGoneToDisk(lsGet(G_KEY), gone)); }
  var pulls = E.readShelf(lsGet(SHELF_KEY)).filter(function (h) { return !gone[h]; });""")
rep("""  function saveShelf() { lsSet(SHELF_KEY, JSON.stringify(E.mergeShelfToDisk(lsGet(SHELF_KEY), pulls))); }""",
    """  function saveShelf() { lsSet(SHELF_KEY, JSON.stringify(E.mergeShelfToDisk(lsGet(SHELF_KEY), pulls, gone))); }""")
rep("""  function scrapHash(h) {
    var i;
    for (i = 0; i < pulls.length; i++) if (pulls[i] === h) { pulls.splice(i, 1); break; }
    saveShelf(); saveRevealed(); saveFound(); renderShelf();""",
"""  function scrapHash(h) {
    var i;
    for (i = 0; i < pulls.length; i++) if (pulls[i] === h) { pulls.splice(i, 1); break; }
    gone[h] = Date.now(); saveGone();
    saveShelf(); saveRevealed(); saveFound(); renderShelf();""")
rep("""      dropPull: function (h) { var i = pulls.indexOf(h); if (i >= 0) pulls.splice(i, 1); saveShelf(); renderShelf(); return pulls.length; },""",
    """      dropPull: function (h) { var i = pulls.indexOf(h); if (i >= 0) pulls.splice(i, 1); gone[h] = Date.now(); saveGone(); saveShelf(); renderShelf(); return pulls.length; },
      gone: function () { return gone; },""")
open(P,'w').write(s); print('page patched')

C='/workspaces/lucid-winds/satellites/attic/check.js'
s=open(C).read()
rep("""  ECON = require(path.join(ROOT, 'attic-econ.js'));""",
    """  ECON = require(process.env.AT_ECON ? path.resolve(process.env.AT_ECON) : path.join(ROOT, 'attic-econ.js'));   /* AT_ECON: a mutant economy to watch */""")
# node side: the merge honours tombstones
rep("""group('the economy cannot be minted out of nothing');""",
"""group('a scrapped find stays scrapped');
{
  const A = 'a'.repeat(64), B = 'b'.repeat(64);
  const merged = ECON.mergeShelfToDisk(JSON.stringify([A, B]), [A], { [B]: Date.now() });
  ok('the shelf merge drops a hash with a tombstone even when the disk still holds it', merged.length === 1 && merged[0] === A, JSON.stringify(merged));
  const plain = ECON.mergeShelfToDisk(JSON.stringify([A, B]), [A]);
  ok('without a tombstone the union still keeps both tabs\\' finds', plain.length === 2, JSON.stringify(plain));
  const old = ECON.readGone(JSON.stringify({ [B]: Date.now() - ECON.GONE_TTL - 1000 }));
  ok('a tombstone older than a week is let go', Object.keys(old).length === 0, JSON.stringify(old));
}
group('the economy cannot be minted out of nothing');""")
# browser side: scrap, reload, still gone
rep("""    const persisted = await page.evaluate(() => {
      const D = window.ATTIC_DEV;
      D.dustEnd();
      return { shelf: D.shelf().length, tix: D.wallet().tix };
    });""",
"""    const persisted = await page.evaluate(() => {
      const D = window.ATTIC_DEV;
      D.dustEnd();
      /* scrap one through the real button: before 2026-09-05 it came back on reload, ticket paid */
      D.setTix(30); document.getElementById('go').click();
      const beforeScrap = D.shelf().length;
      document.getElementById('scrap').click();
      return { shelf: D.shelf().length, tix: D.wallet().tix, beforeScrap };
    });""")
rep("""    ok('the shelf survives a reload', after.shelf === persisted.shelf && after.shelf > 0, JSON.stringify({ persisted, after }));""",
    """    ok('the shelf survives a reload', after.shelf === persisted.shelf && after.shelf > 0, JSON.stringify({ persisted, after }));
    ok('a scrapped find does not come back on reload', persisted.shelf === persisted.beforeScrap - 1 && after.shelf === persisted.shelf, JSON.stringify({ persisted, after }));""")
open(C,'w').write(s); print('gate patched')
