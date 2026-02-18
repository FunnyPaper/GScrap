import { Pin, ActionSelector } from "../action/pin.action";
import { GScrapParseContextVisitor } from "./gscrap-parse.context.visitor";

/**
 * Data storage working as a part of parsing process.
 */
export class GScrapParseContext {
    private _pins: Map<string, Pin>;
    private _data: { [key: string]: string | null }
    private _parent?: GScrapParseContext
    private _children?: GScrapParseContext[]

    public constructor(config?: {
        parent?: GScrapParseContext
    }) {
        this._pins = new Map();
        this._data = {};
        this._parent = config?.parent;
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

    copy(): GScrapParseContext {
        const child = new GScrapParseContext({ parent: this });

        (this._children ??= []).push(child);

        return child;
    }

    setPin(name: string, pin: Pin): void 
    setPin(name: string, selector: ActionSelector): void
    setPin(name: string, binding: ActionSelector | Pin): void {
        if(binding instanceof Pin) {
            this._pins.set(name, binding);    
        } else {
            this._pins.set(name, new Pin(binding));
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

    visit(visitor: GScrapParseContextVisitor, context: object = {}) {
        visitor.visit(this, context);
    }
}