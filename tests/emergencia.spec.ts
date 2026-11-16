import { test, expect } from '@playwright/test';

test.describe('Vista Pública de Emergencia', () => {
  // Usamos tu nuevo slug actualizado
  const slugPrueba = '2feyh4krzjjd'; 

  test('Debería renderizar los datos del paciente y el botón SAME', async ({ page }) => {
    await page.goto(`/e/${slugPrueba}`);

    // Validar que la página cargó correctamente (buscando un texto general)
    await expect(page.locator('body')).toContainText(/AyudAPI/i);

    // Validar que el botón/texto de SAME esté visible
    await expect(page.locator('body')).toContainText(/Alertar al SAME/i);
  });

  test('Debería mostrar el contacto ICE cargado', async ({ page }) => {
    await page.goto(`/e/${slugPrueba}`);

    // Como agregaste un contacto, Playwright debería encontrar un enlace que empiece con "tel:"
    // (El número real va a variar según el que hayas cargado)
    const linkICE = page.locator('a[href^="tel:"]').first();
    
    await expect(linkICE).toBeVisible();
  });
});