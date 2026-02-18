import { Page } from "puppeteer";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { CommonAction } from "./common.action"

/**
 * Action requesting the history change (sudden navigation change).
 */
export type GoToAction = {
    type: 'goTo',
    /**
     * Adress used in navigation change process.
     */
    url: string
} & CommonAction

export async function parseGoToAction(page: Page, action: GoToAction, context: GScrapParseContext): Promise<void> {
    logger.info?.(`Going to page ${action.url}...`);
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goto(action.url),
    ]);
}