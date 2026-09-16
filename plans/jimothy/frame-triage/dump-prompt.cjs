const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async () => {
  const [id, idx] = [process.argv[2], +process.argv[3]];
  const b = await puppeteer.launch({args: ['--no-sandbox']}); const p = await b.newPage();
  await p.goto('http://127.0.0.1:8917/local.html', {waitUntil: 'networkidle0'});
  const out = await p.evaluate((id, idx) => { document.querySelector('#c-' + id + ' .tile:nth-child(' + idx + ')').click(); document.getElementById('vMark').click(); return document.getElementById('kPrompt').value; }, id, idx);
  console.log(out); await b.close();
})();
