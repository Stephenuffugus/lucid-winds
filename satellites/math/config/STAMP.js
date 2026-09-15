/* The link builder's own stamp (plans/crease/HANDOFF-CREASE.md 3.11). Every reference from a file in config/ to another
   file in config/ carries exactly `?v=` plus this string, and every reference into core/ carries CORE's (core/tools/lint.mjs
   law 3). Adding a game to schemas.js moves this stamp alone, so CORE's stamp, and every shipped game's worker that
   precaches CORE by it, stay where they are. It starts at f because config.js and schemas.js were served under CORE's a to
   e, and a stamp they were served under could hand back an old copy. */
export const STAMP = '20260915f';
