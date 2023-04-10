import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import LoadTunnelDto from './dto/LoadTunnel.dto';
import { RegionAccessTokenGuard } from '../../common/guards/region-access-token.guard';
import { TunnelService } from './tunnel.service';

@Controller('server')
export class TunnelController {
  constructor(private readonly tunnelService: TunnelService) {}

  @UseGuards(RegionAccessTokenGuard)
  @Post('load')
  async loadServer(@Body() loadTunnelDto: LoadTunnelDto) {
    return (await this.tunnelService.loadTunnel(loadTunnelDto)).getTunnel();
  }

  @UseGuards(RegionAccessTokenGuard)
  @Get('/')
  async getRunningServers() {
    return this.tunnelService
      .getRunningProxyServers()
      .map((server) => server.getTunnel());
  }
}
