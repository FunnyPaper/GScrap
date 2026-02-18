import { Pin } from "../action/pin.action";
import { GScrapParseContext } from "../context/gscrap-parse.context";
import { CommonBinding } from "./common.binding"

/**
 * Binding with variable-like semantics.
 */
export type VariableBinding = {
    type: 'variable',
    /**
     * Name of the variable.
     */
    data: string
} & CommonBinding

export function parseVariableBinding(binding: VariableBinding, context: GScrapParseContext): Pin {
    const pin: Pin | undefined = context.getPin(binding.data);
    
    if(!pin) {
        throw new Error(`Variable binding error. There's no pin for: ${binding.data}.`);
    }

    return pin;
}