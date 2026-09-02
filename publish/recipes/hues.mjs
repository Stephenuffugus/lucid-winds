/* Hues: menu, Endless, then lock in whatever the pad is sitting on, five times. A guess
   that is nowhere near the target costs a life, Endless has three, and the run ends on
   #result ("Run over"), which is the screen a player meets. finish() runs on death as
   well as on a completed daily set, so the hook is not win-only in practice. */
export const meta = { name: "Hues", hook: "finish", ends: "out of lives, #result" };

export async function play(page, h) {
  await h.tapSel('[data-mode="endless"]');
  await h.wait(900);
  /* first run: the "How Hues works" sheet sits over the menu */
  if (await vis(page, "#rulesGo")) { await h.tapSel("#rulesGo"); await h.wait(900); }
  if (!(await vis(page, "#lockBtn"))) { await h.tapSel('[data-mode="endless"]'); await h.wait(900); }
  for (let i = 0; i < 40; i++) {
    if (await vis(page, "#result")) return;
    /* the round breakdown sheet sits between rounds; step through it */
    if (await vis(page, "#breakdown.show")) { await h.tapSel("#bdNext"); await h.wait(700); continue; }
    /* drag the hue pad to a corner so the guess is far from the target, then lock */
    const pad = await box(page, "#pad");
    if (pad) await h.drag(pad.x, pad.y, pad.left + 6, pad.top + 6, 8);
    if (await vis(page, "#lockBtn")) { await h.tapSel("#lockBtn"); }
    await h.wait(1500);
  }
}

export async function isRoundOver(page) { return vis(page, "#result"); }

function box(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect(); if (!r.width) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, top: r.top }; }, sel);
}
function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
