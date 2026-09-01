// CONDUIT browser driver — the shared hands.
//
// Everything here acts on the page the way a thumb does: real touch events at
// real coordinates. Game state is only ever READ, to decide the next move and to
// report what happened. Nothing here calls a game function to make something
// happen; if a script needs to set a scene it does so explicitly and says so.
const path = require("path");
const puppeteer = require(path.join("/workspaces/lucid-winds", "node_modules", "puppeteer"));

const URL = "file://" + path.join(__dirname, "..", "index.html");
const settle = ms => new Promise(r => setTimeout(r, ms));

async function open(vw, vh, extraQuery) {
  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1,
                           isMobile: vw < 900, hasTouch: true });
  await page.goto(URL + (extraQuery || ""), { waitUntil: "load" });
  return { browser, page, errs };
}

// The real path a player takes into a site: the title's button opens the site
// list, and a site's own button starts it. Shared, because a test that rolls its
// own entry stops entering the moment the entry changes.
async function enterSite(page, levelId) {
  const go = await page.evaluate(() => {
    const b = document.getElementById("go"); if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (go) { await page.mouse.click(go.x, go.y); await settle(400); }
  const onSites = await page.evaluate(() =>
    !document.getElementById("sites").classList.contains("hide"));
  if (onSites) {
    const idx = await page.evaluate(w => CONDUIT.LEVEL_ORDER.indexOf(w), levelId || "site-02");
    const btn = await page.evaluate(i => {
      const cards = document.querySelectorAll("#sitelist .site");
      // a resume card is inserted first when one exists, so count from the end
      const off = cards.length - CONDUIT.LEVEL_ORDER.length;
      const b = cards[i + off].querySelector("button");
      b.scrollIntoView({ block: "center" });
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, idx);
    await settle(200);
    await page.mouse.click(btn.x, btn.y);
  }
  await settle(700);
}

function driver(page, vw, vh) {
  const ORIGIN = [Math.round(vw * 0.17), Math.round(vh * 0.52)];

  const read = () => page.evaluate(() => {
    const S = CONDUIT.S, b = CONDUIT.blobRef();
    return { mode: S.mode, x: b.x, y: b.y, mass: b.mass, alert: S.site.alert,
      peak: S.site.peak, lockdown: S.site.lockdown, conduits: S.conduits.length,
      live: S.conduits.filter(c => c.live).length,
      committed: S.conduits.reduce((a, c) => a + c.cost, 0),
      discovered: S.conduits.filter(c => c.discovered).length,
      devices: S.devices.filter(d => d.on).map(d => d.kind),
      dead: S.enemies.filter(e => e.state === "dead").length,
      bodies: S.bodies.length, residue: S.player.residue,
      leak: S.ledger.leak, tiles: S.stats.tilesLaid, t: S.stats.time,
      result: S.result ? (S.result.ok ? "extracted" : "lost:" + S.result.msg) : null,
      hunting: S.enemies.filter(e => e.state === "hunt").length, toast: S.toast };
  });

  const btn = id => page.evaluate(i => {
    const b = CONDUIT.btns.find(x => x.id === i);
    return b ? { x: b.x + b.w / 2, y: b.y + b.h / 2, label: b.label } : null;
  }, id);

  async function tapBtn(id) {
    const b = await btn(id);
    if (!b) return null;
    await page.touchscreen.tap(b.x, b.y);
    await settle(160);
    return b.label;
  }

  const start = (levelId) => enterSite(page, levelId);

  async function walkTo(tx, ty, budgetMs) {
    const t0 = Date.now();
    const route = (await page.evaluate(([x, y]) => {
      const b = CONDUIT.blobRef();
      return CONDUIT.bfs(b.x, b.y, x, y) || [[x, y]];
    }, [tx, ty])) || [[tx, ty]];
    if (!route.length) route.push([tx, ty]);
    let wi = 0;
    await page.touchscreen.touchStart(ORIGIN[0], ORIGIN[1]);
    while (Date.now() - t0 < budgetMs) {
      const b = await page.evaluate(() => { const q = CONDUIT.blobRef();
        return CONDUIT.S.result ? null : [q.x, q.y]; });
      if (!b) break;                                   // the run ended under us
      while (wi < route.length - 1 &&
             Math.hypot(route[wi][0] + 0.5 - b[0], route[wi][1] + 0.5 - b[1]) < 0.7) wi++;
      const w = route[Math.min(wi, route.length - 1)];
      const dx = w[0] + 0.5 - b[0], dy = w[1] + 0.5 - b[1], d = Math.hypot(dx, dy);
      if (wi >= route.length - 1 && Math.hypot(tx + 0.5 - b[0], ty + 0.5 - b[1]) < 0.6) break;
      await page.touchscreen.touchMove(ORIGIN[0] + (dx / (d || 1)) * 70,
                                       ORIGIN[1] + (dy / (d || 1)) * 70);
      await settle(45);
    }
    await page.touchscreen.touchEnd();
    await settle(120);
    const b = await page.evaluate(() => { const q = CONDUIT.blobRef(); return [q.x, q.y]; });
    return Math.hypot(tx + 0.5 - b[0], ty + 0.5 - b[1]);
  }
  // Step out of cover, be seen, step back. The alert ladder decays in 8s at
  // Suspicion and 15s at Search, so a long retreat between sightings loses more
  // ground than the sighting gains: it has to be a short shuttle.
  async function shuttle(outX, outY, inX, inY, rounds, budgetMs) {
    const seen = [];
    for (let i = 0; i < rounds; i++) {
      const s0 = await read();
      if (s0.result) break;
      await walkTo(outX, outY, budgetMs);
      const t0 = Date.now();
      while (Date.now() - t0 < 5000) {
        const s = await read();
        if (s.alert > s0.alert || s.result) break;
        await settle(300);
      }
      const s1 = await read();
      seen.push(s1.alert);
      if (s1.alert >= 4 || s1.result) break;
      await walkTo(inX, inY, budgetMs);
      await settle(1200);                              // just long enough to be forgotten
    }
    return seen;
  }

  async function push(dx, dy, ms) {
    await page.touchscreen.touchStart(ORIGIN[0], ORIGIN[1]);
    await page.touchscreen.touchMove(ORIGIN[0] + dx * 70, ORIGIN[1] + dy * 70);
    await settle(ms);
    await page.touchscreen.touchEnd();
    await settle(100);
  }

  async function waitCamera(budgetMs) {
    const t0 = Date.now(); let last = null;
    while (Date.now() - t0 < budgetMs) {
      const c = await page.evaluate(() => ({ ...CONDUIT.cam }));
      if (last && Math.abs(c.s - last.s) < 0.02 &&
          Math.abs(c.x - last.x) < 0.01 && Math.abs(c.y - last.y) < 0.01) return true;
      last = c; await settle(120);
    }
    return false;
  }

  async function enterFlow(budgetMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < budgetMs) {
      if ((await read()).mode === "flow") return true;
      await tapBtn("flow"); await settle(400);
    }
    return (await read()).mode === "flow";
  }

  // Drag a route tile by tile, then hold at the end until the route has caught
  // up, the way a thumb does when it can see the line is still behind.
  async function drawWire(tiles) {
    await waitCamera(4000);
    const pts = await page.evaluate(t => t.map(([x, y]) => CONDUIT.w2s(x + 0.5, y + 0.5)), tiles);
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) { await page.touchscreen.touchMove(p[0], p[1]); await settle(40); }
    const last = pts[pts.length - 1], goal = tiles[tiles.length - 1];
    for (let i = 0; i < 30; i++) {
      const end = await page.evaluate(() => { const d = CONDUIT.S.draft;
        return d ? d.path[d.path.length - 1] : null; });
      if (!end || (end[0] === goal[0] && end[1] === goal[1])) break;
      await page.touchscreen.touchMove(last[0] + (i % 2 ? 0.6 : -0.6), last[1]);
      await settle(90);
    }
    const got = await page.evaluate(() => { const d = CONDUIT.S.draft;
      return d ? d.path.length : 0; });
    await page.touchscreen.touchEnd();
    await settle(250);
    return got;
  }

  async function tapTile(x, y) {
    const p = await page.evaluate(([tx, ty]) => CONDUIT.w2s(tx + 0.5, ty + 0.5), [x, y]);
    await page.touchscreen.tap(p[0], p[1]);
    await settle(200);
  }

  return { read, btn, tapBtn, start, walkTo, shuttle, push, waitCamera, enterFlow,
           drawWire, tapTile, settle, ORIGIN };
}

module.exports = { open, driver, enterSite, settle, URL };
