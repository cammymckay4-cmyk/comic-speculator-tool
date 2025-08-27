import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const OUT = path.resolve('.cache/gcd');

// Ensure output directory exists
await fs.mkdir(OUT, { recursive: true });

// Download helper: fetch a URL and save it to disk
async function dl(url: string, file: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  await fs.writeFile(path.join(OUT, file), text);
  return text;
}

// Define publishers to seed (expand as needed)
const publishers = [
  { name: 'Marvel', url: 'https://www.comics.org/publisher/78/' },
  { name: 'DC',     url: 'https://www.comics.org/publisher/54/' },
];

// Construct paginated URL for GCD JSON (format=json)
function pageUrl(base: string, page: number) {
  return `${base}?page=${page}&format=json`;
}

// Parse series from downloaded JSON
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSeriesFromJson(raw: any, publisherName?: string) {
  if (!raw || !Array.isArray(raw.items)) return [];
  return raw.items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((s: any) => (s.year ?? 0) >= 1980)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any) => ({
      ext_id: String(s.id),
      name: s.name,
      publisher: publisherName ?? (s.publisher || null),
      start_year: s.year ?? null,
      raw: s,
    }));
}

// Upsert series into staging table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertSeries(rows: any[]) {
  if (!rows.length) return;
  const { error } = await supabase
    .from('gcd_series_stg')
    .upsert(rows, { onConflict: 'ext_id' });
  if (error) throw error;
}

// Main async function to seed data
(async () => {
  for (const pub of publishers) {
    for (let p = 1; p <= 3; p++) {
      const fileContent = await dl(pageUrl(pub.url, p), `${pub.name.toLowerCase()}-p${p}.json`);
      const json = JSON.parse(fileContent);
      const series = parseSeriesFromJson(json, pub.name);
      await upsertSeries(series);
    }
  }
  console.log('Initial GCD seed completed.');
})();
