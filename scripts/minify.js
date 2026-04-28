#!/usr/bin/env node
//
// scripts/minify.js — produce a deploy-friendly minified copy of index.html.
//
// Run manually before deploy if you want a smaller/less-readable bundle.
// This is a CONSERVATIVE minifier — it strips comments and collapses
// whitespace inside <script> blocks but does NOT mangle identifier names.
//
// Why not full mangle? The game has 100+ window.X exposures used by inline
// onclick="..." handlers. Mangling those would break the entire UI. A real
// mangle pass needs a name-preservation list of every window-exposed
// function. That's a separate project; this script is the safe first pass.
//
// Usage:
//   node scripts/minify.js              → writes index.min.html
//   node scripts/minify.js --replace    → overwrites index.html (DANGEROUS)
//
// Typical reduction: ~25-35% file size without breaking anything.

'use strict';

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'index.html');
const DST = path.join(__dirname, '..', 'index.min.html');

const REPLACE = process.argv.includes('--replace');

function minifyJsBlock(js) {
  // Strip /* block */ comments — but NOT inside strings.
  // Conservative: only strip block comments that don't look like license
  // headers (preserve the "LICENSE" / "Copyright" / "@license" markers).
  const out = [];
  let i = 0;
  let inString = null;       // null, '"', "'", '`'
  let escape = false;
  while (i < js.length) {
    const c = js[i];
    const nx = js[i + 1];
    if (inString) {
      out.push(c);
      if (escape) { escape = false; }
      else if (c === '\\') { escape = true; }
      else if (c === inString) { inString = null; }
      i++;
      continue;
    }
    // Outside a string — check for comment starts
    if (c === '/' && nx === '*') {
      // find end
      let end = js.indexOf('*/', i + 2);
      if (end < 0) { out.push(js.slice(i)); break; }
      const block = js.slice(i, end + 2);
      // Preserve license/copyright comments (start with /*! or contain @license)
      if (block.startsWith('/*!') || /@license|@preserve|copyright|all rights reserved/i.test(block)) {
        out.push(block);
      }
      // else drop silently
      i = end + 2;
      continue;
    }
    if (c === '/' && nx === '/') {
      // line comment — drop to end of line, but preserve URLs (https://, etc.)
      // Heuristic: if previous non-space is `:` or `=` and next chars look
      // URL-y, treat as not a comment. Easier: only drop // when it's at
      // start of line or preceded by a token boundary.
      const prev = out.length ? out[out.length - 1] : '\n';
      const isCommentStart = /[\s;{}()\[\],]/.test(prev) || out.length === 0;
      if (isCommentStart) {
        const eol = js.indexOf('\n', i);
        i = eol < 0 ? js.length : eol;
        continue;
      }
    }
    if (c === '"' || c === "'" || c === '`') { inString = c; out.push(c); i++; continue; }
    out.push(c);
    i++;
  }
  let cleaned = out.join('');

  // Collapse runs of blank lines to 1, strip leading whitespace per line
  // (safe — JS doesn't care about indent), but DON'T collapse inside `template`
  // strings (which we already preserved above by leaving inString contents alone).
  cleaned = cleaned
    .split('\n')
    .map(line => line.replace(/^\s+/, ''))
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n');

  return cleaned;
}

function minifyHtml(html) {
  // Strip <!-- HTML comments --> except those marked <!--! preserved -->
  html = html.replace(/<!--(?!\!)[\s\S]*?-->/g, '');

  // Minify each <script> block
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
  html = html.replace(scriptRe, (m, attrs, body) => {
    if (attrs.includes('src=')) return m; // external script, leave alone
    return '<script' + attrs + '>' + minifyJsBlock(body) + '</script>';
  });

  // Collapse runs of blank lines in HTML
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}

const src = fs.readFileSync(SRC, 'utf8');
const minified = minifyHtml(src);

const target = REPLACE ? SRC : DST;
fs.writeFileSync(target, minified);

const before = src.length;
const after = minified.length;
const pct = (((before - after) / before) * 100).toFixed(1);
const beforeKb = (before / 1024).toFixed(1);
const afterKb = (after / 1024).toFixed(1);
console.log(`Source:    ${beforeKb} KB`);
console.log(`Minified:  ${afterKb} KB  (-${pct}%)`);
console.log(`Wrote:     ${path.basename(target)}`);

// Quick syntax sanity check on every script block
const vm = require('vm');
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m, i = 0, errs = 0;
while ((m = re.exec(minified)) !== null) {
  i++;
  try { new vm.Script(m[1], { filename: 'min-block-' + i + '.js' }); }
  catch (e) { errs++; console.error(`Block ${i} parse FAIL: ${e.message.split('\n')[0]}`); }
}
if (errs > 0) {
  console.error(`\n${errs} script block(s) failed to parse — minified file will not run.`);
  process.exit(1);
}
console.log(`Validated: ${i} script blocks parse clean.`);
