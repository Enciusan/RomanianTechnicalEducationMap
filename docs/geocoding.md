# Geocoding

The map needs a point for every entity. Only FTC teams come with coordinates from their source; everything else is placed by **city + county** lookup.

## How it works (`scripts/geocode.ts`)

1. Collect unique `(city, county)` pairs from entities without `lat`/`lng`. Entities with no city (county excellence centres) fall back to the county name, which Nominatim resolves to the county seat / centroid.
2. Query Nominatim: `q=<city>, <county name>, Romania`, `countrycodes=ro`, `limit=1`.
3. One request per second, descriptive `User-Agent`, results cached in `scripts/.cache/geocode.json` (also caches misses as `null`).
4. Copy the coordinates back onto every entity sharing that pair.

~300 unique places; a cold run takes about 5 minutes, a warm run is instant.

## Precision

City-level. All 52 Math-CS high schools in Bucharest share one point. The map handles this with a deterministic golden-angle spiral: entities at the same coordinate are spread outward in projected pixels, so they separate as you zoom into the county and read as one cluster at national scale.

## Known gaps

- 8 NGOs have neither locality nor county in the register and are unplaced (still visible in the list).
- Nominatim occasionally picks a homonym village in the same county. Check `scripts/.cache/geocode.json` and overwrite the entry if a dot looks wrong; the cache is the source of truth on the next build.

## Attribution

© OpenStreetMap contributors, data under ODbL. Nominatim usage follows the public [usage policy](https://operations.osmfoundation.org/policies/nominatim/).
