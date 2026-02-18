import { Page, ElementHandle } from "puppeteer"
import { Action } from "."
import { parseBinding } from "../binding"
import { GScrapParseContext } from "../context/gscrap-parse.context"
import { logger } from "../logger"
import { BoundAction } from "./bound.action"
import { Pin } from "./pin.action"

/**
 * Marks selected element to be a host for fill event. Used to fill form fields.
 */
export type FillAction = {
    type: 'fill'
    /**
     * Specifies value type used for filling.
     */
    fillType: unknown
    /**
     * Data used to fill form-like elements.
     */
    data: unknown
} & BoundAction

/**
 * Marks selected element to be host for fill event. Fill value is of type boolean.
 */
export type BooleanFormAction = {
    fillType: 'boolean'
    data: boolean
} & FillAction

/**
 * Marks selected element to be host for fill event. Fill value is of type string.
 */
export type StringFormAction = {
    fillType: 'string'
    // data: string
} & FillAction

/**
 * Marks selected element to be host for fill event. Fill value is of type number.
 */
export type NumberFormAction = {
    fillType: 'number',
    data: number
} & FillAction

export async function parseFillAction(page: Page, action: Extract<Action, { fillType: string }>, context: GScrapParseContext): Promise<void> {    
    logger.info?.('Filling elements...');

    let index: number = 0;
    const pin: Pin = parseBinding(action.binding, context);
    await pin.use({
        page: page,
        task: async (handle: ElementHandle): Promise<void> => {
            switch(action.fillType) {
                case "string": 
                    logger.info?.(`${++index}' text field filled with: ${action.data}`);
                    await handle.type(action.data as string);
                    break;
                case "number": 
                    logger.info?.(`${++index}' Number field filled with ${action.data}`);
                    await handle.type(action.data.toString());
                    break;
                case "boolean": 
                    logger.info?.(`${++index}' Checkable field set with ${action.data}`);
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
        logger.warn?.('No elements found to be filled');
    }
}