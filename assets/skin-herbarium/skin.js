/* Lucid Winds hub skin preview: Astra's moonlit herbarium kit (round one).
   Loaded ONLY by the flag loader in index.html (?skin=astra or a part list).
   ES5, one IIFE. Each part is switched by a class on <html>:
   sk-bloom sk-cards sk-actions sk-banners sk-nav sk-topbar.
   Reads plant hashes from the DOM, then calls the hub's own window functions. */
(function(){
  var D = document, H = D.documentElement;
  function on(part){ return (' ' + H.className + ' ').indexOf(' sk-' + part + ' ') >= 0; }
  var BASE = 'assets/skin-herbarium/';

  // ── Grades: Astra's accent colours and her seven exact marks (100x100 space) ──
  var G = {
    common:    { c:'#B6C9B7', m:'<ellipse cx="50" cy="50" rx="15" ry="28" fill="none" stroke="C" stroke-width="5"/><path d="M46 72Q60 49 52 27" fill="none" stroke="C" stroke-width="3" stroke-linecap="round"/>' },
    uncommon:  { c:'#A8D5A2', m:'<path d="M50 84V56M50 66Q14 67 17 28Q47 28 50 56M50 56Q87 57 84 19Q54 20 50 48" fill="none" stroke="C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' },
    rare:      { c:'#9DCEEB', m:'<path d="M50 12Q52.2 21.8 62 24Q52.2 26.2 50 36Q47.8 26.2 38 24Q47.8 21.8 50 12M25 54Q27.2 63.8 37 66Q27.2 68.2 25 78Q22.8 68.2 13 66Q22.8 63.8 25 54M75 54Q77.2 63.8 87 66Q77.2 68.2 75 78Q72.8 68.2 63 66Q72.8 63.8 75 54" fill="C" stroke="C" stroke-width="1" stroke-linejoin="round"/>' },
    epic:      { c:'#C2AAF0', m:'<path d="M50 13L84 50L50 87L16 50Z" fill="none" stroke="C" stroke-width="5" stroke-linejoin="round"/><path d="M50 36Q52.5 47.5 64 50Q52.5 52.5 50 64Q47.5 52.5 36 50Q47.5 47.5 50 36" fill="C" stroke="C" stroke-width="1"/>' },
    legendary: { c:'#D8B76C', m:'<path d="M18 31L30 73H70L82 31L62 48L50 18L38 48ZM31 83H69" fill="none" stroke="C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="28" r="4.5" fill="C"/><circle cx="50" cy="14" r="4.5" fill="C"/><circle cx="82" cy="28" r="4.5" fill="C"/>' },
    mythic:    { c:'#E4A1CC', m:'<path d="M65 15C14 8 10 82 65 85C32 64 32 36 65 15Z" fill="none" stroke="C" stroke-width="4" stroke-linejoin="round"/><path d="M73 35Q75.3 45.7 86 48Q75.3 50.3 73 61Q70.7 50.3 60 48Q70.7 45.7 73 35" fill="C" stroke="C" stroke-width="1"/>' },
    cosmic:    { c:'#BFEFFF', m:'<ellipse cx="50" cy="50" rx="38" ry="23" fill="none" stroke="C" stroke-width="3"/><ellipse cx="50" cy="50" rx="21" ry="36" fill="none" stroke="C" stroke-width="3"/>' +
      '<path d="M88 45Q88.9 49.1 93 50Q88.9 50.9 88 55Q87.1 50.9 83 50Q87.1 49.1 88 45M73.7 64.5Q74.6 68.6 78.7 69.5Q74.6 70.4 73.7 74.5Q72.8 70.4 68.7 69.5Q72.8 68.6 73.7 64.5M41.5 69.4Q42.4 73.5 46.5 74.4Q42.4 75.3 41.5 79.4Q40.6 75.3 36.5 74.4Q40.6 73.5 41.5 69.4M15.8 55.8Q16.7 59.9 20.8 60.8Q16.7 61.7 15.8 65.8Q14.9 61.7 10.8 60.8Q14.9 59.9 15.8 55.8M15.8 34.2Q16.7 38.3 20.8 39.2Q16.7 40.1 15.8 44.2Q14.9 40.1 10.8 39.2Q14.9 38.3 15.8 34.2M41.5 20.6Q42.4 24.7 46.5 25.6Q42.4 26.5 41.5 30.6Q40.6 26.5 36.5 25.6Q40.6 24.7 41.5 20.6M73.7 25.5Q74.6 29.6 78.7 30.5Q74.6 31.4 73.7 35.5Q72.8 31.4 68.7 30.5Q72.8 29.6 73.7 25.5M50 38Q52.2 47.8 62 50Q52.2 52.2 50 62Q47.8 52.2 38 50Q47.8 47.8 50 38" fill="C" stroke="C" stroke-width="1"/>' }
  };
  var ORDER = ['common','uncommon','rare','epic','legendary','mythic','cosmic'];
  function mark(g, px){
    var d = G[g] || G.common;
    return '<svg class="sk-mark" viewBox="0 0 100 100" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' + d.m.replace(/="C"/g, '="' + d.c + '"') + '</svg>';
  }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  // The plant the hub stores for a hash (bred plants carry layers that change the grade)
  function plantOf(hash){
    try {
      var gh = window.loadGreenhouse ? window.loadGreenhouse() : JSON.parse(localStorage.getItem('sws_greenhouse') || '[]');
      for (var i = 0; i < gh.length; i++) if (gh[i] && gh[i].hash === hash) return gh[i];
    } catch (e) {}
    return null;
  }
  // Same trait recipe as the carousel (_populateSlot), so the grade matches the hub's own
  function identity(hash){
    var out = { grade:'common', ea:0, name:'', haiku:null, plant:plantOf(hash) };
    try {
      var t = window.hashToTraits(hash), p = out.plant;
      if (p) {
        if (p.generation) t.chimerGen = p.generation;
        if (p.mycelialCrown) t.mycelialCrown = true;
        if (p.breedLayers) t.breedLayers = p.breedLayers;
        if (p.compostLayers) t.compostLayers = p.compostLayers;
      }
      var tg = window.getTerraGrade(t);
      if (tg && tg.name && G[tg.name.toLowerCase()]) out.grade = tg.name.toLowerCase();
      if (window.computeEA) out.ea = window.computeEA(t, 0, p || { hash: hash });
    } catch (e) {}
    try { if (window.getPlantName) out.name = window.getPlantName(hash); } catch (e) {}
    try { if (window.getHaiku) out.haiku = window.getHaiku(hash); } catch (e) {}
    try { if (window.getSeasonInfo) out.sea = window.getSeasonInfo(window.hashToTraits(hash), out.plant); } catch (e) {}
    return out;
  }
  window.LW_SKIN_GRADE = function(hash){ return identity(hash).grade; }; // for the preview probes

  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // ═══ 1. sk-bloom: the mint reveal ═══
  // The hub builds #pw-win-overlay[data-bloom]; the flag-only hook adds data-sk-hash.
  // We add one .skb layer on top of the hub's own children (CSS hides those).
  function skinBloom(ov){
    if (!ov || ov.getAttribute('data-sk-done')) return;
    var hash = ov.getAttribute('data-sk-hash'); if (!hash) return;
    ov.setAttribute('data-sk-done', '1');
    var id = identity(hash), g = id.grade, gi = ORDER.indexOf(g);
    var svg = '';
    try { svg = window._generatePlantSVG(hash, 360, 1.0); } catch (e) { svg = ''; }
    var cost = 30; try { if (typeof window._getMintCost === 'function') cost = window._getMintCost() || 30; } catch (e) {}
    var title = g === 'common' ? 'A bloom of your own' : ((/^[aeiou]/.test(g) ? 'An ' : 'A ') + g + ' bloom');
    var hk = id.haiku;
    var h = '';
    h += '<div class="skb-stage">';
    h +=   '<div class="skb-aura" aria-hidden="true"></div>';
    h +=   '<img class="skb-frame" src="' + BASE + 'reveal/' + g + '.svg" alt="" aria-hidden="true">';
    if (gi >= 3) h += '<div class="skb-glints" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
    if (g === 'cosmic') h += '<div class="skb-orbit" aria-hidden="true"></div>';
    h +=   '<div class="skb-brand">LUCID WINDS</div>';
    h +=   '<div class="skb-kicker">' + cost + ' SUNBEAMS BECOME ONE PLANT</div>';
    h +=   '<div class="skb-title">' + esc(title) + '</div>';
    h +=   '<div class="skb-grade">' + mark(g, 22) + '<span>' + g.toUpperCase() + '</span></div>';
    h +=   '<svg class="skb-pedestal" viewBox="0 0 900 200" aria-hidden="true"><ellipse cx="450" cy="115" rx="420" ry="70" fill="#102523"/><rect x="30" y="65" width="840" height="50" fill="#183630"/><ellipse cx="450" cy="65" rx="420" ry="53" fill="#2C4942" stroke="#B6C9B7" stroke-width="2"/></svg>';
    h +=   '<div class="skb-plant">' + svg + '</div>';
    h +=   '<div class="skb-id">';
    h +=     '<div class="skb-name">' + esc(id.name || 'Unknown Specimen') + '</div>';
    h +=     '<div class="skb-ea">ONE OF ONE&nbsp;&nbsp;/&nbsp;&nbsp;EA ' + esc(id.ea) + '</div>';
    if (hk) h += '<div class="skb-haiku">' + esc(hk.line1) + '<br>' + esc(hk.line2) + '<br>' + esc(hk.line3) + '</div>';
    h +=   '</div>';
    h +=   '<div class="skb-actions">';
    h +=     '<button type="button" class="skb-btn skb-primary" data-act="gh">View in Greenhouse</button>';
    h +=     '<button type="button" class="skb-btn skb-secondary" data-act="play">Keep playing</button>';
    h +=   '</div>';
    h += '</div>';
    var root = D.createElement('div');
    root.className = 'skb skb-' + g + (reduce ? ' skb-still' : '');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Full bloom: ' + (id.name || 'a new plant') + ', ' + cap(g));
    root.innerHTML = h;
    root.addEventListener('click', function(e){
      var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
      if (!b) return;
      e.stopPropagation();
      var act = b.getAttribute('data-act');
      try { if (window._dismissWin) window._dismissWin(); } catch (x) {}
      if (act === 'gh') { try { if (window.switchTab) window.switchTab('greenhouse'); } catch (x) {} }
      else { try { if (window._restartCurrentGame) window._restartCurrentGame(); } catch (x) {} }
    });
    ov.appendChild(root);
  }

  // ═══ 2. sk-cards: greenhouse grid tile + carousel card front ═══
  var GRID_ARCH = '<svg class="skc-arch" viewBox="0 0 480 640" preserveAspectRatio="none" aria-hidden="true"><path d="M57.6 416V297.6A182.4 182.4 0 0 1 422.4 297.6V416" fill="none" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>';
  var DETAIL_ARCH = '<svg class="skc-arch" viewBox="0 0 400 500" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><path d="M16 498V196A184 184 0 0 1 384 196V498" fill="none" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>';
  function setGradeClass(el, g){
    for (var i = 0; i < ORDER.length; i++) el.classList.remove('skg-' + ORDER[i]);
    el.classList.add('skg-' + g);
  }
  function skinTile(el){
    var hash = el.getAttribute('data-sk-hash'); if (!hash) return;
    if (el.querySelector('.skc-foot')) return;
    var id = identity(hash), g = id.grade;
    setGradeClass(el, g);
    var eaEl = el.querySelector('.ea-num');
    var ea = eaEl ? eaEl.textContent : id.ea;
    var top = D.createElement('div'); top.className = 'skc-topmark'; top.innerHTML = mark(g, 18);
    var arch = D.createElement('div'); arch.className = 'skc-archwrap'; arch.innerHTML = GRID_ARCH;
    var foot = D.createElement('div'); foot.className = 'skc-foot';
    foot.innerHTML = '<span class="skc-grade">' + mark(g, 14) + g.toUpperCase() + '</span><span class="skc-ea">EA ' + esc(ea) + '</span>';
    el.insertBefore(arch, el.firstChild);
    el.appendChild(top);
    var nm = el.querySelector('.gh-name');
    if (nm && nm.nextSibling) el.insertBefore(foot, nm.nextSibling); else el.appendChild(foot);
  }
  function skinFront(front){
    if (front.querySelector('.skc-dgrade')) return;
    var art = front.querySelector('.cf-art-window[data-plant-hash]'); if (!art) return;
    var hash = art.getAttribute('data-plant-hash');
    var id = identity(hash), g = id.grade;
    setGradeClass(front, g);
    var eaEl = front.querySelector('.cf-ea');
    var ea = eaEl ? eaEl.textContent : id.ea;
    var arch = D.createElement('div'); arch.className = 'skc-archwrap'; arch.innerHTML = DETAIL_ARCH;
    var dg = D.createElement('div'); dg.className = 'skc-dgrade'; dg.innerHTML = mark(g, 26) + '<span>' + g.toUpperCase() + '</span>';
    var de = D.createElement('div'); de.className = 'skc-dea'; de.textContent = 'EA ' + ea;
    if (id.sea && id.sea.emblem) { var se = D.createElement('span'); se.className = 'skc-season'; se.textContent = id.sea.emblem + (id.sea.name ? ' ' + id.sea.name : ''); de.appendChild(se); }
    front.insertBefore(arch, front.firstChild); // not inside the art window: the hub hot-swaps its content to a PNG
    front.appendChild(dg);
    var hz = front.querySelector('.cf-haiku-zone');
    if (hz && hz.parentNode === front) front.insertBefore(de, hz.nextSibling); else front.appendChild(de);
  }

  // ═══ 3. sk-banners: her category banners in the game picker ═══
  var BANNERS = { creative:1, card:1, puzzle:1, board:1, pattern:1, dice:1, studio:1 }; // indev keeps the hub's art
  function skinBanner(cat){
    var key = cat.getAttribute('data-cat'); if (!BANNERS[key]) return;
    var img = cat.querySelector('img.gp-cat-banner'); if (!img || img.getAttribute('data-sk')) return;
    img.setAttribute('data-sk', '1');
    img.src = BASE + 'banners/' + key + '.webp';
    cat.classList.add('skn-banner');
  }

  // ── One observer for every part ──
  function scan(root){
    if (!root || !root.querySelectorAll) return;
    var i, n;
    if (on('bloom')) {
      if (root.id === 'pw-win-overlay') skinBloom(root);
      n = root.querySelectorAll('#pw-win-overlay[data-sk-hash]'); for (i = 0; i < n.length; i++) skinBloom(n[i]);
    }
    if (on('cards')) {
      if (root.classList && root.classList.contains('greenhouse-plant')) skinTile(root);
      if (root.classList && root.classList.contains('cs-card-front')) skinFront(root);
      n = root.querySelectorAll('.greenhouse-plant[data-sk-hash]'); for (i = 0; i < n.length; i++) skinTile(n[i]);
      n = root.querySelectorAll('.cs-card-front'); for (i = 0; i < n.length; i++) skinFront(n[i]);
    }
    if (on('banners')) {
      if (root.classList && root.classList.contains('gp-cat')) skinBanner(root);
      n = root.querySelectorAll('.gp-cat[data-cat]'); for (i = 0; i < n.length; i++) skinBanner(n[i]);
    }
  }
  var pending = [], queued = false;
  function flush(){
    queued = false;
    var list = pending; pending = [];
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      if (t.nodeType !== 1) continue;
      // a tile re-rendered in place: climb to the card that owns it
      var up = t.closest ? t.closest('.greenhouse-plant,.cs-card-front,.gp-cat,#pw-win-overlay') : null;
      scan(up || t);
    }
  }
  function start(){
    // The bloom must not wait a frame: build it in the same turn the overlay mounts (microtask).
    try {
      new MutationObserver(function(recs){
        if (!on('bloom')) return;
        for (var i = 0; i < recs.length; i++) for (var j = 0; j < recs[i].addedNodes.length; j++) {
          var a = recs[i].addedNodes[j];
          if (a.nodeType === 1 && a.id === 'pw-win-overlay') skinBloom(a);
        }
      }).observe(D.body, { childList:true });
    } catch (e) {}
    scan(D.body);
    try {
      new MutationObserver(function(recs){
        for (var i = 0; i < recs.length; i++) {
          var r = recs[i];
          if (r.target && r.target.nodeType === 1) pending.push(r.target);
          for (var j = 0; j < r.addedNodes.length; j++) if (r.addedNodes[j].nodeType === 1) pending.push(r.addedNodes[j]);
        }
        if (!queued) { queued = true; (window.requestAnimationFrame || setTimeout)(flush); }
      }).observe(D.body, { childList:true, subtree:true });
    } catch (e) {}
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
