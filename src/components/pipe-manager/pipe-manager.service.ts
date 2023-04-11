import { Injectable, Logger } from '@nestjs/common';
import { Tunnel } from '../tunnel/types/Tunnel';
import { Socket } from 'net';
import PipeServer from './pipe-server/PipeServer';

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
}
