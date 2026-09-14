# User interface

Dark-first, liquid-glass surfaces, minimal chrome. Everything renders from `data.json` in memory; there are no network requests after load.

## Map (`RomaniaMap.tsx`)

- Projection: `d3-geo` Mercator fitted to a 1000×640 viewBox. County paths are precomputed once.
- **National view**: each county is shaded by entity count (relative to the maximum) and labelled with its name and count. Bucharest/Ilfov labels are nudged apart.
- **Hover**: the county glows and a spring-animated tooltip appears above its top edge with the total and a per-category breakdown. The tooltip tilts and slides slightly with the cursor.
- **Click a county**: the `<g>` transform animates to fit that county (560 ms ease-out). Other counties are dimmed and non-interactive. Entities appear as dots, coloured by category, sized constant on screen regardless of zoom.
- **Click a dot**: opens the detail dialog and highlights it. Hovering a dot shows its name.
- **Back**: click empty map, press Escape, or use the "Romania" back button.

## Glass bar (`GlassBar.tsx`)

Title (or current county), entity count, search box, RO/EN toggle. Below it, category chips; each toggles a category on or off. NGOs are off by default since they carry no contacts.

Search is a normalised substring match over name, city and notes; diacritics are ignored.

## List (`EntityList.tsx`)

Right-hand glass panel, grouped by category, scoped to the selected county or the whole country. Shows county, city, rank and an envelope icon when an email exists. Hidden below the `md` breakpoint (mobile shows the map only).

## Dialog (`EntityDialog.tsx`)

Category, rank/score, tags, city and county; then email (`mailto:`), phone (`tel:`), contact person, website, notes, parent entity (e.g. the university of a faculty) and related children (faculties, student orgs). Footer links to the exact source page and shows id + scrape date.

## Internationalisation (`lib/i18n.tsx`)

A dictionary with `ro` and `en` keys and a context provider. UI strings, category labels, aria labels and the tooltip are translated. Entity names, cities, county names and scraped notes are **not** translated; they are data. Language is chosen from the browser on first visit and persisted in `localStorage`.

## Accessibility

Keyboard: Tab through chips, search, list items; Escape closes the dialog or leaves the county. All icon buttons have `aria-label`s, chips expose `aria-pressed`, the map has a role and label. `prefers-reduced-motion` collapses transitions.
