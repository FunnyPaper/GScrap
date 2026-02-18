import { Page } from "puppeteer";
import { Action, parseAction } from ".";
import { parseBinding } from "../binding";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { BoundAction } from "./bound.action";
import { Pin } from "./pin.action";

/**
 * Action with foreach-like semantics. 
 * Binds to variable and creates a scoped variable with given name.
 */
export type ForeachAction = {
    type: 'foreach',
    /**
     * Actions to execute in order.
     */
    actions: Action[],
    /**
     * Name of the variable created in scope.
     */
    scopedVariable: string,
} & BoundAction

export async function parseForeachAction(page: Page, action: ForeachAction, context: GScrapParseContext): Promise<void> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (): Promise<void> => {
            const childContext: GScrapParseContext = context.copy();
            childContext.setPin(action.scopedVariable, pin.at(index++));
            logger.info?.(`Iterating over ${index}' element`);
            await action.actions.reduce(async (acc: Promise<unknown>, action: Action, index: number): Promise<unknown> => {
                await acc;
                logger.info?.(`Iterating over ${index + 1}' foreach subaction`);
                return await parseAction(page, action, childContext);
            }, Promise.resolve());
        }
    });

    if(index == 0) {
        logger.warn?.('No elements found to be iterated over');
    }
}