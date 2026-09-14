import type { Entity } from './types'
import facultati from './seed/facultati.json'

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
  const out = [...fromSeed(facultati, 'facultate')]
  console.log(`[seed] ${out.length} entities (facultati: ${facultati.length})`)
  return out
}
