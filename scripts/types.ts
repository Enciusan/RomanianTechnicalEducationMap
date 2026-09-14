export type Category =
  | 'liceu'
  | 'centru_excelenta'
  | 'universitate'
  | 'facultate'
  | 'robotica'
  | 'asociatie_studenti'
  | 'ong'
  | 'hub'

export type IdSource = 'siiir' | 'cui' | 'slug'

export interface Entity {
  id: string
  id_source: IdSource
  category: Category
  name: string
  judet: string
  city?: string
  url?: string
  email?: string
  phone?: string
  contact_name?: string
  parent_id?: string
  rank?: number
  score?: number
  tags?: string[]
  source_url: string
  scraped_at: string
  notes?: string
}
