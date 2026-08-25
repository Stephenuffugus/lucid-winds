/* Play feature graphic 1024x500: the menu key art dimmed under the wordmark. */
import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
const html=`<!doctype html><meta charset="utf-8"><style>
*{margin:0}body{width:1024px;height:500px;overflow:hidden;background:#05070b;position:relative}
.bg{position:absolute;inset:0;background:url('art/bg/bg_menu.webp') center 30%/cover no-repeat;filter:brightness(0.5) saturate(1.05)}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(5,7,11,0.88) 100%)}
.wm{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);width:640px}
.tag{position:absolute;left:0;right:0;top:74px;text-align:center;color:#8fa8bf;font:600 17px/1 system-ui;letter-spacing:.42em}
.sub{position:absolute;left:0;right:0;bottom:56px;text-align:center;color:#dfe9f0;font:600 19px/1 system-ui;letter-spacing:.14em;opacity:.92}
</style>
<div class="bg"></div><div class="vig"></div>
<div class="tag">SKY WOLF STUDIO</div>
<img class="wm" src="art/bg/wordmark.webp">
<div class="sub">PLAY THE PARASITE. THE WORLD FIGHTS BACK.</div>`;
writeFileSync("/workspaces/lucid-winds/satellites/flock-the-world/_fg_tmp.html",html);
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.setViewport({width:1024,height:500,deviceScaleFactor:1});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/_fg_tmp.html?v="+Math.random());
await new Promise(r=>setTimeout(r,600));
await p.screenshot({path:"/workspaces/lucid-winds/store/ftw-play/feature-graphic-1024x500.png"});
await br.close();
console.log("written");
