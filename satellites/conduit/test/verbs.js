// CONDUIT prowl verbs, demonstrated in a browser.
//
// HANDOFF-CONDUIT C4 gate: "each verb demonstrated in a logged playtest". The
// smoke suite proves the rules; this proves a thumb can reach them. Every verb
// is fired by a real touch on the action button at its drawn centre, after
// checking with elementFromPoint that nothing is over it, and the label is read
// off the button first so what a player sees is what gets tested.
//
//   node test/verbs.js [width] [height]
const path = require("path");
const { open, driver, settle } = require("./drive");

const VW = Number(process.argv[2]) || 844;
const VH = Number(process.argv[3]) || 390;
const SHOTS = path.join(__dirname, "..", "docs", "shots");

let failed = 0;
const must = (n, c, e = "") => { if (c) console.log("  ok   " + n);
  else { failed++; console.log("  FAIL " + n + (e ? "  → " + e : "")); } };
const log = (...a) => console.log("  " + a.join(" "));

(async () => {
  const { browser, page, errs } = await open(VW, VH);
  const d = driver(page, VW, VH);
  await d.start();
  console.log(`\nCONDUIT prowl verbs at ${VW}x${VH}, every one by real touch\n`);

  // Fire the action button, having first read what it says it will do.
  const act = async () => {
    const b = await page.evaluate(() => {
      const x = CONDUIT.btns.find(q => q.id === "act");
      const el = document.elementFromPoint(x.x + x.w / 2, x.y + x.h / 2);
      return { x: x.x + x.w / 2, y: x.y + x.h / 2, label: x.label,
               el: el ? el.tagName + (el.id ? "#" + el.id : "") : "none" };
    });
    if (b.el !== "CANVAS#c") { must("the action button is reachable", false, b.el); return b; }
    await page.touchscreen.tap(b.x, b.y);
    await settle(250);
    return b;
  };
  // Always let a frame draw after moving the world: the button's label is
  // written during drawHUD, so reading it immediately after a teleport reads the
  // label from before it. The tap itself re-evaluates and does the right thing,
  // which is exactly the kind of gap that makes a test lie about the UI.
  const place = async (js) => { await page.evaluate(js); await settle(150); };

  // ── smother ────────────────────────────────────────────────────────────────
  // Pin him where he stands and unaware. He patrols at 2.5 tiles a second, so
  // without this he walks out of arm's reach between the setup and the tap and
  // the button correctly offers a tap instead.
  await place(() => { const e = CONDUIT.S.enemies[0], b = CONDUIT.blobRef();
    e.route = [[e.x|0, e.y|0]]; e.path = null; e.spot = 0; e.state = "patrol";
    b.x = e.x + 0.4; b.y = e.y; });
  let b1 = await act();
  must("SMOTHER is offered beside an unaware guard", b1.label === "SMOTHER", b1.label);
  must("and the hold starts",
       (await page.evaluate(() => CONDUIT.S.act.verb)) === "envelop" ||
       (await d.read()).dead >= 1);
  await settle(2600);
  must("and it takes him down", (await d.read()).dead >= 1);

  // ── drag a body ────────────────────────────────────────────────────────────
  // Step off it first. Standing on a body harvests it in about a second, so if
  // you want to CARRY one you have to move before you absorb it, which is a real
  // choice the player makes and a real thing this test has to respect.
  await place(() => { const bd = CONDUIT.S.bodies[0], b = CONDUIT.blobRef();
    b.x = bd.x + 1.15; b.y = bd.y; });
  const before = await page.evaluate(() => {
    const bd = CONDUIT.S.bodies[0]; return bd ? { x: bd.x, y: bd.y } : null; });
  must("the smothered guard left a body to carry", !!before);
  let b2 = await act();
  must("DRAG BODY is offered standing over a corpse", b2.label === "DRAG BODY", b2.label);
  await d.walkTo(14, 6, 12000);
  const moved = await page.evaluate(() => {
    const bd = CONDUIT.S.bodies[0]; return bd ? { x: bd.x, y: bd.y } : null; });
  must("the body came with you", !!moved &&
       Math.hypot(moved.x - before.x, moved.y - before.y) > 1.5,
       moved ? `${before.x.toFixed(1)},${before.y.toFixed(1)} to ${moved.x.toFixed(1)},${moved.y.toFixed(1)}` : "body gone");
  must("carrying it, FLOW is refused", (await page.evaluate(() => CONDUIT.canFlow())) === false);
  await page.screenshot({ path: path.join(SHOTS, "verbs-drag.png") });
  let b3 = await act();
  must("DROP BODY puts it down", b3.label === "DROP BODY", b3.label);

  // ── drink a light ──────────────────────────────────────────────────────────
  await place(() => { const L = CONDUIT.S.lights.find(l => !l.out), b = CONDUIT.blobRef();
    b.x = L.x + 0.5; b.y = L.y + 0.5; });
  const lit = (await d.read()) && await page.evaluate(() => CONDUIT.S.lights.filter(l => l.out).length);
  let b4 = await act();
  must("DRINK LIGHT is offered standing in a pool", b4.label === "DRINK LIGHT", b4.label);
  must("and the pool goes out",
       (await page.evaluate(() => CONDUIT.S.lights.filter(l => l.out).length)) > lit);

  // ── cling ──────────────────────────────────────────────────────────────────
  await place(() => { const b = CONDUIT.blobRef(); b.x = 3.5; b.y = 20.5;
    CONDUIT.S.bodies.length = 0; });
  let b5 = await act();
  must("CLING is offered beside a wall", b5.label === "CLING", b5.label);
  must("and you go up it", (await page.evaluate(() => CONDUIT.S.player.clinging)) === true);
  must("from up there FLOW is refused", (await page.evaluate(() => CONDUIT.canFlow())) === false);
  await page.screenshot({ path: path.join(SHOTS, "verbs-cling.png") });
  let b6 = await act();
  must("DROP DOWN comes back to the floor", b6.label === "DROP DOWN", b6.label);
  must("and you land on floor, not inside a wall",
       (await page.evaluate(() => { const b = CONDUIT.blobRef();
         return CONDUIT.TTat(b.x|0, b.y|0) !== CONDUIT.tiles.WALL; })) === true);

  // ── peek, which is a HOLD on the reclaim slot while prowling ───────────────
  {
    const pk = await page.evaluate(() => {
      const x = CONDUIT.btns.find(q => q.id === "reclaim");
      return { x: x.x + x.w / 2, y: x.y + x.h / 2, label: x.label }; });
    must("the reclaim slot offers PEEK while prowling", pk.label === "PEEK", pk.label);
    const m0 = (await d.read()).mass;
    await page.touchscreen.touchStart(pk.x, pk.y);
    await settle(1300);
    const held = await page.evaluate(() => ({ peeking: CONDUIT.S.player.peeking,
                                              r: CONDUIT.S.player.peekR,
                                              m: CONDUIT.blobRef().mass }));
    await page.screenshot({ path: path.join(SHOTS, "verbs-peek.png") });
    await page.touchscreen.touchEnd();
    await settle(200);
    must("holding it extends the tendril", held.peeking === true && held.r > 0.5, "r=" + held.r);
    must("and it costs mass for as long as it is held", held.m < m0 - 0.5,
         `${m0.toFixed(2)} to ${held.m.toFixed(2)}`);
    must("letting go ends it",
         (await page.evaluate(() => CONDUIT.S.player.peeking)) === false);
  }

  // ── pool ───────────────────────────────────────────────────────────────────
  await settle(1900);
  must("standing still long enough flattens you",
       (await page.evaluate(() => CONDUIT.isPooled())) === true);

  // ── push the cart ──────────────────────────────────────────────────────────
  await place(() => { const c = CONDUIT.S.sources.find(s => s.id === "cart-1");
    const b = CONDUIT.blobRef(); b.x = c.x + 1.2; b.y = c.y + 0.5; });
  const cart0 = await page.evaluate(() => { const c = CONDUIT.S.sources.find(s => s.id === "cart-1");
    return { x: c.x, y: c.y }; });
  let b7 = await act();
  must("PUSH CART is offered beside it", b7.label === "PUSH CART", b7.label);
  await d.walkTo(cart0.x + 4, cart0.y, 15000);
  const cart1 = await page.evaluate(() => { const c = CONDUIT.S.sources.find(s => s.id === "cart-1");
    return { x: c.x, y: c.y }; });
  must("the cart moved with you", cart1.x !== cart0.x || cart1.y !== cart0.y,
       `${cart0.x},${cart0.y} to ${cart1.x},${cart1.y}`);
  await page.screenshot({ path: path.join(SHOTS, "verbs-cart.png") });

  const st = await d.read();
  log(`ended at mass ${st.mass.toFixed(1)}, alert ${st.alert}, leak ${st.leak}`);
  must("no mass leaked across every verb", !(st.leak > 1e-6), "leak=" + st.leak);
  must("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await browser.close();
  console.log(failed ? `\n${failed} FAILED\n` : "\nevery verb demonstrated\n");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
