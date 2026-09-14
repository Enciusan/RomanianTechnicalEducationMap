import type { Entity } from './types'
import facultati from './seed/facultati.json'
import cex from './seed/cex.json'
import asociatii from './seed/asociatii.json'
import hubs from './seed/hubs.json'

type Seed = Partial<Entity> & Pick<Entity, 'id' | 'name' | 'judet' | 'source_url'>

function fromSeed(rows: Seed[], category: Entity['category']): Entity[] {
  const scraped_at = new Date().toISOString()
  return rows.map((r) => ({
    id_source: 'slug',
    category,
    tags: [],
    ...r,
    scraped_at,
  })) as Entity[]
}

export async function loadSeeds(): Promise<Entity[]> {
  const out = [
    ...fromSeed(facultati, 'facultate'),
    ...fromSeed(cex, 'centru_excelenta'),
    ...fromSeed(asociatii, 'asociatie_studenti'),
    ...fromSeed(hubs, 'hub'),
  ]
  console.log(`[seed] ${out.length} entities (facultati ${facultati.length}, cex ${cex.length}, asociatii ${asociatii.length}, hubs ${hubs.length})`)
  return out
}
