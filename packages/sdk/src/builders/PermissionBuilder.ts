import { Permission } from '@chatr/kernel';

export class PermissionBuilder {
  private _resource: string = '*';
  private _action: string = '*';
  private _conditions?: Record<string, unknown>;

  public resource(val: string): this {
    this._resource = val;
    return this;
  }

  public action(val: string): this {
    this._action = val;
    return this;
  }

  public condition(key: string, value: unknown): this {
    if (!this._conditions) {
      this._conditions = {};
    }
    this._conditions[key] = value;
    return this;
  }

  public build(): Permission {
    return {
      resource: this._resource,
      action: this._action,
      conditions: this._conditions
    };
  }
}
