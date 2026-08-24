/* Trim the transparent canvas margins off the FTW card art (the 420x420
   sources hold a portrait card at the left with dead transparent space
   beside it — Stephen: "box in a box with empty space"). Originals live in
   git history; this writes trimmed webp over the same names. */
import puppeteer from "puppeteer";
import fs from "fs";
const DIR="/workspaces/lucid-winds/satellites/flock-the-world/art/card";
const files=fs.readdirSync(DIR).filter(f=>f.endsWith(".webp"));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.goto("about:blank");
for(const f of files){
  const b64=fs.readFileSync(`${DIR}/${f}`).toString("base64");
  const out=await p.evaluate(async b64=>{
    const img=new Image();
    img.src="data:image/webp;base64,"+b64;
    await img.decode();
    const c=document.createElement("canvas");
    c.width=img.width;c.height=img.height;
    const x=c.getContext("2d");x.drawImage(img,0,0);
    const d=x.getImageData(0,0,c.width,c.height).data;
    let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
    for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){
      if(d[(y*c.width+xx)*4+3]>8){
        if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;
        if(y<minY)minY=y;if(y>maxY)maxY=y;
      }}
    if(maxX<0)return null;
    const w=maxX-minX+1,h=maxY-minY+1;
    const c2=document.createElement("canvas");
    c2.width=w;c2.height=h;
    c2.getContext("2d").drawImage(img,minX,minY,w,h,0,0,w,h);
    return {url:c2.toDataURL("image/webp",0.92),w,h,ow:img.width,oh:img.height};
  },b64);
  if(!out){console.log(f,"NO OPAQUE PIXELS, skipped");continue;}
  fs.writeFileSync(`${DIR}/${f}`,Buffer.from(out.url.split(",")[1],"base64"));
  console.log(`${f}: ${out.ow}x${out.oh} -> ${out.w}x${out.h} (aspect ${(out.w/out.h).toFixed(2)})`);
}
await br.close();
