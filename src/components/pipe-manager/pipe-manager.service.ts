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
    const server = new PipeServer(tunnel);
    await server.startUp({
      onConnected: this.authenticate(tunnel),
      onDataReceived: this.onInServerDataTransfer(tunnel),
      onError: this.onServerError,
    });
    this.pipeServer.set(tunnel._id, server);
    return server;
  }

  deletePipeServer(tunnelId: number) {
    this.pipeServer.delete(tunnelId);
  }

  private authenticate = (tunnel: Tunnel) => (socket: Socket) => {
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
  };

  private onInServerDataTransfer = (tunnel: Tunnel) => (data: any[]) => {
    // 전송된 데이터 크기를 기록
    const size = data.length;
    if (tunnel._id in this.transferredPacketSizes) {
      const obj = this.transferredPacketSizes.get(tunnel._id);
      this.transferredPacketSizes.set(tunnel._id, size + obj);
    } else {
      this.transferredPacketSizes.set(tunnel._id, size);
    }
  };

  private onServerError = (error: Error) => {
    this.logger.error(error);
  };

  getRunningPipeServer(tunnelId: number) {
    return this.pipeServer.get(tunnelId);
  }

  getRunningPipeServers() {
    return [...this.pipeServer.values()];
  }

  @Cron('5 0,10,20,30,40,50 * * * *')
  private async sendTrafficStatistics() {
    const tunnelIDs = [...this.transferredPacketSizes.keys()];
    const now = new Date();

    const data = tunnelIDs.map((tunnelId) => {
      const tunnel = this.getRunningPipeServer(tunnelId);
      const transferredPacketSize = this.transferredPacketSizes.get(tunnelId);
      return {
        tunnelClientId: tunnel.getTunnel.clientId,
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
