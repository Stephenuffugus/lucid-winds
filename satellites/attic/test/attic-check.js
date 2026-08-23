/* ⛔ SUPERSEDED, DELIBERATELY NOT DELETED. The Attic's suite moved to
   satellites/attic/check.js on 2026-08-24, in the house pattern every other
   game in the fleet uses (vm + DOM stub, ok()/group(), exit 0/1/2, a browser
   group for anything that has to be measured in rendered pixels). Everything
   the old 72 assertions covered is in there, plus the controls that watch each
   rule fail against broken code.
   This file stays because things point at it. It runs the real suite and
   returns the real exit code, so `node test/attic-check.js` is still true. */
'use strict';
var path = require('path');
var r = require('child_process').spawnSync(process.execPath,
  [path.join(__dirname, '..', 'check.js')].concat(process.argv.slice(2)),
  { stdio: 'inherit', env: process.env });
process.exit(typeof r.status === 'number' ? r.status : 2);
