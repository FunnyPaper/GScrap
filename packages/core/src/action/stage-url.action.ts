import { z } from "zod";
import { ActionParseConfig } from "./index.js";
import { BoundActionScheme } from "./bound.action.js";
import { Pin } from "./pin.action.js";
import { parseBinding } from "../binding/index.js";
import { ElementHandle } from "puppeteer";

export const StageUrlActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('stageUrl'),
        /** 
         * Stage storage name to store the urls
        */
        group: z.string()
    }),
    BoundActionScheme
)

export type StageUrlAction = z.infer<typeof StageUrlActionScheme>;

export async function parseStageUrlAction({ page, action, context, logger }: ActionParseConfig<StageUrlAction>): Promise<boolean> {
    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    
    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            logger?.info(`Staging ${++index} urls...`);
            const hrefs = await handle.evaluate(el => {
                const hrefs = [];

                if (el instanceof HTMLAnchorElement) {
                    hrefs.push(el.href);
                }

                hrefs.push(
                    ...Array.from(el.querySelectorAll('a'), a => a.href)
                );

                return [...new Set(hrefs)];
            });
            logger?.info(`Staged urls [group:${action.group}]: ${hrefs}`);
            context.stageUrls(action.group, hrefs);
        }
    });

    return context.cancelled;
}