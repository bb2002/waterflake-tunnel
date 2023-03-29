import { IsString } from 'class-validator';

export default class LoadServerDto {
  @IsString()
  clientId: string;
}
