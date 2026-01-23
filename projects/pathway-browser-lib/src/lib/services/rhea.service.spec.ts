import { TestBed } from '@angular/core/testing';

import { RheaService } from './rhea.service';

describe('RheaService', () => {
  let service: RheaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RheaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
