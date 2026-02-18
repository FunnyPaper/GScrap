import { GScrapParseContext } from "./gscrap-parse.context";

/**
 * Simple accumulator - uses visitor pattern for getting all data scraped so far.
 */
export class GScrapParseContextVisitor {
    private _data: object[] = []
    public get data(): object[] {
        return this._data;
    }

    visit(target: GScrapParseContext, context: object) {
        if(!target.children || target.children.length == 0) {
            this._data.push({...context, ...target.data});
        } else {
            target.children?.forEach(child => this.visit(child, {...context, ...target.data }));
        }
    }
}