import { Version } from '@chatr/kernel';

export class ManifestBuilder<T> {
  protected _id: string = '';
  protected _name: string = '';
  protected _version: Version = { major: 1, minor: 0, patch: 0 };
  
  public id(val: string): this {
    this._id = val;
    return this;
  }
  
  public name(val: string): this {
    this._name = val;
    return this;
  }
  
  public version(major: number, minor: number, patch: number): this {
    this._version = { major, minor, patch };
    return this;
  }
}
