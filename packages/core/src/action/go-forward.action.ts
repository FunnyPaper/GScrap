import { CommonActionScheme } from "./common.action.js";
import { z } from "zod";
import { ActionParseConfig } from "./index.js";

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

export async function parseGoForwardAction({ page, action, context, logger }: ActionParseConfig<GoForwardAction>): Promise<boolean> {
    logger?.info('Going forward to previous page...');
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goForward(),
    ]);

    return context.cancelled;
}