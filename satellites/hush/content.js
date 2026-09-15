/* HUSH's words (plans/hush/HANDOFF-HUSH.md sections 3 and 4). Every string a child or teacher sees lives here, so the lint's
   copy scan reads one file: no dash, no exclamation point, nothing hit, smashed or caught (H6), no patience or self control
   (H8), no claim beyond the game. */

/* SIMON's commands (3.7): things a body does in a classroom aisle, none of them touching another child. */
export const SIMON_COMMANDS = Object.freeze([
  'freeze',
  'hop on the spot',
  'touch your nose',
  'reach up high',
  'turn around',
  'clap two times',
  'stand on one foot',
  'wiggle your fingers',
  'touch your toes',
  'flap like a bird',
  'march in place',
  'sit down'
]);

export const SIGNAL_WORD = 'Hush says';

export const COPY = Object.freeze({
  title: 'Hush',
  studio: 'Sky Wolf Studio',
  step: 'Step',
  simon: 'Hush says',
  go: 'Go on',
  startStep: 'Step closer',
  startSimon: 'Hush says, for the whole room',
  clearing: 'A clearing at dawn',
  quick: 'Quick',
  forkQuick: 'A hare, quick',
  forkCareful: 'A heron, careful',
  simonHow: 'Do it only when Hush says',
  simonGo: 'Begin',
  again: 'Again',
  home: 'Back to the clearing'
});

/* CORE's colour tokens for HUSH's page: the dawn paper, the ink, the low sun */
export const PALETTE_TOKENS = Object.freeze({ paper: '#f3e3c6', ink: '#2b2a26', accent: '#f6c979' });
