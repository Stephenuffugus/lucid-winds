import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const D = path.dirname(new URL(import.meta.url).pathname);
const T = {'.html':'text/html','.jpg':'image/jpeg','.png':'image/png','.js':'text/javascript'};
http.createServer((q, s) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (u.startsWith('/_blob/')) u = '/test-upload.png';
  if (u === '/') u = '/local.html';
  const f = path.join(D, u);
  if (!f.startsWith(D) || !fs.existsSync(f)) { s.writeHead(404); return s.end('nope'); }
  s.writeHead(200, {'content-type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(s);
}).listen(8917, () => console.log('serving 8917'));
