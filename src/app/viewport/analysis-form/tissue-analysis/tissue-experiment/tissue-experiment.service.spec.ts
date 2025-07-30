import { TestBed } from '@angular/core/testing';

import { TissueExperimentService } from './tissue-experiment.service';

describe('TissueExperimentService', () => {
  let service: TissueExperimentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TissueExperimentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
