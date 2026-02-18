import { Page } from "puppeteer";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { CommonAction } from "./common.action"

/**
 * Action requesting the history change (going to the next record if exists)
 */
export type GoForwardAction = {
    type: 'goForward'
} & CommonAction

export async function parseGoForwardAction(page: Page, action: GoForwardAction, context: GScrapParseContext): Promise<void> {
    logger.info?.('Going forward to previous page...');
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goForward(),
    ]);
}