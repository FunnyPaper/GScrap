import { ElementHandle } from "puppeteer";
import { ActionParseConfig, parseAction } from "./index.js";
import { Action } from "./schemas.js";
import { parseBinding } from "../binding/index.js";
import { Pin } from "./pin.action.js";
import { AutoScrollAction } from "./schemas.js";

export async function parseAutoScrollAction({ page, action, context, logger, globalOptions }: ActionParseConfig<AutoScrollAction>): Promise<boolean> {
    const pin: Pin = parseBinding(action.binding, context);
    for (let index: number = 0; action.count === 'limitless' || index < action.count; index++) {
        logger?.info(`Auto scroll performed ${++index} times`);
        await action.actions.reduce(async (acc: Promise<boolean>, action: Action, index: number): Promise<boolean> => {
            if (await acc) return acc;
            logger?.info(`Iterating over ${index + 1}' auto scroll subaction`);
            return await parseAction({ page, action, context, logger, globalOptions });
        }, Promise.resolve(context.cancelled));

        if (context.cancelled) return context.cancelled;

        const isNext: boolean = await pin.count(page) > 0;
        if (isNext) {
            await pin.use({
                page: page,
                task: async (handle: ElementHandle): Promise<void> => {
                    handle.evaluate(e => e.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    }));
                }
            });
        } else {
            logger?.info('Element to scroll into view not found');
            break;
        }
    }

    logger?.info(`No new page to iterate over`);
    return context.cancelled;
}