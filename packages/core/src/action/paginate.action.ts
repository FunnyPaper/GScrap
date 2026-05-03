import { ElementHandle } from "puppeteer";
import { Action, ActionParseConfig, ActionScheme, parseAction } from "./index.js";
import { parseBinding } from "../binding/index.js";
import { BoundAction, BoundActionScheme } from "./bound.action.js";
import { Pin } from "./pin.action.js";
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

                    const isIntersecting = await handle.isIntersectingViewport();
                    const isVisible = await handle.isVisible();

                    if (isVisible && isIntersecting) {
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