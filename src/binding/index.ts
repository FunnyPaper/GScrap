import { z } from "zod";
import { Pin } from "../action/pin.action";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { parseVariableBinding, VariableBindingScheme } from "./variable.binding";

export const BindingScheme = VariableBindingScheme

/**
 * Supported binding type union
 */
export type Binding = z.infer<typeof BindingScheme>;

export function parseBinding(binding: Binding, context: GScrapParseContext): Pin {
    switch(binding.type) {
        case "variable": return parseVariableBinding(binding, context);
        default: throw new Error(`[[${binding.type}]] binding type is not supported.`);
    }
}