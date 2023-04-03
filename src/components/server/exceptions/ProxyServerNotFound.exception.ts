import { NotFoundException } from '@nestjs/common';

export default class ProxyServerNotFoundException extends NotFoundException {
  constructor() {
    super('ProxyServer not found.');
  }
}
