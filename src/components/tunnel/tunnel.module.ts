import { Module } from '@nestjs/common';
import { TunnelService } from './tunnel.service';
import { TunnelController } from './tunnel.controller';
import { ProxyServerModule } from '../proxy-server/proxy-server.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PipeManagerModule } from '../pipe-manager/pipe-manager.module';

@Module({
  controllers: [TunnelController],
  providers: [TunnelService],
  exports: [TunnelService],
  imports: [ProxyServerModule, PipeManagerModule, ScheduleModule.forRoot()],
})
export class TunnelModule {}
