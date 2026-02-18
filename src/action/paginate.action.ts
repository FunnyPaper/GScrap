import { Page, ElementHandle } from "puppeteer";
import { Action, parseAction } from "."
import { parseBinding } from "../binding";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { BoundAction } from "./bound.action"
import { Pin } from "./pin.action";

/**
 * Action with paginate-like semantics. 
 * Executes actions in order. 
 * Loops until specified variable is no longer reachable.
 */
export type PaginateAction = {
    type: "paginate",
    /**
     * Actions to execute in order.
     */
    actions: Action[]
} & BoundAction

export async function parsePaginateAction(page: Page, action: PaginateAction, context: GScrapParseContext): Promise<void> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    while(true) {
        logger.info?.(`Invoking paginate subactions on page: ${++index}`);
        await action.actions.reduce(async (acc: Promise<unknown>, action: Action, index: number): Promise<unknown> => {
            await acc;
            logger.info?.(`Iterating over ${index + 1}' paginate subaction`);
            return await parseAction(page, action, context);
        }, Promise.resolve());

        const isNext: boolean = await pin.count(page) > 0;
        if (isNext) {
            let visible: boolean = true;
            await pin.use({
                page: page,
                task: async (handle: ElementHandle): Promise<void> => {
                    if(await handle.isVisible()) {
                        logger.info?.(`Heading over to next page...`);
                        await handle.click();
                    } else {
                        visible = false;
                    }
                }
            });

            if(!visible) {
                break;
            }
        } else {
            break;
        }
    }

    logger.info?.(`No new page to iterate over`);
}