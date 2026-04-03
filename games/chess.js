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
  }

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

  // Opening book: maps move sequence to AI response (AI plays black)
  // Coordinates: row0=rank8, col0=a-file. Move = "frfctrtc"
  var _chBook={};
  // Response to 1.e4
  _chBook['6444']={fr:1,fc:2,tr:3,tc:2};           // 1...c5 (Sicilian)
  // Response to 1.d4
  _chBook['6343']={fr:0,fc:6,tr:2,tc:5};           // 1...Nf6 (Indian)
  // Response to 1.c4
  _chBook['6242']={fr:1,fc:4,tr:3,tc:4};           // 1...e5
  // Response to 1.Nf3
  _chBook['7655']={fr:1,fc:3,tr:3,tc:3};           // 1...d5
  // Response to 1.b3
  _chBook['6151']={fr:1,fc:4,tr:3,tc:4};           // 1...e5
  // Response to 1.g3
  _chBook['6656']={fr:1,fc:3,tr:3,tc:3};           // 1...d5
  // Sicilian: 1.e4 c5 2.Nf3 → d6
  _chBook['6444 1232 7655']={fr:1,fc:3,tr:2,tc:3};
  // Sicilian: 1.e4 c5 2.Nc3 → Nc6
  _chBook['6444 1232 7152']={fr:0,fc:1,tr:2,tc:2};
  // Sicilian: 1.e4 c5 2.d4 → cxd4
  _chBook['6444 1232 6343']={fr:3,fc:2,tr:4,tc:3};
  // Sicilian Najdorf: 1.e4 c5 2.Nf3 d6 3.d4 → cxd4
  _chBook['6444 1232 7655 1323 6343']={fr:3,fc:2,tr:4,tc:3};
  // Open Sicilian: ...cxd4 4.Nxd4 → Nf6
  _chBook['6444 1232 7655 1323 6343 3243 5543']={fr:0,fc:6,tr:2,tc:5};
  // Najdorf: ...Nf6 5.Nc3 → a6
  _chBook['6444 1232 7655 1323 6343 3243 5543 0625 7152']={fr:1,fc:0,tr:2,tc:0};
  // Indian: 1.d4 Nf6 2.c4 → e6
  _chBook['6343 0625 6242']={fr:1,fc:4,tr:2,tc:4};
  // Indian: 1.d4 Nf6 2.Nf3 → d5
  _chBook['6343 0625 7655']={fr:1,fc:3,tr:3,tc:3};
  // Nimzo: 1.d4 Nf6 2.c4 e6 3.Nc3 → Bb4
  _chBook['6343 0625 6242 1424 7152']={fr:0,fc:5,tr:3,tc:1};
  // QGD: 1.d4 Nf6 2.c4 e6 3.Nf3 → d5
  _chBook['6343 0625 6242 1424 7655']={fr:1,fc:3,tr:3,tc:3};
  // QGD: 1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 → O-O
  _chBook['6343 0625 6242 1424 7152 0531 6454']={fr:0,fc:4,tr:0,tc:6,castle:'K'};
  // KID: 1.d4 Nf6 2.c4 g6
  _chBook['6343 0625 6242']={fr:1,fc:4,tr:2,tc:4}; // e6 (flexible)
  // English: 1.c4 e5 2.Nc3 → Nf6
  _chBook['6242 1434 7152']={fr:0,fc:6,tr:2,tc:5};
  // Ruy Lopez defense: 1.e4 e5 2.Nf3 → Nc6 (if AI played e5)
  _chBook['6444 1434 7655']={fr:0,fc:1,tr:2,tc:2};

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
    // Tempo bonus (small bonus for side to move — helps break ties)
    return score;
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

  function orderMoves(b,moves){
    var scored=[];
    for(var i=0;i<moves.length;i++){
      var m=moves[i];
      var s=0;
      var target=b[m.tr][m.tc];
      // MVV-LVA: Most Valuable Victim - Least Valuable Attacker
      if(target)s+=10*(PIECE_VAL[target.type]||0)-(PIECE_VAL[b[m.fr][m.fc].type]||0);
      if(m.promo)s+=880;
      if(m.castle)s+=60;
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

  function minimax(b,depth,alpha,beta,isMax,cas,ep){
    if(depth===0)return quiesce(b,alpha,beta,isMax,cas,ep,4);
    var col=isMax?W:B;
    var moves=getLegalMoves(b,col,cas,ep);
    if(!moves.length){
      if(inCheck(b,col))return isMax?-99999+(4-depth):99999-(4-depth);
      return 0;
    }
    moves=orderMoves(b,moves);
    var best,i;
    if(isMax){
      best=-100000;
      for(i=0;i<moves.length;i++){
        var nb=cloneBoard(b);var ncas={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
        var piece=nb[moves[i].fr][moves[i].fc];
        applyMove(nb,moves[i],ncas,ep);_updateCas(moves[i],ncas);
        var nep=null;
        if(piece.type===PAWN&&Math.abs(moves[i].tr-moves[i].fr)===2)nep=[(moves[i].fr+moves[i].tr)/2,moves[i].fc];
        var val=minimax(nb,depth-1,alpha,beta,false,ncas,nep);
        if(val>best)best=val;
        if(best>alpha)alpha=best;
        if(beta<=alpha)break;
      }
    }else{
      best=100000;
      for(i=0;i<moves.length;i++){
        var nb2=cloneBoard(b);var ncas2={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
        var piece2=nb2[moves[i].fr][moves[i].fc];
        applyMove(nb2,moves[i],ncas2,ep);_updateCas(moves[i],ncas2);
        var nep2=null;
        if(piece2.type===PAWN&&Math.abs(moves[i].tr-moves[i].fr)===2)nep2=[(moves[i].fr+moves[i].tr)/2,moves[i].fc];
        var val2=minimax(nb2,depth-1,alpha,beta,true,ncas2,nep2);
        if(val2<best)best=val2;
        if(best<beta)beta=best;
        if(beta<=alpha)break;
      }
    }
    return best;
  }

  function aiMove(){
    if(gameOver||turn!==B)return;
    // Opening book lookup
    var bookKey=moveLog.join(' ');
    if(_chBook[bookKey]){
      var bm=_chBook[bookKey];
      // Verify book move is legal
      var legal=getLegalMoves(board,B,castling,epSquare);
      for(var bi=0;bi<legal.length;bi++){
        if(legal[bi].fr===bm.fr&&legal[bi].fc===bm.fc&&legal[bi].tr===bm.tr&&legal[bi].tc===bm.tc){
          makeMove(legal[bi]);checkGameState();render();return;
        }
      }
    }
    var moves=getLegalMoves(board,B,castling,epSquare);
    if(!moves.length)return;
    moves=orderMoves(board,moves);
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
        var val=minimax(nb,depth-1,-100000,100000,true,ncas,nep);
        if(val<depthVal){depthVal=val;depthBest=moves[i];}
      }
      if(!timedOut){
        bestMove=depthBest;bestVal=depthVal;
      }
      if(Date.now()-t0>maxTime)break;
    }
    makeMove(bestMove);
    checkGameState();
    render();
  }

  function checkGameState(){
    var moves=getLegalMoves(board,turn,castling,epSquare);
    if(!moves.length){
      gameOver=true;
      if(inCheck(board,turn)){
        if(turn===W){sm('Checkmate \u2014 AI wins!');_sr('chess',{w:false,s:moveCount});}
        else{sm('Checkmate \u2014 You win!');_e('game_win');_playWin();_sr('chess',{w:true,s:moveCount});}
      }else{
        sm('Stalemate \u2014 Draw!');_sr('chess',{w:false,s:moveCount});
      }
    }else if(halfmove>=100){
      gameOver=true;sm('Draw \u2014 50-move rule');_sr('chess',{w:false,s:moveCount});
    }else if(insufficientMaterial(board)){
      gameOver=true;sm('Draw \u2014 Insufficient material');_sr('chess',{w:false,s:moveCount});
    }else{
      // Threefold repetition
      var pk=posKey(board,turn,castling,epSquare);
      if(posHistory[pk]&&posHistory[pk]>=3){
        gameOver=true;sm('Draw \u2014 Threefold repetition');_sr('chess',{w:false,s:moveCount});
      }else if(inCheck(board,turn)){
        sm(turn===W?'Check!':'AI is in check');
      }else{
        sm(turn===W?'Your move':'AI thinking...');
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
    if(!gameOver&&turn===B)setTimeout(function(){sm('AI thinking...');render();setTimeout(function(){
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
    initBoard();
    sm('Your move');
    render();
  };

  window._CHUndo=function(){
    if(gameOver||history.length<2)return;
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
  mc(a).innerHTML='<select class="gsl" id="CHd" style="max-width:130px" onchange="var v=this.value;_setDiff(v===\'1\'?\'easy\':v===\'2\'?\'medium\':v===\'3\'?\'hard\':\'expert\')"><option value="1">Seedling</option><option value="2" selected>Sapling</option><option value="3">Old Growth</option><option value="4">Ancient</option></select><button class="gb" onclick="_CHNew()">🔄 New</button><button class="gb" onclick="_CHUndo()">↩ Undo</button>';
  _setDiff('medium');
  initBoard();render();
}

window._gameFns.chess=GCH;
})();
