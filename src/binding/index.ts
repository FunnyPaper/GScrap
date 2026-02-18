import { Pin } from "../action/pin.action";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { parseVariableBinding, VariableBinding } from "./variable.binding";

/**
 * Supported binding type union
 */
export type Binding = VariableBinding

export function parseBinding(binding: Binding, context: GScrapParseContext): Pin {
    switch(binding.type) {
        case "variable": return parseVariableBinding(binding, context);
        default: throw new Error(`[[${binding.type}]] binding type is not supported.`);
    }
}