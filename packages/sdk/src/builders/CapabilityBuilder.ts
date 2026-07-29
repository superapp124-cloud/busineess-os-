import { CapabilityManifest, CapabilityStatus, Publisher, Permission, ActionDefinition, CapabilityDependency, Version } from '@chatr/kernel';
import { ManifestBuilder } from './ManifestBuilder';

export class CapabilityBuilder extends ManifestBuilder<CapabilityManifest> {
  private _minimumKernelVersion: Version = { major: 1, minor: 0, patch: 0 };
  private _publisher: Publisher = { id: '', name: '', verified: false };
  private _status: CapabilityStatus = 'EXPERIMENTAL';
  private _permissions: Permission[] = [];
  private _actions: ActionDefinition[] = [];
  private _dependencies: CapabilityDependency[] = [];

  public minimumKernelVersion(major: number, minor: number, patch: number): this {
    this._minimumKernelVersion = { major, minor, patch };
    return this;
  }

  public publisher(id: string, name: string): this {
    this._publisher = { id, name, verified: false };
    return this;
  }
  
  public status(val: CapabilityStatus): this {
    this._status = val;
    return this;
  }

  public addPermission(permission: Permission): this {
    this._permissions.push(permission);
    return this;
  }

  public addAction(action: ActionDefinition): this {
    this._actions.push(action);
    return this;
  }
  
  public addDependency(dep: CapabilityDependency): this {
    this._dependencies.push(dep);
    return this;
  }

  public build(): CapabilityManifest {
    return {
      id: this._id || this._name,
      name: this._name,
      version: this._version,
      minimumKernelVersion: this._minimumKernelVersion,
      publisher: this._publisher,
      status: this._status,
      permissions: this._permissions,
      actions: this._actions,
      dependencies: this._dependencies
    };
  }
}
