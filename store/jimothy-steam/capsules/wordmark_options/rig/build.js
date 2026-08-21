/* Wordmark explorations for Jumping Jimothy.

   Stephen's note: the green "Jimothy" feels cheap; he wants a warmer font,
   "something more unique with maybe the J being a raccoon tail". These are
   OPTIONS, not a decision. Nothing here touches capsules/out/ — the shipped
   capsule set is final and this writes to its own folder.

   Every option is composited onto the REAL main capsule background at the real
   sizes, because the only question that matters is how it holds up in place:
     1232x706  main capsule
     462x174   small capsule — the deal breaker. If the full name does not
               survive here it does not matter how good it looks big.
   Palette is the gold #c8a84b / cream #e8dcc8 family against the dark rainy
   city, per the brief. Not the sage green.
   ⛔ Constructed type and geometry. Nothing here is hand drawn or hand painted. */
const puppeteer=require('/workspaces/lucid-winds/node_modules/puppeteer');
const fs=require('fs'), path=require('path'), http=require('http');
const {tailSVG, SPINE_FULL, SPINE_HOOK}=require('./tail.js');
const ROOT='/workspaces/lucid-winds';
const HERE=path.join(__dirname,'..');
const PORT=8951, BASE='http://localhost:'+PORT;
const OUT=HERE; fs.mkdirSync(OUT,{recursive:true});

const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png',
 '.jpg':'image/jpeg','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const clean=decodeURIComponent(req.url.split('?')[0]);
 const fp=path.normalize(path.join(ROOT,clean));
 if(!fp.startsWith(ROOT)){res.writeHead(403);res.end();return;}
 fs.readFile(fp,(e,buf)=>{ if(e){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream',
   'Access-Control-Allow-Origin':'*'}); res.end(buf); });
});

const F=n=>`${BASE}/store/jimothy-steam/capsules/wordmark_options/fonts/${n}.woff2`;
const FONTCSS=`
@font-face{font-family:'Baloo';src:url('${F('baloo2-800')}') format('woff2');font-weight:800}
@font-face{font-family:'Bree';src:url('${F('bree')}') format('woff2')}
@font-face{font-family:'AlfaSlab';src:url('${F('alfaslab')}') format('woff2')}
@font-face{font-family:'Chewy';src:url('${F('chewy')}') format('woff2')}
@font-face{font-family:'Lilita';src:url('${F('lilita')}') format('woff2')}`;

const GOLD='#c8a84b', CREAM='#e8dcc8', DEEP='#1b1409', AMBER='#e8b957';

/* ---- the tail-J as a standalone inline SVG, sized to a cap height ---- */
function tailMark(capPx, opts){
  const t=tailSVG(Object.assign({id:opts.id, dark:opts.dark||'#4a3venture'}, opts));
  return '';
}
/* Place the tail like a letter, not like a picture. The spine box runs y=0 at
   cap height to y=100 at the baseline, with the curl allowed down to 118. So:
   render at height = cap * 1.18, then drop it by the descender with a negative
   vertical-align, and the mark sits on the same baseline as "imothy". */
function tailSvgTag(fontPx, o){
  const CAP=0.72;                        // cap height as a fraction of font size, near enough for both faces
  const cap=fontPx*CAP;
  const h=cap*1.18, w=h*(100/118);
  const drop=h*(18/118);
  return `<svg class="tail" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="0 0 100 118"
      preserveAspectRatio="xMidYMid meet"
      style="vertical-align:${(-drop).toFixed(1)}px;${o.style||''}">`+
      `<defs>${tailSVG(o).defs}</defs>${tailSVG(o).body}</svg>`;
}

/* ---------------- the six options ---------------- */
/* each returns the wordmark BLOCK html for a given base size s (px of cap height) */
const OPTIONS=[
{ n:1, name:'Amber Fredoka',
  why:'The smallest possible change: the shape you already ship, in the gold and cream family instead of the sage green. If the green was the only problem, this is the answer and nothing else has to move.',
  html:s=>`<div class="opt o1">
    <div class="pre" style="font-size:${s*0.40}px">Jumping</div>
    <div class="main" style="font-size:${s}px">Jimothy</div></div>`,
  css:s=>`.o1 .pre{font-family:'Fredoka';font-weight:700;color:${GOLD};letter-spacing:${s*0.075}px;
      text-transform:uppercase;text-shadow:0 ${s*0.018}px 0 ${DEEP},0 2px 12px rgba(0,0,0,.9)}
    .o1 .main{font-family:'Fredoka';font-weight:800;color:${CREAM};letter-spacing:${s*0.005}px;line-height:.96;
      text-shadow:0 ${s*0.055}px 0 ${DEEP}, 0 0 ${s*0.44}px rgba(232,185,87,.34), 0 3px 16px rgba(0,0,0,.92)}`},

{ n:2, name:'Baloo Heavy',
  why:'Same rounded family of shapes but a great deal more weight, so the name holds its ground on a busy capsule and thickens up rather than thinning out when it is scaled down.',
  html:s=>`<div class="opt o2">
    <div class="pre" style="font-size:${s*0.38}px">Jumping</div>
    <div class="main" style="font-size:${s*1.02}px">Jimothy</div></div>`,
  css:s=>`.o2 .pre{font-family:'Baloo';font-weight:800;color:${GOLD};letter-spacing:${s*0.10}px;
      text-transform:uppercase;text-shadow:0 ${s*0.016}px 0 ${DEEP},0 2px 12px rgba(0,0,0,.9)}
    .o2 .main{font-family:'Baloo';font-weight:800;color:${AMBER};line-height:.94;
      -webkit-text-stroke:${s*0.030}px ${DEEP};paint-order:stroke fill;
      text-shadow:0 ${s*0.055}px 0 ${DEEP}, 0 0 ${s*0.40}px rgba(232,185,87,.34), 0 3px 16px rgba(0,0,0,.92)}`},

{ n:3, name:'Storybook Slab',
  why:'The warm storybook direction. A slab serif reads older and friendlier than a geometric round, and the flat serifs give the small capsule something to hold on to.',
  html:s=>`<div class="opt o3">
    <div class="pre" style="font-size:${s*0.34}px">Jumping</div>
    <div class="main" style="font-size:${s*0.94}px">Jimothy</div></div>`,
  css:s=>`.o3 .pre{font-family:'Bree';color:${GOLD};letter-spacing:${s*0.12}px;text-transform:uppercase;
      text-shadow:0 ${s*0.016}px 0 ${DEEP},0 2px 12px rgba(0,0,0,.9)}
    .o3 .main{font-family:'AlfaSlab';color:${CREAM};line-height:.98;letter-spacing:${s*0.004}px;
      -webkit-text-stroke:${s*0.022}px ${DEEP};paint-order:stroke fill;
      text-shadow:0 ${s*0.048}px 0 ${DEEP}, 0 0 ${s*0.40}px rgba(200,168,75,.30), 0 3px 16px rgba(0,0,0,.92)}`},

{ n:4, name:'Tail J, full',
  why:'The brief taken literally: the whole J is a ringed raccoon tail, full cap height, hooking at the baseline and curling back the way it does in the hero art. The most distinctive of the six and the one with the most to lose when the capsule is scaled down.',
  html:s=>`<div class="opt o4">
    <div class="pre" style="font-size:${s*0.36}px">Jumping</div>
    <div class="main" style="font-size:${s*0.98}px">${tailSvgTag(s*0.98,{id:'t4',spine:SPINE_FULL,
        w0:15.2,w1:7.0,bands:6,light:'#f3e5c2',dark:'#7a5430',keyline:'#150e07',kw:3.2,seed:11,soft:0.5,bandEdge:1})}<span class="rest">imothy</span></div></div>`,
  css:s=>`.o4 .pre{font-family:'Baloo';font-weight:800;color:${GOLD};letter-spacing:${s*0.10}px;
      text-transform:uppercase;text-shadow:0 ${s*0.016}px 0 ${DEEP},0 2px 12px rgba(0,0,0,.9)}
    .o4 .main{line-height:1.0;white-space:nowrap}
    .o4 .tail{filter:drop-shadow(0 ${s*0.03}px ${s*0.05}px rgba(0,0,0,.85));margin-right:${s*0.005}px}
    .o4 .rest{font-family:'Baloo';font-weight:800;color:${CREAM};font-size:${s*0.98}px;
      -webkit-text-stroke:${s*0.028}px ${DEEP};paint-order:stroke fill;
      text-shadow:0 ${s*0.052}px 0 ${DEEP}, 0 3px 16px rgba(0,0,0,.92)}`},

{ n:5, name:'Tail J, quiet',
  why:'A J first and a tail second. The stem is an ordinary letter weight and only the hook carries the rings, so the word still reads as a word at thumbnail size and the joke rewards anyone who looks closer.',
  html:s=>`<div class="opt o5">
    <div class="pre" style="font-size:${s*0.36}px">Jumping</div>
    <div class="main" style="font-size:${s*0.98}px">${tailSvgTag(s*0.98,{id:'t5',spine:SPINE_HOOK,
        w0:11.6,w1:7.2,bands:4,light:'#f1e1bd',dark:'#7a5430',keyline:'#150e07',kw:2.6,seed:23,tufts:false,soft:0.5})}<span class="rest">imothy</span></div></div>`,
  css:s=>`.o5 .pre{font-family:'Fredoka';font-weight:700;color:${GOLD};letter-spacing:${s*0.085}px;
      text-transform:uppercase;text-shadow:0 ${s*0.016}px 0 ${DEEP},0 2px 12px rgba(0,0,0,.9)}
    .o5 .main{line-height:1.0;white-space:nowrap}
    .o5 .tail{filter:drop-shadow(0 ${s*0.03}px ${s*0.05}px rgba(0,0,0,.85))}
    .o5 .rest{font-family:'Fredoka';font-weight:800;color:${CREAM};font-size:${s*0.98}px;
      text-shadow:0 ${s*0.055}px 0 ${DEEP}, 0 0 ${s*0.40}px rgba(232,185,87,.30), 0 3px 16px rgba(0,0,0,.92)}`},

{ n:6, name:'Tail Swash',
  why:'The tail leaves the letters alone and sweeps under the whole name instead, as an underline. The word stays perfectly legible at any size and the raccoon still signs it.',
  html:s=>`<div class="opt o6">
    <div class="pre" style="font-size:${s*0.36}px">Jumping</div>
    <div class="main" style="font-size:${s*0.98}px">Jimothy</div>
    <div class="swash">${swashTag(s)}</div></div>`,
  css:s=>`.o6 .pre{font-family:'Lilita';color:${GOLD};letter-spacing:${s*0.11}px;text-transform:uppercase;
      text-shadow:0 ${s*0.016}px 0 ${DEEP},0 2px 12px rgba(0,0,0,.9)}
    .o6 .main{font-family:'Lilita';color:${CREAM};line-height:.96;letter-spacing:${s*0.012}px;
      -webkit-text-stroke:${s*0.020}px ${DEEP};paint-order:stroke fill;
      text-shadow:0 ${s*0.050}px 0 ${DEEP}, 0 0 ${s*0.40}px rgba(200,168,75,.30), 0 3px 16px rgba(0,0,0,.92)}
    .o6 .swash{margin-top:${-s*0.06}px;display:flex;justify-content:center;
      filter:drop-shadow(0 ${s*0.02}px ${s*0.04}px rgba(0,0,0,.8))}`}
];

/* the swash is the same generator with a nearly flat, wide spine */
function swashTag(s){
  /* ⛔ the first swash was a barber pole: even bands, even width, no curl, and
     it read as a striped bandage under the word. A tail tapers hard and ends in
     a curl, so give it both and cut the band count. */
  const SP=[[3,58],[20,52],[44,49],[68,51],[85,58],[93,70],[87,80],[75,80],[70,71],[75,66]];
  const t=tailSVG({id:'t6',spine:SP,w0:6.6,w1:2.4,bands:8,light:'#f1e1bd',dark:'#7a5430',
    keyline:'#150e07',kw:1.4,seed:31,soft:0.4});
  const w=s*2.42;
  return `<svg width="${w.toFixed(0)}" height="${(w*0.40).toFixed(0)}" viewBox="0 42 100 40"
    preserveAspectRatio="xMidYMid meet"><defs>${t.defs}</defs>${t.body}</svg>`;
}

/* ---------------- the page ---------------- */
const bg=BASE+'/satellites/stream-hop/assets/bg/zone-skyline.jpg';
const roon=BASE+'/satellites/stream-hop/assets/hero/idle.png';

function page(opt, W, H, showNum){
  /* type scales off capsule height exactly the way capsules/build.js does, so
     these sit at the same size the shipped set does */
  const s=Math.round(H*0.175);
  const small=(W<600);
  const sS=small?Math.round(H*0.235):s;
  const use=small?sS:s;
  return `<!doctype html><html><head><meta charset="utf-8">
  <link href="${BASE}/store/jimothy-steam/fonts/fonts.css" rel="stylesheet">
  <style>${FONTCSS}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden;background:#0b0f0b}
  .cap{position:relative;width:${W}px;height:${H}px;overflow:hidden}
  .bg{position:absolute;inset:0;background:url('${bg}') center 22%/cover no-repeat;filter:brightness(.62) saturate(1.05)}
  .vig{position:absolute;inset:0;background:
    radial-gradient(120% 90% at 72% 55%, rgba(0,0,0,0) 0%, rgba(6,9,5,.55) 60%, rgba(6,9,5,.9) 100%),
    linear-gradient(90deg, rgba(6,9,5,.92) 0%, rgba(6,9,5,.55) 45%, rgba(6,9,5,.1) 75%)}
  .roon{position:absolute;right:${Math.round(W*(small?0.02:0.045))}px;bottom:${Math.round(H*-0.02)}px;
    height:${Math.round(H*(small?1.0:0.92))}px;filter:drop-shadow(0 ${Math.round(H*0.02)}px ${Math.round(H*0.05)}px rgba(0,0,0,.75))}
  .block{position:absolute;left:${Math.round(W*0.055)}px;top:50%;transform:translateY(-50%);text-align:left}
  .opt{display:inline-block}
  .num{position:absolute;left:14px;top:10px;font-family:'Baloo';font-weight:800;
    font-size:${Math.round(H*0.16)}px;color:#c8a84b;opacity:.95;
    -webkit-text-stroke:3px #14100a;paint-order:stroke fill;z-index:9}
  ${opt.css(use)}
  </style></head><body><div class="cap">
    <div class="bg"></div><div class="vig"></div>
    <img class="roon" src="${roon}">
    <div class="block">${opt.html(use)}</div>
    ${showNum?`<div class="num">${opt.n}</div>`:''}
  </div></body></html>`;
}

const SIZES=[{w:1232,h:706,tag:'main_1232x706'},{w:462,h:174,tag:'small_462x174'}];

(async()=>{
 await new Promise(r=>server.listen(PORT,'127.0.0.1',r));
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
 const shoot=async(html,w,h,file)=>{
  const p=await b.newPage();
  const missing=[];
  p.on('requestfailed',r=>{ const t=(r.failure()||{}).errorText||''; if(t!=='net::ERR_ABORTED') missing.push(r.url()+' '+t); });
  p.on('response',r=>{ if(r.status()>=400) missing.push(r.url()+' HTTP '+r.status()); });
  await p.setViewport({width:w,height:h,deviceScaleFactor:1});
  await p.setContent(html,{waitUntil:'networkidle0',timeout:60000});
  await p.evaluate(()=>document.fonts?document.fonts.ready:0);
  await new Promise(r=>setTimeout(r,700));
  /* ⛔ fail LOUDLY: the capsule builder once shipped black wordmark-only art
     because every asset 404'd and networkidle0 was perfectly happy about it. */
  if(missing.length){ console.error('  '+file+': MISSING ASSETS, not writing:'); missing.forEach(u=>console.error('    '+u)); await p.close(); return false; }
  await p.screenshot({path:OUT+'/'+file});
  await p.close(); return true;
 };
 for(const o of OPTIONS){
  for(const s of SIZES){
   const ok=await shoot(page(o,s.w,s.h,true), s.w, s.h, `${o.n}_${o.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}_${s.tag}.png`);
   if(!ok) process.exitCode=1;
  }
  console.log('  option '+o.n+'  '+o.name);
 }
 fs.writeFileSync(OUT+'/_options.json', JSON.stringify(OPTIONS.map(o=>({n:o.n,name:o.name,why:o.why})),null,1));
 await b.close(); server.close();
})();
