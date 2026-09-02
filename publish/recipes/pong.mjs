/* Pong Arena: Career, level one, then leave the paddle where it is. The opponent serves,
   scores, and the match report comes up on its own. */
export const meta = { name: "Pong Arena", hook: "showResult", ends: "match lost, result card" };
export async function play(page, h) {
  await h.tapText(/Career/i);
  await h.wait(1200);
  await h.tapText(/First Serve/i);   /* the gauntlet opens on a level list */
  await h.wait(1800);
  try { await h.tapText(/^(Play|Start|Begin|Serve|Go|Fight)$/i); } catch (e) {}
  for (let i = 0; i < 80; i++) {
    if (await isRoundOver(page)) return;
    await h.wait(900);
  }
}
export async function isRoundOver(page) {
  return page.evaluate(() => {
    const t = (document.body.innerText || "");
    return /match over|you lost|you win|final|result|rematch|next level|defeat|victory/i.test(t);
  });
}
