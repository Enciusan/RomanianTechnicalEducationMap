# Scrapers

Every scraper is a function `(): Promise<Entity[]>` in `scripts/`, registered in `scripts/build.ts`. Shared helpers live in `scripts/util.ts` (`fetchCached`, `fetchText`, `norm`) and `scripts/judete.ts` (`toJudetCode`).

## `licee.ts`: Math-CS high schools

1. Load the SIIIR XLSX (SheetJS). Keep rows where "Tip unitate" is a school unit and the long name starts with LICEUL / COLEGIUL / SEMINARUL. This gives ~1,500 candidates with SIIIR code, city, phone, email.
2. Load `ultimamedie.ro/schools.js` (1,330 high schools that had an admission round).
3. Fetch every high-school page (concurrency 8, cached) and parse the specialisation table.
4. Keep only schools with at least one **Matematică-Informatică** track (regex tolerant to diacritics and spacing). Theology, arts, sports, vocational tracks are dropped by construction.
5. Match each kept school to its SIIIR row by county + normalised name (exact, then prefix, then containment). 471 matched, 0 unmatched.
6. `score` = best Math-CS last-admitted average; `rank` = national order by score. Tag `bilingv` when a track is taught in a foreign language. `notes` lists tracks with their averages.

## `ftc.ts`: FTC robotics teams

Two API calls, joined on internal team id: the public list (name, number, school, city) and the season roster (county, email, links, coordinates). County strings are free text with mixed diacritics; `toJudetCode` resolves all 211. Website falls back to Facebook / Instagram / YouTube when the team has no site. Coordinates come straight from the API, so these are the most precisely placed entities.

## `universitati.ts`: universities

Parses the two edu.ro HTML tables (state, private). City is inferred from the name ("... DIN CLUJ-NAPOCA") through a small city-to-county map. Excludes institutions with no CS relevance (theology, arts, music, theatre, film, sports, medicine, pharmacy, architecture, agricultural/veterinary) and any marked as in liquidation. Trailing notes in the name (teaching language, cycle) move to `notes`. Metaranking rank/score are attached by normalised-name match, with an alias map for renamed institutions.

## `ong.ts`: NGOs

Loads the associations XLSX, keeps active rows (no status like "radiată" / "dizolvată") whose name matches the tech/education regex. No contact data exists in the register; entries are placed on the map by locality only.

## `seed.ts`: hand-curated

Loads `seed/facultati.json`, `seed/cex.json`, `seed/asociatii.json`, `seed/hubs.json`, stamps `category`, `id_source: 'slug'`, `scraped_at`. Seeds use the same `Entity` shape (minus the auto-filled fields) so they can carry any field, including `parent_id`, `contact_name`, `tags`.

## `build.ts`: pipeline

```
sources = [scrapeFtc, scrapeUniversitati, scrapeLicee, loadSeeds, scrapeOng]
all     = concat(results)
byId    = Map upsert (later wins)
geocode(data)
warn on parent_id pointing to a missing entity
sort, write src/data/data.json
```

## Conventions

- Never throw on a single bad row; log a warning and continue. The build should always produce a file.
- Log a one-line summary per source (`[licee] 471 mate-info licee, 471 with email, 470 ranked`) so regressions are visible at a glance.
- All network reads go through `fetchCached`. Delete `scripts/.cache/` to force a fresh pull.
