/**
 * Common type for bindings. Bindings are useless pieces of information by themselves.
 */
export type CommonBinding = {
  /**
   * Type of the binding
   */
  type: unknown,
  /**
   * Data associated with the binding type
   */
  data: unknown
}