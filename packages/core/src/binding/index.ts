import { Pin } from "../action/pin.action.js";
import { GScrapParseContext } from "../context/gscrap-parse.context.js";
import { parseVariableBinding } from "./variable.binding.js";
import { Binding } from "../action/schemas.js";

export function parseBinding(binding: Binding, context: GScrapParseContext): Pin {
    switch(binding.type) {
        case "variable": return parseVariableBinding(binding, context);
        default: throw new Error(`[[${binding.type}]] binding type is not supported.`);
    }
}