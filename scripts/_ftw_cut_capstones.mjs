/* Cut the four capstone icons from Stephen's assets/capstoneicons.png:
   2x2 on a magenta key. Key by COLOR (not flood fill - the enclosed-magenta
   lesson), defringe edges, trim to content, pad square, 320px webp. */
import puppeteer from "puppeteer";
import fs from "fs";
const SHEET="/workspaces/lucid-winds/assets/capstoneicons.png";
const OUT="/workspaces/lucid-winds/satellites/flock-the-world/art/tree";
const NAMES=[["caps_dep","caps_cap"],["caps_inf","caps_war"]]; /* row-major: lattice, vault / dial, gloves */
const b64=fs.readFileSync(SHEET).toString("base64");
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const results=await p.evaluate(async (b64,NAMES)=>{
  const img=new Image();img.src="data:image/png;base64,"+b64;await img.decode();
  const W=img.width,H=img.height,qw=W/2,qh=H/2;
  const out={};
  for(let ry=0;ry<2;ry++)for(let rx=0;rx<2;rx++){
    const c=document.createElement("canvas");c.width=qw;c.height=qh;
    const x=c.getContext("2d");x.drawImage(img,rx*qw,ry*qh,qw,qh,0,0,qw,qh);
    const d=x.getImageData(0,0,qw,qh),px=d.data;
    /* magenta key: high R, low G, high B. Soft threshold + defringe. */
    for(let i=0;i<px.length;i+=4){
      const r=px[i],g=px[i+1],b=px[i+2];
      const mag=Math.min(r,b)-g;              /* how magenta */
      if(mag>110&&r>150&&b>150){px[i+3]=0;}
      else if(mag>60&&r>120&&b>120){
        px[i+3]=Math.max(0,px[i+3]-(mag-60)*4);
        /* pull the fringe toward neutral so no pink halo survives */
        const avg=(r+g+b)/3;px[i]=avg;px[i+2]=avg;
      }
    }
    x.putImageData(d,0,0);
    /* content bbox */
    let x0=qw,y0=qh,x1=0,y1=0;
    for(let yy=0;yy<qh;yy++)for(let xx=0;xx<qw;xx++){
      if(px[(yy*qw+xx)*4+3]>10){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(yy<y0)y0=yy;if(yy>y1)y1=yy;}
    }
    const bw=x1-x0+1,bh=y1-y0+1,side=Math.max(bw,bh)*1.06;
    const oc=document.createElement("canvas");oc.width=320;oc.height=320;
    const ox=oc.getContext("2d");ox.imageSmoothingQuality="high";
    const k=320/side;
    ox.drawImage(c,x0-(side-bw)/2,y0-(side-bh)/2,side,side,0,0,320,320);
    out[NAMES[ry][rx]]={url:oc.toDataURL("image/webp",0.9),bbox:[x0,y0,bw,bh]};
  }
  return out;
},b64,NAMES);
for(const n in results){
  fs.writeFileSync(`${OUT}/${n}.webp`,Buffer.from(results[n].url.split(",")[1],"base64"));
  console.log(n,results[n].bbox,fs.statSync(`${OUT}/${n}.webp`).size+"b");
}
await br.close();
