#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as Package from "../package.json";
import { greet } from '.';

const argv = yargs(hideBin(process.argv))
    .scriptName(Package.name)
    .version(Package.version)
    .alias("v", "version")
    .help("h")
    .alias("h", "help")
    .option("n", {
        string: true,
        alias: "name",
        default: "lam"
    })
    .argv

async function main() {
    const { n } = await argv;
    console.log(`GScrap CLI - ${Package.version}`);
    const helloStr = greet(n);
    console.log(helloStr);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
})