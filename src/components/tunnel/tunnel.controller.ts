import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import LoadTunnelDto from './dto/LoadTunnel.dto';
import { RegionAccessTokenGuard } from '../../common/guards/region-access-token.guard';
import { TunnelService } from './tunnel.service';
import { PipeManagerService } from '../pipe-manager/pipe-manager.service';

@Controller('server')
export class TunnelController {
  constructor(
    private readonly tunnelService: TunnelService,
    private readonly pipeManagerService: PipeManagerService,
  ) {}

  @UseGuards(RegionAccessTokenGuard)
  @Post('load')
  async loadServer(@Body() loadTunnelDto: LoadTunnelDto) {
    return (await this.tunnelService.loadTunnel(loadTunnelDto)).getTunnel;
  }

  @UseGuards(RegionAccessTokenGuard)
  @Delete('/shutdown/:clientId')
  async shutdownServer(@Param('clientId') clientId) {
    return this.tunnelService.shutdownTunnel(clientId);
  }

  @UseGuards(RegionAccessTokenGuard)
  @Get('/')
  async getRunningServers() {
    return this.pipeManagerService
      .getRunningPipeServers()
      .map((server) => server.getTunnel);
  }
}
