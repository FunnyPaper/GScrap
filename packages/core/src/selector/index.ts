import { Selector } from "./Selector.js";
import { CSSSelector } from "./CSSSelector.js";
import { XPathSelector } from "./XPathSelector.js";

export { Selector, CSSSelector, XPathSelector }

type SelectorType = 'CSS' | 'XPath'
type SelectorFunctionMap = { [K in SelectorType]: (target: HTMLElement) => Selector }

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