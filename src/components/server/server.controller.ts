import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import { ServerService } from './server.service';
import LoadServerDto from './dto/LoadServer.dto';
import {AccessTokenGuard} from "../../common/guards/access-token.guard";

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @UseGuards(AccessTokenGuard)
  @Post('load')
  async loadServer(@Body() loadServerDto: LoadServerDto) {}
}
