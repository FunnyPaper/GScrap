#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Package from "../package.json";
import { existsSync, readFileSync } from 'fs';
import { GScrapConfig, GScrapConfigScheme, updateVars, varsLeft, GScrapRunner, GScrapRecord } from '@gscrap/core';
import { Logger } from 'winston';
import { z } from 'zod';
import { resolve } from 'path';
import { logger } from './logger';

async function parse(config: GScrapConfig, logger?: Logger): Promise<GScrapRecord[]> {
    const runner = new GScrapRunner(config, 'cli');

    runner.on('log', ({ type, message }) => logger?.[type](message));
    await runner.run();

    return runner.data;
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

    const varsPath = resolve(process.cwd(), args.vars);
    if(!existsSync(varsPath)) {
        return logger?.error(`Supplied path does not exists. Path: ${varsPath}`);
    } else {
        vars = JSON.parse(readFileSync(varsPath, 'utf8'));
    }

    const filePath = resolve(process.cwd(), args.f);
    if(!existsSync(filePath)) {
        return logger?.error(`Supplied path does not exists. Path: ${filePath}`);
    } else {
        config = JSON.parse(readFileSync(filePath, 'utf8'));
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