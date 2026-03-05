import { CommonActionScheme } from "./common.action.js";
import { z } from "zod";
import { ActionParseConfig } from "./index.js";

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
    logger?.info(`Exporting store data to: ${process.cwd()}/${action.filename}`);
    store.exportToJson(action.filename);

    return context.cancelled;
}