import { Module } from '@nestjs/common';
import { ProxyServerService } from './proxy-server.service';

@Module({
  providers: [ProxyServerService],
  exports: [ProxyServerService],
})
export class ProxyServerModule {}
