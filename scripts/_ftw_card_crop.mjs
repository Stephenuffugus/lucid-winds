/* Crop INSIDE the painted card: past the orange frame (3.5% inset) and the
   black nameplate band the artist left for a title we never print
   (Stephen, Aug 24: "either we should use it or ill remake those images").
   Band detected per file from the bottom up; fixed 22% fallback if the
   detection returns nonsense. Originals: git history. */
import puppeteer from "puppeteer";
import fs from "fs";
const DIR="/workspaces/lucid-winds/satellites/flock-the-world/art/card";
const files=fs.readdirSync(DIR).filter(f=>f.endsWith(".webp"));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
for(const f of files){
  const b64=fs.readFileSync(`${DIR}/${f}`).toString("base64");
  const out=await p.evaluate(async b64=>{
    const img=new Image();img.src="data:image/webp;base64,"+b64;await img.decode();
    const W=img.width,H=img.height;
    const c=document.createElement("canvas");c.width=W;c.height=H;
    const x=c.getContext("2d");x.drawImage(img,0,0);
    const d=x.getImageData(0,0,W,H).data;
    const inset=Math.round(W*0.035);
    const rowLum=y=>{let s=0;for(let xx=inset;xx<W-inset;xx++){const i=(y*W+xx)*4;s+=(d[i]+d[i+1]+d[i+2])/3;}return s/(W-2*inset);};
    const rowOrange=y=>{let s=0;for(let xx=inset;xx<W-inset;xx++){const i=(y*W+xx)*4;if(d[i]>140&&d[i+1]>60&&d[i+1]<180&&d[i+2]<90)s++;}return s/(W-2*inset);};
    let bottom=H-1;
    while(bottom>H*0.55&&(rowLum(bottom)<48||rowOrange(bottom)>0.3))bottom--;
    let band=H-1-bottom;
    if(band<H*0.05||band>H*0.35)bottom=Math.round(H*(1-0.22));   /* fallback */
    const sx=inset,sy=inset,sw=W-2*inset,sh=(bottom-2)-inset;
    const c2=document.createElement("canvas");c2.width=sw;c2.height=sh;
    c2.getContext("2d").drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
    return{url:c2.toDataURL("image/webp",0.92),sw,sh,band,W,H};
  },b64);
  fs.writeFileSync(`${DIR}/${f}`,Buffer.from(out.url.split(",")[1],"base64"));
  console.log(`${f}: ${out.W}x${out.H} -> ${out.sw}x${out.sh} (band ${out.band}px, aspect ${(out.sw/out.sh).toFixed(2)})`);
}
await br.close();
