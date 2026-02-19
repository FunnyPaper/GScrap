import { ElementHandle } from "puppeteer"
import { parseBinding } from "../binding"
import { BoundActionScheme } from "./bound.action"
import { Pin } from "./pin.action"
import { z } from "zod"
import { Action, ActionParseConfig } from "."

export const FillActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('fill'),
        /**
         * Specifies value type used for filling.
         */
        fillType: z.unknown(),
        /**
         * Data used to fill form-like elements.
         */
        data: z.unknown()
    }),
    BoundActionScheme
)

/**
 * Marks selected element to be a host for fill event. Used to fill form fields.
 */
export type FillAction = z.infer<typeof FillActionScheme>;

export const BooleanFormActionScheme = z.intersection(
    z.strictObject({
        fillType: z.literal('boolean'),
        data: z.boolean()
    }),
    FillActionScheme
)

/**
 * Marks selected element to be host for fill event. Fill value is of type boolean.
 */
export type BooleanFormAction = z.infer<typeof BooleanFormActionScheme>;

export const StringFormActionScheme = z.intersection(
    z.strictObject({
        fillType: z.literal('string'),
        data: z.string()
    }),
    FillActionScheme
)

/**
 * Marks selected element to be host for fill event. Fill value is of type string.
 */
export type StringFormAction = z.infer<typeof StringFormActionScheme>;

export const NumberFormActionScheme = z.intersection(
    z.strictObject({
        fillType: z.literal('number'),
        data: z.number()
    }),
    FillActionScheme
)

/**
 * Marks selected element to be host for fill event. Fill value is of type number.
 */
export type NumberFormAction = z.infer<typeof NumberFormActionScheme>;

export async function parseFillAction({ page, action, context, logger }: ActionParseConfig<Extract<Action, { fillType: string }>>): Promise<void> {    
    logger?.info('Filling elements...');

    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            switch(action.fillType) {
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
                        if(element instanceof HTMLInputElement) {
                            element.checked = data;
                        }
                    }, action.data);
                    break;
            }      
        }
    });

    if(index == 0) {
        logger?.warn('No elements found to be filled');
    }
}