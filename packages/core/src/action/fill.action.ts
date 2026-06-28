import { ElementHandle } from "puppeteer"
import { parseBinding } from "../binding/index.js"
import { Pin } from "./pin.action.js"
import { ActionParseConfig } from "./index.js"
import { Action } from "./schemas.js";

export async function parseFillAction({ page, action, context, logger }: ActionParseConfig<Extract<Action, { fillType: string }>>): Promise<boolean> {
    logger?.info('Filling elements...');

    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            switch (action.fillType) {
                case "string":
                    logger?.info(`${++index}' text field filled with: ${action.data}`);
                    await handle.type(action.data as string);
                    break;
                case "number":
                    logger?.info(`${++index}' Number field filled with ${action.data}`);
                    await handle.type(action.data.toString());
                    break;
                case "boolean":
                    logger?.info(`${++index}' Checkable field set with ${action.data}`);
                    await handle.evaluate((element: Element, data: boolean) => {
                        if (element instanceof HTMLInputElement) {
                            element.checked = data;
                        }
                    }, action.data);
                    break;
            }
        }
    });

    if (index == 0) {
        logger?.warn('No elements found to be filled');
    }

    return context.cancelled;
}