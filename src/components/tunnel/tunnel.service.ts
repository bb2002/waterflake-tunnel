import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Tunnel } from './types/Tunnel';
import getAxios from '../../common/axios/getAxios';
import { TunnelNotFoundException } from './exceptions/TunnelNotFound.exception';
import LoadTunnelDto from './dto/LoadTunnel.dto';
import { ProxyServerService } from '../proxy-server/proxy-server.service';

@Injectable()
export class TunnelService {
  constructor(private readonly proxyServerService: ProxyServerService) {}

  async loadTunnel(loadServerDto: LoadTunnelDto) {
    const { clientId } = loadServerDto;

    const tunnel = await this.getTunnelByClientId(clientId);

    const proxyServer = this.proxyServerService.getProxyServer(tunnel._id);
    if (proxyServer) {
      return proxyServer;
    }

    return this.proxyServerService.createProxyServer(tunnel);
  }

  async getTunnelByClientId(clientId: string): Promise<Tunnel> {
    const response = await getAxios().get(`/regions/tunnel/${clientId}`);

    switch (response.status) {
      case HttpStatus.OK:
        return response.data as Tunnel;
      case HttpStatus.NOT_FOUND:
        throw new TunnelNotFoundException();
      default:
        throw new InternalServerErrorException('Unexpected response status');
    }
  }

  async getAllTunnels(): Promise<Tunnel> {}

  getRunningProxyServers() {
    return this.proxyServerService.getAllProxyServers();
  }
}
