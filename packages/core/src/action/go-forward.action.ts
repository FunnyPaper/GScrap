import { GoForwardAction } from "./schemas.js";
import { ActionParseConfig } from "./index.js";

export async function parseGoForwardAction({ page, action, context, logger }: ActionParseConfig<GoForwardAction>): Promise<boolean> {
    logger?.info('Going forward to previous page...');
    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goForward(),
    ]);

    return context.cancelled;
}