import { Intent } from './Intent';
import { ExecutionContext } from '../execution/ExecutionContext';

export interface IntentClassifier {
  classify(input: string, context: ExecutionContext): Promise<Intent>;
}
