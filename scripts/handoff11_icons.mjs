#!/usr/bin/env node
/* PWA icons for the five HANDOFF-11 games, rendered from per-game motifs.

   One script, fifteen files: icon-192, icon-512, icon-maskable-512 for each of
   deepwell / blackout / parallel / wireworm / siege. Run from the repo root:
     node scripts/handoff11_icons.mjs            (all five)
     node scripts/handoff11_icons.mjs deepwell   (just one)

   Maskable note (learned on bandits-box): Android crops maskable icons to an
   arbitrary shape and only the central 80% is guaranteed visible, so that
   variant draws the same mark smaller inside a full-bleed field. And radius is
   in viewBox units: anything over 50 collapses the tile to a circle, whose
   transparent corners composite to black on an iOS home screen. */
import puppeteer from "puppeteer";
import { writeFileSync, existsSync, mkdirSync } from "fs";

const BG = "#0a0b0f";               // shared dark base, CRAFT section E
const INK = "#14161d";              // one step up from the base for depth

/* Each motif draws on a 100x100 viewBox and must read at 192px. Accent colors
   are the per-game accents from HANDOFF-11. */
const GAMES = {
  deepwell: {
    accent: "#f0a742",
    /* A shaft in perspective, narrowing as it goes down, with strata reading
       across the full tile and the lamp glowing at the bottom of the dig.
       The first pass drew a straight walled rectangle with a tab on top and
       read as a phone, so: taper for depth, rungs for scale, brighter bands. */
    art: `
      <rect x="0" y="0" width="100" height="100" fill="${INK}"/>
      <rect x="0" y="16" width="100" height="18" fill="#f0a742" opacity="0.16"/>
      <rect x="0" y="38" width="100" height="18" fill="#f0a742" opacity="0.11"/>
      <rect x="0" y="60" width="100" height="18" fill="#f0a742" opacity="0.07"/>
      <rect x="0" y="82" width="100" height="18" fill="#f0a742" opacity="0.04"/>
      <path d="M28 6 L72 6 L61 96 L39 96 Z" fill="${BG}"/>
      <path d="M28 6 L72 6 L61 96 L39 96 Z" fill="none" stroke="#f0a742" stroke-width="3"/>
      <g stroke="#f0a742" stroke-width="2" opacity="0.5">
        <line x1="33" y1="28" x2="67" y2="28"/>
        <line x1="35" y1="48" x2="65" y2="48"/>
        <line x1="37" y1="68" x2="63" y2="68"/>
      </g>
      <circle cx="50" cy="80" r="10.5" fill="#f0a742" opacity="0.22"/>
      <circle cx="50" cy="80" r="6.5" fill="#f0a742"/>`
  },
  blackout: {
    accent: "#5ad1e6",
    // a keyhole with a single beam of cold light
    art: `
      <rect x="0" y="0" width="100" height="100" fill="${INK}"/>
      <path d="M50 12 L26 92 L74 92 Z" fill="#5ad1e6" opacity="0.10"/>
      <circle cx="50" cy="42" r="19" fill="#5ad1e6"/>
      <path d="M42 56 L58 56 L64 84 L36 84 Z" fill="#5ad1e6"/>
      <circle cx="50" cy="42" r="8.5" fill="${BG}"/>
      <path d="M46.5 54 L53.5 54 L56 74 L44 74 Z" fill="${BG}"/>`
  },
  parallel: {
    accent: "#8b7cf6",
    // twin avatars, circle and diamond, mirrored across the seam
    art: `
      <rect x="0" y="0" width="100" height="100" fill="${INK}"/>
      <rect x="49" y="10" width="2" height="80" fill="#8b7cf6" opacity="0.30"/>
      <rect x="10" y="70" width="30" height="6" rx="2" fill="#8b7cf6" opacity="0.35"/>
      <rect x="60" y="70" width="30" height="6" rx="2" fill="#e8dcc8" opacity="0.30"/>
      <circle cx="25" cy="53" r="14" fill="#8b7cf6"/>
      <rect x="61" y="39" width="28" height="28" rx="4" fill="#e8dcc8" transform="rotate(45 75 53)"/>`
  },
  wireworm: {
    accent: "#a3e635",
    // a closed circuit: energized loop with terminal nodes at the corners
    art: `
      <rect x="0" y="0" width="100" height="100" fill="${INK}"/>
      <rect x="22" y="22" width="56" height="56" rx="10" fill="none"
            stroke="#a3e635" stroke-width="7" opacity="0.22"/>
      <rect x="22" y="22" width="56" height="56" rx="10" fill="none"
            stroke="#a3e635" stroke-width="4.5" stroke-dasharray="9 5"/>
      <circle cx="22" cy="22" r="8" fill="#a3e635"/>
      <circle cx="78" cy="78" r="8" fill="#a3e635"/>
      <circle cx="78" cy="22" r="5" fill="#a3e635" opacity="0.45"/>
      <circle cx="22" cy="78" r="5" fill="#a3e635" opacity="0.45"/>`
  },
  siege: {
    accent: "#e8703a",
    /* One defender holding the lane in front of the gate they are protecting.
       The first pass put two grey triangles on the right that read as distant
       mountains, and the spear merged into the body. So: a real barred gate on
       the left, the spear angled clear of the silhouette, and the horde as
       chevrons pointing at the player, which reads as advance, not scenery. */
    art: `
      <rect x="0" y="0" width="100" height="100" fill="${INK}"/>
      <rect x="0" y="74" width="100" height="3.5" fill="#e8703a" opacity="0.35"/>
      <path d="M4 74 L4 34 Q17 20 30 34 L30 74 Z" fill="#e8703a" opacity="0.16"/>
      <path d="M4 74 L4 34 Q17 20 30 34 L30 74" fill="none" stroke="#e8703a" stroke-width="3" opacity="0.75"/>
      <g stroke="#e8703a" stroke-width="2.4" opacity="0.55">
        <line x1="11" y1="28" x2="11" y2="74"/><line x1="17" y1="24" x2="17" y2="74"/>
        <line x1="23" y1="28" x2="23" y2="74"/>
      </g>
      <circle cx="45" cy="45" r="8.5" fill="#e8703a"/>
      <path d="M38 74 L38 58 Q45 53 52 58 L52 74 Z" fill="#e8703a"/>
      <line x1="59" y1="30" x2="53" y2="76" stroke="#e8dcc8" stroke-width="3.2" opacity="0.85"/>
      <g fill="none" stroke="#e8dcc8" stroke-width="5" stroke-linecap="round" opacity="0.6">
        <path d="M82 48 L72 60 L82 72"/>
      </g>
      <g fill="none" stroke="#e8dcc8" stroke-width="5" stroke-linecap="round" opacity="0.3">
        <path d="M96 52 L88 60 L96 68"/>
      </g>`
  }
};

function svg(art, scale, radius) {
  const off = (100 - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="${radius}" fill="${BG}"/>
    <g transform="translate(${off} ${off}) scale(${scale})">${art}</g>
  </svg>`;
}

const jobs = [
  { file: "icon-192.png", size: 192, scale: 0.94, radius: 22 },
  { file: "icon-512.png", size: 512, scale: 0.94, radius: 22 },
  { file: "icon-maskable-512.png", size: 512, scale: 0.78, radius: 0 }
];

const only = process.argv[2];
const targets = only ? [only] : Object.keys(GAMES);
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
let wrote = 0;

for (const id of targets) {
  const g = GAMES[id];
  if (!g) { console.log("no motif for " + id); continue; }
  const dir = "satellites/" + id + "/";
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  for (const job of jobs) {
    const page = await browser.newPage();
    await page.setViewport({ width: job.size, height: job.size, deviceScaleFactor: 1 });
    const markup = svg(g.art, job.scale, job.radius);
    await page.setContent(
      `<body style="margin:0;background:${BG}">
         <div style="width:${job.size}px;height:${job.size}px">${markup}</div>
       </body>`,
      { waitUntil: "load" }
    );
    const buf = await page.screenshot({ type: "png", omitBackground: false });
    writeFileSync(dir + job.file, buf);
    await page.close();
    wrote++;
    console.log("  " + dir + job.file + "  " + (buf.length / 1024).toFixed(1) + "KB");
  }
}

await browser.close();
console.log("wrote " + wrote + " icons for " + targets.length + " game(s)");
