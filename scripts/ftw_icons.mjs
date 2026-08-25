/* FTW PWA icons from the wordmark's own globe-in-lens mark (the O of WORLD).
   node scripts/ftw_icons.mjs  → icon-192/512, icon-maskable-512, play-icon-512
   in satellites/flock-the-world/. Maskable: only the central 80% is safe. */
import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
const OUT="satellites/flock-the-world/";
const BG="#05070b";
/* lens center + radius in the 900x450 wordmark (measured off the render) */
const CX=397, CY=309, R=85;
function page(size, markFrac){
  const d=size*markFrac;                      // clipped lens diameter on the tile
  const scale=d/(2*R);                        // px per wordmark px
  const w=900*scale, h=450*scale;
  const left=d/2-CX*scale, top=d/2-CY*scale;  // lens center -> wrapper center
  return `<!doctype html><meta charset="utf-8"><style>
  *{margin:0}body{width:${size}px;height:${size}px;overflow:hidden;background:
    radial-gradient(circle at 50% 46%, #101a2c 0%, ${BG} 70%)}
  .m{position:absolute;left:${(size-d)/2}px;top:${(size-d)/2}px;width:${d}px;height:${d}px;
     border-radius:50%;overflow:hidden;box-shadow:0 0 ${size*0.06}px #1b2c44}
  img{position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px}
  </style><div class="m"><img src="art/bg/wordmark.webp"></div>`;
}
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
async function shot(name,size,markFrac){
  await p.setViewport({width:size,height:size,deviceScaleFactor:1});
  writeFileSync(OUT+"_icon_tmp.html",page(size,markFrac));
  await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/_icon_tmp.html?v="+Math.random());
  await new Promise(r=>setTimeout(r,400));
  await p.screenshot({path:OUT+name});
  console.log("wrote",name);
}
await shot("icon-512.png",512,0.92);
await shot("icon-192.png",192,0.92);
await shot("icon-maskable-512.png",512,0.72);
await shot("play-icon-512.png",512,0.92);
await br.close();
