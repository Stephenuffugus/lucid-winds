// node tools/hub-tests/parse_blocks.js [file]   The node only check for the hub: split index.html into its script
// blocks and parse each one (vm.Script). Exits 1 if any block fails. Seconds, no browser. Run it after every edit.
var fs = require('fs'), vm = require('vm');
var src = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');
// HTML comments are blanked first (same length, so line numbers hold): one of them contains the text <script>.
src = src.replace(/<!--[\s\S]*?-->/g, function(c){ return /<\/script>/i.test(c) ? c : c.replace(/[^\n]/g, ' '); });
var total = Buffer.byteLength(src);
function lineOf(i){ var n=1; for(var k=0;k<i;k++){ if(src.charCodeAt(k)===10) n++; } return n; }
// precompute line starts for speed
var ls=[0]; for(var i=0;i<src.length;i++){ if(src.charCodeAt(i)===10) ls.push(i+1); }
function ln(i){ var lo=0,hi=ls.length-1; while(lo<hi){ var m=(lo+hi+1)>>1; if(ls[m]<=i) lo=m; else hi=m-1; } return lo+1; }
var re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, m, blocks=[], jsBytes=0;
while((m=re.exec(src))){
  var attrs=m[1].trim(), code=m[2];
  var b={n:blocks.length+1, line:ln(m.index), endLine:ln(m.index+m[0].length), attrs:attrs, bytes:Buffer.byteLength(code)};
  if(/\bsrc=/.test(attrs)){ b.kind='external'; }
  else if(/type=["']?(application\/ld\+json|application\/json|text\/template|importmap)/i.test(attrs)){ b.kind='data'; }
  else if(/type=["']?module/i.test(attrs)){ b.kind='module'; }
  else {
    b.kind='inline'; jsBytes+=b.bytes;
    try{ new vm.Script(code,{filename:'block'+b.n}); b.ok=true; }catch(e){ b.ok=false; b.err=String(e.message); }
    // crude ES6 census on code with strings/comments/regex NOT stripped (upper bound)
    b.constN=(code.match(/(^|[;{}\s(])const\s+[A-Za-z_$\[{]/g)||[]).length;
    b.letN=(code.match(/(^|[;{}\s(])let\s+[A-Za-z_$\[{]/g)||[]).length;
    b.arrowN=(code.match(/=>/g)||[]).length;
    b.tmplN=(code.match(/`/g)||[]).length>>1;
    b.asyncN=(code.match(/\basync\s+function|\bawait\s/g)||[]).length;
    b.first=(code.replace(/^\s+/,'').split('\n')[0]||'').slice(0,90);
  }
  blocks.push(b);
}
var st=/<style\b[^>]*>([\s\S]*?)<\/style>/gi, cssBytes=0, cssN=0; while((m=st.exec(src))){ cssBytes+=Buffer.byteLength(m[1]); cssN++; }
var du=/data:(image|audio|font|application)\/[a-z0-9.+-]+;base64,[A-Za-z0-9+\/=]+/gi, duBytes=0, duN=0, big=[]; while((m=du.exec(src))){ duBytes+=m[0].length; duN++; if(m[0].length>20000) big.push({line:ln(m.index),kb:Math.round(m[0].length/1024),head:m[0].slice(0,30)}); }
console.log('TOTAL bytes',total,'lines',ls.length);
console.log('inline JS bytes',jsBytes,'('+Math.round(jsBytes/total*100)+'%)  CSS bytes',cssBytes,'in',cssN,'style blocks ('+Math.round(cssBytes/total*100)+'%)  base64 data URIs',duN,'=',duBytes,'bytes ('+Math.round(duBytes/total*100)+'%)');
console.log('big data URIs (>20KB):',big.length); big.slice(0,25).forEach(function(x){console.log('  L'+x.line,x.kb+'KB',x.head);});
console.log('\nSCRIPT BLOCKS',blocks.length);
blocks.forEach(function(b){
  if(b.kind==='inline') console.log('#'+b.n,'L'+b.line+'-'+b.endLine,(b.bytes/1024).toFixed(0)+'KB',b.ok?'OK':'**SYNTAX ERROR** '+b.err,'| const',b.constN,'let',b.letN,'=>',b.arrowN,'tmpl',b.tmplN,'async',b.asyncN,'|',b.first);
  else console.log('#'+b.n,'L'+b.line,b.kind,b.attrs.slice(0,150));
});

var bad=blocks.filter(function(b){return b.kind==='inline'&&!b.ok;});console.log(bad.length?('FAIL: '+bad.length+' block(s) do not parse'):'OK: every inline block parses');process.exit(bad.length?1:0);
