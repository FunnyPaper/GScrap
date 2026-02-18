import { Binding } from "../binding"
import { CommonAction } from "./common.action"

/**
 * Action with binding semantics. It has the ability to utilize variables.
 */
export type BoundAction = {
    binding: Binding
} & CommonAction