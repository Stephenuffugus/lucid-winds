/* window.PartySound — the party pack's voice. HOST SCREEN ONLY.

   Six games and total silence. A party game on a television lives on its sound:
   the tick that makes the last five seconds hurt, the pip that tells the room
   somebody just committed, the chime that says here it comes. Without any of it
   the screen is a slideshow.

   ⛔ EVERYTHING IS SYNTHESISED. House rule 3 is no third party requests, and
   that includes audio files from anywhere. This is WebAudio and nothing else,
   which also means it adds no bytes to load and cannot fail to arrive.

   ⛔ HOST ONLY. Phones stay silent on purpose. Eight phones each playing their
   own chime a few milliseconds apart is not eight times better, it is a mess,
   and it is exactly the noise a room blames the game for.

   ⭐ THE PALETTE IS ONE SCALE. Every note comes from a pentatonic set, so
   nothing can ever clash with anything else no matter what order a game plays
   them in. That is the entire reason this sounds composed rather than beeped.

   Muting is a real control, not a nicety: somebody will be playing this at
   eleven at night with a baby upstairs. The choice persists. */
(function () {
'use strict';

var CTX = null, master = null, on = true, bedNodes = null;

try { on = localStorage.getItem('party_sound') !== 'off'; } catch (e) {}

/* A minor pentatonic, which is warm and cannot make a wrong interval. */
var SC = [220.00, 261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 784.00];

function ctx() {
  if (CTX) return CTX;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    CTX = new AC();
    master = CTX.createGain();
    master.gain.value = 0.5;
    master.connect(CTX.destination);
  } catch (e) { CTX = null; }
  return CTX;
}

/* one voice: a tone with a soft envelope, because a raw gain switch clicks */
function note(freq, when, dur, vol, type) {
  var c = ctx(); if (!c || !on) return;
  var t = c.currentTime + (when || 0);
  var o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.25));
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + (dur || 0.25) + 0.05);
}

function chord(idxs, dur, vol, spread) {
  for (var i = 0; i < idxs.length; i++)
    note(SC[idxs[i] % SC.length], i * (spread || 0), dur, vol, 'sine');
}

window.PartySound = {
  /* Browsers refuse audio until a gesture, so the shell calls this from the
     first real click on the page (picking a game, or pressing start). */
  wake: function () {
    var c = ctx();
    if (c && c.state === 'suspended') { try { c.resume(); } catch (e) {} }
  },
  isOn: function () { return on; },
  toggle: function () {
    on = !on;
    try { localStorage.setItem('party_sound', on ? 'on' : 'off'); } catch (e) {}
    if (!on) this.bed(false); else this.wake();
    return on;
  },

  /* a soft pip when somebody commits: the room hears the count rise */
  pip: function () { note(SC[5], 0, 0.09, 0.10, 'triangle'); },

  /* the last few seconds. Rising pitch, because a flat tick reads as a clock
     and a rising one reads as pressure. */
  tick: function (secondsLeft) {
    var i = Math.max(0, Math.min(4, 5 - secondsLeft));
    note(SC[3] * (1 + i * 0.06), 0, 0.07, 0.13, 'square');
  },

  /* a phase is about to open */
  chime: function () { chord([2, 4, 6], 0.5, 0.12, 0.05); },

  /* the answer lands. Up for a good outcome, down for a flat one, and the room
     knows which before it has read a word. */
  reveal: function (good) {
    if (good === false) { chord([2, 1], 0.45, 0.11, 0.07); return; }
    chord([4, 6, 8], 0.6, 0.13, 0.06);
  },

  /* somebody is out, somebody froze, something was lost */
  thud: function () { note(SC[0] * 0.75, 0, 0.4, 0.16, 'triangle'); },

  /* the night is over */
  fanfare: function () {
    var seq = [4, 6, 8, 9];
    for (var i = 0; i < seq.length; i++) note(SC[seq[i]], i * 0.13, 0.55, 0.15, 'sine');
    note(SC[4] / 2, 0.39, 0.9, 0.10, 'sine');
  },

  /* A quiet two note pulse under an answer phase. Deliberately almost nothing:
     it exists so the room is not silent while people read, and anything louder
     competes with the people talking, which is the actual entertainment. */
  bed: function (want) {
    var c = ctx();
    if (!c || !on) { want = false; }
    if (want && bedNodes) return;
    if (!want) {
      if (bedNodes) { clearInterval(bedNodes); bedNodes = null; }
      return;
    }
    var step = 0;
    bedNodes = setInterval(function () {
      if (!on) return;
      note(SC[step % 2 === 0 ? 0 : 2] / 2, 0, 1.1, 0.035, 'sine');
      step++;
    }, 1400);
  }
};
})();
