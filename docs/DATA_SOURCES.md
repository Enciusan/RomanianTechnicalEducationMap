# Data sources

Verified 2026-09-14. Per category: source, method, stable id.

## 1. Schools (base list) — XLSX, no scraping
- Dataset: https://data.gov.ro/dataset/retea-scolara-2025-2026
- File: https://data.gov.ro/dataset/69392a50-5750-4a54-90c1-d461de44da6d/resource/280d52b6-4c5e-489d-9b48-3dd8961f56e0/download/101_claudia.teodorescu_2025-10-08-14_26_03.055.xlsx
- 18,023 rows, 1 sheet. Row 1 = "Generat la data", row 2 = header.
- Columns: An, Judet PJ, Localitate PJ, Cod SIRUTA PJ, Mediu loc. PJ, Cod SIIIR PJ, Denumire PJ, Localitate unitate, Cod SIRUTA unitate, Mediu loc. unitate, Cod SIRUES, Cod SIIIR unitate, Denumire scurta unitate, Denumire lunga unitate, Tip unitate, Statut unitate, Cod fiscal, Mod functionare, Forma finantare, Forma proprietate, Strada, Numar, Cod postal, Telefon, (+ Email etc., check remaining header cells)
- id: `Cod SIIIR unitate`. Filter `Tip unitate` = liceu/colegiu.
- Method: SheetJS.

## 2. Top high schools (ranking) — HTML table
- Top 100 national: https://ultimamedie.ro/top-licee.html — plain `<table>`, cols: #, Liceu, Județ, Specializare, Ultima medie 2026. Liceu links `/liceu/<judet>-<slug>.html`.
- Per county: https://ultimamedie.ro/judet-<code>.html (lowercase ISO code) — JS-rendered, data in inline script. Fallback: per-liceu pages.
- Original source: https://admitere.edu.ro (no bulk export).
- Alt/extra: Bac 2026 results XLSX (per-candidate, aggregate by liceu): https://data.gov.ro/dataset/45b7115c-a66a-4b64-9982-d07b46d948f4/resource/53cbc02e-e846-43f7-bc86-0d4ec43ac792/download/2026.08.13_bac_2026-ses1_date-deschise.xlsx
- id: match name+judet to Cod SIIIR from source 1. Method: cheerio.

## 3. FTC robotics teams — JSON API (best source)
- Site: https://natieprineducatie.ro/teams/ (Angular SPA, alias natie.ro).
- Public API, no auth: `GET https://natieprineducatie.ro/api/seasons`
  - Returns seasons array. `id:4` = BIOBUZZ 2026 (175 teams, registration open), `id:3` = Decode 2025 (212 teams).
  - Each `teamSeasonData[]`: school, city, county, primaryEmailContact, teamWebsiteLink, facebookLink, instagramLink, youtubeLink, teamDescription, latitude, longitude, teamId, registrationStatus.
  - Team name/number: `GET /api/teams/public/international/<n>` or `/api/teams/international/<n>` (check for teamId→name mapping; `/api/teams` needs bearer).
- `/api/teams/public/list` and `/api/teams-map/locations` return empty currently.
- id: `ftc-<teamId>`. Method: fetch JSON.

## 4. Universities — HTML table + PDF ranking
- State list (45): https://www.edu.ro/universitati_stat_civile — HTML table: code, name, website.
- Private accredited: https://www.edu.ro/universitati_particulare_acreditate
- Ranking: Metaranking Național 2025 (pub. 2026-05-04), 34 univs: https://www.edu.ro/sites/default/files/_fișiere/Minister/2026/div_IS_2026/Metaranking_2025.pdf
  - Top 15: UBB, UMF Carol Davila, UB, UNSTPB, Transilvania BV, UMF Cluj, UAIC, UVT, ASE, UTCN, Oradea, UMF Iași, TUIASI, UPT, Dunărea de Jos.
- CS faculties: manual seed (child entities, `parent_id` = university).
- id: CUI (lookup manually or from ONG/ANAF). Method: cheerio + manual seed for rank.

## 5. Centre județene de excelență — manual seed
- edu.ro page has only the order (OMEC 5956/2020), no list: https://www.edu.ro/centre-de-excelen%C8%9B%C4%83-%C3%AEnfiin%C8%9Bate-%C3%AEn-fiecare-jude%C8%9B-%C8%99i-%C3%AEn-municipiul-bucure%C8%99ti
- Each has own site, pattern `excelenta<code>.ro` (excelentacj.ro, excelentavl.ro, excelentatr.ro) or other (cex-iasi.ro). Search per județ.
- id: `cex-<code>`. ~42 rows. Method: manual seed JSON.

## 6. Student orgs / hubs / hackathons — manual seed
- LSAC, BEST, IEEE SB, LSRS, OSUT, etc. Hand-curated `scripts/seed/*.json`.
- id: CUI or slug.

## 7. NGOs (low priority) — XLSX
- Dataset: https://data.gov.ro/dataset/registrul-national-ong-2025
- Asociații: https://data.gov.ro/dataset/6fa0e262-bd3d-4b40-b010-22a54bf0c0cb/resource/f8a213d9-d30a-4c22-a6e0-165885079dde/download/17nov2025_asociatii.xlsx
- Filter by keyword in name/scope (robotică, informatică, tech, educație). id: CUI.

## Rules
- Every row: `source_url`, `scraped_at`.
- Seeds in `scripts/seed/*.json`, same schema. Scraper never overwrites seeds. Merge step → `data.json`.
- Re-scrape = upsert by `id`.
