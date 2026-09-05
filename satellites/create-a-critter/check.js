#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════
   CREATE A CRITTER source checks.  node check.js  (add --selftest to watch
   every check go red against a deliberately broken copy first).

   No browser is used here, so this proves ONLY what the source can prove.
   It is not a substitute for opening the app and LOOKING at it.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs=require('fs'), path=require('path'), vm=require('vm');
var FILE=path.join(__dirname,'index.html');

/* ---------------------------------------------------------------- helpers */
function scriptBlocks(src){
  /* safe ONLY because check 6 proves no JS string contains a literal
     closing script tag; a regex splitter lies the moment one does */
  var re=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g, m, out=[];
  while((m=re.exec(src))) out.push({ code:m[1], at:src.slice(0,m.index).split('\n').length });
  return out;
}
function js(src){ return scriptBlocks(src).map(function(b){ return b.code; }).join('\n'); }
function strings(code){
  var re=/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g, m, out=[];
  while((m=re.exec(code))) out.push(m[2]);
  return out;
}

/* ---------------------------------------------------------------- checks */
var CHECKS=[];
function check(name,fn){ CHECKS.push({ name:name, fn:fn }); }

check('every script block parses',function(src){
  var bad=[];
  scriptBlocks(src).forEach(function(b,i){
    if(!b.code.trim()) return;
    try{ new vm.Script(b.code,{filename:'block'+(i+1)}); }
    catch(e){ bad.push('block '+(i+1)+' at line '+b.at+': '+e.message); }
  });
  return bad;
});

check('every $(id) resolves and no id is used twice',function(src){
  var ids={}, m, re=/\bid="([^"]+)"/g, bad=[];
  while((m=re.exec(src))){ if(ids[m[1]]) bad.push('duplicate id: '+m[1]); ids[m[1]]=1; }
  var code=js(src);
  re=/\$\('([^']+)'\)/g;
  var seen={};
  while((m=re.exec(code))){ if(!ids[m[1]]&&!seen[m[1]]){ seen[m[1]]=1; bad.push('$(\''+m[1]+'\') has no element'); } }
  re=/getElementById\('([^']+)'\)/g;
  while((m=re.exec(code))){ if(!ids[m[1]]&&!seen[m[1]]){ seen[m[1]]=1; bad.push('getElementById(\''+m[1]+'\') has no element'); } }
  return bad;
});

check('every [data-*] selector matches a real attribute',function(src){
  var code=js(src), m, bad=[], seen={};
  var re=/querySelector(?:All)?\('([^']*\[data-[^']*)'\)/g;
  while((m=re.exec(code))){
    var sel=m[1];
    var attrs=sel.match(/data-[a-z]+/g)||[];
    attrs.forEach(function(a){
      /* the attribute must appear on an element, not only inside this selector */
      var used=new RegExp('<[^>]*\\s'+a+'[=\\s>]').test(src);
      if(!used&&!seen[a]){ seen[a]=1; bad.push('selector uses ['+a+'] but no element carries it'); }
    });
  }
  return bad;
});

check('no silent catch: every empty catch is annotated /*ok: why */',function(src){
  var code=js(src), bad=[], m;
  var re=/catch\s*\(([^)]*)\)\s*\{([^{}]*)\}/g;
  while((m=re.exec(code))){
    var body=m[2];
    var stripped=body.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').trim();
    if(stripped) continue;                    /* it does something, fine */
    if(/\/\*\s*ok:/.test(body)) continue;      /* explicitly justified */
    var line=code.slice(0,m.index).split('\n').length;
    bad.push('empty catch with no /*ok: reason */ near script line '+line);
  }
  return bad;
});

check('no dash characters in player facing copy',function(src){
  var bad=[], seen={};
  function look(s,where){
    if(!/\s/.test(s)) return;                          /* single tokens are code */
    if(!/[A-Za-z]{3}/.test(s)) return;
    if(/[:;{}<>#%]|px\b|rgba?\(|\bvar\(|\burl\(/.test(s)) return;   /* style/technical */
    if(/\bease|\blinear\b|\bcubic-bezier|\d(\.\d+)?s\b|\btranslate|\brotate\b|\bforwards\b|\binfinite\b/.test(s)) return; /* css values */
    if(!/[—–]|\w-\w|\s-\s/.test(s)) return;
    if(seen[s]) return; seen[s]=1;
    bad.push(where+': '+JSON.stringify(s));
  }
  strings(js(src)).forEach(function(s){ look(s,'string'); });
  /* visible text between tags, minus the script and style blocks */
  var body=src.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'');
  (body.match(/>([^<>]+)</g)||[]).forEach(function(t){ look(t.slice(1,-1).trim(),'markup'); });
  return bad;
});

check('no literal closing script tag inside a JS string',function(src){
  var opens=(src.match(/<script/g)||[]).length;
  var closes=(src.match(/<\/script/g)||[]).length;
  var bad=[];
  if(opens!==closes) bad.push('script tags do not pair: '+opens+' open, '+closes+' close, so a string almost certainly contains one');
  strings(js(src)).forEach(function(s){
    if(/<\/script/i.test(s)) bad.push('string contains a closing script tag: '+JSON.stringify(s).slice(0,60));
  });
  return bad;
});

check('service worker safety (prefixed caches, versions in step)',function(src){
  var code=js(src), bad=[];
  if(!/serviceWorker\s*\.\s*register/.test(code)&&!/\bcaches\s*\./.test(code)) return bad;
  /* there is one now, so it has to obey the fleet rules */
  var del=code.match(/caches\.keys\(\)[\s\S]{0,400}/g)||[];
  del.forEach(function(chunk){
    if(!/cac[_-]/.test(chunk)) bad.push('caches.keys() is origin wide and this one does not filter on a cac_ prefix');
  });
  var reg=code.match(/register\('([^']+)'/);
  var shell=code.match(/SHELL_VERSION\s*=\s*'([^']+)'/);
  if(reg&&shell&&reg[1].indexOf(shell[1])<0)
    bad.push('registration url '+reg[1]+' does not carry SHELL_VERSION '+shell[1]+', so they can drift apart');
  return bad;
});

check('localStorage discipline: merged nursery writes, bests through lsMax',function(src){
  var code=js(src), bad=[], m;
  var re=/jSet\(K_NEST[^)]*\)/g;
  var n=0;
  while((m=re.exec(code))){
    n++;
    var around=code.slice(Math.max(0,m.index-900),m.index);
    if(!/function saveNest\(/.test(around))
      bad.push('cac_nursery written whole outside saveNest(), which clobbers another tab');
  }
  if(!n) bad.push('no nursery write found at all, saveNest() must have been renamed');
  ['cac_berry_best','cac_toss_best'].forEach(function(k){
    var raw=new RegExp("lsSet\\('"+k+"'");
    if(raw.test(code)) bad.push(k+' is written directly; bests must go through lsMax so a second tab cannot lower them');
  });
  return bad;
});

check('touch targets are 48px or more',function(src){
  var bad=[];
  /* CSS classes used by interactive elements */
  [['.bigbtn',60],['.chipbtn',48],['.actbtn',52],['.foodbtn',52],['.flybtn',54],['.swatch',48]].forEach(function(p){
    var re=new RegExp('\\'+p[0]+'\\s*\\{([^}]*)\\}','g'), m, best=0;
    while((m=re.exec(src))){
      var d=m[1], h=d.match(/(?:min-)?height:\s*(\d+)px/);
      if(h) best=Math.max(best,parseInt(h[1],10));
    }
    if(best&&best<48) bad.push(p[0]+' renders at '+best+'px, under the 48px minimum');
    if(!best) bad.push(p[0]+' declares no height at all, so its target size is unknowable');
  });
  /* buttons with an inline style */
  var re=/<button[^>]*style="([^"]*)"[^>]*>/g, m;
  while((m=re.exec(src))){
    var st=m[1], h=st.match(/(?:^|;)\s*height:\s*(\d+)px/), mh=st.match(/min-height:\s*(\d+)px/);
    var px=h?parseInt(h[1],10):(mh?parseInt(mh[1],10):null);
    if(px===null){
      var pad=st.match(/padding:\s*(\d+)px/), font=st.match(/font(?:-size)?:[^;]*?(\d+(?:\.\d+)?)(px|rem)/);
      if(pad&&font){
        var fpx=font[2]==='rem'?parseFloat(font[1])*16:parseFloat(font[1]);
        px=Math.round(2*parseInt(pad[1],10)+fpx*1.25);
      }
    }
    if(px!==null&&px<48){
      var id=(m[0].match(/id="([^"]+)"/)||[])[1]||'(no id)';
      bad.push('inline styled button '+id+' renders about '+px+'px, under 48px');
    }
  }
  /* the two controls built in JS */
  var code=js(src);
  var pill=code.match(/pill\.style\.cssText='([^']*)'/);
  if(pill&&!/min-height:\s*4[89]px|min-height:\s*[5-9]\dpx/.test(pill[1]))
    bad.push('the update pill has no 48px minimum height');
  var balloon=code.match(/fr2\.style\.cssText='([^']*)'/);
  if(balloon&&!/height:\s*4[89]px|height:\s*[5-9]\dpx/.test(balloon[1]))
    bad.push('the nursery set free button is under 48px');
  return bad;
});

/* ---------------------------------------------------------------- runner */
function run(src,quiet){
  var fails=0;
  CHECKS.forEach(function(c){
    var bad=c.fn(src)||[];
    if(bad.length){
      fails++;
      if(!quiet){ console.log('RED   '+c.name);
        bad.slice(0,12).forEach(function(b){ console.log('        '+b); });
        if(bad.length>12) console.log('        ...and '+(bad.length-12)+' more'); }
    } else if(!quiet) console.log('green '+c.name);
  });
  return fails;
}

/* Every check has to be WATCHED FAILING before it is worth anything: each
   mutation below breaks exactly one thing and the check for it must go red. */
var MUTATIONS=[
  ['every script block parses', function(s){ return s.replace('function lsMax(k,v){','function lsMax(k,v){ ]]]'); }],
  ['every $(id) resolves and no id is used twice', function(s){ return s.replace("$('critName')","$('critNameTypo')"); }],
  ['every [data-*] selector matches a real attribute', function(s){ return s.replace(/querySelectorAll\('\[data-limb\]'\)/,"querySelectorAll('[data-limbo]')"); }],
  ['no silent catch: every empty catch is annotated /*ok: why */', function(s){ return s.replace('function lsMax(k,v){','function lsMax(k,v){ try{ }catch(e){ } '); }],
  ['no dash characters in player facing copy', function(s){ return s.replace('A new version is ready. Tap to update.','A new version is ready, tap to update'); }],
  ['no literal closing script tag inside a JS string', function(s){ return s.replace("var BUILD='","var HAX='<\/script> oh no'; var BUILD='"); }],
  ['service worker safety (prefixed caches, versions in step)', function(s){ return s.replace('var BUILD=',"var SHELL_VERSION='v9'; navigator.serviceWorker.register('sw.js?v=8'); caches.keys().then(function(k){ k.forEach(function(n){ caches.delete(n); }); }); var BUILD="); }],
  ['localStorage discipline: merged nursery writes, bests through lsMax', function(s){ return s.replace('function persistCur(){',"function persistCur(){ jSet(K_NEST,NEST); lsSet('cac_berry_best','9');"); }],
  ['touch targets are 48px or more', function(s){ return s.replace('.swatch{ width:48px; height:48px; min-width:48px;','.swatch{ width:42px; height:42px; min-width:42px;'); }]
];

function selftest(src){
  var problems=0;
  MUTATIONS.forEach(function(pair){
    var name=pair[0], broken=pair[1](src);
    if(broken===src){ console.log('SELFTEST BROKEN: mutation for "'+name+'" changed nothing'); problems++; return; }
    var c=null; CHECKS.forEach(function(x){ if(x.name===name) c=x; });
    if(!c){ console.log('SELFTEST BROKEN: no check named "'+name+'"'); problems++; return; }
    var bad=[];
    try{ bad=c.fn(broken)||[]; }catch(e){ bad=['threw: '+e.message]; }
    if(!bad.length){ console.log('SELFTEST FAILED: "'+name+'" stayed green on a broken file'); problems++; }
    else console.log('watched red  '+name+'  ('+bad[0].slice(0,80)+')');
  });
  return problems;
}

var src=fs.readFileSync(FILE,'utf8');
var code=0;
if(process.argv.indexOf('--selftest')>=0){
  console.log('--- watching every check fail on purpose ---');
  code+=selftest(src)?1:0;
  console.log('');
}
console.log('--- checking '+path.basename(FILE)+' ---');
code+=run(src)?1:0;
process.exit(code?1:0);
