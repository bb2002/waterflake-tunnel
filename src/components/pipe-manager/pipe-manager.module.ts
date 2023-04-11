import { Module } from '@nestjs/common';
import { PipeManagerController } from './pipe-manager.controller';
import { PipeManagerService } from './pipe-manager.service';

@Module({
  controllers: [PipeManagerController],
  providers: [PipeManagerService]
})
export class PipeManagerModule {}
