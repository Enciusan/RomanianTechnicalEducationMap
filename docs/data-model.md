# Data model

One type, used by scrapers and UI alike (`scripts/types.ts`):

```ts
type Category =
  | 'universitate'        // university
  | 'facultate'           // CS faculty (child of a university)
  | 'liceu'               // high school with a Math-CS track
  | 'robotica'            // FTC robotics team
  | 'centru_excelenta'    // county centre of excellence
  | 'asociatie_studenti'  // student organisation
  | 'hub'                 // coworking / tech hub
  | 'ong'                 // NGO from the national register

type IdSource = 'siiir' | 'cui' | 'slug'

interface Entity {
  id: string            // stable across re-scrapes (see below)
  id_source: IdSource
  category: Category
  name: string          // as published by the source, not translated
  judet: string         // ISO 3166-2:RO county code, e.g. "CJ", "B"
  city?: string
  url?: string
  email?: string
  phone?: string
  contact_name?: string // person + role when known
  parent_id?: string    // facultate -> universitate, org -> faculty/university
  rank?: number         // position in a ranking, if any
  score?: number        // raw ranking value (admission cutoff, metaranking points)
  lat?: number
  lng?: number
  tags?: string[]       // free labels: "ftc", "mate-info", "privat", "warm"...
  source_url: string    // exact page/file the row came from
  scraped_at: string    // ISO 8601
  notes?: string        // free text: school of an FTC team, specialisations, remarks
}
```

## ID scheme

| Category | `id` | `id_source` | Example |
|---|---|---|---|
| liceu | Cod SIIIR of the school unit | `siiir` | `0261100341` |
| universitate | edu.ro table code, lowercased | `slug` | `univ-u19` (UBB), `univ-up04` (Romanian-American) |
| facultate | hand slug | `slug` | `fac-ubb-mi` |
| robotica | `ftc-<FTC team number>` | `slug` | `ftc-19085` |
| centru_excelenta | `cex-<county code>` | `slug` | `cex-CJ` |
| asociatie_studenti, hub | hand slug | `slug` | `lsac-bucuresti`, `hub-clujhub` |
| ong | `ong-<register number>` | `slug` | `ong-15739-A-2006` |

`cui` (fiscal code) is reserved for universities/NGOs once we backfill it; the SIIIR export includes it for schools but it is not used as the key because SIIIR codes are more stable across mergers.

## Ranking fields

- **liceu**: `score` = highest "ultima medie" (last admitted student's average) among the school's Math-CS tracks in the latest admission round. `rank` = national position by that score, 1 = best.
- **universitate**: `rank` and `score` from the National Metaranking 2025 (34 universities ranked; the rest have none).

## Sort order in `data.json`

Category priority (universitate, facultate, liceu, robotica, centru_excelenta, asociatie_studenti, hub, ong), then county code, then rank, then name.
