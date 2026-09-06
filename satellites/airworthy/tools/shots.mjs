/* The shots, from where the player stands, in both orientations.
   ⛔ the SHUTTER is gated by the filter, never the walk to the moment. */
import { serve, open, waitFrames, sleep, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const OUT = join(ROOT, 'docs', 'shots');
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const s = await serve();

async function withPage(w, h, fn) {
  const b = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  async function save(name, buf) {
    let out = buf;
    if (out.length > LIMIT) {
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
    console.log('  ' + name + '.png  ' + (out.length / 1024).toFixed(0) + ' KB'
      + (out.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
  }
  const shot = async (name) => { await save(name, await b.page.screenshot({ type: 'png' })); };
  await fn(b.page, shot, save);
  await b.browser.close();
}

/* the swoop: six panels of the porpoise at half second intervals */
await withPage(667, 375, async (page, shot, save) => {
  await page.evaluate(() => { AIRWORTHY_TEST.toField(); AIRWORTHY_TEST.launch(8, 0.5); });
  const panels = [];
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => AIRWORTHY_TEST.advance(0.5));
    await waitFrames(page, 2);
    panels.push(await page.screenshot({ type: 'png', encoding: 'base64' }));
  }
  if (want('p1-swoop')) {
    const strip = await page.evaluate(async (panels) => {
      const imgs = await Promise.all(panels.map(b => new Promise(res => {
        const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + b;
      })));
      const cw = 334, ch = 188;
      const cv = document.createElement('canvas');
      cv.width = cw * 3; cv.height = ch * 2;
      const c = cv.getContext('2d');
      c.fillStyle = '#EFE9DC'; c.fillRect(0, 0, cv.width, cv.height);
      imgs.forEach((im, i) => {
        const dx = (i % 3) * cw, dy = Math.floor(i / 3) * ch;
        c.drawImage(im, 0, 0, im.width, im.height, dx, dy, cw, ch);
        c.strokeStyle = '#33302A'; c.lineWidth = 1;
        c.strokeRect(dx + .5, dy + .5, cw - 1, ch - 1);
        c.fillStyle = '#33302A'; c.font = '600 12px ui-monospace, monospace';
        c.fillText(((i + 1) * 0.5).toFixed(1) + ' s', dx + 9, dy + 18);
      });
      return cv.toDataURL('image/png').split(',')[1];
    }, panels);
    await save('p1-swoop', Buffer.from(strip, 'base64'));
  }
  await page.evaluate(() => AIRWORTHY_TEST.finish());
  await waitFrames(page, 3);
  if (want('p1-result')) await shot('p1-result');
});

/* the fix: two bends of the elevator and it is a cruiser */
await withPage(667, 375, async (page, shot, save) => {
  await page.evaluate(() => {
    AIRWORTHY_TEST.toField();
    AIRWORTHY_TEST.setTrim(-2);
    AIRWORTHY_TEST.launch(8, 0.5);
    AIRWORTHY_TEST.finish();
  });
  await waitFrames(page, 3);
  if (want('p1-fixed')) await shot('p1-fixed');
});

/* the slingshot, mid pull */
await withPage(667, 375, async (page, shot) => {
  await page.evaluate(() => {
    AIRWORTHY_TEST.toField();
    const home = AIRWORTHY_TEST.home();
    const cv = document.getElementById('stage');
    const mk = (t, x, y) => new PointerEvent(t, { pointerId: 5, pointerType: 'touch',
      isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
    cv.dispatchEvent(mk('pointerdown', home.x, home.y));
    cv.dispatchEvent(mk('pointermove', home.x - 96, home.y + 42));
  });
  await waitFrames(page, 3);
  if (want('p1-sling')) await shot('p1-sling');
});
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => { AIRWORTHY_TEST.toField(); AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.advance(1.2); });
  await waitFrames(page, 3);
  if (want('p1-portrait')) await shot('p1-portrait');
});

/* the workshop, mid fold */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    AIRWORTHY_TEST.shopStart();
    const s = AIRWORTHY_TEST.shop();
    /* three creases already made, on the fourth */
    s.choice[0] = 'pointed'; s.hits.push(0.94);
    s.choice[1] = 2; s.hits.push(0.88);
    s.choice[2] = 0.5; s.hits.push(0.96);
    s.step = 3;
    AIRWORTHY_TEST.shopRender();
    AIRWORTHY_TEST.shopMarker(0.42);
  });
  await waitFrames(page, 3);
  if (want('p2-workshop')) await shot('p2-workshop');
  /* the moment a crease is pressed */
  await page.evaluate(() => {
    const s = AIRWORTHY_TEST.shop();
    s.choice[3] = 'up';
    AIRWORTHY_TEST.shopRender();
    AIRWORTHY_TEST.shopMarker(0.5);
  });
  await waitFrames(page, 2);
  await page.evaluate(() => {
    const bar = document.getElementById('shopBar');
    const r = bar.getBoundingClientRect();
    bar.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 9, pointerType: 'touch',
      isPrimary: true, bubbles: true, cancelable: true,
      clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
  });
  await waitFrames(page, 3);
  if (want('p2-crease')) await shot('p2-crease');
});

/* the workshop in landscape, where the chrome is a column down the side */
await withPage(667, 375, async (page, shot) => {
  await page.evaluate(() => {
    AIRWORTHY_TEST.shopStart();
    const s = AIRWORTHY_TEST.shop();
    s.choice[0] = 'pointed'; s.hits.push(0.94);
    s.choice[1] = 3; s.hits.push(0.88);
    s.step = 2;
    AIRWORTHY_TEST.shopRender();
    AIRWORTHY_TEST.shopMarker(0.55);
  });
  await waitFrames(page, 3);
  if (want('p2-workshop-wide')) await shot('p2-workshop-wide');
});

/* the hangar with three planes in it */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    const specs = [
      { nose: 'pointed', noseFolds: 3, wing: 0.5, fins: 'none', dihedral: 0.4 },
      { nose: 'blunt', noseFolds: 1, wing: 0.95, fins: 'up', dihedral: 1 },
      { nose: 'locked', noseFolds: 3, wing: 0.15, fins: 'down', dihedral: 0 }
    ];
    for (const sp of specs) {
      AIRWORTHY_TEST.shopStart(sp);
      const s = AIRWORTHY_TEST.shop();
      for (let i = 0; i < AIRWORTHY_TEST.folds().length; i++) {
        const f = AIRWORTHY_TEST.folds()[i];
        if (f.field) s.choice[i] = sp[f.field] !== undefined ? sp[f.field] : AIRWORTHY_TEST.spec()[f.field];
        s.hits.push(0.9);
      }
      s.step = AIRWORTHY_TEST.folds().length - 1;
      document.getElementById('btnShopNext').click();
      AIRWORTHY_TEST.launch(8, 0.5);
      AIRWORTHY_TEST.finish();
    }
    document.getElementById('btnHangar').click();
    const first = document.querySelector('.plane-card');
    if (first) first.click();
  });
  await waitFrames(page, 3);
  if (want('p2-hangar')) await shot('p2-hangar');
});

/* ---- P3. THE CHALLENGES AND THE BACKYARD ---- */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => document.getElementById('btnChallenges').click());
  await waitFrames(page, 3);
  if (want('p3-challenges')) await shot('p3-challenges');
  /* the backyard, mid flight, with the fan and the grill in shot */
  await page.evaluate(() => {
    AIRWORTHY_TEST.toChallenge('yard-hang', { nose: 'pointed', noseFolds: 2, wing: 0.95, elev: 6 });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(1.6);
  });
  await waitFrames(page, 3);
  if (want('p3-yard')) await shot('p3-yard');
  await page.evaluate(() => { AIRWORTHY_TEST.finish(); });
  await waitFrames(page, 3);
  if (want('p3-yard-result')) await shot('p3-yard-result');
  /* the canyon riding its wall, and the stadium's slalom in its swirl */
  await page.evaluate(() => {
    AIRWORTHY_TEST.toChallenge('canyon-hang', { nose: 'pointed', noseFolds: 2, wing: 0.45, elev: 2 });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(2.4);
  });
  await waitFrames(page, 3);
  if (want('p4-canyon')) await shot('p4-canyon');
  await page.evaluate(() => { AIRWORTHY_TEST.finish(); });
  await page.evaluate(() => {
    AIRWORTHY_TEST.toChallenge('stadium-far', { nose: 'locked', noseFolds: 3, wing: 0.15, elev: 0 });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(1.1);
  });
  await waitFrames(page, 3);
  if (want('p4-stadium')) await shot('p4-stadium');
  await page.evaluate(() => { AIRWORTHY_TEST.finish(); });
  /* the ring slalom, mid flight, with its own three gates on the screen */
  await page.evaluate(() => {
    AIRWORTHY_TEST.toChallenge('stadium-rings', { nose: 'pointed', noseFolds: 3, wing: 0.5, dihedral: 0.4, precision: 0.8, elev: 0, clip: 'nose' });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(1.6);
  });
  await waitFrames(page, 3);
  if (want('p4-slalom')) await shot('p4-slalom');
  await page.evaluate(() => { AIRWORTHY_TEST.finish(); });
});
/* the same two on a tall phone */
await withPage(412, 915, async (page, shot) => {
  await page.evaluate(() => {
    AIRWORTHY_TEST.toChallenge('canyon-hang', { nose: 'pointed', noseFolds: 2, wing: 0.45, elev: 2 });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(2.4);
  });
  await waitFrames(page, 3);
  if (want('p4-canyon-tall')) await shot('p4-canyon-tall');
  await page.evaluate(() => { AIRWORTHY_TEST.finish(); });
  await page.evaluate(() => {
    AIRWORTHY_TEST.toChallenge('stadium-far', { nose: 'locked', noseFolds: 3, wing: 0.15, elev: 0 });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(1.1);
  });
  await waitFrames(page, 3);
  if (want('p4-stadium-tall')) await shot('p4-stadium-tall');
  await page.evaluate(() => { AIRWORTHY_TEST.finish(); });
});
await withPage(375, 667, async (page, shot) => {
  /* the accuracy mark, and the gym's banners */
  await page.evaluate(() => {
    AIRWORTHY_TEST.toChallenge('gym-desk', { nose: 'blunt', noseFolds: 3, wing: 0.7, fins: 'up', elev: -4 });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(1.1);
  });
  await waitFrames(page, 3);
  if (want('p3-desk')) await shot('p3-desk');
});
await withPage(667, 375, async (page, shot) => {
  await page.evaluate(() => {
    AIRWORTHY_TEST.toChallenge('yard-far', { nose: 'pointed', noseFolds: 1, wing: 0.26, elev: 4, clip: 'nose' });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(1.2);
  });
  await waitFrames(page, 3);
  if (want('p3-yard-wide')) await shot('p3-yard-wide');
});

/* ---- P3. THE WIND TUNNEL ---- */
const setDial = (page, id, v) => page.evaluate((id, v) => {
  const d = document.getElementById(id);
  d.value = String(v);
  d.dispatchEvent(new Event('input', { bubbles: true }));
}, id, v);

await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => document.getElementById('btnTunnel').click());
  await waitFrames(page, 4);
  await page.evaluate(() => document.getElementById('btnTunTrim').click());
  await waitFrames(page, 30);
  if (want('p3-tunnel')) await shot('p3-tunnel');
  await setDial(page, 'dialAlpha', 27.5);
  await waitFrames(page, 40);
  if (want('p3-tunnel-stall')) await shot('p3-tunnel-stall');
  /* the worst case on purpose: a plane that does not glide at all, on the
     smallest screen the fleet supports */
  await setDial(page, 'dialTunElev', -12);
  await setDial(page, 'dialAlpha', -5);
  await waitFrames(page, 30);
  if (want('p3-tunnel-dive')) await shot('p3-tunnel-dive');
});
await withPage(667, 375, async (page, shot) => {
  await page.evaluate(() => document.getElementById('btnTunnel').click());
  await waitFrames(page, 4);
  await setDial(page, 'dialWind', 14);
  await setDial(page, 'dialAlpha', 8);
  await waitFrames(page, 40);
  if (want('p3-tunnel-wide')) await shot('p3-tunnel-wide');
});
await withPage(320, 568, async (page, shot) => {
  await page.evaluate(() => document.getElementById('btnTunnel').click());
  await waitFrames(page, 4);
  await page.evaluate(() => document.getElementById('btnTunTrim').click());
  await waitFrames(page, 30);
  if (want('p3-tunnel-320')) await shot('p3-tunnel-320');
});

/* ---- P3. The ghost of your best flight, on the second throw ---- */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    /* a good flight first, then a worse plane on the same challenge, caught mid
       air so the ghost of the better one is beside it */
    AIRWORTHY_TEST.toChallenge('gym-hang', { nose: 'pointed', noseFolds: 2, wing: 0.99, elev: 8, precision: 1 });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.finish();
    document.getElementById('btnResultDone').click();
    AIRWORTHY_TEST.toChallenge('gym-hang', { nose: 'locked', noseFolds: 3, wing: 0.2, elev: 0, precision: 1 });
    AIRWORTHY_TEST.launch();
    AIRWORTHY_TEST.advance(1.6);
  });
  await waitFrames(page, 3);
  if (want('p3-ghost')) await shot('p3-ghost');
});

/* ---- P3. Pinched all the way out: the whole throw in one frame ---- */
await withPage(667, 375, async (page, shot) => {
  await page.evaluate(() => {
    AIRWORTHY_TEST.toField({ nose: 'locked', noseFolds: 3, wing: 0.15, elev: 0, precision: 1 });
    AIRWORTHY_TEST.view().zoom = 0.5;
    AIRWORTHY_TEST.launch(8, 0.95);
    AIRWORTHY_TEST.finish();
  });
  await waitFrames(page, 4);
  if (want('p3-pinched')) await shot('p3-pinched');
});

/* ---- P3. The shelf with medals on it, and the result card's two rows ---- */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    /* three folds on the shelf, each having won something different */
    const folds = [
      { nose: 'blunt', noseFolds: 3, wing: 0.699, fins: 'up', dihedral: 0.815, precision: 1, elev: -4, ch: 'gym-desk' },
      { nose: 'locked', noseFolds: 3, wing: 0.15, fins: 'none', dihedral: 0.4, precision: 1, elev: 0, ch: 'gym-far' },
      { nose: 'pointed', noseFolds: 2, wing: 0.99, fins: 'none', dihedral: 0.36, precision: 1, elev: 8, ch: 'yard-hang' }
    ];
    for (const f of folds) {
      AIRWORTHY_TEST.shopStart(f);
      const sh = AIRWORTHY_TEST.shop(), fl = AIRWORTHY_TEST.folds();
      for (let i = 0; i < fl.length; i++) {
        if (fl[i].field) sh.choice[i] = f[fl[i].field] !== undefined ? f[fl[i].field] : AIRWORTHY_TEST.spec()[fl[i].field];
        sh.hits.push(1);
      }
      sh.step = fl.length - 1;
      document.getElementById('btnShopNext').click();
      AIRWORTHY_TEST.pickChallenge(f.ch);
      AIRWORTHY_TEST.launch();
      AIRWORTHY_TEST.finish();
    }
  });
  await waitFrames(page, 3);
  if (want('p3-result-rows')) await shot('p3-result-rows');
  await page.evaluate(() => {
    document.getElementById('btnResultDone').click();
    document.getElementById('btnBack').click();
    document.getElementById('btnHangar').click();
  });
  await waitFrames(page, 3);
  if (want('p3-shelf')) await shot('p3-shelf');
});

/* ---- P3. THE FOUR SIZES the plan names, on the shot that matters most ---- */
for (const [w, h, tag] of [[412, 915, 'p3-412'], [375, 667, 'p3-375'], [320, 568, 'p3-320'], [915, 412, 'p3-915']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => {
      AIRWORTHY_TEST.toChallenge('gym-far', { nose: 'locked', noseFolds: 3, wing: 0.15, elev: 0 });
      AIRWORTHY_TEST.launch();
      AIRWORTHY_TEST.advance(1.3);
    });
    await waitFrames(page, 3);
    if (want(tag)) await shot(tag);
  });
}

s.close();
console.log('shots done');
