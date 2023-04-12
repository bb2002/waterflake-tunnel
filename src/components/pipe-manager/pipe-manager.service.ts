import { Injectable, Logger } from '@nestjs/common';
import { Tunnel } from '../tunnel/types/Tunnel';
import { Socket } from 'net';
import PipeServer from './pipe-server/PipeServer';
import { Cron } from '@nestjs/schedule';
import { format } from 'date-fns';
import getAxios from '../../common/axios/getAxios';

@Injectable()
export class PipeManagerService {
  private pipeServer: Map<number, PipeServer> = new Map();
  private transferredPacketSizes: Map<number, number> = new Map();
  private readonly logger = new Logger(PipeManagerService.name);

  async createPipeServer(tunnel: Tunnel) {
    const server = new PipeServer(tunnel, this);
    await server.startUp();
    this.pipeServer.set(tunnel._id, server);
    return server;
  }

  getRunningPipeServer(tunnelId: number) {
    return this.pipeServer.get(tunnelId);
  }

  getRunningPipeServers() {
    return [...this.pipeServer.values()];
  }

  async authenticate(tunnel: Tunnel, socket: Socket) {
    return new Promise<void>((resolve, reject) => {
      const handler = setTimeout(() => {
        reject(new Error('Login time out.'));
      }, 3000);

      socket.addListener('data', (data: any[]) => {
        try {
          const auth = JSON.parse(String(data));
          if (!auth?.clientId || !auth?.clientSecret) {
            reject(new Error('Authentication data not found.'));
            return;
          }

          const { clientId, clientSecret } = auth;
          if (
            clientId === tunnel.clientId &&
            clientSecret === tunnel.clientSecret
          ) {
            clearTimeout(handler);
            socket.removeAllListeners();
            resolve();
          } else {
            reject(new Error('Authentication failed.'));
          }
        } catch (ex) {}
      });
    });
  }

  appendTransferredPacketSize(tunnelId: number, size: number) {
    if (tunnelId in this.transferredPacketSizes) {
      const obj = this.transferredPacketSizes.get(tunnelId);
      this.transferredPacketSizes.set(tunnelId, size + obj);
    } else {
      this.transferredPacketSizes.set(tunnelId, size);
    }
  }

  loggingSocketError(error: Error) {
    this.logger.error(error);
  }

  @Cron('5 0,10,20,30,40,50 * * * *')
  private async sendTrafficStatistics() {
    const servers = this.getRunningPipeServers();
    const now = new Date();

    const data = servers.map((proxyServer) => {
      const tunnel = proxyServer.getTunnel;
      const transferredPacketSize = this.transferredPacketSizes.get(tunnel._id);
      return {
        tunnelClientId: tunnel.clientId,
        value: transferredPacketSize,
        reportDate: format(now, 'yyyy-MM-dd HH:mm:00'),
      };
    });

    // 초기화 및 데이터 전송
    this.transferredPacketSizes = new Map();
    await getAxios().post('/statistics/traffic', data);
  }

  @Cron('10 0,10,20,30,40,50 * * * *')
  private async sendConnectionStatistics() {
    const proxyServers = this.getRunningPipeServers();
    const now = new Date();

    const data = proxyServers.map((proxyServer) => {
      const tunnel = proxyServer.getTunnel;
      const connectionCount = proxyServer.idleInServerConnectionCount;
      return {
        tunnelClientId: tunnel.clientId,
        value: connectionCount,
        reportDate: format(now, 'yyyy-MM-dd HH:mm:00'),
      };
    });

    await getAxios().post('/statistics/connection', data);
  }
}
