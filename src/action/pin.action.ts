import { ElementHandle, Page } from "puppeteer";
import { CommonActionScheme } from "./common.action"
import { countElements, getElement, getElements } from "../utils/parse.utils";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { z } from "zod";

export const ActionSelectorScheme = z.strictObject({
    /**
     * Specifies path in string.
     */
    path: z.string(),
    /**
     * Type of path stored in path property.
     */
    type: z.union([z.literal('CSS'), z.literal('XPath')]),
    /**
     * Should program stop it's execution if no selectors have been found?
     * Determines if following actions should be processed or control flow should return to first parent group action.
     */
    optional: z.boolean().optional(),
    /**
     * How many elements should be matched. Defaults to all.
     */
    count: z.union([z.number(), z.literal('all')]).optional(),
    /**
     * What strategy should be used when multiple elements have been matched. Defaults to cache
     */
    mode: z.union([z.literal('cache'), z.literal('requery')]).optional(),
    /**
     * How many times the search for selector should be retried. Defaults to 3
     */
    retries: z.number().optional()
})

/**
 * Selector descriptor - defines how the selector should be parsed.
 */
export type ActionSelector = z.infer<typeof ActionSelectorScheme>;

export const PinActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('pin'),
        selector: ActionSelectorScheme,
        variable: z.string()
    }),
    CommonActionScheme
)

export type PinAction = z.infer<typeof PinActionScheme>;

export class Pin {
    public readonly selector: ActionSelector;

    public constructor(selector: ActionSelector) {
        this.selector = selector;
    }
    
    public async use(config: {
        page: Page, 
        task: (handle: ElementHandle) => Promise<void>
    }): Promise<void> {
        const { page, task } = config;

        for(let i: number = 0, errors: number = 0; errors < 3; errors++) {
            try {
                for await (let handle of this.generate(page, i)) {
                    await task(handle);
                    i++
                }
                
                break;
            } catch {
                continue;
            }
        }
    }

    private async *generate(page: Page, index: number) {
        if(this.selector.mode == 'requery') {
            for(
                let i: number = index, handle: ElementHandle | null = await getElement(page, this.selector, i); 
                handle; 
                i++, handle = await getElement(page, this.selector, i)
            ) {
                yield handle;
            }
        } else  {
            const handles = await getElements(page, this.selector);

            for(let i: number = index; handles && handles[i]; i++) {
                yield handles[i];
            }
        }
    }

    public async count(page: Page): Promise<number> {
        return countElements(page, this.selector);
    }

    public at(index: number): Pin {
        const selector: ActionSelector = {...this.selector};
        
        if(selector.type == 'CSS') {
            selector.path = `${selector.path}:nth-of-type(${index + 1})`;
        } else if(selector.type == 'XPath') {
            selector.path = `(${selector.path})[${index + 1}]`;
        }

        return new Pin(selector);
    }
}

export async function parsePinAction(page: Page, action: PinAction, context: GScrapParseContext) {
    context.setPin(action.variable, action.selector);
}