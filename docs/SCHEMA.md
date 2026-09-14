# Schema

Single `Entity` type. Used by scraper output (`data.json`) and frontend.

```ts
type Category =
  | 'liceu'
  | 'centru_excelenta'
  | 'universitate'
  | 'facultate'
  | 'robotica'
  | 'asociatie_studenti'
  | 'ong'
  | 'hub';

type IdSource = 'siiir' | 'cui' | 'slug';

interface Entity {
  id: string;            // Cod SIIIR | CUI | slug. Stable across re-scrapes.
  id_source: IdSource;
  category: Category;
  name: string;
  judet: string;         // ISO-like 2-letter code, e.g. "CJ", "B" for Bucharest
  city?: string;
  url?: string;          // official site
  email?: string;
  phone?: string;
  contact_name?: string; // e.g. FTC coordinator, director
  parent_id?: string;    // facultate -> universitate, robotica -> liceu
  rank?: number;         // position in ranking if any (bac cutoff, metaranking)
  score?: number;        // raw ranking value (e.g. admission cutoff)
  tags?: string[];       // free labels: "ftc", "informatica", "hackathon"
  source_url: string;    // page/file data came from
  scraped_at: string;    // ISO 8601
  notes?: string;
}
```

## Output
- `data.json`: `Entity[]`, sorted by category priority then judet then rank.
- Category priority: robotica, facultate, universitate, liceu, centru_excelenta, asociatie_studenti, hub, ong.

## Judet codes
`judet` = ISO 3166-2:RO code (same as auto plate: CJ, TM, B...). 42 entries.
Lookup table: `scripts/judete.json` — `{ code, name, siruta }`.
- `code`: ISO 3166-2:RO, used as `Entity.judet`.
- `name`: official name with diacritics.
- `siruta`: INS SIRUTA numeric județ code (SIIIR / data.gov.ro use this or full name).
Scraper maps full name / siruta -> `code` at scrape time. Normalize diacritics before name match (Cluj, CLUJ, Bistrita-Nasaud all resolve).

## Future (not v0)
- `Outreach` table keyed on `entity_id`: status, owner, last_contact, next_action, warm_intro, notes.
