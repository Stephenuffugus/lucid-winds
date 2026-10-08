// The Pi subdomain of one game, served from the same files as its web copy (plans/pi/PI-GAMES-PLAN-OCT08.md §3A).
//
// Route:  tumble.lucidwinds.com/*   →  this Worker  →  https://lucidwinds.com/satellites/tumble/<same path>
// The Worker answers /validation-key.txt itself (Pi's proof of ownership must sit at the root of the app's
// domain, and the root of lucidwinds.com already holds Lucid Winds' key). Everything else is fetched from the
// web copy with the same path and query, so a deploy to the repo reaches the Pi copy at the same moment, and the
// game's own service worker, versioned URLs and caching laws behave exactly as on the web rail.
//
// One Worker serves every Pi game: the hostname picks the folder and the key. To add a game, add a line to GAMES.
// Paste this file into the Cloudflare dashboard (Workers & Pages → Create → Start with Hello World → Edit code),
// deploy, then add the route under the Worker's Settings → Domains & Routes. The DNS line for the hostname must be
// proxied (orange cloud); its address does not matter, the Worker answers first.

// Pi verifies a URL for ONE app only, so a Testnet app and its Mainnet app need two hostnames (the portal says so):
// the Testnet one is <game>-test.lucidwinds.com, same folder, its own key.
const GAMES = {
  'tumble.lucidwinds.com': { path: '/satellites/tumble', key: '20bb78879734f2d10aaa23253b388be691215a31b29ee42c6a5b83c1d169157401ba8428e798814121d430ca0355e010539ec2b6fd137bda7bedc0d7dce1f2de' },
  'tumble-test.lucidwinds.com': { path: '/satellites/tumble', key: '9b42e3c818f7ee86e9f6eb591c885997e8359730bb24e62f6b1478d9834144bf23c4651bbd2e4a28f375b400df1c2452ebf2e603a448d8f5080198e673328d6f' },
  // 'flocktheworld.lucidwinds.com': { path: '/satellites/flock-the-world', key: '...' },
  // 'petri.lucidwinds.com': { path: '/satellites/tiny-world', key: '...' },
};
const ORIGIN = 'https://lucidwinds.com';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const game = GAMES[url.hostname.toLowerCase()];
    if (!game) return new Response('Not here.', { status: 404 });
    if (url.pathname === '/validation-key.txt') {
      return new Response(game.key, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
    }
    // a few things live at the SITE root, not in the game's folder: the songs (data/unlocks.json points at
    // /music/v1/<game>/...) and the fleet's music unlock module. Those pass through to the same path at the origin.
    const rootPass = ['/music/', '/music-unlocks.js'].some((r) => url.pathname.startsWith(r));
    const target = ORIGIN + (rootPass ? url.pathname : game.path + (url.pathname === '/' ? '/' : url.pathname)) + url.search;
    const upstream = await fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });
    // a redirect from the origin would carry the lucidwinds.com address: rewrite it back onto this host
    const headers = new Headers(upstream.headers);
    const loc = headers.get('location');
    if (loc && loc.startsWith(ORIGIN + game.path)) headers.set('location', url.origin + loc.slice((ORIGIN + game.path).length));
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
  },
};
