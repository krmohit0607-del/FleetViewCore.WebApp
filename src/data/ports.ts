/**
 * World ports lookup.
 *
 * Fetches the NGA World Port Index (~3k genuine sea ports) once and
 * caches it for the session. Used to populate port dropdowns. When a real
 * port-master endpoint is exposed, swap the fetch URL / mapping here —
 * callers use `useWorldPorts` / `resolveWorldPort` unchanged.
 */

import { useEffect, useState } from 'react';

const PORTS_URL =
  '/wpi/api/publications/world-port-index?output=json';
const PORTS_URL_DIRECT =
  'https://msi.nga.mil/api/publications/world-port-index?output=json';

export interface WorldPort {
  /** UN/LOCODE, e.g. "AE AUH". */
  code: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  /** Display label: "Name, Country (CODE)". */
  label: string;
}

interface RawPort {
  portName?: string;
  countryName?: string;
  unloCode?: string;
  ycoord?: number; // latitude
  xcoord?: number; // longitude
}

let cache: WorldPort[] | null = null;
let inflight: Promise<WorldPort[]> | null = null;

/** Fetch + cache the world ports list (sorted by name). */
export async function loadWorldPorts(): Promise<WorldPort[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    let data: { ports?: RawPort[] };
    try {
      const res = await fetch(PORTS_URL);
      if (!res.ok) throw new Error(`Failed to load ports (${res.status})`);
      data = (await res.json()) as { ports?: RawPort[] };
    } catch {
      // Same-origin proxy unavailable — try the source directly.
      const res = await fetch(PORTS_URL_DIRECT);
      if (!res.ok) throw new Error(`Failed to load ports (${res.status})`);
      data = (await res.json()) as { ports?: RawPort[] };
    }
    const ports: WorldPort[] = [];
    for (const p of data.ports ?? []) {
      const lat = p.ycoord;
      const lon = p.xcoord;
      if (!p.portName || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const country = p.countryName ?? '';
      const code = (p.unloCode ?? '').trim();
      ports.push({
        code,
        name: p.portName,
        country,
        lat: lat as number,
        lon: lon as number,
        label: code
          ? `${p.portName}, ${country} (${code})`
          : `${p.portName}, ${country}`,
      });
    }
    ports.sort((a, b) => a.name.localeCompare(b.name));
    cache = ports;
    return ports;
  })();
  return inflight;
}

/** Resolve a typed value (port name, label, or UN/LOCODE) to a port. */
export function resolveWorldPort(value: string, ports: WorldPort[]): WorldPort | null {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  return (
    ports.find((p) => p.label.toLowerCase() === v) ??
    ports.find((p) => p.code.toLowerCase() === v) ??
    ports.find((p) => p.name.toLowerCase() === v) ??
    null
  );
}

/** React hook: loads the world ports once and exposes the cached list. */
export function useWorldPorts(): WorldPort[] {
  const [ports, setPorts] = useState<WorldPort[]>(cache ?? []);
  useEffect(() => {
    if (cache) {
      setPorts(cache);
      return;
    }
    let active = true;
    loadWorldPorts()
      .then((p) => {
        if (active) setPorts(p);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return ports;
}
