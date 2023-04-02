import ProxyServer from './ProxyServer';
import { Tunnel } from '../tunnel/types/Tunnel';

class ProxyServerManager {
  private static instance?: ProxyServerManager;
  private proxyServers: ProxyServer[];

  private constructor() {
    this.proxyServers = [];
  }

  public static getInstance(): ProxyServerManager {
    if (!ProxyServerManager.instance) {
      ProxyServerManager.instance = new ProxyServerManager();
    }

    return ProxyServerManager.instance;
  }

  public getProxyServers(): ProxyServer[] {
    return this.proxyServers;
  }

  public async getOrCreateProxyServer(tunnel: Tunnel): Promise<ProxyServer> {
    const filterResult = this.proxyServers.filter(
      (proxyServer) =>
        proxyServer.getTunnel().inPort === tunnel.inPort ||
        proxyServer.getOutPort() === tunnel.outPort,
    );

    if (filterResult.length > 0) {
      return filterResult[0];
    }

    const newProxyServer = new ProxyServer(tunnel);
    await newProxyServer.bootstrap();
    this.proxyServers.push(newProxyServer);

    return newProxyServer;
  }
}

export default ProxyServerManager;
