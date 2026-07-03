/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: checkers
 *
 * COPY of the inline GCK mount function from index.html
 * lines 68605-69059.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/checkers.html shell only. To keep them aligned,
 * re-run scripts/extract_inline_games.js whenever index.html's
 * inline game block is edited.
 * ════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var G=window._G;
  var _e=G.e, _play=G.play, _playWin=G.playWin, _st=G.st, _xt=G.xt,
      ms=G.ms, mm=G.mm, mc=G.mc, sm=G.sm, sh=G.sh,
      _sr=G.sr, _gr=G.gr, _setDiff=G.setDiff,
      _solEnterFS=G.solEnterFS, _solClearFS=G.solClearFS, _solExitFS=G.solExitFS;
  window._gameFns=window._gameFns||{};

  function GCK(a){
    var bd=new Array(64).fill(0),sel=-1,tn=1,mv=0,lastFrom=-1,lastTo=-1,mustJump=-1,gameOver=false;
    var undoStack=[];      // per-turn snapshots of full state
    var hintSeq=null;      // {from, to, cap:[...]} highlighted for 3s
    var diff=2;            // 1=seedling, 2=sapling, 3=grove, 4=old growth
    try{var _sd=parseInt(localStorage.getItem('lw_ck_diff'));if(_sd>=1&&_sd<=4)diff=_sd;}catch(e){}
    var stats={w:0,l:0,d:0,streak:0,best:0};
    try{var _sr2=localStorage.getItem('lw_ck_stats');if(_sr2){var _p=JSON.parse(_sr2);for(var _k in _p)stats[_k]=_p[_k];}}catch(e){}
  
    // SVG pieces — Player: sage seedling, AI: gold seed pod
    var SVG_P='<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="12" fill="#3a5a2a" stroke="#5a8a3a" stroke-width="1.5"/><circle cx="20" cy="24" r="8" fill="#4a7c35"/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#7ab356" opacity="0.5"/><path d="M20 12 Q18 16 20 20 Q22 16 20 12Z" fill="#7ab356"/><path d="M16 15 Q18 18 20 18" stroke="#7ab356" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M24 15 Q22 18 20 18" stroke="#7ab356" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>';
    var SVG_A='<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="12" fill="#6B4F2D" stroke="#8a7040" stroke-width="1.5"/><circle cx="20" cy="24" r="8" fill="#8a6a30"/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#C8A84B" opacity="0.4"/><ellipse cx="20" cy="16" rx="6" ry="8" fill="#C8A84B" opacity="0.85"/><ellipse cx="20" cy="16" rx="4" ry="5.5" fill="#a08030"/><line x1="20" y1="8" x2="20" y2="5" stroke="#6B4F2D" stroke-width="1.5" stroke-linecap="round"/></svg>';
    var SVG_PK='<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="12" fill="#3a5a2a" stroke="#7ab356" stroke-width="2"/><circle cx="20" cy="24" r="8" fill="#4a7c35"/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#7ab356" opacity="0.5"/><path d="M10 16 L15 10 L20 14 L25 10 L30 16" stroke="#7ab356" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="10" r="2" fill="#7ab356"/><circle cx="20" cy="14" r="2" fill="#7ab356"/><circle cx="25" cy="10" r="2" fill="#7ab356"/></svg>';
    var SVG_AK='<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="12" fill="#6B4F2D" stroke="#C8A84B" stroke-width="2"/><circle cx="20" cy="24" r="8" fill="#8a6a30"/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#C8A84B" opacity="0.4"/><path d="M10 16 L15 10 L20 14 L25 10 L30 16" stroke="#C8A84B" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="10" r="2" fill="#C8A84B"/><circle cx="20" cy="14" r="2" fill="#C8A84B"/><circle cx="25" cy="10" r="2" fill="#C8A84B"/></svg>';
    var PIECE=[null,SVG_P,SVG_A,SVG_PK,SVG_AK];
    ms(a,'<span style="color:#7ab356">&#9679;</span> You &nbsp; <span style="color:#C8A84B">&#9679;</span> AI');mm(a);
    // Stats strip
    var statsRow=document.createElement('div');statsRow.id='CKstats';
    statsRow.style.cssText='display:flex;justify-content:center;gap:14px;padding:2px 0;font-family:DM Mono,monospace;font-size:0.64rem;color:rgba(232,220,200,0.72);letter-spacing:0.06em';
    a.appendChild(statsRow);
    // Directions
    var dir=document.createElement('div');
    dir.style.cssText='text-align:center;padding:0.35rem 0.8rem;margin:0.2rem auto;max-width:400px;font-family:DM Sans,sans-serif;font-size:clamp(0.58rem,1.7vw,0.72rem);color:var(--cream);line-height:1.4;opacity:0.78';
    dir.innerHTML='Tap your <strong style="color:#7ab356">seedling</strong>, then tap where to move. Jump over <strong style="color:#C8A84B">pods</strong> to capture — multi-jumps are forced.';
    a.appendChild(dir);
    var gd=document.createElement('div');gd.className='ckb';gd.id='CK';a.appendChild(gd);
    // Tools: Undo + Hint
    var tools=document.createElement('div');
    tools.style.cssText='display:flex;gap:6px;justify-content:center;padding:4px 0';
    tools.innerHTML='<button class="gb" id="CKundo" onclick="_CKU()" style="min-height:44px;padding:8px 14px;font-size:0.65rem">↩ UNDO</button>'
      +'<button class="gb" id="CKhint" onclick="_CKH()" style="min-height:44px;padding:8px 14px;font-size:0.65rem">💡 HINT</button>';
    a.appendChild(tools);
    mc(a).innerHTML='<select class="gsl" id="CKd" onchange="_CKSetDiff(this.value)" style="min-width:140px">'
      +'<option value="1">Seedling</option>'
      +'<option value="2">Sapling</option>'
      +'<option value="3">Grove</option>'
      +'<option value="4">Old Growth</option>'
      +'</select><button class="gb-new" onclick="_CKN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  
    function setup(){
      bd=new Array(64).fill(0);
      for(var r=0;r<3;r++)for(var c=0;c<8;c++)if((r+c)%2===1)bd[r*8+c]=2;
      for(var r=5;r<8;r++)for(var c=0;c<8;c++)if((r+c)%2===1)bd[r*8+c]=1;
      sel=-1;tn=1;mv=0;lastFrom=-1;lastTo=-1;mustJump=-1;gameOver=false;
      undoStack=[];hintSeq=null;
      var dsel=document.getElementById('CKd');if(dsel)dsel.value=String(diff);
    }
  
    // ── Core helpers ──────────────────────────────────────────────
    // Is board square at pos owned by player (1 or 2)?
    function isOwn(b,pos,player){var p=b[pos];if(player===1)return p===1||p===3;return p===2||p===4;}
    function isEnemy(b,pos,player){var p=b[pos];if(player===1)return p===2||p===4;return p===1||p===3;}
    function isKing(p){return p===3||p===4;}
    function dirsFor(piece,player){
      if(piece===3||piece===4)return [[-1,-1],[-1,1],[1,-1],[1,1]];
      return player===1?[[-1,-1],[-1,1]]:[[1,-1],[1,1]];
    }
    // Single-hop jumps from pos for the piece currently at pos on board b
    function getJumpsFromPos(b,pos,player){
      var r=Math.floor(pos/8),c=pos%8,p=b[pos];
      if(!p)return [];
      var out=[],ds=dirsFor(p,player);
      for(var i=0;i<ds.length;i++){
        var d=ds[i];
        var nr=r+d[0],nc=c+d[1],jr=r+d[0]*2,jc=c+d[1]*2;
        if(nr<0||nr>7||nc<0||nc>7||jr<0||jr>7||jc<0||jc>7)continue;
        var mid=nr*8+nc,land=jr*8+jc;
        if(b[land]!==0)continue;
        var op=b[mid];
        if(op===0)continue;
        if((player===1&&(op===2||op===4))||(player===2&&(op===1||op===3))){
          out.push({f:pos,t:land,j:true,cap:mid});
        }
      }
      return out;
    }
    function getSimpleFromPos(b,pos,player){
      var r=Math.floor(pos/8),c=pos%8,p=b[pos];
      if(!p)return [];
      var out=[],ds=dirsFor(p,player);
      for(var i=0;i<ds.length;i++){
        var d=ds[i];
        var nr=r+d[0],nc=c+d[1];
        if(nr<0||nr>7||nc<0||nc>7)continue;
        var land=nr*8+nc;
        if(b[land]!==0)continue;
        out.push({f:pos,t:land,j:false});
      }
      return out;
    }
  
    // Expand a complete capture sequence from origin. Returns an array of
    // sequences; each sequence is an array of single-jump steps.
    // A man that reaches the king row during a jump stops (promotes, no
    // further jumps in the chain) per American rules.
    function expandJumpSequences(b,startPos,player){
      var sequences=[];
      function recurse(board,pos,path){
        var jumps=getJumpsFromPos(board,pos,player);
        // If this piece just promoted on a previous step, path length >=1
        // and the last step ended at king row; we should have returned
        // before getting here — guard by checking stop flag
        if(!jumps.length){
          if(path.length)sequences.push(path.slice());
          return;
        }
        var anyChild=false;
        for(var i=0;i<jumps.length;i++){
          var j=jumps[i];
          var movedPiece=board[j.f];
          var capPiece=board[j.cap];
          board[j.f]=0;board[j.cap]=0;board[j.t]=movedPiece;
          var tr=Math.floor(j.t/8);
          var promoted=false;
          if(movedPiece===1&&tr===0){board[j.t]=3;promoted=true;}
          else if(movedPiece===2&&tr===7){board[j.t]=4;promoted=true;}
          path.push(j);
          if(promoted){
            // American-rules stop: promoted man ends his chain here
            sequences.push(path.slice());
          }else{
            recurse(board,j.t,path);
          }
          // Undo
          path.pop();
          board[j.t]=0;board[j.cap]=capPiece;board[j.f]=movedPiece;
          anyChild=true;
        }
        // (any-child just suppresses accidentally emitting a zero-chain)
        if(!anyChild&&path.length)sequences.push(path.slice());
      }
      recurse(b,startPos,[]);
      return sequences;
    }
  
    // All legal sequences for player on board b. Each sequence is an
    // array of steps; a simple move is [{f,t,j:false}], a capture chain
    // is [{f,t,j:true,cap},...]. Forced-jump rule: if any jump sequence
    // exists, simple moves are filtered out.
    function allSequences(b,player){
      var jumpSeqs=[],simpleSeqs=[];
      for(var i=0;i<64;i++){
        if(!isOwn(b,i,player))continue;
        var s=expandJumpSequences(b,i,player);
        for(var k=0;k<s.length;k++)jumpSeqs.push(s[k]);
        if(s.length===0){
          var simples=getSimpleFromPos(b,i,player);
          for(var m=0;m<simples.length;m++)simpleSeqs.push([simples[m]]);
        }
      }
      return jumpSeqs.length?jumpSeqs:simpleSeqs;
    }
    function applySequenceTo(b,seq){
      for(var i=0;i<seq.length;i++){
        var s=seq[i];
        var moving=b[s.f];
        b[s.f]=0;
        if(s.j)b[s.cap]=0;
        b[s.t]=moving;
      }
      // Crown at the end
      var last=seq[seq.length-1];
      var tr=Math.floor(last.t/8);
      if(b[last.t]===1&&tr===0)b[last.t]=3;
      if(b[last.t]===2&&tr===7)b[last.t]=4;
      return b;
    }
  
    // ── Evaluation ────────────────────────────────────────────────
    // Positive = AI ahead. Negative = player ahead.
    function evaluate(b){
      var s=0;
      var p1=0,p2=0,p1k=0,p2k=0;
      for(var i=0;i<64;i++){
        var r=Math.floor(i/8),c=i%8,p=b[i];
        if(!p)continue;
        if(p===1){p1++;s-=100;s-=(7-r)*2;}
        else if(p===3){p1k++;s-=180;}
        else if(p===2){p2++;s+=100;s+=r*2;}
        else if(p===4){p2k++;s+=180;}
        // Center bonus (inner 4x4)
        if(r>=2&&r<=5&&c>=2&&c<=5){
          if(p===1||p===3)s-=3;
          else if(p===2||p===4)s+=3;
        }
        // Edge penalty (column 0 and 7 can't capture outward)
        if(c===0||c===7){
          if(p===1||p===3)s-=1;
          else if(p===2||p===4)s+=1;
        }
      }
      // Back-row guardians: pieces still on home row prevent enemy
      // promotion and get a bonus.
      for(var j=0;j<8;j++){
        if(bd[7*8+j]===1)s-=4;
        if(bd[0*8+j]===2)s+=4;
      }
      // Endgame: if you're ahead on pieces, push aggressively
      var totalMen=p1+p2+p1k+p2k;
      if(totalMen<=8){
        if(p2+p2k>p1+p1k)s+=20;
        else if(p1+p1k>p2+p2k)s-=20;
      }
      return s;
    }
  
    // Minimax with alpha-beta. Uses complete sequences (multi-jump
    // chains as atomic moves) so captures are properly valued.
    function minimax(b,depth,alpha,beta,isMax){
      var player=isMax?2:1;
      var seqs=allSequences(b,player);
      if(seqs.length===0){
        // No legal moves — losing side
        return isMax?-9999-depth:9999+depth;
      }
      if(depth===0)return evaluate(b);
      // Light move ordering — jumps first (they are already, forced-jump
      // filter ensures this when both exist). Within, eval-descending is
      // nice but skip for perf. alpha-beta handles it.
      var best=isMax?-999999:999999;
      for(var i=0;i<seqs.length;i++){
        var snap=b.slice();
        applySequenceTo(b,seqs[i]);
        var val=minimax(b,depth-1,alpha,beta,!isMax);
        // Restore
        for(var k=0;k<64;k++)b[k]=snap[k];
        if(isMax){if(val>best)best=val;if(best>alpha)alpha=best;}
        else{if(val<best)best=val;if(best<beta)beta=best;}
        if(beta<=alpha)break;
      }
      return best;
    }
  
    function bestSequenceFor(player){
      var depth={1:1,2:3,3:5,4:6}[diff]||3;
      var seqs=allSequences(bd,player);
      if(!seqs.length)return null;
      if(diff===1&&player===2){
        // Seedling: random legal sequence — chaotic beginner AI
        return seqs[Math.floor(Math.random()*seqs.length)];
      }
      var isMax=(player===2);
      var best=null,bestVal=isMax?-999999:999999;
      var candidates=[];
      for(var i=0;i<seqs.length;i++){
        var snap=bd.slice();
        applySequenceTo(bd,seqs[i]);
        var val=minimax(bd,depth-1,-999999,999999,!isMax);
        for(var k=0;k<64;k++)bd[k]=snap[k];
        if(isMax){
          if(val>bestVal){bestVal=val;best=seqs[i];candidates=[seqs[i]];}
          else if(val===bestVal)candidates.push(seqs[i]);
        }else{
          if(val<bestVal){bestVal=val;best=seqs[i];candidates=[seqs[i]];}
          else if(val===bestVal)candidates.push(seqs[i]);
        }
      }
      // Small randomization among equal-eval choices so games don't
      // feel deterministic at mid-tiers
      if(candidates.length>1)return candidates[Math.floor(Math.random()*candidates.length)];
      return best;
    }
  
    // ── Rendering ─────────────────────────────────────────────────
    function renderStats(){
      var played=stats.w+stats.l+stats.d;
      var pct=played?Math.round(stats.w/played*100):0;
      statsRow.innerHTML='played <strong style="color:var(--gold)">'+played+'</strong>'
        +' · won <strong style="color:var(--gold)">'+pct+'%</strong>'
        +' · streak <strong style="color:var(--gold)">'+stats.streak+'</strong>'
        +' · best <strong style="color:var(--gold)">'+stats.best+'</strong>';
    }
  
    function rn(){
      gd.innerHTML='';
      var validMoves=gameOver?[]:allSequences(bd,tn);
      // Destinations for the currently-selected piece: first-step targets
      var selTargets={};
      if(sel>=0){
        for(var vi=0;vi<validMoves.length;vi++){
          var seq=validMoves[vi];
          if(seq[0].f===sel)selTargets[seq[0].t]=seq;
        }
      }
      // Hint: first-step src highlight + destination marker
      var hintSrc=-1,hintDst=-1;
      if(hintSeq){hintSrc=hintSeq[0].f;hintDst=hintSeq[0].t;}
      for(var i=0;i<64;i++){
        var r=Math.floor(i/8),c=i%8;
        var d=document.createElement('div');
        var dark=(r+c)%2===1;
        var cls='ckc '+(dark?'ckd':'ckl');
        if(i===sel)cls+=' cks';
        if(selTargets[i])cls+=' ck-move';
        if(i===lastFrom||i===lastTo)cls+=' ck-last';
        if(i===hintSrc)cls+=' ck-hint-src';
        if(i===hintDst)cls+=' ck-hint-dst';
        d.className=cls;
        d.setAttribute('data-i',i);
        if(bd[i]>0)d.innerHTML=PIECE[bd[i]];
        if(dark&&!gameOver)d.addEventListener('click',function(){onClick(parseInt(this.getAttribute('data-i')))});
        gd.appendChild(d);
      }
      // Update undo button state
      var ub=document.getElementById('CKundo');
      if(ub){
        var canUndo=undoStack.length>0&&tn===1&&!gameOver;
        ub.disabled=!canUndo;ub.style.opacity=canUndo?'':'0.4';
      }
      var hb=document.getElementById('CKhint');
      if(hb){
        var canHint=!hintSeq&&tn===1&&!gameOver&&mustJump<0;
        hb.disabled=!canHint;hb.style.opacity=canHint?'':'0.4';
      }
      checkWin();
    }
  
    // ── Interactions ──────────────────────────────────────────────
    function snapshot(){
      return {bd:bd.slice(),sel:sel,tn:tn,mv:mv,lastFrom:lastFrom,lastTo:lastTo,mustJump:mustJump,gameOver:gameOver};
    }
    function restore(s){
      bd=s.bd.slice();sel=s.sel;tn=s.tn;mv=s.mv;lastFrom=s.lastFrom;lastTo=s.lastTo;mustJump=s.mustJump;gameOver=s.gameOver;
    }
  
    function onClick(idx){
      if(tn!==1||gameOver)return;
      hintSeq=null;
      if(mustJump>=0){
        var jmoves=getJumpsFromPos(bd,mustJump,1);
        var hit=null;for(var i=0;i<jmoves.length;i++)if(jmoves[i].t===idx){hit=jmoves[i];break;}
        if(hit){
          doMove(hit);
          // Check if piece just promoted — chain ends on promotion
          var promoted=false;
          var tr=Math.floor(idx/8);
          if(bd[idx]===1&&tr===0){bd[idx]=3;promoted=true;}
          var more=promoted?[]:getJumpsFromPos(bd,idx,1);
          if(more.length>0){mustJump=idx;sel=idx;rn();}
          else{mustJump=-1;sel=-1;endHumanTurn();}
        }
        return;
      }
      if(sel<0){
        if(bd[idx]===1||bd[idx]===3){
          var seqs=allSequences(bd,1);
          var has=false;for(var si=0;si<seqs.length;si++)if(seqs[si][0].f===idx){has=true;break;}
          if(has){sel=idx;_play('tap');rn();}
          // Forced-capture refusal used to be a silent dead tap.
          else if(seqs.length&&seqs[0][0].j){sm('Capture available — you must jump');}
        }
      }else{
        var seqs2=allSequences(bd,1);
        var hit2=null;
        for(var si2=0;si2<seqs2.length;si2++){
          if(seqs2[si2][0].f===sel&&seqs2[si2][0].t===idx){hit2=seqs2[si2][0];break;}
        }
        if(hit2){
          // Push undo snapshot before the FIRST step of the turn only
          if(mustJump<0)undoStack.push(snapshot());
          doMove(hit2);
          if(hit2.j){
            var promoted=false;
            var tr=Math.floor(idx/8);
            if(bd[idx]===1&&tr===0){bd[idx]=3;promoted=true;}
            var more2=promoted?[]:getJumpsFromPos(bd,idx,1);
            if(more2.length>0){mustJump=idx;sel=idx;rn();return;}
          }
          mustJump=-1;sel=-1;crown(idx);endHumanTurn();
        } else if(bd[idx]===1||bd[idx]===3){sel=idx;_play('tap');rn();}
        else{sel=-1;rn();}
      }
    }
  
    function doMove(m){
      _play('snap');bd[m.t]=bd[m.f];bd[m.f]=0;
      lastFrom=m.f;lastTo=m.t;mv++;
      // Earn only on the HUMAN's jumps (pieces 1/3) — this used to pay the
      // player every time the AI captured their pieces.
      if(m.j){bd[m.cap]=0;if(bd[m.t]===1||bd[m.t]===3)_e('capture');}
    }
    function crown(pos){
      var r=Math.floor(pos/8);
      if(bd[pos]===1&&r===0)bd[pos]=3;
      if(bd[pos]===2&&r===7)bd[pos]=4;
    }
    function endHumanTurn(){
      tn=2;rn();setTimeout(aiTurn,400);
    }
  
    // AI plays the full sequence from minimax one step at a time so the
    // human sees each jump land. Animation between steps.
    function aiTurn(){
      if(tn!==2||gameOver)return;
      var seq=bestSequenceFor(2);
      if(!seq){tn=1;rn();return;}
      var i=0;
      function step(){
        if(gameOver)return;
        if(i>=seq.length){
          crown(seq[seq.length-1].t);
          tn=1;rn();return;
        }
        doMove(seq[i]);
        crown(seq[i].t);
        i++;
        if(i<seq.length)setTimeout(step,300);
        else{tn=1;rn();}
      }
      step();
      rn(); // show first step immediately
    }
  
    function checkWin(){
      if(gameOver)return;
      var p1=0,p2=0;for(var i=0;i<64;i++){if(bd[i]===1||bd[i]===3)p1++;if(bd[i]===2||bd[i]===4)p2++;}
      var p1m=allSequences(bd,1).length,p2m=allSequences(bd,2).length;
      if(p2===0||p2m===0){
        gameOver=true;_e('game_win');_playWin();sm('You win! '+Math.ceil(mv/2)+' rounds');_sr('checkers',{w:true,s:mv});
        stats.w++;stats.streak++;if(stats.streak>stats.best)stats.best=stats.streak;
        saveStats();renderStats();
      } else if(p1===0||p1m===0){
        gameOver=true;_e('game_loss');_play('lose');sm('AI wins');_sr('checkers',{w:false,s:0});
        stats.l++;stats.streak=0;
        saveStats();renderStats();
      }
    }
    function saveStats(){try{localStorage.setItem('lw_ck_stats',JSON.stringify(stats));}catch(e){}}
  
    window._CKN=function(){setup();sm('');renderStats();rn();};
    window._CKU=function(){
      if(undoStack.length===0||tn!==1||gameOver)return;
      var snap=undoStack.pop();restore(snap);
      hintSeq=null;_play('tap');sm('Undone');rn();
    };
    window._CKH=function(){
      if(tn!==1||gameOver||mustJump>=0)return;
      // Find best sequence for human (using max-tier search)
      var savedDiff=diff;diff=4;
      var seq=bestSequenceFor(1);
      diff=savedDiff;
      if(!seq)return;
      hintSeq=seq;_play('tap');
      var fromR=Math.floor(seq[0].f/8),fromC=seq[0].f%8;
      var toR=Math.floor(seq[0].t/8),toC=seq[0].t%8;
      sm('Hint: '+'ABCDEFGH'.charAt(fromC)+(8-fromR)+' → '+'ABCDEFGH'.charAt(toC)+(8-toR));
      rn();
      setTimeout(function(){hintSeq=null;rn();},3500);
    };
    window._CKSetDiff=function(v){
      var n=parseInt(v,10);if(isNaN(n)||n<1||n>4)return;
      diff=n;try{localStorage.setItem('lw_ck_diff',String(n));}catch(e){}
    };
    _CKN();
  }

  window._gameFns['checkers']=GCK;
})();
