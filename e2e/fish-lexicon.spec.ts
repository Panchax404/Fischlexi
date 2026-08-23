import { test, expect } from '@playwright/test';

test.describe('Fischlexi E2E Core & Architecture Verification', () => {

  test('1. Initial Load verläuft fehlerfrei und zeigt Fische', async ({ page }) => {
    await page.goto('/de');

    // Prüfe Titel
    await expect(page).toHaveTitle(/Fischlexikon/i);

    // Prüfe, ob mindestens eine Fish Card gerendert wird
    const fishCards = page.getByTestId('fish-card');
    await expect(fishCards.first()).toBeVisible({ timeout: 10000 });
    
    // Prüfe Search Input
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
  });

  test('2. Suche nach einem spezifischen Fisch ("Guppy")', async ({ page }) => {
    await page.goto('/de');
    
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('Guppy');
    
    const fishTitles = page.getByTestId('fish-name');
    await expect(fishTitles.first()).toContainText('Guppy', { timeout: 10000 });
    
    const count = await fishTitles.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('3. Navigation zur Detailansicht klappt ohne Locale-Verlust', async ({ page }) => {
    await page.goto('/de');
    
    const firstCardLink = page.getByTestId('fish-card-link').first();
    await expect(firstCardLink).toBeVisible({ timeout: 10000 });
    
    const href = await firstCardLink.getAttribute('href');
    expect(href).toMatch(/^\/de\/fish\//);
    
    await firstCardLink.click();
    
    if (href) {
      await page.waitForURL(`**${href.split('?')[0]}*`, { timeout: 10000 });
    }
    
    await expect(page.getByTestId('fish-detail-name')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('fish-not-found')).not.toBeVisible();
  });

  test('4. Aufruf eines ungültigen Fisches (404) zeigt Fehlerseite mit Locale-Link', async ({ page }) => {
    await page.goto('/de/fish/fantasiefisch12345');
    
    await expect(page.getByTestId('fish-not-found')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('fish-detail-name')).not.toBeVisible();
  });

  test('5. Metazeichen-Matrix & Injection-Härtung (DEFECT-001 & DEFECT-005)', async ({ page }) => {
    const dangerousTerms = ['%', '%%', '(', ')', 'a)', '*', 'a,b', 'a.b', '"', '\\', 'ZZ%,author_notes.is.null,name.ilike.%ZZ'];

    for (const term of dangerousTerms) {
      const response = await page.goto(`/de?q=${encodeURIComponent(term)}`);
      expect(response?.status()).toBeLessThan(500);

      // Verifiziere, dass kein unhandled Crash / Application Error stattfindet
      await expect(page.getByText('Application error')).toHaveCount(0);
      await expect(page.getByTestId('search-input')).toBeVisible();
    }
  });

  test('6. Layout-Überlebenstest & Error Boundaries (DEFECT-002)', async ({ page }) => {
    // Bei page=1e9 fängt die defensive Fehlerbehandlung den PGRST-Bereichsfehler ab
    const response = await page.goto('/de?page=999999999');
    expect(response?.status()).toBeLessThan(500);

    // Layout-Elemente bleiben stabil im DOM
    await expect(page.getByRole('link', { name: 'Fischlexi' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Karte' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
  });

  test('7. Dark-Mode-Kreuztest (DEFECT-007: Tailwind v4 Klassen-basiertes Theme)', async ({ page }) => {
    // Emuliere helles OS-Farbschema
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/de');

    const htmlElement = page.locator('html');
    const themeBtn = page.getByRole('button', { name: 'Toggle theme' });
    await expect(themeBtn).toBeVisible();

    // Umschalten auf Dark
    await themeBtn.click();
    await expect(htmlElement).toHaveClass(/dark/);

    const bodyBg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bodyBg).not.toBe('rgb(255, 255, 255)');
  });

  test('8. Karten-Fehlerzustand bei Tile-Netzwerkfehler (DEFECT-006)', async ({ page }) => {
    // Blockiere Tile-Endpunkte per Route-Interception
    await page.route('**/rivers_global*', (route) => route.abort('connectionrefused'));
    await page.route('**/basemap*', (route) => route.abort('connectionrefused'));

    await page.goto('/de/karte');

    // Der alert-State map-tile-error muss sichtbar werden
    await expect(page.getByTestId('map-tile-error')).toBeVisible({ timeout: 15000 });
  });

});
