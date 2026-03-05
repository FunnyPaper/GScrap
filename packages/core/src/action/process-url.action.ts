import { Action, ActionParseConfig, ActionScheme, parseAction } from "./index.js";
import { z } from "zod";
import { CommonAction, CommonActionScheme } from "./common.action.js";
import { GScrapParseContext } from "../context/gscrap-parse.context.js";
import { Cluster } from "puppeteer-cluster";
import UserAgent from "user-agents";
import { PuppeteerIgnoreArgs, PuppeteerLaunchOptions } from "../utils/browser.utils.js";

export const ProcessUrlActionScheme: z.ZodType<{ 
    type: 'processUrl',
    actions: Action[],
    group: string
} & CommonAction> = z.intersection(
    z.strictObject({
        type: z.literal('processUrl'),
        /**
         * Actions to execute in order.
         */
        actions: z.array(z.lazy(() => ActionScheme)),
        /** 
         * Stage storage name to retrieve urls from
        */
        group: z.string()
    }), 
    CommonActionScheme
)

/**
 * Action processing stored url groups with a group of actions. 
 * Executes actions in order. 
 * Loops until specified variable is no longer reachable.
 */
export type ProcessUrlAction = z.infer<typeof ProcessUrlActionScheme>;

export async function parseProcessUrlAction({ page, action, context, logger }: ActionParseConfig<ProcessUrlAction>): Promise<boolean> {
    const hrefs = context.getUrls(action.group);
    logger?.info(`Hrefs to process: ${hrefs}`);
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 5,
        puppeteerOptions: {
            args: PuppeteerLaunchOptions, 
            ignoreDefaultArgs: PuppeteerIgnoreArgs
        },
        retryLimit: 3,
        retryDelay: 2000,
        skipDuplicateUrls: true
    })

    await cluster.task(async ({ page, data: url }) => {
        const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
        page.setUserAgent(userAgent);

        logger?.info(`Processing url: ${url}`);
        const childContext: GScrapParseContext = context.copy();

        await Promise.all([
            page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
            page.goto(url)
        ]);

        await action.actions.reduce(async (acc: Promise<unknown>, action: Action, index: number): Promise<unknown> => {
            await acc;
            logger?.info(`Iterating over ${index + 1}' process url subaction`);
            return await parseAction({ page, action, context: childContext, logger });
        }, Promise.resolve());
    })


    for (const href of hrefs) {
        cluster.queue(href);
    }

    await cluster.idle();
    await cluster.close();

    return context.cancelled;
}