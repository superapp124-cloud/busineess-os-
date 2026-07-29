export interface PackageKind {
  id: string;
  displayName: string;
  schema: unknown;
  validator: (manifest: unknown) => boolean;
}
