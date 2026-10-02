import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// /provenance is a JSON endpoint (browser JSON viewer supplies the document,
// not the app), so WCAG document rules do not apply to it.
const PAGES = [
  '/',
  '/about',
  '/field',
  '/field/bmi-01',
  '/sync',
  '/try',
];

for (const path of PAGES) {
  test(`Accessibility: no WCAG A/AA critical violations on ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    const report = critical.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`
    );
    expect(report, `Critical accessibility violations on ${path}`).toEqual([]);
  });
}
