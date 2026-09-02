/* Blooming Words: dismiss the intro, then grow every target word of the current garden.
   A word game cannot be lost, so the only round end is the level clear (#levelScrim),
   which is where completeLevel and the midroll sit. The words are READ from the level
   table (the same words a player sees printed on the board once solved) and ENTERED
   through the keyboard the game documents: a key cannot mis-tap, and the solve still
   runs through the game's own submit path, never through the hooked function. */
export const meta = { name: "Blooming Words", hook: "completeLevel", ends: "garden grown, #levelScrim" };

export async function play(page, h) {
  if (await vis(page, "#introScrim")) { await h.tapSel("#introBtn"); await h.wait(700); }
  const words = await page.evaluate(() => {
    const L = LEVELS[game.current], p = game.prog[game.current];
    return L.targets.filter(w => !(p && p.solved && p.solved.has(w)));
  });
  for (const w of words) {
    if (await vis(page, "#levelScrim")) return;
    await page.keyboard.type(w, { delay: 90 });
    await h.wait(150);
    await page.keyboard.press("Enter");
    await h.wait(900);
  }
  await h.wait(1200);
}

export async function isRoundOver(page) { return vis(page, "#levelScrim"); }

function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
