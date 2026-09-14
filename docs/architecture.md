# Architecture

```
scripts/ (Bun + TypeScript)

  ftc.ts            JSON API       \
  universitati.ts   HTML tables     |
  licee.ts          XLSX + HTML     +--> build.ts --> geocode.ts --> sort --> src/data/data.json
  ong.ts            XLSX            |    (upsert by id)
  seed.ts           seed/*.json    /

src/ (Vite + React)

  lib/entities.ts   imports data.json, category meta, county names
  lib/i18n.tsx      RO/EN dictionary + context
  App.tsx           state: county, category set, query, selected entity
  RomaniaMap.tsx    d3-geo projection, zoom, dots, tooltip
  GlassBar.tsx      title, search, category chips, language toggle
  EntityList.tsx    grouped list for current scope
  EntityDialog.tsx  detail modal
```

## Design decisions

**Static data, no backend.** The audience is a small team doing outreach. 880 rows (~600 KB JSON) bundle fine. Filtering and search run in memory with `useMemo`. Adding auth, a database and an API would cost more than it returns for a v0.

**Two layers, kept separate.** The scraped layer (`data.json`) is refreshable and disposable. Anything hand-written lives in `scripts/seed/*.json` and is never overwritten by a scraper. When an outreach layer is added later (status, owner, notes), it will be a separate store joined on `id`. See [Roadmap](roadmap.md).

**Stable IDs from day one.** Every entity has an `id` that survives re-scrapes: SIIIR code for schools, edu.ro code for universities, `ftc-<team number>` for robotics teams, and explicit slugs for seeds. This is what makes the future outreach layer a join instead of a manual reconciliation.

**Scrapers in the same repo.** `scripts/types.ts` defines `Entity` once; the frontend imports the same type. One `bun install`, one type, no drift.

**Rate-limit friendliness.** Every HTTP fetch goes through `fetchCached()` (sha1-keyed on-disk cache). High-school pages are fetched with concurrency 8; Nominatim at 1 request/second with a descriptive User-Agent, per its usage policy.
