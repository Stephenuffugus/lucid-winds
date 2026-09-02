/* Nova Bloom: past the how to fly card, into the starfield, then fly nowhere. A twin
   stick shooter kills a pilot who does not move, and #s-over is where the run reports. */
export const meta = { name: "Nova Bloom", hook: "gameOver", ends: "shot down, #s-over" };
export async function play(page, h) {
  if (await vis(page, "#how-back")) { await h.tapSel("#how-back"); await h.wait(700); }
  await h.tapSel("#b-arena");   /* endless waves: the mode that ends when you are shot down */
  await h.wait(1800);
  for (let i = 0; i < 70; i++) {
    if (await vis(page, "#s-over")) return;
    await h.wait(900);
  }
}
export async function isRoundOver(page) { return vis(page, "#s-over"); }
function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
