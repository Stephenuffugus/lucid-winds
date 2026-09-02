/* Petal Slice: Grove, then swipe. Every stroke is a real touch drag across the canvas,
   which is the whole game, and the run ends on #s-go when the misses run out. */
export const meta = { name: "Petal Slice", hook: "endRun", ends: "misses spent, #s-go" };
export async function play(page, h) {
  await h.tapSel("#b-grove");
  await h.wait(1400);
  for (let i = 0; i < 110; i++) {   /* the gm run timed out at 60 with the ad stack live */
    if (await vis(page, "#s-go")) return;
    /* a real slice, corner to corner, alternating direction */
    if (i % 2) await h.drag(40, 500, 335, 250, 10);
    else await h.drag(335, 500, 40, 250, 10);
    await h.wait(420);
  }
}
export async function isRoundOver(page) { return vis(page, "#s-go"); }
function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
