import { ElementHandle } from "puppeteer";
import { parseBinding } from "../binding/index.js";
import { ScrollAction } from "./schemas.js";
import { Pin } from "./pin.action.js";
import { ActionParseConfig } from "./index.js";

export async function parseScrollAction({ page, action, context, logger }: ActionParseConfig<ScrollAction>): Promise<boolean> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            logger?.info(`Scrolling ${index + 1}' element by: ${action.scrollBy}`);
            await handle.evaluate((element: Element, data: { x: number, y: number }): void => {
                element.scrollBy({ top: data.x, left: data.y });
            }, action.scrollBy);
        }
    });

    if (index == 0) {
        logger?.warn('No elements found to be scrolled');
    }

    return context.cancelled;
}