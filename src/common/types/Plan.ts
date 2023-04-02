export interface Plan {
  _id: number;
  name: string;
  price: number;
  maxSpeed: number;
  minDomainLength: number;
  isSupportCustomDomain: boolean;
  isEnabled: boolean;
}
