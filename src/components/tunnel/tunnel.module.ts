import { Module } from '@nestjs/common';
import { TunnelService } from './tunnel.service';
import { TunnelController } from './tunnel.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PipeManagerModule } from '../pipe-manager/pipe-manager.module';

@Module({
  controllers: [TunnelController],
  providers: [TunnelService],
  exports: [TunnelService],
  imports: [PipeManagerModule, ScheduleModule.forRoot()],
})
export class TunnelModule {}
