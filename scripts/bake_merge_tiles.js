// Rasterize the baked 2048 plant SVGs (assets/games/merge/plant-*.svg) to PNGs.
// The SVGs are ~90-140KB with 405 paths + Gaussian blurs each — rendering 16 of
// them live as <img> is what made the board slow. Tiles display at ~110px; we
// bake at 240px (2x-plus retina) with transparent background.
// Usage: node scripts/bake_merge_tiles.js
var puppeteer = require('puppeteer');
var fs = require('fs');
var path = require('path');

var DIR = path.join(__dirname, '..', 'assets', 'games', 'merge');
var VALS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
var SIZE = 240;

(async function () {
  var browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  var page = await browser.newPage();
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
  for (var i = 0; i < VALS.length; i++) {
    var v = VALS[i];
    var svg = fs.readFileSync(path.join(DIR, 'plant-' + v + '.svg'), 'utf8');
    var html = '<!doctype html><body style="margin:0;background:transparent">'
      + '<div style="width:' + SIZE + 'px;height:' + SIZE + 'px;display:flex;align-items:center;justify-content:center">'
      + svg.replace('<svg ', '<svg style="width:100%;height:100%" ')
      + '</div></body>';
    await page.setContent(html, { waitUntil: 'load' });
    await new Promise(function (r) { setTimeout(r, 250); });
    var out = path.join(DIR, 'plant-' + v + '.png');
    await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
    console.log('baked', out, Math.round(fs.statSync(out).size / 1024) + 'KB');
  }
  await browser.close();
})();
