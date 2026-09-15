/* The teacher's link builder (00-CORE-handoff 2.9; plans/math/HANDOFF-CORE.md P3 step 3).
   One control per key of the chosen game's schema; every change rebuilds the link with
   buildQuery, which the game will read back with parseConfig. A number outside its bounds is
   marked invalid and never reaches the link. Nothing is saved and nothing is fetched. */
import { buildQuery, COPY } from '../core/core.js?v=20260915e';
import { GAMES } from './schemas.js?v=20260915e';

const gameEl = document.getElementById('game'), fields = document.getElementById('fields');
const linkEl = document.getElementById('link'), openEl = document.getElementById('open');

for (const id of Object.keys(GAMES)) {
  const option = document.createElement('option');
  option.value = id;
  option.textContent = GAMES[id].label;
  gameEl.append(option);
}

function readValues(schema) {
  const out = {};
  for (const key of Object.keys(schema)) {
    const rule = schema[key], el = fields.querySelector('[data-key="' + key + '"]');
    if (!el) continue;
    if (rule.type === 'enum') out[key] = el.value;
    else if (rule.type === 'bool') out[key] = el.value === '1';
    else {
      const n = Number(el.value);
      const ok = el.value !== '' && Number.isInteger(n) && n >= rule.min && n <= rule.max;
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      out[key] = ok ? n : rule.default;
    }
  }
  return out;
}

function update() {
  const game = GAMES[gameEl.value];
  const href = new URL(game.path + buildQuery(readValues(game.schema), game.schema), location.href).href;
  linkEl.value = href;
  openEl.href = href;
}

function render() {
  const game = GAMES[gameEl.value];
  fields.textContent = '';
  for (const key of Object.keys(game.schema)) {
    const rule = game.schema[key];
    const row = document.createElement('label');
    row.className = 'cfg-row';
    const name = document.createElement('span');
    name.textContent = rule.label || key;
    let control;
    if (rule.type === 'enum' || rule.type === 'bool') {
      control = document.createElement('select');
      const choices = rule.type === 'enum'
        ? rule.values.map(v => [v, (rule.names && rule.names[v]) || v])
        : [['1', COPY.on], ['0', COPY.off]];
      for (const [value, label] of choices) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        control.append(option);
      }
      control.value = rule.type === 'enum' ? rule.default : (rule.default ? '1' : '0');
    } else {
      control = document.createElement('input');
      control.type = 'number';
      control.min = String(rule.min);
      control.max = String(rule.max);
      control.step = '1';
      control.inputMode = 'numeric';
      control.value = String(rule.default);
    }
    control.dataset.key = key;
    control.className = 'lw-btn cfg-control';
    control.addEventListener('input', update);
    control.addEventListener('change', update);
    row.append(name, control);
    fields.append(row);
  }
  update();
}

gameEl.addEventListener('change', render);
render();

window.CONFIG_PAGE = { ready: true, games: GAMES, link: () => linkEl.value };
