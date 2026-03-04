import { GScrapRecord, IStore } from "../store/istore";
import { GScrapParseContext } from "./gscrap-parse.context";

/**
 * Simple accumulator - uses visitor pattern for getting all data scraped so far.
 */
export class GScrapParseContextVisitor {
    private _data: object[] = []
    private _store: IStore;
    
    public constructor(store: IStore) {
        this._store = store;
    }

    public get data(): object[] {
        return this._data;
    }

    visit(target: GScrapParseContext, context: object) {
        if(!target.children || target.children.length == 0) {
            const data = { ...context, ...target.data };

            if (Object.keys(data).length > 0) {
                this._data.push(data);
            }
        } else {
            target.children?.forEach(child => this.visit(child, {...context, ...target.data }));
        }

        // Clear data to not clutter memory so much
        this._store.insertMany(this._data as GScrapRecord[])
        target.clearData();
    }
}