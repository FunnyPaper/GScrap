import { Page } from "puppeteer";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { CommonAction, CommonActionScheme } from "./common.action"
import { z } from "zod";

export const RefreshActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('refresh')
    }),
    CommonActionScheme
)

/**
 * Action with refresh page semantics. It reloads the current page.
 */
export type RefreshAction = z.infer<typeof RefreshActionScheme>;

export async function parseRefreshAction(page: Page, action: RefreshAction, context: GScrapParseContext): Promise<void> {
    logger.info?.(`Refreshing page...`);
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.reload(),
    ]);
}