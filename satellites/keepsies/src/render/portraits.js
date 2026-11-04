/**
 * The people (Astra's pack v1, KEEPSIES_BUILD_PLAN.md step 4). Every face in the game comes through here,
 * keyed by the design's ids (the boss ids are the ones marbles.json writes as a signature's boss).
 *
 * Two states each: 'ring' (across the ring from you) and 'kept_it' (quietly satisfied, never cruel: Astra's
 * style guide), at 160 for a 160 px place (the 96 px state wherever a name is a chip). Only Dusty is drawn
 * today; the other four bosses and the twenty rung opponents are registered for the ladder (K3) and drawn
 * nowhere yet. The rung list is Astra's proposal (four rungs and the boss a league), not the design's five:
 * that call is the Director's (DECISIONS 6).
 */
import { art } from './art.js?v=20260905a';

const BOSS_FILE = {
  dusty_coyle: 'dusty', marlene_knuckles_ito: 'marlene', the_pit_boss: 'pitboss',
  old_ironsides: 'ironsides', the_curator: 'curator'
};
export const BOSSES = Object.keys(BOSS_FILE);

/* the names the game prints, to their ids: a match carries a name, and the face must follow it */
const BY_NAME = { 'Dusty Coyle': 'dusty_coyle', 'Marlene Ito': 'marlene_knuckles_ito', 'The Pit Boss': 'the_pit_boss',
  'Old Ironsides': 'old_ironsides', 'The Curator': 'the_curator' };

/** A boss's face: id (or the printed name), 'ring' or 'kept_it', 160 or 96. Null for anyone without one. */
export function face(idOrName, state, size) {
  const f = BOSS_FILE[idOrName] || BOSS_FILE[BY_NAME[idOrName]];
  if (!f) return null;
  return art('ui/boss_' + f + '_' + (state === 'kept_it' ? 'kept_it' : 'ring') + (size === 96 ? '_96' : '') + '.webp');
}

/* the twenty rung opponents on one 480 x 384 sheet, 96 px cells (Astra's catalog/opponents.json) */
export const RUNG_SHEET = 'ui/rung_opponents_sheet.png';
export const RUNG = [
  { id: 'opponent_01', name: "Junie Bell", quirk: "Counts every bounce", cell: [0, 0, 96, 96], league: 1 },
  { id: 'opponent_02', name: "Kit Mercer", quirk: "Keeps chalk in both pockets", cell: [96, 0, 96, 96], league: 1 },
  { id: 'opponent_03', name: "Nia Brooks", quirk: "Never shoots the easy one", cell: [192, 0, 96, 96], league: 1 },
  { id: 'opponent_04', name: "Theo Moss", quirk: "Wears a lucky hat", cell: [288, 0, 96, 96], league: 1 },
  { id: 'opponent_05', name: "Ada Pike", quirk: "Remembers every lost marble", cell: [384, 0, 96, 96], league: 2 },
  { id: 'opponent_06', name: "Ari Vale", quirk: "Polishes before every match", cell: [0, 96, 96, 96], league: 2 },
  { id: 'opponent_07', name: "Dax Miller", quirk: "Claims the wind changed", cell: [96, 96, 96, 96], league: 2 },
  { id: 'opponent_08', name: "Safiya Reed", quirk: "Plays one careful shot", cell: [192, 96, 96, 96], league: 2 },
  { id: 'opponent_09', name: "Walt Finch", quirk: "Brings the same old pouch", cell: [288, 96, 96, 96], league: 3 },
  { id: 'opponent_10', name: "Jules Hart", quirk: "Likes a crowded cross", cell: [384, 96, 96, 96], league: 3 },
  { id: 'opponent_11', name: "Rae Carter", quirk: "Never blames the ring", cell: [0, 192, 96, 96], league: 3 },
  { id: 'opponent_12', name: "Pippa Lane", quirk: "Collects only warm colors", cell: [96, 192, 96, 96], league: 3 },
  { id: 'opponent_13', name: "Leon Ash", quirk: "Talks to the shooter", cell: [192, 192, 96, 96], league: 4 },
  { id: 'opponent_14', name: "June Weller", quirk: "Keeps a handwritten ledger", cell: [288, 192, 96, 96], league: 4 },
  { id: 'opponent_15', name: "Bo Park", quirk: "Practices the lag first", cell: [384, 192, 96, 96], league: 4 },
  { id: 'opponent_16', name: "Gus Clay", quirk: "Trades stories after games", cell: [0, 288, 96, 96], league: 4 },
  { id: 'opponent_17', name: "Imani West", quirk: "Never rushes the brace", cell: [96, 288, 96, 96], league: 5 },
  { id: 'opponent_18', name: "Ren Cole", quirk: "Knows the shortest bank", cell: [192, 288, 96, 96], league: 5 },
  { id: 'opponent_19', name: "Edie Shaw", quirk: "Always brings spare clay", cell: [288, 288, 96, 96], league: 5 },
  { id: 'opponent_20', name: "Alex Wynn", quirk: "Asks for one more match", cell: [384, 288, 96, 96], league: 5 }];

/** A rung opponent's face as a CSS background (the sheet and the cell's offset), or null. */
export function rungFace(id, px) {
  const o = RUNG.find(r => r.id === id);
  if (!o) return null;
  const k = (px || 96) / 96;
  return { image: 'url(' + art(RUNG_SHEET) + ')', size: (480 * k) + 'px ' + (384 * k) + 'px',
    position: (-o.cell[0] * k) + 'px ' + (-o.cell[1] * k) + 'px' };
}
