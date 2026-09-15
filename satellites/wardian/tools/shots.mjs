/* The shots the plan asks for. Every one is taken from where the PLAYER stands:
   a 375x667 phone, the jar on screen, no debug camera.
   ⛔ a single shot filter must never skip the setup that makes the shot: the
   shutter is gated, the walk to the moment is not. */
import { serve, open, waitFrames, sleep } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../test/harness.mjs';

const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const OUT = join(ROOT, 'docs', 'shots');
const want = n => !only || n.indexOf(only) >= 0;

const s = await serve();
/* the player's own pixels: 375x667 at 1x keeps every shot under the 200 KB the
   plan allows for evidence, and it is what the thumb actually sees */
const { browser, page } = await open(s.base, { deviceScaleFactor: 1 });
/* Evidence has to stay under 200 KB (the plan's law). This art is flat, so
   trimming the low THREE bits off each channel costs nothing a reviewer can see
   and roughly halves the file. Four bits bands the room's gradient into rings,
   which is a fault in the evidence rather than in the game, so it is three. */
const LIMIT = 200 * 1024;
async function save(name, buf, pg) {
  pg = pg || page;
  let out = buf;
  if (out.length > LIMIT) {
    const b64 = await pg.evaluate(async (b) => {
      const im = new Image();
      await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + b; });
      const cv = document.createElement('canvas');
      cv.width = im.width; cv.height = im.height;
      const c = cv.getContext('2d');
      c.drawImage(im, 0, 0);
      const d = c.getImageData(0, 0, cv.width, cv.height);
      for (let i = 0; i < d.data.length; i++) {
        if (i % 4 === 3) continue;
        d.data[i] = d.data[i] & 0xF8;
      }
      c.putImageData(d, 0, 0);
      return cv.toDataURL('image/png').split(',')[1];
    }, out.toString('base64'));
    out = Buffer.from(b64, 'base64');
  }
  writeFileSync(join(OUT, name + '.png'), out);
  console.log('  ' + name + '.png  ' + (out.length / 1024).toFixed(0) + ' KB'
    + (out.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
}
const shot = async (name, el) => {
  const target = el ? await page.$(el) : page;
  await save(name, await target.screenshot({ type: 'png' }));
};

/* a jar with some age on it, so the shots are not two sprouts */
await page.evaluate(() => { WARDIAN_TEST.advance(1400); });
await waitFrames(page, 3);
await page.evaluate(() => { WARDIAN_TEST.setHour(11); });
await waitFrames(page, 3);
if (want('p1-jar-day')) await shot('p1-jar-day');

await page.evaluate(() => { WARDIAN_TEST.setHour(22); });
await waitFrames(page, 3);
if (want('p1-jar-night')) await shot('p1-jar-night');

/* the unfurl strip: six panels of ONE frond, ten ticks apart, in one image */
if (want('p1-unfurl')) {
  const panels = [];
  for (let i = 0; i < 6; i++) {
    await page.evaluate((c) => { WARDIAN_TEST.setHour(13); WARDIAN_TEST.setCurl(c); }, 1 - i * 0.2);
    await waitFrames(page, 2);
    panels.push(await page.screenshot({ type: 'png', encoding: 'base64' }));
  }
  const strip = await page.evaluate(async (panels) => {
    const imgs = await Promise.all(panels.map(b => new Promise(res => {
      const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + b;
    })));
    /* crop the frond, not the room: the top of the plants at 375 wide */
    const cw = 152, ch = 206, sx = 64, sy = 262, dpr = 1;
    const cv = document.createElement('canvas');
    cv.width = cw * 3; cv.height = ch * 2;
    const c = cv.getContext('2d');
    c.fillStyle = '#0d0a07'; c.fillRect(0, 0, cv.width, cv.height);
    imgs.forEach((im, i) => {
      const dx = (i % 3) * cw, dy = Math.floor(i / 3) * ch;
      c.drawImage(im, sx * dpr, sy * dpr, cw * dpr, ch * dpr, dx, dy, cw, ch);
      c.strokeStyle = 'rgba(201,162,75,.35)'; c.strokeRect(dx + .5, dy + .5, cw - 1, ch - 1);
      c.fillStyle = '#C9A24B'; c.font = '11px monospace';
      c.fillText('curl ' + (1 - i * 0.2).toFixed(1), dx + 9, dy + 17);
    });
    return cv.toDataURL('image/png').split(',')[1];
  }, panels);
  await save('p1-unfurl', Buffer.from(strip, 'base64'));
}

/* ---- P2 ---- */
const crop = async (name, base64, sx, sy, cw, ch, zoom, label, pg) => {
  pg = pg || page;
  const out = await pg.evaluate(async (b, sx, sy, cw, ch, zoom, label) => {
    const im = new Image();
    await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + b; });
    const cv = document.createElement('canvas');
    cv.width = im.width + cw * zoom + 12;
    cv.height = Math.max(im.height, ch * zoom);
    const c = cv.getContext('2d');
    c.fillStyle = '#0d0a07'; c.fillRect(0, 0, cv.width, cv.height);
    c.drawImage(im, 0, 0);
    c.imageSmoothingEnabled = false;
    c.drawImage(im, sx, sy, cw, ch, im.width + 12, 0, cw * zoom, ch * zoom);
    c.strokeStyle = '#C9A24B'; c.lineWidth = 1;
    c.strokeRect(sx + .5, sy + .5, cw, ch);
    c.strokeRect(im.width + 12.5, .5, cw * zoom - 1, ch * zoom - 1);
    c.fillStyle = '#C9A24B'; c.font = '12px monospace';
    c.fillText(label, im.width + 20, ch * zoom - 10);
    return cv.toDataURL('image/png').split(',')[1];
  }, base64, sx, sy, cw, ch, zoom, label);
  await save(name, Buffer.from(out, 'base64'), pg);
};

{
  await page.evaluate(() => { WARDIAN_TEST.setHour(15); });
  const at = await page.evaluate(() => {
    const i = WARDIAN_TEST.place('pillbug', 9);
    const a = WARDIAN_TEST.state().agents[i];
    a.rolled = 3000;
    return WARDIAN_TEST.toScreen(a.x * 10, WARDIAN_TEST.soilY(a.x * 10) - a.y * 8);
  });
  await waitFrames(page, 2);
  if (want('p2-pillbug')) {
    const shotB = await page.screenshot({ type: 'png', encoding: 'base64' });
    await crop('p2-pillbug', shotB, Math.round(at.x) - 26, Math.round(at.y) - 30, 52, 42, 3, 'rolled up');
  }
}

{
  await page.evaluate(() => {
    WARDIAN_TEST.setHour(23);
    const i = WARDIAN_TEST.place('glowbeetle', 16);
    WARDIAN_TEST.state().agents[i].asleep = 0;
  });
  await waitFrames(page, 3);
  if (want('p2-night-beetle')) {
    const shotB = await page.screenshot({ type: 'png', encoding: 'base64' });
    const at = await page.evaluate(() => {
      const g = WARDIAN_TEST.state();
      const a = g.agents[g.agents.length - 1];
      return WARDIAN_TEST.toScreen(a.x * 10, WARDIAN_TEST.soilY(a.x * 10) - a.y * 8);
    });
    await crop('p2-night-beetle', shotB, Math.round(at.x) - 30, Math.round(at.y) - 34, 60, 48, 2.8, 'the light on');
  }
}

await page.evaluate(() => { WARDIAN_TEST.setHour(11); WARDIAN_TEST.openJournal(); });
await sleep(250);
if (want('p2-journal')) await shot('p2-journal');
await page.evaluate(() => { WARDIAN_TEST.scrollJournal(560); });
await sleep(180);
if (want('p2-journal-notes')) await shot('p2-journal-notes');
await page.evaluate(() => { WARDIAN_TEST.openPouch(); });
await sleep(250);
if (want('p2-pouch')) await shot('p2-pouch');
await page.evaluate(() => { WARDIAN_TEST.closeScreens(); WARDIAN_TEST.setHour(11); });
await waitFrames(page, 2);

if (want('p3-photo')) {
  /* the photograph the player shares is 1080 by 1440; the EVIDENCE of it is
     half that, because the plan caps a shot at 200 KB */
  const b64 = await page.evaluate(async () => {
    const src = WARDIAN_TEST.photo();
    const cv = document.createElement('canvas');
    cv.width = src.width / 2; cv.height = src.height / 2;
    cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/png').split(',')[1];
  });
  await save('p3-photo', Buffer.from(b64, 'base64'));
}

{
  await page.evaluate(() => {
    WARDIAN_TEST.setHour(16);
    WARDIAN_TEST.state().weather = { kind: 'rain', temp: 11, rain: 6, wind: 12 };
    WARDIAN_TEST.settings().weather = 1;
  });
  await waitFrames(page, 3);
  if (want('p3-rain')) await shot('p3-rain');
  await page.evaluate(() => {
    WARDIAN_TEST.setHour(2);
    WARDIAN_TEST.state().weather = { kind: 'snow', temp: -4, rain: 1, wind: 6 };
  });
  await waitFrames(page, 3);
  if (want('p3-snow')) await shot('p3-snow');
  await page.evaluate(() => {
    WARDIAN_TEST.state().weather = null;
    WARDIAN_TEST.settings().weather = 0;
    WARDIAN_TEST.setHour(11);
  });
}

await browser.close();

/* ---- the same jar on three phones, day and night ---- */
if (want('p3-widths')) {
  for (const [w, h] of [[412, 915], [375, 667], [320, 568]]) {
    const b = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
    await b.page.evaluate(() => WARDIAN_TEST.advance(1400, 'twoDay'));
    for (const [hour, tag] of [[11, 'day'], [22, 'night']]) {
      await b.page.evaluate((hh) => WARDIAN_TEST.setHour(hh), hour);
      await b.page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const buf = await b.page.screenshot({ type: 'png' });
      const name = 'p3-' + w + '-' + tag;
      let out = buf;
      if (out.length > 200 * 1024) {
        const b64 = await b.page.evaluate(async (bb) => {
          const im = new Image();
          await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + bb; });
          const cv = document.createElement('canvas');
          cv.width = im.width; cv.height = im.height;
          const c = cv.getContext('2d');
          c.drawImage(im, 0, 0);
          const d = c.getImageData(0, 0, cv.width, cv.height);
          for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF8; }
          c.putImageData(d, 0, 0);
          return cv.toDataURL('image/png').split(',')[1];
        }, out.toString('base64'));
        out = Buffer.from(b64, 'base64');
      }
      writeFileSync(join(OUT, name + '.png'), out);
      console.log('  ' + name + '.png  ' + (out.length / 1024).toFixed(0) + ' KB');
    }
    await b.browser.close();
  }
}

/* ---- T2.9: the snail on the glass, the moth, the warm stone and the shell, day and night at 412x915 ---- */
if (want('p4')) {
  const b = await open(s.base, { width: 412, height: 915, deviceScaleFactor: 1 });
  const pg = b.page;
  await pg.evaluate(() => WARDIAN_TEST.advance(1400, 'twoDay'));
  await pg.evaluate(() => {
    const g = WARDIAN_TEST.state();
    g.nights = Math.max(g.nights, 7); g.seen.pillbug = g.seen.pillbug || 1;
    WARDIAN_TEST.take('warmstone'); WARDIAN_TEST.take('shell');
    WARDIAN_TEST.setHour(8);
    WARDIAN_TEST.place('snail', 5, 0);
    WARDIAN_TEST.place('moth', 15, 4);
    if (!g.agents.some(a => a.sp === 'pillbug')) WARDIAN_TEST.place('pillbug', 9);
    if (!g.agents.some(a => a.sp === 'glowbeetle')) WARDIAN_TEST.place('glowbeetle', 17);
    WARDIAN_TEST.mist();
    WARDIAN_TEST.advance(30);
  });
  await waitFrames(pg, 3);
  const shoot = async (name) => { await save(name, await pg.screenshot({ type: 'png' }), pg); };
  const where = () => pg.evaluate(() => {
    const g = WARDIAN_TEST.state(), one = {};
    for (const a of g.agents) if (!one[a.sp]) one[a.sp] = a;
    const S = (x, y) => WARDIAN_TEST.toScreen(x, y);
    const at = a => a ? S(a.x * 10, WARDIAN_TEST.soilY(a.x * 10) - a.y * 8) : null;
    const shell = g.props.find(p => p.kind === 'shell'), stone = g.props.find(p => p.warm);
    return { snail: at(one.snail), mothLid: one.moth ? S(one.moth.x * 10, 3) : null, moth: at(one.moth),
      shell: shell ? S(shell.x, WARDIAN_TEST.soilY(shell.x)) : null,
      stone: stone ? S(stone.x, WARDIAN_TEST.soilY(stone.x)) : null,
      hid: one.pillbug ? one.pillbug.hid : null, snailY: one.snail ? one.snail.y : null,
      trail: one.snail && one.snail.trail ? one.snail.trail.length : 0, hum: g.humidity, phase: g.env.phase };
  });
  let w = await where();
  console.log('  day: ' + JSON.stringify({ phase: w.phase, hum: w.hum, hid: w.hid, snailY: w.snailY, trail: w.trail }));
  if (want('p4-412-day')) await shoot('p4-412-day');
  const b64d = await pg.screenshot({ type: 'png', encoding: 'base64' });
  if (want('p4-snail') && w.snail) await crop('p4-snail', b64d, Math.round(w.snail.x) - 40, Math.round(w.snail.y) - 60, 80, 90, 3, 'up the glass', pg);
  if (want('p4-moth-lid') && w.mothLid) await crop('p4-moth-lid', b64d, Math.round(w.mothLid.x) - 30, Math.round(w.mothLid.y) - 20, 60, 44, 3, 'under the lid', pg);
  if (want('p4-shell-day') && w.shell) await crop('p4-shell-day', b64d, Math.round(w.shell.x) - 30, Math.round(w.shell.y) - 30, 60, 44, 3, 'she is under it', pg);

  /* the stone at dusk, an hour after the light goes, while its warmth is most of what it keeps; by the time the
     moth is up (the dark proper) the first night shot could barely find it */
  await pg.evaluate(() => { WARDIAN_TEST.setHour(19); });
  await waitFrames(pg, 3);
  w = await where();
  const b64k = await pg.screenshot({ type: 'png', encoding: 'base64' });
  if (want('p4-stone-dusk') && w.stone) await crop('p4-stone-dusk', b64k, Math.round(w.stone.x) - 36, Math.round(w.stone.y) - 34, 72, 50, 3, 'still warm', pg);
  await pg.evaluate(() => { WARDIAN_TEST.advance(9); });
  await waitFrames(pg, 3);
  w = await where();
  console.log('  night: ' + JSON.stringify({ phase: w.phase, hum: w.hum, hid: w.hid, snailY: w.snailY, trail: w.trail }));
  if (want('p4-412-night')) await shoot('p4-412-night');
  const b64n = await pg.screenshot({ type: 'png', encoding: 'base64' });
  if (want('p4-moth-night') && w.moth) await crop('p4-moth-night', b64n, Math.round(w.moth.x) - 36, Math.round(w.moth.y) - 36, 72, 56, 3, 'at the light', pg);

  await pg.evaluate(() => { WARDIAN_TEST.setHour(11); WARDIAN_TEST.openJournal(); });
  await sleep(300);
  await pg.evaluate(() => { document.querySelector('canvas[data-sp="snail"]').closest('.spread').scrollIntoView({ block: 'start' }); });
  await sleep(200);
  if (want('p4-journal')) await shoot('p4-journal');
  await pg.evaluate(() => { WARDIAN_TEST.closeScreens(); WARDIAN_TEST.openPouch(); });
  await sleep(300);
  if (want('p4-pouch')) await shoot('p4-pouch');
  await b.browser.close();
}

s.close();
console.log('shots done');
