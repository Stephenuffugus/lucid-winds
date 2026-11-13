/**
 * Astra's art (pack v1, 4 Nov 2026; tools/astra_in.mjs puts it in assets/).
 *
 * ⛔ EVERY ART URL GOES THROUGH THE ONE QUERY. The literal token in ART_V is the build stamp, and
 * `node tools/stamp.mjs --bump` rewrites it with every other `?v=` in the game, so a new plate reaches a
 * returning phone the day it ships and an unchanged one stays cached. Never write an assets/ path by hand.
 *
 * The 49 icons and the two wordmarks are ONE sprite, fetched once at boot and injected at the top of the
 * body; `ic(name)` is a 24 unit drawing in currentColor, sized by its wrapper (the 48 px target is the
 * button around it, never the drawing).
 */
export const ART_V = '?v=20261113a';

/** The served URL of an art file under assets/, e.g. art('env/dirt_albedo.webp'). */
export function art(path) { return 'assets/' + path + ART_V; }

let iconsReady = null;

/** Fetch the sprite once and inject it. Resolves true when the symbols are in the page, false if it failed. */
export function loadIcons() {
  if (iconsReady) return iconsReady;
  iconsReady = fetch(art('ui/icons.svg'))
    .then(r => (r.ok ? r.text() : Promise.reject(new Error('icons ' + r.status))))
    .then(svg => {
      const box = document.createElement('div');
      box.id = 'iconSprite';
      box.setAttribute('aria-hidden', 'true');
      box.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      box.innerHTML = svg;
      document.body.insertBefore(box, document.body.firstChild);
      return true;
    })
    .catch(() => false);
  return iconsReady;
}

/** An icon as markup: <svg class="ic"><use href="#i-name"/></svg>. Decorative; the label beside it is the name. */
export function ic(name, cls) {
  return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
}
