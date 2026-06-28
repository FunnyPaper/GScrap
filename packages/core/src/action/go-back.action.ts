import { GoBackAction } from "./schemas.js";
import { ActionParseConfig } from "./index.js";

export async function parseGoBackAction({ page, action, context, logger }: ActionParseConfig<GoBackAction>): Promise<boolean> {
    logger?.info('Going back to previous page...');
    const [_, response] = await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goBack(),
    ]);

    if (response?.url().startsWith('chrome-error://')) {
        await parseGoBackAction({ page, action, context });
    }

    return context.cancelled;
}