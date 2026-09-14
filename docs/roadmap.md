# Roadmap

## v0 (current)

Read-only map with contacts. Done.

## Next

- **Deep links**: `#judet=CJ&id=fac-ubb-mi` so a county or entity can be shared in chat.
- **Mobile list**: bottom sheet instead of hiding the list under `md`.
- **CUI backfill** for universities and NGOs, switching their `id_source` to `cui`.
- **More seeds**: hackathon organisers, coding schools, olympiad coordinators per county.
- **Export**: CSV of the current filtered scope.

## Later: outreach layer

A separate store keyed on `entity_id`: status, owner, last contact, next action, warm intro, notes. Lives in a small hosted Postgres with row-level security (Supabase or similar); the scraped layer stays static and refreshable. Re-scraping never touches outreach rows.
