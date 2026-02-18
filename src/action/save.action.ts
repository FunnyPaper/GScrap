import { Page, ElementHandle } from "puppeteer";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { GScrapParseContextVisitor } from "../context/gscrap-parse.context.visitor";
import { JSONFileWriteHandler } from "../io";
import { logger } from "../logger";
import { CommonAction } from "./common.action"

/**
 * Saves the latest changes in the parsing context to the file
 */
export type SaveAction = {
    type: 'save',
    /**
     * File to save data into
     */
    filename: string
} & CommonAction

export async function parseSaveAction(page: Page, action: SaveAction, context: GScrapParseContext, parentHandle?: ElementHandle): Promise<boolean> {
    const fileHandler = new JSONFileWriteHandler({ filepath: action.filename, tabs: 4, append: false });

    const visitor = new GScrapParseContextVisitor();
    context.root.visit(visitor);
    
    logger.info?.(`Saving evaluation data to: ${__dirname}/${action.filename}`);
    fileHandler.write(visitor.data);

    return false;
}