import { writeFileSync } from 'node:fs'
import type { Entity, Category } from './types'
import { scrapeFtc } from './ftc'
import { scrapeUniversitati } from './universitati'
import { scrapeLicee } from './licee'
import { loadSeeds } from './seed'

const PRIORITY: Category[] = [
  'robotica', 'facultate', 'universitate', 'liceu',
  'centru_excelenta', 'asociatie_studenti', 'hub', 'ong',
]

const sources: (() => Promise<Entity[]>)[] = [scrapeFtc, scrapeUniversitati, scrapeLicee, loadSeeds]

const all: Entity[] = []
for (const src of sources) all.push(...(await src()))

const byId = new Map<string, Entity>()
for (const e of all) byId.set(e.id, e) // upsert by id
const data = [...byId.values()].sort(
  (a, b) =>
    PRIORITY.indexOf(a.category) - PRIORITY.indexOf(b.category) ||
    a.judet.localeCompare(b.judet) ||
    (a.rank ?? 1e9) - (b.rank ?? 1e9) ||
    a.name.localeCompare(b.name),
)

const orphans = data.filter((e) => e.parent_id && !byId.has(e.parent_id))
if (orphans.length) console.warn('[build] orphan parent_id:', orphans.map((e) => `${e.id}->${e.parent_id}`).join(', '))

writeFileSync('src/data/data.json', JSON.stringify(data, null, 2) + '\n')
console.log(`[build] wrote ${data.length} entities -> src/data/data.json`)
