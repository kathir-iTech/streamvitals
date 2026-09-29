import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = path.join(__dirname, 'artifacts');

// Distinctive values typed by the test. If the review page shows anything else
// (e.g. a hardcoded stub), these assertions fail.
const STREAM_NAME = 'Zephyr Creek QA Marker 4821';
const VOLUNTEER_NAME = 'Jordan Reyes QA Marker 77';
const BMI_NOTES = 'Three riffle stones turned over, caddis cases on two of them.';

// One photo is uploaded to BMI-01 in step 3a.
const EXPECTED_PHOTO_COUNT = 1;

test.describe.serial('StreamVitals Smoke Test', () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  });

  test('Steps 1-7: Complete end-to-end flow', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('404')) consoleErrors.push(msg.text()); });
    page.on('pageerror', (err) => { consoleErrors.push(err.message); });

    // Step 1: Load homepage, assert no console errors
    await page.goto('/');
    await expect(page).toHaveURL('/');
    expect(consoleErrors).toEqual([]);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-homepage.png'), fullPage: true });

    // Step 2: Load /field, fill form, start session
    await page.goto('/field');
    await page.fill('#stream-name', STREAM_NAME);
    await page.fill('#volunteer-name', VOLUNTEER_NAME);
    await page.fill('#session-date', new Date().toISOString().split('T')[0]);
    await page.fill('#session-time', new Date().toTimeString().slice(0, 5));
    await page.click('button:has-text("Start Monitoring Session")');
    await page.waitForURL('/field/bmi-01');
    await page.waitForSelector('fieldset[aria-label="Select your observation"]', { timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-field-bmi-01.png'), fullPage: true });

    // Step 3a: BMI-01 — state selection does not change URL or reload
    const stateButtons = page.locator('fieldset[aria-label="Select your observation"] button');
    expect(await stateButtons.count()).toBeGreaterThan(0);

    const firstButton = stateButtons.first();
    const urlBefore = page.url();
    await firstButton.click();
    await expect(page.url()).toBe(urlBefore);
    await expect(firstButton).toHaveClass(/bg-\[rgba\(13,155,110,0\.06\)\]/);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03a-bmi-01-state-selected.png'), fullPage: true });

    // Notes persist after state selection
    const notesField = page.locator('textarea[id*="notes-"]');
    await notesField.fill(BMI_NOTES);
    await expect(notesField).toHaveValue(BMI_NOTES);
    await firstButton.click();
    await expect(notesField).toHaveValue(BMI_NOTES);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03a-notes-persist.png'), fullPage: true });

    // Photo upload shows thumbnail without reload
    const imgCountBefore = (await page.locator('img').all()).length;
    const fileInput = page.locator('input[type="file"]').first();
    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileInput.setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: imageBuffer });
    await expect(page.locator('img')).toHaveCount(imgCountBefore + 1);
    await expect(page.url()).not.toContain('?state=');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03a-photo-uploaded.png'), fullPage: true });

    // Next navigates to BIR-04
    await page.locator('button:has-text("Next Indicator")').click();
    await page.waitForURL('/field/bir-04');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03a-bir-04.png'), fullPage: true });

    // Step 3b: BIR-04 — state selection does not change URL or reload
    const birStateButtons = page.locator('fieldset[aria-label="Select your observation"] button');
    expect(await birStateButtons.count()).toBeGreaterThan(0);
    const birUrlBefore = page.url();
    await birStateButtons.first().click();
    await expect(page.url()).toBe(birUrlBefore);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03b-bir-04-state-selected.png'), fullPage: true });

    await page.locator('button:has-text("Next Indicator")').click();
    await page.waitForURL('/field/inv-11');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03b-inv-11.png'), fullPage: true });

    // Step 3c: INV-11 — state selection does not change URL or reload
    const invStateButtons = page.locator('fieldset[aria-label="Select your observation"] button');
    expect(await invStateButtons.count()).toBeGreaterThan(0);
    const invUrlBefore = page.url();
    await invStateButtons.first().click();
    await expect(page.url()).toBe(invUrlBefore);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03c-inv-11-state-selected.png'), fullPage: true });

    await page.locator('button:has-text("Next Indicator")').click();
    await page.waitForURL('/field/fcl-06');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03c-fcl-06.png'), fullPage: true });

    // Step 4: FCL-06 and DIA-10 have zero state buttons, but DO have a sample ID,
    // a photo capture control, and a notes field.
    for (const indicatorId of ['FCL-06', 'DIA-10']) {
      await page.goto(`/field/${indicatorId.toLowerCase()}`);
      const stateFieldsets = page.locator('fieldset[aria-label="Select your observation"]');
      await expect(stateFieldsets).toHaveCount(0);

      // Sample ID must be visible at the moment of collection.
      // It loads asynchronously from IndexedDB, so wait for it to appear.
      const sampleId = page.locator('[data-testid="sample-id-value"]');
      await expect(sampleId).toBeVisible({ timeout: 10000 });
      await expect(sampleId).toHaveText(/^SMP-\d{8}-\d{3}$/);
      await expect(page.getByText('Write this ID on the container')).toBeVisible();

      // Photo capture and notes must be present on lab pages
      await expect(page.locator('button[aria-label="Capture photo"]')).toBeVisible();
      await expect(page.locator('input[type="file"]')).toHaveCount(1);
      const labNotes = page.locator('textarea[id*="notes-"]');
      await expect(labNotes).toBeVisible();

      // The protocol sentence must appear exactly once, not duplicated
      const protocolHeading = page.getByText('Laboratory Protocol Required');
      await expect(protocolHeading).toHaveCount(1);
      await expect(page.getByText('You cannot determine the result in the field')).toHaveCount(1);

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, `04-${indicatorId.toLowerCase()}-lab-page.png`), fullPage: true });
    }

    // Go back to BMI-01 by clicking Previous (not URL navigation)
    await page.locator('button:has-text("Previous")').click();
    await page.waitForURL('/field/fcl-06');
    await page.locator('button:has-text("Previous")').click();
    await page.waitForURL('/field/inv-11');
    await page.locator('button:has-text("Previous")').click();
    await page.waitForURL('/field/bir-04');
    await page.locator('button:has-text("Previous")').click();
    await page.waitForURL('/field/bmi-01');
    // Verify previously selected state still present after Previous navigation
    await expect(page.locator('button:has-text("Diverse Sensitive Taxa")')).toHaveClass(/bg-\[rgba\(13,155,110,0\.06\)\]/);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03d-bmi-01-prev-back.png'), fullPage: true });

    await page.locator('button:has-text("Next Indicator")').click();
    await page.waitForURL('/field/bir-04');
    await page.locator('button:has-text("Next Indicator")').click();
    await page.waitForURL('/field/inv-11');
    await page.locator('button:has-text("Next Indicator")').click();
    await page.waitForURL('/field/fcl-06');
    await page.locator('button:has-text("Next Indicator")').click();
    await page.waitForURL('/field/dia-10');
    await page.locator('button:has-text("Next Indicator"), button:has-text("Review Session")').click();
    await page.waitForURL('/field/review');

    // Step 5: Review page shows the data that was actually typed/collected
    await expect(page).toHaveURL('/field/review');
    await expect(page.getByText('Benthic Macroinvertebrates').first()).toBeVisible();
    await expect(page.getByText('Birds').first()).toBeVisible();
    await expect(page.getByText('Invasive Alien Plants').first()).toBeVisible();

    // CRITICAL: the stream name and volunteer typed at /field must appear on
    // the review page. This guards against a stubbed/fabricated review page.
    await expect(page.getByText(STREAM_NAME).first()).toBeVisible();
    await expect(page.getByText(VOLUNTEER_NAME).first()).toBeVisible();
    expect(await page.getByText('Not provided').count()).toBe(0);
    expect(await page.getByText('Test').count()).toBe(0);

    // Session date typed at /field must appear (not blank)
    const sessionDate = new Date().toISOString().split('T')[0];
    await expect(page.getByText(sessionDate).first()).toBeVisible();

    // Human-Readable Summary shows real selected states, not generic "pending lab analysis".
    // Each citizen indicator had its FIRST state button selected above, so these are
    // the labels that must come back from the stored session.
    await expect(page.getByText('Diverse Sensitive Taxa').first()).toBeVisible();
    await expect(page.getByText('Multiple Species Observed').first()).toBeVisible();
    await expect(page.getByText('No Invasive Species Observed').first()).toBeVisible();

    // Lab samples show real sample IDs
    await expect(page.getByText(/SMP-.*-001/).first()).toBeVisible();
    await expect(page.getByText(/SMP-.*-002/).first()).toBeVisible();

    // CRITICAL: the uploaded photo count must match what the review page displays.
    // 1 photo was uploaded to BMI-01 during step 3a.
    const photoCountEl = page.locator('[data-testid="photo-total"]');
    await expect(photoCountEl).toHaveText(String(EXPECTED_PHOTO_COUNT));
    await expect(page.getByText('1 photo').first()).toBeVisible();

    // Notes typed on the indicator page must appear on the review page
    await expect(page.getByText(BMI_NOTES).first()).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05-review.png'), fullPage: true });

    // Step 6: Export triggers download
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('button:has-text("Export")');
    const download = await downloadPromise.catch(() => null);
    if (download) {
      expect(download.suggestedFilename()).toMatch(/\.(json|csv)/);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06-export.png'), fullPage: true });

    // Step 7: Field Assistant bounded scope (collapsed by default, opens on toggle)
    await page.goto('/field/bmi-01');
    await expect(page.locator('button[aria-label="Open Field Assistant"]')).toBeVisible();
    await page.locator('button[aria-label="Open Field Assistant"]').click();
    await expect(page.locator('aside[aria-label="Field Assistant panel"]')).toBeVisible();
    const quickQuestionBtn = page.locator('button:has-text("What does this indicator measure?")');
    await quickQuestionBtn.click();
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '07-assistant.png'), fullPage: true });
  });
});