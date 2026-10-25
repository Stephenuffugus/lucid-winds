// node tools/slice-3d-tests/fix/fwrun_h.js [name]   fail watch for row [24] (Part H): each broken copy of index.html is
// written as satellites/slice-3d/index-fw.html (it parses: checked), row [24] runs against it alone (runh.mjs) and must
// go RED on its own check; the copy is deleted after. Serve the repo root on 8777. One browser at a time.
const fs = require('fs'), path = require('path'), vm = require('vm'), { spawnSync } = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d', SRC = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const M = [
  ['the canvas on the ground (the rabbit float)', [['return propSprite(set, name, x, yFoot-(1-p.foot)*h, z, h);', 'return propSprite(set, name, x, yFoot, z, h);']], 'every painted tree stands its painted foot'],
  ['GRASS_TOP 0.4', [['var GRASS_TOP=0.25;', 'var GRASS_TOP=0.4;']], 'the grass you see is still at 0.25'],
  ['the grass repeats instead of mirroring', [["{mirror:true, tint:0xc9d3c4,", "{repeat:true, tint:0xc9d3c4,"]], 'the counter wears the painted grass'],
  ['the code meshes never step aside', [['function codeHideAll(set, key){ var L=set.hide&&set.hide[key]; if(!L)return;', 'function codeHideAll(set, key){ return; var L=set.hide&&set.hide[key]; if(!L)return;'],
    ['if(ready){ mesh.visible=false; return mesh; }', 'if(ready){ return mesh; }']], 'no code trunk'],
  ['the mushroom 4.2 wide', [["propStandW(BW,'j_mushroom',x,0,-0.6,4.4)", "propStandW(BW,'j_mushroom',x,0,-0.6,4.2)"]], 'the painted mushroom'],
  ['the flag without her pennant', [["if(p)artOn(m, p.file, {then:function(){ m.opacity=1; codeHideAll(WSJ,'j_flag'); }});", "if(p&&0)artOn(m, p.file, {then:function(){ m.opacity=1; codeHideAll(WSJ,'j_flag'); }});"]], 'the finish flag carries her pennant'],
  ['the stripes hide before the grass is in', [["stp.position.set(sx+2,0.26,0); codeHide(WSJ,'j_grass',stp,jReady(WSJ,'jgrass'));", "stp.position.set(sx+2,0.26,0); codeHide(WSJ,'j_grass',stp,true);"]], 'a broken grass file keeps the stripes'],
  ['the tufts half a unit up', [["propStand(WSJ,tk,gx,GRASS_TOP,tuft.position.z,1)", "propStand(WSJ,tk,gx,GRASS_TOP+0.5,tuft.position.z,1)"]], 'every painted bush, tuft and flower'],
  ['the mushroom cap stays', [["codeHide(BW,'j_mushroom',st); codeHide(BW,'j_mushroom',cap);", "codeHide(BW,'j_mushroom',st);"]], 'no code trunk'],
  ['the shelf crack stays', [["crk.rotation.z=0.05; codeHide(WSJ,'j_shelf',crk,jReady(WSJ,'jshelf'));", "crk.rotation.z=0.05;"]], 'no code trunk'],
  ['an rng draw taken only when the paint is in', [["if(ts){ addMesh(ts); codeHide(WSJ,tk,tuft); }", "if(ts){ addMesh(ts); codeHide(WSJ,tk,tuft); rng(); }"]], 'the paint moves no rng draw'],
];
const only = process.argv[2]; let allRed = true;
for (const [name, pairs, expect] of M) {
  if (only && name.indexOf(only) < 0) continue;
  let s = SRC; for (const [a, b] of pairs) { if (s.split(a).length !== 2) throw new Error(name + ': not found once: ' + a.slice(0, 60)); s = s.replace(a, b); }
  for (const m of s.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);   // the broken copy parses
  const fw = path.join(DIR, 'index-fw.html'); fs.writeFileSync(fw, s);
  let r; try { r = spawnSync('node', ['/workspaces/lucid-winds/tools/slice-3d-tests/fix/runh.mjs', 'index-fw.html'], { encoding: 'utf8', timeout: 400000 }); } finally { fs.rmSync(fw, { force: true }); }
  const fails = (r.stdout || '').split('\n').filter((l) => l.startsWith('  FAIL'));
  const red = fails.some((l) => l.indexOf(expect) >= 0);
  allRed = allRed && red;
  console.log((red ? 'RED   ' : 'GREEN(!) ') + name + '  [' + fails.map((l) => l.slice(7, 60)).join(' | ') + ']');
}
console.log(allRed ? 'every broken copy went red on its check' : 'A BROKEN COPY PASSED');
process.exit(allRed ? 0 : 1);
