import { chromium, Browser, BrowserContext, Page } from 'playwright';

export class PlaywrightManager {
  private browser: Browser | null = null;
  private defaultContext: BrowserContext | null = null;

  public async initialize(): Promise<void> {
    if (this.browser) return;
    
    console.log('[PlaywrightManager] Launching headless browser pool...');
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080'
      ]
    });

    this.defaultContext = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });
    
    console.log('[PlaywrightManager] Browser pool ready.');
  }

  public async newPage(): Promise<Page> {
    if (!this.defaultContext) {
      await this.initialize();
    }
    const page = await this.defaultContext!.newPage();
    
    // Minimal stealth
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    
    return page;
  }

  public async launchHeadedSession(url: string): Promise<void> {
    console.log(`[PlaywrightManager] Launching HEADED session for mission transfer to: ${url}`);
    
    // We launch a separate visible browser specifically for the user
    const headedBrowser = await chromium.launch({
      headless: false, // The critical change!
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1280,800'
      ]
    });
    
    const context = await headedBrowser.newContext({
      viewport: null // let it adapt to the window
    });
    
    const page = await context.newPage();
    
    // Simulate CHATR Companion injection
    await page.addInitScript(() => {
      console.log("CHATR Companion Active.");
      // In a real build, we would inject our floating companion UI into the DOM here
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log(`[PlaywrightManager] Headed session active. Mission transferred.`);
  }

  public async shutdown(): Promise<void> {
    if (this.browser) {
      console.log('[PlaywrightManager] Shutting down browser pool...');
      await this.browser.close();
      this.browser = null;
      this.defaultContext = null;
    }
  }
}

export const globalPlaywrightManager = new PlaywrightManager();
