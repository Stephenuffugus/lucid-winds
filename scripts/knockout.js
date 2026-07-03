// Usage: node scripts/knockout.js <in.png> <out.png> [tolerance]
// Knocks a flat chroma-key magenta background out to transparent alpha.
const sharp=require('sharp');
const [,, inp, outp, tolArg]=process.argv;
const TOL=parseInt(tolArg||'70',10);
(async()=>{
  const img=sharp(inp).ensureAlpha();
  const {data,info}=await img.raw().toBuffer({resolveWithObject:true});
  const {width,height,channels}=info;
  let cleared=0;
  for(let i=0;i<data.length;i+=channels){
    const r=data[i],g=data[i+1],b=data[i+2];
    // magenta = high R, low G, high B
    if(r>255-TOL && g<TOL && b>255-TOL){ data[i+3]=0; cleared++; }
    else if(r>200 && g<TOL && b>200){ // soft edge: fade partial magenta
      data[i+3]=Math.min(data[i+3], g*3);
    }
  }
  await sharp(data,{raw:{width,height,channels}}).png().toFile(outp);
  console.log('knocked out',cleared,'px ->',outp,`(${width}x${height})`);
})().catch(e=>{console.error(e.message);process.exit(1)});
