import { Logger } from "winston";
import { Pin, ActionSelector } from "../action/pin.action.js";
import { GScrapParseContextVisitor } from "./gscrap-parse.context.visitor.js";
import { IStore } from "../store/istore.js";

/**
 * Data storage working as a part of parsing process.
 */
export class GScrapParseContext {
    private _pins: Map<string, Pin>;
    private _data: { [key: string]: string | null }
    private _parent?: GScrapParseContext
    private _children?: GScrapParseContext[]
    private _stagedUrls: Map<string, string[]>;
    public cancelled: boolean;

    private _store: IStore;

    public constructor(config: {
        parent?: GScrapParseContext,
        stagedUrls?: Map<string, string[]>,
        cancelled?: boolean,
        store: IStore
    }) {
        this._pins = new Map();
        this._data = {};
        this._stagedUrls ??= new Map();
        this.cancelled ??= false;

        this._parent = config.parent;
        this._store = config.store;
    }

    public get data(): { [key: string]: string | null } {
        return this._data;
    }

    public get parent(): GScrapParseContext | undefined {
        return this._parent;
    }

    public get children(): GScrapParseContext[] | undefined {
        return this._children;
    }

    public get root(): GScrapParseContext {
        let root: GScrapParseContext = this;
        while(root.parent) {
            root = root.parent;
        }

        return root;
    }

    public get store(): IStore {
        return this._store;
    }

    clearData() {
        this._data = {};
    }

    copy(): GScrapParseContext {
        const child = new GScrapParseContext({ 
            parent: this,
            stagedUrls: this._stagedUrls,
            cancelled: this.cancelled,
            store: this._store
        });

        (this._children ??= []).push(child);

        return child;
    }

    setPin(name: string, pin: Pin): void 
    setPin(name: string, selector: ActionSelector, logger?: Logger): void
    setPin(name: string, binding: ActionSelector | Pin, logger?: Logger): void {
        if(binding instanceof Pin) {
            this._pins.set(name, binding);    
        } else {
            this._pins.set(name, new Pin(binding, logger));
        }
    }

    getPin(name: string): Pin | undefined {
        for(let current: GScrapParseContext | undefined = this; current; current = this.parent) {
            const pin: Pin | undefined = current._pins.get(name);
            if(pin) {
                return pin;
            }
        }
    }

    stageUrls(group: string, hrefs: string[]) {
        if(!this._stagedUrls.has(group)) {
            this._stagedUrls.set(group, []);
        }

        const staged = this._stagedUrls.get(group)!;
        const distinct = new Set([...staged, ...hrefs]);
        this._stagedUrls.set(group, [...distinct])
    }

    getUrls(group: string) {
        return this._stagedUrls.get(group) ?? [];
    }

    visit(visitor: GScrapParseContextVisitor, context: object = {}) {
        visitor.visit(this, context);
    }
}