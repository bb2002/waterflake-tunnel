import { Module } from '@nestjs/common';
import { TunnelService } from './tunnel.service';
import { TunnelController } from './tunnel.controller';
import { ProxyServerModule } from '../proxy-server/proxy-server.module';
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  controllers: [TunnelController],
  providers: [TunnelService],
  exports: [TunnelService],
  imports: [ProxyServerModule, ScheduleModule.forRoot()],
})
export class TunnelModule {}
