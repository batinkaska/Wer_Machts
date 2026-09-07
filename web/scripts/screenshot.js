// Usage: node scripts/screenshot.js <path> <output.png> [port] [waitForSelector]
// Example: node scripts/screenshot.js /ads out.png 5173 "text=Finden"
//
// Note: does NOT use waitUntil: "networkidle" — Firestore keeps a persistent
// WebSocket/long-poll connection open, so "networkidle" never fires and the
// navigation just times out. Use domcontentloaded + an explicit selector wait
// instead.

import { chromium } from "playwright";

const [, , pathArg, outputArg, portArg, selectorArg] = process.argv;

if (!pathArg || !outputArg) {
  console.error(
    "Usage: node scripts/screenshot.js <path> <output.png> [port] [waitForSelector]",
  );
  process.exit(1);
}

const port = portArg || "5173";
const url = `http://localhost:${port}${pathArg}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(err.message));

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

if (selectorArg) {
  await page.waitForSelector(selectorArg, { timeout: 15000 }).catch(() => {
    console.error(`Warning: selector "${selectorArg}" did not appear in time.`);
  });
} else {
  await page.waitForTimeout(1000);
}

await page.screenshot({ path: outputArg });
await browser.close();

console.log(`Saved screenshot to ${outputArg}`);
if (consoleErrors.length > 0) {
  console.log("Console errors detected:");
  for (const err of consoleErrors) console.log(" -", err);
  process.exitCode = 1;
}
