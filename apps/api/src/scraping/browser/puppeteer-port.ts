import puppeteer, { TimeoutError, type Page } from "puppeteer";
import type { BrowserPort, PagePort, PageSetup } from "./ports";

// Thin on purpose: the browser source holds the rules and is tested with fakes; this file is
// covered by the manual live check

function pagePort(page: Page): PagePort {
  return {
    async goto(url, timeoutMs) {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
      if (!response) return null;
      return { status: response.status(), url: response.url(), headers: response.headers() };
    },
    async waitForSelector(selector, timeoutMs) {
      try {
        await page.waitForSelector(selector, { timeout: timeoutMs });
        return true;
      } catch (error) {
        if (error instanceof TimeoutError) return false;
        throw error;
      }
    },
    count: (selector) => page.$$eval(selector, (elements) => elements.length),
    content: () => page.content(),
    close: () => page.close(),
  };
}

/** A headless Chrome without stealth: it says who it is, like the HTTP client. */
export async function launchPuppeteer(): Promise<BrowserPort> {
  const browser = await puppeteer.launch({ headless: true });
  return {
    connected: () => browser.connected,
    async newPage({ userAgent, blockRequest }: PageSetup) {
      const page = await browser.newPage();
      await page.setUserAgent(userAgent);
      await page.setExtraHTTPHeaders({ "Accept-Language": "hr" });
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (request.isInterceptResolutionHandled()) return;
        const blocked = blockRequest({ url: request.url(), resourceType: request.resourceType() });
        void (blocked ? request.abort() : request.continue());
      });
      return pagePort(page);
    },
    close: () => browser.close(),
  };
}
