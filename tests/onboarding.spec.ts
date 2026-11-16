import { test, expect } from '@playwright/test';

test.describe('Flujo de Onboarding (Elección de Rol)', () => {
  
  test('Debería mostrar las opciones de rol en la pantalla', async ({ page }) => {
    await page.goto('/auth/elegir-rol');
    
    // Buscamos el texto en cualquier parte de la página, sin importar si es <button> o <div>
    await expect(page.locator('body')).toContainText(/Paciente/i);
    await expect(page.locator('body')).toContainText(/Médico/i);
  });
});