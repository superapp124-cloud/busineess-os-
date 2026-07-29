import { ConnectorManifest, AuthenticationType, Permission, ActionId, RateLimit, RetryPolicy } from '@chatr/kernel';
import { ManifestBuilder } from './ManifestBuilder';

export class ConnectorBuilder extends ManifestBuilder<ConnectorManifest> {
  private _authentication: AuthenticationType = 'NONE';
  private _provides: ActionId[] = [];
  private _permissions: Permission[] = [];
  private _rateLimit?: RateLimit;
  private _retryPolicy?: RetryPolicy;

  public authentication(val: AuthenticationType): this {
    this._authentication = val;
    return this;
  }

  public provides(actionId: ActionId): this {
    this._provides.push(actionId);
    return this;
  }
  
  public addPermission(permission: Permission): this {
    this._permissions.push(permission);
    return this;
  }

  public build(): ConnectorManifest {
    return {
      id: this._id || this._name,
      name: this._name,
      version: this._version,
      authentication: this._authentication,
      provides: this._provides,
      permissions: this._permissions,
      rateLimit: this._rateLimit,
      retryPolicy: this._retryPolicy
    };
  }
}
