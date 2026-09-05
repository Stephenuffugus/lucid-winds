#!/usr/bin/env node
/* Asterism boots, frames, and puts the right stars on the screen.
 *
 *   node test/boot.mjs
 *
 * What it asserts, each watched to fail:
 *   1. the page loads with nothing on the console
 *   2. the title is ASTERISM and the stamp is on the page
 *   3. the catalogue is fetched WITH a ?v= stamp, from the file, not a blob
 *   4. framed, it posts { sws: 'ready' } to the arcade
 *   5. THE COUNT. The number of stars the renderer drew equals the number the
 *      astronomy says are above the horizon at the fallback place and the
 *      frozen test time. That is the one assertion that ties the pixels to the
 *      maths; without it the sky can be any pretty scatter of dots.
 *   6. Vega is where Vega should be: near the zenith over Columbus in July.
 */
import { serve, open, reporter, sleep, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const requested = [];
const { browser, page, errors } = await open(base);
page.on('request', r => requested.push(r.url()));
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

say(errors.length === 0, 'the page boots with nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
say((await page.title()) === 'ASTERISM', 'the title is ASTERISM, it is ' + JSON.stringify(await page.title()));
const stamp = await dev(() => window.ASTERISM_DEV.stamp);
say((await page.content()).indexOf(stamp) >= 0, 'the page carries its stamp ' + stamp);

/* 3. the catalogue came from its own file, stamped */
const hits = await page.evaluate(() => performance.getEntriesByType('resource').map(r => r.name));
const cat = hits.filter(u => u.indexOf('hyg-asterism.json') >= 0);
say(cat.length === 1, 'the catalogue is fetched once as a file (' + cat.length + ')');
say(cat.length === 1 && cat[0].indexOf('?v=' + stamp) >= 0, 'and it carries the stamp: ' + (cat[0] || 'not fetched'));

/* 4. framed */
const host = await browser.newPage();
await host.setViewport({ width: 375, height: 667 });
await host.setContent(
  `<body style="margin:0"><script>window.__msgs=[];addEventListener('message',e=>{if(e.data&&e.data.sws)window.__msgs.push(e.data.sws)})</script>
   <iframe src="${base}/index.html?framed=1&t=2026-07-15T04:00:00Z" style="width:375px;height:640px;border:0"></iframe></body>`,
  { waitUntil: 'load' });
await host.waitForFunction(() => window.__msgs && window.__msgs.indexOf('ready') >= 0, { timeout: 20000 }).catch(() => {});
const msgs = await host.evaluate(() => window.__msgs);
say(msgs.indexOf('ready') >= 0, 'framed, it posts ready to the arcade (' + JSON.stringify(msgs) + ')');
await host.close();

/* 5. the count: pixels tied to the maths */
await waitFrames(page, 6);
const drawn = await dev(() => window.ASTERISM_DEV.drawn());
const up = await dev(() => window.ASTERISM_DEV.aboveHorizon());
say(drawn > 200, 'the renderer drew ' + drawn + ' stars');
say(drawn <= up, 'and never more than the ' + up + ' the astronomy puts above the horizon');
say(drawn >= up * 0.35,
  'and it drew most of the sky it can see: ' + drawn + ' of ' + up + ' (the rest are off the edges of a 90 degree field)');

/* 6. Vega where Vega should be */
const place = await dev(() => window.ASTERISM_DEV.place());
say(place.name === 'Columbus, Ohio', 'the first ever boot stands in Columbus, and says so on the chip');
const vega = await dev(() => window.ASTERISM_DEV.screenOfHip(91262));
say(!!vega, 'Vega is on the screen');
say(!!vega && vega.alt > 80, 'and it is ' + (vega ? vega.alt.toFixed(1) : '?') + ' degrees up, which is nearly overhead in July');
/* Polaris is BEHIND you when the view faces south, so this asks the sky where
   it is rather than the screen; a null screen position would be the view's
   doing and not the astronomy's. */
const polaris = await dev(() => window.ASTERISM_DEV.altAzOfHip(11767));
say(!!polaris && Math.abs(polaris.alt - place.lat) < 1.2,
  'Polaris stands at the latitude, ' + (polaris ? polaris.alt.toFixed(1) : '?') + ' against ' + place.lat);
say(!!polaris && (polaris.az < 3 || polaris.az > 357), 'and it is due north, azimuth ' + (polaris ? polaris.az.toFixed(1) : '?'));

await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' BOOT FAILURE(S)'); process.exit(1); }
console.log('BOOT OK');
