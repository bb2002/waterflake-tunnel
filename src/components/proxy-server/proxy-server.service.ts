import { Injectable, Logger } from '@nestjs/common';
import ProxyServer from './ProxyServer';
import { Tunnel } from '../tunnel/types/Tunnel';
import { Cron } from '@nestjs/schedule';
import { format } from 'date-fns';
import getAxios from '../../common/axios/getAxios';

@Injectable()
export class ProxyServerService {
  private proxyServers: Map<number, ProxyServer> = new Map();
  private transferredPacketSizes: Map<number, number> = new Map();
  private readonly logger = new Logger(ProxyServerService.name);

  async createProxyServer(tunnel: Tunnel) {
    const proxyServer = new ProxyServer(tunnel, this);
    await proxyServer.bootstrap();

    this.proxyServers.set(tunnel._id, proxyServer);
    return proxyServer;
  }

  async onCommand() {

  }

  getProxyServer(tunnelId: number) {
    return this.proxyServers.get(tunnelId);
  }

  getAllProxyServers() {
    return [...this.proxyServers.values()];
  }

  async onPacketTransferred(tunnel: Tunnel, packetSize: number) {
    const { _id } = tunnel;

    if (tunnel._id in this.transferredPacketSizes) {
      const obj = this.transferredPacketSizes.get(_id);
      this.transferredPacketSizes.set(_id, packetSize + obj);
    } else {
      this.transferredPacketSizes.set(_id, packetSize);
    }
  }

  async onProxyServerError(tunnel: Tunnel, error: Error) {
    this.logger.error('ProxyServerError:', tunnel, error);
  }

  @Cron('5 0,10,20,30,40,50 * * * *')
  async sendTrafficStatistics() {
    const proxyServers = this.getAllProxyServers();
    const now = new Date();

    const data = proxyServers.map((proxyServer) => {
      const tunnel = proxyServer.getTunnel();
      const transferredPacketSize = this.transferredPacketSizes.get(tunnel._id);
      return {
        tunnelClientId: tunnel.clientId,
        value: transferredPacketSize,
        reportDate: format(now, 'yyyy-MM-dd HH:mm:00'),
      };
    });

    await getAxios().post('/statistics/traffic', data);
  }

  @Cron('10 0,10,20,30,40,50 * * * *')
  async sendConnectionStatistics() {
    const proxyServers = this.getAllProxyServers();
    const now = new Date();

    const data = proxyServers.map((proxyServer) => {
      const tunnel = proxyServer.getTunnel();
      const connectionCount = proxyServer.getIdleConnectionCount();
      return {
        tunnelClientId: tunnel.clientId,
        value: connectionCount,
        reportDate: format(now, 'yyyy-MM-dd HH:mm:00'),
      };
    });

    await getAxios().post('/statistics/connection', data);
  }
}
