/* Pre-submission preflight for Jumping Jimothy.
   Every Valve review round costs days, so this checks the things they actually
   bounce builds and pages for, mechanically, instead of us believing they are fine. */
const fs=require('fs'), path=require('path'), struct=require('buffer');
const ROOT='/workspaces/lucid-winds';
const OUT=path.join(__dirname,'out');
let fail=0, warn=0;
const ok =(m)=>console.log('  PASS  '+m);
const bad=(m)=>{fail++;console.log('* FAIL  '+m);};
const wrn=(m)=>{warn++;console.log('  WARN  '+m);};

function png(p){ try{ const d=fs.readFileSync(p).subarray(0,33);
  if(d.subarray(0,8).toString('hex')!=='89504e470d0a1a0a') return null;
  return {w:d.readUInt32BE(16),h:d.readUInt32BE(20),ct:d[25]}; }catch(e){ return null; } }

console.log('\n=== 1. CAPSULES: exact dimensions Valve requires ===');
const NEED=[['small_capsule',231,87],['header_capsule',460,215],['main_capsule',616,353],
 ['vertical_capsule',374,448],['library_capsule',600,900],['library_hero',3840,1240],
 ['page_background',1438,810]];
for(const [n,w,h] of NEED){
  const f=fs.readdirSync(OUT).find(x=>x.startsWith(n+'_')&&x.includes(w+'x'+h));
  if(!f){ bad(n+' MISSING ('+w+'x'+h+')'); continue; }
  const m=png(path.join(OUT,f));
  if(!m) bad(n+' unreadable');
  else if(m.w!==w||m.h!==h) bad(n+' is '+m.w+'x'+m.h+', Valve wants '+w+'x'+h);
  else ok(n+'  '+w+'x'+h);
}

console.log('\n=== 2. LIBRARY LOGO: must be transparent ===');
const lg=png(path.join(OUT,'library_logo_1280x720.png'));
if(!lg) bad('library_logo missing');
else if(lg.w!==1280||lg.h!==720) bad('library_logo is '+lg.w+'x'+lg.h+', wants 1280x720');
else if(lg.ct!==6 && lg.ct!==4) bad('library_logo has NO ALPHA CHANNEL (colour-type '+lg.ct+')');
else ok('library_logo 1280x720 with real alpha');

console.log('\n=== 3. SCREENSHOTS: >=5, exactly 16:9 ===');
const SD=path.join(OUT,'screenshots');
const shots=fs.existsSync(SD)?fs.readdirSync(SD).filter(f=>f.endsWith('.png')):[];
if(shots.length<5) bad('only '+shots.length+' screenshots, Valve wants at least 5');
else ok(shots.length+' screenshots');
shots.forEach(f=>{ const m=png(path.join(SD,f));
  if(!m) bad(f+' unreadable');
  else if(m.w!==1920||m.h!==1080) bad(f+' is '+m.w+'x'+m.h+', wants 1920x1080');
});
if(shots.length&&shots.every(f=>{const m=png(path.join(SD,f));return m&&m.w===1920&&m.h===1080;}))
  ok('every screenshot is exactly 1920x1080');

console.log('\n=== 4. THE EXE NAME MUST MATCH THE LAUNCH OPTION ===');
const pkg=JSON.parse(fs.readFileSync(ROOT+'/store/jimothy-steam/package.json','utf8'));
const product=pkg.build&&pkg.build.productName;
const submit=fs.readFileSync(ROOT+'/store/jimothy-steam/STEAM_SUBMIT.md','utf8');
if(!product) bad('no productName in package.json build config');
else {
  const exe=product+'.exe';
  if(submit.includes(exe)) ok('productName "'+product+'" matches the documented launch option "'+exe+'"');
  else bad('productName is "'+product+'" so the exe is "'+exe+'", but STEAM_SUBMIT.md does not say that. A launch-option mismatch fails build review.');
}

console.log('\n=== 5. STORE COPY: placeholders, stale name, banned claims ===');
const kit=fs.readFileSync(ROOT+'/marketing/steam-jimothy.md','utf8');
[['TBD','placeholder TBD'],['TODO','placeholder TODO'],['Lorem','lorem ipsum'],['XXXX','placeholder XXXX']]
 .forEach(([n,d])=>{ if(new RegExp('\\b'+n+'\\b').test(kit)) bad('store kit still contains '+d); });
if(!/\bTBD\b|\bTODO\b|Lorem/i.test(kit)) ok('no placeholder text in the store kit');
if(/Jimothy the Jumping Nugget/.test(kit)) bad('store kit still uses the OLD name');
else ok('store kit uses the new name throughout');
if(/hand[- ]?(painted|drawn|made)/i.test(kit.replace(/Never describe[\s\S]*?punishes hardest\./,'')))
  bad('store kit claims hand-made art');
else ok('no hand-made art claim in store copy');
if(/pre generated with AI|AI tools/i.test(kit)) ok('AI disclosure present (Valve requires the form too)');
else bad('NO AI DISCLOSURE in the store kit - Valve requires this and will bounce the page');

console.log('\n=== 6. THIRD-PARTY IP IN STORE-FACING COPY ===');
const IP=['Frogger','Crossy Road','Konami','Nintendo','Pokemon','Mario'];
IP.forEach(w=>{ if(new RegExp(w,'i').test(kit)) wrn('store kit mentions "'+w+'" - trademark of another company. Fine as a comparison in prose, but NEVER as a tag or in the title.'); });
const game=fs.readFileSync(ROOT+'/satellites/stream-hop/index.html','utf8').slice(0,4000);
IP.forEach(w=>{ if(new RegExp(w,'i').test(game)) wrn('the GAME PAGE meta still lists "'+w+'" as a keyword (web SEO only, not shipped to Steam - but check it is not pasted into Steam tags)'); });

console.log('\n=== 7. THE STEAM BUILD ITSELF ===');
const app=ROOT+'/store/jimothy-steam/app/index.html';
if(!fs.existsSync(app)) bad('app/ not vendored - run vendor.sh before upload');
else {
  const s=fs.readFileSync(app,'utf8');
  if(s.indexOf('window.__STEAM_BUILD=true')<0) bad('vendored build is MISSING the STEAM_BUILD flag - commerce would be live');
  else if(s.indexOf('window.__STEAM_BUILD=true')>s.indexOf('var STORE_BUILD')) bad('STEAM_BUILD flag lands AFTER the game reads it');
  else ok('vendored build has the commerce flag, set before the game reads it');
  /* ⛔ check what a PLAYER sees, not the raw file. The first version of this flagged
     the deliberate SEO alias in <meta keywords> and read as a real defect. */
  const visible=[...s.matchAll(/<title>([^<]*)<\/title>|id="splash-tag">([^<]*)<|class="title-word">([^<]*)</g)]
    .map(m=>m[1]||m[2]||m[3]).join(' | ');
  if(/Jimothy the Jumping Nugget/.test(visible)) bad('vendored build SHOWS the old name: '+visible);
  else ok('vendored build shows the new name ('+visible+')');
  if(/\bFrogger\b|\bCrossy Road\b/.test(s)) bad('a third-party trademark ships inside the Steam binary');
  else ok('no third-party trademark in the shipped binary');
  if(/application\/ld\+json|<meta name="keywords"/.test(s)) bad('web-only SEO metadata still in the desktop build');
  else ok('web-only SEO metadata stripped from the desktop build');
  if(/fonts\.googleapis|gstatic/.test(s)) bad('vendored build still reaches an external host');
  else ok('vendored build makes no external font/SDK request');
}

console.log('\n=== 8. UPLOAD WIRING ===');
const up=fs.readFileSync(ROOT+'/store/jimothy-steam/steampipe/upload.sh','utf8');
if(/LW_STEAM_APPID:-5043360/.test(up)) ok('upload.sh defaults to app 5043360');
else bad('upload.sh does not default to the real app id');
if(/npm run dist:win/.test(up)) ok('upload rebuilds from the live game (cannot ship a stale Jimothy)');
else bad('upload does not rebuild - could upload a stale build');

console.log('\n'+(fail?('*** '+fail+' MUST-FIX'):'ALL MECHANICAL CHECKS PASS')+(warn?('   ('+warn+' to eyeball)'):''));
process.exit(fail?1:0);
