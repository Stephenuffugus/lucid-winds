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

/* THE LADDER, on the crease it hangs from, with nothing earned yet: three folds
   you have and one you have not, shown rather than hidden, saying what it wants. */
await withPage(412, 915, async (page, shot) => {
  await page.evaluate(() => {
    AIRWORTHY_TEST.clearMedals();
    AIRWORTHY_TEST.shopStart();
    const rung = AIRWORTHY_TEST.ladder()[0];
    const step = AIRWORTHY_TEST.folds().findIndex(f => f.id === rung.fold);
    AIRWORTHY_TEST.shop().step = step;
    AIRWORTHY_TEST.shopRender();
    AIRWORTHY_TEST.shopMarker(0.5);
  });
  await waitFrames(page, 3);
  if (want('p4-ladder')) await shot('p4-ladder');
  /* and the same crease with the medal won */
  await page.evaluate(() => {
    AIRWORTHY_TEST.earnMedal('gym-far', 'bronze');
    AIRWORTHY_TEST.shopRender();
  });
  await waitFrames(page, 3);
  if (want('p4-ladder-open')) await shot('p4-ladder-open');
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

/* P4: the WHISTLE, up in the air, on the phone Stephen carries and on the small
   one. Shot mid flight with the plane still up, because that is the only moment
   the button exists. */
for (const [w, h, tag] of [[412, 915, 'p4-whistle-412'], [375, 667, 'p4-whistle-375']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => {
      AIRWORTHY_TEST.toField({ noseFolds: 3, nose: 'pointed', wing: 0.5, elev: 0 });
      AIRWORTHY_TEST.earnWhistle();
      AIRWORTHY_TEST.launch(8, 0.6);
      AIRWORTHY_TEST.advance(0.9);
    });
    await waitFrames(page, 3);
    const st = await page.evaluate(() => AIRWORTHY_TEST.whistle());
    console.log('  (the whistle: ' + JSON.stringify(st) + ')');
    if (want(tag)) await shot(tag);
  });
}

/* CREASE 1, THE GAME'S OWN WAY: the workshop button, then wait for the sweep the
   game starts on its own to carry the marker into the middle third. Nothing sets
   the marker. This is the screen Stephen saw frozen on Sep 07. */
for (const [w, h, tag] of [[412, 915, 'p5-crease1-412'], [375, 667, 'p5-crease1-375']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => document.getElementById('btnWorkshop').click());
    await page.waitForFunction(() => AIRWORTHY_TEST.shopSweeping()
      && AIRWORTHY_TEST.shop().marker > 0.36 && AIRWORTHY_TEST.shop().marker < 0.64, { timeout: 30000 });
    const m = await page.evaluate(() => AIRWORTHY_TEST.shop().marker);
    console.log('  (crease 1 marker at ' + m.toFixed(2) + ' of the bar, nothing set it)');
    if (want(tag)) await shot(tag);
  });
}

/* P6: THE DOODADS SHELF (docs/GEAR-DOODADS-SEP08.md), on the phone he carries and
   on the small one: three bronze earned so the puppet is open and the chip clip
   is the first silhouette, the penny taped on with both its rings drawn. */
for (const [w, h, tag] of [[412, 915, 'p6-doodads-412'], [375, 667, 'p6-doodads-375']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => {
      AIRWORTHY_TEST.clearMedals();
      ['gym-far', 'gym-hang', 'gym-desk'].forEach(id => AIRWORTHY_TEST.earnMedal(id, 'bronze'));
      AIRWORTHY_TEST.toField();
      AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish();
      document.getElementById('btnTrim').click();
      /* through the chip's own tap, so the HUD's grams follow (poking the spec
         left the HUD at 4.5 g under a penny on the first shots) */
      document.querySelector('#doodadShelf [data-doodad="penny"]').click();
    });
    await waitFrames(page, 3);
    if (want(tag)) await shot(tag);
  });
}
/* the plane wearing each doodad, in the air at half a second, cropped round the
   plane at full scale and tiled: a contact sheet, so the thing you taped on can
   be seen as the thing on the shelf. Then the two cards that say something new. */
await withPage(375, 667, async (page, shot, save) => {
  const rows = await page.evaluate(() => {
    const out = [];
    AIRWORTHY_TEST.doodads().forEach(d => d.places.forEach(p => out.push({ id: d.id, place: p })));
    return out;
  });
  const panels = [];
  for (const d of rows) {
    const at = await page.evaluate((d) => {
      AIRWORTHY_TEST.toField({ noseFolds: 2, nose: 'pointed', wing: 0.5, doodad: d.id, clip: d.place });
      AIRWORTHY_TEST.launch(8, 0.5);
      const live = AIRWORTHY_TEST.advance(0.5);
      const tr = AIRWORTHY_TEST.fly(AIRWORTHY_TEST.spec(), { angle: 8, power: 0.5 }).trace[live.i];
      return AIRWORTHY_TEST.toScreen(tr.x, tr.y);
    }, d);
    await waitFrames(page, 2);
    const W = 150, H = 110;
    const clip = { x: Math.max(0, Math.round(at.x - W * 0.55)), y: Math.max(0, Math.round(at.y - H * 0.5)), width: W, height: H };
    panels.push({ label: d.id + ' ' + d.place, b: await page.screenshot({ type: 'png', encoding: 'base64', clip }) });
  }
  if (want('p6-doodads-flight')) {
    const sheet = await page.evaluate(async (panels) => {
      const imgs = await Promise.all(panels.map(p => new Promise(res => {
        const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + p.b;
      })));
      const cw = 150, ch = 110, cols = 4, rows = Math.ceil(imgs.length / cols);
      const cv = document.createElement('canvas');
      cv.width = cw * cols; cv.height = (ch + 16) * rows;
      const c = cv.getContext('2d');
      c.fillStyle = '#EFE9DC'; c.fillRect(0, 0, cv.width, cv.height);
      imgs.forEach((im, i) => {
        const dx = (i % cols) * cw, dy = Math.floor(i / cols) * (ch + 16);
        c.drawImage(im, dx, dy + 16);
        c.strokeStyle = '#33302A'; c.lineWidth = 1;
        c.strokeRect(dx + .5, dy + 16.5, cw - 1, ch - 1);
        c.fillStyle = '#33302A'; c.font = '600 12px ui-monospace, monospace';
        c.fillText(panels[i].label, dx + 4, dy + 12);
      });
      return cv.toDataURL('image/png').split(',')[1];
    }, panels);
    await save('p6-doodads-flight', Buffer.from(sheet, 'base64'));
  }
  await page.evaluate(() => {
    AIRWORTHY_TEST.toField({ noseFolds: 2, nose: 'pointed', wing: 0.5, doodad: 'ball', clip: 'nose' });
    AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish();
  });
  await waitFrames(page, 3);
  if (want('p6-ball-card')) await shot('p6-ball-card');
  await page.evaluate(() => {
    document.getElementById('btnResultDone').click();
    /* the contact sheet's spinner panel landed on its own during the waited
       frames and took the badge, so this is the first Brick again */
    delete AIRWORTHY_TEST.seen().badges;
    AIRWORTHY_TEST.toField({ noseFolds: 2, nose: 'pointed', wing: 0.5, doodad: 'spinner', clip: 'wing' });
    AIRWORTHY_TEST.launch(8, 0.5); AIRWORTHY_TEST.finish();
  });
  await waitFrames(page, 3);
  if (want('p6-brick-card')) await shot('p6-brick-card');
});

s.close();
console.log('shots done');
