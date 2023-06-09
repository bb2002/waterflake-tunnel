import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TunnelModule } from './components/tunnel/tunnel.module';
import { PipeManagerModule } from './components/pipe-manager/pipe-manager.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      load: [configuration],
    }),
    TunnelModule,
    PipeManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
