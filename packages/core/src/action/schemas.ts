import { z } from 'zod';

/**
 * Marks selected element to be clicked. Used to perform side effects.
 */

export type ClickAction = z.infer<typeof ClickActionScheme>;
export const CommonActionScheme = z.strictObject({
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
    delay: z.number().optional(),
});

export const CommonBindingScheme = z.strictObject({
    /**
     * Type of the binding
     */
    type: z.unknown(),
    /**
     * Data associated with the binding type
     */
    data: z.unknown(),
});
/**
 * Common type for bindings. Bindings are useless pieces of information by themselves.
 */

export type CommonBinding = z.infer<typeof CommonBindingScheme>;
export const VariableBindingScheme = CommonBindingScheme.extend({
    type: z.literal('variable'),
    /**
     * Name of the variable.
     */
    data: z.string(),
});
/**
 * Binding with variable-like semantics.
 */

export type VariableBinding = z.infer<typeof VariableBindingScheme>;
export const BindingScheme = VariableBindingScheme;
/**
 * Supported binding type union
 */

export type Binding = z.infer<typeof BindingScheme>;

export const BoundActionScheme = CommonActionScheme.extend({
    binding: BindingScheme,
});

export const AutoScrollActionScheme = BoundActionScheme.extend({
    type: z.literal('autoScroll'),
    /**
     * Actions to execute in order.
     */
    actions: z.array(z.lazy(() => ActionScheme)),
    /**
     * How many times the scroll should be performed
     */
    count: z.union([z.number(), z.literal('limitless')]),
});

/**
 * Action with binding semantics. It has the ability to utilize variables.
 */

export type BoundAction = z.infer<typeof BoundActionScheme>;
export const ClickActionScheme = BoundActionScheme.extend({
    type: z.literal('click'),
});

/**
 * Common Action type. Contains bare minimum shared with all Action types.
 */

export type CommonAction = z.infer<typeof CommonActionScheme>;
export const EvaluateActionScheme = BoundActionScheme.extend({
    type: z.literal('evaluate'),
    /**
     * Alias used for human readable output.
     * If not specified application will try to use id, full class name or whole selector.
     */
    elementAlias: z.string().optional(),
});
/**
 * Marks selected element to be evaluated and its value should be obtained.
 * The target property or properties depends on the type of element itself and is determined at runtime -
 * It can point to input's value field, img's src field, etc.
 */

export type EvaluateAction = z.infer<typeof EvaluateActionScheme>;
export const ExportActionScheme = CommonActionScheme.extend({
    type: z.literal('export'),
    /**
     * File to export data into
     */
    filename: z.string(),
});
/**
 * Exports store data into json file
 */

export type ExportAction = z.infer<typeof ExportActionScheme>;
export const BooleanFormActionScheme = BoundActionScheme.extend({
    type: z.literal('fill'),
    fillType: z.literal('boolean'),
    data: z.boolean(),
});
/**
 * Marks selected element to be host for fill event. Fill value is of type boolean.
 */

export type BooleanFormAction = z.infer<typeof BooleanFormActionScheme>;

export const StringFormActionScheme = BoundActionScheme.extend({
    type: z.literal('fill'),
    fillType: z.literal('string'),
    data: z.string(),
});
/**
 * Marks selected element to be host for fill event. Fill value is of type string.
 */

export type StringFormAction = z.infer<typeof StringFormActionScheme>;

export const NumberFormActionScheme = BoundActionScheme.extend({
    type: z.literal('fill'),
    fillType: z.literal('number'),
    data: z.number(),
});
/**
 * Marks selected element to be host for fill event. Fill value is of type number.
 */

export type NumberFormAction = z.infer<typeof NumberFormActionScheme>;

export const FillActionScheme = z.discriminatedUnion('fillType', [
    BooleanFormActionScheme,
    StringFormActionScheme,
    NumberFormActionScheme,
]);
/**
 * Marks selected element to be a host for fill event. Used to fill form fields.
 */

export type FillAction = z.infer<typeof FillActionScheme>;
export const ForeachActionScheme = BoundActionScheme.extend({
    type: z.literal('foreach'),
    /**
     * Actions to execute in order.
     */
    actions: z.array(z.lazy(() => ActionScheme)),
    /**
     * Name of the variable created in scope.
     */
    scopedVariable: z.string(),
});

export const GoBackActionScheme = CommonActionScheme.extend({
    type: z.literal('goBack'),
});
/**
 * Action requesting the history change (going to the previous record)
 */

export type GoBackAction = z.infer<typeof GoBackActionScheme>;
export const GoForwardActionScheme = CommonActionScheme.extend({
    type: z.literal('goForward'),
});
/**
 * Action requesting the history change (going to the next record if exists)
 */

export type GoForwardAction = z.infer<typeof GoForwardActionScheme>;
export const GoToActionScheme = CommonActionScheme.extend({
    type: z.literal('goTo'),
    /**
     * Adress used in navigation change process.
     */
    url: z.string(),
});
/**
 * Action requesting the history change (sudden navigation change).
 */

export type GoToAction = z.infer<typeof GoToActionScheme>;
export const PaginateActionScheme = BoundActionScheme.extend({
    type: z.literal('paginate'),
    /**
     * Actions to execute in order.
     */
    actions: z.array(z.lazy(() => ActionScheme)),
});

export const ActionSelectorScheme = z.strictObject({
    /**
     * Specifies path in string.
     */
    path: z.string(),
    /**
     * Type of path stored in path property.
     */
    type: z.union([z.literal('CSS'), z.literal('XPath')]),
    /**
     * Should program stop it's execution if no selectors have been found?
     * Determines if following actions should be processed or control flow should return to first parent group action.
     */
    optional: z.boolean().optional(),
    /**
     * How many elements should be matched. Defaults to all.
     */
    count: z.union([z.number(), z.literal('all')]).optional(),
    /**
     * What strategy should be used when multiple elements have been matched. Defaults to cache
     */
    mode: z.union([z.literal('cache'), z.literal('requery')]).optional(),
    /**
     * How many times the search for selector should be retried. Defaults to 3
     */
    retries: z.number().optional(),
});
/**
 * Selector descriptor - defines how the selector should be parsed.
 */

export type ActionSelector = z.infer<typeof ActionSelectorScheme>;

export const PinActionScheme = CommonActionScheme.extend({
    type: z.literal('pin'),
    selector: ActionSelectorScheme,
    variable: z.string(),
});

export type PinAction = z.infer<typeof PinActionScheme>;
export const ProcessUrlActionScheme = CommonActionScheme.extend({
    type: z.literal('processUrl'),
    /**
     * Actions to execute in order.
     */
    actions: z.array(z.lazy(() => ActionScheme)),
    /**
     * Stage storage name to retrieve urls from
     */
    group: z.string(),
});

export const RefreshActionScheme = CommonActionScheme.extend({
    type: z.literal('refresh'),
});
/**
 * Action with refresh page semantics. It reloads the current page.
 */

export type RefreshAction = z.infer<typeof RefreshActionScheme>;
export const SaveActionScheme = CommonActionScheme.extend({
    type: z.literal('save'),
});
/**
 * Saves the latest changes in the parsing context to the file
 */

export type SaveAction = z.infer<typeof SaveActionScheme>;
export const ScrollActionScheme = BoundActionScheme.extend({
    type: z.literal('scroll'),
    /**
     * How much should the host be scrolled along X and Y axis.
     */
    scrollBy: z.strictObject({
        x: z.number(),
        y: z.number(),
    }),
});
/**
 * Marks selected element to be a host for scrolling. Used to perform side effects.
 */

export type ScrollAction = z.infer<typeof ScrollActionScheme>;
export const StageUrlActionScheme = BoundActionScheme.extend({
    type: z.literal('stageUrl'),
    /**
     * Stage storage name to store the urls
     */
    group: z.string(),
});

export type StageUrlAction = z.infer<typeof StageUrlActionScheme>;

/**
 * Action with foreach-like semantics.
 * Binds to variable and creates a scoped variable with given name.
 */

export type ForeachAction = BoundAction & {
    type: 'foreach';
    actions: Action[];
    scopedVariable: string;
};

/**
 * Action with paginate-like semantics.
 * Executes actions in order.
 * Loops until specified variable is no longer reachable.
 */

export type PaginateAction = BoundAction & {
    type: 'paginate';
    actions: Action[];
};

/**
 * Action with autoscroll-like semantics.
 * Executes actions in order.
 * Loops until specified variable is no longer reachable or until scroll is performed "count" amount of times
 */

export type AutoScrollAction = BoundAction & {
    type: 'autoScroll';
    actions: Action[];
    count: number | 'limitless';
};

/**
 * Action processing stored url groups with a group of actions.
 * Executes actions in order.
 * Loops until specified variable is no longer reachable.
 */

export type ProcessUrlAction = CommonAction & {
    type: 'processUrl';
    actions: Action[];
    group: string;
};

/**
 * Marks element to be a subject of an Action.
 */

export type Action =
    | EvaluateAction
    | ClickAction
    | FillAction
    | ScrollAction
    | ForeachAction
    | PaginateAction
    | AutoScrollAction
    | GoBackAction
    | SaveAction
    | GoForwardAction
    | RefreshAction
    | GoToAction
    | PinAction
    | StageUrlAction
    | ProcessUrlAction
    | ExportAction;

export const ActionScheme: z.ZodType<Action> = z.lazy(() =>
    z.union([
        EvaluateActionScheme,
        ClickActionScheme,
        ScrollActionScheme,
        ForeachActionScheme,
        PaginateActionScheme,
        AutoScrollActionScheme,
        GoBackActionScheme,
        SaveActionScheme,
        GoForwardActionScheme,
        RefreshActionScheme,
        GoToActionScheme,
        PinActionScheme,
        StageUrlActionScheme,
        ProcessUrlActionScheme,
        ExportActionScheme,
        BooleanFormActionScheme,
        StringFormActionScheme,
        NumberFormActionScheme
    ]));