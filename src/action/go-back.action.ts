import { CommonActionScheme } from "./common.action";
import { z } from "zod";
import { ActionParseConfig } from ".";

export const GoBackActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('goBack')
    }),
    CommonActionScheme
)

/**
 * Action requesting the history change (going to the previous record)
 */
export type GoBackAction = z.infer<typeof GoBackActionScheme>;

export async function parseGoBackAction({ page, action, context, logger }: ActionParseConfig<GoBackAction>): Promise<void> {
    logger?.info('Going back to previous page...');
    const [_, response ] = await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goBack(),
    ]);

    if(response?.url().startsWith('chrome-error://')) {
        await parseGoBackAction({ page, action, context });
    }
}