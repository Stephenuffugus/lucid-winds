/* A ringed raccoon tail, generated as SVG, shaped to do a letter J's job.

   Drawn from the game's own hero art (satellites/stream-hop/assets/hero/
   idle.png, enlarged and read): the tail already ends in a tight inward curl,
   which is a J hook. What makes it read as a raccoon rather than a stripey
   sausage is four things, and all four are in here:
     - it TAPERS. Thick where it leaves the body, thin into the curl.
     - the bands are PERPENDICULAR to the tail's direction, so they bend as it
       bends, and they CROWD as it tapers. Evenly spaced parallel stripes read
       as a barber pole.
     - the band edges are SOFT, not hard rules. In the art they are fur, feathered.
     - the silhouette is RAGGED. Fur tufts, not a smooth tube.
   ⛔ This is constructed geometry, not painting, and nothing here should ever
   be described as hand drawn. */

/* Catmull-Rom through the control points, sampled to a dense polyline, so the
   spine can be described by a handful of points and still bend smoothly. */
function spline(pts, steps){
  const out=[];
  const P=[pts[0], ...pts, pts[pts.length-1]];
  for(let i=0;i<P.length-3;i++){
    const [p0,p1,p2,p3]=[P[i],P[i+1],P[i+2],P[i+3]];
    for(let s=0;s<steps;s++){
      const t=s/steps, t2=t*t, t3=t2*t;
      out.push([
        0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
        0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
      ]);
    }
  }
  out.push(pts[pts.length-1]);
  return out;
}
function arclen(pl){ const d=[0]; for(let i=1;i<pl.length;i++){ const dx=pl[i][0]-pl[i-1][0], dy=pl[i][1]-pl[i-1][1];
  d.push(d[i-1]+Math.hypot(dx,dy)); } return d; }
/* deterministic jitter so a rebuild is identical */
function rng(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }

/* ⛔ THE FIRST PASS DREW A MUSICAL NOTE. The spine lived in a 0..140 box with
   no relationship to a letter, so the mark came out short, thin and floating
   above the baseline, and "Jimothy" read as "ɔimothy". A J is not a curl: it is
   a full cap height stem with a hook at the BASELINE. These spines live in a
   real letter box — y=0 is cap height, y=100 is the baseline, and the curl is
   allowed the descender below it, exactly where a J's tail goes anyway.
   The other half of the fix is weight and contrast: the tail in the hero art is
   FAT and its bands are near black against near cream. Thin low contrast rings
   turn to grey mush the moment the capsule is scaled down. */
const SPINE_FULL=[[72,2],[72,34],[71,62],[68,84],[57,101],[40,107],[24,101],[17,87],[23,75],[36,73],[43,81]];
/* a quieter version: an ordinary J stem whose HOOK alone is the tail */
const SPINE_HOOK=[[73,2],[73,36],[72,66],[69,88],[58,103],[42,108],[27,102],[21,90],[27,80],[39,79]];

function tailSVG(o){
  o=o||{};
  const spine=o.spine||SPINE_FULL;
  const w0=o.w0!=null?o.w0:15;      // half width at the base
  const w1=o.w1!=null?o.w1:5.0;     // half width at the tip
  const bands=o.bands||6;
  const dark=o.dark||'#3a2b1e';
  const light=o.light||'#efe0bd';
  const id=o.id||'t';
  const tufts=o.tufts!==false;
  const pl=spline(spine, 26);
  const L=arclen(pl), total=L[L.length-1];
  const R=rng(o.seed||7);

  /* half width along the spine: holds near full for the first third, then
     tapers hard into the curl, the way the reference does */
  const halfW=t=>{ const k=t<0.30?0:(t-0.30)/0.70; return w0+(w1-w0)*Math.pow(k,0.86); };
  const normalAt=i=>{ const a=pl[Math.max(0,i-1)], b=pl[Math.min(pl.length-1,i+1)];
    const dx=b[0]-a[0], dy=b[1]-a[1], m=Math.hypot(dx,dy)||1; return [-dy/m, dx/m]; };

  /* outline: one side out, the other side back, with fur tufts on the edge */
  const left=[], right=[];
  for(let i=0;i<pl.length;i++){
    const t=L[i]/total, n=normalAt(i);
    let w=halfW(t);
    let bump=0;
    if(tufts && i%9===0) bump=(0.5+R()*1.0)*(1-t*0.5);   // small outward fur flicks
    left.push([pl[i][0]+n[0]*(w+bump), pl[i][1]+n[1]*(w+bump)]);
    right.push([pl[i][0]-n[0]*(w+bump), pl[i][1]-n[1]*(w+bump)]);
  }
  const f=p=>p.map(q=>q[0].toFixed(2)+','+q[1].toFixed(2)).join(' L');
  const outline='M'+f(left)+' L'+f(right.slice().reverse())+' Z';

  /* bands: quads cut PERPENDICULAR to the spine, crowding as it tapers, drawn
     inside a clip of the outline so they take the silhouette's shape */
  let bandPaths='';
  const edges=[];
  for(let b=0;b<=bands;b++){ const t=Math.pow(b/bands, 1.24); edges.push(t); }  // crowd toward the tip
  for(let b=0;b<bands;b++){
    const t0=edges[b], t1=edges[b+1];
    if(b%2===0) continue;                      // every other gap is the dark ring
    const i0=L.findIndex(v=>v/total>=t0), i1=L.findIndex(v=>v/total>=t1);
    const seg=pl.slice(Math.max(0,i0), Math.max(1,i1)+1);
    if(seg.length<2) continue;
    const a=[], c=[];
    for(let i=0;i<seg.length;i++){
      const gi=Math.max(0,i0)+i, t=L[Math.min(gi,L.length-1)]/total, n=normalAt(Math.min(gi,pl.length-1));
      const w=halfW(t)+2.2;                    // overshoot: the clip trims it
      a.push([seg[i][0]+n[0]*w, seg[i][1]+n[1]*w]);
      c.push([seg[i][0]-n[0]*w, seg[i][1]-n[1]*w]);
    }
    bandPaths+=`<path d="M${f(a)} L${f(c.slice().reverse())} Z" fill="url(#${id}g)"/>`;
  }
  return {
    defs:`<clipPath id="${id}c"><path d="${outline}"/></clipPath>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${dark}" stop-opacity=".82"/>
      </linearGradient>
      <filter id="${id}s" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="${o.soft!=null?o.soft:0.45}"/></filter>`,
    /* base coat, then the soft edged rings on top, then the outline stroke */
    body:`<g>
      <path d="${outline}" fill="${light}"/>
      <g clip-path="url(#${id}c)" filter="url(#${id}s)">${bandPaths}</g>
      <path d="${outline}" fill="none" stroke="${o.keyline||'#221a12'}" stroke-width="${o.kw||2.2}"
            stroke-linejoin="round"/>
    </g>`,
    outline
  };
}
module.exports={tailSVG, SPINE_FULL, SPINE_HOOK};
