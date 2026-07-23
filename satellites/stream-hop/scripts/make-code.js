#!/usr/bin/env node
/* Mint a Jimothy redeem code.
 *
 *   node scripts/make-code.js SHINOTHY
 *   node scripts/make-code.js "TRASH PANDA"
 *
 * Prints the line to paste into the CODES table in index.html. The plaintext code
 * NEVER goes in the game — only these two hashes and the length — so nobody can read
 * the source (or the deployed file, which is public) and help themselves to the lot.
 *
 * ⛔ Keep this hash IDENTICAL to codeHash() in index.html. If you change one, change
 * both, and every code already handed out stops working.
 */
function norm(s){ return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,''); }
var SALT='jimothy-hops-';                      // must match CODE_SALT in index.html
function hash(code){
  var s=SALT+norm(code), a=2166136261, b=5381, i, c;
  for(i=0;i<s.length;i++){ c=s.charCodeAt(i);
    a^=c; a=(a*16777619)>>>0;                  // FNV-1a
    b=(((b*33)>>>0)^c)>>>0; }                  // djb2-xor, independent shape
  return {a:a>>>0, b:b>>>0, n:norm(code).length};
}
var arg=process.argv.slice(2).join(' ');
if(!arg){ console.log('usage: node scripts/make-code.js YOURCODE'); process.exit(1); }
var h=hash(arg), n=norm(arg);
console.log('code:      '+n+'   (typed as "'+arg+'", case and spacing do not matter)');
console.log('link:      https://lucidwinds.com/jimothy/?code='+n);
console.log('paste into the CODES table in index.html:');
console.log('  { a:'+h.a+', b:'+h.b+', n:'+h.n+", gives:{caps:100}, name:'A gift' },");
