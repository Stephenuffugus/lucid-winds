// ═══ JADE GARDEN — Mahjong Solitaire ═══
// Tap two matching free tiles to remove them. Clear all 144 tiles.
// Free = nothing above AND at least one open side (left or right).
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;
window._gameFns=window._gameFns||{};
window._gameFns.jade=function JG(a){
  // Tile face definitions — 36 unique faces × 4 copies = 144 tiles.
  // Groups with "wild matching": seasons (S0-S3) any-to-any; elements (E0-E3) any-to-any.
  // 9 blooms × 4 = 36; 9 leaves × 4 = 36; 9 seeds × 4 = 36; 3 companions × 4 = 12 (butterfly, bee, worm)
  // 3 roots × 4 = 12; 4 seasons × 1 (wild group) = 4; 4 elements × 1 (wild group) = 4; 1 ladybug × 4 = 4
  // Total: 36+36+36+12+12+4+4+4 = 144
  function buildDeck(){
    var faces=[];
    for(var i=1;i<=9;i++)faces.push({kind:'B',n:i,color:'#c47a7a',icon:'🌸',label:i});
    for(i=1;i<=9;i++)faces.push({kind:'L',n:i,color:'#7ab356',icon:'🍃',label:i});
    for(i=1;i<=9;i++)faces.push({kind:'D',n:i,color:'#c8a84b',icon:'●',label:i});
    faces.push({kind:'C',n:0,color:'#c47a7a',icon:'🦋',label:''});
    faces.push({kind:'C',n:1,color:'#c8a84b',icon:'🐝',label:''});
    faces.push({kind:'C',n:2,color:'#8b6914',icon:'🐛',label:''});
    faces.push({kind:'C',n:3,color:'#c47a7a',icon:'🐞',label:''});
    faces.push({kind:'R',n:0,color:'#8b6914',icon:'⋎',label:''});
    faces.push({kind:'R',n:1,color:'#8b6914',icon:'⋏',label:''});
    faces.push({kind:'R',n:2,color:'#8b6914',icon:'●',label:'R'});
    // 4 copies of everything above = 4 × 33 = 132 ... need 144, so add more numbered tiles:
    // Actually let's rebuild cleanly: 9B + 9L + 9D = 27 faces × 4 = 108; + 3C + 3R = 6 × 4 = 24; +108+24=132
    // + wild seasons (4 singletons, group-matched) + wild elements (4 singletons) = 140
    // Need 4 more → add a 4th companion (ladybug above already). Recompute:
    // faces so far: 9+9+9+4+3 = 34 non-wild faces × 4 copies = 136 + 4 seasons + 4 elements = 144 ✓
    return faces;
  }
  var FACES=buildDeck();
  var WILD_SEASONS=[
    {kind:'S',n:0,color:'#e8a0bf',icon:'🌸',label:'春'},
    {kind:'S',n:1,color:'#c8a84b',icon:'☀',label:'夏'},
    {kind:'S',n:2,color:'#c47a7a',icon:'🍁',label:'秋'},
    {kind:'S',n:3,color:'#5b9bd5',icon:'❄',label:'冬'}
  ];
  var WILD_ELEMENTS=[
    {kind:'E',n:0,color:'#5b9bd5',icon:'💧',label:'雨'},
    {kind:'E',n:1,color:'#c8a84b',icon:'☀',label:'陽'},
    {kind:'E',n:2,color:'#8b6914',icon:'⛰',label:'土'},
    {kind:'E',n:3,color:'#b8c0c0',icon:'〜',label:'風'}
  ];

  // Turtle layout — standard 144-tile Mahjong Solitaire positions.
  // Each position: [layer, col, row]. Col/row are in half-unit coordinates
  // (every layer above gets ~half tile offset for overlap look).
  function turtleLayout(){
    var p=[];
    // Layer 0 — classic turtle base (12 cols × 8 rows)
    // rows 0-7; widths vary: standard pattern
    var rowWidths=[
      {start:1,end:12}, // row 0: cols 1-12 (12 wide)
      {start:3,end:10}, // row 1
      {start:2,end:11}, // row 2
      {start:1,end:12}, // row 3
      {start:0,end:13}, // row 4 (wings)
      {start:1,end:12}, // row 5
      {start:2,end:11}, // row 6
      {start:3,end:10}  // row 7
    ];
    for(var r=0;r<rowWidths.length;r++){
      for(var c=rowWidths[r].start;c<rowWidths[r].end;c++){
        p.push([0,c,r]);
      }
    }
    // Layer 1 (10 × 6)
    for(r=1;r<7;r++)for(c=2;c<12;c++)p.push([1,c,r]);
    // Layer 2 (8 × 4)
    for(r=2;r<6;r++)for(c=3;c<11;c++)p.push([2,c,r]);
    // Layer 3 (6 × 2)
    for(r=3;r<5;r++)for(c=4;c<10;c++)p.push([3,c,r]);
    // Layer 4 cap
    p.push([4,6,3]);
    // Extra wings to reach 144: add 2 extra tiles left and right of layer 0
    p.push([0,-1,3]);p.push([0,-1,4]);
    p.push([0,13,3]);p.push([0,13,4]);
    return p;
  }

  var positions,tiles,selected=null,undoStack=[],hintsLeft=5,shufflesLeft=3,moves=0,startTime=0,timerInt=null;

  ms(a,'🀄 Jade Garden — <strong id="JGp">0/72</strong> pairs · <strong id="JGt">0:00</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='JGpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:4px;user-select:none;text-align:center;overflow-x:auto;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_JGH()">💡 <span id="JGhn">5</span></button> <button class="gb" onclick="_JGU()">↩ UNDO</button> <button class="gb" onclick="_JGS()">♻ <span id="JGsn">3</span></button> <button class="gb-new" onclick="_JGN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function facesMatch(a,b){
    if(a.kind==='S'&&b.kind==='S')return true;
    if(a.kind==='E'&&b.kind==='E')return true;
    return a.kind===b.kind&&a.n===b.n;
  }

  // Build a solvable board via reverse-solve:
  //   Fill positions from bottom layer up. Pair up positions that would be
  //   "free" when populated up to that point. Assign same face to the pair.
  function generate(){
    positions=turtleLayout();
    if(positions.length!==144){
      // pad/trim to exactly 144 (defensive)
      while(positions.length>144)positions.pop();
      while(positions.length<144){
        // add filler base tiles
        positions.push([0,positions.length%12,8]);
      }
    }
    // Build bag of faces: 4 copies of each non-wild face, plus 1 of each wild.
    var bag=[];
    for(var i=0;i<FACES.length;i++){
      for(var k=0;k<4;k++)bag.push(FACES[i]);
    }
    for(i=0;i<WILD_SEASONS.length;i++)bag.push(WILD_SEASONS[i]);
    for(i=0;i<WILD_ELEMENTS.length;i++)bag.push(WILD_ELEMENTS[i]);
    // Trim/pad bag to match position count
    while(bag.length>positions.length)bag.pop();
    while(bag.length<positions.length)bag.push(FACES[0]);

    // Attempt reverse-solve generation up to 5 times.
    for(var attempt=0;attempt<5;attempt++){
      var result=tryGenerate(positions,bag);
      if(result){tiles=result;return;}
    }
    // Fallback: random assignment (may be unsolvable but extremely rare after 5 tries)
    shuffleArr(bag);
    tiles=[];
    for(i=0;i<positions.length;i++)tiles.push({id:i,layer:positions[i][0],col:positions[i][1],row:positions[i][2],face:bag[i],removed:false});
  }

  function shuffleArr(arr){
    for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
  }

  function tryGenerate(posList,bag){
    // Empty filled[] — tiles placed so far (stack order).
    // Strategy: repeatedly pick two positions that are currently "free"
    // AMONG UNFILLED ones — meaning: no position above currently unfilled overlapping;
    // reverse: think of unfill order. Easier: we pick order to REMOVE tiles as if
    // playing solved game, then assign pair faces.
    // Implementation: start from all positions filled; pick two "free" tiles, remove
    // them (assign same face), repeat.
    var posIdx=[];for(var i=0;i<posList.length;i++)posIdx.push(i);
    var placedFace=new Array(posList.length);
    // "removed" tracks tiles already paired out (i.e., positions we've already assigned).
    var remaining={};for(i=0;i<posIdx.length;i++)remaining[i]=true;
    // Shuffle bag into pairs: group by face identity (including wild groups).
    // Easier: group bag into pair-buckets: identical faces pair; wild groups pair any-to-any.
    var pairs=buildPairs(bag.slice());
    shuffleArr(pairs);
    var pairIdx=0;
    while(pairIdx<pairs.length){
      var freeList=getFreeUnassigned(posList,remaining);
      if(freeList.length<2)return null;
      shuffleArr(freeList);
      var a=freeList[0],b=freeList[1];
      var pair=pairs[pairIdx++];
      placedFace[a]=pair[0];placedFace[b]=pair[1];
      delete remaining[a];delete remaining[b];
    }
    if(Object.keys(remaining).length!==0)return null;
    var result=[];
    for(i=0;i<posList.length;i++){
      result.push({id:i,layer:posList[i][0],col:posList[i][1],row:posList[i][2],face:placedFace[i],removed:false});
    }
    return result;
  }

  function buildPairs(bag){
    var pairs=[];
    // Non-wild: group exact face copies
    var groups={};
    for(var i=0;i<bag.length;i++){
      var f=bag[i];
      var key=f.kind+'-'+(f.kind==='S'||f.kind==='E'?'W':f.n);
      if(!groups[key])groups[key]=[];groups[key].push(f);
    }
    var keys=Object.keys(groups);
    for(var k=0;k<keys.length;k++){
      var g=groups[keys[k]];
      for(var j=0;j<g.length;j+=2){
        if(j+1<g.length)pairs.push([g[j],g[j+1]]);
      }
    }
    return pairs;
  }

  function getFreeUnassigned(posList,remaining){
    // A position is "free in the REMAINING set" if:
    //  1. No remaining position is on layer+1 overlapping its area
    //  2. No remaining position directly left AND no remaining position directly right (at least one side open)
    var free=[];
    var keys=Object.keys(remaining);
    // Build a lookup of remaining positions keyed by "layer,col,row"
    var lookup={};
    for(var i=0;i<keys.length;i++){
      var p=posList[keys[i]];
      lookup[p[0]+','+p[1]+','+p[2]]=keys[i];
    }
    for(i=0;i<keys.length;i++){
      var idx=keys[i];var p2=posList[idx];
      var L=p2[0],C=p2[1],R=p2[2];
      // overlap above: layer L+1 with col in {C-1,C,C+1} and row in {R-1,R,R+1}? simpler:
      // tile above covers roughly same col & row
      var above=false;
      // check any remaining on layer L+1 whose (col,row) overlaps by half tile
      for(var dc=-1;dc<=1;dc++)for(var dr=-1;dr<=1;dr++){
        if(lookup[(L+1)+','+(C+dc)+','+(R+dr)]){above=true;break;}
      }
      if(above)continue;
      // left neighbour: layer L, col C-1, row same
      var leftBlock=!!lookup[L+','+(C-1)+','+R]||!!lookup[L+','+(C-2)+','+R];
      var rightBlock=!!lookup[L+','+(C+1)+','+R]||!!lookup[L+','+(C+2)+','+R];
      // more reliable: block if any tile exists at col C-1 same row
      leftBlock=!!lookup[L+','+(C-1)+','+R];
      rightBlock=!!lookup[L+','+(C+1)+','+R];
      if(leftBlock&&rightBlock)continue;
      free.push(idx);
    }
    return free;
  }

  // Runtime "free" check for actual play
  function isFree(tileId){
    var t=tiles[tileId];if(t.removed)return false;
    var L=t.layer,C=t.col,R=t.row;
    for(var i=0;i<tiles.length;i++){
      var o=tiles[i];if(o.removed||i===tileId)continue;
      if(o.layer===L+1){
        if(Math.abs(o.col-C)<=1&&Math.abs(o.row-R)<=1)return false;
      }
    }
    var leftBlock=false,rightBlock=false;
    for(i=0;i<tiles.length;i++){
      var o2=tiles[i];if(o2.removed||i===tileId)continue;
      if(o2.layer===L&&o2.row===R){
        if(o2.col===C-1)leftBlock=true;
        if(o2.col===C+1)rightBlock=true;
      }
    }
    return !(leftBlock&&rightBlock);
  }

  function TILE_W(){return 30;}
  function TILE_H(){return 42;}
  function tilePos(t){
    var TW=TILE_W(),TH=TILE_H();
    var x=t.col*(TW*0.6)+t.layer*-3;
    var y=t.row*(TH*0.55)+t.layer*-3;
    return {x:x,y:y};
  }

  function render(){
    var TW=TILE_W(),TH=TILE_H();
    // Find bounds
    var minX=9999,minY=9999,maxX=-9999,maxY=-9999;
    for(var i=0;i<tiles.length;i++){
      if(tiles[i].removed)continue;
      var p=tilePos(tiles[i]);
      if(p.x<minX)minX=p.x;if(p.y<minY)minY=p.y;
      if(p.x+TW>maxX)maxX=p.x+TW;if(p.y+TH>maxY)maxY=p.y+TH;
    }
    if(minX===9999){minX=0;minY=0;maxX=TW;maxY=TH;}
    var width=maxX-minX+6,height=maxY-minY+6;
    var h='<div style="position:relative;width:'+width+'px;height:'+height+'px;margin:0 auto;">';
    // Sort by render order: lower layer first, then top-to-bottom, left-to-right
    var order=[];for(i=0;i<tiles.length;i++)if(!tiles[i].removed)order.push(i);
    order.sort(function(a,b){
      if(tiles[a].layer!==tiles[b].layer)return tiles[a].layer-tiles[b].layer;
      if(tiles[a].row!==tiles[b].row)return tiles[a].row-tiles[b].row;
      return tiles[a].col-tiles[b].col;
    });
    for(var k=0;k<order.length;k++){
      var id=order[k];var t=tiles[id];var p2=tilePos(t);
      var free=isFree(id);
      var sel=selected===id;
      var x=p2.x-minX,y=p2.y-minY;
      var bg=sel?'#e8dcc8':'#f5f0e1';
      var bc=sel?'#7ab356':'#c4b998';
      var shadow=sel?'0 0 10px rgba(122,179,86,0.6), 2px 2px 0 0 #b8a87a':'2px 2px 0 0 #b8a87a, 3px 3px 0 0 #a89868';
      var opacity=free?1:0.55;
      h+='<div onclick="_JGT('+id+')" style="position:absolute;left:'+x+'px;top:'+y+'px;width:'+TW+'px;height:'+TH+'px;background:'+bg+';border:1px solid '+bc+';border-radius:4px;box-shadow:'+shadow+';opacity:'+opacity+';z-index:'+(t.layer*100+t.row*10+t.col+50)+';display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:'+(free?'pointer':'default')+';color:'+t.face.color+';font-weight:700;'+(sel?'transform:translateY(-3px);':'')+'">';
      h+='<div style="font-size:1rem;line-height:1;">'+t.face.icon+'</div>';
      if(t.face.label!==''&&t.face.label!=null)h+='<div style="font-family:Bebas Neue,sans-serif;font-size:.6rem;color:#4a3728;margin-top:1px;">'+t.face.label+'</div>';
      h+='</div>';
    }
    h+='</div>';
    pan.innerHTML=h;
    updateHud();
  }

  function countRemaining(){var n=0;for(var i=0;i<tiles.length;i++)if(!tiles[i].removed)n++;return n;}
  function updateHud(){
    var remain=countRemaining();
    var matched=(144-remain)/2;
    var el=document.getElementById('JGp');if(el)el.textContent=Math.floor(matched)+'/72';
    var hn=document.getElementById('JGhn');if(hn)hn.textContent=hintsLeft;
    var sn=document.getElementById('JGsn');if(sn)sn.textContent=shufflesLeft;
  }

  function tick(){
    var el=document.getElementById('JGt');if(!el)return;
    var s=Math.floor((Date.now()-startTime)/1000);
    el.textContent=Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60);
  }

  function findAnyMatch(){
    var free=[];
    for(var i=0;i<tiles.length;i++)if(!tiles[i].removed&&isFree(i))free.push(i);
    for(i=0;i<free.length;i++)for(var j=i+1;j<free.length;j++){
      if(facesMatch(tiles[free[i]].face,tiles[free[j]].face))return [free[i],free[j]];
    }
    return null;
  }

  function checkWin(){
    if(countRemaining()===0){
      clearInterval(timerInt);
      var secs=Math.floor((Date.now()-startTime)/1000);
      sm('🀄 Garden cleared! '+Math.floor(secs/60)+':'+(secs%60<10?'0':'')+(secs%60));
      _e('game_win');try{_playWin();}catch(e){}
      _sr('jade',{w:true,s:secs,h:5-hintsLeft});
      return true;
    }
    return false;
  }
  function checkStuck(){
    if(!findAnyMatch()){
      // Without this branch, a player with 0 shuffles + no matches
      // saw the same toast as a player with 3 shuffles — but the
      // first player was soft-locked. Now we differentiate so they
      // know to start a new game instead of looking for a button
      // that won't help.
      if(shufflesLeft<=0){
        sm('🍂 No matches and no shuffles left. Tap NEW to play again.');
        if(timerInt){clearInterval(timerInt);timerInt=null;}
        var secs=Math.round((Date.now()-startTime)/1000);
        var cleared=0;for(var i=0;i<tiles.length;i++)if(tiles[i].removed)cleared++;
        _sr('jade',{w:false,s:secs,cleared:cleared});
      } else {
        sm('No matches available — tap ♻ to shuffle ('+shufflesLeft+' left).');
      }
    }
  }

  window._JGT=function(id){
    var t=tiles[id];if(!t||t.removed)return;
    if(!isFree(id))return;
    if(selected===id){selected=null;render();return;}
    if(selected===null){selected=id;try{if(window._play)_play('tap');}catch(e){}render();return;}
    var other=tiles[selected];
    if(facesMatch(t.face,other.face)){
      undoStack.push([selected,id]);
      t.removed=true;other.removed=true;
      moves++;selected=null;
      try{if(window._play)_play('match');}catch(e){}
      try{navigator.vibrate&&navigator.vibrate(10);}catch(e){}
      if(moves%12===0)_e('milestone');
      render();
      if(!checkWin())checkStuck();
    } else {
      var prev=selected;selected=null;
      try{if(window._play)_play('lose');}catch(e){}
      render();
      // Brief red flash on the second tile
      setTimeout(function(){sm('Not a match.');},0);
    }
  };
  window._JGU=function(){
    if(undoStack.length===0){sm('Nothing to undo.');return;}
    var last=undoStack.pop();
    tiles[last[0]].removed=false;tiles[last[1]].removed=false;
    selected=null;moves--;render();sm('Undid last match.');
  };
  window._JGH=function(){
    if(hintsLeft<=0){sm('No hints remaining.');return;}
    var m=findAnyMatch();
    if(!m){sm('No valid matches — shuffle!');return;}
    hintsLeft--;
    startTime-=15000; // +15s penalty (add 15s to elapsed => subtract from startTime)
    selected=null;render();
    // highlight the two with brief background change
    setTimeout(function(){
      var a1=document.querySelectorAll('#JGpan > div > div');
      // highlight by re-render with temporary selection
      var prev=selected;
      selected=m[0];render();
      setTimeout(function(){selected=prev;render();sm('Hint: matching pair highlighted.');},1200);
    },10);
  };
  window._JGS=function(){
    if(shufflesLeft<=0){sm('No shuffles remaining.');return;}
    shufflesLeft--;
    startTime-=30000; // 30s penalty
    // collect faces of remaining tiles and shuffle
    var remainIds=[],remainFaces=[];
    for(var i=0;i<tiles.length;i++)if(!tiles[i].removed){remainIds.push(i);remainFaces.push(tiles[i].face);}
    shuffleArr(remainFaces);
    for(i=0;i<remainIds.length;i++)tiles[remainIds[i]].face=remainFaces[i];
    selected=null;render();sm('Shuffled. +30s penalty.');
  };
  window._JGN=function(){
    selected=null;undoStack=[];hintsLeft=5;shufflesLeft=3;moves=0;
    generate();startTime=Date.now();
    if(timerInt)clearInterval(timerInt);timerInt=setInterval(tick,500);
    sm('Tap matching free tiles.');render();
  };

  _JGN();
};
})();
