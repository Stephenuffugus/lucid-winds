// Colour science for the contrast floor (DESIGN 7, 12): sRGB, OKLab/OKLCH, CIELAB,
// CIEDE2000, and colour vision deficiency simulation (Machado, Oliveira and Fernandes 2009,
// severity 1.0). Pure functions, no DOM.

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
export const linearToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

// OKLab <-> linear sRGB (Ottosson)
export function oklabToLinear(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function linearToOklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const inGamut = (rgb) => rgb.every((c) => c >= -1e-4 && c <= 1 + 1e-4);

// OKLCH -> sRGB bytes, reducing chroma until the colour is displayable.
export function oklch(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  let lo = 0, hi = C;
  let rgb = oklabToLinear(L, C * Math.cos(h), C * Math.sin(h));
  if (!inGamut(rgb)) {
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      const t = oklabToLinear(L, mid * Math.cos(h), mid * Math.sin(h));
      if (inGamut(t)) { lo = mid; rgb = t; } else hi = mid;
    }
    rgb = oklabToLinear(L, lo * Math.cos(h), lo * Math.sin(h));
  }
  return rgb.map((c) => Math.round(clamp01(linearToSrgb(clamp01(c))) * 255));
}

export function oklabBytes(L, a, b) {
  let rgb = oklabToLinear(L, a, b);
  if (!inGamut(rgb)) {
    // pull toward grey at the same lightness
    let lo = 0, hi = 1;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklabToLinear(L, a * mid, b * mid))) lo = mid; else hi = mid;
    }
    rgb = oklabToLinear(L, a * lo, b * lo);
  }
  return rgb.map((c) => Math.round(clamp01(linearToSrgb(clamp01(c))) * 255));
}

// sRGB bytes -> CIELAB (D65)
export function rgbToLab(rgb) {
  const [r, g, b] = rgb.map((c) => srgbToLinear(c / 255));
  let x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  let y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  let z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  x = f(x); y = f(y); z = f(z);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

// CIEDE2000
export function deltaE2000(lab1, lab2) {
  const [L1, a1, b1] = lab1, [L2, a2, b2] = lab2;
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (b, a) => { if (a === 0 && b === 0) return 0; const t = Math.atan2(b, a) / rad; return t < 0 ? t + 360 : t; };
  const h1p = h(b1, a1p), h2p = h(b2, a2p);
  const dLp = L2 - L1, dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hbp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
    else hbp = (h1p + h2p) / 2;
  }
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const dTheta = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(Lbp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dTheta * rad) * RC;
  return Math.sqrt(Math.pow(dLp / SL, 2) + Math.pow(dCp / SC, 2) + Math.pow(dHp / SH, 2) + RT * (dCp / SC) * (dHp / SH));
}

export const CVD = {
  protan: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deutan: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritan: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
};

export function simulate(rgb, mode) {
  const M = CVD[mode];
  if (!M) return rgb;
  const [r, g, b] = rgb.map((c) => srgbToLinear(c / 255));
  return [
    M[0] * r + M[1] * g + M[2] * b,
    M[3] * r + M[4] * g + M[5] * b,
    M[6] * r + M[7] * g + M[8] * b,
  ].map((c) => Math.round(clamp01(linearToSrgb(clamp01(c))) * 255));
}

// Perceived difference between two sRGB colours as a viewer with `mode` sees them.
export function deltaE(rgb1, rgb2, mode = 'normal') {
  return deltaE2000(rgbToLab(simulate(rgb1, mode)), rgbToLab(simulate(rgb2, mode)));
}

export const hex = (rgb) => '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('');
