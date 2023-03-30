import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ServerService } from './server.service';
import LoadServerDto from './dto/LoadServer.dto';
import { RegionAccessTokenGuard } from '../../common/guards/region-access-token.guard';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @UseGuards(RegionAccessTokenGuard)
  @Post('load')
  async loadServer(@Body() loadServerDto: LoadServerDto) {}
}
