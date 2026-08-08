/* WHACK BOX CATALOGUE. Shell-owned. The host picker renders from this list and
   nothing else, so adding a title is one entry here plus a games/<slug>/ folder.

   Fields:
     slug        folder name under party/games/
     name        display title on the TV (Stephen renames all of these)
     blurb       one line, ten foot readable, says what YOU do
     min,max     player counts the shell enforces at the lobby
     mins        rough length in minutes, shown on the picker tile
     glyph       a single character mark for the tile
   ⛔ Titles here are WORKING NAMES. Stephen names things. */
window.WHACKBOX_CATALOGUE = [
  { slug:'mothlight',  name:'Mothlight',       glyph:'✦',
    blurb:'True or false, and the whole room watches your answer land.',
    min:3, max:8, mins:8 },
  { slug:'firefly',    name:'Firefly Futures', glyph:'✧',
    blurb:'Answer about yourself, then bet on what the room said.',
    min:3, max:8, mins:9 },
  { slug:'liftingfog', name:'Lifting Fog',     glyph:'❋',
    blurb:'Four clues. Worth less every time the fog lifts. Buzz early and be brave.',
    min:3, max:8, mins:9 },
  { slug:'firstfrost', name:'First Frost',     glyph:'❄',
    blurb:'Trivia knockout where the players you lose become the weather against you.',
    min:4, max:8, mins:10 },
  { slug:'moongraft',  name:'Moongraft',       glyph:'❀',
    blurb:'Everyone secretly draws one piece of the same plant. No scores, and you all keep the card.',
    min:3, max:8, mins:9 }
];
