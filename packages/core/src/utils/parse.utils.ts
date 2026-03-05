import { ElementHandle, Page } from "puppeteer";
import { ActionSelector } from "../action/pin.action.js";
import { Logger } from "winston";

export async function tryWaitForSelector(page: Page, selector: ActionSelector, path: string, logger?: Logger) {
    logger?.info(`Try waiting for selector: \n${JSON.stringify(selector, null, 4)}`);
    for(let i = 0; i < (selector.retries ?? 3); i++) {
        try {
            await page.waitForSelector(path, { timeout: 3000 });
            logger?.info('Selector has been found');
            break;
        } catch(e) {
            if(i + 1 < (selector.retries ?? 3)) {
                logger?.warn(`Selector not found. Retries attempt: ${i + 1}`);
                continue;
            }

            if(selector.optional) {
                logger?.warn('Selector not found in given attempts. Proceeding further...');
                return null;
            }

            logger?.error('Required selector not found. Exiting program...');
            throw e;
        }
    }

    return null;
}

export async function getElements(page: Page, selector: ActionSelector, logger?: Logger): Promise<ElementHandle<Element>[] | null> {
    logger?.info(`Retrieving ${selector.count ?? 'all'} element/-s matching the selector: \n${JSON.stringify(selector, null, 4)}`);

    const path: string = selector.type == 'XPath'
        ? `::-p-xpath(${selector.path})`
        : selector.path;

    await tryWaitForSelector(page, selector, path, logger);

    const elements: ElementHandle[] = await page.$$(path, { isolate: false });

    if(elements.length == 0) {
        logger?.warn('0 elements have feen found');
    }

    if(selector.count != 'all') {
        return elements.slice(0, selector.count);
    }

    return elements;  
}

export async function countElements(page: Page, selector: ActionSelector, logger?: Logger): Promise<number> {
    const path: string = selector.type == 'XPath'
        ? `::-p-xpath(${selector.path})`
        : selector.path;

    await tryWaitForSelector(page, selector, path, logger);

    let count: number = 0;
    if(selector.type == 'XPath') {
        count = await page.evaluate((path) => document.evaluate(`count(${path})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue, selector.path);
    } else {
        count = await page.evaluate((path) => document.querySelectorAll(path).length, selector.path);
    }

    const result = selector.count ? selector.count == 'all' ? count : Math.min(count, selector.count) : count;

    logger?.info(`${result} element/-s have been found for selector: \n${JSON.stringify(selector, null, 4)}`);
    return result;
}

export async function getElement(page: Page, selector: ActionSelector, index: number, logger?: Logger): Promise<ElementHandle | null> {
    logger?.info(`Retrieving ${index + 1}' element matching the selector: \n${JSON.stringify(selector, null, 4)}`);

    if(selector.count != null && selector.count != 'all' && index >= selector.count) {
        return null;
    }

    const path: string = selector.type == 'XPath'
        ? `::-p-xpath((${selector.path})[${index + 1}])`
        : `(${selector.path}):nth-of-type(${index + 1})`;

    await tryWaitForSelector(page, selector, path, logger);

    const result = page.$(path);

    if(!result) {
        logger?.warn("No element matching the selector has been found");
    }

    return result;
}