/* SUPER SLICE 3D, suite row [24] (Part H, 25 Oct 2026): the painted Journey orchard stands on its painted feet, over
 * the same boxes. Run by audit-check.mjs (the full suite) and alone by tools/slice-3d-tests/fix/fwrun_h.js (the fail
 * watch, against a broken copy). Every expected value is worked out here: the level length from buildLevel's formula,
 * each cut out's painted foot from its OWN pixels, the code meshes by their own geometry, never a number the page reports.
 */
export async function rowH({ puppeteer, LAUNCH, URL, ok }) {
  console.log('\n[24] Part H: the painted Journey orchard stands on its painted feet, over the same boxes');
  /* one browser per case. `q` adds to the query; `block` aborts matching requests (a texture broken on purpose) */
  const bootH = async (q, block) => {
    const browser = await puppeteer.launch(LAUNCH); const p = await browser.newPage();
    await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 }); const errs = [];
    p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
    /* the worker's own fetches pass outside the page's interception: a broken file case goes straight to the network */
    if (block) { await p.setBypassServiceWorker(true); await p.setRequestInterception(true); p.on('request', r => block.test(r.url()) ? r.abort() : r.continue()); }
    await p.goto(URL + (q || ''), { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
    return { close: () => browser.close(), p, errs };
  };
  /* the code meshes Part H replaces, known by their own geometry */
  const SURVEY = () => {
    const kind = (m) => { const g = m.geometry, t = g && g.type, P = (g && g.parameters) || {};
      if (t === 'CylinderGeometry' && P.radiusTop === 0.8 && P.radiusBottom === 1.1) return 'trunk';
      if (t === 'SphereGeometry' && P.widthSegments === 9 && P.heightSegments === 7) return 'crown';
      if (t === 'ConeGeometry' && P.radius === 0.28) return 'tuft';
      if (t === 'SphereGeometry' && P.radius === 0.24) return 'bloom';
      if (t === 'BoxGeometry' && P.width === 4 && P.height === 0.08) return 'stripe';
      if (t === 'CylinderGeometry' && P.radiusTop === 0.7 && P.radiusBottom === 0.9 && P.height === 2.2) return 'stem';
      if (t === 'SphereGeometry' && P.radius === 1.4 && P.widthSegments === 7) return 'blob';
      if (t === 'SphereGeometry' && P.radius === 2.2 && P.widthSegments === 12) return 'cap';
      if (t === 'BoxGeometry' && P.height === 0.14 && P.depth === 6.1) return 'crack';
      return null; };
    const n = {}; window._S3.scene3().traverse(o => { if (o.isMesh) { const k = kind(o); if (k) { n[k] = n[k] || [0, 0]; n[k][0]++; if (o.visible) n[k][1]++; } } });
    return n; };
  /* the layout a level draws from its rng: every block and item, rounded. Paint must never move a draw (Part H review) */
  const LAYOUT = () => { const W = window._S3.world(), f = (v) => Math.round(v * 1000);
    return W.blocks.map(b => [b.x, b.y, b.w, b.h].map(f).join(',')).join(';') + '|' + W.items.map(i => [i.x, i.y, i.r].map(f).join(',')).join(';'); };
  const LEVELS = [3, 4, 5, 6, 9];   /* 9: a cracked shelf with salt 31 */

  /* A: the art in, levels 3, 4, 5, 6 and 9 */
  const A = await (async () => { const { close, p, errs } = await bootH(); let r;
    try { r = await p.evaluate(async (SURVEYs, LAYOUTs, LEVELS) => {
      const SURVEY = eval('(' + SURVEYs + ')'), LAYOUT = eval('(' + LAYOUTs + ')'), S = window._S3, wait = ms => new Promise(res => setTimeout(res, ms));
      S.salt(31); S.newGame(3);
      /* every painted piece this level asked for, in (or 25 s); then each level is built as a player's next level is */
      for (let i = 0; i < 125; i++) { let all = true, seen = 0; S.scene3().traverse(o => { const t = o.material && o.material.map; if (o.isSprite && t && t.userData && /j_/.test(t.userData.rel || '')) { seen++; if (!t.userData.ok) all = false; } });
        if (seen > 20 && all) break; await wait(200); }
      const out = { levels: [] }, cv = document.createElement('canvas'), g = cv.getContext('2d'), lowFrac = {};
      /* the lowest row over alpha 24 in the file's own pixels, as a fraction of its height */
      const low = (img, rel) => { if (lowFrac[rel] != null) return lowFrac[rel]; cv.width = img.naturalWidth; cv.height = img.naturalHeight; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, cv.width, cv.height).data; let row = -1; for (let y = cv.height - 1; y >= 0 && row < 0; y--) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 24) { row = y; break; }
        return (lowFrac[rel] = (row + 1) / cv.height); };
      /* a level's own painted files (a cracked shelf's first build asks for j_shelf only then): in, or 10 s */
      /* (a material only gets its map when the file lands, so the wait is on the game's own count of files asked for) */
      const settleJ = async () => { for (let i = 0; i < 50; i++) { const a = S.art(); if (a.asked > 0 && a.loaded + a.failed >= a.asked) return; await wait(200); } };
      for (const lvl of LEVELS) {
        S.salt(31); S.newGame(lvl); await settleJ(); S.salt(31); S.newGame(lvl); const sc = S.scene3(); sc.updateMatrixWorld(true);
        const len = 90 + Math.min(lvl, 40) * 14;   /* buildLevel's own formula */
        let lip = null; sc.traverse(o => { const P = o.isMesh && o.geometry.parameters; if (P && o.geometry.type === 'BoxGeometry' && Math.abs(P.width - (len + 70)) < 1e-6 && P.height === 0.5 && P.depth === 14.4) lip = o; });
        const L = { lvl, lipTop: lip ? lip.position.y + 0.25 : null, grass: null, span: null, survey: SURVEY(), layout: LAYOUT(), feet: [], shrooms: [], flag: null };
        if (lip && Array.isArray(lip.material)) { const t = lip.material[2].map; L.grass = t ? { s: t.wrapS, t: t.wrapT, ok: !!(t.userData && t.userData.ok), rel: t.userData && t.userData.rel } : null;
          const P = lip.geometry.attributes.position, N = lip.geometry.attributes.normal, U = lip.geometry.attributes.uv; let lo = 1e9, hi = -1e9;
          for (let i = 0; i < P.count; i++) if (N.getY(i) > 0.5) { lo = Math.min(lo, U.getX(i)); hi = Math.max(hi, U.getX(i)); } L.span = hi - lo; }
        sc.traverse(o => { const t = o.isSprite && o.material.map, rel = t && t.userData && t.userData.rel; if (!rel || !/\/j_(tree|bush|tuft|flower|mushroom)/.test(rel) || !t.image) return;
          const foot = o.position.y - o.center.y * o.scale.y + (1 - low(t.image, rel)) * o.scale.y;
          if (/j_mushroom/.test(rel)) { const b = S.world().blocks.find(b => b.spring && Math.abs(b.x + b.w / 2 - o.position.x) < 0.6); L.shrooms.push({ dx: b ? +(o.position.x - (b.x + b.w / 2)).toFixed(4) : null, w: +o.scale.x.toFixed(4), foot: +foot.toFixed(3) }); }
          else L.feet.push({ k: rel.replace(/.*\/j_/, '').replace('.webp', ''), foot: +foot.toFixed(4), vis: o.visible && o.material.opacity > 0.99 }); });
        sc.traverse(o => { if (o.isMesh && o.name === 'jflag') L.flag = { vis: o.visible, op: o.material.opacity, rel: o.material.map && o.material.map.userData.rel, ok: !!(o.material.map && o.material.map.userData.ok) }; });
        out.levels.push(L);
      }
      out.MIRROR = THREE.MirroredRepeatWrapping;
      return out; }, SURVEY.toString(), LAYOUT.toString(), LEVELS); } catch (e) { r = { error: String(e).slice(0, 200) }; }
    await close(); return { r, errs }; })();
  /* GRASS_TOP lives inside the game's closure: read from the page's own source as served (a copy saying 0.4 fails) */
  const GT = await fetch(URL).then(r => r.text()).then(t => parseFloat((t.match(/var GRASS_TOP=([0-9.]+);/) || [])[1])).catch(() => null);
  if (A.r) A.r.GT = GT;
  const Ls = (A.r && A.r.levels) || [];
  const feet = Ls.flatMap(L => L.feet), trees = feet.filter(f => /^tree/.test(f.k)), low = feet.filter(f => !/^tree/.test(f.k));
  ok('the grass you see is still at 0.25: the lip box top and GRASS_TOP (the knife rests on it, row [22])', Ls.length === LEVELS.length && Ls.every(L => Math.abs(L.lipTop - 0.25) < 1e-6) && A.r.GT === 0.25, JSON.stringify({ tops: Ls.map(L => L.lipTop), GT: A.r && A.r.GT }));
  ok('the counter wears the painted grass, mirrored both ways, one tile per 8 units along the level (len worked out here)', Ls.length === LEVELS.length && Ls.every(L => L.grass && L.grass.ok && L.grass.s === A.r.MIRROR && L.grass.t === A.r.MIRROR && /j_grass/.test(L.grass.rel) && Math.abs(L.span - (90 + Math.min(L.lvl, 40) * 14 + 70) / 8) < 0.01), JSON.stringify(Ls.map(L => ({ g: L.grass, span: L.span && +L.span.toFixed(3) }))));
  const tot = (k) => Ls.reduce((s, L) => s + ((L.survey[k] || [0])[0]), 0);
  ok('with the orchard in, no code trunk, crown, tuft, bloom, stripe, mushroom stem or cap, branch blob or shelf crack is drawn (and the levels have each)', Ls.length === LEVELS.length && Ls.every(L => Object.values(L.survey).every(c => c[1] === 0)) && Ls.every(L => (L.survey.trunk || [0])[0] > 5 && (L.survey.stripe || [0])[0] > 5) && ['stem', 'cap', 'blob', 'crack'].every(k => tot(k) >= 1), JSON.stringify(Ls.map(L => L.survey)));
  /* trees within 0.02: their feet sit at 99.6 percent of the canvas, so a copy standing the CANVAS on the ground moves them
     0.04 to 0.08 (the plan's 0.1 could not see it); bushes, tufts and flowers sit at 98 to 99 percent, so canvas anchoring
     moves them under 0.03 and cannot be told apart at any tolerance: there the check is the plan's 0.1 */
  ok('every painted tree stands its painted foot on the trunk base (y -1, within 0.02, from its pixels)', trees.length > 30 && trees.every(f => f.vis && Math.abs(f.foot + 1) <= 0.02), JSON.stringify(trees.filter(f => Math.abs(f.foot + 1) > 0.02).slice(0, 4)) + ' n=' + trees.length);
  ok('every painted bush, tuft and flower stands on the grass (0.25, within 0.1, from its pixels)', low.length > 30 && low.every(f => f.vis && Math.abs(f.foot - 0.25) <= 0.1) && ['bush', 'tuft', 'flower'].every(k => low.some(f => f.k.indexOf(k) === 0)), JSON.stringify(low.filter(f => Math.abs(f.foot - 0.25) > 0.1).slice(0, 4)) + ' n=' + low.length);
  const sh = Ls.flatMap(L => L.shrooms);
  ok('the painted mushroom is centred on its spring block and 4.4 wide, its painted foot on the ground', sh.length >= 1 && sh.every(m => m.dx !== null && Math.abs(m.dx) < 0.01 && Math.abs(m.w - 4.4) < 0.01 && Math.abs(m.foot) <= 0.1), JSON.stringify(sh));
  ok('the finish flag carries her pennant (unlit, in)', Ls.length === LEVELS.length && Ls.every(L => L.flag && L.flag.vis && L.flag.ok && L.flag.op === 1 && /j_flag/.test(L.flag.rel)), JSON.stringify(Ls.map(L => L.flag)));
  ok('no page errors with the orchard in', A.r && !A.r.error && A.errs.length === 0, JSON.stringify([A.r && A.r.error, A.errs]));

  /* B: ?noart=1 builds the whole code look, from the very same layout */
  { const { close, p, errs } = await bootH('&noart=1'); let r;
    try { r = await p.evaluate(async (SURVEYs, LAYOUTs, LEVELS) => { const SURVEY = eval('(' + SURVEYs + ')'), LAYOUT = eval('(' + LAYOUTs + ')'), S = window._S3, lay = {};
      for (const lvl of LEVELS) { S.salt(31); S.newGame(lvl); lay[lvl] = LAYOUT(); }
      S.salt(31); S.newGame(3); await new Promise(res => setTimeout(res, 1500)); return { n: SURVEY(), lay }; }, SURVEY.toString(), LAYOUT.toString(), LEVELS); } catch (e) { r = { error: String(e) }; }
    const n = r && r.n;
    ok('?noart=1 builds the full code look with no errors', n && !r.error && ['trunk', 'crown', 'tuft', 'stripe'].every(k => n[k] && n[k][1] === n[k][0] && n[k][0] > 3) && errs.length === 0, JSON.stringify([n, errs]));
    const same = Ls.length === LEVELS.length && r && r.lay && Ls.every(L => r.lay[L.lvl] && r.lay[L.lvl] === L.layout && L.layout.length > 50);
    ok('the paint moves no rng draw: every block and item of levels ' + LEVELS.join(', ') + ' lands where the code look puts it', same, same ? '' : JSON.stringify(Ls.map(L => [L.lvl, r && r.lay && r.lay[L.lvl] === L.layout])));
    await close(); }

  /* C: the grass file broken on purpose: its stripes and the code grass stay, the rest still paints, nothing throws */
  { const { close, p, errs } = await bootH('', /j_grass\.webp/); let r;
    try { r = await p.evaluate(async (SURVEYs) => { const SURVEY = eval('(' + SURVEYs + ')'), S = window._S3; S.salt(31); S.newGame(3); await new Promise(res => setTimeout(res, 6000)); S.salt(31); S.newGame(3);
      const n = SURVEY(); let top = null; S.scene3().traverse(o => { if (o.isMesh && Array.isArray(o.material) && o.geometry.parameters.height === 0.5) top = { map: !!(o.material[2].map && o.material[2].map.userData.ok), col: o.material[2].color.getHex() }; }); return { n, top }; }, SURVEY.toString()); } catch (e) { r = { error: String(e) }; }
    ok('a broken grass file keeps the stripes and the code grass, without errors (the trees still paint)', r && r.n && r.n.stripe && r.n.stripe[1] === r.n.stripe[0] && r.n.stripe[0] > 5 && r.top && !r.top.map && r.top.col === 0x557a48 && (r.n.trunk || [0, 1])[1] === 0 && errs.length === 0, JSON.stringify([r, errs]));
    await close(); }
}
