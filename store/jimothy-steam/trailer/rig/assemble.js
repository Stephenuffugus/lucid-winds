/* Cut the captured frames into the trailer.

   Compositing happens in ffmpeg, not in a browser: the frame furniture (plate,
   slot hairline, caption) never changes inside a beat, so pushing 1380 frames
   through a headless compositor would cost twenty minutes to redraw the same
   picture. ffmpeg overlays it in one pass.

   Layout is fixed by plates/_geometry.json: the game frame lands at 588x1044,
   centred, which is 540x960 at TRUE ASPECT. ⛔ Nothing here may stretch it to
   fill 16:9 — that is the first of Part 4.3's three DON'Ts and it is instantly
   obvious on a store page. */
const {execFileSync}=require('child_process');
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const G=JSON.parse(fs.readFileSync(ROOT+'/plates/_geometry.json','utf8'));
const FPS=30;
const sh=n=>Math.round(n*FPS);

/* beat -> [shot dirs in order], caption plan */
const BEATS=[
 {id:'beat01', shots:['b01_coldopen'], caps:[{f:'c01', at:sh(1)}]},
 {id:'beat02', shots:['b02a_pike','b02b_westse','b02c_caphill','b02d_queenan'], caps:[{f:'c02', at:0}]},
 {id:'beat03', shots:['b03_trail'], caps:[{f:'c03', at:0}]},
 {id:'beat04', shots:['b04_death'], caps:[{f:'c04', at:0}]},
 {id:'beat05', shots:['b05a_ferry','b05b_storm','b05c_gull','b05d_black'], caps:[{f:'c05', at:0}]},
 {id:'beat06', shots:['b06a_coffee','b06b_vest','b06c_boots','b06d_salmon'], caps:[{f:'c06', at:0}]},
 /* two captions: the map beat earns its second line when the list runs past 100 */
 {id:'beat07', shots:['b07_levels'], caps:[{f:'c07a', at:0, out:sh(2.0)},{f:'c07b', at:sh(2.2)}]},
 {id:'beat08', shots:['b08a_coll','b08b_shark','b08c_dino','b08d_secret'], caps:[{f:'c08', at:0}]},
 {id:'beat09', shots:['b09_daily'], caps:[{f:'c09', at:0}], push:0.05},
 {id:'beat10', shots:['b10_feast'], caps:[{f:'c10', at:0}], push:0.045},
 /* the end card is composed at full frame: no plate, no caption, no slot */
 {id:'beat11', shots:['b11_endcard'], full:true}
];

const run=(args,label)=>{ try{ execFileSync('ffmpeg',args,{stdio:['ignore','ignore','pipe']}); }
  catch(e){ console.error('FFMPEG FAILED ('+label+'):\n'+String(e.stderr||e).slice(-2400)); process.exit(1); } };

/* one flat, sequentially numbered directory per beat, so ffmpeg reads a single
   %05d sequence instead of a hand written concat list */
function buildBeatFrames(b){
  const dir=ROOT+'/frames/_beats/'+b.id;
  fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
  let n=0;
  for(const s of b.shots){
    const src=ROOT+'/frames/'+s;
    if(!fs.existsSync(src)) throw new Error('missing shot '+s+' (capture it first)');
    const files=fs.readdirSync(src).filter(f=>/\.jpg$/.test(f)).sort();
    if(!files.length) throw new Error('shot '+s+' has no frames');
    for(const f of files){ fs.linkSync(src+'/'+f, dir+'/f'+String(n++).padStart(5,'0')+'.jpg'); }
  }
  return {dir, n};
}

function cutBeat(b){
  const {dir,n}=buildBeatFrames(b);
  const out=ROOT+'/clips/'+b.id+'.mp4';
  const args=['-v','error','-y'];
  if(b.full){
    args.push('-framerate',String(FPS),'-i',dir+'/f%05d.jpg',
      '-vf','scale=1920:1080,format=yuv420p','-frames:v',String(n));
  } else {
    args.push('-loop','1','-i',ROOT+'/plates/plate.png');
    args.push('-framerate',String(FPS),'-i',dir+'/f%05d.jpg');
    args.push('-loop','1','-i',ROOT+'/plates/slotline.png');
    for(const c of (b.caps||[])) args.push('-loop','1','-i',ROOT+'/plates/'+c.f+'.png');
    /* a slow push in gives a held card beat some life without touching aspect:
       zoom the 1080x1920 source and crop back to 1080x1920, then place it */
    const src = b.push
      ? `[1:v]scale=${Math.round(1080*(1+b.push))}:${Math.round(1920*(1+b.push))},`+
        `crop=1080:1920:(iw-1080)/2:(ih-1920)/2,scale=${G.GW}:${G.GH},setsar=1[g];`
      : `[1:v]scale=${G.GW}:${G.GH},setsar=1[g];`;
    let fc = src + `[0:v][g]overlay=${G.GX}:${G.GY}:shortest=1[a];[a][2:v]overlay=0:0[v0];`;
    let last='v0';
    (b.caps||[]).forEach((c,i)=>{
      const idx=3+i, lbl='cap'+i, nxt='v'+(i+1);
      let f=`[${idx}:v]format=rgba,fade=t=in:st=${(c.at/FPS).toFixed(3)}:d=0.45:alpha=1`;
      if(c.out!=null) f+=`,fade=t=out:st=${(c.out/FPS).toFixed(3)}:d=0.35:alpha=1`;
      fc+=`${f}[${lbl}];[${last}][${lbl}]overlay=0:0[${nxt}];`;
      last=nxt;
    });
    fc+=`[${last}]format=yuv420p[vout]`;
    args.push('-filter_complex',fc,'-map','[vout]','-frames:v',String(n));
  }
  args.push('-r',String(FPS),'-c:v','libx264','-preset','slow','-crf','19',
    '-pix_fmt','yuv420p','-profile:v','high','-level','4.0','-movflags','+faststart', out);
  run(args, b.id);
  const kb=Math.round(fs.statSync(out).size/1024);
  console.log('  '+b.id.padEnd(9)+String(n).padStart(4)+'f  '+(n/FPS).toFixed(1)+'s  '+kb+'KB  '+b.shots.join(' + '));
  return {out, n};
}

(function main(){
 fs.mkdirSync(ROOT+'/clips',{recursive:true});
 fs.mkdirSync(ROOT+'/out',{recursive:true});
 console.log('cutting beats:');
 let total=0; const parts=[];
 for(const b of BEATS){ const r=cutBeat(b); total+=r.n; parts.push(r.out); }
 console.log('  total '+total+' frames = '+(total/FPS).toFixed(1)+'s');

 /* concat, and give it a silent AAC track: a video with no audio stream trips
    up some editors, and the music is Stephen's call, not mine */
 const list=ROOT+'/clips/_concat.txt';
 fs.writeFileSync(list, parts.map(p=>"file '"+p+"'").join('\n')+'\n');
 const mp4=ROOT+'/out/trailer_draft.mp4';
 run(['-v','error','-y','-f','concat','-safe','0','-i',list,
   '-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=48000',
   '-c:v','copy','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart', mp4],'concat');
 console.log('\ntrailer_draft.mp4  '+(fs.statSync(mp4).size/1048576).toFixed(1)+'MB');

 /* the microtrailer: 0:07 to 0:13, the trail climbing then dying. The only six
    seconds of the game that contain a whole story. */
 run(['-v','error','-y','-i',mp4,'-ss','7','-t','6','-c:v','libx264','-preset','slow',
   '-crf','19','-pix_fmt','yuv420p','-an','-movflags','+faststart', ROOT+'/out/microtrailer_6s.mp4'],'micro');
 console.log('microtrailer_6s.mp4  '+(fs.statSync(ROOT+'/out/microtrailer_6s.mp4').size/1048576).toFixed(2)+'MB');

 /* the poster frame Valve wants uploaded with the video: 4.3 says use 0:07 */
 run(['-v','error','-y','-i',mp4,'-ss','10.05','-frames:v','1', ROOT+'/out/poster_1920x1080.png'],'poster');
 console.log('poster_1920x1080.png   from 0:10.0, the Feast Trail reading 8 just before it banks (4.3 says use the 0:07 beat)');
 /* an alternative for Stephen to pick between: the cold open is the brightest,
    most legible frame the trailer has, and a poster frame is a thumbnail before
    it is anything else. The spec's choice is the story frame; this one is the
    one you can read at 300px wide. His call, not mine. */
 run(['-v','error','-y','-i',mp4,'-ss','1.7','-frames:v','1', ROOT+'/out/poster_alt_coldopen_1920x1080.png'],'poster-alt');
 console.log('poster_alt_coldopen_1920x1080.png  from 0:01.7, the Pike Place near miss (brighter, reads smaller)');
})();
