import type { Entity } from './types'
import { toJudetCode } from './judete'

const API = 'https://natieprineducatie.ro/api'
const SEASON_ID = 3 // Decode 2025 (full roster). 4 = BIOBUZZ 2026, registration ongoing.
const UA = { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' }

interface PublicTeam {
  id: string
  internationalNumber: string
  name: string
  rookieYear: string
  currentSeasonData: { registrationStatus: string; school: string; city: string }
}

interface SeasonTeam {
  teamId: string
  school: string
  city: string
  county: string | null
  primaryEmailContact: string | null
  teamWebsiteLink: string | null
  facebookLink: string | null
  instagramLink: string | null
  youtubeLink: string | null
  registrationStatus: string
}

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  const j = (await r.json()) as { success: boolean; message: T }
  return j.message
}

export async function scrapeFtc(): Promise<Entity[]> {
  const listUrl = `${API}/teams/public/list?seasonId=${SEASON_ID}`
  const [list, seasons] = await Promise.all([
    getJson<PublicTeam[]>(listUrl),
    getJson<{ id: number; teamSeasonData: SeasonTeam[] }[]>(`${API}/seasons`),
  ])
  const season = seasons.find((s) => s.id === SEASON_ID)
  const byTeam = new Map(season?.teamSeasonData.map((t) => [t.teamId, t]) ?? [])
  const scraped_at = new Date().toISOString()
  const missingCounty: string[] = []

  const out: Entity[] = list.map((t) => {
    const s = byTeam.get(t.id)
    const judet = toJudetCode(s?.county)
    if (!judet) missingCounty.push(`${t.internationalNumber} ${t.name} (${s?.county ?? 'null'})`)
    const url = s?.teamWebsiteLink || s?.facebookLink || s?.instagramLink || s?.youtubeLink || undefined
    return {
      id: `ftc-${t.internationalNumber}`,
      id_source: 'slug',
      category: 'robotica',
      name: `${t.name} #${t.internationalNumber}`,
      judet: judet ?? '?',
      city: s?.city || t.currentSeasonData.city || undefined,
      url: url || undefined,
      email: s?.primaryEmailContact || undefined,
      tags: ['ftc', `rookie-${t.rookieYear}`],
      notes: `Școala: ${s?.school || t.currentSeasonData.school}`,
      source_url: 'https://natieprineducatie.ro/teams/',
      scraped_at,
    }
  })

  if (missingCounty.length) console.warn(`[ftc] no judet for ${missingCounty.length}:`, missingCounty.join('; '))
  console.log(`[ftc] ${out.length} teams, ${out.filter((e) => e.email).length} with email`)
  return out
}
