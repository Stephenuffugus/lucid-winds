// Saved logins must never pop up on the search box: no password or email input on the portal until the sign in dialog opens (his 3rd report, 18 Oct 2026).
// node portal/dev/probe-auth-fields.mjs [base url, default the live portal]
import puppeteer from 'puppeteer';
const BASE = process.argv[2] || 'https://lucidwinds.com/portal/';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
await p.goto(BASE + '?probe=' + Date.now(), { waitUntil: 'load', timeout: 90000 }); await new Promise(r => setTimeout(r, 3000));
const count = () => p.evaluate(() => ({ pw: document.querySelectorAll('input[type=password]').length, em: document.querySelectorAll('input[type=email]').length }));
const fails = []; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails.push(m); };
let c = await count(); ok(c.pw === 0 && c.em === 0, 'at rest: no password or email input on the page ' + JSON.stringify(c));
const opened = await p.evaluate(() => { const s = document.getElementById('signin'); if (!s) return 'no signin button'; s.click(); return getComputedStyle(document.getElementById('auth-bg')).display; });
await new Promise(r => setTimeout(r, 300));
c = await count(); ok(opened === 'flex' && c.pw === 1 && c.em === 1, 'dialog open: both fields present ' + opened + ' ' + JSON.stringify(c));
const r = await p.evaluate(() => { const e = document.getElementById('auth-email').getBoundingClientRect(); return [e.left + e.width / 2, e.top + e.height / 2]; });
await p.touchscreen.tap(r[0], r[1]); await p.keyboard.type('a@b.co', { delay: 30 });
const r2 = await p.evaluate(() => { const e = document.getElementById('auth-password').getBoundingClientRect(); return [e.left + e.width / 2, e.top + e.height / 2]; });
await p.touchscreen.tap(r2[0], r2[1]); await p.keyboard.type('x', { delay: 30 }); await p.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 400));
const v = await p.evaluate(() => ({ em: document.getElementById('auth-email').value, err: document.getElementById('auth-err').textContent }));
ok(v.em === 'a@b.co' && v.err.length > 0, 'typing works and Enter runs sign in (validation answered: "' + v.err + '")');
await p.evaluate(() => document.getElementById('auth-close').click()); await new Promise(r => setTimeout(r, 200));
c = await count(); ok(c.pw === 0 && c.em === 0, 'dialog closed: fields gone again ' + JSON.stringify(c));
await p.evaluate(() => document.getElementById('signin').click()); await new Promise(r => setTimeout(r, 200));
const v2 = await p.evaluate(() => ({ em: document.getElementById('auth-email').value, pw: document.getElementById('auth-password').value, n: document.querySelectorAll('#auth-email').length }));
ok(v2.n === 1 && v2.pw === '', 'reopen: one email field, password cleared ' + JSON.stringify(v2));
ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
await b.close(); console.log(fails.length ? 'AUTH_FIELDS_FAIL' : 'AUTH_FIELDS_PASS'); process.exit(fails.length ? 1 : 0);
