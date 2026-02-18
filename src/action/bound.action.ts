import { z } from "zod"
import { BindingScheme } from "../binding"
import { CommonActionScheme } from "./common.action"

export const BoundActionScheme = z.intersection(
    z.strictObject({
        binding: BindingScheme
    }),
    CommonActionScheme
); 

/**
 * Action with binding semantics. It has the ability to utilize variables.
 */
export type BoundAction = z.infer<typeof BoundActionScheme>
