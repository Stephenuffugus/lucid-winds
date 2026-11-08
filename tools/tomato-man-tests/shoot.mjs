/* Shoot Tomato Man at 412x915 (2 device px per CSS px, touch on): every screen, or one by name, driven through the game's
 * own window.__TM hook with the clock held (no real time passes between the setup and the shot). THE TESTING LAW: one shot
 * per visual step, of THAT screen, after all the step's edits; then OPEN THE IMAGE AND LOOK (name three things wrong).
 *
 *   (cd /workspaces/Tomato_Man && python3 -m http.server 8778 >/dev/null 2>&1 &)     serve the clone first
 *   node tools/tomato-man-tests/shoot.mjs <outdir>                 every screen
 *   node tools/tomato-man-tests/shoot.mjs <outdir> play            one screen
 *   W=360 H=780 node tools/tomato-man-tests/shoot.mjs <outdir> play
 * Screens: title howto worlds levels play blaze burn win shop builder daily pause first longdark springtide angry pickle
 * ne acts winhat (m2 step 8: walking north east with a hat, a shade drop frame, the postcard victory with the hat)
 * lunge warn gust cactus (m2 step 9: the Angry Sun mid lunge and warning, an umbrella in a gust, a cactus in the wind)
 * share (share writes the two composed 1080 postcards; first = an empty save, Dawn
 * Ribbon's first seconds). Every other screen starts from a save that has seen How to Play and every coach mark. */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/workspaces/sws-tools/package.json');
const puppeteer = require('puppeteer');
const out = process.argv[2] || '/home/codespace/tm-drafts/shots';
const only = process.argv[3] || null;
const W = parseInt(process.env.W || '412', 10), H = parseInt(process.env.H || '915', 10);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'], protocolTimeout: 120000, timeout: 120000 });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const URL = 'http://localhost:8778/?tmtest=1';
const TUT = ['move','shade','aloe','find','dash','seed','shadeDrop','checkpoint','burn','hot','spf','cart','cloud','wilt','ice','lunge','eclipse'];
const SEEN = JSON.stringify({ seenHowto: true, tut: Object.fromEntries(TUT.map(k => [k, true])) });
const wait = ms => new Promise(r => setTimeout(r, ms));
const ev = async js => { try { return await page.evaluate(js); } catch (e) { console.log('  failed:', js.slice(0, 80), e.message.slice(0, 120)); } };
const fresh = async (save) => {
  await page.goto('about:blank');
  await page.evaluateOnNewDocument(s => { try { if (s === null) localStorage.removeItem('tomatoman_save_v1'); else localStorage.setItem('tomatoman_save_v1', s); } catch (e) {} }, save);
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 }); await wait(900);
};
const shot = async n => { await wait(400); await page.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 82 }); console.log(n); };
const want = n => !only || only === n;
import { writeFileSync } from 'node:fs';
const savePng = async n => { const d = await ev('__TM.postcard()'); if (d) { writeFileSync(`${out}/${n}.png`, Buffer.from(d.split(',')[1], 'base64')); console.log(n + ' (composed)'); } else console.log(n + ' NOT composed'); };
const SCREENS = {
  title: async () => {},
  howto: async () => { await ev("__TM.buildHowto(); __TM.showScreen('howto')"); },
  worlds: async () => { await ev("__TM.go('map')"); },
  levels: async () => { await ev("__TM.openWorld(0)"); },
  play: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(6)"); },
  blaze: async () => { await ev("__TM.hold(true); __TM.startLevel(6); __TM.seek(2); var r=__TM._run(), m=r.movers[1]; r.screenT=9; __TM.P.x=m.x+m.w/2; __TM.P.y=m.y+170; __TM.seek(1.6)"); },
  burn: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(1.5); __TM.burn(); __TM.seek(0.1)"); },
  win: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(3); __TM.winLevel()"); },
  shop: async () => { await ev("__TM.go('shop')"); },
  builder: async () => { await ev("__TM.go('builder')"); },
  daily: async () => { await ev("__TM.hold(true); __TM.startDaily(); __TM.seek(3)"); },
  pause: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(2); __TM.togglePause()"); },
  first: async () => { await ev("__TM.hold(true); __TM.startLevel(0); __TM.seek(2.5)"); },
  tools: async () => { await ev("__TM.hold(true); __TM.startLevel(1); __TM.seek(2.5)"); },   // THE PRESSURE step 2: Sliver Step's opening (the tools lesson)
  ne: async () => { await ev("__TM.look('tomato','sunhat'); __TM.hold(true); __TM.startLevel(1); __TM.seek(1.5)"); await wait(900);
    await ev("var r=__TM._run(); __TM.P.face=-Math.PI/4; __TM.P.vx=130; __TM.P.vy=-130; r.idleT=0; __TM.render()"); },
  acts: async () => { await ev("__TM.look('tomato','sunhat'); __TM.hold(true); __TM.startLevel(1); __TM.seek(1.5)"); await wait(900);
    await ev("var r=__TM._run(); r.act={k:'shade_drop',t:0.3}; __TM.P.vx=0; __TM.P.vy=0; r.idleT=1; __TM.render()"); },
  winhat: async () => { await ev("__TM.look('tomato','sunhat'); __TM.hold(true); __TM.startLevel(2); __TM.seek(2); __TM.winLevel()"); await wait(1500); },
  lunge: async () => { await ev("__TM.hold(true); __TM.startLevel(__TM.LEVELS.findIndex(l=>l.name==='The Angry Sun')); var r=__TM._run(); r.screenT=60; for(var i=0;i<300&&r.lunge.state!=='strike';i++) __TM.seek(0.05); __TM.seek(0.45)"); await wait(900); await ev("__TM.render()"); },
  warn: async () => { await ev("__TM.hold(true); __TM.startLevel(__TM.LEVELS.findIndex(l=>l.name==='The Angry Sun')); var r=__TM._run(); r.screenT=60; for(var i=0;i<400&&r.lunge.state!=='idle';i++) __TM.seek(0.05); for(var i=0;i<400&&r.lunge.state!=='warn';i++) __TM.seek(0.05); __TM.seek(0.7)"); await wait(900); await ev("__TM.render()"); },
  gust: async () => { await ev("__TM.hold(true); __TM.startLevel(__TM.LEVELS.findIndex(l=>l.name==='Dusk Gauntlet')); var r=__TM._run(); r.screenT=60; __TM.seek(2.6); __TM.P.x=1650; __TM.P.y=1580; __TM.seek(1.4)"); await wait(900); await ev("__TM.render()"); },
  cactus: async () => { await ev("__TM.hold(true); __TM.startLevel(__TM.LEVELS.findIndex(l=>l.name==='Dusk Gauntlet')); var r=__TM._run(); r.screenT=60; __TM.seek(2.6); var c=r.cacti[0]; __TM.P.x=c.x-c.side*110+60; __TM.P.y=c.y+30; __TM.seek(1.4)"); await wait(900); await ev("__TM.render()"); },
  cues: async () => {   // m2 step 10: what the cue chip says in each case (printed, no image needed)
    const say = async (name, js) => { const v = await ev("(function(){" + js + "; __TM.seek(1/60); var c=document.getElementById('cue'); return c.className+' | '+c.textContent; })()"); console.log('  cue ' + name + ': ' + v); };
    const lv = n => "__TM.hold(true); __TM.startLevel(__TM.LEVELS.findIndex(l=>l.name==='" + n + "')); var r=__TM._run(); r.screenT=60;";
    await say('lunge warn', lv('The Angry Sun') + " __TM.seek(0.5)");
    await say('wilt', lv('Spring Tide') + " var w=r.wilts[0]; __TM.P.x=w.x+w.w/2; __TM.P.y=w.y+w.d/2; w.campT=1.5;");
    await say('eclipse', lv('The Long Dark') + " for(var i=0;i<400&&r.darkT<=0;i++) __TM.seek(0.05);");
    await say('cooling', lv('Dawn Ribbon') + " r.act={k:'cooling',t:0.1};");
    await say('umbrella', lv('Dusk Gauntlet') + " __TM.P.x=1600; __TM.P.y=1560;");
    await say('shade ready', lv('Dawn Ribbon') + " r.screenT=0; r.graceT=0; r.charges.shade=2; var found=0; for(var yy=r.L.start[1]-60;yy>200&&!found;yy-=40) for(var xx=r.L.start[0]-300;xx<r.L.start[0]+300&&!found;xx+=40) { __TM.P.x=xx; __TM.P.y=yy; __TM.P.exp=0; __TM.seek(1/60); if(!r.lastSafe) found=1; } __TM.P.exp=55;");
    await say('exit', lv('Dawn Ribbon') + " __TM.P.x=r.L.exit[0]; __TM.P.y=r.L.exit[1]+200;");
    await say('none', lv('Dawn Ribbon') + " __TM.seek(0.2)"); },
  longdark: async () => { await ev("__TM.hold(true); __TM.startLevel(__TM.LEVELS.findIndex(l=>l.name==='The Long Dark')); __TM.seek(4.6)"); },
  springtide: async () => { await ev("__TM.hold(true); __TM.startLevel(__TM.LEVELS.findIndex(l=>l.name==='Spring Tide')); var r=__TM._run(); r.screenT=30; __TM.P.x=1200; __TM.P.y=2060; r.wilts[0].campT=2.0; __TM.seek(0.4)"); },
  angry: async () => { await ev("__TM.hold(true); __TM.startLevel(__TM.LEVELS.findIndex(l=>l.name==='The Angry Sun')); __TM.seek(0.7)"); await wait(700); await ev("__TM.render()"); },
  pickle: async () => { await ev("__TM.look('pickle','eclipse_halo'); __TM.go('builder')"); await wait(1500); },
  share: async () => { await ev("__TM.hold(true); __TM.startLevel(2); __TM.seek(2); __TM.winLevel()"); await wait(1200); await savePng('share-result');
    await ev("__TM.hold(true); __TM.startDaily(); __TM.seek(2); __TM.winLevel()"); await wait(1200); await savePng('share-daily'); },
};
for (const name of Object.keys(SCREENS)) {
  if (!want(name)) continue;
  await fresh(name === 'first' ? null : SEEN);
  await SCREENS[name]();
  await shot(name);
}
await browser.close();
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join(' ; ') : 'no page errors');
