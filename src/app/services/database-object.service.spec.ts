import { TestBed } from '@angular/core/testing';

import { DatabaseObjectService } from './database-object.service';

describe('DatabaseObjectService', () => {
  let service: DatabaseObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
