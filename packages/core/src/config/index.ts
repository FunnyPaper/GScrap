import { z } from "zod";
import { ActionScheme } from "../action/index.js";

export const GScrapConfigScheme = z.strictObject({
    /**
     * Starting url used to feed the webscrapper
     */
    startingPage: z.string(),
    /**
     * List of modules to invoke in order
     */
    actions: z.array(ActionScheme),
    /**
     * Sets delay for all actions to be the same
     */
    globalDelay: z.number().optional(),
    /**
     * Should action lists be processed if error is thrown.
     * Setting this to true will skip further actions and proceed to context loss recovery if applicable (module level)
     */
    skipActionsOnError: z.boolean().optional(),
    /**
     * Output path for scrapped data
     */
    outputPath: z.string().optional()
})

/**
 * GScrap configuration schema
 */
export type GScrapConfig = z.infer<typeof GScrapConfigScheme>;
