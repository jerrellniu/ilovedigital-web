import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const B = 'http://localhost:3123';
async function grab(name, path, w, h) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await p.goto(B + path, { waitUntil: 'networkidle' });
  const img = await p.$('img[alt*="Jerrell"]');
  await img.scrollIntoViewIfNeeded();
  await p.waitForFunction(() => {
    const i = [...document.querySelectorAll('img')].find(x => x.alt.includes('Jerrell'));
    return i && i.complete && i.naturalWidth > 0;
  }, null, { timeout: 15000 });
  await p.evaluate(() => {
    const i = [...document.querySelectorAll('img')].find(x => x.alt.includes('Jerrell'));
    i.closest('section').setAttribute('data-shot', 'yes');
    const c = document.querySelector('[class*="fixed"]');
    if (c && /cookie/i.test(c.textContent)) c.remove();
  });
  const sec = await p.$('[data-shot="yes"]');
  await sec.screenshot({ path: `/tmp/${name}.png` });
  console.log(name, 'captured');
  await p.close();
}
await grab('founder-home-1440', '/', 1440, 1000);
await grab('founder-about-1440', '/about', 1440, 1100);
await grab('founder-home-390', '/', 390, 900);
await b.close();
