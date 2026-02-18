import { Selector } from "./Selector";

/**
 * XPath Selector descriptor.
 */
export class XPathSelector extends Selector {
    public _generatePath(ancestor?: HTMLElement): string {
        const pathElements: string[] = [];

        for(let element of this.getUniversalComponents()) {
            const children: HTMLCollection | HTMLElement[] = element.parentNode?.children ?? [];
            const childrenOfType: typeof children = Array.prototype.filter.call(children, el => el.tagName == element.tagName);
            const index: number = Array.prototype.indexOf.call(childrenOfType, element);
            
            // Composing name
            let pathFragmentName = element.nodeName;
            if(index > 0 && element != ancestor) {
                pathFragmentName += `[${index + 1}]`;
            }
            
            pathElements.unshift(pathFragmentName);
        }

        return '//' + pathElements.join('/');
    }
}