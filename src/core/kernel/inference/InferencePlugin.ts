import { InferenceContext, InferenceHypothesis } from '../../types';

export interface InferencePlugin {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  
  /**
   * Executes the plugin against the immutable InferenceContext.
   * Returns an array of hypotheses. Must not mutate context.
   */
  execute(context: InferenceContext): Promise<InferenceHypothesis[]>;
}
