import { GScrapParseContextVisitor } from "../context/gscrap-parse.context.visitor";
import { CommonActionScheme } from "./common.action";
import { z } from "zod";
import { ActionParseConfig } from ".";

export const ExportActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('export'),
        /**
         * File to export data into
         */
        filename: z.string()
    }),
    CommonActionScheme
)

/**
 * Exports store data into json file
 */
export type ExportAction = z.infer<typeof ExportActionScheme>;

export async function parseExportAction({ page, action, context, logger }: ActionParseConfig<ExportAction>): Promise<boolean> {
    const store = context.store;
    const visitor = new GScrapParseContextVisitor(store);
    context.visit(visitor);

    logger?.info(`Exporting store data to: ${__dirname}/${action.filename}`);
    store.exportToJson(action.filename);

    return false;
}