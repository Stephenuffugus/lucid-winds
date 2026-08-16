/* Who is standing ON the landmarks? Regression check for the LANDMARK CLEARANCE
   pass (index.html, just before the mesh build). Before it existed this found a
   topiary ball welded 70cm off the Armillary Sphere's axis, fifteen beach huts
   inside the Helter Skelter and the zen Pagoda through the Stone Circle.
   Everything should now report clear or exactly tangent (rounding).
   Run: NODE_PATH=/workspaces/lucid-winds/node_modules node landmark_neighbours.js
   ⛔ "overlapping at exactly the sum of half-sizes" is a PASS — that is a prop
      pushed to the ring edge, and the audit rounds both numbers. */
/* Who is standing on the landmarks? For every lm* prop in every world, list the
   props whose own footprint overlaps it. A landmark you steer toward for a
   minute should not arrive inside somebody else's crate yard. */
/* 2026-08-16: driver swapped from chromium to node_harness.js — this reads
   state(), it never draws, so a browser bought nothing. Run: node landmark_neighbours.js */
var H=require('./node_harness.js');
(function(){
  var DB=H.boot({seed:12345});
  var bad=0;
  for (var w=1; w<=7; w++){
    var out=(function(n){
      var D=DB; D.start('level',n);
      var st=D.state(), o=st.objects, lms=[], i, j, res=[];
      for(i=0;i<o.length;i++) if(o[i].k.indexOf('lm')===0 && o[i].f) lms.push(o[i]);
      for(i=0;i<lms.length;i++){
        var L=lms[i], near=[], moved=[];
        for(j=0;j<o.length;j++){ var q=o[j];
          if(q===L) continue;
          var dx=q.x-L.x, dz=q.z-L.z, d=Math.sqrt(dx*dx+dz*dz);
          /* footprints overlap when the gap is less than the two half-sizes */
          var need=L.s*0.5+q.s*0.5;
          /* ⛔ TOLERANCE, OR THIS PROBE CRIES WOLF. The clearance pass pushes a
             prop to EXACTLY the ring edge, so a clean world reports dozens of
             "overlaps" that are tangency plus rounding — and a check that is
             always red trains you to stop reading it. Only a real bite counts.
             Movers are listed separately: a sheep is SUPPOSED to walk past. */
          if(d < need*0.99){
            if(q.m) moved.push(q.k); else near.push({k:q.k,s:Math.round(q.s),d:Math.round(d),need:Math.round(need)});
          }
        }
        near.sort(function(a,b){ return b.s-a.s; });
        res.push({k:L.k, s:Math.round(L.s), n:near.length, mv:moved.length, worst:near.slice(0,5)});
      }
      return {id:D.worlds()[n-1].id, lms:res};
    })(w);
    console.log('\n=== level '+w+'  '+out.id+' ===');
    out.lms.forEach(function(L){
      var tag = L.n>0 ? '  ⛔ '+L.n+' BITING' : '  clear';
      if(L.n>0) bad++;
      if(L.mv) tag += '  ('+L.mv+' mover'+(L.mv>1?'s':'')+' nearby, fine)';
      console.log('  '+L.k+' ('+L.s+'cm)'+tag+
        (L.worst.length?'  ← '+L.worst.map(function(x){return x.k+' '+x.d+'cm apart, needs '+x.need;}).join(', '):''));
    });
  }
  console.log('\n'+(bad?('NEIGHBOURS_FAIL — '+bad+' landmark(s) with something standing in them')
                      :'NEIGHBOURS_PASS — every landmark stands clear'));
  process.exit(bad?1:0);
})();
