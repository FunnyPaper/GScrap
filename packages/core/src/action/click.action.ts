import { ElementHandle } from "puppeteer";
import { parseBinding } from "../binding/index.js";
import { ClickAction } from "./schemas.js";
import { Pin } from "./pin.action.js";
import { ActionParseConfig } from "./index.js";

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