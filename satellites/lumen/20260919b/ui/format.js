// Big-number formatting for Lux from the start (section 7): 950, 1.2K, 3.4M, 5.6B.
export function fmt(n) {
  n = Math.round(n);
  const a = Math.abs(n);
  if (a < 1000) return String(n);
  const units = [['T', 1e12], ['B', 1e9], ['M', 1e6], ['K', 1e3]];
  for (const [u, v] of units) if (a >= v) { const x = n / v; return (Math.abs(x) >= 100 ? x.toFixed(0) : Math.abs(x) >= 10 ? x.toFixed(1).replace(/\.0$/, '') : x.toFixed(1).replace(/\.0$/, '')) + u; }
  return String(n);
}
