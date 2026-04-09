// ═══ LUCID WINDS — dev.js ═══
// Dev panel, Firebase diagnostic log
// ════════════════════════════════════════════

(function(){
  var _dtc=0,_dtt=null;
  var btn=document.getElementById('sws-debug-toggle');
  if(!btn){console.error('DEV: sws-debug-toggle not found');return;}
  btn.addEventListener('click',function(){
    _dtc++;
    clearTimeout(_dtt);
    _dtt=setTimeout(function(){_dtc=0;},2500);
    if(_dtc>=5){
      _dtc=0;
      var pw=prompt('Dev password:');
      if(pw==='lucid2026'){
        document.getElementById('pw-dev-admin').classList.add('open');
      }
    }
  });
  // URL shortcut: ?dev=lucid2026 opens dev panel immediately
  try{var _devParam=new URLSearchParams(window.location.search).get('dev');if(_devParam==='lucid2026'){document.getElementById('pw-dev-admin').classList.add('open');}}catch(e){}
})();

(function(){
  var _logEl = document.getElementById('sws-debug-log');
  var _logLines = [];
  window._swsLog = function(msg, type) {
    var ts = new Date().toLocaleTimeString();
    var cls = type === 'ok' ? 'log-ok' : type === 'err' ? 'log-err' : type === 'warn' ? 'log-warn' : '';
    _logLines.push('<div class="' + cls + '">[' + ts + '] ' + msg + '</div>');
    if (_logLines.length > 80) _logLines.shift();
    if (_logEl) _logEl.innerHTML = _logLines.join('');
    _logEl.scrollTop = _logEl.scrollHeight;
  };
  // Auto-log auth state
  if (window.auth) {
    window._swsLog('Firebase initialized. Project: focus-grove-fffa8');
    window._swsLog('Checking auth state…');
  }
})();
