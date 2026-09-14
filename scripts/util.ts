import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

export const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; hartaSistemeInvatamant/0.1)' }

/** Lowercase, strip diacritics/quotes/punctuation, collapse spaces. For fuzzy name matching. */
export function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[şŞ]/g, 's')
    .replace(/[ţŢ]/g, 't')
    .toLowerCase()
    .replace(/[„”"“'`’‘«»,.()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** fetch with on-disk cache in scripts/.cache (binary). */
export async function fetchCached(url: string): Promise<Buffer> {
  const dir = 'scripts/.cache'
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const key = createHash('sha1').update(url).digest('hex').slice(0, 12)
  const m = url.split('?')[0].match(/\.([a-z0-9]{2,5})$/i)
  const ext = m ? m[1] : 'html'
  const file = `${dir}/${key}.${ext}`
  if (existsSync(file)) return readFileSync(file)
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  const buf = Buffer.from(await r.arrayBuffer())
  writeFileSync(file, buf)
  return buf
}

export const fetchText = async (url: string) => (await fetchCached(url)).toString('utf-8')
