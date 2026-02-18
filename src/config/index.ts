import { Action } from "../action"

/**
 * GScrap configuration schema
 */
export type GScrapConfig = {
    /**
     * Starting url used to feed the webscrapper
     */
    startingPage: string,
    /**
     * List of modules to invoke in order
     */
    actions: Action[],
    /**
     * Sets delay for all actions to be the same
     */
    globalDelay?: number,
    /**
     * Should action lists be processed if error is thrown.
     * Setting this to true will skip further actions and proceed to context loss recovery if applicable (module level)
     */
    skipActionsOnError?: boolean,
    /**
     * Output path for scrapped data
     */
    outputPath?: string
}