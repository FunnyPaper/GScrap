import { z } from "zod";

export const CommonActionScheme = z.strictObject({
    /**
     * Type of an action. Acts as a discriminator for dispatching concrete instructions.
     */
    type: z.unknown(),
    /**
     * Human readable name for the action that might be used as a display
     */
    name: z.string().optional(),
    /**
     * Human readable description of the action that might be used as a display
     */
    description: z.string().optional(),
    /**
     * Optional delay to execute this action.
     */
    delay: z.number().optional()
})

/**
 * Common Action type. Contains bare minimum shared with all Action types.
 */
export type CommonAction = z.infer<typeof CommonActionScheme>;