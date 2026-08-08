/* WIDE MARGIN PERCENTAGE BANK

   A question with a percentage answer appears on the television and everybody
   drags a dial from 0 to 100 at the same time. Closest wins, and being close
   always pays something.

   ⛔⛔ THE RULE THAT OUTRANKS EVERY OTHER RULE IN THIS FILE: WE NEVER INVENT A
   NUMBER. Every answer here is a real published figure with a source that can be
   checked. This bank is nothing but numbers, so a single made up one poisons the
   whole game in a way a wrong trivia answer never could: a player has no way to
   tell an invention from a fact. If a figure cannot be confirmed, the question
   does not exist.

   ⛔ AND NOTHING THAT DRIFTS. No populations, no market shares, no "how many
   people own a", nothing that will quietly become false in three years and make
   a liar of us on somebody's television. Physical, geographic, biological and
   historical constants only.

   Regenerate or extend with this exact prompt, then hand-audit every entry:

   "Write N percentage questions for a cozy family party game where players guess
   a number from 0 to 100. Each question is one sentence under 105 characters
   starting 'What percentage of'. The answer is a whole number and must be a real
   published figure you are confident of. Never invent a number: if you are not
   sure, do not write the question. Avoid anything that changes year to year, and
   avoid anything where reputable sources disagree by more than a few points.
   Avoid questions where the phrasing allows more than one correct number.
   General audience, nothing about politics, religion, illness, death, violence,
   money, weight or appearance. Gentle body composition is fine, health is not.
   No dash characters of any kind. Output a JS array of objects with fields id,
   q, answer, source, category. Categories: earth, space, animals, plants, body,
   materials, world, science."

   AUDIT RULE: for every entry ask two questions. Is this the real number? And
   does the wording allow exactly one number to be right? The second one is what
   kills most of them: "what percentage of the earth is water" has at least three
   defensible answers depending on whether you mean surface, mass or including
   ice.

   Launch bank 2026-08-08: 34 entries, every one hand checked. */
window.WIDEMARGIN_BANK = [
  {id:'wm-0001', q:"What percentage of the earth's surface is covered by ocean?", answer:71, source:'NOAA', category:'earth'},
  {id:'wm-0002', q:"What percentage of the earth's surface is dry land?", answer:29, source:'NOAA', category:'earth'},
  {id:'wm-0003', q:"What percentage of the air you are breathing is nitrogen?", answer:78, source:'NOAA', category:'science'},
  {id:'wm-0004', q:"What percentage of the air you are breathing is oxygen?", answer:21, source:'NOAA', category:'science'},
  {id:'wm-0005', q:"What percentage of all the water on earth is fresh water?", answer:3, source:'USGS', category:'earth'},
  {id:'wm-0006', q:"What percentage of the earth's fresh water is frozen in ice and glaciers?", answer:68, source:'USGS', category:'earth'},
  {id:'wm-0007', q:"What percentage of Antarctica is covered by ice?", answer:98, source:'British Antarctic Survey', category:'earth'},
  {id:'wm-0008', q:"What percentage of the solar system's mass is the Sun?", answer:99, source:'NASA', category:'space'},
  {id:'wm-0009', q:"What percentage of the Sun's mass is hydrogen?", answer:73, source:'NASA', category:'space'},
  {id:'wm-0010', q:"What percentage of the Moon's surface can be seen from earth over time?", answer:59, source:'NASA', category:'space'},
  {id:'wm-0011', q:"What percentage of earth's gravity does the Moon have?", answer:17, source:'NASA', category:'space'},
  {id:'wm-0012', q:"What percentage of the universe is ordinary matter?", answer:5, source:'NASA', category:'space'},
  {id:'wm-0013', q:"What percentage of the universe is dark energy?", answer:68, source:'NASA', category:'space'},
  {id:'wm-0014', q:"What percentage of an adult human body is water?", answer:60, source:'USGS', category:'body'},
  {id:'wm-0015', q:"What percentage of the human brain is water?", answer:73, source:'Britannica', category:'body'},
  {id:'wm-0016', q:"What percentage of the human body is oxygen by mass?", answer:65, source:'Britannica', category:'body'},
  {id:'wm-0017', q:"What percentage of the human body is carbon by mass?", answer:18, source:'Britannica', category:'body'},
  {id:'wm-0018', q:"What percentage of a cucumber is water?", answer:96, source:'Britannica', category:'plants'},
  {id:'wm-0019', q:"What percentage of a watermelon is water?", answer:92, source:'Britannica', category:'plants'},
  {id:'wm-0020', q:"What percentage of a strawberry is water?", answer:91, source:'Britannica', category:'plants'},
  {id:'wm-0021', q:"What percentage of an apple is water?", answer:86, source:'Britannica', category:'plants'},
  {id:'wm-0022', q:"What percentage of a banana is water?", answer:75, source:'Britannica', category:'plants'},
  {id:'wm-0023', q:"What percentage of a potato is water?", answer:79, source:'Britannica', category:'plants'},
  {id:'wm-0024', q:"What percentage of cow's milk is water?", answer:87, source:'Britannica', category:'food'},
  {id:'wm-0025', q:"What percentage of honey is water?", answer:17, source:'Britannica', category:'food'},
  {id:'wm-0026', q:"What percentage of a jellyfish is water?", answer:95, source:'NOAA', category:'animals'},
  {id:'wm-0027', q:"What percentage of all known animal species are insects?", answer:80, source:'Smithsonian', category:'animals'},
  {id:'wm-0028', q:"What percentage of a chicken egg's weight is the shell?", answer:10, source:'Britannica', category:'animals'},
  {id:'wm-0029', q:"What percentage of the earth's crust is oxygen by mass?", answer:46, source:'USGS', category:'materials'},
  {id:'wm-0030', q:"What percentage of the earth's crust is silicon by mass?", answer:28, source:'USGS', category:'materials'},
  {id:'wm-0031', q:"What percentage of eighteen carat gold is pure gold?", answer:75, source:'Britannica', category:'materials'},
  {id:'wm-0032', q:"What percentage of the world's ocean area is the Pacific?", answer:46, source:'NOAA', category:'world'},
  {id:'wm-0033', q:"What percentage of the world's land area is Antarctica?", answer:9, source:'Britannica', category:'world'},
  {id:'wm-0034', q:"What percentage of Iceland is covered by glaciers?", answer:11, source:'Britannica', category:'world'}
];
