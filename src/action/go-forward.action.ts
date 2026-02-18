import { Page } from "puppeteer";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { CommonActionScheme } from "./common.action"
import { z } from "zod";

export const GoForwardActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('goForward')
    }),
    CommonActionScheme
)

/**
 * Action requesting the history change (going to the next record if exists)
 */
export type GoForwardAction = z.infer<typeof GoForwardActionScheme>;

export async function parseGoForwardAction(page: Page, action: GoForwardAction, context: GScrapParseContext): Promise<void> {
    logger.info?.('Going forward to previous page...');
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goForward(),
    ]);
}