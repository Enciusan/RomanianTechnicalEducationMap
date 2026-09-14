import type { Entity, Category } from '../../scripts/types'
import judete from '../../scripts/judete.json'
import raw from '@/data/data.json'

export type { Entity, Category }

export const DATA = raw as Entity[]

export const JUDETE = judete as { code: string; name: string; siruta: number }[]
export const JUDET_NAME = new Map(JUDETE.map((j) => [j.code, j.name]))

export interface CategoryMeta { label: string; short: string; color: string; order: number }

export const CATEGORY: Record<Category, CategoryMeta> = {
  universitate: { label: 'Universități', short: 'Univ', color: 'oklch(0.72 0.19 300)', order: 0 },
  facultate: { label: 'Facultăți CS', short: 'Fac', color: 'oklch(0.86 0.2 165)', order: 1 },
  liceu: { label: 'Licee mate-info', short: 'Liceu', color: 'oklch(0.78 0.16 230)', order: 2 },
  robotica: { label: 'Robotică FTC', short: 'FTC', color: 'oklch(0.8 0.17 60)', order: 3 },
  centru_excelenta: { label: 'Centre excelență', short: 'CEX', color: 'oklch(0.82 0.15 100)', order: 4 },
  asociatie_studenti: { label: 'Asociații studenți', short: 'Asoc', color: 'oklch(0.75 0.17 350)', order: 5 },
  hub: { label: 'Hubs', short: 'Hub', color: 'oklch(0.8 0.12 200)', order: 6 },
  ong: { label: 'ONG', short: 'ONG', color: 'oklch(0.65 0.02 260)', order: 7 },
}

export const CATEGORIES = (Object.keys(CATEGORY) as Category[]).sort((a, b) => CATEGORY[a].order - CATEGORY[b].order)

export const BY_ID = new Map(DATA.map((e) => [e.id, e]))

export function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[şŞ]/g, 's').replace(/[ţŢ]/g, 't').toLowerCase()
}
