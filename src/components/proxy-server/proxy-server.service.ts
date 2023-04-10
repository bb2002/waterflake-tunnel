import { Injectable } from '@nestjs/common';
import ProxyServer from './ProxyServer';
import { Tunnel } from '../tunnel/types/Tunnel';

@Injectable()
export class ProxyServerService {
  private proxyServers: Map<number, ProxyServer> = new Map();
  private transferredPacketSizes: Map<number, number> = new Map();

  async createProxyServer(tunnel: Tunnel) {
    const proxyServer = new ProxyServer(tunnel, this);
    await proxyServer.bootstrap();

    this.proxyServers.set(tunnel._id, proxyServer);
    return proxyServer;
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
    console.error('ProxyServerError:', tunnel, error);
  }
}
