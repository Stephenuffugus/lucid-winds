/* ════════════════════════════════════════════════════════════════════
   OBJECT RENDERER (prototype) — hash → SVG for the four non-record
   classes: VHS clamshell, carded TOY, BOARD GAME lid, CEREAL box.
   Same laws as sleeve-render.js: era drives the visual language,
   CONDITION renders as real wear, every roll comes off the hash,
   300x300 viewBox, system fonts, ES5, node + browser.
   Voice law: original fake brands only, no real trademarks, no em-dashes.
   ════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  var A = (typeof module !== 'undefined' && module.exports)
    ? require('./attic-engine.js') : root.ATTIC;
  var S = (typeof module !== 'undefined' && module.exports)
    ? require('./sleeve-render.js') : root.ATTIC_SLEEVE;

  function hb(h, n) { return parseInt(h.substr(n * 2, 2), 16); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function fit(text, max, avail) { return Math.min(max, (avail || 260) / (Math.max(6, String(text).length) * 0.72)); }

  var ERA_LOOK = {
    '1950s': { c: ['#efe3cd', '#2e7f7a', '#d24a35', '#1e2a32'], f: 'Georgia, serif' },
    '1960s': { c: ['#e8571d', '#7a2a8a', '#f2b01e', '#241430'], f: 'Georgia, serif' },
    '1970s': { c: ['#caa452', '#7a4a22', '#3f5b3a', '#241a10'], f: 'Georgia, serif' },
    '1980s': { c: ['#101018', '#1c1c2c', '#ff2d7a', '#26f0e0'], f: '"Arial Narrow", system-ui, sans-serif' },
    '1990s': { c: ['#d8d4c8', '#3a3a38', '#8a2b20', '#191917'], f: 'ui-monospace, monospace' }
  };

  /* wear shared by boxy objects: corner scuffs, a price sticker, shrink
     gloss on FACTORY SEALED, a proud tape repair on TRASHED. Coordinates
     are the object's bounding box so wear lands ON the thing. */
  function wear(h, grade, bx, by, bw, bh) {
    var w = '';
    var heavy = grade === 'TRASHED', mid = grade === 'PLAYED' || grade === 'GOOD';
    if (heavy || mid) {
      w += '<path d="M' + bx + ' ' + by + ' l20 0 l-20 20 Z" fill="#ffffff" opacity="0.2"/>'
        + '<path d="M' + (bx + bw) + ' ' + (by + bh) + ' l-20 0 l20 -20 Z" fill="#ffffff" opacity="0.17"/>';
    }
    if (heavy) {
      w += '<rect x="' + (bx + 8 + hb(h, 20) % (bw - 40)) + '" y="' + by + '" width="16" height="' + Math.floor(bh * 0.3) + '" fill="#d8cfa8" opacity="0.55"/>'
        + '<rect x="' + bx + '" y="' + (by + 12 + hb(h, 21) % (bh - 40)) + '" width="' + bw + '" height="2" fill="#ffffff" opacity="0.25"/>';
    }
    if (grade !== 'FACTORY SEALED' && grade !== 'MINT') {
      var px = bx + bw - 34 - hb(h, 22) % 20, py = by + 16 + hb(h, 23) % 24;
      w += '<g transform="rotate(' + (-6 + hb(h, 24) % 12) + ' ' + px + ' ' + py + ')">'
        + '<ellipse cx="' + px + '" cy="' + py + '" rx="24" ry="13" fill="#f5efdd" stroke="#c9bfa4" stroke-width="1"/>'
        + '<text x="' + px + '" y="' + (py + 4) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#5a4f3a">$' + (1 + hb(h, 25) % 5) + '.99</text></g>';
    }
    if (grade === 'FACTORY SEALED') {
      w += '<path d="M' + bx + ' ' + (by + bh * 0.7) + ' L' + (bx + bw) + ' ' + (by + bh * 0.2) + ' l0 26 L' + bx + ' ' + (by + bh * 0.7 + 26) + ' Z" fill="#ffffff" opacity="0.16"/>'
        + '<path d="M' + bx + ' ' + (by + bh * 0.78) + ' L' + (bx + bw) + ' ' + (by + bh * 0.28) + ' l0 7 L' + bx + ' ' + (by + bh * 0.78 + 7) + ' Z" fill="#ffffff" opacity="0.3"/>';
    }
    return w;
  }

  function shadow(bx, by, bw, bh) {
    return '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (by + bh + 6) + '" rx="' + (bw * 0.52) + '" ry="9" fill="#000000" opacity="0.25"/>';
  }

  // ── VHS: black clamshell, era cover art, title band, rental label ──
  function drawVHS(h, it, look) {
    var c = look.c, bx = 62, by = 12, bw = 176, bh = 272;
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="6" fill="#14120e"/>'
      + '<rect x="' + bx + '" y="' + by + '" width="14" height="' + bh + '" rx="6" fill="#201c16"/>';
    var ax = bx + 22, ay = by + 16, aw = bw - 36, ah = bh - 92;
    g += '<rect x="' + ax + '" y="' + ay + '" width="' + aw + '" height="' + ah + '" fill="' + c[0] + '"/>';
    var motif = hb(h, 16) % 3;
    if (motif === 0) {           // horror slash
      g += '<path d="M' + ax + ' ' + (ay + ah) + ' L' + (ax + aw) + ' ' + ay + ' l0 ' + ah + ' Z" fill="' + c[1] + '"/>'
        + '<path d="M' + (ax + aw * 0.18) + ' ' + ay + ' l16 0 L' + (ax + aw * 0.62) + ' ' + (ay + ah) + ' l-16 0 Z" fill="' + c[2] + '"/>';
    } else if (motif === 1) {    // floating moon + silhouette hills
      g += '<circle cx="' + (ax + aw / 2) + '" cy="' + (ay + ah * 0.34) + '" r="' + (aw * 0.26) + '" fill="' + c[2] + '"/>'
        + '<path d="M' + ax + ' ' + (ay + ah) + ' q ' + (aw * 0.25) + ' -' + (ah * 0.4) + ' ' + (aw * 0.5) + ' 0 q ' + (aw * 0.25) + ' -' + (ah * 0.3) + ' ' + (aw * 0.5) + ' 0 Z" fill="' + c[3] + '"/>';
    } else {                     // neon grid horizon
      var i;
      for (i = 0; i < 5; i++) g += '<rect x="' + ax + '" y="' + (ay + ah * 0.55 + i * 9) + '" width="' + aw + '" height="2.5" fill="' + c[3] + '" opacity="' + (0.9 - i * 0.15) + '"/>';
      g += '<circle cx="' + (ax + aw / 2) + '" cy="' + (ay + ah * 0.42) + '" r="' + (aw * 0.2) + '" fill="' + c[2] + '"/>';
    }
    g += '<rect x="' + ax + '" y="' + (ay + ah - 46) + '" width="' + aw + '" height="46" fill="' + c[3] + '" opacity="0.88"/>'
      + '<text x="' + (ax + aw / 2) + '" y="' + (ay + ah - 26) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 17, aw - 8) + '" fill="' + c[0] + '">' + esc(it.name) + '</text>'
      + '<text x="' + (ax + aw / 2) + '" y="' + (ay + ah - 10) + '" text-anchor="middle" font-family="' + look.f + '" font-style="italic" font-size="9" fill="' + c[0] + '" opacity="0.85">' + esc(String(it.sub).replace(/"/g, '').slice(0, 40)) + '</text>';
    // spine label strip, handwritten-ish
    g += '<rect x="' + (bx + 20) + '" y="' + (by + bh - 58) + '" width="' + (bw - 40) + '" height="34" fill="#efe8d2"/>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 37) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#3a3428">' + esc(it.name.slice(0, 22)) + '</text>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 12) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="#6a624e">HI-FI &middot; SP MODE &middot; ' + it.year + '</text>';
    if (it.sticker && it.sticker.indexOf('rental') >= 0) {
      g += '<g transform="rotate(-8 96 60)"><rect x="66" y="46" width="72" height="26" rx="4" fill="#e8c23a" stroke="#8a731c" stroke-width="1.5"/>'
        + '<text x="102" y="58" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7" font-weight="700" fill="#3a3010">BE KIND</text>'
        + '<text x="102" y="67" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7" font-weight="700" fill="#3a3010">REWIND</text></g>';
    }
    return g + wear(h, it.grade, bx, by, bw, bh);
  }

  // ── TOY: carded blister pack ──────────────────────────────────────
  function drawToy(h, it, look) {
    var c = look.c, bx = 56, by = 10, bw = 188, bh = 278;
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="8" fill="' + c[2] + '"/>'
      + '<rect x="' + (bx + 8) + '" y="' + (by + 8) + '" width="' + (bw - 16) + '" height="' + (bh - 16) + '" rx="5" fill="' + c[0] + '"/>'
      + '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (by + 16) + '" rx="14" ry="6" fill="#ffffff" opacity="0.9"/>';   // hang hole
    g += '<rect x="' + (bx + 8) + '" y="' + (by + 26) + '" width="' + (bw - 16) + '" height="52" fill="' + c[1] + '"/>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 50) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 16, bw - 28) + '" fill="' + c[0] + '">' + esc(it.name.replace(' (MINT ON CARD)', '')) + '</text>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 68) + '" text-anchor="middle" font-family="' + look.f + '" font-size="8.5" fill="' + c[0] + '" opacity="0.9">' + esc(String(it.sub).slice(0, 38)) + '</text>';
    // the bubble + figure
    var cxm = bx + bw / 2, cym = by + 172, crushed = it.grade === 'TRASHED' || it.grade === 'PLAYED';
    var R = 4 + hb(h, 17) % 5;
    var skin = ['#e8b06a', '#8ac46a', '#6a9ce8', '#e86a6a', '#c9c9c9', '#b98ae0'][hb(h, 18) % 6];
    var suit = c[(hb(h, 19) % 3) + 1];
    g += '<g>'
      + '<circle cx="' + cxm + '" cy="' + (cym - 44) + '" r="' + (14 + R) + '" fill="' + skin + '"/>'
      + '<circle cx="' + (cxm - 6) + '" cy="' + (cym - 48) + '" r="2.4" fill="#1a1a1a"/><circle cx="' + (cxm + 6) + '" cy="' + (cym - 48) + '" r="2.4" fill="#1a1a1a"/>'
      + '<rect x="' + (cxm - 17) + '" y="' + (cym - 24) + '" width="34" height="52" rx="10" fill="' + suit + '"/>'
      + '<rect x="' + (cxm - 33) + '" y="' + (cym - 20) + '" width="14" height="38" rx="7" fill="' + skin + '" transform="rotate(' + (-14 + hb(h, 26) % 28) + ' ' + (cxm - 26) + ' ' + (cym - 18) + ')"/>'
      + '<rect x="' + (cxm + 19) + '" y="' + (cym - 20) + '" width="14" height="38" rx="7" fill="' + skin + '" transform="rotate(' + (14 - hb(h, 27) % 28) + ' ' + (cxm + 26) + ' ' + (cym - 18) + ')"/>'
      + '<rect x="' + (cxm - 14) + '" y="' + (cym + 26) + '" width="12" height="34" rx="6" fill="' + suit + '"/>'
      + '<rect x="' + (cxm + 2) + '" y="' + (cym + 26) + '" width="12" height="34" rx="6" fill="' + suit + '"/>'
      + '</g>';
    var bubblePath = crushed
      ? '<path d="M' + (cxm - 52) + ' ' + (cym + 66) + ' q -8 -70 22 -116 q 18 -22 44 -8 q 26 12 30 52 q 6 48 -14 74 Z" fill="#ffffff" opacity="0.2" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2"/>'
      : '<ellipse cx="' + cxm + '" cy="' + (cym - 2) + '" rx="58" ry="76" fill="#ffffff" opacity="0.16" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2"/>';
    g += bubblePath
      + '<path d="M' + (cxm - 34) + ' ' + (cym - 58) + ' q 12 -20 34 -22" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.5" stroke-linecap="round"/>';
    // burst
    g += '<g transform="rotate(12 ' + (bx + bw - 34) + ' ' + (by + 104) + ')">'
      + '<circle cx="' + (bx + bw - 34) + '" cy="' + (by + 104) + '" r="21" fill="' + c[1] + '"/>'
      + '<text x="' + (bx + bw - 34) + '" y="' + (by + 101) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="8" fill="' + c[0] + '">COLLECT</text>'
      + '<text x="' + (bx + bw - 34) + '" y="' + (by + 111) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="8" fill="' + c[0] + '">ALL ' + (3 + hb(h, 28) % 7) + '</text></g>';
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 14) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="' + c[3] + '" opacity="0.8">AGES ' + (3 + hb(h, 29) % 6) + ' AND UP &middot; ' + it.year + '</text>';
    return g + wear(h, it.grade, bx, by, bw, bh);
  }

  // ── BOARD GAME: box lid, landscape ───────────────────────────────
  function drawGame(h, it, look) {
    var c = look.c, bx = 12, by = 62, bw = 276, bh = 180;
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + (by + 6) + '" width="' + bw + '" height="' + (bh - 6) + '" rx="4" fill="' + c[3] + '"/>'
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="4" fill="' + c[1] + '"/>'
      + '<rect x="' + (bx + 10) + '" y="' + (by + 10) + '" width="' + (bw - 20) + '" height="' + (bh - 20) + '" fill="none" stroke="' + c[0] + '" stroke-width="2" opacity="0.6"/>';
    // title plate on a jaunty angle
    g += '<g transform="rotate(-4 150 ' + (by + 62) + ')">'
      + '<rect x="' + (bx + 18) + '" y="' + (by + 34) + '" width="' + (bw - 36) + '" height="52" rx="5" fill="' + c[2] + '"/>'
      + '<text x="150" y="' + (by + 67) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 24, bw - 52) + '" fill="' + c[0] + '">' + esc(it.name) + '</text></g>';
    var premise = String(it.sub).split('&middot;')[0].split('·')[0];
    g += '<text x="150" y="' + (by + 112) + '" text-anchor="middle" font-family="' + look.f + '" font-style="italic" font-size="11" fill="' + c[0] + '">' + esc(premise.slice(0, 46)) + '</text>';
    // two dice
    var d1 = 1 + hb(h, 17) % 6, d2 = 1 + hb(h, 18) % 6;
    function die(x, y, n, rot) {
      var s = '<g transform="rotate(' + rot + ' ' + (x + 14) + ' ' + (y + 14) + ')"><rect x="' + x + '" y="' + y + '" width="28" height="28" rx="5" fill="' + c[0] + '"/>';
      var P = { 1: [[14, 14]], 2: [[8, 8], [20, 20]], 3: [[8, 8], [14, 14], [20, 20]], 4: [[8, 8], [20, 8], [8, 20], [20, 20]], 5: [[8, 8], [20, 8], [14, 14], [8, 20], [20, 20]], 6: [[8, 8], [20, 8], [8, 14], [20, 14], [8, 20], [20, 20]] }[n];
      for (var i = 0; i < P.length; i++) s += '<circle cx="' + (x + P[i][0]) + '" cy="' + (y + P[i][1]) + '" r="2.6" fill="' + c[3] + '"/>';
      return s + '</g>';
    }
    g += die(bx + 26, by + bh - 52, d1, -12 + hb(h, 19) % 24) + die(bx + 62, by + bh - 46, d2, -12 + hb(h, 26) % 24);
    // players chip
    var players = String(it.sub).match(/\d+ to \d+ players/);
    g += '<rect x="' + (bx + bw - 108) + '" y="' + (by + bh - 44) + '" width="94" height="24" rx="12" fill="' + c[0] + '"/>'
      + '<text x="' + (bx + bw - 61) + '" y="' + (by + bh - 28) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="700" font-size="10" fill="' + c[3] + '">' + esc(players ? players[0] : 'family fun') + '</text>';
    g += '<text x="' + (bx + bw - 16) + '" y="' + (by + 24) + '" text-anchor="end" font-family="ui-monospace, monospace" font-size="9" fill="' + c[0] + '" opacity="0.8">' + it.year + '</text>';
    return g + wear(h, it.grade, bx, by, bw, bh);
  }

  // ── CEREAL: tall box front ───────────────────────────────────────
  function drawCereal(h, it, look) {
    var c = look.c, bx = 66, by = 8, bw = 168, bh = 282;
    var pop = c[2], deep = c[3];
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="3" fill="' + pop + '"/>'
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="40" fill="' + deep + '"/>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 25) + '" text-anchor="middle" font-family="' + look.f + '" font-size="10" letter-spacing="3" fill="' + c[0] + '">MORNING FOODS</text>';
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + 76) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 19, bw - 14) + '" fill="' + c[0] + '" stroke="' + deep + '" stroke-width="0.8">' + esc(it.name) + '</text>';
    // mascot: rolled head shape
    var mx = bx + bw / 2, my = by + 148, mtype = hb(h, 17) % 4;
    var skin = ['#f2c14e', '#8ac46a', '#e88a5a', '#9ad8e8'][hb(h, 18) % 4];
    g += '<circle cx="' + mx + '" cy="' + my + '" r="40" fill="' + skin + '"/>'
      + '<circle cx="' + (mx - 13) + '" cy="' + (my - 8) + '" r="5" fill="#ffffff"/><circle cx="' + (mx + 13) + '" cy="' + (my - 8) + '" r="5" fill="#ffffff"/>'
      + '<circle cx="' + (mx - 12) + '" cy="' + (my - 7) + '" r="2.4" fill="#1a1a1a"/><circle cx="' + (mx + 14) + '" cy="' + (my - 7) + '" r="2.4" fill="#1a1a1a"/>'
      + '<path d="M' + (mx - 14) + ' ' + (my + 12) + ' q 14 14 28 0" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if (mtype === 0) g += '<path d="M' + (mx - 26) + ' ' + (my - 28) + ' L' + mx + ' ' + (my - 78) + ' L' + (mx + 26) + ' ' + (my - 28) + ' Z" fill="' + deep + '"/>';                      // gnome hat
    if (mtype === 1) g += '<path d="M' + (mx - 34) + ' ' + (my - 22) + ' l-12 -26 l24 8 Z" fill="' + skin + '"/><path d="M' + (mx + 34) + ' ' + (my - 22) + ' l12 -26 l-24 8 Z" fill="' + skin + '"/>'; // wolf ears
    if (mtype === 2) g += '<circle cx="' + mx + '" cy="' + my + '" r="48" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.75"/>';                                              // astro helmet
    if (mtype === 3) g += '<path d="M' + (mx - 30) + ' ' + (my - 30) + ' q 30 -34 60 0" stroke="' + deep + '" stroke-width="8" fill="none"/>';                                          // combover
    // bowl of loops
    g += '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (by + bh - 44) + '" rx="56" ry="20" fill="#ffffff"/>'
      + '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (by + bh - 48) + '" rx="50" ry="14" fill="' + skin + '" opacity="0.9"/>';
    var i;
    for (i = 0; i < 7; i++) {
      g += '<circle cx="' + (bx + 34 + ((hb(h, 19) + i * 37) % (bw - 66))) + '" cy="' + (by + bh - 52 + (i % 3) * 5) + '" r="5" fill="' + pop + '" stroke="' + deep + '" stroke-width="1.4"/>';
    }
    // claim burst
    g += '<g transform="rotate(-14 ' + (bx + 30) + ' ' + (by + 96) + ')">'
      + '<circle cx="' + (bx + 30) + '" cy="' + (by + 96) + '" r="24" fill="' + c[0] + '"/>'
      + '<text x="' + (bx + 30) + '" y="' + (by + 93) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="7.5" fill="' + deep + '">FREE PRIZE</text>'
      + '<text x="' + (bx + 30) + '" y="' + (by + 102) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="7.5" fill="' + deep + '">INSIDE*</text></g>';
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 12) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7.5" fill="' + deep + '" opacity="0.9">NET WT ' + (10 + hb(h, 26) % 14) + ' OZ &middot; ' + it.year + '</text>';
    return g + wear(h, it.grade, bx, by, bw, bh);
  }

  // ── dispatch ─────────────────────────────────────────────────────
  function renderItem(h, size) {
    var it = A.hashToItem(h);
    if (it.cls === 'RECORD') return S.renderSleeve(h, size);
    var look = ERA_LOOK[it.era] || ERA_LOOK['1970s'];
    var g;
    if (it.cls === 'VHS') g = drawVHS(h, it, look);
    else if (it.cls === 'TOY') g = drawToy(h, it, look);
    else if (it.cls === 'GAME') g = drawGame(h, it, look);
    else g = drawCereal(h, it, look);
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="' + size + '" height="' + size + '">' + g + '</svg>', item: it };
  }

  var API = { renderItem: renderItem };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ATTIC_OBJECT = API;
})(this);
