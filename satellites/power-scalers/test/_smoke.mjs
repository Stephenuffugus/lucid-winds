import {boot, makeOC} from "./harness.mjs";
const {T} = boot();
console.log("races", T.RACES.length, "powers", T.POWERS.length, "enemies", T.ENEMIES.length, "nodes", Object.keys(T.TREE.byId).length);
const a = makeOC(T,{name:"A"}), b = makeOC(T,{name:"B",race:"draconid"});
const res = T.simulate(a,b);
console.log("sim ok:", res.winnerName, "rounds", res.rounds, "loglines", res.log.length);
