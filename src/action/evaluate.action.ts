import { Page, ElementHandle } from "puppeteer";
import { parseBinding } from "../binding";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import { BoundActionScheme } from "./bound.action"
import { Pin } from "./pin.action";
import { z } from "zod";

export const EvaluateActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('evaluate'),
        /**
         * Alias used for human readable output. 
         * If not specified application will try to use id, full class name or whole selector. 
         */
        elementAlias: z.string().optional()
    }),
    BoundActionScheme
)

/**
 * Marks selected element to be evaluated and its value should be obtained. 
 * The target property or properties depends on the type of element itself and is determined at runtime -
 * It can point to input's value field, img's src field, etc.
 */
export type EvaluateAction = z.infer<typeof EvaluateActionScheme>;

export async function parseEvaluateAction(page: Page, action: EvaluateAction, context: GScrapParseContext): Promise<void> {
    context.data['url'] = page.url();
    logger.info?.(`Storing url:\n${context.data['url']}`);
    
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page, 
        task: async (handle: ElementHandle): Promise<void> => {    
            logger.info?.(`Evaluating textContent of ${++index}' element...`);
            const content: string | null = await handle.evaluate((element: any) => element.innerText || element.textContent || element);
            if(content) {
                logger.info?.(`Found text:\n${content}`);
                context.data[action.elementAlias ?? action.binding.data] = content;
            } else {
                logger.warn?.("No text has been found");
            }
        }
    });

    if(index == 0) {
        logger.warn?.('No elements found to be evaluated');
    }
}