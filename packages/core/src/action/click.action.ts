import { ElementHandle } from "puppeteer";
import { parseBinding } from "../binding/index.js";
import { BoundActionScheme } from "./bound.action.js";
import { Pin } from "./pin.action.js";
import { z } from "zod";
import { ActionParseConfig } from "./index.js";

export const ClickActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('click')
    }),
    BoundActionScheme
)

/**
 * Marks selected element to be clicked. Used to perform side effects.
 */
export type ClickAction = z.infer<typeof ClickActionScheme>;

export async function parseClickAction({ page, action, context, logger }: ActionParseConfig<ClickAction>): Promise<boolean> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);

    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            logger?.info(`Clicking ${++index}' element...`);
            await handle.evaluate(el => (el as HTMLElement).click());
        }
    })

    if (index == 0) {
        logger?.warn('No elements found to be clicked');
    }

    return context.cancelled;
}