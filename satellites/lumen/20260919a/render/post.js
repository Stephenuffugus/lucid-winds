// Post (section 8): UnrealBloomPass at half resolution, a finishing pass with a slight vignette, 2% film
// grain, a warm tint (overkill) and a white flash (Dawn's 300 ms bloom swell), then tone mapping.
// The quality monitor drops to the cheap path (matcap gems, lower pixel ratio, lighter bloom) when frames
// run long, and never switches back within a session, so the look never flickers.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { setQuality, quality } from './materials.js';

const FinishShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVignette: { value: 0.32 }, uGrain: { value: 0.02 }, uWarm: { value: 0 }, uFlash: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uVignette, uGrain, uWarm, uFlash; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float d = length((vUv - 0.5) * vec2(1.0, 0.8));
      c.rgb *= mix(1.0, smoothstep(0.85, 0.25, d), uVignette);
      c.rgb *= mix(vec3(1.0), vec3(1.12, 1.0, 0.82), uWarm);
      c.rgb += vec3(1.0, 0.97, 0.9) * uFlash * 0.35 * (1.0 - d);
      c.rgb += (h(vUv * 911.0 + fract(uTime * 7.13)) - 0.5) * uGrain;
      gl_FragColor = c;
    }`,
};

export function createPost(stage, opts = {}) {
  const { renderer, scene, camera } = stage;
  // Through the composer the clear colour reaches the output pass unconverted and gets sRGB-encoded a
  // second time (0x07060a would show as about 0x1c1927); clear to black, which stays near-black.
  renderer.setClearColor(0x000000, 1);
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const size = new THREE.Vector2();
  renderer.getSize(size);
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.75, 0.32, 0.78);
  const finish = new ShaderPass(FinishShader);
  const output = new OutputPass();
  // Grain and vignette act on the displayed (sRGB) image, after tone mapping, so 2% grain means 2%.
  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(output);
  composer.addPass(finish);
  const fx = { swell: 0, warm: 0, warmTarget: 0, reducedMotion: !!opts.reducedMotion };
  function resize() {
    renderer.getSize(size);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(size.x, size.y);
    bloom.resolution.set(size.x / 2, size.y / 2);
    bloom.setSize(Math.max(1, Math.floor((size.x * renderer.getPixelRatio()) / 2)), Math.max(1, Math.floor((size.y * renderer.getPixelRatio()) / 2)));
  }
  resize();
  stage.onResize(resize);

  // Quality monitor: after a short warm-up, an average frame over 24 ms (under ~42 fps) across 30 frames,
  // or over 120 ms across 5 frames, switches to the cheap path.
  const mon = { acc: 0, n: 0, warm: 15 };
  function monitor(dtMs) {
    if (quality.level !== 'high' || opts.lockQuality) return;
    if (mon.warm > 0) { mon.warm--; return; }
    mon.acc += dtMs; mon.n++;
    if ((mon.n >= 5 && mon.acc / mon.n > 120) || (mon.n >= 30 && mon.acc / mon.n > 24)) lower();
    if (mon.n >= 30) { mon.acc = 0; mon.n = 0; }
  }
  function lower() {
    setQuality('low');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    bloom.strength = 0.6;
    stage.resize();
    resize();
  }

  return {
    composer, bloom, finish,
    dawn() { if (!fx.reducedMotion) fx.swell = 1; },
    warm(on) { fx.warmTarget = on ? 1 : 0; },
    setReducedMotion(v) { fx.reducedMotion = v; },
    lower,
    render(dt, dtMs) {
      fx.swell = Math.max(0, fx.swell - dt / 0.3);
      fx.warm += (fx.warmTarget - fx.warm) * Math.min(1, dt * 2.5);
      const s = Math.sin(Math.min(1, fx.swell) * Math.PI);
      bloom.strength = (quality.level === 'high' ? 0.75 : 0.55) + 1.1 * s;
      finish.uniforms.uFlash.value = s * 0.35;
      finish.uniforms.uWarm.value = fx.warm;
      finish.uniforms.uTime.value += dt;
      composer.render(dt);
      if (dtMs !== undefined) monitor(dtMs);
    },
  };
}
