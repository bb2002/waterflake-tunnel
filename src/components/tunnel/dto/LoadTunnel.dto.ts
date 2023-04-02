import { IsString } from 'class-validator';

export default class LoadTunnelDto {
  @IsString()
  clientId: string;
}
