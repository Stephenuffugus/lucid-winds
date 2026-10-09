// Dewball COPY CHECK: no dashes and no exclamation points in anything a player reads
// (the house rule: commas and semicolons only, a dash is a bug; the new game standards:
// no exclamation points). Run: node copy_check.js [--list]
//
// What it reads: the HTML text outside <script> and <style>, button and title text, the
// meta description, the manifest's description, and every JS string literal in the game
// that looks like words (a space between letters), including the K() display names,
// keepsake names, gate labels, size facts and toasts. It skips comments, CSS, selectors,
// URLs and identifiers. A hyphen between two letters counts as a dash ("crumb-sized").
// Exit 1 with every hit listed; --plant adds a planted bad string and MUST fail.
var fs = require('fs'), path = require('path');
var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
if (process.argv.indexOf('--plant') > 1) html = html.replace('<h2>How to Roll</h2>', '<h2>How to Roll - fast!</h2>');
var man = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.webmanifest'), 'utf8'));
var hits = [];
/* old names kept ONLY as save migration keys (keepNames in index.html): data, never shown */
var LEGACY = ['One-Eyed Bear'];
function lineOf(i){ return html.slice(0, i).split('\n').length; }
function bad(s){
  var why = [];
  if (/[—–]|\s-\s/.test(s)) why.push('dash');
  if (/[A-Za-z]-[A-Za-z]/.test(s)) why.push('hyphen');
  if (/!(?!=)/.test(s)) why.push('exclamation');
  return why;
}
// 1. markup text, outside script and style
var markup = html.replace(/<script[\s\S]*?<\/script>/g, function(m){ return m.replace(/[^\n]/g, ' '); })
                 .replace(/<style[\s\S]*?<\/style>/g, function(m){ return m.replace(/[^\n]/g, ' '); })
                 .replace(/<!--[\s\S]*?-->/g, function(m){ return m.replace(/[^\n]/g, ' '); });
var re = />([^<>]+)</g, m;
while ((m = re.exec(markup))) {
  var t = m[1].replace(/&[a-z]+;|&#\d+;/g, ' ').trim();
  if (!t || !/[A-Za-z]{2}/.test(t)) continue;
  var w = bad(t); if (w.length) hits.push({ where: 'html:' + lineOf(m.index), why: w.join(','), text: t });
}
var meta = /<meta name="description" content="([^"]*)"/.exec(html);
if (meta && bad(meta[1]).length) hits.push({ where: 'meta description', why: bad(meta[1]).join(','), text: meta[1] });
if (bad(man.description || '').length) hits.push({ where: 'manifest description', why: bad(man.description).join(','), text: man.description });
// 2. JS string literals in the game script, comments stripped first (keeping line numbers)
var s0 = html.indexOf('<script src="three.min.js"></script>');
var g0 = html.indexOf('<script>', s0), g1 = html.indexOf('</script>', g0);
var js = html.slice(g0, g1);
var off = g0;
var stripped = js.replace(/\/\*[\s\S]*?\*\//g, function(c){ return c.replace(/[^\n]/g, ' '); })
                 .replace(/(^|[^:"'\\])\/\/[^\n]*/g, function(c, p){ return p + c.slice(p.length).replace(/[^\n]/g, ' '); });
var sre = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g;
while ((m = sre.exec(stripped))) {
  var str = m[1] !== undefined ? m[1] : m[2];
  if (!/[A-Za-z]{2,} [A-Za-z]/.test(str) && !/^[A-Z][a-z]+(?: [A-Z][a-z']+)*$/.test(str)) continue;   // words, or a Title Name
  if (/^[#.@]|px|gradient\(|rgba?\(|\{|;\s*$|https?:|\.js|\.json|\.glb|\.png|\.jpg|\bvar\b|function/.test(str)) continue;
  if (LEGACY.indexOf(str) >= 0) continue;
  if (/^(?:bold |italic )?\d+px /.test(str)) continue;
  var w2 = bad(str);
  if (w2.length) hits.push({ where: 'js:' + lineOf(off + m.index), why: w2.join(','), text: str });
}
if (process.argv.indexOf('--list') > 1 || hits.length) hits.forEach(function(h){ console.log(h.where + '  [' + h.why + ']  ' + h.text); });
if (hits.length) { console.log('COPY_FAIL ' + hits.length); process.exit(1); }
console.log('COPY_PASS');
