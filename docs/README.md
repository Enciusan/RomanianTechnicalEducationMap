# SolScout

SolScout is an interactive map of Romania's technical-education ecosystem, built as a scouting tool for **Solana Romania**. The goal: find the universities, CS faculties, high schools, robotics teams and student communities most likely to produce new builders, and have a contact ready for each one.

It is a read-only static web app. All data is collected by a set of TypeScript scrapers into a single `data.json`, then rendered client-side on a county map of Romania.

## Quick facts

- 880 entities across 8 categories, 42 counties.
- 653 entries with an email address, 872 with coordinates.
- No backend, no database, no tracking. One static bundle.
- Romanian and English UI.

## Documentation map

| Page | What you'll learn |
|---|---|
| [Getting started](getting-started.md) | Run, build, refresh data |
| [Architecture](architecture.md) | How pieces fit: scrapers → data.json → UI |
| [Data model](data-model.md) | The `Entity` type, IDs, categories |
| [County nomenclature](counties.md) | ISO codes vs SIRUTA vs SIIIR, why we use each |
| [Data sources](data-sources.md) | Every URL we read from, verified |
| [Scrapers](scrapers.md) | How each category is collected and filtered |
| [Geocoding](geocoding.md) | How entities get placed on the map |
| [User interface](ui.md) | Map interactions, filters, dialog, i18n |
| [Refreshing data](refreshing-data.md) | Yearly maintenance checklist |
| [Roadmap](roadmap.md) | What's next |
