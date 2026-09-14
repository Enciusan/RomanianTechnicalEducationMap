import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { Entity } from './types'
import { JUDETE } from './judete'
import { UA, norm } from './util'

const CACHE = 'scripts/.cache/geocode.json'
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Cache = Record<string, { lat: number; lng: number } | null>

function load(): Cache { return existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf-8')) : {} }
function save(c: Cache) { writeFileSync(CACHE, JSON.stringify(c, null, 1)) }

async function lookup(city: string, judetName: string): Promise<{ lat: number; lng: number } | null> {
  const q = new URLSearchParams({ q: `${city}, ${judetName}, Romania`, format: 'json', limit: '1', countrycodes: 'ro' })
  const r = await fetch(`${NOMINATIM}?${q}`, { headers: { ...UA, 'Accept-Language': 'ro' } })
  if (!r.ok) throw new Error(`${r.status} nominatim ${city}`)
  const j = (await r.json()) as { lat: string; lon: string }[]
  return j[0] ? { lat: Number(j[0].lat), lng: Number(j[0].lon) } : null
}

/** Fill lat/lng for entities lacking them, by city+judet. Cached; 1 req/s (Nominatim policy). */
export async function geocode(entities: Entity[]): Promise<void> {
  const cache = load()
  const judetName = new Map(JUDETE.map((j) => [j.code, j.name]))
  const todo = new Map<string, { city: string; judet: string }>()
  for (const e of entities) {
    if (e.lat != null || e.judet === '?') continue
    const city = e.city || judetName.get(e.judet)! // fallback: county seat/centroid
    const key = `${norm(city)}|${e.judet}`
    if (!(key in cache)) todo.set(key, { city, judet: e.judet })
  }
  if (todo.size) console.log(`[geo] ${todo.size} new places to geocode (~${todo.size}s)`)
  let n = 0
  for (const [key, { city, judet }] of todo) {
    try {
      cache[key] = await lookup(city, judetName.get(judet) ?? judet)
    } catch (err) {
      console.warn(`[geo] ${city} ${judet}: ${(err as Error).message}`)
      continue
    }
    if (++n % 25 === 0) save(cache)
    await sleep(1100)
  }
  save(cache)
  let hit = 0, miss = 0
  for (const e of entities) {
    if (e.lat != null) { hit++; continue }
    const city = e.city || judetName.get(e.judet)
    const c = city && e.judet !== '?' ? cache[`${norm(city)}|${e.judet}`] : null
    if (c) { e.lat = c.lat; e.lng = c.lng; hit++ } else miss++
  }
  console.log(`[geo] ${hit} with coords, ${miss} without`)
}
