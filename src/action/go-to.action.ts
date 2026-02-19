import { CommonActionScheme } from "./common.action";
import { z } from "zod";
import { ActionParseConfig } from ".";

export const GoToActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('goTo'),
        /**
         * Adress used in navigation change process.
         */
        url: z.string()
    }),
    CommonActionScheme
)

/**
 * Action requesting the history change (sudden navigation change).
 */
export type GoToAction = z.infer<typeof GoToActionScheme>;

export async function parseGoToAction({ page, action, context, logger }: ActionParseConfig<GoToAction>): Promise<void> {
    logger?.info(`Going to page ${action.url}...`);
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goto(action.url),
    ]);
}