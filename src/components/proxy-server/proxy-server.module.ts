import { Module } from '@nestjs/common';
import { ProxyServerService } from './proxy-server.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  providers: [ProxyServerService],
  exports: [ProxyServerService],
  imports: [ScheduleModule.forRoot()],
})
export class ProxyServerModule {}
