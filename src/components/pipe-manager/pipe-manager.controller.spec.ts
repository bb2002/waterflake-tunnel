import { Test, TestingModule } from '@nestjs/testing';
import { PipeManagerController } from './pipe-manager.controller';

describe('PipeManagerController', () => {
  let controller: PipeManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipeManagerController],
    }).compile();

    controller = module.get<PipeManagerController>(PipeManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
