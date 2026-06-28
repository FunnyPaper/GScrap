import { Page } from "puppeteer";
import { parseClickAction } from "./click.action.js";
import { Action } from "./schemas.js";
import { parseEvaluateAction } from "./evaluate.action.js";
import { parseFillAction } from "./fill.action.js";
import { parseForeachAction } from "./foreach.action.js";
import { parseGoBackAction } from "./go-back.action.js";
import { parseGoForwardAction } from "./go-forward.action.js";
import { parseGoToAction } from "./go-to.action.js";
import { parsePaginateAction } from "./paginate.action.js";
import { parsePinAction } from "./pin.action.js";
import { parseRefreshAction } from "./refresh.action.js";
import { parseSaveAction } from "./save.action.js";
import { parseScrollAction } from "./scroll.action.js";
import { GScrapParseContext } from "../context/gscrap-parse.context.js";
import { Logger } from "winston";
import { parseStageUrlAction } from "./stage-url.action.js";
import { parseProcessUrlAction } from "./process-url.action.js";
import { parseExportAction } from "./export.action.js";
import { parseAutoScrollAction } from "./autoscroll.action.js";

export type ActionParseConfig<A extends Action = Action> = {
    page: Page,
    action: A,
    context: GScrapParseContext,
    logger?: Logger,
    globalOptions?: { headless?: boolean, cacheDir?: string }
}

// TODO: Refactor actions into classes with composition
// Allow overriding specific actions if necessary

export async function parseAction({ page, action, context, logger, globalOptions }: ActionParseConfig): Promise<boolean> {
    if (context.cancelled) return true;

    logger?.info?.(`Parsing action named: ${action.name ?? '---'}`);

    if (action.delay) {
        logger?.info?.(`Delaying execution by: ${action.delay}`);
        await new Promise<void>((resolve: () => void) => setTimeout(resolve, action.delay));
    }

    switch (action.type) {
        case "evaluate":
            return await parseEvaluateAction({ page, action, context, logger, globalOptions });
        case "click":
            return await parseClickAction({ page, action, context, logger, globalOptions })
        case "fill":
            return await parseFillAction({ page, action, context, logger, globalOptions });
        case "scroll":
            return await parseScrollAction({ page, action, context, logger, globalOptions });
        case "foreach":
            return await parseForeachAction({ page, action, context, logger, globalOptions });
        case "paginate":
            return await parsePaginateAction({ page, action, context, logger, globalOptions });
        case "autoScroll":
            return await parseAutoScrollAction({ page, action, context, logger, globalOptions });
        case "goBack":
            return await parseGoBackAction({ page, action, context, logger, globalOptions });
        case 'goForward':
            return await parseGoForwardAction({ page, action, context, logger, globalOptions });
        case 'goTo':
            return await parseGoToAction({ page, action, context, logger, globalOptions });
        case "refresh":
            return await parseRefreshAction({ page, action, context, logger, globalOptions });
        case 'save':
            return await parseSaveAction({ page, action, context, logger, globalOptions });
        case 'pin':
            return await parsePinAction({ page, action, context, logger, globalOptions });
        case 'stageUrl':
            return await parseStageUrlAction({ page, action, context, logger, globalOptions });
        case "processUrl":
            return await parseProcessUrlAction({ page, action, context, logger, globalOptions });
        case 'export':
            return await parseExportAction({ page, action, context, logger, globalOptions });
    }

    return context.cancelled;
}