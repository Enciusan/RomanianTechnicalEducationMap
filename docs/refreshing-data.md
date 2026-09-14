# Refreshing data

Most sources change once a year. Suggested cadence: after the July high-school admission round and after the FTC season roster closes (autumn).

## Checklist

1. **School network XLSX**: data.gov.ro publishes a new dataset per school year. Update `XLSX_URL` and `XLSX_PAGE` in `scripts/licee.ts`.
2. **Admission cutoffs**: ultimamedie.ro updates in place. Delete `scripts/.cache/*.html` to force re-fetching high-school pages (or the whole cache).
3. **FTC season**: bump `SEASON_ID` in `scripts/ftc.ts` to the season whose roster is complete. Check `GET /api/seasons` for ids.
4. **Metaranking**: when a new PDF is published, extract the table (pypdf or copy from the PDF) into `scripts/seed/metaranking_<year>.json` and point `universitati.ts` at it.
5. **Seeds**: re-verify emails in `scripts/seed/*.json` every year; faculties rotate secretariat staff.
6. Run `bun run scrape`, read the summary lines, diff `src/data/data.json` (`git diff --stat` is enough to spot a source that silently returned nothing).
7. `bun run build`, commit.

## If a source breaks

Each scraper logs warnings for unmatched or dropped rows rather than failing the build. A count dropping to 0 in the summary means the page structure changed; open the URL, compare with the selectors in the scraper, fix, re-run.

## Manual overrides

- Wrong pin: edit the entry in `scripts/.cache/geocode.json` (it is the source of truth for coordinates; consider committing it if you want overrides to survive a cache wipe).
- Wrong or missing contact on a scraped entity: prefer fixing the source; if impossible, add the same `id` to a seed file with the corrected fields, and load seeds **after** that scraper in `build.ts` so the seed wins the upsert.
