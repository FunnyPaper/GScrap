import { Page } from "puppeteer";
import { ClickAction, ClickActionScheme, parseClickAction } from "./click.action";
import { EvaluateAction, EvaluateActionScheme, parseEvaluateAction } from "./evaluate.action";
import { parseFillAction, BooleanFormActionScheme, StringFormActionScheme, NumberFormActionScheme, BooleanFormAction, NumberFormAction, StringFormAction } from "./fill.action";
import { ForeachAction, ForeachActionScheme, parseForeachAction } from "./foreach.action";
import { GoBackAction, GoBackActionScheme, parseGoBackAction } from "./go-back.action";
import { GoForwardAction, GoForwardActionScheme, parseGoForwardAction } from "./go-forward.action";
import { GoToAction, GoToActionScheme, parseGoToAction } from "./go-to.action";
import { PaginateAction, PaginateActionScheme, parsePaginateAction } from "./paginate.action";
import { parsePinAction, PinAction, PinActionScheme } from "./pin.action";
import { parseRefreshAction, RefreshAction, RefreshActionScheme } from "./refresh.action";
import { parseSaveAction, SaveAction, SaveActionScheme } from "./save.action";
import { parseScrollAction, ScrollAction, ScrollActionScheme } from "./scroll.action";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { logger } from "../logger";
import z from "zod";

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

export const ActionScheme: z.ZodType<Action> = z.union([
    EvaluateActionScheme,
    ClickActionScheme,
    BooleanFormActionScheme,
    StringFormActionScheme,
    NumberFormActionScheme,
    ScrollActionScheme,
    ForeachActionScheme,
    PaginateActionScheme,
    GoBackActionScheme,
    SaveActionScheme,
    GoForwardActionScheme,
    RefreshActionScheme,
    GoToActionScheme,
    PinActionScheme
])

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