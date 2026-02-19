import { Action, ActionParseConfig, ActionScheme, parseAction } from ".";
import { parseBinding } from "../binding";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { BoundAction, BoundActionScheme } from "./bound.action";
import { Pin } from "./pin.action";
import { z } from "zod";

export const ForeachActionScheme: z.ZodType<{
    type: 'foreach',
    actions: Action[],
    scopedVariable: string
} & BoundAction> = z.intersection(
    z.strictObject({
        type: z.literal('foreach'),
        /**
         * Actions to execute in order.
         */
        actions: z.array(z.lazy(() => ActionScheme)),
        /**
         * Name of the variable created in scope.
         */
        scopedVariable: z.string()
    }),
    BoundActionScheme
)

/**
 * Action with foreach-like semantics. 
 * Binds to variable and creates a scoped variable with given name.
 */
export type ForeachAction = z.infer<typeof ForeachActionScheme>;

export async function parseForeachAction({ page, action, context, logger }: ActionParseConfig<ForeachAction>): Promise<void> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (): Promise<void> => {
            const childContext: GScrapParseContext = context.copy();
            childContext.setPin(action.scopedVariable, pin.at(index++));
            logger?.info(`Iterating over ${index}' element`);
            await action.actions.reduce(async (acc: Promise<unknown>, action: Action, index: number): Promise<unknown> => {
                await acc;
                logger?.info(`Iterating over ${index + 1}' foreach subaction`);
                return await parseAction({ page, action, context: childContext});
            }, Promise.resolve());
        }
    });

    if(index == 0) {
        logger?.warn('No elements found to be iterated over');
    }
}