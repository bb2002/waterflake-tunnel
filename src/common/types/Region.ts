export interface Region {
  _id: number;
  name: string;
  accessToken: string;
  startPortRange: number;
  endPortRange: number;
  SRVTarget: string;
  apiEndPoint: string;
}
