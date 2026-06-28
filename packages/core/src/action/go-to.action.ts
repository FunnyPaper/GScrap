import { GoToAction } from "./schemas.js";
import { ActionParseConfig } from "./index.js";

export async function parseGoToAction({ page, action, context, logger }: ActionParseConfig<GoToAction>): Promise<boolean> {
    logger?.info(`Going to page ${action.url}...`);

    await Promise.all([
        page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
        page.goto(action.url),
    ]);

    return context.cancelled;
}