import * as XLSX from 'xlsx'
import * as cheerio from 'cheerio'
import type { Entity } from './types'
import { toJudetCode } from './judete'
import { fetchCached, fetchText, norm } from './util'

const XLSX_URL =
  'https://data.gov.ro/dataset/69392a50-5750-4a54-90c1-d461de44da6d/resource/280d52b6-4c5e-489d-9b48-3dd8961f56e0/download/101_claudia.teodorescu_2025-10-08-14_26_03.055.xlsx'
const XLSX_PAGE = 'https://data.gov.ro/dataset/retea-scolara-2025-2026'
const UM = 'https://ultimamedie.ro'
const CONCURRENCY = 8
const MI_RE = /matematic[aă]\s*-?\s*informatic[aă]/i

interface UmSchool { n: string; s: string; jn: string; l: string }
interface Siiir { id: string; name: string; judet: string; city?: string; email?: string; phone?: string; short?: string }

async function loadSiiir(): Promise<Siiir[]> {
  const wb = XLSX.read(await fetchCached(XLSX_URL), { type: 'buffer' })
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 })
  const hi = rows.findIndex((r) => r[0] === 'An')
  const hdr = rows[hi] as string[]
  const c = (n: string) => hdr.indexOf(n)
  const [cJud, cLoc, cSiiir, cName, cShort, cTip, cTel, cEmail] = [
    'Judet PJ', 'Localitate unitate', 'Cod SIIIR unitate', 'Denumire lunga unitate', 'Denumire scurta unitate',
    'Tip unitate', 'Telefon', 'Email',
  ].map(c)
  return rows
    .slice(hi + 1)
    .filter((r) => r[cTip] === 'Unitate de învățământ' && /^(LICEUL|COLEGIUL|SEMINARUL)/i.test(String(r[cName] ?? '')))
    .map((r) => ({
      id: String(r[cSiiir]),
      name: String(r[cName]),
      judet: toJudetCode(String(r[cJud])) ?? '?',
      city: r[cLoc] ? String(r[cLoc]) : undefined,
      email: r[cEmail] ? String(r[cEmail]).trim() : undefined,
      phone: r[cTel] ? String(r[cTel]) : undefined,
      short: r[cShort] ? String(r[cShort]) : undefined,
    }))
}

async function loadUmSchools(): Promise<UmSchool[]> {
  const js = await fetchText(`${UM}/schools.js`)
  return JSON.parse(js.replace(/^window\.SCHOOLS\s*=\s*/, '').trim().replace(/;$/, ''))
}

interface Spec { spec: string; profil: string; limba: string; medie: number | null }
async function loadSpecs(slug: string): Promise<Spec[]> {
  const $ = cheerio.load(await fetchText(`${UM}/liceu/${slug}.html`))
  const out: Spec[] = []
  $('table tr').each((_, tr) => {
    const td = $(tr).find('td')
    if (td.length < 4) return
    const m = Number(td.eq(3).text().replace(',', '.'))
    out.push({ spec: td.eq(0).text().trim(), profil: td.eq(1).text().trim(), limba: td.eq(2).text().trim(), medie: Number.isFinite(m) ? m : null })
  })
  return out
}

async function pmap<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const res: R[] = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; res[k] = await fn(items[k]) }
  }))
  return res
}

function findSiiir(s: UmSchool, judet: string, pool: Siiir[]): Siiir | undefined {
  const tn = norm(s.n)
  const cands = pool.filter((e) => e.judet === judet)
  return (
    cands.find((e) => norm(e.name) === tn) ??
    cands.find((e) => norm(e.name).startsWith(tn) || tn.startsWith(norm(e.name))) ??
    cands.find((e) => norm(e.name).includes(tn) || tn.includes(norm(e.name)))
  )
}

export async function scrapeLicee(): Promise<Entity[]> {
  const [siiir, um] = await Promise.all([loadSiiir(), loadUmSchools()])
  console.log(`[licee] ${um.length} licee on ultimamedie, fetching specializations (cached)...`)
  const specs = await pmap(um, CONCURRENCY, async (s) => {
    try { return await loadSpecs(s.s) } catch (e) { console.warn(`[licee] fail ${s.s}: ${(e as Error).message}`); return [] }
  })
  const scraped_at = new Date().toISOString()
  const out: Entity[] = []
  const unmatched: string[] = []
  um.forEach((s, i) => {
    const mi = specs[i].filter((x) => MI_RE.test(x.spec))
    if (!mi.length) return
    const judet = toJudetCode(s.jn) ?? '?'
    const hit = findSiiir(s, judet, siiir)
    if (!hit) unmatched.push(`${s.s}`)
    const best = Math.max(...mi.map((x) => x.medie ?? 0)) || undefined
    const bil = mi.some((x) => !/român/i.test(x.limba))
    out.push({
      id: hit?.id ?? `um-${s.s}`,
      id_source: hit ? 'siiir' : 'slug',
      category: 'liceu',
      name: s.n,
      judet,
      city: hit?.city ?? s.l,
      url: `${UM}/liceu/${s.s}.html`,
      email: hit?.email,
      phone: hit?.phone,
      score: best,
      tags: ['mate-info', ...(bil ? ['bilingv'] : [])],
      notes: mi.map((x) => `${x.spec} (${x.limba})${x.medie ? ` ${x.medie}` : ''}`).join('; '),
      source_url: `${UM}/liceu/${s.s}.html`,
      scraped_at,
    })
  })
  // rank nationally by best mate-info ultima medie
  out.filter((e) => e.score).sort((a, b) => b.score! - a.score!).forEach((e, i) => (e.rank = i + 1))
  if (unmatched.length) console.warn(`[licee] no SIIIR match ${unmatched.length}: ${unmatched.slice(0, 15).join(', ')}${unmatched.length > 15 ? '…' : ''}`)
  console.log(`[licee] ${out.length} mate-info licee, ${out.filter((e) => e.email).length} with email, ${out.filter((e) => e.rank).length} ranked`)
  return out
}
