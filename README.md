# Fischlexi

Ein Next.js Projekt für das Fischlexi.

## 🚀 Quickstart: Setup auf einem neuen PC

Wenn du das Projekt auf einen neuen PC herunterlädst, folge diesen einfachen Schritten, um es lokal zum Laufen zu bringen.

### 1. Repository klonen und Abhängigkeiten installieren

Öffne dein Terminal und lade das Projekt herunter:

```bash
git clone <deine-github-repo-url>
cd Fischlexi
npm install
```

### 2. Umgebungsvariablen (Connection Strings) einrichten

Aus Sicherheitsgründen werden die echten Zugangsdaten (Connection Strings) nicht auf GitHub hochgeladen. Du musst sie manuell anlegen:

1. Kopiere die mitgelieferte Vorlagendatei `.env.example` und nenne sie `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Unter Windows im Explorer: `.env.example` kopieren und als `.env.local` einfügen)*

2. Öffne die neue `.env.local` Datei und trage deine echten Supabase-Zugangsdaten ein. Diese findest du in deinem Supabase Dashboard. 
   Die Datei sollte dann in etwa so aussehen:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://deine-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_langer_anon_key
   SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
   SUPABASE_ACCESS_TOKEN=dein_access_token
   ```

### 3. Entwicklungsserver starten

Sobald die Abhängigkeiten installiert und die `.env.local` Datei angelegt ist, kannst du das Projekt starten:

```bash
npm run dev
```

Öffne nun [http://localhost:3000](http://localhost:3000) in deinem Browser. Das Projekt läuft!

---

## 🧪 Testing (Playwright)

Dieses Projekt nutzt [Playwright](https://playwright.dev/) für End-to-End Tests.

```bash
# E2E Tests im Hintergrund ausführen (Server muss mit npm run dev laufen!)
npx playwright test

# Playwright UI Mode zum visuellen Debuggen öffnen
npx playwright test --ui
```
