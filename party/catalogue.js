/* WHACK BOX CATALOGUE. Shell-owned. The host picker renders from this list and
   nothing else, so adding a title is one entry here plus a games/<slug>/ folder.

   Fields:
     slug        folder name under party/games/
     name        display title on the TV (Stephen renames all of these)
     blurb       one line, ten foot readable, says what YOU do
     min,max     player counts the shell enforces at the lobby
     mins        rough length in minutes, shown on the picker tile
     glyph       a single character mark for the tile
     noTv        true when the title plays with no big screen (every phone shows the room, the host plays too).
                 18 Oct 2026: Mothlight and Same Soil; the rest keep the big screen until converted.
   ⛔ Titles here are WORKING NAMES. Stephen names things. */
window.WHACKBOX_CATALOGUE = [
  { slug:'mothlight',  name:'Mothlight',       glyph:'✦',
    blurb:'True or false, and the whole room watches your answer land.',
    min:3, max:8, mins:8, noTv:true },
  { slug:'firefly',    name:'Firefly Futures', glyph:'✧',
    blurb:'Answer privately. Guess how many said yes.',
    min:3, max:8, mins:9, noTv:true },
  { slug:'liftingfog', name:'Lifting Fog',     glyph:'❋',
    blurb:'Use the clues. Choose when to answer.',
    min:3, max:8, mins:9, noTv:true },
  { slug:'firstfrost', name:'First Frost',     glyph:'❄',
    blurb:'Answer questions. Then become the weather.',
    min:4, max:8, mins:10, noTv:true },
  { slug:'moongraft',  name:'Moongraft',       glyph:'❀',
    blurb:'Everyone secretly draws one piece of the same plant. No scores, and you all keep the card.',
    min:3, max:8, mins:9, noTv:true },
  { slug:'samesoil',   name:'Same Soil',       glyph:'❖',
    blurb:'One of you picks which of two things is more them. Everyone else guesses. Works with just two.',
    min:2, max:8, mins:8, noTv:true },
  { slug:'widemargin', name:'Wide Margin',     glyph:'◐',
    blurb:'Guess a percentage. See how close you came.',
    min:2, max:8, mins:7, noTv:true },
  { slug:'bearing',    name:'Bearing',         glyph:'✧',
    blurb:'One of you can see the target and says a single word out loud. Everyone else points.',
    min:3, max:8, mins:9, noTv:true },
  { slug:'understudy', name:'The Understudy',  glyph:'❦',
    blurb:'A role appears and the room decides which of you it belongs to. Warm ones only.',
    min:3, max:8, mins:8 }
];
