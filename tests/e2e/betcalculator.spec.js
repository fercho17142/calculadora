import { test, expect } from '@playwright/test';

// Requisito previo: el backend debe estar ejecutándose en http://localhost:4000
// (npm run dev dentro de ./server). El frontend lo levanta Playwright automáticamente.

test('Dashboard muestra los indicadores principales', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Capital inicial')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Meta económica')).toBeVisible();
  await expect(page.getByText('Rentabilidad')).toBeVisible();
});

test('Simulador permite modificar un resultado individualmente', async ({ page }) => {
  await page.goto('/simulador');
  await expect(page.getByText('Detalle de la simulación')).toBeVisible({ timeout: 15000 });

  const ganadaBadges = page.getByRole('button', { name: 'Ganada' });
  const countBefore = await ganadaBadges.count();
  if (countBefore > 0) {
    await ganadaBadges.first().click();
    await expect(page.getByRole('button', { name: 'Perdida' }).first()).toBeVisible();
  }
});

test('Escenarios muestra la comparación de resultados', async ({ page }) => {
  await page.goto('/escenarios');
  await expect(page.getByText('Comparación de escenarios')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('columnheader', { name: 'Capital final (mejor)' })).toBeVisible();
});

test('Probabilidades calcula la probabilidad implícita', async ({ page }) => {
  await page.goto('/probabilidades');
  await expect(page.getByText('Probabilidad implícita')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Aclaración importante')).toBeVisible();
});

test('Historial carga y ofrece acciones de exportación', async ({ page }) => {
  await page.goto('/historial');
  await expect(page.getByText('Historial de simulaciones')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /Excel/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /PDF/ })).toBeVisible();
});
