/* Slice Stephen's 9remake.png sheet: detect magenta background, find the 8
   card rectangles (never assume an even grid), inset past the thin gold
   frame, write over the eight card names. */
import puppeteer from "puppeteer";
import fs from "fs";
const SRC="/workspaces/lucid-winds/assets/9remake.png";
const DIR="/workspaces/lucid-winds/satellites/flock-the-world/art/card";
/* position → filename (read off the sheet by content) */
const MAP=[["doctrine_glove","doctrine_fist","mode_contractor","mode_partnership"],
           ["mode_crisis","diff_easy","diff_standard","diff_hard"]];
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const b64=fs.readFileSync(SRC).toString("base64");
const cards=await p.evaluate(async b64=>{
  const img=new Image();img.src="data:image/png;base64,"+b64;await img.decode();
  const W=img.width,H=img.height;
  const c=document.createElement("canvas");c.width=W;c.height=H;
  const x=c.getContext("2d");x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H).data;
  const mag=i=>d[i]>190&&d[i+2]>190&&d[i+1]<130;
  /* column/row profiles: fraction of magenta */
  const colMag=[],rowMag=[];
  for(let xx=0;xx<W;xx++){let m=0;for(let y=0;y<H;y+=4)if(mag((y*W+xx)*4))m++;colMag.push(m/(H/4));}
  for(let y=0;y<H;y++){let m=0;for(let xx=0;xx<W;xx+=4)if(mag((y*W+xx)*4))m++;rowMag.push(m/(W/4));}
  const spans=prof=>{const out=[];let s=null;
    for(let i=0;i<prof.length;i++){const solid=prof[i]<0.5;
      if(solid&&s==null)s=i; if((!solid||i===prof.length-1)&&s!=null){if(i-s>40)out.push([s,i]);s=null;}}
    return out;};
  const cs=spans(colMag),rs=spans(rowMag);
  const out=[];
  for(let r=0;r<rs.length;r++)for(let cc=0;cc<cs.length;cc++){
    const[x0,x1]=cs[cc],[y0,y1]=rs[r];
    const w=x1-x0,h=y1-y0;
    const ix=Math.round(w*0.03),iy=Math.round(h*0.025);   /* past the thin gold frame */
    const sw=w-2*ix,sh=h-2*iy;
    const c2=document.createElement("canvas");c2.width=sw;c2.height=sh;
    c2.getContext("2d").drawImage(img,x0+ix,y0+iy,sw,sh,0,0,sw,sh);
    out.push({r,c:cc,w:sw,h:sh,url:c2.toDataURL("image/webp",0.92)});
  }
  return{cols:cs.length,rows:rs.length,sheet:[W,H],cards:out};
},b64);
await br.close();
console.log("sheet",cards.sheet,"grid",cards.rows,"x",cards.cols);
if(cards.rows!==2||cards.cols!==4){console.log("ABORT: expected 2x4");process.exit(1);}
for(const cd of cards.cards){
  const name=MAP[cd.r][cd.c];
  fs.writeFileSync(`${DIR}/${name}.webp`,Buffer.from(cd.url.split(",")[1],"base64"));
  console.log(`${name}: ${cd.w}x${cd.h} (aspect ${(cd.w/cd.h).toFixed(2)})`);
}
