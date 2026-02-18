import { Page, ElementHandle } from "puppeteer";
import { parseBinding } from "../binding";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { BoundAction } from "./bound.action"
import { Pin } from "./pin.action";

/**
 * Marks selected element to be clicked. Used to perform side effects.
 */
export type ClickAction = {
    type: 'click'
} & BoundAction

export async function parseClickAction(page: Page, action: ClickAction, context: GScrapParseContext): Promise<void> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    
    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            logger.info?.(`Clicking ${++index}' element...`);
            await handle.evaluate(el => (el as HTMLElement).click())
            //await handle.click();
        }
    })

    if (index == 0) {
        logger.warn?.('No elements found to be clicked');
    }
}