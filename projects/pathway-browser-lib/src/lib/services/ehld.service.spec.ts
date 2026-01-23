import { TestBed } from '@angular/core/testing';

import { EhldService } from './ehld.service';

describe('EhldService', () => {
  let service: EhldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EhldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
