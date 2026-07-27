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
        'min-height:44px;border-radius:22px;border:1px solid rgba(200,168,75,.4);background:rgba(13,16,12,.86);' +
        'color:#e8dcc8;font-family:"DM Mono",monospace;font-size:.66rem;padding:0 14px;cursor:pointer;' +
        'box-shadow:0 6px 20px rgba(0,0,0,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
        'touch-action:none;user-select:none;-webkit-user-select:none;}' +
      /* Jessie/Stephen 7/19 + 7/26: the bug must be clearable — drag it
         anywhere, or tap the x to hide it for the rest of the day. Own class
         (NOT .lwfb-x — that is the form's close button; sharing the class made
         the two rule sets fight and broke both). 48px tap zone hung off the
         fab's top-left corner, small visible dot inside it. */
      '.lwfb-fab-x{position:absolute;top:-34px;left:-34px;width:48px;height:48px;' +
        'display:flex;align-items:center;justify-content:center;background:transparent;cursor:pointer;}' +
      '.lwfb-fab-x span{display:block;width:24px;height:24px;border-radius:50%;' +
        'background:rgba(13,16,12,.95);border:1px solid rgba(200,168,75,.5);color:#8a9178;' +
        'font-size:13px;line-height:22px;text-align:center;font-family:sans-serif;}';
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
    var b = document.createElement('button');
    b.type = 'button';
    b.className = (opts && opts.className) || 'lwfb-fab';
    b.textContent = (opts && opts.label) || '🐞 Feedback';
    b.addEventListener('click', function () { open(opts || {}); });
    return b;
  }

  // Day bucket for the fab dismissal: hidden for the rest of the local day,
  // back tomorrow. Feedback matters; permanent removal is too strong.
  function dayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
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
      }
      drag = null;
    });
    document.body.appendChild(b);
  }

  window.LW_Feedback = { open: open, button: button, mountFab: mountFab, close: close };
})();
