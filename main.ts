import fs from "fs/promises";
import puppeteer from "puppeteer";
import { createSession } from "x-client-transaction-id-extract-browser";

interface Dict {
  animationKey: string;
  verification: string;
}

const dict: Dict[] = [];
const max = 50;
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--disable-gpu"],
});

// x.com answers any request whose User-Agent contains "HeadlessChrome" with an
// empty 403 (since 2026-09-24), so present the same Chrome build without that token.
const userAgent = (await browser.userAgent()).replace("HeadlessChrome", "Chrome");

for (let i = 0; i < max; i++) {
  console.log(`${i} / ${max}`);
  const page = await browser.newPage();
  try {
    await page.setUserAgent(userAgent);
    const session = await createSession(browser, page);
    const keyConverter = await session.initKeyConverter();
    const animationKey = await keyConverter();
    dict.push({
      animationKey: animationKey.split("obfiowerehiring")[1],
      verification: session.verification,
    });
  } catch (e) {
    console.error(e);
  } finally {
    await page.close().catch(() => {});
  }
}

await fs.writeFile("pair.json", JSON.stringify(dict, null, 2));
await browser.close();
