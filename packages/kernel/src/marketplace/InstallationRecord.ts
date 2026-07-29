import { Identifier, Timestamp, Version } from '../common';

export interface InstallationRecord extends Identifier {
  marketplaceEntryId: string;
  installedVersion: Version;
  installedAt: Timestamp;
  autoUpdate: boolean;
}
