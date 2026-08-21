/* Steam capsule builder for Jumping Jimothy.
   Composes the STORE art out of assets that already exist - the city backdrops,
   the hero poses, the game's own fonts and palette. Nothing new is generated;
   this is layout, at Valve's exact pixel sizes.
   Run:  node store/jimothy-steam/capsules/build.js     (needs a static server on 8942) */
const puppeteer=require('/workspaces/lucid-winds/node_modules/puppeteer');
const BASE='http://localhost:8942';
const OUT=__dirname+'/out';
require('fs').mkdirSync(OUT,{recursive:true});

/* ⛔ 2026-08-21: the script SILENTLY produced black wordmark-only capsules when
   nothing served 8942 (every asset 404'd; networkidle0 was perfectly happy).
   Serve the repo in-process, same as shots_costume.js, so the script cannot
   run without its art again. */
const _path=require('path'), _fs=require('fs'), _http=require('http');
const _ROOT='/workspaces/lucid-winds';
const _MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json','.woff2':'font/woff2',
 '.woff':'font/woff','.ttf':'font/ttf','.svg':'image/svg+xml','.webp':'image/webp'};
const _server=_http.createServer((req,res)=>{
 const clean=decodeURIComponent(req.url.split('?')[0]);
 let fp=_path.normalize(_path.join(_ROOT,clean));
 if(!fp.startsWith(_ROOT)){res.writeHead(403);res.end();return;}
 _fs.readFile(fp,(e,buf)=>{ if(e){res.writeHead(404);res.end();return;}
  /* ACAO required: pages are built via setContent (opaque origin) and browsers
     block cross-origin FONT loads without it - images load, fonts ERR_FAILED. */
  res.writeHead(200,{'Content-Type':_MIME[_path.extname(fp)]||'application/octet-stream',
   'Access-Control-Allow-Origin':'*'});res.end(buf); });
});

/* ⛔⛔ TWO SETS, AND THE BIG ONES ARE THE ONES YOU UPLOAD (2026-08-01).
   Valve's Store Assets page moved to double-resolution capsules years ago. The
   four store capsules below ship at the CURRENT required sizes; the legacy
   half-size versions are kept only because preflight.js and a lot of old notes
   still name them, and because they are free to produce. If Steamworks ever
   shows you a different number, Steamworks wins.
     small  462x174   (was 231x87)
     header 920x430   (was 460x215)
     main   1232x706  (was 616x353)
     vertical 748x896 (was 374x448)
   Library assets (600x900 / 3840x1240 / 1280x720 logo) and the page background
   have not changed. */
const SIZES=[
 {f:'small_capsule',      w:462,  h:174,  mode:'mark'},
 {f:'header_capsule',     w:920,  h:430,  mode:'wide'},
 {f:'main_capsule',       w:1232, h:706,  mode:'wide'},
 {f:'vertical_capsule',   w:748,  h:896,  mode:'tall'},
 {f:'small_capsule',      w:231,  h:87,   mode:'mark'},
 {f:'header_capsule',     w:460,  h:215,  mode:'wide'},
 {f:'main_capsule',       w:616,  h:353,  mode:'wide'},
 {f:'vertical_capsule',   w:374,  h:448,  mode:'tall'},
 {f:'library_capsule',    w:600,  h:900,  mode:'tall'},
 {f:'library_hero',       w:3840, h:1240, mode:'hero'},
 {f:'page_background',    w:1438, h:810,  mode:'bg'},
];

function page(w,h,mode){
 const bg=BASE+'/satellites/stream-hop/assets/bg/zone-skyline.jpg';
 const POSE=process.env.POSE||'idle';
 const roon=BASE+'/satellites/stream-hop/assets/hero/'+POSE+'.png';
 // type scales off the capsule height so every size reads the same
 const big=mode==='mark'?Math.round(h*0.235):mode==='tall'?Math.round(h*0.105):Math.round(h*0.175);
 const small=Math.round(big*0.46);
 const tall=(mode==='tall');
 return `<!doctype html><html><head><meta charset="utf-8">
 <link href="${BASE}/store/jimothy-steam/fonts/fonts.css" rel="stylesheet">
 <style>
 *{margin:0;padding:0;box-sizing:border-box}
 html,body{width:${w}px;height:${h}px;overflow:hidden;background:#0b0f0b}
 .cap{position:relative;width:${w}px;height:${h}px;overflow:hidden}
 .bg{position:absolute;inset:0;background:url('${bg}') center 22% / cover no-repeat;
     filter:brightness(.62) saturate(1.05)}
 .vig{position:absolute;inset:0;background:
   radial-gradient(120% 90% at ${tall?'50% 30%':'72% 55%'}, rgba(0,0,0,0) 0%, rgba(6,9,5,.55) 60%, rgba(6,9,5,.9) 100%),
   linear-gradient(${tall?'180deg':'90deg'}, rgba(6,9,5,.92) 0%, rgba(6,9,5,.55) 45%, rgba(6,9,5,.1) 75%)}
 .roon{position:absolute;${tall?`left:50%;transform:translateX(-50%);bottom:${Math.round(h*0.06)}px;height:${Math.round(h*(mode==='mark'?0.72:0.46))}px`
        :`right:${Math.round(w*(mode==='mark'?0.02:0.045))}px;bottom:${Math.round(h*-0.02)}px;height:${Math.round(h*(mode==='mark'?1.0:0.92))}px`};
   filter:drop-shadow(0 ${Math.round(h*0.02)}px ${Math.round(h*0.05)}px rgba(0,0,0,.75))}
 .type{position:absolute;${tall?`left:0;right:0;top:${Math.round(h*0.07)}px;text-align:center`
        :`left:${Math.round(w*0.055)}px;top:50%;transform:translateY(-50%);text-align:left`};
   font-family:'Fredoka','Nunito',system-ui,sans-serif;line-height:.98}
 .l1{font-size:${small}px;font-weight:700;letter-spacing:${Math.max(1,Math.round(small*0.10))}px;
     color:#c8a84b;text-transform:uppercase;text-shadow:0 2px 0 #14200f,0 2px 12px rgba(0,0,0,.9)}
 .l2{font-size:${big}px;font-weight:800;color:#8ec964;letter-spacing:${Math.round(big*0.01)}px;
     text-shadow:0 ${Math.round(big*0.055)}px 0 #14200f, 0 0 ${Math.round(big*0.5)}px rgba(122,179,86,.38), 0 3px 16px rgba(0,0,0,.9)}
 .tag{margin-top:${Math.round(h*0.035)}px;font-family:'Nunito',system-ui,sans-serif;font-weight:700;
      font-size:${Math.round(small*0.72)}px;color:#e8dcc8;opacity:.9;letter-spacing:.4px;
      text-shadow:0 2px 8px rgba(0,0,0,.95)}
 </style></head><body><div class="cap">
   <div class="bg"></div><div class="vig"></div>
   ${mode==='bg'?'':`<img class="roon" src="${roon}">`}
   ${(mode==='bg'||mode==='hero')?'':`<div class="type">
     <div class="l1">Jumping</div>
     <div class="l2">Jimothy</div>
     ${''/* tagline removed 2026-08-21: Steamworks upload attestation requires no
        text on capsules beyond the name/logo, and "The Little Nugget" reads as
        marketing copy under that rule. It lives on in the title screen ribbon. */}
   </div>`}
 </div></body></html>`;
}

(async()=>{
 await new Promise(r=>_server.listen(8942,'127.0.0.1',r));
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 for(const s of SIZES){
  const p=await b.newPage();
  /* ⛔ fail LOUDLY on a missing asset instead of composing a black capsule */
  let missing=[];
  /* ERR_ABORTED is Chrome cancelling a duplicate font fetch (fonts.css declares
     one file per weight) - benign. Anything else failed for real. */
  p.on('requestfailed',r=>{ const t=(r.failure()||{}).errorText||'';
    if(t!=='net::ERR_ABORTED') missing.push(r.url()+' ('+t+')'); });
  p.on('response',r=>{ if(r.status()>=400) missing.push(r.url()+' (HTTP '+r.status()+')'); });
  await p.setViewport({width:s.w,height:s.h,deviceScaleFactor:1});
  await p.setContent(page(s.w,s.h,s.mode),{waitUntil:'networkidle0',timeout:60000});
  await new Promise(r=>setTimeout(r,900));
  if(missing.length){ console.error('  '+s.f+' '+s.w+'x'+s.h+': MISSING ASSETS, not writing:'); missing.forEach(u=>console.error('    '+u)); await p.close(); continue; }
  const tag=process.env.POSE?('_'+process.env.POSE):'';
  await p.screenshot({path:`${OUT}/${s.f}_${s.w}x${s.h}${tag}.png`});
  console.log('  wrote '+s.f+'  '+s.w+'x'+s.h);
  await p.close();
 }
 await b.close();
 _server.close();
})();
