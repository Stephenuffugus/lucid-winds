#!/usr/bin/env python3
"""Grove Chess engine proof: a perft count (every legal move to a depth) of the REAL games/chess.js against the standard
positions. python3 -I tools/chess-tests/perft.py   (about 40 s on this box). The engine core (from "var PAWN='P'" to the
move-table comment) is sliced out of the live file into a Node harness, so the harness can never drift from the game.
Promotions queen only (the engine offers no underpromotion), so positions that promote at the counted depth are left out.
25 Oct 2026: found the pawn attack direction inverted (position 3 gave 15 for 14; Kiwipete 97983 for 97862 at depth 3)."""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(os.path.join(ROOT, "games", "chess.js"), encoding="utf-8").read()
i = src.index("var PAWN='P'"); j = src.index("  // ── Stockfish integration"); core = src[i:j]   # the rules core AND the local search (books, eval, TT, quiescence, minimax)
TAIL = r'''
function fromFEN(f){var p=f.split(' '),rows=p[0].split('/'),b=[];for(var r=0;r<8;r++){b[r]=[];var c=0;for(var k=0;k<rows[r].length;k++){var ch=rows[r][k];if(/\d/.test(ch)){for(var z=0;z<+ch;z++)b[r][c++]=EMPTY;}else{b[r][c++]={type:ch.toUpperCase(),color:ch===ch.toUpperCase()?W:B};}}}
  var cas={wK:p[2].indexOf('K')>=0,wQ:p[2].indexOf('Q')>=0,bK:p[2].indexOf('k')>=0,bQ:p[2].indexOf('q')>=0};var ep=null;if(p[3]!=='-'){ep=[8-+p[3][1],'abcdefgh'.indexOf(p[3][0])];}return {b:b,col:p[1]==='w'?W:B,cas:cas,ep:ep};}
function rightsAfter(cas,m){var c={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};if(m.fr===7&&m.fc===4){c.wK=false;c.wQ=false;}if(m.fr===0&&m.fc===4){c.bK=false;c.bQ=false;}if(m.fr===7&&m.fc===7)c.wK=false;if(m.fr===7&&m.fc===0)c.wQ=false;if(m.fr===0&&m.fc===7)c.bK=false;if(m.fr===0&&m.fc===0)c.bQ=false;if(m.tr===7&&m.tc===7)c.wK=false;if(m.tr===7&&m.tc===0)c.wQ=false;if(m.tr===0&&m.tc===7)c.bK=false;if(m.tr===0&&m.tc===0)c.bQ=false;return c;}
function perft(b,col,cas,ep,d){var ms=getLegalMoves(b,col,cas,ep);if(d===1)return ms.length;var n=0;for(var i=0;i<ms.length;i++){var m=ms[i],nb=cloneBoard(b);var pc=nb[m.fr][m.fc];applyMove(nb,m,cas,ep);var nep=(pc.type===PAWN&&Math.abs(m.tr-m.fr)===2)?[(m.fr+m.tr)/2,m.fc]:null;n+=perft(nb,col===W?B:W,rightsAfter(cas,m),nep,d-1);}return n;}
var T=[['start position','rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',[20,400,8902,197281]],
 ['Kiwipete','r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -',[48,2039,97862]],
 ['position 3','8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -',[14,191,2812,43238]],
 ['position 4','r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq -',[6]],
 ['position 6','r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - -',[46,2079,89890]],
 ['castling through check','r3k2r/8/8/8/8/8/8/R3K2R w KQkq -',[26]]];
var bad=0;for(var t=0;t<T.length;t++){var f=fromFEN(T[t][1]);var out=[];for(var d=1;d<=T[t][2].length;d++){var got=perft(f.b,f.col,f.cas,f.ep,d);var ok=got===T[t][2][d-1];if(!ok)bad++;out.push('d'+d+' '+got+(ok?' ok':' WANT '+T[t][2][d-1]));}console.log(T[t][0]+': '+out.join(', '));}
/* the rules fixtures (25 Oct 2026, the review's four reproduced findings) */
var N=[], mv=function(fr,fc,tr,tc){return {fr:fr,fc:fc,tr:tr,tc:tc};};
initBoard(); var k0=posKey(board,turn,castling,epSquare);
[mv(7,6,5,5),mv(0,6,2,5),mv(5,5,7,6),mv(2,5,0,6),mv(7,6,5,5),mv(0,6,2,5),mv(5,5,7,6),mv(2,5,0,6)].forEach(function(m){makeMove(m);});
N.push(['the start position occurs three times after two knight cycles', posHistory[k0]===3, posHistory[k0]]);
initBoard(); makeMove(mv(6,4,4,4)); makeMove(mv(1,4,3,4));
N.push(['FEN fullmove after 1.e4 e5 is 2', FEN_TAIL()===2, FEN_TAIL()]);
initBoard(); makeMove(mv(6,4,4,4));   /* e4: the target e3 exists but no black pawn can take it */
N.push(['a bare en passant target does not split the position', posKey(board,turn,castling,epSquare)===posKey(board,turn,castling,null), epSquare]);
var f2=fromFEN('4k3/8/8/8/3p4/8/4P3/4K3 w - -'); var b2=cloneBoard(f2.b); applyMove(b2,mv(6,4,4,4),f2.cas,null);
N.push(['a capturable en passant target is part of the position', posKey(b2,B,f2.cas,[5,4])!==posKey(b2,B,f2.cas,null), 'd4 pawn can take e3']);
var dead=function(fen){return insufficientMaterial(fromFEN(fen).b);};
N.push(['K+B v K+B on one colour is dead', dead('4k3/8/8/8/8/2b5/8/2B1K3 w - -')===true]);
N.push(['K+B v K+B on opposite colours is not', dead('4k3/8/8/8/8/2b5/8/3BK3 w - -')===false]);
N.push(['K+N v K+N is not', dead('4k3/8/8/8/8/2n5/8/2N1K3 w - -')===false]);
N.push(['K+B+B on one colour v K is dead', dead('4k3/8/8/8/8/8/8/B1B1K3 w - -')===true]);
N.push(['K+B v K is dead (as before)', dead('4k3/8/8/8/8/8/8/2B1K3 w - -')===true]);
/* the engine upgrade fixtures (25 Oct 2026, the review's search and worker findings) */
initBoard(); makeMove(mv(6,4,4,4)); makeMove(mv(1,4,3,4)); makeMove(mv(7,6,5,5));
N.push(['the UCI history reads e2e4 e7e5 g1f3', uciLog.join(' ')==='e2e4 e7e5 g1f3', uciLog.join(' ')]);
undoMove(); N.push(['an undo pops the UCI history', uciLog.join(' ')==='e2e4 e7e5', uciLog.join(' ')]);
var fp=fromFEN('4k3/1P6/8/8/8/8/8/4K3 w - -'); board=fp.b; turn=W; castling=fp.cas; epSquare=null; uciLog=[]; history=[];
var pm=mv(1,1,0,1); pm.promo=QUEEN; makeMove(pm); N.push(['a promotion carries its suffix', uciLog.join(' ')==='b7b8q', uciLog.join(' ')]);
var mate=fromFEN('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq -');   /* fool\'s mate: white to move, mated */
N.push(['a mated leaf scores as mate, not a quiet evaluation', quiesce(mate.b,-100000,100000,true,mate.cas,null,4)===-99999, quiesce(mate.b,-100000,100000,true,mate.cas,null,4)]);
var stale=fromFEN('7k/5Q2/6K1/8/8/8/8/8 b - -');
N.push(['a stalemated leaf scores zero', quiesce(stale.b,-100000,100000,false,stale.cas,null,4)===0, quiesce(stale.b,-100000,100000,false,stale.cas,null,4)]);
var chk=fromFEN('7k/8/8/8/8/8/8/3QK2r w - -');   /* white in check by the rook, only quiet king moves, then the queen falls */
N.push(['in check, quiescence searches the quiet evasions instead of standing pat (the queen goes for the rook)', evaluate(chk.b)>300 && quiesce(chk.b,-100000,100000,true,chk.cas,null,4)<evaluate(chk.b)-300, 'eval '+evaluate(chk.b)+' q '+quiesce(chk.b,-100000,100000,true,chk.cas,null,4)]);
initBoard(); _searchDeadline=Date.now()+40; _searchAbort=false; _searchNodes=0; var tq=Date.now(); minimax(board,7,-100000,100000,true,castling,null,0); var took=Date.now()-tq;
N.push(['the deadline inside the search stops a depth 7 line within a quarter second', _searchAbort===true && took<250, took+' ms, abort '+_searchAbort]);
var fr1=fromFEN('4k3/8/8/8/8/8/3p4/3QK3 w - -'); var pre1=cloneBoard(fr1.b); var post1=cloneBoard(fr1.b); var m1=mv(7,3,6,3); applyMove(post1,m1,fr1.cas,null);
N.push(['a queen taking a free pawn is a capture, not a sacrifice', /Captures/.test(_classifyMove(m1,pre1,post1,pre1[7][3],false,null,2)), _classifyMove(m1,pre1,post1,pre1[7][3],false,null,2)]);
var fr2=fromFEN('4k3/8/8/8/8/2p5/3p4/3QK3 w - -');   /* the c3 pawn guards d2 */ var pre2=cloneBoard(fr2.b); var post2=cloneBoard(fr2.b); applyMove(post2,m1,fr2.cas,null);
N.push(['a queen taking a defended pawn is a sacrifice', /Sacrifice/.test(_classifyMove(m1,pre2,post2,pre2[7][3],false,null,2)), _classifyMove(m1,pre2,post2,pre2[7][3],false,null,2)]);
N.forEach(function(t){ if(!t[1])bad++; console.log((t[1]?'ok   ':'FAIL ')+t[0]+(t[1]?'':'  got '+t[2])); });
console.log(bad?'PERFT FAILED on '+bad+' counts':'perft: every count and fixture matches');process.exit(bad?1:0);
'''
fen_i = src.index("  function _boardToFEN(){"); fen_j = src.index("\n  }\n", fen_i) + 4; fen = src[fen_i:fen_j]
h = "'use strict';\nvar W='w',B='b',EMPTY=null;\nvar document={getElementById:function(){return null;}}, _chGen=0, _sfRev=0;\nvar render=function(){},_play=function(){},sh=function(){},sm=function(){},mm=function(){},mc=function(){},_e=function(){},ms=function(){};\n" + core + "\n" + fen + "\nfunction FEN_TAIL(){ return parseInt(_boardToFEN().split(' ').pop(),10); }\n" + TAIL
d = "/tmp/claude-1000/chess-perft"; os.makedirs(d, exist_ok=True); f = os.path.join(d, "harness.js"); open(f, "w", encoding="utf-8").write(h)
sys.exit(subprocess.run(["node", f]).returncode)
