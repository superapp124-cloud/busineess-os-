import { test, expect } from '@playwright/test';

test.describe('CHATR Desktop App Platform — E2E Workflow Verification', () => {

  test('Business OS Navigation Shell Loads & Renders Platform Services', async ({ page }) => {
    await page.goto('http://localhost:8086/#/desktop/home');
    
    // Verify top action bar search query input
    const searchInput = page.locator('input[placeholder*="Enterprise Query"]');
    await expect(searchInput).toBeVisible();

    // Verify main navigation buttons
    await expect(page.locator('button', { hasText: 'Home' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Marketplace Ecosystem' })).toBeVisible();
  });

  test('Recruiter Workspace Navigation & Pipeline Kanban Load', async ({ page }) => {
    await page.goto('http://localhost:8086/#/desktop/recruitment');

    // Verify TOS header
    await expect(page.locator('h1', { hasText: 'CHATR AI Talent Operating System' })).toBeVisible();

    // Verify Kanban stage columns exist
    await expect(page.locator('text=Applied')).toBeVisible();
    await expect(page.locator('text=Interview')).toBeVisible();
    await expect(page.locator('text=Joined')).toBeVisible();
  });

});
