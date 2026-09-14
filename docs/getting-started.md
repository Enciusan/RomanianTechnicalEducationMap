# Getting started

## Requirements

- [Bun](https://bun.sh) 1.2+ (runtime for both the app tooling and the scrapers)
- Network access only if you want to re-scrape. The repo ships with a ready `src/data/data.json`.

## Run the app

```bash
bun install
bun dev
```

Open `http://localhost:5173`. Vite hot-reloads on any change, including `data.json`.

## Build

```bash
bun run build
```

Output is a static bundle in `dist/`. Deploy anywhere that serves static files (Cloudflare Pages, Vercel, GitHub Pages, S3).

## Re-scrape the data

```bash
bun run scrape
```

This runs `scripts/build.ts`, which:

1. Runs every scraper and loads every seed file.
2. Merges everything by `id` (later sources overwrite earlier ones).
3. Geocodes entities that lack coordinates.
4. Sorts by category priority, county, rank, name.
5. Writes `src/data/data.json`.

Cold run takes ~6 minutes, almost all of it in the 1,330 high-school page fetches and the Nominatim geocoding, both rate-limited on purpose. Everything is cached in `scripts/.cache/` (git-ignored), so subsequent runs take seconds.

## Scripts

| Command | Does |
|---|---|
| `bun dev` | Vite dev server |
| `bun run build` | Type-check + production bundle |
| `bun run scrape` | Rebuild `data.json` |
| `bun run lint` | oxlint |
