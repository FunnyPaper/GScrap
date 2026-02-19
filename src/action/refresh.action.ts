import { CommonActionScheme } from "./common.action";
import { z } from "zod";
import { ActionParseConfig } from ".";

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

export async function parseRefreshAction({ page, action, context, logger }: ActionParseConfig<RefreshAction>): Promise<void> {
    logger?.info(`Refreshing page...`);
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.reload(),
    ]);
}