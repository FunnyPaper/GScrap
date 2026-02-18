import { CSSSelector } from "./CSSSelector";
import { XPathSelector } from "./XPathSelector";

type SelectorType = 'CSS' | 'XPath'
type SelectorFunctionMap = { [K in SelectorType]: (target: HTMLElement) => Selector }

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

const selectorMapping: SelectorFunctionMap = {
    'CSS': (target: HTMLElement) => new CSSSelector(target),
    'XPath': (target: HTMLElement) => new XPathSelector(target)
}

/**
 * Compute selector for given target of given selector type 
 * @param {HTMLElement} config.target - Target selector for whom the seector is to be computed
 * @param {SelectorType} [config.type='CSS'] - Type of selector to be computed
 * @returns {String} Computed selector
 */
export function getSelector(
    config: { 
        target: HTMLElement, 
        type?: SelectorType 
    }
): Selector {
    // Default params
    config.type ??= 'CSS';

    // Destructure
    const { target, type } = config;

    return selectorMapping[type](target);
}
