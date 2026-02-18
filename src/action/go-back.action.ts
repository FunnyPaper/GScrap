import { Page, ElementHandle } from "puppeteer";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { CommonAction } from "./common.action"

/**
 * Action requesting the history change (going to the previous record)
 */
export type GoBackAction = {
    type: 'goBack'
} & CommonAction

export async function parseGoBackAction(page: Page, action: GoBackAction, context: GScrapParseContext, parentHandle?: ElementHandle): Promise<void> {
    logger.info?.('Going back to previous page...');
    const [_, response ] = await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goBack(),
    ]);

    if(response?.url().startsWith('chrome-error://')) {
        await parseGoBackAction(page, action, context);
    }
}