import EventEmitter from "node:events";
import { Writable } from "node:stream";
import { createLogger, Logger } from "winston";
import { transports } from "winston";
import { GScrapConfig } from "../config/index.js";
import { GScrapParseContext } from "../context/gscrap-parse.context.js";
import { parseAction } from "../action/index.js";
import { withBrowser, withPage } from "../utils/index.js";
import { Page } from "puppeteer";
import { GScrapRecord, IStore } from "../store/istore.js";
import { SQLiteStore } from "../store/sqlite.store.js";

const { Stream } = transports;

export const GScrapRunnerStatuses = {
    UNKNOWN: 'unknown',
    STARTED: 'started',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
} as const

export type GScrapRunnerStatus = typeof GScrapRunnerStatuses[keyof typeof GScrapRunnerStatuses];

export type GScrapRunnerEventMap = {
    statusChange: [{ status: GScrapRunnerStatus }],
    log: [{ type: 'info' | 'warn' | 'error', message: string }],
    resultUpdate: [{ data: object }]
}

class GScrapRunnerStore extends SQLiteStore {
    private _runner: GScrapRunner;
    
    public constructor(runner: GScrapRunner, ...superParams: ConstructorParameters<typeof SQLiteStore>) {
        super(...superParams);
        this._runner = runner;
    }

    public override insert(record: GScrapRecord): void {
        super.insert(record);
        this._runner.emit('resultUpdate', { data: record });
    }
}

export class GScrapRunner extends EventEmitter<GScrapRunnerEventMap> {
    private _status: GScrapRunnerStatus = GScrapRunnerStatuses.UNKNOWN;
    private readonly _logger: Logger;
    private readonly _config: GScrapConfig;
    private readonly _parseContext: GScrapParseContext;
    private readonly _store: IStore;
    private _run!: Promise<void>;
    
    public constructor(config: GScrapConfig, sessionId: string, appDir: string) {
        super();

        this._config = config;
        this._store = new GScrapRunnerStore(this, sessionId, appDir);
        this._parseContext = new GScrapParseContext({ store: this._store });
        this._logger = createLogger({
            level: 'info',
            transports: [
                new Stream({ 
                    stream: new Writable({
                        objectMode: true,
                        write: (chunk, _, callback) => {
                            this.emit('log', { 
                                type: chunk.level, 
                                message: chunk.message 
                            })
                            callback();
                        }
                    }) 
                })
            ]
        });
    }
    
    public get data(): GScrapRecord[] {
        return this._store.getAll();
    }

    public async run() {
        this.emit('statusChange', { status: GScrapRunnerStatuses.STARTED })
        this._logger.info("Welcome to GScrap!");
        this._logger.info("Launching new browser...");
    
        try {
            this._run = withBrowser(async (browser) => {
                this._logger.info("Browser launched!");
                this._logger.info("Launching new page...");

                await withPage(browser, async (page: Page) => {
                    this._logger.info(`Page launched! Changing location to '${this._config.startingPage}' ...`);
                    await page.setViewport({   
                        width: Math.floor(1024 + Math.random() * 100),
                        height: Math.floor(768 + Math.random() * 100), 
                    });
        
                    await page.goto(this._config.startingPage, { waitUntil: ['networkidle2', 'domcontentloaded', 'load'] });
            
                    this._logger?.info(`'${this._config.startingPage}' has been set successfully as a current location!`);
                    this._logger?.info('Browsing modules...');
            
                    for(const action of this._config.actions) {
                        const shouldStop = await parseAction({ page, action, context: this._parseContext, logger: this._logger });
                        if (shouldStop) break;
                    }
                }, this._logger);
                
                if(this._parseContext.cancelled) {
                    this.emit('statusChange', { status: GScrapRunnerStatuses.CANCELLED });
                } else {
                    this.emit('statusChange', { status: GScrapRunnerStatuses.COMPLETED })
                }
            });

            await this._run;
        } catch(e) {
            this.emit('log', { type: 'error', message: `Error occured during evaluation: ${e}` })
            this.emit('statusChange', { status: GScrapRunnerStatuses.FAILED })
        }
    }
    public async cancel() {
        this._parseContext.cancelled = true;
        await this._run;
    }
}