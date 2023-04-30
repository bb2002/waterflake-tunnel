import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Tunnel } from './types/Tunnel';
import getAxios from '../../common/axios/getAxios';
import { TunnelNotFoundException } from './exceptions/TunnelNotFound.exception';
import LoadTunnelDto from './dto/LoadTunnel.dto';
import { Timeout } from '@nestjs/schedule';
import { PipeManagerService } from '../pipe-manager/pipe-manager.service';
import PipeServer from '../pipe-manager/pipe-server/PipeServer';

@Injectable()
export class TunnelService {
  private readonly logger = new Logger(TunnelService.name);

  constructor(private readonly pipeManagerService: PipeManagerService) {}

  async loadTunnel(loadServerDto: LoadTunnelDto): Promise<PipeServer> {
    const { clientId } = loadServerDto;
    const tunnel = await this.getTunnelByClientId(clientId);

    const pipeServer = this.pipeManagerService.getRunningPipeServer(tunnel._id);
    if (!pipeServer) {
      return this.pipeManagerService.createPipeServer(tunnel);
    }

    return pipeServer;
  }

  async shutdownTunnel(clientId: string) {
    const tunnel = await this.getTunnelByClientId(clientId);

    const pipeServer = this.pipeManagerService.getRunningPipeServer(tunnel._id);
    if (pipeServer) {
      await pipeServer.shutdown();
    }
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

  async getAllTunnels(): Promise<Tunnel[]> {
    const response = await getAxios().get(`/regions/tunnels`);

    switch (response.status) {
      case HttpStatus.OK:
        return response.data as Tunnel[];
      default:
        throw new InternalServerErrorException('Unexpected response status');
    }
  }

  @Timeout(500)
  async loadAllTunnels() {
    const tunnels = await this.getAllTunnels();

    await Promise.all(
      tunnels.map((tunnel) => this.loadTunnel({ clientId: tunnel.clientId })),
    );

    this.logger.log(`Loaded ${tunnels.length} tunnels`);
  }
}
