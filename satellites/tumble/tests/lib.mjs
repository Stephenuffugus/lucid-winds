// Tiny test runner: node tests/<name>.test.mjs, or node tests/run-all.mjs
export function suite(name) {
  const fails = [];
  let n = 0;
  const ok = (cond, msg) => { n++; console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); if (!cond) fails.push(msg); };
  const done = () => {
    console.log(`${name}: ${n - fails.length}/${n} passed`);
    if (fails.length) process.exitCode = 1;
    return fails;
  };
  console.log('── ' + name);
  return { ok, done };
}
