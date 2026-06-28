import { ActionParseConfig, parseAction } from "./index.js";
import { Action } from "./schemas.js";
import { parseBinding } from "../binding/index.js";
import { GScrapParseContext } from "../context/gscrap-parse.context.js";
import { ForeachAction } from "./schemas.js";
import { Pin } from "./pin.action.js";

export async function parseForeachAction({ page, action, context, logger, globalOptions }: ActionParseConfig<ForeachAction>): Promise<boolean> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (): Promise<void> => {
            const childContext: GScrapParseContext = context.copy();
            childContext.setPin(action.scopedVariable, pin.at(index++));
            logger?.info(`Iterating over ${index}' element`);
            await action.actions.reduce(async (acc: Promise<boolean>, action: Action, index: number): Promise<boolean> => {
                if (await acc) return acc;
                logger?.info(`Iterating over ${index + 1}' foreach subaction`);
                return await parseAction({ page, action, context: childContext, logger, globalOptions });
            }, Promise.resolve(context.cancelled));
        }
    });

    if (index == 0) {
        logger?.warn('No elements found to be iterated over');
    }

    return context.cancelled;
}