// DOM layer: HUD, hints, sheets (results, settings, how to play, modes, drawer, odd bin,
// clothesline, shop, lore). Everything a thumb touches is at least 48 px (DESIGN 9.1, 12).
// Player facing copy follows the studio rule: no dashes, one sentence descriptions.

import { renderFlat } from '../engine/flat.js';
import { TILE, sockName, decode } from '../engine/sockgen.js';
import { SILHOUETTES } from './silhouettes.js';

const CSS = `
#ui [hidden] { display: none !important; }
#ui { position: absolute; inset: 0; pointer-events: none; z-index: 10; font-family: var(--ui); color: var(--ink); }
#ui button { font-family: var(--ui); }
.vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 75% at 50% 52%, rgba(0,0,0,0) 55%, rgba(34,22,12,.34) 100%); }
.hud { position: absolute; left: 0; right: 0; top: 0; padding: calc(10px + var(--sat)) 12px 0; display: flex; align-items: flex-start; gap: 8px; pointer-events: none; transition: opacity .3s; }
.hud.off { opacity: 0; }
.chip { pointer-events: auto; display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 6px 12px; border-radius: 999px; background: rgba(251,245,233,.92); box-shadow: 0 2px 10px var(--shadow); font-weight: 800; font-size: 1rem; color: var(--ink); }
.chip svg { width: 22px; height: 22px; }
.chip small { font-weight: 700; color: var(--ink-soft); font-size: .8rem; }
.hud .grow { flex: 1; }
.iconbtn { pointer-events: auto; width: 48px; height: 48px; border-radius: 50%; border: none; background: rgba(251,245,233,.92); box-shadow: 0 2px 10px var(--shadow); display: grid; place-items: center; color: var(--ink); cursor: pointer; }
.iconbtn svg { width: 24px; height: 24px; }
.iconbtn:active { transform: scale(.94); }
.timer { position: absolute; left: 12px; right: 12px; top: calc(62px + var(--sat)); height: 10px; border-radius: 6px; background: rgba(251,245,233,.55); overflow: hidden; box-shadow: 0 1px 6px var(--shadow); }
.timer i { display: block; height: 100%; width: 100%; background: linear-gradient(90deg, #d08a5c, #f2d58e); transform-origin: left; }
.timer.low i { background: linear-gradient(90deg, #c4543f, #e89a6a); }
.rushbar { position: absolute; left: 12px; right: 12px; top: calc(78px + var(--sat)); display: flex; align-items: center; gap: 8px; }
.mult { font-family: var(--display); font-weight: 700; font-size: 1.35rem; color: #fff7e6; text-shadow: 0 2px 6px rgba(0,0,0,.4); min-width: 44px; }
.dots { display: flex; gap: 4px; }
.dots b { width: 10px; height: 10px; border-radius: 50%; background: rgba(251,245,233,.35); box-shadow: inset 0 0 0 1px rgba(0,0,0,.1); }
.dots b.on { background: #f2d58e; box-shadow: 0 0 8px #f2d58e; }
.powers { position: absolute; right: 10px; top: calc(112px + var(--sat)); display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
.power { pointer-events: auto; width: 56px; min-height: 56px; border-radius: 16px; border: none; background: rgba(251,245,233,.9); box-shadow: 0 2px 10px var(--shadow); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: .62rem; font-weight: 800; color: var(--ink); padding: 4px 2px; line-height: 1.05; opacity: .5; }
.power.ready { opacity: 1; box-shadow: 0 0 0 2px #f2d58e, 0 2px 14px rgba(242,213,142,.8); }
.power svg { width: 24px; height: 24px; margin-bottom: 2px; }
.power .cost { color: var(--ink-soft); }
.bottombar { position: absolute; left: 10px; bottom: calc(10px + var(--sab)); display: flex; gap: 8px; }
.hint { position: absolute; z-index: 6; left: 50%; top: calc(122px + var(--sat)); transform: translate(-50%, -8px); max-width: min(86vw, 360px); padding: 10px 16px; border-radius: 16px; background: rgba(42,35,32,.88); color: var(--cream); font-weight: 700; font-size: .95rem; text-align: center; opacity: 0; transition: opacity .25s, transform .25s; pointer-events: none; line-height: 1.35; }
.hint.on { opacity: 1; transform: translate(-50%, 0); }
.pop { position: absolute; font-family: var(--display); font-weight: 700; color: #fff7e6; text-shadow: 0 2px 8px rgba(0,0,0,.45); font-size: 1.4rem; pointer-events: none; animation: popup 1.1s ease-out forwards; white-space: nowrap; }
@keyframes popup { 0% { opacity: 0; transform: translate(-50%, 0) scale(.7); } 15% { opacity: 1; transform: translate(-50%, -8px) scale(1.08); } 100% { opacity: 0; transform: translate(-50%, -54px) scale(1); } }
.sweepbar { position: absolute; left: 50%; bottom: calc(84px + var(--sab)); transform: translate(-50%, 12px); display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 20px; background: rgba(251,245,233,.94); box-shadow: 0 4px 18px var(--shadow); color: var(--ink); font-weight: 800; white-space: nowrap; opacity: 0; transition: opacity .25s, transform .25s; pointer-events: none; }
.sweepbar.on { opacity: 1; transform: translate(-50%, 0); }
.sweepbar b { font-family: var(--display); font-size: 1.2rem; }
.sweepbar .tag { padding: 4px 10px; border-radius: 999px; background: #ebe1cc; font-size: .85rem; }
.sweepbar .tag.clean { background: #f2d58e; box-shadow: 0 0 12px rgba(242,213,142,.8); }
.handglow { position: absolute; left: 50%; top: 80%; width: 210px; height: 210px; margin: -105px 0 0 -105px; border-radius: 50%; background: radial-gradient(circle, rgba(255,236,196,.42) 0%, rgba(255,236,196,.12) 45%, rgba(255,236,196,0) 70%); opacity: 0; transition: opacity .25s; pointer-events: none; }
.handglow.on { opacity: 1; }
.fog { position: absolute; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(236,232,224,.96) 0%, rgba(236,232,224,.85) 40%, rgba(236,232,224,0) 70%); transition: opacity .6s; }
/* sheets */
.scrim { position: absolute; inset: 0; background: rgba(28,22,18,.45); opacity: 0; transition: opacity .25s; pointer-events: none; }
.scrim.on { opacity: 1; pointer-events: auto; }
.sheet { position: absolute; left: 0; right: 0; bottom: 0; max-height: 92%; display: flex; flex-direction: column; background: var(--paper); border-radius: 26px 26px 0 0; box-shadow: 0 -8px 30px rgba(0,0,0,.3); transform: translateY(105%); transition: transform .34s cubic-bezier(.2,.9,.3,1.05); pointer-events: none; padding-bottom: var(--sab); }
.sheet.on { transform: translateY(0); pointer-events: auto; }
.sheet.center { top: 50%; bottom: auto; left: 50%; right: auto; width: min(92vw, 420px); border-radius: 26px; transform: translate(-50%, -40%) scale(.96); opacity: 0; transition: opacity .25s, transform .3s; max-height: 88%; }
.sheet.center.on { transform: translate(-50%, -50%) scale(1); opacity: 1; }
.sheet header { padding: 18px 20px 6px; display: flex; align-items: center; gap: 10px; }
.sheet h2 { font-family: var(--display); font-weight: 700; font-size: 1.6rem; margin: 0; flex: 1; line-height: 1.15; color: var(--ink); }
.sheet .body { padding: 6px 20px 18px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.sheet p { margin: 8px 0; line-height: 1.45; font-size: 1rem; }
.sheet .lead { color: var(--ink-soft); font-size: .98rem; }
.close { width: 48px; height: 48px; border-radius: 50%; border: none; background: rgba(74,58,44,.08); display: grid; place-items: center; color: var(--ink); flex: none; }
.close svg { width: 22px; height: 22px; }
.btnrow { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
.btn { min-height: 52px; padding: 12px 18px; border-radius: 16px; border: none; font-weight: 800; font-size: 1.02rem; background: var(--sage-deep); color: #fbf5e9; box-shadow: 0 3px 0 #465c43; flex: 1; cursor: pointer; }
.btn.soft { background: #ebe1cc; color: var(--ink); box-shadow: 0 3px 0 #d3c6aa; }
.btn.warm { background: var(--clay); box-shadow: 0 3px 0 #a86a42; }
.btn:active { transform: translateY(2px); box-shadow: none; }
.btn[disabled] { opacity: .45; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; border-bottom: 1px solid rgba(74,58,44,.1); }
.row label { font-weight: 700; flex: 1; }
.row small { display: block; font-weight: 600; color: var(--ink-soft); font-size: .82rem; }
.toggle { position: relative; width: 56px; height: 34px; border-radius: 20px; background: #d8ccb5; border: none; flex: none; }
.toggle::after { content: ''; position: absolute; top: 4px; left: 4px; width: 26px; height: 26px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: left .2s; }
.toggle[aria-checked="true"] { background: var(--sage-deep); }
.toggle[aria-checked="true"]::after { left: 26px; }
.seg { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 12px; }
.seg button { min-height: 48px; padding: 8px 12px; border-radius: 12px; border: 2px solid #e2d6bf; background: #fff; font-weight: 700; color: var(--ink); }
.seg button[aria-pressed="true"] { border-color: var(--sage-deep); background: #eef3ea; }
.seg button[disabled] { opacity: .45; }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mode { border-radius: 20px; padding: 14px; min-height: 150px; border: none; text-align: left; color: #fbf5e9; display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; box-shadow: 0 4px 0 rgba(0,0,0,.15); position: relative; overflow: hidden; }
.mode b { font-family: var(--display); font-size: 1.3rem; }
.mode span { font-size: .85rem; font-weight: 600; opacity: .95; line-height: 1.3; }
.mode.laundry { background: linear-gradient(160deg, #8fa58a, #5f7a5a); }
.mode.rush { background: linear-gradient(160deg, #e6a36c, #c46a3f); }
.mode.daily { background: linear-gradient(160deg, #8a93c6, #5b6399); }
.mode svg { position: absolute; right: 10px; top: 10px; width: 44px; height: 44px; opacity: .9; }
.subs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.subs button { min-height: 56px; border-radius: 14px; border: 2px solid #ecd9c5; background: #fff8f0; font-weight: 800; color: var(--ink); text-align: left; padding: 8px 12px; }
.subs button small { display: block; font-weight: 600; color: var(--ink-soft); font-size: .78rem; }
.stars { display: flex; gap: 8px; justify-content: center; margin: 6px 0 2px; }
.stars svg { width: 44px; height: 44px; }
.tidyname { text-align: center; font-family: var(--display); font-size: 1.3rem; font-weight: 700; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 12px 0; }
.stat { background: #f3ead8; border-radius: 14px; padding: 8px 4px; text-align: center; }
.stat b { display: block; font-size: 1.25rem; font-family: var(--display); }
.stat span { font-size: .72rem; font-weight: 700; color: var(--ink-soft); }
.earn { display: flex; gap: 10px; margin: 8px 0; }
.earn div { flex: 1; border-radius: 16px; padding: 10px 12px; background: linear-gradient(160deg, #fff4dc, #f5e3bb); display: flex; align-items: center; gap: 10px; font-weight: 800; }
.earn svg { width: 34px; height: 34px; flex: none; }
.earn b { font-family: var(--display); font-size: 1.5rem; }
.earn small { display: block; font-weight: 700; color: var(--ink-soft); font-size: .75rem; }
.fan { display: flex; justify-content: center; margin: 10px 0 4px; min-height: 110px; }
.fan { overflow: hidden; padding: 6px 0; }
.fan canvas { width: 70px; height: 94px; margin: 0 -8px; border-radius: 12px; background: #efe5d2; box-shadow: 0 3px 8px var(--shadow); transform-origin: 50% 120%; animation: dealin .45s both; }
@keyframes dealin { from { opacity: 0; transform: translateY(24px) rotate(0deg) scale(.8); } }
.board { list-style: none; margin: 0 0 8px; padding: 0; counter-reset: rank; }
.board li { counter-increment: rank; display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 4px 12px; border-radius: 12px; font-weight: 700; }
.board li::before { content: counter(rank); font-family: var(--display); color: var(--ink-soft); width: 18px; }
.board li span { flex: 1; }
.board li small { color: var(--clay); font-weight: 800; margin-left: 4px; }
.board li b { font-family: var(--display); font-size: 1.1rem; }
.board li.today { background: #fff1d1; }
.note { border-radius: 16px; padding: 10px 14px; margin: 8px 0; background: #eef3ea; font-weight: 700; line-height: 1.35; }
.note.gold { background: #fff1d1; }
.reunion { position: relative; height: 120px; margin: 6px 0; }
.reunion canvas { position: absolute; top: 10px; width: 80px; height: 104px; }
.reunion .l { left: 10%; animation: meetL 1.4s .3s both; }
.reunion .r { right: 10%; animation: meetR 1.4s .3s both; }
@keyframes meetL { 0% { transform: translate(0, 20px) rotate(-18deg); } 60% { transform: translate(52%, -18px) rotate(8deg); } 100% { transform: translate(62%, 0) rotate(-4deg); } }
@keyframes meetR { 0% { transform: translate(0, 20px) rotate(18deg); } 60% { transform: translate(-52%, -18px) rotate(-8deg); } 100% { transform: translate(-62%, 0) rotate(4deg); } }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 10px; }
.cell { position: relative; border: none; border-radius: 16px; background: #f1e7d4; padding: 4px; min-height: 120px; display: flex; flex-direction: column; align-items: center; color: var(--ink); }
.cell canvas { width: 84px; height: 96px; }
.cell span { font-size: .7rem; font-weight: 700; line-height: 1.15; text-align: center; }
.cell.rare { box-shadow: 0 0 0 2px #e7c46a, 0 0 14px rgba(231,196,106,.7); }
.cell.uncommon { box-shadow: 0 0 0 2px #9fc0a0; }
.cell.oddone { background: #e9e3f2; }
.cell .count { position: absolute; top: 6px; right: 8px; font-size: .72rem; font-weight: 800; background: #fff; border-radius: 10px; padding: 1px 6px; }
.tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin: 0 -4px 6px; }
.tabs button { flex: none; min-height: 48px; padding: 8px 14px; border-radius: 999px; border: none; background: #efe5d2; font-weight: 800; color: var(--ink); }
.tabs button[aria-pressed="true"] { background: var(--ink); color: var(--cream); }
.shopitem { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(74,58,44,.1); }
.swatch { width: 52px; height: 52px; border-radius: 14px; flex: none; box-shadow: inset 0 0 0 2px rgba(0,0,0,.06); display: grid; place-items: center; }
.swatch svg { width: 30px; height: 30px; }
.shopitem .txt { flex: 1; }
.shopitem b { display: block; }
.shopitem small { color: var(--ink-soft); font-weight: 600; line-height: 1.3; display: block; }
.price { min-width: 92px; min-height: 48px; border-radius: 14px; border: none; font-weight: 800; background: var(--sage-deep); color: #fff; }
.price.owned { background: #efe5d2; color: var(--ink); }
.price.equipped { background: #fff1d1; color: var(--ink); box-shadow: inset 0 0 0 2px #e7c46a; }
.price[disabled] { opacity: .5; }
.wallet { display: flex; gap: 8px; }
.line { position: relative; overflow-x: auto; padding: 20px 4px 12px; }
.line svg.rope { position: absolute; left: 0; top: 24px; height: 40px; }
.pegs { position: relative; display: flex; gap: 14px; width: max-content; padding-top: 18px; }
.peg { width: 92px; flex: none; border: none; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--ink); min-height: 150px; }
.peg .pin { width: 16px; height: 34px; border-radius: 4px; background: linear-gradient(90deg, #d9b98d, #b88d5c); box-shadow: 0 2px 3px rgba(0,0,0,.2); }
.peg .card { width: 86px; min-height: 92px; border-radius: 14px; background: #efe5d2; display: flex; align-items: center; justify-content: center; padding: 6px; text-align: center; font-size: .72rem; font-weight: 800; line-height: 1.2; transform-origin: 50% 0; }
.peg.got .card { background: linear-gradient(170deg, #fff4dc, #f2dfb4); box-shadow: 0 4px 10px var(--shadow); animation: sway 4s ease-in-out infinite; }
.peg.rushpeg .card { background: #f6dcc9; }
.peg.rushpeg.got .card { background: linear-gradient(170deg, #ffe3cf, #f1bf9c); }
.peg.blank .card { background: transparent; border: 2px dashed #d5c7ab; color: var(--ink-soft); }
@keyframes sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
.page { background: #fffaf0; border-radius: 18px; padding: 14px 16px; box-shadow: inset 0 0 0 1px #eadfc7; margin: 8px 0; }
.page h3 { font-family: var(--display); margin: 0 0 4px; font-size: 1.2rem; }
.page .who { font-size: .8rem; font-weight: 800; color: var(--ink-soft); margin-bottom: 6px; }
.lock { color: var(--ink-soft); font-weight: 700; }
#spots { transition: opacity .25s; }
#spots.moving { opacity: 0; transition: none; }
#spots.moving .hotspot { pointer-events: none; }
.hotspot { position: absolute; pointer-events: auto; min-width: 48px; min-height: 48px; border: none; background: transparent; border-radius: 18px; display: flex; align-items: flex-end; justify-content: center; }
.hotspot.top { align-items: flex-start; }
.hotspot.top .tag { transform: translateY(-14px); }
.hotspot.left { justify-content: flex-start; align-items: center; }
.hotspot.left .tag { transform: translateX(-70%); }
.hotspot .tag { transform: translateY(12px); background: rgba(251,245,233,.95); border-radius: 999px; padding: 6px 12px; font-weight: 800; font-size: .88rem; box-shadow: 0 2px 8px var(--shadow); white-space: nowrap; color: var(--ink); }
.hotspot:focus-visible { outline: 3px solid var(--butter); }
.title { position: absolute; left: 0; right: 0; top: calc(18px + var(--sat)); text-align: center; pointer-events: none; }
.title h1 { margin: 0; font-family: var(--display); font-weight: 700; letter-spacing: .12em; color: #fff7e6; font-size: 2.6rem; text-shadow: 0 3px 16px rgba(0,0,0,.4); }
.title p { margin: 2px 0 0; color: #fff1d6; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,.45); }
.wallet.room { position: absolute; right: 12px; top: calc(96px + var(--sat)); pointer-events: auto; flex-direction: column; align-items: flex-end; }
.dock { position: absolute; left: 0; right: 0; bottom: calc(14px + var(--sab)); padding: 0 16px; pointer-events: auto; display: flex; flex-direction: column; gap: 12px; align-items: stretch; }
.dock .play { min-height: 64px; border-radius: 22px; border: none; background: linear-gradient(180deg, #fbf5e9, #efe3cc); color: var(--ink); font-family: var(--display); font-weight: 700; font-size: 1.45rem; box-shadow: 0 5px 0 #c9b690, 0 10px 24px rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; gap: 12px; }
.dock .play svg { width: 40px; height: 40px; }
.dock .play:active { transform: translateY(3px); box-shadow: 0 2px 0 #c9b690, 0 6px 16px rgba(0,0,0,.3); }
.dock .row4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.dock .row4 button { min-height: 64px; border-radius: 18px; border: none; background: rgba(251,245,233,.9); color: var(--ink); font-weight: 800; font-size: .78rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; box-shadow: 0 3px 10px rgba(0,0,0,.25); }
.dock .row4 svg { width: 26px; height: 26px; }
.dock .badge { background: var(--clay); color: #fff; border-radius: 10px; padding: 0 6px; font-size: .7rem; margin-left: 2px; }
.howto li { margin: 8px 0; line-height: 1.4; }
.howto svg { width: 30px; height: 30px; vertical-align: middle; margin-right: 6px; }
.sharecard { width: 100%; border-radius: 16px; box-shadow: 0 4px 12px var(--shadow); }
textarea.io { width: 100%; min-height: 90px; border-radius: 12px; border: 2px solid #e2d6bf; padding: 10px; font: 12px/1.3 ui-monospace, monospace; }
@media (min-width: 700px) {
  .sheet:not(.center) { max-width: 560px; margin: 0 auto; }
  .dock { max-width: 520px; margin: 0 auto; }
  .powers { top: calc(112px + var(--sat)); right: calc(50% - 300px); }
}
@media (prefers-reduced-motion: reduce) { .peg.got .card { animation: none; } .fan canvas, .reunion canvas { animation-duration: .01s; } }
`;

const I = {
  sock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h7v9l3 3a3.5 3.5 0 0 1-5 5l-5-5z"/><path d="M8 5h7"/></svg>',
  odd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 9l3-5h12l3 5"/><path d="M10 14h4"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  spread: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>',
  lint: '<svg viewBox="0 0 40 40"><circle cx="20" cy="21" r="13" fill="#e9e1d6"/><circle cx="14" cy="17" r="6" fill="#f6f1ea"/><circle cx="25" cy="15" r="5" fill="#f3ede4"/><circle cx="23" cy="26" r="7" fill="#ddd3c6"/><path d="M9 22c4 2 9 1 12-2M18 28c3-1 6-1 9 1" stroke="#c8bba9" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
  quarter: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#c9ced3"/><circle cx="20" cy="20" r="12" fill="#dfe3e6" stroke="#aeb5bb" stroke-width="1.5"/><path d="M15 23c2-6 8-8 10-4-3 0-5 2-5 5" stroke="#8d959c" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  reunion: '<svg viewBox="0 0 40 40"><path d="M20 33s-11-7-11-15a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 8-11 15-11 15z" fill="#e89a8c"/></svg>',
  towelOn: '<svg viewBox="0 0 44 44"><rect x="6" y="12" width="32" height="22" rx="5" fill="#8fa58a"/><rect x="6" y="18" width="32" height="4" fill="#f6eddc"/><rect x="6" y="26" width="32" height="2" fill="#f6eddc"/></svg>',
  towelOff: '<svg viewBox="0 0 44 44"><rect x="6" y="12" width="32" height="22" rx="5" fill="none" stroke="#d5c7ab" stroke-width="2.5" stroke-dasharray="4 3"/></svg>',
  static: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  sheet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l3 3v13H5z"/><path d="M8 10c2 1 6 1 8 0M8 14c2 1 6 1 8 0"/></svg>',
  puppet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21V8a5 5 0 0 1 10 0v13"/><circle cx="10" cy="9" r="1" fill="currentColor"/><circle cx="14" cy="9" r="1" fill="currentColor"/><path d="M9 13c2 1.5 4 1.5 6 0"/></svg>',
  spin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 7a5 5 0 0 1 5 5M12 17a5 5 0 0 1-5-5"/></svg>',
  basket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18l-2 10H5z"/><path d="M8 10l2-6M16 10l-2-6M7 14h10"/></svg>',
  dryer: '<svg viewBox="0 0 48 48"><rect x="8" y="6" width="32" height="36" rx="6" fill="#fff5e6" opacity=".9"/><circle cx="24" cy="27" r="9" fill="none" stroke="#2a2320" stroke-width="3" opacity=".55"/><circle cx="16" cy="12" r="2" fill="#2a2320" opacity=".55"/></svg>',
  bolt: '<svg viewBox="0 0 48 48"><path d="M27 4L10 27h12l-3 17 19-26H26z" fill="#fff5e6" opacity=".9"/></svg>',
  cal: '<svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="30" rx="5" fill="#fff5e6" opacity=".9"/><path d="M8 18h32" stroke="#2a2320" stroke-width="3" opacity=".4"/><circle cx="24" cy="29" r="4" fill="#2a2320" opacity=".45"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7h16v-7M12 3v12M7 8l5-5 5 5"/></svg>',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class UI {
  constructor(root, app) {
    this.app = app;
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    const el = document.createElement('div');
    el.id = 'ui';
    el.innerHTML = `
      <div class="vignette"></div>
      <div class="handglow" id="handGlow"></div>
      <div id="fogLayer"></div>
      <div id="spots"></div>
      <div class="title" id="roomTitle" hidden><h1>TUMBLE</h1><p>a cozy laundry room</p></div>
      <div class="wallet room" id="roomWallet" hidden></div>
      <div class="dock" id="dock" hidden>
        <button class="play" id="dockPlay" aria-label="Open the dryer and start a Load"><svg viewBox="0 0 48 48"><rect x="7" y="5" width="34" height="38" rx="7" fill="#b0d6c4"/><rect x="10" y="9" width="28" height="6" rx="2" fill="#f1ead8"/><circle cx="24" cy="28" r="10" fill="#5c5f60" stroke="#dedbd2" stroke-width="3"/><path d="M19 27c3-3 7 3 10 0" stroke="#e8a598" stroke-width="3" fill="none" stroke-linecap="round"/></svg>Open the dryer</button>
        <div class="row4">
          <button id="dockDrawer">${I.sock}<span>Drawer</span></button>
          <button id="dockBin">${I.odd}<span>Odd Bin</span></button>
          <button id="dockLine"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 6c6 3 14 3 20 0"/><path d="M8 8v4M16 8v4"/><rect x="5.5" y="12" width="5" height="7" rx="1.5"/><rect x="13.5" y="12" width="5" height="6" rx="1.5"/></svg><span>Clothesline</span></button>
          <button id="dockDoor">${I.gear}<span>Door</span></button>
        </div>
      </div>
      <div class="hud off" id="hud">
        <div class="chip" id="chipPairs" aria-label="Pairs left">${I.sock}<span id="pairsLeft">0</span><small>pairs</small></div>
        <div class="chip" id="chipOdd" aria-label="Odd socks left">${I.odd}<span id="oddLeft">0</span><small>odd</small></div>
        <div class="grow"></div>
        <button class="iconbtn" id="btnPause" aria-label="Pause">${I.pause}</button>
      </div>
      <div class="timer" id="timer" hidden><i id="timerFill"></i></div>
      <div class="rushbar" id="rushbar" hidden><div class="mult" id="mult">x1</div><div class="dots" id="dots"></div><div class="grow"></div><div class="chip" id="score">0</div></div>
      <div class="powers" id="powers" hidden></div>
      <div class="bottombar" id="bottombar" hidden><button class="iconbtn" id="btnSpread" aria-label="Shake the pile apart">${I.spread}</button></div>
      <div id="pops"></div>
      <div class="scrim" id="scrim"></div>
      <section class="sheet" id="sheet" role="dialog" aria-modal="true"><header><h2 id="sheetTitle"></h2><button class="close" id="sheetClose" aria-label="Close">${I.close}</button></header><div class="body" id="sheetBody"></div></section>
      <div class="sweepbar" id="sweepbar" role="status"></div>
      <div class="hint" id="hint" role="status" aria-live="polite"></div>
    `;
    root.appendChild(el);
    this.el = el;
    this.$ = (id) => el.querySelector('#' + id);
    this.$('btnPause').addEventListener('click', () => app.pause());
    this.$('btnSpread').addEventListener('click', () => app.spreadButton());
    this.$('sheetClose').addEventListener('click', () => this.closeSheet(true));
    this.$('scrim').addEventListener('click', () => { if (this.sheetDismissable) this.closeSheet(true); });
    this.hintTimer = 0;
    this.sheetStack = [];
  }

  // ---------- HUD ----------
  showHUD(on, mode) {
    this.$('hud').classList.toggle('off', !on);
    const rush = on && mode === 'rush';
    this.$('timer').hidden = !rush;
    this.$('rushbar').hidden = !rush;
    this.$('powers').hidden = !rush;
    this.$('bottombar').hidden = !on;
    if (rush) this.buildPowers();
  }

  buildPowers() {
    const P = this.app.powerDefs();
    this.$('powers').innerHTML = P.map((p) => `<button class="power" data-power="${p.key}" aria-label="${esc(p.name)}, costs ${p.cost} dots">${I[p.icon]}<span>${esc(p.name)}</span><span class="cost">${p.cost} dots</span></button>`).join('');
    this.$('powers').querySelectorAll('.power').forEach((b) => b.addEventListener('click', () => this.app.usePower(b.dataset.power)));
  }

  updateHUD(S, extra = {}) {
    if (!S) return;
    this.$('pairsLeft').textContent = S.pairsLeft();
    this.$('oddLeft').textContent = S.oddLeft();
    this.$('chipOdd').style.display = S.oddLeft() ? '' : 'none';
    if (S.mode === 'rush') {
      const f = S.sub === 'endless' ? Math.min(1, S.timeLeft / 60) : S.timeLeft / Math.max(1, S.timeTotal);
      this.$('timerFill').style.transform = `scaleX(${Math.max(0, f)})`;
      this.$('timer').classList.toggle('low', S.timeLeft < 8);
      this.$('mult').textContent = 'x' + S.mult;
      this.$('score').textContent = S.stats.rushPoints.toLocaleString() + (S.sub === 'endless' ? `  ${Math.ceil(S.timeLeft)} s` : '');
      const dots = this.$('dots');
      const want = 8;
      if (dots.children.length !== want) dots.innerHTML = '<b></b>'.repeat(want);
      [...dots.children].forEach((d, i) => d.classList.toggle('on', i < S.dots));
      this.$('powers').querySelectorAll('.power').forEach((b) => {
        const ok = this.app.powerReady(b.dataset.power);
        b.classList.toggle('ready', ok);
        b.hidden = !this.app.powerOwned(b.dataset.power);
      });
    }
    this.$('handGlow').classList.toggle('on', !!extra.pocket);
  }

  // the Sweep (DESIGN 10.4): shots made and missed, and the Clean Load bonus or the strays still out
  sweepBar(S) {
    const el = this.$('sweepbar');
    if (!S) { el.classList.remove('on'); this.sweepKey = ''; return; }
    const st = S.stats, left = S.strays().length;
    const key = `${st.shotsMade}|${st.shotsMissed}|${left}|${st.cleanLoad}`;
    if (key !== this.sweepKey) {
      this.sweepKey = key;
      const tag = st.cleanLoad ? '<span class="tag clean">Clean Load</span>' : left ? `<span class="tag">${left} ${left === 1 ? 'stray' : 'strays'}</span>` : '<span class="tag">All swept</span>';
      el.innerHTML = `<b>Sweep</b><span>${st.shotsMade} made, ${st.shotsMissed} missed</span>${tag}`;
    }
    el.classList.add('on');
  }

  hint(text, ms = 2600) {
    const h = this.$('hint');
    h.textContent = text;
    h.classList.add('on');
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => h.classList.remove('on'), ms);
  }

  popup(text, x, y) {
    const p = document.createElement('div');
    p.className = 'pop';
    p.textContent = text;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    this.$('pops').appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }

  // lint fog puffs (Rush tier 6+): occluding clouds, never a global dimming (OPUS_PROMPT rule)
  setFog(puffs) {
    const L = this.$('fogLayer');
    L.innerHTML = (puffs || []).map((f) => `<div class="fog" style="left:${f.x - f.r}px;top:${f.y - f.r}px;width:${f.r * 2}px;height:${f.r * 2}px;opacity:${f.a}"></div>`).join('');
  }

  // ---------- sheets ----------
  openSheet(title, html, { center = false, dismiss = true, onClose = null } = {}) {
    const s = this.$('sheet');
    s.classList.toggle('center', center);
    this.$('sheetTitle').textContent = title;
    this.$('sheetBody').innerHTML = html;
    this.$('sheetBody').scrollTop = 0;
    this.$('sheetClose').hidden = !dismiss;
    this.sheetDismissable = dismiss;
    this.onClose = onClose;
    // slide in on the next frame; a sheet closed before that frame must stay closed
    const token = (this.sheetToken = (this.sheetToken || 0) + 1);
    requestAnimationFrame(() => { if (!this.open || token !== this.sheetToken) return; s.classList.add('on'); this.$('scrim').classList.add('on'); });
    this.open = true;
    return this.$('sheetBody');
  }

  closeSheet(user = false) {
    if (!this.open) return;
    this.sheetToken = (this.sheetToken || 0) + 1;
    this.$('sheet').classList.remove('on');
    this.$('scrim').classList.remove('on');
    this.open = false;
    const cb = this.onClose;
    this.onClose = null;
    if (cb) cb(user);
  }

  // ---------- flat sock thumbnails ----------
  sockCanvas(seed, { w = 84, h = 96, insideOut = false, hero = null } = {}) {
    const c = document.createElement('canvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * dpr; c.height = h * dpr;
    try {
      const sp = decode(seed);
      const silId = hero ? Math.max(0, SILHOUETTES.findIndex((s) => s.key === hero.silhouette)) : sp.silhouette;
      const tile = this.app.thumbTile(seed);
      const f = renderFlat(tile, 96, silId, { w: c.width, h: c.height, insideOut, pad: 0.08 });
      const x = c.getContext('2d');
      x.putImageData(new ImageData(f.rgba, f.w, f.h), 0, 0);
    } catch (e) { console.warn('TUMBLE: thumbnail failed', e); }
    return c;
  }

  // ---------- how to play (shown before the first Load; studio standard) ----------
  // dismiss: the sheet can be closed without starting (onCancel runs); the first launch and the pause menu both allow it
  howTo(onDone, label = 'Start my first Load', { dismiss = true, onCancel = null } = {}) {
    const body = this.openSheet('How to play', `
      <p class="lead">The dryer just finished. Every sock on the table has a twin somewhere in the pile, except a few odd ones.</p>
      <ol class="howto">
        <li><b>Find a pair.</b> Tap a sock to pick it up, then tap its twin. They roll into a ball.</li>
        <li><b>Basket it.</b> Flick the ball up toward the basket, or tap the basket to toss it in gently.</li>
        <li><b>Odd socks</b> have no twin on the table. Tap one, then tap the Odd Bin; its mate may turn up in a later Load.</li>
        <li><b>Inside out socks</b> look faded. Double tap one to flip it before you pair it.</li>
        <li><b>Drag</b> a sock to dig through the pile, and swipe with two fingers (or tap the arrows button) to spread it out.</li>
      </ol>
      <p><b>Laundry Day</b> has no timer and nothing to fail. Misses stay on the table and cost nothing.</p>
      <div class="btnrow"><button class="btn" id="howGo">${esc(label)}</button></div>
    `, { center: false, dismiss, onClose: (user) => { if (user && onCancel) onCancel(); } });
    body.querySelector('#howGo').addEventListener('click', () => { this.closeSheet(); onDone(); });
  }

  // ---------- Rush rules, shown before the first Rush Load of each kind ----------
  rushHow(sub, onGo, onBack) {
    const extra = {
      timed: 'You get a few seconds for every pair. When the clock runs out, whatever is left stays on the table.',
      endless: 'You start with 40 seconds. Every pair in the basket adds 4, and the dryer keeps feeding new socks.',
      balance: 'Every ball tips the basket toward where it landed. Tap the basket to settle it (it costs a point of streak); lean it too far and it spills.',
      daily: 'Everyone gets the same Load today, and you get one try at it.',
    }[sub] || '';
    const body = this.openSheet('Rush', `
      <p class="lead">The same pile, now with a clock.</p>
      <ol class="howto">
        <li><b>Streaks.</b> Every 3 correct pairs in a row raise your multiplier, up to x5. A mismatch, a wrong sock in the Odd Bin or a missed shot resets it.</li>
        <li><b>Long shots</b> from far down the table score a quarter more.</li>
        <li><b>Power dots</b> fill up every 5 pairs in a row. Spend them on the powers you have earned on the Clothesline.</li>
        <li><b>Lint fog</b> drifts over busier Loads; a Dryer Sheet clears it.</li>
      </ol>
      <p>${esc(extra)}</p>
      <div class="btnrow"><button class="btn soft" id="rhBack">Back</button><button class="btn warm" id="rhGo">Start</button></div>
    `, { dismiss: false });
    body.querySelector('#rhGo').addEventListener('click', () => { this.closeSheet(); onGo(); });
    body.querySelector('#rhBack').addEventListener('click', () => { this.closeSheet(); onBack && onBack(); });
  }

  // ---------- the dryer door: modes and sizes (DESIGN 10.2) ----------
  modes(state, onPick) {
    const { sizes, unlockedSizes, sizeHints, dailyPlayed, rushOpen, lastSize } = state;
    let size = unlockedSizes.includes(lastSize) ? lastSize : unlockedSizes[unlockedSizes.length - 1];
    const body = this.openSheet('Open the dryer', `
      <p class="lead">Pick a mood, then a Load size.</p>
      <div class="cards">
        <button class="mode laundry" id="mLaundry">${I.dryer}<b>Laundry Day</b><span>No timer, no fail. Just the pile and the hum.</span></button>
        <button class="mode rush" id="mRush">${I.bolt}<b>Rush</b><span>A clock, streaks and four powers.</span></button>
      </div>
      <div id="rushSubs" hidden>
        <div class="subs">
          <button data-sub="timed">Timed<small>Beat the clock.</small></button>
          <button data-sub="endless">Endless<small>Every basket buys time.</small></button>
          <button data-sub="balance">Basket Balance<small>Keep the basket level.</small></button>
          <button data-sub="daily" ${dailyPlayed ? 'disabled' : ''}>Daily Load<small>${dailyPlayed ? 'Played today.' : 'One try, same Load for everyone.'}</small></button>
        </div>
      </div>
      <p style="margin-top:14px"><b>Load size</b></p>
      <div class="seg" id="sizes">${sizes.map((s) => `<button data-size="${s.key}" aria-pressed="${s.key === size}" ${unlockedSizes.includes(s.key) ? '' : 'disabled'}>${esc(s.name)} <small>${s.pairs} pairs</small></button>`).join('')}</div>
      <p class="lead" id="sizeHint">${esc(sizeHints)}</p>
      <div class="btnrow"><button class="btn soft" id="mDaily">Daily Laundry Day</button></div>
    `);
    body.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => {
      size = b.dataset.size;
      body.querySelectorAll('[data-size]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    body.querySelector('#mLaundry').addEventListener('click', () => { this.closeSheet(); onPick({ mode: 'laundry', size }); });
    body.querySelector('#mRush').addEventListener('click', () => {
      if (!rushOpen) { this.hint('Rush opens after your first Load.'); return; }
      const r = body.querySelector('#rushSubs');
      r.hidden = !r.hidden;
    });
    body.querySelectorAll('[data-sub]').forEach((b) => b.addEventListener('click', () => {
      this.closeSheet();
      if (b.dataset.sub === 'daily') onPick({ mode: 'rush', sub: 'timed', daily: true, size: 'regular' });
      else onPick({ mode: 'rush', sub: b.dataset.sub, size });
    }));
    body.querySelector('#mDaily').addEventListener('click', () => { this.closeSheet(); onPick({ mode: 'laundry', daily: true, size: 'regular' }); });
  }

  // ---------- results (DESIGN 10.5) ----------
  results(data, { onAgain, onRoom, onShare, onLore }) {
    const { session: S, out, title, daily, board, days } = data;
    const st = S.stats;
    const tidyLevel = { spotless: 3, tidy: 2, 'lived-in': 1 }[out.tidy];
    const tidyName = { spotless: 'Spotless', tidy: 'Tidy', 'lived-in': 'Lived in' }[out.tidy];
    const qReasons = [out.quarters.clean ? 'Clean Load' : null, out.quarters.spotless ? 'Spotless Tidy' : null].filter(Boolean).join(' and ');
    let html = `<p class="lead">${esc(title)}</p>`;
    if (S.mode === 'laundry') {
      html += `<div class="stars" aria-label="Tidy rating ${tidyName}">${[1, 2, 3].map((i) => (i <= tidyLevel ? I.towelOn : I.towelOff)).join('')}</div><div class="tidyname">${tidyName}</div>`;
      html += `<p class="lead" style="text-align:center">${out.tidy === 'spotless' ? 'No misses, and every inside out sock flipped.' : out.tidy === 'tidy' ? (st.shotsMissed === 0 ? 'No misses. Flip every inside out sock for Spotless.' : 'Every sock flipped. A Load with no misses is Spotless.') : 'Next time: no misses, and flip the inside out ones.'}</p>`;
    } else {
      html += `<div class="tidyname" style="font-size:2.2rem">${st.rushPoints.toLocaleString()}</div><p class="lead" style="text-align:center">Best streak ${S.bestStreak}${S.tips ? `, the basket tipped ${S.tips} ${S.tips === 1 ? 'time' : 'times'}` : ''}.</p>`;
    }
    html += `<div class="stats">
      <div class="stat"><b>${st.matches}</b><span>pairs</span></div>
      <div class="stat"><b>${st.shotsMade - st.tapShots}</b><span>flicked in</span></div>
      <div class="stat"><b>${st.shotsMissed}</b><span>missed</span></div>
      <div class="stat"><b>${st.flips}</b><span>flipped</span></div>
    </div>`;
    html += `<div class="earn"><div>${I.lint}<span><b data-count="${out.lint.total}">0</b><small>Lint</small></span></div><div>${I.quarter}<span><b data-count="${out.quarters.total}">0</b><small>${qReasons ? esc(qReasons) : 'Quarters'}</small></span></div></div>`;
    if (!out.quarters.total && S.mode === 'laundry') html += `<p class="lead">A Clean Load (no strays left for the sweep) and a Spotless Tidy each pay a Quarter.</p>`;
    if (out.reunions.length) {
      html += `<div class="note gold">${I.reunion.replace('<svg', '<svg style="width:22px;height:22px;vertical-align:-5px"')} Reunion! A sock from the Odd Bin found its twin${out.reunions[0].waited ? ` after ${out.reunions[0].waited} ${out.reunions[0].waited === 1 ? 'Load' : 'Loads'}` : ''}.</div><div class="reunion" id="reunionStage"></div>`;
    }
    if (out.newDrawer.length) html += `<p style="margin-bottom:0"><b>New in the Drawer</b> <span class="lead">${out.newDrawer.length}</span></p><div class="fan" id="fan"></div>`;
    for (const p of out.pegs) html += `<div class="note">New on the Clothesline: <b>${esc(p.name)}</b>. ${esc(p.effect)}</div>`;
    for (const p of out.lore) html += `<div class="note gold">The Odd Bin has something to say. <button class="btn soft" data-lore="${p.id}" style="margin-top:8px;width:100%">Read page ${p.id}</button></div>`;
    for (const im of out.impossible) html += `<div class="note gold">An impossible sock arrived${im.hero ? `: <b>${esc(im.hero.name)}</b>` : ''}.</div>`;
    if (out.oddAdded.length) html += `<p class="lead">${out.oddAdded.length} odd ${out.oddAdded.length === 1 ? 'sock is' : 'socks are'} waiting in the Odd Bin.</p>`;
    if (board && board.length) {
      const best = board[0].today && days > 1;
      html += `<p style="margin-bottom:4px"><b>Your best Dailies</b> <span class="lead">on this device${best ? ', and today is the best yet' : ''}</span></p><ol class="board">${board.map((r) => `<li class="${r.today ? 'today' : ''}"><span>${esc(r.date)}${r.today ? ' <small>today</small>' : ''}</span><b>${Number(r.score).toLocaleString()}</b></li>`).join('')}</ol>`;
    }
    html += `<div class="btnrow">${daily ? '<button class="btn soft" id="rShare">Share</button>' : ''}<button class="btn soft" id="rRoom">Room</button><button class="btn" id="rAgain">${daily ? 'Laundry Day' : 'Another Load'}</button></div>`;
    const body = this.openSheet(S.mode === 'rush' ? 'Rush result' : 'Load done', html, { dismiss: false });
    // count up
    body.querySelectorAll('[data-count]').forEach((b) => {
      const target = +b.dataset.count;
      const t0 = performance.now();
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / 900);
        b.textContent = '+' + Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      tick();
    });
    const fan = body.querySelector('#fan');
    if (fan) {
      const list = out.newDrawer.slice(0, Math.max(3, Math.min(6, Math.floor((window.innerWidth - 60) / 56))));
      list.forEach((seed, i) => {
        const c = this.sockCanvas(seed, { hero: this.app.heroOf(seed) });
        const mid = (list.length - 1) / 2;
        c.style.transform = `rotate(${(i - mid) * 7}deg) translateY(${Math.abs(i - mid) * 5}px)`;
        c.style.animationDelay = (0.25 + i * 0.07) + 's';
        c.title = this.app.nameOf(seed);
        fan.appendChild(c);
      });
    }
    const stage = body.querySelector('#reunionStage');
    if (stage) {
      const seed = out.reunions[0].seed;
      const a = this.sockCanvas(seed, { w: 80, h: 104, hero: this.app.heroOf(seed) }); a.className = 'l';
      const b = this.sockCanvas(seed, { w: 80, h: 104, hero: this.app.heroOf(seed) }); b.className = 'r';
      b.style.transform = 'scaleX(-1)';
      stage.append(a, b);
    }
    body.querySelector('#rAgain').addEventListener('click', () => { this.closeSheet(); onAgain(); });
    body.querySelector('#rRoom').addEventListener('click', () => { this.closeSheet(); onRoom(); });
    body.querySelector('#rShare')?.addEventListener('click', () => onShare());
    body.querySelectorAll('[data-lore]').forEach((b) => b.addEventListener('click', () => onLore(+b.dataset.lore)));
  }

  // ---------- pause ----------
  pauseMenu({ onResume, onLeave, onSettings, onHow }) {
    const body = this.openSheet('Paused', `
      <div class="btnrow" style="flex-direction:column">
        <button class="btn" id="pResume">Keep sorting</button>
        <button class="btn soft" id="pHow">How to play</button>
        <button class="btn soft" id="pSettings">Settings</button>
        <button class="btn soft" id="pLeave">Leave this Load</button>
      </div>`, { center: true, onClose: (user) => { if (user) onResume(); } });
    body.querySelector('#pResume').addEventListener('click', () => { this.closeSheet(); onResume(); });
    body.querySelector('#pLeave').addEventListener('click', () => { this.closeSheet(); onLeave(); });
    body.querySelector('#pSettings').addEventListener('click', () => onSettings());
    body.querySelector('#pHow').addEventListener('click', () => onHow());
  }

  // ---------- settings (DESIGN 12, 13.6) ----------
  settings(s, { onChange, onExport, onImport, onReset, onClose }) {
    const tog = (key, label, sub) => `<div class="row"><label for="t_${key}">${label}${sub ? `<small>${sub}</small>` : ''}</label><button class="toggle" id="t_${key}" role="switch" aria-checked="${!!s[key]}" data-key="${key}"></button></div>`;
    const body = this.openSheet('Settings', `
      <p><b>Colour vision</b></p>
      <div class="seg" id="cvd">${[['normal', 'Standard'], ['deutan', 'Deuteranopia'], ['protan', 'Protanopia'], ['tritan', 'Tritanopia']].map(([k, n]) => `<button data-cvd="${k}" aria-pressed="${s.cvd === k}">${n}</button>`).join('')}</div>
      ${tog('patternFirst', 'Pattern first', 'Look alike socks never differ by colour alone.')}
      ${tog('warmHands', 'Warm hands', 'Held socks show extra large.')}
      ${tog('reduceMotion', 'Reduce motion', 'A shake fades the pile instead of throwing it.')}
      ${tog('sound', 'Sound')}
      ${tog('music', 'Dryer hum and radio')}
      ${this.app.game.comfort('rain') ? tog('rain', 'Rain on the window', 'From the Rainy day peg.') : ''}
      ${tog('haptics', 'Vibration')}
      <p style="margin-top:16px"><b>Your save</b></p>
      <p class="lead">Everything lives on this device. Copy it out to keep a backup or move it to another phone.</p>
      <div class="btnrow"><button class="btn soft" id="sExport">Export save</button><button class="btn soft" id="sImport">Import save</button></div>
      <textarea class="io" id="sIO" placeholder="Your save appears here, or paste one to import." hidden></textarea>
      <input type="file" id="sFile" accept="application/json,.json,text/plain" hidden>
      <div class="btnrow" id="sImportRow" hidden><button class="btn" id="sImportGo">Load this save</button></div>
      <p class="lead" id="sStatus" role="status" aria-live="polite"></p>
      <div class="btnrow"><button class="btn soft" id="sReset">Start over</button></div>
      <p class="lead" style="margin-top:18px">TUMBLE by Sky Wolf Studio. No ads, no tracking.</p>
    `, { onClose });
    body.querySelectorAll('.toggle').forEach((t) => t.addEventListener('click', () => {
      const v = t.getAttribute('aria-checked') !== 'true';
      t.setAttribute('aria-checked', String(v));
      onChange(t.dataset.key, v);
    }));
    body.querySelectorAll('[data-cvd]').forEach((b) => b.addEventListener('click', () => {
      body.querySelectorAll('[data-cvd]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange('cvd', b.dataset.cvd);
    }));
    const io = body.querySelector('#sIO');
    body.querySelector('#sExport').addEventListener('click', async () => {
      const text = onExport();
      io.hidden = false;
      io.value = text;
      io.select();
      try { await navigator.clipboard.writeText(text); this.hint('Save copied. Paste it somewhere safe.'); } catch (e) { this.hint('Select the text above and copy it.'); }
      try {
        const blob = new Blob([text], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tumble_save.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      } catch (e) { /* the text box is enough */ }
    });
    body.querySelector('#sImport').addEventListener('click', () => {
      io.hidden = false;
      io.value = '';
      io.focus();
      body.querySelector('#sImportRow').hidden = false;
    });
    body.querySelector('#sImportGo').addEventListener('click', async () => {
      const st = body.querySelector('#sStatus');
      try { await onImport(io.value); st.textContent = 'Save loaded.'; this.hint('Save loaded.'); } catch (e) { st.textContent = e.message || 'That save could not be read.'; this.hint(st.textContent); }
    });
    body.querySelector('#sReset').addEventListener('click', async () => {
      if (!confirm('Start over? Your Drawer, Odd Bin and Clothesline will be cleared.')) return;
      await onReset();
    });
  }
}

export { I as ICONS, esc };
