# Fischlexi

Ein Next.js 16 Projekt für das Fischlexikon (Aquaristik-Nachschlagewerk) mit Next.js App Router, React 19, Tailwind CSS v4 und Supabase.

---

## 🚀 Quickstart: Setup auf einem neuen PC

Wenn du das Projekt auf einen neuen PC herunterlädst, folge diesen einfachen Schritten, um es lokal zum Laufen zu bringen.

### 1. Repository klonen und Abhängigkeiten installieren

```bash
git clone <deine-github-repo-url>
cd Fischlexi
npm install
```

### 2. Umgebungsvariablen einrichten

1. Kopiere die Vorlagendatei `.env.example` zu `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Trage deine echten Supabase- und App-Zugangsdaten in `.env.local` ein:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://deine-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_langer_anon_key
   SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
   SUPABASE_ACCESS_TOKEN=dein_access_token

   # Optionale Umgebungsvariablen
   DATABASE_URL=postgresql://postgres:...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_TILE_BASE_URL=http://127.0.0.1:3001
   ```

### 3. Tile-Server (Voraussetzung für die interaktive Karte `/karte`)

Die interaktive Vektorkarte (`/de/karte`) lädt weltweite Gewässer- und Kartendaten über Vector-Tiles.
Stelle sicher, dass der lokale Tile-Server gestartet ist:
```bash
# Erreichbar unter dem Port aus NEXT_PUBLIC_TILE_BASE_URL (Standard: Port 3001)
http://127.0.0.1:3001
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Öffne nun [http://localhost:3000](http://localhost:3000) im Browser.

---

## 🛡️ Qualitätssicherung & Verifikation

Das Projekt erzwingt eine strikte Verifikations-Pipeline (Linting, TypeScript Type-Checking, Production Build):

```bash
# Führt Linting, Typencheck und Production-Build in einem Befehl aus
npm run verify

# Einzelne Prüfungen
npm run lint       # ESLint 9 Flat Config
npm run typecheck  # tsc --noEmit
npm run build      # Next.js Production Build
```

---

## 🧪 Testing (Playwright E2E)

Dieses Projekt nutzt [Playwright](https://playwright.dev/) für End-to-End Tests.

```bash
# E2E Tests ausführen (Webserver startet automatisch via Playwright-Config)
npx playwright test

# Playwright UI Mode zum visuellen Debuggen öffnen
npx playwright test --ui
```
