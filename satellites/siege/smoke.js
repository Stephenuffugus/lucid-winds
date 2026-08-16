/* minimal DOM shim: proves the VIEW boots, renders and drives a full wave
   through the scorecard and the loss sheet without a browser. */
var fs=require('fs'), path=require('path');
var DIR=process.argv[2]||'/workspaces/lucid-winds/satellites/siege';
var SRC=fs.readFileSync(path.join(DIR,'index.html'),'utf8');
var head=SRC.slice(0,SRC.indexOf('<script>'));
var ids=[], startCls={};
head.replace(/<[^>]*id="([^"]+)"[^>]*>/g,function(tag,i){
  ids.push(i);
  var m=/class="([^"]*)"/.exec(tag);
  startCls[i]=m? m[1].split(/\s+/):[];
  return tag;
});
var missing=[], nodes={};
function mkNode(id){
  var n={id:id,children:[],style:{setProperty:function(){},},dataset:{},_cls:{},
    classList:{add:function(c){n._cls[c]=1;},remove:function(c){delete n._cls[c];},
      toggle:function(c,v){if(v===undefined)v=!n._cls[c];if(v)n._cls[c]=1;else delete n._cls[c];},
      contains:function(c){return !!n._cls[c];}},
    innerHTML:'', textContent:'', value:0, clientWidth:390, clientHeight:220,
    appendChild:function(c){n.children.push(c);return c;},
    remove:function(){}, addEventListener:function(){}, removeEventListener:function(){},
    setAttribute:function(){}, getAttribute:function(){return null;},
    querySelector:function(){var q=mkNode('q');q.firstChild=mkNode('qf');return q;},
    getBoundingClientRect:function(){return {left:0,top:0,width:390,height:220};},
    closest:function(){return null;}, focus:function(){}, offsetWidth:1};
  n.firstChild=null;
  return n;
}
ids.forEach(function(i){nodes[i]=mkNode(i);(startCls[i]||[]).forEach(function(c){if(c)nodes[i]._cls[c]=1;});});
var thrown=[];
global.window={ AudioContext:null, webkitAudioContext:null,
  addEventListener:function(){}, matchMedia:function(){return {matches:false};},
  parent:null, location:{search:'',origin:'http://x',pathname:'/'}, history:{length:1} };
window.parent=window;
var docH={};
global.document={ getElementById:function(i){ if(!nodes[i]){missing.push(i);nodes[i]=mkNode(i);} return nodes[i]; },
  createElement:function(){return mkNode('new');},
  addEventListener:function(t,fn){ (docH[t]=docH[t]||[]).push(fn); },
  body:mkNode('body'), hidden:false, referrer:'' };
document.body.style={setProperty:function(){}};
global.location=window.location; global.history=window.history;
global.navigator={vibrate:function(){},share:null,clipboard:{writeText:function(){}},serviceWorker:null};
global.localStorage={ _d:{}, getItem:function(k){return this._d[k]||null;}, setItem:function(k,v){this._d[k]=v;} };
var rafQ=[];
global.requestAnimationFrame=function(fn){ rafQ.push(fn); return rafQ.length; };
global.setTimeout=function(){return 0;}; global.clearTimeout=function(){};
global.setInterval=function(){return 0;}; global.clearInterval=function(){};
var code=SRC.slice(SRC.indexOf('<script>')+8, SRC.lastIndexOf('</script>'));
try { new Function(code)(); } catch(e){ thrown.push('BOOT: '+e.message+'\n'+e.stack.split('\n')[1]); }
var SIM=global.window.__SIM__|| null;
console.log('boot ok:', thrown.length===0);
if(thrown.length) { console.log(thrown.join('\n')); process.exit(1); }
console.log('missing element ids:', missing.length? missing.join(','):'0');
/* close the title sheet the way HOLD THE GATE would, then drive real time */
nodes.titlesheet.classList.add('hidden');
var f=0, err=null, sawCard=false, cardText='';
try {
  for (var t=0;t<6000 && rafQ.length;t++){
    /* a thumb: hold right and mash the swing, the way a player would */
    (docH.keydown||[]).forEach(function(h){ h({key:' ', preventDefault:function(){}}); });
    if(t%3===0) (docH.keydown||[]).forEach(function(h){ h({key:'ArrowRight', preventDefault:function(){}}); });
    var fn=rafQ.shift(); fn(1000+t*33); f++;
    if(!sawCard && nodes.scbars.innerHTML.indexOf('barrow')>=0){
      sawCard=true;
      cardText=nodes.scwave.textContent+' | '+nodes.schead.textContent+' | you '+nodes.scyou.textContent+' traps '+nodes.sctraps.textContent+' | bars '+(nodes.scbars.innerHTML.match(/barrow/g)||[]).length;
    }
    if(nodes.scoresheet.classList.contains('hidden')===false) nodes.scoresheet.classList.add('hidden');
  }
} catch(e){ err=e; }
console.log('first scorecard:', sawCard? cardText : 'NEVER RENDERED');
console.log('loop frames driven:', f, err? ('THREW: '+err.message+' | '+err.stack.split('\n')[1]) : 'no throw');
if (err) process.exit(1);
console.log('shop buttons rendered:', (nodes.shop.innerHTML.match(/shopbtn/g)||[]).length);
console.log('lane cells rendered:', (nodes.lane.innerHTML.match(/data-cell/g)||[]).length);
console.log('spawn pips rendered:', (nodes.pips.innerHTML.match(/class="pip"/g)||[]).length);
console.log('scorecard headline:', JSON.stringify(nodes.schead.textContent));
console.log('scorecard you/traps:', nodes.scyou.textContent, '/', nodes.sctraps.textContent);
console.log('scorecard bars:', (nodes.scbars.innerHTML.match(/barrow/g)||[]).length);
console.log('wave label:', nodes.scwave.textContent, '| over title:', nodes.ovtitle.textContent);
