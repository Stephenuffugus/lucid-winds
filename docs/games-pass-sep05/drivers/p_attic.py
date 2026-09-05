import re
D='/workspaces/lucid-winds/satellites/attic/'
def patch(fn, pairs):
    p=D+fn; s=open(p).read()
    for old,new in pairs:
        n=s.count(old); assert n==1, ("%s: match count %d for %r"%(fn,n,old[:70]))
        s=s.replace(old,new)
    open(p,'w').write(s); print("patched",fn,len(pairs))

patch('index.html', [
# motes: 4px at 0.45, not 3px flecks at 0.5
('''  .mote { position:absolute; width:3px; height:3px; border-radius:50%;
    background:#e8d7a8; opacity:0; animation:drift linear infinite; }
  @keyframes drift {
    0%   { transform:translate3d(0,0,0) scale(0.7); opacity:0; }
    12%  { opacity:0.5; }
    88%  { opacity:0.32; }''',
'''  .mote { position:absolute; width:4px; height:4px; border-radius:50%;
    background:#e8d7a8; opacity:0; animation:drift linear infinite; filter:blur(0.4px); }
  @keyframes drift {
    0%   { transform:translate3d(0,0,0) scale(0.7); opacity:0; }
    12%  { opacity:0.45; }
    88%  { opacity:0.28; }'''),
# the room, lifted out of the mud and held back by ONE scrim (fleet audit row 144, Sep 05)
('''  .atticbg { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }''',
'''  .atticbg { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
  /* 2026-09-05: the room's own tones were within four points of the page ground and read as
     three brown smudges. They sit about eighteen points up now and ONE scrim holds the whole
     plate back, so the rafters and crates read as furniture and the cream copy still wins. */
  .atticbg::after { content:""; position:absolute; inset:0; background:rgba(23,19,16,0.34); }'''),
('''    <path d="M0 0 L420 0 L420 74 L0 128 Z" fill="#1d1710"/>
    <path d="M0 118 L420 64 L420 82 L0 136 Z" fill="#241c13"/>
    <path d="M56 0 L84 0 L128 900 L96 900 Z" fill="#1b150e"/>
    <path d="M352 0 L378 0 L410 900 L382 900 Z" fill="#1b150e"/>''',
'''    <path d="M0 0 L420 0 L420 74 L0 128 Z" fill="#2a2016"/>
    <path d="M0 118 L420 64 L420 82 L0 136 Z" fill="#37291b"/>
    <path d="M56 0 L84 0 L128 900 L96 900 Z" fill="#271e14"/>
    <path d="M352 0 L378 0 L410 900 L382 900 Z" fill="#271e14"/>
    <path d="M0 0 L420 0 L420 74 L0 128 Z" fill="none" stroke="#3d3021" stroke-width="2"/>'''),
('''        <stop offset="0" stop-color="#e8c977" stop-opacity="0.1"/>
        <stop offset="0.55" stop-color="#e8c977" stop-opacity="0.05"/>''',
'''        <stop offset="0" stop-color="#e8c977" stop-opacity="0.18"/>
        <stop offset="0.55" stop-color="#e8c977" stop-opacity="0.09"/>'''),
('''        <stop offset="0" stop-color="#f0d68a" stop-opacity="0.12"/>''',
'''        <stop offset="0" stop-color="#f0d68a" stop-opacity="0.2"/>'''),
('''    <circle cx="368" cy="150" r="50" fill="#1e180e"/>
    <circle cx="368" cy="150" r="50" fill="none" stroke="#2b2418" stroke-width="5"/>
    <path d="M368 100 L368 200 M318 150 L418 150" stroke="#2b2418" stroke-width="4"/>''',
'''    <circle cx="368" cy="150" r="50" fill="#2b2412"/>
    <circle cx="368" cy="150" r="42" fill="#3a3320" opacity="0.55"/>
    <circle cx="368" cy="150" r="50" fill="none" stroke="#4a3d2a" stroke-width="5"/>
    <path d="M368 100 L368 200 M318 150 L418 150" stroke="#4a3d2a" stroke-width="4"/>'''),
('''    <path d="M26 120 L58 120 L51 142 L33 142 Z" fill="none" stroke="#2b2418" stroke-width="2"/>
    <circle cx="42" cy="150" r="5" fill="#f0d68a" opacity="0.3"/>''',
'''    <path d="M26 120 L58 120 L51 142 L33 142 Z" fill="#2a2016" stroke="#4a3d2a" stroke-width="2"/>
    <circle cx="42" cy="150" r="5" fill="#f0d68a" opacity="0.5"/>'''),
('''    <rect y="806" width="420" height="94" fill="#1a140e"/>
    <path d="M0 806 L420 806" stroke="#2b2318" stroke-width="3"/>
    <g fill="#1f1810">''',
'''    <rect y="806" width="420" height="94" fill="#241b13"/>
    <path d="M0 806 L420 806" stroke="#463826" stroke-width="3"/>
    <path d="M0 836 L420 836 M0 868 L420 868" stroke="#2e2419" stroke-width="2"/>
    <g fill="#2d2318">'''),
('''    <g fill="none" stroke="#2b2318" stroke-width="2">
      <rect x="-14" y="676" width="132" height="130" rx="3"/>''',
'''    <g fill="none" stroke="#463826" stroke-width="2">
      <rect x="-14" y="676" width="132" height="130" rx="3"/>'''),
('''    <g stroke="#241c13" stroke-width="5" fill="none">
      <path d="M196 806 L196 700 L246 700 L246 806 M196 748 L246 748 M204 700 L204 664 L240 664 L240 700"/>''',
'''    <g stroke="#3d2f1f" stroke-width="5" fill="none">
      <path d="M196 806 L196 700 L246 700 L246 806 M196 748 L246 748 M204 700 L204 664 L240 664 L240 700"/>'''),
# the paperwork line was 2.2:1
('''  .meta { font-family:ui-monospace, monospace; font-size:0.68rem; color:#8a7a5e; margin-top:10px; line-height:1.7; }''',
 '''  .meta { font-family:ui-monospace, monospace; font-size:0.68rem; color:#9a8a6e; margin-top:10px; line-height:1.7; }'''),
('''.shWhen{ font-family:ui-monospace, monospace; font-size:.54rem; color:#6f6350; white-space:nowrap }''',
 '''.shWhen{ font-family:ui-monospace, monospace; font-size:.6rem; color:#9a8a6e; white-space:nowrap }'''),
('''  letter-spacing:.2em; color:#6f6350; margin:2px 0 12px }''','''  letter-spacing:.2em; color:#9a8a6e; margin:2px 0 12px }'''),
('''.fcHash{ font-family:ui-monospace, monospace; font-size:.56rem; color:#6f6350; line-height:1.6;''',
 '''.fcHash{ font-family:ui-monospace, monospace; font-size:.6rem; color:#9a8a6e; line-height:1.6;'''),
("      x.fillStyle = '#6f6350'; x.font = '14px ui-monospace, monospace';","      x.fillStyle = '#9a8a6e'; x.font = '14px ui-monospace, monospace';"),
# the WIPE button wrapped to two lines at 412 under 0.24em of tracking
('''    color:#b8a888; font-family:ui-monospace, monospace; font-size:0.72rem;
    letter-spacing:0.24em; cursor:pointer;
  }''',
'''    color:#c8b898; font-family:ui-monospace, monospace; font-size:0.72rem;
    letter-spacing:0.1em; cursor:pointer;
  }'''),
# the shared music chip gets told when the screen changes under it
('''  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* ── THE WANT LIST''',
'''  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  /* the arcade's shared ♫ chip picks its corner against whatever is on screen when it looks.
     Every screen change here asks it to look again, so it never sits on the object art. */
  function reseatChip() { try { if (window.SWSMusic && window.SWSMusic.reseat) setTimeout(window.SWSMusic.reseat, 120); } catch (e) {} }

  /* ── THE WANT LIST'''),
('''    if (pulls.indexOf(h) < 0) { pulls.unshift(h); saveShelf(); markFound(h); }
    renderShelf();
  }''',
'''    if (pulls.indexOf(h) < 0) { pulls.unshift(h); saveShelf(); markFound(h); }
    renderShelf();
    reseatChip();
  }'''),
('''  function openShelfSheet() { paintShelfSheet(true); document.getElementById('shelfSheet').className = 'on'; }
  function closeShelfSheet() { document.getElementById('shelfSheet').className = ''; }''',
'''  function openShelfSheet() { paintShelfSheet(true); document.getElementById('shelfSheet').className = 'on'; reseatChip(); }
  function closeShelfSheet() { document.getElementById('shelfSheet').className = ''; reseatChip(); }'''),
('''    function close() { try { lsSet(K, '1'); } catch (e) {} sheetEl.className = ''; }''',
 '''    function close() { try { lsSet(K, '1'); } catch (e) {} sheetEl.className = ''; reseatChip(); }'''),
])

patch('sleeve-render.js', [
# the dust let nothing through and read as a failed image load
('''    /* two layers at 0.79 compound to 0.956, and it took that much: at 0.91 a
       high contrast title plate (the record's, after the STACK layout got one)
       still punched through and the band name was readable under the dust. */
    w += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="#5c5142" opacity="0.79"/>';
    w += '<path fill-rule="evenodd" fill="#5c5142" opacity="0.79" d="M' + bx + ' ' + by + ' h' + bw + ' v' + bh + ' h-' + bw + ' Z ' + swipe + '"/>';''',
'''    /* ⛔ 2026-09-05: two layers at 0.79 compounded to 0.956 and the object under them was gone.
       The fleet audit and Stephen both read the dusty card as a broken image. The grade is
       withheld by drawing NO wear in the dusty render (that is what the leak gate measures), not
       by hiding the object, so the dust sits at 0.62 with a 0.42 second layer off the swipe:
       the thing shows through as a shape and a colour, the title mostly does not, and the wipe
       is a reveal instead of an un-blank. */
    w += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="#5c5142" opacity="0.62"/>';
    w += '<path fill-rule="evenodd" fill="#5c5142" opacity="0.42" d="M' + bx + ' ' + by + ' h' + bw + ' v' + bh + ' h-' + bw + ' Z ' + swipe + '"/>';'''),
])

patch('object-render.js', [
# the handheld printed its title in white on whatever shell it rolled; the 1990s shell is pale
('''    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + 22) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7.5" letter-spacing="2.5" fill="#ffffff" opacity="0.72">' + esc(String(it.sub).split('·')[0].trim().toUpperCase().slice(0, 24)) + '</text>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 158) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 18, bw - 26) + '" fill="#ffffff">' + esc(String(it.name).slice(0, 28)) + '</text>';''',
'''    /* ⛔ inkOn(shell), never #ffffff: a pale 1990s shell made the printed title white on grey */
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + 22) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7.5" letter-spacing="2.5" fill="' + inkOn(shell) + '" opacity="0.72">' + esc(String(it.sub).split('·')[0].trim().toUpperCase().slice(0, 24)) + '</text>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 158) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 18, bw - 26) + '" fill="' + inkOn(shell) + '">' + esc(String(it.name).slice(0, 28)) + '</text>';'''),
])
print("attic patch complete")
