// Renders each posters/<name>.html to posters/<name>.png at 1080x1350
// (or the page's own size when the HTML sets data-size="WxH" on <html>).
//   node render.mjs posters/2026-11-03.html ...
import { chromium } from "playwright";
import path from "node:path";

const files = process.argv.slice(2);
const browser = await chromium.launch();
for (const file of files) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto("file://" + path.resolve(file));
  await page.evaluate(() => document.fonts.ready);
  const size = await page.evaluate(() => document.documentElement.dataset.size);
  if (size) {
    const [w, h] = size.split("x").map(Number);
    await page.setViewportSize({ width: w, height: h });
  }
  const out = file.replace(/\.html$/, ".png");
  await page.screenshot({ path: out });
  console.log(out);
  await page.close();
}
await browser.close();
