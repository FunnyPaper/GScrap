import { Browser } from "puppeteer";
import puppeteerExtra from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

const puppeteer = puppeteerExtra.default;

puppeteer.use(stealthPlugin());

export const PuppeteerLaunchOptions: string[] = [
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--window-position=0,0',
    '--window-size=1920,1080',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list',
    '--disable-features=BackForwardCache'
]

export const PuppeteerIgnoreArgs: string[] = [
    '--enable-automation'
]

export async function withBrowser<T = void>(task: (browser: Browser) => Promise<T>): Promise<T> {
    const browser = await puppeteer.launch({
      args: PuppeteerLaunchOptions, 
      ignoreDefaultArgs: PuppeteerIgnoreArgs
    });
    
    try {
        return await task(browser);
    } finally {
        await browser.close();
    }
}