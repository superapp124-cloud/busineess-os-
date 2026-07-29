import { Identifier } from '../common';

export interface Publisher extends Identifier {
  name: string;
  verified: boolean;
  contactEmail?: string;
  website?: string;
}
