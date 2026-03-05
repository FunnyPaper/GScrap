import { Page } from "puppeteer";
import { ClickAction, ClickActionScheme, parseClickAction } from "./click.action.js";
import { EvaluateAction, EvaluateActionScheme, parseEvaluateAction } from "./evaluate.action.js";
import { parseFillAction, BooleanFormActionScheme, StringFormActionScheme, NumberFormActionScheme, BooleanFormAction, NumberFormAction, StringFormAction } from "./fill.action.js";
import { ForeachAction, ForeachActionScheme, parseForeachAction } from "./foreach.action.js";
import { GoBackAction, GoBackActionScheme, parseGoBackAction } from "./go-back.action.js";
import { GoForwardAction, GoForwardActionScheme, parseGoForwardAction } from "./go-forward.action.js";
import { GoToAction, GoToActionScheme, parseGoToAction } from "./go-to.action.js";
import { PaginateAction, PaginateActionScheme, parsePaginateAction } from "./paginate.action.js";
import { parsePinAction, PinAction, PinActionScheme } from "./pin.action.js";
import { parseRefreshAction, RefreshAction, RefreshActionScheme } from "./refresh.action.js";
import { parseSaveAction, SaveAction, SaveActionScheme } from "./save.action.js";
import { parseScrollAction, ScrollAction, ScrollActionScheme } from "./scroll.action.js";
import { GScrapParseContext } from "../context/gscrap-parse.context.js";
import { z } from "zod";
import { Logger } from "winston";
import { parseStageUrlAction, StageUrlAction, StageUrlActionScheme } from "./stage-url.action.js";
import { parseProcessUrlAction, ProcessUrlAction, ProcessUrlActionScheme } from "./process-url.action.js";
import { ExportAction, ExportActionScheme, parseExportAction } from "./export.action.js";

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
    | StageUrlAction
    | ProcessUrlAction
    | ExportAction

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
    PinActionScheme,
    StageUrlActionScheme,
    ProcessUrlActionScheme,
    ExportActionScheme
])

export type ActionParseConfig<A extends Action = Action> = { page: Page, action: A, context: GScrapParseContext, logger?: Logger }

export async function parseAction({ page, action, context, logger }: ActionParseConfig): Promise<boolean> { 
    logger?.info?.(`Parsing action named: ${action.name ?? '---'}`);
    
    if(action.delay) {
        logger?.info?.(`Delaying execution by: ${action.delay}`);
        await new Promise<void>((resolve: () => void) => setTimeout(resolve, action.delay));
    }   

    switch(action.type) {
        case "evaluate": 
            return await parseEvaluateAction({ page, action, context, logger });
        case "click":
            return await parseClickAction({ page, action, context, logger })
        case "fill":
            return await parseFillAction({ page, action, context, logger });
        case "scroll": 
            return await parseScrollAction({ page, action, context, logger });
        case "foreach": 
            return await parseForeachAction({ page, action, context, logger });
        case "paginate": 
            return await parsePaginateAction({ page, action, context, logger });
        case "goBack": 
            return await parseGoBackAction({ page, action, context, logger });
        case 'goForward': 
            return await parseGoForwardAction({ page, action, context, logger });
        case 'goTo': 
            return await parseGoToAction({ page, action, context, logger });
        case "refresh": 
            return await parseRefreshAction({ page, action, context, logger });
        case 'save': 
            return await parseSaveAction({ page, action, context, logger });
        case 'pin': 
            return await parsePinAction({ page, action, context, logger });
        case 'stageUrl': 
            return await parseStageUrlAction({ page, action, context, logger });
        case "processUrl": 
            return await parseProcessUrlAction({ page, action, context, logger });
        case 'export':
            return await parseExportAction({ page, action, context, logger });
    }

    return context.cancelled;
}