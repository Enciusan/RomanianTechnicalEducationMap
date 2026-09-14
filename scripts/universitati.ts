import * as cheerio from 'cheerio'
import type { Entity } from './types'
import { fetchText, norm } from './util'
import meta from './seed/metaranking_2025.json'

const SOURCES = [
  { url: 'https://www.edu.ro/universitati_stat_civile', tag: 'stat', codeRe: /^U\.\d/ },
  { url: 'https://www.edu.ro/universitati_particulare_acreditate', tag: 'privat', codeRe: /^U\.P\.\d/ },
]

// city (normalized) -> judet. Universities name their city; edu.ro table has no city column.
const CITY: Record<string, string> = {
  bucuresti: 'B', 'cluj napoca': 'CJ', brasov: 'BV', iasi: 'IS', timisoara: 'TM', oradea: 'BH',
  galati: 'GL', craiova: 'DJ', 'targu mures': 'MS', sibiu: 'SB', suceava: 'SV', constanta: 'CT',
  targoviste: 'DB', arad: 'AR', ploiesti: 'PH', 'alba iulia': 'AB', pitesti: 'AG', bacau: 'BC',
  petrosani: 'HD', resita: 'CS', 'baia mare': 'MM', 'targu jiu': 'GJ', lugoj: 'TM', cernica: 'IF',
}

// No CS relevance: theology, arts, music, theatre, film, sports, medicine, pharmacy, architecture, agri/vet.
const EXCLUDE_RE = /teolog|\barte\b|\barta\b|muzic|teatr|cinematograf|educatie fizica|\bsport|medicin|farmac|arhitectur|veterinar|agricol|agronom|stiintele vietii/
const LIQUIDATION_RE = /lichidare/i

function cityOf(name: string): { city?: string; judet?: string } {
  const n = norm(name)
  for (const [c, j] of Object.entries(CITY)) if (n.endsWith(c) || n.includes(` din ${c}`)) return { city: c, judet: j }
  return {}
}

const ALIAS: Record<string, string> = {
  // edu.ro name -> metaranking name (renamed institutions)
  'universitatea de stiinte agricole si medicina veterinara a banatului regele mihai i al romaniei din timisoara':
    'universitatea de stiintele vietii regele mihai i din timisoara',
}
const metaByName = new Map(meta.rows.map((r) => [norm(r.name), r]))
function rankOf(name: string) {
  const n = ALIAS[norm(name)] ?? norm(name)
  const hit = metaByName.get(n) ?? [...metaByName.entries()].find(([k]) => k.includes(n) || n.includes(k))?.[1]
  return hit ? { rank: hit.rank, score: hit.score } : {}
}

export async function scrapeUniversitati(): Promise<Entity[]> {
  const scraped_at = new Date().toISOString()
  const out: Entity[] = []
  const unmatched: string[] = []
  for (const SRC of SOURCES) {
  const $ = cheerio.load(await fetchText(SRC.url))
  $('table tr').each((_, tr) => {
    const td = $(tr).find('td')
    if (td.length < 2) return
    const code = td.eq(0).text().trim().replace(/\.$/, '')
    const raw = td.eq(1).text().replace(/\s+/g, ' ').trim()
    const url = td.eq(1).find('a').attr('href')?.trim()
    if (!raw || !SRC.codeRe.test(code)) return
    if (EXCLUDE_RE.test(norm(raw)) || LIQUIDATION_RE.test(raw)) return
    // "NAME (nota)" / "NAME: nota" / "NAME Specializările..." -> split trailing note
    const m = raw.match(/^(.+?)(?:\s*\((.+)\)|:\s*(.+)|\s+(Specializ.+))$/)
    const name = m ? m[1].trim() : raw
    const note = m ? (m[2] ?? m[3] ?? m[4])?.trim() : undefined
    const { city, judet } = cityOf(name)
    if (!judet) unmatched.push(name)
    const r = rankOf(name)
    out.push({
      id: `univ-${code.toLowerCase().replace(/\W+/g, '')}`, // TODO: switch to CUI
      id_source: 'slug',
      category: 'universitate',
      name,
      judet: judet ?? '?',
      city,
      url,
      ...r,
      tags: [SRC.tag, ...(r.rank ? ['metaranking-2025'] : [])],
      notes: note,
      source_url: SRC.url,
      scraped_at,
    })
  })
  }
  if (unmatched.length) console.warn(`[univ] no judet for ${unmatched.length}:`, unmatched.join(' | '))
  const missingRank = meta.rows.filter((m) => !EXCLUDE_RE.test(norm(m.name)) && !out.some((e) => e.rank === m.rank)).map((m) => m.name)
  if (missingRank.length) console.warn(`[univ] metaranking rows not matched:`, missingRank.join(' | '))
  console.log(`[univ] ${out.length} universities, ${out.filter((e) => e.rank).length} ranked`)
  return out
}
