import { ActionParseConfig, parseAction } from "./index.js";
import { Action } from "./schemas.js";
import { ProcessUrlAction } from "./schemas.js";
import { GScrapParseContext } from "../context/gscrap-parse.context.js";
import { Cluster } from "puppeteer-cluster";
import { getBrowserExecutablePath, PuppeteerIgnoreArgs, PuppeteerLaunchOptions } from "../utils/browser.utils.js";

export async function parseProcessUrlAction({ page, action, context, logger, globalOptions }: ActionParseConfig<ProcessUrlAction>): Promise<boolean> {
    const { headless = false, cacheDir } = globalOptions || {};

    const hrefs = context.getUrls(action.group);
    logger?.info(`Hrefs to process: ${hrefs}`);
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 5,
        puppeteerOptions: {
            ...(cacheDir && {
                executablePath: getBrowserExecutablePath(cacheDir),
                env: {
                    PUPPETEER_CACHE_DIR: cacheDir,
                    PUPPETEER_EXECUTABLE_PATH: getBrowserExecutablePath(cacheDir)
                },
            }),
            headless: headless,
            args: PuppeteerLaunchOptions,
            ignoreDefaultArgs: PuppeteerIgnoreArgs
        },
        retryLimit: 3,
        retryDelay: 2000,
        skipDuplicateUrls: true
    })

    await cluster.task(async ({ page, data: url }) => {
        if (context.cancelled) return;

        logger?.info(`Processing url: ${url}`);
        const childContext: GScrapParseContext = context.copy();

        await Promise.all([
            page.waitForNavigation({ waitUntil: ['networkidle2', 'domcontentloaded', 'load'] }),
            page.goto(url)
        ]);

        if (context.cancelled) return;
        await action.actions.reduce(async (acc: Promise<boolean>, action: Action, index: number): Promise<boolean> => {
            if (await acc) return acc;
            logger?.info(`Iterating over ${index + 1}' process url subaction`);
            return await parseAction({ page, action, context: childContext, logger, globalOptions });
        }, Promise.resolve(context.cancelled));
    })


    for (const href of hrefs) {
        cluster.queue(href);
    }

    await cluster.idle();
    await cluster.close();

    return context.cancelled;
}