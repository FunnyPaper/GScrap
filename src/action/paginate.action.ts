import { ElementHandle } from "puppeteer";
import { Action, ActionParseConfig, ActionScheme, parseAction } from ".";
import { parseBinding } from "../binding";
import { BoundAction, BoundActionScheme } from "./bound.action";
import { Pin } from "./pin.action";
import { z } from "zod";

export const PaginateActionScheme: z.ZodType<{ 
    type: 'paginate',
    actions: Action[]
} & BoundAction> = z.intersection(
    z.strictObject({
        type: z.literal('paginate'),
        /**
         * Actions to execute in order.
         */
        actions: z.array(z.lazy(() => ActionScheme)),
    }),
    BoundActionScheme
)

/**
 * Action with paginate-like semantics. 
 * Executes actions in order. 
 * Loops until specified variable is no longer reachable.
 */
export type PaginateAction = z.infer<typeof PaginateActionScheme>;

export async function parsePaginateAction({ page, action, context, logger }: ActionParseConfig<PaginateAction>): Promise<void> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    while(true) {
        logger?.info(`Invoking paginate subactions on page: ${++index}`);
        await action.actions.reduce(async (acc: Promise<unknown>, action: Action, index: number): Promise<unknown> => {
            await acc;
            logger?.info(`Iterating over ${index + 1}' paginate subaction`);
            return await parseAction({ page, action, context });
        }, Promise.resolve());

        const isNext: boolean = await pin.count(page) > 0;
        if (isNext) {
            let visible: boolean = true;
            await pin.use({
                page: page,
                task: async (handle: ElementHandle): Promise<void> => {
                    if(await handle.isVisible()) {
                        logger?.info(`Heading over to next page...`);
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

    logger?.info(`No new page to iterate over`);
}