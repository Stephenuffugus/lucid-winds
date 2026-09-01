// CONDUIT control probe.
//
// Studio law: never prove a control works with el.click(). A handler you call
// yourself proves the handler exists, not that a thumb can reach it. Every
// control here is located by document.elementFromPoint at its drawn centre,
// then driven with a real touch event at that exact coordinate, then judged by
// what happened to game state.
//
//   node test/controls.js            375x667, the touch reference size
//   node test/controls.js 320 568
const path = require("path");
const puppeteer = require(path.join("/workspaces/lucid-winds", "node_modules", "puppeteer"));
const { enterSite } = require("./drive");

const VW = Number(process.argv[2]) || 375;
const VH = Number(process.argv[3]) || 667;
const URL = "file://" + path.join(__dirname, "..", "index.html");
const MIN_TOUCH = 48;

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log("  ok   " + name); }
  else { fail++; console.log("  FAIL " + name + (extra ? "  → " + extra : "")); }
};
const settle = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e)));
  await page.setViewport({ width: VW, height: VH, deviceScaleFactor: 1,
                           isMobile: true, hasTouch: true });
  await page.goto(URL, { waitUntil: "load" });

  console.log(`\nCONDUIT control probe at ${VW}x${VH}\n`);

  // enter the way a player does: title, then the site list, then a site
  const go = await page.evaluate(() => {
    const r = document.getElementById("go").getBoundingClientRect();
    return { h: r.height, w: r.width };
  });
  ok("the start button meets the touch minimum",
     go.h >= MIN_TOUCH, `${Math.round(go.w)}x${Math.round(go.h)} rendered px`);
  await enterSite(page, "site-02");
  ok("entering a site dismisses the title and the site list",
     await page.evaluate(() =>
       document.getElementById("overlay").classList.contains("hide") &&
       document.getElementById("sites").classList.contains("hide")));

  // ── geometry: is each control actually reachable where it is drawn ──────────
  const btns = await page.evaluate(() => CONDUIT.btns.map(b => ({ ...b })));
  ok("every control is laid out", btns.length === 5, "got " + btns.length);
  ok("the thumb block and the menu are the five", 
     ["act","flow","pulse","reclaim","menu"].every(id => btns.some(b => b.id === id)),
     btns.map(b => b.id).join(","));

  for (const b of btns) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const probe = await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      const hit = CONDUIT.hitBtn(x, y);
      return { el: el ? el.tagName + (el.id ? "#" + el.id : "") : "none",
               hit: hit ? hit.id : null };
    }, [cx, cy]);
    ok(`${b.label.padEnd(11)} centre hits the canvas, nothing over it`,
       probe.el === "CANVAS#c", probe.el);
    ok(`${b.label.padEnd(11)} is hit-tested as itself where it is drawn`,
       probe.hit === b.id, `elementFromPoint says ${probe.hit}`);
    ok(`${b.label.padEnd(11)} is at least ${MIN_TOUCH}px rendered`,
       b.w >= MIN_TOUCH && b.h >= MIN_TOUCH, `${Math.round(b.w)}x${Math.round(b.h)}`);
  }
  const overlap = btns.some((a, i) => btns.some((c, j) =>
    j > i && a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h));
  ok("no two controls overlap each other", !overlap);
  const safe = await page.evaluate(() => ({ ...CONDUIT.safe, w: CONDUIT.view.w, h: CONDUIT.view.h }));
  ok("no control runs off screen or into a safe area inset",
     btns.every(b => b.x >= safe.l && b.y >= safe.t &&
                     b.x + b.w <= safe.w - safe.r && b.y + b.h <= safe.h - safe.b),
     JSON.stringify(safe));

  const at = id => { const b = btns.find(x => x.id === id);
                     return [b.x + b.w / 2, b.y + b.h / 2]; };
  const state = () => page.evaluate(() => ({
    mode: CONDUIT.S.mode, mass: CONDUIT.blobRef().mass,
    pulseCd: CONDUIT.S.player.pulseCd, tapCd: CONDUIT.S.player.tapCd || 0,
    act: CONDUIT.S.act.verb, conduits: CONDUIT.S.conduits.length,
    reclaiming: CONDUIT.S.conduits.some(c => c.reclaiming),
    selected: !!CONDUIT.S.selected, owned: CONDUIT.S.ledger.owned,
    lights: CONDUIT.S.lights.filter(l => l.out).length,
    dead: CONDUIT.S.enemies.filter(e => e.state === "dead").length,
  }));

  // ── PULSE: costs mass and goes on cooldown ─────────────────────────────────
  {
    const before = await state();
    await page.touchscreen.tap(...at("pulse"));
    await settle(120);
    const after = await state();
    ok("PULSE fires from a real touch", after.pulseCd > 0, `cd=${after.pulseCd}`);
    ok("PULSE costs mass", after.mass < before.mass,
       `${before.mass.toFixed(1)} to ${after.mass.toFixed(1)}`);
  }

  // ── ACT with nothing in reach is TAP ───────────────────────────────────────
  {
    const before = await state();
    const label = await page.evaluate(() => CONDUIT.btns.find(b => b.id === "act").label);
    ok("ACT labels itself TAP when nothing is in reach", label === "TAP", label);
    await page.touchscreen.tap(...at("act"));
    await settle(120);
    const after = await state();
    ok("ACT fires the tap from a real touch", after.tapCd > 0, `cd=${after.tapCd}`);
    ok("the tap costs mass", after.mass < before.mass);
  }

  // ── ACT becomes DRINK LIGHT when standing in a light pool ──────────────────
  {
    await page.evaluate(() => {                      // setup only, not the proof
      const L = CONDUIT.S.lights.find(l => !l.out);
      const b = CONDUIT.blobRef(); b.x = L.x + 0.5; b.y = L.y + 0.5;
    });
    await settle(120);
    const label = await page.evaluate(() => CONDUIT.btns.find(b => b.id === "act").label);
    ok("ACT relabels itself DRINK LIGHT over a light", label === "DRINK LIGHT", label);
    const before = await state();
    await page.touchscreen.tap(...at("act"));
    await settle(120);
    const after = await state();
    ok("drinking a light from a real touch puts it out", after.lights > before.lights,
       `${before.lights} to ${after.lights}`);
  }

  // ── ACT becomes SMOTHER beside an unaware guard ────────────────────────────
  {
    await page.evaluate(() => {
      const e = CONDUIT.S.enemies[0], b = CONDUIT.blobRef();
      b.x = e.x + 0.4; b.y = e.y;
    });
    await settle(80);
    const label = await page.evaluate(() => {
      const e = CONDUIT.S.enemies[0], b = CONDUIT.blobRef();
      b.x = e.x + 0.4; b.y = e.y;
      return CONDUIT.btns.find(x => x.id === "act").label;
    });
    ok("ACT relabels itself SMOTHER beside an unaware guard", label === "SMOTHER", label);
    await page.touchscreen.tap(...at("act"));
    await settle(120);
    ok("SMOTHER starts from a real touch",
       (await state()).act === "envelop" || (await state()).dead > 0);
    await page.touchscreen.tap(...at("act"));   // the same button now says RELEASE
    await settle(120);
  }

  // ── FLOW: gated, and it toggles ────────────────────────────────────────────
  {
    await page.evaluate(() => {                      // somewhere quiet, back at the entry
      const b = CONDUIT.blobRef(); b.x = 5.5; b.y = 27.5;
      CONDUIT.S.enemies.forEach(e => e.spot = 0);
      CONDUIT.S.act = { verb: null, target: null, t: 0 };
    });
    await settle(500);                               // stillness is a requirement
    await page.touchscreen.tap(...at("flow"));
    await settle(400);
    ok("FLOW lifts the camera from a real touch", (await state()).mode === "flow");
    await page.touchscreen.tap(...at("flow"));
    await settle(400);
    ok("FLOW toggles back to prowl", (await state()).mode === "prowl");
  }

  // ── the core control: drawing a route by dragging, in world coordinates ────
  {
    await settle(400);
    await page.touchscreen.tap(...at("flow"));
    await settle(600);
    ok("back in flow to draw", (await state()).mode === "flow");
    const pts = await page.evaluate(() => {
      const out = [];
      for (let y = 16; y >= 12; y--) { const p = CONDUIT.w2s(9 + 0.5, y + 0.5); out.push(p); }
      return out;
    });
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) { await page.touchscreen.touchMove(p[0], p[1]); await settle(45); }
    await page.touchscreen.touchEnd();
    await settle(200);
    const after = await state();
    ok("dragging from a source lays a real conduit", after.conduits === 1,
       "conduits=" + after.conduits);
    const laid = await page.evaluate(() => CONDUIT.S.conduits[0].path.length);
    ok("the drag laid the tiles it was dragged over", laid === 5, "tiles=" + laid);
    ok("laying it cost mass", after.mass < 100, "mass=" + after.mass.toFixed(1));
  }

  // ── the drag must survive skipped events and a blocked step ───────────────
  {
    await page.evaluate(() => { CONDUIT.S.conduits.length = 0;
      CONDUIT.S.ledger.owned = CONDUIT.blobRef().mass; CONDUIT.resolvePower(); });
    // two move events for a fourteen tile route: everything between must fill in
    const pts = await page.evaluate(() =>
      [[9,16],[9,10],[16,10]].map(([x,y]) => CONDUIT.w2s(x+0.5,y+0.5)));
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) { await page.touchscreen.touchMove(p[0], p[1]); await settle(140); }
    await settle(200); await page.touchscreen.touchEnd(); await settle(200);
    const laid = await page.evaluate(() => {
      const c = CONDUIT.S.conduits[CONDUIT.S.conduits.length-1];
      return c ? { n: c.path.length, first: c.path[0], last: c.path[c.path.length-1] } : null; });
    ok("a drag with skipped events fills in every tile between",
       !!laid && laid.n === 14, laid ? "tiles=" + laid.n : "no conduit");
    ok("and it ends where the finger did",
       !!laid && laid.last[0] === 16 && laid.last[1] === 10, JSON.stringify(laid && laid.last));
  }
  {
    await page.evaluate(() => { CONDUIT.S.conduits.length = 0;
      CONDUIT.S.ledger.owned = CONDUIT.blobRef().mass; CONDUIT.resolvePower(); });
    // aim through a wall, then somewhere legal: the stroke must survive the block
    const pts = await page.evaluate(() =>
      [[9,16],[9,19],[12,17]].map(([x,y]) => CONDUIT.w2s(x+0.5,y+0.5)));
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) { await page.touchscreen.touchMove(p[0], p[1]); await settle(140); }
    await settle(200); await page.touchscreen.touchEnd(); await settle(200);
    const laid = await page.evaluate(() => {
      const c = CONDUIT.S.conduits[CONDUIT.S.conduits.length-1];
      return c ? c.path.length : 0; });
    ok("a drag blocked by a wall is not dead for the rest of the stroke",
       laid === 5, "tiles=" + laid);
  }
  {
    await page.evaluate(() => { CONDUIT.S.conduits.length = 0;
      CONDUIT.S.ledger.owned = CONDUIT.blobRef().mass; CONDUIT.resolvePower(); });
    // one event, then the finger holds still: the route must catch up to it
    const pts = await page.evaluate(() =>
      [[9,16],[9,8]].map(([x,y]) => CONDUIT.w2s(x+0.5,y+0.5)));
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    await page.touchscreen.touchMove(pts[1][0], pts[1][1]);
    await settle(80);
    await page.touchscreen.touchMove(pts[1][0] + 0.4, pts[1][1]);   // same tile, held
    await settle(300);
    await page.touchscreen.touchEnd(); await settle(200);
    const laid = await page.evaluate(() => {
      const c = CONDUIT.S.conduits[CONDUIT.S.conduits.length-1]; return c ? c.path.length : 0; });
    ok("a route that fell behind catches up while the finger is held",
       laid === 9, "tiles=" + laid);
  }
  await page.evaluate(() => { CONDUIT.S.conduits.length = 0;
    CONDUIT.S.ledger.owned = CONDUIT.blobRef().mass; CONDUIT.resolvePower(); });
  {
    const pts = await page.evaluate(() =>
      [[9,16],[9,14],[9,12]].map(([x,y]) => CONDUIT.w2s(x+0.5,y+0.5)));
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) { await page.touchscreen.touchMove(p[0], p[1]); await settle(140); }
    await settle(200); await page.touchscreen.touchEnd(); await settle(200);
  }

  // ── RECLAIM: select a wire with a real tap, then pull it with a real tap ───
  {
    const wire = await page.evaluate(() => CONDUIT.w2s(9 + 0.5, 14 + 0.5));
    await page.touchscreen.tap(wire[0], wire[1]);
    await settle(150);
    ok("tapping a laid wire selects it", (await state()).selected);
    const rb = await page.evaluate(() => {
      const b = CONDUIT.btns.find(x => x.id === "reclaim");
      const el = document.elementFromPoint(b.x + b.w / 2, b.y + b.h / 2);
      return { x: b.x + b.w / 2, y: b.y + b.h / 2,
               el: el ? el.tagName + (el.id ? "#" + el.id : "") : "none" };
    });
    ok("RECLAIM centre hits the canvas with the wire selected", rb.el === "CANVAS#c", rb.el);
    await page.touchscreen.tap(rb.x, rb.y);
    await settle(150);
    ok("RECLAIM starts the retraction from a real touch",
       (await state()).reclaiming || (await state()).conduits === 0);
  }

  // ── the settings drawer, and handedness actually moving the controls ───────
  {
    const before = await page.evaluate(() => CONDUIT.btns.find(b => b.id === "flow").x);
    const m = btns.find(b => b.id === "menu");
    const overlay = await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.tagName + (el.id ? "#" + el.id : "") : "none";
    }, [m.x + m.w / 2, m.y + m.h / 2]);
    ok("the menu control hits the canvas, nothing over it", overlay === "CANVAS#c", overlay);
    await page.touchscreen.tap(m.x + m.w / 2, m.y + m.h / 2);
    await settle(250);
    ok("tapping it opens the settings drawer",
       await page.evaluate(() => !document.getElementById("settings").classList.contains("hide")));
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll("#settings [data-set]")].map(b => ({
        k: b.getAttribute("data-set"), label: b.textContent,
        h: Math.round(b.getBoundingClientRect().height) })));
    // Name them rather than count them. A count assertion goes red when a
    // setting is ADDED, which is the one change that is never a regression, and
    // stays green if a setting is renamed out from under it.
    const keys = rows.map(r => r.k);
    for (const want of ["sound","haptics","hand","motion"])
      ok(`it has a "${want}" setting`, keys.indexOf(want) >= 0, JSON.stringify(keys));
    ok("every switch meets the touch minimum", rows.every(r => r.h >= MIN_TOUCH),
       JSON.stringify(rows.map(r => r.h)));

    // The one that a landscape phone found. A fourth setting pushed the panel to
    // 427px inside a 390px viewport and put "Back to the site" entirely below the
    // fold. The container scrolled, so it was technically reachable, but the only
    // exit from the menu had no affordance. Hit tested rather than clicked,
    // because el.click() finds an off screen button perfectly happily.
    const reach = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("#settings button")) {
        const r = el.getBoundingClientRect();
        const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        out.push({ id: el.id || el.getAttribute("data-set"),
                   onScreen: cy >= 0 && cy <= innerHeight && cx >= 0 && cx <= innerWidth,
                   hits: !!hit && (hit === el || el.contains(hit)) });
      }
      return out;
    });
    ok("every settings control is inside the viewport without scrolling",
       reach.every(r => r.onScreen),
       JSON.stringify(reach.filter(r => !r.onScreen).map(r => r.id)));
    ok("and the way out answers a real tap where it is drawn",
       reach.every(r => r.hits),
       JSON.stringify(reach.filter(r => !r.hits).map(r => r.id)));

    // A short wide phone has room across that it does not have down. If the rows
    // have to scroll there, the two column layout has stopped applying and a
    // setting has gone below the fold again.
    const fold = await page.evaluate(() => {
      const b = document.getElementById("setbody");
      return { wide: matchMedia("(min-width:640px) and (max-height:480px)").matches,
               scrolls: b.scrollHeight > b.clientHeight + 1,
               cols: getComputedStyle(b).gridTemplateColumns };
    });
    if (fold.wide)
      ok("in landscape every setting fits without scrolling, in two columns",
         !fold.scrolls && fold.cols.split(" ").length === 2,
         `scrolls ${fold.scrolls}, columns "${fold.cols}"`);
    else
      ok("in portrait the rows are one column", fold.cols.split(" ").length === 1,
         `columns "${fold.cols}"`);
    const hand = await page.evaluate(() => {
      const b = [...document.querySelectorAll("#settings [data-set]")]
        .find(x => x.getAttribute("data-set") === "hand");
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await page.mouse.click(hand.x, hand.y);
    await settle(250);
    ok("switching to left handed actually moves the controls",
       (await page.evaluate(() => CONDUIT.btns.find(b => b.id === "flow").x)) < before,
       "flow x stayed at " + before);
    ok("and the choice is written down",
       await page.evaluate(() => {
         try { return (JSON.parse(localStorage.getItem("conduit.settings")) || {}).hand === "left"; }
         catch (e) { return false; } }));
    await page.mouse.click(hand.x, hand.y);          // put it back
    await settle(200);
    const close = await page.evaluate(() => {
      const r = document.getElementById("setclose").getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await page.mouse.click(close.x, close.y);
    await settle(250);
    ok("closing it returns you to the site",
       await page.evaluate(() => document.getElementById("settings").classList.contains("hide")));
  }

  ok("no page errors during the whole probe", errs.length === 0, errs.slice(0, 2).join(" | "));
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
