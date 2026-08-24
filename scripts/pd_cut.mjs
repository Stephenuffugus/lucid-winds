/* PUPPY DASH FRAME INTAKE — turn whatever the generator produced into
   rig-compliant sprite frames.
   Stephen generates LOOSE: any size, magenta (#FF00FF-ish) or near-solid
   background, single poses OR one image holding several poses of the same
   character (the consistency trick: one generation, one style). This tool does
   the rig so the artist never has to:
     key out the background · find each pose (connected components, because a
     generation sheet is never an even grid) · ONE scale per character taken
     from its tallest frame (so a slide stays low and wide relative to the run,
     which is the whole point of a shared rig) · plant every frame's contact
     point at bottom-centre y=488 on a 512 canvas · emit frames + a strip + the
     json · and a contact sheet with a flat black column at 58px, the smallest
     the animal is ever drawn, because a pose you cannot read in silhouette is
     not done.
   Usage:
     node scripts/pd_cut.mjs <inDir> <animal> <state> [outRoot]
   Every image in <inDir> is processed; multi-pose images are split, reading
   order left to right then top to bottom. Output:
     <outRoot>/art/characters/<animal>/<state>_NN.png (+ _sheet.png, .json)
     <outRoot>/art/characters/<animal>/<state>_contact.png   (LOOK AT THIS)
   Runs everything inside headless Chrome so it needs zero new dependencies. */
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const [inDir, animal, state, outRoot='.'] = process.argv.slice(2);
if(!inDir||!animal||!state){ console.log('usage: node scripts/pd_cut.mjs <inDir> <animal> <state> [outRoot]'); process.exit(2); }
const files=fs.readdirSync(inDir).filter(f=>/\.(png|jpe?g|webp)$/i.test(f)).sort();
if(!files.length){ console.log('no images in '+inDir); process.exit(2); }
const outDir=path.join(outRoot,'art','characters',animal);
fs.mkdirSync(outDir,{recursive:true});

const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.goto('about:blank');

const frames=[];
for(const f of files){
  const b64=fs.readFileSync(path.join(inDir,f)).toString('base64');
  const ext=f.split('.').pop().toLowerCase().replace('jpg','jpeg');
  const got=await p.evaluate(async(src)=>{
    const img=new Image(); img.src=src;
    await new Promise(r=>{img.onload=r;img.onerror=r;});
    const W=img.naturalWidth,H=img.naturalHeight;
    if(!W) return {err:'unreadable'};
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const cx=cv.getContext('2d',{willReadFrequently:true});
    cx.drawImage(img,0,0);
    const d=cx.getImageData(0,0,W,H), px=d.data;
    /* background = the dominant border colour (magenta or any near-solid) */
    const border=[];
    for(let x=0;x<W;x+=Math.max(1,W>>6)){border.push((0*W+x)*4,((H-1)*W+x)*4);}
    for(let y=0;y<H;y+=Math.max(1,H>>6)){border.push((y*W+0)*4,(y*W+W-1)*4);}
    let br_=0,bg=0,bb=0;
    border.forEach(i=>{br_+=px[i];bg+=px[i+1];bb+=px[i+2];});
    br_/=border.length;bg/=border.length;bb/=border.length;
    /* "magenta" is a FAMILY: pure #FF00FF and every generator's crimson-pink
       cousin (Stephen's sheets came back (209,12,124)). Red high, green near
       zero, blue anywhere above 60 — key it loose. */
    const isMagenta=br_>150&&bg<110&&bb>60&&(br_-bg)>90;
    const tol=isMagenta?120:38;   /* magenta keys loose; photo-ish bgs key tight */
    const bgMask=new Uint8Array(W*H);
    for(let i=0,j=0;i<px.length;i+=4,j++){
      const dr=px[i]-br_,dg=px[i+1]-bg,db=px[i+2]-bb;
      if(dr*dr+dg*dg+db*db<tol*tol) bgMask[j]=1;
    }
    /* flood from the borders so bg-coloured pixels INSIDE the art survive */
    const outside=new Uint8Array(W*H);
    const q=[];
    for(let x=0;x<W;x++){q.push(x,(H-1)*W+x);}
    for(let y=0;y<H;y++){q.push(y*W,y*W+W-1);}
    while(q.length){
      const i=q.pop();
      if(outside[i]||!bgMask[i])continue;
      outside[i]=1;
      const x=i%W,y=(i/W)|0;
      if(x>0)q.push(i-1); if(x<W-1)q.push(i+1);
      if(y>0)q.push(i-W); if(y<H-1)q.push(i+W);
    }
    for(let j=0;j<W*H;j++) if(outside[j]) px[j*4+3]=0;
    /* de-fringe: pixels touching transparency lose the bg tint */
    for(let j=0;j<W*H;j++){
      if(px[j*4+3]===0)continue;
      const x=j%W,y=(j/W)|0;
      const nearBg=(x>0&&px[(j-1)*4+3]===0)||(x<W-1&&px[(j+1)*4+3]===0)
        ||(y>0&&px[(j-W)*4+3]===0)||(y<H-1&&px[(j+W)*4+3]===0);
      if(nearBg&&isMagenta){
        const i4=j*4;
        if(px[i4]>140&&px[i4+2]>60&&px[i4+1]<130){const m=(px[i4]+px[i4+2])>>1;px[i4]=px[i4+1];px[i4+2]=px[i4+1];px[i4+1]=px[i4+1];px[i4]=m*0.3+px[i4]*0.7;}
      }
    }
    cx.putImageData(d,0,0);
    /* connected components over the alpha = the poses on the sheet.
       lab[] remembers which component owns each pixel so a crop can later be
       masked to ITS component — a rectangle crop otherwise smuggles in
       whatever floats inside the bbox (a caption "16" above a tail). */
    const seen=new Uint8Array(W*H), comps=[], lab=new Int32Array(W*H).fill(-1);
    for(let j=0;j<W*H;j++){
      if(seen[j]||px[j*4+3]===0)continue;
      const id=comps.length;
      let minx=W,miny=H,maxx=0,maxy=0,n=0,nWhite=0;
      const st=[j];seen[j]=1;
      while(st.length){
        const i=st.pop(),x=i%W,y=(i/W)|0;n++;lab[i]=id;
        const i4=i*4,r=px[i4],g=px[i4+1],b=px[i4+2];
        if(r>190&&g>190&&b>190&&Math.max(r,g,b)-Math.min(r,g,b)<42)nWhite++;
        if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;
        const nb=[];
        if(x>0)nb.push(i-1);if(x<W-1)nb.push(i+1);
        if(y>0)nb.push(i-W);if(y<H-1)nb.push(i+W);
        /* 8-connect + a 2px bridge so an ear dot stays with its head */
        if(x>0&&y>0)nb.push(i-W-1);if(x<W-1&&y>0)nb.push(i-W+1);
        if(x>0&&y<H-1)nb.push(i+W-1);if(x<W-1&&y<H-1)nb.push(i+W+1);
        for(const k of nb){ if(!seen[k]&&px[k*4+3]!==0){seen[k]=1;st.push(k);} }
      }
      comps.push({id,minx,miny,maxx,maxy,n,nWhite});
    }
    /* generation sheets carry baked-in white captions ("PUPPY DASH — SHEET 1
       OF 4", row labels). A component that is mostly near-white pixels is
       text, not art — the puppy is golden, the obstacles are saturated. The
       cone's white band and the cream belly are fractions of their component
       so they sail under the threshold. */
    let textDropped=0;
    const inked=comps.filter(c=>{
      if(c.n>=200&&c.nWhite/c.n>0.70){textDropped++;return false;}
      return true;
    });
    /* keep real poses, drop crumbs; merge overlapping boxes (loose parts) */
    const big=inked.filter(c=>c.n>W*H*0.002);
    big.sort((a,b)=>a.n-b.n);
    const merged=[];
    for(const c of big){
      let hit=null;
      for(const m of merged){
        const ox=Math.max(0,Math.min(c.maxx,m.maxx)-Math.max(c.minx,m.minx));
        const oy=Math.max(0,Math.min(c.maxy,m.maxy)-Math.max(c.miny,m.miny));
        if(ox>0&&oy>0){hit=m;break;}
      }
      if(hit){hit.minx=Math.min(hit.minx,c.minx);hit.maxx=Math.max(hit.maxx,c.maxx);
        hit.miny=Math.min(hit.miny,c.miny);hit.maxy=Math.max(hit.maxy,c.maxy);
        hit.ids.push(c.id);}
      else merged.push({...c,ids:[c.id]});
    }
    /* rows by clustering, not a fixed band count: a sheet can have 3 rows or
       4, and a tail poking above its row must not promote the pose a row up.
       Cluster on centre-y with half the median component height as the gap. */
    const hs=merged.map(c=>c.maxy-c.miny+1).sort((a,b)=>a-b);
    const medH=hs[hs.length>>1]||1;
    merged.forEach(c=>c.cy=(c.miny+c.maxy)/2);
    merged.sort((a,b)=>a.cy-b.cy);
    let row=0,lastCy=-1e9;
    merged.forEach(c=>{ if(c.cy-lastCy>medH*0.55)row++; c.row=row; lastCy=c.cy; });
    /* within a row, a small blob hugging a big one is baked-in FX (the slide's
       dust puff) — absorb it. Real poses are comparable sizes and far apart. */
    for(const r of new Set(merged.map(c=>c.row))){
      const rc=merged.filter(c=>c.row===r).sort((a,b)=>a.minx-b.minx);
      for(let i=rc.length-1;i>0;i--){
        const a=rc[i-1],b=rc[i];
        const gap=b.minx-a.maxx;
        if(gap<W*0.03&&Math.min(a.n,b.n)<0.25*Math.max(a.n,b.n)){
          a.minx=Math.min(a.minx,b.minx);a.maxx=Math.max(a.maxx,b.maxx);
          a.miny=Math.min(a.miny,b.miny);a.maxy=Math.max(a.maxy,b.maxy);
          a.n+=b.n;a.ids.push(...b.ids);b.dead=1;rc.splice(i,1);
        }
      }
    }
    const alive=merged.filter(c=>!c.dead);
    alive.sort((a,b)=>a.row-b.row||a.minx-b.minx);
    merged.length=0;alive.forEach(c=>merged.push(c));
    const out=[];
    for(const m of merged){
      const w=m.maxx-m.minx+1,h=m.maxy-m.miny+1;
      const c2=document.createElement('canvas');c2.width=w;c2.height=h;
      const g2=c2.getContext('2d',{willReadFrequently:true});
      g2.drawImage(cv,m.minx,m.miny,w,h,0,0,w,h);
      /* mask the rectangle to THIS pose's components: no stowaway captions,
         no slice of the neighbouring pose poking into an overlapping bbox */
      const mine=new Set(m.ids);
      const cd=g2.getImageData(0,0,w,h),cp=cd.data;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const k=(y*w+x)*4;
        if(cp[k+3]!==0&&!mine.has(lab[(m.miny+y)*W+(m.minx+x)]))cp[k+3]=0;
      }
      g2.putImageData(cd,0,0);
      out.push({png:c2.toDataURL('image/png'),w,h});
    }
    return {poses:out,keyed:isMagenta?'magenta':'border',bgRGB:[br_|0,bg|0,bb|0],textDropped};
  },`data:image/${ext};base64,${b64}`);
  if(got.err){console.log('  !! '+f+': '+got.err);continue;}
  console.log('  '+f+': '+got.poses.length+' pose(s), key='+got.keyed+(got.textDropped?', dropped '+got.textDropped+' text component(s)':''));
  got.poses.forEach(pose=>frames.push(pose));
}
if(!frames.length){console.log('nothing survived the cut');await br.close();process.exit(1);}

/* ONE scale per character-state batch: from the tallest frame to 76% of 512 */
const tall=Math.max(...frames.map(f=>f.h));
const scale=(512*0.76)/tall;
console.log('frames: '+frames.length+'  tallest '+tall+'px  scale '+scale.toFixed(3));
const CONTACT=488;
const finals=[];
for(let i=0;i<frames.length;i++){
  const fr=frames[i];
  const out=await p.evaluate(async(src,scale,CONTACT)=>{
    const img=new Image();img.src=src;
    await new Promise(r=>{img.onload=r;});
    const w=Math.round(img.width*scale),h=Math.round(img.height*scale);
    const cv=document.createElement('canvas');cv.width=512;cv.height=512;
    const cx=cv.getContext('2d');
    cx.imageSmoothingQuality='high';
    cx.drawImage(img,Math.round((512-w)/2),CONTACT-h,w,h);
    return cv.toDataURL('image/png');
  },fr.png,scale,CONTACT);
  const name=state+'_'+String(i+1).padStart(2,'0')+'.png';
  fs.writeFileSync(path.join(outDir,name),Buffer.from(out.split(',')[1],'base64'));
  finals.push(name);
}
/* the strip + json */
const strip=await p.evaluate(async(srcs)=>{
  const imgs=await Promise.all(srcs.map(s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;})));
  const cv=document.createElement('canvas');cv.width=512*imgs.length;cv.height=512;
  const cx=cv.getContext('2d');
  imgs.forEach((im,i)=>cx.drawImage(im,i*512,0));
  return cv.toDataURL('image/png');
},finals.map(n=>'data:image/png;base64,'+fs.readFileSync(path.join(outDir,n)).toString('base64')));
fs.writeFileSync(path.join(outDir,state+'_sheet.png'),Buffer.from(strip.split(',')[1],'base64'));
fs.writeFileSync(path.join(outDir,state+'.json'),JSON.stringify({frameWidth:512,frameHeight:512,frames:finals.length,fps:12},null,2));
/* the contact sheet: real sizes + the flat black 58px column */
const contact=await p.evaluate(async(srcs)=>{
  const imgs=await Promise.all(srcs.map(s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;})));
  const sizes=[140,58];
  const cv=document.createElement('canvas');
  cv.width=40+imgs.length*150; cv.height=40+sizes.length*160+60;
  const cx=cv.getContext('2d');
  cx.fillStyle='#6fce5b';cx.fillRect(0,0,cv.width,cv.height);
  imgs.forEach((im,i)=>{
    sizes.forEach((sz,r)=>{ cx.drawImage(im,20+i*150+(140-sz)/2,20+r*160+(140-sz),sz,sz); });
    /* silhouette row: flat black at 58px, the readability law */
    const c2=document.createElement('canvas');c2.width=58;c2.height=58;
    const x2=c2.getContext('2d');
    x2.drawImage(im,0,0,58,58);
    x2.globalCompositeOperation='source-in';x2.fillStyle='#000';x2.fillRect(0,0,58,58);
    cx.drawImage(c2,20+i*150+41,20+sizes.length*160);
  });
  return cv.toDataURL('image/png');
},finals.map(n=>'data:image/png;base64,'+fs.readFileSync(path.join(outDir,n)).toString('base64')));
fs.writeFileSync(path.join(outDir,state+'_contact.png'),Buffer.from(contact.split(',')[1],'base64'));
console.log('wrote '+finals.length+' frames + '+state+'_sheet.png + '+state+'.json + '+state+'_contact.png -> '+outDir);
await br.close();
