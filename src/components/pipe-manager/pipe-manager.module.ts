import { Module } from '@nestjs/common';
import { PipeManagerService } from './pipe-manager.service';

@Module({
  providers: [PipeManagerService],
  exports: [PipeManagerService],
})
export class PipeManagerModule {}
