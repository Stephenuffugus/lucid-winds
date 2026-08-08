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

   Bank at 2026-08-08: 136 entries. The first 34 were hand
   checked; the rest came through a generate then verify pipeline where every
   figure was checked against a source and anything unconfirmed was dropped. */
window.WIDEMARGIN_BANK = [
  {id:'wm-0001', q:"What percentage of the earth's surface is covered by ocean?", answer:71, source:"NOAA", category:"earth"},
  {id:'wm-0002', q:"What percentage of the earth's surface is dry land?", answer:29, source:"NOAA", category:"earth"},
  {id:'wm-0003', q:"What percentage of the air you are breathing is nitrogen?", answer:78, source:"NOAA", category:"science"},
  {id:'wm-0004', q:"What percentage of the air you are breathing is oxygen?", answer:21, source:"NOAA", category:"science"},
  {id:'wm-0005', q:"What percentage of all the water on earth is fresh water?", answer:3, source:"USGS", category:"earth"},
  {id:'wm-0006', q:"What percentage of the earth's fresh water is frozen in ice and glaciers?", answer:68, source:"USGS", category:"earth"},
  {id:'wm-0007', q:"What percentage of Antarctica is covered by ice?", answer:98, source:"British Antarctic Survey", category:"earth"},
  {id:'wm-0008', q:"What percentage of the solar system's mass is the Sun?", answer:99, source:"NASA", category:"space"},
  {id:'wm-0009', q:"What percentage of the Sun's mass is hydrogen?", answer:73, source:"NASA", category:"space"},
  {id:'wm-0010', q:"What percentage of the Moon's surface can be seen from earth over time?", answer:59, source:"NASA", category:"space"},
  {id:'wm-0011', q:"What percentage of earth's gravity does the Moon have?", answer:17, source:"NASA", category:"space"},
  {id:'wm-0012', q:"What percentage of the universe is ordinary matter?", answer:5, source:"NASA", category:"space"},
  {id:'wm-0013', q:"What percentage of the universe is dark energy?", answer:68, source:"NASA", category:"space"},
  {id:'wm-0014', q:"What percentage of an adult human body is water?", answer:60, source:"USGS", category:"body"},
  {id:'wm-0015', q:"What percentage of the human brain is water?", answer:73, source:"Britannica", category:"body"},
  {id:'wm-0016', q:"What percentage of the human body is oxygen by mass?", answer:65, source:"Britannica", category:"body"},
  {id:'wm-0017', q:"What percentage of the human body is carbon by mass?", answer:18, source:"Britannica", category:"body"},
  {id:'wm-0018', q:"What percentage of a cucumber is water?", answer:96, source:"Britannica", category:"plants"},
  {id:'wm-0019', q:"What percentage of a watermelon is water?", answer:92, source:"Britannica", category:"plants"},
  {id:'wm-0020', q:"What percentage of a strawberry is water?", answer:91, source:"Britannica", category:"plants"},
  {id:'wm-0021', q:"What percentage of an apple is water?", answer:86, source:"Britannica", category:"plants"},
  {id:'wm-0022', q:"What percentage of a banana is water?", answer:75, source:"Britannica", category:"plants"},
  {id:'wm-0023', q:"What percentage of a potato is water?", answer:79, source:"Britannica", category:"plants"},
  {id:'wm-0024', q:"What percentage of cow's milk is water?", answer:87, source:"Britannica", category:"food"},
  {id:'wm-0025', q:"What percentage of honey is water?", answer:17, source:"Britannica", category:"food"},
  {id:'wm-0026', q:"What percentage of a jellyfish is water?", answer:95, source:"NOAA", category:"animals"},
  {id:'wm-0027', q:"What percentage of all known animal species are insects?", answer:80, source:"Smithsonian", category:"animals"},
  {id:'wm-0028', q:"What percentage of a chicken egg's weight is the shell?", answer:10, source:"Britannica", category:"animals"},
  {id:'wm-0029', q:"What percentage of the earth's crust is oxygen by mass?", answer:46, source:"USGS", category:"materials"},
  {id:'wm-0030', q:"What percentage of the earth's crust is silicon by mass?", answer:28, source:"USGS", category:"materials"},
  {id:'wm-0031', q:"What percentage of eighteen carat gold is pure gold?", answer:75, source:"Britannica", category:"materials"},
  {id:'wm-0032', q:"What percentage of the world's ocean area is the Pacific?", answer:46, source:"NOAA", category:"world"},
  {id:'wm-0033', q:"What percentage of the world's land area is Antarctica?", answer:9, source:"Britannica", category:"world"},
  {id:'wm-0034', q:"What percentage of Iceland is covered by glaciers?", answer:11, source:"Britannica", category:"world"},
  {id:'wm-0035', q:"What percentage of all the water on Earth is held in the oceans?", answer:97, source:"NOAA Ocean Service", category:"oceans"},
  {id:'wm-0036', q:"What percentage of the world's rain and snow falls on the ocean instead of on land?", answer:78, source:"NASA", category:"oceans"},
  {id:'wm-0037', q:"What percentage of an iceberg sits above the waterline?", answer:10, source:"USGS Water Science School", category:"ice"},
  {id:'wm-0038', q:"What percentage of the world's land sits in the Northern Hemisphere?", answer:68, source:"Britannica", category:"land"},
  {id:'wm-0039', q:"What percentage of the world's ice is in Antarctica?", answer:90, source:"British Antarctic Survey", category:"ice"},
  {id:'wm-0040', q:"What percentage of Greenland lies under its ice sheet?", answer:80, source:"NSIDC", category:"ice"},
  {id:'wm-0041', q:"What percentage of Earth's fresh water is underground?", answer:30, source:"USGS Water Science School", category:"fresh water"},
  {id:'wm-0042', q:"What percentage of the world's surface fresh water is held in the Great Lakes?", answer:21, source:"US EPA", category:"fresh water"},
  {id:'wm-0043', q:"What percentage of the world's unfrozen surface fresh water sits in Lake Baikal?", answer:20, source:"UNESCO", category:"fresh water"},
  {id:'wm-0044', q:"What percentage of the air you breathe is nitrogen?", answer:78, source:"NASA", category:"atmosphere"},
  {id:'wm-0045', q:"What percentage of the air you breathe is oxygen?", answer:21, source:"NASA", category:"atmosphere"},
  {id:'wm-0046', q:"What percentage of the sunlight reaching Earth is reflected back into space?", answer:30, source:"NASA Earth Observatory", category:"atmosphere"},
  {id:'wm-0047', q:"What percentage of Earth's surface lies between the Tropics of Cancer and Capricorn?", answer:40, source:"Spherical geometry", category:"geography"},
  {id:'wm-0048', q:"What percentage of Earth's surface lies north of the Arctic Circle?", answer:4, source:"Spherical geometry", category:"geography"},
  {id:'wm-0049', q:"What percentage of the world's active volcanoes ring the Pacific Ocean?", answer:75, source:"National Geographic", category:"land"},
  {id:'wm-0050', q:"What percentage of the combined mass of all eight planets is Jupiter?", answer:71, source:"NASA Planetary Fact Sheet", category:"planets"},
  {id:'wm-0051', q:"What percentage of dry air in Earth's atmosphere is nitrogen?", answer:78, source:"NASA Earth Fact Sheet", category:"earth"},
  {id:'wm-0052', q:"What percentage of the atmosphere of Mars is carbon dioxide?", answer:95, source:"NASA Mars Fact Sheet", category:"planets"},
  {id:'wm-0053', q:"What percentage of Earth's gravity would you feel standing on Mars?", answer:38, source:"NASA Mars Fact Sheet", category:"planets"},
  {id:'wm-0054', q:"What percentage of the sunlight Earth receives does Mars receive?", answer:43, source:"NASA Mars Fact Sheet", category:"planets"},
  {id:'wm-0055', q:"What percentage of Earth's diameter is the diameter of Venus?", answer:95, source:"NASA Planetary Fact Sheet", category:"planets"},
  {id:'wm-0056', q:"What percentage of Earth's distance from the Sun is Mercury's distance from the Sun?", answer:39, source:"NASA Planetary Fact Sheet", category:"planets"},
  {id:'wm-0057', q:"What percentage of a 24 hour Earth day is one full spin of Jupiter?", answer:41, source:"NASA Jupiter Fact Sheet", category:"planets"},
  {id:'wm-0058', q:"What percentage of the density of water is the density of Saturn?", answer:69, source:"NASA Saturn Fact Sheet", category:"planets"},
  {id:'wm-0059', q:"What percentage of the eight planets have at least one moon?", answer:75, source:"NASA Planetary Fact Sheet", category:"planets"},
  {id:'wm-0060', q:"What percentage of Earth's diameter is the diameter of the Moon?", answer:27, source:"NASA Moon Fact Sheet", category:"the moon"},
  {id:'wm-0061', q:"What percentage of the Moon's surface is covered by the dark plains called maria?", answer:16, source:"Lunar and Planetary Institute", category:"the moon"},
  {id:'wm-0062', q:"What percentage of the universe is the ordinary matter that stars and planets are made of?", answer:5, source:"ESA Planck mission", category:"the universe"},
  {id:'wm-0063', q:"What percentage of a jellyfish's body is water?", answer:95, source:"NOAA Ocean Service", category:"animal bodies"},
  {id:'wm-0064', q:"What percentage of a shark's skeleton is made of bone?", answer:0, source:"Smithsonian Ocean", category:"animal bodies"},
  {id:'wm-0065', q:"What percentage of a dolphin's brain is asleep while the dolphin rests?", answer:50, source:"National Geographic", category:"sleep"},
  {id:'wm-0066', q:"What percentage of a human eye's light detecting cells are rods rather than cones?", answer:95, source:"Britannica", category:"senses"},
  {id:'wm-0067', q:"What percentage of a catfish's body surface has taste buds on it?", answer:100, source:"Caprio", category:"senses"},
  {id:'wm-0068', q:"What percentage of a honeybee's five eyes are simple eyes rather than compound eyes?", answer:60, source:"Britannica", category:"senses"},
  {id:'wm-0069', q:"What percentage of the worker bees in a beehive are female?", answer:100, source:"Britannica", category:"animal groups"},
  {id:'wm-0070', q:"What percentage of a chicken eggshell is calcium carbonate?", answer:95, source:"Britannica", category:"made of"},
  {id:'wm-0071', q:"What percentage of a bird's feather is made of keratin?", answer:90, source:"Audubon", category:"made of"},
  {id:'wm-0072', q:"What percentage of a giant panda's diet is bamboo?", answer:99, source:"WWF", category:"animal diet"},
  {id:'wm-0073', q:"What percentage of human blood is plasma?", answer:55, source:"American Red Cross", category:"human body"},
  {id:'wm-0074', q:"What percentage of an adult human's 206 bones are in the hands and feet?", answer:51, source:"Standard skeletal counts", category:"human body"},
  {id:'wm-0075', q:"What percentage of a raw white button mushroom is water?", answer:92, source:"USDA FoodData Central", category:"water content"},
  {id:'wm-0076', q:"What percentage of a raw carrot is water?", answer:88, source:"USDA FoodData Central", category:"water content"},
  {id:'wm-0077', q:"What percentage of raw broccoli is water?", answer:89, source:"USDA FoodData Central", category:"water content"},
  {id:'wm-0078', q:"What percentage of an avocado is water?", answer:73, source:"USDA FoodData Central", category:"water content"},
  {id:'wm-0079', q:"What percentage of a raisin is water?", answer:15, source:"USDA FoodData Central", category:"water content"},
  {id:'wm-0080', q:"What percentage of butter must be milkfat under United States rules?", answer:80, source:"21 U.S.C. 321a", category:"food standards"},
  {id:'wm-0081', q:"What percentage of a jar of peanut butter must be peanuts in the United States?", answer:90, source:"21 CFR 164.150", category:"food standards"},
  {id:'wm-0082', q:"What percentage of milk chocolate must be chocolate liquor under United States rules?", answer:10, source:"21 CFR 163.130", category:"food standards"},
  {id:'wm-0083', q:"What percentage of a raw peanut is fat?", answer:49, source:"USDA FoodData Central", category:"what it is made of"},
  {id:'wm-0084', q:"What percentage of the Amazon rainforest sits inside Brazil?", answer:60, source:"Encyclopaedia Britannica", category:"where things grow"},
  {id:'wm-0085', q:"What percentage of the world's food crop types depend at least partly on animal pollination?", answer:75, source:"IPBES pollinators assessment", category:"where things grow"},
  {id:'wm-0086', q:"What percentage of a newborn baby's body is water?", answer:78, source:"USGS Water Science School", category:"water"},
  {id:'wm-0087', q:"What percentage of a human lung is water?", answer:83, source:"USGS Water Science School", category:"water"},
  {id:'wm-0088', q:"What percentage of human skin is water?", answer:64, source:"USGS Water Science School", category:"water"},
  {id:'wm-0089', q:"What percentage of a human bone is water?", answer:31, source:"USGS Water Science School", category:"water"},
  {id:'wm-0090', q:"What percentage of the water in your body sits inside your cells?", answer:67, source:"Cleveland Clinic", category:"water"},
  {id:'wm-0091', q:"What percentage of human blood is plasma, the pale liquid part?", answer:55, source:"American Red Cross", category:"blood"},
  {id:'wm-0092', q:"What percentage of blood plasma is water?", answer:92, source:"Cleveland Clinic", category:"blood"},
  {id:'wm-0093', q:"What percentage of the body's calcium is stored in the bones and teeth?", answer:99, source:"National Institutes of Health", category:"bones"},
  {id:'wm-0094', q:"What percentage of tooth enamel is mineral by mass?", answer:96, source:"Cleveland Clinic", category:"bones"},
  {id:'wm-0095', q:"What percentage of the bones in an adult body are in the hands and feet?", answer:51, source:"Cleveland Clinic", category:"bones"},
  {id:'wm-0096', q:"What percentage of the human body by mass is the element hydrogen?", answer:10, source:"CRC Handbook", category:"body"},
  {id:'wm-0097', q:"What percentage of a newborn baby's sleep is REM sleep?", answer:50, source:"National Institutes of Health", category:"sleep"},
  {id:'wm-0098', q:"What percentage of the light detecting cells in the eye are rods?", answer:95, source:"Britannica", category:"senses"},
  {id:'wm-0099', q:"What percentage of people around the world are right handed?", answer:90, source:"Royal Society", category:"senses"},
  {id:'wm-0100', q:"What percentage of the energy needed to make new aluminium does recycling a can save?", answer:95, source:"US EPA", category:"recycling"},
  {id:'wm-0101', q:"What percentage of a glass of whole milk is water?", answer:88, source:"USDA FoodData Central", category:"food composition"},
  {id:'wm-0102', q:"What percentage of butter must be milk fat for it to be sold as butter in the US?", answer:80, source:"US Food and Drug Administration", category:"food standards"},
  {id:'wm-0103', q:"What percentage of the Earth's crust is silicon by weight?", answer:28, source:"USGS", category:"earth materials"},
  {id:'wm-0104', q:"What percentage of the Earth's crust is aluminium by weight?", answer:8, source:"USGS", category:"earth materials"},
  {id:'wm-0105', q:"What percentage of table salt is sodium by weight?", answer:39, source:"IUPAC", category:"chemistry"},
  {id:'wm-0106', q:"What percentage of water is oxygen by weight?", answer:89, source:"IUPAC", category:"chemistry"},
  {id:'wm-0107', q:"What percentage of Earth's surface is dry land rather than water?", answer:29, source:"NOAA", category:"land area"},
  {id:'wm-0108', q:"What percentage of the world's land area is inside Russia?", answer:11, source:"CIA World Factbook", category:"land area"},
  {id:'wm-0109', q:"What percentage of the world's land area is taken up by Asia?", answer:30, source:"CIA World Factbook", category:"land area"},
  {id:'wm-0110', q:"What percentage of Russia's territory lies in Asia rather than Europe?", answer:77, source:"Encyclopaedia Britannica", category:"land area"},
  {id:'wm-0111', q:"What percentage of Greenland is covered by its ice sheet?", answer:80, source:"NSIDC", category:"water and ice"},
  {id:'wm-0112', q:"What percentage of Earth's land surface is permanently covered by ice?", answer:10, source:"NSIDC", category:"water and ice"},
  {id:'wm-0113', q:"What percentage of the equator's length passes over water rather than land?", answer:79, source:"Wikipedia", category:"coastlines"},
  {id:'wm-0114', q:"What percentage of the Netherlands sits below sea level?", answer:26, source:"Statistics Netherlands", category:"coastlines"},
  {id:'wm-0115', q:"What percentage of the world's countries are in Africa?", answer:28, source:"United Nations", category:"countries"},
  {id:'wm-0116', q:"What percentage of the world's 24 time zones does Russia stretch across?", answer:46, source:"CIA World Factbook", category:"time zones"},
  {id:'wm-0117', q:"What percentage of the world's 24 time zones does the whole of China use?", answer:4, source:"CIA World Factbook", category:"time zones"},
  {id:'wm-0118', q:"What percentage of the world's living languages are spoken in Africa?", answer:30, source:"Ethnologue", category:"languages"},
  {id:'wm-0119', q:"What percentage of the world's living languages are spoken in Papua New Guinea?", answer:12, source:"Ethnologue", category:"languages"},
  {id:'wm-0120', q:"What percentage of the world's living languages belong to the Indo European family?", answer:6, source:"Ethnologue", category:"languages"},
  {id:'wm-0121', q:"What percentage of the letters in the English alphabet are A E I O or U?", answer:19, source:"Oxford English Dictionary", category:"letters"},
  {id:'wm-0122', q:"What percentage of the tiles in an English Scrabble set are the letter E?", answer:12, source:"Official Scrabble rules", category:"letters"},
  {id:'wm-0123', q:"What percentage of dry air is nitrogen?", answer:78, source:"NASA Earth Fact Sheet", category:"air"},
  {id:'wm-0124', q:"What percentage of dry air is oxygen?", answer:21, source:"NASA Earth Fact Sheet", category:"air"},
  {id:'wm-0125', q:"What percentage of dry air is argon, to the nearest whole number?", answer:1, source:"NASA Earth Fact Sheet", category:"air"},
  {id:'wm-0126', q:"What percentage of the mass of a water molecule is the oxygen in it?", answer:89, source:"IUPAC atomic weights", category:"chemistry"},
  {id:'wm-0127', q:"What percentage of its speed in a vacuum does light keep when it travels through water?", answer:75, source:"Refractive index tables", category:"light"},
  {id:'wm-0128', q:"What percentage of its speed in a vacuum does light keep inside a diamond?", answer:41, source:"Refractive index tables", category:"light"},
  {id:'wm-0129', q:"What percentage of the light hitting a pane of clear glass bounces off the front surface?", answer:4, source:"Optics, the Fresnel equations", category:"light"},
  {id:'wm-0130', q:"What percentage of the sunlight that reaches Earth is reflected straight back out to space?", answer:30, source:"NASA Earth Observatory", category:"light"},
  {id:'wm-0131', q:"What percentage of an iceberg floats above the waterline?", answer:10, source:"USGS", category:"water"},
  {id:'wm-0132', q:"What percentage of the energy needed to make new aluminium is saved by recycling old cans?", answer:95, source:"Aluminium industry figures", category:"energy"},
  {id:'wm-0133', q:"What percentage of the universe is made of the ordinary matter that atoms are built from?", answer:5, source:"Planck results", category:"space"},
  {id:'wm-0134', q:"What percentage of Earth's crust is aluminium, the most common metal in it?", answer:8, source:"USGS", category:"earth"},
  {id:'wm-0135', q:"What percentage of the whole Earth, core included, is iron by mass?", answer:32, source:"USGS", category:"earth"},
  {id:'wm-0136', q:"What percentage of the atoms in a human body are hydrogen atoms?", answer:62, source:"Britannica", category:"body"}
];
