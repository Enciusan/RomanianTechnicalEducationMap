import * as XLSX from 'xlsx'
import * as cheerio from 'cheerio'
import type { Entity } from './types'
import { toJudetCode } from './judete'
import { fetchCached, fetchText, norm } from './util'

const XLSX_URL =
  'https://data.gov.ro/dataset/69392a50-5750-4a54-90c1-d461de44da6d/resource/280d52b6-4c5e-489d-9b48-3dd8961f56e0/download/101_claudia.teodorescu_2025-10-08-14_26_03.055.xlsx'
const XLSX_PAGE = 'https://data.gov.ro/dataset/retea-scolara-2025-2026'
const TOP_URL = 'https://ultimamedie.ro/top-licee.html'

const LICEU_RE = /^(LICEUL|COLEGIUL|SEMINARUL)/i
const EXCLUDE_RE = /SPECIAL|POSTLICEAL|PENITENCIAR/i

interface TopRow { rank: number; name: string; judet: string; spec: string; score: number }

async function scrapeTop(): Promise<TopRow[]> {
  const $ = cheerio.load(await fetchText(TOP_URL))
  const rows: TopRow[] = []
  $('table tr').each((_, tr) => {
    const td = $(tr).find('td')
    if (td.length < 5) return
    rows.push({
      rank: Number(td.eq(0).text()),
      name: td.eq(1).text().trim(),
      judet: toJudetCode(td.eq(2).text()) ?? '?',
      spec: td.eq(3).text().trim(),
      score: Number(td.eq(4).text()),
    })
  })
  return rows
}

export async function scrapeLicee(): Promise<Entity[]> {
  const wb = XLSX.read(await fetchCached(XLSX_URL), { type: 'buffer' })
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 })
  const hi = rows.findIndex((r) => r[0] === 'An')
  const hdr = rows[hi] as string[]
  const col = (n: string) => hdr.indexOf(n)
  const [cJud, cLoc, cSiiir, cName, cShort, cTip, cCui, cTel, cEmail] = [
    'Judet PJ', 'Localitate unitate', 'Cod SIIIR unitate', 'Denumire lunga unitate', 'Denumire scurta unitate',
    'Tip unitate', 'Cod fiscal', 'Telefon', 'Email',
  ].map(col)
  const scraped_at = new Date().toISOString()

  const out: Entity[] = []
  for (const r of rows.slice(hi + 1)) {
    const name = String(r[cName] ?? '')
    if (r[cTip] !== 'Unitate de învățământ' || !LICEU_RE.test(name) || EXCLUDE_RE.test(name)) continue
    out.push({
      id: String(r[cSiiir]),
      id_source: 'siiir',
      category: 'liceu',
      name,
      judet: toJudetCode(String(r[cJud])) ?? '?',
      city: r[cLoc] ? String(r[cLoc]) : undefined,
      email: r[cEmail] ? String(r[cEmail]).trim() : undefined,
      phone: r[cTel] ? String(r[cTel]) : undefined,
      tags: [],
      notes: r[cShort] ? String(r[cShort]) : undefined,
      source_url: XLSX_PAGE,
      scraped_at,
    })
    void cCui
  }

  // Attach top-100 admission rank (ultimamedie.ro) by judet + fuzzy name.
  const top = await scrapeTop()
  const unmatched: string[] = []
  for (const t of top) {
    const tn = norm(t.name)
    const cands = out.filter((e) => e.judet === t.judet)
    const hit =
      cands.find((e) => norm(e.name) === tn) ??
      cands.find((e) => norm(e.name).startsWith(tn) || tn.startsWith(norm(e.name))) ??
      cands.find((e) => norm(e.name).includes(tn) || tn.includes(norm(e.name)))
    if (!hit) { unmatched.push(`${t.rank} ${t.name} (${t.judet})`); continue }
    hit.rank = t.rank
    hit.score = t.score
    hit.tags = ['top-100', ...(/informatic/i.test(t.spec) ? ['informatica'] : [])]
    hit.notes = `${hit.notes ?? ''} | ${t.spec} ultima medie ${t.score}`.replace(/^ \| /, '')
  }
  if (unmatched.length) console.warn(`[licee] top-100 unmatched ${unmatched.length}:`, unmatched.join('; '))
  console.log(`[licee] ${out.length} licee, ${out.filter((e) => e.rank).length} ranked, ${out.filter((e) => e.email).length} with email`)
  return out
}
