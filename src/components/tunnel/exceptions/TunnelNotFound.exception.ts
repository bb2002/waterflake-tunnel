import { NotFoundException } from '@nestjs/common';

export class TunnelNotFoundException extends NotFoundException {
  constructor() {
    super('Tunnel not found');
  }
}
