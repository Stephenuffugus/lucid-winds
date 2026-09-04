/**
 * The pot resolving, one marble at a time.
 *
 * DESIGN 18: "won marbles roll across the screen into your bag ONE BY ONE, each
 * with its name card and clink. Loss side: your marble rolls away toward the
 * winner. This ceremony is the emotional core of the game."
 *
 * It is the emotional core because it is the only moment where the thing that
 * changed hands is a THING. Before this, the result card said "You won Commie
 * off Dusty Coyle" over an empty ring, and a sentence is not a marble. So the
 * marble is rendered, at size, and it moves.
 *
 * ⛔ IT DRAWS THE MARBLE ONCE AND THEN MOVES A PICTURE. The thumbnailer owns its
 * own tiny renderer for the reason written in its header: the grid tiles rendered
 * EMPTY the first time because they borrowed the match renderer and mutated its
 * viewport. A ceremony that ran a second live scene every frame would be the same
 * mistake with a longer fuse, on the one screen a player sees after every match.
 * One render into a canvas, then transforms.
 *
 * ⛔ A ROLLING SPHERE'S HIGHLIGHT DOES NOT ROTATE WITH ITS PATTERN, and here it
 * does, because the picture is flat. At ceremony speed the eye reads the pattern
 * and not the specular, and the honest alternative is a live scene per marble,
 * which is the trap above. If it ever reads wrong, the fix is a second canvas
 * holding a fixed highlight composited over the rotating one, not a live scene.
 *
 * ⛔ IT NEVER BLOCKS THE RESULT. Every path calls `done` exactly once: the end of
 * the sequence, the skip tap, the reduced motion path, and the failure path if a
 * marble will not render. A ceremony that can swallow the results screen is worse
 * than no ceremony.
 */

/**
 * ⛔ READ AT PLAY TIME, NOT AT LOAD TIME. A person can turn reduce motion on while
 * the game is open, and a constant captured at module load would keep animating
 * at them until they reloaded.
 */
function motionAllowed() {
  try { return !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch (e) { return true; }
}

/**
 * @param {object} o
 * @param {HTMLElement} o.host            where the overlay is appended
 * @param {object} o.thumbs               from meta/collection.js createThumbnailer
 * @param {object} o.catalog
 * @param {{id:string,name:string,tier:string}[]} o.won      marbles coming to you
 * @param {{id:string,name:string,tier:string}[]} o.lost     marbles leaving you
 * @param {string} o.opponent
 * @param {(kind:string, entry:object)=>void} [o.onBeat]     clink and haptic
 * @param {()=>void} o.done
 * @returns {{skip:()=>void}}
 */
export function playPotCeremony(o) {
  const marbles = []
    .concat((o.won || []).map(m => ({ m, kind: 'won' })))
    .concat((o.lost || []).map(m => ({ m, kind: 'lost' })));

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    if (veil.parentNode) veil.parentNode.removeChild(veil);
    try { o.done(); } catch (e) { }
  };

  // nothing changed hands, so there is nothing to ceremonialise
  if (!marbles.length) { setTimeout(() => { try { o.done(); } catch (e) { } }, 0); return { skip: () => { } }; }

  const veil = document.createElement('div');
  veil.className = 'ceremony';
  veil.setAttribute('role', 'presentation');
  const stageEl = document.createElement('div');
  stageEl.className = 'cer-stage';
  const tierEl = document.createElement('p');
  tierEl.className = 'cer-tier';
  const nameEl = document.createElement('p');
  nameEl.className = 'cer-name';
  const lineEl = document.createElement('p');
  lineEl.className = 'cer-line';
  const loreEl = document.createElement('p');
  loreEl.className = 'cer-lore';
  const skipEl = document.createElement('p');
  skipEl.className = 'cer-skip';
  skipEl.textContent = 'tap to skip';
  veil.appendChild(stageEl);
  veil.appendChild(tierEl);
  veil.appendChild(nameEl);
  veil.appendChild(lineEl);
  veil.appendChild(loreEl);
  veil.appendChild(skipEl);
  veil.addEventListener('pointerdown', finish);
  o.host.appendChild(veil);

  let timer = 0;

  /* reduced motion: the same information, standing still. DESIGN 18 asks for
     parity with RIPCORD here, and a player who set that switch did not ask for a
     shorter ceremony, they asked for one that does not move. */
  if (!motionAllowed()) {
    for (const it of marbles) {
      const c = paint(it.m);
      if (c) { c.className = 'cer-marble still ' + it.kind; stageEl.appendChild(c); }
    }
    tierEl.textContent = marbles.length === 1 ? (marbles[0].m.tier || '') : '';
    nameEl.textContent = marbles.map(x => x.m.name).join(', ');
    lineEl.textContent = summary(marbles, o.opponent);
    if (marbles.length === 1) loreEl.textContent = loreOf(marbles[0].m) || '';
    timer = setTimeout(finish, 1600);
    return { skip: finish };
  }

  let i = 0;
  const next = () => {
    if (finished) return;
    if (i >= marbles.length) { timer = setTimeout(finish, 420); return; }
    const it = marbles[i++];
    const canvas = paint(it.m);
    if (!canvas) { next(); return; }              // a marble that will not draw does not stall the card
    canvas.className = 'cer-marble ' + it.kind;
    stageEl.textContent = '';
    stageEl.appendChild(canvas);
    tierEl.textContent = it.m.tier || '';
    nameEl.textContent = it.m.name;
    // ⛔ NAME WHO IT CAME OFF. Half the feeling of keepsies is that the marble
    // belonged to somebody an hour ago, and the ceremony was not saying so.
    lineEl.textContent = it.kind === 'won'
      ? 'is yours now, off ' + o.opponent + '.'
      : (o.opponent + ' takes it.');
    loreEl.textContent = loreOf(it.m) || '';
    // one frame on the wrong side of the screen, then the class that moves it,
    // so the transition has a start state to run from
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (finished) return;
        canvas.classList.add('go');
        try { if (o.onBeat) o.onBeat(it.kind, it.m); } catch (e) { }
      });
    });
    timer = setTimeout(next, 1150);
  };

  /** The marble's own line from the catalog, which is why a common is worth a beat. */
  function loreOf(m) {
    const e = (o.catalog.marbles || []).find(x => x.id === m.id);
    return e ? e.lore : '';
  }

  /**
   * One rendered marble at ceremony size, wrapped, or null if it cannot be drawn.
   *
   * ⛔ IT IS WRAPPED SO THE SHADOW TRAVELS WITH IT. The first version put the
   * ground shadow on the stage box, so the marble rolled across the screen and
   * its shadow stayed where it was, forty pixels below and behind: a marble
   * hovering over a stain rather than resting on dirt. A canvas cannot carry a
   * pseudo element, so the shadow lives on the wrapper.
   */
  function paint(m) {
    const entry = (o.catalog.marbles || []).find(x => x.id === m.id);
    if (!entry) return null;
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 220;
      o.thumbs.open(220);
      o.thumbs.paint(c, entry, 0);
      o.thumbs.close();
      const wrap = document.createElement('div');
      wrap.appendChild(c);
      return wrap;
    } catch (e) { return null; }
  }

  /* ⛔ NO EMPTY FIRST BEAT. A 260 ms lead in meant the ceremony spent a quarter
     of a second as a black rectangle with nothing in it, which is how the gate
     first caught it: overlay present, no marble, no name. The veil fades in CSS;
     the first marble is placed straight away. */
  next();
  return { skip: finish };
}

function summary(marbles, opponent) {
  const won = marbles.filter(x => x.kind === 'won').length;
  const lost = marbles.filter(x => x.kind === 'lost').length;
  if (won && !lost) return won === 1 ? 'is yours now.' : 'are yours now.';
  if (lost && !won) return opponent + ' takes ' + (lost === 1 ? 'it.' : 'them.');
  return 'changed hands.';
}
