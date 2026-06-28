import { GScrapParseContextVisitor } from "../context/gscrap-parse.context.visitor.js";
import { SaveAction } from "./schemas.js";
import { ActionParseConfig } from "./index.js";

export async function parseSaveAction({ page, action, context, logger }: ActionParseConfig<SaveAction>): Promise<boolean> {
    const store = context.store;
    const visitor = new GScrapParseContextVisitor(store);
    context.visit(visitor);

    logger?.info(`Saving evaluation data to store.`);

    return context.cancelled;
}