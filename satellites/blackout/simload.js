/* test only loader: same extraction sim.js uses, exposed as a module */
var fs = require("fs"), path = require("path");
var HTML = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var a = HTML.indexOf("// ---- SIM_EXPORT_START ----"), b = HTML.indexOf("// ---- SIM_EXPORT_END ----");
var SRC = HTML.slice(a, b);
var names = SRC.match(/^(?:function ([A-Za-z_$][\w$]*)|var ([A-Za-z_$][\w$]*))/gm).map(function (s) {
  return s.replace(/^function |^var /, "");
});
var uniq = {}; names = names.filter(function (n) { if (uniq[n]) return false; uniq[n] = 1; return true; });
module.exports = new Function(SRC + "\n;return {" + names.map(function (n) { return n + ":" + n; }).join(",") + "};")();
