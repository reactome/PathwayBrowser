import { TestBed } from '@angular/core/testing';

import { LottieService } from './lottie.service';

describe('LottieService', () => {
  let service: LottieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LottieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
