import * as XLSX from 'xlsx'
import type { Entity } from './types'
import { toJudetCode } from './judete'
import { fetchCached, norm } from './util'

const URL_ =
  'https://data.gov.ro/dataset/6fa0e262-bd3d-4b40-b010-22a54bf0c0cb/resource/f8a213d9-d30a-4c22-a6e0-165885079dde/download/17nov2025_asociatii.xlsx'
const PAGE = 'https://data.gov.ro/dataset/registrul-national-ong-2025'
// Match on name only (scope text too noisy). Active orgs only.
const NAME_RE = /\b(robotic|informatic|programare|programator|software|blockchain|hackathon|cybersec|coding|calculatoare|tehnologia informatiei|it\s*&\s*c)\b/

export async function scrapeOng(): Promise<Entity[]> {
  const wb = XLSX.read(await fetchCached(URL_), { type: 'buffer' })
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 })
  const hdr = rows[0] as string[]
  const c = (n: string) => hdr.indexOf(n)
  const [cName, cReg, cStare, cJud, cLoc, cScop] = ['Denumire', 'Numar inreg Reg National', 'Starea actuala', 'Judet', 'Localitate', 'Scopul initial'].map(c)
  const scraped_at = new Date().toISOString()
  const out: Entity[] = []
  for (const r of rows.slice(1)) {
    const name = String(r[cName] ?? '').replace(/\s+/g, ' ').trim()
    if (!name || r[cStare] || !NAME_RE.test(norm(name))) continue
    const reg = String(r[cReg] ?? '').trim()
    out.push({
      id: `ong-${reg.replace(/\W+/g, '-') || norm(name).replace(/\s+/g, '-')}`,
      id_source: 'slug',
      category: 'ong',
      name,
      judet: toJudetCode(String(r[cJud] ?? '')) ?? '?',
      city: r[cLoc] ? String(r[cLoc]) : undefined,
      tags: ['registru-ong'],
      notes: r[cScop] ? String(r[cScop]).slice(0, 300) : undefined,
      source_url: PAGE,
      scraped_at,
    })
  }
  console.log(`[ong] ${out.length} tech/edu associations (no contact data in register)`)
  return out
}
