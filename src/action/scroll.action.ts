import { Page, ElementHandle } from "puppeteer";
import { parseBinding } from "../binding";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { BoundActionScheme } from "./bound.action"
import { Pin } from "./pin.action";
import z from "zod";

export const ScrollActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('scroll'),
        /**
         * How much should the host be scrolled along X and Y axis.
         */
        scrollBy: z.strictObject({
            x: z.number(),
            y: z.number()
        })
    }),
    BoundActionScheme
)

/**
 * Marks selected element to be a host for scrolling. Used to perform side effects.
 */
export type ScrollAction = z.infer<typeof ScrollActionScheme>;

export async function parseScrollAction(page: Page, action: ScrollAction, context: GScrapParseContext): Promise<void> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            logger.info?.(`Scrolling ${index + 1}' element by: ${action.scrollBy}`);
            await handle.evaluate((element: Element, data: { x: number, y: number }): void => {
                element.scrollBy({ top: data.x, left: data.y });
            }, action.scrollBy);
        }
    });

    if(index == 0) {
        logger.warn?.('No elements found to be scrolled');
    }
}