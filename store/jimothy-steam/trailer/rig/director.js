/* The in-page pilot. Injected verbatim into the game page so the probe that
   CHOOSES the levels and the capture that SHOOTS them run identical code.

   Why not SH_DEV.autoPlay: it drives its own step() loop, so it fast-forwards
   the world instead of playing one frame at a time, and it is unusable once the
   harness owns the clock. It is also naive — it asks "is the lane ahead clear
   RIGHT NOW", which is the wrong question when a hop takes 0.28s.

   ⛔ Three things earlier versions got wrong, each found by tracing the game
   rather than reasoning about it:
     1. MID AIR IS SAFE. step()'s road/water collision is guarded by
        `if(!G.hop && ...)`. Clearing the whole flight window made the pilot
        refuse gaps a human takes every run (22 idle frames on level 7). Only
        the LANDING and the stand after it can kill.
     2. SAFE ROWS HAVE BLOCKED COLUMNS. startHop() silently refuses a forward
        hop into dest.blocked[col]. On level 3 the hero hopped into a bush nine
        times while the harness reported "9 hops". Forward-blocked is a
        sidestep, not a retry.
     3. A "least bad hop" ON A TIMER IS JUST DYING ON SCHEDULE. The stall
        escape used to hop forward blind after N idle frames; every squish in
        the level sweep traced back to it. Standing still is dangerous because
        the lane you are STANDING on keeps moving, so the fix is to check that
        too and step sideways to a tile that holds, never to hop into traffic
        because a counter ran out.
   All distances come from SH_DEV.hitbox()/feel(), so this measures the game's
   real numbers instead of a copy that can drift. */
module.exports = `
window.__PILOT = (function(){
  var TILE=60, COLS=9, HALF=30, VW=540;
  var HB=null, FEEL=null;
  function hb(){ if(!HB){ var h=SH_DEV.hitbox(); HB={road:h.road, padGrace:h.padGrace, heroW:h.heroW||42}; } return HB; }
  function feel(){ if(!FEEL) FEEL=SH_DEV.feel(); return FEEL; }
  function hopDur(g){ var f=feel(); return (g.dashT>0? f.dash : f.hop); }
  function colOf(x){ var c=Math.round(x/TILE-0.5); return Math.max(0,Math.min(COLS-1,c)); }

  /* Can we occupy lane L at x for the window [t0,t1] from now? Road: nothing
     may come within the game's own kill distance. Water: a pad must be under
     the foot the whole time. Both wrap copies are swept, because the entity
     that reaches you may be the one that just wrapped. */
  function holds(g,L,x,t0,t1){
    if(!L) return false;
    if(L.type!=='road' && L.type!=='water') return true;
    var H=hb();
    var mul=(L.type==='road'&&g.weather)?g.weather.mul:1;
    var v=(L.dir||0)*(L.speed||0)*mul;
    if(L.type==='road'&&g.freezeT>0) v=0;
    if(L.type==='road'&&g.vestT>0) return true;             // hi vis walks through traffic
    if(L.type==='water'&&g.bootsT>0) return true;           // rain boots walk on water
    var span=L.span||0;
    for(var t=t0;t<=t1;t+=0.04){
      var covered=false;
      for(var i=0;i<L.ents.length;i++){
        var e=L.ents[i], base=e.x+v*t;
        for(var k=-1;k<=1;k++){
          var ex=base+k*span;
          if(L.type==='road'){ if(Math.abs(ex-x) < (e.w+H.heroW)/2*H.road + 10) return false; }
          else { var gr=2+H.heroW*H.padGrace; if(x>ex-e.w/2-gr+6 && x<ex+e.w/2+gr-6) covered=true; }
        }
      }
      if(L.type==='water'&&!covered) return false;
    }
    return true;
  }
  function bushed(L,x){ return !!(L && L.type==='safe' && L.blocked && L.blocked[colOf(x)]); }

  /* one decision: a direction to hop, or null to hold position */
  function decide(g,stalled){
    if(g.hop||g.buf) return null;
    if(g.celeb>0||g.resumeT>0||g.coach) return null;
    var D=hopDur(g), STAND=0.36;
    var here=SH_DEV.laneAt(g.cr.r), fwd=SH_DEV.laneAt(g.cr.r+1);
    /* am I safe where I am, for as long as I might sit here? */
    var safeHere = holds(g,here,g.cr.x,0,STAND) && !(here.type==='water'&&!g.ride&&g.bootsT<=0);
    var fwdOk = fwd && !bushed(fwd,g.cr.x) && holds(g,fwd,g.cr.x,D,D+STAND);
    if(fwdOk) return 'up';
    if(safeHere && !stalled) return null;                   // patience is free while the tile holds
    /* forward is shut and standing here is not an answer: find a tile that is */
    var opts=[];
    [['left',-TILE],['right',TILE]].forEach(function(o){
      var nx=g.cr.x+o[1];
      if(nx<HALF||nx>VW-HALF) return;
      if(bushed(here,nx)) return;
      if(!holds(g,here,nx,D,D+STAND)) return;               // must be able to stand where we land
      opts.push({dir:o[0], forward:(fwd && !bushed(fwd,nx) && holds(g,fwd,nx,D+0.3,D+0.3+STAND))});
    });
    var win=opts.filter(function(o){return o.forward;})[0]||opts[0];
    return win?win.dir:null;                                 // nothing safe: hold and hope, never hop blind
  }

  return {
    should:function(){ var g=SH_DEV.state(); if(!g||g.phase!=='play') return 'nogame';
      return decide(g,false)||'wait'; },
    tick:function(dt,o){
      o=o||{};
      var g=SH_DEV.state(), acted='';
      if(g && g.phase==='play' && !o.freeze && (o.frame||0)>=(o.hold||0)){
        var ready=(o.frame-(window.__lastHop===undefined?-99:window.__lastHop))>=(o.gap||11);
        var stalled=(window.__waited||0) > (o.stall||30);
        var d=ready?decide(g,stalled):null;
        if(d){ SH_DEV.hop(d); window.__lastHop=o.frame; window.__waited=0; acted=(d==='up'?'hop':'side:'+d); }
        else window.__waited=(window.__waited||0)+1;
      }
      SH_DEV.step(dt); SH_DEV.render();
      var s=SH_DEV.state();
      return s ? {r:s.cr.r, phase:s.phase, combo:s.combo, score:s.score, lvl:s.level,
                  x:Math.round(s.cr.x), acted:acted, chase:+(s.chaseR||0).toFixed(1),
                  banner:!!(s.levelBanner&&s.levelBanner.t>0), celeb:+(s.celeb||0).toFixed(2),
                  lane:SH_DEV.laneAt(s.cr.r).type, cause:s.deadCause||null}
               : {phase:'gone', acted:acted};
    },
    reset:function(){ window.__lastHop=-99; window.__waited=0; HB=null; FEEL=null; }
  };
})();
`;
