#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as Package from "../package.json";
import puppeteer from 'puppeteer-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import { existsSync, readFileSync } from 'fs';
import { Page } from 'puppeteer';
import { parseAction } from './action';
import { GScrapConfig } from './config';
import { GScrapParseContext } from './context/gscrap-parse.context';
import { GScrapParseContextVisitor } from './context/gscrap-parse.context.visitor';
import { logger } from './logger';
import { withBrowser } from './utils/browser.utils';
import { withPage } from './utils/page.utils';

puppeteer.use(stealthPlugin())



async function parse(config: GScrapConfig): Promise<object> {
    logger.info?.("Welcome to GScrap!");
    logger.info?.("Launching new browser...");

    return await withBrowser(async (browser) => {
        logger.info?.("Browser launched!\nLaunching new page...");

        const parseContext: GScrapParseContext = new GScrapParseContext();

        await withPage(browser, async (page: Page) => {
            logger.info?.(`Page launched! Changing location to '${config.startingPage}' ...`);
            await page.setViewport({   
              width: Math.floor(1024 + Math.random() * 100),
              height: Math.floor(768 + Math.random() * 100), 
            });

            await page.goto(config.startingPage, { waitUntil: ['networkidle2', 'domcontentloaded', 'load'] });
    
            logger.info?.(`'${config.startingPage}' has been set successfully as a current location!`);
            logger.info?.('Browsing modules...');
    
            for(const action of config.actions) {
                await parseAction(page, action, parseContext);
            }
        });

        // Retrieve data
        const visitor = new GScrapParseContextVisitor();
        parseContext.visit(visitor);

        return visitor.data;
    })
}

function updateVars(config: any, vars: any): void {    
    Object.keys(config).forEach((key) => {
        if (typeof config[key] == 'string') {
            const property: String = config[key];
            const templates = property.match(/(?<=\{\{)(.*?)(?=\}\})/g);
            if(templates) {
                templates.forEach(template => {
                    const parts: string[] = template.split(':');
                    if(parts[0] in vars) {
                        config[key] = config[key].replace(`\{\{${template}\}\}`, vars[parts[0]]);
                    } else if(parts.length > 1) {
                        config[key] = config[key].replace(`\{\{${template}\}\}`, parts.slice(1).join(':'));
                    }
                });
            }
        } else {
           updateVars(config[key], vars); 
        }
    });
}

function varsLeft(config: any): boolean {
    return !!Object.keys(config).find((key) => {
        if (typeof config[key] == 'string') {
            const property: String = config[key];
            const templates = property.match(/\{\{(.*?)\}\}/g);
            return !!templates;
        } 

        return varsLeft(config[key]);
    });
}

async function main() {
  const argv = yargs(hideBin(process.argv))
      .scriptName(Package.name)
      .version(Package.version)
      .alias("v", "version")
      .help("h")
      .alias("h", "help")
      .option("f", {
          string: true,
          alias: 'filepath',
          default: 'gscrap-config.json'
      })
      .option("vars", {
          string: true,
          alias: 'variables',
          default: 'gscrap-vars.json'
      })
      .argv

    const args = await argv;
    let config: GScrapConfig | null = null;
    let vars: object | null = null;

    if(!existsSync(args.vars)) {
        return logger.error?.(`Supplied path does not exists. Path: ${args.vars}`);
    } else {
        vars = JSON.parse(readFileSync(args.vars, 'utf8'));
        logger.debug?.(`Vars loaded:\n${JSON.stringify(vars, null, 4)}`);
    }

    if(!existsSync(args.f)) {
        return logger.error?.(`Supplied path does not exists. Path: ${args.f}`);
    } else {
        config = JSON.parse(readFileSync(args.f, 'utf8'));
        //logger.debug?.(`Config loaded:\n${JSON.stringify(config, null, 4)}`);
    }

    if(config && !vars && varsLeft(config)) {
        return logger.error?.('No vars have been supplied despite config using them.');
    }

    if(config && vars && varsLeft(config)) {
        updateVars(config, vars);

        //logger.debug?.(`Vars embedded:\n${JSON.stringify(config, null, 4)}`);

        if(varsLeft(config)) {
            return logger.error?.('Not all vars have been supplied.');
        }
    }

    if(config) {
        const result = await parse(config);
    }
}

main().catch((error) => {
    logger.error?.(error);
    process.exit(1);
});