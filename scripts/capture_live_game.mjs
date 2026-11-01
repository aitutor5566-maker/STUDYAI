import { chromium } from '../realistic-voxel-game/node_modules/playwright/index.mjs';

async function main() {
  console.log('Launching browser to capture live Space Battle...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage({
    viewport: { width: 1200, height: 900 }
  });

  console.log('Navigating to http://localhost:5173/library...');
  await page.goto('http://localhost:5173/library', { waitUntil: 'networkidle' });

  console.log('Clicking "Play Space Battle 🚀"...');
  const playBtn = page.getByRole('button', { name: /Play Space Battle/i });
  await playBtn.waitFor({ state: 'visible', timeout: 8000 });
  await playBtn.click();

  console.log('Clicking "Start 3D Educational Game"...');
  const startBtn = page.getByRole('button', { name: /Start 3D Educational Game/i });
  await startBtn.waitFor({ state: 'visible', timeout: 8000 });
  await startBtn.click();

  console.log('Waiting for Space Battle canvas & HUD...');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(2000); // Allow Three.js stars and fleet to animate

  const screenshotPath = '/Users/vishwaksai/.gemini/antigravity/brain/ce618fd3-1bdf-4cd2-bc1a-bbded997c3f9/live_space_battle.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
}

main().catch((err) => {
  console.error('Error capturing live game:', err);
  process.exit(1);
});
