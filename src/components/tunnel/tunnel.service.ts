import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Tunnel } from './types/Tunnel';
import getAxios from '../../common/axios/getAxios';
import { TunnelNotFoundException } from './exceptions/TunnelNotFound.exception';
import LoadTunnelDto from './dto/LoadTunnel.dto';
import ProxyServerManager from '../server/ProxyServerManager';

@Injectable()
export class TunnelService {
  async loadTunnel(loadServerDto: LoadTunnelDto) {
    const { clientId } = loadServerDto;

    const tunnel = await this.getTunnelByClientId(clientId);

    const proxyServerManager = ProxyServerManager.getInstance();
    return proxyServerManager.getOrCreateProxyServer(tunnel);
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

  async getRunningProxyServers() {
    const proxyServerManager = ProxyServerManager.getInstance();
    return proxyServerManager.getProxyServers();
  }
}
