export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sampleUnique<T>(items: T[], count: number, exclude?: Set<T>): T[] {
  const pool = exclude ? items.filter((x) => !exclude.has(x)) : [...items];
  const out: T[] = [];
  const n = Math.min(count, pool.length);
  const shuffled = shuffle(pool);
  for (let i = 0; i < n; i += 1) out.push(shuffled[i]);
  return out;
}

export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replaceAll('’', "'").replaceAll('  ', ' ');
}
