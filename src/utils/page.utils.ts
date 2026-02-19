import { Browser, Page } from "puppeteer";
import UserAgent from 'user-agents';
import { Logger } from "winston";

export async function withPage<T = void>(browser: Browser, task: (page: Page) => Promise<T>, logger?: Logger): Promise<T> {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => {
        const shouldSkip = ['fetch', 'image', 'media', 'font']
            .includes(request.resourceType());
            
        if (shouldSkip) {
            request.abort();
        } else {
            request.continue();
        }
    });

    const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
    page.setUserAgent(userAgent);
    page.setCacheEnabled(false);
    
    page.on('framenavigated', frame => {
        if(frame === page.mainFrame()) {
            logger?.info(`Navigation change occured. Current url: ${frame.url()}`);
        }
    });

    try {
        return await task(page);
    } finally {
        await page.close();
    }
}