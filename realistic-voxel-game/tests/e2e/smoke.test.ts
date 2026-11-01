import { test, expect } from '@playwright/test';

test.describe('Voxel Game Browser Smoke Verification', () => {
  test('initializes WebGL canvas, runs physics, and renders 3D scene without errors', async ({
    page
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    // 1. Navigate to local application
    await page.goto('/');

    // 2. Check page title
    await expect(page).toHaveTitle(/Realistic 3D Voxel/i);

    // 3. Confirm canvas exists and has non-zero geometry
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(100);
    expect(boundingBox!.height).toBeGreaterThan(100);

    // 4. Confirm HUD updates to active status
    const hudStatus = page.locator('#hud-status');
    await expect(hudStatus).toContainText('Engine & Physics Active', { timeout: 10000 });

    // 5. Verify actual 3D scene rendering via Engine internals (beyond just canvas element)
    await page.waitForFunction(() => {
      const win = window as unknown as {
        __VOXEL_ENGINE__?: {
          renderer: {
            renderer: {
              info: {
                render: {
                  frame: number;
                  triangles: number;
                  calls: number;
                };
              };
            };
          };
          physics: {
            getDynamicBodyCount: () => number;
          };
        };
      };
      const info = win.__VOXEL_ENGINE__?.renderer?.renderer?.info?.render;
      return info && info.frame > 5 && info.triangles > 0;
    }, { timeout: 10000 });

    // 6. Test interactive dynamic physics cube spawning
    const initialBodies = await page.evaluate(() => {
      const win = window as unknown as {
        __VOXEL_ENGINE__: { physics: { getDynamicBodyCount: () => number } };
      };
      return win.__VOXEL_ENGINE__.physics.getDynamicBodyCount();
    });
    expect(initialBodies).toBeGreaterThanOrEqual(3);

    const dropButton = page.locator('#btn-drop-voxel');
    await expect(dropButton).toBeVisible();
    await dropButton.click();

    // Verify dynamic physics body count increased
    await page.waitForFunction(
      (prev) => {
        const win = window as unknown as {
          __VOXEL_ENGINE__: { physics: { getDynamicBodyCount: () => number } };
        };
        return win.__VOXEL_ENGINE__.physics.getDynamicBodyCount() > prev;
      },
      initialBodies,
      { timeout: 5000 }
    );

    // 7. Capture diagnostic screenshot
    await page.screenshot({ path: 'smoke-verification.png' });

    // 8. Confirm zero uncaught exceptions occurred
    expect(pageErrors).toEqual([]);
  });
});
