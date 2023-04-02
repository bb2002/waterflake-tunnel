import { User } from '../../../common/types/User';
import { Plan } from '../../../common/types/Plan';
import { Region } from '../../../common/types/Region';

export interface Tunnel {
  _id: number;
  name: string;
  subDomain: string;
  rootDomain: string;
  clientId: string;
  clientSecret: string;
  inPort: number;
  outPort: number;
  DNSRecordId: string;
  createdAt: string;
  owner: User;
  plan: Plan;
  region: Region;
}
