import { test, expect } from '@playwright/test';

test.describe('Seguridad del Panel Médico', () => {
  
  test('Un usuario anónimo no debería poder ver la caja de búsqueda médica', async ({ page }) => {
    // Intentamos entrar a la ruta protegida
    await page.goto('/medico/escanear');
    
    // Le damos 2 segundos a Next.js para que procese la redirección de seguridad
    await page.waitForTimeout(2000);
    
    // El input del médico tiene el ID 'codigo-paciente' según OpenCode.
    // Validamos que NO esté visible.
    const inputCodigo = page.locator('#codigo-paciente');
    await expect(inputCodigo).not.toBeVisible();
  });
});