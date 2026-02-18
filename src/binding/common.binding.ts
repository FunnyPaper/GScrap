import  { z } from "zod"

export const CommonBindingScheme = z.strictObject({
    /**
     * Type of the binding
     */
    type: z.unknown(),
    /**
     * Data associated with the binding type
     */
    data: z.unknown()
}) 

/**
 * Common type for bindings. Bindings are useless pieces of information by themselves.
 */
export type CommonBinding = z.infer<typeof CommonBindingScheme>
