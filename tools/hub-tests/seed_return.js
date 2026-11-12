(function(){ try {
  var L = localStorage; if (L.getItem('__audit_seeded')) return; L.setItem('__audit_seeded','1');
  L.setItem('pw_onboarded','1'); L.setItem('lw_onboard_tutorial_done','1'); L.setItem('lwfb_explained','1'); L.setItem('lw_beta_ack','1');
  L.setItem('pw_keeper_name','Auditor');
  // 14 deterministic plants (xorshift so the same greenhouse every run)
  var s = 0x9e3779b9; function rnd(){ s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }
  var gh = []; for (var i = 0; i < 14; i++) { var h = ''; for (var k = 0; k < 64; k++) h += '0123456789abcdef'[Math.floor(rnd() * 16)]; gh.push({ hash: h, date: '2026-11-0' + (1 + (i % 9)), born: Date.now() - (i + 1) * 86400000 * 3, origin: i === 0 ? 'gift' : 'mint', rare: false, traits: null, breedCount: 0, generation: 1 }); }
  L.setItem('sws_greenhouse', JSON.stringify(gh));
} catch (e) {} })();
