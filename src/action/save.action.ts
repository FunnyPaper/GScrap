import { GScrapParseContextVisitor } from "../context/gscrap-parse.context.visitor";
import { JSONFileWriteHandler } from "../io";
import { CommonActionScheme } from "./common.action";
import { z } from "zod";
import { ActionParseConfig } from ".";

export const SaveActionScheme = z.intersection(
    z.strictObject({
        type: z.literal('save'),
        /**
         * File to save data into
         */
        filename: z.string()
    }),
    CommonActionScheme
)

/**
 * Saves the latest changes in the parsing context to the file
 */
export type SaveAction = z.infer<typeof SaveActionScheme>;

// TODO: Needs to be cleared up later
const writeHandlers = new Map();

export async function parseSaveAction({ page, action, context, logger }: ActionParseConfig<SaveAction>): Promise<boolean> {
    if(!writeHandlers.has(action.filename)) {
        writeHandlers.set(action.filename, new JSONFileWriteHandler({ filepath: action.filename, tabs: 4 }));
    }
    
    const fileHandler = writeHandlers.get(action.filename);

    const visitor = new GScrapParseContextVisitor();
    context.root.visit(visitor);
    
    logger?.info(`Saving evaluation data to: ${__dirname}/${action.filename}`);
    fileHandler.write(visitor.data[0]);

    return false;
}