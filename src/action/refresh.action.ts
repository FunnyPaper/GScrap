import { Page } from "puppeteer";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { CommonAction } from "./common.action"

/**
 * Action with refresh page semantics. It reloads the current page.
 */
export type RefreshAction = {
    type: 'refresh'
} & CommonAction

export async function parseRefreshAction(page: Page, action: RefreshAction, context: GScrapParseContext): Promise<void> {
    logger.info?.(`Refreshing page...`);
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.reload(),
    ]);
}