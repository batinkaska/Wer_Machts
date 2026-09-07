type PlzTable = Record<string, [number, number, string, number]>;

export interface PlzSuggestion {
  plz: string;
  placeName: string;
}

let cache: PlzTable | null = null;

async function loadTable(): Promise<PlzTable> {
  if (!cache) {
    const mod = await import("../data/de-postal-codes.json");
    cache = mod.default as unknown as PlzTable;
  }
  return cache;
}

export function isValidPlzFormat(plz: string): boolean {
  return /^\d{5}$/.test(plz);
}

export async function getCoordinates(
  plz: string,
): Promise<{ lat: number; lng: number } | undefined> {
  if (!isValidPlzFormat(plz)) return undefined;
  const table = await loadTable();
  const entry = table[plz];
  return entry ? { lat: entry[0], lng: entry[1] } : undefined;
}

export async function getPlaceName(plz: string): Promise<string | undefined> {
  const table = await loadTable();
  return table[plz]?.[2] || undefined;
}

export async function searchPostalCodes(
  query: string,
  limit = 12,
): Promise<PlzSuggestion[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const table = await loadTable();
  const results: PlzSuggestion[] = [];
  const isNumeric = /^\d+$/.test(q);

  for (const plz of Object.keys(table)) {
    const [, , placeName, isClean] = table[plz];
    if (!isClean) continue;
    const matches = isNumeric
      ? plz.startsWith(q)
      : placeName?.toLowerCase().startsWith(q);
    if (matches) {
      results.push({ plz, placeName });
      if (results.length >= limit) break;
    }
  }

  return results;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
