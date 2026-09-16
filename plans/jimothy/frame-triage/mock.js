(function(){
  var docs = {}, subs = [], log = window.__mockLog = {writes: [], saves: [], uploads: [], deletes: []};
  function snapDocs(){ return Object.keys(docs).sort().map(function(id){ var d = docs[id]; return {id: id, exists: true, data: function(){ return JSON.parse(JSON.stringify(d)); }, metadata: {fromCache:false, hasPendingWrites:false}}; }); }
  function emit(changes){ var ds = snapDocs(); subs.forEach(function(fn){ fn({docs: ds, size: ds.length, empty: !ds.length, docChanges: function(){ return changes; }, metadata: {}}); }); }
  var db = {collection: function(path){ return {
    doc: function(id){ return {set: function(data){ log.writes.push({path: path + '/' + id, data: data}); return new Promise(function(r){ setTimeout(function(){ var existed = !!docs[id]; docs[id] = JSON.parse(JSON.stringify(data)); r(); emit([{type: existed ? 'modified' : 'added', doc: snapDocs().filter(function(d){ return d.id === id; })[0]}]); }, 30); }); }}; },
    onSnapshot: function(fn){ subs.push(fn); setTimeout(function(){ var ds = snapDocs(); fn({docs: ds, size: ds.length, empty: !ds.length, docChanges: function(){ return ds.map(function(d){ return {type:'added', doc:d}; }); }, metadata: {}}); }, 20); return function(){}; }
  }; }};
  var n = 0;
  var downloads = {save: function(req){ log.saves.push({filename: req.filename, size: req.data && (req.data.size || req.data.length)}); return Promise.resolve({status: 'saved'}); }};
  var assets = {upload: function(blob, o){ var id = ('a' + (++n) + '00000000000000000000000000000000').slice(0, 32); log.uploads.push({id: id, type: o && o.type, size: blob.size}); return new Promise(function(r){ setTimeout(function(){ r({id: id, url: '/_blob/' + id, sizeBytes: blob.size, contentType: o && o.type}); }, 50); }); },
    delete: function(id){ log.deletes.push(id); return Promise.resolve({deleted: true}); }, list: function(){ return Promise.resolve({assets: [], usage: {}}); }};
  var ns = {db: db, downloads: downloads, assets: assets};
  window.claude = {use: function(name){ return new Promise(function(r){ setTimeout(function(){ r(ns[name] || null); }, 60); }); }};
  window.__mockDocs = docs;
})();
