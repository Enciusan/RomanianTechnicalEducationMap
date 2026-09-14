# County nomenclature

Romania has 41 counties (județe) plus Bucharest. Three different code systems show up in public data, and every dataset picks a different one. SolScout normalises all of them to one.

| System | Example (Cluj) | Where it appears |
|---|---|---|
| **ISO 3166-2:RO** | `CJ` | Vehicle plates, most web apps, our `Entity.judet` |
| **SIRUTA** | `12` | INS (statistics institute) and SIIIR datasets; numeric code per territorial unit, counties are 1..40 + 51, 52 |
| **Full name** | `Cluj`, `CLUJ`, `Judeţul Cluj` | Most HTML pages, edu.ro, FTC API (free text, inconsistent diacritics) |

## Why ISO codes

Short, unambiguous, human-readable, and already what everyone types when filtering. SIRUTA is kept in the lookup so we can still join against INS/SIIIR files.

## The lookup table

`scripts/judete.json` has 42 rows:

```json
{ "code": "CJ", "name": "Cluj", "siruta": 12 }
```

`scripts/judete.ts` exposes `toJudetCode(input)`, which accepts a code, a SIRUTA number, or a free-text name and returns the ISO code. Name matching strips diacritics and cedilla variants (`ş`/`ș`, `ţ`/`ț` are both common in Romanian sources), lowercases, and falls back to prefix matching, so `Bistrița-Năsăud`, `BISTRITA-NASAUD`, `Bistrita Nasaud` all resolve to `BN`. Anything starting with "bucuresti" (including "Bucuresti Sector 6") resolves to `B`.

## What is SIIIR?

SIIIR (Sistemul Informatic Integrat al Învățământului din România) is the Ministry of Education's national register of school units. Every unit has a **Cod SIIIR** (10 digits) that persists across school years and renames. We use it as the primary key for high schools. The public export on data.gov.ro also carries the fiscal code, SIRUTA of the locality, address, phone and email.

## Map geometry

`src/data/judete.json` is a GeoJSON `FeatureCollection` of the 42 county polygons, with properties `{ code, name }` matching the lookup table. It was derived from a public county boundary file, coordinates rounded to 3 decimals (~100 m) to keep it at 140 KB.
