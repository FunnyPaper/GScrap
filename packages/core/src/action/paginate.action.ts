import { ElementHandle } from "puppeteer";
import { ActionParseConfig, parseAction } from "./index.js";
import { Action } from "./schemas.js";
import { parseBinding } from "../binding/index.js";
import { PaginateAction } from "./schemas.js";
import { Pin } from "./pin.action.js";

export async function parsePaginateAction({ page, action, context, logger, globalOptions }: ActionParseConfig<PaginateAction>): Promise<boolean> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    while (true) {
        logger?.info(`Invoking paginate subactions on page: ${++index}`);
        await action.actions.reduce(async (acc: Promise<boolean>, action: Action, index: number): Promise<boolean> => {
            if (await acc) return acc;
            logger?.info(`Iterating over ${index + 1}' paginate subaction`);
            return await parseAction({ page, action, context, logger, globalOptions });
        }, Promise.resolve(context.cancelled));

        if (context.cancelled) return context.cancelled;

        const isNext: boolean = await pin.count(page) > 0;
        if (isNext) {
            let clickedSuccessfully = false;
            await pin.use({
                page: page,
                task: async (handle: ElementHandle): Promise<void> => {
                    if (clickedSuccessfully) return;

                    const isVisible = await handle.isVisible();

                    if (isVisible) {
                        try {
                            logger?.info(`Heading over to next page...`);
                            await Promise.all([
                                handle.click({ delay: 50 }),
                                page.waitForNetworkIdle({ idleTime: 500 }).catch(() => { }),
                            ]);

                            clickedSuccessfully = true;
                        } catch (e) {
                            logger?.error(`Click failed: ${e}`);
                        }
                    }
                }
            });

            if (!clickedSuccessfully) {
                logger?.warn('Found elements via XPath, but none were clickable/visible. Breaking.')
                break;
            }
        } else {
            break;
        }
    }

    logger?.info(`No new page to iterate over`);
    return context.cancelled;
}