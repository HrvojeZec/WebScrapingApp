// The narrow part of Puppeteer the browser source uses, so tests run without Chrome

/** The response of the page's main document; header names are lower case. */
export type MainResponse = { status: number; url: string; headers: Record<string, string> };

export type PagePort = {
  /** Resolves when the DOM is ready; null when the navigation had no response. */
  goto(url: string, timeoutMs: number): Promise<MainResponse | null>;
  /** false when the selector did not appear in time */
  waitForSelector(selector: string, timeoutMs: number): Promise<boolean>;
  /** Number of elements matching the selector right now (Emmezeta renders its list twice) */
  count(selector: string): Promise<number>;
  content(): Promise<string>;
  close(): Promise<void>;
};

export type PageSetup = {
  userAgent: string;
  /** Called for every request the page makes; true aborts it. */
  blockRequest(request: { url: string; resourceType: string }): boolean;
};

export type BrowserPort = {
  connected(): boolean;
  newPage(setup: PageSetup): Promise<PagePort>;
  close(): Promise<void>;
};
