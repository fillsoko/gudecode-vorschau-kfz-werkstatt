# GudeCode Vorschau — Motorrad

Slug-basierte Vorschau-Seiten für Outbound-Kampagnen: jeder Prospect bekommt eine
personalisierte URL wie `https://vorschau.gudecode.de/zweirad-mueller`, ohne dass
pro Kunde eine neue Seite gebaut oder deployt werden muss.

Basis ist die Bike-Rental-Demo (Astro 6 + Tailwind 4 + React-Islands), erweitert um:

| Baustein | Datei |
| --- | --- |
| SSR-Route pro Slug | `src/pages/[slug].astro` (`prerender = false`) |
| Client-Datenzugriff (Edge Config ⇄ lokaler Fallback) | `src/lib/clients.ts` |
| ERPNext → Edge Config Sync | `scripts/sync-erpnext-edge-config.mjs` |
| Personalisierung (Hero, Nav, Footer, Ribbon) | `Hero.astro`, `Nav.astro`, `Footer.astro`, `PreviewRibbon.astro` |
| E2E-Test der ganzen Pipeline | `tests/e2e.test.mjs` |

## Architektur

```
ERPNext (Lead)                Vercel Edge Config              Vercel (Astro SSR)
┌──────────────┐   sync    ┌──────────────────────┐  read   ┌──────────────────────┐
│ Zweirad      │ ────────► │ clients: {           │ ──────► │ GET /zweirad-mueller │
│ Müller       │  script   │   "zweirad-mueller": │         │ → personalisierte    │
│ (Prospect)   │           │     {company,addr,…} │         │   Vorschau-Seite     │
└──────────────┘           └──────────────────────┘         └──────────────────────┘
```

- **Neue Kunden = kein Redeploy.** Das Sync-Skript schreibt nur Edge-Config-Items;
  die Seite liest sie zur Request-Zeit.
- **Statisch bleibt statisch.** Alle Demo-Unterseiten (`/fleet`, `/anfrage`, …)
  werden weiter statisch gebaut; nur `/{slug}` läuft als Serverless-Funktion.
- **Lokal ohne Vercel.** Ohne `EDGE_CONFIG`-Env liest `src/lib/clients.ts` aus
  `src/data/clients.local.json` — derselbe Code-Pfad, andere Quelle.
- **Kein Indexing.** Vorschauseiten sind `noindex` (Meta + `X-Robots-Tag`),
  `robots.txt` sperrt die komplette Subdomain.
- **Mehrere Branchen, eine URL-Struktur.** Jeder Client-Record hat ein
  `segment`-Feld (`motorrad` = Default, `friseur`, `fitness`, `tiersalon`);
  `/{slug}` rendert je nach Segment das passende Template. Das Friseur-Template
  ist ein warmer One-Pager
  (`src/components/friseur/`, Theme-Tokens `.theme-salon` in `global.css`);
  seine Fotos wurden einmalig mit `scripts/generate-salon-images.mjs` (Gemini,
  `GOOGLE_NANOBANANA`) erzeugt und liegen eingecheckt in
  `src/assets/images/salon/`. Der ERPNext-Sync leitet das Segment aus dem
  Industry-Feld des Leads ab; `ERPNEXT_SEGMENT` erzwingt es für einen Lauf.
  Das Tiersalon-Template (Pet Grooming) folgt demselben Muster:
  `src/components/tiersalon/`, Tokens `.theme-tiersalon`, Fotos aus
  `scripts/generate-tiersalon-images.mjs` in `src/assets/images/tiersalon/`.

## Entwickeln

```sh
npm ci
npm run dev            # http://localhost:4321/zweirad-mueller (Beispieldatensatz)
npm run build          # Produktions-Build inkl. Vercel-Output
npm run test:e2e       # Mock-ERPNext → Sync → Live-Seite (5 Tests)
```

## Prospects synchen

```sh
export ERPNEXT_URL=https://erp.example.de
export ERPNEXT_API_KEY=… ERPNEXT_API_SECRET=…
export ERPNEXT_FILTERS='[["Lead","custom_website_vorschau","=",1]]'

# Probelauf (nichts wird geschrieben):
npm run sync -- --dry-run

# In die lokale Store-Datei (Dev):
npm run sync -- --local

# In Vercel Edge Config (Produktion):
export VERCEL_TOKEN=… EDGE_CONFIG_ID=ecfg_…   # optional: VERCEL_TEAM_ID
npm run sync
```

Ohne `ERPNEXT_FILTERS` bricht der Sync bewusst ab (Datenschutz: nicht pauschal
alle Leads auf eine öffentlich erreichbare Vorschau schreiben); `--all` erzwingt es.

Slugs entstehen aus dem Firmennamen, umlaut-korrekt: „Zweirad Müller“ → `zweirad-mueller`.

## Deployment

Siehe [`docs/DEPLOY.md`](docs/DEPLOY.md) — Vercel-Projekt anlegen, Edge Config
verbinden, Domain `vorschau.gudecode.de` aufschalten, Sync laufen lassen.

## Herkunft & Inhalte

Alle Motorrad-Inhalte (Bikes, Touren, Preise, Testimonials) sind fiktive
Demo-Inhalte aus der Bike-Rental-Vorlage. Personalisiert werden ausschließlich
Firmenname, Adresse, Kontaktdaten und Hero-Text des jeweiligen Prospects.
