import { TestBed } from '@angular/core/testing';

import { ReacfoamService } from './reacfoam.service';

describe('ReacfoamService', () => {
  let service: ReacfoamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReacfoamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
