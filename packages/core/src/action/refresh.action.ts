import { RefreshAction } from "./schemas.js";
import { ActionParseConfig } from "./index.js";

export async function parseRefreshAction({ page, action, context, logger }: ActionParseConfig<RefreshAction>): Promise<boolean> {
    logger?.info(`Refreshing page...`);

    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.reload(),
    ]);

    return context.cancelled;
}