/* Profile one card: row/column brightness + orangeness to locate the painted
   frame and the black nameplate band. */
import puppeteer from "puppeteer";
import fs from "fs";
const f=process.argv[2]||"/workspaces/lucid-winds/satellites/flock-the-world/art/card/mode_contractor.webp";
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const b64=fs.readFileSync(f).toString("base64");
const out=await p.evaluate(async b64=>{
  const img=new Image();img.src="data:image/webp;base64,"+b64;await img.decode();
  const c=document.createElement("canvas");c.width=img.width;c.height=img.height;
  const x=c.getContext("2d");x.drawImage(img,0,0);
  const d=x.getImageData(0,0,c.width,c.height).data;
  const rowStat=y=>{let lum=0,orange=0;for(let xx=0;xx<c.width;xx++){
    const i=(y*c.width+xx)*4,r=d[i],g=d[i+1],b=d[i+2];
    lum+=(r+g+b)/3; if(r>140&&g>60&&g<180&&b<90)orange++;}
    return[Math.round(lum/c.width),Math.round(100*orange/c.width)];};
  const colStat=xx=>{let lum=0,orange=0;for(let y=0;y<c.height;y++){
    const i=(y*c.width+xx)*4,r=d[i],g=d[i+1],b=d[i+2];
    lum+=(r+g+b)/3; if(r>140&&g>60&&g<180&&b<90)orange++;}
    return[Math.round(lum/c.height),Math.round(100*orange/c.height)];};
  const rows=[],cols=[];
  for(let y=0;y<c.height;y+=6)rows.push([y,...rowStat(y)]);
  for(let xx=0;xx<c.width;xx+=6)cols.push([xx,...colStat(xx)]);
  return{w:c.width,h:c.height,rows,cols};
},b64);
await br.close();
console.log("size",out.w,"x",out.h);
console.log("ROWS y lum orange%:");console.log(out.rows.map(r=>r.join(",")).join("  "));
console.log("COLS x lum orange%:");console.log(out.cols.map(r=>r.join(",")).join("  "));
