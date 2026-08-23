# E2E Testplan für Fischlexi

Dieser Testplan basiert auf den Prinzipien robuster E2E-Testmuster und fokussiert sich auf kritische User-Journeys (Suchen, Filtern, Navigieren, Fehler-Isolation und Theming).

---

## 1. Testumgebung & Philosophie

- **Framework**: Playwright (dediziertes E2E-Framework, nativ integriert über `playwright.config.ts`).
- **Fokus**: Kritische Pfade (Suchen, Filtern, Navigieren, Metazeichen-Resilienz), keine internen Implementierungsdetails testen.
- **Isolierung**: Tests laufen unabhängig voneinander im parallelen Chromium-Browserkontext.
- **Selektor-Strategie**: Strikte Nutzung von `data-testid`-Attributen (z.B. `fish-card`, `search-input`, `segment-error`, `map-tile-error`), um Test-Instabilität bei CSS-Refactorings zu verhindern.

---

## 2. Kernfunktionen & User Journeys (To Be Tested)

### 2.1. Initialer Seitenaufruf (Homepage)
- **Beschreibung**: Der Nutzer öffnet die Homepage und sieht die initial geladene Fisch-Liste sowie die Filter.
- **Tests**:
  - `test('Homepage lädt korrekt')`: Verifiziert Titel und Sichtbarkeit der ersten `data-testid="fish-card"`.
  - `test('Filter-Optionen werden geladen')`: Überprüft, ob Filter-Akkordeons für Haltung, Herkunft etc. gerendert werden.

### 2.2. Suchfunktion (Text Search & Metazeichen-Matrix)
- **Beschreibung**: Der Nutzer sucht nach einem Fisch über den Namen oder Teile der Beschreibung.
- **Tests**:
  - `test('Suche nach Fischname ("Guppy")')`:
    - Eingabe in `data-testid="search-input"`.
    - Assert: Erste gefundene Karte enthält „Guppy".
  - `test('Metazeichen-Matrix & Injection-Härtung')`:
    - Testet Terme wie `%`, `)`, `a.b`, `"`, `\`.
    - Assert: Server antwortet mit Status < 500, Layout und Suchfeld bleiben intakt (kein unhandled Crash).
  - `test('Leere Suchergebnisse')`:
    - Eingabe von "ZZNOMATCH".
    - Assert: Empty-State innerhalb von `data-testid="search-results-container"` wird angezeigt.

### 2.3. Filter-Funktionalität & State-Kanonizität
- **Beschreibung**: Filterung über Herkunft, Haltung, Temperatur, ph-Wert etc.
- **Tests**:
  - `test('Filtern nach Haltung / Herkunft')`:
    - Auswahl eines Filters.
    - Assert: `data-testid="clear-all-filters-btn"` erscheint nur bei tatsächlich aktiven Filtern.
  - `test('Bereichsfilter')`:
    - Halboffene Ranges werden im UI-Bereich dargestellt.

### 2.4. Detailansicht & Locale-Routing (`/[lang]/fish/[slug]`)
- **Beschreibung**: Nach Klick auf eine `FishCard` gelangt der Nutzer auf die Detailseite unter Beibehaltung der Sprach-Präfixe.
- **Tests**:
  - `test('Navigation zur Detailseite funktioniert')`:
    - Klick auf `data-testid="fish-card-link"`.
    - Assert: Ziel-URL matcht `/de/fish/<slug>`.
    - Assert: `data-testid="fish-detail-name"` ist sichtbar, `data-testid="fish-not-found"` nicht sichtbar.
  - `test('404-Seite bei ungültigem Slug')`:
    - Aufruf von `/de/fish/ungueltiger-slug`.
    - Assert: `data-testid="fish-not-found"` sichtbar mit sauberem Zurück-Link auf `/de`.

### 2.5. Theme-Switching (Light/Dark Mode)
- **Beschreibung**: Tailwind v4 Klassen-basiertes Theme über `ThemeProvider.tsx` und `ThemeSwitcher.tsx`.
- **Tests**:
  - `test('Theme-Toggle schaltet .dark-Klasse')`:
    - Emuliert helles OS-Farbschema (`colorScheme: 'light'`).
    - Klick auf Theme-Toggle.
    - Assert: `<html>` erhält die `.dark`-Klasse und der Hintergrund ändert sich.

### 2.6. Karten-Fehlerzustand (MapLibre Network Interception)
- **Beschreibung**: Behandlung von nicht erreichbaren Tile-Servern auf `/de/karte`.
- **Tests**:
  - `test('Karten-Fehlerzustand')`:
    - Blockiert Tile-Requests via Playwright-Route-Interception.
    - Assert: `data-testid="map-tile-error"` wird als barrierefreier Alert sichtbar.
