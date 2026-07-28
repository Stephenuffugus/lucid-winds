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
  function boot() {
    try {
      var EMBED = /[?&]embed=1(&|$)/.test(location.search) || window.self !== window.top;

      // the game already has a way out — leave it alone
      if (typeof window.SWS_EXIT === 'function') return;
      if (document.querySelector('a[href*="/portal"]')) return;
      if (document.getElementById('sws-arcade-exit')) return;

      var title = document.getElementById('s-title');
      if (!title) return;

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
