// The camera: which part of the world the canvas shows, and how big. Browser only, reads nothing of the sim.
// Zoom is in device pixels per logical pixel and is a whole number from 1 up, so every logical pixel covers
// the same whole number of screen pixels (crisp on a 2.625 dpr phone, where 2 CSS px per logical px would be
// 5.25 device px). Below 1 device px per logical px crispness means nothing, so the far levels are 1/2 and
// the exact fraction that fits the whole world; there creatures are drawn as dots (render.js).
export function createCamera() {
  const cam = {
    x: 0, y: 0, // the world point (logical px) at the canvas centre
    zoom: 1, levels: [1], // device px per logical px; the levels the buttons and pinch snap to
    cw: 1, ch: 1, dpr: 1, // canvas size in device px, device pixel ratio
    worldW: 1, worldH: 1,
    // Device px of the world origin on the canvas: whole numbers, so tiles never straddle pixels.
    ox: 0, oy: 0,
    resize(cssW, cssH, dpr) {
      cam.dpr = dpr;
      cam.cw = Math.max(1, Math.round(cssW * dpr)); cam.ch = Math.max(1, Math.round(cssH * dpr));
      const top = Math.max(1, Math.round(6 * dpr)); // the bible's 1x to 6x of logical px, in device px
      cam.levels = [0.25, 0.5];
      for (let z = 1; z <= top; z++) cam.levels.push(z);
      cam.update();
    },
    // The whole world in view, centred: the largest whole-number level at which it fits, or below 1, the exact
    // fraction that fits (added to the levels).
    fit(worldW, worldH) {
      cam.worldW = worldW; cam.worldH = worldH;
      const exact = Math.min(cam.cw / worldW, cam.ch / worldH);
      cam.levels = cam.levels.filter((l) => l >= 1 || l === 0.5);
      if (exact < 1) { cam.levels.push(exact); cam.levels.sort((a, b) => a - b); cam.levels = cam.levels.filter((l) => l >= exact); }
      let z = cam.levels[0];
      for (const l of cam.levels) if (worldW * l <= cam.cw + 1e-9 && worldH * l <= cam.ch + 1e-9) z = l;
      cam.zoom = z; cam.x = worldW / 2; cam.y = worldH / 2;
      cam.update();
    },
    // The start view: the whole-number level at which the world's width is closest to the canvas's, letting
    // up to a tenth of it run past the edges (pannable) rather than leaving the phone's width a third empty;
    // centred. A world that fits whole at that level stays whole. Never closer than that, and never so far out
    // that creatures are dots (render.js draws dots below `dpr`): a big world starts at the first level with
    // sprites, its middle in view, and the player zooms out for the whole of it.
    fitWidth(worldW, worldH) {
      cam.fit(worldW, worldH);
      for (const l of cam.levels) if (l >= 1 && worldW * l <= cam.cw * 1.1) cam.zoom = Math.max(cam.zoom, l);
      const near = cam.levels.find((l) => l >= cam.dpr);
      if (near !== undefined && cam.zoom < near) cam.zoom = near;
      cam.x = worldW / 2; cam.y = worldH / 2;
      cam.update();
    },
    // Keep the view on the world: a world smaller than the view stays centred; a bigger one can be panned
    // up to its edges plus a margin (so an edge creature is never under the header).
    clampView() {
      // The margin: 64 CSS px, so a corner can come out from under the camera buttons.
      const z = cam.zoom, halfW = cam.cw / 2 / z, halfH = cam.ch / 2 / z, m = (64 * cam.dpr) / z;
      if (cam.worldW * z <= cam.cw) cam.x = cam.worldW / 2; else cam.x = Math.min(cam.worldW + m - halfW, Math.max(halfW - m, cam.x));
      if (cam.worldH * z <= cam.ch) cam.y = cam.worldH / 2; else cam.y = Math.min(cam.worldH + m - halfH, Math.max(halfH - m, cam.y));
    },
    // At whole-number zoom the canvas holds logical pixels and the browser scales it up by `zoom` (render.js),
    // so the world's origin sits on a multiple of the zoom; at far zoom the canvas holds device pixels.
    update() {
      cam.clampView();
      const q = cam.zoom >= 1 ? cam.zoom : 1;
      cam.ox = q * Math.round((cam.cw / 2 - cam.x * cam.zoom) / q);
      cam.oy = q * Math.round((cam.ch / 2 - cam.y * cam.zoom) / q);
    },
    // Device px per canvas px: the zoom at whole-number zoom, else 1.
    pixel: () => (cam.zoom >= 1 ? cam.zoom : 1),
    // Screen (CSS px relative to the canvas) to world (logical px), and world to canvas device px.
    toWorld(cssX, cssY) { return [(cssX * cam.dpr - cam.ox) / cam.zoom, (cssY * cam.dpr - cam.oy) / cam.zoom]; },
    toCanvas(wx, wy) { return [cam.ox + wx * cam.zoom, cam.oy + wy * cam.zoom]; },
    // The visible world rectangle (logical px).
    view() { return [-cam.ox / cam.zoom, -cam.oy / cam.zoom, (cam.cw - cam.ox) / cam.zoom, (cam.ch - cam.oy) / cam.zoom]; },
    panBy(dCssX, dCssY) { cam.x -= (dCssX * cam.dpr) / cam.zoom; cam.y -= (dCssY * cam.dpr) / cam.zoom; cam.update(); },
    // Zoom to `z` keeping the world point under the screen point (cssX, cssY) where it is.
    zoomAt(z, cssX, cssY) {
      const [wx, wy] = cam.toWorld(cssX, cssY);
      cam.zoom = z;
      cam.x = wx - (cssX * cam.dpr - cam.cw / 2) / z; cam.y = wy - (cssY * cam.dpr - cam.ch / 2) / z;
      cam.update();
    },
    step(dir, cssX = cam.cw / 2 / cam.dpr, cssY = cam.ch / 2 / cam.dpr) { // +1 in, -1 out
      const i = cam.levels.indexOf(cam.nearest(cam.zoom)), j = Math.max(0, Math.min(cam.levels.length - 1, i + dir));
      cam.zoomAt(cam.levels[j], cssX, cssY);
    },
    nearest(z) { let b = cam.levels[0]; for (const l of cam.levels) if (Math.abs(Math.log(l / z)) < Math.abs(Math.log(b / z))) b = l; return b; },
  };
  return cam;
}
