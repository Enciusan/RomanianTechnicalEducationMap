# Data sources

All URLs verified in September 2026. Each row in `data.json` links back to its source via `source_url`.

## Schools (base list)

- Dataset: [Rețea școlară 2025-2026](https://data.gov.ro/dataset/retea-scolara-2025-2026) on data.gov.ro (Ministry of Education, SIIIR export)
- Format: one XLSX, ~18,000 rows, one per school unit.
- Columns used: Judet PJ, Localitate unitate, Cod SIIIR unitate, Denumire lunga unitate, Denumire scurta unitate, Tip unitate, Telefon, Email.
- Licence: open data (data.gov.ro).

## High-school admission cutoffs

- [ultimamedie.ro](https://ultimamedie.ro): aggregates the official computerised admission results (admitere.edu.ro) per high school and specialisation, with the last admitted average for the current and previous year.
- We read `schools.js` (the site's search index: name, slug, county, locality for ~1,330 high schools) and then each `/liceu/<slug>.html` page, which has a table: Specialisation, Profile, Language, last average this year, last average last year.

## FTC robotics teams

- [Nație Prin Educație](https://natieprineducatie.ro/teams/), the official FIRST Tech Challenge partner for Romania.
- The site is an Angular app backed by a public JSON API (no auth):
  - `GET /api/teams/public/list?seasonId=<id>` → team id, international number, name, rookie year, school, city.
  - `GET /api/seasons` → per season, `teamSeasonData[]` with county, contact email, website and social links, lat/lng, registration status.
- Season 3 ("Decode", 2025) is used as the full roster (211 teams). Season 4 ("BIOBUZZ", 2026) is still registering.

## Universities

- State: [edu.ro / universități de stat civile](https://www.edu.ro/universitati_stat_civile) (45, HTML table: code, name, website).
- Private accredited: [edu.ro / universități particulare acreditate](https://www.edu.ro/universitati_particulare_acreditate) (35).
- Ranking: [Metarankingul Național 2025](https://www.edu.ro/sites/default/files/_fi%C8%99iere/Minister/2026/div_IS_2026/Metaranking_2025.pdf) (PDF, 34 universities with points). Parsed once into `scripts/seed/metaranking_2025.json`.

## CS faculties

Hand-curated (`scripts/seed/facultati.json`): 18 faculties of computer science / automation / informatics at the strongest universities plus two private ones known to be open to collaboration. Each has website, secretariat or dean email, phone, and where public, the dean or head of department. Sources are each faculty's own contact page.

## County centres of excellence

Established by ministerial order OMEC 5956/2020, one per county. There is no central list with contacts, so `scripts/seed/cex.json` was assembled by probing domain patterns (`excelenta<code>.ro`, `cex<code>.ro`, `cjex<code>.ro`) and searching per county, then extracting emails from each site. 36 of 42 have a website, 32 an email. Six (CS, DB, HR, MS, SM, SJ) have no site found; contact goes through the county school inspectorate.

## Student organisations and hubs

Hand-curated: LSAC (București, Iași), ASII Iași, BEST local groups (București, Cluj, Iași, Timișoara, Brașov), IEEE student branches (from [IEEE Romania Section](https://romania.ieeer8.org/students/student-branches/)), OSUT Timișoara; TechHub and Impact Hub Bucharest, ClujHub, The Grape Iași.

## NGOs

- [Registrul Național ONG 2025](https://data.gov.ro/dataset/registrul-national-ong-2025), Ministry of Justice, XLSX of ~125,000 associations.
- Columns: name, registration number, status, county, locality, address, initial purpose. **No contact data** in the register.
- We keep active associations whose **name** matches tech/education keywords (robotics, informatics, programming, software, blockchain, hackathon, coding…). Purpose text is too noisy to match on.

## Geocoding

[OpenStreetMap Nominatim](https://nominatim.openstreetmap.org), see [Geocoding](geocoding.md). © OpenStreetMap contributors, ODbL.
