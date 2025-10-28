// Simple Puppeteer script to capture screenshots of the app pages
// Prereq: Start the server with `node index.js` so pages are available on http://localhost:3000

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  const baseUrl = 'http://localhost:3000';
  const outDir = path.join(__dirname, '..', 'screenshots');
  await ensureDir(outDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });

  // Helper to capture a page
  async function capture(route, filename) {
    const url = `${baseUrl}${route}`;
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const outPath = path.join(outDir, `${filename}-${timestamp}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved screenshot: ${outPath}`);
  }

  // Pages to capture
  await capture('/index.html', '01-home');
  await capture('/ListVoters.html', '02-list-voters');

  await browser.close();
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
