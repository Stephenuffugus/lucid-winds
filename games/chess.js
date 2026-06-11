// ═══ LUCID WINDS — Grove Chess ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GCH(a){
  var _chArt='assets/games/chess/';
  var _skinChess={
    lightSq:'rgba(42,48,37,.5)',darkSq:'rgba(74,124,53,.25)',
    selectGlow:'rgba(200,168,75,.4)',moveIndicator:'rgba(122,179,86,.5)',
    lastMoveHighlight:'rgba(200,168,75,.12)',checkHighlight:'rgba(180,60,60,.35)',
    playerPieces:{
      K:'<img src="'+_chArt+'p-king-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      Q:'<img src="'+_chArt+'p-queen-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      R:'<img src="'+_chArt+'p-rook-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      B:'<img src="'+_chArt+'p-bishop-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      N:'<img src="'+_chArt+'p-knight-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      P:'<img src="'+_chArt+'p-pawn-green.png" style="width:85%;height:85%;object-fit:contain;pointer-events:none">'
    },
    aiPieces:{
      K:'<img src="'+_chArt+'p-king-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      Q:'<img src="'+_chArt+'p-queen-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      R:'<img src="'+_chArt+'p-rook-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      B:'<img src="'+_chArt+'p-bishop-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      N:'<img src="'+_chArt+'p-knight-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      P:'<img src="'+_chArt+'p-pawn-gold.png" style="width:85%;height:85%;object-fit:contain;pointer-events:none">'
    }
  };
  // ── Constants ──
  var W='w',B='b',EMPTY=null;
  var PAWN='P',ROOK='R',KNIGHT='N',BISHOP='B',QUEEN='Q',KING='K';
  var PIECE_VAL={P:100,N:320,B:330,R:500,Q:900,K:20000};
  // position bonus tables (8x8, from white's perspective)
  var PST={};
  PST[PAWN]=[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0];
  PST[KNIGHT]=[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50];
  PST[BISHOP]=[-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20];
  PST[ROOK]=[0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0];
  PST[QUEEN]=[-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20];
  PST[KING]=[-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20];

  // ── Board state ──
  var board=[];   // board[r][c] = {type, color} or null (r=0 is rank 8)
  var turn=W;
  var castling={wK:true,wQ:true,bK:true,bQ:true};
  var epSquare=null; // [r,c] or null
  var moveCount=0;
  var halfmove=0;
  var lastMove=null; // {fr,fc,tr,tc}
  var selSq=null;    // [r,c] or null
  var legalMoves=[];
  var capturedW=[];  // pieces captured from white
  var capturedB=[];  // pieces captured from black
  var gameOver=false;
  var history=[];    // for undo: {board,turn,castling,epSquare,moveCount,halfmove,capturedW,capturedB,lastMove}
  var moveLog=[];    // sequence of moves as "frfctrtc" strings for opening book
  var posHistory={};  // position key → count for threefold repetition

  function initBoard(){
    board=[];
    var back=[ROOK,KNIGHT,BISHOP,QUEEN,KING,BISHOP,KNIGHT,ROOK];
    for(var r=0;r<8;r++){
      board[r]=[];
      for(var c=0;c<8;c++){
        if(r===0) board[r][c]={type:back[c],color:B};
        else if(r===1) board[r][c]={type:PAWN,color:B};
        else if(r===6) board[r][c]={type:PAWN,color:W};
        else if(r===7) board[r][c]={type:back[c],color:W};
        else board[r][c]=EMPTY;
      }
    }
    turn=W;castling={wK:true,wQ:true,bK:true,bQ:true};
    epSquare=null;moveCount=0;halfmove=0;lastMove=null;
    selSq=null;legalMoves=[];capturedW=[];capturedB=[];
    gameOver=false;history=[];moveLog=[];posHistory={};
    _lastAIComment='';_pieceMovedOnce={};
  }

  // Commentary state: _lastAIComment is the tag shown next to "Your move"
  // after each AI reply. _pieceMovedOnce tracks first-move development per
  // piece-square so we can show "Develops" only on the first outing.
  var _lastAIComment='';
  var _pieceMovedOnce={};

  function cloneBoard(b){
    var nb=[];
    for(var r=0;r<8;r++){nb[r]=[];for(var c=0;c<8;c++){var p=b[r][c];nb[r][c]=p?{type:p.type,color:p.color}:EMPTY;}}
    return nb;
  }

  function findKing(b,col){
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=b[r][c];if(p&&p.type===KING&&p.color===col)return [r,c];}
    return null;
  }

  // Is square (r,c) attacked by color 'by' on board b?
  function isAttacked(b,r,c,by){
    var dr,dc,i,p,tr,tc;
    // Knight attacks
    var kd=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for(i=0;i<kd.length;i++){tr=r+kd[i][0];tc=c+kd[i][1];if(tr>=0&&tr<8&&tc>=0&&tc<8){p=b[tr][tc];if(p&&p.color===by&&p.type===KNIGHT)return true;}}
    // Rook/Queen (straight lines)
    var sd=[[0,1],[0,-1],[1,0],[-1,0]];
    for(i=0;i<sd.length;i++){dr=sd[i][0];dc=sd[i][1];tr=r+dr;tc=c+dc;while(tr>=0&&tr<8&&tc>=0&&tc<8){p=b[tr][tc];if(p){if(p.color===by&&(p.type===ROOK||p.type===QUEEN))return true;break;}tr+=dr;tc+=dc;}}
    // Bishop/Queen (diagonals)
    var bd=[[1,1],[1,-1],[-1,1],[-1,-1]];
    for(i=0;i<bd.length;i++){dr=bd[i][0];dc=bd[i][1];tr=r+dr;tc=c+dc;while(tr>=0&&tr<8&&tc>=0&&tc<8){p=b[tr][tc];if(p){if(p.color===by&&(p.type===BISHOP||p.type===QUEEN))return true;break;}tr+=dr;tc+=dc;}}
    // Pawn attacks
    var pd=by===W?-1:1;
    if(r+pd>=0&&r+pd<8){if(c-1>=0){p=b[r+pd][c-1];if(p&&p.color===by&&p.type===PAWN)return true;}if(c+1<8){p=b[r+pd][c+1];if(p&&p.color===by&&p.type===PAWN)return true;}}
    // King attacks
    for(dr=-1;dr<=1;dr++)for(dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;tr=r+dr;tc=c+dc;if(tr>=0&&tr<8&&tc>=0&&tc<8){p=b[tr][tc];if(p&&p.color===by&&p.type===KING)return true;}}
    return false;
  }

  function inCheck(b,col){
    var kp=findKing(b,col);
    if(!kp)return false;
    return isAttacked(b,kp[0],kp[1],col===W?B:W);
  }

  // Generate pseudo-legal moves for color on board b with given state
  function genMoves(b,col,cas,ep){
    var moves=[];
    var dir=col===W?-1:1;
    var startRow=col===W?6:1;
    var promoRow=col===W?0:7;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p||p.color!==col)continue;
      var t=p.type;
      if(t===PAWN){
        // Forward 1
        if(r+dir>=0&&r+dir<8&&!b[r+dir][c]){
          if(r+dir===promoRow)moves.push({fr:r,fc:c,tr:r+dir,tc:c,promo:QUEEN});
          else moves.push({fr:r,fc:c,tr:r+dir,tc:c});
          // Forward 2 from start
          if(r===startRow&&!b[r+dir*2][c])moves.push({fr:r,fc:c,tr:r+dir*2,tc:c});
        }
        // Captures
        var pc;
        if(c-1>=0&&r+dir>=0&&r+dir<8){pc=b[r+dir][c-1];if(pc&&pc.color!==col){if(r+dir===promoRow)moves.push({fr:r,fc:c,tr:r+dir,tc:c-1,promo:QUEEN});else moves.push({fr:r,fc:c,tr:r+dir,tc:c-1});}
          if(ep&&ep[0]===r+dir&&ep[1]===c-1)moves.push({fr:r,fc:c,tr:r+dir,tc:c-1,ep:true});}
        if(c+1<8&&r+dir>=0&&r+dir<8){pc=b[r+dir][c+1];if(pc&&pc.color!==col){if(r+dir===promoRow)moves.push({fr:r,fc:c,tr:r+dir,tc:c+1,promo:QUEEN});else moves.push({fr:r,fc:c,tr:r+dir,tc:c+1});}
          if(ep&&ep[0]===r+dir&&ep[1]===c+1)moves.push({fr:r,fc:c,tr:r+dir,tc:c+1,ep:true});}
      }else if(t===KNIGHT){
        var kd2=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for(var i=0;i<kd2.length;i++){var tr2=r+kd2[i][0],tc2=c+kd2[i][1];if(tr2>=0&&tr2<8&&tc2>=0&&tc2<8){var dp=b[tr2][tc2];if(!dp||dp.color!==col)moves.push({fr:r,fc:c,tr:tr2,tc:tc2});}}
      }else{
        var dirs=[];
        if(t===ROOK||t===QUEEN)dirs=dirs.concat([[0,1],[0,-1],[1,0],[-1,0]]);
        if(t===BISHOP||t===QUEEN)dirs=dirs.concat([[1,1],[1,-1],[-1,1],[-1,-1]]);
        if(t===KING)dirs=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
        for(var d=0;d<dirs.length;d++){
          var dr3=dirs[d][0],dc3=dirs[d][1],tr3=r+dr3,tc3=c+dc3;
          if(t===KING){
            if(tr3>=0&&tr3<8&&tc3>=0&&tc3<8){var kp2=b[tr3][tc3];if(!kp2||kp2.color!==col)moves.push({fr:r,fc:c,tr:tr3,tc:tc3});}
          }else{
            while(tr3>=0&&tr3<8&&tc3>=0&&tc3<8){
              var sp=b[tr3][tc3];
              if(sp){if(sp.color!==col)moves.push({fr:r,fc:c,tr:tr3,tc:tc3});break;}
              moves.push({fr:r,fc:c,tr:tr3,tc:tc3});tr3+=dr3;tc3+=dc3;
            }
          }
        }
        // Castling
        if(t===KING){
          var row=col===W?7:0;
          var opp=col===W?B:W;
          if(r===row&&c===4){
            // King side
            if((col===W?cas.wK:cas.bK)&&!b[row][5]&&!b[row][6]&&b[row][7]&&b[row][7].type===ROOK&&b[row][7].color===col){
              if(!isAttacked(b,row,4,opp)&&!isAttacked(b,row,5,opp)&&!isAttacked(b,row,6,opp))
                moves.push({fr:row,fc:4,tr:row,tc:6,castle:'K'});
            }
            // Queen side
            if((col===W?cas.wQ:cas.bQ)&&!b[row][3]&&!b[row][2]&&!b[row][1]&&b[row][0]&&b[row][0].type===ROOK&&b[row][0].color===col){
              if(!isAttacked(b,row,4,opp)&&!isAttacked(b,row,3,opp)&&!isAttacked(b,row,2,opp))
                moves.push({fr:row,fc:4,tr:row,tc:2,castle:'Q'});
            }
          }
        }
      }
    }
    return moves;
  }

  // Apply move on board b, returns captured piece or null
  function applyMove(b,m,cas,ep){
    var piece=b[m.fr][m.fc];
    var captured=b[m.tr][m.tc];
    b[m.tr][m.tc]={type:piece.type,color:piece.color};
    b[m.fr][m.fc]=EMPTY;
    // En passant capture
    if(m.ep){captured=b[m.fr][m.tc];b[m.fr][m.tc]=EMPTY;}
    // Promotion
    if(m.promo)b[m.tr][m.tc].type=m.promo;
    // Castling rook move
    if(m.castle){
      var row=m.fr;
      if(m.castle==='K'){b[row][5]={type:ROOK,color:piece.color};b[row][7]=EMPTY;}
      else{b[row][3]={type:ROOK,color:piece.color};b[row][0]=EMPTY;}
    }
    return captured;
  }

  // Get legal moves (filters pseudo-legal for check)
  function getLegalMoves(b,col,cas,ep){
    var pseudo=genMoves(b,col,cas,ep);
    var legal=[];
    for(var i=0;i<pseudo.length;i++){
      var m=pseudo[i];
      var nb=cloneBoard(b);
      var ncas={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
      applyMove(nb,m,ncas,ep);
      if(!inCheck(nb,col))legal.push(m);
    }
    return legal;
  }

  function updateCastlingRights(m){
    if(m.fr===7&&m.fc===4){castling.wK=false;castling.wQ=false;}
    if(m.fr===0&&m.fc===4){castling.bK=false;castling.bQ=false;}
    if(m.fr===7&&m.fc===7)castling.wK=false;
    if(m.fr===7&&m.fc===0)castling.wQ=false;
    if(m.fr===0&&m.fc===7)castling.bK=false;
    if(m.fr===0&&m.fc===0)castling.bQ=false;
    if(m.tr===7&&m.tc===7)castling.wK=false;
    if(m.tr===7&&m.tc===0)castling.wQ=false;
    if(m.tr===0&&m.tc===7)castling.bK=false;
    if(m.tr===0&&m.tc===0)castling.bQ=false;
  }

  // Make a move on the real game board
  function makeMove(m){
    // Save state for undo
    history.push({
      board:cloneBoard(board),turn:turn,
      castling:{wK:castling.wK,wQ:castling.wQ,bK:castling.bK,bQ:castling.bQ},
      epSquare:epSquare?[epSquare[0],epSquare[1]]:null,
      moveCount:moveCount,halfmove:halfmove,
      capturedW:capturedW.slice(),capturedB:capturedB.slice(),
      lastMove:lastMove
    });
    var piece=board[m.fr][m.fc];
    var cap=applyMove(board,m,castling,epSquare);
    board._lastCap=!!cap;
    if(cap){
      if(cap.color===W)capturedW.push(cap.type);
      else capturedB.push(cap.type);
      halfmove=0;
    }else if(piece.type===PAWN){halfmove=0;}
    else{halfmove++;}
    // En passant square
    if(piece.type===PAWN&&Math.abs(m.tr-m.fr)===2)epSquare=[(m.fr+m.tr)/2,m.fc];
    else epSquare=null;
    updateCastlingRights(m);
    lastMove={fr:m.fr,fc:m.fc,tr:m.tr,tc:m.tc};
    moveLog.push(''+m.fr+m.fc+m.tr+m.tc);
    if(turn===B)moveCount++;
    turn=turn===W?B:W;
    // Track position for threefold repetition
    var pk=posKey(board,turn,castling,epSquare);
    posHistory[pk]=(posHistory[pk]||0)+1;
  }

  function undoMove(){
    if(!history.length)return false;
    // Remove position before undo
    var pk=posKey(board,turn,castling,epSquare);
    if(posHistory[pk])posHistory[pk]--;
    var s=history.pop();
    board=s.board;turn=s.turn;castling=s.castling;
    epSquare=s.epSquare;moveCount=s.moveCount;halfmove=s.halfmove;
    capturedW=s.capturedW;capturedB=s.capturedB;lastMove=s.lastMove;
    moveLog.pop();
    return true;
  }

  // Position key for repetition detection
  function posKey(b,t,cas,ep){
    var k='';
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=b[r][c];k+=p?(p.color+p.type):'.';}
    k+=t+(cas.wK?1:0)+(cas.wQ?1:0)+(cas.bK?1:0)+(cas.bQ?1:0);
    if(ep)k+=ep[0]+''+ep[1];
    return k;
  }

  // Insufficient material detection
  function insufficientMaterial(b){
    var wPieces=[],bPieces=[];
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p)continue;
      if(p.color===W)wPieces.push(p.type);else bPieces.push(p.type);
    }
    // K vs K
    if(wPieces.length===1&&bPieces.length===1)return true;
    // K+B vs K or K+N vs K
    if(wPieces.length===1&&bPieces.length===2){
      if(bPieces.indexOf(BISHOP)>=0||bPieces.indexOf(KNIGHT)>=0)return true;
    }
    if(bPieces.length===1&&wPieces.length===2){
      if(wPieces.indexOf(BISHOP)>=0||wPieces.indexOf(KNIGHT)>=0)return true;
    }
    return false;
  }

  // ── AI (Enhanced — positional eval, quiescence, opening book, iterative deepening) ──

  // ── OPENING BOOKS ──
  // Three personality books keyed to difficulty tier. AI plays black, so
  // every entry is a black response to a white move sequence.
  // Key format: move log joined by spaces, each move = "frfctrtc" where
  // row 0 = rank 8, col 0 = a-file. Values are {fr,fc,tr,tc[,castle,promo]}.
  //
  // MAGNUS  — positional grinder. Berlin, Italian response, QGD, Queen's
  //           Indian, Catalan, Reti symmetric. The world-champ repertoire.
  // ALIREZA — sharp/tactical. Sicilians (Najdorf, English Attack),
  //           Grünfeld, King's Indian, rook-sac-friendly lines.
  // WEIRD   — Easter-egg bucket for Seedling tier. Handles 1.h4 Kadas,
  //           1.g4 Grob, 1.b4 Sokolsky, 2.Ke2 Bongcloud, etc. Still plays
  //           principled classical chess against these novelties.
  //
  // All three are filtered through getLegalMoves at lookup time, so a
  // typo never silently produces an illegal move — it just falls through
  // to the search engine.

  var _chBookMagnus={};
  // 1.e4 → 1...e5 (gateway to Berlin / Italian, Magnus' life repertoire)
  _chBookMagnus['6444']={fr:1,fc:4,tr:3,tc:4};
  // 1.e4 e5 2.Nf3 → 2...Nc6
  _chBookMagnus['6444 1434 7655']={fr:0,fc:1,tr:2,tc:2};
  // 1.e4 e5 2.Nf3 Nc6 3.Bb5 → 3...Nf6 (Berlin Defense!)
  _chBookMagnus['6444 1434 7655 0122 7531']={fr:0,fc:6,tr:2,tc:5};
  // 1.e4 e5 2.Nf3 Nc6 3.Bc4 → 3...Bc5 (Italian / Giuoco Piano)
  _chBookMagnus['6444 1434 7655 0122 7542']={fr:0,fc:5,tr:3,tc:2};
  // 1.e4 e5 2.Nf3 Nc6 3.d4 → 3...exd4 (Scotch, snatch center)
  _chBookMagnus['6444 1434 7655 0122 6343']={fr:3,fc:4,tr:4,tc:3};
  // 1.e4 e5 2.Nc3 → 2...Nf6 (Vienna, aim for Petroff-like symmetry)
  _chBookMagnus['6444 1434 7152']={fr:0,fc:6,tr:2,tc:5};
  // 1.e4 e5 2.d4 → 2...exd4 (Center Game, grab pawn)
  _chBookMagnus['6444 1434 6343']={fr:3,fc:4,tr:4,tc:3};
  // 1.e4 e5 2.f4 → 2...exf4 (accept King's Gambit, Magnus did in blitz)
  _chBookMagnus['6444 1434 6545']={fr:3,fc:4,tr:4,tc:5};
  // 1.e4 e5 2.Bc4 → 2...Nf6 (Berlin-like, hit e4)
  _chBookMagnus['6444 1434 7542']={fr:0,fc:6,tr:2,tc:5};
  // 1.d4 → 1...Nf6 (Indian)
  _chBookMagnus['6343']={fr:0,fc:6,tr:2,tc:5};
  // 1.d4 Nf6 2.c4 → 2...e6 (QGD/Nimzo route — Magnus default)
  _chBookMagnus['6343 0625 6242']={fr:1,fc:4,tr:2,tc:4};
  // 1.d4 Nf6 2.Nf3 → 2...e6 (flexible Queen's Indian path)
  _chBookMagnus['6343 0625 7655']={fr:1,fc:4,tr:2,tc:4};
  // 1.d4 Nf6 2.Bf4 (London System) → 2...e6
  _chBookMagnus['6343 0625 7245']={fr:1,fc:4,tr:2,tc:4};
  // 1.d4 Nf6 2.g3 → 2...g6 (double fianchetto)
  _chBookMagnus['6343 0625 6656']={fr:1,fc:6,tr:2,tc:6};
  // 1.d4 Nf6 2.c4 e6 3.Nc3 → 3...Bb4 (Nimzo-Indian!)
  _chBookMagnus['6343 0625 6242 1424 7152']={fr:0,fc:5,tr:4,tc:1};
  // 1.d4 Nf6 2.c4 e6 3.Nf3 → 3...b6 (Queen's Indian, Magnus' baby)
  _chBookMagnus['6343 0625 6242 1424 7655']={fr:1,fc:1,tr:2,tc:1};
  // 1.d4 Nf6 2.c4 e6 3.g3 → 3...d5 (Catalan acceptance setup)
  _chBookMagnus['6343 0625 6242 1424 6656']={fr:1,fc:3,tr:3,tc:3};
  // 1.d4 d5 2.c4 → 2...e6 (QGD classical)
  _chBookMagnus['6343 1333 6242']={fr:1,fc:4,tr:2,tc:4};
  // 1.d4 d5 2.Nf3 → 2...Nf6
  _chBookMagnus['6343 1333 7655']={fr:0,fc:6,tr:2,tc:5};
  // 1.c4 → 1...e5 (reversed Sicilian)
  _chBookMagnus['6242']={fr:1,fc:4,tr:3,tc:4};
  // 1.c4 e5 2.Nc3 → 2...Nf6
  _chBookMagnus['6242 1434 7152']={fr:0,fc:6,tr:2,tc:5};
  // 1.c4 e5 2.Nf3 → 2...Nc6 (don't let e5 hang)
  _chBookMagnus['6242 1434 7655']={fr:0,fc:1,tr:2,tc:2};
  // 1.c4 e5 2.g3 → 2...Nf6
  _chBookMagnus['6242 1434 6656']={fr:0,fc:6,tr:2,tc:5};
  // 1.Nf3 → 1...Nf6 (symmetric Reti response)
  _chBookMagnus['7655']={fr:0,fc:6,tr:2,tc:5};
  // 1.Nf3 Nf6 2.c4 → 2...e6
  _chBookMagnus['7655 0625 6242']={fr:1,fc:4,tr:2,tc:4};
  // 1.Nf3 Nf6 2.g3 → 2...g6 (double fianchetto)
  _chBookMagnus['7655 0625 6656']={fr:1,fc:6,tr:2,tc:6};
  // 1.Nf3 Nf6 2.d4 → 2...e6 (transposes to Indian)
  _chBookMagnus['7655 0625 6343']={fr:1,fc:4,tr:2,tc:4};
  // 1.b3 (Larsen) → 1...e5
  _chBookMagnus['6151']={fr:1,fc:4,tr:3,tc:4};
  // 1.b3 e5 2.Bb2 → 2...Nc6 (central development)
  _chBookMagnus['6151 1434 7261']={fr:0,fc:1,tr:2,tc:2};
  // 1.g3 → 1...d5 (claim center)
  _chBookMagnus['6656']={fr:1,fc:3,tr:3,tc:3};
  // 1.g3 d5 2.Bg2 → 2...Nf6
  _chBookMagnus['6656 1333 7566']={fr:0,fc:6,tr:2,tc:5};

  // ── Magnus deeper lines (moves 4-8) ──
  // Berlin main: 1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O → 4...Nxe4 (Berlin Wall)
  _chBookMagnus['6444 1434 7655 0122 7531 0625 7476']={fr:2,fc:5,tr:4,tc:4};
  // Berlin 5.d4 → 5...Nd6 (main defensive knight)
  _chBookMagnus['6444 1434 7655 0122 7531 0625 7476 2544 6343']={fr:4,fc:4,tr:2,tc:3};
  // Berlin 5.Re1 → 5...Nd6 (same knight retreat)
  _chBookMagnus['6444 1434 7655 0122 7531 0625 7476 2544 7775']={fr:4,fc:4,tr:2,tc:3};
  // Italian: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.O-O → 4...Nf6 (main line)
  _chBookMagnus['6444 1434 7655 0122 7542 0532 7476']={fr:0,fc:6,tr:2,tc:5};
  // Italian 4.c3 (slow Italian) → 4...Nf6
  _chBookMagnus['6444 1434 7655 0122 7542 0532 6252']={fr:0,fc:6,tr:2,tc:5};
  // Italian 4.d3 → 4...Nf6 (quiet main line)
  _chBookMagnus['6444 1434 7655 0122 7542 0532 6353']={fr:0,fc:6,tr:2,tc:5};
  // Queen's Indian 4.g3 → 4...Bb7 (light-square bishop on long diagonal)
  _chBookMagnus['6343 0625 6242 1424 7655 1121 6656']={fr:0,fc:2,tr:1,tc:1};
  // Queen's Indian 4.a3 (Petrosian) → 4...Bb7
  _chBookMagnus['6343 0625 6242 1424 7655 1121 6050']={fr:0,fc:2,tr:1,tc:1};
  // Catalan response: 1.d4 Nf6 2.c4 e6 3.g3 → 3...d5 (challenge central light squares)
  _chBookMagnus['6343 0625 6242 1424 6656']={fr:1,fc:3,tr:3,tc:3};
  // Catalan deeper: 1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 → 4...Be7 (solid Catalan)
  _chBookMagnus['6343 0625 6242 1424 6656 1333 7566']={fr:0,fc:5,tr:1,tc:4};
  // London-reply: 1.d4 d5 2.Bf4 → 2...Nf6 (solid, don't rush)
  _chBookMagnus['6343 1333 7225']={fr:0,fc:6,tr:2,tc:5};

  var _chBookAlireza={};
  // 1.e4 → 1...c5 (Sicilian — Alireza's weapon)
  _chBookAlireza['6444']={fr:1,fc:2,tr:3,tc:2};
  // 1.e4 c5 2.Nf3 → 2...d6 (Najdorf gateway)
  _chBookAlireza['6444 1232 7655']={fr:1,fc:3,tr:2,tc:3};
  // 1.e4 c5 2.Nc3 → 2...Nc6 (Closed Sicilian response)
  _chBookAlireza['6444 1232 7152']={fr:0,fc:1,tr:2,tc:2};
  // 1.e4 c5 2.d4 → 2...cxd4 (accept Morra/Smith-Morra pawn)
  _chBookAlireza['6444 1232 6343']={fr:3,fc:2,tr:4,tc:3};
  // 1.e4 c5 2.c3 (Alapin) → 2...d5 (break immediately)
  _chBookAlireza['6444 1232 6252']={fr:1,fc:3,tr:3,tc:3};
  // 1.e4 c5 2.Nf3 d6 3.d4 → 3...cxd4 (Open Sicilian)
  _chBookAlireza['6444 1232 7655 1323 6343']={fr:3,fc:2,tr:4,tc:3};
  // 4.Nxd4 → 4...Nf6
  _chBookAlireza['6444 1232 7655 1323 6343 3243 5543']={fr:0,fc:6,tr:2,tc:5};
  // 5.Nc3 → 5...a6 (Najdorf)
  _chBookAlireza['6444 1232 7655 1323 6343 3243 5543 0625 7152']={fr:1,fc:0,tr:2,tc:0};
  // Najdorf 6.Be3 → 6...e5 (English Attack main)
  _chBookAlireza['6444 1232 7655 1323 6343 3243 5543 0625 7152 1020 7254']={fr:1,fc:4,tr:3,tc:4};
  // Najdorf 6.Bg5 → 6...e6 (Gelfand system)
  _chBookAlireza['6444 1232 7655 1323 6343 3243 5543 0625 7152 1020 7236']={fr:1,fc:4,tr:2,tc:4};
  // Najdorf 6.Be2 → 6...e5 (Classical)
  _chBookAlireza['6444 1232 7655 1323 6343 3243 5543 0625 7152 1020 7564']={fr:1,fc:4,tr:3,tc:4};
  // 1.d4 → 1...Nf6
  _chBookAlireza['6343']={fr:0,fc:6,tr:2,tc:5};
  // 1.d4 Nf6 2.c4 → 2...g6 (Grünfeld/KID route, sharper than Magnus line)
  _chBookAlireza['6343 0625 6242']={fr:1,fc:6,tr:2,tc:6};
  // 1.d4 Nf6 2.c4 g6 3.Nc3 → 3...d5 (Grünfeld Defense!)
  _chBookAlireza['6343 0625 6242 1626 7152']={fr:1,fc:3,tr:3,tc:3};
  // 1.d4 Nf6 2.c4 g6 3.Nf3 → 3...Bg7 (KID setup)
  _chBookAlireza['6343 0625 6242 1626 7655']={fr:0,fc:5,tr:1,tc:6};
  // 1.d4 Nf6 2.c4 g6 3.g3 → 3...Bg7 (Fianchetto variation)
  _chBookAlireza['6343 0625 6242 1626 6656']={fr:0,fc:5,tr:1,tc:6};
  // 1.c4 → 1...Nf6 (avoids reversed Sicilian)
  _chBookAlireza['6242']={fr:0,fc:6,tr:2,tc:5};
  // 1.c4 Nf6 2.Nc3 → 2...e5 (reversed dragon)
  _chBookAlireza['6242 0625 7152']={fr:1,fc:4,tr:3,tc:4};
  // 1.c4 Nf6 2.g3 → 2...g6
  _chBookAlireza['6242 0625 6656']={fr:1,fc:6,tr:2,tc:6};
  // 1.Nf3 → 1...d5 (stop Reti dry)
  _chBookAlireza['7655']={fr:1,fc:3,tr:3,tc:3};
  // 1.b3 → 1...e5 (central)
  _chBookAlireza['6151']={fr:1,fc:4,tr:3,tc:4};
  // 1.g3 → 1...d5
  _chBookAlireza['6656']={fr:1,fc:3,tr:3,tc:3};

  // ── Alireza deeper lines (moves 6-8, sharpened) ──
  // Najdorf English Attack: 6.Be3 e5 7.Nb3 → 7...Be6 (standard main)
  _chBookAlireza['6444 1232 7655 1323 6343 3243 5543 0625 7152 1020 7254 1434 4351']={fr:0,fc:2,tr:2,tc:4};
  // Najdorf: 6.Be3 e5 7.Nf3 → 7...Be7
  _chBookAlireza['6444 1232 7655 1323 6343 3243 5543 0625 7152 1020 7254 1434 4355']={fr:0,fc:5,tr:1,tc:4};
  // Najdorf Poisoned Pawn prep: 6.Bg5 e6 7.f4 → 7...Qb6 (live-dangerously)
  _chBookAlireza['6444 1232 7655 1323 6343 3243 5543 0625 7152 1020 7236 1424 6545']={fr:0,fc:3,tr:2,tc:1};
  // Grünfeld: 4.cxd5 → 4...Nxd5 (main exchange)
  _chBookAlireza['6343 0625 6242 1626 7152 1333 4233']={fr:2,fc:5,tr:3,tc:3};
  // Grünfeld exchange: 5.e4 → 5...Nxc3 (signature exchange)
  _chBookAlireza['6343 0625 6242 1626 7152 1333 4233 2533 6444']={fr:3,fc:3,tr:5,tc:2};
  // Grünfeld Russian: 4.Nf3 → 4...Bg7
  _chBookAlireza['6343 0625 6242 1626 7655']={fr:0,fc:5,tr:1,tc:6};
  // KID main: 1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 → 4...d6
  _chBookAlireza['6343 0625 6242 1626 7152 0516 6444']={fr:1,fc:3,tr:2,tc:3};
  // KID: 4.Nf3 Bg7 5.e4 → 5...O-O then d6
  _chBookAlireza['6343 0625 6242 1626 7655 0516 6444']={fr:0,fc:4,tr:0,tc:6};
  // Alapin: 1.e4 c5 2.c3 d5 3.exd5 → 3...Qxd5 (accept)
  _chBookAlireza['6444 1232 6252 1333 4433']={fr:0,fc:3,tr:3,tc:3};
  // Closed Sicilian: 2.Nc3 Nc6 3.g3 → 3...g6 (mirror fianchetto)
  _chBookAlireza['6444 1232 7152 0122 6656']={fr:1,fc:6,tr:2,tc:6};

  var _chBookWeird={};
  // 1.h4 (Kadas — Magnus used this to beat Firouzja!) → 1...e5
  _chBookWeird['6747']={fr:1,fc:4,tr:3,tc:4};
  // 1.a4 → 1...e5
  _chBookWeird['6040']={fr:1,fc:4,tr:3,tc:4};
  // 1.a3 (Anderssen) → 1...d5
  _chBookWeird['6050']={fr:1,fc:3,tr:3,tc:3};
  // 1.h3 → 1...e5
  _chBookWeird['6757']={fr:1,fc:4,tr:3,tc:4};
  // 1.f4 (Bird's) → 1...d5
  _chBookWeird['6545']={fr:1,fc:3,tr:3,tc:3};
  // 1.f4 d5 2.Nf3 → 2...Nf6
  _chBookWeird['6545 1333 7655']={fr:0,fc:6,tr:2,tc:5};
  // 1.g4 (Grob) → 1...d5 (punish weak light squares)
  _chBookWeird['6646']={fr:1,fc:3,tr:3,tc:3};
  // 1.g4 d5 2.Bg2 → 2...Bxg4 (take the pawn)
  _chBookWeird['6646 1333 7566']={fr:0,fc:2,tr:4,tc:6};
  // 1.Nh3 → 1...d5
  _chBookWeird['7657']={fr:1,fc:3,tr:3,tc:3};
  // 1.Na3 → 1...e5
  _chBookWeird['7150']={fr:1,fc:4,tr:3,tc:4};
  // 1.b4 (Sokolsky / Orangutan) → 1...e5
  _chBookWeird['6141']={fr:1,fc:4,tr:3,tc:4};
  // 1.b4 e5 2.Bb2 → 2...Bxb4 (accept the gambit)
  _chBookWeird['6141 1434 7261']={fr:0,fc:5,tr:4,tc:1};
  // 1.Nc3 (Dunst/Van Geet) → 1...d5
  _chBookWeird['7152']={fr:1,fc:3,tr:3,tc:3};
  // 1.e3 → 1...e5
  _chBookWeird['6454']={fr:1,fc:4,tr:3,tc:4};
  // 1.d3 → 1...d5
  _chBookWeird['6353']={fr:1,fc:3,tr:3,tc:3};
  // 1.e4 e5 2.Ke2 (Bongcloud!) → 2...Ke7 (reverse-Bongcloud salute)
  _chBookWeird['6444 1434 7464']={fr:0,fc:4,tr:1,tc:4};

  // ── Weird deeper lines (Seedling tier loves chaos) ──
  // Kadas 1.h4 e5 2.d4 → 2...exd4 (take the pawn)
  _chBookWeird['6747 1434 6343']={fr:3,fc:4,tr:4,tc:3};
  // Kadas 1.h4 e5 2.Nf3 → 2...Nc6
  _chBookWeird['6747 1434 7655']={fr:0,fc:1,tr:2,tc:2};
  // Grob 1.g4 d5 2.Bg2 Bxg4 3.c4 → 3...c6 (keep the pawn, solid)
  _chBookWeird['6646 1333 7566 0246 6242']={fr:1,fc:2,tr:2,tc:2};
  // Grob 1.g4 d5 2.c4 → 2...dxc4 (take the c-pawn)
  _chBookWeird['6646 1333 6242']={fr:3,fc:3,tr:4,tc:2};
  // Sokolsky 1.b4 e5 2.Bb2 Bxb4 3.Bxe5 → 3...Nf6 (don't panic over tempo)
  _chBookWeird['6141 1434 7261 0541 6134']={fr:0,fc:6,tr:2,tc:5};
  // Sokolsky 1.b4 e5 2.a3 → 2...d5 (lock the center)
  _chBookWeird['6141 1434 6050']={fr:1,fc:3,tr:3,tc:3};
  // Nh3 1.Nh3 d5 2.g3 → 2...e5 (central)
  _chBookWeird['7657 1333 6656']={fr:1,fc:4,tr:3,tc:4};
  // Bird's 1.f4 d5 2.Nf3 Nf6 3.e3 → 3...g6 (Dutch-style setup)
  _chBookWeird['6545 1333 7655 0625 6454']={fr:1,fc:6,tr:2,tc:6};
  // Dunst 1.Nc3 d5 2.d4 → 2...Nf6 (into a Veresov)
  _chBookWeird['7152 1333 6343']={fr:0,fc:6,tr:2,tc:5};
  // Anti-h4 comeback: 1.h4 d5 (alternate response option)
  // Note: primary response is ...e5 but adding ...Nf6 as backup diversity
  _chBookWeird['6747 0625']={fr:1,fc:3,tr:3,tc:3};
  // 1.e4 Nf6 (Alekhine) transposition if we ever play it — fallback

  // Lookup: picks a book based on difficulty tier, falls back to Magnus.
  // Seedling (1) → Weird, Sapling (2) → Alireza, Grove+ → Magnus.
  function _pickBookLine(key){
    var diffVal=parseInt((document.getElementById('CHd')||{}).value,10)||2;
    var primary,fallback;
    if(diffVal===1){primary=_chBookWeird;fallback=_chBookMagnus;}
    else if(diffVal===2){primary=_chBookAlireza;fallback=_chBookMagnus;}
    else{primary=_chBookMagnus;fallback=null;}
    if(primary&&primary[key])return primary[key];
    if(fallback&&fallback[key])return fallback[key];
    return null;
  }

  // ── Commentary classifier ──
  // After each AI move, classify it into a short readable tag so the
  // player can see what the engine was *trying* to do. This is the
  // differentiator — no other browser chess narrates its own moves.
  //
  // Priority order of detection (most dramatic first):
  //   book  → the book flavor label
  //   check → "Check!"
  //   castle short/long
  //   big capture / sacrifice / trade
  //   knight lands on supported outpost (rank 4-6 white side, 3-5 black side)
  //   rook to open file or 7th rank
  //   queen maneuver
  //   pawn pushes (center vs flank)
  //   first move of minor piece → "Develops"
  //   fallback → quiet-move flavor by tier
  function _classifyMove(mv, preB, postB, piece, wasBook, bookLabel, tier){
    // Tier flavor prefix
    var prefix = tier===1 ? '🌱 ' : tier===2 ? '⚔️ ' : '🌳 ';
    if(wasBook) return prefix + (bookLabel || 'Book line');
    // Was the move a capture? Look at what was on the destination square
    // before the move (preB).
    var captured = preB[mv.tr][mv.tc];
    var capturedVal = captured ? (PIECE_VAL[captured.type] || 0) : 0;
    // Piece that moved
    var ptype = piece ? piece.type : null;
    var myVal = ptype ? (PIECE_VAL[ptype] || 0) : 0;
    // Check detection — does postB leave the opponent's king in check?
    var givesCheck = inCheck(postB, W);
    if(givesCheck) return prefix + 'Check!';
    // Castling: king moved 2 cols
    if(ptype === KING && Math.abs(mv.tc - mv.fc) === 2){
      return prefix + (mv.tc > mv.fc ? 'Castles short' : 'Castles long');
    }
    // Capture analysis
    if(captured){
      if(capturedVal >= myVal + 150) return prefix + 'Wins material';
      if(capturedVal <= myVal - 200) return prefix + 'Sacrifice';
      if(Math.abs(capturedVal - myVal) < 60) return prefix + 'Trade';
      return prefix + 'Captures';
    }
    // Knight outpost: knight landed on rank 3-5 (black side) with our
    // pawn diagonally behind supporting it. AI plays black so "behind"
    // is row+1 (one rank toward row 7).
    if(ptype === KNIGHT){
      var outRank = mv.tr >= 3 && mv.tr <= 5;
      if(outRank){
        var sup = false;
        for(var dc=-1; dc<=1; dc+=2){
          var sr = mv.tr - 1, sc = mv.tc + dc;
          if(sr>=0 && sr<8 && sc>=0 && sc<8){
            var q = postB[sr][sc];
            if(q && q.type===PAWN && q.color===B){ sup=true; break; }
          }
        }
        if(sup) return prefix + 'Knight outpost';
      }
    }
    // Rook to 7th rank (rank 6 from black's POV, row 6 on our array)
    if(ptype === ROOK){
      if(mv.tr === 6) return prefix + 'Rook slices the 7th';
      // Rook to open file: no pawns of either color on the destination file
      var openFile = true;
      for(var rr=0; rr<8; rr++){
        var pp = postB[rr][mv.tc];
        if(pp && pp.type === PAWN){ openFile=false; break; }
      }
      if(openFile) return prefix + 'Rook takes the file';
    }
    // Queen move (not first move — queen moves are often noteworthy)
    if(ptype === QUEEN) return prefix + 'Queen maneuver';
    // Pawn pushes
    if(ptype === PAWN){
      var center = mv.tc >= 2 && mv.tc <= 5;
      if(mv.tr >= 3 && mv.tr <= 4 && center) return prefix + 'Stakes the center';
      if(!center) return prefix + 'Flank advance';
      return prefix + 'Pawn push';
    }
    // Bishop development — first move off back rank (AI black, back rank=0)
    var devKey = mv.fr + '' + mv.fc;
    if((ptype === BISHOP || ptype === KNIGHT) && mv.fr === 0){
      if(!_pieceMovedOnce[devKey]){
        _pieceMovedOnce[devKey] = true;
        return prefix + 'Develops';
      }
    }
    // Fallback: tier-appropriate quiet-move tag
    if(tier === 1) return prefix + 'Wanders';
    if(tier === 2) return prefix + 'Builds pressure';
    return prefix + 'Quiet strength';
  }

  // Endgame king PST (centralize king in endgame)
  var PST_KING_END=[-50,-40,-30,-20,-20,-30,-40,-50,-30,-20,-10,0,0,-10,-20,-30,-30,-10,20,30,30,20,-10,-30,-30,-10,30,40,40,30,-10,-30,-30,-10,30,40,40,30,-10,-30,-30,-10,20,30,30,20,-10,-30,-30,-30,0,0,0,0,-30,-30,-50,-30,-30,-30,-30,-30,-30,-50];

  // Castling update helper (avoids duplicate code)
  function _updateCas(m,cas){
    if(m.fr===7&&m.fc===4){cas.wK=false;cas.wQ=false;}
    if(m.fr===0&&m.fc===4){cas.bK=false;cas.bQ=false;}
    if(m.fr===7&&m.fc===7||m.tr===7&&m.tc===7)cas.wK=false;
    if(m.fr===7&&m.fc===0||m.tr===7&&m.tc===0)cas.wQ=false;
    if(m.fr===0&&m.fc===7||m.tr===0&&m.tc===7)cas.bK=false;
    if(m.fr===0&&m.fc===0||m.tr===0&&m.tc===0)cas.bQ=false;
  }

  function evaluate(b){
    var score=0;
    var wPawns=[],bPawns=[];
    var wBishops=0,bBishops=0;
    var wMaterial=0,bMaterial=0;
    var wMobility=0,bMobility=0;
    // Material + PST + piece stats
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p)continue;
      var val=PIECE_VAL[p.type]||0;
      var pstIdx=p.color===W?r*8+c:(7-r)*8+c;
      var pst=PST[p.type]?PST[p.type][pstIdx]:0;
      if(p.color===W){
        score+=val+pst;wMaterial+=val;
        if(p.type===PAWN)wPawns.push({r:r,c:c});
        if(p.type===BISHOP)wBishops++;
      }else{
        score-=val+pst;bMaterial+=val;
        if(p.type===PAWN)bPawns.push({r:r,c:c});
        if(p.type===BISHOP)bBishops++;
      }
    }
    // Endgame: use centralized king PST
    var totalMat=wMaterial+bMaterial-40000;
    if(totalMat<2600){
      var wk=findKing(b,W),bk=findKing(b,B);
      if(wk)score+=PST_KING_END[wk[0]*8+wk[1]]-PST[KING][wk[0]*8+wk[1]];
      if(bk)score-=PST_KING_END[(7-bk[0])*8+bk[1]]-PST[KING][(7-bk[0])*8+bk[1]];
    }
    // Bishop pair
    if(wBishops>=2)score+=35;
    if(bBishops>=2)score-=35;
    // Pawn structure
    score+=_evalPawns(wPawns,bPawns,b);
    // King safety (middlegame only)
    if(totalMat>2600)score+=_evalKingSafety(b,W)-_evalKingSafety(b,B);
    // Rook bonuses
    score+=_evalRooks(b,wPawns,bPawns);
    // Magnus-flavor "taste" weights: outposts, majority endgame bias,
    // keep-the-queen middlegame, small space bonus. Small numeric
    // nudges that give the engine a recognizable positional voice.
    score+=_evalTaste(b,wPawns,bPawns,wMaterial,bMaterial);
    // Tempo bonus (small bonus for side to move — helps break ties)
    return score;
  }

  // TASTE — four personality weights that give Grove a Magnus-ish voice.
  // None of these change correctness. All are small enough (±30 max
  // per component) that material/PST still dominate decisions.
  function _evalTaste(b,wP,bP,wMat,bMat){
    var s=0,i,c;
    var totalMat=wMat+bMat;

    // 1. OUTPOST KNIGHT — supported, unchallengable knight on advanced rank.
    //   White outpost rows 2-4 (white's 5th-7th rank). Black outpost 3-5.
    for(var r=0;r<8;r++)for(c=0;c<8;c++){
      var p=b[r][c];if(!p||p.type!==KNIGHT)continue;
      var isW=p.color===W;
      var advRank=isW?(r>=2&&r<=4):(r>=3&&r<=5);
      if(!advRank)continue;
      // Supported by our own pawn diagonally behind?
      var backDir=isW?1:-1; // one rank behind (closer to our back row)
      var supported=false;
      for(var dc=-1;dc<=1;dc+=2){
        var sr=r+backDir,sc=c+dc;
        if(sr>=0&&sr<8&&sc>=0&&sc<8){
          var q=b[sr][sc];
          if(q&&q.type===PAWN&&q.color===p.color){supported=true;break;}
        }
      }
      if(!supported)continue;
      // Can an enemy pawn ever advance to challenge this square?
      // For white knight: any black pawn on columns c±1 at rows <r can
      // eventually advance down to attack. Symmetric for black.
      var challengable=false;
      for(var dc2=-1;dc2<=1;dc2+=2){
        var fc=c+dc2;if(fc<0||fc>7)continue;
        if(isW){
          for(var r2=r-1;r2>=1;r2--){
            var q2=b[r2][fc];
            if(q2&&q2.type===PAWN&&q2.color===B){challengable=true;break;}
          }
        }else{
          for(var r3=r+1;r3<=6;r3++){
            var q3=b[r3][fc];
            if(q3&&q3.type===PAWN&&q3.color===W){challengable=true;break;}
          }
        }
        if(challengable)break;
      }
      if(!challengable)s+=isW?25:-25;
    }

    // 2. PAWN MAJORITY IN LATE ENDGAME — Magnus's bread-and-butter grind.
    if(totalMat<1800){
      var wQs=0,wKs=0,bQs=0,bKs=0;
      for(i=0;i<wP.length;i++){if(wP[i].c<=3)wQs++;else wKs++;}
      for(i=0;i<bP.length;i++){if(bP[i].c<=3)bQs++;else bKs++;}
      if(wQs>bQs)s+=30;else if(bQs>wQs)s-=30;
      if(wKs>bKs)s+=30;else if(bKs>wKs)s-=30;
    }

    // 3. KEEP-THE-QUEEN MIDDLEGAME — in balanced positions moves 10-25,
    // +10 for having your queen on the board. Encourages the engine to
    // NOT initiate trades when it's positionally fine with queens.
    if(moveCount>=10&&moveCount<=25&&Math.abs(wMat-bMat)<150){
      var wHasQ=false,bHasQ=false;
      for(var r4=0;r4<8;r4++)for(var c4=0;c4<8;c4++){
        var pp=b[r4][c4];if(!pp||pp.type!==QUEEN)continue;
        if(pp.color===W)wHasQ=true;else bHasQ=true;
      }
      if(wHasQ)s+=10;
      if(bHasQ)s-=10;
    }

    // 4. SMALL SPACE BONUS — +2 per own pawn past your 4th rank.
    for(i=0;i<wP.length;i++)if(wP[i].r<=3)s+=2; // white 5th-8th rank
    for(i=0;i<bP.length;i++)if(bP[i].r>=4)s-=2; // black 5th-8th rank

    return s;
  }

  function _evalPawns(wP,bP,b){
    var s=0;
    var wF=[0,0,0,0,0,0,0,0],bF=[0,0,0,0,0,0,0,0];
    var i,c,f;
    for(i=0;i<wP.length;i++)wF[wP[i].c]++;
    for(i=0;i<bP.length;i++)bF[bP[i].c]++;
    // White pawns
    for(i=0;i<wP.length;i++){
      c=wP[i].c;
      // Doubled
      if(wF[c]>1)s-=10;
      // Isolated
      if((c===0||wF[c-1]===0)&&(c===7||wF[c+1]===0))s-=15;
      // Passed pawn (no enemy pawns ahead on same or adjacent files)
      var passed=true;
      for(var rr=wP[i].r-1;rr>=0;rr--){
        for(var cc=c-1;cc<=c+1;cc++){
          if(cc>=0&&cc<8&&b[rr][cc]&&b[rr][cc].type===PAWN&&b[rr][cc].color===B){passed=false;break;}
        }
        if(!passed)break;
      }
      if(passed)s+=15+(6-wP[i].r)*8;
      // Connected (pawn on adjacent file at same/±1 rank)
      var connected=false;
      for(var dc=-1;dc<=1;dc+=2){
        var nc=c+dc;if(nc<0||nc>7)continue;
        for(var dr=-1;dr<=1;dr++){
          var nr=wP[i].r+dr;if(nr<0||nr>7)continue;
          if(b[nr][nc]&&b[nr][nc].type===PAWN&&b[nr][nc].color===W){connected=true;break;}
        }
        if(connected)break;
      }
      if(connected)s+=5;
    }
    // Black pawns
    for(i=0;i<bP.length;i++){
      c=bP[i].c;
      if(bF[c]>1)s+=10;
      if((c===0||bF[c-1]===0)&&(c===7||bF[c+1]===0))s+=15;
      var passed2=true;
      for(var rr2=bP[i].r+1;rr2<8;rr2++){
        for(var cc2=c-1;cc2<=c+1;cc2++){
          if(cc2>=0&&cc2<8&&b[rr2][cc2]&&b[rr2][cc2].type===PAWN&&b[rr2][cc2].color===W){passed2=false;break;}
        }
        if(!passed2)break;
      }
      if(passed2)s-=15+(bP[i].r-1)*8;
      var connected2=false;
      for(var dc2=-1;dc2<=1;dc2+=2){
        var nc2=c+dc2;if(nc2<0||nc2>7)continue;
        for(var dr2=-1;dr2<=1;dr2++){
          var nr2=bP[i].r+dr2;if(nr2<0||nr2>7)continue;
          if(b[nr2][nc2]&&b[nr2][nc2].type===PAWN&&b[nr2][nc2].color===B){connected2=true;break;}
        }
        if(connected2)break;
      }
      if(connected2)s-=5;
    }
    return s;
  }

  function _evalKingSafety(b,col){
    var kp=findKing(b,col);if(!kp)return 0;
    var safety=0,kr=kp[0],kc=kp[1];
    var dir=col===W?-1:1;
    // Pawn shield
    for(var dc=-1;dc<=1;dc++){
      var sc=kc+dc;if(sc<0||sc>7)continue;
      var sr=kr+dir;
      if(sr>=0&&sr<8&&b[sr][sc]&&b[sr][sc].type===PAWN&&b[sr][sc].color===col){
        safety+=12;
      }else{
        safety-=15; // open lane near king
        // Check if file is fully open (very dangerous)
        var fileOpen=true;
        for(var rr=0;rr<8;rr++){if(b[rr][sc]&&b[rr][sc].type===PAWN){fileOpen=false;break;}}
        if(fileOpen)safety-=10;
      }
    }
    // Penalty for king in center during middlegame
    if(kc>=2&&kc<=5&&kr!==(col===W?7:0))safety-=20;
    return safety;
  }

  function _evalRooks(b,wP,bP){
    var s=0;
    var wF=[0,0,0,0,0,0,0,0],bF=[0,0,0,0,0,0,0,0];
    for(var i=0;i<wP.length;i++)wF[wP[i].c]++;
    for(var j=0;j<bP.length;j++)bF[bP[j].c]++;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p||p.type!==ROOK)continue;
      var sign=p.color===W?1:-1;
      // Open file
      if(wF[c]===0&&bF[c]===0)s+=sign*20;
      // Semi-open
      else if((p.color===W&&wF[c]===0)||(p.color===B&&bF[c]===0))s+=sign*12;
      // Rook on 7th rank (trapping king on 8th)
      if((p.color===W&&r===1)||(p.color===B&&r===6))s+=sign*25;
    }
    return s;
  }

  // ── SEARCH UPGRADES: Zobrist hashing, transposition table, killer moves,
  // history heuristic. Classic chess-programming triad. TT and killer
  // tables are reset at the start of each AI turn so stale entries from
  // prior games never haunt. History carries across turns (it's just a
  // per-piece-per-destination score bias).
  var _chZob={};
  var _chZobTurn=0,_chZobCas=[0,0,0,0],_chZobEP=[0,0,0,0,0,0,0,0];
  (function _initZob(){
    function r32(){return (Math.random()*4294967296)>>>0;}
    var types='PNBRQK';
    for(var ci=0;ci<2;ci++){
      var col=ci===0?'w':'b';
      for(var ti=0;ti<6;ti++){
        var k=col+types.charAt(ti);_chZob[k]=[];
        for(var s=0;s<64;s++)_chZob[k].push(r32());
      }
    }
    _chZobTurn=r32();
    for(var i=0;i<4;i++)_chZobCas[i]=r32();
    for(var j=0;j<8;j++)_chZobEP[j]=r32();
  })();
  function _zobHash(b,turn,cas,ep){
    var h=0;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p)continue;
      h^=_chZob[p.color+p.type][r*8+c];
    }
    if(turn===B)h^=_chZobTurn;
    if(cas.wK)h^=_chZobCas[0];
    if(cas.wQ)h^=_chZobCas[1];
    if(cas.bK)h^=_chZobCas[2];
    if(cas.bQ)h^=_chZobCas[3];
    if(ep)h^=_chZobEP[ep[1]];
    return h>>>0;
  }
  // TT entry: {depth, flag, score, bestMove}. flag: 0=exact, 1=lower, 2=upper.
  var _TT={},_TTCount=0,_TT_MAX=200000;
  var _killers=[];           // _killers[ply] = [move1, move2]
  var _history={};           // indexed by (color*6 + pieceIdx)*64 + toSq
  function _sameMove(a,b){if(!a||!b)return false;return a.fr===b.fr&&a.fc===b.fc&&a.tr===b.tr&&a.tc===b.tc;}
  function _histKey(b,m){
    var p=b[m.fr][m.fc];if(!p)return -1;
    var pidx='KQRBNP'.indexOf(p.type);
    var cidx=p.color===W?0:1;
    return (cidx*6+pidx)*64+m.tr*8+m.tc;
  }
  function _ttStore(hash,depth,flag,score,bestMove){
    // Cap TT size so a long game can't balloon memory on mobile. When
    // the cap is hit we wipe — acceptable because TT is per-turn anyway.
    if(_TTCount>=_TT_MAX){_TT={};_TTCount=0;}
    if(!_TT[hash])_TTCount++;
    _TT[hash]={depth:depth,flag:flag,score:score,bestMove:bestMove};
  }

  function orderMoves(b,moves,ply,ttMove){
    var k1=null,k2=null;
    if(typeof ply==='number'&&ply>=0&&_killers[ply]){
      k1=_killers[ply][0];k2=_killers[ply][1];
    }
    var scored=[];
    for(var i=0;i<moves.length;i++){
      var m=moves[i];
      var s=0;
      // TT best move: absolute priority over everything else
      if(ttMove&&_sameMove(m,ttMove))s+=100000;
      var target=b[m.tr][m.tc];
      // MVV-LVA: Most Valuable Victim - Least Valuable Attacker
      if(target)s+=10*(PIECE_VAL[target.type]||0)-(PIECE_VAL[b[m.fr][m.fc].type]||0);
      if(m.promo)s+=880;
      if(m.castle)s+=60;
      // Quiet-move bonuses: killers + history heuristic
      if(!target&&!m.promo){
        if(_sameMove(m,k1))s+=900;
        else if(_sameMove(m,k2))s+=850;
        var hk=_histKey(b,m);if(hk>=0)s+=(_history[hk]||0);
      }
      // Bonus for moves toward center
      var centerDist=Math.abs(m.tr-3.5)+Math.abs(m.tc-3.5);
      s-=centerDist*2;
      // Penalty for moving king in middlegame (unless castling)
      if(b[m.fr][m.fc].type===KING&&!m.castle)s-=30;
      scored.push({m:m,s:s});
    }
    scored.sort(function(a2,b2){return b2.s-a2.s;});
    var out=[];for(var k=0;k<scored.length;k++)out.push(scored[k].m);
    return out;
  }

  // Quiescence search — extends captures/promotions to avoid horizon effect
  function quiesce(b,alpha,beta,isMax,cas,ep,qdepth){
    var standPat=evaluate(b);
    if(qdepth<=0)return standPat;
    if(isMax){
      if(standPat>=beta)return beta;
      if(standPat>alpha)alpha=standPat;
    }else{
      if(standPat<=alpha)return alpha;
      if(standPat<beta)beta=standPat;
    }
    var col=isMax?W:B;
    var moves=getLegalMoves(b,col,cas,ep);
    var captures=[];
    for(var i=0;i<moves.length;i++){
      if(b[moves[i].tr][moves[i].tc]||moves[i].ep||moves[i].promo)captures.push(moves[i]);
    }
    if(!captures.length)return isMax?alpha:beta;
    captures=orderMoves(b,captures);
    for(var j=0;j<captures.length;j++){
      var nb=cloneBoard(b);
      var ncas={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
      var piece=nb[captures[j].fr][captures[j].fc];
      applyMove(nb,captures[j],ncas,ep);
      _updateCas(captures[j],ncas);
      var nep=null;
      if(piece.type===PAWN&&Math.abs(captures[j].tr-captures[j].fr)===2)
        nep=[(captures[j].fr+captures[j].tr)/2,captures[j].fc];
      var val=quiesce(nb,alpha,beta,!isMax,ncas,nep,qdepth-1);
      if(isMax){
        if(val>alpha)alpha=val;
        if(alpha>=beta)return beta;
      }else{
        if(val<beta)beta=val;
        if(alpha>=beta)return alpha;
      }
    }
    return isMax?alpha:beta;
  }

  function minimax(b,depth,alpha,beta,isMax,cas,ep,ply){
    if(typeof ply!=='number')ply=0;
    var turnCol=isMax?W:B;
    // TT probe — use stored score/bound if depth is sufficient, and in
    // any case pull out the stored best move to lead the ordering.
    var hash=_zobHash(b,turnCol,cas,ep);
    var tt=_TT[hash];
    var ttMove=null;
    if(tt){
      ttMove=tt.bestMove;
      if(tt.depth>=depth&&Math.abs(tt.score)<90000){
        // Mate scores excluded — their distance-from-root shifts.
        if(tt.flag===0)return tt.score;                  // exact
        if(tt.flag===1&&tt.score>=beta)return tt.score;  // lower bound fail-high
        if(tt.flag===2&&tt.score<=alpha)return tt.score; // upper bound fail-low
      }
    }
    if(depth===0)return quiesce(b,alpha,beta,isMax,cas,ep,4);
    var moves=getLegalMoves(b,turnCol,cas,ep);
    if(!moves.length){
      if(inCheck(b,turnCol))return isMax?-99999+(4-depth):99999-(4-depth);
      return 0;
    }
    moves=orderMoves(b,moves,ply,ttMove);
    var origAlpha=alpha,origBeta=beta;
    var best,i,bestMove=moves[0];
    if(isMax){
      best=-100000;
      for(i=0;i<moves.length;i++){
        var m=moves[i];
        var nb=cloneBoard(b);var ncas={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
        var piece=nb[m.fr][m.fc];
        applyMove(nb,m,ncas,ep);_updateCas(m,ncas);
        var nep=null;
        if(piece.type===PAWN&&Math.abs(m.tr-m.fr)===2)nep=[(m.fr+m.tr)/2,m.fc];
        var val=minimax(nb,depth-1,alpha,beta,false,ncas,nep,ply+1);
        if(val>best){best=val;bestMove=m;}
        if(best>alpha)alpha=best;
        if(beta<=alpha){
          // Beta cutoff: record killer + history for quiet moves
          if(!b[m.tr][m.tc]&&!m.promo){
            if(!_killers[ply])_killers[ply]=[null,null];
            if(!_sameMove(_killers[ply][0],m)){
              _killers[ply][1]=_killers[ply][0];
              _killers[ply][0]=m;
            }
            var hk=_histKey(b,m);if(hk>=0)_history[hk]=(_history[hk]||0)+depth*depth;
          }
          break;
        }
      }
    }else{
      best=100000;
      for(i=0;i<moves.length;i++){
        var m2=moves[i];
        var nb2=cloneBoard(b);var ncas2={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
        var piece2=nb2[m2.fr][m2.fc];
        applyMove(nb2,m2,ncas2,ep);_updateCas(m2,ncas2);
        var nep2=null;
        if(piece2.type===PAWN&&Math.abs(m2.tr-m2.fr)===2)nep2=[(m2.fr+m2.tr)/2,m2.fc];
        var val2=minimax(nb2,depth-1,alpha,beta,true,ncas2,nep2,ply+1);
        if(val2<best){best=val2;bestMove=m2;}
        if(best<beta)beta=best;
        if(beta<=alpha){
          if(!b[m2.tr][m2.tc]&&!m2.promo){
            if(!_killers[ply])_killers[ply]=[null,null];
            if(!_sameMove(_killers[ply][0],m2)){
              _killers[ply][1]=_killers[ply][0];
              _killers[ply][0]=m2;
            }
            var hk2=_histKey(b,m2);if(hk2>=0)_history[hk2]=(_history[hk2]||0)+depth*depth;
          }
          break;
        }
      }
    }
    // Store to TT. Skip mate scores (distance-from-root dependent).
    if(Math.abs(best)<90000){
      var flag;
      if(best<=origAlpha)flag=2;         // upper bound (fail-low)
      else if(best>=origBeta)flag=1;     // lower bound (fail-high)
      else flag=0;                       // exact
      _ttStore(hash,depth,flag,best,bestMove);
    }
    return best;
  }

  // ── Stockfish integration (lazy-loaded for Old Growth + Ancient tiers) ──
  // The hand-rolled minimax below stays the engine for Seedling/Sapling so
  // casual players never pay the ~1MB asm.js download. When the player
  // picks tier 3 or 4 we fetch stockfish.js from jsDelivr, instantiate it
  // as a Worker via blob URL (sidesteps CORS for cross-origin Workers),
  // and delegate move selection. On any failure we fall back silently to
  // the local engine so chess never breaks.
  var _sfWorker=null,_sfReady=false,_sfLoading=false,_sfCallback=null;
  function _loadStockfish(cb){
    if(_sfReady){cb();return;}
    if(_sfLoading){setTimeout(function(){_loadStockfish(cb);},250);return;}
    _sfLoading=true;
    var SF_URL='https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';
    fetch(SF_URL).then(function(r){return r.text();}).then(function(txt){
      try{
        var blob=new Blob([txt],{type:'application/javascript'});
        var url=URL.createObjectURL(blob);
        _sfWorker=new Worker(url);
        _sfWorker.onmessage=function(e){
          var line=typeof e.data==='string'?e.data:(e.data&&e.data.line)||'';
          if(line==='uciok'){_sfWorker.postMessage('isready');}
          else if(line==='readyok'){_sfReady=true;_sfLoading=false;cb();}
          else if(line.indexOf('bestmove')===0){
            var mv=line.split(' ')[1];
            if(_sfCallback){var c=_sfCallback;_sfCallback=null;c(mv);}
          }
        };
        _sfWorker.onerror=function(){_sfLoading=false;cb('error');};
        _sfWorker.postMessage('uci');
      }catch(e){_sfLoading=false;cb('error');}
    }).catch(function(){_sfLoading=false;cb('error');});
  }
  function _boardToFEN(){
    var rows=[];
    for(var r=0;r<8;r++){
      var s='',empty=0;
      for(var c=0;c<8;c++){
        var p=board[r][c];
        if(!p){empty++;continue;}
        if(empty){s+=empty;empty=0;}
        var ch=p.type;
        if(p.color==='b')ch=ch.toLowerCase();
        s+=ch;
      }
      if(empty)s+=empty;
      rows.push(s);
    }
    var cas='';
    if(castling.wK)cas+='K';if(castling.wQ)cas+='Q';
    if(castling.bK)cas+='k';if(castling.bQ)cas+='q';
    if(!cas)cas='-';
    var ep='-';
    if(epSquare){ep='abcdefgh'.charAt(epSquare[1])+(8-epSquare[0]);}
    return rows.join('/')+' '+turn+' '+cas+' '+ep+' '+halfmove+' '+(Math.floor(moveCount/2)+1);
  }
  function _uciToMove(uci){
    if(!uci||uci.length<4)return null;
    var fc='abcdefgh'.indexOf(uci.charAt(0));
    var fr=8-parseInt(uci.charAt(1),10);
    var tc='abcdefgh'.indexOf(uci.charAt(2));
    var tr=8-parseInt(uci.charAt(3),10);
    var promo=uci.length>4?uci.charAt(4).toUpperCase():null;
    var legal=getLegalMoves(board,B,castling,epSquare);
    for(var i=0;i<legal.length;i++){
      var m=legal[i];
      if(m.fr===fr&&m.fc===fc&&m.tr===tr&&m.tc===tc){
        if(promo)m.promo=promo; // makeMove reads m.promo — engine underpromotions were silently queening
        return m;
      }
    }
    return null;
  }
  function _aiMoveStockfish(skill){
    if(gameOver||turn!==B)return;
    // Personality opening: Ancient Oak (skill 8) plays the Magnus book
    // for its first 10 moves before Stockfish takes over. Old Growth
    // (skill 20) stays pure engine — no personality, just crush. This
    // is what gives Grove Chess a recognizable Magnus-flavored voice
    // at the second-highest tier without sacrificing Old Growth's edge.
    if(skill<=10&&moveLog.length<=20){
      var bookKey=moveLog.join(' ');
      var bm=_chBookMagnus[bookKey];
      if(bm){
        var legal=getLegalMoves(board,B,castling,epSquare);
        for(var bi=0;bi<legal.length;bi++){
          if(legal[bi].fr===bm.fr&&legal[bi].fc===bm.fc&&legal[bi].tr===bm.tr&&legal[bi].tc===bm.tc){
            sm('🌳 Grove opening');
            var _sfPreBB=cloneBoard(board);
            var _sfBp=board[legal[bi].fr][legal[bi].fc];
            makeMove(legal[bi]);
            _lastAIComment=_classifyMove(legal[bi],_sfPreBB,board,_sfBp,true,'Magnus line',3);
            checkGameState();render();return;
          }
        }
      }
    }
    sm('🌳 Engine thinking...');
    _loadStockfish(function(err){
      if(err==='error'||!_sfReady){
        sm('Engine unavailable, using local AI.');
        _aiMoveLocal();return;
      }
      // Re-check turn in case player exited / undid during async load
      if(gameOver||turn!==B)return;
      _sfWorker.postMessage('setoption name Skill Level value '+skill);
      _sfWorker.postMessage('position fen '+_boardToFEN());
      _sfCallback=function(uciMove){
        if(turn!==B||gameOver)return;
        var mv=_uciToMove(uciMove);
        if(!mv){_aiMoveLocal();return;}
        var _sfPre=cloneBoard(board);
        var _sfPc=board[mv.fr][mv.fc];
        makeMove(mv);
        // Stockfish tier gets a neutral "Engine" prefix but still shows
        // the move shape so the player learns patterns.
        var _sfTag=_classifyMove(mv,_sfPre,board,_sfPc,false,null,skill>=15?5:4);
        // Override the 🌳 prefix for pure-engine tier (Old Growth)
        if(skill>=15) _sfTag=_sfTag.replace(/^🌳 /,'♛ ');
        _lastAIComment=_sfTag;
        checkGameState();render();
      };
      _sfWorker.postMessage('go movetime '+(skill>=15?1500:800));
    });
  }

  function aiMove(){
    if(gameOver||turn!==B)return;
    // Dispatch: tier 3 = Stockfish skill 8, tier 4 = Stockfish skill 20.
    // Tiers 1-2 keep the hand-rolled minimax (instant, no asset cost).
    var diffVal=parseInt((document.getElementById('CHd')||{}).value,10)||2;
    if(diffVal>=3){
      var skill=diffVal===3?8:20;
      _aiMoveStockfish(skill);
      return;
    }
    _aiMoveLocal();
  }

  function _aiMoveLocal(){
    if(gameOver||turn!==B)return;
    var _diffTier=parseInt((document.getElementById('CHd')||{}).value,10)||2;
    // Opening book lookup — flavor picked from current difficulty tier
    var bookKey=moveLog.join(' ');
    var bm=_pickBookLine(bookKey);
    if(bm){
      // Verify book move is legal before playing. Belt-and-suspenders
      // against a typo in any of the three books — illegal book moves
      // fall through to the search engine instead of blowing up.
      var legal=getLegalMoves(board,B,castling,epSquare);
      for(var bi=0;bi<legal.length;bi++){
        if(legal[bi].fr===bm.fr&&legal[bi].fc===bm.fc&&legal[bi].tr===bm.tr&&legal[bi].tc===bm.tc){
          var _bookFlavor=_diffTier===1?'Offbeat':_diffTier===2?'Alireza line':'Magnus line';
          var _preBB=cloneBoard(board);
          var _bp=board[legal[bi].fr][legal[bi].fc];
          makeMove(legal[bi]);
          _lastAIComment=_classifyMove(legal[bi],_preBB,board,_bp,true,_bookFlavor,_diffTier);
          checkGameState();render();return;
        }
      }
    }
    var moves=getLegalMoves(board,B,castling,epSquare);
    if(!moves.length)return;
    // Reset transposition table + killers at the start of each AI turn.
    // History heuristic keeps its values but gets halved so old biases
    // don't dominate new positions.
    _TT={};_TTCount=0;_killers=[];
    for(var hk in _history)_history[hk]=_history[hk]>>1;
    moves=orderMoves(board,moves,0,null);
    var bestMove=moves[0];
    var bestVal=100000;
    // Iterative deepening with time limit (1.5s for mobile safety)
    var t0=Date.now();
    var maxTime=1500;
    var pieceCount=0;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(board[r][c])pieceCount++;
    var _chDepMap={1:2,2:3,3:4,4:5};
    var _chDep=_chDepMap[parseInt((document.getElementById('CHd')||{}).value)]||3;
    var maxDepth=_chDep+(pieceCount<14?1:0);
    for(var depth=1;depth<=maxDepth;depth++){
      var depthBest=moves[0];
      var depthVal=100000;
      var timedOut=false;
      for(var i=0;i<moves.length;i++){
        if(Date.now()-t0>maxTime){timedOut=true;break;}
        var nb=cloneBoard(board);
        var ncas={wK:castling.wK,wQ:castling.wQ,bK:castling.bK,bQ:castling.bQ};
        var piece=nb[moves[i].fr][moves[i].fc];
        applyMove(nb,moves[i],ncas,epSquare);_updateCas(moves[i],ncas);
        var nep=null;
        if(piece.type===PAWN&&Math.abs(moves[i].tr-moves[i].fr)===2)nep=[(moves[i].fr+moves[i].tr)/2,moves[i].fc];
        // Pass ply=1 — root children live at ply 1 in the killer table.
        var val=minimax(nb,depth-1,-100000,100000,true,ncas,nep,1);
        if(val<depthVal){depthVal=val;depthBest=moves[i];}
      }
      if(!timedOut){
        bestMove=depthBest;bestVal=depthVal;
        // Pre-seed the next iteration's ordering with best-so-far.
        // Move depthBest to front for depth+1 to hit TT PV faster.
        for(var pi=0;pi<moves.length;pi++){
          if(_sameMove(moves[pi],depthBest)){
            moves.splice(pi,1);moves.unshift(depthBest);break;
          }
        }
      }
      if(Date.now()-t0>maxTime)break;
    }
    var _preB=cloneBoard(board);
    var _pc=board[bestMove.fr][bestMove.fc];
    makeMove(bestMove);
    _lastAIComment=_classifyMove(bestMove,_preB,board,_pc,false,null,_diffTier);
    checkGameState();
    render();
  }

  function checkGameState(){
    var moves=getLegalMoves(board,turn,castling,epSquare);
    if(!moves.length){
      gameOver=true;
      // Stephen 2026-05-07: AI checkmate / stalemate / 50-move /
      // insufficient material / threefold repetition all previously
      // ended silently with NO _e() call \u2014 player invested 10+ minutes
      // and walked away with 0 sunbeams. Now every game-end fires
      // either game_win or game_loss so anti-farm + fairness math
      // can credit something. game_loss has weight 0 in _aw
      // (line ~60128) but still trips session caps + completion
      // cooldown which is the right behavior for "you played a
      // valid game, here's a small consolation."
      if(inCheck(board,turn)){
        if(turn===W){sm('Checkmate \u2014 AI wins!');try{_e('game_loss');}catch(e){}_sr('chess',{w:false,s:moveCount});}
        else{sm('Checkmate \u2014 You win!');_e('game_win');_playWin();_sr('chess',{w:true,s:moveCount});}
      }else{
        sm('Stalemate \u2014 Draw!');try{_e('game_loss');}catch(e){}_sr('chess',{w:false,s:moveCount});
      }
    }else if(halfmove>=100){
      gameOver=true;sm('Draw \u2014 50-move rule');try{_e('game_loss');}catch(e){}_sr('chess',{w:false,s:moveCount});
    }else if(insufficientMaterial(board)){
      gameOver=true;sm('Draw \u2014 Insufficient material');try{_e('game_loss');}catch(e){}_sr('chess',{w:false,s:moveCount});
    }else{
      // Threefold repetition
      var pk=posKey(board,turn,castling,epSquare);
      if(posHistory[pk]&&posHistory[pk]>=3){
        gameOver=true;sm('Draw \u2014 Threefold repetition');try{_e('game_loss');}catch(e){}_sr('chess',{w:false,s:moveCount});
      }else if(inCheck(board,turn)){
        if(turn===W){
          // Player is in check — AI just delivered it. Show AI's comment
          // alongside the check warning so they see what the engine did.
          sm(_lastAIComment? _lastAIComment+' · Check!' : 'Check!');
        } else {
          sm('AI is in check');
        }
      }else{
        if(turn===W){
          sm(_lastAIComment? _lastAIComment+' · Your move' : 'Your move');
        } else {
          sm('AI thinking...');
        }
      }
    }
  }

  function getPieceSVG(piece){
    if(piece.color===W)return _skinChess.playerPieces[piece.type]||'';
    return _skinChess.aiPieces[piece.type]||'';
  }

  function render(){
    var sk=_skinChess;
    var kingPos=findKing(board,turn);
    var isInCheck=inCheck(board,turn);
    var legal=[];
    if(selSq){
      var allLegal=getLegalMoves(board,W,castling,epSquare);
      for(var i=0;i<allLegal.length;i++){
        if(allLegal[i].fr===selSq[0]&&allLegal[i].fc===selSq[1])legal.push(allLegal[i]);
      }
    }
    // Build captured rows
    var capBHtml='<div class="ch-cap-row">';
    for(var ci=0;ci<capturedW.length;ci++)capBHtml+=_skinChess.aiPieces[capturedW[ci]]||'';
    capBHtml+='</div>';
    var capWHtml='<div class="ch-cap-row">';
    for(var cj=0;cj<capturedB.length;cj++)capWHtml+=_skinChess.playerPieces[capturedB[cj]]||'';
    capWHtml+='</div>';
    // Board
    var bHtml='<div class="ch-wrap"><img class="ch-bg" src="'+_chArt+'chess-board.png"><div class="chb">';
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var isDark=(r+c)%2===1;
      var bg=isDark?'rgba(0,0,0,.12)':'rgba(255,255,255,.08)';
      var cls='chs';
      if(selSq&&selSq[0]===r&&selSq[1]===c)cls+=' ch-sel';
      if(lastMove&&((lastMove.fr===r&&lastMove.fc===c)||(lastMove.tr===r&&lastMove.tc===c)))cls+=' ch-last';
      // Placed piece animation on destination
      if(lastMove&&lastMove.tr===r&&lastMove.tc===c)cls+=' ch-placed';
      // Check highlight on king
      if(isInCheck&&kingPos&&kingPos[0]===r&&kingPos[1]===c)cls+=' ch-check';
      // Legal move indicator
      var isLegalTarget=false;
      var isCapture=false;
      for(var li=0;li<legal.length;li++){if(legal[li].tr===r&&legal[li].tc===c){isLegalTarget=true;if(board[r][c]||legal[li].ep)isCapture=true;break;}}
      if(isLegalTarget&&isCapture)cls+=' ch-cap';
      else if(isLegalTarget)cls+=' ch-move';
      var piece=board[r][c];
      var content=piece?getPieceSVG(piece):'';
      bHtml+='<div class="'+cls+'" style="background:'+bg+'" onclick="_CHClick('+r+','+c+')">'+content+'</div>';
    }
    bHtml+='</div></div>';
    var statusText='';
    var gm=document.getElementById('_gm');
    if(gm)statusText=gm.textContent;
    var mvHtml='<div class="ch-status">Move '+moveCount+'</div>';
    var _scrollY=window.scrollY;
    boardEl.innerHTML=capBHtml+bHtml+capWHtml+mvHtml;
    window.scrollTo(0,_scrollY);
  }

  var _chPendingPromo=null;
  var _chGen=0; // bumped by New Game so a stale "AI thinking" timer can't move on a fresh board
  function _chDoMove(m){
    var wasCapture=!!board[m.tr][m.tc]||m.ep;
    var wasCastle=!!m.castle;
    selSq=null;_chPendingPromo=null;
    makeMove(m);
    var isCheck=inCheck(board,turn);
    checkGameState();
    if(wasCapture)_play('dig');
    else if(wasCastle)_play('click');
    else _play('tap');
    if(isCheck)setTimeout(function(){_play('lose')},200);
    render();
    var g=_chGen;
    if(!gameOver&&turn===B)setTimeout(function(){if(g!==_chGen)return;sm('AI thinking...');render();setTimeout(function(){
      if(g!==_chGen)return;
      aiMove();
      var aiCheck=inCheck(board,W);
      if(board._lastCap)_play('dig');else _play('tap');
      if(aiCheck)setTimeout(function(){_play('lose')},200);
    },50);},350);
  }
  window._CHPromo=function(type){
    if(!_chPendingPromo)return;
    _chPendingPromo.promo=type;
    _chDoMove(_chPendingPromo);
  };
  window._CHClick=function(r,c){
    if(gameOver||turn!==W||_chPendingPromo)return;
    var piece=board[r][c];
    if(selSq){
      var allLegal=getLegalMoves(board,W,castling,epSquare);
      for(var i=0;i<allLegal.length;i++){
        var m=allLegal[i];
        if(m.fr===selSq[0]&&m.fc===selSq[1]&&m.tr===r&&m.tc===c){
          if(m.promo){
            _chPendingPromo=m;_play('tap');
            var promoHtml='<div class="ch-promo">';
            var pts=[QUEEN,ROOK,BISHOP,KNIGHT];
            for(var pi=0;pi<pts.length;pi++)promoHtml+='<img src="'+_chArt+'p-'+{Q:'queen',R:'rook',B:'bishop',N:'knight'}[pts[pi]]+'-green.png" onclick="_CHPromo(\''+pts[pi]+'\')">';
            promoHtml+='</div>';
            var wrap=document.querySelector('.ch-wrap');
            if(wrap){var pd=document.createElement('div');pd.innerHTML=promoHtml;wrap.appendChild(pd.firstChild)}
            return;
          }
          _chDoMove(m);return;
        }
      }
    }
    if(piece&&piece.color===W){_play('click');selSq=[r,c];}
    else{selSq=null;}
    render();
  };

  window._CHNew=function(){
    _chGen++;
    _chPendingPromo=null;selSq=null;
    initBoard();
    _lastAIComment='';_pieceMovedOnce={};
    sm('Your move');
    render();
  };

  window._CHUndo=function(){
    // During the promotion picker, Undo just cancels the picker.
    if(_chPendingPromo){_chPendingPromo=null;selSq=null;render();return;}
    if(gameOver||turn!==W||history.length<2)return;
    // Undo AI move + player move
    undoMove();undoMove();
    gameOver=false;
    selSq=null;
    checkGameState();
    if(!gameOver)sm('Your move');
    render();
  };

  // ── Init ──
  var boardEl;
  ms(a,'Move:<strong id="CHm">0</strong>');
  mm(a,'Your move');
  boardEl=document.createElement('div');boardEl.id='CHboard';
  boardEl.style.cssText='padding:4px 0';a.appendChild(boardEl);
  mc(a).innerHTML='<select class="gsl" id="CHd" style="max-width:160px" onchange="var v=this.value;_setDiff(v===\'1\'?\'easy\':v===\'2\'?\'medium\':v===\'3\'?\'hard\':\'expert\')"><option value="1">Seedling</option><option value="2" selected>Sapling</option><option value="3">Old Growth ♛</option><option value="4">Ancient ♛</option></select><button class="gb-new" onclick="_CHNew()"><img src="assets/games/new-game-btn.png" alt="New Game"></button><button class="gb" onclick="_CHUndo()">↩ Undo</button>';
  _setDiff('medium');
  // Terminate the Stockfish worker when the player leaves the game —
  // otherwise it keeps burning CPU until page reload.
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    _chGen++;
    if(_sfWorker){try{_sfWorker.terminate();}catch(e){}_sfWorker=null;_sfReady=false;_sfLoading=false;_sfCallback=null;}
  });
  initBoard();render();
}

window._gameFns.chess=GCH;
})();
