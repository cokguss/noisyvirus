// puppeteer + stealth are loaded lazily: bundlers on serverless hosts (Vercel)
// often fail to package the stealth evasions, and a top-level import would
// crash the whole function at startup even when the official API is used
import fs from 'fs';

let puppeteerPromise = null;

async function getPuppeteer() {
  if (!puppeteerPromise) {
    puppeteerPromise = (async () => {
      const puppeteer = (await import('puppeteer-extra')).default;
      const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
      puppeteer.use(StealthPlugin());
      return puppeteer;
    })();
    puppeteerPromise.catch(() => { puppeteerPromise = null; });
  }
  return puppeteerPromise;
}

const STEALTH_UNAVAILABLE =
  'Stealth mode is unavailable on this host (no bundled browser). Set the VT_API_KEY environment variable to use the official VirusTotal API.';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function resolveExecutablePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  try {
    const bundled = puppeteer.executablePath();
    if (bundled && fs.existsSync(bundled)) return bundled;
  } catch {}

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
      : null,
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);

  return candidates.find((p) => fs.existsSync(p));
}

export function resolveExecutablePathSafe() {
  try {
    return resolveExecutablePath() || null;
  } catch {
    return null;
  }
}

let browserPromise = null;

async function getBrowser() {
  const puppeteer = await getPuppeteer();
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      executablePath: resolveExecutablePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return browserPromise;
}

export async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise;
    await b.close();
    browserPromise = null;
  }
}

function timeout(ms, message) {
  return new Promise((resolve) => setTimeout(() => resolve({ ok: false, error: message }), ms));
}

function watchReport(page, kind, id) {
  return new Promise((resolve) => {
    page.on('response', async (response) => {
      try {
        const url = new URL(response.url());
        const parts = url.pathname.split('/');
        const isMain =
          parts[parts.length - 2] === kind && parts[parts.length - 1] === id;
        if (!isMain) return;

        if (response.status() === 200) {
          const json = JSON.parse(await response.text());
          if (json?.data?.attributes) resolve({ ok: true, json });
        } else if (response.status() === 404) {
          let json = null;
          try {
            json = JSON.parse(await response.text());
          } catch {}
          resolve({
            ok: false,
            notFound: true,
            error:
              json?.error?.message ||
              'Target not found on VirusTotal. It has never been submitted before.'
          });
        }
      } catch {}
    });
  });
}

async function newPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  return page;
}

export async function scrapeHash(hash) {
  let browser;
  try {
    browser = await getBrowser();
  } catch {
    return { ok: false, error: STEALTH_UNAVAILABLE };
  }
  const page = await newPage(browser);
  try {
    const report = watchReport(page, 'files', hash);
    try {
      await page.goto(`https://www.virustotal.com/gui/file/${hash}/detection`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
    } catch {}
    const res = await Promise.race([
      report,
      timeout(45000, 'Timeout waiting for VirusTotal response. Cloudflare may have blocked the request.')
    ]);
    return res;
  } finally {
    await page.close().catch(() => {});
  }
}

export async function scrapeUrl(url, urlId) {
  let browser;
  try {
    browser = await getBrowser();
  } catch {
    return { ok: false, error: STEALTH_UNAVAILABLE };
  }
  const page = await newPage(browser);
  try {
    const report = watchReport(page, 'urls', urlId);
    try {
      await page.goto(`https://www.virustotal.com/gui/url/${urlId}/detection`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
    } catch {}
    const res = await Promise.race([
      report,
      timeout(45000, 'Timeout waiting for VirusTotal response. Cloudflare may have blocked the request.')
    ]);
    return res;
  } finally {
    await page.close().catch(() => {});
  }
}

export async function scrapeUploadFile(absolutePath) {
  let browser;
  try {
    browser = await getBrowser();
  } catch {
    return { ok: false, error: STEALTH_UNAVAILABLE };
  }
  const page = await newPage(browser);
  try {
    let fileHash = null;
    page.on('response', async (response) => {
      try {
        const parts = new URL(response.url()).pathname.split('/');
        if (
          parts[parts.length - 2] === 'files' &&
          /^[a-f0-9]{64}$/.test(parts[parts.length - 1]) &&
          response.status() === 200
        ) {
          fileHash = parts[parts.length - 1];
        }
      } catch {}
    });

    await page.goto('https://www.virustotal.com/gui/home/upload', {
      waitUntil: 'networkidle2',
      timeout: 45000
    });

    const fileInput = await page.waitForSelector('>>> #fileSelector', { timeout: 15000 });
    await fileInput.uploadFile(absolutePath);

    const confirmBtn = await page.waitForSelector('>>> #confirmUploadButton', { timeout: 15000 });
    await confirmBtn.click();

    const report = new Promise((resolve) => {
      const check = setInterval(() => {
        if (fileHash) {
          clearInterval(check);
          resolve(watchReport(page, 'files', fileHash));
        }
      }, 500);
      setTimeout(() => clearInterval(check), 30000);
    });

    const res = await Promise.race([
      report.then((r) => r ?? { ok: false, error: 'No report received after upload.' }),
      timeout(
        180000,
        'File uploaded but the scan report did not finish within 3 minutes. Try a hash lookup later.'
      )
    ]);
    return res;
  } finally {
    await page.close().catch(() => {});
  }
}
