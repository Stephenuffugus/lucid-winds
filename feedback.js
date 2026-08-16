/* ════════════════════════════════════════════════════════════════════
   feedback.js — shared "Found a bug or have an idea?" form
   ────────────────────────────────────────────────────────────────────
   ONE definition, loaded by the app (index.html), the portal, and the
   game shells (play/shell.js). Opens a small templated form and POSTs it
   to /api/feedback.php, which emails the studio's designated address.
   No framework, no Firebase — self-contained styling so it looks the same
   on every surface. ES5 for the single-file app's sake.

   API:
     window.LW_Feedback.open({game, surface, account, uid, version})
     window.LW_Feedback.button({game, surface, label})  -> <button> el
   Context can also be supplied globally via window.LW_FB_CONTEXT.
   Endpoint override: window.LW_FB_ENDPOINT. Token: window.LW_FB_TOKEN.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.LW_Feedback) return;

  // 2026-07-27: reports now go to the swFeedback cloud function (Firestore
  // queue + instant Discord ping) instead of /api/feedback.php — the PHP
  // mail() route delivered to an inbox nobody watches, so player reports
  // from the classics were effectively vanishing.
  var ENDPOINT = window.LW_FB_ENDPOINT || 'https://us-central1-focus-grove-fffa8.cloudfunctions.net/swFeedback';

  function ctx(opts) {
    var g = window.LW_FB_CONTEXT || {};
    opts = opts || {};
    return {
      game:    opts.game    != null ? opts.game    : (g.game    || ''),
      surface: opts.surface != null ? opts.surface : (g.surface || 'app'),
      account: opts.account != null ? opts.account : (g.account || ''),
      uid:     opts.uid     != null ? opts.uid     : (g.uid     || ''),
      version: opts.version != null ? opts.version : (g.version || window.LW_VERSION || '')
    };
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var injected = false;
  function injectCSS() {
    if (injected) return; injected = true;
    var css =
      '.lwfb-bg{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
        'background:rgba(5,8,4,0.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:1rem;' +
        'font-family:"DM Mono",ui-monospace,monospace;animation:lwfbIn .2s ease;}' +
      '@keyframes lwfbIn{from{opacity:0}to{opacity:1}}' +
      '.lwfb-card{max-width:380px;width:100%;max-height:88vh;overflow-y:auto;background:linear-gradient(180deg,#161c12,#0d100c);' +
        'border:1.5px solid rgba(200,168,75,0.35);border-radius:14px;padding:1.1rem 1rem 1rem;color:#e8dcc8;box-shadow:0 18px 54px rgba(0,0,0,0.7);}' +
      '.lwfb-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:.7rem;}' +
      '.lwfb-ti{font-family:"Bebas Neue",sans-serif;font-size:1.05rem;letter-spacing:.06em;color:#c8a84b;line-height:1.1;}' +
      '.lwfb-x{flex:0 0 auto;min-width:48px;min-height:48px;border-radius:10px;border:1px solid rgba(122,179,86,.3);' +
        'background:rgba(13,16,12,.5);color:#e8dcc8;font-size:1rem;cursor:pointer;}' +
      '.lwfb-row{margin:.55rem 0;}' +
      '.lwfb-lab{display:block;font-size:.62rem;color:#8a9178;letter-spacing:.04em;margin-bottom:.25rem;}' +
      '.lwfb-seg{display:flex;gap:8px;}' +
      '.lwfb-seg button{flex:1;min-height:48px;border-radius:10px;border:1px solid rgba(122,179,86,.28);' +
        'background:rgba(42,48,37,.5);color:#e8dcc8;font-family:inherit;font-size:.72rem;cursor:pointer;}' +
      '.lwfb-seg button.on{background:rgba(122,179,86,.32);border-color:rgba(122,179,86,.7);color:#fff;}' +
      '.lwfb-inp,.lwfb-ta{width:100%;box-sizing:border-box;background:rgba(13,16,12,.6);border:1px solid rgba(122,179,86,.25);' +
        'border-radius:10px;color:#e8dcc8;font-family:inherit;font-size:.72rem;padding:.6rem .65rem;}' +
      '.lwfb-ta{min-height:96px;resize:vertical;line-height:1.5;}' +
      '.lwfb-inp:focus,.lwfb-ta:focus{outline:none;border-color:rgba(200,168,75,.6);}' +
      '.lwfb-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}' +
      '.lwfb-go{width:100%;min-height:50px;margin-top:.5rem;border-radius:11px;border:1px solid rgba(200,168,75,.5);' +
        'background:linear-gradient(180deg,rgba(122,179,86,.3),rgba(122,179,86,.18));color:#fff;font-family:"Bebas Neue",sans-serif;' +
        'font-size:.95rem;letter-spacing:.08em;cursor:pointer;}' +
      '.lwfb-go[disabled]{opacity:.5;cursor:default;}' +
      '.lwfb-msg{font-size:.64rem;line-height:1.5;margin-top:.5rem;text-align:center;min-height:1em;}' +
      '.lwfb-msg.err{color:#e0a0a0;} .lwfb-msg.ok{color:#9fd18a;}' +
      '.lwfb-note{font-size:.55rem;color:#8a9178;margin-top:.5rem;line-height:1.5;text-align:center;}' +
      /* Floating launcher button */
      '.lwfb-fab{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147482000;' +
        'min-height:48px;border-radius:24px;border:1px solid rgba(200,168,75,.4);background:rgba(13,16,12,.86);' +
        'color:#e8dcc8;font-family:"DM Mono",monospace;font-size:.72rem;padding:0 14px;cursor:pointer;' +
        'box-shadow:0 6px 20px rgba(0,0,0,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
        'touch-action:none;user-select:none;-webkit-user-select:none;}' +
      /* Jessie/Stephen 7/19 + 7/26: the bug must be clearable — drag it
         anywhere, or tap the x to hide it for the rest of the day. Own class
         (NOT .lwfb-x — that is the form's close button; sharing the class made
         the two rule sets fight and broke both). 48px tap zone hung off the
         fab's top-left corner, small visible dot inside it.

         ⛔ 2026-08-16 — THE CHIP WAS BIGGER THAN IT LOOKED. A 48px tap zone
         hung at -34/-30 put its far corner 34px up and left of a fab that
         reads as a 48px circle: real footprint 82x82 (mini 78x78) behind a
         24px dot. That invisible reach is what landed on Vine Runner's RUN
         button and Sprout Dice's "All Sky Wolf games". The tap zone stays 48px
         (project rule: 48px minimum touch targets, measured rendered), but the
         offset is pulled in to -26 so the zone overlaps the fab's own corner
         instead of hanging free, and the visible dot grows 24->28px. Footprint
         74x74, phantom reach beyond the dot halved (30px -> 14px). One rule for
         both variants now — the mini override is gone, so what the scanner
         below measures is what every surface ships. */
      '.lwfb-fab-x{position:absolute;top:-26px;left:-26px;width:48px;height:48px;' +
        'display:flex;align-items:center;justify-content:center;background:transparent;cursor:pointer;}' +
      '.lwfb-fab-x span{display:block;width:28px;height:28px;border-radius:50%;' +
        'background:rgba(13,16,12,.95);border:1px solid rgba(200,168,75,.5);color:#8a9178;' +
        'font-size:15px;line-height:26px;text-align:center;font-family:sans-serif;}' +
      /* Mini fab for satellites (2026-07-27 QA sweep): the labeled pill sat on
         top of game controls in 7 of 11 games (Inkbound's move arrow, Pop N
         Lock's rotate, shop rows). Satellites get a small translucent circle
         parked above the typical bottom control bar instead. */
      '.lwfb-fab.lwfb-mini{min-height:48px;width:48px;padding:0;border-radius:50%;' +
        'font-size:1.15rem;line-height:48px;text-align:center;opacity:.72;' +
        'bottom:calc(96px + env(safe-area-inset-bottom,0px));}' +
      '.lwfb-fab.lwfb-mini:active{opacity:1;}' +
      /* yielding: a soft fade rather than a pop, so a player who is watching
         the corner sees it step aside instead of blinking out */
      '.lwfb-fab{transition:opacity .18s ease,left .18s ease,top .18s ease;}' +
      '.lwfb-fab[data-lwfb-yield="1"]{opacity:0;pointer-events:none;}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  }

  function close() {
    var bg = document.getElementById('lwfb-bg');
    if (bg && bg.parentNode) bg.parentNode.removeChild(bg);
  }

  function open(opts) {
    injectCSS();
    close();
    var c = ctx(opts);
    var state = { type: 'bug' };

    var bg = document.createElement('div');
    bg.id = 'lwfb-bg'; bg.className = 'lwfb-bg';
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });

    var gameLine = c.game
      ? '<div class="lwfb-row"><label class="lwfb-lab">Game</label>' +
        '<input class="lwfb-inp" id="lwfb-game" value="' + esc(c.game) + '"></div>'
      : '<div class="lwfb-row"><label class="lwfb-lab">Game or screen (optional)</label>' +
        '<input class="lwfb-inp" id="lwfb-game" placeholder="e.g. Glyph Forge, Greenhouse..."></div>';

    bg.innerHTML =
      '<div class="lwfb-card" onclick="event.stopPropagation()">' +
        '<div class="lwfb-hd"><div class="lwfb-ti">Found a bug or have an idea?</div>' +
          '<button class="lwfb-x" id="lwfb-x" aria-label="Close">✕</button></div>' +
        '<div class="lwfb-row"><div class="lwfb-seg" id="lwfb-seg">' +
          '<button data-t="bug" class="on">🐞 Bug</button>' +
          '<button data-t="improvement">💡 Improvement</button>' +
        '</div></div>' +
        gameLine +
        '<div class="lwfb-row"><label class="lwfb-lab">Your name (optional)</label>' +
          '<input class="lwfb-inp" id="lwfb-name" placeholder="What should we call you?"></div>' +
        '<div class="lwfb-row"><label class="lwfb-lab" id="lwfb-dlab">What happened?</label>' +
          '<textarea class="lwfb-ta" id="lwfb-details" placeholder="Tell us what you saw, or the idea you have..."></textarea></div>' +
        '<div class="lwfb-row"><label class="lwfb-lab">Email (optional — so we can tell you when it’s fixed)</label>' +
          '<input class="lwfb-inp" id="lwfb-contact" inputmode="email" placeholder="you@example.com"></div>' +
        '<input class="lwfb-hp" id="lwfb-website" tabindex="-1" autocomplete="off" aria-hidden="true" placeholder="Leave this empty">' +
        '<button class="lwfb-go" id="lwfb-go">Send it</button>' +
        '<div class="lwfb-msg" id="lwfb-msg"></div>' +
        '<div class="lwfb-note">Helpful notes can earn a Contributor title and exclusive cosmetics. Thank you for making it better.</div>' +
      '</div>';

    document.body.appendChild(bg);

    /* ⛔⛔ 2026-08-02 — THE FORM COULD NOT BE TYPED IN, AND IT COST US REPORTS.
       A player: "i am not able to type 's' space bar doesnt work ... this
       feedback was first typed on notepad and then pasted on this form! I am not
       even able to type my email address" — their address contains s, a and d.
       Cause: games bind a GLOBAL key handler and preventDefault() their controls
       without checking whether the player is typing. vinewinder:642 does exactly
       that for Space and W/A/S/D. Measured across the fleet: 39 of the 42 games
       that listen for keys are unguarded, so this form was broken on most of the
       arcade — and a broken feedback form silently costs you every OTHER bug
       report. This player only got through by pasting from Notepad; nearly
       everyone else would just leave.
       The fix lives HERE rather than in 39 games: a listener on the panel itself
       runs in the TARGET phase, before any window or document handler, so
       stopPropagation() keeps the keystroke from ever reaching the game. It does
       NOT preventDefault, so the character still types normally. Verified there
       are zero capture-phase key listeners in the fleet, which is the only thing
       that could out-run this. */
    ['keydown', 'keyup', 'keypress'].forEach(function (evt) {
      bg.addEventListener(evt, function (e) {
        var t = e.target;
        if (!t) return;
        var tag = (t.tagName || '').toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) {
          e.stopPropagation();
        }
      });
    });

    var seg = document.getElementById('lwfb-seg');
    var dlab = document.getElementById('lwfb-dlab');
    seg.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      state.type = b.getAttribute('data-t');
      [].forEach.call(seg.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      dlab.textContent = state.type === 'improvement' ? "What's your idea?" : 'What happened?';
    });

    document.getElementById('lwfb-x').onclick = close;

    var go = document.getElementById('lwfb-go');
    var msg = document.getElementById('lwfb-msg');
    go.onclick = function () {
      var details = (document.getElementById('lwfb-details').value || '').trim();
      if (details.length < 6) {
        msg.className = 'lwfb-msg err';
        msg.textContent = 'Please add a little more detail so we can act on it.';
        return;
      }
      if (document.getElementById('lwfb-website').value) { close(); return; } // honeypot
      go.disabled = true; msg.className = 'lwfb-msg'; msg.textContent = 'Sending...';

      // swFeedback wants {game, msg} — fold the form into one readable msg
      var _name = (document.getElementById('lwfb-name').value || '').trim();
      var _contact = (document.getElementById('lwfb-contact').value || '').trim();
      var _game = (document.getElementById('lwfb-game').value || '').trim();
      var payload = {
        game: _game || c.surface || 'unknown',
        msg: '[' + state.type + '] ' + details +
          (_name ? ' — from ' + _name : '') +
          (_contact ? ' <' + _contact + '>' : '') +
          (c.version ? ' (v' + c.version + ')' : '') +
          (c.surface ? ' [' + c.surface + ']' : '')
      };

      var done = false;
      function fail(t) {
        if (done) return; done = true;
        go.disabled = false;
        msg.className = 'lwfb-msg err';
        msg.textContent = t || "Couldn't send that just now. Please try again.";
      }
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', ENDPOINT, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 15000;
        xhr.ontimeout = function () { fail('That timed out. Please try again.'); };
        xhr.onerror = function () { fail(); };
        xhr.onload = function () {
          if (done) return;
          var ok = false, errt = '';
          try { var r = JSON.parse(xhr.responseText || '{}'); ok = !!r.ok; errt = r.error || ''; } catch (e) {}
          if (xhr.status >= 200 && xhr.status < 300 && ok) {
            done = true;
            msg.className = 'lwfb-msg ok';
            msg.textContent = 'Got it — thank you! 🌱';
            setTimeout(close, 1400);
          } else {
            fail(errt);
          }
        };
        xhr.send(JSON.stringify(payload));
      } catch (e) { fail(); }
    };

    setTimeout(function () { var d = document.getElementById('lwfb-details'); if (d) d.focus(); }, 60);
  }

  function button(opts) {
    injectCSS();
    var mini = opts && (opts.mini || opts.surface === 'satellite');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = (opts && opts.className) || (mini ? 'lwfb-fab lwfb-mini' : 'lwfb-fab');
    b.textContent = (opts && opts.label) || (mini ? '🐞' : '🐞 Feedback');
    b.setAttribute('aria-label', 'Report a bug or send feedback');
    b.addEventListener('click', function () { open(opts || {}); });
    return b;
  }

  // Day bucket for the fab dismissal: hidden for the rest of the local day,
  // back tomorrow. Feedback matters; permanent removal is too strong.
  function dayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  /* ══════════════════════════════════════════════════════════════════════
     FAB YIELD — 2026-08-16, fleet-wide, one place.
     ──────────────────────────────────────────────────────────────────────
     THE DEFECT (seen in screenshots, not theorised): the fab is fixed to the
     bottom-right gutter at z-index 2147482000 — two billion, nothing in a game
     can out-stack it — and the recurring shape across the arcade is a how-to-
     play / title sheet whose PRIMARY button sits at the bottom of the screen,
     exactly where the fab lives. On Vine Runner both chips sat on top of RUN
     and the game's own exit was underneath, invisible. On Sprout Dice it sat on
     "All Sky Wolf games". `node satellites/_exit_audit.mjs --fab` lists nine
     carded games that mount the fab AND own a full-screen sheet under it.

     Vine Runner had already patched it locally with
        body.vr-how-open .lwfb-fab{display:none!important}
     which is the right behaviour and the wrong home — it needs the game to know
     about the fab. Nine games would need nine of those, and game number ten
     would ship with the bug. So the fab learns to detect it instead.

     HOW IT DECIDES (no game-side cooperation, no selector list):
       Hit-test 5 points inside the fab's own footprint with
       document.elementsFromPoint. That one primitive answers, for free and
       correctly, everything a hand-rolled scan gets wrong: display:none,
       opacity:0, pointer-events:none, z-order, transforms and scroll position
       are all the browser's answer, not ours. It yields when either:
         (a) CONTROL — something tappable is under the footprint (button, a,
             input, [role=button], onclick, a .btn-ish class, or a small element
             with cursor:pointer). This is the defect stated exactly: the fab is
             eating a tap the player meant for the game.
         (b) COVER — an element under the footprint covers most of the viewport,
             is visible, and is LAYERED (something large that is not its own
             ancestor is painted beneath it). That layering test is what keeps a
             full-screen game wrapper or canvas from reading as a modal; without
             it the fab would hide itself on every canvas game forever.

     WHAT IT DOES: parks, it does not vanish. It walks a list of anchors and
     takes the first one with no control under it (top-left first — close ✕ is
     usually top-right and primary buttons bottom-centre). Only if EVERY anchor
     is blocked does it fade out, and even then a hard 20s ceiling brings it
     back. Two consecutive clear scans return it to exactly where it was,
     including a position the player dragged it to.

     WHAT IT COSTS: one self-rescheduling timeout — 600ms after input, 2s idle,
     nothing at all while the tab is hidden or the form is open — doing at most
     5 hit tests. No MutationObserver (a game that mutates its HUD every frame
     would make that a storm), no per-frame layout reads, no document-wide
     querySelectorAll (that would scale with page size; this does not).

     WHAT IT CANNOT SEE: controls PAINTED ON A CANVAS. There is no DOM node to
     hit-test, so a canvas-drawn button under the fab is invisible to this and
     always will be. Rule (b) catches those cases only when the canvas sits
     under a layered DOM sheet.

     HOW IT FAILS: open. Every path is wrapped; any throw restores the fab
     immediately, and three throws disable the watcher for good, leaving the
     exact behaviour this file had yesterday. `window.LW_FB_NO_YIELD = true`
     turns it off outright.
     ══════════════════════════════════════════════════════════════════════ */

  var FY = {
    ACTIVE_MS:   600,    // scan cadence just after input (a sheet opens on a tap)
    IDLE_MS:    2000,    // scan cadence when nothing has happened
    ACTIVE_FOR: 4000,    // how long an input keeps us in the fast cadence
    CLEAR_STREAK:  2,    // consecutive clear scans before coming home (anti-flicker)
    HIDDEN_MAX_MS: 20000,// hard ceiling on being invisible. Non-negotiable.
    ERR_MAX:       3,    // throws before the watcher retires itself
    PAD:           6,    // probe inset from the footprint edge
    MARGIN:       12,
    TOP_MARGIN:   24,    // notch/status bar room for the top anchors
    COVER_W:    0.70,    // "covers most of the viewport": >=70% wide,
    COVER_H:    0.50,    //   >=50% tall,
    COVER_A:    0.55,    //   >=55% of the viewport's area
    UNDER_A:    0.25,    // "there is real content beneath it": >=25% of area
    STACK_MAX:    14     // how far down a hit-test stack we bother to look
  };

  // Parking spots, in preference order. Close buttons live top-right and
  // primary buttons live bottom-centre, so the top-left corner is the least
  // contested real estate on a sheet. Each returns the union footprint's
  // top-left in viewport px.
  var FY_ANCHORS = [
    { id: 'top-left',     x: function (vw, vh, w, h) { return FY.MARGIN; },
                          y: function (vw, vh, w, h) { return FY.TOP_MARGIN; } },
    { id: 'mid-left',     x: function (vw, vh, w, h) { return FY.MARGIN; },
                          y: function (vw, vh, w, h) { return Math.round((vh - h) / 2); } },
    { id: 'mid-right',    x: function (vw, vh, w, h) { return vw - w - FY.MARGIN; },
                          y: function (vw, vh, w, h) { return Math.round((vh - h) / 2); } },
    { id: 'top-right',    x: function (vw, vh, w, h) { return vw - w - FY.MARGIN; },
                          y: function (vw, vh, w, h) { return FY.TOP_MARGIN; } },
    { id: 'bottom-left',  x: function (vw, vh, w, h) { return FY.MARGIN; },
                          y: function (vw, vh, w, h) { return vh - h - FY.MARGIN; } }
  ];

  var watch = null;   // one fab per page, so one watcher

  function fyCS(el) {
    try { return window.getComputedStyle(el) || {}; } catch (e) { return {}; }
  }
  function fyRect(el) {
    try { var r = el.getBoundingClientRect(); return r || null; } catch (e) { return null; }
  }
  function fyContains(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.contains) { try { return !!a.contains(b); } catch (e) {} }
    var n = b, hops = 0;
    while (n && hops++ < 60) { if (n === a) return true; n = n.parentNode; }
    return false;
  }
  function fyCls(el) {
    var cn = el && el.className;
    return typeof cn === 'string' ? cn : (cn && cn.baseVal) || '';
  }
  // Ours = the fab, its badge, or the feedback panel. Never yield to ourselves.
  function fyIsOurs(el, fab) {
    var n = el, hops = 0;
    while (n && hops++ < 40) {
      if (n === fab) return true;
      if (n.id === 'lwfb-bg') return true;
      if ((' ' + fyCls(n) + ' ').indexOf(' lwfb-') > -1) return true;
      n = n.parentNode;
    }
    return false;
  }
  function fyVisible(el, r) {
    var cs = fyCS(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (cs.pointerEvents === 'none') return false;   // cannot take a tap = not in our way
    var o = parseFloat(cs.opacity);
    if (!isNaN(o) && o <= 0.05) return false;
    r = r || fyRect(el);
    return !!(r && r.width > 0 && r.height > 0);
  }
  function fyIsControl(el, vw) {
    var tag = (el.tagName || '').toUpperCase();
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' ||
        tag === 'TEXTAREA' || tag === 'LABEL' || tag === 'SUMMARY') return true;
    var role = null;
    try { role = el.getAttribute && el.getAttribute('role'); } catch (e) {}
    if (role && /^(button|link|menuitem|menuitemcheckbox|tab|checkbox|switch|option|radio)$/.test(role)) return true;
    var oc = null;
    try { oc = (el.getAttribute && el.getAttribute('onclick')) || el.onclick; } catch (e) {}
    if (oc) return true;
    if (/(^|[\s_-])(btn|button|cta|tap|key|pad|chip|tile)([\s_-]|$)/i.test(fyCls(el))) return true;
    // A div with cursor:pointer is a button in every game on this fleet. Size
    // guard: a full-width container with a pointer cursor is a background, and
    // treating it as a control would hide the fab on the whole page.
    if (fyCS(el).cursor === 'pointer') {
      var r = fyRect(el);
      if (r && r.width <= vw * 0.9) return true;
    }
    return false;
  }
  // The elements under a point, topmost first, minus our own. null = the
  // browser gives us no hit testing, so detection is not available at all.
  function fyStackAt(x, y, fab) {
    var list = null;
    if (typeof document.elementsFromPoint === 'function') {
      list = document.elementsFromPoint(x, y);
    } else if (typeof document.elementFromPoint === 'function') {
      // Single-hit fallback: step the fab out of the hit test for one call.
      var prev = fab.style.pointerEvents;
      fab.style.pointerEvents = 'none';
      var one = document.elementFromPoint(x, y);
      fab.style.pointerEvents = prev;
      list = one ? [one] : [];
    } else {
      return null;
    }
    if (!list) return [];
    var out = [];
    for (var i = 0; i < list.length && out.length < FY.STACK_MAX; i++) {
      if (list[i] && !fyIsOurs(list[i], fab)) out.push(list[i]);
    }
    return out;
  }
  function fyProbePoints(r, vw, vh) {
    var p = FY.PAD, pts = [
      [r.left + p, r.top + p], [r.right - p, r.top + p],
      [r.left + p, r.bottom - p], [r.right - p, r.bottom - p],
      [(r.left + r.right) / 2, (r.top + r.bottom) / 2]
    ], out = [], i;
    for (i = 0; i < pts.length; i++) {
      var x = Math.round(Math.min(vw - 1, Math.max(0, pts[i][0])));
      var y = Math.round(Math.min(vh - 1, Math.max(0, pts[i][1])));
      out.push([x, y]);
    }
    return out;
  }
  // Is `rect` sitting on something the player needs? mode 'control' tests only
  // rule (a) — used when choosing a parking spot, because on a full-screen
  // sheet rule (b) is true everywhere and would leave nowhere to park.
  function fyBlockedAt(rect, fab, vw, vh, mode) {
    var pts = fyProbePoints(rect, vw, vh), i, j;
    var res = { blocked: false, why: null, cover: null, probes: 0, unavailable: false };
    for (i = 0; i < pts.length; i++) {
      var stack = fyStackAt(pts[i][0], pts[i][1], fab);
      res.probes++;
      if (stack === null) { res.unavailable = true; return res; }
      var cover = null, coverIdx = -1;
      for (j = 0; j < stack.length; j++) {
        var el = stack[j], tag = (el.tagName || '').toUpperCase();
        if (tag === 'BODY' || tag === 'HTML') continue;
        var r = fyRect(el);
        if (!r) continue;
        if (!fyVisible(el, r)) continue;
        if (fyIsControl(el, vw)) { res.blocked = true; res.why = 'control'; return res; }
        if (mode === 'control') continue;
        if (cover) continue;
        if (tag === 'CANVAS' || tag === 'VIDEO' || tag === 'IMG' || tag === 'SVG') continue;
        if (r.width >= vw * FY.COVER_W && r.height >= vh * FY.COVER_H &&
            (r.width * r.height) >= vw * vh * FY.COVER_A) { cover = el; coverIdx = j; }
      }
      // A cover only counts as an overlay if it is LAYERED over other content.
      // Without this a full-bleed game wrapper reads as a modal and the fab
      // hides itself for the whole session.
      if (cover) {
        for (j = coverIdx + 1; j < stack.length; j++) {
          var u = stack[j], utag = (u.tagName || '').toUpperCase();
          if (utag === 'BODY' || utag === 'HTML') continue;
          if (fyContains(u, cover) || fyContains(cover, u)) continue;
          var ur = fyRect(u);
          if (ur && (ur.width * ur.height) >= vw * vh * FY.UNDER_A) {
            res.blocked = true; res.why = 'cover'; res.cover = cover; return res;
          }
        }
      }
    }
    return res;
  }

  /* ---- fab state: home / parked / hidden ---------------------------------
     Every one of these is reversible, and `fyGoHome` is reachable from the
     clear branch, the error handler AND the 20s ceiling. There is no path that
     hides the fab and forgets about it. */
  function fyMeasure(w) {
    var fr = fyRect(w.el);
    if (!fr) return null;
    var u = { left: fr.left, top: fr.top, right: fr.right, bottom: fr.bottom };
    if (w.badge) {
      var br = fyRect(w.badge);
      if (br && br.width > 0) {
        if (br.left < u.left) u.left = br.left;
        if (br.top < u.top) u.top = br.top;
        if (br.right > u.right) u.right = br.right;
        if (br.bottom > u.bottom) u.bottom = br.bottom;
      }
    }
    u.width = u.right - u.left; u.height = u.bottom - u.top;
    u.offX = fr.left - u.left; u.offY = fr.top - u.top;   // badge overhang
    return u;
  }
  function fySnapshot(el) {
    return { left: el.style.left, top: el.style.top, right: el.style.right, bottom: el.style.bottom };
  }
  function fyGoHome(w) {
    if (!w || !w.el) return;
    var s = w.home || {};
    w.el.style.left = s.left || ''; w.el.style.top = s.top || '';
    w.el.style.right = s.right || ''; w.el.style.bottom = s.bottom || '';
    if (w.el.removeAttribute) w.el.removeAttribute('data-lwfb-yield');
    w.state = 'home'; w.hiddenAt = 0; w.anchor = null;
  }
  function fyPark(w, anchor, vw, vh, size) {
    var x = anchor.x(vw, vh, size.width, size.height);
    var y = anchor.y(vw, vh, size.width, size.height);
    w.el.style.left = Math.round(x + size.offX) + 'px';
    w.el.style.top = Math.round(y + size.offY) + 'px';
    w.el.style.right = 'auto'; w.el.style.bottom = 'auto';
    if (w.el.removeAttribute) w.el.removeAttribute('data-lwfb-yield');
    w.state = 'parked'; w.anchor = anchor.id; w.hiddenAt = 0;
  }
  function fyFade(w) {
    // Not display:none — the box has to stay measurable so the next scan can
    // still ask "is home clear yet" without guessing at geometry.
    if (w.el.setAttribute) w.el.setAttribute('data-lwfb-yield', '1');
    if (w.state !== 'hidden') w.hiddenAt = Date.now();
    w.state = 'hidden'; w.anchor = null;
  }
  function fyYield(w, vw, vh) {
    var size = w.size;
    if (!size || !size.width) { fyFade(w); return; }
    for (var i = 0; i < FY_ANCHORS.length; i++) {
      var a = FY_ANCHORS[i];
      var x = a.x(vw, vh, size.width, size.height), y = a.y(vw, vh, size.width, size.height);
      var cand = { left: x, top: y, right: x + size.width, bottom: y + size.height,
                   width: size.width, height: size.height };
      // Don't "move" to where we already are — that spot is why we are yielding.
      if (w.homeRect && Math.abs(cand.left - w.homeRect.left) < 8 &&
          Math.abs(cand.top - w.homeRect.top) < 8) continue;
      var b = fyBlockedAt(cand, w.el, vw, vh, 'control');
      if (b.unavailable) { fyFade(w); return; }
      if (!b.blocked) { fyPark(w, a, vw, vh, size); return; }
    }
    fyFade(w);   // every anchor is over a control — go quiet, but see the ceiling
  }

  function fyScan() {
    var w = watch;
    if (!w || w.off || !w.el || !w.el.parentNode) return { skip: 'no-fab' };
    if (document.getElementById && document.getElementById('lwfb-bg')) return { skip: 'form-open' };
    if (document.hidden === true) return { skip: 'doc-hidden' };
    if (w.dragging) return { skip: 'dragging' };
    var vw = window.innerWidth || 0, vh = window.innerHeight || 0;
    if (!vw || !vh) return { skip: 'no-viewport' };

    if (w.state === 'home') {
      var m = fyMeasure(w);
      if (!m || !m.width) return { skip: 'unmeasurable' };
      w.size = m; w.homeRect = m;
    }
    if (!w.homeRect) return { skip: 'unmeasurable' };

    var home = fyBlockedAt(w.homeRect, w.el, vw, vh, 'full');
    if (home.unavailable) {           // no hit testing on this browser at all
      fyGoHome(w); w.off = true;
      return { skip: 'no-hit-testing' };
    }

    if (!home.blocked) {
      w.clearRun++;
      if (w.state !== 'home' && w.clearRun >= FY.CLEAR_STREAK) fyGoHome(w);
      return { blocked: false, state: w.state, probes: home.probes };
    }

    w.clearRun = 0;
    if (w.state === 'home') {
      fyYield(w, vw, vh);
    } else if (w.state === 'parked') {
      var here = fyRect(w.el);
      if (here) {
        var cur = { left: here.left - w.size.offX, top: here.top - w.size.offY,
                    right: here.left - w.size.offX + w.size.width,
                    bottom: here.top - w.size.offY + w.size.height,
                    width: w.size.width, height: w.size.height };
        var b2 = fyBlockedAt(cur, w.el, vw, vh, 'control');
        if (b2.blocked && !b2.unavailable) fyYield(w, vw, vh);
      }
    } else if (w.state === 'hidden') {
      // ⛔ THE CEILING. Nothing in this file may leave the fab invisible longer
      // than this. If a page really is wall-to-wall controls we hand the player
      // back yesterday's behaviour — a fab sitting on something — because a fab
      // in the way still reports bugs and a fab that is gone reports nothing.
      if (w.hiddenAt && (Date.now() - w.hiddenAt) >= FY.HIDDEN_MAX_MS) {
        fyGoHome(w); w.off = true; w.forced = true;
      } else {
        fyYield(w, vw, vh);   // an anchor may have freed up
      }
    }
    return { blocked: true, why: home.why, state: w.state, anchor: w.anchor, probes: home.probes };
  }

  function fyOnError(e) {
    var w = watch;
    if (!w) return;
    w.errRun = (w.errRun || 0) + 1;
    w.lastError = (e && e.message) || String(e);
    try { fyGoHome(w); } catch (e2) {}   // visible first, always
    if (w.errRun >= FY.ERR_MAX) {
      w.off = true;
      if (w.timer) { try { clearTimeout(w.timer); } catch (e3) {} w.timer = null; }
    }
  }
  function fyTick() {
    var w = watch;
    if (!w) return;
    w.timer = null;
    try { w.last = fyScan(); w.errRun = 0; } catch (e) { fyOnError(e); }
    fySchedule();
  }
  function fySchedule() {
    var w = watch;
    if (!w || w.off || w.timer) return;
    var delay = (Date.now() < (w.activeUntil || 0)) ? FY.ACTIVE_MS : FY.IDLE_MS;
    try { w.timer = setTimeout(fyTick, delay); } catch (e) {}
  }
  function fyBump(ev) {
    var w = watch;
    if (!w || w.off) return;
    // A resize invalidates the geometry we parked against, and homeRect was
    // measured in the old viewport. Come home first, re-measure on the next
    // scan, yield again if it is still blocked.
    if (ev && (ev.type === 'resize' || ev.type === 'orientationchange')) {
      try { if (w.state !== 'home') { fyGoHome(w); w.homeRect = null; w.clearRun = 0; } } catch (e) {}
    }
    var now = Date.now();
    w.activeUntil = now + FY.ACTIVE_FOR;
    if (now - (w.lastBump || 0) < 120) return;   // one reschedule per burst
    w.lastBump = now;
    if (w.timer) { try { clearTimeout(w.timer); } catch (e) {} w.timer = null; }
    try { w.timer = setTimeout(fyTick, 90); } catch (e) {}
  }
  function fyStartWatch(el, badge) {
    if (window.LW_FB_NO_YIELD === true) return null;
    watch = { el: el, badge: badge, state: 'home', home: fySnapshot(el),
              size: null, homeRect: null, clearRun: 0, hiddenAt: 0, errRun: 0,
              off: false, timer: null, activeUntil: Date.now() + FY.ACTIVE_FOR,
              lastBump: 0, dragging: false, anchor: null, forced: false, last: null };
    // 'scroll' matters as much as 'pointerdown'. Bramblewick (2026-08-16, shot
    // on screen) has no overlay at all — an ordinary "Reduced motion" toggle in
    // a long settings list scrolls INTO the bottom-right corner and lands under
    // the fab. Nothing opens, nothing is clicked; the page just moves. Capture
    // phase so scrolls inside a nested scroller are heard too. fyBump only
    // stamps a time and reschedules at most once per 120ms, so a flung list
    // costs a handful of timestamp writes, not a scan per frame.
    var evts = ['pointerdown', 'pointerup', 'keydown', 'scroll', 'wheel', 'touchmove',
                'resize', 'orientationchange'];
    for (var i = 0; i < evts.length; i++) {
      try { window.addEventListener(evts[i], fyBump, { capture: true, passive: true }); }
      catch (e) { try { window.addEventListener(evts[i], fyBump, true); } catch (e2) {} }
    }
    try { document.addEventListener('visibilitychange', fyBump, false); } catch (e) {}
    fySchedule();
    return watch;
  }

  function mountFab(opts) {
    if (document.querySelector('.lwfb-fab')) return;
    // Respect a dismissal (Stephen 7/19 + 7/26: full-screen players must be
    // able to clear the button). Hidden until tomorrow, then it returns.
    try { if (localStorage.getItem('lwfb_hidden_day') === dayKey()) return; } catch (e) {}
    var b = button(opts);
    // x badge — one tap hides the fab for the rest of the day
    var x = document.createElement('span');
    x.className = 'lwfb-fab-x';
    x.setAttribute('role', 'button');
    x.setAttribute('aria-label', 'Hide feedback button for the rest of today');
    var dot = document.createElement('span');
    dot.textContent = '\u00d7';
    x.appendChild(dot);
    x.addEventListener('click', function (ev) {
      ev.stopPropagation(); ev.preventDefault();
      try { localStorage.setItem('lwfb_hidden_day', dayKey()); } catch (e) {}
      if (b.parentNode) b.parentNode.removeChild(b);
      if (watch) { if (watch.timer) { try { clearTimeout(watch.timer); } catch (e2) {} } watch.off = true; watch.timer = null; }
    });
    b.appendChild(x);
    // drag anywhere: past a small slop the tap becomes a move; position is
    // remembered for the session so it stays where the player parked it
    var drag = null;
    try {
      var saved = sessionStorage.getItem('lwfb_pos');
      if (saved) { var sp = JSON.parse(saved); b.style.left = sp.l + 'px'; b.style.top = sp.t + 'px'; b.style.right = 'auto'; b.style.bottom = 'auto'; }
    } catch (e) {}
    b.addEventListener('pointerdown', function (ev) {
      drag = { sx: ev.clientX, sy: ev.clientY, moved: false,
               bx: b.getBoundingClientRect().left, by: b.getBoundingClientRect().top };
      if (watch) watch.dragging = true;   // the scanner keeps its hands off mid-drag
    });
    window.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 10) return;
      drag.moved = true;
      var nl = Math.max(4, Math.min(window.innerWidth - b.offsetWidth - 4, drag.bx + dx));
      var nt = Math.max(4, Math.min(window.innerHeight - b.offsetHeight - 4, drag.by + dy));
      b.style.left = nl + 'px'; b.style.top = nt + 'px';
      b.style.right = 'auto'; b.style.bottom = 'auto';
      ev.preventDefault();
    });
    window.addEventListener('pointerup', function () {
      if (!drag) return;
      if (drag.moved) {
        // a drag is not a click — swallow the click that follows
        var stop = function (ce) { ce.stopPropagation(); ce.preventDefault(); b.removeEventListener('click', stop, true); };
        b.addEventListener('click', stop, true);
        try { sessionStorage.setItem('lwfb_pos', JSON.stringify({ l: parseInt(b.style.left) || 0, t: parseInt(b.style.top) || 0 })); } catch (e) {}
        // Where the player parked it IS home now. Yielding still applies, and
        // when the way is clear again it comes back HERE, not to the corner.
        if (watch) { watch.home = fySnapshot(b); watch.state = 'home'; watch.homeRect = null; watch.clearRun = 0; }
      }
      if (watch) watch.dragging = false;
      drag = null;
    });
    document.body.appendChild(b);
    // Start watching only once the fab is in the document — measuring a
    // detached element gives a 0x0 rect and the first scan would be a no-op.
    try { fyStartWatch(b, x); } catch (e) {}
  }

  window.LW_Feedback = {
    open: open, button: button, mountFab: mountFab, close: close,
    /* Test surface for feedback_check.mjs. There is no browser on the build box
       (ten agents, two cores), so the checker runs THIS logic against a stub
       DOM rather than a mirror of it — the rarity-sim lesson: never hand-mirror
       the thing you are verifying. Nothing in the app calls these. */
    _fab: {
      scan: fyScan, tick: fyTick, bump: fyBump, watcher: function () { return watch; },
      state: function () { return watch ? (watch.off ? 'off:' + watch.state : watch.state) : 'unmounted'; },
      blockedAt: fyBlockedAt, isControl: fyIsControl, visible: fyVisible,
      measure: fyMeasure, goHome: fyGoHome, FY: FY, ANCHORS: FY_ANCHORS
    }
  };
})();
