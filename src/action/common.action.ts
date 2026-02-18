/**
 * Common Action type. Contains bare minimum shared with all Action types.
 */
export type CommonAction = {
    /**
     * Type of an action. Acts as a discriminator for dispatching concrete instructions.
     */
    type: unknown,
    /**
     * Human readable name for the action that might be used as a display
     */
    name?: string,
    /**
     * Human readable description of the action that might be used as a display
     */
    description?: string,
    /**
     * Optional delay to execute this action.
     */
    delay?: number
}