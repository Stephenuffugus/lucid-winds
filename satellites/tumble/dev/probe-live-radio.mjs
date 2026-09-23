// Live check for the radio's eight places (DESIGN-T2 phase 8): on lucidwinds.com each station plays HIS song, the real
// file, and not the generated bed it falls back to. Each file proves which song it is by its own length (measured with
// ffprobe from the files in lucid-winds-music v1/tumble/), so a station wired to the wrong song fails too.
// One station at a time, with a gap between (never burst the live site). node dev/probe-live-radio.mjs [url]
import puppeteer from 'puppeteer';
const base = process.argv[2] || 'https://lucidwinds.com/satellites/tumble/';
const LENGTH = { 'fold-it-up': 104.72, 'gayageum-janggu': 121.18, 'hard-gayageum-janggu': 107.81, 'modular-jazz-hub': 167.86, 'nightmarish-lo-fi': 71.13, 'quite-the-throwdown': 129.57, 'the-suspicious-menu': 137.77, 'whos-sock-is-this': 144.85 };
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e.message).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200) + ' ' + ((m.location() || {}).url || '')); });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => page.evaluate(f, ...a);
const until = (f, arg, t = 60000) => page.waitForFunction(f, { timeout: t, polling: 300 }, arg).then(() => true, () => false);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await page.goto(base + '?unlockall=1', { waitUntil: 'load', timeout: 120000 });
  ok(await until(() => window.TUMBLE && window.TUMBLE_DEV && TUMBLE_DEV.state === 'room', null, 180000), 'the live page boots into the Laundry Room');
  await D(() => window.TUMBLE.audio.unlock());
  const stations = await D(() => window.TUMBLE.data.unlocks.items.filter((i) => i.cat === 'radio' && i.look.url).map((i) => ({ id: i.id, name: i.name, key: i.look.station, url: i.look.url })));
  ok(stations.length === 8, `eight stations carry his songs on the live site (${stations.length})`);
  for (const s of stations) {
    await D((id) => { const app = window.TUMBLE; if (!app.save.unlocks.includes(id)) app.save.unlocks.push(id); app.save.equipped.radio = id; app._beds(); }, s.id);
    const playing = await until((url) => { const n = window.TUMBLE.audio.radioNode; return n && n.kind === 'track' && n.url === url && n.el && !n.el.error && n.el.currentTime > 0.5 && n.el.duration > 1; }, s.url, 45000);
    const got = await D(() => { const n = window.TUMBLE.audio.radioNode; return n ? { kind: n.kind, station: n.station, t: n.el ? +n.el.currentTime.toFixed(1) : null, len: n.el ? +n.el.duration.toFixed(2) : null, err: n.el && n.el.error ? n.el.error.code : null } : null; });
    const slug = /\/([a-z0-9-]+)\.mp3$/.exec(s.url)[1];
    ok(playing && got && Math.abs(got.len - LENGTH[slug]) < 0.5, `${s.name} plays ${slug} (${JSON.stringify(got)})`);
    await sleep(2500);
  }
  await D(() => { window.TUMBLE.save.equipped.radio = null; window.TUMBLE._beds(); });
  const errs = errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 4).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await browser.close();
console.log(fails.length ? `live radio probe: ${fails.length} FAILED` : 'live radio probe: all passed');
process.exitCode = fails.length ? 1 : 0;
