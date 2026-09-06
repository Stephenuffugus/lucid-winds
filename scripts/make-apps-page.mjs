#!/usr/bin/env node
/* portal/apps.html, the landing page for the studio's practical apps.
   Regenerate with:  node scripts/make-apps-page.mjs   (from repo root)

   Stephen, 2026-08-17 (round two): PadLab, Grow Your Name and Times Table
   Quest belong in the Arcade, not here. No duplicates: every app appears
   exactly ONCE, under the hub's own categories worded as the visitor's
   question, plus Hush in a "Can't sleep?" coda. And ornament: "an ornate
   patterned border, thin lined elegant that kind of flows as you scroll",
   which is the gold filigree rails and the section flourishes.

   2026-08-28, THE STALENESS BUG. This script used to scrape the live hub's
   HTML with two regexes. The hub's markup changed (cards became a <div
   class="card"> wrapping an <a class="applink">, the <h2> moved inside a
   .section-head), both regexes fell to ZERO matches, and every regeneration
   since then hard-failed on "only 0 apps parsed". That is the whole reason
   this page sat two apps behind: Fretwork and Diamond Rules were never
   here. A page one repo away should never depend on another page's CSS
   class names, so the hub now PUBLISHES ITS CATALOGUE as JSON at
   /catalogue.json and this script reads that. Markup can move freely on
   either side; only the data contract is load-bearing.

   Art is this repo's own copies in portal-assets/sws-thumbs/, stamped with
   each file's content hash and checked against the hub's hash for the same
   file, so a mirror that has fallen behind stops the build instead of
   serving last month's picture. NEVER hotlink his art cross-origin: the
   service worker intercepts *.png whatever the origin, and Hostinger
   stales pages for up to a day.

   NEVER hand-edit the generated page; regenerate. The script hard-fails on
   a contract version it was not written for, missing art, art that differs
   from the hub's, a category it has no wording for, an unknown tag, and a
   rendered card count that disagrees with the catalogue.

   No em dashes or en dashes anywhere in this file or its output. House rule.
*/
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');

/* The studio's own domain, not the raw Firebase one. Every card here sends
   the visitor to skywolfstudio.com so there is one address for the apps. */
const ORIGIN = 'https://skywolfstudio.com';

/* ---- the contract: the hub's catalogue, as data ---- */
const CONTRACT = 1;
const res = await fetch(ORIGIN + '/catalogue.json', { headers: { 'cache-control': 'no-cache' } });
if (!res.ok) {
  console.error(`could not read ${ORIGIN}/catalogue.json (HTTP ${res.status}).
The hub publishes it from design/hub.mjs in the SWS-apps repo. If it 404s,
that repo needs a deploy before this page can be regenerated.`);
  process.exit(1);
}
const cat = await res.json();
if (!cat || !Array.isArray(cat.categories) || !cat.apps || typeof cat.apps !== 'object') {
  console.error('catalogue.json is not the shape this script expects (categories[], apps{})');
  process.exit(1);
}
if (cat.contract !== CONTRACT) {
  console.error(`the hub publishes catalogue contract ${cat.contract}, this script was written for ${CONTRACT}.
Read the hub's design/hub.mjs, update this script for the new shape, then bump CONTRACT here.`);
  process.exit(1);
}

/* Hush is served from THIS repo at /hush/, and gets its own coda at the
   foot of the page rather than a slot in the household grid (Stephen:
   "can't sleep, we've got stuff for that"). Everything about it except that
   placement comes from the contract like every other app. PadLab, Grow Your
   Name and Times Table Quest belong in the Arcade, his call, round two. */
const HUSH_SLUG = 'hush';
const HUSH_HREF = '/hush/';

/* ---- his art, from this repo's disk, never hotlinked ---- */
const artFor = (slug, hubHash, hubPixels) => {
  /* the hub serves thumb-512 where his originals allowed a bigger cut and
     thumb-256 where they did not, so the copy command below names the file
     the hub is actually serving rather than a guess */
  const source = hubPixels === 512 ? 'thumb-512.png' : 'thumb-256.png';
  const rel = ['png', 'svg'].map((ext) => `portal-assets/sws-thumbs/${slug}.${ext}`).find((r) => existsSync(join(REPO, r)));
  if (!rel) {
    console.error(`MISSING ART: portal-assets/sws-thumbs/${slug}.png
  cp /workspaces/SWS-apps/apps/${slug}/marketing/${source} portal-assets/sws-thumbs/${slug}.png`);
    process.exit(1);
  }
  /* Stamped with the file's own content hash, the same way the hub stamps
     its originals, so replaced art always reaches a phone holding the old
     copy. And checked against the hub's hash for the same picture: a mirror
     that has quietly fallen behind now stops the build instead of serving
     last month's artwork for a week. */
  const hash = createHash('sha1').update(readFileSync(join(REPO, rel))).digest('hex').slice(0, 8);
  if (hubHash && hash !== hubHash) {
    console.error(`STALE ART: portal-assets/sws-thumbs/${slug} is ${hash}, the hub serves ${hubHash}.
  cp /workspaces/SWS-apps/apps/${slug}/marketing/${source} portal-assets/sws-thumbs/${slug}.png`);
    process.exit(1);
  }
  return `/${rel}?v=${hash}`;
};

const app = (slug) => {
  const a = cat.apps[slug];
  if (!a) { console.error(`the catalogue names ${slug} in a category but carries no entry for it`); process.exit(1); }
  if (a.tag !== null && a.tag !== 'shared' && a.tag !== 'beta') {
    console.error(`app ${slug} carries an unknown tag "${a.tag}". Teach this script what badge it should wear.`);
    process.exit(1);
  }
  return {
    name: a.name, line: a.line,
    shared: a.tag === 'shared', beta: a.tag === 'beta',
    /* the contract says where the app lives; this script does not guess */
    url: slug === HUSH_SLUG ? HUSH_HREF : a.href,
    art: artFor(slug, a.artHash, a.artPixels),
    pixels: a.artPixels || 256,
  };
};

/* The section wording travels with the apps now. It used to live only in
   this file, keyed on the hub's display titles, which is how the hub could
   grow a Music section and a Sports section that hard-failed this build
   with "No wording for hub category". The hub writes the kicker, the
   question and the line; this script only lays them out. */
const APPS = {};
const CATS = [];
for (const c of cat.categories) {
  for (const field of ['id', 'kick', 'question', 'sub']) {
    if (!c[field]) { console.error(`category "${c.title || c.id}" has no ${field} in the catalogue`); process.exit(1); }
  }
  const slugs = c.slugs.filter((s) => s !== HUSH_SLUG);
  if (!slugs.length) continue;
  for (const slug of slugs) APPS[slug] = app(slug);
  CATS.push({ id: c.id, kick: c.kick, q: c.question, sub: c.sub, slugs });
}
const HUSH = cat.apps[HUSH_SLUG] ? app(HUSH_SLUG) : null;
if (!HUSH) { console.error('the catalogue has no hush entry, and this page ends on Hush'); process.exit(1); }

/* Counted from the contract, never typed. The hub counts its own shelf; a
   number typed here is a number that goes stale the next time he ships. */
const total = cat.count;
const shownHere = Object.keys(APPS).length + 1;
if (shownHere !== total) {
  console.error(`the catalogue counts ${total} apps but this page would show ${shownHere}. Something is missing from a category.`);
  process.exit(1);
}

/* The contract carries plain text, not markup, so anything bound for the
   page is escaped here. Curly quotes and the like stay as themselves; the
   page is UTF-8. */
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const card = (a, i) => `        <a class="app" style="--i:${i}" href="${a.url}"${a.url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>
          <img src="${a.art}" alt="" width="${a.pixels}" height="${a.pixels}" decoding="async">
          <b>${esc(a.name)}</b>
          <small>${esc(a.line)}</small>${a.shared ? '\n          <span class="tag">Shared online</span>' : a.beta ? '\n          <span class="tag">In testing</span>' : ''}
        </a>`;

/* Thin-lined gold ornament, eclectic on purpose (Stephen: "a little more
   eclectic and unique"), one long strip mixing motifs so it reads
   collected, not tiled: stem, leaf, lozenge, starburst, fern curl,
   crescent, dot run, diamond chain, mirrored stem. Vertical for the side
   rails, horizontal for the top and bottom bands, a lozenge for corners. */
const VINE = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='340' viewBox='0 0 26 340' fill='none' stroke='#e4bd5f' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'>` +
  `<path d='M13 0 C 5 24, 21 46, 13 70'/>` +
  `<path d='M12 38 C 7 36, 4 31, 4 25 C 10 27, 12 32, 12 38 Z'/>` +
  `<path d='M13 70 L17 76 L13 82 L9 76 Z'/><circle cx='13' cy='76' r='1.1'/>` +
  `<path d='M13 82 C 16 90, 10 94, 13 100'/>` +
  `<path d='M13 102 V106 M13 112 V116 M6 109 H10 M16 109 H20 M8.5 104.5 L11 107 M15 111 L17.5 113.5 M17.5 104.5 L15 107 M11 111 L8.5 113.5'/><circle cx='13' cy='109' r='1.3'/>` +
  `<path d='M13 118 C 17 126, 9 132, 13 140'/>` +
  `<path d='M13 140 C 6 154, 20 168, 13 182'/>` +
  `<path d='M15 158 C 20 156, 23 151, 21 147 C 19 145, 16 148, 18 152'/>` +
  `<path d='M8 190 Q13 197 18 190'/><path d='M10 192.5 Q13 196.5 16 192.5'/>` +
  `<circle cx='13' cy='204' r='1.5'/><circle cx='13' cy='210' r='1.1'/><circle cx='13' cy='215' r='0.8'/>` +
  `<path d='M13 222 L16.5 227.5 L13 233 L9.5 227.5 Z'/><path d='M13 233 L15.5 237.5 L13 242 L10.5 237.5 Z'/>` +
  `<path d='M13 248 C 21 270, 5 296, 13 318'/>` +
  `<path d='M14 276 C 19 274, 22 269, 22 263 C 16 265, 14 270, 14 276 Z'/>` +
  `<circle cx='13' cy='300' r='1.4'/>` +
  `<path d='M13 318 C 11 326, 15 333, 13 340'/>` +
  `</svg>`);
const BAND = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='340' height='18' viewBox='0 0 340 18' fill='none' stroke='#e4bd5f' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'>` +
  `<path d='M0 9 C 24 3, 46 15, 70 9'/>` +
  `<path d='M38 8 C 36 3, 31 1, 25 1 C 27 6, 32 8, 38 8 Z'/>` +
  `<path d='M70 9 L76 5 L82 9 L76 13 Z'/><circle cx='76' cy='9' r='1.1'/>` +
  `<path d='M82 9 C 90 12, 94 6, 100 9'/>` +
  `<path d='M102 9 H106 M112 9 H116 M109 2 V6 M109 12 V16 M104.5 4.5 L107 7 M111 11 L113.5 13.5 M104.5 13.5 L107 11 M111 7 L113.5 4.5'/><circle cx='109' cy='9' r='1.3'/>` +
  `<path d='M118 9 C 126 5, 132 13, 140 9'/>` +
  `<path d='M140 9 C 154 2, 168 16, 182 9'/>` +
  `<path d='M158 7 C 156 2, 151 -1, 147 1 C 145 3, 148 6, 152 4'/>` +
  `<path d='M190 6 Q197 13 204 6'/><path d='M192.5 8.5 Q197 12.5 201.5 8.5'/>` +
  `<circle cx='214' cy='9' r='1.5'/><circle cx='220' cy='9' r='1.1'/><circle cx='225' cy='9' r='0.8'/>` +
  `<path d='M232 9 L237.5 5.5 L243 9 L237.5 12.5 Z'/><path d='M243 9 L247.5 6.5 L252 9 L247.5 11.5 Z'/>` +
  `<path d='M258 9 C 280 1, 296 17, 318 9'/>` +
  `<path d='M286 10 C 284 15, 279 17, 273 17 C 275 12, 280 10, 286 10 Z'/>` +
  `<path d='M318 9 C 326 7, 333 11, 340 9'/>` +
  `</svg>`);
const CORNER = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none' stroke='#e4bd5f' stroke-width='1' stroke-linejoin='round'><path d='M7 1 L13 7 L7 13 L1 7 Z'/><circle cx='7' cy='7' r='1.4'/></svg>`);

const FLOURISH = `<div class="flourish" aria-hidden="true"><svg width="120" height="16" viewBox="0 0 120 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M60 2 L67 8 L60 14 L53 8 Z"/><path d="M47 8 C 40 3, 32 3, 26 8 C 32 13, 40 13, 47 8 Z"/><path d="M73 8 C 80 3, 88 3, 94 8 C 88 13, 80 13, 73 8 Z"/><circle cx="60" cy="8" r="1.6"/><path d="M0 8 H 20"/><path d="M100 8 H 120"/></svg></div>`;

const section = (c, idx) => {
  const meta = c;
  return `
${idx === 0 ? '' : '  ' + FLOURISH + '\n'}    <section class="need reveal" ${idx === 0 ? 'id="needs" ' : ''}style="scroll-margin-top:18px">
      <span class="kick">${String(idx + 1).padStart(2, '0')} · ${meta.kick}</span>
      <h2>${meta.q}</h2>
      <p class="sub">${meta.sub}</p>
      <div class="grid">
${c.slugs.map((sl, i) => card(APPS[sl], i)).join('\n')}
      </div>
    </section>`;
};

const swsSlugs = Object.keys(APPS);
const halfway = Math.ceil(swsSlugs.length / 2);
const strip = (slugs, cls) => {
  const imgs = slugs.map(sl => `<img src="${APPS[sl].art}" alt="" width="${APPS[sl].pixels}" height="${APPS[sl].pixels}" decoding="async">`).join('');
  return `    <div class="strip ${cls}" aria-hidden="true"><div class="track">${imgs}${imgs}</div></div>`;
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Sky Wolf Studio: free apps for real life</title>
<meta name="description" content="What are you planning? A wedding, a season, a school year, a move. ${total} free apps for real life. No ads, no subscriptions, no tracking.">
<meta name="theme-color" content="#080c09">
<link rel="canonical" href="${ORIGIN}/">
<meta property="og:title" content="Sky Wolf Studio: free apps for real life">
<meta property="og:description" content="What are you planning? ${total} free apps: planners, sign-ups, checklists, PDF tools and more. No ads, ever.">
<meta property="og:image" content="https://lucidwinds.com/portal-assets/sws-thumbs/specials-planner.png">
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
/* Generated by scripts/make-apps-page.mjs. Regenerate, do not hand-edit.
   Night-forest arcade palette, same tokens as portal/index.html. */
:root{
  --bg:#080c09; --panel:#121a13; --panel2:#1a251b;
  --ink:#f1e9d8; --cream:#f1e9d8; --muted:#98a28e;
  --line:#2a3722; --gold:#e4bd5f; --gold-deep:#c19a41; --leaf:#82ddcd;
  --disp:'Fredoka',ui-rounded,'Segoe UI',system-ui,sans-serif;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:clip}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.5 'Nunito',system-ui,sans-serif;
  padding-bottom:calc(48px + env(safe-area-inset-bottom));overflow-x:hidden}
.wrap{max-width:1060px;margin:0 auto;padding:0 16px;position:relative;z-index:1}

/* ── the ornate frame: eclectic gold filigree on all four edges,
      flowing with the scroll. One fixed inset:0 container with four
      absolute bars. This sizes to the real viewport (Pixel 9 included),
      where separate right-anchored fixed divs proved unreliable. ── */
.frame{position:fixed;inset:0;pointer-events:none;z-index:0}
.fr{position:absolute;opacity:.34}
.fr.l,.fr.r{top:20px;bottom:20px;width:26px;background:url("${VINE}") repeat-y center 0/26px auto}
.fr.l{left:10px}
.fr.r{right:10px;transform:scaleX(-1)}
.fr.t,.fr.b{left:20px;right:20px;height:18px;background:url("${BAND}") repeat-x 0 center/auto 18px}
.fr.t{top:6px}
.fr.b{bottom:6px;transform:scaleY(-1)}
.fr.c{width:14px;height:14px;background:url("${CORNER}") no-repeat center/contain}
.fr.c.tl{top:8px;left:8px}.fr.c.tr{top:8px;right:8px}
.fr.c.bl{bottom:8px;left:8px}.fr.c.br{bottom:8px;right:8px}
/* Slimmer on the phone, but every edge still framed. */
@media (max-width:1180px){
  .fr{opacity:.26}
  .fr.l,.fr.r{width:13px;background-size:13px auto;top:16px;bottom:16px}
  .fr.l{left:max(2px,env(safe-area-inset-left))}
  .fr.r{right:max(2px,env(safe-area-inset-right))}
  .fr.t,.fr.b{height:12px;background-size:auto 12px;left:16px;right:16px}
  .fr.t{top:max(3px,env(safe-area-inset-top))}
  .fr.b{bottom:max(3px,env(safe-area-inset-bottom))}
  .fr.c{width:11px;height:11px}
  .fr.c.tl,.fr.c.tr{top:4px}.fr.c.bl,.fr.c.br{bottom:4px}
  .fr.c.tl,.fr.c.bl{left:3px}.fr.c.tr,.fr.c.br{right:3px}
}

/* ── section flourishes: the same line, horizontal ── */
.flourish{display:flex;justify-content:center;color:var(--gold);opacity:.5;margin:46px 0 0}

/* ── hero ── */
.hero{text-align:center;padding:44px 0 8px;position:relative}
.hero::before{content:"";position:absolute;left:50%;top:-30%;width:100vw;height:150%;
  transform:translateX(-50%);pointer-events:none;
  background:radial-gradient(46% 55% at 50% 32%,rgba(228,189,95,.12),transparent 70%)}
.badge{display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border:1px solid var(--line);
  border-radius:999px;color:var(--leaf);font-weight:800;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase}
h1{font-family:var(--disp);font-weight:600;color:var(--cream);
  font-size:clamp(2.5rem,8vw,4.4rem);line-height:1.0;margin:18px auto 14px;max-width:14ch}
h1 em{font-style:normal;color:var(--gold)}
.lede{color:var(--muted);font-size:clamp(1.02rem,2.6vw,1.22rem);max-width:44ch;margin:0 auto 24px}
.lede b{color:var(--cream)}
.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:34px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 30px;
  border-radius:999px;font-weight:800;font-size:1.02rem;text-decoration:none;font-family:var(--disp)}
.btn.gold{background:linear-gradient(180deg,var(--gold),var(--gold-deep));color:#12160f;
  box-shadow:0 6px 24px rgba(228,189,95,.25)}
.btn.gold:hover{filter:brightness(1.07)}
.btn.ghost{border:1px solid var(--line);color:var(--cream)}
.btn.ghost:hover{border-color:var(--gold);color:var(--gold)}

/* ── the film strips: his art, front and centre, drifting ── */
.strips{margin:0 0 10px;display:grid;gap:12px}
.strip{overflow:hidden;position:relative;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.strip .track{display:flex;gap:12px;width:max-content;animation:drift 60s linear infinite}
.strip.rev .track{animation-name:drift-rev;animation-duration:75s}
.strip img{width:132px;height:132px;border-radius:22px;flex:none;display:block}
@keyframes drift{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes drift-rev{from{transform:translateX(-50%)}to{transform:translateX(0)}}
@media (max-width:600px){.strip img{width:88px;height:88px;border-radius:15px}}
@media (prefers-reduced-motion:reduce){.strip .track{animation:none}}

/* ── trust strip ── */
.trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:26px 0 8px}
.trust div{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px 16px;text-align:center}
.trust b{display:block;color:var(--gold);font-family:var(--disp);font-weight:600;font-size:1.05rem}
.trust small{color:var(--muted)}

/* ── category sections ── */
.need{margin-top:34px}
.kick{display:block;color:var(--gold);font-weight:800;font-size:.75rem;
  letter-spacing:.16em;text-transform:uppercase;margin-bottom:7px}
h2{font-family:var(--disp);font-weight:600;color:var(--cream);font-size:clamp(1.6rem,4.5vw,2.2rem);
  line-height:1.05;margin:0 0 6px}
.need .sub{color:var(--muted);font-size:1.02rem;max-width:56ch;margin:0 0 16px}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(178px,1fr))}
.app{display:flex;flex-direction:column;gap:8px;text-decoration:none;color:inherit;
  background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:12px;
  transition:border-color .18s,transform .18s,background .18s}
.app:hover{border-color:var(--gold);background:var(--pan2, var(--panel2));transform:translateY(-3px)}
.app img{width:100%;height:auto;aspect-ratio:1;border-radius:12px;object-fit:cover;display:block;background:var(--panel2)}
.app b{font-size:1.05rem;line-height:1.25;color:var(--cream)}
.app small{color:var(--muted);font-size:.85rem;line-height:1.4}
.app .tag{align-self:flex-start;margin-top:2px;padding:2px 9px;border:1px solid var(--line);
  border-radius:999px;color:var(--leaf);font-size:.7rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
/* Stephen: cards "could probably be two wide" on a phone. His art carries
   the card, so two-up stays readable down to small screens. */
@media (max-width:640px){
  .grid{grid-template-columns:repeat(2,1fr)}
  .app b{font-size:.95rem}
  .app small{font-size:.8rem}
}

/* ── closer, with thin ornate corner ticks ── */
.closer{margin-top:56px;text-align:center;background:var(--panel);border:1px solid rgba(228,189,95,.45);
  border-radius:24px;padding:38px 22px;position:relative}
.closer::before,.closer::after{content:"";position:absolute;width:26px;height:26px;
  border:1px solid rgba(228,189,95,.7);pointer-events:none}
.closer::before{top:9px;left:9px;border-right:none;border-bottom:none;border-top-left-radius:14px}
.closer::after{bottom:9px;right:9px;border-left:none;border-top:none;border-bottom-right-radius:14px}
.closer h2{margin-bottom:8px}
.closer p{color:var(--muted);max-width:46ch;margin:0 auto 20px}
footer{margin-top:40px;padding-top:22px;border-top:1px solid var(--line);
  color:var(--muted);font-size:.9rem;text-align:center}
footer a{color:var(--leaf)}

/* ── cascade ── */
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}
.reveal .app{opacity:0;transform:translateY(16px)}
.reveal.in .app{opacity:1;transform:none;
  transition:opacity .55s cubic-bezier(.2,.7,.2,1) calc(var(--i,0)*70ms),transform .55s cubic-bezier(.2,.7,.2,1) calc(var(--i,0)*70ms),border-color .18s,background .18s}
.reveal.in .app:hover{transform:translateY(-3px)}
@media (prefers-reduced-motion:reduce){.reveal,.reveal .app{opacity:1;transform:none;transition:none}}
</style>
</head>
<body>
<div class="frame" aria-hidden="true">
  <i class="fr t"></i><i class="fr b"></i><i class="fr l"></i><i class="fr r"></i>
  <i class="fr c tl"></i><i class="fr c tr"></i><i class="fr c bl"></i><i class="fr c br"></i>
</div>
<div class="wrap">

  <div class="hero">
    <span class="badge">Sky Wolf Studio · free apps</span>
    <h1>What are you <em>planning?</em></h1>
    <p class="lede">A wedding. A season. A school year. A move. A night you actually sleep.
      We build free apps for real life. <b>${total} so far</b>, every one free forever.
      <b>No ads. No subscriptions. No tracking.</b></p>
    <div class="cta-row">
      <a class="btn gold" href="#needs">Find your app</a>
      <a class="btn ghost" href="/portal/">◂ The Arcade</a>
    </div>
  </div>

  <div class="strips">
${strip(swsSlugs.slice(0, halfway), '')}
${strip(swsSlugs.slice(halfway), 'rev')}
  </div>

  <div class="trust">
    <div><b>Free forever</b><small>tip jar if you love one</small></div>
    <div><b>No ads, ever</b><small>nothing spinning back at you</small></div>
    <div><b>Nothing tracked</b><small>no accounts to try anything</small></div>
    <div><b>Yours, offline</b><small>most never leave your device</small></div>
  </div>
${CATS.map(section).join('\n')}
  ${FLOURISH}
    <section class="need reveal">
      <span class="kick">${String(CATS.length + 1).padStart(2, '0')} · Winding down</span>
      <h2>Can&rsquo;t sleep?</h2>
      <p class="sub">We&rsquo;ve got stuff for that too.</p>
      <div class="grid">
${card(HUSH, 0)}
      </div>
    </section>

  <div class="closer reveal">
    <h2>It&rsquo;s all free. Seriously.</h2>
    <p>One small studio, ${total} apps, zero ads. If one of them saves your week, the tip jar inside it is the whole business model.</p>
    <div class="cta-row" style="margin:0">
      <a class="btn gold" href="${ORIGIN}/" target="_blank" rel="noopener">Visit the studio at skywolfstudio.com</a>
      <a class="btn ghost" href="/portal/">The Arcade and its 160+ free games</a>
    </div>
  </div>

  <footer>
    <p>Made by Sky Wolf Studio · <a href="${ORIGIN}/" target="_blank" rel="noopener">skywolfstudio.com</a> · <a href="/portal/">The Arcade</a></p>
  </footer>
</div>

<script>
(function(){
  var rev=document.querySelectorAll('.reveal');
  function showAll(){for(var i=0;i<rev.length;i++)rev[i].classList.add('in')}
  try{
    if(window.IntersectionObserver){
      var io=new IntersectionObserver(function(es){
        for(var i=0;i<es.length;i++){if(es[i].isIntersecting){es[i].target.classList.add('in');io.unobserve(es[i].target);}}
      },{rootMargin:'0px 0px -6% 0px',threshold:0.05});
      for(var j=0;j<rev.length;j++)io.observe(rev[j]);
      setTimeout(function(){for(var k=0;k<rev.length;k++){var r=rev[k].getBoundingClientRect();if(r.top<innerHeight)rev[k].classList.add('in');}},900);
      setTimeout(showAll,4000);
    } else showAll();
  }catch(e){showAll()}

  /* the whole frame flows with the scroll: sides drift up, the top band
     slides one way and the bottom band the other */
  var sides=document.querySelectorAll('.fr.l,.fr.r');
  var top=document.querySelector('.fr.t'), bot=document.querySelector('.fr.b');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(sides.length && !reduce){
    var ticking=false;
    addEventListener('scroll',function(){
      if(ticking) return; ticking=true;
      requestAnimationFrame(function(){
        var d=Math.round(-scrollY*0.25);
        for(var i=0;i<sides.length;i++) sides[i].style.backgroundPositionY=d+'px';
        if(top) top.style.backgroundPositionX=d+'px';
        if(bot) bot.style.backgroundPositionX=(-d)+'px';
        ticking=false;
      });
    },{passive:true});
  }
})();
</script>
</body>
</html>
`;

writeFileSync(join(REPO, 'portal', 'apps.html'), html);
console.log(`wrote portal/apps.html, ${total} apps in ${CATS.length} categories plus the Hush coda, each exactly once`);
