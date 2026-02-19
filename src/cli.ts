#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as Package from "../package.json";
import { existsSync, readFileSync } from 'fs';
import { GScrapConfig, GScrapConfigScheme } from './config';
import { logger } from './logger';
import z from 'zod';
import { updateVars, varsLeft } from './utils/vars.utils';
import { Page } from 'puppeteer';
import { Logger } from 'winston';
import { parseAction } from './action';
import { GScrapParseContext } from './context/gscrap-parse.context';
import { GScrapParseContextVisitor } from './context/gscrap-parse.context.visitor';
import { withBrowser } from './utils/browser.utils';
import { withPage } from './utils/page.utils';

export async function parse(config: GScrapConfig, logger?: Logger): Promise<object> {
    logger?.info("Welcome to GScrap!");
    logger?.info("Launching new browser...");

    return await withBrowser(async (browser) => {
        logger?.info("Browser launched!\nLaunching new page...");

        const parseContext: GScrapParseContext = new GScrapParseContext();

        await withPage(browser, async (page: Page) => {
            logger?.info(`Page launched! Changing location to '${config.startingPage}' ...`);
            await page.setViewport({   
                width: Math.floor(1024 + Math.random() * 100),
                height: Math.floor(768 + Math.random() * 100), 
            });

            await page.goto(config.startingPage, { waitUntil: ['networkidle2', 'domcontentloaded', 'load'] });
    
            logger?.info(`'${config.startingPage}' has been set successfully as a current location!`);
            logger?.info('Browsing modules...');
    
            for(const action of config.actions) {
                await parseAction({ page, action, context: parseContext, logger });
            }
        }, logger);

        // Retrieve data
        const visitor = new GScrapParseContextVisitor();
        parseContext.visit(visitor);

        return visitor.data;
    })
}

async function main() {
  const argv = yargs(hideBin(process.argv))
      .scriptName(Package.name)
      .version(Package.version)
      .alias("v", "version")
      .help("h")
      .alias("h", "help")
      .option("f", {
          type: 'string',
          alias: 'filepath',
          default: 'gscrap-config.json',
          description: 'Path to the scrap config.'
      })
      .option("vars", {
          type: 'string',
          alias: 'variables',
          default: 'gscrap-vars.json',
          description: 'Path to the vars file. Vars is a key-value object used to replace template variables inside scrap config.'
      })
      .option("s", {
        type: 'boolean',
        alias: 'silent',
        default: false,
        description: 'Logger inclusion. If silent is true then messages from parsing process are not logged to the console. Cli messages and errors surpasses this option.'
      })
      .argv

    const args = await argv;
    let config: GScrapConfig | null = null;
    let vars: object | null = null;

    if(!existsSync(args.vars)) {
        return logger?.error(`Supplied path does not exists. Path: ${args.vars}`);
    } else {
        vars = JSON.parse(readFileSync(args.vars, 'utf8'));
    }

    if(!existsSync(args.f)) {
        return logger?.error(`Supplied path does not exists. Path: ${args.f}`);
    } else {
        config = JSON.parse(readFileSync(args.f, 'utf8'));
        config = GScrapConfigScheme.parse(config);
    }

    if(!vars && varsLeft(config)) {
        logger?.warn('No vars have been supplied despite config using them.');
    }

    if(vars && varsLeft(config)) {
        updateVars(config, vars);

        if(varsLeft(config)) {
            logger?.warn('Not all vars have been supplied.');
        }
    }

    await parse(config, args.s ? undefined : logger);
}

main().catch((error) => {
    if (error instanceof z.ZodError) {
        logger.error?.(JSON.stringify(error.issues, null, 4));
    } else {
        logger.error?.(error);
    }
    
    process.exit(1);
});