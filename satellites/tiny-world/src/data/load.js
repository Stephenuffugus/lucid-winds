// Browser loader for src/data/*.json. URLs resolve against this module so any subpath host works.
export const DATA_FILES = ['creatures', 'weapons', 'gear', 'buildings', 'terrain', 'sprites', 'powers', 'rules', 'names', 'looks', 'art', 'strings', 'tray'];

// cache: 'no-cache' revalidates every file, so after an update the data can never be older than the code
// that reads it. A failed file is asked for once more (a phone's connection drops a request now and then).
export async function loadData() {
  const out = {};
  const one = async (name) => {
    const res = await fetch(new URL(`./${name}.json`, import.meta.url), { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${name}.json: HTTP ${res.status}`);
    out[name] = await res.json();
  };
  await Promise.all(DATA_FILES.map((name) => one(name).catch(() => one(name))));
  return out;
}
