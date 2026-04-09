// ═══ LUCID WINDS — init.js ═══
// Dev panel (PW_Dev), PWA install handler
// Loads after app.js — requires DOM elements to exist
// ════════════════════════════════════════════

// ── PW_Dev + Vault Hydration Logic ──
(function(){
  var _tapCount=0,_tapTimer=null;

  // Dev panel tap handler moved to after button exists (see below)

  function _refreshDevInfo(){
    var info=document.getElementById('dev-account-info');
    if(!info)return;
    try{
      var auth=firebase.auth();
      var user=auth.currentUser;
      if(user){
        info.innerHTML='<b>Email:</b> '+user.email+'<br><b>UID:</b> '+user.uid+'<br><b>Provider:</b> '+user.providerId;
      }else{
        info.textContent='Not logged in';
      }
    }catch(e){info.textContent='Auth error: '+e.message;}

    // Show localStorage keys and sizes
    var log=document.getElementById('dev-log');
    if(log){
      var h='=== LOCAL STORAGE ===\n';
      var keys=['sws_greenhouse','sws_nursery','fg_wild_plants','fg_ferals','fg_pollen','sws_hash_ledger','fg_w_d','pw_onboarded','sws_user_session'];
      keys.forEach(function(k){
        var v=localStorage.getItem(k);
        h+=k+': '+(v?v.length+' chars':'(empty)')+'\n';
        if(v&&v.length<200)h+='  → '+v.substring(0,150)+'\n';
      });
      log.textContent=h;
    }
  }

  window.PW_Dev={
    nukeAccount:function(){
      if(!confirm('WIPE current account from Firestore?'))return;
      try{
        var user=firebase.auth().currentUser;
        if(user){
          firebase.firestore().collection('vaults').doc(user.uid).delete().then(function(){alert('Vault deleted.');}).catch(function(e){alert('Error: '+e.message);});
        }
      }catch(e){alert(e.message);}
    },
    resetCounter:function(){
      try{
        firebase.firestore().collection('meta').doc('accountCounter').set({next:1}).then(function(){alert('Counter reset to 1.');}).catch(function(e){alert('Error: '+e.message);});
      }catch(e){alert(e.message);}
    },
    clearLocal:function(){
      if(!confirm('Clear ALL localStorage?'))return;
      localStorage.clear();
      alert('Cleared. Reload the page.');
      location.reload();
    },
    forceSync:function(){
      if(window.syncVaultToCloud){
        try{window._vaultHydrated=true;}catch(e){}
        syncVaultToCloud();
        alert('Sync triggered. Check Firebase Log.');
      }else{alert('syncVaultToCloud not defined');}
    },
    forceHydrate:function(){
      try{window._vaultHydrated=true;}catch(e){}
      if(window.loadVaultFromCloud){
        loadVaultFromCloud(function(r){
          alert('Hydration result: '+JSON.stringify(r));
          if(window.renderGreenhouse)renderGreenhouse();
        });
      }else{
        // Direct Firestore read fallback
        try{
          var user=firebase.auth().currentUser;
          if(!user){alert('Not logged in. Log in first.');return;}
          firebase.firestore().collection('vaults').doc(user.uid).get().then(function(doc){
            if(doc.exists){
              var data=doc.data();
              var cloudGH=data.sws_greenhouse||[];
              alert('Cloud has '+cloudGH.length+' plants. Restoring...');
              if(cloudGH.length>0){
                localStorage.setItem('sws_greenhouse',JSON.stringify(cloudGH));
                if(window.renderGreenhouse)renderGreenhouse();
                alert('Restored '+cloudGH.length+' plants from cloud!');
              }else{alert('Cloud vault is empty too.');}
            }else{alert('No vault found in Firestore for this account.');}
          }).catch(function(e){alert('Firestore error: '+e.message);});
        }catch(e){alert('Error: '+e.message);}
      }
    },
    resetWild:function(){
      if(!confirm('Reset all Wild tab data? (plants, ferals, backpack, anti-farming)'))return;
      localStorage.removeItem('fg_wild_plants');
      localStorage.removeItem('fg_ferals');
      localStorage.removeItem('fg_af_harvests');
      localStorage.removeItem('fg_w_d');
      localStorage.removeItem('fg_pouch');
      localStorage.removeItem('fg_feral_breed_date');
      localStorage.removeItem('fg_pollen');
      localStorage.removeItem('fg_pollen_tick');
      localStorage.removeItem('fg_rtb_last');
      alert('Wild data cleared. Reload to see clean map.');
      location.reload();
    },
    spawnFeral:function(){
      // Force-spawn a feral seed near the player's current GPS position
      var lat=40.758,lng=-73.9855; // fallback NYC
      try{if(window.FG_Wild){var w=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');if(w.length>0){lat=w[0].lat;lng=w[0].lng;}}}catch(e){}
      var h='';for(var i=0;i<64;i++)h+='0123456789abcdef'[Math.floor(Math.random()*16)];
      var feral={lat:lat+(Math.random()-0.5)*0.0008,lng:lng+(Math.random()-0.5)*0.0008,hash:h,date:new Date().toISOString().slice(0,10),collected:false,parentA:'dev',parentB:'test'};
      var data=[];try{data=JSON.parse(localStorage.getItem('fg_ferals')||'[]');}catch(e){}
      data.push(feral);
      localStorage.setItem('fg_ferals',JSON.stringify(data));
      alert('Feral spawned! Switch to Wild tab to see it.');
    },
    dropTestPlants:function(){
      // Drop 3 test plants near the player for breeding pair testing
      var lat=40.758,lng=-73.9855;
      try{var w=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');if(w.length>0){lat=w[0].lat;lng=w[0].lng;}}catch(e){}
      var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
      var uid='';try{var u=firebase.auth().currentUser;if(u)uid=u.uid;}catch(e){}
      for(var i=0;i<3;i++){
        var h='';for(var j=0;j<64;j++)h+='0123456789abcdef'[Math.floor(Math.random()*16)];
        wild.push({lat:lat+(Math.random()-0.5)*0.001,lng:lng+(Math.random()-0.5)*0.001,hash:h,date:new Date().toISOString(),own:true,ownerUid:uid,ownerName:'Dev',ea:5+Math.floor(Math.random()*10),defenderGame:'set',season:Math.floor(Math.random()*4)});
      }
      localStorage.setItem('fg_wild_plants',JSON.stringify(wild));
      alert('Dropped 3 test plants! Switch to Wild tab.');
    },
    seedArea:function(){
      // Seed 100 plants across a ~500m radius for ecosystem testing
      // Creates 5 plants per zone in a 5x5 grid of ~111m zones
      if(!confirm('Seed 100 plants in a 500m radius? (local + Firestore)'))return;
      var cLat=40.758,cLng=-73.9855;
      try{var w=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');if(w.length>0&&w[0].lat){cLat=w[0].lat;cLng=w[0].lng;}}catch(e){}
      var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
      var uid='';try{var u=firebase.auth().currentUser;if(u)uid=u.uid;}catch(e){}
      var db=null;try{db=firebase.firestore();}catch(e){}
      var ZONE=0.001;var count=0;
      var defGames=['set','memory','growth','color','math','word','chess','sliding'];
      for(var dx=-2;dx<=2;dx++){
        for(var dy=-2;dy<=2;dy++){
          var zoneLat=cLat+dx*ZONE;
          var zoneLng=cLng+dy*ZONE;
          for(var p=0;p<4;p++){
            var h='';for(var j=0;j<64;j++)h+='0123456789abcdef'[Math.floor(Math.random()*16)];
            var pLat=zoneLat+(Math.random()-0.5)*ZONE*0.8;
            var pLng=zoneLng+(Math.random()-0.5)*ZONE*0.8;
            var defGame=defGames[Math.floor(Math.random()*defGames.length)];
            var ea=3+Math.floor(Math.random()*12);
            var season=Math.floor(Math.random()*4);
            var plant={lat:pLat,lng:pLng,hash:h,date:new Date().toISOString(),own:true,ownerUid:uid,ownerName:'Seed',ea:ea,defenderGame:defGame,season:season};
            wild.push(plant);
            // Compute real grade for this hash
            var grade='Common';
            try{if(window.hashToTraits&&window.getTerraGrade){var _st=window.hashToTraits(h);grade=window.getTerraGrade(_st).name||'Common';}}catch(e){}
            // Also write to Firestore for cross-account visibility
            if(db&&uid){
              var zk=(Math.round(pLat/ZONE)*ZONE).toFixed(4)+','+(Math.round(pLng/ZONE)*ZONE).toFixed(4);
              db.collection('wildDrops').doc(uid+'_'+h.slice(0,16)).set({
                lat:pLat,lng:pLng,hash:h,ownerUid:uid,ownerName:'Seed',
                ea:ea,defenderGame:defGame,season:season,status:'alive',
                grade:grade,zone:zk,
                droppedAt:new Date().toISOString()
              }).catch(function(){});
            }
            count++;
          }
        }
      }
      localStorage.setItem('fg_wild_plants',JSON.stringify(wild));
      alert('Seeded '+count+' plants across 25 zones (500m radius)!\nSwitch to Wild tab. Ferals will spawn within days.');
    },
    simulateSpread:function(){
      // Simulate X days of spread using YOUR actual wild plants
      var days=parseInt(prompt('Simulate how many days of spread?','7'))||7;
      var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
      if(wild.length<2){alert('Need at least 2 wild plants to simulate. Drop some first!');return;}
      var lat=wild[0].lat,lng=wild[0].lng;
      // Fetch real weather for YOUR location
      fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat.toFixed(4)+'&longitude='+lng.toFixed(4)+'&current_weather=true&daily=precipitation_sum&timezone=auto&forecast_days=1')
      .then(function(r){return r.json();})
      .then(function(d){
        var rain=0;try{rain=d.daily.precipitation_sum[0]||0;}catch(e){}
        var temp=20;try{temp=d.current_weather.temperature||20;}catch(e){}
        var births=0;
        for(var day=0;day<days;day++){
          // Reload wild plants each day (new offspring from previous day are now parents)
          var curWild=[];try{curWild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
          var dayWeather={rain:Math.max(0,rain+(Math.random()-0.5)*4),temp:temp+(Math.random()-0.5)*5,fetched:Date.now()};
          // Build zones from current wild plants
          var zones={};
          for(var pi=0;pi<curWild.length;pi++){
            var p=curWild[pi];if(!p||!p.lat||!p.hash)continue;
            var zk=Math.round(p.lat*1000)/1000+','+Math.round(p.lng*1000)/1000;
            if(!zones[zk])zones[zk]=[];
            zones[zk].push(p);
          }
          // Check each zone + adjacent zones for breeding pairs
          var zoneKeys=Object.keys(zones);
          var ZONE_STEP=0.001; // ~100m zone size
          for(var z=0;z<zoneKeys.length;z++){
            // Gather plants from this zone AND all 8 neighbors
            var zParts=zoneKeys[z].split(',');
            var zLat=parseFloat(zParts[0]),zLng=parseFloat(zParts[1]);
            var plants=[];
            for(var dx=-1;dx<=1;dx++){
              for(var dy=-1;dy<=1;dy++){
                var nk=Math.round((zLat+dx*ZONE_STEP)*1000)/1000+','+Math.round((zLng+dy*ZONE_STEP)*1000)/1000;
                if(zones[nk]){for(var np=0;np<zones[nk].length;np++)plants.push(zones[nk][np]);}
              }
            }
            if(plants.length<2)continue;
            // Deduplicate (same plant might appear from multiple zones)
            var seen={};var uniq=[];
            for(var up=0;up<plants.length;up++){if(!seen[plants[up].hash]){seen[plants[up].hash]=true;uniq.push(plants[up]);}}
            plants=uniq;
            if(plants.length<2)continue;
            // Reproduction chance
            var chance=0.30*((dayWeather.rain>5)?2.0:(dayWeather.rain>1)?1.5:(dayWeather.rain===0&&dayWeather.temp>35)?0.3:1.0);
            chance*=Math.min(1.4,0.5+plants.length*0.125); // population scaling
            if(Math.random()>=chance)continue;
            // Pick parents (prefer from different zones for genetic diversity)
            var pA=plants[0],pB=plants[1];
            // Generate offspring
            var offHash='';
            for(var hi=0;hi<64;hi++){
              var a=parseInt(pA.hash[hi]||'0',16),b=parseInt(pB.hash[hi]||'0',16);
              offHash+=((a^b^(day*7+hi))%16).toString(16);
            }
            // Place near parents
            var offLat=pA.lat+(Math.random()-0.5)*0.001;
            var offLng=pA.lng+(Math.random()-0.5)*0.001;
            var offTraits=null,offEA=3,offGrade='Common';
            try{
              offTraits=window.hashToTraits?window.hashToTraits(offHash):null;
              if(offTraits){offEA=window.computeEA?window.computeEA(offTraits,0):3;var tg=window.getTerraGrade?window.getTerraGrade(offTraits):null;offGrade=tg?tg.name:'Common';}
            }catch(e){}
            var offspring={lat:offLat,lng:offLng,hash:offHash,date:new Date().toISOString(),own:true,
              ownerUid:'sim',ownerName:'Simulation',ea:offEA,defenderGame:'set',
              season:offTraits?offTraits.season:0,grade:offGrade,generation:1,
              wildBorn:true,parentA:pA.hash.slice(0,8),parentB:pB.hash.slice(0,8)};
            curWild.push(offspring);
            births++;
          }
          localStorage.setItem('fg_wild_plants',JSON.stringify(curWild));
        }
        alert('Simulated '+days+' days!\n'+births+' new plants born.\nWeather: '+Math.round(temp)+'°C, '+rain.toFixed(1)+'mm rain.\n\nSwitch to Wild tab to see them on the map.');
      })
      .catch(function(e){alert('Weather fetch failed: '+e.message);});
    },
    dropTestPair:function(){
      // Drop 2 plants in adjacent hexes for reproduction testing
      var lat=30.0444,lng=31.2357; // Cairo default — change via prompt
      var loc=prompt('Enter lat,lng for test plants (or leave blank for Cairo):','');
      if(loc){var parts=loc.split(',');if(parts.length===2){lat=parseFloat(parts[0]);lng=parseFloat(parts[1]);}}
      var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
      var uid='';try{var u=firebase.auth().currentUser;if(u)uid=u.uid;}catch(e){}
      for(var i=0;i<2;i++){
        var h='';for(var j=0;j<64;j++)h+='0123456789abcdef'[Math.floor(Math.random()*16)];
        var t=window.hashToTraits?window.hashToTraits(h):null;
        var ea=window.computeEA&&t?window.computeEA(t,0):5;
        var season=t?t.season:0;
        var tg=window.getTerraGrade&&t?window.getTerraGrade(t):{name:'Common'};
        // Place adjacent — offset second plant by ~100m
        var pLat=lat+(i===0?0:0.0009);
        var pLng=lng+(i===0?0:0.0009);
        wild.push({lat:pLat,lng:pLng,hash:h,date:new Date().toISOString(),own:true,ownerUid:uid,ownerName:'Stephen',ea:ea,defenderGame:'set',season:season,grade:tg.name,generation:1});
      }
      localStorage.setItem('fg_wild_plants',JSON.stringify(wild));
      alert('Dropped 2 test plants at '+lat.toFixed(4)+','+lng.toFixed(4)+'!\nEA: '+wild[wild.length-2].ea+' & '+wild[wild.length-1].ea+'\nSwitch to Wild tab, then use Simulate Spread.');
    },
    purgeFirestoreDrops:function(){
      if(!confirm('DELETE all wildDrops docs from Firestore? This removes every plant on the global map.'))return;
      try{
        var db=firebase.firestore();
        db.collection('wildDrops').get().then(function(snap){
          var batch=db.batch();
          var count=0;
          snap.forEach(function(doc){batch.delete(doc.ref);count++;});
          if(count===0){alert('No wildDrops docs found.');return;}
          batch.commit().then(function(){alert('Deleted '+count+' wildDrops docs.');location.reload();}).catch(function(e){alert('Batch error: '+e.message);});
        }).catch(function(e){alert('Query error: '+e.message);});
      }catch(e){alert(e.message);}
    },
    fullReset:function(){
      if(!confirm('NUCLEAR: Wipe everything — local + cloud + sign out?'))return;
      try{
        var user=firebase.auth().currentUser;
        if(user)firebase.firestore().collection('vaults').doc(user.uid).delete();
        firebase.auth().signOut();
      }catch(e){}
      localStorage.clear();
      alert('Everything wiped. Reloading.');
      location.reload();
    },
    fillGreenhouse:function(){
      if(!window.mintPlant){alert('mintPlant not available');return;}
      var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
      var slots=parseInt(localStorage.getItem('sws_greenhouse_slots')||'10');
      var need=Math.max(0,slots-gh.length);
      if(need===0){alert('Greenhouse already full ('+gh.length+'/'+slots+')');return;}
      var minted=0;
      function _mint(){
        var h='';for(var i=0;i<64;i++)h+='0123456789abcdef'[Math.floor(Math.random()*16)];
        mintPlant(h).then(function(){
          minted++;
          if(minted>=need){
            alert('Filled greenhouse: +'+minted+' plants. Ready for breeding!');
            if(window.renderGreenhouse)renderGreenhouse();
            if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
          } else {_mint();}
        });
      }
      _mint();
    },
    generatePlant:function(count){
      count=count||1;
      if(!window.mintPlant){alert('mintPlant not available');return;}
      var minted=0;
      function _mint(){
        var h='';for(var i=0;i<64;i++)h+='0123456789abcdef'[Math.floor(Math.random()*16)];
        var grade='?';
        try{if(window.hashToTraits&&window.getTerraGrade){grade=window.getTerraGrade(window.hashToTraits(h)).label;}}catch(e){}
        mintPlant(h).then(function(ok){
          minted++;
          if(minted>=count){
            alert('Generated '+minted+' plant'+(minted>1?'s':'')+'. Check greenhouse.');
            if(window.renderGreenhouse)renderGreenhouse();
            if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
          } else {_mint();}
        });
      }
      _mint();
    },
    spawnTestPlants:function(){
      if(!window.mintPlant){alert('mintPlant not available');return;}
      var hashes=[
        {tier:'Mythic',hash:'0717c6d1139407e768d2041ac0dd26dd275f2b83a3fad5fb792316a35ba217d8'},  // Toad (mythByte=0xD2)
        {tier:'Mythic',hash:'b5de4f83f6ad365885ecc07018e30a1964742e55de539af5a5f650ce5cd4e629'},  // Phoenix (mythByte=0xEC)
        {tier:'Cosmic',hash:'98e42ce4fae1a70ea0ff1665ea7e7573e98e6d2c377d16bb893220754a579a4b'},  // Beholder (mythByte=0xFF)
        {tier:'Cosmic',hash:'8c63fd69b9e4dcb5d3ff68bee8d21947af80ae28947b697c3c2469f3f7a01108'}   // Beholder + Albino mutation
      ];
      var count=0;
      hashes.forEach(function(h){
        mintPlant(h.hash).then(function(ok){
          if(ok!==false)count++;
          if(count===hashes.length||h===hashes[hashes.length-1]){
            alert('Spawned '+count+' test plants (2 Mythic, 2 Cosmic). Switch to Greenhouse.');
            if(window.renderGreenhouse)renderGreenhouse();
          }
        });
      });
    },
    // ═══ COMPANION & AURA TESTER (set-39) ═══
    companionTester:function(){
      var ov=document.getElementById('comp-tester');
      if(ov){ov.remove();}
      ov=document.createElement('div');ov.id='comp-tester';
      ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(5,8,4,0.98);overflow-y:auto;padding:0.75rem;';

      // State
      var _hash='';for(var i=0;i<64;i++)_hash+='0123456789abcdef'[Math.floor(Math.random()*16)];
      var _compIdx=20;var _auraIdx=0;var _baseIdx=0;var _sz=200;var _hasFlower=true;
      var _stemIdx=0;

      // Companion names from TRAIT_BANK
      var _compNames=[];
      try{var tb=window.TRAIT_BANK||{};var cl=tb.companions||[];for(var ci=0;ci<cl.length;ci++)_compNames.push(ci+': '+(cl[ci].name||'None'));}catch(e){for(var ci2=0;ci2<82;ci2++)_compNames.push(ci2+': idx'+ci2);}

      // Aura names
      var _auraNames=[];
      try{var al=(window.TRAIT_BANK||{}).auras||[];for(var ai=0;ai<al.length;ai++)_auraNames.push(ai+': '+(al[ai].name||'None'));}catch(e){for(var ai2=0;ai2<36;ai2++)_auraNames.push(ai2+': idx'+ai2);}

      // Substrate names
      var _baseNames=[];
      try{var bl=(window.TRAIT_BANK||{}).substrates||[];for(var bi=0;bi<bl.length;bi++)_baseNames.push(bi+': '+(bl[bi].name||'None'));}catch(e){for(var bi2=0;bi2<71;bi2++)_baseNames.push(bi2+': idx'+bi2);}

      function _render(){
        // Override traits via hash manipulation — build a custom traits object
        var t=null;
        try{t=window.hashToTraits(_hash);}catch(e){return;}
        t.companion=_compIdx;
        t.aura=_auraIdx;
        t.base=_baseIdx;
        t.hasFlower=_hasFlower;
        t.stem=_stemIdx;
        // Render with overridden traits
        var svg='';
        try{svg=window._generatePlantSVG(_hash,_sz,1.0,t);}catch(e){
          // Fallback — generate without trait override
          try{svg=window._generatePlantSVG(_hash,_sz);}catch(e2){svg='<div style="color:red;">Render error</div>';}
        }
        var stage=document.getElementById('ct-stage');if(stage)stage.innerHTML=svg;
        var label=document.getElementById('ct-label');
        var cn=_compNames[_compIdx]||('idx '+_compIdx);
        var an=_auraNames[_auraIdx]||('idx '+_auraIdx);
        if(label)label.textContent=cn;
        var info=document.getElementById('ct-info');
        if(info)info.textContent='Aura: '+an+' | Size: '+_sz+'px';
      }

      function _buildSelect(id,items,val,cb){
        var h='<select id="'+id+'" style="width:100%;padding:8px;border:1px solid rgba(122,179,86,0.2);border-radius:6px;background:rgba(26,36,22,0.8);color:#e8dcc8;font-size:0.5rem;font-family:DM Mono,monospace;min-height:40px;">';
        for(var i=0;i<items.length;i++){
          h+='<option value="'+i+'"'+(i===val?' selected':'')+'>'+items[i]+'</option>';
        }
        h+='</select>';return h;
      }

      var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">';
      h+='<div style="font-family:sans-serif;font-size:0.9rem;color:#c8a84b;">COMPANION & AURA TESTER</div>';
      h+='<button onclick="document.getElementById(\'comp-tester\').remove()" style="width:40px;height:40px;border-radius:50%;border:1px solid rgba(200,168,75,0.3);background:none;color:#c8a84b;font-size:0.8rem;cursor:pointer;">✕</button>';
      h+='</div>';

      // Stage
      h+='<div id="ct-stage" style="width:min(320px,90vw);height:min(380px,55vh);margin:0 auto;background:radial-gradient(ellipse at 50% 80%,rgba(26,36,22,0.6),#050505 70%);border:1px solid rgba(74,124,53,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;overflow:visible;"></div>';
      h+='<div id="ct-label" style="text-align:center;font-family:sans-serif;font-size:0.65rem;color:#c8a84b;margin:0.3rem 0 0.1rem;letter-spacing:0.06em;"></div>';
      h+='<div id="ct-info" style="text-align:center;font-size:0.42rem;color:#8a9178;margin-bottom:0.3rem;"></div>';

      // Companion nav
      h+='<div style="max-width:320px;margin:0 auto;">';
      h+='<div style="font-family:sans-serif;font-size:0.55rem;color:#7ab356;margin-bottom:0.2rem;">COMPANION</div>';
      h+='<div style="display:flex;gap:6px;align-items:center;justify-content:center;margin-bottom:0.3rem;">';
      h+='<button onclick="window._ctPrev()" style="width:48px;height:48px;border-radius:50%;border:1.5px solid rgba(200,168,75,0.3);background:rgba(200,168,75,0.08);color:#c8a84b;font-size:1.2rem;cursor:pointer;">&#9664;</button>';
      h+='<button onclick="window._ctNext()" style="width:48px;height:48px;border-radius:50%;border:1.5px solid rgba(200,168,75,0.3);background:rgba(200,168,75,0.08);color:#c8a84b;font-size:1.2rem;cursor:pointer;">&#9654;</button>';
      h+='</div>';
      h+=_buildSelect('ct-comp',_compNames,_compIdx);

      h+='<div style="font-family:sans-serif;font-size:0.55rem;color:#7ab356;margin:0.4rem 0 0.2rem;">AURA</div>';
      h+=_buildSelect('ct-aura',_auraNames,_auraIdx);

      h+='<div style="font-family:sans-serif;font-size:0.55rem;color:#7ab356;margin:0.4rem 0 0.2rem;">SUBSTRATE</div>';
      h+=_buildSelect('ct-base',_baseNames,_baseIdx);

      h+='<div style="font-family:sans-serif;font-size:0.55rem;color:#7ab356;margin:0.4rem 0 0.2rem;">STEM TYPE (0-23)</div>';
      h+='<input type="range" id="ct-stem" min="0" max="23" value="0" style="width:100%;accent-color:#7ab356;">';

      h+='<div style="font-family:sans-serif;font-size:0.55rem;color:#7ab356;margin:0.4rem 0 0.2rem;">PLANT SIZE</div>';
      h+='<input type="range" id="ct-size" min="120" max="300" value="200" style="width:100%;accent-color:#7ab356;">';

      h+='<div style="display:flex;gap:6px;margin-top:0.4rem;flex-wrap:wrap;">';
      h+='<button onclick="window._ctRandom()" style="flex:1;padding:8px;border:1px solid rgba(200,168,75,0.3);border-radius:6px;background:rgba(200,168,75,0.08);color:#c8a84b;font-size:0.55rem;font-family:sans-serif;cursor:pointer;min-height:44px;">RANDOM PLANT</button>';
      h+='<button onclick="window._ctFlower()" style="flex:1;padding:8px;border:1px solid rgba(122,179,86,0.3);border-radius:6px;background:rgba(122,179,86,0.08);color:#7ab356;font-size:0.55rem;font-family:sans-serif;cursor:pointer;min-height:44px;">TOGGLE BLOOM</button>';
      h+='</div>';
      h+='</div>';

      ov.innerHTML=h;
      document.body.appendChild(ov);

      // Wire events after DOM exists
      var compSel=document.getElementById('ct-comp');
      var auraSel=document.getElementById('ct-aura');
      var baseSel=document.getElementById('ct-base');
      var stemSlider=document.getElementById('ct-stem');
      var sizeSlider=document.getElementById('ct-size');

      compSel.onchange=function(){_compIdx=parseInt(this.value);_render();};
      auraSel.onchange=function(){_auraIdx=parseInt(this.value);_render();};
      baseSel.onchange=function(){_baseIdx=parseInt(this.value);_render();};
      stemSlider.oninput=function(){_stemIdx=parseInt(this.value);_render();};
      sizeSlider.oninput=function(){_sz=parseInt(this.value);_render();};

      window._ctPrev=function(){
        _compIdx--;if(_compIdx<0)_compIdx=_compNames.length-1;
        // Skip None slots
        while(_compIdx<20&&_compIdx>0)_compIdx--;
        if(_compIdx<20)_compIdx=_compNames.length-1;
        compSel.value=_compIdx;_render();
      };
      window._ctNext=function(){
        _compIdx++;if(_compIdx>=_compNames.length)_compIdx=20;
        // Skip None slots
        while(_compIdx<20)_compIdx++;
        compSel.value=_compIdx;_render();
      };
      window._ctRandom=function(){
        _hash='';for(var ri=0;ri<64;ri++)_hash+='0123456789abcdef'[Math.floor(Math.random()*16)];
        _render();
      };
      window._ctFlower=function(){_hasFlower=!_hasFlower;_render();};

      // Initial render
      setTimeout(_render,100);
    },
    // ═══ LEAF & BLOOM EDITOR ═══
    leafBloomEditor:function(){
      try{
      var dp=document.getElementById('pw-dev-admin');if(dp)dp.classList.remove('open');
      var ov=document.getElementById('lbe-tool');
      if(ov){ov.remove();return;}
      var _mode='leaf'; // 'leaf' or 'bloom'
      var _idx=0;
      var _maxLeaf=59; // leaf types 0-59
      var _maxBloom=70; // bloom types 0-70
      // Base hash — we'll override specific bytes to force leaf/bloom type
      var _baseHash='5a8f3c2d1e7b4a9063d5f8c2a1b47e9053c6d8f2a4b71e8039d5c7f1a2b64e80';

      function _render(){
        var card=document.getElementById('lbe-card');
        if(!card)return;
        var max=_mode==='leaf'?_maxLeaf:_maxBloom;
        if(_idx<0)_idx=max;
        if(_idx>max)_idx=0;
        // Build a hash that forces the desired leaf or bloom type
        var h=_baseHash.split('');
        if(_mode==='leaf'){
          // leafType = hb(4), hb reads 2 hex chars at position n*2
          var leafHex=(_idx).toString(16).padStart(2,'0');
          h[8]=leafHex[0];h[9]=leafHex[1];
        } else {
          // flower = hb(11), hasFlower = hc(10) > 4 so force hc(10)=f
          h[20]='f'; // force hasFlower
          var bloomHex=(_idx).toString(16).padStart(2,'0');
          h[22]=bloomHex[0];h[23]=bloomHex[1];
        }
        var hash=h.join('');
        var svg='';
        try{svg=window._generatePlantSVG(hash,{});}catch(e){svg='<text x="35" y="50" fill="red" font-size="3">'+e.message+'</text>';}
        card.innerHTML='<svg viewBox="0 0 70 95" style="width:100%;height:100%;background:rgba(13,16,12,0.95);border-radius:8px;">'+svg+'</svg>';
        document.getElementById('lbe-label').textContent=_mode.toUpperCase()+' #'+_idx;
        document.getElementById('lbe-counter').textContent=(_idx)+' / '+max;
        // Get trait name
        var nameEl=document.getElementById('lbe-name');
        if(nameEl){
          try{
            var t=window.hashToTraits(hash);
            var banks=window.FG_Data?FG_Data.traitBanks:null;
            if(banks&&_mode==='leaf'&&banks.leaves&&banks.leaves[_idx]){
              nameEl.textContent=banks.leaves[_idx].name||'';
            }else if(banks&&_mode==='bloom'&&banks.flowers&&banks.flowers[_idx]){
              nameEl.textContent=banks.flowers[_idx].name||'';
            }else{nameEl.textContent='';}
          }catch(e){nameEl.textContent='';}
        }
      }

      ov=document.createElement('div');
      ov.id='lbe-tool';
      ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(8,10,6,0.97);display:flex;flex-direction:column;align-items:center;padding:12px;';
      ov.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;width:100%;max-width:400px;justify-content:space-between;">'+
        '<button id="lbe-prev" style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(122,179,86,0.3);background:none;color:var(--sage);font-size:1.2rem;cursor:pointer;">&#9664;</button>'+
        '<div style="text-align:center;">'+
        '<div id="lbe-label" style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;color:var(--gold);letter-spacing:0.1em;">LEAF #0</div>'+
        '<div id="lbe-name" style="font-family:DM Mono,monospace;font-size:0.4rem;color:var(--cream);"></div>'+
        '<div id="lbe-counter" style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--muted);">0 / 59</div>'+
        '</div>'+
        '<button id="lbe-next" style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(122,179,86,0.3);background:none;color:var(--sage);font-size:1.2rem;cursor:pointer;">&#9654;</button>'+
        '<button id="lbe-close" style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(192,80,80,0.3);background:none;color:#c07070;font-size:1.2rem;cursor:pointer;">&#10005;</button>'+
        '</div>'+
        '<div style="display:flex;gap:8px;margin-bottom:8px;">'+
        '<button id="lbe-mode-leaf" style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;padding:6px 16px;border-radius:4px;border:1px solid var(--sage);background:rgba(122,179,86,0.15);color:var(--sage);cursor:pointer;min-height:36px;">LEAVES</button>'+
        '<button id="lbe-mode-bloom" style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;padding:6px 16px;border-radius:4px;border:1px solid var(--gold);background:none;color:var(--gold);cursor:pointer;min-height:36px;">BLOOMS</button>'+
        '</div>'+
        '<div id="lbe-card" style="width:70vw;max-width:300px;height:calc(100vh - 140px);max-height:500px;position:relative;border-radius:8px;overflow:hidden;"></div>';
      document.body.appendChild(ov);

      document.getElementById('lbe-prev').onclick=function(){_idx--;_render();};
      document.getElementById('lbe-next').onclick=function(){_idx++;_render();};
      document.getElementById('lbe-close').onclick=function(){ov.remove();};
      document.getElementById('lbe-mode-leaf').onclick=function(){
        _mode='leaf';_idx=0;
        document.getElementById('lbe-mode-leaf').style.background='rgba(122,179,86,0.15)';
        document.getElementById('lbe-mode-bloom').style.background='none';
        _render();
      };
      document.getElementById('lbe-mode-bloom').onclick=function(){
        _mode='bloom';_idx=0;
        document.getElementById('lbe-mode-bloom').style.background='rgba(200,168,75,0.15)';
        document.getElementById('lbe-mode-leaf').style.background='none';
        _render();
      };
      _render();
      }catch(e){alert('Leaf/Bloom Editor error: '+e.message);}
    },
    // ═══ CARD BACK NAMEPLATE VIEWER ═══
    cardBackViewer:function(){
      try{
      // Close dev panel so tool is visible
      var dp=document.getElementById('pw-dev-admin');if(dp)dp.classList.remove('open');
      var ov=document.getElementById('cbv-tool');
      if(ov){ov.remove();return;}
      var tiers=['common','uncommon','rare','epic','legendary','mythic','cosmic'];
      var tierColors={common:'#A0A090',uncommon:'#7AB856',rare:'#5B8FB9',epic:'#B070D0',legendary:'#C8A84B',mythic:'#A87285',cosmic:'#FF6B6B'};
      var _idx=0;
      var _testName='Verdant Whisper of Dawn';

      function _render(){
        try{
        var tier=tiers[_idx];
        var color=tierColors[tier]||'#E8DCC8';
        var card=document.getElementById('cbv-card');
        if(!card)return;
        var h='<div class="cs-card-back" data-tier="'+tier+'" style="position:absolute;inset:0;transform:none;border-radius:12px;padding:10% 8% 6%;">';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.4rem;color:var(--muted);text-align:center;margin-top:20%;">TERRA GRADE</div>';
        h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1rem;color:'+color+';text-align:center;letter-spacing:0.1em;">'+tier.toUpperCase()+'</div>';
        h+='<div class="cb-nameplate"><span class="cb-name" style="color:'+color+';">'+_testName+'</span></div>';
        h+='</div>';
        card.innerHTML=h;
        document.getElementById('cbv-tier').textContent=tier.toUpperCase();
        document.getElementById('cbv-counter').textContent=(_idx+1)+'/'+tiers.length;
        }catch(e){alert('Render error: '+e.message);}
      }

      ov=document.createElement('div');
      ov.id='cbv-tool';
      ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(8,10,6,0.97);display:flex;flex-direction:column;align-items:center;padding:12px;';
      ov.innerHTML='<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;width:100%;max-width:400px;justify-content:space-between;"><button id="cbv-prev" style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(122,179,86,0.3);background:none;color:var(--sage);font-size:1.2rem;cursor:pointer;">&#9664;</button><div style="text-align:center;"><div id="cbv-tier" style="font-family:Bebas Neue,sans-serif;font-size:1.2rem;color:var(--gold);letter-spacing:0.1em;">COMMON</div><div id="cbv-counter" style="font-family:DM Mono,monospace;font-size:0.4rem;color:var(--muted);">1/7</div></div><button id="cbv-next" style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(122,179,86,0.3);background:none;color:var(--sage);font-size:1.2rem;cursor:pointer;">&#9654;</button><button id="cbv-close" style="width:48px;height:48px;border-radius:50%;border:1px solid rgba(192,80,80,0.3);background:none;color:#c07070;font-size:1.2rem;cursor:pointer;">&#10005;</button></div><div id="cbv-card" style="width:92vw;max-width:380px;height:calc(100vh - 100px);max-height:580px;position:relative;border-radius:12px;overflow:hidden;background:#050505;"></div>';
      document.body.appendChild(ov);
      document.getElementById('cbv-prev').onclick=function(){_idx=(_idx-1+tiers.length)%tiers.length;_render();};
      document.getElementById('cbv-next').onclick=function(){_idx=(_idx+1)%tiers.length;_render();};
      document.getElementById('cbv-close').onclick=function(){ov.remove();};
      _render();
      }catch(e){alert('Card Back Viewer error: '+e.message);}
    },
    // ═══ CARD FRONT ALIGNMENT TOOL ═══
    cardFrontAligner:function(){
      var ov=document.getElementById('cfa-tool');
      if(ov){ov.remove();}
      // Close dev panel so tool is visible
      var dp=document.getElementById('pw-dev-admin');if(dp)dp.classList.remove('open');

      // Get a sample plant (first in greenhouse or generate one)
      var gh=window.loadGreenhouse?loadGreenhouse():[];
      if(!gh.length){
        // Generate a test plant so tool works without greenhouse data
        var _testHash = '';
        for(var _ti=0;_ti<64;_ti++) _testHash += '0123456789abcdef'[Math.floor(Math.random()*16)];
        gh = [{hash:_testHash,mintedAt:Date.now(),generation:1}];
      }

      // Current CSS values
      var _vals={
        nameRow:13, artRow:55, haikuRow:26,
        padTop:6, padSide:8, padBot:4,
        nameFontMain:1.3, nameFontTop:0.55, nameFontTitle:0.5,
        haikuFont:0.62, haikuLine:1.5,
        nameLetterSp:0.04,
        artMaxW:80, artPadBot:2,
        eaTop:11, eaRight:10
      };

      ov=document.createElement('div');ov.id='cfa-tool';
      ov.style.cssText='position:fixed;inset:0;z-index:2147483646;background:rgba(5,8,4,0.98);display:flex;flex-direction:column;overflow:hidden;';

      // Top bar
      var top='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid rgba(122,179,86,0.2);flex-shrink:0;">';
      top+='<div style="font-family:Cormorant Garamond,serif;font-size:1rem;color:var(--gold);font-weight:700;">Card Front Alignment</div>';
      top+='<div style="display:flex;gap:8px;">';
      top+='<button id="cfa-prev" style="width:36px;height:36px;border-radius:50%;border:1px solid rgba(122,179,86,0.3);background:none;color:var(--sage);font-size:0.7rem;cursor:pointer;">◀</button>';
      top+='<span id="cfa-counter" style="font-family:DM Mono,monospace;font-size:0.45rem;color:var(--muted);align-self:center;">1/'+gh.length+'</span>';
      top+='<button id="cfa-next" style="width:36px;height:36px;border-radius:50%;border:1px solid rgba(122,179,86,0.3);background:none;color:var(--sage);font-size:0.7rem;cursor:pointer;">▶</button>';
      top+='<button id="cfa-close" style="width:36px;height:36px;border-radius:50%;border:1px solid rgba(192,80,80,0.3);background:none;color:#c07070;font-size:0.7rem;cursor:pointer;">✕</button>';
      top+='</div></div>';

      // Main area: card preview left, controls right (or stacked on narrow)
      var main='<div style="display:flex;flex:1;overflow:hidden;">';

      // Card preview
      main+='<div id="cfa-card-wrap" style="flex:1;display:flex;align-items:center;justify-content:center;padding:8px;min-width:0;">';
      main+='<div id="cfa-card" style="width:92vw;max-width:460px;height:calc(100vh - 180px);max-height:600px;position:relative;border-radius:12px;overflow:hidden;background:#050505;contain:layout style paint;isolation:isolate;"></div>';
      main+='</div>';

      // Controls panel (scrollable)
      main+='<div id="cfa-controls" style="width:200px;overflow-y:auto;padding:8px;border-left:1px solid rgba(122,179,86,0.15);flex-shrink:0;font-family:DM Mono,monospace;font-size:0.38rem;color:var(--cream);">';

      var sliders=[
        {key:'nameRow',    label:'Name Row %',    min:5,  max:25, step:0.5},
        {key:'artRow',     label:'Art Row %',     min:35, max:70, step:0.5},
        {key:'haikuRow',   label:'Haiku Row %',   min:10, max:40, step:0.5},
        {key:'padTop',     label:'Pad Top %',     min:0,  max:15, step:0.5},
        {key:'padSide',    label:'Pad Side %',    min:0,  max:15, step:0.5},
        {key:'padBot',     label:'Pad Bottom %',  min:0,  max:10, step:0.5},
        {key:'nameFontMain',label:'Name Size rem', min:0.6,max:2.0,step:0.05},
        {key:'nameFontTop', label:'Name Top rem',  min:0.3,max:0.9,step:0.05},
        {key:'nameFontTitle',label:'Name Title rem',min:0.3,max:0.8,step:0.05},
        {key:'nameLetterSp',label:'Name Spacing',  min:0,  max:0.15,step:0.005},
        {key:'haikuFont',  label:'Haiku Size rem', min:0.35,max:1.0,step:0.02},
        {key:'haikuLine',  label:'Haiku Line H',   min:1.0,max:2.2,step:0.05},
        {key:'artMaxW',    label:'Art Max W %',    min:50, max:100,step:1},
        {key:'artPadBot',  label:'Art Pad Bot %',  min:0,  max:8,  step:0.5},
        {key:'eaTop',      label:'EA Badge Top %', min:0,  max:25, step:0.5},
        {key:'eaRight',    label:'EA Badge Right %',min:0, max:20, step:0.5}
      ];
      for(var i=0;i<sliders.length;i++){
        var s=sliders[i];
        main+='<div style="margin-bottom:6px;">';
        main+='<div style="display:flex;justify-content:space-between;"><span>'+s.label+'</span><span id="cfa-v-'+s.key+'">'+_vals[s.key]+'</span></div>';
        main+='<input type="range" id="cfa-s-'+s.key+'" min="'+s.min+'" max="'+s.max+'" step="'+s.step+'" value="'+_vals[s.key]+'" style="width:100%;accent-color:var(--sage);height:20px;">';
        main+='</div>';
      }
      // Copy CSS button
      main+='<button id="cfa-copy" style="width:100%;margin-top:8px;padding:8px;border:1px solid rgba(200,168,75,0.3);border-radius:4px;background:rgba(200,168,75,0.08);color:var(--gold);font-family:DM Mono,monospace;font-size:0.4rem;cursor:pointer;">COPY CSS</button>';
      // Grid lines toggle
      main+='<label style="display:flex;align-items:center;gap:6px;margin-top:8px;cursor:pointer;"><input type="checkbox" id="cfa-grid" checked><span>Show grid lines</span></label>';
      main+='</div>';
      main+='</div>';

      ov.innerHTML=top+main;
      document.body.appendChild(ov);

      var _idx=0;
      var _cardEl=document.getElementById('cfa-card');

      function _renderCard(){
        var p=gh[_idx];
        if(!p)return;
        var t=hashToTraits(p.hash);
        var season=t.season%4;
        var seasonKeys=['spring','summer','autumn','winter'];
        var seasonEmblems=['\ud83c\udf38','\u2600\ufe0f','\ud83c\udf42','\u2744\ufe0f'];
        var sk=seasonKeys[season];
        var ea=window.computeEA?computeEA(t,0):0;
        var tg=getTerraGrade(t);
        var name=typeof getPlantName==='function'?getPlantName(p.hash):p.hash.slice(0,8);
        var haiku=typeof getHaiku==='function'?getHaiku(p.hash):{line1:'',line2:'',line3:''};
        var svg=window._generatePlantSVG?_generatePlantSVG(p.hash,180):'';
        svg=svg.replace(/<animate[^>]*\/>/gi,'').replace(/<animate[^<]*<\/animate>/gi,'').replace(/<animateTransform[^>]*\/>/gi,'');
        var np=typeof buildNameplate==='function'?buildNameplate(p.hash):name;
        var showGrid=document.getElementById('cfa-grid').checked;
        var gridBorder=showGrid?'border:1px dashed rgba(122,179,86,0.25);':'';

        var h='<div style="position:absolute;inset:0;display:grid;grid-template-rows:'+_vals.nameRow+'% '+_vals.artRow+'% '+_vals.haikuRow+'% auto;padding:'+_vals.padTop+'% '+_vals.padSide+'% '+_vals.padBot+'%;box-sizing:border-box;background-size:96%;background-position:center;background-repeat:no-repeat;background-image:url(assets/cards/fronts/front-'+sk+'.png);background-color:#050505;border-radius:12px;">';

        // Name zone
        h+='<div style="display:flex;align-items:center;justify-content:center;overflow:hidden;'+gridBorder+'">';
        h+='<div style="font-family:Cormorant Garamond,Playfair Display,serif;font-weight:700;text-align:center;letter-spacing:'+_vals.nameLetterSp+'em;text-shadow:0 2px 8px rgba(0,0,0,0.8);width:100%;line-height:1.15;color:var(--cream);">'+np+'</div>';
        h+='</div>';

        // Art zone
        h+='<div style="display:flex;align-items:flex-end;justify-content:center;overflow:hidden;padding-bottom:'+_vals.artPadBot+'%;'+gridBorder+'">';
        h+='<div style="max-height:100%;max-width:'+_vals.artMaxW+'%;">'+svg+'</div>';
        h+='</div>';

        // Haiku zone
        h+='<div style="display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0 4%;'+gridBorder+'">';
        h+='<div style="font-family:Playfair Display,serif;font-style:italic;font-size:'+_vals.haikuFont+'rem;color:rgba(212,207,188,0.88);text-align:center;line-height:'+_vals.haikuLine+';width:100%;">'+haiku.line1+'<br>'+haiku.line2+'<br>'+haiku.line3+'</div>';
        h+='</div>';

        // Hint zone
        h+='<div style="display:flex;align-items:center;justify-content:center;'+gridBorder+'">';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:rgba(122,179,86,0.35);">tap to flip \u2192</div>';
        h+='</div>';

        h+='</div>';

        // EA badge
        h+='<div style="position:absolute;top:'+_vals.eaTop+'%;right:'+_vals.eaRight+'%;font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--gold);background:rgba(10,10,8,0.75);border:1.5px solid rgba(200,168,75,0.3);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);">'+ea+'</div>';

        _cardEl.innerHTML=h;

        // Apply font sizes via style injection for np-main, np-top, np-title
        var npMain=_cardEl.querySelector('.np-main');
        if(npMain)npMain.style.fontSize=_vals.nameFontMain+'rem';
        var npTop=_cardEl.querySelector('.np-top');
        if(npTop)npTop.style.fontSize=_vals.nameFontTop+'rem';
        var npTitle=_cardEl.querySelector('.np-title');
        if(npTitle)npTitle.style.fontSize=_vals.nameFontTitle+'rem';

        document.getElementById('cfa-counter').textContent=(_idx+1)+'/'+gh.length;
      }

      // Wire sliders
      var allSliders=document.querySelectorAll('#cfa-controls input[type=range]');
      for(var j=0;j<allSliders.length;j++){
        (function(sl){
          sl.addEventListener('input',function(){
            var key=sl.id.replace('cfa-s-','');
            _vals[key]=parseFloat(sl.value);
            document.getElementById('cfa-v-'+key).textContent=sl.value;
            _renderCard();
          });
        })(allSliders[j]);
      }

      // Grid toggle
      document.getElementById('cfa-grid').addEventListener('change',function(){_renderCard();});

      // Nav
      document.getElementById('cfa-prev').onclick=function(){_idx=(_idx-1+gh.length)%gh.length;_renderCard();};
      document.getElementById('cfa-next').onclick=function(){_idx=(_idx+1)%gh.length;_renderCard();};
      document.getElementById('cfa-close').onclick=function(){ov.remove();};

      // Copy CSS
      document.getElementById('cfa-copy').onclick=function(){
        var css='.cs-card-front{grid-template-rows:'+_vals.nameRow+'% '+_vals.artRow+'% '+_vals.haikuRow+'% auto;padding:'+_vals.padTop+'% '+_vals.padSide+'% '+_vals.padBot+'%;}\n';
        css+='.cf-name{letter-spacing:'+_vals.nameLetterSp+'em;}\n';
        css+='.cf-name .np-main{font-size:'+_vals.nameFontMain+'rem;}\n';
        css+='.cf-name .np-top{font-size:'+_vals.nameFontTop+'rem;}\n';
        css+='.cf-name .np-title{font-size:'+_vals.nameFontTitle+'rem;}\n';
        css+='.cf-haiku{font-size:'+_vals.haikuFont+'rem;line-height:'+_vals.haikuLine+';}\n';
        css+='.cf-art-window svg{max-width:'+_vals.artMaxW+'%;}\n';
        css+='.cf-art-window{padding-bottom:'+_vals.artPadBot+'%;}\n';
        css+='.cf-ea{top:'+_vals.eaTop+'%;right:'+_vals.eaRight+'%;}\n';

        if(navigator.clipboard){
          navigator.clipboard.writeText(css).then(function(){alert('CSS copied!');});
        }else{
          prompt('Copy this CSS:',css);
        }
      };

      // Scale the card to fit available space while keeping exact game dimensions
      function _fitCard(){
        var wrap=document.getElementById('cfa-card-wrap');
        var card=document.getElementById('cfa-card');
        if(!wrap||!card)return;
        // The card has real game CSS sizing (92vw × calc(100vh-180px)), so measure its natural size
        card.style.transform='none';
        var cw=card.offsetWidth, ch=card.offsetHeight;
        var ww=wrap.offsetWidth-16, wh=wrap.offsetHeight-16;
        var scale=Math.min(ww/cw, wh/ch, 1);
        card.style.transform='scale('+scale+')';
        card.style.transformOrigin='center center';
      }
      _fitCard();
      window.addEventListener('resize',_fitCard);
      // Clean up resize listener on close
      var _origClose=document.getElementById('cfa-close').onclick;
      document.getElementById('cfa-close').onclick=function(){window.removeEventListener('resize',_fitCard);ov.remove();};

      _renderCard();
    },
    // ═══ BETA TEST ACCELERATION ═══
    accelFerals:function(){
      // Clear all feral zone timers so they respawn immediately
      localStorage.removeItem('fg_feral_zones');
      localStorage.removeItem('fg_feral_cd');
      var data=[];try{data=JSON.parse(localStorage.getItem('fg_ferals')||'[]');}catch(e){}
      // Mark all as uncollected
      for(var i=0;i<data.length;i++)data[i].collected=false;
      localStorage.setItem('fg_ferals',JSON.stringify(data));
      alert('Feral timers reset! Switch to Wild tab — ferals will spawn from all occupied zones.');
    },
    accelRepro:function(){
      // Clear reproduction zone checks so it runs immediately
      localStorage.removeItem('fg_repro_zones');
      alert('Reproduction timers reset! Switch to Wild tab — breeding pairs will attempt reproduction.');
    },
    accelNursery:function(){
      // Set all nursery seeds to 3 unique water days so they can bloom instantly
      try{
        var nur=JSON.parse((window._secureGet?window._secureGet('sws_nursery'):localStorage.getItem('sws_nursery'))||'[]');
        if(nur.length===0){alert('No seeds in nursery.');return;}
        var bloomed=0;
        for(var i=0;i<nur.length;i++){
          if(nur[i].status==='growing'){
            nur[i].waterLog=['2026-01-01','2026-01-02','2026-01-03'];
            bloomed++;
          }
        }
        if(window._secureSet)window._secureSet('sws_nursery',nur);
        else localStorage.setItem('sws_nursery',JSON.stringify(nur));
        if(window.renderNursery)renderNursery();
        alert(bloomed+' seed(s) ready to bloom! Go to Nursery and tap BLOOM.');
      }catch(e){alert('Error: '+e.message);}
    },
    accelBackpack:function(){
      localStorage.removeItem('fg_bp_slot_cd');
      alert('Backpack cooldowns cleared!');
    },
    grantHashes:function(n){
      n=n||100;
      try{
        var raw=localStorage.getItem('sws_hash_ledger');
        if(window._secureGet)raw=window._secureGet('sws_hash_ledger')||raw;
        var ledger=JSON.parse(raw||'{}');
        ledger.earned=(ledger.earned||0)+n;
        var s=JSON.stringify(ledger);
        if(window._secureSet)window._secureSet('sws_hash_ledger',s);
        else localStorage.setItem('sws_hash_ledger',s);
        if(window.updateDashboard)updateDashboard();
        alert('+'+n+' Dew Drops granted! Total earned: '+ledger.earned);
      }catch(e){alert('Error: '+e.message);}
    },
    accelAll:function(){
      // One button to reset everything for immediate testing
      localStorage.removeItem('fg_feral_zones');
      localStorage.removeItem('fg_feral_cd');
      localStorage.removeItem('fg_repro_zones');
      localStorage.removeItem('fg_bp_slot_cd');
      localStorage.removeItem('fg_bp_midnight');
      // Bloom all nursery seeds
      try{
        var nur=JSON.parse((window._secureGet?window._secureGet('sws_nursery'):localStorage.getItem('sws_nursery'))||'[]');
        for(var i=0;i<nur.length;i++){if(nur[i].status==='growing')nur[i].waterLog=['2026-01-01','2026-01-02','2026-01-03'];}
        if(window._secureSet)window._secureSet('sws_nursery',nur);
        else localStorage.setItem('sws_nursery',JSON.stringify(nur));
      }catch(e){}
      // Grant 100 hashes
      try{
        var raw=localStorage.getItem('sws_hash_ledger');
        if(window._secureGet)raw=window._secureGet('sws_hash_ledger')||raw;
        var ledger=JSON.parse(raw||'{}');
        ledger.earned=(ledger.earned||0)+100;
        var s=JSON.stringify(ledger);
        if(window._secureSet)window._secureSet('sws_hash_ledger',s);
        else localStorage.setItem('sws_hash_ledger',s);
      }catch(e){}
      if(window.updateDashboard)updateDashboard();
      if(window.renderNursery)renderNursery();
      alert('EVERYTHING ACCELERATED!\n\n- Feral timers reset\n- Reproduction timers reset\n- Backpack cooldowns cleared\n- Nursery seeds bloom-ready\n- +100 Dew Drops granted\n\nSwitch to Wild tab to trigger spawns.');
    },
    grantDew:function(n){
      n=n||500;
      try{
        var raw=localStorage.getItem('sws_hash_ledger');
        if(window._secureGet)raw=window._secureGet('sws_hash_ledger')||raw;
        var ledger=JSON.parse(raw||'{}');
        ledger.earned=(ledger.earned||0)+n;
        var s=JSON.stringify(ledger);
        if(window._secureSet)window._secureSet('sws_hash_ledger',s);
        else localStorage.setItem('sws_hash_ledger',s);
        if(window.updateDashboard)updateDashboard();
        alert('+'+n+' Dew Drops granted! Total: '+ledger.earned);
      }catch(e){alert('Error: '+e.message);}
    },
    spawnChimeras:function(){
      // Spawn 4 chimera plants with different parent season combos for testing dual borders
      try{
        var _raw=window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse');
        var gh=[];try{gh=JSON.parse(_raw||'[]');}catch(e){}
        var combos=[
          {sA:0,sB:1,label:'Spring x Summer'},
          {sA:1,sB:2,label:'Summer x Autumn'},
          {sA:2,sB:3,label:'Autumn x Winter'},
          {sA:3,sB:0,label:'Winter x Spring'}
        ];
        var added=0;
        combos.forEach(function(c){
          // Generate hashes that produce specific seasons: season = hb(22) % 4
          // byte 22 = chars at positions 44-45 in hex hash
          // For season N, we need byte 22 where byte%4 === N
          var makeHash=function(season){
            var h='';
            for(var i=0;i<64;i++){h+=Math.floor(Math.random()*16).toString(16);}
            // Force season: hb(22) = h[22]+h[23], season = hb(22)%4
            var seasonByte=season;// 0,1,2,3 all have %4 = themselves
            var hexB=('0'+seasonByte.toString(16)).slice(-2);
            h=h.substring(0,22)+hexB+h.substring(24);
            return h;
          };
          var parentAHash=makeHash(c.sA);
          var parentBHash=makeHash(c.sB);
          // Child hash: combine parents
          var childHash='';
          for(var i=0;i<64;i++){
            var a=parseInt(parentAHash[i],16);
            var b=parseInt(parentBHash[i],16);
            childHash+=((a+b+i)%16).toString(16);
          }
          // Force child season to parentA's season
          var sByte=('0'+c.sA.toString(16)).slice(-2);
          childHash=childHash.substring(0,22)+sByte+childHash.substring(24);
          var plant={
            hash:childHash,date:new Date().toISOString(),born:Date.now(),
            origin:'dev-chimera',rare:true,traits:null,breedCount:0,
            generation:1,parentAHash:parentAHash,parentBHash:parentBHash
          };
          // Check for duplicate
          var exists=false;
          gh.forEach(function(p){if(p.hash===plant.hash)exists=true;});
          if(!exists){gh.push(plant);added++;}
        });
        if(window.saveGreenhouse)saveGreenhouse(gh);
        else localStorage.setItem('sws_greenhouse',JSON.stringify(gh));
        if(window.renderGreenhouse)renderGreenhouse();
        alert(added+' chimera plants spawned!\n\nSpring×Summer, Summer×Autumn, Autumn×Winter, Winter×Spring\n\nCheck your Greenhouse for dual-border cards.');
      }catch(e){alert('Error: '+e.message);}
    }
  };
})();

// ── PWA INSTALL PROMPT CAPTURE ──
var deferredPrompt = null;
var pwaInstallDismissed = false;

// Capture the browser's install prompt before it shows
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault(); // Suppress browser mini-infobar
  deferredPrompt = e;
  console.log('[PWA] Install prompt captured and deferred.');
});

// Execute install when user clicks "Secure My Greenhouse"
window.executePWAInstall = function() {
  if (!deferredPrompt) {
    // Fallback for browsers without beforeinstallprompt (iOS Safari)
    document.getElementById('pwa-install-modal').classList.remove('open');
    alert('To add Lucid Winds to your Home Screen:\n\niPhone/iPad: Tap the Share button (↑) then "Add to Home Screen"\n\nAndroid: Tap the ⋮ menu then "Add to Home Screen"');
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function(result) {
    document.getElementById('pwa-install-modal').classList.remove('open');
    if (result.outcome === 'accepted') {
      console.log('[PWA] User accepted install.');
      if (typeof gtag !== 'undefined') gtag('event', 'pwa_install', { outcome: 'accepted' });
    } else {
      console.log('[PWA] User dismissed install.');
      if (typeof gtag !== 'undefined') gtag('event', 'pwa_install', { outcome: 'dismissed' });
    }
    deferredPrompt = null;
  });
};

// Dismiss with muted warning
window.dismissPWA = function() {
  document.getElementById('pwa-install-modal').classList.remove('open');
  pwaInstallDismissed = true;
  if (typeof gtag !== 'undefined') gtag('event', 'pwa_install', { outcome: 'risk_it' });
};

// Trigger the modal — DISABLED (Director: obsolete)
window.checkPWAPrompt = function() { return; };

// Close on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var modal = document.getElementById('pwa-install-modal');
    if (modal && modal.classList.contains('open')) dismissPWA();
  }
});
