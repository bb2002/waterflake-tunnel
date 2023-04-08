import { Module } from '@nestjs/common';
import { TunnelService } from './tunnel.service';
import { TunnelController } from './tunnel.controller';
import { ProxyServerModule } from '../proxy-server/proxy-server.module';

@Module({
  controllers: [TunnelController],
  providers: [TunnelService],
  exports: [TunnelService],
  imports: [ProxyServerModule],
})
export class TunnelModule {}
