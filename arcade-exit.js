/* Sky Wolf Studios — shared "back to the arcade" exit (2026-07-28)
 * ---------------------------------------------------------------
 * WHY THIS EXISTS
 * Portal cards for /satellites/<slug>/ are NOT opened in the jukebox iframe — the
 * portal's click interceptor only handles /play/<id>.html and github.io links, so
 * every same-origin satellite is a full page navigation away from the arcade.
 * That is fine, except 30 of the 84 satellites had no `SWS_EXIT` and no link to
 * the portal ANYWHERE in their source. Their "◄ Back" buttons all go to their own
 * menus. Verified on the live site: from the portal, tapping Tetroku lands you on
 * /satellites/leaf-fit/ and nothing in that page can take you back. In a browser
 * you can swipe back; in an installed PWA there is no back gesture, so the player
 * is simply stuck.
 *
 * WHAT IT DOES
 * Adds ONE button to the game's title screen — the last place a player looks when
 * they want out — and nothing else. No floating overlay, because the fleet already
 * has one in the corner (the feedback fab) and a second would collide with the
 * on-screen controls games put at the edges.
 *
 * It borrows the className of a button already on that screen, so it inherits the
 * game's own styling instead of importing a look that does not belong.
 *
 * SAFE BY DESIGN
 *  - does nothing if the game already exposes SWS_EXIT or already links to /portal/
 *  - does nothing if there is no #s-title (the house title-screen id)
 *  - never inserted twice
 *  - inside the jukebox iframe it posts {sws:'close'} like every cooperating game
 */
(function () {
  // Some games boot straight past their title screen (stop-motion, doodle-pad,
  // multiplication-chart) and two have no #s-title at all (flatulence-fighter,
  // dragon-philosophy). A button parked on a screen the player never sees is the
  // same as no button, so those get a small corner chip instead — placed in the
  // first corner that is genuinely empty, so it cannot sit on top of a control.
  var FALLBACK = true;

  function isShown(el) {
    if (!el) return false;
    var c = getComputedStyle(el), r = el.getBoundingClientRect();
    return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity !== 0 && r.width > 6 && r.height > 6;
  }

  function freeCorner() {
    // bottom-right is the feedback fab's; never contend for it
    var spots = [
      { css: 'left:10px;  top:calc(10px + env(safe-area-inset-top,0px));',    x: 34, y: 34 },
      { css: 'right:10px; top:calc(10px + env(safe-area-inset-top,0px));',    x: innerWidth - 34, y: 34 },
      { css: 'left:10px;  bottom:calc(10px + env(safe-area-inset-bottom,0px));', x: 34, y: innerHeight - 34 }
    ];
    for (var i = 0; i < spots.length; i++) {
      var hit = document.elementFromPoint(spots[i].x, spots[i].y);
      var blocked = hit && hit.closest && hit.closest('button,a,[role="button"],input,select,canvas');
      if (!blocked) return spots[i].css;
    }
    return spots[0].css;   // everything is busy: top-left is still the least-worst
  }

  function boot() {
    try {
      var EMBED = /[?&]embed=1(&|$)/.test(location.search) || window.self !== window.top;

      // the game already has a way out — leave it alone
      if (typeof window.SWS_EXIT === 'function') return;
      if (document.querySelector('a[href*="/portal"]')) return;
      if (document.getElementById('sws-arcade-exit')) return;

      var title = document.getElementById('s-title');
      var titleUsable = !!(title && isShown(title));
      if (!title && !FALLBACK) return;

      function leave() {
        if (EMBED && parent !== window) {
          try { parent.postMessage({ sws: 'close' }, '*'); } catch (e) {}
          return;
        }
        if (document.referrer.indexOf('/portal') >= 0 && history.length > 1) { history.back(); return; }
        location.href = '/portal/';
      }
      window.SWS_EXIT = leave;

      // Wear the same classes as the screen's own buttons so it reads as part of
      // the game — but do NOT join their row. Dropping it into a sibling row made
      // it overflow the screen edge and squashed "How to Play" onto three lines.
      // The title screen itself is the column everything stacks in, so it goes
      // there, on its own line, after the rest.
      if (!titleUsable) {
        var chip = document.createElement('button');
        chip.id = 'sws-arcade-exit';
        chip.type = 'button';
        chip.textContent = '\u25C4';
        chip.setAttribute('aria-label', 'Back to the Sky Wolf Studios arcade');
        chip.setAttribute('style', 'position:fixed;' + freeCorner() +
          'z-index:2147481000;width:48px;height:48px;border-radius:14px;' +
          'border:1px solid rgba(255,255,255,.24);background:rgba(8,10,16,.72);' +
          'color:#e8dcc8;font:600 17px/1 system-ui,sans-serif;cursor:pointer;' +
          'display:flex;align-items:center;justify-content:center;' +
          '-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);opacity:.8;');
        chip.addEventListener('click', function (e) { e.preventDefault(); leave(); });
        document.body.appendChild(chip);
        return;
      }

      var kin = title.querySelectorAll('button');
      var last = kin.length ? kin[kin.length - 1] : null;
      var host = title;

      var b = document.createElement('button');
      b.id = 'sws-arcade-exit';
      b.type = 'button';
      b.className = last ? last.className : '';
      b.textContent = '◄ All Sky Wolf games';
      b.setAttribute('aria-label', 'Back to the Sky Wolf Studios arcade');
      b.style.opacity = '0.82';
      b.style.marginTop = '10px';
      // Sibling buttons are often in a narrow flex ROW, where the label would be
      // squeezed to ~75px and wrap; but some title screens are a flex COLUMN,
      // where a flex-basis of 100% makes the button 380px TALL. So ask the
      // container which way it runs and only claim a full line in a row.
      b.style.maxWidth = '400px';
      b.style.whiteSpace = 'nowrap';
      b.style.flexGrow = '0';
      b.style.flexShrink = '0';
      b.style.width = '100%';
      b.style.flexBasis = 'auto';
      b.style.alignSelf = 'center';
      if (!b.className) {
        b.style.minHeight = '48px';
        b.style.padding = '0 16px';
        b.style.borderRadius = '14px';
        b.style.border = '1px solid rgba(255,255,255,.22)';
        b.style.background = 'rgba(0,0,0,.35)';
        b.style.color = 'inherit';
        b.style.font = 'inherit';
        b.style.fontSize = '0.85rem';
      }
      b.addEventListener('click', function (e) { e.preventDefault(); leave(); });
      host.appendChild(b);

      /* 48px is a RENDERED-pixel rule, not a CSS one. Most of these games draw a
         fixed 540x960 stage and transform-scale it to the phone, so a 48px button
         lands at ~37px under the thumb — which is how a blanket minHeight:48px
         made this WORSE, not better. Measure the stage's actual scale (rendered
         height / layout height) and set the floor in the stage's own units. */
      try {
        var rect = b.getBoundingClientRect();
        var scale = b.offsetHeight ? (rect.height / b.offsetHeight) : 1;
        if (scale > 0 && rect.height < 48) {
          b.style.minHeight = Math.ceil(48 / scale) + 'px';
        }
      } catch (e) {}
    } catch (e) { /* an exit button must never be the thing that breaks a game */ }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 0);
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
  // some games build their title screen after load; try once more
  window.addEventListener('load', function () { setTimeout(boot, 400); });
})();
