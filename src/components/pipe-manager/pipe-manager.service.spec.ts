import { Test, TestingModule } from '@nestjs/testing';
import { PipeManagerService } from './pipe-manager.service';

describe('PipeManagerService', () => {
  let service: PipeManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipeManagerService],
    }).compile();

    service = module.get<PipeManagerService>(PipeManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
