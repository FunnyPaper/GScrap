/**
 * Abstract interface for describing HTMLElement selectors
 */
export abstract class Selector {
    protected _path?: string;
    protected _generalizedPath?: string;
    
    public constructor(public readonly target: HTMLElement) {}
    
    /**
     * Generates either generalized or non generalized selector based on configuration
     * @param {boolean} [config.generalizeTo=] Generalizes a path to specific ancestor
     * @returns Path to element in string
     */
    public getPath(config?: { 
        generalizeTo?: HTMLElement 
    }): string {
        return config?.generalizeTo
            ? this._generalizedPath ??= this._generatePath(config?.generalizeTo)
            : this._path ??= this._generatePath();
    }

    protected abstract _generatePath(ancestor?: HTMLElement): string;

    public *getUniversalComponents(): Generator<HTMLElement> {
        for(
            let element: HTMLElement = this.target; 
            element.tagName; 
            element = <HTMLElement>element.parentNode
        ) {
            yield element;
        }
    } 
}
