import { Selector } from "./Selector";

/**
 * CSS Selector descriptor.
 */
export class CSSSelector extends Selector {
    protected _generatePath(ancestor?: HTMLElement): string {
        const pathElements: string[] = [];

        for(let element of this.getUniversalComponents()) {
            // Composing name
            let pathFragmentName = element.nodeName;
            if(element.id) {
                pathFragmentName += `#${element.id}`;
            }

            if(element.classList.length > 0) {
                pathFragmentName += `.${Array.prototype.join.call(element.classList, '.')}`;
            }
            
            const children: HTMLCollection | HTMLElement[] = element.parentNode?.children ?? [];
            const childrenOfType: typeof children = Array.prototype.filter.call(children, el => el.tagName == element.tagName);
            const index: number = Array.prototype.indexOf.call(childrenOfType, element);
            if(index > 0 && element != ancestor) {
                pathFragmentName += `:nth-of-type(${index + 1})`;
            }

            pathElements.unshift(pathFragmentName);
        }

        return pathElements.join(' > ');
    }
}