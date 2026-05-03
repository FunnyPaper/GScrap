import { z } from "zod";
import { BindingScheme } from "../binding/index.js";
import { CommonActionScheme } from "./common.action.js";

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
