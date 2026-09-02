/* Dew Snip: Garden, level one, then snip. Every stroke is a real drag across the vines;
   the bead falls whether the stroke was clever or not, and #s-go is the level report. */
export const meta = { name: "Dew Snip", hook: "win", ends: "level report, #s-go" };
export async function play(page, h) {
  await h.tapSel("#b-garden");
  await h.wait(900);
  await h.tapText(/^1$/);      /* the garden opens on a level grid, take the first bed */
  await h.wait(1600);
  for (let i = 0; i < 50; i++) {
    if (await vis(page, "#s-go")) return;
    const y = 180 + (i % 7) * 55;
    await h.drag(30, y, 345, y + 30, 8);
    await h.wait(500);
  }
}
export async function isRoundOver(page) { return vis(page, "#s-go"); }
function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
