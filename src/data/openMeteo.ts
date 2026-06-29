/**
 * Live weather/forecast source for the map overlay, backed by the free
 * Open-Meteo APIs (no API key required):
 *   - https://api.open-meteo.com/v1/forecast        (atmosphere)
 *   - https://marine-api.open-meteo.com/v1/marine    (ocean)
 *
 * The map paints a field at viewport resolution every frame, far too many
 * points to query directly. Instead we fetch a coarse grid over the current
 * view (`COLS × ROWS` points), cache it, and let `sampleLiveField()` do a
 * fast bilinear interpolation. The layer falls back to the synthetic field
 * while a grid is loading or if a request fails.
 */

import type { FieldSample } from './weatherField';

export interface LatLngBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

const COLS = 7;
const ROWS = 7;
const KMH_TO_KT = 0.539957;
/** How many hours ahead the forecast slider can reach. */
export const MAX_FORECAST_HOURS = 120;

interface FactorQuery {
  /** 'forecast' atmosphere API or 'marine' ocean API. */
  api: 'forecast' | 'marine';
  /** Magnitude variable on the Open-Meteo `current` block. */
  magVar: string;
  /** Optional direction variable (deg) for vector factors. */
  dirVar?: string;
  /** Convert raw magnitude into the factor's display unit. */
  scale?: (v: number) => number;
}

const FACTOR_QUERY: Record<string, FactorQuery> = {
  wind: { api: 'forecast', magVar: 'wind_speed_10m', dirVar: 'wind_direction_10m' },
  gusts: { api: 'forecast', magVar: 'wind_gusts_10m', dirVar: 'wind_direction_10m' },
  pressure: { api: 'forecast', magVar: 'surface_pressure' },
  precipitation: { api: 'forecast', magVar: 'precipitation' },
  airTemp: { api: 'forecast', magVar: 'temperature_2m' },
  waves: { api: 'marine', magVar: 'wave_height', dirVar: 'wave_direction' },
  swell: { api: 'marine', magVar: 'swell_wave_height', dirVar: 'swell_wave_direction' },
  seaTemp: { api: 'marine', magVar: 'sea_surface_temperature' },
  currents: {
    api: 'marine',
    magVar: 'ocean_current_velocity',
    dirVar: 'ocean_current_direction',
    scale: (v) => v * KMH_TO_KT,
  },
};

/** Whether a factor can be served by Open-Meteo. */
export function hasLiveSource(factorId: string): boolean {
  return factorId in FACTOR_QUERY;
}

interface Grid {
  bounds: LatLngBounds;
  cols: number;
  rows: number;
  mag: number[];
  dir: number[];
}

const cache = new Map<string, Grid>();
const pending = new Map<string, Promise<Grid | null>>();

function keyFor(factorId: string, b: LatLngBounds, hour: number): string {
  const r = (n: number) => Math.round(n * 2) / 2; // 0.5° buckets
  return `${factorId}:${hour}:${r(b.south)},${r(b.west)},${r(b.north)},${r(b.east)}`;
}

function buildGridPoints(b: LatLngBounds): { lats: number[]; lons: number[] } {
  const lats: number[] = [];
  const lons: number[] = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const fy = r / (ROWS - 1);
      const fx = c / (COLS - 1);
      lats.push(b.north + (b.south - b.north) * fy);
      lons.push(b.west + (b.east - b.west) * fx);
    }
  }
  return { lats, lons };
}

async function fetchGrid(factorId: string, b: LatLngBounds, hour: number): Promise<Grid | null> {
  const q = FACTOR_QUERY[factorId];
  if (!q) return null;
  const { lats, lons } = buildGridPoints(b);
  const vars = [q.magVar, q.dirVar].filter(Boolean).join(',');
  const base =
    q.api === 'forecast'
      ? 'https://api.open-meteo.com/v1/forecast'
      : 'https://marine-api.open-meteo.com/v1/marine';
  const url =
    `${base}?latitude=${lats.join(',')}&longitude=${lons.join(',')}` +
    `&hourly=${vars}&wind_speed_unit=kn&timezone=UTC&forecast_days=6`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = (await res.json()) as unknown;
  const list = Array.isArray(json) ? json : [json];

  const mag: number[] = [];
  const dir: number[] = [];
  for (const cell of list) {
    const hr = (cell as { hourly?: Record<string, number[]> }).hourly ?? {};
    const idx = Math.min(hour, (hr[q.magVar]?.length ?? 1) - 1);
    const raw = Number(hr[q.magVar]?.[idx]);
    mag.push(q.scale ? q.scale(raw || 0) : raw || 0);
    dir.push(q.dirVar ? Number(hr[q.dirVar]?.[idx]) || 0 : 0);
  }
  return { bounds: b, cols: COLS, rows: ROWS, mag, dir };
}

/** Kick off (or reuse) a fetch of the grid covering `b` for the factor. */
export function ensureLiveData(
  factorId: string,
  b: LatLngBounds,
  hour: number,
  onReady: () => void,
): void {
  if (!hasLiveSource(factorId)) return;
  const key = keyFor(factorId, b, hour);
  if (cache.has(key) || pending.has(key)) return;
  const p = fetchGrid(factorId, b, hour)
    .then((g) => {
      if (g) cache.set(key, g);
      return g;
    })
    .catch(() => null)
    .finally(() => {
      pending.delete(key);
      onReady();
    });
  pending.set(key, p);
}

/** Bilinear sample of the cached grid, or `null` if not loaded yet. */
export function sampleLiveField(
  lat: number,
  lon: number,
  factorId: string,
  b: LatLngBounds,
  hour: number,
): FieldSample | null {
  const g = cache.get(keyFor(factorId, b, hour));
  if (!g) return null;
  const { north, south, west, east } = g.bounds;
  const fy = ((north - lat) / (north - south || 1)) * (g.rows - 1);
  const fx = ((lon - west) / (east - west || 1)) * (g.cols - 1);
  const r0 = Math.max(0, Math.min(g.rows - 1, Math.floor(fy)));
  const c0 = Math.max(0, Math.min(g.cols - 1, Math.floor(fx)));
  const r1 = Math.min(g.rows - 1, r0 + 1);
  const c1 = Math.min(g.cols - 1, c0 + 1);
  const ty = fy - r0;
  const tx = fx - c0;
  const at = (r: number, c: number) => g.mag[r * g.cols + c];
  const magnitude =
    at(r0, c0) * (1 - tx) * (1 - ty) +
    at(r0, c1) * tx * (1 - ty) +
    at(r1, c0) * (1 - tx) * ty +
    at(r1, c1) * tx * ty;
  return { magnitude, directionDeg: g.dir[r0 * g.cols + c0] };
}
