# SolScout

Interactive map of Romania's tech-education ecosystem. A scouting tool for **Solana Romania** to find universities, CS faculties, high schools, robotics teams, student organisations and hubs worth reaching out to, county by county, with contact details on every entry.

**Live docs:** see [`docs/`](docs/README.md) (GitBook).

## What's inside

| Category | Count | Source |
|---|---|---|
| Math-CS high schools | 471 | SIIIR school network (data.gov.ro) + ultimamedie.ro admission cutoffs |
| FTC robotics teams | 211 | Nație Prin Educație public API |
| Universities (CS-relevant) | 54 | edu.ro accredited list + National Metaranking 2025 |
| County excellence centres | 42 | hand-curated seed |
| CS faculties | 18 | hand-curated seed with dean/secretariat contacts |
| Student organisations | 15 | hand-curated seed (LSAC, BEST, IEEE SB, ASII, OSUT) |
| Tech hubs | 4 | hand-curated seed |
| NGOs (tech/education) | 65 | National NGO Register (data.gov.ro), name-filtered |

880 entities, 653 with an email address, 872 geocoded.

## Features

- Romania map by county. Click a county to zoom in; the rest is dimmed.
- Hover a county for a spring-animated tooltip with per-category counts.
- Entities plotted as coloured dots inside the selected county. Click for a detail dialog: contacts, ranking, website, related entities, data source.
- Category filters, free-text search, grouped side list.
- Romanian / English UI toggle (data stays in original language).
- Dark-first, liquid-glass UI. No backend, no tracking: a single static bundle.

## Stack

Bun · TypeScript · Vite · React 19 · Tailwind v4 · shadcn/ui · d3-geo · motion

## Run locally

```bash
bun install
bun dev          # http://localhost:5173
bun run build    # static bundle in dist/
```

## Refresh the data

```bash
bun run scrape   # rebuilds src/data/data.json (network access needed, ~6 min cold)
```

Scrapers cache downloads in `scripts/.cache/`. Geocoding uses OpenStreetMap Nominatim at 1 request/second and is cached too, so re-runs are fast.

## Project layout

```
scripts/        scrapers, seeds, build pipeline  -> src/data/data.json
  seed/         hand-curated JSON (faculties, excellence centres, orgs, hubs, metaranking)
  judete.json   county nomenclature (ISO 3166-2:RO code, name, SIRUTA code)
src/            Vite + React app
  components/   RomaniaMap, GlassBar, EntityList, EntityDialog
  data/         data.json (generated), judete.json (county GeoJSON)
  lib/          entities (types, category meta), i18n
docs/           GitBook documentation
```

## Data notes

- Every entity has a stable `id`: SIIIR code for schools, edu.ro code for universities, slug for the rest. Re-running the scrapers upserts by id.
- Every entity carries `source_url` and `scraped_at`.
- Counties use ISO 3166-2:RO codes (the licence-plate letters). SIRUTA numeric codes are kept in the nomenclature for joining with INS / SIIIR datasets.

## License

MIT. Source data belongs to the respective publishers (Ministry of Education, data.gov.ro, Nație Prin Educație, ultimamedie.ro, OpenStreetMap contributors).
