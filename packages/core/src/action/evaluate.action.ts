import { ElementHandle } from "puppeteer";
import { parseBinding } from "../binding/index.js";
import { EvaluateAction } from "./schemas.js";
import { Pin } from "./pin.action.js";
import { ActionParseConfig } from "./index.js";

export async function parseEvaluateAction({ page, action, context, logger }: ActionParseConfig<EvaluateAction>): Promise<boolean> {
    context.data['url'] = page.url();
    logger?.info(`Storing url:\n${context.data['url']}`);

    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            logger?.info(`Evaluating textContent of ${++index}' element...`);
            const content: string | null = await handle.evaluate((element: any) => element.innerText || element.textContent || element);
            if (content) {
                logger?.info(`Found text:\n${content}`);
                context.data[action.elementAlias ?? action.binding.data] = content;
            } else {
                logger?.warn("No text has been found");
            }
        }
    });

    if (index == 0) {
        logger?.warn('No elements found to be evaluated');
    }

    return context.cancelled;
}