// Single-weight line icons, drawn as inline SVG so they stay sharp and tiny (section 12).
const S = (body, vb = 24) => `<svg viewBox="0 0 ${vb} ${vb}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const CUT_ICONS = {
  mirror: S('<path d="M5 19 L19 5"/><path d="M8 20 l-2-2 M11 17 l-2-2 M14 14 l-2-2 M17 11 l-2-2 M20 8 l-2-2" stroke-width="1"/>'),
  amplifier: S('<path d="M12 3 L20 12 L12 21 L4 12 Z"/><path d="M12 8 v8 M8 12 h8"/>'),
  splitter: S('<path d="M12 21 V12 M12 12 L5 5 M12 12 L19 5"/><circle cx="12" cy="12" r="2"/>'),
  filter: S('<path d="M7 4 h10 l4 8 l-4 8 H7 l-4-8 Z"/><path d="M8 9 h8 M7 12 h10 M8 15 h8" stroke-width="1"/>'),
  prism: S('<path d="M12 4 L20 19 H4 Z"/><path d="M14 13 L22 9 M14 13 L22 13 M14 13 L22 17" stroke-width="1"/>'),
  lens: S('<ellipse cx="12" cy="12" rx="9" ry="5"/><path d="M12 7 v10"/><path d="M19 12 l3 0 m-2-2 l2 2 l-2 2"/>'),
  resonator: S('<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>'),
  echo: S('<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>'),
  tinter: S('<path d="M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z"/>'),
  geode: S('<path d="M5 9 L9 4 L16 5 L20 11 L17 19 L8 20 L4 15 Z"/><path d="M9 10 l3 3 l4-3 M12 13 v5" stroke-width="1"/>'),
};

export const SYS_ICONS = {
  pause: S('<path d="M9 5 v14 M15 5 v14"/>'),
  redraw: S('<path d="M4 12 a8 8 0 0 1 14-5 l2 2"/><path d="M20 4 v5 h-5"/><path d="M20 12 a8 8 0 0 1-14 5 l-2-2"/><path d="M4 20 v-5 h5"/>'),
  glint: S('<path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z"/>'),
  flame: S('<path d="M12 21 c-4 0-6-3-6-6 c0-4 4-6 4-10 c3 2 8 6 8 10 c0 3-2 6-6 6 Z"/>'),
  close: S('<path d="M6 6 L18 18 M18 6 L6 18"/>'),
  replay: S('<path d="M4 12 a8 8 0 1 0 3-6.2"/><path d="M4 4 v5 h5"/><path d="M10 9 l5 3 -5 3 Z" fill="currentColor"/>'),
  star: S('<path d="M12 4 l2.4 5 5.6.6-4.2 3.8 1.2 5.6L12 16.2 7 19l1.2-5.6L4 9.6 9.6 9Z"/>'),
  back: S('<path d="M15 5 L8 12 L15 19"/>'),
  dust: S('<circle cx="7" cy="15" r="1.4"/><circle cx="12" cy="11" r="1.8"/><circle cx="17" cy="16" r="1.2"/><circle cx="10" cy="18" r="0.9"/><circle cx="15" cy="7" r="1"/>'),
  gear: S('<circle cx="12" cy="12" r="3"/><path d="M12 3 v3 M12 18 v3 M3 12 h3 M18 12 h3 M5.6 5.6 l2.1 2.1 M16.3 16.3 l2.1 2.1 M5.6 18.4 l2.1-2.1 M16.3 7.7 l2.1-2.1"/>'),
};

// Setting archetype icons (each Setting shows its archetype glyph plus its initials).
export const ARCH_ICONS = {
  spectrum: S('<path d="M3 17 a9 9 0 0 1 18 0"/><path d="M6 17 a6 6 0 0 1 12 0"/><path d="M9 17 a3 3 0 0 1 6 0"/>'),
  monochrome: S('<circle cx="12" cy="12" r="8"/><path d="M12 4 a8 8 0 0 1 0 16 Z" fill="currentColor"/>'),
  loop: S('<path d="M7 12 a5 5 0 1 0 5-5 h-3"/><path d="M11 5 l-2 2 l2 2"/>'),
  geometry: S('<path d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z"/><path d="M12 3 V21 M4 7.5 L20 16.5 M20 7.5 L4 16.5" stroke-width="1"/>'),
  economy: S('<circle cx="12" cy="12" r="8"/><path d="M12 7 v10 M9.5 9.5 h4 a1.5 1.5 0 0 1 0 3 h-3 a1.5 1.5 0 0 0 0 3 h4"/>'),
};

// Channel glyphs so colour is never the only signal (section 11): R solid bar, G dashed, B dotted.
export function channelGlyph(mask) {
  const bars = [];
  if (mask & 1) bars.push('<path d="M3 5 H21" stroke-width="2.4"/>');
  if (mask & 2) bars.push('<path d="M3 12 H21" stroke-width="2.4" stroke-dasharray="4 3"/>');
  if (mask & 4) bars.push('<path d="M3 19 H21" stroke-width="2.6" stroke-dasharray="0.5 4"/>');
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true">${bars.join('')}</svg>`;
}
