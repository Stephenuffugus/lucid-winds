export async function resolve(spec, ctx, next) {
  if (spec === 'three') return { url: 'file:///workspaces/lucid-winds/satellites/keepsies/lib/three.module.min.js', shortCircuit: true };
  return next(spec, ctx);
}
