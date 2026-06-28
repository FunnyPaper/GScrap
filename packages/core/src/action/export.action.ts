import { ExportAction } from "./schemas.js";
import { ActionParseConfig } from "./index.js";

export async function parseExportAction({ page, action, context, logger }: ActionParseConfig<ExportAction>): Promise<boolean> {
    const store = context.store;
    logger?.info(`Exporting store data to: ${process.cwd()}/${action.filename}`);
    store.exportToJson(action.filename);

    return context.cancelled;
}