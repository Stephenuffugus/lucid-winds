// TANGENT UI probe — the checks that only a real layout engine can answer.
// smoke.js runs the simulation headless with a stubbed DOM, so it can say
// nothing about rendered sizes or clipped text. This drives a real browser.
//
//   node test/ui.js            checks 375x667 and 320x568
//   node test/ui.js --size 60  raise the touch floor, to watch the gate fail
//
// House laws enforced here:
//   - interactive controls are at least 48 CSS px as RENDERED, at 375 width
//   - no dash characters in player-facing copy
//   - nothing the player must read is clipped by its own box
const puppeteer = require("/workspaces/lucid-winds/node_modules/puppeteer");
const path = require("path");
const http = require("http");
const fs = require("fs");

const argSize = process.argv.indexOf("--size");
const MIN = argSize > 0 ? Number(process.argv[argSize + 1]) : 48;
// TANGENT_HTML points the probe at a mutated scratch copy, so these checks can
// be proven able to fail without ever writing to the real game file.
const FILE = process.env.TANGENT_HTML || path.join(__dirname, "..", "index.html");
const ROOT = path.join(__dirname, "..");
// Served over http rather than opened from file://. The game ships on a web
// host, and file:// hides protocol dependent behaviour: a manifest cannot even
// load there, so a probe on file:// could not have tested one.
const server = http.createServer((req, res) => {
  const p = req.url.split("?")[0];
  if(p === "/" || p === "/index.html"){
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(fs.readFileSync(FILE));
  }
  const f = path.join(ROOT, p.replace(/^\//, ""));
  if(f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()){
    res.writeHead(200, { "Content-Type": f.endsWith(".json") ? "application/manifest+json" : "application/octet-stream" });
    return res.end(fs.readFileSync(f));
  }
  res.writeHead(404); res.end();
});
let URL = "";
const VIEWPORTS = [{ w: 375, h: 667 }, { w: 320, h: 568 }];

let pass = 0, fail = 0;
const ok = (n, c, extra) => c ? (pass++, console.log("  ok   " + n))
  : (fail++, console.log("  FAIL " + n + (extra ? "  -> " + extra : "")));

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  URL = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  for(const vp of VIEWPORTS){
    console.log(`\n[${vp.w}x${vp.h}]`);
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    page.on("console", m => { if(m.type() === "error") errors.push(m.text()); });
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: true, hasTouch: true });
    await page.goto(URL);
    await new Promise(r => setTimeout(r, 700));

    // build phase, then spin phase, so both control strips get measured
    for(const phase of ["build", "spin"]){
      if(phase === "spin") { await page.evaluate(() => startSpin()); await new Promise(r => setTimeout(r, 400)); }
      const found = await page.evaluate(() => {
        const vis = el => { const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; };
        const ctrls = [...document.querySelectorAll("button, .tool")].filter(vis).map(el => {
          const r = el.getBoundingClientRect();
          return { name: (el.id || el.className.split(" ")[0]) + " " + (el.textContent || "").trim().slice(0, 16).replace(/\s+/g, " "),
                   w: +r.width.toFixed(1), h: +r.height.toFixed(1),
                   right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1) };
        });
        const clipped = [...document.querySelectorAll(".tool b, .tool span, .chip")]
          .filter(e => vis(e) && e.scrollWidth > e.clientWidth + 0.5)
          .map(e => e.textContent.trim());
        // every string the player can actually read right now
        const copy = [...document.querySelectorAll("#top, #bottom, .card")]
          .filter(vis).map(e => e.innerText).join("\n");
        return { ctrls, clipped, copy, vw: window.innerWidth };
      });

      for(const c of found.ctrls)
        ok(`${phase}: target ${c.w}x${c.h} ${c.name}`,
           c.w >= MIN && c.h >= MIN, `needs ${MIN}px`);
      ok(`${phase}: nothing overflows its own box`,
         found.clipped.length === 0, found.clipped.join(" | "));
      ok(`${phase}: no control runs off the right edge`,
         found.ctrls.every(c => c.right <= found.vw + 0.5),
         found.ctrls.filter(c => c.right > found.vw + 0.5).map(c => c.name).join(" | "));
      // A dash BETWEEN words is punctuation and banned; inside-a-word hyphens
      // (ui-sans-serif) never reach the player, so only spaced forms count.
      const dashes = (found.copy.match(/—|–|\s-\s/g) || []);
      ok(`${phase}: no dashes in player copy`, dashes.length === 0,
         dashes.length ? JSON.stringify(found.copy.slice(0, 200)) : "");
    }
    ok("no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // Installable when served. The link is attached at runtime rather than in
  // the markup, because a manifest cannot load over file:// and this game is
  // meant to open that way too, so this asserts the served case explicitly.
  {
    console.log("\n[manifest]");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true });
    await page.goto(URL);
    await new Promise(r => setTimeout(r, 500));
    const href = await page.evaluate(() => {
      const l = document.querySelector("link[rel=manifest]");
      return l ? l.getAttribute("href") : null;
    });
    ok("a manifest is attached when the game is served", href === "manifest.json", "href=" + href);
    const m = await page.evaluate(async h => {
      try { const r = await fetch(h); if(!r.ok) return { err: "status " + r.status };
            return await r.json(); }
      catch(e){ return { err: String(e) }; }
    }, href || "manifest.json");
    ok("it parses and is standalone", m.display === "standalone", m.err || ("display=" + m.display));
    ok("it carries its own icon, so there is no extra file to lose",
       !!(m.icons && m.icons[0] && m.icons[0].src.startsWith("data:image/png")),
       JSON.stringify((m.icons || [])[0] || {}).slice(0, 60));
    await page.close();
  }

  // Controls must be reachable, not merely present. A control can be the right
  // size and still be covered by an overlay, so ask the document what is
  // actually on top at the control's own centre. Never el.click().
  {
    console.log("\n[reachability at 375x667]");
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(URL);
    await new Promise(r => setTimeout(r, 700));
    const topAt = id => page.evaluate(i => {
      const el = document.getElementById(i);
      if(!el) return "missing";
      const r = el.getBoundingClientRect();
      if(r.width < 1 || r.height < 1) return "zero size";
      const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if(!t) return "nothing";
      return (t === el || el.contains(t) || t.contains(el)) ? "ok"
           : "covered by " + (t.id || t.className || t.tagName);
    }, id);
    for(const id of ["spinbtn", "clearbtn"]){
      const r = await topAt(id); ok(`build control ${id} is on top at its centre`, r === "ok", r);
    }
    await page.evaluate(() => startSpin());
    await new Promise(r => setTimeout(r, 300));
    for(const id of ["throttle", "release"]){
      const r = await topAt(id); ok(`spin control ${id} is on top at its centre`, r === "ok", r);
    }
    await page.evaluate(() => doRelease("probe"));
    await new Promise(r => setTimeout(r, 300));
    {
      const r = await topAt("abortbtn");
      ok("flight control abortbtn is on top at its centre", r === "ok", r);
    }

    // Two separate things, and only one of them is ours.
    // 1. Does hiding the tab set the flag? That is the listener, and a real tab
    //    switch is the only honest way to ask.
    await page.evaluate(() => { loadLevel(0); startSpin(); holding = true; });
    await new Promise(r => setTimeout(r, 300));
    const other = await browser.newPage();
    await other.bringToFront();
    await new Promise(r => setTimeout(r, 500));
    const flag = await page.evaluate(() => paused);
    ok("hiding the tab sets the paused flag", flag === true, "paused=" + flag);
    await other.close();
    await page.bringToFront();
    await new Promise(r => setTimeout(r, 300));
    ok("showing the tab clears the paused flag",
       (await page.evaluate(() => paused)) === false);

    // 2. Does the flag actually stop the simulation? Measuring this by hiding
    //    the tab proves nothing, because a hidden tab stops getting animation
    //    frames anyway: the check passed even against a build with the guard
    //    removed. So drive the loop by hand with the tab visible, which tests
    //    our guard rather than the browser's frame policy.
    const g = await page.evaluate(() => {
      loadLevel(0); startSpin(); holding = true;
      const base = performance.now();
      paused = false; last = 0;
      for(let i = 0; i < 30; i++) frame(base + i * 16);
      const ran = runT;
      paused = true;
      for(let i = 0; i < 30; i++) frame(base + 500 + i * 16);
      const held = runT;
      paused = false; last = 0;
      for(let i = 0; i < 30; i++) frame(base + 1500 + i * 16);
      return { ran: ran, held: held, resumed: runT };
    });
    ok("the loop advances the run clock when not paused", g.ran > 0.1, `ran=${g.ran.toFixed(3)}`);
    ok("the paused guard freezes the simulation", g.held === g.ran,
       `ran=${g.ran.toFixed(3)} held=${g.held.toFixed(3)}`);
    ok("clearing the guard resumes the simulation", g.resumed > g.held + 0.1,
       `held=${g.held.toFixed(3)} resumed=${g.resumed.toFixed(3)}`);
    await page.close();
  }
  // Audio has never been heard by anyone, and no test had ever constructed the
  // graph. A context can be created and still be suspended, which is silence
  // with every voice wired correctly, so the state is checked after a real
  // touch and each voice is counted by instrumenting the API before load.
  {
    console.log("\n[audio]");
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      window.__osc = 0; window.__buf = 0;
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      const co = AC.prototype.createOscillator, cb = AC.prototype.createBufferSource;
      AC.prototype.createOscillator = function(){ window.__osc++; return co.apply(this, arguments); };
      AC.prototype.createBufferSource = function(){ window.__buf++; return cb.apply(this, arguments); };
      // keep the instance so the test can put it into the state a phone puts
      // it into, which this browser will not do on its own
      window.__ctxs = [];
      const Wrapped = function(...a){ const c = new AC(...a); window.__ctxs.push(c); return c; };
      Wrapped.prototype = AC.prototype;
      window.AudioContext = Wrapped;
    });
    await page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true });
    await page.goto(URL);
    await new Promise(r => setTimeout(r, 600));
    ok("no audio context before the player touches anything",
       (await page.evaluate(() => sfx.state)) === "none");

    await page.tap("#spinbtn");                       // a real gesture
    await new Promise(r => setTimeout(r, 500));
    const st = await page.evaluate(() => sfx.state);
    ok("a real touch leaves the audio context running, not suspended",
       st === "running", "state=" + st);

    // The failure this guards is a phone one: a context that exists but is
    // suspended is silence with every voice wired correctly, and this browser
    // will not suspend on its own, so put it in that state deliberately. With
    // no resume anywhere, it stays suspended and the game is silent for good.
    const susp = await page.evaluate(async () => {
      if(!window.__ctxs || !window.__ctxs.length) return "no context captured";
      await window.__ctxs[0].suspend();
      return sfx.state;
    });
    ok("a suspended context is a state this test can actually reach",
       susp === "suspended", "state=" + susp);
    await page.tap("#cv");                             // any later gesture
    await new Promise(r => setTimeout(r, 400));
    const back = await page.evaluate(() => sfx.state);
    ok("a later touch recovers a context the browser suspended",
       back === "running", "state=" + back);
    const built = await page.evaluate(() => ({ o: window.__osc, b: window.__buf }));
    ok("the continuous voices are actually built", built.o >= 1 && built.b >= 1,
       JSON.stringify(built));

    // the two voices that existed and had never once been triggered
    const before = await page.evaluate(() => window.__osc);
    await page.evaluate(() => { backToBuild(); });
    await new Promise(r => setTimeout(r, 200));
    await page.tap(".tool:nth-child(2)");
    await new Promise(r => setTimeout(r, 200));
    ok("selecting a tool makes a sound (the click voice was dead)",
       (await page.evaluate(() => window.__osc)) > before);

    const beforeNear = await page.evaluate(() => window.__osc);
    await page.evaluate(() => new Promise(res => {
      loadLevel(0); startSpin(); holding = true;
      let n = 0;
      const w = () => { n++;
        if(phase === "spin" && n > 90) doRelease("audio");
        if(phase === "done" || n > 1200) return res();
        requestAnimationFrame(w); };
      requestAnimationFrame(w);
    }));
    ok("closing on the target makes a sound (the proximity voice was dead)",
       (await page.evaluate(() => window.__osc)) > beforeNear + 2,
       `osc ${beforeNear} -> ${await page.evaluate(() => window.__osc)}`);
    await page.close();
  }
  console.log("\n[entry bearing]");
  {
    // The far side is never predicted (D2) and must not be. D8 fixes the one
    // thing that IS knowable about it: the ball comes back out on the horizon
    // ring, at the bearing it went in, heading outward. That point is marked on
    // the ring, and because the aiming camera is on the deck it is also what
    // the edge marker anchors to.
    //
    // This reads what the frame actually paints, and it is here because the
    // first version of the marker was correct and invisible: the shot marker
    // is coded to step aside when its label collides with another, and on
    // Inside out the Maw and Lior markers take the same edge, so it was
    // dropped on every single frame.
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true });
    await page.goto(URL, { waitUntil: "load" });
    await new Promise(r => setTimeout(r, 700));
    const r = await page.evaluate(() => new Promise(res => {
      loadLevel(5); startSpin(); holding = true;
      let n = 0, base = performance.now();
      const w = () => {
        n++; frame(base + n * 16);
        const pr = cachedPredict();
        if(pr && pr.outcome === "invert" && n > 60){
          const el = document.getElementById("cv"), c = el.getContext("2d");
          // capture what is written on the frame, and how much of it is lit
          const seen = [];
          const realFT = c.fillText.bind(c);
          c.fillText = function(t, x, y){ seen.push([String(t), Math.round(x), Math.round(y)]); return realFT(t, x, y); };
          const lit = (x, y) => {                       // bright pixels in a box
            const R = 20, X = Math.round(x) - R, Y = Math.round(y) - R;
            if(X < 0 || Y < 0 || X + 2 * R > el.width || Y + 2 * R > el.height) return -1;
            const d = c.getImageData(X, Y, 2 * R, 2 * R).data;
            let k = 0;
            for(let i = 0; i < d.length; i += 4)
              if(d[i + 2] > 200 && d[i] > 120 && d[i + 2] > d[i] && d[i] > d[i + 1]) k++;
            return k;
          };
          const real = entryBearing;
          draw();
          const onLabels = seen.splice(0);
          const mark = onLabels.filter(l => l[0] === "comes back out")[0] || null;
          const onLit = mark ? lit(mark[1], mark[2]) : -1;
          entryBearing = () => null;                    // the bearing switched off
          draw();
          const offLabels = seen.splice(0);
          const offLit = mark ? lit(mark[1], mark[2]) : -1;
          entryBearing = real;
          c.fillText = realFT;
          const E = real(pr.path[pr.path.length - 1]);
          const sc = camScale(), o = camOrigin();
          return res({ found: true, mark: mark, onLit: onLit, offLit: offLit,
                       offHas: offLabels.some(l => l[0] === "comes back out"),
                       onLabels: onLabels.map(l => l[0]),
                       ring: [Math.round(o[0] + E.x * sc), Math.round(o[1] + E.y * sc)],
                       W: innerWidth, H: innerHeight });
        }
        if(n > 900) return res({ found: false, n: n });
        requestAnimationFrame(w);
      };
      requestAnimationFrame(w);
    }));
    ok("holding on Inside out reaches a shot the readout calls a fall", r.found,
       JSON.stringify(r));
    if(r.found){
      ok("the frame tells the player where the ball comes back out",
         !!r.mark, "labels drawn: " + JSON.stringify(r.onLabels));
      ok("switching the bearing off takes that marker away, so it is really the thing being drawn",
         !!r.mark && r.offHas === false);
      ok(`the marker is painted, not merely requested (${r.onLit} lit, ${r.offLit} without it)`,
         r.onLit > 10 && r.onLit > r.offLit, `on=${r.onLit} off=${r.offLit}`);
      ok("the horizon point itself is off the aiming frame, which is why the edge has to carry it",
         r.ring[1] < 0 || r.ring[1] > r.H || r.ring[0] < 0 || r.ring[0] > r.W,
         `${r.ring[0]},${r.ring[1]} in ${r.W}x${r.H}`);
    }
    // The edge marker only fires while the point is OFF the frame; the mark on
    // the ring itself covers the other half, and on the shipped systems the
    // aiming camera never has a horizon in shot, so it would otherwise be
    // painted and never seen. Pull the camera out by hand and look at it.
    {
      const wide = await page.evaluate(() => {
        const el = document.getElementById("cv"), c = el.getContext("2d");
        const lit = (x, y) => {
          const R = 14, X = Math.round(x) - R, Y = Math.round(y) - R;
          if(X < 0 || Y < 0 || X + 2 * R > el.width || Y + 2 * R > el.height) return -1;
          const d = c.getImageData(X, Y, 2 * R, 2 * R).data;
          let k = 0;
          for(let i = 0; i < d.length; i += 4)
            if(d[i + 2] > 200 && d[i] > 120 && d[i + 2] > d[i] && d[i] > d[i + 1]) k++;
          return k;
        };
        camS = 0.5; camC = [0, -280]; camReady = true;      // frame the hole
        const pr = cachedPredict();
        const E = entryBearing(pr.path[pr.path.length - 1]);
        const sc = camScale(), o = camOrigin();
        const x = o[0] + E.x * sc, y = o[1] + E.y * sc;
        const real = entryBearing;
        draw(); const on = lit(x, y);
        entryBearing = () => null;
        draw(); const off = lit(x, y);
        entryBearing = real;
        return { x: Math.round(x), y: Math.round(y), on: on, off: off, W: innerWidth, H: innerHeight };
      });
      ok("with the horizon in shot the mark is on the ring itself",
         wide.on > 6 && wide.on > wide.off + 4,
         `at ${wide.x},${wide.y} lit ${wide.on} with, ${wide.off} without`);
    }
    await page.close();
  }

  await browser.close();
  server.close();
  console.log(`\n${pass} passed, ${fail} failed  (touch floor ${MIN}px)`);
  process.exit(fail ? 1 : 0);
})();
