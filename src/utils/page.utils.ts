import { Browser, Page } from "puppeteer";
import UserAgent from 'user-agents';
import { logger } from "../logger";

export async function withPage<T = void>(browser: Browser, task: (page: Page) => Promise<T>): Promise<T> {
    const page = await browser.newPage();

    const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
    page.setUserAgent(userAgent);
    page.setCacheEnabled(false);
    
    page.on('framenavigated', frame => {
        if(frame === page.mainFrame()) {
            logger.info?.(`Navigation change occured. Current url: ${frame.url()}`);
        }
    });

    try {
        return await task(page);
    } finally {
        await page.close();
    }
}