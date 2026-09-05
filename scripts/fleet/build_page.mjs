/* Build the browsable punch list from audit-merged.json + thumbs/. */
import { readFileSync, writeFileSync, existsSync } from "fs";
const SP = "/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad";
const OUT = process.argv[2] || SP + "/fleet-art.html";

const rows = JSON.parse(readFileSync(SP + "/audit-merged.json", "utf8"))
  .filter(r => r.slug !== "play-pompond");

const VORDER = { poor: 0, plain: 1, decent: 2, strong: 3 };
rows.sort((a, b) => (VORDER[a.verdict] - VORDER[b.verdict]) || (b.impact - a.impact) ||
  ((b.fill ?? 0) - (a.fill ?? 0)) || String(a.name).localeCompare(String(b.name)));

const thumb = s => {
  const p = `${SP}/thumbs/${s}.webp`;
  return existsSync(p) ? "data:image/webp;base64," + readFileSync(p).toString("base64") : "";
};

const data = rows.map(r => ({
  s: r.slug, n: r.name, k: r.kind, c: r.cat || "", g: r.verdict,
  i: r.impact, e: r.effort, born: r.created || "", fill: r.fill,
  gated: !!r.gated, src: r.sourceFile || "",
  now: r.looks_now || "", wrong: r.three_wrong || [],
  bgNow: r.background_now || "", bgWant: r.background_want || "",
  art: (r.graphics_wants || []).map(a => [a.asset, a.spec, a.why]),
  css: r.css_wants || [],
  emoji: (r.emoji_as_art && !/^none/i.test(r.emoji_as_art)) ? r.emoji_as_art : "",
  read: (r.readability && !/^ok\b/i.test(r.readability)) ? r.readability : "",
  /* free prose, so a prefix test over-counts: require a word that names an actual overlap */
  chip: (function(t){
    t = (r.music_chip_collision || "").trim();
    if (!t || /^(none|no\b|not\b|n\/a)/i.test(t)) return "";
    return /\b(cover|covering|covers|overlap|obscur|on top of|clip|occlud|lands on|hides|sits over|destroy)/i.test(t) ? t : "";
  })(),
  emojiN: r.emojiTotal || 0,
  broke: r.looks_broken ? (r.broken_evidence || "") : "",
  brokeChk: r.looks_broken ? (r.broken_check || "not yet second-checked") : "",
  brokeSev: r.broken_severity || "",
  refuted: (!r.looks_broken && /^REFUTED/.test(r.broken_check || "")) ? r.broken_check.replace(/^REFUTED on a second look: /, "") : "",
  t: thumb(r.slug),
}));

const tot = {
  games: data.length,
  art: data.reduce((a, d) => a + d.art.length, 0),
  css: data.reduce((a, d) => a + d.css.length, 0),
  chip: data.filter(d => d.chip).length,
  emojiHeavy: data.filter(d => d.emojiN >= 20).length,
  broke: data.filter(d => d.broke).length,
  byG: data.reduce((a, d) => (a[d.g] = (a[d.g] || 0) + 1, a), {}),
};

const html = `<title>Fleet Art Punch List</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Midnight greenhouse. The arcade's own tokens (CLAUDE.md), committed to a single
   dark world on purpose: every thumbnail on this page is a dark game screen, and a
   light ground would turn 186 of them into holes. Every colour is painted, so the
   page holds whatever ground the host puts behind it. */
:root{
  --bg:#0b0e0a; --panel:#131811; --panel2:#181e15; --line:#2a3324; --line2:#3a4632;
  --cream:#e8dcc8; --muted:#8f9880; --dim:#6b7460;
  --sage:#7ab356; --gold:#c8a84b;
  --poor:#c4564a; --plain:#cf8b3a; --decent:#7ab356; --strong:#4e9b86;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --body:"Hanken Grotesk",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --disp:"Fraunces",Georgia,"Times New Roman",serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--cream);font-family:var(--body);font-size:15px;line-height:1.5;
     -webkit-font-smoothing:antialiased}
a{color:var(--gold)}
.wrap{max-width:1080px;margin:0 auto;padding:28px 18px 80px}

header.top{border-bottom:1px solid var(--line);padding-bottom:20px;margin-bottom:22px}
h1{font-family:var(--disp);font-weight:800;font-size:clamp(28px,5vw,44px);line-height:1.04;margin:0 0 6px;
   letter-spacing:-.015em;text-wrap:balance;color:var(--cream)}
.sub{color:var(--muted);max-width:62ch;margin:0 0 18px}
.sub b{color:var(--cream);font-weight:600}

/* proportion bar: the point is the shape of the fleet, not four big numbers */
.bar{display:flex;height:12px;border-radius:6px;overflow:hidden;border:1px solid var(--line);margin-bottom:9px}
.bar i{display:block;height:100%}
.barkey{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--muted);margin-bottom:16px}
.barkey span{display:flex;align-items:center;gap:6px}
.barkey b{color:var(--cream);font-weight:600;font-variant-numeric:tabular-nums}
.dot{width:9px;height:9px;border-radius:2px;flex:0 0 auto}

.tallies{display:flex;flex-wrap:wrap;gap:10px 26px;font-size:13.5px;color:var(--muted);
         border-top:1px solid var(--line);padding-top:14px}
.tallies b{color:var(--gold);font-weight:700;font-variant-numeric:tabular-nums;font-size:15px}

/* filters */
.filters{position:sticky;top:0;z-index:20;background:var(--bg);border-bottom:1px solid var(--line);
         padding:12px 0 12px;margin-bottom:4px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.chip{appearance:none;border:1px solid var(--line2);background:transparent;color:var(--muted);
      font-family:var(--body);font-size:13px;font-weight:600;padding:7px 12px;border-radius:999px;cursor:pointer;
      min-height:34px;letter-spacing:.01em}
.chip:hover{border-color:var(--muted);color:var(--cream)}
.chip[aria-pressed="true"]{background:var(--panel2);border-color:var(--gold);color:var(--cream)}
.chip .n{color:var(--dim);font-variant-numeric:tabular-nums;margin-left:5px}
.chip[aria-pressed="true"] .n{color:var(--gold)}
.sep{width:1px;align-self:stretch;background:var(--line);margin:2px 4px}
input.q{flex:1 1 180px;min-width:150px;min-height:34px;background:var(--panel);border:1px solid var(--line2);
        border-radius:8px;color:var(--cream);font-family:var(--body);font-size:14px;padding:6px 11px}
input.q::placeholder{color:var(--dim)}
input.q:focus,.chip:focus-visible,summary:focus-visible,.tick:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.count{color:var(--muted);font-size:13px;margin:10px 2px 14px;font-variant-numeric:tabular-nums}

/* one game */
.game{display:grid;grid-template-columns:116px 1fr;gap:16px;padding:18px 0 20px;border-top:1px solid var(--line)}
.game:first-of-type{border-top:0}
.shot{position:relative;border-radius:5px;overflow:hidden;background:#000;border:1px solid var(--line2);
      align-self:start}
.shot img{display:block;width:100%;height:auto}
.stripe{position:absolute;left:0;top:0;bottom:0;width:4px}
.hd{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 12px;margin-bottom:3px}
.nm{font-family:var(--disp);font-weight:600;font-size:21px;letter-spacing:-.01em;color:var(--cream)}
.grade{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:2px 8px;border-radius:3px;
       color:#0b0e0a}
.meta{font-family:var(--mono);font-size:11.5px;color:var(--dim);margin-bottom:9px;word-break:break-word}
.meta b{color:var(--muted);font-weight:400}
.now{color:var(--muted);margin:0 0 10px;max-width:68ch}
ul.wrong{list-style:none;margin:0 0 12px;padding:0;display:flex;flex-direction:column;gap:7px}
ul.wrong li{position:relative;padding-left:16px;max-width:70ch}
ul.wrong li::before{content:"";position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:var(--line2)}
.flags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.flag{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:3px;
      border:1px solid var(--line2);color:var(--muted)}
.flag.b{border-color:var(--poor);color:var(--poor)}
.flag.c{border-color:var(--plain);color:var(--plain)}
details{border-top:1px dashed var(--line);margin-top:4px}
summary{cursor:pointer;list-style:none;padding:9px 0 4px;color:var(--gold);font-size:13px;font-weight:700;
        letter-spacing:.03em;min-height:34px;display:flex;align-items:center;gap:7px}
summary::-webkit-details-marker{display:none}
summary::before{content:"+";font-family:var(--mono);font-weight:600}
details[open] summary::before{content:"\\2212"}
.detail{padding:2px 0 12px;display:flex;flex-direction:column;gap:14px}
.blk h4{margin:0 0 6px;font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:var(--dim);font-weight:700}
.blk p{margin:0 0 4px;color:var(--muted);max-width:70ch}
.blk p b{color:var(--cream);font-weight:600}
.tbl{width:100%;overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:13px;min-width:520px}
th{text-align:left;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);font-weight:700;
   padding:0 12px 6px 0;border-bottom:1px solid var(--line)}
td{padding:8px 12px 8px 0;border-bottom:1px solid var(--line);vertical-align:top;color:var(--muted)}
td.f{font-family:var(--mono);font-size:12px;color:var(--gold);white-space:nowrap}
ol.css{margin:0;padding-left:19px;display:flex;flex-direction:column;gap:6px;color:var(--muted)}
ol.css li{max-width:70ch}
.note{color:var(--muted);max-width:70ch}
.note b{color:var(--cream);font-weight:600}

/* done ticks */
.tick{display:inline-flex;align-items:center;gap:7px;margin-top:10px;background:transparent;border:1px solid var(--line2);
      color:var(--muted);border-radius:999px;padding:6px 13px;font-family:var(--body);font-size:12.5px;font-weight:700;
      cursor:pointer;min-height:34px;letter-spacing:.04em;text-transform:uppercase}
.tick:hover{border-color:var(--muted);color:var(--cream)}
.tick[aria-pressed="true"]{border-color:var(--sage);color:var(--sage);background:rgba(122,179,86,.09)}
.game.done .shot img{opacity:.32}
.game.done .nm{color:var(--muted);text-decoration:line-through;text-decoration-color:var(--line2)}
.syncline{font-size:12px;color:var(--dim);margin:0 2px 12px}
footer{margin-top:44px;border-top:1px solid var(--line);padding-top:16px;color:var(--dim);font-size:12.5px;max-width:70ch}
@media (max-width:560px){
  .game{grid-template-columns:72px 1fr;gap:12px}
  .nm{font-size:18px}
  .wrap{padding:20px 14px 60px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>

<div class="wrap">
<header class="top">
  <h1>Fleet Art Punch List</h1>
  <p class="sub">Every carded game in the arcade, opened at 375&times;667 and photographed three times &mdash;
  boot, in play, and a few seconds on. <b>${tot.games} games</b>, <b>558 screenshots</b>, all of them looked at.
  Graded on how it <i>looks</i>, never on how it plays.</p>
  <div class="bar" role="img" aria-label="How the fleet grades out">
    ${["poor", "plain", "decent", "strong"].map(g =>
      `<i style="width:${((tot.byG[g] || 0) / tot.games * 100).toFixed(2)}%;background:var(--${g})"></i>`).join("")}
  </div>
  <div class="barkey">
    ${[["poor", "looks unfinished"], ["plain", "flat colour and emoji"], ["decent", "deliberate but thin"], ["strong", "carries itself"]]
      .map(([g, d]) => `<span><i class="dot" style="background:var(--${g})"></i><b>${tot.byG[g] || 0}</b> ${g} &middot; ${d}</span>`).join("")}
  </div>
  <div class="tallies">
    <span><b>${tot.art}</b> art files to paint</span>
    <span><b>${tot.css}</b> CSS jobs</span>
    <span><b>${tot.chip}</b> music-chip collisions</span>
    <span><b>${tot.emojiHeavy}</b> with 20+ emoji in the source</span>
    <span><b>${tot.broke}</b> visibly broken</span>
  </div>
</header>

<div class="filters">
  ${["poor", "plain", "decent", "strong"].map(g =>
    `<button class="chip" data-f="g" data-v="${g}" aria-pressed="false">${g}<span class="n">${tot.byG[g] || 0}</span></button>`).join("")}
  <span class="sep"></span>
  <button class="chip" data-f="k" data-v="satellite" aria-pressed="false">satellite<span class="n">${data.filter(d => d.k === "satellite").length}</span></button>
  <button class="chip" data-f="k" data-v="native" aria-pressed="false">native<span class="n">${data.filter(d => d.k === "native").length}</span></button>
  <span class="sep"></span>
  <button class="chip" data-f="x" data-v="chip" aria-pressed="false">chip collision<span class="n">${tot.chip}</span></button>
  <button class="chip" data-f="x" data-v="broke" aria-pressed="false">broken<span class="n">${tot.broke}</span></button>
  <button class="chip" data-f="x" data-v="emoji" aria-pressed="false">emoji heavy<span class="n">${tot.emojiHeavy}</span></button>
  <button class="chip" data-f="x" data-v="todo" aria-pressed="false">not done</button>
  <span class="sep"></span>
  <input class="q" type="search" placeholder="Search name, asset, note&hellip;" aria-label="Search">
</div>
<p class="syncline" id="sync">Ticks are saved on this device.</p>
<p class="count" id="count"></p>
<main id="list"></main>

<footer>
  Built by opening every screenshot, not by reading the code. Companion files in the repo:
  <b>FLEET-ART-AUDIT-SEP04.md</b> (the same list, plus the eight cross-cutting jobs and the art batches)
  and <b>FLEET-ART-FACTS-SEP04.md</b> (every structural measurement with the command that re-derives it).
</footer>
</div>

<script id="data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>
(function(){
  var D = JSON.parse(document.getElementById('data').textContent);
  var list = document.getElementById('list'), countEl = document.getElementById('count');
  var F = { g:new Set(), k:new Set(), x:new Set() }, Q = '';
  var done = {}, db = null;

  try { done = JSON.parse(localStorage.getItem('fleetart_done') || '{}') || {}; } catch(e) { done = {}; }

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  function matches(d){
    if (F.g.size && !F.g.has(d.g)) return false;
    if (F.k.size && !F.k.has(d.k)) return false;
    if (F.x.has('chip')  && !d.chip)  return false;
    if (F.x.has('broke') && !d.broke) return false;
    if (F.x.has('emoji') && d.emojiN < 20) return false;
    if (F.x.has('todo')  && done[d.s]) return false;
    if (Q) {
      var hay = (d.n+' '+d.s+' '+d.c+' '+d.now+' '+d.wrong.join(' ')+' '+d.bgWant+' '+
                 d.art.map(function(a){return a[0]+' '+a[1];}).join(' ')+' '+d.css.join(' ')).toLowerCase();
      if (hay.indexOf(Q) < 0) return false;
    }
    return true;
  }

  function card(d){
    var el = document.createElement('article');
    el.className = 'game' + (done[d.s] ? ' done' : '');
    el.id = 'g-' + d.s;
    var art = d.art.length ? '<div class="blk"><h4>Art to paint</h4><div class="tbl"><table>' +
      '<thead><tr><th>file</th><th>spec</th><th>replaces</th></tr></thead><tbody>' +
      d.art.map(function(a){ return '<tr><td class="f">'+esc(a[0])+'</td><td>'+esc(a[1])+'</td><td>'+esc(a[2])+'</td></tr>'; }).join('') +
      '</tbody></table></div></div>' : '';
    var css = d.css.length ? '<div class="blk"><h4>CSS to do</h4><ol class="css">' +
      d.css.map(function(c){ return '<li>'+esc(c)+'</li>'; }).join('') + '</ol></div>' : '';
    var notes = [];
    if (d.bgNow)  notes.push('<p><b>Background now:</b> '+esc(d.bgNow)+'</p>');
    if (d.bgWant) notes.push('<p><b>Wants:</b> '+esc(d.bgWant)+'</p>');
    if (d.emoji)  notes.push('<p><b>Emoji as art:</b> '+esc(d.emoji)+'</p>');
    if (d.read)   notes.push('<p><b>Readability:</b> '+esc(d.read)+'</p>');
    if (d.chip)   notes.push('<p><b>Music chip:</b> '+esc(d.chip)+'</p>');
    if (d.broke)  notes.push('<p><b>Looks broken</b> ('+esc(d.brokeChk)+(d.brokeSev?', '+esc(d.brokeSev):'')+')<b>:</b> '+esc(d.broke)+'</p>');
    if (d.refuted) notes.push('<p><b>A "looks broken" claim here was refuted on a second look:</b> '+esc(d.refuted.slice(0,400))+'</p>');

    el.innerHTML =
      '<div class="shot"><span class="stripe" style="background:var(--'+d.g+')"></span>' +
        (d.t ? '<img loading="lazy" decoding="async" alt="'+esc(d.n)+' in play" src="'+d.t+'">' : '') +
      '</div><div>' +
        '<div class="hd"><span class="nm">'+esc(d.n)+'</span>' +
          '<span class="grade" style="background:var(--'+d.g+')">'+d.g+'</span></div>' +
        '<div class="meta">'+esc(d.src||d.s)+' &middot; <b>'+d.k+(d.c?' &middot; '+esc(d.c):'')+
          (d.born?' &middot; born '+d.born:'')+' &middot; impact '+d.i+'/5 &middot; effort '+d.e+
          (d.gated?' &middot; workbench-gated':'')+'</b></div>' +
        '<p class="now">'+esc(d.now)+'</p>' +
        (d.wrong.length ? '<ul class="wrong">'+d.wrong.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul>' : '') +
        '<div class="flags">' +
          (d.art.length ? '<span class="flag">'+d.art.length+' art</span>' : '') +
          (d.css.length ? '<span class="flag">'+d.css.length+' css</span>' : '') +
          (d.chip ? '<span class="flag c">chip collision</span>' : '') +
          (d.broke ? '<span class="flag b">broken'+(d.brokeSev?' \u00b7 '+esc(d.brokeSev):'')+'</span>' : '') +
        '</div>' +
        ((art||css||notes.length) ? '<details><summary>What to do</summary><div class="detail">' +
          (notes.length ? '<div class="blk">'+notes.join('')+'</div>' : '') + art + css +
        '</div></details>' : '') +
        '<button class="tick" type="button" aria-pressed="'+(done[d.s]?'true':'false')+'">'+
          (done[d.s]?'&#10003; done':'mark done')+'</button>' +
      '</div>';

    el.querySelector('.tick').addEventListener('click', function(){ toggle(d.s, el, this); });
    return el;
  }

  function toggle(slug, el, btn){
    var v = !done[slug];
    if (v) done[slug] = 1; else delete done[slug];
    el.classList.toggle('done', v);
    btn.setAttribute('aria-pressed', v ? 'true' : 'false');
    btn.innerHTML = v ? '&#10003; done' : 'mark done';
    try { localStorage.setItem('fleetart_done', JSON.stringify(done)); } catch(e){}
    if (db) db.doc('progress/' + slug).set({ done: v, at: Date.now() }).catch(function(){});
  }

  function render(){
    var shown = D.filter(matches);
    list.textContent = '';
    var frag = document.createDocumentFragment();
    shown.forEach(function(d){ frag.appendChild(card(d)); });
    list.appendChild(frag);
    var n = Object.keys(done).length;
    countEl.textContent = shown.length + ' of ' + D.length + ' games shown \\u00b7 ' + n + ' marked done';
  }

  document.querySelectorAll('.chip').forEach(function(b){
    b.addEventListener('click', function(){
      var f = b.dataset.f, v = b.dataset.v, on = b.getAttribute('aria-pressed') === 'true';
      if (on) F[f].delete(v); else F[f].add(v);
      b.setAttribute('aria-pressed', on ? 'false' : 'true');
      render();
    });
  });
  document.querySelector('input.q').addEventListener('input', function(e){
    Q = e.target.value.trim().toLowerCase(); render();
  });

  render();

  /* Shared ticks when the viewer can reach the store; the page is fully usable without it. */
  if (window.claude && claude.use) {
    claude.use('db').then(function(d){
      if (!d) return;
      db = d;
      var first = true;
      d.collection('progress').onSnapshot(function(snap){
        var server = {};
        (snap.docs || []).forEach(function(doc){
          var body = doc.data && doc.data();
          if (body && body.done) server[doc.id] = 1;
        });
        if (first) {
          first = false;
          /* push anything ticked on this device before the store answered */
          Object.keys(done).forEach(function(slug){
            if (!server[slug]) d.doc('progress/' + slug).set({ done: true, at: Date.now() }).catch(function(){});
          });
          Object.keys(done).forEach(function(k){ server[k] = 1; });
        }
        done = server;
        try { localStorage.setItem('fleetart_done', JSON.stringify(done)); } catch(e){}
        document.getElementById('sync').textContent =
          'Ticks are shared. Everyone who opens this page sees the same progress.';
        render();
      }, function(){ /* store error: keep the local-only experience */ });
    }).catch(function(){});
  }
})();
</script>`;

writeFileSync(OUT, html);
console.log("wrote", OUT, (html.length / 1048576).toFixed(2) + "MB", "|", data.length, "games");
