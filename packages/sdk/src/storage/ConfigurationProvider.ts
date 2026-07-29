import { JsonValue } from '@chatr/kernel';

export interface ConfigurationProvider {
  getConfig(key: string): Promise<JsonValue | null>;
  getConfigString(key: string, defaultValue?: string): Promise<string>;
  getConfigNumber(key: string, defaultValue?: number): Promise<number>;
  getConfigBoolean(key: string, defaultValue?: boolean): Promise<boolean>;
}
