/* Bloom Breaker: menu, PLAY, launch the ball, then keep the paddle still and let the
   ball drain. Losing is the fastest honest round end in a brick breaker and it lands on
   the same #scr-over screen a player meets, which is where the midroll hooks. */
export const meta = { name: "Bloom Breaker", hook: "gameOver", ends: "loss on #scr-over" };

export async function play(page, h) {
  await h.tapSel("#btnPlay");
  await h.wait(600);
  /* a difficulty sheet may sit between the menu and the table */
  if (await visible(page, "#scr-diff")) { await h.tapText(/^(Casual|Easy|Normal|Medium)/i); await h.wait(600); }
  /* ⛔ do NOT launch once and assume it took. With the real network SDK in the page the
     preroll delays the first frame, and a single early tap left the table sitting on
     LAUNCH for the whole run: green offline, stuck online. Look for the launch
     affordance every pass instead. */
  for (let i = 0; i < 60; i++) {
    if (await visible(page, "#scr-over") || await visible(page, "#scr-win")) return;
    if (await hasText(page, /launch/i)) { await h.tapText(/^LAUNCH$/i); await h.wait(900); continue; }
    await h.tap(20, 600);          /* park the paddle and let every ball drain */
    await h.wait(700);
  }
}

export async function isRoundOver(page) {
  return (await visible(page, "#scr-over")) || (await visible(page, "#scr-win"));
}

function hasText(page, re) {
  return page.evaluate((s, f) => new RegExp(s, f).test(document.body.innerText || ""), re.source, re.flags.replace("g", ""));
}
function visible(page, sel) {
  return page.evaluate((s) => {
    const e = document.querySelector(s);
    if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05;
  }, sel);
}
