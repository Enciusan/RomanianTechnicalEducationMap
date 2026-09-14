import judete from './judete.json'

export interface Judet {
  code: string
  name: string
  siruta: number
}

export const JUDETE: Judet[] = judete

const strip = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[şŞţŢ]/g, (c) => ({ ş: 's', Ş: 'S', ţ: 't', Ţ: 'T' })[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z]/g, '')

const byName = new Map(JUDETE.map((j) => [strip(j.name), j.code]))
const byCode = new Map(JUDETE.map((j) => [j.code.toLowerCase(), j.code]))
const bySiruta = new Map(JUDETE.map((j) => [j.siruta, j.code]))

/** Resolve free-text county (name, code, or SIRUTA) to ISO 3166-2:RO code. */
export function toJudetCode(input: string | number | null | undefined): string | undefined {
  if (input == null) return undefined
  if (typeof input === 'number') return bySiruta.get(input)
  const raw = input.trim()
  if (!raw) return undefined
  const code = byCode.get(raw.toLowerCase())
  if (code) return code
  const key = strip(raw)
  if (key.startsWith('bucuresti') || key === 'municipiulbucuresti') return 'B'
  const exact = byName.get(key)
  if (exact) return exact
  for (const [name, c] of byName) if (key.startsWith(name)) return c
  return undefined
}
