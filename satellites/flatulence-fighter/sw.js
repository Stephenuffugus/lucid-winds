/* Flatulence Fighter service worker (22 Nov 2026, the Play gates): the offline shell. Shape and scars from the number games'
   workers (satellites/brim/sw.js), which the fleet's host law shaped:

   - caches.keys() is origin wide: only ff-shell- caches are ever deleted, or this worker wipes every other game.
   - every fetch settles with a real Response: a network that accepts and never answers is given up on after
     NET_TIMEOUT_MS, for navigations and for anything not yet cached, never left pending (the black screen scar).
   - navigations refetch with cache: 'no-cache', because this host serves day old HTML from its HTTP cache.
   - ⛔ A NAVIGATION IS SAVED UNDER ITS OWN PAGE (the fault the Play queue's first five hit on 13 Nov): the game's page
     (a path ending in / or index.html, whatever its query) is the shell; any other page, privacy.html above all, is
     keyed by its own path and offline is answered from its own entry or the offline page, never from the game's.
   - other origins are never touched (the Sunbeam SDK's Firebase scripts, the music streams): the network has them.
   - SHELL_VERSION moves on every deploy that changes a file below, and so does the ?v= on the registration.
   Every art file the game names (ART_V) is precached, about 4 MB; the store art is not.
*/

const SHELL_VERSION = 'ff-shell-20261122a';
const NET_TIMEOUT_MS = 4000;
const SCOPE = new URL('./', self.location).pathname;   /* only this game's own files are kept as they are fetched; the shared scripts and the music stay the network's */

const SHELL_ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './manifest.webmanifest?v=20261105a',
  './icon-192.png?v=20261105a',
  './icon-512.png?v=20261105a',
  './icon-maskable-512.png?v=20261105a',
  './assets/controls/ability_cough.png?v=20261107a',
  './assets/controls/ability_sip.png?v=20261107a',
  './assets/controls/ability_waft.png?v=20261107a',
  './assets/controls/breath_bar.png?v=20261107a',
  './assets/controls/callout_plate.png?v=20261107a',
  './assets/controls/charge_empty.png?v=20261107a',
  './assets/controls/charge_full.png?v=20261107a',
  './assets/controls/cover_banner.png?v=20261107a',
  './assets/controls/hold_left_held.png?v=20261107a',
  './assets/controls/hold_left_idle.png?v=20261107a',
  './assets/controls/hold_left_tired.png?v=20261107a',
  './assets/controls/hold_right_held.png?v=20261107a',
  './assets/controls/hold_right_idle.png?v=20261107a',
  './assets/controls/hold_right_tired.png?v=20261107a',
  './assets/controls/intertitle_frame.png?v=20261107a',
  './assets/controls/leak_core.png?v=20261107a',
  './assets/controls/posture_dot.png?v=20261107a',
  './assets/controls/posture_track.png?v=20261107a',
  './assets/controls/strain_bar.png?v=20261107a',
  './assets/controls/strike_empty.png?v=20261107a',
  './assets/controls/strike_lit.png?v=20261107a',
  './assets/controls/vent_cover.png?v=20261107a',
  './assets/controls/vent_perfect.png?v=20261107a',
  './assets/controls/vent_unsafe.png?v=20261107a',
  './assets/deck/how_to_play_move.webp?v=20261107a',
  './assets/deck/lesson_line.png?v=20261107a',
  './assets/deck/lesson_line_done.png?v=20261107a',
  './assets/deck/pad_cheek_left_cover.png?v=20261107a',
  './assets/deck/pad_cheek_left_held.png?v=20261107a',
  './assets/deck/pad_cheek_left_idle.png?v=20261107a',
  './assets/deck/pad_cheek_left_lifted.png?v=20261107a',
  './assets/deck/pad_cheek_left_squeak.png?v=20261107a',
  './assets/deck/pad_cheek_right_cover.png?v=20261107a',
  './assets/deck/pad_cheek_right_held.png?v=20261107a',
  './assets/deck/pad_cheek_right_idle.png?v=20261107a',
  './assets/deck/pad_cheek_right_lifted.png?v=20261107a',
  './assets/deck/pad_cheek_right_squeak.png?v=20261107a',
  './assets/deck/pad_finger_left_called.png?v=20261107a',
  './assets/deck/pad_finger_left_done.png?v=20261107a',
  './assets/deck/pad_finger_left_holding.png?v=20261107a',
  './assets/deck/pad_finger_left_idle.png?v=20261107a',
  './assets/deck/pad_finger_left_leave.png?v=20261107a',
  './assets/deck/pad_finger_left_missed.png?v=20261107a',
  './assets/deck/pad_finger_right_called.png?v=20261107a',
  './assets/deck/pad_finger_right_done.png?v=20261107a',
  './assets/deck/pad_finger_right_holding.png?v=20261107a',
  './assets/deck/pad_finger_right_idle.png?v=20261107a',
  './assets/deck/pad_finger_right_leave.png?v=20261107a',
  './assets/deck/pad_finger_right_missed.png?v=20261107a',
  './assets/deck/pad_hand_left_called.png?v=20261107a',
  './assets/deck/pad_hand_left_done.png?v=20261107a',
  './assets/deck/pad_hand_left_holding.png?v=20261107a',
  './assets/deck/pad_hand_left_idle.png?v=20261107a',
  './assets/deck/pad_hand_left_leave.png?v=20261107a',
  './assets/deck/pad_hand_left_missed.png?v=20261107a',
  './assets/deck/pad_hand_right_called.png?v=20261107a',
  './assets/deck/pad_hand_right_done.png?v=20261107a',
  './assets/deck/pad_hand_right_holding.png?v=20261107a',
  './assets/deck/pad_hand_right_idle.png?v=20261107a',
  './assets/deck/pad_hand_right_leave.png?v=20261107a',
  './assets/deck/pad_hand_right_missed.png?v=20261107a',
  './assets/deck/table_card.webp?v=20261107a',
  './assets/onlookers/onlookers_babys_nap_backs.png?v=20261107a',
  './assets/onlookers/onlookers_babys_nap_turned.png?v=20261107a',
  './assets/onlookers/onlookers_confession_backs.png?v=20261107a',
  './assets/onlookers/onlookers_confession_turned.png?v=20261107a',
  './assets/onlookers/onlookers_elevator_backs.png?v=20261107a',
  './assets/onlookers/onlookers_elevator_turned.png?v=20261107a',
  './assets/onlookers/onlookers_first_date_backs.png?v=20261107a',
  './assets/onlookers/onlookers_first_date_turned.png?v=20261107a',
  './assets/onlookers/onlookers_funeral_backs.png?v=20261107a',
  './assets/onlookers/onlookers_funeral_turned.png?v=20261107a',
  './assets/onlookers/onlookers_job_interview_backs.png?v=20261107a',
  './assets/onlookers/onlookers_job_interview_turned.png?v=20261107a',
  './assets/onlookers/onlookers_library_backs.png?v=20261107a',
  './assets/onlookers/onlookers_library_turned.png?v=20261107a',
  './assets/onlookers/onlookers_live_on_air_backs.png?v=20261107a',
  './assets/onlookers/onlookers_live_on_air_turned.png?v=20261107a',
  './assets/onlookers/onlookers_meditation_retreat_backs.png?v=20261107a',
  './assets/onlookers/onlookers_meditation_retreat_turned.png?v=20261107a',
  './assets/onlookers/onlookers_recital_backs.png?v=20261107a',
  './assets/onlookers/onlookers_recital_turned.png?v=20261107a',
  './assets/onlookers/onlookers_silent_yoga_backs.png?v=20261107a',
  './assets/onlookers/onlookers_silent_yoga_turned.png?v=20261107a',
  './assets/onlookers/onlookers_wedding_vows_backs.png?v=20261107a',
  './assets/onlookers/onlookers_wedding_vows_turned.png?v=20261107a',
  './assets/onlookers/prop_dropped_books.png?v=20261107a',
  './assets/onlookers/prop_passing_bus.png?v=20261107a',
  './assets/onlookers/prop_radio_lamp.png?v=20261107a',
  './assets/sharing/result_square.png?v=20261107a',
  './assets/stage/bg_babys_nap.webp?v=20261107a',
  './assets/stage/bg_confession.webp?v=20261107a',
  './assets/stage/bg_elevator.webp?v=20261107a',
  './assets/stage/bg_first_date.webp?v=20261107a',
  './assets/stage/bg_funeral.webp?v=20261107a',
  './assets/stage/bg_game_over_mood.webp?v=20261107a',
  './assets/stage/bg_job_interview.webp?v=20261107a',
  './assets/stage/bg_library.webp?v=20261107a',
  './assets/stage/bg_live_on_air.webp?v=20261107a',
  './assets/stage/bg_meditation_retreat.webp?v=20261107a',
  './assets/stage/bg_menu_mood.webp?v=20261107a',
  './assets/stage/bg_recital.webp?v=20261107a',
  './assets/stage/bg_silent_yoga.webp?v=20261107a',
  './assets/stage/bg_wedding_vows.webp?v=20261107a',
  './assets/stage/card_frame.png?v=20261107a',
  './assets/stage/film_grain_tile.png?v=20261107a',
  './assets/stage/paper_tile.png?v=20261107a',
  './assets/wardrobe/palette_matinee_sepia.png?v=20261107a',
  './assets/wardrobe/palette_midnight_show.png?v=20261107a',
  './assets/wardrobe/palette_silver_screen.png?v=20261107a',
  './assets/wardrobe/palette_technicolor.png?v=20261107a',
  './assets/wardrobe/portrait_bulldog.png?v=20261107a',
  './assets/wardrobe/portrait_everyman.png?v=20261107a',
  './assets/wardrobe/portrait_gentleman.png?v=20261107a',
  './assets/wardrobe/portrait_grandma.png?v=20261107a',
  './assets/wardrobe/portrait_mime.png?v=20261107a',
  './assets/wardrobe/wardrobe_frame.png?v=20261107a'
];

const within = (promise, ms) => Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(null), ms))]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_VERSION)
      .then(cache => Promise.all(SHELL_ASSETS.map(url =>
        within(fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => null), NET_TIMEOUT_MS * 3)
          .then(res => (res && res.ok) ? cache.put(url, res) : null)
          .catch(() => null)
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf('ff-shell-') === 0 && k !== SHELL_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function offlinePage() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#e7e0cb;'
    + 'color:#2b2721;font-family:system-ui,sans-serif;text-align:center;padding:24px"><p>Flatulence Fighter needs one visit with the internet first.</p></body>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.headers.has('range')) return;   /* a media range request is the network's; a cached 200 cannot answer it */

  if (req.mode === 'navigate') {
    const shell = /\/(index\.html)?$/.test(url.pathname) ? './index.html' : url.origin + url.pathname;
    event.respondWith(
      within(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => null), NET_TIMEOUT_MS)
        .then(res => {
          if (res && res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(SHELL_VERSION).then(c => c.put(shell, copy)).catch(() => {});
            return res;
          }
          if (res && res.redirected) return Response.redirect(res.url);
          return caches.match(shell, { ignoreSearch: true }).then(hit => hit || res || offlinePage());
        })
    );
    return;
  }

  /* everything else: the cache first, refreshed behind; a miss waits NET_TIMEOUT_MS at most, then a 504 */
  event.respondWith(
    caches.match(req).then(hit => {
      const network = within(fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic' && url.pathname.indexOf(SCOPE) === 0) {
          const copy = res.clone();
          caches.open(SHELL_VERSION).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => null), NET_TIMEOUT_MS * (hit ? 1 : 3)).then(res => res || new Response('', { status: 504 }));
      return hit || network;
    })
  );
});
