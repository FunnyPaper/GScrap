import { Browser } from "puppeteer";
import puppeteer from 'puppeteer-extra'

export async function withBrowser<T = void>(task: (browser: Browser) => Promise<T>): Promise<T> {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--disable-features=BackForwardCache'
      ], 
      ignoreDefaultArgs: ['--enable-automation']
    });
    try {
        return await task(browser);
    } finally {
        await browser.close();
    }
}