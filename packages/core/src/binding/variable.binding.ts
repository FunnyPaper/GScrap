import { z } from "zod";
import { Pin } from "../action/pin.action.js";
import { GScrapParseContext } from "../context/gscrap-parse.context.js";
import { CommonBindingScheme } from "./common.binding.js";

export const VariableBindingScheme = z.intersection(
    z.strictObject({
        type: z.literal('variable'),
        /**
         * Name of the variable.
         */
        data: z.string()
    }),
    CommonBindingScheme
)

/**
 * Binding with variable-like semantics.
 */
export type VariableBinding = z.infer<typeof VariableBindingScheme>;

export function parseVariableBinding(binding: VariableBinding, context: GScrapParseContext): Pin {
    const pin: Pin | undefined = context.getPin(binding.data);
    
    if(!pin) {
        throw new Error(`Variable binding error. There's no pin for: ${binding.data}.`);
    }

    return pin;
}