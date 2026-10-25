#!/usr/bin/env python3
"""Grove Chess engine proof: a perft count (every legal move to a depth) of the REAL games/chess.js against the standard
positions. python3 -I tools/chess-tests/perft.py   (about 40 s on this box). The engine core (from "var PAWN='P'" to the
move-table comment) is sliced out of the live file into a Node harness, so the harness can never drift from the game.
Promotions queen only (the engine offers no underpromotion), so positions that promote at the counted depth are left out.
25 Oct 2026: found the pawn attack direction inverted (position 3 gave 15 for 14; Kiwipete 97983 for 97862 at depth 3)."""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(os.path.join(ROOT, "games", "chess.js"), encoding="utf-8").read()
i = src.index("var PAWN='P'"); j = src.index("// row 0 = rank 8, col 0 = a-file"); core = src[i:j]
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
N.forEach(function(t){ if(!t[1])bad++; console.log((t[1]?'ok   ':'FAIL ')+t[0]+(t[1]?'':'  got '+t[2])); });
console.log(bad?'PERFT FAILED on '+bad+' counts':'perft: every count and fixture matches');process.exit(bad?1:0);
'''
fen_i = src.index("  function _boardToFEN(){"); fen_j = src.index("\n  }\n", fen_i) + 4; fen = src[fen_i:fen_j]
h = "'use strict';\nvar W='w',B='b',EMPTY=null;\nvar render=function(){},_play=function(){},sh=function(){},sm=function(){},mm=function(){},mc=function(){},_e=function(){},ms=function(){};\n" + core + "\n" + fen + "\nfunction FEN_TAIL(){ return parseInt(_boardToFEN().split(' ').pop(),10); }\n" + TAIL
d = "/tmp/claude-1000/chess-perft"; os.makedirs(d, exist_ok=True); f = os.path.join(d, "harness.js"); open(f, "w", encoding="utf-8").write(h)
sys.exit(subprocess.run(["node", f]).returncode)
