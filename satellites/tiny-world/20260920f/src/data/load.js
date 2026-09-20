// Browser loader for src/data/*.json. URLs resolve against this module so any subpath host works.
export const DATA_FILES = ['creatures', 'weapons', 'gear', 'buildings', 'terrain', 'sprites', 'powers', 'rules', 'names', 'looks', 'art', 'strings', 'tray', 'ui', 'audio', 'starter', 'story', 'reactions', 'stickers'];

// cache: 'no-cache' revalidates every file, so after an update the data can never be older than the code
// that reads it. A failed file is asked for once more (a phone's connection drops a request now and then).
export async function loadData() {
  const out = {};
  // A request that stalls (no error, no bytes) is given up after 10 s, so the retry and the panel still happen.
  const one = async (name) => {
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 10000);
    try {
      const res = await fetch(new URL(`./${name}.json`, import.meta.url), { cache: 'no-cache', signal: ac.signal });
      if (!res.ok) throw new Error(`${name}.json: HTTP ${res.status}`);
      out[name] = await res.json();
    } finally { clearTimeout(t); }
  };
  await Promise.all(DATA_FILES.map((name) => one(name).catch(() => one(name))));
  return out;
}
