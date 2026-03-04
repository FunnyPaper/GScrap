import { GScrapParseContextVisitor } from "../context/gscrap-parse.context.visitor";
import { CommonActionScheme } from "./common.action";
import { z } from "zod";
import { ActionParseConfig } from ".";

export const SaveActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('save'),
    }),
    CommonActionScheme
)

/**
 * Saves the latest changes in the parsing context to the file
 */
export type SaveAction = z.infer<typeof SaveActionScheme>;

export async function parseSaveAction({ page, action, context, logger }: ActionParseConfig<SaveAction>): Promise<boolean> {
    const store = context.store;
    const visitor = new GScrapParseContextVisitor(store);
    context.visit(visitor);

    logger?.info(`Saving evaluation data to store.`);

    return false;
}