import { Page } from "puppeteer";
import { ClickAction, parseClickAction } from "./click.action";
import { EvaluateAction, parseEvaluateAction } from "./evaluate.action";
import { BooleanFormAction, StringFormAction, NumberFormAction, parseFillAction } from "./fill.action";
import { ForeachAction, parseForeachAction } from "./foreach.action";
import { GoBackAction, parseGoBackAction } from "./go-back.action";
import { GoForwardAction, parseGoForwardAction } from "./go-forward.action";
import { GoToAction, parseGoToAction } from "./go-to.action";
import { PaginateAction, parsePaginateAction } from "./paginate.action";
import { parsePinAction, PinAction } from "./pin.action";
import { parseRefreshAction, RefreshAction } from "./refresh.action";
import { parseSaveAction, SaveAction } from "./save.action";
import { parseScrollAction, ScrollAction } from "./scroll.action";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";

/**
 * Marks element to be a subject of an Action.
 */
export type Action =
    | EvaluateAction
    | ClickAction
    | BooleanFormAction
    | StringFormAction
    | NumberFormAction
    | ScrollAction
    | ForeachAction
    | PaginateAction
    | GoBackAction
    | SaveAction
    | GoForwardAction
    | RefreshAction
    | GoToAction
    | PinAction

export async function parseAction(page: Page, action: Action, context: GScrapParseContext): Promise<boolean> { 
    logger.info?.(`Parsing action named: ${action.name ?? '---'}`);
    
    if(action.delay) {
        logger.info?.(`Delaying execution by: ${action.delay}`);
        await new Promise<void>((resolve: () => void) => setTimeout(resolve, action.delay));
    }   

    switch(action.type) {
        case "evaluate": await parseEvaluateAction(page, action, context);
            break;
        case "click": await parseClickAction(page, action, context);
            break;
        case "fill": await parseFillAction(page, action, context);
            break;
        case "scroll": await parseScrollAction(page, action, context);
            break;
        case "foreach": await parseForeachAction(page, action, context);
            break;
        case "paginate": await parsePaginateAction(page, action, context);
            break;
        case "goBack": await parseGoBackAction(page, action, context);
            break;
        case 'goForward': await parseGoForwardAction(page, action, context);
            break;
        case 'goTo': await parseGoToAction(page, action, context);
            break;
        case "refresh": await parseRefreshAction(page, action, context);
            break;
        case 'save': await parseSaveAction(page, action, context);
            break;
        case 'pin': await parsePinAction(page, action, context);
            break;
    }

    return false;
}