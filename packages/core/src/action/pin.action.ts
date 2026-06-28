import { ElementHandle, Page } from "puppeteer";
import { ActionSelector, PinAction } from "./schemas.js";
import { countElements, getElement, getElements } from "../utils/parse.utils.js";
import { ActionParseConfig } from "./index.js";
import { Logger } from "winston";

export class Pin {
    public readonly selector: ActionSelector;
    private readonly logger?: Logger;

    public constructor(selector: ActionSelector, logger?: Logger) {
        this.selector = selector;
        this.logger = logger;
    }

    public async use(config: {
        page: Page,
        task: (handle: ElementHandle) => Promise<void>
    }): Promise<void> {
        const { page, task } = config;

        for (let i: number = 0, errors: number = 0; errors < 3; errors++) {
            try {
                for await (let handle of this.generate(page, i)) {
                    await task(handle);
                    i++
                }

                break;
            } catch {
                continue;
            }
        }
    }

    private async *generate(page: Page, index: number) {
        if (this.selector.mode == 'requery') {
            for (
                let i: number = index, handle: ElementHandle | null = await getElement(page, this.selector, i, this.logger);
                handle;
                i++, handle = await getElement(page, this.selector, i, this.logger)
            ) {
                yield handle;
            }
        } else {
            const handles = await getElements(page, this.selector, this.logger);

            for (let i: number = index; handles && handles[i]; i++) {
                yield handles[i];
            }
        }
    }

    public async count(page: Page): Promise<number> {
        return countElements(page, this.selector, this.logger);
    }

    public at(index: number): Pin {
        const selector: ActionSelector = { ...this.selector };

        if (selector.type == 'CSS') {
            selector.path = `${selector.path}:nth-of-type(${index + 1})`;
        } else if (selector.type == 'XPath') {
            selector.path = `(${selector.path})[${index + 1}]`;
        }

        return new Pin(selector);
    }
}

export async function parsePinAction({ page, action, context, logger }: ActionParseConfig<PinAction>): Promise<boolean> {
    context.setPin(action.variable, action.selector, logger);
    return context.cancelled;
}